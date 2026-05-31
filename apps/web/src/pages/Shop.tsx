import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileJson,
  FileText,
  Video,
  ShieldCheck,
  ShieldAlert,
  Shield,
  ArrowRight,
  Download,
  Zap,
  Package,
  Filter,
  Building2,
  User,
  Briefcase,
  ShoppingCart,
  UserPlus,
  CreditCard,
  Star,
  Lock,
  X,
  Sparkles,
  Wrench,
  Bot,
  Database,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { createCheckoutSession, PaymentsPausedError, api } from '@/lib/api';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';
import { useAevumConfig } from '@/hooks/use-config';
import MaintenancePill from '@/components/MaintenancePill';
import { TiltCard } from '@/components/showcase-fx';

/* ──────────────────────── Types ──────────────────────── */

type ShopTab = 'blueprints' | 'dfy' | 'audit';

type BlueprintCategory = 'Alle' | 'Content' | 'Leads' | 'Reporting' | 'Automatisierung';
type ServiceCategory =
  | 'Alle'
  | 'Infrastruktur'
  | 'Leads'
  | 'Content'
  | 'Reporting'
  | 'Analyse'
  | 'E-Commerce';
type SecurityLevel = 'basic' | 'business' | 'dsgvo';
type ICP = 'AG' | 'PB' | 'FI';

interface Blueprint {
  id: number;
  slug: string;
  name: string;
  category: Exclude<BlueprintCategory, 'Alle'>;
  security: SecurityLevel;
  description: string;
  includes: string[];
  price: number;
  stripePriceId: string;
  tag?: string;
  /** true = ehrliche "in Vorbereitung"-Card, NICHT kaufbar (keine Stripe-Price) */
  comingSoon?: boolean;
  /** true = aktiv + coming_soon=false + Stripe-Price real verifiziert */
  sellable?: boolean;
}

interface DFYService {
  id: number;
  slug: string;
  name: string;
  category: string;
  icp: ICP[];
  description: string;
  priceLabel: string;
  tierHint: string;
  tag?: string;
  comingSoon?: boolean;
}

/* ──────────────────────── Data ──────────────────────── */

const blueprints: Blueprint[] = [
  {
    id: 1,
    slug: 'content-factory',
    name: 'Content-Factory',
    category: 'Content',
    security: 'business',
    description:
      'Automatisiert Content-Produktion von Idee bis Publish f&uuml;r Instagram &amp; LinkedIn.',
    includes: [
      'n8n-Workflow JSON',
      'PDF-Setup-Guide (12 Seiten)',
      'Prompt-Library (30+ Prompts)',
    ],
    price: 197,
    stripePriceId: 'price_1TaLJD200IKJdPeh0e0WPc6v',
    tag: 'Beliebt',
  },
  {
    id: 2,
    slug: 'lead-qualifier-pro',
    name: 'Lead-Qualifier Pro',
    category: 'Leads',
    security: 'dsgvo',
    description:
      'Qualifiziert eingehende Leads automatisch, scored nach 7 Kriterien und pusht direkt ins CRM.',
    includes: [
      'n8n-Workflow JSON',
      'DSGVO-Compliance-Checklist',
      'PDF-Guide (18 Seiten)',
    ],
    price: 297,
    stripePriceId: 'price_1TaLJE200IKJdPehRxbH0aVN',
    tag: 'Premium',
  },
  {
    id: 3,
    slug: 'reporting-dashboard-setup',
    name: 'Reporting Dashboard Setup',
    category: 'Reporting',
    security: 'business',
    description:
      'W&ouml;chentlicher KPI-Report, automatisch generiert und per Mail an dein Team verschickt.',
    includes: [
      'Dashboard-Template',
      'API-Konfiguration',
      'PDF-Setup-Guide (8 Seiten)',
    ],
    price: 147,
    stripePriceId: 'price_1TaLJF200IKJdPehGo8zalDs',
  },
  {
    id: 4,
    slug: 'onboarding-autopilot',
    name: 'Onboarding Autopilot',
    category: 'Automatisierung',
    security: 'basic',
    description:
      'Neukunden-Onboarding vollst&auml;ndig automatisiert &mdash; Welcome-Mail, Task-Creation, Slack-Ping.',
    includes: ['n8n-Workflow JSON', 'PDF-Guide (6 Seiten)'],
    price: 97,
    stripePriceId: 'price_1TaLJF200IKJdPehFYkIC1Au',
  },
  {
    id: 5,
    slug: 'newsletter-growth-machine',
    name: 'Newsletter Growth Machine',
    category: 'Content',
    security: 'basic',
    description:
      'Newsletter-Ideen bis Versand-Queue &mdash; 80% automatisiert, Outline bis Draft in Minuten.',
    includes: [
      'n8n-Workflow JSON',
      'Prompt-Templates',
      'PDF-Guide (10 Seiten)',
    ],
    price: 127,
    stripePriceId: 'price_1TaLJG200IKJdPehnXDCVoPS',
  },
  {
    id: 6,
    slug: 'cold-outreach-system',
    name: 'Cold Outreach System',
    category: 'Leads',
    security: 'dsgvo',
    description:
      'Personalisierte Outreach-Sequenzen, via LLM individualisiert, mit automatischem CRM-Sync.',
    includes: [
      'n8n-Workflow JSON',
      'DSGVO-konforme Templates',
      'PDF-Guide (15 Seiten)',
    ],
    price: 247,
    stripePriceId: 'price_1TaLJH200IKJdPehM6Npgour',
    tag: 'Neu',
  },
];

