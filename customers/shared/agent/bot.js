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
const OWNER_IDS   = new Set([
  parseInt(process.env.CARLOS_TG_USER_ID || '6436074677', 10),
  ...(config.ownerIds || []).map(Number)
]);

const STATE_FILE = path.join(CONFIG_DIR, 'state.json');
const CHATS_DIR  = path.join(CONFIG_DIR, 'chats');
const KNOWLEDGE_DIR = path.join(CONFIG_DIR, '..', 'knowledge');

const BOT_NAME = config.customerName || config.customerSlug;
const DEFAULT_PROJECT = config.projects?.[0]?.slug || 'default';

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

let state = { lastUpdateId: 0, activeProject: {} };
try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch {}
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

// ── Knowledge Loader ─────────────────────────────────────────────────────────

function loadPersona(projectSlug) {
  const parts = [];
  const proj = config.projects?.find(p => p.slug === projectSlug);

  parts.push(`Du bist der AEVUM Business Agent für ${BOT_NAME}.
Aktives Projekt: ${proj?.label || projectSlug}${proj?.description ? ` — ${proj.description}` : ''}.
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

async function thinkingPlaceholder(chat_id, projectLabel) {
  const msg = await tg('sendMessage', { chat_id, text: `💭 *${projectLabel || BOT_NAME}* denkt nach…`, parse_mode: 'Markdown' });
  const id = msg?.result?.message_id;
  return async (text, extra = {}) => {
    if (!id) return send(chat_id, text, extra);
    return tg('editMessageText', { chat_id, message_id: id, text, parse_mode: 'Markdown', ...extra });
  };
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

  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const systemPrompt = `NOW: ${now} (Europe/Berlin)\n\n` + loadPersona(projectSlug);

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

async function handleCommand(cmd, chat_id) {
  const activeProj = getActiveProject(chat_id);

  if (cmd === '/start' || cmd === '/menu') {
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
  if (cmd === '/reset') {
    const file = chatFile(chat_id, activeProj.slug);
    try { fs.writeFileSync(file, JSON.stringify({ messages: [], expiresAt: '' })); } catch {}
    return send(chat_id, `🔄 Chat-History für *${activeProj.label}* gelöscht.`);
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
    return send(chat_id, `📂 *${proj.label}* aktiv.\n\n${proj.description || 'Stell mir eine Frage.'}`);
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
    if (!OWNER_IDS.has(chat_id)) {
      await send(chat_id, '⛔ Privater Bot.');
      continue;
    }

    const text = msg.text.trim();
    if (text.startsWith('/')) {
      await handleCommand(text.split(' ')[0], chat_id).catch(e => console.error('[cmd]', e.message));
    } else {
      const activeProj = getActiveProject(chat_id);
      const editReply  = await thinkingPlaceholder(chat_id, activeProj.label);
      const reply      = await llm(chat_id, text, activeProj.slug);
      await editReply(reply);
    }
  }

  saveState();
  setTimeout(poll, 100);
}

console.log(`[${config.customerSlug}-bot] Start — ${BOT_NAME} — ${config.projects?.length || 1} Projekt(e)`);
poll();
