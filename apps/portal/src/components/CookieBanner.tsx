import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'aevum_cookie_consent';
const CONSENT_VERSION = '2026-05-22';

type Consent = {
  version: string;
  timestamp: string;
  essential: true;
  optional: boolean;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { setVisible(true); return; }
      const parsed = JSON.parse(raw) as Consent;
      if (parsed?.version !== CONSENT_VERSION) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      // double-rAF to ensure CSS transition fires after mount
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    }
  }, [visible]);

  const persist = (optional: boolean) => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      essential: true,
      optional
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch { /* ignore */ }
    setMounted(false);
    setTimeout(() => setVisible(false), 280);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none"
    >
      <div
        className={`mx-auto max-w-xl glass rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 text-ink-100 pointer-events-auto transition-all duration-300 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-md bg-gold-400/10 border border-gold-400/30 flex items-center justify-center shrink-0">
              <Cookie size={13} className="text-gold-300" />
            </div>
            <p className="text-[0.78rem] leading-snug text-ink-300">
              Nur technisch notwendige Cookies. Kein Tracking.{' '}
              <Link
                to="/datenschutz"
                className="text-gold-300 hover:text-gold-200 underline-offset-2 hover:underline whitespace-nowrap"
                onClick={() => persist(false)}
              >
                Mehr →
              </Link>
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => persist(false)} className="btn-ghost text-[0.7rem] px-3 py-1.5">
              Essentiell
            </button>
            <button onClick={() => persist(true)} className="btn-gold text-[0.7rem] px-3 py-1.5">
              Alle OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
