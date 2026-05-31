import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// AEVUM Portal i18n — DE = Default, EN = internationale Version.
// Namespaces liegen als Dateien unter src/locales/{de,en}/<namespace>.ts und
// werden per Vite-Glob automatisch geladen — neue Dateien brauchen KEINE
// Registrierung hier (konfliktfrei für parallele Arbeit an verschiedenen Seiten).
// Verwendung in Components: const { t } = useTranslation(); t('dashboard.title')

export const LANG_KEY = 'aevum_lang';
export type Lang = 'de' | 'en';

const deModules = import.meta.glob('./locales/de/*.ts', { eager: true });
const enModules = import.meta.glob('./locales/en/*.ts', { eager: true });

function buildResources(modules: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const path in modules) {
    const ns = path.split('/').pop()!.replace(/\.ts$/, '');
    const mod = modules[path] as { default?: unknown };
    out[ns] = mod.default ?? mod;
  }
  return out;
}

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'de';
  const stored = window.localStorage.getItem(LANG_KEY);
  return stored === 'en' ? 'en' : 'de';
}

const lng = initialLang();

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: buildResources(deModules) },
    en: { translation: buildResources(enModules) },
  },
  lng,
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = lng;
  i18n.on('languageChanged', (l) => {
    document.documentElement.lang = l;
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* localStorage nicht verfügbar */
    }
  });
}

export default i18n;
