import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Trash2 } from 'lucide-react';

type ApiRow = { id: string; service: string; key_label: string | null; scope: string; health: string; added_at: string; last_used_at: string | null };

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const [apis, setApis] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ service: '', key_label: '', key: '' });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => { load(); }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/api/me/projects/${slug}/apis`, { method: 'POST', body: JSON.stringify(form) });
      toast.success(`API-Key "${form.service}" eingereicht (verschlüsselt)`);
      setForm({ service: '', key_label: '', key: '' });
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Einreichen fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('API-Key wirklich entfernen?')) return;
    try {
      await api(`/api/me/projects/${slug}/apis/${id}`, { method: 'DELETE' });
      toast.success('API-Key entfernt');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Löschen fehlgeschlagen');
    }
  };

  return (
    <div>
      <Link to="/projects" className="text-sm text-neutral-500 hover:text-neutral-200 mb-4 inline-block">← Projekte</Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">/{slug}</h1>
      <p className="text-neutral-400 mb-8">Read-only API-Keys für dein Projekt verwalten.</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Neuen API-Key einreichen</h2>
        <form onSubmit={submit} className="p-6 border border-neutral-800 rounded-lg bg-neutral-900/50 space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Service"><input required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="z.B. stripe, klaviyo, google-ads" className={inputCls} /></Field>
            <Field label="Label (optional)"><input value={form.key_label} onChange={e => setForm({ ...form, key_label: e.target.value })} placeholder="z.B. 'production read-only'" className={inputCls} /></Field>
          </div>
          <Field label="API-Key (wird sofort verschlüsselt)">
            <input required type="password" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className={inputCls} />
          </Field>
          <p className="text-xs text-neutral-500">
            Schlüssel wird mit AES-256-GCM verschlüsselt gespeichert. Der entschlüsselte Wert wird nur on-the-fly für API-Calls aus deinem Projekt verwendet.
          </p>
          <button disabled={submitting} className="px-5 py-2.5 bg-white text-neutral-950 rounded-md text-sm font-medium disabled:opacity-50">
            {submitting ? 'Einreichen…' : 'Einreichen + verschlüsseln'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Eingereichte API-Keys</h2>
        {loading ? (
          <div className="text-neutral-500">Lade…</div>
        ) : apis.length === 0 ? (
          <div className="text-neutral-500 text-sm border border-dashed border-neutral-800 rounded-lg p-6 text-center">
            Noch keine API-Keys eingereicht.
          </div>
        ) : (
          <div className="space-y-2">
            {apis.map(k => (
              <div key={k.id} className="flex items-center justify-between border border-neutral-800 rounded-md p-4">
                <div>
                  <div className="font-medium">{k.service}{k.key_label && <span className="text-neutral-500 ml-2">— {k.key_label}</span>}</div>
                  <div className="text-xs text-neutral-500 mt-1">{k.scope} · health: {k.health} · {new Date(k.added_at).toLocaleDateString('de-DE')}</div>
                </div>
                <button onClick={() => remove(k.id)} className="text-neutral-500 hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 transition';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium mb-2 text-neutral-300">{label}</span>{children}</label>;
}
