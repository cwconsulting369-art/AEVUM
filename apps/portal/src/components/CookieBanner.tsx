import { useEffect, useState } from 'react';
import { Link } from 'react-router';

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(raw) as Consent;
      if (parsed?.version !== CONSENT_VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (optional: boolean) => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      essential: true,
      optional
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // ignore (private mode etc.)
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-5 sm:p-6 text-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 text-sm leading-relaxed">
            <div className="text-base font-medium text-neutral-100 mb-2">
              Cookies &amp; Datenschutz
            </div>
            <p className="text-neutral-400">
              Wir verwenden ausschließlich technisch notwendige Cookies, damit das Portal
              funktioniert (Login-Session, CSRF-Schutz). Es findet kein Tracking, keine
              Analyse und kein Marketing-Cookie statt. Du kannst optionalen Komfort-Cookies
              zustimmen oder nur essentielle Cookies nutzen. Details in der{' '}
              <Link
                to="/datenschutz"
                className="text-amber-500 hover:underline"
                onClick={() => persist(false)}
              >
                Datenschutzerklärung
              </Link>.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:w-44 shrink-0">
            <button
              onClick={() => persist(true)}
              className="px-4 py-2 bg-white text-neutral-950 text-sm font-medium rounded-md hover:bg-neutral-200 transition"
            >
              Alle akzeptieren
            </button>
            <button
              onClick={() => persist(false)}
              className="px-4 py-2 bg-neutral-800 text-neutral-100 text-sm font-medium rounded-md hover:bg-neutral-700 transition border border-neutral-700"
            >
              Nur essentielle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
