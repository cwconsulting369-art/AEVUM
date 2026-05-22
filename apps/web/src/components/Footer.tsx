
import { MessageCircle, Calendar, Mail, Phone } from 'lucide-react';
import CONTACT from '../config/contact';

const productLinks = [
  { label: 'Dashboard', path: '/method' },
  { label: 'Agent', path: '/method' },
  { label: 'Workflows', path: '/method' },
];

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Cases', path: '/cases' },
  { label: 'Method', path: '/method' },
  { label: 'Audit', path: '/audit' },
  { label: 'About', path: '/about' },
];

export default function Footer() {
  return (
    <footer className="bg-[#111116] border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a href="#/" className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold tracking-tight text-[#F9FAFB] font-[Space_Grotesk]">
                AEVUM
              </span>
              <span className="w-2 h-2 rounded-full bg-[#e0a458]" />
            </a>
            <p className="text-sm text-[#a4a4ad] leading-relaxed mb-3">
              Individuelle KI-Betriebssysteme fuer Unternehmen.
            </p>
            <p className="text-xs text-[#7a7a85] leading-relaxed mb-6">
              Solo gefuehrt aus Augsburg. Wenn dir jemand schreibt — ich bin's selbst.
              Keine Account-Manager-Kette, keine Uebergaben.
            </p>
            <div className="flex gap-3">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-white/10 text-[#a4a4ad] hover:text-[#e0a458] hover:border-[#e0a458]/30 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-white/10 text-[#a4a4ad] hover:text-[#e0a458] hover:border-[#e0a458]/30 transition-all"
                aria-label="Call buchen"
              >
                <Calendar size={18} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-[#7a7a85] mb-6">
              Produkt
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={"#" + link.path}
                    className="text-sm text-[#a4a4ad] hover:text-[#e0a458] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-[#7a7a85] mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={"#" + link.path}
                    className="text-sm text-[#a4a4ad] hover:text-[#e0a458] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-[#7a7a85] mb-6">
              Kontakt
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-[#F9FAFB] font-medium">{CONTACT.name}</p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 text-sm text-[#a4a4ad] hover:text-[#e0a458] transition-colors"
              >
                <Mail size={14} />
                {CONTACT.email}
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm text-[#a4a4ad] hover:text-[#e0a458] transition-colors"
              >
                <Phone size={14} />
                {CONTACT.phone}
              </a>
              <div className="flex flex-col gap-3 pt-2">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm text-center py-2.5 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
                <a
                  href={CONTACT.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm text-center py-2.5 flex items-center justify-center gap-2"
                >
                  <Calendar size={16} />
                  Call buchen
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#7a7a85]">
            &copy; 2026 {CONTACT.company}. Alle Rechte vorbehalten.
          </p>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            <a href="#/datenschutz" className="text-xs text-[#7a7a85] hover:text-[#e0a458] transition-colors">
              Datenschutz
            </a>
            <a href="#/impressum" className="text-xs text-[#7a7a85] hover:text-[#e0a458] transition-colors">
              Impressum
            </a>
            <a href="#/agb" className="text-xs text-[#7a7a85] hover:text-[#e0a458] transition-colors">
              AGB
            </a>
            <a href="#/widerrufsbelehrung" className="text-xs text-[#7a7a85] hover:text-[#e0a458] transition-colors">
              Widerruf
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
