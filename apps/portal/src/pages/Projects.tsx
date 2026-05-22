import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function Projects() {
  const { me, refresh } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', description: '', industry: '' });
  const [saving, setSaving] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/me/projects', { method: 'POST', body: JSON.stringify(form) });
      toast.success(`Projekt "${form.name}" angelegt — Dashboard + Agent provisioniert (pending)`);
      setShowCreate(false);
      setForm({ slug: '', name: '', description: '', industry: '' });
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Anlegen fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Projekte</h1>
        <button onClick={() => setShowCreate(s => !s)} className="px-4 py-2 bg-white text-neutral-950 rounded-md text-sm font-medium hover:bg-neutral-200">
          + Neues Projekt
        </button>
      </div>
      <p className="text-neutral-400 mb-8">Pro Projekt entsteht 1 Dashboard + 1 OS-Agent.</p>

      {showCreate && (
        <form onSubmit={create} className="mb-8 p-6 border border-neutral-800 rounded-lg space-y-4 bg-neutral-900/50">
          <h2 className="text-lg font-semibold">Neues Projekt anlegen</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (URL-friendly)"><input required pattern="[a-z0-9-]+" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="z.B. thailand-re" className={inputCls} /></Field>
            <Field label="Projekt-Name"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. Thailand Real Estate" className={inputCls} /></Field>
          </div>
          <Field label="Branche"><input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="z.B. real-estate" className={inputCls} /></Field>
          <Field label="Beschreibung"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} /></Field>
          <button disabled={saving} className="px-5 py-2.5 bg-white text-neutral-950 rounded-md text-sm font-medium disabled:opacity-50">
            {saving ? 'Erstelle…' : 'Anlegen'}
          </button>
        </form>
      )}

      {me?.projects.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-lg p-10 text-center text-neutral-500">
          Noch kein Projekt. Lege dein erstes Projekt an, um Dashboard + Agent zu provisionieren.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {me?.projects.map(p => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="border border-neutral-800 rounded-lg p-5 hover:border-neutral-600 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-lg">{p.name}</div>
                <span className="text-xs px-2 py-1 bg-neutral-800 rounded">{p.status}</span>
              </div>
              <div className="text-xs text-neutral-500">/{p.slug}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 transition';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium mb-2 text-neutral-300">{label}</span>{children}</label>;
}
