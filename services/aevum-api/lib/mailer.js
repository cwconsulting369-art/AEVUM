// AEVUM v2 — Mailer
// Primary: Mailbox.org via SMTP (EU/DSGVO-compliant, Carlos's choice 2026-05-22)
// Fallback: console.log when no SMTP credentials configured

import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.MAILBOX_SMTP_HOST || 'smtp.mailbox.org';
  const port = parseInt(process.env.MAILBOX_SMTP_PORT || '465', 10);
  const user = process.env.MAILBOX_SMTP_USER;
  const pass = process.env.MAILBOX_SMTP_PASS;
  if (!user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return transporter;
}

async function sendMail({ to, subject, html, text, from }) {
  const fromAddr = from || process.env.AEVUM_FROM_EMAIL || 'hello@aevum-system.de';
  const tx = getTransporter();
  if (!tx) {
    console.log('[mailer:fallback] No SMTP credentials — logging mail:');
    console.log(`  TO: ${to}\n  FROM: ${fromAddr}\n  SUBJECT: ${subject}\n  BODY:\n${text || html?.slice(0, 500)}`);
    return { ok: true, fallback: 'console' };
  }
  try {
    const info = await tx.sendMail({
      from: fromAddr,
      to,
      subject,
      html: html || undefined,
      text: text || undefined
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error(`[mailer:smtp] sendMail failed: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

export const mailer = { send: sendMail };

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────
export function magicLinkHtml({ name, link, purpose }) {
  const heading = purpose === 'invite'
    ? `Willkommen bei AEVUM, ${name || 'Co-Founder'}`
    : `Dein AEVUM-Login-Link`;
  const body = purpose === 'invite'
    ? `Klick auf den Link unten, um dein AEVUM-Onboarding zu starten. Du fügst deine Stammdaten, dein Netzwerk-Profil und deine Permissions hinzu — alles in deinem Tempo.`
    : `Klick auf den Link unten, um dich in dein AEVUM-Portal einzuloggen. Der Link ist 30 Minuten gültig.`;
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:22px;margin:0 0 16px;">${heading}</h1>
<p style="margin:0 0 24px;">${body}</p>
<p style="margin:0 0 32px;"><a href="${link}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">In AEVUM einloggen</a></p>
<p style="font-size:13px;color:#666;margin:0 0 8px;">Falls der Button nicht funktioniert, kopiere diesen Link:</p>
<p style="font-size:13px;color:#666;word-break:break-all;margin:0 0 32px;">${link}</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="font-size:12px;color:#999;margin:0;">Diese Mail wurde von AEVUM versendet. Wenn du nichts angefordert hast, ignoriere sie einfach.</p>
</body></html>`;
}

export function magicLinkText({ name, link, purpose }) {
  return (purpose === 'invite'
    ? `Willkommen bei AEVUM, ${name || 'Co-Founder'}!\n\nKlick auf den Link, um dein Onboarding zu starten:\n${link}\n\nDer Link ist 30 Minuten gültig.`
    : `Dein AEVUM-Login-Link:\n${link}\n\nGültig für 30 Minuten.`);
}
