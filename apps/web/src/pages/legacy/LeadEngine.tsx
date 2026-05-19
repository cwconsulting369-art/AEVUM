import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Clock, Filter, TrendingDown, Check,
  Globe, Target, Send, RefreshCw, Workflow, PieChart,
  Layers, LayoutDashboard, TrendingUp, ArrowRight
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
          Services / Lead Generation
        </motion.p>

        <motion.p
          className="section-label mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Autonomous Lead Gen
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
          AI Lead <br />
          <span style={{ color: 'var(--accent-amber)' }}>Engine</span>
        </motion.h1>

        <motion.p
          className="font-body text-lg max-w-[600px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          24/7 autonomous lead generation and qualification. More qualified leads. Less
          manual work.
        </motion.p>

        <motion.div
          className="font-mono text-lg mb-8"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          EUR 1,499 setup + EUR 499/mo
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a href="#/contact" className="btn-primary">
            10 Free Leads to Test
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
    icon: Clock,
    title: '20+ Hours/Week',
    body: 'Research, outreach, follow-ups, qualification — manual and repetitive.',
    stat: '20h+',
    statLabel: 'per week on lead gen',
  },
  {
    icon: Filter,
    title: 'Leads Get Lost',
    body: 'Fast response decides. After 5 minutes, chances drop 80%.',
    stat: '-80%',
    statLabel: 'contact chance after 5 min',
  },
  {
    icon: TrendingDown,
    title: 'Not Scalable',
    body: 'More leads = more staff. Linear relationship, no efficiency.',
    stat: '1:1',
    statLabel: 'leads to staff ratio',
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
            Manual lead generation eats 20+ hours per week.
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
   SECTION 3 — SOLUTION (with lead flow)
   ═══════════════════════════════════════════ */
const solutionChecks = [
  'Multi-agent research',
  'Automatic qualification',
  'CRM integration',
  'n8n workflow control',
]

const flowStages = [
  {
    num: '01',
    title: 'Research',
    body: 'AI agents find and analyze potential leads',
  },
  {
    num: '02',
    title: 'Qualification',
    body: 'Automatic scoring based on set criteria',
  },
  {
    num: '03',
    title: 'Contact',
    body: 'Personalized outreach via email, LinkedIn, etc.',
  },
  {
    num: '04',
    title: 'Handoff',
    body: 'Qualified lead lands in CRM',
  },
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
            24/7. Autonomous. Scalable.
          </h2>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Multiple AI agents research, qualify, and hand over leads — around the clock.
            No human delay. No lead is lost.
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

        {/* Right — lead flow diagram */}
        <Stagger className="flex flex-col gap-3" staggerDelay={0.15}>
          {flowStages.map((stage, idx) => (
            <div key={stage.num}>
              <motion.div
                className="flex items-center gap-4 rounded-xl px-6 py-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                variants={itemUp}
              >
                <span
                  className="font-mono text-lg font-medium shrink-0"
                  style={{ color: 'var(--accent-amber)', minWidth: 28 }}
                >
                  {stage.num}
                </span>
                <div>
                  <h4
                    className="font-body text-base font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stage.title}
                  </h4>
                  <p
                    className="font-body text-xs mt-0.5"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
                  >
                    {stage.body}
                  </p>
                </div>
              </motion.div>
              {idx < flowStages.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight
                    size={16}
                    className="rotate-90"
                    style={{ color: 'var(--accent-amber)' }}
                  />
                </div>
              )}
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 4 — FEATURES (3x2 grid)
   ═══════════════════════════════════════════ */
const features = [
  {
    icon: Globe,
    title: 'Multi-Agent Research',
    body: 'Agents search the web, social media, industry directories — continuously.',
  },
  {
    icon: Target,
    title: 'Smart Qualification',
    body: 'Scoring by budget, timeline, authority, need. Only hot leads.',
  },
  {
    icon: Send,
    title: 'Personalized Outreach',
    body: 'AI writes personalized messages based on profile and behavior.',
  },
  {
    icon: RefreshCw,
    title: 'CRM Sync',
    body: 'Automatic sync with your CRM. Every lead is trackable.',
  },
  {
    icon: Workflow,
    title: 'n8n Workflows',
    body: '200+ pre-built workflows. Customizable to your processes.',
  },
  {
    icon: PieChart,
    title: 'Reporting',
    body: 'Overview of generated leads, conversion rate, ROI.',
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
  { name: 'OpenRouter', tag: 'AI Agents' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'Supabase', tag: 'Lead DB' },
  { name: 'LinkedIn API', tag: 'Outreach' },
  { name: 'Hetzner', tag: '24/7' },
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
  'Multi-agent research',
  'Automatic qualification',
  'CRM integration',
  'Personalized outreach',
  '200+ n8n workflows',
  'Weekly reports',
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
              AI Lead Engine
            </h3>

            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2 mb-6">
              <span
                className="font-display text-[48px] font-light"
                style={{ color: 'var(--accent-amber)', lineHeight: 1 }}
              >
                EUR 1,499
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
                EUR 499
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                /mo
              </span>
            </div>

            <div className="h-[1px] w-full my-6" style={{ background: 'var(--border-subtle)' }} />

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

            <a href="#/contact" className="btn-primary w-full block text-center mb-3">
              10 Free Leads to Test
            </a>
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
            10 Leads. Free. To test.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            className="font-body text-lg mb-8"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            No credit card. No commitment. Results in 48 hours.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <a href="#/contact" className="btn-primary inline-block">
            Request Free Leads
          </a>
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
    name: 'Sales OS',
    path: '/services/sales-os',
    icon: TrendingUp,
    desc: 'Complete sales operating system for your team.',
    price: 'EUR 2,499 + EUR 399/mo',
  },
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'The complete operating system for your business.',
    price: 'EUR 4,999 + EUR 999/mo',
  },
  {
    name: 'Command Center',
    path: '/services/command-center',
    icon: LayoutDashboard,
    desc: 'Real-time CEO dashboard with AI insights.',
    price: 'EUR 1,999 + EUR 299/mo',
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
                  <Icon size={28} style={{ color: 'var(--accent-amber)' }} className="mb-4" />
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
export default function LeadEngine() {
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
