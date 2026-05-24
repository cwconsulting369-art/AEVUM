/**
 * MaintenanceModal — Full-Screen-Overlay wenn User auf disabled Buy-Button klickt.
 *
 * Trigger: jeder Buy/Subscribe-Button checkt `config.payments_paused`. Wenn true,
 * statt Stripe-Redirect → openMaintenanceModal({ interest, toolSlug }).
 *
 * Eintragung geht an POST /api/waitlist/launch (siehe routes/waitlist.js).
 *
 * Carlos-Brand-Tone: Anti-Buzzword, transparent, „in Vorbereitung", professionell.
 *
 * Wave I7 — Maintenance-Mode Frontend (2026-05-24)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { track } from '@/lib/shop-track';
import { useAevumConfig } from '@/hooks/use-config';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';

export interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional context — z.B. 'shop:content-factory' oder 'saas:script-factory' */
  interest?: string;
  /** Tool/Item-Slug für Tracking + Waitlist-Eintrag */
  source?: string;
  /** Custom-Title (optional) — Default: "AEVUM ist in Vorbereitung" */
  title?: string;
  /** Custom-Subtitle — Default: zieht aus config.payments_paused_message */
  message?: string;
}

export default function MaintenanceModal({
  open,
  onClose,
  interest,
  source,
  title = 'AEVUM ist gerade in Vorbereitung',
  message,
}: MaintenanceModalProps) {
  const config = useAevumConfig();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setEmail('');
      setSubmitting(false);
      setDone(false);
      setErr(null);
      track('launch_waitlist_view', { meta: { interest, source } });
    }
  }, [open, interest, source]);

  // ESC schließt
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/waitlist/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: source ?? 'maintenance-modal',
          interest: interest ?? null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok !== true) {
        setErr(j.error === 'invalid_input' ? 'Bitte E-Mail prüfen.' : 'Eintragung fehlgeschlagen — bitte gleich nochmal probieren.');
        setSubmitting(false);
        return;
      }
      track('launch_waitlist_submit', { meta: { interest, source } });
      setDone(true);
      setSubmitting(false);
    } catch {
      setErr('Netzwerk-Fehler — bitte später erneut.');
      setSubmitting(false);
    }
  }

  const body = message ?? config?.payments_paused_message ??
    'Wir sammeln gerade fokussiert Daten aus den Pilot-Kunden und stellen sicher dass jedes System messbar Wirkung zeigt — bevor wir öffnen. Trag dich ein, dann gehörst du zur ersten Welle wenn wir den Shop wieder aufmachen.';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="absolute inset-0 bg-[#04040680]/90 backdrop-blur-md"
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-lg bg-[#0c0c10] border border-[#e0a458]/30 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-title"
          >
            <div className="absolute -top-12 right-1/2 translate-x-1/2 w-48 h-48 rounded-full bg-[#e0a458]/8 blur-3xl pointer-events-none" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="absolute top-4 right-4 text-[#7a7a85] hover:text-[#F9FAFB] transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="relative p-7 sm:p-9">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/25 px-3 py-1 rounded-full mb-5">
                <Sparkles size={11} />
                Launch-Vorbereitung
              </div>

              {!done ? (
                <>
                  <h2
                    id="maintenance-title"
                    className="text-2xl sm:text-[26px] font-light tracking-tight leading-[1.15] mb-3 text-[#F9FAFB]"
                  >
                    {title}
                  </h2>
                  <p className="text-sm text-[#a4a4ad] leading-relaxed mb-6">
                    {body}
                  </p>

                  <form onSubmit={submit} className="space-y-3">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#7a7a85] mb-1.5 block">
                        Deine E-Mail
                      </span>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a85]" />
                        <input
                          type="email"
                          required
                          autoFocus
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="du@firma.de"
                          className="w-full bg-[#08080a] border border-white/10 px-9 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#5a5a65] focus:outline-none focus:border-[#e0a458]/50 focus:ring-1 focus:ring-[#e0a458]/30 transition-all"
                        />
                      </div>
                    </label>

                    {err && (
                      <div className="flex items-start gap-2 text-xs text-rose-400 font-mono border border-rose-400/30 bg-rose-400/5 px-3 py-2">
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#e0a458] text-[#08080a] hover:bg-[#f0b468] disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Wird gesichert…
                        </>
                      ) : (
                        <>
                          Benachrichtige mich beim Launch
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-[#5a5a65] font-mono leading-relaxed pt-1">
                      Eine Mail beim Go-Live. Kein Newsletter. Jederzeit per Klick wieder austragbar.
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <h2 id="maintenance-title" className="text-2xl font-light tracking-tight text-[#F9FAFB]">
                      Eingetragen.
                    </h2>
                  </div>
                  <p className="text-sm text-[#a4a4ad] leading-relaxed mb-6">
                    Wir melden uns sobald der Shop wieder live geht — typischerweise ein paar Wochen. Bis dahin:
                    arbeite weiter, wir sammeln Daten und bauen.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center text-sm font-medium border border-white/10 text-[#a4a4ad] hover:text-[#F9FAFB] hover:border-[#e0a458]/40 px-5 py-3 transition-all"
                  >
                    Schließen
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
