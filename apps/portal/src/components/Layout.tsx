import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth';
import { LogOut, LayoutDashboard, User, ShieldCheck, FolderGit2 } from 'lucide-react';
import Footer from './Footer';
import Brand from './Brand';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/permissions', label: 'Permissions', icon: ShieldCheck },
  { to: '/projects', label: 'Projects', icon: FolderGit2 }
];

function initials(name?: string, email?: string) {
  const src = name || email || '?';
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

export default function Layout() {
  const { me, logout } = useAuth();
  const loc = useLocation();
  const currentLabel = navItems.find(n => loc.pathname.startsWith(n.to))?.label;

  return (
    <div className="relative min-h-screen flex bg-ink-950 text-ink-100 overflow-hidden">
      {/* Global subtle background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none bg-gold-radial opacity-50" />

      {/* Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/5 flex flex-col bg-ink-900/60 backdrop-blur-xl z-10">
        <div className="px-5 pt-6 pb-8">
          <Brand size={32} />
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }, i) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} animate-fade-up`}
              style={{ animationDelay: `${60 + i * 50}ms` }}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="m-3 mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-[0.75rem] font-bold text-ink-950 shadow-glow-gold shrink-0">
              {initials(me?.account.name, me?.account.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{me?.account.name || '—'}</div>
              <div className="text-[0.65rem] text-ink-400 truncate">{me?.account.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 text-[0.7rem] text-ink-400 hover:text-white py-1.5 rounded-md hover:bg-white/[0.04] transition"
          >
            <LogOut size={12} /> Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex-1 flex flex-col min-w-0 z-10">
        {/* Top-bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-400">Portal</span>
            <span className="text-ink-600">/</span>
            <span className="text-white font-medium">{currentLabel || 'Übersicht'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[0.7rem] text-ink-400 hidden sm:block">
              {me?.account.email}
            </div>
            <div className="dot dot-ok" title="Online" />
          </div>
        </header>

        <main className="flex-1 px-6 sm:px-10 py-10 max-w-6xl w-full" key={loc.pathname}>
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
