import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { api, getAccessToken } from '@/lib/api';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';
import Spinner from '@/components/Spinner';
import {
  FileText, Inbox, Send, Users, Plus, Trash2, Edit3, Save, X, Upload, FolderOpen,
} from 'lucide-react';

type DocMeta = {
  filename: string;
  folder: 'inbox' | 'outbox' | 'shared';
  size_bytes: number;
  modified_at: string;
};

type DocsListResponse = {
  ok: boolean;
  docs: { inbox: DocMeta[]; outbox: DocMeta[]; shared: DocMeta[] };
};

type DocReadResponse = {
  ok: boolean;
  filename: string;
  folder: 'inbox' | 'outbox' | 'shared';
  size_bytes: number;
  modified_at: string;
  content: string;
};

const FOLDER_LABELS: Record<DocMeta['folder'], { label: string; hint: string; Icon: typeof Inbox }> = {
  inbox: { label: 'Inbox', hint: 'Du → Agent', Icon: Inbox },
  outbox: { label: 'Outbox', hint: 'Agent → Du', Icon: Send },
  shared: { label: 'Shared', hint: 'Bidirektional', Icon: Users },
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Documents() {
  const { slug = '' } = useParams();

  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<DocsListResponse['docs']>({ inbox: [], outbox: [], shared: [] });
  const [selected, setSelected] = useState<DocMeta | null>(null);
  const [content, setContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    try {
      const r = await api<DocsListResponse>(`/api/me/projects/${slug}/docs`);
      setDocs(r.docs);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Laden fehlgeschlagen');
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadDocs().finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const openDoc = async (d: DocMeta) => {
    setSelected(d);
    setEditMode(false);
    setLoadingContent(true);
    setContent('');
    try {
      const r = await api<DocReadResponse>(`/api/me/projects/${slug}/docs/${d.folder}/${encodeURIComponent(d.filename)}`);
      setContent(r.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lesen fehlgeschlagen');
    } finally {
      setLoadingContent(false);
    }
  };

  const startEdit = () => {
    if (!selected) return;
    setDraft(content);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraft('');
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/api/me/projects/${slug}/docs/${selected.folder}/${encodeURIComponent(selected.filename)}`, {
        method: 'POST',
        body: JSON.stringify({ content: draft }),
      });
      setContent(draft);
      setEditMode(false);
      toast.success('Gespeichert');
      loadDocs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (d: DocMeta) => {
    try {
      await api(`/api/me/projects/${slug}/docs/${d.folder}/${encodeURIComponent(d.filename)}`, { method: 'DELETE' });
      toast.success('Gelöscht');
      setConfirmDel(null);
      if (selected?.filename === d.filename && selected?.folder === d.folder) {
        setSelected(null);
        setContent('');
      }
      loadDocs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Löschen fehlgeschlagen');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.md$/i.test(file.name)) {
      toast.error('Nur .md-Dateien erlaubt');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5 MB');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = getAccessToken();
      const base = (import.meta as unknown as { env: { VITE_AEVUM_API_BASE_URL?: string } }).env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';
      const res = await fetch(`${base}/api/me/projects/${slug}/docs/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload ${res.status}: ${txt.slice(0, 120)}`);
      }
      toast.success(`${file.name} hochgeladen`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload fehlgeschlagen');
    }
  };

  const createInShared = async () => {
    if (!newName) return;
    let name = newName.trim();
    if (!/\.md$/i.test(name)) name = `${name}.md`;
    if (!/^[a-zA-Z0-9_.-]+\.md$/.test(name)) {
      toast.error('Nur a-z, 0-9, _ . - erlaubt');
      return;
    }
    try {
      await api(`/api/me/projects/${slug}/docs/shared/${encodeURIComponent(name)}`, {
        method: 'POST',
        body: JSON.stringify({ content: `# ${name.replace(/\.md$/i, '')}\n\n` }),
      });
      toast.success('Erstellt');
      setCreating(false);
      setNewName('');
      loadDocs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erstellen fehlgeschlagen');
    }
  };

  const totals = useMemo(() => ({
    inbox: docs.inbox.length,
    outbox: docs.outbox.length,
    shared: docs.shared.length,
  }), [docs]);

  if (loading) {
    return (
      <div className="card-premium p-16 flex justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <FolderOpen size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dokumente</h1>
          <p className="text-xs text-ink-400 mt-0.5">Tausche Markdown-Files mit deinem AEVUM-Agent</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleUpload}
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm">
            <Upload size={13} /> Upload (Inbox)
          </button>
          <button onClick={() => setCreating(true)} className="btn-gold text-sm">
            <Plus size={13} /> Shared-Doc
          </button>
        </div>
      </div>

      {creating && (
        <div className="card-premium p-4 mb-6 flex items-center gap-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createInShared()}
            placeholder="briefing-q2.md"
            className="input-premium flex-1"
          />
          <button onClick={createInShared} className="btn-gold text-sm" disabled={!newName}>
            <Plus size={13} /> Erstellen
          </button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="text-xs text-ink-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition">
            Abbrechen
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* ── Sidebar: list ─────────────────────────────── */}
        <aside className="col-span-12 lg:col-span-4 space-y-5">
          {(['inbox', 'outbox', 'shared'] as const).map((folder) => {
            const { label, hint, Icon } = FOLDER_LABELS[folder];
            const items = docs[folder];
            return (
              <section key={folder}>
                <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Icon size={12} className="text-gold-300" />
                  {label}
                  <span className="text-ink-500 normal-case font-normal">— {hint}</span>
                  <span className="badge ml-auto">{totals[folder]}</span>
                </h2>
                {items.length === 0 ? (
                  <div className="card-premium p-4 text-xs text-ink-500 text-center">leer</div>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((d) => {
                      const active = selected?.filename === d.filename && selected.folder === d.folder;
                      const canDelete = folder === 'inbox' || folder === 'shared';
                      return (
                        <div
                          key={`${folder}/${d.filename}`}
                          className={`card-premium p-3 flex items-center gap-3 cursor-pointer transition group ${active ? 'border-gold-400/40 bg-gold-400/[0.04]' : 'hover:border-white/10'}`}
                          onClick={() => openDoc(d)}
                        >
                          <FileText size={14} className={active ? 'text-gold-300' : 'text-ink-400 group-hover:text-ink-200'} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white truncate">{d.filename}</div>
                            <div className="text-[0.65rem] text-ink-500 mt-0.5">
                              {formatBytes(d.size_bytes)} · {formatDate(d.modified_at)}
                            </div>
                          </div>
                          {canDelete && (
                            confirmDel === `${folder}/${d.filename}` ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setConfirmDel(null)} className="text-[0.65rem] text-ink-400 hover:text-white px-2 py-1 rounded">Nein</button>
                                <button onClick={() => deleteDoc(d)} className="text-[0.65rem] text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded hover:bg-rose-500/20">Löschen</button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDel(`${folder}/${d.filename}`); }}
                                className="text-ink-400 hover:text-rose-300 p-1.5 rounded-md hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </aside>

        {/* ── Reader / Editor ──────────────────────────── */}
        <main className="col-span-12 lg:col-span-8">
          {!selected ? (
            <div className="card-premium p-16 text-center text-ink-400 text-sm">
              <FileText size={28} className="mx-auto mb-3 text-ink-500" />
              Wähle ein Dokument links aus oder lade eines hoch.
            </div>
          ) : (
            <div className="card-premium p-6">
              <header className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <FileText size={18} className="text-gold-300 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-white truncate">{selected.filename}</div>
                  <div className="text-[0.7rem] text-ink-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="badge">{FOLDER_LABELS[selected.folder].label}</span>
                    <span>·</span>
                    <span>{formatBytes(selected.size_bytes)}</span>
                    <span>·</span>
                    <span>geändert {formatDate(selected.modified_at)}</span>
                  </div>
                </div>
                {!editMode && selected.folder === 'shared' && (
                  <button onClick={startEdit} className="btn-secondary text-xs">
                    <Edit3 size={12} /> Bearbeiten
                  </button>
                )}
                {editMode && (
                  <>
                    <button onClick={cancelEdit} className="text-xs text-ink-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition">
                      <X size={12} className="inline mr-1" /> Abbrechen
                    </button>
                    <button onClick={saveEdit} disabled={saving} className="btn-gold text-xs">
                      {saving ? '…' : <><Save size={12} /> Speichern</>}
                    </button>
                  </>
                )}
              </header>

              {loadingContent ? (
                <div className="py-16 flex justify-center"><Spinner size="md" /></div>
              ) : editMode ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full min-h-[480px] bg-ink-900/60 border border-white/10 rounded-lg p-4 text-sm font-mono text-ink-100 focus:outline-none focus:border-gold-400/40 resize-y"
                  spellCheck={false}
                />
              ) : (
                <MarkdownViewer content={content} />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
