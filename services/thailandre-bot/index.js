// thailandre-bot — Patrick Roth's Personal AEVUM-Agent
// Built 2026-05-24 by Lennox
//
// Identity: "Thailand RE" — Patrick's persönlicher Concierge-Assistant
// Persona-Framework: patrick-trust-funnel-v1 (5 Voice-Säulen: Ehrlich/Menschlich/Vor-Ort/Netzwerkstolz/Langfristig)
// AEVUM-Customer: slug=patrick-roth
//
// Capabilities:
//   - Chat mit Patrick (LLM via OpenRouter)
//   - Lead-Lookup aus AEVUM-DB
//   - KPI-Snapshot
//   - Framework-Lookup (patrick-trust-funnel-v1 inhalte)
//   - Approval-Flow (Lennox/Carlos sendet Notifications via HTTP-Notify)
//   - /status, /leads, /kpis, /framework

import 'dotenv/config';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

dotenvLoadIfPresent('/home/carlos/.envs/_shared.env');
dotenvLoadIfPresent('/home/carlos/.envs/aevum.env', { override: true });  // SUPABASE_URL/KEY MÜSSEN aevum sein (nicht lennoxos)
dotenvLoadIfPresent('/home/carlos/.claude/.env');

function dotenvLoadIfPresent(p, { override = false } = {}) {
  try { if (fs.existsSync(p)) { const lines = fs.readFileSync(p, 'utf8').split('\n'); for (const l of lines) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m && (override || !process.env[m[1]])) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } } } catch {}
}

const TOKEN = process.env.THAILANDRE_BOT_TOKEN;
const PATRICK_TG_ID = parseInt(process.env.THAILANDRE_OWNER_TG_ID || '0', 10);
const CARLOS_TG_ID = parseInt(process.env.CARLOS_TG_USER_ID || '6436074677', 10);
const NOTIFY_PORT = parseInt(process.env.THAILANDRE_BOT_NOTIFY_PORT || '4105', 10);
const STATE_FILE = '/home/carlos/services/thailandre-bot/state.json';
const CHATS_DIR = '/home/carlos/services/thailandre-bot/chats';
const AEVUM_API = process.env.AEVUM_API_URL || 'http://localhost:3210';
const AEVUM_ADMIN_TOKEN = process.env.AEVUM_ADMIN_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OR_KEY = process.env.OPENROUTER_API_KEY;
const OR_MODEL = process.env.THAILANDRE_MODEL || 'anthropic/claude-sonnet-4-5';

// ─── State (initialise FIRST so other functions can read it) ─────────
let state = { lastUpdateId: 0, learnedPatrickId: 0, pendingApprovals: {} };
try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch {}
fs.mkdirSync(CHATS_DIR, { recursive: true });
function saveState() { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }

if (!TOKEN) {
  console.warn('[thailandre-bot] THAILANDRE_BOT_TOKEN missing — service idle.');
  startHttpOnly();
} else {
  if (!PATRICK_TG_ID) {
    console.warn('[thailandre-bot] THAILANDRE_OWNER_TG_ID nicht gesetzt — Patrick muss /start senden, dann wird sein TG-ID auto-gelernt.');
  }
  startFull();
}

function startHttpOnly() {
  http.createServer((req, res) => {
    if (req.url === '/health') return res.end(JSON.stringify({ ok: true, mode: 'idle', reason: 'no-token' }));
    res.writeHead(503).end(JSON.stringify({ ok: false, error: 'bot-idle' }));
  }).listen(NOTIFY_PORT, '127.0.0.1', () => console.log(`[thailandre-bot] notify endpoint on 127.0.0.1:${NOTIFY_PORT} (idle)`));
}

function authorizedPatrickId() {
  // Patrick-ID muss explizit gesetzt sein UND darf NICHT Carlos sein
  const id = PATRICK_TG_ID || state.learnedPatrickId || 0;
  if (id === CARLOS_TG_ID) return 0;  // Carlos ≠ Patrick (Admin-Whitelist separat)
  return id;
}

