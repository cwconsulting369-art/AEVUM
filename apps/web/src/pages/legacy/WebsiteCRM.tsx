import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Globe, XCircle, Database, ArrowDown, Check, ArrowRight,
  Workflow, Bot, FormInput, BarChart3, Layers, Zap
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
    icon: Globe,
    title: 'Isolated Data',
    body: 'Visitors come to the website, leave data \u2014 that goes nowhere. No tracking.',
    stat: '0%',
    statLabel: 'of leads get tracked',
  },
  {
    icon: XCircle,
    title: 'No Automation',
    body: 'Form entries transferred by hand. Follow-ups forgotten. No nurturing sequences.',
    stat: '100%',
    statLabel: 'manual effort',
  },
  {
    icon: Database,
    title: 'No Customer Tracking',
    body: 'Returning visitors not recognized. No customer history. Every contact a fresh start.',
    stat: '0',
    statLabel: 'customer profiles exist',
  },
]

const systemFlow = [
  {
    icon: Globe,
    title: 'Website',
    desc: 'Landing page with form. Your brand, your conversion goals.',
  },
  {
    icon: Database,
    title: 'CRM',
    desc: 'Supabase backend. Every lead stored with full history.',
  },
  {
    icon: Workflow,
    title: 'Automation',
    desc: 'n8n flows. Follow-ups, notifications, nurturing.',
  },
]

const features = [
  { icon: Globe, title: 'Custom Website', desc: 'Custom landing page. Your design, your brand, your conversion goals.' },
  { icon: Database, title: 'Supabase CRM', desc: 'Every contact stored. History, notes, status \u2014 all central.' },
  { icon: Workflow, title: 'n8n Flows', desc: 'Automated follow-ups, email sequences, notifications.' },
  { icon: Bot, title: 'AI Chatbot', desc: '24/7 available. Answers questions, qualifies leads, collects data.' },
  { icon: FormInput, title: 'Form Builder', desc: 'Multi-step forms, conditional logic, data validation.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Visitors, conversions, sources. All data at a glance.' },
]

const techStack = [
  { name: 'React', tag: 'Frontend' },
  { name: 'Supabase', tag: 'CRM + DB' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'OpenRouter', tag: 'AI Chatbot' },
  { name: 'Stripe', tag: 'Payments' },
  { name: 'Hetzner', tag: 'Hosting' },
]

const pricingIncludes = [
  'Custom landing page',
  'Supabase CRM',
  'n8n automations',
  'AI chatbot',
  'Form builder',
  'Hosting 24/7',
]

const crossSell = [
  {
    name: 'Database + n8n',
    path: '/services/database-system',
    icon: Database,
    desc: 'Professional database backend with n8n workflows.',
    price: 'From \u20AC999/mo',
  },
  {
    name: 'AI Lead Engine',
    path: '/services/ai-lead-engine',
    icon: Zap,
    desc: 'Autonomous 24/7 lead generation + qualification.',
    price: 'From \u20AC1,499/mo',
  },
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'Complete AI Business OS with 13 integrated services.',
    price: 'From \u20AC2,999/mo',
  },
]

