// collaglow-bot — Tommy's AI Agent via Telegram
// Part of: AEVUM Customer Stack / Ketolabs / CollaGlow
// Pattern: AEVUM Client Bot Template v1

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env' });
dotenv.config({ path: '/home/carlos/.envs/ketolabs.env', override: true });
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN      = process.env.COLLAGLOW_BOT_TOKEN;
const TOMMY_ID   = parseInt(process.env.TOMMY_TG_USER_ID || '0', 10);
const CARLOS_ID  = parseInt(process.env.CARLOS_TG_USER_ID || '6436074677', 10);
const OR_KEY     = process.env.OPENROUTER_API_KEY;
const OR_MODEL   = process.env.COLLAGLOW_BOT_MODEL || 'anthropic/claude-haiku-4-5';
const NOTIFY_PORT = parseInt(process.env.COLLAGLOW_BOT_PORT || '4120', 10);
const STATE_FILE = path.join(__dirname, 'state.json');
const CHATS_DIR  = path.join(__dirname, 'chats');
const KNOWLEDGE_DIR = path.join(__dirname, '../../..', 'knowledge');

// ─── Guards ─────────────────────────────────────────────────────────────────
if (!TOKEN) {
  console.warn('[collaglow-bot] COLLAGLOW_BOT_TOKEN fehlt — idle mode');
  http.createServer((req, res) => {
    if (req.url === '/health') return res.end(JSON.stringify({ ok: true, mode: 'idle', reason: 'no-token' }));
    res.writeHead(503).end('idle');
  }).listen(NOTIFY_PORT, '127.0.0.1');
  process.exit(0);
}

fs.mkdirSync(CHATS_DIR, { recursive: true });

// ─── State ──────────────────────────────────────────────────────────────────
let state = { lastUpdateId: 0 };
try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch {}
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

// ─── Persona + Knowledge ────────────────────────────────────────────────────
function loadPersona() {
  const parts = [];
  const knowledgeFiles = fs.existsSync(KNOWLEDGE_DIR)
    ? fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'))
    : [];

  parts.push(`Du bist der CollaGlow AI-Agent von AEVUM.
Dein Gesprächspartner ist Tommy (Ketolabs / CollaGlow).
Stil: direkt, datengetrieben, kein Bullshit. Zahlen über Gefühle.
Sprache: Deutsch. Fachbegriffe (ROAS, CPM, AOV etc.) ohne Erklärung.
Du kennst das Business: DTC E-Commerce, Meta Ads, Klaviyo, Kollagen-Supplements.`);

  for (const f of knowledgeFiles) {
    try {
      parts.push(fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf8'));
    } catch {}
  }
  return parts.join('\n\n---\n\n');
}

// ─── Chat history ────────────────────────────────────────────────────────────
const CHAT_TTL_MS = 2 * 60 * 60_000; // 2h
const CHAT_MAX    = 20;

function chatFile(id) { return path.join(CHATS_DIR, `${id}.json`); }
function loadHistory(id) {
  try {
    const c = JSON.parse(fs.readFileSync(chatFile(id), 'utf8'));
    if (c.expiresAt && Date.parse(c.expiresAt) < Date.now()) return [];
    return c.messages || [];
  } catch { return []; }
}
function saveHistory(id, messages) {
  fs.writeFileSync(chatFile(id), JSON.stringify({
    messages: messages.slice(-CHAT_MAX),
    expiresAt: new Date(Date.now() + CHAT_TTL_MS).toISOString()
  }, null, 2));
}

// ─── Telegram ────────────────────────────────────────────────────────────────
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

const send = (chat_id, text, extra = {}) =>
  tg('sendMessage', { chat_id, text, parse_mode: 'Markdown', ...extra });
const typing = chat_id => tg('sendChatAction', { chat_id, action: 'typing' });

// ─── LLM ────────────────────────────────────────────────────────────────────
async function llm(chat_id, userText) {
  if (!OR_KEY) return '⚠️ OpenRouter Key fehlt.';
  const history = loadHistory(chat_id);
  history.push({ role: 'user', content: userText });

  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const systemPrompt = `NOW: ${now} (Europe/Berlin)\n\n` + loadPersona();

  const body = JSON.stringify({
    model: OR_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...history],
    max_tokens: 800
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
        'X-Title': 'CollaGlow Agent'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          const reply = r.choices?.[0]?.message?.content || '⚠️ Keine Antwort vom Modell.';
          history.push({ role: 'assistant', content: reply });
          saveHistory(chat_id, history);
          resolve(reply);
        } catch { resolve('⚠️ Parse-Fehler.'); }
      });
    });
    req.on('error', () => resolve('⚠️ LLM nicht erreichbar.'));
    req.write(body); req.end();
  });
}

// ─── Notify endpoint (Carlos kann Alerts pushen) ─────────────────────────────
http.createServer(async (req, res) => {
  if (req.url === '/health') return res.end(JSON.stringify({ ok: true, mode: 'active' }));
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { chat_id, text } = JSON.parse(body);
        await send(chat_id || TOMMY_ID, text);
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400).end('bad request'); }
    });
  } else {
    res.writeHead(404).end();
  }
}).listen(NOTIFY_PORT, '127.0.0.1', () =>
  console.log(`[collaglow-bot] notify endpoint 127.0.0.1:${NOTIFY_PORT}`));

// ─── Commands ────────────────────────────────────────────────────────────────
async function handleCommand(cmd, chat_id) {
  if (cmd === '/start') {
    return send(chat_id, `👋 CollaGlow Agent aktiv.\n\nIch bin dein KI-Partner für Ketolabs/CollaGlow. Frag mich zu KPIs, Kampagnen, Alerts oder Business-Entscheidungen.\n\nCommands:\n/status — System-Status\n/reset — Chat zurücksetzen`);
  }
  if (cmd === '/status') {
    return send(chat_id, `✅ *CollaGlow Agent aktiv*\nModell: ${OR_MODEL}\nKnowledge-Files: ${fs.existsSync(KNOWLEDGE_DIR) ? fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md')).length : 0}`);
  }
  if (cmd === '/reset') {
    try { fs.writeFileSync(chatFile(chat_id), JSON.stringify({ messages: [], expiresAt: '' })); } catch {}
    return send(chat_id, '🔄 Chat-History gelöscht.');
  }
}

// ─── Update loop ─────────────────────────────────────────────────────────────
const ALLOWED = new Set([TOMMY_ID, CARLOS_ID].filter(Boolean));

async function poll() {
  const result = await tg('getUpdates', {
    offset: state.lastUpdateId + 1,
    timeout: 30,
    allowed_updates: ['message']
  });

  for (const update of (result.result || [])) {
    state.lastUpdateId = update.update_id;
    const msg = update.message;
    if (!msg?.text) continue;

    const chat_id = msg.chat.id;
    if (!ALLOWED.has(chat_id)) {
      await send(chat_id, '⛔ Kein Zugang.');
      continue;
    }

    const text = msg.text.trim();
    if (text.startsWith('/')) {
      await handleCommand(text.split(' ')[0], chat_id);
    } else {
      await typing(chat_id);
      const reply = await llm(chat_id, text);
      await send(chat_id, reply);
    }
  }

  saveState();
  setTimeout(poll, 100);
}

console.log(`[collaglow-bot] Start — Tommy: ${TOMMY_ID}, Carlos: ${CARLOS_ID}`);
poll();
