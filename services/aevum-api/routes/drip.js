// AEVUM Drip-Sequence — Orchestrator Endpoints
// =====================================================================
// Block A3 (2026-05-25)
//
// Admin-bearer-gated endpoints, called by n8n every 15min (or daily 09:00):
//   GET  /api/drip/due                   → list due signups
//   GET  /api/drip/content/:step?id=...  → render mail content for step
//   POST /api/drip/sent                  → log + advance drip_step
//   POST /api/drip/pause                 → manual pause (by email)
//   POST /api/drip/resume                → resume
//   GET  /api/drip/stats                 → drip-funnel stats (admin dashboard)
//   GET  /api/drip/health                → health
//
// Auth: Bearer ADMIN_API_TOKEN (same token as waitlist admin endpoints)

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { buildDripContent, listSteps, daysFromSignupForStep } from '../lib/drip-templates.js';

export const dripRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || process.env.AEVUM_ADMIN_TOKEN;
const MAX_BATCH = 50;
const MAX_STEP = 5;

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(503).json({ ok: false, error: 'admin_token_not_configured' });
  const auth = req.headers['authorization'] || '';
  const t = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
  if (t !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/drip/health
// ─────────────────────────────────────────────────────────────────────
dripRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'drip',
    steps_configured: listSteps(),
    has_admin_token: Boolean(ADMIN_TOKEN)
  });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/drip/due?limit=50
//   Returns waitlist rows where drip_next_at <= now() AND not paused
//   AND drip_step < 4 (Step 5 = manual trigger only)
// ─────────────────────────────────────────────────────────────────────
dripRouter.get('/due', requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || MAX_BATCH, MAX_BATCH);
  const nowIso = new Date().toISOString();
  const q = `?select=id,email,unsubscribe_token,drip_step,drip_next_at,interest_tier,status,ts`
    + `&drip_paused=eq.false`
    + `&drip_next_at=lte.${encodeURIComponent(nowIso)}`
    + `&drip_step=lt.4` // Step 5 is manual only
    + `&status=in.(pending,confirmed)`
    + `&order=drip_next_at.asc`
    + `&limit=${limit}`;
  const result = await supabase.select('launch_waitlist', q);
  if (!result.ok) {
    console.error('[drip:due] select failed:', result.error);
    return res.status(500).json({ ok: false, error: 'select_failed' });
  }
  const rows = (result.data || []).map(r => ({
    id: r.id,
    email: r.email,
    unsubscribe_token: r.unsubscribe_token,
    current_step: r.drip_step,
    next_step: r.drip_step + 1,
    due_at: r.drip_next_at,
    interest_tier: r.interest_tier,
    signup_ts: r.ts
  }));
  return res.json({ ok: true, count: rows.length, items: rows });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/drip/content/:step?id=<waitlist-uuid>
//   Returns {subject, html, plain} for the given step + signup
// ─────────────────────────────────────────────────────────────────────
const ContentParamSchema = z.object({
  step: z.coerce.number().int().min(2).max(MAX_STEP)
});
const ContentQuerySchema = z.object({
  id: z.string().uuid()
});

