import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 px-6 py-4 text-xs text-neutral-500">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>© {new Date().getFullYear()} AEVUM-system · Carlos Wrusch</div>
        <nav className="flex flex-wrap gap-4">
          <Link to="/datenschutz" className="hover:text-neutral-300 transition">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-neutral-300 transition">Impressum</Link>
          <Link to="/agb" className="hover:text-neutral-300 transition">Nutzungsbedingungen</Link>
        </nav>
      </div>
    </footer>
  );
}
