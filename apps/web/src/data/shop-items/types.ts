/**
 * Shop-Item Detail-Content — Quality-Gate-konforme Struktur
 * Memory: project_aevum_shop_quality_gate (8 Pflicht-Sektionen)
 */

export type ShopItemType = 'blueprint' | 'dfy' | 'saas' | 'bundle';
export type SecurityLevel = 'basic' | 'business' | 'dsgvo';
export type ShopICP = 'AG' | 'PB' | 'FI';

export interface ShopItemFAQ {
  q: string;
  a: string;
}

/**
 * EN-Overlay: alle frei-text Felder eines Shop-Items in Englisch.
 * DE bleibt SSOT im Haupt-Objekt; `en` ist der Parallel-Übersetzungs-Layer.
 * `localizeShopItem(item, 'en')` merged dieses Overlay über das DE-Original.
 * Brand/Produktnamen/IDs/Preise (name, slug, priceLabel, stripePriceId …)
 * bleiben sprach-neutral und werden NICHT übersetzt.
 */
export interface ShopItemEN {
  tagline?: string;
  whatIsIt?: string;
  outcomes?: string[];
  whenItFits?: {
    fits?: string[];
    requires?: string[];
  };
  includes?: string[];
  pricingNote?: string;
  securityNote?: string;
  faq?: ShopItemFAQ[];
  comingSoonPhase?: string;
  crossSell?: string;
  /** Optional EN-Override für den Anzeige-Namen, falls nötig (selten). */
  name?: string;
  /** Optional EN-Override für das Tag/Badge-Label (z.B. "Beliebt" → "Popular"). */
  tag?: string;
}

export interface ShopItemContent {
  slug: string;
  name: string;
  type: ShopItemType;
  tag?: string;
  priceLabel: string;
  /** number for blueprints/bundles for credit-calc; null for DFY/SaaS pricing */
  price?: number;
  stripePriceId?: string;
  securityLevel: SecurityLevel;
  icp: ShopICP[];
  category: string;

  /** Hero-Sektion */
  tagline: string;

  /** 02 — Was ist es */
  whatIsIt: string;
  /** 03 — Was bringt es (Outcomes) */
  outcomes: string[];
  /** 04 — Wann macht es Sinn */
  whenItFits: {
    fits: string[];
    requires: string[];
  };
  /** 05 — Was bekommst du */
  includes: string[];
  /** 06 — Preis-Block extras */
  pricingNote?: string;
  /** 07 — Sicherheits-Stufe Detail-Text */
  securityNote?: string;
  /** 08 — FAQ */
  faq: ShopItemFAQ[];

  /** Coming-Soon-Stub: true = Detail-Page zeigt "In Konzept-Phase"-Disclaimer */
  comingSoon?: boolean;
  /** Phase-Label für Coming-Soon ("Phase 2", "Q3 2026", ...) */
  comingSoonPhase?: string;

  /** Optional: demo-video URL (YouTube/Vimeo embed) */
  demoVideoUrl?: string;
  /** Optional: cross-sell bundle hint */
  crossSell?: string;

  /** Englischer Übersetzungs-Layer (über DE gemerged via localizeShopItem). */
  en?: ShopItemEN;
}

/**
 * Stub-Content-Helper für Items deren reale Daten noch fehlen.
 * Erfüllt Carlos's Quality-Gate-Pflicht: Page steht visuell, Content kommt durchs Gate.
 */
export const STUB_TEXT = {
  whatIsIt:
    'Detaillierte Beschreibung folgt nach dem nächsten Quality-Gate-Build. Aktuell durchläuft dieser Service unsere interne Validierung: eigene Anwendung, Workflow-Export, PDF-Anleitung. Bei Interesse: Audit-Call buchen.',
  whenItFits: {
    fits: [
      'Wir sammeln aktuell Persona-Daten aus echten Builds',
      'Spezifische Fit-Kriterien werden bei Live-Schaltung ergänzt',
    ],
    requires: [
      'Audit-Gespräch zur Bedarfsklärung empfohlen',
    ],
  },
  outcomes: [
    'Konkrete Outcome-Quantifizierung folgt nach echtem Pilot-Run',
    'Wir verkaufen keine fiktiven Zahlen — siehe Ehrlichkeits-Prinzip',
  ],
};

/** Englische Entsprechung von STUB_TEXT (gleiche Reihenfolge → 1:1 Mapping). */
export const STUB_TEXT_EN = {
  whatIsIt:
    'A detailed description will follow after the next quality-gate build. This service is currently going through our internal validation: our own usage, workflow export, PDF guide. Interested? Book an audit call.',
  whenItFits: {
    fits: [
      'We are currently gathering persona data from real builds',
      'Specific fit criteria will be added at go-live',
    ],
    requires: [
      'An audit call to clarify your needs is recommended',
    ],
  },
  outcomes: [
    'Concrete outcome quantification will follow after a real pilot run',
    'We do not sell fictional numbers — see our honesty principle',
  ],
};
