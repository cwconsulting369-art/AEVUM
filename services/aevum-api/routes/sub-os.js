// /api/sub-os — Wave E3 (2026-05-24)
// ──────────────────────────────────────────────────────────────────────────────
// Unified `/aevum-summary`-style endpoint for each Customer Sub-OS.
//
//   GET /api/sub-os/:system/summary           → live (cached) KPIs per system
//   GET /api/sub-os                           → list of supported systems
//   GET /api/sub-os/snapshots/:system?limit=N → history of past snapshots
//
// Auth: x-aevum-admin-token (same gate as /api/accounts).
//
// Per-system KPIs are derived primarily from the AEVUM-DB (accounts, projects,
// customer_leads, agent_usage_log, orders, project_intelligence, customer_documents).
// External Sub-OS APIs (UH, Ketolabs, GTS, Thailand-RE) are NOT touched directly
// for now — per Carlos-Direktive utilityhub-Repo is hands-off; Ketolabs has no
// service-role keys available; GTS has separate Supabase but reads happen via
// AEVUM project-intelligence-mirror. When external live signal is unavailable
// we return `null` / "unavailable" instead of crashing.
//
// Each successful summary is persisted to public.sub_os_snapshots (mig 031) so
// LennoxOS Master-Dashboard can plot trends.
//
// In-memory cache TTL: 5 minutes per system.

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';

export const subOsRouter = Router();

// ─────────────────────────────── Admin gate ─────────────────────────────────
function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || !safeCompare(tok, expected)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

// ─────────────────────────────── Supported systems ──────────────────────────
// Maps Sub-OS slug → account slug(s) in AEVUM-DB it represents.
// Some systems map to multiple AEVUM accounts (e.g. UH = utilityhub + future HV-customers).
const SYSTEMS = {
  utilityhub: {
    label: 'UtilityHub',
    accountSlugs: ['utilityhub'],
    // Optional: live customer-portal API base. If unreachable → fallback.
    liveUrl: null, // 'http://127.0.0.1:3000/api/aevum-summary' — TBD, NICHT ANFASSEN per Carlos
  },
  ketolabs: {
    label: 'Ketolabs',
    accountSlugs: ['ketolabs'],
    liveUrl: null,
  },
  gts: {
    label: 'GoldTraderSociety',
    accountSlugs: ['goldtradersociety'],
    liveUrl: null,
  },
  'thailand-re': {
    label: 'Thailand RE',
    accountSlugs: ['patrick-roth'],
    liveUrl: null,
  },
};

// ─────────────────────────────── In-memory cache (5 min) ────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map(); // system → { ts, payload }

function fromCache(system) {
  const e = cache.get(system);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL_MS) return null;
  return e.payload;
}

function toCache(system, payload) {
  cache.set(system, { ts: Date.now(), payload });
}

// ─────────────────────────────── Helpers ────────────────────────────────────
function isoDaysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function countRows(r) {
  if (!r || !r.ok || !Array.isArray(r.data)) return 0;
  return r.data.length;
}

async function fetchAccountByAnySlug(slugs) {
  if (!slugs?.length) return [];
  const inList = `(${slugs.map(s => `"${s}"`).join(',')})`;
  const r = await supabase.select('accounts', `select=id,slug,name,status,created_at&slug=in.${inList}`);
  return r.ok ? (r.data || []) : [];
}

