import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Puzzle, Clock, ShieldAlert, Check,
  Users, Route, Workflow, Database,
  CreditCard, Server, LayoutDashboard, Zap,
  Search, BarChart3, FileText, ArrowRight
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
        minHeight: '70vh',
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
          Services / Platform
        </motion.p>

        <motion.p
          className="section-label mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Flagship Service
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
          lennoxOS <br />
          <span style={{ color: 'var(--accent-amber)' }}>Business Operating System</span>
        </motion.h1>

        <motion.p
          className="font-body text-lg max-w-[600px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          The complete operating system for your business. 13 integrated services. One
          infrastructure. Zero compromise.
        </motion.p>

        <motion.div
          className="font-mono text-lg mb-8"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          EUR 4,999 setup + EUR 999/mo
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a href="#/contact" className="btn-primary">
            Book Demo
          </a>
          <a href="#/" className="btn-secondary">
            All Services
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
    title: '10+ Disconnected Tools',
    body: 'CRM, email, Excel, invoicing tools, chat — all separate. No overview, duplicate data, manual processes.',
    stat: '40%',
    statLabel: 'of work time spent on admin',
  },
  {
    icon: Clock,
    title: 'No Automation',
    body: 'Repetitive tasks eat time. Follow-ups forgotten. Leads lost. Scaling impossible.',
    stat: '70%',
    statLabel: 'of sales time on admin',
  },
  {
    icon: ShieldAlert,
    title: 'No Control',
    body: 'SaaS subscriptions everywhere. Data with third parties. No own infrastructure. Dependence on Big Tech.',
    stat: '2,000+',
    statLabel: '/month for separate SaaS tools',
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
            Disconnected Tools. Wasted Time. No Control.
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
   SECTION 3 — SOLUTION
   ═══════════════════════════════════════════ */
const solutionChecks = [
  'Self-hosted on enterprise hardware',
  'Multi-agent system (not just one AI tool)',
  '200+ automated workflows',
  '24/7 operation, no SaaS lock-in',
]

const stackNodes = [
  { label: 'Paperclip', sub: 'Multi-Agent', pos: 'top' },
  { label: 'OpenRouter', sub: 'AI Models', pos: 'top-right' },
  { label: 'n8n', sub: 'Workflows', pos: 'bottom-right' },
  { label: 'Supabase', sub: 'Backend', pos: 'bottom' },
  { label: 'Stripe', sub: 'Payments', pos: 'bottom-left' },
  { label: 'Hetzner', sub: 'Hardware', pos: 'top-left' },
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
            One System. Everything Connected.
          </h2>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            lennoxOS unifies 13 services in one self-hosted infrastructure. Paperclip
            multi-agent orchestration. OpenRouter for AI models. n8n for automation.
            Supabase as backend. Stripe for payments. All on Hetzner enterprise hardware —
            24/7.
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

        {/* Right — diagram */}
        <FadeIn direction="right" delay={0.2}>
          <div
            className="relative rounded-xl p-8"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              aspectRatio: '1 / 1',
            }}
          >
            {/* Central hub */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-6 py-4 z-10"
              style={{
                background: 'var(--bg-surface)',
                border: '2px solid var(--accent-amber)',
                boxShadow: '0 0 30px var(--accent-glow)',
              }}
            >
              <span
                className="font-mono text-sm font-medium"
                style={{ color: 'var(--accent-amber)' }}
              >
                lennoxOS
              </span>
            </div>

            {/* Orbital nodes */}
            {stackNodes.map((node, i) => {
              const angle = (i * 60 * Math.PI) / 180
              const radius = 38 // % from center
              const x = 50 + radius * Math.cos(angle - Math.PI / 2)
              const y = 50 + radius * Math.sin(angle - Math.PI / 2)
              return (
                <div
                  key={node.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-center"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    className="font-mono text-xs font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {node.label}
                  </div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {node.sub}
                  </div>
                </div>
              )
            })}

            {/* Connecting dashed ring */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: '76%',
                height: '76%',
                border: '1px dashed var(--border-accent)',
              }}
            />
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
    icon: Users,
    title: 'Multi-Agent Orchestration',
    body: 'Paperclip controls 31k+ GitHub stars. Multiple AI agents work together, not against each other.',
  },
  {
    icon: Route,
    title: 'AI Model Routing',
    body: 'OpenRouter automatically selects the best AI model. Claude, GPT-4, Gemini — depending on the task.',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    body: '200+ n8n workflows. From lead qualification to invoicing — all automatic.',
  },
  {
    icon: Database,
    title: 'PostgreSQL Backend',
    body: 'Supabase provides auth, realtime, storage. Your data. Your control.',
  },
  {
    icon: CreditCard,
    title: 'Payment Integration',
    body: 'Stripe for recurring payments, one-time charges, subscriptions. Automated.',
  },
  {
    icon: Server,
    title: 'Enterprise Hardware',
    body: 'Hetzner CPX41. 24/7 uptime. No shared hosting issues. Your own infrastructure.',
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                variants={itemUp}
              >
                <Icon size={28} style={{ color: 'var(--accent-amber)' }} className="mb-4" />
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
  { name: 'Paperclip', tag: '31k+ Stars' },
  { name: 'OpenRouter', tag: 'AI Routing' },
  { name: 'n8n', tag: '200+ Workflows' },
  { name: 'Supabase', tag: 'PostgreSQL' },
  { name: 'Stripe', tag: 'Payments' },
  { name: 'Hetzner', tag: 'CPX41 24/7' },
]

