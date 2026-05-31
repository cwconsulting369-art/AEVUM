// AEVUM Helpbot Knowledge-Base — extracted lib (Block B4)
// Created: 2026-05-25
//
// PURPOSE
// Centralized knowledge-base that the helpbot SYSTEM_PROMPT cannot fully cover.
// Imported by routes/helpbot.js later (currently NOT modified — refactor is opt-in
// for Carlos). Until then this lib lives standalone and is testable in isolation.
//
// SHAPE
//   FAQS              array of {q, a, tags, path?} entries
//   CONFUSED_TOPICS   array of {pair, clarification} entries
//   EDGE_CASE_REPLIES map of intent → canned answer
//   getRelatedFaq(msg) heuristic matcher, returns up to 3 FAQ entries
//
// CONSTRAINT
// Replies stay aligned with AEVUM Brand-Voice (ehrlich, direct, no marketing).
// Anti-fake-it: no invented stats, no fake testimonials, no aspirational claims.

// ─── FAQ Entries ────────────────────────────────────────────
export const FAQS = [
  {
    q: 'Was kostet ein Blueprint?',
    a: 'Blueprints kosten zwischen €97 und €297 einmalig. Du bekommst n8n-Workflow-Datei, Anleitung und Prompts als Download nach Zahlung. Realistische Setup-Zeit 30-90 Minuten je nach Erfahrung.',
    tags: ['blueprint', 'preis', 'kosten', 'shop'],
    path: 'A',
  },
  {
    q: 'Was kostet ein Full-Audit?',
    a: 'Audit selbst ist kostenlos (48h Pitch-Report). Wenn beidseitig Fit: Setup €2-25k einmalig + Retainer €1-5k/Monat. Konkrete Zahl im Pflicht-Call.',
    tags: ['audit', 'preis', 'kosten', 'pfad-b', 'retainer'],
    path: 'B',
  },
  {
    q: 'Wann sind die SaaS-Tools live?',
    a: 'Script-Factory ist in Bau (Beta). DSGVO-Factory und Lead-Factory sind aktuell Konzept-Phase. Frühzugang-Liste verfügbar — ich kann dich eintragen.',
    tags: ['saas', 'tools', 'live', 'verfügbar', 'pfad-c'],
    path: 'C',
  },
  {
    q: 'Bekomme ich einen Personal-Agent im Shop?',
    a: 'Nein. Personal-Agent ist exklusiv in Pfad B (Full-Audit-Partnerschaft). Shop liefert nur Blueprint-Datei, Anleitung und Prompts.',
    tags: ['agent', 'shop', 'personal-agent', 'blueprint'],
    path: 'A',
  },
  {
    q: 'Ist n8n im Preis inbegriffen?',
    a: 'Nein. n8n läuft auf deiner Infrastruktur (self-host oder n8n.cloud €20/Mo). Wir liefern die Workflow-Datei + Setup-Anleitung. Bei Pfad B übernehmen wir das Hosting nach Absprache.',
    tags: ['n8n', 'hosting', 'inbegriffen', 'infrastructure'],
  },
  {
    q: 'Wie lange dauert die Implementierung eines Blueprints?',
    a: 'Ehrlich: 30-90 Minuten je nach Erfahrung + nötigen Credentials (API-Keys einrichten kostet meist die meiste Zeit). Plus 0-2h Eindenken in n8n bei Anfängern.',
    tags: ['blueprint', 'zeit', 'dauer', 'setup'],
    path: 'A',
  },
  {
    q: 'Welche Voraussetzungen brauche ich für ein Blueprint?',
    a: 'n8n-Account (self-host oder n8n.cloud), die nötigen API-Keys (variiert je Blueprint, steht in der Detail-Page), grundlegendes Verständnis von Webhooks/APIs.',
    tags: ['blueprint', 'voraussetzung', 'requirements', 'api-keys'],
    path: 'A',
  },
  {
    q: 'Kann ich Blueprints anpassen lassen?',
    a: 'Anpassung an deinen Use-Case ist nicht im Blueprint-Preis. Entweder du baust selbst um, oder du buchst ein Audit (Pfad B) für Custom-Anpassung.',
    tags: ['blueprint', 'anpassung', 'customization', 'custom'],
  },
  {
    q: 'Wie funktioniert die Erstattung?',
    a: 'Blueprints sind digitale Produkte mit Sofort-Verzicht-Checkbox bei Checkout (§ 356 BGB Abs.5). Nach Download keine Erstattung. Bei Audit-Setup: Money-Back wenn Setup nicht funktioniert wie zugesagt.',
    tags: ['erstattung', 'refund', 'widerruf', 'rückgabe'],
  },
  {
    q: 'Brauche ich eine Mindest-Mitarbeiterzahl für das Audit?',
    a: 'Realistisch ab 5-50 Mitarbeitern. Darunter rechnet sich Retainer selten. Solopreneur → Shop (Pfad A) ist besser.',
    tags: ['audit', 'team-size', 'mitarbeiter', 'company-size'],
    path: 'B',
  },
];

