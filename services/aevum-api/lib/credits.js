// AEVUM Credit + Loyalty Helper
// Earn-Rate: 10 Credits pro €1 → amount_cents / 10
// Stamp-Reward: alle 5 Käufe → 500 Bonus-Credits

import { supabase } from './supabase.js';

function getCreds() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  return { url, key };
}

const STAMPS_PER_REWARD = 5;
const STAMP_BONUS_CREDITS = 500;
const CREDITS_PER_CENT = 0.1; // 10 Credits pro €1 = 0.1 Credits pro Cent

// ─── Ensure account_credits row exists (upsert) ───────────────
async function ensureCreditsRow(account_id) {
  // Try insert — ignore if row exists (UNIQUE constraint on account_id)
  // Supabase REST: Prefer: resolution=ignore-duplicates prevents 409 on conflict
  const { url, key } = getCreds();
  await fetch(`${url}/rest/v1/account_credits`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({ account_id, balance: 0, lifetime_earned: 0 }),
  }).catch(() => {});

  // Always select to get current state
  const { data } = await supabase.select(
    'account_credits',
    `?account_id=eq.${account_id}&select=id,balance,lifetime_earned`
  );
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

// ─── Ensure stamp_cards row exists ────────────────────────────
async function ensureStampRow(account_id) {
  const { url, key } = getCreds();
  await fetch(`${url}/rest/v1/stamp_cards`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({ account_id, stamps: 0 }),
  }).catch(() => {});

  const { data } = await supabase.select(
    'stamp_cards',
    `?account_id=eq.${account_id}&select=id,stamps,last_stamp_at,reward_claimed_at`
  );
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

// ─── earnCredits ──────────────────────────────────────────────
// Gutschreiben von Credits nach Kauf
// amount_cents: Stripe amount_total (in Cent)
// Earn-Rate: 10 Credits pro €1 → Math.floor(amount_cents / 10)
export async function earnCredits(account_id, amount_cents, reference_id, description) {
  if (!account_id) throw new Error('earnCredits: account_id required');

  const earned = Math.floor(amount_cents * CREDITS_PER_CENT);
  if (earned <= 0) return { ok: true, earned: 0, skipped: true };

  // Get/create credits row
  const row = await ensureCreditsRow(account_id);
  if (!row) {
    console.error(`[credits] earnCredits: cannot find/create account_credits for ${account_id}`);
    return { ok: false, error: 'credits_row_missing' };
  }

  // Insert transaction
  await supabase.insert('credit_transactions', {
    account_id,
    amount: earned,
    type: 'purchase_earn',
    reference_id: reference_id || null,
    description: description || `Kauf (${(amount_cents / 100).toFixed(2)} EUR)`,
  });

  // Update balance + lifetime
  const nowIso = new Date().toISOString();
  await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}`,
    {
      balance: row.balance + earned,
      lifetime_earned: row.lifetime_earned + earned,
      updated_at: nowIso,
    }
  );

  console.log(`[credits] earned ${earned} credits for account ${account_id} (${amount_cents} Cent)`);
  return { ok: true, earned };
}

// ─── addStamp ─────────────────────────────────────────────────
// Stempel hinzufügen (1 pro Kauf)
export async function addStamp(account_id) {
  if (!account_id) throw new Error('addStamp: account_id required');

  const row = await ensureStampRow(account_id);
  if (!row) {
    console.error(`[credits] addStamp: cannot find/create stamp_cards for ${account_id}`);
    return { ok: false, error: 'stamp_row_missing' };
  }

  const nowIso = new Date().toISOString();
  const newStamps = row.stamps + 1;

  await supabase.update(
    'stamp_cards',
    `?account_id=eq.${account_id}`,
    {
      stamps: newStamps,
      last_stamp_at: nowIso,
    }
  );

  console.log(`[credits] stamp added for account ${account_id} (total: ${newStamps})`);
  return { ok: true, stamps: newStamps };
}

// ─── checkStampReward ─────────────────────────────────────────
// Alle STAMPS_PER_REWARD Käufe → STAMP_BONUS_CREDITS Bonus-Credits
// Prüft ob Reward fällig, schreibt ihn einmalig gut
export async function checkStampReward(account_id) {
  if (!account_id) throw new Error('checkStampReward: account_id required');

  const { data } = await supabase.select(
    'stamp_cards',
    `?account_id=eq.${account_id}&select=stamps,reward_claimed_at`
  );
  const stampRow = Array.isArray(data) ? data[0] : data;
  if (!stampRow) return { ok: false, error: 'stamp_row_missing' };

  const { stamps, reward_claimed_at } = stampRow;

  // Wie viele vollständige Rewards wurden verdient vs. wie viele ausgezahlt?
  const totalRewardsEarned = Math.floor(stamps / STAMPS_PER_REWARD);
  if (totalRewardsEarned === 0) return { ok: true, reward: false };

  // Zähle wie viele Bonus-Transaktionen schon existieren
  const { data: bonusTxs } = await supabase.select(
    'credit_transactions',
    `?account_id=eq.${account_id}&type=eq.bonus&select=id`
  );
  const paidRewards = Array.isArray(bonusTxs) ? bonusTxs.length : 0;

  const pendingRewards = totalRewardsEarned - paidRewards;
  if (pendingRewards <= 0) return { ok: true, reward: false };

  // Für jeden ausstehenden Reward Credits gutschreiben
  const creditsRow = await ensureCreditsRow(account_id);
  if (!creditsRow) return { ok: false, error: 'credits_row_missing' };

  const totalBonus = pendingRewards * STAMP_BONUS_CREDITS;

  await supabase.insert('credit_transactions', {
    account_id,
    amount: totalBonus,
    type: 'bonus',
    reference_id: `stamp_reward_${totalRewardsEarned}`,
    description: `Stempelkarten-Bonus (${pendingRewards}× ${STAMP_BONUS_CREDITS} Credits)`,
  });

  const nowIso = new Date().toISOString();
  await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}`,
    {
      balance: creditsRow.balance + totalBonus,
      lifetime_earned: creditsRow.lifetime_earned + totalBonus,
      updated_at: nowIso,
    }
  );

  // reward_claimed_at nur beim ersten Reward setzen — danach lassen
  if (!reward_claimed_at) {
    await supabase.update(
      'stamp_cards',
      `?account_id=eq.${account_id}`,
      { reward_claimed_at: nowIso }
    );
  }

  console.log(`[credits] stamp reward: +${totalBonus} credits for account ${account_id} (${pendingRewards} reward(s))`);
  return { ok: true, reward: true, bonus_credits: totalBonus };
}

