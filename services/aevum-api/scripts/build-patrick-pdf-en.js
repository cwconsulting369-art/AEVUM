#!/usr/bin/env node
// Build the English Patrick Thailand Property Check PDF.
// Source: data/patrick/THAILAND-PROPERTY-CHECK-EN.md
// Output: data/patrick/THAILAND-PROPERTY-CHECK-EN.pdf

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderPatrickPdf } from '../lib/patrick-pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MD_SRC = path.resolve(__dirname, '..', 'data', 'patrick', 'THAILAND-PROPERTY-CHECK-EN.md');
const OUT = path.resolve(__dirname, '..', 'data', 'patrick', 'THAILAND-PROPERTY-CHECK-EN.pdf');

async function main() {
  if (!fs.existsSync(MD_SRC)) {
    console.error(`Source MD not found: ${MD_SRC}`);
    process.exit(1);
  }
  const md = fs.readFileSync(MD_SRC, 'utf8');
  console.log(`Rendering EN Patrick PDF from ${MD_SRC} (${md.length} chars)...`);
  const pdf = await renderPatrickPdf(md, {
    title: 'Thailand Property Check 2026',
    subtitle: '7 mistakes — and how to avoid them',
    lang: 'en',
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, pdf);
  console.log(`Done. ${OUT}  (${(pdf.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
