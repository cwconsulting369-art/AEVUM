// Patrick Roth Thailand — Lead-Magnet PDF Renderer
// Created: 2026-05-26
//
// Mirrors lib/lead-magnet-pdf.js style but with Patrick-Branding:
// Anthracite #1a1a1a / Ivory #faf8f3 / Bronze #b87333.
// Cormorant headings + Inter body.

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

function md2html(src) {
  const lines = src.split(/\r?\n/);
  let html = '';
  let inUl = false, inOl = false, inQuote = false, inPara = false;
  const closePara = () => { if (inPara) { html += '</p>\n'; inPara = false; } };
  const closeLists = () => { if (inUl) { html += '</ul>\n'; inUl = false; } if (inOl) { html += '</ol>\n'; inOl = false; } };
  const closeQuote = () => { if (inQuote) { html += '</blockquote>\n'; inQuote = false; } };
  const inline = (s) => {
    let t = esc(s);
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, l, u) => `<a href="${u}">${l}</a>`);
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^---+$/.test(line)) { closePara(); closeLists(); closeQuote(); html += '<hr/>\n'; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { closePara(); closeLists(); closeQuote(); const lv = h[1].length; html += `<h${lv}>${inline(h[2])}</h${lv}>\n`; continue; }
    if (/^>\s?/.test(line)) {
      closePara(); closeLists();
      if (!inQuote) { html += '<blockquote>'; inQuote = true; }
      html += inline(line.replace(/^>\s?/, '')) + ' ';
      continue;
    } else if (inQuote && line.trim() === '') { closeQuote(); continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      closePara(); closeQuote();
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>\n`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      closePara(); closeQuote();
      if (inUl) { html += '</ul>\n'; inUl = false; }
      if (!inOl) { html += '<ol>'; inOl = true; }
      html += `<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>\n`;
      continue;
    }
    if (line.trim() === '') { closePara(); closeLists(); closeQuote(); continue; }
    closeLists(); closeQuote();
    if (!inPara) { html += '<p>'; inPara = true; } else html += ' ';
    html += inline(line);
  }
  closePara(); closeLists(); closeQuote();
  return html;
}

function buildHtml({ title, subtitle, markdown }) {
  const dateStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const body = md2html(markdown);
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --anthracite:#1a1a1a; --ivory:#faf8f3; --mist:#efebe2; --bronze:#b87333; --bronze-soft:#d9a373; --text:#1a1a1a; --text-dim:#4a4a4a; --text-muted:#8a8a8a; }
  * { box-sizing: border-box; margin:0; padding:0; }
  html,body { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; background:var(--ivory); color:var(--text); font-size:11px; line-height:1.65; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .display { font-family:'Cormorant Garamond', Georgia, serif; }
  .page { padding: 18mm 16mm; }
  .cover { height:261mm; display:flex; flex-direction:column; justify-content:space-between; page-break-after:always; background:var(--anthracite); color:var(--ivory); padding: 24mm 18mm; }
  .brand { font-family:'Cormorant Garamond',serif; font-weight:500; font-size:24px; letter-spacing:0.04em; color:var(--bronze); }
  .brand-sub { color:rgba(255,255,255,0.6); font-size:9px; letter-spacing:0.32em; margin-top:6px; text-transform:uppercase; }
  .cover-mid { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .cover-eyebrow { color:var(--bronze); letter-spacing:0.28em; text-transform:uppercase; font-size:10px; margin-bottom:18px; }
  .cover-title { font-family:'Cormorant Garamond',serif; font-weight:500; font-size:46px; line-height:1.04; letter-spacing:-0.01em; margin-bottom:20px; color:var(--ivory); }
  .cover-title em { color:var(--bronze); font-style:italic; }
  .cover-subtitle { font-size:14px; color:rgba(255,255,255,0.75); font-weight:400; line-height:1.55; max-width:480px; }
  .cover-meta { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:42px; padding-top:22px; border-top:1px solid rgba(255,255,255,0.15); }
  .cover-meta .label { color:rgba(255,255,255,0.45); font-size:9px; text-transform:uppercase; letter-spacing:0.2em; margin-bottom:6px; }
  .cover-meta .value { color:var(--ivory); font-size:13px; font-weight:500; }
  .cover .footer { color:rgba(255,255,255,0.4); font-size:9px; display:flex; justify-content:space-between; padding-top:14px; border-top:1px solid rgba(255,255,255,0.12); }

  .content { padding:14mm 18mm 18mm; }
  .content h1 { font-family:'Cormorant Garamond',serif; font-weight:500; font-size:26px; color:var(--anthracite); border-bottom:2px solid var(--bronze); padding-bottom:10px; margin:0 0 18px; line-height:1.2; }
  .content h2 { font-family:'Cormorant Garamond',serif; font-weight:500; font-size:18px; color:var(--anthracite); border-bottom:1px solid rgba(184,115,51,0.3); padding-bottom:6px; margin:26px 0 12px; }
  .content h3 { font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:var(--bronze); margin:18px 0 8px; text-transform:uppercase; letter-spacing:0.12em; }
  .content h4 { font-size:11px; font-weight:600; color:var(--text-dim); margin:12px 0 6px; }
  .content p { color:var(--text-dim); margin:0 0 10px; font-size:11px; }
  .content strong { color:var(--text); font-weight:600; }
  .content em { color:var(--text-dim); font-style:italic; }
  .content a { color:var(--bronze); text-decoration:none; border-bottom:1px dotted var(--bronze-soft); }
  .content code { background:var(--mist); padding:1px 6px; border-radius:3px; font-family:'SF Mono',Menlo,Consolas,monospace; font-size:10px; color:var(--bronze); }
  .content blockquote { border-left:3px solid var(--bronze); background:var(--mist); padding:12px 16px; margin:12px 0 16px; color:var(--text-dim); font-family:'Cormorant Garamond',serif; font-style:italic; font-size:13px; border-radius:0 4px 4px 0; }
  .content hr { border:none; border-top:1px solid rgba(184,115,51,0.18); margin:22px 0; }
  .content ul, .content ol { margin:6px 0 14px 22px; color:var(--text-dim); }
  .content li { margin:4px 0; font-size:11px; }

  h1,h2 { page-break-after:avoid; }
  li,p { page-break-inside:avoid; }

  .disclaimer { margin-top:30px; padding:14px 18px; background:var(--mist); border-left:3px solid var(--bronze); font-size:10px; color:var(--text-dim); line-height:1.5; }
  .disclaimer strong { color:var(--anthracite); }

  .closing { margin-top:30px; padding:22px; border-top:1px solid rgba(184,115,51,0.3); }
  .closing .name { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--anthracite); margin-bottom:4px; }
  .closing .role { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.16em; margin-bottom:14px; }
  .closing .contact { font-size:10px; color:var(--text-dim); line-height:1.7; }
  .closing .contact a { color:var(--bronze); }
</style></head><body>

<section class="page cover">
  <div>
    <div class="brand">Patrick Roth Thailand</div>
    <div class="brand-sub">Concierge · Pattaya seit 2024</div>
  </div>
  <div class="cover-mid">
    <div class="cover-eyebrow">${esc(subtitle || 'Lead-Magnet · Praxis-Wissen')}</div>
    <div class="cover-title">${esc(title)}</div>
    <div class="cover-subtitle">18 Monate Vor-Ort-Realität in Pattaya — kompakt, ehrlich, ohne Marketing-Geschwurbel. Was du wissen musst, bevor du den ersten Euro nach Thailand schickst.</div>
    <div class="cover-meta">
      <div><div class="label">Stand</div><div class="value">${esc(dateStr)}</div></div>
      <div><div class="label">Autor</div><div class="value">Patrick Roth</div></div>
    </div>
  </div>
  <div class="footer">
    <div>patrick-roth-thailand.de</div>
    <div>patrick.roth.th@outlook.com</div>
  </div>
</section>

<section class="content">
${body}

<div class="closing">
  <div class="name">Patrick Roth</div>
  <div class="role">Thailand Concierge · Pattaya</div>
  <div class="contact">
    WhatsApp: +49 1511 4363994<br/>
    Email: <a href="mailto:patrick.roth.th@outlook.com">patrick.roth.th@outlook.com</a><br/>
    LinkedIn: <a href="https://www.linkedin.com/in/living-in-thailand-463321350/">living-in-thailand</a><br/>
    Web: <a href="https://patrick-roth-thailand.de">patrick-roth-thailand.de</a>
  </div>
</div>

<div class="disclaimer">
  <strong>Hinweis.</strong> Dieses Dokument ist Patricks Eigen-Entwurf und gibt seine persönliche Vor-Ort-Erfahrung wieder. Es ersetzt keine individuelle Rechts-, Steuer- oder Vermögensberatung. Konkrete Vertragsklauseln gehören vor Unterzeichnung in die Hände eines Anwalts deines Vertrauens. Eine juristische Prüfung dieses Dokuments steht aus.
</div>
</section>

</body></html>`;
}

export async function renderPatrickPdf(markdown, opts = {}) {
  const { title = 'Thailand-Immobilien-Check', subtitle = 'Praxis-Wissen für deutsche Käufer' } = opts;
  const html = buildHtml({ title, subtitle, markdown });
  const browser = await puppeteer.launch({
    executablePath: CHROME_EXECUTABLE,
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--font-render-hinting=none']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'0mm', right:'0mm', bottom:'0mm', left:'0mm' } });
    return pdf;
  } finally {
    await browser.close().catch(() => {});
  }
}