// ─── Häufig konfundierte Topics ─────────────────────────────
// Topics die User regelmäßig verwechseln. helpbot sollte diese aktiv klären.
export const CONFUSED_TOPICS = [
  {
    pair: ['blueprint', 'saas-tool'],
    clarification: 'Blueprint = einmalige n8n-Datei zum selbst-deployen. SaaS-Tool = Web-App von uns gehostet, du nutzt gegen Credits. Komplett verschiedene Pfade.',
  },
  {
    pair: ['audit', 'beratung'],
    clarification: 'Audit = 48h Pitch-Report + Auto-Plan, kein Stundensatz. Klassische Beratung machen wir NICHT.',
  },
  {
    pair: ['credits', 'abo'],
    clarification: 'Credits = Pay-per-Use für SaaS-Tools (kein Auto-Refill). Setup+Retainer (Pfad B) ist monatliche Partnerschaft, kein Credit-System.',
  },
  {
    pair: ['personal-agent', 'helpbot'],
    clarification: 'Helpbot (du sprichst gerade mit ihm) ist öffentliches Pre-Sales-Tool. Personal-Agent = exklusiver Vollkunden-Agent in deinem eigenen Telegram-Bot mit Memory + Project-Kontext.',
  },
  {
    pair: ['dsgvo-tool', 'dsgvo-beratung'],
    clarification: 'Wir bieten technische DSGVO-Konformität (Tools, Workflows). Anwaltliche DSGVO-Beratung NICHT — das ist Anwalts-Job.',
  },
];

// ─── Edge-Case Replies (canned answers für Out-of-Scope-Anfragen) ──
// Keys sind interne Intent-Labels. Verwendung: wenn keine andere Antwort passt,
// LLM-Prompt kann diese als "wenn nichts passt, sage X" Hinweise einbauen.
export const EDGE_CASE_REPLIES = {
  legal_advice:
    'Anwaltliche Beratung gibt es bei uns nicht. Wir bauen technische Lösungen. Für DSGVO-/AGB-/Vertrag-Fragen brauchst du einen Anwalt.',
  steuerberatung:
    'Steuer- und Buchhaltungs-Beratung machen wir nicht. Wir können aber Workflow-Automation für deinen Steuerberater bauen (Belege-Sortierung, Datev-Export, etc.).',
  whitelabel_inquiry:
    'White-Label / Reseller-Anfragen behandeln wir individuell. Schreib eine kurze Mail an info@aevum-system.de mit deinem Vorhaben.',
  partnership_inquiry:
    'Partnerschaften und Affiliate-Modelle sind nach Beweis-Phase möglich. Erst zeigen wir dass es funktioniert, dann sprechen wir über Revenue-Share.',
  job_application:
    'Bewerbungen aktuell nicht aktiv. Wenn du AEVUM-relevante Skills hast (Agent-Engineering, n8n, Claude-API), schick eine Mail an info@aevum-system.de.',
  competitor_compare:
    'Direkten Vergleich mit Wettbewerbern machen wir nicht. Frag konkret nach Features die dir wichtig sind, dann sage ich ehrlich ob wir es haben oder nicht.',
  refund_after_download:
    'Nach Download eines Blueprints (mit Sofort-Verzicht-Checkbox) keine Erstattung. Wenn die Datei kaputt ist oder etwas nicht stimmt: schreib an info@aevum-system.de, wir prüfen.',
  data_export_request:
    'DSGVO-Auskunft / Datenexport: nutze /datenschutz auf der Website oder schick Mail an dsgvo@aevum-system.de.',
  bot_for_my_business:
    'Customer-Bots (eigener Telegram-Bot mit deinem Kontext) gibt es exklusiv in Pfad B (Full-Audit). Nicht im Shop und nicht als SaaS verfügbar.',
  pricing_negotiation:
    'Blueprint-Preise sind fix (skaliert mit Komplexität). Audit-Setup-Preise verhandeln wir im Pflicht-Call basierend auf Scope, nicht hier vorab.',
};

