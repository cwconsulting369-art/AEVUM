import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-5 text-xs text-ink-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="dot dot-ok" />
          <span>© {new Date().getFullYear()} AEVUM-system · Carlos Wrusch</span>
        </div>
        <nav className="flex flex-wrap gap-5">
          <Link to="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-white transition">Impressum</Link>
          <Link to="/agb" className="hover:text-white transition">Nutzungsbedingungen</Link>
        </nav>
      </div>
    </footer>
  );
}
