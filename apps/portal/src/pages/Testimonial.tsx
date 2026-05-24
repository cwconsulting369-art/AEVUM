import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Megaphone, Save, ShieldCheck, Lock, Quote, History, AlertCircle
} from 'lucide-react';

type CasePage = {
  id: string;
  slug: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  brand_url: string | null;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  allow_show_brand_name: boolean;
  allow_show_logo: boolean;
  allow_show_testimonial: boolean;
  allow_show_services: boolean;
  allow_show_collaboration_story: boolean;
  allow_show_vision: boolean;
  show_revenue: boolean;
  show_users: boolean;
  show_growth: boolean;
  consent_signed_at: string | null;
  consent_signed_by: string | null;
  public: boolean;
};

type AuditEntry = {
  id: string;
  changed_by: string;
  changed_field: string;
  old_value: unknown;
  new_value: unknown;
  ts: string;
};

const PERMISSION_GROUPS: Array<{
  title: string;
  hint?: string;
  items: Array<{ key: keyof CasePage; label: string; desc?: string }>;
}> = [
  {
    title: 'Identitaet',
    hint: 'Was AEVUM ueber dich namentlich zeigen darf.',
    items: [
      { key: 'allow_show_brand_name', label: 'Brand-Name + Projekt-URL zeigen', desc: 'Ohne dies bleibt der Case anonym.' },
      { key: 'allow_show_logo',       label: 'Logo / Hero-Bild zeigen' }
    ]
  },
  {
    title: 'Inhalte',
    items: [
      { key: 'allow_show_services',            label: 'Aktivierte AEVUM-Services',  desc: 'Welche Bausteine bei dir live sind.' },
      { key: 'allow_show_collaboration_story', label: 'Zusammenarbeits-Story' },
      { key: 'allow_show_vision',              label: 'Vision-Section' },
      { key: 'allow_show_testimonial',         label: 'Testimonial-Zitat + Autor' }
    ]
  },
  {
    title: 'Live-KPIs',
    hint: 'Echte Zahlen aus deinem Dashboard, nicht Marketing-Stories.',
    items: [
      { key: 'show_revenue', label: 'Revenue / MRR' },
      { key: 'show_users',   label: 'User-Counts' },
      { key: 'show_growth',  label: 'Growth-Metrics' }
    ]
  }
];

const FIELD_LABEL: Record<string, string> = {
  allow_show_brand_name: 'Brand-Name zeigen',
  allow_show_logo: 'Logo zeigen',
  allow_show_testimonial: 'Testimonial zeigen',
  allow_show_services: 'Services zeigen',
  allow_show_collaboration_story: 'Story zeigen',
  allow_show_vision: 'Vision zeigen',
  show_revenue: 'Revenue zeigen',
  show_users: 'User-Counts zeigen',
  show_growth: 'Growth zeigen',
  testimonial_quote: 'Testimonial-Quote',
  testimonial_author: 'Testimonial-Autor'
};

