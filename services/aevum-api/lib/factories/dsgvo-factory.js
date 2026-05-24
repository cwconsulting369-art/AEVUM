// AEVUM DSGVO-Factory — Stub-MVP
// Created: 2026-05-24 (Agent C2)
//
// Personalisiert DSGVO-Texte/AVVs aus Templates in personal-os/01-business/aevum/
// Stub: nur AVV-Template aktiv. Rest → Wave-D.
//
// Workflow: runDsgvoFactory({ runId, accountId })
//   1. Load run from DB
//   2. Read template-md from personal-os
//   3. Substitute variables ([KUNDE_FIRMA], {{Firma}} both supported)
//   4. Render to PDF via puppeteer (markdown → HTML → PDF)
//   5. Upload to Supabase Storage `dsgvo`
//   6. Update run row with pdf_url + status=complete

import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { supabase } from '../supabase.js';
import { logUsage } from '../credit-spend.js';

const TEMPLATES_DIR = '/home/carlos/personal-os/01-business/aevum';
const CHROME_EXECUTABLE = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome';

const TEMPLATE_FILES = {
  avv: 'AVV-TEMPLATE-AEVUM-2026-05-20.md',
  datenschutzerklaerung: null, // TODO Wave-D
  impressum: null,
  agb: null,
  widerruf: null,
  'newsletter-consent': null
};

// ─── Main entry ──────────────────────────────────────────────
export async function runDsgvoFactory({ runId, accountId }) {
  console.log(`[dsgvo-factory] start run=${runId} account=${accountId}`);

  const { data: rows, ok } = await supabase.select(
    'dsgvo_factory_runs',
    `?id=eq.${runId}&limit=1&select=*`
  );
  if (!ok || !rows?.length) throw new Error('run_not_found');
  const run = rows[0];

  await supabase.update('dsgvo_factory_runs', `?id=eq.${runId}`, {
    status: 'running',
    started_at: new Date().toISOString()
  });

  const templateFile = TEMPLATE_FILES[run.template_type];
  if (!templateFile) {
    throw new Error(`template_not_yet_supported:${run.template_type}`);
  }

  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  let templateRaw;
  try {
    templateRaw = await fs.readFile(templatePath, 'utf-8');
  } catch (err) {
    throw new Error(`template_read_failed: ${err.message}`);
  }

  // Substitute variables
  const inputs = run.inputs || {};
  const filled = substituteVariables(templateRaw, inputs);

  // Render to PDF
  const pdfBuffer = await renderMarkdownToPdf(filled, {
    title: titleForTemplate(run.template_type, inputs),
    template_type: run.template_type
  });

  console.log(`[dsgvo-factory] rendered ${pdfBuffer.length} bytes`);

  // Upload to storage
  const objectPath = `${accountId}/${runId}-${run.template_type}.pdf`;
  const signedUrl = await uploadToStorage(objectPath, pdfBuffer);

  // Update run row
  await supabase.update('dsgvo_factory_runs', `?id=eq.${runId}`, {
    status: 'complete',
    finished_at: new Date().toISOString(),
    pdf_url: signedUrl,
    credits_spent: 25
  });

  // Log usage
  await logUsage({
    accountId,
    sessionId: runId,
    endpoint: '/api/factories/dsgvo/run',
    model: 'template-only',
    inputTokens: 0,
    outputTokens: 0,
    creditsSpent: 25,
    context: `dsgvo-factory:${run.template_type}`
  });

  console.log(`[dsgvo-factory] done run=${runId} → ${objectPath}`);
  return { runId, pdfUrl: signedUrl };
}

