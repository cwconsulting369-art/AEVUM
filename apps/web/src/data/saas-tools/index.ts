/**
 * AEVUM SaaS-Tool-Registry — Public Marketing-Content für /saas Hub + Detail-Pages
 *
 * Trennung von shop-items: Shop = Blueprints/DFY/Bundles (one-time purchase),
 * SaaS = Pay-per-Use Pipelines mit Credit-System.
 *
 * Pricing-Modell: Initial-Credit-Paket via Stripe-Checkout (Starter/Growth/Pro),
 * Auto-Account-Create via Webhook G6, dann Pay-per-Run im Portal.
 */

export type SaasToolStatus = 'live' | 'partial' | 'coming-soon';
export type SaasSecurityLevel = 'basic' | 'business' | 'dsgvo';

export interface SaasToolPipelineStep {
  /** Numbering: 1, 2, 3, ... */
  step: number;
  title: string;
  detail: string;
  /** English overrides (i18n) */
  title_en?: string;
  detail_en?: string;
}

export interface SaasToolFAQ {
  q: string;
  a: string;
  /** English overrides (i18n) */
  q_en?: string;
  a_en?: string;
}

export interface SaasTool {
  slug: string;
  name: string;
  status: SaasToolStatus;
  statusLabel: string;
  category: string;
  securityLevel: SaasSecurityLevel;

  /** Hub-Card */
  tagline: string;
  shortDescription: string;
  pricePerRunLabel: string;
  creditsPerRun: number | null; // null = TBD (coming-soon)

  /** Detail-Page */
  whatIsIt: string;
  whatItDoes: SaasToolPipelineStep[];
  useCases: string[];
  demoOutput?: {
    /** Mini-Mock-Output für anonyme Try-Demo */
    title: string;
    sample: string;
  };

  faq: SaasToolFAQ[];

  /** Portal-Tool-Slug für Login-Redirect (existing Portal-Page) */
  portalToolSlug?: string;

  /**
   * English (i18n) overrides. DE fields above stay the default-market source.
   * Only free-text marketing strings are translated; slug/name/category/labels
   * are brand/product names and stay identical across locales.
   */
  statusLabel_en?: string;
  tagline_en?: string;
  shortDescription_en?: string;
  pricePerRunLabel_en?: string;
  whatIsIt_en?: string;
  useCases_en?: string[];
  demoOutput_en?: { title: string; sample: string };
}

/* ──────────────────── Script-Factory (live) ──────────────────── */

