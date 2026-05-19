import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe,
  Layout,
  PenTool,
  Search,
  Monitor,
  Database,
  ArrowRight,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Users,
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
    icon: Layout,
    title: '5-7 Seiten',
    desc: 'Startseite, Services, Über uns, Cases, Kontakt und mehr — alles strukturiert für Conversion.',
  },
  {
    icon: Globe,
    title: 'Custom Design',
    desc: 'Einzigartiges, markenkonformes Design. Keine Templates. Keine Kompromisse.',
  },
  {
    icon: PenTool,
    title: 'Copywriting',
    desc: 'Conversion-optimierte Texte, die verkaufen. Jede Überschrift, jeder CTA durchdacht.',
  },
  {
    icon: Search,
    title: 'SEO',
    desc: 'Technische SEO, Meta-Daten, Schema Markup — Ihre Website wird gefunden.',
  },
  {
    icon: Monitor,
    title: 'Responsive',
    desc: 'Perfekte Darstellung auf Desktop, Tablet und Mobile. Getestet auf 40+ Geräten.',
  },
  {
    icon: Database,
    title: 'CMS',
    desc: 'Einfache Inhaltsverwaltung. Sie können selbst Texte und Bilder aktualisieren.',
  },
];

/* ──────────────────────── Process steps ──────────────────────── */

const processSteps = [
  { week: 'Woche 1', title: 'Discovery', desc: 'Ziele, Zielgruppe, Wettbewerbsanalyse' },
  { week: 'Woche 2-3', title: 'Design', desc: 'Wireframes, UI/UX, Review-Runden' },
  { week: 'Woche 4-6', title: 'Entwicklung', desc: 'Coding, CMS, SEO-Setup' },
  { week: 'Woche 7-8', title: 'Launch', desc: 'Testing, Go-Live, Schulung' },
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
          Intelligent Web Systems
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Websites, die
          <span className="text-gradient font-medium block mt-2">verkaufen</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Ihre Website ist Ihr wichtigster Vertriebsmitarbeiter — er arbeitet 24/7.
          Wir machen ihn zum Überflieger.
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
            85% der B2B-Websites verlieren Leads
            <span className="text-gradient"> in 5 Sekunden</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed">
            Langsame Ladezeiten, verwirrende Navigation und schwache Call-to-Actions treiben
            Besucher direkt zur Konkurrenz. Eine Website ist kein digitales Prospekt —
            sie muss verkaufen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: '3 Sek.', label: 'bis der Besucher geht' },
            { value: '53%', label: 'abbrechen auf Mobile' },
            { value: '0%', label: 'folgen schwachem CTA' },
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

/* ──────────────────────── Deliverables Section ──────────────────────── */

function DeliverablesSection() {
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
              className="bg-[#15161A] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1 group"
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

/* ──────────────────────── Process Section ──────────────────────── */

function ProcessSection() {
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
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Der Prozess
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, i) => (
            <motion.div
              key={step.week}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative bg-[#0B0C10] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all"
            >
              <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-wider block mb-3">
                {step.week}
              </span>
              <h3 className="text-lg font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-[#A1A1AA]">{step.desc}</p>
              {i < processSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#F59E0B]">
                  <ArrowRight size={20} />
                </div>
              )}
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
          {[
            {
              name: 'Starter Website',
              price: '5.000 – 8.000 €',
              features: [
                'Bis zu 5 Seiten',
                'Custom Design',
                'Responsive',
                'CMS-Integration',
                'Basis SEO',
              ],
            },
            {
              name: 'Business Website',
              price: '8.000 – 15.000 €',
              featured: true,
              features: [
                'Bis zu 7+ Seiten',
                'Premium Design',
                'Conversion-Optimierung',
                'Full SEO Setup',
                'Analytics & Tracking',
                '3 Monate Support',
              ],
            },
          ].map((pkg, i) => (
            <motion.div
              key={pkg.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`relative p-8 lg:p-10 border ${
                pkg.featured
                  ? 'bg-[#15161A] border-[#F59E0B]/40 scale-[1.02]'
                  : 'bg-[#15161A] border-white/10'
              } transition-all hover:-translate-y-1`}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-black text-[0.65rem] font-mono uppercase tracking-wider px-4 py-1">
                  Empfohlen
                </span>
              )}
              <h3 className="text-xl font-medium mb-4">{pkg.name}</h3>
              <p className="text-3xl font-light text-[#F59E0B] mb-6">{pkg.price}</p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((f) => (
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
                className={`w-full text-center block ${
                  pkg.featured ? 'btn-primary' : 'btn-secondary'
                } py-3 text-sm`}
              >
                Projekt starten
              </a>
            </motion.div>
          ))}
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
            Bereit für Ihre neue
            <span className="text-gradient block mt-2">Website?</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-10">
            Lassen Sie uns in 20 Minuten besprechen, wie Ihre Website zu Ihrem
            besten Vertriebsmitarbeiter wird.
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
    { title: 'Lead Generation', desc: 'Leads, die konvertieren', path: '/services/lead-generation', icon: Users },
    { title: 'AI Automation', desc: 'End-to-End Automation', path: '/services/ai-automation', icon: Cpu },
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

export default function Websites() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ProblemSection />
      <DeliverablesSection />
      <ProcessSection />
      <PricingSection />
      <CTASection />
      <RelatedSection />
    </div>
  );
}
