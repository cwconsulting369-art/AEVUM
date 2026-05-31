import { NavLink, Outlet, useLocation, useMatch } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import {
  LogOut, LayoutDashboard, User, ShieldCheck, FolderGit2,
  BarChart2, DollarSign, Mail, ShoppingBag, Globe, Bot,
  KeyRound, TrendingUp, ChevronLeft, Users, Menu, X, Coins,
  Link as LinkIcon, FolderOpen, Megaphone, Film, ShieldAlert, Wrench,
  Funnel, Activity
} from 'lucide-react';
import { Link } from 'react-router';
import Footer from './Footer';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';
import CustomerSwitcher from './CustomerSwitcher';
import { getManifestByProjectSlug } from '@/lib/manifests';

// ── Generic portal nav ────────────────────────────────────────
// Power-User-Whitelist via env (config in apps/portal/.env or Vercel-env: VITE_POWER_USER_EMAILS as comma-separated list)
const POWER_USER_EMAILS = (import.meta.env.VITE_POWER_USER_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);
const TIM_WHITELIST = new Set<string>(POWER_USER_EMAILS);

const portalNav = [
  { to: '/dashboard',   labelKey: 'nav.dashboard',   icon: LayoutDashboard },
  { to: '/projects',    labelKey: 'nav.projects',    icon: FolderGit2 },
  { to: '/documents',   labelKey: 'nav.documents',   icon: FolderOpen },
  { to: '/credits',     labelKey: 'nav.credits',     icon: Coins },
  { to: '/profile',     labelKey: 'nav.profile',     icon: User },
  { to: '/permissions', labelKey: 'nav.permissions', icon: ShieldCheck },
  { to: '/testimonial', labelKey: 'nav.testimonial', icon: Megaphone },
];

const toolsNav = [
  { to: '/tools/script-factory', labelKey: 'nav.scriptFactory', icon: Film },
  { to: '/tools/dsgvo-factory',  labelKey: 'nav.dsgvoFactory',  icon: ShieldAlert },
];
const toolsNavTimOnly = [
  { to: '/tools/script-factory/customers', labelKey: 'nav.timsCustomers', icon: Users },
];

// ── Per-project sidebar config ───────────────────────────────
type ProjectSection = { s: string; labelKey: string; icon: React.ElementType; dividerBefore?: boolean };

