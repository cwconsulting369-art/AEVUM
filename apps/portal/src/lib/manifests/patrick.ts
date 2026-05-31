// Patrick "Thailand RE" Dashboard-Manifest (ADR-002 D3).
// 1 Projekt, intern getrennt: Website + Lead-Funnel(→ FB/LinkedIn) + Agent + Docs.
// UI-Texte sind {de,en} (LText) → CommandShell rendert via localizeText. Marken/
// Eigennamen/Daten bleiben sprachneutrale Strings.
import type { DashboardManifest } from '@/lib/dashboard-manifest';

export const patrickManifest: DashboardManifest = {
  // siteUrl = AKTUELLE Live-Domain (noch vercel-alias; bei eigener Domain hier EINMAL ändern → Reflinks/Site-Links ziehen global mit)
  project: { slug: 'thailand-re-leadfunnel', label: 'Thailand RE', tagline: 'Patrick Roth · Real Estate Concierge · Pattaya/Rayong', siteUrl: 'leben-in-thailand.vercel.app' },

  areas: [
    // ── Website ───────────────────────────────────
    {
      slug: 'website',
      label: 'Website',
      icon: 'globe',
      pane: {
        title: 'Website',
        custom: 'website',
        zones: [],
      },
    },

    // ── Lead-Funnel (mit Sub-Kanälen) ─────────────
    {
      slug: 'lead-funnel',
      label: 'Lead-Funnel',
      icon: 'target',
      pane: {
        title: { de: 'Lead-Funnel · Cockpit', en: 'Lead funnel · cockpit' },
        description: { de: 'Vollständig editierbar: Leads, Content, Kanäle & Zielgruppe — echte Live-Daten (Gesamt = FB + LinkedIn).', en: 'Fully editable: leads, content, channels & audience — real live data (total = FB + LinkedIn).' },
        custom: 'lead-funnel',
        zones: [],
      },
      children: [
        { slug: 'facebook', label: 'Facebook-Funnel', icon: 'facebook',
          pane: { title: 'Facebook-Funnel', custom: 'funnel-facebook', zones: [] } },
        { slug: 'linkedin', label: 'LinkedIn-Funnel', icon: 'linkedin',
          pane: { title: 'LinkedIn-Funnel', custom: 'funnel-linkedin', zones: [] } },
      ],
    },
  ],

  agent: {
    title: 'Agent · Thailand RE Bot',
    description: { de: 'Nur der Agent: Gespräche, Inbox (TG-Uploads), Memory/State. Getrennt vom Projekt-Inhalt.', en: 'Just the agent: conversations, inbox (TG uploads), memory/state. Separate from project content.' },
    gatedNote: { de: 'Live-Anbindung an thailandre-bot (chats/, inbox/, state.json) folgt in Etappe B.', en: 'Live connection to thailandre-bot (chats/, inbox/, state.json) follows in stage B.' },
    zones: [
      { key: 'agent-convos', label: { de: 'Conversation-Logs', en: 'Conversation logs' }, icon: 'messageSquare', color: 'violet', status: 'wip',
        stats: [{ label: 'Threads', value: '—' }, { label: { de: 'Letzte', en: 'Latest' }, value: '—' }] },
      { key: 'agent-inbox', label: { de: 'Agent-Inbox', en: 'Agent inbox' }, icon: 'inbox', color: 'violet', status: 'soon',
        note: { de: 'Dateien aus dem TG-Bot-Chat (scope=agent).', en: 'Files from the TG bot chat (scope=agent).' } },
      { key: 'agent-state', label: 'Memory / State', icon: 'database', color: 'violet', status: 'soon',
        stats: [{ label: { de: 'Modell', en: 'Model' }, value: 'sonnet-4-5' }, { label: 'Persona', value: 'Trust-Funnel' }] },
    ],
  },

  docs: {
    title: { de: 'Dokumente · Überbereich', en: 'Documents · overview' },
    description: { de: 'Alle Dokumente in einer Sicht — jede Zeile mit Scope-Badge + Origin-Tag (was-gehört-wohin).', en: 'All documents in one view — each row with scope badge + origin tag (what-belongs-where).' },
    gatedNote: { de: 'scope/origin-Felder + Storage-Konsolidierung = Etappe B (D5/D6).', en: 'scope/origin fields + storage consolidation = stage B (D5/D6).' },
    zones: [
      { key: 'docs-agent', label: { de: 'Agent-Docs', en: 'Agent docs' }, icon: 'bot', color: 'violet', status: 'soon',
        note: { de: '🤖 agent · TG-Upload / Agent-generiert', en: '🤖 agent · TG upload / agent-generated' } },
      { key: 'docs-project', label: { de: 'Projekt-Docs', en: 'Project docs' }, icon: 'folder', color: 'gold', status: 'soon',
        note: { de: '📁 project · website / funnel-kanal', en: '📁 project · website / funnel channel' } },
      { key: 'docs-customer', label: { de: 'Kunden-Docs', en: 'Customer docs' }, icon: 'users', color: 'info', status: 'soon',
        note: { de: '👤 customer · Upload', en: '👤 customer · upload' } },
      { key: 'docs-shared', label: { de: 'Geteilt', en: 'Shared' }, icon: 'mail', color: 'emerald', status: 'soon',
        note: { de: '🔗 shared · projektübergreifend', en: '🔗 shared · cross-project' } },
    ],
  },

  feed: [
    { time: { de: 'jetzt', en: 'now' }, text: { de: 'Lead-Funnel-Cockpit live: Content, Leads, Kanäle & Zielgruppe editierbar.', en: 'Lead-funnel cockpit live: content, leads, channels & audience editable.' } },
    { time: { de: 'heute', en: 'today' }, text: { de: 'Lead-Funnel-Repair production-verified — Pipeline läuft A/B/C/D.', en: 'Lead-funnel repair production-verified — pipeline running A/B/C/D.' } },
    { time: { de: 'gated', en: 'gated' }, text: { de: 'Bezahlte Ad-Metriken (Meta/LinkedIn Ads) folgen mit der API-Freischaltung.', en: 'Paid ad metrics (Meta/LinkedIn Ads) follow once the API is enabled.' } },
  ],
};
