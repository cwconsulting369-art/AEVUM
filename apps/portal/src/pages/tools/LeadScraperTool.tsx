// Lead-Scraper-Factory Tool — Wave I5 Phase-1
// Backend: /api/factories/lead-scraper/{campaigns, campaigns/:id, .../generate, .../send, leads/:id}
//
// 4-Step Wizard:
//   1. Campaign-Setup     — name + CSV upload
//   2. Brandtone           — pick knowledge-hub (default aevum-brandtone)
//   3. Generate            — confirm cost, trigger LLM pitch-generation
//   4. Review              — approve/edit pitches per lead, send all approved

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/lib/auth';
import { api, getAccessToken } from '@/lib/api';
import {
  Users, ArrowLeft, ArrowRight, Loader2, AlertCircle, Sparkles, Coins,
  Upload, CheckCircle2, RotateCcw, Mail, Send, Edit3, FileText, ChevronLeft
} from 'lucide-react';
import Spinner from '@/components/Spinner';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';

const CREDITS_PER_LEAD = 12;
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
const API_BASE = import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';

interface KnowledgeHub {
  id: string;
  slug: string;
  name: string;
  description?: string;
  is_public: boolean;
  owner_account_id?: string | null;
  associated_use_cases?: string[];
}

interface PitchVariant {
  subject?: string;
  body?: string;
  tone?: string;
  hook_angle?: string;
}

interface Lead {
  id: string;
  campaign_id: string;
  company_name?: string | null;
  company_domain?: string | null;
  owner_name?: string | null;
  owner_email: string;
  owner_linkedin_url?: string | null;
  pitch_variants?: PitchVariant[];
  pitch_selected_index?: number | null;
  outreach_status: 'pending' | 'generated' | 'approved' | 'sent' | 'opened' | 'replied' | 'converted' | 'bounced' | 'unsubscribed' | 'failed';
  outreach_message?: string | null;
  outreach_message_subject?: string | null;
  outreach_sent_at?: string | null;
  credits_spent?: number;
}

interface Campaign {
  id: string;
  name: string;
  brandtone_hub_id?: string | null;
  source_csv_filename?: string;
  status: 'draft' | 'generating' | 'ready_to_send' | 'sending' | 'complete' | 'paused';
  created_at: string;
}

type Step = 'setup' | 'brandtone' | 'generate' | 'review';