function TechStackSection() {
  return (
    <section className="py-[100px]" style={{ background: 'var(--bg-surface)' }}>
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

        <Stagger
          className="flex flex-wrap justify-center gap-4 relative"
          staggerDelay={0.1}
        >
          {/* Connecting line behind */}
          <div
            className="absolute top-1/2 left-[10%] right-[10%] h-[1px] -translate-y-1/2 hidden lg:block"
            style={{ background: 'var(--border-accent)' }}
          />

          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              className="relative z-10 rounded-lg px-6 py-4 text-center min-w-[130px]"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
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
  '13 integrated services',
  'Multi-agent orchestration',
  '200+ workflows',
  'Enterprise hardware 24/7',
  'Priority support',
  'Monthly updates',
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
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 0 60px rgba(245,158,11,0.08)',
            }}
          >
            <h3
              className="font-body text-2xl font-medium mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              lennoxOS Business Operating System
            </h3>

            {/* Price row */}
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2 mb-6">
              <span
                className="font-display text-[48px] font-light"
                style={{ color: 'var(--accent-amber)', lineHeight: 1 }}
              >
                EUR 4,999
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Setup
              </span>
              <span
                className="font-body text-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                +
              </span>
              <span
                className="font-display text-[36px] font-light"
                style={{ color: 'var(--text-primary)', lineHeight: 1 }}
              >
                EUR 999
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                /mo
              </span>
            </div>

            {/* Divider */}
            <div
              className="h-[1px] w-full my-6"
              style={{ background: 'var(--border-subtle)' }}
            />

            {/* Included list */}
            <ul className="space-y-3 mb-8">
              {includedItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} style={{ color: 'var(--success)' }} className="shrink-0" />
                  <span
                    className="font-body text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a href="#/contact" className="btn-primary w-full block text-center mb-3">
              Book Demo
            </a>
            <p
              className="font-mono text-xs text-center"
              style={{ color: 'var(--text-muted)' }}
            >
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
            Ready for the complete system?
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Book a free 20-minute demo. We&apos;ll show you lennoxOS live.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <a href="#/contact" className="btn-primary inline-block">
            Book Demo
          </a>
          <p
            className="font-mono text-xs mt-4"
            style={{ color: 'var(--text-muted)' }}
          >
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
    name: 'Command Center Dashboard',
    path: '/services/command-center',
    icon: LayoutDashboard,
    desc: 'Real-time CEO dashboard with AI insights and automatic reports.',
    price: 'EUR 1,999 + EUR 299/mo',
  },
  {
    name: 'AI Lead Engine',
    path: '/services/ai-lead-engine',
    icon: Zap,
    desc: '24/7 autonomous lead generation and qualification system.',
    price: 'EUR 1,499 + EUR 499/mo',
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
                    el.style.boxShadow =
                      '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
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
export default function BusinessOS() {
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
