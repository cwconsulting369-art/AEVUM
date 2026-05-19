import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  HardHat, Clock, Euro, Search, FileText, Code, Palette,
  Users, GraduationCap, MessageSquare, Wallet, ListChecks,
  Check, ArrowRight, Layers, Zap
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
    icon: HardHat,
    title: '10 Hats',
    body: 'Product, sales, marketing, support, accounting \u2014 doing everything yourself.',
    stat: '60h+',
    statLabel: 'weekly work hours',
  },
  {
    icon: Clock,
    title: 'No Strategy Time',
    body: 'Operational tasks eat time. Important decisions get shortchanged.',
    stat: '5%',
    statLabel: 'of time for strategy',
  },
  {
    icon: Euro,
    title: 'High Staff Costs',
    body: 'Content writer, designer, developer \u2014 \u20AC5,000+ per month per role.',
    stat: '\u20AC5,000+',
    statLabel: '/month per employee',
  },
]

const capabilities = [
  { icon: Search, title: 'Research', desc: 'Market analysis, competitive research, trend analysis \u2014 autonomous.' },
  { icon: FileText, title: 'Content', desc: 'Blog, social media, emails, SEO copy \u2014 personalized for your brand.' },
  { icon: Code, title: 'Code', desc: 'Web development, APIs, automations, debugging \u2014 technical execution.' },
  { icon: Palette, title: 'Design', desc: 'UI/UX, graphics, landing pages, branding assets.' },
]

const features = [
  { icon: Users, title: 'Multi-Agent System', desc: 'Not a single AI tool. A system of specialized agents working together.' },
  { icon: GraduationCap, title: 'Brand Training', desc: 'The agent learns your brand, your tone, your audience.' },
  { icon: Clock, title: '24/7 Available', desc: 'Active around the clock. No breaks, no holidays.' },
  { icon: MessageSquare, title: 'Real-Time Collaboration', desc: 'Assign tasks. Get results. Iterate in minutes.' },
  { icon: Wallet, title: 'Cost Control', desc: 'Hourly or flat rate. You decide what works best.' },
  { icon: ListChecks, title: 'Output Tracking', desc: 'Overview of all completed tasks. More transparent than any employee.' },
]

const techStack = [
  { name: 'Paperclip', tag: 'Multi-Agent' },
  { name: 'OpenRouter', tag: 'AI Routing' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'Supabase', tag: 'Memory' },
  { name: 'React', tag: 'Interface' },
  { name: 'Hetzner', tag: '24/7' },
]

const pricingIncludes = [
  'Research & analysis',
  'Content creation',
  'Code & development',
  'Design & creation',
  '24/7 availability',
  'Priority processing',
]

const crossSell = [
  {
    name: 'AI Content Engine',
    path: '/services/ai-content-engine',
    icon: FileText,
    desc: 'Autonomous AI content factory for blogs, social, and SEO.',
    price: 'From \u20AC999/mo',
  },
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'Complete AI Business OS with 13 integrated services.',
    price: 'From \u20AC2,999/mo',
  },
  {
    name: 'Automation Audit',
    path: '/services/automation-audit',
    icon: Zap,
    desc: '48h process analysis + top-3 quick wins for efficiency.',
    price: '\u20AC1,299 one-time',
  },
]

/* ─── component ─── */
export default function PersonalAgent() {
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
              <span style={{ color: 'var(--accent-primary)' }}>AI Agent</span>
            </div>

            {/* Label */}
            <div className="section-label mb-4">Dedicated AI Workforce</div>

            {/* Headline */}
            <h1 className="font-display font-light" style={{ fontSize: 'clamp(48px, 6vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AI Personal<br />Agent
            </h1>

            {/* Amber accent line */}
            <div className="mt-8 mb-8 h-[3px] w-24" style={{ background: 'var(--accent-primary)' }} />

            {/* Value prop */}
            <p className="max-w-2xl font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              Your dedicated AI agent. Research, content, code, design &mdash; all autonomous.
              Like an employee, only faster.
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-10">
              <span className="font-display text-4xl font-light" style={{ color: 'var(--accent-primary)' }}>
                &euro;99/hr
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
              <span className="font-display text-4xl font-light" style={{ color: 'var(--text-primary)' }}>
                &euro;1,999/mo
              </span>
            </div>

            {/* CTA */}
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              1 Hour Free to Test
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
            Founders wear 10 hats.<br />No time for strategy.
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
                One AI Agent.<br />Four Superpowers.
              </h2>
              <p className="font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Your personal agent handles research, content, code, and design.
                Trained on your business. Works 24/7. A fraction of the cost.
              </p>
              <ul className="space-y-3">
                {['Research & analysis', 'Content creation', 'Code & development', 'Design & creation'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body" style={{ color: 'var(--text-primary)' }}>
                    <Check size={18} style={{ color: 'var(--accent-primary)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right - Capability blocks */}
            <div className="grid grid-cols-2 gap-4">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon
                return (
                  <motion.div
                    key={cap.title}
                    className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inSolution ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: easeSpring }}
                  >
                    <Icon size={24} style={{ color: 'var(--accent-primary)' }} className="mb-3" />
                    <h4 className="font-body text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {cap.title}
                    </h4>
                    <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {cap.desc}
                    </p>
                  </motion.div>
                )
              })}
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
              Everything you need.
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
              Built on proven tech.
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
                {/* Dual price */}
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="font-display text-[clamp(36px,4vw,48px)] font-light" style={{ color: 'var(--accent-primary)' }}>
                    &euro;99
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>/hr</span>
                </div>
                <div className="font-mono text-sm mb-6" style={{ color: 'var(--text-muted)' }}>or</div>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="font-display text-[clamp(36px,4vw,48px)] font-light" style={{ color: 'var(--text-primary)' }}>
                    &euro;1,999
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
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

              <div className="text-center">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  1 Hour Free to Test
                  <ArrowRight size={16} />
                </Link>
              </div>
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
              1 hour. Free. No risk.
            </h2>
            <p className="font-body text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Test your personal agent. Get a real task done.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Book Free Hour
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
