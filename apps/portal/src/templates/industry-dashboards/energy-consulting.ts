import type { IndustryTemplate } from './types';

/**
 * Energy Consulting / Strom & Gas
 *
 * Zielgruppe: Miguel / UtilityHub-Pattern, Hausverwaltungen mit
 * Energie-Beschaffung, Teleson-Vertriebspartner.
 */
export const energyConsultingTemplate: IndustryTemplate = {
  industry: 'energy-consulting',
  display_name: 'Energy Consulting / Strom & Gas',
  audience_hint:
    'Hausverwaltungen, Energie-Vermittler, Teleson-Partner, B2B-Energie-Beschaffung.',
  default_modules: [
    'kpi-strip',
    'contracts-table',
    'lieferstellen-map',
    'compliance-tracker',
    'follow-up-tasks',
  ],
  kpi_strip: [
    {
      id: 'contracts_managed',
      label: 'Verträge in Betreuung',
      format: 'number',
      source: 'project.metrics.contracts_count',
    },
    {
      id: 'savings_eur_ytd',
      label: 'Ersparnis YTD',
      format: 'currency',
      source: 'project.metrics.savings_ytd_eur',
      hint: 'Eingespartes Volumen für Kunden, kumuliert seit Jahresbeginn.',
    },
    {
      id: 'active_customers',
      label: 'Aktive Kunden',
      format: 'number',
      source: 'project.metrics.active_customers_count',
    },
    {
      id: 'lieferstellen',
      label: 'Lieferstellen gesamt',
      format: 'number',
      source: 'project.metrics.lieferstellen_count',
    },
    {
      id: 'eu_ai_act_score',
      label: 'EU AI-Act Score',
      format: 'percent',
      source: 'project.metrics.eu_ai_act_compliance_score',
      hint: 'Erfüllungsgrad der relevanten Compliance-Items.',
    },
    {
      id: 'commission_mtd',
      label: 'Provision MTD',
      format: 'currency',
      source: 'project.metrics.commission_mtd_eur',
    },
  ],
  empty_state_hint:
    'Verbinde dein Energie-CRM oder UtilityHub-Account, um Verträge, Lieferstellen und Ersparnisse zu sehen.',
  recommended_workflows: [
    'vertrag-monitor-v1',
    'kuendigung-reminder-v1',
    'tarifvergleich-v1',
    'dsgvo-erasure-v1',
  ],
};
