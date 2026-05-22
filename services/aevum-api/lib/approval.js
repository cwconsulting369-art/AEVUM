// lib/approval.js — Lennox-side helper for sync-feeling async approvals
//
// Usage from any Lennox script:
//
//   import { requestApproval } from './lib/approval.js';
//   const decision = await requestApproval({
//     action:      'merge_branch',
//     description: 'Merge feat/X into main',
//     context:     { branch: 'feat/X' }
//   });
//   if (decision.approved) { /* proceed */ }
//
// Resolves once the row leaves 'pending' (approved/denied/expired).
// Rejects on timeout.
//
// ENV required:
//   AEVUM_API_BASE      default https://api.aevum-system.de
//   AEVUM_ADMIN_TOKEN   admin token (or pass as opts.adminToken)

const DEFAULT_BASE = process.env.AEVUM_API_BASE || 'https://api.aevum-system.de';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function requestApproval(opts = {}) {
  const {
    action,
    description,
    context = {},
    ttlHours = 24,
    pollIntervalMs = 5000,
    timeoutMs = 24 * 60 * 60 * 1000,
    apiBase = DEFAULT_BASE,
    adminToken = process.env.AEVUM_ADMIN_TOKEN,
    onPending = null,  // optional callback (id) → void
  } = opts;

  if (!action || !description) {
    throw new Error('requestApproval: action + description required');
  }
  if (!adminToken) {
    throw new Error('requestApproval: AEVUM_ADMIN_TOKEN missing');
  }

  // 1. POST /api/approval/request
  const reqRes = await fetch(`${apiBase}/api/approval/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-aevum-admin-token': adminToken
    },
    body: JSON.stringify({ action, description, context, ttl_hours: ttlHours })
  });
  if (!reqRes.ok) {
    const txt = await reqRes.text();
    throw new Error(`requestApproval: create failed HTTP ${reqRes.status}: ${txt.slice(0,200)}`);
  }
  const { id, expires_at } = await reqRes.json();
  if (!id) throw new Error('requestApproval: no id returned');
  if (typeof onPending === 'function') {
    try { onPending(id); } catch { /* swallow */ }
  }

  // 2. Poll /api/approval/:id
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(pollIntervalMs);
    let pollRes;
    try {
      pollRes = await fetch(`${apiBase}/api/approval/${encodeURIComponent(id)}`, {
        headers: { 'x-aevum-admin-token': adminToken }
      });
    } catch (e) {
      // Network blip — keep polling
      console.warn('[approval] poll network error:', e?.message);
      continue;
    }
    if (!pollRes.ok) {
      const txt = await pollRes.text();
      console.warn(`[approval] poll HTTP ${pollRes.status}: ${txt.slice(0,200)}`);
      continue;
    }
    const body = await pollRes.json();
    const row = body.approval;
    if (!row) continue;

    if (row.status === 'pending') {
      // Server-side auto-expire: check expires_at
      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        return {
          id,
          approved: false,
          status: 'expired',
          decided_by: 'auto-expire',
          notes: null,
          row
        };
      }
      continue;
    }

    return {
      id,
      approved: row.status === 'approved',
      status: row.status,
      decided_by: row.decided_by,
      notes: row.notes,
      row
    };
  }

  throw new Error(`requestApproval: timeout after ${timeoutMs}ms (id=${id}, expires_at=${expires_at})`);
}

export default { requestApproval };
