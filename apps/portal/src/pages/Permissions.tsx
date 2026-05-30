import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldCheck, Megaphone, Share2, EyeOff, Save, Lock } from 'lucide-react';

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
  const [confirm, setConfirm] = useState(false);

  const toggle = (k: string) => setState(s => ({ ...s, [k]: !s[k] }));

  const doSave = async () => {
    setSaving(true);
    setConfirm(false);
    try {
      const patch: Record<string, boolean> = {};
      for (const arr of [FLAGS, CHANNELS, ANONYMIZE]) {
        for (const f of arr) patch[f.key] = !!state[f.key];
      }
      await api('/api/me/permissions', { method: 'PATCH', body: JSON.stringify(patch) });
      toast.success('Permissions gespeichert + digital signiert');
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
          <ShieldCheck size={12} /> Datenkontrolle
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Permissions</h1>
        <p className="text-ink-400 mt-2">Du kontrollierst, was AEVUM von dir teilen darf. Default: nichts public.</p>
        {me?.permissions?.consent_date && (
          <div className="mt-4 inline-flex items-center gap-2 badge badge-gold">
            <Lock size={11} />
            Zuletzt signiert: {new Date(me.permissions.consent_date).toLocaleString('de-DE')}
          </div>
        )}
      </header>

      <div className="space-y-6 max-w-3xl">
        <Section title="Was darf AEVUM zeigen" icon={Megaphone}>
          {FLAGS.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <Section title="Auf welchen Kanälen" icon={Share2}>
          {CHANNELS.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <Section title="Anonymisierung" icon={EyeOff}>
          {ANONYMIZE.map(f => <Toggle key={f.key} flag={f.key} label={f.label} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <div className="sticky bottom-4 z-10">
          <div className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-ink-300">
              Änderungen werden mit Timestamp + Account-ID digital signiert.
            </div>
            <button disabled={saving} onClick={() => setConfirm(true)} className="btn-gold w-full sm:w-auto justify-center">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" />
                  Speichere…
                </>
              ) : (
                <>
                  <Save size={16} /> Speichern + Signieren
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setConfirm(false)} />
          <div className="relative glass rounded-2xl p-7 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-gold-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Signieren bestätigen</h3>
            <p className="text-sm text-ink-300 leading-relaxed">
              Dies signiert deine Permissions digital mit Timestamp + Account-ID. Du kannst sie jederzeit ändern.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirm(false)} className="btn-ghost flex-1">Abbrechen</button>
              <button onClick={doSave} className="btn-gold flex-1">Bestätigen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title, icon: Icon, children
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode
}) {
  return (
    <div className="card-premium p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <Icon size={14} className="text-gold-300" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Toggle({ flag, label, on, onToggle }: { flag: string; label: string; on: boolean; onToggle: (k: string) => void }) {
  return (
    <button
      onClick={() => onToggle(flag)}
      type="button"
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition text-left group"
    >
      <span className={`text-sm transition ${on ? 'text-white' : 'text-ink-200'} group-hover:text-white`}>{label}</span>
      <span className="toggle-track" data-on={on ? 'true' : 'false'} aria-pressed={on}>
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
