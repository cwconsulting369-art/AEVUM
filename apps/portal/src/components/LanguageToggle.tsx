import { useTranslation } from 'react-i18next';
import type { Lang } from '../i18n';

const langs: { id: Lang; label: string }[] = [
  { id: 'de', label: 'DE' },
  { id: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const active = (i18n.language === 'en' ? 'en' : 'de') as Lang;

  return (
    <div
      role="radiogroup"
      aria-label="Language / Sprache"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full border border-white/10 bg-white/5"
    >
      {langs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => i18n.changeLanguage(id)}
            aria-label={id === 'de' ? 'Deutsch' : 'English'}
            title={id === 'de' ? 'Deutsch' : 'English'}
            className={`inline-flex items-center justify-center px-2 h-6 rounded-full text-[0.65rem] font-semibold tracking-wide transition-colors ${
              isActive ? 'bg-gold-gradient text-ink-950' : 'text-ink-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
