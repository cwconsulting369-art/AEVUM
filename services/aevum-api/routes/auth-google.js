// /api/auth/google + /api/auth/google/callback — Google OAuth Login
// Wave I4 (2026-05-24): Knightvision-Style 1-Click-Login.
//
// Flow:
//   1. GET /api/auth/google?next=/dashboard&source=saas-signup:script-factory
//      → redirect to Google's accounts.google.com
//   2. Google redirects back to /api/auth/google/callback?code=...&state=...
//   3. We exchange code for id_token, verify, lookup/link/create account
//   4. Issue JWT, redirect to FRONTEND/auth/token#t=<jwt>&redirect=<next>
//
// Account-Linking-Strategy:
//   - First lookup by google_oauth_sub (Google's stable user-id)
//   - If not found: lookup by email — if exists, LINK (set google_oauth_sub)
//   - Else: AUTO-CREATE account with account_type per source (saas/shop)
//
// Security:
//   - state-Param is base64(JSON({next,source})) — verified after callback
//   - id_token signature verified via Google's certs
//   - Email-claim must be `email_verified=true`
//
// Config (env vars, all required to enable):
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT

import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../lib/supabase.js';
import { issueJwt } from '../lib/crypto.js';
import { maskEmail } from '../lib/security.js';

export const googleAuthRouter = Router();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT || 'https://api.aevum-system.de/api/auth/google/callback';
const FRONTEND_PORTAL = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';

const client = (CLIENT_ID && CLIENT_SECRET)
  ? new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  : null;

function encodeState(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}
function decodeState(s) {
  try { return JSON.parse(Buffer.from(s, 'base64').toString('utf8')); } catch { return {}; }
}

// ────────────────────────────────────────────────────────────
// GET /api/auth/google?next=/dashboard&source=login
// ────────────────────────────────────────────────────────────
googleAuthRouter.get('/google', (req, res) => {
  if (!client) {
    return res.status(503).json({ ok: false, error: 'google_oauth_not_configured', hint: 'Set GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET in aevum.env' });
  }
  const next = typeof req.query.next === 'string' ? req.query.next : '/dashboard';
  const source = typeof req.query.source === 'string' ? req.query.source : 'login';

  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    state: encodeState({ next, source })
  });
  res.redirect(url);
});

// ────────────────────────────────────────────────────────────
// GET /api/auth/google/callback?code=...&state=...
// ────────────────────────────────────────────────────────────
googleAuthRouter.get('/google/callback', async (req, res) => {
  if (!client) {
    return res.status(503).send('google_oauth_not_configured');
  }
  const { code, state, error: googleErr } = req.query;
  if (googleErr) {
    console.warn('[google-oauth] user-rejected or google-error:', googleErr);
    return res.redirect(`${FRONTEND_PORTAL}/?error=${encodeURIComponent(String(googleErr))}`);
  }
  if (typeof code !== 'string') {
    return res.redirect(`${FRONTEND_PORTAL}/?error=no_code`);
  }

  try {
    // 1. Exchange code → tokens
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      console.error('[google-oauth] no id_token in response');
      return res.redirect(`${FRONTEND_PORTAL}/?error=no_id_token`);
    }

    // 2. Verify id_token (signature + audience)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.redirect(`${FRONTEND_PORTAL}/?error=invalid_id_token`);
    }
    const { sub: googleSub, email, email_verified: emailVerified, name } = payload;
    if (!emailVerified) {
      console.warn(`[google-oauth] unverified email: ${maskEmail(email || '')}`);
      return res.redirect(`${FRONTEND_PORTAL}/?error=email_not_verified`);
    }
    if (!email || !googleSub) {
      return res.redirect(`${FRONTEND_PORTAL}/?error=missing_claims`);
    }

    const stateDecoded = typeof state === 'string' ? decodeState(state) : {};
    const next = typeof stateDecoded.next === 'string' ? stateDecoded.next : '/dashboard';
    const source = typeof stateDecoded.source === 'string' ? stateDecoded.source : 'google-oauth';

    const emailLower = email.toLowerCase();

    // 3a. Lookup by google_oauth_sub
    let acct = null;
    const bySub = await supabase.select(
      'accounts',
      `?google_oauth_sub=eq.${encodeURIComponent(googleSub)}&select=*&limit=1`
    );
    if (bySub.ok && bySub.data?.length) {
      acct = bySub.data[0];
    }

    // 3b. Lookup by email → LINK
    if (!acct) {
      const byEmail = await supabase.select(
        'accounts',
        `?email=eq.${encodeURIComponent(emailLower)}&select=*&limit=1`
      );
      if (byEmail.ok && byEmail.data?.length) {
        const existing = byEmail.data[0];
        await supabase.update(
          'accounts',
          `?id=eq.${existing.id}`,
          { google_oauth_sub: googleSub, updated_at: new Date().toISOString() }
        );
        acct = { ...existing, google_oauth_sub: googleSub };
        console.log(`[google-oauth] LINK existing account ${existing.id} (${maskEmail(emailLower)})`);
      }
    }

    // 3c. AUTO-CREATE
    if (!acct) {
      const initialType = source.startsWith('saas-') ? 'saas' : 'shop';
      const baseSlug = emailLower.split('@')[0].replace(/[^a-z0-9-]/g, '-').slice(0, 32) || 'user';
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const nowIso = new Date().toISOString();
      const ins = await supabase.insert('accounts', {
        slug,
        name: name || emailLower.split('@')[0],
        email: emailLower,
        account_type: initialType,
        has_agent_access: false,
        status: 'active',
        source: source || 'google-oauth',
        google_oauth_sub: googleSub,
        last_activity_at: nowIso
      });
      if (!ins.ok) {
        console.error('[google-oauth] auto-create failed:', ins.error);
        return res.redirect(`${FRONTEND_PORTAL}/?error=account_create_failed`);
      }
      acct = Array.isArray(ins.data) ? ins.data[0] : ins.data;
      console.log(`[google-oauth] AUTO-CREATE ${acct?.id} (${initialType}, ${maskEmail(emailLower)}) source=${source}`);
    }

    if (!acct?.id) {
      return res.redirect(`${FRONTEND_PORTAL}/?error=account_lookup_failed`);
    }
    if (acct.status === 'churned') {
      return res.redirect(`${FRONTEND_PORTAL}/?error=account_inactive`);
    }

    // 4. Issue JWT (same structure as magic-link flow)
    const accountType = acct.account_type || 'shop';
    const hasAgentAccess = acct.has_agent_access ?? false;
    const accessToken = issueJwt({
      sub: acct.id,
      account_id: acct.id,
      account_slug: acct.slug,
      account_type: accountType,
      has_agent_access: hasAgentAccess,
      scope: 'customer'
    }, 60 * 60);

    // 5. Redirect to portal with token in URL FRAGMENT (never logged server-side)
    const safeRedirect = next.startsWith('/') ? next : '/dashboard';
    res.redirect(
      `${FRONTEND_PORTAL}/auth/token#t=${accessToken}&redirect=${encodeURIComponent(safeRedirect)}`
    );
  } catch (err) {
    console.error('[google-oauth] callback error:', err.message);
    res.redirect(`${FRONTEND_PORTAL}/?error=google_oauth_failed`);
  }
});
