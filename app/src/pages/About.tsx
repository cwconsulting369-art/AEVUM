import { motion } from 'framer-motion'
import {
  Layers,
  Zap,
  TrendingUp,
  ShoppingCart,
  Bot,
  Search,
  Globe,
  Database,
  FileText,
  ArrowRight,
  Linkedin,
  Twitter,
  Github,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ─── Animation helpers ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeStandard } },
}

const staggerItemX = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeStandard } },
}

/* ─── Section 1: Hero ─── */
function Hero() {
  return (
    <section
      className="relative flex items-center min-h-[70vh] overflow-hidden"
      style={{ backgroundColor: '#0F172A' }}
    >
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

      <div className="max-w-[1280px] mx-auto px-6 w-full pt-[72px]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#64748B' }}
        >
          Company
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-6"
          style={{ color: '#F59E0B' }}
        >
          About
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: easeStandard }}
          className="font-display font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(48px, 6vw, 96px)', color: '#F8FAFC' }}
        >
          Built Different.
          <br />
          Built to Run.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeStandard }}
          className="mt-6 max-w-[600px] font-body text-lg leading-relaxed"
          style={{ color: '#94A3B8' }}
        >
          We are a business OS operator. 13 services. Own infrastructure. 24/7.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeStandard }}
          className="mt-8"
        >
          <Link
            to="/contact"
            className="inline-block font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'transparent',
              color: '#F8FAFC',
              border: '1px solid rgba(148,163,184,0.15)',
              padding: '16px 36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F59E0B'
              e.currentTarget.style.color = '#F59E0B'
              e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'
              e.currentTarget.style.color = '#F8FAFC'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 2: Competitive Differentiation ─── */
const comparisonRows = [
  { feature: 'Infrastructure', freelancer: 'Your server', saas: 'Shared Cloud', lennox: 'Own hardware' },
  { feature: 'Agents', freelancer: '1 Person', saas: 'Support-Team', lennox: 'Multi-agent system' },
  { feature: 'Customization', freelancer: 'Limited', saas: 'Templates', lennox: 'Custom' },
  { feature: 'Scaling', freelancer: 'Linear', saas: 'Dependent', lennox: 'Unlimited' },
  { feature: 'Cost Control', freelancer: 'Hourly', saas: 'Subs everywhere', lennox: 'One platform' },
  { feature: 'Data Privacy', freelancer: 'Unclear', saas: 'US-Cloud', lennox: 'EU servers' },
  { feature: 'Availability', freelancer: 'Mo-Fr', saas: '99.9%', lennox: '24/7' },
  { feature: 'Integration', freelancer: 'Manual', saas: 'API-Limits', lennox: 'Ecosystem' },
]

