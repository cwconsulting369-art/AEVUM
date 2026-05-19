import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Layers, LayoutDashboard, Zap, TrendingUp, ShoppingCart,
  Bot, Search, Globe, Database, FileText,
  ArrowRight, Search as SearchIcon, PenTool, Hammer, Settings,
  ChevronDown, Calendar, MessageCircle,
} from 'lucide-react'
import HeroParticles from '../components/HeroParticles'
import { CONTACT } from '../config/contact'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────── SERVICE DATA ──────────────── */
const services = [
  {
    icon: Layers,
    title: 'lennoxOS Business Operating System',
    description: 'The complete AI Business OS. 13 services. Multi-agent orchestration. Self-hosted on enterprise hardware.',
    price: 'from EUR 4,999 + EUR 999/mo',
    path: '/services/business-os',
    featured: true,
    badge: 'Platform',
  },
  {
    icon: LayoutDashboard,
    title: 'Command Center Dashboard',
    description: 'Real-time CEO dashboard with AI insights. All KPIs in one place.',
    price: 'from EUR 1,999 + EUR 299/mo',
    path: '/services/command-center',
    featured: false,
  },
  {
    icon: Zap,
    title: 'AI Lead Engine',
    description: 'Autonomous 24/7 lead generation and qualification. More leads, less work.',
    price: 'from EUR 1,499 + EUR 499/mo',
    path: '/services/ai-lead-engine',
    featured: false,
  },
  {
    icon: TrendingUp,
    title: 'Sales OS',
    description: 'Complete sales operating system. Pipeline, follow-ups, reporting.',
    price: 'from EUR 2,499 + EUR 399/mo',
    path: '/services/sales-os',
    featured: false,
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce OS',
    description: 'Complete e-commerce operating system. Shop, inventory, payments, automation.',
    price: 'from EUR 2,999 + EUR 499/mo',
    path: '/services/ecommerce-os',
    featured: false,
  },
  {
    icon: Bot,
    title: 'AI Personal Agent',
    description: 'Your dedicated AI agent. Research, content, code, design — all autonomous.',
    price: 'EUR 99/hr or EUR 1,999/mo',
    path: '/services/ai-personal-agent',
    featured: false,
  },
  {
    icon: Search,
    title: 'Automation Audit',
    description: 'Process analysis in 48h. Top-3 quick wins for immediate efficiency.',
    price: 'EUR 1,299 one-time',
    path: '/services/automation-audit',
    featured: false,
  },
  {
    icon: Globe,
    title: 'Website + CRM + Automation',
    description: 'Landing page + database + n8n automation. All connected.',
    price: 'from EUR 1,499 + EUR 199/mo',
    path: '/services/website-crm',
    featured: false,
  },
  {
    icon: Database,
    title: 'Database System + n8n',
    description: 'Professional database backend with workflows. Excel is yesterday.',
    price: 'from EUR 999 + EUR 149/mo',
    path: '/services/database-system',
    featured: false,
  },
  {
    icon: FileText,
    title: 'AI Content Engine',
    description: 'Autonomous AI content factory. Blog, social media, SEO — around the clock.',
    price: 'from EUR 499 + EUR 499/mo',
    path: '/services/ai-content-engine',
    featured: false,
  },
]

const processSteps = [
  {
    num: '01',
    icon: SearchIcon,
    title: 'Analyze',
    description: 'We analyze your processes, identify bottlenecks, and define quick wins.',
  },
  {
    num: '02',
    icon: PenTool,
    title: 'Design',
    description: 'We design your custom business system with the right tech stack.',
  },
  {
    num: '03',
    icon: Hammer,
    title: 'Build',
    description: 'We build your system on enterprise hardware. Live in days, not months.',
  },
  {
    num: '04',
    icon: Settings,
    title: 'Operate',
    description: 'We operate your system 24/7. Monitoring, updates, support — included.',
  },
]

const references = [
  {
    company: 'UtilityHub',
    tag: 'B2B Energy',
    description: 'Complete sales OS for B2B energy sales. Lead generation, customer portal, automation.',
    metric: '35+ Lead-Pipelines',
  },
  {
    company: 'KetoLabsOS',
    tag: 'E-Commerce',
    description: 'Complete e-commerce operating system. Shop, inventory, payment processing, customer automation.',
    metric: 'End-to-End Automation',
  },
  {
    company: 'AEVUM',
    tag: 'Real Estate',
    description: 'AI lead system for real estate. Automated inquiries, qualification, appointment booking.',
    metric: '24/7 Lead Qualification',
  },
]

/* ──────────────── TRUST BAR DATA ──────────────── */
const trustStats = [
  { number: '13', label: 'Integrated Services' },
  { number: '24/7', label: 'Enterprise Hardware' },
  { number: '200+', label: 'Automated Workflows' },
  { number: '3', label: 'Live References' },
]

