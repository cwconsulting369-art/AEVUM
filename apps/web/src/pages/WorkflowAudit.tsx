import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  ArrowRight,
  CheckCircle,
  Upload,
  TrendingUp,
  Clock,
  FileText,
  Sparkles,
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  Users,
  Wrench,
  Wallet,
  CalendarClock,
  Mail,
  Phone,
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

/* ──────────────────────── Hero Section ──────────────────────── */

function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-28 sm:pt-32 pb-16 px-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-theme-accent-soft via-transparent to-transparent" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block bg-theme-accent-soft border border-theme-border-accent text-theme-accent font-mono text-xs uppercase tracking-[0.15em] px-4 py-2 mb-6"
        >
          {t('workflowAudit.hero.badge')}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          {t('workflowAudit.hero.titleLine1')}
          <span className="text-gradient font-medium block mt-2">{t('workflowAudit.hero.titleLine2')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          {t('workflowAudit.hero.subtitle')}
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Form Section ──────────────────────── */

function FormSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: '',
    teamSize: '',
    description: '',
    timeWasters: '',
    tools: '',
    budget: '',
    timeline: '',
    email: '',
    phone: '',
    website: '', // honeypot — must stay empty
  });
  // Track form-open timestamp for bot-detection (too-fast submits)
  const formStartedAt = useRef<number>(Date.now());

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setSubmitError(t('workflowAudit.form.consentError'));
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('https://api.lennoxos.com/api/audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consent: true,
          formStartedAt: formStartedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(t('workflowAudit.form.submitErrorPrefix', { msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'input-base text-sm';
  const labelClasses = 'flex items-center gap-2 text-sm text-text-secondary mb-2';
  const selectClasses =
    'input-base text-sm appearance-none cursor-pointer';

  if (submitted) {
    return (
      <section className="px-6 lg:px-16 py-24" ref={ref}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-bg-surface border border-theme-border-accent rounded-xl p-8 sm:p-10 lg:p-16 text-center"
          >
            <div className="w-20 h-20 bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} className="text-theme-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
              {t('workflowAudit.success.titleBefore')} <span className="text-gradient">{t('workflowAudit.success.titleAccent')}</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {t('workflowAudit.success.textPrefix')}{formData.name || t('workflowAudit.success.textFallback')}{t('workflowAudit.success.textMiddle')} <strong className="text-text-primary">{t('workflowAudit.success.textHours')}</strong>{' '}
              {t('workflowAudit.success.textSuffix')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {t('workflowAudit.success.whatsapp')}
              </a>
              <a href="#/" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
                <ArrowLeft size={18} />
                {t('workflowAudit.success.backHome')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          onSubmit={handleSubmit}
          className="bg-bg-surface border border-theme-border rounded-xl p-6 sm:p-8 lg:p-12"
        >
          {/* Honeypot — visually hidden, off-screen. Real users never see/fill this. Bots auto-fill. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label htmlFor="website-hp">{t('workflowAudit.form.honeypotLabel')}</label>
            <input
              type="text"
              id="website-hp"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          {/* Intro text */}
          <div className="mb-10 pb-8 border-b border-theme-border">
            <p className="text-text-secondary leading-relaxed">
              {t('workflowAudit.form.intro')} <strong className="text-text-primary">{t('workflowAudit.form.introBold')}</strong>{t('workflowAudit.form.introSuffix')}
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Name */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="name" className={labelClasses}>
                <User size={16} className="text-theme-accent" />
                {t('workflowAudit.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.namePlaceholder')}
                className={inputClasses}
              />
            </motion.div>

            {/* 2. Unternehmen */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="company" className={labelClasses}>
                <Building2 size={16} className="text-theme-accent" />
                {t('workflowAudit.form.company')}
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.companyPlaceholder')}
                className={inputClasses}
              />
            </motion.div>

            {/* 3. Branche */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="industry" className={labelClasses}>
                <Briefcase size={16} className="text-theme-accent" />
                {t('workflowAudit.form.industry')}
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">{t('workflowAudit.form.selectPlaceholder')}</option>
                <option value="ecommerce">{t('workflowAudit.form.industryOptions.ecommerce')}</option>
                <option value="b2b">{t('workflowAudit.form.industryOptions.b2b')}</option>
                <option value="beratung">{t('workflowAudit.form.industryOptions.beratung')}</option>
                <option value="realestate">{t('workflowAudit.form.industryOptions.realestate')}</option>
                <option value="gesundheit">{t('workflowAudit.form.industryOptions.gesundheit')}</option>
                <option value="finanzen">{t('workflowAudit.form.industryOptions.finanzen')}</option>
                <option value="handwerk">{t('workflowAudit.form.industryOptions.handwerk')}</option>
                <option value="marketing">{t('workflowAudit.form.industryOptions.marketing')}</option>
                <option value="personalbrand">{t('workflowAudit.form.industryOptions.personalbrand')}</option>
                <option value="andere">{t('workflowAudit.form.industryOptions.andere')}</option>
              </select>
            </motion.div>

            {/* 4. Teamgröße */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="teamSize" className={labelClasses}>
                <Users size={16} className="text-theme-accent" />
                {t('workflowAudit.form.teamSize')}
              </label>
              <select
                id="teamSize"
                name="teamSize"
                required
                value={formData.teamSize}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">{t('workflowAudit.form.selectPlaceholder')}</option>
                <option value="solo">{t('workflowAudit.form.teamSizeOptions.solo')}</option>
                <option value="2-5">{t('workflowAudit.form.teamSizeOptions.s2_5')}</option>
                <option value="6-15">{t('workflowAudit.form.teamSizeOptions.s6_15')}</option>
                <option value="16-50">{t('workflowAudit.form.teamSizeOptions.s16_50')}</option>
                <option value="50+">{t('workflowAudit.form.teamSizeOptions.s50plus')}</option>
              </select>
            </motion.div>

            {/* 5. Was macht Ihr Unternehmen? */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="description" className={labelClasses}>
                <FileText size={16} className="text-theme-accent" />
                {t('workflowAudit.form.description')}
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.descriptionPlaceholder')}
                className={`${inputClasses} resize-none`}
              />
            </motion.div>

            {/* 6. Größte Zeitfresser */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="timeWasters" className={labelClasses}>
                <Clock size={16} className="text-theme-accent" />
                {t('workflowAudit.form.timeWasters')}
              </label>
              <textarea
                id="timeWasters"
                name="timeWasters"
                required
                rows={4}
                value={formData.timeWasters}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.timeWastersPlaceholder')}
                className={`${inputClasses} resize-none`}
              />
            </motion.div>

            {/* 7. Aktuelle Tools */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="tools" className={labelClasses}>
                <Wrench size={16} className="text-theme-accent" />
                {t('workflowAudit.form.tools')}
              </label>
              <input
                type="text"
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.toolsPlaceholder')}
                className={inputClasses}
              />
            </motion.div>

            {/* 8. Budgetrahmen */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="budget" className={labelClasses}>
                <Wallet size={16} className="text-theme-accent" />
                {t('workflowAudit.form.budget')}
              </label>
              <select
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">{t('workflowAudit.form.selectPlaceholder')}</option>
                <option value="under5k">{t('workflowAudit.form.budgetOptions.under5k')}</option>
                <option value="5k-15k">{t('workflowAudit.form.budgetOptions.b5_15k')}</option>
                <option value="15k-50k">{t('workflowAudit.form.budgetOptions.b15_50k')}</option>
                <option value="50k+">{t('workflowAudit.form.budgetOptions.b50kplus')}</option>
              </select>
            </motion.div>

            {/* 9. Zeitrahmen */}
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="timeline" className={labelClasses}>
                <CalendarClock size={16} className="text-theme-accent" />
                {t('workflowAudit.form.timeline')}
              </label>
              <select
                id="timeline"
                name="timeline"
                required
                value={formData.timeline}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">{t('workflowAudit.form.selectPlaceholder')}</option>
                <option value="asap">{t('workflowAudit.form.timelineOptions.asap')}</option>
                <option value="1-2months">{t('workflowAudit.form.timelineOptions.m1_2')}</option>
                <option value="3-6months">{t('workflowAudit.form.timelineOptions.m3_6')}</option>
                <option value="planning">{t('workflowAudit.form.timelineOptions.planning')}</option>
              </select>
            </motion.div>

            {/* 10. E-Mail */}
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="email" className={labelClasses}>
                <Mail size={16} className="text-theme-accent" />
                {t('workflowAudit.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.emailPlaceholder')}
                className={inputClasses}
              />
            </motion.div>

            {/* 11. Telefon */}
            <motion.div custom={10} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="phone" className={labelClasses}>
                <Phone size={16} className="text-theme-accent" />
                {t('workflowAudit.form.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('workflowAudit.form.phonePlaceholder')}
                className={inputClasses}
              />
            </motion.div>

            {/* File Upload (visual only) */}
            <motion.div custom={11} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label className={labelClasses}>
                <Upload size={16} className="text-theme-accent" />
                {t('workflowAudit.form.uploadLabel')}
              </label>
              <div className="w-full bg-bg-elevated border border-dashed border-theme-border-strong hover:border-theme-border-accent px-4 py-10 text-center transition-colors cursor-pointer group rounded-lg">
                <Upload size={28} className="text-text-muted group-hover:text-theme-accent mx-auto mb-3 transition-colors" />
                <p className="text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                  {t('workflowAudit.form.uploadDrop')}
                </p>
                <p className="text-xs text-text-muted mt-1">{t('workflowAudit.form.uploadMax')}</p>
              </div>
            </motion.div>
          </div>

          {/* DSGVO Consent */}
          <motion.div
            custom={11}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="mt-8 pt-6 border-t border-theme-border"
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: 'var(--theme-accent)' }}
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {t('workflowAudit.form.consentTextBefore')}{' '}
                <a href="#/datenschutz" className="text-theme-accent hover:underline" data-link>
                  {t('workflowAudit.form.consentLink')}
                </a>
                {t('workflowAudit.form.consentTextAfter')}
              </span>
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div
            custom={12}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="mt-10 pt-8 border-t border-theme-border"
          >
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-on-accent)', borderTopColor: 'transparent' }} />
                  {t('workflowAudit.form.submitting')}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {t('workflowAudit.form.submit')}
                </>
              )}
            </button>
            {submitError && (
              <p className="text-center text-sm text-red-400 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                {submitError}
              </p>
            )}
            <p className="text-center text-xs text-text-muted mt-4">
              {t('workflowAudit.form.submitNote')}
            </p>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}

/* ──────────────────────── What Happens Next ──────────────────────── */

function NextStepsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const icons = [FileText, Sparkles, MessageCircle];
  const items = t('workflowAudit.nextSteps.items', { returnObjects: true }) as { title: string; desc: string }[];
  const steps = items.map((it, i) => ({ ...it, icon: icons[i] }));

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('workflowAudit.nextSteps.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            {t('workflowAudit.nextSteps.heading')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative flex h-full flex-col text-center p-8 bg-bg-primary border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 rounded-xl"
            >
              <div className="w-16 h-16 bg-bg-surface border border-theme-border-accent flex items-center justify-center mx-auto mb-6 rounded-lg">
                <step.icon size={28} className="text-theme-accent" />
              </div>
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider block mb-3">
                {t('workflowAudit.nextSteps.stepPrefix')} {i + 1}
              </span>
              <h3 className="text-lg font-medium mb-3">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-theme-accent">
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

/* ──────────────────────── Kevin Testimonial ──────────────────────── */

function TestimonialSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-bg-surface border border-theme-border-accent rounded-xl p-8 sm:p-10 lg:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-xl">
                K
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('workflowAudit.testimonial.name')}</h3>
                <span className="font-mono text-xs text-theme-accent uppercase tracking-wider">
                  {t('workflowAudit.testimonial.role')}
                </span>
              </div>
            </div>

            <blockquote className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed mb-8 italic">
              {t('workflowAudit.testimonial.quote')}
            </blockquote>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">{t('workflowAudit.testimonial.stat1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">{t('workflowAudit.testimonial.stat2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">{t('workflowAudit.testimonial.stat3')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Final CTA ──────────────────────── */

function FinalCTA() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-bg-elevated border border-theme-border-accent rounded-xl p-8 sm:p-10 lg:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-theme-accent-soft to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
              {t('workflowAudit.finalCta.heading')}
            </h2>
            <p className="text-text-secondary text-lg mb-10">
              {t('workflowAudit.finalCta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {t('workflowAudit.finalCta.whatsapp')}
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                {t('workflowAudit.finalCta.bookCall')}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function WorkflowAudit() {
  return (
    <div className="bg-bg-primary">
      <HeroSection />
      <FormSection />
      <NextStepsSection />
      <TestimonialSection />
      <FinalCTA />
    </div>
  );
}
