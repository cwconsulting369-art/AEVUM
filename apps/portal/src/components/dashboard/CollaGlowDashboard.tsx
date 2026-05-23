import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import {
  CheckCircle2, XCircle, AlertCircle, TrendingUp, Globe,
  Linkedin, Zap, BarChart2, DollarSign, Mail, ShoppingBag, ChevronRight
} from 'lucide-react';
import { stagger } from '@/lib/animations';

// ── Types ────────────────────────────────────────────────────────────────────

type KPIItem = { id: string; label: string; value: string | null; unit: string; trend: number | null; source: string; live: boolean };
type Integration = { service: string; label: string; connected: boolean; icon: string };
type WebsiteIssue = { type: string; severity: 'critical' | 'high' | 'medium' | 'low'; msg: string };
type Optimization = { priority: 'high' | 'medium' | 'low'; category: string; title: string; action: string };
type Intelligence = {
  seo_score: number | null;
  website_issues: WebsiteIssue[];
  linkedin_data: { name?: string; followers?: string; reachable?: boolean } | null;
  optimizations: Optimization[];
  generated_at: string;
};
type DashboardPayload = {
  ok: boolean;
  project: { id: string; slug: string; name: string; industry: string };
  kpis: KPIItem[];
  integrations: Integration[];
  intelligence: Intelligence | null;
  generated_at: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  critical: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  high:     'text-orange-300 bg-orange-500/10 border-orange-500/25',
  medium:   'text-yellow-300 bg-yellow-500/10 border-yellow-500/25',
  low:      'text-ink-300 bg-white/5 border-white/10',
};
const PRIO_DOT: Record<string, string> = { high: 'bg-rose-400', medium: 'bg-yellow-400', low: 'bg-ink-400' };
const SVC_ICON: Record<string, React.ReactNode> = {
  meta_ads:   <BarChart2 size={14} className="text-blue-300" />,
  google_ads: <TrendingUp size={14} className="text-yellow-300" />,
  klaviyo:    <Mail size={14} className="text-green-300" />,
  shopify:    <ShoppingBag size={14} className="text-emerald-300" />,
  tiktok_ads: <Zap size={14} className="text-pink-300" />,
};

