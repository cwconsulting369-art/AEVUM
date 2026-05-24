// /bot/section-data — Bot-internal data endpoint
// Auth: x-aevum-admin-token (same as admin routes, localhost-only in practice)
// GET /bot/section-data?customerSlug=X&projectSlug=Y&sectionSlug=Z
//
// Returns { ok, formatted, raw } where:
//   formatted = markdown string the bot displays on section tap
//   raw       = structured data the LLM gets as context

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { issueMagicLinkToken } from '../lib/crypto.js';
import { safeCompare } from '../lib/security.js';

export const botRouter = Router();

function requireBotAuth(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected || !tok || !safeCompare(tok, expected)) {
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
    // Archive-Mocks rausfiltern (status=archived) — Wave B5
    supabase.select('accounts', 'select=id,slug,name,status,client_zero,created_at&status=neq.archived&order=created_at.asc'),
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

// ── Magic-Link Generator (bot → portal login without email) ──────────────────

botRouter.post('/magic-link', async (req, res) => {
  const { customerSlug } = req.body || {};
  if (!customerSlug) return res.status(400).json({ ok: false, error: 'missing_customerSlug' });

  const accRes = await supabase.select('accounts', `select=id,slug,name,email,status&slug=eq.${customerSlug}`);
  const account = accRes.data?.[0];
  if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });
  if (account.status === 'churned') return res.status(403).json({ ok: false, error: 'account_inactive' });
  if (!account.email) return res.status(400).json({ ok: false, error: 'account_has_no_email' });

  const token = issueMagicLinkToken({
    account_id: account.id,
    email: account.email,
    purpose: 'login',
    ttlSeconds: 60 * 15
  });

  const PORTAL_BASE = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
  // WR-03: token in URL fragment (not query)
  const url = `${PORTAL_BASE}/auth/verify#token=${encodeURIComponent(token)}`;

  console.log(`[bot-magic-link] Generated for slug=${account.slug}`);
  res.json({ ok: true, url, account: { name: account.name, slug: account.slug } });
});

// ── TG Verification Gate ─────────────────────────────────────────────────────

// GET /bot/tg-access?telegram_id=X
// Returns { has_access, status, account_slug? }
botRouter.get('/tg-access', async (req, res) => {
  const telegramId = parseInt(req.query.telegram_id);
  if (!telegramId) return res.status(400).json({ ok: false, error: 'missing_telegram_id' });

  const link = await supabase.select('account_telegram_links',
    `select=account_id,status&telegram_id=eq.${telegramId}`);
  const row = link.data?.[0];

  if (!row) return res.json({ ok: true, has_access: false, status: 'unknown' });
  if (row.status !== 'approved') return res.json({ ok: true, has_access: false, status: row.status });
  if (!row.account_id) return res.json({ ok: true, has_access: false, status: 'approved_no_account' });

  const acc = await supabase.select('accounts', `select=slug,name,status&id=eq.${row.account_id}`);
  const account = acc.data?.[0];
  if (!account || account.status === 'churned') return res.json({ ok: true, has_access: false, status: 'inactive' });

  res.json({ ok: true, has_access: true, account_slug: account.slug, account_name: account.name });
});

// POST /bot/request-access { telegram_id, telegram_username, telegram_name }
// Creates pending link + notifies Carlos via TG
botRouter.post('/request-access', async (req, res) => {
  const { telegram_id, telegram_username, telegram_name } = req.body || {};
  if (!telegram_id) return res.status(400).json({ ok: false, error: 'missing_telegram_id' });

  const existing = await supabase.select('account_telegram_links',
    `select=id,status&telegram_id=eq.${telegram_id}`);
  if (existing.data?.length) {
    return res.json({ ok: true, status: existing.data[0].status, already_exists: true });
  }

  const r = await supabase.insert('account_telegram_links', {
    telegram_id, telegram_username: telegram_username || null, telegram_name: telegram_name || null, status: 'pending'
  });
  const requestId = r.data?.[0]?.id;

  // Notify Carlos via his bot
  const CARLOS_ID = process.env.CARLOS_TG_USER_ID || '6436074677';
  const BOT_TOKEN = process.env.AEVUM_BOT_TOKEN;
  if (BOT_TOKEN && requestId) {
    const msg = `🔔 *Neuer Zugangsantrag*\n\nName: ${telegram_name || '–'}\nUsername: @${telegram_username || '–'}\nTelegram ID: \`${telegram_id}\`\n\nGenehmigen oder ablehnen?`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CARLOS_ID,
        text: msg,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[
          { text: '✅ Freigeben', callback_data: `approve_access:${requestId}` },
          { text: '❌ Ablehnen', callback_data: `reject_access:${requestId}` }
        ]]}
      })
    }).catch(e => console.error('[request-access] notify failed:', e.message));
  }

  console.log(`[tg-gate] Access request from telegram_id=${telegram_id} name="${telegram_name}" requestId=${requestId}`);
  res.json({ ok: true, status: 'pending', id: requestId });
});

