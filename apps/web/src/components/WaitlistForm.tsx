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

const TIER_OPTIONS: { key: Tier; label: string; icon: typeof ShoppingBag; sub: string }[] = [
  { key: 'shop', label: 'Shop', sub: 'Blueprints & DFY', icon: ShoppingBag },
  { key: 'saas', label: 'SaaS-Tools', sub: 'Pay-per-Run', icon: Zap },
  { key: 'full-audit', label: 'Full-Partnership', sub: 'Custom-System', icon: Handshake },
  { key: 'unsure', label: 'Noch unsicher', sub: 'Updates okay', icon: HelpCircle },
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
      setErr('E-Mail prüfen.');
      return;
    }
    if (!consent) {
      setErr('Datenschutz bestätigen.');
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
        setErr(typeof j.message === 'string' ? j.message : 'Eintragung fehlgeschlagen.');
        setSubmitting(false);
        return;
      }
      setDone({ duplicate: Boolean(j.duplicate) });
      setSubmitting(false);
      onSuccess?.();
    } catch {
      setErr('Netzwerk-Fehler. Bitte später nochmal versuchen.');
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
        } bg-[#e0a458]/[0.06] border border-[#e0a458]/30 text-center`}
      >
        <Check size={compact ? 18 : 22} className="text-[#e0a458] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#F9FAFB] mb-1">
          {done.duplicate ? 'Bereits eingetragen.' : 'Du bist drauf.'}
        </p>
        <p className="text-xs text-[#a4a4ad]">
          {done.duplicate
            ? 'Wir benachrichtigen dich sobald wir öffnen.'
            : 'Bestätigungs-Mail unterwegs. Wenn nicht da: Spam checken.'}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      {showTierPicker && (
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7a7a85] mb-2">
            Worauf wartest du?
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
                  className={`text-left p-3 border transition-all ${
                    active
                      ? 'border-[#e0a458] bg-[#e0a458]/[0.08]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? 'text-[#e0a458] mb-1.5' : 'text-[#a4a4ad] mb-1.5'}
                  />
                  <div
                    className={`text-xs font-medium ${
                      active ? 'text-[#F9FAFB]' : 'text-[#cfcfd4]'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-[#7a7a85] font-mono mt-0.5">{opt.sub}</div>
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
          placeholder="du@firma.de"
          aria-label="E-Mail für Pre-Launch-Liste"
          className="flex-1 bg-[#04040680] border border-white/12 px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#5a5a65] focus:outline-none focus:border-[#e0a458]/50 focus:ring-1 focus:ring-[#e0a458]/30 transition-all"
        />
        <button
          type="submit"
          disabled={submitting || !consent}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#e0a458] text-[#08080a] hover:bg-[#f0b468] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 transition-all whitespace-nowrap"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Pre-Launch-Liste'}
        </button>
      </div>

      <label className="flex items-start gap-2 mt-3 text-[11px] text-[#9a9aa5] leading-snug cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-[#e0a458] shrink-0"
        />
        <span>
          Ich willige in die Speicherung meiner E-Mail für Pre-Launch-Updates ein. Abmeldung
          jederzeit über Link in jeder Mail.{' '}
          <a href="#/datenschutz" className="text-[#e0a458] hover:underline">
            Datenschutz
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
