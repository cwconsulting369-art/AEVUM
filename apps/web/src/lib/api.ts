/* ──────────────────────── AEVUM API Client ──────────────────────── */

import { getCachedAevumConfig, prefetchAevumConfig } from '@/hooks/use-config';
import { openMaintenanceModal } from './maintenance-bus';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';

/**
 * Maintenance-Gate — wenn payments_paused=true, ÖFFNE Maintenance-Modal
 * statt Stripe-Checkout. Throws PaymentsPausedError damit Caller den
 * Loading-Spinner stoppen kann ohne weiteres Handling zu brauchen.
 *
 * Backend short-circuit gibt es auch (HTTP 503 mit error=payments_paused),
 * aber wir gaten frontend-seitig damit wir den Modal-UX zeigen.
 */
export class PaymentsPausedError extends Error {
  readonly code = 'payments_paused';
  constructor(public readonly message: string = 'Käufe pausiert — Wartungsmodus') {
    super(message);
    this.name = 'PaymentsPausedError';
  }
}

interface GateOpts {
  interest?: string;
  source?: string;
}

/** Returns true wenn der Caller weitermachen darf, false wenn er stoppen muss. */
async function checkoutGate(opts: GateOpts = {}): Promise<boolean> {
  // Prefer cached config; if missing, fetch once
  let cfg = getCachedAevumConfig();
  if (!cfg) {
    cfg = await prefetchAevumConfig();
  }
  if (cfg?.payments_paused) {
    openMaintenanceModal({
      interest: opts.interest,
      source: opts.source ?? 'checkout-gate',
      message: cfg.payments_paused_message || undefined,
    });
    return false;
  }
  return true;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/* ──────────────────────── Blueprint Checkout ──────────────────────── */

export interface CreateCheckoutParams {
  product_id: string;
  stripe_price_id: string;
  mode: 'payment' | 'subscription';
  metadata?: Record<string, string>;
  success_url: string;
  cancel_url: string;
  account_id?: string;
}

export interface CreateCheckoutResponse {
  url: string;
  session_id?: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResponse> {
  const ok = await checkoutGate({
    interest: params.metadata?.blueprint_slug ?? params.product_id,
    source: `shop:${params.product_id}`,
  });
  if (!ok) throw new PaymentsPausedError();
  return api<CreateCheckoutResponse>('/api/checkout/blueprint', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/* ──────────────────────── SaaS Credit-Purchase (Self-Service Signup) ──────────────────────── */

export interface CreditPurchaseParams {
  email: string;
  name?: string;
  package_slug: 'starter' | 'growth' | 'pro';
  tool_slug?: string;
  source: string;
  consent?: boolean;
}

export interface CreditPurchaseResponse {
  ok: boolean;
  url: string;
  error?: string;
}

export async function createCreditPurchaseSession(
  params: CreditPurchaseParams
): Promise<CreditPurchaseResponse> {
  const ok = await checkoutGate({
    interest: params.tool_slug ?? params.package_slug,
    source: `saas:${params.tool_slug ?? 'credits'}`,
  });
  if (!ok) throw new PaymentsPausedError();
  return api<CreditPurchaseResponse>('/api/checkout/credit-purchase', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/* ──────────────────────── Subscription (Wave I4) ──────────────────────── */

export interface SubscriptionPlan {
  slug: 'starter' | 'growth' | 'pro';
  name: string;
  price_eur: string;            // numeric returned as string
  credits_per_month: number;
  features: string[];
  sort_order: number;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const r = await api<{ ok: boolean; plans: SubscriptionPlan[] }>('/api/checkout/subscription-plans');
  return r.plans || [];
}

export interface SubscribeParams {
  plan_slug: 'starter' | 'growth' | 'pro';
  email: string;
  name?: string;
  source?: string;
}

export interface SubscribeResponse {
  ok: boolean;
  url: string;
  error?: string;
}

export async function createSubscriptionSession(
  params: SubscribeParams
): Promise<SubscribeResponse> {
  const ok = await checkoutGate({
    interest: `subscription:${params.plan_slug}`,
    source: params.source ?? `subscription:${params.plan_slug}`,
  });
  if (!ok) throw new PaymentsPausedError();
  return api<SubscribeResponse>('/api/checkout/subscribe', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/* ──────────────────────── Google OAuth (Wave I4) ──────────────────────── */

/** Returns the absolute URL for Google-OAuth-Start. Frontend redirects to this. */
export function googleOAuthUrl(opts: { next?: string; source?: string } = {}): string {
  const params = new URLSearchParams();
  if (opts.next) params.set('next', opts.next);
  if (opts.source) params.set('source', opts.source);
  const qs = params.toString();
  return `${API_BASE}/api/auth/google${qs ? '?' + qs : ''}`;
}
