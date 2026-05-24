// /api/subscriptions — Wave F2 — Subscription-Tracking (admin CRUD + per-project allocations)
//
// Tables:
//   public.subscriptions          — Carlos's vendor-side subscription pool
//   public.project_subscriptions  — which project uses which sub with allocation%
//   public.project_cost_summary   — view: monthly cost per project (total/billable/aevum-carried)
//
// Endpoints:
//   GET    /api/subscriptions                          list all (admin)
//   POST   /api/subscriptions                          create new sub (admin)
//   PATCH  /api/subscriptions/:id                      update sub (admin)
//   DELETE /api/subscriptions/:id                      delete sub (admin) — cascades to project_subscriptions
//   GET    /api/projects/:id/subscriptions             list subs for a project (admin)
//   POST   /api/projects/:id/subscriptions             add sub to a project (admin)
//   PATCH  /api/projects/:id/subscriptions/:linkId     update allocation/billable/etc (admin)
//   DELETE /api/projects/:id/subscriptions/:linkId     end-date / remove link (admin)
//   GET    /api/projects/:id/cost-summary              cost aggregate for a project (admin)
//
// Auth: x-aevum-admin-token (same pattern as /api/accounts).
// Tag: aevum-wave-f2-subscriptions

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';

export const subscriptionsRouter = Router();
export const projectSubscriptionsRouter = Router({ mergeParams: true });

