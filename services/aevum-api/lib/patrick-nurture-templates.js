// lib/patrick-nurture-templates.js
// Patrick-Roth Nurture-Sequenz (B/C/D-Leads) — Mail-Templates, DE + EN.
//
// 5 Steps (0..4): Welcome · Educate · Proof · Objection · Intent/Soft-CTA.
// Patrick-Voice (ehrlich, nahbar, Du-Form / direct second person), Brand
// "Leben in Thailand" / "Living in Thailand". Styling identisch zu
// customer-leads.js (ivory #F5F1E8, coral #C84B31, navy #1A3A52, Georgia-Headlines).
//
// HARD: NUR echte, belegbare Zahlen. Keine erfundenen Claims, keine Fake-Scarcity.
//   - Patrick lebt seit ~2 Jahren vor Ort in Pattaya (aus customer-leads.js bestätigt).
//   - PDF: "7 Fehler deutscher Käufer in Pattaya".
//   Alles Weitere bleibt qualitativ/erfahrungsbasiert formuliert statt mit
//   unbelegten Prozenten/Renditen. 0 bleibt 0.
//
// buildNurtureMail(step, { name, lang }) → { subject, html } | null (step out of range)

const WHATSAPP = 'https://wa.me/4915114363994';
const SITE = 'https://leben-in-thailand.de';
const PORTRAIT = 'https://leben-in-thailand.vercel.app/patrick-portrait.jpg';
const FROM_EMAIL = 'patrick.roth.th@outlook.com';

export const NURTURE_STEP_COUNT = 5; // steps 0..4
export const LAST_NURTURE_STEP = NURTURE_STEP_COUNT - 1;

// Day-offset thresholds per step (Tage seit nurture_started_at).
// Step 0 = Tag 0 (Welcome), dann 3 / 7 / 12 / 18.
export const NURTURE_SCHEDULE_DAYS = [0, 3, 7, 12, 18];

function firstName(name, lang) {
  const fallback = lang === 'en' ? 'Hi' : 'Hallo';
  return (name && String(name).trim().split(/\s+/)[0]) || fallback;
}

function waLink(text) {
  return WHATSAPP + '?text=' + encodeURIComponent(text);
}

// ── Shared chrome (Header + Footer) ────────────────────────────────────────
function shell({ lang, headline, bodyHtml }) {
  const isEn = lang === 'en';
  const brand = isEn ? 'Living in Thailand' : 'Leben in Thailand';
  const sub = isEn ? 'with Patrick · Pattaya' : 'mit Patrick · Pattaya';
  const tagline = isEn
    ? '"All roads lead to Thailand. We help you find the right one."'
    : '"Alle Wege führen nach Thailand. Wir helfen, den richtigen zu finden."';
  const footer = isEn
    ? `You're receiving this email because you requested the Thailand Property Check on leben-in-thailand.de. Just reply with "stop" and I'll take you off the list.`
    : `Du erhältst diese Mail, weil du auf leben-in-thailand.de den Thailand-Immobilien-Check angefordert hast. Antworte einfach mit "stop", und ich nehme dich aus dem Verteiler.`;
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.55;background:#F5F1E8;">
<div style="border-bottom:2px solid #C84B31;padding-bottom:14px;margin-bottom:24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#1A3A52;">${brand}</div>
  <div style="font-size:10px;letter-spacing:0.2em;color:#8a8a8a;text-transform:uppercase;margin-top:4px;">${sub}</div>
</div>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 18px;color:#1A3A52;">${headline}</h1>
${bodyHtml}
<p style="margin:24px 0 0;font-family:Georgia,serif;font-style:italic;color:#4a4a4a;">${tagline}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="padding-right:12px;"><img src="${PORTRAIT}" width="52" height="52" alt="Patrick Roth" style="width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:center top;display:block;border:2px solid #C84B31;"/></td><td style="font-size:13px;color:#1a1a1a;vertical-align:middle;">— Patrick</td></tr></table>
<div style="margin-top:32px;padding-top:14px;border-top:1px solid rgba(200,75,49,0.2);font-size:10px;color:#8a8a8a;line-height:1.6;">
  Patrick · Pattaya · <a href="mailto:${FROM_EMAIL}" style="color:#C84B31;">${FROM_EMAIL}</a><br/>
  ${footer}
</div>
</body></html>`;
}

function ctaButton({ href, label }) {
  return `<p style="margin:0 0 24px;"><a href="${href}" style="display:inline-block;background:#C84B31;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${label}</a></p>`;
}

