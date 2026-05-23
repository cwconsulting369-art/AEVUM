import { useState, useRef } from 'react';
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
} from 'lucide-react';

/* ──────────────────────── Types ──────────────────────── */

type BlueprintCategory = 'Alle' | 'Content' | 'Leads' | 'Reporting' | 'Automatisierung';
type ServiceCategory =
  | 'Alle'
  | 'Infrastruktur'
  | 'Leads'
  | 'Content'
  | 'Reporting'
  | 'Sales'
  | 'Analyse'
  | 'Premium'
  | 'Produktivität'
  | 'E-Commerce';
type SecurityLevel = 'basic' | 'business' | 'dsgvo';
type ICP = 'AG' | 'PB' | 'FI';

interface Blueprint {
  id: number;
  name: string;
  category: Exclude<BlueprintCategory, 'Alle'>;
  security: SecurityLevel;
  description: string;
  includes: string[];
  price: number;
  tag?: string;
}

interface DFYService {
  id: number;
  name: string;
  category: Exclude<ServiceCategory, 'Alle'>;
  icp: ICP[];
  description: string;
  priceLabel: string;
  tierHint: string;
  tag?: string;
}

/* ──────────────────────── Data ──────────────────────── */

const blueprints: Blueprint[] = [
  {
    id: 1,
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
    tag: 'Beliebt',
  },
  {
    id: 2,
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
    tag: 'Premium',
  },
  {
    id: 3,
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
  },
  {
    id: 4,
    name: 'Onboarding Autopilot',
    category: 'Automatisierung',
    security: 'basic',
    description:
      'Neukunden-Onboarding vollst&auml;ndig automatisiert &mdash; Welcome-Mail, Task-Creation, Slack-Ping.',
    includes: ['n8n-Workflow JSON', 'PDF-Guide (6 Seiten)'],
    price: 97,
  },
  {
    id: 5,
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
  },
  {
    id: 6,
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
    tag: 'Neu',
  },
];

