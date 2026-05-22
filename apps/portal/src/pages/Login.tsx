import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { requestMagicLink } from '@/lib/api';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Brand from '@/components/Brand';
import MeshBackground from '@/components/MeshBackground';

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
              Dein Operating-System für Wachstum. Login per Magic-Link — kein Passwort, keine Reibung.
            </p>
          </div>

          {/* Card */}
          <div
            className="glass rounded-2xl p-7 sm:p-8 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            {!sent ? (
              <form onSubmit={onSubmit} className="space-y-5">
                <label className="block">
                  <span className="block text-xs font-semibold mb-2 text-ink-200 uppercase tracking-wider">
                    Deine Email-Adresse
                  </span>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium pl-10"
                      placeholder="du@firma.de"
                      autoFocus
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-gold w-full py-3.5"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" />
                      Sende…
                    </>
                  ) : (
                    <>
                      Magic-Link anfordern <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="divider my-1" />

                <p className="text-[0.7rem] text-ink-400 leading-relaxed">
                  <Sparkles size={11} className="inline mr-1 text-gold-400" />
                  Einmal-gültiger Login-Link per Mail (30 Min). Kein Passwort.
                </p>
                <p className="text-[0.7rem] text-ink-400 leading-relaxed">
                  Mit dem Login akzeptierst du unsere{' '}
                  <Link to="/datenschutz" className="text-gold-300 hover:text-gold-200 underline-offset-2 hover:underline">Datenschutzerklärung</Link>{' '}und{' '}
                  <Link to="/agb" className="text-gold-300 hover:text-gold-200 underline-offset-2 hover:underline">Nutzungsbedingungen</Link>.
                </p>
              </form>
            ) : (
              <div className="text-center py-2 animate-scale-in">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <div className="text-lg font-semibold text-white mb-2">Check deine Mails</div>
                <p className="text-sm text-ink-300 leading-relaxed">
                  Falls die Adresse <span className="text-gold-200 font-medium">{email}</span> bei uns
                  registriert ist, haben wir dir gerade einen Login-Link gesendet.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-6 text-xs text-ink-400 hover:text-white transition"
                >
                  ← andere Adresse verwenden
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-[0.7rem] text-ink-500 animate-fade-up" style={{ animationDelay: '320ms' }}>
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
