/**
 * /waitlist — Block A1 (2026-05-25)
 *
 * Dedicated Pre-Launch-Page für AEVUM.
 * Timeline, FAQ, Form. Ehrlich, anti-Marketing, kein Hype.
 */

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Clock, Sparkles, Mail } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import { usePageSeo } from '@/hooks/use-page-seo';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const TIMELINE_KEYS = [
  { when: 'nowWhen', label: 'nowLabel', desc: 'nowDesc' },
  { when: 'soonWhen', label: 'soonLabel', desc: 'soonDesc' },
  { when: 'afterWhen', label: 'afterLabel', desc: 'afterDesc' },
] as const;

const FAQ_KEYS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
] as const;

function HeroBlock() {
  const { t } = useTranslation();
  return (
    <section className="relative px-6 lg:px-16 pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-theme-accent-soft via-transparent to-transparent pointer-events-none" aria-hidden />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-theme-accent mb-6 border border-theme-border-accent bg-theme-accent-soft px-3 py-1.5"
        >
          <Sparkles size={12} />
          {t('waitlist.hero.badge')}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] mb-6"
        >
          {t('waitlist.hero.titleLine1')}
          <span className="block text-gradient font-medium mt-2">{t('waitlist.hero.titleLine2')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          {t('waitlist.hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-bg-surface border border-theme-border p-6 md:p-8 text-left max-w-2xl mx-auto rounded-xl"
        >
          <WaitlistForm source="page-/waitlist" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-text-muted font-mono mt-6"
        >
          <span className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-theme-accent" /> {t('waitlist.hero.trustDsgvo')}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5"><Mail size={11} className="text-theme-accent" /> {t('waitlist.hero.trustUpdates')}</span>
          <span>·</span>
          <span>{t('waitlist.hero.trustUnsub')}</span>
        </motion.div>
      </div>
    </section>
  );
}

function TimelineSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-20 bg-bg-surface" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
            {t('waitlist.timeline.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            {t('waitlist.timeline.title')}
          </h2>
        </motion.div>

        <div className="space-y-5">
          {TIMELINE_KEYS.map((item, i) => (
            <motion.div
              key={item.when}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
              className="bg-bg-primary border border-theme-border p-6 md:p-7 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-5 items-start rounded-xl"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-theme-accent mb-1">
                  <Clock size={11} className="inline mr-1 -mt-0.5" /> {t(`waitlist.timeline.${item.when}`)}
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium text-text-primary mb-2">{t(`waitlist.timeline.${item.label}`)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t(`waitlist.timeline.${item.desc}`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-20" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
            {t('waitlist.faq.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            {t('waitlist.faq.title')}
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_KEYS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`q-${i}`}
              className="bg-bg-surface border border-theme-border px-5 rounded-xl"
            >
              <AccordionTrigger className="text-left text-sm font-medium py-4 hover:no-underline text-text-primary">
                {t(`waitlist.faq.${f.q}`)}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-text-secondary leading-relaxed pb-4">
                {t(`waitlist.faq.${f.a}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default function Waitlist() {
  const { t } = useTranslation();
  usePageSeo({
    title: t('waitlist.seoTitle'),
    description: t('waitlist.seoDescription'),
    path: '/waitlist',
  });

  return (
    <div className="bg-bg-primary">
      <HeroBlock />
      <TimelineSection />
      <FAQSection />
    </div>
  );
}
