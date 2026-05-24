import { useEffect } from 'react';

const BASE_URL = 'https://aevum-system.de';

interface SeoOpts {
  title: string;
  description: string;
  /** Path relative to root, e.g. '/audit' — used for canonical. Defaults to current hash route. */
  path?: string;
  keywords?: string;
  /** Optional Schema.org JSON-LD object — injected as <script type="application/ld+json"> with id="page-jsonld" */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/**
 * Sets per-page <title>, meta description, OG/Twitter title+description, and canonical URL.
 * Hash-router compatible — derives canonical from window.location.hash if path not given.
 */
function setJsonLd(payload: SeoOpts['jsonLd']) {
  // Remove old per-page JSON-LD, leave global Organization-Schema in index.html untouched
  const old = document.head.querySelector('script[data-page-jsonld="1"]');
  if (old) old.remove();
  if (!payload) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.setAttribute('data-page-jsonld', '1');
  s.textContent = JSON.stringify(payload);
  document.head.appendChild(s);
}

export function usePageSeo(opts: SeoOpts) {
  const { title, description, path, keywords, jsonLd } = opts;
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    const hashPath = window.location.hash.replace(/^#/, '') || '/';
    const finalPath = path ?? hashPath;
    const canonical = `${BASE_URL}${finalPath === '/' ? '/' : finalPath}`;
    setCanonical(canonical);
    setMeta('og:url', canonical, 'property');

    setJsonLd(jsonLd);
    return () => {
      // Cleanup on unmount — prevent stale JSON-LD bleeding into next page
      const stale = document.head.querySelector('script[data-page-jsonld="1"]');
      if (stale) stale.remove();
    };
  }, [title, description, path, keywords, jsonLd]);
}
