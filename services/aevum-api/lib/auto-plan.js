// AEVUM Auto-Plan Engine
//
// Input: audit_id (with answers JSONB filled per AEVUM-V2-SCHEMAS §3)
// Output: analysis_result JSONB written back to audits row, conforming to aevum/auto-plan/v1
//
// Pipeline:
//   1. Load audit + uploaded_files
//   2. LLM call (Claude Sonnet) with structured-output prompt
//   3. Cost-calc using Baulig-pricing tiers (from blueprint_pricing)
//   4. Map recommendations to blueprint_workflows
//   5. Generate roadmap (30/60/90)
//   6. Persist analysis_result + status='plan-ready'

import { supabase } from './supabase.js';
import { notifyCarlos } from './tg-notify.js';
import { renderPitchPdf } from './pdf-renderer.js';
import { logUsage } from './credit-spend.js';
import {
  TIER_RANGES,
  mapComplexityToTier,
  validateToolMargin,
  escalateTierForMargin,
  deriveBudgetSignal
} from './tier-mapper.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

// D1 Edge-Case-Handling — exportable helpers for unit-tests
// ───────────────────────────────────────────────────────────

// Truncate huge audit answers (>MAX bytes). Keeps top-level keys, trims string values.
export const MAX_ANSWERS_BYTES = 100 * 1024; // 100KB hard cap
export function truncateAnswers(answers) {
  if (!answers || typeof answers !== 'object') return { answers: {}, truncated: false, originalBytes: 0 };
  const raw = JSON.stringify(answers);
  const bytes = Buffer.byteLength(raw, 'utf8');
  if (bytes <= MAX_ANSWERS_BYTES) return { answers, truncated: false, originalBytes: bytes };

  // Walk + truncate string values progressively until under cap
  const clone = JSON.parse(raw);
  const stringRefs = [];
  function collect(obj, path = []) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') stringRefs.push({ obj, key: k, len: v.length });
      else if (typeof v === 'object') collect(v, [...path, k]);
    }
  }
  collect(clone);
  stringRefs.sort((a, b) => b.len - a.len);
  let cap = 2000;
  while (Buffer.byteLength(JSON.stringify(clone), 'utf8') > MAX_ANSWERS_BYTES && cap > 100) {
    for (const r of stringRefs) {
      if (r.obj[r.key].length > cap) r.obj[r.key] = r.obj[r.key].slice(0, cap) + '…[truncated]';
    }
    cap = Math.floor(cap / 2);
  }
  return {
    answers: clone,
    truncated: true,
    originalBytes: bytes,
    note: `audit-answers exceeded ${MAX_ANSWERS_BYTES} bytes — string values truncated`
  };
}

// Extract JSON from LLM text response. Handles ```json fences, leading prose, trailing text.
export function extractJson(text) {
  if (typeof text !== 'string') return null;
  const stripped = text.trim();
  // Strip ```json fences if present
  const fence = stripped.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const body = fence ? fence[1] : stripped;
  // Greedy match first {...} block
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// Validate llm result against minimum shape contract before passing to finalize
export function validateLlmResult(r) {
  if (!r || typeof r !== 'object') return { ok: false, reason: 'not_object' };
  const required = ['complexity_score', 'identified_pain_points', 'recommended_blueprints'];
  for (const k of required) {
    if (!(k in r)) return { ok: false, reason: `missing_${k}` };
  }
  if (!Array.isArray(r.identified_pain_points)) return { ok: false, reason: 'pain_points_not_array' };
  if (!Array.isArray(r.recommended_blueprints)) return { ok: false, reason: 'blueprints_not_array' };
  const c = Number(r.complexity_score);
  if (!Number.isFinite(c) || c < 1 || c > 10) return { ok: false, reason: 'complexity_out_of_range' };
  return { ok: true };
}

// Sleep helper for exponential backoff
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Anthropic API call with retry on timeout / 5xx / overloaded. Returns { ok, data, attempts, error }.
export async function callAnthropicWithRetry({ apiKey, model, body, maxRetries = 2, timeoutMs = 60_000 }) {
  let attempts = 0;
  let lastErr = null;
  while (attempts <= maxRetries) {
    attempts += 1;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      clearTimeout(t);
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { ok: true, data, attempts };
      // Retry on 429/5xx/overloaded; bail on 4xx else
      const retryable = res.status === 429 || res.status >= 500 || data?.error?.type === 'overloaded_error';
      lastErr = { status: res.status, payload: data };
      if (!retryable || attempts > maxRetries) return { ok: false, error: lastErr, attempts };
    } catch (err) {
      clearTimeout(t);
      lastErr = { status: 0, message: err.message, aborted: err.name === 'AbortError' };
      if (attempts > maxRetries) return { ok: false, error: lastErr, attempts };
    }
    // Exponential backoff: 500ms, 1500ms, 3500ms ...
    await sleep(500 * Math.pow(3, attempts - 1));
  }
  return { ok: false, error: lastErr, attempts };
}

