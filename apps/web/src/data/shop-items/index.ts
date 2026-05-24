/**
 * AEVUM Shop-Items — Detail-Page Content-Registry
 *
 * 20 Detail-Pages: 6 Blueprints + 1 Bundle + 11 DFY + 3 SaaS-Coming-Soon
 * (script-factory taucht 2x auf: DFY-Variante + SaaS-Variante)
 *
 * Quality-Gate-Status (gate_passed) wird live aus Backend gemerged.
 * Bis Gate-Pass: "Beta — wird gerade gebaut+getestet"-Disclaimer wird gezeigt.
 *
 * Memory: project_aevum_shop_quality_gate, feedback_aevum_ehrlichkeit_brand
 */
import type { ShopItemContent } from './types';
import { STUB_TEXT } from './types';

/* ──────────────────── BLUEPRINTS (6) ──────────────────── */

const contentFactory: ShopItemContent = {
  slug: 'content-factory',
  name: 'Content-Factory',
  type: 'blueprint',
  tag: 'Beliebt',
  priceLabel: '€197',
  price: 197,
  stripePriceId: 'price_1TaLJD200IKJdPeh0e0WPc6v',
  securityLevel: 'business',
  icp: ['AG', 'PB'],
  category: 'Content',
  tagline: 'Automatisierte Content-Produktion — Idee bis Publish für Instagram + LinkedIn.',
  whatIsIt:
    'Ein fertiger n8n-Workflow plus Setup-Guide, der dir Content-Produktion automatisiert. Du fütterst Themen + Brand-Voice rein, das System recherchiert, schreibt Drafts in deinem Stil, generiert passende Bilder/Quotes und legt fertige Posts in eine Review-Queue. Du gibst frei, der Workflow published.',
  outcomes: [
    '8-12 Stunden Content-Arbeit pro Woche eingespart',
    '5-8 Posts pro Woche statt 1-2',
    'Konsistenter Brand-Voice durch Prompt-Library (30+ getestete Prompts)',
    'Recherche, Draft, Visual, Schedule — in einem Flow',
  ],
  whenItFits: {
    fits: [
      'Personal Brand auf LinkedIn (1k+ Follower, will skalieren)',
      'Agentur mit 3-10 Kunden die Content brauchen',
      'Solo-Founder ohne Content-Person im Team',
    ],
    requires: [
      'n8n self-hosted oder n8n cloud Account (ab €20/Mo)',
      'OpenAI / Anthropic API-Key',
      'Instagram Business / LinkedIn Company Page mit API-Zugriff',
    ],
  },
  includes: [
    'n8n-Workflow JSON (ready-to-import)',
    'PDF-Setup-Guide (12 Seiten, mit Screenshots)',
    'Prompt-Library (30+ getestete Prompts für Posts/Captions/Hashtags)',
    'Brand-Voice-Template (JSON-konfigurierbar)',
    'Connection-Anleitung: API-Tokens wo erstellen, wo eintragen',
  ],
  pricingNote: 'Einmalig. Keine Lizenz, keine Abo-Falle. Du besitzt den Workflow.',
  securityNote:
    'Business-Level: HTTPS, Token-Encryption in n8n, separater Workflow-User. Kein DSGVO-Audit-Log — bei Bedarf upgradebar.',
  faq: [
    { q: 'Wie schnell deploy-bar?', a: '30-90 Minuten je nach n8n-Erfahrung. Anleitung ist Schritt-für-Schritt mit Screenshots.' },
    { q: 'Refund?', a: 'Innerhalb 14 Tagen wenn der Workflow nicht wie beschrieben läuft. Bei Account-Konfig-Problemen geben wir Setup-Support statt Refund.' },
    { q: 'Updates inklusive?', a: 'Major-Updates kostenlos für 12 Monate. Patch-Updates dauerhaft.' },
    { q: 'Support bei Setup?', a: 'PDF + Helpbot frei. Live-Setup-Call: optional €99 (oder 1.000 Credits einlösen).' },
    { q: 'Brauche ich Coding-Skills?', a: 'Nein. n8n ist visuell. Wenn du Zapier benutzen kannst, kannst du das.' },
  ],
  crossSell: 'Bundle (alle 6 Blueprints) → €697 statt €1.212',
};

const leadQualifierPro: ShopItemContent = {
  slug: 'lead-qualifier-pro',
  name: 'Lead-Qualifier Pro',
  type: 'blueprint',
  tag: 'Premium',
  priceLabel: '€297',
  price: 297,
  stripePriceId: 'price_1TaLJE200IKJdPehRxbH0aVN',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Leads',
  tagline: 'Eingehende Leads automatisch nach 7 Kriterien scoren — direkt ins CRM.',
  whatIsIt:
    'Web-Form / Kalender / E-Mail-Posteingang feeden den Workflow. Jeder Lead wird nach 7 Kriterien (Budget, Branche, Größe, Pain, Timing, Decision-Authority, Fit) per LLM analysiert, gescored, mit Notes versehen und ins CRM gepusht. Hot-Leads triggern Slack/Telegram-Ping.',
  outcomes: [
    'Nur Top-20% Leads landen im Vertriebs-Kalender (statt jeder Discovery-Call)',
    'Lead-zu-Call-Conversion 2-3x höher',
    'Vertrieb spart 4-6h/Woche Pre-Qualification',
    'DSGVO-konform: Lead-Daten werden in EU-Hosting verarbeitet, Erasure-API inklusive',
  ],
  whenItFits: {
    fits: [
      'B2B Agentur / SaaS mit 20+ Leads/Monat',
      'Berater mit Discovery-Call-Bottleneck',
      'Teams die qualifizieren statt verkaufen',
    ],
    requires: [
      'CRM mit API (HubSpot, Pipedrive, Notion, Airtable supported)',
      'LLM-API-Key (Anthropic empfohlen, OpenAI funktioniert)',
      'n8n self-hosted in EU (für DSGVO-Compliance)',
    ],
  },
  includes: [
    'n8n-Workflow JSON',
    'DSGVO-Compliance-Checklist (16 Punkte)',
    'PDF-Setup-Guide (18 Seiten)',
    '7-Kriterien-Scoring-Logik (anpassbar)',
    'CRM-Connector-Templates (HubSpot/Pipedrive/Notion/Airtable)',
    'Erasure-API-Endpoint-Code (Node.js)',
  ],
  pricingNote: 'Premium-Tier wegen DSGVO-Komponente. Audit-Log inklusive.',
  securityNote:
    'DSGVO-Level: EU-Hosting required (Frankfurt-Datacenter empfohlen), DPA-Template inklusive, Audit-Log + Erasure-API.',
  faq: [
    { q: 'Wie schnell deploy-bar?', a: '2-4 Stunden inkl. DSGVO-Setup. Anleitung führt durch DPA + Hosting.' },
    { q: 'Welche CRMs werden unterstützt?', a: 'HubSpot, Pipedrive, Notion, Airtable nativ. Andere via Webhook (Custom).' },
    { q: 'Refund?', a: '14 Tage Rückgabe wenn Scoring-Logik nicht greift. Bei API-Setup-Problemen geben wir Support.' },
    { q: 'Wie viele Leads kann das verarbeiten?', a: 'Bis 10k Leads/Monat ohne Probleme. Darüber: n8n-Skalierung.' },
    { q: 'AVV / Vertrag?', a: 'DPA-Template inklusive — passt für deutsche/EU-Datenverarbeitung.' },
  ],
  crossSell: 'Cold Outreach System ergänzt diesen Flow für aktive Lead-Gen',
};