const PROJECT_SECTIONS: Record<string, ProjectSection[]> = {
  collaglow: [
    { s: 'overview',      labelKey: 'nav.overview',     icon: LayoutDashboard },
    { s: 'ads',           labelKey: 'nav.ads',          icon: BarChart2 },
    { s: 'spend',         labelKey: 'nav.spend',        icon: DollarSign },
    { s: 'email',         labelKey: 'nav.email',        icon: Mail },
    { s: 'shop',          labelKey: 'nav.shop',         icon: ShoppingBag },
    { s: 'intelligence',  labelKey: 'nav.intelligence', icon: Globe, dividerBefore: true },
    { s: 'quicklinks',    labelKey: 'nav.quicklinks',   icon: LinkIcon },
    { s: 'docs',          labelKey: 'nav.docs',         icon: FolderOpen },
    { s: 'activity',      labelKey: 'nav.activity',     icon: Activity },
    { s: 'agent',         labelKey: 'nav.agent',        icon: Bot },
    { s: 'apis',          labelKey: 'nav.apis',         icon: KeyRound },
  ],
  aevum: [
    { s: 'overview',   labelKey: 'nav.overview',   icon: LayoutDashboard },
    { s: 'pipeline',   labelKey: 'nav.pipeline',   icon: TrendingUp },
    { s: 'revenue',    labelKey: 'nav.revenue',    icon: DollarSign },
    { s: 'kunden',     labelKey: 'nav.kunden',     icon: Users },
    { s: 'content',    labelKey: 'nav.content',    icon: Globe },
    { s: 'quicklinks', labelKey: 'nav.quicklinks', icon: LinkIcon, dividerBefore: true },
    { s: 'docs',       labelKey: 'nav.docs',       icon: FolderOpen },
    { s: 'activity',   labelKey: 'nav.activity',   icon: Activity },
    { s: 'agent',      labelKey: 'nav.agent',      icon: Bot },
    { s: 'apis',       labelKey: 'nav.apis',       icon: KeyRound },
  ],
  'thailand-re-leadfunnel': [
    { s: 'overview',    labelKey: 'nav.overview',   icon: LayoutDashboard },
    { s: 'lead-funnel', labelKey: 'nav.leadFunnel', icon: Funnel },
    { s: 'quicklinks',  labelKey: 'nav.quicklinks', icon: LinkIcon, dividerBefore: true },
    { s: 'docs',        labelKey: 'nav.docs',       icon: FolderOpen },
    { s: 'activity',    labelKey: 'nav.activity',   icon: Activity },
    { s: 'agent',       labelKey: 'nav.agent',      icon: Bot },
    { s: 'apis',        labelKey: 'nav.apis',       icon: KeyRound },
  ],
  'utilityhub-platform': [
    { s: 'overview',       labelKey: 'nav.overview',      icon: LayoutDashboard },
    { s: 'customers',      labelKey: 'nav.customers',     icon: Users },
    { s: 'organizations',  labelKey: 'nav.organizations', icon: Globe },
    { s: 'contacts',       labelKey: 'nav.contacts',      icon: Users },
    { s: 'imports',        labelKey: 'nav.imports',       icon: FolderOpen },
    { s: 'fg-finanz',      labelKey: 'nav.fgFinanz',      icon: DollarSign },
    { s: 'reports',        labelKey: 'nav.reports',       icon: TrendingUp },
    { s: 'uh-documents',   labelKey: 'nav.uhDocuments',   icon: FolderOpen, dividerBefore: true },
    { s: 'uh-incentives',  labelKey: 'nav.uhIncentives',  icon: DollarSign },
    { s: 'uh-support',     labelKey: 'nav.uhSupport',     icon: Bot },
    { s: 'uh-roadmap',     labelKey: 'nav.uhRoadmap',     icon: Activity },
    { s: 'close',          labelKey: 'nav.close',         icon: Globe, dividerBefore: true },
    { s: 'airtable',       labelKey: 'nav.airtable',      icon: FolderOpen },
    { s: 'notion',         labelKey: 'nav.notion',        icon: FolderOpen },
    { s: 'uh-settings',    labelKey: 'nav.integrations',  icon: Globe },
    { s: 'quicklinks',     labelKey: 'nav.quicklinks',    icon: LinkIcon, dividerBefore: true },
    { s: 'docs',           labelKey: 'nav.portalDocs',    icon: FolderOpen },
    { s: 'activity',       labelKey: 'nav.activity',      icon: Activity },
    { s: 'agent',          labelKey: 'nav.agent',         icon: Bot },
    { s: 'apis',           labelKey: 'nav.apis',          icon: KeyRound },
  ],
  utilityhub: [
    { s: 'overview',       labelKey: 'nav.overview',      icon: LayoutDashboard },
    { s: 'customers',      labelKey: 'nav.customers',     icon: Users },
    { s: 'organizations',  labelKey: 'nav.organizations', icon: Globe },
    { s: 'contacts',       labelKey: 'nav.contacts',      icon: Users },
    { s: 'imports',        labelKey: 'nav.imports',       icon: FolderOpen },
    { s: 'fg-finanz',      labelKey: 'nav.fgFinanz',      icon: DollarSign },
    { s: 'reports',        labelKey: 'nav.reports',       icon: TrendingUp },
    { s: 'uh-documents',   labelKey: 'nav.uhDocuments',   icon: FolderOpen, dividerBefore: true },
    { s: 'uh-incentives',  labelKey: 'nav.uhIncentives',  icon: DollarSign },
    { s: 'uh-support',     labelKey: 'nav.uhSupport',     icon: Bot },
    { s: 'uh-roadmap',     labelKey: 'nav.uhRoadmap',     icon: Activity },
    { s: 'close',          labelKey: 'nav.close',         icon: Globe, dividerBefore: true },
    { s: 'airtable',       labelKey: 'nav.airtable',      icon: FolderOpen },
    { s: 'notion',         labelKey: 'nav.notion',        icon: FolderOpen },
    { s: 'uh-settings',    labelKey: 'nav.integrations',  icon: Globe },
    { s: 'quicklinks',     labelKey: 'nav.quicklinks',    icon: LinkIcon, dividerBefore: true },
    { s: 'docs',           labelKey: 'nav.portalDocs',    icon: FolderOpen },
    { s: 'activity',       labelKey: 'nav.activity',      icon: Activity },
    { s: 'agent',          labelKey: 'nav.agent',         icon: Bot },
    { s: 'apis',           labelKey: 'nav.apis',          icon: KeyRound },
  ],
};