// 12 → 5 konsolidiert + 2 Industry-Specifics (E-Commerce OS, Script Factory).
// Memory: feedback_aevum_5_service_consolidation_2026_05_24 (alt→neu Mapping).
const dfyServices: DFYService[] = [
  // Konsolidierte 5 Kern-Services
  {
    id: 1,
    slug: 'aevum-business-os',
    name: 'AEVUM Business OS',
    category: 'Infrastruktur',
    icp: ['FI', 'AG', 'PB'],
    description:
      'Komplette Unternehmens-Infrastruktur: Datenbank-Backend + Website/CRM + Automation. Tool-Wildwuchs raus, ein verbundenes System rein.',
    priceLabel: 'ab €4.500 Setup + €899/Mo',
    tierHint: 'Growth ab €4.500',
    tag: 'Komplett',
  },
  {
    id: 2,
    slug: 'aevum-command-center',
    name: 'AEVUM Command Center',
    category: 'Reporting',
    icp: ['FI', 'AG', 'PB'],
    description:
      'Live-KPI-Dashboard im Web + Mobile-HUD via Telegram. KI-Insights, Anomalie-Alerts, Section-Drill-Down. Business-Status in 5 Sek.',
    priceLabel: 'ab €1.800 Setup + €279/Mo',
    tierHint: 'Starter ab €1.800',
  },
  {
    id: 3,
    slug: 'aevum-lead-engine',
    name: 'AEVUM Lead-Engine',
    category: 'Leads',
    icp: ['AG', 'FI'],
    description:
      'End-to-end Lead-System: Lead-Gen + 7-Kriterien-Qualifier + CRM-Sync + Follow-up-Automation + Sales-Pipeline. DSGVO-konform.',
    priceLabel: 'ab €2.200 Setup + €459/Mo',
    tierHint: 'Growth ab €2.200',
  },
  {
    id: 4,
    slug: 'aevum-content-engine',
    name: 'AEVUM Content-Engine',
    category: 'Content',
    icp: ['PB', 'AG'],
    description:
      'Content-Produktion full-stack: Blog + Social + Newsletter + Cold-Outreach. KI-Content-Fabrik mit Brand-Voice-Tuning, du gibst frei.',
    priceLabel: 'ab €900 Setup + €459/Mo',
    tierHint: 'Starter ab €900',
  },
  {
    id: 5,
    slug: 'aevum-audit',
    name: 'AEVUM Audit',
    category: 'Analyse',
    icp: ['AG', 'PB', 'FI'],
    description:
      'Strategie-Audit in 48h: Tool-Stack-Analyse + Top-3 Quick-Wins + Pitch-Report + Long-Term-Roadmap. Einmalig, Festpreis.',
    priceLabel: '€1.199 einmalig',
    tierHint: 'Einmaliges Festpreis-Paket',
    tag: 'Einstieg',
  },
  // Industry-Specific (bleiben separat)
  {
    id: 6,
    slug: 'ecommerce-os',
    name: 'E-Commerce OS',
    category: 'E-Commerce',
    icp: ['FI', 'PB'],
    description:
      'Industry-Specific: Shop + Inventory + Payments + Email-Automation. Für DTC-Brands und Shopify-Operations.',
    priceLabel: 'ab €2.800 Setup + €459/Mo',
    tierHint: 'Industry-Specific',
  },
  {
    id: 7,
    slug: 'script-factory-dfy',
    name: 'Script Factory',
    category: 'Content',
    icp: ['AG', 'PB'],
    description:
      'Industry-Specific: Ad-Script-Produktion für Meta/TikTok/YouTube nach bewiesenen Frameworks. Für DTC + Performance-Agenturen.',
    priceLabel: 'ab €800 Setup + €349/Mo',
    tierHint: 'Industry-Specific',
  },
];

const BUNDLE_PRICE = 697;
const BUNDLE_STRIPE_PRICE_ID = 'price_1TaYNT200IKJdPeh6HiWbWg5';
const FULL_PRICE = blueprints.reduce((s, b) => s + b.price, 0);

const blueprintCategories: BlueprintCategory[] = ['Alle', 'Content', 'Leads', 'Reporting', 'Automatisierung'];
const serviceCategories: ServiceCategory[] = [
  'Alle',
  'Infrastruktur',
  'Reporting',
  'Leads',
  'Content',
  'Analyse',
  'E-Commerce',
];

/* ──────────────────────── Helpers ──────────────────────── */

// Kategorie-Werte sind kanonisch deutsch (Filter-Logik) → Display-Label via i18n.
const CATEGORY_KEY: Record<string, string> = {
  'Alle': 'catAll',
  'Content': 'catContent',
  'Leads': 'catLeads',
  'Reporting': 'catReporting',
  'Automatisierung': 'catAutomatisierung',
  'Infrastruktur': 'catInfrastruktur',
  'Analyse': 'catAnalyse',
  'E-Commerce': 'catECommerce',
  'Sales': 'catSales',
  'Premium': 'catPremium',
  'Compliance': 'catCompliance',
  'Bundle': 'catBundle',
};

