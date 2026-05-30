// AEVUM Customer Activity Dashboard (Block B2)
// Created: 2026-05-25
//
// Per-project usage transparency: tokens, cost, breakdown by service, time-series.
// No recharts dep — CSS-bar chart works fine for a 30-day window.
//
// Consumes:
//   GET /api/me/projects/:slug/activity?days=N
//   GET /api/me/projects/:slug/activity/csv?days=N

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { api, getAccessToken } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { Activity, Coins, Hash, Mail, Download, Calendar } from 'lucide-react';

type Summary = {
  total_messages: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost_eur: number;
  total_credits_spent: number;
  last_activity: string | null;
};
type Breakdown = { service: string; messages: number; tokens: number; cost_eur: number };
type TSPoint = { day: string; messages: number; tokens: number; cost_eur: number };
type Resp = {
  ok: boolean;
  project: { id: string; slug: string; name: string };
  window_days: number;
  summary: Summary;
  breakdown_by_service: Breakdown[];
  timeseries: TSPoint[];
  current_period_billing: { daily_spend_eur: number; period_reset_at: string | null };
};

const RANGE_OPTIONS = [
  { value: 7, label: '7 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 90, label: '90 Tage' },
];

const SERVICE_LABELS: Record<string, string> = {
  helpbot: 'Helpbot',
  'project-agent': 'Project-Agent',
  factory: 'Factories',
  audit: 'Audit',
  other: 'Sonstige',
};

const SERVICE_COLORS: Record<string, string> = {
  helpbot: 'bg-blue-500',
  'project-agent': 'bg-aevum-gold',
  factory: 'bg-purple-500',
  audit: 'bg-emerald-500',
  other: 'bg-ink-600',
};

const API_BASE = import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';

function fmtEur(n: number) {
  return `€${n.toFixed(2)}`;
}
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}
function fmtDay(iso: string) {
  try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }); }
  catch { return iso; }
}

export default function CustomerActivity() {
  const { slug = '' } = useParams();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await api<Resp>(`/api/me/projects/${slug}/activity?days=${days}`);
        if (!cancelled) setData(r);
      } catch (e) {
        toast.error('Activity-Daten konnten nicht geladen werden');
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [slug, days]);

  const maxBarValue = useMemo(() => {
    if (!data?.timeseries) return 1;
    return Math.max(1, ...data.timeseries.map(p => p.cost_eur));
  }, [data]);

  const totalBreakdownCost = useMemo(() => {
    if (!data?.breakdown_by_service) return 0;
    return data.breakdown_by_service.reduce((s, b) => s + b.cost_eur, 0);
  }, [data]);

  const downloadCsv = () => {
    const token = getAccessToken();
    const url = `${API_BASE}/api/me/projects/${slug}/activity/csv?days=${days}`;
    // Authorization can't be set on window.open; use fetch + blob.
    fetch(url, { headers: { Authorization: `Bearer ${token || ''}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `activity-${slug}-${days}d.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => toast.error('CSV-Export fehlgeschlagen'));
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="md" /></div>;
  }
  if (!data) {
    return <p className="text-sm text-ink-500 py-12 text-center">Keine Daten verfügbar.</p>;
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-lg font-medium text-ink-100 flex items-center gap-2 break-words">
            <Activity size={18} className="shrink-0" /> Activity — {data.project.name}
          </h2>
          <p className="text-xs text-ink-500 mt-1">
            Letzte Aktivität: {fmtDate(s.last_activity)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="bg-ink-900 border border-ink-800 rounded px-2 py-1 text-sm text-ink-100"
          >
            {RANGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={downloadCsv}
            className="flex items-center gap-1 px-3 py-1 text-xs text-ink-300 border border-ink-800 rounded hover:bg-ink-900"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* KPI-Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard Icon={Mail} label="Nachrichten" value={s.total_messages.toString()} />
        <KpiCard Icon={Hash} label="Tokens" value={fmtNum(s.total_tokens)} sub={`in: ${fmtNum(s.total_input_tokens)} · out: ${fmtNum(s.total_output_tokens)}`} />
        <KpiCard Icon={Coins} label="Kosten" value={fmtEur(s.total_cost_eur)} />
        <KpiCard Icon={Calendar} label="Tagesausgaben" value={fmtEur(data.current_period_billing.daily_spend_eur)} sub="rolling 24h" />
      </div>

      {/* Breakdown by service */}
      {data.breakdown_by_service.length > 0 && (
        <div className="border border-ink-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-100 mb-3">Kosten nach Service</h3>
          <div className="space-y-2">
            {data.breakdown_by_service.map(b => {
              const pct = totalBreakdownCost > 0 ? (b.cost_eur / totalBreakdownCost) * 100 : 0;
              return (
                <div key={b.service} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-300">{SERVICE_LABELS[b.service] || b.service}</span>
                    <span className="text-ink-400 tabular-nums">
                      {fmtEur(b.cost_eur)} · {b.messages} msg · {fmtNum(b.tokens)} tok
                    </span>
                  </div>
                  <div className="h-2 bg-ink-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${SERVICE_COLORS[b.service] || 'bg-ink-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time-series (CSS bars) */}
      <div className="border border-ink-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-ink-100 mb-3">Kosten-Verlauf ({days}d)</h3>
        {s.total_cost_eur === 0 ? (
          <p className="text-xs text-ink-500 py-4 text-center">Keine Aktivität in diesem Zeitraum.</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-end gap-px h-32" role="img" aria-label="Kosten pro Tag Balkendiagramm">
              {data.timeseries.map(p => {
                const h = (p.cost_eur / maxBarValue) * 100;
                return (
                  <div
                    key={p.day}
                    className="flex-1 bg-aevum-gold/70 hover:bg-aevum-gold rounded-t min-h-[1px] transition-colors"
                    style={{ height: `${Math.max(h, p.cost_eur > 0 ? 2 : 0)}%` }}
                    title={`${p.day}: ${fmtEur(p.cost_eur)} · ${p.messages} msg`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-ink-500 pt-1">
              <span>{fmtDay(data.timeseries[0]?.day)}</span>
              <span>{fmtDay(data.timeseries[data.timeseries.length - 1]?.day)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  Icon, label, value, sub,
}: { Icon: typeof Activity; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-ink-800 rounded-lg p-3 bg-ink-950/50">
      <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1">
        <Icon size={12} /> {label}
      </div>
      <div className="text-lg font-medium text-ink-100 tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}
