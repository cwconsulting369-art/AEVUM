// /api/me — Customer self-service endpoints (JWT-auth, account-scoped)
//
// All endpoints require Bearer JWT (scope='customer'). req.customer = { account_id, account_slug, ... }
//
// GET    /api/me                        → own account + profile + permissions
// PATCH  /api/me                        → update own account stamm-fields (name, phone)
// GET    /api/me/profile                → own network-profile
// PATCH  /api/me/profile                → update profile
// GET    /api/me/permissions            → own permissions
// PATCH  /api/me/permissions            → toggle sharing flags
// GET    /api/me/projects               → own projects
// POST   /api/me/projects               → create project under own account
// PATCH  /api/me/projects/:slug         → update own project
// GET    /api/me/projects/:slug/apis    → list api-keys (returns metadata only, no decrypted secret)
// POST   /api/me/projects/:slug/apis    → submit new api-key (encrypted)
// DELETE /api/me/projects/:slug/apis/:id → revoke api-key

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { requireCustomerAuth, encryptSecret } from '../lib/crypto.js';
import { projectAgentRouter } from './project-agent.js';
import { docsRouter } from './docs.js';
import { customerDocsRouter } from './customer-docs.js';
import { customerActivityRouter } from './customer-activity.js';
import { meTestimonialsRouter } from './me-testimonials.js';
import { uhMirrorRouter } from './uh-mirror.js';
import { stripe } from '../lib/stripe.js';
import { buildShopStats, buildStripeStats, buildOrdersStats } from '../lib/dashboard-stats.js';

export const meRouter = Router();

// All endpoints gated by JWT auth
meRouter.use(requireCustomerAuth);

// ────────────────────────────────────────────────────────────
// Memo client_zero status per account-id (avoid extra DB hit per request)
// client_zero = AEVUM-Operator (Carlos) → READ-Access auf alle Customer-Projekte
// ────────────────────────────────────────────────────────────
const CLIENT_ZERO_CACHE = new Map();  // account_id → { value, ts }
async function isClientZero(accountId) {
  const cached = CLIENT_ZERO_CACHE.get(accountId);
  if (cached && (Date.now() - cached.ts) < 60_000) return cached.value;
  const r = await supabase.select('accounts', `select=client_zero&id=eq.${accountId}&limit=1`);
  const value = !!r.data?.[0]?.client_zero;
  CLIENT_ZERO_CACHE.set(accountId, { value, ts: Date.now() });
  return value;
}

// Customer Project-Agent chat + memory (Lennox-style file memory).
// Mounted as a sub-router so :slug propagates via mergeParams.
meRouter.use('/projects/:slug/agent', projectAgentRouter);

// Customer Document-Exchange (FS-backed inbox/outbox/shared MD files).
meRouter.use('/projects/:slug/docs', docsRouter);

// Block B1 — Account-level Doc-Exchange (inbox/outbox/shared at account scope, allows .md/.txt/.pdf)
meRouter.use('/docs', customerDocsRouter);

// Block B2 — Customer-side Activity-Dashboard (project-scoped usage stats)
meRouter.use('/projects/:slug/activity', customerActivityRouter);

// Wave E4: Customer-controlled Testimonial-Permissions (case_pages).
meRouter.use('/testimonial', meTestimonialsRouter);

// UH-Endstufe Block C — UH-Mirror endpoints
// Proxies UH-Supabase read-only to AEVUM-Portal so Miguel arbeitet
// long-term im AEVUM-Portal statt utility-hub.one/app/*
meRouter.use('/projects/:slug/uh', uhMirrorRouter);

// ────────────────────────────────────────────────────────────
// GET /api/me/orders — Stripe-Orders fuer eingeloggten Account (Shop-Dashboard).
// Match per customer_email (orders table has no account_id FK yet).
// KEIN gating — alle Account-Typen koennen Orders haben (auch Vollkunden).
// ────────────────────────────────────────────────────────────
meRouter.get('/orders', async (req, res) => {
  const id = req.customer.account_id;
  const accRes = await supabase.select('accounts', `select=email&id=eq.${id}&limit=1`);
  const acc = accRes.data?.[0];
  if (!acc?.email) return res.status(404).json({ ok: false, error: 'account_email_missing' });
  const enc = encodeURIComponent(acc.email);
  const r = await supabase.select(
    'orders',
    `select=id,created_at,paid_at,status,package_tier,package_name,total_cents,currency,addons,recurring_interval,stripe_session_id&customer_email=eq.${enc}&order=created_at.desc&limit=100`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, orders: r.data ?? [] });
});

// ────────────────────────────────────────────────────────────
// GET /api/me
// ────────────────────────────────────────────────────────────
meRouter.get('/', async (req, res) => {
  const id = req.customer.account_id;
  const [acc, profile, perms, agent, ownProjects] = await Promise.all([
    supabase.select('accounts', `select=*&id=eq.${id}`),
    supabase.select('account_profiles', `select=*&account_id=eq.${id}`),
    supabase.select('account_permissions', `select=*&account_id=eq.${id}`),
    supabase.select('account_agents', `select=id,deployment_status,channels,deployed_at&account_id=eq.${id}`),
    supabase.select('projects', `select=id,slug,name,status,tier,industry,created_at,account_id&account_id=eq.${id}&order=created_at.asc`)
  ]);
  if (!acc.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });

  // Client-zero (AEVUM-Operator) sieht zusätzlich ALLE Customer-Projekte für Cross-Account-Monitoring
  let projects = ownProjects.data ?? [];
  const isOp = !!acc.data[0]?.client_zero;
  if (isOp) {
    const all = await supabase.select('projects',
      `select=id,slug,name,status,tier,industry,created_at,account_id,accounts:accounts!inner(slug,name,client_zero)&order=created_at.asc`);
    const ownIds = new Set(projects.map(p => p.id));
    const cross = (all.data || [])
      .filter(p => !ownIds.has(p.id) && !p.accounts?.client_zero)
      .map(p => ({
        ...p,
        _operator_view: true,
        owner_slug: p.accounts?.slug,
        owner_name: p.accounts?.name
      }));
    projects = [...projects, ...cross];
  }

  res.json({
    ok: true,
    account: acc.data[0],
    profile: profile.data?.[0] ?? null,
    permissions: perms.data?.[0] ?? null,
    agent: agent.data?.[0] ?? null,
    projects,
    is_operator: isOp
  });
});

