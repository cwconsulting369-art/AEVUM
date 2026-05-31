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
import { useTranslation } from 'react-i18next';
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
  title,
  message,
}: MaintenanceModalProps) {
  const { t } = useTranslation();
  const config = useAevumConfig();
  const resolvedTitle = title ?? t('maintenance.defaultTitle');
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
      setErr(t('maintenance.errInvalidEmail'));
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
        setErr(j.error === 'invalid_input' ? t('maintenance.errCheckEmailModal') : t('maintenance.errSignupFailedModal'));
        setSubmitting(false);
        return;
      }
      track('launch_waitlist_submit', { meta: { interest, source } });
      setDone(true);
      setSubmitting(false);
    } catch {
      setErr(t('maintenance.errNetworkModal'));
      setSubmitting(false);
    }
  }

  const body = message ?? config?.payments_paused_message ?? t('maintenance.defaultBody');

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
            aria-label={t('maintenance.closeAria')}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Card */}
          <motion.div
            className="relative w-[calc(100%-2rem)] sm:w-full max-w-lg mx-auto max-h-[calc(100dvh-2rem)] overflow-y-auto bg-bg-elevated border border-theme-border-accent shadow-theme-lg"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-title"
          >
            <div className="absolute -top-12 right-1/2 translate-x-1/2 w-48 h-48 rounded-full bg-theme-accent/[0.08] blur-3xl pointer-events-none" />

            <button
              type="button"
              onClick={onClose}
              aria-label={t('maintenance.closeAria')}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="relative p-7 sm:p-9">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent bg-theme-accent/10 border border-theme-border-accent px-3 py-1 rounded-full mb-5">
                <Sparkles size={11} />
                {t('maintenance.badge')}
              </div>

              {!done ? (
                <>
                  <h2
                    id="maintenance-title"
                    className="text-2xl sm:text-[26px] font-light tracking-tight leading-[1.15] mb-3 text-text-primary"
                  >
                    {resolvedTitle}
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {body}
                  </p>

                  <form onSubmit={submit} className="space-y-3">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">
                        {t('maintenance.yourEmail')}
                      </span>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10" />
                        <input
                          type="email"
                          required
                          autoFocus
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('maintenance.emailPlaceholder')}
                          className="input-base pl-9"
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
                      className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium bg-theme-accent text-text-on-accent hover:bg-theme-accent-hover disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 rounded-md transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          {t('maintenance.saving')}
                        </>
                      ) : (
                        <>
                          {t('maintenance.notifyAtLaunch')}
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-text-muted font-mono leading-relaxed pt-1">
                      {t('maintenance.modalFootnote')}
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <h2 id="maintenance-title" className="text-2xl font-light tracking-tight text-text-primary">
                      {t('maintenance.successTitle')}
                    </h2>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {t('maintenance.successBody')}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center text-sm font-medium border border-theme-border text-text-secondary hover:text-text-primary hover:border-theme-border-accent px-5 py-3 rounded-md transition-all"
                  >
                    {t('maintenance.close')}
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
