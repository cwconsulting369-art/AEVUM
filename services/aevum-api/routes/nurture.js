// /api/nurture — Patrick Funnel Nurture-Sequenz + Speed-to-Lead-Eskalation (account-scoped)
//
// Nurture (B/C/D-Leads): 5 Steps (0..4) Welcome→Educate→Proof→Objection→Intent.
// Schedule (Tage seit nurture_started_at): 0 / 3 / 7 / 12 / 18 (NURTURE_SCHEDULE_DAYS).
// A-Leads sind von der Sequenz ausgeschlossen (nurture_status='excluded'), bekommen
// stattdessen Speed-to-Lead: status='new' & älter als 2h & !speed_alert_sent →
// TG-Eskalation an Patrick + speed_alert_sent=true.
//
// Admin (x-admin-token ODER x-aevum-admin-token):
//   GET  /api/nurture/:slug/due    — fällige Nurture-Leads + offene Speed-Alerts (read-only Vorschau)
//   POST /api/nurture/:slug/run    — verarbeitet fällige Mails + Speed-Alerts (idempotent)
//   GET  /api/nurture/:slug/stats  — counts pro step/status
//
// runNurture(slug) wird zusätzlich vom In-Process-Scheduler (server.js) aufgerufen.
// HARD: Tokens/Logs harmlos, kein pm2/migrate/deploy, additiv.

import { Router } from 'express';
import http from 'http';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';
import { mailer } from '../lib/mailer.js';
import {
  buildNurtureMail,
  NURTURE_SCHEDULE_DAYS,
  LAST_NURTURE_STEP
} from '../lib/patrick-nurture-templates.js';

export const nurtureRouter = Router();

const THAILANDRE_NOTIFY_URL = process.env.THAILANDRE_BOT_NOTIFY_URL || 'http://127.0.0.1:4105/notify';
const SPEED_ALERT_AGE_MS = 2 * 60 * 60 * 1000; // A-Lead älter als 2h
const NURTURE_FROM = 'Patrick Roth <patrick@aevum-system.de>';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['x-aevum-admin-token'];
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!token || !expected || !safeCompare(token, expected)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

function unwrap(r) {
  if (!r || !r.ok) return null;
  return r.data;
}

async function getAccountBySlug(slug) {
  const r = await supabase.select('accounts', `?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name&limit=1`);
  const rows = unwrap(r);
  return rows && rows.length ? rows[0] : null;
}

