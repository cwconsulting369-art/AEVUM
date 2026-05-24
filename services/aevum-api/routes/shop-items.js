// Shop-Items — public read of live build-status for shop detail-pages.
// GET /api/shop-items/:slug → { ok, item: BuildStatus | null }
//
// Frontend (apps/web/src/components/shop/ShopItemDetail.tsx) merges this with
// static content from data/shop-items/index.ts.
//
// Created: 2026-05-24 (Wave-B review — endpoint was referenced by frontend but missing)

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const shopItemsRouter = Router();

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

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