/* ──────────────── HOME PAGE ──────────────── */
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)
  const referencesRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  /* ─── GSAP Animations ─── */
  useGSAP(() => {
    // Hero entrance animations
    const heroEls = heroRef.current?.querySelectorAll('.hero-animate')
    if (heroEls) {
      gsap.fromTo(
        heroEls,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'expo.out',
          stagger: 0.18,
          delay: 0.3,
        }
      )
    }

    // Trust bar scroll animation
    const trustEls = trustRef.current?.querySelectorAll('.trust-stat')
    if (trustEls) {
      gsap.fromTo(
        trustEls,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: trustRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }

    // Services section header
    const servicesHeader = servicesRef.current?.querySelectorAll('.services-header')
    if (servicesHeader) {
      gsap.fromTo(
        servicesHeader,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    }

    // Service cards stagger
    const serviceCards = servicesRef.current?.querySelectorAll('.service-card')
    if (serviceCards) {
      gsap.fromTo(
        serviceCards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 60%',
            once: true,
          },
        }
      )
    }

    // Process section
    const processEls = processRef.current?.querySelectorAll('.process-step')
    if (processEls) {
      gsap.fromTo(
        processEls,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      )
    }

    // Process connecting line
    const processLine = processRef.current?.querySelector('.process-line')
    if (processLine) {
      gsap.fromTo(
        processLine,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 65%',
            once: true,
          },
        }
      )
    }

    // References section
    const refEls = referencesRef.current?.querySelectorAll('.ref-card')
    if (refEls) {
      gsap.fromTo(
        refEls,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: referencesRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      )
    }

    // CTA section
    const ctaEls = ctaRef.current?.querySelectorAll('.cta-animate')
    if (ctaEls) {
      gsap.fromTo(
        ctaEls,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    }
  }, { scope: containerRef })

  /* ─── Scroll to services ─── */
  const scrollToServices = () => {
    const el = document.getElementById('services')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={containerRef}>
      {/* ════════════════════════════════════════════
          SECTION 1: HERO
      ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Particle Canvas */}
        <HeroParticles />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(15,23,42,0.6) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 w-full" style={{ paddingTop: '72px' }}>
          <div className="max-w-[800px]">
            {/* Label */}
            <p className="hero-animate font-mono text-xs uppercase tracking-[0.1em] mb-6" style={{ color: 'var(--accent-primary)' }}>
              13 Services. 24/7. Enterprise Hardware.
            </p>

            {/* Headline */}
            <h1 className="hero-animate font-display font-light leading-[0.9] tracking-[-0.03em]" style={{ color: 'var(--text-primary)', fontSize: 'clamp(48px, 10vw, 140px)' }}>
              <span className="block">AI Business</span>
              <span className="block" style={{ color: 'var(--accent-primary)' }}>Infrastructure</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-animate font-body text-lg mt-8 max-w-[560px]" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              The complete operating system for your business. 13 integrated services. Self-hosted. 24/7.
            </p>

            {/* CTA Group */}
            <div className="hero-animate flex flex-wrap gap-4 mt-10">
              <Link to="/contact" className="btn-primary">
                Book Free Demo
              </Link>
              <button onClick={scrollToServices} className="btn-secondary">
                Explore Services
              </button>
            </div>

            {/* Secondary info */}
            <p className="hero-animate font-mono text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
              From EUR 999/month &middot; Setup from EUR 999
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-indicator">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>
            Scroll
          </span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2: TRUST BAR
      ════════════════════════════════════════════ */}
      <section
        ref={trustRef}
        className="relative"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
            {trustStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`trust-stat text-center ${i < 3 ? 'lg:border-r lg:border-[rgba(148,163,184,0.15)]' : ''}`}
              >
                <AnimatedCounter
                  value={stat.number}
                  className="font-display font-light"
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: 'clamp(32px, 5vw, 64px)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                />
                <p
                  className="font-mono text-xs uppercase tracking-[0.08em] mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3: SERVICES BENTO GRID
      ════════════════════════════════════════════ */}
      <section
        id="services"
        ref={servicesRef}
        className="relative py-[100px] lg:py-[160px]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div className="mb-16">
            <p className="services-header section-label mb-4">Our Services</p>
            <h2
              className="services-header font-display font-normal tracking-[-0.01em] mt-4"
              style={{
                color: 'var(--text-primary)',
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.0,
              }}
            >
              Everything your business needs.
            </h2>
            <p
              className="services-header font-body text-lg mt-4 max-w-[640px]"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
            >
              From initial analysis to ongoing operations — one complete system.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              const isFeatured = service.featured
              return (
                <Link
                  key={service.path}
                  to={service.path}
                  className={`service-card group relative rounded-xl border transition-all duration-300 ${
                    isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-primary)',
                    padding: isFeatured ? '48px' : '36px',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-accent)'
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245, 158, 11, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-primary)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* Badge */}
                  {service.badge && (
                    <span
                      className="absolute top-5 right-5 font-mono text-[11px] uppercase rounded px-2.5 py-1"
                      style={{
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--border-accent)',
                      }}
                    >
                      {service.badge}
                    </span>
                  )}

                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                    >
                      <Icon
                        size={isFeatured ? 32 : 28}
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className="font-body font-medium mb-3"
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: isFeatured ? '22px' : '18px',
                        lineHeight: 1.2,
                      }}
                    >
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="font-body text-sm mb-6 flex-1"
                      style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {service.description}
                    </p>

                    {/* Bottom row: Price + Arrow */}
                    <div className="flex items-center justify-between mt-auto">
                      <span
                        className="font-mono text-sm font-medium"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {service.price}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-colors duration-200"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4: PROCESS
      ════════════════════════════════════════════ */}
      <section
        id="process"
        ref={processRef}
        className="relative py-[100px] lg:py-[160px]"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div className="mb-20">
            <p className="section-label mb-4">Our Process</p>
            <h2
              className="font-display font-normal tracking-[-0.01em] mt-4"
              style={{
                color: '#1A1A2E',
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.0,
              }}
            >
              How we work.
            </h2>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div
              className="process-line hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[2px] origin-left"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {processSteps.map((step) => {
                const StepIcon = step.icon
                return (
                  <div key={step.num} className="process-step relative text-center">
                    {/* Watermark number */}
                    <span
                      className="font-display font-light absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
                      style={{
                        color: 'rgba(0,0,0,0.06)',
                        fontSize: 'clamp(64px, 8vw, 120px)',
                        lineHeight: 1,
                      }}
                    >
                      {step.num}
                    </span>

                    {/* Icon */}
                    <div className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                      <StepIcon size={28} style={{ color: 'var(--accent-primary)' }} />
                    </div>

                    {/* Title */}
                    <h3 className="font-body text-xl font-medium mb-3" style={{ color: '#1A1A2E' }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="font-body text-sm" style={{ color: 'rgba(26,26,46,0.6)', lineHeight: 1.6 }}>
                      {step.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5: SOCIAL PROOF / REFERENCES
      ════════════════════════════════════════════ */}
      <section
        id="references"
        ref={referencesRef}
        className="relative py-[100px] lg:py-[160px]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div className="mb-16">
            <p className="section-label mb-4">References</p>
            <h2
              className="font-display font-normal tracking-[-0.01em] mt-4"
              style={{
                color: 'var(--text-primary)',
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.0,
              }}
            >
              Live systems in production.
            </h2>
          </div>

          {/* Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {references.map((ref) => (
              <div
                key={ref.company}
                className="ref-card rounded-xl border p-10 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-accent)'
                  el.style.transform = 'translateY(-6px)'
                  el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245, 158, 11, 0.25)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-primary)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Company name + Tag */}
                <div className="flex items-center gap-3 mb-4">
                  <h3
                    className="font-body text-xl font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {ref.company}
                  </h3>
                  <span
                    className="font-mono text-[11px] uppercase rounded px-2 py-0.5"
                    style={{
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    {ref.tag}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="font-body text-sm mb-6"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {ref.description}
                </p>

                {/* Metric */}
                <span
                  className="font-mono text-xl font-medium"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {ref.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6: CTA BAND
      ════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative py-[100px] lg:py-[120px] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-accent-wash)' }}
      >
        {/* Glow orb */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-pulse-glow pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <h2
            className="cta-animate font-display font-normal tracking-[-0.01em]"
            style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              lineHeight: 1.1,
            }}
          >
            Ready to automate your business?
          </h2>
          <p
            className="cta-animate font-body text-lg mt-6"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Book a free 20-minute demo. We'll show you what's possible.
          </p>
          <div className="cta-animate mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
              style={{ padding: '18px 48px', fontSize: '16px' }}
            >
              <Calendar size={18} />
              Book Free Demo
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-4 rounded-lg transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={18} />
              WhatsApp Me
            </a>
          </div>
          <p
            className="cta-animate font-mono text-xs mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Free &middot; No commitment &middot; {CONTACT.name} — {CONTACT.phone}
          </p>
        </div>
      </section>
    </div>
  )
}

/* ──────────────── ANIMATED COUNTER ──────────────── */
function AnimatedCounter({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animateValue()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)

    function animateValue() {
      const targetStr = value
      const numericMatch = targetStr.match(/(\d+)/)
      if (!numericMatch) {
        // For text like "24/7", just fade in
        el!.style.opacity = '0'
        el!.textContent = targetStr
        let op = 0
        const fadeIn = setInterval(() => {
          op += 0.05
          el!.style.opacity = op.toString()
          if (op >= 1) clearInterval(fadeIn)
        }, 30)
        return
      }

      const target = parseInt(numericMatch[1], 10)
      const suffix = targetStr.replace(/\d+/, '')
      const duration = 2000
      const start = performance.now()

      const tick = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // ease-out
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.floor(eased * target)
        el!.textContent = current + suffix
        if (progress < 1) {
          requestAnimationFrame(tick)
        }
      }

      requestAnimationFrame(tick)
    }

    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className={className} style={style}>
      0
    </span>
  )
}
