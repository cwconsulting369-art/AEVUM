import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Upload, FileText,
  Shield, ArrowLeft, Calendar, X, AlertCircle,
  Building2, Users, Star, Briefcase,
  Sparkles, Zap, Clock, Phone, FileCheck, Rocket,
  HeartHandshake, BadgeCheck, MessageSquareWarning,
  ArrowDown, ChevronDown, HelpCircle, ArrowRight,
} from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CONTACT from '@/config/contact';
import { track } from '@/lib/shop-track';
import { usePageSeo } from '@/hooks/use-page-seo';
import TrustpilotWidget from '@/components/TrustpilotWidget';
import { MouseGlow, NumberCounter, GradientBorder, Magnetic } from '@/components/showcase-fx';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type Segment = 'AG' | 'PB' | 'FI' | null;
type Urgency = 'sofort' | '1-4-wochen' | 'nur-infos';
type SetupBudget = '500-2k' | '2-8k' | '8-20k' | '20k+' | '';
type RetainerBudget = '0-500' | '500-2k' | '2-5k' | '5k+' | '';

// Shared contact data
interface ContactData {
  name: string;
  email: string;
  phone: string;
  urgency: Urgency | '';
}

// Budget step (V2-Master §10 — Step 6)
interface BudgetData {
  setup: SetupBudget;
  retainer: RetainerBudget;
}

// AG — Agentur / Freelancer-Team
interface AGData {
  kundenanzahl: string;
  zeitfresser: string;
  monthly_revenue: string;
}

// PB — Personal Brand / Creator / Coach
interface PBData {
  hauptkanal: string;
  skalierung: string;
  monthly_revenue: string;
}

// FI — Mittelstand / Unternehmen
interface FIData {
  branche: string;
  mitarbeiterzahl: string;
  pain: string;
}

interface FormState {
  segment: Segment;
  ag: AGData;
  pb: PBData;
  fi: FIData;
  budget: BudgetData;
  contact: ContactData;
  consent_dsgvo: boolean;
}

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';
const STORAGE_KEY = 'audit-form-v3-draft';
const HELPBOT_PREFILL_KEY = 'aevum_audit_prefill';

// Option label sources live in i18n (audit.options.*). These hooks build the
// localized {value,label[,desc]} arrays used by both the form selects and the
// review-step label lookups, keeping `value` stable for the backend mapping.
type Opt = { value: string; label: string };
type OptDesc = { value: string; label: string; desc: string };

function useAuditOptions() {
  const { t } = useTranslation();
  const arr = (key: string) => t(`audit.options.${key}`, { returnObjects: true }) as Opt[];
  const arrDesc = (key: string) => t(`audit.options.${key}`, { returnObjects: true }) as OptDesc[];
  return {
    MONTHLY_REVENUE_OPTIONS: arr('monthlyRevenue'),
    AG_ZEITFRESSER_OPTIONS: arr('agZeitfresser'),
    PB_KANAL_OPTIONS: arr('pbKanal'),
    PB_SKALIERUNG_OPTIONS: arr('pbSkalierung'),
    FI_BRANCHE_OPTIONS: arr('fiBranche'),
    FI_MITARBEITER_OPTIONS: arr('fiMitarbeiter'),
    FI_PAIN_OPTIONS: arr('fiPain'),
    URGENCY_OPTIONS: arr('urgency'),
    BUDGET_SETUP_OPTIONS: arrDesc('budgetSetup'),
    BUDGET_RETAINER_OPTIONS: arrDesc('budgetRetainer'),
  };
}

// Map UI ranges → numeric min/max for backend (matches mig009)
const SETUP_BUDGET_RANGE: Record<SetupBudget, { min: number; max: number }> = {
  '500-2k':  { min: 500,   max: 2000 },
  '2-8k':    { min: 2000,  max: 8000 },
  '8-20k':   { min: 8000,  max: 20000 },
  '20k+':    { min: 20000, max: 75000 },
  '':        { min: 0,     max: 0 },
};
const RETAINER_BUDGET_RANGE: Record<RetainerBudget, { min: number; max: number }> = {
  '0-500':   { min: 0,    max: 500 },
  '500-2k':  { min: 500,  max: 2000 },
  '2-5k':    { min: 2000, max: 5000 },
  '5k+':     { min: 5000, max: 10000 },
  '':        { min: 0,    max: 0 },
};

/* ------------------------------------------------------------------ */
/*  STEPS (segment-aware)                                             */
/* ------------------------------------------------------------------ */
// Step 0: Segment
// Step 1: Segment-Fragen
// Step 2: Budget + Timeline
// Step 3: Kontakt
// Step 4: Review + Submit

const TOTAL_STEPS = 5;

/* ------------------------------------------------------------------ */
/*  HELPBOT                                                           */
/* ------------------------------------------------------------------ */

interface HelpbotPrefill { helpbot_session_id?: string | null; saved_at?: string; }

function loadHelpbotPrefill(): HelpbotPrefill | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HELPBOT_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HelpbotPrefill;
    if (!parsed.helpbot_session_id) return null;
    if (parsed.saved_at) {
      const age = Date.now() - new Date(parsed.saved_at).getTime();
      if (age > 24 * 60 * 60 * 1000) return null;
    }
    return parsed;
  } catch { return null; }
}
function clearHelpbotPrefill() {
  try { localStorage.removeItem(HELPBOT_PREFILL_KEY); } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/*  FILE UPLOAD                                                       */
/* ------------------------------------------------------------------ */

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'image/png',
  'image/jpeg',
];
const ALLOWED_EXT_RE = /\.(pdf|docx?|xlsx?|csv|png|jpe?g)$/i;

interface UploadedFileMeta { filename: string; url: string; type?: string; size_bytes?: number; }

function isAllowedFile(file: File): boolean {
  if (file.size > MAX_FILE_BYTES) return false;
  if (ALLOWED_FILE_TYPES.includes(file.type)) return true;
  return ALLOWED_EXT_RE.test(file.name);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  ANIMATIONS                                                        */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 100 : -100, opacity: 0 }),
};

/* ------------------------------------------------------------------ */
/*  DEFAULT STATE                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_STATE: FormState = {
  segment: null,
  ag: { kundenanzahl: '', zeitfresser: '', monthly_revenue: '' },
  pb: { hauptkanal: '', skalierung: '', monthly_revenue: '' },
  fi: { branche: '', mitarbeiterzahl: '', pain: '' },
  budget: { setup: '', retainer: '' },
  contact: { name: '', email: '', phone: '', urgency: '' },
  consent_dsgvo: false,
};

/* ================================================================== */
/*  TOP-LEVEL PAGE (Marketing + Form)                                 */
/* ================================================================== */

