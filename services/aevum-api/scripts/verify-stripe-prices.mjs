#!/usr/bin/env node
/**
 * Stripe-Price-Verify-Pass — Anti-Scheintechnik-Kern.
 *
 * Für jedes shop_products-Item mit stripe_price_id wird REAL gegen die Stripe-API
 * geprüft, ob die Price existiert UND aktiv ist. Ergebnis → stripe_price_verified.
 *
 * Ein Produkt darf im Shop NUR dann als kaufbar erscheinen, wenn diese Verifikation
 * grün ist. Kein Vertrauen in hartcodierte/erfundene Price-IDs.
 *
 * Idempotent. Sollte nach jedem Seed + regelmäßig (Cron) laufen.
 *
 * Usage: node verify-stripe-prices.mjs [--dry]
 *   ENV: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const DRY = process.argv.includes('--dry');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen');
  process.exit(1);
}
if (!STRIPE_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY fehlt — ohne kann nicht verifiziert werden');
  process.exit(1);
}

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function stripePrice(id) {
  const r = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  });
  if (r.status === 200) {
    const p = await r.json();
    return { ok: true, active: !!p.active };
  }
  if (r.status === 404) return { ok: false, reason: 'not_found' };
  return { ok: false, reason: `http_${r.status}` };
}

// 1) Alle Produkte mit stripe_price_id laden
const listRes = await fetch(
  `${SUPABASE_URL}/rest/v1/shop_products?select=slug,stripe_price_id,stripe_price_verified&stripe_price_id=not.is.null`,
  { headers: sbHeaders }
);
if (!listRes.ok) {
  console.error(`[verify] load FEHLER ${listRes.status}: ${(await listRes.text()).slice(0, 300)}`);
  process.exit(1);
}
const items = await listRes.json();
console.log(`[verify] ${items.length} Produkte mit stripe_price_id`);

let verified = 0;
let failed = 0;
const failures = [];

for (const it of items) {
  const r = await stripePrice(it.stripe_price_id);
  const isVerified = r.ok && r.active;
  if (isVerified) verified++;
  else {
    failed++;
    failures.push(`${it.slug} (${it.stripe_price_id}): ${r.ok ? 'inactive' : r.reason}`);
  }

  if (!DRY) {
    const patch = await fetch(
      `${SUPABASE_URL}/rest/v1/shop_products?slug=eq.${encodeURIComponent(it.slug)}`,
      {
        method: 'PATCH',
        headers: { ...sbHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({
          stripe_price_verified: isVerified,
          stripe_verified_at: new Date().toISOString(),
        }),
      }
    );
    if (!patch.ok) {
      console.error(`[verify] PATCH ${it.slug} FEHLER ${patch.status}`);
    }
  }
}

console.log(`[verify] ${verified} verifiziert, ${failed} NICHT verifiziert${DRY ? ' (DRY — nicht geschrieben)' : ''}`);
if (failures.length) {
  console.log('[verify] NICHT-verifizierte Prices (erscheinen NICHT als kaufbar):');
  for (const f of failures) console.log('   - ' + f);
}
