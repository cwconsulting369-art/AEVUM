import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { scanPayload, clean, anonymizeIp, hashToken, randomToken, maskEmail } from '../lib/security.js';
import { logBlock } from '../lib/monitor.js';
import { runAutoPlan } from '../lib/auto-plan.js';
import { extractFromSession } from './helpbot.js';

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
  email: z.string().email().max(200).transform((s) => s.toLowerCase()),
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
  form_version: z.union([z.literal('v2'), z.literal('v3-branching')]),
  audit_form_blueprint_id: z.string().max(100).optional().default('aevum-audit-v2'),
  // Anti-bot reused
  website: z.string().max(500).optional().default(''),
  formStartedAt: z.number().optional(),
  // Consent
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Einwilligung zur Datenverarbeitung erforderlich' })
  }),
  // Required top-level for indexing + GDPR
  email: z.string().email().max(200).transform((s) => s.toLowerCase()),
  name: z.string().min(1).max(200),
  // v2 required, v3-branching optional (form derives company from segment)
  company: z.string().max(200).optional().default(''),
  phone: z.string().max(50).optional().default(''),
  // v3-branching extras (top-level for convenience)
  segment: z.enum(['AG', 'PB', 'FI']).optional(),
  urgency: z.enum(['sofort', '1-4-wochen', 'nur-infos', '']).optional(),
  // v3-branching: explicit budget step (if user filled it)
  budget_setup_min: z.number().int().nonnegative().optional(),
  budget_setup_max: z.number().int().nonnegative().optional(),
  budget_retainer_min: z.number().int().nonnegative().optional(),
  budget_retainer_max: z.number().int().nonnegative().optional(),
  // Full structured answers (per AEVUM-V2-SCHEMAS §3)
  answers: z.record(z.any()),
  // Uploaded file metadata only — actual files in Storage Bucket "audit-uploads"
  uploaded_files: z.array(z.object({
    filename: z.string().max(255),
    url: z.string().url().max(1000),
    type: z.string().max(50).optional(),
    size_bytes: z.number().int().nonnegative().optional()
  })).max(5).optional().default([]),
  // Optional link back to the helpbot conversation that originated this audit
  helpbot_session_id: z.string().min(8).max(64).optional()
});

