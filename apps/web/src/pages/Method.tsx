import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search,
  Wrench,
  Zap,
  LayoutDashboard,
  Settings2,
  TrendingUp,
  ArrowRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import CONTACT from '../config/contact';

/* ──────────────────────── Animation helpers ──────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block"
        >
          Unser Prozess
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Wie wir <span className="text-gradient font-medium">arbeiten</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Analyse &rarr; Setup &rarr; Run. Kein vordefiniertes Paket — nur was dein Business braucht.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Prozess-Steps ──────────────────────── */

interface StepData {
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  isAnchor?: boolean;
}

const steps: StepData[] = [
  {
    icon: Search,
    label: '01',
    title: 'ANALYSE',
    description: 'Wir verstehen dein Business bevor wir bauen',
    bullets: [
      '15-25 Fragen im Audit-Formular',
      'Analyse deines Tool-Stacks, Datenlandschaft, Pain-Points',
      'Automatisch generierter Pitch-Report mit Roadmap',
    ],
    ctaLabel: 'Audit starten',
    ctaHref: '/#/audit',
  },
  {
    icon: Wrench,
    label: '02',
    title: 'SETUP',
    description: 'Dashboard, Agent und Workflows — auf dein Setup zugeschnitten',
    bullets: [
      'Individuelles AEVUM-OS Dashboard',
      'Personal Assistant Agent mit Domain-Wissen',
      'Workflow-Bausteine aus der Blueprint-Library',
    ],
    ctaLabel: 'Mehr erfahren',
    ctaHref: '#pillars',
    isAnchor: true,
  },
  {
    icon: Zap,
    label: '03',
    title: 'RUN',
    description: 'Monitoring, Anpassung, Wachstum — als laufende Partnerschaft',
    bullets: [
      'Monatliche Performance-Reports',
      'Laufende Workflow-Optimierung',
      'Neue Bausteine bei Bedarf',
    ],
    ctaLabel: 'Call buchen',
    ctaHref: CONTACT.calendly,
  },
];

function ProcessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Der AEVUM-Prozess
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            Drei Phasen, ein <span className="text-gradient font-medium">System</span>
          </h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto">
            Kein Cookie-Cutter. Jede Phase wird auf dein Business zugeschnitten.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="flex justify-center mt-12"
        >
          <a
            href="#pillars"
            className="flex flex-col items-center gap-2 text-[#52525B] hover:text-[#F59E0B] transition-colors"
          >
            <span className="text-xs font-mono uppercase tracking-wider">Die 3 S&auml;ulen</span>
            <ChevronDown size={18} className="animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: StepData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const isExternal = step.ctaHref.startsWith('http');
  const linkProps = isExternal
    ? { href: step.ctaHref, target: '_blank', rel: 'noopener noreferrer' as const }
    : step.isAnchor
      ? { href: step.ctaHref }
      : { href: step.ctaHref };

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative flex-1"
    >
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-12 left-[60%] right-0 h-[2px] bg-gradient-to-r from-[#F59E0B]/30 to-transparent" />
      )}

      <div className="bg-[#15161A] border border-white/10 p-8 h-full flex flex-col hover:border-[#F59E0B]/30 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
            <step.icon size={22} className="text-[#F59E0B]" />
          </div>
          <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">
            {step.label}
          </span>
        </div>

        <h3 className="text-xl font-medium tracking-tight mb-2 text-[#F9FAFB]">{step.title}</h3>
        <p className="text-sm text-[#A1A1AA] mb-6 leading-relaxed">{step.description}</p>

        <ul className="space-y-3 mb-8 flex-1">
          {step.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
              <span className="w-1 h-1 rounded-full bg-[#F59E0B] mt-2 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>

        <a
          {...linkProps}
          className={
            step.isAnchor
              ? 'btn-secondary w-full text-center'
              : 'btn-primary w-full text-center'
          }
        >
          {step.ctaLabel}
          <ArrowRight size={14} className="ml-2" />
        </a>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Section 3: Die 3 S&auml;ulen ──────────────────────── */

interface PillarData {
  icon: React.ElementType;
  label: string;
  headline: string;
  description: string;
  features: string[];
}

const pillars: PillarData[] = [
  {
    icon: LayoutDashboard,
    label: 'Monitoring',
    headline: 'Du siehst jederzeit, was l&auml;uft',
    description:
      'Transparenz ist die Basis jeder Optimierung. Dein Dashboard zeigt Echtzeit-KPIs, Workflow-Status und Reports.',
    features: [
      'Echtzeit-KPI-Dashboard',
      'W&ouml;chentliche Performance-Reports',
      'Workflow-Status mit Alerting',
      'Data-Hub mit allen Tool-Links',
    ],
  },
  {
    icon: Settings2,
    label: 'Anpassung',
    headline: 'System passt sich an dein Business an',
    description:
      'Dein Business ver&auml;ndert sich &mdash; dein System auch. Workflows werden weiterentwickelt, Tools getauscht, der Agent lernt mit.',
    features: [
      'Workflows werden monatlich reviewed',
      'Tool-Stack-Optimierung',
      'Agent lernt aus Interaktionen',
      'Priorisierung nach Cash-Impact',
    ],
  },
  {
    icon: TrendingUp,
    label: 'Wachstum',
    headline: 'Wir bauen mit dir hoch, nicht f&uuml;r dich',
    description:
      'Neue Bausteine integrieren, Use Cases unlocken, Skalierungs-Logik von Anfang an eingebaut.',
    features: [
      'Neue Workflow-Bausteine bei Bedarf',
      'Use-Case-Expansion',
      'Skalierungs-Strategie',
      'Revenue-Share Option bei Wachstums-Cases',
    ],
  },
];

function PillarsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pillars" className="px-6 lg:px-16 py-24 scroll-mt-20" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Das Fundament
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            Die 3 <span className="text-gradient font-medium">S&auml;ulen</span> im Detail
          </h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto">
            Jedes AEVUM-System baut auf diesen drei Prinzipien auf &mdash; von Tag 1 an.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.label} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ pillar, index }: { pillar: PillarData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-[#15161A] border border-white/10 p-8 md:p-10 hover:border-[#F59E0B]/30 transition-all"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
          <pillar.icon size={26} className="text-[#F59E0B]" />
        </div>
        <div>
          <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">
            S&auml;ule {index + 1}
          </span>
          <h3 className="text-xl font-medium tracking-tight text-[#F9FAFB]">
            {pillar.label.toUpperCase()}
          </h3>
        </div>
      </div>

      <h4
        className="text-lg font-medium text-[#F9FAFB] mb-3"
        dangerouslySetInnerHTML={{ __html: pillar.headline }}
      />
      <p
        className="text-sm text-[#A1A1AA] mb-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: pillar.description }}
      />

      <ul className="space-y-3">
        {pillar.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: feature }} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ──────────────────────── Section 4: CTA ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center bg-[#15161A] border border-white/10 p-10 md:p-16"
      >
        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
          Bereit f&uuml;r dein <span className="text-gradient font-medium">Operating-System</span>?
        </h2>
        <p className="text-[#A1A1AA] mb-10 max-w-lg mx-auto">
          Starte mit einem kostenlosen Audit. Wir analysieren dein Setup und zeigen dir, wo
          Automatisierung den gr&ouml;&szlig;ten Impact hat.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <a href="/#/audit" className="btn-primary">
            Audit starten
            <ArrowRight size={16} className="ml-2" />
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Calendar size={16} className="mr-2" />
            Call buchen
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Method() {
  return (
    <div className="bg-[#0B0C10] min-h-screen">
      <HeroSection />
      <ProcessSection />
      <PillarsSection />
      <CTASection />
    </div>
  );
}
