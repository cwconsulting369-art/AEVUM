// AEVUM Lead-Magnet PDF-Renderer
// Created: 2026-05-24 (Agent D3)
//
// Renders a markdown document into a styled PDF (AEVUM-gold dark theme).
// Stand-alone — no Supabase dependency. Used to pre-build lead-magnet PDFs
// that are later served as static files from apps/web/public/lead-magnets/.
//
// Usage:
//   import { renderMarkdownToPdf } from './lib/lead-magnet-pdf.js';
//   const pdf = await renderMarkdownToPdf(md, { title, subtitle });
//   await fs.writeFile(path, pdf);

import puppeteer from 'puppeteer-core';

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE_PATH ||
  process.env.CHROMIUM_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Minimal markdown → HTML for headings/lists/quotes/inline-code/links/bold/italic.
// Intentionally small; we control the input.
function md2html(src) {
  const lines = src.split(/\r?\n/);
  let html = '';
  let inUl = false;
  let inOl = false;
  let inQuote = false;
  let inPara = false;

  function closePara() {
    if (inPara) { html += '</p>\n'; inPara = false; }
  }
  function closeLists() {
    if (inUl) { html += '</ul>\n'; inUl = false; }
    if (inOl) { html += '</ol>\n'; inOl = false; }
  }
  function closeQuote() {
    if (inQuote) { html += '</blockquote>\n'; inQuote = false; }
  }

  function inlineFormat(s) {
    // escape first
    let t = esc(s);
    // links [text](url)
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      return `<a href="${url}">${label}</a>`;
    });
    // bold **text**
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // italic *text*
    t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    // inline code `text`
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  }

  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');

    // Horizontal rule
    if (/^---+$/.test(line)) {
      closePara(); closeLists(); closeQuote();
      html += '<hr/>\n';
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closePara(); closeLists(); closeQuote();
      const level = h[1].length;
      html += `<h${level}>${inlineFormat(h[2])}</h${level}>\n`;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      closePara(); closeLists();
      if (!inQuote) { html += '<blockquote>'; inQuote = true; }
      html += inlineFormat(line.replace(/^>\s?/, '')) + ' ';
      continue;
    } else if (inQuote && line.trim() === '') {
      closeQuote();
      continue;
    }

    // Checkbox list item (must come before bullet match)
    const cb = line.match(/^(\s*)-\s+\[( |x|X)\]\s+(.*)$/);
    if (cb) {
      closePara(); closeQuote();
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul class="checklist">'; inUl = true; }
      const checked = cb[2].toLowerCase() === 'x';
      html += `<li class="check"><span class="box ${checked ? 'on' : ''}">${checked ? '✓' : ''}</span> ${inlineFormat(cb[3])}</li>\n`;
      continue;
    }

    // Bullet
    if (/^\s*[-*]\s+/.test(line)) {
      closePara(); closeQuote();
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul>'; inUl = true; }
      const itm = line.replace(/^\s*[-*]\s+/, '');
      html += `<li>${inlineFormat(itm)}</li>\n`;
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      closePara(); closeQuote();
      if (inUl) { html += '</ul>\n'; inUl = false; }
      if (!inOl) { html += '<ol>'; inOl = true; }
      const itm = line.replace(/^\s*\d+\.\s+/, '');
      html += `<li>${inlineFormat(itm)}</li>\n`;
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      closePara(); closeLists(); closeQuote();
      continue;
    }

    // Default → paragraph text
    closeLists(); closeQuote();
    if (!inPara) { html += '<p>'; inPara = true; }
    else html += ' ';
    html += inlineFormat(line);
  }

  closePara(); closeLists(); closeQuote();
  return html;
}

