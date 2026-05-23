import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import {
  BarChart2, Zap, Mail, ShoppingBag, Globe, Linkedin,
  CheckCircle2, XCircle, AlertCircle, TrendingUp, Search,
  ChevronRight
} from 'lucide-react';
import { stagger } from '@/lib/animations';

// ── Types ──────────────────────────────────────────────────────────────────

type KPIItem = {
  id: string;
  label: string;
  value: string | null;
  unit: string;
  trend: number | null;
  source: string;
  live: boolean;
};

type Integration = {
  service: string;
  label: string;
  connected: boolean;
  icon: string;
};

type WebsiteIssue = {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  msg: string;
};

type Optimization = {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  action: string;
};

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

type SubTab = 'overview' | 'intelligence' | 'integrations';

// ── Icon map ───────────────────────────────────────────────────────────────

const SVC_ICON: Record<string, React.ReactNode> = {
  meta_ads:   <BarChart2 size={14} className="text-blue-300" />,
  google_ads: <Search size={14} className="text-yellow-300" />,
  klaviyo:    <Mail size={14} className="text-green-300" />,
  shopify:    <ShoppingBag size={14} className="text-emerald-300" />,
  tiktok_ads: <Zap size={14} className="text-pink-300" />,
};

const SEV_COLOR: Record<string, string> = {
  critical: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  high:     'text-orange-300 bg-orange-500/10 border-orange-500/25',
  medium:   'text-yellow-300 bg-yellow-500/10 border-yellow-500/25',
  low:      'text-ink-300 bg-white/5 border-white/10',
};

const PRIO_DOT: Record<string, string> = {
  high:   'bg-rose-400',
  medium: 'bg-yellow-400',
  low:    'bg-ink-400',
};

// ── Sub-tab button ─────────────────────────────────────────────────────────