// ──────────────────────────────────────────────────────────
// LLM-Analyse — single Claude call with structured JSON output
// ──────────────────────────────────────────────────────────
async function llmAnalyze({ answers, uploadedFiles, blueprintWorkflows, pricingTiers, telemetry = {} }) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[auto-plan] No ANTHROPIC_API_KEY — returning stub analysis');
    telemetry.fallback_reason = 'no_api_key';
    return stubAnalysis(answers);
  }

  // D1 Edge: Truncate huge audit-answers (>100KB) before sending to LLM
  const { answers: safeAnswers, truncated, originalBytes, note } = truncateAnswers(answers);
  if (truncated) {
    console.warn(`[auto-plan] ${note} (was ${originalBytes} bytes)`);
    telemetry.answers_truncated = true;
    telemetry.original_bytes = originalBytes;
  }

  const workflowList = blueprintWorkflows.map(w => ({
    id: w.id, name: w.display_name, category: w.category,
    desc: w.description, setup_hours: w.estimated_setup_hours,
    monthly_value: w.estimated_monthly_value_hours_saved
  }));
  const pricingList = pricingTiers.map(p => ({
    id: p.id, name: p.display_name, deal_type: p.deal_type,
    setup_min: p.setup_range_min_eur, setup_max: p.setup_range_max_eur,
    retainer_min: p.retainer_range_min_eur, retainer_max: p.retainer_range_max_eur
  }));

  const system = `Du bist der AEVUM Auto-Plan-Generator. Du analysierst Audit-Antworten und generierst strukturierten JSON-Output (Schema aevum/auto-plan/v1). Du gibst NIEMALS einen Tier oder finale Setup-/Retainer-Preise selbst aus — das Tier-Mapping ist deterministisch und passiert nach deiner Analyse. Antworte NUR mit valid JSON, keine Erklärungen.`;

  const user = `# AUDIT-ANTWORTEN
${JSON.stringify(safeAnswers, null, 2)}

# UPLOADED FILES (Metadata)
${JSON.stringify(uploadedFiles || [], null, 2)}

# AVAILABLE BLUEPRINTS (workflow-library)
${JSON.stringify(workflowList, null, 2)}

# AVAILABLE PRICING TIERS (Referenz — du wählst NICHT direkt)
${JSON.stringify(pricingList, null, 2)}

# AUFGABE
Generiere JSON nach Schema aevum/auto-plan/v1 mit diesen Pflicht-Feldern:

- complexity_score (1-10) — Wie aufwändig wird die Lösung? 1-3 = Single-Workflow + Standard-Dashboard, 4-6 = 2-3 Workflows + Custom-Agent, 7-10 = Multi-Project + Enterprise-Integration + SLA.
- budget_signal (NUR übernehmen wenn explizit aus Audit-Antworten erkennbar) — {setup_max, retainer_max} in EUR. Sonst null lassen.
- cashflow_indicator: true/false — knapper Setup-Cash aber stabiler MRR? (Anker für Tier-B-Empfehlung)
- growth_share_indicator: true/false — niedriges Setup-Budget aber klares Revenue-Growth-Potenzial? (Anker für Tier-C-Empfehlung)
- identified_pain_points: Array {category, description, severity (low|medium|high|critical), impact_estimate_hours_monthly}
- recommended_blueprints: Array {blueprint_id, blueprint_version: "v1.0.0", rationale, estimated_setup_hours, estimated_monthly_value_hours_saved}
- tool_stack_recommendation: {keep: [], add: [{tool, monthly_cost_eur, purpose}], remove: []}
- roadmap: {phase_1_days_0_30: [], phase_2_days_31_60: [], phase_3_days_61_90: []}
- agent_build_spec: {display_name, persona (short), language_primary, skills (array), required_apis: array}
- dashboard_modules: array aus enum: finance-widget, revenue-chart, kpi-grid, roadmap-timeline, workflow-status, recent-activity, people-table, data-hub-links, reports-archive, agent-chat
- confidence_score: 0-100 (niedrig wenn Antworten vage/kurz)

WICHTIG:
- Setze KEIN deal_recommendation, KEIN selected_tier, KEINE setup_fee_eur / retainer_monthly_eur. Tier-Mapping + Pricing macht das Backend deterministisch nach mig009-Ranges.
- Tool-Lizenzen mit monthly_cost_eur korrekt ausweisen (Pflicht für Margin×2-Check).
- Wähle Blueprints passend zu identified_pain_points.

Antworte NUR mit JSON.`;

  const t0 = Date.now();
  const result = await callAnthropicWithRetry({
    apiKey: ANTHROPIC_API_KEY,
    model: ANTHROPIC_MODEL,
    body: {
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }]
    },
    maxRetries: 2,
    timeoutMs: 60_000
  });
  telemetry.latency_ms = Date.now() - t0;
  telemetry.attempts = result.attempts;

  if (!result.ok) {
    const errSummary = result.error?.status === 0
      ? `network/timeout (${result.error.aborted ? 'timeout' : result.error.message})`
      : `HTTP ${result.error?.status}`;
    console.error(`[auto-plan] LLM failed after ${result.attempts} attempts: ${errSummary}`);
    telemetry.fallback_reason = 'llm_failed';
    telemetry.error = errSummary;
    notifyCarlos(`⚠️ *Auto-Plan LLM fallback* — ${errSummary} after ${result.attempts} attempts. Using stub.`).catch(() => {});
    return stubAnalysis(safeAnswers);
  }

  const data = result.data;
  telemetry.input_tokens = data.usage?.input_tokens || 0;
  telemetry.output_tokens = data.usage?.output_tokens || 0;

  // D1 Edge: token-limit detection — Claude returns stop_reason='max_tokens' when truncated
  if (data.stop_reason === 'max_tokens') {
    console.warn('[auto-plan] LLM hit max_tokens — response may be truncated');
    telemetry.max_tokens_hit = true;
  }

  const text = data.content?.[0]?.text || '';
  const parsed = extractJson(text);
  if (!parsed) {
    console.error('[auto-plan] non-parseable JSON in LLM response (first 200 chars):', text.slice(0, 200));
    telemetry.fallback_reason = 'parse_failed';
    telemetry.parse_success = false;
    notifyCarlos(`⚠️ *Auto-Plan parse-fail* — LLM response not valid JSON. Stub fallback used.`).catch(() => {});
    return stubAnalysis(safeAnswers);
  }
  telemetry.parse_success = true;

  // D1 Edge: validate shape — if invalid, log + fallback
  const validation = validateLlmResult(parsed);
  if (!validation.ok) {
    console.error(`[auto-plan] LLM result failed validation: ${validation.reason}`);
    telemetry.fallback_reason = `validation_${validation.reason}`;
    notifyCarlos(`⚠️ *Auto-Plan validation-fail* — \`${validation.reason}\`. Stub fallback used.`).catch(() => {});
    return stubAnalysis(safeAnswers);
  }

  return parsed;
}

