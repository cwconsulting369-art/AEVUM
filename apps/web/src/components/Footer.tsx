
import { MessageCircle, Calendar, Mail, Phone } from 'lucide-react';
import CONTACT from '../config/contact';

const shopLinks = [
  { label: 'Blueprints', path: '/shop' },
  { label: 'Done-For-You', path: '/shop' },
  { label: 'Bundle', path: '/shop' },
];

const saasLinks = [
  { label: 'Alle Tools', path: '/saas' },
  { label: 'Credit-Pakete', path: '/saas' },
  { label: 'Self-Service-Signup', path: '/saas' },
];

const auditLinks = [
  { label: 'Kostenloses Audit', path: '/audit' },
  { label: 'Cases', path: '/cases' },
  { label: 'Method', path: '/method' },
  { label: 'About', path: '/about' },
];

const legalLinks = [
  { label: 'Datenschutz', path: '/datenschutz' },
  { label: 'Impressum', path: '/impressum' },
  { label: 'AGB', path: '/agb' },
  { label: 'Widerruf', path: '/widerrufsbelehrung' },
];

interface FooterColumnProps {
  title: string;
  links: { label: string; path: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-[#e0a458] mb-5">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={"#" + link.path}
              className="text-sm text-[#a4a4ad] hover:text-[#F9FAFB] transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-16 lg:py-20">
        {/* Brand + Contact Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14 pb-14 border-b border-white/10">
          <div>
            <a href="#/" className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold tracking-tight text-[#F9FAFB] font-[Space_Grotesk]">
                AEVUM
              </span>
              <span className="w-2 h-2 rounded-full bg-[#e0a458]" />
            </a>
            <p className="text-sm text-[#a4a4ad] leading-relaxed mb-3 max-w-md">
              Operating-System für Unternehmen. Drei Wege rein: Shop · SaaS · Full-Partnership.
            </p>
            <p className="text-xs text-[#9a9aa5] leading-relaxed max-w-md">
              Solo gefuehrt aus Augsburg. Wenn dir jemand schreibt — ich bin's selbst.
              Keine Account-Manager-Kette, keine Uebergaben.
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-sm text-[#F9FAFB] font-medium mb-3">{CONTACT.name}</p>
            <div className="flex flex-col lg:items-end gap-2 mb-5">
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
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2.5 px-5 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm py-2.5 px-5 inline-flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Call buchen
              </a>
            </div>
          </div>
        </div>

        {/* 4 Spalten: Shop · SaaS · Audit · Rechtliches */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="SaaS" links={saasLinks} />
          <FooterColumn title="Audit" links={auditLinks} />
          <FooterColumn title="Rechtliches" links={legalLinks} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9a9aa5]">
            &copy; 2026 {CONTACT.company}. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-[#9a9aa5] font-mono">
            Deutsch · DSGVO · Maßgeschneidert
          </p>
        </div>
      </div>
    </footer>
  );
}
