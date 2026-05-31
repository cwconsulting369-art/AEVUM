// Lead-Funnel Dashboard — Patrick monitoring view
// 5 Sektionen: Metrics · Leads · Spend · Content · Referrals
// Data: /api/me/projects/:slug/lead-funnel (aggregated endpoint)

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, TrendingUp, Users, DollarSign, FileText, Gift,
  ChevronRight, Sparkles, Award, AlertCircle, ExternalLink,
  Mail, Phone, Send, Upload, Check, X, Edit3,
  Target, Link2, Plug, Trash2, Plus, Linkedin, Facebook
} from 'lucide-react';
import { api, getAccessToken } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { stagger } from '@/lib/animations';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { BarChart, DonutChart } from '@tremor/react';

type Tab = 'metrics' | 'leads' | 'akquise' | 'spend' | 'content' | 'channels' | 'audience' | 'referrals';

type Metrics = {
  leads_total: number;
  leads_30d: number;
  leads_7d: number;
  by_tier: Record<string, number>;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  target_leads_per_month: string;
  target_a_leads_per_month: string;
  target_cpl_max_eur: number;
  target_ssi_min: number;
  target_newsletter_subs: number;
  target_conversations_per_week: number;
};

type Lead = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  lead_tier: string | null;
  score_total: number | null;
  status: string;
  source: string | null;
  source_detail: string | null;
  created_at: string;
  referral_code: string | null;
  notes: string | null;
};

type ReferralProgram = {
  id: string;
  name: string;
  slug: string;
  status: string;
  referrer_reward_description: string;
  referee_reward_description: string;
  trigger_event: string;
};

type ReferralCode = {
  id: string;
  code: string;
  referrer_name: string | null;
  uses_count: number;
  closed_won_count: number;
  total_reward_earned_eur: number;
  active: boolean;
};

type LeadFunnelData = {
  ok: boolean;
  project: { id: string; slug: string; name: string };
  generated_at: string;
  metrics: Metrics;
  leads: Lead[];
  referrals: {
    programs: ReferralProgram[];
    stats: {
      codes: number;
      referrals_total: number;
      referrals_pending: number;
      referrals_converted: number;
      rewards_pending_eur: number;
      codes_list?: ReferralCode[];
    };
  };
  content: {
    status: string;
    note: string;
    planned_pillars: Array<{ id: string; label: string; frequency_per_week: number }>;
    posts_published_30d: number;
    posts_scheduled: number;
    posts_drafts: number;
  };
  spend: {
    status: string;
    note: string;
    cold_outreach: {
      apollo_campaigns: number;
      apollo_campaigns_active: number;
      apollo_credits_used_estimate: number;
      recent_campaigns: Array<{ id: string; name: string; status: string; created_at: string }>;
    };
    targets: { monthly_ad_budget_eur: number; monthly_tools_budget_eur: number; cpl_max_eur: number };
    actuals: { monthly_spent_eur: number; cpl_eur: number | null };
  };
};

const TIER_KEY: Record<string, string> = {
  A: 'dashboards.funnel.tierA', B: 'dashboards.funnel.tierB', C: 'dashboards.funnel.tierC', D: 'dashboards.funnel.tierD', unscored: 'dashboards.funnel.tierUnscored'
};
const TIER_BADGE: Record<string, string> = {
  A: 'badge-gold', B: 'badge-emerald', C: 'badge', D: 'badge', unscored: 'badge'
};
const STATUS_KEY: Record<string, string> = {
  new: 'dashboards.funnel.statusNew', contacted: 'dashboards.funnel.statusContacted', qualified: 'dashboards.funnel.statusQualified',
  meeting_booked: 'dashboards.funnel.statusMeetingBooked', proposal_sent: 'dashboards.funnel.statusProposalSent',
  closed_won: 'dashboards.funnel.statusClosedWon', closed_lost: 'dashboards.funnel.statusClosedLost', nurturing: 'dashboards.funnel.statusNurturing'
};
const tierLabel = (t: TFunction, k: string) => TIER_KEY[k] ? t(TIER_KEY[k]) : k;
const statusLabel = (t: TFunction, k: string) => STATUS_KEY[k] ? t(STATUS_KEY[k]) : k;

const LEAD_STATUS_OPTIONS = [
  'new', 'contacted', 'qualified', 'meeting_booked', 'proposal_sent', 'closed_won', 'closed_lost', 'nurturing'
] as const;

// ─── Content-Cockpit Types (Customer-JWT /api/me/funnel/*) ─────
type ContentPiece = {
  id: string;
  title: string | null;
  body: string | null;
  platform: string | null;          // facebook | linkedin | ...
  segment: string | null;           // auswanderer | investor | ...
  awareness_stage: string | null;
  status: string;                    // draft | approved | scheduled | published | archived
  scheduled_at: string | null;
  published_at: string | null;
  approved_at: string | null;
  topic_id: string | null;
  created_at: string;
};

type Channel = {
  platform: string;                  // facebook | linkedin
  connected: boolean;
  enabled: boolean;
  display_name: string | null;
  external_id: string | null;
  status?: string | null;
};

type IcpProfile = {
  segment: string;
  label?: string | null;
  pains: string[];
  desires: string[];
  objections: string[];
  awareness_default: string | null;
  language_notes: string | null;
};

type BrandVoice = {
  tone: string | null;
  dos: string[];
  donts: string[];
  examples: string[];
};

type Topic = {
  id: string;
  title: string;
  segment: string | null;
  status: string;                    // active | parked | done
  notes: string | null;
};

const PIECE_STATUS_KEY: Record<string, string> = {
  draft: 'dashboards.funnel.pieceDraft', approved: 'dashboards.funnel.pieceApproved', scheduled: 'dashboards.funnel.pieceScheduled',
  published: 'dashboards.funnel.piecePublished', archived: 'dashboards.funnel.pieceArchived',
};
const PIECE_STATUS_BADGE: Record<string, string> = {
  draft: 'badge', approved: 'badge-emerald', scheduled: 'badge-gold',
  published: 'badge-emerald', archived: 'badge-rose',
};
const pieceStatusLabel = (t: TFunction, k: string) => PIECE_STATUS_KEY[k] ? t(PIECE_STATUS_KEY[k]) : k;
const PLATFORM_LABEL: Record<string, string> = {
  facebook: 'Facebook', linkedin: 'LinkedIn',
};
const PLATFORM_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  facebook: Facebook, linkedin: Linkedin,
};
const SEGMENT_OPTIONS = ['auswanderer', 'investor'] as const;
const AWARENESS_OPTIONS = ['unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'] as const;

/** True if an API error carries the given HTTP status code (api() throws `API <code>: ...`). */
function errHasStatus(e: unknown, code: number): boolean {
  return e instanceof Error && e.message.startsWith(`API ${code}`);
}
/** Heuristik: gated / Schnittstelle-nicht-konfiguriert. */
function isGatedErr(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return errHasStatus(e, 503) || errHasStatus(e, 409) ||
    /gated|oauth_not_configured|not[_ ]configured/i.test(e.message);
}

export default function LeadFunnel({ projectSlug, projectName }: { projectSlug: string; projectName: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('metrics');
  const [data, setData] = useState<LeadFunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api<LeadFunnelData>(`/api/me/projects/${projectSlug}/lead-funnel`);
      setData(d);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectSlug]);

  if (loading) return <div className="card-premium p-16 flex justify-center"><Spinner size="md" /></div>;
  if (!data) return <div className="card-premium p-10 text-center text-sm text-ink-400">{t('dashboards.funnel.noData')}</div>;

  return (
    <div className="dashboard-stack @container">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> {t('dashboards.funnel.engine')}
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{t('dashboards.funnel.title')}</h1>
            <p className="text-ink-400 mt-1 text-sm">{t('dashboards.funnel.subtitle', { name: projectName })}</p>
          </div>
          <button onClick={load} className="text-xs text-ink-400 hover:text-gold-300 px-3 py-2 rounded-md hover:bg-white/5 transition">
            <Activity size={12} className="inline mr-1.5" />
            {t('dashboards.funnel.refresh')}
          </button>
        </div>
      </header>

      {/* Sub-Tab Navigation */}
      <nav className="flex gap-1 border-b border-white/5 -mb-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'metrics' as const,   label: t('dashboards.funnel.tabMetrics'),   icon: TrendingUp },
          { id: 'leads' as const,     label: t('dashboards.funnel.tabLeads'),      icon: Users },
          { id: 'content' as const,   label: t('dashboards.funnel.tabContent'),    icon: FileText },
          { id: 'channels' as const,  label: t('dashboards.funnel.tabChannels'),     icon: Plug },
          { id: 'audience' as const,  label: t('dashboards.funnel.tabAudience'), icon: Target },
          { id: 'akquise' as const,   label: t('dashboards.funnel.tabAkquise'),    icon: Upload },
          { id: 'spend' as const,     label: t('dashboards.funnel.tabSpend'),      icon: DollarSign },
          { id: 'referrals' as const, label: t('dashboards.funnel.tabReferrals'),  icon: Gift }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === id
                ? 'border-gold-400 text-gold-200'
                : 'border-transparent text-ink-400 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      {tab === 'metrics' && <MetricsSection metrics={data.metrics} leadsCount={data.leads.length} />}
      {tab === 'leads' && <LeadsSection leads={data.leads} onRefresh={load} />}
      {tab === 'content' && <ContentSection content={data.content} />}
      {tab === 'channels' && <ChannelsSection />}
      {tab === 'audience' && <AudienceSection />}
      {tab === 'akquise' && <AkquiseSection onRefresh={load} />}
      {tab === 'spend' && <SpendSection spend={data.spend} />}
      {tab === 'referrals' && <ReferralsSection
        programs={data.referrals.programs}
        stats={data.referrals.stats}
        projectSlug={projectSlug}
        onRefresh={load}
      />}
    </div>
  );
}

