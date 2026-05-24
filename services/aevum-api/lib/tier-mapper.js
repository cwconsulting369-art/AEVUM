// AEVUM Tier-Mapper — Wave A6
//
// HARD deterministic mapping of LLM-derived complexity_score + user budget_signal
// to mig009 blueprint_pricing tiers. The LLM no longer picks the tier — it only
// outputs a complexity_score (1-10) and budget_signal. This module owns the mapping.
//
// Source of truth: migrations/009_seed_blueprints_and_account_zero.sql
//
//   audit-only       : setup €1.5–4k    , retainer €0/Mo            (complexity 1-2, very low budget)
//   tier-S-start     : setup €2–8k      , retainer €1–2k/Mo         (complexity 1-3)
//   tier-M-growth    : setup €8–20k     , retainer €2–3.5k/Mo       (complexity 4-6)
//   tier-L-skalierung: setup €25–75k    , retainer €3–5k/Mo         (complexity 7-10)
//   tier-B-cashflow  : setup €1–8k      , retainer €1.5–4.5k/Mo     (Cashflow-deal, Min-Term 12 Mo)
//   tier-C-growth    : setup €1–5k      , retainer €0.5–2.5k/Mo + 10-15% RevShare (Term 24 Mo)

export const TIER_RANGES = Object.freeze({
  'audit-only':        { setup_min: 1500,  setup_max: 4000,  retainer_min: 0,    retainer_max: 0,    deal_type: 'A' },
  'tier-S-start':      { setup_min: 2000,  setup_max: 8000,  retainer_min: 1000, retainer_max: 2000, deal_type: 'A' },
  'tier-M-growth':     { setup_min: 8000,  setup_max: 20000, retainer_min: 2000, retainer_max: 3500, deal_type: 'A' },
  'tier-L-skalierung': { setup_min: 25000, setup_max: 75000, retainer_min: 3000, retainer_max: 5000, deal_type: 'A' },
  'tier-B-cashflow':   { setup_min: 1000,  setup_max: 8000,  retainer_min: 1500, retainer_max: 4500, deal_type: 'B' },
  'tier-C-growth-share': { setup_min: 1000, setup_max: 5000, retainer_min: 500,  retainer_max: 2500, deal_type: 'C', revshare_pct_range: [10, 15] }
});

/**
 * Deterministic mapping (no LLM). Returns tier_id from mig009.
 *
 * @param {number} complexity — 1..10 from LLM output
 * @param {object} budgetSignal — { setup_max: number, retainer_max: number, retainer_min?: number }
 *                                values in EUR. If user gave "€2-8k" the setup_max is 8000.
 * @returns {string} tier-id matching blueprint_pricing.id
 */
export function mapComplexityToTier(complexity, budgetSignal) {
  const c = Number(complexity);
  if (!Number.isFinite(c) || c < 1) {
    // No complexity info → fall back to audit-only path
    return 'audit-only';
  }
  const setupMax = Number(budgetSignal?.setup_max) || 0;
  const retainerMax = Number(budgetSignal?.retainer_max) || 0;

  // ── Complexity 1-3 — Start-Range ──
  if (c <= 3) {
    if (setupMax > 0 && setupMax < 2000) return 'audit-only';
    return 'tier-S-start';
  }

  // ── Complexity 4-6 — Growth-Range ──
  if (c <= 6) {
    if (setupMax >= 8000) return 'tier-M-growth';
    // budget too tight for M but complexity middle → cashflow-deal
    if (setupMax > 0 && setupMax < 8000 && retainerMax >= 1500) return 'tier-B-cashflow';
    return 'tier-S-start';
  }

  // ── Complexity 7-10 — Skalierung-Range ──
  if (setupMax >= 25000) return 'tier-L-skalierung';
  // Budget too low for L but complexity high → Growth+RevShare (or Cashflow)
  if (setupMax > 0 && setupMax < 25000) {
    if (setupMax < 5000) return 'tier-C-growth-share';
    return 'tier-M-growth';
  }
  return 'tier-M-growth';
}

