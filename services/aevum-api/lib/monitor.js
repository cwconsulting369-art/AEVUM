// Security monitoring — log blocked attempts + TG-alert on attack patterns
import { supabase } from './supabase.js';
import { notifyCarlos } from './tg-notify.js';

const ALERT_THRESHOLD = 5;       // 5 blocks → alert
const ALERT_WINDOW_MS = 5 * 60 * 1000;  // within 5 minutes
const recentBlocks = [];  // in-memory rolling list

export async function logBlock(event) {
  // event: { type, reason, ip, user_agent, payload_summary, endpoint }
  console.log(`[BLOCK] ${event.type} from ${event.ip} — ${event.reason}`);

  // Persist to security_events table (fire-and-forget)
  supabase.insert('security_events', {
    event_type: event.type,
    reason: event.reason,
    ip: event.ip || '',
    user_agent: event.user_agent || '',
    endpoint: event.endpoint || '',
    payload_summary: event.payload_summary || null
  }).catch(err => console.error('security_events insert fail:', err));

  // Rolling block-counter for alert threshold
  const now = Date.now();
  recentBlocks.push(now);
  while (recentBlocks.length && recentBlocks[0] < now - ALERT_WINDOW_MS) {
    recentBlocks.shift();
  }

  // Trigger alert if threshold crossed (only once per window — cooldown via last alert time)
  if (recentBlocks.length === ALERT_THRESHOLD) {
    const msg = [
      `🚨 *SECURITY ALERT — AEVUM API*`,
      ``,
      `${ALERT_THRESHOLD} Block-Events in den letzten ${ALERT_WINDOW_MS / 60000} Minuten.`,
      ``,
      `*Letztes Event:*`,
      `Type: \`${event.type}\``,
      `Reason: \`${event.reason}\``,
      `IP: \`${event.ip}\``,
      `Endpoint: \`${event.endpoint}\``,
      ``,
      `→ Check Supabase security_events Tabelle für Details`
    ].join('\n');
    notifyCarlos(msg);
  }
}
