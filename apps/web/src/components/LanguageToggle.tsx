import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '../i18n';

const langs: { id: Lang; label: string }[] = [
  { id: 'de', label: 'DE' },
  { id: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const active = (i18n.language === 'en' ? 'en' : 'de') as Lang;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const activeBtn = btnRefs.current[active];
    const container = containerRef.current;
    if (!activeBtn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
    setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
  }, [active]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Language / Sprache"
      className="relative inline-flex items-center gap-1 p-1 rounded-full border border-theme-border bg-bg-surface/60 backdrop-blur-md shadow-sm"
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-full bg-theme-accent/15 border border-theme-accent/30 shadow-glow transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {langs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            ref={(el) => { btnRefs.current[id] = el; }}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => i18n.changeLanguage(id)}
            aria-label={id === 'de' ? 'Deutsch' : 'English'}
            title={id === 'de' ? 'Deutsch' : 'English'}
            className={`relative z-10 inline-flex items-center justify-center px-2.5 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-theme-accent' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
