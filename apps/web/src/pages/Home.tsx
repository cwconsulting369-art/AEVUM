import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Settings2,
  Zap,
  FileText,
  Lock,
  Globe,
  ShieldCheck,
  BarChart3,
  Mail,
  MousePointerClick,
  Check,
  X as XIcon,
  Target,
  Users,
  ShoppingBag,
  Handshake,
} from 'lucide-react';
import CONTACT from '../config/contact';
import { usePageSeo } from '@/hooks/use-page-seo';
import PathThreeCard from '@/components/ctas/PathThreeCard';
import TrustpilotWidget from '@/components/TrustpilotWidget';
import TrustpilotReviews from '@/components/TrustpilotReviews';
import { AuroraBg, TiltCard, Magnetic, NumberCounter, Spotlight } from '@/components/showcase-fx';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

/* ──────────────────────── Animation helpers ──────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion — skip animation entirely
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    // Mobile: hard cap 40 (was 120). Reduces O(n^2) connect-line loop ~9x on phones.
    const MAX = isMobile ? 40 : 120;
    const COUNT = Math.min(MAX, Math.floor((w * h) / (isMobile ? 18000 : 12000)));

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / w;
      mouseRef.current.y = e.clientY / h;
    };
    window.addEventListener('mousemove', onMouse);

    // Pause RAF when tab not visible — saves CPU/battery
    let visible = true;
    const onVisibility = () => {
      const wasHidden = !visible;
      visible = !document.hidden;
      if (visible && wasHidden && !rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const tiltX = (mouseRef.current.y - 0.5) * 0.05;
      const tiltY = (mouseRef.current.x - 0.5) * 0.05;

      for (const p of particles) {
        p.x += p.vx + tiltY * 0.5;
        p.y += p.vy + tiltX * 0.5;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          Math.random() > 0.7
            ? `rgba(224, 164, 88, ${p.alpha})`
            : `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(224, 164, 88, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // P1-Fix: defer first draw to idle — frees main-thread for LCP paint (~1.3s recovered)
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    };
    const win = window as IdleWindow;
    let idleHandle: number | null = null;
    let fallbackTimer: number | null = null;
    if (typeof win.requestIdleCallback === 'function') {
      idleHandle = win.requestIdleCallback(() => { draw(); }, { timeout: 1500 });
    } else {
      fallbackTimer = window.setTimeout(() => { draw(); }, 800);
    }

    return () => {
      if (idleHandle !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(idleHandle);
      }
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ perspective: '800px' }}
    />
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mesh-bg" aria-hidden />
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden />
      <ParticleCanvas />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.a
          href="#/waitlist"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-theme-accent mb-6 border border-theme-border-accent bg-theme-accent-soft hover:bg-theme-accent-soft px-3 py-1.5 transition-colors"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
          Pre-Launch · Early-Access-Liste eintragen →
        </motion.a>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mb-6"
        >
          Wir bauen das KI-System,
          <span className="block mt-2 text-gradient font-medium">
            das dein Unternehmen in 90 Tagen
          </span>
          <span className="block mt-1">unabhaengig macht.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Fuer Unternehmer, die KI richtig einsetzen wollen — nicht einfach nur ausprobieren.
          Weniger manuelle Arbeit. Mehr Output. Klare Ergebnisse.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-lg">
            <a href="#/audit" className="btn-primary flex items-center justify-center gap-2 sm:flex-1">
              Kostenlosen Audit buchen
            </a>
            <a href="#/method" className="btn-secondary flex items-center justify-center gap-2 sm:flex-1">
              Wie wir arbeiten
            </a>
          </div>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent underline-offset-4 hover:underline transition-colors"
          >
            <MessageCircle size={14} />
            Direkt schreiben
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-text-muted font-mono mt-6"
        >
          <span>Agenturen</span>
          <span className="hidden sm:inline">·</span>
          <span>Personal Brands</span>
          <span className="hidden sm:inline">·</span>
          <span>Mittelstand</span>
          <span className="hidden sm:inline">|</span>
          <span>DSGVO-konform</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border border-theme-border-strong flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-theme-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Section 1b: 3 Wege mit AEVUM (Shop/SaaS/Audit) ──────────────────────── */

