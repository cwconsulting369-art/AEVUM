import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          dangerouslySetInnerHTML={{ __html: t('about.hero.eyebrow') }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          <span dangerouslySetInnerHTML={{ __html: t('about.hero.title') + ' ' }} />
          <span className="text-gradient font-medium">{t('about.hero.titleAccent')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          dangerouslySetInnerHTML={{ __html: t('about.hero.subtitle') }}
        />
      </div>
    </section>
  );
}

/* ──────────────────────── Section B: Vorstellungsvideo ──────────────────────── */

function VideoSection() {
  const { t } = useTranslation();
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
            {t('about.video.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            {t('about.video.heading')} <span className="text-gradient font-medium" dangerouslySetInnerHTML={{ __html: t('about.video.headingAccent') }} />
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
              title={t('about.video.iframeTitle')}
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
                {t('about.video.placeholderTitle')}
              </p>
              <p
                className="text-sm text-text-secondary max-w-md"
                dangerouslySetInnerHTML={{ __html: t('about.video.placeholderText') }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section C: Background-Story ──────────────────────── */

function StorySection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const paragraphs = t('about.story.paragraphs', { returnObjects: true }) as string[];

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
            {t('about.story.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            {t('about.story.heading')} <span className="text-gradient font-medium">{t('about.story.headingAccent')}</span>
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

const METHOD_PILLAR_META = [
  { icon: BarChart3, number: '01' },
  { icon: Settings2, number: '02' },
  { icon: TrendingUp, number: '03' },
];

function MethodSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const pillarTexts = t('about.method.pillars', { returnObjects: true }) as {
    title: string; description: string[]; example: string; useFor: string;
  }[];
  const pillars: PillarData[] = pillarTexts.map((p, i) => ({
    ...p,
    icon: METHOD_PILLAR_META[i].icon,
    number: METHOD_PILLAR_META[i].number,
  }));
  const exampleLabel = t('about.method.exampleLabel');
  const availableLabel = t('about.method.availableLabel');

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
            {t('about.method.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            {t('about.method.heading')} <span className="text-gradient font-medium">{t('about.method.headingAccent')}</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            {t('about.method.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i} exampleLabel={exampleLabel} availableLabel={availableLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ pillar, index, exampleLabel, availableLabel }: { pillar: PillarData; index: number; exampleLabel: string; availableLabel: string }) {
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
            {exampleLabel}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed italic">
            "{pillar.example}"
          </p>
        </div>
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-1.5"
            dangerouslySetInnerHTML={{ __html: availableLabel }}
          />
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
  const { t } = useTranslation();
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
            {t('about.team.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            {t('about.team.heading')} <span className="text-gradient font-medium">{t('about.team.headingAccent')}</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            {t('about.team.subtitle')}
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
                <p
                  className="text-sm text-theme-accent mb-2 font-mono uppercase tracking-[0.08em]"
                  dangerouslySetInnerHTML={{ __html: t('about.team.carlos.role') }}
                />
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={12} className="text-text-muted" />
                  {t('about.team.carlos.location')}
                </div>
              </div>
            </div>

            <p
              className="text-sm text-text-secondary leading-relaxed mb-5"
              dangerouslySetInnerHTML={{ __html: t('about.team.carlos.bio') }}
            />

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
                {t('about.team.carlos.whatsapp')}
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-medium text-theme-accent border border-theme-border-accent px-4 py-2.5 hover:bg-theme-accent-soft transition-all"
              >
                <Calendar size={14} />
                {t('about.team.carlos.bookCall')}
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
                <p
                  className="text-sm text-theme-accent mb-2 font-mono uppercase tracking-[0.08em]"
                  dangerouslySetInnerHTML={{ __html: t('about.team.lennox.role') }}
                />
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Database size={12} className="text-text-muted" />
                  <span dangerouslySetInnerHTML={{ __html: t('about.team.lennox.location') }} />
                </div>
              </div>
            </div>

            <p
              className="text-sm text-text-secondary leading-relaxed mb-5"
              dangerouslySetInnerHTML={{ __html: t('about.team.lennox.bio') }}
            />

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
                  <strong className="text-theme-accent">{t('about.team.lennox.transparencyLabel')}</strong>{' '}
                  <span dangerouslySetInnerHTML={{ __html: t('about.team.lennox.transparencyText') }} />
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

const CLIENT_SLUGS = ['ketolabs', 'utilityhub', 'thailand-re', 'gts'];

function ClientsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const clientTexts = t('about.clients.items', { returnObjects: true }) as {
    name: string; segment: string; desc: string;
  }[];
  const clients: ClientData[] = clientTexts.map((c, i) => ({ ...c, slug: CLIENT_SLUGS[i] }));

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
            {t('about.clients.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            {t('about.clients.heading')}<span className="text-gradient font-medium">{t('about.clients.headingAccent')}</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            {t('about.clients.subtitle')}
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
            {t('about.clients.allCases')}
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

const VALUE_ICONS = [CheckCircle2, Database, Heart, Sparkles];

function ValuesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const valueTexts = t('about.values.items', { returnObjects: true }) as {
    title: string; description: string;
  }[];
  const values: ValueData[] = valueTexts.map((v, i) => ({ ...v, icon: VALUE_ICONS[i] }));

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
            {t('about.values.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            {t('about.values.heading')} <span className="text-gradient font-medium">{t('about.values.headingAccent')}</span>
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
  const { t } = useTranslation();
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
            {t('about.techStack.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            {t('about.techStack.heading')} <span className="text-gradient font-medium">{t('about.techStack.headingAccent')}</span>
          </h2>
          <p
            className="text-text-secondary max-w-xl mx-auto"
            dangerouslySetInnerHTML={{ __html: t('about.techStack.subtitle') }}
          />
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
  const { t } = useTranslation();
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
          eyebrow={t('about.cta.eyebrow')}
          headline={t('about.cta.headline')}
          subline={t('about.cta.subline')}
        />
        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted mb-4">
            {t('about.cta.directQuestion')}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-theme-accent border border-theme-border hover:border-theme-border-accent px-5 py-2.5 transition-all"
            >
              <MessageCircle size={14} />
              {t('about.cta.whatsapp')}
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-theme-accent border border-theme-border hover:border-theme-border-accent px-5 py-2.5 transition-all"
            >
              <Calendar size={14} />
              {t('about.cta.bookCall')}
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
  const { t } = useTranslation();
  usePageSeo({
    title: t('about.seo.title'),
    description: t('about.seo.description'),
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
