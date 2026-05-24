// AEVUM Script-Factory API — Wave C1 (v1) + Wave H1 (v2 Multi-Pipeline)
// Mount: /api/factories/script
//
// V1 Endpoints (legacy, still supported — product_name/hook_goal/platform path):
//   POST   /run                — start new generation (spends 40 credits)
//   GET    /runs               — list account's runs (50 most recent)
//   GET    /runs/:id           — get run + outputs
//   GET    /brands             — list brand-profiles
//   POST   /brands             — create brand-profile
//   DELETE /brands/:id         — delete brand-profile
//
// V2 Endpoints (Wave H1):
//   GET    /use-cases          — list active use-cases
//   GET    /knowledge-hubs     — list available knowledge-hubs (public + owned)
//   GET    /tim-customers      — list Tim's customers (gated to tim_account_id)
//   POST   /tim-customers      — create new Tim-customer
//   PATCH  /tim-customers/:id  — update Tim-customer
//   DELETE /tim-customers/:id  — delete Tim-customer
//
// V2 Path on POST /run: triggered when body contains "use_case" + "input_script"

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../lib/supabase.js';
import { requireCustomerAuth } from '../../lib/crypto.js';
import { spendCredits } from '../../lib/credits.js';
import { agentThrottle } from '../../lib/agent-throttle.js';
import {
  runScriptFactory,
  SCRIPT_FACTORY_COST_CREDITS
} from '../../lib/factories/script-factory.js';
import {
  runScriptFactoryV2,
  SCRIPT_FACTORY_V2_COST_CREDITS
} from '../../lib/factories/script-factory-v2.js';

export const scriptFactoryRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// All endpoints require auth + agent-throttle
scriptFactoryRouter.use(requireCustomerAuth);
scriptFactoryRouter.use(agentThrottle());

// ─── V1 Schemas ──────────────────────────────────────────────────
const RunSchemaV1 = z.object({
  brand_id: z.string().uuid().optional(),
  product_name: z.string().min(1).max(200),
  product_description: z.string().max(2000).optional(),
  hook_goal: z.string().min(1).max(500),
  platform: z.enum(['meta', 'tiktok', 'youtube', 'all']),
  variant_count: z.number().int().min(3).max(10).optional()
});

// ─── V2 Schemas ──────────────────────────────────────────────────
const RunSchemaV2 = z.object({
  use_case: z.string().min(1),
  input_script: z.string().min(50).max(10000),
  settings: z.object({
    brand_tone: z.string().max(500).optional(),
    niche: z.string().max(200).optional(),
    icp: z.string().max(500).optional(),
    awareness: z.enum(['unaware', 'problem-aware', 'solution-aware', 'product-aware', 'most-aware']).optional(),
    platform: z.enum(['meta', 'google', 'tiktok', 'all']).optional()
  }).default({}),
  knowledge_hub_ids: z.array(z.string().uuid()).max(5).default([]),
  variant_count: z.number().int().min(3).max(10).default(5),
  tim_customer_id: z.string().uuid().optional()
});

const BrandSchema = z.object({
  name: z.string().min(1).max(100),
  voice: z.string().max(2000).optional(),
  audience: z.string().max(2000).optional(),
  product_category: z.string().max(200).optional(),
  unique_selling_points: z.array(z.string().max(300)).max(10).optional(),
  do_not_say: z.array(z.string().max(300)).max(10).optional()
});

const TimCustomerSchema = z.object({
  customer_name: z.string().min(1).max(200),
  customer_email: z.string().email().max(200).optional(),
  niche: z.string().max(200).optional(),
  product_category: z.string().max(200).optional(),
  ad_platforms: z.array(z.string().max(50)).max(10).optional(),
  brand_voice: z.string().max(2000).optional(),
  target_icp: z.string().max(2000).optional(),
  awareness_stage: z.enum(['unaware', 'problem-aware', 'solution-aware', 'product-aware', 'most-aware']).optional(),
  enrichment_data: z.record(z.any()).optional()
});

