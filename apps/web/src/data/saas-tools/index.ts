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
}

export interface SaasToolFAQ {
  q: string;
  a: string;
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
    },
    {
      step: 2,
      title: 'AI-Research',
      detail: 'System extrahiert USPs, Pain-Points, Competitor-Hooks aus deinem Brief + Web-Recherche.',
    },
    {
      step: 3,
      title: 'Framework-Matching',
      detail: 'Best-Fit-Frameworks pro Platform: TikTok = Hook-Story-Offer, Meta = Problem-Agitate-Solve, YouTube = Longer-Form.',
    },
    {
      step: 4,
      title: 'Multi-Variant-Generation',
      detail: '5-10 Scripts mit Hook + Body + CTA. Inklusive Caption + Voiceover-Notes.',
    },
    {
      step: 5,
      title: 'Export',
      detail: 'Download als PDF + JSON. Optional: direkter Push in deine Ad-Manager-Drafts (Q4 2026).',
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
    },
    {
      q: 'Kann ich Brand-Voice trainieren?',
      a: 'Ja — im Portal kannst du Tonalitäts-Beispiele hochladen. Das System nutzt sie als Style-Reference pro Run.',
    },
    {
      q: 'Was wenn Output nicht passt?',
      a: 'Re-Run kostet nur 50% Credits (20 statt 40). Wir glauben an Iteration, nicht an Refund-Streit.',
    },
    {
      q: 'Welche Sprachen?',
      a: 'Deutsch + Englisch live. Spanisch/Französisch in Build (Q3 2026).',
    },
    {
      q: 'Wo läuft das Hosting?',
      a: 'EU (Hetzner Falkenstein). Keine Daten verlassen die EU. DSGVO-konform.',
    },
  ],
  portalToolSlug: 'script-factory',
};

/* ──────────────────── DSGVO-Factory (partial) ──────────────────── */

