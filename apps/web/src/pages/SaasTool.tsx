/**
 * /saas/:slug — SaaS-Tool Detail-Page
 *
 * Sektionen:
 *   1. Hero (Tool-Name, Pricing, Live-Status-Badge)
 *   2. Was ist es — Use-Case-Beschreibung
 *   3. Was macht es — Pipeline-Steps
 *   4. Demo-Output (für anonyme Visitors)
 *   5. Pricing — Credit-Pakete
 *   6. FAQ
 *   7. CTA-Sektionen (Try-Demo + Login + Signup)
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Check,
  ChevronDown,
  Play,
  LogIn,
  Lock,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';
import { getSaasTool, CREDIT_PACKAGES, type SaasSecurityLevel } from '@/data/saas-tools';
import { TiltCard, Magnetic } from '@/components/showcase-fx';
import SignupFlow from '@/components/saas/SignupFlow';

const PORTAL_BASE = 'https://app.aevum-system.de';

interface Props {
  slug: string;
}

function SecurityBadge({ level }: { level: SaasSecurityLevel }) {
  const map = {
    basic: { label: 'Basic', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    business: { label: 'Business', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    dsgvo: { label: 'DSGVO', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
  };
  const { label, icon: Icon, color, bg } = map[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border ${bg} ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-theme-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group min-h-[44px]"
      >
        <span className="text-sm text-text-primary group-hover:text-theme-accent transition-colors font-medium">{q}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted group-hover:text-theme-accent transition-transform shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-4"
        >
          <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function SaasTool({ slug }: Props) {
  const tool = useMemo(() => getSaasTool(slug), [slug]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'growth' | 'pro' | undefined>(undefined);
  const [demoOpen, setDemoOpen] = useState(false);

  usePageSeo({
    title: tool ? `${tool.name} — AEVUM SaaS` : 'SaaS-Tool — AEVUM',
    description: tool ? tool.tagline : 'AEVUM SaaS-Tools — Pay-per-Use AI-Pipelines.',
    path: `/saas/${slug}`,
    jsonLd: tool ? {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: tool.name,
      url: `https://aevum-system.de/saas/${tool.slug}`,
      description: tool.shortDescription,
      provider: { '@type': 'Organization', name: 'AEVUM', url: 'https://aevum-system.de' },
      areaServed: ['DE', 'AT', 'CH'],
      category: tool.category,
      serviceType: 'SaaS / Pay-per-Run AI-Pipeline',
      offers: tool.status !== 'coming-soon' ? {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'EUR',
        description: tool.pricePerRunLabel,
      } : {
        '@type': 'Offer',
        availability: 'https://schema.org/PreOrder',
        priceCurrency: 'EUR',
      },
    } : undefined,
  });

  useEffect(() => {
    if (tool) track('saas_tool_view', { tool: tool.slug, status: tool.status });
  }, [tool]);

  if (!tool) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4 sm:px-6 bg-bg-primary">
        <div>
          <AlertCircle size={32} className="mx-auto text-text-muted mb-4" />
          <h1 className="text-xl text-text-primary font-light mb-2">SaaS-Tool nicht gefunden</h1>
          <p className="text-text-muted text-sm mb-6 break-words">Slug: <span className="font-mono">{slug}</span></p>
          <a
            href="#/saas"
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] border border-theme-border-strong hover:border-theme-accent/50 text-sm rounded transition text-text-primary"
          >
            <ArrowLeft size={14} /> Zurück zum SaaS-Hub
          </a>
        </div>
      </div>
    );
  }

  const isComingSoon = tool.status === 'coming-soon';
  const isLive = tool.status === 'live';

  function openSignup(pkg?: 'starter' | 'growth' | 'pro') {
    setSelectedPackage(pkg);
    setSignupOpen(true);
    track('saas_tool_signup_open', { tool: tool!.slug, package: pkg || 'none' });
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Back-Link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <a
          href="#/saas"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted hover:text-theme-accent transition-colors"
        >
          <ArrowLeft size={13} /> Alle SaaS-Tools
        </a>
      </div>

      {/* ─── Hero ─── */}
      <section className="relative pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {/* Status */}
              {isLive && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-400/10 border-emerald-400/25 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {tool.statusLabel}
                </span>
              )}
              {tool.status === 'partial' && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-400/10 border-amber-400/25 text-amber-400">
                  <Zap size={10} />
                  {tool.statusLabel}
                </span>
              )}
              {isComingSoon && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-bg-elevated border-theme-border-strong text-text-secondary">
                  <Clock size={10} />
                  {tool.statusLabel}
                </span>
              )}
              <SecurityBadge level={tool.securityLevel} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {tool.category}
              </span>
            </div>

            <h1 className="text-[clamp(2rem,7vw,3.75rem)] font-light tracking-tight leading-[1.05] text-text-primary mb-4 break-words">
              {tool.name}
            </h1>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6 max-w-3xl">
              {tool.tagline}
            </p>

            <div className="flex items-center gap-2 mb-8">
              <Coins size={16} className={isComingSoon ? 'text-text-muted' : 'text-theme-accent'} />
              <span className={`text-sm font-mono ${isComingSoon ? 'text-text-muted' : 'text-theme-accent'}`}>
                {tool.pricePerRunLabel}
              </span>
            </div>

            {/* Primary CTAs */}
            {!isComingSoon && (
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic strength={0.25}>
                <button
                  onClick={() => openSignup()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
                >
                  <Sparkles size={15} /> Account anlegen + nutzen
                </button>
                </Magnetic>
                {tool.demoOutput && (
                  <button
                    onClick={() => {
                      setDemoOpen(true);
                      track('saas_demo_open', { tool: tool.slug });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] border border-theme-border-strong hover:border-theme-accent/50 text-text-primary text-sm rounded transition"
                  >
                    <Play size={14} /> Demo-Output ansehen
                  </button>
                )}
                {tool.portalToolSlug && (
                  <a
                    href={`${PORTAL_BASE}/auth/login`}
                    target="_blank"
                    rel="noopener"
                    onClick={() => track('saas_tool_login_click', { tool: tool.slug })}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-text-secondary hover:text-text-primary text-sm transition"
                  >
                    <LogIn size={14} /> Schon Account? Login
                  </a>
                )}
              </div>
            )}

            {isComingSoon && (
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="#/audit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] border border-theme-border-accent hover:border-theme-accent/60 text-theme-accent text-sm rounded transition"
                >
                  Auf Wait-List <ArrowRight size={14} />
                </a>
                <span className="text-xs text-text-muted">Audit-Call buchen → Beta-Zugang</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Was ist es ─── */}
      <section className="border-t border-theme-border py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
            Was ist es
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-4">Use-Case</h2>
          <p className="text-base text-text-secondary leading-relaxed">{tool.whatIsIt}</p>

          {tool.useCases.length > 0 && (
            <div className="mt-8">
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">Passt für</div>
              <ul className="space-y-2">
                {tool.useCases.map((uc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={14} className="text-theme-accent mt-0.5 shrink-0" /> {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ─── Pipeline-Steps ─── */}
      <section className="border-t border-theme-border py-14 bg-bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
              Was es macht
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">Pipeline-Steps</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tool.whatItDoes.map((s) => (
              <TiltCard key={s.step} intensity={8}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: s.step * 0.04 }}
                className="bg-bg-elevated border border-theme-border rounded-lg p-5 h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-theme-border-accent bg-theme-accent-soft text-theme-accent font-mono text-xs flex-shrink-0">
                    {s.step}
                  </span>
                  <h3 className="text-sm text-text-primary font-medium">{s.title}</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{s.detail}</p>
              </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo-Output ─── */}
      {tool.demoOutput && !isComingSoon && (
        <section className="border-t border-theme-border py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
                Demo-Output
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-2 break-words">{tool.demoOutput.title}</h2>
              <p className="text-sm text-text-muted">
                So sieht ein typischer Run aus. (Statischer Mock — echter Run im Portal nach Signup.)
              </p>
            </div>

            <div className="relative bg-bg-elevated border border-theme-border rounded-lg overflow-hidden">
              {!demoOpen && (
                <button
                  onClick={() => {
                    setDemoOpen(true);
                    track('saas_demo_reveal', { tool: tool.slug });
                  }}
                  className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-bg-primary/50 transition hover:bg-bg-primary/40"
                >
                  <div className="text-center">
                    <Play size={28} className="mx-auto text-theme-accent mb-2" />
                    <div className="text-sm text-text-primary font-medium">Demo-Output zeigen</div>
                    <div className="text-xs text-text-muted mt-1">Vorschau · Statisch</div>
                  </div>
                </button>
              )}
              <pre className={`p-4 sm:p-6 text-sm text-text-secondary font-mono leading-relaxed whitespace-pre-wrap break-words ${demoOpen ? '' : 'select-none'}`}>
                {tool.demoOutput.sample}
              </pre>
            </div>

            {demoOpen && (
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary mb-3">
                  Du willst echten Output mit deinem Brief? Account anlegen → erster Run in 90 Sek.
                </p>
                <button
                  onClick={() => openSignup()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
                >
                  Account anlegen <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section className="border-t border-theme-border py-14 bg-bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
              Pricing
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">Credit-Pakete</h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">
              Einmaliger Kauf, Credits verfallen nicht.{' '}
              {tool.creditsPerRun && <span>{tool.creditsPerRun} Credits pro Run.</span>}
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className={`relative bg-bg-elevated border rounded-lg p-6 flex flex-col ${
                  pkg.featured ? 'border-theme-border-accent' : 'border-theme-border'
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-on-accent bg-theme-accent px-2.5 py-1 rounded">
                    Beliebt
                  </span>
                )}
                <div className="text-center flex-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                    {pkg.name}
                  </div>
                  <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                  <div className="text-sm text-text-secondary mb-2">{pkg.credits} Credits</div>
                  {pkg.bonusPct > 0 && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                      +{pkg.bonusPct}% Bonus
                    </div>
                  )}
                  <div className="text-xs text-text-muted font-mono">{pkg.runsHint}</div>
                </div>
                {!isComingSoon && (
                  <button
                    onClick={() => openSignup(pkg.slug)}
                    className={`mt-5 w-full px-4 py-2.5 min-h-[44px] text-xs font-medium rounded transition ${
                      pkg.featured
                        ? 'bg-theme-accent text-on-accent hover:bg-theme-accent/90'
                        : 'border border-theme-border-strong text-text-primary hover:border-theme-accent/50'
                    }`}
                  >
                    {pkg.name} wählen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      {tool.faq.length > 0 && (
        <section className="border-t border-theme-border py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-theme-accent mb-3 block">
                FAQ
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-text-primary">Häufige Fragen</h2>
            </div>
            <div>
              {tool.faq.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer-CTA ─── */}
      <section className="border-t border-theme-border py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {isComingSoon ? (
            <>
              <Lock size={24} className="mx-auto text-text-muted mb-4" />
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
                Noch nicht verfügbar
              </h2>
              <p className="text-text-secondary mb-6 leading-relaxed text-sm">
                Buche einen Audit-Call und kriege Wait-List-Zugang plus Early-Adopter-Bonus
                wenn das Tool live geht.
              </p>
              <a
                href="#/audit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
              >
                Audit-Call buchen <ArrowRight size={14} />
              </a>
            </>
          ) : (
            <>
              <Sparkles size={24} className="mx-auto text-theme-accent mb-4" />
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
                Bereit für deinen ersten Run?
              </h2>
              <p className="text-text-secondary mb-6 leading-relaxed text-sm">
                Account in 60 Sekunden. Credits verfallen nicht. Kein Abo.
              </p>
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-theme-accent text-on-accent text-sm font-medium rounded hover:bg-theme-accent/90 transition"
              >
                <span className="break-words">Account anlegen + {tool.name} nutzen</span> <ArrowRight size={14} className="flex-shrink-0" />
              </button>
            </>
          )}
        </div>
      </section>

      {/* ─── Signup Modal ─── */}
      <SignupFlow
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        toolSlug={tool.slug}
        toolName={tool.name}
        initialPackage={selectedPackage}
      />
    </div>
  );
}