const reportingDashboardSetup: ShopItemContent = {
  slug: 'reporting-dashboard-setup',
  name: 'Reporting Dashboard Setup',
  type: 'blueprint',
  priceLabel: '€147',
  price: 147,
  stripePriceId: 'price_1TaLJF200IKJdPehGo8zalDs',
  securityLevel: 'business',
  icp: ['AG', 'FI'],
  category: 'Reporting',
  tagline: 'Wöchentlicher KPI-Report — automatisch generiert, per Mail ans Team.',
  whatIsIt:
    'Verbindet deine Daten-Quellen (Stripe, Google Analytics, Meta Ads, Airtable, Postgres) zu einem wöchentlichen PDF-Report. Jeden Montag 06:00 verschickt — KPIs, Trends, Anomalien, Top-3 Insights via LLM.',
  outcomes: [
    'Schluss mit "wie liefs letzte Woche?"-Sonntagabend-Aktionen',
    'Team kommt Montag in Meeting mit gleichen Zahlen',
    '~3-5h/Woche reporting-Zeit eingespart',
  ],
  whenItFits: {
    fits: [
      'Agentur mit 3+ Kunden die Reports brauchen',
      'Startup mit Investor-Updates monatlich',
      'Teams mit Daten-Quellen-Wildwuchs',
    ],
    requires: [
      'n8n + Postgres (für Daten-Cache)',
      'API-Zugriff zu deinen Daten-Quellen',
      'PDF-Render-Service (Puppeteer im Workflow inklusive)',
    ],
  },
  includes: [
    'Dashboard-Template (Postgres-Schema + Queries)',
    'API-Connector-Setup (Stripe/GA/Meta)',
    'PDF-Render-Template (anpassbar)',
    'PDF-Setup-Guide (8 Seiten)',
    'Wöchentlicher Schedule-Trigger (n8n cron)',
  ],
  securityNote:
    'Business-Level: API-Tokens encrypted in n8n. Reports landen in privatem Inbox, kein public-link.',
  faq: [
    { q: 'Welche Daten-Quellen?', a: 'Stripe, GA4, Meta Ads, Airtable, Postgres nativ. Andere: Custom-Connector (Doku im Guide).' },
    { q: 'Anpassbar?', a: 'KPIs frei wählbar, Layout-Template editierbar (HTML/CSS).' },
    { q: 'Refund?', a: '14 Tage wie immer.' },
  ],
};

const onboardingAutopilot: ShopItemContent = {
  slug: 'onboarding-autopilot',
  name: 'Onboarding Autopilot',
  type: 'blueprint',
  priceLabel: '€97',
  price: 97,
  stripePriceId: 'price_1TaLJF200IKJdPehFYkIC1Au',
  securityLevel: 'basic',
  icp: ['AG', 'PB', 'FI'],
  category: 'Automatisierung',
  tagline: 'Neukunden-Onboarding komplett automatisiert — Welcome, Tasks, Slack-Ping.',
  whatIsIt:
    'Sobald ein Neukunde in Stripe/CRM landet: Welcome-Email mit personalisierten Next-Steps, Tasks werden in Notion/ClickUp angelegt, Slack-Kanal mit Welcome-Message gestartet, Onboarding-Form verschickt. Alles getriggert vom ersten "paid"-Event.',
  outcomes: [
    'Onboarding-Time von 2-3 Tagen auf 5 Minuten',
    'Konsistente Customer-Experience ab Tag 1',
    'Niemand vergisst Welcome-Email mehr',
  ],
  whenItFits: {
    fits: [
      'SaaS / Service-Business mit Stripe',
      'Agentur mit standardisiertem Kickoff',
      'Teams die Onboarding aktuell manuell machen',
    ],
    requires: [
      'Stripe ODER CRM mit Webhook-Support',
      'Slack-Workspace (optional)',
      'Notion/ClickUp/Asana API (optional)',
    ],
  },
  includes: [
    'n8n-Workflow JSON',
    'PDF-Guide (6 Seiten)',
    'Welcome-Email-Templates (3 Varianten)',
    'Task-Template-Library',
  ],
  faq: [
    { q: 'Wie schnell deploy-bar?', a: '20-40 Minuten — der schnellste Blueprint im Shop.' },
    { q: 'Stripe required?', a: 'Nein. Funktioniert auch nur mit CRM-Webhook oder Form-Submit.' },
    { q: 'Refund?', a: '14 Tage.' },
  ],
};

const newsletterGrowthMachine: ShopItemContent = {
  slug: 'newsletter-growth-machine',
  name: 'Newsletter Growth Machine',
  type: 'blueprint',
  priceLabel: '€127',
  price: 127,
  stripePriceId: 'price_1TaLJG200IKJdPehnXDCVoPS',
  securityLevel: 'basic',
  icp: ['PB', 'AG'],
  category: 'Content',
  tagline: 'Newsletter-Ideen → Outline → Draft → Versand-Queue. 80% automatisiert.',
  whatIsIt:
    'Recherche-Bot scannt deine Quellen (RSS, X, LinkedIn-Saved-Posts, eigene Notes), schlägt 5 Newsletter-Themen vor. Du wählst eins, der Workflow generiert Outline → Draft → Subject-Line-Varianten → Versand-Queue in deinem Newsletter-Tool (Beehiiv/ConvertKit/Substack).',
  outcomes: [
    'Newsletter-Produktion von 4-6h auf 60-90 Minuten',
    'Konsistente Wochen-Frequenz statt "wenn Zeit ist"',
    'A/B-Subject-Lines automatisch generiert',
  ],
  whenItFits: {
    fits: [
      'Personal Brand mit Newsletter (1k+ Subs, will wachsen)',
      'B2B-Founder der Thought-Leadership-Newsletter schreibt',
      'Solo der Newsletter aufschiebt weil Schreiben dauert',
    ],
    requires: [
      'Newsletter-Tool mit API (Beehiiv, ConvertKit, Substack, Brevo)',
      'LLM-API (Anthropic empfohlen)',
      'Mindestens 1-2 RSS/Source-URLs für Recherche',
    ],
  },
  includes: [
    'n8n-Workflow JSON',
    'Prompt-Templates (Recherche → Outline → Draft)',
    'PDF-Guide (10 Seiten)',
    'Subject-Line-A/B-Variation-Logic',
  ],
  faq: [
    { q: 'Klingt das nach AI-Schrott?', a: 'Nicht wenn du deinen Voice-Style fütterst. Output ist Draft, du polierst — wie ein Junior-Editor.' },
    { q: 'Welche Newsletter-Tools?', a: 'Beehiiv, ConvertKit, Substack, Brevo nativ. Custom via Webhook.' },
    { q: 'Refund?', a: '14 Tage.' },
  ],
};

const coldOutreachSystem: ShopItemContent = {
  slug: 'cold-outreach-system',
  name: 'Cold Outreach System',
  type: 'blueprint',
  tag: 'Neu',
  priceLabel: '€247',
  price: 247,
  stripePriceId: 'price_1TaLJH200IKJdPehM6Npgour',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Leads',
  tagline: 'Personalisierte Cold-Outreach-Sequenzen via LLM. DSGVO-konform.',
  whatIsIt:
    'Lead-Liste rein → der Workflow recherchiert pro Lead öffentliche Signals (LinkedIn-Bio, Company-News, Tech-Stack), generiert 3-5 personalisierte E-Mails als Sequenz mit Follow-ups, schedulet sie in deinem Outbound-Tool (Smartlead/Instantly/Apollo).',
  outcomes: [
    'Cold-Outreach mit "Mass-Customization": jede Email fühlt sich personal an',
    '3-5x Response-Rate vs Template-Mass-Send',
    'DSGVO-konform: Berechtigte-Interessen-Logik dokumentiert, Opt-out automatisch',
  ],
  whenItFits: {
    fits: [
      'B2B-Agentur mit aktivem Outbound',
      'Sales-Team das skalierte Personalisierung braucht',
      'Founder im Sales-Mode mit 100-500 Cold-Leads/Monat',
    ],
    requires: [
      'Outbound-Tool (Smartlead, Instantly, Apollo)',
      'Lead-Liste (Apollo-Export, LinkedIn-Sales-Navi-Export)',
      'LLM-API + Web-Search-API (Tavily empfohlen)',
    ],
  },
  includes: [
    'n8n-Workflow JSON',
    'DSGVO-konforme Email-Templates (5 Branchen-Varianten)',
    'PDF-Guide (15 Seiten)',
    'Berechtigte-Interessen-Logik-Doku',
    'Opt-out-Auto-Handler',
    'Personalization-Prompt-Library',
  ],
  pricingNote: 'DSGVO-Premium. Berechtigte-Interessen-Doku spart Rechts-Stress.',
  securityNote:
    'DSGVO-Level: Opt-out-Automation, Erasure-API, EU-Datenverarbeitung Pflicht. Berechtigte-Interessen-Vorlage anwaltsgeprüft.',
  faq: [
    { q: 'Ist Cold-Outreach in DE überhaupt legal?', a: 'B2B ja, unter Berechtigtem Interesse. Wir liefern die Doku-Vorlage. B2C nein, Workflow ist nur für B2B.' },
    { q: 'Welche Outbound-Tools?', a: 'Smartlead, Instantly, Apollo nativ. Andere via Webhook.' },
    { q: 'Spam-Risiko?', a: 'Workflow sendet mit Personalisierung + Daily-Cap. Bei korrektem Setup: <0.5% Spam-Rate.' },
    { q: 'Refund?', a: '14 Tage.' },
  ],
};

