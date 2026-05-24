// AEVUM PDF-Pitch-Report Renderer
//
// Input: auditId (audits.analysis_result must be populated by auto-plan.js)
// Output: PDF uploaded to Supabase Storage bucket `audit-pdfs`,
//         audits.plan_pdf_url updated with signed URL.
//
// Stack: puppeteer-core + system-installed Google Chrome (/usr/bin/google-chrome)
//   Why: server has Chrome already installed → smallest deps footprint,
//        no Chromium-binary download (3-150MB), works headless on Linux.
//        @sparticuz/chromium-min targets serverless (Lambda) and is
//        heavier than just reusing the existing Chrome.
//
// HTML template inlined below (German, dark theme, Manrope font from Google Fonts).

import puppeteer from 'puppeteer-core';
import { supabase } from './supabase.js';

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtEur(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n));
}

function severityBadge(sev) {
  const map = {
    critical: { bg: '#7f1d1d', fg: '#fecaca', label: 'KRITISCH' },
    high:     { bg: '#9a3412', fg: '#fed7aa', label: 'HOCH' },
    medium:   { bg: '#854d0e', fg: '#fde68a', label: 'MITTEL' },
    low:      { bg: '#1e3a8a', fg: '#bfdbfe', label: 'NIEDRIG' }
  };
  const cfg = map[sev] || map.medium;
  return `<span class="badge" style="background:${cfg.bg};color:${cfg.fg}">${cfg.label}</span>`;
}

function dealBadge(deal) {
  const map = {
    A: { color: '#10b981', label: 'A · CASH', desc: 'Direkter Setup + Retainer · Cash-Modell' },
    B: { color: '#3b82f6', label: 'B · CASHFLOW', desc: 'Reduzierter Setup · höherer Retainer · gestreckt' },
    C: { color: '#a855f7', label: 'C · GROWTH', desc: 'Niedriger Setup · Revenue-Share · Wachstums-Partnerschaft' }
  };
  return map[deal] || map.A;
}

