#!/usr/bin/env node
// Migration Runner via Supabase Management API
// Usage: node apply-migration.js <migration-file.sql>
//   ENV: SUPABASE_ACCESS_TOKEN (PAT, sbp_*), SUPABASE_PROJECT_REF

import fs from 'node:fs';
import path from 'node:path';

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'iwyzbiufmdnwmddjkevf';

if (!PAT) {
  console.error('ERROR: SUPABASE_ACCESS_TOKEN env var missing (PAT, sbp_*)');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: apply-migration.js <migration-file.sql>');
  process.exit(1);
}

const sqlPath = path.resolve(file);
if (!fs.existsSync(sqlPath)) {
  console.error(`ERROR: file not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
console.log(`[migration] Applying: ${sqlPath}`);
console.log(`[migration] Project: ${PROJECT_REF}`);
console.log(`[migration] SQL size: ${sql.length} chars`);

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }

  if (!res.ok) {
    console.error(`[migration] FAILED (HTTP ${res.status})`);
    console.error(JSON.stringify(body, null, 2));
    process.exit(2);
  }

  console.log(`[migration] OK (HTTP ${res.status})`);
  if (Array.isArray(body) && body.length === 0) {
    console.log('[migration] No rows returned (DDL successful)');
  } else {
    console.log(JSON.stringify(body, null, 2).slice(0, 500));
  }
} catch (err) {
  console.error(`[migration] EXCEPTION: ${err.message}`);
  process.exit(3);
}
