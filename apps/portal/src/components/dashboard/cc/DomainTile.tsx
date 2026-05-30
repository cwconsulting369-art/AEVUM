// DomainTile — portiert aus LennoxOS CommandCenter (ADR-002 D1).
// Uniform Bento-Kachel: ruhiger Domain-Color-Icon-Chip + uppercase Label.
// Karte bleibt dunkel; Domain-Farbe ist Akzent, nie Hintergrund-Flut.
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

export type DomainColor = 'gold' | 'emerald' | 'violet' | 'amber' | 'info' | 'rose' | 'crimson';

const DOMAIN_RGB: Record<DomainColor, string> = {
  gold: '224,164,88',
  emerald: '74,222,128',
  violet: '167,139,250',
  amber: '245,158,11',
  info: '96,165,250',
  rose: '244,114,182',
  crimson: '255,43,58',
};

interface DomainTileProps {
  label: string;
  icon: LucideIcon;
  color?: DomainColor;
  /** kleiner Status-Text oben rechts (z.B. "live", "30d") */
  badge?: ReactNode;
  /** Klick → Drilldown */
  onOpen?: () => void;
  error?: boolean;
  /** gedimmt darstellen (Coming-Soon-Stub) */
  dim?: boolean;
  className?: string;
  children: ReactNode;
}

export default function DomainTile({ label, icon: Icon, color = 'gold', badge, onOpen, error, dim, className, children }: DomainTileProps) {
  const rgb = DOMAIN_RGB[color];
  return (
    <div
      className={`cc-tile group ${onOpen ? 'cc-tile--clickable' : ''} ${dim ? 'cc-tile--dim' : ''} ${className ?? ''}`}
      onClick={onOpen}
      style={{ ['--tile-rgb' as string]: rgb }}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={onOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } } : undefined}
    >
      <div className="cc-tile__head">
        <span className="cc-tile__chip" style={{ background: `rgba(${rgb},0.12)`, color: `rgb(${rgb})`, boxShadow: `0 0 12px rgba(${rgb},0.25)` }}>
          <Icon size={13} />
        </span>
        <span className="cc-tile__label">{label}</span>
        <div className="cc-tile__badge">
          {error ? <span className="cc-tile__err">offline</span> : badge}
          {onOpen && <ArrowUpRight size={13} className="cc-tile__open" />}
        </div>
      </div>
      <div className="cc-tile__body">{children}</div>
    </div>
  );
}

/* ---- Reusable sub-stat (Label + großer tabular Wert) ---- */
export function Stat({ label, children, accent }: { label: string; children: ReactNode; accent?: string }) {
  return (
    <div className="cc-stat">
      <div className="cc-stat__label">{label}</div>
      <div className="cc-stat__value" style={accent ? { color: accent } : undefined}>{children}</div>
    </div>
  );
}

/* ---- Tiny status pill ---- */
export function Pill({ tone = 'neutral', children }: { tone?: 'ok' | 'warn' | 'err' | 'neutral' | 'accent'; children: ReactNode }) {
  return <span className={`cc-pill cc-pill--${tone}`}>{children}</span>;
}