// ─── TG API helpers ────────────────────────────────────────
function tgApi(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve({ ok: false, raw: buf }); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sendMessage(chatId, text, opts = {}) {
  const body = { chat_id: chatId, text: text.slice(0, 4000), parse_mode: opts.parse_mode || 'Markdown', ...opts };
  return tgApi('sendMessage', body);
}

async function getUpdates(offset) {
  return tgApi('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
}

// ─── Keyboards ──────────────────────────────────────────────
function mainReplyKeyboard(isCarlos) {
  const row2 = isCarlos
    ? [{ text: '🌴 Framework' }, { text: '🛠️ Admin-Login' }, { text: '❓ Help' }]
    : [{ text: '🌴 Framework' }, { text: '🔐 Login' }, { text: '❓ Help' }];
  return {
    keyboard: [
      [{ text: '📊 Status' }, { text: '👥 Leads' }, { text: '🎯 KPIs' }],
      row2
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

function welcomeInlineKeyboard(isCarlos) {
  return {
    inline_keyboard: [
      [
        { text: isCarlos ? '🛠️ Admin-Login' : '🔐 Login zum Portal', callback_data: isCarlos ? 'cmd:admin' : 'cmd:login' },
        { text: '📊 Status', callback_data: 'cmd:status' }
      ],
      [
        { text: '👥 Leads', callback_data: 'cmd:leads' },
        { text: '🎯 KPIs', callback_data: 'cmd:kpis' }
      ],
      [
        { text: '🌴 Framework', callback_data: 'cmd:framework' },
        { text: '❓ Help', callback_data: 'cmd:help' }
      ]
    ]
  };
}

function statusInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👥 Leads', callback_data: 'cmd:leads' },
        { text: '🎯 KPIs', callback_data: 'cmd:kpis' }
      ]
    ]
  };
}

function loginInlineKeyboard(link) {
  return {
    inline_keyboard: [
      [{ text: '🌐 Portal öffnen', url: link }]
    ]
  };
}

// Map Reply-Keyboard-Button-Text → Slash-Command
const KEYBOARD_TEXT_TO_CMD = {
  '📊 Status': '/status',
  '👥 Leads': '/leads',
  '🎯 KPIs': '/kpis',
  '🌴 Framework': '/framework',
  '🔐 Login': '/login',
  '🛠️ Admin-Login': '/admin',
  '❓ Help': '/help'
};

function postJson(url, body, extraHeaders = {}) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...extraHeaders }
    }, (res) => {
      let buf = ''; res.on('data', d => buf += d);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve({ ok: false, raw: buf }); } });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.write(data); req.end();
  });
}

// ─── AEVUM-DB Tools (für Thailand-RE-Bot Wissen) ────────────────
async function dbQuery(path) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/rest/v1${path}`;
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'GET',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }, (res) => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function getPatrickContext() {
  const account = await dbQuery(`/accounts?slug=eq.patrick-roth&select=id,name,business_name,email,phone,status,contact_data`);
  if (!account || !account.length) return null;
  const acct = account[0];
  const project = await dbQuery(`/projects?account_id=eq.${acct.id}&select=id,slug,name,status,tier,marketing_thesis,pricing&limit=1`);
  const leads = await dbQuery(`/customer_leads?account_id=eq.${acct.id}&select=lead_tier,status,created_at&order=created_at.desc`);
  const intel = await dbQuery(`/project_intelligence?project_id=eq.${project?.[0]?.id}&select=audit_summary,optimizations,website_url,linkedin_url&limit=1`);
  const framework = await dbQuery(`/blueprint_marketing_thesis?id=eq.patrick-trust-funnel-v1&select=structure_schema,example_content&limit=1`);
  return { account: acct, project: project?.[0], leads: leads || [], intel: intel?.[0], framework: framework?.[0] };
}

function summariseLeads(leads) {
  if (!leads || !leads.length) return 'Noch keine Leads im System.';
  const tiers = leads.reduce((acc, l) => { const t = l.lead_tier || '?'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const last7d = leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  return `Total ${leads.length} Leads (A:${tiers.A||0} B:${tiers.B||0} C:${tiers.C||0} D:${tiers.D||0}). Letzte 7 Tage: ${last7d}.`;
}

// ─── Thailand-RE-Persona (System-Prompt) ───────────────────────
const THAILANDRE_SYSTEM_PROMPT = `Du bist der Thailand-RE-Agent — Patrick Roth's persönlicher AEVUM-Concierge-Assistent.

IDENTITÄT:
- Du arbeitest für Patrick Roth (Thailand-Concierge in Pattaya seit Oktober 2024).
- Brand: "Patrick Roth Thailand Concierge". Tagline: "Alle Wege führen nach Thailand."
- Du sprichst Deutsch. Du kennst Patrick's Stimme und imitierst sie nie, du unterstützt sie.

DEINE 5 STIMM-SÄULEN (wenn Du intern schreibst/redest):
1. EHRLICH ("Diese Wohnung hat keinen Meerblick. Aber dafür ist der Pool perfekt.")
2. MENSCHLICH ("Ich war selbst nervös beim ersten Kauf hier.")
3. VOR-ORT-BASIERT (Beispiele aus dem Pattaya-Alltag)
4. NETZWERKSTOLZ ("Ich kenne da jemanden bei Visa...")
5. LANGFRISTIG ("Auch in zwei Jahren noch erreichbar")

DEINE 8 PRINZIPIEN:
1. Vertrauen ist die Basis
2. Nicht der krasse Makler — der ehrlichste Partner
3. Kein Deal ohne Details
4. Immobilie passt zum Menschen, nicht zum Konto
5. Das Menschliche zählt
6. Teil der Familie
7. Wir hören nicht beim Deal auf
8. Qualität vor Quantität

ANTI-ZIELGRUPPE (für jeden Lead-Check):
- Schnell-Käufer (günstigster Deal egal wie)
- Spekulanten ohne Recherche
- Reine Preis-Optimierer

