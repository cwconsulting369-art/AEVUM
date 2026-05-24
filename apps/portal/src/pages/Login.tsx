import { Link } from 'react-router';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';

const BOT_USERNAME = import.meta.env.VITE_AEVUM_BOT_USERNAME || 'aevumsystem_bot';
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
              Kunden-Portal · Login
            </p>

            {/* Primary: Google OAuth (Wave I4) */}
            <a
              href={`${API_BASE}/api/auth/google?next=/dashboard&source=portal-login`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition no-underline"
            >
              <GoogleLogo />
              Mit Google anmelden
            </a>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500">oder</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Secondary: Telegram (Vollkunden) */}
            <a
              href={`https://t.me/${BOT_USERNAME}?start=login`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full py-3.5 block text-sm tracking-widest no-underline"
            >
              Zugang über Telegram
            </a>

            <p className="mt-6 text-[0.65rem] text-ink-400 leading-relaxed">
              Google: 1-Klick-Login für SaaS- und Shop-Nutzer.<br />
              Telegram: persönlicher Zugang für Vollkunden.
            </p>

            <p className="mt-6 text-[0.62rem] text-ink-600">
              Noch kein Zugang?{' '}
              <a
                href="https://aevum-system.de/#/audit"
                className="text-gold-400/70 hover:text-gold-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Audit buchen →
              </a>
            </p>
          </div>

          <p className="text-[0.62rem] text-ink-600 text-center mt-6 leading-relaxed animate-fade-up" style={{ animationDelay: '240ms' }}>
            <Link to="/datenschutz" className="hover:text-ink-400 transition">Datenschutz</Link>
            {' · '}
            <Link to="/impressum" className="hover:text-ink-400 transition">Impressum</Link>
            {' · '}
            <Link to="/agb" className="hover:text-ink-400 transition">AGB</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
