import { useEffect, useRef, useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

const themes: { id: Theme; icon: typeof Sparkles; label: string }[] = [
  { id: 'aevum', icon: Sparkles, label: 'AEVUM Theme' },
  { id: 'hell', icon: Sun, label: 'Hell Theme' },
  { id: 'dark', icon: Moon, label: 'Dark Theme' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const activeBtn = btnRefs.current[theme];
    const container = containerRef.current;
    if (!activeBtn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
    setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
  }, [theme]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Theme auswählen"
      className="relative inline-flex items-center gap-1 p-1 rounded-full border border-theme-border bg-bg-surface/60 backdrop-blur-md shadow-sm"
    >
      {/* Sliding pill indicator */}
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-full bg-theme-accent/15 border border-theme-accent/30 shadow-glow transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {themes.map(({ id, icon: Icon, label }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            ref={(el) => { btnRefs.current[id] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(id)}
            aria-label={label}
            title={label}
            className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
              active
                ? 'text-theme-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon size={15} strokeWidth={active ? 2.25 : 1.75} className="transition-transform duration-300" />
          </button>
        );
      })}
    </div>
  );
}
