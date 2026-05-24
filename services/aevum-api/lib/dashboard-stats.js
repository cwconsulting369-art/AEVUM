// Dashboard stats builders — shared between /api/me (customer-auth) and
// /api/dashboard (admin-token gated). Single source of truth for the
// aggregations rendered in AEVUMDashboard.tsx.
//
// No PII in returns: customer emails are masked to first-char + domain.

import { supabase } from './supabase.js';
import { stripe } from './stripe.js';

export async function buildShopStats() {
  const now = Date.now();
  const dayMs = 86400000;
  const todayIso = new Date(now - dayMs).toISOString();
  const weekIso = new Date(now - 7 * dayMs).toISOString();
  const prevWeekStartIso = new Date(now - 14 * dayMs).toISOString();
  const monthIso = new Date(now - 30 * dayMs).toISOString();

  const r = await supabase.select(
    'shop_events',
    `select=created_at,event_type,session_id,device_type,package_tier,value_cents,path&created_at=gte.${monthIso}&order=created_at.desc&limit=10000`
  );
  const events = Array.isArray(r.data) ? r.data : [];

  const trafficEvents = events.filter(e => e.event_type === 'page_view' || e.event_type === 'shop_open');
  const sessionsIn = (sinceIso) => {
    const set = new Set();
    for (const e of trafficEvents) {
      if (e.created_at >= sinceIso) set.add(e.session_id);
    }
    return set.size;
  };
  const todaySessions = sessionsIn(todayIso);
  const weekSessions = sessionsIn(weekIso);
  const monthSessions = sessionsIn(monthIso);

  const prevWeekSessions = (() => {
    const set = new Set();
    for (const e of trafficEvents) {
      if (e.created_at >= prevWeekStartIso && e.created_at < weekIso) set.add(e.session_id);
    }
    return set.size;
  })();
  const vsPrevWeekPct = prevWeekSessions > 0
    ? Math.round(((weekSessions - prevWeekSessions) / prevWeekSessions) * 1000) / 10
    : null;

  // Daily traffic chart (last 7d, page_view+shop_open unique sessions)
  const dayKey = (iso) => iso.slice(0, 10);
  const dailyMap = {};
  for (const e of trafficEvents) {
    if (e.created_at < weekIso) continue;
    const k = dayKey(e.created_at);
    if (!dailyMap[k]) dailyMap[k] = new Set();
    dailyMap[k].add(e.session_id);
  }
  // Backfill missing days as 0
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const k = new Date(now - i * dayMs).toISOString().slice(0, 10);
    daily.push({ day: k, sessions: dailyMap[k]?.size || 0 });
  }

  // Funnel — unique sessions per step
  const sessionsByEvent = {};
  for (const e of events) {
    sessionsByEvent[e.event_type] = sessionsByEvent[e.event_type] || new Set();
    sessionsByEvent[e.event_type].add(e.session_id);
  }
  const fn = (k) => (sessionsByEvent[k]?.size || 0);
  const pageViewSessions = fn('page_view');
  const shopOpenSessions = fn('shop_open');
  const checkoutStart = fn('checkout_start');
  const checkoutComplete = fn('checkout_complete');
  const checkoutAbandon = fn('checkout_abandon');
  const auditStart = fn('audit_start');
  const auditSubmit = fn('audit_submit');
  const conversionRate = pageViewSessions > 0
    ? Math.round((checkoutComplete / pageViewSessions) * 10000) / 100
    : null;

  // Top pages (by views, last 7d)
  const pathCounts = {};
  for (const e of trafficEvents) {
    if (e.created_at < weekIso || !e.path) continue;
    pathCounts[e.path] = (pathCounts[e.path] || 0) + 1;
  }
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, views]) => ({ path, views }));

  // Device split (last 7d)
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  const deviceSessionMap = {};
  for (const e of trafficEvents) {
    if (e.created_at < weekIso || !e.device_type) continue;
    if (deviceSessionMap[e.session_id]) continue;
    deviceSessionMap[e.session_id] = e.device_type;
    if (deviceCounts[e.device_type] !== undefined) deviceCounts[e.device_type]++;
  }
  const totalDev = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet;
  const byDevice = totalDev > 0
    ? {
        mobile: Math.round((deviceCounts.mobile / totalDev) * 100),
        desktop: Math.round((deviceCounts.desktop / totalDev) * 100),
        tablet: Math.round((deviceCounts.tablet / totalDev) * 100),
      }
    : { mobile: 0, desktop: 0, tablet: 0 };

  // Top packages from completed checkouts (last 30d)
  const tierCounts = {};
  const tierValue = {};
  for (const e of events) {
    if (e.event_type !== 'checkout_complete' || !e.package_tier) continue;
    tierCounts[e.package_tier] = (tierCounts[e.package_tier] || 0) + 1;
    tierValue[e.package_tier] = (tierValue[e.package_tier] || 0) + (e.value_cents || 0);
  }
  const topPackages = Object.entries(tierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tier, count]) => ({ tier, count, total_cents: tierValue[tier] || 0 }));

  // Abandoned — sessions that started checkout but never completed (last 7d)
  const startSessions = new Set();
  const completeSessions = new Set();
  const startMeta = {};
  for (const e of events) {
    if (e.created_at < weekIso) continue;
    if (e.event_type === 'checkout_start') {
      startSessions.add(e.session_id);
      startMeta[e.session_id] = {
        last_path: e.path,
        package_tier: e.package_tier,
        value_cents: e.value_cents,
        at: e.created_at,
      };
    } else if (e.event_type === 'checkout_complete') {
      completeSessions.add(e.session_id);
    }
  }
  const abandoned = [...startSessions]
    .filter(s => !completeSessions.has(s))
    .slice(0, 20)
    .map(s => ({
      session_id: s.slice(0, 8),
      last_path: startMeta[s]?.last_path,
      package_tier: startMeta[s]?.package_tier,
      value_cents: startMeta[s]?.value_cents,
      time_ago_min: Math.round((now - new Date(startMeta[s]?.at).getTime()) / 60000),
    }));

  return {
    traffic: {
      today: todaySessions,
      week: weekSessions,
      month: monthSessions,
      vs_prev_week_pct: vsPrevWeekPct,
      daily,
    },
    funnel: {
      page_view: pageViewSessions,
      shop_open: shopOpenSessions,
      checkout_start: checkoutStart,
      checkout_complete: checkoutComplete,
      checkout_abandon: checkoutAbandon,
      audit_start: auditStart,
      audit_submit: auditSubmit,
      conversion_rate: conversionRate,
    },
    abandoned,
    top_packages: topPackages,
    top_pages: topPages,
    by_device: byDevice,
    total_events_30d: events.length,
  };
}

