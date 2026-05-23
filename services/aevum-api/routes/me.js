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

export const meRouter = Router();

// All endpoints gated by JWT auth
meRouter.use(requireCustomerAuth);

// Customer Project-Agent chat + memory (Lennox-style file memory).
// Mounted as a sub-router so :slug propagates via mergeParams.
meRouter.use('/projects/:slug/agent', projectAgentRouter);

// ────────────────────────────────────────────────────────────
// GET /api/me
// ────────────────────────────────────────────────────────────
meRouter.get('/', async (req, res) => {
  const id = req.customer.account_id;
  const [acc, profile, perms, agent, projects] = await Promise.all([
    supabase.select('accounts', `select=*&id=eq.${id}`),
    supabase.select('account_profiles', `select=*&account_id=eq.${id}`),
    supabase.select('account_permissions', `select=*&account_id=eq.${id}`),
    supabase.select('account_agents', `select=id,deployment_status,channels,deployed_at&account_id=eq.${id}`),
    supabase.select('projects', `select=id,slug,name,status,tier,industry,created_at&account_id=eq.${id}&order=created_at.asc`)
  ]);
  if (!acc.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });
  res.json({
    ok: true,
    account: acc.data[0],
    profile: profile.data?.[0] ?? null,
    permissions: perms.data?.[0] ?? null,
    agent: agent.data?.[0] ?? null,
    projects: projects.data ?? []
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
  const r = await supabase.select('projects', `select=*&account_id=eq.${id}&order=created_at.asc`);
  res.json({ ok: true, projects: r.data ?? [] });
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

async function resolveProjectForCustomer(accountId, slug) {
  const r = await supabase.select('projects', `select=id&account_id=eq.${accountId}&slug=eq.${encodeURIComponent(slug)}`);
  return r.data?.[0] ?? null;
}

meRouter.get('/projects/:slug/apis', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
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
// GET /api/me/projects/:slug/dashboard
// aevum slug → AEVUM business ops dashboard (DashboardData type)
// other slugs → ad-platform KPI dashboard
// ────────────────────────────────────────────────────────────
meRouter.get('/projects/:slug/dashboard', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });

  // ── AEVUM client-zero business dashboard ──────────────────
  if (req.params.slug === 'aevum') {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0,0,0,0);
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);
    const weekStartIso = weekStart.toISOString();
    const prevWeekIso = prevWeekStart.toISOString();

    const [auditsThisW, auditsPrevW, auditsRecent, allAccounts, helpbotW, helpbotRecent] = await Promise.all([
      supabase.select('audits', `select=id&created_at=gte.${weekStartIso}`),
      supabase.select('audits', `select=id&created_at=gte.${prevWeekIso}&created_at=lt.${weekStartIso}`),
      supabase.select('audits', `select=id,created_at,name,email,company,industry,status,plan_pdf_url,analysis_result,meta&order=created_at.desc&limit=20`),
      supabase.select('accounts', `select=id,slug,name,status,client_zero,contact_data,created_at&order=created_at.desc`),
      supabase.select('helpbot_conversations', `select=id&started_at=gte.${weekStartIso}`),
      supabase.select('helpbot_conversations', `select=id,session_id,started_at,last_msg_at,message_count,extracted_data&order=last_msg_at.desc&limit=10`),
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
        stripe_mrr_eur: mrrEur, pending_invoices_count: 0, pending_invoices_eur: 0,
        setup_fees_collected_month_eur: 0,
        customer_ltv_estimate_eur: mrrEur > 0 ? mrrEur * 18 : null,
        has_stripe: false, note: 'Stripe-Anbindung ausstehend — MRR aus account.contact_data berechnet',
      },
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

meRouter.delete('/projects/:slug/apis/:id', async (req, res) => {
  const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
  if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const r = await supabase.delete('project_apis', `id=eq.${encodeURIComponent(req.params.id)}&project_id=eq.${project.id}`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true });
});