// ────────────────────────────────────────────────────────────
// PATCH /api/me
// ────────────────────────────────────────────────────────────
const PatchAccountSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  business_name: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  contact_data: z.record(z.any()).optional()
  // status + slug + email NICHT änderbar von Customer
});

meRouter.patch('/', async (req, res) => {
  const parsed = PatchAccountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const id = req.customer.account_id;
  const r = await supabase.update('accounts', `id=eq.${id}`, parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, account: r.data?.[0] });
});

// ────────────────────────────────────────────────────────────
// PROFILE
// ────────────────────────────────────────────────────────────
const PatchProfileSchema = z.object({
  display_name: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  team_size: z.string().max(50).optional(),
  revenue_band: z.string().max(50).optional(),
  vision: z.string().max(2000).optional(),
  looking_for: z.array(z.string().max(100)).max(20).optional(),
  socials: z.record(z.string().url().or(z.literal(''))).optional(),
  bio: z.string().max(4000).optional(),
  visibility: z.enum(['private', 'network', 'public']).optional()
});

meRouter.get('/profile', async (req, res) => {
  const id = req.customer.account_id;
  const r = await supabase.select('account_profiles', `select=*&account_id=eq.${id}`);
  res.json({ ok: true, profile: r.data?.[0] ?? null });
});

meRouter.patch('/profile', async (req, res) => {
  const parsed = PatchProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const id = req.customer.account_id;
  const r = await supabase.update('account_profiles', `account_id=eq.${id}`, parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, profile: r.data?.[0] });
});

// ────────────────────────────────────────────────────────────
// PERMISSIONS
// ────────────────────────────────────────────────────────────
const PatchPermissionsSchema = z.object({
  share_logo: z.boolean().optional(),
  share_company_name: z.boolean().optional(),
  share_industry: z.boolean().optional(),
  share_revenue_band: z.boolean().optional(),
  share_team_size: z.boolean().optional(),
  share_kpis: z.boolean().optional(),
  share_kpi_deltas: z.boolean().optional(),
  share_case_study: z.boolean().optional(),
  share_testimonial_quote: z.boolean().optional(),
  share_video_testimonial: z.boolean().optional(),
  channel_website: z.boolean().optional(),
  channel_linkedin: z.boolean().optional(),
  channel_pitchdeck: z.boolean().optional(),
  channel_internal_network: z.boolean().optional(),
  anonymize_revenue: z.boolean().optional(),
  anonymize_industry_detail: z.boolean().optional()
});

meRouter.get('/permissions', async (req, res) => {
  const id = req.customer.account_id;
  const r = await supabase.select('account_permissions', `select=*&account_id=eq.${id}`);
  res.json({ ok: true, permissions: r.data?.[0] ?? null });
});

meRouter.patch('/permissions', async (req, res) => {
  const parsed = PatchPermissionsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const id = req.customer.account_id;
  const patch = { ...parsed.data, consent_date: new Date().toISOString() };
  const r = await supabase.update('account_permissions', `account_id=eq.${id}`, patch);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, permissions: r.data?.[0] });
});

// ────────────────────────────────────────────────────────────
// PROJECTS
// ────────────────────────────────────────────────────────────
const CreateProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(64),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  industry: z.string().max(100).optional(),
  dashboard_blueprint_id: z.string().optional().default('os-standard-v1'),
  agent_blueprint_id: z.string().optional().default('project-os-v1')
});

const PatchProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  industry: z.string().max(100).optional().nullable()
});

meRouter.get('/projects', async (req, res) => {
  const id = req.customer.account_id;
  const isOp = await isClientZero(id);
  if (isOp) {
    const r = await supabase.select('projects',
      `select=*,accounts:accounts!inner(slug,name,client_zero)&order=created_at.asc`);
    const projects = (r.data || []).map(p => ({
      ...p,
      _operator_view: p.account_id !== id,
      owner_slug: p.accounts?.slug,
      owner_name: p.accounts?.name
    }));
    return res.json({ ok: true, projects, is_operator: true });
  }
  const r = await supabase.select('projects', `select=*&account_id=eq.${id}&order=created_at.asc`);
  res.json({ ok: true, projects: r.data ?? [], is_operator: false });
});

meRouter.post('/projects', async (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const p = parsed.data;
  const accountId = req.customer.account_id;

  const accAgent = await supabase.select('account_agents', `select=id&account_id=eq.${accountId}`);
  const accAgentId = accAgent.data?.[0]?.id ?? null;

  const dbBp = await supabase.select('blueprint_dashboards', `select=id,version&id=eq.${encodeURIComponent(p.dashboard_blueprint_id)}`);
  if (!dbBp.data?.length) return res.status(400).json({ ok: false, error: 'dashboard_blueprint_not_found' });

  const agBp = await supabase.select('blueprint_agents', `select=id,version&id=eq.${encodeURIComponent(p.agent_blueprint_id)}`);
  if (!agBp.data?.length) return res.status(400).json({ ok: false, error: 'agent_blueprint_not_found' });

  const projRes = await supabase.insert('projects', {
    account_id: accountId,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    industry: p.industry ?? null
  });
  if (!projRes.ok) {
    if (projRes.status === 409) return res.status(409).json({ ok: false, error: 'slug_already_exists' });
    return res.status(500).json({ ok: false, error: projRes.error });
  }
  const project = projRes.data?.[0];

  await Promise.all([
    supabase.insert('project_dashboards', {
      project_id: project.id,
      blueprint_id: dbBp.data[0].id,
      blueprint_version: dbBp.data[0].version,
      deployment_status: 'pending'
    }),
    supabase.insert('project_agents', {
      project_id: project.id,
      blueprint_id: agBp.data[0].id,
      blueprint_version: agBp.data[0].version,
      agent_config: { display_name: `${project.name} Assistant` },
      parent_account_agent_id: accAgentId,
      deployment_status: 'pending'
    })
  ]);

  res.status(201).json({ ok: true, project });
});

