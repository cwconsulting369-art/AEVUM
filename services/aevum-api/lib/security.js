// Input-sanitization + suspicious pattern detection
// Reject obvious code-injection / XSS / weird payloads BEFORE persisting
// + Internal "firewall" helpers: IP anonymization, timing-safe token compare,
//   email masking. Single source of truth — every route imports from here.

import { timingSafeEqual, createHash, randomBytes } from 'node:crypto';

// IP anonymization — IPv4 /24, IPv6 /64. Returns null for unknown/empty.
// Use this EVERYWHERE before persisting an IP. Datenschutzerklärung promises
// 30-day rolling anonymization, but for non-essential telemetry we anonymize
// at write-time.
export function anonymizeIp(ip) {
  if (!ip || typeof ip !== 'string' || ip === 'unknown') return null;
  const clean = ip.trim();
  if (clean.includes(':')) {
    const parts = clean.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }
  const parts = clean.split('.');
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return null;
}

// Timing-safe equality check for tokens / secrets.
// Returns false on any length mismatch or invalid input — never throws.
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

// Hash an arbitrary token (sha256/hex). Used for magic-link single-use tracking
// and DSGVO challenge-token lookups.
export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

// Cryptographically strong random token (URL-safe base64, no padding).
export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

// Mask an email for logging: "carlos.wrusch@example.com" → "c***@example.com"
export function maskEmail(email) {
  if (typeof email !== 'string') return '***';
  const at = email.indexOf('@');
  if (at < 1) return '***';
  return email[0] + '***' + email.slice(at);
}


