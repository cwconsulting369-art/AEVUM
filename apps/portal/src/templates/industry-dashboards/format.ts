import type { KpiFormat } from './types';

/**
 * Format-Helper für KPI-Werte.
 *
 * Carlos-Direktive: Wenn kein echter Wert vorhanden, IMMER "—" rendern.
 * Niemals Default-Zahl ("0", "—%") einsetzen, das ist Mock-Verhalten.
 */
export function formatKpiValue(value: unknown, format: KpiFormat): string {
  if (value === null || value === undefined || value === '' || Number.isNaN(value)) {
    return '—';
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: num >= 1000 ? 0 : 2,
      }).format(num);
    case 'percent':
      // Source liefert entweder 0-1 (prozent als Bruch) oder 0-100.
      // Konvention: wenn |num| <= 1, treat als Bruch; sonst als Prozent.
      const pctRaw = Math.abs(num) <= 1 ? num * 100 : num;
      return `${pctRaw.toFixed(1)} %`;
    case 'duration':
      // Erwartet Tage als Number; alternativ Stunden wenn < 1.
      if (num < 1) return `${(num * 24).toFixed(1)} h`;
      return `${num.toFixed(1)} T`;
    case 'compact':
      return new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
    case 'number':
    default:
      return new Intl.NumberFormat('de-DE').format(num);
  }
}

/**
 * Holt einen Dot-Path-Value aus einem Objekt.
 * z.B. resolveSource(payload, "project.metrics.leads_weekly")
 *
 * Liefert `undefined`, wenn nicht vorhanden — Caller rendert dann "—".
 */
export function resolveSource(root: unknown, dotPath: string): unknown {
  if (!root || typeof root !== 'object') return undefined;
  const parts = dotPath.split('.');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}
