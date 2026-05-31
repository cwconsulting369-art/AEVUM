/**
 * PathThreeCard — 3-Pfade Conversion-CTA
 *
 * Drei klare Wege zum nächsten Schritt: Blueprint kaufen / Audit buchen / Helpbot.
 * Wird auf Home, Method, About, Cases eingesetzt (Buy-Flow-Fix, Memory:
 * project_aevum_buy_flow_bottleneck_2026_05_20).
 *
 * Helpbot wird via Custom-Event `aevum:open-helpbot` geöffnet — Listener
 * sitzt in components/Helpbot.tsx.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

export type PathVariant = 'primary' | 'secondary' | 'tertiary';

interface CardProps {
  variant: PathVariant;
  href?: string;
  onClick?: () => void;
  title: string;
  subtitle: string;
  index: number;
}

const variantStyles: Record<PathVariant, {
  icon: React.ElementType;
  border: string;
  accent: string;
  iconBg: string;
}> = {
  primary: {
    icon: ShoppingCart,
    border: 'border-theme-border-accent hover:border-theme-accent hover:bg-theme-accent/[0.04]',
    accent: 'text-theme-accent',
    iconBg: 'bg-theme-accent/[0.12]',
  },
  secondary: {
    icon: Sparkles,
    border: 'border-theme-border hover:border-theme-border-accent hover:bg-bg-elevated',
    accent: 'text-text-primary',
    iconBg: 'bg-bg-elevated',
  },
  tertiary: {
    icon: MessageCircle,
    border: 'border-theme-border hover:border-theme-border-strong hover:bg-bg-elevated',
    accent: 'text-text-secondary',
    iconBg: 'bg-bg-elevated',
  },
};

function Card({ variant, href, onClick, title, subtitle, index }: CardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const s = variantStyles[variant];
  const Icon = s.icon;

  const inner = (
    <>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={s.accent} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium leading-tight mb-1.5 ${s.accent}`}>{title}</h3>
          <p className="text-xs text-text-secondary leading-snug">{subtitle}</p>
        </div>
        <ArrowRight size={16} className="text-text-muted group-hover:text-theme-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </>
  );

  const baseClass = `flex flex-col h-full w-full text-left bg-bg-surface border p-6 transition-all group ${s.border}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {href ? (
        <a href={href} className={baseClass}>
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={baseClass}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}

interface PathThreeCardProps {
  /** Optional Section-Headline above the 3 cards */
  eyebrow?: string;
  headline?: string;
  subline?: string;
  /** Hide the eyebrow/headline block entirely (just show cards) */
  compact?: boolean;
}

export default function PathThreeCard({
  eyebrow,
  headline,
  subline,
  compact = false,
}: PathThreeCardProps = {}) {
  const { t } = useTranslation();
  const resolvedEyebrow = eyebrow ?? t('common.pathEyebrow');
  const resolvedHeadline = headline ?? t('common.pathHeadline');
  const resolvedSubline = subline ?? t('common.pathSubline');
  const openHelpbot = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('aevum:open-helpbot'));
  };

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-8 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
            {resolvedEyebrow}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3 text-text-primary">
            {resolvedHeadline}
          </h2>
          {resolvedSubline && (
            <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
              {resolvedSubline}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="primary"
          href="/#/shop"
          title={t('common.pathBuyTitle')}
          subtitle={t('common.pathBuySubtitle')}
          index={0}
        />
        <Card
          variant="secondary"
          href="/#/audit"
          title={t('common.pathAuditTitle')}
          subtitle={t('common.pathAuditSubtitle')}
          index={1}
        />
        <Card
          variant="tertiary"
          onClick={openHelpbot}
          title={t('common.pathHelpbotTitle')}
          subtitle={t('common.pathHelpbotSubtitle')}
          index={2}
        />
      </div>
    </div>
  );
}
