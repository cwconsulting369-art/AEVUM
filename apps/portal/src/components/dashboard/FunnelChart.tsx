import type { FunnelStage } from './types';
import { fmtPct } from './types';
import { useTranslation } from 'react-i18next';

type Props = {
  stages: FunnelStage[];
};

// Custom SVG horizontal funnel — width per stage proportional to count.
export default function FunnelChart({ stages }: Props) {
  const { t } = useTranslation();
  if (!stages.length) return null;
  const max = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const widthPct = max > 0 ? Math.max((s.count / max) * 100, s.count > 0 ? 4 : 1) : 1;
        const isEmpty = s.count === 0;
        return (
          <div
            key={s.stage}
            className="animate-fade-up"
            style={{ animationDelay: `${60 + i * 70}ms` }}
          >
            <div className="flex items-center justify-between text-xs text-ink-300 mb-1">
              <span className="font-medium">
                <span className="text-ink-400 mr-2 font-mono">{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </span>
              <span className="font-mono tabular-nums">
                {s.count}
                {s.conversion_pct != null && i > 0 && (
                  <span className="text-ink-500 ml-2 text-[0.7rem]">{fmtPct(s.conversion_pct)}</span>
                )}
              </span>
            </div>
            <div className="relative h-8 rounded-md overflow-hidden bg-white/[0.025] border border-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-700 ease-out"
                style={{
                  width: `${widthPct}%`,
                  background: isEmpty
                    ? 'rgba(74,74,85,0.15)'
                    : 'linear-gradient(90deg, rgba(224,164,88,0.85) 0%, rgba(224,164,88,0.35) 100%)',
                  boxShadow: isEmpty ? 'none' : '0 0 24px -8px rgba(224,164,88,0.5) inset'
                }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className={`text-[0.7rem] font-medium ${isEmpty ? 'text-ink-500' : 'text-ink-950 mix-blend-normal'}`}>
                  {isEmpty ? t('dashComponents.funnelChart.empty') : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