/* ──────────────────── BUNDLE (1) ──────────────────── */

const bundleAll: ShopItemContent = {
  slug: 'bundle-all',
  name: 'Blueprint Bundle — Alle 6',
  type: 'bundle',
  tag: 'Best Value',
  priceLabel: '€697',
  price: 697,
  stripePriceId: 'price_1TaYNT200IKJdPeh6HiWbWg5',
  securityLevel: 'business',
  icp: ['AG', 'PB', 'FI'],
  category: 'Bundle',
  tagline: 'Alle 6 Blueprints in einem Paket. Spare €515 vs Einzelkauf.',
  whatIsIt:
    'Komplette Blueprint-Sammlung: Content-Factory, Lead-Qualifier Pro, Reporting-Dashboard, Onboarding-Autopilot, Newsletter-Growth-Machine, Cold-Outreach-System. Decke Content, Leads, Reporting, Automatisierung in einem Bundle ab.',
  outcomes: [
    '€515 Ersparnis vs Einzelkauf (€1.212 → €697)',
    'Komplettes Tool-Set für eine Agentur oder skalierenden Solo',
    'Cross-Workflows: Outreach → Qualifier → Reporting nahtlos kombinierbar',
    '+6.970 Credits mit Account-Kauf',
  ],
  whenItFits: {
    fits: [
      'Agentur die Content + Leads + Reporting unter Dach braucht',
      'Founder der mehrere Workflows gleichzeitig deployen will',
      'Käufer die alle Bausteine eh planen statt einzeln',
    ],
    requires: [
      'n8n-Account (self-hosted für DSGVO-Blueprints, sonst cloud)',
      'LLM-API + Newsletter/CRM/Outbound-Tool-Zugang',
    ],
  },
  includes: [
    'Alle 6 Blueprints (siehe Einzel-Pages für Details)',
    '6 n8n-Workflow-JSONs',
    '6 PDF-Setup-Guides (insg. ~70 Seiten)',
    'Komplette Prompt-Libraries',
    'DSGVO-Compliance-Doku für die Premium-Workflows',
  ],
  pricingNote: '€515 günstiger als Einzelkauf. Mit Account: +6.970 Credits.',
  faq: [
    { q: 'Kann ich Blueprints einzeln kriegen statt Bundle?', a: 'Ja, jeder hat eine Detail-Page mit eigenem Kauf-Button.' },
    { q: 'Refund auf einzelne Blueprints?', a: 'Bundle ist Bundle — Refund nur als Komplett-Rückgabe (14 Tage).' },
    { q: 'Updates?', a: 'Alle 6 Blueprints kriegen Major-Updates 12 Monate kostenlos.' },
  ],
};

/* ──────────────────── CONSOLIDATED DFY (5 + 2 specials, 2026-05-24) ─────
 * 12 DFY-Services konsolidiert auf 5 Kern + 2 Industry-Specifics.
 * Alte Slugs (business-os, command-center-dashboard, ...) bleiben als
 * Legacy-Detail-Pages erhalten — neue Shop-Hauptliste verwendet die
 * `aevum-*`-Slugs.
 * Memory: feedback_aevum_5_service_consolidation_2026_05_24
 *
 * Mapping alt → neu:
 *   business-os + database-system + website-crm  →  aevum-business-os
 *   command-center-dashboard + hud-command-center →  aevum-command-center
 *   ai-lead-engine + sales-os                     →  aevum-lead-engine
 *   content-engine + newsletter-growth-machine +
 *     cold-outreach-system (DFY-Aspekte)           →  aevum-content-engine
 *   automation-audit                              →  aevum-audit
 *   ecommerce-os + script-factory-dfy             →  bleiben separat (Industry)
 */

const aevumBusinessOS: ShopItemContent = {
  slug: 'aevum-business-os',
  name: 'AEVUM Business OS',
  type: 'dfy',
  tag: 'Komplett',
  priceLabel: 'ab €4.500 Setup + €899/Mo',
  securityLevel: 'business',
  icp: ['FI', 'AG', 'PB'],
  category: 'Infrastruktur',
  tagline: 'Komplette Unternehmens-Infrastruktur — alles verbunden in einem System.',
  whatIsIt:
    'Wir bauen dir die Unternehmens-Infrastruktur als Einheit: Datenbank-Backend (statt Excel-Wildwuchs), Website + CRM (statt isolierter Tools), Automation-Layer (n8n + Custom-Code). Alles spricht miteinander. Custom konzipiert für deine Prozesse — kein Template.',
  outcomes: [
    'Tool-Wildwuchs raus: ein verbundenes System statt 5 SaaS-Inseln',
    'Operations-Stunden oft 30-50% reduzierbar',
    'KPI-Single-Source-of-Truth statt Reporting-Patchwork',
    'Skaliert von 1k auf 1M Datensätze ohne Schmerz',
  ],
  whenItFits: {
    fits: [
      'Firmen €500k-€5M Umsatz mit Skalierungs-Druck',
      'Agenturen ab 5-15 Mitarbeitern mit Tool-Chaos',
      'Founder die "alles in einem System" wollen statt Tool-Stack',
    ],
    requires: [
      'Audit-Call (kostenlos) für Scope-Klärung',
      'Bereitschaft 4-8 Wochen Setup-Phase',
      'Min. 1 interner Sparrings-Kontakt für Daten + Prozesse',
    ],
  },
  includes: [
    'Vollständiges Audit (Ist-Analyse)',
    'Custom-Architektur-Plan',
    'Datenbank-Backend (Postgres) + Admin-UI',
    'Website (Next.js/Astro) + CRM-Layer',
    'n8n-Automation-Workflows',
    'Onboarding deines Teams',
    'Monatliche Optimierung im Retainer',
  ],
  pricingNote: 'Setup einmalig, Retainer für Hosting + Maintenance + Optimierung.',
  faq: [
    { q: 'Was unterscheidet euch von Make/Zapier-Consultants?', a: 'Wir bauen produktive Systeme mit Code-Backbone wenn nötig. Nicht 50 Zaps die monatlich brechen.' },
    { q: 'Kann ich später wechseln?', a: 'Ja — alle Workflows + Data-Models gehören dir, wir verwalten nur Hosting.' },
    { q: 'Daten-Hoheit?', a: 'Volle Hoheit — Dump jederzeit möglich, du besitzt die DB.' },
    { q: 'Wie geht der Audit?', a: '60min Call → schriftliches Angebot in 3-5 Tagen.' },
  ],
};

