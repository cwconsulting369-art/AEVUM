#!/usr/bin/env node
/**
 * AEVUM sitemap.xml generator — Wave H4 (SEO refresh)
 *
 * Reads src/data/shop-items/index.ts + src/data/saas-tools/index.ts dynamically
 * and emits public/sitemap.xml with all routable URLs.
 *
 * App is a HashRouter (#/path), but Google/SEO-tools also index regular paths.
 * We emit /shop/blueprint/<slug> form (hash-prefix optional). Modern crawlers
 * resolve via meta tags + JS rendering; this gives them URL discovery.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs           → write public/sitemap.xml
 *   node scripts/generate-sitemap.mjs --check   → print URLs, do not write
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_WEB = resolve(__dirname, '..');
const BASE = 'https://aevum-system.de';
const NOW = new Date().toISOString().split('T')[0];

const STATIC_URLS = [
  { loc: '/',                          changefreq: 'weekly',  priority: 1.0 },
  { loc: '/shop',                      changefreq: 'weekly',  priority: 0.9 },
  { loc: '/saas',                      changefreq: 'weekly',  priority: 0.9 },
  { loc: '/audit',                     changefreq: 'monthly', priority: 0.9 },
  { loc: '/cases',                     changefreq: 'monthly', priority: 0.8 },
  { loc: '/about',                     changefreq: 'monthly', priority: 0.7 },
  { loc: '/method',                    changefreq: 'monthly', priority: 0.7 },
  { loc: '/lead-magnets/eu-ai-act',    changefreq: 'monthly', priority: 0.6 },
  { loc: '/impressum',                 changefreq: 'yearly',  priority: 0.3 },
  { loc: '/datenschutz',               changefreq: 'monthly', priority: 0.4 },
  { loc: '/agb',                       changefreq: 'yearly',  priority: 0.3 },
  { loc: '/widerrufsbelehrung',        changefreq: 'yearly',  priority: 0.3 },
];

/**
 * Parse a TS-source file and pair {slug, type} via simple regex.
 * Tolerant: matches the literal `slug: '...'` and `type: '...'` lines.
 */
function extractShopItems() {
  const file = resolve(REPO_WEB, 'src/data/shop-items/index.ts');
  const src = readFileSync(file, 'utf8');
  const items = [];
  const re = /slug:\s*'([a-z0-9-]+)'[\s\S]*?type:\s*'(blueprint|dfy|saas|bundle)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    items.push({ slug: m[1], type: m[2] });
  }
  return items;
}

function extractSaasTools() {
  const file = resolve(REPO_WEB, 'src/data/saas-tools/index.ts');
  const src = readFileSync(file, 'utf8');
  const slugs = [];
  const re = /slug:\s*'([a-z0-9-]+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    slugs.push(m[1]);
  }
  return slugs;
}

function buildSitemap() {
  const shop = extractShopItems();
  const saas = extractSaasTools();

  const urls = [...STATIC_URLS];

  for (const item of shop) {
    urls.push({
      loc: `/shop/${item.type}/${item.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
    });
  }
  for (const slug of saas) {
    urls.push({
      loc: `/saas/${slug}`,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => [
      '  <url>',
      `    <loc>${BASE}${u.loc}</loc>`,
      `    <lastmod>${NOW}</lastmod>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority.toFixed(1)}</priority>`,
      '  </url>'
    ].join('\n')),
    '</urlset>',
    ''
  ].join('\n');

  return { xml, count: urls.length };
}

function main() {
  const check = process.argv.includes('--check');
  const { xml, count } = buildSitemap();
  if (check) {
    console.log(xml);
    console.error(`[generate-sitemap] ${count} URLs (check-mode, not written)`);
    return;
  }
  const out = resolve(REPO_WEB, 'public/sitemap.xml');
  writeFileSync(out, xml, 'utf8');
  console.log(`[generate-sitemap] wrote ${count} URLs → ${out}`);
}

main();