const dsgvoFactory: SaasTool = {
  slug: 'dsgvo-factory',
  name: 'DSGVO-Factory',
  status: 'partial',
  statusLabel: 'Beta — AVV live',
  category: 'Compliance',
  securityLevel: 'dsgvo',
  tagline: 'Compliance-Texte personalisiert generieren — AVV, Datenschutzerklärung, Cookie-Banner.',
  shortDescription:
    'Self-Service DSGVO-Bausteine. Du fütterst Firma + Tech-Stack + Datenflüsse, kriegst personalisierte Rechtstexte. Aktuell live: AVV-Generator. In Build: Datenschutzerklärung + Cookie-Banner-Logic.',
  pricePerRunLabel: '25 Credits / Run (~€2.50)',
  creditsPerRun: 25,
  whatIsIt:
    'Compliance-Texte werden aktuell von 80% der DE-Unternehmen aus Templates kopiert — und sind damit angreifbar. Die DSGVO-Factory generiert dir personalisierte Texte basierend auf deinem echten Tech-Stack. AVV (Auftragsverarbeitungsvertrag) zwischen dir und deinen Sub-Processors ist live. Datenschutzerklärung-Generator + Cookie-Banner mit Logic-Engine sind in Build.',
  whatItDoes: [
    {
      step: 1,
      title: 'Firmen-Daten erfassen',
      detail: 'Firmenname, Rechtsform, USt-ID, Geschäftsadresse, Verantwortliche Person.',
    },
    {
      step: 2,
      title: 'Tech-Stack mappen',
      detail: 'Auswahl aus 150+ Tools (Hosting, Analytics, Mail, Payment, CRM). System weiß welche Daten wo fließen.',
    },
    {
      step: 3,
      title: 'Datenfluss-Diagramm',
      detail: 'Visualisiert wer welche Daten kriegt, Sub-Processors automatisch gelistet (DPA-Links verlinkt).',
    },
    {
      step: 4,
      title: 'Text-Generation',
      detail: 'AVV-Text personalisiert per Vendor (Stripe-AVV, Resend-AVV, Supabase-AVV ...). Anwaltsgeprüfte Templates.',
    },
    {
      step: 5,
      title: 'PDF + Markdown-Export',
      detail: 'Signaturen-Ready-PDF + Markdown für deine Website. Plus: Audit-Trail wer wann generiert hat.',
    },
  ],
  useCases: [
    'Solo-Founder die DSGVO-Compliance ohne Anwalt brauchen',
    'Agenturen die für 10+ Kunden Compliance-Bausteine generieren',
    'Hausverwaltungen mit komplexen Sub-Processor-Ketten',
    'Finanzdienstleister mit zusätzlichen BaFin-Anforderungen',
  ],
  demoOutput: {
    title: 'Beispiel: AVV-Auszug (Sub-Processor Stripe)',
    sample:
      '§ 3 Unterauftragsverarbeiter\n\n(1) Der Auftragnehmer setzt zur Erbringung der Leistungen folgende Unterauftragsverarbeiter ein:\n\n  a) Stripe Payments Europe Ltd., Dublin, Irland\n     Zweck: Zahlungsabwicklung\n     Datenkategorien: Name, E-Mail, Zahlungsdaten\n     Standort: EU (mit Datentransfer in USA basierend auf Standardvertragsklauseln)\n     DPA: https://stripe.com/de/legal/dpa\n\n(2) Der Auftraggeber erteilt seine Zustimmung zu diesen Unterauftragsverarbeitern mit Vertragsschluss. ...',
  },
  faq: [
    {
      q: 'Ersetzt das einen Anwalt?',
      a: 'Nein. Die Templates sind anwaltsgeprüft, aber für komplexe Edge-Cases (z.B. Health-Data, Kreditdaten) brauchst du weiterhin Rechtsbeistand.',
    },
    {
      q: 'Welche Bausteine sind live?',
      a: 'AVV-Generator live. Datenschutzerklärung-Generator + Cookie-Banner-Logic in Build (ETA Q3 2026).',
    },
    {
      q: 'Updates wenn Recht sich ändert?',
      a: 'Ja — du kriegst Notification + Re-Run-Empfehlung. Re-Run kostet nur 50% Credits.',
    },
    {
      q: 'Sub-Processor nicht in Liste?',
      a: 'Du kannst Custom-Sub-Processors hinzufügen mit deinem eigenen DPA-Link. System integriert das.',
    },
  ],
  portalToolSlug: 'dsgvo-factory',
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
    },
    {
      step: 2,
      title: 'Multi-Source-Search',
      detail: 'LinkedIn + Apollo-Mirror + Company-Registers + Tech-Detector-APIs.',
    },
    {
      step: 3,
      title: 'AI-Scoring',
      detail: 'Pro Lead: Reply-Wahrscheinlichkeit (0-100), Pain-Hypothese, Best-Touch-Point.',
    },
    {
      step: 4,
      title: 'Export',
      detail: 'CSV oder direkter Push in HubSpot/Pipedrive/Lemlist.',
    },
  ],
  useCases: [
    'B2B-Solo-Founder ohne Apollo-Budget',
    'Agenturen für Kunden-Pipelines',
    'Sales-Teams die DE-fokussiert sind',
  ],
  faq: [
    {
      q: 'Wann verfügbar?',
      a: 'Konzept-Phase. ETA 2027 wenn Market-Fit gegen Apollo/Clay validiert. Audit-Call → Wait-List.',
    },
    {
      q: 'Wo ist der Unterschied zu Apollo?',
      a: 'Geplant: günstiger pro Lead, DSGVO-konform, AI-Pre-Qualifizierung mit Pain-Hypothese inklusive.',
    },
  ],
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
    },
    {
      step: 2,
      title: 'Pipeline-Run (weekly oder per Topic)',
      detail: 'Research + Draft-Writing + Image-Generation.',
    },
    {
      step: 3,
      title: 'Review-Queue',
      detail: 'Du gibst frei, System published auf deine Channels.',
    },
  ],
  useCases: [
    'Solo-Founder ohne Dev-Skills für n8n-Setup',
    'Teams die SaaS-Convenience über One-time-Buy bevorzugen',
  ],
  faq: [
    {
      q: 'Wann verfügbar?',
      a: 'Konzept-Phase. Wenn DFY-Version 50+ Deployments hat, evaluieren wir SaaS-Variante. ETA: nicht vor 2027.',
    },
    {
      q: 'Wieso nicht jetzt schon?',
      a: 'Content-Voice-Custom-Tuning ist heute noch zu manuell. Wir warten auf bessere Voice-Cloning-Models.',
    },
  ],
};

/* ──────────────────── REGISTRY ──────────────────── */

export const SAAS_TOOLS: Record<string, SaasTool> = {
  'script-factory': scriptFactory,
  'dsgvo-factory': dsgvoFactory,
  'lead-factory': leadFactory,
  'content-factory-saas': contentFactorySaas,
};

/** Order in der die Tools im Hub gerendert werden (live zuerst, coming-soon ans Ende) */
export const SAAS_TOOL_ORDER: string[] = [
  'script-factory',
  'dsgvo-factory',
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
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    slug: 'starter',
    name: 'Starter',
    priceEur: 10,
    credits: 100,
    bonusPct: 0,
    runsHint: '≈ 2-4 Runs',
  },
  {
    slug: 'growth',
    name: 'Growth',
    priceEur: 25,
    credits: 300,
    bonusPct: 20,
    featured: true,
    runsHint: '≈ 7-12 Runs',
  },
  {
    slug: 'pro',
    name: 'Pro',
    priceEur: 50,
    credits: 700,
    bonusPct: 40,
    runsHint: '≈ 17-28 Runs',
  },
];