const aevumCommandCenter: ShopItemContent = {
  slug: 'aevum-command-center',
  name: 'AEVUM Command Center',
  type: 'dfy',
  priceLabel: 'ab €1.800 Setup + €279/Mo',
  securityLevel: 'business',
  icp: ['FI', 'AG', 'PB'],
  category: 'Reporting',
  tagline: 'Live-KPI-Dashboard + Mobile-HUD via Telegram + KI-Insights.',
  whatIsIt:
    'Custom Dashboard das deine wichtigsten KPIs aus allen Quellen aggregiert: Revenue, Pipeline, Operations, Marketing. Web + Mobile (Telegram-Mini-App im HUD-Format). Live-Daten, KI-Insights (Anomalien, Trends, To-dos), Push-Alerts. Business-Status in 5 Sek vom Handy.',
  outcomes: [
    'CEO-Sicht in 30 Sek statt 30 Min',
    'KI flaggt Anomalien bevor sie groß werden',
    'Push-Notifications bei Big-Sale / Anomalie / neuer Lead',
    'Investor-Updates in 5 Min exportierbar',
  ],
  whenItFits: {
    fits: [
      'Firmen mit 3+ Tools die Daten halten',
      'Founder die mobile-first arbeiten',
      'Teams die "wo sind wir?"-Meetings reduzieren wollen',
    ],
    requires: [
      'API-Zugriff zu deinen Daten-Quellen',
      'Audit-Call für KPI-Definition',
      'Telegram-Account für Mobile-HUD (optional)',
    ],
  },
  includes: [
    'KPI-Definition-Workshop',
    'Custom-Dashboard-Build (Web + Telegram-HUD)',
    'KI-Insight-Layer (Anomaly-Detection, Trend-Analyse)',
    'Push-Notification-Logic',
    'Setup von Data-Connections',
    'Monatliche KPI-Reviews im Retainer',
  ],
  faq: [
    { q: 'Welche Tools im Stack?', a: 'Postgres + Next.js + Recharts + Telegram-Mini-App. Daten-Quellen via n8n.' },
    { q: 'Kann ich Daten exportieren?', a: 'Ja — Postgres ist deine, jederzeit Dump möglich.' },
    { q: 'Sicherheit Mobile-HUD?', a: 'TG-initData-Auth + Whitelist-User-IDs. Kein Public-Access.' },
  ],
};

const aevumLeadEngine: ShopItemContent = {
  slug: 'aevum-lead-engine',
  name: 'AEVUM Lead-Engine',
  type: 'dfy',
  priceLabel: 'ab €2.200 Setup + €459/Mo',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Leads',
  tagline: 'End-to-end Lead-System: Gen + Qualify + CRM + Sales-Pipeline.',
  whatIsIt:
    'Kompletter Funnel: Inbound-Forms + Outbound-Outreach + 7-Kriterien-Qualifier + CRM-Sync + Follow-up-Automation + Angebot-Generator. Sales-Cycle endet nicht im Form-Tool-Limbo, sondern in geschlossenem Deal.',
  outcomes: [
    '2-5x mehr qualifizierte Calls pro Monat',
    'Vertriebszeit für Pre-Qualification: -70%',
    'Sales-Cycle 20-40% verkürzt durch automatisierte Follow-ups',
    'DSGVO-konformer Funnel mit Audit-Log',
  ],
  whenItFits: {
    fits: [
      'B2B-Agentur / SaaS mit Cold-Outreach-Bedarf',
      'Sales-Teams 2-10 Personen',
      'Firmen mit chaotischem CRM und Sales-Bottleneck',
    ],
    requires: [
      'CRM (HubSpot, Pipedrive, Salesforce, Notion-CRM) ODER Bereitschaft zu Setup',
      'Audit-Call',
    ],
  },
  includes: [
    'Lead-Capture-Forms (Custom-Brand)',
    'Cold-Outreach-System (DSGVO-konform)',
    'Lead-Qualifier (LLM-basiert, 7-Kriterien)',
    'CRM-Setup oder Migration',
    'Pipeline-Definition + Stages',
    'Follow-up-Automation (n8n)',
    'Angebot-Generator (PDF + Stripe-Link)',
    'Reporting-Dashboard für Lead-Flow',
  ],
  faq: [
    { q: 'Wie viele Leads pro Monat?', a: 'System skaliert bis 5k-10k Leads/Monat. Setup-Phase definiert Ziel-Volume.' },
    { q: 'DSGVO sicher?', a: 'Ja — EU-Hosting, Audit-Log, DPA-Vorlage, Erasure-API.' },
    { q: 'Retainer-Kündigung?', a: '3 Monate Mindestlaufzeit, dann monatlich.' },
  ],
};

const aevumContentEngine: ShopItemContent = {
  slug: 'aevum-content-engine',
  name: 'AEVUM Content-Engine',
  type: 'dfy',
  priceLabel: 'ab €900 Setup + €459/Mo',
  securityLevel: 'business',
  icp: ['PB', 'AG'],
  category: 'Content',
  tagline: 'Content-Produktion full-stack: Blog + Social + Newsletter + Outreach.',
  whatIsIt:
    'Multi-Channel Content-Maschine: Themen-Research → Outline → Draft → Visual → Publish. Blog + Social + Newsletter + Cold-Outreach in einem System. Voice-Training auf deine Marke, Review-Queue (du gibst frei), monatliche Strategie-Reviews.',
  outcomes: [
    '5-15 Stücke Content pro Woche statt 1-2',
    'Newsletter-Produktion von 4-6h auf 60-90 Min',
    'SEO-Traffic-Wachstum durch konsistente Frequenz',
    'Brand-Voice konsistent durch Voice-Library',
  ],
  whenItFits: {
    fits: [
      'Personal Brands die wachsen wollen aber keine Zeit haben',
      'Agenturen mit Content-Bottleneck',
      'B2B-Founder die Thought-Leadership skalieren',
    ],
    requires: [
      'Voice-Sample (10-20 deiner Posts/Blogs)',
      'API-Zugang zu deinen Channels',
      'Newsletter-Tool mit API (Beehiiv/ConvertKit/Substack/Brevo) wenn Newsletter Teil ist',
    ],
  },
  includes: [
    'Voice-Library-Training auf deine Posts',
    'Multi-Channel-Workflows (Blog + Social + Newsletter)',
    'Cold-Outreach-Komponente (DSGVO-konform, optional)',
    'Review-Queue (du gibst frei)',
    'Monatliche Content-Strategie-Reviews',
  ],
  faq: [
    { q: 'AI-Schrott-Output?', a: 'Nicht wenn Voice-Training und Review-Queue genutzt werden. Niemand pushed Raw-AI — du checkst final.' },
    { q: 'Wieviel Output pro Monat?', a: 'Setup-Phase definiert Volume. Typisch: 15-40 Stücke/Monat.' },
    { q: 'Welche Newsletter-Tools?', a: 'Beehiiv, ConvertKit, Substack, Brevo nativ. Custom via Webhook.' },
    { q: 'Kündigung?', a: '3 Monate, dann monatlich.' },
  ],
};

