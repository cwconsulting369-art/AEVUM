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
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles, Loader2, AlertCircle, Mail, Package as PackageIcon, Repeat } from 'lucide-react';
import { createCreditPurchaseSession, createSubscriptionSession, fetchSubscriptionPlans, googleOAuthUrl, PaymentsPausedError, type SubscriptionPlan } from '@/lib/api';
import { track } from '@/lib/shop-track';
import { CREDIT_PACKAGES, localizeRunsHint, type CreditPackage } from '@/data/saas-tools';

type BillingMode = 'one-time' | 'subscription';
type SubSlug = 'starter' | 'growth' | 'pro';

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
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>('subscription');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage['slug']>(initialPackage ?? 'growth');
  const [selectedPlan, setSelectedPlan] = useState<SubSlug>('growth');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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
      setBillingMode('subscription');
      setSelectedPackage(initialPackage ?? 'growth');
      setSelectedPlan('growth');
      track('saas_signup_open', { tool: toolSlug });
    }
  }, [open, toolSlug, initialPackage]);

  // Lazy-load Subscription-Plans on open
  useEffect(() => {
    if (!open || plans.length > 0) return;
    fetchSubscriptionPlans().then(setPlans).catch(() => { /* keep empty, frontend fallback below */ });
  }, [open, plans.length]);

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
    track('saas_signup_step', {
      tool: toolSlug,
      step: 3,
      billing: billingMode,
      package: billingMode === 'one-time' ? selectedPackage : selectedPlan,
    });
    try {
      const source = `saas-signup:${toolSlug}`;
      let res: { ok: boolean; url?: string; error?: string };
      if (billingMode === 'subscription') {
        const r = await createSubscriptionSession({
          plan_slug: selectedPlan,
          email,
          name: name || undefined,
          source,
        });
        res = r;
      } else {
        const r = await createCreditPurchaseSession({
          email,
          name: name || undefined,
          package_slug: selectedPackage,
          tool_slug: toolSlug,
          source,
          consent: true,
        });
        res = r;
      }
      if (!res.ok || !res.url) {
        setError(res.error || 'checkout_failed');
        setLoading(false);
        return;
      }
      track('saas_signup_checkout_redirect', {
        tool: toolSlug,
        billing: billingMode,
        package: billingMode === 'one-time' ? selectedPackage : selectedPlan,
      });
      window.location.href = res.url;
    } catch (e) {
      if (e instanceof PaymentsPausedError) {
        // Maintenance-Modal opened by gate — close signup-flow + stop spinner
        setLoading(false);
        onClose();
        return;
      }
      const msg = e instanceof Error ? e.message : 'unknown_error';
      setError(msg);
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    track('saas_signup_google', { tool: toolSlug });
    window.location.href = googleOAuthUrl({
      source: `saas-signup:${toolSlug}`,
      next: '/dashboard',
    });
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
          className="relative w-[calc(100%-2rem)] sm:w-full max-w-xl mx-auto bg-bg-primary border border-theme-border-accent rounded-lg shadow-theme-lg my-8 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition p-1.5 rounded hover:bg-bg-elevated"
            aria-label={t('saas.signup.close')}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="px-5 sm:px-7 pt-7 pb-5 border-b border-theme-border">
            <div className="flex items-center gap-2 text-theme-accent mb-2">
              <Sparkles size={14} />
              <span className="font-mono text-[10px] uppercase tracking-widest">{t('saas.signup.eyebrow')}</span>
            </div>
            <h2 className="text-xl text-text-primary font-light">{t('saas.signup.headerTitle', { name: toolName })}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {t('saas.signup.headerSubtitle')}
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 mt-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      step >= (s as Step) ? 'bg-theme-accent' : 'bg-theme-border'
                    }`}
                  />
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-1.5">
                    {s === 1 && t('saas.signup.progressEmail')}
                    {s === 2 && t('saas.signup.progressPackage')}
                    {s === 3 && t('saas.signup.progressPay')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-7 py-6">
            {step === 1 && (
              <Step1
                email={email}
                setEmail={setEmail}
                name={name}
                setName={setName}
                consent={consent}
                setConsent={setConsent}
                emailValid={emailValid}
                onGoogle={handleGoogleSignIn}
              />
            )}

            {step === 2 && (
              <Step2
                billingMode={billingMode}
                setBillingMode={setBillingMode}
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                plans={plans}
                toolName={toolName}
              />
            )}

            {step === 3 && (
              <Step3
                email={email}
                billingMode={billingMode}
                selectedPackage={selectedPackage}
                selectedPlan={selectedPlan}
                plans={plans}
              />
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 text-rose-400 text-sm bg-rose-400/8 border border-rose-400/20 rounded px-3 py-2.5">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{t('saas.signup.checkoutFailed')}</div>
                  <div className="text-xs text-rose-400/80 font-mono mt-0.5 break-words">{error}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-7 py-4 border-t border-theme-border flex items-center justify-between gap-3">
            <button
              onClick={step > 1 ? () => setStep((step - 1) as Step) : onClose}
              className="text-xs text-text-muted hover:text-text-primary transition font-mono uppercase tracking-wider"
              disabled={loading}
            >
              {step > 1 ? t('saas.signup.back') : t('saas.signup.cancel')}
            </button>

            {step === 1 && (
              <button
                onClick={nextFromStep1}
                disabled={!canProceedStep1}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-accent text-text-on-accent text-sm font-medium rounded hover:bg-theme-accent-hover transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t('saas.signup.next')} <ArrowRight size={15} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => {
                  setStep(3);
                  submitCheckout();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-accent text-text-on-accent text-sm font-medium rounded hover:bg-theme-accent-hover transition"
              >
                {t('saas.signup.toPayment')} <ArrowRight size={15} />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={submitCheckout}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-accent text-text-on-accent text-sm font-medium rounded hover:bg-theme-accent-hover transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> {t('saas.signup.stripeOpening')}
                  </>
                ) : (
                  <>
                    {t('saas.signup.retry')} <ArrowRight size={15} />
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
  onGoogle,
}: {
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  emailValid: boolean;
  onGoogle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {/* Google OAuth Button — Default-Pfad (Wave I4) */}
      <button
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition border border-white/20"
        type="button"
      >
        <GoogleLogo />
        {t('saas.signup.google')}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-theme-border" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{t('saas.signup.orEmail')}</span>
        <div className="flex-1 h-px bg-theme-border" />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1.5">
          {t('saas.signup.emailLabel')} <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('saas.signup.emailPlaceholder')}
            className={`input-base pl-9 ${
              email && !emailValid ? 'border-rose-400/40' : ''
            }`}
            autoFocus
          />
        </div>
        {email && !emailValid && (
          <p className="text-xs text-rose-400/80 mt-1">{t('saas.signup.emailInvalid')}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1.5">
          {t('saas.signup.firstNameLabel')} <span className="text-text-muted">{t('saas.signup.optional')}</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('saas.signup.firstNamePlaceholder')}
          maxLength={100}
          className="input-base"
        />
      </div>

      <label className="flex items-start gap-3 pt-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-theme-accent w-4 h-4 cursor-pointer"
        />
        <span className="text-sm text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
          {t('saas.signup.consentPrefix')}{' '}
          <a href="#/agb" target="_blank" className="text-theme-accent hover:underline">
            {t('saas.signup.consentAgb')}
          </a>{' '}
          {t('saas.signup.consentMiddle')}{' '}
          <a href="#/datenschutz" target="_blank" className="text-theme-accent hover:underline">
            {t('saas.signup.consentPrivacy')}
          </a>{' '}
          {t('saas.signup.consentSuffix')}
        </span>
      </label>
    </div>
  );
}

/* ──────────────────── Step 2 ──────────────────── */

// Fallback if API call fails — keeps UI consistent
const FALLBACK_PLANS: SubscriptionPlan[] = [
  { slug: 'starter', name: 'Starter', price_eur: '19.00', credits_per_month: 200, features: ['200 Credits/Mo', 'Pay-per-Run', 'Email-Support'], sort_order: 10 },
  { slug: 'growth',  name: 'Growth',  price_eur: '49.00', credits_per_month: 600, features: ['600 Credits/Mo', 'Pay-per-Run', 'Brand-Profile-Save', 'Priority-Support'], sort_order: 20 },
  { slug: 'pro',     name: 'Pro',     price_eur: '99.00', credits_per_month: 1500, features: ['1500 Credits/Mo', 'Pay-per-Run', 'Multi-Brand-Profiles', 'Slack-Support'], sort_order: 30 },
];

function Step2({
  billingMode,
  setBillingMode,
  selectedPackage,
  setSelectedPackage,
  selectedPlan,
  setSelectedPlan,
  plans,
  toolName,
}: {
  billingMode: BillingMode;
  setBillingMode: (m: BillingMode) => void;
  selectedPackage: CreditPackage['slug'];
  setSelectedPackage: (s: CreditPackage['slug']) => void;
  selectedPlan: SubSlug;
  setSelectedPlan: (s: SubSlug) => void;
  plans: SubscriptionPlan[];
  toolName: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const planList = plans.length > 0 ? plans : FALLBACK_PLANS;
  // Pre-compute savings — Growth saves ~14% vs 3× Starter, Pro saves ~33% vs 5× Starter
  return (
    <div>
      {/* Mode Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-bg-elevated rounded mb-5">
        <button
          onClick={() => setBillingMode('subscription')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-wider rounded transition ${
            billingMode === 'subscription'
              ? 'bg-theme-accent text-text-on-accent'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Repeat size={12} /> {t('saas.signup.tabSub')}
        </button>
        <button
          onClick={() => setBillingMode('one-time')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-wider rounded transition ${
            billingMode === 'one-time'
              ? 'bg-theme-accent text-text-on-accent'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <PackageIcon size={12} /> {t('saas.signup.tabOneTime')}
        </button>
      </div>

      {billingMode === 'subscription' ? (
        <>
          <div className="flex items-center gap-2 text-theme-accent mb-3">
            <Repeat size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {t('saas.signup.subHeader', { name: toolName })}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-5 leading-relaxed">
            {t('saas.signup.subDesc')}
          </p>
          <div className="space-y-2.5">
            {planList.map((plan) => {
              const isSelected = selectedPlan === plan.slug;
              const isPopular = plan.slug === 'growth';
              const savePct =
                plan.slug === 'growth' ? 14 :
                plan.slug === 'pro' ? 33 : 0;
              return (
                <button
                  key={plan.slug}
                  onClick={() => setSelectedPlan(plan.slug as SubSlug)}
                  className={`w-full text-left p-4 rounded border transition-all ${
                    isSelected
                      ? 'border-theme-border-accent bg-theme-accent/[0.08]'
                      : 'border-theme-border bg-bg-elevated hover:border-theme-border-strong'
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-text-primary font-medium">{plan.name}</span>
                        {isPopular && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-theme-accent bg-theme-accent/15 border border-theme-border-accent px-1.5 py-0.5 rounded">
                            {t('saas.signup.popular')}
                          </span>
                        )}
                        {savePct > 0 && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-1.5 py-0.5 rounded">
                            {t('saas.signup.save', { pct: savePct })}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted font-mono">
                        {t('saas.signup.creditsPerMonth', { count: plan.credits_per_month })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg text-text-primary font-light">€{Math.round(Number(plan.price_eur))}</div>
                      <div className="text-[10px] text-text-muted font-mono uppercase">{t('saas.signup.perMonth')}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected ? 'border-theme-accent bg-theme-accent' : 'border-theme-border-strong'
                      }`}
                    >
                      {isSelected && <Check size={13} className="text-text-on-accent" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            {t('saas.signup.subFooter')}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-theme-accent mb-3">
            <PackageIcon size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {t('saas.signup.oneTimeHeader', { name: toolName })}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-5 leading-relaxed">
            {t('saas.signup.oneTimeDesc')}
          </p>

          <div className="space-y-2.5">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.slug;
              return (
                <button
                  key={pkg.slug}
                  onClick={() => setSelectedPackage(pkg.slug)}
                  className={`w-full text-left p-4 rounded border transition-all ${
                    isSelected
                      ? 'border-theme-border-accent bg-theme-accent/[0.08]'
                      : 'border-theme-border bg-bg-elevated hover:border-theme-border-strong'
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-text-primary font-medium">{pkg.name}</span>
                        {pkg.featured && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-theme-accent bg-theme-accent/15 border border-theme-border-accent px-1.5 py-0.5 rounded">
                            {t('saas.signup.popular')}
                          </span>
                        )}
                        {pkg.bonusPct > 0 && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-1.5 py-0.5 rounded">
                            {t('saas.signup.bonus', { pct: pkg.bonusPct })}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted font-mono">
                        {t('saas.signup.creditsAndRuns', { credits: pkg.credits, runs: localizeRunsHint(pkg, lang) })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg text-text-primary font-light">€{pkg.priceEur}</div>
                      <div className="text-[10px] text-text-muted font-mono uppercase">{t('saas.signup.oneTimeUnit')}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected ? 'border-theme-accent bg-theme-accent' : 'border-theme-border-strong'
                      }`}
                    >
                      {isSelected && <Check size={13} className="text-text-on-accent" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            {t('saas.signup.oneTimeFooter')}
          </p>
        </>
      )}
    </div>
  );
}

/* ──────────────────── Step 3 ──────────────────── */

function Step3({
  email,
  billingMode,
  selectedPackage,
  selectedPlan,
  plans,
}: {
  email: string;
  billingMode: BillingMode;
  selectedPackage: CreditPackage['slug'];
  selectedPlan: SubSlug;
  plans: SubscriptionPlan[];
}) {
  const { t } = useTranslation();
  if (billingMode === 'subscription') {
    const planList = plans.length > 0 ? plans : FALLBACK_PLANS;
    const plan = planList.find((p) => p.slug === selectedPlan)!;
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-theme-accent/10 border border-theme-border-accent mb-4">
          <Loader2 size={20} className="animate-spin text-theme-accent" />
        </div>
        <h3 className="text-base text-text-primary font-medium mb-2">{t('saas.signup.stripeOpeningTitle')}</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          {t('saas.signup.stripeOpeningText1')}
          <br />
          {t('saas.signup.stripeOpeningText2')} <span className="text-text-primary font-mono break-all">{email}</span>.
        </p>
        <div className="inline-flex max-w-full flex-wrap items-center gap-2 text-xs font-mono text-text-muted bg-bg-elevated border border-theme-border px-3 py-1.5 rounded">
          <Repeat size={12} /> {t('saas.signup.summarySub', { name: plan.name, credits: plan.credits_per_month, price: Math.round(Number(plan.price_eur)) })}
        </div>
      </div>
    );
  }
  const pkg = CREDIT_PACKAGES.find((p) => p.slug === selectedPackage)!;
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-theme-accent/10 border border-theme-border-accent mb-4">
        <Loader2 size={20} className="animate-spin text-theme-accent" />
      </div>
      <h3 className="text-base text-text-primary font-medium mb-2">{t('saas.signup.stripeOpeningTitle')}</h3>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        {t('saas.signup.stripeOpeningText1')}
        <br />
        {t('saas.signup.stripeOpeningText2')} <span className="text-text-primary font-mono break-all">{email}</span>.
      </p>
      <div className="inline-flex max-w-full flex-wrap items-center gap-2 text-xs font-mono text-text-muted bg-bg-elevated border border-theme-border px-3 py-1.5 rounded">
        <PackageIcon size={12} /> {t('saas.signup.summaryOneTime', { name: pkg.name, credits: pkg.credits, price: pkg.priceEur })}
      </div>
    </div>
  );
}

/* ──────────────────── Google Logo ──────────────────── */
function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.48a4.8 4.8 0 0 1 0-3.04V5.37H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.37L4.5 7.44a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}