export async function buildStripeStats() {
  if (!stripe) {
    return {
      configured: false,
      revenue_today_cents: 0,
      revenue_7d_cents: 0,
      revenue_30d_cents: 0,
      revenue_lifetime_cents: 0,
      mrr_cents: 0,
      active_subscriptions: 0,
      refund_total_cents: 0,
      refund_7d_cents: 0,
      recent_charges: [],
      abandoned_sessions: [],
      note: 'Stripe nicht konfiguriert (STRIPE_SECRET_KEY fehlt)',
    };
  }
  const out = {
    configured: true,
    revenue_today_cents: 0,
    revenue_7d_cents: 0,
    revenue_30d_cents: 0,
    revenue_lifetime_cents: 0,
    mrr_cents: 0,
    active_subscriptions: 0,
    refund_total_cents: 0,
    refund_7d_cents: 0,
    recent_charges: [],
    abandoned_sessions: [],
  };
  const dayMs = 86400000;
  const nowSec = Math.floor(Date.now() / 1000);
  const today = nowSec - dayMs / 1000;
  const sevenDaysAgo = nowSec - 7 * dayMs / 1000;
  const thirtyDaysAgo = nowSec - 30 * dayMs / 1000;

  const maskEmail = (e) => {
    if (!e) return null;
    return e.replace(/^(.).+(@.+)$/, '$1***$2');
  };

  try {
    const charges = await stripe.charges.list({ limit: 100, created: { gte: thirtyDaysAgo } });
    const successful = (charges.data || []).filter(c => c.paid && !c.refunded);
    out.recent_charges = (charges.data || []).slice(0, 10).map(c => ({
      id: c.id.slice(0, 18) + '…',
      amount: c.amount,
      currency: c.currency,
      status: c.status,
      paid: c.paid,
      refunded: c.refunded,
      created: c.created,
      customer_email: maskEmail(c.billing_details?.email),
      description: c.description || null,
    }));
    out.revenue_30d_cents = successful.reduce((s, c) => s + (c.amount || 0), 0);
    out.revenue_7d_cents = successful
      .filter(c => c.created >= sevenDaysAgo)
      .reduce((s, c) => s + (c.amount || 0), 0);
    out.revenue_today_cents = successful
      .filter(c => c.created >= today)
      .reduce((s, c) => s + (c.amount || 0), 0);
  } catch (e) {
    console.error('[dashboard-stats] charges fail:', e.message);
  }

  // Lifetime revenue — separate paged call without date filter
  try {
    const lifetime = await stripe.charges.list({ limit: 100 });
    out.revenue_lifetime_cents = (lifetime.data || [])
      .filter(c => c.paid && !c.refunded)
      .reduce((s, c) => s + (c.amount || 0), 0);
  } catch (e) {
    console.error('[dashboard-stats] lifetime fail:', e.message);
  }

  try {
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    out.active_subscriptions = subs.data?.length || 0;
    out.mrr_cents = (subs.data || []).reduce((s, sub) => {
      const items = sub.items?.data || [];
      let monthly = 0;
      for (const item of items) {
        const price = item.price;
        if (!price) continue;
        const amt = price.unit_amount || 0;
        const qty = item.quantity || 1;
        const interval = price.recurring?.interval;
        const count = price.recurring?.interval_count || 1;
        let monthlyAmt = amt * qty;
        if (interval === 'year') monthlyAmt = monthlyAmt / (12 * count);
        else if (interval === 'week') monthlyAmt = monthlyAmt * (4 / count);
        else if (interval === 'day') monthlyAmt = monthlyAmt * (30 / count);
        else monthlyAmt = monthlyAmt / count;
        monthly += monthlyAmt;
      }
      return s + Math.round(monthly);
    }, 0);
  } catch (e) {
    console.error('[dashboard-stats] subscriptions fail:', e.message);
  }

  try {
    const refunds = await stripe.refunds.list({ limit: 100, created: { gte: thirtyDaysAgo } });
    out.refund_total_cents = (refunds.data || []).reduce((s, r) => s + (r.amount || 0), 0);
    out.refund_7d_cents = (refunds.data || [])
      .filter(r => r.created >= sevenDaysAgo)
      .reduce((s, r) => s + (r.amount || 0), 0);
  } catch (e) {
    console.error('[dashboard-stats] refunds fail:', e.message);
  }

  try {
    const open = await stripe.checkout.sessions.list({ status: 'open', limit: 30 });
    const expired = await stripe.checkout.sessions.list({ status: 'expired', limit: 20 });
    const all = [...(open.data || []), ...(expired.data || [])];
    out.abandoned_sessions = all
      .filter(s => s.payment_status !== 'paid')
      .slice(0, 25)
      .map(s => ({
        id: s.id.slice(0, 18) + '…',
        amount_total: s.amount_total,
        currency: s.currency,
        expires_at: s.expires_at,
        status: s.status,
        customer_email: maskEmail(s.customer_details?.email || s.customer_email),
        tier: s.metadata?.tier || s.metadata?.product_id || null,
        created: s.created,
      }));
  } catch (e) {
    console.error('[dashboard-stats] sessions fail:', e.message);
  }

  return out;
}

export async function buildOrdersStats() {
  const r = await supabase.select(
    'orders',
    `select=status,package_tier,total_cents,paid_at,created_at,customer_email&order=created_at.desc&limit=500`
  );
  const rows = Array.isArray(r.data) ? r.data : [];
  const byStatus = {};
  const byTier = {};
  let paidTotal = 0;
  let pending = 0;
  for (const o of rows) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === 'paid') {
      paidTotal += (o.total_cents || 0);
      byTier[o.package_tier] = (byTier[o.package_tier] || 0) + 1;
    }
    if (o.status === 'pending') pending++;
  }
  return {
    total_orders: rows.length,
    by_status: byStatus,
    by_tier: byTier,
    paid_total_cents: paidTotal,
    pending_count: pending,
    recent: rows.slice(0, 10).map(o => ({
      status: o.status,
      package_tier: o.package_tier,
      total_cents: o.total_cents,
      paid_at: o.paid_at,
      created_at: o.created_at,
      customer_email: (o.customer_email || '').replace(/^(.).+(@.+)$/, '$1***$2'),
    })),
  };
}