// POST /bot/grant-access { telegram_id, account_slug }
// Called by admin bot /grant command
botRouter.post('/grant-access', async (req, res) => {
  const { telegram_id, account_slug } = req.body || {};
  if (!telegram_id || !account_slug) return res.status(400).json({ ok: false, error: 'missing_params' });

  const acc = await supabase.select('accounts', `select=id,name,email,status&slug=eq.${account_slug}`);
  const account = acc.data?.[0];
  if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });

  const existing = await supabase.select('account_telegram_links',
    `select=id,status&telegram_id=eq.${telegram_id}`);

  let r;
  if (existing.data?.length) {
    r = await supabase.update('account_telegram_links', `telegram_id=eq.${telegram_id}`, {
      account_id: account.id, status: 'approved', approved_at: new Date().toISOString()
    });
  } else {
    r = await supabase.insert('account_telegram_links', {
      telegram_id, account_id: account.id, status: 'approved', approved_at: new Date().toISOString()
    });
  }
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });

  // Notify the approved user + generate magic-link
  const BOT_TOKEN = process.env.AEVUM_BOT_TOKEN;
  if (BOT_TOKEN && account.email) {
    try {
      const token = issueMagicLinkToken({ account_id: account.id, email: account.email, purpose: 'login', ttlSeconds: 60 * 30 });
      const PORTAL_BASE = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
      // WR-03: token in URL fragment (not query)
      const url = `${PORTAL_BASE}/auth/verify#token=${encodeURIComponent(token)}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: `✅ *Dein Zugang wurde freigeschaltet!*\n\nWillkommen bei AEVUM, ${account.name}.\n\nDein Dashboard-Link (30 Min gültig):`,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [[{ text: '🚀 Dashboard öffnen', url }]] }
        })
      });
    } catch (e) {
      console.error('[grant-access] notify user failed:', e.message);
    }
  }

  console.log(`[tg-gate] Granted access telegram_id=${telegram_id} → account=${account_slug}`);
  res.json({ ok: true, account: { slug: account.slug, name: account.name } });
});

// ── Snapshot — aggregated KPIs/Orders/Credits/Docs/Runs for a customer ───────
// POST /bot/snapshot
// Body: { customerSlug, projectSlug?, include: ["kpi","orders","credits","docs","runs"] }
// Returns { ok, snapshot: { kpi?, orders?, credits?, docs?, runs? }, account, formatted }

const SNAPSHOT_PARTS = new Set(['kpi', 'orders', 'credits', 'docs', 'runs']);

async function buildKpi(accountId, projectSlug) {
  // Audits funnel + accounts mrr for the AEVUM owner; for non-owner customers,
  // build a generic "your projects" view from accounts table + project_intelligence.
  const projRes = await supabase.select('projects',
    `select=id,slug,name,status,tier,pricing&account_id=eq.${accountId}&order=created_at.asc`);
  const projects = projRes.data ?? [];
  const totalMrr = projects.reduce((s, p) => s + extractRetainerEur(p.pricing), 0);
  const active = projects.filter(p => p.status === 'active').length;
  const formatted = `*📊 KPIs*\n\nProjekte: *${projects.length}* (${active} aktiv)\nMRR: *${fmtEur(totalMrr)}/Mo*\n\n${projects.map(p => `${statusEmoji(p.status)} *${p.name}* — ${p.tier || '—'}${extractRetainerEur(p.pricing) ? ` | ${fmtEur(extractRetainerEur(p.pricing))}/Mo` : ''}`).join('\n') || '—'}`;
  return { raw: { projects: projects.length, active, total_mrr_eur: totalMrr, items: projects.map(p => ({ slug: p.slug, name: p.name, status: p.status, tier: p.tier, mrr: extractRetainerEur(p.pricing) })) }, formatted };
}

async function buildOrders(accountEmail) {
  if (!accountEmail) return { raw: [], formatted: '*🛒 Käufe*\n\nKeine E-Mail am Account hinterlegt.' };
  const enc = encodeURIComponent(accountEmail);
  const r = await supabase.select('orders',
    `select=id,created_at,paid_at,status,package_tier,package_name,total_cents,currency,recurring_interval&customer_email=eq.${enc}&order=created_at.desc&limit=10`);
  const rows = r.data ?? [];
  if (!rows.length) return { raw: [], formatted: '*🛒 Käufe*\n\nNoch keine Bestellungen.' };
  const lines = rows.map(o => {
    const eur = fmtEur((o.total_cents || 0) / 100);
    const when = new Date(o.created_at).toLocaleDateString('de-DE');
    const status = o.status === 'paid' ? '✅' : o.status === 'open' ? '⏳' : '⚠️';
    const interval = o.recurring_interval ? ` /${o.recurring_interval}` : '';
    return `${status} *${o.package_name || o.package_tier || 'Order'}* — ${eur}${interval} · ${when}`;
  });
  return { raw: rows, formatted: `*🛒 Käufe (${rows.length})*\n\n${lines.join('\n')}` };
}

async function buildCredits(accountId) {
  const [creditsRes, stampRes] = await Promise.all([
    supabase.select('account_credits', `?account_id=eq.${accountId}&select=balance,lifetime_earned`),
    supabase.select('stamp_cards', `?account_id=eq.${accountId}&select=stamps`)
  ]);
  const credits = Array.isArray(creditsRes.data) ? creditsRes.data[0] : creditsRes.data;
  const stamps  = Array.isArray(stampRes.data)   ? stampRes.data[0]   : stampRes.data;
  const balance = credits?.balance ?? 0;
  const lifetime = credits?.lifetime_earned ?? 0;
  const stampCount = stamps?.stamps ?? 0;
  const untilReward = 5 - (stampCount % 5);
  const formatted = `*💎 Credits*\n\nBalance: *${balance}*\nLifetime: ${lifetime}\nStempel: ${stampCount} (${untilReward === 5 ? 0 : untilReward} bis Reward)`;
  return { raw: { balance, lifetime, stamps: stampCount, stamps_until_reward: untilReward === 5 ? 0 : untilReward }, formatted };
}

async function buildDocs(customerSlug) {
  // Mirror docs.js root convention
  const ROOT = process.env.AEVUM_CUSTOMERS_ROOT
    || '/home/carlos/restructure-workspace/aevum-phase/AEVUM/customers';
  const path = await import('path');
  const fs = await import('fs');
  const out = [];
  for (const folder of ['inbox', 'outbox', 'shared']) {
    const dir = path.join(ROOT, customerSlug, 'docs', folder);
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isFile())
        .map(d => ({ folder, filename: d.name }));
      out.push(...entries);
    } catch {}
  }
  if (!out.length) return { raw: [], formatted: '*📁 Dokumente*\n\nKeine Files im Postfach.' };
  const lines = out.slice(0, 15).map(d => `📄 \`${d.folder}/${d.filename}\``);
  return { raw: out, formatted: `*📁 Dokumente (${out.length})*\n\n${lines.join('\n')}${out.length > 15 ? `\n\n_… +${out.length-15} weitere_` : ''}` };
}

