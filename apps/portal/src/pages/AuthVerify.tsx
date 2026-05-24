import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { verifyMagicLink, clearTokens } from '@/lib/api';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/Spinner';
import MeshBackground from '@/components/MeshBackground';
import Brand from '@/components/Brand';

export default function AuthVerify() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'verifying' | 'ok' | 'error'>('verifying');
  const [accountInfo, setAccountInfo] = useState<{ slug: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    // Token kann im Fragment (#token=... oder #t=...) ODER Query (?token=...) sein.
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hash);
    const token = hashParams.get('token') || hashParams.get('t') || params.get('token');
    if (!token) { setState('error'); setErrorMsg('Kein Token in der URL'); return; }
    // CRITICAL: vorhandene Auth komplett löschen BEVOR der neue Token gesetzt wird.
    // Sonst landet ein Admin der über Customer-Magic-Link kommt versehentlich auf
    // seinem alten Dashboard. Hard-Logout = sichere Account-Trennung.
    try {
      clearTokens();
      sessionStorage.clear();
    } catch { /* noop */ }
    try {
      if (window.location.hash) window.history.replaceState({}, '', window.location.pathname);
    } catch { /* noop */ }
    (async () => {
      try {
        const data = await verifyMagicLink(token);
        if (data.ok) {
          setAccountInfo({ slug: data.account.slug, name: data.account.name });
          setState('ok');
          // Account-Slug in localStorage so dass Dashboard genau diesen Account lädt
          // (auch falls /api/me cache-issues hat)
          try { localStorage.setItem('aevum_active_account_slug', data.account.slug); } catch { /* noop */ }
          setTimeout(() => nav('/dashboard'), 1200);
        }
        else { setState('error'); setErrorMsg('Token ungültig oder abgelaufen'); }
      } catch (e: unknown) {
        setState('error');
        setErrorMsg(e instanceof Error ? e.message : 'unbekannter Fehler');
      }
    })();
  }, [params, nav]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-ink-950 text-ink-100 overflow-hidden px-6">
      <MeshBackground />
      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="mb-8 flex justify-center animate-fade-up">
          <Brand size={36} showWordmark={false} />
        </div>

        {state === 'verifying' && (
          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="flex justify-center mb-6"><Spinner size="lg" /></div>
            <div className="text-lg font-medium text-white">Verifiziere…</div>
            <div className="text-sm text-ink-400 mt-2">Wir prüfen deinen Magic-Link</div>
          </div>
        )}

        {state === 'ok' && (
          <div className="animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center animate-pulse-gold" style={{ animationName: 'pulse-gold' }}>
              <CheckCircle2 size={40} className="text-emerald-400" strokeWidth={1.8} />
            </div>
            <div className="text-lg font-semibold text-white">Eingeloggt{accountInfo ? ` als ${accountInfo.name}` : ''}</div>
            <div className="text-sm text-ink-300 mt-2">Leite weiter zum Dashboard…</div>
            {accountInfo && (
              <div className="mt-3 text-xs text-ink-500">Account: <code className="text-amber-300">{accountInfo.slug}</code></div>
            )}
          </div>
        )}

        {state === 'error' && (
          <div className="animate-shake">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center">
              <XCircle size={40} className="text-rose-400" strokeWidth={1.8} />
            </div>
            <div className="text-lg font-semibold text-white mb-2">Login fehlgeschlagen</div>
            <div className="text-sm text-ink-400 mb-8 leading-relaxed">{errorMsg}</div>
            <a href="/" className="btn-ghost inline-flex">
              <ArrowLeft size={14} /> Zurück zum Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