/* ─── component ─── */
export default function WebsiteCRM() {
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
              <a href="#/" className="hover:text-[var(--accent-amber)] transition-colors">Services</a>
              <span>/</span>
              <span style={{ color: 'var(--accent-amber)' }}>Website</span>
            </div>

            {/* Label */}
            <div className="section-label mb-4">Connected System</div>

            {/* Headline */}
            <h1 className="font-display font-light" style={{ fontSize: 'clamp(48px, 6vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Website + CRM<br />+ Automation
            </h1>

            {/* Amber accent line */}
            <div className="mt-8 mb-8 h-[3px] w-24" style={{ background: 'var(--accent-amber)' }} />

            {/* Value prop */}
            <p className="max-w-2xl font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              Landing page + database + n8n automation. All connected.
              No isolated tools anymore.
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-10">
              <span className="font-display text-4xl font-light" style={{ color: 'var(--accent-amber)' }}>
                &euro;1,499
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>setup</span>
              <span className="font-mono text-sm mx-2" style={{ color: 'var(--text-muted)' }}>+</span>
              <span className="font-display text-4xl font-light" style={{ color: 'var(--text-primary)' }}>
                &euro;199
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>
            </div>

            {/* CTA */}
            <a href="#/contact" className="btn-primary inline-flex items-center gap-2">
              Prototype in 3 Days
              <ArrowRight size={16} />
            </a>
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
            Website without CRM<br />and automation = data island.
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
                  <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
                All connected.<br />From the start.
              </h2>
              <p className="font-body text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                We build your landing page with integrated CRM and n8n automation.
                Every visitor is recognized, every action tracked, every lead nurtured.
              </p>
              <ul className="space-y-3">
                {['Custom website', 'Supabase CRM', 'n8n automations', 'AI chatbot'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body" style={{ color: 'var(--text-primary)' }}>
                    <Check size={18} style={{ color: 'var(--accent-amber)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right - Connected system diagram */}
            <div className="flex flex-col items-center gap-0">
              {systemFlow.map((block, i) => {
                const Icon = block.icon
                return (
                  <motion.div
                    key={block.title}
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inSolution ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.15, duration: 0.5, ease: easeStandard }}
                  >
                    {/* Block */}
                    <div
                      className="rounded-xl border p-6 flex items-center gap-5 w-full"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-accent)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      >
                        <Icon size={22} style={{ color: 'var(--accent-amber)' }} />
                      </div>
                      <div>
                        <h4 className="font-body text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {block.title}
                        </h4>
                        <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {block.desc}
                        </p>
                      </div>
                    </div>

                    {/* Arrow between blocks */}
                    {i < systemFlow.length - 1 && (
                      <div className="flex justify-center py-2">
                        <motion.div
          initial={{ opacity: 0 }}
          animate={inSolution ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
        >
                          <ArrowDown size={20} style={{ color: 'var(--accent-amber)' }} />
                        </motion.div>
                      </div>
                    )}
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
              Everything connected.
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
                    <Icon size={22} style={{ color: 'var(--accent-amber)' }} />
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
              Modern stack.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                className="rounded-xl border p-6 text-center"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inStack ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeSpring }}
              >
                <div className="font-mono text-sm font-medium mb-2" style={{ color: 'var(--accent-amber)' }}>
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
            <div className="rounded-2xl border p-10 md:p-14" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center mb-10">
                {/* Price */}
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="font-display text-[clamp(36px,4vw,48px)] font-light" style={{ color: 'var(--accent-amber)' }}>
                    &euro;1,499
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>setup</span>
                </div>
                <div className="font-mono text-sm mb-2" style={{ color: 'var(--text-muted)' }}>+</div>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="font-display text-[clamp(36px,4vw,48px)] font-light" style={{ color: 'var(--text-primary)' }}>
                    &euro;199
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full mb-8" style={{ background: 'var(--border-subtle)' }} />

                {/* Included */}
                <h4 className="font-body text-sm font-medium uppercase tracking-[0.08em] mb-5" style={{ color: 'var(--text-muted)' }}>
                  What&apos;s included
                </h4>
                <ul className="space-y-3 text-left max-w-md mx-auto">
                  {pricingIncludes.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-body text-sm" style={{ color: 'var(--text-primary)' }}>
                      <Check size={16} style={{ color: 'var(--accent-amber)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-4">
                <a href="#/contact" className="btn-primary inline-flex items-center gap-2">
                  Prototype in 3 Days
                  <ArrowRight size={16} />
                </a>
              </div>

              <p className="text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                No hidden costs.
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
              Your prototype in 3 days.
            </h2>
            <p className="font-body text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              We start immediately. In 72h you&apos;ll see your system live.
            </p>
            <a href="#/contact" className="btn-primary inline-flex items-center gap-2">
              Start Now
              <ArrowRight size={16} />
            </a>
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
                  <a
                    href={"#" + s.path}
                    className="card-lennox p-8 block no-underline h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                        <Icon size={20} style={{ color: 'var(--accent-amber)' }} />
                      </div>
                      <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      {s.name}
                    </h3>
                    <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {s.desc}
                    </p>
                    <div className="font-mono text-xs" style={{ color: 'var(--accent-amber)' }}>
                      {s.price}
                    </div>
                  </a>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
