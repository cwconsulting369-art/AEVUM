import { Router } from 'express';
import { z } from 'zod';
import { stripe, PACKAGES, getPriceId, PILOT_COUPON_ID_ENV } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { clean, scanPayload } from '../lib/security.js';
import { logBlock } from '../lib/monitor.js';
import { CONSENT_VERSION } from './audit.js';

export const checkoutRouter = Router();

const SITE_BASE = process.env.SITE_BASE_URL || 'https://aevum-system.de';

const CheckoutSchema = z.object({
  tier: z.enum(['S', 'M', 'L']),
  // optional add-on price IDs (Carlos defines them in Stripe later)
  addonPriceIds: z.array(z.string().min(1)).max(10).optional().default([]),
  // optional bundle override — explicit flag if 2+ services bundled
  bundleSize: z.number().int().min(1).max(10).optional().default(1),
  customerEmail: z.string().email().max(200),
  customerName: z.string().min(1).max(200).optional(),
  customerCompany: z.string().max(200).optional(),
  // request pilot discount? (frontend reads pilot_slots first; backend re-verifies)
  requestPilot: z.boolean().optional().default(false),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Einwilligung zur Datenverarbeitung erforderlich' }),
  }),
  // honeypot — must stay empty; bots fill it
  website: z.string().max(500).optional().default(''),
  // time-check — must be > 1500ms between form-open and submit (BuyButton uses 1500)
  formStartedAt: z.number().optional(),
});

function clientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    'unknown'
  );
}