// ──────────────────────────────────────────────────────────
// HTML Template
// ──────────────────────────────────────────────────────────
function renderHtml({ audit, analysis }) {
  const a = analysis || {};
  const company = esc(audit.company || audit.answers?.unternehmen?.name || '—');
  const name = esc(audit.name || '—');
  const auditIdShort = (audit.id || '').slice(0, 8);
  const dateStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const painPoints = a.identified_pain_points || [];
  const blueprints = a.recommended_blueprints || [];
  const tools = a.tool_stack_recommendation || { keep: [], add: [], remove: [] };
  const cost = a.cost_calculation || {};
  const roadmap = a.roadmap || {};
  const agentSpec = a.agent_build_spec || {};
  const deal = (a.deal_recommendation || 'A').toString().toUpperCase();
  const dealCfg = dealBadge(deal);
  const confidence = a.confidence_score ?? 0;
  const selectedTier = a.selected_tier || null;
  const tierRange = a.tier_range || null;
  const tierValidation = a.tier_validation || null;
  const alternatives = Array.isArray(a.alternative_offers) ? a.alternative_offers : [];
  const tierLabelMap = {
    'audit-only':        'Audit Only',
    'tier-S-start':      'Tier S — Start',
    'tier-M-growth':     'Tier M — Growth',
    'tier-L-skalierung': 'Tier L — Skalierung',
    'tier-B-cashflow':   'Tier B — Cashflow-Deal',
    'tier-C-growth-share': 'Tier C — Growth + Revenue-Share'
  };
  const tierLabel = selectedTier ? (tierLabelMap[selectedTier] || selectedTier) : null;

  // Alternatives HTML (Cashflow / RevShare options)
  const alternativesHtml = alternatives.length === 0 ? '' : `
    <div class="alt-block">
      <h3 style="color: var(--accent); margin-bottom: 8px;">Alternative Deal-Modelle</h3>
      <p class="muted" style="margin-bottom: 12px; font-size: 11px;">Falls Cash für Setup knapp ist oder du Performance-gekoppelt arbeiten willst — diese Optionen stehen zusätzlich offen:</p>
      ${alternatives.map(alt => `
        <div class="card" style="margin-bottom: 10px; padding: 12px 14px; border-color: var(--accent-dim);">
          <div class="row-between" style="margin-bottom: 6px;">
            <div style="font-weight: 700; color: var(--accent);">${esc(alt.label || alt.tier)}</div>
            <div class="muted" style="font-size: 10px;">${esc(alt.tier)}</div>
          </div>
          <div class="desc">${esc(alt.description || '')}</div>
          <div class="kv-row" style="margin-top: 8px;">
            <div class="kv"><span class="kv-k">Setup-Range</span><span class="kv-v">${fmtEur(alt.setup_range?.[0] || 0)} – ${fmtEur(alt.setup_range?.[1] || 0)}</span></div>
            <div class="kv"><span class="kv-k">Retainer / Mo</span><span class="kv-v">${fmtEur(alt.retainer_range?.[0] || 0)} – ${fmtEur(alt.retainer_range?.[1] || 0)}</span></div>
            ${alt.revshare_pct_range
              ? `<div class="kv"><span class="kv-k">RevShare</span><span class="kv-v">${alt.revshare_pct_range[0]}–${alt.revshare_pct_range[1]}%</span></div>`
              : ''}
            ${alt.min_term_months ? `<div class="kv"><span class="kv-k">Mindestlaufzeit</span><span class="kv-v">${alt.min_term_months} Mo</span></div>` : ''}
            ${alt.term_months ? `<div class="kv"><span class="kv-k">Laufzeit</span><span class="kv-v">${alt.term_months} Mo</span></div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const tierBannerHtml = !selectedTier ? '' : `
    <div class="tier-banner">
      <div class="tier-banner-head">
        <div class="tier-eyebrow">Empfohlenes Paket (mig009-Tier-Mapping)</div>
        <div class="tier-name">${esc(tierLabel)}</div>
      </div>
      <div class="tier-ranges">
        <div class="tier-range-item">
          <div class="kv-k">Setup-Range</div>
          <div class="kv-v">${fmtEur(tierRange?.setup_min || 0)} – ${fmtEur(tierRange?.setup_max || 0)}</div>
        </div>
        <div class="tier-range-item">
          <div class="kv-k">Retainer / Mo</div>
          <div class="kv-v">${fmtEur(tierRange?.retainer_min || 0)} – ${fmtEur(tierRange?.retainer_max || 0)}</div>
        </div>
        <div class="tier-range-item">
          <div class="kv-k">Komplexität</div>
          <div class="kv-v">${esc(tierValidation?.complexity_score ?? '?')}/10</div>
        </div>
        <div class="tier-range-item">
          <div class="kv-k">Deal-Type</div>
          <div class="kv-v">${esc(tierRange?.deal_type || 'A')}</div>
        </div>
      </div>
      ${tierValidation?.rationale ? `<div class="tier-rationale">${esc(tierValidation.rationale)}</div>` : ''}
    </div>
  `;

  // Pain-Points
  const painPointsHtml = painPoints.length === 0
    ? `<div class="muted">Keine spezifischen Pain-Points identifiziert.</div>`
    : painPoints.map(p => `
      <div class="card pain">
        <div class="row-between">
          <div class="category">${esc(p.category || 'Allgemein')}</div>
          ${severityBadge(p.severity)}
        </div>
        <div class="desc">${esc(p.description || '')}</div>
        ${p.impact_estimate_hours_monthly != null
          ? `<div class="impact">Geschätzter Zeitverlust: <strong>${esc(p.impact_estimate_hours_monthly)} h / Monat</strong></div>`
          : ''}
      </div>
    `).join('');

  // Blueprints
  const blueprintsHtml = blueprints.length === 0
    ? `<div class="muted">Keine Blueprints empfohlen.</div>`
    : blueprints.map(b => `
      <div class="card blueprint">
        <div class="bp-head">
          <div class="bp-id">${esc(b.blueprint_id || '—')}</div>
          <div class="bp-version">v${esc((b.blueprint_version || 'v1.0.0').replace(/^v/, ''))}</div>
        </div>
        <div class="desc">${esc(b.rationale || '')}</div>
        <div class="kv-row">
          <div class="kv"><span class="kv-k">Setup</span><span class="kv-v">${esc(b.estimated_setup_hours ?? '—')} h</span></div>
          <div class="kv"><span class="kv-k">Wert / Monat</span><span class="kv-v">${esc(b.estimated_monthly_value_hours_saved ?? '—')} h gespart</span></div>
        </div>
      </div>
    `).join('');

  // Tool-Stack
  const toolTable = (rows, label) => {
    if (!rows || rows.length === 0) return `<tr><td colspan="3" class="muted">— keine ${esc(label)} —</td></tr>`;
    return rows.map(t => typeof t === 'string'
      ? `<tr><td>${esc(t)}</td><td class="muted">—</td><td class="muted">—</td></tr>`
      : `<tr><td>${esc(t.tool || t.name || '—')}</td><td>${esc(t.purpose || '—')}</td><td class="num">${t.monthly_cost_eur != null ? fmtEur(t.monthly_cost_eur) : '—'}</td></tr>`
    ).join('');
  };

  // Cost-Calc
  const setup = cost.setup_fee_eur ?? 0;
  const toolBase = cost.tool_costs_monthly_eur ?? 0;
  const toolMargin = cost.tool_costs_with_margin_eur ?? (toolBase * 2);
  const retainer = cost.retainer_monthly_eur ?? 0;
  const revShare = cost.revenue_share_pct_optional;
  const yearTotal = cost.first_year_total_eur ?? (setup + 12 * (retainer + toolMargin));

  // Roadmap
  const phase = (arr) => (arr || []).map(item => `<li>${esc(item)}</li>`).join('') || `<li class="muted">—</li>`;

  // Agent spec
  const skills = (agentSpec.skills || []).map(s => `<span class="chip">${esc(s)}</span>`).join('') || `<span class="muted">—</span>`;
  const apis = (agentSpec.required_apis || []).map(s => `<span class="chip">${esc(s)}</span>`).join('') || `<span class="muted">—</span>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>AEVUM Pitch-Report — ${company}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --bg-card: #14141d;
    --bg-card-2: #1a1a25;
    --border: #26263a;
    --text: #f5f5fa;
    --text-dim: #a8a8b8;
    --text-muted: #6e6e80;
    --accent: #e0a458;       /* AEVUM gold */
    --accent-dim: #8a6532;
    --good: #10b981;
    --bad: #ef4444;
    --warn: #f59e0b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 11px;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 16mm;
    page-break-after: always;
    background: var(--bg);
  }
  .page:last-child { page-break-after: auto; }

  h1, h2, h3, h4 { font-weight: 700; letter-spacing: -0.01em; }
  h1 { font-size: 34px; line-height: 1.1; }
  h2 { font-size: 20px; margin-bottom: 14px; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 8px; }
  h3 { font-size: 14px; margin-bottom: 6px; }
  p  { color: var(--text-dim); }
  .muted { color: var(--text-muted); }
  .num { font-variant-numeric: tabular-nums; }

  /* Cover */
  .cover {
    display: flex; flex-direction: column; justify-content: space-between;
    height: 261mm;
  }
  .brand {
    font-family: 'Manrope', sans-serif;
    font-weight: 800; font-size: 28px; letter-spacing: 0.18em;
    color: var(--accent);
  }
  .brand-sub { color: var(--text-muted); font-size: 10px; letter-spacing: 0.3em; margin-top: 6px; text-transform: uppercase; }

  .cover-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .cover-eyebrow { color: var(--accent); letter-spacing: 0.3em; text-transform: uppercase; font-size: 10px; margin-bottom: 14px; }
  .cover-title { font-size: 44px; font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 18px; }
  .cover-customer { font-size: 22px; color: var(--text-dim); font-weight: 500; }
  .cover-meta {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border);
  }
  .cover-meta .label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 4px; }
  .cover-meta .value { color: var(--text); font-size: 14px; font-weight: 600; }

  .footer {
    color: var(--text-muted); font-size: 9px;
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 14px; border-top: 1px solid var(--border);
  }

  /* Card */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 10px;
  }
  .card.pain { border-left: 3px solid var(--warn); }
  .card.blueprint { border-left: 3px solid var(--accent); }
  .card.deal { border-left: 3px solid var(--good); padding: 18px 22px; }

  .row-between { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 6px; }
  .category { font-weight: 600; font-size: 12px; }
  .desc { color: var(--text-dim); font-size: 11px; margin-top: 4px; }
  .impact { color: var(--text-muted); font-size: 10px; margin-top: 8px; }

  .badge {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    padding: 3px 8px; border-radius: 4px; text-transform: uppercase;
    display: inline-block;
  }

  .bp-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .bp-id { font-weight: 700; font-size: 12px; color: var(--text); }
  .bp-version { font-size: 9px; color: var(--text-muted); font-family: monospace; }
  .kv-row { display: flex; gap: 24px; margin-top: 10px; }
  .kv { display: flex; flex-direction: column; gap: 2px; }
  .kv-k { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .kv-v { font-size: 13px; font-weight: 600; color: var(--text); }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  thead th {
    text-align: left; padding: 8px 10px;
    font-size: 9px; color: var(--text-muted); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    border-bottom: 1px solid var(--border);
  }
  tbody td {
    padding: 9px 10px; font-size: 11px;
    border-bottom: 1px solid var(--border); color: var(--text-dim);
  }
  tbody tr:last-child td { border-bottom: none; }
  th.num, td.num { text-align: right; }

  .tool-section { margin-bottom: 14px; }
  .tool-section h3 { color: var(--accent); font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 4px; }

  /* Cost summary */
  .cost-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-bottom: 14px;
  }
  .cost-box {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px 18px;
  }
  .cost-box .label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 6px; }
  .cost-box .value { font-size: 22px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .cost-box .sub   { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

  .cost-total {
    background: linear-gradient(135deg, #1a1a25 0%, #2a2014 100%);
    border: 1px solid var(--accent-dim); border-radius: 8px;
    padding: 18px 22px; margin-top: 8px;
  }
  .cost-total .label { font-size: 10px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
  .cost-total .value { font-size: 32px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
  .cost-total .sub   { font-size: 11px; color: var(--text-dim); margin-top: 6px; }

  .formula { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 8px; padding: 8px 10px; background: var(--bg-card-2); border-radius: 4px; }

  /* Tier-Banner (Wave A6) */
  .tier-banner { border: 1.5px solid var(--accent); background: linear-gradient(135deg, rgba(224,164,88,0.08), rgba(224,164,88,0.02)); border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; }
  .tier-banner-head { margin-bottom: 12px; }
  .tier-eyebrow { font-size: 9px; color: var(--accent); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 4px; }
  .tier-name { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.01em; }
  .tier-ranges { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .tier-range-item { background: var(--bg-card-2); border-radius: 4px; padding: 8px 10px; }
  .tier-range-item .kv-k { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 4px; display: block; }
  .tier-range-item .kv-v { font-size: 12px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
  .tier-rationale { margin-top: 12px; font-size: 10px; color: var(--text-dim); padding: 8px 10px; background: var(--bg-card-2); border-radius: 4px; line-height: 1.5; }

  /* Alternative-Block */
  .alt-block { margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border); }

  /* Roadmap */
  .roadmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .phase { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; }
  .phase-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .phase-num { font-size: 24px; font-weight: 800; color: var(--accent); line-height: 1; }
  .phase-days { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.16em; }
  .phase ul { list-style: none; }
  .phase li {
    font-size: 10.5px; color: var(--text-dim);
    padding: 4px 0 4px 14px; position: relative; line-height: 1.45;
  }
  .phase li::before {
    content: "▸"; color: var(--accent); position: absolute; left: 0; top: 4px; font-size: 9px;
  }

  /* Agent spec */
  .agent-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 18px 22px;
  }
  .agent-name { font-size: 18px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
  .agent-persona { font-size: 11px; color: var(--text-dim); font-style: italic; margin-bottom: 14px; }
  .agent-spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .spec-block .label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 6px; }
  .chip {
    display: inline-block; background: var(--bg-card-2); border: 1px solid var(--border);
    border-radius: 14px; padding: 3px 10px; font-size: 10px; color: var(--text-dim);
    margin: 2px 4px 2px 0;
  }

  /* Deal */
  .deal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 6px; }
  .deal-opt {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px 16px; opacity: 0.5;
  }
  .deal-opt.active { opacity: 1; border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent-dim) inset; }
  .deal-letter { font-size: 28px; font-weight: 800; color: var(--accent); line-height: 1; }
  .deal-name { font-size: 11px; font-weight: 700; color: var(--text); margin-top: 4px; }
  .deal-desc { font-size: 10px; color: var(--text-dim); margin-top: 6px; }
  .deal-rec {
    margin-top: 14px; padding: 14px 18px;
    background: linear-gradient(135deg, #14241a 0%, #1a2a14 100%);
    border: 1px solid #1f6f48; border-radius: 8px;
  }
  .deal-rec-label { font-size: 10px; color: var(--good); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 6px; }
  .deal-rec-text { font-size: 12px; color: var(--text); font-weight: 500; line-height: 1.5; }

  .confidence {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--bg-card-2); border: 1px solid var(--border);
    padding: 4px 10px; border-radius: 14px; font-size: 10px;
    color: var(--text-muted);
  }
  .confidence-bar { display: inline-block; width: 60px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .confidence-bar-fill { display: block; height: 100%; background: var(--accent); width: ${Math.max(0, Math.min(100, confidence))}%; }
</style>
</head>
<body>

<!-- ===== COVER ===== -->
<section class="page cover">
  <div>
    <div class="brand">AEVUM</div>
    <div class="brand-sub">Workflow Generation Machine</div>
  </div>

  <div class="cover-mid">
    <div class="cover-eyebrow">Pitch-Report · Auto-Plan v1</div>
    <div class="cover-title">Ihr maßgeschneiderter<br>Automatisierungs-Plan</div>
    <div class="cover-customer">${company}</div>

    <div class="cover-meta">
      <div>
        <div class="label">Ansprechpartner</div>
        <div class="value">${name}</div>
      </div>
      <div>
        <div class="label">Audit-ID</div>
        <div class="value" style="font-family: monospace; font-size:12px">${esc(auditIdShort)}</div>
      </div>
      <div>
        <div class="label">Erstellt am</div>
        <div class="value">${esc(dateStr)}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>AEVUM · aevum-system.de · hello@aevum-system.de</div>
    <div>
      <span class="confidence">
        Konfidenz <span class="confidence-bar"><span class="confidence-bar-fill"></span></span> ${confidence}%
      </span>
    </div>
  </div>
</section>

<!-- ===== PAIN-POINTS ===== -->
<section class="page">
  <h2>1. Identifizierte Pain-Points</h2>
  <p style="margin-bottom: 16px;">Basis: Ihre Audit-Antworten + ggf. hochgeladene Dokumente. Schweregrad-Skala: niedrig → mittel → hoch → kritisch.</p>
  ${painPointsHtml}

  <h2 style="margin-top: 28px;">2. Empfohlene Blueprints</h2>
  <p style="margin-bottom: 16px;">Vordefinierte Workflow-Pakete aus unserer Library. Jeder Blueprint hat dokumentierte Setup-Zeit und monatlichen Zeitersparnis-Wert.</p>
  ${blueprintsHtml}
</section>

<!-- ===== TOOL-STACK ===== -->
<section class="page">
  <h2>3. Tool-Stack-Empfehlung</h2>
  <p style="margin-bottom: 16px;">Konsolidierung Ihres aktuellen Stacks. Behalten · Hinzufügen · Entfernen.</p>

  <div class="tool-section">
    <h3>+ Hinzufügen</h3>
    <table>
      <thead><tr><th>Tool</th><th>Zweck</th><th class="num">Kosten / Monat</th></tr></thead>
      <tbody>${toolTable(tools.add, 'neuen Tools')}</tbody>
    </table>
  </div>

  <div class="tool-section">
    <h3>= Behalten</h3>
    <table>
      <thead><tr><th>Tool</th><th>Zweck</th><th class="num">Kosten / Monat</th></tr></thead>
      <tbody>${toolTable(tools.keep, 'beibehaltenen Tools')}</tbody>
    </table>
  </div>

  <div class="tool-section">
    <h3>− Entfernen</h3>
    <table>
      <thead><tr><th>Tool</th><th>Begründung</th><th class="num">Einsparung / Monat</th></tr></thead>
      <tbody>${toolTable(tools.remove, 'zu entfernenden Tools')}</tbody>
    </table>
  </div>

  <h2 style="margin-top: 28px;">4. Kosten-Kalkulation</h2>
  <p style="margin-bottom: 16px;">AEVUM-Pricing: Setup ≈ 3× Retainer (Baulig-Faustregel). Tool-Lizenzen werden mit Margin-Faktor ×2 weiterberechnet (Service-Margin).</p>

  ${tierBannerHtml}

  <div class="cost-grid">
    <div class="cost-box">
      <div class="label">Setup (einmalig)</div>
      <div class="value">${fmtEur(setup)}</div>
      <div class="sub">Audit · Tool-Setup · Workflow-Implementierung · Onboarding</div>
    </div>
    <div class="cost-box">
      <div class="label">Retainer (monatlich)</div>
      <div class="value">${fmtEur(retainer)}</div>
      <div class="sub">Monitoring · Iteration · Support · Reporting</div>
    </div>
    <div class="cost-box">
      <div class="label">Tool-Kosten (Listenpreis)</div>
      <div class="value">${fmtEur(toolBase)}</div>
      <div class="sub">Was Sie ohne uns direkt zahlen würden</div>
    </div>
    <div class="cost-box">
      <div class="label">Tool-Kosten (über AEVUM)</div>
      <div class="value">${fmtEur(toolMargin)}</div>
      <div class="sub">Inkl. Service-Margin ×2 — wir verwalten Lizenzen, Updates, Ausfälle</div>
    </div>
  </div>

  ${revShare ? `
    <div class="cost-box" style="margin-bottom: 10px;">
      <div class="label">Optional · Revenue-Share</div>
      <div class="value">${esc(revShare)}%</div>
      <div class="sub">Nur bei Deal-Type C — performance-gebunden, statt klassischem Retainer</div>
    </div>
  ` : ''}

  <div class="cost-total">
    <div class="label">Gesamt Jahr 1 (Setup + 12 Mo · Retainer + Tools)</div>
    <div class="value">${fmtEur(yearTotal)}</div>
    <div class="sub">Berechnung: ${fmtEur(setup)} Setup + 12 × (${fmtEur(retainer)} Retainer + ${fmtEur(toolMargin)} Tools)</div>
  </div>

  <div class="formula">
    Formel: setup_fee + 12 × (retainer_monthly + tool_costs_with_margin) = first_year_total
  </div>

  ${alternativesHtml}
</section>

<!-- ===== ROADMAP ===== -->
<section class="page">
  <h2>5. Roadmap · 30 / 60 / 90 Tage</h2>
  <p style="margin-bottom: 18px;">Drei klar getaktete Phasen. Jede Phase liefert ein abgeschlossenes Ergebnis — keine offenen Baustellen.</p>

  <div class="roadmap-grid">
    <div class="phase">
      <div class="phase-head">
        <div class="phase-num">30</div>
        <div class="phase-days">Tag 0 – 30</div>
      </div>
      <ul>${phase(roadmap.phase_1_days_0_30)}</ul>
    </div>
    <div class="phase">
      <div class="phase-head">
        <div class="phase-num">60</div>
        <div class="phase-days">Tag 31 – 60</div>
      </div>
      <ul>${phase(roadmap.phase_2_days_31_60)}</ul>
    </div>
    <div class="phase">
      <div class="phase-head">
        <div class="phase-num">90</div>
        <div class="phase-days">Tag 61 – 90</div>
      </div>
      <ul>${phase(roadmap.phase_3_days_61_90)}</ul>
    </div>
  </div>

  <h2 style="margin-top: 28px;">6. Ihr eigener AEVUM-Agent</h2>
  <p style="margin-bottom: 14px;">Mit dem Setup wird ein dedizierter AI-Agent für ${company} aufgebaut — dauerhaft, mit Zugriff auf Ihre Tools und Daten.</p>

  <div class="agent-card">
    <div class="agent-name">${esc(agentSpec.display_name || 'Workflow Assistant')}</div>
    <div class="agent-persona">${esc(agentSpec.persona || '—')}</div>

    <div class="agent-spec-grid">
      <div class="spec-block">
        <div class="label">Skills</div>
        <div>${skills}</div>
      </div>
      <div class="spec-block">
        <div class="label">Sprache · Required APIs</div>
        <div>
          <span class="chip">${esc((agentSpec.language_primary || 'de').toUpperCase())}</span>
          ${apis}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== DEAL ===== -->
<section class="page">
  <h2>7. Deal-Empfehlung</h2>
  <p style="margin-bottom: 18px;">Drei Modelle — wir empfehlen <strong style="color: var(--accent)">Modell ${deal}</strong> für Ihren Case.</p>

  <div class="deal-grid">
    <div class="deal-opt ${deal === 'A' ? 'active' : ''}">
      <div class="deal-letter">A</div>
      <div class="deal-name">CASH</div>
      <div class="deal-desc">Klassisch. Setup + monatlicher Retainer. Maximale Planungssicherheit, kein Lock-In.</div>
    </div>
    <div class="deal-opt ${deal === 'B' ? 'active' : ''}">
      <div class="deal-letter">B</div>
      <div class="deal-name">CASHFLOW</div>
      <div class="deal-desc">Setup über 6 Monate gestreckt, leicht höherer Retainer. Schont Cash-Reserven.</div>
    </div>
    <div class="deal-opt ${deal === 'C' ? 'active' : ''}">
      <div class="deal-letter">C</div>
      <div class="deal-name">GROWTH</div>
      <div class="deal-desc">Reduzierter Setup, performance-gebundener Revenue-Share. Wir wachsen mit Ihnen.</div>
    </div>
  </div>

  <div class="deal-rec">
    <div class="deal-rec-label">Unsere Empfehlung</div>
    <div class="deal-rec-text">
      <strong>Modell ${deal} · ${esc(dealCfg.label.split(' · ')[1] || dealCfg.label)}</strong> — ${esc(dealCfg.desc)}.
      Konfidenz dieser Empfehlung: <strong>${confidence}%</strong>.
    </div>
  </div>

  <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border);">
    <h3 style="color: var(--accent); margin-bottom: 8px;">Nächster Schritt</h3>
    <p style="font-size: 12px;">
      Wir besprechen diesen Plan persönlich in einem 30-Minuten-Call.
      Termin buchen: <strong style="color: var(--text);">aevum-system.de/termin</strong> ·
      Direkt antworten: <strong style="color: var(--text);">hello@aevum-system.de</strong>
    </p>
  </div>

  <div style="margin-top: 60px;" class="footer">
    <div>AEVUM · Audit ${esc(auditIdShort)} · ${esc(dateStr)}</div>
    <div>Auto-Plan v1 · Konfidenz ${confidence}%</div>
  </div>
</section>

</body>
</html>`;
}

// ──────────────────────────────────────────────────────────
// Puppeteer launch helper
// ──────────────────────────────────────────────────────────
async function launchBrowser() {
  return puppeteer.launch({
    executablePath: CHROME_EXECUTABLE,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none'
    ]
  });
}

// ──────────────────────────────────────────────────────────
// Upload to Supabase Storage
// ──────────────────────────────────────────────────────────
async function uploadPdfToStorage({ auditId, pdfBuffer }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE creds missing');

  const objectPath = `${auditId}/pitch-${Date.now()}.pdf`;
  const uploadUrl = `${url}/storage/v1/object/audit-pdfs/${objectPath}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true'
    },
    body: pdfBuffer
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`storage_upload_failed status=${res.status} body=${txt.slice(0, 200)}`);
  }

  // Signed URL — bucket is private. 30-day expiry (2,592,000 s).
  const signRes = await fetch(`${url}/storage/v1/object/sign/audit-pdfs/${objectPath}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 30 })
  });
  if (!signRes.ok) {
    const txt = await signRes.text();
    throw new Error(`storage_sign_failed status=${signRes.status} body=${txt.slice(0, 200)}`);
  }
  const signData = await signRes.json();
  const signedUrl = `${url}/storage/v1${signData.signedURL || signData.signedUrl}`;
  return { object_path: objectPath, signed_url: signedUrl };
}

// ──────────────────────────────────────────────────────────
// Main entry — renderPitchPdf(auditId)
// ──────────────────────────────────────────────────────────
export async function renderPitchPdf(auditId) {
  console.log(`[pdf-renderer] start audit=${auditId}`);

  // 1. Load audit
  const auditRes = await supabase.select('audits', `select=*&id=eq.${auditId}`);
  if (!auditRes.ok || !auditRes.data?.length) {
    throw new Error('audit_not_found');
  }
  const audit = auditRes.data[0];
  if (!audit.analysis_result) {
    throw new Error('analysis_result_missing — run auto-plan first');
  }

  // 2. Render HTML → PDF
  const html = renderHtml({ audit, analysis: audit.analysis_result });

  let browser;
  let pdfBuffer;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: false
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  console.log(`[pdf-renderer] rendered ${pdfBuffer.length} bytes`);

  // 3. Upload
  const { object_path, signed_url } = await uploadPdfToStorage({ auditId, pdfBuffer });

  // 4. Update audit row
  await supabase.update('audits', `id=eq.${auditId}`, {
    plan_pdf_url: signed_url
  });

  console.log(`[pdf-renderer] done audit=${auditId} path=${object_path}`);
  return { ok: true, object_path, signed_url, bytes: pdfBuffer.length };
}
