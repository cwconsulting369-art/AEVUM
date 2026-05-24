import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { setTokens } from '@/lib/api';
import Spinner from '@/components/Spinner';
import MeshBackground from '@/components/MeshBackground';
import Brand from '@/components/Brand';

// /auth/token#t=<jwt>&redirect=/projects/collaglow
// Reads JWT from URL FRAGMENT (after #), NOT query-string.
// Rationale: fragments are never sent to the server, never logged in CDN/web-server
// access logs, and not retained in HTTP Referer headers. Browser-history still
// contains the URL but no log infrastructure does.
// Backward compat: also reads ?t= but strips it from the URL after consume.
// Only for internal admin use (tokens issued server-side, not sent over email).
export default function AuthToken() {
  const nav = useNavigate();

  useEffect(() => {
    // Parse fragment first (preferred). Format: #t=...&redirect=...
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);

    const t = hashParams.get('t') || queryParams.get('t');
    const redirect = hashParams.get('redirect') || queryParams.get('redirect') || '/projects';

    if (!t) { nav('/'); return; }

    setTokens(t);

    // Wipe token from URL so it doesn't sit in history/refresh
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch { /* noop */ }

    nav(redirect, { replace: true });
  }, [nav]);

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
