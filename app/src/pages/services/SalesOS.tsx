import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  FileText,
  GitBranch,
  FolderOpen,
  Kanban,
  Users,
  Files,
  Repeat,
  BarChart3,
  Plug,
  Check,
  ArrowRight,
  Layers,
  LayoutDashboard,
  Zap,
  TrendingUp,
  ShoppingCart,
  Bot,
  Search,
  Globe,
  Database,
  FileText as FileTextIcon,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

/* ─────────────── Section 1: Hero ─────────────── */
function Hero() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '65vh', backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Amber accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }} />

      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="max-w-3xl"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Services</Link>
            <span>/</span>
            <span style={{ color: 'var(--accent-primary)' }}>Sales OS</span>
          </div>

          {/* Label */}
          <div className="section-label mb-4">UtilityHub Edition</div>

          {/* Headline */}
          <h1 className="font-display font-light tracking-tight" style={{ fontSize: 'clamp(48px, 6vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Sales<span className="text-[var(--accent-primary)]">OS</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg mt-6 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Complete sales operating system. Pipeline, customer portal, documents, follow-ups, reporting. All in one.
          </p>

          {/* Price + CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10">
            <div className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-[var(--accent-primary)] font-medium" style={{ fontSize: '18px' }}>€2,499</span>
              {' '}Setup +{' '}
              <span className="text-[var(--accent-primary)] font-medium" style={{ fontSize: '18px' }}>€399</span>
              /month
            </div>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              14 Days Free Trial
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative glow */}
      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }}
      />
    </section>
  )
}

/* ─────────────── Section 2: Problem ─────────────── */
const problemCards = [
  {
    icon: FileText,
    title: '70% Admin',
    body: 'Writing quotes, follow-ups, documents, appointments — instead of selling.',
    stat: '70%',
    statLabel: 'of time on admin',
  },
  {
    icon: GitBranch,
    title: 'No Overview',
    body: 'Deals scattered in emails, notes, Excel. No clear pipeline.',
    stat: '50%',
    statLabel: 'of deals get tracked',
  },
  {
    icon: FolderOpen,
    title: 'Document Chaos',
    body: 'Quotes, contracts, invoices — everywhere and nowhere. Versions mixed up.',
    stat: '3.2h',
    statLabel: 'per day searching docs',
  },
]

function Problem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-[140px] md:py-[180px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-16"
        >
          <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Sales admin eats <span className="text-[var(--accent-primary)]">70%</span> of sales time.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {problemCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                variants={staggerItem}
                className="rounded-xl border p-9 transition-all duration-300 group"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
                whileHover={{
                  borderColor: 'var(--border-accent)',
                  y: -6,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.25)',
                }}
              >
                <Icon size={32} style={{ color: 'var(--danger)' }} />
                <h3 className="font-body text-xl font-medium mt-5 mb-3" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="font-body text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {card.body}
                </p>
                <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <div className="font-display text-[clamp(40px,5vw,56px)] font-light" style={{ color: 'var(--danger)', lineHeight: 1 }}>
                    {card.stat}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.08em] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {card.statLabel}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 3: Solution ─────────────── */
const solutionChecks = [
  'Visual sales pipeline',
  'Customer portal with documents',
  'Automatic follow-ups',
  'Sales reporting',
]

const pipelineColumns = [
  { name: 'Lead', cards: ['Acme Corp', 'TechStart GmbH'] },
  { name: 'Qualified', cards: ['GreenEnergy Ltd'] },
  { name: 'Proposal', cards: ['PowerGrid AG', 'SolarMax Inc'] },
  { name: 'Closed', cards: ['EnergiePlus GmbH'], closed: true },
]

