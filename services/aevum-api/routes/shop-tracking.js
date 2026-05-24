// Shop-tracking — Shopify-style page-view + funnel event capture
// Public, no-auth. Fire-and-forget from apps/web.
// All IPs anonymized; payload schema enforced via Zod.

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { anonymizeIp, clean, scanPayload } from '../lib/security.js';
import { logBlock } from '../lib/monitor.js';

export const shopTrackingRouter = Router();

const EVENT_TYPES = [
  'page_view',
  'checkout_start',
  'checkout_complete',
  'checkout_abandon',
  'addtocart',
  'shop_open',
  'audit_start',
  'audit_submit',
];

const TrackSchema = z.object({
  session_id: z.string().min(8).max(64),
  event_type: z.enum(EVENT_TYPES),
  path: z.string().max(500).optional().nullable(),
  referrer: z.string().max(1000).optional().nullable(),
  utm_source: z.string().max(120).optional().nullable(),
  utm_medium: z.string().max(120).optional().nullable(),
  utm_campaign: z.string().max(120).optional().nullable(),
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional().nullable(),
  package_tier: z.string().max(80).optional().nullable(),
  value_cents: z.number().int().min(0).max(100000000).optional().nullable(),
  meta: z.record(z.any()).optional().default({}),
});

function clientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    'unknown'
  );
}

// POST /api/shop/track — fire-and-forget tracking
shopTrackingRouter.post('/track', async (req, res) => {
  // Always answer fast (204 even on validation fail) so tracking never breaks frontend
  const ip = clientIp(req);
  const ctx = { ip, user_agent: req.get('user-agent') || '', endpoint: 'POST /api/shop/track' };

  const parsed = TrackSchema.safeParse(req.body);
  if (!parsed.success) {
    logBlock({ ...ctx, type: 'shop_track_invalid', reason: JSON.stringify(parsed.error.flatten().fieldErrors).slice(0, 200) });
    return res.status(204).end();
  }
  const f = parsed.data;

  // Strip any attempted injection in free-text fields. Block hard on attacks.
  const attackHits = scanPayload({
    path: f.path || '',
    referrer: f.referrer || '',
    utm_source: f.utm_source || '',
    utm_medium: f.utm_medium || '',
    utm_campaign: f.utm_campaign || '',
    package_tier: f.package_tier || '',
  });
  if (attackHits.length > 0) {
    logBlock({ ...ctx, type: 'shop_track_attack', reason: attackHits.map(h => `${h.field}:${h.reason}`).join('; ') });
    return res.status(204).end();
  }

  const row = {
    session_id: clean(f.session_id),
    event_type: f.event_type,
    path: f.path ? clean(f.path).slice(0, 500) : null,
    referrer: f.referrer ? clean(f.referrer).slice(0, 1000) : null,
    utm_source: f.utm_source ? clean(f.utm_source).slice(0, 120) : null,
    utm_medium: f.utm_medium ? clean(f.utm_medium).slice(0, 120) : null,
    utm_campaign: f.utm_campaign ? clean(f.utm_campaign).slice(0, 120) : null,
    device_type: f.device_type ?? null,
    country: req.headers['cf-ipcountry'] || null,
    package_tier: f.package_tier ? clean(f.package_tier).slice(0, 80) : null,
    value_cents: typeof f.value_cents === 'number' ? f.value_cents : null,
    ip_anonymized: anonymizeIp(ip),
    meta: f.meta && typeof f.meta === 'object' ? f.meta : {},
  };

  // Fire-and-forget insert. We answer 204 immediately.
  supabase.insert('shop_events', row).catch((err) => {
    console.error('[shop-track] insert fail:', err?.message || err);
  });
  return res.status(204).end();
});

// GET /api/shop/stats?days=7 — internal helper for debugging (admin-token gated upstream by router mount)
shopTrackingRouter.get('/stats', async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days || '7', 10)));
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const r = await supabase.select(
    'shop_events',
    `select=event_type&created_at=gte.${since}`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  const counts = {};
  (r.data || []).forEach((e) => {
    counts[e.event_type] = (counts[e.event_type] || 0) + 1;
  });
  res.json({ ok: true, days, total: r.data?.length || 0, by_event: counts });
});
