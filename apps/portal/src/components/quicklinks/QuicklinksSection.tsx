import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, ExternalLink, Globe, Github, Wrench,
  Cloud, Folder, Link as LinkIcon, X, Check
} from 'lucide-react';
import { api } from '@/lib/api';
import { stagger } from '@/lib/animations';

type Category = 'website' | 'repo' | 'tool' | 'service' | 'resource' | 'other';

type Quicklink = {
  id: string;
  label: string;
  url: string;
  category: Category;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type QuicklinkInput = {
  label: string;
  url: string;
  category: Category;
  icon?: string | null;
};

const CATEGORIES: Category[] = ['website', 'repo', 'tool', 'service', 'resource', 'other'];

const CATEGORY_LABELS: Record<Category, string> = {
  website:  'Webseiten',
  repo:     'Repositories',
  tool:     'Tools',
  service:  'Services',
  resource: 'Resources',
  other:    'Weitere'
};

const CATEGORY_FALLBACK_ICON: Record<Category, React.ComponentType<{ size?: number; className?: string }>> = {
  website:  Globe,
  repo:     Github,
  tool:     Wrench,
  service:  Cloud,
  resource: Folder,
  other:    LinkIcon
};

function domainOf(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function QuicklinksSection({ projectSlug }: { projectSlug: string }) {
  const [links, setLinks] = useState<Quicklink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api<{ ok: boolean; quicklinks: Quicklink[] }>(
        `/api/me/projects/${projectSlug}/quicklinks`
      );
      setLinks(data.quicklinks);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug]);

  const grouped = useMemo(() => {
    const out: Record<Category, Quicklink[]> = {
      website: [], repo: [], tool: [], service: [], resource: [], other: []
    };
    for (const l of links) out[l.category]?.push(l);
    return out;
  }, [links]);

  const create = async (input: QuicklinkInput) => {
    await api(`/api/me/projects/${projectSlug}/quicklinks`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
    toast.success(`"${input.label}" hinzugefügt`);
    setShowForm(false);
    load();
  };

  const update = async (id: string, input: QuicklinkInput) => {
    await api(`/api/me/projects/${projectSlug}/quicklinks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
    toast.success('Aktualisiert');
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/me/projects/${projectSlug}/quicklinks/${id}`, { method: 'DELETE' });
      toast.success('Entfernt');
      setConfirmId(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Löschen fehlgeschlagen');
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <LinkIcon size={16} className="text-gold-300" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">Quicklinks</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Alle wichtigen URLs deines Projekts an einem Ort
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setEditId(null); }}
          className="btn-gold ml-auto text-sm"
        >
          {showForm ? <><X size={13} /> Schließen</> : <><Plus size={13} /> Hinzufügen</>}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <QuicklinkForm
            onSubmit={create}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="card-premium p-10 text-center text-sm text-ink-400">Lade Quicklinks…</div>
      ) : links.length === 0 ? (
        <div className="card-premium p-10 text-center text-sm text-ink-400">
          Noch keine Quicklinks. Klick auf <strong className="text-gold-300">Hinzufügen</strong>, um deinen ersten Link anzulegen.
        </div>
      ) : (
        <div className="space-y-7">
          {CATEGORIES.filter(c => grouped[c].length > 0).map(category => (
            <div key={category}>
              <h3 className="text-[0.65rem] font-semibold text-ink-400 uppercase tracking-wider mb-2.5">
                {CATEGORY_LABELS[category]}{' '}
                <span className="text-ink-500 font-normal normal-case">({grouped[category].length})</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[category].map((link, i) =>
                  editId === link.id ? (
                    <div key={link.id} className="sm:col-span-2 lg:col-span-3">
                      <QuicklinkForm
                        initial={link}
                        onSubmit={(data) => update(link.id, data)}
                        onCancel={() => setEditId(null)}
                      />
                    </div>
                  ) : (
                    <QuicklinkCard
                      key={link.id}
                      link={link}
                      delay={i}
                      confirmDelete={confirmId === link.id}
                      onEdit={() => { setEditId(link.id); setShowForm(false); setConfirmId(null); }}
                      onAskDelete={() => setConfirmId(link.id)}
                      onCancelDelete={() => setConfirmId(null)}
                      onConfirmDelete={() => remove(link.id)}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Single card ────────────────────────────────────────────────────────────

function QuicklinkCard({
  link, delay,
  confirmDelete, onEdit, onAskDelete, onCancelDelete, onConfirmDelete
}: {
  link: Quicklink; delay: number;
  confirmDelete: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const Icon = CATEGORY_FALLBACK_ICON[link.category];

  if (confirmDelete) {
    return (
      <div
        className="card-premium p-4 flex flex-col gap-3 border-rose-500/40 bg-rose-500/5 animate-fade-up"
        style={stagger(delay, 40, 40)}
      >
        <div className="text-sm text-white">
          „{link.label}" löschen?
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancelDelete}
            className="text-xs text-ink-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition flex-1"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirmDelete}
            className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-md hover:bg-rose-500/20 transition flex-1"
          >
            Löschen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-premium p-4 group flex items-center gap-3 hover:border-gold-400/40 transition animate-fade-up"
      style={stagger(delay, 40, 40)}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 flex-1 min-w-0"
        title={link.url}
      >
        <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0 group-hover:bg-gold-400/15 transition">
          <Icon size={14} className="text-gold-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
            {link.label}
            <ExternalLink size={11} className="text-ink-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
          </div>
          <div className="text-[0.65rem] text-ink-400 truncate">{domainOf(link.url)}</div>
        </div>
      </a>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition shrink-0">
        <button
          onClick={onEdit}
          className="text-ink-400 hover:text-gold-300 p-1.5 rounded-md hover:bg-white/5 transition"
          title="Bearbeiten"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onAskDelete}
          className="text-ink-400 hover:text-rose-300 p-1.5 rounded-md hover:bg-rose-500/10 transition"
          title="Löschen"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Add/Edit form ──────────────────────────────────────────────────────────

function QuicklinkForm({
  initial,
  onSubmit,
  onCancel
}: {
  initial?: Quicklink;
  onSubmit: (data: QuicklinkInput) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [label,    setLabel]    = useState(initial?.label ?? '');
  const [url,      setUrl]      = useState(initial?.url ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'website');
  const [icon,     setIcon]     = useState(initial?.icon ?? '');
  const [busy,     setBusy]     = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        label: label.trim(),
        url: url.trim(),
        category,
        icon: icon.trim() || null
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-premium p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-medium mb-1.5 text-ink-200">Label</span>
          <input
            required maxLength={100}
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="z. B. Shopify Store"
            className="input-premium"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium mb-1.5 text-ink-200">Kategorie</span>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="input-premium"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="block text-xs font-medium mb-1.5 text-ink-200">URL</span>
        <input
          required type="url" maxLength={2000}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://…"
          className="input-premium"
        />
      </label>
      <label className="block">
        <span className="block text-xs font-medium mb-1.5 text-ink-200">Icon (optional)</span>
        <input
          maxLength={50}
          value={icon ?? ''}
          onChange={e => setIcon(e.target.value)}
          placeholder="lucide-Name, z. B. Shop, Mail, Database"
          className="input-premium"
        />
      </label>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button" onClick={onCancel}
          className="text-xs text-ink-300 hover:text-white px-3 py-2 rounded-md hover:bg-white/5 transition"
        >
          Abbrechen
        </button>
        <button
          disabled={busy || !label || !url}
          className="btn-gold text-sm"
        >
          {busy
            ? <><span className="w-3.5 h-3.5 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" /> Speichern…</>
            : <><Check size={13} /> {initial ? 'Aktualisieren' : 'Hinzufügen'}</>
          }
        </button>
      </div>
    </form>
  );
}
