// AEVUM Waitlist endpoints
// =====================================================================
// History:
//  - Wave B4 (2026-05-24): POST /saas        — Coming-Soon-Tool waitlist
//  - Wave I7 (2026-05-24): POST /launch      — Maintenance-Banner capture
//  - Block A2 (2026-05-25): Pre-Launch upgrade — confirmation mail,
//    TG-notify, consent-stamp, IP-anon, UTM, unsubscribe, stats
//
// Public endpoints:
//   POST /api/waitlist/saas       — tool-spezifisch (Script/DSGVO/Lead)
//   POST /api/waitlist/launch     — Pre-Launch (Hero/Footer/Banner)
//   POST /api/waitlist/unsubscribe
//   GET  /api/waitlist/health
//
// Admin-protected (Bearer ADMIN_API_TOKEN):
//   GET  /api/waitlist/stats
//   GET  /api/waitlist/list?limit=&status=
//
// Stack: zod-validation, scanPayload, supabase, mailer (Resend), notifyCarlos.

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
import { scanPayload, anonymizeIp } from '../lib/security.js';
import { mailer } from '../lib/mailer.js';
import { notifyCarlos } from '../lib/tg-notify.js';

export const waitlistRouter = Router();

// ───────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────
const CONSENT_VERSION = process.env.WAITLIST_CONSENT_VERSION || '2026-05-25-v1';
const PUBLIC_BASE = process.env.AEVUM_PUBLIC_BASE_URL || 'https://aevum-system.de';
const FROM_EMAIL = process.env.WAITLIST_FROM_EMAIL || 'AEVUM <info@aevum-system.de>';
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || process.env.AEVUM_ADMIN_TOKEN;

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
}

function newUnsubToken() {
  return crypto.randomBytes(24).toString('hex');
}

// ───────────────────────────────────────────────────────────────────
// POST /api/waitlist/saas   — unverändert (Tool-spezifisch)
// ───────────────────────────────────────────────────────────────────
const SaasSchema = z.object({
  tool: z.enum(['script-factory', 'dsgvo-factory', 'lead-factory']),
  email: z.string().email().max(254).transform(s => s.toLowerCase()),
  context: z.string().max(500).optional()
});

waitlistRouter.post('/saas', async (req, res) => {
  const parsed = SaasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  if (parsed.data.context) {
    const hits = scanPayload({ ctx: parsed.data.context });
    if (hits.length > 0) return res.status(400).json({ ok: false, error: 'invalid_input' });
  }
  const row = {
    tool: parsed.data.tool,
    email: parsed.data.email,
    context: parsed.data.context || null,
    ts: new Date().toISOString()
  };
  const result = await supabase.insert('saas_waitlist', row);
  if (!result.ok) {
    const errMsg = JSON.stringify(result.error || {}).toLowerCase();
    if (errMsg.includes('duplicate') || errMsg.includes('unique') || result.status === 409) {
      return res.json({ ok: true, message: 'Bereits eingetragen. Du bekommst Bescheid sobald verfügbar.', duplicate: true });
    }
    console.error('[waitlist:saas] insert failed:', result.error);
    return res.status(500).json({ ok: false, error: 'persist_failed' });
  }
  return res.json({ ok: true, message: 'Eingetragen. Du bekommst Bescheid sobald verfügbar.' });
});

// ───────────────────────────────────────────────────────────────────
// POST /api/waitlist/launch  — Pre-Launch Hero/Footer/Banner/Page
// ───────────────────────────────────────────────────────────────────
const LaunchSchema = z.object({
  email: z.string().email().max(254).transform(s => s.toLowerCase()),
  source: z.string().max(120).optional(),
  // legacy: free-form interest text (banner uses this)
  interest: z.string().max(120).optional().nullable(),
  // new: structured tier-pick
  interest_tier: z.enum(['shop', 'saas', 'full-audit', 'unsure']).optional().nullable(),
  utm_source: z.string().max(120).optional().nullable(),
  utm_medium: z.string().max(120).optional().nullable(),
  utm_campaign: z.string().max(120).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  consent_version: z.string().max(60).optional()
});