meRouter.patch('/projects/:slug', async (req, res) => {
  const parsed = PatchProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const accountId = req.customer.account_id;
  const r = await supabase.update('projects',
    `account_id=eq.${accountId}&slug=eq.${encodeURIComponent(req.params.slug)}`,
    parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'project_not_found' });
  res.json({ ok: true, project: r.data[0] });
});

// ────────────────────────────────────────────────────────────
// PROJECT API-KEYS (encrypted submission)
// ────────────────────────────────────────────────────────────
const SubmitApiSchema = z.object({
  service: z.string().min(1).max(100),
  key_label: z.string().max(200).optional(),
  key: z.string().min(8).max(4000),
  scope: z.enum(['read-only', 'read-write']).optional().default('read-only')
});

// resolveProjectForCustomer:
// - Normal customers: nur eigene Projekte (account_id match)
// - client_zero (Carlos / AEVUM-Operator): READ-Access auf ALLE Projekte (cross-account)
//   Mutationen bleiben separat gegated (POST/PATCH/DELETE bestehen weiter auf account_id=eq.X)
async function resolveProjectForCustomer(accountId, slug, opts = {}) {
  // Eigene Projekte
  const own = await supabase.select('projects',
    `select=id,slug,name,marketing_thesis,account_id&account_id=eq.${accountId}&slug=eq.${encodeURIComponent(slug)}`);
  if (own.data?.[0]) return { ...own.data[0], _operator_view: false };

  // Client-zero darf cross-account READ
  if (!opts.readOnly && !opts.allowCrossAccount) return null;
  if (!(await isClientZero(accountId))) return null;
  const cross = await supabase.select('projects',
    `select=id,slug,name,marketing_thesis,account_id&slug=eq.${encodeURIComponent(slug)}`);
  const p = cross.data?.[0];
  if (!p) return null;
  return { ...p, _operator_view: true };
}

meRouter.get('/projects/:slug/apis', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug, { allowCrossAccount: true });
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.select('project_apis',
    `select=id,service,key_label,scope,health,added_at,last_used_at&project_id=eq.${project.id}&order=added_at.desc`);
  res.json({ ok: true, apis: r.data ?? [] });
});