export function stubAnalysis(answers) {
  const a = answers || {};
  const industry = a?.unternehmen?.industry || a?.industry || a?.fi?.branche || a?.branche || 'other';
  const pain = a?.pain_points?.biggest_time_waster
    || a?.fi?.pain
    || a?.ag?.zeitfresser
    || a?.pb?.skalierung
    || a?.pain
    || 'Unbekannt';

  // Derive complexity from team-size + revenue heuristics
  const teamSize = Number(a?.unternehmen?.team_size || a?.team_size || a?.ag?.mitarbeiter || 0);
  const monthlyRev = Number(a?.unternehmen?.monthly_revenue || a?.monthly_revenue || 0);
  let complexity = 3;
  if (teamSize >= 20 || monthlyRev >= 100000) complexity = 7;
  else if (teamSize >= 10 || monthlyRev >= 50000) complexity = 5;
  else if (teamSize >= 5 || monthlyRev >= 20000) complexity = 4;

  // Heuristic: deeper pain description → higher confidence
  const painLen = typeof pain === 'string' ? pain.length : 0;
  const confidence = Math.min(60, 30 + Math.floor(painLen / 20) * 5);

  // Blueprint selection based on pain category keywords
  const painLower = String(pain).toLowerCase();
  const blueprints = [];
  if (/(report|kpi|dashboard|metrik|zahl|finance)/.test(painLower)) {
    blueprints.push({ blueprint_id: 'reporting-pipeline-v1', blueprint_version: 'v1.0.0',
      rationale: 'Reduziert manuelle Reporting-Arbeit', estimated_setup_hours: 4, estimated_monthly_value_hours_saved: 8 });
  }
  if (/(lead|akquise|sales|crm|kunde)/.test(painLower)) {
    blueprints.push({ blueprint_id: 'lead-scraper-v1', blueprint_version: 'v1.0.0',
      rationale: 'Automatisiert Lead-Akquise', estimated_setup_hours: 6, estimated_monthly_value_hours_saved: 12 });
  }
  if (/(mail|email|inbox|kommunikation)/.test(painLower)) {
    blueprints.push({ blueprint_id: 'inbox-triage-v1', blueprint_version: 'v1.0.0',
      rationale: 'Mail-Triage + Auto-Response', estimated_setup_hours: 3, estimated_monthly_value_hours_saved: 10 });
  }
  if (blueprints.length === 0) {
    blueprints.push({ blueprint_id: 'reporting-pipeline-v1', blueprint_version: 'v1.0.0',
      rationale: 'Default Reporting-Baustein (Pain unklar)', estimated_setup_hours: 4, estimated_monthly_value_hours_saved: 8 });
  }

  return {
    complexity_score: complexity,
    budget_signal: null,
    cashflow_indicator: false,
    growth_share_indicator: false,
    identified_pain_points: [
      { category: 'workflow', description: typeof pain === 'string' ? pain : 'Unbekannt',
        severity: complexity >= 5 ? 'high' : 'medium', impact_estimate_hours_monthly: complexity * 5 }
    ],
    recommended_blueprints: blueprints,
    tool_stack_recommendation: { keep: [], add: [], remove: [] },
    roadmap: {
      phase_1_days_0_30: ['Setup AEVUM-OS-Dashboard', 'Audit Workflows', 'API-Keys einsammeln'],
      phase_2_days_31_60: ['Erstes Workflow live', 'Monitoring aktiv'],
      phase_3_days_61_90: ['Optimierung', 'Skalierung']
    },
    agent_build_spec: {
      display_name: `${industry} Assistant`, persona: 'Hilfreich, präzise, business-fokussiert',
      language_primary: 'de', skills: ['kpi-reporter', 'data-fetcher'], required_apis: []
    },
    dashboard_modules: ['kpi-grid', 'finance-widget', 'roadmap-timeline', 'workflow-status'],
    confidence_score: confidence,
    _stub: true
  };
}

