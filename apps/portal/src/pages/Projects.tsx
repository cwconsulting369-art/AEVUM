import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FolderGit2, Plus, ArrowRight, X, Sparkles, Eye, Shield } from 'lucide-react';
import { stagger } from '@/lib/animations';

export default function Projects() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', description: '', industry: '' });
  const [saving, setSaving] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/me/projects', { method: 'POST', body: JSON.stringify(form) });
      toast.success(t('projects.createSuccess', { name: form.name }));
      setShowCreate(false);
      setForm({ slug: '', name: '', description: '', industry: '' });
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.createError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
            <FolderGit2 size={12} /> {t('projects.eyebrow')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('projects.title')}</h1>
        </div>
        <button onClick={() => setShowCreate(s => !s)} className="btn-gold text-sm w-full sm:w-auto justify-center">
          {showCreate ? <><X size={14} /> {t('projects.cancel')}</> : <><Plus size={14} /> {t('projects.newProject')}</>}
        </button>
      </header>
      <p className="text-ink-400 mb-10">{t('projects.subtitle')}</p>

      {/* Create form (slide-down) */}
      {showCreate && (
        <form
          onSubmit={create}
          className="card-premium p-6 mb-8 space-y-4 animate-slide-up overflow-hidden"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Sparkles size={14} className="text-gold-300" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{t('projects.createHeading')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('projects.fieldSlug')}>
              <input required pattern="[a-z0-9-]+" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="thailand-re" className="input-premium font-mono" />
            </Field>
            <Field label={t('projects.fieldName')}>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Thailand Real Estate" className="input-premium" />
            </Field>
          </div>
          <Field label={t('projects.fieldIndustry')}>
            <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="real-estate" className="input-premium" />
          </Field>
          <Field label={t('projects.fieldDescription')}>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-premium resize-none" placeholder={t('projects.descriptionPlaceholder')} />
          </Field>
          <button disabled={saving} className="btn-gold">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" /> {t('projects.creating')}</>
            ) : (
              <>{t('projects.create')} <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      )}

      {me?.is_operator && (
        <div className="card-premium p-4 mb-6 flex items-start gap-3 border-l-2 border-gold-400/40 bg-gold-400/[0.04]">
          <Shield size={18} className="text-gold-300 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white mb-0.5">{t('projects.operatorViewTitle')}</div>
            <p className="text-xs text-ink-400 leading-relaxed">
              {t('projects.operatorViewDescPrefix')}<span className="text-gold-200">{t('projects.operatorViewReadOnly')}</span>{t('projects.operatorViewDescSuffix')}
            </p>
          </div>
        </div>
      )}

      {me?.projects.length === 0 ? (
        <EmptyProjects onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {me?.projects.map((p, i) => {
            const isOperatorView = (p as { _operator_view?: boolean })._operator_view === true;
            const ownerName = (p as { owner_name?: string }).owner_name;
            return (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className={`card-premium block p-6 group animate-fade-up ${isOperatorView ? 'border border-white/5' : ''}`}
                style={stagger(i, 50, 60)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-lg text-white truncate group-hover:text-gold-100 transition">{p.name}</div>
                    <div className="text-xs text-ink-400 mt-1 font-mono">/{p.slug}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`badge ${p.status === 'active' ? 'badge-emerald' : ''}`}>
                      <span className={`dot ${p.status === 'active' ? 'dot-ok' : 'dot-off'}`} />
                      {p.status}
                    </span>
                    {isOperatorView && (
                      <span className="badge badge-gold text-[0.6rem]">
                        <Eye size={9} className="inline mr-1" /> {t('projects.badgeOperator')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                  <span className="text-xs text-ink-400 truncate">
                    {isOperatorView && ownerName ? <>{t('projects.cardOwner')}<span className="text-ink-200">{ownerName}</span></> : t('projects.cardDetails')}
                  </span>
                  <ArrowRight size={14} className="text-ink-500 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
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

function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="card-premium p-12 text-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto mb-5 opacity-70">
        <defs>
          <linearGradient id="proj-empty" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0a458" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a86d27" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect x="16" y="28" width="36" height="48" rx="6" fill="none" stroke="url(#proj-empty)" strokeWidth="1.5" />
        <rect x="44" y="22" width="36" height="48" rx="6" fill="none" stroke="url(#proj-empty)" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M20 38 L40 38 M20 44 L34 44" stroke="url(#proj-empty)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="62" cy="46" r="2" fill="#e0a458" opacity="0.8" />
      </svg>
      <div className="text-base text-white font-medium mb-1.5">{t('projects.emptyTitle')}</div>
      <div className="text-sm text-ink-400 mb-6 max-w-xs mx-auto">
        {t('projects.emptyDesc')}
      </div>
      <button onClick={onCreate} className="btn-gold">
        <Plus size={14} /> {t('projects.emptyButton')}
      </button>
    </div>
  );
}
