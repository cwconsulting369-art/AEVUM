// CommandShell — generisches War-Room-Kunden-Dashboard (ADR-002 D1/D4).
// Rendert ein komplettes Dashboard NUR aus einem DashboardManifest:
//   linke Nav (3 Achsen: Projekt-Bereiche · Agent · Dokumente) | Bento-Main | Rail.
// Kein hartkodiertes Layout → neuer Bereich/Kunde = Manifest-Eintrag.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import {
  Globe, Megaphone, Facebook, Linkedin, Target, TrendingUp, Image, FileText,
  Bot, Inbox, MessageSquare, Database, Layers, Users, Folder, Activity, Mail,
  Clock, FolderGit2,
} from 'lucide-react';
import DomainTile, { Stat, Pill } from './cc/DomainTile';
import LeadFunnel from '@/pages/dashboards/LeadFunnel';
import PlatformFunnel from './PlatformFunnel';
import type { DashboardManifest, IconKey, PaneSpec, ZoneSpec } from '@/lib/dashboard-manifest';
import '@/styles/command-shell.css';

/** Daten-Kontext für Custom-Panes (z.B. LeadFunnel braucht den Projekt-Slug). */
export interface ShellContext {
  leadFunnel?: { slug: string; name: string };
}

const ICONS: Record<IconKey, LucideIcon> = {
  globe: Globe, megaphone: Megaphone, facebook: Facebook, linkedin: Linkedin,
  target: Target, trendingUp: TrendingUp, image: Image, fileText: FileText,
  bot: Bot, inbox: Inbox, messageSquare: MessageSquare, database: Database,
  layers: Layers, users: Users, folder: Folder, activity: Activity, mail: Mail,
};
const icon = (k?: IconKey): LucideIcon => (k && ICONS[k]) || FileText;

type Selection = string; // area-slug | `${area}/${sub}` | 'agent' | 'docs'

function StatusBadge({ status }: { status?: ZoneSpec['status'] }) {
  const { t } = useTranslation();
  if (status === 'live') return <Pill tone="ok">{t('dashComponents.cmd.statusLive')}</Pill>;
  if (status === 'wip') return <Pill tone="warn">{t('dashComponents.cmd.statusWip')}</Pill>;
  if (status === 'soon') return <Pill tone="neutral">{t('dashComponents.cmd.statusSoon')}</Pill>;
  return null;
}