export default function LeadScraperTool() {
  const { me } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (me && me.account.account_type === 'shop') {
      nav('/dashboard', { replace: true });
    }
  }, [me, nav]);

  const [step, setStep] = useState<Step>('setup');
  const [hubs, setHubs] = useState<KnowledgeHub[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Setup state
  const [campaignName, setCampaignName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  // Active campaign + leads
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ subject: string; body: string }>({ subject: '', body: '' });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ── Init ─────────────────────────────────────────
  useEffect(() => {
    api<{ ok: boolean; hubs: KnowledgeHub[] }>('/api/factories/script/knowledge-hubs')
      .then(r => {
        const list = r.hubs || [];
        setHubs(list);
        // Auto-pick aevum-brandtone if present
        const aev = list.find(h => h.slug === 'aevum-brandtone');
        if (aev) setSelectedHubId(aev.id);
      })
      .catch(() => setHubs([]));
    api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
      .then(r => setCredits(r.credits?.balance ?? null))
      .catch(() => setCredits(null));
    api<{ ok: boolean; campaigns: Campaign[] }>('/api/factories/lead-scraper/campaigns')
      .then(r => setCampaigns(r.campaigns || []))
      .catch(() => setCampaigns([]));
  }, []);

  // ── Toast auto-dismiss ───────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── CSV preview ──────────────────────────────────
  const handleFile = (f: File | null) => {
    setCsvFile(f);
    setCsvPreview([]);
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('CSV groesser als 5 MB — bitte aufteilen.');
      setCsvFile(null);
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result || '');
      const lines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 6);
      const rows = lines.map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
      setCsvPreview(rows);
    };
    r.readAsText(f);
  };

  // ── Poll campaign-state during generating/sending ──
  useEffect(() => {
    if (!activeCampaign) return;
    if (!['generating', 'sending'].includes(activeCampaign.status)) return;
    const start = Date.now();
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        setError('Generierung dauert ungewoehnlich lang — bitte spaeter prueffen.');
        return;
      }
      try {
        const r = await api<{ ok: boolean; campaign: Campaign; leads: Lead[] }>(
          `/api/factories/lead-scraper/campaigns/${activeCampaign.id}`
        );
        if (cancelled) return;
        setActiveCampaign(r.campaign);
        setLeads(r.leads || []);
        if (!['generating', 'sending'].includes(r.campaign.status)) return;
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Polling-Fehler');
      }
    };
    const t = setTimeout(tick, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearTimeout(t); };
  }, [activeCampaign?.id, activeCampaign?.status]);

  // ── Step 1 → 2: upload + create campaign ─────────
  const handleCreateCampaign = async () => {
    setError(null);
    if (!campaignName.trim()) { setError('Campaign-Name fehlt.'); return; }
    if (!csvFile) { setError('CSV-Datei fehlt.'); return; }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('name', campaignName.trim());
      if (selectedHubId) form.append('brandtone_hub_id', selectedHubId);
      form.append('csv', csvFile);

      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/api/factories/lead-scraper/campaigns`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      // Fetch campaign + leads
      const det = await api<{ ok: boolean; campaign: Campaign; leads: Lead[] }>(
        `/api/factories/lead-scraper/campaigns/${data.campaign_id}`
      );
      setActiveCampaign(det.campaign);
      setLeads(det.leads || []);
      setStep('generate');
      setToast(`${data.leads_imported} Leads importiert${data.skipped ? ` (${data.skipped} skipped)` : ''}`);
    } catch (e: any) {
      setError(e?.message || 'Upload-Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 3: trigger generation ────────────────────
  const handleGenerate = async () => {
    if (!activeCampaign) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await api<{ ok: boolean; leads_to_generate: number; credits_spent: number }>(
        `/api/factories/lead-scraper/campaigns/${activeCampaign.id}/generate`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      setCredits(c => (c !== null ? c - r.credits_spent : c));
      setActiveCampaign({ ...activeCampaign, status: 'generating' });
      setStep('review');
      setToast(`${r.leads_to_generate} Pitches werden generiert (${r.credits_spent} Credits)`);
    } catch (e: any) {
      setError(e?.message || 'Generate-Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Approve / reject ─────────────────────────────
  const updateLead = async (leadId: string, patch: Record<string, any>) => {
    try {
      const r = await api<{ ok: boolean; lead: Lead }>(
        `/api/factories/lead-scraper/leads/${leadId}`,
        { method: 'PATCH', body: JSON.stringify(patch) }
      );
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...(r.lead || patch) } : l));
    } catch (e: any) {
      setError(e?.message || 'Update-Fehler');
    }
  };

  const handleApprove = (leadId: string) => updateLead(leadId, { outreach_status: 'approved' });
  const handleReject = (leadId: string) => updateLead(leadId, { outreach_status: 'pending' });
  const handleVariantPick = (leadId: string, idx: number) => updateLead(leadId, { pitch_selected_index: idx });

  const startEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditDraft({
      subject: lead.outreach_message_subject || '',
      body: lead.outreach_message || ''
    });
  };
  const saveEdit = async () => {
    if (!editingLeadId) return;
    await updateLead(editingLeadId, {
      outreach_message: editDraft.body,
      outreach_message_subject: editDraft.subject
    });
    setEditingLeadId(null);
  };

  const handleSendAll = async () => {
    if (!activeCampaign) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await api<{ ok: boolean; scheduled: number }>(
        `/api/factories/lead-scraper/campaigns/${activeCampaign.id}/send`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      setActiveCampaign({ ...activeCampaign, status: 'sending' });
      setToast(`${r.scheduled} Pitches werden versendet`);
    } catch (e: any) {
      setError(e?.message || 'Send-Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Re-open existing campaign ────────────────────
  const openExisting = async (camp: Campaign) => {
    setError(null);
    try {
      const det = await api<{ ok: boolean; campaign: Campaign; leads: Lead[] }>(
        `/api/factories/lead-scraper/campaigns/${camp.id}`
      );
      setActiveCampaign(det.campaign);
      setLeads(det.leads || []);
      setStep('review');
    } catch (e: any) {
      setError(e?.message || 'Load-Fehler');
    }
  };

  const resetWizard = () => {
    setStep('setup');
    setActiveCampaign(null);
    setLeads([]);
    setCampaignName('');
    setCsvFile(null);
    setCsvPreview([]);
    setEditingLeadId(null);
    setError(null);
    api<{ ok: boolean; campaigns: Campaign[] }>('/api/factories/lead-scraper/campaigns')
      .then(r => setCampaigns(r.campaigns || []))
      .catch(() => {});
  };

  // ── Derived ───────────────────────────────────────
  const pendingCount = leads.filter(l => l.outreach_status === 'pending').length;
  const generatedCount = leads.filter(l => l.outreach_status === 'generated').length;
  const approvedCount = leads.filter(l => l.outreach_status === 'approved').length;
  const sentCount = leads.filter(l => l.outreach_status === 'sent').length;
  const estCost = useMemo(() => pendingCount * CREDITS_PER_LEAD, [pendingCount]);

  if (!me) return null;

  // ── Render ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <Link to="/dashboard" className="text-ink-400 hover:text-ink-200 text-sm flex items-center gap-1 mb-2">
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-amber-400 shrink-0" />
              Lead-Scraper-Factory
            </h1>
            <p className="text-ink-400 text-sm mt-1">CSV-Upload → AEVUM-Brandtone-Pitches → Send via audit@aevum-system.de</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="flex items-center gap-2 text-sm text-amber-400 sm:justify-end">
              <Coins className="w-4 h-4" />
              {credits === null ? '…' : `${credits} Credits`}
            </div>
            <div className="text-xs text-ink-500 mt-1">{CREDITS_PER_LEAD} Credits / Lead</div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6 text-xs overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['setup', 'brandtone', 'generate', 'review'] as Step[]).map((s, i) => {
            const isCurrent = step === s;
            const idx = ['setup', 'brandtone', 'generate', 'review'].indexOf(step);
            const isPast = i < idx;
            return (
              <div
                key={s}
                className={`px-3 py-1.5 rounded-md border whitespace-nowrap shrink-0 ${isCurrent ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' : isPast ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-ink-900/50 border-ink-700 text-ink-500'}`}
              >
                {i + 1}. {s === 'setup' ? 'Setup' : s === 'brandtone' ? 'Brandtone' : s === 'generate' ? 'Generate' : 'Review & Send'}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {toast && (
          <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toast}
          </div>
        )}

        {/* ── STEP 1: Setup ───────────────────────────── */}
        {step === 'setup' && (
          <div className="space-y-6">
            <section className="bg-ink-900/50 border border-ink-800 rounded-xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Campaign anlegen</h2>
              <label className="block text-sm text-ink-300 mb-1">Campaign-Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="z.B. Mario + Brandedecom Outreach Mai"
                className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-white text-sm mb-4"
                maxLength={200}
              />

              <label className="block text-sm text-ink-300 mb-1">CSV (max 5 MB, max 500 Leads)</label>
              <div className="text-xs text-ink-500 mb-2">
                Header erwartet: <code className="bg-ink-950 px-1.5 py-0.5 rounded">company_name, company_domain, owner_name, owner_email, owner_linkedin_url</code>. <strong>owner_email</strong> Pflicht.
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="flex-1 cursor-pointer border border-dashed border-ink-700 hover:border-amber-400/40 rounded-lg px-4 py-6 text-center text-sm text-ink-400 hover:text-amber-300 transition">
                  <Upload className="w-5 h-5 inline mr-2" />
                  {csvFile ? csvFile.name : 'CSV waehlen oder hierhin ziehen'}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={e => handleFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {csvPreview.length > 0 && (
                <div className="mb-4 bg-ink-950 border border-ink-800 rounded-md p-3 overflow-x-auto">
                  <div className="text-xs text-ink-500 mb-2">Preview (erste 5 Zeilen):</div>
                  <table className="text-xs text-ink-300 w-full">
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className={i === 0 ? 'text-amber-300 font-medium' : ''}>
                          {row.map((c, j) => (
                            <td key={j} className="px-2 py-1 border-b border-ink-800 truncate max-w-[200px]">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={() => setStep('brandtone')}
                disabled={!campaignName.trim() || !csvFile}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-ink-800 disabled:text-ink-500 text-ink-950 font-medium rounded-md text-sm flex items-center gap-2 transition"
              >
                Weiter <ArrowRight className="w-4 h-4" />
              </button>
            </section>

            {/* Existing campaigns */}
            {campaigns.length > 0 && (
              <section className="bg-ink-900/30 border border-ink-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-ink-300 mb-3">Bisherige Campaigns</h3>
                <div className="space-y-2">
                  {campaigns.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      onClick={() => openExisting(c)}
                      className="w-full text-left px-3 py-2 bg-ink-950 hover:bg-ink-900 border border-ink-800 rounded-md flex items-center justify-between text-sm transition"
                    >
                      <span className="text-white">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        c.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                        c.status === 'sending' ? 'bg-blue-500/10 text-blue-400' :
                        c.status === 'generating' ? 'bg-amber-500/10 text-amber-400' :
                        c.status === 'ready_to_send' ? 'bg-amber-500/10 text-amber-300' :
                        'bg-ink-800 text-ink-400'
                      }`}>{c.status}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── STEP 2: Brandtone ───────────────────────── */}
        {step === 'brandtone' && (
          <section className="bg-ink-900/50 border border-ink-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-2">Brand-Voice waehlen</h2>
            <p className="text-sm text-ink-400 mb-4">
              Default <strong>AEVUM Brand-Voice</strong> ist Carlos's Outreach-Tonality. Andere Hubs zeigen owner-scoped Brand-Knowledge.
            </p>
            <div className="space-y-2 mb-6">
              {hubs.map(h => {
                const isSelected = selectedHubId === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHubId(h.id)}
                    className={`w-full text-left px-4 py-3 rounded-md border transition ${isSelected ? 'bg-amber-400/10 border-amber-400/40' : 'bg-ink-950 border-ink-800 hover:border-ink-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium text-sm">{h.name}</div>
                      <div className="text-xs text-ink-500">{h.is_public ? 'public' : 'owned'}</div>
                    </div>
                    {h.description && <div className="text-xs text-ink-400 mt-1">{h.description}</div>}
                  </button>
                );
              })}
              {hubs.length === 0 && (
                <div className="text-sm text-ink-500">Keine Hubs verfuegbar — Default AEVUM-Brandtone wird intern verwendet.</div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('setup')} className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-md text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Zurueck
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={submitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-ink-800 disabled:text-ink-500 text-ink-950 font-medium rounded-md text-sm flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Campaign anlegen
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 3: Generate ────────────────────────── */}
        {step === 'generate' && activeCampaign && (
          <section className="bg-ink-900/50 border border-ink-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-2">Pitches generieren</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Stat label="Campaign" value={activeCampaign.name} mono />
              <Stat label="Leads pending" value={String(pendingCount)} />
              <Stat label="Kosten" value={`${estCost} Credits`} highlight />
              <Stat label="Modell" value="Claude Sonnet 4.5" />
            </div>
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-md px-4 py-3 mb-6 text-sm text-amber-200">
              <Sparkles className="w-4 h-4 inline mr-1" />
              3 Pitch-Varianten pro Lead (direct / curious / reference). Generierung laeuft im Background.
            </div>
            <div className="flex gap-2">
              <button onClick={resetWizard} className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-md text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Abbrechen
              </button>
              <button
                onClick={handleGenerate}
                disabled={submitting || pendingCount === 0 || (credits !== null && credits < estCost)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-ink-800 disabled:text-ink-500 text-ink-950 font-medium rounded-md text-sm flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {pendingCount} Pitches generieren ({estCost} Credits)
              </button>
            </div>
            {credits !== null && credits < estCost && (
              <div className="mt-3 text-xs text-rose-400">
                Nicht genug Credits — du brauchst {estCost - credits} mehr. <Link to="/credits" className="underline">Aufladen</Link>
              </div>
            )}
          </section>
        )}

        {/* ── STEP 4: Review ──────────────────────────── */}
        {step === 'review' && activeCampaign && (
          <section className="space-y-4">
            <div className="bg-ink-900/50 border border-ink-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-medium text-white break-words">{activeCampaign.name}</h2>
                <div className="text-xs text-ink-400 mt-1">
                  Status: <span className={`px-2 py-0.5 rounded ${
                    activeCampaign.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                    activeCampaign.status === 'sending' ? 'bg-blue-500/10 text-blue-400' :
                    activeCampaign.status === 'generating' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-ink-800 text-ink-300'
                  }`}>{activeCampaign.status}</span>
                  {' · '}
                  {leads.length} Leads ({generatedCount} generiert, {approvedCount} approved, {sentCount} sent)
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button onClick={resetWizard} className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-md text-xs flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Neue Campaign
                </button>
                {approvedCount > 0 && (
                  <button
                    onClick={handleSendAll}
                    disabled={submitting || activeCampaign.status === 'sending'}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-ink-800 disabled:text-ink-500 text-ink-950 font-medium rounded-md text-xs flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {approvedCount} approved versenden
                  </button>
                )}
              </div>
            </div>

            {activeCampaign.status === 'generating' && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-md px-4 py-3 text-sm text-amber-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Pitches werden generiert… {generatedCount} / {leads.length} fertig.
              </div>
            )}
            {activeCampaign.status === 'sending' && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-md px-4 py-3 text-sm text-blue-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Versand laeuft… {sentCount} versendet.
              </div>
            )}

            {leads.length === 0 && (
              <div className="bg-ink-900/30 border border-ink-800 rounded-xl p-6 text-sm text-ink-400">
                Keine Leads geladen.
              </div>
            )}

            {leads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isEditing={editingLeadId === lead.id}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                onStartEdit={() => startEdit(lead)}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingLeadId(null)}
                onApprove={() => handleApprove(lead.id)}
                onReject={() => handleReject(lead.id)}
                onPickVariant={(i) => handleVariantPick(lead.id, i)}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ── Lead-Card ────────────────────────────────────────
function LeadCard({
  lead, isEditing, editDraft, setEditDraft,
  onStartEdit, onSaveEdit, onCancelEdit,
  onApprove, onReject, onPickVariant
}: {
  lead: Lead;
  isEditing: boolean;
  editDraft: { subject: string; body: string };
  setEditDraft: (v: { subject: string; body: string }) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPickVariant: (idx: number) => void;
}) {
  const variants = Array.isArray(lead.pitch_variants) ? lead.pitch_variants : [];
  const selectedIdx = typeof lead.pitch_selected_index === 'number' ? lead.pitch_selected_index : 0;
  const statusColor =
    lead.outreach_status === 'sent' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
    lead.outreach_status === 'approved' ? 'bg-amber-400/15 text-amber-300 border-amber-400/30' :
    lead.outreach_status === 'generated' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
    lead.outreach_status === 'failed' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
    'bg-ink-800 text-ink-400 border-ink-700';

  return (
    <div className="bg-ink-900/40 border border-ink-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-white font-medium flex items-center gap-2 flex-wrap">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="break-words">{lead.owner_name || '(unbekannt)'}</span> · <span className="text-ink-300 text-sm break-words">{lead.company_name || '—'}</span>
          </div>
          <div className="text-xs text-ink-500 mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span className="break-all">{lead.owner_email}</span>
            {lead.company_domain && <span className="break-all">· {lead.company_domain}</span>}
            {lead.owner_linkedin_url && <a href={lead.owner_linkedin_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">LinkedIn</a>}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded border shrink-0 ${statusColor}`}>{lead.outreach_status}</span>
      </div>

      {lead.outreach_status === 'pending' && (
        <div className="text-sm text-ink-500 italic">Noch kein Pitch generiert.</div>
      )}

      {variants.length > 0 && lead.outreach_status !== 'pending' && (
        <div className="space-y-2 mb-3">
          <div className="text-xs text-ink-500">Varianten:</div>
          <div className="flex gap-2 flex-wrap">
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => onPickVariant(i)}
                className={`px-2.5 py-1 text-xs rounded border ${i === selectedIdx ? 'bg-amber-400/15 border-amber-400/40 text-amber-300' : 'bg-ink-950 border-ink-700 text-ink-400 hover:border-ink-600'}`}
              >
                {i + 1}. {v.tone || 'variant'}
              </button>
            ))}
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2 mb-3">
          <input
            type="text"
            value={editDraft.subject}
            onChange={e => setEditDraft({ ...editDraft, subject: e.target.value })}
            placeholder="Betreff"
            className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-white text-sm"
            maxLength={200}
          />
          <textarea
            value={editDraft.body}
            onChange={e => setEditDraft({ ...editDraft, body: e.target.value })}
            rows={6}
            className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-white text-sm font-mono"
            maxLength={5000}
          />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-ink-950 rounded-md text-xs">Speichern</button>
            <button onClick={onCancelEdit} className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-md text-xs">Abbrechen</button>
          </div>
        </div>
      ) : (lead.outreach_message ? (
        <div className="bg-ink-950 border border-ink-800 rounded-md p-3 mb-3">
          {lead.outreach_message_subject && (
            <div className="text-xs text-amber-300 mb-2 font-medium">Betreff: {lead.outreach_message_subject}</div>
          )}
          <MarkdownViewer content={lead.outreach_message} variant="portal" />
        </div>
      ) : null)}

      {!isEditing && lead.outreach_status !== 'sent' && lead.outreach_status !== 'pending' && (
        <div className="flex gap-2">
          {lead.outreach_status !== 'approved' && (
            <button onClick={onApprove} className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-md text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {lead.outreach_status === 'approved' && (
            <button onClick={onReject} className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-md text-xs flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Zurueck
            </button>
          )}
          <button onClick={onStartEdit} className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-md text-xs flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Bearbeiten
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="bg-ink-950 border border-ink-800 rounded-md p-3">
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div className={`text-sm ${highlight ? 'text-amber-300 font-medium' : 'text-white'} ${mono ? 'font-mono truncate' : ''}`}>{value}</div>
    </div>
  );
}
