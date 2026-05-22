import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  Calendar,
  User,
  Building2,
  TrendingUp,
  CheckCircle2,
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

/* ──────────────────────── Types ──────────────────────── */

interface CaseData {
  name: string;
  industry: string;
  share_industry: boolean;
  share_company_name: boolean;
  share_kpis: boolean;
  share_kpi_deltas: boolean;
  kpi_delta: string | null;
  story: string;
  role?: string;
  kpis?: { label: string; value: string }[];
}

const cases: CaseData[] = [
  {
    name: 'Patrick',
    industry: 'Real Estate Thailand',
    share_industry: true,
    share_company_name: false,
    share_kpis: false,
    share_kpi_deltas: true,
    kpi_delta: 'Lead-System live',
    story:
      'Lead-Routing und CRM-Setup f&uuml;r Thailand Real Estate. Anfragen von Website &rarr; automatisiert qualifiziert &rarr; an passenden Agent geroutet.',
  },
  {
    name: 'Miguel',
    industry: 'Energy-Consulting',
    share_industry: true,
    share_company_name: false,
    share_kpis: false,
    share_kpi_deltas: false,
    kpi_delta: null,
    story:
      'Technischer Partner f&uuml;r UtilityHub &mdash; Infrastruktur, DSGVO-Stack, Datenintegration.',
  },
  {
    name: 'Kevin',
    industry: 'E-Commerce',
    share_industry: true,
    share_company_name: false,
    share_kpis: false,
    share_kpi_deltas: false,
    kpi_delta: null,
    story: 'KI-Agenten-Stack f&uuml;r Performance-Marketing &mdash; laufender Pilot.',
  },
  {
    name: 'Tim',
    industry: 'Personal Brand',
    share_industry: true,
    share_company_name: false,
    share_kpis: false,
    share_kpi_deltas: false,
    kpi_delta: null,
    story: 'Automatisierter Content-Workflow von Idee bis Publishing.',
  },
];

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center px-6 pt-16">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block"
        >
          Referenzen
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Live <span className="text-gradient font-medium">Cases</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Echte Projekte. Ehrlich dokumentiert. Nur was unsere Kunden freigeben.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Client Zero &mdash; Carlos ──────────────────────── */

function ClientZeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Client Zero
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Das System, das sich selbst <span className="text-gradient font-medium">baut</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#15161A] border border-[#F59E0B]/30 p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F59E0B]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="flex flex-col items-center md:items-start flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mb-4">
                <User size={32} className="text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-medium text-[#F9FAFB]">Carlos Wrusch</h3>
              <p className="text-sm text-[#A1A1AA]">Founder, AEVUM Systems</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono uppercase tracking-wider">
                <CheckCircle2 size={12} />
                AEVUM &mdash; Client Zero
              </span>
            </div>

            <div className="flex-1">
              <p className="text-[#A1A1AA] leading-relaxed mb-8 text-base">
                Ich baue AEVUM auf mir selbst auf, bevor es zu Kunden kommt. Das ist Client Zero:
                eat your own dog food. Jeder Workflow, jeder Agent, jedes Dashboard l&auml;uft erst bei
                mir, bevor es externalisiert wird.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#0B0C10] border border-white/10">
                  <TrendingUp size={20} className="text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-[#F9FAFB]">System live seit 2024</p>
                    <p className="text-xs text-[#52525B]">Kontinuierliche Entwicklung</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#0B0C10] border border-white/10">
                  <CheckCircle2 size={20} className="text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-[#F9FAFB]">
                      Alle Workflows selbst getestet
                    </p>
                    <p className="text-xs text-[#52525B]">Dogfooding vor Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Weitere Cases ──────────────────────── */

function CaseCard({ caseData, index }: { caseData: CaseData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const displayIndustry = caseData.share_industry
    ? caseData.industry
    : 'Branche vertraulich';
  const displayName = caseData.share_company_name
    ? caseData.name
    : `Kunde ${caseData.name}`;
  const showKpiDelta = caseData.share_kpi_deltas && caseData.kpi_delta;

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-[#15161A] border border-white/10 p-6 md:p-8 hover:border-[#F59E0B]/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#F9FAFB]">{displayName}</h3>
            <span className="text-xs text-[#A1A1AA]">{displayIndustry}</span>
          </div>
        </div>
        {showKpiDelta && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono whitespace-nowrap">
            <TrendingUp size={12} />
            {caseData.kpi_delta}
          </span>
        )}
      </div>

      <p
        className="text-sm text-[#A1A1AA] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: caseData.story }}
      />

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
        {caseData.share_industry && (
          <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">
            Branche freigegeben
          </span>
        )}
        {caseData.share_kpi_deltas && (
          <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">
            KPI freigegeben
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MoreCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Weitere Projekte
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Vertraulich. Aber <span className="text-gradient font-medium">echt</span>.
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl">
            Nicht alle Kunden k&ouml;nnen Details &ouml;ffentlich teilen. Was du hier siehst, ist exakt das,
            wof&uuml;r wir jeweils die Freigabe haben. Keine erfundenen KPIs &mdash; nur ehrliche Updates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <CaseCard key={c.name} caseData={c} index={i} />
          ))}
        </div>
      </div>
    </section>
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
          Willst du auch ein <span className="text-gradient font-medium">Live-Case</span> werden?
        </h2>
        <p className="text-[#A1A1AA] mb-10 max-w-lg mx-auto">
          Starte mit einem Audit. Wir schauen uns dein Setup an und zeigen dir, wo Automatisierung
          den gr&ouml;&szlig;ten Hebel hat.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <a href="/#/audit" className="btn-primary">
            Audit starten
            <ArrowRight size={16} className="ml-2" />
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle size={16} className="mr-2" />
            Direkt schreiben
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Cases() {
  return (
    <div className="bg-[#0B0C10] min-h-screen">
      <HeroSection />
      <ClientZeroSection />
      <MoreCasesSection />
      <CTASection />
    </div>
  );
}
