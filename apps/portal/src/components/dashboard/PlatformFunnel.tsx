// PlatformFunnel — vollwertiger, getrennter War-Room-Bereich pro Plattform
// (Facebook ODER LinkedIn). War-Room-Design (DomainTile/Bento wie CommandShell):
//   Zone 1 Verbindung & Settings (connect/disconnect/enable/account)
//   Zone 2 Reichweite · Zone 3 Pieces · Zone 4 Leads
//   + Content: 3 Pieces nebeneinander (links/mitte/rechts) mit Werten je Piece.
// Lead-Funnel (Gesamt) = Summe beider (LeadFunnel-Cockpit).
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Facebook, Linkedin, FileText, Clock, Eye, Users, Plug, Power, Link2 } from 'lucide-react';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import DomainTile, { Stat } from './cc/DomainTile';

type Platform = 'facebook' | 'linkedin';

type Piece = {
  id: string; title: string | null; body: string | null; platform: string | null;
  segment: string | null; awareness_stage: string | null; status: string;
  scheduled_at: string | null; published_at: string | null; created_at: string;
};
type Channel = {
  platform: string; connected?: boolean; enabled?: boolean;
  display_name?: string | null; external_id?: string | null;
};
type ChannelAgg = {
  platform: string; total?: number; by_status?: Record<string, number>;
  leads_attributed?: number; impressions?: number; clicks?: number;
};

const PLAT_ICON: Record<Platform, typeof Facebook> = { facebook: Facebook, linkedin: Linkedin };

function fmtDate(iso: string | null, lang: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', { day: '2-digit', month: 'short' }); }
  catch { return '—'; }
}
function gated(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return /API (503|409)/.test(e.message) || /gated|not[_ ]configured|oauth/i.test(e.message);
}

