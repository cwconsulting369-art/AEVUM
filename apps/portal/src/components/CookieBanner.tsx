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
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
    >
      <div
        className={`mx-auto max-w-3xl glass rounded-2xl p-5 sm:p-6 text-ink-100 pointer-events-auto transition-all duration-300 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center shrink-0">
              <Cookie size={16} className="text-gold-300" />
            </div>
            <div className="text-sm leading-relaxed">
              <div className="text-base font-semibold text-white mb-1.5">
                Cookies &amp; Datenschutz
              </div>
              <p className="text-ink-300">
                Wir verwenden ausschließlich technisch notwendige Cookies (Login-Session,
                CSRF-Schutz). Kein Tracking, keine Analyse, keine Marketing-Cookies. Details in der{' '}
                <Link
                  to="/datenschutz"
                  className="text-gold-300 hover:text-gold-200 underline-offset-2 hover:underline"
                  onClick={() => persist(false)}
                >
                  Datenschutzerklärung
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:w-44 shrink-0">
            <button onClick={() => persist(true)} className="btn-gold text-xs py-2.5">
              Alle akzeptieren
            </button>
            <button onClick={() => persist(false)} className="btn-ghost text-xs py-2">
              Nur essentielle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