// ─── Variable substitution ────────────────────────────────────
// Supports both [KEY] (existing AVV-template style) and {{key}} (generic).
function substituteVariables(template, inputs) {
  let out = template;
  for (const [key, value] of Object.entries(inputs)) {
    const strVal = value === null || value === undefined ? '' : String(value);
    // {{key}} or {{ key }}
    const reCurly = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    out = out.replace(reCurly, strVal);
    // [KEY] (uppercase placeholder convention)
    const reSquare = new RegExp(`\\[${escapeRegex(key)}\\]`, 'g');
    out = out.replace(reSquare, strVal);
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleForTemplate(type, inputs) {
  const customer = inputs.KUNDE_FIRMA || inputs.Firma || inputs.firma || 'Kunde';
  const titles = {
    avv: `AVV — ${customer}`,
    datenschutzerklaerung: `Datenschutzerklärung — ${customer}`,
    impressum: `Impressum — ${customer}`,
    agb: `AGB — ${customer}`,
    widerruf: `Widerrufsbelehrung — ${customer}`,
    'newsletter-consent': `Newsletter-Consent — ${customer}`
  };
  return titles[type] || `DSGVO-Dokument — ${customer}`;
}

// ─── Markdown → HTML → PDF ────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Minimal markdown → HTML converter (no deps).
// Handles: headings (# ## ###), bold (**x**), italic (*x*), lists (- / *),
// horizontal rules (---), paragraphs. Sufficient for DSGVO-Templates.
function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;
  let inPara = [];

  const flushPara = () => {
    if (inPara.length) {
      const txt = inPara.join(' ');
      out.push(`<p>${inlineFormat(txt)}</p>`);
      inPara = [];
    }
  };
  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push('<hr>');
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      out.push(`<h${level}>${inlineFormat(h[2])}</h${level}>`);
      continue;
    }

    // List item
    const li = line.match(/^\s*[-*]\s+(.+)$/);
    if (li) {
      flushPara();
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inlineFormat(li[1])}</li>`);
      continue;
    }

    // Paragraph line
    closeList();
    inPara.push(line);
  }
  flushPara();
  closeList();
  return out.join('\n');
}

function inlineFormat(text) {
  let t = escapeHtml(text);
  // Bold **x**
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *x* (not **)
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // Inline code `x`
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}

function htmlShell({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --text: #111827;
    --text-dim: #4b5563;
    --text-muted: #6b7280;
    --accent: #b8862e;
    --border: #e5e7eb;
    --bg-soft: #f9fafb;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text);
    font-size: 11px;
    line-height: 1.55;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    padding: 18mm 18mm 22mm 18mm;
  }
  .hdr {
    border-bottom: 1.5px solid var(--accent);
    padding-bottom: 10px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .hdr .brand {
    font-weight: 800;
    letter-spacing: 0.22em;
    color: var(--accent);
    font-size: 14px;
  }
  .hdr .meta {
    font-size: 9px;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h1 { font-size: 22px; margin: 14px 0 12px 0; letter-spacing: -0.01em; color: var(--text); }
  h2 { font-size: 15px; margin: 18px 0 8px 0; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 4px; }
  h3 { font-size: 12.5px; margin: 14px 0 6px 0; color: var(--text); font-weight: 700; }
  h4 { font-size: 11.5px; margin: 10px 0 5px 0; color: var(--text-dim); }
  p { margin-bottom: 8px; color: var(--text-dim); }
  ul { margin: 4px 0 10px 16px; }
  li { margin-bottom: 3px; color: var(--text-dim); }
  hr { border: 0; border-top: 1px dashed var(--border); margin: 14px 0; }
  strong { color: var(--text); font-weight: 700; }
  em { font-style: italic; }
  code { background: var(--bg-soft); padding: 1px 4px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text); }
  .ftr {
    margin-top: 22px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    color: var(--text-muted);
    font-size: 9px;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="brand">AEVUM</div>
    <div class="meta">DSGVO-Factory · ${escapeHtml(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }))}</div>
  </div>
  ${bodyHtml}
  <div class="ftr">
    <div>Generiert über AEVUM DSGVO-Factory · aevum-system.de</div>
    <div>Carlos Wrusch · hello@aevum-system.de</div>
  </div>
</div>
</body>
</html>`;
}

async function renderMarkdownToPdf(md, { title }) {
  const bodyHtml = markdownToHtml(md);
  const html = htmlShell({ title, bodyHtml });

  let browser;
  let pdfBuffer;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_EXECUTABLE,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: false
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
  return pdfBuffer;
}

// ─── Upload to Supabase Storage (bucket: dsgvo, private + signed URL) ─
async function uploadToStorage(objectPath, pdfBuffer) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE creds missing');

  const uploadUrl = `${url}/storage/v1/object/dsgvo/${objectPath}`;
  const upRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true'
    },
    body: pdfBuffer
  });
  if (!upRes.ok) {
    const txt = await upRes.text();
    throw new Error(`storage_upload_failed status=${upRes.status} body=${txt.slice(0, 200)}`);
  }

  // Signed URL — bucket is private. 30 days = 2,592,000 s
  const signRes = await fetch(`${url}/storage/v1/object/sign/dsgvo/${objectPath}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 30 })
  });
  if (!signRes.ok) {
    const txt = await signRes.text();
    throw new Error(`storage_sign_failed status=${signRes.status} body=${txt.slice(0, 200)}`);
  }
  const signData = await signRes.json();
  return `${url}/storage/v1${signData.signedURL || signData.signedUrl}`;
}
