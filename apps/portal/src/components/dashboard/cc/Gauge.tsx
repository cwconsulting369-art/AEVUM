// Gauge — radialer Arc-Gauge (270° sweep), dep-frei (portiert aus LennoxOS).
interface GaugeProps {
  value: number; // 0..100
  size?: number;
  label?: string;
  sublabel?: string;
  warnAt?: number;
  dangerAt?: number;
  className?: string;
}

export default function Gauge({ value, size = 92, label, sublabel, warnAt = 70, dangerAt = 88, className }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 7;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;
  const circ = 2 * Math.PI * r;
  const dash = circ * (sweep / 360);
  const offset = dash * (1 - clamped / 100);
  const color = clamped >= dangerAt ? 'var(--status-danger)' : clamped >= warnAt ? 'var(--status-warning)' : 'var(--status-success)';

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${startAngle}deg)` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22,1,0.36,1), stroke 400ms ease', filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
          {Math.round(clamped)}<span style={{ fontSize: size * 0.13, color: 'var(--text-muted)' }}>%</span>
        </span>
        {label && <span style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>}
        {sublabel && <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>{sublabel}</span>}
      </div>
    </div>
  );
}