function catLabel(t: TFunction, cat: string): string {
  const key = CATEGORY_KEY[cat];
  return key ? t(`shop.${key}`) : cat;
}

/* ─── Catalog: dynamisch aus shop_products (SSOT) via /api/shop-items/catalog ───
 * Statische `blueprints`/`dfyServices` oben dienen NUR als Resilienz-Fallback,
 * falls die API nicht lädt — keine zweite Wahrheit. Coming-Soon-Produkte ("in
 * Vorbereitung") kommen ausschließlich aus der DB und erscheinen als gedimmte,
 * NICHT kaufbare Cards. So ist die gerenderte Seite == /catalog == der echte
 * Zustand (vom scheintechnik-guard verifiziert). */
interface CatalogItem {
  slug: string; name: string; type: string; tag?: string;
  priceLabel?: string; price?: number; stripePriceId?: string;
  securityLevel?: SecurityLevel; icp?: ICP[]; category?: string;
  tagline?: string; includes?: string[]; comingSoon?: boolean; sellable?: boolean;
}

function useCatalog() {
  const [data, setData] = useState<{ blueprints: Blueprint[]; dfyServices: DFYService[] } | null>(null);
  useEffect(() => {
    let alive = true;
    api<{ ok: boolean; items: CatalogItem[] }>('/api/shop-items/catalog')
      .then((res) => {
        if (!alive || !res?.ok || !Array.isArray(res.items) || res.items.length === 0) return;
        const bps: Blueprint[] = [];
        const dfy: DFYService[] = [];
        res.items.forEach((it, i) => {
          if (it.type === 'bundle') return; // Bundle hat eigene CTA
          if (it.type === 'blueprint') {
            bps.push({
              id: i + 1,
              slug: it.slug,
              name: it.name,
              category: (it.category as Exclude<BlueprintCategory, 'Alle'>) || 'Automatisierung',
              security: it.securityLevel || 'business',
              description: it.tagline || '',
              includes: it.includes || [],
              price: it.price ?? 0,
              stripePriceId: it.stripePriceId || '',
              tag: it.tag,
              comingSoon: it.comingSoon === true,
              sellable: it.sellable === true,
            });
          } else {
            dfy.push({
              id: i + 1,
              slug: it.slug,
              name: it.name,
              category: it.category || 'Infrastruktur',
              icp: it.icp || [],
              description: it.tagline || '',
              priceLabel: it.priceLabel || (it.comingSoon ? 'In Vorbereitung' : 'Auf Anfrage'),
              tierHint: '',
              tag: it.tag,
              comingSoon: it.comingSoon === true,
            });
          }
        });
        // Live-Produkte zuerst, "in Vorbereitung" ans Ende
        bps.sort((a, b) => Number(a.comingSoon) - Number(b.comingSoon));
        dfy.sort((a, b) => Number(a.comingSoon) - Number(b.comingSoon));
        setData({ blueprints: bps, dfyServices: dfy });
      })
      .catch(() => { /* Fallback auf statische Listen */ });
    return () => { alive = false; };
  }, []);
  return {
    blueprints: data?.blueprints ?? blueprints,
    dfyServices: data?.dfyServices ?? dfyServices,
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  }),
};

function SecurityBadge({ level }: { level: SecurityLevel }) {
  const map = {
    basic: {
      label: 'Basic',
      icon: Shield,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
      dot: 'bg-emerald-400',
    },
    business: {
      label: 'Business',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
      dot: 'bg-amber-400',
    },
    dsgvo: {
      label: 'DSGVO',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10 border-rose-400/20',
      dot: 'bg-rose-400',
    },
  };
  const { label, icon: Icon, color, bg, dot } = map[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${bg} ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <Icon size={11} />
      {label}
    </span>
  );
}