const aevumAudit: ShopItemContent = {
  slug: 'aevum-audit',
  name: 'AEVUM Audit',
  type: 'dfy',
  tag: 'Einstieg',
  priceLabel: '€1.199 einmalig',
  securityLevel: 'business',
  icp: ['AG', 'PB', 'FI'],
  category: 'Analyse',
  tagline: 'Strategie-Audit in 48h. Top-3 Quick-Wins + Pitch-Report + Roadmap.',
  whatIsIt:
    'Wir analysieren deine Prozesse, Tools und Daten-Flows. Output: Top-3 Quick-Wins mit konkretem Umsetzungsplan (Aufwand, Kosten, Outcome) + Long-Term-Roadmap. Festpreis, kein Retainer. Bei Folge-Auftrag werden 50% angerechnet.',
  outcomes: [
    'Klare Priorisierung statt "wir sollten mal automatisieren"',
    'Top-3 Quick-Wins mit ROI-Schätzung',
    'Long-Term-Roadmap für 6-12 Monate',
    'Pitch-Report PDF zum Mitnehmen',
  ],
  whenItFits: {
    fits: [
      'Firmen die wissen "irgendwo gehts schief" aber nicht wo',
      'Founder die externe Sicht wollen bevor sie investieren',
      'Teams mit anstehender Tooling-Entscheidung',
    ],
    requires: [
      'Bereitschaft zu 2-3 Calls (60-90 Min)',
      'Read-Access zu deinen wichtigsten Tools',
    ],
  },
  includes: [
    'Kickoff-Call (60 Min)',
    'Tool-Stack-Analyse + Prozess-Mapping',
    'PDF-Report (15-25 Seiten) mit Top-3 Quick-Wins + Roadmap',
    'Closing-Call zur Diskussion',
    'Bei Umsetzungsauftrag: 50% Audit-Kosten werden gutgeschrieben',
  ],
  pricingNote: 'Einmalig €1.199, kein Retainer. Audit kann angerechnet werden auf späteren Build.',
  faq: [
    { q: 'Wie kurz ist 48h wirklich?', a: 'Kickoff → 48h später PDF + Closing-Call. Realistisch für mittlere Komplexität.' },
    { q: 'Was wenn ich nichts umsetzen will?', a: 'Du behältst Report + Roadmap. Kein Push-Sales.' },
    { q: 'Gutschrift bei Folge-Auftrag?', a: 'Ja, 50% der Audit-Kosten werden auf Setup angerechnet.' },
  ],
};

/* ──────────────────── DFY SERVICES (Legacy + Industry-Specific) ──────────────────── */

const businessOS: ShopItemContent = {
  slug: 'business-os',
  name: 'Business OS',
  type: 'dfy',
  priceLabel: 'ab €4.500 Setup + €899/Mo',
  securityLevel: 'business',
  icp: ['FI', 'AG'],
  category: 'Infrastruktur',
  tagline: 'Dein gesamtes Unternehmen in einem KI-System — alles verbunden.',
  whatIsIt:
    'Wir bauen dir ein integriertes Business-System: Automatisierung, Reporting, Kommunikation, Daten. Alles spricht miteinander. Custom konzipiert für deine Prozesse, nicht Template-Anpassung.',
  outcomes: [
    'Schluss mit Tool-Wildwuchs (Excel + Slack + 3 SaaS-Tools)',
    'Operations-Stunden pro Woche oft 30-50% reduzierbar',
    'KPI-Single-Source-of-Truth statt Reporting-Patchwork',
  ],
  whenItFits: {
    fits: [
      'Firmen €500k-€5M Umsatz mit Skalierungs-Druck',
      'Agenturen ab 5-15 Mitarbeitern',
      'Founder die "alles in einem System" wollen statt Tool-Stack',
    ],
    requires: [
      'Audit-Call (kostenlos) für Scope-Klärung',
      'Bereitschaft 4-8 Wochen Setup-Phase',
      'Min. 1 interner Sparrings-Kontakt für Daten + Prozesse',
    ],
  },
  includes: [
    'Vollständiges Audit (Ist-Analyse)',
    'Custom-Architektur-Plan',
    'Setup + Integration (n8n + Postgres + Dashboards)',
    'Onboarding deines Teams',
    'Monatliche Optimierung im Retainer',
  ],
  pricingNote: 'Setup einmalig, Retainer für Hosting + Maintenance + Optimierung.',
  faq: [
    { q: 'Was unterscheidet euch von Make/Zapier-Consultants?', a: 'Wir bauen produktive Systeme mit Code-Backbone wenn nötig. Nicht 50 Zaps die monatlich brechen.' },
    { q: 'Kann ich später wechseln?', a: 'Ja — alle Workflows + Data-Models gehören dir, wir verwalten nur Hosting.' },
    { q: 'Wie geht der Audit?', a: '60min Call → schriftliches Angebot in 3-5 Tagen.' },
  ],
};

const commandCenterDashboard: ShopItemContent = {
  slug: 'command-center-dashboard',
  name: 'Command Center Dashboard',
  type: 'dfy',
  priceLabel: 'ab €1.800 Setup + €279/Mo',
  securityLevel: 'business',
  icp: ['FI', 'AG', 'PB'],
  category: 'Reporting',
  tagline: 'Echtzeit-CEO-Dashboard mit KI-Insights. Alle KPIs auf einen Blick.',
  whatIsIt:
    'Custom Dashboard das deine wichtigsten KPIs aus allen Quellen aggregiert: Revenue, Pipeline, Operations, Marketing. Live-Daten, KI-generierte Insights (Anomalien, Trends, To-dos), per Web + mobile zugänglich.',
  outcomes: [
    'CEO-Sicht in 30 Sekunden statt 30 Minuten',
    'KI flaggt Anomalien bevor sie groß werden',
    'Investor-Updates in 5 Minuten exportierbar',
  ],
  whenItFits: {
    fits: [
      'Firmen mit 3+ Tools die Daten halten',
      'Founder die Dashboards bauen wollen aber Zeit fehlt',
      'Teams die "wo sind wir?"-Meetings reduzieren wollen',
    ],
    requires: [
      'API-Zugriff zu deinen Daten-Quellen',
      'Audit-Call für KPI-Definition',
    ],
  },
  includes: [
    'KPI-Definition-Workshop',
    'Custom-Dashboard-Build (Web + Mobile)',
    'KI-Insight-Layer (Anomaly-Detection, Trend-Analyse)',
    'Setup von Data-Connections',
    'Monatliche KPI-Reviews im Retainer',
  ],
  faq: [
    { q: 'Welche Tools im Stack?', a: 'Postgres + Next.js + Recharts. Daten-Quellen via n8n. Hosting auf unseren Servern oder deinem Cloud-Provider.' },
    { q: 'Kann ich Daten exportieren?', a: 'Ja — Postgres ist deine, jederzeit Dump möglich.' },
    { q: 'Mobile?', a: 'Responsive Web + optional Telegram-Mini-App im HUD-Format (siehe HUD Command Center).' },
  ],
};

const aiLeadEngine: ShopItemContent = {
  slug: 'ai-lead-engine',
  name: 'AI Lead Engine',
  type: 'dfy',
  priceLabel: 'ab €1.400 Setup + €459/Mo',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Leads',
  tagline: 'Autonome 24/7 Lead-Generierung und -Qualifizierung.',
  whatIsIt:
    'End-to-end Lead-System: Inbound-Forms + Outbound-Outreach + Qualifier + CRM-Sync. Wir bauen den kompletten Funnel inkl. DSGVO-Compliance.',
  outcomes: [
    '2-5x mehr qualifizierte Calls pro Monat',
    'Vertriebszeit für Pre-Qualification: -70%',
    'DSGVO-konformer Funnel mit Audit-Log',
  ],
  whenItFits: {
    fits: [
      'B2B-Agentur / SaaS mit Cold-Outreach-Bedarf',
      'Sales-Teams 2-10 Personen',
      'Firmen die Lead-Gen aktuell teuer outsourcen',
    ],
    requires: [
      'CRM (HubSpot, Pipedrive, Salesforce, Notion-CRM)',
      'Audit-Call',
    ],
  },
  includes: [
    'Lead-Capture-Forms (Custom-Brand)',
    'Cold-Outreach-System (DSGVO-konform)',
    'Lead-Qualifier (LLM-basiert, 7-Kriterien)',
    'CRM-Integration',
    'Reporting-Dashboard für Lead-Flow',
  ],
  faq: [
    { q: 'Wie viele Leads pro Monat?', a: 'System skaliert bis 5k-10k Leads/Monat. Setup-Phase definiert Ziel-Volume.' },
    { q: 'DSGVO sicher?', a: 'Ja — EU-Hosting, Audit-Log, DPA-Vorlage, Erasure-API.' },
    { q: 'Retainer-Kündigung?', a: '3 Monate Mindestlaufzeit, dann monatlich.' },
  ],
};

