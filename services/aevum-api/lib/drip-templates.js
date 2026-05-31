// AEVUM Pre-Launch Drip-Templates
// =====================================================================
// Block A3 (2026-05-25, sanitized 2026-05-25)
//
// 4 Mails über das Foundation-Window.
// Brand-Tone: ehrlich, direkt, anti-Marketing-Floskel. Kein "Du wirst es
// lieben", kein "revolutionär", kein "Game-Changer". Carlos hat lieber
// jemanden weniger als jemanden, der sich verarscht fühlt.
//
// Memory: feedback_aevum_brand_identity, feedback_aevum_ehrlichkeit_brand,
//         feedback_aevum_quality_standard, feedback_ssot_knowledge_output_protection
//
// Steps:
//   1 = Confirmation (already sent live via /launch endpoint)
//   2 = +7d   "Was wir bauen — und warum nicht im Hustle-Modus"
//   3 = +21d  "Behind-the-scenes — was wir gerade härten"
//   4 = +35d  "10 Tage vor Launch — was du als Erstes bekommst"
//   5 = Launch-Day (manual trigger)

const PUBLIC_BASE = process.env.AEVUM_PUBLIC_BASE_URL || 'https://aevum-system.de';
const SIGNATURE = '— Carlos · AEVUM';
// Impressum lebt unter /impressum — Footer-Hinweis hier nur als Pflicht-Anbieter-Kennung.
const LEGAL_FOOTER = 'AEVUM · Carlos Wrusch · Impressum: https://aevum-system.de/#/impressum';

// Schedule offsets (days from previous step)
export const STEP_OFFSETS_DAYS = {
  2: 7,   // 7d after step 1
  3: 21,  // 21d after step 1 → 14d after step 2
  4: 35,  // 35d after step 1 → 14d after step 3
  5: null // manual trigger (LLC-Live-Day)
};

// Returns total days from signup (drip_step=1) for upcoming step
export function daysFromSignupForStep(step) {
  return STEP_OFFSETS_DAYS[step] ?? null;
}

// ─────────────────────────────────────────────────────────────────────
// Shared HTML chrome
// ─────────────────────────────────────────────────────────────────────
function chrome({ eyebrow, title, body, footerNote, unsubUrl }) {
  return `<!doctype html>
<html lang="de"><body style="background:#08080a;color:#F9FAFB;font-family:Manrope,system-ui,-apple-system,sans-serif;margin:0;padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08080a">
  <tr><td align="center" style="padding:48px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0d;border:1px solid rgba(255,255,255,0.08)">
      <tr><td style="padding:32px 32px 8px">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#F9FAFB">
          AEVUM<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#e0a458;margin-left:4px;vertical-align:middle"></span>
        </div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:#e0a458;text-transform:uppercase;letter-spacing:0.14em;margin-top:6px">
          ${eyebrow}
        </div>
      </td></tr>
      <tr><td style="padding:16px 32px 8px">
        <h1 style="font-weight:300;font-size:24px;color:#F9FAFB;margin:0 0 16px;letter-spacing:-0.01em;line-height:1.3">${title}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:24px 32px 32px">
        <p style="color:#9a9aa5;font-size:13px;line-height:1.6;margin:0">${footerNote || SIGNATURE}</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;border-top:1px solid rgba(255,255,255,0.05)">
        <p style="color:#6a6a72;font-size:11px;line-height:1.6;margin:20px 0 8px;font-family:ui-monospace,monospace">
          ${LEGAL_FOOTER.replace(/\n/g, '<br/>')}
        </p>
        <p style="color:#6a6a72;font-size:11px;margin:0">
          <a href="${unsubUrl}" style="color:#6a6a72;text-decoration:underline">Abmelden / Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function p(text) {
  return `<p style="color:#cfcfd4;font-size:15px;line-height:1.65;margin:0 0 16px">${text}</p>`;
}
function bullets(items) {
  return `<ul style="margin:0 0 16px;padding:0;list-style:none">${items.map(i => `<li style="color:#cfcfd4;font-size:14px;line-height:1.6;padding:6px 0 6px 18px;position:relative"><span style="position:absolute;left:0;color:#e0a458">→</span>${i}</li>`).join('')}</ul>`;
}
function box(title, html) {
  return `<div style="background:rgba(224,164,88,0.05);border:1px solid rgba(224,164,88,0.18);padding:14px 16px;margin:8px 0 16px"><div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;color:#e0a458;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">${title}</div>${html}</div>`;
}