function fmtVal(kpi: KPIItem) {
  if (!kpi.live) return '—';
  if (kpi.value === null) return '…';
  return kpi.value;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ kpi, delay }: { kpi: KPIItem; delay: number }) {
  const val = fmtVal(kpi);
  return (
    <div className="card-premium p-5 animate-fade-up flex flex-col gap-3" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold">{kpi.label}</span>
        {kpi.live
          ? <span className="flex items-center gap-1 text-[0.6rem] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>
          : <span className="text-[0.6rem] text-ink-600">Kein Key</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-mono tabular-nums leading-none ${val === '—' ? 'text-ink-600' : 'text-white'}`}>{val}</span>
        {val !== '—' && val !== '…' && <span className="text-xs text-ink-400">{kpi.unit}</span>}
      </div>
    </div>
  );
}

// ── SEO Ring ─────────────────────────────────────────────────────────────────

function SeoRing({ score }: { score: number }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 88 88" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="relative text-center">
        <div className="text-xl font-bold font-mono text-white">{score}</div>
        <div className="text-[0.6rem] text-ink-400 uppercase tracking-wider">/ 100</div>
      </div>
    </div>
  );
}

// ── Section: Overview ─────────────────────────────────────────────────────────

function SectionOverview({ data }: { data: DashboardPayload }) {
  const connectedCount = data.integrations.filter(i => i.connected).length;
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">CollaGlow</h1>
          <div className="flex items-center gap-2">
            <span className="badge badge-gold">E-Commerce</span>
            <span className={`badge ${connectedCount > 0 ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : ''}`}>
              {connectedCount}/{data.integrations.length} Integrationen
            </span>
          </div>
        </div>
        <p className="text-sm text-ink-400">Retainer-Light · Ketolabs GmbH</p>
      </div>

      {/* KPI Strip */}
      <section>
        <div className="text-[0.65rem] uppercase tracking-widest text-ink-500 font-semibold mb-3">Performance-KPIs</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.kpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
        </div>
      </section>

      {/* Targets */}
      <section className="card-premium p-6">
        <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Zielwerte</div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'ROAS Minimum', value: '2.5×', desc: 'Unter diesem Wert → sofortiger Review' },
            { label: 'CPA Maximum', value: '€35', desc: 'Über diesem Wert → Kampagne pausieren' },
            { label: 'Email Open Rate', value: '25%', desc: 'Klaviyo Flow Ziel' },
            { label: 'CTR Meta', value: '2%', desc: 'Mindest Click-Through-Rate' },
          ].map((t, i) => (
            <div key={t.label} className="flex items-start gap-3 animate-fade-up" style={stagger(i, 40, 40)}>
              <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[0.65rem] font-bold text-gold-300">{i + 1}</span>
              </div>
              <div>
                <div className="text-sm text-white font-medium">{t.label} <span className="text-gold-300 font-mono ml-1">{t.value}</span></div>
                <div className="text-[0.7rem] text-ink-400">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-[0.65rem] text-ink-600 text-right">
        Stand {new Date(data.generated_at).toLocaleTimeString('de-DE')}
      </div>
    </div>
  );
}

// ── Section: Ads ─────────────────────────────────────────────────────────────

function SectionAds({ data }: { data: DashboardPayload }) {
  const meta = data.integrations.find(i => i.service === 'meta_ads');
  const google = data.integrations.find(i => i.service === 'google_ads');
  const metaKpis = data.kpis.filter(k => k.source === 'meta_ads');
  const googleKpis = data.kpis.filter(k => k.source === 'google_ads');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Ads</h1>
        <p className="text-sm text-ink-400">Meta Ads & Google Ads Performance</p>
      </div>

      {/* Meta Ads */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <BarChart2 size={16} className="text-blue-300" />
          <span className="text-sm font-semibold text-white">Meta Ads</span>
          <span className={`badge text-[0.65rem] ml-auto ${meta?.connected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-ink-400'}`}>
            {meta?.connected ? <><CheckCircle2 size={10} /> Verbunden</> : <><XCircle size={10} /> Ausstehend</>}
          </span>
        </div>
        {metaKpis.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {metaKpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
          </div>
        ) : (
          <ConnectPrompt service="meta_ads" label="Meta Ads" />
        )}
      </section>

      {/* Google Ads */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={16} className="text-yellow-300" />
          <span className="text-sm font-semibold text-white">Google Ads</span>
          <span className={`badge text-[0.65rem] ml-auto ${google?.connected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-ink-400'}`}>
            {google?.connected ? <><CheckCircle2 size={10} /> Verbunden</> : <><XCircle size={10} /> Ausstehend</>}
          </span>
        </div>
        {googleKpis.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {googleKpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
          </div>
        ) : (
          <ConnectPrompt service="google_ads" label="Google Ads" />
        )}
      </section>
    </div>
  );
}

// ── Section: Spend ────────────────────────────────────────────────────────────

function SectionSpend({ data }: { data: DashboardPayload }) {
  const metaKpis = data.kpis.filter(k => k.source === 'meta_ads');
  const googleKpis = data.kpis.filter(k => k.source === 'google_ads');
  const anyConnected = data.integrations.some(i => (i.service === 'meta_ads' || i.service === 'google_ads') && i.connected);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Spend</h1>
        <p className="text-sm text-ink-400">Budget & ROAS-Tracking über alle Kanäle</p>
      </div>

      <section>
        <div className="text-[0.65rem] uppercase tracking-widest text-ink-500 font-semibold mb-3">Alle Ad-KPIs</div>
        {anyConnected ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...metaKpis, ...googleKpis].map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
          </div>
        ) : (
          <div className="card-premium p-10 text-center space-y-3">
            <DollarSign size={32} className="mx-auto text-ink-600" />
            <div className="text-sm text-ink-300">Keine Ad-Plattform verbunden.</div>
            <div className="text-xs text-ink-500">Verbinde Meta Ads oder Google Ads unter API-Keys.</div>
          </div>
        )}
      </section>

      {/* Thresholds */}
      <section className="card-premium p-6">
        <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">ROAS-Alarm-Schwellen</div>
        <div className="space-y-3">
          {[
            { label: 'ROAS < 2.5', action: 'Kampagne sofort reviewen', sev: 'critical' },
            { label: 'ROAS 2.5–3.5', action: 'Optimierungspotenzial analysieren', sev: 'medium' },
            { label: 'ROAS > 3.5', action: 'Budget skalieren', sev: 'ok' },
          ].map((r, i) => (
            <div key={r.label} className="flex items-center gap-3 text-sm animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${r.sev === 'critical' ? 'bg-rose-400' : r.sev === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
              <span className="font-mono text-white text-xs w-28">{r.label}</span>
              <span className="text-ink-400 text-xs">{r.action}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Section: Email ────────────────────────────────────────────────────────────

function SectionEmail({ data }: { data: DashboardPayload }) {
  const klaviyo = data.integrations.find(i => i.service === 'klaviyo');
  const kpis = data.kpis.filter(k => k.source === 'klaviyo');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">E-Mail</h1>
        <p className="text-sm text-ink-400">Klaviyo — Flows, Campaigns, Open Rates</p>
      </div>
      <div className="flex items-center gap-3">
        <Mail size={16} className="text-green-300" />
        <span className="text-sm font-semibold text-white">Klaviyo</span>
        <span className={`badge text-[0.65rem] ml-auto ${klaviyo?.connected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-ink-400'}`}>
          {klaviyo?.connected ? <><CheckCircle2 size={10} /> Verbunden</> : <><XCircle size={10} /> Ausstehend</>}
        </span>
      </div>
      {kpis.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
        </div>
      ) : (
        <ConnectPrompt service="klaviyo" label="Klaviyo" />
      )}
      <section className="card-premium p-6">
        <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Zielwerte E-Mail</div>
        <div className="space-y-3 text-sm">
          {[
            { metric: 'Open Rate', target: '≥ 25%', hint: 'Klaviyo-Flows + Segmentierung' },
            { metric: 'Click Rate', target: '≥ 3%', hint: 'CTA-Klarheit + personalisierter Content' },
            { metric: 'Unsubscribe Rate', target: '< 0.3%', hint: 'List-Health-Indikator' },
          ].map((r, i) => (
            <div key={r.metric} className="flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-ink-400 w-32 text-xs shrink-0">{r.metric}</span>
              <span className="font-mono text-gold-300 text-xs w-16">{r.target}</span>
              <span className="text-ink-500 text-xs">{r.hint}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Section: Shop ─────────────────────────────────────────────────────────────

function SectionShop({ data }: { data: DashboardPayload }) {
  const shopify = data.integrations.find(i => i.service === 'shopify');
  const kpis = data.kpis.filter(k => k.source === 'shopify');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Shop</h1>
        <p className="text-sm text-ink-400">Shopify — Revenue, AOV, Conversion</p>
      </div>
      <div className="flex items-center gap-3">
        <ShoppingBag size={16} className="text-emerald-300" />
        <span className="text-sm font-semibold text-white">Shopify</span>
        <span className={`badge text-[0.65rem] ml-auto ${shopify?.connected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-ink-400'}`}>
          {shopify?.connected ? <><CheckCircle2 size={10} /> Verbunden</> : <><XCircle size={10} /> Ausstehend</>}
        </span>
      </div>
      {kpis.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />)}
        </div>
      ) : (
        <ConnectPrompt service="shopify" label="Shopify" />
      )}
    </div>
  );
}

// ── Section: Intelligence ─────────────────────────────────────────────────────

function SectionIntelligence({ data }: { data: DashboardPayload }) {
  const intel = data.intelligence;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence</h1>
        <p className="text-sm text-ink-400">Automatischer Unternehmens-Audit — SEO, Website, LinkedIn</p>
      </div>

      {!intel ? (
        <div className="card-premium p-12 text-center space-y-2">
          <Globe size={32} className="mx-auto text-ink-600" />
          <div className="text-sm text-ink-300">Kein Audit vorhanden.</div>
        </div>
      ) : (
        <>
          <section className="card-premium p-6">
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Globe size={13} className="text-gold-300" /> Website-Audit
            </div>
            <div className="flex items-start gap-6 flex-wrap">
              {intel.seo_score != null && <SeoRing score={intel.seo_score} />}
              <div className="flex-1 min-w-0 space-y-2">
                {(intel.website_issues ?? []).length === 0 ? (
                  <div className="text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 size={13} /> Keine kritischen Issues.</div>
                ) : intel.website_issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs animate-fade-up ${SEV_COLOR[issue.severity] ?? SEV_COLOR.low}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold uppercase text-[0.6rem] tracking-wider opacity-70">{issue.severity} · {issue.type}</span>
                      <div>{issue.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {intel.linkedin_data && (
            <section className="card-premium p-5">
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Linkedin size={13} className="text-gold-300" /> LinkedIn
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div><div className="text-[0.65rem] text-ink-400">Profil</div><div className="text-white font-medium">{intel.linkedin_data.name ?? '—'}</div></div>
                <div><div className="text-[0.65rem] text-ink-400">Follower</div><div className="text-white font-medium">{intel.linkedin_data.followers ?? '—'}</div></div>
                <div><div className="text-[0.65rem] text-ink-400">Erreichbar</div><div className={intel.linkedin_data.reachable ? 'text-emerald-300' : 'text-rose-300'}>{intel.linkedin_data.reachable ? 'Ja' : 'Nein'}</div></div>
              </div>
            </section>
          )}

          {(intel.optimizations ?? []).length > 0 && (
            <section>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap size={13} className="text-gold-300" /> KI-Empfehlungen
                <span className="badge ml-auto">{intel.optimizations.length}</span>
              </div>
              <div className="space-y-2">
                {intel.optimizations.map((opt, i) => (
                  <div key={i} className="card-premium p-4 flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIO_DOT[opt.priority] ?? 'bg-ink-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{opt.title}</span>
                        <span className="badge text-[0.6rem]">{opt.category}</span>
                      </div>
                      <div className="text-xs text-ink-400 mt-1">{opt.action}</div>
                    </div>
                    <ChevronRight size={13} className="text-ink-600 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="text-[0.65rem] text-ink-600 text-right">Audit: {new Date(intel.generated_at).toLocaleString('de-DE')}</div>
        </>
      )}
    </div>
  );
}

// ── Connect Prompt ────────────────────────────────────────────────────────────

function ConnectPrompt({ service, label }: { service: string; label: string }) {
  return (
    <div className="card-premium p-10 text-center space-y-3">
      <div className="mx-auto w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        {SVC_ICON[service] ?? <Zap size={18} className="text-ink-400" />}
      </div>
      <div className="text-sm text-ink-300 font-medium">{label} nicht verbunden</div>
      <div className="text-xs text-ink-500">API-Key unter <span className="text-gold-300">API-Keys</span> einreichen um Live-Daten zu sehen.</div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function CollaGlowDashboard({ section = 'overview' }: { section?: string }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api<DashboardPayload>('/api/me/projects/collaglow/dashboard')
      .then(d => { if (active) { setData(d); setError(null); } })
      .catch((e: unknown) => { if (active) { const m = e instanceof Error ? e.message : 'Fehler'; setError(m); toast.error(m); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="card-premium p-16 flex flex-col items-center gap-3"><Spinner size="md" /><div className="text-xs text-ink-400">Lade Dashboard…</div></div>;
  }
  if (error || !data) {
    return <div className="card-premium p-10 text-center text-sm text-rose-300">{error || 'Keine Daten.'}</div>;
  }

  switch (section) {
    case 'ads':          return <SectionAds data={data} />;
    case 'spend':        return <SectionSpend data={data} />;
    case 'email':        return <SectionEmail data={data} />;
    case 'shop':         return <SectionShop data={data} />;
    case 'intelligence': return <SectionIntelligence data={data} />;
    default:             return <SectionOverview data={data} />;
  }
}
