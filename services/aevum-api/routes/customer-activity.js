// AEVUM Customer Activity Endpoint (Block B2)
// Created: 2026-05-25
//
// Mounted at /api/me/projects/:slug/activity (JWT-gated via meRouter).
// Returns per-project usage aggregates so customers see their own spend.
//
// Aggregates from:
//   agent_usage_log   (tokens, cost_eur, endpoint, context)
//   accounts          (daily_agent_spend_eur for current period)
//
// Endpoints:
//   GET /         ?days=30      → summary + breakdown + timeseries
//   GET /csv      ?days=30      → CSV export of the project's usage log

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const customerActivityRouter = Router({ mergeParams: true });

const MAX_DAYS = 90;
const DEFAULT_DAYS = 30;

function parseDays(req) {
  const d = parseInt(req.query.days || `${DEFAULT_DAYS}`, 10);
  if (!Number.isFinite(d) || d < 1) return DEFAULT_DAYS;
  return Math.min(d, MAX_DAYS);
}

async function resolveProject(accountId, slug) {
  const r = await supabase.select(
    'projects',
    `select=id,slug,name,account_id&account_id=eq.${accountId}&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return r.data?.[0] ?? null;
}

// ─── GET / — aggregated activity ────────────────────────────
customerActivityRouter.get('/', async (req, res) => {
  try {
    const accountId = req.customer.account_id;
    const projectSlug = req.params.slug;
    if (!projectSlug) return res.status(400).json({ ok: false, error: 'missing_slug' });

    const project = await resolveProject(accountId, projectSlug);
    if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });

    const days = parseDays(req);
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    // Pull all usage rows for this account in window. Project-level filter is
    // best-effort via endpoint pattern; account-level is the hard scope.
    const usageRes = await supabase.select(
      'agent_usage_log',
      `select=endpoint,model,input_tokens,output_tokens,cost_eur,credits_spent,context,ts&account_id=eq.${accountId}&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=5000`
    );
    if (!usageRes.ok) return res.status(500).json({ ok: false, error: 'usage_query_failed' });

    const rows = usageRes.data || [];

    // KPIs
    let totalMessages = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostEur = 0;
    let totalCreditsSpent = 0;
    let lastActivity = null;

    // Breakdown by service (endpoint prefix)
    const byService = new Map(); // key → { messages, tokens, cost_eur }
    // Time-series (daily)
    const byDay = new Map(); // YYYY-MM-DD → { messages, tokens, cost_eur }

    for (const r of rows) {
      totalMessages++;
      totalInputTokens += r.input_tokens || 0;
      totalOutputTokens += r.output_tokens || 0;
      totalCostEur += parseFloat(r.cost_eur || 0);
      totalCreditsSpent += r.credits_spent || 0;
      if (!lastActivity || r.ts > lastActivity) lastActivity = r.ts;

      // Service-classify
      const ep = r.endpoint || 'unknown';
      let service = 'other';
      if (ep.includes('helpbot')) service = 'helpbot';
      else if (ep.includes('agent')) service = 'project-agent';
      else if (ep.includes('factories')) service = 'factory';
      else if (ep.includes('audit')) service = 'audit';

      const svc = byService.get(service) || { messages: 0, tokens: 0, cost_eur: 0 };
      svc.messages++;
      svc.tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
      svc.cost_eur += parseFloat(r.cost_eur || 0);
      byService.set(service, svc);

      // Daily bucket
      const day = (r.ts || '').slice(0, 10);
      if (day) {
        const d = byDay.get(day) || { messages: 0, tokens: 0, cost_eur: 0 };
        d.messages++;
        d.tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
        d.cost_eur += parseFloat(r.cost_eur || 0);
        byDay.set(day, d);
      }
    }

    // Fill empty days for nice chart rendering
    const timeseries = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      const bucket = byDay.get(day) || { messages: 0, tokens: 0, cost_eur: 0 };
      timeseries.push({
        day,
        messages: bucket.messages,
        tokens: bucket.tokens,
        cost_eur: Number(bucket.cost_eur.toFixed(4)),
      });
    }

    // Current-period billing (account-level — same number for all projects)
    const acctRes = await supabase.select(
      'accounts',
      `select=daily_agent_spend_eur,daily_spend_reset_at&id=eq.${accountId}&limit=1`
    );
    const acct = acctRes.data?.[0] || {};

    res.json({
      ok: true,
      project: { id: project.id, slug: project.slug, name: project.name },
      window_days: days,
      summary: {
        total_messages: totalMessages,
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_tokens: totalInputTokens + totalOutputTokens,
        total_cost_eur: Number(totalCostEur.toFixed(4)),
        total_credits_spent: totalCreditsSpent,
        last_activity: lastActivity,
      },
      breakdown_by_service: Array.from(byService.entries()).map(([service, v]) => ({
        service,
        messages: v.messages,
        tokens: v.tokens,
        cost_eur: Number(v.cost_eur.toFixed(4)),
      })).sort((a, b) => b.cost_eur - a.cost_eur),
      timeseries,
      current_period_billing: {
        daily_spend_eur: parseFloat(acct.daily_agent_spend_eur || 0),
        period_reset_at: acct.daily_spend_reset_at || null,
      },
    });
  } catch (e) {
    console.error('[customer-activity] err:', e?.message);
    res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// ─── GET /csv — export raw usage rows as CSV ────────────────
customerActivityRouter.get('/csv', async (req, res) => {
  try {
    const accountId = req.customer.account_id;
    const projectSlug = req.params.slug;
    const project = await resolveProject(accountId, projectSlug);
    if (!project) return res.status(404).json({ ok: false, error: 'project_not_found' });

    const days = parseDays(req);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const usageRes = await supabase.select(
      'agent_usage_log',
      `select=ts,endpoint,model,input_tokens,output_tokens,cost_eur,credits_spent,context&account_id=eq.${accountId}&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=5000`
    );
    const rows = usageRes.data || [];

    const header = 'ts,endpoint,model,input_tokens,output_tokens,cost_eur,credits_spent,context';
    const lines = rows.map(r => [
      r.ts,
      r.endpoint || '',
      r.model || '',
      r.input_tokens || 0,
      r.output_tokens || 0,
      r.cost_eur || 0,
      r.credits_spent || 0,
      `"${(r.context || '').replace(/"/g, '""')}"`,
    ].join(','));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="activity-${projectSlug}-${days}d.csv"`);
    res.send([header, ...lines].join('\n'));
  } catch (e) {
    console.error('[customer-activity csv] err:', e?.message);
    res.status(500).json({ ok: false, error: 'internal_error' });
  }
});
