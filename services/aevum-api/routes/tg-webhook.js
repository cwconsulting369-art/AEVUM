// /api/tg-webhook/lennox-bot — Telegram Bot webhook receiver
//
// Security: Telegram-signed via `X-Telegram-Bot-Api-Secret-Token` header.
// Set the same secret via Telegram setWebhook secret_token=... and store in
// env TG_WEBHOOK_SECRET. Without a match, requests are silently ignored.
//
// Behaviour:
//   - Parse incoming message text.
//   - Match `^(approve|deny)\s+([A-Z][A-Z0-9]*\d+)$` (case-insensitive).
//   - On match: POST internally to /api/approval/:id/decide (with admin token).
//   - Reply to Carlos in chat: "✓ A7 approved" / "✗ A7 denied".
//
// We respond 200 to Telegram regardless to avoid retry-spam.

import { Router } from 'express';

export const tgWebhookRouter = Router();

const TG_TOKEN  = () => process.env.TG_LENNOX_BOT_TOKEN;
const ADMIN_TOK = () => process.env.AEVUM_ADMIN_TOKEN;
const SECRET    = () => process.env.TG_WEBHOOK_SECRET;
const ALLOWED_CHAT = () => process.env.TG_CARLOS_CHAT_ID;

const APPROVE_RX = /^\s*(approve|deny)\s+([A-Z][A-Z0-9]*\d+)\s*$/i;

async function tgReply(chatId, text) {
  const token = TG_TOKEN();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });
  } catch (e) {
    console.error('[tg-webhook] reply failed:', e?.message);
  }
}

async function decideInternal(req, id, decision) {
  // Hit our own /api/approval/:id/decide so all DB writes go through one path.
  // We're already running in-process, but a real HTTP call keeps the auth
  // surface uniform and exercises the route exactly as external callers would.
  const port = parseInt(process.env.PORT || '3210', 10);
  const url = `http://127.0.0.1:${port}/api/approval/${encodeURIComponent(id)}/decide`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-aevum-admin-token': ADMIN_TOK() || ''
    },
    body: JSON.stringify({ decision, decided_by: 'carlos' })
  });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

tgWebhookRouter.post('/lennox-bot', async (req, res) => {
  // 1. Secret token check — Telegram sets this header when registered with secret_token
  const expected = SECRET();
  if (!expected) {
    console.error('[tg-webhook] TG_WEBHOOK_SECRET not set — rejecting');
    return res.status(401).json({ ok: false });
  }
  const got = req.get('x-telegram-bot-api-secret-token');
  if (got !== expected) {
    console.warn('[tg-webhook] secret mismatch (header=', got ? 'present' : 'absent', ')');
    // 200 to avoid retry loop, but log the attempt
    return res.status(200).json({ ok: true, ignored: 'bad_secret' });
  }

  // 2. Pull message text + chat id
  const update = req.body || {};
  const msg = update.message || update.edited_message || update.channel_post;
  if (!msg) return res.status(200).json({ ok: true, ignored: 'no_message' });

  const chatId = String(msg.chat?.id || '');
  const text   = (msg.text || '').trim();

  // 3. Only respond to Carlos (defence-in-depth on top of secret token)
  const allowedChat = ALLOWED_CHAT();
  if (allowedChat && chatId !== String(allowedChat)) {
    console.warn(`[tg-webhook] ignoring message from chat ${chatId}`);
    return res.status(200).json({ ok: true, ignored: 'wrong_chat' });
  }

  // 4. Parse approve/deny command
  const m = APPROVE_RX.exec(text);
  if (!m) {
    return res.status(200).json({ ok: true, ignored: 'no_match' });
  }

  const cmd = m[1].toLowerCase();
  const id  = m[2].toUpperCase();
  const decision = cmd === 'approve' ? 'approved' : 'denied';

  // 5. Forward to decide-route
  let result;
  try {
    result = await decideInternal(req, id, decision);
  } catch (e) {
    console.error('[tg-webhook] decideInternal threw:', e?.message);
    await tgReply(chatId, `⚠️ ${id}: server error — try again later`);
    return res.status(200).json({ ok: true, error: 'internal' });
  }

  // 6. Reply in chat
  if (result.status === 200 || result.status === 201) {
    const sym = decision === 'approved' ? '✓' : '✗';
    await tgReply(chatId, `${sym} ${id} ${decision}`);
  } else if (result.status === 404) {
    await tgReply(chatId, `❓ ${id} not found`);
  } else if (result.status === 409) {
    const cur = result.body?.current_status;
    await tgReply(chatId, `↩ ${id} already ${cur || 'decided'}`);
  } else {
    await tgReply(chatId, `⚠️ ${id}: HTTP ${result.status}`);
  }

  res.status(200).json({ ok: true, id, decision, upstream: result.status });
});
