
import { MessageCircle, Calendar, Mail, Phone, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CONTACT from '../config/contact';
import WaitlistForm from './WaitlistForm';

interface FooterColumnProps {
  title: string;
  links: { label: string; path: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-theme-accent mb-5">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={"#" + link.path}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors break-words"
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
  const { t } = useTranslation();

  const shopLinks = [
    { label: t('footer.shopBlueprints'), path: '/shop' },
    { label: t('footer.shopDoneForYou'), path: '/shop' },
    { label: t('footer.shopBundle'), path: '/shop' },
  ];

  const saasLinks = [
    { label: t('footer.saasAllTools'), path: '/saas' },
    { label: t('footer.saasCreditPackages'), path: '/saas' },
    { label: t('footer.saasSelfServiceSignup'), path: '/saas' },
  ];

  const auditLinks = [
    { label: t('footer.auditFree'), path: '/audit' },
    { label: t('footer.auditPreLaunchList'), path: '/waitlist' },
    { label: t('footer.auditCases'), path: '/cases' },
    { label: t('footer.auditMethod'), path: '/method' },
    { label: t('footer.auditAbout'), path: '/about' },
  ];

  const legalLinks = [
    { label: t('footer.legalDatenschutz'), path: '/datenschutz' },
    { label: t('footer.legalImpressum'), path: '/impressum' },
    { label: t('footer.legalAgb'), path: '/agb' },
    { label: t('footer.legalWiderruf'), path: '/widerrufsbelehrung' },
  ];

  return (
    <footer className="bg-bg-surface border-t border-theme-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-16 lg:py-20">
        {/* Pre-Launch Email-Capture (Block A2) */}
        <div className="mb-14 pb-14 border-b border-theme-border grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-theme-accent mb-3 border border-theme-border-accent bg-theme-accent/[0.06] px-2.5 py-1">
              <Sparkles size={11} />
              {t('footer.preLaunchBadge')}
            </span>
            <h3 className="text-xl md:text-2xl font-light tracking-tight text-text-primary mb-3 leading-snug">
              {t('footer.preLaunchHeadline1')}
              <span className="block text-gradient font-medium">{t('footer.preLaunchHeadline2')}</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('footer.preLaunchText')}
              <a href="#/waitlist" className="text-theme-accent hover:underline">
                {t('footer.preLaunchLink')}
              </a>
            </p>
          </div>
          <div>
            <WaitlistForm source="footer" showTierPicker={false} compact />
          </div>
        </div>

        {/* Brand + Contact Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14 pb-14 border-b border-theme-border">
          <div className="min-w-0">
            <a href="#/" className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold tracking-tight text-text-primary font-[Space_Grotesk]">
                AEVUM
              </span>
              <span className="w-2 h-2 rounded-full bg-theme-accent" />
            </a>
            <p className="text-sm text-text-secondary leading-relaxed mb-3 max-w-md">
              {t('footer.brandTagline')}
            </p>
            <p className="text-xs text-text-muted leading-relaxed max-w-md">
              {t('footer.brandSolo')}
            </p>
          </div>

          <div className="lg:text-right min-w-0">
            <p className="text-sm text-text-primary font-medium mb-3">{CONTACT.name}</p>
            <div className="flex flex-col lg:items-end gap-2 mb-5">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent transition-colors break-all"
              >
                <Mail size={14} className="shrink-0" />
                {CONTACT.email}
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent transition-colors"
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
                {t('footer.whatsapp')}
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm py-2.5 px-5 inline-flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                {t('footer.bookCall')}
              </a>
            </div>
          </div>
        </div>

        {/* 4 Spalten: Shop · SaaS · Audit · Rechtliches */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <FooterColumn title={t('footer.colShop')} links={shopLinks} />
          <FooterColumn title={t('footer.colSaas')} links={saasLinks} />
          <FooterColumn title={t('footer.colAudit')} links={auditLinks} />
          <FooterColumn title={t('footer.colLegal')} links={legalLinks} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-theme-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-text-muted">
            {t('footer.copyright', { company: CONTACT.company })}
          </p>
          <p className="text-xs text-text-muted font-mono">
            {t('footer.bottomMeta')}
          </p>
        </div>
      </div>
    </footer>
  );
}
