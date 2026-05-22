// /api/cases — Public, permissions-filtered Live-Cases for AEVUM website
// Used by Kimi's Cases.tsx page on aevum-system.de
//
// Returns only accounts/projects where channel_website=true.
// All fields masked according to account_permissions toggles.

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const casesRouter = Router();

// ──────────────────────────────────────────────────────────
// GET /api/cases — public, no auth
// ──────────────────────────────────────────────────────────
casesRouter.get('/', async (_req, res) => {
  // Fetch accounts that have ANY of: channel_website permission OR client_zero
  // Permissions joined via account_permissions
  const permsRes = await supabase.select(
    'account_permissions',
    'select=account_id,share_logo,share_company_name,share_industry,share_revenue_band,share_team_size,share_kpis,share_kpi_deltas,share_case_study,share_testimonial_quote,channel_website,anonymize_revenue,anonymize_industry_detail&channel_website=eq.true'
  );

  if (!permsRes.ok) return res.status(500).json({ ok: false, error: permsRes.error });

  const accountIds = (permsRes.data || []).map(p => p.account_id);

  // Always include client_zero (Carlos) — full transparency
  const clientZeroRes = await supabase.select(
    'accounts',
    'select=id&client_zero=eq.true'
  );
  const clientZeroIds = (clientZeroRes.data || []).map(a => a.id);
  const allIds = [...new Set([...accountIds, ...clientZeroIds])];

  if (allIds.length === 0) {
    return res.json({ ok: true, cases: [] });
  }

  // Fetch accounts + profiles + projects in parallel
  const idsFilter = `account_id=in.(${allIds.join(',')})`;
  const idsFilterAcc = `id=in.(${allIds.join(',')})`;

  const [accounts, profiles, projects] = await Promise.all([
    supabase.select('accounts', `select=id,slug,name,business_name,status,client_zero,created_at&${idsFilterAcc}&order=created_at.asc`),
    supabase.select('account_profiles', `select=account_id,display_name,industry,team_size,revenue_band,vision,bio,visibility,member_since&${idsFilter}`),
    supabase.select('projects', `select=id,account_id,slug,name,description,status,industry,created_at&${idsFilter}&order=created_at.asc`)
  ]);

  // Build permissions lookup
  const permsByAccount = {};
  for (const p of permsRes.data || []) permsByAccount[p.account_id] = p;

  // Client Zero gets default-open permissions if no explicit ones
  const clientZeroDefault = {
    share_logo: true, share_company_name: true, share_industry: true,
    share_revenue_band: true, share_team_size: true, share_kpis: true,
    share_kpi_deltas: true, share_case_study: true, share_testimonial_quote: true,
    channel_website: true, anonymize_revenue: false, anonymize_industry_detail: false
  };

  const profilesByAccount = {};
  for (const p of profiles.data || []) profilesByAccount[p.account_id] = p;

  const projectsByAccount = {};
  for (const proj of projects.data || []) {
    if (!projectsByAccount[proj.account_id]) projectsByAccount[proj.account_id] = [];
    projectsByAccount[proj.account_id].push(proj);
  }

  // Compose case objects with permissions-masking
  const cases = (accounts.data || []).map(acc => {
    const perms = permsByAccount[acc.id] || (acc.client_zero ? clientZeroDefault : null);
    if (!perms) return null;
    const profile = profilesByAccount[acc.id];
    const accProjects = projectsByAccount[acc.id] || [];

    const caseObj = {
      slug: acc.slug,
      client_zero: acc.client_zero,
      member_since: profile?.member_since || acc.created_at?.slice(0, 10),
      status: acc.status
    };

    if (perms.share_logo) caseObj.logo_present = true;
    if (perms.share_company_name) caseObj.company = acc.business_name || acc.name;
    if (perms.share_industry) {
      caseObj.industry = perms.anonymize_industry_detail
        ? generalizeIndustry(profile?.industry)
        : profile?.industry;
    }
    if (perms.share_revenue_band) {
      caseObj.revenue_band = perms.anonymize_revenue
        ? anonymizeRevenue(profile?.revenue_band)
        : profile?.revenue_band;
    }
    if (perms.share_team_size) caseObj.team_size = profile?.team_size;

    if (perms.share_case_study && profile?.vision) {
      caseObj.story_excerpt = profile.bio || profile.vision;
    }

    if (perms.share_kpi_deltas) {
      // TODO: pull from project_workflows.metrics — for now stub
      caseObj.kpi_deltas = [];
    }

    caseObj.projects_count = accProjects.length;

    return caseObj;
  }).filter(Boolean);

  res.json({ ok: true, $schema: 'aevum/cases/v1', cases });
});

function anonymizeRevenue(band) {
  if (!band) return null;
  const mapping = {
    '<100k': 'unter sechsstellig',
    '100k-500k': 'sechsstellig',
    '500k-1m': 'mittlere sechsstellige',
    '1m-5m': 'siebenstellig',
    '5m+': 'mehrere Millionen'
  };
  return mapping[band] || band;
}

function generalizeIndustry(industry) {
  if (!industry) return null;
  const mapping = {
    'real-estate': 'Immobilien-Sektor',
    'e-commerce': 'Online-Handel',
    'b2b-saas': 'B2B-Software',
    'consulting': 'Beratung',
    'agency': 'Dienstleister',
    'finance': 'Finanzdienstleistung',
    'healthcare': 'Gesundheitsbranche',
    'manufacturing': 'Produktion',
    'education': 'Bildung',
    'hospitality': 'Gastronomie',
    'energy-consulting': 'Energieberatung',
    'ai-systems': 'AI-Technologie'
  };
  return mapping[industry] || industry;
}
