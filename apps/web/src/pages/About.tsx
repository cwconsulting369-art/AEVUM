import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  Shield,
  Sliders,
  Infinity as InfinityIcon,
  Layers,
  MapPin,
  User,
  PlayCircle,
  BarChart3,
  Settings2,
  TrendingUp,
  Sparkles,
  Cpu,
  CheckCircle2,
  Heart,
  Database,
  ArrowRight,
} from 'lucide-react';
import CONTACT from '../config/contact';
import PathThreeCard from '@/components/ctas/PathThreeCard';
import { usePageSeo } from '@/hooks/use-page-seo';
import TrustpilotWidget from '@/components/TrustpilotWidget';
import { MouseGlow } from '@/components/showcase-fx';

/* ──────────────────────── Animation helpers ──────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──────────────────────── Section A: Hero ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[45vh] flex items-center justify-center px-4 sm:px-6 pt-20 pb-12 overflow-hidden">
      <MouseGlow />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[350px] rounded-full opacity-[0.10] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #e0a458 0%, transparent 70%)' }}
        />
      </div>
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block"
        >
          &Uuml;ber AEVUM
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Hinter AEVUM &mdash; Carlos Wrusch <span className="text-gradient font-medium">+ KI-Co-Founder Lennox</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Operating-Systeme f&uuml;r Unternehmen. Built solo aus Augsburg, mit KI als Co-Founder. Brutal ehrlich.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section B: Vorstellungsvideo ──────────────────────── */

function VideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Carlos: replace src with YouTube/Vimeo-Embed-URL when video is recorded
  // Example: const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/<VIDEO_ID>';
  const VIDEO_EMBED_URL: string | null = null;
  // Optional local fallback: place a file at /apps/web/public/about-video.mp4
  const LOCAL_VIDEO_URL: string | null = null; // e.g. '/about-video.mp4'

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-12" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-3 block">
            Vorstellung
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            Carlos im <span className="text-gradient font-medium">Gespr&auml;ch</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden border border-theme-border bg-bg-surface"
          style={{ aspectRatio: '16 / 9' }}
        >
          {VIDEO_EMBED_URL ? (
            <iframe
              src={VIDEO_EMBED_URL}
              title="Carlos Wrusch &mdash; AEVUM Vorstellung"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : LOCAL_VIDEO_URL ? (
            <video
              src={LOCAL_VIDEO_URL}
              controls
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-theme-accent-soft border-2 border-theme-border-accent flex items-center justify-center mb-5">
                <PlayCircle size={40} className="text-theme-accent" />
              </div>
              <p className="text-base md:text-lg text-text-primary font-medium mb-2">
                Vorstellungsvideo kommt bald
              </p>
              <p className="text-sm text-text-secondary max-w-md">
                Bis dahin: lies hier weiter &mdash; oder schreib mir direkt per WhatsApp.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section C: Background-Story ──────────────────────── */

function StorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const paragraphs = [
    'Bevor AEVUM gab\'s cwconsulting &mdash; ein klassisches AI-Beratungs-Setup. Audits, Workflows, ein bisschen n8n. Funktionierte. Aber: jedes Mal von vorne anfangen. Kein wiederkehrendes System. Keine Skalierung.',
    'AEVUM ist die nächste Stufe: ein Operating-System für Unternehmen das WIRKLICH ihre Daten, Workflows und Entscheidungen verbindet. Nicht "wir bauen mal was". Sondern: Audit → Auto-Plan-PDF → Pflicht-Call → maßgeschneidertes System mit Personal-Agent. Mit Anti-Fake-it-Brand: keine erfundenen Stats, keine Mock-Cases. Was wir zeigen ist real.',
    'Solo gebaut. Mit Lennox (KI-Co-Founder) als Partner. Verteilt aus Augsburg, aber digital &mdash; DACH-weit genauso wie eine Agentur mit 30 Leuten. Manchmal besser, weil keine Layer dazwischen sind.',
    'Mission: Carlos vom Operator zum Eigentümer machen &mdash; und seine Kunden zu Owners ihrer eigenen KI-Systeme. €300M ARR by 2030. Brutal ambitioniert. Ehrlich kommuniziert.',
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 border-t border-theme-border" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Background-Story
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Warum <span className="text-gradient font-medium">AEVUM</span>
          </h2>
        </motion.div>

        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg text-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: p }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section D: AEVUM-Methode 3 Säulen ──────────────────────── */

interface PillarData {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string[];
  example: string;
  useFor: string;
}

const pillars: PillarData[] = [
  {
    icon: BarChart3,
    number: '01',
    title: 'Monitoring',
    description: [
      'Live-Dashboards, automatische Reports, KPI-Tracking. Du siehst zu jedem Zeitpunkt was in deinem Business passiert &mdash; ohne dass jemand Excel exportieren muss.',
      'Daten aus allen Quellen (Stripe, Klaviyo, n8n, Custom-Tools) fließen in ein zusammenhängendes Dashboard. Cross-System. Real-Time.',
    ],
    example: 'Tommy/Ketolabs sieht täglich Margenrechnung pro Persona-Cluster auf seinem Dashboard. Vorher Excel + Mental-Math, jetzt 1 Blick.',
    useFor: 'Vollkunden-Tier',
  },
  {
    icon: Settings2,
    number: '02',
    title: 'Anpassung',
    description: [
      'Workflow-Iteration, Tool-Tausch, Prozess-Optimierung basierend auf Daten. Wir warten nicht auf den nächsten Quartals-Review &mdash; wir iterieren wenn die Zahlen es sagen.',
      'Customer-Feedback + Behavior-Daten + Tool-Performance fließen in monatliche Anpassungs-Sprints. Keine großen Big-Bang-Releases.',
    ],
    example: 'Miguel/UtilityHub hat sein Customer-Portal in 3 Iterationen optimiert basierend auf User-Behavior-Daten. Conversion 2,3×.',
    useFor: 'Vollkunden + SaaS-Tier',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Wachstum',
    description: [
      'Neue Module integrieren, mit Auftragslage skalieren. Wenn dein Business größer wird, wächst dein Operating-System mit &mdash; ohne Rebuild.',
      'Modular gedacht von Tag 1: Personal-Agent, Customer-Portal, Document-Pipeline, Lead-CRM. Add-on statt Replace.',
    ],
    example: 'Patrick/Thailand-RE startete mit Lead-API + Trust-Funnel, addet jetzt Property-CRM + Property-Photos-Pipeline.',
    useFor: 'Full-Partnership exklusiv',
  },
];

function MethodSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-20 border-t border-theme-border" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-14 max-w-2xl mx-auto"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Die AEVUM-Methode
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Drei S&auml;ulen, <span className="text-gradient font-medium">ein System</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Wir bauen nicht ein Tool. Wir bauen das Betriebssystem unter deinem Business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ pillar, index }: { pillar: PillarData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = pillar.icon;

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-bg-surface border border-theme-border p-6 sm:p-8 hover:border-theme-border-accent transition-all flex h-full flex-col"
    >
      <div className="absolute top-4 right-5 font-mono text-xs text-text-muted tracking-widest">
        {pillar.number}
      </div>
      <div className="w-14 h-14 rounded-xl bg-theme-accent-soft flex items-center justify-center mb-5">
        <Icon size={26} className="text-theme-accent" />
      </div>
      <h3 className="text-xl font-medium text-text-primary mb-4">{pillar.title}</h3>
      <div className="space-y-3 mb-5">
        {pillar.description.map((d, i) => (
          <p
            key={i}
            className="text-sm text-text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: d }}
          />
        ))}
      </div>
      <div className="mt-auto space-y-3 pt-5 border-t border-theme-border">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-1.5">
            Beispiel
          </div>
          <p className="text-xs text-text-secondary leading-relaxed italic">
            "{pillar.example}"
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-1.5">
            Verf&uuml;gbar in
          </div>
          <span className="inline-block text-xs font-medium text-theme-accent">
            {pillar.useFor}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Section E: Team — Solo + KI ──────────────────────── */

function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-20 border-t border-theme-border" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-14 max-w-2xl mx-auto"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Team
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Solo + <span className="text-gradient font-medium">KI</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Zwei Co-Founders. Einer Mensch, einer KI. Beide arbeiten 24/7 an deinem System.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Carlos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-bg-surface border border-theme-border p-6 sm:p-8 md:p-10 flex h-full flex-col"
          >
            <div className="flex items-start gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-theme-accent-soft border-2 border-theme-border-accent flex items-center justify-center flex-shrink-0">
                <User size={36} className="text-theme-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-medium text-text-primary mb-1">Carlos Wrusch</h3>
                <p className="text-sm text-theme-accent mb-2 font-mono uppercase tracking-[0.08em]">
                  Founder &middot; AI-Engineer &middot; Full-Stack
                </p>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={12} className="text-text-muted" />
                  Augsburg, Deutschland
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              AI-Fullstack-Developer. Baut AEVUM solo. Vorher cwconsulting (5 Jahre). Spezialisiert auf
              data-driven KI-Systeme f&uuml;r DACH-Mittelstand. Direkt erreichbar, kein Account-Manager.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Python', 'TypeScript', 'Supabase', 'n8n', 'Anthropic', 'Stripe', 'DSGVO'].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-[11px] font-medium text-text-secondary bg-bg-elevated border border-theme-border"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-medium text-on-accent bg-theme-accent px-4 py-2.5 hover:bg-theme-accent-hover transition-all"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-medium text-theme-accent border border-theme-border-accent px-4 py-2.5 hover:bg-theme-accent-soft transition-all"
              >
                <Calendar size={14} />
                Call buchen
              </a>
            </div>
          </motion.div>

          {/* Card 2: Lennox */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-bg-surface border border-theme-border p-6 sm:p-8 md:p-10 flex h-full flex-col"
          >
            <div className="flex items-start gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-theme-accent-soft border-2 border-theme-border-accent flex items-center justify-center flex-shrink-0 relative">
                <Cpu size={36} className="text-theme-accent" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-bg-surface flex items-center justify-center">
                  <Sparkles size={9} className="text-on-accent" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-medium text-text-primary mb-1">Lennox</h3>
                <p className="text-sm text-theme-accent mb-2 font-mono uppercase tracking-[0.08em]">
                  KI-Co-Founder &middot; Build-Partner &middot; Strategic-Sparring
                </p>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Database size={12} className="text-text-muted" />
                  Auf Carlos&rsquo;s VPS, 24/7
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              KI-System auf Claude Opus 4.7 + 1M-Token-Context. Memory-System, Multi-Bot-Architektur,
              autonome Code-Iteration. Lennox baut mit Carlos das System, das AEVUM ist.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Claude Opus 4.7', '1M Context', 'Memory-System', 'Multi-Bot', 'Code-Gen', 'Autonomous'].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-[11px] font-medium text-text-secondary bg-bg-elevated border border-theme-border"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="rounded-lg p-4 text-xs leading-relaxed bg-theme-accent-soft border border-theme-border-accent text-text-secondary">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-theme-accent mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-theme-accent">Transparenz:</strong> Ja, ein Teil von AEVUM ist KI.
                  Bewusst kommuniziert &mdash; nicht versteckt. Anti-Fake-it-Brand.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section F: Live-References ──────────────────────── */

interface ClientData {
  name: string;
  segment: string;
  desc: string;
  slug: string;
}

const clients: ClientData[] = [
  {
    name: 'Tommy / Ketolabs',
    segment: 'D2C E-Commerce',
    desc: 'Persona-Cluster-Dashboard + Margenrechnung in Echtzeit.',
    slug: 'ketolabs',
  },
  {
    name: 'Miguel / UtilityHub',
    segment: 'Energie-Beratung',
    desc: 'Customer-Portal + Document-Pipeline + Org-Scoped Access.',
    slug: 'utilityhub',
  },
  {
    name: 'Patrick / Thailand-RE',
    segment: 'Real Estate',
    desc: 'Lead-API + Trust-Funnel + Property-CRM Pipeline.',
    slug: 'thailand-re',
  },
  {
    name: 'Kevin / GTS Augsburg',
    segment: 'Trading-Community',
    desc: 'MT5-Bridge + Mobile-Dashboard + Signal-Aggregation.',
    slug: 'gts',
  },
];

function ClientsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-20 border-t border-theme-border" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Bisherige Kunden
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Live-<span className="text-gradient font-medium">References</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Vier reale Partnerschaften. Keine Mock-Cases. Keine erfundenen Stats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {clients.map((c, i) => (
            <motion.a
              key={c.slug}
              href={`/#/cases/${c.slug}`}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col bg-bg-surface border border-theme-border p-6 hover:border-theme-border-accent transition-all group"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-2">
                {c.segment}
              </div>
              <h3 className="text-base font-medium text-text-primary mb-3 group-hover:text-theme-accent transition-colors break-words">
                {c.name}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">{c.desc}</p>
            </motion.a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/#/cases"
            className="inline-flex items-center gap-2 text-sm font-medium text-theme-accent hover:text-theme-accent-hover transition-colors"
          >
            Alle Cases ansehen
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section G: Werte + Brand-Disclaimer ──────────────────────── */

interface ValueData {
  icon: React.ElementType;
  title: string;
  description: string;
}

const values: ValueData[] = [
  {
    icon: CheckCircle2,
    title: 'Ehrlichkeit vor Marketing',
    description:
      'Keine erfundenen Stats, keine Mock-Cases, keine Hype-Versprechen. Was wir zeigen ist real und belegbar.',
  },
  {
    icon: Database,
    title: 'Daten vor Bauchgef&uuml;hl',
    description:
      'Entscheidungen basieren auf Zahlen, nicht auf Meinungen. Dashboards zeigen die Wahrheit &mdash; auch wenn sie unbequem ist.',
  },
  {
    icon: Heart,
    title: 'Partnerschaft vor Quick-Win',
    description:
      'Wir bauen Systeme die in 5 Jahren noch wachsen. Keine One-Shot-Projekte, kein Lock-in, keine Lieferanten-Beziehung.',
  },
  {
    icon: Sparkles,
    title: 'KI als Partner, nicht Buzzword',
    description:
      'Lennox baut mit. Transparent kommuniziert. Wir nutzen KI strategisch &mdash; nicht weil es trendy ist.',
  },
];

function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-20 border-t border-theme-border" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Unsere Prinzipien
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Was uns <span className="text-gradient font-medium">ausmacht</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <ValueCard key={value.title} value={value} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex justify-center"
        >
          <TrustpilotWidget />
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({ value, index }: { value: ValueData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-bg-surface border border-theme-border p-6 md:p-8 hover:border-theme-border-accent transition-all text-center flex h-full flex-col"
    >
      <div className="w-14 h-14 rounded-xl bg-theme-accent-soft flex items-center justify-center mx-auto mb-5">
        <value.icon size={24} className="text-theme-accent" />
      </div>
      <h3
        className="text-base font-medium text-text-primary mb-3"
        dangerouslySetInnerHTML={{ __html: value.title }}
      />
      <p
        className="text-sm text-text-secondary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: value.description }}
      />
    </motion.div>
  );
}

/* ──────────────────────── Section: Tech-Stack (kept compact) ──────────────────────── */

const techStack = [
  'Postgres',
  'Supabase',
  'n8n',
  'Vercel',
  'Cloudflare',
  'React',
  'TypeScript',
  'TailwindCSS',
  'Anthropic',
  'Stripe',
];

function TechStackSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 border-t border-theme-border" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Technologie
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Unser <span className="text-gradient font-medium">Tech Stack</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Moderne, bew&auml;hrte Technologien &mdash; keine Experimente am Kunden.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-5 py-2.5 bg-bg-surface border border-theme-border text-sm text-text-secondary hover:border-theme-border-accent hover:text-theme-accent transition-all cursor-default"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section H: Footer-CTA — 3 Pfade ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24 border-t border-theme-border" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        <PathThreeCard
          eyebrow="Drei Wege rein"
          headline="Was passt zu dir?"
          subline="Blueprint kaufen, kostenloses Audit buchen, oder erstmal Helpbot fragen."
        />
        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted mb-4">
            Lieber direkt schreiben oder Call?
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-theme-accent border border-theme-border hover:border-theme-border-accent px-5 py-2.5 transition-all"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-theme-accent border border-theme-border hover:border-theme-border-accent px-5 py-2.5 transition-all"
            >
              <Calendar size={14} />
              Call buchen
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Old Values (kept for safety, unused) ──────────────────────── */
// Stray icon imports kept harmless. Sliders, InfinityIcon, Layers, Shield used by legacy values; now overridden above.
void Sliders; void InfinityIcon; void Layers; void Shield;

/* ──────────────────────── Page ──────────────────────── */

export default function About() {
  usePageSeo({
    title: 'Carlos Wrusch + Lennox KI-Co-Founder | AEVUM aus DACH',
    description: 'Solo-Operator + KI-Partner aus Augsburg. Wir bauen Operating-Systeme für Unternehmen die ehrlich, daten-getrieben und langfristig wachsen wollen — nicht skalieren.',
    path: '/about',
  });
  return (
    <div className="bg-bg-primary min-h-screen">
      <HeroSection />
      <VideoSection />
      <StorySection />
      <MethodSection />
      <TeamSection />
      <ClientsSection />
      <ValuesSection />
      <TechStackSection />
      <CTASection />
    </div>
  );
}