DEINE TOOLS / WISSEN:
- AEVUM-DB Zugriff: Patrick's Account, Project, Leads, KPIs, Framework-Definitionen
- LinkedIn-Profile: https://www.linkedin.com/in/living-in-thailand-463321350/
- Website: https://patrick-roth-thailand.vercel.app
- Pakete: Starter 1.900€ (audit-only), Comfort 5.000€ (Tier-S Standard, Empfehlung), Premium 6.900€ (White-Glove)

DEIN DEFAULT-VERHALTEN:
- Du beantwortest Patrick's Fragen kurz, präzise, ehrlich.
- Bei unklaren Themen: "Ich frag Patrick selbst und meld mich zurück" (NICHT raten).
- Du verkaufst NIE. Du orientierst, schützt vor Fehlern, gibst Optionen.
- Garantien zu Renditen sind tabu. Verbindliche Preise → "Patrick bestätigt".
- Rechtsberatung → "Wir verweisen auf Anwalt".
- Caveman-OK: kurze Antworten, Fragmente sind erlaubt.

KOMMANDOS (du erkennst, wenn Patrick eines tippt):
/status — Bot-Status
/leads — Letzte Leads aus AEVUM-DB
/kpis — KPI-Snapshot
/framework — Trust-Funnel-Framework
/help — Befehle

