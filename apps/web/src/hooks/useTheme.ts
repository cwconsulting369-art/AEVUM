import { useState, useEffect } from 'react';

const STORAGE_KEY = 'aevum_theme';
export type Theme = 'aevum' | 'hell' | 'dark';

const VALID_THEMES: Theme[] = ['aevum', 'hell', 'dark'];

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'aevum';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && VALID_THEMES.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  // No saved preference — default to AEVUM (brand-first).
  return 'aevum';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return { theme, setTheme };
}
