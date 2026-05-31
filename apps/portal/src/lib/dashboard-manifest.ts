// Dashboard-Manifest — config-driven Schema (ADR-002 D2/D4/D5).
// Eine Kunden-Dashboard-Struktur ist DATEN, kein Code. Heute als TS-Manifest;
// der Übergang zu JSON/config.json/API ist trivial (Icons sind String-Keys).
import type { DomainColor } from '@/components/dashboard/cc/DomainTile';

/** Lokalisierbarer Text: entweder ein String (sprachneutral/Marke) oder {de,en}.
 *  Manifest-Chrome (Labels/Beschreibungen) nutzt {de,en}; CommandShell rendert via localizeText. */
export type LText = string | { de: string; en?: string };
export function localizeText(v: LText | undefined | null, lang: string): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return lang === 'en' ? (v.en ?? v.de) : v.de;
}

/** Doc-Taxonomie (D5) — jedes Dokument trägt scope + origin. */
export type DocScope = 'agent' | 'project' | 'customer' | 'shared';

/** String-Keys → lucide Icons (Map in CommandShell). Hält Manifest serialisierbar. */
export type IconKey =
  | 'globe' | 'megaphone' | 'facebook' | 'linkedin' | 'target' | 'trendingUp'
  | 'image' | 'fileText' | 'bot' | 'inbox' | 'messageSquare' | 'database'
  | 'layers' | 'users' | 'folder' | 'activity' | 'mail';

export type ZoneStatus = 'live' | 'wip' | 'soon';

export interface ZoneStat {
  label: LText;
  value: string;
  /** CSS-Color/Var für Akzent (z.B. 'var(--status-success)') */
  accent?: string;
}

export interface ZoneBar { label: LText; pct: number; color?: string; }

/** Eine Bento-Kachel im Hauptbereich. */
export interface ZoneSpec {
  key: string;
  label: LText;
  icon: IconKey;
  color?: DomainColor;
  badge?: string;
  status?: ZoneStatus;     // 'soon'/'wip' → gedimmt dargestellt
  stats?: ZoneStat[];
  bars?: ZoneBar[];
  chips?: LText[];
  note?: LText;
}

/** Custom-Pane-Keys (Escape-Hatch, ADR-002 R4) — echte Komponente statt Zonen. */
export type CustomPaneKey = 'lead-funnel' | 'funnel-facebook' | 'funnel-linkedin' | 'website';

/** Inhalts-Pane eines Bereichs (Bento aus Zonen). Leer → Placeholder. */
export interface PaneSpec {
  title: LText;
  description?: LText;
  /** Backlog-Hinweis wenn Inhalt noch von Spec abhängt (gated) */
  gatedNote?: LText;
  /** Escape-Hatch: rendert eine echte Komponente (z.B. bestehender LeadFunnel) statt Zonen. */
  custom?: CustomPaneKey;
  zones: ZoneSpec[];
}

export interface NavSub {
  slug: string;
  label: LText;
  icon?: IconKey;
  pane: PaneSpec;
}

export interface NavArea {
  slug: string;
  label: LText;
  icon?: IconKey;
  pane?: PaneSpec;       // optional wenn nur Container für children
  children?: NavSub[];
}

/** Ein Live-Feed-Eintrag für die rechte Rail. */
export interface FeedItem { time: LText; text: LText; }

export interface DashboardManifest {
  project: { slug: string; label: string; tagline?: string; siteUrl?: string };
  /** Achse 1 — fachliche Projekt-Bereiche, hierarchisch (D4.1) */
  areas: NavArea[];
  /** Achse 2 — Agent-Bereich (D4.2): Conversation-Logs, Inbox, State */
  agent: PaneSpec;
  /** Achse 3 — Doc-Überbereich (D4.3 / D5): scope/origin-gekennzeichnet */
  docs: PaneSpec;
  /** Rechte Rail — "Heute"/Aktivität (Platzhalter bis Live-Wiring) */
  feed?: FeedItem[];
}

/** Scope-Badge-Metadaten für den Doc-Überbereich (D5). */
export const SCOPE_META: Record<DocScope, { label: string; emoji: string; color: DomainColor }> = {
  agent:    { label: 'Agent',    emoji: '🤖', color: 'violet' },
  project:  { label: 'Projekt',  emoji: '📁', color: 'gold' },
  customer: { label: 'Kunde',    emoji: '👤', color: 'info' },
  shared:   { label: 'Geteilt',  emoji: '🔗', color: 'emerald' },
};
