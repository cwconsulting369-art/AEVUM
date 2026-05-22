// Customer Project-Agent chat widget — Lennox-style memory, multi-channel ready.
// Streams SSE from POST /api/me/projects/:slug/agent/chat with Bearer JWT.
// Persists session in localStorage so the customer can resume.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bot, Send, Sparkles, Trash2, Eraser, BrainCircuit } from 'lucide-react';
import { getAccessToken } from '@/lib/api';

type Role = 'user' | 'assistant';
interface ChatMsg {
  role: Role;
  content: string;
  streaming?: boolean;
}

interface Props {
  projectSlug: string;
  projectName: string;
  agentDisplayName?: string | null;
  apiBase?: string;
}

const API_DEFAULT = import.meta.env.VITE_AEVUM_API_BASE_URL || 'https://api.aevum-system.de';

function sessionStorageKey(slug: string) {
  return `aevum_project_agent_${slug}_session`;
}

interface StoredSession {
  session_id: string | null;
  messages: ChatMsg[];
}

function loadStored(slug: string): StoredSession {
  if (typeof window === 'undefined') return { session_id: null, messages: [] };
  try {
    const raw = localStorage.getItem(sessionStorageKey(slug));
    if (!raw) return { session_id: null, messages: [] };
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed || !Array.isArray(parsed.messages)) return { session_id: null, messages: [] };
    return parsed;
  } catch {
    return { session_id: null, messages: [] };
  }
}

function persistStored(slug: string, s: StoredSession) {
  try {
    localStorage.setItem(sessionStorageKey(slug), JSON.stringify(s));
  } catch {
    /* quota — ignore */
  }
}

