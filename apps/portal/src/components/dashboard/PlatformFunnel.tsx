// PlatformFunnel — platform-gefilterte Detailsicht (Facebook ODER LinkedIn).
// Zeigt: Platform-Aggregat (Pieces/Status/Leads/Reichweite) + 3 Content-Pieces
// nebeneinander (links/mitte/rechts) mit den Werten je Piece darunter.
// Lead-Funnel (Gesamt) = Summe beider — das macht das LeadFunnel-Cockpit.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Linkedin, FileText, Clock, Eye, MousePointerClick, Users, Megaphone } from 'lucide-react';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';

type Platform = 'facebook' | 'linkedin';

type Piece = {
  id: string; title: string | null; body: string | null; platform: string | null;
  segment: string | null; awareness_stage: string | null; status: string;
  scheduled_at: string | null; published_at: string | null; created_at: string;
};

type ChannelAgg = {
  platform: string; connected?: boolean; enabled?: boolean; total?: number;
  by_status?: Record<string, number>; leads_attributed?: number;
  impressions?: number; clicks?: number;
};

const PLAT_META: Record<Platform, { icon: typeof Facebook }> = {
  facebook: { icon: Facebook },
  linkedin: { icon: Linkedin },
};

function fmtDate(iso: string | null, lang: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', { day: '2-digit', month: 'short' }); }
  catch { return '—'; }
}

export default function PlatformFunnel({ platform }: { platform: Platform }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [agg, setAgg] = useState<ChannelAgg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(false);
      try {
        const [piecesRes, overviewRes] = await Promise.allSettled([
          api<{ ok?: boolean; pieces?: Piece[] } | Piece[]>(`/api/me/funnel/pieces?platform=${platform}`),
          api<{ ok?: boolean; channels?: ChannelAgg[] } | { channels?: ChannelAgg[] }>(`/api/me/funnel/overview`),
        ]);
        if (!alive) return;
        if (piecesRes.status === 'fulfilled') {
          const v = piecesRes.value;
          const list = Array.isArray(v) ? v : (v.pieces ?? []);
          setPieces(Array.isArray(list) ? list : []);
        }
        if (overviewRes.status === 'fulfilled') {
          const v = overviewRes.value as { channels?: ChannelAgg[] };
          const chans = Array.isArray(v.channels) ? v.channels : [];
          setAgg(chans.find(c => c.platform === platform) ?? null);
        }
      } catch { if (alive) setError(true); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [platform]);

  const PlatIcon = PLAT_META[platform].icon;
  const platLabel = platform === 'facebook' ? 'Facebook' : 'LinkedIn';

  // Featured 3: bevorzugt geplante/veröffentlichte, sonst neueste
  const sorted = [...pieces].sort((a, b) => {
    const ax = a.scheduled_at || a.published_at || a.created_at;
    const bx = b.scheduled_at || b.published_at || b.created_at;
    return new Date(bx).getTime() - new Date(ax).getTime();
  });
  const featured = sorted.slice(0, 3);

  const by = agg?.by_status || {};
  const aggCards = [
    { icon: FileText, label: t('dashboards.funnel.pfTotalPieces'), value: String(agg?.total ?? pieces.length) },
    { icon: Megaphone, label: t('dashboards.funnel.pfPublished'), value: String(by.published ?? 0) },
    { icon: Users, label: t('dashboards.funnel.pfLeads'), value: String(agg?.leads_attributed ?? 0) },
    { icon: Eye, label: t('dashboards.funnel.pfReach'), value: agg?.impressions ? agg.impressions.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE') : '—' },
  ];

  if (loading) return <div className="card-premium p-10 flex justify-center"><Spinner size="md" /></div>;
  if (error) return <div className="card-premium p-8 text-center text-sm text-ink-400">{t('dashboards.funnel.pfError')}</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-300"><PlatIcon size={18} /></span>
        <div>
          <h2 className="text-base font-semibold text-white">{t('dashboards.funnel.pfTitle', { platform: platLabel })}</h2>
          <p className="text-xs text-ink-400">{t('dashboards.funnel.pfSub', { platform: platLabel })}</p>
        </div>
        {agg && (
          <span className={`ml-auto text-[0.65rem] px-2 py-1 rounded-full border ${agg.connected ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' : 'border-white/10 text-ink-400 bg-white/5'}`}>
            {agg.connected ? t('dashboards.funnel.pfConnected') : t('dashboards.funnel.pfNotConnected')}
          </span>
        )}
      </div>

      {/* Aggregat-Karten */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {aggCards.map((c, i) => (
          <div key={i} className="card-premium p-3.5">
            <div className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-wider text-ink-400 mb-1"><c.icon size={12} /> {c.label}</div>
            <div className="text-xl font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      {/* 3 Content-Pieces nebeneinander + Werte drunter */}
      <div>
        <div className="flex items-center gap-2 mb-2.5"><FileText size={14} className="text-gold-300" />
          <h3 className="text-sm font-semibold text-white">{t('dashboards.funnel.pfContentTitle', { platform: platLabel })}</h3></div>
        {featured.length === 0 ? (
          <div className="card-premium p-8 text-center text-sm text-ink-400">{t('dashboards.funnel.pfNoPieces', { platform: platLabel })}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featured.map(p => (
              <div key={p.id} className="card-premium p-4 flex flex-col">
                {/* Post-Preview-Mock */}
                <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-white/5">
                  <span className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-ink-950"><PlatIcon size={13} /></span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">Patrick Roth</div>
                    <div className="text-[0.6rem] text-ink-400">{platLabel} · {p.published_at ? fmtDate(p.published_at, lang) : fmtDate(p.scheduled_at, lang)}</div>
                  </div>
                  <span className={`ml-auto text-[0.55rem] px-1.5 py-0.5 rounded ${p.status === 'published' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-ink-300'}`}>
                    {t(`dashboards.funnel.piece${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`, p.status)}
                  </span>
                </div>
                {p.title && <div className="text-xs font-semibold text-white mb-1 line-clamp-2">{p.title}</div>}
                <p className="text-xs text-ink-200 whitespace-pre-line line-clamp-6 flex-1">{p.body || '—'}</p>
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {p.segment && <span className="text-[0.55rem] px-1.5 py-0.5 rounded bg-white/10 text-ink-200">{t(`dashboards.funnel.seg_${p.segment}`, p.segment)}</span>}
                  {p.awareness_stage && <span className="text-[0.55rem] px-1.5 py-0.5 rounded bg-white/10 text-ink-200">{t(`dashboards.funnel.stage_${p.awareness_stage}`, p.awareness_stage)}</span>}
                </div>
                {/* Werte je Piece */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[0.55rem] text-ink-400"><Eye size={10} /> {t('dashboards.funnel.pfImpr')}</div>
                    <div className="text-sm font-bold text-white mt-0.5">—</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[0.55rem] text-ink-400"><MousePointerClick size={10} /> {t('dashboards.funnel.pfClicks')}</div>
                    <div className="text-sm font-bold text-white mt-0.5">—</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[0.55rem] text-ink-400"><Users size={10} /> {t('dashboards.funnel.pfLeadsShort')}</div>
                    <div className="text-sm font-bold text-white mt-0.5">—</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[0.65rem] text-ink-500 mt-2.5 flex items-center gap-1.5">
          <Clock size={11} /> {t('dashboards.funnel.pfMetricsGated', { platform: platLabel })}
        </p>
      </div>
    </div>
  );
}
