import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Search, Bot, Plug, Activity, TrendingUp, Users,
  Puzzle, Clock, ShieldAlert, Check, ArrowRight,
  MessageCircle, Phone, Zap, BarChart3, FileText,
  Globe, Layers,
} from 'lucide-react'
import CONTACT from '../../config/contact'

/* ─── easing tokens ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── reusable FadeIn wrapper ─── */
function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.7,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right'
  duration?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const initial =
    direction === 'up'
      ? { opacity: 0, y: 40 }
      : direction === 'left'
        ? { opacity: 0, x: -30 }
        : { opacity: 0, x: 30 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay, ease: easeStandard }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stagger container ─── */
function Stagger({
  children,
  className = '',
  staggerDelay = 0.08,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

const itemUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeStandard } },
}

const itemScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeSpring } },
}

/* ═══════════════════════════════════════════
   SECTION 1 — HERO (FLAGSHIP)
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: '80vh', background: 'var(--bg-primary)' }}
    >
      {/* Amber accent line */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(245,158,11,0.12) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 w-full">
        <motion.p
          className="font-mono text-xs tracking-[0.08em] mb-4"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeStandard }}
        >
          Services / Automation
        </motion.p>

        <motion.p
          className="font-mono text-xs uppercase tracking-[0.08em] mb-6"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeStandard }}
        >
          03 / EVOLVING AI AUTOMATIONS &mdash; FLAGSHIP SERVICE
        </motion.p>

        <motion.h1
          className="font-display font-light tracking-tight mb-6"
          style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: easeStandard }}
        >
          Your Business,
          <br />
          <span style={{ color: 'var(--accent-amber)' }}>on Autopilot.</span>
        </motion.h1>

        <motion.p
          className="font-body text-lg max-w-[600px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeStandard }}
        >
          End-to-end automation systems that learn, adapt, and improve.
          This is not a chatbot. This is an operating system.
        </motion.p>

        <motion.div
          className="font-mono text-lg mb-8"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeStandard }}
        >
          FROM &euro;10,000 + &euro;1,500/MO
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeStandard }}
        >
          <a href="#/services/automation-audit"
            className="inline-flex items-center justify-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--accent-amber)',
              color: 'var(--bg-primary)',
              padding: '16px 36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D97706'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F59E0B'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Audit Your Workflows
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'transparent',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '16px 36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-amber)'
              e.currentTarget.style.color = 'var(--accent-amber)'
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Book a Call
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 2 — PROBLEM
   ═══════════════════════════════════════════ */
const problemCards = [
  {
    icon: Puzzle,
    title: 'Fragmented Tools',
    body: 'CRM, email, invoicing, chat — all separate. No overview, duplicate data, manual processes between systems.',
    stat: '40%',
    statLabel: 'of work time on admin tasks',
  },
  {
    icon: Clock,
    title: 'Manual Handoffs',
    body: 'Every step requires a human to move data, send emails, update records. Slow, error-prone, unscalable.',
    stat: '70%',
    statLabel: 'of sales time spent on admin',
  },
  {
    icon: ShieldAlert,
    title: 'No System Thinking',
    body: 'Point solutions solve isolated problems. No end-to-end architecture. No feedback loops. No improvement.',
    stat: '0%',
    statLabel: 'processes continuously improve',
  },
]

function ProblemSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">The Problem</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Fragmented Tools.
            <br />
            Manual Handoffs.
            <br />
            No System Thinking.
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
          {problemCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                className="rounded-xl p-9"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
                variants={itemUp}
              >
                <Icon size={32} style={{ color: 'var(--danger)' }} className="mb-4" />
                <h3
                  className="font-body text-xl font-medium mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {card.title}
                </h3>
                <p
                  className="font-body text-sm mb-6"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
                >
                  {card.body}
                </p>
                <div
                  className="font-display text-[40px] font-light"
                  style={{ color: 'var(--danger)', lineHeight: 1 }}
                >
                  {card.stat}
                </div>
                <p
                  className="font-mono text-xs mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {card.statLabel}
                </p>
              </motion.div>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 3 — WHAT YOU GET
   ═══════════════════════════════════════════ */
const deliverables = [
  {
    icon: Search,
    title: 'Workflow Audit',
    desc: 'Deep-dive analysis of your current processes. Every bottleneck mapped.',
  },
  {
    icon: Bot,
    title: 'Custom Agent Design',
    desc: 'AI agents built for your specific workflows — not off-the-shelf.',
  },
  {
    icon: Plug,
    title: 'Full Integration',
    desc: 'Connect to your existing tools: CRM, ERP, email, calendar, databases.',
  },
  {
    icon: Activity,
    title: 'Monitoring & Alerts',
    desc: 'Real-time system health dashboards. Know before anything breaks.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Optimization',
    desc: 'The system improves month over month. We tune, you scale.',
  },
  {
    icon: Users,
    title: 'Human Handoff',
    desc: 'Seamless escalation paths. AI handles 80%, your team handles the rest.',
  },
]

function WhatYouGetSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">What You Get</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            WHAT YOU GET
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {deliverables.map((d) => {
            const Icon = d.icon
            return (
              <motion.div
                key={d.title}
                className="rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                variants={itemUp}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <Icon size={24} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <h3
                  className="font-body font-medium text-xl mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {d.title}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {d.desc}
                </p>
              </motion.div>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 4 — USE CASES (4 cards)
   ═══════════════════════════════════════════ */
const useCases = [
  {
    icon: Zap,
    title: 'Sales Support Agent',
    desc: 'Qualifies leads, answers objections, books meetings. Works 24/7. Never misses a follow-up.',
  },
  {
    icon: Users,
    title: 'Onboarding Agent',
    desc: 'Guides new customers through setup, reduces churn, improves NPS. Fully automated journey.',
  },
  {
    icon: Activity,
    title: 'Support Agent',
    desc: 'Handles tier-1 support, routes complex issues, learns from every ticket. Scales infinitely.',
  },
  {
    icon: Search,
    title: 'Recruiting Agent',
    desc: 'Sources candidates, screens resumes, schedules interviews. Your HR team&apos;s new best friend.',
  },
]

function UseCasesSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">Where We Deploy</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            WHERE WE DEPLOY
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.12}>
          {useCases.map((uc) => {
            const Icon = uc.icon
            return (
              <motion.div
                key={uc.title}
                className="rounded-xl p-10 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeStandard } },
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <Icon size={28} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <h3
                  className="font-body font-medium text-2xl mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {uc.title}
                </h3>
                <p
                  className="font-body text-base leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: uc.desc }}
                />
              </motion.div>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 5 — PROCESS TIMELINE
   ═══════════════════════════════════════════ */
const timelineSteps = [
  {
    num: '01',
    title: 'Workflow Audit & Mapping',
    timeline: 'Week 1–2',
    desc: 'Deep-dive into your current processes. We map every workflow, identify bottlenecks, and document integration points.',
  },
  {
    num: '02',
    title: 'System Architecture',
    timeline: 'Week 3',
    desc: 'Design the full automation architecture. Agent roles, data flows, escalation rules, and integration map.',
  },
  {
    num: '03',
    title: 'Build & Integrate',
    timeline: 'Weeks 4–7',
    desc: 'Develop the agents, wire up integrations, train the models, and run end-to-end testing.',
  },
  {
    num: '04',
    title: 'Launch & Optimize',
    timeline: 'Week 8+',
    desc: 'Go live with monitoring. We tune performance, refine handoffs, and begin continuous optimization.',
  },
]

function ProcessSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">Process</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            HOW WE BUILD
          </h2>
        </FadeIn>

        <Stagger className="relative" staggerDelay={0.12}>
          {/* Vertical connecting line */}
          <div
            className="absolute left-[27px] top-0 bottom-0 w-[2px] hidden md:block"
            style={{ background: 'var(--border-accent)' }}
          />

          <div className="space-y-8">
            {timelineSteps.map((step) => (
              <motion.div
                key={step.num}
                className="relative flex flex-col md:flex-row md:items-start gap-6 md:pl-20"
                variants={itemUp}
              >
                {/* Timeline dot */}
                <div
                  className="hidden md:flex absolute left-0 top-0 w-[56px] h-[56px] rounded-lg items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent-amber)' }}>
                    {step.num}
                  </span>
                </div>

                {/* Mobile number badge */}
                <div
                  className="md:hidden w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent-amber)' }}>
                    {step.num}
                  </span>
                </div>

                <div
                  className="flex-1 rounded-xl p-8"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3
                      className="font-body text-xl font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {step.title}
                    </h3>
                    <span
                      className="font-mono text-xs uppercase tracking-[0.08em] px-3 py-1 rounded"
                      style={{
                        color: 'var(--accent-amber)',
                        border: '1px solid var(--border-accent)',
                        background: 'rgba(245,158,11,0.05)',
                      }}
                    >
                      {step.timeline}
                    </span>
                  </div>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 6 — PRICING (Two-Tier)
   ═══════════════════════════════════════════ */
const coreFeatures = [
  'Full system build, integration, training, and launch',
  'Custom AI agent design',
  'CRM, ERP, and tool integrations',
  '6–8 weeks delivery',
]

const growthFeatures = [
  'Ongoing monitoring, optimization, and support',
  'Continuous agent improvement',
  'Monthly performance reports',
  'Priority support & maintenance',
]

function PricingSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Pricing</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Investment
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto" staggerDelay={0.15}>
          {/* Tier 1 — Build */}
          <motion.div
            variants={itemScale}
            className="rounded-xl p-10"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 0 60px rgba(245,158,11,0.08)',
            }}
          >
            <h3
              className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--accent-amber)' }}
            >
              Build
            </h3>
            <div
              className="font-display font-light mb-2"
              style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}
            >
              &euro;10,000 &ndash; &euro;50,000
            </div>
            <p
              className="font-body text-sm mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              One-time project fee
            </p>

            <ul className="space-y-3 mb-10">
              {coreFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-body text-sm py-2"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#/services/automation-audit"
              className="block text-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: 'var(--bg-primary)',
                padding: '16px 36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D97706'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Start Building &rarr;
            </a>
          </motion.div>

          {/* Tier 2 — Run */}
          <motion.div
            variants={itemScale}
            className="rounded-xl p-10"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3
              className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Run
            </h3>
            <div
              className="font-display font-light mb-2"
              style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}
            >
              &euro;1,500 &ndash; &euro;5,000<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <p
              className="font-body text-sm mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Monthly retainer
            </p>

            <ul className="space-y-3 mb-10">
              {growthFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-body text-sm py-2"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#/services/automation-audit"
              className="block text-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '16px 36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-amber)'
                e.currentTarget.style.color = 'var(--accent-amber)'
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Start Running &rarr;
            </a>
          </motion.div>
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 7 — CTA
   ═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section
      className="py-[140px]"
      style={{ background: 'var(--bg-accent-wash)' }}
    >
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <FadeIn>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            The best time to automate was yesterday.
            <br />
            The second best time is now.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            className="font-body text-lg mb-10"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            End-to-end automation that learns, adapts, and improves.
            Your business, on autopilot.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: 'var(--bg-primary)',
                padding: '16px 36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D97706'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '16px 36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-amber)'
                e.currentTarget.style.color = 'var(--accent-amber)'
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Phone size={18} /> Book a Call
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.6}>
          <p
            className="font-mono text-xs mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Call {CONTACT.phone}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 8 — CROSS-SELL / RELATED SERVICES
   ═══════════════════════════════════════════ */
const relatedServices = [
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'Complete operating system for your business. 13 integrated services.',
    price: 'EUR 4,999 + EUR 999/mo',
  },
  {
    name: 'AI Lead Engine',
    path: '/services/ai-lead-engine',
    icon: Zap,
    desc: '24/7 autonomous lead generation and qualification system.',
    price: 'EUR 1,499 + EUR 499/mo',
  },
  {
    name: 'AI Content Engine',
    path: '/services/ai-content-engine',
    icon: FileText,
    desc: 'Autonomous AI content factory. Blog, social media, SEO.',
    price: 'EUR 499 + EUR 499/mo',
  },
]

function CrossSellSection() {
  return (
    <section className="py-[80px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn className="mb-10">
          <p className="section-label mb-3">Related Services</p>
          <h2
            className="font-display text-[clamp(28px,3vw,48px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            You might also like
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {relatedServices.map((svc) => {
            const Icon = svc.icon
            return (
              <motion.div key={svc.name} variants={itemUp}>
                <a
                  href={"#" + svc.path}
                  className="block rounded-xl p-7 transition-all duration-300 group"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-accent)'
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-subtle)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <Icon
                    size={28}
                    style={{ color: 'var(--accent-amber)' }}
                    className="mb-4"
                  />
                  <h3
                    className="font-body text-lg font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {svc.name}
                  </h3>
                  <p
                    className="font-body text-sm mb-4"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
                  >
                    {svc.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-sm"
                      style={{ color: 'var(--accent-amber)' }}
                    >
                      {svc.price}
                    </span>
                    <ArrowRight
                      size={16}
                      style={{ color: 'var(--text-muted)' }}
                      className="transition-colors duration-200 group-hover:text-[var(--accent-amber)]"
                    />
                  </div>
                </a>
              </motion.div>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function AIAutomation() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <WhatYouGetSection />
      <UseCasesSection />
      <ProcessSection />
      <PricingSection />
      <CTASection />
      <CrossSellSection />
    </>
  )
}
