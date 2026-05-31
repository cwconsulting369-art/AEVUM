import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Trash2, Lock, Plus, Shield, KeyRound } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { stagger } from '@/lib/animations';
import CollaGlowDashboard from '@/components/dashboard/CollaGlowDashboard';
import AEVUMDashboard from '@/components/dashboard/AEVUMDashboard';
import UtilityHubDashboard from '@/components/dashboard/UtilityHubDashboard';
import ProjectAgentChat from '@/components/agent/ProjectAgentChat';
import QuicklinksSection from '@/components/quicklinks/QuicklinksSection';
import LeadFunnel from '@/pages/dashboards/LeadFunnel';
import Documents from '@/pages/Documents';
import CustomerActivity from '@/components/CustomerActivity';
import CommandShell from '@/components/dashboard/CommandShell';
import { getManifestByProjectSlug } from '@/lib/manifests';

type ApiRow = { id: string; service: string; key_label: string | null; scope: string; health: string; added_at: string; last_used_at: string | null };
type MeProject = { id: string; slug: string; name: string };

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('s') || 'overview';

  const [apis, setApis] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<MeProject | null>(null);

  const loadApis = async () => {
    try {
      const data = await api<{ ok: boolean; apis: ApiRow[] }>(`/api/me/projects/${slug}/apis`);
      setApis(data.apis);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.loadError'));
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api<{ ok: boolean; account: unknown; projects: MeProject[] }>('/api/me')
        .then(me => { if (active) setProject(me.projects.find(p => p.slug === slug) || null); })
        .catch(() => {}),
      loadApis()
    ]).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return <div className="card-premium p-16 flex justify-center"><Spinner size="md" /></div>;
  }

  // War-Room CommandShell (ADR-002): wenn ein Manifest für dieses Projekt existiert,
  // übernimmt die config-driven Shell die ganze Ansicht (eigene 3-Achsen-Nav).
  // Admin-Parität: gleicher Projekt-Slug → gleiches Manifest, egal welcher Account.
  const manifest = getManifestByProjectSlug(slug);
  if (manifest) {
    return <CommandShell manifest={manifest} ctx={{ leadFunnel: { slug, name: project?.name || manifest.project.label } }} />;
  }

  const isCollaGlow = slug === 'collaglow';
  const isClientZero = slug === 'aevum';
  const isUtilityHub = slug === 'utilityhub-platform' || slug === 'utilityhub';

  // UtilityHub sections — UH-Mirror in AEVUM-Portal (Block C 2026-05-26)
  if (isUtilityHub) {
    if (section === 'agent') {
      return <ProjectAgentChat projectSlug={slug} projectName={project?.name || slug} />;
    }
    if (section === 'apis') {
      return <ApisSection apis={apis} slug={slug} onRefresh={loadApis} />;
    }
    if (section === 'quicklinks') {
      return <QuicklinksSection projectSlug={slug} />;
    }
    if (section === 'docs') {
      return <Documents />;
    }
    if (section === 'activity') {
      return <CustomerActivity />;
    }
    return <UtilityHubDashboard slug={slug} section={section} />;
  }

  // CollaGlow sections
  if (isCollaGlow) {
    if (section === 'agent') {
      return <ProjectAgentChat projectSlug={slug} projectName={project?.name || slug} />;
    }
    if (section === 'apis') {
      return <ApisSection apis={apis} slug={slug} onRefresh={loadApis} />;
    }
    if (section === 'quicklinks') {
      return <QuicklinksSection projectSlug={slug} />;
    }
    if (section === 'docs') {
      return <Documents />;
    }
    if (section === 'activity') {
      return <CustomerActivity />;
    }
    return <CollaGlowDashboard section={section} />;
  }

  // Client-zero AEVUM
  if (isClientZero) {
    if (section === 'agent') {
      return <ProjectAgentChat projectSlug={slug} projectName={project?.name || slug} />;
    }
    if (section === 'apis') {
      return <ApisSection apis={apis} slug={slug} onRefresh={loadApis} />;
    }
    if (section === 'quicklinks') {
      return <QuicklinksSection projectSlug={slug} />;
    }
    if (section === 'docs') {
      return <Documents />;
    }
    if (section === 'activity') {
      return <CustomerActivity />;
    }
    return <AEVUMDashboard section={section} />;
  }

  // Generic project: overview shows Quicklinks, plus dedicated agent + api keys + quicklinks tabs
  if (section === 'agent') {
    return <ProjectAgentChat projectSlug={slug} projectName={project?.name || slug} />;
  }
  if (section === 'apis') {
    return <ApisSection apis={apis} slug={slug} onRefresh={loadApis} />;
  }
  if (section === 'quicklinks') {
    return <QuicklinksSection projectSlug={slug} />;
  }
  if (section === 'docs') {
    return <Documents />;
  }
  if (section === 'activity') {
    return <CustomerActivity />;
  }
  if (section === 'lead-funnel') {
    return <LeadFunnel projectSlug={slug} projectName={project?.name || slug} />;
  }
  // overview (default) — show quicklinks first, then API keys
  return (
    <>
      <QuicklinksSection projectSlug={slug} />
      <ApisSection apis={apis} slug={slug} onRefresh={loadApis} />
    </>
  );
}

