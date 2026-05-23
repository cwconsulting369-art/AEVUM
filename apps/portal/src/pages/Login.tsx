import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { requestMagicLink } from '@/lib/api';
import { Mail, ArrowRight, CheckCircle2, Sparkles, Bot, ExternalLink } from 'lucide-react';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';

const BOT_USERNAME = import.meta.env.VITE_AEVUM_BOT_USERNAME || 'AEVUMBusinessBot';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestMagicLink(email, 'login');
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown';
      toast.error(`Fehler: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Primary: Telegram Login */}
          <div
            className="glass rounded-2xl p-7 sm:p-8 animate-fade-up mb-4"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-gold-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Login über deinen AEVUM-Bot</div>
                <div className="text-xs text-ink-400 mt-0.5">Empfohlen — kein Passwort, sofortiger Zugang</div>
              </div>
            </div>

            <p className="text-sm text-ink-300 leading-relaxed mb-6">
              Du hast bereits einen AEVUM-Bot in Telegram?{' '}
              Tippe dort auf{' '}
              <span className="text-gold-300 font-medium">🖥 Dashboard</span>{' '}
              — du bekommst sofort deinen persönlichen Login-Link.
            </p>

            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 no-underline"
            >
              Meinen Bot öffnen <ExternalLink size={15} />
            </a>

            <p className="text-[0.7rem] text-ink-500 leading-relaxed mt-4 text-center">
              Noch kein Bot?{' '}
              <a
                href="https://app.aevum-system.de/#/audit"
                className="text-gold-400 hover:text-gold-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Audit buchen →
              </a>
            </p>
          </div>

          {/* Divider */}
          <div
            className="flex items-center gap-3 mb-4 animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-ink-500 px-1">oder per Email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Fallback: Email Magic-Link */}
          <div
            className="glass rounded-2xl px-7 py-6 animate-fade-up"
            style={{ animationDelay: '260ms' }}
          >
            {!sent ? (
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="block text-xs font-semibold mb-2 text-ink-400 uppercase tracking-wider">
                    Email-Adresse
                  </span>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium pl-10 text-sm"
                      placeholder="du@firma.de"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-ghost w-full py-3"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-ink-400/50 border-t-ink-200 rounded-full animate-spin" />
                      Sende…
                    </>
                  ) : (
                    <>
                      Magic-Link anfordern <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-[0.68rem] text-ink-500 leading-relaxed">
                  <Sparkles size={10} className="inline mr-1 text-gold-500" />
                  Einmal-gültiger Link (30 Min). Kein Passwort.
                </p>
              </form>
            ) : (
              <div className="text-center py-1 animate-scale-in">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
                <div className="text-base font-semibold text-white mb-1.5">Check deine Mails</div>
                <p className="text-xs text-ink-300 leading-relaxed">
                  Falls <span className="text-gold-200 font-medium">{email}</span> bei uns
                  registriert ist, hast du gerade einen Login-Link bekommen.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-5 text-xs text-ink-400 hover:text-white transition"
                >
                  ← andere Adresse
                </button>
              </div>
            )}
          </div>

          {/* Legal */}
          <p className="text-[0.67rem] text-ink-500 text-center mt-5 leading-relaxed animate-fade-up" style={{ animationDelay: '320ms' }}>
            Mit dem Login akzeptierst du unsere{' '}
            <Link to="/datenschutz" className="text-gold-400/80 hover:text-gold-300 underline-offset-2 hover:underline">Datenschutzerklärung</Link>{' '}und{' '}
            <Link to="/agb" className="text-gold-400/80 hover:text-gold-300 underline-offset-2 hover:underline">Nutzungsbedingungen</Link>.
          </p>

          <div className="text-center mt-4 text-[0.67rem] text-ink-600 animate-fade-up" style={{ animationDelay: '380ms' }}>
            High-End SaaS · DSGVO-konform · Server-Standort EU
          </div>
        </div>
      </div>

      {/* Footer */}
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
