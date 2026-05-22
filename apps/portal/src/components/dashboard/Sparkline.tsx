// Minimal SVG sparkline — zero-dep, ~30 lines.

type Props = {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
};

export default function Sparkline({ data, width = 80, height = 24, className }: Props) {
  if (!data || data.length < 2) {
    return <span className="text-ink-400 text-xs">—</span>;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(' L ')}`;
  const lastX = (data.length - 1) * step;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 2) - 1;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0a458" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e0a458" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${lastX},${height} L 0,${height} Z`}
        fill="url(#sparkfill)"
      />
      <path d={path} fill="none" stroke="#e0a458" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="1.8" fill="#f5d68d" />
    </svg>
  );
}
