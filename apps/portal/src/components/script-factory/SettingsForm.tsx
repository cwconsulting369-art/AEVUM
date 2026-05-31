// SettingsForm — Conditional Fields basierend auf use_case.required_settings.

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface KnowledgeHub {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface ScriptSettings {
  niche?: string;
  icp?: string;
  awareness_stage?: string;
  brand_tone?: string;
  platform?: string;
}

interface Props {
  required: string[];
  settings: ScriptSettings;
  onChange: (s: ScriptSettings) => void;
  knowledgeHubs: KnowledgeHub[];
  selectedHubIds: string[];
  onHubsChange: (ids: string[]) => void;
  useCaseSlug: string;
}

const AWARENESS = [
  { v: 'unaware',         k: 'scriptFactory.awareness.unaware' },
  { v: 'problem_aware',   k: 'scriptFactory.awareness.problemAware' },
  { v: 'solution_aware',  k: 'scriptFactory.awareness.solutionAware' },
  { v: 'product_aware',   k: 'scriptFactory.awareness.productAware' },
  { v: 'most_aware',      k: 'scriptFactory.awareness.mostAware' },
];

export default function SettingsForm({
  required, settings, onChange, knowledgeHubs, selectedHubIds, onHubsChange, useCaseSlug
}: Props) {
  const { t } = useTranslation();
  const show = (k: string) => required.includes(k);
  const isAdCopy = useCaseSlug.startsWith('ad-copy');

  const toggleHub = (id: string) => {
    if (selectedHubIds.includes(id)) {
      onHubsChange(selectedHubIds.filter(x => x !== id));
    } else {
      onHubsChange([...selectedHubIds, id]);
    }
  };

  return (
    <div className="space-y-5">
      {show('niche') && (
        <Field label={t('scriptFactory.settings.niche')}>
          <input
            type="text"
            value={settings.niche || ''}
            onChange={e => onChange({ ...settings, niche: e.target.value })}
            placeholder={t('scriptFactory.settings.nichePlaceholder')}
            className="input-premium"
          />
        </Field>
      )}

      {show('icp') && (
        <Field label={t('scriptFactory.settings.icp')}>
          <textarea
            value={settings.icp || ''}
            onChange={e => onChange({ ...settings, icp: e.target.value })}
            placeholder={t('scriptFactory.settings.icpPlaceholder')}
            rows={3}
            className="input-premium resize-none"
          />
        </Field>
      )}

      {show('awareness_stage') && (
        <Field label={t('scriptFactory.settings.awarenessStage')}>
          <select
            value={settings.awareness_stage || 'problem_aware'}
            onChange={e => onChange({ ...settings, awareness_stage: e.target.value })}
            className="input-premium"
          >
            {AWARENESS.map(a => (
              <option key={a.v} value={a.v}>{t(a.k)}</option>
            ))}
          </select>
        </Field>
      )}

      {show('brand_tone') && (
        <Field label={t('scriptFactory.settings.brandTone')}>
          <input
            type="text"
            value={settings.brand_tone || ''}
            onChange={e => onChange({ ...settings, brand_tone: e.target.value })}
            placeholder={t('scriptFactory.settings.brandTonePlaceholder')}
            className="input-premium"
          />
        </Field>
      )}

      {isAdCopy && (
        <Field label={t('scriptFactory.settings.platform')}>
          <select
            value={settings.platform || 'all'}
            onChange={e => onChange({ ...settings, platform: e.target.value })}
            className="input-premium"
          >
            <option value="meta">{t('scriptFactory.settings.platformMeta')}</option>
            <option value="google">{t('scriptFactory.settings.platformGoogle')}</option>
            <option value="tiktok">{t('scriptFactory.settings.platformTiktok')}</option>
            <option value="all">{t('scriptFactory.settings.platformAll')}</option>
          </select>
        </Field>
      )}

      {knowledgeHubs.length > 0 && (
        <Field label={t('scriptFactory.settings.knowledgeHubs')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {knowledgeHubs.map(h => {
              const active = selectedHubIds.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHub(h.id)}
                  className={[
                    'text-left px-3 py-2.5 rounded-lg border transition-all',
                    active
                      ? 'bg-gold-400/10 border-gold-400/40 text-white'
                      : 'bg-white/3 border-white/8 text-ink-300 hover:border-white/20'
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    {active && <Check size={13} className="text-gold-300 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{h.name}</div>
                      {h.description && (
                        <div className="text-[0.65rem] text-ink-500 truncate">{h.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.7rem] uppercase tracking-wider text-ink-400 font-semibold mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
