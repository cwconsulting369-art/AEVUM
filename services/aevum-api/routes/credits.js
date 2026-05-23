// AEVUM Credit + Loyalty API
// All endpoints require customer auth (Bearer JWT)
//
// GET  /api/credits                   — eigenes Credit-Konto + Stempelkarte
// GET  /api/credits/transactions      — letzte 20 Transaktionen
// POST /api/credits/redeem            — Credits einlösen

import { Router } from 'express';
import { z } from 'zod';
import { requireCustomerAuth } from '../lib/crypto.js';
import { supabase } from '../lib/supabase.js';

export const creditsRouter = Router();

const STAMPS_PER_REWARD = 5;

// ─── GET /api/credits ────────────────────────────────────────
// Gibt Kontostand, lifetime_earned + Stempelkarten-Status zurück
creditsRouter.get('/', requireCustomerAuth, async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const [creditsRes, stampRes] = await Promise.all([
    supabase.select('account_credits', `?account_id=eq.${account_id}&select=balance,lifetime_earned`),
    supabase.select('stamp_cards', `?account_id=eq.${account_id}&select=stamps`),
  ]);

  const credits = Array.isArray(creditsRes.data) ? creditsRes.data[0] : creditsRes.data;
  const stamps = Array.isArray(stampRes.data) ? stampRes.data[0] : stampRes.data;

  const balance = credits?.balance ?? 0;
  const lifetime = credits?.lifetime_earned ?? 0;
  const stampCount = stamps?.stamps ?? 0;
  const stampsUntilReward = STAMPS_PER_REWARD - (stampCount % STAMPS_PER_REWARD);

  return res.json({
    ok: true,
    balance,
    lifetime,
    stamps: stampCount,
    stamps_until_reward: stampsUntilReward === STAMPS_PER_REWARD ? 0 : stampsUntilReward,
  });
});

// ─── GET /api/credits/transactions ───────────────────────────
// Letzte 20 Transaktionen, neueste zuerst
creditsRouter.get('/transactions', requireCustomerAuth, async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const { data, ok } = await supabase.select(
    'credit_transactions',
    `?account_id=eq.${account_id}&order=created_at.desc&limit=20&select=id,amount,type,reference_id,description,created_at`
  );

  if (!ok) return res.status(502).json({ ok: false, error: 'db_error' });

  return res.json({
    ok: true,
    transactions: Array.isArray(data) ? data : [],
  });
});

// ─── POST /api/credits/redeem ────────────────────────────────
// Credits einlösen für erlaubte Zwecke
// Body: { amount: integer, purpose: string }
const ALLOWED_PURPOSES = ['tool_access', 'blueprint_discount', 'consultation'];

const RedeemSchema = z.object({
  amount: z.number().int().min(1).max(100000),
  purpose: z.enum(ALLOWED_PURPOSES, {
    errorMap: () => ({ message: `purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}` }),
  }),
});

creditsRouter.post('/redeem', requireCustomerAuth, async (req, res) => {
  const account_id = req.customer.account_id;
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const parsed = RedeemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'validation_failed',
      details: parsed.error.flatten(),
    });
  }
  const { amount, purpose } = parsed.data;

  // Lade aktuellen Kontostand
  const { data: creditsData, ok } = await supabase.select(
    'account_credits',
    `?account_id=eq.${account_id}&select=balance`
  );
  if (!ok) return res.status(502).json({ ok: false, error: 'db_error' });

  const creditsRow = Array.isArray(creditsData) ? creditsData[0] : creditsData;
  const currentBalance = creditsRow?.balance ?? 0;

  if (currentBalance < amount) {
    return res.status(400).json({
      ok: false,
      error: 'insufficient_credits',
      balance: currentBalance,
      requested: amount,
    });
  }

  // Transaktion eintragen (negativ = Einlösung)
  await supabase.insert('credit_transactions', {
    account_id,
    amount: -amount,
    type: 'redemption',
    reference_id: purpose,
    description: `Einlösung für: ${purpose}`,
  });

  // Balance aktualisieren
  const newBalance = currentBalance - amount;
  const nowIso = new Date().toISOString();
  await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}`,
    { balance: newBalance, updated_at: nowIso }
  );

  return res.json({
    ok: true,
    new_balance: newBalance,
    redeemed: amount,
    purpose,
  });
});
