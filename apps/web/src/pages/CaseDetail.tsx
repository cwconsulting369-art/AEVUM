import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Quote,
} from 'lucide-react';

interface ActivatedService {
  slug?: string;
  name?: string;
  started_at?: string;
  impact?: string;
}

interface LiveKpi {
  label?: string;
  value?: string | number;
  unit?: string;
  source?: 'manual' | 'db' | string;
  updated_at?: string;
}

interface CaseDetailDTO {
  slug: string;
  hero_title: string;
  hero_subtitle?: string | null;
  brand_url?: string | null;
  hero_image_url?: string | null;
  project_description?: string | null;
  collaboration_story?: string | null;
  vision?: string | null;
  activated_services?: ActivatedService[];
  live_kpis?: LiveKpi[];
  testimonial_quote?: string | null;
  testimonial_author?: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';

/* ──────────────────────── Helpers ──────────────────────── */

function Paragraphs({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const parts = String(text).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-[#a4a4ad] leading-relaxed">
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 lg:px-16 py-12 md:py-16 border-t border-white/5">
      <div className="max-w-[1100px] mx-auto">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-3 block">
          {eyebrow}
        </span>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-6">{title}</h2>
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────── Hero ──────────────────────── */

function Hero({ data }: { data: CaseDetailDTO }) {
  return (
    <section className="relative px-6 lg:px-16 pt-20 pb-12 md:pt-28 md:pb-16">
      <div className="max-w-[1100px] mx-auto">
        <motion.a
          href="/#/cases"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#7a7a85] hover:text-[#e0a458] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Alle Cases
        </motion.a>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.12em] text-[#e0a458] mb-4 block"
        >
          Case Study
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] mb-5"
        >
          {data.hero_title}
        </motion.h1>

        {data.hero_subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-base md:text-lg text-[#a4a4ad] max-w-2xl"
          >
            {data.hero_subtitle}
          </motion.p>
        )}

        {data.brand_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8"
          >
            <a
              href={data.brand_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-mono text-[#e0a458] hover:text-[#f5c481] border border-[#e0a458]/30 hover:border-[#e0a458]/60 px-4 py-2 rounded transition-colors"
            >
              <ExternalLink size={14} />
              {data.brand_url.replace(/^https?:\/\//, '')}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────── Services ──────────────────────── */

function Services({ services }: { services: ActivatedService[] }) {
  if (!services.length) return null;
  return (
    <Section eyebrow="Aktivierte AEVUM-Services" title="Was bei diesem Kunden live ist">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-bg-surface border border-white/10 hover:border-[#e0a458]/30 transition-colors p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-[#e0a458]/10 border border-[#e0a458]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-[#e0a458]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[#F9FAFB]">{s.name || s.slug}</h3>
                {s.started_at && (
                  <p className="text-[10px] font-mono text-[#7a7a85] uppercase tracking-wider mt-0.5">
                    Live seit {s.started_at}
                  </p>
                )}
                {s.impact && (
                  <p className="text-xs text-[#a4a4ad] mt-2 leading-relaxed">{s.impact}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────── KPIs ──────────────────────── */

function Kpis({ kpis }: { kpis: LiveKpi[] }) {
  if (!kpis.length) return null;
  return (
    <Section eyebrow="Live-KPIs" title="Echte Zahlen — keine Marketing-Stories">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-bg-surface border border-white/10 p-5"
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#7a7a85] mb-1.5">
              {k.label}
            </p>
            <p className="text-xl md:text-2xl font-light text-[#F9FAFB]">
              {k.value}
              {k.unit && <span className="text-sm text-[#a4a4ad] ml-1">{k.unit}</span>}
            </p>
            <span
              className={`mt-3 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${
                k.source === 'db' ? 'text-[#10b981]' : 'text-[#7a7a85]'
              }`}
            >
              <CheckCircle2 size={10} />
              {k.source === 'db' ? 'Live aus DB' : 'Manuell verifiziert'}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────── Testimonial ──────────────────────── */

function Testimonial({
  quote,
  author,
}: {
  quote: string | null | undefined;
  author: string | null | undefined;
}) {
  if (!quote && !author) return null;
  return (
    <section className="px-6 lg:px-16 py-16 border-t border-white/5">
      <div className="max-w-[900px] mx-auto bg-bg-surface border border-[#e0a458]/20 p-8 md:p-12 relative">
        <Quote
          size={32}
          className="text-[#e0a458]/30 absolute top-6 left-6"
        />
        <div className="relative z-10 pl-10">
          {quote && (
            <p className="text-lg md:text-xl font-light text-[#F9FAFB] leading-relaxed italic mb-6">
              &ldquo;{quote}&rdquo;
            </p>
          )}
          {author && (
            <p className="text-sm font-mono uppercase tracking-wider text-[#e0a458]">
              — {author}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── CTA ──────────────────────── */

function CTA() {
  return (
    <section className="px-6 lg:px-16 py-20 border-t border-white/5">
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
          Eigenen Case bauen?
        </h2>
        <p className="text-[#a4a4ad] mb-8 max-w-lg mx-auto">
          Audit starten, Setup pruefen, klaren Plan bekommen.
        </p>
        <a href="/#/audit" className="btn-primary">
          Audit buchen
          <ArrowRight size={16} className="ml-2" />
        </a>
      </div>
    </section>
  );
}

/* ──────────────────────── Loading + Error ──────────────────────── */

function LoadingState() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 lg:px-16 pt-24">
      <div className="max-w-[1100px] mx-auto animate-pulse space-y-6">
        <div className="h-3 w-32 bg-white/5 rounded" />
        <div className="h-12 w-3/4 bg-white/5 rounded" />
        <div className="h-4 w-1/2 bg-white/5 rounded" />
        <div className="h-40 bg-white/5 rounded mt-12" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-light text-[#F9FAFB] mb-3">Case nicht gefunden</h1>
        <p className="text-[#a4a4ad] mb-8">
          Diesen Case gibt es nicht oder er ist gerade nicht oeffentlich.
        </p>
        <a href="/#/cases" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Alle Cases
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function CaseDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<CaseDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json?.ok || !json.case) {
          setNotFound(true);
          return;
        }
        setData(json.case as CaseDetailDTO);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'unknown';
        if (msg !== 'The user aborted a request.' && !msg.includes('aborted')) {
          setNotFound(true);
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
  }, [slug]);

  if (loading) return <LoadingState />;
  if (notFound || !data) return <NotFoundState />;

  const services = data.activated_services || [];
  const kpis = data.live_kpis || [];

  return (
    <div className="bg-bg-primary min-h-screen">
      <Hero data={data} />

      {data.project_description && (
        <Section eyebrow="Das Projekt" title="Worum es geht">
          <Paragraphs text={data.project_description} />
        </Section>
      )}

      {data.collaboration_story && (
        <Section eyebrow="Zusammenarbeit" title="Warum wir zusammenarbeiten">
          <Paragraphs text={data.collaboration_story} />
        </Section>
      )}

      {data.vision && (
        <Section eyebrow="Vision" title="Wo das Ganze hingeht">
          <Paragraphs text={data.vision} />
        </Section>
      )}

      <Services services={services} />
      <Kpis kpis={kpis} />
      <Testimonial quote={data.testimonial_quote} author={data.testimonial_author} />
      <CTA />
    </div>
  );
}
