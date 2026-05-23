import { Link } from 'react-router';
import { Bot, ExternalLink } from 'lucide-react';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';

const BOT_USERNAME = import.meta.env.VITE_AEVUM_BOT_USERNAME || 'aevumsystem_bot';

export default function Login() {
  return (
    <div className="relative min-h-screen flex flex-col bg-ink-950 text-ink-100 overflow-hidden">
      <MeshBackground variant="login" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-10 flex justify-center animate-fade-up">
            <Brand size={44} showWordmark={false} />
          </div>

          <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              <span className="text-gold-gradient">AEVUM</span>
            </h1>
            <p className="text-sm text-ink-400 mt-3 max-w-sm mx-auto leading-relaxed">
              Dein Operating-System für Wachstum.
            </p>
          </div>

          {/* TG Login — einziger Weg */}
          <div
            className="glass rounded-2xl p-7 sm:p-8 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-gold-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Login über deinen AEVUM-Bot</div>
                <div className="text-xs text-ink-400 mt-0.5">Kein Passwort — sofortiger Zugang per Telegram</div>
              </div>
            </div>

            <p className="text-sm text-ink-300 leading-relaxed mb-6">
              Öffne deinen AEVUM-Bot in Telegram und tippe auf{' '}
              <span className="text-gold-300 font-medium">🖥 Dashboard</span>{' '}
              — du bekommst sofort deinen persönlichen Login-Link.
            </p>

            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 no-underline"
            >
              Bot öffnen &amp; einloggen <ExternalLink size={15} />
            </a>

            <p className="text-[0.7rem] text-ink-500 leading-relaxed mt-5 text-center">
              Noch kein Bot?{' '}
              <a
                href="https://aevum-system.de/#/audit"
                className="text-gold-400 hover:text-gold-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kostenlosen Audit buchen →
              </a>
            </p>
          </div>

          {/* Legal */}
          <p className="text-[0.67rem] text-ink-500 text-center mt-6 leading-relaxed animate-fade-up" style={{ animationDelay: '240ms' }}>
            Mit dem Login akzeptierst du unsere{' '}
            <Link to="/datenschutz" className="text-gold-400/80 hover:text-gold-300 underline-offset-2 hover:underline">Datenschutzerklärung</Link>{' '}und{' '}
            <Link to="/agb" className="text-gold-400/80 hover:text-gold-300 underline-offset-2 hover:underline">Nutzungsbedingungen</Link>.
          </p>

          <div className="text-center mt-4 text-[0.67rem] text-ink-600 animate-fade-up" style={{ animationDelay: '300ms' }}>
            High-End SaaS · DSGVO-konform · Server-Standort EU
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/5 px-6 py-5 text-xs text-ink-400 backdrop-blur-md bg-ink-950/30">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-center gap-5">
          <Link to="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-white transition">Impressum</Link>
          <Link to="/agb" className="hover:text-white transition">Nutzungsbedingungen</Link>
        </div>
      </footer>
    </div>
  );
}
