import { CreditCard, FileWarning, Wallet } from 'lucide-react';
import type { DashboardData } from './types';
import { fmtEur } from './types';
import { useTranslation } from 'react-i18next';

type Props = { finance: DashboardData['finance'] };

export default function FinanceCard({ finance }: Props) {
  const { t } = useTranslation();
  const isVirgin = finance.stripe_mrr_eur === 0 && finance.pending_invoices_count === 0 && finance.setup_fees_collected_month_eur === 0;
  return (
    <div className="card-premium p-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <CreditCard size={14} className="text-gold-300" />
          {t('dashComponents.finance.title')}
        </h3>
        {!finance.has_stripe ? (
          <span className="badge">{t('dashComponents.finance.offline')}</span>
        ) : isVirgin ? (
          <span className="badge">{t('dashComponents.finance.ready')}</span>
        ) : (
          <span className="badge badge-emerald">{t('dashComponents.finance.active')}</span>
        )}
      </header>

      {isVirgin && finance.has_stripe ? (
        <div className="text-center py-6">
          <Wallet size={28} className="mx-auto mb-3 text-gold-300/60" />
          <div className="text-sm text-ink-300">{t('dashComponents.finance.readyTitle')}</div>
          <div className="text-xs text-ink-400 mt-1">{t('dashComponents.finance.readyHint')}</div>
        </div>
      ) : !finance.has_stripe ? (
        <div className="text-center py-6">
          <Wallet size={28} className="mx-auto mb-3 text-rose-300/60" />
          <div className="text-sm text-ink-300">{t('dashComponents.finance.notConfiguredTitle')}</div>
          <div className="text-xs text-ink-400 mt-1">{finance.note || t('dashComponents.finance.notConfiguredHint')}</div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-3 items-stretch">
          <Cell label={t('dashComponents.finance.mrr')} value={fmtEur(finance.stripe_mrr_eur)} accent="emerald" />
          <Cell label={t('dashComponents.finance.setupFees')} value={fmtEur(finance.setup_fees_collected_month_eur)} />
          <Cell
            label={t('dashComponents.finance.pendingInvoices')}
            value={`${finance.pending_invoices_count} · ${fmtEur(finance.pending_invoices_eur)}`}
            accent={finance.pending_invoices_count > 0 ? 'warn' : undefined}
            icon={finance.pending_invoices_count > 0 ? <FileWarning size={11} /> : undefined}
          />
          <Cell label={t('dashComponents.finance.ltv')} value={fmtEur(finance.customer_ltv_estimate_eur)} />
        </dl>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
  icon
}: {
  label: string;
  value: string;
  accent?: 'emerald' | 'warn';
  icon?: React.ReactNode;
}) {
  const color = accent === 'emerald' ? 'text-emerald-300' : accent === 'warn' ? 'text-amber-300' : 'text-white';
  return (
    <div className="border border-white/[0.06] rounded-md p-3 bg-white/[0.02] h-full flex flex-col">
      <div className="text-[0.6rem] uppercase tracking-wider text-ink-400 font-semibold mb-1 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className={`mt-auto text-lg font-bold font-mono tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
