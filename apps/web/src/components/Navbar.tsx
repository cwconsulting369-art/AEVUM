import { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import CONTACT from '../config/contact';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Shop', path: '/shop' },
  { label: 'SaaS', path: '/saas' },
  { label: 'Audit', path: '/audit' },
  { label: 'Cases', path: '/cases' },
  { label: 'About', path: '/about' },
];

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
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

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-16 h-16">
        {/* Logo */}
        <a href="#/" className="flex items-center gap-1.5 group">
          <span className="text-xl font-bold tracking-tight text-gold-gradient">
            AEVUM
          </span>
          <span className="w-2 h-2 rounded-full bg-[#e0a458] shadow-[0_0_8px_rgba(224,164,88,0.6)] group-hover:scale-125 transition-transform" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={"#" + link.path}
              className={`text-sm font-medium transition-colors ${
                isActive(link.path, currentPath)
                  ? 'text-[#e0a458]'
                  : 'text-[#a4a4ad] hover:text-[#F9FAFB]'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://app.aevum-system.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#7a7a85] hover:text-[#e0a458] transition-colors mr-2"
          >
            Login &rarr;
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full border border-white/10 text-[#a4a4ad] hover:text-[#e0a458] hover:border-[#e0a458]/30 transition-all"
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
            Call buchen
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#F9FAFB]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg-primary/98 backdrop-blur-xl z-40">
          <div className="flex flex-col items-center justify-center gap-8 pt-20">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={"#" + link.path}
                className={`text-2xl font-medium ${
                  isActive(link.path, currentPath)
                    ? 'text-[#e0a458]'
                    : 'text-[#a4a4ad]'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://app.aevum-system.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[#7a7a85] hover:text-[#e0a458] transition-colors"
            >
              Login &rarr; app.aevum-system.de
            </a>
            <div className="flex flex-col items-center gap-4 mt-8">
              <ThemeToggle />
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#a4a4ad] hover:text-[#e0a458]"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </a>
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3"
              >
                Call buchen
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
