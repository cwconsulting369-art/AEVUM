// Shop-tracking — Shopify-style fire-and-forget analytics.
// All requests go to /api/shop/track via backend (which anonymizes IP + writes shop_events).

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';
const SESSION_KEY = 'aevum_sid';

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto && (crypto as Crypto).randomUUID)
          ? (crypto as Crypto).randomUUID()
          : 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked → fall back to in-memory id per page (still better than nothing)
    return 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth || 1024;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function readUtm(): Pick<TrackPayload, 'utm_source' | 'utm_medium' | 'utm_campaign'> {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null,
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}

type EventType =
  | 'page_view'
  | 'checkout_start'
  | 'checkout_complete'
  | 'checkout_abandon'
  | 'addtocart'
  | 'shop_open'
  | 'audit_start'
  | 'audit_submit';

interface TrackPayload {
  session_id: string;
  event_type: EventType;
  path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop';
  package_tier?: string | null;
  value_cents?: number | null;
  meta?: Record<string, unknown>;
}

interface ExtraData {
  package_tier?: string;
  value_cents?: number;
  meta?: Record<string, unknown>;
}

export function track(event_type: EventType, data: ExtraData = {}): void {
  try {
    const payload: TrackPayload = {
      session_id: getSessionId(),
      event_type,
      path: (window.location.hash || window.location.pathname || '/').replace(/^#/, ''),
      referrer: document.referrer || null,
      ...readUtm(),
      device_type: detectDevice(),
      package_tier: data.package_tier ?? null,
      value_cents: data.value_cents ?? null,
      meta: data.meta ?? {},
    };

    // keepalive ensures the request survives page-unload (Stripe redirect)
    fetch(`${API_BASE}/api/shop/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* silent — never block UX on tracking */
    });
  } catch {
    /* swallow */
  }
}

// Convenience for SPAs — call once on mount, also on every hash-route change
export function installPageViewTracker(): () => void {
  const fire = () => track('page_view');
  fire();
  const onHash = () => fire();
  window.addEventListener('hashchange', onHash);
  return () => window.removeEventListener('hashchange', onHash);
}