// ── Step content builders (return { subject, headline, bodyHtml }) ──────────

function step0({ first, lang }) {
  if (lang === 'en') {
    return {
      subject: `Welcome — and one honest word before you go further`,
      headline: `Good to have you here, ${first}.`,
      bodyHtml:
        `<p style="margin:0 0 14px;">You've got the <strong>Thailand Property Check</strong> — that's the dry-facts part. Over the next couple of weeks I'll send you a handful of short emails: no sales pressure, just the things I wish someone had told me before I moved to Pattaya.</p>
<p style="margin:0 0 14px;">I'm not a faceless agency. I actually live here. Everything I write comes from on-the-ground reality, not a brochure.</p>
<p style="margin:0 0 14px;">If at any point you'd rather talk than read, WhatsApp is the fastest way to reach me.</p>
${ctaButton({ href: waLink('Hi Patrick, I just got your welcome email and have a question.'), label: 'Message Patrick' })}`
    };
  }
  return {
    subject: `Willkommen — und ein ehrliches Wort vorab`,
    headline: `Schön, dass du da bist, ${first}.`,
    bodyHtml:
      `<p style="margin:0 0 14px;">Du hast den <strong>Thailand-Immobilien-Check</strong> — das ist der nüchterne Faktenteil. In den nächsten Wochen schicke ich dir ein paar kurze Mails: kein Verkaufsdruck, nur die Dinge, die ich gern selbst gewusst hätte, bevor ich nach Pattaya gezogen bin.</p>
<p style="margin:0 0 14px;">Ich bin keine gesichtslose Agentur. Ich lebe wirklich hier. Alles, was ich schreibe, kommt aus der Vor-Ort-Realität, nicht aus einem Hochglanzprospekt.</p>
<p style="margin:0 0 14px;">Wenn du lieber reden als lesen willst: Über WhatsApp erreichst du mich am schnellsten.</p>
${ctaButton({ href: waLink('Hallo Patrick, ich habe gerade deine Willkommensmail bekommen und habe eine Frage.'), label: 'Patrick schreiben' })}`
  };
}

function step1({ first, lang }) {
  if (lang === 'en') {
    return {
      subject: `The mistake almost everyone makes first`,
      headline: `Before you fall in love with a condo, ${first}…`,
      bodyHtml:
        `<p style="margin:0 0 14px;">The single most common mistake I see: people decide on a property before they understand <em>how</em> ownership actually works for foreigners here. A foreigner can fully own a condominium unit — land is a different story and follows different rules.</p>
<p style="margin:0 0 14px;">It's not complicated once someone explains it plainly — but it changes which properties even make sense for you. That's exactly why the order matters: understand the structure first, fall in love second.</p>
<p style="margin:0 0 14px;">Reply to this email with where you are in your thinking (just dreaming, actively planning, ready to buy) and I'll point you to what's relevant for your situation.</p>`
    };
  }
  return {
    subject: `Der Fehler, den fast alle zuerst machen`,
    headline: `Bevor du dich in ein Condo verliebst, ${first}…`,
    bodyHtml:
      `<p style="margin:0 0 14px;">Der mit Abstand häufigste Fehler: Menschen entscheiden sich für eine Immobilie, bevor sie verstehen, <em>wie</em> Eigentum für Ausländer hier überhaupt funktioniert. Eine Eigentumswohnung (Condo) kann ein Ausländer voll besitzen — bei Grundstücken gelten andere Regeln.</p>
<p style="margin:0 0 14px;">Das ist nicht kompliziert, wenn es dir jemand klar erklärt — aber es entscheidet darüber, welche Objekte für dich überhaupt sinnvoll sind. Genau deshalb ist die Reihenfolge wichtig: erst die Struktur verstehen, dann verlieben.</p>
<p style="margin:0 0 14px;">Antworte einfach auf diese Mail, wo du gerade stehst (nur träumen, aktiv planen, kaufbereit) — dann zeige ich dir, was für deine Situation relevant ist.</p>`
  };
}