// ─── spendCredits ─────────────────────────────────────────────
// Atomic credit spend with optional refund (pass negative amount to refund).
// Used by Script-Factory, DSGVO-Factory, etc. (Pay-per-Run SaaS).
//
// amount > 0  → DEBIT  (returns { ok:false, balance } if insufficient)
// amount < 0  → CREDIT (refund — bypasses balance check)
//
// reference  → free-form tag for credit_transactions.description
export async function spendCredits(account_id, amount, reference = 'spend') {
  if (!account_id) throw new Error('spendCredits: account_id required');
  if (typeof amount !== 'number' || amount === 0 || !Number.isFinite(amount)) {
    throw new Error('spendCredits: amount must be non-zero number');
  }

  const row = await ensureCreditsRow(account_id);
  if (!row) return { ok: false, error: 'credits_row_missing', balance: 0 };

  // REFUND path (negative amount → add credits back)
  if (amount < 0) {
    const refundAmount = -amount;
    const nowIso = new Date().toISOString();
    await supabase.insert('credit_transactions', {
      account_id,
      amount: refundAmount,
      type: 'refund',
      reference_id: reference,
      description: `Refund: ${reference}`
    });
    const upd = await supabase.update(
      'account_credits',
      `?account_id=eq.${account_id}`,
      { balance: row.balance + refundAmount, updated_at: nowIso }
    );
    if (!upd.ok) return { ok: false, error: 'db_error', balance: row.balance };
    console.log(`[credits] refund +${refundAmount} (${reference}) account ${account_id}`);
    return { ok: true, balance: row.balance + refundAmount, refunded: refundAmount };
  }

  // DEBIT path — atomic optimistic update (balance >= amount guard)
  if (row.balance < amount) {
    return { ok: false, error: 'insufficient_credits', balance: row.balance, need: amount };
  }
  const nowIso = new Date().toISOString();
  const upd = await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}&balance=gte.${amount}`,
    { balance: row.balance - amount, updated_at: nowIso }
  );
  if (!upd.ok) return { ok: false, error: 'db_error', balance: row.balance };
  if (!Array.isArray(upd.data) || upd.data.length === 0) {
    return { ok: false, error: 'insufficient_credits_or_race', balance: row.balance };
  }

  await supabase.insert('credit_transactions', {
    account_id,
    amount: -amount,
    type: 'redemption',
    reference_id: reference,
    description: `Spend: ${reference}`
  });

  console.log(`[credits] spent -${amount} (${reference}) account ${account_id}`);
  return { ok: true, balance: row.balance - amount, spent: amount };
}