function ICPBadge({ icp }: { icp: ICP }) {
  const { t } = useTranslation();
  const map: Record<ICP, { label: string; icon: typeof Building2; color: string; bg: string }> = {
    AG: {
      label: t('shop.icpAgency'),
      icon: Briefcase,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10 border-violet-400/20',
    },
    PB: {
      label: t('shop.icpPersonalBrand'),
      icon: User,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10 border-sky-400/20',
    },
    FI: {
      label: t('shop.icpCompany'),
      icon: Building2,
      color: 'text-teal-400',
      bg: 'bg-teal-400/10 border-teal-400/20',
    },
  };
  const { label, icon: Icon, color, bg } = map[icp];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${bg} ${color}`}
    >
      <Icon size={9} />
      {label}
    </span>
  );
}

function CategoryChip({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-0.5 rounded">
      {catLabel(t, label)}
    </span>
  );
}

function IncludesIcon({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('json')) return <FileJson size={13} className="text-theme-accent flex-shrink-0 mt-0.5" />;
  if (t.includes('video')) return <Video size={13} className="text-theme-accent flex-shrink-0 mt-0.5" />;
  return <FileText size={13} className="text-theme-accent flex-shrink-0 mt-0.5" />;
}

/* ──────────────────────── Tab-Routing (URL ?tab=X) ──────────────────────── */

function parseTabFromHash(): ShopTab {
  const hash = window.location.hash || '';
  const m = hash.match(/[?&]tab=([a-z]+)/i);
  const v = m?.[1]?.toLowerCase();
  if (v === 'dfy' || v === 'audit' || v === 'blueprints') return v;
  return 'blueprints';
}

function setTabInHash(tab: ShopTab) {
  const baseHash = '#/shop';
  if (tab === 'blueprints') {
    window.history.replaceState(null, '', baseHash);
  } else {
    window.history.replaceState(null, '', `${baseHash}?tab=${tab}`);
  }
}

/* ──────────────────────── Hero ──────────────────────── */

function HeroStrip() {
  const { t } = useTranslation();
  return (
    <section className="pt-28 pb-10 px-4 sm:px-6 text-center">
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block"
      >
        {t('shop.heroEyebrow')}
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="text-[clamp(1.875rem,6vw,3rem)] font-light tracking-tight leading-[1.1] mb-4 text-text-primary"
      >
        {t('shop.heroTitlePre')}{' '}
        <span className="text-gradient font-medium">{t('shop.heroTitleAccent')}</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-base text-text-secondary max-w-2xl mx-auto"
      >
        {t('shop.heroSubtitle')}
      </motion.p>
    </section>
  );
}

/* ──────────────────────── Tab Bar ──────────────────────── */

function TabBar({ active, onChange }: { active: ShopTab; onChange: (t: ShopTab) => void }) {
  const { t } = useTranslation();
  const tabs: { id: ShopTab; label: string; sub: string; icon: typeof Package }[] = [
    { id: 'blueprints', label: t('shop.tabBlueprintsLabel'), sub: t('shop.tabBlueprintsSub'), icon: Download },
    { id: 'dfy', label: t('shop.tabDfyLabel'), sub: t('shop.tabDfySub'), icon: Wrench },
    { id: 'audit', label: t('shop.tabAuditLabel'), sub: t('shop.tabAuditSub'), icon: Star },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-16 sticky top-[68px] z-30 bg-bg-primary/85 backdrop-blur-md border-b border-theme-border">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
          {tabs.map((t) => {
            const isActive = active === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex-1 sm:flex-none sm:min-w-[180px] text-left px-4 sm:px-5 py-3 rounded-lg border transition-all group ${
                  isActive
                    ? 'bg-theme-accent-soft border-theme-border-accent text-text-primary'
                    : 'bg-transparent border-theme-border text-text-secondary hover:border-theme-accent/40 hover:text-text-primary'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-theme-accent text-on-accent'
                        : 'bg-bg-elevated text-text-muted group-hover:text-theme-accent'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">{t.label}</span>
                    <span
                      className={`block text-[11px] font-mono uppercase tracking-wider mt-0.5 ${
                        isActive ? 'text-theme-accent' : 'text-text-muted'
                      }`}
                    >
                      {t.sub}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Credit Incentive Banner ──────────────────────── */

function CreditIncentiveBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="mx-4 sm:mx-6 lg:mx-16 mb-10 max-w-[1440px] xl:mx-auto relative"
    >
      <div className="border border-theme-border-accent bg-theme-accent-soft px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors p-1"
          aria-label={t('shop.bannerDismiss')}
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3 min-w-0 pr-6">
          <Star size={16} className="text-theme-accent flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-accent block mb-1">
              {t('shop.bannerEyebrow')}
            </span>
            <p className="text-sm text-text-secondary">
              {t('shop.bannerText')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <a
            href="/#/register"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-theme-accent text-on-accent px-4 py-2 min-h-[40px] w-full sm:w-auto hover:bg-theme-accent/90 transition-colors whitespace-nowrap"
          >
            <UserPlus size={13} />
            {t('shop.bannerCta')}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Checkout Hook ──────────────────────── */

function useBuyBlueprint() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (blueprint: Blueprint, withAccount = false) => {
    setError(null);
    setLoading(blueprint.id);
    track('checkout_start', {
      package_tier: blueprint.slug,
      value_cents: Math.round(blueprint.price * 100),
      meta: { with_account: withAccount, source: 'shop_blueprint' },
    });
    try {
      // Mit-Account-Flow: Email-Prompt vor Stripe damit User wissen warum (10c/€ + Stempelkarte)
      let buyerEmail = '';
      let buyerName = '';
      if (withAccount) {
        const email = window.prompt(
          `${t('shop.promptAccountIntro')}\n\n` +
          `${t('shop.promptAccountBullet1')}\n` +
          `${t('shop.promptAccountBullet2')}\n` +
          `${t('shop.promptAccountBullet3')}\n` +
          `${t('shop.promptAccountBullet4')}\n\n` +
          `${t('shop.promptEmailLabel')}`
        );
        if (!email || !email.includes('@')) { setLoading(null); return; }
        buyerEmail = email.trim().toLowerCase();
        const name = window.prompt(t('shop.promptNameLabel')) || '';
        buyerName = name.trim();
      }
      const { url } = await createCheckoutSession({
        product_id: blueprint.slug,
        stripe_price_id: blueprint.stripePriceId,
        mode: 'payment',
        metadata: {
          blueprint_slug: blueprint.slug,
          ...(withAccount ? {
            create_account: 'true',
            source: `shop-blueprint:${blueprint.slug}`,
            purchase_type: 'blueprint',
            buyer_name: buyerName,
            buyer_email: buyerEmail,
          } : {}),
        },
        success_url: window.location.origin + '/#/checkout/success' + (withAccount ? '?type=shop-account' : ''),
        cancel_url: window.location.origin + '/#/checkout/cancelled',
      });
      window.location.href = url;
    } catch (err) {
      if (err instanceof PaymentsPausedError) {
        // Modal opened — silent no-op, just stop spinner
        setLoading(null);
        return;
      }
      setError(err instanceof Error ? err.message : t('shop.checkoutError'));
      setLoading(null);
    }
  };

  return { buy, loading, error };
}

/* ──────────────────────── Blueprints Section ──────────────────────── */

function BlueprintFilterBar({
  active,
  onChange,
}: {
  active: BlueprintCategory;
  onChange: (c: BlueprintCategory) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
      <Filter size={14} className="text-text-muted mr-1" aria-label={t('shop.filterIconHint')} />
      {blueprintCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-medium border transition-all ${
            active === cat
              ? 'bg-theme-accent text-on-accent border-theme-accent'
              : 'bg-transparent text-text-secondary border-theme-border hover:border-theme-accent/40 hover:text-text-primary'
          }`}
        >
          {catLabel(t, cat)}
        </button>
      ))}
    </div>
  );
}