const scriptFactory: SaasTool = {
  slug: 'script-factory',
  name: 'Script-Factory',
  status: 'live',
  statusLabel: 'Live',
  category: 'Content',
  securityLevel: 'business',
  tagline: 'Ad-Scripts für Meta, TikTok, YouTube — 5-10 Variants pro Run.',
  shortDescription:
    'Du fütterst Produkt + Ziel-Platform, das System generiert 5-10 Ad-Script-Variants in deinem Brand-Voice. Hook-Frameworks (PAS, AIDA, Problem-Agitate-Solve) integriert.',
  pricePerRunLabel: '40 Credits / Run (~€3.50)',
  creditsPerRun: 40,
  whatIsIt:
    'Self-Service Ad-Script-Pipeline. Statt Stunden manueller Copywriting-Arbeit fütterst du Produkt-Brief + Target-Platform + Tonalität und kriegst in 60 Sekunden 5-10 Script-Variants. Jeder Variant nutzt ein anderes Framework (PAS, AIDA, Hook-Story-Offer, Problem-Stack). Du wählst die besten 2-3 für Production. Pay-per-Run via AEVUM Credits.',
  whatItDoes: [
    {
      step: 1,
      title: 'Brief erfassen',
      detail: 'Produkt-URL oder Beschreibung, Zielgruppe, Platform (Meta/TikTok/YouTube), Tonalität.',
      title_en: 'Capture the brief',
      detail_en: 'Product URL or description, target audience, platform (Meta/TikTok/YouTube), tone of voice.',
    },
    {
      step: 2,
      title: 'AI-Research',
      detail: 'System extrahiert USPs, Pain-Points, Competitor-Hooks aus deinem Brief + Web-Recherche.',
      title_en: 'AI research',
      detail_en: 'The system extracts USPs, pain points and competitor hooks from your brief + web research.',
    },
    {
      step: 3,
      title: 'Framework-Matching',
      detail: 'Best-Fit-Frameworks pro Platform: TikTok = Hook-Story-Offer, Meta = Problem-Agitate-Solve, YouTube = Longer-Form.',
      title_en: 'Framework matching',
      detail_en: 'Best-fit frameworks per platform: TikTok = Hook-Story-Offer, Meta = Problem-Agitate-Solve, YouTube = longer form.',
    },
    {
      step: 4,
      title: 'Multi-Variant-Generation',
      detail: '5-10 Scripts mit Hook + Body + CTA. Inklusive Caption + Voiceover-Notes.',
      title_en: 'Multi-variant generation',
      detail_en: '5-10 scripts with hook + body + CTA. Including caption + voiceover notes.',
    },
    {
      step: 5,
      title: 'Export',
      detail: 'Download als PDF + JSON. Optional: direkter Push in deine Ad-Manager-Drafts (Q4 2026).',
      title_en: 'Export',
      detail_en: 'Download as PDF + JSON. Optional: direct push into your ad manager drafts (Q4 2026).',
    },
  ],
  useCases: [
    'Solo-Marketer mit wöchentlichem Ad-Output',
    'Agenturen für Quick-Turnaround-Briefs',
    'E-Commerce Brands die regelmäßig Creative-Refresh brauchen',
    'Performance-Teams für A/B-Test-Variants',
  ],
  demoOutput: {
    title: 'Beispiel: TikTok-Ad für Protein-Pulver',
    sample:
      'HOOK (0-3s): "Du isst clean — und nimmst trotzdem nicht ab?"\n\nBODY (3-15s): Die meisten Protein-Pulver haben 2x soviel Zucker wie ein Snickers. Wir haben 47 Marken getestet. Nur 4 waren clean. CleanProtein ist eine davon — und sie ist die einzige mit 24g Protein und 0g Zucker.\n\nCTA (15-18s): "Tippe auf den Link für 20% Off — nur diese Woche."',
  },
  faq: [
    {
      q: 'Wie schnell krieg ich Output?',
      a: 'Pro Run ~45-90 Sekunden. Du kannst während des Runs schon nächsten Brief vorbereiten.',
      q_en: 'How fast do I get output?',
      a_en: 'About 45-90 seconds per run. You can already prepare the next brief while a run is going.',
    },
    {
      q: 'Kann ich Brand-Voice trainieren?',
      a: 'Ja — im Portal kannst du Tonalitäts-Beispiele hochladen. Das System nutzt sie als Style-Reference pro Run.',
      q_en: 'Can I train a brand voice?',
      a_en: 'Yes — in the portal you can upload tone-of-voice examples. The system uses them as a style reference per run.',
    },
    {
      q: 'Was wenn Output nicht passt?',
      a: 'Re-Run kostet nur 50% Credits (20 statt 40). Wir glauben an Iteration, nicht an Refund-Streit.',
      q_en: 'What if the output is not a fit?',
      a_en: 'A re-run only costs 50% of the credits (20 instead of 40). We believe in iteration, not refund disputes.',
    },
    {
      q: 'Welche Sprachen?',
      a: 'Deutsch + Englisch live. Spanisch/Französisch in Build (Q3 2026).',
      q_en: 'Which languages?',
      a_en: 'German + English live. Spanish/French in build (Q3 2026).',
    },
    {
      q: 'Wo läuft das Hosting?',
      a: 'EU (Hetzner Falkenstein). Keine Daten verlassen die EU. DSGVO-konform.',
      q_en: 'Where is it hosted?',
      a_en: 'EU (Hetzner Falkenstein). No data leaves the EU. GDPR-compliant.',
    },
  ],
  portalToolSlug: 'script-factory',
  statusLabel_en: 'Live',
  tagline_en: 'Ad scripts for Meta, TikTok, YouTube — 5-10 variants per run.',
  shortDescription_en:
    'You feed in product + target platform, the system generates 5-10 ad script variants in your brand voice. Hook frameworks (PAS, AIDA, Problem-Agitate-Solve) built in.',
  pricePerRunLabel_en: '40 credits / run (~€3.50)',
  whatIsIt_en:
    'Self-service ad script pipeline. Instead of hours of manual copywriting, you feed in a product brief + target platform + tone of voice and get 5-10 script variants in 60 seconds. Each variant uses a different framework (PAS, AIDA, Hook-Story-Offer, Problem-Stack). You pick the best 2-3 for production. Pay-per-run via AEVUM credits.',
  useCases_en: [
    'Solo marketers with weekly ad output',
    'Agencies needing quick-turnaround briefs',
    'E-commerce brands that need regular creative refreshes',
    'Performance teams running A/B test variants',
  ],
  demoOutput_en: {
    title: 'Example: TikTok ad for protein powder',
    sample:
      'HOOK (0-3s): "You eat clean — and still not losing weight?"\n\nBODY (3-15s): Most protein powders have twice as much sugar as a Snickers bar. We tested 47 brands. Only 4 were clean. CleanProtein is one of them — and the only one with 24g protein and 0g sugar.\n\nCTA (15-18s): "Tap the link for 20% off — this week only."',
  },
};

