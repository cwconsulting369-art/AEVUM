// Script-Factory Tool — Wave H2 Multi-Step Workflow.
// Backend H1: /api/factories/script/{use-cases, knowledge-hubs, run, runs/:id, tim-customers}.

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Film, ArrowLeft, ArrowRight, Zap, Plus, Loader2, AlertCircle,
  Sparkles, Coins, Upload, FileText, Users, RotateCcw, Copy, Check,
  ChevronLeft
} from 'lucide-react';
import Spinner from '@/components/Spinner';
import UseCasePicker, { type UseCase } from '@/components/script-factory/UseCasePicker';
import SettingsForm, { type KnowledgeHub, type ScriptSettings } from '@/components/script-factory/SettingsForm';
import CompareView, { type ScriptSide } from '@/components/script-factory/CompareView';
import DifferencesPanel, { type Difference } from '@/components/script-factory/DifferencesPanel';

const CREDITS_PER_RUN = 40;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const TIM_WHITELIST = new Set(['carlos@aevum-system.de', 'cwconsulting369@gmail.com', 'tim@knightvision.tech']);

interface TimCustomer {
  id: string;
  customer_name: string;
  customer_email?: string;
  niche?: string;
}

interface ScriptVariant {
  variant_index: number;
  text?: string;
  full_script?: string;
  hook?: string;
  body?: string;
  cta?: string;
  grade_after?: string;
  hook_score_after?: number;
  strengths?: string[];
  weaknesses?: string[];
  score_breakdown?: Record<string, number>;
}

interface ScriptRun {
  id: string;
  status: 'pending' | 'running' | 'analyzing' | 'evaluating' | 'complete' | 'failed';
  phase?: string;
  credits_spent?: number | null;
  variants?: ScriptVariant[];
  error_message?: string | null;
  use_case?: string;
  input_script?: string;
  // Grading
  grade_before?: string;
  grade_after?: string;
  hook_score_before?: number;
  hook_score_after?: number;
  analysis_before?: {
    strengths?: string[];
    weaknesses?: string[];
    score_breakdown?: Record<string, number>;
  };
  analysis_after?: {
    strengths?: string[];
    weaknesses?: string[];
    score_breakdown?: Record<string, number>;
  };
  differences?: Difference[];
}

type Step = 'use-case' | 'settings' | 'upload' | 'running' | 'compare';

const PHASE_LABEL: Record<string, { idx: number; key: string }> = {
  pending:    { idx: 1, key: 'tools.script.phasePending' },
  analyzing:  { idx: 1, key: 'tools.script.phasePending' },
  running:    { idx: 2, key: 'tools.script.phaseRunning' },
  evaluating: { idx: 3, key: 'tools.script.phaseEvaluating' },
};

