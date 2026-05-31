import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import {
  TrendingUp, Filter, ListChecks, Users, DollarSign,
  BarChart2, Globe, ArrowUpRight, ArrowDownRight, Minus,
  CheckCircle2, AlertCircle, Clock, Zap, Target, Mail, Phone
} from 'lucide-react';
import KPIStrip from './KPIStrip';
import FunnelChart from './FunnelChart';
import AuditsTable from './AuditsTable';
import HelpbotInsightsCard from './HelpbotInsightsCard';
import CustomerHealthCard from './CustomerHealthCard';
import MarketingCard from './MarketingCard';
import FinanceCard from './FinanceCard';
import type { DashboardData, CustomerRow } from './types';
import { fmtEur, fmtPct } from './types';

type Props = { section: string };

export default function AEVUMDashboard({ section }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<{ ok: boolean } & DashboardData>('/api/me/projects/aevum/dashboard')
      .then(d => {
        if (!active) return;
        setData(d as unknown as DashboardData);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : t('dashComponents.aevum.notReachable');
        setError(msg);
        toast.error(msg);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="card-premium p-16 flex flex-col items-center justify-center gap-4">
        <Spinner size="md" />
        <div className="text-xs text-ink-400">{t('dashComponents.aevum.loading')}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-premium p-10 text-center">
        <div className="text-sm text-rose-300">{error || t('dashComponents.common.noData')}</div>
      </div>
    );
  }

  switch (section) {
    case 'pipeline':  return <SectionPipeline data={data} />;
    case 'revenue':   return <SectionRevenue data={data} />;
    case 'kunden':    return <SectionKunden data={data} />;
    case 'content':   return <SectionContent data={data} />;
    default:          return <SectionOverview data={data} />;
  }
}

// ── Overview ─────────────────────────────────────────────────────────────────