/* ──────────────────── DSGVO-Factory (partial) ──────────────────── */

const dsgvoFactory: SaasTool = {
  slug: 'dsgvo-factory',
  name: 'DSGVO-Factory',
  status: 'partial',
  statusLabel: 'Beta — AVV live',
  category: 'Compliance',
  securityLevel: 'dsgvo',
  tagline: 'Compliance-Text-Entwürfe personalisiert generieren — AVV, Datenschutzerklärung, Cookie-Banner. Vorlagen, kein Rechtsbeistand.',
  shortDescription:
    'Self-Service DSGVO-Vorlagen. Du fütterst Firma + Tech-Stack + Datenflüsse, kriegst einen personalisierten Text-Entwurf. Aktuell live: AVV-Generator (Stub). In Build: Datenschutzerklärung + Cookie-Banner-Logic. Hinweis: alle Outputs sind Entwürfe und ersetzen keine anwaltliche Prüfung.',
  pricePerRunLabel: '25 Credits / Run (~€2.50)',
  creditsPerRun: 25,
  whatIsIt:
    'Viele Unternehmen kopieren Compliance-Texte 1:1 aus generischen Vorlagen — das ist angreifbar. Die DSGVO-Factory generiert dir einen Text-Entwurf basierend auf deinem echten Tech-Stack. AVV-Generator (Auftragsverarbeitungsvertrag, Stub-MVP) ist live. Datenschutzerklärung + Cookie-Banner mit Logic-Engine sind in Build. Wichtig: Output ist Entwurf, juristische Prüfung empfohlen.',
  whatItDoes: [
    {
      step: 1,
      title: 'Firmen-Daten erfassen',
      detail: 'Firmenname, Rechtsform, USt-ID, Geschäftsadresse, Verantwortliche Person.',
      title_en: 'Capture company data',
      detail_en: 'Company name, legal form, VAT ID, business address, responsible person.',
    },
    {
      step: 2,
      title: 'Tech-Stack mappen',
      detail: 'Auswahl aus einer Liste gängiger Tools (Hosting, Analytics, Mail, Payment, CRM) — Liste wird laufend erweitert. Eigene Sub-Processors lassen sich frei ergänzen.',
      title_en: 'Map your tech stack',
      detail_en: 'Pick from a list of common tools (hosting, analytics, mail, payment, CRM) — the list keeps growing. You can freely add your own sub-processors.',
    },
    {
      step: 3,
      title: 'Datenfluss-Diagramm',
      detail: 'Visualisiert wer welche Daten kriegt, Sub-Processors automatisch gelistet (DPA-Links verlinkt).',
      title_en: 'Data flow diagram',
      detail_en: 'Visualizes who receives which data, sub-processors listed automatically (DPA links included).',
    },
    {
      step: 4,
      title: 'Text-Generation',
      detail: 'AVV-Text-Entwurf personalisiert per Vendor (Stripe, Resend, Supabase, ...). Vorlagen wurden von uns sorgfältig recherchiert, sind aber nicht anwaltlich freigegeben — juristische Prüfung vor Verwendung empfohlen.',
      title_en: 'Text generation',
      detail_en: 'A DPA draft personalized per vendor (Stripe, Resend, Supabase, ...). The templates were carefully researched by us but are not lawyer-approved — legal review before use is recommended.',
    },
    {
      step: 5,
      title: 'PDF + Markdown-Export',
      detail: 'Signaturen-Ready-PDF + Markdown für deine Website. Plus: Audit-Trail wer wann generiert hat.',
      title_en: 'PDF + Markdown export',
      detail_en: 'Signature-ready PDF + Markdown for your website. Plus: an audit trail of who generated what and when.',
    },
  ],
  useCases: [
    'Solo-Founder die einen Compliance-Entwurf als Ausgangspunkt brauchen',
    'Agenturen die für mehrere Kunden Vorlagen-Bausteine generieren',
    'Unternehmen mit komplexen Sub-Processor-Ketten als Vorbereitung für die Anwalts-Prüfung',
  ],
  useCases_en: [
    'Solo founders who need a compliance draft as a starting point',
    'Agencies generating template building blocks for multiple clients',
    'Companies with complex sub-processor chains preparing for lawyer review',
  ],
  demoOutput: {
    title: 'Beispiel: AVV-Auszug (Sub-Processor Stripe)',
    sample:
      '§ 3 Unterauftragsverarbeiter\n\n(1) Der Auftragnehmer setzt zur Erbringung der Leistungen folgende Unterauftragsverarbeiter ein:\n\n  a) Stripe Payments Europe Ltd., Dublin, Irland\n     Zweck: Zahlungsabwicklung\n     Datenkategorien: Name, E-Mail, Zahlungsdaten\n     Standort: EU (mit Datentransfer in USA basierend auf Standardvertragsklauseln)\n     DPA: https://stripe.com/de/legal/dpa\n\n(2) Der Auftraggeber erteilt seine Zustimmung zu diesen Unterauftragsverarbeitern mit Vertragsschluss. ...',
  },
  faq: [
    {
      q: 'Ersetzt das einen Anwalt?',
      a: 'Nein. Die Outputs sind Text-Entwürfe und keine Rechtsberatung. Für rechtsverbindliche Versionen wende dich an einen IT-Fachanwalt deines Vertrauens.',
      q_en: 'Does this replace a lawyer?',
      a_en: 'No. The outputs are text drafts, not legal advice. For legally binding versions, consult an IT lawyer you trust.',
    },
    {
      q: 'Welche Bausteine sind live?',
      a: 'AVV-Generator als Stub-MVP. Datenschutzerklärung-Generator + Cookie-Banner-Logic sind noch in Build, kein verbindliches Launch-Datum.',
      q_en: 'Which building blocks are live?',
      a_en: 'The DPA generator as a stub MVP. The privacy policy generator + cookie banner logic are still in build, with no binding launch date.',
    },
    {
      q: 'Was passiert wenn sich Recht ändert?',
      a: 'Aktuell gibt es noch kein automatisches Update-Workflow. Wenn wir relevante Änderungen einarbeiten, informieren wir die Nutzer per Mail und du kannst den Generator neu laufen lassen. Re-Run-Pricing wird beim Launch bestätigt.',
      q_en: 'What happens if the law changes?',
      a_en: 'There is currently no automatic update workflow. When we incorporate relevant changes, we notify users by email and you can re-run the generator. Re-run pricing is confirmed at launch.',
    },
    {
      q: 'Sub-Processor nicht in Liste?',
      a: 'Du kannst Custom-Sub-Processors mit eigenem DPA-Link ergänzen — das System übernimmt den Eintrag in den Entwurf.',
      q_en: 'Sub-processor not in the list?',
      a_en: 'You can add custom sub-processors with your own DPA link — the system includes the entry in the draft.',
    },
  ],
  portalToolSlug: 'dsgvo-factory',
  statusLabel_en: 'Beta — DPA live',
  tagline_en: 'Generate personalized compliance text drafts — DPA, privacy policy, cookie banner. Templates, not legal counsel.',
  shortDescription_en:
    'Self-service GDPR templates. You feed in company + tech stack + data flows and get a personalized text draft. Currently live: DPA generator (stub). In build: privacy policy + cookie banner logic. Note: all outputs are drafts and do not replace a lawyer review.',
  pricePerRunLabel_en: '25 credits / run (~€2.50)',
  whatIsIt_en:
    'Many companies copy compliance texts 1:1 from generic templates — that is vulnerable. The DSGVO-Factory generates a text draft based on your real tech stack. The DPA generator (data processing agreement, stub MVP) is live. The privacy policy + cookie banner with a logic engine are in build. Important: the output is a draft, legal review is recommended.',
  demoOutput_en: {
    title: 'Example: DPA excerpt (sub-processor Stripe)',
    sample:
      '§ 3 Sub-processors\n\n(1) To provide the services, the processor engages the following sub-processors:\n\n  a) Stripe Payments Europe Ltd., Dublin, Ireland\n     Purpose: payment processing\n     Data categories: name, email, payment data\n     Location: EU (with data transfer to the USA based on standard contractual clauses)\n     DPA: https://stripe.com/de/legal/dpa\n\n(2) The controller consents to these sub-processors upon conclusion of the contract. ...',
  },
};