const salesOS: ShopItemContent = {
  slug: 'sales-os',
  name: 'Sales OS',
  type: 'dfy',
  priceLabel: 'ab €2.200 Setup + €359/Mo',
  securityLevel: 'business',
  icp: ['AG', 'FI'],
  category: 'Sales',
  tagline: 'Vollständiges Sales-System — Pipeline, Follow-ups, Angebote, Reports.',
  whatIsIt:
    'Komplettes Sales-Stack: CRM-Setup oder Migration, Pipeline-Stages, Follow-up-Automation, Angebot-Generator, Reporting. Dein Vertrieb läuft auf Schienen statt aus Notion+E-Mail.',
  outcomes: [
    'Sales-Cycle 20-40% verkürzt durch automatisierte Follow-ups',
    'Angebote in Minuten statt Stunden',
    'Pipeline-Visibility statt "ich glaub Lead X war interessiert"',
  ],
  whenItFits: {
    fits: [
      'Vertriebsteams mit chaotischem CRM',
      'Founder mit Sales-Bottleneck',
      'Agenturen die Angebote oft personalisieren müssen',
    ],
    requires: [
      'Audit-Call',
      'Existing CRM ODER Bereitschaft zu Setup',
    ],
  },
  includes: [
    'CRM-Setup oder Migration',
    'Pipeline-Definition + Stages',
    'Follow-up-Automation (n8n)',
    'Angebot-Generator (PDF + Stripe-Link)',
    'Sales-Reporting-Dashboard',
  ],
  faq: [
    { q: 'Welches CRM?', a: 'HubSpot oder Pipedrive empfohlen. Auch Notion/Airtable möglich für kleinere Teams.' },
    { q: 'Migrationen aufwendig?', a: 'Wir migrieren bestehende Daten als Teil des Setups.' },
    { q: 'Kündigung?', a: '3 Monate, dann monatlich.' },
  ],
};

const ecommerceOS: ShopItemContent = {
  slug: 'ecommerce-os',
  name: 'E-Commerce OS',
  type: 'dfy',
  priceLabel: 'ab €2.800 Setup + €459/Mo',
  securityLevel: 'business',
  icp: ['FI', 'PB'],
  category: 'E-Commerce',
  tagline: 'Komplettes E-Commerce-System — Shop, Inventory, Payments, Automation.',
  whatIsIt:
    'Shopify-Headless oder Custom-Shop + Inventory-Sync + Email-Automation + Reporting. Wir bauen oder optimieren deinen E-Commerce-Stack so dass Operations skaliert.',
  outcomes: [
    'Order-zu-Fulfillment-Zeit -40-60%',
    'Inventory-Sync ohne Excel-Manuell',
    'Email-Flows die nachweislich konvertieren',
  ],
  whenItFits: {
    fits: [
      'DTC-Brands mit 500-50k Bestellungen/Monat',
      'Shopify-Stores mit Operations-Schmerz',
      'Personal Brands die Shop neu starten',
    ],
    requires: [
      'Shopify-Account ODER Bereitschaft zu Custom-Shop',
      'Audit-Call',
    ],
  },
  includes: [
    'Shop-Setup oder Optimierung (Shopify Headless oder Custom)',
    'Inventory-Sync (Multi-Channel wenn nötig)',
    'Email-Automation (Klaviyo / Brevo)',
    'Reporting-Dashboard',
    'Operations-Workflows (Returns, Reviews, Restocks)',
  ],
  faq: [
    { q: 'Nur Shopify?', a: 'Bevorzugt, aber WooCommerce + Custom-Setups möglich.' },
    { q: 'Migrationen vom alten Shop?', a: 'Ja, Produkt + Order + Customer-Migration inklusive.' },
    { q: 'Kündigung?', a: '3 Monate, dann monatlich.' },
  ],
};

const automationAudit: ShopItemContent = {
  slug: 'automation-audit',
  name: 'Automation Audit',
  type: 'dfy',
  tag: 'Einstieg',
  priceLabel: '€1.199 einmalig',
  securityLevel: 'business',
  icp: ['AG', 'PB', 'FI'],
  category: 'Analyse',
  tagline: 'Prozessanalyse in 48h. Top-3 Quick-Wins mit Umsetzungsplan.',
  whatIsIt:
    'Wir analysieren deine Prozesse, Tools und Daten-Flows. Output: Top-3 Quick-Wins mit konkretem Umsetzungsplan (Aufwand, Kosten, Outcome) + Long-Term-Roadmap. Festpreis, kein Retainer.',
  outcomes: [
    'Klare Priorisierung statt "wir sollten mal automatisieren"',
    'Top-3 Quick-Wins mit ROI-Schätzung',
    'Long-Term-Roadmap für 6-12 Monate',
  ],
  whenItFits: {
    fits: [
      'Firmen die wissen "irgendwo gehts schief" aber nicht wo',
      'Founder die externe Sicht wollen bevor sie investieren',
      'Teams die Tooling-Entscheidungen anstehen haben',
    ],
    requires: [
      'Bereitschaft zu 2-3 Calls (60-90 Min)',
      'Read-Access zu deinen wichtigsten Tools',
    ],
  },
  includes: [
    'Kickoff-Call (60 Min)',
    'Tool-Stack-Analyse + Prozess-Mapping',
    'PDF-Report (15-25 Seiten) mit Top-3 Quick-Wins + Roadmap',
    'Closing-Call zur Diskussion',
    'Bei Umsetzungsauftrag: Audit-Kosten werden 50% gutgeschrieben',
  ],
  pricingNote: 'Einmalig €1.199, kein Retainer. Audit kann angerechnet werden auf späteren Build.',
  faq: [
    { q: 'Wie kurz ist 48h wirklich?', a: 'Kickoff → 48h später PDF + Closing-Call. Realistic für mittlere Komplexität.' },
    { q: 'Was wenn ich nichts umsetzen will?', a: 'Du behältst Report + Roadmap. Kein Push-Sales.' },
    { q: 'Gutschrift bei Folge-Auftrag?', a: 'Ja, 50% der Audit-Kosten werden auf Setup angerechnet.' },
  ],
};

const websiteCrm: ShopItemContent = {
  slug: 'website-crm',
  name: 'Website + CRM',
  type: 'dfy',
  priceLabel: 'ab €1.400 Setup + €179/Mo',
  securityLevel: 'business',
  icp: ['AG', 'PB', 'FI'],
  category: 'Infrastruktur',
  tagline: 'Landing Page + Datenbank + n8n-Automation — alles verbunden.',
  whatIsIt:
    'Custom-Landing oder Multi-Page-Site + CRM-Backend + Automation-Layer. Form-Submissions landen direkt in qualifizierter Pipeline, nicht in Form-Tool-Limbo.',
  outcomes: [
    'Schluss mit "Form → E-Mail → CRM-manuell"',
    'Site + Daten + Workflows aus einer Hand',
    'Sub-1s Load-Speed, SEO-ready',
  ],
  whenItFits: {
    fits: [
      'Solo-Founder die ersten echten Funnel aufbauen',
      'Agenturen die Landing + Backend brauchen',
      'Firmen mit Wordpress-Frust',
    ],
    requires: [
      'Domain (oder wir helfen)',
      'Audit-Call für Scope',
    ],
  },
  includes: [
    'Custom-Website (Next.js / Astro)',
    'CRM-Backend (Postgres + Custom-Admin)',
    'n8n-Automation-Workflows',
    'SEO-Setup + Analytics',
    'Monatliche Pflege im Retainer',
  ],
  faq: [
    { q: 'Wordpress?', a: 'Nein — wir bauen modern (Next.js/Astro). Performanter, sicherer, wartbarer.' },
    { q: 'Wie viele Pages?', a: 'Setup-Preis deckt bis 5 Pages. Mehr ist Custom-Quote.' },
    { q: 'Kündigung Retainer?', a: 'Monatlich, kein Lock-in.' },
  ],
};