// ─── Helpers ─────────────────────────────────────────────────────
function getAccountId(req) {
  return req.customer?.account_id || null;
}

// Tim-Premium gating: account.account_type === 'tim-premium' OR account.email matches TIM_EMAIL env
async function isTimAccount(accountId) {
  if (!accountId) return false;
  const sel = await supabase.select('accounts', `?id=eq.${accountId}&select=email,account_type&limit=1`);
  const acc = sel.data?.[0];
  if (!acc) return false;
  if (acc.account_type === 'tim-premium') return true;
  const timEmails = (process.env.TIM_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (timEmails.length && acc.email && timEmails.includes(acc.email.toLowerCase())) return true;
  return false;
}

// ─── POST /run — Dispatch V1 vs V2 ───────────────────────────────
scriptFactoryRouter.post('/run', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  // Dispatch: V2 if use_case present, else V1
  const isV2 = typeof req.body?.use_case === 'string' && typeof req.body?.input_script === 'string';

  if (isV2) return runV2(req, res, account_id);
  return runV1(req, res, account_id);
});

async function runV1(req, res, account_id) {
  const parsed = RunSchemaV1.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  if (parsed.data.brand_id) {
    const bCheck = await supabase.select(
      'script_factory_brands',
      `?id=eq.${parsed.data.brand_id}&account_id=eq.${account_id}&select=id&limit=1`
    );
    if (!bCheck.ok || !bCheck.data?.length) {
      return res.status(404).json({ ok: false, error: 'brand_not_found' });
    }
  }

  const spend = await spendCredits(account_id, SCRIPT_FACTORY_COST_CREDITS, 'script-factory-run');
  if (!spend.ok) {
    return res.status(402).json({
      ok: false, error: spend.error || 'insufficient_credits',
      need: SCRIPT_FACTORY_COST_CREDITS, have: spend.balance ?? 0
    });
  }

  const insertRes = await supabase.insert('script_factory_runs', {
    account_id,
    brand_id: parsed.data.brand_id || null,
    product_name: parsed.data.product_name,
    product_description: parsed.data.product_description || null,
    hook_goal: parsed.data.hook_goal,
    platform: parsed.data.platform,
    variant_count: parsed.data.variant_count || 5,
    status: 'pending'
  });
  if (!insertRes.ok) {
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-create-fail');
    return res.status(500).json({ ok: false, error: 'create_run_failed' });
  }
  const runRow = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
  const runId = runRow?.id;
  if (!runId) {
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-no-id');
    return res.status(500).json({ ok: false, error: 'no_run_id_returned' });
  }

  runScriptFactory({ runId, accountId: account_id }).catch(async err => {
    console.error('[script-factory v1] run failed:', err.message || err);
    await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_message: String(err.message || err).slice(0, 500)
    });
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-fail');
  });

  return res.json({
    ok: true, run_id: runId, status: 'pending',
    credits_spent: SCRIPT_FACTORY_COST_CREDITS, estimated_duration_sec: 60, version: 'v1'
  });
}