// TG-Eskalation an Patrick (thailandre-bot /notify, localhost). Fire-and-forget.
function notifyPatrickSpeedAlert(lead) {
  return new Promise((resolve) => {
    try {
      const ageMin = lead.created_at
        ? Math.round((Date.now() - new Date(lead.created_at).getTime()) / 60000)
        : null;
      const lines = [
        `🚨 SPEED-TO-LEAD — A-Lead unbearbeitet`,
        ``,
        `*Name:* ${lead.name || lead.email || 'unbekannt'}`,
        `*Email:* ${lead.email}`,
        lead.phone ? `*Phone:* ${lead.phone}` : null,
        lead.score_total != null ? `*Score:* ${lead.score_total}/${lead.score_max || 50}` : null,
        ageMin != null ? `*Wartet seit:* ${ageMin} Min` : null,
        ``,
        `🔥 A-Leads brauchen Sofort-Kontakt. Status ist noch "new" — bitte direkt melden.`
      ].filter(Boolean);
      const data = JSON.stringify({ text: lines.join('\n'), audience: 'both' });
      const u = new URL(THAILANDRE_NOTIFY_URL);
      const req = http.request({
        hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      }, (r) => { let b = ''; r.on('data', d => b += d); r.on('end', () => resolve({ ok: r.statusCode < 400, raw: b })); });
      req.on('error', (e) => { console.warn('[nurture] speed-alert notify failed:', e.message); resolve({ ok: false, error: e.message }); });
      req.setTimeout(3000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
      req.write(data); req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

// Welche Step-Nummer ist (zeitlich) fällig für einen aktiven Lead?
// Gibt den höchsten Step zurück, dessen Schwelle erreicht ist UND der noch
// nicht versendet wurde (nurture_step = nächster ungesendeter Step).
// Liefert null, wenn aktuell nichts fällig.
function dueStepFor(lead, now = Date.now()) {
  const nextStep = lead.nurture_step ?? 0;
  if (nextStep > LAST_NURTURE_STEP) return null;
  const startedAt = lead.nurture_started_at ? new Date(lead.nurture_started_at).getTime() : null;
  if (startedAt == null) return null;
  const daysSinceStart = (now - startedAt) / (24 * 3600 * 1000);
  const threshold = NURTURE_SCHEDULE_DAYS[nextStep];
  if (threshold == null) return null;
  return daysSinceStart >= threshold ? nextStep : null;
}

// ──────────────────────────────────────────────────────────
// Core: fällige Leads laden (Nurture + Speed-Alert getrennt)
// ──────────────────────────────────────────────────────────

async function loadAccountLeads(accountId) {
  const r = await supabase.select('customer_leads',
    `?account_id=eq.${accountId}&select=id,name,email,phone,language,lead_tier,score_total,score_max,status,created_at,nurture_status,nurture_step,nurture_started_at,nurture_last_sent_at,speed_alert_sent`);
  return unwrap(r) || [];
}

function computeDue(leads, now = Date.now()) {
  const nurtureDue = [];
  const speedAlerts = [];
  for (const lead of leads) {
    // Speed-to-Lead: A-Lead, status 'new', älter 2h, noch kein Alert.
    if (lead.lead_tier === 'A' && lead.status === 'new' && !lead.speed_alert_sent) {
      const createdMs = lead.created_at ? new Date(lead.created_at).getTime() : now;
      if (now - createdMs >= SPEED_ALERT_AGE_MS) speedAlerts.push(lead);
    }
    // Nurture: aktive Sequenz, fälliger Step.
    if (lead.nurture_status === 'active') {
      const step = dueStepFor(lead, now);
      if (step != null) nurtureDue.push({ lead, step });
    }
  }
  return { nurtureDue, speedAlerts };
}

// ──────────────────────────────────────────────────────────
// runNurture(slug) — verarbeitet fällige Mails + Speed-Alerts.
// Idempotent, defensiv (ein Fehler bricht nicht die ganze Charge).
// Auch vom Scheduler aufgerufen.
// ──────────────────────────────────────────────────────────

export async function runNurture(slug) {
  const result = { ok: true, slug, sent: 0, done: 0, speed_alerts: 0, errors: [] };
  try {
    const account = await getAccountBySlug(slug);
    if (!account) return { ok: false, slug, error: 'account_not_found' };

    const leads = await loadAccountLeads(account.id);
    const { nurtureDue, speedAlerts } = computeDue(leads);

    // 1) Nurture-Mails
    for (const { lead, step } of nurtureDue) {
      try {
        const mail = buildNurtureMail(step, { name: lead.name, lang: lead.language });
        if (!mail) { result.errors.push({ lead_id: lead.id, error: 'no_template', step }); continue; }
        if (!lead.email) { result.errors.push({ lead_id: lead.id, error: 'no_email', step }); continue; }

        const send = await mailer.send({ to: lead.email, subject: mail.subject, html: mail.html, from: NURTURE_FROM });
        if (!send || send.ok === false) {
          result.errors.push({ lead_id: lead.id, error: 'mail_failed', step, detail: send?.error });
          continue;
        }

        const nowIso = new Date().toISOString();
        // Log-Zeile
        await supabase.insert('lead_nurture_log', {
          lead_id: lead.id, step, channel: 'email', subject: mail.subject, status: 'sent'
        });
        // Step++ und ggf. done
        const nextStep = step + 1;
        const patch = {
          nurture_step: nextStep,
          nurture_last_sent_at: nowIso,
          updated_at: nowIso
        };
        if (step >= LAST_NURTURE_STEP) patch.nurture_status = 'done';
        await supabase.update('customer_leads', `?id=eq.${lead.id}`, patch);

        result.sent += 1;
        if (patch.nurture_status === 'done') result.done += 1;
      } catch (e) {
        console.error('[nurture] step send error:', e.message);
        result.errors.push({ lead_id: lead.id, error: e.message, step });
      }
    }

    // 2) Speed-to-Lead-Eskalationen
    for (const lead of speedAlerts) {
      try {
        await notifyPatrickSpeedAlert(lead);
        await supabase.update('customer_leads', `?id=eq.${lead.id}`, {
          speed_alert_sent: true, updated_at: new Date().toISOString()
        });
        result.speed_alerts += 1;
      } catch (e) {
        console.error('[nurture] speed-alert error:', e.message);
        result.errors.push({ lead_id: lead.id, error: e.message, kind: 'speed_alert' });
      }
    }

    return result;
  } catch (e) {
    console.error('[nurture] runNurture fatal:', e.message);
    return { ok: false, slug, error: e.message };
  }
}

// ──────────────────────────────────────────────────────────
// GET /:slug/due — Vorschau (read-only), versendet NICHTS
// ──────────────────────────────────────────────────────────

nurtureRouter.get('/:slug/due', requireAdmin, async (req, res) => {
  try {
    const account = await getAccountBySlug(req.params.slug);
    if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });
    const leads = await loadAccountLeads(account.id);
    const { nurtureDue, speedAlerts } = computeDue(leads);
    res.json({
      ok: true,
      nurture_due: nurtureDue.map(({ lead, step }) => ({
        lead_id: lead.id, name: lead.name, email: lead.email, lead_tier: lead.lead_tier,
        language: lead.language || 'de', step, started_at: lead.nurture_started_at
      })),
      speed_alerts: speedAlerts.map(l => ({
        lead_id: l.id, name: l.name, email: l.email, score_total: l.score_total, created_at: l.created_at
      }))
    });
  } catch (e) {
    console.error('[nurture] due error:', e.message);
    res.status(500).json({ ok: false, error: 'internal' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /:slug/run — verarbeitet fällige (sendet)
// ──────────────────────────────────────────────────────────

nurtureRouter.post('/:slug/run', requireAdmin, async (req, res) => {
  const r = await runNurture(req.params.slug);
  if (!r.ok && r.error === 'account_not_found') return res.status(404).json(r);
  if (!r.ok) return res.status(500).json(r);
  res.json(r);
});

// ──────────────────────────────────────────────────────────
// GET /:slug/stats — counts pro step/status
// ──────────────────────────────────────────────────────────

nurtureRouter.get('/:slug/stats', requireAdmin, async (req, res) => {
  try {
    const account = await getAccountBySlug(req.params.slug);
    if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });
    const leads = await loadAccountLeads(account.id);

    const byStatus = {};
    const byStep = {};
    let speedPending = 0;
    for (const l of leads) {
      const st = l.nurture_status || 'active';
      byStatus[st] = (byStatus[st] || 0) + 1;
      if (st === 'active') {
        const step = l.nurture_step ?? 0;
        byStep[step] = (byStep[step] || 0) + 1;
      }
      if (l.lead_tier === 'A' && l.status === 'new' && !l.speed_alert_sent) speedPending += 1;
    }

    // Versendete Nurture-Mails (Log-Aggregat, defensiv)
    let totalSent = 0;
    try {
      const logr = await supabase.select('lead_nurture_log', `?select=id`);
      totalSent = (unwrap(logr) || []).length;
    } catch (_) { /* non-fatal */ }

    res.json({
      ok: true,
      stats: {
        by_status: byStatus,
        active_by_step: byStep,
        speed_alerts_pending: speedPending,
        nurture_mails_sent: totalSent,
        schedule_days: NURTURE_SCHEDULE_DAYS,
        last_step: LAST_NURTURE_STEP
      }
    });
  } catch (e) {
    console.error('[nurture] stats error:', e.message);
    res.status(500).json({ ok: false, error: 'internal' });
  }
});