const databaseSystem: ShopItemContent = {
  slug: 'database-system',
  name: 'Database System',
  type: 'dfy',
  priceLabel: 'ab €900 Setup + €129/Mo',
  securityLevel: 'business',
  icp: ['FI', 'AG'],
  category: 'Infrastruktur',
  tagline: 'Professionelles Datenbank-Backend mit Workflows. Excel war gestern.',
  whatIsIt:
    'Custom-Datenbank (Postgres oder Airtable je nach Komplexität) + Admin-UI + Workflows + API. Für Use-Cases wo Excel/Notion/Airtable an Limits stoßen.',
  outcomes: [
    'Daten ein Ort, eine Wahrheit',
    'API für externe Tools statt Copy-Paste',
    'Skaliert von 1k auf 1M Rows ohne Schmerz',
  ],
  whenItFits: {
    fits: [
      'Firmen mit Excel-Spreadsheets > 5k Rows',
      'Teams die Daten zwischen 3+ Tools jagen',
      'Use-Cases wo Airtable-Limits greifen (50k Rows, slow)',
    ],
    requires: [
      'Audit-Call für Schema-Design',
    ],
  },
  includes: [
    'Schema-Design (Tabellen, Relationen, Indexe)',
    'Admin-UI (Filter, Sort, Edit, Bulk-Operations)',
    'API + Webhook-Endpoints',
    'Workflow-Layer (n8n)',
    'Hosting + Backup im Retainer',
  ],
  faq: [
    { q: 'Postgres oder Airtable?', a: 'Kommt auf Komplexität an: <50k Rows + viele User → Airtable. Komplex / API-heavy / >50k Rows → Postgres.' },
    { q: 'Datenmigration?', a: 'Excel/Airtable/Sheets-Migration inklusive im Setup.' },
    { q: 'Daten-Hoheit?', a: 'Volle Hoheit — Dump jederzeit möglich, du besitzt die DB.' },
  ],
};

const contentEngine: ShopItemContent = {
  slug: 'content-engine',
  name: 'Content Engine',
  type: 'dfy',
  priceLabel: 'ab €450 Setup + €459/Mo',
  securityLevel: 'business',
  icp: ['PB', 'AG'],
  category: 'Content',
  tagline: 'Autonome KI-Content-Fabrik für Blog, Social, SEO. Rund um die Uhr.',
  whatIsIt:
    'Wir bauen dir eine Content-Maschine: Themen-Research → Outline → Draft → Visual → Publish. Multi-Channel (Blog, LinkedIn, Instagram, Twitter). Im Retainer schreiben wir Voice-Tuning weiter.',
  outcomes: [
    '5-15 Stücke Content pro Woche statt 1-2',
    'SEO-traffic-Wachstum durch konsistente Frequenz',
    'Brand-Voice bleibt konsistent durch Voice-Library',
  ],
  whenItFits: {
    fits: [
      'Personal Brands die wachsen wollen aber keine Zeit haben',
      'Agenturen mit Content-Bottleneck',
      'B2B-Founder die Thought-Leadership skalieren',
    ],
    requires: [
      'Voice-Sample (10-20 deiner Posts/Blogs)',
      'API-Zugang zu deinen Channels',
    ],
  },
  includes: [
    'Voice-Library-Training auf deine Posts',
    'Multi-Channel-Workflows (Blog + Social)',
    'Review-Queue (du gibst frei)',
    'Monatliche Content-Strategie-Reviews',
  ],
  faq: [
    { q: 'AI-Schrott-Output?', a: 'Nein wenn Voice-Training und Review-Queue genutzt werden. Niemand pushed Raw-AI raw — du checkst final.' },
    { q: 'Wieviel Output pro Monat?', a: 'Setup-Phase definiert Volume. Typisch: 15-40 Stücke/Monat.' },
    { q: 'Kündigung?', a: '3 Monate, dann monatlich.' },
  ],
};

const hudCommandCenter: ShopItemContent = {
  slug: 'hud-command-center',
  name: 'HUD Command Center',
  type: 'dfy',
  tag: '🔥 Neu',
  priceLabel: 'ab €1.200 Setup + €199/Mo',
  securityLevel: 'business',
  icp: ['AG', 'PB', 'FI'],
  category: 'Premium',
  tagline: 'Dein Business als Live-Dashboard im Telegram. Mobile-first.',
  whatIsIt:
    'Telegram-Mini-App die deine wichtigsten KPIs live anzeigt. Section-Drill-Down (Tap auf Revenue → Stripe-Detail), KI-Agent direkt im Chat ("Wie liefs heute?"), Push-Notifications bei Anomalien.',
  outcomes: [
    'Business-Status in 5 Sekunden vom Handy',
    'KI-Agent on-demand für Daten-Fragen',
    'Push bei wichtigen Events (Big-Sale, Anomalie, neuer Lead)',
  ],
  whenItFits: {
    fits: [
      'Founder die Mobile-First arbeiten',
      'Teams die Chat-Driven leben (Telegram/Slack)',
      'Power-User die "Dashboard öffnen am Laptop" zu langsam finden',
    ],
    requires: [
      'Telegram-Account',
      'Existing Data-Sources oder Setup im Paket',
    ],
  },
  includes: [
    'Telegram-Mini-App (Custom-UI)',
    'Live-Daten-Pipeline (Postgres-Backed)',
    'KI-Agent für Chat-Fragen',
    'Push-Notification-Logic',
    'Section-Drill-Down-Layouts',
  ],
  faq: [
    { q: 'Nur Telegram?', a: 'Primary ja — Mini-App-Tech läuft auch in WhatsApp/Slack über Webview, aber Setup-Pricing für nur eine Plattform.' },
    { q: 'Wie viele User?', a: 'Setup deckt 1-5 User. Mehr → Custom-Quote.' },
    { q: 'Sicherheit?', a: 'TG-initData-Auth + Whitelist-User-IDs. Kein Public-Access.' },
  ],
};

const scriptFactoryDfy: ShopItemContent = {
  slug: 'script-factory-dfy',
  name: 'Script Factory (DFY)',
  type: 'dfy',
  priceLabel: 'ab €800 Setup + €349/Mo',
  securityLevel: 'business',
  icp: ['AG', 'PB'],
  category: 'Content',
  tagline: 'Wir bauen dir die Ad-Script-Fabrik für Meta, TikTok, YouTube.',
  whatIsIt:
    'Done-For-You Variante der Script-Factory: wir konzipieren und bauen die Maschine für deine Brand. Framework-basiert (Knightvision-inspired), Brand-Voice-Tuning, Multi-Platform-Output. Im Retainer optimieren wir kontinuierlich.',
  outcomes: [
    '5-15 Ad-Scripts pro Woche statt 1-2 manuell',
    'Frameworks bewiesener Performer im System',
    'Brand-Voice konsistent über alle Scripts',
  ],
  whenItFits: {
    fits: [
      'Agenturen die für Kunden Ad-Scripts liefern',
      'DTC-Brands mit konstantem Creative-Bedarf',
      'Personal Brands die Performance-Content brauchen',
    ],
    requires: [
      'Audit-Call',
      'Existing Brand-Material (Bisherige Ads, Voice-Samples)',
    ],
  },
  includes: [
    'Custom-Script-Factory-Setup',
    'Framework-Library (Hook, Body, CTA-Patterns)',
    'Brand-Voice-Tuning auf deine Marke',
    'Multi-Platform-Output (Meta, TikTok, YouTube)',
    'Monatliche Performance-Reviews',
  ],
  pricingNote: 'DFY-Variante — wir bauen+betreiben. Self-Serve via SaaS-Variante kommt Q3 2026.',
  faq: [
    { q: 'Unterschied zur SaaS-Variante?', a: 'DFY: wir bauen für dich, Custom-Setup. SaaS (Coming Soon): pay-per-Run, self-serve auf Standard-Frameworks.' },
    { q: 'Welche Frameworks?', a: 'Knightvision-style: Hook → Pain → Solution → Proof → CTA, plus 8 weitere getestete Patterns.' },
    { q: 'Kündigung?', a: '3 Monate, dann monatlich.' },
  ],
  crossSell: 'SaaS-Variante kommt Q3 2026 — günstiger Self-Serve-Einstieg',
};

