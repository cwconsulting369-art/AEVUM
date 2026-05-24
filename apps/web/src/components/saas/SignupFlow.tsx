/**
 * SignupFlow — 3-Step Modal für Self-Service-SaaS-Onboarding
 *
 * Step 1: Email + (optional) Name + AGB-Checkbox
 * Step 2: Credit-Paket auswählen (Starter / Growth / Pro)
 * Step 3: Stripe-Checkout-Redirect
 *
 * Nach Stripe-Success: Backend G6 Webhook erzeugt Account, lädt Credits auf,
 * generiert Magic-Link + Mail. User landet auf /checkout/success?type=saas-signup.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles, Loader2, AlertCircle, Mail, Package as PackageIcon } from 'lucide-react';
import { createCreditPurchaseSession } from '@/lib/api';
import { track } from '@/lib/shop-track';
import { CREDIT_PACKAGES, type CreditPackage } from '@/data/saas-tools';

interface SignupFlowProps {
  open: boolean;
  onClose: () => void;
  toolSlug: string;
  toolName: string;
  /** Pre-select package by slug */
  initialPackage?: 'starter' | 'growth' | 'pro';
}

type Step = 1 | 2 | 3;

export default function SignupFlow({ open, onClose, toolSlug, toolName, initialPackage }: SignupFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage['slug']>(initialPackage ?? 'growth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail('');
      setName('');
      setConsent(false);
      setError(null);
      setSelectedPackage(initialPackage ?? 'growth');
      track('saas_signup_open', { tool: toolSlug });
    }
  }, [open, toolSlug, initialPackage]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canProceedStep1 = emailValid && consent;

  function nextFromStep1() {
    if (!canProceedStep1) return;
    setError(null);
    setStep(2);
    track('saas_signup_step', { tool: toolSlug, step: 2 });
  }

  async function submitCheckout() {
    setLoading(true);
    setError(null);
    track('saas_signup_step', { tool: toolSlug, step: 3, package: selectedPackage });
    try {
      const res = await createCreditPurchaseSession({
        email,
        name: name || undefined,
        package_slug: selectedPackage,
        tool_slug: toolSlug,
        source: `saas-signup:${toolSlug}`,
        consent: true,
      });
      if (!res.ok || !res.url) {
        setError(res.error || 'checkout_failed');
        setLoading(false);
        return;
      }
      track('saas_signup_checkout_redirect', { tool: toolSlug, package: selectedPackage });
      window.location.href = res.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown_error';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-xl bg-bg-primary border border-[#e0a458]/25 rounded-lg shadow-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-primary/40 hover:text-text-primary transition p-1.5 rounded hover:bg-white/5"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-white/5">
            <div className="flex items-center gap-2 text-[#e0a458] mb-2">
              <Sparkles size={14} />
              <span className="font-mono text-[10px] uppercase tracking-widest">Account anlegen</span>
            </div>
            <h2 className="text-xl text-text-primary font-light">{toolName} nutzen</h2>
            <p className="text-sm text-text-primary/50 mt-1">
              Email + Credit-Paket. Account wird nach Zahlung automatisch erstellt.
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 mt-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      step >= (s as Step) ? 'bg-[#e0a458]' : 'bg-white/8'
                    }`}
                  />
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-primary/40 mt-1.5">
                    {s === 1 && 'Email'}
                    {s === 2 && 'Paket'}
                    {s === 3 && 'Bezahlen'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            {step === 1 && (
              <Step1
                email={email}
                setEmail={setEmail}
                name={name}
                setName={setName}
                consent={consent}
                setConsent={setConsent}
                emailValid={emailValid}
              />
            )}

            {step === 2 && (
              <Step2 selected={selectedPackage} onSelect={setSelectedPackage} toolName={toolName} />
            )}

            {step === 3 && <Step3 email={email} selectedPackage={selectedPackage} />}

            {error && (
              <div className="mt-4 flex items-start gap-2 text-rose-400 text-sm bg-rose-400/8 border border-rose-400/20 rounded px-3 py-2.5">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Checkout fehlgeschlagen</div>
                  <div className="text-xs text-rose-400/80 font-mono mt-0.5">{error}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-white/5 flex items-center justify-between gap-3">
            <button
              onClick={step > 1 ? () => setStep((step - 1) as Step) : onClose}
              className="text-xs text-text-primary/50 hover:text-text-primary/80 transition font-mono uppercase tracking-wider"
              disabled={loading}
            >
              {step > 1 ? '← Zurück' : 'Abbrechen'}
            </button>

            {step === 1 && (
              <button
                onClick={nextFromStep1}
                disabled={!canProceedStep1}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Weiter <ArrowRight size={15} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => {
                  setStep(3);
                  submitCheckout();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
              >
                Zur Zahlung <ArrowRight size={15} />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={submitCheckout}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Stripe öffnet…
                  </>
                ) : (
                  <>
                    Erneut versuchen <ArrowRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────────── Step 1 ──────────────────── */

function Step1({
  email,
  setEmail,
  name,
  setName,
  consent,
  setConsent,
  emailValid,
}: {
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  emailValid: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-text-primary/60 block mb-1.5">
          Email <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/30" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@firma.de"
            className={`w-full bg-black border rounded px-9 py-2.5 text-sm text-text-primary placeholder-white/30 outline-none transition-colors ${
              email && !emailValid ? 'border-rose-400/40' : 'border-white/10 focus:border-[#e0a458]/40'
            }`}
            autoFocus
          />
        </div>
        {email && !emailValid && (
          <p className="text-xs text-rose-400/80 mt-1">Bitte gültige Email-Adresse</p>
        )}
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-text-primary/60 block mb-1.5">
          Vorname <span className="text-text-primary/30">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Carlos"
          maxLength={100}
          className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-sm text-text-primary placeholder-white/30 outline-none focus:border-[#e0a458]/40 transition-colors"
        />
      </div>

      <label className="flex items-start gap-3 pt-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-[#e0a458] w-4 h-4 cursor-pointer"
        />
        <span className="text-sm text-text-primary/70 leading-relaxed group-hover:text-text-primary/90 transition-colors">
          Ich stimme den{' '}
          <a href="#/agb" target="_blank" className="text-[#e0a458] hover:underline">
            AGB
          </a>{' '}
          und der{' '}
          <a href="#/datenschutz" target="_blank" className="text-[#e0a458] hover:underline">
            Datenschutzerklärung
          </a>{' '}
          zu.
        </span>
      </label>
    </div>
  );
}

/* ──────────────────── Step 2 ──────────────────── */

function Step2({
  selected,
  onSelect,
  toolName,
}: {
  selected: CreditPackage['slug'];
  onSelect: (s: CreditPackage['slug']) => void;
  toolName: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#e0a458] mb-3">
        <PackageIcon size={14} />
        <span className="font-mono text-[10px] uppercase tracking-widest">
          Initial-Credit-Paket für {toolName}
        </span>
      </div>
      <p className="text-sm text-text-primary/55 mb-5 leading-relaxed">
        Kein Abo. Du zahlst einmal, Credits verfallen nicht. Nachladen jederzeit möglich.
      </p>

      <div className="space-y-2.5">
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selected === pkg.slug;
          return (
            <button
              key={pkg.slug}
              onClick={() => onSelect(pkg.slug)}
              className={`w-full text-left p-4 rounded border transition-all ${
                isSelected
                  ? 'border-[#e0a458] bg-[#e0a458]/8'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-text-primary font-medium">{pkg.name}</span>
                    {pkg.featured && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#e0a458] bg-[#e0a458]/15 border border-[#e0a458]/30 px-1.5 py-0.5 rounded">
                        Beliebt
                      </span>
                    )}
                    {pkg.bonusPct > 0 && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-1.5 py-0.5 rounded">
                        +{pkg.bonusPct}% Bonus
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-primary/50 font-mono">
                    {pkg.credits} Credits · {pkg.runsHint}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg text-text-primary font-light">€{pkg.priceEur}</div>
                  <div className="text-[10px] text-text-primary/40 font-mono uppercase">einmalig</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                    isSelected ? 'border-[#e0a458] bg-[#e0a458]' : 'border-white/20'
                  }`}
                >
                  {isSelected && <Check size={13} className="text-black" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-text-primary/40 mt-4 leading-relaxed">
        Nach der Zahlung kriegst du sofort eine Login-Mail mit deinem Magic-Link. Account-Setup
        passiert automatisch.
      </p>
    </div>
  );
}

/* ──────────────────── Step 3 ──────────────────── */

function Step3({ email, selectedPackage }: { email: string; selectedPackage: CreditPackage['slug'] }) {
  const pkg = CREDIT_PACKAGES.find((p) => p.slug === selectedPackage)!;
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e0a458]/10 border border-[#e0a458]/25 mb-4">
        <Loader2 size={20} className="animate-spin text-[#e0a458]" />
      </div>
      <h3 className="text-base text-text-primary font-medium mb-2">Stripe-Checkout wird geöffnet…</h3>
      <p className="text-sm text-text-primary/55 mb-4 leading-relaxed">
        Du wirst weitergeleitet zur sicheren Zahlung über Stripe.
        <br />
        Nach Bezahlung kriegst du eine Login-Mail an <span className="text-text-primary/80 font-mono">{email}</span>.
      </p>
      <div className="inline-flex items-center gap-2 text-xs font-mono text-text-primary/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
        <PackageIcon size={12} /> {pkg.name} · {pkg.credits} Credits · €{pkg.priceEur}
      </div>
    </div>
  );
}