// ── APIs Section ────────────────────────────────────────────────────────────

function ApisSection({ apis, slug, onRefresh }: { apis: ApiRow[]; slug: string; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ service: '', key_label: '', key: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/api/me/projects/${slug}/apis`, { method: 'POST', body: JSON.stringify(form) });
      toast.success(t('projects.apiSubmitSuccess', { service: form.service }));
      setForm({ service: '', key_label: '', key: '' });
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.apiSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/me/projects/${slug}/apis/${id}`, { method: 'DELETE' });
      toast.success(t('projects.apiRemoved'));
      setConfirmId(null);
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.apiRemoveError'));
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <KeyRound size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t('projects.apisTitle')}</h1>
          <p className="text-xs text-ink-400 mt-0.5">{t('projects.apisSubtitle')}</p>
        </div>
        <span className="badge badge-gold ml-auto"><Shield size={11} /> AES-256-GCM</span>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Plus size={12} className="text-gold-300" /> {t('projects.apiSubmitHeading')}
        </h2>
        <form onSubmit={submit} className="card-premium p-6 space-y-4 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('projects.fieldService')}>
              <input required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="meta_ads, klaviyo, shopify" className="input-premium" />
            </Field>
            <Field label={t('projects.fieldLabel')}>
              <input value={form.key_label} onChange={e => setForm({ ...form, key_label: e.target.value })} placeholder="production read-only" className="input-premium" />
            </Field>
          </div>
          <Field label={t('projects.fieldApiKey')}>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-300 pointer-events-none" />
              <input required type="password" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className="input-premium pl-9 font-mono" placeholder="••••••••••••••••" />
            </div>
          </Field>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
            <p className="text-[0.65rem] text-ink-400 flex-1 leading-relaxed">
              {t('projects.encryptHint')}
            </p>
            <button disabled={submitting || !form.service || !form.key} className="btn-gold shrink-0 text-sm w-full sm:w-auto justify-center">
              {submitting ? <><span className="w-3.5 h-3.5 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" /> {t('projects.submitting')}</> : <><Lock size={13} /> {t('projects.submit')}</>}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <KeyRound size={12} className="text-gold-300" /> {t('projects.apiConnectedHeading')}
          <span className="badge ml-auto">{apis.length}</span>
        </h2>
        {apis.length === 0 ? (
          <div className="card-premium p-10 text-center text-sm text-ink-400">{t('projects.apiEmpty')}</div>
        ) : (
          <div className="space-y-2">
            {apis.map((k, i) => (
              <div key={k.id} className="card-premium p-4 flex items-center justify-between gap-3 sm:gap-4 animate-fade-up" style={stagger(i, 40, 40)}>
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                    <Lock size={13} className="text-gold-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-sm flex items-center gap-2 min-w-0">
                      <span className="truncate">{k.service}</span>
                      {k.key_label && <span className="text-ink-400 text-xs truncate">— {k.key_label}</span>}
                    </div>
                    <div className="text-[0.65rem] text-ink-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="badge">{k.scope}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className={`dot ${k.health === 'healthy' ? 'dot-ok' : k.health === 'unhealthy' ? 'dot-warn' : 'dot-off'}`} />
                        {k.health}
                      </span>
                      <span>·</span>
                      <span>{new Date(k.added_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>
                {confirmId === k.id ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setConfirmId(null)} className="text-xs text-ink-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition">{t('projects.cancel')}</button>
                    <button onClick={() => remove(k.id)} className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-md hover:bg-rose-500/20 transition">{t('projects.confirmDelete')}</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(k.id)} className="text-ink-400 hover:text-rose-300 p-2 rounded-md hover:bg-rose-500/10 transition shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
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
