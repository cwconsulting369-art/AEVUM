// /api/accounts — AEVUM v2 Account-Layer CRUD
//
// Endpoints:
//   GET    /api/accounts                    list all accounts (admin)
//   GET    /api/accounts/:slug              get account + profile + permissions + agent + projects
//   POST   /api/accounts                    create new account (+ default profile/permissions/agent)
//   PATCH  /api/accounts/:slug              update account fields
//   GET    /api/accounts/:slug/projects     list projects for account
//
// Auth: x-aevum-admin-token header must match AEVUM_ADMIN_TOKEN env (service-role behind aevum-api)
// Self-Service-Endpoints (mit JWT) kommen später.

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

export const accountsRouter = Router();

// ──────────────────────────────────────────────────────────
// Admin auth gate
// ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) {
    return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  }
  if (!tok || tok !== expected) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// ──────────────────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────────────────
const CreateAccountSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(64),
  name: z.string().min(1).max(200),
  business_name: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  client_zero: z.boolean().optional().default(false),
  contact_data: z.record(z.any()).optional().default({})
});

const PatchAccountSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  business_name: z.string().max(200).optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(['onboarding', 'active', 'paused', 'churned']).optional(),
  contact_data: z.record(z.any()).optional()
});

// ──────────────────────────────────────────────────────────
// GET /api/accounts — list
// ──────────────────────────────────────────────────────────
accountsRouter.get('/', requireAdmin, async (_req, res) => {
  const r = await supabase.select('accounts', 'select=id,slug,name,business_name,email,status,client_zero,created_at&order=created_at.desc');
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, accounts: r.data });
});

// ──────────────────────────────────────────────────────────
// GET /api/accounts/aggregate — cross-account roll-up (admin)
// Returns: every account + nested projects + permission summary + health
// Schema: aevum/account-aggregator/v1
// ──────────────────────────────────────────────────────────
const TIER_RANK = { 'audit': 0, 'setup': 1, 'retainer-light': 2, 'retainer-full': 3, 'enterprise': 4 };

