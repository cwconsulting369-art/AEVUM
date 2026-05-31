/**
 * ShopItemDetail — Premium Detail-Page für jeden Shop-Item
 *
 * Erfüllt Quality-Gate-Sektionen (Memory: project_aevum_shop_quality_gate):
 *   1 Hero  · 2 Was-ist-es  · 3 Was-bringt-es  · 4 Wann-Sinn  · 5 Was-bekommst-du
 *   6 Preis · 7 Sicherheits-Stufe  · 8 FAQ  · 9 CTA  · 10 Downloads (wenn gate_passed)
 *
 * Live-Build-Status wird aus /api/shop-items/:slug gemerged.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShoppingCart,
  UserPlus,
  Download,
  FileJson,
  FileText,
  Video,
  ChevronDown,
  Lock,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, createCheckoutSession, PaymentsPausedError } from '@/lib/api';
import { track } from '@/lib/shop-track';
import { getShopItem, localizeShopItem } from '@/data/shop-items';
import type { ShopItemContent, ShopItemType, SecurityLevel } from '@/data/shop-items/types';
import { usePageSeo } from '@/hooks/use-page-seo';
import { TiltCard, Magnetic } from '@/components/showcase-fx';

/* ──────────────────── Backend-Status-Shape ──────────────────── */

interface BuildStatus {
  item_slug: string;
  item_type: string;
  gate_passed: boolean;
  gate_passed_at: string | null;
  n8n_export_url: string | null;
  pdf_url: string | null;
  demo_video_url: string | null;
  last_build_run: string | null;
}

interface ShopItemAPIResponse {
  ok: boolean;
  item: BuildStatus | null;
}

/* ──────────────────── Helpers ──────────────────── */