async function runV2(req, res, account_id) {
  const parsed = RunSchemaV2.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  // Verify use_case exists + active
  const uc = await supabase.select(
    'script_use_cases',
    `?slug=eq.${encodeURIComponent(parsed.data.use_case)}&is_active=eq.true&select=slug,pipeline_id&limit=1`
  );
  if (!uc.ok || !uc.data?.length) {
    return res.status(404).json({ ok: false, error: 'use_case_not_found' });
  }

  // If Tim-customer provided: must own it
  if (parsed.data.tim_customer_id) {
    const tc = await supabase.select(
      'tim_customers',
      `?id=eq.${parsed.data.tim_customer_id}&tim_account_id=eq.${account_id}&select=id&limit=1`
    );
    if (!tc.ok || !tc.data?.length) {
      return res.status(404).json({ ok: false, error: 'tim_customer_not_found' });
    }
  }

  // Verify hub-ids exist + accessible (public OR owned by account)
  if (parsed.data.knowledge_hub_ids.length) {
    const inList = parsed.data.knowledge_hub_ids.map(id => `"${id}"`).join(',');
    const hubsSel = await supabase.select(
      'knowledge_hubs',
      `?id=in.(${inList})&select=id,is_public,owner_account_id`
    );
    const accessible = (hubsSel.data || []).filter(h => h.is_public || h.owner_account_id === account_id);
    if (accessible.length !== parsed.data.knowledge_hub_ids.length) {
      return res.status(403).json({ ok: false, error: 'hub_access_denied' });
    }
  }

  const spend = await spendCredits(account_id, SCRIPT_FACTORY_V2_COST_CREDITS, 'script-factory-v2-run');
  if (!spend.ok) {
    return res.status(402).json({
      ok: false, error: spend.error || 'insufficient_credits',
      need: SCRIPT_FACTORY_V2_COST_CREDITS, have: spend.balance ?? 0
    });
  }

  const insertRes = await supabase.insert('script_factory_runs', {
    account_id,
    use_case: parsed.data.use_case,
    input_script: parsed.data.input_script,
    settings: parsed.data.settings,
    knowledge_hub_ids: parsed.data.knowledge_hub_ids,
    variant_count: parsed.data.variant_count,
    tim_customer_id: parsed.data.tim_customer_id || null,
    status: 'pending'
  });
  if (!insertRes.ok) {
    await spendCredits(account_id, -SCRIPT_FACTORY_V2_COST_CREDITS, 'script-factory-v2-refund-create-fail');
    return res.status(500).json({ ok: false, error: 'create_run_failed', details: insertRes.error });
  }
  const runRow = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
  const runId = runRow?.id;
  if (!runId) {
    await spendCredits(account_id, -SCRIPT_FACTORY_V2_COST_CREDITS, 'script-factory-v2-refund-no-id');
    return res.status(500).json({ ok: false, error: 'no_run_id_returned' });
  }

  runScriptFactoryV2({ runId, accountId: account_id }).catch(async err => {
    console.error('[script-factory v2] run failed:', err.message || err);
    await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_message: String(err.message || err).slice(0, 500)
    });
    await spendCredits(account_id, -SCRIPT_FACTORY_V2_COST_CREDITS, 'script-factory-v2-refund-fail');
  });

  return res.json({
    ok: true, run_id: runId, status: 'pending',
    credits_spent: SCRIPT_FACTORY_V2_COST_CREDITS, estimated_duration_sec: 90, version: 'v2'
  });
}

// ─── GET /runs ───────────────────────────────────────────────────
scriptFactoryRouter.get('/runs', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const sel = await supabase.select(
    'script_factory_runs',
    `?account_id=eq.${account_id}&order=created_at.desc&limit=50&select=*`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, runs: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── GET /runs/:id ───────────────────────────────────────────────
scriptFactoryRouter.get('/runs/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const runSel = await supabase.select(
    'script_factory_runs',
    `?id=eq.${id}&account_id=eq.${account_id}&select=*&limit=1`
  );
  if (!runSel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  if (!runSel.data?.length) return res.status(404).json({ ok: false, error: 'not_found' });
  const outSel = await supabase.select(
    'script_factory_outputs',
    `?run_id=eq.${id}&order=variant_index.asc&select=*`
  );
  return res.json({
    ok: true,
    run: runSel.data[0],
    outputs: outSel.ok && Array.isArray(outSel.data) ? outSel.data : []
  });
});

// ─── GET /brands (V1) ────────────────────────────────────────────
scriptFactoryRouter.get('/brands', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const sel = await supabase.select(
    'script_factory_brands',
    `?account_id=eq.${account_id}&order=created_at.desc&select=*`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, brands: Array.isArray(sel.data) ? sel.data : [] });
});

