// DSGVO-Factory Tool — Wave C3
// Template-Pick (AVV live, andere coming-soon) -> Form -> POST run -> poll -> PDF download.
// Backend: /api/factories/dsgvo/{run, runs/:id, templates}.

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Shield, ArrowLeft, Zap, Plus, Loader2, CheckCircle2, AlertCircle,
  Sparkles, Coins, Download, FileText, Trash2, ChevronLeft, Clock
} from 'lucide-react';
import Spinner from '@/components/Spinner';

interface Template {
  type: string;
  label: string;
  description?: string;
  status: 'live' | 'coming_soon';
  credits?: number;
}

interface DsgvoRun {
  id: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  credits_spent?: number | null;
  pdf_url?: string | null;
  error_message?: string | null;
  template_type?: string;
}

interface Vendor {
  name: string;
  zweck: string;
  sub_processor: boolean;
}

const CREDITS_PER_RUN = 25;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const FALLBACK_TEMPLATES: Template[] = [
  { type: 'avv', label: 'Auftragsverarbeitungs-Vertrag (AVV)', description: 'DSGVO Art. 28 — für Vendor-Verträge.', status: 'live', credits: 25 },
  { type: 'datenschutzerklaerung', label: 'Datenschutzerklärung', description: 'Web-DSE inkl. Cookie-Inventar.', status: 'coming_soon', credits: 30 },
  { type: 'impressum', label: 'Impressum', description: 'TMG-konform.', status: 'coming_soon', credits: 10 },
  { type: 'agb', label: 'AGB (B2B)', description: 'Standard-Geschäftsbedingungen.', status: 'coming_soon', credits: 40 }
];

// Lokalisierte Label/Description für bekannte Fallback-Template-Typen.
const TEMPLATE_I18N: Record<string, { label: string; desc: string }> = {
  avv: { label: 'tools.dsgvo.tplAvv', desc: 'tools.dsgvo.tplAvvDesc' },
  datenschutzerklaerung: { label: 'tools.dsgvo.tplDse', desc: 'tools.dsgvo.tplDseDesc' },
  impressum: { label: 'tools.dsgvo.tplImpressum', desc: 'tools.dsgvo.tplImpressumDesc' },
  agb: { label: 'tools.dsgvo.tplAgb', desc: 'tools.dsgvo.tplAgbDesc' },
};