meRouter.post('/projects/:slug/apis', async (req, res) => {
  const parsed = SubmitApiSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed' });
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  try {
    const encrypted = encryptSecret(parsed.data.key);
    const r = await supabase.insert('project_apis', {
      project_id: project.id,
      service: parsed.data.service,
      key_label: parsed.data.key_label ?? null,
      key_encrypted: encrypted,
      scope: parsed.data.scope,
      health: 'unknown'
    });
    if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
    const row = r.data?.[0];
    res.status(201).json({
      ok: true,
      api: {
        id: row.id, service: row.service, key_label: row.key_label,
        scope: row.scope, health: row.health, added_at: row.added_at
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'encryption_failed', message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// Shop + Stripe analytics aggregation now in ../lib/dashboard-stats.js
// (Legacy local definitions removed — imported above.)
// ────────────────────────────────────────────────────────────
/* eslint-disable */
async function __unused_legacy_buildShopStats() {
  const now = Date.now();
  const dayMs = 86400000;
  const todayIso = new Date(now - dayMs).toISOString();
  const weekIso = new Date(now - 7 * dayMs).toISOString();
  const prevWeekStartIso = new Date(now - 14 * dayMs).toISOString();
  const monthIso = new Date(now - 30 * dayMs).toISOString();

  // All events last 30d — we aggregate in JS to keep it simple.
  const r = await supabase.select(
    'shop_events',
    `select=created_at,event_type,session_id,device_type,package_tier,value_cents,path&created_at=gte.${monthIso}&order=created_at.desc&limit=10000`
  );
  const events = Array.isArray(r.data) ? r.data : [];

  // Traffic buckets — count unique sessions per period (page_view + shop_open)
  const trafficEvents = events.filter(e => e.event_type === 'page_view' || e.event_type === 'shop_open');
  const sessionsIn = (sinceIso) => {
    const set = new Set();
    for (const e of trafficEvents) {
      if (e.created_at >= sinceIso) set.add(e.session_id);
    }
    return set.size;
  };
  const todaySessions = sessionsIn(todayIso);
  const weekSessions = sessionsIn(weekIso);
  const monthSessions = sessionsIn(monthIso);

  // Previous week (for delta)
  const prevWeekSessions = (() => {
    const set = new Set();
    for (const e of trafficEvents) {
      if (e.created_at >= prevWeekStartIso && e.created_at < weekIso) set.add(e.session_id);
    }
    return set.size;
  })();
  const vsPrevWeekPct = prevWeekSessions > 0
    ? Math.round(((weekSessions - prevWeekSessions) / prevWeekSessions) * 1000) / 10
    : null;

  // Funnel — over last 30 days, count UNIQUE sessions reaching each step
  const sessionsByEvent = {};
  for (const e of events) {
    sessionsByEvent[e.event_type] = sessionsByEvent[e.event_type] || new Set();
    sessionsByEvent[e.event_type].add(e.session_id);
  }
  const fn = (k) => (sessionsByEvent[k]?.size || 0);
  const pageViewSessions = fn('page_view');
  const shopOpenSessions = fn('shop_open');
  const checkoutStart = fn('checkout_start');
  const checkoutComplete = fn('checkout_complete');
  const conversionRate = pageViewSessions > 0
    ? Math.round((checkoutComplete / pageViewSessions) * 10000) / 100
    : null;

  // Device split (last 7d)
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  const deviceSessionMap = {};
  for (const e of trafficEvents) {
    if (e.created_at < weekIso || !e.device_type) continue;
    if (deviceSessionMap[e.session_id]) continue;
    deviceSessionMap[e.session_id] = e.device_type;
    if (deviceCounts[e.device_type] !== undefined) deviceCounts[e.device_type]++;
  }
  const totalDev = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet;
  const byDevice = totalDev > 0
    ? {
        mobile: Math.round((deviceCounts.mobile / totalDev) * 100),
        desktop: Math.round((deviceCounts.desktop / totalDev) * 100),
        tablet: Math.round((deviceCounts.tablet / totalDev) * 100),
      }
    : { mobile: 0, desktop: 0, tablet: 0 };

  // Top packages from completed checkouts (last 30d)
  const tierCounts = {};
  const tierValue = {};
  for (const e of events) {
    if (e.event_type !== 'checkout_complete' || !e.package_tier) continue;
    tierCounts[e.package_tier] = (tierCounts[e.package_tier] || 0) + 1;
    tierValue[e.package_tier] = (tierValue[e.package_tier] || 0) + (e.value_cents || 0);
  }
  const topPackages = Object.entries(tierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tier, count]) => ({ tier, count, total_cents: tierValue[tier] || 0 }));

  // Abandoned — sessions that started checkout but never completed (last 7d)
  const startSessions = new Set();
  const completeSessions = new Set();
  const startMeta = {};
  for (const e of events) {
    if (e.created_at < weekIso) continue;
    if (e.event_type === 'checkout_start') {
      startSessions.add(e.session_id);
      startMeta[e.session_id] = {
        last_path: e.path,
        package_tier: e.package_tier,
        value_cents: e.value_cents,
        at: e.created_at,
      };
    } else if (e.event_type === 'checkout_complete') {
      completeSessions.add(e.session_id);
    }
  }
  const abandoned = [...startSessions]
    .filter(s => !completeSessions.has(s))
    .slice(0, 20)
    .map(s => ({
      session_id: s.slice(0, 8),
      last_path: startMeta[s]?.last_path,
      package_tier: startMeta[s]?.package_tier,
      value_cents: startMeta[s]?.value_cents,
      time_ago_min: Math.round((now - new Date(startMeta[s]?.at).getTime()) / 60000),
    }));

  return {
    traffic: {
      today: todaySessions,
      week: weekSessions,
      month: monthSessions,
      vs_prev_week_pct: vsPrevWeekPct,
    },
    funnel: {
      page_view: pageViewSessions,
      shop_open: shopOpenSessions,
      checkout_start: checkoutStart,
      checkout_complete: checkoutComplete,
      conversion_rate: conversionRate,
    },
    abandoned,
    top_packages: topPackages,
    by_device: byDevice,
    total_events_30d: events.length,
  };
}

async function __unused_legacy_buildStripeStats() {
  if (!stripe) {
    return {
      configured: false,
      revenue_lifetime_cents: 0,
      revenue_30d_cents: 0,
      mrr_cents: 0,
      active_subscriptions: 0,
      refund_total_cents: 0,
      recent_charges: [],
      abandoned_sessions: [],
      note: 'Stripe nicht konfiguriert (STRIPE_SECRET_KEY fehlt)',
    };
  }
  const out = {
    configured: true,
    revenue_lifetime_cents: 0,
    revenue_30d_cents: 0,
    mrr_cents: 0,
    active_subscriptions: 0,
    refund_total_cents: 0,
    recent_charges: [],
    abandoned_sessions: [],
  };
  const dayMs = 86400000;
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * dayMs) / 1000);

  try {
    // Recent charges — first 30 succeeded
    const charges = await stripe.charges.list({ limit: 30 });
    out.recent_charges = (charges.data || []).map(c => ({
      id: c.id,
      amount: c.amount,
      currency: c.currency,
      status: c.status,
      paid: c.paid,
      refunded: c.refunded,
      created: c.created,
      customer_email: c.billing_details?.email || null,
      description: c.description || null,
    }));
    out.revenue_lifetime_cents = (charges.data || [])
      .filter(c => c.paid && !c.refunded)
      .reduce((s, c) => s + (c.amount || 0), 0);
    out.revenue_30d_cents = (charges.data || [])
      .filter(c => c.paid && !c.refunded && c.created >= thirtyDaysAgo)
      .reduce((s, c) => s + (c.amount || 0), 0);
  } catch (e) {
    console.error('[stripe-stats] charges fail:', e.message);
  }

  try {
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    out.active_subscriptions = subs.data?.length || 0;
    out.mrr_cents = (subs.data || []).reduce((s, sub) => {
      const items = sub.items?.data || [];
      let monthly = 0;
      for (const item of items) {
        const price = item.price;
        if (!price) continue;
        const amt = price.unit_amount || 0;
        const qty = item.quantity || 1;
        const interval = price.recurring?.interval;
        const count = price.recurring?.interval_count || 1;
        let monthlyAmt = amt * qty;
        if (interval === 'year') monthlyAmt = monthlyAmt / (12 * count);
        else if (interval === 'week') monthlyAmt = monthlyAmt * (4 / count);
        else if (interval === 'day') monthlyAmt = monthlyAmt * (30 / count);
        else monthlyAmt = monthlyAmt / count;
        monthly += monthlyAmt;
      }
      return s + Math.round(monthly);
    }, 0);
  } catch (e) {
    console.error('[stripe-stats] subscriptions fail:', e.message);
  }

  try {
    const refunds = await stripe.refunds.list({ limit: 30 });
    out.refund_total_cents = (refunds.data || []).reduce((s, r) => s + (r.amount || 0), 0);
  } catch (e) {
    console.error('[stripe-stats] refunds fail:', e.message);
  }

  try {
    // Abandoned = checkout sessions still "open" or "expired" without payment
    const open = await stripe.checkout.sessions.list({ status: 'open', limit: 30 });
    const expired = await stripe.checkout.sessions.list({ status: 'expired', limit: 20 });
    const all = [...(open.data || []), ...(expired.data || [])];
    out.abandoned_sessions = all
      .filter(s => s.payment_status !== 'paid')
      .slice(0, 25)
      .map(s => ({
        id: s.id.slice(0, 18) + '…',
        amount_total: s.amount_total,
        currency: s.currency,
        expires_at: s.expires_at,
        status: s.status,
        customer_email: s.customer_details?.email || s.customer_email || null,
        tier: s.metadata?.tier || s.metadata?.product_id || null,
        created: s.created,
      }));
  } catch (e) {
    console.error('[stripe-stats] sessions fail:', e.message);
  }

  return out;
}

async function __unused_legacy_buildOrdersStats() {
  // DB orders aggregate — local source of truth, fast.
  const r = await supabase.select(
    'orders',
    `select=status,package_tier,total_cents,paid_at,created_at,customer_email&order=created_at.desc&limit=500`
  );
  const rows = Array.isArray(r.data) ? r.data : [];
  const byStatus = {};
  const byTier = {};
  let paidTotal = 0;
  let pending = 0;
  for (const o of rows) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === 'paid') {
      paidTotal += (o.total_cents || 0);
      byTier[o.package_tier] = (byTier[o.package_tier] || 0) + 1;
    }
    if (o.status === 'pending') pending++;
  }
  return {
    total_orders: rows.length,
    by_status: byStatus,
    by_tier: byTier,
    paid_total_cents: paidTotal,
    pending_count: pending,
    recent: rows.slice(0, 10).map(o => ({
      status: o.status,
      package_tier: o.package_tier,
      total_cents: o.total_cents,
      paid_at: o.paid_at,
      created_at: o.created_at,
      customer_email: (o.customer_email || '').replace(/^(.).+(@.+)$/, '$1***$2'),
    })),
  };
}
/* eslint-enable */