function BlueprintCard({
  blueprint,
  index,
  onBuy,
  buyLoading,
}: {
  blueprint: Blueprint;
  index: number;
  onBuy: (bp: Blueprint, withAccount?: boolean) => void;
  buyLoading: number | null;
}) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isLoading = buyLoading === blueprint.id;
  const credits = blueprint.price * 10;
  const config = useAevumConfig();
  const paused = config?.payments_paused === true;
  const tagLabel = blueprint.tag ? t(`shopItems.${blueprint.slug}.tag`, { defaultValue: blueprint.tag }) : null;
  const coming = blueprint.comingSoon === true;

  return (
    <TiltCard intensity={8} className="h-full">
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`relative h-full bg-bg-surface border border-theme-border p-6 sm:p-7 flex flex-col hover:border-theme-accent/40 transition-all group ${paused ? 'opacity-90' : ''} ${coming ? 'opacity-65' : ''}`}
    >
      {coming ? (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-text-muted bg-bg-base border border-theme-border px-2 py-0.5">
          {t('shop.comingSoonBadge', { defaultValue: 'In Vorbereitung' })}
        </span>
      ) : tagLabel ? (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-0.5">
          {tagLabel}
        </span>
      ) : null}
      {!coming && <MaintenancePill variant="absolute" />}

      <a
        href={coming ? undefined : `/#/shop/blueprint/${blueprint.slug}`}
        className={`block mb-5 ${coming ? 'cursor-default' : 'group/title'}`}
        aria-label={coming ? undefined : `${blueprint.name} — ${t('shop.detailsAriaSuffix')}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-medium tracking-tight text-text-primary leading-tight pr-12 break-words group-hover/title:text-theme-accent transition-colors">
            {blueprint.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SecurityBadge level={blueprint.security} />
          <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
            {catLabel(t, blueprint.category)}
          </span>
        </div>
      </a>

      <p
        className="text-sm text-text-secondary leading-relaxed mb-5 flex-1"
        dangerouslySetInnerHTML={{ __html: t(`shopItems.${blueprint.slug}.desc`, { defaultValue: blueprint.description }) }}
      />

      <ul className="space-y-2 mb-6">
        {(t(`shopItems.${blueprint.slug}.includes`, { returnObjects: true, defaultValue: blueprint.includes }) as string[]).map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
            <IncludesIcon text={item} />
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>

      {coming ? (
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-sm text-text-muted border border-theme-border px-5 py-2.5 min-h-[44px] justify-center font-mono">
            <Wrench size={14} />
            {t('shop.comingSoonBuildingNotBuyable', { defaultValue: 'In Vorbereitung — noch nicht kaufbar' })}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light text-text-primary">
                &euro;{blueprint.price}
              </span>
            </div>
            <span className="text-xs text-theme-accent/80 font-mono mt-0.5 block">
              {t('shop.creditsWithAccount', { credits: credits.toLocaleString('de-DE') })}
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <button
              onClick={() => onBuy(blueprint, false)}
              disabled={isLoading}
              className="btn-primary text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-accent/40 border-t-on-accent animate-spin" />
                  {paused ? t('shop.maintenance') : t('shop.starting')}
                </>
              ) : paused ? (
                <>
                  <Sparkles size={14} />
                  {t('shop.comingSoonNotify')}
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  {t('shop.buyNow')}
                </>
              )}
            </button>
            <a
              href={`/#/shop/blueprint/${blueprint.slug}`}
              className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text-secondary border border-theme-border px-5 py-2 min-h-[40px] hover:border-theme-accent/40 hover:text-theme-accent transition-all"
            >
              {t('shop.viewDetails')}
              <ArrowRight size={11} />
            </a>
          </div>
        </>
      )}
    </motion.div>
    </TiltCard>
  );
}

