import { useEffect } from 'react';

const BASE_URL = 'https://aevum-system.de';

interface SeoOpts {
  title: string;
  description: string;
  /** Path relative to root, e.g. '/audit' — used for canonical. Defaults to current hash route. */
  path?: string;
  keywords?: string;
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
export function usePageSeo(opts: SeoOpts) {
  const { title, description, path, keywords } = opts;
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
  }, [title, description, path, keywords]);
}
