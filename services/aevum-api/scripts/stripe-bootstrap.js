// AEVUM Stripe Bootstrap — idempotent setup of Products + Prices + Coupon + Webhook
// Created: 2026-05-20
// Run: node scripts/stripe-bootstrap.js
//
// Reads STRIPE_SECRET_KEY from /home/carlos/.envs/aevum.env (must be sk_live_ for production setup).
// Writes resulting IDs back to the same file (replaces existing lines or appends).
// Re-running is safe: uses lookup_keys + metadata for idempotent resolve.

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

import Stripe from 'stripe';
import fs from 'fs/promises';

const ENV_FILE = '/home/carlos/.envs/aevum.env';
const WEBHOOK_URL = 'https://api.lennoxos.com/api/checkout/webhook';

const sk = process.env.STRIPE_SECRET_KEY;
if (!sk) {
  console.error('FATAL: STRIPE_SECRET_KEY missing in aevum.env');
  process.exit(1);
}
const isLive = sk.startsWith('sk_live_');
console.log(`[bootstrap] mode = ${isLive ? 'LIVE' : 'TEST'} (key prefix: ${sk.slice(0, 12)}...)`);

const stripe = new Stripe(sk, { apiVersion: '2024-12-18.acacia' });

const PRODUCTS = [
  {
    key: 'S',
    name: 'AEVUM Start',
    description: 'Workflow-Audit + Automatisierungs-Roadmap. Kein Build.',
    amount: 390000, // EUR cents
    recurring: false,
    lookup_key: 'aevum_s_one_time',
    env_key: 'STRIPE_PRICE_PACKAGE_S',
  },
  {
    key: 'M',
    name: 'AEVUM Wachstum',
    description: 'Vollständige Implementation 1-2 Use Cases + 3 Monate Support.',
    amount: 1290000,
    recurring: false,
    lookup_key: 'aevum_m_one_time',
    env_key: 'STRIPE_PRICE_PACKAGE_M',
  },
  {
    key: 'L',
    name: 'AEVUM Skalierung',
    description: 'Laufende Optimierung + Performance-Reports + neue Use Cases on-demand.',
    amount: 490000,
    recurring: true,
    lookup_key: 'aevum_l_monthly',
    env_key: 'STRIPE_PRICE_PACKAGE_L',
  },
];

const COUPON_ID = 'aevum_pilot_30';

// ─── helpers ────────────────────────────────────────────────────
async function findOrCreateProduct(spec) {
  const list = await stripe.products.search({
    query: `metadata['aevum_key']:'${spec.key}'`,
    limit: 1,
  });
  if (list.data.length) {
    console.log(`[product:${spec.key}] reuse ${list.data[0].id} (${list.data[0].name})`);
    return list.data[0];
  }
  const created = await stripe.products.create({
    name: spec.name,
    description: spec.description,
    metadata: { aevum_key: spec.key },
  });
  console.log(`[product:${spec.key}] created ${created.id}`);
  return created;
}

async function findOrCreatePrice(spec, productId) {
  const list = await stripe.prices.list({ lookup_keys: [spec.lookup_key], limit: 1 });
  if (list.data.length) {
    const existing = list.data[0];
    if (existing.unit_amount !== spec.amount) {
      console.warn(
        `[price:${spec.key}] lookup match but AMOUNT MISMATCH: stripe=${existing.unit_amount} vs spec=${spec.amount}. Keeping existing — change requires manual archive + new price.`
      );
    }
    console.log(`[price:${spec.key}] reuse ${existing.id} (${existing.unit_amount} ${existing.currency})`);
    return existing;
  }
  const params = {
    product: productId,
    unit_amount: spec.amount,
    currency: 'eur',
    lookup_key: spec.lookup_key,
  };
  if (spec.recurring) {
    params.recurring = { interval: 'month' };
  }
  const created = await stripe.prices.create(params);
  console.log(`[price:${spec.key}] created ${created.id}`);
  return created;
}

async function findOrCreateCoupon() {
  try {
    const existing = await stripe.coupons.retrieve(COUPON_ID);
    console.log(`[coupon] reuse ${existing.id} (${existing.percent_off}% off, ${existing.duration})`);
    return existing;
  } catch (e) {
    if (e.code !== 'resource_missing') throw e;
    const created = await stripe.coupons.create({
      id: COUPON_ID,
      percent_off: 30,
      duration: 'forever',
      name: 'AEVUM Pilot 30%',
    });
    console.log(`[coupon] created ${created.id}`);
    return created;
  }
}

async function findOrCreateWebhook() {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = list.data.find((w) => w.url === WEBHOOK_URL);
  if (existing) {
    console.log(`[webhook] reuse ${existing.id} → ${existing.url}`);
    // Secret is only returned on create; if Carlos already has one in env, keep it.
    return { ...existing, secret: null };
  }
  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: [
      'checkout.session.completed',
      'checkout.session.expired',
      'payment_intent.payment_failed',
      'customer.subscription.deleted',
      'invoice.payment_failed',
    ],
    description: 'AEVUM checkout webhook (auto-created by bootstrap)',
  });
  console.log(`[webhook] created ${created.id} → ${created.url}`);
  return created; // secret is on `.secret`
}

// ─── env-file writer ───────────────────────────────────────────
async function upsertEnvLines(updates) {
  let content = await fs.readFile(ENV_FILE, 'utf8');
  for (const [key, value] of Object.entries(updates)) {
    if (value == null) continue;
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^#?\\s*${escaped}=.*$`, 'gm');
    const line = `${key}=${value}`;
    if (re.test(content)) {
      content = content.replace(re, line);
      console.log(`[env] replaced ${key}`);
    } else {
      content = content.replace(/\s*$/, '') + `\n${line}\n`;
      console.log(`[env] appended ${key}`);
    }
  }
  await fs.writeFile(ENV_FILE, content, { mode: 0o600 });
}

// ─── main ──────────────────────────────────────────────────────
const results = {};

for (const spec of PRODUCTS) {
  const product = await findOrCreateProduct(spec);
  const price = await findOrCreatePrice(spec, product.id);
  results[spec.env_key] = price.id;
}

const coupon = await findOrCreateCoupon();
results['STRIPE_COUPON_PILOT'] = coupon.id;

const webhook = await findOrCreateWebhook();
if (webhook.secret) {
  results['STRIPE_WEBHOOK_SECRET'] = webhook.secret;
} else {
  console.warn('[webhook] reuse: secret not retrievable. If STRIPE_WEBHOOK_SECRET is missing in env, delete the webhook in Stripe dashboard and re-run.');
}

await upsertEnvLines(results);

console.log('\n[done] Summary:');
for (const [k, v] of Object.entries(results)) {
  console.log(`  ${k}=${v}`);
}
console.log(`\nNext: pm2 restart aevum-api`);