function BlueprintsSection() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<BlueprintCategory>('Alle');
  const { buy, loading: buyLoading, error: buyError } = useBuyBlueprint();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const config = useAevumConfig();
  const paused = config?.payments_paused === true;
  const { blueprints: catalogBlueprints } = useCatalog();

  const filtered =
    activeCategory === 'Alle'
      ? catalogBlueprints
      : catalogBlueprints.filter((b) => b.category === activeCategory);

  return (
    <section className="px-4 sm:px-6 lg:px-16 pb-24 pt-10" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <CreditIncentiveBanner />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
              {t('shop.blueprintsEyebrow')}
            </span>
            <div className="h-px flex-1 bg-theme-border max-w-xs" />
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2 text-text-primary">
            {t('shop.blueprintsTitlePre')}{' '}
            <span className="text-gradient font-medium">{t('shop.blueprintsTitleAccent')}</span>
          </h2>
          <p className="text-sm text-text-muted max-w-lg">
            {t('shop.blueprintsIntro')}
          </p>
        </motion.div>

        <BlueprintFilterBar active={activeCategory} onChange={setActiveCategory} />

        {buyError && (
          <div className="mb-6 border border-rose-400/30 bg-rose-400/5 px-5 py-3 text-sm text-rose-400 font-mono break-words">
            {buyError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bp, i) => (
            <BlueprintCard
              key={bp.id}
              blueprint={bp}
              index={i}
              onBuy={buy}
              buyLoading={buyLoading}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-20">
            {t('shop.blueprintsEmpty')}
          </p>
        )}

        {/* Bundle CTA */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 bg-bg-surface border border-theme-border-accent p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-theme-accent/5 blur-3xl pointer-events-none" />
          <div className="min-w-0 relative">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-2 block">
              {t('shop.bundleEyebrow')}
            </span>
            <h3 className="text-xl md:text-2xl font-light tracking-tight mb-1 text-text-primary">
              {t('shop.bundleTitlePre')}{' '}
              <span className="text-gradient font-medium">{t('shop.bundleTitleAccent')}</span>
            </h3>
            <p className="text-sm text-text-muted">
              {t('shop.bundleSubtitle')}
            </p>
            <span className="text-xs text-theme-accent/80 font-mono mt-1 block">
              {t('shop.creditsWithAccount', { credits: (BUNDLE_PRICE * 10).toLocaleString('de-DE') })}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 relative w-full md:w-auto">
            <div className="text-center">
              <span className="block text-3xl font-light text-text-primary">
                &euro;{BUNDLE_PRICE}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {t('shop.bundleInsteadOf')} &euro;{FULL_PRICE} (
                <span className="text-emerald-400">
                  -{Math.round(100 - (BUNDLE_PRICE / FULL_PRICE) * 100)}%
                </span>
                )
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  buy(
                    {
                      id: 99,
                      slug: 'bundle-all',
                      name: 'Blueprint Bundle',
                      category: 'Content',
                      security: 'business',
                      description: '',
                      includes: [],
                      price: BUNDLE_PRICE,
                      stripePriceId: BUNDLE_STRIPE_PRICE_ID,
                    },
                    false
                  )
                }
                className="btn-primary px-7 py-2.5 min-h-[44px] text-sm inline-flex items-center justify-center gap-2"
              >
                {paused ? (
                  <>
                    <Sparkles size={14} />
                    {t('shop.comingSoonNotify')}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    {t('shop.bundleBuy')}
                  </>
                )}
              </button>
              <a
                href="/#/shop/bundle/bundle-all"
                className="inline-flex items-center justify-center gap-2 text-xs text-text-secondary border border-theme-border px-5 py-2 min-h-[40px] hover:border-theme-accent/40 hover:text-theme-accent transition-all"
              >
                {t('shop.viewDetails')}
                <ArrowRight size={11} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* How-It-Works Mini-Strip */}
        <HowItWorksStrip />
      </div>
    </section>
  );
}

/* ──────────────────────── How It Works (Blueprints) ──────────────────────── */

