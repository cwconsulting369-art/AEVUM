import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { TrendingUp, Filter, ListChecks } from 'lucide-react';
import KPIStrip from './KPIStrip';
import FunnelChart from './FunnelChart';
import AuditsTable from './AuditsTable';
import HelpbotInsightsCard from './HelpbotInsightsCard';
import FinanceCard from './FinanceCard';
import CustomerHealthCard from './CustomerHealthCard';
import MarketingCard from './MarketingCard';
import type { DashboardData } from './types';

type Props = { slug: string };

export default function BusinessDashboard({ slug }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<{ ok: boolean } & DashboardData>(`/api/me/projects/${slug}/dashboard`)
      .then(d => {
        if (!active) return;
        setData(d as unknown as DashboardData);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : t('dashComponents.common.loadFailed');
        setError(msg);
        toast.error(msg);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="card-premium p-16 flex flex-col items-center justify-center gap-4">
        <Spinner size="md" />
        <div className="text-xs text-ink-400">{t('dashComponents.business.loading')}</div>
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Section 1: KPI-Strip */}
      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">{t('dashComponents.business.topKpis')}</h2>
        <KPIStrip kpis={data.kpis} weekly={data.funnel_weekly} />
      </section>

      {/* Section 2: Pipeline-Funnel */}
      <section>
        <header className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} className="text-gold-300" /> {t('dashComponents.business.pipelineFunnel')}
          </h2>
          <span className="text-[0.65rem] text-ink-400">{t('dashComponents.business.last12Weeks')}</span>
        </header>
        <div className="card-premium p-4 sm:p-6">
          <FunnelChart stages={data.funnel} />
        </div>
      </section>

      {/* Section 3: Recent Audits */}
      <section>
        <header className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ListChecks size={14} className="text-gold-300" /> {t('dashComponents.business.recentAudits')}
          </h2>
          <span className="badge">{data.recent_audits.length}</span>
        </header>
        <AuditsTable audits={data.recent_audits} />
      </section>

      {/* Section 4 + 5: Customers + Helpbot side-by-side */}
      <section className="grid lg:grid-cols-2 gap-4 items-stretch">
        <CustomerHealthCard customers={data.customers} />
        <HelpbotInsightsCard insights={data.helpbot_insights} />
      </section>

      {/* Section 6 + 7: Marketing + Finance side-by-side */}
      <section className="grid lg:grid-cols-2 gap-4 items-stretch">
        <MarketingCard marketing={data.marketing} />
        <FinanceCard finance={data.finance} />
      </section>

      <footer className="text-[0.65rem] text-ink-500 text-center pt-2 flex items-center justify-center gap-2">
        <TrendingUp size={10} />
        <span>{t('dashComponents.business.liveFooter', { time: new Date(data.generated_at).toLocaleTimeString('de-DE') })}</span>
      </footer>
    </div>
  );
}
