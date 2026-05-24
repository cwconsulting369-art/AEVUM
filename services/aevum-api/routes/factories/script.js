// AEVUM Script-Factory API — Wave C1
// Mount: /api/factories/script
//
// Endpoints (all require customer JWT):
//   POST   /run                — start new generation (spends 40 credits)
//   GET    /runs               — list account's runs (50 most recent)
//   GET    /runs/:id           — get run + outputs
//   GET    /brands             — list brand-profiles
//   POST   /brands             — create brand-profile
//   DELETE /brands/:id         — delete brand-profile

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

export const scriptFactoryRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// All endpoints require auth + agent-throttle (global+per-account daily cap)
scriptFactoryRouter.use(requireCustomerAuth);
scriptFactoryRouter.use(agentThrottle());

// ─── Schemas ─────────────────────────────────────────────────────
const RunSchema = z.object({
  brand_id: z.string().uuid().optional(),
  product_name: z.string().min(1).max(200),
  product_description: z.string().max(2000).optional(),
  hook_goal: z.string().min(1).max(500),
  platform: z.enum(['meta', 'tiktok', 'youtube', 'all']),
  variant_count: z.number().int().min(3).max(10).optional()
});

const BrandSchema = z.object({
  name: z.string().min(1).max(100),
  voice: z.string().max(2000).optional(),
  audience: z.string().max(2000).optional(),
  product_category: z.string().max(200).optional(),
  unique_selling_points: z.array(z.string().max(300)).max(10).optional(),
  do_not_say: z.array(z.string().max(300)).max(10).optional()
});

// ─── Helpers ─────────────────────────────────────────────────────
function getAccountId(req) {
  return req.customer?.account_id || null;
}

// ─── POST /run — Start new generation ────────────────────────────
scriptFactoryRouter.post('/run', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const parsed = RunSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_input',
      details: parsed.error.flatten()
    });
  }

  // Verify brand belongs to this account (if provided)
  if (parsed.data.brand_id) {
    const bCheck = await supabase.select(
      'script_factory_brands',
      `?id=eq.${parsed.data.brand_id}&account_id=eq.${account_id}&select=id&limit=1`
    );
    if (!bCheck.ok || !bCheck.data?.length) {
      return res.status(404).json({ ok: false, error: 'brand_not_found' });
    }
  }

  // Spend credits BEFORE creating run — atomic, prevents race
  const spend = await spendCredits(
    account_id,
    SCRIPT_FACTORY_COST_CREDITS,
    'script-factory-run'
  );
  if (!spend.ok) {
    return res.status(402).json({
      ok: false,
      error: spend.error || 'insufficient_credits',
      need: SCRIPT_FACTORY_COST_CREDITS,
      have: spend.balance ?? 0
    });
  }

  // Create run row
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
    // Refund credits on create-failure
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-create-fail');
    return res.status(500).json({ ok: false, error: 'create_run_failed' });
  }
  const runRow = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
  const runId = runRow?.id;
  if (!runId) {
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-no-id');
    return res.status(500).json({ ok: false, error: 'no_run_id_returned' });
  }

  // Fire-and-forget execution — user polls /runs/:id
  runScriptFactory({ runId, accountId: account_id }).catch(async err => {
    console.error('[script-factory] run failed:', err.message || err);
    await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_message: String(err.message || err).slice(0, 500)
    });
    // Auto-refund on failure
    await spendCredits(account_id, -SCRIPT_FACTORY_COST_CREDITS, 'script-factory-refund-fail');
  });

  return res.json({
    ok: true,
    run_id: runId,
    status: 'pending',
    credits_spent: SCRIPT_FACTORY_COST_CREDITS,
    estimated_duration_sec: 60
  });
});

// ─── GET /runs — List account's runs ─────────────────────────────
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

// ─── GET /runs/:id — Get specific run + outputs ──────────────────
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

// ─── GET /brands — List brand-profiles ───────────────────────────
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

// ─── POST /brands — Create brand-profile ─────────────────────────
scriptFactoryRouter.post('/brands', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const parsed = BrandSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_input',
      details: parsed.error.flatten()
    });
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
    // Likely a UNIQUE(account_id, name) conflict
    if (insertRes.status === 409 || insertRes.error?.code === '23505') {
      return res.status(409).json({ ok: false, error: 'brand_name_already_exists' });
    }
    return res.status(500).json({ ok: false, error: 'create_brand_failed' });
  }

  const brand = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
  return res.json({ ok: true, brand });
});

// ─── DELETE /brands/:id — Delete brand-profile ───────────────────
scriptFactoryRouter.delete('/brands/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

  const del = await supabase.delete(
    'script_factory_brands',
    `?id=eq.${id}&account_id=eq.${account_id}`
  );
  if (!del.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true });
});
