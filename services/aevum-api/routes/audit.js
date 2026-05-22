import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { scanPayload, clean } from '../lib/security.js';
import { logBlock } from '../lib/monitor.js';
import { runAutoPlan } from '../lib/auto-plan.js';

export const auditRouter = Router();

function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip
    || 'unknown';
}

// Current consent text version — bump when Datenschutzerklärung is updated
export const CONSENT_VERSION = 'datenschutz-v1-2026-05-19';

// Validation schema — matches WorkflowAudit.tsx form (v1)
// `website` = honeypot field (visually hidden in form, bots fill it = trap)
const AuditSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  industry: z.string().max(100).optional().default(''),
  teamSize: z.string().max(50).optional().default(''),
  description: z.string().max(5000).optional().default(''),
  timeWasters: z.string().max(5000).optional().default(''),
  tools: z.string().max(2000).optional().default(''),
  budget: z.string().max(100).optional().default(''),
  timeline: z.string().max(100).optional().default(''),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().default(''),
  // DSGVO Art 7 — explicit consent required
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Einwilligung zur Datenverarbeitung erforderlich' })
  }),
  // Honeypot — bots fill it. Accept ANY value but check it in handler (silent fake-success)
  website: z.string().max(500).optional().default(''),
  // Time-based check — form must be open > 3s before submit (bots submit instantly)
  formStartedAt: z.number().optional()
});

// AEVUM v2 audit-form schema — structured answers + file-upload metadata
// Used by aevum-system.de v2 audit form (Kimi-refactored)
const AuditV2Schema = z.object({
  form_version: z.literal('v2'),
  audit_form_blueprint_id: z.string().max(100).optional().default('aevum-audit-v2'),
  // Anti-bot reused
  website: z.string().max(500).optional().default(''),
  formStartedAt: z.number().optional(),
  // Consent
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Einwilligung zur Datenverarbeitung erforderlich' })
  }),
  // Required top-level for indexing + GDPR
  email: z.string().email().max(200),
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  phone: z.string().max(50).optional().default(''),
  // Full structured answers (per AEVUM-V2-SCHEMAS §3)
  answers: z.record(z.any()),
  // Uploaded file metadata only — actual files in Storage Bucket "audit-uploads"
  uploaded_files: z.array(z.object({
    filename: z.string().max(255),
    url: z.string().url().max(1000),
    type: z.string().max(50).optional(),
    size_bytes: z.number().int().nonnegative().optional()
  })).max(5).optional().default([])
});

