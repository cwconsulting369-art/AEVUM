import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Building2,
} from 'lucide-react';
import CONTACT from '../config/contact';
import { usePageSeo } from '@/hooks/use-page-seo';
import PathThreeCard from '@/components/ctas/PathThreeCard';
import { TiltCard } from '@/components/showcase-fx';

/* ──────────────────────── Types ──────────────────────── */

interface ActivatedService {
  slug?: string;
  name?: string;
  started_at?: string;
  impact?: string;
}

interface CaseSummary {
  slug: string;
  hero_title: string;
  hero_subtitle?: string | null;
  brand_url?: string | null;
  hero_image_url?: string | null;
  testimonial_author?: string | null;
  activated_services?: ActivatedService[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center px-4 sm:px-6 pt-16">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block"
        >
          Referenzen
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Live <span className="text-gradient font-medium">Cases</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Echte Projekte. Ehrlich dokumentiert. Nur was unsere Kunden freigeben.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Case-Card ──────────────────────── */

function CaseCard({ caseData, index }: { caseData: CaseSummary; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const services = caseData.activated_services || [];
  const serviceCount = services.length;

  return (
    <TiltCard intensity={6} className="block h-full">
    <motion.a
      ref={ref}
      href={`/#/cases/${caseData.slug}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col bg-bg-surface border border-theme-border p-6 md:p-8 hover:border-theme-border-accent hover:bg-bg-elevated transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-theme-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-medium text-text-primary leading-tight break-words">
              {caseData.hero_title}
            </h3>
            {caseData.hero_subtitle && (
              <p className="text-xs text-text-secondary mt-1 break-words">{caseData.hero_subtitle}</p>
            )}
          </div>
        </div>
        <ArrowRight
          size={18}
          className="text-text-muted group-hover:text-theme-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
        />
      </div>

      <div className="mt-auto pt-4 border-t border-theme-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {services.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="text-[10px] font-mono uppercase tracking-wider text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-1 rounded"
            >
              {s.name || s.slug}
            </span>
          ))}
          {serviceCount > 3 && (
            <span className="text-[10px] font-mono text-text-muted uppercase px-2 py-1">
              +{serviceCount - 3}
            </span>
          )}
        </div>
        {caseData.brand_url && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            <ExternalLink size={10} />
            Live
          </span>
        )}
      </div>
    </motion.a>
    </TiltCard>
  );
}

function FallbackNotice({ message }: { message: string }) {
  return (
    <div className="bg-bg-surface border border-theme-border p-8 md:p-10 text-center">
      <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
    </div>
  );
}

function CasesGridSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cases`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json?.ok || !Array.isArray(json.cases)) {
          throw new Error('Invalid response shape');
        }
        setCases(json.cases as CaseSummary[]);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'unknown';
        if (msg !== 'The user aborted a request.' && !msg.includes('aborted')) {
          setError(msg);
        } else {
          setError('timeout');
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Kunden-Cases
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Vier Projekte. Vier <span className="text-gradient font-medium">Branchen</span>.
          </h2>
          <p className="text-text-secondary max-w-2xl">
            Klick auf einen Case fuer Vision, aktivierte AEVUM-Services und Live-KPIs.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-bg-surface border border-theme-border p-6 md:p-8 animate-pulse h-full"
                aria-hidden="true"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-bg-elevated" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-bg-elevated rounded" />
                    <div className="h-2.5 w-1/2 bg-bg-elevated rounded" />
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-5 w-20 bg-bg-elevated rounded" />
                  <div className="h-5 w-24 bg-bg-elevated rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <FallbackNotice message="Aktuell keine veroeffentlichten Cases." />
        )}

        {!loading && error && (
          <FallbackNotice message="Cases werden gerade aktualisiert. Schau gleich nochmal vorbei." />
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((c, i) => (
              <CaseCard key={c.slug} caseData={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────── Section: CTA ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-3">
            Eigenen Case bauen?
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">
            Drei Wege loszulegen — keiner verlangt erst ein Sales-Gespräch.
          </p>
        </div>
        <PathThreeCard compact />
        <div className="mt-8 text-center">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-theme-accent transition-colors"
          >
            <MessageCircle size={12} />
            Oder direkt schreiben
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Cases() {
  usePageSeo({
    title: 'Live-Cases — Ketolabs · UtilityHub · Thailand-RE · GoldTraderSociety | AEVUM',
    description: 'Echte Projekte mit echten Zahlen. E-Commerce, Real Estate, Trading, B2B-Energy. Workflow-Audits, Automation-Stacks, messbare ROI. Keine Schmuck-Cases.',
    path: '/cases',
  });
  return (
    <div className="bg-bg-primary min-h-screen">
      <HeroSection />
      <CasesGridSection />
      <CTASection />
    </div>
  );
}
