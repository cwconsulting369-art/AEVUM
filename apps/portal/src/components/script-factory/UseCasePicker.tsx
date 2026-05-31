// UseCasePicker — Grid mit 7 Use-Case-Cards.

import {
  Phone, PhoneCall, Facebook, Search, Music2,
  ShoppingBag, Mic2, Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface UseCase {
  slug: string;
  name: string;
  description?: string;
  default_knowledge_hub?: string | null;
  required_settings?: string[];
  icon?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  'phone-script-cold':     PhoneCall,
  'phone-script-followup': Phone,
  'ad-copy-meta':          Facebook,
  'ad-copy-google':        Search,
  'ad-copy-tiktok':        Music2,
  'ecommerce-product':     ShoppingBag,
  'sales-pitch':           Mic2,
};

interface Props {
  useCases: UseCase[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export default function UseCasePicker({ useCases, selectedSlug, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {useCases.map((uc) => {
        const Icon = ICON_MAP[uc.slug] ?? Mic2;
        const active = uc.slug === selectedSlug;
        return (
          <button
            key={uc.slug}
            type="button"
            onClick={() => onSelect(uc.slug)}
            className={[
              'card-premium p-4 text-left transition-all',
              active ? 'ring-2 ring-gold-400/60 border-gold-400/40' : ''
            ].join(' ')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? 'bg-gold-400/15 text-gold-300' : 'bg-white/5 text-ink-300'}`}>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              {active && <Check size={14} className="text-gold-300 mt-1" />}
            </div>
            <div className="text-sm font-semibold text-white mb-1">{uc.name}</div>
            {uc.description && (
              <div className="text-[0.7rem] text-ink-400 leading-relaxed line-clamp-3">{uc.description}</div>
            )}
            {uc.default_knowledge_hub && (
              <div className="mt-2 text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                {t('scriptFactory.useCasePicker.hub')}: {uc.default_knowledge_hub}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