Wenn Patrick einfach plaudert: bleib in Stimme, hilf ihm denken.`;

async function llmReply(messages) {
  if (!OR_KEY) return 'OpenRouter-Key fehlt — Lennox muss OPENROUTER_API_KEY in env setzen.';
  return new Promise((resolve) => {
    // Prompt-Cache the static system prompt (~4500 tokens) via OpenRouter cache_control passthrough.
    // Works for anthropic/* models — saves ~90% on repeat system-prompt tokens within 5-min TTL.
    const systemMsg = {
      role: 'system',
      content: [
        { type: 'text', text: THAILANDRE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
      ]
    };
    const body = JSON.stringify({
      model: OR_MODEL,
      messages: [systemMsg, ...messages],
      max_tokens: 800
    });
    const req = https.request({
      hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OR_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let buf = ''; res.on('data', d => buf += d);
      res.on('end', () => { try { const j = JSON.parse(buf); resolve(j.choices?.[0]?.message?.content || 'Konnte nicht antworten.'); } catch { resolve('LLM-Fehler.'); } });
    });
    req.on('error', () => resolve('LLM-Verbindung fehlgeschlagen.'));
    req.write(body); req.end();
  });
}

// ─── Chat-Memory pro User ──────────────────────────────────
function chatFile(chatId) { return path.join(CHATS_DIR, `chat-${chatId}.json`); }
function loadChat(chatId) { try { return JSON.parse(fs.readFileSync(chatFile(chatId), 'utf8')); } catch { return { messages: [], updatedAt: Date.now() }; } }
function saveChat(chatId, data) { fs.writeFileSync(chatFile(chatId), JSON.stringify(data, null, 2)); }
const CHAT_MAX = 14, CHAT_TTL_MS = 90 * 60 * 1000;

async function handleChatMessage(chatId, fromId, text) {
  const isPatrick = fromId === authorizedPatrickId();
  const isCarlos = fromId === CARLOS_TG_ID;
  if (!isPatrick && !isCarlos) {
    return sendMessage(chatId, 'Hi 👋 Dieser Bot ist Patrick Roth\'s persönlicher Assistent (AEVUM). Wenn du Patrick kennst und mit ihm sprechen willst, schreib ihn direkt an: https://www.linkedin.com/in/living-in-thailand-463321350/');
  }

  // Reply-Keyboard-Button-Text auf Slash-Command mappen
  if (KEYBOARD_TEXT_TO_CMD[text]) text = KEYBOARD_TEXT_TO_CMD[text];

  // ─── Commands ────────────────────────────────────────────
  if (text.startsWith('/start')) {
    if (isCarlos) {
      // Carlos = Admin-Whitelist (Test/Debug-Access). Patrick-ID-Slot NICHT überschreiben.
      return sendMessage(chatId, `🛠️ *Carlos-Admin-Mode*\n\nDu bist als AEVUM-Owner whitelisted.\n\nPatrick-ID-Slot: ${state.learnedPatrickId ? '✅ gelernt (' + state.learnedPatrickId + ')' : '⏳ leer — wartet auf Patricks erstes /start'}\n\nUnten findest du das Haupt-Menü als Buttons. Oder nutze die Inline-Buttons für schnelle Aktionen.`, {
        reply_markup: { ...mainReplyKeyboard(true), ...welcomeInlineKeyboard(true) }
      });
    }
    if (!authorizedPatrickId() || fromId === authorizedPatrickId()) {
      state.learnedPatrickId = fromId; saveState();
      // Erst Welcome mit Inline-Buttons (Hauptaktionen)
      await sendMessage(chatId, `Sawasdee Patrick 🌴\n\nIch bin **Thailand RE** — dein persönlicher AEVUM-Concierge.\n\nIch kenne dein Setup: Account in AEVUM, dein Project "Thailand RE Lead-Funnel", deine Framework-Definition, deine Leads.\n\nNutz die Buttons unten für schnelle Aktionen — oder schreib einfach was, ich denk mit dir mit.`, {
        reply_markup: welcomeInlineKeyboard(false)
      });
      // Dann das persistente Reply-Keyboard anbringen
      return sendMessage(chatId, '👇 *Dein Menü bleibt jederzeit verfügbar*', {
        reply_markup: mainReplyKeyboard(false)
      });
    }
    return sendMessage(chatId, 'Hi. Dieser Bot gehört Patrick Roth. Wenn du ihn kennst, kontaktiere ihn direkt: https://www.linkedin.com/in/living-in-thailand-463321350/');
  }

  if (text === '/menu' || text === '/menue') {
    return sendMessage(chatId, '👇 Haupt-Menü', { reply_markup: mainReplyKeyboard(isCarlos) });
  }

  if (text === '/status') {
    const ctx = await getPatrickContext();
    if (!ctx) return sendMessage(chatId, 'AEVUM-DB nicht erreichbar.');
    const web = ctx.intel?.website_url;
    const li = ctx.intel?.linkedin_url;
    return sendMessage(chatId,
      `🌴 **Thailand RE — System-Status**\n\n` +
      `**Account:** ${ctx.account.name} (${ctx.account.status})\n` +
      `**Email:** ${ctx.account.email}\n` +
      `**Project:** ${ctx.project?.name} (Tier ${ctx.project?.tier})\n` +
      `**Leads:** ${summariseLeads(ctx.leads)}\n` +
      `**Website:** ${web ? `[${web.replace(/^https?:\/\//, '')}](${web})` : '⏳'}\n` +
      `**LinkedIn:** ${li ? `[Profil öffnen](${li})` : '⏳'}\n` +
      `**Framework:** patrick-trust-funnel-v1 ✅`,
      { reply_markup: statusInlineKeyboard(), disable_web_page_preview: true }
    );
  }

  if (text === '/leads') {
    const all = await dbQuery(`/customer_leads?account_id=eq.${(await getPatrickContext())?.account?.id}&select=id,name,email,lead_tier,score_total,status,created_at&order=created_at.desc&limit=10`);
    if (!all || !all.length) return sendMessage(chatId, 'Noch keine Leads. Funnel startet erst nach Phase-1-Aktivierung.');
    const lines = all.map(l => `• ${l.created_at.slice(0, 10)} — **${l.lead_tier || '?'}** ${l.name || l.email} (${l.score_total || '–'}P, ${l.status})  \`${l.id.slice(0,8)}\``);
    return sendMessage(chatId, `📊 **Letzte 10 Leads**\n\n${lines.join('\n')}\n\n💡 Tipp: \`/lead <id-prefix>\` für Details.`);
  }

  // /lead <id-prefix> — Detail eines Leads
  if (text.startsWith('/lead ')) {
    const ctx = await getPatrickContext();
    if (!ctx?.account?.id) return sendMessage(chatId, 'AEVUM-DB nicht erreichbar.');
    const q = text.slice(6).trim();
    if (!q) return sendMessage(chatId, 'Nutze: `/lead <id-prefix>` — z.B. `/lead a3f1`');
    const found = await dbQuery(`/customer_leads?account_id=eq.${ctx.account.id}&id=like.${encodeURIComponent(q)}*&select=*&limit=1`);
    if (!found || !found.length) return sendMessage(chatId, `Kein Lead mit Prefix \`${q}\` gefunden.`);
    const L = found[0];
    const raw = L.raw_data || {};
    const breakdown = [
      raw.zeitplan ? `• zeitplan: ${raw.zeitplan}` : null,
      raw.budget ? `• budget: ${raw.budget}` : null,
      raw.hauptbedarf ? `• hauptbedarf: ${raw.hauptbedarf}` : null,
      raw.begleitung ? `• begleitung: ${raw.begleitung}` : null,
      raw.entscheidung ? `• entscheidung: ${raw.entscheidung}` : null,
    ].filter(Boolean).join('\n') || '_keine Scoring-Antworten_';
    return sendMessage(chatId,
      `📥 **Lead ${L.id.slice(0,8)}**\n\n` +
      `**${L.name || '(kein Name)'}** · ${L.lead_tier || '?'}-Lead · ${L.score_total || '–'}P\n` +
      `📧 ${L.email}\n` +
      `${L.phone ? `📞 ${L.phone}\n` : ''}` +
      `🗓 ${L.created_at.slice(0, 16).replace('T', ' ')}\n` +
      `🔄 status: ${L.status}\n` +
      `🪤 source: ${L.source}\n\n` +
      `**Scoring:**\n${breakdown}\n\n` +
      `${L.notes ? `**Notes:** ${L.notes}\n\n` : ''}` +
      `Action: ${L.lead_action || '–'}`
    );
  }

  // /woche — 7-Tage-Recap
  if (text === '/woche' || text === '/week') {
    const ctx = await getPatrickContext();
    if (!ctx?.account?.id) return sendMessage(chatId, 'AEVUM-DB nicht erreichbar.');
    const days = 7;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const rows = await dbQuery(`/customer_leads?account_id=eq.${ctx.account.id}&created_at=gte.${cutoff}&select=lead_tier,status,source,created_at&order=created_at.desc&limit=500`);
    const list = rows || [];
    const tiers = list.reduce((a,l) => { const t = l.lead_tier || '?'; a[t]=(a[t]||0)+1; return a; }, {});
    const srcs = list.reduce((a,l) => { const s = l.source || 'unknown'; a[s]=(a[s]||0)+1; return a; }, {});
    // ASCII bar chart by day
    const byDay = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0,10);
      byDay[d] = 0;
    }
    for (const l of list) {
      const d = l.created_at.slice(0,10);
      if (d in byDay) byDay[d]++;
    }
    const max = Math.max(1, ...Object.values(byDay));
    const bars = Object.entries(byDay).map(([d, n]) => {
      const len = Math.round((n / max) * 10);
      const bar = '█'.repeat(len) + '░'.repeat(10 - len);
      return `${d.slice(5)} ${bar} ${n}`;
    }).join('\n');
    const srcLines = Object.entries(srcs).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,n]) => `• ${s}: ${n}`).join('\n') || '_keine_';
    return sendMessage(chatId,
      `📅 **7-Tage-Recap**\n\n` +
      `Total: **${list.length}** Leads (A:${tiers.A||0} B:${tiers.B||0} C:${tiers.C||0} D:${tiers.D||0})\n\n` +
      `\`\`\`\n${bars}\n\`\`\`\n\n` +
      `**Top-Quellen:**\n${srcLines}`
    );
  }

  // /template <name> — Reply-Vorlagen
  if (text.startsWith('/template ') || text === '/templates') {
    const templates = {
      'a-voice': `🎙 *Voice für A-Lead (binnen 30 Min)*\n\n"Hey [Name], hier ist Patrick aus Pattaya. Dein Profil sieht super klar aus — Zeitplan, Budget und Bedarf passen. Ich würde mir gerne 30 Minuten Zeit für dich nehmen, ohne Verkaufsdruck, einfach Q&A zu deinem konkreten Fall. Ich hab dir gerade meinen Calendly-Link geschickt. Such dir was raus — und melde mich vorher per WhatsApp mit kurzem Briefing. Sawasdee!"`,
      'b-nurture': `📨 *Folge-Mail B-Lead (Tag 1)*\n\n"Danke für dein Interesse. Du hast das PDF — das ist das Fundament. Wenn du in den nächsten Wochen konkreter wirst, melde dich. In 7 Tagen schicke ich dir nochmal kurz eine Case-Study (Anonymisiert), die zu deinem Profil passt."`,
      'c-newsletter': `📩 *C-Lead — Newsletter-Welcome*\n\n"Du bist im Verteiler. 1× pro Monat schicke ich was Wesentliches — keine Werbung, kein Spam. Wenn du irgendwann konkret wirst: WhatsApp ist der schnellste Weg."`,
      'd-pause': `📭 *D-Lead — Soft Pause*\n\n"Danke für deine Anfrage. Aus deinen Antworten lese ich, dass du noch in der frühen Recherche-Phase bist — das ist okay. Schau dir das PDF in Ruhe an. Wenn sich was ändert, weißt du, wo du mich findest."`
    };
    const which = text.slice(10).trim();
    if (!which) return sendMessage(chatId,
      `📝 **Reply-Templates**\n\nVerfügbar:\n` +
      Object.keys(templates).map(k => `• \`/template ${k}\``).join('\n')
    );
    const tpl = templates[which];
    if (!tpl) return sendMessage(chatId, `Template \`${which}\` nicht gefunden. Verfügbar: ${Object.keys(templates).join(', ')}`);
    return sendMessage(chatId, tpl);
  }

  // /briefing — Daily-Briefing-Vorschau (manuell triggerbar)
  if (text === '/briefing' || text === '/daily') {
    const brief = await buildDailyBriefing();
    return sendMessage(chatId, brief);
  }

  if (text === '/kpis') {
    const ctx = await getPatrickContext();
    if (!ctx) return sendMessage(chatId, 'AEVUM-DB nicht erreichbar.');
    const targets = ctx.project?.marketing_thesis?.targets_90d || {};
    return sendMessage(chatId,
      `🎯 **KPI-Targets (90 Tage)**\n\n` +
      `Leads/Mo: ${targets.leads_per_month || '15-25'}\n` +
      `A-Leads/Mo: ${targets.a_leads_per_month || '3-5'}\n` +
      `CPL max: ${targets.cpl_max_eur || 80}€\n` +
      `SSI (LinkedIn): ${targets.ssi_min || 75}+\n` +
      `Newsletter: ${targets.newsletter_subs || 200}+\n` +
      `Gespräche/Wo: ${targets.conversations_per_week || 10}+\n\n` +
      `**Status:** ${summariseLeads(ctx.leads)}`,
      { reply_markup: statusInlineKeyboard() }
    );
  }

  if (text === '/login' || text === '/portal') {
    // SECURITY: /login ist für Patrick (sein normaler Login)
    if (isCarlos) {
      return sendMessage(chatId, '⛔ /login ist Patrick-only.\n\nDu (Carlos) brauchst /admin → impersonate-Link auf Patricks Dashboard.');
    }
    if (!isPatrick || !state.learnedPatrickId) {
      return sendMessage(chatId, 'Nur Patrick kann /login nutzen. Falls du Patrick bist: bitte zuerst /start senden.');
    }
    const ctx = await getPatrickContext();
    if (!ctx?.account?.email) return sendMessage(chatId, 'Kann Email aus AEVUM nicht laden.');
    const linkRes = await postJson(
      `${AEVUM_API}/api/auth/magic-link/issue-direct`,
      { email: ctx.account.email, purpose: 'login' },
      { 'x-admin-token': AEVUM_ADMIN_TOKEN }
    );
    if (!linkRes?.ok || !linkRes.link) {
      return sendMessage(chatId, `Magic-Link konnte nicht erstellt werden: ${linkRes?.error || 'unknown'}`);
    }
    return sendMessage(chatId,
      `🌴 *Dein AEVUM-Portal-Login*\n\n` +
      `Single-use · 30 Min gültig · Klick auf den Button, dann bist du eingeloggt.`,
      { reply_markup: loginInlineKeyboard(linkRes.link) }
    );
  }

  if (text === '/admin' || text === '/admin-login') {
    // CARLOS-only: impersonate-Link auf Patrick's Dashboard (Read-Access)
    if (!isCarlos) {
      return sendMessage(chatId, '⛔ /admin ist AEVUM-Owner-only.');
    }
    const ctx = await getPatrickContext();
    if (!ctx?.account?.email) return sendMessage(chatId, 'AEVUM-DB nicht erreichbar.');
    const linkRes = await postJson(
      `${AEVUM_API}/api/auth/magic-link/issue-direct`,
      { email: ctx.account.email, purpose: 'login' },
      { 'x-admin-token': AEVUM_ADMIN_TOKEN }
    );
    if (!linkRes?.ok || !linkRes.link) {
      return sendMessage(chatId, `Admin-Link fehlgeschlagen: ${linkRes?.error || 'unknown'}`);
    }
    return sendMessage(chatId,
      `🛠️ *Admin-Impersonate auf Patricks Dashboard*\n\n` +
      `Account: ${ctx.account.name} (${ctx.account.email})\n\n` +
      `_Single-use · 30 Min · Klick öffnet Dashboard als Patrick. Patrick kann separat /login holen — eigener Link, eigene Session._`,
      { reply_markup: loginInlineKeyboard(linkRes.link) }
    );
  }

  if (text === '/framework') {
    return sendMessage(chatId,
      `🏗️ **Patrick Trust-Funnel v1**\n\n` +
      `**3 Phasen:**\n` +
      `1. BEGEGNUNG (gesehen werden)\n` +
      `2. VERBINDUNG (gekannt werden)\n` +
      `3. BEGLEITUNG (vertraut werden)\n\n` +
      `**8 Prinzipien:**\n` +
      `• Vertrauen ist Basis\n• Nicht der krasse Makler\n• Kein Deal ohne Details\n• Immobilie passt zum Menschen\n• Menschliches zählt\n• Teil der Familie\n• Wir hören nicht beim Deal auf\n• Qualität vor Quantität\n\n` +
      `**Anti-Zielgruppe:** Schnell-Käufer, Spekulanten, Preis-Optimierer.\n\n` +
      `**Voice-Säulen:** Ehrlich · Menschlich · Vor-Ort · Netzwerkstolz · Langfristig`
    );
  }

  if (text === '/help') {
    return sendMessage(chatId,
      `🌴 **Thailand RE Commands**\n\n` +
      (isCarlos ? `*Admin:*\n/admin — Impersonate-Login auf Patricks Dashboard\n\n*Allgemein:*\n` : '') +
      (isPatrick ? `/login — Dein AEVUM-Portal-Login-Link\n` : '') +
      `/status — System-Check\n` +
      `/leads — Letzte 10 Leads\n` +
      `/lead <id> — Lead-Detail\n` +
      `/woche — 7-Tage-Recap mit Chart\n` +
      `/briefing — Tages-Briefing jetzt\n` +
      `/template <name> — Reply-Vorlagen\n` +
      `/kpis — Targets vs. Actual\n` +
      `/framework — Trust-Funnel-Framework\n` +
      `/menu — Haupt-Menü als Buttons einblenden\n` +
      `/help — diese Hilfe\n\n` +
      `💡 Die Buttons unten sind dauerhaft verfügbar — einfach tippen statt slash-tippen.\n\n` +
      `Oder schreib einfach was — ich denk mit dir mit. Ich kenne dein Setup, deine Pakete, dein ICP. Frag mich z.B.\n` +
      `• "Was sage ich dem Rentner-Lead, der nach Preis fragt?"\n` +
      `• "Welche Property aus meinem Listing passt für 250k Budget?"\n` +
      `• "Schreib mir nen LinkedIn-Post zum Foreign-Quota-Thema."`,
      { reply_markup: welcomeInlineKeyboard(isCarlos) }
    );
  }

  // ─── LLM Chat ────────────────────────────────────────────
  if (!OR_KEY) {
    return sendMessage(chatId, 'LLM noch nicht konfiguriert (OpenRouter-Key fehlt). Carlos muss `OPENROUTER_API_KEY` in env eintragen.');
  }

  const chat = loadChat(chatId);
  if (Date.now() - chat.updatedAt > CHAT_TTL_MS) chat.messages = [];

  // Context-Inject: Patrick's aktueller Status in die Messages
  const ctx = await getPatrickContext();
  const ctxInjection = ctx ? {
    role: 'system',
    content: `Aktueller Kontext (DB-Snapshot ${new Date().toISOString().slice(0,16)}):
- Account: ${ctx.account?.name}, Status ${ctx.account?.status}, Email ${ctx.account?.email}
- Project: ${ctx.project?.name}, Tier ${ctx.project?.tier}
- Leads: ${summariseLeads(ctx.leads)}
- Website: ${ctx.intel?.website_url || 'pending'}
- LinkedIn: ${ctx.intel?.linkedin_url || 'pending'}`
  } : null;

  chat.messages.push({ role: 'user', content: text });
  if (chat.messages.length > CHAT_MAX) chat.messages = chat.messages.slice(-CHAT_MAX);

  const messagesForLlm = ctxInjection ? [ctxInjection, ...chat.messages] : chat.messages;
  const reply = await llmReply(messagesForLlm);
  chat.messages.push({ role: 'assistant', content: reply });
  chat.updatedAt = Date.now();
  saveChat(chatId, chat);

  return sendMessage(chatId, reply);
}