// ──────────────────────────────────────────────────────────
// Admin auth gate
// ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) {
    return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  }
  if (!tok || !safeCompare(tok, expected)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// ──────────────────────────────────────────────────────────
// UUID helper
// ──────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v) { return typeof v === 'string' && UUID_RE.test(v); }

// ──────────────────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────────────────
const BILLING_CYCLES = ['monthly', 'annual', 'pay-per-use'];
const STATUSES = ['active', 'paused', 'cancelled'];

const CreateSubSchema = z.object({
  vendor: z.string().min(1).max(64),
  product: z.string().min(1).max(200),
  tier: z.string().max(64).optional().nullable(),
  monthly_cost_eur: z.number().nonnegative().optional().nullable(),
  annual_cost_eur: z.number().nonnegative().optional().nullable(),
  billing_cycle: z.enum(BILLING_CYCLES).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(STATUSES).optional().default('active'),
  started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  next_renewal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});

const PatchSubSchema = CreateSubSchema.partial();

const CreateProjectSubSchema = z.object({
  subscription_id: z.string().refine(isUuid, 'invalid_uuid'),
  allocation_pct: z.number().min(0).max(100).optional().default(100),
  per_project_cost_eur_mo: z.number().nonnegative().optional().nullable(),
  billable_to_customer: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional().nullable(),
  started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});

const PatchProjectSubSchema = z.object({
  allocation_pct: z.number().min(0).max(100).optional(),
  per_project_cost_eur_mo: z.number().nonnegative().optional().nullable(),
  billable_to_customer: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
  ended_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function pickFinite(...vals) {
  for (const v of vals) {
    if (v === null || v === undefined) continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// Compute per_project_cost_eur_mo if not explicitly set.
// Rule: prefer monthly_cost_eur * allocation_pct/100; fall back to annual/12; pay-per-use → null.
async function computePerProjectCost(subId, allocationPct, explicit) {
  if (explicit !== null && explicit !== undefined) return Number(explicit);
  const r = await supabase.select('subscriptions', `id=eq.${encodeURIComponent(subId)}&select=monthly_cost_eur,annual_cost_eur,billing_cycle&limit=1`);
  if (!r.ok || !Array.isArray(r.data) || r.data.length === 0) return null;
  const sub = r.data[0];
  const monthly = pickFinite(sub.monthly_cost_eur);
  const annual = pickFinite(sub.annual_cost_eur);
  let base = null;
  if (monthly !== null) base = monthly;
  else if (annual !== null) base = annual / 12;
  if (base === null) return null;
  const pct = Number.isFinite(Number(allocationPct)) ? Number(allocationPct) : 100;
  return Math.round((base * pct / 100) * 100) / 100;
}

// ──────────────────────────────────────────────────────────
// /api/subscriptions — CRUD on the global pool
// ──────────────────────────────────────────────────────────
subscriptionsRouter.get('/', requireAdmin, async (req, res) => {
  const includeCancelled = req.query.include_cancelled === '1' || req.query.include_cancelled === 'true';
  const filter = includeCancelled ? '' : '&status=neq.cancelled';
  const r = await supabase.select(
    'subscriptions',
    `select=id,vendor,product,tier,monthly_cost_eur,annual_cost_eur,billing_cycle,status,notes,started_at,next_renewal,created_at,updated_at${filter}&order=monthly_cost_eur.desc.nullslast`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, subscriptions: r.data || [] });
});

subscriptionsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = CreateSubSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const r = await supabase.insert('subscriptions', parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  const row = Array.isArray(r.data) ? r.data[0] : r.data;
  res.status(201).json({ ok: true, subscription: row });
});

subscriptionsRouter.patch('/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id || '');
  if (!isUuid(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = PatchSubSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  const r = await supabase.update('subscriptions', `id=eq.${encodeURIComponent(id)}`, patch);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!Array.isArray(r.data) || r.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  res.json({ ok: true, subscription: r.data[0] });
});

subscriptionsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id || '');
  if (!isUuid(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const r = await supabase.delete('subscriptions', `id=eq.${encodeURIComponent(id)}`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, deleted: Array.isArray(r.data) ? r.data.length : 0 });
});

// ──────────────────────────────────────────────────────────
// /api/projects/:id/subscriptions — per-project link mgmt
// (mounted as projectSubscriptionsRouter with mergeParams)
// ──────────────────────────────────────────────────────────
projectSubscriptionsRouter.get('/subscriptions', requireAdmin, async (req, res) => {
  const projectId = String(req.params.id || '');
  if (!isUuid(projectId)) return res.status(400).json({ ok: false, error: 'invalid_project_id' });

  const r = await supabase.select(
    'project_subscriptions',
    `project_id=eq.${encodeURIComponent(projectId)}&select=id,project_id,subscription_id,allocation_pct,per_project_cost_eur_mo,billable_to_customer,notes,started_at,ended_at,created_at,subscriptions(id,vendor,product,tier,monthly_cost_eur,billing_cycle,status)&order=created_at.desc`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, links: r.data || [] });
});

projectSubscriptionsRouter.post('/subscriptions', requireAdmin, async (req, res) => {
  const projectId = String(req.params.id || '');
  if (!isUuid(projectId)) return res.status(400).json({ ok: false, error: 'invalid_project_id' });

  const parsed = CreateProjectSubSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  // Verify project exists
  const projCheck = await supabase.select('projects', `id=eq.${encodeURIComponent(projectId)}&select=id&limit=1`);
  if (!projCheck.ok) return res.status(500).json({ ok: false, error: projCheck.error });
  if (!Array.isArray(projCheck.data) || projCheck.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'project_not_found' });
  }

  // Verify sub exists
  const subCheck = await supabase.select('subscriptions', `id=eq.${encodeURIComponent(parsed.data.subscription_id)}&select=id&limit=1`);
  if (!subCheck.ok) return res.status(500).json({ ok: false, error: subCheck.error });
  if (!Array.isArray(subCheck.data) || subCheck.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'subscription_not_found' });
  }

  const computed = await computePerProjectCost(
    parsed.data.subscription_id,
    parsed.data.allocation_pct,
    parsed.data.per_project_cost_eur_mo
  );

  const row = {
    project_id: projectId,
    subscription_id: parsed.data.subscription_id,
    allocation_pct: parsed.data.allocation_pct ?? 100,
    per_project_cost_eur_mo: computed,
    billable_to_customer: parsed.data.billable_to_customer ?? false,
    notes: parsed.data.notes ?? null,
    started_at: parsed.data.started_at ?? new Date().toISOString().slice(0, 10)
  };

  const r = await supabase.insert('project_subscriptions', row);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  const created = Array.isArray(r.data) ? r.data[0] : r.data;
  res.status(201).json({ ok: true, link: created });
});

