import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  EyeOff, Hourglass, Map, ClipboardList, Search, Lightbulb,
  FileBarChart, Gauge, Zap, TrendingUp, CheckSquare, Phone,
  Check, ArrowRight, Layers, Globe, Database
} from 'lucide-react'

/* ─── animation helpers ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeStandard } },
}

/* ─── data ─── */
const problems = [
  {
    icon: EyeOff,
    title: 'No Overview',
    body: 'Manual processes are so routine that no one notices them anymore. Improvement potential stays invisible.',
    stat: '30%',
    statLabel: 'of processes are automatable',
  },
  {
    icon: Hourglass,
    title: 'Hidden Costs',
    body: 'Every manual hour costs \u20AC50\u2013100. Over a year, that adds up to thousands.',
    stat: '\u20AC25k+',
    statLabel: '/year hidden costs',
  },
  {
    icon: Map,
    title: 'No Implementation Plan',
    body: 'Even if you spot processes \u2014 how do you prioritize? What does implementation cost? Where do you start?',
    stat: '0',
    statLabel: 'clear prioritization',
  },
]

const timeline = [
  {
    time: 'Hour 0\u20134',
    icon: ClipboardList,
    title: 'Discovery Call',
    desc: 'We understand your business, your processes, your pain points.',
  },
  {
    time: 'Hour 4\u201324',
    icon: Search,
    title: 'Process Analysis',
    desc: 'Detailed analysis of all workflows. Identification of automation potential.',
  },
  {
    time: 'Hour 24\u201340',
    icon: Lightbulb,
    title: 'Quick Wins',
    desc: 'Top-3 high-priority automations with ROI calculation.',
  },
  {
    time: 'Hour 40\u201348',
    icon: FileBarChart,
    title: 'Report',
    desc: 'Detailed implementation plan with budget, timeline, and result forecast.',
  },
]

const features = [
  { icon: Map, title: 'Process Mapping', desc: 'Complete visualization of all business processes. Every step documented.' },
  { icon: Gauge, title: 'Efficiency Analysis', desc: 'Measurement of time spent, costs, and error rate per process.' },
  { icon: Zap, title: 'Top-3 Quick Wins', desc: 'High-priority automations with fast ROI. Not everything \u2014 the best ones.' },
  { icon: TrendingUp, title: 'ROI Calculation', desc: 'Cost-benefit analysis. Time savings, cost reduction, error reduction.' },
  { icon: CheckSquare, title: 'Implementation Plan', desc: 'Detailed step-by-step plan with budget and timeline.' },
  { icon: Phone, title: 'Follow-up', desc: '30-day follow-up after implementation. Support for questions.' },
]

const techStack = [
  { name: 'Paperclip', tag: 'Analysis' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'Supabase', tag: 'Data' },
  { name: 'OpenRouter', tag: 'AI Analysis' },
  { name: 'Figma', tag: 'Process Maps' },
  { name: 'Hetzner', tag: 'Secure' },
]

const pricingIncludes = [
  '48h process analysis',
  'Complete process mapping',
  'Top-3 quick wins',
  'ROI calculation',
  'Implementation plan',
  '30-day follow-up',
]

const crossSell = [
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'Complete AI Business OS with 13 integrated services.',
    price: 'From \u20AC2,999/mo',
  },
  {
    name: 'Database + n8n',
    path: '/services/database-system',
    icon: Database,
    desc: 'Professional database backend with n8n workflows.',
    price: 'From \u20AC999/mo',
  },
  {
    name: 'Website + CRM',
    path: '/services/website-crm',
    icon: Globe,
    desc: 'Landing page + database + n8n automation. All connected.',
    price: '\u20AC1,499 + \u20AC199/mo',
  },
]

