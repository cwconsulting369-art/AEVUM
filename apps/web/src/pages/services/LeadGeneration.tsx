import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  Target,
  Database,
  CalendarCheck,
  BarChart3,
  FileBarChart,
  ArrowRight,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowLeft,
  TrendingUp,
  Globe,
  Cpu,
  FileText,
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

/* ──────────────────────── Deliverables data ──────────────────────── */

const deliverables = [
  {
    icon: Target,
    title: 'Lead-Qualifizierung',
    desc: 'KI-gestützte Scoring-Systeme, die heiße Leads in Echtzeit identifizieren und priorisieren.',
  },
  {
    icon: Users,
    title: 'Outreach',
    desc: 'Automatisierte, personalisierte Cold-Outreach-Kampagnen über E-Mail, LinkedIn und mehr.',
  },
  {
    icon: Database,
    title: 'CRM',
    desc: 'Nahtlose CRM-Integration. Jeder Lead wird erfasst, getrackt und nie vergessen.',
  },
  {
    icon: CalendarCheck,
    title: 'Meeting-Booking',
    desc: 'Automatisierte Terminbuchung. Ihr Kalender füllt sich, während Sie schlafen.',
  },
  {
    icon: BarChart3,
    title: 'A/B-Testing',
    desc: 'Kontinuierliches Testing von Betreffzeilen, Copy und CTAs für maximale Conversion.',
  },
  {
    icon: FileBarChart,
    title: 'Reporting',
    desc: 'Transparente Dashboards mit KPIs: Open Rates, Reply Rates, Meetings, Conversions.',
  },
];

/* ──────────────────────── Hero Section ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-16">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block"
        >
          Autonomous Lead Generation
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Leads, die
          <span className="text-gradient font-medium block mt-2">konvertieren</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Ein System, das 24/7 qualifizierte Leads generiert, kontaktiert und in Ihren
          Kalender bucht — vollautomatisiert und skalierbar.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Problem Section ──────────────────────── */

function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Das Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Leads, die nie
            <span className="text-gradient"> kontaktiert werden</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed">
            Was wir in fast jedem Vertriebsteam sehen: Leads verfallen, Follow-ups werden
            vergessen, Antwortzeiten dehnen sich auf Tage. Nicht weil das Team schlecht ist —
            sondern weil kein System dahintersteht.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: 'Unkontaktiert', label: 'Leads bleiben im Posteingang' },
            { value: 'Manuell', label: 'Follow-ups vergessen' },
            { value: 'Langsam', label: 'Antwortzeit in Tagen statt Minuten' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#0B0C10] p-8 border border-white/10 text-center"
            >
              <p className="text-4xl font-light text-[#F59E0B] mb-2">{stat.value}</p>
              <p className="text-sm text-[#A1A1AA]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Kevin Case Highlight ──────────────────────── */

function KevinCase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-br from-[#15161A] to-[#0B0C10] border border-[#F59E0B]/30 p-10 lg:p-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
                Case Study: Kevin — Ketolabs
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
                €2.847 Umsatz <span className="text-gradient">pro Tag</span>
              </h2>
              <p className="text-[#A1A1AA] leading-relaxed mb-8">
                Kevin betreibt einen E-Commerce-Shop im Gesundheitssektor. Mit einem vollautomatisierten
                Lead-Generation-System generiert er täglich qualifizierte Leads — ohne manuellen Aufwand.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-[#0B0C10] border border-white/10">
                  <p className="text-2xl font-light text-[#F59E0B]">€2.847</p>
                  <p className="text-xs text-[#A1A1AA]">Umsatz/Tag</p>
                </div>
                <div className="text-center p-4 bg-[#0B0C10] border border-white/10">
                  <p className="text-2xl font-light text-[#F59E0B]">6</p>
                  <p className="text-xs text-[#A1A1AA]">AI Agents</p>
                </div>
                <div className="text-center p-4 bg-[#0B0C10] border border-white/10">
                  <p className="text-2xl font-light text-[#F59E0B]">3.45x</p>
                  <p className="text-xs text-[#A1A1AA]">ROAS</p>
                </div>
              </div>

              <a
                href="#/cases"
                className="inline-flex items-center gap-1 text-sm text-[#A1A1AA] hover:text-[#F59E0B] transition-colors"
              >
                Full Case lesen <ArrowRight size={14} />
              </a>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Lead-Generierung', value: 'Vollautomatisiert', icon: Target },
                { label: 'Qualifizierung', value: 'KI-gestütztes Scoring', icon: TrendingUp },
                { label: 'Outreach', value: 'Multi-Channel', icon: Users },
                { label: 'Terminbuchung', value: 'Automatisch', icon: CalendarCheck },
                { label: 'Reporting', value: 'Echtzeit-Dashboard', icon: FileBarChart },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-center gap-4 p-4 bg-[#0B0C10] border border-white/10"
                >
                  <item.icon size={20} className="text-[#F59E0B] shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#52525B]">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                  <CheckCircle size={16} className="text-[#F59E0B] shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Deliverables Section ──────────────────────── */

function DeliverablesSection() {
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
            Lieferumfang
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Was Sie bekommen
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((d, i) => (
            <motion.div
              key={d.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#0B0C10] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1 group"
            >
              <d.icon
                size={28}
                className="text-[#F59E0B] mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-lg font-medium mb-3">{d.title}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
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
            Transparente Preise
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
            <h3 className="text-xl font-medium mb-2">Setup</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">Einmalige Implementierung</p>
            <p className="text-3xl font-light text-[#F59E0B] mb-6">5.000 – 15.000 €</p>
            <ul className="space-y-3 mb-8">
              {[
                'System-Architektur',
                'CRM-Integration',
                'Outreach-Setup',
                'A/B-Testing Framework',
                'Dashboard & Reporting',
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
              Setup besprechen
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
              Monatlich
            </span>
            <h3 className="text-xl font-medium mb-2">Laufender Betrieb</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">Optimierung & Skalierung</p>
            <p className="text-3xl font-light text-[#F59E0B] mb-6">1.000 – 2.000 €/Mo</p>
            <ul className="space-y-3 mb-8">
              {[
                'Wöchentliche Optimierung',
                'A/B-Test Management',
                'Lead-Scoring Tuning',
                'Monthly Performance Report',
                'Dedizierter Support',
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
              System buchen
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
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Lassen Sie Ihren Kalender sich
            <span className="text-gradient block mt-2">selbst füllen</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-10">
            In 20 Minuten besprechen wir, wie Ihr Lead-Generation-System aussehen könnte.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Jetzt schreiben
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <Calendar size={18} />
              Call buchen
            </a>
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
    { title: 'AI Automation', desc: 'End-to-End Automation', path: '/services/ai-automation', icon: Cpu },
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

export default function LeadGeneration() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ProblemSection />
      <DeliverablesSection />
      <KevinCase />
      <PricingSection />
      <CTASection />
      <RelatedSection />
    </div>
  );
}
