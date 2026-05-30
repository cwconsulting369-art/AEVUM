/**
 * MaintenanceBanner — Sticky-Top-Banner wenn payments_paused=true.
 *
 * Verhalten:
 *  - Nur sichtbar wenn `config.payments_paused === true`
 *  - Slide-down on mount
 *  - Inline-Email-Waitlist (POST /api/waitlist/launch)
 *  - Dismissable, in localStorage 24h gemerkt (`aevum_maint_dismissed_at`)
 *
 * Wave I7 — Maintenance-Mode Frontend (2026-05-24)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAevumConfig } from '@/hooks/use-config';
import { track } from '@/lib/shop-track';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';
const DISMISS_KEY = 'aevum_maint_dismissed_at';
const DISMISS_MS = 24 * 60 * 60 * 1000; // 24h

function isDismissed(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    const ts = Number(v);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

export default function MaintenanceBanner() {
  const config = useAevumConfig();
  const [dismissed, setDismissed] = useState(true); // start hidden until we know
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Initial dismissed-check (client-only)
  useEffect(() => {
    setDismissed(isDismissed());
  }, []);

  if (!config?.payments_paused) return null;
  if (dismissed) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr('E-Mail prüfen.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/waitlist/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'banner',
          interest: 'launch',
          interest_tier: 'unsure',
          consent_version: '2026-05-25-v1',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok !== true) {
        setErr('Eintragung fehlgeschlagen.');
        setSubmitting(false);
        return;
      }
      track('launch_waitlist_submit', { meta: { source: 'banner' } });
      setDone(true);
      setSubmitting(false);
    } catch {
      setErr('Netzwerk-Fehler.');
      setSubmitting(false);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore (Safari private-mode)
    }
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        key="maint-banner"
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -64, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-[60] w-full border-b border-theme-border-accent bg-bg-surface"
        role="status"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-theme-accent/15 border border-theme-border-accent flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} className="text-theme-accent" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent block leading-tight">
                AEVUM · Launch-Vorbereitung
              </span>
              <p className="text-[13px] text-text-secondary leading-tight mt-0.5 truncate sm:whitespace-normal">
                {config.payments_paused_message ||
                  'Käufe pausiert — wir sammeln Daten der Pilot-Kunden bevor wir öffnen. Trag dich für die erste Welle ein.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            {!done ? (
              <form onSubmit={submit} className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@firma.de"
                  aria-label="E-Mail für Launch-Benachrichtigung"
                  className="input-base flex-1 sm:w-56 min-w-0 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-theme-accent text-text-on-accent hover:bg-theme-accent-hover disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-all whitespace-nowrap"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : 'Benachrichtige mich'}
                </button>
              </form>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Check size={13} /> Eingetragen
              </span>
            )}

            <button
              type="button"
              onClick={dismiss}
              aria-label="Banner schließen"
              className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {err && (
          <div className="px-6 pb-2 flex items-center gap-1.5 text-[11px] text-rose-400 font-mono">
            <AlertCircle size={11} /> {err}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
