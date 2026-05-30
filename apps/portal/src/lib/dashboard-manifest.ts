// Dashboard-Manifest — config-driven Schema (ADR-002 D2/D4/D5).
// Eine Kunden-Dashboard-Struktur ist DATEN, kein Code. Heute als TS-Manifest;
// der Übergang zu JSON/config.json/API ist trivial (Icons sind String-Keys).
import type { DomainColor } from '@/components/dashboard/cc/DomainTile';

/** Doc-Taxonomie (D5) — jedes Dokument trägt scope + origin. */
export type DocScope = 'agent' | 'project' | 'customer' | 'shared';

/** String-Keys → lucide Icons (Map in CommandShell). Hält Manifest serialisierbar. */
export type IconKey =
  | 'globe' | 'megaphone' | 'facebook' | 'linkedin' | 'target' | 'trendingUp'
  | 'image' | 'fileText' | 'bot' | 'inbox' | 'messageSquare' | 'database'
  | 'layers' | 'users' | 'folder' | 'activity' | 'mail';

export type ZoneStatus = 'live' | 'wip' | 'soon';

export interface ZoneStat {
  label: string;
  value: string;
  /** CSS-Color/Var für Akzent (z.B. 'var(--status-success)') */
  accent?: string;
}

export interface ZoneBar { label: string; pct: number; color?: string; }

/** Eine Bento-Kachel im Hauptbereich. */
export interface ZoneSpec {
  key: string;
  label: string;
  icon: IconKey;
  color?: DomainColor;
  badge?: string;
  status?: ZoneStatus;     // 'soon'/'wip' → gedimmt dargestellt
  stats?: ZoneStat[];
  bars?: ZoneBar[];
  chips?: string[];
  note?: string;
}

/** Inhalts-Pane eines Bereichs (Bento aus Zonen). Leer → Placeholder. */
export interface PaneSpec {
  title: string;
  description?: string;
  /** Backlog-Hinweis wenn Inhalt noch von Spec abhängt (gated) */
  gatedNote?: string;
  zones: ZoneSpec[];
}

export interface NavSub {
  slug: string;
  label: string;
  icon?: IconKey;
  pane: PaneSpec;
}

export interface NavArea {
  slug: string;
  label: string;
  icon?: IconKey;
  pane?: PaneSpec;       // optional wenn nur Container für children
  children?: NavSub[];
}

/** Ein Live-Feed-Eintrag für die rechte Rail. */
export interface FeedItem { time: string; text: string; }

export interface DashboardManifest {
  project: { slug: string; label: string; tagline?: string };
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
