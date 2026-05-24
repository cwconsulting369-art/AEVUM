/**
 * MaintenancePill — Tiny status-pill rendered when payments_paused=true,
 * placed next to "Jetzt kaufen"-CTAs so users see why the click → modal happens.
 *
 * Wave I7 — Maintenance-Mode Frontend (2026-05-24)
 */

import { Sparkles } from 'lucide-react';
import { useAevumConfig } from '@/hooks/use-config';

interface Props {
  /** "inline" sits next to button; "absolute" docks top-right of a relative parent. */
  variant?: 'inline' | 'absolute';
  className?: string;
}

export default function MaintenancePill({ variant = 'inline', className = '' }: Props) {
  const config = useAevumConfig();
  if (!config?.payments_paused) return null;

  const base =
    'inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border bg-[#e0a458]/12 border-[#e0a458]/30 text-[#e0a458]';
  const positioned =
    variant === 'absolute'
      ? 'absolute top-3 left-3 z-10 backdrop-blur-sm'
      : '';

  return (
    <span className={`${base} ${positioned} ${className}`} aria-label="In Wartung — Käufe pausiert">
      <Sparkles size={9} />
      In Vorbereitung
    </span>
  );
}