/* ──────────────────── Lead-Factory (coming-soon) ──────────────────── */

const leadFactory: SaasTool = {
  slug: 'lead-factory',
  name: 'Lead-Factory',
  status: 'coming-soon',
  statusLabel: 'Konzept',
  category: 'Leads',
  securityLevel: 'dsgvo',
  tagline: 'Qualifizierte Lead-Pipeline — ICP eingeben, gefilterte Leads bekommen.',
  shortDescription:
    'Geplanter SaaS: ICP eingeben → System findet + qualifiziert Leads → CSV-Export oder CRM-Push. DSGVO-konform für DE-Markt. AI-Pre-Qualifizierung inklusive. Aktuell in Konzept-Phase.',
  pricePerRunLabel: 'TBD (Konzept-Phase)',
  creditsPerRun: null,
  whatIsIt:
    'Self-Service Lead-Generation für DE-Markt. Statt Apollo/Clay zu mieten und manuell zu filtern, definierst du dein ICP (Industry, Größe, Region, Tech-Stack) und kriegst pre-qualifizierte Leads zurück. AI scort jeden Lead nach Wahrscheinlichkeit eines Reply. DSGVO-konform (kein US-Server, B2B-Daten only). Aktuell in Konzept-Phase, Carlos validiert Market-Fit.',
  whatItDoes: [
    {
      step: 1,
      title: 'ICP definieren',
      detail: 'Industry, Firmen-Größe, Region, Tech-Stack-Signals, Funding-Stage.',
      title_en: 'Define your ICP',
      detail_en: 'Industry, company size, region, tech stack signals, funding stage.',
    },
    {
      step: 2,
      title: 'Multi-Source-Search',
      detail: 'LinkedIn + Apollo-Mirror + Company-Registers + Tech-Detector-APIs.',
      title_en: 'Multi-source search',
      detail_en: 'LinkedIn + Apollo mirror + company registers + tech detector APIs.',
    },
    {
      step: 3,
      title: 'AI-Scoring',
      detail: 'Pro Lead: Reply-Wahrscheinlichkeit (0-100), Pain-Hypothese, Best-Touch-Point.',
      title_en: 'AI scoring',
      detail_en: 'Per lead: reply probability (0-100), pain hypothesis, best touchpoint.',
    },
    {
      step: 4,
      title: 'Export',
      detail: 'CSV oder direkter Push in HubSpot/Pipedrive/Lemlist.',
      title_en: 'Export',
      detail_en: 'CSV or direct push into HubSpot/Pipedrive/Lemlist.',
    },
  ],
  useCases: [
    'B2B-Solo-Founder ohne Apollo-Budget',
    'Agenturen für Kunden-Pipelines',
    'Sales-Teams die DE-fokussiert sind',
  ],
  useCases_en: [
    'B2B solo founders without an Apollo budget',
    'Agencies running client pipelines',
    'Sales teams focused on the German market',
  ],
  faq: [
    {
      q: 'Wann verfügbar?',
      a: 'Konzept-Phase. ETA 2027 wenn Market-Fit gegen Apollo/Clay validiert. Audit-Call → Wait-List.',
      q_en: 'When is it available?',
      a_en: 'Concept phase. ETA 2027 once market fit against Apollo/Clay is validated. Audit call → wait list.',
    },
    {
      q: 'Wo ist der Unterschied zu Apollo?',
      a: 'Geplant: günstiger pro Lead, DSGVO-konform, AI-Pre-Qualifizierung mit Pain-Hypothese inklusive.',
      q_en: 'How is this different from Apollo?',
      a_en: 'Planned: cheaper per lead, GDPR-compliant, AI pre-qualification with a pain hypothesis included.',
    },
  ],
  statusLabel_en: 'Concept',
  tagline_en: 'Qualified lead pipeline — enter your ICP, get filtered leads.',
  shortDescription_en:
    'Planned SaaS: enter your ICP → the system finds + qualifies leads → CSV export or CRM push. GDPR-compliant for the German market. AI pre-qualification included. Currently in concept phase.',
  pricePerRunLabel_en: 'TBD (concept phase)',
  whatIsIt_en:
    'Self-service lead generation for the German market. Instead of renting Apollo/Clay and filtering manually, you define your ICP (industry, size, region, tech stack) and get pre-qualified leads back. AI scores each lead by reply probability. GDPR-compliant (no US servers, B2B data only). Currently in concept phase, Carlos is validating market fit.',
};

