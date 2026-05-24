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
import { api, createCheckoutSession } from '@/lib/api';
import { track } from '@/lib/shop-track';
import { getShopItem } from '@/data/shop-items';
import type { ShopItemContent, ShopItemType, SecurityLevel } from '@/data/shop-items/types';

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
  if (t.includes('json')) return <FileJson size={14} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  if (t.includes('video')) return <Video size={14} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
  return <FileText size={14} className="text-[#e0a458] flex-shrink-0 mt-0.5" />;
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
  const gatePassed = !!status?.gate_passed;
  const isComingSoon = !!item.comingSoon;
  const isBuyable = (item.type === 'blueprint' || item.type === 'bundle') && !isComingSoon;
  const credits = item.price ? item.price * 10 : 0;

  return (
    <section className="pt-28 pb-12 px-6 lg:px-16">
      <div className="max-w-[1100px] mx-auto">
        <button
          onClick={() => { window.location.hash = '#/shop'; }}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#7a7a85] hover:text-[#e0a458] transition-colors mb-8"
        >
          <ArrowLeft size={12} />
          Zurück zum Shop
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458]">
            {item.type === 'blueprint' && '01 — Blueprint'}
            {item.type === 'bundle' && 'Bundle'}
            {item.type === 'dfy' && '02 — Done-For-You'}
            {item.type === 'saas' && '03 — SaaS Tool'}
          </span>
          <span className="text-[#7a7a85]">·</span>
          <span className="text-xs font-mono text-[#7a7a85]">{item.category}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-4">
              {item.name}
              {item.tag && (
                <span className="ml-3 inline-block align-middle font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/20 px-2 py-0.5">
                  {item.tag}
                </span>
              )}
            </h1>
            <p className="text-base md:text-lg text-[#a4a4ad] max-w-2xl">{item.tagline}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <SecurityBadge level={item.securityLevel} />
              {item.icp.map((i) => (
                <span key={i} className="font-mono text-[10px] uppercase tracking-wider text-[#a4a4ad] bg-white/5 border border-white/10 px-2 py-1 rounded">
                  {i === 'AG' && 'Agentur'}
                  {i === 'PB' && 'Personal Brand'}
                  {i === 'FI' && 'Firma'}
                </span>
              ))}
              {!gatePassed && !isComingSoon && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-300 bg-amber-300/10 border border-amber-300/20 px-2 py-1 rounded">
                  <Sparkles size={10} />
                  Beta — wird gerade gebaut + getestet
                </span>
              )}
              {isComingSoon && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-300 bg-sky-300/10 border border-sky-300/20 px-2 py-1 rounded">
                  <Clock size={10} />
                  {item.comingSoonPhase || 'Coming Soon'}
                </span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="md:text-right md:min-w-[280px]">
            <div className="mb-2">
              <span className="block text-3xl font-light text-[#F9FAFB]">{item.priceLabel}</span>
              {credits > 0 && (
                <span className="text-xs text-[#e0a458]/70 font-mono block">
                  +{credits.toLocaleString('de-DE')} Credits mit Account
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
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#08080a]/40 border-t-[#08080a] animate-spin" />
                      Wird gestartet...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      Jetzt kaufen
                    </>
                  )}
                </button>
                <button
                  onClick={() => onBuy(true)}
                  disabled={isBuying}
                  className="inline-flex items-center justify-center gap-2 text-xs font-medium text-[#a4a4ad] border border-white/10 px-5 py-2 hover:border-[#e0a458]/40 hover:text-[#e0a458] transition-all disabled:opacity-50"
                >
                  <UserPlus size={12} />
                  Mit Account kaufen
                </button>
              </div>
            ) : isComingSoon ? (
              <a
                href="/#/audit"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium border border-[#e0a458]/30 text-[#e0a458] px-6 py-3 hover:bg-[#e0a458]/8 transition-all"
              >
                Wait-List via Audit-Call
                <ArrowRight size={13} />
              </a>
            ) : (
              // DFY → Audit-CTA
              <a
                href="/#/audit"
                className="btn-primary text-sm px-6 py-3 inline-flex items-center justify-center gap-2"
              >
                Kostenlosen Audit buchen
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
    <section className={`px-6 lg:px-16 py-16 ${bg ? 'bg-[#0c0c10]' : ''}`} ref={ref}>
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458]">
              {index} — {label}
            </span>
            <div className="h-px flex-1 bg-white/8 max-w-xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight mb-5 text-[#F9FAFB]">{title}</h2>
          <div className="text-[15px] text-[#a4a4ad] leading-relaxed">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── Section: FAQ Accordion ──────────────────── */

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border border-white/8 rounded-lg overflow-hidden bg-[#111116]">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm md:text-base font-medium text-[#F9FAFB]">{q}</span>
        <ChevronDown
          size={16}
          className={`text-[#7a7a85] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-[#a4a4ad] leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Section: Downloads (gate_passed only) ──────────────────── */

function DownloadsSection({ status }: { status: BuildStatus }) {
  if (!status.gate_passed) return null;
  const hasFiles = status.n8n_export_url || status.pdf_url || status.demo_video_url;
  if (!hasFiles) return null;
  return (
    <ContentSection index="10" label="Downloads" title="Sofort-Zugriff nach Kauf" bg>
      <p className="mb-5">
        Nach erfolgreichem Kauf bekommst du direkten Download-Link zu allen Files. Diese Preview zeigt
        was im Paket enthalten ist:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {status.n8n_export_url && (
          <div className="border border-white/8 bg-[#111116] p-4 rounded-lg flex items-center gap-3">
            <FileJson size={20} className="text-[#e0a458] flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-[#F9FAFB]">n8n-Workflow JSON</span>
              <span className="block text-xs text-[#7a7a85] mt-0.5">Verfügbar nach Kauf</span>
            </div>
            <Lock size={14} className="text-[#7a7a85]" />
          </div>
        )}
        {status.pdf_url && (
          <div className="border border-white/8 bg-[#111116] p-4 rounded-lg flex items-center gap-3">
            <FileText size={20} className="text-[#e0a458] flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-[#F9FAFB]">Setup-Anleitung PDF</span>
              <span className="block text-xs text-[#7a7a85] mt-0.5">Verfügbar nach Kauf</span>
            </div>
            <Lock size={14} className="text-[#7a7a85]" />
          </div>
        )}
        {status.demo_video_url && (
          <div className="border border-white/8 bg-[#111116] p-4 rounded-lg flex items-center gap-3 sm:col-span-2">
            <Video size={20} className="text-[#e0a458] flex-shrink-0" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-[#F9FAFB]">Demo-Video</span>
              <span className="block text-xs text-[#7a7a85] mt-0.5">Walk-Through verfügbar nach Kauf</span>
            </div>
            <Lock size={14} className="text-[#7a7a85]" />
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
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458]">
              05b — Installation
            </span>
            <div className="h-px flex-1 bg-white/8 max-w-xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight mb-2 text-[#F9FAFB]">
            Möchtest du Hilfe bei der Installation?
          </h2>
          <p className="text-sm text-[#7a7a85] mb-8 max-w-xl">
            Du wählst: Self-Setup mit Guide und Prompts — oder wir installieren komplett für dich
            inkl. Übergabe-Call.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Self-Install Card */}
            <div className="bg-[#111116] border border-white/10 p-6 md:p-7 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#a4a4ad] bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                  <Download size={11} />
                  Selbst installieren
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#F9FAFB] mb-2">Self-Setup</h3>
              <div className="text-2xl font-light text-[#F9FAFB] mb-1">{item.priceLabel}</div>
              <span className="text-xs text-[#7a7a85] font-mono mb-5">Einmalig, kein Retainer</span>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>n8n-JSON + PDF-Guide + Prompt-Library</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>Self-Setup ~30-90 Minuten</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>Eigene API-Keys verbinden</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>Helpbot bei Fragen (frei)</span>
                </li>
              </ul>

              <button
                onClick={() => onBuy(false)}
                disabled={isBuying}
                className="btn-primary text-sm px-5 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-60 w-full"
              >
                {isBuying ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#08080a]/40 border-t-[#08080a] animate-spin" />
                    Wird gestartet...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    Jetzt kaufen — {item.priceLabel}
                  </>
                )}
              </button>
            </div>

            {/* AEVUM-Install Card (Featured) */}
            <div className="relative bg-gradient-to-br from-[#15110a] via-[#111116] to-[#0c0c10] border border-[#e0a458]/35 p-6 md:p-7 flex flex-col overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#e0a458]/8 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/10 border border-[#e0a458]/25 px-2.5 py-1 rounded">
                    <Sparkles size={11} />
                    Installation durch AEVUM
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#e0a458] bg-[#e0a458]/15 border border-[#e0a458]/30 px-2 py-0.5">
                    Empfohlen
                  </span>
                </div>
                <h3 className="text-lg font-medium text-[#F9FAFB] mb-2">Done-For-You Setup</h3>
                <div className="text-2xl font-light text-[#F9FAFB] mb-1">
                  + ab €497 <span className="text-base text-[#a4a4ad]">Setup-Service</span>
                </div>
                <span className="text-xs text-[#e0a458]/80 font-mono mb-5">
                  Festpreis, finale Quote nach Audit-Call
                </span>

                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                    <span className="text-[#e0a458] flex-shrink-0 mt-0.5">✓</span>
                    <span>Komplett-Setup inkl. API-Verbindungen + Test-Run</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                    <span className="text-[#e0a458] flex-shrink-0 mt-0.5">✓</span>
                    <span>30-min Übergabe-Call (Live-Demo + Q&amp;A)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                    <span className="text-[#e0a458] flex-shrink-0 mt-0.5">✓</span>
                    <span>30-Tage Setup-Support nach Übergabe</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-[#a4a4ad]">
                    <span className="text-[#e0a458] flex-shrink-0 mt-0.5">✓</span>
                    <span>Brand-Voice / Prompts angepasst auf dich</span>
                  </li>
                </ul>

                <a
                  href={`/#/audit?service=${item.slug}&type=installation`}
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#08080a] bg-[#e0a458] hover:bg-[#f0b468] px-5 py-2.5 transition-all w-full"
                >
                  Setup anfragen
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
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
    return getShopItem(slug, effectiveType || undefined);
  }, [slug, effectiveType]);

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

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="text-[#e0a458] mb-4" />
        <h1 className="text-2xl font-light mb-2">Produkt nicht gefunden</h1>
        <p className="text-sm text-[#7a7a85] mb-6">
          Der angefragte Shop-Item existiert nicht oder wurde umbenannt.
        </p>
        <a href="/#/shop" className="btn-primary px-6 py-2.5 text-sm">Zum Shop</a>
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
      if (withAccount) {
        window.location.href = `/#/register?intent=checkout&blueprint=${item.slug}`;
        return;
      }
      const { url } = await createCheckoutSession({
        product_id: item.slug,
        stripe_price_id: item.stripePriceId,
        mode: 'payment',
        metadata: { blueprint_slug: item.slug },
        success_url: window.location.origin + '/#/checkout/success',
        cancel_url: window.location.origin + '/#/checkout/cancelled',
      });
      window.location.href = url;
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : 'Checkout fehlgeschlagen.');
      setBuying(false);
    }
  };

  const isBuyable = (item.type === 'blueprint' || item.type === 'bundle') && !item.comingSoon;

  return (
    <div className="bg-[#08080a] min-h-screen">
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
              <span className="block text-sm font-medium text-amber-200 mb-1">Quality-Gate läuft</span>
              <p className="text-sm text-[#a4a4ad] leading-relaxed">
                Dieser Service durchläuft gerade unser Quality-Gate: eigene Anwendung,
                Workflow-Export, PDF-Anleitung. Kaufen ist möglich — du bekommst die
                fertigen Files sobald das Gate (üblicherweise 7-14 Tage) durch ist.
                Anti-Fake-it-Brand: wir verkaufen nichts was wir nicht selbst getestet haben.
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
                {item.comingSoonPhase || 'In Konzept-Phase'}
              </span>
              <p className="text-sm text-[#a4a4ad] leading-relaxed">
                Dieses Tool ist noch nicht live. Du kannst dich über den Audit-Call auf die
                Beta-Wait-List setzen lassen — Early-Adopter kriegen Bonus-Credits beim Launch.
              </p>
            </div>
          </div>
        </div>
      )}

      <ContentSection index="02" label="Was ist es" title={`${item.name} im Detail`}>
        <p>{item.whatIsIt}</p>
      </ContentSection>

      <ContentSection index="03" label="Was bringt es" title="Konkrete Outcomes" bg>
        <ul className="space-y-2.5">
          {item.outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0a458] flex-shrink-0 mt-2.5" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection index="04" label="Wann macht es Sinn" title="Fit-Check">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-3">
              Passt zu dir wenn
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
            <span className="block font-mono text-[10px] uppercase tracking-widest text-[#7a7a85] mb-3">
              Voraussetzungen
            </span>
            <ul className="space-y-2.5">
              {item.whenItFits.requires.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#7a7a85] flex-shrink-0 mt-0.5">·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection index="05" label="Was bekommst du" title="Komplette Lieferung" bg>
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

      <ContentSection index="06" label="Was kostet es" title={item.priceLabel}>
        {item.pricingNote && <p className="mb-3">{item.pricingNote}</p>}
        {item.price && (
          <p className="text-sm text-[#7a7a85] font-mono">
            +{(item.price * 10).toLocaleString('de-DE')} Credits mit Account &middot; Frühbucher-Rabatt automatisch
          </p>
        )}
        {item.crossSell && (
          <div className="mt-5 border border-[#e0a458]/20 bg-[#e0a458]/5 p-4 rounded-lg">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-[#e0a458] mb-1">
              Cross-Sell-Tipp
            </span>
            <span className="text-sm text-[#a4a4ad]">{item.crossSell}</span>
          </div>
        )}
      </ContentSection>

      <ContentSection
        index="07"
        label="Sicherheits-Stufe"
        title={
          item.securityLevel === 'basic'
            ? 'Basic — Solo / Hobby'
            : item.securityLevel === 'business'
              ? 'Business — KMU-Standard'
              : 'DSGVO — Unternehmens-Compliance'
        }
        bg
      >
        <p>
          {item.securityNote ||
            (item.securityLevel === 'basic'
              ? 'Basic-Level: HTTPS, Passwort-Schutz, Basis-Setup. Für Solo / Hobby ausreichend.'
              : item.securityLevel === 'business'
                ? 'Business-Level: Token-Encryption, Access-Control, Backup-Logik. Für KMU-Standard.'
                : 'DSGVO-Level: EU-Hosting, DPA-ready, Audit-Log + Erasure-API. Für Unternehmens-Compliance.')}
        </p>
      </ContentSection>

      <ContentSection index="08" label="FAQ" title="Häufige Fragen">
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
      <section className="px-6 lg:px-16 py-20 bg-[#0c0c10]">
        <div className="max-w-[1100px] mx-auto">
          <div className="border border-white/10 bg-[#111116] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-12 right-0 w-64 h-64 rounded-full bg-[#e0a458]/4 blur-3xl pointer-events-none" />
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-light tracking-tight mb-2">
                {isBuyable ? 'Bereit zum Start?' : item.comingSoon ? 'Sei früh dabei.' : 'Fragen vor dem Audit?'}
              </h3>
              <p className="text-sm text-[#7a7a85] max-w-md">
                {isBuyable
                  ? `Direkt-Kauf, Sofort-Download, 30-90 Minuten zum Live-Status. Bei Fragen: kostenlosen Audit-Call buchen.`
                  : item.comingSoon
                    ? `Audit-Call buchen mit "Wait-List ${item.name}". Early-Adopter kriegen Credits-Bonus beim Launch.`
                    : `Beratungsfreier Audit-Call: wir analysieren ob ${item.name} der richtige Service für dich ist.`}
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
                  Jetzt kaufen — {item.priceLabel}
                </button>
              )}
              <a
                href="/#/audit"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#e0a458] border border-[#e0a458]/30 px-6 py-3 hover:bg-[#e0a458]/8 transition-all"
              >
                {item.comingSoon ? 'Wait-List' : isBuyable ? 'Bei Fragen: Audit' : 'Audit-Call buchen'}
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
