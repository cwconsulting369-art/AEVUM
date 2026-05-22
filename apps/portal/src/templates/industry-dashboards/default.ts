import type { IndustryTemplate } from './types';

/**
 * Default / Cross-Industry Fallback
 *
 * Wird verwendet wenn project.industry nicht gesetzt ist oder kein
 * spezifisches Template matched. Generic KPIs, die für jedes Service-
 * oder Service-getriebene Business sinnvoll sind.
 */
export const defaultTemplate: IndustryTemplate = {
  industry: 'default',
  display_name: 'Cross-Industry',
  audience_hint: 'Generic-Fallback für alle Projekte ohne spezifische Branche.',
  default_modules: [
    'kpi-strip',
    'recent-activity',
    'workflows-overview',
    'team-activity',
  ],
  kpi_strip: [
    {
      id: 'active_workflows',
      label: 'Aktive Workflows',
      format: 'number',
      source: 'project.metrics.active_workflows',
    },
    {
      id: 'executions_7d',
      label: 'Executions (7T)',
      format: 'compact',
      source: 'project.metrics.executions_7d',
    },
    {
      id: 'agent_uptime',
      label: 'Agent Uptime',
      format: 'percent',
      source: 'project.metrics.agent_uptime_pct',
    },
    {
      id: 'last_activity',
      label: 'Letzte Aktivität',
      format: 'duration',
      source: 'project.metrics.last_activity_minutes_ago',
    },
  ],
  empty_state_hint:
    'Setze die Branche im Projekt-Profil, um ein passendes Dashboard-Template zu laden — oder verbinde deine Tools.',
  recommended_workflows: ['health-check-v1', 'daily-digest-v1'],
};
