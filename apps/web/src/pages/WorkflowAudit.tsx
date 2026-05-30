import { useRef, useState } from 'react';
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
          Kostenlos & unverbindlich
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Kostenloser
          <span className="text-gradient font-medium block mt-2">Workflow Audit</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Füllen Sie das Formular aus. Wir analysieren Ihre Prozesse und senden Ihnen
          in der Regel innerhalb von 2 bis 3 Werktagen eine personalisierte Automatisierungs-Roadmap —
          ohne Verkaufsgespräch-Druck, kostenlos.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Form Section ──────────────────────── */

function FormSection() {
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
      setSubmitError('Bitte stimmen Sie der Datenverarbeitung zu (DSGVO).');
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
      setSubmitError(
        `Senden fehlgeschlagen: ${msg}. Bitte per WhatsApp/Email direkt kontaktieren.`
      );
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
              Anfrage <span className="text-gradient">erhalten!</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Vielen Dank, {formData.name || 'für Ihre Anfrage'}. Wir analysieren Ihre
              Prozesse und senden Ihnen innerhalb von <strong className="text-text-primary">48 Stunden</strong>{' '}
              Ihre personalisierte Automatisierungs-Roadmap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp für Rückfragen
              </a>
              <a href="#/" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
                <ArrowLeft size={18} />
                Zur Startseite
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
            <label htmlFor="website-hp">Website (do not fill)</label>
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
              Erzählen Sie uns von Ihrem Unternehmen. Je mehr wir wissen, desto präziser
              wird Ihre Roadmap. Das dauert nur <strong className="text-text-primary">3-5 Minuten</strong>.
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Name */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="name" className={labelClasses}>
                <User size={16} className="text-theme-accent" />
                Wie heißen Sie? *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Max Mustermann"
                className={inputClasses}
              />
            </motion.div>

            {/* 2. Unternehmen */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="company" className={labelClasses}>
                <Building2 size={16} className="text-theme-accent" />
                Wie heißt Ihr Unternehmen? *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Muster GmbH"
                className={inputClasses}
              />
            </motion.div>

            {/* 3. Branche */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="industry" className={labelClasses}>
                <Briefcase size={16} className="text-theme-accent" />
                In welcher Branche sind Sie tätig? *
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">Bitte wählen</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="b2b">B2B / SaaS</option>
                <option value="beratung">Beratung / Coaching</option>
                <option value="realestate">Immobilien</option>
                <option value="gesundheit">Gesundheit / Fitness</option>
                <option value="finanzen">Finanzen / Versicherung</option>
                <option value="handwerk">Handwerk / Bau</option>
                <option value="marketing">Marketing / Agentur</option>
                <option value="personalbrand">Personal Brand</option>
                <option value="andere">Andere</option>
              </select>
            </motion.div>

            {/* 4. Teamgröße */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="teamSize" className={labelClasses}>
                <Users size={16} className="text-theme-accent" />
                Wie groß ist Ihr Team? *
              </label>
              <select
                id="teamSize"
                name="teamSize"
                required
                value={formData.teamSize}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">Bitte wählen</option>
                <option value="solo">Solo / Freelancer</option>
                <option value="2-5">2 – 5 Mitarbeiter</option>
                <option value="6-15">6 – 15 Mitarbeiter</option>
                <option value="16-50">16 – 50 Mitarbeiter</option>
                <option value="50+">50+ Mitarbeiter</option>
              </select>
            </motion.div>

            {/* 5. Was macht Ihr Unternehmen? */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="description" className={labelClasses}>
                <FileText size={16} className="text-theme-accent" />
                Was macht Ihr Unternehmen? Was ist Ihr Angebot? *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Wir bieten... unsere Zielgruppe ist... unsere größten Stärken sind..."
                className={`${inputClasses} resize-none`}
              />
            </motion.div>

            {/* 6. Größte Zeitfresser */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="timeWasters" className={labelClasses}>
                <Clock size={16} className="text-theme-accent" />
                Was sind Ihre größten Zeitfresser? *
              </label>
              <textarea
                id="timeWasters"
                name="timeWasters"
                required
                rows={4}
                value={formData.timeWasters}
                onChange={handleChange}
                placeholder="z.B. Manuelle Datenpflege, Follow-ups, Content-Erstellung, Lead-Qualifizierung..."
                className={`${inputClasses} resize-none`}
              />
            </motion.div>

            {/* 7. Aktuelle Tools */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="tools" className={labelClasses}>
                <Wrench size={16} className="text-theme-accent" />
                Welche Tools nutzen Sie aktuell?
              </label>
              <input
                type="text"
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleChange}
                placeholder="z.B. HubSpot, Salesforce, Notion, Slack, Zapier, Make..."
                className={inputClasses}
              />
            </motion.div>

            {/* 8. Budgetrahmen */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="budget" className={labelClasses}>
                <Wallet size={16} className="text-theme-accent" />
                Was ist Ihr Budgetrahmen? *
              </label>
              <select
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">Bitte wählen</option>
                <option value="under5k">Unter 5.000 €</option>
                <option value="5k-15k">5.000 – 15.000 €</option>
                <option value="15k-50k">15.000 – 50.000 €</option>
                <option value="50k+">Über 50.000 €</option>
              </select>
            </motion.div>

            {/* 9. Zeitrahmen */}
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="timeline" className={labelClasses}>
                <CalendarClock size={16} className="text-theme-accent" />
                Wann soll das System live sein? *
              </label>
              <select
                id="timeline"
                name="timeline"
                required
                value={formData.timeline}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="">Bitte wählen</option>
                <option value="asap">So schnell wie möglich</option>
                <option value="1-2months">In 1-2 Monaten</option>
                <option value="3-6months">In 3-6 Monaten</option>
                <option value="planning">Nur am Planen / Budgetierung</option>
              </select>
            </motion.div>

            {/* 10. E-Mail */}
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="email" className={labelClasses}>
                <Mail size={16} className="text-theme-accent" />
                Ihre E-Mail-Adresse *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="max@beispiel.de"
                className={inputClasses}
              />
            </motion.div>

            {/* 11. Telefon */}
            <motion.div custom={10} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label htmlFor="phone" className={labelClasses}>
                <Phone size={16} className="text-theme-accent" />
                Ihre Telefonnummer
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+49 123 456789"
                className={inputClasses}
              />
            </motion.div>

            {/* File Upload (visual only) */}
            <motion.div custom={11} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <label className={labelClasses}>
                <Upload size={16} className="text-theme-accent" />
                Dokumente hochladen (optional)
              </label>
              <div className="w-full bg-bg-elevated border border-dashed border-theme-border-strong hover:border-theme-border-accent px-4 py-10 text-center transition-colors cursor-pointer group rounded-lg">
                <Upload size={28} className="text-text-muted group-hover:text-theme-accent mx-auto mb-3 transition-colors" />
                <p className="text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                  PDF, DOC, oder Bilder hierher ziehen
                </p>
                <p className="text-xs text-text-muted mt-1">Max. 10 MB</p>
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
                Ich willige ein, dass meine Daten zum Zweck der Audit-Erstellung und Kontaktaufnahme verarbeitet werden. Mehr in der{' '}
                <a href="#/datenschutz" className="text-theme-accent hover:underline" data-link>
                  Datenschutzerklärung
                </a>
                . Widerruf jederzeit möglich (Art 7 Abs 3 DSGVO).
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
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Meinen Roadmap generieren
                </>
              )}
            </button>
            {submitError && (
              <p className="text-center text-sm text-red-400 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                {submitError}
              </p>
            )}
            <p className="text-center text-xs text-text-muted mt-4">
              100% kostenlos und unverbindlich. Ihre Daten sind sicher.
            </p>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}

/* ──────────────────────── What Happens Next ──────────────────────── */

function NextStepsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      icon: FileText,
      title: 'Analyse',
      desc: 'Wir analysieren Ihre Antworten und identifizieren die größten Automatisierungspotenziale.',
    },
    {
      icon: Sparkles,
      title: 'Roadmap',
      desc: 'Sie erhalten eine detaillierte, priorisierte Roadmap mit konkreten Use Cases und Zeitplan.',
    },
    {
      icon: MessageCircle,
      title: 'Strategy Call',
      desc: 'Wir besprechen die Roadmap in einem 30-minütigen Call und beantworten alle Fragen.',
    },
  ];

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
            Der Ablauf
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Was passiert als Nächstes?
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
                Schritt {i + 1}
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
                <h3 className="text-lg font-medium">Kevin</h3>
                <span className="font-mono text-xs text-theme-accent uppercase tracking-wider">
                  Ketolabs — E-Commerce
                </span>
              </div>
            </div>

            <blockquote className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed mb-8 italic">
              &ldquo;Der Workflow Audit war der Wendepunkt. Innerhalb von 48 Stunden hatten wir eine
              Roadmap, die exakt zeigte, wo wir mit KI ansetzen können. Seitdem laufen 6 AI Agents
              und wir machen €2.847 pro Tag — automatisiert.&rdquo;
            </blockquote>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">€2.847/Tag</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">6 AI Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-theme-accent" />
                <span className="text-sm text-text-secondary">3.45x ROAS</span>
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
              Noch Fragen?
            </h2>
            <p className="text-text-secondary text-lg mb-10">
              Schreiben Sie uns direkt auf WhatsApp oder buchen Sie einen Call.
              Wir antworten innerhalb von 2 Stunden.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp schreiben
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
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
