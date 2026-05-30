// SaaS-Dashboard — fuer SaaS-Tool-Nutzer (account_type='saas', has_agent_access=false).
// Wave C3: "Verfuegbar"-Sektion live mit Script-Factory + DSGVO-Factory.
// Recent-Runs aggregated von beiden Factory-APIs.

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Link } from 'react-router';
import {
  Sparkles, Coins, Zap, Film, Shield, Users, FileText,
  ArrowRight, Wrench, Clock, CheckCircle2, AlertCircle, Loader2,
  Download, ExternalLink
} from 'lucide-react';
import { stagger } from '@/lib/animations';
import Spinner from '@/components/Spinner';

interface CreditsSnapshot {
  balance: number;
  lifetime_earned: number;
}

type LiveStatus = 'live' | 'live_partial' | 'in_bau' | 'geplant' | 'konzept';

interface FactorySlot {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  status: LiveStatus;
  badge: string;
  credits?: number;
  href?: string;
}

const AVAILABLE: FactorySlot[] = [
  {
    key: 'script',
    title: 'Script-Factory',
    desc: 'E-Commerce Ad-Scripts pro Run — Meta, TikTok, YouTube. Brand-Profile, Hook-Library, mehrere Varianten.',
    icon: Film,
    status: 'live',
    badge: 'Live',
    credits: 40,
    href: '/tools/script-factory'
  },
  {
    key: 'dsgvo',
    title: 'DSGVO-Factory',
    desc: 'Auftragsverarbeitungs-Vertrag (AVV) aus Template — weitere Templates (DSE, Impressum, AGB) folgen.',
    icon: Shield,
    status: 'live_partial',
    badge: 'Live · AVV',
    credits: 25,
    href: '/tools/dsgvo-factory'
  },
  {
    key: 'lead-scraper',
    title: 'Lead-Scraper-Factory',
    desc: 'CSV-Upload → AEVUM-Brandtone-Pitches → Versand via audit@aevum-system.de. 3 Varianten pro Lead.',
    icon: Users,
    status: 'live',
    badge: 'MVP · Phase 1',
    credits: 12,
    href: '/tools/lead-scraper'
  }
];

const COMING_SOON: FactorySlot[] = [
  {
    key: 'lead',
    title: 'Lead-Factory (Phase 2)',
    desc: 'Auto-Scraping + Enrichment + Trigger-Detection. Ergaenzt Lead-Scraper Phase 1.',
    icon: Users,
    status: 'konzept',
    badge: 'Konzept',
    credits: 50
  },
  {
    key: 'content',
    title: 'Content-Factory SaaS',
    desc: 'Self-Service Content-Pipeline für Posts, Newsletter, Blog-Drafts in deiner Brand-Stimme.',
    icon: FileText,
    status: 'konzept',
    badge: 'Konzept',
    credits: 30
  }
];

// ── Run-History types ─────────────────────────────────────────
interface FactoryRun {
  id: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  credits_spent?: number | null;
  created_at: string;
  output_url?: string | null;
  pdf_url?: string | null;
  template_type?: string | null;
  brand_name?: string | null;
  product_name?: string | null;
  _type: 'script' | 'dsgvo';
}