// ────────────────────────────────────────────────────────────
// GET /api/me/projects/:slug/dashboard
// aevum slug → AEVUM business ops dashboard (DashboardData type)
// other slugs → ad-platform KPI dashboard
// ────────────────────────────────────────────────────────────
meRouter.get('/projects/:slug/dashboard', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug, { allowCrossAccount: true });
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });

  // ── AEVUM client-zero business dashboard ──────────────────
  if (req.params.slug === 'aevum') {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0,0,0,0);
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);
    const weekStartIso = weekStart.toISOString();
    const prevWeekIso = prevWeekStart.toISOString();

    const [auditsThisW, auditsPrevW, auditsRecent, allAccounts, helpbotW, helpbotRecent, shopStats, stripeStats, ordersStats] = await Promise.all([
      supabase.select('audits', `select=id&created_at=gte.${weekStartIso}`),
      supabase.select('audits', `select=id&created_at=gte.${prevWeekIso}&created_at=lt.${weekStartIso}`),
      supabase.select('audits', `select=id,created_at,name,email,company,industry,status,plan_pdf_url,analysis_result,meta&order=created_at.desc&limit=20`),
      supabase.select('accounts', `select=id,slug,name,status,client_zero,contact_data,created_at&order=created_at.desc`),
      supabase.select('helpbot_conversations', `select=id&started_at=gte.${weekStartIso}`),
      supabase.select('helpbot_conversations', `select=id,session_id,started_at,last_msg_at,message_count,extracted_data&order=last_msg_at.desc&limit=10`),
      buildShopStats().catch(e => { console.error('[dashboard] shop stats fail:', e.message); return null; }),
      buildStripeStats().catch(e => { console.error('[dashboard] stripe stats fail:', e.message); return null; }),
      buildOrdersStats().catch(e => { console.error('[dashboard] orders stats fail:', e.message); return null; }),
    ]);

    const thisW = auditsThisW.data?.length ?? 0;
    const prevW = auditsPrevW.data?.length ?? 0;
    const allAudits = Array.isArray(auditsRecent.data) ? auditsRecent.data : [];
    const accounts = Array.isArray(allAccounts.data) ? allAccounts.data : [];

    const totalAudits = allAudits.length;
    const withPlan = allAudits.filter(a => ['plan_ready','call_booked','won','lost'].includes(a.status)).length;
    const withCall = allAudits.filter(a => ['call_booked','won','lost'].includes(a.status)).length;
    const deals = allAudits.filter(a => a.status === 'won').length;

    const funnel = [
      { stage: 'audit', label: 'Audit eingegangen', count: totalAudits,   conversion_pct: 100 },
      { stage: 'plan',  label: 'Plan erstellt',      count: withPlan,      conversion_pct: totalAudits ? Math.round(withPlan/totalAudits*100) : null },
      { stage: 'call',  label: 'Call vereinbart',    count: withCall,      conversion_pct: withPlan   ? Math.round(withCall/withPlan*100)   : null },
      { stage: 'deal',  label: 'Deal geschlossen',   count: deals,         conversion_pct: withCall   ? Math.round(deals/withCall*100)      : null },
    ];

    // MRR aus account contact_data.retainer_monthly_eur
    let mrrEur = 0;
    accounts.forEach(acc => {
      const p = acc.contact_data;
      if (p?.retainer_monthly_eur) mrrEur += Number(p.retainer_monthly_eur);
    });

    const activeAccounts = accounts.filter(a => a.status === 'active' && !a.client_zero);
    const customerList = accounts
      .filter(a => !a.client_zero)
      .map(a => ({
        id: a.id, slug: a.slug, name: a.name, status: a.status,
        health: a.status === 'active' ? 'green' : a.status === 'onboarding' ? 'yellow' : 'red',
        created_at: a.created_at
      }));

    const recentConvsRaw = Array.isArray(helpbotRecent.data) ? helpbotRecent.data : [];
    const allExtracted = recentConvsRaw.map(c => c.extracted_data).filter(Boolean);
    const allPains = allExtracted.flatMap(e => e.pain_points ?? []);
    const painCounts = {};
    allPains.forEach(p => { painCounts[p] = (painCounts[p] || 0) + 1; });
    const topPains = Object.entries(painCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([text, count]) => ({ text, count }));
    const handoffs = allExtracted.filter(e => e.handoff_requested).length;
    const handoffRate = allExtracted.length ? Math.round(handoffs / allExtracted.length * 100) : null;

    const recentConvs = recentConvsRaw.map(c => ({
      id_hash: c.session_id?.slice(0,8) || c.id?.slice(0,8),
      started_at: c.started_at,
      last_msg_at: c.last_msg_at || c.started_at,
      message_count: c.message_count || 0,
      first_msg_preview: '—',
    }));

    const weeklyMap = {};
    allAudits.forEach(a => {
      const d = new Date(a.created_at);
      d.setDate(d.getDate() - d.getDay() + 1); d.setHours(0,0,0,0);
      const k = d.toISOString().slice(0,10);
      weeklyMap[k] = (weeklyMap[k] || 0) + 1;
    });
    const funnelWeekly = Object.entries(weeklyMap)
      .sort((a, b) => a[0].localeCompare(b[0])).slice(-8)
      .map(([week_start, count]) => ({ week_start, count }));

    return res.json({
      ok: true,
      project: { id: project.id, slug: project.slug, name: project.name },
      generated_at: new Date().toISOString(),
      kpis: {
        audits_this_week: thisW, audits_last_week: prevW, audits_delta: thisW - prevW,
        audit_to_plan_pct: totalAudits ? Math.round(withPlan/totalAudits*100) : null,
        plan_to_call_pct: withPlan ? Math.round(withCall/withPlan*100) : null,
        call_to_deal_pct: withCall ? Math.round(deals/withCall*100) : null,
        mrr_eur: mrrEur,
        helpbot_conversations_week: helpbotW.data?.length ?? 0,
      },
      funnel, funnel_weekly: funnelWeekly,
      recent_audits: allAudits.slice(0, 10).map(a => ({
        id: a.id, created_at: a.created_at, name: a.name, email: a.email,
        company: a.company, industry: a.industry, status: a.status,
        deal_recommendation: a.analysis_result?.deal_recommendation ?? a.meta?.deal_recommendation ?? null,
        confidence: a.analysis_result?.confidence ?? a.meta?.confidence ?? null,
        plan_pdf_url: a.plan_pdf_url ?? null,
        has_analysis: !!(a.analysis_result),
      })),
      customers: { total: customerList.length, active: activeAccounts.length, list: customerList },
      helpbot_insights: {
        recent: recentConvs, top_pains: topPains,
        handoff_rate_pct: handoffRate, total_extractions: allExtracted.length,
      },
      marketing: { cold_calls_week: null, linkedin_posts_week: null, lead_magnet_downloads_week: null, note: 'Tracking noch nicht verknüpft' },
      finance: {
        stripe_mrr_eur: stripeStats?.configured ? Math.round((stripeStats.mrr_cents || 0) / 100) : mrrEur,
        pending_invoices_count: ordersStats?.pending_count ?? 0,
        pending_invoices_eur: 0,
        setup_fees_collected_month_eur: stripeStats ? Math.round((stripeStats.revenue_30d_cents || 0) / 100) : 0,
        customer_ltv_estimate_eur: mrrEur > 0 ? mrrEur * 18 : null,
        has_stripe: !!stripeStats?.configured,
        note: stripeStats?.configured
          ? 'Live aus Stripe API (Charges/Subscriptions/Refunds)'
          : 'Stripe-Anbindung ausstehend — MRR aus account.contact_data berechnet',
      },
      shop: shopStats,
      stripe: stripeStats,
      orders: ordersStats,
    });
  }

  // ── Standard ad-platform dashboard (CollaGlow etc.) ───────
  const apisRes = await supabase.select('project_apis',
    `select=service,health,last_used_at&project_id=eq.${project.id}`);
  const apis = apisRes.data ?? [];
  const connected = (svc) => apis.some(a => a.service === svc);

  const intelligenceRes = await supabase.select('project_intelligence',
    `select=*&project_id=eq.${project.id}&order=created_at.desc&limit=1`);
  const intelligence = intelligenceRes.data?.[0] ?? null;

  const kpis = [
    { id: 'roas',     label: 'ROAS Meta',    value: connected('meta_ads')    ? null : '—', unit: 'x',   trend: null, source: 'meta_ads',    live: connected('meta_ads') },
    { id: 'cpa',      label: 'CPA Meta',     value: connected('meta_ads')    ? null : '—', unit: '€',   trend: null, source: 'meta_ads',    live: connected('meta_ads') },
    { id: 'aov',      label: 'AOV Shopify',  value: connected('shopify')     ? null : '—', unit: '€',   trend: null, source: 'shopify',     live: connected('shopify') },
    { id: 'revenue',  label: 'Revenue',      value: connected('shopify')     ? null : '—', unit: '€',   trend: null, source: 'shopify',     live: connected('shopify') },
    { id: 'open_rate',label: 'Email Open%',  value: connected('klaviyo')     ? null : '—', unit: '%',   trend: null, source: 'klaviyo',     live: connected('klaviyo') },
    { id: 'g_roas',   label: 'ROAS Google',  value: connected('google_ads')  ? null : '—', unit: 'x',   trend: null, source: 'google_ads',  live: connected('google_ads') },
  ];
  const integrations = [
    { service: 'meta_ads',   label: 'Meta Ads',   connected: connected('meta_ads'),   icon: 'Meta' },
    { service: 'google_ads', label: 'Google Ads', connected: connected('google_ads'), icon: 'Google' },
    { service: 'klaviyo',    label: 'Klaviyo',    connected: connected('klaviyo'),    icon: 'Mail' },
    { service: 'shopify',    label: 'Shopify',    connected: connected('shopify'),    icon: 'Shop' },
    { service: 'tiktok_ads', label: 'TikTok Ads', connected: connected('tiktok_ads'), icon: 'TikTok' },
  ];
  res.json({
    ok: true,
    project: { id: project.id, slug: project.slug, name: project.name, industry: project.industry },
    kpis, integrations,
    intelligence: intelligence ? {
      seo_score: intelligence.seo_score, website_issues: intelligence.website_issues,
      linkedin_data: intelligence.linkedin_data, optimizations: intelligence.optimizations,
      copy_analysis: intelligence.copy_analysis ?? null, workflow_analysis: intelligence.workflow_analysis ?? null,
      speed_data: intelligence.speed_data ?? null, full_report: intelligence.full_report ?? null,
      audit_summary: intelligence.audit_summary ?? null, status: intelligence.status,
      generated_at: intelligence.created_at
    } : null,
    generated_at: new Date().toISOString()
  });
});

