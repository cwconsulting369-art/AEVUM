import { motion } from 'framer-motion'
import {
  Database,
  FileSpreadsheet,
  MousePointer,
  TrendingDown,
  Workflow,
  Code,
  Radio,
  Lock,
  Archive,
  Check,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  ArrowRight,
  Layers,
  Globe,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ─── Animation helpers ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: easeStandard },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeStandard } },
}

/* ─── Section 1: Hero ─── */
function Hero() {
  return (
    <section
      className="relative flex items-center min-h-[65vh] overflow-hidden"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Amber accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

      <div className="max-w-[1280px] mx-auto px-6 w-full pt-[72px]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-4"
          style={{ color: '#64748B' }}
        >
          Services / Database
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-6"
          style={{ color: '#F59E0B' }}
        >
          Professional Backend
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: easeStandard }}
          className="font-display font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(48px, 6vw, 96px)', color: '#F8FAFC' }}
        >
          Database
          <br />
          System + n8n
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeStandard }}
          className="mt-6 max-w-[600px] font-body text-lg leading-relaxed"
          style={{ color: '#94A3B8' }}
        >
          Professional database backend with workflows. Excel was yesterday. Scalable, secure, automated.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeStandard }}
          className="mt-8 flex items-center gap-6 flex-wrap"
        >
          <span className="font-mono text-sm" style={{ color: '#F59E0B' }}>
            <span className="text-lg font-medium">EUR 999</span>{' '}
            <span style={{ color: '#64748B' }}>+</span>{' '}
            <span className="text-lg font-medium">EUR 149</span>
            <span style={{ color: '#64748B' }}>/mo</span>
          </span>
        </motion.div>

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
            Database Live in 48h
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 2: Problem ─── */
const problems = [
  {
    icon: FileSpreadsheet,
    title: 'Excel Dependence',
    body: 'Data in sheets, spread across files, different versions. Pure chaos.',
    stat: '88%',
    statLabel: 'of spreadsheets contain errors',
  },
  {
    icon: MousePointer,
    title: 'All Manual',
    body: 'Enter data, copy, paste, send by email. No connection between systems.',
    stat: '10h+',
    statLabel: 'per week data maintenance',
  },
  {
    icon: TrendingDown,
    title: 'Not Scalable',
    body: '10,000 rows in Excel = crash. Multiple users = conflicts. Growth impossible.',
    stat: '1M',
    statLabel: 'rows = Excel limit',
  },
]

function Problem() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-16"
          style={{ color: '#F8FAFC' }}
        >
          Data in Excel/Sheets. No automation. No security.
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {problems.map((p) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                variants={staggerItem}
                className="rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5 group"
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
                <Icon size={40} style={{ color: '#EF4444' }} />
                <h3 className="font-body font-medium text-xl mt-5 mb-3" style={{ color: '#F8FAFC' }}>
                  {p.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  {p.body}
                </p>
                <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                  <span className="font-display text-3xl font-light" style={{ color: '#F59E0B' }}>
                    {p.stat}
                  </span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.08em] mt-1" style={{ color: '#64748B' }}>
                    {p.statLabel}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 3: Solution ─── */
const checklist = ['Supabase PostgreSQL', 'n8n workflows', 'API access', 'Realtime updates']

const tableNodes = [
  { label: 'Customers', icon: Users },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Products', icon: Package },
  { label: 'Reports', icon: BarChart3 },
]

function Solution() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.08em] mb-4" style={{ color: '#F59E0B' }}>
            The Solution
          </p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-6"
            style={{ color: '#F8FAFC' }}
          >
            PostgreSQL + Workflows. Professional.
          </h2>
          <p className="font-body text-lg leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
            Supabase provides a real PostgreSQL database. n8n connects it to all your tools. Realtime, API-driven, scalable.
          </p>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3 font-body text-base" style={{ color: '#F8FAFC' }}>
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                >
                  <Check size={12} style={{ color: '#10B981' }} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right — Database Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="relative flex items-center justify-center"
        >
          {/* Central DB */}
          <div
            className="relative w-40 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 z-10"
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid rgba(245,158,11,0.4)',
              boxShadow: '0 0 40px rgba(245,158,11,0.15)',
            }}
          >
            <Database size={48} style={{ color: '#F59E0B' }} />
            <span className="font-mono text-xs uppercase tracking-[0.08em]" style={{ color: '#64748B' }}>
              PostgreSQL
            </span>
          </div>

          {/* Connected table nodes */}
          {tableNodes.map((node, i) => {
            const Icon = node.icon
            const positions = [
              { top: '-30%', left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', right: '-30%', transform: 'translateY(-50%)' },
              { bottom: '-30%', left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', left: '-30%', transform: 'translateY(-50%)' },
            ]
            const pos = positions[i]
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: easeStandard }}
                className="absolute flex items-center gap-2 rounded-lg px-4 py-2.5"
                style={{
                  ...pos,
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(148,163,184,0.15)',
                }}
              >
                <Icon size={16} style={{ color: '#94A3B8' }} />
                <span className="font-mono text-xs" style={{ color: '#F8FAFC' }}>{node.label}</span>
              </motion.div>
            )
          })}

          {/* n8n badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg px-4 py-2"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(245,158,11,0.4)',
            }}
          >
            <Workflow size={16} style={{ color: '#F59E0B' }} />
            <span className="font-mono text-xs" style={{ color: '#F59E0B' }}>n8n</span>
            <span className="font-mono text-xs" style={{ color: '#64748B' }}>Workflow Automation</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 4: Features ─── */
const features = [
  {
    icon: Database,
    title: 'PostgreSQL DB',
    desc: 'True relational database. ACID-compliant. Enterprise-grade.',
  },
  {
    icon: Workflow,
    title: 'n8n Workflows',
    desc: '200+ pre-built workflows. Or create your own.',
  },
  {
    icon: Code,
    title: 'API Access',
    desc: 'RESTful API for all data. Connect to any tool.',
  },
  {
    icon: Radio,
    title: 'Realtime',
    desc: 'Live updates without refresh. WebSocket-based.',
  },
  {
    icon: Lock,
    title: 'Auth & Security',
    desc: 'Row-level security. Authentication. Role-based access control.',
  },
  {
    icon: Archive,
    title: 'Backup & Recovery',
    desc: 'Automatic backups. Point-in-time recovery.',
  },
]

function Features() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-16"
          style={{ color: '#F8FAFC' }}
        >
          Features
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={staggerItem}
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
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <Icon size={24} style={{ color: '#F59E0B' }} />
                </div>
                <h3 className="font-body font-medium text-xl mb-3" style={{ color: '#F8FAFC' }}>
                  {f.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  {f.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 5: Tech Stack ─── */
const techStack = [
  { name: 'Supabase', tag: 'Backend' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'PostgreSQL', tag: 'Database' },
  { name: 'Redis', tag: 'Cache' },
  { name: 'Hetzner', tag: 'CPX41' },
  { name: 'Docker', tag: 'Containers' },
]

function TechStack() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#0F172A' }}>
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
          The Technology Behind It
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {techStack.map((t) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] } },
              }}
              className="rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
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
                className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
              >
                <Database size={24} style={{ color: '#F59E0B' }} />
              </div>
              <h4 className="font-body font-medium text-base" style={{ color: '#F8FAFC' }}>
                {t.name}
              </h4>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] mt-1" style={{ color: '#64748B' }}>
                {t.tag}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 6: Pricing ─── */
