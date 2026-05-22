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

  const system = `Du bist der AEVUM Auto-Plan-Generator. Du analysierst Audit-Antworten von Unternehmen und generierst strukturierten JSON-Output für die Plan-Empfehlung. Output ist STRENG nach Schema aevum/auto-plan/v1. Antworte NUR mit valid JSON, keine Erklärungen drumherum.`;

  const user = `# AUDIT-ANTWORTEN
${JSON.stringify(answers, null, 2)}

# UPLOADED FILES (Metadata)
${JSON.stringify(uploadedFiles || [], null, 2)}

# AVAILABLE BLUEPRINTS (workflow-library)
${JSON.stringify(workflowList, null, 2)}

# AVAILABLE PRICING TIERS (baulig-based)
${JSON.stringify(pricingList, null, 2)}

# AUFGABE
Generiere strukturierten JSON-Output nach Schema aevum/auto-plan/v1.

Pflicht-Felder:
- identified_pain_points: Array von {category, description, severity (low|medium|high|critical), impact_estimate_hours_monthly}
- recommended_blueprints: Array von {blueprint_id, blueprint_version: "v1.0.0", rationale, estimated_setup_hours, estimated_monthly_value_hours_saved}
- tool_stack_recommendation: {keep: [], add: [{tool, monthly_cost_eur, purpose}], remove: []}
- cost_calculation: {setup_fee_eur, tool_costs_monthly_eur, tool_costs_with_margin_eur (×2), retainer_monthly_eur, revenue_share_pct_optional (null if none), first_year_total_eur}
- roadmap: {phase_1_days_0_30: [], phase_2_days_31_60: [], phase_3_days_61_90: []}
- agent_build_spec: {display_name, persona (short), language_primary, skills (array), required_apis: array of service names}
- dashboard_modules: array aus enum: finance-widget, revenue-chart, kpi-grid, roadmap-timeline, workflow-status, recent-activity, people-table, data-hub-links, reports-archive, agent-chat
- deal_recommendation: "A" (Cash) | "B" (Cashflow) | "C" (Growth)
- confidence_score: 0-100

Regeln:
- Tool-Lizenzen × 2 für tool_costs_with_margin_eur (Margin-Pflicht)
- Setup ≈ 3× monatlicher Retainer (Baulig-Faustregel)
- Wenn Budget niedrig + Wachstums-Potenzial: Deal-Type C
- Wenn Cash-Budget knapp aber MRR stabil: Deal-Type B
- Sonst Deal-Type A
- Wähle Blueprints die zu Pain-Points passen
- Confidence niedrig wenn Audit-Antworten kurz/vage

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
  const industry = answers?.unternehmen?.industry || answers?.industry || 'other';
  const pain = answers?.pain_points?.biggest_time_waster || 'Unbekannt';
  return {
    identified_pain_points: [
      { category: 'workflow', description: pain, severity: 'medium', impact_estimate_hours_monthly: 20 }
    ],
    recommended_blueprints: [
      { blueprint_id: 'reporting-pipeline-v1', blueprint_version: 'v1.0.0',
        rationale: 'Reduziert manuelle Reporting-Arbeit',
        estimated_setup_hours: 4, estimated_monthly_value_hours_saved: 8 }
    ],
    tool_stack_recommendation: { keep: [], add: [], remove: [] },
    cost_calculation: {
      setup_fee_eur: 4000, tool_costs_monthly_eur: 100,
      tool_costs_with_margin_eur: 200, retainer_monthly_eur: 1500,
      revenue_share_pct_optional: null, first_year_total_eur: 4000 + 12 * 1700
    },
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
    deal_recommendation: 'A',
    confidence_score: 35,
    _stub: true
  };
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

  const result = await llmAnalyze({
    answers: audit.answers || {},
    uploadedFiles: audit.uploaded_files || [],
    blueprintWorkflows: bpRes.data || [],
    pricingTiers: prRes.data || []
  });

  // Schema-stamp
  const analysis_result = { $schema: 'aevum/auto-plan/v1', generated_at: new Date().toISOString(), generator_version: 'aevum-api@auto-plan-v1', audit_id: auditId, ...result };

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
  notifyCarlos(`🤖 *Auto-Plan ready* — \`${idShort}\`${isStub}\n*Deal:* ${deal} | *Confidence:* ${conf}%\n*Setup:* €${setupFee} | *Retainer:* €${retainer}/Mo\n*Pain-Points:* ${(result.identified_pain_points || []).length}\n*Blueprints:* ${(result.recommended_blueprints || []).map(b => b.blueprint_id).join(', ')}`);

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
