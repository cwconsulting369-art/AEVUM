// /api/leads — AEVUM v2 Customer-Lead-Storage
//
// Public Endpoint:
//   POST /api/leads/:account_slug        — Intake (vom n8n-Webhook oder direkt)
//
// Admin Endpoints (gated):
//   GET  /api/leads/:account_slug         — Liste (paginated)
//   GET  /api/leads/:account_slug/stats   — Dashboard-KPIs
//   PATCH /api/leads/:account_slug/:id    — Status-Update

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';
import { mailer } from '../lib/mailer.js';

export const customerLeadsRouter = Router();

// ──────────────────────────────────────────────────────────
// Patrick-specific automation (lead-magnet mail + TG-notify)
// ──────────────────────────────────────────────────────────

const PATRICK_PDF_PATH = path.resolve(process.cwd(), 'data/patrick/THAILAND-IMMOBILIEN-CHECK.pdf');
const PATRICK_PDF_PATH_EN = path.resolve(process.cwd(), 'data/patrick/THAILAND-PROPERTY-CHECK-EN.pdf');
const PATRICK_WHATSAPP = 'https://wa.me/4915114363994';
// A-Lead-CTA: WhatsApp-Direktkontakt (Calendly ist raus — Site nutzt durchgängig WhatsApp).
const PATRICK_WHATSAPP_HOT = PATRICK_WHATSAPP + '?text=' + encodeURIComponent('Hallo Patrick, ich habe den Thailand-Immobilien-Check angefordert und würde gerne direkt mit dir sprechen.');
const PATRICK_WHATSAPP_HOT_EN = PATRICK_WHATSAPP + '?text=' + encodeURIComponent("Hi Patrick, I requested the Thailand Property Check and would like to speak with you directly.");
const THAILANDRE_NOTIFY_URL = process.env.THAILANDRE_BOT_NOTIFY_URL || 'http://127.0.0.1:4105/notify';

function loadPatrickPdf(lang) {
  // EN leads get the English PDF if it exists; otherwise fall back to the German one.
  if (lang === 'en') {
    try {
      if (fs.existsSync(PATRICK_PDF_PATH_EN)) return { content: fs.readFileSync(PATRICK_PDF_PATH_EN), filename: 'Thailand-Property-Check-2026.pdf' };
      console.warn('[patrick] EN PDF missing, falling back to DE');
    } catch (e) { console.error('[patrick] en pdf-load failed:', e.message); }
  }
  try {
    if (fs.existsSync(PATRICK_PDF_PATH)) return { content: fs.readFileSync(PATRICK_PDF_PATH), filename: 'Thailand-Immobilien-Check-2026.pdf' };
  } catch (e) { console.error('[patrick] pdf-load failed:', e.message); }
  return null;
}

