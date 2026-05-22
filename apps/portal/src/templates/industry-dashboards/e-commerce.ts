import type { IndustryTemplate } from './types';

/**
 * E-Commerce / DTC
 *
 * Zielgruppe: Tommy (Ketolabs / CollaGlow), Shopify-DTC-Brands,
 * Performance-Marketing-Heavy Stores.
 */
export const eCommerceTemplate: IndustryTemplate = {
  industry: 'e-commerce',
  display_name: 'E-Commerce / DTC',
  audience_hint: 'Shopify-Stores, DTC-Brands, Performance-Marketing-Teams.',
  default_modules: [
    'kpi-strip',
    'orders-timeline',
    'top-products',
    'cart-abandonment',
    'marketing-spend',
  ],
  kpi_strip: [
    {
      id: 'orders_today',
      label: 'Orders heute',
      format: 'number',
      source: 'project.metrics.orders_today',
    },
    {
      id: 'aov',
      label: 'AOV',
      format: 'currency',
      source: 'project.metrics.aov_eur',
      hint: 'Average Order Value, rollende 7 Tage.',
    },
    {
      id: 'conversion_rate',
      label: 'Conversion Rate',
      format: 'percent',
      source: 'project.metrics.conversion_rate',
    },
    {
      id: 'refund_rate',
      label: 'Refund-Quote',
      format: 'percent',
      source: 'project.metrics.refund_rate',
    },
    {
      id: 'roas',
      label: 'ROAS (Meta + Google)',
      format: 'number',
      source: 'project.metrics.roas',
    },
    {
      id: 'mrr',
      label: 'Subscription-MRR',
      format: 'currency',
      source: 'project.metrics.subscription_mrr_eur',
    },
  ],
  empty_state_hint:
    'Verbinde Shopify, Klaviyo und deine Ad-Accounts (Meta / Google Ads), um Orders, AOV und ROAS zu sehen.',
  recommended_workflows: [
    'abandoned-cart-recovery-v1',
    'post-purchase-flow-v1',
    'churn-prediction-v1',
    'ad-spend-monitor-v1',
  ],
};
