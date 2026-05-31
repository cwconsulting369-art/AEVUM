import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Settings2,
  Zap,
  FileText,
  Lock,
  Globe,
  ShieldCheck,
  BarChart3,
  Mail,
  MousePointerClick,
  Check,
  X as XIcon,
  Target,
  Users,
  ShoppingBag,
  Handshake,
} from 'lucide-react';
import CONTACT from '../config/contact';
import { usePageSeo } from '@/hooks/use-page-seo';
import PathThreeCard from '@/components/ctas/PathThreeCard';
import TrustpilotWidget from '@/components/TrustpilotWidget';
import TrustpilotReviews from '@/components/TrustpilotReviews';
import { AuroraBg, TiltCard, Magnetic, NumberCounter, Spotlight } from '@/components/showcase-fx';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

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

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion — skip animation entirely
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    // Mobile: hard cap 40 (was 120). Reduces O(n^2) connect-line loop ~9x on phones.
    const MAX = isMobile ? 40 : 120;
    const COUNT = Math.min(MAX, Math.floor((w * h) / (isMobile ? 18000 : 12000)));

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / w;
      mouseRef.current.y = e.clientY / h;
    };
    window.addEventListener('mousemove', onMouse);

    // Pause RAF when tab not visible — saves CPU/battery
    let visible = true;
    const onVisibility = () => {
      const wasHidden = !visible;
      visible = !document.hidden;
      if (visible && wasHidden && !rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const tiltX = (mouseRef.current.y - 0.5) * 0.05;
      const tiltY = (mouseRef.current.x - 0.5) * 0.05;

      for (const p of particles) {
        p.x += p.vx + tiltY * 0.5;
        p.y += p.vy + tiltX * 0.5;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          Math.random() > 0.7
            ? `rgba(224, 164, 88, ${p.alpha})`
            : `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(224, 164, 88, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // P1-Fix: defer first draw to idle — frees main-thread for LCP paint (~1.3s recovered)
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    };
    const win = window as IdleWindow;
    let idleHandle: number | null = null;
    let fallbackTimer: number | null = null;
    if (typeof win.requestIdleCallback === 'function') {
      idleHandle = win.requestIdleCallback(() => { draw(); }, { timeout: 1500 });
    } else {
      fallbackTimer = window.setTimeout(() => { draw(); }, 800);
    }

    return () => {
      if (idleHandle !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(idleHandle);
      }
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ perspective: '800px' }}
    />
  );
}

function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mesh-bg" aria-hidden />
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden />
      <ParticleCanvas />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.a
          href="#/waitlist"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-theme-accent mb-6 border border-theme-border-accent bg-theme-accent-soft hover:bg-theme-accent-soft px-3 py-1.5 transition-colors"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
          {t('home.hero.badge')}
        </motion.a>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mb-6"
        >
          {t('home.hero.titleLine1')}
          <span className="block mt-2 text-gradient font-medium">
            {t('home.hero.titleLine2')}
          </span>
          <span className="block mt-1">{t('home.hero.titleLine3')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {t('home.hero.subtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-lg">
            <a href="#/audit" className="btn-primary flex items-center justify-center gap-2 sm:flex-1">
              {t('home.hero.ctaPrimary')}
            </a>
            <a href="#/method" className="btn-secondary flex items-center justify-center gap-2 sm:flex-1">
              {t('home.hero.ctaSecondary')}
            </a>
          </div>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent underline-offset-4 hover:underline transition-colors"
          >
            <MessageCircle size={14} />
            {t('home.hero.ctaWhatsapp')}
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-text-muted font-mono mt-6"
        >
          <span>{t('home.hero.tags.agencies')}</span>
          <span className="hidden sm:inline">·</span>
          <span>{t('home.hero.tags.personalBrands')}</span>
          <span className="hidden sm:inline">·</span>
          <span>{t('home.hero.tags.midmarket')}</span>
          <span className="hidden sm:inline">|</span>
          <span>{t('home.hero.tags.gdpr')}</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border border-theme-border-strong flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-theme-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Section 1b: 3 Wege mit AEVUM (Shop/SaaS/Audit) ──────────────────────── */

const THREE_PATHS_META = [
  { icon: ShoppingBag, href: '#/shop', tone: 'primary' as const },
  { icon: Zap, href: '#/saas', tone: 'secondary' as const },
  { icon: Handshake, href: '#/audit', tone: 'premium' as const },
];

const toneStyles: Record<'primary' | 'secondary' | 'premium', {
  border: string;
  iconBg: string;
  iconColor: string;
  pricingColor: string;
  hasBadge?: boolean;
}> = {
  primary: {
    border: 'border-theme-border hover:border-theme-border-accent',
    iconBg: 'bg-theme-accent-soft',
    iconColor: 'text-theme-accent',
    pricingColor: 'text-theme-accent',
  },
  secondary: {
    border: 'border-theme-border hover:border-theme-border-accent',
    iconBg: 'bg-bg-elevated',
    iconColor: 'text-text-primary',
    pricingColor: 'text-theme-accent',
  },
  premium: {
    border: 'border-theme-border-accent hover:border-theme-accent bg-gradient-to-br from-theme-accent-soft to-transparent',
    iconBg: 'bg-gradient-to-br from-[#e0a458] to-[#a86d27]',
    iconColor: 'text-black',
    pricingColor: 'text-theme-accent',
    hasBadge: true,
  },
};

function ThreePathsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const pathTexts = t('home.threePaths.items', { returnObjects: true }) as {
    title: string; subtitle: string; pricing: string; description: string; cta: string;
  }[];
  const THREE_PATHS = THREE_PATHS_META.map((m, i) => ({ ...m, ...pathTexts[i] }));
  const badgeLabel = t('home.threePaths.badgePremium');

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24 bg-bg-primary" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-4 block">
            {t('home.threePaths.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            {t('home.threePaths.heading')}
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t('home.threePaths.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {THREE_PATHS.map((p, i) => {
            const s = toneStyles[p.tone];
            const Icon = p.icon;
            return (
              <motion.a
                key={p.title}
                href={p.href}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative bg-bg-surface border ${s.border} p-6 sm:p-7 md:p-8 transition-all flex h-full flex-col hover:-translate-y-1`}
              >
                {s.hasBadge && (
                  <span className="absolute top-4 right-4 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-0.5">
                    {badgeLabel}
                  </span>
                )}

                <div className={`w-12 h-12 rounded-lg ${s.iconBg} flex items-center justify-center mb-5`}>
                  <Icon size={22} className={s.iconColor} />
                </div>

                <h3 className="text-2xl font-medium text-text-primary mb-1.5">{p.title}</h3>
                <p className="text-sm text-text-secondary mb-4 leading-snug">{p.subtitle}</p>

                <p className={`font-mono text-xs uppercase tracking-[0.1em] ${s.pricingColor} mb-4`}>
                  {p.pricing}
                </p>

                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                  {p.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-medium text-theme-accent group-hover:gap-3 transition-all mt-auto">
                  {p.cta}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 1c: Account-Vorteile-Vergleich ──────────────────────── */

const ACCOUNT_FEATURE_META = [
  { key: 'blueprint', gast: true, shop: true, saas: true, full: true },
  { key: 'credits', gast: false, shop: true, saas: true, full: true },
  { key: 'stamps', gast: false, shop: true, saas: true, full: true },
  { key: 'saasTools', gast: false, shop: false, saas: true, full: 'saasFull' as const },
  { key: 'personalAgent', gast: false, shop: false, saas: false, full: true },
  { key: 'dashboard', gast: false, shop: false, saas: false, full: true },
  { key: 'community', gast: false, shop: false, saas: false, full: true },
] as const;

const TIER_META = [
  { key: 'gast' },
  { key: 'shop' },
  { key: 'saas' },
  { key: 'full', highlight: true },
] as const;

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check size={18} className="text-theme-accent mx-auto" />;
  }
  if (value === false) {
    return <XIcon size={16} className="text-text-muted mx-auto" />;
  }
  return (
    <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-theme-accent leading-tight">
      {value}
    </span>
  );
}

function AccountBenefitsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const saasFullValue = t('home.accountBenefits.saasFullValue');
  const ACCOUNT_FEATURES = ACCOUNT_FEATURE_META.map((row) => ({
    feature: t(`home.accountBenefits.features.${row.key}`),
    gast: row.gast,
    shop: row.shop,
    saas: row.saas,
    full: row.full === 'saasFull' ? saasFullValue : row.full,
  }));
  const TIER_HEADERS = TIER_META.map((tier) => ({
    key: tier.key,
    label: t(`home.accountBenefits.tiers.${tier.key}.label`),
    sub: t(`home.accountBenefits.tiers.${tier.key}.sub`),
    highlight: 'highlight' in tier ? tier.highlight : false,
  }));

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24 bg-bg-primary" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-4 block">
            {t('home.accountBenefits.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            {t('home.accountBenefits.heading')}
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t('home.accountBenefits.subtitle')}
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="hidden md:block bg-bg-surface border border-theme-border overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="text-left p-5 text-xs font-mono uppercase tracking-[0.1em] text-text-secondary w-[34%]">
                  {t('home.accountBenefits.featureColumn')}
                </th>
                {TIER_HEADERS.map((tier) => (
                  <th
                    key={tier.key}
                    className={`text-center p-5 ${tier.highlight ? 'bg-theme-accent-soft' : ''}`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        tier.highlight ? 'text-theme-accent' : 'text-text-primary'
                      }`}
                    >
                      {tier.label}
                    </div>
                    <div className="text-[0.65rem] font-mono uppercase tracking-[0.08em] text-text-muted mt-1">
                      {tier.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_FEATURES.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`${i % 2 === 1 ? 'bg-bg-elevated' : ''} border-b border-theme-border last:border-b-0`}
                >
                  <td className="p-5 text-sm text-text-primary">{row.feature}</td>
                  <td className="p-5 text-center">
                    <Cell value={row.gast} />
                  </td>
                  <td className="p-5 text-center">
                    <Cell value={row.shop} />
                  </td>
                  <td className="p-5 text-center">
                    <Cell value={row.saas} />
                  </td>
                  <td className="p-5 text-center bg-theme-accent-soft">
                    <Cell value={row.full} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile: stacked cards per tier */}
        <div className="md:hidden space-y-5">
          {TIER_HEADERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`bg-bg-surface border ${
                tier.highlight ? 'border-theme-border-accent' : 'border-theme-border'
              } p-5`}
            >
              <div className="mb-4">
                <h3 className={`text-base font-medium ${tier.highlight ? 'text-theme-accent' : 'text-text-primary'}`}>
                  {tier.label}
                </h3>
                <p className="text-[0.65rem] font-mono uppercase tracking-[0.08em] text-text-muted mt-0.5">
                  {tier.sub}
                </p>
              </div>
              <ul className="space-y-2.5">
                {ACCOUNT_FEATURES.map((row) => {
                  const v = row[tier.key as 'gast' | 'shop' | 'saas' | 'full'];
                  const enabled = v !== false;
                  return (
                    <li
                      key={row.feature}
                      className={`flex items-start gap-3 text-sm ${
                        enabled ? 'text-text-primary' : 'text-text-muted line-through'
                      }`}
                    >
                      {enabled ? (
                        <Check size={16} className="text-theme-accent shrink-0 mt-0.5" />
                      ) : (
                        <XIcon size={14} className="text-text-muted shrink-0 mt-1" />
                      )}
                      <span className="flex-1">
                        {row.feature}
                        {typeof v === 'string' && (
                          <span className="block text-[10px] font-mono uppercase tracking-[0.06em] text-theme-accent mt-0.5">
                            {v}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-xs text-text-muted font-mono mt-8"
        >
          {t('home.accountBenefits.footer')}
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Marketing-Thesis (7 Steps) ──────────────────────── */

function ThesisSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stepTexts = t('home.thesis.steps', { returnObjects: true }) as { tag: string; text: string }[];
  const steps = stepTexts.map((s, i) => ({
    num: String(i + 1).padStart(2, '0'),
    tag: s.tag,
    text: s.text,
    isCTA: i === stepTexts.length - 1,
  }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.thesis.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            {t('home.thesis.heading')}
          </h2>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`bg-bg-surface border border-theme-border hover:border-theme-border-accent transition-all p-6 sm:p-8 lg:p-10 ${
                step.isCTA ? 'border-theme-border-accent' : ''
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <span className="font-mono text-sm text-text-muted shrink-0 mt-1">
                  {step.num}
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-theme-accent mb-3 block">
                    {step.tag}
                  </span>
                  <p className="text-base md:text-lg leading-relaxed text-text-primary">
                    {step.text}
                  </p>
                  {step.isCTA && (
                    <a
                      href="#/audit"
                      className="btn-primary inline-flex items-center gap-2 mt-6"
                    >
                      {t('home.thesis.ctaButton')} <ArrowRight size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Die 3 Saeulen ──────────────────────── */

const PILLAR_ICONS = [LayoutDashboard, Settings2, TrendingUp];

function PillarsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const pillarTexts = t('home.pillars.items', { returnObjects: true }) as {
    name: string; pitch: string; bullets: string[];
  }[];
  const pillars = pillarTexts.map((p, i) => ({ ...p, icon: PILLAR_ICONS[i] }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.pillars.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            {t('home.pillars.heading')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-primary p-6 sm:p-8 lg:p-10 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 flex h-full flex-col"
            >
              <p.icon size={32} className="text-theme-accent mb-6" />
              <h3 className="font-mono text-sm uppercase tracking-[0.1em] text-theme-accent mb-3">
                {p.name}
              </h3>
              <p className="text-lg text-text-primary font-medium mb-6">{p.pitch}</p>
              <ul className="space-y-3">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-theme-accent mt-0.5 shrink-0">-</span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 4: Bausteine-Visualisierung ──────────────────────── */

const MODULE_ICONS = [MousePointerClick, Mail, BarChart3, Users, FileText, Zap];

function ModulesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const moduleTexts = t('home.modules.items', { returnObjects: true }) as { name: string; desc: string }[];
  const modules = moduleTexts.map((m, i) => ({ ...m, icon: MODULE_ICONS[i] }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.modules.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            {t('home.modules.heading')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            {t('home.modules.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 group flex h-full flex-col"
            >
              <m.icon
                size={28}
                className="text-text-secondary group-hover:text-theme-accent transition-colors mb-4"
              />
              <h3 className="text-lg font-medium mb-2">{m.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 5: Services ──────────────────────── */

const SERVICE_ICONS = [Zap, Target, BarChart3];

function ServicesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const serviceTexts = t('home.services.items', { returnObjects: true }) as {
    tag: string; title: string; desc: string; result: string;
  }[];
  const services = serviceTexts.map((s, i) => ({ ...s, icon: SERVICE_ICONS[i] }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.services.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            {t('home.services.heading')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            {t('home.services.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-primary p-6 sm:p-8 lg:p-10 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 flex h-full flex-col"
            >
              <s.icon size={32} className="text-theme-accent mb-6" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-text-muted mb-3 block">
                {s.tag}
              </span>
              <h3 className="text-xl font-medium mb-4">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">{s.desc}</p>
              <div className="border-t border-theme-border pt-4">
                <p className="text-sm text-theme-accent font-mono">{s.result}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <a href="#/audit" className="btn-primary inline-flex items-center gap-2">
            {t('home.services.ctaButton')} <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 6: Live-Cases ──────────────────────── */

const CASE_META = [
  { name: 'Carlos', share_industry: true, share_kpi_deltas: true, share_logo: false, share_company_name: true },
  { name: 'Patrick', share_industry: true, share_kpi_deltas: true, share_logo: false, share_company_name: false },
];

function CasesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const caseTexts = t('home.cases.items', { returnObjects: true }) as {
    industry: string; kpi_delta: string; story: string;
  }[];
  const mockCases = CASE_META.map((m, i) => ({ ...m, ...caseTexts[i] }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.cases.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            {t('home.cases.heading')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCases.map((c, i) => (
            <TiltCard key={c.name} intensity={6} className="h-full">
            <motion.div
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all h-full flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e0a458] to-[#a86d27] flex items-center justify-center text-black font-bold text-lg shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium">{c.name}</h3>
                  {c.share_industry && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-theme-accent">
                      {c.industry}
                    </span>
                  )}
                </div>
              </div>

              {c.share_kpi_deltas && (
                <div className="mb-4">
                  <p className="text-3xl font-light text-gradient">{c.kpi_delta}</p>
                </div>
              )}

              {c.share_company_name && c.share_industry && (
                <p className="text-sm text-text-secondary leading-relaxed">{c.story}</p>
              )}

              {!c.share_company_name && c.share_industry && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t('home.cases.projectRunning')}
                </p>
              )}
            </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href="#/cases"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent transition-colors"
          >
            {t('home.cases.allCases')} <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 7: Pricing-Block ──────────────────────── */

const PRICING_TRUST_ICONS = [Lock, ShieldCheck, Globe];

function PricingSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const trustTexts = t('home.pricing.trustSignals', { returnObjects: true }) as string[];
  const trustSignals = trustTexts.map((text, i) => ({ icon: PRICING_TRUST_ICONS[i], text }));
  const bullets = t('home.pricing.bullets', { returnObjects: true }) as string[];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.pricing.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            {t('home.pricing.heading')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed mx-auto">
            {t('home.pricing.subtitle')}
          </p>
        </motion.div>

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="bg-bg-primary border border-theme-border p-6 sm:p-10 lg:p-14 mb-10 max-w-3xl mx-auto"
        >
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
            {t('home.pricing.intro')}
          </p>
          <ul className="space-y-4 mb-10">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-text-primary">
                <ArrowRight size={16} className="text-theme-accent shrink-0 mt-1" />
                <span className="text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-theme-border pt-8 mb-10 space-y-3">
            <p className="text-sm text-text-muted font-mono uppercase tracking-[0.08em] mb-4">
              {t('home.pricing.rangeLabel')}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="text-text-secondary text-sm sm:w-48 shrink-0">{t('home.pricing.setupLabel')}</span>
              <span className="text-xl md:text-2xl font-light text-gradient">
                {t('home.pricing.setupValue')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="text-text-secondary text-sm sm:w-48 shrink-0">{t('home.pricing.retainerLabel')}</span>
              <span className="text-xl md:text-2xl font-light text-gradient">
                {t('home.pricing.retainerValue')}
              </span>
            </div>
          </div>

          <a
            href="#/audit"
            className="btn-primary inline-flex items-center gap-2"
          >
            {t('home.pricing.ctaButton')} <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {trustSignals.map((signal, i) => (
            <motion.div
              key={signal.text}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex h-full items-center gap-3 bg-bg-primary border border-theme-border px-5 py-4"
            >
              <signal.icon size={16} className="text-theme-accent shrink-0" />
              <span className="text-sm text-text-secondary">{signal.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 8: Vertrauens-Layer ──────────────────────── */

const TRUST_BADGE_ICONS = [ShieldCheck, Lock, Globe];

function TrustSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const badgeTexts = t('home.trust.badges', { returnObjects: true }) as string[];
  const badges = badgeTexts.map((text, i) => ({ icon: TRUST_BADGE_ICONS[i], text }));

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.trust.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            {t('home.trust.heading')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {badges.map((b, i) => (
            <motion.div
              key={b.text}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 text-center flex h-full flex-col"
            >
              <b.icon size={32} className="text-theme-accent mx-auto mb-4" />
              <p className="text-sm text-text-secondary leading-relaxed">{b.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex items-center gap-6 justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e0a458] to-[#a86d27] flex items-center justify-center text-black font-bold text-xl">
            C
          </div>
          <div>
            <p className="font-medium text-lg">Carlos Wrusch</p>
            <p className="font-mono text-xs text-text-secondary uppercase tracking-wider">
              {t('home.trust.founderRole')}
            </p>
          </div>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-12 flex justify-center"
        >
          <TrustpilotWidget />
        </motion.div>

        {/* Block F3 (2026-05-25) — full Review-Cards Grid (placeholder mode bis Public-Launch) */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-16"
        >
          <TrustpilotReviews />
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 9: FAQ ──────────────────────── */

function FAQSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const faqs = t('home.faq.items', { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            {t('home.faq.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            {t('home.faq.heading')}
          </h2>
        </motion.div>

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-bg-primary border border-theme-border px-6"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-medium py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-secondary leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 10: Final CTA ──────────────────────── */

function FinalCTASection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden"
      ref={ref}
    >
      <AuroraBg />
      <div className="absolute inset-0 opacity-30">
        <ParticleCanvas />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-10">
          {t('home.finalCta.titleLine1')}
          <span className="block text-gradient mt-2">{t('home.finalCta.titleLine2')}</span>
        </h2>

        <PathThreeCard compact />

        <p className="font-mono text-xs text-text-muted mt-10">
          {t('home.finalCta.note')}
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Home Page ──────────────────────── */

export default function Home() {
  const { t } = useTranslation();
  usePageSeo({
    title: t('home.seo.title'),
    description: t('home.seo.description'),
    path: '/',
  });
  return (
    <div className="bg-bg-primary">
      <HeroSection />
      <ThreePathsSection />
      <AccountBenefitsSection />
      <ThesisSection />
      <PillarsSection />
      <ModulesSection />
      <ServicesSection />
      <CasesSection />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
