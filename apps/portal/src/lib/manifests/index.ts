// Manifest-Registry + Resolver (ADR-002 — Admin-Parität).
// Gekeyed nach ACCOUNT-Slug (= me.account.slug / JWT). So sieht der Operator
// (client_zero) EXAKT dasselbe wie der Kunde — egal über welchen Weg er reinkommt:
//   - Kunde eingeloggt           → slug = sein account-slug
//   - Operator impersonate (Bot) → slug = kunde-account-slug (JWT ist der Kunde)
//   - Operator via eigenem Acc.  → client_zero → darf jeden Kunden wählen
// Alle drei → selbes Manifest → identische Ansicht.
import type { DashboardManifest } from '@/lib/dashboard-manifest';
import { patrickManifest } from './patrick';
import { aevumManifest } from './aevum';

/** account-slug → Dashboard-Manifest. Neuer Kunde = ein Eintrag hier. */
export const MANIFESTS: Record<string, DashboardManifest> = {
  'patrick-roth': patrickManifest,
  'carlos': aevumManifest,
};

export interface CustomerOption { slug: string; label: string }

interface MeLike {
  account: { slug: string; client_zero: boolean };
  projects?: Array<{ slug: string; owner_slug?: string }>;
}

/**
 * Welche Kunden-Dashboards darf dieser User sehen?
 * - Operator (client_zero): ALLE Kunden mit Manifest.
 * - Sonst: nur der eigene Account (falls er ein Manifest hat).
 */
export function resolveCustomerOptions(me: MeLike): CustomerOption[] {
  if (me.account.client_zero) {
    return Object.entries(MANIFESTS).map(([slug, m]) => ({ slug, label: m.project.label }));
  }
  const m = MANIFESTS[me.account.slug];
  return m ? [{ slug: me.account.slug, label: m.project.label }] : [];
}

export function getManifest(slug: string): DashboardManifest | null {
  return MANIFESTS[slug] ?? null;
}

/** Lookup per DB-Projekt-Slug (ProjectDetail kennt nur den Projekt-Slug, nicht den Account). */
export function getManifestByProjectSlug(projectSlug: string): DashboardManifest | null {
  return Object.values(MANIFESTS).find((m) => m.project.slug === projectSlug) ?? null;
}