auditRouter.post('/submit', async (req, res) => {
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';
  const ctx = { ip, user_agent: ua, endpoint: 'POST /api/audit/submit' };

  // ─── v2 / v3-branching detection: route to v2-handler ───
  if (req.body?.form_version === 'v2' || req.body?.form_version === 'v3-branching') {
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
      ip_anonymized: anonymizeIp(ip),
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
    ip_anonymized: anonymizeIp(ip),
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

  // ─── Helpbot hand-off enrichment (optional) ───
  // If the audit was initiated from a Helpbot conversation, fetch the cached
  // (or freshly LLM-extracted) prequalification fields and merge them into
  // `answers` WITHOUT overwriting any explicit form values the user typed.
  let helpbotExtract = null;
  if (f.helpbot_session_id) {
    try {
      const extracted = await extractFromSession(f.helpbot_session_id);
      if (extracted?.ok && extracted.data && typeof extracted.data === 'object') {
        helpbotExtract = extracted.data;
      }
    } catch (err) {
      console.warn('[audit/v2] helpbot extract failed (non-fatal):', err.message || err);
    }
  }

  // Merge: explicit form-fields ALWAYS win over helpbot extraction.
  const mergedAnswers = { ...(f.answers || {}) };

  // ── v3-branching enrichment: stash budget + segment + urgency into answers
  //    so the auto-plan engine (tier-mapper.deriveBudgetSignal) sees them.
  if (f.form_version === 'v3-branching') {
    if (f.segment && !mergedAnswers.segment) mergedAnswers.segment = f.segment;
    if (f.urgency && !mergedAnswers.urgency) mergedAnswers.urgency = f.urgency;
    if (
      Number(f.budget_setup_max) > 0
      || Number(f.budget_retainer_max) > 0
      || Number(f.budget_setup_min) > 0
      || Number(f.budget_retainer_min) > 0
    ) {
      mergedAnswers.budget = {
        setup_min: Number(f.budget_setup_min) || 0,
        setup_max: Number(f.budget_setup_max) || 0,
        retainer_min: Number(f.budget_retainer_min) || 0,
        retainer_max: Number(f.budget_retainer_max) || 0
      };
    }
  }

  if (helpbotExtract) {
    // Cherry-pick under a `_helpbot` namespace so downstream consumers can see provenance.
    mergedAnswers._helpbot = helpbotExtract;
    // Soft-merge: only fill empty top-level keys
    const map = {
      industry: 'unternehmen_industry',
      team_size: 'unternehmen_team_size',
      biggest_pain: 'pain_biggest',
      current_tools: 'stack_tools',
      goal_90_days: 'ziele_90_days',
      timing: 'ziele_success_metric'
    };
    for (const [src, dst] of Object.entries(map)) {
      const val = helpbotExtract[src];
      if (val && (mergedAnswers[dst] == null || mergedAnswers[dst] === '')) {
        mergedAnswers[dst] = val;
      }
    }
  }

  const consentAt = new Date().toISOString();
  // v3-branching has no top-level company field — derive a placeholder from segment+name
  const companyVal = f.company && f.company.length > 0
    ? clean(f.company)
    : (f.form_version === 'v3-branching'
        ? clean(`${f.segment || 'lead'}: ${(f.name || '').split(' ')[0] || 'Solo'}`)
        : clean(f.company || 'unknown'));

  const row = {
    // Legacy required fields (still NOT NULL on table)
    name: clean(f.name),
    company: companyVal,
    email: clean(f.email),
    phone: clean(f.phone),
    // v2 structured payload (with helpbot enrichment)
    answers: mergedAnswers,
    uploaded_files: f.uploaded_files,
    form_version: f.form_version, // preserve 'v2' or 'v3-branching'
    audit_form_blueprint_id: f.audit_form_blueprint_id ?? (f.form_version === 'v3-branching' ? 'aevum-audit-v3' : 'aevum-audit-v2'),
    consent_version: CONSENT_VERSION,
    consent_at: consentAt,
    meta: {
      user_agent: ua,
      ip_anonymized: anonymizeIp(ip),
      form_open_ms: f.formStartedAt ? Date.now() - f.formStartedAt : null,
      submission_type: 'v2',
      helpbot_session_id: f.helpbot_session_id || null,
      helpbot_extracted: !!helpbotExtract
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
    ip_anonymized: anonymizeIp(ip),
    user_agent: ua
  }).catch(err => console.error('consent_log fail (v2):', err));

  // TG notif
  const idShort = (inserted?.id || 'unknown').slice(0, 8);
  const firstName = (f.name || '').split(' ')[0] || 'Anon';
  const emailMasked = f.email.replace(/^(.).+(@.+)$/, '$1***$2');
  const industry = f.answers?.unternehmen?.industry || f.answers?.industry || null;
  const summary = [
    `📋 *Neuer Audit ${f.form_version}* — \`${idShort}\``,
    `*Firma:* ${companyVal}`,
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

  return res.json({ ok: true, id: inserted?.id, form_version: f.form_version });
}

// maskEmail comes from lib/security.js (single source of truth)

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

// ─── DSGVO Art 15/17/20 — Challenge-Flow ─────────────────────────
// Vorher: unauthentifizierter Endpoint → jeder konnte PII abrufen/löschen.
// Jetzt: 2-Stufen-Verifikation per E-Mail-Challenge.
//
//   POST /api/audit/export/request { email }   → "wir haben Link versendet"
//   GET  /api/audit/export?token=...           → liefert JSON-Dump
//   POST /api/audit/erase/request  { email }   → "wir haben Link versendet"
//   GET  /api/audit/erase?token=...            → führt Löschung aus

import { dsgvoLimiter } from '../lib/dsgvo-limiter.js';
import { mailer } from '../lib/mailer.js';

const CHALLENGE_TTL_MIN = 30;
const PORTAL_BASE_FOR_DSGVO = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
const API_BASE_FOR_DSGVO = process.env.AEVUM_API_BASE_URL || 'https://api.aevum-system.de';

async function issueDsgvoChallenge({ email, action, ip }) {
  const token = randomToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MIN * 60 * 1000).toISOString();
  const ins = await supabase.insert('dsgvo_challenge', {
    token_hash: tokenHash,
    email: email.toLowerCase(),
    action,
    expires_at: expiresAt,
    ip_anonymized: anonymizeIp(ip)
  });
  if (!ins.ok) return null;
  return { token, expiresAt };
}

async function consumeDsgvoChallenge(token, action) {
  if (typeof token !== 'string' || token.length < 20) return null;
  const tokenHash = hashToken(token);
  const sel = await supabase.select('dsgvo_challenge',
    `?token_hash=eq.${tokenHash}&action=eq.${action}&select=token_hash,email,expires_at,used_at`);
  const row = sel.data?.[0];
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  // Mark used
  const upd = await supabase.update('dsgvo_challenge',
    `?token_hash=eq.${tokenHash}&used_at=is.null`,
    { used_at: new Date().toISOString() });
  if (!upd.ok || !Array.isArray(upd.data) || upd.data.length === 0) return null;
  return { email: row.email };
}

function dsgvoChallengeEmail({ action, link }) {
  const subject = action === 'export'
    ? 'AEVUM — Bestätigung Datenauskunft (DSGVO Art 15)'
    : 'AEVUM — Bestätigung Datenlöschung (DSGVO Art 17)';
  const verb = action === 'export' ? 'Datenauskunft' : 'Löschung Ihrer Daten';
  const text = `Hallo,\n\nSie haben eine ${verb} bei AEVUM angefragt.\n\nBitte bestätigen Sie über folgenden Link (gültig 30 Minuten):\n${link}\n\nWenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail — Ihre Daten bleiben unverändert.\n\n— AEVUM\nhttps://aevum-system.de`;
  const html = `<p>Hallo,</p><p>Sie haben eine <b>${verb}</b> bei AEVUM angefragt.</p><p>Bitte bestätigen Sie über folgenden Link (gültig 30 Minuten):</p><p><a href="${link}">${link}</a></p><p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail — Ihre Daten bleiben unverändert.</p><p>— AEVUM</p>`;
  return { subject, text, html };
}

// ─── DSGVO Art 15/20 — Auskunft / Datenportabilität ─────────────
// POST /api/audit/export/request  { email }
auditRouter.post('/export/request', dsgvoLimiter, async (req, res) => {
  const parsed = z.object({ email: z.string().email().max(200).transform((s) => s.toLowerCase()) }).safeParse(req.body);
  // Anti-enumeration: ALWAYS respond with the same success message.
  const sameResponse = res.json.bind(res, {
    ok: true,
    message: 'Falls eine E-Mail-Adresse bei uns hinterlegt ist, erhalten Sie in Kürze einen Bestätigungs-Link.'
  });
  if (!parsed.success) return sameResponse();

  const email = parsed.data.email.toLowerCase();
  const ip = clientIp(req);

  // Only issue a challenge if we actually have PII on that email
  const probe = await supabase.select('audits', `?email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  const probeOrders = await supabase.select('orders', `?customer_email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  const probeConsent = await supabase.select('consent_log', `?email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  const hasAnyData = (probe.data?.length || 0) + (probeOrders.data?.length || 0) + (probeConsent.data?.length || 0) > 0;
  if (!hasAnyData) return sameResponse();

  const ch = await issueDsgvoChallenge({ email, action: 'export', ip });
  if (!ch) return sameResponse();
  const link = `${API_BASE_FOR_DSGVO}/api/audit/export?token=${encodeURIComponent(ch.token)}`;
  await mailer.send({ to: email, from: 'AEVUM DSGVO <dsgvo@aevum-system.de>', ...dsgvoChallengeEmail({ action: 'export', link }) });
  notifyCarlos(`📨 *DSGVO Art 15 Challenge ausgestellt*\nEmail: \`${maskEmail(email)}\`\nLink-TTL: ${CHALLENGE_TTL_MIN} min`);
  sameResponse();
});

// GET /api/audit/export?token=...  (verify + return dump)
auditRouter.get('/export', dsgvoLimiter, async (req, res) => {
  const token = String(req.query.token || '');
  const claim = await consumeDsgvoChallenge(token, 'export');
  if (!claim) return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });

  const dump = await collectAllPiiByEmail(claim.email);
  const totalRows = dump.audits.length + dump.orders.length +
    dump.consent_log.length + dump.erasure_log.length + dump.security_events.length;

  supabase.insert('export_requests', {
    email: dump.email,
    requested_via: 'challenge-verified',
    status: 'completed',
    completed_at: new Date().toISOString(),
    ip_anonymized: anonymizeIp(clientIp(req)),
    user_agent: req.get('user-agent') || '',
    notes: `verified-export: ${totalRows} rows`
  }).catch(() => { /* table may not exist yet — silent */ });

  notifyCarlos(`📨 *DSGVO Art 15 Export ausgeführt*\nEmail: \`${maskEmail(dump.email)}\`\nRows: ${totalRows}`);

  return res.json({
    ok: true,
    message: 'Auskunft gemäß Art 15/20 DSGVO.',
    generated_at: new Date().toISOString(),
    consent_text_version: CONSENT_VERSION,
    data: dump
  });
});

// ─── DSGVO Art 17 — Löschung ────────────────────────────────────
// POST /api/audit/erase/request  { email }
auditRouter.post('/erase/request', dsgvoLimiter, async (req, res) => {
  const parsed = z.object({ email: z.string().email().max(200).transform((s) => s.toLowerCase()) }).safeParse(req.body);
  const sameResponse = res.json.bind(res, {
    ok: true,
    message: 'Falls eine E-Mail-Adresse bei uns hinterlegt ist, erhalten Sie in Kürze einen Bestätigungs-Link.'
  });
  if (!parsed.success) return sameResponse();

  const email = parsed.data.email.toLowerCase();
  const ip = clientIp(req);

  const probe = await supabase.select('audits', `?email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  const probeOrders = await supabase.select('orders', `?customer_email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  if ((probe.data?.length || 0) + (probeOrders.data?.length || 0) === 0) return sameResponse();

  const ch = await issueDsgvoChallenge({ email, action: 'erase', ip });
  if (!ch) return sameResponse();
  const link = `${API_BASE_FOR_DSGVO}/api/audit/erase?token=${encodeURIComponent(ch.token)}`;
  await mailer.send({ to: email, from: 'AEVUM DSGVO <dsgvo@aevum-system.de>', ...dsgvoChallengeEmail({ action: 'erase', link }) });
  notifyCarlos(`🗑 *DSGVO Art 17 Challenge ausgestellt*\nEmail: \`${maskEmail(email)}\`\nLink-TTL: ${CHALLENGE_TTL_MIN} min`);
  sameResponse();
});

// GET /api/audit/erase?token=...  (verify + delete)
auditRouter.get('/erase', dsgvoLimiter, async (req, res) => {
  const token = String(req.query.token || '');
  const claim = await consumeDsgvoChallenge(token, 'erase');
  if (!claim) return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });

  const cleanEmail = claim.email;
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
        ip_anonymized: null,
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
    ip_anonymized: anonymizeIp(ip),
    user_agent: ua,
    notes: `via GET /api/audit/erase (challenge-verified); ${ordersPseudonymized} paid orders pseudonymized (HGB §147)`
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

// ─── File Upload Endpoint — Audit-Form v2 ─────────────────────────
// POST /api/audit/upload-file (multipart/form-data, field "file")
// Uploads file to Supabase Storage bucket "audit-uploads", returns {ok, url, size_bytes}.
// Used by aevum-system.de Audit.tsx before the JSON submit. Validates size+type.
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB — schema rule
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/png',
  'image/jpeg'
]);
const ALLOWED_EXT = /\.(pdf|docx?|xlsx?|csv|png|jpe?g)$/i;
const AUDIT_BUCKET = 'audit-uploads';