function CompetitiveDiff() {
  return (
    <section className="py-[120px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#F59E0B' }}
        >
          The Difference
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-12"
          style={{ color: '#F8FAFC' }}
        >
          Freelancer vs. SaaS vs. lennoxOS
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.15)',
          }}
        >
          {/* Header */}
          <div className="grid grid-cols-4" style={{ backgroundColor: '#0F172A', borderBottom: '2px solid rgba(148,163,184,0.15)' }}>
            <div className="px-6 py-4 font-mono text-xs uppercase tracking-[0.08em]" style={{ color: '#64748B' }}>
              Feature
            </div>
            <div className="px-6 py-4 font-mono text-xs uppercase tracking-[0.08em] text-center" style={{ color: '#64748B' }}>
              Freelancer
            </div>
            <div className="px-6 py-4 font-mono text-xs uppercase tracking-[0.08em] text-center" style={{ color: '#64748B' }}>
              SaaS
            </div>
            <div
              className="px-6 py-4 font-mono text-xs uppercase tracking-[0.08em] text-center"
              style={{ color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.03)' }}
            >
              lennoxOS
            </div>
          </div>

          {/* Rows */}
          {comparisonRows.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: easeStandard }}
              className="grid grid-cols-4"
              style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}
            >
              <div className="px-6 py-4 font-body font-medium text-sm" style={{ color: '#F8FAFC' }}>
                {row.feature}
              </div>
              <div className="px-6 py-4 font-body text-sm text-center" style={{ color: '#94A3B8' }}>
                {row.freelancer}
              </div>
              <div className="px-6 py-4 font-body text-sm text-center" style={{ color: '#94A3B8' }}>
                {row.saas}
              </div>
              <div
                className="px-6 py-4 font-body font-medium text-sm text-center"
                style={{ color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.03)' }}
              >
                {row.lennox}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 3: The Stack ─── */
const techStack = [
  { name: 'Paperclip', tag: '31k+ GitHub Stars', desc: 'Multi-agent orchestration. Multiple AI agents work as a team.' },
  { name: 'OpenRouter', tag: 'AI Model Routing', desc: 'Automatic selection of the best AI model. Claude, GPT-4, Gemini.' },
  { name: 'n8n', tag: '200+ Workflows', desc: 'Workflow automation. 200+ pre-built workflows. Open source.' },
  { name: 'Supabase', tag: 'PostgreSQL Backend', desc: 'Auth, realtime, storage. PostgreSQL. Open source.' },
  { name: 'Stripe', tag: 'Payments', desc: 'Payment integration. Subscriptions, one-time, invoicing.' },
  { name: 'Hetzner', tag: 'CPX41 24/7', desc: 'Enterprise hardware. Europe. 24/7. Not shared hosting.' },
]

function TheStack() {
  return (
    <section className="py-[120px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#F59E0B' }}
        >
          Tech Stack
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-16"
          style={{ color: '#F8FAFC' }}
        >
          The Technology.
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {techStack.map((t) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] } },
              }}
              className="rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
              >
                <Zap size={24} style={{ color: '#F59E0B' }} />
              </div>
              <h4 className="font-body font-medium text-lg" style={{ color: '#F8FAFC' }}>
                {t.name}
              </h4>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] mt-1 mb-3" style={{ color: '#64748B' }}>
                {t.tag}
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                {t.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="mt-12 flex flex-col items-center"
        >
          <div className="w-48 h-[1px] relative overflow-hidden" style={{ backgroundColor: 'rgba(245,158,11,0.4)' }}>
            <motion.div
              className="absolute top-0 left-0 h-full w-8"
              style={{ backgroundColor: '#F59E0B' }}
              animate={{ x: [-32, 192] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] mt-4" style={{ color: '#64748B' }}>
            All connected. One system.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 4: Process Deep-Dive ─── */
const processSteps = [
  {
    number: '01',
    title: 'Analyze',
    desc: 'We analyze your entire business processes. Identify bottlenecks, manual tasks, and automation potential.',
    details: ['Process mapping', 'Bottleneck analysis', 'ROI calculation'],
  },
  {
    number: '02',
    title: 'Design',
    desc: 'We design your custom business system. Tech stack, architecture, workflows — all planned.',
    details: ['Tech stack selection', 'System architecture', 'Workflow design'],
  },
  {
    number: '03',
    title: 'Build',
    desc: 'We build your system on enterprise hardware. Supabase, n8n, React — live in days, not months.',
    details: ['Enterprise hardware', 'Live in days', 'No vendor lock-in'],
  },
  {
    number: '04',
    title: 'Operate',
    desc: 'We operate your system 24/7. Monitoring, updates, support — all included.',
    details: ['24/7 monitoring', 'Regular updates', 'Priority support'],
  },
]

function ProcessDeepDive() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#F59E0B' }}
        >
          Our Methodology
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-16"
          style={{ color: '#0F172A' }}
        >
          Our Methodology.
        </motion.h2>

        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[19px] md:left-[39px] top-0 bottom-0 w-[2px]"
            style={{ backgroundColor: 'rgba(245,158,11,0.3)' }}
          />

          <div className="space-y-12">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: easeStandard }}
                className="relative flex gap-6 md:gap-10"
              >
                {/* Step number bubble */}
                <div
                  className="relative z-10 w-10 h-10 md:w-20 md:h-20 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: '#F59E0B',
                    boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                  }}
                >
                  <span className="font-display text-sm md:text-lg font-medium" style={{ color: '#0F172A' }}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1 md:pt-2">
                  <p className="font-mono text-xs uppercase tracking-[0.08em] mb-1" style={{ color: '#F59E0B' }}>
                    Step {step.number}
                  </p>
                  <h3 className="font-body font-medium text-xl md:text-2xl mb-3" style={{ color: '#0F172A' }}>
                    {step.title}
                  </h3>
                  <p className="font-body text-base leading-relaxed mb-4 max-w-[600px]" style={{ color: 'rgba(15,23,42,0.7)' }}>
                    {step.desc}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {step.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-1.5 font-body text-sm px-3 py-1 rounded-full"
                        style={{
                          color: '#0F172A',
                          backgroundColor: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.3)',
                        }}
                      >
                        <Check size={12} style={{ color: '#F59E0B' }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Section 5: References ─── */
const references = [
  {
    industry: 'B2B Energy',
    name: 'UtilityHub',
    desc: 'Complete sales OS for B2B energy sales. Lead generation, customer portal, automation.',
    metric: '35+ Lead Pipelines',
  },
  {
    industry: 'E-Commerce',
    name: 'KetoLabsOS',
    desc: 'Complete e-commerce operating system. Shop, inventory, payments, customer automation.',
    metric: 'End-to-End Automation',
  },
  {
    industry: 'Real Estate',
    name: 'AEVUM',
    desc: 'AI lead system for real estate. Automated inquiries, qualification, appointment booking.',
    metric: '24/7 Lead Qualification',
  },
]

function References() {
  return (
    <section className="py-[120px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#F59E0B' }}
        >
          References
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-12"
          style={{ color: '#F8FAFC' }}
        >
          Live Systems. Real Results.
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {references.map((ref) => (
            <motion.div
              key={ref.name}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeStandard } },
              }}
              className="rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5"
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span
                className="inline-block font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 rounded mb-4"
                style={{
                  color: '#F59E0B',
                  border: '1px solid rgba(245,158,11,0.4)',
                }}
              >
                {ref.industry}
              </span>
              <h3 className="font-body font-medium text-xl mb-3" style={{ color: '#F8FAFC' }}>
                {ref.name}
              </h3>
              <p className="font-body text-sm leading-relaxed mb-6" style={{ color: '#94A3B8' }}>
                {ref.desc}
              </p>
              <div className="pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                <span className="font-display text-2xl font-light" style={{ color: '#F59E0B' }}>
                  {ref.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.08em] text-center mt-10"
          style={{ color: '#64748B' }}
        >
          35+ lead pipelines in Airtable
        </motion.p>
      </div>
    </section>
  )
}

