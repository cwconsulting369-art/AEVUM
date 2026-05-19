import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Cpu,
  MessageSquare,
  UserPlus,
  Headset,
  UserCheck,
  ArrowRight,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Globe,
  Users,
  FileText,
  Zap,
  TrendingUp,
  Shield,
} from 'lucide-react';
import CONTACT from '../../config/contact';

/* ──────────────────────── Animation helpers ──────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──────────────────────── Use case data ──────────────────────── */

const useCases = [
  {
    icon: MessageSquare,
    title: 'Sales Support',
    desc: 'KI-Assistenz für Ihr Vertriebsteam. Lead-Scoring, Follow-ups, Angebotsvorschläge und Pipeline-Management — vollautomatisiert.',
    features: ['Lead-Scoring', 'Auto-Follow-up', 'Angebots-Generierung'],
  },
  {
    icon: UserPlus,
    title: 'Onboarding',
    desc: 'Automatisierte Kunden-Onboarding-Pipelines. Willkommens-E-Mails, Schulungssequenzen, Check-ins — ohne manuellen Aufwand.',
    features: ['Willkommens-Flows', 'Schulungs-Trigger', 'Progress-Tracking'],
  },
  {
    icon: Headset,
    title: 'Support',
    desc: 'Intelligente Support-Systeme, die 80% der Anfragen sofort lösen. Eskalation nur bei komplexen Fällen.',
    features: ['24/7 Antwort', 'Smart Escalation', 'Wissensdatenbank'],
  },
  {
    icon: UserCheck,
    title: 'Recruiting',
    desc: 'Automatisierte Bewerber-Pipelines. Screening, Interview-Scheduling, Follow-ups — finden Sie die besten Talente schneller.',
    features: ['Bewerber-Screening', 'Auto-Scheduling', 'Talent-Scoring'],
  },
];

/* ──────────────────────── Process timeline ──────────────────────── */

const timelineSteps = [
  { week: 'Woche 1-2', title: 'Discovery & Audit', desc: 'Prozessanalyse, Tool-Assessment, Use-Case-Priorisierung' },
  { week: 'Woche 3-4', title: 'Architektur', desc: 'System-Design, Datenfluss, Integrations-Planung' },
  { week: 'Woche 5-6', title: 'Build Phase 1', desc: 'Core Use Cases implementieren, erste Integrationen' },
  { week: 'Woche 7-8', title: 'Build Phase 2', desc: 'Erweiterte Features, Testing, Feinschliff' },
  { week: 'Woche 9+', title: 'Deploy & Optimize', desc: 'Go-Live, Monitoring, kontinuierliche Optimierung' },
];

/* ──────────────────────── Hero Section ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-32 pb-16">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/15 via-transparent to-[#F59E0B]/5" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] font-mono text-xs uppercase tracking-[0.15em] px-4 py-2">
            Flagship Service
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mb-6"
        >
          End-to-End
          <span className="text-gradient font-medium block mt-2">Automation</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Das komplette KI-System für Ihr Unternehmen. Nicht nur ein Tool —
          ein ganzes Ökosystem, das lernt, sich anpasst und täglich besser wird.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Beratung anfragen
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar size={18} />
            Strategy Call buchen
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Problem Section ──────────────────────── */

