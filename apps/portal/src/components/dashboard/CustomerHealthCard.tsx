import { Users } from 'lucide-react';
import type { DashboardData } from './types';

type Props = { customers: DashboardData['customers'] };

const dotColor: Record<string, string> = {
  green: 'dot-ok',
  yellow: 'dot-warn',
  red: 'dot-off'
};

export default function CustomerHealthCard({ customers }: Props) {
  if (customers.total === 0) {
    return (
      <div className="card-premium p-6">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={14} className="text-gold-300" /> Customer Health
          </h3>
          <span className="badge">0 aktiv</span>
        </header>
        <div className="text-center py-6">
          <Users size={28} className="mx-auto mb-3 text-gold-300/60" />
          <div className="text-sm text-ink-300">Noch keine Customers.</div>
          <div className="text-xs text-ink-400 mt-1">Erster Audit erwartet — siehe Pipeline-Funnel.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users size={14} className="text-gold-300" /> Customer Health
        </h3>
        <span className="badge badge-emerald">{customers.active} aktiv</span>
      </header>
      <ul className="space-y-2">
        {customers.list.slice(0, 8).map((c, i) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 text-sm border border-white/[0.06] rounded-md p-3 bg-white/[0.02] animate-fade-up"
            style={{ animationDelay: `${30 + i * 35}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`dot ${dotColor[c.health] || 'dot-off'}`} aria-hidden />
              <div className="min-w-0">
                <div className="text-white truncate">{c.name}</div>
                <div className="text-[0.65rem] text-ink-400 font-mono">/{c.slug}</div>
              </div>
            </div>
            <span className="badge text-[0.6rem] shrink-0">{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
