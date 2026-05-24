import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY missing — checkout routes will refuse to start');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: false,
    })
  : null;

// Pilot-program discount — Carlos confirmed 30%.
// Stored as a Stripe Coupon (Carlos creates it once, ID goes here).
export const PILOT_COUPON_ID_ENV = 'STRIPE_COUPON_PILOT';

export function isPilotActive() {
  return Boolean(process.env[PILOT_COUPON_ID_ENV]);
}

// NOTE: Legacy `PACKAGES` (S/M/L tier-based audit-packages) and `getPriceId()` were
// removed 2026-05-24 — superseded by mig009 `blueprint_pricing.stripe_price_id`
// SSOT + the `/api/checkout/blueprint` direct-price-id flow used by Shop.tsx.
