// Shared types for the AEVUM project business-operations dashboard.

export type DashboardKPIs = {
  audits_this_week: number;
  audits_last_week: number;
  audits_delta: number;
  audit_to_plan_pct: number | null;
  plan_to_call_pct: number | null;
  call_to_deal_pct: number | null;
  mrr_eur: number;
  helpbot_conversations_week: number;
};

export type FunnelStage = {
  stage: string;
  label: string;
  count: number;
  conversion_pct: number | null;
};

export type WeeklyPoint = { week_start: string; count: number };

export type RecentAudit = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  industry: string | null;
  status: string;
  deal_recommendation: string | null;
  confidence: number | null;
  plan_pdf_url: string | null;
  has_analysis: boolean;
};

export type CustomerRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  health: 'green' | 'yellow' | 'red';
  created_at: string;
};

export type HelpbotRecent = {
  id_hash: string;
  started_at: string;
  last_msg_at: string;
  message_count: number;
  first_msg_preview: string;
};

export type DashboardData = {
  project: { id: string; slug: string; name: string };
  generated_at: string;
  kpis: DashboardKPIs;
  funnel: FunnelStage[];
  funnel_weekly: WeeklyPoint[];
  recent_audits: RecentAudit[];
  customers: {
    total: number;
    active: number;
    list: CustomerRow[];
  };
  helpbot_insights: {
    recent: HelpbotRecent[];
    top_pains: Array<{ text: string; count: number }>;
    handoff_rate_pct: number | null;
    total_extractions: number;
  };
  marketing: {
    cold_calls_week: number | null;
    linkedin_posts_week: number | null;
    lead_magnet_downloads_week: number | null;
    note: string | null;
  };
  finance: {
    stripe_mrr_eur: number;
    pending_invoices_count: number;
    pending_invoices_eur: number;
    setup_fees_collected_month_eur: number;
    customer_ltv_estimate_eur: number | null;
    has_stripe: boolean;
    note: string | null;
  };
};

export function fmtEur(n: number | null | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(n % 1 === 0 ? 0 : 1)}%`;
}
