// /api/projects — AEVUM v2 Project-Layer CRUD
//
// Endpoints:
//   GET    /api/projects                          list all (admin)
//   GET    /api/projects/:id                      get project + dashboard + agent + workflows + apis + permissions
//   POST   /api/projects                          create (account_slug + project data → spawns dashboard + agent)
//   PATCH  /api/projects/:id                      update
//   GET    /api/projects/:id/aevum-summary        AEVUM-Master view (filtered by permissions)

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { runIntelligenceAudit } from '../lib/intelligence.js';
import { safeCompare } from '../lib/security.js';

export const projectsRouter = Router();

function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || !safeCompare(tok, expected)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

// UUID regex (RFC 4122 v1-v5) — IN-01 defense-in-depth before .id route handlers
const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function requireUuid(req, res, next) {
  if (!UUID_RX.test(req.params.id || '')) {
    return res.status(400).json({ ok: false, error: 'invalid_id_format' });
  }
  next();
}

const CreateProjectSchema = z.object({
  account_slug: z.string().min(2).max(64),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(64),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  subdomain: z.string().max(200).optional(),
  tier: z.enum(['audit', 'setup', 'retainer-light', 'retainer-full', 'enterprise']).optional(),
  industry: z.string().max(100).optional(),
  dashboard_blueprint_id: z.string().optional().default('os-standard-v1'),
  agent_blueprint_id: z.string().optional().default('project-os-v1'),
  marketing_thesis_blueprint_id: z.string().optional()
});

const PatchProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  subdomain: z.string().max(200).optional().nullable(),
  status: z.enum(['onboarding', 'active', 'paused', 'churned']).optional(),
  tier: z.enum(['audit', 'setup', 'retainer-light', 'retainer-full', 'enterprise']).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  pricing: z.record(z.any()).optional()
});

// ──────────────────────────────────────────────────────────
// GET /api/projects
// ──────────────────────────────────────────────────────────
projectsRouter.get('/', requireAdmin, async (req, res) => {
  const accountSlug = req.query.account;
  let filter = '';
  if (accountSlug) {
    const acc = await supabase.select('accounts', `select=id&slug=eq.${encodeURIComponent(accountSlug)}`);
    if (!acc.ok || !acc.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });
    filter = `&account_id=eq.${acc.data[0].id}`;
  }
  const r = await supabase.select('projects', `select=*&order=created_at.desc${filter}`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, projects: r.data });
});

// ──────────────────────────────────────────────────────────
// GET /api/projects/:id
// ──────────────────────────────────────────────────────────
projectsRouter.get('/:id', requireAdmin, requireUuid, async (req, res) => {
  const id = req.params.id;
  const p = await supabase.select('projects', `select=*&id=eq.${encodeURIComponent(id)}`);
  if (!p.ok || !p.data?.length) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const project = p.data[0];

  const [dashboard, agent, workflows, apis, perms] = await Promise.all([
    supabase.select('project_dashboards', `select=*&project_id=eq.${project.id}`),
    supabase.select('project_agents', `select=*&project_id=eq.${project.id}`),
    supabase.select('project_workflows', `select=*&project_id=eq.${project.id}&order=created_at.asc`),
    supabase.select('project_apis', `select=id,service,key_label,scope,health,added_at&project_id=eq.${project.id}`),
    supabase.select('project_permissions', `select=*&project_id=eq.${project.id}`)
  ]);

  res.json({
    ok: true,
    project,
    dashboard: dashboard.data?.[0] ?? null,
    agent: agent.data?.[0] ?? null,
    workflows: workflows.data ?? [],
    apis: apis.data ?? [],
    permissions: perms.data?.[0] ?? null
  });
});