// ─── Metrics Section ───────────────────────────────────────────
function MetricsSection({ metrics, leadsCount }: { metrics: Metrics; leadsCount: number }) {
  const { t } = useTranslation();
  const aLeads = metrics.by_tier.A || 0;
  const targetMin = parseInt(String(metrics.target_leads_per_month).split('-')[0] || '15', 10);
  const targetAMin = parseInt(String(metrics.target_a_leads_per_month).split('-')[0] || '3', 10);
  const leadsTrack = Math.min(100, Math.round((metrics.leads_30d / targetMin) * 100));
  const aLeadsTrack = Math.min(100, Math.round((aLeads / targetAMin) * 100));

  return (
    <>
      <KpiGrid>
        <KpiCard i={0} icon={Users} label={t('dashboards.funnel.leadsTotal')} value={String(metrics.leads_total)} accent />
        <KpiCard i={1} icon={TrendingUp} label={t('dashboards.funnel.leads30d')} value={`${metrics.leads_30d} / ${metrics.target_leads_per_month}`} highlight={metrics.leads_30d >= targetMin} />
        <KpiCard i={2} icon={Activity} label={t('dashboards.funnel.leads7d')} value={String(metrics.leads_7d)} />
        <KpiCard i={3} icon={Award} label={t('dashboards.funnel.aLeads')} value={`${aLeads} / ${metrics.target_a_leads_per_month}`} highlight={aLeads >= targetAMin} />
      </KpiGrid>

      <section>
        <SectionHeader icon={TrendingUp} title={t('dashboards.funnel.targetVsActual')} sub={t('dashboards.funnel.targetVsActualSub')} />
        <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)] items-stretch">
          <ProgressCard label={t('dashboards.funnel.leadsPerMonth')} current={metrics.leads_30d} targetLabel={metrics.target_leads_per_month} pct={leadsTrack} />
          <ProgressCard label={t('dashboards.funnel.aLeadsPerMonth')} current={aLeads} targetLabel={metrics.target_a_leads_per_month} pct={aLeadsTrack} />
          <ProgressCard label={t('dashboards.funnel.cplMax')} current={null} targetLabel={`< ${metrics.target_cpl_max_eur} €`} pct={null} muted={t('dashboards.funnel.cplMuted')} />
          <ProgressCard label={t('dashboards.funnel.linkedinSsi')} current={null} targetLabel={`${metrics.target_ssi_min}+`} pct={null} muted={t('dashboards.funnel.ssiMuted')} />
          <ProgressCard label={t('dashboards.funnel.newsletterSubs')} current={0} targetLabel={`${metrics.target_newsletter_subs}+`} pct={0} muted={t('dashboards.funnel.newsletterMuted')} />
          <ProgressCard label={t('dashboards.funnel.conversationsWeek')} current={null} targetLabel={`${metrics.target_conversations_per_week}+`} pct={null} muted={t('dashboards.funnel.conversationsMuted')} />
        </div>
      </section>

      <section>
        <SectionHeader icon={Users} title={t('dashboards.funnel.tierDistribution')} sub={t('dashboards.funnel.tierDistributionSub', { count: leadsCount })} />
        <div className="card-premium p-4 sm:p-5 grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Tremor BarChart — Tier-Verteilung */}
          <BarChart
            className="h-56 w-full"
            data={['A','B','C','D','unscored'].map((tier) => ({
              tier: tierLabel(t, tier),
              [t('dashboards.funnel.chartLeads')]: metrics.by_tier[tier] || 0,
            }))}
            index="tier"
            categories={[t('dashboards.funnel.chartLeads')]}
            colors={['amber']}
            yAxisWidth={36}
            showLegend={false}
          />
          {/* Tremor DonutChart — Tier-Anteil */}
          <DonutChart
            className="h-56 w-full"
            data={['A','B','C','D','unscored']
              .map((tier) => ({ name: tierLabel(t, tier), value: metrics.by_tier[tier] || 0 }))
              .filter((d) => d.value > 0)}
            category="value"
            index="name"
            colors={['amber','yellow','orange','rose','slate']}
            variant="donut"
          />
        </div>
      </section>

      <section>
        <SectionHeader icon={Activity} title={t('dashboards.funnel.pipelineStatus')} sub={t('dashboards.funnel.pipelineStatusSub')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[var(--dashboard-gap)] items-stretch">
          {Object.entries(metrics.by_status).map(([s, n], i) => (
            <div key={s} className="card-premium card-compact animate-fade-up h-full flex flex-col" style={stagger(i, 40, 40)}>
              <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{statusLabel(t, s)}</div>
              <div className="mt-auto text-2xl font-bold text-white pt-1">{n}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── Leads Section ─────────────────────────────────────────────
// ─── Akquise Section (CSV-Upload + Email-Flow) ────────────────
type AkquiseCampaign = {
  id: string;
  name: string;
  status: string;
  outreach_channel: string;
  source_csv_filename: string | null;
  created_at: string;
  updated_at: string;
};

type AkquiseLeadDetail = {
  id: string;
  owner_name: string | null;
  owner_email: string;
  owner_linkedin_url: string | null;
  company_name: string | null;
  pitch_variants: Array<{ subject: string; body: string; tone: string; hook_angle: string }>;
  pitch_selected_index: number | null;
  outreach_status: string;
  outreach_message: string | null;
  outreach_message_subject: string | null;
};

function AkquiseSection({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<AkquiseCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadCampaigns = async () => {
    try {
      const r = await api<{ ok: boolean; campaigns: AkquiseCampaign[] }>('/api/factories/lead-scraper/campaigns');
      setCampaigns(r.campaigns || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.campaignsLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, []);

  if (loading) return <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>;

  return (
    <>
      <SectionHeader icon={Upload} title={t('dashboards.funnel.akquiseTitle')} sub={t('dashboards.funnel.akquiseSub')} />

      {/* Pro-Hinweis + Upload-Toggle */}
      <div className="card-premium p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-gold-300" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{t('dashboards.funnel.emailFlowTitle')}</div>
            <ol className="text-xs text-ink-300 mt-2 space-y-1 list-decimal list-inside leading-relaxed">
              <li>{t('dashboards.funnel.emailFlow1Pre')}<code className="text-gold-200">owner_email</code>{t('dashboards.funnel.emailFlow1Post')}</li>
              <li>{t('dashboards.funnel.emailFlow2')}</li>
              <li>{t('dashboards.funnel.emailFlow3')}</li>
              <li>{t('dashboards.funnel.emailFlow4')}</li>
              <li>{t('dashboards.funnel.emailFlow5')}</li>
            </ol>
          </div>
        </div>
        <button onClick={() => setShowUpload(s => !s)} className="btn-gold text-sm">
          {showUpload ? <><X size={13} /> {t('dashboards.funnel.cancel')}</> : <><Upload size={13} /> {t('dashboards.funnel.startNewCampaign')}</>}
        </button>
      </div>

      {showUpload && <UploadCampaignForm onCreated={() => { loadCampaigns(); setShowUpload(false); }} />}

      {/* Campaign-Liste */}
      <section>
        <SectionHeader icon={Send} title={t('dashboards.funnel.yourCampaigns')} sub={t('dashboards.funnel.campaignsTotal', { count: campaigns.length })} />
        {campaigns.length === 0 ? (
          <div className="card-premium p-10 text-center">
            <Send size={28} className="mx-auto text-ink-400 mb-3" />
            <p className="text-sm text-ink-400">{t('dashboards.funnel.noCampaign')}</p>
            <p className="text-xs text-ink-400 mt-2">{t('dashboards.funnel.noCampaignHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c, i) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                expanded={expandedId === c.id}
                onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                onAction={() => { loadCampaigns(); onRefresh(); }}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function UploadCampaignForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error(t('dashboards.funnel.chooseCsv')); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('csv', file);
      const token = getAccessToken();
      const res = await fetch(`${import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de'}/api/factories/lead-scraper/campaigns`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || t('dashboards.funnel.uploadFailed'));
      } else {
        toast.success(data.skipped
          ? t('dashboards.funnel.campaignCreatedSkipped', { imported: data.leads_imported, skipped: data.skipped })
          : t('dashboards.funnel.campaignCreated', { imported: data.leads_imported }));
        setName(''); setFile(null);
        onCreated();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-premium p-5 space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Upload size={14} className="text-gold-300" />
        <h3 className="text-xs font-semibold text-ink-100 uppercase tracking-wider">{t('dashboards.funnel.newCampaign')}</h3>
      </div>

      <Field label={t('dashboards.funnel.campaignNameLabel')}>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder={t('dashboards.funnel.campaignNamePlaceholder')} className="input-premium" />
      </Field>

      <Field label={t('dashboards.funnel.csvFileLabel')}>
        <div className="relative">
          <input
            required
            type="file"
            accept=".csv,text/csv"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="input-premium file:bg-gold-400/15 file:border-0 file:px-3 file:py-1 file:rounded file:text-gold-200 file:mr-3 file:text-xs file:font-medium"
          />
        </div>
        <p className="text-[0.65rem] text-ink-400 mt-1.5 leading-relaxed">
          {t('dashboards.funnel.csvRecognized')}<code>company_name</code>, <code>company_domain</code>, <code>owner_name</code>, <code className="text-gold-200">{t('dashboards.funnel.csvOwnerRequired')}</code>, <code>owner_linkedin_url</code>
        </p>
      </Field>

      <button disabled={uploading || !name || !file} className="btn-gold text-sm">
        {uploading ? <>{t('dashboards.funnel.uploading')}</> : <><Upload size={13} /> {t('dashboards.funnel.uploadCsvBtn')}</>}
      </button>
    </form>
  );
}

function CampaignCard({ campaign, expanded, onToggle, onAction, index }: {
  campaign: AkquiseCampaign;
  expanded: boolean;
  onToggle: () => void;
  onAction: () => void;
  index: number;
}) {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<AkquiseLeadDetail[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [actionRunning, setActionRunning] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    setLoadingLeads(true);
    api<{ ok: boolean; leads: AkquiseLeadDetail[] }>(`/api/factories/lead-scraper/campaigns/${campaign.id}`)
      .then(r => setLeads(r.leads || []))
      .catch(e => toast.error(e instanceof Error ? e.message : t('dashboards.funnel.leadsLoadFailed')))
      .finally(() => setLoadingLeads(false));
  }, [expanded, campaign.id, campaign.status]);

  const generatePitches = async () => {
    setActionRunning('generate');
    try {
      const r = await api<{ ok: boolean; leads_to_generate: number; credits_spent: number; estimated_duration_sec: number }>(
        `/api/factories/lead-scraper/campaigns/${campaign.id}/generate`, { method: 'POST' }
      );
      toast.success(t('dashboards.funnel.generatePitchesToast', { count: r.leads_to_generate, credits: r.credits_spent, sec: r.estimated_duration_sec }));
      setTimeout(onAction, 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.generateFailed'));
    } finally {
      setActionRunning(null);
    }
  };

  const sendApproved = async () => {
    if (!confirm(t('dashboards.funnel.sendConfirm'))) return;
    setActionRunning('send');
    try {
      const r = await api<{ ok: boolean; scheduled: number }>(`/api/factories/lead-scraper/campaigns/${campaign.id}/send`, { method: 'POST' });
      toast.success(t('dashboards.funnel.sendScheduled', { count: r.scheduled }));
      setTimeout(onAction, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.sendFailed'));
    } finally {
      setActionRunning(null);
    }
  };

  const statusBadge: Record<string, string> = {
    draft: 'badge', generating: 'badge-gold', ready_to_send: 'badge-emerald',
    sending: 'badge-gold', complete: 'badge-emerald', paused: 'badge'
  };

  const pendingCount = leads.filter(l => l.outreach_status === 'pending').length;
  const generatedCount = leads.filter(l => l.outreach_status === 'generated').length;
  const approvedCount = leads.filter(l => l.outreach_status === 'approved').length;
  const sentCount = leads.filter(l => l.outreach_status === 'sent').length;

  return (
    <div className="card-premium animate-fade-up" style={stagger(index, 30, 30)}>
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition rounded-t-xl">
        <div className="text-left min-w-0 flex-1">
          <div className="font-medium text-white text-sm truncate">{campaign.name}</div>
          <div className="text-xs text-ink-400 mt-0.5">
            {campaign.source_csv_filename} · {new Date(campaign.created_at).toLocaleDateString('de-DE')}
          </div>
        </div>
        <span className={`badge shrink-0 ${statusBadge[campaign.status] || ''}`}>{campaign.status}</span>
        <ChevronRight size={14} className={`text-ink-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {loadingLeads ? (
            <div className="flex justify-center py-6"><Spinner size="md" /></div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {pendingCount > 0 && (
                  <button onClick={generatePitches} disabled={actionRunning === 'generate'} className="btn-gold text-xs">
                    {actionRunning === 'generate' ? t('dashboards.funnel.generating') : <><Sparkles size={12} /> {t('dashboards.funnel.generatePitchesBtn', { pending: pendingCount, cost: pendingCount * 12 })}</>}
                  </button>
                )}
                {approvedCount > 0 && (
                  <button onClick={sendApproved} disabled={actionRunning === 'send'} className="btn-gold text-xs">
                    {actionRunning === 'send' ? t('dashboards.funnel.publishing') : <><Send size={12} /> {t('dashboards.funnel.sendApprovedBtn', { approved: approvedCount })}</>}
                  </button>
                )}
                <div className="text-xs text-ink-400 ml-auto">
                  {t('dashboards.funnel.pitchCounters', { pending: pendingCount, generated: generatedCount, approved: approvedCount, sent: sentCount })}
                </div>
              </div>

              {/* Leads-List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {leads.map(l => (
                  <LeadPitchRow key={l.id} lead={l} onAction={onAction} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LeadPitchRow({ lead, onAction }: { lead: AkquiseLeadDetail; onAction: () => void }) {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(lead.pitch_selected_index ?? 0);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(lead.outreach_message || '');
  const [editSubject, setEditSubject] = useState(lead.outreach_message_subject || '');
  const [saving, setSaving] = useState(false);

  const variants = lead.pitch_variants || [];
  const hasPitch = variants.length > 0 || lead.outreach_message;

  const approve = async () => {
    setSaving(true);
    try {
      const body = editing
        ? { outreach_status: 'approved', outreach_message: editBody, outreach_message_subject: editSubject }
        : { outreach_status: 'approved', pitch_selected_index: selectedIdx };
      await api(`/api/factories/lead-scraper/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast.success(t('dashboards.funnel.leadApproved'));
      setEditing(false);
      onAction();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.approveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    setSaving(true);
    try {
      await api(`/api/factories/lead-scraper/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ outreach_status: 'failed' }) });
      toast.success(t('dashboards.funnel.leadSkipped'));
      onAction();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.error'));
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'badge', generated: 'badge-gold', approved: 'badge-emerald',
    sent: 'badge-emerald', failed: 'badge-rose', opened: 'badge-emerald', replied: 'badge-gold'
  };

  return (
    <div className="card-premium p-3 border border-white/5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white">{lead.owner_name || lead.owner_email}</div>
          <div className="text-xs text-ink-400 flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1"><Mail size={10} /> {lead.owner_email}</span>
            {lead.owner_linkedin_url && (
              <a href={lead.owner_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gold-300 hover:underline">LinkedIn</a>
            )}
            {lead.company_name && <span>· {lead.company_name}</span>}
          </div>
        </div>
        <span className={`badge ${statusColor[lead.outreach_status] || ''}`}>{lead.outreach_status}</span>
      </div>

      {hasPitch && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {!editing && variants.length > 1 && (
            <div className="flex gap-2 mb-2">
              {variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`text-[0.65rem] px-2.5 py-1 rounded-full border transition ${
                    selectedIdx === i ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/10 text-ink-400'
                  }`}
                >
                  {t('dashboards.funnel.variantLabel', { n: i + 1 })} <span className="opacity-60">({v.tone})</span>
                </button>
              ))}
            </div>
          )}

          {editing ? (
            <div className="space-y-2">
              <input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder={t('dashboards.funnel.subject')} className="input-premium text-xs" />
              <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={5} className="input-premium text-xs resize-none" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{t('dashboards.funnel.subject')}</div>
              <div className="text-sm text-white">{variants[selectedIdx]?.subject || lead.outreach_message_subject}</div>
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mt-2">{t('dashboards.funnel.body')}</div>
              <div className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">{variants[selectedIdx]?.body || lead.outreach_message}</div>
            </div>
          )}

          {lead.outreach_status !== 'sent' && lead.outreach_status !== 'failed' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {editing ? (
                <>
                  <button onClick={approve} disabled={saving} className="btn-gold text-xs"><Check size={11} /> {t('dashboards.funnel.saveApprove')}</button>
                  <button onClick={() => { setEditing(false); setEditBody(variants[selectedIdx]?.body || ''); setEditSubject(variants[selectedIdx]?.subject || ''); }} className="text-xs text-ink-400 hover:text-white px-2 py-1">{t('dashboards.funnel.cancel')}</button>
                </>
              ) : (
                <>
                  <button onClick={approve} disabled={saving || lead.outreach_status === 'approved'} className="btn-gold text-xs">
                    <Check size={11} /> {lead.outreach_status === 'approved' ? t('dashboards.funnel.approved') : t('dashboards.funnel.approve')}
                  </button>
                  <button onClick={() => { setEditing(true); setEditBody(variants[selectedIdx]?.body || ''); setEditSubject(variants[selectedIdx]?.subject || ''); }} className="text-xs text-ink-300 hover:text-gold-300 px-2 py-1 inline-flex items-center gap-1">
                    <Edit3 size={10} /> {t('dashboards.funnel.edit')}
                  </button>
                  <button onClick={reject} disabled={saving} className="text-xs text-rose-300 hover:text-rose-200 px-2 py-1 ml-auto inline-flex items-center gap-1">
                    <X size={10} /> {t('dashboards.funnel.skip')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!hasPitch && lead.outreach_status === 'pending' && (
        <div className="mt-2 text-xs text-ink-400 italic">{t('dashboards.funnel.waitingPitch')}</div>
      )}
    </div>
  );
}

function LeadsSection({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'A' | 'B' | 'new' | 'qualified'>('all');
  const filtered = useMemo(() => {
    if (filter === 'all') return leads;
    if (filter === 'A' || filter === 'B') return leads.filter(l => l.lead_tier === filter);
    return leads.filter(l => l.status === filter);
  }, [leads, filter]);

  return (
    <>
      <SectionHeader icon={Users} title={t('dashboards.funnel.tabLeads')} sub={t('dashboards.funnel.leadsCount', { count: leads.length })} />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all' as const, label: t('dashboards.funnel.filterAll') },
          { id: 'A' as const, label: t('dashboards.funnel.filterA') },
          { id: 'B' as const, label: t('dashboards.funnel.filterB') },
          { id: 'new' as const, label: t('dashboards.funnel.filterNew') },
          { id: 'qualified' as const, label: t('dashboards.funnel.filterQualified') }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f.id
                ? 'border-gold-400/50 bg-gold-400/10 text-gold-200'
                : 'border-white/10 text-ink-400 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <Users size={28} className="mx-auto text-ink-400 mb-3" />
          <p className="text-sm text-ink-400">{t('dashboards.funnel.noLeadsInSelection')}</p>
          <p className="text-xs text-ink-400 mt-2">
            {t('dashboards.funnel.leadsApolloHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l, i) => (
            <LeadRow key={l.id} lead={l} index={i} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </>
  );
}

function LeadRow({ lead, index, onRefresh }: { lead: Lead; index: number; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(lead.status);
  const [saving, setSaving] = useState(false);
  // nurture_step is provided by some lead shapes — read defensively without widening the Lead type.
  const nurtureStep = (lead as unknown as { nurture_step?: number | string | null }).nurture_step;

  const changeStatus = async (next: string) => {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    setSaving(true);
    try {
      await api(`/api/me/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      toast.success(t('dashboards.funnel.statusUpdateToast', { label: statusLabel(t, next) }));
      onRefresh();
    } catch (e) {
      setStatus(prev);
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.statusUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-premium p-4 animate-fade-up" style={stagger(index, 30, 30)}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">{lead.name || lead.email}</span>
            {lead.lead_tier && (
              <span className={`badge ${TIER_BADGE[lead.lead_tier] || 'badge'}`}>
                {lead.lead_tier}{lead.score_total !== null ? ` · ${lead.score_total}P` : ''}
              </span>
            )}
            {lead.referral_code && (
              <span className="badge badge-emerald">
                <Gift size={10} className="inline mr-1" />
                {lead.referral_code}
              </span>
            )}
            {(nurtureStep !== undefined && nurtureStep !== null) && (
              <span className="badge">{t('dashboards.funnel.nurtureStep', { n: String(nurtureStep) })}</span>
            )}
          </div>
          <div className="text-xs text-ink-400 mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1"><Mail size={11} /> {lead.email}</span>
            {lead.phone && <span className="inline-flex items-center gap-1"><Phone size={11} /> {lead.phone}</span>}
            {lead.source && (
              <span>· {t('dashboards.funnel.source')} <span className="text-ink-200">{lead.source}{lead.source_detail ? `/${lead.source_detail}` : ''}</span></span>
            )}
            <span>· {new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
          </div>
          {lead.notes && <p className="text-xs text-ink-300 mt-2 italic">„{lead.notes}"</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={status}
            disabled={saving}
            onChange={e => changeStatus(e.target.value)}
            className="input-premium text-xs py-1.5 pr-7 disabled:opacity-50"
            aria-label={t('dashboards.funnel.leadStatusAria')}
          >
            {LEAD_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{statusLabel(t, s)}</option>
            ))}
            {!LEAD_STATUS_OPTIONS.includes(status as typeof LEAD_STATUS_OPTIONS[number]) && (
              <option value={status}>{statusLabel(t, status)}</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Spend Section ─────────────────────────────────────────────
function SpendSection({ spend }: { spend: LeadFunnelData['spend'] }) {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeader icon={DollarSign} title={t('dashboards.funnel.spendTitle')} sub={t('dashboards.funnel.spendSub')} />

      <KpiGrid>
        <KpiCard i={0} icon={Send} label={t('dashboards.funnel.apolloCampaigns')} value={String(spend.cold_outreach.apollo_campaigns)} />
        <KpiCard i={1} icon={Activity} label={t('dashboards.funnel.active')} value={String(spend.cold_outreach.apollo_campaigns_active)} accent={spend.cold_outreach.apollo_campaigns_active > 0} />
        <KpiCard i={2} icon={DollarSign} label={t('dashboards.funnel.adBudgetTarget')} value={`${spend.targets.monthly_ad_budget_eur} €`} />
        <KpiCard i={3} icon={DollarSign} label={t('dashboards.funnel.toolsTarget')} value={`${spend.targets.monthly_tools_budget_eur} €`} />
      </KpiGrid>

      <section>
        <SectionHeader icon={Send} title={t('dashboards.funnel.apolloOutreach')} sub={t('dashboards.funnel.apolloOutreachSub')} />
        {spend.cold_outreach.recent_campaigns.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <Send size={24} className="mx-auto text-ink-400 mb-3" />
            <p className="text-sm text-ink-300">{t('dashboards.funnel.noCampaignSpend')}</p>
            <p className="text-xs text-ink-400 mt-2 max-w-md mx-auto">
              {t('dashboards.funnel.apolloSetupHint1')}<code className="text-gold-300">SETUP-APOLLO-SALESNAV.md</code>{t('dashboards.funnel.apolloSetupHint2')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {spend.cold_outreach.recent_campaigns.map((c, i) => (
              <div key={c.id} className="card-premium p-4 flex items-center justify-between gap-3 animate-fade-up" style={stagger(i, 30, 30)}>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white text-sm">{c.name}</div>
                  <div className="text-xs text-ink-400 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <span className={`badge ${c.status === 'complete' ? 'badge-emerald' : c.status === 'sending' || c.status === 'ready_to_send' ? 'badge-gold' : ''}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <ComingSoonCard
        icon={DollarSign}
        title={t('dashboards.funnel.adsComingTitle')}
        body={t('dashboards.funnel.adsComingBody')}
      />
    </>
  );
}

// ─── Content Section (Cockpit: Pieces + Generate + Edit + Publish) ──
function ContentSection({ content }: { content: LeadFunnelData['content'] }) {
  const { t } = useTranslation();
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [showGen, setShowGen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      if (platformFilter !== 'all') qs.set('platform', platformFilter);
      const q = qs.toString();
      const r = await api<{ ok?: boolean; pieces?: ContentPiece[] } | ContentPiece[]>(`/api/me/funnel/pieces${q ? `?${q}` : ''}`);
      const list = Array.isArray(r) ? r : (r.pieces ?? []);
      setPieces(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.contentLoadFailed'));
      setPieces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter, platformFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of pieces) c[p.status] = (c[p.status] || 0) + 1;
    return c;
  }, [pieces]);

  return (
    <>
      <SectionHeader icon={FileText} title={t('dashboards.funnel.contentTitle')} sub={t('dashboards.funnel.contentSub')} />

      <KpiGrid>
        <KpiCard i={0} icon={FileText} label={t('dashboards.funnel.published30d')} value={String(content.posts_published_30d)} />
        <KpiCard i={1} icon={Activity} label={t('dashboards.funnel.scheduled')} value={String((counts.scheduled || 0))} />
        <KpiCard i={2} icon={ChevronRight} label={t('dashboards.funnel.drafts')} value={String((counts.draft || 0))} />
        <KpiCard i={3} icon={Check} label={t('dashboards.funnel.approvedKpi')} value={String((counts.approved || 0))} />
      </KpiGrid>

      {/* Generate-Toggle */}
      <div className="card-premium p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-gold-300" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{t('dashboards.funnel.generateInVoiceTitle')}</div>
            <p className="text-xs text-ink-300 mt-1 leading-relaxed">
              {t('dashboards.funnel.generateInVoiceText')}
            </p>
          </div>
        </div>
        <button onClick={() => setShowGen(s => !s)} className="btn-gold text-sm">
          {showGen ? <><X size={13} /> {t('dashboards.funnel.cancel')}</> : <><Sparkles size={13} /> {t('dashboards.funnel.generateContent')}</>}
        </button>
      </div>

      {showGen && <GeneratePieceForm onDone={() => { setShowGen(false); load(); }} />}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <FilterChips
          label={t('dashboards.funnel.filterStatus')}
          value={statusFilter}
          options={[['all', t('dashboards.funnel.filterAll')], ['draft', t('dashboards.funnel.pieceDraft')], ['approved', t('dashboards.funnel.pieceApproved')], ['scheduled', t('dashboards.funnel.pieceScheduled')], ['published', t('dashboards.funnel.piecePublished')], ['archived', t('dashboards.funnel.pieceArchived')]]}
          onChange={setStatusFilter}
        />
        <FilterChips
          label={t('dashboards.funnel.filterPlatform')}
          value={platformFilter}
          options={[['all', t('dashboards.funnel.filterAll')], ['linkedin', 'LinkedIn'], ['facebook', 'Facebook']]}
          onChange={setPlatformFilter}
        />
      </div>

      {/* Pieces list */}
      {loading ? (
        <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>
      ) : pieces.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <FileText size={28} className="mx-auto text-ink-400 mb-3" />
          <p className="text-sm text-ink-400">{t('dashboards.funnel.noContentInSelection')}</p>
          <p className="text-xs text-ink-400 mt-2">{t('dashboards.funnel.noContentHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pieces.map((p, i) => (
            <PieceCard key={p.id} piece={p} index={i} onRefresh={load} />
          ))}
        </div>
      )}
    </>
  );
}

function GeneratePieceForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<string>('auswanderer');
  const [platform, setPlatform] = useState<string>('linkedin');
  const [awareness, setAwareness] = useState<string>('problem_aware');
  const [n, setN] = useState(1);
  const [running, setRunning] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    try {
      await api('/api/me/funnel/pieces/generate', {
        method: 'POST',
        body: JSON.stringify({ segment, platform, awareness_stage: awareness, n }),
      });
      toast.success(t('dashboards.funnel.genDraftToast', { count: n }));
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.generateFailed'));
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-premium p-5 space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Sparkles size={14} className="text-gold-300" />
        <h3 className="text-xs font-semibold text-ink-100 uppercase tracking-wider">{t('dashboards.funnel.generateContent')}</h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label={t('dashboards.funnel.fieldSegment')}>
          <select value={segment} onChange={e => setSegment(e.target.value)} className="input-premium">
            {SEGMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={t('dashboards.funnel.fieldPlatform')}>
          <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-premium">
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
          </select>
        </Field>
        <Field label={t('dashboards.funnel.fieldAwareness')}>
          <select value={awareness} onChange={e => setAwareness(e.target.value)} className="input-premium">
            {AWARENESS_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label={t('dashboards.funnel.fieldCount')}>
          <input type="number" min={1} max={5} value={n} onChange={e => setN(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} className="input-premium" />
        </Field>
      </div>
      <button disabled={running} className="btn-gold text-sm">
        {running ? t('dashboards.funnel.generating') : <><Sparkles size={13} /> {t('dashboards.funnel.createDraft')}</>}
      </button>
    </form>
  );
}

function PieceCard({ piece, index, onRefresh }: { piece: ContentPiece; index: number; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(piece.title || '');
  const [body, setBody] = useState(piece.body || '');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const PlatIcon = (piece.platform && PLATFORM_ICON[piece.platform]) || FileText;

  const patch = async (partial: Record<string, unknown>, okMsg: string, key: string) => {
    setBusy(key);
    try {
      await api(`/api/me/funnel/pieces/${piece.id}`, { method: 'PATCH', body: JSON.stringify(partial) });
      toast.success(okMsg);
      setEditing(false);
      setScheduleOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.actionFailed'));
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    setBusy('publish');
    try {
      await api(`/api/me/funnel/pieces/${piece.id}/publish`, { method: 'POST' });
      toast.success(t('dashboards.funnel.published'));
      onRefresh();
    } catch (e) {
      if (isGatedErr(e)) {
        toast.error(t('dashboards.funnel.publishGated', {
          platform: piece.platform ? (PLATFORM_LABEL[piece.platform] || piece.platform) : t('dashboards.funnel.publishGatedGeneric')
        }));
      } else {
        toast.error(e instanceof Error ? e.message : t('dashboards.funnel.publishFailed'));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card-premium p-4 animate-fade-up" style={stagger(index, 30, 30)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PlatIcon size={13} className="text-gold-300" />
            <span className="font-medium text-white text-sm">{piece.title || t('dashboards.funnel.noTitle')}</span>
            <span className={`badge ${PIECE_STATUS_BADGE[piece.status] || 'badge'}`}>{pieceStatusLabel(t, piece.status)}</span>
            {piece.segment && <span className="badge">{piece.segment}</span>}
            {piece.awareness_stage && <span className="badge">{piece.awareness_stage}</span>}
          </div>
          <div className="text-[0.65rem] text-ink-400 mt-1 flex items-center gap-3 flex-wrap">
            {piece.platform && <span>{PLATFORM_LABEL[piece.platform] || piece.platform}</span>}
            {piece.scheduled_at && <span>· {t('dashboards.funnel.scheduledAt', { date: new Date(piece.scheduled_at).toLocaleString('de-DE') })}</span>}
            {piece.published_at && <span>· {t('dashboards.funnel.publishedAt', { date: new Date(piece.published_at).toLocaleString('de-DE') })}</span>}
            <span>· {t('dashboards.funnel.createdAt', { date: new Date(piece.created_at).toLocaleDateString('de-DE') })}</span>
          </div>
        </div>
      </div>

      {/* Body / Edit */}
      <div className="mt-3 pt-3 border-t border-white/5">
        {editing ? (
          <div className="space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('dashboards.funnel.title_field')} className="input-premium text-xs" />
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder={t('dashboards.funnel.body_field')} className="input-premium text-xs resize-none" />
          </div>
        ) : (
          piece.body ? <div className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">{piece.body}</div>
            : <div className="text-xs text-ink-400 italic">{t('dashboards.funnel.noText')}</div>
        )}
      </div>

      {/* Schedule input */}
      {scheduleOpen && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} className="input-premium text-xs" />
          <button
            disabled={busy === 'schedule' || !scheduleAt}
            onClick={() => patch({ status: 'scheduled', scheduled_at: new Date(scheduleAt).toISOString() }, t('dashboards.funnel.planned'), 'schedule')}
            className="btn-gold text-xs"
          >
            {busy === 'schedule' ? t('dashboards.funnel.saving') : t('dashboards.funnel.setSchedule')}
          </button>
          <button onClick={() => setScheduleOpen(false)} className="text-xs text-ink-400 hover:text-white px-2 py-1">{t('dashboards.funnel.cancel')}</button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
        {editing ? (
          <>
            <button disabled={busy === 'save'} onClick={() => patch({ title, body }, t('dashboards.funnel.saved'), 'save')} className="btn-gold text-xs">
              <Check size={11} /> {t('dashboards.funnel.save')}
            </button>
            <button onClick={() => { setEditing(false); setTitle(piece.title || ''); setBody(piece.body || ''); }} className="text-xs text-ink-400 hover:text-white px-2 py-1">{t('dashboards.funnel.cancel')}</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="text-xs text-ink-300 hover:text-gold-300 px-2 py-1 inline-flex items-center gap-1">
              <Edit3 size={10} /> {t('dashboards.funnel.edit')}
            </button>
            {piece.status !== 'approved' && piece.status !== 'published' && (
              <button disabled={busy === 'approve'} onClick={() => patch({ status: 'approved' }, t('dashboards.funnel.released'), 'approve')} className="text-xs text-emerald-300 hover:text-emerald-200 px-2 py-1 inline-flex items-center gap-1">
                <Check size={10} /> {t('dashboards.funnel.release')}
              </button>
            )}
            {piece.status !== 'published' && (
              <button onClick={() => setScheduleOpen(s => !s)} className="text-xs text-ink-300 hover:text-gold-300 px-2 py-1 inline-flex items-center gap-1">
                <Activity size={10} /> {t('dashboards.funnel.plan')}
              </button>
            )}
            {piece.status !== 'archived' && piece.status !== 'published' && (
              <button disabled={busy === 'archive'} onClick={() => patch({ status: 'archived' }, t('dashboards.funnel.archived'), 'archive')} className="text-xs text-rose-300 hover:text-rose-200 px-2 py-1 inline-flex items-center gap-1">
                <X size={10} /> {t('dashboards.funnel.archive')}
              </button>
            )}
            {(piece.status === 'approved' || piece.status === 'scheduled') && (
              <button disabled={busy === 'publish'} onClick={publish} className="btn-gold text-xs ml-auto">
                <Send size={11} /> {busy === 'publish' ? t('dashboards.funnel.publishing') : t('dashboards.funnel.publish')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Channels Section (FB + LinkedIn connect/disconnect/enable/first-post) ──
function ChannelsSection() {
  const { t } = useTranslation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);

  const PLATFORMS: Array<{ platform: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { platform: 'facebook', label: 'Facebook', icon: Facebook },
    { platform: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const [chRes, pcRes] = await Promise.allSettled([
        api<{ ok?: boolean; channels?: Channel[] } | Channel[]>('/api/me/funnel/channels'),
        api<{ ok?: boolean; pieces?: ContentPiece[] } | ContentPiece[]>('/api/me/funnel/pieces?status=approved'),
      ]);
      if (chRes.status === 'fulfilled') {
        const v = chRes.value;
        setChannels(Array.isArray(v) ? v : (v.channels ?? []));
      } else { setChannels([]); }
      if (pcRes.status === 'fulfilled') {
        const v = pcRes.value;
        setPieces(Array.isArray(v) ? v : (v.pieces ?? []));
      } else { setPieces([]); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byPlatform = (p: string) => channels.find(c => c.platform === p);

  return (
    <>
      <SectionHeader icon={Plug} title={t('dashboards.funnel.channelsTitle')} sub={t('dashboards.funnel.channelsSub')} />

      {loading ? (
        <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)] items-stretch">
          {PLATFORMS.map((p, i) => (
            <ChannelCard
              key={p.platform}
              platform={p.platform}
              label={p.label}
              icon={p.icon}
              channel={byPlatform(p.platform)}
              approvedPieces={pieces.filter(pc => pc.platform === p.platform)}
              index={i}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ChannelCard({ platform, label, icon: Icon, channel, approvedPieces, index, onRefresh }: {
  platform: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  channel?: Channel;
  approvedPieces: ContentPiece[];
  index: number;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [firstPostId, setFirstPostId] = useState('');
  const connected = !!channel?.connected;

  const connect = async () => {
    setBusy('connect');
    setNotConfigured(false);
    try {
      const r = await api<{ ok?: boolean; authorize_url?: string }>(`/api/me/funnel/channels/${platform}/connect/start`, { method: 'POST' });
      if (r.authorize_url) { window.location.href = r.authorize_url; return; }
      // No URL but 200 → treat as not yet configured
      setNotConfigured(true);
    } catch (e) {
      if (isGatedErr(e)) setNotConfigured(true);
      else toast.error(e instanceof Error ? e.message : t('dashboards.funnel.connectFailed'));
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    if (!confirm(t('dashboards.funnel.disconnectConfirm', { label }))) return;
    setBusy('disconnect');
    try {
      await api(`/api/me/funnel/channels/${platform}/disconnect`, { method: 'POST' });
      toast.success(t('dashboards.funnel.disconnected', { label }));
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.disconnectFailed'));
    } finally {
      setBusy(null);
    }
  };

  const toggleEnabled = async () => {
    setBusy('toggle');
    try {
      await api(`/api/me/funnel/channels/${platform}`, { method: 'PATCH', body: JSON.stringify({ enabled: !channel?.enabled }) });
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.toggleFailed'));
    } finally {
      setBusy(null);
    }
  };

  const publishFirst = async () => {
    if (!firstPostId) return;
    setBusy('first');
    try {
      await api(`/api/me/funnel/pieces/${firstPostId}/publish`, { method: 'POST' });
      toast.success(t('dashboards.funnel.published'));
      setFirstPostId('');
      onRefresh();
    } catch (e) {
      if (isGatedErr(e)) toast.error(t('dashboards.funnel.publishGatedChannel'));
      else toast.error(e instanceof Error ? e.message : t('dashboards.funnel.publishFailed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card-premium p-5 h-full flex flex-col animate-fade-up" style={stagger(index, 40, 40)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
            <Icon size={18} className="text-gold-300" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{label}</div>
            <div className="text-xs text-ink-400">{channel?.display_name || (connected ? t('dashboards.funnel.connected') : t('dashboards.funnel.notConnected'))}</div>
          </div>
        </div>
        <span className={`badge ${connected ? 'badge-emerald' : ''}`}>{connected ? t('dashboards.funnel.connectedBadge') : t('dashboards.funnel.disconnectedBadge')}</span>
      </div>

      {notConfigured && (
        <div className="mb-3 text-xs text-ink-300 bg-white/[0.03] border border-white/5 rounded-lg p-3 leading-relaxed">
          <AlertCircle size={12} className="inline mr-1 text-gold-300" />
          {t('dashboards.funnel.notConfigured', { label })}
        </div>
      )}

      <div className="mt-auto space-y-3">
        {/* Connect / Disconnect + enable toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {connected ? (
            <>
              <button disabled={busy === 'disconnect'} onClick={disconnect} className="text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-md border border-white/10 inline-flex items-center gap-1.5">
                <Plug size={11} /> {t('dashboards.funnel.disconnect')}
              </button>
              <label className="text-xs text-ink-300 inline-flex items-center gap-2 cursor-pointer ml-auto">
                <input type="checkbox" checked={!!channel?.enabled} disabled={busy === 'toggle'} onChange={toggleEnabled} className="accent-gold-400" />
                {t('dashboards.funnel.active')}
              </label>
            </>
          ) : (
            <button disabled={busy === 'connect'} onClick={connect} className="btn-gold text-xs">
              <Link2 size={12} /> {busy === 'connect' ? t('dashboards.funnel.connecting') : t('dashboards.funnel.connect', { label })}
            </button>
          )}
        </div>

        {/* First post */}
        {connected && (
          <div className="pt-3 border-t border-white/5">
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1.5">{t('dashboards.funnel.firstPost')}</div>
            {approvedPieces.length === 0 ? (
              <p className="text-xs text-ink-400 italic">{t('dashboards.funnel.noApprovedContent', { label })}</p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={firstPostId} onChange={e => setFirstPostId(e.target.value)} className="input-premium text-xs flex-1 min-w-[160px]">
                  <option value="">{t('dashboards.funnel.chooseApproved')}</option>
                  {approvedPieces.map(pc => <option key={pc.id} value={pc.id}>{pc.title || t('dashboards.funnel.noTitle')}</option>)}
                </select>
                <button disabled={busy === 'first' || !firstPostId} onClick={publishFirst} className="btn-gold text-xs">
                  <Send size={11} /> {t('dashboards.funnel.post')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Audience Section (ICP + Brand-Voice + Topics) ─────────────
function AudienceSection() {
  const { t } = useTranslation();
  const [icp, setIcp] = useState<IcpProfile[]>([]);
  const [voice, setVoice] = useState<BrandVoice | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [icpRes, voiceRes, topicsRes] = await Promise.allSettled([
      api<{ ok?: boolean; profiles?: IcpProfile[]; icp?: IcpProfile[] } | IcpProfile[]>('/api/me/funnel/icp'),
      api<{ ok?: boolean; brand_voice?: BrandVoice } | BrandVoice>('/api/me/funnel/brand-voice'),
      api<{ ok?: boolean; topics?: Topic[] } | Topic[]>('/api/me/funnel/topics'),
    ]);
    if (icpRes.status === 'fulfilled') {
      const v = icpRes.value;
      setIcp(Array.isArray(v) ? v : (v.profiles ?? v.icp ?? []));
    }
    if (voiceRes.status === 'fulfilled') {
      const v = voiceRes.value as { brand_voice?: BrandVoice } & Partial<BrandVoice>;
      setVoice(v.brand_voice ?? (('tone' in v) ? (v as BrandVoice) : null));
    }
    if (topicsRes.status === 'fulfilled') {
      const v = topicsRes.value;
      setTopics(Array.isArray(v) ? v : (v.topics ?? []));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>;

  return (
    <>
      <SectionHeader icon={Target} title={t('dashboards.funnel.audienceTitle')} sub={t('dashboards.funnel.audienceSub')} />

      {/* ICP per segment */}
      <section>
        <SectionHeader icon={Users} title={t('dashboards.funnel.icpTitle')} sub={t('dashboards.funnel.icpSub')} />
        {icp.length === 0 ? (
          <div className="card-premium p-8 text-center text-sm text-ink-400">{t('dashboards.funnel.noIcp')}</div>
        ) : (
          <div className="space-y-3">
            {icp.map((profile, i) => <IcpCard key={profile.segment} profile={profile} index={i} onRefresh={load} />)}
          </div>
        )}
      </section>

      {/* Brand voice */}
      <section>
        <SectionHeader icon={Sparkles} title={t('dashboards.funnel.brandVoiceTitle')} sub={t('dashboards.funnel.brandVoiceSub')} />
        <BrandVoiceCard voice={voice} onRefresh={load} />
      </section>

      {/* Topics */}
      <section>
        <SectionHeader icon={FileText} title={t('dashboards.funnel.topicsTitle')} sub={t('dashboards.funnel.topicsSub')} />
        <TopicsEditor topics={topics} onRefresh={load} />
      </section>
    </>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (next: string[]) => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  return (
    <div>
      <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1.5">{label}</div>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it} onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }} className="input-premium text-xs flex-1" />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-rose-300 hover:text-rose-200 p-1"><Trash2 size={12} /></button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={t('dashboards.funnel.addPlaceholder', { label })} className="input-premium text-xs flex-1"
            onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { e.preventDefault(); onChange([...items, draft.trim()]); setDraft(''); } }} />
          <button type="button" onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); } }} className="text-gold-300 hover:text-gold-200 p-1"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function IcpCard({ profile, index, onRefresh }: { profile: IcpProfile; index: number; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const [pains, setPains] = useState<string[]>(profile.pains || []);
  const [desires, setDesires] = useState<string[]>(profile.desires || []);
  const [objections, setObjections] = useState<string[]>(profile.objections || []);
  const [awareness, setAwareness] = useState(profile.awareness_default || '');
  const [langNotes, setLangNotes] = useState(profile.language_notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/me/funnel/icp/${profile.segment}`, {
        method: 'PATCH',
        body: JSON.stringify({ pains, desires, objections, awareness_default: awareness || null, language_notes: langNotes || null }),
      });
      toast.success(t('dashboards.funnel.audienceSaved'));
      setEdit(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-premium p-5 animate-fade-up" style={stagger(index, 40, 40)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-semibold text-white text-sm">{profile.label || profile.segment}</div>
        {!edit && <button onClick={() => setEdit(true)} className="text-xs text-ink-300 hover:text-gold-300 inline-flex items-center gap-1"><Edit3 size={11} /> {t('dashboards.funnel.edit')}</button>}
      </div>

      {edit ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <ListEditor label={t('dashboards.funnel.pains')} items={pains} onChange={setPains} />
            <ListEditor label={t('dashboards.funnel.desires')} items={desires} onChange={setDesires} />
            <ListEditor label={t('dashboards.funnel.objections')} items={objections} onChange={setObjections} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t('dashboards.funnel.awarenessDefault')}>
              <select value={awareness} onChange={e => setAwareness(e.target.value)} className="input-premium">
                <option value="">{t('dashboards.funnel.awarenessNone')}</option>
                {AWARENESS_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label={t('dashboards.funnel.langNotes')}>
              <input value={langNotes} onChange={e => setLangNotes(e.target.value)} className="input-premium" placeholder={t('dashboards.funnel.langNotesPlaceholder')} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={saving} onClick={save} className="btn-gold text-xs"><Check size={11} /> {t('dashboards.funnel.save')}</button>
            <button onClick={() => setEdit(false)} className="text-xs text-ink-400 hover:text-white px-2 py-1">{t('dashboards.funnel.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <PreviewList label={t('dashboards.funnel.pains')} items={profile.pains} />
          <PreviewList label={t('dashboards.funnel.desires')} items={profile.desires} />
          <PreviewList label={t('dashboards.funnel.objections')} items={profile.objections} />
          {(profile.awareness_default || profile.language_notes) && (
            <div className="sm:col-span-3 pt-2 border-t border-white/5 text-ink-400">
              {profile.awareness_default && <span>{t('dashboards.funnel.awarenessShort')} <span className="text-ink-200">{profile.awareness_default}</span></span>}
              {profile.language_notes && <span className="ml-3">{t('dashboards.funnel.languageShort')} <span className="text-ink-200">{profile.language_notes}</span></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1.5">{label}</div>
      {(!items || items.length === 0) ? (
        <p className="text-ink-400 italic">—</p>
      ) : (
        <ul className="space-y-1 list-disc list-inside text-ink-200">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      )}
    </div>
  );
}

function BrandVoiceCard({ voice, onRefresh }: { voice: BrandVoice | null; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const [tone, setTone] = useState(voice?.tone || '');
  const [dos, setDos] = useState<string[]>(voice?.dos || []);
  const [donts, setDonts] = useState<string[]>(voice?.donts || []);
  const [examples, setExamples] = useState<string[]>(voice?.examples || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTone(voice?.tone || '');
    setDos(voice?.dos || []);
    setDonts(voice?.donts || []);
    setExamples(voice?.examples || []);
  }, [voice]);

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/me/funnel/brand-voice', {
        method: 'PATCH',
        body: JSON.stringify({ tone: tone || null, dos, donts, examples }),
      });
      toast.success(t('dashboards.funnel.brandVoiceSaved'));
      setEdit(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-xs text-ink-300">{t('dashboards.funnel.tonality')}: <span className="text-white font-medium">{voice?.tone || '—'}</span></div>
        {!edit && <button onClick={() => setEdit(true)} className="text-xs text-ink-300 hover:text-gold-300 inline-flex items-center gap-1"><Edit3 size={11} /> {t('dashboards.funnel.edit')}</button>}
      </div>
      {edit ? (
        <div className="space-y-4">
          <Field label={t('dashboards.funnel.tonality')}>
            <input value={tone} onChange={e => setTone(e.target.value)} className="input-premium" placeholder={t('dashboards.funnel.tonalityPlaceholder')} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <ListEditor label={t('dashboards.funnel.dos')} items={dos} onChange={setDos} />
            <ListEditor label={t('dashboards.funnel.donts')} items={donts} onChange={setDonts} />
            <ListEditor label={t('dashboards.funnel.examples')} items={examples} onChange={setExamples} />
          </div>
          <div className="flex items-center gap-2">
            <button disabled={saving} onClick={save} className="btn-gold text-xs"><Check size={11} /> {t('dashboards.funnel.save')}</button>
            <button onClick={() => setEdit(false)} className="text-xs text-ink-400 hover:text-white px-2 py-1">{t('dashboards.funnel.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <PreviewList label={t('dashboards.funnel.dos')} items={voice?.dos || []} />
          <PreviewList label={t('dashboards.funnel.donts')} items={voice?.donts || []} />
          <PreviewList label={t('dashboards.funnel.examples')} items={voice?.examples || []} />
        </div>
      )}
    </div>
  );
}

function TopicsEditor({ topics, onRefresh }: { topics: Topic[]; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [segment, setSegment] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api('/api/me/funnel/topics', { method: 'POST', body: JSON.stringify({ title: title.trim(), segment: segment || null }) });
      toast.success(t('dashboards.funnel.topicAdded'));
      setTitle(''); setSegment(''); setShowAdd(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.addFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setShowAdd(s => !s)} className="btn-gold text-xs">
        {showAdd ? <><X size={12} /> {t('dashboards.funnel.cancel')}</> : <><Plus size={13} /> {t('dashboards.funnel.addTopic')}</>}
      </button>

      {showAdd && (
        <form onSubmit={add} className="card-premium p-4 space-y-3 animate-slide-up">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t('dashboards.funnel.topicTitle')}>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="input-premium" placeholder={t('dashboards.funnel.topicTitlePlaceholder')} />
            </Field>
            <Field label={t('dashboards.funnel.topicSegment')}>
              <select value={segment} onChange={e => setSegment(e.target.value)} className="input-premium">
                <option value="">{t('dashboards.funnel.segmentAll')}</option>
                {SEGMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <button disabled={busy || !title.trim()} className="btn-gold text-xs"><Plus size={13} /> {t('dashboards.funnel.add')}</button>
        </form>
      )}

      {topics.length === 0 ? (
        <div className="card-premium p-8 text-center text-sm text-ink-400">{t('dashboards.funnel.noTopics')}</div>
      ) : (
        <div className="space-y-2">
          {topics.map((t, i) => <TopicRow key={t.id} topic={t} index={i} onRefresh={onRefresh} />)}
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, index, onRefresh }: { topic: Topic; index: number; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [status, setStatus] = useState(topic.status);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api(`/api/me/funnel/topics/${topic.id}`, { method: 'PATCH', body: JSON.stringify({ title, status }) });
      toast.success(t('dashboards.funnel.topicSaved'));
      setEdit(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(t('dashboards.funnel.topicDeleteConfirm'))) return;
    setBusy(true);
    try {
      await api(`/api/me/funnel/topics/${topic.id}`, { method: 'DELETE' });
      toast.success(t('dashboards.funnel.topicDeleted'));
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.deleteFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-premium p-3 flex items-center gap-3 flex-wrap animate-fade-up" style={stagger(index, 25, 25)}>
      {edit ? (
        <>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-premium text-xs flex-1 min-w-[140px]" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-premium text-xs">
            <option value="active">{t('dashboards.funnel.statusActive')}</option>
            <option value="parked">{t('dashboards.funnel.statusParked')}</option>
            <option value="done">{t('dashboards.funnel.statusDone')}</option>
          </select>
          <button disabled={busy} onClick={save} className="btn-gold text-xs"><Check size={11} /></button>
          <button onClick={() => { setEdit(false); setTitle(topic.title); setStatus(topic.status); }} className="text-xs text-ink-400 hover:text-white px-2">{t('dashboards.funnel.cancel')}</button>
        </>
      ) : (
        <>
          <span className="text-sm text-white flex-1 min-w-0 truncate">{topic.title}</span>
          {topic.segment && <span className="badge">{topic.segment}</span>}
          <span className={`badge ${topic.status === 'active' ? 'badge-emerald' : topic.status === 'done' ? 'badge-gold' : ''}`}>{topic.status}</span>
          <button onClick={() => setEdit(true)} className="text-xs text-ink-300 hover:text-gold-300 p-1"><Edit3 size={12} /></button>
          <button disabled={busy} onClick={remove} className="text-xs text-rose-300 hover:text-rose-200 p-1"><Trash2 size={12} /></button>
        </>
      )}
    </div>
  );
}

function FilterChips({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{label}</span>
      {options.map(([id, lbl]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            value === id ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/10 text-ink-400 hover:text-white hover:border-white/20'
          }`}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

// ─── Referrals Section ─────────────────────────────────────────
function ReferralsSection({
  programs, stats, projectSlug, onRefresh
}: {
  programs: ReferralProgram[];
  stats: LeadFunnelData['referrals']['stats'];
  projectSlug: string;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ referrer_name: '', referrer_email: '', notes: '' });
  const program = programs[0]; // first active program for this project

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    setCreating(true);
    try {
      const res = await api<{ ok: boolean; code: ReferralCode }>(
        `/api/referrals/me/programs/${program.id}/codes`,
        { method: 'POST', body: JSON.stringify(form) }
      );
      toast.success(t('dashboards.funnel.codeCreated', { code: res.code.code, name: form.referrer_name }));
      setForm({ referrer_name: '', referrer_email: '', notes: '' });
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.codeCreateFailed'));
    } finally {
      setCreating(false);
    }
  };

  if (!program) {
    return (
      <div className="card-premium p-10 text-center">
        <Gift size={28} className="mx-auto text-ink-400 mb-3" />
        <p className="text-sm text-ink-300">{t('dashboards.funnel.noProgram')}</p>
        <p className="text-xs text-ink-400 mt-2">{t('dashboards.funnel.noProgramHint')}</p>
      </div>
    );
  }

  return (
    <>
      <SectionHeader icon={Gift} title={t('dashboards.funnel.referralProgram')} sub={program.name} />

      <div className="card-premium p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1">{t('dashboards.funnel.rewardReferrer')}</div>
            <p className="text-sm text-white">{program.referrer_reward_description}</p>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1">{t('dashboards.funnel.rewardReferee')}</div>
            <p className="text-sm text-white">{program.referee_reward_description}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-ink-400">
          <AlertCircle size={12} />
          <span>{t('dashboards.funnel.trigger')} <code className="text-gold-300">{program.trigger_event}</code> · {t('dashboards.funnel.status')} <span className="badge badge-emerald">{program.status}</span></span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard i={0} icon={Users} label={t('dashboards.funnel.activeCodes')} value={String(stats.codes)} accent={stats.codes > 0} />
        <KpiCard i={1} icon={Send} label={t('dashboards.funnel.referrals')} value={String(stats.referrals_total)} />
        <KpiCard i={2} icon={Award} label={t('dashboards.funnel.converted')} value={String(stats.referrals_converted)} highlight={stats.referrals_converted > 0} />
        <KpiCard i={3} icon={DollarSign} label={t('dashboards.funnel.rewardsPending')} value={`${Number(stats.rewards_pending_eur).toFixed(0)} €`} />
      </KpiGrid>

      {/* Create new code */}
      <section>
        <SectionHeader icon={Sparkles} title={t('dashboards.funnel.issueNewCode')} sub={t('dashboards.funnel.issueNewCodeSub')} />
        <form onSubmit={createCode} className="card-premium p-5 space-y-3 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t('dashboards.funnel.referrerName')}>
              <input required value={form.referrer_name} onChange={e => setForm({ ...form, referrer_name: e.target.value })} placeholder={t('dashboards.funnel.referrerNamePlaceholder')} className="input-premium" />
            </Field>
            <Field label={t('dashboards.funnel.emailOptional')}>
              <input type="email" value={form.referrer_email} onChange={e => setForm({ ...form, referrer_email: e.target.value })} placeholder={t('dashboards.funnel.emailPlaceholder')} className="input-premium" />
            </Field>
          </div>
          <Field label={t('dashboards.funnel.noteOptional')}>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('dashboards.funnel.notePlaceholder')} className="input-premium" />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.65rem] text-ink-400 flex-1">
              {t('dashboards.funnel.codeAutoHint1')}<code>NAME-XXXX</code>{t('dashboards.funnel.codeAutoHint2')}
            </p>
            <button disabled={creating || !form.referrer_name} className="btn-gold shrink-0 text-sm">
              {creating ? t('dashboards.funnel.creating') : <><Sparkles size={13} /> {t('dashboards.funnel.createCode')}</>}
            </button>
          </div>
        </form>
      </section>

      {/* List existing codes */}
      <section>
        <SectionHeader icon={Gift} title={t('dashboards.funnel.existingCodes')} sub={t('dashboards.funnel.codesCount', { count: stats.codes_list?.length || 0 })} />
        {(!stats.codes_list || stats.codes_list.length === 0) ? (
          <div className="card-premium p-8 text-center text-sm text-ink-400">
            {t('dashboards.funnel.noCodes')}
          </div>
        ) : (
          <div className="space-y-2">
            {stats.codes_list.map((c, i) => (
              <div key={c.id} className="card-premium p-4 flex items-center justify-between gap-4 flex-wrap animate-fade-up" style={stagger(i, 30, 30)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-gold-200 font-mono text-sm">{c.code}</code>
                    {!c.active && <span className="badge badge-rose">{t('dashboards.funnel.inactive')}</span>}
                  </div>
                  <div className="text-xs text-ink-400 mt-1">
                    {t('dashboards.funnel.codeUses', { name: c.referrer_name || '—', uses: c.uses_count, closed: c.closed_won_count })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gold-200">{Number(c.total_reward_earned_eur).toFixed(0)} €</div>
                  <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{t('dashboards.funnel.earnedSoFar')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Public landing-page link */}
      <section>
        <SectionHeader icon={ExternalLink} title={t('dashboards.funnel.publicSharing')} sub={t('dashboards.funnel.publicSharingSub')} />
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 text-sm">
            <code className="text-gold-300 break-all">https://patrick-roth-thailand.vercel.app/empfehlung?code=&#123;CODE&#125;</code>
          </div>
          <p className="text-xs text-ink-400 mt-2">
            {t('dashboards.funnel.landingHint')}
          </p>
        </div>
      </section>
    </>
  );
}

// ─── Reusable Sub-Components ───────────────────────────────────
function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--dashboard-gap)] items-stretch">{children}</div>;
}

function KpiCard({
  i, icon: Icon, label, value, accent, highlight
}: {
  i: number;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="card-premium card-compact animate-fade-up h-full flex flex-col" style={stagger(i, 60, 60)}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={accent ? 'text-gold-300' : 'text-ink-400'} strokeWidth={1.8} />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{label}</span>
      </div>
      <div className={`mt-auto text-xl sm:text-2xl xl:text-2xl font-bold tracking-tight ${highlight ? 'text-gold-gradient' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-gold-300" />
      <h2 className="text-xs font-semibold text-ink-100 uppercase tracking-wider">{title}</h2>
      {sub && <span className="text-xs text-ink-400 normal-case font-normal">— {sub}</span>}
    </div>
  );
}

function ProgressCard({
  label, current, targetLabel, pct, muted
}: {
  label: string;
  current: number | null;
  targetLabel: string;
  pct: number | null;
  muted?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="card-premium p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-ink-200">{label}</span>
        <span className="text-xs text-ink-400">{t('dashboards.funnel.target', { target: targetLabel })}</span>
      </div>
      {pct !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-2xl font-bold text-white">{current ?? '—'}</span>
            <span className="text-xs text-ink-400">({pct}%)</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${pct >= 80 ? 'bg-emerald-400/80' : pct >= 40 ? 'bg-gold-400/70' : 'bg-rose-400/60'}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-xs text-ink-400 italic mt-1">{muted || t('dashboards.funnel.comingSoonDefault')}</p>
      )}
    </div>
  );
}

function ComingSoonCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  const { t } = useTranslation();
  return (
    <div className="card-premium p-5 opacity-80 border border-white/5 bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-ink-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span className="badge">{t('dashboards.funnel.comingSoonBadge')}</span>
          </div>
          <p className="text-xs text-ink-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-ink-200">{label}</span>
      {children}
    </label>
  );
}
