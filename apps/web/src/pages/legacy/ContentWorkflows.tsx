import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Video, FileText, Linkedin, Mail, Calendar, BarChart3,
  Clock, AlertTriangle, XCircle, Check, ArrowRight,
  MessageCircle, Phone, Bot, Globe, Layers,
} from 'lucide-react'
import CONTACT from '../../config/contact'

/* ─── easing tokens ─── */
const easeStandard = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── reusable FadeIn wrapper ─── */
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
      style={{ minHeight: '80vh', background: 'var(--bg-primary)' }}
    >
      {/* Amber accent line */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(245,158,11,0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 w-full">
        <motion.p
          className="font-mono text-xs tracking-[0.08em] mb-4"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeStandard }}
        >
          Services / Content
        </motion.p>

        <motion.p
          className="font-mono text-xs uppercase tracking-[0.08em] mb-6"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeStandard }}
        >
          04 / CONTENT REPURPOSING
        </motion.p>

        <motion.h1
          className="font-display font-light tracking-tight mb-6"
          style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: easeStandard }}
        >
          One Video.
          <br />
          <span style={{ color: 'var(--accent-amber)' }}>Endless Output.</span>
        </motion.h1>

        <motion.p
          className="font-body text-lg max-w-[600px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeStandard }}
        >
          Turn a single piece of content into a full week&apos;s worth of blog posts,
          LinkedIn updates, and newsletters. Automatically.
        </motion.p>

        <motion.div
          className="font-mono text-lg mb-8"
          style={{ color: 'var(--accent-amber)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeStandard }}
        >
          FROM &euro;3,000
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeStandard }}
        >
          <a href="#/services/automation-audit"
            className="inline-flex items-center justify-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--accent-amber)',
              color: 'var(--bg-primary)',
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
            Discuss Your Content
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'transparent',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '16px 36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-amber)'
              e.currentTarget.style.color = 'var(--accent-amber)'
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Book a Call
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
    title: 'Hours of Manual Work',
    body: 'Content creation takes hours per piece. Research, writing, editing, formatting — time you don\'t have.',
    stat: '15h+',
    statLabel: 'per week on content',
  },
  {
    icon: AlertTriangle,
    title: 'Inconsistent Quality',
    body: 'Some posts perform well, others fall flat. No system, no predictability, no repeatable process.',
    stat: '60%',
    statLabel: 'of companies post inconsistently',
  },
  {
    icon: XCircle,
    title: 'No Repurposing',
    body: 'One video = one post. The same insights could fuel a blog, newsletter, and 5 LinkedIn updates — but never do.',
    stat: '0%',
    statLabel: 'content gets repurposed',
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
            Content Creation Takes Hours.
            <br />
            Quality Is Inconsistent.
            <br />
            Nothing Gets Repurposed.
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
   SECTION 3 — WHAT YOU GET (6-item grid)
   ═══════════════════════════════════════════ */
const deliverables = [
  {
    icon: Video,
    title: 'Video-to-Blog',
    desc: 'Automatic transcription, structuring, and formatting into SEO-ready blog posts.',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn Posts',
    desc: 'AI-generated posts with hooks, storytelling, and CTAs. Scheduled automatically.',
  },
  {
    icon: Mail,
    title: 'Newsletter Drafting',
    desc: 'Weekly newsletter generated from your content. Ready to send.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    desc: 'AI-planned publishing schedule optimized for your audience.',
  },
  {
    icon: FileText,
    title: 'Brand Voice Training',
    desc: 'The system learns your tone, vocabulary, and style. Sounds like you.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Track engagement, reach, and conversion across all channels.',
  },
]

function WhatYouGetSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">What You Get</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            WHAT YOU GET
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {deliverables.map((d) => {
            const Icon = d.icon
            return (
              <motion.div
                key={d.title}
                className="rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                variants={itemUp}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <Icon size={24} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <h3
                  className="font-body font-medium text-xl mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {d.title}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {d.desc}
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
   SECTION 4 — 5-STEP PIPELINE
   ═══════════════════════════════════════════ */
const pipelineSteps = [
  { num: '01', title: 'You record one video' },
  { num: '02', title: 'AI transcribes & extracts key points' },
  { num: '03', title: 'Blog post, LinkedIn posts, and newsletter are drafted' },
  { num: '04', title: 'You approve (or edit) in one click' },
  { num: '05', title: 'Everything publishes on schedule' },
]

function PipelineSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn>
          <p className="section-label mb-3">The Flow</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-16"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            THE FLOW
          </h2>
        </FadeIn>

        {/* Desktop: horizontal pipeline */}
        <div className="hidden lg:block">
          <Stagger className="flex items-start justify-between gap-4" staggerDelay={0.1}>
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex-1 relative"
                variants={itemUp}
              >
                {/* Connecting line */}
                {i < pipelineSteps.length - 1 && (
                  <motion.div
                    className="absolute top-6 left-[60%] right-0 h-[2px]"
                    style={{ background: 'var(--border-accent)', transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: easeStandard }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent-amber)' }}>
                    {step.num}
                  </span>
                </div>
                <h4
                  className="font-body text-base font-medium pr-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h4>
              </motion.div>
            ))}
          </Stagger>
        </div>

        {/* Mobile: vertical pipeline */}
        <div className="lg:hidden">
          <Stagger className="flex flex-col gap-6" staggerDelay={0.1}>
            {pipelineSteps.map((step) => (
              <motion.div
                key={step.num}
                className="flex items-center gap-4"
                variants={itemUp}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent-amber)' }}>
                    {step.num}
                  </span>
                </div>
                <h4
                  className="font-body text-base font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h4>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 5 — PRICING
   ═══════════════════════════════════════════ */
const pricingFeatures = [
  'Full content pipeline: video → blog + LinkedIn + newsletter',
  'Setup + first month of content generation',
  'Brand voice training included',
  'Content calendar & scheduling',
  'Performance analytics dashboard',
]

function PricingSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[640px] mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Pricing</p>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Investment
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="rounded-xl p-10"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 0 60px rgba(245,158,11,0.08)',
            }}
          >
            <div className="text-center mb-8">
              <span
                className="font-display font-light"
                style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}
              >
                FROM &euro;3,000
              </span>
              <p
                className="font-body text-sm mt-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Setup + first month of content generation
              </p>
              <p
                className="font-mono text-sm mt-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Then &euro;1,000 &ndash; &euro;2,000/mo ongoing
              </p>
            </div>

            <ul className="space-y-3 mb-10">
              {pricingFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-body text-sm py-2"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#/services/automation-audit"
              className="block text-center font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: 'var(--bg-primary)',
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
              Start Creating &rarr;
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 6 — CASE HIGHLIGHT (Tim)
   ═══════════════════════════════════════════ */
function CaseSection() {
  return (
    <section className="py-[120px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — image area */}
          <FadeIn direction="left">
            <div
              className="rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="text-center p-8">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                >
                  <Video size={40} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                  Case Study
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Right — text */}
          <FadeIn direction="right" delay={0.2}>
            <p className="section-label mb-3">Case Highlight</p>
            <h2
              className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-6"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              Tim &mdash; Personal Brand &amp; Consulting
            </h2>
            <p
              className="font-body text-lg mb-6"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
            >
              Full content automation pipeline deployed. Zero manual posting.
              One video input triggers blog posts, LinkedIn updates, and
              newsletter drafts — all in Tim&apos;s voice, all on schedule.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#/cases"
                className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--accent-amber)',
                  color: 'var(--bg-primary)',
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
                Read Full Case <ArrowRight size={16} />
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 7 — CTA
   ═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section
      className="py-[140px]"
      style={{ background: 'var(--bg-accent-wash)' }}
    >
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <FadeIn>
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal tracking-tight mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            Stop creating content.
            <br />
            Start creating systems that create content.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            className="font-body text-lg mb-10"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            One video. A full week of content. On autopilot.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={CONTACT.whatsappContent}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: 'var(--bg-primary)',
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
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-[0.04em] rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '16px 36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-amber)'
                e.currentTarget.style.color = 'var(--accent-amber)'
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Phone size={18} /> Book a Call
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 8 — CROSS-SELL / RELATED SERVICES
   ═══════════════════════════════════════════ */
const relatedServices = [
  {
    name: 'AI Content Engine',
    path: '/services/ai-content-engine',
    icon: FileText,
    desc: 'Autonomous AI content factory. Blog, social media, SEO — around the clock.',
    price: 'EUR 499 + EUR 499/mo',
  },
  {
    name: 'AI Personal Agent',
    path: '/services/ai-personal-agent',
    icon: Bot,
    desc: 'Dedicated AI agent for your business. 24/7 availability.',
    price: 'EUR 2,999 + EUR 499/mo',
  },
  {
    name: 'Business OS',
    path: '/services/business-os',
    icon: Layers,
    desc: 'Complete operating system for your business. 13 integrated services.',
    price: 'EUR 4,999 + EUR 999/mo',
  },
]

function CrossSellSection() {
  return (
    <section className="py-[80px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <FadeIn className="mb-10">
          <p className="section-label mb-3">Related Services</p>
          <h2
            className="font-display text-[clamp(28px,3vw,48px)] font-normal tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            You might also like
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
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px var(--accent-glow)'
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
export default function ContentWorkflows() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <WhatYouGetSection />
      <PipelineSection />
      <PricingSection />
      <CaseSection />
      <CTASection />
      <CrossSellSection />
    </>
  )
}
