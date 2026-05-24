import { Router } from 'express';
import { z } from 'zod';
import { stripe, PILOT_COUPON_ID_ENV } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { earnCredits, addStamp, checkStampReward } from '../lib/credits.js';

export const checkoutRouter = Router();

// HGB §147 — 10 Jahre Aufbewahrung kaufmännischer Belege
const ORDER_RETENTION_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const IMMEDIATE_START_VERSION = 'immediate-start-v1-2026-05-20';

function maskEmail(e) {
  if (!e || typeof e !== 'string') return '';
  return e.replace(/^(.).+(@.+)$/, '$1***$2');
}

// ─── POST /api/checkout/webhook ─────────────────────────────────
// Stripe sends events here. Verified with STRIPE_WEBHOOK_SECRET.
// Express must NOT parse JSON on this route — we need the raw body.
checkoutRouter.post('/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('webhook not configured');
  }
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('[webhook] signature verification failed:', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency ?? 'eur';

    const { data: existing } = await supabase.select(
      'orders',
      `?stripe_session_id=eq.${sessionId}&select=id`
    );
    const row = Array.isArray(existing) ? existing[0] : existing;

    const paidAt = new Date();
    const paidAtIso = paidAt.toISOString();
    // HGB §147 — 10 Jahre Aufbewahrungspflicht
    const dsgvoDeletionDueIso = new Date(paidAt.getTime() + ORDER_RETENTION_MS).toISOString();
    const metaImmediateStart = session.metadata?.consent_immediate_start === 'true';
    const metaImmediateStartVersion =
      session.metadata?.consent_immediate_start_version || (metaImmediateStart ? IMMEDIATE_START_VERSION : null);

    let finalOrderId = row?.id || null;

    if (row?.id) {
      await supabase.update(
        'orders',
        `?id=eq.${row.id}`,
        {
          status: 'paid',
          paid_at: paidAtIso,
          dsgvo_deletion_due: dsgvoDeletionDueIso,
          stripe_payment_intent: session.payment_intent,
          stripe_customer_id: session.customer,
          total_cents: amountTotal,
          subtotal_cents: amountTotal,
          base_price_cents: amountTotal,
          currency,
          updated_at: paidAtIso,
        }
      );
    } else {
      // Webhook arrived without a preceding create-session row (rare; log + fallback insert)
      const fallbackInsert = await supabase.insert('orders', {
        stripe_session_id: sessionId,
        customer_email: session.customer_details?.email || 'unknown@example.com',
        package_tier: session.metadata?.tier || session.metadata?.blueprint_slug || 'shop',
        package_name: session.metadata?.blueprint_slug || session.metadata?.product_id || 'Shop Purchase',
        base_price_cents: amountTotal,
        subtotal_cents: amountTotal,
        total_cents: amountTotal,
        pilot_discount_applied: session.metadata?.pilotApplied === 'true',
        pilot_discount_percent: session.metadata?.pilotApplied === 'true' ? 30 : 0,
        currency,
        status: 'paid',
        paid_at: paidAtIso,
        dsgvo_deletion_due: dsgvoDeletionDueIso,
        stripe_payment_intent: session.payment_intent,
        stripe_customer_id: session.customer,
        consent_immediate_start: metaImmediateStart,
        consent_immediate_start_at: metaImmediateStart ? paidAtIso : null,
        consent_immediate_start_version: metaImmediateStartVersion,
      });
      const inserted = Array.isArray(fallbackInsert.data) ? fallbackInsert.data[0] : fallbackInsert.data;
      finalOrderId = inserted?.id || null;
    }

    // § 356 Abs 4 BGB — post-payment consent_log entry (Beweissicherung Vertragsschluss)
    if (metaImmediateStart) {
      supabase.insert('consent_log', {
        order_id: finalOrderId,
        email: session.customer_details?.email || null,
        consent_type: 'immediate_start_waiver_confirmed_at_payment',
        consent_text_version: metaImmediateStartVersion || IMMEDIATE_START_VERSION,
        ip_anonymized: null,
        user_agent: 'stripe-webhook'
      }).catch(err => console.error('consent_log fail (webhook waiver):', err));
    }

    // ─── account_type='shop' Logik (2026-05-24) ──────────────────
    // Per mig019: account_type hat NOT NULL DEFAULT 'customer', Backfill setzt
    // has_agent_access=true für existierende Vollkunden. Daher:
    //   - Vollkunde   = account_type='customer' AND has_agent_access=true → NICHT überschreiben
    //   - Shop-Käufer = account_type='shop'  → bleibt shop
    //   - SaaS-User   = account_type='saas' → bleibt saas
    //   - Default-Row (customer + has_agent_access=false) → auf 'shop' downgraden
    //   - Kein Account → nur loggen (Carlos-Policy: kein auto-create)
    const buyerEmail = session.customer_details?.email?.toLowerCase();
    if (buyerEmail) {
      try {
        const { data: acctRows } = await supabase.select(
          'accounts',
          `?email=eq.${encodeURIComponent(buyerEmail)}&select=id,account_type,has_agent_access&limit=1`
        );
        const acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;

        if (!acct) {
          console.log(`[checkout-webhook] shop-buy ohne Account: ${maskEmail(buyerEmail)} — kein Account erzeugt (Carlos-Policy)`);
        } else if (acct.account_type === 'customer' && acct.has_agent_access === true) {
          console.log(`[checkout-webhook] Vollkunde ${acct.id} kauft Blueprint — account_type bleibt 'customer'`);
        } else if (acct.account_type === 'shop') {
          console.log(`[checkout-webhook] Account ${acct.id} bereits 'shop' — unverändert`);
        } else if (acct.account_type === 'saas') {
          console.log(`[checkout-webhook] Account ${acct.id} ist 'saas' — unverändert`);
        } else {
          // Default-Row ohne Upgrade → auf 'shop' setzen
          await supabase.update(
            'accounts',
            `?id=eq.${acct.id}`,
            { account_type: 'shop', has_agent_access: false, updated_at: paidAtIso }
          );
          console.log(`[checkout-webhook] Account ${acct.id} (${acct.account_type}/agent=${acct.has_agent_access}) → account_type='shop' gesetzt`);
        }
      } catch (acctErr) {
        console.error('[checkout-webhook] account_type-Logik error (non-fatal):', acctErr.message);
      }
    }

    // PII-minimised TG notification
    const emailMasked = maskEmail(session.customer_details?.email || '');
    const totalEur = (amountTotal / 100).toFixed(2);
    const tier = session.metadata?.blueprint_slug || session.metadata?.tier || session.metadata?.product_id || '?';
    notifyCarlos(
      `💰 *Neuer AEVUM-Sale* — ${tier}\n*Betrag:* ${totalEur} EUR\n*Kunde:* ${emailMasked}\n${session.metadata?.pilotApplied === 'true' ? `*Pilot-Slot:* ${session.metadata.pilotSlot}/10\n` : ''}_Volle Daten in Supabase orders-Tabelle_`
    );

    // Credits + Loyalty: nur wenn account_id in Session-Metadata vorhanden
    const accountId = session.metadata?.account_id;
    if (accountId) {
      try {
        await earnCredits(accountId, amountTotal, session.id, 'Blueprint-Kauf');
        await addStamp(accountId);
        await checkStampReward(accountId);
      } catch (credErr) {
        // Loyalty-Fehler dürfen den Webhook nicht blockieren
        console.error('[webhook] credits/loyalty error (non-fatal):', credErr.message);
      }
    }
  }

  // Other event types ignored for now (payment_intent.succeeded etc. — redundant with checkout.session.completed)
  return res.json({ received: true });
});

