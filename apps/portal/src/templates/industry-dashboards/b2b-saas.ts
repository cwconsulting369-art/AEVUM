import type { IndustryTemplate } from './types';

/**
 * B2B SaaS / Consulting / Agency
 *
 * Generic Mittelstand-Pattern. Fallback für alle B2B-Service-Businesses
 * ohne spezielles Branchen-Template.
 */
export const b2bSaasTemplate: IndustryTemplate = {
  industry: 'b2b-saas',
  display_name: 'B2B SaaS / Consulting',
  audience_hint:
    'Software-Anbieter, Beratungen, Agenturen mit wiederkehrendem Revenue oder Retainer-Geschäft.',
  default_modules: [
    'kpi-strip',
    'leads-funnel',
    'recent-activity',
    'workflows-overview',
    'team-activity',
  ],
  kpi_strip: [
    {
      id: 'mrr',
      label: 'MRR',
      format: 'currency',
      source: 'project.metrics.mrr_eur',
    },
    {
      id: 'pipeline_value',
      label: 'Pipeline',
      format: 'currency',
      source: 'project.metrics.pipeline_value_eur',
    },
    {
      id: 'active_accounts',
      label: 'Aktive Accounts',
      format: 'number',
      source: 'project.metrics.active_accounts',
    },
    {
      id: 'churn_rate',
      label: 'Churn (rolling 30d)',
      format: 'percent',
      source: 'project.metrics.churn_rate_30d',
    },
    {
      id: 'avg_contract_value',
      label: 'Ø Contract-Value',
      format: 'currency',
      source: 'project.metrics.avg_contract_value_eur',
    },
  ],
  empty_state_hint:
    'Verbinde dein CRM (HubSpot, Pipedrive) und Billing (Stripe), um MRR, Pipeline und Churn zu sehen.',
  recommended_workflows: [
    'lead-routing-v1',
    'onboarding-sequence-v1',
    'renewal-reminder-v1',
    'health-score-monitor-v1',
  ],
};