/* ──────────────────── Content-Factory SaaS (coming-soon) ──────────────────── */

const contentFactorySaas: SaasTool = {
  slug: 'content-factory-saas',
  name: 'Content-Factory (SaaS)',
  status: 'coming-soon',
  statusLabel: 'Konzept',
  category: 'Content',
  securityLevel: 'business',
  tagline: 'Self-Service Content-Pipeline — Idee bis Publish, automatisiert.',
  shortDescription:
    'Geplanter SaaS: Pendant zum Content-Factory-Blueprint, aber als Hosted-Pipeline. Themen + Brand-Voice rein, fertige Posts in Review-Queue. Aktuell in Konzept, Carlos validiert ob SaaS-Variante neben DFY-Blueprint Sinn macht.',
  pricePerRunLabel: 'TBD (Konzept-Phase)',
  creditsPerRun: null,
  whatIsIt:
    'Content-Factory-Blueprint gibt es als DFY-Setup (im Shop, einmaliger Kauf + n8n auf deinem Server). Diese SaaS-Variante hostet die Pipeline für dich — kein n8n, kein Server. Du füllst Topics + Brand-Voice ein, das System recherchiert, schreibt Drafts, generiert Bilder, legt fertige Posts in Review-Queue. Aktuell in Konzept-Phase.',
  whatItDoes: [
    {
      step: 1,
      title: 'Brand-Setup',
      detail: 'Voice-Samples, Topic-Cluster, Platform-Targets (LinkedIn, Instagram, ...).',
      title_en: 'Brand setup',
      detail_en: 'Voice samples, topic clusters, platform targets (LinkedIn, Instagram, ...).',
    },
    {
      step: 2,
      title: 'Pipeline-Run (weekly oder per Topic)',
      detail: 'Research + Draft-Writing + Image-Generation.',
      title_en: 'Pipeline run (weekly or per topic)',
      detail_en: 'Research + draft writing + image generation.',
    },
    {
      step: 3,
      title: 'Review-Queue',
      detail: 'Du gibst frei, System published auf deine Channels.',
      title_en: 'Review queue',
      detail_en: 'You approve, the system publishes to your channels.',
    },
  ],
  useCases: [
    'Solo-Founder ohne Dev-Skills für n8n-Setup',
    'Teams die SaaS-Convenience über One-time-Buy bevorzugen',
  ],
  useCases_en: [
    'Solo founders without the dev skills for an n8n setup',
    'Teams that prefer SaaS convenience over a one-time buy',
  ],
  faq: [
    {
      q: 'Wann verfügbar?',
      a: 'Konzept-Phase. Wenn DFY-Version 50+ Deployments hat, evaluieren wir SaaS-Variante. ETA: nicht vor 2027.',
      q_en: 'When is it available?',
      a_en: 'Concept phase. Once the DFY version has 50+ deployments, we will evaluate the SaaS variant. ETA: not before 2027.',
    },
    {
      q: 'Wieso nicht jetzt schon?',
      a: 'Content-Voice-Custom-Tuning ist heute noch zu manuell. Wir warten auf bessere Voice-Cloning-Models.',
      q_en: 'Why not already now?',
      a_en: 'Custom content voice tuning is still too manual today. We are waiting for better voice cloning models.',
    },
  ],
  statusLabel_en: 'Concept',
  tagline_en: 'Self-service content pipeline — from idea to publish, automated.',
  shortDescription_en:
    'Planned SaaS: the counterpart to the Content-Factory blueprint, but as a hosted pipeline. Topics + brand voice in, finished posts in a review queue. Currently in concept, Carlos is validating whether a SaaS variant makes sense alongside the DFY blueprint.',
  pricePerRunLabel_en: 'TBD (concept phase)',
  whatIsIt_en:
    'The Content-Factory blueprint is available as a DFY setup (in the shop, one-time purchase + n8n on your server). This SaaS variant hosts the pipeline for you — no n8n, no server. You fill in topics + brand voice, the system researches, writes drafts, generates images and puts finished posts in a review queue. Currently in concept phase.',
};

