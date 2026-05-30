// Lead-Funnel Dashboard — Patrick monitoring view
// 5 Sektionen: Metrics · Leads · Spend · Content · Referrals
// Data: /api/me/projects/:slug/lead-funnel (aggregated endpoint)

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, TrendingUp, Users, DollarSign, FileText, Gift,
  ChevronRight, Sparkles, Award, AlertCircle, ExternalLink,
  Mail, Phone, Send, Upload, Play, Check, Pause, X, Edit3
} from 'lucide-react';
import { api, getAccessToken } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { stagger } from '@/lib/animations';
import { toast } from 'sonner';
import { BarChart, DonutChart } from '@tremor/react';

type Tab = 'metrics' | 'leads' | 'akquise' | 'spend' | 'content' | 'referrals';

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

const TIER_LABEL: Record<string, string> = {
  A: 'A-Lead (Hot)', B: 'B-Lead (Warm)', C: 'C-Lead (Cool)', D: 'D-Lead (Cold)', unscored: 'Unscored'
};
const TIER_BADGE: Record<string, string> = {
  A: 'badge-gold', B: 'badge-emerald', C: 'badge', D: 'badge', unscored: 'badge'
};
const STATUS_LABEL: Record<string, string> = {
  new: 'Neu', contacted: 'Kontaktiert', qualified: 'Qualifiziert',
  meeting_booked: 'Termin gebucht', proposal_sent: 'Angebot raus',
  closed_won: 'Gewonnen', closed_lost: 'Verloren', nurturing: 'Nurturing'
};

type Tab = 'metrics' | 'leads' | 'akquise' | 'spend' | 'content' | 'referrals';

