// AEVUM Universal Customer Bot — Template v2
// Liest config.json aus dem customers/[slug]/agent/ Verzeichnis
// 1 Bot pro Kunde, N Projekte als Inline-Keyboard
// Chat-History: getrennt pro Projekt → chats/[chatId]-[projectSlug].json

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env' });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/ketolabs.env', override: true });
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Bootstrap ────────────────────────────────────────────────────────────────

// __dirname zeigt auf shared/agent/ → wir laden config aus dem aufrufenden Verzeichnis
// Caller setzt AEVUM_BOT_CONFIG_DIR auf seinen eigenen Pfad
const CONFIG_DIR = process.env.AEVUM_BOT_CONFIG_DIR
  || path.dirname(fileURLToPath(import.meta.url));

const configPath = path.join(CONFIG_DIR, 'config.json');
if (!fs.existsSync(configPath)) {
  console.error(`[aevum-bot] config.json nicht gefunden: ${configPath}`);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const TOKEN       = process.env[config.tokenEnv];
const OR_KEY      = process.env.OPENROUTER_API_KEY;
const OR_MODEL    = config.model || process.env.AEVUM_BOT_MODEL || 'anthropic/claude-haiku-4-5';
const NOTIFY_PORT = config.port || parseInt(process.env.AEVUM_BOT_PORT || '4131', 10);
const CARLOS_ID   = parseInt(process.env.CARLOS_TG_USER_ID || '6436074677', 10);
const ADMIN_IDS   = new Set([CARLOS_ID, ...(config.adminIds || []).map(Number)]);
const OWNER_IDS   = new Set([...ADMIN_IDS, ...(config.ownerIds || []).map(Number)]);

const STATE_FILE    = path.join(CONFIG_DIR, 'state.json');
const CHATS_DIR     = path.join(CONFIG_DIR, 'chats');
const KNOWLEDGE_DIR = path.join(CONFIG_DIR, '..', 'knowledge');
const DATA_API_URL  = config.dataApiUrl || 'http://localhost:3210';
const ADMIN_TOKEN   = process.env.AEVUM_ADMIN_TOKEN || '';

const BOT_NAME = config.customerName || config.customerSlug;
const DEFAULT_PROJECT = config.projects?.[0]?.slug || 'default';

// ── Section Data Fetch ───────────────────────────────────────────────────────

function fetchSectionData(projectSlug, sectionSlug) {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const url = new URL(`/bot/section-data`, DATA_API_URL);
  url.searchParams.set('customerSlug', config.customerSlug);
  url.searchParams.set('projectSlug', projectSlug);
  url.searchParams.set('sectionSlug', sectionSlug);
  return new Promise(resolve => {
    http.get({ hostname: 'localhost', port: 3210, path: url.pathname + url.search,
      headers: { 'x-aevum-admin-token': ADMIN_TOKEN } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

// ── TG Access Check + Request ────────────────────────────────────────────────

function checkTgAccess(telegramId) {
  return new Promise(resolve => {
    http.get({
      hostname: 'localhost', port: 3210,
      path: `/bot/tg-access?telegram_id=${telegramId}`,
      headers: { 'x-aevum-admin-token': ADMIN_TOKEN }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

function requestTgAccess(telegramId, username, name) {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const body = JSON.stringify({ telegram_id: telegramId, telegram_username: username || null, telegram_name: name || null });
  return new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 3210, path: '/bot/request-access', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'x-aevum-admin-token': ADMIN_TOKEN }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

function grantTgAccess(telegramId, accountSlug) {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const body = JSON.stringify({ telegram_id: telegramId, account_slug: accountSlug });
  return new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 3210, path: '/bot/grant-access', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'x-aevum-admin-token': ADMIN_TOKEN }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

function fetchDashboardLinkForSlug(customerSlug) {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const body = JSON.stringify({ customerSlug });
  return new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 3210, path: '/bot/magic-link', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'x-aevum-admin-token': ADMIN_TOKEN }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

// Fetch aggregated snapshot from /bot/snapshot
function fetchSnapshot(customerSlug, include, projectSlug) {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const body = JSON.stringify({ customerSlug, projectSlug, include });
  return new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 3210, path: '/bot/snapshot', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'x-aevum-admin-token': ADMIN_TOKEN }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

// ── Dashboard Magic-Link Fetch ───────────────────────────────────────────────

function fetchDashboardLink() {
  if (!ADMIN_TOKEN) return Promise.resolve(null);
  const body = JSON.stringify({ customerSlug: config.customerSlug });
  return new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3210,
      path: '/bot/magic-link',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-aevum-admin-token': ADMIN_TOKEN
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

// ── Idle Mode ────────────────────────────────────────────────────────────────

if (!TOKEN) {
  console.warn(`[${config.customerSlug}-bot] ${config.tokenEnv} fehlt — idle mode`);
  http.createServer((req, res) => {
    if (req.url === '/health') return res.end(JSON.stringify({ ok: true, mode: 'idle', customer: config.customerSlug }));
    res.writeHead(503).end('idle');
  }).listen(NOTIFY_PORT, '127.0.0.1');
  process.exit(0);
}

fs.mkdirSync(CHATS_DIR, { recursive: true });

// ── State ────────────────────────────────────────────────────────────────────

let state = { lastUpdateId: 0, activeProject: {}, activeSection: {} };
try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch {}
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

// ── Knowledge Loader ─────────────────────────────────────────────────────────

function loadPersona(projectSlug, sectionSlug, isAdmin, sectionData) {
  const parts = [];
  const proj = config.projects?.find(p => p.slug === projectSlug);
  const section = sectionSlug ? proj?.sections?.find(s => s.slug === sectionSlug) : null;

  parts.push(`Du bist der AEVUM Business Agent für ${BOT_NAME}.
Aktives Projekt: ${proj?.label || projectSlug}${proj?.description ? ` — ${proj.description}` : ''}.
${section ? `Aktiver Bereich: ${section.label.replace(/^\S+\s/, '')} — beantworte Fragen mit Fokus auf diesen Bereich.` : ''}
${isAdmin ? `[ADMIN-SESSION — Carlos Wrusch (AEVUM-Operator) testet/monitort diesen Bot. Antworte normal, aber du kannst Debuginfos oder interne Details teilen falls gefragt.]` : ''}
Stil: direkt, datengetrieben, brutal ehrlich. Kein Bullshit, keine Sycophantie.
Sprache: Deutsch. Fokus auf Cashflow, Pipeline, Execution.`);

  // Shared Customer Context
  const sharedPath = path.join(KNOWLEDGE_DIR, '_shared.md');
  if (fs.existsSync(sharedPath)) {
    try { parts.push(fs.readFileSync(sharedPath, 'utf8')); } catch {}
  }

  // Project-spezifischer Context
  const projPath = path.join(KNOWLEDGE_DIR, `${projectSlug}.md`);
  if (fs.existsSync(projPath)) {
    try { parts.push(fs.readFileSync(projPath, 'utf8')); } catch {}
  } else {
    // Fallback: alle .md files (legacy)
    const files = fs.existsSync(KNOWLEDGE_DIR)
      ? fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'))
      : [];
    for (const f of files) {
      try { parts.push(fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf8')); } catch {}
    }
  }

  // Live section data injected as context block
  if (sectionData) {
    parts.push(`## Aktuelle Daten — ${sectionSlug || 'Bereich'}\n${JSON.stringify(sectionData, null, 2)}`);
  }

  return parts.join('\n\n---\n\n');
}

// ── Chat History ─────────────────────────────────────────────────────────────

const CHAT_TTL_MS = 4 * 60 * 60_000;
const CHAT_MAX    = 30;

function chatFile(chatId, projectSlug) {
  return path.join(CHATS_DIR, `${chatId}-${projectSlug}.json`);
}

function loadHistory(chatId, projectSlug) {
  try {
    const c = JSON.parse(fs.readFileSync(chatFile(chatId, projectSlug), 'utf8'));
    if (c.expiresAt && Date.parse(c.expiresAt) < Date.now()) return [];
    return c.messages || [];
  } catch { return []; }
}

function saveHistory(chatId, projectSlug, messages) {
  fs.writeFileSync(chatFile(chatId, projectSlug), JSON.stringify({
    messages: messages.slice(-CHAT_MAX),
    expiresAt: new Date(Date.now() + CHAT_TTL_MS).toISOString()
  }, null, 2));
}

// ── Telegram API ──────────────────────────────────────────────────────────────

function tg(method, params = {}) {
  const body = JSON.stringify(params);
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', () => resolve({}));
    req.write(body); req.end();
  });
}

const send = (chat_id, text, extra = {}) => tg('sendMessage', { chat_id, text, parse_mode: 'Markdown', ...extra });

// Native typing-indicator. Returns stop()-fn — caller MUSS aufrufen wenn fertig.
function startTyping(chat_id) {
  tg('sendChatAction', { chat_id, action: 'typing' }).catch(() => {});
  const interval = setInterval(() => {
    tg('sendChatAction', { chat_id, action: 'typing' }).catch(() => {});
  }, 4000);
  return () => clearInterval(interval);
}

async function thinkingPlaceholder(chat_id, projectLabel) {
  // Native typing zusätzlich aktivieren (Header: "Bot schreibt...")
  const stopTyping = startTyping(chat_id);
  const msg = await tg('sendMessage', { chat_id, text: `💭 *${projectLabel || BOT_NAME}* denkt nach…`, parse_mode: 'Markdown' });
  const id = msg?.result?.message_id;
  const editFn = async (text, extra = {}) => {
    stopTyping();
    if (!id) return send(chat_id, text, extra);
    return tg('editMessageText', { chat_id, message_id: id, text, parse_mode: 'Markdown', ...extra });
  };
  editFn.stop = stopTyping;
  return editFn;
}

// ── Project Menu ──────────────────────────────────────────────────────────────

function buildProjectMenu() {
  if (!config.projects?.length) return undefined;
  const rows = [];
  for (let i = 0; i < config.projects.length; i += 2) {
    const row = [{ text: config.projects[i].label, callback_data: `proj:${config.projects[i].slug}` }];
    if (config.projects[i + 1]) row.push({ text: config.projects[i + 1].label, callback_data: `proj:${config.projects[i + 1].slug}` });
    rows.push(row);
  }
  rows.push([{ text: '🔄 Reset Chat', callback_data: 'cmd:reset' }, { text: '📊 Status', callback_data: 'cmd:status' }]);
  return { inline_keyboard: rows };
}

function buildReplyKeyboard(projectSlug) {
  const proj = config.projects?.find(p => p.slug === projectSlug);
  const rows = [];
  if (proj?.sections?.length) {
    for (let i = 0; i < proj.sections.length; i += 2) {
      const row = [{ text: proj.sections[i].label }];
      if (proj.sections[i + 1]) row.push({ text: proj.sections[i + 1].label });
      rows.push(row);
    }
  }
  // Universal Action-Row: Portal / KPIs / Käufe
  rows.push([{ text: '🚀 Portal' }, { text: '📊 KPIs' }, { text: '🛒 Käufe' }]);
  if (config.projects?.length > 1) rows.push([{ text: '◀ Projekte' }, { text: '❓ Hilfe' }]);
  else rows.push([{ text: '❓ Hilfe' }, { text: '🔄 Reset' }, { text: '📊 Status' }]);
  return { keyboard: rows, resize_keyboard: true, is_persistent: true };
}

function sectionByLabel(projectSlug, label) {
  const proj = config.projects?.find(p => p.slug === projectSlug);
  return proj?.sections?.find(s => s.label === label) || null;
}

function getActiveProject(chat_id) {
  return config.projects?.find(p => p.slug === (state.activeProject[chat_id] || DEFAULT_PROJECT))
    || config.projects?.[0]
    || { slug: DEFAULT_PROJECT, label: BOT_NAME };
}

// ── LLM ──────────────────────────────────────────────────────────────────────

async function llm(chat_id, userText, projectSlug) {
  if (!OR_KEY) return '⚠️ OpenRouter Key fehlt.';
  const history = loadHistory(chat_id, projectSlug);
  history.push({ role: 'user', content: userText });

  const activeSection = state.activeSection?.[chat_id]?.[projectSlug];
  const isAdmin = ADMIN_IDS.has(chat_id);
  const sectionData = state.sectionData?.[chat_id]?.[projectSlug]?.[activeSection] ?? null;
  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const systemPrompt = `NOW: ${now} (Europe/Berlin)\n\n` + loadPersona(projectSlug, activeSection, isAdmin, sectionData);

  const body = JSON.stringify({
    model: OR_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...history],
    max_tokens: 1000
  });

  return new Promise(resolve => {
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OR_KEY}`,
        'HTTP-Referer': 'https://aevum-system.de',
        'X-Title': `AEVUM ${BOT_NAME} Agent`
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          const reply = r.choices?.[0]?.message?.content || '⚠️ Keine Antwort.';
          history.push({ role: 'assistant', content: reply });
          saveHistory(chat_id, projectSlug, history);
          resolve(reply);
        } catch { resolve('⚠️ Parse-Fehler.'); }
      });
    });
    req.on('error', () => resolve('⚠️ LLM nicht erreichbar.'));
    req.write(body); req.end();
  });
}

// ── HTTP Notify Endpoint ──────────────────────────────────────────────────────

http.createServer(async (req, res) => {
  if (req.url === '/health') return res.end(JSON.stringify({ ok: true, customer: config.customerSlug, bot: BOT_NAME }));
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { chat_id, text, project } = JSON.parse(body);
        const target = chat_id || [...OWNER_IDS][0];
        await send(target, text);
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400).end('bad request'); }
    });
  } else {
    res.writeHead(404).end();
  }
}).listen(NOTIFY_PORT, '127.0.0.1', () =>
  console.log(`[${config.customerSlug}-bot] notify endpoint 127.0.0.1:${NOTIFY_PORT}`));

// ── Command Handler ───────────────────────────────────────────────────────────

async function handleCommand(cmd, chat_id, fullText, msg) {
  const activeProj = getActiveProject(chat_id);

  if (cmd === '/start') {
    const payload = fullText ? fullText.split(' ')[1] : undefined;

    if (payload === 'login' || payload === 'dashboard') {
      // Owner/admin → direkte Magic-Link-Generierung
      if (OWNER_IDS.has(chat_id)) {
        const editReply = await thinkingPlaceholder(chat_id, 'Dashboard');
        const result = await fetchDashboardLink();
        if (result?.ok && result.url) {
          await editReply(
            `🖥 *Dein Dashboard-Zugang*\n\n_15 Minuten gültig, einmalig._`,
            { reply_markup: { inline_keyboard: [[{ text: '🚀 Dashboard öffnen', url: result.url }]] } }
          );
        } else {
          await editReply('❌ Dashboard-Link konnte nicht generiert werden. Tippe auf 🖥 Dashboard im Menü.');
        }
        const kb = buildReplyKeyboard(activeProj.slug);
        if (kb) await send(chat_id, `Willkommen zurück! Wähle einen Bereich:`, { reply_markup: kb });
        return;
      }

      // Unbekannter User → TG Verification Gate
      const access = await checkTgAccess(chat_id);
      if (access?.has_access) {
        // Freigeschalteter Kunde → Magic-Link für seinen Account
        const editReply = await thinkingPlaceholder(chat_id, 'Dashboard');
        const result = await fetchDashboardLinkForSlug(access.account_slug);
        if (result?.ok && result.url) {
          await editReply(
            `🖥 *Dein Dashboard-Zugang*\n\nWillkommen, ${access.account_name || ''}!\n_30 Minuten gültig._`,
            { reply_markup: { inline_keyboard: [[{ text: '🚀 Dashboard öffnen', url: result.url }]] } }
          );
        } else {
          await editReply('❌ Dashboard-Link konnte nicht generiert werden. Bitte wende dich an deinen Ansprechpartner.');
        }
        return;
      }
      if (access?.status === 'pending') {
        await send(chat_id, '⏳ Dein Zugangsantrag wird bearbeitet. Du erhältst eine Benachrichtigung sobald du freigeschaltet bist.');
        return;
      }
      // Nicht bekannt → Antrag stellen
      const from = msg?.from;
      const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ');
      await requestTgAccess(chat_id, from?.username, name);
      await send(chat_id, '🔔 Kein Zugang gefunden.\n\nDein Antrag wurde weitergeleitet. Du wirst benachrichtigt sobald dein Zugang freigeschaltet wurde.');
      return;
    }

    // Normaler /start ohne Payload → Menü zeigen (fall-through to /menu)
    return handleCommand('/menu', chat_id);
  }

  if (cmd === '/menu') {
    const kb = buildReplyKeyboard(activeProj.slug);
    if (kb) {
      return send(chat_id,
        `🏛 *AEVUM Agent — ${BOT_NAME}*\nProjekt: *${activeProj.label}*\n\nWähle einen Bereich:`,
        { reply_markup: kb }
      );
    }
    const menu = buildProjectMenu();
    const projList = config.projects?.map(p => `• ${p.label}`).join('\n') || '';
    return send(chat_id,
      `🏛 *AEVUM Agent — ${BOT_NAME}*\n\n${projList ? `Projekte:\n${projList}\n\n` : ''}Aktiv: *${activeProj.label}*\n\nStell mir eine Frage oder wähle ein Projekt:`,
      menu ? { reply_markup: menu } : {}
    );
  }
  if (cmd === '/status') {
    const knowledgeCount = fs.existsSync(KNOWLEDGE_DIR) ? fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md')).length : 0;
    return send(chat_id,
      `✅ *${BOT_NAME} Agent aktiv*\nModell: ${OR_MODEL}\nProjekte: ${config.projects?.length || 1}\nAktiv: ${activeProj.label}\nKnowledge: ${knowledgeCount} Files`
    );
  }
  // ── /login (alias for /start login) ────────────────────────
  if (cmd === '/login') {
    return handleCommand('/start', chat_id, '/start login', msg);
  }

  // ── /help ──────────────────────────────────────────────────
  if (cmd === '/help') {
    const lines = [
      `*🤖 ${BOT_NAME} Agent — Hilfe*`,
      '',
      '*Befehle:*',
      '`/login` — Dashboard-Magic-Link holen',
      '`/kpi` — Live-KPIs (Projekte, MRR)',
      '`/orders` — letzte Bestellungen',
      '`/credits` — Credit-Balance + Stempelkarte',
      '`/docs` — Dokumente im Postfach',
      '`/runs` — letzte Factory-Runs',
      '`/menu` — Hauptmenü',
      '`/status` — Bot-Status',
      '`/reset` — Chat-Verlauf löschen',
      '',
      '*Frei chatten:* einfach Frage tippen — ich antworte mit Account-Context aus der DB.'
    ];
    return send(chat_id, lines.join('\n'));
  }

  // ── /kpi /orders /credits /docs /runs — dispatch über /bot/snapshot
  const SNAP_MAP = {
    '/kpi':     { include: ['kpi'],     label: 'KPIs',      key: 'kpi' },
    '/orders':  { include: ['orders'],  label: 'Käufe',     key: 'orders' },
    '/credits': { include: ['credits'], label: 'Credits',   key: 'credits' },
    '/docs':    { include: ['docs'],    label: 'Dokumente', key: 'docs' },
    '/runs':    { include: ['runs'],    label: 'Runs',      key: 'runs' }
  };
  if (SNAP_MAP[cmd]) {
    const spec = SNAP_MAP[cmd];
    const editReply = await thinkingPlaceholder(chat_id, spec.label);
    const result = await fetchSnapshot(config.customerSlug, spec.include, activeProj.slug);
    if (result?.ok && result.formatted?.[spec.key]) {
      return editReply(result.formatted[spec.key]);
    }
    return editReply(`❌ ${spec.label} konnten nicht geladen werden.${result?.error ? ` (${result.error})` : ''}`);
  }

  if (cmd === '/reset') {
    const file = chatFile(chat_id, activeProj.slug);
    try { fs.writeFileSync(file, JSON.stringify({ messages: [], expiresAt: '' })); } catch {}
    return send(chat_id, `🔄 Chat-History für *${activeProj.label}* gelöscht.`);
  }

  // /grant TG_ID ACCOUNT_SLUG — Admin-only: Zugang für neuen Kunden freischalten
  if (cmd === '/grant' && ADMIN_IDS.has(chat_id)) {
    const parts = fullText.trim().split(/\s+/);
    if (parts.length < 3) {
      return send(chat_id, '❌ Usage: `/grant <telegram_id> <account_slug>`\nBeispiel: `/grant 123456789 vogt-hv`', { parse_mode: 'Markdown' });
    }
    const tgId = parseInt(parts[1]);
    const slug = parts[2];
    if (!tgId || isNaN(tgId)) return send(chat_id, '❌ Ungültige Telegram ID.');
    const editReply = await thinkingPlaceholder(chat_id, 'Zugang erteilen');
    const result = await grantTgAccess(tgId, slug);
    if (result?.ok) {
      await editReply(`✅ Zugang erteilt!\n\nAccount: *${result.account?.name || slug}*\nTelegram ID: \`${tgId}\`\n\nDer Nutzer wurde benachrichtigt und erhält automatisch seinen Dashboard-Link.`, { parse_mode: 'Markdown' });
    } else {
      await editReply(`❌ Fehler: ${result?.error || 'Unbekannt'}. Account-Slug korrekt?`);
    }
    return;
  }
}

// ── Callback Handler (Inline Buttons) ────────────────────────────────────────

async function handleCallback(callbackQuery) {
  const chat_id = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;
  if (!chat_id || !data) return;

  await tg('answerCallbackQuery', { callback_query_id: callbackQuery.id });

  if (data.startsWith('proj:')) {
    const slug = data.slice(5);
    const proj = config.projects?.find(p => p.slug === slug);
    if (!proj) return;
    state.activeProject[chat_id] = slug;
    saveState();
    const kb = buildReplyKeyboard(slug);
    return send(chat_id,
      `📂 *${proj.label}* aktiv.\n\nWähle einen Bereich:`,
      kb ? { reply_markup: kb } : {}
    );
  }

  if (data === 'cmd:reset') {
    const proj = getActiveProject(chat_id);
    try { fs.writeFileSync(chatFile(chat_id, proj.slug), JSON.stringify({ messages: [], expiresAt: '' })); } catch {}
    return send(chat_id, `🔄 Chat-History für *${proj.label}* gelöscht.`);
  }

  if (data === 'cmd:status') {
    return handleCommand('/status', chat_id);
  }
}

// ── Poll Loop ─────────────────────────────────────────────────────────────────

async function poll() {
  const result = await tg('getUpdates', {
    offset: state.lastUpdateId + 1,
    timeout: 30,
    allowed_updates: ['message', 'callback_query']
  });

  for (const update of (result.result || [])) {
    state.lastUpdateId = update.update_id;

    if (update.callback_query) {
      const cq = update.callback_query;
      if (OWNER_IDS.has(cq.from?.id)) {
        await handleCallback(cq).catch(e => console.error('[callback]', e.message));
      }
      continue;
    }

    const msg = update.message;
    if (!msg?.text) continue;

    const chat_id = msg.chat.id;
    // Unknown users: only allow /start login (verification gate), block everything else
    if (!OWNER_IDS.has(chat_id)) {
      const txt = msg.text?.trim() || '';
      if (txt.startsWith('/start')) {
        await handleCommand('/start', chat_id, txt, msg).catch(e => console.error('[cmd]', e.message));
      } else {
        await send(chat_id, '⛔ Privater Bot. Kein Zugang.');
      }
      continue;
    }

    const text = msg.text.trim();
    const activeProj = getActiveProject(chat_id);

    if (text.startsWith('/')) {
      await handleCommand(text.split(' ')[0], chat_id, text).catch(e => console.error('[cmd]', e.message));
      continue;
    }

    // Reply-Keyboard button intercepts
    if (text === '🔄 Reset') { await handleCommand('/reset', chat_id); continue; }
    if (text === '📊 Status') { await handleCommand('/status', chat_id); continue; }
    if (text === '◀ Projekte') {
      const menu = buildProjectMenu();
      await send(chat_id, `Welches Projekt?`, menu ? { reply_markup: menu } : {});
      continue;
    }

    // ── Reply-Keyboard Action-Row Intercepts ──────────────────
    if (text === '🚀 Portal' || text === '🖥 Dashboard') {
      const editReply = await thinkingPlaceholder(chat_id, 'Dashboard');
      const result = await fetchDashboardLink();
      if (result?.ok && result.url) {
        await editReply(
          `🚀 *Portal-Zugang*\n\n_Einmaliger Link — 15 Min gültig._`,
          { reply_markup: { inline_keyboard: [[{ text: '🚀 Portal öffnen', url: result.url }]] } }
        );
      } else {
        await editReply('❌ Portal-Link konnte nicht generiert werden.');
      }
      continue;
    }
    if (text === '📊 KPIs') { await handleCommand('/kpi', chat_id, text); continue; }
    if (text === '🛒 Käufe') { await handleCommand('/orders', chat_id, text); continue; }
    if (text === '❓ Hilfe') { await handleCommand('/help', chat_id, text); continue; }

    const matchedSection = sectionByLabel(activeProj.slug, text);
    if (matchedSection) {
      if (!state.activeSection) state.activeSection = {};
      if (!state.activeSection[chat_id]) state.activeSection[chat_id] = {};
      state.activeSection[chat_id][activeProj.slug] = matchedSection.slug;
      if (!state.sectionData) state.sectionData = {};
      if (!state.sectionData[chat_id]) state.sectionData[chat_id] = {};
      if (!state.sectionData[chat_id][activeProj.slug]) state.sectionData[chat_id][activeProj.slug] = {};
      saveState();

      const editReply = await thinkingPlaceholder(chat_id, matchedSection.label.replace(/^\S+\s/, ''));
      const sectionResult = await fetchSectionData(activeProj.slug, matchedSection.slug);
      if (sectionResult?.ok && sectionResult.formatted) {
        state.sectionData[chat_id][activeProj.slug][matchedSection.slug] = sectionResult.raw;
        saveState();
        await editReply(sectionResult.formatted);
      } else {
        await editReply(`${matchedSection.label} aktiv — stell mir eine Frage:`);
      }
      continue;
    }

    const editReply = await thinkingPlaceholder(chat_id, activeProj.label);
    const reply     = await llm(chat_id, text, activeProj.slug);
    await editReply(reply);
  }

  saveState();
  setTimeout(poll, 100);
}

console.log(`[${config.customerSlug}-bot] Start — ${BOT_NAME} — ${config.projects?.length || 1} Projekt(e)`);
poll();
