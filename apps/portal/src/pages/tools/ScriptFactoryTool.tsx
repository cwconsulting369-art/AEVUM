// Script-Factory Tool — Wave C3
// Brand-Profile-Select / -Create + Form + POST run + poll + render variants.
// Backend: /api/factories/script/{run, runs/:id, brands}.

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Film, ArrowLeft, Zap, Plus, Loader2, CheckCircle2, AlertCircle,
  Copy, Sparkles, Coins, Save, X
} from 'lucide-react';
import Spinner from '@/components/Spinner';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';

interface Brand {
  id: string;
  name: string;
  tone?: string | null;
  audience?: string | null;
  positioning?: string | null;
  created_at?: string;
}

interface ScriptVariant {
  variant_index: number;
  hook: string;
  body: string;
  cta: string;
  full_script?: string;
}

interface ScriptRun {
  id: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  credits_spent?: number | null;
  variants?: ScriptVariant[];
  error_message?: string | null;
  brand_id?: string | null;
  product_name?: string | null;
}

type Platform = 'meta' | 'tiktok' | 'youtube' | 'all';

const CREDITS_PER_RUN = 40;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export default function ScriptFactoryTool() {
  const { me } = useAuth();
  const nav = useNavigate();

  // Gating: nur customer + saas
  useEffect(() => {
    if (me && me.account.account_type === 'shop') {
      nav('/dashboard', { replace: true });
    }
  }, [me, nav]);

  // ── State ───────────────────────────────────────────────
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const [brandId, setBrandId] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [hookGoal, setHookGoal] = useState('');
  const [platform, setPlatform] = useState<Platform>('meta');
  const [variantCount, setVariantCount] = useState(3);

  const [submitting, setSubmitting] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<ScriptRun | null>(null);

  // ── Load brands + credits on mount ──────────────────────
  useEffect(() => {
    api<{ ok: boolean; brands: Brand[] }>('/api/factories/script/brands')
      .then(r => {
        const list = r.brands || [];
        setBrands(list);
        if (list.length > 0) setBrandId(list[0].id);
      })
      .catch(() => setBrands([]));
    api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
      .then(r => setCredits(r.credits?.balance ?? 0))
      .catch(() => setCredits(0));
  }, []);

  // ── Submit + Poll ───────────────────────────────────────
  const startRun = async () => {
    if (!productName.trim() || !productDescription.trim() || !hookGoal.trim()) {
      setRunError('Bitte alle Felder ausfüllen.');
      return;
    }
    setRunError(null);
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        product_name: productName,
        product_description: productDescription,
        hook_goal: hookGoal,
        platform,
        variant_count: variantCount
      };
      if (brandId) body.brand_id = brandId;

      const res = await api<{ ok: boolean; run_id: string; status: string }>('/api/factories/script/run', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      pollRun(res.run_id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
      setRunError(msg);
      setSubmitting(false);
    }
  };

  const pollRun = (runId: string) => {
    const started = Date.now();
    const tick = async () => {
      try {
        const res = await api<{ ok: boolean; run: ScriptRun }>(`/api/factories/script/runs/${runId}`);
        setActiveRun(res.run);
        if (res.run.status === 'complete' || res.run.status === 'failed') {
          setSubmitting(false);
          // Refresh credits balance
          api<{ ok: boolean; credits: { balance: number } }>('/api/me/credits')
            .then(r => setCredits(r.credits?.balance ?? credits))
            .catch(() => {});
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          setRunError('Timeout — Run dauert ungewöhnlich lange. Check History später.');
          setSubmitting(false);
          return;
        }
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Polling-Fehler';
        setRunError(msg);
        setSubmitting(false);
      }
    };
    tick();
  };

  const resetForm = () => {
    setActiveRun(null);
    setRunError(null);
    setProductName('');
    setProductDescription('');
    setHookGoal('');
  };

  if (!me) return null;
  if (brands === null) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back */}
      <div>
        <Link to="/dashboard" className="text-[0.7rem] text-ink-400 hover:text-white inline-flex items-center gap-1.5 mb-3">
          <ArrowLeft size={12} /> Zurück zum Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> AEVUM Script-Factory
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">E-Commerce Ad-Scripts</h1>
        <p className="text-ink-400 mt-2 text-sm">
          Hook + Body + CTA in mehreren Varianten — auf Meta-, TikTok- oder YouTube-Format optimiert.
        </p>
      </div>

      {/* Credit/Cost Strip */}
      <div className="card-premium p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
            <Coins size={18} className="text-gold-300" />
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">Dein Guthaben</div>
            <div className="text-lg font-bold text-white tabular-nums">
              {(credits ?? 0).toLocaleString('de-DE')} <span className="text-xs font-medium text-ink-400">Credits</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.6rem] uppercase tracking-wider text-ink-500">Kosten pro Run</div>
          <div className="text-lg font-bold text-gold-gradient tabular-nums">{CREDITS_PER_RUN} Credits</div>
        </div>
        {(credits ?? 0) < CREDITS_PER_RUN && (
          <Link to="/credits" className="btn-gold py-1.5 px-3 text-[0.7rem] inline-flex items-center gap-1.5">
            <Plus size={12} /> Credits aufladen
          </Link>
        )}
      </div>

      {/* Run-View oder Form */}
      {activeRun ? (
        <RunResultPanel run={activeRun} onReset={resetForm} />
      ) : (
        <div className="card-premium p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Film size={16} className="text-gold-300" /> Neuer Script-Run
          </h2>

          {/* Brand-Picker */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              Brand-Profile
            </label>
            <div className="flex gap-2 items-stretch">
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400/50 focus:outline-none"
              >
                {brands.length === 0 && <option value="">— Kein Brand-Profile —</option>}
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowBrandModal(true)}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-ink-200 inline-flex items-center gap-1.5"
              >
                <Plus size={12} /> Neu
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              Produkt-Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="z.B. CollaGlow Beauty-Drink"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              Produkt-Beschreibung
            </label>
            <textarea
              value={productDescription}
              onChange={e => setProductDescription(e.target.value)}
              placeholder="USPs, Inhaltsstoffe, Pricing, Zielgruppe …"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none resize-none"
            />
          </div>

          {/* Hook-Goal */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              Hook-Ziel
            </label>
            <input
              type="text"
              value={hookGoal}
              onChange={e => setHookGoal(e.target.value)}
              placeholder="z.B. Curiosity Gap, Pain-Point, Social-Proof"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400/50 focus:outline-none"
            />
          </div>

          {/* Platform + Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
                Plattform
              </label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400/50 focus:outline-none"
              >
                <option value="meta">Meta (FB/Instagram)</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="all">Alle (Multi-Platform)</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
                Anzahl Varianten ({variantCount})
              </label>
              <input
                type="range"
                min={3}
                max={10}
                value={variantCount}
                onChange={e => setVariantCount(Number(e.target.value))}
                className="w-full accent-gold-400"
              />
            </div>
          </div>

          {/* Error */}
          {runError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-[0.75rem] text-rose-200">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div>{runError}</div>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={startRun}
            disabled={submitting || (credits ?? 0) < CREDITS_PER_RUN}
            className="btn-gold w-full py-3 text-sm inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Generiert …</>
            ) : (
              <><Zap size={14} /> Run starten ({CREDITS_PER_RUN} Credits)</>
            )}
          </button>
          {(credits ?? 0) < CREDITS_PER_RUN && (
            <p className="text-[0.7rem] text-rose-300 text-center">
              Nicht genug Credits — bitte aufladen.
            </p>
          )}
        </div>
      )}

      {/* Brand-Create Modal */}
      {showBrandModal && (
        <BrandCreateModal
          onClose={() => setShowBrandModal(false)}
          onCreated={(b) => {
            setBrands(prev => [...(prev || []), b]);
            setBrandId(b.id);
            setShowBrandModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Run-Result-Panel ───────────────────────────────────────────
function RunResultPanel({ run, onReset }: { run: ScriptRun; onReset: () => void }) {
  if (run.status === 'failed') {
    return (
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle size={18} />
          <h2 className="text-base font-semibold">Run fehlgeschlagen</h2>
        </div>
        <p className="text-sm text-ink-300">{run.error_message || 'Unbekannter Fehler. Credits wurden nicht abgebucht.'}</p>
        <button onClick={onReset} className="btn-gold py-2 px-4 text-xs inline-flex items-center gap-2">
          Neuen Run starten
        </button>
      </div>
    );
  }

  if (run.status !== 'complete') {
    return (
      <div className="card-premium p-10 text-center space-y-3">
        <Loader2 size={32} className="mx-auto text-gold-300 animate-spin" />
        <div className="text-base font-semibold text-white">Script-Factory arbeitet …</div>
        <div className="text-[0.75rem] text-ink-400">
          Status: <span className="text-gold-300 uppercase tracking-wider">{run.status}</span>
        </div>
        <div className="text-[0.7rem] text-ink-500">Polling alle 3 Sekunden — bleib einfach hier.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-premium p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-300" />
          <div>
            <div className="text-sm font-semibold text-white">
              {run.variants?.length ?? 0} Varianten generiert
            </div>
            <div className="text-[0.7rem] text-ink-400">
              {run.credits_spent ?? 0} Credits verbraucht
            </div>
          </div>
        </div>
        <button onClick={onReset} className="btn-gold py-2 px-4 text-xs inline-flex items-center gap-2">
          <Sparkles size={12} /> Neuen Run starten
        </button>
      </div>

      {(run.variants || []).map(v => <VariantCard key={v.variant_index} v={v} />)}
    </div>
  );
}

function VariantCard({ v }: { v: ScriptVariant }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (label: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="card-premium p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-gold-300 font-semibold">
          Variante {v.variant_index}
        </div>
        <button
          onClick={() => copy('full', v.full_script || `${v.hook}\n\n${v.body}\n\n${v.cta}`)}
          className="text-[0.65rem] inline-flex items-center gap-1 text-ink-400 hover:text-gold-300"
        >
          <Copy size={11} /> {copied === 'full' ? 'Kopiert!' : 'Voll kopieren'}
        </button>
      </div>

      <BlockSection label="Hook" text={v.hook} onCopy={() => copy(`hook-${v.variant_index}`, v.hook)} copied={copied === `hook-${v.variant_index}`} />
      <BlockSection label="Body" text={v.body} onCopy={() => copy(`body-${v.variant_index}`, v.body)} copied={copied === `body-${v.variant_index}`} />
      <BlockSection label="CTA"  text={v.cta}  onCopy={() => copy(`cta-${v.variant_index}`,  v.cta)}  copied={copied === `cta-${v.variant_index}`} />

      {v.full_script && (
        <div>
          <div className="text-[0.6rem] uppercase tracking-wider text-ink-500 font-semibold mb-2">Full-Script (Markdown)</div>
          <div className="bg-ink-950/60 border border-white/5 rounded-lg p-4">
            <MarkdownViewer content={v.full_script} variant="portal" />
          </div>
        </div>
      )}
    </div>
  );
}

function BlockSection({ label, text, onCopy, copied }: { label: string; text: string; onCopy: () => void; copied: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.6rem] uppercase tracking-wider text-ink-500 font-semibold">{label}</span>
        <button onClick={onCopy} className="text-[0.6rem] inline-flex items-center gap-1 text-ink-400 hover:text-gold-300">
          <Copy size={10} /> {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>
      <div className="text-sm text-ink-100 whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
        {text}
      </div>
    </div>
  );
}

// ── Brand-Create Modal ─────────────────────────────────────────
function BrandCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Brand) => void }) {
  const [name, setName] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [positioning, setPositioning] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError('Name ist Pflichtfeld.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await api<{ ok: boolean; brand: Brand }>('/api/factories/script/brands', {
        method: 'POST',
        body: JSON.stringify({ name, tone, audience, positioning })
      });
      onCreated(res.brand);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Speichern fehlgeschlagen';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card-premium p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Brand-Profile anlegen</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X size={16} /></button>
        </div>

        <Field label="Name *" value={name} onChange={setName} placeholder="z.B. CollaGlow" />
        <Field label="Tone" value={tone} onChange={setTone} placeholder="z.B. warm-direkt, premium, edgy" />
        <Field label="Zielgruppe" value={audience} onChange={setAudience} placeholder="z.B. Frauen 30+, beauty-affin" />
        <Field label="Positionierung" value={positioning} onChange={setPositioning} placeholder="z.B. einziger Beauty-Drink mit Marine-Collagen" textarea />

        {error && (
          <div className="text-[0.75rem] text-rose-300 flex items-start gap-2">
            <AlertCircle size={12} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <button onClick={save} disabled={saving} className="btn-gold w-full py-2 text-sm inline-flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Speichert …</> : <><Save size={14} /> Speichern</>}
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
          rows={3}
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
