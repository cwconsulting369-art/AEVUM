/**
 * /saas — Public SaaS-Tools Hub
 *
 * Marketing-Landing für AEVUM SaaS-Pipelines (Pay-per-Use, Credit-basiert).
 * Trennung von /shop (Blueprints/DFY/Bundles, einmaliger Kauf).
 *
 * Visitor-Flow: Hub → Tool-Detail (/saas/:slug) → Try-Demo oder SignupFlow → Stripe → Auto-Account.
 */
import { useMemo } from 'react';
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
import { listSaasTools, CREDIT_PACKAGES, type SaasTool, type SaasSecurityLevel } from '@/data/saas-tools';
import { TiltCard, GradientBorder, NumberCounter, Magnetic, Spotlight } from '@/components/showcase-fx';

function SecurityBadge({ level }: { level: SaasSecurityLevel }) {
  const map = {
    basic: { label: 'Basic', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    business: { label: 'Business', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    dsgvo: { label: 'DSGVO', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
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
  if (tool.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-400/10 border-emerald-400/25 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  if (tool.status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-400/10 border-amber-400/25 text-amber-400">
        <Zap size={10} />
        Beta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-white/5 border-white/15 text-text-primary/50">
      <Clock size={10} />
      Konzept
    </span>
  );
}

function ToolCard({ tool, idx }: { tool: SaasTool; idx: number }) {
  const dimmed = tool.status === 'coming-soon';
  const href = `#/saas/${tool.slug}`;

  return (
    <TiltCard intensity={7} className="block">
    <motion.a
      href={href}
      onClick={() => track('saas_card_click', { tool: tool.slug, status: tool.status })}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: idx * 0.06 }}
      className={`group relative block bg-bg-primary border rounded-lg p-6 transition-all overflow-hidden ${
        dimmed
          ? 'border-white/8 hover:border-white/15 opacity-70'
          : 'border-[#e0a458]/15 hover:border-[#e0a458]/40 hover:bg-[#0c0c0c]'
      }`}
    >
      {/* Top: badges */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge tool={tool} />
          <SecurityBadge level={tool.securityLevel} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-primary/30">
          {tool.category}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-xl font-light leading-tight mb-2 ${dimmed ? 'text-text-primary/70' : 'text-text-primary'}`}>
        {tool.name}
      </h3>
      <p className="text-sm text-text-primary/55 leading-relaxed mb-5 line-clamp-2">{tool.tagline}</p>

      {/* Price */}
      <div className="flex items-center gap-2 mb-5">
        <Coins size={13} className={dimmed ? 'text-text-primary/30' : 'text-[#e0a458]'} />
        <span className={`text-xs font-mono ${dimmed ? 'text-text-primary/40' : 'text-[#e0a458]'}`}>
          {tool.pricePerRunLabel}
        </span>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <span className={`text-xs font-mono uppercase tracking-wider ${dimmed ? 'text-text-primary/40' : 'text-text-primary/70 group-hover:text-[#e0a458]'} transition-colors`}>
          {tool.status === 'coming-soon' ? 'Details' : 'Jetzt nutzen'}
        </span>
        <ArrowRight
          size={15}
          className={`${dimmed ? 'text-text-primary/30' : 'text-[#e0a458] group-hover:translate-x-1'} transition-transform`}
        />
      </div>

      {/* Hover-Glow */}
      {!dimmed && (
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#e0a458]/5 via-transparent to-transparent" />
      )}
    </motion.a>
    </TiltCard>
  );
}

function PackagesStrip() {
  return (
    <section className="border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
            Credit-Pakete
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
            Pay-per-Use, kein Abo
          </h2>
          <p className="text-sm text-text-primary/55 max-w-xl mx-auto leading-relaxed">
            Lädst Credits einmalig auf, verbrauchst sie pro SaaS-Run. Credits verfallen nicht.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.slug}
              className={`relative bg-bg-primary border rounded-lg p-6 ${
                pkg.featured ? 'border-[#e0a458]/40' : 'border-white/8'
              }`}
            >
              {pkg.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-black bg-[#e0a458] px-2.5 py-1 rounded">
                  Beliebt
                </span>
              )}
              <div className="text-center">
                <div className="text-xs font-mono uppercase tracking-wider text-text-primary/50 mb-1">
                  {pkg.name}
                </div>
                <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                <div className="text-sm text-text-primary/60">{pkg.credits} Credits</div>
                {pkg.bonusPct > 0 && (
                  <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mt-2">
                    +{pkg.bonusPct}% Bonus
                  </div>
                )}
                <div className="text-xs text-text-primary/40 mt-3 font-mono">{pkg.runsHint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: 'Tool wählen', text: 'Klick auf eine SaaS-Karte. Lies Detail-Page + Demo-Output an.' },
    { n: 2, title: 'Account anlegen', text: 'Email + Credit-Paket (€10/€25/€50). Stripe-Checkout in 2 Klicks.' },
    { n: 3, title: 'Login-Mail', text: 'Magic-Link kommt automatisch. Klick → Portal-Tool öffnet.' },
    { n: 4, title: 'Pay-per-Run', text: 'Credits werden pro Run abgezogen. Nachladen jederzeit.' },
  ];
  return (
    <section className="border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
            So funktioniert es
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary">
            Vom ersten Klick zum ersten Run in 90 Sekunden
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e0a458]/30 bg-[#e0a458]/8 text-[#e0a458] font-mono text-sm mb-3">
                {s.n}
              </div>
              <h3 className="text-sm text-text-primary mb-1.5 font-medium">{s.title}</h3>
              <p className="text-xs text-text-primary/55 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Saas() {
  usePageSeo({
    title: 'AEVUM SaaS-Tools — Pay-per-Use AI-Pipelines | Script-Factory, DSGVO-Factory',
    description:
      'Self-Service AI-Pipelines für Ad-Scripts, DSGVO-Checks, Lead-Qualifying. Kein Abo, du zahlst pro Run via Credits. Output in Minuten, professionell verwertbar.',
    path: '/saas',
    keywords: 'AEVUM SaaS, AI-Pipelines, Ad-Scripts, DSGVO, Pay-per-Use, Credits',
  });

  const tools = useMemo(() => listSaasTools(), []);
  const liveCount = tools.filter((t) => t.status === 'live').length;
  const partialCount = tools.filter((t) => t.status === 'partial').length;

  return (
    <div className="min-h-screen bg-black text-text-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e0a458]/[0.04] via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e0a458]/25 bg-[#e0a458]/8 mb-6">
              <Sparkles size={12} className="text-[#e0a458]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#e0a458]">
                AEVUM SaaS
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-text-primary mb-5">
              AEVUM SaaS-Tools
              <br />
              <span className="text-[#e0a458]">Pay-per-Use AI-Pipelines</span>
            </h1>
            <p className="text-base md:text-lg text-text-primary/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Keine Setup-Fees. Keine Subscriptions. Du zahlst pro Run via AEVUM Credits.
              Ad-Scripts, DSGVO-Texte, Leads — alle Pipelines in einem Account.
            </p>

            {/* Mini-Stats */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-text-primary/50">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {liveCount} live
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {partialCount} Beta
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Coins size={11} />
                ab €10 Einstieg
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert size={11} />
                DSGVO-konform
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Tools-Grid ─── */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid size={14} className="text-[#e0a458]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458]">
              Verfügbare Tools
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((tool, idx) => (
              <ToolCard key={tool.slug} tool={tool} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      <PackagesStrip />
      <HowItWorks />

      {/* ─── Footer-CTA ─── */}
      <section className="border-t border-white/5 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-4">
            Du brauchst Custom-Setup statt Self-Service?
          </h2>
          <p className="text-text-primary/55 mb-6 leading-relaxed text-sm">
            Unsere DFY-Services bauen Pipelines auf deinem Server mit Custom-Voice-Tuning.
            Im Shop verfügbar.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/15 hover:border-white/30 text-text-primary text-sm rounded transition"
            >
              Zum Shop <ArrowRight size={14} />
            </a>
            <a
              href="#/audit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
            >
              Audit-Call buchen <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
