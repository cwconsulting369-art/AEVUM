// AEVUM Shop-Update Notifications
// =====================================================================
// Task-Batch 2026-05-25 (Block C2-friendly: does NOT touch helpbot/project-agent/waitlist/drip)
//
// Mechanism that backs the "Major-Updates kostenlos 12 Monate" Customer-Claims-Promise:
//   POST /api/admin/shop-updates/notify  → mail all past purchasers of a slug
//   GET  /api/admin/shop-updates/log     → query update history
//   GET  /api/shop-updates/unsubscribe   → public unsubscribe-link target
//
// Auth: ADMIN_API_KEY bearer (adminApiKeyGuard mounted in server.js)
// Mail: lib/mailer.js (Resend → Mailbox → console fallback)
// Tables: shop_items_meta, shop_item_update_log, notification_preferences
//
// Recipient-Selection logic:
//   - Query orders where status='paid' AND (package_name=slug OR addons contains slug)
//   - Dedupe by customer_email
//   - Skip emails where notification_preferences.shop_updates_enabled = FALSE

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
import { mailer } from '../lib/mailer.js';
import { adminApiKeyGuard } from '../lib/security.js';
import { notifyCarlos } from '../lib/tg-notify.js';

export const shopUpdatesRouter = Router();

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;
const VERSION_RE = /^v?\d+(\.\d+){0,2}(-[a-z0-9.]+)?$/i;
const PUBLIC_BASE = process.env.AEVUM_PUBLIC_BASE_URL || 'https://aevum-system.de';
const API_BASE = process.env.AEVUM_API_BASE_URL || 'https://api.aevum-system.de';
const FROM_EMAIL =
  process.env.SHOP_UPDATES_FROM_EMAIL ||
  process.env.MAIL_FROM ||
  'AEVUM <updates@aevum-system.de>';

// ───────────────────────────────────────────────────────────────────
// Recipients: distinct paid customers for a slug
// ───────────────────────────────────────────────────────────────────
async function findRecipients(slug) {
  // Match: package_name = slug   OR   addons ?| array[slug]
  // We use two queries (Postgrest doesn't combine OR + JSONB ?| cleanly) then merge.
  const r1 = await supabase.select(
    'orders',
    `?status=eq.paid&package_name=eq.${encodeURIComponent(slug)}&select=id,customer_email,customer_name`
  );
  // addons array contains object with {slug: x} — Postgrest cs filter
  const addonFilter = encodeURIComponent(`[{"slug":"${slug}"}]`);
  const r2 = await supabase.select(
    'orders',
    `?status=eq.paid&addons=cs.${addonFilter}&select=id,customer_email,customer_name`
  );

  const map = new Map();
  for (const row of [...(r1.ok ? r1.data || [] : []), ...(r2.ok ? r2.data || [] : [])]) {
    if (!row.customer_email) continue;
    const k = row.customer_email.toLowerCase();
    if (!map.has(k)) map.set(k, { ...row, account_id: row.account_id || null });
  }
  return Array.from(map.values());
}

async function isOptedOut(email) {
  const r = await supabase.select(
    'notification_preferences',
    `?customer_email=eq.${encodeURIComponent(email.toLowerCase())}&select=shop_updates_enabled&limit=1`
  );
  if (!r.ok) return false; // fail-open: send if lookup broken
  const row = Array.isArray(r.data) ? r.data[0] : null;
  if (!row) return false;
  return row.shop_updates_enabled === false;
}

async function ensureUnsubToken(email) {
  const lower = email.toLowerCase();
  const r = await supabase.select(
    'notification_preferences',
    `?customer_email=eq.${encodeURIComponent(lower)}&select=unsubscribe_token&limit=1`
  );
  const row = r.ok && Array.isArray(r.data) ? r.data[0] : null;
  if (row && row.unsubscribe_token) return row.unsubscribe_token;
  const token = crypto.randomBytes(24).toString('base64url');
  if (row) {
    await supabase.update(
      'notification_preferences',
      `?customer_email=eq.${encodeURIComponent(lower)}`,
      { unsubscribe_token: token, updated_at: new Date().toISOString() }
    );
  } else {
    await supabase.insert('notification_preferences', {
      customer_email: lower,
      shop_updates_enabled: true,
      unsubscribe_token: token,
    });
  }
  return token;
}