// ──────────────────────────────────────────────────────────
// Deterministic finalization — applies tier-mapping + margin-check
// LLM output (or stub) goes in, full analysis_result comes out.
// ──────────────────────────────────────────────────────────
function finalizeAnalysis(llmResult, answers) {
  const out = { ...llmResult };

  // 1. Derive budget signal (explicit > revenue-heuristic > team-size > unknown)
  const llmBudget = llmResult.budget_signal || {};
  const derived = deriveBudgetSignal(answers);
  const budgetSignal = {
    setup_max: Number(llmBudget.setup_max) || derived.setup_max || 0,
    retainer_max: Number(llmBudget.retainer_max) || derived.retainer_max || 0,
    setup_min: Number(llmBudget.setup_min) || derived.setup_min || 0,
    retainer_min: Number(llmBudget.retainer_min) || derived.retainer_min || 0,
    source: (Number(llmBudget.setup_max) || Number(llmBudget.retainer_max)) ? 'llm' : derived.source
  };
  out.budget_signal_resolved = budgetSignal;

  // 2. Hard tier-mapping (no LLM)
  const complexity = Number(llmResult.complexity_score) || 3;
  let selectedTier = mapComplexityToTier(complexity, budgetSignal);

  // 3. Cashflow / growth-share override based on LLM-Indikatoren
  // — but only if the base mapping picked a Cash-Deal tier (A)
  const baseRange = TIER_RANGES[selectedTier];
  if (baseRange?.deal_type === 'A') {
    if (llmResult.growth_share_indicator === true && budgetSignal.setup_max > 0 && budgetSignal.setup_max < 8000) {
      selectedTier = 'tier-C-growth-share';
    } else if (llmResult.cashflow_indicator === true && budgetSignal.retainer_max >= 1500) {
      selectedTier = 'tier-B-cashflow';
    }
  }

  // 4. Margin×2 validation. If fails → escalate tier (only if not B/C).
  const recommendedTools = llmResult.tool_stack_recommendation?.add || [];
  let marginCheck = validateToolMargin({ tier: selectedTier, recommendedTools });
  let escalated = false;
  if (!marginCheck.ok && TIER_RANGES[selectedTier]?.deal_type === 'A') {
    const next = escalateTierForMargin({ tier: selectedTier, recommendedTools });
    if (next) {
      selectedTier = next;
      marginCheck = validateToolMargin({ tier: selectedTier, recommendedTools });
      escalated = true;
    }
  }

  const tierRange = TIER_RANGES[selectedTier];

  // 5. Build cost_calculation hard-bounded by tier ranges
  const toolMonthly = marginCheck.toolCost || 0;
  const toolWithMargin = toolMonthly * 2;
  // Setup: mid-of-range as default, but never below tool×2 floor for retainer reasons
  const setupFee = Math.round((tierRange.setup_min + tierRange.setup_max) / 2);
  // Retainer: max(tier_min, tool×2). Never exceed tier_max.
  const retainerMin = tierRange.retainer_min;
  const retainerMax = tierRange.retainer_max;
  const retainerMonthly = retainerMax === 0
    ? 0
    : Math.min(retainerMax, Math.max(retainerMin, toolWithMargin || retainerMin));
  const revShare = tierRange.revshare_pct_range
    ? (tierRange.revshare_pct_range[0] + tierRange.revshare_pct_range[1]) / 2
    : null;
  const firstYearTotal = setupFee + 12 * (retainerMonthly + toolWithMargin);

  out.selected_tier = selectedTier;
  out.tier_range = tierRange;
  out.deal_recommendation = tierRange.deal_type;
  out.cost_calculation = {
    setup_fee_eur: setupFee,
    setup_range_min_eur: tierRange.setup_min,
    setup_range_max_eur: tierRange.setup_max,
    tool_costs_monthly_eur: toolMonthly,
    tool_costs_with_margin_eur: toolWithMargin,
    retainer_monthly_eur: retainerMonthly,
    retainer_range_min_eur: retainerMin,
    retainer_range_max_eur: retainerMax,
    revenue_share_pct_optional: revShare,
    first_year_total_eur: firstYearTotal
  };
  out.tier_validation = {
    margin_check: marginCheck,
    escalated,
    complexity_score: complexity,
    rationale: buildTierRationale(selectedTier, complexity, budgetSignal, marginCheck, escalated)
  };

  // 6. Alternatives — show cashflow + growth-share options for low-budget cases
  out.alternative_offers = buildAlternatives(selectedTier, budgetSignal, toolWithMargin);

  return out;
}

