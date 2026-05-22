import { useState } from 'react';
import { FileText, X, ExternalLink } from 'lucide-react';
import type { RecentAudit } from './types';

type Props = {
  audits: RecentAudit[];
};

const statusBadge: Record<string, string> = {
  submitted: 'badge',
  analyzing: 'badge badge-gold',
  'plan-ready': 'badge badge-gold',
  'call-booked': 'badge badge-emerald',
  converted: 'badge badge-emerald',
  rejected: 'badge badge-rose'
};

const statusLabel: Record<string, string> = {
  submitted: 'eingegangen',
  analyzing: 'wird analysiert',
  'plan-ready': 'Plan bereit',
  'call-booked': 'Call gebucht',
  converted: 'Kunde',
  rejected: 'abgelehnt'
};

function dateShort(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export default function AuditsTable({ audits }: Props) {
  const [selected, setSelected] = useState<RecentAudit | null>(null);

  if (audits.length === 0) {
    return (
      <div className="card-premium p-10 text-center">
        <FileText size={28} className="mx-auto mb-3 text-gold-300/60" />
        <div className="text-sm text-ink-300">Noch keine Audits.</div>
        <div className="text-xs text-ink-400 mt-1">Teile <span className="font-mono text-gold-300">aevum-system.de/audit</span> mit ersten Leads.</div>
      </div>
    );
  }

  return (
    <>
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold border-b border-white/[0.06]">
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Firma</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Branche</th>
                <th className="px-4 py-3 font-semibold">Deal</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a, i) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] cursor-pointer transition animate-fade-up"
                  style={{ animationDelay: `${30 + i * 25}ms` }}
                >
                  <td className="px-4 py-3 text-ink-300 font-mono text-xs tabular-nums">{dateShort(a.created_at)}</td>
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{a.name || '—'}</div>
                    <div className="text-[0.7rem] text-ink-400 truncate max-w-[180px]">{a.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-200 hidden sm:table-cell">{a.company || '—'}</td>
                  <td className="px-4 py-3 text-ink-400 hidden md:table-cell text-xs">{a.industry || '—'}</td>
                  <td className="px-4 py-3">
                    {a.deal_recommendation ? (
                      <span className="badge badge-gold">{a.deal_recommendation}</span>
                    ) : (
                      <span className="text-ink-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusBadge[a.status] || 'badge'}>
                      {statusLabel[a.status] || a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="card-premium max-w-3xl w-full max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 p-6 border-b border-white/[0.06]">
              <div className="min-w-0">
                <div className="text-[0.65rem] uppercase tracking-wider text-gold-300 mb-1 font-semibold">Audit-Detail</div>
                <h3 className="text-lg font-bold text-white truncate">{selected.company || selected.name}</h3>
                <div className="text-xs text-ink-400 mt-1 font-mono">{selected.email}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-ink-400 hover:text-white p-2 rounded-md hover:bg-white/5 shrink-0 transition"
                aria-label="Schließen"
              >
                <X size={16} />
              </button>
            </header>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <Stat label="Datum" value={dateShort(selected.created_at)} />
                <Stat label="Status" value={statusLabel[selected.status] || selected.status} />
                <Stat label="Deal" value={selected.deal_recommendation || '—'} />
                <Stat label="Branche" value={selected.industry || '—'} />
              </div>
              {selected.plan_pdf_url && (
                <a
                  href={selected.plan_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full justify-center"
                >
                  <ExternalLink size={14} /> Plan-PDF öffnen
                </a>
              )}
              {selected.has_analysis ? (
                <div>
                  <div className="text-[0.65rem] uppercase tracking-wider text-ink-400 mb-2 font-semibold">Analysis Result</div>
                  <pre className="text-[0.7rem] text-ink-200 bg-ink-950/60 border border-white/[0.06] rounded-md p-4 overflow-x-auto max-h-[40vh] font-mono leading-relaxed">
                    {JSON.stringify({ ...selected, plan_pdf_url: undefined }, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-xs text-ink-400">Noch keine Analyse vorhanden.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/[0.06] rounded-md p-3 bg-white/[0.02]">
      <div className="text-[0.6rem] uppercase tracking-wider text-ink-400 font-semibold mb-0.5">{label}</div>
      <div className="text-sm text-white font-medium truncate">{value}</div>
    </div>
  );
}
