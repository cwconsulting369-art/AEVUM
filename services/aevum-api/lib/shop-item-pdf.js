// AEVUM Shop-Item Anleitung-PDF-Renderer
// Created: 2026-05-24 (Agent A5)
//
// Renders a structured Anleitung-PDF per shop-item (blueprint/dfy/saas).
// Sections: useCase, install, powershellOrPrompts, integration, apiTokens, securityRisks, protection, mehrwert.
//
// Usage:
//   import { renderShopItemAnleitung } from '../lib/shop-item-pdf.js';
//   const pdfBuffer = await renderShopItemAnleitung({
//     item: { name: 'Content Factory', slug: 'content-factory' },
//     sections: { useCase: '...', install: '...', ... }
//   });

import puppeteer from 'puppeteer-core';

export async function renderShopItemAnleitung({ item, sections }) {
  if (!item?.name) throw new Error('item.name required');
  const safeSections = sections || {};
  const html = buildHtml({ item, sections: safeSections });

  const executablePath =
    process.env.CHROMIUM_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    '/usr/bin/chromium';

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

function buildHtml({ item, sections }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; margin: 0; }
    h1 { color: #c4a032; border-bottom: 2px solid #c4a032; padding-bottom: 8px; margin: 0 0 16px 0; font-size: 28px; }
    h2 { color: #1a1a1a; margin-top: 32px; margin-bottom: 8px; font-size: 18px; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; font-family: 'SF Mono', Menlo, Consolas, monospace; white-space: pre-wrap; word-break: break-word; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 13px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header .brand { color: #c4a032; font-weight: 700; letter-spacing: 0.1em; font-size: 14px; }
    .header .meta { color: #888; font-size: 12px; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .warn { background: #fff8e7; border-left: 4px solid #c4a032; padding: 12px 16px; border-radius: 0 4px 4px 0; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #888; font-size: 11px; text-align: center; }
  </style></head><body>
    <div class="header">
      <div class="brand">AEVUM</div>
      <h1>${escapeHtml(item.name)}</h1>
      <div class="meta">Anleitung &middot; ${new Date().toLocaleDateString('de-DE')}${item.slug ? ' &middot; ' + escapeHtml(item.slug) : ''}</div>
    </div>

    ${section('Use-Case', md(sections.useCase))}
    ${section('Installation', md(sections.install))}
    ${section('Code &middot; PowerShell / Claude-Code-Prompts', `<pre>${escapeHtml(sections.powershellOrPrompts || '')}</pre>`)}
    ${section('Integration in bestehende Systeme', md(sections.integration))}
    ${section('API-Token-Verbindung', md(sections.apiTokens))}
    ${section('Security-Risiken', `<div class="warn">${md(sections.securityRisks)}</div>`)}
    ${section('Schutz-Massnahmen', md(sections.protection))}
    ${section('Mehrwert &middot; Was es konkret bringt', md(sections.mehrwert))}

    <div class="footer">
      AEVUM &middot; Operating-System für Unternehmen &middot; aevum-system.de
    </div>
  </body></html>`;
}

function section(title, body) {
  return `<div class="section"><h2>${title}</h2>${body || '<p><em>—</em></p>'}</div>`;
}

function md(s) {
  if (!s) return '';
  // Minimal markdown-light: escape, then linebreaks. Bold/italics intentionally left raw.
  return escapeHtml(s).replace(/\n/g, '<br>');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
