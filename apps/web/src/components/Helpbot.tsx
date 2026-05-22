/**
 * AEVUM Helpbot — premium AI chat widget for aevum-system.de
 *
 * - Floating Action Button bottom-right
 * - Slide-up panel (Framer Motion), 420px desktop / fullscreen mobile
 * - Streams Claude Sonnet 4.5 token-by-token via SSE
 * - Persists session to localStorage; resumes on reload
 * - CTAs auto-injected when bot mentions "audit" or "call/gespräch"
 * - Dark + gold AEVUM theme (#0B0C10 + #F59E0B)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, RotateCcw, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.lennoxos.com';
const STORAGE_KEY = 'aevum_helpbot_session';
const FIRST_VISIT_KEY = 'aevum_helpbot_first_visit';
const HIDDEN_ROUTES = ['/audit', '/checkout/success', '/checkout/cancelled'];

type Role = 'user' | 'assistant';
interface ChatMsg {
  role: Role;
  content: string;
  streaming?: boolean;
}

interface StoredSession {
  session_id: string | null;
  messages: ChatMsg[];
}

const WELCOME: ChatMsg = {
  role: 'assistant',
  content: 'Moin! Ich bin der AEVUM Assistant. Was beschäftigt dich rund um KI in deinem Unternehmen?',
};

function loadSession(): StoredSession {
  if (typeof window === 'undefined') return { session_id: null, messages: [WELCOME] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { session_id: null, messages: [WELCOME] };
    const parsed = JSON.parse(raw) as StoredSession;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return { session_id: null, messages: [WELCOME] };
    }
    return parsed;
  } catch {
    return { session_id: null, messages: [WELCOME] };
  }
}

function saveSession(s: StoredSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota — ignore */
  }
}

function detectCtas(text: string): { audit: boolean; call: boolean } {
  const lc = text.toLowerCase();
  return {
    audit: /\baudit\b|\/audit\b/.test(lc),
    call: /\b(call|erstgespr|strategiegespr|gespräch)\b/.test(lc),
  };
}

function getCurrentHash(): string {
  if (typeof window === 'undefined') return '/';
  const h = window.location.hash;
  if (!h || h === '#/' || h === '') return '/';
  return h.replace('#', '');
}