export default function SaaSDashboard() {
  const { me } = useAuth();
  const [credits, setCredits] = useState<CreditsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api<{ ok: boolean; credits: CreditsSnapshot }>('/api/me/credits')
      .then(r => setCredits(r.credits ?? { balance: 0, lifetime_earned: 0 }))
      .catch(() => setCredits({ balance: 0, lifetime_earned: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  if (!me) return null;
  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  return (
    <div className="dashboard-stack @container">
      {/* Hero — compact */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> AEVUM SaaS-Tools
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {me.account.name || 'Operator'}
        </h1>
        <p className="text-ink-400 mt-1 text-sm">
          Self-Service-Tools, die du auf Credit-Basis nutzen kannst.
        </p>
      </header>

      {/* Credit-Balance — kompakt oben */}
      <CreditsBalanceCard credits={credits} />

      {/* Verfuegbar + Coming Soon — auf 2xl in 1 Row fuer Viewport-Fit */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-[var(--dashboard-section-gap)]">
        <section className="animate-fade-up" style={{ animationDelay: '180ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Verfügbar</h2>
              <p className="text-xs text-ink-400 mt-0.5">Tools, die du jetzt direkt nutzen kannst.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)]">
            {AVAILABLE.map((slot, i) => (
              <FactoryCard key={slot.key} slot={slot} i={i} />
            ))}
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: '260ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Coming Soon</h2>
              <p className="text-xs text-ink-400 mt-0.5">Factory-Slots in Planung & Konzept.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)]">
            {COMING_SOON.map((slot, i) => (
              <FactoryCard
                key={slot.key}
                slot={slot}
                i={i}
                onClick={() => showToast(`${slot.title} — bald verfügbar`)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Recent Runs */}
      <section className="animate-fade-up" style={{ animationDelay: '340ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Runs</h2>
            <p className="text-xs text-ink-400 mt-0.5">Letzte 20 Factory-Läufe, aggregiert über alle Tools.</p>
          </div>
        </div>
        <RunHistoryTable />
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="card-premium px-5 py-3 text-sm text-ink-100 flex items-center gap-2">
            <Clock size={14} className="text-gold-300" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────────

function CreditsBalanceCard({ credits }: { credits: CreditsSnapshot | null }) {
  return (
    <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
      <div className="card-premium card-pad">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
              <Coins size={20} className="text-gold-300" />
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-400/70 mb-1">Dein Credit-Konto</div>
              <div className="text-2xl xl:text-3xl font-bold text-gold-gradient tabular-nums leading-none">
                {(credits?.balance ?? 0).toLocaleString('de-DE')} <span className="text-base font-medium text-ink-400">Credits</span>
              </div>
              <div className="text-xs text-ink-400 mt-1">
                Gesamt verdient: {(credits?.lifetime_earned ?? 0).toLocaleString('de-DE')}
              </div>
            </div>
          </div>
          <Link to="/credits" className="btn-gold py-2 px-4 text-xs inline-flex items-center gap-2">
            Credits verwalten <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FactoryCard({
  slot, i, onClick
}: { slot: FactorySlot; i: number; onClick?: () => void }) {
  const Icon = slot.icon;
  const isLive = slot.status === 'live' || slot.status === 'live_partial';
  const badgeStyle: Record<LiveStatus, string> = {
    live: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-200',
    live_partial: 'bg-gold-400/15 border-gold-400/30 text-gold-200',
    in_bau: 'bg-gold-400/15 border-gold-400/30 text-gold-200',
    geplant: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-200',
    konzept: 'bg-white/[0.04] border-white/10 text-ink-300'
  };

  const inner = (
    <>
      <div className="absolute top-3 right-3">
        <span className={`text-[0.55rem] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${badgeStyle[slot.status]}`}>
          {slot.badge}
        </span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center mb-4">
        <Icon size={18} className="text-gold-300" strokeWidth={1.6} />
      </div>
      <div className="text-base font-semibold text-white mb-1.5">{slot.title}</div>
      <div className="text-[0.72rem] text-ink-400 leading-relaxed pr-20">{slot.desc}</div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[0.65rem] text-ink-500 inline-flex items-center gap-1">
          <Zap size={11} className={isLive ? 'text-gold-300' : ''} />
          {slot.credits != null ? `${slot.credits} Credits / Run` : 'Self-Service-SaaS'}
        </span>
        <ArrowRight size={12} className="text-ink-500 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all" />
      </div>
    </>
  );

  const baseCls = 'text-left card-premium p-5 group transition animate-fade-up relative overflow-hidden block';
  const liveCls = 'hover:border-gold-400/40';
  const dimCls = 'opacity-60 hover:opacity-80';
  const style: React.CSSProperties = {
    ...stagger(i, 60, 60),
    ...(isLive ? {} : { borderStyle: 'dashed' })
  };

  if (isLive && slot.href) {
    return (
      <Link to={slot.href} className={`${baseCls} ${liveCls}`} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${baseCls} ${dimCls}`} style={style}>
      {inner}
    </button>
  );
}

function RunHistoryTable() {
  const [runs, setRuns] = useState<FactoryRun[] | null>(null);

  useEffect(() => {
    Promise.all([
      api<{ ok: boolean; runs: FactoryRun[] }>('/api/factories/script/runs').catch(() => ({ ok: false, runs: [] as FactoryRun[] })),
      api<{ ok: boolean; runs: FactoryRun[] }>('/api/factories/dsgvo/runs').catch(() => ({ ok: false, runs: [] as FactoryRun[] }))
    ]).then(([s, d]) => {
      const sruns = (s.runs || []).map(r => ({ ...r, _type: 'script' as const }));
      const druns = (d.runs || []).map(r => ({ ...r, _type: 'dsgvo' as const }));
      const all = [...sruns, ...druns]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
      setRuns(all);
    });
  }, []);

  if (runs === null) {
    return (
      <div className="card-premium p-8 flex justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="card-premium p-8 text-center">
        <Wrench size={24} className="mx-auto mb-3 text-ink-500" strokeWidth={1.5} />
        <div className="text-sm text-ink-300 mb-1">Noch keine Runs.</div>
        <div className="text-[0.7rem] text-ink-500">
          Sobald du eine Factory startest, erscheinen die Läufe hier.
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium divide-y divide-white/5">
      <div className="hidden sm:grid grid-cols-12 gap-3 px-4 sm:px-5 py-2 text-[0.6rem] uppercase tracking-wider text-ink-500 font-semibold">
        <div className="col-span-3">Datum</div>
        <div className="col-span-2">Tool</div>
        <div className="col-span-3">Detail</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Credits</div>
        <div className="col-span-1 text-right">Output</div>
      </div>
      {runs.map(r => <RunRow key={`${r._type}-${r.id}`} run={r} />)}
    </div>
  );
}

function RunRow({ run }: { run: FactoryRun }) {
  const date = new Date(run.created_at).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  const tool = run._type === 'script' ? 'Script' : 'DSGVO';
  const detail = run._type === 'script'
    ? (run.product_name || run.brand_name || '—')
    : (run.template_type?.toUpperCase() || '—');
  const out = run.pdf_url || run.output_url;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-4 sm:px-5 py-3 text-sm items-center">
      <div className="sm:col-span-3 text-ink-300 text-[0.75rem] tabular-nums">{date}</div>
      <div className="sm:col-span-2">
        <span className="text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-ink-200">
          {tool}
        </span>
      </div>
      <div className="sm:col-span-3 text-ink-200 truncate">{detail}</div>
      <div className="sm:col-span-2"><StatusBadge status={run.status} /></div>
      <div className="sm:col-span-1 text-right text-[0.75rem] text-gold-300 tabular-nums">
        {run.credits_spent ? `-${run.credits_spent}` : '—'}
      </div>
      <div className="sm:col-span-1 text-right">
        {run.status === 'complete' && out ? (
          <a href={out} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.7rem] text-gold-300 hover:text-gold-200">
            {run._type === 'dsgvo' ? <Download size={12} /> : <ExternalLink size={12} />}
            Open
          </a>
        ) : (
          <span className="text-[0.7rem] text-ink-500">—</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: FactoryRun['status'] }) {
  const map = {
    pending:  { icon: Clock,        cls: 'bg-white/5 border-white/10 text-ink-300', label: 'Pending' },
    running:  { icon: Loader2,      cls: 'bg-gold-400/10 border-gold-400/30 text-gold-200', label: 'Läuft' },
    complete: { icon: CheckCircle2, cls: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-200', label: 'Fertig' },
    failed:   { icon: AlertCircle,  cls: 'bg-rose-400/10 border-rose-400/30 text-rose-200', label: 'Fehler' }
  } as const;
  const m = map[status] || map.pending;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${m.cls}`}>
      <Icon size={10} className={status === 'running' ? 'animate-spin' : ''} />
      {m.label}
    </span>
  );
}