/* ──────────────────── Lead-Scraper-Factory (coming-soon — MVP intern aktiv) ──────────────────── */

const leadScraperFactory: SaasTool = {
  slug: 'lead-scraper-factory',
  name: 'Lead-Scraper-Factory',
  status: 'coming-soon',
  statusLabel: 'In Build — MVP intern aktiv',
  category: 'Leads',
  securityLevel: 'dsgvo',
  tagline: 'CSV rein, AEVUM-Brandtone-Pitches raus — direkt versendbar.',
  shortDescription:
    'CSV-Upload mit Leads (Name, Email, Company, LinkedIn) → 3 Pitch-Varianten pro Lead im AEVUM-Brandtone via Claude Sonnet 4.5 → Approval-Flow → Versand via audit@aevum-system.de. Phase 1 (MVP) intern aktiv, Public-Launch nach Mario + Brandedecom-Validierung.',
  pricePerRunLabel: '12 Credits / Lead (~€1.10)',
  creditsPerRun: 12,
  whatIsIt:
    'Outreach mit AI-Brandtone, ohne Apollo/Lemlist. Du laedst eine CSV mit Leads hoch, das System generiert 3 unterschiedliche Pitch-Varianten pro Lead (direct, curious, reference), du approved/editierst pro Lead, dann werden alle approved-Pitches via Resend-Transactional-Mail versendet. AEVUM-Brand-Voice als SSOT-Knowledge-Hub haengt im Backend — direkt, ehrlich, keine Floskeln. Phase 2 ergaenzt automatisches Scraping + Trigger-Detection.',
  whatItDoes: [
    {
      step: 1,
      title: 'CSV-Upload',
      detail: 'Leads via CSV: company_name, company_domain, owner_name, owner_email, owner_linkedin_url. Max 500 Leads/Campaign.',
      title_en: 'CSV upload',
      detail_en: 'Leads via CSV: company_name, company_domain, owner_name, owner_email, owner_linkedin_url. Max 500 leads/campaign.',
    },
    {
      step: 2,
      title: 'Brandtone-Pick',
      detail: 'Default AEVUM-Brandtone (Carlos\'s Outreach-Voice) oder eigene Knowledge-Hub.',
      title_en: 'Brand tone pick',
      detail_en: 'Default AEVUM brand tone (Carlos\'s outreach voice) or your own knowledge hub.',
    },
    {
      step: 3,
      title: 'Pitch-Generation',
      detail: '3 Varianten pro Lead via Claude Sonnet 4.5. Pattern-Interrupt-Hook, 4-Satz-Body, 1 spezifische Frage. Keine Marketing-Floskeln.',
      title_en: 'Pitch generation',
      detail_en: '3 variants per lead via Claude Sonnet 4.5. Pattern-interrupt hook, 4-sentence body, 1 specific question. No marketing fluff.',
    },
    {
      step: 4,
      title: 'Review-Flow',
      detail: 'Pro Lead approven/editieren/skippen. Variant-Picker (direct/curious/reference). Live-Preview.',
      title_en: 'Review flow',
      detail_en: 'Approve/edit/skip per lead. Variant picker (direct/curious/reference). Live preview.',
    },
    {
      step: 5,
      title: 'Versand',
      detail: 'Bulk-Send via Resend (audit@aevum-system.de). Status-Tracking sent/opened/replied per Lead.',
      title_en: 'Sending',
      detail_en: 'Bulk send via Resend (audit@aevum-system.de). Status tracking sent/opened/replied per lead.',
    },
  ],
  useCases: [
    'Founders die ihren ICP schon haben aber 50-500 personalisierte Outreaches schreiben muessen',
    'Solo-Sales ohne Apollo-Budget',
    'Vertriebs-Teams die nicht auf Lemlist-Templates zurueckfallen wollen',
  ],
  useCases_en: [
    'Founders who already have their ICP but need to write 50-500 personalized outreaches',
    'Solo sales without an Apollo budget',
    'Sales teams that do not want to fall back on Lemlist templates',
  ],
  faq: [
    {
      q: 'Wann verfuegbar?',
      a: 'Phase 1 MVP intern aktiv (Carlos nutzt es fuer Mario + Brandedecom). Public-Launch nach Validierung. Audit-Call → Wait-List.',
      q_en: 'When is it available?',
      a_en: 'Phase 1 MVP active internally (Carlos uses it for Mario + Brandedecom). Public launch after validation. Audit call → wait list.',
    },
    {
      q: 'Was unterscheidet das von Lemlist/Mailshake?',
      a: 'AEVUM-Brandtone als SSOT statt Template-Hoelle. 3 Varianten pro Lead automatisch. Pay-per-Use (kein Monats-Abo).',
      q_en: 'What sets this apart from Lemlist/Mailshake?',
      a_en: 'The AEVUM brand tone as a single source of truth instead of template hell. 3 variants per lead automatically. Pay-per-use (no monthly subscription).',
    },
    {
      q: 'Scraping inklusive?',
      a: 'Phase 1: nein. Du bringst Leads als CSV. Phase 2 (geplant) macht Scraping + Enrichment + Trigger-Detection automatisch.',
      q_en: 'Is scraping included?',
      a_en: 'Phase 1: no. You bring leads as a CSV. Phase 2 (planned) does scraping + enrichment + trigger detection automatically.',
    },
  ],
  portalToolSlug: 'lead-scraper',
  statusLabel_en: 'In build — MVP active internally',
  tagline_en: 'CSV in, AEVUM-brand-tone pitches out — ready to send.',
  shortDescription_en:
    'CSV upload with leads (name, email, company, LinkedIn) → 3 pitch variants per lead in the AEVUM brand tone via Claude Sonnet 4.5 → approval flow → sent via audit@aevum-system.de. Phase 1 (MVP) active internally, public launch after Mario + Brandedecom validation.',
  pricePerRunLabel_en: '12 credits / lead (~€1.10)',
  whatIsIt_en:
    'Outreach with an AI brand tone, without Apollo/Lemlist. You upload a CSV of leads, the system generates 3 different pitch variants per lead (direct, curious, reference), you approve/edit per lead, then all approved pitches are sent via Resend transactional mail. The AEVUM brand voice as an SSOT knowledge hub sits in the backend — direct, honest, no fluff. Phase 2 adds automatic scraping + trigger detection.',
};

