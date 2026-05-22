import { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';

// Helpbot is lazy-loaded on first idle / interaction to keep initial bundle lean
const Helpbot = lazy(() => import('./components/Helpbot'));

const Audit = lazy(() => import('./pages/Audit'));
const Method = lazy(() => import('./pages/Method'));
const Cases = lazy(() => import('./pages/Cases'));
const About = lazy(() => import('./pages/About'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Impressum = lazy(() => import('./pages/Impressum'));
const AGB = lazy(() => import('./pages/AGB'));
const Widerrufsbelehrung = lazy(() => import('./pages/Widerrufsbelehrung'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const CheckoutCancelled = lazy(() => import('./pages/CheckoutCancelled'));

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#e0a458] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function getHashRoute() {
  const hash = window.location.hash;
  if (!hash || hash === '#/' || hash === '') return '/';
  return hash.replace('#', '');
}

const routeComponents: Record<string, React.ComponentType> = {
  '/': Home,
  '/audit': Audit,
  '/method': Method,
  '/cases': Cases,
  '/about': About,
  '/datenschutz': Datenschutz,
  '/impressum': Impressum,
  '/agb': AGB,
  '/widerrufsbelehrung': Widerrufsbelehrung,
  '/checkout/success': CheckoutSuccess,
  '/checkout/cancelled': CheckoutCancelled,
};

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [mountHelpbot, setMountHelpbot] = useState(false);

  useEffect(() => {
    const handleHash = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Mount Helpbot bundle when browser is idle (or after 2s as fallback) — keeps initial paint lean
  useEffect(() => {
    if (mountHelpbot) return;
    const win = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    const idle = win.requestIdleCallback;
    if (typeof idle === 'function') {
      const id = idle(() => setMountHelpbot(true), { timeout: 2500 });
      return () => {
        const cancel = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
        if (typeof cancel === 'function') cancel(id);
      };
    }
    const t = setTimeout(() => setMountHelpbot(true), 2000);
    return () => clearTimeout(t);
  }, [mountHelpbot]);

  const Page = routeComponents[route] || Home;
  const isHome = route === '/';

  return (
    <Layout>
      {isHome ? (
        <Page />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Page />
        </Suspense>
      )}
      {mountHelpbot && (
        <Suspense fallback={null}>
          <Helpbot />
        </Suspense>
      )}
    </Layout>
  );
}
