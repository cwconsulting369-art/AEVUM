import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe,
  Users,
  FileText,
  Cpu,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Calendar,
  CheckCircle,
  Zap,
  Command,
  Layout,
  Database,
  ShoppingCart,
  Target,
  UserCircle,
  BarChart3,
  Globe2,
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

/* ──────────────────────── Services data ──────────────────────── */

const services = [
  {
    num: '01',
    title: 'Websites',
    desc: 'High-Performance Websites, die Besucher in Kunden verwandeln. Conversion-fokussiert, blitzschnell und SEO-optimiert.',
    icon: Globe,
    price: '5.000 – 15.000 €',
    path: '/services/websites',
    deliverables: ['5-7 Seiten', 'Custom Design', 'SEO-Optimierung'],
  },
  {
    num: '02',
    title: 'Lead Generation',
    desc: 'Autonome Outbound-Systeme, die qualifizierte Leads 24/7 generieren. Skalierbar ohne zusätzlichen Headcount.',
    icon: Users,
    price: '5.000 – 15.000 €',
    path: '/services/lead-generation',
    deliverables: ['Lead-Qualifizierung', 'CRM-Integration', 'Meeting-Booking'],
  },
  {
    num: '03',
    title: 'Content Workflows',
    desc: 'Ein Input, endlose Outputs. Vollautomatisierte Content-Pipelines, die Stunden pro Woche sparen.',
    icon: FileText,
    price: 'ab 3.000 €',
    path: '/services/content-workflows',
    deliverables: ['Video → Transkript', 'Multi-Channel Drafts', 'Auto-Publishing'],
  },
  {
    num: '04',
    title: 'AI Automation',
    desc: 'End-to-End KI-Systeme, die lernen, sich anpassen und täglich verbessern. Unser Flagship-Angebot.',
    icon: Cpu,
    price: '10.000 – 50.000 €',
    path: '/services/ai-automation',
    deliverables: ['Sales Support', 'Onboarding', 'Support & Recruiting'],
  },
];

/* ──────────────────────── Process steps ──────────────────────── */

const processSteps = [
  { num: '01', title: 'Strategie', desc: 'Analyse & Roadmap' },
  { num: '02', title: 'Design', desc: 'UX/UI Konzept' },
  { num: '03', title: 'Entwicklung', desc: 'Implementierung' },
  { num: '04', title: 'Optimierung', desc: 'Testen & Refine' },
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
          Unsangebot
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Unsere
          <span className="text-gradient font-medium"> Services</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Vier leistungsstarke Services — ein integriertes System. Jeder Service ist ein Baustein
          Ihres vollautomatisierten Wachstumsmotors.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Service Cards ──────────────────────── */

function ServiceCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 pb-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <a
                href={`#${svc.path}`}
                className="block bg-[#15161A] p-8 lg:p-10 border border-white/10 hover:border-[#F59E0B]/40 transition-all duration-300 hover:-translate-y-1 group h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="font-mono text-sm text-[#52525B]">{svc.num}</span>
                  <svc.icon
                    size={28}
                    className="text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors"
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-medium mb-3">{svc.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6">{svc.desc}</p>

                <div className="space-y-2 mb-6">
                  {svc.deliverables.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-sm text-[#F8FAFC]">
                      <CheckCircle size={14} className="text-[#F59E0B] shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="font-mono text-xs text-[#F59E0B]">{svc.price}</span>
                  <span className="flex items-center gap-1 text-sm text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors">
                    Details <ArrowRight size={14} />
                  </span>
                </div>
              </a>
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
            Unser Prozess
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            So arbeiten wir
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative text-center p-8 bg-[#0B0C10] border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1"
            >
              <span className="font-mono text-4xl font-light text-[#F59E0B]/30 block mb-4">
                {step.num}
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

/* ──────────────────────── Legacy Services ──────────────────────── */

const legacyServices = [
  { title: 'AI Automation', desc: 'KI-Agenten & Workflows', icon: Zap, path: '/legacy/ai-automation', color: '#F59E0B' },
  { title: 'Automation Audit', desc: 'Prozess-Analyse & Optimierung', icon: Target, path: '/legacy/automation-audit', color: '#10B981' },
  { title: 'Business OS', desc: 'Komplettes Geschäftssystem', icon: BarChart3, path: '/legacy/business-os', color: '#3B82F6' },
  { title: 'Command Center', desc: 'Zentrales Dashboard', icon: Command, path: '/legacy/command-center', color: '#8B5CF6' },
  { title: 'Content Engine', desc: 'KI-Content Produktion', icon: FileText, path: '/legacy/content-engine', color: '#EC4899' },
  { title: 'Content Workflows', desc: 'Automatisierte Pipelines', icon: Layout, path: '/legacy/content-workflows', color: '#06B6D4' },
  { title: 'Database System', desc: 'PostgreSQL + n8n', icon: Database, path: '/legacy/database-system', color: '#14B8A6' },
  { title: 'E-Commerce OS', desc: 'Online-Shop System', icon: ShoppingCart, path: '/legacy/ecommerce-os', color: '#F97316' },
  { title: 'Lead Engine', desc: 'Lead-Generierung System', icon: Users, path: '/legacy/lead-engine', color: '#EF4444' },
  { title: 'Personal Agent', desc: 'KI-Persönlichkeits-Agent', icon: UserCircle, path: '/legacy/personal-agent', color: '#6366F1' },
  { title: 'Sales OS', desc: 'Verkaufsmaschine', icon: Globe, path: '/legacy/sales-os', color: '#84CC16' },
  { title: 'Website + CRM', desc: 'Webseite mit CRM', icon: Globe2, path: '/legacy/website-crm', color: '#06B6D4' },
];

function LegacyServicesSection() {
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
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#52525B] mb-4 block">
            Archiv
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Weitere <span className="text-gradient font-medium">Services</span>
          </h2>
          <p className="text-[#A1A1AA] text-base mt-4 max-w-2xl mx-auto">
            Unsere komplette Service-Bibliothek — jedes Einzelsystem kann als eigenständige Lösung gebucht werden.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {legacyServices.map((svc, i) => (
            <motion.a
              key={svc.path}
              href={`#${svc.path}`}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="group block bg-[#0B0C10] border border-white/10 hover:border-white/20 p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: svc.color + '20' }}
                >
                  <svc.icon size={20} style={{ color: svc.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium group-hover:text-[#F59E0B] transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-[#52525B]">{svc.desc}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#52525B]">
            Jedes System ist modular buchbar und lässt sich mit anderen kombinieren.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── CTA Banner ──────────────────────── */

function CTABanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#15161A] to-[#0B0C10] border border-[#F59E0B]/30 p-10 lg:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 to-transparent" />
          <div className="relative z-10">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
              Nächster Schritt
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">
              Bereit für den
              <span className="text-gradient font-medium"> nächsten Schritt?</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto mb-10">
              Buchen Sie einen kostenlosen Strategy Call oder schreiben Sie uns direkt auf WhatsApp.
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Services Page ──────────────────────── */

export default function Services() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ServiceCards />
      <ProcessSection />
      <LegacyServicesSection />
      <CTABanner />
    </div>
  );
}
