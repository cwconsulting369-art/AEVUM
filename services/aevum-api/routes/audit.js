import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { scanPayload, clean } from '../lib/security.js';
import { logBlock } from '../lib/monitor.js';

export const auditRouter = Router();

function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip
    || 'unknown';
}

// Current consent text version — bump when Datenschutzerklärung is updated
export const CONSENT_VERSION = 'datenschutz-v1-2026-05-19';

// Validation schema — matches WorkflowAudit.tsx form
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

auditRouter.post('/submit', async (req, res) => {
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';
  const ctx = { ip, user_agent: ua, endpoint: 'POST /api/audit/submit' };

  // ─── Layer 1: Schema validation (Zod) ───
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

// ─── DSGVO Art 15 — Recht auf Auskunft ───
// POST /api/audit/export { email, secret }
// (Secret = simple token shared with Carlos — for E-Mail-Verified Self-Service later)
auditRouter.post('/export', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email_required' });
  }
  // Currently Carlos handles this manually — log the request + notify
  const emailMasked = email.replace(/^(.).+(@.+)$/, '$1***$2');
  notifyCarlos(`📨 *DSGVO Auskunfts-Request*\nEmail: \`${emailMasked}\`\nVolle Adresse in Supabase consent_log\nManuell bearbeiten + binnen 30 Tagen antworten (Art 15 DSGVO)`);
  return res.json({ ok: true, message: 'Anfrage erhalten. Wir bearbeiten Ihre Auskunfts-Anfrage binnen 30 Tagen gemäß Art 15 DSGVO.' });
});

// ─── DSGVO Art 17 — Recht auf Löschung ───
// POST /api/audit/erase { email }
auditRouter.post('/erase', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email_required' });
  }
  const cleanEmail = clean(email).toLowerCase();

  // Delete audits matching this email
  const { ok: ok1, data: deletedAudits } = await supabase.select('audits', `email=eq.${encodeURIComponent(cleanEmail)}&select=id`);
  const auditsCount = Array.isArray(deletedAudits) ? deletedAudits.length : 0;

  if (auditsCount > 0) {
    // Cascade delete will also clear consent_log (via FK on delete cascade)
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/audits?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'DELETE',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
  }

  // Log the erasure for audit trail
  await supabase.insert('erasure_log', {
    email: cleanEmail,
    requested_by: 'self',
    audits_deleted_count: auditsCount,
    notes: 'via POST /api/audit/erase'
  });

  const emailMaskedErase = cleanEmail.replace(/^(.).+(@.+)$/, '$1***$2');
  notifyCarlos(`🗑 *DSGVO Löschungs-Request ausgeführt*\nEmail: \`${emailMaskedErase}\`\nAudits gelöscht: ${auditsCount}\nLog in erasure_log Tabelle.`);

  return res.json({
    ok: true,
    message: 'Ihre Daten wurden gelöscht. Diese Aktion wurde protokolliert (DSGVO Art 17).',
    audits_deleted: auditsCount
  });
});

auditRouter.get('/', async (_req, res) => {
  res.json({ ok: true, message: 'audit endpoint — POST /submit to create' });
});
