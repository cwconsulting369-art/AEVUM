/**
 * WaitlistForm — Block A2 (2026-05-25)
 *
 * Reusable Email-Capture für AEVUM Pre-Launch.
 * Hero, Footer, /waitlist Page nutzen dieselbe Komponente.
 *
 * Props:
 *  - source: tracking-quelle ('hero' | 'footer' | 'page-/waitlist' | …)
 *  - defaultTier?: initial tier-selection
 *  - showTierPicker?: show tier-select-buttons (default true)
 *  - compact?: kompaktere layout (footer/inline)
 *  - onSuccess?: callback nach erfolgreichem submit
 *
 * Pflicht: DSGVO-Consent-Checkbox.
 * POST → /api/waitlist/launch mit consent_version + UTM (aus URL).
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle, ShoppingBag, Zap, Handshake, HelpCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';
const CONSENT_VERSION = '2026-05-25-v1';

type Tier = 'shop' | 'saas' | 'full-audit' | 'unsure';

interface WaitlistFormProps {
  source: string;
  defaultTier?: Tier;
  showTierPicker?: boolean;
  compact?: boolean;
  onSuccess?: () => void;
}

const TIER_OPTIONS: { key: Tier; labelKey: string; icon: typeof ShoppingBag; subKey: string }[] = [
  { key: 'shop', labelKey: 'tierShop', subKey: 'tierShopSub', icon: ShoppingBag },
  { key: 'saas', labelKey: 'tierSaas', subKey: 'tierSaasSub', icon: Zap },
  { key: 'full-audit', labelKey: 'tierFullAudit', subKey: 'tierFullAuditSub', icon: Handshake },
  { key: 'unsure', labelKey: 'tierUnsure', subKey: 'tierUnsureSub', icon: HelpCircle },
];

function readUtm() {
  if (typeof window === 'undefined') return {};
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null,
      referrer: document.referrer || null,
    };
  } catch {
    return {};
  }
}

export default function WaitlistForm({
  source,
  defaultTier,
  showTierPicker = true,
  compact = false,
  onSuccess,
}: WaitlistFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<Tier | null>(defaultTier || null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { duplicate: boolean }>(null);
  const [err, setErr] = useState<string | null>(null);

  const utm = useMemo(readUtm, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr(t('waitlist.form.errEmail'));
      return;
    }
    if (!consent) {
      setErr(t('waitlist.form.errConsent'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/waitlist/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source,
          interest_tier: tier || 'unsure',
          consent_version: CONSENT_VERSION,
          ...utm,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok !== true) {
        setErr(typeof j.message === 'string' ? j.message : t('waitlist.form.errSubmit'));
        setSubmitting(false);
        return;
      }
      setDone({ duplicate: Boolean(j.duplicate) });
      setSubmitting(false);
      onSuccess?.();
    } catch {
      setErr(t('waitlist.form.errNetwork'));
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          compact ? 'p-4' : 'p-6'
        } bg-theme-accent/[0.06] border border-theme-border-accent text-center`}
      >
        <Check size={compact ? 18 : 22} className="text-theme-accent mx-auto mb-2" />
        <p className="text-sm font-medium text-text-primary mb-1">
          {done.duplicate ? t('waitlist.form.doneDuplicateTitle') : t('waitlist.form.doneNewTitle')}
        </p>
        <p className="text-xs text-text-secondary">
          {done.duplicate
            ? t('waitlist.form.doneDuplicateText')
            : t('waitlist.form.doneNewText')}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      {showTierPicker && (
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-2">
            {t('waitlist.form.tierPrompt')}
          </p>
          <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2`}>
            {TIER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = tier === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTier(opt.key)}
                  className={`text-left p-3 border transition-all min-w-0 ${
                    active
                      ? 'border-theme-border-accent bg-theme-accent/[0.08]'
                      : 'border-theme-border hover:border-theme-border-strong'
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? 'text-theme-accent mb-1.5' : 'text-text-secondary mb-1.5'}
                  />
                  <div
                    className={`text-xs font-medium ${
                      active ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {t(`waitlist.form.${opt.labelKey}`)}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono mt-0.5">{t(`waitlist.form.${opt.subKey}`)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={compact ? 'flex flex-col sm:flex-row gap-2' : 'flex flex-col gap-3'}>
        <input
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('waitlist.form.emailPlaceholder')}
          aria-label={t('waitlist.form.emailAria')}
          className="input-base flex-1 min-w-0"
        />
        <button
          type="submit"
          disabled={submitting || !consent}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-theme-accent text-text-on-accent hover:bg-theme-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-md transition-all whitespace-nowrap"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : t('waitlist.form.submit')}
        </button>
      </div>

      <label className="flex items-start gap-2 mt-3 text-[11px] text-text-muted leading-snug cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-theme-accent shrink-0"
        />
        <span>
          {t('waitlist.form.consentText')}{' '}
          <a href="#/datenschutz" className="text-theme-accent hover:underline">
            {t('waitlist.form.consentLink')}
          </a>
          .
        </span>
      </label>

      {err && (
        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-rose-400 font-mono">
          <AlertCircle size={12} /> {err}
        </div>
      )}
    </form>
  );
}
