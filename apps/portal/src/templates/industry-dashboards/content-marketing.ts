import type { IndustryTemplate } from './types';

/**
 * Content / Marketing / Script-Factory
 *
 * Zielgruppe: Tim (ScriptFactory), Content-Agencies, Creator-Studios,
 * Performance-Creative-Teams.
 */
export const contentMarketingTemplate: IndustryTemplate = {
  industry: 'content-marketing',
  display_name: 'Content / Marketing',
  audience_hint:
    'Content-Agencies, Creator-Studios, Script-/Ad-Production für E-Commerce-Kunden.',
  default_modules: [
    'kpi-strip',
    'project-pipeline',
    'output-tracker',
    'tool-usage',
    'team-activity',
  ],
  kpi_strip: [
    {
      id: 'scripts_produced_mtd',
      label: 'Scripts MTD',
      format: 'number',
      source: 'project.metrics.scripts_produced_mtd',
    },
    {
      id: 'output_views_7d',
      label: 'Output-Views (7T)',
      format: 'compact',
      source: 'project.metrics.output_views_7d',
    },
    {
      id: 'active_client_projects',
      label: 'Aktive Kundenprojekte',
      format: 'number',
      source: 'project.metrics.active_client_projects',
    },
    {
      id: 'avg_turnaround_days',
      label: 'Ø Turnaround',
      format: 'duration',
      source: 'project.metrics.avg_turnaround_days',
      hint: 'Briefing → Final-Asset, rollende 30 Tage.',
    },
    {
      id: 'monthly_revenue',
      label: 'Revenue MTD',
      format: 'currency',
      source: 'project.metrics.revenue_mtd_eur',
    },
  ],
  empty_state_hint:
    'Verbinde dein Project-Management (Notion, Linear, ClickUp) und Analytics (Meta Ads, TikTok), um Scripts, Views und Revenue zu sehen.',
  recommended_workflows: [
    'brief-intake-v1',
    'asset-handoff-v1',
    'creative-performance-monitor-v1',
    'script-template-library-v1',
  ],
};
