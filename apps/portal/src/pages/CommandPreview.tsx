// CommandPreview — Vorschau des War-Room-Kunden-Dashboards (ADR-002 Etappe A).
// Eigene Route /cmd: ersetzt Patricks Live-Dashboard NICHT, bis Inhalt da ist.
// Account-aware: rendert das Manifest des aktiven Kunden (Admin-Parität).
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import CommandShell, { type ShellContext } from '@/components/dashboard/CommandShell';
import { patrickManifest } from '@/lib/manifests/patrick';

export default function CommandPreview() {
  const { t } = useTranslation();
  const { me } = useAuth();

  // LeadFunnel-Kontext: Patricks (bzw. der aktive) Projekt-Slug für die Live-Daten.
  const proj = me?.projects?.[0];
  const ctx: ShellContext = proj ? { leadFunnel: { slug: proj.slug, name: proj.name } } : {};

  return (
    <div className="dashboard-stack @container">
      <header style={{ marginBottom: 4 }}>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-1 uppercase tracking-wider font-semibold">
          {t('dashboard.warRoomPreview')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t('dashboard.commandCenter', { label: patrickManifest.project.label })}</h1>
        <p className="text-ink-400 mt-1 text-sm">
          {t('dashboard.previewIntro')}
        </p>
      </header>
      <CommandShell manifest={patrickManifest} ctx={ctx} />
    </div>
  );
}
