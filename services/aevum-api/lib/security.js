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

// Lightweight sanitizer — removes null bytes + control chars, trims
export function clean(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // strip control chars
    .trim();
}