const DEFAULT_PROJECT_SECTIONS: ProjectSection[] = [
  { s: 'overview',    labelKey: 'nav.overview',   icon: TrendingUp },
  { s: 'quicklinks',  labelKey: 'nav.quicklinks', icon: LinkIcon },
  { s: 'docs',        labelKey: 'nav.docs',       icon: FolderOpen },
  { s: 'activity',    labelKey: 'nav.activity',   icon: Activity },
  { s: 'agent',       labelKey: 'nav.agent',      icon: Bot },
  { s: 'apis',        labelKey: 'nav.apis',       icon: KeyRound },
];

function initials(name?: string, email?: string) {
  const src = name || email || '?';
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

export default function Layout() {
  const { t } = useTranslation();
  const { me, logout } = useAuth();
  const loc = useLocation();
  const projectMatch = useMatch('/projects/:slug');
  const projectMatchDeep = useMatch('/projects/:slug/*');
  const slug = projectMatch?.params.slug || projectMatchDeep?.params.slug;
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => { setMobileNav(false); }, [loc.pathname, loc.search]);

  const inProject = !!slug;
  const sections = slug ? (PROJECT_SECTIONS[slug] ?? DEFAULT_PROJECT_SECTIONS) : null;
  const currentSection = new URLSearchParams(loc.search).get('s') || (sections?.[0]?.s ?? '');
  const currentSectionKey = inProject
    ? (sections?.find(s => s.s === currentSection)?.labelKey ?? 'nav.overview')
    : portalNav.find(n => loc.pathname.startsWith(n.to))?.labelKey;
  const currentLabel = currentSectionKey ? t(currentSectionKey) : undefined;

  // War-Room CommandShell-Projekte bringen ihre EIGENE linke Nav (cmd-nav) mit.
  // Für sie die generische Portal-Sidebar weglassen → genau EINE übersichtliche
  // linke Menüleiste statt zwei nebeneinander.
  const hasManifest = !!(slug && getManifestByProjectSlug(slug));
  if (hasManifest) {
    return (
      <div className="min-h-screen bg-ink-950 text-ink-100">
        <div aria-hidden className="fixed inset-0 pointer-events-none bg-gold-radial opacity-50 z-0" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex items-center justify-between px-4 md:px-6 xl:px-8 pt-4">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-xs text-ink-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <ChevronLeft size={13} /> {t('nav.back')}
            </Link>
            <div className="flex items-center gap-3">
              <CustomerSwitcher />
              <LanguageToggle />
              <span className="text-[0.65rem] text-ink-500 hidden sm:block">{me?.account.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-rose-300 transition px-3 py-1.5 rounded-lg hover:bg-white/5"
                title={t('nav.logout')}
              >
                <LogOut size={13} /> <span className="hidden sm:inline">{t('nav.logout')}</span>
              </button>
            </div>
          </div>
          <main className="flex-1 px-4 md:px-6 xl:px-8 py-5 w-full pb-16" key={loc.pathname}>
            <div className="animate-fade-up"><Outlet /></div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <div aria-hidden className="fixed inset-0 pointer-events-none bg-gold-radial opacity-50 z-0" />

      {/* Mobile backdrop */}
      {mobileNav && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Sidebar — fixed on all screen sizes */}
      <aside className={[
        'fixed inset-y-0 left-0 flex flex-col bg-ink-900/80 backdrop-blur-xl border-r border-white/5 z-30',
        'w-64 md:w-56 transition-transform duration-200',
        mobileNav ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ].join(' ')}>
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <Brand size={28} />
          <button
            className="md:hidden p-1 rounded text-ink-500 hover:text-white transition"
            onClick={() => setMobileNav(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Project mode */}
        {inProject && sections ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-3 mb-3">
              <Link
                to="/projects"
                className="flex items-center gap-2 text-[0.7rem] text-ink-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
              >
                <ChevronLeft size={12} /> {t('nav.back')}
              </Link>
            </div>

            <div className="px-4 mb-4">
              <div className="text-[0.6rem] uppercase tracking-widest text-ink-500 font-semibold mb-1">{t('nav.project')}</div>
              <div className="text-sm font-semibold text-white capitalize">{slug}</div>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 pb-4">
              {sections.map(({ s, labelKey, icon: Icon, dividerBefore }, i) => {
                const isActive = s === currentSection;
                return (
                  <div key={s}>
                    {dividerBefore && <div className="my-2 border-t border-white/5" />}
                    <Link
                      to={`/projects/${slug}?s=${s}`}
                      className={[
                        'nav-item animate-fade-up',
                        isActive ? 'nav-item-active' : ''
                      ].join(' ')}
                      style={{ animationDelay: `${50 + i * 40}ms` }}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      <span>{t(labelKey)}</span>
                      {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-gold-400 opacity-70" />}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>
        ) : (
          /* Generic portal nav */
          <nav className="flex-1 px-3 space-y-0.5 pb-4 overflow-y-auto">
            {portalNav.map(({ to, labelKey, icon: Icon }, i) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} animate-fade-up`}
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}

            {me?.account.account_type !== 'shop' && (
              <>
                <div className="mt-4 mb-1.5 px-3 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-widest text-ink-500 font-semibold">
                  <Wrench size={10} /> {t('nav.tools')}
                </div>
                {toolsNav.map(({ to, labelKey, icon: Icon }, i) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} animate-fade-up`}
                    style={{ animationDelay: `${60 + (portalNav.length + i) * 50}ms` }}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                    <span>{t(labelKey)}</span>
                  </NavLink>
                ))}
                {!!(me?.account.email && TIM_WHITELIST.has(me.account.email.toLowerCase())) &&
                  toolsNavTimOnly.map(({ to, labelKey, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      <span>{t(labelKey)}</span>
                    </NavLink>
                  ))
                }
              </>
            )}
          </nav>
        )}
      </aside>

      {/* Main — offset by sidebar width on desktop */}
      <div className="relative md:ml-56 flex flex-col min-h-screen z-10">
        {/* Top-bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <button
              className="md:hidden p-1.5 rounded-md text-ink-400 hover:text-white hover:bg-white/5 transition"
              onClick={() => setMobileNav(v => !v)}
            >
              <Menu size={16} />
            </button>
            {inProject ? (
              <>
                <span className="text-ink-500 text-xs capitalize">{slug}</span>
                <span className="text-ink-700">/</span>
                <span className="text-white font-medium text-sm">{currentLabel}</span>
              </>
            ) : (
              <>
                <span className="text-ink-400 text-xs">{t('nav.portal')}</span>
                <span className="text-ink-700">/</span>
                <span className="text-white font-medium text-sm">{currentLabel || t('nav.overview')}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <CustomerSwitcher />
            <LanguageToggle />
            <div className="text-[0.65rem] text-ink-500 hidden sm:block">{me?.account.email}</div>
            <div className="dot dot-ok" title={t('nav.online')} />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 xl:px-8 py-5 md:py-6 xl:py-7 w-full pb-24" key={loc.pathname + currentSection}>
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>

      {/* Floating user card — fixed bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 shadow-lg">
          <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-[0.65rem] font-bold text-ink-950 shadow-glow-gold shrink-0">
            {initials(me?.account.name, me?.account.email)}
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="text-xs font-medium text-white truncate max-w-[120px]">
              {me?.account.name || me?.account.email || '—'}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-ink-400 hover:text-rose-300 transition rounded-md hover:bg-white/5"
            title={t('nav.logout')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