export default function ProjectAgentChat({ projectSlug, projectName, agentDisplayName, apiBase = API_DEFAULT }: Props) {
  const displayName = agentDisplayName?.trim() || `${projectName} Assistant`;

  const welcome: ChatMsg = useMemo(() => ({
    role: 'assistant',
    content:
      `Hi — ich bin **${displayName}**, dein dedizierter KI-Assistent für *${projectName}*.\n\n` +
      `Ich habe ein eigenes Gedächtnis (Lennox-style file memory), das über alle Kanäle (Portal, Telegram, Terminal) hinweg gleich bleibt. Sag mir kurz was ansteht, oder bitte mich Sachen zu merken ("merk dir, …").`
  }), [displayName, projectName]);

  const [session, setSession] = useState<StoredSession>(() => loadStored(projectSlug));
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Init welcome on first visit
  useEffect(() => {
    if (session.messages.length === 0) {
      setSession({ session_id: null, messages: [welcome] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug]);

  // Persist
  useEffect(() => {
    persistStored(projectSlug, session);
  }, [projectSlug, session]);

  // Autoscroll
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.messages]);

  const canSend = !sending && input.trim().length > 0;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');

    const userMsg: ChatMsg = { role: 'user', content: text };
    const placeholder: ChatMsg = { role: 'assistant', content: '', streaming: true };
    const baseMessages = [...session.messages.filter(m => !m.streaming), userMsg];
    setSession(s => ({ ...s, messages: [...baseMessages, placeholder] }));
    setSending(true);

    // Drop the local welcome (UI-only) from API context
    const apiMessages = baseMessages
      .filter((m, i) => !(i === 0 && m.role === 'assistant' && m.content === welcome.content))
      .map(m => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortRef.current = controller;
    const token = getAccessToken();

    try {
      const res = await fetch(`${apiBase}/api/me/projects/${projectSlug}/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: apiMessages,
          session_id: session.session_id || undefined,
          channel: 'portal'
        }),
        signal: controller.signal
      });

      if (!res.ok || !res.body) {
        const errText = res.status === 429
          ? 'Zu viele Anfragen kurz hintereinander. Bitte kurz warten.'
          : `Verbindung verloren (Status ${res.status}).`;
        setSession(s => ({
          ...s,
          messages: [...s.messages.filter(m => !m.streaming), { role: 'assistant', content: errText }]
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let newSessionId: string | null = null;

      const flushEvent = (raw: string) => {
        let event = 'message';
        let data = '';
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) return;
        let parsed: { session_id?: string; text?: string; slug?: string; type?: string; summary?: string };
        try { parsed = JSON.parse(data); } catch { return; }

        if (event === 'session') {
          newSessionId = parsed.session_id ?? null;
          setSession(s => ({ ...s, session_id: parsed.session_id ?? s.session_id }));
        } else if (event === 'token') {
          assistantText += parsed.text || '';
          setSession(s => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.streaming) {
              msgs[msgs.length - 1] = { ...last, content: assistantText };
            }
            return { ...s, messages: msgs };
          });
        } else if (event === 'memory_saved') {
          const label = parsed.summary || parsed.slug || 'Erinnerung';
          toast.success(`Erinnerung gespeichert: ${label}`, {
            icon: <BrainCircuit size={16} />
          });
        } else if (event === 'done') {
          setSession(s => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.streaming) {
              msgs[msgs.length - 1] = { role: 'assistant', content: assistantText || '…' };
            }
            return { ...s, messages: msgs, session_id: newSessionId || s.session_id };
          });
        } else if (event === 'error') {
          setSession(s => ({
            ...s,
            messages: [
              ...s.messages.filter(m => !m.streaming),
              { role: 'assistant', content: 'Da ist gerade was schiefgelaufen. Bitte erneut versuchen.' }
            ]
          }));
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          flushEvent(buffer.slice(0, idx));
          buffer = buffer.slice(idx + 2);
        }
      }

      // Final cleanup
      setSession(s => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.streaming) {
          msgs[msgs.length - 1] = { role: 'assistant', content: assistantText || '…' };
        }
        return { ...s, messages: msgs, session_id: newSessionId || s.session_id };
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setSession(s => ({
        ...s,
        messages: [
          ...s.messages.filter(m => !m.streaming),
          { role: 'assistant', content: 'Verbindung verloren. Bitte erneut versuchen.' }
        ]
      }));
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [apiBase, input, projectSlug, sending, session.messages, session.session_id, welcome.content]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) send();
    }
  };

  const clearLocal = () => {
    setSession({ session_id: null, messages: [welcome] });
    toast.success('Lokaler Verlauf gelöscht');
  };

  const eraseAll = async () => {
    if (!confirm('Conversation + Agent-Memory komplett löschen? Das kann nicht rückgängig gemacht werden.')) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`${apiBase}/api/me/projects/${projectSlug}/agent/erase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ wipe_memory: true })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setSession({ session_id: null, messages: [welcome] });
      toast.success('Conversation + Memory komplett gelöscht');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Löschen fehlgeschlagen');
    }
  };

  return (
    <div className="card-premium p-0 overflow-hidden flex flex-col" style={{ minHeight: 520, maxHeight: 720 }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.015]">
        <div className="w-9 h-9 rounded-lg bg-gold-400/12 border border-gold-400/30 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-gold-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
            {displayName}
            <span className="dot dot-ok" aria-hidden />
          </div>
          <div className="text-[0.7rem] text-ink-400 flex items-center gap-1.5">
            <Sparkles size={10} className="text-gold-300" />
            persistent memory · multi-channel
          </div>
        </div>
        <button
          type="button"
          onClick={clearLocal}
          className="text-[0.7rem] text-ink-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition inline-flex items-center gap-1"
          title="Lokalen Verlauf löschen (Memory bleibt)"
        >
          <Trash2 size={11} /> Lokal
        </button>
        <button
          type="button"
          onClick={eraseAll}
          className="text-[0.7rem] text-rose-300/80 hover:text-rose-200 px-2 py-1 rounded-md hover:bg-rose-500/10 transition inline-flex items-center gap-1"
          title="Verlauf + Memory löschen (DSGVO)"
        >
          <Eraser size={11} /> Alles
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" role="log" aria-live="polite">
        {session.messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-3 bg-white/[0.015]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Schreib ${displayName}…  (Enter = senden, Shift+Enter = neue Zeile)`}
            rows={1}
            className="input-premium flex-1 resize-none min-h-[40px] max-h-32"
            disabled={sending}
            aria-label="Nachricht eingeben"
          />
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="btn-gold shrink-0"
            aria-label="Senden"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" aria-hidden />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'bg-gold-400/10 border border-gold-400/25 text-white'
            : 'bg-white/[0.025] border border-white/[0.06] text-ink-100'
        ].join(' ')}
      >
        {msg.content || (msg.streaming ? <StreamingDots /> : '')}
      </div>
    </div>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="schreibt…">
      <span className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-pulse" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-pulse" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-pulse" style={{ animationDelay: '300ms' }} />
    </span>
  );
}
