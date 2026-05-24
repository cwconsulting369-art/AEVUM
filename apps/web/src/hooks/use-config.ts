/**
 * useAevumConfig — Frontend-Hook for /api/config
 *
 * Liest payments_paused-State + Message vom Backend. Cached 60s (module-scope) damit
 * Mount/Unmount keine Re-Fetches verursacht. Komponenten dürfen sich darauf verlassen
 * dass Buy/Subscribe-Buttons nur dann Stripe öffnen wenn config?.payments_paused === false.
 *
 * Backend: /home/carlos/restructure-workspace/aevum-phase/AEVUM/services/aevum-api/server.js (GET /api/config)
 * Backend-Lib: services/aevum-api/lib/payments-paused.js (isPaymentsPaused, getPausedMessage)
 *
 * Wave I7 — Maintenance-Mode Frontend (2026-05-24)
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';

export interface AevumConfig {
  payments_paused: boolean;
  payments_paused_message: string;
}

const DEFAULT_CONFIG: AevumConfig = {
  payments_paused: false,
  payments_paused_message: '',
};

let cached: AevumConfig | null = null;
let cachedAt = 0;
let inflight: Promise<AevumConfig> | null = null;
const CACHE_MS = 60_000;

async function fetchConfig(): Promise<AevumConfig> {
  // Reuse in-flight request if multiple components mount simultaneously
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config`, { credentials: 'omit' });
      if (!res.ok) throw new Error(`config_http_${res.status}`);
      const j = await res.json();
      if (!j || j.ok !== true) throw new Error('config_bad_payload');
      const next: AevumConfig = {
        payments_paused: Boolean(j.payments_paused),
        payments_paused_message: typeof j.payments_paused_message === 'string'
          ? j.payments_paused_message
          : '',
      };
      cached = next;
      cachedAt = Date.now();
      return next;
    } catch {
      // Fail-open — wenn Backend nicht erreichbar, NICHT Stripe blockieren
      const fallback = DEFAULT_CONFIG;
      cached = fallback;
      cachedAt = Date.now();
      return fallback;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Returns latest config (cached 60s). `null` only on first mount until first fetch resolves.
 * Use `config?.payments_paused === true` as your gate (treat null as "unknown — don't block yet").
 */
export function useAevumConfig(): AevumConfig | null {
  const [config, setConfig] = useState<AevumConfig | null>(cached);

  useEffect(() => {
    if (cached && Date.now() - cachedAt < CACHE_MS) {
      setConfig(cached);
      return;
    }
    let alive = true;
    fetchConfig().then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  return config;
}

/**
 * Sync getter — usable inside event-handlers (e.g. onClick → check before Stripe).
 * Returns cached value or null. Components should also subscribe via useAevumConfig
 * to reflect state in render-tree.
 */
export function getCachedAevumConfig(): AevumConfig | null {
  return cached;
}

/**
 * Imperative pre-fetch (e.g. on app-boot from main.tsx) so first paint has config ready.
 */
export function prefetchAevumConfig(): Promise<AevumConfig> {
  return fetchConfig();
}
