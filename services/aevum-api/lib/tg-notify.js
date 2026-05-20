const TOKEN = process.env.TG_LENNOX_BOT_TOKEN;
const CHAT_ID = process.env.TG_CARLOS_CHAT_ID;

export async function notifyCarlos(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('TG not configured; skipping notify');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('TG send failed:', res.status, body);
    }
  } catch (e) {
    console.error('TG send exception:', e.message);
  }
}
