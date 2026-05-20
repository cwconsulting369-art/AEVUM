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

// Package catalogue. Stripe Price IDs are set per environment via env vars.
// Once final pricing lands, Carlos creates Products + Prices in Stripe Dashboard
// and pastes the IDs into aevum.env. Defaults are placeholder strings that
// will throw at checkout creation time (visible error, fails loudly).
export const PACKAGES = {
  S: {
    name: 'AEVUM Start',
    description: 'Workflow-Audit + Automatisierungs-Roadmap. Kein Build.',
    priceIdEnv: 'STRIPE_PRICE_PACKAGE_S',
    type: 'one_time',
  },
  M: {
    name: 'AEVUM Wachstum',
    description: 'Vollständige Implementation 1-2 Use Cases + 3 Monate Support.',
    priceIdEnv: 'STRIPE_PRICE_PACKAGE_M',
    type: 'one_time',
  },
  L: {
    name: 'AEVUM Skalierung',
    description: 'Laufende Optimierung + Performance-Reports + neue Use Cases on-demand.',
    priceIdEnv: 'STRIPE_PRICE_PACKAGE_L',
    type: 'recurring',
  },
};

// Pilot-program discount — Carlos confirmed 30%.
// Stored as a Stripe Coupon (Carlos creates it once, ID goes here).
export const PILOT_COUPON_ID_ENV = 'STRIPE_COUPON_PILOT';

export function getPriceId(tier) {
  const pkg = PACKAGES[tier];
  if (!pkg) throw new Error(`unknown package tier: ${tier}`);
  const id = process.env[pkg.priceIdEnv];
  if (!id) throw new Error(`missing env ${pkg.priceIdEnv} — package not configured yet`);
  return id;
}

export function isPilotActive() {
  return Boolean(process.env[PILOT_COUPON_ID_ENV]);
}
