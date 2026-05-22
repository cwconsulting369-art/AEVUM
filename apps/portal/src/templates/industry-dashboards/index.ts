/**
 * Industry-Dashboard-Templates — Public Exports
 *
 * Nutzung:
 *   import { loadIndustryTemplate } from '@/templates/industry-dashboards';
 *   const tpl = await loadIndustryTemplate(project.industry);
 */
export type {
  IndustryTemplate,
  KpiDef,
  KpiFormat,
  DashboardModule,
} from './types';

export {
  loadIndustryTemplate,
  normalizeIndustryKey,
  knownIndustryKeys,
} from './loader';

export { defaultTemplate } from './default';
