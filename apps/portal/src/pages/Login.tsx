import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';
import { requestMagicLink } from '@/lib/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.48a4.8 4.8 0 0 1 0-3.04V5.37H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.37L4.5 7.44a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}

export default function Login() {
  // Self-serve Email-Login (Magic-Link) für Shop/SaaS-Nutzer ohne Google-Account.
  // Telegram-Login bewusst NICHT angeboten — der ist nur für Vollkunden (customer/
  // full-audit) und läuft über deren persönliche Magic-Link-Mail bzw. Customer-Bot.
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestMagicLink(email, 'login');
      // Anti-enumeration: backend antwortet immer ok:true. Wir zeigen generischen
      // "geprüft + ggf. gesendet"-State, egal ob Account existiert.
      setSent(true);
    } catch {
      setError(t('auth.requestError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-ink-950 text-ink-100 overflow-hidden">
      <MeshBackground variant="login" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-10 flex justify-center animate-fade-up">
            <Brand size={44} showWordmark={false} />
          </div>

          <div className="text-center mb-10 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              <span className="text-gold-gradient">AEVUM</span>
            </h1>
          </div>

          <div className="glass rounded-2xl px-8 py-10 animate-fade-up text-center" style={{ animationDelay: '160ms' }}>

            <p className="text-[0.6rem] uppercase tracking-[0.45em] text-gold-400/70 mb-8">
              {t('auth.loginEyebrow')}
            </p>

            {/* Primary: Google OAuth (Wave I4) */}
            <a
              href={`${API_BASE}/api/auth/google?next=/dashboard&source=portal-login`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition no-underline"
            >
              <GoogleLogo />
              {t('auth.googleSignIn')}
            </a>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500">{t('auth.orWithEmail')}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Secondary: Email Magic-Link — self-serve für Shop/SaaS-Nutzer.
                KEIN Telegram hier (nur Vollkunden, separater Kanal). */}
            {sent ? (
              <div className="text-left rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5">
                <div className="text-sm font-medium text-emerald-300">{t('auth.sentTitle')}</div>
                <p className="text-[0.7rem] text-ink-300 mt-1 leading-relaxed">
                  {t('auth.sentBodyPrefix')} <span className="text-white break-all">{email}</span> {t('auth.sentBodySuffix')}
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-2 text-[0.65rem] text-gold-400/80 hover:text-gold-300 transition"
                >
                  {t('auth.useOtherEmail')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-2.5 text-left">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded bg-ink-900/60 border border-white/10 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition"
                />
                <button
                  type="submit"
                  disabled={!emailValid || submitting}
                  className="btn-gold w-full py-3.5 block text-sm tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? t('auth.sending') : t('auth.emailLinkBtn')}
                </button>
                {error && (
                  <p className="text-[0.7rem] text-rose-400 pt-0.5">{error}</p>
                )}
              </form>
            )}

            <p className="mt-6 text-[0.65rem] text-ink-400 leading-relaxed">
              {t('auth.helpLine')}<br />
              {t('auth.helpLine2')}
            </p>

            <p className="mt-6 text-[0.62rem] text-ink-600">
              {t('auth.noAccess')}{' '}
              <a
                href="https://aevum-system.de/#/audit"
                className="text-gold-400/70 hover:text-gold-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('auth.bookAudit')}
              </a>
            </p>
          </div>

          <p className="text-[0.62rem] text-ink-600 text-center mt-6 leading-relaxed animate-fade-up" style={{ animationDelay: '240ms' }}>
            <Link to="/datenschutz" className="hover:text-ink-400 transition">{t('auth.privacy')}</Link>
            {' · '}
            <Link to="/impressum" className="hover:text-ink-400 transition">{t('auth.imprint')}</Link>
            {' · '}
            <Link to="/agb" className="hover:text-ink-400 transition">{t('auth.agb')}</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
