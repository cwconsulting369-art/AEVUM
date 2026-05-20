const TOKEN = process.env.TG_LENNOX_BOT_TOKEN;
const CHAT_ID = process.env.TG_CARLOS_CHAT_ID;

// Escape underscores in plain-text segments so Telegram's legacy Markdown
// parser does not interpret `field_name` as italic and reject the message.
// We intentionally do NOT escape * or ` so existing bold/code formatting stays.
function escapeUnderscores(s) {
  return s.replace(/_/g, '\\_');
}

export async function notifyCarlos(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('TG not configured; skipping notify');
    return;
  }
  const safeText = escapeUnderscores(text);
  try {
    let res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: safeText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    if (!res.ok) {
      // Fallback: send as plain text without parse_mode so message still arrives
      const body = await res.text();
      console.error('TG markdown failed, retry plain:', res.status, body);
      res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          disable_web_page_preview: true
        })
      });
      if (!res.ok) {
        console.error('TG plain also failed:', res.status, await res.text());
      }
    }
  } catch (e) {
    console.error('TG send exception:', e.message);
  }
}