// ─── GET /api/checkout/pilot-status ─────────────────────────────
// Public — frontend uses this to render "X/10 Pilot-Plätze frei"
checkoutRouter.get('/pilot-status', async (req, res) => {
  const { data } = await supabase.select(
    'pilot_slots',
    '?id=eq.1&select=total_slots,slots_taken'
  );
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return res.json({ total: 10, taken: 0, free: 10 });
  return res.json({
    total: row.total_slots,
    taken: row.slots_taken,
    free: Math.max(0, row.total_slots - row.slots_taken),
  });
});

// ─── POST /api/checkout/blueprint ───────────────────────────────
// Direct blueprint purchase via Stripe Price ID (no tier/addon logic)
// Body: { stripe_price_id, product_id, metadata, success_url, cancel_url, account_id? }
const BlueprintCheckoutSchema = z.object({
  stripe_price_id: z.string().min(1),
  product_id: z.string().min(1),
  mode: z.enum(['payment', 'subscription']).optional().default('payment'),
  metadata: z.record(z.string()).optional().default({}),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  account_id: z.string().uuid().optional(),
});

checkoutRouter.post('/blueprint', async (req, res) => {
  if (!stripe) return res.status(503).json({ ok: false, error: 'stripe_not_configured' });

  const parsed = BlueprintCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const f = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: f.mode,
      line_items: [{ price: f.stripe_price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: f.success_url,
      cancel_url: f.cancel_url,
      metadata: {
        ...f.metadata,
        product_id: f.product_id,
        ...(f.account_id ? { account_id: f.account_id } : {}),
      },
    });

    return res.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err) {
    console.error('[blueprint-checkout] stripe error:', err.message);
    return res.status(500).json({ ok: false, error: 'stripe_error', detail: err.message });
  }
});

// NOTE: Legacy `POST /api/checkout/create-session` (S/M/L tier flow) was removed
// 2026-05-24 — superseded by `/api/checkout/blueprint`. BuyButton.tsx (orphan
// frontend caller) was also removed in the same commit.
