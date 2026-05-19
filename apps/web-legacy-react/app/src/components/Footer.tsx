import { Link } from 'react-router-dom'
import { MessageCircle, Calendar, Mail, Phone } from 'lucide-react'
import { CONTACT } from '../config/contact'

const serviceLinks = [
  { name: 'Business OS', path: '/services/business-os' },
  { name: 'Command Center', path: '/services/command-center' },
  { name: 'AI Lead Engine', path: '/services/ai-lead-engine' },
  { name: 'Sales OS', path: '/services/sales-os' },
  { name: 'E-Commerce OS', path: '/services/ecommerce-os' },
  { name: 'AI Personal Agent', path: '/services/ai-personal-agent' },
  { name: 'Automation Audit', path: '/services/automation-audit' },
  { name: 'Website + CRM', path: '/services/website-crm' },
  { name: 'Database + n8n', path: '/services/database-system' },
  { name: 'AI Content Engine', path: '/services/ai-content-engine' },
]

const companyLinks = [
  { name: 'About', path: '/about' },
  { name: 'Process', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Logo + Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-0 font-display text-[22px] font-normal" style={{ color: 'var(--text-primary)' }}>
              lennoxOS
              <span className="w-1.5 h-1.5 rounded-full ml-0.5 -mt-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
            </Link>
            <p className="mt-3 font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI Business Infrastructure — Built to Run
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {CONTACT.name}
              </p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 font-body text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Mail size={14} />
                {CONTACT.email}
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 font-body text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Phone size={14} />
                {CONTACT.phone}
              </a>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-6">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: '#25D366', color: '#fff' }}
                title="Chat on WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
                title="Book a Demo"
              >
                <Calendar size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: 'var(--text-primary)' }}>
              Services
            </h4>
            <ul className="flex flex-col gap-2.5">
              {serviceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-sm transition-colors duration-200 hover:text-[var(--accent-primary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: 'var(--text-primary)' }}>
              Company
            </h4>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="font-body text-sm transition-colors duration-200 hover:text-[var(--accent-primary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CTA */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: 'var(--text-primary)' }}>
              Get Started
            </h4>
            <p className="font-body text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Ready to automate your business?
            </p>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={16} />
              WhatsApp Me
            </a>
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-body text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-90 w-full"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
            >
              <Calendar size={16} />
              Book Free Demo
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border-primary)' }}
        >
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date().getFullYear()} {CONTACT.company}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: 'var(--success)' }}
            />
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {CONTACT.name} — {CONTACT.phone}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