// ─── Heuristischer Matcher ─────────────────────────────────
// Stop-Words werden ignoriert beim Matching.
const STOPWORDS = new Set([
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'der', 'die', 'das', 'den', 'dem',
  'ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'und', 'oder', 'aber', 'doch',
  'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden', 'hat', 'haben',
  'wie', 'was', 'wann', 'wo', 'warum', 'wer', 'welche', 'welcher', 'welches',
  'für', 'mit', 'ohne', 'auf', 'bei', 'zu', 'von', 'in', 'an', 'aus', 'nach',
  'the', 'a', 'an', 'is', 'are', 'how', 'what', 'when', 'where', 'why', 'who',
  'kann', 'könnte', 'möchte', 'will', 'soll', 'muss', 'darf', 'mag',
]);

function tokenize(s) {
  if (typeof s !== 'string') return [];
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

// Returns up to `limit` best-matching FAQ entries (descending score).
// Score = number of overlapping tokens between user-message and FAQ q + tags.
export function getRelatedFaq(userMessage, limit = 3) {
  const tokens = new Set(tokenize(userMessage));
  if (tokens.size === 0) return [];

  const scored = FAQS.map(entry => {
    const haystack = new Set([
      ...tokenize(entry.q),
      ...(entry.tags || []),
    ]);
    let score = 0;
    for (const t of tokens) {
      if (haystack.has(t)) score++;
    }
    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

// Returns clarification text if user-message mentions two confused topics together,
// else null.
export function detectConfusion(userMessage) {
  const lower = (userMessage || '').toLowerCase();
  for (const { pair, clarification } of CONFUSED_TOPICS) {
    const hit0 = lower.includes(pair[0]);
    const hit1 = lower.includes(pair[1]);
    if (hit0 && hit1) return { pair, clarification };
  }
  return null;
}

// Returns canned-reply key if user-message matches edge-case-intent, else null.
// (Lightweight keyword router; LLM still does the final formulation.)
export function detectEdgeCase(userMessage) {
  const lower = (userMessage || '').toLowerCase();
  if (/(anwalt|rechtsberatung|rechtsanwalt|legal advice)/.test(lower)) return 'legal_advice';
  if (/(steuerberat|buchhalt|datev|umsatzsteuer)/.test(lower)) return 'steuerberatung';
  if (/(white.?label|reseller|wieder.?verkauf)/.test(lower)) return 'whitelabel_inquiry';
  if (/(partnerschaft|partner werden|affiliate|kooperation)/.test(lower)) return 'partnership_inquiry';
  if (/(bewerbung|job|stelle|mitarbeit)/.test(lower)) return 'job_application';
  if (/(vergleich.*(make|zapier|n8n cloud)|wettbewerber|konkurrenz)/.test(lower)) return 'competitor_compare';
  if (/(geld zurück|refund|erstattung).*(download|gekauft|bezahlt)/.test(lower)) return 'refund_after_download';
  if (/(dsgvo.*auskunft|datenexport|löschanfrage|right to erasure)/.test(lower)) return 'data_export_request';
  if (/(eigen.*bot|mein.*bot|custom.*telegram)/.test(lower)) return 'bot_for_my_business';
  if (/(rabatt|nachlass|verhandel|preis runter)/.test(lower)) return 'pricing_negotiation';
  return null;
}

// Builds a compact knowledge-snippet for injection into the LLM prompt.
// Returns string (possibly empty) — caller appends to SYSTEM_PROMPT.
export function buildKnowledgeSnippet(userMessage) {
  const parts = [];
  const edge = detectEdgeCase(userMessage);
  if (edge && EDGE_CASE_REPLIES[edge]) {
    parts.push(`# EDGE-CASE-HINWEIS (${edge})\n${EDGE_CASE_REPLIES[edge]}`);
  }
  const confusion = detectConfusion(userMessage);
  if (confusion) {
    parts.push(`# KLARSTELLUNG (${confusion.pair.join(' vs ')})\n${confusion.clarification}`);
  }
  const related = getRelatedFaq(userMessage, 2);
  if (related.length > 0) {
    parts.push(
      '# RELATED FAQ\n' +
      related.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')
    );
  }
  return parts.join('\n\n');
}

// Default export for convenient destructuring in tests / consumers
export default {
  FAQS,
  CONFUSED_TOPICS,
  EDGE_CASE_REPLIES,
  getRelatedFaq,
  detectConfusion,
  detectEdgeCase,
  buildKnowledgeSnippet,
};