async function buildRuns(accountId) {
  // Pull from any factory_runs tables we know exist
  const tables = [
    { name: 'dsgvo_factory_runs', label: 'DSGVO' },
    { name: 'script_factory_runs', label: 'Script' }
  ];
  const all = [];
  for (const t of tables) {
    try {
      const r = await supabase.select(t.name,
        `select=id,status,created_at&account_id=eq.${accountId}&order=created_at.desc&limit=5`);
      for (const row of (r.data || [])) all.push({ factory: t.label, ...row });
    } catch {}
  }
  all.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  const rows = all.slice(0, 10);
  if (!rows.length) return { raw: [], formatted: '*⚙️ Factory-Runs*\n\nNoch keine Runs.' };
  const lines = rows.map(r => {
    const when = new Date(r.created_at).toLocaleDateString('de-DE');
    const icon = r.status === 'done' ? '✅' : r.status === 'failed' ? '❌' : r.status === 'running' ? '⏳' : '•';
    return `${icon} *${r.factory}* — ${r.status} · ${when}`;
  });
  return { raw: rows, formatted: `*⚙️ Factory-Runs (${rows.length})*\n\n${lines.join('\n')}` };
}

botRouter.post('/snapshot', async (req, res) => {
  try {
    const { customerSlug, projectSlug, include } = req.body || {};
    if (!customerSlug) return res.status(400).json({ ok: false, error: 'missing_customerSlug' });
    const parts = Array.isArray(include) && include.length
      ? include.filter(p => SNAPSHOT_PARTS.has(p))
      : ['kpi', 'orders', 'credits'];

    const accRes = await supabase.select('accounts', `select=id,slug,name,email,status&slug=eq.${customerSlug}`);
    const account = accRes.data?.[0];
    if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });

    const snapshot = {};
    const formatted = {};
    if (parts.includes('kpi'))     { const r = await buildKpi(account.id, projectSlug);    snapshot.kpi = r.raw;     formatted.kpi = r.formatted; }
    if (parts.includes('orders'))  { const r = await buildOrders(account.email);            snapshot.orders = r.raw;  formatted.orders = r.formatted; }
    if (parts.includes('credits')) { const r = await buildCredits(account.id);              snapshot.credits = r.raw; formatted.credits = r.formatted; }
    if (parts.includes('docs'))    { const r = await buildDocs(customerSlug);               snapshot.docs = r.raw;    formatted.docs = r.formatted; }
    if (parts.includes('runs'))    { const r = await buildRuns(account.id);                 snapshot.runs = r.raw;    formatted.runs = r.formatted; }

    res.json({ ok: true, account: { slug: account.slug, name: account.name, status: account.status }, snapshot, formatted });
  } catch (e) {
    console.error('[bot-snapshot]', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

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
