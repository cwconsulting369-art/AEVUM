// /bot/section-data — Bot-internal data endpoint
// Auth: x-aevum-admin-token (same as admin routes, localhost-only in practice)
// GET /bot/section-data?customerSlug=X&projectSlug=Y&sectionSlug=Z
//
// Returns { ok, formatted, raw } where:
//   formatted = markdown string the bot displays on section tap
//   raw       = structured data the LLM gets as context

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const botRouter = Router();

function requireBotAuth(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected || !tok || tok !== expected) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

botRouter.use(requireBotAuth);

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractRetainerEur(p) {
  if (!p || typeof p !== 'object') return 0;
  return Number(p.retainer_monthly_eur ?? p.retainer_eur ?? p.monthly_eur ?? p.retainer?.monthly_eur ?? p.retainer?.eur ?? 0);
}

function statusEmoji(s) {
  return { active: '🟢', onboarding: '🔵', paused: '🟡', churned: '🔴', prospect: '⚪' }[s] || '⚪';
}

function fmtEur(n) { return `€${Number(n).toLocaleString('de-DE')}`; }

// ── AEVUM-internal sections (carlos's own business) ──────────────────────────

async function aevumSection(sectionSlug) {
  const [accRes, projRes] = await Promise.all([
    supabase.select('accounts', 'select=id,slug,name,status,client_zero,created_at&order=created_at.asc'),
    supabase.select('projects', 'select=id,account_id,slug,name,status,tier,industry,pricing&order=created_at.asc')
  ]);
  const accounts = accRes.data ?? [];
  const projects = projRes.data ?? [];

  const projByAccount = new Map();
  for (const p of projects) {
    if (!projByAccount.has(p.account_id)) projByAccount.set(p.account_id, []);
    projByAccount.get(p.account_id).push(p);
  }

  const enriched = accounts.map(a => {
    const projs = projByAccount.get(a.id) ?? [];
    const mrr = projs.reduce((s, p) => s + extractRetainerEur(p.pricing), 0);
    return { ...a, projects: projs, mrr };
  });

  const totalMrr = enriched.reduce((s, a) => s + a.mrr, 0);

  if (sectionSlug === 'overview') {
    const byStatus = {};
    for (const a of enriched) byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    const lines = [
      `*📊 AEVUM — Übersicht*\n`,
      `Kunden gesamt: *${enriched.length}*`,
      Object.entries(byStatus).map(([s, n]) => `${statusEmoji(s)} ${s}: ${n}`).join(' | '),
      `MRR gesamt: *${fmtEur(totalMrr)}/Mo*`,
      `Projekte: *${projects.length}*`
    ];
    return {
      formatted: lines.join('\n'),
      raw: { accounts: enriched.length, by_status: byStatus, total_mrr_eur: totalMrr, projects: projects.length }
    };
  }

  if (sectionSlug === 'kunden') {
    const rows = enriched.map(a => {
      const tier = a.projects[0]?.tier || '—';
      const mrr = a.mrr ? ` | ${fmtEur(a.mrr)}/Mo` : '';
      return `${statusEmoji(a.status)} *${a.name}* — ${a.status}, ${tier}${mrr}`;
    });
    return {
      formatted: `*👥 Kunden (${enriched.length})*\n\n${rows.join('\n') || '—'}\n\n_MRR gesamt: ${fmtEur(totalMrr)}/Mo_`,
      raw: enriched.map(a => ({ name: a.name, status: a.status, mrr: a.mrr, tier: a.projects[0]?.tier }))
    };
  }

  if (sectionSlug === 'pipeline') {
    const pipeline = enriched.filter(a => a.status !== 'active' && a.status !== 'churned');
    const active   = enriched.filter(a => a.status === 'active');
    const churned  = enriched.filter(a => a.status === 'churned');
    const pipelineValue = pipeline.reduce((s, a) => s + a.mrr, 0);

    const sections = [
      `*🔥 Pipeline*\n`,
      `🟢 *Aktiv (${active.length}):* ${active.map(a => a.name).join(', ') || '—'}`,
      pipeline.length ? pipeline.map(a => `${statusEmoji(a.status)} *${a.name}* — ${a.status}`).join('\n') : '⚪ Keine Prospects',
      churned.length ? `🔴 *Churned:* ${churned.map(a => a.name).join(', ')}` : '',
      `\n_Pipeline-Wert: ${fmtEur(pipelineValue)}/Mo potentiell_`
    ].filter(Boolean);
    return {
      formatted: sections.join('\n'),
      raw: { active: active.map(a => a.name), pipeline: pipeline.map(a => ({ name: a.name, status: a.status, mrr: a.mrr })), churned: churned.map(a => a.name) }
    };
  }

  if (sectionSlug === 'revenue') {
    const sorted = [...enriched].sort((a, b) => b.mrr - a.mrr);
    const rows = sorted.filter(a => a.mrr > 0).map(a => `• *${a.name}*: ${fmtEur(a.mrr)}/Mo`);
    return {
      formatted: `*💰 Revenue*\n\nMRR gesamt: *${fmtEur(totalMrr)}/Mo*\n\n${rows.join('\n') || '—'}`,
      raw: { total_mrr_eur: totalMrr, breakdown: sorted.map(a => ({ name: a.name, mrr: a.mrr })) }
    };
  }

  // content — no live data, return placeholder
  return {
    formatted: `*📣 Content*\n\nKeine Live-Daten verknüpft.\nFrag mich zu Content-Strategie, Posts, oder Kampagnen.`,
    raw: null
  };
}