function extractRetainerEur(pricingJson) {
  if (!pricingJson || typeof pricingJson !== 'object') return 0;
  const candidates = [
    pricingJson.retainer_monthly_eur,
    pricingJson.retainer_eur,
    pricingJson.monthly_eur,
    pricingJson.retainer?.monthly_eur,
    pricingJson.retainer?.eur
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function highestTier(projects) {
  let best = null;
  let bestRank = -1;
  for (const p of projects) {
    if (!p.tier) continue;
    const r = TIER_RANK[p.tier];
    if (r !== undefined && r > bestRank) { bestRank = r; best = p.tier; }
  }
  return best;
}

function deriveHealth(account, projects) {
  if (account.status === 'churned' || account.status === 'paused') return 'red';
  if (account.status === 'onboarding') return 'gray';
  if (account.status === 'active') {
    const hasDeployed = projects.some(p => (p._deployed_workflows_count || 0) >= 1);
    if (hasDeployed || account.client_zero) return 'green';
    return 'yellow';
  }
  return 'gray';
}

accountsRouter.get('/aggregate', requireAdmin, async (_req, res) => {
  // 1. Pull all accounts
  const accRes = await supabase.select(
    'accounts',
    'select=id,slug,name,status,client_zero,created_at&order=created_at.asc'
  );
  if (!accRes.ok) return res.status(500).json({ ok: false, error: accRes.error });
  const accounts = accRes.data || [];

  if (!accounts.length) {
    return res.json({
      $schema: 'aevum/account-aggregator/v1',
      ok: true,
      summary: { accounts_total: 0, accounts_active: 0, monthly_retainer_total_eur: 0, projects_total: 0 },
      accounts: []
    });
  }

  const accountIds = accounts.map(a => a.id);
  const inList = `(${accountIds.map(id => `"${id}"`).join(',')})`;

  // 2. Parallel fetch: projects + account_permissions + project_permissions + project_workflows
  const [projectsRes, permsRes] = await Promise.all([
    supabase.select(
      'projects',
      `select=id,account_id,slug,name,status,tier,industry,pricing,created_at,updated_at&account_id=in.${inList}&order=created_at.asc`
    ),
    supabase.select(
      'account_permissions',
      `select=account_id,channel_website,share_kpi_deltas,share_case_study,consent_date&account_id=in.${inList}`
    )
  ]);
  if (!projectsRes.ok) return res.status(500).json({ ok: false, error: projectsRes.error });
  if (!permsRes.ok) return res.status(500).json({ ok: false, error: permsRes.error });

  const allProjects = projectsRes.data || [];
  const allPerms = permsRes.data || [];

  // 3. Workflows + project_permissions (only if projects exist)
  let allWorkflows = [];
  let allProjPerms = [];
  if (allProjects.length) {
    const projectIds = allProjects.map(p => p.id);
    const projInList = `(${projectIds.map(id => `"${id}"`).join(',')})`;
    const [wfRes, ppRes] = await Promise.all([
      supabase.select(
        'project_workflows',
        `select=project_id,status,last_run_at,deployed_at,updated_at&project_id=in.${projInList}`
      ),
      supabase.select(
        'project_permissions',
        `select=project_id,override_account_defaults,channel_website,share_kpi_deltas,share_case_study&project_id=in.${projInList}`
      )
    ]);
    if (!wfRes.ok) return res.status(500).json({ ok: false, error: wfRes.error });
    if (!ppRes.ok) return res.status(500).json({ ok: false, error: ppRes.error });
    allWorkflows = wfRes.data || [];
    allProjPerms = ppRes.data || [];
  }

  // 4. Index helpers
  const permsByAccount = new Map(allPerms.map(p => [p.account_id, p]));
  const projPermsByProject = new Map(allProjPerms.map(p => [p.project_id, p]));
  const workflowsByProject = new Map();
  for (const w of allWorkflows) {
    if (!workflowsByProject.has(w.project_id)) workflowsByProject.set(w.project_id, []);
    workflowsByProject.get(w.project_id).push(w);
  }
  const projectsByAccount = new Map();
  for (const p of allProjects) {
    const wfs = workflowsByProject.get(p.id) || [];
    p._deployed_workflows_count = wfs.filter(w => w.status === 'deployed').length;
    // last_activity_at = max(updated_at, last_run_at, deployed_at) across workflows + project
    const candidates = [p.updated_at];
    for (const w of wfs) {
      candidates.push(w.last_run_at, w.deployed_at, w.updated_at);
    }
    p._last_activity_at = candidates
      .filter(Boolean)
      .sort()
      .at(-1) || null;
    if (!projectsByAccount.has(p.account_id)) projectsByAccount.set(p.account_id, []);
    projectsByAccount.get(p.account_id).push(p);
  }

  // 5. Build per-account aggregate
  const aggregated = accounts.map(acc => {
    const projects = projectsByAccount.get(acc.id) || [];
    const accPerms = permsByAccount.get(acc.id) || {};

    const retainerTotal = projects.reduce((sum, p) => sum + extractRetainerEur(p.pricing), 0);
    const tier = highestTier(projects);

    // Permissions summary: account-default, allow project-override if override flag set
    const computePermField = (field) => {
      let val = !!accPerms[field];
      for (const p of projects) {
        const pp = projPermsByProject.get(p.id);
        if (pp && pp.override_account_defaults && pp[field] !== null && pp[field] !== undefined) {
          if (pp[field] === true) val = true;
        }
      }
      return val;
    };

    const projectsOut = projects.map(p => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      tier: p.tier,
      industry: p.industry,
      deployed_workflows_count: p._deployed_workflows_count,
      last_activity_at: p._last_activity_at
    }));

    const out = {
      slug: acc.slug,
      name: acc.name,
      status: acc.status,
      client_zero: !!acc.client_zero,
      tier,
      retainer_monthly_total_eur: retainerTotal,
      projects: projectsOut,
      permissions_summary: {
        channel_website: computePermField('channel_website'),
        share_kpi_deltas: computePermField('share_kpi_deltas'),
        share_case_study: computePermField('share_case_study'),
        consent_signed: !!accPerms.consent_date
      },
      health: deriveHealth(acc, projects)
    };
    return out;
  });

  // 6. Sort: client_zero first, then created_at asc (preserved from initial query)
  const createdAtBySlug = new Map(accounts.map(a => [a.slug, a.created_at]));
  aggregated.sort((a, b) => {
    if (a.client_zero !== b.client_zero) return a.client_zero ? -1 : 1;
    const ca = createdAtBySlug.get(a.slug) || '';
    const cb = createdAtBySlug.get(b.slug) || '';
    return ca.localeCompare(cb);
  });

  // 7. Top-level summary
  const summary = {
    accounts_total: aggregated.length,
    accounts_active: aggregated.filter(a => a.status === 'active').length,
    monthly_retainer_total_eur: aggregated.reduce((s, a) => s + a.retainer_monthly_total_eur, 0),
    projects_total: allProjects.length
  };

  res.json({
    $schema: 'aevum/account-aggregator/v1',
    ok: true,
    summary,
    accounts: aggregated
  });
});

