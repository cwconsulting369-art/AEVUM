import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { verifyMagicLink } from '@/lib/api';

export default function AuthVerify() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'verifying' | 'ok' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); setErrorMsg('Kein Token in der URL'); return; }
    (async () => {
      try {
        const data = await verifyMagicLink(token);
        if (data.ok) { setState('ok'); setTimeout(() => nav('/dashboard'), 800); }
        else { setState('error'); setErrorMsg('Token ungültig oder abgelaufen'); }
      } catch (e: unknown) {
        setState('error');
        setErrorMsg(e instanceof Error ? e.message : 'unbekannter Fehler');
      }
    })();
  }, [params, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        {state === 'verifying' && <div className="text-lg">Verifizieren…</div>}
        {state === 'ok' && <div className="text-lg text-emerald-400">Eingeloggt — leite weiter…</div>}
        {state === 'error' && (
          <div>
            <div className="text-lg text-red-400 mb-2">Login fehlgeschlagen</div>
            <div className="text-sm text-neutral-500 mb-6">{errorMsg}</div>
            <a href="/" className="text-sm underline">Zurück zum Login</a>
          </div>
        )}
      </div>
    </div>
  );
}
