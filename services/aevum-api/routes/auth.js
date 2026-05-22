// /api/auth — Magic-Link request + verify (Customer-Portal login)
//
// POST /api/auth/magic-link/request   { email }
//   - Looks up account by email
//   - Issues magic-link token + sends via Resend
//   - Always returns ok:true (no email-enumeration)
//
// POST /api/auth/magic-link/verify    { token }
//   - Verifies magic-link token
//   - Issues short-lived access JWT + long-lived refresh JWT
//
// POST /api/auth/refresh              { refresh_token }
//   - Issues new access token from refresh

import { Router } from 'express';
import { z } from 'zod';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { supabase } from '../lib/supabase.js';
import { issueJwt, issueMagicLinkToken, verifyJwt, verifyMagicLinkToken } from '../lib/crypto.js';
import { mailer, magicLinkHtml, magicLinkText } from '../lib/mailer.js';

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

const PORTAL_BASE = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';

// ────────────────────────────────────────────────────────────
// POST /api/auth/magic-link/request
// ────────────────────────────────────────────────────────────
const RequestSchema = z.object({
  email: z.string().email().max(200),
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
    console.log(`[auth] magic-link requested for unknown email: ${email}`);
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
// POST /api/auth/magic-link/verify
// ────────────────────────────────────────────────────────────
const VerifySchema = z.object({ token: z.string().min(20).max(2000) });

authRouter.post('/magic-link/verify', async (req, res) => {
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const claims = verifyMagicLinkToken(parsed.data.token);
  if (!claims) return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });

  // Re-check account still exists + not churned
  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status&id=eq.${claims.account_id}`);
  const account = accRes.data?.[0];
  if (!account || account.status === 'churned') {
    return res.status(401).json({ ok: false, error: 'account_inactive' });
  }
  if (account.email.toLowerCase() !== claims.email.toLowerCase()) {
    return res.status(401).json({ ok: false, error: 'email_mismatch' });
  }

  const accessToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    scope: 'customer'
  }, 60 * 60);
  const refreshToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    scope: 'refresh'
  }, 60 * 60 * 24 * 30);

  res.json({
    ok: true,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    account: { id: account.id, slug: account.slug, name: account.name, email: account.email }
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

  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status&id=eq.${claims.account_id}`);
  const account = accRes.data?.[0];
  if (!account || account.status === 'churned') return res.status(401).json({ ok: false, error: 'account_inactive' });

  const accessToken = issueJwt({
    sub: account.id,
    account_id: account.id,
    account_slug: account.slug,
    scope: 'customer'
  }, 60 * 60);

  res.json({ ok: true, access_token: accessToken, expires_in: 3600 });
});