// ──────────────────────────────────────────────────────────
// GET /api/accounts/:slug — full detail
// ──────────────────────────────────────────────────────────
accountsRouter.get('/:slug', requireAdmin, async (req, res) => {
  const slug = req.params.slug;
  const accRes = await supabase.select('accounts', `select=*&slug=eq.${encodeURIComponent(slug)}`);
  if (!accRes.ok) return res.status(500).json({ ok: false, error: accRes.error });
  const account = accRes.data?.[0];
  if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });

  const [profile, perms, agent, projects] = await Promise.all([
    supabase.select('account_profiles', `select=*&account_id=eq.${account.id}`),
    supabase.select('account_permissions', `select=*&account_id=eq.${account.id}`),
    supabase.select('account_agents', `select=*&account_id=eq.${account.id}`),
    supabase.select('projects', `select=id,slug,name,status,tier,industry,created_at&account_id=eq.${account.id}&order=created_at.asc`)
  ]);

  res.json({
    ok: true,
    account,
    profile: profile.data?.[0] ?? null,
    permissions: perms.data?.[0] ?? null,
    agent: agent.data?.[0] ?? null,
    projects: projects.data ?? []
  });
});

// ──────────────────────────────────────────────────────────
// POST /api/accounts — create account + side-tables
// ──────────────────────────────────────────────────────────
accountsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = CreateAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const a = parsed.data;

  // Insert account
  const accRes = await supabase.insert('accounts', a);
  if (!accRes.ok) {
    if (accRes.status === 409 || JSON.stringify(accRes.error || '').includes('duplicate')) {
      return res.status(409).json({ ok: false, error: 'slug_already_exists' });
    }
    return res.status(500).json({ ok: false, error: accRes.error });
  }
  const account = accRes.data?.[0];

  // Side-tables: profile + permissions + agent (defaults)
  await Promise.all([
    supabase.insert('account_profiles', {
      account_id: account.id,
      display_name: account.name,
      visibility: 'private'
    }),
    supabase.insert('account_permissions', { account_id: account.id }),
    supabase.insert('account_agents', {
      account_id: account.id,
      agent_config: { display_name: `${account.name}'s Assistant`, language_primary: 'de' },
      deployment_status: 'pending'
    })
  ]);

  res.status(201).json({ ok: true, account });
});

// ──────────────────────────────────────────────────────────
// PATCH /api/accounts/:slug
// ──────────────────────────────────────────────────────────
accountsRouter.patch('/:slug', requireAdmin, async (req, res) => {
  const parsed = PatchAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const slug = req.params.slug;
  const r = await supabase.update('accounts', `slug=eq.${encodeURIComponent(slug)}`, parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });
  res.json({ ok: true, account: r.data[0] });
});

// ──────────────────────────────────────────────────────────
// GET /api/accounts/:slug/projects
// ──────────────────────────────────────────────────────────
accountsRouter.get('/:slug/projects', requireAdmin, async (req, res) => {
  const slug = req.params.slug;
  const acc = await supabase.select('accounts', `select=id&slug=eq.${encodeURIComponent(slug)}`);
  if (!acc.ok || !acc.data?.length) return res.status(404).json({ ok: false, error: 'account_not_found' });
  const projects = await supabase.select('projects', `select=*&account_id=eq.${acc.data[0].id}&order=created_at.asc`);
  res.json({ ok: true, projects: projects.data ?? [] });
});