// ─────────────────────────────────────────────────────────────────────
// Step 2: +7d — "Warum nicht im Hustle-Modus"
// ─────────────────────────────────────────────────────────────────────
function step2({ unsubUrl }) {
  const subject = 'Was wir bauen — und warum nicht im Hustle-Modus';
  const body = [
    p('Kurzes Update aus dem Foundation-Window.'),
    p('Ich hätte AEVUM letzte Woche launchen können. Stripe live, Shop bereit, Audit-Flow funktional. Ich hab\'s nicht gemacht — und das hat einen Grund.'),
    p('Was wir gerade machen ist nicht „schnell raus damit". Wir bauen ein System, das du in Jahr 3 noch dabehalten willst, nicht eines, das in Monat 4 unter der eigenen Komplexität zusammenbricht.'),
    box('Konkret heißt das', bullets([
      'Saubere Firmen- und Finanz-Struktur — wir bauen das parallel, damit Skalierung nicht später nachgeholt werden muss',
      'DSGVO-Layer in jeder Komponente, nicht als nachträglicher Patch',
      'Kein Lock-in für Kunden — Export-Pfad ab Tag 1 dokumentiert',
      'Pricing-Modell, das wir selbst zahlen würden'
    ])),
    p('Brand-Versprechen: keine Floskel-Mails von uns. Wenn ein Update kommt, dann weil etwas Konkretes passiert ist, nicht weil ein Drip-Schedule es vorsieht.'),
    p('Nächstes Update kommt in ~2 Wochen — dann mit konkretem Stand was im Foundation-Bau passiert ist.')
  ].join('');
  const text = `Was wir bauen — und warum nicht im Hustle-Modus

Kurzes Update aus dem Foundation-Window.

Ich hätte AEVUM letzte Woche launchen können. Stripe live, Shop bereit, Audit-Flow funktional. Ich hab's nicht gemacht.

Was wir gerade machen ist nicht "schnell raus damit". Wir bauen ein System, das du in Jahr 3 noch dabehalten willst.

Konkret:
  → Saubere Firmen- und Finanz-Struktur parallel zum Produkt
  → DSGVO-Layer in jeder Komponente, nicht nachträglich
  → Kein Lock-in für Kunden — Export-Pfad ab Tag 1
  → Pricing-Modell, das wir selbst zahlen würden

Keine Floskel-Mails. Updates kommen wenn was passiert.

— Carlos · AEVUM

Abmelden: ${unsubUrl}`;
  const html = chrome({ eyebrow: 'Update 1 · Foundation-Window', title: 'Warum wir nicht im Hustle-Modus launchen.', body, unsubUrl });
  return { subject, html, plain: text };
}

