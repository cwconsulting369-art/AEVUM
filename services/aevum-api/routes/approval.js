// /api/approval — Lennox ↔ Carlos async decision channel
//
// Endpoints (all admin-token-gated):
//   POST   /api/approval/request          create approval + push TG to Carlos
//   GET    /api/approval                  list pending + last 20 decided
//   GET    /api/approval/:id              fetch single row
//   POST   /api/approval/:id/decide       set approved/denied (idempotent)
//
// Short-IDs: A1, A2, ... numeric counter scanned from existing rows.
// Idempotency: decide-route is no-op when status already matches; status
//              transitions out of 'pending' only.

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';

export const approvalRouter = Router();

// ──────────────────────────────────────────────────────────
// Admin auth gate (same pattern as routes/accounts.js)
// ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) {
    return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  }
  if (!tok || tok !== expected) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// ──────────────────────────────────────────────────────────
// Short-ID generator (A1, A2, ...) — finds next free
// Also allows callers to supply a specific id (e.g. "TEST1") for smoke tests.
// ──────────────────────────────────────────────────────────
async function nextApprovalId() {
  // Pull ids matching A<number>, find max, +1.
  const r = await supabase.select(
    'pending_approvals',
    'select=id&id=like.A*&order=id.desc&limit=200'
  );
  if (!r.ok) {
    // Fallback to timestamp-based id if select fails — never block on this.
    return 'A' + Date.now().toString(36).toUpperCase();
  }
  let maxN = 0;
  for (const row of (r.data || [])) {
    const m = /^A(\d+)$/.exec(row.id);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxN) maxN = n;
    }
  }
  return `A${maxN + 1}`;
}

// ──────────────────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────────────────
const RequestSchema = z.object({
  id:          z.string().regex(/^[A-Z][A-Z0-9]*\d+$|^[A-Z]+\d+$/).optional(),
  action:      z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  context:     z.record(z.any()).optional().default({}),
  ttl_hours:   z.number().positive().max(24 * 30).optional()
});

const DecideSchema = z.object({
  decision:   z.enum(['approved', 'denied']),
  decided_by: z.string().max(60).optional(),
  notes:      z.string().max(2000).optional()
});

// ──────────────────────────────────────────────────────────
// POST /api/approval/request
// ──────────────────────────────────────────────────────────
approvalRouter.post('/request', requireAdmin, async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const { action, description, context, ttl_hours } = parsed.data;
  const explicitId = parsed.data.id;

  const id = explicitId || await nextApprovalId();
  const expiresAt = new Date(Date.now() + (ttl_hours ?? 24) * 3600 * 1000).toISOString();

  const row = {
    id,
    action,
    description,
    context: context || {},
    expires_at: expiresAt,
    status: 'pending'
  };

  const ins = await supabase.insert('pending_approvals', row);
  if (!ins.ok) {
    // 409 = id collision; surface clearly
    if (ins.status === 409 || JSON.stringify(ins.error || '').includes('duplicate')) {
      return res.status(409).json({ ok: false, error: 'id_already_exists', id });
    }
    return res.status(500).json({ ok: false, error: ins.error });
  }

  // TG push — non-blocking (errors logged in notifyCarlos)
  const msg =
    `🟡 *Approval needed* — \`${id}\`\n` +
    `*Action:* ${description}\n` +
    `Reply: \`approve ${id}\` or \`deny ${id}\``;
  notifyCarlos(msg).catch(e => console.error('[approval] TG push failed:', e?.message));

  res.status(201).json({ ok: true, id, expires_at: expiresAt });
});

// ──────────────────────────────────────────────────────────
// GET /api/approval — list pending + last 20 decided
// ──────────────────────────────────────────────────────────
approvalRouter.get('/', requireAdmin, async (_req, res) => {
  const [pending, recent] = await Promise.all([
    supabase.select('pending_approvals', 'select=*&status=eq.pending&order=requested_at.desc'),
    supabase.select('pending_approvals', 'select=*&status=neq.pending&order=decided_at.desc.nullslast&limit=20')
  ]);
  if (!pending.ok) return res.status(500).json({ ok: false, error: pending.error });
  if (!recent.ok)  return res.status(500).json({ ok: false, error: recent.error });
  res.json({ ok: true, pending: pending.data || [], recent: recent.data || [] });
});

// ──────────────────────────────────────────────────────────
// GET /api/approval/:id
// ──────────────────────────────────────────────────────────
approvalRouter.get('/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const r = await supabase.select(
    'pending_approvals',
    `select=*&id=eq.${encodeURIComponent(id)}`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'not_found' });
  res.json({ ok: true, approval: r.data[0] });
});

// ──────────────────────────────────────────────────────────
// POST /api/approval/:id/decide
// Idempotent: only updates rows still in 'pending'.
// ──────────────────────────────────────────────────────────
approvalRouter.post('/:id/decide', requireAdmin, async (req, res) => {
  const parsed = DecideSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const id = req.params.id;
  const { decision, decided_by, notes } = parsed.data;

  // Read current state first
  const cur = await supabase.select(
    'pending_approvals',
    `select=*&id=eq.${encodeURIComponent(id)}`
  );
  if (!cur.ok) return res.status(500).json({ ok: false, error: cur.error });
  if (!cur.data?.length) return res.status(404).json({ ok: false, error: 'not_found' });

  const current = cur.data[0];
  if (current.status !== 'pending') {
    // Idempotency: same decision → 200, different → 409 conflict
    if (current.status === decision) {
      return res.json({ ok: true, approval: current, idempotent: true });
    }
    return res.status(409).json({
      ok: false,
      error: 'already_decided',
      current_status: current.status
    });
  }

  const patch = {
    status: decision,
    decided_at: new Date().toISOString(),
    decided_by: decided_by || 'carlos',
    notes: notes || null
  };
  const upd = await supabase.update(
    'pending_approvals',
    `id=eq.${encodeURIComponent(id)}&status=eq.pending`,
    patch
  );
  if (!upd.ok) return res.status(500).json({ ok: false, error: upd.error });
  if (!upd.data?.length) {
    // Race: someone else decided between read and update
    const after = await supabase.select(
      'pending_approvals',
      `select=*&id=eq.${encodeURIComponent(id)}`
    );
    return res.status(409).json({
      ok: false,
      error: 'race_already_decided',
      current_status: after.data?.[0]?.status
    });
  }

  res.json({ ok: true, approval: upd.data[0] });
});