function SubTabBtn({
  id, active, onClick, icon, children
}: {
  id: SubTab; active: SubTab; onClick: (t: SubTab) => void;
  icon: React.ReactNode; children: React.ReactNode;
}) {
  const isActive = id === active;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition',
        isActive
          ? 'bg-gold-400/15 text-gold-300 border border-gold-400/30'
          : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KPICard({ kpi, delay }: { kpi: KPIItem; delay: number }) {
  const displayValue = kpi.value ?? (kpi.live ? '…' : '—');
  const isConnected = kpi.live;

  return (
    <div
      className="card-premium p-4 animate-fade-up flex flex-col gap-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold">{kpi.label}</span>
        {isConnected ? (
          <span className="flex items-center gap-1 text-[0.6rem] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[0.6rem] text-ink-500">Kein Key</span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={[
          'text-2xl font-bold font-mono tabular-nums leading-none',
          displayValue === '—' ? 'text-ink-500' : 'text-white'
        ].join(' ')}>
          {displayValue}
        </span>
        {displayValue !== '—' && displayValue !== '…' && (
          <span className="text-xs text-ink-400">{kpi.unit}</span>
        )}
      </div>
    </div>
  );
}

// ── Integration Row ────────────────────────────────────────────────────────

function IntegrationRow({ intg, delay }: { intg: Integration; delay: number }) {
  return (
    <div
      className="card-premium p-4 flex items-center gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        {SVC_ICON[intg.service] ?? <Zap size={14} className="text-ink-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{intg.label}</div>
        <div className="text-[0.65rem] text-ink-400 font-mono">{intg.service}</div>
      </div>
      {intg.connected ? (
        <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
          <CheckCircle2 size={14} />
          Verbunden
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-ink-400">
          <XCircle size={14} />
          Ausstehend
        </div>
      )}
    </div>
  );
}

// ── SEO Score Ring ─────────────────────────────────────────────────────────

function SeoRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 88 88" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-xl font-bold font-mono text-white">{score}</div>
        <div className="text-[0.6rem] text-ink-400 uppercase tracking-wider">/ 100</div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CollaGlowDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>('overview');

  useEffect(() => {
    let active = true;
    api<DashboardPayload>('/api/me/projects/collaglow/dashboard')
      .then(d => { if (active) { setData(d); setError(null); } })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Dashboard konnte nicht geladen werden';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="card-premium p-16 flex flex-col items-center justify-center gap-4">
        <Spinner size="md" />
        <div className="text-xs text-ink-400">CollaGlow-Daten werden geladen…</div>
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

  const connectedCount = data.integrations.filter(i => i.connected).length;
  const intel = data.intelligence;
  const highPrioOpts = intel?.optimizations?.filter(o => o.priority === 'high') ?? [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header strip */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
            <ShoppingBag size={18} className="text-gold-300" />
          </div>
          <div>
            <div className="text-xs text-ink-400 font-mono">Kunden-Dashboard</div>
            <div className="text-sm font-semibold text-white">CollaGlow by Ketolabs</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-gold">E-Commerce</span>
          <span className="badge">
            {connectedCount}/{data.integrations.length} APIs verbunden
          </span>
          {intel?.seo_score != null && (
            <span className={[
              'badge',
              intel.seo_score >= 70 ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' :
              intel.seo_score >= 40 ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/25' :
              'text-rose-300 bg-rose-500/10 border-rose-500/25'
            ].join(' ')}>
              SEO {intel.seo_score}/100
            </span>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <SubTabBtn id="overview" active={subTab} onClick={setSubTab} icon={<BarChart2 size={12} />}>Übersicht</SubTabBtn>
        <SubTabBtn id="intelligence" active={subTab} onClick={setSubTab} icon={<Globe size={12} />}>
          Intelligence
          {highPrioOpts.length > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full bg-rose-500/80 text-white text-[0.6rem] font-bold flex items-center justify-center">
              {highPrioOpts.length}
            </span>
          )}
        </SubTabBtn>
        <SubTabBtn id="integrations" active={subTab} onClick={setSubTab} icon={<Zap size={12} />}>Integrationen</SubTabBtn>
      </div>

      {/* ── Tab: Overview ─────────────────────────────────────────────────── */}
      {subTab === 'overview' && (
        <>
          {/* KPI Strip */}
          <section>
            <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp size={12} className="text-gold-300" /> Leistungs-KPIs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.kpis.map((kpi, i) => (
                <KPICard key={kpi.id} kpi={kpi} delay={40 + i * 50} />
              ))}
            </div>
          </section>

          {/* KPI Thresholds */}
          <section className="card-premium p-5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle size={13} className="text-gold-300" /> Zielwerte (Alarm-Schwellen)
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'ROAS Minimum', value: '2.5×', hint: 'Unter diesem Wert → sofortiger Review' },
                { label: 'CPA Maximum', value: '€35', hint: 'Über diesem Wert → Kampagne pausieren' },
                { label: 'Email Open Rate', value: '25%', hint: 'Zielwert für Klaviyo Flows' },
                { label: 'Click-Through Rate', value: '2%', hint: 'Meta-Ads Mindest-CTR' },
              ].map((t, i) => (
                <div key={t.label} className="flex items-start gap-3 animate-fade-up" style={stagger(i, 40, 40)}>
                  <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[0.65rem] font-bold text-gold-300">{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{t.label} <span className="text-gold-300 font-mono ml-1">{t.value}</span></div>
                    <div className="text-[0.7rem] text-ink-400">{t.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-[0.65rem] text-ink-500 flex items-center gap-2 justify-end">
            <TrendingUp size={10} />
            <span>Zuletzt aktualisiert {new Date(data.generated_at).toLocaleTimeString('de-DE')}</span>
          </div>
        </>
      )}

      {/* ── Tab: Intelligence ─────────────────────────────────────────────── */}
      {subTab === 'intelligence' && (
        <>
          {!intel ? (
            <div className="card-premium p-12 text-center space-y-2">
              <Globe size={32} className="mx-auto text-ink-600" />
              <div className="text-sm text-ink-300">Kein Intelligence-Audit vorhanden.</div>
              <div className="text-xs text-ink-500">Wird automatisch beim nächsten API-Trigger gestartet.</div>
            </div>
          ) : (
            <>
              {/* SEO Score + Website Issues */}
              <section className="card-premium p-6">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe size={13} className="text-gold-300" /> Website-Audit
                </h3>
                <div className="flex items-start gap-6 flex-wrap">
                  {intel.seo_score != null && <SeoRing score={intel.seo_score} />}
                  <div className="flex-1 min-w-0 space-y-2">
                    {(intel.website_issues ?? []).length === 0 ? (
                      <div className="text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Keine kritischen Issues gefunden.
                      </div>
                    ) : (
                      intel.website_issues.map((issue, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs animate-fade-up ${SEV_COLOR[issue.severity] ?? SEV_COLOR.low}`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <AlertCircle size={13} className="shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-semibold uppercase text-[0.6rem] tracking-wider opacity-70">{issue.severity} · {issue.type}</span>
                            <div>{issue.msg}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* LinkedIn */}
              {intel.linkedin_data && (
                <section className="card-premium p-5">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Linkedin size={13} className="text-gold-300" /> LinkedIn-Präsenz
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-ink-400 text-[0.65rem]">Profil</div>
                      <div className="text-white font-medium">{intel.linkedin_data.name ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-[0.65rem]">Follower</div>
                      <div className="text-white font-medium">{intel.linkedin_data.followers ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-[0.65rem]">Erreichbar</div>
                      <div className={intel.linkedin_data.reachable ? 'text-emerald-300' : 'text-rose-300'}>
                        {intel.linkedin_data.reachable ? 'Ja' : 'Nein'}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Optimizations */}
              {(intel.optimizations ?? []).length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={13} className="text-gold-300" /> KI-Optimierungsempfehlungen
                    <span className="badge ml-auto">{intel.optimizations.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {intel.optimizations.map((opt, i) => (
                      <div
                        key={i}
                        className="card-premium p-4 flex items-start gap-3 animate-fade-up"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIO_DOT[opt.priority] ?? 'bg-ink-400'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{opt.title}</span>
                            <span className="badge text-[0.6rem]">{opt.category}</span>
                          </div>
                          <div className="text-xs text-ink-400 mt-1">{opt.action}</div>
                        </div>
                        <ChevronRight size={14} className="text-ink-600 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="text-[0.65rem] text-ink-500 text-right">
                Audit erstellt {new Date(intel.generated_at).toLocaleString('de-DE')}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Tab: Integrations ─────────────────────────────────────────────── */}
      {subTab === 'integrations' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={13} className="text-gold-300" /> API-Integrationen
            </h3>
            <div className="text-[0.65rem] text-ink-400">
              API-Keys unter <span className="text-gold-300">API-Keys</span> einreichen
            </div>
          </div>
          <div className="space-y-2">
            {data.integrations.map((intg, i) => (
              <IntegrationRow key={intg.service} intg={intg} delay={40 + i * 50} />
            ))}
          </div>
          <div className="mt-4 card-premium p-4 flex items-start gap-3">
            <AlertCircle size={14} className="text-gold-300 shrink-0 mt-0.5" />
            <div className="text-[0.7rem] text-ink-400 leading-relaxed">
              Verbinde deine Plattformen über den <span className="text-white">API-Keys</span>-Tab.
              Alle Keys werden AES-256-GCM verschlüsselt gespeichert.
              Live-Daten erscheinen automatisch in den KPIs sobald ein Key verbunden ist.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