function parseRoute(): { type: ShopItemType | null; slug: string | null } {
  // Hash-Format: #/shop/<type>/<slug>
  const hash = window.location.hash || '';
  const m = hash.match(/^#\/shop\/(blueprint|dfy|saas|bundle)\/([a-z0-9-]+)/i);
  if (!m) return { type: null, slug: null };
  return { type: m[1] as ShopItemType, slug: m[2] };
}

function SecurityBadge({ level }: { level: SecurityLevel }) {
  const map = {
    basic: { label: 'Basic', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
    business: { label: 'Business', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
    dsgvo: { label: 'DSGVO', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400' },
  };
  const { label, icon: Icon, color, bg, dot } = map[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${bg} ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <Icon size={11} />
      {label}
    </span>
  );
}

function IncludesIcon({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('json')) return <FileJson size={14} className="text-theme-accent flex-shrink-0 mt-0.5" />;
  if (t.includes('video')) return <Video size={14} className="text-theme-accent flex-shrink-0 mt-0.5" />;
  return <FileText size={14} className="text-theme-accent flex-shrink-0 mt-0.5" />;
}

/* ──────────────────── Section: Hero ──────────────────── */

function HeroSection({
  item,
  status,
  onBuy,
  isBuying,
}: {
  item: ShopItemContent;
  status: BuildStatus | null;
  onBuy: (withAccount: boolean) => void;
  isBuying: boolean;
}) {
  const { t } = useTranslation();
  const gatePassed = !!status?.gate_passed;
  const isComingSoon = !!item.comingSoon;
  const isBuyable = (item.type === 'blueprint' || item.type === 'bundle') && !isComingSoon;
  const credits = item.price ? item.price * 10 : 0;

  return (
    <section className="pt-28 pb-12 px-6 lg:px-16">
      <div className="max-w-[1100px] mx-auto">
        <button
          onClick={() => { window.location.hash = '#/shop'; }}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted hover:text-theme-accent transition-colors mb-8"
        >
          <ArrowLeft size={12} />
          {t('shop.detailBackToShop')}
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
            {item.type === 'blueprint' && t('shop.detailTypeBlueprint')}
            {item.type === 'bundle' && t('shop.detailTypeBundle')}
            {item.type === 'dfy' && t('shop.detailTypeDfy')}
            {item.type === 'saas' && t('shop.detailTypeSaas')}
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-xs font-mono text-text-muted">{item.category}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-4">
              {item.name}
              {item.tag && (
                <span className="ml-3 inline-block align-middle font-mono text-[10px] uppercase tracking-widest text-theme-accent bg-theme-accent/10 border border-theme-border-accent px-2 py-0.5">
                  {item.tag}
                </span>
              )}
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl">{item.tagline}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <SecurityBadge level={item.securityLevel} />
              {item.icp.map((i) => (
                <span key={i} className="font-mono text-[10px] uppercase tracking-wider text-text-secondary bg-bg-elevated border border-theme-border px-2 py-1 rounded">
                  {i === 'AG' && t('shop.icpAgency')}
                  {i === 'PB' && t('shop.icpPersonalBrand')}
                  {i === 'FI' && t('shop.icpCompany')}
                </span>
              ))}
              {!gatePassed && !isComingSoon && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-300 bg-amber-300/10 border border-amber-300/20 px-2 py-1 rounded">
                  <Sparkles size={10} />
                  {t('shop.detailBetaBadge')}
                </span>
              )}
              {isComingSoon && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-300 bg-sky-300/10 border border-sky-300/20 px-2 py-1 rounded">
                  <Clock size={10} />
                  {item.comingSoonPhase || t('shop.detailComingSoon')}
                </span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="md:text-right md:min-w-[280px]">
            <div className="mb-2">
              <span className="block text-3xl font-light text-text-primary">{item.priceLabel}</span>
              {credits > 0 && (
                <span className="text-xs text-theme-accent/70 font-mono block">
                  {t('shop.creditsWithAccount', { credits: credits.toLocaleString('de-DE') })}
                </span>
              )}
            </div>

            {isBuyable ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onBuy(false)}
                  disabled={isBuying}
                  className="btn-primary text-sm px-6 py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isBuying ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-text-on-accent/40 border-t-text-on-accent animate-spin" />
                      {t('shop.starting')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      {t('shop.buyNow')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => onBuy(true)}
                  disabled={isBuying}
                  className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text-secondary border border-theme-border px-5 py-2 hover:border-theme-border-accent hover:text-theme-accent transition-all disabled:opacity-50"
                >
                  <UserPlus size={12} />
                  {t('shop.detailBuyWithAccount')}
                </button>
              </div>
            ) : isComingSoon ? (
              <a
                href="/#/audit"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium border border-theme-border-accent text-theme-accent px-6 py-3 hover:bg-theme-accent/[0.08] transition-all"
              >
                {t('shop.detailWaitlistViaAudit')}
                <ArrowRight size={13} />
              </a>
            ) : (
              // DFY → Audit-CTA
              <a
                href="/#/audit"
                className="btn-primary text-sm px-6 py-3 inline-flex items-center justify-center gap-2"
              >
                {t('shop.detailBookFreeAudit')}
                <ArrowRight size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── Section: Generic Content Block ──────────────────── */

function ContentSection({
  index,
  label,
  title,
  children,
  bg = false,
}: {
  index: string;
  label: string;
  title: string;
  children: React.ReactNode;
  bg?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`px-6 lg:px-16 py-16 ${bg ? 'bg-bg-surface' : ''}`} ref={ref}>
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
              {index} — {label}
            </span>
            <div className="h-px flex-1 bg-theme-border max-w-xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight mb-5 text-text-primary">{title}</h2>
          <div className="text-[15px] text-text-secondary leading-relaxed">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── Section: FAQ Accordion ──────────────────── */

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border border-theme-border rounded-lg overflow-hidden bg-bg-surface">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg-elevated transition-colors"
      >
        <span className="text-sm md:text-base font-medium text-text-primary">{q}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-theme-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Section: Downloads (gate_passed only) ──────────────────── */

function DownloadsSection({ status }: { status: BuildStatus }) {
  const { t } = useTranslation();
  if (!status.gate_passed) return null;
  const hasFiles = status.n8n_export_url || status.pdf_url || status.demo_video_url;
  if (!hasFiles) return null;
  return (
    <ContentSection index="10" label={t('shop.detailDownloadsLabel')} title={t('shop.detailDownloadsTitle')} bg>
      <p className="mb-5">{t('shop.detailDownloadsIntro')}</p>
      <div className="grid gap-3 sm:grid-cols-2 items-stretch">
        {status.n8n_export_url && (
          <div className="border border-theme-border bg-bg-surface p-4 rounded-lg flex h-full items-center gap-3">
            <FileJson size={20} className="text-theme-accent flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-text-primary">n8n-Workflow JSON</span>
              <span className="block text-xs text-text-muted mt-0.5">{t('shop.detailAvailableAfterPurchase')}</span>
            </div>
            <Lock size={14} className="text-text-muted" />
          </div>
        )}
        {status.pdf_url && (
          <div className="border border-theme-border bg-bg-surface p-4 rounded-lg flex h-full items-center gap-3">
            <FileText size={20} className="text-theme-accent flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-text-primary">{t('shop.detailSetupPdf')}</span>
              <span className="block text-xs text-text-muted mt-0.5">{t('shop.detailAvailableAfterPurchase')}</span>
            </div>
            <Lock size={14} className="text-text-muted" />
          </div>
        )}
        {status.demo_video_url && (
          <div className="border border-theme-border bg-bg-surface p-4 rounded-lg flex items-center gap-3 sm:col-span-2">
            <Video size={20} className="text-theme-accent flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-text-primary">{t('shop.detailDemoVideo')}</span>
              <span className="block text-xs text-text-muted mt-0.5">{t('shop.detailWalkthroughAfterPurchase')}</span>
            </div>
            <Lock size={14} className="text-text-muted" />
          </div>
        )}
      </div>
    </ContentSection>
  );
}

/* ──────────────────── Section: Install-Option (Self vs AEVUM) ──────────────────── */

function InstallOptionSection({
  item,
  onBuy,
  isBuying,
}: {
  item: ShopItemContent;
  onBuy: (withAccount: boolean) => void;
  isBuying: boolean;
}) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent">
              {t('shop.installEyebrow')}
            </span>
            <div className="h-px flex-1 bg-theme-border max-w-xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight mb-2 text-text-primary">
            {t('shop.installTitle')}
          </h2>
          <p className="text-sm text-text-muted mb-8 max-w-xl">
            {t('shop.installIntro')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Self-Install Card */}
            <TiltCard intensity={7}>
            <div className="bg-bg-surface border border-theme-border p-6 md:p-7 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-secondary bg-bg-elevated border border-theme-border px-2.5 py-1 rounded">
                  <Download size={11} />
                  {t('shop.installSelfBadge')}
                </span>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">{t('shop.installSelfTitle')}</h3>
              <div className="text-2xl font-light text-text-primary mb-1">{item.priceLabel}</div>
              <span className="text-xs text-text-muted font-mono mb-5">{t('shop.installSelfPriceNote')}</span>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>{t('shop.installSelfBullet1')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>{t('shop.installSelfBullet2')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>{t('shop.installSelfBullet3')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>{t('shop.installSelfBullet4')}</span>
                </li>
              </ul>

              <Magnetic strength={0.2}>
              <button
                onClick={() => onBuy(false)}
                disabled={isBuying}
                className="btn-primary text-sm px-5 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-60 w-full"
              >
                {isBuying ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-text-on-accent/40 border-t-text-on-accent animate-spin" />
                    {t('shop.starting')}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    {t('shop.installBuyNowPrice', { price: item.priceLabel })}
                  </>
                )}
              </button>
              </Magnetic>
            </div>
            </TiltCard>

            {/* AEVUM-Install Card (Featured) */}
            <TiltCard intensity={7}>
            <div className="relative bg-gradient-to-br from-[#15110a] via-[#111116] to-[#0c0c10] border border-theme-border-accent p-6 md:p-7 flex flex-col overflow-hidden h-full">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-theme-accent/[0.08] blur-3xl pointer-events-none" />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-theme-accent bg-theme-accent/10 border border-theme-border-accent px-2.5 py-1 rounded">
                    <Sparkles size={11} />
                    {t('shop.installAevumBadge')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-theme-accent bg-theme-accent/15 border border-theme-border-accent px-2 py-0.5">
                    {t('shop.installRecommended')}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">{t('shop.installDfyTitle')}</h3>
                <div className="text-2xl font-light text-text-primary mb-1">
                  + ab €497 <span className="text-base text-text-secondary">{t('shop.installSetupService')}</span>
                </div>
                <span className="text-xs text-theme-accent/80 font-mono mb-5">
                  {t('shop.installDfyPriceNote')}
                </span>

                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="text-theme-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{t('shop.installDfyBullet1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="text-theme-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{t('shop.installDfyBullet2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="text-theme-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{t('shop.installDfyBullet3')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="text-theme-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{t('shop.installDfyBullet4')}</span>
                  </li>
                </ul>

                <Magnetic strength={0.2}>
                <a
                  href={`/#/audit?service=${item.slug}&type=installation`}
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-text-on-accent bg-theme-accent hover:bg-theme-accent-hover px-5 py-2.5 transition-all w-full"
                >
                  {t('shop.installRequestSetup')}
                  <ArrowRight size={13} />
                </a>
                </Magnetic>
              </div>
            </div>
            </TiltCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── Main Component ──────────────────── */

interface ShopItemDetailProps {
  type?: ShopItemType;
}

export default function ShopItemDetail({ type: typeProp }: ShopItemDetailProps) {
  const { t, i18n } = useTranslation();
  const [{ type, slug }, setRoute] = useState(parseRoute());
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Route-Updates (Hash-Router)
  useEffect(() => {
    const handler = () => setRoute(parseRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const effectiveType = typeProp || type;
  const item = useMemo(() => {
    if (!slug) return null;
    const base = getShopItem(slug, effectiveType || undefined);
    return base ? localizeShopItem(base, i18n.language) : null;
  }, [slug, effectiveType, i18n.language]);

  // Fetch live build-status
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api<ShopItemAPIResponse>(`/api/shop-items/${slug}`)
      .then((res) => {
        if (cancelled) return;
        setStatus(res.item || null);
        setStatusLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStatusLoaded(true);
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Page-view tracking
  useEffect(() => {
    if (item) {
      track('shop_open', { meta: { shop_item: item.slug, view: 'detail' } });
    }
  }, [item]);

  // Wave H4 — per-item SEO + Schema.org Product/Service JSON-LD
  usePageSeo({
    title: item ? `${item.name} — AEVUM Shop` : 'Shop — AEVUM',
    description: item ? item.tagline : t('shop.detailFallbackSeoDescription'),
    path: item ? `/shop/${item.type}/${item.slug}` : '/shop',
    jsonLd: item ? {
      '@context': 'https://schema.org',
      '@type': item.type === 'dfy' || item.type === 'saas' ? 'Service' : 'Product',
      name: item.name,
      url: `https://aevum-system.de/shop/${item.type}/${item.slug}`,
      description: item.tagline || item.whatIsIt,
      category: item.category,
      brand: { '@type': 'Brand', name: 'AEVUM' },
      provider: { '@type': 'Organization', name: 'AEVUM', url: 'https://aevum-system.de' },
      ...(item.price ? {
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'EUR',
          availability: item.comingSoon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
          url: `https://aevum-system.de/shop/${item.type}/${item.slug}`,
          seller: { '@type': 'Organization', name: 'AEVUM' },
        },
      } : {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          availability: item.comingSoon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
        },
      }),
    } : undefined,
  });

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="text-theme-accent mb-4" />
        <h1 className="text-2xl font-light mb-2">{t('shop.detailNotFoundTitle')}</h1>
        <p className="text-sm text-text-muted mb-6">
          {t('shop.detailNotFoundText')}
        </p>
        <a href="/#/shop" className="btn-primary px-6 py-2.5 text-sm">{t('shop.detailToShop')}</a>
      </div>
    );
  }

  const handleBuy = async (withAccount: boolean) => {
    if (!item.stripePriceId || !item.price) return;
    setBuyError(null);
    setBuying(true);
    track('checkout_start', {
      package_tier: item.slug,
      value_cents: Math.round(item.price * 100),
      meta: { with_account: withAccount, source: 'shop_detail_page' },
    });
    try {
      // Mit-Account-Flow: Email-Prompt vor Stripe (10c/€ + Stempelkarte + Login)
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
        if (!email || !email.includes('@')) { setBuying(false); return; }
        buyerEmail = email.trim().toLowerCase();
        const name = window.prompt(t('shop.detailPromptNameLabel')) || '';
        buyerName = name.trim();
      }
      const { url } = await createCheckoutSession({
        product_id: item.slug,
        stripe_price_id: item.stripePriceId,
        mode: 'payment',
        metadata: {
          blueprint_slug: item.slug,
          ...(withAccount ? {
            create_account: 'true',
            source: `shop-detail:${item.slug}`,
            purchase_type: item.type === 'bundle' ? 'bundle' : 'blueprint',
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
        setBuying(false);
        return;
      }
      setBuyError(err instanceof Error ? err.message : t('shop.detailCheckoutError'));
      setBuying(false);
    }
  };

  const isBuyable = (item.type === 'blueprint' || item.type === 'bundle') && !item.comingSoon;

  return (
    <div className="bg-bg-primary min-h-screen">
      <HeroSection item={item} status={status} onBuy={handleBuy} isBuying={buying} />

      {buyError && (
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 -mt-4 mb-6">
          <div className="border border-rose-400/30 bg-rose-400/5 px-5 py-3 text-sm text-rose-400 font-mono">
            {buyError}
          </div>
        </div>
      )}

      {/* Quality-Gate-Disclaimer (visible if not gate_passed and not coming-soon) */}
      {statusLoaded && !status?.gate_passed && !item.comingSoon && (
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 mb-6">
          <div className="border border-amber-300/25 bg-amber-300/5 p-5 rounded-lg flex items-start gap-3">
            <Sparkles size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-sm font-medium text-amber-200 mb-1">{t('shop.detailGateTitle')}</span>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('shop.detailGateText')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coming-Soon-Disclaimer */}
      {item.comingSoon && (
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 mb-6">
          <div className="border border-sky-300/25 bg-sky-300/5 p-5 rounded-lg flex items-start gap-3">
            <Clock size={18} className="text-sky-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-sm font-medium text-sky-200 mb-1">
                {item.comingSoonPhase || t('shop.detailConceptPhase')}
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('shop.detailComingSoonText')}
              </p>
            </div>
          </div>
        </div>
      )}

      <ContentSection index="02" label={t('shop.detailSec02Label')} title={t('shop.detailSec02Title', { name: item.name })}>
        <p>{item.whatIsIt}</p>
      </ContentSection>

      <ContentSection index="03" label={t('shop.detailSec03Label')} title={t('shop.detailSec03Title')} bg>
        <ul className="space-y-2.5">
          {item.outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent flex-shrink-0 mt-2.5" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection index="04" label={t('shop.detailSec04Label')} title={t('shop.detailSec04Title')}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-3">
              {t('shop.detailFitsHeading')}
            </span>
            <ul className="space-y-2.5">
              {item.whenItFits.fits.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              {t('shop.detailRequiresHeading')}
            </span>
            <ul className="space-y-2.5">
              {item.whenItFits.requires.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-text-muted flex-shrink-0 mt-0.5">·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection index="05" label={t('shop.detailSec05Label')} title={t('shop.detailSec05Title')} bg>
        <ul className="space-y-3">
          {item.includes.map((inc, i) => (
            <li key={i} className="flex items-start gap-3">
              <IncludesIcon text={inc} />
              <span>{inc}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      {/* Install-Option (only for Blueprint+Bundle — DFY/SaaS skip this) */}
      {(item.type === 'blueprint' || item.type === 'bundle') && !item.comingSoon && (
        <InstallOptionSection item={item} onBuy={handleBuy} isBuying={buying} />
      )}

      <ContentSection index="06" label={t('shop.detailSec06Label')} title={item.priceLabel}>
        {item.pricingNote && <p className="mb-3">{item.pricingNote}</p>}
        {item.price && (
          <p className="text-sm text-text-muted font-mono">
            {t('shop.detailCreditsEarlybird', { credits: (item.price * 10).toLocaleString('de-DE') })}
          </p>
        )}
        {item.crossSell && (
          <div className="mt-5 border border-theme-border-accent bg-theme-accent/5 p-4 rounded-lg">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-theme-accent mb-1">
              {t('shop.detailCrossSellTip')}
            </span>
            <span className="text-sm text-text-secondary">{item.crossSell}</span>
          </div>
        )}
      </ContentSection>

      <ContentSection
        index="07"
        label={t('shop.detailSec07Label')}
        title={
          item.securityLevel === 'basic'
            ? t('shop.detailSecLevelBasicTitle')
            : item.securityLevel === 'business'
              ? t('shop.detailSecLevelBusinessTitle')
              : t('shop.detailSecLevelDsgvoTitle')
        }
        bg
      >
        <p>
          {item.securityNote ||
            (item.securityLevel === 'basic'
              ? t('shop.detailSecLevelBasicText')
              : item.securityLevel === 'business'
                ? t('shop.detailSecLevelBusinessText')
                : t('shop.detailSecLevelDsgvoText'))}
        </p>
      </ContentSection>

      <ContentSection index="08" label={t('shop.detailSec08Label')} title={t('shop.detailSec08Title')}>
        <div className="space-y-3 mt-2">
          {item.faq.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} idx={i} />
          ))}
        </div>
      </ContentSection>

      {status && status.gate_passed && (
        <DownloadsSection status={status} />
      )}

      {/* Final CTA */}
      <section className="px-6 lg:px-16 py-20 bg-bg-surface">
        <div className="max-w-[1100px] mx-auto">
          <div className="border border-theme-border bg-bg-surface p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-12 right-0 w-64 h-64 rounded-full bg-theme-accent/[0.04] blur-3xl pointer-events-none" />
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-light tracking-tight mb-2">
                {isBuyable ? t('shop.detailFinalTitleBuyable') : item.comingSoon ? t('shop.detailFinalTitleComingSoon') : t('shop.detailFinalTitleDfy')}
              </h3>
              <p className="text-sm text-text-muted max-w-md">
                {isBuyable
                  ? t('shop.detailFinalTextBuyable')
                  : item.comingSoon
                    ? t('shop.detailFinalTextComingSoon', { name: item.name })
                    : t('shop.detailFinalTextDfy', { name: item.name })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {isBuyable && (
                <button
                  onClick={() => handleBuy(false)}
                  disabled={buying}
                  className="btn-primary px-6 py-3 text-sm inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} />
                  {t('shop.installBuyNowPrice', { price: item.priceLabel })}
                </button>
              )}
              <a
                href="/#/audit"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-theme-accent border border-theme-border-accent px-6 py-3 hover:bg-theme-accent/[0.08] transition-all"
              >
                {item.comingSoon ? t('shop.detailFinalCtaWaitlist') : isBuyable ? t('shop.detailFinalCtaAudit') : t('shop.detailFinalCtaBookAudit')}
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