// ─── POST /api/checkout/create-session ──────────────────────────
// Body: { tier, addonPriceIds, bundleSize, customerEmail, customerName, customerCompany, requestPilot, consent }
// Returns: { ok, url } — frontend redirects to Stripe Checkout
checkoutRouter.post('/create-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ ok: false, error: 'stripe_not_configured' });
  }

  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';
  const ctx = { ip, user_agent: ua, endpoint: 'POST /api/checkout/create-session' };

  const parsed = CheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    logBlock({ ...ctx, type: 'validation_fail', reason: JSON.stringify(parsed.error.flatten().fieldErrors).slice(0, 200) });
    return res.status(400).json({
      ok: false,
      error: 'validation_failed',
      details: parsed.error.flatten(),
    });
  }
  const f = parsed.data;

  // ─── Honeypot — silent fail (bot doesn't learn it was detected) ───
  if (f.website && f.website.length > 0) {
    logBlock({ ...ctx, type: 'honeypot_triggered', reason: `website-field filled: ${f.website.slice(0, 100)}` });
    return res.json({ ok: true, url: '/services?checkout=cancelled' });
  }

  // ─── Time-check ───
  if (f.formStartedAt) {
    const elapsed = Date.now() - f.formStartedAt;
    if (elapsed < 1500) {
      logBlock({ ...ctx, type: 'too_fast', reason: `submitted in ${elapsed}ms (min 1500)` });
      return res.json({ ok: true, url: '/services?checkout=cancelled' });
    }
  }

  // ─── Pattern-scan ───
  const attackHits = scanPayload({
    customerName: f.customerName || '',
    customerCompany: f.customerCompany || '',
    customerEmail: f.customerEmail
  });
  if (attackHits.length > 0) {
    logBlock({
      ...ctx,
      type: 'attack_pattern',
      reason: attackHits.map(h => `${h.field}:${h.reason}`).join('; '),
      payload_summary: `tier=${f.tier} email=${f.customerEmail}`
    });
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  // Build line_items
  let priceId;
  try {
    priceId = getPriceId(f.tier);
  } catch (e) {
    console.error('[checkout] price lookup failed:', e.message);
    return res.status(503).json({ ok: false, error: 'package_not_configured', detail: e.message });
  }

  const lineItems = [
    { price: priceId, quantity: 1 },
    ...f.addonPriceIds.map((id) => ({ price: id, quantity: 1 })),
  ];

  // Pilot-discount handling — re-verify slot availability before granting
  let allowPilot = false;
  let pilotSlotNumber = null;
  if (f.requestPilot) {
    const { data: slotRow } = await supabase.select(
      'pilot_slots',
      '?id=eq.1&select=total_slots,slots_taken'
    );
    const slot = Array.isArray(slotRow) ? slotRow[0] : slotRow;
    if (slot && slot.slots_taken < slot.total_slots) {
      allowPilot = true;
      pilotSlotNumber = slot.slots_taken + 1;
    }
  }

  const couponId = allowPilot ? process.env[PILOT_COUPON_ID_ENV] : null;

  // Bundle discount — optional, applied as a percent_off via dynamic coupon
  // For now we keep it metadata-only and reconcile at fulfilment.
  // (Stripe dynamic coupons require account permissions; revisit when needed.)

  const pkg = PACKAGES[f.tier];

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: pkg.type === 'recurring' ? 'subscription' : 'payment',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: lineItems,
      customer_email: f.customerEmail,
      allow_promotion_codes: !couponId,
      discounts: couponId ? [{ coupon: couponId }] : undefined,
      success_url: `${SITE_BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_BASE}/services?checkout=cancelled`,
      metadata: {
        tier: f.tier,
        bundleSize: String(f.bundleSize),
        addonPriceIds: f.addonPriceIds.join(','),
        pilotApplied: String(allowPilot),
        pilotSlot: pilotSlotNumber ? String(pilotSlotNumber) : '',
        customerName: f.customerName || '',
        customerCompany: f.customerCompany || '',
      },
      locale: 'de',
    });
  } catch (e) {
    console.error('[checkout] stripe session create failed:', e.message);
    return res.status(502).json({ ok: false, error: 'stripe_error', detail: e.message });
  }

  // Pre-insert pending order row so we can match the webhook
  const orderInsert = await supabase.insert('orders', {
    stripe_session_id: session.id,
    customer_email: clean(f.customerEmail),
    customer_name: f.customerName ? clean(f.customerName) : null,
    customer_company: f.customerCompany ? clean(f.customerCompany) : null,
    package_tier: f.tier,
    package_name: pkg.name,
    base_price_cents: 0, // populated by webhook from session amount_total
    pilot_discount_applied: allowPilot,
    pilot_discount_percent: allowPilot ? 30 : 0,
    pilot_slot_number: pilotSlotNumber,
    addons: f.addonPriceIds,
    bundle_discount_percent: f.bundleSize > 1 ? Math.min(20, (f.bundleSize - 1) * 10) : 0,
    subtotal_cents: 0,
    total_cents: 0,
    status: 'pending',
    ip,
    user_agent: ua,
  });
  const insertedOrder = Array.isArray(orderInsert.data) ? orderInsert.data[0] : orderInsert.data;

  // Log consent (Art 7 — Nachweis der Einwilligung at checkout time)
  supabase.insert('consent_log', {
    order_id: insertedOrder?.id || null,
    email: clean(f.customerEmail),
    consent_type: 'checkout_purchase',
    consent_text_version: CONSENT_VERSION,
    ip,
    user_agent: ua
  }).catch(err => console.error('consent_log fail (checkout):', err));

  return res.json({ ok: true, url: session.url, sessionId: session.id });
});

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

    if (row?.id) {
      await supabase.update(
        'orders',
        `?id=eq.${row.id}`,
        {
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent: session.payment_intent,
          stripe_customer_id: session.customer,
          total_cents: amountTotal,
          subtotal_cents: amountTotal,
          base_price_cents: amountTotal,
          currency,
          updated_at: new Date().toISOString(),
        }
      );
    } else {
      // Webhook arrived without a preceding create-session row (rare; log + fallback insert)
      await supabase.insert('orders', {
        stripe_session_id: sessionId,
        customer_email: session.customer_details?.email || 'unknown@example.com',
        package_tier: session.metadata?.tier || 'custom',
        package_name: session.metadata?.tier ? PACKAGES[session.metadata.tier]?.name : 'Unknown',
        base_price_cents: amountTotal,
        subtotal_cents: amountTotal,
        total_cents: amountTotal,
        pilot_discount_applied: session.metadata?.pilotApplied === 'true',
        pilot_discount_percent: session.metadata?.pilotApplied === 'true' ? 30 : 0,
        currency,
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent,
        stripe_customer_id: session.customer,
      });
    }

    // PII-minimised TG notification
    const emailMasked = (session.customer_details?.email || '').replace(/^(.).+(@.+)$/, '$1***$2');
    const totalEur = (amountTotal / 100).toFixed(2);
    const tier = session.metadata?.tier || '?';
    notifyCarlos(
      `💰 *Neuer AEVUM-Sale* — Paket ${tier}\n*Betrag:* ${totalEur} EUR\n*Kunde:* ${emailMasked}\n${session.metadata?.pilotApplied === 'true' ? `*Pilot-Slot:* ${session.metadata.pilotSlot}/10\n` : ''}_Volle Daten in Supabase orders-Tabelle_`
    );
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
