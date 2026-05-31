/**
 * /saas — Public SaaS-Tools Hub
 *
 * Marketing-Landing für AEVUM SaaS-Pipelines (Pay-per-Use, Credit-basiert).
 * Trennung von /shop (Blueprints/DFY/Bundles, einmaliger Kauf).
 *
 * Visitor-Flow: Hub → Tool-Detail (/saas/:slug) → Try-Demo oder SignupFlow → Stripe → Auto-Account.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Zap,
  Coins,
  LayoutGrid,
  Clock,
} from 'lucide-react';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';
import { listSaasTools, CREDIT_PACKAGES, localizeSaasTool, localizeRunsHint, type SaasTool, type SaasSecurityLevel } from '@/data/saas-tools';
import { TiltCard } from '@/components/showcase-fx';

function SecurityBadge({ level }: { level: SaasSecurityLevel }) {
  const { t } = useTranslation();
  const map = {
    basic: { label: t('saas.badge.basic'), icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    business: { label: t('saas.badge.business'), icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    dsgvo: { label: t('saas.badge.dsgvo'), icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
  };
  const { label, icon: Icon, color, bg } = map[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${bg} ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

function StatusBadge({ tool }: { tool: SaasTool }) {
  const { t } = useTranslation();
  if (tool.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-400/10 border-emerald-400/25 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {t('saas.badge.live')}
      </span>
    );
  }
  if (tool.status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-400/10 border-amber-400/25 text-amber-400">
        <Zap size={10} />
        {t('saas.badge.beta')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-bg-elevated border-theme-border-strong text-text-muted">
      <Clock size={10} />
      {t('saas.badge.konzept')}
    </span>
  );
}

function ToolCard({ tool, idx }: { tool: SaasTool; idx: number }) {
  const { t } = useTranslation();
  const dimmed = tool.status === 'coming-soon';
  const href = `#/saas/${tool.slug}`;

  return (
    <TiltCard intensity={7} className="block h-full">
    <motion.a
      href={href}
      onClick={() => track('saas_card_click', { tool: tool.slug, status: tool.status })}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: idx * 0.06 }}
      className={`group relative flex h-full flex-col bg-bg-surface border rounded-lg p-5 sm:p-6 transition-all overflow-hidden ${
        dimmed
          ? 'border-theme-border hover:border-theme-border-strong opacity-70'
          : 'border-theme-border-accent hover:border-theme-accent/60 hover:bg-bg-elevated'
      }`}
    >
      {/* Top: badges */}
      <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <StatusBadge tool={tool} />
          <SecurityBadge level={tool.securityLevel} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex-shrink-0">
          {tool.category}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-lg sm:text-xl font-light leading-tight mb-2 break-words ${dimmed ? 'text-text-secondary' : 'text-text-primary'}`}>
        {tool.name}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-5 line-clamp-2">{tool.tagline}</p>

      {/* Price */}
      <div className="flex items-center gap-2 mb-5">
        <Coins size={13} className={dimmed ? 'text-text-muted' : 'text-theme-accent'} />
        <span className={`text-xs font-mono ${dimmed ? 'text-text-muted' : 'text-theme-accent'}`}>
          {tool.pricePerRunLabel}
        </span>
      </div>

      {/* CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-theme-border pt-4">
        <span className={`text-xs font-mono uppercase tracking-wider ${dimmed ? 'text-text-muted' : 'text-text-secondary group-hover:text-theme-accent'} transition-colors`}>
          {tool.status === 'coming-soon' ? t('saas.hub.cardDetails') : t('saas.hub.cardUseNow')}
        </span>
        <ArrowRight
          size={15}
          className={`${dimmed ? 'text-text-muted' : 'text-theme-accent group-hover:translate-x-1'} transition-transform`}
        />
      </div>

      {/* Hover-Glow */}
      {!dimmed && (
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-theme-accent/5 via-transparent to-transparent" />
      )}
    </motion.a>
    </TiltCard>
  );
}

function PackagesStrip() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <section className="border-t border-theme-border py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
            {t('saas.packages.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
            {t('saas.packages.title')}
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            {t('saas.packages.subtitle')}
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
              <div className="text-center">
                <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                  {pkg.name}
                </div>
                <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                <div className="text-sm text-text-secondary">{t('saas.packages.creditsLabel', { count: pkg.credits })}</div>
                {pkg.bonusPct > 0 && (
                  <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mt-2">
                    {t('saas.packages.bonus', { pct: pkg.bonusPct })}
                  </div>
                )}
                <div className="text-xs text-text-muted mt-3 font-mono">{localizeRunsHint(pkg, lang)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    { n: 1, title: t('saas.how.step1Title'), text: t('saas.how.step1Text') },
    { n: 2, title: t('saas.how.step2Title'), text: t('saas.how.step2Text') },
    { n: 3, title: t('saas.how.step3Title'), text: t('saas.how.step3Text') },
    { n: 4, title: t('saas.how.step4Title'), text: t('saas.how.step4Text') },
  ];
  return (
    <section className="border-t border-theme-border py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
            {t('saas.how.eyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary">
            {t('saas.how.title')}
          </h2>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="flex h-full flex-col text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-theme-border-accent bg-theme-accent-soft text-theme-accent font-mono text-sm mb-3 mx-auto">
                {s.n}
              </div>
              <h3 className="text-sm text-text-primary mb-1.5 font-medium">{s.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Saas() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  usePageSeo({
    title: t('saas.hub.seoTitle'),
    description: t('saas.hub.seoDescription'),
    path: '/saas',
    keywords: t('saas.hub.seoKeywords'),
  });

  const tools = useMemo(() => listSaasTools().map((tool) => localizeSaasTool(tool, lang)), [lang]);
  const liveCount = tools.filter((tl) => tl.status === 'live').length;
  const partialCount = tools.filter((tl) => tl.status === 'partial').length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-theme-accent/[0.04] via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-theme-border-accent bg-theme-accent-soft mb-6">
              <Sparkles size={12} className="text-theme-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-theme-accent">
                {t('saas.hub.eyebrow')}
              </span>
            </div>
            <h1 className="text-[clamp(2rem,7vw,3.75rem)] font-light tracking-tight leading-[1.05] text-text-primary mb-5">
              {t('saas.hub.heroTitleLine1')}
              <br />
              <span className="text-theme-accent">{t('saas.hub.heroTitleLine2')}</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
              {t('saas.hub.heroSubtitle')}
            </p>

            {/* Mini-Stats */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('saas.hub.statLive', { count: liveCount })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {t('saas.hub.statBeta', { count: partialCount })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Coins size={11} />
                {t('saas.hub.statEntry')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert size={11} />
                {t('saas.hub.statDsgvo')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Tools-Grid ─── */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid size={14} className="text-theme-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent">
              {t('saas.hub.availableTools')}
            </span>
          </div>
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            {tools.map((tool, idx) => (
              <ToolCard key={tool.slug} tool={tool} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      <PackagesStrip />
      <HowItWorks />

      {/* ─── Footer-CTA ─── */}
      <section className="border-t border-theme-border py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-4">
            {t('saas.hub.footerTitle')}
          </h2>
          <p className="text-text-secondary mb-6 leading-relaxed text-sm">
            {t('saas.hub.footerText')}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#/shop"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] border border-theme-border-strong hover:border-theme-accent/50 text-text-primary text-sm rounded transition"
            >
              {t('saas.hub.footerToShop')} <ArrowRight size={14} />
            </a>
            <a
              href="#/audit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
            >
              {t('saas.hub.footerBookAudit')} <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
