// AEVUM v2 — Crypto helpers
// AES-256-GCM for customer-api-key storage
// JWT (HS256) for customer-portal auth
// Magic-Link tokens (signed + time-limited)
//
// All use Node built-in `crypto` — no external deps.

import { randomBytes, createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'node:crypto';

// ────────────────────────────────────────────────────────────
// AES-256-GCM (customer_apis.key_encrypted, project_apis.key_encrypted)
// Format: base64(iv | authTag | ciphertext)
// ────────────────────────────────────────────────────────────
function getMasterKey() {
  const hex = process.env.AEVUM_ENCRYPTION_MASTER_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('AEVUM_ENCRYPTION_MASTER_KEY missing or not 32 bytes hex');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plaintext) {
  if (typeof plaintext !== 'string' || !plaintext) {
    throw new Error('encryptSecret: plaintext required');
  }
  const key = getMasterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

export function decryptSecret(b64) {
  const key = getMasterKey();
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 12 + 16 + 1) throw new Error('decryptSecret: invalid payload');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const dec = createDecipheriv('aes-256-gcm', key, iv);
  dec.setAuthTag(tag);
  return Buffer.concat([dec.update(ct), dec.final()]).toString('utf8');
}

// ────────────────────────────────────────────────────────────
// JWT (HS256, custom implementation — no `jsonwebtoken` dep)
// Token format: base64url(header).base64url(payload).base64url(sig)
// Payload: { sub, account_id, exp, iat, scope }
// ────────────────────────────────────────────────────────────
function b64urlEncode(input) {
  const b = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function getJwtSecret() {
  const s = process.env.AEVUM_JWT_SECRET;
  if (!s) throw new Error('AEVUM_JWT_SECRET missing');
  return Buffer.from(s, 'hex');
}

export function issueJwt(payload, ttlSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + ttlSeconds };
  const h = b64urlEncode(JSON.stringify(header));
  const p = b64urlEncode(JSON.stringify(claims));
  const data = `${h}.${p}`;
  const sig = createHmac('sha256', getJwtSecret()).update(data).digest();
  return `${data}.${b64urlEncode(sig)}`;
}

export function verifyJwt(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expectedSig = createHmac('sha256', getJwtSecret()).update(data).digest();
  const providedSig = b64urlDecode(s);
  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;
  try {
    const claims = JSON.parse(b64urlDecode(p).toString('utf8'));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Magic-Link tokens (HMAC + expiry)
// Format: base64url(payload).base64url(sig)
// Payload: { account_id, email, purpose, exp, nonce }
// purpose: 'invite' (first onboarding) | 'login' (re-auth) | 'verify' (email-change)
// ────────────────────────────────────────────────────────────
function getMagicLinkSecret() {
  const s = process.env.AEVUM_MAGIC_LINK_SECRET;
  if (!s) throw new Error('AEVUM_MAGIC_LINK_SECRET missing');
  return Buffer.from(s, 'hex');
}

export function issueMagicLinkToken({ account_id, email, purpose = 'login', ttlSeconds = 60 * 30 }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    account_id,
    email,
    purpose,
    exp: now + ttlSeconds,
    iat: now,
    nonce: randomBytes(12).toString('hex')
  };
  const p = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac('sha256', getMagicLinkSecret()).update(p).digest();
  return `${p}.${b64urlEncode(sig)}`;
}

export function verifyMagicLinkToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [p, s] = parts;
  const expectedSig = createHmac('sha256', getMagicLinkSecret()).update(p).digest();
  const providedSig = b64urlDecode(s);
  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(p).toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Express middleware: requireCustomerAuth
// Reads Bearer-Token from Authorization header, verifies JWT, attaches req.customer
// ────────────────────────────────────────────────────────────
export function requireCustomerAuth(req, res, next) {
  const h = req.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ ok: false, error: 'no_bearer_token' });
  const claims = verifyJwt(m[1]);
  if (!claims) return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });
  req.customer = claims;
  next();
}
