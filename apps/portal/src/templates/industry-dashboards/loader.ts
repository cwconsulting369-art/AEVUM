import type { IndustryTemplate } from './types';
import { defaultTemplate } from './default';

/**
 * Industry-String → Template-Loader.
 *
 * Lazy-loaded via dynamic import: nur das matchende Template landet
 * im Bundle des aktiven Projekt-Detail-Views.
 *
 * Aliase: wir normalisieren häufige Schreibweisen (z.B. "ecommerce" → "e-commerce").
 */

type Loader = () => Promise<{ default: IndustryTemplate } | IndustryTemplate>;

/**
 * Map von canonical industry-key → Loader-Function.
 * Loader gibt entweder das Modul oder die Template-Instanz zurück.
 */
const loaders: Record<string, Loader> = {
  'real-estate': () => import('./real-estate').then(m => m.realEstateTemplate),
  'e-commerce': () => import('./e-commerce').then(m => m.eCommerceTemplate),
  'b2b-saas': () => import('./b2b-saas').then(m => m.b2bSaasTemplate),
  'energy-consulting': () => import('./energy-consulting').then(m => m.energyConsultingTemplate),
  trading: () => import('./trading').then(m => m.tradingTemplate),
  'content-marketing': () => import('./content-marketing').then(m => m.contentMarketingTemplate),
  'tax-legal': () => import('./tax-legal').then(m => m.taxLegalTemplate),
  default: async () => defaultTemplate,
};

/**
 * Normalisiert User-Input zu einem canonical key.
 *
 * Beispiele:
 *   "Real Estate" → "real-estate"
 *   "ecommerce"   → "e-commerce"
 *   "DTC"         → "e-commerce"
 *   "Steuer"      → "tax-legal"
 *   ""            → "default"
 */
export function normalizeIndustryKey(raw: string | null | undefined): string {
  if (!raw) return 'default';
  const s = raw.trim().toLowerCase().replace(/[\s_]+/g, '-');

  // Direct hit
  if (s in loaders) return s;

  // Common aliases (Customer-Direktive: erkennen wenn Carlos was anderes tippt)
  const aliases: Record<string, string> = {
    realestate: 'real-estate',
    immobilien: 'real-estate',
    makler: 'real-estate',
    property: 'real-estate',
    ecommerce: 'e-commerce',
    'e-com': 'e-commerce',
    shopify: 'e-commerce',
    dtc: 'e-commerce',
    saas: 'b2b-saas',
    b2b: 'b2b-saas',
    consulting: 'b2b-saas',
    agency: 'b2b-saas',
    energy: 'energy-consulting',
    energie: 'energy-consulting',
    strom: 'energy-consulting',
    utility: 'energy-consulting',
    hausverwaltung: 'energy-consulting',
    finance: 'trading',
    signals: 'trading',
    'crypto-trading': 'trading',
    content: 'content-marketing',
    marketing: 'content-marketing',
    creative: 'content-marketing',
    'script-factory': 'content-marketing',
    tax: 'tax-legal',
    legal: 'tax-legal',
    steuer: 'tax-legal',
    kanzlei: 'tax-legal',
    anwalt: 'tax-legal',
  };

  return aliases[s] ?? 'default';
}

/**
 * Laedt das Template für die angegebene Branche.
 * Bei unbekanntem Key → defaultTemplate (kein Throw).
 */
export async function loadIndustryTemplate(
  rawIndustry: string | null | undefined,
): Promise<IndustryTemplate> {
  const key = normalizeIndustryKey(rawIndustry);
  const loader = loaders[key] ?? loaders.default;
  try {
    const result = await loader();
    // Loader kann Modul-Objekt oder Template direkt liefern.
    const tpl = (result as { default?: IndustryTemplate }).default
      ? (result as { default: IndustryTemplate }).default
      : (result as IndustryTemplate);
    return tpl;
  } catch (err) {
    console.error('[industry-template] load failed, falling back to default', { rawIndustry, err });
    return defaultTemplate;
  }
}

/**
 * Liste aller bekannten Keys — fuer Profile-/Onboarding-Select-Felder.
 * "default" ausgeschlossen (intern-only).
 */
export const knownIndustryKeys: string[] = Object.keys(loaders).filter(k => k !== 'default');
