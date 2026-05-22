import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  Shield,
  Sliders,
  Infinity,
  Layers,
  MapPin,
  User,
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
    <section className="relative min-h-[40vh] flex items-center justify-center px-6 pt-16">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block"
        >
          &Uuml;ber uns
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          AEVUM <span className="text-gradient font-medium">Systems</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Individuelle KI-Betriebssysteme f&uuml;r Unternehmen &mdash; gebaut in Deutschland.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Founder ──────────────────────── */

function FounderSection() {
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
            Founder
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Wer dahinter <span className="text-gradient font-medium">steht</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#15161A] border border-white/10 p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="flex flex-col items-center md:items-start flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#F59E0B]/10 border-2 border-[#F59E0B]/30 flex items-center justify-center mb-4">
                <User size={40} className="text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-medium text-[#F9FAFB]">{CONTACT.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-[#A1A1AA] mt-1">
                <MapPin size={14} className="text-[#52525B]" />
                Augsburg, Deutschland
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[#A1A1AA] leading-relaxed mb-8 text-base md:text-lg">
                Ich baue Systeme, keine PowerPoints. AEVUM ist das Ergebnis von 3+ Jahren Hands-on
                Arbeit mit KI-Automatisierung f&uuml;r echte Unternehmen. Kein Hype &mdash; nur
                funktionierende Systeme.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle size={16} className="mr-2" />
                  WhatsApp
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Werte ──────────────────────── */

interface ValueData {
  icon: React.ElementType;
  title: string;
  description: string;
}

const values: ValueData[] = [
  {
    icon: Shield,
    title: 'Deutsch &amp; DSGVO',
    description:
      'Wir bauen in Deutschland. Alle Systeme sind DSGVO-konform. Deine Daten bleiben deine Daten.',
  },
  {
    icon: Sliders,
    title: 'Ma&szlig;geschneidert',
    description:
      'Kein Template-Druck. Jedes System wird individuell auf dein Business, deine Daten und deine Ziele angepasst.',
  },
  {
    icon: Infinity,
    title: 'Langfristig',
    description:
      'Wir sind Partner, nicht Lieferant. Der Retainer sichert laufende Optimierung &mdash; nicht nur einen einmaligen Build.',
  },
  {
    icon: Layers,
    title: 'System statt Tools',
    description:
      'Ein zusammenh&auml;ngendes Betriebssystem statt einer Sammlung isolierter Tools.',
  },
];

function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
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
      className="bg-[#15161A] border border-white/10 p-6 md:p-8 hover:border-[#F59E0B]/30 transition-all text-center"
    >
      <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-5">
        <value.icon size={24} className="text-[#F59E0B]" />
      </div>
      <h3
        className="text-base font-medium text-[#F9FAFB] mb-3"
        dangerouslySetInnerHTML={{ __html: value.title }}
      />
      <p
        className="text-sm text-[#A1A1AA] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: value.description }}
      />
    </motion.div>
  );
}

/* ──────────────────────── Section 4: Tech Stack ──────────────────────── */

const techStack = [
  'Postgres',
  'Supabase',
  'n8n',
  'Vercel',
  'Cloudflare',
  'React',
  'TypeScript',
  'TailwindCSS',
];

function TechStackSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Technologie
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Unser <span className="text-gradient font-medium">Tech Stack</span>
          </h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto">
            Moderne, bew&auml;hrte Technologien &mdash; keine Experimente am Kunden.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
        >
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-5 py-2.5 bg-[#15161A] border border-white/10 text-sm text-[#A1A1AA] hover:border-[#F59E0B]/30 hover:text-[#F59E0B] transition-all cursor-default"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 5: CTA ──────────────────────── */

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
          Lass uns <span className="text-gradient font-medium">sprechen</span>.
        </h2>
        <p className="text-[#A1A1AA] mb-10 max-w-lg mx-auto">
          Ob per WhatsApp oder im Video-Call &mdash; ich freue mich darauf, mehr &uuml;ber dein
          Business zu erfahren.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <MessageCircle size={16} className="mr-2" />
            WhatsApp
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

export default function About() {
  return (
    <div className="bg-[#0B0C10] min-h-screen">
      <HeroSection />
      <FounderSection />
      <ValuesSection />
      <TechStackSection />
      <CTASection />
    </div>
  );
}
