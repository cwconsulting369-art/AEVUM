/**
 * AEVUM Brand-Mark — premium SVG monogram + wordmark.
 * Custom-drawn: stylized "A" inside hexagonal frame, gold-gradient.
 */
import { useTranslation } from 'react-i18next';

type Props = { size?: number; showWordmark?: boolean; className?: string };

export default function Brand({ size = 32, showWordmark = true, className = '' }: Props) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="AEVUM logo">
        <defs>
          <linearGradient id="aevum-gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5d68d" />
            <stop offset="50%" stopColor="#e0a458" />
            <stop offset="100%" stopColor="#a86d27" />
          </linearGradient>
          <linearGradient id="aevum-soft-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {/* Hex frame */}
        <path
          d="M24 3 L42 13 L42 35 L24 45 L6 35 L6 13 Z"
          fill="url(#aevum-soft-grad)"
          stroke="url(#aevum-gold-grad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* "A" monogram — clean geometric */}
        <path
          d="M16 33 L24 14 L32 33 M19.5 26 L28.5 26"
          stroke="url(#aevum-gold-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center dot */}
        <circle cx="24" cy="22" r="0.9" fill="#f5d68d" />
      </svg>
      {showWordmark && (
        <div className="leading-none">
          <div className="text-[1.05rem] font-bold tracking-tight text-white">AEVUM</div>
          <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 mt-1">{t('common.customerPortal')}</div>
        </div>
      )}
    </div>
  );
}