export default function DsgvoFactoryTool() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const nav = useNavigate();

  // Gating
  useEffect(() => {
    if (me && me.account.account_type === 'shop') {
      nav('/dashboard', { replace: true });
    }
  }, [me, nav]);

  // ── State ─────────────────────────────────────────
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [picked, setPicked] = useState<Template | null>(null);

  const [firma, setFirma] = useState('');
  const [anschrift, setAnschrift] = useState('');
  const [ustId, setUstId] = useState('');
  const [kontaktDsb, setKontaktDsb] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([{ name: '', zweck: '', sub_processor: false }]);

  const [submitting, setSubmitting] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<DsgvoRun | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api<{ ok: boolean; templates: Template[] }>('/api/factories/dsgvo/templates')
      .then(r => setTemplates(r.templates && r.templates.length ? r.templates : FALLBACK_TEMPLATES))
      .catch(() => setTemplates(FALLBACK_TEMPLATES));
    api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
      .then(r => setCredits(r.credits?.balance ?? 0))
      .catch(() => setCredits(0));
  }, []);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const pickTemplate = (tpl: Template) => {
    if (tpl.status !== 'live') {
      showToast(t('tools.dsgvo.comingSoon', { label: tplLabel(tpl) }));
      return;
    }
    setPicked(tpl);
  };

  // Lokalisiertes Label/Description (Fallback-Templates), sonst Backend-Wert.
  const tplLabel = (tpl: Template) => TEMPLATE_I18N[tpl.type] ? t(TEMPLATE_I18N[tpl.type].label) : tpl.label;
  const tplDesc = (tpl: Template) => TEMPLATE_I18N[tpl.type] ? t(TEMPLATE_I18N[tpl.type].desc) : tpl.description;

  const updateVendor = (i: number, patch: Partial<Vendor>) => {
    setVendors(vs => vs.map((v, idx) => idx === i ? { ...v, ...patch } : v));
  };
  const addVendor = () => setVendors(vs => [...vs, { name: '', zweck: '', sub_processor: false }]);
  const removeVendor = (i: number) => setVendors(vs => vs.filter((_, idx) => idx !== i));

  const startRun = async () => {
    if (!picked) return;
    if (!firma.trim() || !anschrift.trim()) {
      setRunError(t('tools.dsgvo.firmaAddrRequired'));
      return;
    }
    const filledVendors = vendors.filter(v => v.name.trim() && v.zweck.trim());
    if (filledVendors.length === 0) {
      setRunError(t('tools.dsgvo.vendorRequired'));
      return;
    }
    setRunError(null);
    setSubmitting(true);
    try {
      const res = await api<{ ok: boolean; run_id: string; status: string }>('/api/factories/dsgvo/run', {
        method: 'POST',
        body: JSON.stringify({
          template_type: picked.type,
          inputs: {
            firma_name: firma,
            anschrift,
            ust_id: ustId,
            kontakt_dsb: kontaktDsb,
            vendoren: filledVendors
          }
        })
      });
      pollRun(res.run_id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('tools.common.unknownError');
      setRunError(msg);
      setSubmitting(false);
    }
  };

  const pollRun = (runId: string) => {
    const started = Date.now();
    const tick = async () => {
      try {
        const res = await api<{ ok: boolean; run: DsgvoRun }>(`/api/factories/dsgvo/runs/${runId}`);
        setActiveRun(res.run);
        if (res.run.status === 'complete' || res.run.status === 'failed') {
          setSubmitting(false);
          api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
            .then(r => setCredits(r.credits?.balance ?? credits))
            .catch(() => {});
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          setRunError(t('tools.dsgvo.timeout'));
          setSubmitting(false);
          return;
        }
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t('tools.common.pollingError');
        setRunError(msg);
        setSubmitting(false);
      }
    };
    tick();
  };

  const reset = () => {
    setActiveRun(null);
    setRunError(null);
  };

  const backToTemplates = () => {
    setPicked(null);
    reset();
  };

  if (!me) return null;
  if (templates === null) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="text-[0.7rem] text-ink-400 hover:text-white inline-flex items-center gap-1.5 mb-3">
          <ArrowLeft size={12} /> {t('tools.common.backToDashboard')}
        </Link>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> {t('tools.dsgvo.brand')}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('tools.dsgvo.title')}</h1>
        <p className="text-ink-400 mt-2 text-sm">
          {t('tools.dsgvo.subtitle')}
        </p>
      </div>

      {/* Credit Strip */}
      <div className="card-premium p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
            <Coins size={18} className="text-gold-300" />
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.common.yourBalance')}</div>
            <div className="text-lg font-bold text-white tabular-nums">
              {(credits ?? 0).toLocaleString('de-DE')} <span className="text-xs font-medium text-ink-400">{t('tools.common.credits')}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.dsgvo.costPerRun')}</div>
          <div className="text-lg font-bold text-gold-gradient tabular-nums">
            {picked?.credits ?? CREDITS_PER_RUN} {t('tools.common.credits')}
          </div>
        </div>
        {(credits ?? 0) < (picked?.credits ?? CREDITS_PER_RUN) && (
          <Link to="/credits" className="btn-gold py-1.5 px-3 text-[0.7rem] inline-flex items-center gap-1.5">
            <Plus size={12} /> {t('tools.dsgvo.topUp')}
          </Link>
        )}
      </div>

      {/* Result view */}
      {activeRun ? (
        <RunResultPanel run={activeRun} onReset={reset} onBack={backToTemplates} />
      ) : !picked ? (
        // Template-Picker
        <section>
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-gold-300" /> {t('tools.dsgvo.pickTemplate')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {templates.map(tpl => (
              <TemplateCard key={tpl.type} t={tpl} label={tplLabel(tpl)} description={tplDesc(tpl)} onPick={() => pickTemplate(tpl)} />
            ))}
          </div>
        </section>
      ) : (
        // Form
        <div className="space-y-4">
          <button
            onClick={() => setPicked(null)}
            className="text-[0.7rem] text-ink-400 hover:text-white inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={12} /> {t('tools.dsgvo.otherTemplate')}
          </button>

          <div className="card-premium p-6 sm:p-7 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-gold-300" /> {tplLabel(picked)}
            </h2>

            <Field label={t('tools.dsgvo.fieldFirma')} value={firma} onChange={setFirma} placeholder={t('tools.dsgvo.fieldFirmaPlaceholder')} />
            <Field label={t('tools.dsgvo.fieldAddr')} value={anschrift} onChange={setAnschrift} placeholder={t('tools.dsgvo.fieldAddrPlaceholder')} textarea />
            <Field label={t('tools.dsgvo.fieldUstId')} value={ustId} onChange={setUstId} placeholder={t('tools.dsgvo.fieldUstIdPlaceholder')} />
            <Field label={t('tools.dsgvo.fieldDsb')} value={kontaktDsb} onChange={setKontaktDsb} placeholder={t('tools.dsgvo.fieldDsbPlaceholder')} />

            {/* Vendoren */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold">
                  {t('tools.dsgvo.vendors')}
                </label>
                <button
                  type="button"
                  onClick={addVendor}
                  className="text-[0.65rem] text-gold-300 hover:text-gold-200 inline-flex items-center gap-1"
                >
                  <Plus size={11} /> {t('tools.dsgvo.addVendor')}
                </button>
              </div>
              <div className="space-y-2">
                {vendors.map((v, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <input
                      type="text"
                      value={v.name}
                      onChange={e => updateVendor(i, { name: e.target.value })}
                      placeholder={t('tools.dsgvo.vendorName')}
                      className="sm:col-span-4 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={v.zweck}
                      onChange={e => updateVendor(i, { zweck: e.target.value })}
                      placeholder={t('tools.dsgvo.vendorZweck')}
                      className="sm:col-span-5 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none"
                    />
                    <label className="sm:col-span-2 flex items-center gap-1.5 text-[0.7rem] text-ink-300 px-1">
                      <input
                        type="checkbox"
                        checked={v.sub_processor}
                        onChange={e => updateVendor(i, { sub_processor: e.target.checked })}
                        className="accent-gold-400"
                      />
                      {t('tools.dsgvo.subProcessor')}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVendor(i)}
                      disabled={vendors.length === 1}
                      className="sm:col-span-1 text-ink-500 hover:text-rose-300 disabled:opacity-30 flex justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {runError && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-[0.75rem] text-rose-200">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <div>{runError}</div>
              </div>
            )}

            <button
              type="button"
              onClick={startRun}
              disabled={submitting || (credits ?? 0) < (picked.credits ?? CREDITS_PER_RUN)}
              className="btn-gold w-full py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> {t('tools.dsgvo.generating')}</>
              ) : (
                <><Zap size={14} /> {t('tools.dsgvo.generate', { n: picked.credits ?? CREDITS_PER_RUN })}</>
              )}
            </button>
          </div>
        </div>
      )}

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