// ─────────────────────────────────────────────────────────────────────
// Step 3: +21d — "Behind-the-scenes"
// ─────────────────────────────────────────────────────────────────────
function step3({ unsubUrl }) {
  const subject = 'Behind-the-scenes — was wir gerade härten';
  const body = [
    p('Foundation-Window Woche 3. Stand der Dinge ohne Marketing-Filter:'),
    box('Was bereits steht', bullets([
      'n8n auf eigenem VPS (statt Cloud-Lock-in)',
      'Resend für Mail-Delivery, eigene Domain verified',
      'Customer-Bot-Isolation: jeder Kunde bekommt eigenen TG-Bot, kein Master-Topf',
      'Magic-Link-Login mit Single-Use + IP-Anonymisierung (DSGVO write-time)',
      'Audit-Endpoint mit Rate-Limit + Honeypot + Pattern-Filter'
    ])),
    box('Woran wir noch arbeiten', bullets([
      'Saubere Firmen-Struktur in Vorbereitung',
      'Stripe-Konto-Setup passend zur neuen Entity',
      'AGB/DSGVO-Texte für die finale Entity parallel pflegen',
      'Founder-Community-Bereich für Vollkunden (Phase 1: TG-Group)'
    ])),
    p('Warum schreib ich dir das? Weil „Pre-Launch" für die meisten Marketing-Theater ist. Ich will dass du weißt was tatsächlich passiert, damit du am Launch-Tag nicht überrascht bist sondern vorbereitet.'),
    p('Wenn dich was davon konkret interessiert — antworte einfach auf diese Mail. Kein Bot, ich lese das.'),
  ].join('');
  const text = `Behind-the-scenes — was wir gerade härten

Foundation-Window Woche 3. Stand ohne Marketing-Filter:

Was bereits steht:
  → n8n auf eigenem VPS
  → Resend für Mail-Delivery, eigene Domain verified
  → Customer-Bot-Isolation (jeder Kunde eigener TG-Bot)
  → Magic-Link-Login mit Single-Use + IP-Anon
  → Audit-Endpoint mit Rate-Limit + Honeypot

Woran wir arbeiten:
  → Saubere Firmen-Struktur in Vorbereitung
  → Stripe-Konto-Setup passend zur neuen Entity
  → AGB/DSGVO-Texte parallel pflegen
  → Founder-Community-Bereich

Antworte gern auf diese Mail — kein Bot, ich lese das.

— Carlos · AEVUM

Abmelden: ${unsubUrl}`;
  const html = chrome({ eyebrow: 'Update 2 · Foundation-Window', title: 'Stand der Dinge — ohne Marketing-Filter.', body, unsubUrl });
  return { subject, html, plain: text };
}

// ─────────────────────────────────────────────────────────────────────
// Step 4: +35d — "10 Tage vor Launch"
// ─────────────────────────────────────────────────────────────────────
function step4({ unsubUrl }) {
  const subject = '10 Tage vor Launch — was du als Erstes bekommst';
  const shopUrl = `${PUBLIC_BASE}/#/shop`;
  const saasUrl = `${PUBLIC_BASE}/#/saas`;
  const auditUrl = `${PUBLIC_BASE}/#/audit`;
  const body = [
    p('Wir nähern uns Live-Tag. Kurz konkret was du als Pre-Launch-Eintragener bekommst:'),
    box('Early-Access Mechanik', bullets([
      'Du bekommst eine Mail am Launch-Tag mit One-Click-Access-Link',
      'Der Link enthält automatisch einen <strong style="color:#F9FAFB">EARLY</strong>-Code für einen Setup-Discount (Höhe wird im Launch-Mailing bestätigt)',
      'Discount gilt zeitlich begrenzt ab Launch, danach Standard-Pricing',
      'Du hast ~1 Woche Vorsprung bevor wir Public-Marketing fahren'
    ])),
    box('Die 3 Pfade am Launch-Tag', `
      <p style="color:#cfcfd4;font-size:14px;line-height:1.6;margin:0 0 8px"><strong style="color:#F9FAFB">Shop</strong> — Blueprints + Done-for-You-Pakete. One-Time-Kauf, sofort runterladen. → <a href="${shopUrl}" style="color:#e0a458">Pfad ansehen</a></p>
      <p style="color:#cfcfd4;font-size:14px;line-height:1.6;margin:0 0 8px"><strong style="color:#F9FAFB">SaaS</strong> — Pay-per-Run-Tools (Script-, DSGVO-, Lead-Factory). Account + Credits. → <a href="${saasUrl}" style="color:#e0a458">Pfad ansehen</a></p>
      <p style="color:#cfcfd4;font-size:14px;line-height:1.6;margin:0"><strong style="color:#F9FAFB">Full-Partnership</strong> — Custom-System mit Personal-Agent. Audit kostenlos, dann Setup + Retainer. → <a href="${auditUrl}" style="color:#e0a458">Pfad ansehen</a></p>
    `),
    p('Ehrliches Wort: nicht jeder Pfad ist für jeden. Shop ist für Selbermacher, SaaS für „brauch nur das eine Tool", Full-Partnership für „bau mir das ganze System". Wenn du unsicher bist welcher dir passt — antworte auf diese Mail mit 2-3 Sätzen zu deinem Use-Case und ich sag dir ehrlich was sinnvoll ist.'),
    p('Letzte Mail kommt am Launch-Tag selbst mit dem Access-Link.')
  ].join('');
  const text = `10 Tage vor Launch — was du als Erstes bekommst

Wir nähern uns Live-Tag.

Early-Access Mechanik:
  → Mail am Launch-Tag mit One-Click-Access-Link
  → Link enthält EARLY-Code für Setup-Discount (Höhe wird im Launch-Mailing bestätigt)
  → Discount zeitlich begrenzt ab Launch
  → ~1 Woche Vorsprung vor Public-Marketing

Die 3 Pfade:
  → Shop — Blueprints + DFY. One-Time. ${shopUrl}
  → SaaS — Pay-per-Run-Tools. ${saasUrl}
  → Full-Partnership — Custom-System + Personal-Agent. ${auditUrl}

Unsicher welcher Pfad? Antworte mit 2-3 Sätzen, ich sag dir ehrlich.

Letzte Mail am Launch-Tag mit Access-Link.

— Carlos · AEVUM

Abmelden: ${unsubUrl}`;
  const html = chrome({ eyebrow: 'Update 3 · 10 Tage vor Launch', title: 'Was du als Pre-Launch-Eintragener bekommst.', body, unsubUrl });
  return { subject, html, plain: text };
}