/**
 * Validates the rule "tool-margin × 2 ≤ retainer_max of the chosen tier".
 * If validation fails, caller should escalate tier or trim tools.
 *
 * @param {object} params
 * @param {string} params.tier — tier id
 * @param {Array<{tool: string, monthly_cost_eur?: number}>} params.recommendedTools
 * @param {object} [params.retainerRange] — { min, max } override (else use TIER_RANGES)
 * @returns {{ ok: boolean, minRetainer: number, retainerMax: number, error?: string, toolCost: number }}
 */
export function validateToolMargin({ tier, recommendedTools = [], retainerRange }) {
  const range = retainerRange || TIER_RANGES[tier] || { retainer_min: 0, retainer_max: 0 };
  const retainerMax = Number(range.retainer_max) || 0;
  const toolMonthlyCost = (recommendedTools || []).reduce((sum, t) => {
    const n = Number(t?.monthly_cost_eur || 0);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const minRetainer = toolMonthlyCost * 2;
  if (retainerMax > 0 && minRetainer > retainerMax) {
    return { ok: false, error: 'tool_cost_exceeds_retainer_margin', minRetainer, retainerMax, toolCost: toolMonthlyCost };
  }
  return { ok: true, minRetainer, retainerMax, toolCost: toolMonthlyCost };
}

/**
 * Given a tier and a failed margin-validation, suggest the next tier UP
 * that fits the tool-cost×2 rule. Returns null when no tier fits.
 */
export function escalateTierForMargin({ tier, recommendedTools }) {
  // Order of escalation. Skip cashflow/growth deals — they are budget-driven, not size-driven.
  const order = ['audit-only', 'tier-S-start', 'tier-M-growth', 'tier-L-skalierung'];
  const idx = order.indexOf(tier);
  if (idx < 0) return null;
  for (let i = idx + 1; i < order.length; i++) {
    const next = order[i];
    const v = validateToolMargin({ tier: next, recommendedTools });
    if (v.ok) return next;
  }
  return null;
}

/**
 * Derives the budget_signal from raw v3 audit answers.
 * Maps revenue-string + segment to setup_max / retainer_max heuristically when
 * the user didn't pick explicit budget ranges.
 *
 * Explicit budget fields win when present.
 */
export function deriveBudgetSignal(answers = {}) {
  // Explicit (preferred — comes from v3 Budget Step)
  const explicit = answers.budget || {};
  if (Number(explicit.setup_max) > 0 || Number(explicit.retainer_max) > 0) {
    return {
      setup_min: Number(explicit.setup_min) || 0,
      setup_max: Number(explicit.setup_max) || 0,
      retainer_min: Number(explicit.retainer_min) || 0,
      retainer_max: Number(explicit.retainer_max) || 0,
      source: 'explicit'
    };
  }

  // Heuristic from monthly-revenue (AG/PB) or team-size (FI)
  const seg = answers.segment;
  const rev = answers.ag?.monthly_revenue || answers.pb?.monthly_revenue || answers.monthly_revenue;
  const teamSize = answers.fi?.mitarbeiterzahl || answers.team_size;

  if (rev === '<5k')   return { setup_min: 1000, setup_max: 4000,  retainer_min: 500,  retainer_max: 2000, source: 'revenue-heuristic' };
  if (rev === '5-15k') return { setup_min: 2000, setup_max: 8000,  retainer_min: 1000, retainer_max: 2500, source: 'revenue-heuristic' };
  if (rev === '15-50k')return { setup_min: 8000, setup_max: 20000, retainer_min: 2000, retainer_max: 3500, source: 'revenue-heuristic' };
  if (rev === '>50k')  return { setup_min: 15000,setup_max: 50000, retainer_min: 3000, retainer_max: 5000, source: 'revenue-heuristic' };

  if (teamSize === '50+') return { setup_min: 15000, setup_max: 50000, retainer_min: 3000, retainer_max: 5000, source: 'teamsize-heuristic' };
  if (teamSize === '11-50') return { setup_min: 8000, setup_max: 20000, retainer_min: 2000, retainer_max: 3500, source: 'teamsize-heuristic' };
  if (teamSize === '1-10' || seg === 'AG' || seg === 'PB') {
    return { setup_min: 2000, setup_max: 8000, retainer_min: 1000, retainer_max: 2500, source: 'default-small' };
  }

  return { setup_min: 0, setup_max: 0, retainer_min: 0, retainer_max: 0, source: 'unknown' };
}
