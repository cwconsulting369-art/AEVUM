import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';
import { LogOut, LayoutDashboard, User, ShieldCheck, FolderGit2 } from 'lucide-react';
import Footer from './Footer';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/permissions', label: 'Permissions', icon: ShieldCheck },
  { to: '/projects', label: 'Projects', icon: FolderGit2 }
];

export default function Layout() {
  const { me, logout } = useAuth();
  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <aside className="w-64 border-r border-neutral-800 p-6 flex flex-col">
        <div className="mb-8">
          <div className="text-2xl font-bold tracking-tight">AEVUM</div>
          <div className="text-xs text-neutral-500 mt-1">Portal</div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-800 pt-4 mt-4">
          <div className="text-xs text-neutral-500 truncate">{me?.account.email}</div>
          <div className="text-sm font-medium truncate">{me?.account.name}</div>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition">
            <LogOut size={14} /> Abmelden
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-10 max-w-5xl">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
