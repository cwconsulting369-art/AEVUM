import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const FLAGS = [
  { key: 'share_logo', label: 'Logo zeigen' },
  { key: 'share_company_name', label: 'Firmenname zeigen' },
  { key: 'share_industry', label: 'Branche zeigen' },
  { key: 'share_revenue_band', label: 'Umsatz-Band zeigen' },
  { key: 'share_team_size', label: 'Team-Größe zeigen' },
  { key: 'share_kpis', label: 'Konkrete KPIs zeigen' },
  { key: 'share_kpi_deltas', label: 'KPI-Veränderungen zeigen (vorher → nachher)' },
  { key: 'share_case_study', label: 'Case-Study veröffentlichen' },
  { key: 'share_testimonial_quote', label: 'Testimonial-Zitat veröffentlichen' },
  { key: 'share_video_testimonial', label: 'Video-Testimonial veröffentlichen' }
];
const CHANNELS = [
  { key: 'channel_website', label: 'AEVUM-Website' },
  { key: 'channel_linkedin', label: 'LinkedIn' },
  { key: 'channel_pitchdeck', label: 'Pitchdeck (Sales-Material)' },
  { key: 'channel_internal_network', label: 'AEVUM-Netzwerk-Intern' }
];
const ANONYMIZE = [
  { key: 'anonymize_revenue', label: 'Umsatzzahlen anonymisieren ("7-stelliges Business")' },
  { key: 'anonymize_industry_detail', label: 'Branchen-Detail anonymisieren' }
];

export default function Permissions() {
  const { me, refresh } = useAuth();
  const [state, setState] = useState<Record<string, boolean>>({ ...(me?.permissions || {}) });
  const [saving, setSaving] = useState(false);

  const toggle = (k: string) => setState(s => ({ ...s, [k]: !s[k] }));

  const save = async () => {
    setSaving(true);
    try {
      const patch: Record<string, boolean> = {};
      for (const arr of [FLAGS, CHANNELS, ANONYMIZE]) {
        for (const f of arr) patch[f.key] = !!state[f.key];
      }
      await api('/api/me/permissions', { method: 'PATCH', body: JSON.stringify(patch) });
      toast.success('Permissions gespeichert + signiert');
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Permissions</h1>
      <p className="text-neutral-400 mb-8">Du kontrollierst, was AEVUM von dir teilen darf. Default: nichts public.</p>

      <Section title="Was darf AEVUM zeigen">
        {FLAGS.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
      </Section>

      <Section title="Auf welchen Kanälen">
        {CHANNELS.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
      </Section>

      <Section title="Anonymisierung">
        {ANONYMIZE.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
      </Section>

      <button disabled={saving} onClick={save} className="px-6 py-3 bg-white text-neutral-950 font-medium rounded-md hover:bg-neutral-200 disabled:opacity-50">
        {saving ? 'Speichere…' : 'Permissions speichern + signieren'}
      </button>
      {me?.permissions?.consent_date && (
        <p className="text-xs text-neutral-500 mt-3">Zuletzt signiert: {new Date(me.permissions.consent_date).toLocaleString('de-DE')}</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 text-neutral-200">{title}</h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Toggle({ flag, label, on, onToggle }: { flag: string; label: string; on: boolean; onToggle: (k: string) => void }) {
  return (
    <button onClick={() => onToggle(flag)} className="flex items-center justify-between w-full px-4 py-3 border border-neutral-800 rounded-md hover:bg-neutral-900 transition text-left">
      <span className="text-sm">{label}</span>
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${on ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}