auditRouter.post('/submit', async (req, res) => {
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';
  const ctx = { ip, user_agent: ua, endpoint: 'POST /api/audit/submit' };

  // ─── v2 detection: route to v2-handler if form_version="v2" present ───
  if (req.body?.form_version === 'v2') {
    return handleAuditV2(req, res, ctx, ip, ua);
  }

  // ─── Layer 1: Schema validation (Zod) — v1 ───
  const parsed = AuditSchema.safeParse(req.body);
  if (!parsed.success) {
    logBlock({ ...ctx, type: 'validation_fail', reason: JSON.stringify(parsed.error.flatten().fieldErrors).slice(0, 200) });
    return res.status(400).json({
      ok: false,
      error: 'validation_failed',
      details: parsed.error.flatten()
    });
  }
  const f = parsed.data;

  // ─── Layer 2: Honeypot — bots fill hidden 'website' field ───
  if (f.website && f.website.length > 0) {
    logBlock({ ...ctx, type: 'honeypot_triggered', reason: `website-field filled: ${f.website.slice(0,100)}` });
    // Silently fake-success so bot doesn't learn it was detected
    return res.json({ ok: true, id: 'simulated-' + Date.now().toString(36) });
  }

  // ─── Layer 3: Time-check — form open at least 3s ───
  if (f.formStartedAt) {
    const elapsed = Date.now() - f.formStartedAt;
    if (elapsed < 3000) {
      logBlock({ ...ctx, type: 'too_fast', reason: `submitted in ${elapsed}ms (min 3000)` });
      return res.json({ ok: true, id: 'simulated-' + Date.now().toString(36) });
    }
  }

  // ─── Layer 4: Pattern-scan for code/script/SQL injection ───
  const attackHits = scanPayload({
    name: f.name, company: f.company, description: f.description,
    timeWasters: f.timeWasters, tools: f.tools, phone: f.phone
  });
  if (attackHits.length > 0) {
    logBlock({
      ...ctx,
      type: 'attack_pattern',
      reason: attackHits.map(h => `${h.field}:${h.reason}`).join('; '),
      payload_summary: `company=${f.company?.slice(0,40)} email=${f.email}`
    });
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  // ─── Sanitize + persist ───
  const consentAt = new Date().toISOString();
  const row = {
    name: clean(f.name),
    company: clean(f.company),
    industry: clean(f.industry),
    team_size: clean(f.teamSize),
    description: clean(f.description),
    time_wasters: clean(f.timeWasters),
    tools: clean(f.tools),
    budget: clean(f.budget),
    timeline: clean(f.timeline),
    email: clean(f.email),
    phone: clean(f.phone),
    consent_version: CONSENT_VERSION,
    consent_at: consentAt,
    meta: {
      user_agent: ua,
      ip,
      form_open_ms: f.formStartedAt ? Date.now() - f.formStartedAt : null
    },
    status: 'new'
  };

  const result = await supabase.insert('audits', row);
  if (!result.ok) {
    console.error('Supabase insert failed:', result.status, result.error);
    return res.status(500).json({ ok: false, error: 'persist_failed' });
  }
  const inserted = Array.isArray(result.data) ? result.data[0] : result.data;

  // Log consent (Art 7 — Nachweis der Einwilligung)
  supabase.insert('consent_log', {
    audit_id: inserted?.id,
    email: clean(f.email),
    consent_type: 'wgm_submission',
    consent_text_version: CONSENT_VERSION,
    ip,
    user_agent: ua
  }).catch(err => console.error('consent_log fail:', err));

  // TG notification — PII-minimized (no full email/phone, only first-name + id + company)
  const idShort = (inserted?.id || 'unknown').slice(0,8);
  const firstName = (f.name || '').split(' ')[0] || 'Anon';
  const emailMasked = f.email.replace(/^(.).+(@.+)$/, '$1***$2');
  const summary = [
    `📋 *Neuer Audit* — \`${idShort}\``,
    `*Firma:* ${f.company}`,
    `*Kontakt:* ${firstName} · ${emailMasked}`,
    f.industry ? `*Branche:* ${f.industry}` : null,
    f.budget ? `*Budget:* ${f.budget}` : null,
    f.timeline ? `*Timeline:* ${f.timeline}` : null,
    '',
    `_Volle Daten in Supabase audits-Tabelle_`
  ].filter(Boolean).join('\n');
  notifyCarlos(summary);

  return res.json({ ok: true, id: inserted?.id });
});

// ─── v2 submit handler ───
async function handleAuditV2(req, res, ctx, ip, ua) {
  const parsed = AuditV2Schema.safeParse(req.body);
  if (!parsed.success) {
    logBlock({ ...ctx, type: 'validation_fail_v2', reason: JSON.stringify(parsed.error.flatten().fieldErrors).slice(0, 200) });
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const f = parsed.data;

  // Honeypot
  if (f.website && f.website.length > 0) {
    logBlock({ ...ctx, type: 'honeypot_triggered_v2' });
    return res.json({ ok: true, id: 'simulated-' + Date.now().toString(36) });
  }
  // Time-check
  if (f.formStartedAt) {
    const elapsed = Date.now() - f.formStartedAt;
    if (elapsed < 3000) {
      logBlock({ ...ctx, type: 'too_fast_v2', reason: `${elapsed}ms` });
      return res.json({ ok: true, id: 'simulated-' + Date.now().toString(36) });
    }
  }
  // Pattern-scan on flat critical fields
  const attackHits = scanPayload({ name: f.name, company: f.company, email: f.email, phone: f.phone });
  if (attackHits.length > 0) {
    logBlock({ ...ctx, type: 'attack_pattern_v2', reason: attackHits.map(h => `${h.field}:${h.reason}`).join('; ') });
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  const consentAt = new Date().toISOString();
  const row = {
    // Legacy required fields (still NOT NULL on table)
    name: clean(f.name),
    company: clean(f.company),
    email: clean(f.email),
    phone: clean(f.phone),
    // v2 structured payload
    answers: f.answers,
    uploaded_files: f.uploaded_files,
    form_version: 'v2',
    audit_form_blueprint_id: f.audit_form_blueprint_id ?? 'aevum-audit-v2',
    consent_version: CONSENT_VERSION,
    consent_at: consentAt,
    meta: {
      user_agent: ua,
      ip,
      form_open_ms: f.formStartedAt ? Date.now() - f.formStartedAt : null,
      submission_type: 'v2'
    },
    status: 'new'
  };

  const result = await supabase.insert('audits', row);
  if (!result.ok) {
    console.error('Supabase insert (v2) failed:', result.status, result.error);
    return res.status(500).json({ ok: false, error: 'persist_failed' });
  }
  const inserted = Array.isArray(result.data) ? result.data[0] : result.data;

  // Consent log
  supabase.insert('consent_log', {
    audit_id: inserted?.id,
    email: clean(f.email),
    consent_type: 'wgm_v2_submission',
    consent_text_version: CONSENT_VERSION,
    ip,
    user_agent: ua
  }).catch(err => console.error('consent_log fail (v2):', err));

  // TG notif
  const idShort = (inserted?.id || 'unknown').slice(0, 8);
  const firstName = (f.name || '').split(' ')[0] || 'Anon';
  const emailMasked = f.email.replace(/^(.).+(@.+)$/, '$1***$2');
  const industry = f.answers?.unternehmen?.industry || f.answers?.industry || null;
  const summary = [
    `📋 *Neuer Audit v2* — \`${idShort}\``,
    `*Firma:* ${f.company}`,
    `*Kontakt:* ${firstName} · ${emailMasked}`,
    industry ? `*Branche:* ${industry}` : null,
    f.uploaded_files?.length ? `*Files:* ${f.uploaded_files.length}` : null,
    '',
    `_Auto-Plan-Workflow startet im nächsten Schritt._`
  ].filter(Boolean).join('\n');
  notifyCarlos(summary);

  // Fire-and-forget Auto-Plan-Engine (async, returns ok to client immediately)
  if (inserted?.id) {
    runAutoPlan(inserted.id).catch(err => console.error('[auto-plan] fire-and-forget failed:', err.message));
  }

  return res.json({ ok: true, id: inserted?.id, form_version: 'v2' });
}

// Helper: maskEmail for TG notifications (PII-min)
function maskEmail(email) {
  return (email || '').replace(/^(.).+(@.+)$/, '$1***$2');
}

// Helper: collect EVERY PII row across all tables for a given email
// Used by both export (Art 15/20) and erasure (Art 17) endpoints
async function collectAllPiiByEmail(email) {
  const cleanEmail = clean(email).toLowerCase();
  const enc = encodeURIComponent(cleanEmail);

  const [audits, orders, consents, erasures, secEvents] = await Promise.all([
    supabase.select('audits', `?email=eq.${enc}&select=*`),
    supabase.select('orders', `?customer_email=eq.${enc}&select=*`),
    supabase.select('consent_log', `?email=eq.${enc}&select=*`),
    supabase.select('erasure_log', `?email=eq.${enc}&select=*`),
    // security_events stored payload_summary may contain email — best effort
    supabase.select('security_events', `?payload_summary=ilike.*${enc}*&select=id,event_type,created_at,reason,ip_anonymized`)
  ]);

  return {
    email: cleanEmail,
    audits: Array.isArray(audits.data) ? audits.data : [],
    orders: Array.isArray(orders.data) ? orders.data : [],
    consent_log: Array.isArray(consents.data) ? consents.data : [],
    erasure_log: Array.isArray(erasures.data) ? erasures.data : [],
    security_events: Array.isArray(secEvents.data) ? secEvents.data : []
  };
}

// ─── DSGVO Art 15/20 — Recht auf Auskunft + Datenportabilität ───
// POST /api/audit/export { email }
// Returns full JSON dump of all PII rows for that email.
// (For unverified self-service: still log + notify Carlos. Carlos can
//  verify ownership manually if disputed — webform is rate-limited.)
auditRouter.post('/export', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email_required' });
  }

  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';

  const dump = await collectAllPiiByEmail(email);
  const totalRows =
    dump.audits.length + dump.orders.length +
    dump.consent_log.length + dump.erasure_log.length +
    dump.security_events.length;

  // Log export request
  supabase.insert('export_requests', {
    email: dump.email,
    requested_via: 'api',
    status: 'completed',
    completed_at: new Date().toISOString(),
    ip,
    user_agent: ua,
    notes: `auto-export: ${totalRows} rows`
  }).catch(() => { /* table may not exist yet — silent */ });

  notifyCarlos(
    `📨 *DSGVO Art 15 Export ausgeführt*\nEmail: \`${maskEmail(dump.email)}\`\nRows: ${totalRows} (audits=${dump.audits.length}, orders=${dump.orders.length}, consents=${dump.consent_log.length})\n_JSON wurde an Anfrager zurückgegeben._`
  );

  return res.json({
    ok: true,
    message: 'Auskunft gemäß Art 15/20 DSGVO. Diese Antwort enthält alle bei uns gespeicherten personenbezogenen Daten.',
    generated_at: new Date().toISOString(),
    consent_text_version: CONSENT_VERSION,
    data: dump
  });
});

// ─── DSGVO Art 17 — Recht auf Löschung ──────────────────────────
// POST /api/audit/erase { email }
// Cascades across audits + orders + consent_log + erasure_log marker
auditRouter.post('/erase', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email_required' });
  }
  const cleanEmail = clean(email).toLowerCase();
  const enc = encodeURIComponent(cleanEmail);
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';

  // Count before delete
  const [auditsResult, ordersResult, consentsResult] = await Promise.all([
    supabase.select('audits', `?email=eq.${enc}&select=id`),
    supabase.select('orders', `?customer_email=eq.${enc}&select=id,status`),
    supabase.select('consent_log', `?email=eq.${enc}&select=id`)
  ]);

  const auditsCount = Array.isArray(auditsResult.data) ? auditsResult.data.length : 0;
  const ordersAll   = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const consentsCount = Array.isArray(consentsResult.data) ? consentsResult.data.length : 0;

  // ── Audits: hard delete (lead data, no legal retention required) ──
  if (auditsCount > 0) {
    await supabase.delete('audits', `?email=eq.${enc}`);
  }

  // ── Orders: HGB §147 = 10y retention for PAID. Only delete pending/cancelled/failed.
  //    For paid orders: pseudonymize PII (keep accounting record).
  const ordersDeletable = ordersAll.filter(o => o.status !== 'paid' && o.status !== 'refunded');
  const ordersPseudo    = ordersAll.filter(o => o.status === 'paid' || o.status === 'refunded');
  let ordersDeleted = 0;
  let ordersPseudonymized = 0;

  if (ordersDeletable.length > 0) {
    const ids = ordersDeletable.map(o => o.id).join(',');
    await supabase.delete('orders', `?id=in.(${ids})`);
    ordersDeleted = ordersDeletable.length;
  }

  if (ordersPseudo.length > 0) {
    const ids = ordersPseudo.map(o => o.id).join(',');
    await supabase.update(
      'orders',
      `?id=in.(${ids})`,
      {
        customer_email: `erased-${Date.now()}@dsgvo.local`,
        customer_name: null,
        customer_company: null,
        ip: null,
        user_agent: null,
        metadata: { dsgvo_erased_at: new Date().toISOString() }
      }
    );
    ordersPseudonymized = ordersPseudo.length;
  }

  // ── consent_log: hard delete remnants (some may already cascade from audits) ──
  await supabase.delete('consent_log', `?email=eq.${enc}`);

  // ── Log the erasure for audit trail ──
  await supabase.insert('erasure_log', {
    email: cleanEmail,
    requested_by: 'self',
    audits_deleted_count: auditsCount,
    consents_deleted_count: consentsCount,
    orders_deleted_count: ordersDeleted,
    ip,
    user_agent: ua,
    notes: `via POST /api/audit/erase; ${ordersPseudonymized} paid orders pseudonymized (HGB §147)`
  });

  notifyCarlos(
    `🗑 *DSGVO Art 17 Löschung ausgeführt*\nEmail: \`${maskEmail(cleanEmail)}\`\n• audits: ${auditsCount} gelöscht\n• orders: ${ordersDeleted} gelöscht, ${ordersPseudonymized} pseudonymisiert (HGB §147)\n• consents: ${consentsCount}\nLog in erasure_log.`
  );

  return res.json({
    ok: true,
    message: 'Ihre Daten wurden gelöscht. Diese Aktion wurde protokolliert (DSGVO Art 17).',
    audits_deleted: auditsCount,
    orders_deleted: ordersDeleted,
    orders_pseudonymized: ordersPseudonymized,
    consents_deleted: consentsCount,
    notice: ordersPseudonymized > 0
      ? `Bezahlte Bestellungen wurden gemäß HGB §147 (10 Jahre Aufbewahrung) pseudonymisiert statt gelöscht. Personenbezogene Felder sind entfernt.`
      : undefined
  });
});