function Solution() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-[140px] md:py-[180px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div className="section-label mb-4">The Solution</div>
            <h2 className="font-display text-[clamp(32px,4vw,56px)] font-normal mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
              Sell instead of administrating.
            </h2>
            <p className="font-body text-lg mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Sales OS automates the complete sales process. From first inquiry to closing. Pipeline, portal, documents — all connected.
            </p>
            <ul className="flex flex-col gap-4">
              {solutionChecks.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check size={12} style={{ color: 'var(--success)' }} />
                  </div>
                  <span className="font-body text-base" style={{ color: 'var(--text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Pipeline Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div
              className="rounded-xl border p-6 overflow-x-auto"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex gap-3 min-w-[400px]">
                {pipelineColumns.map((col) => (
                  <div
                    key={col.name}
                    className="flex-1 rounded-lg p-3"
                    style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
                  >
                    <div
                      className="font-mono text-[11px] uppercase tracking-[0.08em] mb-3 px-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {col.name}
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.cards.map((card, i) => (
                        <motion.div
                          key={card}
                          initial={{ opacity: 0, y: 10 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                          className="rounded-md px-3 py-2 border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-primary)',
                            borderLeft: col.closed ? '2px solid var(--success)' : '1px solid var(--border-primary)',
                          }}
                        >
                          <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {card}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Section 4: Features ─────────────── */
const features = [
  { icon: Kanban, title: 'Sales Pipeline', desc: 'Visual pipeline with drag & drop. Every deal at a glance.' },
  { icon: Users, title: 'Customer Portal', desc: 'Your customers see quotes, contracts, invoices — all digital.' },
  { icon: Files, title: 'Document Management', desc: 'Quotes, contracts, invoices — automatically generated and versioned.' },
  { icon: Repeat, title: 'Auto Follow-ups', desc: 'Automated follow-up sequences. No deal falls through the cracks.' },
  { icon: BarChart3, title: 'Reporting', desc: 'Revenue, conversion rate, pipeline value. All at a glance.' },
  { icon: Plug, title: 'Integrations', desc: 'Connection with email, calendar, payment systems.' },
]

function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section className="py-[140px] md:py-[180px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="section-label mb-4">Features</div>
          <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Everything you need to <span className="text-[var(--accent-primary)]">close deals</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="rounded-xl border p-9 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
                whileHover={{
                  borderColor: 'var(--border-accent)',
                  y: -6,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.25)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Icon size={22} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="font-body text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 5: Tech Stack ─────────────── */
const techStack = [
  { name: 'Next.js', role: 'Frontend', color: '#F8FAFC' },
  { name: 'Supabase', role: 'Database', color: '#3ECF8E' },
  { name: 'n8n', role: 'Workflows', color: '#FF6D5A' },
  { name: 'Stripe', role: 'Payments', color: '#635BFF' },
]

function TechStack() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-[100px] md:py-[140px]" style={{ backgroundColor: 'var(--bg-accent-wash)' }}>
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <div className="section-label mb-4">Tech Stack</div>
          <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Built on modern <span className="text-[var(--accent-primary)]">infrastructure</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
              }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="w-20 h-20 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <span className="font-mono text-sm font-medium" style={{ color: tech.color }}>
                  {tech.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {tech.name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                {tech.role}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Section 6: Pricing ─────────────── */
const pricingIncludes = [
  'Visual sales pipeline',
  'Customer portal',
  'Document management',
  'Auto follow-ups',
  'Sales reporting',
  'Priority support',
]

function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-[140px] md:py-[180px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <div className="section-label mb-4">Pricing</div>
          <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Simple, <span className="text-[var(--accent-primary)]">transparent</span> pricing
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div
            className="rounded-xl border p-10"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="font-mono font-medium" style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>
                  €2,499
                </span>
                <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>Setup</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-mono font-medium" style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>
                  €399
                </span>
                <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>/month</span>
              </div>
            </div>

            <div className="mb-8" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '24px' }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] mb-4" style={{ color: 'var(--text-muted)' }}>
                What's included
              </div>
              <ul className="flex flex-col gap-3">
                {pricingIncludes.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                    >
                      <Check size={12} style={{ color: 'var(--success)' }} />
                    </div>
                    <span className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/contact" className="btn-primary w-full text-center block">
              14 Days Free Trial
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 7: CTA ─────────────── */
function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section
      className="py-[120px] md:py-[160px]"
      style={{ backgroundColor: 'var(--bg-accent-wash)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="font-display text-[clamp(36px,5vw,72px)] font-light mb-5"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.02em' }}
          >
            14 days <span className="text-[var(--accent-primary)]">free.</span>
          </h2>
          <p className="font-body text-lg max-w-md mx-auto mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Test Sales OS risk-free. Setup included.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Start Free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 8: Cross-sell ─────────────── */
const relatedServices = [
  { name: 'Business OS', desc: 'Complete AI Business Operating System — 13 integrated services.', path: '/services/business-os', icon: Layers },
  { name: 'AI Lead Engine', desc: 'Autonomous 24/7 lead generation and qualification.', path: '/services/ai-lead-engine', icon: Zap },
  { name: 'Command Center', desc: 'Real-time CEO dashboard with AI-powered insights.', path: '/services/command-center', icon: LayoutDashboard },
]

function CrossSell() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-[100px] md:py-[140px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="section-label mb-4">Related Services</div>
          <h2 className="font-display text-[clamp(28px,3vw,48px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Explore more <span className="text-[var(--accent-primary)]">solutions</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {relatedServices.map((service) => {
            const Icon = service.icon
            return (
              <motion.div key={service.name} variants={staggerItem}>
                <Link
                  to={service.path}
                  className="rounded-xl border p-9 block transition-all duration-300 group h-full"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-accent)'
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-primary)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <Icon size={28} className="text-[var(--accent-primary)] mb-4" />
                  <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {service.name}
                  </h3>
                  <p className="font-body text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {service.desc}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--accent-primary)' }}>
                    Learn more
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Main Page ─────────────── */
export default function SalesOS() {
  return (
    <div>
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <TechStack />
      <Pricing />
      <CTA />
      <CrossSell />
    </div>
  )
}
