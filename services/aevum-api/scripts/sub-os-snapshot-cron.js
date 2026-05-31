#!/usr/bin/env node
// Sub-OS Snapshot Cron — Wave E3 (2026-05-24)
// Hits /api/sub-os/_all/summary?fresh=1 with admin token. The endpoint persists
// snapshots to public.sub_os_snapshots, giving us a trend-history over time.
//
// Schedule: every 30 min via cron (see deploy notes).
// Usage:   node scripts/sub-os-snapshot-cron.js
// Env req: AEVUM_ADMIN_TOKEN (from /home/carlos/.envs/aevum.env)

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

const TOKEN = process.env.AEVUM_ADMIN_TOKEN;
const URL = process.env.AEVUM_API_URL || 'http://127.0.0.1:3210';

if (!TOKEN) {
  console.error('[sub-os-cron] AEVUM_ADMIN_TOKEN missing — abort');
  process.exit(1);
}

const start = Date.now();
try {
  const r = await fetch(`${URL}/api/sub-os/_all/summary?fresh=1`, {
    headers: { 'x-aevum-admin-token': TOKEN, Accept: 'application/json' },
  });
  const j = await r.json();
  const ok = j.ok === true;
  const systems = j.systems ? Object.keys(j.systems) : [];
  const failed = systems.filter(s => j.systems[s].ok === false);
  console.log(
    `[sub-os-cron] ${new Date().toISOString()} status=${r.status} ok=${ok}`,
    `systems=${systems.length} failed=${failed.length}`,
    `dur=${Date.now() - start}ms`
  );
  if (failed.length) console.warn('[sub-os-cron] failed:', failed.join(','));
  process.exit(ok ? 0 : 2);
} catch (err) {
  console.error('[sub-os-cron] EXCEPTION:', err.message);
  process.exit(3);
}