export default function Helpbot() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<StoredSession>(() => loadSession());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [route, setRoute] = useState(getCurrentHash);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hash-route watcher (hides on /audit + /checkout/*)
  useEffect(() => {
    const onHash = () => setRoute(getCurrentHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const hideOnRoute = useMemo(
    () => HIDDEN_ROUTES.some((r) => route === r || route.startsWith(r + '/')),
    [route]
  );

  // First-visit tip
  useEffect(() => {
    if (hideOnRoute) return;
    try {
      if (!localStorage.getItem(FIRST_VISIT_KEY)) {
        const t = setTimeout(() => setShowTip(true), 4000);
        const t2 = setTimeout(() => {
          setShowTip(false);
          try { localStorage.setItem(FIRST_VISIT_KEY, '1'); } catch { /* noop */ }
        }, 14000);
        return () => { clearTimeout(t); clearTimeout(t2); };
      }
    } catch { /* noop */ }
  }, [hideOnRoute]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [session.messages, open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setShowTip(false);
      try { localStorage.setItem(FIRST_VISIT_KEY, '1'); } catch { /* noop */ }
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Persist session whenever messages change
  useEffect(() => { saveSession(session); }, [session]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Body-scroll lock on mobile when open
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');

    const userMsg: ChatMsg = { role: 'user', content: text };
    const placeholder: ChatMsg = { role: 'assistant', content: '', streaming: true };

    const baseMessages = [...session.messages.filter((m) => !m.streaming), userMsg];
    // Drop the initial welcome from API context (it's UI-only)
    const apiMessages = baseMessages
      .filter((m, i) => !(i === 0 && m.role === 'assistant' && m.content === WELCOME.content))
      .map((m) => ({ role: m.role, content: m.content }));

    setSession((s) => ({ ...s, messages: [...baseMessages, placeholder] }));
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/helpbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          session_id: session.session_id || undefined,
          meta: { referrer: document.referrer?.slice(0, 200), lang: navigator.language?.slice(0, 8) },
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = res.status === 429 ? 'Hoppla, du hast das Stunden-Limit erreicht. Versuch es später nochmal oder buche direkt ein Audit unter /audit.' : `Verbindung verloren (Status ${res.status}). Bitte erneut versuchen.`;
        setSession((s) => ({
          ...s,
          messages: [
            ...s.messages.filter((m) => !m.streaming),
            { role: 'assistant', content: errText },
          ],
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let newSessionId: string | null = null;

      const flushEvent = (rawEvent: string) => {
        let event = 'message';
        let data = '';
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) return;
        try {
          const parsed = JSON.parse(data);
          if (event === 'session') {
            newSessionId = parsed.session_id;
            setSession((s) => ({ ...s, session_id: parsed.session_id }));
          } else if (event === 'token') {
            assistantText += parsed.text || '';
            setSession((s) => {
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last && last.streaming) {
                msgs[msgs.length - 1] = { ...last, content: assistantText };
              }
              return { ...s, messages: msgs };
            });
          } else if (event === 'done') {
            setSession((s) => {
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last && last.streaming) {
                msgs[msgs.length - 1] = { role: 'assistant', content: assistantText };
              }
              return { ...s, messages: msgs };
            });
          } else if (event === 'error') {
            setSession((s) => {
              const msgs = s.messages.filter((m) => !m.streaming);
              msgs.push({ role: 'assistant', content: 'Sorry, da ist gerade was schiefgelaufen. Probier es bitte gleich nochmal.' });
              return { ...s, messages: msgs };
            });
          }
        } catch { /* skip malformed */ }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          flushEvent(rawEvent);
        }
      }

      // Final cleanup
      setSession((s) => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.streaming) {
          msgs[msgs.length - 1] = { role: 'assistant', content: assistantText || '…' };
        }
        return { ...s, messages: msgs, session_id: newSessionId || s.session_id };
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setSession((s) => ({
        ...s,
        messages: [
          ...s.messages.filter((m) => !m.streaming),
          { role: 'assistant', content: 'Verbindung verloren. Bitte erneut versuchen.' },
        ],
      }));
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [input, sending, session]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setSession({ session_id: null, messages: [WELCOME] });
    setSending(false);
    setInput('');
  };

  const goToHash = (hash: string) => {
    window.location.hash = hash;
    setOpen(false);
  };

  if (hideOnRoute) return null;

  return (
    <>
      {/* First-visit tip */}
      <AnimatePresence>
        {showTip && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, x: 30, y: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="fixed bottom-24 right-5 lg:right-6 z-[90] max-w-[260px] rounded-2xl border border-[#F59E0B]/30 bg-[#101216]/95 backdrop-blur-md px-4 py-3 text-left shadow-[0_10px_40px_-8px_rgba(245,158,11,0.4)] cursor-pointer hover:border-[#F59E0B]/50 transition-colors"
            aria-label="Helpbot öffnen"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#F59E0B] font-medium mb-1">
              <Sparkles className="w-3 h-3" /> AEVUM Assistant
            </div>
            <div className="text-sm text-[#F9FAFB] leading-snug">
              Frag mich was zu KI in deinem Unternehmen.
            </div>
            <div className="absolute -bottom-1.5 right-7 w-3 h-3 rotate-45 bg-[#101216] border-r border-b border-[#F59E0B]/30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="fixed bottom-5 right-5 lg:bottom-6 lg:right-6 z-[95] w-14 h-14 rounded-full bg-[#F59E0B] text-[#0B0C10] flex items-center justify-center shadow-[0_8px_30px_-4px_rgba(245,158,11,0.55)] hover:bg-[#FBBF24] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-[#0B0C10] group"
            aria-label="AEVUM Assistant öffnen"
          >
            <span className="absolute inset-0 rounded-full bg-[#F59E0B]/40 animate-ping opacity-40 group-hover:opacity-0 pointer-events-none" />
            <MessageCircle className="w-6 h-6 relative" strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[98] bg-black/50 backdrop-blur-sm sm:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              role="dialog"
              aria-label="AEVUM Assistant Chat"
              className="fixed z-[99] inset-0 sm:inset-auto sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 sm:w-[420px] sm:max-w-[calc(100vw-2.5rem)] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] flex flex-col bg-[#0B0C10] sm:rounded-2xl overflow-hidden border-0 sm:border sm:border-white/10 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7)]"
              style={{ fontFamily: 'inherit' }}
            >
              {/* Header */}
              <div className="relative flex-shrink-0 px-5 py-4 border-b border-white/[0.06] bg-gradient-to-b from-[#101216] to-[#0B0C10]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-[#0B0C10] shadow-[0_2px_12px_rgba(245,158,11,0.4)]">
                        <Sparkles className="w-4 h-4" strokeWidth={2.4} />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0B0C10]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F9FAFB] tracking-tight">AEVUM Assistant</div>
                      <div className="text-[11px] text-[#71717A] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        Online · Antwort in Sekunden
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={clearChat}
                      title="Neuer Chat"
                      className="p-2 rounded-lg text-[#71717A] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
                      aria-label="Neuer Chat starten"
                    >
                      <RotateCcw className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      title="Schließen"
                      className="p-2 rounded-lg text-[#71717A] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
                      aria-label="Chat schließen"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin"
                style={{ scrollbarColor: '#3F3F46 transparent', scrollbarWidth: 'thin' }}
              >
                {session.messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    msg={m}
                    onCta={goToHash}
                    isLast={i === session.messages.length - 1}
                  />
                ))}
                {sending && session.messages[session.messages.length - 1]?.streaming &&
                  !session.messages[session.messages.length - 1]?.content && (
                  <div className="flex items-center gap-1.5 px-3 -mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]/70 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]/70 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]/70 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0B0C10] px-3 pt-3 pb-3 sm:pb-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <div className="relative flex items-end gap-2 rounded-xl border border-white/10 bg-[#101216] focus-within:border-[#F59E0B]/50 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.08)] transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Frag mich etwas …"
                    rows={1}
                    maxLength={2000}
                    className="flex-1 bg-transparent px-3.5 py-3 text-sm text-[#F9FAFB] placeholder-[#52525B] outline-none resize-none max-h-32"
                    style={{ minHeight: '20px' }}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="mb-1.5 mr-1.5 w-9 h-9 rounded-lg bg-[#F59E0B] text-[#0B0C10] flex-shrink-0 flex items-center justify-center disabled:bg-white/10 disabled:text-[#52525B] hover:bg-[#FBBF24] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-[#0B0C10]"
                    aria-label="Nachricht senden"
                  >
                    <Send className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>
                <div className="mt-2 px-1 text-[10px] text-[#52525B] tracking-wide">
                  Powered by Claude Sonnet 4.5 · keine Daten an Dritte
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Message Bubble ────────────────────────────────────────
interface BubbleProps {
  msg: ChatMsg;
  onCta: (hash: string) => void;
  isLast: boolean;
}

function MessageBubble({ msg, onCta, isLast }: BubbleProps) {
  const isUser = msg.role === 'user';
  const ctas = !isUser && msg.content ? detectCtas(msg.content) : { audit: false, call: false };
  const showCtas = !isUser && !msg.streaming && isLast && (ctas.audit || ctas.call);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-[#F59E0B] text-[#0B0C10] rounded-br-md font-medium'
              : 'bg-[#16181D] text-[#E4E4E7] rounded-bl-md border border-white/[0.04]'
          }`}
        >
          {msg.content || (msg.streaming ? '' : ' ')}
          {msg.streaming && msg.content && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 -mb-0.5 bg-[#F59E0B] animate-pulse" />
          )}
        </div>

        {showCtas && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {ctas.audit && (
              <button
                type="button"
                onClick={() => onCta('/audit')}
                className="px-3.5 py-1.5 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 hover:border-[#F59E0B]/60 text-[#F59E0B] text-[12px] font-medium transition-all"
              >
                → Audit starten
              </button>
            )}
            {ctas.call && (
              <button
                type="button"
                onClick={() => onCta('/audit')}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F9FAFB] text-[12px] font-medium transition-all"
              >
                → Erstgespräch buchen
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
