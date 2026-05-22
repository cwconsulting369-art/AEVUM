import type { IndustryTemplate } from './types';

/**
 * Finance / Trading / Signal-Communities
 *
 * Zielgruppe: Kevin (GoldTraderSociety), Signal-Channels,
 * Trading-Communities mit Abo-Modell.
 */
export const tradingTemplate: IndustryTemplate = {
  industry: 'trading',
  display_name: 'Trading / Signal-Community',
  audience_hint: 'Signal-Channels, Trading-Communities, Abo-basierte Finance-Services.',
  default_modules: [
    'kpi-strip',
    'channel-health',
    'recent-trades',
    'signal-feed',
    'workflows-overview',
  ],
  kpi_strip: [
    {
      id: 'active_members',
      label: 'Aktive Mitglieder',
      format: 'number',
      source: 'project.metrics.active_members',
    },
    {
      id: 'signals_sent_7d',
      label: 'Signale (7T)',
      format: 'number',
      source: 'project.metrics.signals_sent_7d',
    },
    {
      id: 'win_rate',
      label: 'Win-Rate',
      format: 'percent',
      source: 'project.metrics.win_rate',
      hint: 'Anteil profitabler Signale, rollende 30 Tage.',
    },
    {
      id: 'mrr',
      label: 'MRR',
      format: 'currency',
      source: 'project.metrics.mrr_eur',
    },
    {
      id: 'avg_rr',
      label: 'Ø RR-Verhältnis',
      format: 'number',
      source: 'project.metrics.avg_risk_reward',
    },
    {
      id: 'channel_growth_7d',
      label: 'Channel-Wachstum (7T)',
      format: 'percent',
      source: 'project.metrics.channel_growth_7d',
    },
  ],
  empty_state_hint:
    'Verbinde deinen Telegram-Bot, MT5-Bridge und Stripe-Account, um Mitglieder, Signale und MRR zu sehen.',
  recommended_workflows: [
    'signal-broadcast-v1',
    'member-onboarding-v1',
    'churn-saver-v1',
    'mt5-trade-mirror-v1',
  ],
};
