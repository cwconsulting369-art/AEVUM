import { MessageCircle, Flame } from 'lucide-react';
import type { DashboardData } from './types';
import { fmtPct } from './types';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type Props = { insights: DashboardData['helpbot_insights'] };

function relativeTime(iso: string, t: TFunction): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('dashComponents.helpbot.justNow');
  if (m < 60) return t('dashComponents.helpbot.minAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('dashComponents.helpbot.hAgo', { h });
  const d = Math.floor(h / 24);
  return t('dashComponents.helpbot.dAgo', { d });
}

export default function HelpbotInsightsCard({ insights }: Props) {
  const { t } = useTranslation();
  const noData = insights.recent.length === 0 && insights.top_pains.length === 0;

  return (
    <div className="card-premium p-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageCircle size={14} className="text-gold-300" />
          {t('dashComponents.helpbot.title')}
        </h3>
        {insights.handoff_rate_pct != null && (
          <span className="badge badge-gold">
            {t('dashComponents.helpbot.handoff', { pct: fmtPct(insights.handoff_rate_pct) })}
          </span>
        )}
      </header>

      {noData ? (
        <div className="text-center py-8">
          <MessageCircle size={28} className="mx-auto mb-3 text-gold-300/60" />
          <div className="text-sm text-ink-300">{t('dashComponents.helpbot.empty')}</div>
          <div className="text-xs text-ink-400 mt-1">{t('dashComponents.helpbot.emptyHint')}</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold mb-3">
              {t('dashComponents.helpbot.last5')}
            </div>
            {insights.recent.length === 0 ? (
              <div className="text-xs text-ink-500">{t('dashComponents.helpbot.dash')}</div>
            ) : (
              <ul className="space-y-2">
                {insights.recent.map((c, i) => (
                  <li
                    key={c.id_hash}
                    className="border border-white/[0.06] rounded-md p-3 bg-white/[0.02] animate-fade-up"
                    style={{ animationDelay: `${30 + i * 35}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[0.65rem] font-mono text-gold-300">#{c.id_hash}</span>
                      <span className="text-[0.65rem] text-ink-400">
                        {t('dashComponents.helpbot.msgCount', { rel: relativeTime(c.last_msg_at, t), count: c.message_count })}
                      </span>
                    </div>
                    <div className="text-xs text-ink-200 truncate">
                      {c.first_msg_preview || <span className="text-ink-500 italic">{t('dashComponents.helpbot.emptyMsg')}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold mb-3 flex items-center gap-1.5">
              <Flame size={11} className="text-gold-300" /> {t('dashComponents.helpbot.topPains')}
            </div>
            {insights.top_pains.length === 0 ? (
              <div className="text-xs text-ink-500">
                {t('dashComponents.helpbot.noPains')}
                <div className="mt-1">{t('dashComponents.helpbot.noPainsHint')}</div>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {insights.top_pains.map((p, i) => (
                  <li
                    key={p.text}
                    className="flex items-center justify-between gap-3 text-xs animate-fade-up"
                    style={{ animationDelay: `${40 + i * 40}ms` }}
                  >
                    <span className="text-ink-200 truncate flex-1">{p.text}</span>
                    <span className="font-mono tabular-nums text-gold-300 shrink-0">{p.count}×</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
