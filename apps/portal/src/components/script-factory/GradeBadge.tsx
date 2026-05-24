// GradeBadge — A-F Grade-Display mit Farb-Coding.

interface Props {
  grade: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const COLOR: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: 'bg-emerald-400/15', border: 'border-emerald-400/40', text: 'text-emerald-300' },
  B: { bg: 'bg-lime-400/15',    border: 'border-lime-400/40',    text: 'text-lime-300' },
  C: { bg: 'bg-amber-400/15',   border: 'border-amber-400/40',   text: 'text-amber-300' },
  D: { bg: 'bg-orange-400/15',  border: 'border-orange-400/40',  text: 'text-orange-300' },
  E: { bg: 'bg-rose-400/15',    border: 'border-rose-400/40',    text: 'text-rose-300' },
  F: { bg: 'bg-rose-500/20',    border: 'border-rose-500/50',    text: 'text-rose-200' },
};

const SIZE = {
  sm: 'w-8 h-8 text-base',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
};

export default function GradeBadge({ grade, size = 'md', label }: Props) {
  const g = (grade || '?').toUpperCase().charAt(0);
  const c = COLOR[g] ?? { bg: 'bg-white/5', border: 'border-white/15', text: 'text-ink-400' };
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className={`${SIZE[size]} ${c.bg} ${c.border} ${c.text} border rounded-lg flex items-center justify-center font-bold font-mono`}>
        {g}
      </div>
      {label && <span className="text-[0.6rem] uppercase tracking-wider text-ink-500">{label}</span>}
    </div>
  );
}