// UUID regex — IN-01 defense-in-depth before id-based queries
const ME_UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ── Lead-Funnel Dashboard (Patrick monitoring view) ────────────
meRouter.get('/projects/:slug/lead-funnel', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug, { allowCrossAccount: true });
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });

  const accountId = req.customer.account_id;
  const projectId = project.id;
  const now = new Date();
  const day30 = new Date(now.getTime() - 30 * 86400000).toISOString();
  const day7 = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [leadsAll, leadsRecent, programs, scraperCamps, intel] = await Promise.all([
    supabase.select('customer_leads',
      `select=id,lead_tier,status,score_total,source,created_at&account_id=eq.${accountId}&order=created_at.desc&limit=500`),
    supabase.select('customer_leads',
      `select=id,name,email,phone,lead_tier,score_total,status,source,source_detail,created_at,referral_code,notes&account_id=eq.${accountId}&order=created_at.desc&limit=50`),
    supabase.select('referral_programs',
      `select=id,name,slug,status,referrer_reward_description,referee_reward_description,trigger_event&project_id=eq.${projectId}&order=created_at.desc`),
    supabase.select('lead_scraper_campaigns',
      `select=id,name,status,outreach_channel,created_at,updated_at&account_id=eq.${accountId}&order=created_at.desc&limit=20`),
    supabase.select('project_intelligence',
      `select=website_url,linkedin_url,optimizations,audit_summary&project_id=eq.${projectId}&order=created_at.desc&limit=1`)
  ]);

  const leads = Array.isArray(leadsAll.data) ? leadsAll.data : [];
  const recent = Array.isArray(leadsRecent.data) ? leadsRecent.data : [];

  const leads30d = leads.filter(l => l.created_at >= day30).length;
  const leads7d = leads.filter(l => l.created_at >= day7).length;
  const tierCounts = leads.reduce((acc, l) => { const t = l.lead_tier || 'unscored'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const statusCounts = leads.reduce((acc, l) => { const s = l.status || 'new'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const sourceCounts = leads.reduce((acc, l) => { const s = l.source || 'unknown'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});

  // Referrals stats (aggregated across all programs of this project)
  let referralStats = { codes: 0, referrals_total: 0, referrals_pending: 0, referrals_converted: 0, rewards_pending_eur: 0 };
  const programIds = (programs.data || []).map(p => p.id);
  if (programIds.length) {
    const codesRes = await supabase.select('referral_codes',
      `select=id,code,uses_count,closed_won_count,total_reward_earned_eur,referrer_name,active&program_id=in.(${programIds.map(id => `"${id}"`).join(',')})&order=created_at.desc&limit=200`);
    const refsRes = await supabase.select('referrals',
      `select=id,status,referrer_reward_amount_eur,referrer_reward_paid&program_id=in.(${programIds.map(id => `"${id}"`).join(',')})&limit=500`);
    const codes = codesRes.data || [];
    const refs = refsRes.data || [];
    referralStats.codes = codes.length;
    referralStats.referrals_total = refs.length;
    referralStats.referrals_pending = refs.filter(r => r.status === 'pending').length;
    referralStats.referrals_converted = refs.filter(r => ['converted', 'rewarded'].includes(r.status)).length;
    referralStats.rewards_pending_eur = refs
      .filter(r => !r.referrer_reward_paid && ['converted', 'qualified'].includes(r.status))
      .reduce((sum, r) => sum + Number(r.referrer_reward_amount_eur || 0), 0);
    referralStats.codes_list = codes.slice(0, 20);
  }

  // KPI Targets from project.marketing_thesis (with safe fallbacks)
  const targets = project.marketing_thesis?.targets_90d || {};
  const kpis = {
    leads_total: leads.length,
    leads_30d: leads30d,
    leads_7d: leads7d,
    by_tier: tierCounts,
    by_status: statusCounts,
    by_source: sourceCounts,
    target_leads_per_month: targets.leads_per_month || '15-25',
    target_a_leads_per_month: targets.a_leads_per_month || '3-5',
    target_cpl_max_eur: targets.cpl_max_eur || 80,
    target_ssi_min: targets.ssi_min || 75,
    target_newsletter_subs: targets.newsletter_subs || 200,
    target_conversations_per_week: targets.conversations_per_week || 10
  };

  // Content stub (until B3 implemented)
  const content = {
    status: 'coming_soon',
    note: 'Posts-Scheduler ist Teil von Lead-Engine B3 — siehe LEAD-ENGINE-ARCHITECTURE.md',
    planned_pillars: [
      { id: 'leben-vor-ort', label: 'Leben vor Ort', frequency_per_week: 2 },
      { id: 'menschen',       label: 'Menschen, die wir begleitet haben', frequency_per_week: 1 },
      { id: 'wissen',         label: 'Wissen, das schützt', frequency_per_week: 1 },
      { id: 'netzwerk',       label: 'Das Netzwerk teilen', frequency_per_week: 1 }
    ],
    posts_published_30d: 0,
    posts_scheduled: 0,
    posts_drafts: 0
  };

  // Spend stub + Apollo-Lead-Scraper campaigns (was läuft tatsächlich)
  const camps = Array.isArray(scraperCamps.data) ? scraperCamps.data : [];
  const spend = {
    status: 'coming_soon_ads',
    note: 'Meta Ads / LinkedIn Ads / Google Ads-Integration ist Teil von B7+B8',
    cold_outreach: {
      apollo_campaigns: camps.length,
      apollo_campaigns_active: camps.filter(c => ['ready_to_send', 'sending'].includes(c.status)).length,
      apollo_credits_used_estimate: camps.length * 50,
      recent_campaigns: camps.slice(0, 5)
    },
    targets: {
      monthly_ad_budget_eur: 1500,
      monthly_tools_budget_eur: 149,
      cpl_max_eur: targets.cpl_max_eur || 80
    },
    actuals: {
      monthly_spent_eur: 0,
      cpl_eur: null
    }
  };

  res.json({
    ok: true,
    project: { id: projectId, slug: project.slug, name: project.name },
    generated_at: new Date().toISOString(),
    metrics: kpis,
    leads: recent,
    referrals: { programs: programs.data || [], stats: referralStats },
    content,
    spend,
    intelligence: intel.data?.[0] || null
  });
});

meRouter.delete('/projects/:slug/apis/:id', async (req, res) => {
  if (!ME_UUID_RX.test(req.params.id || '')) {
    return res.status(400).json({ ok: false, error: 'invalid_id_format' });
  }
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.delete('project_apis', `id=eq.${encodeURIComponent(req.params.id)}&project_id=eq.${project.id}`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true });
});

// ────────────────────────────────────────────────────────────
// PATCH /api/me/leads/:id — Customer-self Lead-Status-Update (account-scoped)
// Patrick ändert Lead-Status im Portal. Lead muss req.customer.account_id gehören
// (sonst 404). Status-Enum identisch zu customer-leads.js (Admin-PATCH).
// ────────────────────────────────────────────────────────────
const MeLeadStatusUpdate = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'meeting-scheduled', 'meeting-held', 'won', 'lost', 'parked']).optional(),
  notes: z.string().max(4000).optional()
}).strict().refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