const included = [
  'Supabase PostgreSQL',
  'n8n workflows',
  'API access',
  'Realtime updates',
  'Auth & security',
  'Automatic backups',
]

function Pricing() {
  return (
    <section className="py-[140px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="max-w-[640px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: easeStandard }}
            className="rounded-xl p-10"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(148,163,184,0.15)',
            }}
          >
            <div className="text-center mb-8">
              <span className="font-display text-5xl font-light" style={{ color: '#F59E0B' }}>
                EUR 999
              </span>
              <span className="font-body text-base ml-2" style={{ color: '#64748B' }}>
                setup
              </span>
              <div className="mt-2">
                <span className="font-mono text-2xl font-medium" style={{ color: '#F59E0B' }}>
                  + EUR 149
                </span>
                <span className="font-body text-sm ml-1" style={{ color: '#64748B' }}>/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-10">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-body text-sm py-2"
                  style={{ color: '#94A3B8', borderBottom: '1px solid rgba(148,163,184,0.1)' }}
                >
                  <Check size={16} style={{ color: '#10B981' }} />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="block text-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
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
              Database Live in 48h
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Section 7: CTA ─── */
function CTA() {
  return (
    <section className="py-[120px]" style={{ backgroundColor: 'rgba(245,158,11,0.06)' }}>
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="font-display text-[clamp(32px,4vw,64px)] font-normal leading-tight tracking-[-0.01em] mb-4"
          style={{ color: '#F8FAFC' }}
        >
          Your database in 48 hours.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeStandard }}
          className="font-body text-lg mb-10"
          style={{ color: '#94A3B8' }}
        >
          No more Excel spreadsheets. Professional backend from EUR 999.
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
            Start Now
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 8: Cross-sell ─── */
const relatedServices = [
  { name: 'Website + CRM', path: '/services/website-crm', icon: Globe, desc: 'Landing page + automation' },
  { name: 'Business OS', path: '/services/business-os', icon: Layers, desc: 'Complete platform' },
  { name: 'AI Lead Engine', path: '/services/ai-lead-engine', icon: Zap, desc: '24/7 lead generation' },
]

function CrossSell() {
  return (
    <section className="py-[100px]" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-10"
          style={{ color: '#64748B' }}
        >
          Related Services
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {relatedServices.map((s) => {
            const Icon = s.icon
            return (
              <motion.div key={s.name} variants={staggerItem}>
                <Link
                  to={s.path}
                  className="block rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5 group"
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
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                    >
                      <Icon size={20} style={{ color: '#F59E0B' }} />
                    </div>
                    <ArrowRight
                      size={20}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      style={{ color: '#64748B' }}
                    />
                  </div>
                  <h3 className="font-body font-medium text-lg" style={{ color: '#F8FAFC' }}>
                    {s.name}
                  </h3>
                  <p className="font-body text-sm mt-1" style={{ color: '#64748B' }}>
                    {s.desc}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function DatabaseSystem() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <TechStack />
      <Pricing />
      <CTA />
      <CrossSell />
    </>
  )
}