function buildTierRationale(tier, complexity, budgetSignal, marginCheck, escalated) {
  const parts = [];
  parts.push(`Komplexität ${complexity}/10 → ${tier} (mig009-Range).`);
  if (budgetSignal.source !== 'unknown') {
    parts.push(`Budget-Signal: setup_max=€${budgetSignal.setup_max}, retainer_max=€${budgetSignal.retainer_max} (Quelle: ${budgetSignal.source}).`);
  }
  if (escalated) {
    parts.push(`Tier eskaliert (Tool-Kosten×2 = €${marginCheck.minRetainer}/Mo überschritten Original-Retainer-Cap).`);
  }
  if (!marginCheck.ok) {
    parts.push(`⚠ Margin-Check fehlgeschlagen — Tools zu teuer für Retainer-Range.`);
  } else {
    parts.push(`Margin×2-Check ok: Tools €${marginCheck.toolCost}/Mo → ×2 = €${marginCheck.minRetainer} ≤ Retainer-Max €${marginCheck.retainerMax}.`);
  }
  return parts.join(' ');
}

function buildAlternatives(primaryTier, budgetSignal, toolWithMargin) {
  const alts = [];
  if (primaryTier !== 'tier-B-cashflow' && budgetSignal.retainer_max >= 1500) {
    const r = TIER_RANGES['tier-B-cashflow'];
    alts.push({
      tier: 'tier-B-cashflow',
      label: 'Cashflow-Deal',
      description: 'Reduziertes Setup (-50%), erhöhter Retainer (+30%), Mindestlaufzeit 12 Monate. Für knappes Setup-Cash bei stabilem MRR.',
      setup_range: [r.setup_min, r.setup_max],
      retainer_range: [r.retainer_min, r.retainer_max],
      min_term_months: 12
    });
  }
  if (primaryTier !== 'tier-C-growth-share' && budgetSignal.setup_max < 8000) {
    const r = TIER_RANGES['tier-C-growth-share'];
    alts.push({
      tier: 'tier-C-growth-share',
      label: 'Growth + Revenue-Share',
      description: 'Minimaler Setup-Aufwand + 10-15% Anteil am Umsatz-Delta nach Baseline-Locking. Laufzeit 24 Monate.',
      setup_range: [r.setup_min, r.setup_max],
      retainer_range: [r.retainer_min, r.retainer_max],
      revshare_pct_range: r.revshare_pct_range,
      term_months: 24
    });
  }
  return alts;
}

