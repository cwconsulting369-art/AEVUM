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
