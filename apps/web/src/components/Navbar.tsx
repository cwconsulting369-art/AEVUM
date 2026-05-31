import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, MessageCircle } from 'lucide-react';
import CONTACT from '../config/contact';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

const navLinks = [
  { key: 'shop', path: '/shop' },
  { key: 'saas', path: '/saas' },
  { key: 'audit', path: '/audit' },
  { key: 'cases', path: '/cases' },
  { key: 'about', path: '/about' },
] as const;

function getCurrentPath() {
  const hash = window.location.hash;
  if (!hash || hash === '#/' || hash === '') return '/';
  return hash.replace('#', '').split('?')[0];
}

function isActive(navPath: string, currentPath: string) {
  if (navPath === '/') return currentPath === '/';
  return currentPath === navPath || currentPath.startsWith(navPath + '/');
}

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); // sync initial state (deep-link / reload mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      setCurrentPath(getCurrentPath());
      setMobileOpen(false);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Lock body scroll while the mobile menu is open (prevents background scroll jank).
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-theme-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-5 sm:px-6 lg:px-16 h-16">
        {/* Logo */}
        <a href="#/" className="flex items-center gap-1.5 group shrink-0">
          <span className="text-xl font-bold tracking-tight text-gold-gradient">
            AEVUM
          </span>
          <span className="w-2 h-2 rounded-full bg-theme-accent shadow-glow group-hover:scale-125 transition-transform" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={"#" + link.path}
              className={`text-sm font-medium transition-colors ${
                isActive(link.path, currentPath)
                  ? 'text-theme-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href="https://app.aevum-system.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-theme-accent transition-colors mr-2"
          >
            {t('nav.login')} &rarr;
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full border border-theme-border text-text-secondary hover:text-theme-accent hover:border-theme-border-accent transition-all"
            aria-label="WhatsApp"
          >
            <MessageCircle size={18} />
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm px-5 py-2"
          >
            {t('nav.bookCall')}
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden -mr-2 p-2 text-text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('nav.menuToggle')}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg-primary/98 backdrop-blur-xl z-40 overflow-y-auto overscroll-contain">
          <div className="flex flex-col items-center justify-start gap-7 px-6 pt-12 pb-16 min-h-full">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={"#" + link.path}
                className={`text-2xl font-medium ${
                  isActive(link.path, currentPath)
                    ? 'text-theme-accent'
                    : 'text-text-secondary'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
            <a
              href="https://app.aevum-system.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-text-muted hover:text-theme-accent transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Login &rarr; app.aevum-system.de
            </a>
            <div className="flex flex-col items-center gap-5 mt-4">
              <LanguageToggle />
              <ThemeToggle />
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-secondary hover:text-theme-accent"
              >
                <MessageCircle size={20} />
                <span>{t('nav.whatsapp')}</span>
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.bookCall')}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
