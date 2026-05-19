import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Layers, LayoutDashboard, Zap, TrendingUp, ShoppingCart, Bot, Search, Globe, Database, FileText, Calendar, MessageCircle } from 'lucide-react'
import { CONTACT } from '../config/contact'

const services = [
  { name: 'Business OS', path: '/services/business-os', icon: Layers, desc: 'Complete AI Business OS' },
  { name: 'Command Center', path: '/services/command-center', icon: LayoutDashboard, desc: 'Real-time CEO dashboard' },
  { name: 'AI Lead Engine', path: '/services/ai-lead-engine', icon: Zap, desc: '24/7 lead generation' },
  { name: 'Sales OS', path: '/services/sales-os', icon: TrendingUp, desc: 'Sales operating system' },
  { name: 'E-Commerce OS', path: '/services/ecommerce-os', icon: ShoppingCart, desc: 'E-commerce platform' },
  { name: 'AI Personal Agent', path: '/services/ai-personal-agent', icon: Bot, desc: 'Dedicated AI agent' },
  { name: 'Automation Audit', path: '/services/automation-audit', icon: Search, desc: '48h process analysis' },
  { name: 'Website + CRM', path: '/services/website-crm', icon: Globe, desc: 'Landing page + automation' },
  { name: 'Database + n8n', path: '/services/database-system', icon: Database, desc: 'Database backend' },
  { name: 'AI Content Engine', path: '/services/ai-content-engine', icon: FileText, desc: 'AI content factory' },
]

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Process', path: '/#process' },
  { name: 'References', path: '/#references' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [lang, setLang] = useState<'DE' | 'EN'>('EN')
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const scrollToSection = (id: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.hash = `/#${id}`
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0 font-display text-[22px] font-normal shrink-0" style={{ color: 'var(--text-primary)' }}>
          lennoxOS
          <span className="w-1.5 h-1.5 rounded-full ml-0.5 -mt-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            className="font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button
              className="flex items-center gap-1 font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Services
              <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isServicesOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[640px]"
              >
                <div
                  className="rounded-xl border p-6 grid grid-cols-2 gap-3"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-primary)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {services.map((service) => {
                    const Icon = service.icon
                    return (
                      <Link
                        key={service.path}
                        to={service.path}
                        className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group"
                        style={{ '--hover-bg': 'rgba(245, 158, 11, 0.05)' } as React.CSSProperties}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(245, 158, 11, 0.05)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        >
                          <Icon size={18} className="text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <div className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {service.name}
                          </div>
                          <div className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {service.desc}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => scrollToSection('process')}
            className="font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Process
          </button>
          <button
            onClick={() => scrollToSection('references')}
            className="font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            References
          </button>
          <Link
            to="/about"
            className="font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="font-body text-sm font-medium transition-colors duration-200 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contact
          </Link>
        </div>

        {/* Right side: CTA + Language */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-1.5"
            style={{ padding: '10px 24px', fontSize: '13px' }}
          >
            <Calendar size={14} />
            Book Demo
          </a>
          <div className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            <button
              onClick={() => setLang('DE')}
              className="transition-colors duration-200"
              style={{ color: lang === 'DE' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            >
              DE
            </button>
            <span>|</span>
            <button
              onClick={() => setLang('EN')}
              className="transition-colors duration-200"
              style={{ color: lang === 'EN' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{ color: 'var(--text-primary)' }}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[72px] z-40 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div className="px-6 py-8 flex flex-col gap-4">
            <Link to="/" className="font-body text-lg font-medium py-2" style={{ color: 'var(--text-primary)' }}>
              Home
            </Link>

            {/* Mobile Services Accordion */}
            <div>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center justify-between w-full font-body text-lg font-medium py-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Services
                <ChevronDown size={18} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isServicesOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-2">
                  {services.map((service) => {
                    const Icon = service.icon
                    return (
                      <Link
                        key={service.path}
                        to={service.path}
                        className="flex items-center gap-3 py-2 font-body text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Icon size={16} className="text-[var(--accent-primary)]" />
                        {service.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => { setIsMobileOpen(false); setTimeout(() => scrollToSection('process'), 100) }}
              className="text-left font-body text-lg font-medium py-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Process
            </button>
            <button
              onClick={() => { setIsMobileOpen(false); setTimeout(() => scrollToSection('references'), 100) }}
              className="text-left font-body text-lg font-medium py-2"
              style={{ color: 'var(--text-primary)' }}
            >
              References
            </button>
            <Link to="/about" className="font-body text-lg font-medium py-2" style={{ color: 'var(--text-primary)' }}>
              About
            </Link>
            <Link to="/contact" className="font-body text-lg font-medium py-2" style={{ color: 'var(--text-primary)' }}>
              Contact
            </Link>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <Link to="/contact" className="btn-primary w-full text-center block">
                Book Demo
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 font-mono text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
              <button
                onClick={() => setLang('DE')}
                style={{ color: lang === 'DE' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                DE
              </button>
              <span>|</span>
              <button
                onClick={() => setLang('EN')}
                style={{ color: lang === 'EN' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