/* ─── component ─── */
export default function AutomationAudit() {
  const refProblem = useRef(null)
  const refSolution = useRef(null)
  const refFeatures = useRef(null)
  const refStack = useRef(null)
  const refPricing = useRef(null)
  const refCTA = useRef(null)
  const refCross = useRef(null)

  const inProblem = useInView(refProblem, { once: true, margin: '-80px' })
  const inSolution = useInView(refSolution, { once: true, margin: '-80px' })
  const inFeatures = useInView(refFeatures, { once: true, margin: '-80px' })
  const inStack = useInView(refStack, { once: true, margin: '-80px' })
  const inPricing = useInView(refPricing, { once: true, margin: '-80px' })
  const inCTA = useInView(refCTA, { once: true, margin: '-80px' })
  const inCross = useInView(refCross, { once: true, margin: '-80px' })

  return (
    <div className="w-full">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '65vh', background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeStandard }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              <Link to="/" className="hover:text-[var(--accent-primary)] transition-colors">Services</Link>
              <span>/</span>
              <span style={{ color: 'var(--accent-primary)' }}>Audit</span>
            </div>

            {/* Label */}
            <div className="section-label mb-4">One-Time Analysis</div>

            {/* Headline */}
            <h1 className="font-display font-light" style={{ fontSize: 'clamp(48px, 6vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Automation<br />Audit
            </h1>

            {/* Amber accent line */}
            <div className="mt-8 mb-8 h-[3px] w-24" style={{ background: 'var(--accent-primary)' }} />

            {/* Value prop */}
            <p className="max-w-2xl font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              Process analysis in 48 hours. Top-3 quick wins for immediate efficiency gains.
              With implementation plan.
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-10">
              <span className="font-display text-5xl font-light" style={{ color: 'var(--accent-primary)' }}>
                &euro;1,299
              </span>
              <span className="font-mono text-sm ml-2" style={{ color: 'var(--text-muted)' }}>one-time</span>
            </div>

            {/* CTA */}
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Results in 48 Hours
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section ref={refProblem} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            initial={{ opacity: 0, y: 30 }}
            animate={inProblem ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeStandard }}
          >
            Companies don&apos;t know<br />where they can automate.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  className="card-lennox p-8"
                  variants={staggerItem}
                  initial="hidden"
                  animate={inProblem ? 'visible' : 'hidden'}
                  transition={{ delay: i * 0.12 }}
                >
                  <Icon size={28} style={{ color: 'var(--danger)' }} className="mb-4" />
                  <h3 className="font-body text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    {p.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {p.body}
                  </p>
                  <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <div className="font-display text-[clamp(40px,5vw,56px)] font-light" style={{ color: 'var(--danger)' }}>
                      {p.stat}
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.08em] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {p.statLabel}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SOLUTION ═══════════ */}
      <section ref={refSolution} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inSolution ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: easeStandard }}
            >
              <div className="section-label mb-4">The Solution</div>
              <h2 className="font-display text-[clamp(32px,4vw,56px)] font-normal mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Analysis in 48h.<br />Implementation plan immediately.
              </h2>
              <p className="font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                We analyze all your processes. Identify the top-3 quick wins.
                Deliver a detailed implementation plan with ROI calculation.
              </p>
              <ul className="space-y-3">
                {['Process mapping', 'Efficiency analysis', 'Top-3 quick wins', 'ROI overview'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body" style={{ color: 'var(--text-primary)' }}>
                    <Check size={18} style={{ color: 'var(--accent-primary)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right - 48h Timeline */}
            <div className="relative">
              {/* Vertical connecting line */}
              <div
                className="absolute left-[27px] top-4 bottom-4 w-[1px] hidden md:block"
                style={{ background: 'var(--border-accent)' }}
              />

              <div className="space-y-6">
                {timeline.map((stage, i) => {
                  const Icon = stage.icon
                  return (
                    <motion.div
                      key={stage.time}
                      className="flex items-start gap-4 relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inSolution ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: i * 0.15, duration: 0.5, ease: easeStandard }}
                    >
                      {/* Time badge */}
                      <div
                        className="shrink-0 font-mono text-[11px] px-2 py-1 rounded"
                        style={{
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--border-accent)',
                          background: 'var(--bg-elevated)',
                        }}
                      >
                        {stage.time}
                      </div>
                      {/* Icon */}
                      <div
                        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center z-10"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      >
                        <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {stage.title}
                        </h4>
                        <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {stage.desc}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section ref={refFeatures} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inFeatures ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeStandard }}
          >
            <div className="section-label mb-4">Features</div>
            <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              What you get.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={inFeatures ? 'visible' : 'hidden'}
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  className="card-lennox p-8"
                  variants={staggerItem}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <Icon size={22} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {f.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {f.desc}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TECH STACK ═══════════ */}
      <section ref={refStack} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inStack ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeStandard }}
          >
            <div className="section-label mb-4">Tech Stack</div>
            <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Analysis toolkit.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                className="rounded-xl border p-6 text-center"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inStack ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeSpring }}
              >
                <div className="font-mono text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
                  {t.name}
                </div>
                <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t.tag}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section ref={refPricing} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inPricing ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeStandard }}
          >
            <div className="rounded-2xl border p-10 md:p-14" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
              <div className="text-center mb-10">
                {/* Price */}
                <div className="mb-2">
                  <span className="font-display text-[clamp(48px,5vw,64px)] font-light" style={{ color: 'var(--accent-primary)' }}>
                    &euro;1,299
                  </span>
                </div>
                <div className="font-mono text-sm mb-2" style={{ color: 'var(--text-muted)' }}>one-time</div>

                {/* Special badge */}
                <div
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-8"
                  style={{
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.08)',
                  }}
                >
                  <Check size={12} />
                  No monthly fee
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full mb-8" style={{ background: 'var(--border-primary)' }} />

                {/* Included */}
                <h4 className="font-body text-sm font-medium uppercase tracking-[0.08em] mb-5" style={{ color: 'var(--text-muted)' }}>
                  What&apos;s included
                </h4>
                <ul className="space-y-3 text-left max-w-md mx-auto">
                  {pricingIncludes.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-body text-sm" style={{ color: 'var(--text-primary)' }}>
                      <Check size={16} style={{ color: 'var(--accent-primary)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-6">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  Start Audit
                  <ArrowRight size={16} />
                </Link>
              </div>

              <p className="text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                One-time payment. No subscription costs.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section ref={refCTA} className="w-full py-[140px]" style={{ background: 'var(--bg-accent-wash)' }}>
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inCTA ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: easeStandard }}
          >
            <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Results in 48 hours.
            </h2>
            <p className="font-body text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Book now. In 2 days you&apos;ll know exactly where you can automate.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Book Audit
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CROSS-SELL ═══════════ */}
      <section ref={refCross} className="w-full py-[140px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inCross ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeStandard }}
          >
            <div className="section-label mb-4">Related Services</div>
            <h2 className="font-display text-[clamp(28px,3vw,48px)] font-normal" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Explore more
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crossSell.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inCross ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: easeStandard }}
                >
                  <Link
                    to={s.path}
                    className="card-lennox p-8 block no-underline h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                        <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      {s.name}
                    </h3>
                    <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {s.desc}
                    </p>
                    <div className="font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
                      {s.price}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
