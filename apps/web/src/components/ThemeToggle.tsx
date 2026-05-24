import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

const themes: { id: Theme; icon: typeof Sparkles; label: string }[] = [
  { id: 'aevum', icon: Sparkles, label: 'AEVUM Theme' },
  { id: 'hell', icon: Sun, label: 'Hell Theme' },
  { id: 'dark', icon: Moon, label: 'Dark Theme' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 border border-theme-border rounded-lg p-1">
      {themes.map(({ id, icon: Icon, label }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={`p-1.5 rounded transition-colors ${
              active
                ? 'bg-theme-accent/20 text-theme-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
