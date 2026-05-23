import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { setTokens } from '@/lib/api';
import Spinner from '@/components/Spinner';
import MeshBackground from '@/components/MeshBackground';
import Brand from '@/components/Brand';

// /auth/token?t=<jwt>&redirect=/projects/collaglow
// Sets the JWT directly in localStorage and redirects — no magic-link roundtrip needed.
// Only for internal admin use (tokens issued server-side, not sent over email).
export default function AuthToken() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const t = params.get('t');
    const redirect = params.get('redirect') || '/projects';
    if (!t) { nav('/'); return; }
    setTokens(t);
    nav(redirect, { replace: true });
  }, [params, nav]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-ink-950 text-ink-100 overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 text-center">
        <div className="mb-8 flex justify-center"><Brand size={36} showWordmark={false} /></div>
        <Spinner size="lg" />
        <div className="text-sm text-ink-400 mt-4">Einloggen…</div>
      </div>
    </div>
  );
}
