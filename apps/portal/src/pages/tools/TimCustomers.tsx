// Tim-Customer-Management — Whitelist-gated, optional Premium-Feature.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  ArrowLeft, Plus, Users, Loader2, AlertCircle, Save, X,
  Edit3, Trash2, Sparkles, Globe, Megaphone
} from 'lucide-react';
import Spinner from '@/components/Spinner';

const TIM_WHITELIST = new Set(['carlos@aevum-system.de', 'cwconsulting369@gmail.com', 'tim@knightvision.tech']);

interface TimCustomer {
  id: string;
  customer_name: string;
  customer_email?: string;
  niche?: string;
  product_category?: string;
  ad_platforms?: string[];
  brand_voice?: string;
  target_icp?: string;
  awareness_stage?: string;
  enrichment_data?: Record<string, unknown> | null;
  last_run_at?: string | null;
  created_at?: string;
}

const PLATFORMS = ['meta', 'google', 'tiktok'];
const AWARENESS = ['unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'];

export default function TimCustomers() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const nav = useNavigate();
  const isTim = !!(me?.account.email && TIM_WHITELIST.has(me.account.email.toLowerCase()));

  useEffect(() => {
    if (me && !isTim) nav('/tools/script-factory', { replace: true });
  }, [me, isTim, nav]);

  const [customers, setCustomers] = useState<TimCustomer[] | null>(null);
  const [editing, setEditing] = useState<TimCustomer | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    api<{ ok: boolean; customers: TimCustomer[] }>('/api/factories/script/tim-customers')
      .then(r => setCustomers(r.customers || []))
      .catch(e => { setError(e instanceof Error ? e.message : t('tools.tim.loadError')); setCustomers([]); });
  };

  useEffect(() => { if (isTim) reload(); }, [isTim]);

  async function remove(id: string) {
    if (!confirm(t('tools.tim.deleteConfirm'))) return;
    try {
      await api(`/api/factories/script/tim-customers/${id}`, { method: 'DELETE' });
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('tools.tim.deleteFailed'));
    }
  }

  if (!me) return null;
  if (!isTim) return null;
  if (customers === null) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link to="/tools/script-factory" className="text-[0.7rem] text-ink-400 hover:text-white inline-flex items-center gap-1.5 mb-3">
          <ArrowLeft size={12} /> {t('tools.tim.backToFactory')}
        </Link>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Users size={12} /> {t('tools.tim.mode')}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('tools.tim.title')}</h1>
        <p className="text-ink-400 mt-2 text-sm">
          {t('tools.tim.subtitle')}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-[0.8rem] text-rose-200">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-300">
          {customers.length} {customers.length === 1 ? t('tools.tim.customerSingular') : t('tools.tim.customerPlural')}
        </div>
        <button onClick={() => setShowNew(true)} className="btn-gold py-2 px-3 text-xs inline-flex items-center gap-1.5">
          <Plus size={12} /> {t('tools.tim.newCustomer')}
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <Users size={32} className="mx-auto text-ink-500 mb-3" />
          <div className="text-sm font-semibold text-white mb-1">{t('tools.tim.noCustomers')}</div>
          <div className="text-xs text-ink-400">{t('tools.tim.noCustomersHint')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {customers.map(c => (
            <div key={c.id} className="card-premium p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-base font-semibold text-white truncate">{c.customer_name}</div>
                  {c.customer_email && (
                    <div className="text-[0.7rem] text-ink-500 truncate">{c.customer_email}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="p-1.5 text-ink-400 hover:text-gold-300 transition rounded">
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-ink-400 hover:text-rose-300 transition rounded">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                {c.niche && (
                  <div className="flex items-center gap-1.5 text-ink-300">
                    <Globe size={11} className="text-ink-500" /> {c.niche}
                  </div>
                )}
                {c.ad_platforms && c.ad_platforms.length > 0 && (
                  <div className="flex items-center gap-1.5 text-ink-300">
                    <Megaphone size={11} className="text-ink-500" /> {c.ad_platforms.join(', ')}
                  </div>
                )}
                {c.last_run_at && (
                  <div className="text-[0.65rem] text-ink-500 mt-2">
                    {t('tools.tim.lastRun', { date: new Date(c.last_run_at).toLocaleDateString('de-DE') })}
                  </div>
                )}
              </div>
              <Link
                to={`/tools/script-factory?customer=${c.id}`}
                className="btn-ghost mt-4 py-1.5 px-3 text-[0.7rem] inline-flex items-center justify-center gap-1.5"
              >
                <Sparkles size={11} /> {t('tools.tim.startRun')}
              </Link>
            </div>
          ))}
        </div>
      )}

      {(showNew || editing) && (
        <CustomerModal
          initial={editing}
          onClose={() => { setShowNew(false); setEditing(null); }}
          onSaved={() => { setShowNew(false); setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}

// ── Modal ──
function CustomerModal({
  initial, onClose, onSaved
}: { initial: TimCustomer | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.customer_name || '');
  const [email, setEmail] = useState(initial?.customer_email || '');
  const [niche, setNiche] = useState(initial?.niche || '');
  const [productCategory, setProductCategory] = useState(initial?.product_category || '');
  const [platforms, setPlatforms] = useState<string[]>(initial?.ad_platforms || []);
  const [brandVoice, setBrandVoice] = useState(initial?.brand_voice || '');
  const [targetIcp, setTargetIcp] = useState(initial?.target_icp || '');
  const [awareness, setAwareness] = useState(initial?.awareness_stage || 'problem_aware');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const save = async () => {
    if (!name.trim()) { setErr(t('tools.tim.nameRequired')); return; }
    setSaving(true);
    setErr(null);
    try {
      const body = {
        customer_name: name,
        customer_email: email || null,
        niche: niche || null,
        product_category: productCategory || null,
        ad_platforms: platforms,
        brand_voice: brandVoice || null,
        target_icp: targetIcp || null,
        awareness_stage: awareness,
      };
      if (isEdit) {
        await api(`/api/factories/script/tim-customers/${initial?.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await api('/api/factories/script/tim-customers', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t('tools.tim.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card-premium p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{isEdit ? t('tools.tim.editCustomer') : t('tools.tim.newCustomer')}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X size={16} /></button>
        </div>

        <Field label={t('tools.tim.fieldName')}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t('tools.tim.fieldNamePlaceholder')} className="input-premium" />
        </Field>

        <Field label={t('tools.tim.fieldEmail')}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('tools.tim.fieldEmailPlaceholder')} className="input-premium" />
        </Field>

        <Field label={t('tools.tim.fieldNiche')}>
          <input value={niche} onChange={e => setNiche(e.target.value)} placeholder={t('tools.tim.fieldNichePlaceholder')} className="input-premium" />
        </Field>

        <Field label={t('tools.tim.fieldProductCategory')}>
          <input value={productCategory} onChange={e => setProductCategory(e.target.value)} placeholder={t('tools.tim.fieldProductCategoryPlaceholder')} className="input-premium" />
        </Field>

        <Field label={t('tools.tim.fieldPlatforms')}>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs border transition capitalize',
                  platforms.includes(p)
                    ? 'bg-gold-400/15 border-gold-400/40 text-gold-300'
                    : 'bg-white/3 border-white/10 text-ink-400 hover:border-white/20'
                ].join(' ')}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('tools.tim.fieldBrandVoice')}>
          <textarea
            value={brandVoice}
            onChange={e => setBrandVoice(e.target.value)}
            placeholder={t('tools.tim.fieldBrandVoicePlaceholder')}
            rows={3}
            className="input-premium resize-none"
          />
        </Field>

        <Field label={t('tools.tim.fieldTargetIcp')}>
          <textarea
            value={targetIcp}
            onChange={e => setTargetIcp(e.target.value)}
            placeholder={t('tools.tim.fieldTargetIcpPlaceholder')}
            rows={3}
            className="input-premium resize-none"
          />
        </Field>

        <Field label={t('tools.tim.fieldAwareness')}>
          <select value={awareness} onChange={e => setAwareness(e.target.value)} className="input-premium">
            {AWARENESS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
          </select>
        </Field>

        {err && (
          <div className="text-[0.75rem] text-rose-300 flex items-start gap-2">
            <AlertCircle size={12} className="mt-0.5 shrink-0" /> {err}
          </div>
        )}

        <button onClick={save} disabled={saving} className="btn-gold w-full py-2 text-sm inline-flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin" /> {t('tools.tim.saving')}</> : <><Save size={14} /> {t('tools.tim.save')}</>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
