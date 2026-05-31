#!/usr/bin/env node
/**
 * Seed shop_products aus der statischen Registry (apps/web/src/data/shop-items/index.ts).
 *
 * Warum: index.ts ist die bestehende, kuratierte, preislich+Stripe-valide Wahrheit
 * für 27 Live-Produkte. Diese Migration überführt sie in shop_products (= neue SSOT),
 * OHNE den laufenden Shop zu brechen. Danach treibt die DB die Liste.
 *
 * Idempotent: Upsert on conflict(slug). Setzt is_active=true, source='static-seed'.
 * stripe_price_verified bleibt false → wird vom Stripe-Verify-Pass gesetzt
 * (verify-stripe-prices.mjs). Kein Auto-Vertrauen in Price-IDs.
 *
 * Reproduzierbar: nutzt esbuild (apps/web/node_modules/.bin) um die TS-Registry
 * standalone zu bundeln und SHOP_ITEMS auszulesen. Kann nach Registry-Änderungen
 * erneut laufen.
 *
 * Usage: node seed-shop-products.mjs [--dry]
 *   ENV: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../../..');
const REGISTRY_TS = path.join(REPO, 'apps/web/src/data/shop-items/index.ts');
const ESBUILD = path.join(REPO, 'apps/web/node_modules/.bin/esbuild');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes('--dry');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen');
  process.exit(1);
}
if (!fs.existsSync(REGISTRY_TS)) {
  console.error(`ERROR: Registry nicht gefunden: ${REGISTRY_TS}`);
  process.exit(1);
}
if (!fs.existsSync(ESBUILD)) {
  console.error(`ERROR: esbuild nicht gefunden: ${ESBUILD}`);
  process.exit(1);
}

// 1) Registry standalone bundeln (nur ./types als Dep) → temp ESM
const tmp = path.join(os.tmpdir(), `shop-items-bundle-${process.pid}.mjs`);
console.log('[seed] bundle Registry via esbuild …');
execFileSync(ESBUILD, [
  REGISTRY_TS,
  '--bundle',
  '--format=esm',
  '--platform=node',
  `--outfile=${tmp}`,
], { stdio: ['ignore', 'ignore', 'inherit'] });

const mod = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const SHOP_ITEMS = mod.SHOP_ITEMS;
if (!SHOP_ITEMS || typeof SHOP_ITEMS !== 'object') {
  console.error('ERROR: SHOP_ITEMS export nicht gefunden im Bundle');
  process.exit(1);
}

// 2) ShopItemContent → shop_products-Row mappen
function toRow(it) {
  return {
    slug: it.slug,
    name: it.name,
    type: it.type,
    tag: it.tag ?? null,
    price_label: it.priceLabel ?? null,
    price: typeof it.price === 'number' ? it.price : null,
    currency: 'EUR',
    stripe_price_id: it.stripePriceId ?? null,
    // stripe_price_verified NICHT hier setzen — Verify-Pass übernimmt (kein Auto-Vertrauen)
    security_level: it.securityLevel ?? 'business',
    icp: Array.isArray(it.icp) ? it.icp : [],
    category: it.category ?? null,
    tagline: it.tagline ?? null,
    what_is_it: it.whatIsIt ?? null,
    outcomes: it.outcomes ?? [],
    when_it_fits: it.whenItFits ?? {},
    includes: it.includes ?? [],
    pricing_note: it.pricingNote ?? null,
    security_note: it.securityNote ?? null,
    faq: it.faq ?? [],
    demo_video_url: it.demoVideoUrl ?? null,
    cross_sell: it.crossSell ?? null,
    en: it.en ?? null,
    coming_soon: !!it.comingSoon,
    coming_soon_phase: it.comingSoonPhase ?? null,
    is_active: true,             // statische Registry = aktueller Live-Katalog
    source: 'static-seed',
  };
}

// Dedupe by slug (script-factory taucht 2× auf: dfy + saas). Letzter gewinnt;
// für die Liste reicht ein slug-Eintrag, Detail-Page unterscheidet via type-Param.
const rowsBySlug = new Map();
for (const it of Object.values(SHOP_ITEMS)) {
  if (!it || !it.slug) continue;
  rowsBySlug.set(it.slug, toRow(it));
}
const rows = [...rowsBySlug.values()];
console.log(`[seed] ${rows.length} eindeutige Produkte aus Registry`);

if (DRY) {
  console.log(JSON.stringify(rows.map((r) => ({ slug: r.slug, type: r.type, active: r.is_active, coming_soon: r.coming_soon, price: r.price, stripe: !!r.stripe_price_id })), null, 2));
  console.log('[seed] DRY — kein Schreiben');
  process.exit(0);
}

// 3) Upsert (merge-duplicates on slug)
const res = await fetch(`${SUPABASE_URL}/rest/v1/shop_products?on_conflict=slug`, {
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error(`[seed] UPSERT FEHLER ${res.status}: ${(await res.text()).slice(0, 500)}`);
  process.exit(1);
}
console.log(`[seed] OK — ${rows.length} Produkte upserted (is_active=true, source=static-seed)`);