const THREE_PATHS = [
  {
    icon: ShoppingBag,
    title: 'Shop',
    subtitle: 'Blueprint kaufen & selbst deployen',
    pricing: 'ab €97 · sofort',
    description: 'n8n-Workflows + PDF + Prompts. Mit oder ohne Account.',
    cta: 'Shop ansehen',
    href: '#/shop',
    tone: 'primary' as const,
  },
  {
    icon: Zap,
    title: 'SaaS-Tools',
    subtitle: 'AI-Tools pro Run nutzen',
    pricing: 'ab €3 / Run',
    description: 'Script-Factory, DSGVO-Factory & mehr. Pay-per-Use mit Credits.',
    cta: 'Tools entdecken',
    href: '#/saas',
    tone: 'secondary' as const,
  },
  {
    icon: Handshake,
    title: 'Full-Partnership',
    subtitle: 'Audit → maßgeschneidertes System',
    pricing: 'kostenloses Audit',
    description: 'Personal-Agent · eigenes Dashboard · SaaS-Free-Kontingent. Langfristige Partnerschaft.',
    cta: 'Audit starten',
    href: '#/audit',
    tone: 'premium' as const,
  },
];

const toneStyles: Record<'primary' | 'secondary' | 'premium', {
  border: string;
  iconBg: string;
  iconColor: string;
  pricingColor: string;
  badge?: string;
}> = {
  primary: {
    border: 'border-theme-border hover:border-theme-border-accent',
    iconBg: 'bg-theme-accent-soft',
    iconColor: 'text-theme-accent',
    pricingColor: 'text-theme-accent',
  },
  secondary: {
    border: 'border-theme-border hover:border-theme-border-accent',
    iconBg: 'bg-bg-elevated',
    iconColor: 'text-text-primary',
    pricingColor: 'text-theme-accent',
  },
  premium: {
    border: 'border-theme-border-accent hover:border-theme-accent bg-gradient-to-br from-theme-accent-soft to-transparent',
    iconBg: 'bg-gradient-to-br from-[#e0a458] to-[#a86d27]',
    iconColor: 'text-black',
    pricingColor: 'text-theme-accent',
    badge: 'Premium',
  },
};

function ThreePathsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24 bg-bg-primary" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-4 block">
            Drei Wege
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            So arbeitest du mit AEVUM
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Kauf was du brauchst, nutz Tools pro Run, oder lass uns dein komplettes System bauen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {THREE_PATHS.map((p, i) => {
            const s = toneStyles[p.tone];
            const Icon = p.icon;
            return (
              <motion.a
                key={p.title}
                href={p.href}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative bg-bg-surface border ${s.border} p-6 sm:p-7 md:p-8 transition-all flex flex-col hover:-translate-y-1`}
              >
                {s.badge && (
                  <span className="absolute top-4 right-4 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-theme-accent bg-theme-accent-soft border border-theme-border-accent px-2 py-0.5">
                    {s.badge}
                  </span>
                )}

                <div className={`w-12 h-12 rounded-lg ${s.iconBg} flex items-center justify-center mb-5`}>
                  <Icon size={22} className={s.iconColor} />
                </div>

                <h3 className="text-2xl font-medium text-text-primary mb-1.5">{p.title}</h3>
                <p className="text-sm text-text-secondary mb-4 leading-snug">{p.subtitle}</p>

                <p className={`font-mono text-xs uppercase tracking-[0.1em] ${s.pricingColor} mb-4`}>
                  {p.pricing}
                </p>

                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                  {p.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-medium text-theme-accent group-hover:gap-3 transition-all mt-auto">
                  {p.cta}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 1c: Account-Vorteile-Vergleich ──────────────────────── */

const ACCOUNT_FEATURES = [
  { feature: 'Blueprint-Kauf', gast: true, shop: true, saas: true, full: true },
  { feature: 'Credits sammeln (10 ¢ / €)', gast: false, shop: true, saas: true, full: true },
  { feature: 'Stempelkarte (5 → 1 gratis)', gast: false, shop: true, saas: true, full: true },
  { feature: 'SaaS-Tools nutzen', gast: false, shop: false, saas: true, full: 'inkl. Free-Kontingent' as const },
  { feature: 'Personal AI-Agent', gast: false, shop: false, saas: false, full: true },
  { feature: 'Eigenes Dashboard', gast: false, shop: false, saas: false, full: true },
  { feature: 'AEVUM Founder-Community', gast: false, shop: false, saas: false, full: true },
];

const TIER_HEADERS = [
  { key: 'gast', label: 'Gast', sub: 'ohne Account' },
  { key: 'shop', label: 'Shop-Account', sub: 'kostenlos' },
  { key: 'saas', label: 'SaaS-Account', sub: 'kostenlos' },
  { key: 'full', label: 'Full-Partnership', sub: 'nach Audit', highlight: true },
] as const;

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check size={18} className="text-theme-accent mx-auto" />;
  }
  if (value === false) {
    return <XIcon size={16} className="text-text-muted mx-auto" />;
  }
  return (
    <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-theme-accent leading-tight">
      {value}
    </span>
  );
}

function AccountBenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 md:py-24 bg-bg-primary" ref={ref}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-theme-accent mb-4 block">
            Account-Vorteile
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            Mit AEVUM-Account: mehr rausholen
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Account ist gratis. Jeder Schritt schaltet mehr frei.
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="hidden md:block bg-bg-surface border border-theme-border overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="text-left p-5 text-xs font-mono uppercase tracking-[0.1em] text-text-secondary w-[34%]">
                  Feature
                </th>
                {TIER_HEADERS.map((t) => (
                  <th
                    key={t.key}
                    className={`text-center p-5 ${t.highlight ? 'bg-theme-accent-soft' : ''}`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        t.highlight ? 'text-theme-accent' : 'text-text-primary'
                      }`}
                    >
                      {t.label}
                    </div>
                    <div className="text-[0.65rem] font-mono uppercase tracking-[0.08em] text-text-muted mt-1">
                      {t.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_FEATURES.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`${i % 2 === 1 ? 'bg-bg-elevated' : ''} border-b border-theme-border last:border-b-0`}
                >
                  <td className="p-5 text-sm text-text-primary">{row.feature}</td>
                  <td className="p-5 text-center">
                    <Cell value={row.gast} />
                  </td>
                  <td className="p-5 text-center">
                    <Cell value={row.shop} />
                  </td>
                  <td className="p-5 text-center">
                    <Cell value={row.saas} />
                  </td>
                  <td className="p-5 text-center bg-theme-accent-soft">
                    <Cell value={row.full} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile: stacked cards per tier */}
        <div className="md:hidden space-y-5">
          {TIER_HEADERS.map((t, i) => (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`bg-bg-surface border ${
                t.highlight ? 'border-theme-border-accent' : 'border-theme-border'
              } p-5`}
            >
              <div className="mb-4">
                <h3 className={`text-base font-medium ${t.highlight ? 'text-theme-accent' : 'text-text-primary'}`}>
                  {t.label}
                </h3>
                <p className="text-[0.65rem] font-mono uppercase tracking-[0.08em] text-text-muted mt-0.5">
                  {t.sub}
                </p>
              </div>
              <ul className="space-y-2.5">
                {ACCOUNT_FEATURES.map((row) => {
                  const v = row[t.key as 'gast' | 'shop' | 'saas' | 'full'];
                  const enabled = v !== false;
                  return (
                    <li
                      key={row.feature}
                      className={`flex items-start gap-3 text-sm ${
                        enabled ? 'text-text-primary' : 'text-text-muted line-through'
                      }`}
                    >
                      {enabled ? (
                        <Check size={16} className="text-theme-accent shrink-0 mt-0.5" />
                      ) : (
                        <XIcon size={14} className="text-text-muted shrink-0 mt-1" />
                      )}
                      <span className="flex-1">
                        {row.feature}
                        {typeof v === 'string' && (
                          <span className="block text-[10px] font-mono uppercase tracking-[0.06em] text-theme-accent mt-0.5">
                            {v}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-xs text-text-muted font-mono mt-8"
        >
          Upgrade jederzeit möglich · Downgrade nicht nötig
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 2: Marketing-Thesis (7 Steps) ──────────────────────── */

function ThesisSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      num: '01',
      tag: 'PROBLEM',
      text: 'Unternehmen sammeln Tools wie Erweiterungs-Karten. CRM hier, Automations-Hub dort, AI-Spielzeug ueberall. Aber zwischen den Inseln verlaeuft sich die Arbeit: Daten doppelt gepflegt, Entscheidungen aus dem Bauch, Reports im Excel-Limbo.',
    },
    {
      num: '02',
      tag: 'HYPOTHESE',
      text: 'Viele glauben: noch ein Tool, noch ein Hire, dann wird\'s besser. Oder: "Wir machen jetzt was mit AI", dann sind wir auf dem Stand der Zeit.',
    },
    {
      num: '03',
      tag: 'ANTI-THESE',
      text: 'Mehr Werkzeuge in einer ungeordneten Werkstatt machen die Werkstatt nicht ordentlicher. AI ohne System wird zur teuren Spielerei. Die meisten "AI-Implementierungen" produzieren PowerPoint-Material, nicht Outcomes.',
    },
    {
      num: '04',
      tag: 'DIAGNOSE',
      text: 'Was fehlt, ist kein weiteres Tool. Was fehlt, ist ein Betriebssystem. Ein zentraler Layer, der Daten, Workflows und Entscheidungen orchestriert.',
    },
    {
      num: '05',
      tag: 'MECHANISMUS',
      text: 'AEVUM ist dieses Betriebssystem. In drei Schritten: Analyse → Setup → Run',
    },
    {
      num: '06',
      tag: 'BEWEIS',
      text: 'Wir bauen, was wir selbst nutzen. AEVUM laeuft auf uns selbst, bevor es zu dir kommt. Client Zero.',
    },
    {
      num: '07',
      tag: 'CTA',
      text: 'Starte mit einem Audit. 15-25 Fragen, ein Datei-Upload, ein automatisch generierter Pitch-Report.',
      isCTA: true,
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Die Story
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Warum die meisten KI-Projekte scheitern
          </h2>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`bg-bg-surface border border-theme-border hover:border-theme-border-accent transition-all p-6 sm:p-8 lg:p-10 ${
                step.isCTA ? 'border-theme-border-accent' : ''
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <span className="font-mono text-sm text-text-muted shrink-0 mt-1">
                  {step.num}
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-theme-accent mb-3 block">
                    {step.tag}
                  </span>
                  <p className="text-base md:text-lg leading-relaxed text-text-primary">
                    {step.text}
                  </p>
                  {step.isCTA && (
                    <a
                      href="#/audit"
                      className="btn-primary inline-flex items-center gap-2 mt-6"
                    >
                      Kostenlosen Audit buchen <ArrowRight size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Die 3 Saeulen ──────────────────────── */

function PillarsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const pillars = [
    {
      icon: LayoutDashboard,
      name: 'MONITORING',
      pitch: 'Du siehst jederzeit, was laeuft.',
      bullets: [
        'Dashboard mit Echtzeit-KPIs',
        'Woechentliche Reports',
        'Transparenz ueber alle Workflows',
      ],
    },
    {
      icon: Settings2,
      name: 'ANPASSUNG',
      pitch: 'System passt sich an dein Business an.',
      bullets: [
        'Workflows werden weiterentwickelt',
        'Tools getauscht wo besser',
        'Agent lernt mit',
      ],
    },
    {
      icon: TrendingUp,
      name: 'WACHSTUM',
      pitch: 'Wir bauen mit dir hoch, nicht fuer dich.',
      bullets: [
        'Neue Bausteine integriert',
        'Use Cases werden unlocked',
        'Skalierungs-Logik baked-in',
      ],
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Die drei Saeulen
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Was AEVUM ausmacht
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-primary p-6 sm:p-8 lg:p-10 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1"
            >
              <p.icon size={32} className="text-theme-accent mb-6" />
              <h3 className="font-mono text-sm uppercase tracking-[0.1em] text-theme-accent mb-3">
                {p.name}
              </h3>
              <p className="text-lg text-text-primary font-medium mb-6">{p.pitch}</p>
              <ul className="space-y-3">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-theme-accent mt-0.5 shrink-0">-</span>
                    {b}
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

/* ──────────────────────── Section 4: Bausteine-Visualisierung ──────────────────────── */

function ModulesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const modules = [
    {
      icon: MousePointerClick,
      name: 'Lead-Routing',
      desc: 'Automatisierte Verteilung von Leads basierend auf Qualitaet, Quelle und Verfuegbarkeit.',
    },
    {
      icon: Mail,
      name: 'Email-Automation',
      desc: 'Personalisierte Sequenzen, die zum richtigen Zeitpunkt ausgeloest werden.',
    },
    {
      icon: BarChart3,
      name: 'Reporting-Pipeline',
      desc: 'Zentrale Daten-Sicht statt verstreuter Excel-Reports.',
    },
    {
      icon: Users,
      name: 'CRM-Sync',
      desc: 'Zwei-Wege-Synchronisation zwischen allen Tools und deinem CRM.',
    },
    {
      icon: FileText,
      name: 'Content-Pipeline',
      desc: 'Von der Idee bis zum Publishing — automatisiert und skalierbar.',
    },
    {
      icon: Zap,
      name: 'Monitoring-Alerts',
      desc: 'Proaktive Benachrichtigungen bei Anomalien oder Engpaessen.',
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Bausteine
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Module die zu deinem Setup andocken
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Im Audit klaeren wir, welche bei dir Sinn machen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 group"
            >
              <m.icon
                size={28}
                className="text-text-secondary group-hover:text-theme-accent transition-colors mb-4"
              />
              <h3 className="text-lg font-medium mb-2">{m.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 5: Services ──────────────────────── */

function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const services = [
    {
      icon: Zap,
      tag: 'Fuer Agenturen + Personal Brands',
      title: 'Content- & Workflow-Automatisierung',
      desc: 'Wir automatisieren deine Content-Produktion, Briefing-Prozesse und internen Workflows — von der Idee bis zum Publishing. Dein Team arbeitet, ohne dass du jeden Schritt koordinieren musst.',
      result: 'Ziel-Range: ~8-15 Stunden manueller Arbeit pro Woche reduzieren (Schätzung basierend auf bisherigen Pilot-Setups, individuell unterschiedlich).',
    },
    {
      icon: Target,
      tag: 'Fuer alle drei Segmente',
      title: 'Lead-Qualifizierung + CRM-Automatisierung',
      desc: 'Kein Lead faellt mehr durchs Raster. Automatische Qualifizierung, CRM-Sync und Follow-up-Sequenzen — abgestimmt auf deinen Sales-Prozess.',
      result: 'Ziel: schnellere Reaktionszeit auf Leads + sauberer CRM-Status pro Kontakt. Konkrete Kennzahlen hängen vom bestehenden Sales-Prozess ab.',
    },
    {
      icon: BarChart3,
      tag: 'Fuer ambitionierte Mittelstaendler',
      title: 'KI-gestuetztes Reporting & Dashboard',
      desc: 'Ein zentrales Echtzeit-Dashboard fuer alle relevanten KPIs. Kein Excel-Export mehr, keine verstreuten Datenquellen. Entscheidungen auf Basis echter Zahlen — nicht aus dem Bauchgefuehl.',
      result: 'Ziel: zentrale Daten-Sicht statt verstreuter Reports. Genaue Zeit-Ersparnis hängt vom aktuellen Reporting-Aufwand ab.',
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Leistungen
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Drei Systeme. Konkrete Ergebnisse.
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Kein generischer AI-Hype. Jedes System wird auf dein Unternehmen zugeschnitten
            und liefert messbare Resultate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-primary p-6 sm:p-8 lg:p-10 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 flex flex-col"
            >
              <s.icon size={32} className="text-theme-accent mb-6" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-text-muted mb-3 block">
                {s.tag}
              </span>
              <h3 className="text-xl font-medium mb-4">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">{s.desc}</p>
              <div className="border-t border-theme-border pt-4">
                <p className="text-sm text-theme-accent font-mono">{s.result}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <a href="#/audit" className="btn-primary inline-flex items-center gap-2">
            Kostenlosen Audit buchen <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 6: Live-Cases ──────────────────────── */

function CasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const mockCases = [
    {
      name: 'Carlos',
      industry: 'AEVUM / Client Zero',
      share_industry: true,
      share_kpi_deltas: true,
      kpi_delta: 'System-Basis',
      story: 'Wir bauen, was wir selbst nutzen.',
      share_logo: false,
      share_company_name: true,
    },
    {
      name: 'Patrick',
      industry: 'Real Estate Thailand',
      share_industry: true,
      share_kpi_deltas: true,
      kpi_delta: 'Lead-Setup live',
      story: 'Lead-System mit CRM-Integration fuer internationales Immobilien-Business.',
      share_logo: false,
      share_company_name: false,
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Live-Cases
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Echte Projekte, ehrlich dokumentiert
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCases.map((c, i) => (
            <TiltCard key={c.name} intensity={6}>
            <motion.div
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e0a458] to-[#a86d27] flex items-center justify-center text-black font-bold text-lg shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium">{c.name}</h3>
                  {c.share_industry && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-theme-accent">
                      {c.industry}
                    </span>
                  )}
                </div>
              </div>

              {c.share_kpi_deltas && (
                <div className="mb-4">
                  <p className="text-3xl font-light text-gradient">{c.kpi_delta}</p>
                </div>
              )}

              {c.share_company_name && c.share_industry && (
                <p className="text-sm text-text-secondary leading-relaxed">{c.story}</p>
              )}

              {!c.share_company_name && c.share_industry && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  Projekt laeuft — Details auf Anfrage.
                </p>
              )}
            </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href="#/cases"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-theme-accent transition-colors"
          >
            Alle Cases <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 7: Pricing-Block ──────────────────────── */

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const trustSignals = [
    { icon: Lock, text: 'Kein Lock-in · Export-Pfad ab Tag 1' },
    { icon: ShieldCheck, text: '14 Tage Rückgaberecht für Verbraucher' },
    { icon: Globe, text: 'EU-Hosting (Supabase Frankfurt)' },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Investment
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Kein Standard-Paket. Kein Preisschild.
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed mx-auto">
            Dein System ist individuell — dein Angebot auch.
          </p>
        </motion.div>

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="bg-bg-primary border border-theme-border p-6 sm:p-10 lg:p-14 mb-10 max-w-3xl mx-auto"
        >
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
            Nach dem kostenlosen Audit analysieren wir gemeinsam:
          </p>
          <ul className="space-y-4 mb-10">
            {[
              'Was du brauchst (und was du nicht brauchst)',
              'Was das realistisch kostet',
              'Wann du den ROI siehst',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-text-primary">
                <ArrowRight size={16} className="text-theme-accent shrink-0 mt-1" />
                <span className="text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-theme-border pt-8 mb-10 space-y-3">
            <p className="text-sm text-text-muted font-mono uppercase tracking-[0.08em] mb-4">
              Typischer Rahmen
            </p>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="text-text-secondary text-sm sm:w-48 shrink-0">Setup einmalig</span>
              <span className="text-xl md:text-2xl font-light text-gradient">
                € 2.500 – 8.000
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="text-text-secondary text-sm sm:w-48 shrink-0">Monatliche Begleitung</span>
              <span className="text-xl md:text-2xl font-light text-gradient">
                € 700 – 2.500 / Monat
              </span>
            </div>
          </div>

          <a
            href="#/audit"
            className="btn-primary inline-flex items-center gap-2"
          >
            Audit buchen — kostenlos & unverbindlich <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {trustSignals.map((t, i) => (
            <motion.div
              key={t.text}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex items-center gap-3 bg-bg-primary border border-theme-border px-5 py-4"
            >
              <t.icon size={16} className="text-theme-accent shrink-0" />
              <span className="text-sm text-text-secondary">{t.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 8: Vertrauens-Layer ──────────────────────── */

function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const badges = [
    { icon: ShieldCheck, text: 'Deutsches Unternehmen, DSGVO-konform' },
    { icon: Lock, text: 'Aufgebaut auf bewaehrter Open-Source-Stack' },
    { icon: Globe, text: 'Keine Vendor-Locks. Du behaeltst die Kontrolle ueber deine Daten.' },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            Vertrauen
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Transparent. Deutsch. DSGVO.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {badges.map((b, i) => (
            <motion.div
              key={b.text}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-bg-surface p-6 sm:p-8 border border-theme-border hover:border-theme-border-accent transition-all hover:-translate-y-1 text-center"
            >
              <b.icon size={32} className="text-theme-accent mx-auto mb-4" />
              <p className="text-sm text-text-secondary leading-relaxed">{b.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex items-center gap-6 justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e0a458] to-[#a86d27] flex items-center justify-center text-black font-bold text-xl">
            C
          </div>
          <div>
            <p className="font-medium text-lg">Carlos Wrusch</p>
            <p className="font-mono text-xs text-text-secondary uppercase tracking-wider">
              Founder
            </p>
          </div>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-12 flex justify-center"
        >
          <TrustpilotWidget />
        </motion.div>

        {/* Block F3 (2026-05-25) — full Review-Cards Grid (placeholder mode bis Public-Launch) */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-16"
        >
          <TrustpilotReviews />
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 9: FAQ ──────────────────────── */

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const faqs = [
    {
      q: 'Was unterscheidet AEVUM von einer normalen AI-Agency?',
      a: 'AEVUM ist kein Service-Katalog. Wir bauen ein individuelles Betriebssystem fuer dein Unternehmen — mit Analyse, Setup und laufender Optimierung.',
    },
    {
      q: 'Wie lange dauert der Aufbau?',
      a: 'Typischerweise 4 bis 8 Wochen fuer das initiale Setup. Danach laeuft die laufende Optimierung im Retainer.',
    },
    {
      q: 'Was passiert nach dem Audit?',
      a: 'Du bekommst einen automatisch generierten Pitch-Report mit Analyse, Roadmap und Kostenschaetzung. Danach besprechen wir im Call die Details.',
    },
    {
      q: 'Behaltet ihr meine Daten?',
      a: 'Du behaeltst die Kontrolle. API-Keys werden AES-256-GCM-verschluesselt in deinem Account abgelegt und nie im Frontend gelesen. Wo immer moeglich nutzen wir Read-only-Scopes; bei Workflows die Schreibrechte brauchen, beschraenken wir den Scope auf das Minimum und dokumentieren das im Setup. Details siehe Datenschutzerklaerung.',
    },
    {
      q: 'Kann ich das System spaeter selbst uebernehmen?',
      a: 'Ja. Alle Workflows sind dokumentiert und exportierbar. Kein Vendor-Lock.',
    },
    {
      q: 'Was ist mit Tool-Lizenz-Kosten?',
      a: 'Wir kalkulieren Tool-Lizenzen transparent. Aktuell ueblich: Listenpreis + Faktor fuer Setup, Wartung und Support. Den konkreten Multiplikator besprechen wir im Audit, weil er stark vom Stack abhaengt.',
    },
    {
      q: 'Ihr seid in Deutschland? DSGVO?',
      a: 'Ja. AEVUM wird aus Augsburg gefuehrt. Alle Systeme sind DSGVO-konform konzipiert.',
    },
    {
      q: 'Ich habe schon ein Make/n8n-Setup — koennt ihr drauf aufbauen?',
      a: 'Ja. Im Audit analysieren wir deinen bestehenden Stack und bauen darauf auf.',
    },
  ];

  return (
    <section className="section-padding px-4 sm:px-6 lg:px-16 bg-bg-surface" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Haeufige Fragen
          </h2>
        </motion.div>

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-bg-primary border border-theme-border px-6"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-medium py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-secondary leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 10: Final CTA ──────────────────────── */

function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden"
      ref={ref}
    >
      <AuroraBg />
      <div className="absolute inset-0 opacity-30">
        <ParticleCanvas />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-10">
          Bereit, dein
          <span className="block text-gradient mt-2">Operating-System aufzubauen?</span>
        </h2>

        <PathThreeCard compact />

        <p className="font-mono text-xs text-text-muted mt-10">
          Deutsch · DSGVO · Maßgeschneidert
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Home Page ──────────────────────── */

export default function Home() {
  usePageSeo({
    title: 'AEVUM — Wir bauen das KI-System für DACH-Unternehmen | Operating-System',
    description: 'Custom-KI für Unternehmen die Daten ernst nehmen. Audit kostenlos in 48h → Auto-Plan → maßgeschneidertes System mit Personal-Agent. Anti-Buzzword. Messbar.',
    path: '/',
  });
  return (
    <div className="bg-bg-primary">
      <HeroSection />
      <ThreePathsSection />
      <AccountBenefitsSection />
      <ThesisSection />
      <PillarsSection />
      <ModulesSection />
      <ServicesSection />
      <CasesSection />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