export default function Audit() {
  const { t } = useTranslation();
  usePageSeo({
    title: t('audit.seo.title'),
    description: t('audit.seo.description'),
    path: '/audit',
  });

  // Hash-scroll handling (#form, #vergleich, #timeline, #faq)
  useEffect(() => {
    const scrollToHash = () => {
      const h = window.location.hash;
      const m = h.match(/#\/audit(?:#|%23)(.+)$/) || h.match(/^#(.+)$/);
      const id = m ? m[1] : null;
      if (!id) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="bg-bg-primary">
      <AuditHeroSection />
      <ValueComparisonSection />
      <WhyAuditSection />
      <AuditTimelineSection />
      <div id="form" />
      <AuditForm />
      <FaqSection />
    </div>
  );
}

/* ================================================================== */
/*  MARKETING — HERO                                                  */
/* ================================================================== */

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function AuditHeroSection() {
  const { t } = useTranslation();
  const TRUST_BADGES = [
    { icon: <BadgeCheck className="w-3.5 h-3.5" />, label: t('audit.hero.trustBadges.auditFree') },
    { icon: <Clock className="w-3.5 h-3.5" />, label: t('audit.hero.trustBadges.autoPlan') },
    { icon: <Phone className="w-3.5 h-3.5" />, label: t('audit.hero.trustBadges.call') },
    { icon: <Shield className="w-3.5 h-3.5" />, label: t('audit.hero.trustBadges.gdpr') },
    { icon: <Users className="w-3.5 h-3.5" />, label: t('audit.hero.trustBadges.community') },
  ];

  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
      <MouseGlow />
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.12] blur-[120px]"
          style={{ background: 'radial-gradient(circle, var(--theme-accent) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <Badge variant="outline" className="mb-6 text-xs px-3 py-1 border-theme-border-accent text-theme-accent bg-theme-accent-soft">
            <Sparkles className="w-3 h-3 inline mr-1.5" />{t('audit.hero.badge')}
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-[1.1] text-text-primary"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('audit.hero.title')} <span className="text-theme-accent">{t('audit.hero.titleAccent')}</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-text-secondary"
            style={{ lineHeight: 1.7 }}>
            {t('audit.hero.subtitle')}
          </p>

          {/* Trustpilot Widget */}
          <div className="flex justify-center mb-6">
            <TrustpilotWidget />
          </div>

          {/* Animated stats strip */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold text-theme-accent mb-1">
                <NumberCounter to={48} suffix="h" />
              </div>
              <div className="text-xs text-text-muted uppercase tracking-wider">{t('audit.hero.statAutoPlan')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold text-theme-accent mb-1">
                <NumberCounter to={100} suffix="%" />
              </div>
              <div className="text-xs text-text-muted uppercase tracking-wider">{t('audit.hero.statGdpr')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold text-theme-accent mb-1">
                <NumberCounter to={0} suffix="€" />
              </div>
              <div className="text-xs text-text-muted uppercase tracking-wider">{t('audit.hero.statCost')}</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {TRUST_BADGES.map(b => (
              <div key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-bg-elevated border border-theme-border text-text-secondary">
                <span style={{ color: '#10B981' }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Magnetic strength={0.25}>
            <Button
              onClick={() => scrollToId('form')}
              className="h-13 px-8 text-base font-semibold rounded-lg w-full sm:w-auto bg-theme-accent text-on-accent hover:bg-theme-accent-hover"
              style={{ height: '52px' }}>
              <Sparkles className="w-4 h-4 mr-2" />{t('audit.hero.ctaStart')}
            </Button>
            </Magnetic>
            <Button
              variant="outline"
              onClick={() => scrollToId('vergleich')}
              className="px-8 text-base font-semibold rounded-lg w-full sm:w-auto bg-transparent border border-theme-border-accent text-theme-accent"
              style={{ height: '52px' }}>
              {t('audit.hero.ctaCompare')}<ArrowDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  MARKETING — VALUE COMPARISON                                      */
/* ================================================================== */

interface ComparisonRow {
  feature: string;
  gast: string | boolean;
  shop: string | boolean;
  saas: string | boolean;
  full: string | boolean;
}

const COMPARISON_ROW_META: { key: string; gast: string | boolean; shop: string | boolean; saas: string | boolean; full: string | boolean }[] = [
  { key: 'blueprint', gast: true, shop: true, saas: true, full: true },
  { key: 'credits', gast: false, shop: true, saas: true, full: true },
  { key: 'stamps', gast: false, shop: true, saas: true, full: true },
  { key: 'saasTools', gast: false, shop: false, saas: 'saasCredits', full: 'fullSaas' },
  { key: 'personalAgent', gast: false, shop: false, saas: false, full: true },
  { key: 'dashboard', gast: false, shop: false, saas: false, full: true },
  { key: 'quicklinks', gast: false, shop: false, saas: false, full: true },
  { key: 'apiCoverage', gast: false, shop: false, saas: false, full: true },
  { key: 'aggregator', gast: false, shop: false, saas: false, full: true },
  { key: 'community', gast: false, shop: false, saas: false, full: true },
];

const COMPARISON_FOOTER_META: { col: 'gast' | 'shop' | 'saas' | 'full'; action: () => void }[] = [
  { col: 'gast', action: () => { window.location.hash = '/shop'; } },
  { col: 'shop', action: () => { window.location.hash = '/shop?signup=1'; } },
  { col: 'saas', action: () => { window.location.hash = '/saas'; } },
  { col: 'full', action: () => scrollToId('form') },
];

function CellIcon({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return <Check className="w-5 h-5 mx-auto" style={{ color: highlight ? 'var(--theme-accent)' : '#10B981' }} />;
  }
  if (value === false) {
    return <X className="w-5 h-5 mx-auto" style={{ color: 'var(--text-muted)' }} />;
  }
  return (
    <span className="text-xs font-medium"
      style={{ color: highlight ? 'var(--theme-accent)' : 'var(--text-secondary)' }}>
      {value}
    </span>
  );
}

function useComparisonData() {
  const { t } = useTranslation();
  const resolveVal = (v: string | boolean): string | boolean =>
    v === 'saasCredits' ? t('audit.comparison.values.saasCredits')
      : v === 'fullSaas' ? t('audit.comparison.values.fullSaas')
        : v;
  const rows: ComparisonRow[] = COMPARISON_ROW_META.map((r) => ({
    feature: t(`audit.comparison.rows.${r.key}`),
    gast: resolveVal(r.gast),
    shop: resolveVal(r.shop),
    saas: resolveVal(r.saas),
    full: resolveVal(r.full),
  }));
  const footer = COMPARISON_FOOTER_META.map((f) => ({
    col: f.col,
    pricing: t(`audit.comparison.footer.${f.col}.pricing`),
    entry: t(`audit.comparison.footer.${f.col}.entry`),
    cta: { label: t(`audit.comparison.footer.${f.col}.cta`), action: f.action },
  }));
  return { rows, footer };
}

type ComparisonFooterItem = ReturnType<typeof useComparisonData>['footer'][number];

function ValueComparisonSection() {
  const { t } = useTranslation();
  const { rows: COMPARISON_ROWS, footer: COMPARISON_FOOTER } = useComparisonData();
  return (
    <section id="vergleich" className="relative py-20 sm:py-28"
      style={{ borderTop: '1px solid var(--theme-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-4 text-xs"
            style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'var(--theme-accent-soft)' }}>
            {t('audit.comparison.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            {t('audit.comparison.heading')}
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('audit.comparison.subtitle')}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="rounded-2xl overflow-hidden bg-bg-surface border border-theme-border">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-elevated border-b border-theme-border">
                  <th className="text-left px-6 py-5 text-xs uppercase tracking-[0.12em] font-semibold text-text-muted"
                    style={{ width: '34%' }}>
                    {t('audit.comparison.featureColumn')}
                  </th>
                  <th className="px-4 py-5 text-center text-xs uppercase tracking-[0.12em] font-semibold text-text-muted">
                    {t('audit.comparison.tiers.gast')}
                  </th>
                  <th className="px-4 py-5 text-center text-xs uppercase tracking-[0.12em] font-semibold text-text-muted">
                    {t('audit.comparison.tiers.shop')}
                  </th>
                  <th className="px-4 py-5 text-center text-xs uppercase tracking-[0.12em] font-semibold text-text-muted">
                    {t('audit.comparison.tiers.saas')}
                  </th>
                  <th className="px-4 py-5 text-center text-xs uppercase tracking-[0.12em] font-semibold text-theme-accent bg-theme-accent-soft"
                    style={{ borderLeft: '1px solid var(--theme-border-accent)', borderRight: '1px solid var(--theme-border-accent)' }}>
                    {t('audit.comparison.tiers.full')} <Star className="w-3 h-3 inline ml-1" style={{ fill: 'currentColor' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature}
                    style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid var(--theme-border)' : 'none' }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {row.feature}
                    </td>
                    <td className="px-4 py-4 text-center"><CellIcon value={row.gast} /></td>
                    <td className="px-4 py-4 text-center"><CellIcon value={row.shop} /></td>
                    <td className="px-4 py-4 text-center"><CellIcon value={row.saas} /></td>
                    <td className="px-4 py-4 text-center"
                      style={{ background: 'var(--theme-accent-soft)', borderLeft: '1px solid var(--theme-border-accent)', borderRight: '1px solid var(--theme-border-accent)' }}>
                      <CellIcon value={row.full} highlight />
                    </td>
                  </tr>
                ))}
                {/* Pricing row */}
                <tr style={{ borderTop: '1px solid var(--theme-border)', background: 'var(--bg-elevated)' }}>
                  <td className="px-6 py-4 text-xs uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {t('audit.comparison.pricingRow')}
                  </td>
                  {COMPARISON_FOOTER.map(f => (
                    <td key={f.col} className="px-4 py-4 text-center text-xs"
                      style={f.col === 'full' ? {
                        background: 'var(--theme-accent-soft)', color: 'var(--theme-accent)',
                        borderLeft: '1px solid var(--theme-border-accent)', borderRight: '1px solid var(--theme-border-accent)', fontWeight: 600,
                      } : { color: 'var(--text-secondary)' }}>
                      {f.pricing}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-xs uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {t('audit.comparison.entryRow')}
                  </td>
                  {COMPARISON_FOOTER.map(f => (
                    <td key={f.col} className="px-4 py-4 text-center text-xs"
                      style={f.col === 'full' ? {
                        background: 'var(--theme-accent-soft)', color: 'var(--theme-accent)',
                        borderLeft: '1px solid var(--theme-border-accent)', borderRight: '1px solid var(--theme-border-accent)', fontWeight: 600,
                      } : { color: 'var(--text-secondary)' }}>
                      {f.entry}
                    </td>
                  ))}
                </tr>
                {/* CTAs */}
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <td className="px-6 py-5"></td>
                  {COMPARISON_FOOTER.map(f => (
                    <td key={f.col} className="px-3 py-5 text-center"
                      style={f.col === 'full' ? {
                        background: 'var(--theme-accent-soft)',
                        borderLeft: '1px solid var(--theme-border-accent)', borderRight: '1px solid var(--theme-border-accent)',
                      } : undefined}>
                      <button
                        onClick={f.cta.action}
                        className="text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                        style={f.col === 'full' ? {
                          background: 'var(--theme-accent)', color: 'var(--text-on-accent)',
                        } : {
                          background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--theme-border-strong)',
                        }}>
                        {f.cta.label}
                        <ArrowRight className="w-3 h-3 inline ml-1" />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {(['gast', 'shop', 'saas', 'full'] as const).map(col => {
            const footer = COMPARISON_FOOTER.find(f => f.col === col)!;
            const titles = {
              gast: t('audit.comparison.tiers.gast'),
              shop: t('audit.comparison.tiers.shop'),
              saas: t('audit.comparison.tiers.saas'),
              full: t('audit.comparison.tiers.full'),
            };
            return <MobileComparisonCard key={col} col={col} title={titles[col]} footer={footer} rows={COMPARISON_ROWS} />;
          })}
        </div>
      </div>
    </section>
  );
}

function MobileComparisonCard({ col, title, footer, rows }: {
  col: 'gast' | 'shop' | 'saas' | 'full';
  title: string;
  footer: ComparisonFooterItem;
  rows: ComparisonRow[];
}) {
  const [open, setOpen] = useState(col === 'full');
  const isFull = col === 'full';
  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: isFull ? 'var(--theme-accent-soft)' : 'var(--bg-surface)',
        border: isFull ? '1.5px solid var(--theme-border-accent)' : '1px solid var(--theme-border)',
      }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center justify-between text-left">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold"
              style={{ color: isFull ? 'var(--theme-accent)' : 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {title}
            </span>
            {isFull && <Star className="w-3.5 h-3.5" style={{ fill: 'var(--theme-accent)', color: 'var(--theme-accent)' }} />}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {footer.pricing} · {footer.entry}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform"
          style={{ color: 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 space-y-2"
          style={{ borderTop: '1px solid var(--theme-border)' }}>
          {rows.map(row => (
            <div key={row.feature} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.feature}</span>
              <span className="flex-shrink-0"><CellIcon value={row[col]} highlight={isFull} /></span>
            </div>
          ))}
          <button
            onClick={footer.cta.action}
            className="mt-4 w-full rounded-lg py-3 text-sm font-semibold transition-all"
            style={isFull ? {
              background: 'var(--theme-accent)', color: 'var(--text-on-accent)',
            } : {
              background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--theme-border-strong)',
            }}>
            {footer.cta.label}
            <ArrowRight className="w-3.5 h-3.5 inline ml-1.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  MARKETING — WHY AUDIT                                             */
/* ================================================================== */

function WhyAuditSection() {
  const { t } = useTranslation();
  const cardIcons = [
    <MessageSquareWarning className="w-6 h-6" />,
    <FileCheck className="w-6 h-6" />,
    <HeartHandshake className="w-6 h-6" />,
  ];
  const cardTexts = t('audit.whyAudit.cards', { returnObjects: true }) as { title: string; desc: string }[];
  const cards = cardTexts.map((c, i) => ({ ...c, icon: cardIcons[i] }));

  return (
    <section className="relative py-20 sm:py-28"
      style={{ borderTop: '1px solid var(--theme-border)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-4 text-xs"
            style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'var(--theme-accent-soft)' }}>
            {t('audit.whyAudit.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            {t('audit.whyAudit.heading')}
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('audit.whyAudit.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col rounded-xl p-6"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--theme-border)',
              }}>
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-4"
                style={{ background: 'var(--theme-accent-soft)', color: 'var(--theme-accent)' }}>
                {c.icon}
              </div>
              <h3 className="text-base font-semibold mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {c.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {c.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  MARKETING — TIMELINE FUNNEL                                       */
/* ================================================================== */

function AuditTimelineSection() {
  const { t } = useTranslation();
  const stepIcons = [
    <FileText className="w-5 h-5" />,
    <Zap className="w-5 h-5" />,
    <FileCheck className="w-5 h-5" />,
    <Phone className="w-5 h-5" />,
    <Rocket className="w-5 h-5" />,
  ];
  const stepTexts = t('audit.timeline.steps', { returnObjects: true }) as { title: string; desc: string; detail: string }[];
  const steps = stepTexts.map((s, i) => ({ ...s, icon: stepIcons[i] }));

  return (
    <section id="timeline" className="relative py-20 sm:py-28"
      style={{ borderTop: '1px solid var(--theme-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-4 text-xs"
            style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'var(--theme-accent-soft)' }}>
            {t('audit.timeline.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            {t('audit.timeline.heading')}
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('audit.timeline.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full flex-col rounded-xl p-5"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--theme-border)',
              }}>
              {/* Step number */}
              <div className="absolute -top-3 left-5 px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.12em] font-bold"
                style={{ background: 'var(--theme-accent)', color: 'var(--text-on-accent)' }}>
                {t('audit.timeline.stepPrefix')} {i + 1}
              </div>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mt-2 mb-3"
                style={{ background: 'var(--theme-accent-soft)', color: 'var(--theme-accent)' }}>
                {s.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                {s.title}
              </h3>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--theme-accent)' }}>
                {s.desc}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {s.detail}
              </p>

              {/* Arrow connector (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--theme-border-accent)' }}>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => scrollToId('form')}
            className="h-13 px-8 text-base font-semibold rounded-lg"
            style={{ background: 'var(--theme-accent)', color: 'var(--text-on-accent)', height: '52px' }}>
            {t('audit.timeline.ctaStart')}<ArrowDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  MARKETING — FAQ                                                   */
/* ================================================================== */

function FaqSection() {
  const { t } = useTranslation();
  const FAQ_ITEMS = t('audit.faq.items', { returnObjects: true }) as { q: string; a: string }[];
  return (
    <section id="faq" className="relative py-20 sm:py-28"
      style={{ borderTop: '1px solid var(--theme-border)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-xs"
            style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'var(--theme-accent-soft)' }}>
            <HelpCircle className="w-3 h-3 inline mr-1" />{t('audit.faq.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            {t('audit.faq.heading')}
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('audit.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${open ? 'var(--theme-border-accent)' : 'var(--theme-border)'}`,
      }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4">
        <span className="text-sm sm:text-base font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {q}
        </span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: open ? 'var(--theme-accent)' : 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="px-5 pb-5 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  AUDIT FORM (existing 5-step wizard)                               */
/* ================================================================== */

function AuditForm() {
  const { t } = useTranslation();
  const STEP_LABELS = t('audit.stepLabels', { returnObjects: true }) as string[];
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>(DEFAULT_STATE);

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [helpbotSessionId, setHelpbotSessionId] = useState<string | null>(null);
  const [showHelpbotBanner, setShowHelpbotBanner] = useState(false);

  /* -- Draft persistence + audit_start funnel event -- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setFormState(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
    const prefill = loadHelpbotPrefill();
    if (prefill?.helpbot_session_id) {
      setHelpbotSessionId(prefill.helpbot_session_id);
      setShowHelpbotBanner(true);
    }
    track('audit_start');
  }, []);

  useEffect(() => {
    if (submitted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formState)); } catch { /* ignore */ }
  }, [formState, submitted]);

  /* -- Helpers -- */
  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSub = useCallback(<K extends 'ag' | 'pb' | 'fi' | 'contact' | 'budget'>(
    key: K, field: keyof FormState[K], value: string
  ) => {
    setFormState(prev => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, unknown>), [field]: value },
    }));
  }, []);

  /* -- Navigation -- */
  const canAdvance = useCallback((): boolean => {
    const s = formState;
    if (step === 0) return s.segment !== null;
    if (step === 1) {
      if (s.segment === 'AG') return !!(s.ag.kundenanzahl && s.ag.zeitfresser && s.ag.monthly_revenue);
      if (s.segment === 'PB') return !!(s.pb.hauptkanal && s.pb.skalierung && s.pb.monthly_revenue);
      if (s.segment === 'FI') return !!(s.fi.branche && s.fi.mitarbeiterzahl && s.fi.pain);
      return false;
    }
    if (step === 2) return !!(s.budget.setup && s.budget.retainer);
    if (step === 3) return !!(s.contact.name && s.contact.email && s.contact.urgency);
    return true;
  }, [step, formState]);

  // CRITICAL: nach setStep zu Form-Anker scrollen, NICHT zur Seiten-Spitze.
  // Sonst sieht User die Hero-Section + denkt die Form ist weg.
  const scrollToForm = () => {
    requestAnimationFrame(() => {
      const el = document.getElementById('form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const goNext = useCallback(() => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    scrollToForm();
  }, [canAdvance]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
    scrollToForm();
  }, []);

  /* -- File helpers -- */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const list = Array.from(incoming);
    setFiles(prev => {
      const next = [...prev];
      for (const f of list) {
        if (next.length >= MAX_FILES) { setFileError(t('audit.errors.maxFiles', { max: MAX_FILES })); break; }
        if (!isAllowedFile(f)) { setFileError(t('audit.errors.fileRejected', { name: f.name })); continue; }
        if (next.some(x => x.name === f.name && x.size === f.size)) continue;
        next.push(f);
      }
      return next;
    });
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFileError(null);
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const uploadOneFile = async (file: File): Promise<UploadedFileMeta | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch(`${API_BASE}/api/audit/upload-file`, { method: 'POST', body: fd });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.ok || !json.url) return null;
      return { filename: file.name, url: json.url, type: file.type || undefined, size_bytes: json.size_bytes ?? file.size };
    } catch { return null; }
  };

  /* -- Submit -- */
  const onSubmit = async () => {
    if (!formState.consent_dsgvo) return;
    setSubmitError(null);
    setIsSubmitting(true);
    track('audit_submit', { meta: { segment: formState.segment, urgency: formState.contact.urgency } });
    try {
      let uploadedFiles: UploadedFileMeta[] = [];
      if (files.length > 0) {
        const results = await Promise.all(files.map(f => uploadOneFile(f)));
        uploadedFiles = results.filter((r): r is UploadedFileMeta => r !== null);
      }

      const segmentAnswers =
        formState.segment === 'AG' ? formState.ag :
        formState.segment === 'PB' ? formState.pb :
        formState.segment === 'FI' ? formState.fi : {};

      const setupRange = SETUP_BUDGET_RANGE[formState.budget.setup];
      const retainerRange = RETAINER_BUDGET_RANGE[formState.budget.retainer];

      const payload: Record<string, unknown> = {
        form_version: 'v3-branching',
        segment: formState.segment,
        email: formState.contact.email,
        name: formState.contact.name,
        phone: formState.contact.phone || '',
        consent: true,
        urgency: formState.contact.urgency,
        budget_setup_min: setupRange.min,
        budget_setup_max: setupRange.max,
        budget_retainer_min: retainerRange.min,
        budget_retainer_max: retainerRange.max,
        answers: {
          segment: formState.segment,
          ...segmentAnswers,
          contact: formState.contact,
          urgency: formState.contact.urgency,
          budget: {
            setup_label: formState.budget.setup,
            retainer_label: formState.budget.retainer,
            setup_min: setupRange.min,
            setup_max: setupRange.max,
            retainer_min: retainerRange.min,
            retainer_max: retainerRange.max,
          },
        },
        uploaded_files: uploadedFiles,
        submitted_email: formState.contact.email,
      };
      if (helpbotSessionId) payload.helpbot_session_id = helpbotSessionId;

      const res = await fetch(`${API_BASE}/api/audit/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        clearHelpbotPrefill();
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError((await res.text()) || t('audit.errors.generic'));
      }
    } catch {
      setSubmitError(t('audit.errors.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -- Drag & Drop -- */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;

  /* ================================================================= */
  /*  SUBMITTED                                                        */
  /* ================================================================= */

  if (submitted) {
    const contactLink = formState.contact.urgency === 'sofort' ? CONTACT.calendly : undefined;
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Check className="w-10 h-10" style={{ color: '#10B981' }} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              {t('audit.submitted.title')}
            </h1>
            <p className="text-lg sm:text-xl mb-4 max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {t('audit.submitted.text')}
            </p>
            {formState.contact.urgency === 'sofort' && (
              <p className="text-sm mb-10 max-w-md mx-auto"
                style={{ color: 'var(--theme-accent)' }}>
                {t('audit.submitted.urgentNote')}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { window.location.hash = '/'; }}
                className="h-12 px-8 text-base font-semibold rounded-lg"
                style={{ background: 'var(--theme-accent)', color: 'var(--text-on-accent)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />{t('audit.submitted.backHome')}
              </Button>
              {contactLink && (
                <Button variant="outline"
                  onClick={() => window.open(contactLink, '_blank')}
                  className="h-12 px-8 text-base font-semibold rounded-lg"
                  style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'transparent' }}>
                  <Calendar className="w-4 h-4 mr-2" />{t('audit.submitted.bookSlot')}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================================================================= */
  /*  WIZARD                                                           */
  /* ================================================================= */

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* Progress Header */}
      <div className="sticky top-0 z-30"
        style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {t('audit.wizard.stepOf', { current: step + 1, total: TOTAL_STEPS })}
            </span>
            <span className="text-sm font-semibold text-right" style={{ color: 'var(--theme-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {STEP_LABELS[step]}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5 w-full" />
          <div className="flex items-center justify-between mt-3">
            {STEP_LABELS.map((label, i) => (
              <button key={label} title={label}
                onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
                disabled={i >= step}
                className="cursor-pointer disabled:cursor-default">
                <div className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: i <= step ? 'var(--theme-accent)' : 'var(--text-muted)',
                    transform: i === step ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: i === step ? '0 0 10px var(--theme-border-accent)' : 'none',
                  }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">

        {/* Helpbot banner */}
        {showHelpbotBanner && helpbotSessionId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="mb-6 rounded-xl border p-4 flex items-start justify-between gap-4"
            style={{ background: 'var(--theme-accent-soft)', borderColor: 'var(--theme-border-accent)' }}>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.16em] font-medium mb-1" style={{ color: 'var(--theme-accent)' }}>
                {t('audit.helpbotBanner.label')}
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('audit.helpbotBanner.text')}
              </div>
            </div>
            <button type="button" onClick={() => setShowHelpbotBanner(false)}
              aria-label={t('audit.helpbotBanner.closeAria')}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <Card className="border-0 shadow-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--theme-border)' }}>
              <CardContent className="p-6 sm:p-10">

                {/* Step badge + title */}
                <div className="mb-8">
                  <Badge variant="outline" className="mb-3 text-xs"
                    style={{ borderColor: 'var(--theme-border-accent)', color: 'var(--theme-accent)', background: 'var(--theme-accent-soft)' }}>
                    {t('audit.wizard.stepBadge', { n: step + 1 })}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                    {STEP_LABELS[step]}
                  </h2>
                  {step === 0 && (
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {t('audit.wizard.segmentHint')}
                    </p>
                  )}
                </div>

                <Separator className="mb-8" style={{ background: 'var(--theme-border)' }} aria-hidden />

                {/* ====== STEP 1: SEGMENT ====== */}
                {step === 0 && (
                  <StepSegment
                    value={formState.segment}
                    onChange={seg => update('segment', seg)}
                  />
                )}

                {/* ====== STEP 2: SEGMENT-FRAGEN ====== */}
                {step === 1 && formState.segment === 'AG' && (
                  <StepAG data={formState.ag} onChange={(f, v) => updateSub('ag', f, v)} />
                )}
                {step === 1 && formState.segment === 'PB' && (
                  <StepPB data={formState.pb} onChange={(f, v) => updateSub('pb', f, v)} />
                )}
                {step === 1 && formState.segment === 'FI' && (
                  <StepFI data={formState.fi} onChange={(f, v) => updateSub('fi', f, v)} />
                )}

                {/* ====== STEP 3: BUDGET + TIMELINE ====== */}
                {step === 2 && (
                  <StepBudget
                    data={formState.budget}
                    onChange={(f, v) => updateSub('budget', f, v as string)}
                  />
                )}

                {/* ====== STEP 4: KONTAKT ====== */}
                {step === 3 && (
                  <StepContact
                    data={formState.contact}
                    onChange={(f, v) => updateSub('contact', f, v)}
                    files={files}
                    fileError={fileError}
                    dragOver={dragOver}
                    fileInputRef={fileInputRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileInputChange={handleFileInputChange}
                    onRemoveFile={removeFile}
                    onOpenFilePicker={() => fileInputRef.current?.click()}
                  />
                )}

                {/* ====== STEP 5: REVIEW + SUBMIT ====== */}
                {step === 4 && (
                  <StepReview
                    formState={formState}
                    consent={formState.consent_dsgvo}
                    onConsentChange={v => update('consent_dsgvo', v)}
                    submitError={submitError}
                  />
                )}

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}
            className="h-12 px-6 rounded-lg font-medium disabled:opacity-30"
            style={{ borderColor: 'var(--theme-border-strong)', color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>
            <ChevronLeft className="w-4 h-4 mr-2" />{t('audit.wizard.back')}
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" onClick={goNext} disabled={!canAdvance()}
              className="h-12 px-8 rounded-lg font-semibold disabled:opacity-40"
              style={{ background: 'var(--theme-accent)', color: 'var(--text-on-accent)' }}>
              {t('audit.wizard.next')}<ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={onSubmit}
              disabled={isSubmitting || !formState.consent_dsgvo}
              className="h-12 px-8 rounded-lg font-semibold disabled:opacity-50"
              style={{ background: '#10B981', color: '#FFFFFF' }}>
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{t('audit.wizard.submitting')}</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{t('audit.wizard.submit')}</>
              )}
            </Button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-3 h-3 inline mr-1" />
            {t('audit.wizard.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP COMPONENTS                                                   */
/* ================================================================== */

/* ---- Segment Picker ---- */

const SEGMENT_META = [
  { id: 'AG' as const, icon: <Users className="w-7 h-7" /> },
  { id: 'PB' as const, icon: <Star className="w-7 h-7" /> },
  { id: 'FI' as const, icon: <Building2 className="w-7 h-7" /> },
];

function StepSegment({ value, onChange }: { value: Segment; onChange: (s: Segment) => void }) {
  const { t } = useTranslation();
  const SEGMENT_OPTIONS = SEGMENT_META.map((m) => ({
    id: m.id,
    icon: m.icon,
    title: t(`audit.segments.${m.id}.title`),
    desc: t(`audit.segments.${m.id}.desc`),
  }));
  return (
    <div className="space-y-4">
      {SEGMENT_OPTIONS.map((opt, i) => (
        <motion.div
          key={opt.id}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <button
            type="button"
            onClick={() => onChange(opt.id)}
            className="w-full text-left rounded-xl p-5 transition-all duration-200 focus:outline-none"
            style={{
              background: value === opt.id ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
              border: `1.5px solid ${value === opt.id ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              boxShadow: value === opt.id ? '0 0 18px var(--theme-accent-soft)' : 'none',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5" style={{ color: value === opt.id ? 'var(--theme-accent)' : 'var(--text-muted)' }}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base mb-1"
                  style={{ color: value === opt.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {opt.title}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {opt.desc}
                </div>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center"
                style={{
                  borderColor: value === opt.id ? 'var(--theme-accent)' : 'var(--text-muted)',
                  background: value === opt.id ? 'var(--theme-accent)' : 'transparent',
                }}>
                {value === opt.id && <Check className="w-3 h-3" style={{ color: 'var(--text-on-accent)' }} />}
              </div>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ---- AG Questions ---- */

function StepAG({ data, onChange }: { data: AGData; onChange: (f: keyof AGData, v: string) => void }) {
  const { t } = useTranslation();
  const { AG_ZEITFRESSER_OPTIONS, MONTHLY_REVENUE_OPTIONS } = useAuditOptions();
  const kundenOptions = t('audit.steps.ag.kundenOptions', { returnObjects: true }) as Opt[];
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.ag.kundenanzahl')}</FieldLabel>
        <SelectInput
          value={data.kundenanzahl}
          onChange={v => onChange('kundenanzahl', v)}
          placeholder={t('audit.steps.ag.kundenanzahlPlaceholder')}
          options={kundenOptions}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.ag.zeitfresser')}</FieldLabel>
        <CardOptions
          value={data.zeitfresser}
          onChange={v => onChange('zeitfresser', v)}
          options={AG_ZEITFRESSER_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.ag.umsatz')}</FieldLabel>
        <CardOptions
          value={data.monthly_revenue}
          onChange={v => onChange('monthly_revenue', v)}
          options={MONTHLY_REVENUE_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- PB Questions ---- */

function StepPB({ data, onChange }: { data: PBData; onChange: (f: keyof PBData, v: string) => void }) {
  const { t } = useTranslation();
  const { PB_KANAL_OPTIONS, PB_SKALIERUNG_OPTIONS, MONTHLY_REVENUE_OPTIONS } = useAuditOptions();
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.pb.hauptkanal')}</FieldLabel>
        <CardOptions
          value={data.hauptkanal}
          onChange={v => onChange('hauptkanal', v)}
          options={PB_KANAL_OPTIONS}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.pb.skalierung')}</FieldLabel>
        <CardOptions
          value={data.skalierung}
          onChange={v => onChange('skalierung', v)}
          options={PB_SKALIERUNG_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.pb.umsatz')}</FieldLabel>
        <CardOptions
          value={data.monthly_revenue}
          onChange={v => onChange('monthly_revenue', v)}
          options={MONTHLY_REVENUE_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- FI Questions ---- */

function StepFI({ data, onChange }: { data: FIData; onChange: (f: keyof FIData, v: string) => void }) {
  const { t } = useTranslation();
  const { FI_BRANCHE_OPTIONS, FI_MITARBEITER_OPTIONS, FI_PAIN_OPTIONS } = useAuditOptions();
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.fi.branche')}</FieldLabel>
        <SelectInput
          value={data.branche}
          onChange={v => onChange('branche', v)}
          placeholder={t('audit.steps.fi.branchePlaceholder')}
          options={FI_BRANCHE_OPTIONS}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.fi.mitarbeiter')}</FieldLabel>
        <CardOptions
          value={data.mitarbeiterzahl}
          onChange={v => onChange('mitarbeiterzahl', v)}
          options={FI_MITARBEITER_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.fi.pain')}</FieldLabel>
        <CardOptions
          value={data.pain}
          onChange={v => onChange('pain', v)}
          options={FI_PAIN_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- Budget Step ---- */

function StepBudget({ data, onChange }: { data: BudgetData; onChange: (f: keyof BudgetData, v: string) => void }) {
  const { t } = useTranslation();
  const { BUDGET_SETUP_OPTIONS, BUDGET_RETAINER_OPTIONS } = useAuditOptions();
  return (
    <div className="space-y-8">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.budget.setupLabel')}</FieldLabel>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('audit.steps.budget.setupHint')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {BUDGET_SETUP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('setup', opt.value)}
              className="flex h-full flex-col rounded-lg px-4 py-4 text-sm text-left transition-all duration-150"
              style={{
                background: data.setup === opt.value ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
                border: `1.5px solid ${data.setup === opt.value ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              }}>
              <div className="font-semibold mb-1" style={{ color: data.setup === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {opt.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.budget.retainerLabel')}</FieldLabel>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('audit.steps.budget.retainerHint')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {BUDGET_RETAINER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('retainer', opt.value)}
              className="flex h-full flex-col rounded-lg px-4 py-4 text-sm text-left transition-all duration-150"
              style={{
                background: data.retainer === opt.value ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
                border: `1.5px solid ${data.retainer === opt.value ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              }}>
              <div className="font-semibold mb-1" style={{ color: data.retainer === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {opt.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="rounded-lg p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <Shield className="w-3.5 h-3.5 inline mr-1.5" style={{ color: '#10B981' }} />
            {t('audit.steps.budget.noteText')} <span style={{ color: 'var(--theme-accent)' }}>{t('audit.steps.budget.noteHighlight')}</span>{t('audit.steps.budget.noteSuffix')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---- Contact Step ---- */

interface StepContactProps {
  data: ContactData;
  onChange: (f: keyof ContactData, v: string) => void;
  files: File[];
  fileError: string | null;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  onOpenFilePicker: () => void;
}

function StepContact({ data, onChange, files, fileError, dragOver, fileInputRef, onDragOver, onDragLeave, onDrop, onFileInputChange, onRemoveFile, onOpenFilePicker }: StepContactProps) {
  const { t } = useTranslation();
  const { URGENCY_OPTIONS } = useAuditOptions();
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.contact.name')}</FieldLabel>
        <TextInput
          value={data.name}
          onChange={v => onChange('name', v)}
          placeholder={t('audit.steps.contact.namePlaceholder')}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.contact.email')}</FieldLabel>
        <TextInput
          type="email"
          value={data.email}
          onChange={v => onChange('email', v)}
          placeholder={t('audit.steps.contact.emailPlaceholder')}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel optional>{t('audit.steps.contact.phone')}</FieldLabel>
        <TextInput
          type="tel"
          value={data.phone}
          onChange={v => onChange('phone', v)}
          placeholder={t('audit.steps.contact.phonePlaceholder')}
        />
      </motion.div>

      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>{t('audit.steps.contact.urgency')}</FieldLabel>
        <div className="space-y-3">
          {URGENCY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('urgency', opt.value)}
              className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all duration-150"
              style={{
                background: data.urgency === opt.value ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
                border: `1.5px solid ${data.urgency === opt.value ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                color: data.urgency === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* File upload */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
          <FileText className="w-4 h-4 inline mr-2" style={{ color: 'var(--theme-accent)' }} />
          {t('audit.steps.contact.filesLabel')} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('audit.steps.contact.filesOptional')}</span>
        </Label>
        <div
          role="button" tabIndex={0}
          aria-label={t('audit.steps.contact.filesDropAria')}
          onClick={onOpenFilePicker}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFilePicker(); } }}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          className="rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer focus:outline-none"
          style={{
            background: dragOver ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
            borderColor: dragOver ? 'var(--theme-border-accent)' : 'var(--theme-border-strong)',
          }}>
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: dragOver ? 'var(--theme-accent)' : 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {dragOver ? t('audit.steps.contact.filesDrop') : t('audit.steps.contact.filesClick')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('audit.steps.contact.filesHint')}
          </p>
        </div>

        <input
          ref={fileInputRef} type="file" multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
          onChange={onFileInputChange}
          className="hidden" aria-hidden="true"
        />

        {fileError && (
          <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'var(--theme-accent)' }}>
            <AlertCircle className="w-3.5 h-3.5" />{fileError}
          </p>
        )}

        {files.length > 0 && (
          <ul className="mt-4 space-y-2" aria-label={t('audit.steps.contact.filesUploadedAria')}>
            {files.map((f, idx) => (
              <li key={`${f.name}-${f.size}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-lg p-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--theme-border)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} title={f.name}>{f.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatBytes(f.size)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onRemoveFile(idx)}
                  aria-label={t('audit.steps.contact.removeFileAria', { name: f.name })}
                  className="flex-shrink-0 p-1.5 rounded-md transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

/* ---- Review Step ---- */

function StepReview({ formState, consent, onConsentChange, submitError }: {
  formState: FormState;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  submitError: string | null;
}) {
  const { t } = useTranslation();
  const {
    MONTHLY_REVENUE_OPTIONS, AG_ZEITFRESSER_OPTIONS, PB_KANAL_OPTIONS,
    PB_SKALIERUNG_OPTIONS, FI_BRANCHE_OPTIONS, FI_MITARBEITER_OPTIONS,
    FI_PAIN_OPTIONS, URGENCY_OPTIONS, BUDGET_SETUP_OPTIONS, BUDGET_RETAINER_OPTIONS,
  } = useAuditOptions();

  const segmentLabel =
    formState.segment === 'AG' ? t('audit.segments.AG.title') :
    formState.segment === 'PB' ? t('audit.segments.PB.title') :
    formState.segment === 'FI' ? t('audit.segments.FI.title') : '—';

  const segmentRows: { label: string; value: string }[] =
    formState.segment === 'AG' ? [
      { label: t('audit.steps.review.agKunden'), value: formState.ag.kundenanzahl },
      { label: t('audit.steps.review.agZeitfresser'), value: AG_ZEITFRESSER_OPTIONS.find(o => o.value === formState.ag.zeitfresser)?.label || formState.ag.zeitfresser },
      { label: t('audit.steps.review.umsatz'), value: MONTHLY_REVENUE_OPTIONS.find(o => o.value === formState.ag.monthly_revenue)?.label || formState.ag.monthly_revenue },
    ] :
    formState.segment === 'PB' ? [
      { label: t('audit.steps.review.pbHauptkanal'), value: PB_KANAL_OPTIONS.find(o => o.value === formState.pb.hauptkanal)?.label || formState.pb.hauptkanal },
      { label: t('audit.steps.review.pbSkalierung'), value: PB_SKALIERUNG_OPTIONS.find(o => o.value === formState.pb.skalierung)?.label || formState.pb.skalierung },
      { label: t('audit.steps.review.umsatz'), value: MONTHLY_REVENUE_OPTIONS.find(o => o.value === formState.pb.monthly_revenue)?.label || formState.pb.monthly_revenue },
    ] :
    formState.segment === 'FI' ? [
      { label: t('audit.steps.review.fiBranche'), value: FI_BRANCHE_OPTIONS.find(o => o.value === formState.fi.branche)?.label || formState.fi.branche },
      { label: t('audit.steps.review.fiMitarbeiter'), value: FI_MITARBEITER_OPTIONS.find(o => o.value === formState.fi.mitarbeiterzahl)?.label || formState.fi.mitarbeiterzahl },
      { label: t('audit.steps.review.fiPain'), value: FI_PAIN_OPTIONS.find(o => o.value === formState.fi.pain)?.label || formState.fi.pain },
    ] : [];

  const urgencyLabel = URGENCY_OPTIONS.find(o => o.value === formState.contact.urgency)?.label || formState.contact.urgency;
  const setupBudgetLabel = BUDGET_SETUP_OPTIONS.find(o => o.value === formState.budget.setup)?.label || '—';
  const retainerBudgetLabel = BUDGET_RETAINER_OPTIONS.find(o => o.value === formState.budget.retainer)?.label || '—';

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--theme-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
          <Briefcase className="w-4 h-4" />{t('audit.steps.review.heading')}
        </h3>

        {/* Segment block */}
        <ReviewBlock title={t('audit.steps.review.blockTyp')}>
          <ReviewRow label={t('audit.steps.review.category')} value={segmentLabel} />
          {segmentRows.map(r => (
            <ReviewRow key={r.label} label={r.label} value={r.value} />
          ))}
        </ReviewBlock>

        {/* Budget block */}
        <ReviewBlock title={t('audit.steps.review.blockInvestment')}>
          <ReviewRow label={t('audit.steps.review.setupBudget')} value={setupBudgetLabel} />
          <ReviewRow label={t('audit.steps.review.retainerMo')} value={retainerBudgetLabel} />
        </ReviewBlock>

        {/* Contact block */}
        <ReviewBlock title={t('audit.steps.review.blockKontakt')}>
          <ReviewRow label={t('audit.steps.review.name')} value={formState.contact.name} />
          <ReviewRow label={t('audit.steps.review.email')} value={formState.contact.email} />
          {formState.contact.phone && <ReviewRow label={t('audit.steps.review.phone')} value={formState.contact.phone} />}
          <ReviewRow label={t('audit.steps.review.urgency')} value={urgencyLabel} />
        </ReviewBlock>
      </motion.div>

      <Separator style={{ background: 'var(--theme-border)' }} />

      {/* DSGVO */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-row items-start space-x-3 rounded-lg p-4"
          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Checkbox
            id="consent_dsgvo"
            checked={consent}
            onCheckedChange={v => onConsentChange(v === true)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="consent_dsgvo" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-4 h-4 inline mr-1" style={{ color: '#10B981' }} />
              {t('audit.steps.review.consentLabel')} <span style={{ color: '#EF4444' }}>*</span>
            </Label>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {t('audit.steps.review.consentTextBefore')}{' '}
              <a href="#/datenschutz" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--theme-accent)', textDecoration: 'underline' }}>
                {t('audit.steps.review.consentLink')}
              </a>
              {t('audit.steps.review.consentTextAfter')}
            </p>
          </div>
        </div>
      </motion.div>

      {submitError && (
        <Alert variant="destructive" className="rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/* ================================================================== */
/*  SHARED UI PRIMITIVES                                              */
/* ================================================================== */

function FieldLabel({ children, required, optional }: {
  children: React.ReactNode; required?: boolean; optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
      {children}
      {required && <span className="ml-1" style={{ color: '#EF4444' }}>*</span>}
      {optional && <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>(optional)</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-12 rounded-lg w-full px-4 text-sm focus:outline-none transition-colors"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--theme-border-strong)',
        color: 'var(--text-primary)',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--theme-accent)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--theme-border)'; }}
    />
  );
}

function SelectInput({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-12 rounded-lg w-full px-4 text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--theme-border-strong)',
        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
      }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CardOptions({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="rounded-lg px-4 py-3 text-sm text-left transition-all duration-150 font-medium"
          style={{
            background: value === opt.value ? 'var(--theme-accent-soft)' : 'var(--bg-elevated)',
            border: `1.5px solid ${value === opt.value ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
            color: value === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4 mb-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--theme-border)' }}>
      <h4 className="text-xs uppercase tracking-[0.12em] font-semibold mb-3" style={{ color: 'var(--theme-accent)' }}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-right max-w-[60%]" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
