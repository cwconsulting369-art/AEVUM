// AEVUM DSGVO-Factory Routes — Wave C2 Stub-MVP
// Created: 2026-05-24 (Agent C2)
//
// POST /api/factories/dsgvo/run        — start generation (25 credits)
// GET  /api/factories/dsgvo/runs       — list account's runs
// GET  /api/factories/dsgvo/runs/:id   — single run status + pdf_url
// GET  /api/factories/dsgvo/templates  — template catalog (live + coming-soon)
//
// Auth: requireCustomerAuth → req.customer.account_id
// Throttle: agentThrottle() (daily-cap gate)
// Refund: failed runs auto-refund the 25 credits.

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../lib/supabase.js';
import { requireCustomerAuth } from '../../lib/crypto.js';
import { agentThrottle } from '../../lib/agent-throttle.js';
import { runDsgvoFactory } from '../../lib/factories/dsgvo-factory.js';

export const dsgvoFactoryRouter = Router();

const COST = 25;

const RunSchema = z.object({
  template_type: z.enum([
    'avv',
    'datenschutzerklaerung',
    'impressum',
    'agb',
    'widerruf',
    'newsletter-consent'
  ]),
  inputs: z.record(z.string(), z.any())
});

// ─── Credit helpers (atomic spend + refund) ─────────────────────
async function spendCredits(account_id, amount, reason) {
  if (!account_id || amount <= 0) return { ok: false, error: 'invalid_args' };

  const { data: rows, ok: selOk } = await supabase.select(
    'account_credits',
    `?account_id=eq.${account_id}&select=balance`
  );
  if (!selOk) return { ok: false, error: 'db_error' };
  const row = Array.isArray(rows) ? rows[0] : rows;
  const balance = row?.balance ?? 0;
  if (balance < amount) return { ok: false, error: 'insufficient_credits', balance };

  // Atomic optimistic update: only succeeds if balance still >= amount
  const newBalance = balance - amount;
  const upd = await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}&balance=gte.${amount}`,
    { balance: newBalance, updated_at: new Date().toISOString() }
  );
  if (!upd.ok) return { ok: false, error: 'db_error' };
  if (!Array.isArray(upd.data) || upd.data.length === 0) {
    return { ok: false, error: 'concurrent_modification' };
  }

  await supabase.insert('credit_transactions', {
    account_id,
    amount: -amount,
    type: 'redemption',
    reference_id: reason,
    description: `DSGVO-Factory: ${reason}`
  });

  return { ok: true, new_balance: newBalance };
}

async function refundCredits(account_id, amount, reason) {
  if (!account_id || amount <= 0) return;
  const { data: rows } = await supabase.select(
    'account_credits',
    `?account_id=eq.${account_id}&select=balance,lifetime_earned`
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return;
  await supabase.update('account_credits', `?account_id=eq.${account_id}`, {
    balance: (row.balance || 0) + amount,
    updated_at: new Date().toISOString()
  });
  await supabase.insert('credit_transactions', {
    account_id,
    amount,
    type: 'refund',
    reference_id: reason,
    description: `DSGVO-Factory refund: ${reason}`
  });
}

// ─── Middleware ─────────────────────────────────────────────────
dsgvoFactoryRouter.use(requireCustomerAuth);
dsgvoFactoryRouter.use(agentThrottle());

// ─── POST /run ──────────────────────────────────────────────────
dsgvoFactoryRouter.post('/run', async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const parsed = RunSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_input',
      details: parsed.error.flatten()
    });
  }

  // Coming-Soon gate — only 'avv' currently active
  if (parsed.data.template_type !== 'avv') {
    return res.status(503).json({
      ok: false,
      error: 'template_coming_soon',
      template: parsed.data.template_type,
      message: 'Dieses Template kommt in Wave-D. Nutze aktuell nur "avv".'
    });
  }

  // Spend credits BEFORE creating the run (avoid orphan-runs without paid balance)
  const spent = await spendCredits(account_id, COST, 'dsgvo-factory-run');
  if (!spent.ok) {
    return res.status(spent.error === 'insufficient_credits' ? 402 : 500).json({
      ok: false,
      error: spent.error || 'spend_failed',
      need: COST,
      balance: spent.balance
    });
  }

  // Insert run
  const insertRes = await supabase.insert('dsgvo_factory_runs', {
    account_id,
    template_type: parsed.data.template_type,
    inputs: parsed.data.inputs,
    status: 'pending'
  });
  if (!insertRes.ok) {
    // Refund — run-insert failed
    await refundCredits(account_id, COST, 'dsgvo-factory-insert-fail');
    return res.status(502).json({ ok: false, error: 'db_insert_failed' });
  }
  const runId = Array.isArray(insertRes.data) ? insertRes.data[0]?.id : insertRes.data?.id;
  if (!runId) {
    await refundCredits(account_id, COST, 'dsgvo-factory-insert-fail');
    return res.status(502).json({ ok: false, error: 'no_run_id_returned' });
  }

  // Kick off async — DO NOT await
  runDsgvoFactory({ runId, accountId: account_id }).catch(async (err) => {
    console.error(`[dsgvo-factory] run=${runId} failed:`, err.message || err);
    await supabase.update('dsgvo_factory_runs', `?id=eq.${runId}`, {
      status: 'failed',
      error_message: String(err.message || err).slice(0, 500),
      finished_at: new Date().toISOString()
    });
    await refundCredits(account_id, COST, `dsgvo-factory-refund-fail-${runId}`);
  });

  return res.json({ ok: true, run_id: runId, status: 'pending', credits_spent: COST });
});

// ─── GET /runs ──────────────────────────────────────────────────
dsgvoFactoryRouter.get('/runs', async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const { data, ok } = await supabase.select(
    'dsgvo_factory_runs',
    `?account_id=eq.${account_id}&order=created_at.desc&limit=50&select=id,template_type,status,pdf_url,credits_spent,error_message,started_at,finished_at,created_at`
  );
  if (!ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, runs: Array.isArray(data) ? data : [] });
});

// ─── GET /runs/:id ──────────────────────────────────────────────
dsgvoFactoryRouter.get('/runs/:id', async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const { id } = req.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ ok: false, error: 'invalid_id' });
  }

  const { data, ok } = await supabase.select(
    'dsgvo_factory_runs',
    `?id=eq.${id}&account_id=eq.${account_id}&limit=1&select=*`
  );
  if (!ok) return res.status(502).json({ ok: false, error: 'db_error' });
  if (!data?.length) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, run: data[0] });
});

// ─── GET /templates ─────────────────────────────────────────────
// Public-ish catalog (still behind requireCustomerAuth from .use above).
dsgvoFactoryRouter.get('/templates', (_req, res) => {
  res.json({
    ok: true,
    templates: [
      { type: 'avv',                   name: 'AVV (Auftragsverarbeitungsvertrag)', status: 'live',         credits: 25 },
      { type: 'datenschutzerklaerung', name: 'Datenschutzerklärung',                status: 'coming_soon',  credits: 25 },
      { type: 'impressum',             name: 'Impressum',                           status: 'coming_soon',  credits: 15 },
      { type: 'agb',                   name: 'AGB',                                 status: 'coming_soon',  credits: 30 },
      { type: 'widerruf',              name: 'Widerrufsbelehrung',                  status: 'coming_soon',  credits: 15 },
      { type: 'newsletter-consent',    name: 'Newsletter-Consent-Text',             status: 'coming_soon',  credits: 10 }
    ]
  });
});