function Zone({ z }: { z: ZoneSpec }) {
  const dim = z.status === 'soon';
  return (
    <DomainTile label={z.label} icon={icon(z.icon)} color={z.color} dim={dim} badge={<StatusBadge status={z.status} />}>
      {z.stats && z.stats.length > 0 && (
        <div className={z.stats.length >= 3 ? 'cc-row-3' : 'cc-row-2'}>
          {z.stats.map((s) => <Stat key={s.label} label={s.label} accent={s.accent}>{s.value}</Stat>)}
        </div>
      )}
      {z.bars && z.bars.length > 0 && (
        <div className="cc-bars">
          {z.bars.map((b) => (
            <div key={b.label} className="cc-bar">
              <span className="cc-bar__label">{b.label}</span>
              <div className="cc-bar__track">
                <div className="cc-bar__fill" style={{ width: `${b.pct}%`, background: b.color || 'linear-gradient(90deg, rgba(224,164,88,0.5), rgba(224,164,88,0.9))' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {z.chips && z.chips.length > 0 && (
        <div className="cc-chips">
          {z.chips.map((c) => <span key={c} className="cc-chip">{c}</span>)}
        </div>
      )}
      {z.note && <div className="cc-placeholder__hint" style={{ margin: 0 }}>{z.note}</div>}
    </DomainTile>
  );
}

/** Custom-Pane: rendert eine echte Daten-Komponente statt Bento-Zonen (ADR R4). */
function CustomPane({ pane, ctx }: { pane: PaneSpec; ctx: ShellContext }) {
  const { t } = useTranslation();
  if (pane.custom === 'funnel-facebook') return <PlatformFunnel platform="facebook" />;
  if (pane.custom === 'funnel-linkedin') return <PlatformFunnel platform="linkedin" />;
  if (pane.custom === 'lead-funnel') {
    if (ctx.leadFunnel) {
      return <LeadFunnel projectSlug={ctx.leadFunnel.slug} projectName={ctx.leadFunnel.name} />;
    }
    return (
      <div className="cc-placeholder">
        <div className="cc-placeholder__title">{t('dashComponents.cmd.leadFunnelUnavailable')}</div>
        <div className="cc-placeholder__hint">{t('dashComponents.cmd.leadFunnelNoContext')}</div>
      </div>
    );
  }
  return null;
}

function PaneView({ pane, ctx }: { pane: PaneSpec; ctx: ShellContext }) {
  const { t } = useTranslation();
  return (
    <div className="cmd-main">
      <div className="cmd-main__head">
        <span className="cmd-main__title">{pane.title}</span>
        {pane.description && <span className="cmd-main__crumb">{pane.description}</span>}
      </div>
      {pane.gatedNote && (
        <div className="cc-placeholder" style={{ padding: '14px 18px', flexDirection: 'row', justifyContent: 'flex-start', gap: 10 }}>
          <Clock size={14} style={{ color: 'var(--accent-glow)', flexShrink: 0 }} />
          <span className="cc-placeholder__hint" style={{ margin: 0, textAlign: 'left' }}>{pane.gatedNote}</span>
        </div>
      )}
      {pane.custom ? (
        <CustomPane pane={pane} ctx={ctx} />
      ) : pane.zones.length > 0 ? (
        <div className="cc-bento">{pane.zones.map((z) => <Zone key={z.key} z={z} />)}</div>
      ) : (
        <div className="cc-placeholder">
          <div className="cc-placeholder__title">{t('dashComponents.cmd.noContentTitle')}</div>
          <div className="cc-placeholder__hint">{t('dashComponents.cmd.noContentHint')}</div>
        </div>
      )}
    </div>
  );
}

export default function CommandShell({ manifest, ctx = {} }: { manifest: DashboardManifest; ctx?: ShellContext }) {
  const { t } = useTranslation();
  const [sel, setSel] = useState<Selection>(manifest.areas[0]?.slug ?? 'agent');

  // Resolve current pane from selection
  const pane = useMemo<PaneSpec>(() => {
    if (sel === 'agent') return manifest.agent;
    if (sel === 'docs') return manifest.docs;
    const [areaSlug, subSlug] = sel.split('/');
    const area = manifest.areas.find((a) => a.slug === areaSlug);
    if (!area) return manifest.areas[0]?.pane ?? manifest.agent;
    if (subSlug) {
      const sub = area.children?.find((s) => s.slug === subSlug);
      if (sub) return sub.pane;
    }
    return area.pane ?? manifest.agent;
  }, [sel, manifest]);

  const ProjIcon = icon('globe');

  return (
    <div className="cmd-shell">
      <div className="cmd-shell__frame">
        {/* ===== Left nav (3 Achsen) ===== */}
        <nav className="cmd-nav" aria-label="Dashboard-Navigation">
          <div className="cmd-nav__project">
            <span className="cmd-nav__project-icon"><FolderGit2 size={15} /></span>
            <div>
              <div className="cmd-nav__project-name">{manifest.project.label}</div>
              {manifest.project.tagline && <div className="cmd-nav__project-sub">{t('dashComponents.cmd.project')}</div>}
            </div>
          </div>

          {/* Achse 1 — Projekt-Bereiche */}
          <div className="cmd-nav__group-label">{t('dashComponents.cmd.areas')}</div>
          {manifest.areas.map((area) => {
            const AIcon = icon(area.icon);
            const active = sel === area.slug || sel.startsWith(`${area.slug}/`);
            return (
              <div key={area.slug}>
                <button className={`cmd-nav__item ${sel === area.slug ? 'cmd-nav__item--active' : active ? 'cmd-nav__item--active' : ''}`} onClick={() => setSel(area.slug)}>
                  <AIcon size={15} className="cmd-nav__item-ic" />
                  <span>{area.label}</span>
                </button>
                {area.children?.map((sub) => {
                  const SIcon = icon(sub.icon);
                  const subSel = `${area.slug}/${sub.slug}`;
                  return (
                    <button key={sub.slug} className={`cmd-nav__item cmd-nav__item--sub ${sel === subSel ? 'cmd-nav__item--active' : ''}`} onClick={() => setSel(subSel)}>
                      <SIcon size={13} className="cmd-nav__item-ic" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          <div className="cmd-nav__divider" />

          {/* Achse 2 — Agent */}
          <button className={`cmd-nav__item ${sel === 'agent' ? 'cmd-nav__item--active' : ''}`} onClick={() => setSel('agent')}>
            <Bot size={15} className="cmd-nav__item-ic" />
            <span>{t('dashComponents.cmd.agent')}</span>
          </button>
          {/* Achse 3 — Dokumente */}
          <button className={`cmd-nav__item ${sel === 'docs' ? 'cmd-nav__item--active' : ''}`} onClick={() => setSel('docs')}>
            <FileText size={15} className="cmd-nav__item-ic" />
            <span>{t('dashComponents.cmd.documents')}</span>
          </button>
        </nav>

        {/* ===== Main ===== */}
        <PaneView pane={pane} ctx={ctx} />

        {/* ===== Right rail ===== */}
        <aside className="cmd-rail">
          <div className="cc-railcard">
            <div className="cc-railcard__head">
              <span className="cc-railcard__chip"><TrendingUp size={13} /></span>
              <span className="cc-railcard__label">{t('dashComponents.cmd.today')}</span>
            </div>
            <div className="cc-railcard__body">
              {manifest.feed && manifest.feed.length > 0 ? (
                manifest.feed.map((f, i) => (
                  <div key={i} className="cc-feed-row">
                    <span className="cc-feed-row__time">{f.time}</span>
                    <span>{f.text}</span>
                  </div>
                ))
              ) : (
                <div className="cc-railcard__empty">{t('dashComponents.cmd.noActivity')}</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