scriptFactoryRouter.post('/brands', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const parsed = BrandSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const insertRes = await supabase.insert('script_factory_brands', {
    account_id,
    name: parsed.data.name,
    voice: parsed.data.voice || null,
    audience: parsed.data.audience || null,
    product_category: parsed.data.product_category || null,
    unique_selling_points: parsed.data.unique_selling_points || [],
    do_not_say: parsed.data.do_not_say || []
  });
  if (!insertRes.ok) {
    if (insertRes.status === 409 || insertRes.error?.code === '23505') {
      return res.status(409).json({ ok: false, error: 'brand_name_already_exists' });
    }
    return res.status(500).json({ ok: false, error: 'create_brand_failed' });
  }
  const brand = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
  return res.json({ ok: true, brand });
});

scriptFactoryRouter.delete('/brands/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const del = await supabase.delete('script_factory_brands', `?id=eq.${id}&account_id=eq.${account_id}`);
  if (!del.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true });
});

// ─── V2: GET /use-cases ──────────────────────────────────────────
scriptFactoryRouter.get('/use-cases', async (_req, res) => {
  const sel = await supabase.select(
    'script_use_cases',
    `?is_active=eq.true&order=sort_order.asc&select=*`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, use_cases: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── V2: GET /knowledge-hubs ─────────────────────────────────────
scriptFactoryRouter.get('/knowledge-hubs', async (req, res) => {
  const account_id = getAccountId(req);
  // Show public + owned (if logged-in account_id)
  const filter = account_id
    ? `or=(is_public.eq.true,owner_account_id.eq.${account_id})`
    : `is_public=eq.true`;
  const sel = await supabase.select(
    'knowledge_hubs',
    `?${filter}&order=name.asc&select=id,slug,name,description,is_public,owner_account_id,associated_use_cases,created_at`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, hubs: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── V2: Tim-Customer CRUD ───────────────────────────────────────
scriptFactoryRouter.get('/tim-customers', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  // Allow listing only own customers (regardless of tim-flag — owner-scoped)
  const sel = await supabase.select(
    'tim_customers',
    `?tim_account_id=eq.${account_id}&order=customer_name.asc&select=*`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, customers: Array.isArray(sel.data) ? sel.data : [] });
});

scriptFactoryRouter.post('/tim-customers', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const tim = await isTimAccount(account_id);
  if (!tim) return res.status(403).json({ ok: false, error: 'tim_premium_required' });

  const parsed = TimCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const ins = await supabase.insert('tim_customers', {
    tim_account_id: account_id,
    customer_name: parsed.data.customer_name,
    customer_email: parsed.data.customer_email || null,
    niche: parsed.data.niche || null,
    product_category: parsed.data.product_category || null,
    ad_platforms: parsed.data.ad_platforms || [],
    brand_voice: parsed.data.brand_voice || null,
    target_icp: parsed.data.target_icp || null,
    awareness_stage: parsed.data.awareness_stage || null,
    enrichment_data: parsed.data.enrichment_data || {}
  });
  if (!ins.ok) {
    if (ins.status === 409 || ins.error?.code === '23505') {
      return res.status(409).json({ ok: false, error: 'customer_name_already_exists' });
    }
    return res.status(500).json({ ok: false, error: 'create_customer_failed', details: ins.error });
  }
  const customer = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  return res.json({ ok: true, customer });
});

scriptFactoryRouter.patch('/tim-customers/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = TimCustomerSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  const upd = await supabase.update('tim_customers', `?id=eq.${id}&tim_account_id=eq.${account_id}`, patch);
  if (!upd.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  const row = Array.isArray(upd.data) ? upd.data[0] : upd.data;
  if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, customer: row });
});

scriptFactoryRouter.delete('/tim-customers/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const del = await supabase.delete('tim_customers', `?id=eq.${id}&tim_account_id=eq.${account_id}`);
  if (!del.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true });
});
