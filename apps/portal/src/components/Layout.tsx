import { NavLink, Outlet, useLocation, useMatch } from 'react-router';
import { useAuth } from '@/lib/auth';
import {
  LogOut, LayoutDashboard, User, ShieldCheck, FolderGit2,
  BarChart2, DollarSign, Mail, ShoppingBag, Globe, Bot,
  KeyRound, TrendingUp, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router';
import Footer from './Footer';
import Brand from './Brand';

// ── Generic portal nav ────────────────────────────────────────
const portalNav = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/projects',    label: 'Projekte',     icon: FolderGit2 },
  { to: '/profile',     label: 'Profil',       icon: User },
  { to: '/permissions', label: 'Freigaben',    icon: ShieldCheck },
];

// ── Per-project sidebar config ───────────────────────────────
type ProjectSection = { s: string; label: string; icon: React.ElementType; dividerBefore?: boolean };

const PROJECT_SECTIONS: Record<string, ProjectSection[]> = {
  collaglow: [
    { s: 'overview',      label: 'Übersicht',    icon: LayoutDashboard },
    { s: 'ads',           label: 'Ads',          icon: BarChart2 },
    { s: 'spend',         label: 'Spend',        icon: DollarSign },
    { s: 'email',         label: 'E-Mail',       icon: Mail },
    { s: 'shop',          label: 'Shop',         icon: ShoppingBag },
    { s: 'intelligence',  label: 'Intelligence', icon: Globe, dividerBefore: true },
    { s: 'agent',         label: 'Agent',        icon: Bot },
    { s: 'apis',          label: 'API-Keys',     icon: KeyRound },
  ],
};

const DEFAULT_PROJECT_SECTIONS: ProjectSection[] = [
  { s: 'overview',  label: 'Übersicht',  icon: TrendingUp },
  { s: 'agent',     label: 'Agent',      icon: Bot },
  { s: 'apis',      label: 'API-Keys',   icon: KeyRound },
];

function initials(name?: string, email?: string) {
  const src = name || email || '?';
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

export default function Layout() {
  const { me, logout } = useAuth();
  const loc = useLocation();
  const projectMatch = useMatch('/projects/:slug');
  const projectMatchDeep = useMatch('/projects/:slug/*');
  const slug = projectMatch?.params.slug || projectMatchDeep?.params.slug;

  const inProject = !!slug;
  const sections = slug ? (PROJECT_SECTIONS[slug] ?? DEFAULT_PROJECT_SECTIONS) : null;
  const currentSection = new URLSearchParams(loc.search).get('s') || (sections?.[0]?.s ?? '');
  const currentLabel = inProject
    ? (sections?.find(s => s.s === currentSection)?.label ?? 'Übersicht')
    : portalNav.find(n => loc.pathname.startsWith(n.to))?.label;

  return (
    <div className="relative min-h-screen flex bg-ink-950 text-ink-100 overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none bg-gold-radial opacity-50" />

      {/* Sidebar */}
      <aside className="relative w-56 shrink-0 border-r border-white/5 flex flex-col bg-ink-900/60 backdrop-blur-xl z-10">
        <div className="px-5 pt-6 pb-5">
          <Brand size={28} />
        </div>

        {/* Project mode: back link + project sections */}
        {inProject && sections ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-3 mb-3">
              <Link
                to="/projects"
                className="flex items-center gap-2 text-[0.7rem] text-ink-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
              >
                <ChevronLeft size={12} /> Projekte
              </Link>
            </div>

            <div className="px-4 mb-4">
              <div className="text-[0.6rem] uppercase tracking-widest text-ink-500 font-semibold mb-1">Projekt</div>
              <div className="text-sm font-semibold text-white capitalize">{slug}</div>
            </div>

            <nav className="flex-1 px-3 space-y-0.5">
              {sections.map(({ s, label, icon: Icon, dividerBefore }, i) => {
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
                      <span>{label}</span>
                      {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-gold-400 opacity-70" />}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>
        ) : (
          /* Generic portal nav */
          <nav className="flex-1 px-3 space-y-0.5">
            {portalNav.map(({ to, label, icon: Icon }, i) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} animate-fade-up`}
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* User card */}
        <div className="m-3 mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-[0.7rem] font-bold text-ink-950 shadow-glow-gold shrink-0">
              {initials(me?.account.name, me?.account.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{me?.account.name || '—'}</div>
              <div className="text-[0.6rem] text-ink-500 truncate">{me?.account.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2.5 w-full flex items-center justify-center gap-2 text-[0.65rem] text-ink-400 hover:text-white py-1.5 rounded-md hover:bg-white/[0.04] transition"
          >
            <LogOut size={11} /> Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex-1 flex flex-col min-w-0 z-10">
        {/* Top-bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {inProject ? (
              <>
                <span className="text-ink-500 text-xs capitalize">{slug}</span>
                <span className="text-ink-700">/</span>
                <span className="text-white font-medium text-sm">{currentLabel}</span>
              </>
            ) : (
              <>
                <span className="text-ink-400 text-xs">Portal</span>
                <span className="text-ink-700">/</span>
                <span className="text-white font-medium text-sm">{currentLabel || 'Übersicht'}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-[0.65rem] text-ink-500 hidden sm:block">{me?.account.email}</div>
            <div className="dot dot-ok" title="Online" />
          </div>
        </header>

        <main className="flex-1 px-8 py-8 w-full max-w-6xl mx-auto" key={loc.pathname + currentSection}>
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
