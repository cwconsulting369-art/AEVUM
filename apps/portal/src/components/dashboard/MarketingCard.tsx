import { Megaphone } from 'lucide-react';
import type { DashboardData } from './types';

type Props = { marketing: DashboardData['marketing'] };

export default function MarketingCard({ marketing }: Props) {
  const allPending =
    marketing.cold_calls_week == null &&
    marketing.linkedin_posts_week == null &&
    marketing.lead_magnet_downloads_week == null;

  return (
    <div className="card-premium p-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Megaphone size={14} className="text-gold-300" /> Marketing-Metriken
        </h3>
        {allPending && <span className="badge">Tracking pending</span>}
      </header>

      {allPending ? (
        <div className="text-center py-4">
          <div className="text-xs text-ink-400 leading-relaxed">
            {marketing.note || 'Tracking pending.'}
          </div>
          <div className="text-[0.65rem] text-ink-500 mt-2">
            marketing_events Tabelle wird automatisch befüllt sobald aktiv.
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
          <Cell label="Cold Calls" value={marketing.cold_calls_week} />
          <Cell label="LinkedIn-Posts" value={marketing.linkedin_posts_week} />
          <Cell label="Lead-Magnet-DL" value={marketing.lead_magnet_downloads_week} />
        </dl>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-white/[0.06] rounded-md p-3 bg-white/[0.02] h-full flex flex-col">
      <div className="text-[0.6rem] uppercase tracking-wider text-ink-400 font-semibold mb-1">{label}</div>
      <div className="mt-auto text-lg font-bold font-mono tabular-nums text-white">{value ?? '—'}</div>
    </div>
  );
}
