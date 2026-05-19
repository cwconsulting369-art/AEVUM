import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Share2,
  Search,
  Mic,
  Calendar,
  TrendingUp,
  Clock,
  CalendarX,
  SearchX,
  Check,
  FileInput,
  Cpu,
  FileOutput,
  ArrowRight,
  Layers,
  Globe,
  Bot,
} from 'lucide-react'
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
          Services / Content
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeStandard }}
          className="font-mono text-xs uppercase tracking-[0.08em] mb-6"
          style={{ color: '#F59E0B' }}
        >
          Autonomous Content Factory
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: easeStandard }}
          className="font-display font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(48px, 6vw, 96px)', color: '#F8FAFC' }}
        >
          AI Content
          <br />
          Engine
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeStandard }}
          className="mt-6 max-w-[600px] font-body text-lg leading-relaxed"
          style={{ color: '#94A3B8' }}
        >
          Autonomous AI content factory. Blog, social media, SEO — around the clock. Content that converts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeStandard }}
          className="mt-8 flex items-center gap-6 flex-wrap"
        >
          <span className="font-mono text-sm" style={{ color: '#F59E0B' }}>
            <span className="text-lg font-medium">EUR 499</span>{' '}
            <span style={{ color: '#64748B' }}>+</span>{' '}
            <span className="text-lg font-medium">EUR 499</span>
            <span style={{ color: '#64748B' }}>/mo</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeStandard }}
          className="mt-8"
        >
          <a href="#/contact"
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
            5 Free Articles to Test
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 2: Problem ─── */
const problems = [
  {
    icon: Clock,
    title: '15+ Hours/Week',
    body: 'Research, writing, editing, SEO optimization, publishing. Content eats massive time.',
    stat: '15h+',
    statLabel: 'per week on content',
  },
  {
    icon: CalendarX,
    title: 'Inconsistent',
    body: '3 articles this week, none next. No editorial calendar. No system.',
    stat: '60%',
    statLabel: 'of companies post inconsistently',
  },
  {
    icon: SearchX,
    title: 'No SEO Optimization',
    body: 'Content is written but not optimized for search engines. No keywords, no structure.',
    stat: '0%',
    statLabel: 'SEO optimized',
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
          Content creation eats 15+ hours per week.
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
const checklist = ['Blog articles', 'Social media posts', 'SEO optimization', '24/7 autonomous']

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
            Content Factory. 24/7.
          </h2>
          <p className="font-body text-lg leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
            Our AI content engine produces blog articles, social media posts, and SEO-optimized copy — autonomous, consistent, scalable.
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

        {/* Right — Content Factory Pipeline */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: easeStandard }}
          className="flex flex-col items-center gap-4"
        >
          {/* Pipeline stages */}
          {[
            { icon: FileInput, label: 'Topic & keywords', stage: 'Input' },
            { icon: Cpu, label: 'AI processing', stage: 'Engine', isEngine: true },
            { icon: FileOutput, label: 'Finished content', stage: 'Output' },
          ].map((stage, i) => {
            const Icon = stage.icon
            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 * i, ease: easeStandard }}
                className="w-full"
              >
                <div
                  className="relative flex items-center gap-4 rounded-xl p-5"
                  style={{
                    backgroundColor: '#1E293B',
                    border: stage.isEngine
                      ? '2px solid rgba(245,158,11,0.4)'
                      : '1px solid rgba(148,163,184,0.15)',
                    boxShadow: stage.isEngine ? '0 0 30px rgba(245,158,11,0.15)' : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                  >
                    <Icon size={24} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: '#64748B' }}>
                      {stage.stage}
                    </span>
                    <p className="font-body text-sm font-medium" style={{ color: '#F8FAFC' }}>
                      {stage.label}
                    </p>
                  </div>
                  {stage.isEngine && (
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: '#F59E0B',
                        boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                      }}
                    />
                  )}
                </div>
                {i < 2 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight
                      size={20}
                      className="rotate-90"
                      style={{ color: '#F59E0B' }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Output badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-3 mt-2"
          >
            {['Blog', 'Social', 'SEO'].map((badge) => (
              <span
                key={badge}
                className="font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 rounded"
                style={{
                  color: '#F59E0B',
                  border: '1px solid rgba(245,158,11,0.4)',
                }}
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 4: Features ─── */
const features = [
  {
    icon: FileText,
    title: 'Blog Articles',
    desc: 'Long-form articles with research, structure, SEO. Like from a human writer.',
  },
  {
    icon: Share2,
    title: 'Social Media',
    desc: 'Posts for LinkedIn, X, Instagram. Adapted to platform and audience.',
  },
  {
    icon: Search,
    title: 'SEO Optimization',
    desc: 'Keyword research, meta descriptions, internal linking. Google-ready.',
  },
  {
    icon: Mic,
    title: 'Brand Voice',
    desc: 'Trained on your tone, your terminology, your audience.',
  },
  {
    icon: Calendar,
    title: 'Editorial Calendar',
    desc: 'Scheduled publications. Consistency without manual management.',
  },
  {
    icon: TrendingUp,
    title: 'Performance',
    desc: 'Tracking views, clicks, conversions. Content that works.',
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
  { name: 'OpenRouter', tag: 'AI Models' },
  { name: 'Paperclip', tag: '31k+ Stars' },
  { name: 'n8n', tag: 'Workflows' },
  { name: 'Supabase', tag: 'Content DB' },
  { name: 'Next.js', tag: 'Publishing' },
  { name: 'Hetzner', tag: '24/7' },
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
                <FileText size={24} style={{ color: '#F59E0B' }} />
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
  'Blog articles',
  'Social media posts',
  'SEO optimization',
  'Brand voice training',
  'Editorial calendar',
  'Performance tracking',
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
                EUR 499
              </span>
              <span className="font-body text-base ml-2" style={{ color: '#64748B' }}>
                setup
              </span>
              <div className="mt-2">
                <span className="font-mono text-2xl font-medium" style={{ color: '#F59E0B' }}>
                  + EUR 499
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

            <a href="#/contact"
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
              5 Free Articles to Test
            </a>
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
          5 articles. Free. To test.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeStandard }}
          className="font-body text-lg mb-10"
          style={{ color: '#94A3B8' }}
        >
          No commitment. No credit card. Get 5 sample articles for your brand.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        >
          <a href="#/contact"
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
            Request Free Articles
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 8: Cross-sell ─── */
const relatedServices = [
  { name: 'AI Personal Agent', path: '/services/ai-personal-agent', icon: Bot, desc: 'Dedicated AI agent' },
  { name: 'Website + CRM', path: '/services/website-crm', icon: Globe, desc: 'Landing page + automation' },
  { name: 'Business OS', path: '/services/business-os', icon: Layers, desc: 'Complete platform' },
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
                <a
                  href={"#" + s.path}
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
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function ContentEngine() {
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
