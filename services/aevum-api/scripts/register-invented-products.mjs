#!/usr/bin/env node
/**
 * register-invented-products — bringt vom Produkt-Erfinder-Loop erzeugte Produkte
 * EHRLICH in shop_products (= SSOT), als sichtbare "in Vorbereitung"-Cards.
 *
 * Anti-Scheintechnik-Prinzip:
 *   - is_active=true + coming_soon=true → gedimmte, ehrliche Coming-Soon-Card
 *     (matcht Carlos-Regel "Coming-Soon-Stubs sichtbar"), NICHT kaufbar.
 *   - KEINE erfundenen Outcomes/Preise. Name + Tagline werden faktisch aus dem
 *     blueprints/<slug>/README.md gezogen (H1 + Beschreibungs-Blockquote).
 *   - Wird ein Produkt später real fertig (Content + echte Stripe-Price + verify),
 *     setzt man coming_soon=false → es wird kaufbar. Bis dahin: ehrlich "in Arbeit".
 *
 * Zwei Modi:
 *   node register-invented-products.mjs            # Backfill: alle gebauten, noch
 *                                                  # nicht registrierten Produkte
 *   node register-invented-products.mjs <slug> [type]   # Einzeln (vom Loop genutzt)
 *
 * ENV: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../../..');
const BLUEPRINTS_DIR = path.join(REPO, 'blueprints');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen');
  process.exit(1);
}

// Slug-Drift-Aliase (muss mit scheintechnik-guard ALIASES synchron sein)
const ALIASES = {
  'lead-qualifier': 'lead-qualifier-pro',
  'newsletter-machine': 'newsletter-growth-machine',
  'reporting-dashboard': 'reporting-dashboard-setup',
};
const canon = (s) => ALIASES[s] || s;

const sbH = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
async function sb(table, qs) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: sbH });
  if (!r.ok) throw new Error(`${table} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

function titleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Ehrliche Metadaten aus README ziehen (kein Erfinden)
function metaFromBlueprint(slug) {
  const readme = path.join(BLUEPRINTS_DIR, slug, 'README.md');
  let name = titleCase(slug);
  let tagline = 'Wird gerade gebaut + getestet. Details folgen nach dem Quality-Gate.';
  if (fs.existsSync(readme)) {
    const txt = fs.readFileSync(readme, 'utf8');
    const h1 = txt.match(/^#\s+(.+)$/m);
    if (h1) name = h1[1].replace(/^AEVUM Blueprint:\s*/i, '').trim();
    const bq = txt.match(/^>\s+(.+)$/m);
    if (bq) tagline = bq[1].trim();
  }
  return { name, tagline };
}

async function registerOne(slug, type) {
  const target = canon(slug);
  if (target !== slug) {
    console.log(`[register] ${slug} → Alias auf ${target} (bereits kuratiert), übersprungen`);
    return { skipped: true };
  }
  const existing = await sb('shop_products', `slug=eq.${encodeURIComponent(slug)}&select=slug,coming_soon`);
  if (existing.length) {
    console.log(`[register] ${slug} bereits in shop_products — unverändert`);
    return { existed: true };
  }
  const { name, tagline } = metaFromBlueprint(slug);
  const row = {
    slug,
    name,
    type: type || 'blueprint',
    tagline,
    category: 'Automatisierung',  // generischer Bucket bis kuratiert
    is_active: true,        // sichtbar …
    coming_soon: true,      // … aber als ehrliche "in Vorbereitung"-Card, NICHT kaufbar
    coming_soon_phase: 'In Vorbereitung',
    source: 'product-inventor-loop',
    // bewusst KEIN price / stripe_price_id → nicht kaufbar, kein Fake
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/shop_products?on_conflict=slug`, {
    method: 'POST',
    headers: { ...sbH, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`upsert ${slug} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  console.log(`[register] ✓ ${slug} → coming_soon (name="${name}")`);
  return { registered: true };
}

// ── Single-Mode ───────────────────────────────────────────────
const argSlug = process.argv[2];
if (argSlug) {
  await registerOne(argSlug.toLowerCase(), process.argv[3]);
  process.exit(0);
}

// ── Backfill-Mode ─────────────────────────────────────────────
const inShop = new Set((await sb('shop_products', 'select=slug')).map((p) => p.slug));
const gate = await sb('shop_item_build_status', 'select=item_slug,item_type,gate_passed&gate_passed=eq.true');

// Kandidaten: gate_passed build-status + blueprint-Ordner, jeweils canon-gemappt
const candidates = new Map(); // canonSlug -> type
for (const g of gate) {
  const c = canon(g.item_slug);
  if (!inShop.has(c)) candidates.set(c, g.item_type || 'blueprint');
}
if (fs.existsSync(BLUEPRINTS_DIR)) {
  for (const d of fs.readdirSync(BLUEPRINTS_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const c = canon(d.name);
    if (!inShop.has(c) && !candidates.has(c)) candidates.set(c, 'blueprint');
  }
}

console.log(`[register] Backfill: ${candidates.size} nicht-registrierte gebaute Produkte`);
let n = 0;
for (const [slug, type] of candidates) {
  const r = await registerOne(slug, type);
  if (r.registered) n++;
}
console.log(`[register] fertig — ${n} neu als coming_soon registriert`);