function patrickLeadConfirmationHtml({ name, tier, lang }) {
  const hot = tier === 'A';

  if (lang === 'en') {
    const firstEn = (name && name.split(' ')[0]) || 'Hi';
    const ctaEn = hot
      ? `<p style="margin:0 0 14px;">Because your profile is very clear, let's talk directly — the fastest way is WhatsApp:</p>
         <p style="margin:0 0 24px;"><a href="${PATRICK_WHATSAPP_HOT_EN}" style="display:inline-block;background:#C84B31;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Message Patrick directly</a></p>`
      : `<p style="margin:0 0 24px;">I'll get back to you personally — usually within 24 hours. With the Pattaya time difference, sometimes a little later.</p>`;
    return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.55;background:#F5F1E8;">
<div style="border-bottom:2px solid #C84B31;padding-bottom:14px;margin-bottom:24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#1A3A52;">Living in Thailand</div>
  <div style="font-size:10px;letter-spacing:0.2em;color:#8a8a8a;text-transform:uppercase;margin-top:4px;">with Patrick · Pattaya</div>
</div>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 18px;color:#1A3A52;">Thank you, ${firstEn}.</h1>
<p style="margin:0 0 14px;">Attached is the <strong>Thailand Property Check 2026</strong> as a PDF — 7 mistakes foreign buyers often make in Pattaya and how to avoid them. Distilled from two years of on-the-ground reality.</p>
${ctaEn}
<p style="margin:0 0 14px;">If you have questions right away, the fastest way to reach me is WhatsApp: <a href="${PATRICK_WHATSAPP}" style="color:#C84B31;">+49 1511 4363994</a>.</p>
<p style="margin:24px 0 0;font-family:Georgia,serif;font-style:italic;color:#4a4a4a;">"All roads lead to Thailand. We help you find the right one."</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="padding-right:12px;"><img src="https://leben-in-thailand.vercel.app/patrick-portrait.jpg" width="52" height="52" alt="Patrick Roth" style="width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:center top;display:block;border:2px solid #C84B31;"/></td><td style="font-size:13px;color:#1a1a1a;vertical-align:middle;">— Patrick</td></tr></table>
<div style="margin-top:32px;padding-top:14px;border-top:1px solid rgba(200,75,49,0.2);font-size:10px;color:#8a8a8a;line-height:1.6;">
  Patrick · Pattaya · <a href="mailto:patrick.roth.th@outlook.com" style="color:#C84B31;">patrick.roth.th@outlook.com</a><br/>
  You're receiving this email because you requested the PDF on leben-in-thailand.de. Simply reply to this email to stop receiving messages.
</div>
</body></html>`;
  }

  const first = (name && name.split(' ')[0]) || 'Hallo';
  const cta = hot
    ? `<p style="margin:0 0 14px;">Weil dein Profil sehr klar ist, lass uns direkt sprechen — am schnellsten per WhatsApp:</p>
       <p style="margin:0 0 24px;"><a href="${PATRICK_WHATSAPP_HOT}" style="display:inline-block;background:#C84B31;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Direkt mit Patrick schreiben</a></p>`
    : `<p style="margin:0 0 24px;">Ich melde mich persönlich — in der Regel innerhalb von 24 Stunden. Mit Zeitverschiebung Pattaya manchmal etwas später.</p>`;
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.55;background:#F5F1E8;">
<div style="border-bottom:2px solid #C84B31;padding-bottom:14px;margin-bottom:24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#1A3A52;">Leben in Thailand</div>
  <div style="font-size:10px;letter-spacing:0.2em;color:#8a8a8a;text-transform:uppercase;margin-top:4px;">mit Patrick · Pattaya</div>
</div>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 18px;color:#1A3A52;">Danke, ${first}.</h1>
<p style="margin:0 0 14px;">Anbei der <strong>Thailand-Immobilien-Check 2026</strong> als PDF — 7 Fehler, die deutsche Käufer in Pattaya häufig machen und wie du sie vermeidest. Aus zwei Jahren Vor-Ort-Realität, kompakt zusammengefasst.</p>
${cta}
<p style="margin:0 0 14px;">Falls du sofort Fragen hast, erreichst du mich am schnellsten via WhatsApp: <a href="${PATRICK_WHATSAPP}" style="color:#C84B31;">+49 1511 4363994</a>.</p>
<p style="margin:24px 0 0;font-family:Georgia,serif;font-style:italic;color:#4a4a4a;">"Alle Wege führen nach Thailand. Wir helfen, den richtigen zu finden."</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="padding-right:12px;"><img src="https://leben-in-thailand.vercel.app/patrick-portrait.jpg" width="52" height="52" alt="Patrick Roth" style="width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:center top;display:block;border:2px solid #C84B31;"/></td><td style="font-size:13px;color:#1a1a1a;vertical-align:middle;">— Patrick</td></tr></table>
<div style="margin-top:32px;padding-top:14px;border-top:1px solid rgba(200,75,49,0.2);font-size:10px;color:#8a8a8a;line-height:1.6;">
  Patrick · Pattaya · <a href="mailto:patrick.roth.th@outlook.com" style="color:#C84B31;">patrick.roth.th@outlook.com</a><br/>
  Du erhältst diese Mail, weil du auf leben-in-thailand.de das PDF angefordert hast. Antworte einfach auf diese Mail, um den Versand zu beenden.
</div>
</body></html>`;
}

async function sendPatrickLeadEmail({ to, name, tier, lang }) {
  if (!to) return { ok: false, reason: 'no-email' };
  try {
    const isEn = lang === 'en';
    const pdf = loadPatrickPdf(lang);
    const html = patrickLeadConfirmationHtml({ name, tier, lang });
    const subject = isEn
      ? (tier === 'A'
          ? `Your Thailand Property Check — plus a personal invitation`
          : `Your Thailand Property Check (PDF)`)
      : (tier === 'A'
          ? `Dein Thailand-Immobilien-Check — plus Termin-Einladung`
          : `Dein Thailand-Immobilien-Check (PDF)`);
    const attachments = pdf ? [{ filename: pdf.filename, content: pdf.content, contentType: 'application/pdf' }] : undefined;
    return await mailer.send({ to, subject, html, attachments, from: 'Patrick Roth <patrick@aevum-system.de>' });
  } catch (e) {
    console.error('[patrick] mail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

function notifyPatrickTg(lead) {
  // POST to thailandre-bot /notify (localhost). Audience='patrick' if learned, else 'carlos'.
  return new Promise((resolve) => {
    try {
      const tier = lead.lead_tier || '?';
      const badge = tier === 'A' ? '🚨 A-Lead' : tier === 'B' ? '✨ B-Lead' : tier === 'C' ? '· C-Lead' : tier === 'D' ? '· D-Lead' : 'Neuer Lead';
      const lines = [
        `${badge} — ${lead.name || lead.email || 'unbekannt'}`,
        ``,
        `*Email:* ${lead.email}`,
        lead.phone ? `*Phone:* ${lead.phone}` : null,
        lead.score_total != null ? `*Score:* ${lead.score_total}/${lead.score_max || 50}` : null,
        lead.source ? `*Source:* ${lead.source}` : null,
        lead.notes ? `*Notes:* ${String(lead.notes).slice(0, 200)}` : null,
        ``,
        tier === 'A' ? `🔥 Sofort-Voice-Empfehlung (binnen 30 Min).` :
        tier === 'B' ? `Nurture-7d Sequenz empfohlen.` :
        tier === 'C' ? `Newsletter-Only.` : `Standard-Followup.`
      ].filter(Boolean);
      const text = lines.join('\n');
      const data = JSON.stringify({ text, audience: 'both' });
      const u = new URL(THAILANDRE_NOTIFY_URL);
      const req = http.request({
        hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      }, (r) => {
        let buf = ''; r.on('data', d => buf += d); r.on('end', () => resolve({ ok: r.statusCode < 400, raw: buf }));
      });
      req.on('error', (e) => { console.warn('[patrick] tg-notify failed:', e.message); resolve({ ok: false, error: e.message }); });
      req.setTimeout(3000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
      req.write(data); req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.AEVUM_IP_HASH_SALT || 'aevum-default-salt-change-in-prod';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 32);
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!token || !expected || !safeCompare(token, expected)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

function unwrap(res) {
  // supabase wrapper returns { ok, status, data }
  if (!res || !res.ok) return null;
  return res.data;
}

async function getAccountIdBySlug(slug) {
  const res = await supabase.select('accounts', `?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name`);
  const rows = unwrap(res);
  return rows && rows.length ? rows[0] : null;
}

async function getProjectByAccount(accountId, projectSlug = null) {
  const slugQ = projectSlug ? `&slug=eq.${encodeURIComponent(projectSlug)}` : '';
  const res = await supabase.select('projects', `?account_id=eq.${accountId}${slugQ}&select=id,slug,name&limit=1`);
  const rows = unwrap(res);
  return rows && rows.length ? rows[0] : null;
}

// ──────────────────────────────────────────────────────────
// Attribution: UTM → content_piece + Referral-Code → referrals-Event
// Non-fatal: errors are logged, never block the lead.
// ──────────────────────────────────────────────────────────

async function attributeLead({ lead, created, accountId }) {
  const patch = {};

  // 1) Content-Attribution via utm_campaign (= content_pieces.utm_campaign on the site)
  try {
    if (lead.utm_campaign) {
      const r = await supabase.select('content_pieces',
        `?account_id=eq.${accountId}&utm_campaign=eq.${encodeURIComponent(lead.utm_campaign)}&select=id&limit=1`);
      const piece = unwrap(r)?.[0];
      if (piece?.id) patch.attributed_content_id = piece.id;
    }
  } catch (e) { console.warn('[leads] content-attribution failed:', e.message); }

  // 2) Referral-Attribution via referral_code → create referrals event
  try {
    if (lead.referral_code) {
      const code = String(lead.referral_code).toUpperCase();
      const cr = await supabase.select('referral_codes',
        `?code=eq.${encodeURIComponent(code)}&active=eq.true&select=id,program_id,referrer_name,referrer_email,expires_at&limit=1`);
      const codeRow = unwrap(cr)?.[0];
      const valid = codeRow && (!codeRow.expires_at || new Date(codeRow.expires_at) > new Date());
      if (valid) {
        const refIns = await supabase.insert('referrals', {
          program_id: codeRow.program_id,
          code_id: codeRow.id,
          lead_id: created.id,
          referee_name: created.name || null,
          referee_email: created.email,
          referee_phone: created.phone || null,
          status: 'pending'
        });
        const ref = refIns.ok ? (Array.isArray(refIns.data) ? refIns.data[0] : refIns.data) : null;
        if (ref?.id) patch.referral_id = ref.id;
      }
    }
  } catch (e) { console.warn('[leads] referral-attribution failed:', e.message); }

  if (Object.keys(patch).length) {
    try { await supabase.update('customer_leads', `?id=eq.${created.id}`, patch); }
    catch (e) { console.warn('[leads] attribution patch failed:', e.message); }
  }
  return patch;
}

// ──────────────────────────────────────────────────────────
// Scoring (patrick-trust-funnel-v1 default)
// ──────────────────────────────────────────────────────────

const SCORE_MAP = {
  zeitplan: { sofort: 10, '2026': 8, '2027+': 5, unklar: 2 },
  budget: { '<100k': 3, '100-250k': 8, '250-500k': 10, '>500k': 10, unklar: 2 },
  hauptbedarf: { auswandern: 10, investment: 10, beides: 10, unklar: 2 },
  begleitung: { sehr_wichtig: 10, wichtig: 7, mittel: 4, unklar: 1 },
  entscheidung: { definitiv: 15, wahrscheinlich: 10, vielleicht: 5, info: 2 }
};

function scoreLead(payload) {
  const s =
    (SCORE_MAP.zeitplan[payload.zeitplan] || 0) +
    (SCORE_MAP.budget[payload.budget] || 0) +
    (SCORE_MAP.hauptbedarf[payload.hauptbedarf] || 0) +
    (SCORE_MAP.begleitung[payload.begleitung] || 0) +
    (SCORE_MAP.entscheidung[payload.entscheidung] || 0);

  let tier = 'D';
  let action = 'kein-fokus';
  if (s >= 40) { tier = 'A'; action = 'voice-message-sofort'; }
  else if (s >= 30) { tier = 'B'; action = 'nurture-7-tage'; }
  else if (s >= 20) { tier = 'C'; action = 'newsletter-only'; }

  return { score_total: s, score_max: 50, lead_tier: tier, lead_action: action };
}

// ──────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────

const LeadIntake = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  language: z.string().max(8).optional(),
  source: z.string().max(60).optional().default('website-quiz'),
  source_detail: z.record(z.any()).optional().default({}),
  project_slug: z.string().max(80).optional(),

  zeitplan: z.string().optional(),
  budget: z.string().optional(),
  hauptbedarf: z.string().optional(),
  begleitung: z.string().optional(),
  entscheidung: z.string().optional(),

  notes: z.string().max(4000).optional(),
  consent_given: z.boolean().optional().default(false),
  consent_text: z.string().max(500).optional()
}).passthrough();

// ──────────────────────────────────────────────────────────
// POST /api/leads/:account_slug — Public Intake
// ──────────────────────────────────────────────────────────

customerLeadsRouter.post('/:account_slug', async (req, res) => {
  try {
    const { account_slug } = req.params;
    const account = await getAccountIdBySlug(account_slug);
    if (!account) {
      return res.status(404).json({ ok: false, error: 'account_not_found' });
    }

    const parsed = LeadIntake.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'invalid_payload', issues: parsed.error.flatten() });
    }
    const lead = parsed.data;

    const hasScorecard = lead.zeitplan || lead.budget || lead.hauptbedarf || lead.begleitung || lead.entscheidung;
    const scored = hasScorecard ? scoreLead(lead) : { score_total: null, score_max: null, lead_tier: null, lead_action: null };

    const project = lead.project_slug
      ? await getProjectByAccount(account.id, lead.project_slug)
      : await getProjectByAccount(account.id);

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const ipHash = hashIp(clientIp);

    const insertPayload = {
      account_id: account.id,
      project_id: project?.id || null,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      language: lead.language || 'de',
      source: lead.source,
      source_detail: lead.source_detail,
      scorecard_id: hasScorecard ? 'patrick-trust-funnel-v1' : null,
      score_total: scored.score_total,
      score_max: scored.score_max,
      lead_tier: scored.lead_tier,
      lead_action: scored.lead_action,
      raw_data: lead,
      notes: lead.notes,
      consent_given: lead.consent_given,
      consent_text: lead.consent_text,
      consent_timestamp: lead.consent_given ? new Date().toISOString() : null,
      ip_address_hash: ipHash,
      // Attribution (set from query/cookie by the site; expanded below)
      utm_source: lead.utm_source || null,
      utm_medium: lead.utm_medium || null,
      utm_campaign: lead.utm_campaign || null,
      referral_code: lead.referral_code ? String(lead.referral_code).toUpperCase() : null,
      status: 'new'
    };

    // Nurture-State (additiv): A-Leads bekommen Speed-to-Lead statt Sequenz →
    // von der Nurture-Sequenz ausgeschlossen. B/C/D starten aktive Sequenz bei Step 0.
    // (Migration 050: nurture_status default 'active' — wir setzen explizit für Klarheit.)
    {
      const nowIso = new Date().toISOString();
      if (scored.lead_tier === 'A') {
        insertPayload.nurture_status = 'excluded';
        insertPayload.nurture_step = 0;
      } else {
        insertPayload.nurture_status = 'active';
        insertPayload.nurture_step = 0;
        insertPayload.nurture_started_at = nowIso;
      }
    }

    const result = await supabase.insert('customer_leads', insertPayload);
    if (!result || !result.ok) {
      console.error('[customer-leads] insert failed', result);
      return res.status(500).json({ ok: false, error: 'db_error' });
    }
    const rows = result.data;
    const created = Array.isArray(rows) ? rows[0] : rows;

    // Attribution (UTM→content + referral-code→referrals event). Awaited but non-fatal.
    if (lead.utm_campaign || lead.referral_code) {
      await attributeLead({ lead, created, accountId: account.id });
    }

    // Patrick-specific automation — fire-and-forget (do not block response)
    if (account_slug === 'patrick-roth') {
      setImmediate(() => {
        sendPatrickLeadEmail({ to: created.email, name: created.name, tier: created.lead_tier, lang: created.language })
          .then(r => console.log('[patrick] mail sent:', r?.ok ? 'ok' : 'fail', r?.provider || r?.error || ''))
          .catch(e => console.error('[patrick] mail error:', e.message));
        notifyPatrickTg(created)
          .then(r => console.log('[patrick] tg-notify:', r?.ok ? 'ok' : 'fail', r?.error || ''))
          .catch(e => console.error('[patrick] tg-notify error:', e.message));
      });
    }

    return res.json({
      ok: true,
      lead_id: created.id,
      lead_tier: created.lead_tier,
      lead_action: created.lead_action,
      score_total: created.score_total,
      message: 'Vielen Dank. Patrick meldet sich persönlich.'
    });
  } catch (e) {
    console.error('[customer-leads] intake error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/leads/:account_slug — Admin List
// ──────────────────────────────────────────────────────────

customerLeadsRouter.get('/:account_slug', requireAdmin, async (req, res) => {
  try {
    const { account_slug } = req.params;
    const account = await getAccountIdBySlug(account_slug);
    if (!account) {
      return res.status(404).json({ ok: false, error: 'account_not_found' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const tier = req.query.tier;
    const status = req.query.status;

    let q = `?account_id=eq.${account.id}&order=created_at.desc&limit=${limit}&offset=${offset}`;
    q += '&select=id,name,email,phone,source,lead_tier,score_total,status,created_at,raw_data';
    if (tier) q += `&lead_tier=eq.${tier}`;
    if (status) q += `&status=eq.${status}`;

    const result = await supabase.select('customer_leads', q);
    const leads = unwrap(result) || [];
    return res.json({ ok: true, leads, limit, offset });
  } catch (e) {
    console.error('[customer-leads] list error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/leads/:account_slug/stats — Dashboard-KPIs
// ──────────────────────────────────────────────────────────

customerLeadsRouter.get('/:account_slug/stats', requireAdmin, async (req, res) => {
  try {
    const { account_slug } = req.params;
    const account = await getAccountIdBySlug(account_slug);
    if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });

    const result = await supabase.select('customer_leads', `?account_id=eq.${account.id}&select=lead_tier,status,created_at`);
    const all = unwrap(result) || [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 3600 * 1000);

    const total = all.length;
    const last30 = all.filter(l => new Date(l.created_at) > thirtyDaysAgo).length;
    const last90 = all.filter(l => new Date(l.created_at) > ninetyDaysAgo).length;

    const byTier = all.reduce((acc, l) => {
      const t = l.lead_tier || 'unscored';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const byStatus = all.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      ok: true,
      stats: {
        total,
        last_30_days: last30,
        last_90_days: last90,
        by_tier: byTier,
        by_status: byStatus,
        targets: {
          leads_per_month: { min: 15, max: 25 },
          a_leads_per_month: { min: 3, max: 5 }
        }
      }
    });
  } catch (e) {
    console.error('[customer-leads] stats error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});

// ──────────────────────────────────────────────────────────
// PATCH /api/leads/:account_slug/:id — Admin Status-Update
// ──────────────────────────────────────────────────────────

const StatusUpdate = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'meeting-scheduled', 'meeting-held', 'won', 'lost', 'parked']).optional(),
  notes: z.string().max(4000).optional()
}).strict();

customerLeadsRouter.patch('/:account_slug/:id', requireAdmin, async (req, res) => {
  try {
    const parsed = StatusUpdate.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'invalid_payload' });
    }
    const updates = { ...parsed.data, updated_at: new Date().toISOString() };
    if (parsed.data.status) updates.status_changed_at = new Date().toISOString();

    const result = await supabase.update('customer_leads', `?id=eq.${req.params.id}`, updates);
    if (!result || !result.ok) return res.status(500).json({ ok: false, error: 'db_error' });
    const rows = result.data;
    const updated = Array.isArray(rows) ? rows[0] : rows;
    return res.json({ ok: true, lead: updated });
  } catch (e) {
    console.error('[customer-leads] update error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});
