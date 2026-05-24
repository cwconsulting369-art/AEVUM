// AEVUM v2 — Mailer
// Provider-Priorität:
//   1. Resend API (primary, Carlos's choice 2026-05-24)
//   2. Mailbox.org SMTP (fallback, EU/DSGVO-Backup)
//   3. console.log (no creds — dev/staging fallback)
//
// Backward-compat: behält `mailer.send({to,subject,html,text})` Signatur.

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ────────────────────────────────────────────────────────────
// Provider Init
// ────────────────────────────────────────────────────────────
let resendClient = null;
let smtpTransporter = null;

function getResend() {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('TODO') || key === '') return null;
  resendClient = new Resend(key);
  return resendClient;
}

function getSmtp() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.MAILBOX_SMTP_HOST || 'smtp.mailbox.org';
  const port = parseInt(process.env.MAILBOX_SMTP_PORT || '465', 10);
  const user = process.env.MAILBOX_SMTP_USER;
  const pass = process.env.MAILBOX_SMTP_PASS;
  if (!user || !pass) return null;
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return smtpTransporter;
}

function fromAddress(from) {
  return (
    from ||
    process.env.MAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.AEVUM_FROM_EMAIL ||
    'AEVUM <hello@aevum-system.de>'
  );
}

// ────────────────────────────────────────────────────────────
// Core send
// ────────────────────────────────────────────────────────────
async function sendMail({ to, subject, html, text, from }) {
  const fromAddr = fromAddress(from);

  // 1. Resend (primary)
  const resend = getResend();
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: fromAddr,
        to,
        subject,
        html: html || undefined,
        text: text || undefined
      });
      if (res.error) {
        console.error(`[mailer:resend] send failed: ${res.error.message || JSON.stringify(res.error)}`);
        // fall through to SMTP
      } else {
        return { ok: true, id: res.data?.id, provider: 'resend' };
      }
    } catch (err) {
      console.error(`[mailer:resend] threw: ${err.message}`);
      // fall through to SMTP
    }
  }

  // 2. SMTP (fallback)
  const tx = getSmtp();
  if (tx) {
    try {
      const info = await tx.sendMail({
        from: fromAddr,
        to,
        subject,
        html: html || undefined,
        text: text || undefined
      });
      return { ok: true, id: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(`[mailer:smtp] sendMail failed: ${err.message}`);
      return { ok: false, error: err.message, provider: 'smtp' };
    }
  }

  // 3. Console fallback (no provider configured)
  console.log('[mailer:fallback] No mail provider configured — logging mail:');
  console.log(`  TO: ${to}\n  FROM: ${fromAddr}\n  SUBJECT: ${subject}\n  BODY:\n${text || html?.slice(0, 500)}`);
  return { ok: true, fallback: 'console', provider: 'console' };
}

export const mailer = { send: sendMail };

// Status-Helper für Health-Checks
export function mailerStatus() {
  return {
    resend: !!getResend(),
    smtp: !!getSmtp(),
    from: fromAddress()
  };
}

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