waitlistRouter.post('/launch', async (req, res) => {
  const parsed = LaunchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  // Defensive scan on free-text fields
  const scanFields = {};
  if (parsed.data.source) scanFields.src = parsed.data.source;
  if (parsed.data.interest) scanFields.intr = parsed.data.interest;
  if (parsed.data.referrer) scanFields.ref = parsed.data.referrer;
  if (parsed.data.utm_campaign) scanFields.utm = parsed.data.utm_campaign;
  if (Object.keys(scanFields).length > 0) {
    const hits = scanPayload(scanFields);
    if (hits.length > 0) return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  const clientIp = getClientIp(req);
  const ipAnon = anonymizeIp(clientIp);
  const ua = (req.headers['user-agent'] || '').toString().slice(0, 500) || null;
  const unsubToken = newUnsubToken();
  const consent = parsed.data.consent_version || CONSENT_VERSION;

  const row = {
    email: parsed.data.email,
    source: parsed.data.source || 'unknown',
    interest: parsed.data.interest || null,
    interest_tier: parsed.data.interest_tier || null,
    utm_source: parsed.data.utm_source || null,
    utm_medium: parsed.data.utm_medium || null,
    utm_campaign: parsed.data.utm_campaign || null,
    referrer: parsed.data.referrer || null,
    user_agent: ua,
    ip_anon: ipAnon || null,
    consent_version: consent,
    unsubscribe_token: unsubToken,
    status: 'pending',
    ts: new Date().toISOString()
  };

  const result = await supabase.insert('launch_waitlist', row);

  // Duplicate → don't re-send mail or TG, but return ok (idempotent UX)
  if (!result.ok) {
    const errMsg = JSON.stringify(result.error || {}).toLowerCase();
    if (errMsg.includes('duplicate') || errMsg.includes('unique') || result.status === 409) {
      return res.json({
        ok: true,
        status: 'pending',
        duplicate: true,
        message: 'Bereits eingetragen. Du bekommst Bescheid sobald wir öffnen.'
      });
    }
    console.error('[waitlist:launch] insert failed:', result.error);
    return res.status(500).json({ ok: false, error: 'persist_failed' });
  }

  // Fire-and-forget: confirmation mail + TG-notify (do not block response)
  sendConfirmationMail(row).catch(err => console.error('[waitlist:launch:mail]', err.message));
  notifyCarlosAboutSignup(row).catch(err => console.error('[waitlist:launch:tg]', err.message));

  // Mark notified_at after mail-trigger fired (best-effort)
  supabase.update(
    'launch_waitlist',
    `?email=eq.${encodeURIComponent(row.email)}`,
    { notified_at: new Date().toISOString() }
  ).catch(() => {});

  return res.json({
    ok: true,
    status: 'pending',
    message: 'Bestätigungs-Mail unterwegs. Wenn nicht da: Spam checken.'
  });
});

// ───────────────────────────────────────────────────────────────────
// POST /api/waitlist/unsubscribe
// ───────────────────────────────────────────────────────────────────
const UnsubSchema = z.object({
  token: z.string().min(24).max(64),
  email: z.string().email().max(254).transform(s => s.toLowerCase()).optional()
});

waitlistRouter.post('/unsubscribe', async (req, res) => {
  // Also accept query-params for one-click URLs
  const payload = {
    token: req.body?.token || req.query?.token,
    email: req.body?.email || req.query?.email
  };
  const parsed = UnsubSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  let query = `?unsubscribe_token=eq.${encodeURIComponent(parsed.data.token)}`;
  if (parsed.data.email) query += `&email=eq.${encodeURIComponent(parsed.data.email)}`;

  const result = await supabase.update(
    'launch_waitlist',
    query,
    { status: 'unsubscribed' }
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  return res.json({ ok: true, message: 'Du wirst nicht mehr benachrichtigt.' });
});

// GET-Variant for plain mail-links
waitlistRouter.get('/unsubscribe', async (req, res) => {
  const token = req.query.token;
  const email = req.query.email;
  if (!token) return res.status(400).send('Missing token.');
  let query = `?unsubscribe_token=eq.${encodeURIComponent(String(token))}`;
  if (email) query += `&email=eq.${encodeURIComponent(String(email).toLowerCase())}`;
  const result = await supabase.update(
    'launch_waitlist',
    query,
    { status: 'unsubscribed' }
  );
  const ok = result.ok && Array.isArray(result.data) && result.data.length > 0;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html><html lang="de"><meta charset="utf-8"><title>AEVUM Unsubscribe</title>
<body style="background:#08080a;color:#F9FAFB;font-family:system-ui,sans-serif;padding:3rem;text-align:center">
<h1 style="font-weight:300;margin-bottom:1rem">${ok ? 'Du bist abgemeldet.' : 'Link nicht gefunden.'}</h1>
<p style="color:#a4a4ad">${ok ? 'Wir benachrichtigen dich nicht mehr.' : 'Token unbekannt oder bereits abgemeldet.'}</p>
<a href="https://aevum-system.de" style="color:#e0a458">→ Zur AEVUM-Seite</a>
</body></html>`);
});

// ───────────────────────────────────────────────────────────────────
// Admin: GET /api/waitlist/stats
// ───────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(503).json({ ok: false, error: 'admin_token_not_configured' });
  const auth = req.headers['authorization'] || '';
  const t = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
  if (t !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

waitlistRouter.get('/stats', requireAdmin, async (_req, res) => {
  const result = await supabase.select('v_waitlist_stats', '?select=*');
  if (!result.ok) return res.status(500).json({ ok: false, error: 'persist_failed' });
  return res.json({ ok: true, stats: result.data?.[0] || null });
});

waitlistRouter.get('/list', requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const status = req.query.status;
  let query = `?select=id,email,source,interest_tier,utm_source,utm_campaign,status,ts&order=ts.desc&limit=${limit}`;
  if (status) query += `&status=eq.${encodeURIComponent(String(status))}`;
  const result = await supabase.select('launch_waitlist', query);
  if (!result.ok) return res.status(500).json({ ok: false, error: 'persist_failed' });
  return res.json({ ok: true, items: result.data || [] });
});

// ───────────────────────────────────────────────────────────────────
// Helpers: confirmation mail + TG notify
// ───────────────────────────────────────────────────────────────────
async function sendConfirmationMail(row) {
  const unsubUrl = `${PUBLIC_BASE.replace(/\/+$/, '')}/api/waitlist/unsubscribe?token=${row.unsubscribe_token}&email=${encodeURIComponent(row.email)}`;
  const tierLabel = ({
    'shop': 'Shop (Blueprints + DFY)',
    'saas': 'SaaS-Tools (Pay-per-Run)',
    'full-audit': 'Full-Partnership (Custom-System)',
    'unsure': 'Noch unsicher'
  })[row.interest_tier] || 'noch nicht gewählt';

  const text = [
    `Danke fürs Eintragen.`,
    ``,
    `AEVUM ist aktuell im Pre-Launch — Foundation-Bau, nicht Sales-Hustle. Sobald Shop + SaaS scharf gehen, gehörst du zur ersten Welle.`,
    ``,
    `Was du als Erstes bekommst:`,
    `  - Early-Access-Liste (~1 Woche vor Public-Launch)`,
    `  - Setup-Discount für die erste Welle (Höhe wird im Launch-Mailing bestätigt)`,
    `  - 2-3 Sneak-Peek-Updates im Foundation-Window (kein Newsletter-Spam)`,
    ``,
    `Dein Interesse: ${tierLabel}`,
    ``,
    `Wenn das ein Versehen war oder du dich abmelden willst:`,
    `${unsubUrl}`,
    ``,
    `— Carlos`,
    `AEVUM · Impressum: https://aevum-system.de/#/impressum`
  ].join('\n');

  const html = `<!doctype html>
<html lang="de"><body style="background:#08080a;color:#F9FAFB;font-family:Manrope,system-ui,-apple-system,sans-serif;margin:0;padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08080a">
  <tr><td align="center" style="padding:48px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0d;border:1px solid rgba(255,255,255,0.08)">
      <tr><td style="padding:32px 32px 8px">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#F9FAFB">
          AEVUM<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#e0a458;margin-left:4px;vertical-align:middle"></span>
        </div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:#e0a458;text-transform:uppercase;letter-spacing:0.14em;margin-top:6px">
          Pre-Launch · Foundation Window
        </div>
      </td></tr>
      <tr><td style="padding:16px 32px 8px">
        <h1 style="font-weight:300;font-size:24px;color:#F9FAFB;margin:0 0 16px;letter-spacing:-0.01em;line-height:1.3">
          Du bist auf der Pre-Launch-Liste.
        </h1>
        <p style="color:#cfcfd4;font-size:15px;line-height:1.65;margin:0 0 16px">
          Danke fürs Eintragen. Kurz die Lage:
        </p>
        <p style="color:#cfcfd4;font-size:15px;line-height:1.65;margin:0 0 24px">
          AEVUM ist aktuell im <strong style="color:#e0a458">Pre-Launch</strong>. Foundation-Bau, kein Sales-Hustle. Sobald Shop + SaaS scharf gehen, gehörst du zur ersten Welle.
        </p>
      </td></tr>
      <tr><td style="padding:8px 32px">
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;color:#7a7a85;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:14px">
            Was du als Erstes bekommst
          </div>
          <ul style="margin:0;padding:0;list-style:none">
            <li style="color:#cfcfd4;font-size:14px;line-height:1.6;padding:6px 0 6px 18px;position:relative">
              <span style="position:absolute;left:0;color:#e0a458">→</span>
              Early-Access-Liste — ~1 Woche vor Public-Launch
            </li>
            <li style="color:#cfcfd4;font-size:14px;line-height:1.6;padding:6px 0 6px 18px;position:relative">
              <span style="position:absolute;left:0;color:#e0a458">→</span>
              <strong style="color:#F9FAFB">Setup-Discount</strong> für die erste Welle — Höhe wird im Launch-Mailing bestätigt
            </li>
            <li style="color:#cfcfd4;font-size:14px;line-height:1.6;padding:6px 0 6px 18px;position:relative">
              <span style="position:absolute;left:0;color:#e0a458">→</span>
              2-3 Sneak-Peek-Updates im Foundation-Window — kein Newsletter-Spam
            </li>
          </ul>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px 8px">
        <div style="background:rgba(224,164,88,0.05);border:1px solid rgba(224,164,88,0.18);padding:14px 16px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;color:#e0a458;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px">
            Dein Interesse
          </div>
          <div style="color:#F9FAFB;font-size:14px">${tierLabel}</div>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px 32px">
        <p style="color:#9a9aa5;font-size:13px;line-height:1.6;margin:0 0 12px">
          Ehrlich gesagt: Hätte ich dir einen 7-stelligen Wachstums-Funnel verkaufen wollen, hätt ich dir das hier nicht so geschrieben. Wir bauen ein Produkt, das funktioniert, bevor wir es verkaufen.
        </p>
        <p style="color:#9a9aa5;font-size:13px;line-height:1.6;margin:0">
          — Carlos
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;border-top:1px solid rgba(255,255,255,0.05)">
        <p style="color:#6a6a72;font-size:11px;line-height:1.6;margin:20px 0 8px;font-family:ui-monospace,monospace">
          AEVUM · Carlos Wrusch · Impressum: <a href="https://aevum-system.de/#/impressum" style="color:#6a6a72">aevum-system.de/#/impressum</a>
        </p>
        <p style="color:#6a6a72;font-size:11px;margin:0">
          <a href="${unsubUrl}" style="color:#6a6a72;text-decoration:underline">Abmelden / Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  if (typeof mailer?.send !== 'function') {
    console.warn('[waitlist:mail] mailer.send not available — skipping');
    return;
  }
  return mailer.send({
    to: row.email,
    from: FROM_EMAIL,
    subject: 'Du bist auf der AEVUM-Pre-Launch-Liste',
    text,
    html
  });
}

async function notifyCarlosAboutSignup(row) {
  const tier = row.interest_tier || row.interest || 'unsure';
  const utm = [row.utm_source, row.utm_campaign].filter(Boolean).join(' / ') || '-';
  const lines = [
    `📬 *Pre-Launch-Signup*`,
    `Email: \`${row.email}\``,
    `Interesse: ${tier}`,
    `Source: ${row.source || '-'}`,
    `UTM: ${utm}`
  ];
  return notifyCarlos(lines.join('\n'));
}

// ───────────────────────────────────────────────────────────────────
// Health
// ───────────────────────────────────────────────────────────────────
waitlistRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'waitlist',
    consent_version: CONSENT_VERSION,
    has_mailer: Boolean(process.env.RESEND_API_KEY),
    has_tg: Boolean(process.env.TG_LENNOX_BOT_TOKEN && process.env.TG_CARLOS_CHAT_ID),
    has_admin_token: Boolean(ADMIN_TOKEN)
  });
});