/* ──────────────────── REGISTRY ──────────────────── */

export const SAAS_TOOLS: Record<string, SaasTool> = {
  'script-factory': scriptFactory,
  'dsgvo-factory': dsgvoFactory,
  'lead-scraper-factory': leadScraperFactory,
  'lead-factory': leadFactory,
  'content-factory-saas': contentFactorySaas,
};

/** Order in der die Tools im Hub gerendert werden (live zuerst, coming-soon ans Ende) */
export const SAAS_TOOL_ORDER: string[] = [
  'script-factory',
  'dsgvo-factory',
  'lead-scraper-factory',
  'lead-factory',
  'content-factory-saas',
];

export function getSaasTool(slug: string): SaasTool | null {
  return SAAS_TOOLS[slug] ?? null;
}

export function listSaasTools(): SaasTool[] {
  return SAAS_TOOL_ORDER.map((s) => SAAS_TOOLS[s]).filter(Boolean);
}

/* ──────────────────── CREDIT PACKAGES (mirrored from DB credit_packages) ──────────────────── */

export interface CreditPackage {
  slug: 'starter' | 'growth' | 'pro';
  name: string;
  priceEur: number;
  credits: number;
  bonusPct: number;
  featured?: boolean;
  /** "≈ X Runs Script-Factory" helper */
  runsHint: string;
  /** English override (i18n) */
  runsHint_en?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    slug: 'starter',
    name: 'Starter',
    priceEur: 10,
    credits: 100,
    bonusPct: 0,
    runsHint: '≈ 2-4 Runs',
    runsHint_en: '≈ 2-4 runs',
  },
  {
    slug: 'growth',
    name: 'Growth',
    priceEur: 25,
    credits: 300,
    bonusPct: 20,
    featured: true,
    runsHint: '≈ 7-12 Runs',
    runsHint_en: '≈ 7-12 runs',
  },
  {
    slug: 'pro',
    name: 'Pro',
    priceEur: 50,
    credits: 700,
    bonusPct: 40,
    runsHint: '≈ 17-28 Runs',
    runsHint_en: '≈ 17-28 runs',
  },
];

