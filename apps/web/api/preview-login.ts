export const config = { runtime: 'edge' };

const COOKIE_NAME = 'aevum_preview_token';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function loginPageHtml(error: string, next: string): string {
  const nextEsc = next.replace(/"/g, '&quot;');
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>AEVUM — Preview Access</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;height:100%;background:#0B0C10;color:#E5E7EB;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{width:100%;max-width:420px;background:#111317;border:1px solid #1F2937;border-radius:16px;padding:40px 32px;box-shadow:0 24px 64px rgba(0,0,0,.4)}
  .brand{font-size:28px;font-weight:700;letter-spacing:.02em;margin:0 0 8px;color:#F59E0B}
  .sub{font-size:13px;color:#9CA3AF;margin:0 0 28px;line-height:1.55}
  label{display:block;font-size:12px;font-weight:500;color:#9CA3AF;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px}
  input{width:100%;background:#0B0C10;border:1px solid #1F2937;color:#E5E7EB;padding:12px 14px;border-radius:10px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s}
  input:focus{border-color:#F59E0B}
  .field{margin:0 0 18px}
  button{width:100%;background:#F59E0B;color:#0B0C10;border:0;padding:13px;border-radius:10px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;letter-spacing:.02em;transition:background .15s;margin-top:8px}
  button:hover{background:#FBBF24}
  .err{background:rgba(220,38,38,.12);border:1px solid rgba(220,38,38,.4);color:#FCA5A5;padding:10px 12px;border-radius:8px;font-size:13px;margin:0 0 16px}
  .foot{margin-top:24px;font-size:11px;color:#6B7280;text-align:center;line-height:1.6}
  .foot a{color:#9CA3AF;text-decoration:none;border-bottom:1px solid #374151}
  .foot a:hover{color:#F59E0B}
</style>
</head>
<body>
<div class="wrap">
  <main class="card">
    <h1 class="brand">AEVUM</h1>
    <p class="sub">AEVUM ist gerade in finaler Vorbereitungsphase. Live-Launch in Kürze. Falls du bereits Zugangsdaten hast, logge dich hier ein.</p>
    <div class="err">${error.replace(/</g, '&lt;')}</div>
    <form method="POST" action="/api/preview-login">
      <input type="hidden" name="next" value="${nextEsc}" />
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" autocomplete="username" autofocus required />
      </div>
      <div class="field">
        <label for="password">Passwort</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
      </div>
      <button type="submit">Zugang freischalten</button>
    </form>
    <div class="foot">
      <a href="/impressum">Impressum</a> &middot; <a href="/datenschutz">Datenschutz</a> &middot; <a href="/agb">AGB</a>
    </div>
  </main>
</div>
</body>
</html>`;
}

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/';
  // Only allow same-origin relative paths starting with single "/"
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  if (raw.startsWith('/api/preview-login')) return '/';
  return raw;
}

export default async function handler(req: Request): Promise<Response> {
  const expectedUser = process.env.AEVUM_PREVIEW_USER || '';
  const expectedPassword = process.env.AEVUM_PREVIEW_PASSWORD || '';
  const secret = process.env.AEVUM_PREVIEW_SECRET || '';

  // GET → render login page (so direct visits to /api/preview-login don't 404)
  if (req.method === 'GET') {
    const u = new URL(req.url);
    const next = sanitizeNext(u.searchParams.get('next'));
    return new Response(loginPageHtml('', next), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });
  }

  if (!expectedUser || !expectedPassword || !secret) {
    return new Response('Preview wall not configured. Set AEVUM_PREVIEW_USER, AEVUM_PREVIEW_PASSWORD, AEVUM_PREVIEW_SECRET.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  let username = '';
  let password = '';
  let next = '/';

  const ctype = req.headers.get('content-type') || '';
  try {
    if (ctype.includes('application/json')) {
      const j = (await req.json()) as Record<string, unknown>;
      username = String(j.username || '');
      password = String(j.password || '');
      next = sanitizeNext(typeof j.next === 'string' ? j.next : null);
    } else {
      const fd = await req.formData();
      username = String(fd.get('username') || '');
      password = String(fd.get('password') || '');
      next = sanitizeNext((fd.get('next') as string | null) || null);
    }
  } catch {
    return new Response(loginPageHtml('Ungültige Anfrage.', '/'), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  // Constant-time-ish compare
  const userOk = username.length === expectedUser.length && username === expectedUser;
  const passOk = password.length === expectedPassword.length && password === expectedPassword;

  if (!userOk || !passOk) {
    return new Response(loginPageHtml('Falsches Passwort.', next), {
      status: 401,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  const token = await hmacSha256Hex(secret, expectedUser);
  const cookie = [
    `aevum_preview_token=${token}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ');

  return new Response(null, {
    status: 303,
    headers: {
      'set-cookie': cookie,
      location: next || '/',
      'cache-control': 'no-store',
    },
  });
}
