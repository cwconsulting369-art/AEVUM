// AEVUM Credit-Spending-Layer
// Created: 2026-05-24 (Agent A5)
//
// Tracks Anthropic LLM-cost per account+session, enforces daily-caps.
// Estimates EUR-cost from token-counts + model-pricing.
//
// Public API:
//   estimateCostEur({ model, inputTokens, outputTokens }) → number
//   logUsage({ accountId?, sessionId?, endpoint, model, inputTokens, outputTokens, creditsSpent?, context? }) → { costEur }
//   getDailyCaps() → { perAccount, global, maxMessagesPerConv, creditCostPerMessage }
//   checkDailyCap(accountId?) → { accountSpend, globalSpend, caps, accountOverLimit, globalOverLimit, accountAt80, globalAt80 }

import { supabase } from './supabase.js';

// Anthropic-Pricing approximation (2026-05) — USD per 1M tokens
const PRICING_PER_M_TOKENS = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
  'claude-opus-4-7': { input: 15.0, output: 75.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 }
};
const EUR_USD_RATE = 0.93;

// Prompt-cache multipliers (Anthropic, 5-min ephemeral cache):
//   write = 1.25x normal input price
//   read  = 0.10x normal input price (90% savings)
const CACHE_WRITE_MULT = 1.25;
const CACHE_READ_MULT = 0.10;

export function estimateCostEur({
  model,
  inputTokens = 0,
  outputTokens = 0,
  cacheCreationInputTokens = 0,
  cacheReadInputTokens = 0
}) {
  const p = PRICING_PER_M_TOKENS[model] || PRICING_PER_M_TOKENS['claude-sonnet-4-5'];
  const usd =
    (inputTokens / 1e6) * p.input +
    (outputTokens / 1e6) * p.output +
    (cacheCreationInputTokens / 1e6) * p.input * CACHE_WRITE_MULT +
    (cacheReadInputTokens / 1e6) * p.input * CACHE_READ_MULT;
  return usd * EUR_USD_RATE;
}

export async function logUsage({
  accountId = null,
  sessionId = null,
  endpoint,
  model,
  inputTokens = 0,
  outputTokens = 0,
  cacheCreationInputTokens = 0,
  cacheReadInputTokens = 0,
  creditsSpent = 0,
  context = null
}) {
  const costEur = estimateCostEur({
    model,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens
  });
  try {
    await supabase.insert('agent_usage_log', {
      account_id: accountId,
      session_id: sessionId,
      endpoint,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_eur: costEur,
      credits_spent: creditsSpent || 0,
      context
    });
  } catch (err) {
    console.error('[credit-spend] log insert failed:', err.message || err);
  }
  // Increment daily spend on accounts row via RPC (idempotent + 24h rolling reset)
  if (accountId && costEur > 0) {
    try {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        await fetch(`${url}/rest/v1/rpc/increment_daily_spend`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_account_id: accountId, p_amount: costEur })
        });
      }
    } catch (err) {
      console.error('[credit-spend] rpc failed:', err.message || err);
    }
  }
  return { costEur };
}

// In-process cache for caps (1 min TTL)
let capsCache = null;
let capsCacheAt = 0;
const CAPS_TTL_MS = 60_000;

export async function getDailyCaps() {
  const now = Date.now();
  if (capsCache && now - capsCacheAt < CAPS_TTL_MS) return capsCache;

  const res = await supabase.select(
    'app_settings',
    `select=key,value&key=in.(agent_daily_cap_eur_per_account,agent_daily_cap_eur_global,agent_max_messages_per_conversation,agent_credit_cost_per_message)`
  );
  const map = {};
  if (res.ok && Array.isArray(res.data)) {
    res.data.forEach(r => { map[r.key] = r.value; });
  }
  capsCache = {
    perAccount: Number(map.agent_daily_cap_eur_per_account) || 5,
    global: Number(map.agent_daily_cap_eur_global) || 50,
    maxMessagesPerConv: Number(map.agent_max_messages_per_conversation) || 20,
    creditCostPerMessage: Number(map.agent_credit_cost_per_message) || 2
  };
  capsCacheAt = now;
  return capsCache;
}

export async function checkDailyCap(accountId) {
  const caps = await getDailyCaps();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let accountSpend = 0;
  if (accountId) {
    const r = await supabase.select(
      'agent_usage_log',
      `select=cost_eur&account_id=eq.${accountId}&ts=gte.${encodeURIComponent(since)}`
    );
    if (r.ok && Array.isArray(r.data)) {
      accountSpend = r.data.reduce((s, row) => s + Number(row.cost_eur || 0), 0);
    }
  }

  const rAll = await supabase.select(
    'agent_usage_log',
    `select=cost_eur&ts=gte.${encodeURIComponent(since)}`
  );
  let globalSpend = 0;
  if (rAll.ok && Array.isArray(rAll.data)) {
    globalSpend = rAll.data.reduce((s, row) => s + Number(row.cost_eur || 0), 0);
  }

  return {
    accountSpend,
    globalSpend,
    caps,
    accountOverLimit: accountId ? accountSpend >= caps.perAccount : false,
    globalOverLimit: globalSpend >= caps.global,
    accountAt80: accountId ? accountSpend >= caps.perAccount * 0.8 : false,
    globalAt80: globalSpend >= caps.global * 0.8
  };
}