// ─── Callback-Query Handler (Inline-Button-Klicks) ─────────
async function handleCallbackQuery(cq) {
  // Erst ACK damit Loading-Spinner bei TG verschwindet
  try { await tgApi('answerCallbackQuery', { callback_query_id: cq.id }); } catch {}
  const data = cq.data || '';
  const chatId = cq.message?.chat?.id;
  const fromId = cq.from?.id;
  if (!chatId || !fromId) return;
  if (data.startsWith('cmd:')) {
    const cmd = '/' + data.slice(4);
    return handleChatMessage(chatId, fromId, cmd);
  }
}

// ─── Daily-Briefing ────────────────────────────────────────
async function buildDailyBriefing() {
  const ctx = await getPatrickContext();
  if (!ctx?.account?.id) return '☀️ **Tages-Briefing**\n\nAEVUM-DB nicht erreichbar. Lennox-Check empfohlen.';

  const yesterdayCutoff = new Date(Date.now() - 86400000).toISOString();
  const weekCutoff = new Date(Date.now() - 7 * 86400000).toISOString();

  const yesterdayLeads = await dbQuery(`/customer_leads?account_id=eq.${ctx.account.id}&created_at=gte.${yesterdayCutoff}&select=id,lead_tier,status,name,email,created_at&order=created_at.desc&limit=100`) || [];
  const weekLeads = await dbQuery(`/customer_leads?account_id=eq.${ctx.account.id}&created_at=gte.${weekCutoff}&select=lead_tier,status,created_at`) || [];
  const aPending = await dbQuery(`/customer_leads?account_id=eq.${ctx.account.id}&lead_tier=eq.A&status=eq.new&select=id,name,email,created_at&order=created_at.desc&limit=20`) || [];

  const yTiers = yesterdayLeads.reduce((a,l) => { const t=l.lead_tier||'?'; a[t]=(a[t]||0)+1; return a; }, {});
  const wTiers = weekLeads.reduce((a,l) => { const t=l.lead_tier||'?'; a[t]=(a[t]||0)+1; return a; }, {});

  const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'short' });

  const lines = [
    `☀️ **Tages-Briefing — ${date}**`,
    ``,
    `**Gestern:** ${yesterdayLeads.length} neue Leads (A:${yTiers.A||0} B:${yTiers.B||0} C:${yTiers.C||0} D:${yTiers.D||0})`,
    `**Letzte 7 Tage:** ${weekLeads.length} (A:${wTiers.A||0} B:${wTiers.B||0} C:${wTiers.C||0} D:${wTiers.D||0})`,
    ``
  ];

  if (aPending.length) {
    lines.push(`🚨 **${aPending.length} A-Lead(s) ohne Status-Update:**`);
    aPending.slice(0, 5).forEach(l => {
      const hoursOld = Math.round((Date.now() - new Date(l.created_at).getTime()) / 3600000);
      lines.push(`• ${l.name || l.email} — ${hoursOld}h alt — \`/lead ${l.id.slice(0,8)}\``);
    });
    if (aPending.length > 5) lines.push(`...und ${aPending.length - 5} weitere`);
    lines.push('');
  }

  // Tips
  const tips = [];
  if (weekLeads.length < 3) tips.push('• Lead-Volume niedrig → 1 LinkedIn-Post heute, WhatsApp-Status updaten.');
  if ((wTiers.A || 0) === 0 && weekLeads.length >= 3) tips.push('• 0 A-Leads diese Woche → Lead-Magnet-Targeting prüfen.');
  if (aPending.length > 2) tips.push(`• ${aPending.length} A-Leads warten → heute Vormittag durchgehen.`);
  if (!tips.length) tips.push('• Alles im grünen Bereich — heute 1 Post & 3 LinkedIn-Comments für Visibility.');

  lines.push('**Empfehlung heute:**');
  lines.push(...tips);

  return lines.join('\n');
}