export default function Testimonial() {
  const [loading, setLoading] = useState(true);
  const [casePage, setCasePage] = useState<CasePage | null>(null);
  const [hasCasePage, setHasCasePage] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [draft, setDraft] = useState<Partial<CasePage>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api<{ ok: boolean; case_page: CasePage | null; has_case_page: boolean; audit_log: AuditEntry[] }>(
        '/api/me/testimonial'
      );
      setCasePage(r.case_page);
      setHasCasePage(r.has_case_page);
      setAudit(r.audit_log || []);
      setDraft(r.case_page ? { ...r.case_page } : {});
    } catch (e) {
      console.error(e);
      toast.error('Konnte Testimonial-Daten nicht laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (k: keyof CasePage) => {
    setDraft(d => ({ ...d, [k]: !d[k] }));
  };

  const updateField = (k: keyof CasePage, v: string) => {
    setDraft(d => ({ ...d, [k]: v }));
  };

  const dirty = casePage && Object.keys(draft).some(k => {
    const dk = k as keyof CasePage;
    return draft[dk] !== casePage[dk];
  });

  const doSave = async () => {
    if (!casePage) return;
    setSaving(true);
    setConfirm(false);
    try {
      const patch: Record<string, unknown> = {};
      const permKeys = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key));
      for (const k of permKeys) {
        if (draft[k] !== casePage[k]) patch[k] = !!draft[k];
      }
      if (draft.testimonial_quote !== casePage.testimonial_quote) {
        patch.testimonial_quote = draft.testimonial_quote ?? null;
      }
      if (draft.testimonial_author !== casePage.testimonial_author) {
        patch.testimonial_author = draft.testimonial_author ?? null;
      }
      if (Object.keys(patch).length === 0) {
        toast.info('Keine Aenderungen');
        return;
      }
      await api('/api/me/testimonial', { method: 'PATCH', body: JSON.stringify(patch) });
      toast.success('Permissions gespeichert + signiert');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-ink-400 text-sm">Lade Testimonial-Permissions…</div>;
  }

  if (!hasCasePage) {
    return (
      <div>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
            <Megaphone size={12} /> Testimonial
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Public-Case</h1>
        </header>
        <div className="card-premium p-6 max-w-2xl flex items-start gap-3">
          <AlertCircle size={18} className="text-gold-300 mt-0.5 shrink-0" />
          <div className="text-sm text-ink-300 leading-relaxed">
            Fuer deinen Account gibt es noch keine Case-Page.
            <br />
            Sobald AEVUM intern eine Case-Page fuer dich anlegt, kannst du hier steuern,
            was oeffentlich gezeigt werden darf.
            <br /><br />
            Default ist immer: <strong className="text-white">alles privat</strong>.
          </div>
        </div>
      </div>
    );
  }

  const quote = (draft.testimonial_quote ?? '') as string;
  const author = (draft.testimonial_author ?? '') as string;

  return (
    <div className="pb-32">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
          <Megaphone size={12} /> Testimonial
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Was AEVUM public ueber uns zeigen darf
        </h1>
        <p className="text-ink-400 mt-2 max-w-2xl">
          Default: alles privat. Jeder Schalter ist ein expliziter Opt-in. Aenderungen werden
          mit Timestamp + Account-Slug digital signiert und in einem Audit-Trail festgehalten.
        </p>
        {casePage?.consent_signed_at && (
          <div className="mt-4 inline-flex items-center gap-2 badge badge-gold">
            <Lock size={11} />
            Zuletzt signiert: {new Date(casePage.consent_signed_at).toLocaleString('de-DE')}
            {casePage.consent_signed_by ? ` · ${casePage.consent_signed_by}` : ''}
          </div>
        )}
        {casePage?.public === false && (
          <div className="mt-3 text-[11px] text-ink-500">
            Hinweis: Diese Case-Page ist intern noch nicht veroeffentlicht
            <code className="mx-1 text-ink-400">public=false</code>. Selbst mit aktivierten
            Permissions wird sie erst sichtbar, wenn AEVUM sie freischaltet.
          </div>
        )}
      </header>

      <div className="space-y-6 max-w-3xl">
        {PERMISSION_GROUPS.map(group => (
          <div key={group.title} className="card-premium p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1 pb-3 border-b border-white/5">
              <ShieldCheck size={14} className="text-gold-300" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                {group.title}
              </h2>
            </div>
            {group.hint && (
              <p className="text-[11px] text-ink-500 mt-2 mb-3">{group.hint}</p>
            )}
            <div className="space-y-1.5 mt-2">
              {group.items.map(item => (
                <Toggle
                  key={String(item.key)}
                  label={item.label}
                  desc={item.desc}
                  on={!!draft[item.key]}
                  onToggle={() => toggle(item.key)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Quote-Editor */}
        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <Quote size={14} className="text-gold-300" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Dein Testimonial
            </h2>
          </div>
          <p className="text-[11px] text-ink-500 mb-3">
            Wird nur public angezeigt wenn oben &laquo;Testimonial-Zitat&raquo; aktiviert.
          </p>
          <textarea
            value={quote}
            onChange={(e) => updateField('testimonial_quote', e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="„Mit AEVUM haben wir in 6 Monaten …"
            className="w-full bg-ink-900/60 border border-white/10 focus:border-gold-400/40 rounded-md text-sm text-white placeholder-ink-600 p-3 outline-none transition"
          />
          <div className="flex items-center justify-between mt-2">
            <input
              value={author}
              onChange={(e) => updateField('testimonial_author', e.target.value)}
              maxLength={200}
              placeholder="Dein Name + Rolle"
              className="bg-ink-900/60 border border-white/10 focus:border-gold-400/40 rounded-md text-sm text-white placeholder-ink-600 px-3 py-2 outline-none transition flex-1 mr-3"
            />
            <span className="text-[11px] text-ink-500 whitespace-nowrap">
              {quote.length}/500
            </span>
          </div>
        </div>

        {/* Audit-Log */}
        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <History size={14} className="text-gold-300" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Audit-Trail (letzte 10)
            </h2>
          </div>
          {audit.length === 0 ? (
            <p className="text-[12px] text-ink-500">Noch keine Aenderungen geloggt.</p>
          ) : (
            <ul className="space-y-1.5 text-[12px]">
              {audit.map(a => (
                <li key={a.id} className="flex items-center gap-3 text-ink-300">
                  <span className="text-ink-500 font-mono shrink-0">
                    {new Date(a.ts).toLocaleString('de-DE')}
                  </span>
                  <span className="text-white">
                    {FIELD_LABEL[a.changed_field] || a.changed_field}
                  </span>
                  <span className="text-ink-500">
                    {String(a.old_value)} → <span className="text-gold-300">{String(a.new_value)}</span>
                  </span>
                  <span className="ml-auto text-[10px] text-ink-600 uppercase tracking-wider">{a.changed_by}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Save */}
        <div className="sticky bottom-4 z-10">
          <div className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-ink-300">
              {dirty ? 'Aenderungen werden digital signiert.' : 'Keine ungespeicherten Aenderungen.'}
            </div>
            <button
              disabled={saving || !dirty}
              onClick={() => setConfirm(true)}
              className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
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

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setConfirm(false)} />
          <div className="relative glass rounded-2xl p-7 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-gold-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Signieren bestaetigen</h3>
            <p className="text-sm text-ink-300 leading-relaxed">
              Diese Permissions werden mit Timestamp + Account-Slug digital signiert.
              Jede Aenderung landet im Audit-Trail (DSGVO-konform). Du kannst sie jederzeit
              zurueckziehen.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirm(false)} className="btn-ghost flex-1">Abbrechen</button>
              <button onClick={doSave} className="btn-gold flex-1">Bestaetigen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label, desc, on, onToggle
}: {
  label: string;
  desc?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition text-left group"
    >
      <span className="min-w-0">
        <span className={`block text-sm transition ${on ? 'text-white' : 'text-ink-200'} group-hover:text-white`}>
          {label}
        </span>
        {desc && (
          <span className="block text-[11px] text-ink-500 mt-0.5">{desc}</span>
        )}
      </span>
      <span className="toggle-track shrink-0 ml-3" data-on={on ? 'true' : 'false'} aria-pressed={on}>
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