// ──────────────────────────────────────────────────────────
// Main entry — runAutoPlan(auditId)
// ──────────────────────────────────────────────────────────
export async function runAutoPlan(auditId) {
  console.log(`[auto-plan] starting for audit ${auditId}`);

  const auditRes = await supabase.select('audits', `select=*&id=eq.${auditId}`);
  if (!auditRes.ok || !auditRes.data?.length) {
    return { ok: false, error: 'audit_not_found' };
  }
  const audit = auditRes.data[0];

  // Set status = analyzing
  await supabase.update('audits', `id=eq.${auditId}`, {
    status: 'analyzing', analyzed_at: null
  });

  // Load blueprints + pricing for LLM context
  const [bpRes, prRes] = await Promise.all([
    supabase.select('blueprint_workflows', 'select=*&is_active=eq.true'),
    supabase.select('blueprint_pricing', 'select=*&is_active=eq.true')
  ]);

  const telemetry = {};
  const llmResult = await llmAnalyze({
    answers: audit.answers || {},
    uploadedFiles: audit.uploaded_files || [],
    blueprintWorkflows: bpRes.data || [],
    pricingTiers: prRes.data || [],
    telemetry
  });

  // Persist telemetry to agent_usage_log (best-effort, fire-and-forget)
  logUsage({
    accountId: audit.account_id || null,
    sessionId: auditId,
    endpoint: 'auto-plan',
    model: ANTHROPIC_MODEL,
    inputTokens: telemetry.input_tokens || 0,
    outputTokens: telemetry.output_tokens || 0,
    context: `auto-plan latency=${telemetry.latency_ms}ms attempts=${telemetry.attempts} parse=${telemetry.parse_success} fallback=${telemetry.fallback_reason || 'none'} truncated=${telemetry.answers_truncated || false}`
  }).catch((err) => console.error('[auto-plan] telemetry log failed:', err.message));

  // Deterministic finalization — tier-mapping + margin-check (no LLM)
  const result = finalizeAnalysis(llmResult, audit.answers || {});

  // Schema-stamp
  const analysis_result = {
    $schema: 'aevum/auto-plan/v1',
    generated_at: new Date().toISOString(),
    generator_version: 'aevum-api@auto-plan-v2-hard-tier',
    audit_id: auditId,
    ...result
  };

  // Persist
  const updateRes = await supabase.update('audits', `id=eq.${auditId}`, {
    analysis_result,
    status: 'plan-ready',
    analyzed_at: new Date().toISOString()
  });

  // Notify Carlos
  const idShort = auditId.slice(0, 8);
  const deal = result.deal_recommendation || '?';
  const conf = result.confidence_score || 0;
  const setupFee = result.cost_calculation?.setup_fee_eur || 0;
  const retainer = result.cost_calculation?.retainer_monthly_eur || 0;
  const isStub = result._stub ? ' (STUB — no LLM)' : '';
  const tier = result.selected_tier || '?';
  const altLabels = (result.alternative_offers || []).map(a => a.label).join(' / ') || '—';
  notifyCarlos(`🤖 *Auto-Plan ready* — \`${idShort}\`${isStub}\n*Tier:* ${tier} | *Deal:* ${deal} | *Conf:* ${conf}%\n*Setup:* €${setupFee} | *Retainer:* €${retainer}/Mo\n*Alt:* ${altLabels}\n*Pain-Points:* ${(result.identified_pain_points || []).length}\n*Blueprints:* ${(result.recommended_blueprints || []).map(b => b.blueprint_id).join(', ')}`);

  console.log(`[auto-plan] done for audit ${auditId}, deal=${deal} confidence=${conf}`);

  // Fire-and-forget PDF render (don't block / fail auto-plan if PDF errors)
  renderPitchPdf(auditId)
    .then(r => {
      console.log(`[auto-plan] pdf rendered for ${auditId}: ${r.signed_url}`);
      notifyCarlos(`📄 *Pitch-PDF ready* — \`${auditId.slice(0,8)}\`\n[Open PDF](${r.signed_url})`);
    })
    .catch(err => console.error(`[auto-plan] pdf render failed for ${auditId}:`, err.message));

  return { ok: true, analysis_result };
}
