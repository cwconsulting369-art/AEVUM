import { useState, type FormEvent } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Mail, Phone, Calendar, Clock, ChevronDown, ChevronUp,
  MessageCircle, ArrowRight, CheckCircle
} from 'lucide-react'
import { CONTACT } from '../config/contact'

const containerReveal = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
}

const itemReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } }
}

const faqs = [
  { q: 'How fast can you start?', a: 'Most projects start within 48 hours. For the Automation Audit, you get results in 48 hours. Larger implementations like the full Business OS typically begin within 5-7 business days.' },
  { q: 'Do you work with international clients?', a: 'Yes! I operate in both German and English. My stack (Hetzner, Supabase, n8n) works worldwide. All services are delivered remotely.' },
  { q: 'What does the free demo include?', a: 'A 20-minute video call where I show you my live systems (lennoxOS dashboard, UtilityHub, KetoLabsOS) and discuss your specific needs. No commitment, no sales pressure.' },
  { q: 'Is there a minimum contract period?', a: 'Monthly services can be cancelled with 30 days notice. One-time projects (Automation Audit) have no ongoing commitment. I want you to stay because it works, not because you are locked in.' },
  { q: 'What industries do you specialize in?', a: 'Real estate, aesthetic medicine, law firms, B2B services, energy sales, and e-commerce. My systems are industry-agnostic though — the core automation principles work everywhere.' },
  { q: 'Can I see live examples?', a: 'Absolutely. During the demo I show you live systems: lennoxOS (my own dashboard), UtilityHub (B2B sales OS), and KetoLabsOS (e-commerce). No mockups — real production systems.' },
]

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-[#0F172A] min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F59E0B]/[0.03] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
            className="max-w-3xl"
          >
            <p className="font-mono text-xs text-[#F59E0B] uppercase tracking-[0.15em] mb-4">
              Get in Touch
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#F8FAFC] tracking-tight leading-[1.1] mb-4">
              Let's Build Your{' '}
              <span className="text-[#F59E0B]">AI Infrastructure</span>
            </h1>
            <p className="text-lg text-[#94A3B8] leading-relaxed max-w-2xl">
              Book a free 20-minute demo or send me a message. I typically respond within 2 hours during business hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT FORM + INFO ─── */}
      <section ref={ref} className="pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.div
              variants={containerReveal}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="lg:col-span-3 bg-[#1E293B] border border-[rgba(148,163,184,0.15)] rounded-xl p-8 md:p-10"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-6" />
                  <h3 className="text-2xl font-medium text-[#F8FAFC] mb-3">Message Sent!</h3>
                  <p className="text-[#94A3B8] mb-6">I'll get back to you within 2 hours.</p>
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white font-medium px-6 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Or chat on WhatsApp now
                  </a>
                </div>
              ) : (
                <>
                  <motion.h3 variants={itemReveal} className="text-2xl font-medium text-[#F8FAFC] mb-2">
                    Send a Message
                  </motion.h3>
                  <motion.p variants={itemReveal} className="text-[#94A3B8] mb-8">
                    Fill out the form and I'll get back to you quickly.
                  </motion.p>

                  <form action="https://formspree.io/f/cwconsulting369@gmail.com" method="POST" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <motion.div variants={itemReveal}>
                        <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full bg-[#0F172A] border border-[rgba(148,163,184,0.2)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B] transition-colors"
                          placeholder="Your name"
                        />
                      </motion.div>
                      <motion.div variants={itemReveal}>
                        <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full bg-[#0F172A] border border-[rgba(148,163,184,0.2)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B] transition-colors"
                          placeholder="you@company.com"
                        />
                      </motion.div>
                    </div>
                    <motion.div variants={itemReveal}>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        className="w-full bg-[#0F172A] border border-[rgba(148,163,184,0.2)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B] transition-colors"
                        placeholder="Your company name"
                      />
                    </motion.div>
                    <motion.div variants={itemReveal}>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Service Interest</label>
                      <select
                        name="service"
                        className="w-full bg-[#0F172A] border border-[rgba(148,163,184,0.2)] rounded-lg px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#F59E0B] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select a service...</option>
                        <option value="business-os">lennoxOS Business OS</option>
                        <option value="command-center">Command Center Dashboard</option>
                        <option value="lead-engine">AI Lead Engine</option>
                        <option value="sales-os">Sales OS</option>
                        <option value="ecommerce-os">E-Commerce OS</option>
                        <option value="personal-agent">AI Personal Agent</option>
                        <option value="automation-audit">Automation Audit</option>
                        <option value="website-crm">Website + CRM + Automation</option>
                        <option value="database">Database System + n8n</option>
                        <option value="content-engine">AI Content Engine</option>
                        <option value="other">Something else</option>
                      </select>
                    </motion.div>
                    <motion.div variants={itemReveal}>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Message</label>
                      <textarea
                        name="message"
                        rows={4}
                        required
                        className="w-full bg-[#0F172A] border border-[rgba(148,163,184,0.2)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B] transition-colors resize-none"
                        placeholder="Tell me about your project or challenge..."
                      />
                    </motion.div>
                    <motion.div variants={itemReveal}>
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F172A] font-semibold px-6 py-3.5 rounded-lg text-sm hover:bg-[#D97706] transition-colors"
                      >
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </form>
                </>
              )}
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              variants={containerReveal}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="lg:col-span-2 space-y-6"
            >
              {/* Quick Actions */}
              <motion.div variants={itemReveal} className="bg-[#1E293B] border border-[rgba(148,163,184,0.15)] rounded-xl p-6">
                <h4 className="text-lg font-medium text-[#F8FAFC] mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg hover:bg-[#25D366]/20 transition-colors group"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <div>
                      <p className="text-[#F8FAFC] font-medium text-sm">WhatsApp</p>
                      <p className="text-[#94A3B8] text-xs">Usually replies in minutes</p>
                    </div>
                  </a>
                  <a
                    href={CONTACT.calendly}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg hover:bg-[#F59E0B]/20 transition-colors group"
                  >
                    <Calendar className="w-5 h-5 text-[#F59E0B]" />
                    <div>
                      <p className="text-[#F8FAFC] font-medium text-sm">Book a Demo</p>
                      <p className="text-[#94A3B8] text-xs">Free 20-minute call</p>
                    </div>
                  </a>
                </div>
              </motion.div>

              {/* Contact Details */}
              <motion.div variants={itemReveal} className="bg-[#1E293B] border border-[rgba(148,163,184,0.15)] rounded-xl p-6">
                <h4 className="text-lg font-medium text-[#F8FAFC] mb-4">Contact Details</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#F8FAFC] font-medium text-sm">{CONTACT.name}</p>
                      <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-[#94A3B8] text-sm hover:text-[#F59E0B] transition-colors">
                        {CONTACT.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                    <a href={`mailto:${CONTACT.email}`} className="text-[#94A3B8] text-sm hover:text-[#F59E0B] transition-colors">
                      {CONTACT.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                    <p className="text-[#94A3B8] text-sm">Reply within 2h during business hours</p>
                  </div>
                </div>
              </motion.div>

              {/* Availability */}
              <motion.div variants={itemReveal} className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-[#10B981] rounded-full animate-ping opacity-50" />
                </div>
                <p className="text-[#10B981] font-medium text-sm">Currently accepting new projects</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-medium text-[#F8FAFC] tracking-tight mb-4 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-[#94A3B8] text-center mb-12">
              Quick answers to common questions. Still unsure? <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#F59E0B] hover:underline">WhatsApp me</a>.
            </p>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={itemReveal}
                  className="bg-[#1E293B] border border-[rgba(148,163,184,0.15)] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgba(245,158,11,0.03)] transition-colors"
                  >
                    <span className="text-[#F8FAFC] font-medium pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-[#94A3B8] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
