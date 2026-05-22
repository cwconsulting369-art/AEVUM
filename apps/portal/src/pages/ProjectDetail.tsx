import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Trash2, ArrowLeft, KeyRound, Lock, Plus, Shield, BarChart3, Layers, Workflow } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { stagger } from '@/lib/animations';
import { useAuth } from '@/lib/auth';
import {
  loadIndustryTemplate,
  type IndustryTemplate,
} from '@/templates/industry-dashboards';
import { formatKpiValue, resolveSource } from '@/templates/industry-dashboards/format';

type ApiRow = { id: string; service: string; key_label: string | null; scope: string; health: string; added_at: string; last_used_at: string | null };

type ProjectDetailPayload = {
  id: string;
  slug: string;
  name: string;
  industry?: string | null;
  metrics?: Record<string, unknown> | null;
};

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const { me } = useAuth();
  const [apis, setApis] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ service: '', key_label: '', key: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [template, setTemplate] = useState<IndustryTemplate | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetailPayload | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ ok: boolean; apis: ApiRow[] }>(`/api/me/projects/${slug}/apis`);
      setApis(data.apis);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Industry-Template laden.
   *
   * project.industry kommt momentan nur via auth.me NICHT — die Me-Liste
   * hat keine industry. Wir versuchen daher einen Detail-Endpoint und
   * fallen sonst auf den Slug-Heuristik / default zurück. Existing Backend
   * ohne /detail-Endpoint führt nur zum default-Template (kein Crash).
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let industry: string | null | undefined = null;
      let detail: ProjectDetailPayload | null = null;
      try {
        // Optional Detail-Endpoint; existiert evtl. noch nicht — silent fallback.
        detail = await api<ProjectDetailPayload>(`/api/me/projects/${slug}`);
        industry = detail?.industry ?? null;
      } catch {
        // ignore — Detail-Endpoint optional
      }
      if (cancelled) return;
      setProjectDetail(detail);
      const tpl = await loadIndustryTemplate(industry);
      if (!cancelled) setTemplate(tpl);
    })();
    return () => { cancelled = true; };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [slug, me?.account?.id]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/api/me/projects/${slug}/apis`, { method: 'POST', body: JSON.stringify(form) });
      toast.success(`API-Key "${form.service}" eingereicht — AES-256-GCM verschlüsselt`);
      setForm({ service: '', key_label: '', key: '' });
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Einreichen fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/me/projects/${slug}/apis/${id}`, { method: 'DELETE' });
      toast.success('API-Key entfernt');
      setConfirmId(null);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Löschen fehlgeschlagen');
    }
  };

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-white mb-6 transition">
        <ArrowLeft size={14} /> Projekte
      </Link>

      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
            <KeyRound size={12} /> Projekt
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">/{slug}</h1>
          <p className="text-ink-400 mt-2">Read-only API-Keys deines Projekts verwalten.</p>
        </div>
        <div className="badge badge-gold">
          <Shield size={11} /> AES-256-GCM
        </div>
      </header>

      <IndustryDashboard template={template} projectDetail={projectDetail} />

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus size={14} className="text-gold-300" /> Neuen API-Key einreichen
        </h2>
        <form onSubmit={submit} className="card-premium p-6 space-y-4 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Service">
              <input required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="stripe, klaviyo, google-ads" className="input-premium" />
            </Field>
            <Field label="Label (optional)">
              <input value={form.key_label} onChange={e => setForm({ ...form, key_label: e.target.value })} placeholder="production read-only" className="input-premium" />
            </Field>
          </div>
          <Field label="API-Key (wird sofort verschlüsselt)">
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-300 pointer-events-none" />
              <input required type="password" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className="input-premium pl-10 font-mono" placeholder="••••••••••••••••" />
            </div>
          </Field>
          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-[0.7rem] text-ink-400 leading-relaxed flex-1">
              Schlüssel wird mit AES-256-GCM verschlüsselt. Decrypt nur on-the-fly für API-Calls aus deinem Projekt.
            </p>
            <button disabled={submitting || !form.service || !form.key} className="btn-gold shrink-0">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" /> Einreichen…</>
              ) : (
                <><Lock size={14} /> Einreichen + Verschlüsseln</>
              )}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <KeyRound size={14} className="text-gold-300" /> Eingereichte API-Keys
          <span className="badge ml-auto">{apis.length}</span>
        </h2>
        {loading ? (
          <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>
        ) : apis.length === 0 ? (
          <EmptyKeys />
        ) : (
          <div className="space-y-2">
            {apis.map((k, i) => (
              <div
                key={k.id}
                className="card-premium p-4 flex items-center justify-between gap-4 animate-fade-up"
                style={stagger(i, 40, 40)}
              >
                <div className="min-w-0 flex-1 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/25 flex items-center justify-center shrink-0">
                    <Lock size={14} className="text-gold-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white flex items-center gap-2 truncate">
                      <span className="truncate">{k.service}</span>
                      {k.key_label && <span className="text-ink-400 text-xs truncate">— {k.key_label}</span>}
                    </div>
                    <div className="text-[0.7rem] text-ink-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="badge">{k.scope}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className={`dot ${k.health === 'healthy' ? 'dot-ok' : k.health === 'unhealthy' ? 'dot-warn' : 'dot-off'}`} />
                        {k.health}
                      </span>
                      <span>·</span>
                      <span>seit {new Date(k.added_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>
                {confirmId === k.id ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <button onClick={() => setConfirmId(null)} className="text-xs text-ink-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition">
                      Abbrechen
                    </button>
                    <button onClick={() => remove(k.id)} className="text-xs text-rose-300 hover:text-rose-200 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-md transition">
                      Löschen bestätigen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(k.id)}
                    className="text-ink-400 hover:text-rose-300 p-2 rounded-md hover:bg-rose-500/10 transition shrink-0"
                    aria-label="API-Key entfernen"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
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

/**
 * Industry-spezifisches Dashboard.
 *
 * - Lädt template lazy via loadIndustryTemplate
 * - Rendert KPI-Strip mit "—" für nicht-vorhandene Sources
 * - Zeigt Empty-State, wenn keinerlei project.metrics existiert
 * - Listet Module + Recommended-Workflows als Outline (Renderer-Stubs
 *   für Sections sind out-of-scope dieser Phase)
 */
function IndustryDashboard({
  template,
  projectDetail,
}: {
  template: IndustryTemplate | null;
  projectDetail: ProjectDetailPayload | null;
}) {
  if (!template) {
    return (
      <section className="mb-10">
        <div className="card-premium p-6 flex items-center justify-center min-h-[120px]">
          <Spinner size="sm" />
        </div>
      </section>
    );
  }

  // Source-Pfade beginnen mit "project." → wir wrappen die Detail-Payload
  // unter dem Schlüssel "project", damit "project.metrics.x" auflösbar ist.
  const sourceRoot = { project: projectDetail ?? { metrics: null } };
  const hasAnyMetrics =
    !!projectDetail?.metrics && Object.keys(projectDetail.metrics).length > 0;

  return (
    <>
      <section className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} className="text-gold-300" />
            {template.display_name}
          </h2>
          <span className="badge text-[0.65rem]">{template.industry}</span>
        </div>

        {/* KPI-Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {template.kpi_strip.map((kpi, i) => {
            const raw = resolveSource(sourceRoot, kpi.source);
            const display = formatKpiValue(raw, kpi.format);
            return (
              <div
                key={kpi.id}
                className="card-premium p-4 animate-fade-up"
                style={stagger(i, 40, 30)}
                title={kpi.hint || ''}
              >
                <div className="text-[0.65rem] text-ink-400 uppercase tracking-wider mb-1.5 truncate">
                  {kpi.label}
                </div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {display}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty-State-Hint, wenn keine echten Daten */}
        {!hasAnyMetrics && (
          <div className="mt-4 card-premium p-4 flex items-start gap-3 border-dashed">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/25 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-gold-300" />
            </div>
            <div className="text-xs text-ink-300 leading-relaxed">
              {template.empty_state_hint}
            </div>
          </div>
        )}
      </section>

      {/* Recommended Workflows */}
      {template.recommended_workflows.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Workflow size={14} className="text-gold-300" /> Empfohlene Workflows
            <span className="badge ml-auto">{template.recommended_workflows.length}</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {template.recommended_workflows.map((wf, i) => (
              <div
                key={wf}
                className="card-premium p-3 flex items-center justify-between gap-3 animate-fade-up"
                style={stagger(i, 30, 20)}
              >
                <div className="font-mono text-xs text-white truncate">{wf}</div>
                <span className="badge shrink-0">blueprint</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Module-Outline (Renderer-Stubs) */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={14} className="text-gold-300" /> Dashboard-Module
          <span className="badge ml-auto">{template.default_modules.length}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {template.default_modules.map(m => (
            <span key={m} className="badge font-mono text-[0.7rem]">{m}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function EmptyKeys() {
  return (
    <div className="card-premium p-10 text-center">
      <svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto mb-4 opacity-70">
        <defs>
          <linearGradient id="key-empty" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0a458" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a86d27" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="26" cy="36" r="12" fill="none" stroke="url(#key-empty)" strokeWidth="1.5" />
        <path d="M38 36 L58 36 M52 36 L52 44 M58 36 L58 44" stroke="url(#key-empty)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="26" cy="36" r="3" fill="#e0a458" opacity="0.6" />
      </svg>
      <div className="text-sm text-ink-300">Noch keine API-Keys eingereicht.</div>
    </div>
  );
}