function step2({ first, lang }) {
  if (lang === 'en') {
    return {
      subject: `Why I do this differently`,
      headline: `A bit of honesty about how I work, ${first}.`,
      bodyHtml:
        `<p style="margin:0 0 14px;">I live in Pattaya. I'm not flying in for a viewing and disappearing — I'm here, on the ground, year-round. When something looks too good in a listing, I can walk over and check it for you.</p>
<p style="margin:0 0 14px;">I'd rather talk you <em>out</em> of a bad deal than push you into a quick one. That's not a marketing line — it's the only way this works long-term, because in a place this small, reputation is everything.</p>
<p style="margin:0 0 14px;">If you want, tell me one thing you're unsure about regarding Thailand. I'll answer honestly, even if the honest answer is "don't do it."</p>
${ctaButton({ href: waLink('Hi Patrick, here is the one thing I am unsure about:'), label: 'Ask me anything' })}`
    };
  }
  return {
    subject: `Warum ich das anders mache`,
    headline: `Etwas Ehrlichkeit zu meiner Arbeitsweise, ${first}.`,
    bodyHtml:
      `<p style="margin:0 0 14px;">Ich lebe in Pattaya. Ich fliege nicht für eine Besichtigung ein und verschwinde wieder — ich bin das ganze Jahr vor Ort. Wenn ein Inserat zu gut aussieht, gehe ich hin und schaue es mir für dich an.</p>
<p style="margin:0 0 14px;">Ich rede dir lieber einen schlechten Deal <em>aus</em>, als dich in einen schnellen hineinzudrängen. Das ist kein Marketing-Satz — es ist die einzige Art, wie das langfristig funktioniert, denn an einem so kleinen Ort ist der Ruf alles.</p>
<p style="margin:0 0 14px;">Wenn du magst, nenn mir eine Sache, bei der du dir in Sachen Thailand unsicher bist. Ich antworte ehrlich — auch wenn die ehrliche Antwort "lass es" lautet.</p>
${ctaButton({ href: waLink('Hallo Patrick, das ist die eine Sache, bei der ich unsicher bin:'), label: 'Frag mich alles' })}`
  };
}

function step3({ first, lang }) {
  if (lang === 'en') {
    return {
      subject: `"But isn't Thailand risky?"`,
      headline: `Let's talk about the fear, ${first}.`,
      bodyHtml:
        `<p style="margin:0 0 14px;">The worry I hear most: "I'll send money across the world and get scammed." It's a fair worry. The way you avoid it isn't blind trust — it's a clean, verifiable process: due diligence on the title, a proper contract, money flowing through traceable channels, and someone local you can actually look in the eye.</p>
<p style="margin:0 0 14px;">I won't pretend nothing ever goes wrong anywhere. I'll just make sure you go in with your eyes open and the paperwork right. Boring? Yes. That's the point.</p>
<p style="margin:0 0 14px;">If a specific fear is holding you back, write it to me. Naming it is half the solution.</p>
${ctaButton({ href: waLink('Hi Patrick, my biggest concern about buying in Thailand is:'), label: 'Tell Patrick your concern' })}`
    };
  }
  return {
    subject: `"Aber ist Thailand nicht riskant?"`,
    headline: `Reden wir über die Angst, ${first}.`,
    bodyHtml:
      `<p style="margin:0 0 14px;">Die Sorge, die ich am häufigsten höre: "Ich überweise Geld ans andere Ende der Welt und werde abgezockt." Eine berechtigte Sorge. Du vermeidest das nicht durch blindes Vertrauen, sondern durch einen sauberen, nachprüfbaren Ablauf: Prüfung des Eigentumstitels, ein ordentlicher Vertrag, Geldflüsse über nachvollziehbare Wege und jemanden vor Ort, dem du tatsächlich in die Augen sehen kannst.</p>
<p style="margin:0 0 14px;">Ich tue nicht so, als ginge nirgends je etwas schief. Ich sorge nur dafür, dass du mit offenen Augen und korrekten Papieren reingehst. Langweilig? Ja. Genau das ist der Punkt.</p>
<p style="margin:0 0 14px;">Wenn dich eine konkrete Angst zurückhält, schreib sie mir. Sie zu benennen ist die halbe Lösung.</p>
${ctaButton({ href: waLink('Hallo Patrick, meine größte Sorge beim Kauf in Thailand ist:'), label: 'Patrick deine Sorge nennen' })}`
  };
}