let lastBriefingDate = '';
async function maybeSendBriefing() {
  try {
    const now = new Date();
    // Berlin TZ — VPS already CEST, so local is fine
    const h = now.getHours();
    const today = now.toISOString().slice(0, 10);
    if (h === 9 && lastBriefingDate !== today) {
      lastBriefingDate = today;
      const target = authorizedPatrickId() || CARLOS_TG_ID;
      if (!target) return;
      const brief = await buildDailyBriefing();
      await sendMessage(target, brief);
      console.log(`[thailandre-bot] daily briefing sent to ${target}`);
    }
  } catch (e) {
    console.error('[thailandre-bot] briefing error:', e.message);
  }
}
function startBriefingScheduler() {
  // Check every 5 minutes — cheap, idempotent via lastBriefingDate
  setInterval(maybeSendBriefing, 5 * 60 * 1000);
}

// ─── Poll Loop ─────────────────────────────────────────────
async function pollLoop() {
  let offset = state.lastUpdateId + 1;
  while (true) {
    try {
      const res = await getUpdates(offset);
      if (res && res.ok && res.result) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          state.lastUpdateId = update.update_id; saveState();
          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            continue;
          }
          const msg = update.message;
          if (!msg || !msg.text) continue;
          await handleChatMessage(msg.chat.id, msg.from.id, msg.text);
        }
      }
    } catch (e) {
      console.error('[thailandre-bot] poll error', e.message);
      await sleep(2000);
    }
  }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── HTTP-Notify (Lennox/Carlos sendet Push an Patrick) ───