function buildHtml({ title, subtitle, markdown }) {
  const dateStr = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const body = md2html(markdown);

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --bg-card: #14141d;
    --bg-card-2: #1a1a25;
    --border: #26263a;
    --text: #f5f5fa;
    --text-dim: #c0c0cf;
    --text-muted: #8a8a9c;
    --accent: #e0a458;
    --accent-dim: #8a6532;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 11px;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { padding: 18mm 16mm; }

  /* Cover */
  .cover {
    height: 261mm;
    display: flex; flex-direction: column; justify-content: space-between;
    page-break-after: always;
  }
  .brand { font-weight: 800; font-size: 28px; letter-spacing: 0.18em; color: var(--accent); }
  .brand-sub { color: var(--text-muted); font-size: 10px; letter-spacing: 0.3em; margin-top: 6px; text-transform: uppercase; }
  .cover-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .cover-eyebrow { color: var(--accent); letter-spacing: 0.3em; text-transform: uppercase; font-size: 10px; margin-bottom: 14px; }
  .cover-title { font-size: 38px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 18px; color: var(--text); }
  .cover-subtitle { font-size: 16px; color: var(--text-dim); font-weight: 500; line-height: 1.4; max-width: 480px; }
  .cover-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border); }
  .cover-meta .label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 4px; }
  .cover-meta .value { color: var(--text); font-size: 13px; font-weight: 600; }
  .footer { color: var(--text-muted); font-size: 9px; display: flex; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border); }

  /* Content */
  .content { padding: 14mm 16mm 18mm; }
  .content h1 {
    font-size: 24px; font-weight: 800; color: var(--accent);
    border-bottom: 2px solid var(--accent-dim); padding-bottom: 10px; margin: 0 0 18px;
    letter-spacing: -0.01em; line-height: 1.2;
  }
  .content h2 {
    font-size: 16px; font-weight: 700; color: var(--accent);
    border-bottom: 1px solid var(--border); padding-bottom: 6px;
    margin: 28px 0 12px; letter-spacing: -0.005em;
  }
  .content h3 {
    font-size: 13px; font-weight: 700; color: var(--text);
    margin: 18px 0 8px; letter-spacing: 0;
  }
  .content h4 { font-size: 11px; font-weight: 600; color: var(--text-dim); margin: 12px 0 6px; text-transform: uppercase; letter-spacing: 0.12em; }
  .content p { color: var(--text-dim); margin: 0 0 10px; font-size: 11px; }
  .content strong { color: var(--text); font-weight: 700; }
  .content em { color: var(--text-dim); font-style: italic; }
  .content a { color: var(--accent); text-decoration: none; border-bottom: 1px dotted var(--accent-dim); }
  .content code { background: var(--bg-card-2); padding: 1px 6px; border-radius: 3px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 10px; color: var(--accent); }
  .content blockquote {
    border-left: 3px solid var(--accent);
    background: var(--bg-card);
    padding: 12px 16px; margin: 12px 0 16px;
    color: var(--text-dim); font-style: italic;
    border-radius: 0 4px 4px 0;
  }
  .content hr { border: none; border-top: 1px solid var(--border); margin: 22px 0; }

  .content ul, .content ol { margin: 6px 0 14px 22px; color: var(--text-dim); }
  .content li { margin: 4px 0; font-size: 11px; }

  /* Checklist */
  .content ul.checklist { list-style: none; margin-left: 0; }
  .content li.check {
    display: flex; align-items: flex-start; gap: 10px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    margin: 6px 0;
    line-height: 1.45;
  }
  .content li.check .box {
    flex-shrink: 0;
    width: 16px; height: 16px; min-width: 16px;
    border: 1.5px solid var(--accent-dim);
    border-radius: 3px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: var(--accent);
    margin-top: 1px;
  }
  .content li.check .box.on { background: var(--accent); color: var(--bg); border-color: var(--accent); }

  /* Page-break helpers */
  h1, h2 { page-break-after: avoid; }
  li, p { page-break-inside: avoid; }
</style>
</head>
<body>

<!-- COVER -->
<section class="page cover">
  <div>
    <div class="brand">AEVUM</div>
    <div class="brand-sub">${esc(subtitle || 'Lead-Magnet')}</div>
  </div>
  <div class="cover-mid">
    <div class="cover-eyebrow">Praxis-Checkliste · DACH 2026</div>
    <div class="cover-title">${esc(title)}</div>
    <div class="cover-subtitle">Was Unternehmen wissen müssen — kompakt, branchenneutral, ohne Marketing-Geschwurbel.</div>
    <div class="cover-meta">
      <div>
        <div class="label">Erstellt</div>
        <div class="value">${esc(dateStr)}</div>
      </div>
      <div>
        <div class="label">Quelle</div>
        <div class="value">aevum-system.de</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div>AEVUM · Operating-System für Unternehmen</div>
    <div>aevum-system.de · hello@aevum-system.de</div>
  </div>
</section>

<!-- CONTENT -->
<section class="content">
${body}
</section>

</body></html>`;
}

export async function renderMarkdownToPdf(markdown, opts = {}) {
  const { title = 'AEVUM Lead-Magnet', subtitle = 'AEVUM' } = opts;
  const html = buildHtml({ title, subtitle, markdown });

  const browser = await puppeteer.launch({
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
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
    return pdf;
  } finally {
    await browser.close().catch(() => {});
  }
}
