#!/usr/bin/env node
// AEVUM Security Digest — runs hourly via cron
// Reads security_events from last hour, summarizes, alerts Carlos if action needed
//
// Usage: node scripts/security-digest.js [--window-hours=1]

import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TG_TOKEN = process.env.TG_LENNOX_BOT_TOKEN;
const TG_CHAT = process.env.TG_CARLOS_CHAT_ID;

const WINDOW_HOURS = parseFloat(
  (process.argv.find(a => a.startsWith('--window-hours=')) || '').split('=')[1] || '1'
);

const ALERT_THRESHOLDS = {
  total: 20,            // > 20 blocks/hour = active attack
  unique_ips: 5,        // > 5 different IPs attacking = distributed
  attack_pattern: 3,    // > 3 code-injection attempts = targeted
};

async function fetchEvents() {
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const url = `${SUPABASE_URL}/rest/v1/security_events?created_at=gte.${since}&select=event_type,reason,ip,user_agent,endpoint,created_at&order=created_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json();
}

function analyze(events) {
  const byType = {};
  const byIp = {};
  const byEndpoint = {};
  const userAgents = new Set();

  for (const e of events) {
    byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    byIp[e.ip] = (byIp[e.ip] || 0) + 1;
    byEndpoint[e.endpoint] = (byEndpoint[e.endpoint] || 0) + 1;
    if (e.user_agent) userAgents.add(e.user_agent.slice(0, 60));
  }

  const topIps = Object.entries(byIp).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const uniqueIps = Object.keys(byIp).length;

  return {
    total: events.length,
    byType,
    topIps,
    uniqueIps,
    byEndpoint,
    userAgents: [...userAgents].slice(0, 3),
    sample: events.slice(0, 3)
  };
}

function decideAlert(stats) {
  const reasons = [];
  if (stats.total >= ALERT_THRESHOLDS.total) reasons.push(`${stats.total} blocks > ${ALERT_THRESHOLDS.total}`);
  if (stats.uniqueIps >= ALERT_THRESHOLDS.unique_ips) reasons.push(`${stats.uniqueIps} unique IPs (distributed)`);
  if ((stats.byType.attack_pattern || 0) >= ALERT_THRESHOLDS.attack_pattern) {
    reasons.push(`${stats.byType.attack_pattern} code-injection attempts (targeted)`);
  }
  return reasons;
}

function formatMessage(stats, alertReasons) {
  const header = alertReasons.length > 0
    ? '🚨 *AEVUM Security Alert*'
    : '🛡 *AEVUM Security Digest*';

  const lines = [
    header,
    `_Window: last ${WINDOW_HOURS}h_`,
    ``,
    `*Total Blocks:* ${stats.total}`,
    `*Unique IPs:* ${stats.uniqueIps}`,
  ];

  if (stats.total > 0) {
    lines.push(``, `*By Type:*`);
    for (const [type, count] of Object.entries(stats.byType).sort((a,b)=>b[1]-a[1])) {
      lines.push(`  • ${type}: ${count}`);
    }

    if (stats.topIps.length > 0) {
      lines.push(``, `*Top IPs:*`);
      stats.topIps.forEach(([ip, count]) => {
        lines.push(`  • \`${ip}\` (${count}x)`);
      });
    }
  }

  if (alertReasons.length > 0) {
    lines.push(``, `*Alert Reasons:*`);
    alertReasons.forEach(r => lines.push(`  ⚠ ${r}`));
    lines.push(``, `→ Check Supabase security_events für Details`);
  }

  return lines.join('\n');
}

async function sendTg(text) {
  if (!TG_TOKEN || !TG_CHAT) {
    console.log('TG not configured');
    console.log(text);
    return;
  }
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    })
  });
}

async function main() {
  try {
    const events = await fetchEvents();
    const stats = analyze(events);
    const alertReasons = decideAlert(stats);

    // Send digest if: alert reasons OR significant activity (>=3 blocks)
    if (alertReasons.length > 0 || stats.total >= 3) {
      const message = formatMessage(stats, alertReasons);
      await sendTg(message);
      console.log('[digest] sent — total:', stats.total, 'alerts:', alertReasons.length);
    } else {
      console.log('[digest] quiet — total:', stats.total, '(no message)');
    }
  } catch (err) {
    console.error('[digest] ERR:', err.message);
    await sendTg(`⚠ *Security Digest crashed:* \`${err.message}\``);
    process.exit(1);
  }
}

main();
