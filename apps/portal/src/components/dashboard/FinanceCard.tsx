import { CreditCard, FileWarning, Wallet } from 'lucide-react';
import type { DashboardData } from './types';
import { fmtEur } from './types';

type Props = { finance: DashboardData['finance'] };

export default function FinanceCard({ finance }: Props) {
  const isVirgin = finance.stripe_mrr_eur === 0 && finance.pending_invoices_count === 0 && finance.setup_fees_collected_month_eur === 0;
  return (
    <div className="card-premium p-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <CreditCard size={14} className="text-gold-300" />
          Finance (Stripe)
        </h3>
        {!finance.has_stripe ? (
          <span className="badge">offline</span>
        ) : isVirgin ? (
          <span className="badge">bereit</span>
        ) : (
          <span className="badge badge-emerald">aktiv</span>
        )}
      </header>

      {isVirgin && finance.has_stripe ? (
        <div className="text-center py-6">
          <Wallet size={28} className="mx-auto mb-3 text-gold-300/60" />
          <div className="text-sm text-ink-300">Bereit für ersten Customer-Payment.</div>
          <div className="text-xs text-ink-400 mt-1">Stripe ist verbunden, noch keine Subscriptions aktiv.</div>
        </div>
      ) : !finance.has_stripe ? (
        <div className="text-center py-6">
          <Wallet size={28} className="mx-auto mb-3 text-rose-300/60" />
          <div className="text-sm text-ink-300">Stripe nicht konfiguriert.</div>
          <div className="text-xs text-ink-400 mt-1">{finance.note || 'STRIPE_SECRET_KEY fehlt im API.'}</div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-3">
          <Cell label="MRR (Subs)" value={fmtEur(finance.stripe_mrr_eur)} accent="emerald" />
          <Cell label="Setup-Fees Monat" value={fmtEur(finance.setup_fees_collected_month_eur)} />
          <Cell
            label="Offene Rechnungen"
            value={`${finance.pending_invoices_count} · ${fmtEur(finance.pending_invoices_eur)}`}
            accent={finance.pending_invoices_count > 0 ? 'warn' : undefined}
            icon={finance.pending_invoices_count > 0 ? <FileWarning size={11} /> : undefined}
          />
          <Cell label="LTV-Estimate" value={fmtEur(finance.customer_ltv_estimate_eur)} />
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
    <div className="border border-white/[0.06] rounded-md p-3 bg-white/[0.02]">
      <div className="text-[0.6rem] uppercase tracking-wider text-ink-400 font-semibold mb-1 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-bold font-mono tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