const uploadMw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const mimeOk = ALLOWED_MIME.has(file.mimetype);
    const extOk = ALLOWED_EXT.test(file.originalname || '');
    if (mimeOk || extOk) return cb(null, true);
    cb(new Error('unsupported_file_type'));
  }
});

function sanitiseFilename(name) {
  const base = path.basename(name || 'file').replace(/[^\w.\-]+/g, '_').slice(0, 120);
  return base || 'file';
}

// IN-06: Magic-byte file-type check. Verifies declared mime/ext matches actual
// content. Prevents users from renaming executables to .pdf and uploading.
// Returns null if OK, else error code (caller rejects with 400).
function checkMagicBytes(buffer, declaredMime, filename) {
  if (!buffer || buffer.length < 8) return 'file_too_small';
  const b = buffer;
  const lower = (filename || '').toLowerCase();

  // Detect actual format from first bytes
  let actual = null;
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) actual = 'pdf';
  else if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) actual = 'jpeg';
  else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) actual = 'png';
  else if (b[0] === 0x50 && b[1] === 0x4B && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) actual = 'zip'; // docx/xlsx are zip
  else if (b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0) actual = 'ole'; // old doc/xls
  // CSV/text-csv has no magic byte signature; allow if extension matches AND content looks text-ish
  else if (/^[\x09\x0A\x0D\x20-\x7E\xC0-\xFD]+/.test(buffer.slice(0, Math.min(256, buffer.length)).toString('latin1'))) {
    actual = 'text';
  }

  if (!actual) return 'unrecognized_format';

  // Match actual against declared mime + ext (loose — only block obvious mismatches)
  const map = {
    pdf:  { mimes: ['application/pdf'], exts: ['.pdf'] },
    jpeg: { mimes: ['image/jpeg', 'image/jpg'], exts: ['.jpg', '.jpeg'] },
    png:  { mimes: ['image/png'], exts: ['.png'] },
    zip:  { mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip'
    ], exts: ['.docx', '.xlsx', '.zip'] },
    ole:  { mimes: ['application/msword', 'application/vnd.ms-excel'], exts: ['.doc', '.xls'] },
    text: { mimes: ['text/csv', 'text/plain'], exts: ['.csv', '.txt'] }
  };

  const m = map[actual];
  const mimeOk = !declaredMime || m.mimes.includes(declaredMime);
  const extOk = m.exts.some(e => lower.endsWith(e));
  if (!mimeOk && !extOk) return 'declared_type_mismatch';
  return null;
}

