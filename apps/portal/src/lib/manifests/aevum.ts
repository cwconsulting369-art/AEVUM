// AEVUM "Kunde Zero" Dashboard-Manifest — AEVUM dogfooded den eigenen Funnel.
// Gleiche funktionale Cockpit-Struktur wie Patrick: Lead-Funnel (Gesamt) +
// Facebook-Funnel + LinkedIn-Funnel (platform-gescoped, voll editierbar).
// project.slug = 'aevum' (DB-Projekt → /api/me/projects/aevum/lead-funnel).
import type { DashboardManifest } from '@/lib/dashboard-manifest';

export const aevumManifest: DashboardManifest = {
  project: { slug: 'aevum', label: 'AEVUM', tagline: 'Kunde Zero · eigener Content-Funnel' },

  areas: [
    {
      slug: 'lead-funnel',
      label: 'Lead-Funnel',
      icon: 'target',
      pane: {
        title: 'Lead-Funnel · Cockpit',
        description: 'Content, Leads, Kanäle & Zielgruppe — voll editierbar (Gesamt = FB + LinkedIn).',
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
    title: 'Agent · AEVUM',
    description: 'Conversation-Logs, Inbox, Memory/State des AEVUM-Agents.',
    zones: [],
  },
  docs: {
    title: 'Dokumente · AEVUM',
    description: 'Alle AEVUM-Dokumente — scope/origin-gekennzeichnet.',
    zones: [],
  },
};