function TemplateCard({ t: tpl, label, description, onPick }: { t: Template; label: string; description?: string; onPick: () => void }) {
  const { t } = useTranslation();
  const isLive = tpl.status === 'live';
  return (
    <button
      type="button"
      onClick={onPick}
      className={`text-left card-premium p-5 group transition relative overflow-hidden ${isLive ? 'hover:border-gold-400/40' : 'opacity-60 hover:opacity-80'}`}
      style={isLive ? undefined : { borderStyle: 'dashed' }}
    >
      <div className="absolute top-3 right-3">
        <span className={`text-[0.55rem] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${
          isLive
            ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-200'
            : 'bg-white/[0.04] border-white/10 text-ink-300'
        }`}>
          {isLive ? t('tools.dsgvo.live') : t('tools.dsgvo.soon')}
        </span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center mb-4">
        <FileText size={18} className="text-gold-300" strokeWidth={1.6} />
      </div>
      <div className="text-base font-semibold text-white mb-1.5 pr-12">{label}</div>
      {description && (
        <div className="text-[0.72rem] text-ink-400 leading-relaxed">{description}</div>
      )}
      <div className="mt-4 pt-3 border-t border-white/5 text-[0.65rem] text-ink-500">
        {t('tools.dsgvo.creditsPerRun', { n: tpl.credits ?? CREDITS_PER_RUN })}
      </div>
    </button>
  );
}

function RunResultPanel({ run, onReset, onBack }: { run: DsgvoRun; onReset: () => void; onBack: () => void }) {
  const { t } = useTranslation();
  if (run.status === 'failed') {
    return (
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle size={18} />
          <h2 className="text-base font-semibold">{t('tools.dsgvo.failed')}</h2>
        </div>
        <p className="text-sm text-ink-300">{run.error_message || t('tools.dsgvo.failedDefault')}</p>
        <div className="flex gap-2">
          <button onClick={onReset} className="btn-gold py-2 px-4 text-xs inline-flex items-center gap-2">
            {t('tools.dsgvo.retry')}
          </button>
          <button onClick={onBack} className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-ink-200">
            {t('tools.dsgvo.otherTemplate')}
          </button>
        </div>
      </div>
    );
  }

  if (run.status !== 'complete') {
    return (
      <div className="card-premium p-10 text-center space-y-3">
        <Loader2 size={32} className="mx-auto text-gold-300 animate-spin" />
        <div className="text-base font-semibold text-white">{t('tools.dsgvo.working')}</div>
        <div className="text-[0.75rem] text-ink-400">
          {t('tools.dsgvo.status')}: <span className="text-gold-300 uppercase tracking-wider">{run.status}</span>
        </div>
        <div className="text-[0.7rem] text-ink-500">{t('tools.dsgvo.pollingNote')}</div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 sm:p-8 space-y-5 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-emerald-300" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">{t('tools.dsgvo.docReady')}</h2>
        <p className="text-[0.75rem] text-ink-400 mt-1">
          {t('tools.dsgvo.creditsSpent', { credits: run.credits_spent ?? 0, template: run.template_type?.toUpperCase() || '—' })}
        </p>
      </div>
      {run.pdf_url ? (
        <a
          href={run.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold inline-flex items-center gap-2 py-3 px-6 text-sm"
        >
          <Download size={14} /> {t('tools.dsgvo.downloadPdf')}
        </a>
      ) : (
        <p className="text-[0.75rem] text-ink-400">{t('tools.dsgvo.noPdf')}</p>
      )}
      <div className="flex gap-2 justify-center pt-2">
        <button onClick={onReset} className="text-[0.7rem] text-gold-300 hover:text-gold-200">
          {t('tools.dsgvo.newRun')}
        </button>
        <span className="text-ink-600">·</span>
        <button onClick={onBack} className="text-[0.7rem] text-ink-400 hover:text-white">
          {t('tools.dsgvo.otherTemplate')}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, textarea
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none"
        />
      )}
    </div>
  );
}