async function uploadToSupabaseStorage(bucket, objectPath, buffer, contentType) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase_creds_missing');
  const endpoint = `${url}/storage/v1/object/${bucket}/${objectPath}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'false'
    },
    body: buffer
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`storage_upload_failed_${res.status}:${txt.slice(0, 200)}`);
  }
  return endpoint;
}

async function createSignedUrl(bucket, objectPath, expiresInSec = 60 * 60 * 24 * 30) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const endpoint = `${url}/storage/v1/object/sign/${bucket}/${objectPath}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: expiresInSec })
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json?.signedURL && !json?.signedUrl) return null;
  const rel = json.signedURL || json.signedUrl;
  return `${url}/storage/v1${rel.startsWith('/') ? rel : '/' + rel}`;
}

auditRouter.post('/upload-file', (req, res) => {
  uploadMw.single('file')(req, res, async (err) => {
    const ip = clientIp(req);
    const ctx = { ip, user_agent: req.get('user-agent') || '', endpoint: 'POST /api/audit/upload-file' };

    if (err) {
      const code = err.code === 'LIMIT_FILE_SIZE'
        ? 'file_too_large'
        : err.message === 'unsupported_file_type'
          ? 'unsupported_file_type'
          : 'upload_failed';
      logBlock({ ...ctx, type: 'upload_reject', reason: code });
      return res.status(400).json({ ok: false, error: code });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'no_file' });
    }

    // IN-06: Magic-byte check — content must match declared type
    const magicErr = checkMagicBytes(req.file.buffer, req.file.mimetype, req.file.originalname);
    if (magicErr) {
      logBlock({ ...ctx, type: 'upload_reject_magic', reason: magicErr });
      return res.status(400).json({ ok: false, error: 'file_content_mismatch', detail: magicErr });
    }

    try {
      const safe = sanitiseFilename(req.file.originalname);
      const random = crypto.randomBytes(8).toString('hex');
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const objectPath = `${today}/${Date.now()}-${random}-${safe}`;

      await uploadToSupabaseStorage(
        AUDIT_BUCKET,
        objectPath,
        req.file.buffer,
        req.file.mimetype
      );

      // Signed URL (30 days) — bucket is private by default for DSGVO safety
      const signedUrl = await createSignedUrl(AUDIT_BUCKET, objectPath);
      const finalUrl = signedUrl
        || `${process.env.SUPABASE_URL}/storage/v1/object/public/${AUDIT_BUCKET}/${objectPath}`;

      return res.json({
        ok: true,
        url: finalUrl,
        path: objectPath,
        size_bytes: req.file.size,
        type: req.file.mimetype
      });
    } catch (e) {
      console.error('[audit/upload-file] failed:', e?.message || e);
      logBlock({ ...ctx, type: 'upload_storage_error', reason: String(e?.message || e).slice(0, 200) });
      return res.status(500).json({ ok: false, error: 'storage_error' });
    }
  });
});

auditRouter.get('/', async (_req, res) => {
  res.json({
    ok: true,
    endpoints: {
      submit: 'POST /submit',
      upload_file: 'POST /upload-file (multipart, field=file) — returns {url, size_bytes}',
      export: 'POST /export { email }       — Art 15/20',
      erase: 'POST /erase { email }         — Art 17',
      withdraw_consent: 'POST /withdraw-consent { email, consent_type? } — Art 7(3)'
    }
  });
});
