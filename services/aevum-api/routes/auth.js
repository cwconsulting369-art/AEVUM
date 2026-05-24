// /api/auth — Magic-Link request + verify (Customer-Portal login)
// SECURITY: single-use enforcement via magic_link_used table.
// Mail-Versand via Mailbox.org SMTP (lib/mailer.js).

import { Router } from 'express';
import { z } from 'zod';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { supabase } from '../lib/supabase.js';
import { issueJwt, issueMagicLinkToken, verifyJwt, verifyMagicLinkToken } from '../lib/crypto.js';
import { mailer, magicLinkHtml, magicLinkText } from '../lib/mailer.js';
import { anonymizeIp, hashToken, maskEmail } from '../lib/security.js';

export const authRouter = Router();

function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip || 'unknown';
}

// Strict per-IP limit on magic-link requests (anti-spam)
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
  message: { ok: false, error: 'rate_limit_magic_link' }
});

// Anti-brute-force on verify endpoint
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
  message: { ok: false, error: 'rate_limit_verify' }
});

const PORTAL_BASE = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';

// ────────────────────────────────────────────────────────────
// POST /api/auth/magic-link/request
// ────────────────────────────────────────────────────────────
const RequestSchema = z.object({
  email: z.string().email().max(200).transform((s) => s.toLowerCase()),
  purpose: z.enum(['login', 'invite']).optional().default('login')
});

authRouter.post('/magic-link/request', magicLinkLimiter, async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const { email, purpose } = parsed.data;

  const accRes = await supabase.select('accounts', `select=id,name,email,status&email=eq.${encodeURIComponent(email)}`);
  const account = accRes.data?.[0];

  // Anti-enumeration: respond ok:true even if no account
  if (!account) {
    console.log(`[auth] magic-link requested for unknown: ${maskEmail(email)}`);
    return res.json({ ok: true, sent: true });
  }
  if (account.status === 'churned') {
    return res.json({ ok: true, sent: true });
  }

  const token = issueMagicLinkToken({
    account_id: account.id,
    email: account.email,
    purpose,
    ttlSeconds: 60 * 30
  });
  // Portal-Frontend (/auth/verify route, function ut()) liest token via
  // useSearchParams().get("token") = Query-Param. Fragment funktioniert nicht.
  const link = `${PORTAL_BASE}/auth/verify?token=${encodeURIComponent(token)}`;

  await mailer.send({
    to: account.email,
    subject: purpose === 'invite' ? 'Dein AEVUM-Onboarding' : 'Dein AEVUM-Login-Link',
    html: magicLinkHtml({ name: account.name, link, purpose }),
    text: magicLinkText({ name: account.name, link, purpose })
  });

  res.json({ ok: true, sent: true });
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/magic-link/issue-direct  (admin-token gated)
// Gibt den Link DIRECT zurück (kein Mail-Versand) — für Customer-Bots
// die Magic-Link direkt an Owner via Telegram pushen.
// SECURITY: nur mit AEVUM_ADMIN_TOKEN aufrufbar.
// ────────────────────────────────────────────────────────────
authRouter.post('/magic-link/issue-direct', async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!adminToken || !expected || adminToken !== expected) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const { email, purpose } = parsed.data;

  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status&email=eq.${encodeURIComponent(email)}`);
  const account = accRes.data?.[0];
  if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });
  if (account.status === 'churned') return res.status(403).json({ ok: false, error: 'account_inactive' });

  const token = issueMagicLinkToken({
    account_id: account.id,
    email: account.email,
    purpose,
    ttlSeconds: 60 * 30
  });
  const link = `${PORTAL_BASE}/auth/verify?token=${encodeURIComponent(token)}`;

  console.log(`[auth] direct magic-link issued for ${maskEmail(account.email)} (slug=${account.slug})`);

  res.json({
    ok: true,
    link,
    token,
    account: { id: account.id, slug: account.slug, email: account.email, name: account.name },
    expires_in: 1800
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/magic-link/verify
// ────────────────────────────────────────────────────────────
const VerifySchema = z.object({ token: z.string().min(20).max(2000) });

authRouter.post('/magic-link/verify', verifyLimiter, async (req, res) => {
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const claims = verifyMagicLinkToken(parsed.data.token);
  if (!claims) return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });

  // CR-01: single-use enforcement — reject already-consumed tokens
  const tokenHash = hashToken(parsed.data.token);
  const used = await supabase.select('magic_link_used', `select=token_hash&token_hash=eq.${tokenHash}&limit=1`);
  if (used.data?.length) {
    return res.status(401).json({ ok: false, error: 'token_already_used' });
  }

  // Re-check account still exists + not churned
  // B1-v2: additionally fetch account_type + has_agent_access for JWT claim (with safe defaults)
  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status,account_type,has_agent_access&id=eq.${claims.account_id}`);
  const account = accRes.data?.[0];
  if (!account || account.status === 'churned') {
    return res.status(401).json({ ok: false, error: 'account_inactive' });
  }
  if (account.email.toLowerCase() !== claims.email.toLowerCase()) {
    return res.status(401).json({ ok: false, error: 'email_mismatch' });
  }

  // Mark consumed BEFORE issuing JWT (PK collision = parallel race-loser)
  const consume = await supabase.insert('magic_link_used', {
    token_hash: tokenHash,
    email: account.email,
    ip_anonymized: anonymizeIp(clientIp(req))
  });
  if (!consume.ok) {
    return res.status(401).json({ ok: false, error: 'token_already_used' });
  }

  // B1-v2: safe defaults for legacy accounts that pre-date mig019
  const accountType = account.account_type || 'customer';
  const hasAgentAccess = account.has_agent_access ?? true;

  const accessToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    account_type: accountType,
    has_agent_access: hasAgentAccess,
    scope: 'customer'
  }, 60 * 60);
  const refreshToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    account_type: accountType,
    has_agent_access: hasAgentAccess,
    scope: 'refresh'
  }, 60 * 60 * 24 * 30);

  res.json({
    ok: true,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    account: {
      id: account.id,
      slug: account.slug,
      name: account.name,
      email: account.email,
      account_type: accountType,
      has_agent_access: hasAgentAccess
    }
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ────────────────────────────────────────────────────────────
const RefreshSchema = z.object({ refresh_token: z.string().min(20).max(2000) });

authRouter.post('/refresh', async (req, res) => {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const claims = verifyJwt(parsed.data.refresh_token);
  if (!claims || claims.scope !== 'refresh') return res.status(401).json({ ok: false, error: 'invalid_refresh_token' });

  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status,account_type,has_agent_access&id=eq.${claims.account_id}`);
  const account = accRes.data?.[0];
  if (!account || account.status === 'churned') return res.status(401).json({ ok: false, error: 'account_inactive' });

  // B1-v2: re-emit account_type + has_agent_access on refresh (safe defaults for legacy)
  const accessToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    account_type: account.account_type || 'customer',
    has_agent_access: account.has_agent_access ?? true,
    scope: 'customer'
  }, 60 * 60);

  res.json({ ok: true, access_token: accessToken, expires_in: 3600 });
});
