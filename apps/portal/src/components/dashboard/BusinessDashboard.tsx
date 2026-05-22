import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
        const msg = e instanceof Error ? e.message : 'Dashboard konnte nicht geladen werden';
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
        <div className="text-xs text-ink-400">Business-Daten werden geladen…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-premium p-10 text-center">
        <div className="text-sm text-rose-300">{error || 'Keine Daten verfügbar.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: KPI-Strip */}
      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">Top-KPIs</h2>
        <KPIStrip kpis={data.kpis} weekly={data.funnel_weekly} />
      </section>

      {/* Section 2: Pipeline-Funnel */}
      <section>
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} className="text-gold-300" /> Pipeline-Funnel
          </h2>
          <span className="text-[0.65rem] text-ink-400">letzte 12 Wochen</span>
        </header>
        <div className="card-premium p-6">
          <FunnelChart stages={data.funnel} />
        </div>
      </section>

      {/* Section 3: Recent Audits */}
      <section>
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ListChecks size={14} className="text-gold-300" /> Letzte Audits
          </h2>
          <span className="badge">{data.recent_audits.length}</span>
        </header>
        <AuditsTable audits={data.recent_audits} />
      </section>

      {/* Section 4 + 5: Customers + Helpbot side-by-side */}
      <section className="grid lg:grid-cols-2 gap-4">
        <CustomerHealthCard customers={data.customers} />
        <HelpbotInsightsCard insights={data.helpbot_insights} />
      </section>

      {/* Section 6 + 7: Marketing + Finance side-by-side */}
      <section className="grid lg:grid-cols-2 gap-4">
        <MarketingCard marketing={data.marketing} />
        <FinanceCard finance={data.finance} />
      </section>

      <footer className="text-[0.65rem] text-ink-500 text-center pt-2 flex items-center justify-center gap-2">
        <TrendingUp size={10} />
        <span>Live-Daten · gecached 60s · zuletzt aktualisiert {new Date(data.generated_at).toLocaleTimeString('de-DE')}</span>
      </footer>
    </div>
  );
}
