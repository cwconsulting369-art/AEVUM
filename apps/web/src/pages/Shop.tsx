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
} from 'lucide-react';

/* ──────────────────────── Types ──────────────────────── */

type Category = 'Alle' | 'Content' | 'Leads' | 'Reporting' | 'Automatisierung';
type SecurityLevel = 'basic' | 'business' | 'dsgvo';

interface Blueprint {
  id: number;
  name: string;
  category: Exclude<Category, 'Alle'>;
  security: SecurityLevel;
  description: string;
  includes: string[];
  price: number;
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

const BUNDLE_PRICE = 697;
const FULL_PRICE = blueprints.reduce((s, b) => s + b.price, 0);

const categories: Category[] = ['Alle', 'Content', 'Leads', 'Reporting', 'Automatisierung'];

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

function IncludesIcon({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('json')) return <FileJson size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  if (t.includes('video')) return <Video size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  return <FileText size={13} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
}

/* ──────────────────────── Sections ──────────────────────── */

function HeroStrip() {
  return (
    <section className="pt-28 pb-10 px-6 text-center">
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-3 block"
      >
        Blueprint Store
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-4"
      >
        Fertige KI-Systeme.{' '}
        <span className="text-gradient font-medium">Direkt einsetzbar.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-base text-[#a4a4ad] max-w-xl mx-auto"
      >
        Kaufe, lade herunter, lasse es in 30 Minuten laufen. Keine Agentur, kein Retainer &mdash;
        du hast das System.
      </motion.p>
    </section>
  );
}

function FilterBar({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <section className="px-6 pb-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <Filter size={14} className="text-[#7a7a85] mr-1" />
          {categories.map((cat) => (
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
      </div>
    </section>
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
      {/* Tag */}
      {blueprint.tag && (
        <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/20 px-2 py-0.5">
          {blueprint.tag}
        </span>
      )}

      {/* Header */}
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

      {/* Description */}
      <p
        className="text-sm text-[#a4a4ad] leading-relaxed mb-5 flex-1"
        dangerouslySetInnerHTML={{ __html: blueprint.description }}
      />

      {/* Includes */}
      <ul className="space-y-2 mb-7">
        {blueprint.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-[#a4a4ad]">
            <IncludesIcon text={item} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
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

function BlueprintGrid({ active }: { active: Category }) {
  const filtered =
    active === 'Alle' ? blueprints : blueprints.filter((b) => b.category === active);

  return (
    <section className="px-6 lg:px-16 pb-24">
      <div className="max-w-[1440px] mx-auto">
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
      </div>
    </section>
  );
}

function HowItWorksStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    {
      icon: Package,
      label: '01',
      title: 'Kaufen',
      desc: 'Zahle einmalig. Direkt-Download, kein Abo, kein Abo-Lock.',
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
            So funktioniert's
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

function BundleCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center bg-[#111116] border border-[#e0a458]/20 p-10 md:p-16 relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#e0a458]/6 blur-3xl pointer-events-none" />

        <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-4 block">
          Bundle Deal
        </span>
        <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-3">
          Alle 6 Blueprints.{' '}
          <span className="text-gradient font-medium">Ein Preis.</span>
        </h2>
        <p className="text-[#a4a4ad] mb-8 max-w-md mx-auto">
          Das komplette System &mdash; Content, Leads, Reporting und Automatisierung in einem
          Paket.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="text-center">
            <span className="block text-4xl font-light text-[#F9FAFB]">
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
        </div>

        <a href="/#/audit" className="btn-primary px-8 py-3 text-base inline-flex items-center">
          Bundle kaufen
          <ArrowRight size={16} className="ml-2" />
        </a>

        <p className="text-xs text-[#7a7a85] mt-6">
          Stripe-Checkout wird in K&uuml;rze aktiviert. Jetzt Audit-Formular ausf&uuml;llen &rarr;
          wir melden uns.
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<Category>('Alle');

  return (
    <div className="bg-[#08080a] min-h-screen">
      <HeroStrip />
      <FilterBar active={activeCategory} onChange={setActiveCategory} />
      <BlueprintGrid active={activeCategory} />
      <HowItWorksStrip />
      <SecurityLegend />
      <BundleCTA />
    </div>
  );
}