function step4({ first, lang }) {
  if (lang === 'en') {
    return {
      subject: `No pressure — just an open door`,
      headline: `Whenever you're ready, ${first}.`,
      bodyHtml:
        `<p style="margin:0 0 14px;">This is the last of my short emails for now. No countdown, no fake "last chance" — that's not how I work.</p>
<p style="margin:0 0 14px;">If Thailand still pulls at you, the next step is simple: a relaxed conversation about your situation, your budget, and what you actually want. No obligation, no sales script.</p>
<p style="margin:0 0 14px;">When the time feels right, just message me. I'll be here — on the ground in Pattaya.</p>
${ctaButton({ href: waLink('Hi Patrick, I think I am ready for a relaxed conversation about Thailand.'), label: 'Start the conversation' })}
<p style="margin:0 0 14px;font-size:13px;color:#4a4a4a;">Or read more in your own time: <a href="${SITE}" style="color:#C84B31;">leben-in-thailand.de</a></p>`
    };
  }
  return {
    subject: `Kein Druck — nur eine offene Tür`,
    headline: `Wann immer du bereit bist, ${first}.`,
    bodyHtml:
      `<p style="margin:0 0 14px;">Das ist vorerst die letzte meiner kurzen Mails. Kein Countdown, keine erfundene "letzte Chance" — so arbeite ich nicht.</p>
<p style="margin:0 0 14px;">Wenn Thailand dich noch immer zieht, ist der nächste Schritt einfach: ein entspanntes Gespräch über deine Situation, dein Budget und das, was du wirklich willst. Unverbindlich, ohne Verkaufsskript.</p>
<p style="margin:0 0 14px;">Wenn sich der Zeitpunkt richtig anfühlt, schreib mir einfach. Ich bin da — vor Ort in Pattaya.</p>
${ctaButton({ href: waLink('Hallo Patrick, ich glaube, ich bin bereit für ein entspanntes Gespräch über Thailand.'), label: 'Gespräch starten' })}
<p style="margin:0 0 14px;font-size:13px;color:#4a4a4a;">Oder lies in Ruhe weiter: <a href="${SITE}" style="color:#C84B31;">leben-in-thailand.de</a></p>`
  };
}

const STEP_BUILDERS = [step0, step1, step2, step3, step4];

/**
 * Build a nurture mail for a given step.
 * @param {number} step  0..4
 * @param {{name?:string, lang?:string}} opts
 * @returns {{subject:string, html:string}|null}
 */
export function buildNurtureMail(step, { name, lang } = {}) {
  const idx = Number(step);
  if (!Number.isInteger(idx) || idx < 0 || idx >= STEP_BUILDERS.length) return null;
  const normLang = lang === 'en' ? 'en' : 'de';
  const first = firstName(name, normLang);
  const { subject, headline, bodyHtml } = STEP_BUILDERS[idx]({ first, lang: normLang });
  const html = shell({ lang: normLang, headline, bodyHtml });
  return { subject, html };
}