async function gatherCommonAccountKpis(accounts) {
  const out = {
    accounts_total: accounts.length,
    accounts_active: accounts.filter(a => a.status === 'active').length,
    accounts_onboarding: accounts.filter(a => a.status === 'onboarding').length,
    leads_7d: null,
    leads_total: null,
    projects_total: null,
    projects_active: null,
    documents_uploaded_7d: null,
    agent_calls_7d: null,
    agent_cost_eur_7d: null,
    last_activity_ts: null,
  };
  const alerts = [];
  if (!accounts.length) {
    alerts.push({ level: 'warning', message: 'no_accounts_mapped' });
    return { kpis: out, alerts };
  }
  const accIds = accounts.map(a => a.id);
  const inList = `(${accIds.map(id => `"${id}"`).join(',')})`;
  const since7 = isoDaysAgo(7);

  // Parallel reads — AEVUM-DB derived signal
  const [projects, leads7, leadsAll, docs7, agent7] = await Promise.all([
    supabase.select('projects', `select=id,status,updated_at&account_id=in.${inList}`),
    supabase.select('customer_leads', `select=id&account_id=in.${inList}&created_at=gte.${since7}`),
    supabase.select('customer_leads', `select=id&account_id=in.${inList}`),
    supabase.select('customer_documents', `select=id&account_id=in.${inList}&ts=gte.${since7}`),
    supabase.select('agent_usage_log', `select=id,cost_eur&account_id=in.${inList}&ts=gte.${since7}`),
  ]);

  if (projects.ok) {
    const list = projects.data || [];
    out.projects_total = list.length;
    out.projects_active = list.filter(p => p.status === 'active').length;
    const lastUpd = list.map(p => p.updated_at).filter(Boolean).sort().pop();
    if (lastUpd) out.last_activity_ts = lastUpd;
  }
  if (leads7.ok)  out.leads_7d = countRows(leads7);
  if (leadsAll.ok) out.leads_total = countRows(leadsAll);
  if (docs7.ok)   out.documents_uploaded_7d = countRows(docs7);
  if (agent7.ok) {
    const rows = agent7.data || [];
    out.agent_calls_7d = rows.length;
    out.agent_cost_eur_7d = +rows.reduce((s, r) => s + (Number(r.cost_eur) || 0), 0).toFixed(4);
  }

  // Alerts: stale activity (no project updates > 21d when accounts active)
  if (out.last_activity_ts && out.accounts_active > 0) {
    const ageDays = (Date.now() - new Date(out.last_activity_ts).getTime()) / 86400000;
    if (ageDays > 21) alerts.push({ level: 'warning', message: `stale_activity_${Math.floor(ageDays)}d` });
  }
  return { kpis: out, alerts };
}

// ─────────────────────────────── Per-system enrichers ───────────────────────
// Each enricher takes the common-kpi payload and overlays system-specific fields.
// External calls go in here. On failure: leave fields as `null` / mark "unavailable".

async function enrichUtilityHub(common) {
  // UH-specific (NICHT ANFASSEN): KPI candidates are doc counts per org + customer count.
  // Pull project_quicklinks + intelligence audit count as proxy signals from AEVUM-DB.
  const accIds = (common._accountIds || []);
  const inList = `(${accIds.map(id => `"${id}"`).join(',')})`;
  const [intel, ql] = await Promise.all([
    supabase.select('project_intelligence', `select=id&project_id=in.${inList}`).catch(() => ({ ok: false })),
    supabase.select('project_quicklinks',   `select=id&project_id=in.${inList}`).catch(() => ({ ok: false })),
  ]);
  return {
    audits_run_total:    intel.ok ? countRows(intel) : null,
    quicklinks_total:    ql.ok    ? countRows(ql)    : null,
    customers_external:  'unavailable', // would need direct UH-DB read
    docs_in_uh:          'unavailable',
    top_orgs_by_volume:  'unavailable',
  };
}

async function enrichKetolabs(common) {
  // Live ad-spend / email subscribers / shop orders → currently unavailable
  // (no service-role keys for Meta/Klaviyo/Shopify in aevum.env).
  return {
    ad_spend_7d_eur:     'unavailable',
    email_subscribers:   'unavailable',
    shop_orders_7d:      'unavailable',
    integration_status:  { meta_ads: 'not_configured', klaviyo: 'not_configured', shopify: 'not_configured' },
  };
}

async function enrichGts(common) {
  // GTS has its own Supabase (us-east-1, legacy). No direct creds in aevum.env.
  // Surface AEVUM-side signals + flag external-bridge as unavailable.
  return {
    members_active:        'unavailable',
    signals_published_7d:  'unavailable',
    mt5_bridge_status:     'unavailable',
    carlos_rebate_eur_7d:  'unavailable',
  };
}

async function enrichThailandRe(common) {
  // Thailand-RE: leads handled via customer_leads (mapped) + thailandre-bot pm2 service.
  // Bot msg count is local-only; mark unavailable.
  return {
    properties_inventory: 'unavailable',
    bot_msg_count_7d:     'unavailable',
    locations:            ['Pattaya', 'Phuket', 'Bangkok'], // static reference
  };
}

const ENRICHERS = {
  utilityhub:     enrichUtilityHub,
  ketolabs:       enrichKetolabs,
  gts:            enrichGts,
  'thailand-re':  enrichThailandRe,
};

// ─────────────────────────────── Persist snapshot ───────────────────────────
async function persistSnapshot(system, kpis, alerts, source) {
  try {
    await supabase.insert('sub_os_snapshots', { system, kpis, alerts, source });
  } catch (e) {
    console.error('[sub-os] snapshot persist failed:', e.message);
  }
}

// ─────────────────────────────── Routes ─────────────────────────────────────

