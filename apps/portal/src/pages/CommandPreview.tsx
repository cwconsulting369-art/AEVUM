// CommandPreview — Vorschau des War-Room-Kunden-Dashboards (ADR-002 Etappe A).
// Eigene Route /cmd: ersetzt Patricks Live-Dashboard NICHT, bis Inhalt da ist.
// Nach Approval + Patrick-Session-Spec wird CommandShell der Default für patrick-roth.
import CommandShell from '@/components/dashboard/CommandShell';
import { patrickManifest } from '@/lib/manifests/patrick';

export default function CommandPreview() {
  return (
    <div className="dashboard-stack @container">
      <header style={{ marginBottom: 4 }}>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-1 uppercase tracking-wider font-semibold">
          War-Room · Vorschau
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Command Center — {patrickManifest.project.label}</h1>
        <p className="text-ink-400 mt-1 text-sm">
          Skelett aus ADR-002 (Etappe A). Struktur steht — Detail-Panes folgen aus der Patrick-Session.
        </p>
      </header>
      <CommandShell manifest={patrickManifest} />
    </div>
  );
}
