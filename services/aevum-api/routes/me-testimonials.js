// /api/me/testimonial — Customer self-service Permission-Management fuer
// die public Case-Page. Wave E4 (V2-Master §11).
//
// Brand-Memory: Anti-Fake-it. Default fuer alles sensible = OFF.
// Jeder Permission-Change wird in testimonial_consent_log audited.
//
// GET    /api/me/testimonial   — eigene case_page + letzte 10 Audit-Eintraege
// PATCH  /api/me/testimonial   — Permissions/Quote/Author updaten (+ log)

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { anonymizeIp } from '../lib/security.js';

export const meTestimonialsRouter = Router();

// Felder die der Customer selbst aendern darf
const PERMISSION_FIELDS = [
  'allow_show_brand_name',
  'allow_show_logo',
  'allow_show_testimonial',
  'allow_show_services',
  'allow_show_collaboration_story',
  'allow_show_vision',
  'show_revenue',
  'show_users',
  'show_growth'
];

const CONTENT_FIELDS = [
  'testimonial_quote',
  'testimonial_author'
];

const PatchSchema = z.object({
  // Permissions
  allow_show_brand_name:          z.boolean().optional(),
  allow_show_logo:                z.boolean().optional(),
  allow_show_testimonial:         z.boolean().optional(),
  allow_show_services:            z.boolean().optional(),
  allow_show_collaboration_story: z.boolean().optional(),
  allow_show_vision:              z.boolean().optional(),
  show_revenue:                   z.boolean().optional(),
  show_users:                     z.boolean().optional(),
  show_growth:                    z.boolean().optional(),
  // Content
  testimonial_quote:              z.string().max(500).nullable().optional(),
  testimonial_author:             z.string().max(200).nullable().optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0]?.trim() : null)
    || req.ip
    || null;
}

// ────────────────────────────────────────────────────────────
// GET /api/me/testimonial
// ────────────────────────────────────────────────────────────
meTestimonialsRouter.get('/', async (req, res) => {
  const accountId = req.customer.account_id;

  const r = await supabase.select(
    'case_pages',
    `select=*&account_id=eq.${accountId}&limit=1`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });

  const casePage = r.data?.[0] ?? null;

  let auditLog = [];
  if (casePage?.id) {
    const log = await supabase.select(
      'testimonial_consent_log',
      `select=id,changed_by,changed_field,old_value,new_value,ts&case_page_id=eq.${casePage.id}&order=ts.desc&limit=10`
    );
    if (log.ok) auditLog = log.data ?? [];
  }

  res.json({
    ok: true,
    case_page: casePage,
    has_case_page: !!casePage,
    audit_log: auditLog
  });
});

// ────────────────────────────────────────────────────────────
// PATCH /api/me/testimonial
// ────────────────────────────────────────────────────────────
meTestimonialsRouter.patch('/', async (req, res) => {
  const parsed = PatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const accountId = req.customer.account_id;
  const patch = parsed.data;

  // Existing case_page laden — Customer kann nur eigene aendern
  const existing = await supabase.select(
    'case_pages',
    `select=*&account_id=eq.${accountId}&limit=1`
  );
  if (!existing.ok) return res.status(500).json({ ok: false, error: existing.error });
  const current = existing.data?.[0];
  if (!current) {
    return res.status(404).json({ ok: false, error: 'case_page_not_found', hint: 'Carlos muss erst einen Case-Page-Stub fuer diesen Account anlegen.' });
  }

  // Diff bilden — nur wirklich geaenderte Felder loggen
  const changes = [];
  for (const k of Object.keys(patch)) {
    const oldV = current[k];
    const newV = patch[k];
    if (oldV !== newV) {
      changes.push({ field: k, old: oldV, new: newV });
    }
  }

  if (changes.length === 0) {
    return res.json({ ok: true, case_page: current, changes: 0, note: 'no_changes' });
  }

  // Update mit consent-Timestamp wenn Permission-Felder geaendert wurden
  const touchedPerm = changes.some(c => PERMISSION_FIELDS.includes(c.field));
  const updatePayload = { ...patch };
  if (touchedPerm) {
    updatePayload.consent_signed_at = new Date().toISOString();
    updatePayload.consent_signed_by = req.customer.account_slug || req.customer.email || 'customer';
  }

  const upd = await supabase.update('case_pages', `id=eq.${current.id}`, updatePayload);
  if (!upd.ok) return res.status(500).json({ ok: false, error: upd.error });

  // Audit-Log eintraege (eine Zeile pro Feld)
  const ipAnon = anonymizeIp(clientIp(req)) || null;
  const logRows = changes.map(c => ({
    case_page_id:  current.id,
    account_id:    accountId,
    changed_by:    'customer',
    changed_field: c.field,
    old_value:     c.old === undefined ? null : JSON.stringify(c.old),
    new_value:     c.new === undefined ? null : JSON.stringify(c.new),
    ip_anonymized: ipAnon
  }));

  // Bulk-Insert Audit-Trail — soft-fail
  const logRes = await supabase.insert('testimonial_consent_log', logRows);
  if (!logRes.ok) {
    console.warn('[testimonials] audit log insert failed:', logRes.error);
  }

  res.json({
    ok: true,
    case_page: upd.data?.[0],
    changes: changes.length,
    consent_signed_at: updatePayload.consent_signed_at ?? current.consent_signed_at
  });
});