/* ──────────────────── SAAS COMING-SOON (3) ──────────────────── */

const scriptFactorySaas: ShopItemContent = {
  slug: 'script-factory',
  name: 'Script Factory (SaaS)',
  type: 'saas',
  tag: 'In Bau',
  priceLabel: 'Credits-basiert (Q3 2026)',
  securityLevel: 'business',
  icp: ['AG', 'PB'],
  category: 'Content',
  tagline: 'Self-Serve Ad-Script-Fabrik. Pay-per-Run.',
  comingSoon: true,
  comingSoonPhase: 'Phase 2 (Q3 2026) — aktuell in Bau',
  whatIsIt:
    'SaaS-Version der Script-Factory: du loggst dich ein, fütterst Produkt + Ziel-Platform, kriegst 5-10 Ad-Scripts in Minuten. Pay-per-Run via AEVUM Credits oder Monthly-Bundle. Self-Serve, keine Beratung. Aktuell in Build — Launch Q3 2026.',
  outcomes: [
    'Ad-Scripts in 60 Sekunden statt Stunden',
    'Multi-Platform-Output (Meta, TikTok, YouTube)',
    'Frameworks im System integriert',
    'Pay only for what you use',
  ],
  whenItFits: {
    fits: [
      'Solo-Marketers mit gelegentlichem Script-Bedarf',
      'Agenturen die quick-turnaround brauchen',
      'Teams die DFY-Variante nicht brauchen',
    ],
    requires: [
      'AEVUM-Account (kostenlos)',
      'Credits oder Monthly-Subscription',
    ],
  },
  includes: STUB_TEXT.outcomes.concat([
    'Detail-Includes folgen bei Launch',
  ]),
  pricingNote: 'Pricing-Modell: ~30-50 Credits pro Script-Run. Bundles ab €29/Mo.',
  faq: [
    { q: 'Wann verfügbar?', a: 'Q3 2026 (Juli-September). Early-Adopter-Liste: per Audit-Call signup.' },
    { q: 'Wie unterscheidet sich von DFY?', a: 'Self-Serve, Standard-Frameworks. DFY hat Custom-Setup + Brand-Voice-Tuning.' },
    { q: 'Wartelisten-Vorteil?', a: 'Ja — Early-Adopter kriegen 50% Credits-Bonus für ersten Monat.' },
  ],
  crossSell: 'DFY-Variante verfügbar wenn du Custom-Setup brauchst',
};

const dsgvoFactory: ShopItemContent = {
  slug: 'dsgvo-factory',
  name: 'DSGVO Factory',
  type: 'saas',
  tag: 'Konzept',
  priceLabel: 'TBD',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Compliance',
  tagline: 'Self-Serve DSGVO-Compliance-Bausteine. (In Konzept-Phase)',
  comingSoon: true,
  comingSoonPhase: 'Konzept-Phase — Launch ETA Q4 2026',
  whatIsIt:
    'Geplanter SaaS: DSGVO-Bausteine self-serve. Datenschutzerklärung-Generator, AVV-Templates, Erasure-API-Setup, Cookie-Banner mit Logic. Aktuell Konzept-Phase, Carlos sammelt Use-Cases.',
  outcomes: STUB_TEXT.outcomes,
  whenItFits: STUB_TEXT.whenItFits,
  includes: ['Detail-Includes folgen bei Konzept-Abschluss'],
  pricingNote: 'Pricing wird definiert sobald Scope feststeht. Wahrscheinlich Credits-basiert + Monthly-Tier.',
  faq: [
    { q: 'Wann verfügbar?', a: 'Konzept-Phase aktuell, ETA Q4 2026 wenn Scope und Markt-Validierung steht.' },
    { q: 'Wofür Interesse anmelden?', a: 'Audit-Call buchen mit "DSGVO-Factory Wait-List" → wir nehmen dich in den Beta-Pool.' },
    { q: 'Anwaltsersatz?', a: 'Nein. Bausteine + Vorlagen, anwaltsgeprüft, aber kein Rechtsbeistand.' },
  ],
};

const leadFactory: ShopItemContent = {
  slug: 'lead-factory',
  name: 'Lead Factory',
  type: 'saas',
  tag: 'Konzept',
  priceLabel: 'TBD',
  securityLevel: 'dsgvo',
  icp: ['AG', 'FI'],
  category: 'Leads',
  tagline: 'Self-Serve Lead-Generation. (In Konzept-Phase)',
  comingSoon: true,
  comingSoonPhase: 'Konzept-Phase — Launch ETA 2027',
  whatIsIt:
    'Geplanter SaaS: Lead-Generation self-serve. ICP eingeben → System findet + qualifiziert Leads → CSV-Export oder CRM-Push. Credits-basiert. Aktuell Konzept-Phase.',
  outcomes: STUB_TEXT.outcomes,
  whenItFits: STUB_TEXT.whenItFits,
  includes: ['Detail-Includes folgen bei Konzept-Abschluss'],
  pricingNote: 'Pricing TBD. Wahrscheinlich Credits pro Lead + Monthly-Quota-Bundles.',
  faq: [
    { q: 'Wann verfügbar?', a: 'Konzept-Phase, ETA 2027. Carlos validiert noch Market-Fit gegen Apollo / Clay.' },
    { q: 'Unterschied zu Apollo?', a: 'Geplant: günstiger pro Lead, DSGVO-konform für DE-Markt, AI-Pre-Qualifizierung inklusive.' },
    { q: 'Beta-Liste?', a: 'Audit-Call mit "Lead-Factory Wait-List".' },
  ],
};

/* ──────────────────── REGISTRY ──────────────────── */

export const SHOP_ITEMS: Record<string, ShopItemContent> = {
  // Blueprints
  'content-factory': contentFactory,
  'lead-qualifier-pro': leadQualifierPro,
  'reporting-dashboard-setup': reportingDashboardSetup,
  'onboarding-autopilot': onboardingAutopilot,
  'newsletter-growth-machine': newsletterGrowthMachine,
  'cold-outreach-system': coldOutreachSystem,
  // Bundle
  'bundle-all': bundleAll,
  // DFY — Consolidated 5 (2026-05-24) — primary slugs
  'aevum-business-os': aevumBusinessOS,
  'aevum-command-center': aevumCommandCenter,
  'aevum-lead-engine': aevumLeadEngine,
  'aevum-content-engine': aevumContentEngine,
  'aevum-audit': aevumAudit,
  // DFY — Industry-Specific (separate)
  'ecommerce-os': ecommerceOS,
  'script-factory-dfy': scriptFactoryDfy,
  // DFY — Legacy slugs (kept for backwards-compat with existing detail-page links)
  'business-os': businessOS,
  'command-center-dashboard': commandCenterDashboard,
  'ai-lead-engine': aiLeadEngine,
  'sales-os': salesOS,
  'automation-audit': automationAudit,
  'website-crm': websiteCrm,
  'database-system': databaseSystem,
  'content-engine': contentEngine,
  'hud-command-center': hudCommandCenter,
  // SaaS Coming-Soon
  'script-factory': scriptFactorySaas,
  'dsgvo-factory': dsgvoFactory,
  'lead-factory': leadFactory,
};

export function getShopItem(slug: string, type?: string): ShopItemContent | null {
  const item = SHOP_ITEMS[slug];
  if (!item) return null;
  // Type-Disambig nur für script-factory (DFY + SaaS gleicher Name-Stamm)
  if (type && item.type !== type && slug === 'script-factory') return null;
  return item;
}

export const SHOP_ITEM_SLUGS = Object.keys(SHOP_ITEMS);
