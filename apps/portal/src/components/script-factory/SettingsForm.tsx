// SettingsForm — Conditional Fields basierend auf use_case.required_settings.

import { Check } from 'lucide-react';

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
  { v: 'unaware',         l: 'Unaware — kennt Problem nicht' },
  { v: 'problem_aware',   l: 'Problem-Aware — kennt Schmerz' },
  { v: 'solution_aware',  l: 'Solution-Aware — kennt Lösungen' },
  { v: 'product_aware',   l: 'Product-Aware — kennt dich' },
  { v: 'most_aware',      l: 'Most-Aware — bereit zu kaufen' },
];

export default function SettingsForm({
  required, settings, onChange, knowledgeHubs, selectedHubIds, onHubsChange, useCaseSlug
}: Props) {
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
        <Field label="Niche">
          <input
            type="text"
            value={settings.niche || ''}
            onChange={e => onChange({ ...settings, niche: e.target.value })}
            placeholder="z.B. Beauty, Coaching, SaaS-B2B, Solar"
            className="input-premium"
          />
        </Field>
      )}

      {show('icp') && (
        <Field label="ICP (Wer ist der Kunde?)">
          <textarea
            value={settings.icp || ''}
            onChange={e => onChange({ ...settings, icp: e.target.value })}
            placeholder="z.B. Frauen 30-45, beauty-affin, mittleres Einkommen, Instagram-aktiv"
            rows={3}
            className="input-premium resize-none"
          />
        </Field>
      )}

      {show('awareness_stage') && (
        <Field label="Awareness-Stage">
          <select
            value={settings.awareness_stage || 'problem_aware'}
            onChange={e => onChange({ ...settings, awareness_stage: e.target.value })}
            className="input-premium"
          >
            {AWARENESS.map(a => (
              <option key={a.v} value={a.v}>{a.l}</option>
            ))}
          </select>
        </Field>
      )}

      {show('brand_tone') && (
        <Field label="Brand-Tone (optional)">
          <input
            type="text"
            value={settings.brand_tone || ''}
            onChange={e => onChange({ ...settings, brand_tone: e.target.value })}
            placeholder="z.B. warm-direkt, premium, edgy, freundschaftlich"
            className="input-premium"
          />
        </Field>
      )}

      {isAdCopy && (
        <Field label="Platform">
          <select
            value={settings.platform || 'all'}
            onChange={e => onChange({ ...settings, platform: e.target.value })}
            className="input-premium"
          >
            <option value="meta">Meta (FB/Instagram)</option>
            <option value="google">Google Ads</option>
            <option value="tiktok">TikTok</option>
            <option value="all">Alle Platforms</option>
          </select>
        </Field>
      )}

      {knowledgeHubs.length > 0 && (
        <Field label="Knowledge-Hubs (Multi-Select)">
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
