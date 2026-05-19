import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Monitor, EyeOff, Smartphone, Check,
  BarChart3, Sparkles, FileBarChart, Plug, Bell,
  Layers, Zap, Search, ArrowRight
} from 'lucide-react'

/* ─── easing tokens ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── reusable anim wrapper ─── */
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
   SECTION 1 — HERO
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '65vh',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Amber glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(245,158,11,0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 w-full">
        <motion.p
          className="font-mono text-xs tracking-[0.08em] mb-4"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Services / Dashboard
        </motion.p>

        <motion.p
          className="section-label mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Real-Time Intelligence
        </motion.p>

        <motion.h1
          className="font-display font-light tracking-tight mb-6"
          style={{
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeStandard }}
        >
          Command Center <br />
          <span style={{ color: 'var(--accent-primary)' }}>Dashboard</span>
        </motion.h1>

        <motion.p
          className="font-body text-lg max-w-[600px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          All KPIs in one place. AI-powered insights. Automatic reports. Mobile-first.
        </motion.p>

        <motion.div
          className="font-mono text-lg mb-8"
          style={{ color: 'var(--accent-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          EUR 1,999 setup + EUR 299/mo
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link to="/contact" className="btn-primary">
            Live Demo in 15 Minutes
          </Link>
          <Link to="/" className="btn-secondary">
            All Services
          </Link>
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
    icon: Monitor,
    title: '10+ Tools Daily',
    body: 'CRM, analytics, email, invoicing, support tickets — all in different tabs. No overview.',
    stat: '47 Min',
    statLabel: 'per day switching tools',
  },
  {
    icon: EyeOff,
    title: 'No Real-Time Insights',
    body: 'Decisions on outdated data. Monthly reports arrive too late.',
    stat: '3-5 Days',
    statLabel: 'to create a report',
  },
  {
    icon: Smartphone,
    title: 'Not Mobile',
    body: 'Key numbers only on desktop. No control on the go.',
    stat: '60%',
    statLabel: 'of decision makers work mobile',
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
            CEOs open 10+ tools daily.
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
                  background: 'var(--bg-elevated)',
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
   SECTION 3 — SOLUTION (with mockup)
   ═══════════════════════════════════════════ */
const solutionChecks = [
  'All KPIs in real-time',
  'AI recommendations',
  'Automatic reports',
  'Mobile-optimized',
]

function SolutionSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <FadeIn direction="left">
          <p className="section-label mb-3">The Solution</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-6"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            One Dashboard. All Data.
          </h2>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Your command center connects all data sources in one interface. AI analyzes
            trends in real-time. Automatic reports. Fully mobile.
          </p>
          <ul className="space-y-3">
            {solutionChecks.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  size={20}
                  style={{ color: 'var(--success)' }}
                  className="shrink-0 mt-0.5"
                />
                <span
                  className="font-body text-base"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </FadeIn>

        {/* Right — dashboard mockup */}
        <FadeIn direction="right" delay={0.2}>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
              aspectRatio: '16 / 10',
            }}
          >
            {/* Top bar */}
            <div
              className="flex items-center px-4 gap-2"
              style={{
                height: 36,
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
            </div>

            {/* Content area */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {/* 4 stat cards */}
              {[['Revenue', '47.2K', '+12%'], ['Leads', '328', '+8%'], ['Conversion', '4.2%', '+0.3%'], ['Costs', '12.1K', '-5%']].map(
                ([label, value, change]) => (
                  <div
                    key={label}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div
                      className="font-mono text-[10px] uppercase mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {label}
                    </div>
                    <div
                      className="font-mono text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {value}
                    </div>
                    <div
                      className="font-mono text-[10px]"
                      style={{
                        color: (change as string).startsWith('+')
                          ? 'var(--success)'
                          : 'var(--danger)',
                      }}
                    >
                      {change}
                    </div>
                  </div>
                )
              )}

              {/* Chart area */}
              <div
                className="col-span-4 rounded-lg p-4 mt-2 relative"
                style={{
                  background: 'var(--bg-primary)',
                  height: 100,
                }}
              >
                <div
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Revenue Trend
                </div>
                {/* Stylized line chart */}
                <svg viewBox="0 0 300 50" className="w-full h-[40px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 Q30,38 60,32 T120,28 T180,20 T240,15 T300,8"
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,40 Q30,38 60,32 T120,28 T180,20 T240,15 T300,8 L300,50 L0,50 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Grid lines */}
                  {[0, 25, 50].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="300"
                      y2={y}
                      stroke="var(--border-primary)"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
              </div>

              {/* Bottom panels */}
              <div
                className="col-span-2 rounded-lg p-3 mt-1"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  AI Insights
                </div>
                {['Revenue up 12% vs last week', 'Lead quality improving', 'Consider increasing ad spend'].map(
                  (insight) => (
                    <div
                      key={insight}
                      className="flex items-start gap-2 mb-1.5"
                    >
                      <div
                        className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                        style={{ background: 'var(--accent-primary)' }}
                      />
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {insight}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div
                className="col-span-2 rounded-lg p-3 mt-1"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Recent Activity
                </div>
                {['New lead: Acme Corp', 'Payment received: 2.4K', 'Report generated'].map(
                  (act) => (
                    <div
                      key={act}
                      className="font-mono text-[10px] mb-1.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {act}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 4 — FEATURES (3x2 grid)
   ═══════════════════════════════════════════ */
const features = [
  {
    icon: BarChart3,
    title: 'Real-Time KPIs',
    body: 'All metrics live. Revenue, leads, conversions, costs — in real-time.',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    body: 'AI detects trends and anomalies. Actionable recommendations instead of just data.',
  },
  {
    icon: FileBarChart,
    title: 'Auto Reports',
    body: 'Daily, weekly, monthly reports — automatically via email.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    body: 'Fully functional on all devices. Always informed on the go.',
  },
  {
    icon: Plug,
    title: 'Data Sources',
    body: 'Connect to CRM, shop, ads, support. All data flows together.',
  },
  {
    icon: Bell,
    title: 'Alerts',
    body: 'Smart alerts for deviations. Never miss an issue again.',
  },
]

function FeaturesSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">Features</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            What you get.
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                className="rounded-xl p-8"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                }}
                variants={itemUp}
              >
                <Icon size={28} style={{ color: 'var(--accent-primary)' }} className="mb-4" />
                <h4
                  className="font-body text-lg font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.title}
                </h4>
                <p
                  className="font-body text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
                >
                  {f.body}
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
   SECTION 5 — TECH STACK
   ═══════════════════════════════════════════ */
const techStack = [
  { name: 'React/Next.js', tag: 'Frontend' },
  { name: 'Supabase', tag: 'Realtime Data' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'OpenRouter', tag: 'AI Analysis' },
  { name: 'Chart.js', tag: 'Visualizations' },
  { name: 'Hetzner', tag: 'Hosting' },
]

function TechStackSection() {
  return (
    <section className="py-[100px]" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Tech Stack</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            The technology behind it.
          </h2>
        </FadeIn>

        <Stagger className="flex flex-wrap justify-center gap-4 relative" staggerDelay={0.1}>
          <div
            className="absolute top-1/2 left-[10%] right-[10%] h-[1px] -translate-y-1/2 hidden lg:block"
            style={{ background: 'var(--border-accent)' }}
          />
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              className="relative z-10 rounded-lg px-6 py-4 text-center min-w-[130px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
              }}
              variants={itemScale}
            >
              <div
                className="font-mono text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {tech.name}
              </div>
              <div
                className="font-mono text-[11px] mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {tech.tag}
              </div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 6 — PRICING
   ═══════════════════════════════════════════ */
const includedItems = [
  'Real-time dashboard',
  'AI insights',
  'Automatic reports',
  'Mobile optimization',
  'Up to 10 data sources',
  'Email alerts',
]

function PricingSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[700px] mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Pricing</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Transparent. Fair.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="rounded-xl p-12"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 0 60px rgba(245,158,11,0.08)',
            }}
          >
            <h3
              className="font-body text-2xl font-medium mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Command Center Dashboard
            </h3>

            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2 mb-6">
              <span
                className="font-display text-[48px] font-light"
                style={{ color: 'var(--accent-primary)', lineHeight: 1 }}
              >
                EUR 1,999
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                Setup
              </span>
              <span className="font-body text-lg" style={{ color: 'var(--text-muted)' }}>
                +
              </span>
              <span
                className="font-display text-[36px] font-light"
                style={{ color: 'var(--text-primary)', lineHeight: 1 }}
              >
                EUR 299
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                /mo
              </span>
            </div>

            <div className="h-[1px] w-full my-6" style={{ background: 'var(--border-primary)' }} />

            <ul className="space-y-3 mb-8">
              {includedItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} style={{ color: 'var(--success)' }} className="shrink-0" />
                  <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link to="/contact" className="btn-primary w-full block text-center mb-3">
              Book Demo
            </Link>
            <p className="font-mono text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              No hidden costs. Cancel monthly.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 7 — CTA
   ═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="py-[100px]" style={{ background: 'var(--bg-accent-wash)' }}>
      <div className="max-w-[700px] mx-auto px-6 text-center">
        <FadeIn>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Your dashboard in 15 minutes.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            We&apos;ll show you live what your command center could look like.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <Link to="/contact" className="btn-primary inline-block">
            Start Live Demo
          </Link>
          <p className="font-mono text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Free. Response in 24 hours.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 8 — CROSS-SELL
   ═══════════════════════════════════════════ */
const relatedServices = [
  {
    name: 'AI Lead Engine',
    path: '/services/ai-lead-engine',
    icon: Zap,
    desc: '24/7 autonomous lead generation and qualification system.',
    price: 'EUR 1,499 + EUR 499/mo',
  },
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'The complete operating system for your business.',
    price: 'EUR 4,999 + EUR 999/mo',
  },
  {
    name: 'Automation Audit',
    path: '/services/automation-audit',
    icon: Search,
    desc: '48-hour process analysis with top-3 quick wins identified.',
    price: 'EUR 1,299 one-time',
  },
]

function CrossSellSection() {
  return (
    <section className="py-[80px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn className="mb-10">
          <p className="section-label mb-3">More Services</p>
          <h2
            className="font-display text-[clamp(28px,3vw,48px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Goes well with this.
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {relatedServices.map((svc) => {
            const Icon = svc.icon
            return (
              <motion.div key={svc.name} variants={itemUp}>
                <Link
                  to={svc.path}
                  className="block rounded-xl p-7 transition-all duration-300 group"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-accent)'
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow =
                      '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-primary)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <Icon size={28} style={{ color: 'var(--accent-primary)' }} className="mb-4" />
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
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {svc.price}
                    </span>
                    <ArrowRight
                      size={16}
                      style={{ color: 'var(--text-muted)' }}
                      className="transition-colors duration-200 group-hover:text-[var(--accent-primary)]"
                    />
                  </div>
                </Link>
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
export default function CommandCenter() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <TechStackSection />
      <PricingSection />
      <CTASection />
      <CrossSellSection />
    </>
  )
}
