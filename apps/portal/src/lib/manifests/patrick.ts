// Patrick "Thailand RE" Dashboard-Manifest (ADR-002 D3).
// 1 Projekt, intern getrennt: Website + Lead-Funnel(→ FB/LinkedIn) + Agent + Docs.
// Zonen sind PLATZHALTER (status 'soon'/'wip') — Inhalte/Metriken kommen aus der
// Patrick-Session-Spec (gated, ADR-002 Follow-up 4). Struktur steht, Daten folgen.
import type { DashboardManifest } from '@/lib/dashboard-manifest';

export const patrickManifest: DashboardManifest = {
  project: { slug: 'thailand-re', label: 'Thailand RE', tagline: 'Patrick Roth · Real Estate Concierge · Pattaya/Rayong' },

  areas: [
    // ── Bereich: Website ───────────────────────────────────
    {
      slug: 'website',
      label: 'Website',
      icon: 'globe',
      pane: {
        title: 'Website',
        description: 'Live-Site, Traffic, Content-Status — leben-in-thailand.',
        gatedNote: 'Metriken-Wiring folgt aus Patrick-Session (Analytics/Content-Quellen).',
        zones: [
          { key: 'site-health', label: 'Site-Status', icon: 'globe', color: 'gold', status: 'wip',
            stats: [{ label: 'Deploy', value: 'live', accent: 'var(--status-success)' }, { label: 'Seiten', value: '—' }],
            chips: ['Home', 'Auswanderer', 'Investor', 'Über Patrick', 'Objekte'] },
          { key: 'traffic', label: 'Traffic 30d', icon: 'trendingUp', color: 'info', status: 'soon',
            stats: [{ label: 'Besucher', value: '—' }, { label: 'Conversion', value: '—' }] },
          { key: 'content', label: 'Content-Pipeline', icon: 'image', color: 'violet', status: 'soon',
            stats: [{ label: 'Objekte', value: '—' }, { label: 'Blog', value: '—' }] },
        ],
      },
    },

    // ── Bereich: Lead-Funnel (mit Sub-Kanälen) ─────────────
    {
      slug: 'lead-funnel',
      label: 'Lead-Funnel',
      icon: 'target',
      pane: {
        title: 'Lead-Funnel · Übersicht',
        description: 'Alle Kanäle zusammengeführt. Detail je Kanal links im Menü.',
        gatedNote: 'Scoring-Contract (A/B/C/D) + Lead-Felder + Stufen aus Patrick-Session.',
        zones: [
          { key: 'funnel-total', label: 'Leads gesamt', icon: 'target', color: 'gold', status: 'wip',
            stats: [{ label: 'Neu 30d', value: '—' }, { label: 'A-Leads', value: '—', accent: 'var(--status-success)' }] },
          { key: 'funnel-stages', label: 'Pipeline-Stufen', icon: 'layers', color: 'amber', status: 'soon',
            bars: [
              { label: 'Neu', pct: 0 }, { label: 'Qualifiziert', pct: 0 },
              { label: 'Gespräch', pct: 0 }, { label: 'Deal', pct: 0 },
            ] },
          { key: 'channels', label: 'Kanal-Split', icon: 'activity', color: 'info', status: 'soon',
            chips: ['Facebook', 'LinkedIn', 'Website', 'Referral'] },
        ],
      },
      children: [
        {
          slug: 'facebook', label: 'Facebook-Funnel', icon: 'facebook',
          pane: {
            title: 'Facebook-Funnel',
            description: 'Meta-Kampagnen → Leads → Qualifizierung.',
            gatedNote: 'Ad-Metriken (CPL, Reichweite, Creatives) + Lead-Mapping aus Patrick-Session.',
            zones: [
              { key: 'fb-spend', label: 'Ad-Performance', icon: 'megaphone', color: 'info', status: 'soon',
                stats: [{ label: 'Spend 30d', value: '—' }, { label: 'CPL', value: '—' }] },
              { key: 'fb-leads', label: 'FB-Leads', icon: 'target', color: 'gold', status: 'soon',
                stats: [{ label: 'Leads', value: '—' }, { label: 'A-Quote', value: '—' }] },
            ],
          },
        },
        {
          slug: 'linkedin', label: 'LinkedIn-Funnel', icon: 'linkedin',
          pane: {
            title: 'LinkedIn-Funnel',
            description: 'Organisch + Outreach → Investoren-Leads.',
            gatedNote: 'SSI, Outreach-Sequenzen, Reply-Raten aus Patrick-Session.',
            zones: [
              { key: 'li-reach', label: 'Reichweite', icon: 'trendingUp', color: 'info', status: 'soon',
                stats: [{ label: 'SSI', value: '—' }, { label: 'Impressions', value: '—' }] },
              { key: 'li-leads', label: 'LinkedIn-Leads', icon: 'target', color: 'gold', status: 'soon',
                stats: [{ label: 'Leads', value: '—' }, { label: 'Reply-Rate', value: '—' }] },
            ],
          },
        },
      ],
    },
  ],

  // ── Achse 2: Agent-Bereich (D4.2) ────────────────────────
  agent: {
    title: 'Agent · Thailand RE Bot',
    description: 'Nur der Agent: Gespräche, Inbox (TG-Uploads), Memory/State. Getrennt vom Projekt-Inhalt.',
    gatedNote: 'Live-Anbindung an thailandre-bot (chats/, inbox/, state.json) folgt in Etappe B.',
    zones: [
      { key: 'agent-convos', label: 'Conversation-Logs', icon: 'messageSquare', color: 'violet', status: 'wip',
        stats: [{ label: 'Threads', value: '—' }, { label: 'Letzte', value: '—' }] },
      { key: 'agent-inbox', label: 'Agent-Inbox', icon: 'inbox', color: 'violet', status: 'soon',
        note: 'Dateien aus dem TG-Bot-Chat (scope=agent).' },
      { key: 'agent-state', label: 'Memory / State', icon: 'database', color: 'violet', status: 'soon',
        stats: [{ label: 'Modell', value: 'sonnet-4-5' }, { label: 'Persona', value: 'Trust-Funnel' }] },
    ],
  },

  // ── Achse 3: Doc-Überbereich (D4.3 / D5) ─────────────────
  docs: {
    title: 'Dokumente · Überbereich',
    description: 'Alle Dokumente in einer Sicht — jede Zeile mit Scope-Badge + Origin-Tag (was-gehört-wohin).',
    gatedNote: 'scope/origin-Felder + Storage-Konsolidierung = Etappe B (D5/D6).',
    zones: [
      { key: 'docs-agent', label: 'Agent-Docs', icon: 'bot', color: 'violet', status: 'soon',
        note: '🤖 agent · TG-Upload / Agent-generiert' },
      { key: 'docs-project', label: 'Projekt-Docs', icon: 'folder', color: 'gold', status: 'soon',
        note: '📁 project · website / funnel-kanal' },
      { key: 'docs-customer', label: 'Kunden-Docs', icon: 'users', color: 'info', status: 'soon',
        note: '👤 customer · Upload' },
      { key: 'docs-shared', label: 'Geteilt', icon: 'mail', color: 'emerald', status: 'soon',
        note: '🔗 shared · projektübergreifend' },
    ],
  },

  feed: [
    { time: 'jetzt', text: 'CommandShell-Skelett deployed (ADR-002 Etappe A).' },
    { time: 'heute', text: 'Lead-Funnel-Repair production-verified — Pipeline läuft A/B/C/D.' },
    { time: 'gated', text: 'Funnel-Detail-Panes warten auf Patrick-Session-Spec.' },
  ],
};