const dfyServices: DFYService[] = [
  {
    id: 1,
    name: 'Business OS',
    category: 'Infrastruktur',
    icp: ['FI', 'AG'],
    description:
      'Dein gesamtes Unternehmen in einem KI-System — Automatisierung, Reporting, Kommunikation, alles verbunden.',
    priceLabel: 'ab €4.500 Setup + €899/Mo',
    tierHint: 'Growth ab €4.500',
  },
  {
    id: 2,
    name: 'Command Center Dashboard',
    category: 'Reporting',
    icp: ['FI', 'AG', 'PB'],
    description:
      'Echtzeit-CEO-Dashboard mit KI-Insights. Alle KPIs auf einen Blick, automatische Reports.',
    priceLabel: 'ab €1.800 Setup + €279/Mo',
    tierHint: 'Starter ab €1.800',
  },
  {
    id: 3,
    name: 'AI Lead Engine',
    category: 'Leads',
    icp: ['AG', 'FI'],
    description:
      'Autonome 24/7 Lead-Generierung und -Qualifizierung. Mehr Leads, weniger manuelle Arbeit.',
    priceLabel: 'ab €1.400 Setup + €459/Mo',
    tierHint: 'Growth ab €1.400',
  },
  {
    id: 4,
    name: 'Sales OS',
    category: 'Sales',
    icp: ['AG', 'FI'],
    description:
      'Vollständiges Sales-System — Pipeline, Follow-ups, Angebote, Reporting. Dein Vertrieb auf Autopilot.',
    priceLabel: 'ab €2.200 Setup + €359/Mo',
    tierHint: 'Growth ab €2.200',
  },
  {
    id: 5,
    name: 'E-Commerce OS',
    category: 'E-Commerce',
    icp: ['FI', 'PB'],
    description:
      'Komplettes E-Commerce-System — Shop, Inventory, Payments, Automation. Alles integriert.',
    priceLabel: 'ab €2.800 Setup + €459/Mo',
    tierHint: 'Growth ab €2.800',
  },
  {
    id: 6,
    name: 'AI Personal Agent',
    category: 'Produktivität',
    icp: ['PB', 'AG'],
    description:
      'Dein dedizierter KI-Agent. Research, Content, Code, Design — autonom und auf dich trainiert.',
    priceLabel: '€99/Std oder €1.800/Mo',
    tierHint: 'Scale ab €1.800/Mo',
  },
  {
    id: 7,
    name: 'Automation Audit',
    category: 'Analyse',
    icp: ['AG', 'PB', 'FI'],
    description:
      'Prozessanalyse in 48h. Top-3 Quick-Wins für sofortige Effizienzgewinne — mit Umsetzungsplan.',
    priceLabel: '€1.199 einmalig',
    tierHint: 'Einmaliges Festpreis-Paket',
    tag: 'Einstieg',
  },
  {
    id: 8,
    name: 'Website + CRM',
    category: 'Infrastruktur',
    icp: ['AG', 'PB', 'FI'],
    description:
      'Landing Page + Datenbank + n8n-Automation. Alles verbunden, alles automatisiert.',
    priceLabel: 'ab €1.400 Setup + €179/Mo',
    tierHint: 'Starter ab €1.400',
  },
  {
    id: 9,
    name: 'Database System',
    category: 'Infrastruktur',
    icp: ['FI', 'AG'],
    description:
      'Professionelles Datenbank-Backend mit Workflows. Excel war gestern.',
    priceLabel: 'ab €900 Setup + €129/Mo',
    tierHint: 'Starter ab €900',
  },
  {
    id: 10,
    name: 'Content Engine',
    category: 'Content',
    icp: ['PB', 'AG'],
    description:
      'Autonome KI-Content-Fabrik für Blog, Social, SEO — rund um die Uhr, konsistent, skalierbar.',
    priceLabel: 'ab €450 Setup + €459/Mo',
    tierHint: 'Starter ab €450',
  },
  {
    id: 11,
    name: 'HUD Command Center',
    category: 'Premium',
    icp: ['AG', 'PB', 'FI'],
    description:
      'Dein Business als Live-Dashboard im Telegram. Echtzeit-KPIs, Section-Drill-Down, KI-Agent direkt im Chat.',
    priceLabel: 'ab €1.200 Setup + €199/Mo',
    tierHint: 'Growth ab €1.200',
    tag: '🔥 Neu',
  },
  {
    id: 12,
    name: 'Script Factory',
    category: 'Content',
    icp: ['AG', 'PB'],
    description:
      'Automatisierte Ad-Script-Produktion für Meta, TikTok, YouTube — basierend auf bewiesenen Frameworks.',
    priceLabel: 'ab €800 Setup + €349/Mo',
    tierHint: 'Starter ab €800',
  },
];

const BUNDLE_PRICE = 697;
const FULL_PRICE = blueprints.reduce((s, b) => s + b.price, 0);

const blueprintCategories: BlueprintCategory[] = ['Alle', 'Content', 'Leads', 'Reporting', 'Automatisierung'];
const serviceCategories: ServiceCategory[] = [
  'Alle',
  'Infrastruktur',
  'Leads',
  'Content',
  'Reporting',
  'Sales',
  'Analyse',
  'Premium',
];

