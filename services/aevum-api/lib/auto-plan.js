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
import {
  TIER_RANGES,
  mapComplexityToTier,
  validateToolMargin,
  escalateTierForMargin,
  deriveBudgetSignal
} from './tier-mapper.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

// ──────────────────────────────────────────────────────────
// LLM-Analyse — single Claude call with structured JSON output
// ──────────────────────────────────────────────────────────
async function llmAnalyze({ answers, uploadedFiles, blueprintWorkflows, pricingTiers }) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[auto-plan] No ANTHROPIC_API_KEY — returning stub analysis');
    return stubAnalysis(answers);
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
${JSON.stringify(answers, null, 2)}

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

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[auto-plan] LLM error:', data);
      return stubAnalysis(answers);
    }
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[auto-plan] no JSON in LLM response');
      return stubAnalysis(answers);
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[auto-plan] LLM exception:', err.message);
    return stubAnalysis(answers);
  }
}

function stubAnalysis(answers) {
  const industry = answers?.unternehmen?.industry || answers?.industry || answers?.fi?.branche || 'other';
  const pain = answers?.pain_points?.biggest_time_waster
    || answers?.fi?.pain
    || answers?.ag?.zeitfresser
    || answers?.pb?.skalierung
    || 'Unbekannt';
  return {
    complexity_score: 3,
    budget_signal: null,
    cashflow_indicator: false,
    growth_share_indicator: false,
    identified_pain_points: [
      { category: 'workflow', description: pain, severity: 'medium', impact_estimate_hours_monthly: 20 }
    ],
    recommended_blueprints: [
      { blueprint_id: 'reporting-pipeline-v1', blueprint_version: 'v1.0.0',
        rationale: 'Reduziert manuelle Reporting-Arbeit',
        estimated_setup_hours: 4, estimated_monthly_value_hours_saved: 8 }
    ],
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
    confidence_score: 35,
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

  const llmResult = await llmAnalyze({
    answers: audit.answers || {},
    uploadedFiles: audit.uploaded_files || [],
    blueprintWorkflows: bpRes.data || [],
    pricingTiers: prRes.data || []
  });

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