function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const problems = [
    {
      icon: Zap,
      title: 'Fragmentierte Tools',
      desc: '5+ Tools, die nicht miteinander sprechen. Dateninseln, manuelle Imports, Doppelarbeit.',
    },
    {
      icon: TrendingUp,
      title: 'Keine Skalierung',
      desc: 'Jeder neue Prozess braucht mehr Personal. Wachstum bedeutet mehr Komplexität, nicht mehr Effizienz.',
    },
    {
      icon: Shield,
      title: 'Manuelle Handoffs',
      desc: 'Jeder Prozessschritt hängt von menschlicher Intervention ab. Fehler, Verzögerungen, Burnout.',
    },
  ];

  return (
    <section className="px-6 lg:px-16 py-24 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Das Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Fragmentierte Tools.
            <span className="text-gradient block mt-2">Manuelle Handoffs.</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed">
            Ihre Prozesse sind eine Kette isolierter Insellösungen. Jeder Handoff ist
            ein Verlust, jede manuelle Zwischenschritt eine Fehlerquelle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#0B0C10] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1"
            >
              <p.icon size={28} className="text-[#F59E0B] mb-4" />
              <h3 className="text-lg font-medium mb-3">{p.title}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Use Cases Section ──────────────────────── */

function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Use Cases
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Vier Module. Ein System.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#15161A] p-8 lg:p-10 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-[#0B0C10] border border-[#F59E0B]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <uc.icon size={24} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{uc.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{uc.desc}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {uc.features.map((f) => (
                  <span
                    key={f}
                    className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-3 py-1"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Process Timeline ──────────────────────── */

function TimelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Timeline
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            8+ Wochen bis zum
            <span className="text-gradient"> lebenden System</span>
          </h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto">
            Ein methodischer Ansatz, der Qualität garantiert. Keine halben Sachen.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#F59E0B]/20 hidden md:block" />

          <div className="space-y-8">
            {timelineSteps.map((step, i) => (
              <motion.div
                key={step.week}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={`relative flex flex-col md:flex-row gap-6 items-start md:items-center ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-[#0B0C10] p-6 border border-white/10 hover:border-[#F59E0B]/20 transition-all inline-block w-full md:w-auto">
                    <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-wider block mb-2">
                      {step.week}
                    </span>
                    <h3 className="text-lg font-medium mb-1">{step.title}</h3>
                    <p className="text-sm text-[#A1A1AA]">{step.desc}</p>
                  </div>
                </div>

                <div className="w-12 h-12 bg-[#F59E0B] flex items-center justify-center shrink-0 z-10 hidden md:flex">
                  <span className="text-black font-bold text-sm">{i + 1}</span>
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Pricing Section ──────────────────────── */

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Investment
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Zwei Phasen. Ein System.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="bg-[#15161A] p-8 lg:p-10 border border-white/10 hover:-translate-y-1 transition-all"
          >
            <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider block mb-2">
              Phase 1
            </span>
            <h3 className="text-xl font-medium mb-2">Build</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">Einmalige Entwicklung</p>
            <p className="text-3xl font-light text-[#F59E0B] mb-6">10.000 – 50.000 €</p>
            <ul className="space-y-3 mb-8">
              {[
                'Komplette Systemarchitektur',
                '1-4 Use Cases',
                'Tool-Integrationen',
                'KI-Modell Training',
                'Testing & QA',
                'Deployment & Schulung',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                  <CheckCircle size={14} className="text-[#F59E0B] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-center block py-3 text-sm"
            >
              Build besprechen
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="relative bg-[#15161A] p-8 lg:p-10 border border-[#F59E0B]/40 scale-[1.02] hover:-translate-y-1 transition-all"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-black text-[0.65rem] font-mono uppercase tracking-wider px-4 py-1">
              Laufend
            </span>
            <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider block mb-2">
              Phase 2
            </span>
            <h3 className="text-xl font-medium mb-2">Run</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">Monatliche Optimierung</p>
            <p className="text-3xl font-light text-[#F59E0B] mb-6">1.500 – 5.000 €/Mo</p>
            <ul className="space-y-3 mb-8">
              {[
                'System-Monitoring 24/7',
                'Monatliche Optimierung',
                'Neue Use Cases on-demand',
                'Performance Reporting',
                'Dedizierter Support',
                'Prioritäts-Entwicklung',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                  <CheckCircle size={14} className="text-[#F59E0B] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block py-3 text-sm"
            >
              System starten
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── CTA Section ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0B0C10] to-[#15161A] border border-[#F59E0B]/30 p-10 lg:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
              Bereit für Ihr
              <span className="text-gradient block mt-2">KI-System?</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg mb-10">
              In 30 Minuten analysieren wir Ihre Prozesse und zeigen Ihnen den exakten Fahrplan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Jetzt beraten lassen
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <Calendar size={18} />
                Strategy Call buchen
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Related Services ──────────────────────── */

function RelatedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const related = [
    { title: 'Lead Generation', desc: 'Leads, die konvertieren', path: '/services/lead-generation', icon: Users },
    { title: 'Websites', desc: 'Websites, die verkaufen', path: '/services/websites', icon: Globe },
    { title: 'Content Workflows', desc: 'Content, der sich vervielfältigt', path: '/services/content-workflows', icon: FileText },
  ];

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            Weitere Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((svc, i) => (
            <motion.a
              key={svc.title}
              href={`#${svc.path}`}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="block bg-[#15161A] p-6 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1 group"
            >
              <svc.icon size={24} className="text-[#F59E0B] mb-4" />
              <h3 className="text-lg font-medium mb-1">{svc.title}</h3>
              <p className="text-sm text-[#A1A1AA]">{svc.desc}</p>
              <span className="flex items-center gap-1 text-sm text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors mt-4">
                Mehr erfahren <ArrowRight size={14} />
              </span>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="#/services"
            className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#F59E0B] transition-colors"
          >
            <ArrowLeft size={16} />
            Zurück zur Services-Übersicht
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function AIAutomation() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ProblemSection />
      <UseCasesSection />
      <TimelineSection />
      <PricingSection />
      <CTASection />
      <RelatedSection />
    </div>
  );
}