meRouter.patch('/leads/:id', async (req, res) => {
  if (!ME_UUID_RX.test(req.params.id || '')) {
    return res.status(400).json({ ok: false, error: 'invalid_id_format' });
  }
  const parsed = MeLeadStatusUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });

  const accountId = req.customer.account_id;
  const updates = { ...parsed.data, updated_at: new Date().toISOString() };
  if (parsed.data.status) updates.status_changed_at = new Date().toISOString();

  // account-scope guard: only update if lead belongs to this account → no cross-account leak
  const r = await supabase.update('customer_leads',
    `id=eq.${encodeURIComponent(req.params.id)}&account_id=eq.${accountId}`, updates);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'lead_not_found' });
  res.json({ ok: true, lead: r.data[0] });
});

// ────────────────────────────────────────────────────────────
// PROJECT QUICKLINKS — Wave A2 (Headquarter Vision)
// ────────────────────────────────────────────────────────────
const QUICKLINK_CATEGORIES = ['website', 'repo', 'tool', 'service', 'resource', 'other'];

const QuicklinkCreateSchema = z.object({
  label:      z.string().min(1).max(100),
  url:        z.string().url().max(2000),
  category:   z.enum(['website', 'repo', 'tool', 'service', 'resource', 'other']),
  icon:       z.string().max(50).optional().nullable(),
  sort_order: z.number().int().min(0).max(100000).optional()
});

