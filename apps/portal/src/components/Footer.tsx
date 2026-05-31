import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-white/5 px-6 py-5 text-xs text-ink-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="dot dot-ok" />
          <span>{t('common.footerCredit', { year: new Date().getFullYear() })}</span>
        </div>
        <nav className="flex flex-wrap gap-5">
          <Link to="/datenschutz" className="hover:text-white transition">{t('common.privacy')}</Link>
          <Link to="/impressum" className="hover:text-white transition">{t('common.imprint')}</Link>
          <Link to="/agb" className="hover:text-white transition">{t('common.terms')}</Link>
        </nav>
      </div>
    </footer>
  );
}