export default function ScriptFactoryTool() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const nav = useNavigate();

  // Gating
  useEffect(() => {
    if (me && me.account.account_type === 'shop') {
      nav('/dashboard', { replace: true });
    }
  }, [me, nav]);

  // Wizard state
  const [step, setStep] = useState<Step>('use-case');
  const [useCases, setUseCases] = useState<UseCase[] | null>(null);
  const [knowledgeHubs, setKnowledgeHubs] = useState<KnowledgeHub[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [settings, setSettings] = useState<ScriptSettings>({});
  const [selectedHubIds, setSelectedHubIds] = useState<string[]>([]);
  const [inputScript, setInputScript] = useState('');
  const [variantCount, setVariantCount] = useState(5);

  // Tim-Mode
  const [timCustomers, setTimCustomers] = useState<TimCustomer[] | null>(null);
  const [selectedTimCustomerId, setSelectedTimCustomerId] = useState<string>('');

  // Run state
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<ScriptRun | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const isTim = useMemo(
    () => !!(me?.account.email && TIM_WHITELIST.has(me.account.email.toLowerCase())),
    [me]
  );

  const currentUseCase = useMemo(
    () => useCases?.find(u => u.slug === selectedUseCase) || null,
    [useCases, selectedUseCase]
  );

  // ── Load use-cases + hubs + credits ──
  useEffect(() => {
    api<{ ok: boolean; use_cases: UseCase[] }>('/api/factories/script/use-cases')
      .then(r => setUseCases(r.use_cases || []))
      .catch(() => setUseCases([]));
    api<{ ok: boolean; knowledge_hubs: KnowledgeHub[] }>('/api/factories/script/knowledge-hubs')
      .then(r => setKnowledgeHubs(r.knowledge_hubs || []))
      .catch(() => setKnowledgeHubs([]));
    api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
      .then(r => setCredits(r.credits?.balance ?? 0))
      .catch(() => setCredits(0));
  }, []);

  // Tim-Customers when entering upload-step
  useEffect(() => {
    if (!isTim || step !== 'upload' || timCustomers !== null) return;
    api<{ ok: boolean; customers: TimCustomer[] }>('/api/factories/script/tim-customers')
      .then(r => setTimCustomers(r.customers || []))
      .catch(() => setTimCustomers([]));
  }, [isTim, step, timCustomers]);

  // Use-Case selected → pre-fill default hub
  function onPickUseCase(slug: string) {
    setSelectedUseCase(slug);
    const uc = useCases?.find(u => u.slug === slug);
    if (uc?.default_knowledge_hub) {
      const hub = knowledgeHubs.find(h => h.slug === uc.default_knowledge_hub);
      if (hub) setSelectedHubIds([hub.id]);
    }
    setStep('settings');
  }

  // Run
  async function startRun() {
    if (inputScript.trim().length < 50) {
      setRunError(t('tools.script.scriptTooShort'));
      return;
    }
    if ((credits ?? 0) < CREDITS_PER_RUN) {
      setRunError(t('tools.script.notEnoughCredits', { balance: credits ?? 0, cost: CREDITS_PER_RUN }));
      return;
    }
    setRunError(null);
    setActiveRun(null);
    setStep('running');

    try {
      const body: Record<string, unknown> = {
        use_case: selectedUseCase,
        input_script: inputScript,
        settings,
        knowledge_hub_ids: selectedHubIds,
        variant_count: variantCount,
      };
      if (isTim && selectedTimCustomerId) body.tim_customer_id = selectedTimCustomerId;

      const res = await api<{ ok: boolean; run_id: string }>('/api/factories/script/run', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      pollRun(res.run_id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('tools.common.unknownError');
      setRunError(msg);
      setStep('upload');
    }
  }

  function pollRun(runId: string) {
    const started = Date.now();
    const tick = async () => {
      try {
        const res = await api<{ ok: boolean; run: ScriptRun }>(`/api/factories/script/runs/${runId}`);
        setActiveRun(res.run);
        if (res.run.status === 'complete') {
          setStep('compare');
          setSelectedVariantIdx(0);
          api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
            .then(r => setCredits(r.credits?.balance ?? credits))
            .catch(() => {});
          return;
        }
        if (res.run.status === 'failed') {
          setRunError(res.run.error_message || t('tools.script.runFailed'));
          setStep('upload');
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          setRunError(t('tools.script.timeout'));
          setStep('upload');
          return;
        }
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t('tools.common.pollingError');
        setRunError(msg);
        setStep('upload');
      }
    };
    tick();
  }

  function resetWizard(keepSettings = false) {
    setActiveRun(null);
    setRunError(null);
    setSelectedVariantIdx(0);
    setInputScript('');
    if (!keepSettings) {
      setSelectedUseCase(null);
      setSettings({});
      setSelectedHubIds([]);
      setStep('use-case');
    } else {
      setStep('upload');
    }
  }

  if (!me) return null;
  if (useCases === null) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  // Variant compare data
  const bestVariant = activeRun?.variants?.[selectedVariantIdx];
  const beforeSide: ScriptSide = {
    text: activeRun?.input_script || inputScript,
    grade: activeRun?.grade_before,
    hook_score: activeRun?.hook_score_before,
    strengths: activeRun?.analysis_before?.strengths,
    weaknesses: activeRun?.analysis_before?.weaknesses,
    score_breakdown: activeRun?.analysis_before?.score_breakdown,
  };
  const afterSide: ScriptSide = {
    text: bestVariant?.full_script || bestVariant?.text || formatVariant(bestVariant),
    grade: bestVariant?.grade_after || activeRun?.grade_after,
    hook_score: bestVariant?.hook_score_after ?? activeRun?.hook_score_after,
    strengths: bestVariant?.strengths || activeRun?.analysis_after?.strengths,
    weaknesses: bestVariant?.weaknesses || activeRun?.analysis_after?.weaknesses,
    score_breakdown: bestVariant?.score_breakdown || activeRun?.analysis_after?.score_breakdown,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="text-[0.7rem] text-ink-400 hover:text-white inline-flex items-center gap-1.5 mb-3">
          <ArrowLeft size={12} /> {t('tools.common.backToDashboard')}
        </Link>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> {t('tools.script.brand')}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('tools.script.title')}</h1>
        <p className="text-ink-400 mt-2 text-sm">
          {t('tools.script.subtitle')}
        </p>
      </div>

      {/* Credit-Strip + Tim-CTA */}
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
        <div className="flex items-center gap-3">
          {isTim && (
            <Link to="/tools/script-factory/customers" className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
              <Users size={12} /> {t('tools.script.timCustomers')}
            </Link>
          )}
          <div className="text-right">
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.script.perRun')}</div>
            <div className="text-base font-bold text-gold-gradient tabular-nums">{t('tools.script.creditsPerRun', { n: CREDITS_PER_RUN })}</div>
          </div>
          {(credits ?? 0) < CREDITS_PER_RUN && (
            <Link to="/credits" className="btn-gold py-1.5 px-3 text-[0.7rem] inline-flex items-center gap-1.5">
              <Plus size={12} /> {t('tools.script.topUp')}
            </Link>
          )}
        </div>
      </div>

      {/* Stepper */}
      {step !== 'compare' && (
        <Stepper step={step} />
      )}

      {/* Error */}
      {runError && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-[0.8rem] text-rose-200">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>{runError}</div>
        </div>
      )}

      {/* STEP: Use-Case */}
      {step === 'use-case' && (
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Film size={16} className="text-gold-300" /> {t('tools.script.pickUseCase')}
          </h2>
          <p className="text-sm text-ink-400">
            {t('tools.script.pickUseCaseSub')}
          </p>
          {useCases.length === 0 ? (
            <div className="text-sm text-ink-500 text-center py-10">
              {t('tools.script.noUseCases')}
            </div>
          ) : (
            <UseCasePicker
              useCases={useCases}
              selectedSlug={selectedUseCase}
              onSelect={onPickUseCase}
            />
          )}
        </div>
      )}

      {/* STEP: Settings */}
      {step === 'settings' && currentUseCase && (
        <div className="card-premium p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Film size={16} className="text-gold-300 shrink-0" /> {t('tools.script.settingsFor', { name: currentUseCase.name })}
              </h2>
              <p className="text-sm text-ink-400 mt-1">
                {t('tools.script.settingsSub')}
              </p>
            </div>
            <button onClick={() => setStep('use-case')} className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1.5 self-start shrink-0">
              <ChevronLeft size={12} /> {t('tools.script.changeUseCase')}
            </button>
          </div>

          <SettingsForm
            required={currentUseCase.required_settings || ['niche', 'icp', 'awareness_stage', 'brand_tone']}
            settings={settings}
            onChange={setSettings}
            knowledgeHubs={knowledgeHubs}
            selectedHubIds={selectedHubIds}
            onHubsChange={setSelectedHubIds}
            useCaseSlug={currentUseCase.slug}
          />

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button onClick={() => setStep('upload')} className="btn-gold py-2.5 px-5 text-sm inline-flex items-center gap-2">
              {t('tools.script.next')} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP: Upload */}
      {step === 'upload' && currentUseCase && (
        <div className="card-premium p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Upload size={16} className="text-gold-300 shrink-0" /> {t('tools.script.uploadScript')}
              </h2>
              <p className="text-sm text-ink-400 mt-1">
                {t('tools.script.uploadSub')}
              </p>
            </div>
            <button onClick={() => setStep('settings')} className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1.5 self-start shrink-0">
              <ChevronLeft size={12} /> {t('tools.script.settingsBack')}
            </button>
          </div>

          {isTim && (
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
                {t('tools.script.timCustomerOptional')}
              </label>
              <select
                value={selectedTimCustomerId}
                onChange={e => setSelectedTimCustomerId(e.target.value)}
                className="input-premium"
              >
                <option value="">{t('tools.script.noCustomerContext')}</option>
                {(timCustomers || []).map(c => (
                  <option key={c.id} value={c.id}>{c.customer_name}{c.niche ? ` · ${c.niche}` : ''}</option>
                ))}
              </select>
              <p className="text-[0.65rem] text-ink-500 mt-1.5">
                {t('tools.script.timCustomerHint')}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold">
                {t('tools.script.scriptPaste')}
              </label>
              <span className={`text-[0.65rem] font-mono tabular-nums ${inputScript.length > 10000 ? 'text-rose-300' : 'text-ink-500'}`}>
                {t('tools.script.charCount', { count: inputScript.length.toLocaleString('de-DE') })}
              </span>
            </div>
            <textarea
              value={inputScript}
              onChange={e => setInputScript(e.target.value.slice(0, 10000))}
              placeholder={t('tools.script.scriptPlaceholder')}
              rows={12}
              className="input-premium resize-y font-mono text-[0.8rem]"
            />
            <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-ink-500">
              <FileText size={11} /> {t('tools.script.markdownTip')}
            </div>
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              {t('tools.script.variants', { count: variantCount })}
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={variantCount}
              onChange={e => setVariantCount(Number(e.target.value))}
              className="w-full accent-gold-400"
            />
            <div className="flex justify-between text-[0.6rem] text-ink-500 mt-1">
              <span>{t('tools.script.variantsFaster')}</span>
              <span>{t('tools.script.variantsMore')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={startRun}
              disabled={inputScript.length < 50 || (credits ?? 0) < CREDITS_PER_RUN}
              className="btn-gold w-full py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              <Zap size={14} /> {t('tools.script.startRun', { n: CREDITS_PER_RUN })}
            </button>
            {(credits ?? 0) < CREDITS_PER_RUN && (
              <p className="text-[0.7rem] text-rose-300 text-center mt-2">
                {t('tools.script.notEnoughTopUp')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP: Running */}
      {step === 'running' && (
        <RunningPanel run={activeRun} />
      )}

      {/* STEP: Compare */}
      {step === 'compare' && activeRun && (
        <ComparePanel
          run={activeRun}
          before={beforeSide}
          after={afterSide}
          selectedVariantIdx={selectedVariantIdx}
          onSelectVariant={setSelectedVariantIdx}
          onRetry={() => resetWizard(true)}
          onReset={() => resetWizard(false)}
        />
      )}
    </div>
  );
}

// ── Stepper ──
function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation();
  const steps: { id: Step; label: string }[] = [
    { id: 'use-case', label: t('tools.script.stepUseCase') },
    { id: 'settings', label: t('tools.script.stepSettings') },
    { id: 'upload',   label: t('tools.script.stepUpload') },
    { id: 'running',  label: t('tools.script.stepRun') },
  ];
  const activeIdx = steps.findIndex(s => s.id === step);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => {
        const active = i === activeIdx;
        const done = i < activeIdx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-mono font-bold border',
              active ? 'bg-gold-400/15 border-gold-400/40 text-gold-300' :
              done   ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' :
                       'bg-white/3 border-white/10 text-ink-500'
            ].join(' ')}>
              {done ? <Check size={11} /> : i + 1}
            </div>
            <span className={`text-xs ${active ? 'text-white font-semibold' : done ? 'text-ink-300' : 'text-ink-500'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-ink-700 mx-1">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Running Panel ──
function RunningPanel({ run }: { run: ScriptRun | null }) {
  const { t } = useTranslation();
  const phase = run?.status || 'pending';
  const info = PHASE_LABEL[phase] || PHASE_LABEL['pending'];
  return (
    <div className="card-premium p-10 text-center space-y-4">
      <Loader2 size={36} className="mx-auto text-gold-300 animate-spin" />
      <div className="text-base font-semibold text-white">{t('tools.script.working')}</div>
      <div className="text-sm text-ink-300">{t(info.key)}</div>
      <div className="text-[0.65rem] text-ink-500">{t('tools.script.pollingNote')}</div>
      <div className="max-w-xs mx-auto pt-2">
        <div className="flex justify-between text-[0.6rem] text-ink-500 mb-1">
          <span>{t('tools.script.phaseProgress', { idx: info.idx })}</span>
          <span>{Math.round((info.idx / 4) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-1.5 bg-gold-400/70 transition-all duration-700" style={{ width: `${(info.idx / 4) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Compare Panel ──
function ComparePanel({
  run, before, after, selectedVariantIdx, onSelectVariant, onRetry, onReset
}: {
  run: ScriptRun;
  before: ScriptSide;
  after: ScriptSide;
  selectedVariantIdx: number;
  onSelectVariant: (i: number) => void;
  onRetry: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const variants = run.variants || [];
  const total = variants.length;
  const variant = variants[selectedVariantIdx];

  const copyVariant = () => {
    const txt = variant?.full_script || variant?.text || formatVariant(variant);
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top-Bar */}
      <div className="card-premium p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.script.run')}</div>
            <div className="text-sm font-mono text-ink-200">{run.id?.slice(0, 8)}</div>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.script.useCase')}</div>
            <div className="text-sm font-semibold text-white">{run.use_case || '—'}</div>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">{t('tools.script.grade')}</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="text-rose-300">{run.grade_before || '?'}</span>
              <ArrowRight size={11} className="text-ink-500" />
              <span className="text-emerald-300">{after.grade || '?'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRetry} className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
            <RotateCcw size={12} /> {t('tools.script.retryAdjust')}
          </button>
          <button onClick={onReset} className="btn-gold py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
            <Sparkles size={12} /> {t('tools.script.newRun')}
          </button>
        </div>
      </div>

      {/* Variant-Switcher */}
      {total > 1 && (
        <div className="flex items-center justify-between gap-3 flex-wrap card-premium p-3 px-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.65rem] uppercase tracking-wider text-ink-500">{t('tools.script.variant')}</span>
            {variants.map((v, i) => (
              <button
                key={v.variant_index ?? i}
                onClick={() => onSelectVariant(i)}
                className={[
                  'w-7 h-7 rounded-md text-xs font-mono font-bold border transition',
                  i === selectedVariantIdx
                    ? 'bg-gold-400/15 border-gold-400/40 text-gold-300'
                    : 'bg-white/3 border-white/8 text-ink-400 hover:border-white/20'
                ].join(' ')}
              >
                {(v.variant_index ?? i + 1)}
              </button>
            ))}
            <span className="text-[0.65rem] text-ink-500 ml-2">{selectedVariantIdx + 1} / {total}</span>
          </div>
          <button onClick={copyVariant} className="text-xs inline-flex items-center gap-1.5 text-ink-300 hover:text-gold-300">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? t('tools.script.copied') : t('tools.script.copyVariant')}
          </button>
        </div>
      )}

      {/* Compare */}
      <CompareView before={before} after={after} />

      {/* Differences */}
      {run.differences && run.differences.length > 0 && (
        <DifferencesPanel differences={run.differences} />
      )}
    </div>
  );
}

function formatVariant(v?: ScriptVariant): string {
  if (!v) return '';
  if (v.full_script) return v.full_script;
  if (v.text) return v.text;
  const parts: string[] = [];
  if (v.hook) parts.push(`## Hook\n${v.hook}`);
  if (v.body) parts.push(`## Body\n${v.body}`);
  if (v.cta)  parts.push(`## CTA\n${v.cta}`);
  return parts.join('\n\n');
}