function startNotifyServer() {
  http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET' && req.url === '/health') {
      return res.end(JSON.stringify({ ok: true, mode: 'full', patrick_id: authorizedPatrickId() || null }));
    }
    if (req.method === 'POST' && req.url === '/notify') {
      let body = '';
      req.on('data', d => body += d);
      req.on('end', async () => {
        try {
          const { text, audience } = JSON.parse(body);
          const targets = [];
          if (audience === 'patrick' || audience === 'both') targets.push(authorizedPatrickId());
          if (audience === 'carlos' || audience === 'both' || !audience) targets.push(CARLOS_TG_ID);
          const sent = [];
          for (const t of targets) {
            if (!t) continue;
            await sendMessage(t, text);
            sent.push(t);
          }
          res.end(JSON.stringify({ ok: true, sent }));
        } catch (e) {
          res.writeHead(400).end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }
    res.writeHead(404).end(JSON.stringify({ ok: false }));
  }).listen(NOTIFY_PORT, '127.0.0.1', () => console.log(`[thailandre-bot] notify on 127.0.0.1:${NOTIFY_PORT}`));
}

async function registerBotCommands() {
  // Sichtbar in TG-Slash-Autocomplete + Menu-Button
  const commands = [
    { command: 'start',     description: 'Bot starten + Menü' },
    { command: 'login',     description: 'Magic-Link zum AEVUM-Portal' },
    { command: 'status',    description: 'System-Status' },
    { command: 'leads',     description: 'Letzte 10 Leads' },
    { command: 'lead',      description: 'Lead-Detail per id-prefix' },
    { command: 'woche',     description: '7-Tage-Recap mit Chart' },
    { command: 'briefing',  description: 'Tages-Briefing jetzt' },
    { command: 'templates', description: 'Reply-Vorlagen' },
    { command: 'kpis',      description: 'KPI-Targets vs. Actual' },
    { command: 'framework', description: 'Trust-Funnel-Framework' },
    { command: 'menu',      description: 'Haupt-Menü einblenden' },
    { command: 'help',      description: 'Alle Befehle' }
  ];
  try {
    await tgApi('setMyCommands', { commands });
    await tgApi('setChatMenuButton', { menu_button: { type: 'commands' } });
  } catch (e) {
    console.error('[thailandre-bot] setMyCommands fehlgeschlagen:', e.message);
  }
}

function startFull() {
  console.log(`[thailandre-bot] Starting — Patrick TG-ID: ${authorizedPatrickId() || 'TBD (wartet auf /start)'}, Carlos TG-ID: ${CARLOS_TG_ID}`);
  console.log(`[thailandre-bot] Model: ${OR_MODEL}, AEVUM-DB: ${SUPABASE_URL ? 'connected' : 'MISSING'}`);
  registerBotCommands();
  startNotifyServer();
  startBriefingScheduler();
  pollLoop();
}