// ── Customer project sections (e.g. collaglow) ───────────────────────────────

async function projectSection(customerSlug, projectSlug, sectionSlug) {
  const accRes = await supabase.select('accounts', `select=id,name,status&slug=eq.${customerSlug}`);
  const account = accRes.data?.[0];
  if (!account) return { formatted: 'Kunde nicht gefunden.', raw: null };

  const projRes = await supabase.select('projects', `select=id,name,status,tier,industry,pricing&account_id=eq.${account.id}&slug=eq.${projectSlug}`);
  const project = projRes.data?.[0];
  if (!project) return { formatted: 'Projekt nicht gefunden.', raw: null };

  const apiRes = await supabase.select('project_apis', `select=service,health,last_used_at&project_id=eq.${project.id}`);
  const apis = apiRes.data ?? [];
  const connected = (s) => apis.find(a => a.service === s);

  const intelRes = await supabase.select('project_intelligence', `select=*&project_id=eq.${project.id}&order=created_at.desc&limit=1`);
  const intel = intelRes.data?.[0] ?? null;

  if (sectionSlug === 'overview') {
    const apiList = apis.length ? apis.map(a => `${a.health === 'ok' ? '✅' : '⚠️'} ${a.service}`).join(', ') : 'Keine APIs verknüpft';
    return {
      formatted: `*📊 Übersicht*\n\nStatus: ${statusEmoji(project.status)} ${project.status}\nTier: ${project.tier || '—'}\nAPIs: ${apiList}`,
      raw: { account: account.name, project: project.name, status: project.status, apis: apis.map(a => a.service) }
    };
  }

  if (sectionSlug === 'intelligence' && intel?.full_report) {
    const rpt = intel.full_report;
    const lines = [
      `*🧠 Intelligence*\n`,
      rpt.executive_summary ? `*Summary:*\n${rpt.executive_summary}` : '',
      rpt.top_priorities?.length ? `\n*Top Prioritäten:*\n${rpt.top_priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '',
      rpt.quick_wins_this_week?.length ? `\n*Quick Wins:*\n${rpt.quick_wins_this_week.map(w => `• ${w}`).join('\n')}` : ''
    ].filter(Boolean);
    return { formatted: lines.join('\n'), raw: rpt };
  }

  // Sections relying on connected APIs
  const sectionApiMap = { ads: ['meta_ads', 'google_ads', 'tiktok_ads'], spend: ['meta_ads', 'google_ads'], email: ['klaviyo'], shop: ['shopify'] };
  const neededApis = sectionApiMap[sectionSlug] || [];
  const liveApis = neededApis.filter(s => connected(s));

  const labels = { ads: 'Ads', spend: 'Spend', email: 'E-Mail', shop: 'Shop' };
  if (liveApis.length === 0) {
    return {
      formatted: `*${labels[sectionSlug] || sectionSlug}*\n\nKeine API-Verbindung aktiv.\nVerknüpfe ${neededApis.join(' / ')} im Portal → API-Keys.`,
      raw: null
    };
  }

  // Live data available — return from intelligence if present
  const workflowSummary = intel?.workflow_analysis ? JSON.stringify(intel.workflow_analysis).slice(0, 500) : null;
  return {
    formatted: `*${labels[sectionSlug] || sectionSlug}*\n\n✅ ${liveApis.join(', ')} verbunden.\n${workflowSummary ? `\nWorkflow-Analyse: ${workflowSummary}` : 'Frag mich zu aktuellen Metriken.'}`,
    raw: intel?.workflow_analysis ?? null
  };
}

// ── Main Route ────────────────────────────────────────────────────────────────

botRouter.get('/section-data', async (req, res) => {
  const { customerSlug, projectSlug, sectionSlug } = req.query;
  if (!customerSlug || !projectSlug || !sectionSlug) {
    return res.status(400).json({ ok: false, error: 'missing_params' });
  }
  try {
    const result = projectSlug === 'aevum' && customerSlug === 'carlos'
      ? await aevumSection(sectionSlug)
      : await projectSection(customerSlug, projectSlug, sectionSlug);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error('[bot-data]', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});
