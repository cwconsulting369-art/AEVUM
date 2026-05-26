#!/usr/bin/env node
// Build the Patrick Thailand-Immobilien-Check PDF from MD source.
// Usage:  node scripts/build-patrick-pdf.js
// Output: data/patrick/THAILAND-IMMOBILIEN-CHECK.pdf

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderPatrickPdf } from '../lib/patrick-pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MD_SRC = '/home/carlos/personal-os/01-business/patrick-thailand/lead-magnet/THAILAND-IMMOBILIEN-CHECK.md';
const OUT = path.resolve(__dirname, '..', 'data', 'patrick', 'THAILAND-IMMOBILIEN-CHECK.pdf');

async function main() {
  if (!fs.existsSync(MD_SRC)) {
    console.error(`Source MD not found: ${MD_SRC}`);
    process.exit(1);
  }
  const md = fs.readFileSync(MD_SRC, 'utf8');
  console.log(`Rendering Patrick PDF from ${MD_SRC} (${md.length} chars)...`);
  const pdf = await renderPatrickPdf(md, {
    title: 'Thailand-Immobilien-Check 2026',
    subtitle: '7 Fehler — und wie du sie vermeidest'
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, pdf);
  const sizeKb = (pdf.length / 1024).toFixed(1);
  console.log(`Done. ${OUT}  (${sizeKb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
