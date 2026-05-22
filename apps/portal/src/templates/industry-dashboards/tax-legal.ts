import type { IndustryTemplate } from './types';

/**
 * Tax / Legal / Steuerkanzlei / Anwaltskanzlei
 *
 * Zielgruppe: Hoffmann Eitle, künftige Steuerkanzlei-/Anwaltskanzlei-Customers,
 * Mandats-getriebene Professional-Services.
 */
export const taxLegalTemplate: IndustryTemplate = {
  industry: 'tax-legal',
  display_name: 'Steuer- / Anwaltskanzlei',
  audience_hint: 'Steuerkanzleien, Anwaltskanzleien, Notariate.',
  default_modules: [
    'kpi-strip',
    'mandates-table',
    'deadline-calendar',
    'document-inbox',
    'team-activity',
  ],
  kpi_strip: [
    {
      id: 'active_mandates',
      label: 'Aktive Mandate',
      format: 'number',
      source: 'project.metrics.active_mandates',
    },
    {
      id: 'deadlines_7d',
      label: 'Fristen (7T)',
      format: 'number',
      source: 'project.metrics.deadlines_next_7d',
      hint: 'Anstehende gesetzliche oder mandatsbezogene Fristen.',
    },
    {
      id: 'documents_processed_mtd',
      label: 'Dokumente MTD',
      format: 'number',
      source: 'project.metrics.documents_processed_mtd',
    },
    {
      id: 'avg_response_hours',
      label: 'Ø Reaktionszeit',
      format: 'duration',
      source: 'project.metrics.avg_response_hours',
    },
    {
      id: 'monthly_billable',
      label: 'Billable MTD',
      format: 'currency',
      source: 'project.metrics.billable_mtd_eur',
    },
  ],
  empty_state_hint:
    'Verbinde DATEV, dein Dokumenten-Management-System (DMS) und Mandanten-CRM, um Mandate, Fristen und Billables zu sehen.',
  recommended_workflows: [
    'deadline-monitor-v1',
    'document-intake-v1',
    'mandant-onboarding-v1',
    'kommunikations-archiv-v1',
  ],
};