// Patterns that indicate code/script/injection attempts (HARD REJECT)
const ATTACK_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on(load|error|click|mouse|focus|blur|submit|change)\s*=/i,
  /eval\s*\(/i,
  /document\.(cookie|write|location)/i,
  /window\.(location|open)/i,
  /\.innerHTML\s*=/i,
  /<\?php/i,
  /<%[=@]/,
  /\$\{.+\}/,  // template-string injection
  /\{\{.+\}\}/,  // handlebars/jinja injection
  /\bSELECT\s+.+\s+FROM\b/i,
  /\bUNION\s+SELECT\b/i,
  /\bDROP\s+(TABLE|DATABASE)\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bINSERT\s+INTO\s+.+\s+VALUES\b/i,
  /'\s*OR\s+'?1'?\s*=\s*'?1/i,         // classic SQLi
  /';\s*DROP\s+TABLE/i,
  /\bEXEC\s+sp_/i,
  /\bxp_cmdshell\b/i,
  /\.\.[\/\\]/,                       // path traversal
  /;\s*rm\s+-rf/i,                       // shell injection
  /&&\s*cat\s+\/etc/i,
  /\|\s*nc\s+-/i,
  /\$\(\s*curl\b/i,
  /https?:\/\/(localhost|127\.0\.0\.1|169\.254\.)/i, // SSRF / AWS metadata
  /\x00/,                                 // null byte
  /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/, // control chars (except \n\r\t)
];

// Char classes that look like trying to escape into shell/code
const SHELL_INJECTION = /[;&|`$()]\s*(rm|wget|curl|nc|bash|sh|python|perl|eval)\b/i;

// Prompt-injection patterns — soft-flag (don't reject, log + sandwich the user msg)
const PROMPT_INJECTION_PATTERNS = [
  /\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts?|rules?)/i,
  /\bdisregard\s+(your|the|all)\s+(prompt|instructions|rules)/i,
  /\byou\s+are\s+now\s+/i,
  /\bact\s+as\s+(a\s+|an\s+)/i,
  /^\s*system\s*:/im,
  /###\s*system/i,
  /\bDAN\s+mode\b/i,
  /\bjailbreak/i,
  /\bdeveloper\s+mode\b/i,
  /forget\s+(everything|all|previous)/i,
];

export function detectAttack(text) {
  if (typeof text !== 'string') return null;
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(text)) return `matched: ${pattern.source.slice(0, 50)}`;
  }
  if (SHELL_INJECTION.test(text)) return 'matched: shell_injection';
  return null;
}

// Returns null if no signal, else a string describing which prompt-injection
// pattern matched. Used by helpbot to sandwich the input (NOT to reject).
export function detectPromptInjection(text) {
  if (typeof text !== 'string') return null;
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) return `prompt_injection: ${pattern.source.slice(0, 60)}`;
  }
  return null;
}

// Special-char-flood detector — true if >50% non-alphanumeric chars (after whitespace strip).
// Ignores short messages (<20 chars after strip) so emoji-only "hi 👋" etc. still pass.
export function isSpecialCharFlood(text, threshold = 0.5) {
  if (typeof text !== 'string') return false;
  const stripped = text.replace(/\s/g, '');
  if (stripped.length < 20) return false;
  const nonAlpha = stripped.replace(/[a-zA-Z0-9äöüÄÖÜß]/g, '').length;
  return (nonAlpha / stripped.length) > threshold;
}

// Scan all string values in an object for attacks
export function scanPayload(obj) {
  const findings = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const hit = detectAttack(value);
      if (hit) findings.push({ field: key, reason: hit });
    }
  }
  return findings;
}

// ─── D3 Security-Firewall Extensions ─────────────────────────

// Known-bot UA fingerprints (case-insensitive). Curl/wget/python-requests
// are *not* in here — server-to-server calls (e.g., n8n webhooks) use them.
// We block ONLY clearly malicious scraper/scanner bots.
const HOSTILE_BOT_UAS = [
  /\bsemrushbot\b/i,
  /\bahrefsbot\b/i,
  /\bdotbot\b/i,
  /\bmj12bot\b/i,
  /\bblexbot\b/i,
  /\bpetalbot\b/i,
  /\bnimbostratus\b/i,
  /\bzgrab\b/i,
  /\bmasscan\b/i,
  /\bnessus\b/i,
  /\bnikto\b/i,
  /\bsqlmap\b/i,
  /\bnmap\b/i,
  /\bcommix\b/i,
  /\bwpscan\b/i,
  /\bsearchpreview\b/i,
];

// Returns the matched pattern source if hostile, else null.
export function detectHostileBot(userAgent) {
  if (typeof userAgent !== 'string' || !userAgent) return null;
  for (const re of HOSTILE_BOT_UAS) {
    if (re.test(userAgent)) return re.source;
  }
  return null;
}

// Generate a per-request UUID for request-tracing / debugging.
// Uses Node crypto.randomUUID (Node >= 19); falls back to randomBytes.
export function genRequestId() {
  try {
    // node:crypto.randomUUID is available globally as crypto.randomUUID
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return randomBytes(16).toString('hex');
}

// Express middleware: assign req.id from X-Request-Id header (if trusted) or generate one.
// Echoes back as X-Request-Id response header.
export function requestIdMiddleware(req, res, next) {
  const incoming = req.headers['x-request-id'];
  const safe = typeof incoming === 'string' && /^[a-zA-Z0-9_-]{4,128}$/.test(incoming);
  req.id = safe ? incoming : genRequestId();
  res.setHeader('X-Request-Id', req.id);
  next();
}

// Express middleware: hard-reject hostile bots BEFORE rate-limit + LLM-calls.
export function hostileBotGuard(req, res, next) {
  const ua = req.get('user-agent') || '';
  const hit = detectHostileBot(ua);
  if (hit) {
    console.warn(`[security] hostile_bot rid=${req.id || '-'} ua="${ua.slice(0, 80)}" pattern=${hit}`);
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  next();
}

// Express middleware: protect /api/admin/* paths with timing-safe Bearer-token check.
// Token comes from ADMIN_API_KEY env (separate from AEVUM_ADMIN_TOKEN, which gates per-route admin endpoints).
// ADMIN_API_KEY is for ops/debug endpoints that should never be exposed to customers.
export function adminApiKeyGuard(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    // Fail closed — admin endpoint must have a key configured
    console.error(`[security] ADMIN_API_KEY not configured — rejecting ${req.path}`);
    return res.status(503).json({ ok: false, error: 'admin_not_configured' });
  }
  const auth = req.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeCompare(bearer, expected)) {
    console.warn(`[security] admin_key_invalid rid=${req.id || '-'} path=${req.path}`);
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// Lightweight sanitizer — removes null bytes + control chars, trims
export function clean(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // strip control chars
    .trim();
}