// ───────────────────────────────────────────────────────────────────
// Mail rendering
// ───────────────────────────────────────────────────────────────────
function renderNotes(notes) {
  if (!notes) return '<p style="color:#777">Keine Release-Notes hinterlegt.</p>';
  const lines = String(notes)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const bullets = lines.filter((l) => /^[-*•]/.test(l));
  if (bullets.length === lines.length && bullets.length > 0) {
    return (
      '<ul style="padding-left:18px;margin:0 0 12px 0">' +
      bullets.map((b) => `<li>${escapeHtml(b.replace(/^[-*•]\s*/, ''))}</li>`).join('') +
      '</ul>'
    );
  }
  return lines.map((l) => `<p style="margin:0 0 8px 0">${escapeHtml(l)}</p>`).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function buildHtml({ itemName, slug, version, notes, unsubUrl, portalUrl }) {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a1a;line-height:1.55;max-width:560px;margin:0 auto;padding:24px">
  <div style="border-bottom:1px solid #e6e6e6;padding-bottom:12px;margin-bottom:20px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7a85">AEVUM · Update-Notification</div>
    <h1 style="font-size:20px;margin:8px 0 0 0;font-weight:600">Update für ${escapeHtml(itemName)} verfügbar</h1>
  </div>

  <p>Hi,</p>
  <p>Wir haben <strong>${escapeHtml(itemName)}</strong> auf Version <code style="background:#f4f4f4;padding:2px 6px;border-radius:3px">${escapeHtml(version)}</code> gehoben.</p>

  <div style="background:#fafafa;border:1px solid #e6e6e6;padding:16px;margin:16px 0">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;color:#7a7a85;margin-bottom:8px">Was sich geändert hat</div>
    ${renderNotes(notes)}
  </div>

  <p>Die neue n8n-Workflow-Datei und aktualisierte Anleitung findest du im Portal:</p>
  <p style="margin:12px 0 24px 0">
    <a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 18px;text-decoration:none;font-family:monospace;font-size:13px;letter-spacing:0.05em">Im Portal öffnen →</a>
  </p>

  <p style="color:#555;font-size:13px">Major-Updates sind im Kauf für 12 Monate enthalten. Du musst nichts tun — einfach die neue Datei importieren wenn du soweit bist.</p>

  <hr style="border:none;border-top:1px solid #e6e6e6;margin:24px 0">
  <p style="color:#888;font-size:11px;line-height:1.5">
    AEVUM · System für skalierbare Customer-Operations<br>
    <a href="${escapeHtml(unsubUrl)}" style="color:#888">Update-Mails für dieses Item abbestellen</a>
  </p>
</body></html>`;
}

function buildText({ itemName, version, notes, unsubUrl, portalUrl }) {
  const notesText = (notes || 'Keine Release-Notes hinterlegt.')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
  return [
    `AEVUM · Update-Notification`,
    ``,
    `Update für ${itemName} verfügbar (${version})`,
    ``,
    `Was sich geändert hat:`,
    notesText,
    ``,
    `Im Portal öffnen: ${portalUrl}`,
    ``,
    `Major-Updates sind im Kauf für 12 Monate enthalten.`,
    ``,
    `Abbestellen: ${unsubUrl}`,
  ].join('\n');
}

// ───────────────────────────────────────────────────────────────────
// POST /api/admin/shop-updates/notify
// ───────────────────────────────────────────────────────────────────
const notifySchema = z.object({
  item_slug: z.string().min(2).max(80).regex(SLUG_RE),
  item_name: z.string().min(1).max(120).optional(),
  version: z.string().min(1).max(40).regex(VERSION_RE),
  release_notes: z.string().max(8000).optional().default(''),
  dry_run: z.boolean().optional().default(false),
  triggered_by: z.enum(['admin', 'auto', 'cron', 'n8n']).optional().default('admin'),
});

shopUpdatesRouter.post('/notify', adminApiKeyGuard, async (req, res) => {
  const parse = notifySchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: 'bad_input', issues: parse.error.flatten() });
  }
  const { item_slug, item_name, version, release_notes, dry_run, triggered_by } = parse.data;
  const displayName = item_name || item_slug;

  // Recipients
  const recipients = await findRecipients(item_slug);
  if (recipients.length === 0) {
    return res.json({
      ok: true,
      item_slug,
      version,
      recipients_total: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      note: 'no_paid_customers_found',
    });
  }

  const portalUrl = `${PUBLIC_BASE}/portal/blueprints/${encodeURIComponent(item_slug)}`;
  const counters = { sent: 0, skipped: 0, failed: 0 };
  const errors = [];

  if (dry_run) {
    return res.json({
      ok: true,
      dry_run: true,
      item_slug,
      version,
      recipients_total: recipients.length,
      recipients_preview: recipients.slice(0, 5).map((r) => maskEmail(r.customer_email)),
    });
  }

  for (const rec of recipients) {
    const email = rec.customer_email;
    try {
      if (await isOptedOut(email)) {
        counters.skipped++;
        await supabase.insert('shop_item_update_log', {
          customer_email: email,
          account_id: rec.account_id || null,
          item_slug,
          version,
          release_notes,
          status: 'skipped',
          error: 'opted_out',
          triggered_by,
        });
        continue;
      }
      const token = await ensureUnsubToken(email);
      const unsubUrl = `${API_BASE}/api/shop-updates/unsubscribe?t=${token}`;
      const subject = `Update für ${displayName} verfügbar (${version})`;
      const html = buildHtml({ itemName: displayName, slug: item_slug, version, notes: release_notes, unsubUrl, portalUrl });
      const text = buildText({ itemName: displayName, version, notes: release_notes, unsubUrl, portalUrl });

      const sendRes = await mailer.send({ to: email, subject, html, text, from: FROM_EMAIL });
      const ok = sendRes && sendRes.ok !== false;
      const msgId = sendRes?.id || sendRes?.messageId || null;

      await supabase.insert('shop_item_update_log', {
        customer_email: email,
        account_id: rec.account_id || null,
        item_slug,
        version,
        release_notes,
        status: ok ? 'sent' : 'failed',
        resend_message_id: msgId,
        error: ok ? null : String(sendRes?.error || 'send_failed').slice(0, 500),
        triggered_by,
      });

      if (ok) counters.sent++;
      else {
        counters.failed++;
        errors.push({ email: maskEmail(email), error: 'send_failed' });
      }
    } catch (err) {
      counters.failed++;
      errors.push({ email: maskEmail(email), error: err.message });
      await supabase.insert('shop_item_update_log', {
        customer_email: email,
        account_id: rec.account_id || null,
        item_slug,
        version,
        release_notes,
        status: 'failed',
        error: err.message.slice(0, 500),
        triggered_by,
      });
    }
  }

  // Update meta-table
  const nowIso = new Date().toISOString();
  const metaCheck = await supabase.select(
    'shop_items_meta',
    `?item_slug=eq.${encodeURIComponent(item_slug)}&select=item_slug&limit=1`
  );
  if (metaCheck.ok && Array.isArray(metaCheck.data) && metaCheck.data.length > 0) {
    await supabase.update(
      'shop_items_meta',
      `?item_slug=eq.${encodeURIComponent(item_slug)}`,
      {
        current_version: version,
        last_update_notes: release_notes,
        last_update_at: nowIso,
        last_notified_at: nowIso,
        last_notified_version: version,
        updated_at: nowIso,
      }
    );
  } else {
    await supabase.insert('shop_items_meta', {
      item_slug,
      current_version: version,
      last_update_notes: release_notes,
      last_update_at: nowIso,
      last_notified_at: nowIso,
      last_notified_version: version,
    });
  }

  // TG-Notify Carlos
  try {
    await notifyCarlos(
      `[shop-update] ${item_slug} ${version} → sent=${counters.sent} skipped=${counters.skipped} failed=${counters.failed}`
    );
  } catch (e) {
    // non-fatal
  }

  return res.json({
    ok: true,
    item_slug,
    version,
    recipients_total: recipients.length,
    ...counters,
    errors: errors.slice(0, 10),
  });
});

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/shop-updates/log?slug=...&limit=...
// ───────────────────────────────────────────────────────────────────
shopUpdatesRouter.get('/log', adminApiKeyGuard, async (req, res) => {
  const slug = String(req.query.slug || '').toLowerCase();
  const limit = Math.min(parseInt(String(req.query.limit || '50'), 10) || 50, 500);
  let q = `?select=id,created_at,customer_email,item_slug,version,status,resend_message_id,error,triggered_by&order=created_at.desc&limit=${limit}`;
  if (slug && SLUG_RE.test(slug)) {
    q += `&item_slug=eq.${encodeURIComponent(slug)}`;
  }
  const r = await supabase.select('shop_item_update_log', q);
  if (!r.ok) return res.status(500).json({ ok: false, error: 'lookup_failed' });
  // Mask emails in log output
  const rows = (r.data || []).map((row) => ({
    ...row,
    customer_email: maskEmail(row.customer_email),
  }));
  return res.json({ ok: true, count: rows.length, log: rows });
});

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/shop-updates/meta — current versions per slug
// ───────────────────────────────────────────────────────────────────
shopUpdatesRouter.get('/meta', adminApiKeyGuard, async (req, res) => {
  const r = await supabase.select(
    'shop_items_meta',
    `?select=item_slug,current_version,last_update_at,last_notified_at,last_notified_version&order=last_update_at.desc.nullslast`
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: 'lookup_failed' });
  return res.json({ ok: true, items: r.data || [] });
});

// ───────────────────────────────────────────────────────────────────
// Public unsubscribe — GET /api/shop-updates/unsubscribe?t=token
// ───────────────────────────────────────────────────────────────────
export const shopUpdatesPublicRouter = Router();

shopUpdatesPublicRouter.get('/unsubscribe', async (req, res) => {
  const token = String(req.query.t || '').trim();
  if (!token || token.length < 8 || token.length > 100) {
    return res.status(400).type('html').send(htmlPage('Ungültiger Link', 'Der Abmelde-Link ist nicht gültig.'));
  }
  const lookup = await supabase.select(
    'notification_preferences',
    `?unsubscribe_token=eq.${encodeURIComponent(token)}&select=customer_email,shop_updates_enabled&limit=1`
  );
  const row = lookup.ok && Array.isArray(lookup.data) ? lookup.data[0] : null;
  if (!row) {
    return res.status(404).type('html').send(htmlPage('Link unbekannt', 'Wir konnten diesen Abmelde-Link nicht zuordnen.'));
  }
  if (row.shop_updates_enabled === false) {
    return res.type('html').send(htmlPage('Bereits abgemeldet', `Die Adresse ${maskEmail(row.customer_email)} erhält keine Update-Mails mehr.`));
  }
  const upd = await supabase.update(
    'notification_preferences',
    `?unsubscribe_token=eq.${encodeURIComponent(token)}`,
    {
      shop_updates_enabled: false,
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  if (!upd.ok) {
    return res.status(500).type('html').send(htmlPage('Fehler', 'Abmeldung konnte nicht gespeichert werden — bitte später erneut versuchen.'));
  }
  return res.type('html').send(htmlPage('Abgemeldet', `Die Adresse ${maskEmail(row.customer_email)} erhält keine Update-Mails mehr. Transaktionsmails (Bestellbestätigungen, Rechnungen) bleiben aktiv.`));
});

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────
function maskEmail(e) {
  if (!e || typeof e !== 'string') return '';
  return e.replace(/^(.).+(@.+)$/, '$1***$2');
}

function htmlPage(title, message) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)} · AEVUM</title>
<style>body{font-family:-apple-system,Segoe UI,sans-serif;background:#fafafa;margin:0;padding:60px 20px;color:#1a1a1a;line-height:1.5}
.box{max-width:480px;margin:0 auto;background:#fff;border:1px solid #e6e6e6;padding:32px}
h1{font-size:20px;margin:0 0 12px 0}
.meta{font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7a85;margin-bottom:8px}
a{color:#1a1a1a}
</style></head><body>
<div class="box">
<div class="meta">AEVUM · Notification-Preferences</div>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<p style="margin-top:20px"><a href="${escapeHtml(PUBLIC_BASE)}">Zurück zu AEVUM</a></p>
</div></body></html>`;
}