export default function PlatformFunnel({ platform }: { platform: Platform }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [agg, setAgg] = useState<ChannelAgg | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const [piecesRes, overviewRes, chRes] = await Promise.allSettled([
        api<{ pieces?: Piece[] } | Piece[]>(`/api/me/funnel/pieces?platform=${platform}`),
        api<{ channels?: ChannelAgg[] }>(`/api/me/funnel/overview`),
        api<{ channels?: Channel[] } | Channel[]>(`/api/me/funnel/channels`),
      ]);
      if (piecesRes.status === 'fulfilled') {
        const v = piecesRes.value; const list = Array.isArray(v) ? v : (v.pieces ?? []);
        setPieces(Array.isArray(list) ? list : []);
      }
      if (overviewRes.status === 'fulfilled') {
        const chans = Array.isArray(overviewRes.value.channels) ? overviewRes.value.channels : [];
        setAgg(chans.find(c => c.platform === platform) ?? null);
      }
      if (chRes.status === 'fulfilled') {
        const v = chRes.value; const list = Array.isArray(v) ? v : (v.channels ?? []);
        setChannel((Array.isArray(list) ? list : []).find(c => c.platform === platform) ?? null);
      }
    } catch { setError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [platform]);

  const connect = async () => {
    setBusy('connect'); setNotConfigured(false);
    try {
      const r = await api<{ authorize_url?: string }>(`/api/me/funnel/channels/${platform}/connect/start`, { method: 'POST' });
      if (r.authorize_url) { window.location.href = r.authorize_url; return; }
      setNotConfigured(true);
    } catch (e) {
      if (gated(e)) setNotConfigured(true);
      else toast.error(e instanceof Error ? e.message : 'Connect failed');
    } finally { setBusy(null); }
  };
  const disconnect = async () => {
    setBusy('disconnect');
    try { await api(`/api/me/funnel/channels/${platform}/disconnect`, { method: 'POST' }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(null); }
  };
  const toggleEnabled = async () => {
    setBusy('toggle');
    try { await api(`/api/me/funnel/channels/${platform}`, { method: 'PATCH', body: JSON.stringify({ enabled: !channel?.enabled }) }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(null); }
  };

  const PlatIcon = PLAT_ICON[platform];
  const platLabel = platform === 'facebook' ? 'Facebook' : 'LinkedIn';
  const connected = !!channel?.connected;
  const by = agg?.by_status || {};
  const nf = (n?: number) => (n ? n.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE') : '—');

  const sorted = [...pieces].sort((a, b) => {
    const ax = a.scheduled_at || a.published_at || a.created_at;
    const bx = b.scheduled_at || b.published_at || b.created_at;
    return new Date(bx).getTime() - new Date(ax).getTime();
  });
  const featured = sorted.slice(0, 3);

  if (loading) return <div className="cc-placeholder"><Spinner size="md" /></div>;
  if (error) return <div className="cc-placeholder"><div className="cc-placeholder__hint">{t('dashboards.funnel.pfError')}</div></div>;

  return (
    <div className="cmd-main">
      <div className="cmd-main__head">
        <span className="cmd-main__title">{t('dashboards.funnel.pfTitle', { platform: platLabel })}</span>
        <span className="cmd-main__crumb">{t('dashboards.funnel.pfSub', { platform: platLabel })}</span>
      </div>

      {/* War-Room Bento: Settings + Metriken */}
      <div className="cc-bento">
        {/* Zone 1 — Verbindung & Settings */}
        <DomainTile
          label={t('dashboards.funnel.pfConnection')}
          icon={Plug}
          color={connected ? 'emerald' : 'gold'}
          badge={<span className="cc-tile__badge-text">{connected ? t('dashboards.funnel.pfConnected') : t('dashboards.funnel.pfNotConnected')}</span>}
        >
          <div className="cc-row-2">
            <Stat label={t('dashboards.funnel.pfAccount')}>{channel?.display_name || channel?.external_id || '—'}</Stat>
            <Stat label={t('dashboards.funnel.pfState')} accent={channel?.enabled ? 'var(--status-success)' : undefined}>
              {channel?.enabled ? t('dashboards.funnel.pfStateOn') : t('dashboards.funnel.pfStateOff')}
            </Stat>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {connected ? (
              <>
                <button onClick={toggleEnabled} disabled={busy === 'toggle'} className="cc-btn">
                  <Power size={12} /> {channel?.enabled ? t('dashboards.funnel.pfDisable') : t('dashboards.funnel.pfEnable')}
                </button>
                <button onClick={disconnect} disabled={busy === 'disconnect'} className="cc-btn cc-btn--ghost">
                  <Link2 size={12} /> {t('dashboards.funnel.pfDisconnect')}
                </button>
              </>
            ) : (
              <button onClick={connect} disabled={busy === 'connect'} className="cc-btn">
                <Plug size={12} /> {t('dashboards.funnel.pfConnect', { platform: platLabel })}
              </button>
            )}
          </div>
          {notConfigured && (
            <div className="cc-placeholder__hint" style={{ marginTop: 8, textAlign: 'left' }}>
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
              {t('dashboards.funnel.pfConnectGated', { platform: platLabel })}
            </div>
          )}
        </DomainTile>

        {/* Zone 2 — Reichweite */}
        <DomainTile label={t('dashboards.funnel.pfReach')} icon={Eye} color="info" dim={!connected}>
          <div className="cc-row-2">
            <Stat label={t('dashboards.funnel.pfImpr')}>{nf(agg?.impressions)}</Stat>
            <Stat label={t('dashboards.funnel.pfClicks')}>{nf(agg?.clicks)}</Stat>
          </div>
        </DomainTile>

        {/* Zone 3 — Pieces */}
        <DomainTile label={t('dashboards.funnel.pfTotalPieces')} icon={FileText} color="violet">
          <div className="cc-row-3">
            <Stat label={t('dashboards.funnel.pfPublished')}>{String(by.published ?? 0)}</Stat>
            <Stat label={t('dashboards.funnel.pieceScheduled')}>{String(by.scheduled ?? 0)}</Stat>
            <Stat label={t('dashboards.funnel.pieceDraft')}>{String(by.draft ?? 0)}</Stat>
          </div>
        </DomainTile>

        {/* Zone 4 — Leads */}
        <DomainTile label={t('dashboards.funnel.pfLeads')} icon={Users} color="gold">
          <Stat label={platLabel}>{String(agg?.leads_attributed ?? 0)}</Stat>
        </DomainTile>
      </div>

      {/* Content: 3 Pieces nebeneinander + Werte je Piece */}
      <div style={{ marginTop: 16 }}>
        <div className="cmd-main__head" style={{ marginBottom: 10 }}>
          <span className="cmd-main__title" style={{ fontSize: 14 }}>{t('dashboards.funnel.pfContentTitle', { platform: platLabel })}</span>
        </div>
        {featured.length === 0 ? (
          <div className="cc-placeholder"><div className="cc-placeholder__hint">{t('dashboards.funnel.pfNoPieces', { platform: platLabel })}</div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featured.map(p => (
              <div key={p.id} className="cc-tile" style={{ ['--tile-rgb' as string]: platform === 'facebook' ? '96,165,250' : '96,165,250' }}>
                <div className="cc-tile__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-glow,rgba(224,164,88,0.15))', color: '#e0a458' }}><PlatIcon size={13} /></span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Patrick Roth</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-400,#8b93a7)' }}>{platLabel} · {p.published_at ? fmtDate(p.published_at, lang) : fmtDate(p.scheduled_at, lang)}</div>
                    </div>
                    <span className="cc-tile__badge-text">{t(`dashboards.funnel.piece${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`, p.status)}</span>
                  </div>
                  {p.title && <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.title}</div>}
                  <p style={{ fontSize: 12, color: 'var(--ink-200,#c7cdda)', whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1, margin: 0 }}>{p.body || '—'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {p.segment && <span className="cc-chip">{t(`dashboards.funnel.seg_${p.segment}`, p.segment)}</span>}
                    {p.awareness_stage && <span className="cc-chip">{t(`dashboards.funnel.stage_${p.awareness_stage}`, p.awareness_stage)}</span>}
                  </div>
                  <div className="cc-row-3" style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stat label={t('dashboards.funnel.pfImpr')}>—</Stat>
                    <Stat label={t('dashboards.funnel.pfClicks')}>—</Stat>
                    <Stat label={t('dashboards.funnel.pfLeadsShort')}>—</Stat>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 11, color: 'var(--ink-500,#6b7280)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={11} /> {t('dashboards.funnel.pfMetricsGated', { platform: platLabel })}
        </p>
      </div>
    </div>
  );
}
