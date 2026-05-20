import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, MessageCircle, Calendar } from 'lucide-react';

/* ── design tokens ─────────────────────────────────────────── */
const BG_VOID = '#0B0C10';
const BG_SURFACE = '#15161A';
const ACCENT_AMBER = '#F59E0B';
const ACCENT_GOLD = '#D97706';
const TEXT_PRIMARY = '#F9FAFB';
const TEXT_SECONDARY = '#A1A1AA';
const TEXT_MUTED = '#52525B';
const BORDER_SUBTLE = 'rgba(255, 255, 255, 0.1)';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ── reusable helpers ──────────────────────────────────────── */
function SectionReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isIn = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isIn ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function KpiBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="font-['Space_Grotesk'] text-[2rem] md:text-[2.5rem] font-light"
        style={{ color: ACCENT_AMBER }}
      >
        {value}
      </div>
      <div
        className="font-['JetBrains_Mono'] text-[0.75rem] uppercase tracking-[0.1em] mt-2"
        style={{ color: TEXT_MUTED }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── case study data ───────────────────────────────────────── */
interface CaseStudy {
  tag: string;
  name: string;
  industry: string;
  challenge: string;
  solution: string;
  kpis: { value: string; label: string }[];
  quote: string;
  image: string;
  imageLeft: boolean;
  ctaText: string;
}

const CASES: CaseStudy[] = [
  {
    tag: 'E-COMMERCE',
    name: 'Kevin — Ketolabs',
    industry: 'E-Commerce OS · Pilot 2026',
    challenge:
      'Manuelle Auftragsabwicklung, kein Lead-Nurturing, Werbebudget fliesst in unqualifizierten Traffic.',
    solution:
      'KI-Agenten-Stack im Aufbau: Lead-Qualifizierung, Kundensupport, Auftragsabwicklung, Ad-Optimierung, Retargeting und Analytics. Sechs Module deployed, finale Performance-Messung läuft.',
    kpis: [
      { value: '6', label: 'AI-Module deployed' },
      { value: 'Live', label: 'Performance-Tracking' },
      { value: '2026', label: 'Pilot-Phase' },
    ],
    quote: '',
    image: '/case-kevin.jpg',
    imageLeft: true,
    ctaText: 'STARTE DEIN SYSTEM',
  },
  {
    tag: 'PERSONAL BRAND',
    name: 'Tim — Consulting & Coaching',
    industry: 'Content Automation · Pilot 2026',
    challenge:
      'Keine Zeit f\u00FCr Content neben Klientenarbeit. Unregelm\u00E4ssiges Posting. Kein Lead-Capture-System.',
    solution:
      'Vollst\u00E4ndige Content-Automatisierung: Video \u2192 Blog + LinkedIn + Newsletter. Klienten-Workflow mit CRM-Integration.',
    kpis: [
      { value: 'Pipeline', label: 'Setup deployed' },
      { value: 'CRM', label: 'Integration aktiv' },
      { value: '2026', label: 'Pilot-Phase' },
    ],
    quote: '',
    image: '/case-tim.jpg',
    imageLeft: false,
    ctaText: 'BAUE DEINE PIPELINE',
  },
  {
    tag: 'REAL ESTATE',
    name: 'Patrick — Property & Sales',
    industry: 'Lead & CRM System · Pilot 2026',
    challenge:
      'Leads gehen verloren. Kein zentrales System. Manuelles Follow-up bei jeder Anfrage.',
    solution:
      'Integriertes Lead-System: Anfragen-Erfassung, Auto-Qualifizierung, CRM-Routing, Follow-up-Sequenzen und Website-Relaunch.',
    kpis: [
      { value: 'Deployed', label: 'Vollständiges Setup' },
      { value: 'Website', label: 'Relaunch live' },
      { value: '2026', label: 'Pilot-Phase' },
    ],
    quote: '',
    image: '/case-patrick.jpg',
    imageLeft: true,
    ctaText: 'ERFASSE JEDEN LEAD',
  },
  {
    tag: 'TECH-PARTNERSHIP',
    name: 'Miguel — UtilityHub',
    industry: 'B2B SaaS · Technischer Partner',
    challenge:
      'UtilityHub benötigt DSGVO-konforme Multi-Tenant-Plattform für Hausverwaltungen, Datenintegration aus mehreren Quellen, sicheres Hosting.',
    solution:
      'Technische Partnerschaft mit HC Growth LTD: Hosting-Stack, DSGVO-Compliance-Layer, Datenintegration, Security-Audits.',
    kpis: [
      { value: 'DSGVO', label: 'Compliance-Stack live' },
      { value: 'Multi-Tenant', label: 'Architektur aktiv' },
      { value: '2026', label: 'laufende Partnerschaft' },
    ],
    quote: '',
    image: '/case-miguel.jpg',
    imageLeft: false,
    ctaText: 'SKALIERE DEIN OUTREACH',
  },
];

/* ── hero stat bar — ehrlich, keine Aggregat-Fantasie-Zahlen ─── */
const HERO_STATS = [
  { value: '4', label: 'aktive Pilot-Cases' },
  { value: '2026', label: 'erste Auswertungs-Periode' },
  { value: '90 Tage', label: 'bis zu finalen KPIs' },
  { value: '4', label: 'Branchen' },
];

/* ════════════════════════════════════════════════════════════ */
/*  Page Component                                             */
/* ════════════════════════════════════════════════════════════ */
export default function Cases() {
  return (
    <div style={{ background: BG_VOID, color: TEXT_PRIMARY }}>
      {/* ── Section 1: Hero ──────────────────────────────── */}
      <HeroSection />

      {/* ── Section 2-5: Case Studies ────────────────────── */}
      {CASES.map((c, i) => (
        <CaseSection key={c.tag} study={c} index={i} />
      ))}

      {/* ── Section 6: CTA ───────────────────────────────── */}
      <CtaSection />
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────── */
function HeroSection() {
  const ref = useRef(null);
  const isIn = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        minHeight: '70vh',
        background: BG_VOID,
        padding: '0 2rem',
      }}
    >
      {/* subtle radial glow behind text */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 45%, rgba(245,158,11,0.12), transparent)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isIn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="font-['JetBrains_Mono'] text-[0.75rem] uppercase tracking-[0.1em] mb-6"
        style={{ color: ACCENT_AMBER }}
      >
        THE PROOF
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={isIn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
        className="font-['Space_Grotesk'] font-light leading-[1.1] tracking-[-0.02em] max-w-[900px]"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: TEXT_PRIMARY }}
      >
        Vier Pilot-Cases.{" "}
        <span style={{ color: ACCENT_AMBER }}>
          Offen dokumentiert.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isIn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
        className="font-['Inter'] text-[1rem] md:text-[1.125rem] font-normal leading-[1.75] max-w-[640px] mt-6"
        style={{ color: TEXT_SECONDARY }}
      >
        Wir starten 2026 mit den ersten Kunden. Statt aufgeblasener Statistiken
        zeigen wir den realen Stand jedes Projekts \u2014 was l\u00E4uft, was wir liefern,
        was noch nicht ausgewertet ist. Finale KPIs folgen nach 90 Tagen Laufzeit.
      </motion.p>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isIn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT_EXPO }}
        className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
      >
        {HERO_STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div
              className="font-['JetBrains_Mono'] text-[1rem] md:text-[1.125rem]"
              style={{ color: ACCENT_AMBER }}
            >
              {s.value}
            </div>
            <div
              className="font-['JetBrains_Mono'] text-[0.7rem] uppercase tracking-[0.08em] mt-1"
              style={{ color: TEXT_MUTED }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Case Study Section ────────────────────────────────────── */
function CaseSection({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const ref = useRef(null);
  const isIn = useInView(ref, { once: true, margin: '-100px' });
  const bg = index % 2 === 0 ? BG_SURFACE : BG_VOID;

  const imageBlock = (
    <motion.div
      initial={{ opacity: 0, x: study.imageLeft ? -60 : 60 }}
      animate={isIn ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      className="w-full lg:w-1/2"
    >
      <div
        className="w-full overflow-hidden"
        style={{ maxHeight: '560px' }}
      >
        <img
          src={study.image}
          alt={study.name}
          className="w-full h-full object-cover"
          style={{ minHeight: '400px' }}
          loading="lazy"
        />
      </div>
    </motion.div>
  );

  const contentBlock = (
    <motion.div
      initial={{ opacity: 0, x: study.imageLeft ? 60 : -60 }}
      animate={isIn ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
      className="w-full lg:w-1/2 flex flex-col justify-center"
      style={{ padding: 'clamp(2rem, 5vh, 4rem) clamp(1.5rem, 4vw, 3rem)' }}
    >
      {/* Industry tag */}
      <span
        className="font-['JetBrains_Mono'] text-[0.75rem] uppercase tracking-[0.1em] mb-4"
        style={{ color: ACCENT_AMBER }}
      >
        {study.tag}
      </span>

      {/* Name */}
      <h2
        className="font-['Space_Grotesk'] text-[2rem] md:text-[2.25rem] font-normal leading-[1.2] tracking-[-0.01em] mb-8"
        style={{ color: TEXT_PRIMARY }}
      >
        {study.name}
      </h2>

      {/* Challenge */}
      <div className="mb-6">
        <h3
          className="font-['JetBrains_Mono'] text-[0.7rem] uppercase tracking-[0.1em] mb-2"
          style={{ color: TEXT_MUTED }}
        >
          Herausforderung
        </h3>
        <p
          className="font-['Inter'] text-[0.95rem] font-normal leading-[1.75]"
          style={{ color: TEXT_SECONDARY }}
        >
          {study.challenge}
        </p>
      </div>

      {/* Solution */}
      <div className="mb-10">
        <h3
          className="font-['JetBrains_Mono'] text-[0.7rem] uppercase tracking-[0.1em] mb-2"
          style={{ color: TEXT_MUTED }}
        >
          L{"\u00F6"}sung
        </h3>
        <p
          className="font-['Inter'] text-[0.95rem] font-normal leading-[1.75]"
          style={{ color: TEXT_SECONDARY }}
        >
          {study.solution}
        </p>
      </div>

      {/* KPIs */}
      <div
        className="grid grid-cols-3 gap-4 mb-10 p-6"
        style={{
          background: index % 2 === 0 ? BG_VOID : BG_SURFACE,
          border: `1px solid ${BORDER_SUBTLE}`,
        }}
      >
        {study.kpis.map((k) => (
          <KpiBlock key={k.label} value={k.value} label={k.label} />
        ))}
      </div>

      {/* Quote — only render if we have a real customer quote */}
      {study.quote ? (
        <blockquote
          className="font-['JetBrains_Mono'] text-[0.9rem] italic leading-[1.6] mb-8 pl-4"
          style={{
            color: TEXT_SECONDARY,
            borderLeft: `2px solid ${ACCENT_AMBER}`,
          }}
        >
          &ldquo;{study.quote}&rdquo;
        </blockquote>
      ) : (
        <p
          className="font-['JetBrains_Mono'] text-[0.8rem] uppercase tracking-[0.08em] mb-8 pl-4"
          style={{ color: TEXT_MUTED, borderLeft: `2px solid ${BORDER_SUBTLE}` }}
        >
          Kunden-Statement folgt nach Pilot-Auswertung — wir veröffentlichen erst nach Freigabe.
        </p>
      )}

      {/* CTA */}
      <a
        href="/workflow-audit"
        className="inline-flex items-center gap-2 font-['Inter'] text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-all duration-300 hover:gap-3 self-start"
        style={{ color: ACCENT_AMBER }}
      >
        {study.ctaText}
        <ArrowRight size={16} />
      </a>
    </motion.div>
  );

  return (
    <section
      ref={ref}
      style={{
        background: bg,
        paddingTop: 'clamp(4rem, 8vh, 8rem)',
        paddingBottom: 'clamp(4rem, 8vh, 8rem)',
        borderTop: index > 0 ? `1px solid ${BORDER_SUBTLE}` : 'none',
      }}
    >
      <div
        className={`max-w-[1440px] mx-auto flex flex-col ${
          study.imageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
        }`}
      >
        {imageBlock}
        {contentBlock}
      </div>
    </section>
  );
}

/* ── CTA Section ───────────────────────────────────────────── */
function CtaSection() {
  const ref = useRef(null);
  const isIn = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center justify-center text-center"
      style={{
        background: BG_SURFACE,
        paddingTop: 'clamp(4rem, 12vh, 10rem)',
        paddingBottom: 'clamp(4rem, 12vh, 10rem)',
        borderTop: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      <div style={{ padding: '0 2rem' }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="font-['Space_Grotesk'] text-[2rem] md:text-[3rem] font-light leading-[1.15] tracking-[-0.01em] max-w-[700px] mx-auto"
          style={{ color: TEXT_PRIMARY }}
        >
          Dein Case Study beginnt{" "}
          <span style={{ color: ACCENT_AMBER }}>hier</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="font-['Inter'] text-[1rem] leading-[1.75] max-w-[500px] mx-auto mt-6"
          style={{ color: TEXT_SECONDARY }}
        >
          Schreib uns auf WhatsApp oder buche einen Call. Wir analysieren deinen Workflow und zeigen dir, wo KI sofort wirkt.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          {/* WhatsApp */}
          <a
            href="https://wa.me/4917672520373"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-['Inter'] text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: ACCENT_AMBER,
              color: '#000000',
              borderRadius: '9999px',
              padding: '1rem 2.5rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
            }}
          >
            <MessageCircle size={18} />
            WhatsApp schreiben
          </a>

          {/* Calendly */}
          <a
            href="https://calendly.com/aevum-system/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-['Inter'] text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'transparent',
              color: TEXT_PRIMARY,
              border: `1px solid ${BORDER_SUBTLE}`,
              borderRadius: '9999px',
              padding: '1rem 2.5rem',
            }}
          >
            <Calendar size={18} />
            Call buchen
          </a>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isIn ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_EXPO }}
          className="font-['JetBrains_Mono'] text-[0.75rem] uppercase tracking-[0.1em] mt-12"
          style={{ color: TEXT_MUTED }}
        >
          Durchschnittliche Zeit von Audit bis Deployment: 6{" "}
          {"\u2013"} 8 Wochen.
        </motion.p>
      </div>
    </section>
  );
}