projectSubscriptionsRouter.patch('/subscriptions/:linkId', requireAdmin, async (req, res) => {
  const projectId = String(req.params.id || '');
  const linkId = String(req.params.linkId || '');
  if (!isUuid(projectId)) return res.status(400).json({ ok: false, error: 'invalid_project_id' });
  if (!isUuid(linkId)) return res.status(400).json({ ok: false, error: 'invalid_link_id' });

  const parsed = PatchProjectSubSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  const patch = { ...parsed.data };

  // If allocation_pct changed but per_project_cost_eur_mo not explicitly set, recompute.
  if (
    parsed.data.allocation_pct !== undefined &&
    parsed.data.per_project_cost_eur_mo === undefined
  ) {
    const existing = await supabase.select(
      'project_subscriptions',
      `id=eq.${encodeURIComponent(linkId)}&project_id=eq.${encodeURIComponent(projectId)}&select=subscription_id&limit=1`
    );
    if (existing.ok && Array.isArray(existing.data) && existing.data.length > 0) {
      const computed = await computePerProjectCost(existing.data[0].subscription_id, parsed.data.allocation_pct, null);
      patch.per_project_cost_eur_mo = computed;
    }
  }

  const r = await supabase.update(
    'project_subscriptions',
    `id=eq.${encodeURIComponent(linkId)}&project_id=eq.${encodeURIComponent(projectId)}`,
    patch
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!Array.isArray(r.data) || r.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  res.json({ ok: true, link: r.data[0] });
});

projectSubscriptionsRouter.delete('/subscriptions/:linkId', requireAdmin, async (req, res) => {
  const projectId = String(req.params.id || '');
  const linkId = String(req.params.linkId || '');
  if (!isUuid(projectId)) return res.status(400).json({ ok: false, error: 'invalid_project_id' });
  if (!isUuid(linkId)) return res.status(400).json({ ok: false, error: 'invalid_link_id' });

  // Soft end-date if ?end=YYYY-MM-DD, otherwise hard delete.
  const endDate = String(req.query.end || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    const r = await supabase.update(
      'project_subscriptions',
      `id=eq.${encodeURIComponent(linkId)}&project_id=eq.${encodeURIComponent(projectId)}`,
      { ended_at: endDate }
    );
    if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
    if (!Array.isArray(r.data) || r.data.length === 0) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }
    return res.json({ ok: true, ended: r.data[0] });
  }

  const r = await supabase.delete(
    'project_subscriptions',
    `id=eq.${encodeURIComponent(linkId)}&project_id=eq.${encodeURIComponent(projectId)}`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, deleted: Array.isArray(r.data) ? r.data.length : 0 });
});

// ──────────────────────────────────────────────────────────
// /api/projects/:id/cost-summary — aggregate from view
// ──────────────────────────────────────────────────────────
projectSubscriptionsRouter.get('/cost-summary', requireAdmin, async (req, res) => {
  const projectId = String(req.params.id || '');
  if (!isUuid(projectId)) return res.status(400).json({ ok: false, error: 'invalid_project_id' });

  const r = await supabase.select(
    'project_cost_summary',
    `project_id=eq.${encodeURIComponent(projectId)}&select=project_id,project_slug,account_id,total_monthly_eur,billable_monthly_eur,aevum_carried_eur,subscription_count&limit=1`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  const row = Array.isArray(r.data) && r.data.length > 0
    ? r.data[0]
    : { project_id: projectId, total_monthly_eur: 0, billable_monthly_eur: 0, aevum_carried_eur: 0, subscription_count: 0 };
  res.json({ ok: true, summary: row });
});
