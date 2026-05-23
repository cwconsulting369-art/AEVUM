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
type CopyQuickWin     = { fix: string; example?: string; impact: 'high' | 'medium' | 'low' };
type CopyRewrite      = { element: string; current: string; improved: string };
type CopyAnalysis = {
  headline_score?: number; cta_score?: number; clarity_score?: number;
  value_prop_score?: number; overall_copy_score?: number;
  headline_verdict?: string; cta_verdict?: string; value_prop_verdict?: string;
  tone?: string; target_audience_match?: string;
  quick_wins?: CopyQuickWin[];
  rewrite_suggestions?: CopyRewrite[];
};
type WorkflowOpp = { title: string; category: string; description: string; ai_component?: string; effort: string; impact: string; revenue_potential?: string };
type WorkflowAnalysis = {
  workflow_score?: number;
  pain_points?: Array<{ area: string; problem: string; severity: string }>;
  automation_opportunities?: WorkflowOpp[];
  quick_wins?: Array<{ action: string; tool?: string; timeline?: string }>;
  missing_integrations?: string[];
};
type SpeedData = {
  score?: number; responseMs?: number; scriptCount?: number;
  styleCount?: number; imgCount?: number; imgNoAlt?: number;
  issues?: WebsiteIssue[];
};
type FullReport = {
  executive_summary?: string; overall_score?: number;
  top_priorities?: Array<{ rank: number; category: string; action: string; impact: string; effort: string; revenue_impact?: string }>;
  quick_wins_this_week?: string[];
  estimated_revenue_impact?: string;
  aevum_fit?: string;
};
type Intelligence = {
  seo_score: number | null;
  website_issues: WebsiteIssue[];
  linkedin_data: { name?: string; followers?: string; reachable?: boolean } | null;
  optimizations: Optimization[];
  copy_analysis: CopyAnalysis | null;
  workflow_analysis: WorkflowAnalysis | null;
  speed_data: SpeedData | null;
  full_report: FullReport | null;
  audit_summary: string | null;
  status: string;
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

// ── Section: Intelligence (Full Audit) ───────────────────────────────────────

function ScoreRing({ score, label, size = 72 }: { score: number; label: string; size?: number }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171';
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{score}</text>
      </svg>
      <span className="text-[0.6rem] text-ink-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

const EFFORT_COLOR: Record<string, string> = { low: 'text-emerald-300', medium: 'text-yellow-300', high: 'text-rose-300' };
const IMPACT_COLOR: Record<string, string> = { high: 'text-emerald-300', medium: 'text-yellow-300', low: 'text-ink-400' };
const CAT_LABELS: Record<string, string> = {
  seo: 'SEO', copy: 'Copy', speed: 'Speed', workflow: 'Workflow',
  marketing: 'Marketing', sales: 'Sales', ops: 'Ops',
  customer_service: 'Support', data: 'Data', content: 'Content'
};

function SectionIntelligence({ data }: { data: DashboardPayload }) {
  const intel = data.intelligence;

  if (!intel || intel.status === 'running') {
    return (
      <div className="card-premium p-16 text-center space-y-3">
        <Globe size={32} className="mx-auto text-ink-600 animate-pulse" />
        <div className="text-sm text-ink-300">{intel?.status === 'running' ? 'Audit läuft…' : 'Kein Audit vorhanden.'}</div>
        {intel?.status === 'running' && <div className="text-xs text-ink-500">Wird im Hintergrund analysiert — in 1-2 Min fertig.</div>}
      </div>
    );
  }

  const fr  = intel.full_report;
  const seo = intel.seo_score;
  const spd = intel.speed_data?.score;
  const cpy = intel.copy_analysis?.overall_copy_score;
  const wfl = intel.workflow_analysis?.workflow_score;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Executive Summary */}
      {fr?.executive_summary && (
        <div className="card-premium p-6 border-l-2 border-gold-400/50">
          <div className="text-xs font-semibold text-gold-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap size={12} /> Executive Summary
            {fr.overall_score != null && <span className="ml-auto badge badge-gold">{fr.overall_score}/100</span>}
          </div>
          <p className="text-sm text-ink-200 leading-relaxed">{fr.executive_summary}</p>
          {fr.estimated_revenue_impact && (
            <div className="mt-3 text-xs text-emerald-300 flex items-center gap-1.5">
              <TrendingUp size={11} /> {fr.estimated_revenue_impact}
            </div>
          )}
        </div>
      )}

      {/* Score Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'SEO', score: seo ?? 0 },
          { label: 'Speed', score: spd ?? 0 },
          { label: 'Copy', score: cpy ?? 0 },
          { label: 'Workflow', score: wfl ?? 0 },
        ].map(({ label, score }) => (
          <div key={label} className="card-premium p-5 flex flex-col items-center gap-2">
            <ScoreRing score={score} label={label} />
          </div>
        ))}
      </div>

      {/* Top Priorities */}
      {fr?.top_priorities && fr.top_priorities.length > 0 && (
        <section>
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap size={12} className="text-gold-300" /> Top-Prioritäten
          </div>
          <div className="space-y-2">
            {fr.top_priorities.map((p, i) => (
              <div key={i} className="card-premium p-4 flex items-start gap-4 animate-fade-up" style={stagger(i, 40, 40)}>
                <div className="w-7 h-7 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[0.7rem] font-bold text-gold-300 shrink-0">{p.rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{p.action}</span>
                    <span className="badge text-[0.6rem]">{CAT_LABELS[p.category] ?? p.category}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[0.65rem]">
                    <span className={IMPACT_COLOR[p.impact] ?? 'text-ink-400'}>Impact: {p.impact}</span>
                    <span className={EFFORT_COLOR[p.effort] ?? 'text-ink-400'}>Aufwand: {p.effort}</span>
                    {p.revenue_impact && <span className="text-emerald-300">{p.revenue_impact}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Wins this Week */}
      {fr?.quick_wins_this_week && fr.quick_wins_this_week.length > 0 && (
        <section className="card-premium p-5">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" /> Diese Woche umsetzbar
          </div>
          <ul className="space-y-2">
            {fr.quick_wins_this_week.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-200">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SEO Details */}
      <section className="card-premium p-6">
        <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Globe size={12} className="text-gold-300" /> SEO + Website
          {seo != null && <span className="badge ml-auto">{seo}/100</span>}
        </div>
        <div className="space-y-2">
          {(intel.website_issues ?? []).length === 0
            ? <div className="text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 size={13} /> Keine Issues gefunden.</div>
            : intel.website_issues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${SEV_COLOR[issue.severity] ?? SEV_COLOR.low}`}>
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold uppercase text-[0.6rem] tracking-wider opacity-70">{issue.severity} · {issue.type}</span>
                    <div>{issue.msg}</div>
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* Copy Analysis */}
      {intel.copy_analysis && (
        <section className="card-premium p-6">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Zap size={12} className="text-gold-300" /> Copy & Wording
            {cpy != null && <span className="badge ml-auto">{cpy}/100</span>}
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {[
              { l: 'Headline', v: intel.copy_analysis.headline_score },
              { l: 'CTA',      v: intel.copy_analysis.cta_score },
              { l: 'Clarity',  v: intel.copy_analysis.clarity_score },
            ].map(({ l, v }) => (
              <div key={l} className="text-center">
                <ScoreRing score={v ?? 0} label={l} size={60} />
              </div>
            ))}
          </div>
          {intel.copy_analysis.headline_verdict && (
            <div className="text-xs text-ink-300 mb-2"><span className="text-ink-500">Headline: </span>{intel.copy_analysis.headline_verdict}</div>
          )}
          {intel.copy_analysis.cta_verdict && (
            <div className="text-xs text-ink-300 mb-4"><span className="text-ink-500">CTA: </span>{intel.copy_analysis.cta_verdict}</div>
          )}
          {(intel.copy_analysis.rewrite_suggestions ?? []).length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="text-[0.65rem] font-semibold text-ink-500 uppercase tracking-wider">Rewrite-Vorschläge</div>
              {intel.copy_analysis.rewrite_suggestions!.slice(0, 4).map((r, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
                    <div className="text-[0.6rem] text-ink-500 mb-1">{r.element} — Aktuell</div>
                    <div className="text-ink-300">{r.current}</div>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <div className="text-[0.6rem] text-ink-500 mb-1">Verbessert</div>
                    <div className="text-emerald-200">{r.improved}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Workflow Analysis */}
      {intel.workflow_analysis && (
        <section className="card-premium p-6">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <TrendingUp size={12} className="text-gold-300" /> Workflow & AI-Automationen
            {wfl != null && <span className="badge ml-auto">{wfl}/100</span>}
          </div>
          {(intel.workflow_analysis.automation_opportunities ?? []).length > 0 && (
            <div className="space-y-3">
              {intel.workflow_analysis.automation_opportunities!.map((opp, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 animate-fade-up" style={stagger(i, 40, 60)}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-medium text-sm text-white">{opp.title}</div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[0.6rem] font-semibold ${IMPACT_COLOR[opp.impact] ?? 'text-ink-400'}`}>Impact: {opp.impact}</span>
                      <span className="text-ink-600">·</span>
                      <span className={`text-[0.6rem] font-semibold ${EFFORT_COLOR[opp.effort] ?? 'text-ink-400'}`}>Aufwand: {opp.effort}</span>
                    </div>
                  </div>
                  <div className="text-xs text-ink-400 mb-2">{opp.description}</div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="badge text-[0.6rem]">{CAT_LABELS[opp.category] ?? opp.category}</span>
                    {opp.ai_component && <span className="text-[0.6rem] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{opp.ai_component}</span>}
                    {opp.revenue_potential && <span className="text-[0.6rem] text-emerald-300">{opp.revenue_potential}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {intel.workflow_analysis.missing_integrations && intel.workflow_analysis.missing_integrations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-[0.65rem] text-ink-500 mb-2">Empfohlene Integrationen</div>
              <div className="flex flex-wrap gap-2">
                {intel.workflow_analysis.missing_integrations.map(t => (
                  <span key={t} className="badge">{t}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* AEVUM Fit */}
      {fr?.aevum_fit && (
        <div className="card-premium p-5 border border-gold-400/20 bg-gold-400/5">
          <div className="text-xs font-semibold text-gold-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap size={12} /> Was AEVUM konkret tut
          </div>
          <p className="text-sm text-ink-200">{fr.aevum_fit}</p>
        </div>
      )}

      <div className="text-[0.65rem] text-ink-600 text-right">
        Audit v2 · {new Date(intel.generated_at).toLocaleString('de-DE')}
      </div>
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
