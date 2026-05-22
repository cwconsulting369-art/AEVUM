import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const INDUSTRIES = ['real-estate','e-commerce','b2b-saas','consulting','agency','finance','healthcare','manufacturing','education','hospitality','energy-consulting','ai-systems','other'];
const TEAM_SIZES = ['1-5','6-20','21-100','101-500','500+'];
const REVENUE_BANDS = ['<100k','100k-1M','1M-10M','10M-100M','100M+'];
const VISIBILITIES = ['private','network','public'];

export default function Profile() {
  const { me, refresh } = useAuth();
  const [form, setForm] = useState({
    display_name: me?.profile?.display_name || '',
    industry: me?.profile?.industry || '',
    team_size: me?.profile?.team_size || '',
    revenue_band: me?.profile?.revenue_band || '',
    vision: me?.profile?.vision || '',
    bio: me?.profile?.bio || '',
    visibility: me?.profile?.visibility || 'private'
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/me/profile', { method: 'PATCH', body: JSON.stringify(form) });
      toast.success('Profil gespeichert');
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Profil</h1>
      <p className="text-neutral-400 mb-8">Dein Netzwerk-Profil. Sichtbarkeit kontrollierst du selbst.</p>
      <form onSubmit={save} className="space-y-5 max-w-2xl">
        <Field label="Anzeigename"><input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className={inputCls} /></Field>
        <Field label="Branche">
          <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className={inputCls}>
            <option value="">— wählen —</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Team-Größe">
          <select value={form.team_size} onChange={e => setForm({ ...form, team_size: e.target.value })} className={inputCls}>
            <option value="">— wählen —</option>
            {TEAM_SIZES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Umsatz-Band">
          <select value={form.revenue_band} onChange={e => setForm({ ...form, revenue_band: e.target.value })} className={inputCls}>
            <option value="">— wählen —</option>
            {REVENUE_BANDS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Vision">
          <textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <Field label="Bio">
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className={inputCls} />
        </Field>
        <Field label="Sichtbarkeit im Netzwerk">
          <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })} className={inputCls}>
            {VISIBILITIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <button disabled={saving} className="px-6 py-3 bg-white text-neutral-950 font-medium rounded-md hover:bg-neutral-200 disabled:opacity-50">
          {saving ? 'Speichere…' : 'Speichern'}
        </button>
      </form>
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 transition';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium mb-2 text-neutral-300">{label}</span>{children}</label>;
}
