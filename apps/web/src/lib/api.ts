/* ──────────────────────── AEVUM API Client ──────────────────────── */

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.lennoxos.com';

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

/* ──────────────────────── Checkout ──────────────────────── */

export interface CreateCheckoutParams {
  product_id: string;
  price_cents: number;
  mode: 'payment' | 'subscription';
  metadata?: Record<string, string>;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutResponse {
  url: string;
  session_id?: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResponse> {
  return api<CreateCheckoutResponse>('/api/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