dripRouter.get('/content/:step', requireAdmin, async (req, res) => {
  const pParsed = ContentParamSchema.safeParse(req.params);
  const qParsed = ContentQuerySchema.safeParse(req.query);
  if (!pParsed.success || !qParsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }
  const { step } = pParsed.data;
  const { id } = qParsed.data;
  const result = await supabase.select(
    'launch_waitlist',
    `?select=id,email,unsubscribe_token,interest_tier&id=eq.${id}&limit=1`
  );
  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  const content = buildDripContent({ step, row: result.data[0] });
  if (!content) return res.status(400).json({ ok: false, error: 'unknown_step' });
  return res.json({
    ok: true,
    step,
    email: result.data[0].email,
    subject: content.subject,
    html: content.html,
    plain: content.plain
  });
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/drip/sent
//   Body: { waitlist_id, step, resend_message_id?, status?, error_message? }
//   Logs send + advances drip_step + schedules next drip_next_at
// ─────────────────────────────────────────────────────────────────────
const SentSchema = z.object({
  waitlist_id: z.string().uuid(),
  step: z.number().int().min(2).max(MAX_STEP),
  resend_message_id: z.string().max(200).optional().nullable(),
  status: z.enum(['sent', 'failed', 'bounced']).optional().default('sent'),
  error_message: z.string().max(500).optional().nullable()
});

dripRouter.post('/sent', requireAdmin, async (req, res) => {
  const parsed = SentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { waitlist_id, step, resend_message_id, status, error_message } = parsed.data;

  // 1. Insert log row
  const logResult = await supabase.insert('launch_drip_log', {
    waitlist_id,
    step,
    resend_message_id: resend_message_id || null,
    status,
    error_message: error_message || null
  });
  // If duplicate (unique constraint), it means we already sent — return ok
  if (!logResult.ok) {
    const errMsg = JSON.stringify(logResult.error || {}).toLowerCase();
    if (!errMsg.includes('duplicate') && !errMsg.includes('unique')) {
      console.error('[drip:sent] log insert failed:', logResult.error);
      return res.status(500).json({ ok: false, error: 'log_failed' });
    }
  }

  // 2. If status != 'sent', flag bounced/failed — pause if hard bounce
  if (status === 'bounced') {
    await supabase.update(
      'launch_waitlist',
      `?id=eq.${waitlist_id}`,
      { drip_paused: true, drip_paused_reason: `bounced at step ${step}`, status: 'bounced' }
    );
    return res.json({ ok: true, paused: true, reason: 'bounced' });
  }
  if (status === 'failed') {
    // Don't auto-pause on transient failure — just log
    return res.json({ ok: true, retry_recommended: true });
  }

  // 3. Status sent: advance drip_step + schedule next
  const nextStep = step + 1;
  const nextOffsetDays = daysFromSignupForStep(nextStep);
  let nextAt = null;
  if (nextOffsetDays !== null && nextStep <= 4) {
    // Schedule from signup ts; we need signup-ts
    const rowResult = await supabase.select('launch_waitlist', `?select=ts&id=eq.${waitlist_id}&limit=1`);
    if (rowResult.ok && rowResult.data?.[0]?.ts) {
      const signupTs = new Date(rowResult.data[0].ts);
      const nextDate = new Date(signupTs.getTime() + nextOffsetDays * 24 * 3600 * 1000);
      // If already in past (e.g. backfilled rows), schedule +1 day forward
      const now = new Date();
      if (nextDate < now) nextDate.setTime(now.getTime() + 24 * 3600 * 1000);
      nextAt = nextDate.toISOString();
    }
  }

  const updateResult = await supabase.update(
    'launch_waitlist',
    `?id=eq.${waitlist_id}`,
    {
      drip_step: step,
      drip_next_at: nextAt
    }
  );
  if (!updateResult.ok) {
    console.error('[drip:sent] update failed:', updateResult.error);
    return res.status(500).json({ ok: false, error: 'update_failed' });
  }
  return res.json({
    ok: true,
    waitlist_id,
    advanced_to: step,
    next_step: nextAt ? nextStep : null,
    next_at: nextAt
  });
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/drip/pause   { email, reason? }
// POST /api/drip/resume  { email }
// ─────────────────────────────────────────────────────────────────────
const PauseSchema = z.object({
  email: z.string().email().transform(s => s.toLowerCase()),
  reason: z.string().max(200).optional()
});

dripRouter.post('/pause', requireAdmin, async (req, res) => {
  const parsed = PauseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input' });
  const result = await supabase.update(
    'launch_waitlist',
    `?email=eq.${encodeURIComponent(parsed.data.email)}`,
    { drip_paused: true, drip_paused_reason: parsed.data.reason || 'manual' }
  );
  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  return res.json({ ok: true, paused: result.data.length });
});

dripRouter.post('/resume', requireAdmin, async (req, res) => {
  const parsed = z.object({ email: z.string().email().transform(s => s.toLowerCase()) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input' });
  const result = await supabase.update(
    'launch_waitlist',
    `?email=eq.${encodeURIComponent(parsed.data.email)}`,
    { drip_paused: false, drip_paused_reason: null }
  );
  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  return res.json({ ok: true, resumed: result.data.length });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/drip/stats   → drip-funnel
// ─────────────────────────────────────────────────────────────────────
dripRouter.get('/stats', requireAdmin, async (_req, res) => {
  const stats = await supabase.select('v_drip_stats', '?select=*');
  const dueCount = await supabase.select(
    'launch_waitlist',
    `?select=id&drip_paused=eq.false&drip_next_at=lte.${encodeURIComponent(new Date().toISOString())}&drip_step=lt.4&status=in.(pending,confirmed)`
  );
  return res.json({
    ok: true,
    funnel: stats.data || [],
    due_now: Array.isArray(dueCount.data) ? dueCount.data.length : 0
  });
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/drip/send-test    { email, step }
//   Admin-only: build content for an arbitrary email+step, render only
//   (does NOT actually send — n8n does that). Useful for preview/testing.
// ─────────────────────────────────────────────────────────────────────
const TestSchema = z.object({
  email: z.string().email().transform(s => s.toLowerCase()),
  step: z.coerce.number().int().min(2).max(MAX_STEP)
});

dripRouter.post('/preview', requireAdmin, async (req, res) => {
  const parsed = TestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input' });
  // Build with synthetic token for preview
  const row = {
    email: parsed.data.email,
    unsubscribe_token: 'preview_token_' + Math.random().toString(36).slice(2, 10),
    interest_tier: 'unsure'
  };
  const content = buildDripContent({ step: parsed.data.step, row });
  if (!content) return res.status(400).json({ ok: false, error: 'unknown_step' });
  return res.json({ ok: true, step: parsed.data.step, ...content });
});