/* ──────────────────────── Helpers ──────────────────────── */

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
  const map: Record<ICP, { label: string; icon: typeof Building2; color: string; bg: string }> = {
    AG: {
      label: 'Agentur',
      icon: Briefcase,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10 border-violet-400/20',
    },
    PB: {
      label: 'Personal Brand',
      icon: User,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10 border-sky-400/20',
    },
    FI: {
      label: 'Firma',
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
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-[#e0a458] bg-[#e0a458]/8 border border-[#e0a458]/15 px-2 py-0.5 rounded">
      {label}
    </span>
  );
}

function IncludesIcon({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('json')) return <FileJson size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  if (t.includes('video')) return <Video size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  return <FileText size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
}

/* ──────────────────────── Hero ──────────────────────── */

function HeroStrip() {
  return (
    <section className="pt-28 pb-10 px-6 text-center">
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-3 block"
      >
        AEVUM Shop
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-4"
      >
        KI-Systeme für dein Business.{' '}
        <span className="text-gradient font-medium">Sofort einsetzbar.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-base text-[#a4a4ad] max-w-2xl mx-auto"
      >
        Blueprints zum Selbst-Implementieren oder Done-For-You Services — wir bauen es komplett für dich.
      </motion.p>
    </section>
  );
}

/* ──────────────────────── Blueprints Section ──────────────────────── */

function BlueprintFilterBar({
  active,
  onChange,
}: {
  active: BlueprintCategory;
  onChange: (c: BlueprintCategory) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
      <Filter size={14} className="text-[#7a7a85] mr-1" />
      {blueprintCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            active === cat
              ? 'bg-[#e0a458] text-[#08080a] border-[#e0a458]'
              : 'bg-transparent text-[#a4a4ad] border-white/10 hover:border-[#e0a458]/40 hover:text-[#F9FAFB]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function BlueprintCard({ blueprint, index }: { blueprint: Blueprint; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-[#111116] border border-white/10 p-7 flex flex-col hover:border-[#e0a458]/35 transition-all group"
    >
      {blueprint.tag && (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/20 px-2 py-0.5">
          {blueprint.tag}
        </span>
      )}

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-medium tracking-tight text-[#F9FAFB] leading-tight pr-12">
            {blueprint.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SecurityBadge level={blueprint.security} />
          <span className="font-mono text-xs text-[#7a7a85] uppercase tracking-wider">
            {blueprint.category}
          </span>
        </div>
      </div>

      <p
        className="text-sm text-[#a4a4ad] leading-relaxed mb-5 flex-1"
        dangerouslySetInnerHTML={{ __html: blueprint.description }}
      />

      <ul className="space-y-2 mb-7">
        {blueprint.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-[#a4a4ad]">
            <IncludesIcon text={item} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-4 mt-auto">
        <span className="text-2xl font-light text-[#F9FAFB]">
          &euro;{blueprint.price}
        </span>
        <a
          href="/#/audit"
          className="btn-primary text-sm px-5 py-2 whitespace-nowrap"
        >
          Blueprint kaufen
          <ArrowRight size={13} className="ml-1.5" />
        </a>
      </div>
    </motion.div>
  );
}

function BlueprintsSection() {
  const [activeCategory, setActiveCategory] = useState<BlueprintCategory>('Alle');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filtered =
    activeCategory === 'Alle'
      ? blueprints
      : blueprints.filter((b) => b.category === activeCategory);

  return (
    <section className="px-6 lg:px-16 pb-24" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458]">
              01 — Blueprints
            </span>
            <div className="h-px flex-1 bg-white/8 max-w-xs" />
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
            Digitale Produkte.{' '}
            <span className="text-gradient font-medium">Sofort downloadbar.</span>
          </h2>
          <p className="text-sm text-[#7a7a85] max-w-lg">
            Fertige n8n-Workflows mit Setup-Guide. Kaufen, herunterladen, in 30 Minuten live. Kein Retainer, kein Abo.
          </p>
        </motion.div>

        <BlueprintFilterBar active={activeCategory} onChange={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bp, i) => (
            <BlueprintCard key={bp.id} blueprint={bp} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-[#7a7a85] py-20">
            Keine Blueprints in dieser Kategorie.
          </p>
        )}

        {/* Bundle CTA */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 bg-[#111116] border border-[#e0a458]/20 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#e0a458]/5 blur-3xl pointer-events-none" />
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-2 block">
              Bundle Deal
            </span>
            <h3 className="text-xl md:text-2xl font-light tracking-tight mb-1">
              Alle 6 Blueprints.{' '}
              <span className="text-gradient font-medium">Ein Preis.</span>
            </h3>
            <p className="text-sm text-[#7a7a85]">
              Content, Leads, Reporting + Automatisierung — komplett.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <span className="block text-3xl font-light text-[#F9FAFB]">
                &euro;{BUNDLE_PRICE}
              </span>
              <span className="text-xs text-[#7a7a85] font-mono">
                statt &euro;{FULL_PRICE} (
                <span className="text-emerald-400">
                  -{Math.round(100 - (BUNDLE_PRICE / FULL_PRICE) * 100)}%
                </span>
                )
              </span>
            </div>
            <a href="/#/audit" className="btn-primary px-7 py-2.5 text-sm inline-flex items-center whitespace-nowrap">
              Bundle kaufen
              <ArrowRight size={14} className="ml-2" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
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
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
      <Filter size={14} className="text-[#7a7a85] mr-1" />
      {serviceCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            active === cat
              ? 'bg-[#e0a458] text-[#08080a] border-[#e0a458]'
              : 'bg-transparent text-[#a4a4ad] border-white/10 hover:border-[#e0a458]/40 hover:text-[#F9FAFB]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ServiceCard({ service, index }: { service: DFYService; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-[#111116] border border-white/10 p-7 flex flex-col hover:border-[#e0a458]/35 transition-all group"
    >
      {/* Tag */}
      {service.tag && (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/20 px-2 py-0.5">
          {service.tag}
        </span>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium tracking-tight text-[#F9FAFB] leading-tight mb-3 pr-16">
          {service.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryChip label={service.category} />
          {service.icp.map((i) => (
            <ICPBadge key={i} icp={i} />
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#a4a4ad] leading-relaxed mb-5 flex-1">
        {service.description}
      </p>

      {/* Price */}
      <div className="mb-5">
        <span className="block text-base font-medium text-[#F9FAFB]">
          {service.priceLabel}
        </span>
        <span className="text-xs text-[#7a7a85] font-mono mt-0.5 block">
          {service.tierHint}
        </span>
      </div>

      {/* CTA */}
      <a
        href="/#/audit"
        className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-[#e0a458] border border-[#e0a458]/30 px-5 py-2.5 hover:bg-[#e0a458]/8 transition-all"
      >
        Kostenlosen Audit buchen
        <ArrowRight size={13} />
      </a>
    </motion.div>
  );
}

function TierLegend() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const tiers = [
    {
      dot: 'bg-emerald-400',
      label: 'Starter',
      desc: 'Kern-Feature, selbst verwaltet, günstiger Einstieg',
    },
    {
      dot: 'bg-amber-400',
      label: 'Growth',
      desc: 'Full-Setup, AEVUM Onboarding, monatlicher Check-in',
    },
    {
      dot: 'bg-rose-400',
      label: 'Scale',
      desc: 'White-Glove, dedizierter Agent, wöchentliche Reviews',
    },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mb-10 bg-[#0c0c10] border border-white/8 p-5 flex flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center"
    >
      <span className="font-mono text-xs uppercase tracking-wider text-[#7a7a85] flex-shrink-0">
        Service-Tiers
      </span>
      <div className="flex flex-wrap gap-5">
        {tiers.map((t) => (
          <div key={t.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} />
            <span className="text-xs text-[#F9FAFB] font-medium">{t.label}</span>
            <span className="text-xs text-[#7a7a85]">— {t.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DFYSection() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('Alle');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filtered =
    activeCategory === 'Alle'
      ? dfyServices
      : dfyServices.filter((s) => s.category === activeCategory);

  return (
    <section className="px-6 lg:px-16 pb-24 bg-[#0a0a0e]" ref={ref}>
      <div className="max-w-[1440px] mx-auto pt-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458]">
              02 — Done-For-You Services
            </span>
            <div className="h-px flex-1 bg-white/8 max-w-xs" />
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
            Wir bauen es.{' '}
            <span className="text-gradient font-medium">Du fokussierst dich aufs Business.</span>
          </h2>
          <p className="text-sm text-[#7a7a85] max-w-lg">
            Custom entwickelt, vollständig integriert, übergabebereit. Kein Template — dein System.
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
          <p className="text-center text-[#7a7a85] py-20">
            Keine Services in dieser Kategorie.
          </p>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#111116] relative overflow-hidden"
        >
          <div className="absolute -bottom-16 right-0 w-64 h-64 rounded-full bg-[#e0a458]/4 blur-3xl pointer-events-none" />
          <div>
            <h3 className="text-xl md:text-2xl font-light tracking-tight mb-2">
              Nicht sicher welcher Service passt?
            </h3>
            <p className="text-sm text-[#7a7a85] max-w-md">
              Im Automation Audit analysieren wir dein Business in 48h und zeigen dir die Top-3 Quick-Wins — konkret, priorisiert, umsetzbar.
            </p>
          </div>
          <a
            href="/#/audit"
            className="btn-primary px-8 py-3 text-base inline-flex items-center whitespace-nowrap flex-shrink-0"
          >
            Automation Audit buchen
            <ArrowRight size={16} className="ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── How It Works (Blueprints) ──────────────────────── */

function HowItWorksStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    {
      icon: Package,
      label: '01',
      title: 'Kaufen',
      desc: 'Zahle einmalig. Direkt-Download, kein Abo, kein Lock-in.',
    },
    {
      icon: Download,
      label: '02',
      title: 'Herunterladen',
      desc: 'ZIP mit n8n-JSON, PDF-Guide und allen Assets &mdash; sofort nutzbar.',
    },
    {
      icon: Zap,
      label: '03',
      title: 'In 30 Min live',
      desc: 'Importiere den Workflow, folge dem Setup-Guide, fertig.',
    },
  ];

  return (
    <section className="px-6 lg:px-16 py-20 bg-[#0c0c10]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-3 block">
            So funktioniert's — Blueprints
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Kauf &rarr; Download &rarr;{' '}
            <span className="text-gradient font-medium">Live</span>
          </h2>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex-1 bg-[#111116] border border-white/10 p-8 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-lg bg-[#e0a458]/10 flex items-center justify-center">
                  <step.icon size={20} className="text-[#e0a458]" />
                </div>
                <span className="font-mono text-xs text-[#7a7a85] uppercase tracking-wider">
                  {step.label}
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#F9FAFB] mb-2">{step.title}</h3>
              <p
                className="text-sm text-[#a4a4ad] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: step.desc }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Security Legend ──────────────────────── */

function SecurityLegend() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const levels = [
    {
      level: 'basic' as SecurityLevel,
      title: 'Basic',
      target: 'Solo / Hobby',
      features: ['HTTPS', 'Passwort-Schutz', 'Basis-Setup'],
    },
    {
      level: 'business' as SecurityLevel,
      title: 'Business',
      target: 'KMU',
      features: ['Verschl&uuml;sselung', 'Access Control', 'Backup-Logik'],
    },
    {
      level: 'dsgvo' as SecurityLevel,
      title: 'DSGVO',
      target: 'Unternehmen',
      features: ['EU-Hosting', 'DPA-ready', 'Audit-Log + Erasure-API'],
    },
  ];

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-3 block">
            Security-Stufen
          </span>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-[#F9FAFB]">
            Qualit&auml;t nach Anforderung
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {levels.map((l, i) => (
            <motion.div
              key={l.level}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#111116] border border-white/8 p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <SecurityBadge level={l.level} />
                <span className="text-xs text-[#7a7a85]">{l.target}</span>
              </div>
              <ul className="space-y-1.5 mt-1">
                {l.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-[#a4a4ad]"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#e0a458] flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Shop() {
  return (
    <div className="bg-[#08080a] min-h-screen">
      <HeroStrip />
      <BlueprintsSection />
      <HowItWorksStrip />
      <SecurityLegend />
      <DFYSection />
    </div>
  );
}
