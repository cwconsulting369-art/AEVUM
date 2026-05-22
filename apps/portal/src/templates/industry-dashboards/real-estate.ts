import type { IndustryTemplate } from './types';

/**
 * Real Estate / Immobilien
 *
 * Zielgruppe: Patrick (Thailand RE), Hausverwaltungen ohne Energy-Fokus,
 * Makler / Property-Management.
 */
export const realEstateTemplate: IndustryTemplate = {
  industry: 'real-estate',
  display_name: 'Real Estate / Immobilien',
  audience_hint: 'Makler, Property Manager, Investment-Vermittler.',
  default_modules: [
    'kpi-strip',
    'leads-funnel',
    'properties-table',
    'visit-calendar',
    'follow-up-tasks',
  ],
  kpi_strip: [
    {
      id: 'leads_weekly',
      label: 'Leads diese Woche',
      format: 'number',
      source: 'project.metrics.leads_weekly',
      hint: 'Eingehende Anfragen aus CRM und Web-Forms.',
    },
    {
      id: 'lead_to_visit',
      label: 'Lead → Termin %',
      format: 'percent',
      source: 'project.metrics.lead_to_visit_rate',
    },
    {
      id: 'avg_deal_value',
      label: 'Ø Deal-Volumen',
      format: 'currency',
      source: 'project.metrics.avg_deal_value_eur',
    },
    {
      id: 'pipeline_value',
      label: 'Pipeline gesamt',
      format: 'currency',
      source: 'project.metrics.pipeline_value_eur',
    },
    {
      id: 'active_listings',
      label: 'Aktive Objekte',
      format: 'number',
      source: 'project.metrics.active_listings_count',
    },
  ],
  empty_state_hint:
    'Verbinde dein CRM (HubSpot, Pipedrive, Folk) oder Listing-System, um Leads, Objekte und Pipeline zu sehen.',
  recommended_workflows: [
    'lead-routing-v1',
    'email-automation-v1',
    'follow-up-reminder-v1',
    'visit-scheduling-v1',
  ],
};
