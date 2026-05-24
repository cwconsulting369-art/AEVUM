// Payments-Paused Middleware — globaler Stripe-Stop wenn app_settings.payments_paused=true
// Carlos 2026-05-24: "die ganzen saas dinger müssen wir erstmal daten sammeln. einfach mal die stripe weiterleitung komplett überall beenden und einen screen machen in wartung"
import { supabase } from './supabase.js';

let cache = { value: null, fetchedAt: 0 };
const TTL_MS = 30_000; // 30 sec cache

export async function isPaymentsPaused() {
  if (cache.value !== null && Date.now() - cache.fetchedAt < TTL_MS) return cache.value;
  try {
    const { data } = await supabase.select('app_settings', `?key=eq.payments_paused&select=value&limit=1`);
    const paused = data?.[0]?.value === true || data?.[0]?.value === 'true';
    cache = { value: paused, fetchedAt: Date.now() };
    return paused;
  } catch {
    return false; // fail-open
  }
}

export async function getPausedMessage() {
  try {
    const { data } = await supabase.select('app_settings', `?key=eq.payments_paused_message&select=value&limit=1`);
    return data?.[0]?.value || 'AEVUM ist gerade in Vorbereitung.';
  } catch {
    return 'AEVUM ist gerade in Vorbereitung.';
  }
}

export async function paymentsPausedGuard(req, res, next) {
  const paused = await isPaymentsPaused();
  if (paused) {
    const msg = await getPausedMessage();
    return res.status(503).json({
      ok: false,
      error: 'payments_paused',
      message: msg,
      retry_after: '24h'
    });
  }
  next();
}
