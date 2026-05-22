import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Trash2, ArrowLeft, KeyRound, Lock, Plus, Shield,
  LayoutDashboard, Workflow, Settings as SettingsIcon
} from 'lucide-react';
import Spinner from '@/components/Spinner';
import { stagger } from '@/lib/animations';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';

type ApiRow = { id: string; service: string; key_label: string | null; scope: string; health: string; added_at: string; last_used_at: string | null };
type MeAccount = { id: string; slug: string; name: string; client_zero: boolean };
type MeProject = { id: string; slug: string; name: string };

type TabKey = 'dashboard' | 'apis' | 'workflows' | 'settings';

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const [apis, setApis] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ service: '', key_label: '', key: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [account, setAccount] = useState<MeAccount | null>(null);
  const [project, setProject] = useState<MeProject | null>(null);
  const [tab, setTab] = useState<TabKey>('apis');

  const isClientZeroAevum = useMemo(
    () => !!(account?.client_zero && slug === 'aevum'),
    [account, slug]
  );

  const loadApis = async () => {
    try {
      const data = await api<{ ok: boolean; apis: ApiRow[] }>(`/api/me/projects/${slug}/apis`);
      setApis(data.apis);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Laden fehlgeschlagen');
    }
  };

  const loadMe = async () => {
    try {
      const me = await api<{ ok: boolean; account: MeAccount; projects: MeProject[] }>(`/api/me`);
      setAccount(me.account);
      const p = me.projects.find(pr => pr.slug === slug) || null;
      setProject(p);
      // Default tab: dashboard for client-zero AEVUM, APIs otherwise.
      if (me.account?.client_zero && slug === 'aevum') setTab('dashboard');
    } catch {
      /* non-fatal — tabs gracefully degrade */
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([loadApis(), loadMe()]).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/api/me/projects/${slug}/apis`, { method: 'POST', body: JSON.stringify(form) });
      toast.success(`API-Key "${form.service}" eingereicht — AES-256-GCM verschlüsselt`);
      setForm({ service: '', key_label: '', key: '' });
      await loadApis();
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
      await loadApis();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Löschen fehlgeschlagen');
    }
  };

  const projectName = project?.name || `/${slug}`;

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-white mb-6 transition">
        <ArrowLeft size={14} /> Projekte
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
            <KeyRound size={12} /> Projekt
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{projectName}</h1>
          <p className="text-ink-400 mt-2 font-mono text-sm">/{slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {isClientZeroAevum && <span className="badge badge-gold">Client Zero</span>}
          <span className="badge badge-gold"><Shield size={11} /> AES-256-GCM</span>
        </div>
      </header>

      {/* Tabs (only for client-zero AEVUM — keeps existing UX unchanged for everyone else) */}
      {isClientZeroAevum && (
        <div className="border-b border-white/[0.06] mb-8 overflow-x-auto">
          <nav className="flex items-center gap-1 min-w-max" role="tablist" aria-label="Projekt-Bereiche">
            <TabButton tab="dashboard" active={tab} onClick={setTab} icon={<LayoutDashboard size={13} />}>
              Übersicht
            </TabButton>
            <TabButton tab="apis" active={tab} onClick={setTab} icon={<KeyRound size={13} />}>
              API-Keys
            </TabButton>
            <TabButton tab="workflows" active={tab} onClick={setTab} icon={<Workflow size={13} />}>
              Workflows
            </TabButton>
            <TabButton tab="settings" active={tab} onClick={setTab} icon={<SettingsIcon size={13} />}>
              Settings
            </TabButton>
          </nav>
        </div>
      )}

      {loading && (
        <div className="card-premium p-16 flex justify-center"><Spinner size="md" /></div>
      )}

      {!loading && tab === 'dashboard' && isClientZeroAevum && (
        <BusinessDashboard slug={slug} />
      )}

      {!loading && tab === 'apis' && (
        <ApisSection
          apis={apis}
          form={form}
          setForm={setForm}
          submit={submit}
          submitting={submitting}
          confirmId={confirmId}
          setConfirmId={setConfirmId}
          remove={remove}
        />
      )}

      {!loading && tab === 'workflows' && isClientZeroAevum && (
        <PlaceholderCard label="Workflows" hint="Workflow-Übersicht folgt — n8n-Scenarios werden hier sichtbar." />
      )}
      {!loading && tab === 'settings' && isClientZeroAevum && (
        <PlaceholderCard label="Settings" hint="Projekt-Konfiguration folgt — Blueprint-Version, Permissions, Deployment." />
      )}
    </div>
  );
}

function TabButton({
  tab, active, onClick, icon, children
}: {
  tab: TabKey;
  active: TabKey;
  onClick: (t: TabKey) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isActive = tab === active;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onClick(tab)}
      className={[
        'inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition rounded-t-md border-b-2 -mb-px',
        isActive
          ? 'text-white border-gold-300 bg-white/[0.025]'
          : 'text-ink-400 hover:text-white border-transparent hover:bg-white/[0.02]'
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

function PlaceholderCard({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="card-premium p-12 text-center">
      <div className="text-sm text-ink-300 font-medium mb-1">{label}</div>
      <div className="text-xs text-ink-400">{hint}</div>
    </div>
  );
}

function ApisSection({
  apis, form, setForm, submit, submitting, confirmId, setConfirmId, remove
}: {
  apis: ApiRow[];
  form: { service: string; key_label: string; key: string };
  setForm: React.Dispatch<React.SetStateAction<{ service: string; key_label: string; key: string }>>;
  submit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
  remove: (id: string) => Promise<void>;
}) {
  return (
    <>
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
        {apis.length === 0 ? (
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