function SectionOverview({ data }: { data: DashboardData }) {
  const { t } = useTranslation();
  const k = data.kpis;
  const mrr = data.finance.stripe_mrr_eur;
  const activeClients = data.customers.active;

  const topKpis = [
    {
      label: t('dashComponents.aevum.mrr'),
      value: fmtEur(mrr),
      sub: mrr === 0 ? t('dashComponents.aevum.noMrr') : t('dashComponents.aevum.activeClients', { count: activeClients }),
      trend: mrr > 0 ? 'up' : 'flat',
      icon: DollarSign,
    },
    {
      label: t('dashComponents.aevum.activeClientsLabel'),
      value: String(activeClients),
      sub: t('dashComponents.aevum.totalLabel', { count: data.customers.total }),
      trend: activeClients > 1 ? 'up' : 'flat',
      icon: Users,
    },
    {
      label: t('dashComponents.aevum.auditsThisWeek'),
      value: String(k.audits_this_week),
      sub: k.audits_delta > 0 ? t('dashComponents.aevum.deltaUp', { n: k.audits_delta }) : k.audits_delta < 0 ? t('dashComponents.aevum.deltaDown', { n: k.audits_delta }) : t('dashComponents.aevum.deltaSame'),
      trend: k.audits_delta > 0 ? 'up' : k.audits_delta < 0 ? 'down' : 'flat',
      icon: Target,
    },
    {
      label: t('dashComponents.aevum.helpbotConversations'),
      value: String(k.helpbot_conversations_week),
      sub: t('dashComponents.aevum.thisWeek'),
      trend: 'flat' as const,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {topKpis.map(({ label, value, sub, trend, icon: Icon }) => (
          <div key={label} className="card-premium p-4 sm:p-5 h-full flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                <Icon size={15} className="text-gold-300" />
              </div>
              {trend === 'up' && <ArrowUpRight size={14} className="text-emerald-400" />}
              {trend === 'down' && <ArrowDownRight size={14} className="text-rose-400" />}
              {trend === 'flat' && <Minus size={14} className="text-ink-500" />}
            </div>
            <div className="mt-auto text-2xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-[0.65rem] text-ink-400 mt-0.5">{label}</div>
            <div className="text-[0.6rem] text-ink-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel + Audits */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Filter size={12} className="text-gold-300" /> {t('dashComponents.aevum.pipelineFunnel')}
          </h2>
          <div className="card-premium p-4 sm:p-6">
            <FunnelChart stages={data.funnel} />
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users size={12} className="text-gold-300" /> {t('dashComponents.aevum.activeCustomers')}
          </h2>
          <div className="card-premium divide-y divide-white/5">
            {data.customers.list.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-500">{t('dashComponents.aevum.noCustomers')}</div>
            ) : (
              data.customers.list.map(c => (
                <ClientRow key={c.id} c={c} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Last audits */}
      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ListChecks size={12} className="text-gold-300" /> {t('dashComponents.aevum.recentAudits')}
          <span className="badge ml-auto">{data.recent_audits.length}</span>
        </h2>
        <AuditsTable audits={data.recent_audits} />
      </section>

      <footer className="text-[0.65rem] text-ink-500 text-center flex items-center justify-center gap-2 pt-2">
        <TrendingUp size={10} />
        <span>{t('dashComponents.aevum.lastUpdated', { time: new Date(data.generated_at).toLocaleTimeString('de-DE') })}</span>
      </footer>
    </div>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

function SectionPipeline({ data }: { data: DashboardData }) {
  const { t } = useTranslation();
  const k = data.kpis;

  const convRates = [
    { label: t('dashComponents.aevum.auditToPlan'),   value: fmtPct(k.audit_to_plan_pct),   icon: Target },
    { label: t('dashComponents.aevum.planToCall'),          value: fmtPct(k.plan_to_call_pct),    icon: Phone },
    { label: t('dashComponents.aevum.callToDeal'),          value: fmtPct(k.call_to_deal_pct),    icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {convRates.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium p-4 sm:p-5 text-center h-full flex flex-col">
            <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mx-auto mb-3">
              <Icon size={16} className="text-gold-300" />
            </div>
            <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-[0.65rem] text-ink-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart2 size={12} className="text-gold-300" /> {t('dashComponents.aevum.funnelViz')}
        </h2>
        <div className="card-premium p-4 sm:p-6">
          <FunnelChart stages={data.funnel} />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ListChecks size={12} className="text-gold-300" /> {t('dashComponents.aevum.allAudits')}
          <span className="badge ml-auto">{data.recent_audits.length}</span>
        </h2>
        <AuditsTable audits={data.recent_audits} />
      </section>
    </div>
  );
}

// ── Revenue ───────────────────────────────────────────────────────────────────

function SectionRevenue({ data }: { data: DashboardData }) {
  const { t } = useTranslation();
  const f = data.finance;

  const items = [
    { label: t('dashComponents.aevum.mrrStripe'),          value: fmtEur(f.stripe_mrr_eur),              icon: TrendingUp, highlight: true },
    { label: t('dashComponents.aevum.setupFeesMonth'),    value: fmtEur(f.setup_fees_collected_month_eur), icon: DollarSign },
    { label: t('dashComponents.aevum.pendingInvoices'),     value: `${f.pending_invoices_count} · ${fmtEur(f.pending_invoices_eur)}`, icon: AlertCircle },
    { label: t('dashComponents.aevum.customerLtv'),   value: fmtEur(f.customer_ltv_estimate_eur),    icon: Target },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {items.map(({ label, value, icon: Icon, highlight }) => (
          <div key={label} className={`card-premium p-4 sm:p-5 h-full flex flex-col ${highlight ? 'border-gold-400/30' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-3">
              <Icon size={15} className="text-gold-300" />
            </div>
            <div className={`mt-auto text-2xl font-bold tabular-nums ${highlight ? 'text-gold-300' : 'text-white'}`}>{value}</div>
            <div className="text-[0.65rem] text-ink-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <FinanceCard finance={f} />

      {f.note && (
        <div className="card-premium p-4 text-xs text-ink-400 border-l-2 border-gold-400/40">
          {f.note}
        </div>
      )}
    </div>
  );
}

// ── Kunden ────────────────────────────────────────────────────────────────────

function SectionKunden({ data }: { data: DashboardData }) {
  const { t } = useTranslation();
  const { list, total, active } = data.customers;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {[
          { label: t('dashComponents.aevum.total'), value: total, icon: Users },
          { label: t('dashComponents.aevum.active'),  value: active, icon: CheckCircle2 },
          { label: t('dashComponents.aevum.inactive'),value: total - active, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium p-4 sm:p-5 text-center h-full flex flex-col">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mx-auto mb-3">
              <Icon size={15} className="text-gold-300" />
            </div>
            <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-[0.65rem] text-ink-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={12} className="text-gold-300" /> {t('dashComponents.aevum.customersOverview')}
        </h2>
        <div className="card-premium divide-y divide-white/5">
          {list.length === 0 ? (
            <div className="p-10 text-center text-xs text-ink-500">{t('dashComponents.aevum.noCustomersCreated')}</div>
          ) : (
            list.map(c => <ClientRow key={c.id} c={c} detailed />)
          )}
        </div>
      </section>

      <CustomerHealthCard customers={data.customers} />

      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={12} className="text-gold-300" /> {t('dashComponents.aevum.helpbotInsights')}
        </h2>
        <HelpbotInsightsCard insights={data.helpbot_insights} />
      </section>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

function SectionContent({ data }: { data: DashboardData }) {
  const { t } = useTranslation();
  const m = data.marketing;

  const stats = [
    { label: t('dashComponents.aevum.linkedinPostsWeek'),     value: m.linkedin_posts_week ?? '—',      icon: Globe },
    { label: t('dashComponents.aevum.coldCallsWeek'),          value: m.cold_calls_week ?? '—',           icon: Phone },
    { label: t('dashComponents.aevum.leadMagnetDownloads'),       value: m.lead_magnet_downloads_week ?? '—', icon: Mail },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium p-4 sm:p-5 text-center h-full flex flex-col">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mx-auto mb-3">
              <Icon size={15} className="text-gold-300" />
            </div>
            <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-[0.65rem] text-ink-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <MarketingCard marketing={m} />

      {m.note && (
        <div className="card-premium p-4 text-xs text-ink-400 border-l-2 border-gold-400/40">
          {m.note}
        </div>
      )}

      <div className="card-premium p-4 sm:p-6">
        <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4">{t('dashComponents.aevum.contentStrategy')}</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-xs items-stretch">
          {[
            { title: t('dashComponents.aevum.stratLinkedinTitle'), desc: t('dashComponents.aevum.stratLinkedinDesc'), color: 'text-blue-300' },
            { title: t('dashComponents.aevum.stratNetworkTitle'), desc: t('dashComponents.aevum.stratNetworkDesc'), color: 'text-emerald-300' },
            { title: t('dashComponents.aevum.stratAdsTitle'), desc: t('dashComponents.aevum.stratAdsDesc'), color: 'text-gold-300' },
          ].map(({ title, desc, color }) => (
            <div key={title} className="bg-white/[0.02] rounded-lg p-4 border border-white/5 h-full flex flex-col">
              <div className={`font-semibold ${color} mb-2`}>{title}</div>
              <div className="text-ink-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ClientRow({ c, detailed }: { c: CustomerRow; detailed?: boolean }) {
  const { t } = useTranslation();
  const healthColor = c.health === 'green' ? 'dot-ok' : c.health === 'yellow' ? 'dot-warn' : 'dot-off';
  const statusColor = c.status === 'active' ? 'text-emerald-300' : 'text-ink-500';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={`dot ${healthColor} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{c.name}</div>
        {detailed && (
          <div className="text-[0.65rem] text-ink-400 mt-0.5">
            {t('dashComponents.aevum.since', { date: new Date(c.created_at).toLocaleDateString('de-DE') })}
          </div>
        )}
      </div>
      <div className={`text-[0.65rem] font-medium ${statusColor} shrink-0`}>{c.status}</div>
    </div>
  );
}
