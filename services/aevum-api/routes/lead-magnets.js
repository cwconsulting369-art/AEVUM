// AEVUM Lead-Magnets endpoint — Wave D3
// Created: 2026-05-24
//
// POST /api/lead-magnets/:slug   { email, name?, source?, consent: true }
//   Stores lead-capture, sends download-link via mail (Resend → SMTP fallback).
//   Slug-Registry: eu-ai-act → /lead-magnets/eu-ai-act-2026.pdf

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { mailer } from '../lib/mailer.js';
import { scanPayload } from '../lib/security.js';

export const leadMagnetsRouter = Router();

// Registry: slug → { file_path (relative to web public), title }
const MAGNETS = {
  'eu-ai-act': {
    file: '/lead-magnets/eu-ai-act-2026.pdf',
    title: 'EU AI Act 2026 — Praxis-Checkliste',
    subject: 'Deine AEVUM-Checkliste: EU AI Act 2026'
  }
};

const RequestSchema = z.object({
  email: z.string().email().max(254).transform(s => s.toLowerCase()),
  name: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  consent: z.literal(true)
});

leadMagnetsRouter.post('/:slug', async (req, res) => {
  const { slug } = req.params;
  const magnet = MAGNETS[slug];
  if (!magnet) {
    return res.status(404).json({ ok: false, error: 'magnet_not_found' });
  }

  const parsed = RequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  // Defensive scan on optional free-text fields
  if (parsed.data.name || parsed.data.source) {
    const hits = scanPayload({ name: parsed.data.name || '', source: parsed.data.source || '' });
    if (hits.length > 0) {
      return res.status(400).json({ ok: false, error: 'invalid_input' });
    }
  }

  const row = {
    magnet_slug: slug,
    email: parsed.data.email,
    name: parsed.data.name || null,
    source: parsed.data.source || null,
    consent_ts: new Date().toISOString()
  };

  const result = await supabase.insert('lead_magnets', row);
  if (!result.ok) {
    console.error('[lead-magnets] insert failed:', result.error);
    // Continue anyway — we still want the download to work for the user
  }

  // Build absolute URL (PDF is a static file served by web app)
  const downloadUrl = `https://aevum-system.de${magnet.file}`;

  // Send delivery mail (fire-and-forget — never block on mail)
  const greeting = parsed.data.name ? `Hallo ${parsed.data.name}` : 'Hallo';
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:22px;margin:0 0 16px;">${greeting},</h1>
<p style="margin:0 0 18px;">hier ist deine Checkliste:</p>
<p style="margin:0 0 28px;"><a href="${downloadUrl}" style="display:inline-block;background:#0a0a0a;color:#e0a458;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">${magnet.title} — PDF herunterladen</a></p>
<p style="margin:0 0 18px;">Falls der Button nicht funktioniert, kopiere diesen Link:</p>
<p style="font-size:13px;color:#666;word-break:break-all;margin:0 0 28px;">${downloadUrl}</p>
<hr style="border:none;border-top:1px solid #eee;margin:28px 0;">
<p style="margin:0 0 12px;"><strong>Nächster Schritt:</strong> Wenn du wissen willst, wie dein konkretes Setup AI-Act-fit gemacht wird, buche ein Audit:</p>
<p style="margin:0 0 28px;"><a href="https://aevum-system.de/#/audit" style="color:#0a0a0a;">aevum-system.de/audit</a></p>
<p style="font-size:12px;color:#999;margin:0;">Grüsse aus DACH,<br>AEVUM · aevum-system.de</p>
</body></html>`;

  const text = `${greeting},

hier ist deine Checkliste: ${magnet.title}
Download: ${downloadUrl}

Nächster Schritt: Audit buchen → https://aevum-system.de/#/audit

Grüsse,
AEVUM`;

  // Don't await mail in critical path — but log result
  mailer.send({
    to: parsed.data.email,
    from: 'AEVUM <info@aevum-system.de>',
    subject: magnet.subject,
    html,
    text
  }).then(r => {
    if (r.ok) console.log(`[lead-magnets] mail sent to=${parsed.data.email} slug=${slug} via=${r.provider}`);
    else console.error(`[lead-magnets] mail failed to=${parsed.data.email}: ${r.error}`);
  }).catch(e => console.error('[lead-magnets] mail threw:', e.message));

  return res.json({
    ok: true,
    download_url: downloadUrl,
    message: 'Checkliste wird auch per Mail zugestellt.'
  });
});

leadMagnetsRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'lead-magnets', magnets: Object.keys(MAGNETS) });
});
