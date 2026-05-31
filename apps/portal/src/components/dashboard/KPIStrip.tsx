import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import type { DashboardKPIs, WeeklyPoint } from './types';
import { fmtEur, fmtPct } from './types';
import Sparkline from './Sparkline';
import { useTranslation } from 'react-i18next';

type Props = {
  kpis: DashboardKPIs;
  weekly: WeeklyPoint[];
};

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.65rem] text-ink-400">
        <ArrowRight size={10} /> 0
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[0.65rem] font-medium ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
      {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {up ? '+' : ''}{delta}
    </span>
  );
}

type Cell = {
  label: string;
  value: string;
  meta?: React.ReactNode;
  sparkline?: number[];
};

export default function KPIStrip({ kpis, weekly }: Props) {
  const { t } = useTranslation();
  const sparkSeries = weekly.map(w => w.count);

  const cells: Cell[] = [
    {
      label: t('dashComponents.kpi.auditsThisWeek'),
      value: String(kpis.audits_this_week),
      meta: <DeltaBadge delta={kpis.audits_delta} />,
      sparkline: sparkSeries
    },
    {
      label: t('dashComponents.kpi.auditToPlan'),
      value: fmtPct(kpis.audit_to_plan_pct),
      meta: <span className="text-[0.65rem] text-ink-400">{t('dashComponents.kpi.auditToPlanMeta')}</span>
    },
    {
      label: t('dashComponents.kpi.planToCall'),
      value: fmtPct(kpis.plan_to_call_pct),
      meta: <span className="text-[0.65rem] text-ink-400">{t('dashComponents.kpi.planToCallMeta')}</span>
    },
    {
      label: t('dashComponents.kpi.callToDeal'),
      value: fmtPct(kpis.call_to_deal_pct),
      meta: <span className="text-[0.65rem] text-ink-400">{t('dashComponents.kpi.callToDealMeta')}</span>
    },
    {
      label: t('dashComponents.kpi.mrr'),
      value: fmtEur(kpis.mrr_eur),
      meta: kpis.mrr_eur === 0
        ? <span className="text-[0.65rem] text-ink-400">{t('dashComponents.kpi.mrrNone')}</span>
        : <span className="text-[0.65rem] text-emerald-300">{t('dashComponents.kpi.mrrActive')}</span>
    },
    {
      label: t('dashComponents.kpi.helpbotWeek'),
      value: String(kpis.helpbot_conversations_week),
      meta: <span className="text-[0.65rem] text-ink-400">{t('dashComponents.kpi.conversations')}</span>
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className="card-premium p-4 animate-fade-up flex flex-col h-full"
          style={{ animationDelay: `${40 + i * 50}ms` }}
        >
          <div className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold mb-1.5">{c.label}</div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl font-bold text-white font-mono tabular-nums leading-none">{c.value}</div>
            {c.sparkline ? <Sparkline data={c.sparkline} width={60} height={20} /> : null}
          </div>
          <div className="mt-auto pt-2">{c.meta}</div>
        </div>
      ))}
    </div>
  );
}
