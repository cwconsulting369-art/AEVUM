/**
 * Industry Dashboard Template Types
 *
 * Branchen-spezifische Dashboard-Templates.
 * Pro Branche: KPI-Strip + Sections + Empty-States + recommended Workflows.
 *
 * Templates sind READ-ONLY-Configs. User-Customizing erfolgt später
 * via project.os_config Override (nicht hier).
 *
 * Carlos-Direktive: KEINE Mock-Daten. Wenn keine Source-Daten verfügbar
 * sind, zeigen wir Empty-State / "—" — niemals erfundene Zahlen.
 */

export type KpiFormat = 'number' | 'percent' | 'currency' | 'duration' | 'compact';

export type KpiDef = {
  /** Stabile ID innerhalb des Templates (für Persistenz / Customizing) */
  id: string;
  /** Label in der UI (de-DE) */
  label: string;
  /** Wie der Wert formatiert wird, falls vorhanden */
  format: KpiFormat;
  /**
   * Dot-path in das Project-/Metrics-Payload (z.B. "project.metrics.leads_weekly").
   * Loader übergibt das ohne Eval an die Render-Schicht; nicht-existente Pfade → "—".
   */
  source: string;
  /** Optional: Mini-Tooltip / Erklärung */
  hint?: string;
};

export type DashboardModule =
  | 'kpi-strip'
  // Real Estate
  | 'leads-funnel'
  | 'properties-table'
  | 'visit-calendar'
  | 'follow-up-tasks'
  // E-Commerce
  | 'top-products'
  | 'cart-abandonment'
  | 'marketing-spend'
  | 'orders-timeline'
  // Trading / Finance
  | 'channel-health'
  | 'recent-trades'
  | 'signal-feed'
  // Energy / Consulting
  | 'lieferstellen-map'
  | 'compliance-tracker'
  | 'contracts-table'
  // Content / Script
  | 'project-pipeline'
  | 'tool-usage'
  | 'output-tracker'
  // Tax / Legal
  | 'deadline-calendar'
  | 'mandates-table'
  | 'document-inbox'
  // Generic
  | 'team-activity'
  | 'workflows-overview'
  | 'recent-activity';

export type IndustryTemplate = {
  /** Lowercase-Key, matcht project.industry */
  industry: string;
  /** Display-Name in de-DE */
  display_name: string;
  /** Kurze Beschreibung der Zielgruppe */
  audience_hint: string;
  /** Welche Module gerendert werden (in Reihenfolge) */
  default_modules: DashboardModule[];
  /** 4-6 KPIs für die Strip */
  kpi_strip: KpiDef[];
  /** Empty-State-Hint, wenn noch keine Daten vorhanden */
  empty_state_hint: string;
  /** Slugs aus blueprint_workflows-Library, die empfohlen werden */
  recommended_workflows: string[];
};