function HowItWorksStrip() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    {
      icon: Package,
      label: '01',
      title: t('shop.howStep1Title'),
      desc: t('shop.howStep1Desc'),
    },
    {
      icon: Download,
      label: '02',
      title: t('shop.howStep2Title'),
      desc: t('shop.howStep2Desc'),
    },
    {
      icon: Zap,
      label: '03',
      title: t('shop.howStep3Title'),
      desc: t('shop.howStep3Desc'),
    },
  ];

  return (
    <div className="mt-20" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
          {t('shop.howEyebrow')}
        </span>
        <h3 className="text-xl md:text-2xl font-light tracking-tight text-text-primary">
          {t('shop.howTitlePre')}{' '}
          <span className="text-gradient font-medium">{t('shop.howTitleAccent')}</span>
        </h3>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex-1 bg-bg-surface border border-theme-border p-6 sm:p-7 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-theme-accent-soft flex items-center justify-center flex-shrink-0">
                <step.icon size={18} className="text-theme-accent" />
              </div>
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                {step.label}
              </span>
            </div>
            <h4 className="text-base font-medium text-text-primary mb-2">{step.title}</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────── DFY Services Section ──────────────────────── */

function ServiceFilterBar({
  active,
  onChange,
}: {
  active: ServiceCategory;
  onChange: (c: ServiceCategory) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
      <Filter size={14} className="text-text-muted mr-1" aria-label={t('shop.filterIconHint')} />
      {serviceCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-medium border transition-all ${
            active === cat
              ? 'bg-theme-accent text-on-accent border-theme-accent'
              : 'bg-transparent text-text-secondary border-theme-border hover:border-theme-accent/40 hover:text-text-primary'
          }`}
        >
          {catLabel(t, cat)}
        </button>
      ))}
    </div>
  );
}

function ServiceCard({ service, index }: { service: DFYService; index: number }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const tagLabel = service.tag ? t(`shopItems.${service.slug}.tag`, { defaultValue: service.tag }) : null;
  const coming = service.comingSoon === true;

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`relative h-full bg-bg-surface border border-theme-border p-6 sm:p-7 flex flex-col hover:border-theme-accent/40 transition-all group ${coming ? 'opacity-65' : ''}`}
    >
      {coming ? (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-text-muted bg-bg-base border border-theme-border px-2 py-0.5">
          {t('shop.comingSoonBadge', { defaultValue: 'In Vorbereitung' })}
        </span>
      ) : tagLabel ? (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-0.5">
          {tagLabel}
        </span>
      ) : null}

      <a
        href={coming ? undefined : `/#/shop/dfy/${service.slug}`}
        className={`block mb-4 ${coming ? 'cursor-default' : 'group/title'}`}
      >
        <h3 className="text-lg font-medium tracking-tight text-text-primary leading-tight mb-3 pr-16 break-words group-hover/title:text-theme-accent transition-colors">
          {t(`shopItems.${service.slug}.name`, { defaultValue: service.name })}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryChip label={service.category} />
          {service.icp.map((i) => (
            <ICPBadge key={i} icp={i} />
          ))}
        </div>
      </a>

      <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1">
        {t(`shopItems.${service.slug}.desc`, { defaultValue: service.description })}
      </p>

      <div className="mb-5">
        <span className="block text-base font-medium text-text-primary break-words">
          {service.priceLabel}
        </span>
        <span className="text-xs text-text-muted font-mono mt-0.5 block">
          {t(`shopItems.${service.slug}.tierHint`, { defaultValue: service.tierHint })}
        </span>
      </div>

      {coming ? (
        <div className="flex items-center gap-2 text-sm text-text-muted border border-theme-border px-5 py-2.5 min-h-[44px] justify-center font-mono mt-auto">
          <Wrench size={14} />
          {t('shop.comingSoonBuildingNotBuyable', { defaultValue: 'In Vorbereitung — noch nicht buchbar' })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-auto">
          <a
            href={`/#/audit?service=${service.slug}`}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-on-accent bg-theme-accent hover:bg-theme-accent/90 px-5 py-2.5 min-h-[44px] transition-all"
          >
            {t('shop.dfyRequestViaAudit')}
            <ArrowRight size={13} />
          </a>
          <a
            href={`/#/shop/dfy/${service.slug}`}
            className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text-secondary border border-theme-border px-5 py-2 min-h-[40px] hover:border-theme-accent/40 hover:text-theme-accent transition-all"
          >
            {t('shop.viewDetails')}
            <ArrowRight size={11} />
          </a>
        </div>
      )}
    </motion.div>
  );
}

function TierLegend() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const tiers = [
    {
      dot: 'bg-emerald-400',
      label: t('shop.tierStarter'),
      desc: t('shop.tierStarterDesc'),
    },
    {
      dot: 'bg-amber-400',
      label: t('shop.tierGrowth'),
      desc: t('shop.tierGrowthDesc'),
    },
    {
      dot: 'bg-rose-400',
      label: t('shop.tierScale'),
      desc: t('shop.tierScaleDesc'),
    },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mb-10 bg-bg-surface border border-theme-border p-5 flex flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center"
    >
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted flex-shrink-0">
        {t('shop.tierLabel')}
      </span>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
        {tiers.map((t) => (
          <div key={t.label} className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} />
            <span className="text-xs text-text-primary font-medium flex-shrink-0">{t.label}</span>
            <span className="text-xs text-text-muted">— {t.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DFYSection() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('Alle');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { dfyServices: catalogServices } = useCatalog();

  const filtered =
    activeCategory === 'Alle'
      ? catalogServices
      : catalogServices.filter((s) => s.category === activeCategory);

  return (
    <section className="px-4 sm:px-6 lg:px-16 pb-24 pt-10" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
              {t('shop.dfyEyebrow')}
            </span>
            <div className="h-px flex-1 bg-theme-border max-w-xs" />
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2 text-text-primary">
            {t('shop.dfyTitlePre')}{' '}
            <span className="text-gradient font-medium">{t('shop.dfyTitleAccent')}</span>
          </h2>
          <p className="text-sm text-text-muted max-w-lg">
            {t('shop.dfyIntro')}
          </p>
        </motion.div>

        <TierLegend />
        <ServiceFilterBar active={activeCategory} onChange={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((svc, i) => (
            <ServiceCard key={svc.id} service={svc} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-20">
            {t('shop.dfyEmpty')}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 border border-theme-border p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-bg-surface relative overflow-hidden"
        >
          <div className="absolute -bottom-16 right-0 w-64 h-64 rounded-full bg-theme-accent/[0.04] blur-3xl pointer-events-none" />
          <div className="min-w-0 relative">
            <h3 className="text-xl md:text-2xl font-light tracking-tight mb-2 text-text-primary">
              {t('shop.dfyHelpTitle')}
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {t('shop.dfyHelpText')}
            </p>
          </div>
          <a
            href="/#/audit"
            className="btn-primary px-8 py-3 min-h-[44px] text-base inline-flex items-center justify-center whitespace-nowrap flex-shrink-0 relative w-full md:w-auto"
          >
            {t('shop.dfyHelpCta')}
            <ArrowRight size={16} className="ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Audit Featured Section ──────────────────────── */

function AuditFeaturedSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const benefits = [
    {
      icon: Bot,
      title: t('shop.auditBenefit1Title'),
      desc: t('shop.auditBenefit1Desc'),
    },
    {
      icon: Database,
      title: t('shop.auditBenefit2Title'),
      desc: t('shop.auditBenefit2Desc'),
    },
    {
      icon: Sparkles,
      title: t('shop.auditBenefit3Title'),
      desc: t('shop.auditBenefit3Desc'),
    },
    {
      icon: TrendingUp,
      title: t('shop.auditBenefit4Title'),
      desc: t('shop.auditBenefit4Desc'),
    },
    {
      icon: Star,
      title: t('shop.auditBenefit5Title'),
      desc: t('shop.auditBenefit5Desc'),
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-16 pb-24 pt-10" ref={ref}>
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
              {t('shop.auditEyebrow')}
            </span>
            <div className="h-px flex-1 bg-theme-border max-w-xs" />
          </div>
        </motion.div>

        {/* Featured Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-bg-surface border border-theme-border-accent p-6 sm:p-8 md:p-14 overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-theme-accent/8 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-theme-accent/5 blur-[140px] pointer-events-none" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-3 py-1 rounded-full mb-6">
              <Star size={11} />
              {t('shop.auditBadge')}
            </span>

            <h2 className="text-[clamp(1.875rem,6vw,3rem)] font-light tracking-tight leading-[1.1] mb-4 max-w-3xl text-text-primary">
              {t('shop.auditTitlePre')}{' '}
              <span className="text-gradient font-medium">{t('shop.auditTitleAccent')}</span>
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed mb-10">
              {t('shop.auditIntro')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center flex-shrink-0">
                    <b.icon size={18} className="text-theme-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-text-primary mb-1">{b.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <a
                href="/#/audit"
                className="btn-primary px-8 py-3.5 min-h-[44px] text-base inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Star size={15} />
                {t('shop.auditStartCta')}
                <ArrowRight size={15} />
              </a>
              <a
                href="/#/audit#vergleich"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-theme-accent border border-theme-border-accent px-7 py-3.5 min-h-[44px] hover:bg-theme-accent-soft transition-all"
              >
                {t('shop.auditCompareCta')}
              </a>
            </div>

            <p className="text-xs text-text-muted font-mono mt-6">
              {t('shop.auditFinePrint')}
            </p>
          </div>
        </motion.div>

        {/* Vertrauens-Strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: t('shop.auditTrustSetupLabel'), value: t('shop.auditTrustSetupValue') },
            { label: t('shop.auditTrustTermLabel'), value: t('shop.auditTrustTermValue') },
            { label: t('shop.auditTrustDataLabel'), value: t('shop.auditTrustDataValue') },
          ].map((row) => (
            <div key={row.label} className="flex h-full flex-col bg-bg-surface border border-theme-border px-5 py-4">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                {row.label}
              </span>
              <span className="block text-base font-medium text-text-primary">{row.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Ecosystem Section ──────────────────────── */

function EcosystemSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const pillars = [
    {
      icon: CreditCard,
      title: t('shop.ecoPillar1Title'),
      desc: t('shop.ecoPillar1Desc'),
    },
    {
      icon: Zap,
      title: t('shop.ecoPillar2Title'),
      desc: t('shop.ecoPillar2Desc'),
    },
    {
      icon: Lock,
      title: t('shop.ecoPillar3Title'),
      desc: t('shop.ecoPillar3Desc'),
    },
  ];

  return (
    <section id="ecosystem" className="px-4 sm:px-6 lg:px-16 py-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-3 block">
            {t('shop.ecoEyebrow')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3 text-text-primary">
            {t('shop.ecoTitlePre')}{' '}
            <span className="text-gradient font-medium">{t('shop.ecoTitleAccent')}</span>
          </h2>
          <p className="text-sm text-text-muted max-w-xl mx-auto">
            {t('shop.ecoIntro')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-elevated border border-theme-border p-6 sm:p-7 flex h-full flex-col gap-4 hover:border-theme-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-theme-accent-soft flex items-center justify-center flex-shrink-0">
                <p.icon size={20} className="text-theme-accent" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-text-primary mb-1.5">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Shop() {
  const { t } = useTranslation();
  usePageSeo({
    title: t('shop.seoTitle'),
    description: t('shop.seoDescription'),
    path: '/shop',
  });

  const [tab, setTab] = useState<ShopTab>(() => parseTabFromHash());

  // React to URL-changes (deep-links, browser-nav)
  useEffect(() => {
    const handler = () => setTab(parseTabFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const changeTab = (t: ShopTab) => {
    setTab(t);
    setTabInHash(t);
    track('shop_tab_switch', { meta: { tab: t } });
    // Smooth-scroll to content (below sticky tab-bar)
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  return (
    <div className="bg-bg-primary min-h-screen overflow-x-hidden">
      <HeroStrip />
      <TabBar active={tab} onChange={changeTab} />

      {tab === 'blueprints' && (
        <>
          <BlueprintsSection />
          <EcosystemSection />
        </>
      )}
      {tab === 'dfy' && <DFYSection />}
      {tab === 'audit' && <AuditFeaturedSection />}
    </div>
  );
}