const QuicklinkPatchSchema = z.object({
  label:      z.string().min(1).max(100).optional(),
  url:        z.string().url().max(2000).optional(),
  category:   z.enum(['website', 'repo', 'tool', 'service', 'resource', 'other']).optional(),
  icon:       z.string().max(50).optional().nullable(),
  sort_order: z.number().int().min(0).max(100000).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

meRouter.get('/projects/:slug/quicklinks', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug, { allowCrossAccount: true });
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.select(
    'project_quicklinks',
    `select=id,label,url,category,icon,sort_order,created_at,updated_at&project_id=eq.${project.id}&order=sort_order.asc,created_at.asc`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, quicklinks: r.data ?? [], categories: QUICKLINK_CATEGORIES });
});

meRouter.post('/projects/:slug/quicklinks', async (req, res) => {
  const parsed = QuicklinkCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.insert('project_quicklinks', {
    project_id: project.id,
    label: parsed.data.label,
    url: parsed.data.url,
    category: parsed.data.category,
    icon: parsed.data.icon ?? null,
    sort_order: parsed.data.sort_order ?? 0
  });
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.status(201).json({ ok: true, quicklink: r.data?.[0] });
});

meRouter.patch('/projects/:slug/quicklinks/:id', async (req, res) => {
  if (!ME_UUID_RX.test(req.params.id || '')) {
    return res.status(400).json({ ok: false, error: 'invalid_id_format' });
  }
  const parsed = QuicklinkPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.update(
    'project_quicklinks',
    `id=eq.${encodeURIComponent(req.params.id)}&project_id=eq.${project.id}`,
    parsed.data
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'quicklink_not_found' });
  res.json({ ok: true, quicklink: r.data[0] });
});

meRouter.delete('/projects/:slug/quicklinks/:id', async (req, res) => {
  if (!ME_UUID_RX.test(req.params.id || '')) {
    return res.status(400).json({ ok: false, error: 'invalid_id_format' });
  }
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.delete(
    'project_quicklinks',
    `id=eq.${encodeURIComponent(req.params.id)}&project_id=eq.${project.id}`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true });
});
