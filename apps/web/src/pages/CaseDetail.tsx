import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Quote,
  BarChart3,
  Bot,
  Zap,
  Database,
  X,
  Lock,
  Mail,
} from 'lucide-react';

interface ActivatedService {
  slug?: string;
  name?: string;
  started_at?: string;
  impact?: string;
}

interface LiveKpi {
  label?: string;
  value?: string | number;
  unit?: string;
  source?: 'manual' | 'db' | string;
  updated_at?: string;
}

interface CaseDetailDTO {
  slug: string;
  hero_title: string;
  hero_subtitle?: string | null;
  brand_url?: string | null;
  hero_image_url?: string | null;
  project_description?: string | null;
  collaboration_story?: string | null;
  vision?: string | null;
  activated_services?: ActivatedService[];
  live_kpis?: LiveKpi[];
  testimonial_quote?: string | null;
  testimonial_author?: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';

/* ──────────────────────── Helpers ──────────────────────── */

function Paragraphs({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const parts = String(text).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-text-secondary leading-relaxed">
      {parts.map((p, i) => (
        <p key={i} className="break-words">{p}</p>
      ))}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-16 py-12 md:py-16 border-t border-theme-border">
      <div className="max-w-[1100px] mx-auto">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
          {eyebrow}
        </span>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-6 break-words">{title}</h2>
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────── Hero ──────────────────────── */

function Hero({ data }: { data: CaseDetailDTO }) {
  return (
    <section className="relative px-4 sm:px-6 lg:px-16 pt-20 pb-12 md:pt-28 md:pb-16">
      <div className="max-w-[1100px] mx-auto">
        <motion.a
          href="/#/cases"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted hover:text-theme-accent transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Alle Cases
        </motion.a>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-4 block"
        >
          Case Study
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] mb-5 break-words"
        >
          {data.hero_title}
        </motion.h1>

        {data.hero_subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-base md:text-lg text-text-secondary max-w-2xl break-words"
          >
            {data.hero_subtitle}
          </motion.p>
        )}

        {data.brand_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8"
          >
            <a
              href={data.brand_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-mono text-theme-accent hover:text-theme-accent-hover border border-theme-border-accent hover:border-theme-accent px-4 py-2 rounded transition-colors break-all"
            >
              <ExternalLink size={14} className="shrink-0" />
              {data.brand_url.replace(/^https?:\/\//, '')}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────── Services ──────────────────────── */

function Services({ services }: { services: ActivatedService[] }) {
  if (!services.length) return null;
  return (
    <Section eyebrow="Aktivierte AEVUM-Services" title="Was bei diesem Kunden live ist">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-bg-surface border border-theme-border hover:border-theme-border-accent transition-colors p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-theme-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary break-words">{s.name || s.slug}</h3>
                {s.started_at && (
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mt-0.5">
                    Live seit {s.started_at}
                  </p>
                )}
                {s.impact && (
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed break-words">{s.impact}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────── KPIs ──────────────────────── */

function Kpis({ kpis }: { kpis: LiveKpi[] }) {
  if (!kpis.length) return null;
  return (
    <Section eyebrow="Live-KPIs" title="Echte Zahlen — keine Marketing-Stories">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-bg-surface border border-theme-border p-5"
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 break-words">
              {k.label}
            </p>
            <p className="text-xl md:text-2xl font-light text-text-primary break-words">
              {k.value}
              {k.unit && <span className="text-sm text-text-secondary ml-1">{k.unit}</span>}
            </p>
            <span
              className={`mt-3 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${
                k.source === 'db' ? 'text-[#10b981]' : 'text-text-muted'
              }`}
            >
              <CheckCircle2 size={10} />
              {k.source === 'db' ? 'Live aus DB' : 'Manuell verifiziert'}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────── Testimonial ──────────────────────── */

function Testimonial({
  quote,
  author,
}: {
  quote: string | null | undefined;
  author: string | null | undefined;
}) {
  if (!quote && !author) return null;
  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 border-t border-theme-border">
      <div className="max-w-[900px] mx-auto bg-bg-surface border border-theme-border-accent p-6 sm:p-8 md:p-12 relative">
        <Quote
          size={32}
          className="text-theme-accent/30 absolute top-6 left-6"
        />
        <div className="relative z-10 pl-8 sm:pl-10">
          {quote && (
            <p className="text-lg md:text-xl font-light text-text-primary leading-relaxed italic mb-6 break-words">
              &ldquo;{quote}&rdquo;
            </p>
          )}
          {author && (
            <p className="text-sm font-mono uppercase tracking-wider text-theme-accent break-words">
              — {author}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Stack-Preview (NDA-safe Demo-Cards) ──────────────────────── */
/**
 * Zeigt VISUELL was im Customer-Stack ist — OHNE echte Werte.
 * Customer-Daten bleiben unter Lock (permissions=false) bis Freigabe.
 * Carlos-Direktive 2026-05-24: keine Screenshots → keine echten Numbers.
 */

interface StackCardDef {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  statusLabel: string; // gedimmt, generisch
  statusTone: 'active' | 'pending';
  modalBody: string;
}

const STACK_CARDS: StackCardDef[] = [
  {
    key: 'live-dashboard',
    icon: BarChart3,
    title: 'Live-Dashboard',
    statusLabel: 'Real-Time KPIs · wird sichtbar sobald Customer freigibt',
    statusTone: 'pending',
    modalBody:
      'Live-KPI-Dashboard mit täglich aktualisierten Zahlen aus den Customer-Tools. Aktuell unter NDA — sobald der Customer Freigabe erteilt, erscheinen hier echte Werte. Details auf Anfrage bei Carlos.',
  },
  {
    key: 'personal-agent',
    icon: Bot,
    title: 'Personal-AI-Agent',
    statusLabel: 'Aktiv · Details auf Anfrage',
    statusTone: 'active',
    modalBody:
      'Eigener KI-Agent mit Customer-Memory, Tool-Zugriff und WhatsApp/Telegram-Bridge. Architektur und Capabilities auf Anfrage bei Carlos.',
  },
  {
    key: 'automation-stack',
    icon: Zap,
    title: 'Automation-Stack',
    statusLabel: 'Verbundene Tools · Liste auf Anfrage',
    statusTone: 'active',
    modalBody:
      'Mehrere produktive Workflows zwischen den Customer-Tools (Ad-Plattformen, CRM, Analytics, Datenbank, Messaging). Konkrete Tool-Liste und Workflow-Diagramme nur auf Anfrage.',
  },
  {
    key: 'data-sync',
    icon: Database,
    title: 'Data-Sync',
    statusLabel: 'Live-Pipeline · Status aktiv',
    statusTone: 'active',
    modalBody:
      'Tägliche/stündliche Data-Pipelines synchronisieren alle relevanten Quellen in die Customer-DB. Schema und Frequenz auf Anfrage bei Carlos.',
  },
];

function StackCard({
  card,
  index,
  onOpen,
}: {
  card: StackCardDef;
  index: number;
  onOpen: (k: string) => void;
}) {
  const Icon = card.icon;
  const isActive = card.statusTone === 'active';
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(card.key)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative text-left bg-bg-surface border border-theme-border hover:border-theme-border-accent transition-all p-6 rounded overflow-hidden"
    >
      {/* Subtle gradient sheen on hover */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-theme-accent-soft opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
            isActive
              ? 'bg-theme-accent-soft border border-theme-border-accent text-theme-accent'
              : 'bg-bg-elevated border border-theme-border text-text-muted'
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-sm font-medium text-text-primary break-words">{card.title}</h3>
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isActive
                  ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                  : 'bg-bg-elevated text-text-muted border border-theme-border'
              }`}
            >
              {isActive ? <CheckCircle2 size={9} /> : <Lock size={9} />}
              {isActive ? 'aktiv' : 'NDA'}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed break-words">{card.statusLabel}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 pt-4 border-t border-theme-border flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted group-hover:text-theme-accent transition-colors">
          Mehr Details
        </span>
        <ArrowRight
          size={12}
          className="text-text-muted group-hover:text-theme-accent group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </motion.button>
  );
}

function StackModal({ cardKey, onClose }: { cardKey: string | null; onClose: () => void }) {
  const card = STACK_CARDS.find((c) => c.key === cardKey) || null;

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [card, onClose]);

  if (!card) return null;
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stack-modal-title"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-bg-surface border border-theme-border-accent rounded-lg max-w-lg w-full p-6 sm:p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-md bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center mb-5">
          <Icon size={20} className="text-theme-accent" />
        </div>

        <h3 id="stack-modal-title" className="text-xl font-light text-text-primary mb-3 break-words">
          {card.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-6 break-words">{card.modalBody}</p>

        <div className="pt-5 border-t border-theme-border space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Mehr Details bekommen?
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="https://wa.me/491772288372?text=Hi%20Carlos%2C%20Frage%20zu%20diesem%20AEVUM-Case."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-mono text-theme-accent hover:text-theme-accent-hover border border-theme-border-accent hover:border-theme-accent px-4 py-2.5 rounded transition-colors flex-1"
            >
              <ExternalLink size={12} className="shrink-0" />
              WhatsApp Carlos
            </a>
            <a
              href="mailto:info@aevum-system.de?subject=Stack-Details%20auf%20Anfrage"
              className="inline-flex items-center justify-center gap-2 text-xs font-mono text-text-primary hover:text-theme-accent border border-theme-border hover:border-theme-border-accent px-4 py-2.5 rounded transition-colors flex-1 break-all"
            >
              <Mail size={12} className="shrink-0" />
              info@aevum-system.de
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StackPreview() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <Section
      eyebrow="Beispiel-Setup"
      title="Was bei diesem Kunden im Stack ist"
    >
      <p className="text-sm text-text-secondary mb-7 max-w-2xl">
        Die konkreten Werte und Tool-Namen bleiben unter NDA bis der Customer Freigabe
        erteilt. Hier ist der visuelle Überblick — Details auf Anfrage.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STACK_CARDS.map((c, i) => (
          <StackCard key={c.key} card={c} index={i} onOpen={setOpenKey} />
        ))}
      </div>
      <StackModal cardKey={openKey} onClose={() => setOpenKey(null)} />
    </Section>
  );
}

/* ──────────────────────── CTA ──────────────────────── */

function CTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-20 border-t border-theme-border">
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
          Eigenen Case bauen?
        </h2>
        <p className="text-text-secondary mb-8 max-w-lg mx-auto">
          Audit starten, Setup pruefen, klaren Plan bekommen.
        </p>
        <a href="/#/audit" className="btn-primary">
          Audit buchen
          <ArrowRight size={16} className="ml-2" />
        </a>
      </div>
    </section>
  );
}

/* ──────────────────────── Loading + Error ──────────────────────── */

function LoadingState() {
  return (
    <div className="bg-bg-primary min-h-screen px-4 sm:px-6 lg:px-16 pt-24">
      <div className="max-w-[1100px] mx-auto animate-pulse space-y-6">
        <div className="h-3 w-32 bg-bg-elevated rounded" />
        <div className="h-12 w-3/4 bg-bg-elevated rounded" />
        <div className="h-4 w-1/2 bg-bg-elevated rounded" />
        <div className="h-40 bg-bg-elevated rounded mt-12" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-light text-text-primary mb-3">Case nicht gefunden</h1>
        <p className="text-text-secondary mb-8">
          Diesen Case gibt es nicht oder er ist gerade nicht oeffentlich.
        </p>
        <a href="/#/cases" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Alle Cases
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function CaseDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<CaseDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json?.ok || !json.case) {
          setNotFound(true);
          return;
        }
        setData(json.case as CaseDetailDTO);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'unknown';
        if (msg !== 'The user aborted a request.' && !msg.includes('aborted')) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [slug]);

  if (loading) return <LoadingState />;
  if (notFound || !data) return <NotFoundState />;

  const services = data.activated_services || [];
  const kpis = data.live_kpis || [];

  return (
    <div className="bg-bg-primary min-h-screen">
      <Hero data={data} />

      {data.project_description && (
        <Section eyebrow="Das Projekt" title="Worum es geht">
          <Paragraphs text={data.project_description} />
        </Section>
      )}

      {data.collaboration_story && (
        <Section eyebrow="Zusammenarbeit" title="Warum wir zusammenarbeiten">
          <Paragraphs text={data.collaboration_story} />
        </Section>
      )}

      {data.vision && (
        <Section eyebrow="Vision" title="Wo das Ganze hingeht">
          <Paragraphs text={data.vision} />
        </Section>
      )}

      <Services services={services} />
      <Kpis kpis={kpis} />
      <StackPreview />
      <Testimonial quote={data.testimonial_quote} author={data.testimonial_author} />
      <CTA />
    </div>
  );
}
