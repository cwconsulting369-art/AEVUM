import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  User,
  Building2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import CONTACT from '../config/contact';

/* ──────────────────────── Animation helpers ──────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──────────────────────── Types ──────────────────────── */

interface ApiCase {
  slug: string;
  client_zero?: boolean;
  member_since?: string;
  company?: string | null;
  industry?: string | null;
  revenue_band?: string | null;
  team_size?: string | null;
  vision?: string | null;
  bio?: string | null;
  kpis?: { label?: string; value?: string; delta?: string }[];
  case_study?: string | null;
  testimonial_quote?: string | null;
  projects?: { slug?: string; name?: string; description?: string; status?: string; industry?: string }[];
  permissions?: {
    share_company_name?: boolean;
    share_industry?: boolean;
    share_kpis?: boolean;
    share_kpi_deltas?: boolean;
    share_case_study?: boolean;
    anonymize_industry_detail?: boolean;
  };
}

interface DisplayCase {
  key: string;
  displayName: string;
  displayIndustry: string;
  story: string;
  kpiDelta: string | null;
  showKpiDelta: boolean;
  shareIndustry: boolean;
  shareKpis: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';

/* ──────────────────────── Mapping helpers ──────────────────────── */

function mapApiCase(raw: ApiCase, index: number): DisplayCase | null {
  // Skip Client Zero (Carlos) — handled in its own hero section.
  if (raw.client_zero) return null;

  const perms = raw.permissions || {};
  const shareCompany = perms.share_company_name !== false && Boolean(raw.company);
  const shareIndustry = perms.share_industry !== false && Boolean(raw.industry);
  const shareKpis = perms.share_kpis === true;
  const shareKpiDeltas = perms.share_kpi_deltas === true;

  const displayName = shareCompany && raw.company
    ? raw.company
    : `Kunde ${index + 1}`;

  const displayIndustry = shareIndustry && raw.industry
    ? raw.industry
    : 'Branche vertraulich';

  // Choose the strongest available story snippet
  const projectDesc = raw.projects?.find(p => p.description)?.description || '';
  const storyRaw = (perms.share_case_study && raw.case_study)
    || raw.testimonial_quote
    || raw.bio
    || projectDesc
    || 'Projekt läuft — Details unter NDA.';

  const story = String(storyRaw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // First KPI delta (if any) as headline metric
  const firstDelta = raw.kpis?.find(k => k.delta)?.delta || null;
  const kpiDelta = shareKpiDeltas ? firstDelta : null;

  return {
    key: raw.slug || `case-${index}`,
    displayName,
    displayIndustry,
    story,
    kpiDelta,
    showKpiDelta: Boolean(shareKpiDeltas && firstDelta),
    shareIndustry,
    shareKpis: shareKpis || shareKpiDeltas,
  };
}

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center px-6 pt-16">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block"
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
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
        >
          Echte Projekte. Ehrlich dokumentiert. Nur was unsere Kunden freigeben.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Client Zero — Carlos ──────────────────────── */

function ClientZeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Client Zero
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight">
            Das System, das sich selbst <span className="text-gradient font-medium">baut</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#15161A] border border-[#F59E0B]/30 p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F59E0B]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="flex flex-col items-center md:items-start flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mb-4">
                <User size={32} className="text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-medium text-[#F9FAFB]">Carlos Wrusch</h3>
              <p className="text-sm text-[#A1A1AA]">Founder, AEVUM Systems</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono uppercase tracking-wider">
                <CheckCircle2 size={12} />
                AEVUM &mdash; Client Zero
              </span>
            </div>

            <div className="flex-1">
              <p className="text-[#A1A1AA] leading-relaxed mb-8 text-base">
                Ich baue AEVUM auf mir selbst auf, bevor es zu Kunden kommt. Das ist Client Zero:
                eat your own dog food. Jeder Workflow, jeder Agent, jedes Dashboard l&auml;uft erst bei
                mir, bevor es externalisiert wird.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#0B0C10] border border-white/10">
                  <TrendingUp size={20} className="text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-[#F9FAFB]">System live seit 2024</p>
                    <p className="text-xs text-[#52525B]">Kontinuierliche Entwicklung</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#0B0C10] border border-white/10">
                  <CheckCircle2 size={20} className="text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-[#F9FAFB]">
                      Alle Workflows selbst getestet
                    </p>
                    <p className="text-xs text-[#52525B]">Dogfooding vor Delivery</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#52525B] mt-6 font-mono">
                Live-Tracking unter <a href="/#/about" className="text-[#F59E0B] hover:underline">/about</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Weitere Cases ──────────────────────── */

function CaseCard({ caseData, index }: { caseData: DisplayCase; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-[#15161A] border border-white/10 p-6 md:p-8 hover:border-[#F59E0B]/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#F9FAFB]">{caseData.displayName}</h3>
            <span className="text-xs text-[#A1A1AA]">{caseData.displayIndustry}</span>
          </div>
        </div>
        {caseData.showKpiDelta && caseData.kpiDelta && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono whitespace-nowrap">
            <TrendingUp size={12} />
            {caseData.kpiDelta}
          </span>
        )}
      </div>

      <p
        className="text-sm text-[#A1A1AA] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: caseData.story }}
      />

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
        {caseData.shareIndustry && (
          <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">
            Branche freigegeben
          </span>
        )}
        {caseData.shareKpis && (
          <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">
            KPI freigegeben
          </span>
        )}
      </div>
    </motion.div>
  );
}

function FallbackNotice({ message }: { message: string }) {
  return (
    <div className="bg-[#15161A] border border-white/10 p-8 md:p-10 text-center">
      <p className="text-sm text-[#A1A1AA] leading-relaxed">
        {message}
      </p>
      <p className="text-xs text-[#52525B] font-mono mt-3">
        Client Zero: Wir selbst. Live-Tracking unter{' '}
        <a href="/#/about" className="text-[#F59E0B] hover:underline">/about</a>.
      </p>
    </div>
  );
}

function MoreCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [cases, setCases] = useState<DisplayCase[]>([]);
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
        const mapped = json.cases
          .map((c: ApiCase, i: number) => mapApiCase(c, i))
          .filter((c: DisplayCase | null): c is DisplayCase => c !== null);
        setCases(mapped);
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
    <section className="px-6 lg:px-16 py-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Weitere Projekte
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">
            Vertraulich. Aber <span className="text-gradient font-medium">echt</span>.
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl">
            Nicht alle Kunden k&ouml;nnen Details &ouml;ffentlich teilen. Was du hier siehst, ist exakt das,
            wof&uuml;r wir jeweils die Freigabe haben. Keine erfundenen KPIs &mdash; nur ehrliche Updates.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-[#15161A] border border-white/10 p-6 md:p-8 animate-pulse"
                aria-hidden="true"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-32 bg-white/5 rounded" />
                      <div className="h-2.5 w-20 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                  <div className="h-3 w-2/3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <FallbackNotice message="Aktuell keine ver&ouml;ffentlichten Kunden-Cases — alles &uuml;ber NDA geschützt." />
        )}

        {!loading && error && (
          <FallbackNotice message="Cases werden gerade aktualisiert. Schau gleich nochmal vorbei." />
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((c, i) => (
              <CaseCard key={c.key} caseData={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────── Section 4: CTA ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 lg:px-16 py-24" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center bg-[#15161A] border border-white/10 p-10 md:p-16"
      >
        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
          Willst du auch ein <span className="text-gradient font-medium">Live-Case</span> werden?
        </h2>
        <p className="text-[#A1A1AA] mb-10 max-w-lg mx-auto">
          Starte mit einem Audit. Wir schauen uns dein Setup an und zeigen dir, wo Automatisierung
          den gr&ouml;&szlig;ten Hebel hat.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <a href="/#/audit" className="btn-primary">
            Audit starten
            <ArrowRight size={16} className="ml-2" />
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle size={16} className="mr-2" />
            Direkt schreiben
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function Cases() {
  return (
    <div className="bg-[#0B0C10] min-h-screen">
      <HeroSection />
      <ClientZeroSection />
      <MoreCasesSection />
      <CTASection />
    </div>
  );
}

