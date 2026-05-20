import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileText,
  Video,
  Headphones,
  Edit3,
  CheckCircle,
  Upload,
  ArrowRight,
  MessageCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ArrowLeft,
  Globe,
  Users,
  Cpu,
  Clock,
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

/* ──────────────────────── Pipeline steps ──────────────────────── */

const pipelineSteps = [
  {
    icon: Video,
    step: 'Schritt 1',
    title: 'Video aufnehmen',
    desc: 'Sie nehmen ein 10-Minuten-Video auf — das ist Ihr einziger Input. Keine Skripte, kein Stress.',
    output: 'Rohvideo',
  },
  {
    icon: Headphones,
    step: 'Schritt 2',
    title: 'Transkribieren',
    desc: 'KI transcribiert das Video in Echtzeit mit 99% Genauigkeit. Dialekte und Fachbegriffe inklusive.',
    output: 'Transkript',
  },
  {
    icon: Edit3,
    step: 'Schritt 3',
    title: 'Drafts generieren',
    desc: 'Aus einem Video entstehen automatisch Blog-Posts, LinkedIn-Posts, Newsletter und Shorts-Scripts.',
    output: 'Multi-Channel Drafts',
  },
  {
    icon: CheckCircle,
    step: 'Schritt 4',
    title: 'Freigabe',
    desc: 'Sie prüfen und genehmigen die Drafts mit einem Klick. Oder Sie automatisieren auch das.',
    output: 'Freigegebener Content',
  },
  {
    icon: Upload,
    step: 'Schritt 5',
    title: 'Publish',
    desc: 'Automatisches Publishing auf allen Kanälen — zum optimalen Zeitpunkt, mit optimalen Hashtags.',
    output: 'Live Content',
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
          Content Workflows
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Content, der sich
          <span className="text-gradient font-medium block mt-2">selbst vervielfältigt</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Ein Video. Fünf Outputs. Null manueller Aufwand. Ihr Content-System,
          das rund um die Uhr arbeitet.
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
            Content frisst Zeit, die im
            <span className="text-gradient"> Geschäft fehlt</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed">
            Schreiben, Editieren, Formatieren, Posten — Content-Creation kostet die Stunden,
            die du eigentlich in Vertrieb und Kunden investieren willst. Und trotzdem reicht
            es selten für echte Konstanz.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: 'Stunden', label: 'pro Woche manuell statt automatisiert' },
            { value: 'Verteilt', label: 'Posts in jeder Plattform anders' },
            { value: 'Pause', label: 'nach 4-6 Wochen Konstanz weg' },
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

/* ──────────────────────── Pipeline Section ──────────────────────── */

function PipelineSection() {
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
            Die Pipeline
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            1 Video. 5 Schritte. Endlose Outputs.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {pipelineSteps.map((step, i) => (
            <motion.div
              key={step.step}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start bg-[#15161A] p-8 border border-white/10 hover:border-[#F59E0B]/20 transition-all">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-14 h-14 bg-[#0B0C10] border border-[#F59E0B]/30 flex items-center justify-center">
                    <step.icon size={24} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider block">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                  </div>
                </div>

                <div className="flex-1 lg:pl-6 lg:border-l lg:border-white/10">
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{step.desc}</p>
                </div>

                <div className="shrink-0 bg-[#0B0C10] px-4 py-2 border border-[#F59E0B]/20">
                  <span className="font-mono text-xs text-[#F59E0B]">{step.output}</span>
                </div>
              </div>

              {i < pipelineSteps.length - 1 && (
                <div className="flex justify-center py-3">
                  <ArrowRight size={20} className="text-[#F59E0B]/40 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Tim Case Highlight ──────────────────────── */

function TimCase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const outputs = [
    'LinkedIn-Posts',
    'Blog-Artikel',
    'Newsletter',
    'Shorts-Scripts',
    'Twitter/X Threads',
  ];

  return (
    <section className="px-6 lg:px-16 py-24 bg-[#15161A]" ref={ref}>
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
                Case Study: Tim — Personal Brand
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
                <span className="text-gradient">15 Stunden</span> pro Woche gespart
              </h2>
              <p className="text-[#A1A1AA] leading-relaxed mb-8">
                Tim baut seine Personal Brand auf. Jede Woche nimmt er ein 10-Minuten-Video auf —
                der Rest passiert automatisch. Blog, LinkedIn, Newsletter, alles aus einer Quelle.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {outputs.map((out) => (
                  <div
                    key={out}
                    className="flex items-center gap-2 p-3 bg-[#0B0C10] border border-white/10"
                  >
                    <CheckCircle2 size={14} className="text-[#F59E0B] shrink-0" />
                    <span className="text-sm">{out}</span>
                  </div>
                ))}
              </div>

              <a
                href="#/cases"
                className="inline-flex items-center gap-1 text-sm text-[#A1A1AA] hover:text-[#F59E0B] transition-colors"
              >
                Full Case lesen <ArrowRight size={14} />
              </a>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-[#0B0C10] border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={20} className="text-[#F59E0B]" />
                  <span className="font-mono text-xs text-[#52525B] uppercase">Vorher</span>
                </div>
                <p className="text-2xl font-light text-[#F59E0B] mb-2">15+ Stunden/Woche</p>
                <p className="text-sm text-[#A1A1AA]">
                  Manuelles Schreiben, Formatieren, Posten auf jedem Kanal einzeln.
                </p>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={20} className="text-[#F59E0B] rotate-90" />
              </div>

              <div className="p-6 bg-[#0B0C10] border border-[#F59E0B]/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={20} className="text-[#F59E0B]" />
                  <span className="font-mono text-xs text-[#52525B] uppercase">Nachher</span>
                </div>
                <p className="text-2xl font-light text-[#F59E0B] mb-2">10 Minuten/Woche</p>
                <p className="text-sm text-[#A1A1AA]">
                  Ein Video aufnehmen. Der Rest läuft vollautomatisch.
                </p>
              </div>

              <div className="text-center p-4">
                <p className="text-lg">
                  Ergebnis: <span className="text-gradient font-medium">90x Zeitersparnis</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
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

        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#15161A] p-8 lg:p-10 border border-[#F59E0B]/40 text-center">
            <h3 className="text-xl font-medium mb-2">Content Workflow System</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">
              Komplette Pipeline-Implementierung
            </p>
            <p className="text-4xl font-light text-[#F59E0B] mb-6">ab 3.000 €</p>
            <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
              {[
                'Video → Transkript Pipeline',
                'Multi-Channel Content-Generierung',
                'Auto-Scheduling & Publishing',
                'Template-Bibliothek',
                'Freigabe-Workflow',
                'Einmaliger Setup + Schulung',
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
              className="btn-primary inline-flex items-center gap-2 px-8"
            >
              <CalendarIcon size={18} />
              Call buchen
            </a>
          </div>
        </motion.div>
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
            Mehr Content. Weniger
            <span className="text-gradient block mt-2">Arbeit.</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-10">
            In 20 Minuten zeigen wir Ihnen, wie Ihre Content-Pipeline aussehen könnte.
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
              <CalendarIcon size={18} />
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
    { title: 'Lead Generation', desc: 'Leads, die konvertieren', path: '/services/lead-generation', icon: Users },
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

export default function ContentWorkflows() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ProblemSection />
      <PipelineSection />
      <TimCase />
      <PricingSection />
      <CTASection />
      <RelatedSection />
    </div>
  );
}
