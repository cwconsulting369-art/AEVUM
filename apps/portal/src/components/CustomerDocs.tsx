// AEVUM Customer Doc-Exchange UI (Block B1)
// Created: 2026-05-25
//
// Account-level 3-tab UI (Inbox / Outbox / Shared) with:
//   - file listing (filename, size, modified, ext-icon)
//   - upload (drag-drop OR button) → inbox/shared
//   - md/txt preview via MarkdownViewer (.md) or <pre> (.txt) or external PDF link
//   - delete (only inbox/shared)
//
// Consumes:
//   GET    /api/me/docs?box=...
//   GET    /api/me/docs/file/:filename?box=...
//   POST   /api/me/docs/upload?box=...
//   DELETE /api/me/docs/file/:filename?box=...

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { api, getAccessToken } from '@/lib/api';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';
import Spinner from '@/components/Spinner';
import { Inbox, Send, Users, Upload, Trash2, FileText, File as FileIcon, FileArchive, X } from 'lucide-react';

type Box = 'inbox' | 'outbox' | 'shared';
type DocMeta = {
  filename: string;
  box: Box;
  size_bytes: number;
  modified_at: string;
  ext: 'md' | 'txt' | 'pdf' | string;
};
type ListResp = { ok: boolean; boxes: Record<Box, DocMeta[]> };
type ReadResp = {
  ok: boolean;
  filename: string;
  box: Box;
  size_bytes: number;
  modified_at: string;
  ext: string;
  content: string;
};

const BOXES: { id: Box; label: string; hint: string; Icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', hint: 'Du → Agent', Icon: Inbox },
  { id: 'outbox', label: 'Outbox', hint: 'Agent → Du', Icon: Send },
  { id: 'shared', label: 'Shared', hint: 'Bidirektional', Icon: Users },
];

const API_BASE = import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';

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

function extIcon(ext: string) {
  if (ext === 'md') return FileText;
  if (ext === 'pdf') return FileArchive;
  return FileIcon;
}

export default function CustomerDocs() {
  const [active, setActive] = useState<Box>('inbox');
  const [docs, setDocs] = useState<Record<Box, DocMeta[]>>({ inbox: [], outbox: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DocMeta | null>(null);
  const [content, setContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<ListResp>('/api/me/docs');
      setDocs(r.boxes || { inbox: [], outbox: [], shared: [] });
    } catch (e) {
      toast.error('Konnte Dokumente nicht laden');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);

  const openFile = async (d: DocMeta) => {
    setSelected(d);
    if (d.ext === 'pdf') {
      // PDF opens in new tab (browser-native viewer)
      const token = getAccessToken();
      window.open(
        `${API_BASE}/api/me/docs/file/${encodeURIComponent(d.filename)}?box=${d.box}&access_token=${encodeURIComponent(token || '')}`,
        '_blank',
        'noopener,noreferrer'
      );
      // Note: api.ts adds Authorization header, but window.open can't.
      // For PDF, we'd ideally hit a signed-URL endpoint. For now we use the JWT.
      // If you need stricter, build a short-lived signed download token endpoint.
      setSelected(null);
      return;
    }
    setLoadingContent(true);
    try {
      const r = await api<ReadResp>(`/api/me/docs/file/${encodeURIComponent(d.filename)}?box=${d.box}`);
      setContent(r.content);
    } catch (e) {
      toast.error('Konnte Datei nicht lesen');
      console.error(e);
    } finally {
      setLoadingContent(false);
    }
  };

  const uploadFile = async (file: File, targetBox: Box) => {
    if (targetBox === 'outbox') {
      toast.error('Outbox ist Agent → Du. Lade in Inbox oder Shared.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Datei zu groß (max 8 MB)');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/api/me/docs/upload?box=${targetBox}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'upload_failed');
      toast.success(`Hochgeladen: ${data.filename}`);
      await loadList();
    } catch (e) {
      const msg = (e instanceof Error) ? e.message : 'upload failed';
      toast.error(`Upload-Fehler: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (d: DocMeta) => {
    if (d.box === 'outbox') {
      toast.error('Outbox darfst du nicht löschen');
      return;
    }
    if (!confirm(`"${d.filename}" wirklich löschen?`)) return;
    try {
      await api(`/api/me/docs/file/${encodeURIComponent(d.filename)}?box=${d.box}`, {
        method: 'DELETE',
      });
      toast.success('Gelöscht');
      if (selected?.filename === d.filename && selected.box === d.box) {
        setSelected(null);
        setContent('');
      }
      await loadList();
    } catch (e) {
      toast.error('Konnte nicht löschen');
      console.error(e);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f, active === 'outbox' ? 'inbox' : active);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void uploadFile(f, active === 'outbox' ? 'inbox' : active);
    e.target.value = '';
  };

  const list = docs[active] || [];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-800">
        {BOXES.map(({ id, label, hint, Icon }) => {
          const count = docs[id]?.length || 0;
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => { setActive(id); setSelected(null); setContent(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b-2 ${
                isActive
                  ? 'border-aevum-gold text-ink-50'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              <Icon size={16} />
              <span className="font-medium">{label}</span>
              <span className="text-xs text-ink-500">({count})</span>
              <span className="text-xs text-ink-600 hidden md:inline">— {hint}</span>
            </button>
          );
        })}
      </div>

      {/* Upload-Zone (hidden for outbox) */}
      {active !== 'outbox' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-aevum-gold bg-ink-900/50' : 'border-ink-800 hover:border-ink-700'
          }`}
        >
          <Upload className="mx-auto mb-2 text-ink-500" size={24} />
          <p className="text-sm text-ink-300">
            Drag & Drop oder{' '}
            <button
              type="button"
              className="text-aevum-gold underline-offset-2 hover:underline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Datei auswählen
            </button>
          </p>
          <p className="text-xs text-ink-500 mt-1">.md, .txt, .pdf · max 8 MB · → {active}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.pdf"
            className="hidden"
            onChange={onFileInput}
            disabled={uploading}
          />
          {uploading && <div className="mt-2 flex justify-center"><Spinner size="sm" /></div>}
        </div>
      )}

      {/* File list */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : list.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">Keine Dateien in {active}.</p>
          ) : (
            list.map(d => {
              const Icon = extIcon(d.ext);
              const isSelected = selected?.filename === d.filename && selected.box === d.box;
              return (
                <div
                  key={`${d.box}-${d.filename}`}
                  className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-ink-800' : 'hover:bg-ink-900'
                  }`}
                  onClick={() => void openFile(d)}
                >
                  <Icon size={16} className="text-ink-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 truncate">{d.filename}</div>
                    <div className="text-xs text-ink-500">
                      {formatBytes(d.size_bytes)} · {formatDate(d.modified_at)}
                    </div>
                  </div>
                  {d.box !== 'outbox' && (
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-red-400 p-1"
                      onClick={(e) => { e.stopPropagation(); void deleteFile(d); }}
                      aria-label={`Lösche ${d.filename}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Preview pane */}
        <div className="border border-ink-800 rounded-lg p-4 min-h-[300px]">
          {!selected ? (
            <p className="text-sm text-ink-500 text-center py-12">Klick eine Datei zum Anzeigen</p>
          ) : loadingContent ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-ink-800">
                <div className="text-sm font-medium text-ink-100 truncate">{selected.filename}</div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setContent(''); }}
                  className="text-ink-500 hover:text-ink-200"
                  aria-label="Schließen"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {selected.ext === 'md' ? (
                  <MarkdownViewer content={content} />
                ) : (
                  <pre className="text-xs text-ink-200 whitespace-pre-wrap font-mono">{content}</pre>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
