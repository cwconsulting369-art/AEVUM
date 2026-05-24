// HookScoreBar — 0-10 Score visualisiert als Bar.

interface Props {
  score: number | null | undefined;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export default function HookScoreBar({ score, max = 10, label, size = 'md' }: Props) {
  const s = typeof score === 'number' ? Math.max(0, Math.min(max, score)) : 0;
  const pct = (s / max) * 100;
  const color =
    s >= 8 ? 'bg-emerald-400' :
    s >= 6 ? 'bg-lime-400' :
    s >= 4 ? 'bg-amber-400' :
    'bg-rose-400';

  const barH = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.65rem] uppercase tracking-wider text-ink-500">{label}</span>
          <span className="text-xs font-mono text-ink-200 tabular-nums">{s.toFixed(1)}/{max}</span>
        </div>
      )}
      <div className={`w-full ${barH} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`${barH} ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