/* ──────────────────── i18n LOCALIZERS ──────────────────── */

/**
 * Returns a SaasTool with all free-text fields swapped to the requested locale.
 * DE is the source-of-truth; EN falls back to DE for any missing override.
 * Brand/product fields (slug, name, category) are never translated.
 * `lang` accepts the raw i18next language string; only 'en' triggers swapping.
 */
export function localizeSaasTool(tool: SaasTool, lang: string): SaasTool {
  if (lang !== 'en') return tool;
  return {
    ...tool,
    statusLabel: tool.statusLabel_en ?? tool.statusLabel,
    tagline: tool.tagline_en ?? tool.tagline,
    shortDescription: tool.shortDescription_en ?? tool.shortDescription,
    pricePerRunLabel: tool.pricePerRunLabel_en ?? tool.pricePerRunLabel,
    whatIsIt: tool.whatIsIt_en ?? tool.whatIsIt,
    whatItDoes: tool.whatItDoes.map((s) => ({
      ...s,
      title: s.title_en ?? s.title,
      detail: s.detail_en ?? s.detail,
    })),
    useCases: tool.useCases_en ?? tool.useCases,
    demoOutput: tool.demoOutput_en ?? tool.demoOutput,
    faq: tool.faq.map((f) => ({
      ...f,
      q: f.q_en ?? f.q,
      a: f.a_en ?? f.a,
    })),
  };
}

/** Localized runsHint for a credit package. */
export function localizeRunsHint(pkg: CreditPackage, lang: string): string {
  return lang === 'en' ? pkg.runsHint_en ?? pkg.runsHint : pkg.runsHint;
}
