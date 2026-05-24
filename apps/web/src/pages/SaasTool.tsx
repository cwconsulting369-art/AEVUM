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
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm text-text-primary group-hover:text-[#e0a458] transition-colors font-medium">{q}</span>
        <ChevronDown
          size={16}
          className={`text-text-primary/40 group-hover:text-[#e0a458] transition-transform shrink-0 ${
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
          <p className="text-sm text-text-primary/60 leading-relaxed">{a}</p>
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
  });

  useEffect(() => {
    if (tool) track('saas_tool_view', { tool: tool.slug, status: tool.status });
  }, [tool]);

  if (!tool) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
        <div>
          <AlertCircle size={32} className="mx-auto text-text-primary/30 mb-4" />
          <h1 className="text-xl text-text-primary font-light mb-2">SaaS-Tool nicht gefunden</h1>
          <p className="text-text-primary/50 text-sm mb-6">Slug: <span className="font-mono">{slug}</span></p>
          <a
            href="#/saas"
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 hover:border-white/30 text-sm rounded transition"
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
    <div className="min-h-screen bg-black text-text-primary">
      {/* Back-Link */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <a
          href="#/saas"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-primary/50 hover:text-[#e0a458] transition-colors"
        >
          <ArrowLeft size={13} /> Alle SaaS-Tools
        </a>
      </div>

      {/* ─── Hero ─── */}
      <section className="relative pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-5xl mx-auto px-6">
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
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-white/5 border-white/15 text-text-primary/55">
                  <Clock size={10} />
                  {tool.statusLabel}
                </span>
              )}
              <SecurityBadge level={tool.securityLevel} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-primary/40">
                {tool.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-text-primary mb-4">
              {tool.name}
            </h1>
            <p className="text-base md:text-lg text-text-primary/60 leading-relaxed mb-6 max-w-3xl">
              {tool.tagline}
            </p>

            <div className="flex items-center gap-2 mb-8">
              <Coins size={16} className={isComingSoon ? 'text-text-primary/30' : 'text-[#e0a458]'} />
              <span className={`text-sm font-mono ${isComingSoon ? 'text-text-primary/40' : 'text-[#e0a458]'}`}>
                {tool.pricePerRunLabel}
              </span>
            </div>

            {/* Primary CTAs */}
            {!isComingSoon && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openSignup()}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
                >
                  <Sparkles size={15} /> Account anlegen + nutzen
                </button>
                {tool.demoOutput && (
                  <button
                    onClick={() => {
                      setDemoOpen(true);
                      track('saas_demo_open', { tool: tool.slug });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-white/15 hover:border-white/30 text-text-primary text-sm rounded transition"
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
                    className="inline-flex items-center gap-2 px-5 py-3 text-text-primary/70 hover:text-text-primary text-sm transition"
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
                  className="inline-flex items-center gap-2 px-5 py-3 border border-[#e0a458]/30 hover:border-[#e0a458]/60 text-[#e0a458] text-sm rounded transition"
                >
                  Auf Wait-List <ArrowRight size={14} />
                </a>
                <span className="text-xs text-text-primary/40">Audit-Call buchen → Beta-Zugang</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Was ist es ─── */}
      <section className="border-t border-white/5 py-14">
        <div className="max-w-4xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
            Was ist es
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-4">Use-Case</h2>
          <p className="text-base text-text-primary/65 leading-relaxed">{tool.whatIsIt}</p>

          {tool.useCases.length > 0 && (
            <div className="mt-8">
              <div className="text-xs font-mono uppercase tracking-wider text-text-primary/50 mb-3">Passt für</div>
              <ul className="space-y-2">
                {tool.useCases.map((uc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary/70">
                    <Check size={14} className="text-[#e0a458] mt-0.5 shrink-0" /> {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ─── Pipeline-Steps ─── */}
      <section className="border-t border-white/5 py-14 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
              Was es macht
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">Pipeline-Steps</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tool.whatItDoes.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: s.step * 0.04 }}
                className="bg-bg-primary border border-white/8 rounded-lg p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#e0a458]/30 bg-[#e0a458]/8 text-[#e0a458] font-mono text-xs">
                    {s.step}
                  </span>
                  <h3 className="text-sm text-text-primary font-medium">{s.title}</h3>
                </div>
                <p className="text-xs text-text-primary/55 leading-relaxed">{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo-Output ─── */}
      {tool.demoOutput && !isComingSoon && (
        <section className="border-t border-white/5 py-14">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
                Demo-Output
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-2">{tool.demoOutput.title}</h2>
              <p className="text-sm text-text-primary/50">
                So sieht ein typischer Run aus. (Statischer Mock — echter Run im Portal nach Signup.)
              </p>
            </div>

            <div className="relative bg-bg-primary border border-white/10 rounded-lg overflow-hidden">
              {!demoOpen && (
                <button
                  onClick={() => {
                    setDemoOpen(true);
                    track('saas_demo_reveal', { tool: tool.slug });
                  }}
                  className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-black/50 transition hover:bg-black/40"
                >
                  <div className="text-center">
                    <Play size={28} className="mx-auto text-[#e0a458] mb-2" />
                    <div className="text-sm text-text-primary font-medium">Demo-Output zeigen</div>
                    <div className="text-xs text-text-primary/50 mt-1">Vorschau · Statisch</div>
                  </div>
                </button>
              )}
              <pre className={`p-6 text-sm text-text-primary/80 font-mono leading-relaxed whitespace-pre-wrap ${demoOpen ? '' : 'select-none'}`}>
                {tool.demoOutput.sample}
              </pre>
            </div>

            {demoOpen && (
              <div className="mt-6 text-center">
                <p className="text-sm text-text-primary/55 mb-3">
                  Du willst echten Output mit deinem Brief? Account anlegen → erster Run in 90 Sek.
                </p>
                <button
                  onClick={() => openSignup()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
                >
                  Account anlegen <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section className="border-t border-white/5 py-14 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
              Pricing
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">Credit-Pakete</h2>
            <p className="text-sm text-text-primary/55 max-w-xl mx-auto">
              Einmaliger Kauf, Credits verfallen nicht.{' '}
              {tool.creditsPerRun && <span>{tool.creditsPerRun} Credits pro Run.</span>}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className={`relative bg-bg-primary border rounded-lg p-6 flex flex-col ${
                  pkg.featured ? 'border-[#e0a458]/40' : 'border-white/8'
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-black bg-[#e0a458] px-2.5 py-1 rounded">
                    Beliebt
                  </span>
                )}
                <div className="text-center flex-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-text-primary/50 mb-1">
                    {pkg.name}
                  </div>
                  <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                  <div className="text-sm text-text-primary/60 mb-2">{pkg.credits} Credits</div>
                  {pkg.bonusPct > 0 && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                      +{pkg.bonusPct}% Bonus
                    </div>
                  )}
                  <div className="text-xs text-text-primary/40 font-mono">{pkg.runsHint}</div>
                </div>
                {!isComingSoon && (
                  <button
                    onClick={() => openSignup(pkg.slug)}
                    className={`mt-5 w-full px-4 py-2.5 text-xs font-medium rounded transition ${
                      pkg.featured
                        ? 'bg-[#e0a458] text-black hover:bg-[#e6b170]'
                        : 'border border-white/15 text-text-primary hover:border-white/35'
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
        <section className="border-t border-white/5 py-14">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">
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
      <section className="border-t border-white/5 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          {isComingSoon ? (
            <>
              <Lock size={24} className="mx-auto text-text-primary/40 mb-4" />
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
                Noch nicht verfügbar
              </h2>
              <p className="text-text-primary/55 mb-6 leading-relaxed text-sm">
                Buche einen Audit-Call und kriege Wait-List-Zugang plus Early-Adopter-Bonus
                wenn das Tool live geht.
              </p>
              <a
                href="#/audit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
              >
                Audit-Call buchen <ArrowRight size={14} />
              </a>
            </>
          ) : (
            <>
              <Sparkles size={24} className="mx-auto text-[#e0a458] mb-4" />
              <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
                Bereit für deinen ersten Run?
              </h2>
              <p className="text-text-primary/55 mb-6 leading-relaxed text-sm">
                Account in 60 Sekunden. Credits verfallen nicht. Kein Abo.
              </p>
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
              >
                Account anlegen + {tool.name} nutzen <ArrowRight size={14} />
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
