import { Link } from 'react-router';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';

const BOT_USERNAME = import.meta.env.VITE_AEVUM_BOT_USERNAME || 'aevumsystem_bot';

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
              Kunden-Portal · Zugang nur auf Einladung
            </p>

            <a
              href={`https://t.me/${BOT_USERNAME}?start=login`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full py-4 block text-sm tracking-widest no-underline"
            >
              Zugang über Telegram
            </a>

            <p className="mt-6 text-[0.65rem] text-ink-400 leading-relaxed">
              Du wirst zu deinem AEVUM-Bot weitergeleitet.<br />
              Dort erhältst du deinen persönlichen Zugang.
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