// ─── DSGVO Art 7(3) — Widerruf der Einwilligung ─────────────────
// POST /api/audit/withdraw-consent { email, consent_type? }
// Marks existing consent rows as withdrawn (preserves audit trail).
// Different from erase: data stays, but the consent legal-basis is revoked.
auditRouter.post('/withdraw-consent', async (req, res) => {
  const { email, consent_type } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email_required' });
  }
  const cleanEmail = clean(email).toLowerCase();
  const enc = encodeURIComponent(cleanEmail);
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';

  // Build filter: by email + optional consent_type + only not-yet-withdrawn
  let filter = `?email=eq.${enc}&withdrawn_at=is.null`;
  if (consent_type && typeof consent_type === 'string') {
    filter += `&consent_type=eq.${encodeURIComponent(consent_type)}`;
  }

  const existingResult = await supabase.select('consent_log', filter + '&select=id,consent_type');
  const existing = Array.isArray(existingResult.data) ? existingResult.data : [];

  if (existing.length === 0) {
    return res.json({
      ok: true,
      message: 'Keine aktiven Einwilligungen unter dieser E-Mail gefunden.',
      withdrawn: 0
    });
  }

  // Mark them withdrawn
  await supabase.update('consent_log', filter, {
    withdrawn_at: new Date().toISOString()
  });

  notifyCarlos(
    `🚫 *DSGVO Art 7(3) Widerruf*\nEmail: \`${maskEmail(cleanEmail)}\`\nEinwilligungen widerrufen: ${existing.length}${consent_type ? ` (type=${consent_type})` : ''}\n_Daten bleiben (für Bearbeitung laufender Anfragen), aber Einwilligung ist revoked._`
  );

  return res.json({
    ok: true,
    message: 'Ihre Einwilligung wurde widerrufen. Wir verarbeiten keine neuen Daten mehr auf dieser Grundlage.',
    withdrawn: existing.length,
    hint: 'Für komplette Löschung Ihrer Daten nutzen Sie bitte den Endpoint /api/audit/erase oder kontaktieren Sie uns direkt.'
  });
});

auditRouter.get('/', async (_req, res) => {
  res.json({
    ok: true,
    endpoints: {
      submit: 'POST /submit',
      export: 'POST /export { email }       — Art 15/20',
      erase: 'POST /erase { email }         — Art 17',
      withdraw_consent: 'POST /withdraw-consent { email, consent_type? } — Art 7(3)'
    }
  });
});
