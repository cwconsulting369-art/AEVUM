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
// Stand: 2026-05-22 · Version: cookie-banner-v1

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'aevum_cookie_notice_ack_v1';

export default function CookieBanner() {
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

  const acknowledge = () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: 1,
          ts: new Date().toISOString(),
          version: 'cookie-banner-v1-2026-05-22',
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
          aria-label="Hinweis zu Cookies und Datenverarbeitung"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:bottom-6 z-[100] max-w-3xl mx-auto"
        >
          <div
            className="rounded-xl border border-white/10 shadow-2xl backdrop-blur-md p-5 md:p-6"
            style={{
              background: 'rgba(15, 16, 20, 0.92)',
              boxShadow:
                '0 20px 50px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 text-sm text-[#A1A1AA] leading-relaxed">
                <p className="text-[#F8FAFC] font-medium mb-2">
                  Hinweis zu Cookies und Datenverarbeitung
                </p>
                <p>
                  AEVUM setzt <strong>keine</strong> Tracking-, Analyse- oder
                  Marketing-Cookies. Lediglich beim Checkout-Vorgang verwendet
                  unser Zahlungsdienstleister <strong>Stripe</strong> technisch
                  zwingend erforderliche Cookies zur Betrugsprävention
                  (einwilligungsfrei nach § 25 Abs 2 Nr 2 TTDSG). Details in
                  unserer{' '}
                  <a
                    href="#/datenschutz"
                    className="text-[#F59E0B] hover:underline whitespace-nowrap"
                  >
                    Datenschutzerklärung
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end md:min-w-[180px]">
                <button
                  type="button"
                  onClick={acknowledge}
                  className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B0C10] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-[#0B0C10]"
                >
                  Verstanden
                </button>
                <a
                  href="#/datenschutz"
                  onClick={acknowledge}
                  className="w-full md:w-auto text-center px-5 py-2 rounded-lg border border-white/10 hover:border-white/20 text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors"
                >
                  Details ansehen
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