// List supported systems
subOsRouter.get('/', requireAdmin, (_req, res) => {
  res.json({
    ok: true,
    systems: Object.entries(SYSTEMS).map(([slug, def]) => ({
      slug, label: def.label, account_slugs: def.accountSlugs
    })),
  });
});

// Aggregated view across all systems (single call for dashboard).
// IMPORTANT: must be registered BEFORE `/:system/summary` so Express does not
// route `_all` into the param-route as a (nonexistent) system slug.
subOsRouter.get('/_all/summary', requireAdmin, async (req, res) => {
  const fresh = req.query.fresh === '1' || req.query.fresh === 'true';
  const results = {};
  await Promise.all(Object.keys(SYSTEMS).map(async (s) => {
    try {
      if (!fresh) {
        const c = fromCache(s);
        if (c) { results[s] = { ...c, cached: true }; return; }
      }
      const def = SYSTEMS[s];
      const accounts = await fetchAccountByAnySlug(def.accountSlugs);
      const { kpis: common, alerts } = await gatherCommonAccountKpis(accounts);
      common._accountIds = accounts.map(a => a.id);
      const systemKpis = ENRICHERS[s] ? await ENRICHERS[s](common) : {};
      delete common._accountIds;
      const payload = {
        ok: true, system: s, label: def.label, ts: new Date().toISOString(),
        kpis: { ...common, ...systemKpis }, alerts, last_activity: common.last_activity_ts || null,
        source: 'live',
      };
      toCache(s, payload);
      persistSnapshot(s, payload.kpis, payload.alerts, 'live');
      results[s] = payload;
    } catch (err) {
      results[s] = { ok: false, system: s, error: err.message };
    }
  }));
  res.json({ ok: true, ts: new Date().toISOString(), systems: results });
});

// Snapshot history (trends) — registered BEFORE `/:system/summary` for the same reason
subOsRouter.get('/snapshots/:system', requireAdmin, async (req, res) => {
  const { system } = req.params;
  if (!SYSTEMS[system]) return res.status(404).json({ ok: false, error: 'unknown_system' });
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const r = await supabase.select(
    'sub_os_snapshots',
    `select=id,kpis,alerts,source,fetched_at&system=eq.${encodeURIComponent(system)}&order=fetched_at.desc&limit=${limit}`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, system, snapshots: r.data });
});

// Single-system summary
subOsRouter.get('/:system/summary', requireAdmin, async (req, res) => {
  const { system } = req.params;
  const def = SYSTEMS[system];
  if (!def) return res.status(404).json({ ok: false, error: 'unknown_system', supported: Object.keys(SYSTEMS) });

  // Force-bypass cache via ?fresh=1
  if (req.query.fresh !== '1' && req.query.fresh !== 'true') {
    const cached = fromCache(system);
    if (cached) return res.json({ ...cached, cached: true });
  }

  try {
    const accounts = await fetchAccountByAnySlug(def.accountSlugs);
    const { kpis: common, alerts } = await gatherCommonAccountKpis(accounts);
    common._accountIds = accounts.map(a => a.id);

    const enricher = ENRICHERS[system];
    const systemKpis = enricher ? await enricher(common) : {};

    // Strip private helper before exposing
    delete common._accountIds;

    const payload = {
      ok: true,
      system,
      label: def.label,
      ts: new Date().toISOString(),
      kpis: { ...common, ...systemKpis },
      alerts,
      last_activity: common.last_activity_ts || null,
      source: 'live',
    };

    toCache(system, payload);
    // Fire-and-forget snapshot persistence
    persistSnapshot(system, payload.kpis, payload.alerts, 'live');

    res.json(payload);
  } catch (err) {
    console.error(`[sub-os/${system}] error:`, err);
    // Last-chance fallback: serve most-recent snapshot from DB
    const snap = await supabase.select(
      'sub_os_snapshots',
      `select=kpis,alerts,fetched_at&system=eq.${encodeURIComponent(system)}&order=fetched_at.desc&limit=1`
    );
    if (snap.ok && snap.data?.[0]) {
      return res.json({
        ok: true,
        system,
        label: def.label,
        ts: snap.data[0].fetched_at,
        kpis: snap.data[0].kpis,
        alerts: snap.data[0].alerts || [],
        source: 'fallback',
        warning: 'live_fetch_failed',
        error_detail: err.message,
      });
    }
    res.status(502).json({ ok: false, error: 'summary_unavailable', detail: err.message });
  }
});

// (Aggregate + snapshots routes are registered above, BEFORE `/:system/summary`,
// so Express does not match `_all` or `snapshots` as a system slug.)
