// /api/dashboard/* — admin-token gated stats endpoints.
//
// Mirrors the per-project dashboard payload but accessible without
// customer JWT. Used by AEVUMDashboard.tsx (admin) and operational tooling.
// Auth: x-aevum-admin-token header (matches accounts.js pattern).
//
// Endpoints:
//   GET /api/dashboard/shop-stats     → buildShopStats()
//   GET /api/dashboard/stripe-stats   → buildStripeStats()
//   GET /api/dashboard/orders-stats   → buildOrdersStats()
//   GET /api/dashboard/all            → all three combined in one payload

import { Router } from 'express';
import { buildShopStats, buildStripeStats, buildOrdersStats } from '../lib/dashboard-stats.js';

export const dashboardStatsRouter = Router();

function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token') || req.get('X-Admin-Token');
  const expected = process.env.AEVUM_ADMIN_TOKEN || process.env.ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || tok !== expected) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

dashboardStatsRouter.use(requireAdmin);

dashboardStatsRouter.get('/shop-stats', async (_req, res) => {
  try {
    const shop = await buildShopStats();
    res.json({ ok: true, shop, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[dashboard-stats] shop fail:', err.message);
    res.status(500).json({ ok: false, error: 'shop_stats_failed' });
  }
});

dashboardStatsRouter.get('/stripe-stats', async (_req, res) => {
  try {
    const stripe = await buildStripeStats();
    res.json({ ok: true, stripe, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[dashboard-stats] stripe fail:', err.message);
    res.status(500).json({ ok: false, error: 'stripe_stats_failed' });
  }
});

dashboardStatsRouter.get('/orders-stats', async (_req, res) => {
  try {
    const orders = await buildOrdersStats();
    res.json({ ok: true, orders, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[dashboard-stats] orders fail:', err.message);
    res.status(500).json({ ok: false, error: 'orders_stats_failed' });
  }
});

dashboardStatsRouter.get('/all', async (_req, res) => {
  try {
    const [shop, stripe, orders] = await Promise.all([
      buildShopStats().catch(e => { console.error('[shop] ', e.message); return null; }),
      buildStripeStats().catch(e => { console.error('[stripe] ', e.message); return null; }),
      buildOrdersStats().catch(e => { console.error('[orders] ', e.message); return null; }),
    ]);
    res.json({ ok: true, shop, stripe, orders, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[dashboard-stats] all fail:', err.message);
    res.status(500).json({ ok: false, error: 'dashboard_stats_failed' });
  }
});
