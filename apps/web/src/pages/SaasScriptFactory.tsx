/**
 * /saas/script-factory — Dedicated Public Detail Page (Wave H2).
 *
 * Sektionen:
 *  1. Hero
 *  2. Wie es funktioniert (4-Step)
 *  3. Use-Cases (7 Cards)
 *  4. Demo-Output (Side-by-Side Mock)
 *  5. Pricing (Credit-Packages)
 *  6. Knowledge-Hubs
 *  7. FAQ
 *  8. Footer-CTA
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, Coins, ChevronDown,
  Phone, PhoneCall, Facebook, Search, Music2, ShoppingBag, Mic2,
  Upload, Settings, Cpu, FileCheck2, Library, LogIn, Zap,
} from 'lucide-react';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';
import { CREDIT_PACKAGES, localizeRunsHint } from '@/data/saas-tools';
import SignupFlow from '@/components/saas/SignupFlow';

const PORTAL_BASE = 'https://app.aevum-system.de';

// ── Static structure (icons + i18n keys; brand/product names stay) ──────────
const USE_CASE_ICONS = [
  { slug: 'phone-script-cold',     icon: PhoneCall,   nameKey: 'coldCallName',  exampleKey: 'coldCallExample' },
  { slug: 'phone-script-followup', icon: Phone,       nameKey: 'followupName',  exampleKey: 'followupExample' },
  { slug: 'ad-copy-meta',          icon: Facebook,    nameKey: 'metaName',      exampleKey: 'metaExample' },
  { slug: 'ad-copy-google',        icon: Search,      nameKey: 'googleName',    exampleKey: 'googleExample' },
  { slug: 'ad-copy-tiktok',        icon: Music2,      nameKey: 'tiktokName',    exampleKey: 'tiktokExample' },
  { slug: 'ecommerce-product',     icon: ShoppingBag, nameKey: 'ecomName',      exampleKey: 'ecomExample' },
  { slug: 'sales-pitch',           icon: Mic2,        nameKey: 'salesName',     exampleKey: 'salesExample' },
] as const;

const STEP_ICONS = [
  { icon: Upload,     titleKey: 'uploadTitle',  detailKey: 'uploadDetail' },
  { icon: Settings,   titleKey: 'useCaseTitle', detailKey: 'useCaseDetail' },
  { icon: Cpu,        titleKey: 'settingsTitle', detailKey: 'settingsDetail' },
  { icon: FileCheck2, titleKey: 'runTitle',     detailKey: 'runDetail' },
] as const;

// name/desc are localized; badge ('Live'/'Soon') maps to i18n.
const KNOWLEDGE_HUBS = [
  { slug: 'high-ticket-sales',  nameKey: 'highTicketName', descKey: 'highTicketDesc', soon: false },
  { slug: 'ecom-ad-copy',       nameKey: 'ecomName',       descKey: 'ecomDesc',       soon: false },
  { slug: 'aevum-default',      nameKey: 'defaultName',    descKey: 'defaultDesc',    soon: false },
  { slug: 'custom',             nameKey: 'customName',     descKey: 'customDesc',     soon: true },
] as const;

const FAQ_KEYS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
  { q: 'q6', a: 'a6' },
  { q: 'q7', a: 'a7' },
] as const;

// ── Component ────────────────────────────────────────────
export default function SaasScriptFactory() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'growth' | 'pro' | undefined>(undefined);

  usePageSeo({
    title: t('saas.scriptFactory.seoTitle'),
    description: t('saas.scriptFactory.seoDescription'),
    path: '/saas/script-factory',
  });

  useEffect(() => {
    track('saas_tool_view', { tool: 'script-factory', status: 'live' });
  }, []);

  function openSignup(pkg?: 'starter' | 'growth' | 'pro') {
    setSelectedPackage(pkg);
    setSignupOpen(true);
    track('saas_tool_signup_open', { tool: 'script-factory', package: pkg || 'none' });
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <a href="#/saas" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted hover:text-theme-accent transition-colors">
          <ArrowLeft size={13} /> {t('saas.scriptFactory.allTools')}
        </a>
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-10 pb-14 md:pt-12 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-400/10 border-emerald-400/25 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t('saas.badge.live')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{t('saas.scriptFactory.heroCategory')}</span>
            </div>

            <h1 className="text-[clamp(2rem,7vw,3.75rem)] font-light tracking-tight leading-[1.05] text-text-primary mb-5">
              {t('saas.scriptFactory.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-text-primary leading-relaxed mb-3 max-w-3xl font-light">
              {t('saas.scriptFactory.heroLead')}
            </p>
            <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-3xl">
              {t('saas.scriptFactory.heroDesc')}
            </p>

            {/* Trust-Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Badge icon={Coins} label={t('saas.scriptFactory.badgePricing')} />
              <Badge icon={Zap} label={t('saas.scriptFactory.badgeVariants')} />
              <Badge icon={FileCheck2} label={t('saas.scriptFactory.badgeGrading')} />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-semibold rounded hover:bg-theme-accent/90 transition shadow-[0_8px_24px_-8px_rgba(224,164,88,0.5)]"
              >
                <Sparkles size={15} /> {t('saas.scriptFactory.ctaSub')}
              </button>
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] border border-theme-border-accent hover:border-theme-accent/70 text-theme-accent text-sm rounded transition"
              >
                <Coins size={14} /> {t('saas.scriptFactory.ctaOneTime')}
              </button>
              <a
                href={`${PORTAL_BASE}/tools/script-factory`}
                onClick={() => track('saas_tool_login_click', { tool: 'script-factory' })}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] border border-theme-border-strong hover:border-theme-accent/50 text-text-primary text-sm rounded transition"
              >
                <LogIn size={14} /> {t('saas.scriptFactory.ctaLogin')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Wie es funktioniert ── */}
      <section className="border-t border-theme-border py-16 bg-bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.workflowEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">{t('saas.scriptFactory.workflowTitle')}</h2>
            <p className="text-sm text-text-muted mt-2">{t('saas.scriptFactory.workflowNote')}</p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {STEP_ICONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.titleKey}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative flex h-full flex-col bg-bg-elevated border border-theme-border rounded-lg p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center text-theme-accent flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{t('saas.scriptFactory.step', { n: i + 1 })}</span>
                  </div>
                  <h3 className="text-sm font-medium text-text-primary mb-1.5">{t(`saas.scriptFactory.steps.${s.titleKey}`)}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{t(`saas.scriptFactory.steps.${s.detailKey}`)}</p>
                  {i < STEP_ICONS.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-text-muted z-10">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Use-Cases ── */}
      <section className="border-t border-theme-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.useCasesEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">{t('saas.scriptFactory.useCasesTitle')}</h2>
            <p className="text-sm text-text-muted mt-2">{t('saas.scriptFactory.useCasesNote')}</p>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {USE_CASE_ICONS.map((u, i) => {
              const Icon = u.icon;
              return (
                <motion.div
                  key={u.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  className="flex h-full flex-col bg-bg-surface border border-theme-border rounded-lg p-5 hover:border-theme-accent/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-theme-border flex items-center justify-center text-theme-accent mb-3">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">{t(`saas.scriptFactory.useCases.${u.nameKey}`)}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{t(`saas.scriptFactory.useCases.${u.exampleKey}`)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Demo Side-by-Side ── */}
      <section className="border-t border-theme-border py-16 bg-bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.demoEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">{t('saas.scriptFactory.demoTitle')}</h2>
            <p className="text-sm text-text-muted mt-2">{t('saas.scriptFactory.demoNote')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DemoCard
              label={t('saas.scriptFactory.demoBeforeLabel')}
              grade="D"
              gradeColor="rose"
              hook={4.5}
              tone="neutral"
              hookScoreLabel={t('saas.scriptFactory.demoHookScore')}
              text={t('saas.scriptFactory.demoBeforeText')}
              points={[
                { sign: '-', text: t('saas.scriptFactory.demoBeforeP1') },
                { sign: '-', text: t('saas.scriptFactory.demoBeforeP2') },
                { sign: '-', text: t('saas.scriptFactory.demoBeforeP3') },
              ]}
            />
            <DemoCard
              label={t('saas.scriptFactory.demoAfterLabel')}
              grade="A"
              gradeColor="emerald"
              hook={8.5}
              tone="optimized"
              hookScoreLabel={t('saas.scriptFactory.demoHookScore')}
              text={t('saas.scriptFactory.demoAfterText')}
              points={[
                { sign: '+', text: t('saas.scriptFactory.demoAfterP1') },
                { sign: '+', text: t('saas.scriptFactory.demoAfterP2') },
                { sign: '+', text: t('saas.scriptFactory.demoAfterP3') },
              ]}
            />
          </div>

          {/* Differences summary */}
          <div className="mt-6 max-w-3xl mx-auto border border-theme-border-accent bg-theme-accent-soft rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-theme-accent" />
              <span className="text-sm font-medium text-text-primary">{t('saas.scriptFactory.diffTitle')}</span>
            </div>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><span className="text-theme-accent">{t('saas.scriptFactory.diffHookLabel')}</span> · {t('saas.scriptFactory.diffHook')}</li>
              <li><span className="text-theme-accent">{t('saas.scriptFactory.diffIcpLabel')}</span> · {t('saas.scriptFactory.diffIcp')}</li>
              <li><span className="text-theme-accent">{t('saas.scriptFactory.diffCtaLabel')}</span> · {t('saas.scriptFactory.diffCta')}</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => openSignup()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
            >
              {t('saas.scriptFactory.demoStartRun')} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-t border-theme-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.pricingEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">{t('saas.scriptFactory.pricingTitle')}</h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">
              {t('saas.scriptFactory.pricingSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className={`relative flex h-full flex-col bg-bg-surface border rounded-lg p-6 ${
                  pkg.featured ? 'border-theme-border-accent' : 'border-theme-border'
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-on-accent bg-theme-accent px-2.5 py-1 rounded">
                    {t('saas.packages.popular')}
                  </span>
                )}
                <div className="text-center flex-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">{pkg.name}</div>
                  <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                  <div className="text-sm text-text-secondary mb-2">{t('saas.packages.creditsLabel', { count: pkg.credits })}</div>
                  {pkg.bonusPct > 0 && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                      {t('saas.packages.bonus', { pct: pkg.bonusPct })}
                    </div>
                  )}
                  <div className="text-xs text-text-muted font-mono">{localizeRunsHint(pkg, lang)}</div>
                </div>
                <button
                  onClick={() => openSignup(pkg.slug)}
                  className={`mt-5 w-full px-4 py-2.5 min-h-[44px] text-xs font-medium rounded transition ${
                    pkg.featured
                      ? 'bg-theme-accent text-on-accent hover:bg-theme-accent/90'
                      : 'border border-theme-border-strong text-text-primary hover:border-theme-accent/50'
                  }`}
                >
                  {t('saas.detail.selectPackage', { name: pkg.name })}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge-Hubs ── */}
      <section className="border-t border-theme-border py-16 bg-bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.knowledgeEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-2">{t('saas.scriptFactory.knowledgeTitle')}</h2>
            <p className="text-sm text-text-muted max-w-xl mx-auto">
              {t('saas.scriptFactory.knowledgeNote')}
            </p>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {KNOWLEDGE_HUBS.map((h, i) => {
              const isSoon = h.soon;
              return (
                <motion.div
                  key={h.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="flex h-full flex-col bg-bg-elevated border border-theme-border rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-surface border border-theme-border flex items-center justify-center text-theme-accent flex-shrink-0">
                      <Library size={16} />
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSoon
                        ? 'bg-bg-surface border-theme-border-strong text-text-muted'
                        : 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400'
                    }`}>
                      {isSoon ? t('saas.scriptFactory.hubs.soon') : t('saas.scriptFactory.hubs.live')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">{t(`saas.scriptFactory.hubs.${h.nameKey}`)}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{t(`saas.scriptFactory.hubs.${h.descKey}`)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-theme-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">{t('saas.scriptFactory.faqEyebrow')}</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">{t('saas.scriptFactory.faqTitle')}</h2>
          </div>
          <div>
            {FAQ_KEYS.map((f, i) => <FaqItem key={i} q={t(`saas.scriptFactory.faq.${f.q}`)} a={t(`saas.scriptFactory.faq.${f.a}`)} />)}
          </div>
        </div>
      </section>

      {/* ── Footer-CTA ── */}
      <section className="border-t border-theme-border py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Sparkles size={28} className="mx-auto text-theme-accent mb-4" />
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
            {t('saas.scriptFactory.readyTitle')}
          </h2>
          <p className="text-text-secondary mb-7 leading-relaxed text-sm">
            {t('saas.scriptFactory.readyText')}
          </p>
          <button
            onClick={() => openSignup()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-semibold rounded hover:bg-theme-accent/90 transition"
          >
            {t('saas.scriptFactory.readyCta')} <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Signup */}
      <SignupFlow
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        toolSlug="script-factory"
        toolName="Script-Factory"
        initialPackage={selectedPackage}
      />
    </div>
  );
}

// ── Sub-Components ──
function Badge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide px-2.5 py-1 rounded border bg-bg-elevated border-theme-border text-text-secondary">
      <Icon size={11} className="text-theme-accent flex-shrink-0" /> {label}
    </span>
  );
}

interface DemoPoint { sign: '+' | '-'; text: string }
function DemoCard({
  label, grade, gradeColor, hook, tone, text, points, hookScoreLabel
}: {
  label: string;
  grade: string;
  gradeColor: 'rose' | 'emerald';
  hook: number;
  tone: 'neutral' | 'optimized';
  text: string;
  points: DemoPoint[];
  hookScoreLabel: string;
}) {
  const gradeBg = gradeColor === 'rose'
    ? 'bg-rose-400/15 border-rose-400/40 text-rose-300'
    : 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300';
  const cardBorder = tone === 'optimized' ? 'border-theme-border-accent' : 'border-theme-border';
  const hookPct = (hook / 10) * 100;
  const barColor = hook >= 8 ? 'bg-emerald-400' : hook >= 6 ? 'bg-lime-400' : hook >= 4 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className={`bg-bg-elevated border rounded-lg p-5 ${cardBorder} min-w-0`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[0.65rem] uppercase tracking-widest text-text-muted font-medium">{label}</div>
        <div className={`w-11 h-11 ${gradeBg} border rounded-lg flex items-center justify-center font-bold font-mono text-xl flex-shrink-0`}>
          {grade}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.6rem] uppercase tracking-wider text-text-muted">{hookScoreLabel}</span>
          <span className="text-xs font-mono text-text-secondary">{hook.toFixed(1)}/10</span>
        </div>
        <div className="w-full h-1.5 bg-bg-surface rounded-full overflow-hidden">
          <div className={`h-1.5 ${barColor} rounded-full transition-all`} style={{ width: `${hookPct}%` }} />
        </div>
      </div>

      <pre className="text-xs text-text-secondary font-mono leading-relaxed whitespace-pre-wrap break-words bg-bg-surface rounded p-3 mb-4 max-h-56 overflow-y-auto">
{text}
      </pre>

      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
            <span className={`shrink-0 mt-0.5 ${p.sign === '+' ? 'text-emerald-400' : 'text-rose-400'}`}>{p.sign}</span>
            <span>{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-theme-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-4 text-left group min-h-[44px]">
        <span className="text-sm text-text-primary group-hover:text-theme-accent transition-colors font-medium">{q}</span>
        <ChevronDown size={16} className={`text-text-muted group-hover:text-theme-accent transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pb-4">
          <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

