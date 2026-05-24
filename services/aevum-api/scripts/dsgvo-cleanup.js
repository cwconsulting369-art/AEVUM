#!/usr/bin/env node
// DSGVO data-retention cron — daily
//
// Runs once per day (cron entry: 30 3 * * *).
//
// Actions:
//  1) Anonymize IPs in security_events older than 30 days (mask last octet)
//  1b) Anonymize IPs in audit_logs older than 30 days
//  2) Delete closed audits (closed_won/closed_lost) older than 12 months
//  3) Delete security_events older than 90 days
//  4) Delete audit_logs older than 12 months (Art 30 retention window)
//  5) Delete abandoned orders (pending/cancelled/failed) older than 30 days
//  6) Hard-delete records past dsgvo_deletion_due (set by retention triggers / erasure flow)
//  7) Delete withdrawn consents older than 2 years (Art 7 burden-of-proof window)
//  8) Delete helpbot_conversations rows whose last_msg_at is older than 30 days
//     (anonymous AI-chat retention — DSGVO Art 5(1)(e) data minimization)
//  9) Wave H4: Delete agent_usage_log rows older than 90 days (cost-tracking retention)
// 10) Wave H4: Delete script_factory_runs older than 30 days after finished_at (auto-purge)
// 11) Wave H4: Delete dsgvo_factory_runs older than 30 days after finished_at (auto-purge)
// 12) Wave H4: Delete lead_magnet_signups older than 180 days (DSGVO data-min)
// 13) Wave H4: Delete saas_waitlist rows older than 30 days after notified_at (purge after notify)
// 14) Wave H4: Delete used magic_link/dsgvo_challenge rows older than 24h
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
  if (/^\d+\.\d+\.\d+\.\d+/.test(ip)) {
    return ip.replace(/\.\d+$/, '.0');
  }
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
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const cutoffs = {
    ipAnonymize:          new Date(now -  30 * day).toISOString(),
    auditsDelete:         new Date(now - 365 * day).toISOString(),
    securityEventsDelete: new Date(now -  90 * day).toISOString(),
    auditLogsDelete:      new Date(now - 365 * day).toISOString(),
    ordersAbandonDelete:  new Date(now -  30 * day).toISOString(),
    consentLogDelete:     new Date(now - 730 * day).toISOString(),
    helpbotDelete:        new Date(now -  30 * day).toISOString(),
    // Wave H4
    usageLogDelete:       new Date(now -  90 * day).toISOString(),
    factoryRunDelete:     new Date(now -  30 * day).toISOString(),
    leadMagnetDelete:     new Date(now - 180 * day).toISOString(),
    waitlistDelete:       new Date(now -  30 * day).toISOString(),
    magicLinkDelete:      new Date(now -   1 * day).toISOString()
  };
  const nowIso = new Date(now).toISOString();

  // 1) Anonymize IPs in security_events
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
  summary.push(`sec-events ip-anon: ${anonymized}`);

  // 1b) Anonymize IPs in audit_logs
  const { data: oldAuditLogs } = await sb('GET', `/audit_logs?created_at=lt.${cutoffs.ipAnonymize}&ip_anonymized=eq.false&ip=not.is.null&select=id,ip&limit=500`);
  let auditIpAnon = 0;
  if (Array.isArray(oldAuditLogs) && oldAuditLogs.length > 0) {
    for (const ev of oldAuditLogs) {
      const anon = anonymizeIp(ev.ip);
      if (!DRY) {
        await sb('PATCH', `/audit_logs?id=eq.${ev.id}`, { ip: anon, ip_anonymized: true });
      }
      auditIpAnon++;
    }
  }
  summary.push(`audit-logs ip-anon: ${auditIpAnon}`);

  // 2) Delete closed audits older than 12 months
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

  // 3) Delete old security_events
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

  // 4) Delete old audit_logs
  const { data: oldAuditLogsDel } = await sb('GET', `/audit_logs?created_at=lt.${cutoffs.auditLogsDelete}&select=id&limit=500`);
  let auditLogsDeleted = 0;
  if (Array.isArray(oldAuditLogsDel) && oldAuditLogsDel.length > 0) {
    if (!DRY) {
      const ids = oldAuditLogsDel.map(e => e.id).join(',');
      await sb('DELETE', `/audit_logs?id=in.(${ids})`);
    }
    auditLogsDeleted = oldAuditLogsDel.length;
  }
  summary.push(`audit-logs-deleted: ${auditLogsDeleted}`);

  // 5) Delete abandoned orders
  const { data: oldAbandoned } = await sb('GET', `/orders?created_at=lt.${cutoffs.ordersAbandonDelete}&status=in.(pending,cancelled,failed)&select=id&limit=200`);
  let ordersAbandonedDeleted = 0;
  if (Array.isArray(oldAbandoned) && oldAbandoned.length > 0) {
    if (!DRY) {
      const ids = oldAbandoned.map(o => o.id).join(',');
      await sb('DELETE', `/orders?id=in.(${ids})`);
    }
    ordersAbandonedDeleted = oldAbandoned.length;
  }
  summary.push(`orders-abandoned-deleted: ${ordersAbandonedDeleted}`);

  // 6) Hard-delete records past dsgvo_deletion_due
  const { data: dueAudits } = await sb('GET', `/audits?dsgvo_deletion_due=lt.${nowIso}&select=id&limit=100`);
  let dueAuditsDeleted = 0;
  if (Array.isArray(dueAudits) && dueAudits.length > 0) {
    if (!DRY) {
      const ids = dueAudits.map(a => a.id).join(',');
      await sb('DELETE', `/audits?id=in.(${ids})`);
    }
    dueAuditsDeleted = dueAudits.length;
  }
  summary.push(`due-audits-deleted: ${dueAuditsDeleted}`);

  const { data: dueOrders } = await sb('GET', `/orders?dsgvo_deletion_due=lt.${nowIso}&select=id&limit=100`);
  let dueOrdersDeleted = 0;
  if (Array.isArray(dueOrders) && dueOrders.length > 0) {
    if (!DRY) {
      const ids = dueOrders.map(o => o.id).join(',');
      await sb('DELETE', `/orders?id=in.(${ids})`);
    }
    dueOrdersDeleted = dueOrders.length;
  }
  summary.push(`due-orders-deleted: ${dueOrdersDeleted}`);

  // 7) Delete withdrawn consents older than 2 years
  const { data: oldConsents } = await sb('GET', `/consent_log?withdrawn_at=lt.${cutoffs.consentLogDelete}&select=id&limit=200`);
  let consentsDeleted = 0;
  if (Array.isArray(oldConsents) && oldConsents.length > 0) {
    if (!DRY) {
      const ids = oldConsents.map(c => c.id).join(',');
      await sb('DELETE', `/consent_log?id=in.(${ids})`);
    }
    consentsDeleted = oldConsents.length;
  }
  summary.push(`old-withdrawn-consents-deleted: ${consentsDeleted}`);

  // 8) Delete helpbot_conversations older than 30 days (anonymous AI-chat retention)
  const { data: oldHelpbot } = await sb('GET', `/helpbot_conversations?last_msg_at=lt.${cutoffs.helpbotDelete}&select=id&limit=500`);
  let helpbotDeleted = 0;
  if (Array.isArray(oldHelpbot) && oldHelpbot.length > 0) {
    if (!DRY) {
      const ids = oldHelpbot.map(h => h.id).join(',');
      await sb('DELETE', `/helpbot_conversations?id=in.(${ids})`);
    }
    helpbotDeleted = oldHelpbot.length;
  }
  summary.push(`helpbot-conv-deleted: ${helpbotDeleted}`);

  // ─── Wave H4: extended cleanup for SaaS / Factory / Lead-Magnet tables ───

  // 9) agent_usage_log older than 90 days
  let usageLogDeleted = 0;
  try {
    const { data: oldUsage } = await sb('GET', `/agent_usage_log?created_at=lt.${cutoffs.usageLogDelete}&select=id&limit=500`);
    if (Array.isArray(oldUsage) && oldUsage.length > 0) {
      if (!DRY) {
        const ids = oldUsage.map(u => u.id).join(',');
        await sb('DELETE', `/agent_usage_log?id=in.(${ids})`);
      }
      usageLogDeleted = oldUsage.length;
    }
  } catch (e) { /* table may not exist yet */ }
  summary.push(`usage-log-deleted: ${usageLogDeleted}`);

  // 10) script_factory_runs older than 30 days after finished_at
  let scriptRunsDeleted = 0;
  try {
    const { data: oldScript } = await sb('GET', `/script_factory_runs?finished_at=lt.${cutoffs.factoryRunDelete}&finished_at=not.is.null&select=id&limit=200`);
    if (Array.isArray(oldScript) && oldScript.length > 0) {
      if (!DRY) {
        const ids = oldScript.map(r => r.id).join(',');
        await sb('DELETE', `/script_factory_runs?id=in.(${ids})`);
      }
      scriptRunsDeleted = oldScript.length;
    }
  } catch (e) { /* table may not exist */ }
  summary.push(`script-runs-deleted: ${scriptRunsDeleted}`);

  // 11) dsgvo_factory_runs older than 30 days
  let dsgvoRunsDeleted = 0;
  try {
    const { data: oldDsgvo } = await sb('GET', `/dsgvo_factory_runs?finished_at=lt.${cutoffs.factoryRunDelete}&finished_at=not.is.null&select=id&limit=200`);
    if (Array.isArray(oldDsgvo) && oldDsgvo.length > 0) {
      if (!DRY) {
        const ids = oldDsgvo.map(r => r.id).join(',');
        await sb('DELETE', `/dsgvo_factory_runs?id=in.(${ids})`);
      }
      dsgvoRunsDeleted = oldDsgvo.length;
    }
  } catch (e) { /* table may not exist */ }
  summary.push(`dsgvo-runs-deleted: ${dsgvoRunsDeleted}`);

  // 12) lead_magnet_signups older than 180 days
  let leadMagnetDeleted = 0;
  try {
    const { data: oldLead } = await sb('GET', `/lead_magnet_signups?created_at=lt.${cutoffs.leadMagnetDelete}&select=id&limit=500`);
    if (Array.isArray(oldLead) && oldLead.length > 0) {
      if (!DRY) {
        const ids = oldLead.map(r => r.id).join(',');
        await sb('DELETE', `/lead_magnet_signups?id=in.(${ids})`);
      }
      leadMagnetDeleted = oldLead.length;
    }
  } catch (e) { /* table may not exist */ }
  summary.push(`lead-magnets-deleted: ${leadMagnetDeleted}`);

  // 13) saas_waitlist older than 30 days after notified_at
  let waitlistDeleted = 0;
  try {
    const { data: oldWait } = await sb('GET', `/saas_waitlist?notified_at=lt.${cutoffs.waitlistDelete}&notified_at=not.is.null&select=id&limit=500`);
    if (Array.isArray(oldWait) && oldWait.length > 0) {
      if (!DRY) {
        const ids = oldWait.map(r => r.id).join(',');
        await sb('DELETE', `/saas_waitlist?id=in.(${ids})`);
      }
      waitlistDeleted = oldWait.length;
    }
  } catch (e) { /* table may not exist */ }
  summary.push(`waitlist-deleted: ${waitlistDeleted}`);

  // 14) Magic-link consumed-tokens cleanup (>24h after used)
  let magicCleaned = 0;
  try {
    const { data: oldMagic } = await sb('GET', `/dsgvo_challenge?used_at=lt.${cutoffs.magicLinkDelete}&used_at=not.is.null&select=token_hash&limit=500`);
    if (Array.isArray(oldMagic) && oldMagic.length > 0) {
      if (!DRY) {
        const hashes = oldMagic.map(m => `"${m.token_hash}"`).join(',');
        await sb('DELETE', `/dsgvo_challenge?token_hash=in.(${hashes})`);
      }
      magicCleaned = oldMagic.length;
    }
  } catch (e) { /* table may not exist */ }
  summary.push(`magic-link-cleaned: ${magicCleaned}`);

  console.log(`[dsgvo-cleanup] ${DRY ? 'DRY-RUN ' : ''}${summary.join(' | ')}`);
  const totalActions = anonymized + auditIpAnon + auditsDeleted + secDeleted +
    auditLogsDeleted + ordersAbandonedDeleted + dueAuditsDeleted + dueOrdersDeleted + consentsDeleted + helpbotDeleted +
    usageLogDeleted + scriptRunsDeleted + dsgvoRunsDeleted + leadMagnetDeleted + waitlistDeleted + magicCleaned;
  if (!DRY && totalActions > 0) {
    await tg(`🧹 *DSGVO Daily Cleanup (AEVUM)*\n${summary.map(s => `• ${s}`).join('\n')}`);
  }
}

main().catch(err => {
  console.error('[dsgvo-cleanup] ERR:', err);
  process.exit(1);
});
