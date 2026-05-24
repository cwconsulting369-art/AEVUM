/* ──────────────────────── AEVUM API Client ──────────────────────── */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';

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
