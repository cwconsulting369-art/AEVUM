// AEVUM — Cookie- und Tracking-Hinweis
//
// AEVUM setzt KEINE Tracking-, Analyse- oder Marketing-Cookies.
// Einziger eingesetzter Cookie-Mechanismus ist Stripe.js während des aktiven
// Checkout-Vorgangs (Fraud-Detection, technisch zwingend erforderlich
// nach § 25 Abs 2 Nr 2 TTDSG, einwilligungsfrei zulässig).
//
// Dieser Banner ist daher kein Consent-Tool, sondern ein einmaliger,
// transparenter Informations-Hinweis (DSGVO Transparenz-Pflicht Art 12, 13).
// Custom-First: kein Cookie-Bot, kein Vendor-Lock-in, kein Tracking durch
// den Banner selbst (Status nur in localStorage, keine Cookies).
//
// Stand: 2026-05-30 · Version: cookie-banner-v1 · theme-aware + centered

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'aevum_cookie_notice_ack_v1';

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // SSR-Safe + idempotent
    if (typeof window === 'undefined') return;
    try {
      const ack = window.localStorage.getItem(STORAGE_KEY);
      if (!ack) {
        // kleines Delay, damit der Banner nach dem ersten Paint kommt
        const t = window.setTimeout(() => setVisible(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch {
      // localStorage blockiert (Privacy-Browser) → Banner nicht zeigen
    }
  }, []);

  // Emit visibility events so other widgets (Helpbot FAB) can move out of the way
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('aevum:cookie-banner-visibility', { detail: { visible } })
    );
  }, [visible]);

  const acknowledge = () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: 1,
          ts: new Date().toISOString(),
          version: 'cookie-banner-v1-2026-05-30',
        })
      );
    } catch {
      // ignore — Banner wird sich bei jedem Reload zeigen
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label={t('common.cookieAria')}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 lg:pb-6 pointer-events-none"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div
            className="pointer-events-auto mx-auto w-full max-w-3xl rounded-xl border border-theme-border bg-bg-elevated/95 backdrop-blur-md p-5 md:p-6"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 text-sm text-text-secondary leading-relaxed">
                <p className="text-text-primary font-medium mb-2">
                  {t('common.cookieTitle')}
                </p>
                <p>
                  {t('common.cookieBody1')}<strong>{t('common.cookieBodyBold1')}</strong>{t('common.cookieBody2')}<strong>{t('common.cookieBodyBold2')}</strong>{t('common.cookieBody3')}
                  <a
                    href="#/datenschutz"
                    className="text-theme-accent hover:underline whitespace-nowrap"
                  >
                    {t('common.cookieLink')}
                  </a>
                  {t('common.cookieBody4')}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end md:min-w-[180px]">
                <button
                  type="button"
                  onClick={acknowledge}
                  className="btn-primary w-full md:w-auto text-sm px-5 py-2.5"
                >
                  {t('common.cookieAccept')}
                </button>
                <a
                  href="#/datenschutz"
                  onClick={acknowledge}
                  className="w-full md:w-auto text-center px-5 py-2 rounded-lg border border-theme-border hover:border-theme-border-strong text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  {t('common.cookieDetails')}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