// ──────────────────────────────────────────────────────────
// POST /api/projects — create + auto-spawn dashboard + agent
// ──────────────────────────────────────────────────────────
projectsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const p = parsed.data;

  // Resolve account
  const acc = await supabase.select('accounts', `select=id&slug=eq.${encodeURIComponent(p.account_slug)}`);
  if (!acc.ok || !acc.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });
  const accountId = acc.data[0].id;

  // Resolve account_agent (parent for project_agent)
  const accAgent = await supabase.select('account_agents', `select=id&account_id=eq.${accountId}`);
  const accAgentId = accAgent.data?.[0]?.id ?? null;

  // Resolve dashboard blueprint version
  const dbBp = await supabase.select('blueprint_dashboards', `select=id,version&id=eq.${encodeURIComponent(p.dashboard_blueprint_id)}`);
  if (!dbBp.ok || !dbBp.data?.length) return res.status(400).json({ ok: false, error: 'dashboard_blueprint_not_found', id: p.dashboard_blueprint_id });

  const agBp = await supabase.select('blueprint_agents', `select=id,version&id=eq.${encodeURIComponent(p.agent_blueprint_id)}`);
  if (!agBp.ok || !agBp.data?.length) return res.status(400).json({ ok: false, error: 'agent_blueprint_not_found', id: p.agent_blueprint_id });

  // Create project
  const projData = {
    account_id: accountId,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    subdomain: p.subdomain ?? null,
    tier: p.tier ?? null,
    industry: p.industry ?? null
  };
  if (p.marketing_thesis_blueprint_id) {
    projData.marketing_thesis = { blueprint_id: p.marketing_thesis_blueprint_id };
  }

  const projRes = await supabase.insert('projects', projData);
  if (!projRes.ok) {
    if (projRes.status === 409 || JSON.stringify(projRes.error || '').includes('duplicate')) {
      return res.status(409).json({ ok: false, error: 'slug_already_exists_for_account' });
    }
    return res.status(500).json({ ok: false, error: projRes.error });
  }
  const project = projRes.data?.[0];

  // Auto-spawn dashboard + agent rows (deployment_status=pending — actual provisioning later)
  await Promise.all([
    supabase.insert('project_dashboards', {
      project_id: project.id,
      blueprint_id: dbBp.data[0].id,
      blueprint_version: dbBp.data[0].version,
      config: {},
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

  // Fire-and-forget: Intelligence Audit im Hintergrund
  const websiteUrl = p.contact_data?.website ?? acc.data[0]?.contact_data?.website ?? null;
  const linkedinUrl = p.contact_data?.linkedin ?? acc.data[0]?.contact_data?.linkedin ?? null;
  setImmediate(() => {
    runIntelligenceAudit({
      projectId: project.id,
      accountId: accountId,
      businessName: p.name,
      websiteUrl,
      linkedinUrl,
      industry: p.industry ?? null
    }).catch(err => console.error('[intelligence] Background audit failed:', err.message));
  });
});

// ──────────────────────────────────────────────────────────
// POST /api/projects/:id/intelligence — manueller Re-Trigger
// ──────────────────────────────────────────────────────────
projectsRouter.post('/:id/intelligence', requireAdmin, requireUuid, async (req, res) => {
  const id = req.params.id;
  const projRes = await supabase.select('projects', `select=id,name,account_id,industry&id=eq.${encodeURIComponent(id)}`);
  if (!projRes.data?.length) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const project = projRes.data[0];
  const { website_url, linkedin_url } = req.body;
  res.json({ ok: true, message: 'intelligence audit started' });
  // Bestehende API-Keys als Tool-Kontext mitgeben
  const apisRes = await supabase.select('project_apis', `select=service,scope&project_id=eq.${project.id}`);
  const existingTools = apisRes.data ?? [];
  setImmediate(() => {
    runIntelligenceAudit({
      projectId: project.id,
      accountId: project.account_id,
      businessName: project.name,
      websiteUrl: website_url ?? null,
      linkedinUrl: linkedin_url ?? null,
      industry: project.industry ?? null,
      existingTools
    }).catch(err => console.error('[intelligence] Manual audit failed:', err.message));
  });
});

// ──────────────────────────────────────────────────────────
// PATCH /api/projects/:id
// ──────────────────────────────────────────────────────────
projectsRouter.patch('/:id', requireAdmin, requireUuid, async (req, res) => {
  const parsed = PatchProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const id = req.params.id;
  const r = await supabase.update('projects', `id=eq.${encodeURIComponent(id)}`, parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'project_not_found' });
  res.json({ ok: true, project: r.data[0] });
});

// ──────────────────────────────────────────────────────────
// GET /api/projects/:id/aevum-summary — Master-View (Sub-OS → AEVUM-Master)
// (Permissions-filtered, Schema v1)
// ──────────────────────────────────────────────────────────
projectsRouter.get('/:id/aevum-summary', requireAdmin, requireUuid, async (req, res) => {
  const id = req.params.id;
  const p = await supabase.select('projects', `select=*&id=eq.${encodeURIComponent(id)}`);
  if (!p.ok || !p.data?.length) return res.status(404).json({ ok: false, error: 'project_not_found' });
  const project = p.data[0];

  const [perms, accPerms, workflows] = await Promise.all([
    supabase.select('project_permissions', `select=*&project_id=eq.${project.id}`),
    supabase.select('account_permissions', `select=*&account_id=eq.${project.account_id}`),
    supabase.select('project_workflows', `select=blueprint_id,status&project_id=eq.${project.id}&status=eq.deployed`)
  ]);

  const projectPerms = perms.data?.[0];
  const accountPerms = accPerms.data?.[0] ?? {};
  const effectivePerms = (projectPerms?.override_account_defaults) ? projectPerms : accountPerms;

  const shareableKpis = {};
  if (effectivePerms.share_industry) shareableKpis.industry = project.industry;
  // KPI-Delta & andere felder later, sobald source-Daten verfügbar

  res.json({
    ok: true,
    $schema: 'aevum/sub-os-summary/v1',
    sub_os_id: 'aevum-internal',
    customer_slug: project.slug,
    reported_at: new Date().toISOString(),
    aevum_relationship: {
      setup_status: project.status === 'active' ? 'completed' : 'in-progress',
      retainer_status: project.status === 'active' ? 'active' : 'none',
      health: project.status === 'active' ? 'green' : 'yellow',
      active_blueprints: (workflows.data ?? []).map(w => w.blueprint_id),
      open_aevum_tickets: 0
    },
    shareable_kpis: shareableKpis,
    system_signals: {
      last_activity_at: project.updated_at,
      open_issues_count: 0,
      ai_agent_active: false
    }
  });
});