/* ─── Section 6: Stats Band ─── */
const stats = [
  { number: '13', label: 'Integrated Services' },
  { number: '24/7', label: 'Enterprise Hardware' },
  { number: '200+', label: 'Workflows' },
  { number: '3', label: 'Live References' },
]

function StatsBand() {
  return (
    <section className="py-20" style={{ backgroundColor: '#1E293B' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="text-center"
            >
              <span
                className="font-display font-light"
                style={{ fontSize: 'clamp(40px, 5vw, 72px)', color: '#F8FAFC', lineHeight: 1 }}
              >
                {s.number}
              </span>
              <span className="block font-mono text-xs uppercase tracking-[0.08em] mt-3" style={{ color: '#64748B' }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 7: CTA ─── */
function CTA() {
  return (
    <section className="py-[100px]" style={{ backgroundColor: 'rgba(245,158,11,0.06)' }}>
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-4"
          style={{ color: '#F8FAFC' }}
        >
          Ready for your Business OS?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeStandard }}
          className="font-body text-lg mb-10"
          style={{ color: '#94A3B8' }}
        >
          Book a free demo. No commitment.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        >
          <Link
            to="/contact"
            className="inline-block font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#F59E0B',
              color: '#0F172A',
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
            Book Demo
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.08em] mt-6"
          style={{ color: '#64748B' }}
        >
          Free. Response in 24h.
        </motion.p>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function About() {
  return (
    <>
      <Hero />
      <CompetitiveDiff />
      <TheStack />
      <ProcessDeepDive />
      <References />
      <StatsBand />
      <CTA />
    </>
  )
}