// ─────────────────────────────────────────────────────────────────────
// Step 5: Launch-Day — Manual trigger
// ─────────────────────────────────────────────────────────────────────
function step5({ unsubUrl }) {
  const subject = 'Wir sind live — dein Early-Access ist offen';
  const accessUrl = `${PUBLIC_BASE}/?utm_source=drip&utm_medium=email&utm_campaign=launch-day&discount=EARLY`;
  const body = [
    p('AEVUM ist live. Stripe läuft, Shop + SaaS + Audit-Flow alle scharf.'),
    box('Dein Early-Access', `
      <p style="color:#cfcfd4;font-size:14px;line-height:1.6;margin:0 0 12px">Code <strong style="color:#e0a458;font-family:ui-monospace,monospace">EARLY</strong> ist automatisch in deinem Link aktiv — Setup-Discount für die erste Welle (Höhe im Checkout sichtbar).</p>
      <p style="margin:0"><a href="${accessUrl}" style="display:inline-block;background:#e0a458;color:#08080a;text-decoration:none;padding:12px 24px;font-weight:600;font-family:'Space Grotesk',sans-serif;letter-spacing:0.02em">→ Zum Early-Access</a></p>
    `),
    p('Du hast ~1 Woche Vorsprung bevor wir Public-Marketing fahren. Wenn du jetzt schon weißt welcher Pfad zu dir passt, kannst du heute starten.'),
    p('Wenn du Fragen hast — antworte auf diese Mail. Kein Support-Bot, ich lese das selbst.'),
    p('Danke fürs Mitgehen durchs Foundation-Window. Das hier war kein Pre-Launch-Theater — das war echtes Bauen.'),
  ].join('');
  const text = `Wir sind live — dein Early-Access ist offen

AEVUM ist live. Stripe läuft, alle 3 Pfade scharf.

Dein Early-Access:
Code EARLY ist automatisch in deinem Link aktiv (Setup-Discount für die erste Welle, Höhe im Checkout sichtbar).

→ ${accessUrl}

~1 Woche Vorsprung vor Public-Marketing.

Fragen? Antworte auf diese Mail.

Danke fürs Mitgehen durchs Foundation-Window. Kein Pre-Launch-Theater — echtes Bauen.

— Carlos · AEVUM

Abmelden: ${unsubUrl}`;
  const html = chrome({ eyebrow: 'AEVUM · Live', title: 'Wir sind live.', body, unsubUrl });
  return { subject, html, plain: text };
}

// ─────────────────────────────────────────────────────────────────────
// Public API: build template for a given step + signup row
// ─────────────────────────────────────────────────────────────────────
const TEMPLATES = { 2: step2, 3: step3, 4: step4, 5: step5 };

export function buildDripContent({ step, row }) {
  const builder = TEMPLATES[step];
  if (!builder) return null;
  const unsubUrl = `${PUBLIC_BASE.replace(/\/+$/, '')}/api/waitlist/unsubscribe?token=${row.unsubscribe_token}&email=${encodeURIComponent(row.email)}`;
  return builder({ unsubUrl, row });
}

export function listSteps() {
  return Object.keys(TEMPLATES).map(s => parseInt(s, 10));
}
