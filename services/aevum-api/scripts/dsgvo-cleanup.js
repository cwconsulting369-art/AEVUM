#!/usr/bin/env node
// DSGVO data-retention cron — daily
// 1) Anonymize IPs in security_events older than 30 days (mask last octet)
// 2) Delete audits older than 12 months (Speicherbegrenzung Art 5 lit. e)
// 3) Delete security_events older than 90 days (after IP anon, content useless)
//
// Usage: node scripts/dsgvo-cleanup.js [--dry-run]

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TG_TOKEN = process.env.TG_LENNOX_BOT_TOKEN;
const TG_CHAT = process.env.TG_CARLOS_CHAT_ID;
const DRY = process.argv.includes('--dry-run');

async function sb(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

function anonymizeIp(ip) {
  if (!ip) return '';
  // IPv4: mask last octet
  if (/^\d+\.\d+\.\d+\.\d+/.test(ip)) {
    return ip.replace(/\.\d+$/, '.0');
  }
  // IPv6: mask last 80 bits (keep /48)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + '::';
  }
  return 'anonymized';
}

async function tg(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' })
  });
}

async function main() {
  const summary = [];
  const cutoffs = {
    ipAnonymize: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    auditsDelete: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    securityEventsDelete: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  };

  // 1) Anonymize IPs in security_events older than 30 days
  const { data: oldEvents } = await sb('GET', `/security_events?created_at=lt.${cutoffs.ipAnonymize}&ip_anonymized=eq.false&select=id,ip&limit=500`);
  let anonymized = 0;
  if (Array.isArray(oldEvents) && oldEvents.length > 0) {
    for (const ev of oldEvents) {
      const anon = anonymizeIp(ev.ip);
      if (!DRY) {
        await sb('PATCH', `/security_events?id=eq.${ev.id}`, { ip: anon, ip_anonymized: true });
      }
      anonymized++;
    }
  }
  summary.push(`IP-anon: ${anonymized}`);

  // 2) Delete audits older than 12 months (only if status in (closed_won, closed_lost) — keep active)
  const { data: oldAudits } = await sb('GET', `/audits?created_at=lt.${cutoffs.auditsDelete}&status=in.(closed_won,closed_lost)&select=id&limit=100`);
  let auditsDeleted = 0;
  if (Array.isArray(oldAudits) && oldAudits.length > 0) {
    if (!DRY) {
      const ids = oldAudits.map(a => a.id).join(',');
      await sb('DELETE', `/audits?id=in.(${ids})`);
    }
    auditsDeleted = oldAudits.length;
  }
  summary.push(`audits-deleted: ${auditsDeleted}`);

  // 3) Delete security_events older than 90 days
  const { data: oldSec } = await sb('GET', `/security_events?created_at=lt.${cutoffs.securityEventsDelete}&select=id&limit=500`);
  let secDeleted = 0;
  if (Array.isArray(oldSec) && oldSec.length > 0) {
    if (!DRY) {
      const ids = oldSec.map(e => e.id).join(',');
      await sb('DELETE', `/security_events?id=in.(${ids})`);
    }
    secDeleted = oldSec.length;
  }
  summary.push(`sec-events-deleted: ${secDeleted}`);

  console.log(`[dsgvo-cleanup] ${DRY ? 'DRY-RUN ' : ''}${summary.join(' | ')}`);
  // Only send TG if real action happened
  if (!DRY && (anonymized + auditsDeleted + secDeleted) > 0) {
    await tg(`🧹 *DSGVO Daily Cleanup*\n${summary.map(s => `• ${s}`).join('\n')}`);
  }
}

main().catch(err => {
  console.error('[dsgvo-cleanup] ERR:', err);
  process.exit(1);
});
