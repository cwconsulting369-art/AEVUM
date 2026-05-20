import { next } from '@vercel/functions';

// Run on every route; we filter manually inside (matcher regex on Vercel
// non-Next builds can be brittle, and the wall must never accidentally
// skip a route).
export const config = {
  matcher: '/:path*',
};

const COOKIE_NAME = 'aevum_preview_token';

const PUBLIC_PATHS = new Set<string>([
  '/impressum',
  '/datenschutz',
  '/agb',
  '/widerrufsbelehrung',
  '/robots.txt',
  '/sitemap.xml',
  '/api/preview-login',
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/assets/')) return true;
  if (pathname.startsWith('/favicon')) return true;
  // Treat any path ending in a file extension (other than .html) as a static asset.
  const lastSeg = pathname.split('/').pop() || '';
  if (lastSeg.includes('.') && !lastSeg.endsWith('.html')) return true;
  return false;
}

function parseCookie(header: string | null, name: string): string {
  if (!header) return '';
  const parts = header.split(/;\s*/);
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return '';
}

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

async function verifyToken(token: string, user: string, secret: string): Promise<boolean> {
  if (!token || !user || !secret) return false;
  const expected = await hmacSha256Hex(secret, user);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function loginPageHtml(next?: string): string {
  const nextEsc = (next || '/').replace(/"/g, '&quot;').replace(/</g, '&lt;');
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

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const mode = (process.env.AEVUM_PREVIEW_MODE || '').toLowerCase();
  const wallActive = mode === 'true' || mode === '1' || mode === 'on';

  // Defensive default — wall OFF unless explicitly turned on
  if (!wallActive) return next();

  // Public paths (legal pages, static assets, login endpoint) — always pass
  if (isPublicPath(pathname)) return next();

  // Misconfig safety — never lock the site if user/secret missing
  const user = process.env.AEVUM_PREVIEW_USER || '';
  const secret = process.env.AEVUM_PREVIEW_SECRET || '';
  if (!user || !secret) return next();

  const token = parseCookie(request.headers.get('cookie'), COOKIE_NAME);
  const authed = await verifyToken(token, user, secret);

  if (authed) return next();

  // Not authed → render login page inline
  const goto = pathname + (url.search || '');
  return new Response(loginPageHtml(goto), {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-aevum-wall': 'block',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
