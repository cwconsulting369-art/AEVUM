// AEVUM-API client with auto-refresh
// API base: VITE_AEVUM_API_BASE_URL (default: https://api.aevum-system.de)

const API_BASE = import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';
const ACCESS_KEY = 'aevum_access_token';
const REFRESH_KEY = 'aevum_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    });
    const data = await res.json();
    if (data.ok && data.access_token) {
      setTokens(data.access_token);
      return data.access_token;
    }
  } catch (e) {
    console.error('refresh failed', e);
  }
  return null;
}

type ApiOptions = RequestInit & { authRequired?: boolean };

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { authRequired = true, headers, ...rest } = opts;
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...(headers as Record<string, string> | undefined) };
  if (authRequired) {
    const token = getAccessToken();
    if (token) baseHeaders['Authorization'] = `Bearer ${token}`;
  }
  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers: baseHeaders });
  // Auto-refresh on 401
  if (res.status === 401 && authRequired) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      baseHeaders['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: baseHeaders });
    }
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// Auth helpers
export async function requestMagicLink(email: string, purpose: 'login' | 'invite' = 'login') {
  return api<{ ok: boolean; sent: boolean }>('/api/auth/magic-link/request', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
    authRequired: false
  });
}

export async function verifyMagicLink(token: string) {
  const data = await api<{
    ok: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    account: { id: string; slug: string; name: string; email: string };
  }>('/api/auth/magic-link/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
    authRequired: false
  });
  if (data.ok) setTokens(data.access_token, data.refresh_token);
  return data;
}
