// DifferencesPanel — zeigt Verbesserungen zwischen Vorher/Nachher.

import { ArrowRight, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface Difference {
  what?: string;
  why?: string;
  score_delta?: number;
  category?: string;
}

interface Props {
  differences?: Difference[] | null;
  count?: number;
}

export default function DifferencesPanel({ differences, count }: Props) {
  const { t } = useTranslation();
  if (!differences || differences.length === 0) {
    return (
      <div className="card-premium p-5 text-center text-sm text-ink-400">
        {t('scriptFactory.differences.empty')}
      </div>
    );
  }

  return (
    <div className="card-premium p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="text-gold-300" />
        <h3 className="text-sm font-semibold text-white">
          {t('scriptFactory.differences.title', { count: count ?? differences.length })}
        </h3>
      </div>
      <ul className="space-y-3">
        {differences.map((d, i) => (
          <li key={i} className="border-l-2 border-gold-400/40 pl-3 py-1">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="text-sm font-medium text-white flex-1">{d.what || t('scriptFactory.differences.change', { n: i + 1 })}</div>
              {typeof d.score_delta === 'number' && (
                <span className={`text-xs font-mono shrink-0 ${d.score_delta > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {d.score_delta > 0 ? '+' : ''}{d.score_delta.toFixed(1)}
                </span>
              )}
            </div>
            {d.why && (
              <div className="text-xs text-ink-400 leading-relaxed flex items-start gap-1.5">
                <ArrowRight size={11} className="text-ink-600 mt-0.5 shrink-0" />
                <span>{d.why}</span>
              </div>
            )}
            {d.category && (
              <div className="mt-1 text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                {d.category}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