export default function LeadFunnel({ projectSlug, projectName }: { projectSlug: string; projectName: string }) {
  const [tab, setTab] = useState<Tab>('metrics');
  const [data, setData] = useState<LeadFunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api<LeadFunnelData>(`/api/me/projects/${projectSlug}/lead-funnel`);
      setData(d);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lead-Funnel Daten laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectSlug]);

  if (loading) return <div className="card-premium p-16 flex justify-center"><Spinner size="md" /></div>;
  if (!data) return <div className="card-premium p-10 text-center text-sm text-ink-400">Keine Daten verfügbar.</div>;

  return (
    <div className="dashboard-stack @container">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> Lead-Engine
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Lead Funnel</h1>
            <p className="text-ink-400 mt-1 text-sm">{projectName}  ·  Monitoring + Steuerung deiner gesamten Lead-Engine</p>
          </div>
          <button onClick={load} className="text-xs text-ink-400 hover:text-gold-300 px-3 py-2 rounded-md hover:bg-white/5 transition">
            <Activity size={12} className="inline mr-1.5" />
            Aktualisieren
          </button>
        </div>
      </header>

      {/* Sub-Tab Navigation */}
      <nav className="flex gap-1 border-b border-white/5 -mb-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'metrics' as const,   label: 'Metriken',  icon: TrendingUp },
          { id: 'leads' as const,     label: 'Leads',     icon: Users },
          { id: 'akquise' as const,   label: 'Akquise',   icon: Upload },
          { id: 'spend' as const,     label: 'Spend',     icon: DollarSign },
          { id: 'content' as const,   label: 'Content',   icon: FileText },
          { id: 'referrals' as const, label: 'Referrals', icon: Gift }
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
      {tab === 'leads' && <LeadsSection leads={data.leads} />}
      {tab === 'akquise' && <AkquiseSection onRefresh={load} />}
      {tab === 'spend' && <SpendSection spend={data.spend} />}
      {tab === 'content' && <ContentSection content={data.content} />}
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
  const aLeads = metrics.by_tier.A || 0;
  const targetMin = parseInt(String(metrics.target_leads_per_month).split('-')[0] || '15', 10);
  const targetAMin = parseInt(String(metrics.target_a_leads_per_month).split('-')[0] || '3', 10);
  const leadsTrack = Math.min(100, Math.round((metrics.leads_30d / targetMin) * 100));
  const aLeadsTrack = Math.min(100, Math.round((aLeads / targetAMin) * 100));

  return (
    <>
      <KpiGrid>
        <KpiCard i={0} icon={Users} label="Leads (Total)" value={String(metrics.leads_total)} accent />
        <KpiCard i={1} icon={TrendingUp} label="Leads (30d)" value={`${metrics.leads_30d} / ${metrics.target_leads_per_month}`} highlight={metrics.leads_30d >= targetMin} />
        <KpiCard i={2} icon={Activity} label="Leads (7d)" value={String(metrics.leads_7d)} />
        <KpiCard i={3} icon={Award} label="A-Leads" value={`${aLeads} / ${metrics.target_a_leads_per_month}`} highlight={aLeads >= targetAMin} />
      </KpiGrid>

      <section>
        <SectionHeader icon={TrendingUp} title="Target vs. Actual (90 Tage)" sub="aus project.marketing_thesis.targets_90d" />
        <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)]">
          <ProgressCard label="Leads pro Monat" current={metrics.leads_30d} targetLabel={metrics.target_leads_per_month} pct={leadsTrack} />
          <ProgressCard label="A-Leads pro Monat" current={aLeads} targetLabel={metrics.target_a_leads_per_month} pct={aLeadsTrack} />
          <ProgressCard label="CPL (€ max)" current={null} targetLabel={`< ${metrics.target_cpl_max_eur} €`} pct={null} muted="Coming Soon — Ads-Integration" />
          <ProgressCard label="LinkedIn SSI" current={null} targetLabel={`${metrics.target_ssi_min}+`} pct={null} muted="Manuell — Patrick Weekly Report" />
          <ProgressCard label="Newsletter Subs" current={0} targetLabel={`${metrics.target_newsletter_subs}+`} pct={0} muted="Brevo nicht verknüpft" />
          <ProgressCard label="Gespräche/Woche" current={null} targetLabel={`${metrics.target_conversations_per_week}+`} pct={null} muted="Manuell — Patrick Weekly Report" />
        </div>
      </section>

      <section>
        <SectionHeader icon={Users} title="Lead-Tier-Verteilung" sub={`${leadsCount} Leads gesamt`} />
        <div className="card-premium p-4 sm:p-5 grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Tremor BarChart — Tier-Verteilung */}
          <BarChart
            className="h-56 w-full"
            data={['A','B','C','D','unscored'].map((t) => ({
              tier: TIER_LABEL[t],
              Leads: metrics.by_tier[t] || 0,
            }))}
            index="tier"
            categories={['Leads']}
            colors={['amber']}
            yAxisWidth={36}
            showLegend={false}
          />
          {/* Tremor DonutChart — Tier-Anteil */}
          <DonutChart
            className="h-56 w-full"
            data={['A','B','C','D','unscored']
              .map((t) => ({ name: TIER_LABEL[t], value: metrics.by_tier[t] || 0 }))
              .filter((d) => d.value > 0)}
            category="value"
            index="name"
            colors={['amber','yellow','orange','rose','slate']}
            variant="donut"
          />
        </div>
      </section>

      <section>
        <SectionHeader icon={Activity} title="Pipeline-Status" sub="Lead-Lifecycle Verteilung" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[var(--dashboard-gap)]">
          {Object.entries(metrics.by_status).map(([s, n], i) => (
            <div key={s} className="card-premium card-compact animate-fade-up" style={stagger(i, 40, 40)}>
              <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{STATUS_LABEL[s] || s}</div>
              <div className="text-2xl font-bold text-white mt-1">{n}</div>
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
  const [campaigns, setCampaigns] = useState<AkquiseCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadCampaigns = async () => {
    try {
      const r = await api<{ ok: boolean; campaigns: AkquiseCampaign[] }>('/api/factories/lead-scraper/campaigns');
      setCampaigns(r.campaigns || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Campaigns laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, []);

  if (loading) return <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>;

  return (
    <>
      <SectionHeader icon={Upload} title="Akquise (Cold-Email-Funnel)" sub="Bestehende Lead-Listen hochladen, AI-Pitches in deinem Brandtone, Email-Versand via AEVUM" />

      {/* Pro-Hinweis + Upload-Toggle */}
      <div className="card-premium p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-gold-300" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">So funktioniert der Email-Flow</div>
            <ol className="text-xs text-ink-300 mt-2 space-y-1 list-decimal list-inside leading-relaxed">
              <li>CSV mit Lead-Liste hochladen (Pflicht-Spalte: <code className="text-gold-200">owner_email</code>)</li>
              <li>AI generiert 3 Pitch-Varianten pro Lead in deinem Brandtone (12 Credits/Lead)</li>
              <li>Jeden Pitch reviewen + approven (oder editieren)</li>
              <li>Approved-Leads → Resend versendet personalisiert via deine AEVUM-Email-Adresse</li>
              <li>Tracking aller Status-Changes (sent/opened/replied) im selben Dashboard</li>
            </ol>
          </div>
        </div>
        <button onClick={() => setShowUpload(s => !s)} className="btn-gold text-sm">
          {showUpload ? <><X size={13} /> Abbrechen</> : <><Upload size={13} /> Neue Campaign starten</>}
        </button>
      </div>

      {showUpload && <UploadCampaignForm onCreated={() => { loadCampaigns(); setShowUpload(false); }} />}

      {/* Campaign-Liste */}
      <section>
        <SectionHeader icon={Send} title="Deine Campaigns" sub={`${campaigns.length} insgesamt`} />
        {campaigns.length === 0 ? (
          <div className="card-premium p-10 text-center">
            <Send size={28} className="mx-auto text-ink-400 mb-3" />
            <p className="text-sm text-ink-400">Noch keine Campaign gestartet.</p>
            <p className="text-xs text-ink-400 mt-2">Klick oben „Neue Campaign starten" um deine erste Lead-Liste zu uploaden.</p>
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
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Bitte CSV-Datei wählen'); return; }
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
        toast.error(data.error || 'Upload fehlgeschlagen');
      } else {
        toast.success(`Campaign erstellt — ${data.leads_imported} Leads importiert${data.skipped ? `, ${data.skipped} übersprungen` : ''}`);
        setName(''); setFile(null);
        onCreated();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-premium p-5 space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Upload size={14} className="text-gold-300" />
        <h3 className="text-xs font-semibold text-ink-100 uppercase tracking-wider">Neue Campaign</h3>
      </div>

      <Field label="Campaign-Name (z.B. Apollo-Rentner-2026-05-26)">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Apollo-Segment1-2026-05-26" className="input-premium" />
      </Field>

      <Field label="CSV-Datei (Pflicht-Spalten: owner_email)">
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
          Erkannte Spalten: <code>company_name</code>, <code>company_domain</code>, <code>owner_name</code>, <code className="text-gold-200">owner_email (Pflicht)</code>, <code>owner_linkedin_url</code>
        </p>
      </Field>

      <button disabled={uploading || !name || !file} className="btn-gold text-sm">
        {uploading ? <>Lade hoch…</> : <><Upload size={13} /> CSV hochladen + Campaign erstellen</>}
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
  const [leads, setLeads] = useState<AkquiseLeadDetail[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [actionRunning, setActionRunning] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    setLoadingLeads(true);
    api<{ ok: boolean; leads: AkquiseLeadDetail[] }>(`/api/factories/lead-scraper/campaigns/${campaign.id}`)
      .then(r => setLeads(r.leads || []))
      .catch(e => toast.error(e instanceof Error ? e.message : 'Leads laden fehlgeschlagen'))
      .finally(() => setLoadingLeads(false));
  }, [expanded, campaign.id, campaign.status]);

  const generatePitches = async () => {
    setActionRunning('generate');
    try {
      const r = await api<{ ok: boolean; leads_to_generate: number; credits_spent: number; estimated_duration_sec: number }>(
        `/api/factories/lead-scraper/campaigns/${campaign.id}/generate`, { method: 'POST' }
      );
      toast.success(`Generiere ${r.leads_to_generate} Pitches (${r.credits_spent} Credits, ~${r.estimated_duration_sec}s)`);
      setTimeout(onAction, 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generierung fehlgeschlagen');
    } finally {
      setActionRunning(null);
    }
  };

  const sendApproved = async () => {
    if (!confirm('Alle approved Leads jetzt per Email versenden?')) return;
    setActionRunning('send');
    try {
      const r = await api<{ ok: boolean; scheduled: number }>(`/api/factories/lead-scraper/campaigns/${campaign.id}/send`, { method: 'POST' });
      toast.success(`${r.scheduled} Emails geschedulet — Versand läuft`);
      setTimeout(onAction, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Versand fehlgeschlagen');
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
                    {actionRunning === 'generate' ? 'Läuft…' : <><Sparkles size={12} /> Pitches generieren ({pendingCount} × 12 Credits = {pendingCount * 12})</>}
                  </button>
                )}
                {approvedCount > 0 && (
                  <button onClick={sendApproved} disabled={actionRunning === 'send'} className="btn-gold text-xs">
                    {actionRunning === 'send' ? 'Sende…' : <><Send size={12} /> {approvedCount} Approved Email versenden</>}
                  </button>
                )}
                <div className="text-xs text-ink-400 ml-auto">
                  pending: {pendingCount} · generiert: {generatedCount} · approved: {approvedCount} · gesendet: {sentCount}
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
      toast.success('Lead approved');
      setEditing(false);
      onAction();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Approve fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    setSaving(true);
    try {
      await api(`/api/factories/lead-scraper/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ outreach_status: 'failed' }) });
      toast.success('Lead übersprungen');
      onAction();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Fehler');
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
                  Variante {i + 1} <span className="opacity-60">({v.tone})</span>
                </button>
              ))}
            </div>
          )}

          {editing ? (
            <div className="space-y-2">
              <input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Subject" className="input-premium text-xs" />
              <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={5} className="input-premium text-xs resize-none" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">Subject</div>
              <div className="text-sm text-white">{variants[selectedIdx]?.subject || lead.outreach_message_subject}</div>
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mt-2">Body</div>
              <div className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">{variants[selectedIdx]?.body || lead.outreach_message}</div>
            </div>
          )}

          {lead.outreach_status !== 'sent' && lead.outreach_status !== 'failed' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {editing ? (
                <>
                  <button onClick={approve} disabled={saving} className="btn-gold text-xs"><Check size={11} /> Speichern + Approve</button>
                  <button onClick={() => { setEditing(false); setEditBody(variants[selectedIdx]?.body || ''); setEditSubject(variants[selectedIdx]?.subject || ''); }} className="text-xs text-ink-400 hover:text-white px-2 py-1">Abbrechen</button>
                </>
              ) : (
                <>
                  <button onClick={approve} disabled={saving || lead.outreach_status === 'approved'} className="btn-gold text-xs">
                    <Check size={11} /> {lead.outreach_status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button onClick={() => { setEditing(true); setEditBody(variants[selectedIdx]?.body || ''); setEditSubject(variants[selectedIdx]?.subject || ''); }} className="text-xs text-ink-300 hover:text-gold-300 px-2 py-1 inline-flex items-center gap-1">
                    <Edit3 size={10} /> Editieren
                  </button>
                  <button onClick={reject} disabled={saving} className="text-xs text-rose-300 hover:text-rose-200 px-2 py-1 ml-auto inline-flex items-center gap-1">
                    <X size={10} /> Skip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!hasPitch && lead.outreach_status === 'pending' && (
        <div className="mt-2 text-xs text-ink-400 italic">Wartet auf Pitch-Generation</div>
      )}
    </div>
  );
}

function LeadsSection({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<'all' | 'A' | 'B' | 'new' | 'qualified'>('all');
  const filtered = useMemo(() => {
    if (filter === 'all') return leads;
    if (filter === 'A' || filter === 'B') return leads.filter(l => l.lead_tier === filter);
    return leads.filter(l => l.status === filter);
  }, [leads, filter]);

  return (
    <>
      <SectionHeader icon={Users} title="Leads" sub={`${leads.length} Leads — letzte 50, neueste zuerst`} />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all' as const, label: 'Alle' },
          { id: 'A' as const, label: 'A-Leads' },
          { id: 'B' as const, label: 'B-Leads' },
          { id: 'new' as const, label: 'Status: Neu' },
          { id: 'qualified' as const, label: 'Status: Qualifiziert' }
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
          <p className="text-sm text-ink-400">Keine Leads in dieser Auswahl.</p>
          <p className="text-xs text-ink-400 mt-2">
            Sobald Apollo-Cold-Outreach + LinkedIn Sales Nav laufen, erscheinen hier neue Leads automatisch.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l, i) => (
            <div key={l.id} className="card-premium p-4 animate-fade-up" style={stagger(i, 30, 30)}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{l.name || l.email}</span>
                    {l.lead_tier && (
                      <span className={`badge ${TIER_BADGE[l.lead_tier] || 'badge'}`}>
                        {l.lead_tier}{l.score_total !== null ? ` · ${l.score_total}P` : ''}
                      </span>
                    )}
                    <span className="badge">{STATUS_LABEL[l.status] || l.status}</span>
                    {l.referral_code && (
                      <span className="badge badge-emerald">
                        <Gift size={10} className="inline mr-1" />
                        {l.referral_code}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-400 mt-1.5 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Mail size={11} /> {l.email}</span>
                    {l.phone && <span className="inline-flex items-center gap-1"><Phone size={11} /> {l.phone}</span>}
                    {l.source && (
                      <span>· Quelle: <span className="text-ink-200">{l.source}{l.source_detail ? `/${l.source_detail}` : ''}</span></span>
                    )}
                    <span>· {new Date(l.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                  </div>
                  {l.notes && <p className="text-xs text-ink-300 mt-2 italic">„{l.notes}"</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Spend Section ─────────────────────────────────────────────
function SpendSection({ spend }: { spend: LeadFunnelData['spend'] }) {
  return (
    <>
      <SectionHeader icon={DollarSign} title="Spend & Budget" sub="Cold-Outreach Tools + (Ads coming)" />

      <KpiGrid>
        <KpiCard i={0} icon={Send} label="Apollo-Campaigns" value={String(spend.cold_outreach.apollo_campaigns)} />
        <KpiCard i={1} icon={Activity} label="Aktiv" value={String(spend.cold_outreach.apollo_campaigns_active)} accent={spend.cold_outreach.apollo_campaigns_active > 0} />
        <KpiCard i={2} icon={DollarSign} label="Ad-Budget (Ziel/Mo)" value={`${spend.targets.monthly_ad_budget_eur} €`} />
        <KpiCard i={3} icon={DollarSign} label="Tools (Ziel/Mo)" value={`${spend.targets.monthly_tools_budget_eur} €`} />
      </KpiGrid>

      <section>
        <SectionHeader icon={Send} title="Apollo Cold-Outreach Campaigns" sub="via Lead-Scraper-Factory" />
        {spend.cold_outreach.recent_campaigns.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <Send size={24} className="mx-auto text-ink-400 mb-3" />
            <p className="text-sm text-ink-300">Noch keine Campaign gestartet.</p>
            <p className="text-xs text-ink-400 mt-2 max-w-md mx-auto">
              Setup-Anleitung: <code className="text-gold-300">SETUP-APOLLO-SALESNAV.md</code> ·
              Erste Campaign: Apollo-CSV exportieren → Lead-Scraper-Factory uploaden.
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
        title="Meta Ads · LinkedIn Ads · Google Ads"
        body="Ads-Spend-Tracking & Campaign-Setup ist Teil von Lead-Engine Phase B7+B8 (siehe Architektur-Spec). Sobald Patrick FB-Page + Meta-Business-Verifizierung abgeschlossen hat, integrieren wir Real-Time Spend-/CPL-/ROAS-Pulls."
      />
    </>
  );
}

// ─── Content Section ───────────────────────────────────────────
function ContentSection({ content }: { content: LeadFunnelData['content'] }) {
  return (
    <>
      <SectionHeader icon={FileText} title="Content Pipeline" sub="Posts-Scheduler (LinkedIn + Facebook)" />

      <KpiGrid>
        <KpiCard i={0} icon={FileText} label="Veröffentlicht (30d)" value={String(content.posts_published_30d)} />
        <KpiCard i={1} icon={Activity} label="Geplant" value={String(content.posts_scheduled)} />
        <KpiCard i={2} icon={ChevronRight} label="Drafts" value={String(content.posts_drafts)} />
        <KpiCard i={3} icon={TrendingUp} label="Pillars aktiv" value={String(content.planned_pillars.length)} />
      </KpiGrid>

      <section>
        <SectionHeader icon={FileText} title="Content-Pillars (geplant)" sub="aus LINKEDIN-STRATEGIE-MASTER" />
        <div className="grid sm:grid-cols-2 gap-[var(--dashboard-gap)]">
          {content.planned_pillars.map((p, i) => (
            <div key={p.id} className="card-premium p-4 animate-fade-up opacity-70" style={stagger(i, 40, 40)}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm">{p.label}</span>
                <span className="badge">{p.frequency_per_week}×/Wo</span>
              </div>
              <div className="text-xs text-ink-400">Pillar-ID: <code>{p.id}</code></div>
            </div>
          ))}
        </div>
      </section>

      <ComingSoonCard
        icon={FileText}
        title="Posts-Scheduler & Auto-Drafts"
        body="LLM-Drafts in Patrick-Voice, Schedule-Rules, Approval-Flow via Thailand-RE-Bot (/posts, /approve) + Auto-Publish via LinkedIn & Meta Graph APIs. Wird in Lead-Engine Phase B3+B4+B6 implementiert."
      />
    </>
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
      toast.success(`Code ${res.code.code} für ${form.referrer_name} erstellt`);
      setForm({ referrer_name: '', referrer_email: '', notes: '' });
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Code-Erstellung fehlgeschlagen');
    } finally {
      setCreating(false);
    }
  };

  if (!program) {
    return (
      <div className="card-premium p-10 text-center">
        <Gift size={28} className="mx-auto text-ink-400 mb-3" />
        <p className="text-sm text-ink-300">Kein Referral-Programm aktiv.</p>
        <p className="text-xs text-ink-400 mt-2">Carlos kann ein neues Programm via Admin-API anlegen.</p>
      </div>
    );
  }

  return (
    <>
      <SectionHeader icon={Gift} title="Referral-Programm" sub={program.name} />

      <div className="card-premium p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1">Belohnung für Referrer</div>
            <p className="text-sm text-white">{program.referrer_reward_description}</p>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold mb-1">Belohnung für neuen Kunden</div>
            <p className="text-sm text-white">{program.referee_reward_description}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-ink-400">
          <AlertCircle size={12} />
          <span>Trigger: <code className="text-gold-300">{program.trigger_event}</code> · Status: <span className="badge badge-emerald">{program.status}</span></span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard i={0} icon={Users} label="Aktive Codes" value={String(stats.codes)} accent={stats.codes > 0} />
        <KpiCard i={1} icon={Send} label="Empfehlungen" value={String(stats.referrals_total)} />
        <KpiCard i={2} icon={Award} label="Konvertiert" value={String(stats.referrals_converted)} highlight={stats.referrals_converted > 0} />
        <KpiCard i={3} icon={DollarSign} label="Ausstehende Belohnung" value={`${Number(stats.rewards_pending_eur).toFixed(0)} €`} />
      </KpiGrid>

      {/* Create new code */}
      <section>
        <SectionHeader icon={Sparkles} title="Neuen Referral-Code ausstellen" sub="Jeder Code ist personalisiert + trackt seine Referrals" />
        <form onSubmit={createCode} className="card-premium p-5 space-y-3 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name des Empfehlenden *">
              <input required value={form.referrer_name} onChange={e => setForm({ ...form, referrer_name: e.target.value })} placeholder="Hans Müller" className="input-premium" />
            </Field>
            <Field label="Email (optional)">
              <input type="email" value={form.referrer_email} onChange={e => setForm({ ...form, referrer_email: e.target.value })} placeholder="hans@example.com" className="input-premium" />
            </Field>
          </div>
          <Field label="Notiz (optional)">
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Bestandskunde aus Pilot · met Aug 2026" className="input-premium" />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.65rem] text-ink-400 flex-1">
              Code wird automatisch generiert (Format: <code>NAME-XXXX</code>) · single-use Empfehlung mit Reward-Tracking
            </p>
            <button disabled={creating || !form.referrer_name} className="btn-gold shrink-0 text-sm">
              {creating ? 'Erstelle…' : <><Sparkles size={13} /> Code erstellen</>}
            </button>
          </div>
        </form>
      </section>

      {/* List existing codes */}
      <section>
        <SectionHeader icon={Gift} title="Bestehende Codes" sub={`${stats.codes_list?.length || 0} Codes`} />
        {(!stats.codes_list || stats.codes_list.length === 0) ? (
          <div className="card-premium p-8 text-center text-sm text-ink-400">
            Noch keine Codes vergeben.
          </div>
        ) : (
          <div className="space-y-2">
            {stats.codes_list.map((c, i) => (
              <div key={c.id} className="card-premium p-4 flex items-center justify-between gap-4 flex-wrap animate-fade-up" style={stagger(i, 30, 30)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-gold-200 font-mono text-sm">{c.code}</code>
                    {!c.active && <span className="badge badge-rose">inaktiv</span>}
                  </div>
                  <div className="text-xs text-ink-400 mt-1">
                    {c.referrer_name || '—'} · Uses: {c.uses_count} · Geschlossen: {c.closed_won_count}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gold-200">{Number(c.total_reward_earned_eur).toFixed(0)} €</div>
                  <div className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">Bisher verdient</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Public landing-page link */}
      <section>
        <SectionHeader icon={ExternalLink} title="Public Sharing" sub="Code-Inhaber teilen diesen Link" />
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 text-sm">
            <code className="text-gold-300 break-all">https://patrick-roth-thailand.vercel.app/empfehlung?code=&#123;CODE&#125;</code>
          </div>
          <p className="text-xs text-ink-400 mt-2">
            Landing-Page auf Patrick's Website (kommt mit nächstem Polish-Push). Code wird automatisch im Lead-Form vorausgefüllt.
          </p>
        </div>
      </section>
    </>
  );
}

// ─── Reusable Sub-Components ───────────────────────────────────
function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--dashboard-gap)]">{children}</div>;
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
    <div className="card-premium card-compact animate-fade-up" style={stagger(i, 60, 60)}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={accent ? 'text-gold-300' : 'text-ink-400'} strokeWidth={1.8} />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{label}</span>
      </div>
      <div className={`text-xl sm:text-2xl xl:text-2xl font-bold tracking-tight ${highlight ? 'text-gold-gradient' : 'text-white'}`}>
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
  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-ink-200">{label}</span>
        <span className="text-xs text-ink-400">Ziel: {targetLabel}</span>
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
        <p className="text-xs text-ink-400 italic mt-1">{muted || 'Coming Soon'}</p>
      )}
    </div>
  );
}

function ComingSoonCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="card-premium p-5 opacity-80 border border-white/5 bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-ink-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span className="badge">Coming Soon</span>
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
