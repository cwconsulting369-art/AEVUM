import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Puzzle,
  Hand,
  UserX,
  ShoppingBag,
  Package,
  CreditCard,
  UserCog,
  LineChart,
  Plug,
  Check,
  ArrowRight,
  Layers,
  FileText,
  Database,
  LayoutDashboard,
  Zap,
  TrendingUp,
  Bot,
  Search,
  Globe,
  MessageCircle,
  Calendar,
} from 'lucide-react'
import { CONTACT } from '../../config/contact'

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
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent-amber), transparent)' }}
      />

      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="max-w-3xl"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <a href="#/" className="hover:text-[var(--accent-amber)] transition-colors duration-200">
              Services
            </a>
            <span>/</span>
            <span style={{ color: 'var(--accent-amber)' }}>E-Commerce OS</span>
          </div>

          {/* Label */}
          <div className="section-label mb-4">KetoLabsOS Edition — Live Referenz</div>

          {/* Headline */}
          <h1
            className="font-display font-light tracking-tight"
            style={{
              fontSize: 'clamp(48px, 6vw, 96px)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            E-Commerce<span className="text-[var(--accent-amber)]">OS</span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-body text-lg mt-6 max-w-xl"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Komplettes E-Commerce Betriebssystem. Shop, Inventar, Zahlungen, Kunden-Automation, Analytics. Ein System fuer alles.
          </p>

          {/* Price + CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10">
            <div className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-[var(--accent-amber)] font-medium" style={{ fontSize: '18px' }}>
                2.999 EUR
              </span>{' '}
              Setup +{' '}
              <span className="text-[var(--accent-amber)] font-medium" style={{ fontSize: '18px' }}>
                499 EUR
              </span>
              /Monat
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#25D366', color: '#fff' }}
              >
                <MessageCircle size={16} />
                WhatsApp schreiben
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Calendar size={16} />
                Live Demo buchen
              </a>
            </div>
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
    icon: Puzzle,
    title: '5+ separate Tools',
    body: 'Shop, Inventar, Zahlungen, E-Mail, Support — alles getrennt. Keine Verbindung.',
    stat: '5+',
    statLabel: 'separate Tools',
  },
  {
    icon: Hand,
    title: 'Manuelle Prozesse',
    body: 'Bestellungen manuell bearbeiten. Inventar per Hand aktualisieren. Keine Automation.',
    stat: '15h+',
    statLabel: 'manuelle Arbeit pro Woche',
  },
  {
    icon: UserX,
    title: 'Daten-Silos',
    body: 'Kaufhistorie in einem Tool. Support in einem anderen. Keine 360-Grad-Kundensicht.',
    stat: '0%',
    statLabel: 'Kundendaten verbunden',
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
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
          >
            <span className="text-[var(--accent-amber)]">5+</span> Tools.{' '}
            <span className="text-[var(--accent-amber)]">Keine</span> Automation.{' '}
            <span className="text-[var(--accent-amber)]">Kein</span> Ueberblick.
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
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
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
                <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div
                    className="font-display text-[clamp(40px,5vw,56px)] font-light"
                    style={{ color: 'var(--danger)', lineHeight: 1 }}
                  >
                    {card.stat}
                  </div>
                  <div
                    className="font-mono text-xs uppercase tracking-[0.08em] mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
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

/* ─────────────── Section 3: Live Preview (KetoLabsOS) ─────────────── */
function LivePreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const screenshots = [
    { src: '/screenshots/ketolabs-dashboard.png', label: 'Dashboard — Umsatz & KPIs in Echtzeit' },
    { src: '/screenshots/ketolabs-agent-center.png', label: '6 AI-Agenten — autonom & 24/7' },
    { src: '/screenshots/ketolabs-sales.png', label: 'Sales — Bestellungen & Top-Produkte' },
  ]

  return (
    <section ref={ref} className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <div className="section-label mb-4">Live Referenz</div>
          <h2 className="font-display text-[clamp(32px,4vw,64px)] font-normal" style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}>
            Das sieht dein <span className="text-[var(--accent-amber)]">E-Commerce OS</span> aus
          </h2>
          <p className="font-body text-lg mt-4 max-w-2xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Keine Mockups — echte Screenshots aus dem KetoLabsOS System. 2.847 EUR Umsatz/Tag, 6 aktive AI-Agenten, 3.45x ROAS.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {screenshots.map((shot) => (
            <motion.div key={shot.src} variants={staggerItem} className="rounded-xl border overflow-hidden group" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-accent)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245, 158, 11, 0.2)' }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-subtle)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}>
              <div className="overflow-hidden aspect-[16/10]">
                <img src={shot.src} alt={shot.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <p className="font-body text-xs px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{shot.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Opportunity Cost Box */}
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mt-12 rounded-xl border p-8" style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <h3 className="font-display text-2xl font-medium mb-4" style={{ color: '#EF4444' }}>
            Was dich das aktuelle Setup kostet (pro Monat)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Manuelle Arbeit', value: '60h+', desc: '15h/Woche x 4 EUR Stundensatz' },
              { label: 'Verschenkte Umsatzpotenziale', value: '3.000+ EUR', desc: 'Keine Automatisierung = verlorene Kunden' },
              { label: 'Tool-Kosten', value: '200+ EUR', desc: 'Shopify, Zapier, 5+ Subscriptions' },
              { label: 'Fehlende Daten-Einblicke', value: 'Unbezahlbar', desc: 'Keine 360-Grad Kundensicht' },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-mono text-2xl font-medium" style={{ color: '#EF4444' }}>{item.value}</p>
                <p className="font-body text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 4: Solution ─────────────── */
const solutionChecks = [
  'Integrierter Online-Shop',
  'Automatisches Inventar',
  'Stripe Zahlungen',
  'Kunden-Automation',
]

const dashboardStats = [
  { label: 'Orders', value: '148' },
  { label: 'Customers', value: '89' },
  { label: 'AOV', value: '€139' },
  { label: 'Refund rate', value: '2.1%' },
]

const inventoryRows = [
  { name: 'Keto Shake Chocolate', stock: 142, status: 'In Stock' },
  { name: 'Keto Bar Vanilla', stock: 38, status: 'Low' },
  { name: 'MCT Oil 500ml', stock: 215, status: 'In Stock' },
  { name: 'Electrolyte Powder', stock: 12, status: 'Low' },
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
            <div className="section-label mb-4">Die Loesung</div>
            <h2
              className="font-display text-[clamp(32px,4vw,56px)] font-normal mb-6"
              style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
            >
              Ein System. Der <span className="text-[var(--accent-amber)]">komplette</span> Shop.
            </h2>
            <p
              className="font-body text-lg mb-8"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
            >
              E-Commerce OS unifies shop, inventory, payments, and customer automation. KetoLabsOS proves: It works in the real world.
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
                  <span className="font-body text-base" style={{ color: 'var(--text-primary)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* Top: Revenue */}
              <div className="mb-6">
                <div
                  className="font-mono text-[11px] uppercase tracking-[0.08em] mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Revenue this month
                </div>
                <div
                  className="font-display font-light"
                  style={{
                    fontSize: 'clamp(28px,3vw,40px)',
                    color: 'var(--accent-amber)',
                    lineHeight: 1.1,
                  }}
                >
                  €12.4k
                </div>
              </div>

              {/* Middle: Mini stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {dashboardStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="rounded-lg border p-3 text-center"
                    style={{
                      backgroundColor: 'rgba(15,23,42,0.5)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div
                      className="font-mono text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="font-mono text-[10px] uppercase tracking-[0.06em] mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom: Inventory table */}
              <div>
                <div
                  className="font-mono text-[11px] uppercase tracking-[0.08em] mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Inventory
                </div>
                <div className="flex flex-col gap-2">
                  {inventoryRows.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between py-2 px-3 rounded-md"
                      style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
                    >
                      <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {row.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          {row.stock}
                        </span>
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded"
                          style={{
                            color: row.status === 'In Stock' ? 'var(--success)' : 'var(--accent-amber)',
                            border: `1px solid ${row.status === 'In Stock' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                          }}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
  {
    icon: ShoppingBag,
    title: 'Online Shop',
    desc: 'Complete e-commerce shop. Products, variants, categories, SEO.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    desc: 'Automatic stock tracking. Alerts for low inventory.',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'Stripe integration. Credit card, PayPal, SEPA. Automatic invoicing.',
  },
  {
    icon: UserCog,
    title: 'Customer Auto.',
    desc: 'Automated customer communication. Post-purchase, review requests, reactivation.',
  },
  {
    icon: LineChart,
    title: 'Analytics',
    desc: 'Revenue, conversion, AOV, retention. All e-commerce metrics.',
  },
  {
    icon: Plug,
    title: 'Integrations',
    desc: 'Connection with shipping, accounting, marketing tools.',
  },
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
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
          >
            Everything to <span className="text-[var(--accent-amber)]">run your shop</span>
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
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
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
                  <Icon size={22} style={{ color: 'var(--accent-amber)' }} />
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
  { name: 'Supabase', role: 'Backend', color: '#3ECF8E' },
  { name: 'n8n', role: 'Workflows', color: '#FF6D5A' },
  { name: 'Stripe', role: 'Payments', color: '#635BFF' },
  { name: 'Paperclip', role: 'Search', color: '#F59E0B' },
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
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
          >
            Powered by <span className="text-[var(--accent-amber)]">enterprise tech</span>
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
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span className="font-mono text-sm font-medium" style={{ color: tech.color }}>
                  {tech.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {tech.name}
              </span>
              <span
                className="font-mono text-[11px] uppercase tracking-[0.08em]"
                style={{ color: 'var(--text-muted)' }}
              >
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
  'Online shop',
  'Inventory management',
  'Stripe payments',
  'Customer automation',
  'E-commerce analytics',
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
          <h2
            className="font-display text-[clamp(32px,4vw,64px)] font-normal"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
          >
            Simple, <span className="text-[var(--accent-amber)]">transparent</span> pricing
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
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span
                  className="font-mono font-medium"
                  style={{ fontSize: '18px', color: 'var(--accent-amber)' }}
                >
                  2.999 EUR
                </span>
                <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Setup
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="font-mono font-medium"
                  style={{ fontSize: '18px', color: 'var(--accent-amber)' }}
                >
                  499 EUR
                </span>
                <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  /Monat
                </span>
              </div>
            </div>

            <div
              className="mb-8"
              style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}
            >
              <div
                className="font-mono text-[11px] uppercase tracking-[0.08em] mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Inklusive
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
                    <span className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <a href="#/contact" className="btn-primary w-full text-center block">
              Watch Live Demo
            </a>
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
    <section className="py-[120px] md:py-[160px]" style={{ backgroundColor: 'var(--bg-accent-wash)' }}>
      <div className="max-w-[1280px] mx-auto px-6 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="font-display text-[clamp(36px,5vw,72px)] font-light mb-5"
            style={{
              color: 'var(--text-primary)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
            }}
          >
            Sieh KetoLabsOS <span className="text-[var(--accent-amber)]">live.</span>
          </h2>
          <p
            className="font-body text-lg max-w-md mx-auto mb-10"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}
          >
            Ein komplettes E-Commerce System in Produktion — mit echten Daten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Calendar size={16} />
              Live Demo buchen
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3.5 rounded-lg transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={16} />
              WhatsApp schreiben
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 8: Cross-sell ─────────────── */
const relatedServices = [
  {
    name: 'Business OS',
    desc: 'Complete AI Business Operating System — 13 integrated services.',
    path: '/services/business-os',
    icon: Layers,
  },
  {
    name: 'AI Content Engine',
    desc: 'Autonomous AI content factory for your brand.',
    path: '/services/ai-content-engine',
    icon: FileText,
  },
  {
    name: 'Database + n8n',
    desc: 'Professional database backend with workflow automation.',
    path: '/services/database-system',
    icon: Database,
  },
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
          <div className="section-label mb-4">Verwandte Services</div>
          <h2
            className="font-display text-[clamp(28px,3vw,48px)] font-normal"
            style={{ color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.01em' }}
          >
            Weitere <span className="text-[var(--accent-amber)]">Loesungen</span>
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
                <a
                  href={"#" + service.path}
                  className="rounded-xl border p-9 block transition-all duration-300 group h-full"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-accent)'
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-subtle)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <Icon size={28} className="text-[var(--accent-amber)] mb-4" />
                  <h3 className="font-body text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {service.name}
                  </h3>
                  <p className="font-body text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {service.desc}
                  </p>
                  <div
                    className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]"
                    style={{ color: 'var(--accent-amber)' }}
                  >
                    Learn more
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Main Page ─────────────── */
export default function ECommerceOS() {
  return (
    <div>
      <Hero />
      <Problem />
      <LivePreview />
      <Solution />
      <Features />
      <TechStack />
      <Pricing />
      <CTA />
      <CrossSell />
    </div>
  )
}
