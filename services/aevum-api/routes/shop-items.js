// Shop-Items API.
//
// /catalog  → volle Produktliste aus shop_products (SSOT, dynamisch). NEU 2026-05-31.
// /:slug    → live build-status (gate_passed, Downloads) für Detail-Pages.
// /         → build-status-Liste (legacy).
//
// shop_products ist seit 2026-05-31 die EINE Wahrheit für verkaufbaren Content.
// Der Shop rendert die Liste aus /catalog. `sellable` ist die Anti-Scheintechnik-
// Wahrheit: kaufbar nur wenn aktiv + nicht coming-soon + Stripe-Price real verifiziert.

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const shopItemsRouter = Router();

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

function rowToContent(p, gateBySlug) {
  const sellable =
    p.is_active === true &&
    p.coming_soon !== true &&
    p.stripe_price_verified === true &&
    !!p.stripe_price_id;
  return {
    slug: p.slug,
    name: p.name,
    type: p.type,
    tag: p.tag ?? undefined,
    priceLabel: p.price_label ?? undefined,
    price: p.price ?? undefined,
    stripePriceId: p.stripe_price_id ?? undefined,
    stripePriceVerified: p.stripe_price_verified === true,
    securityLevel: p.security_level ?? 'business',
    icp: Array.isArray(p.icp) ? p.icp : [],
    category: p.category ?? undefined,
    tagline: p.tagline ?? '',
    whatIsIt: p.what_is_it ?? '',
    outcomes: p.outcomes ?? [],
    whenItFits: p.when_it_fits ?? { fits: [], requires: [] },
    includes: p.includes ?? [],
    pricingNote: p.pricing_note ?? undefined,
    securityNote: p.security_note ?? undefined,
    faq: p.faq ?? [],
    demoVideoUrl: p.demo_video_url ?? undefined,
    crossSell: p.cross_sell ?? undefined,
    en: p.en ?? undefined,
    comingSoon: p.coming_soon === true,
    comingSoonPhase: p.coming_soon_phase ?? undefined,
    source: p.source,
    gatePassed: gateBySlug.get(p.slug) === true,
    sellable,
  };
}

// WICHTIG: /catalog VOR /:slug — sonst fängt der slug-Handler "catalog" ab.
shopItemsRouter.get('/catalog', async (_req, res) => {
  const r = await supabase.select(
    'shop_products',
    `select=*&is_active=eq.true&order=type.asc,slug.asc`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: 'catalog_lookup_failed' });

  const gate = await supabase.select(
    'shop_item_build_status',
    `select=item_slug,gate_passed`
  );
  const gateBySlug = new Map();
  if (gate.ok && Array.isArray(gate.data)) {
    for (const g of gate.data) gateBySlug.set(g.item_slug, g.gate_passed === true);
  }

  const items = (r.data || []).map((p) => rowToContent(p, gateBySlug));
  return res.json({ ok: true, items });
});

shopItemsRouter.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  if (!SLUG_RE.test(slug)) {
    return res.status(400).json({ ok: false, error: 'invalid_slug' });
  }

  const r = await supabase.select(
    'shop_item_build_status',
    `item_slug=eq.${encodeURIComponent(slug)}&select=item_slug,item_type,gate_passed,gate_passed_at,n8n_export_url,pdf_url,demo_video_url,last_build_run&limit=1`
  );

  if (!r.ok) {
    return res.status(500).json({ ok: false, error: 'lookup_failed' });
  }

  const row = Array.isArray(r.data) && r.data.length > 0 ? r.data[0] : null;
  return res.json({ ok: true, item: row });
});

shopItemsRouter.get('/', async (_req, res) => {
  const r = await supabase.select(
    'shop_item_build_status',
    `select=item_slug,item_type,gate_passed,gate_passed_at,last_build_run`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: 'lookup_failed' });
  return res.json({ ok: true, items: r.data || [] });
});
