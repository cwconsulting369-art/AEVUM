import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Settings2,
  Zap,
  FileText,
  User,
  Building2,
  Lock,
  Globe,
  ShieldCheck,
  Bot,
  GitBranch,
  BarChart3,
  Mail,
  Phone,
  MousePointerClick,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Upload,
  Clock,
  Target,
  Wrench,
  Wallet,
  CalendarClock,
  Users,
  Briefcase,
} from 'lucide-react';
import CONTACT from '../config/contact';
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
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mb-6"
        >
          <span className="text-gradient font-medium">AEVUM</span> entwickelt
          <span className="block mt-2 text-gradient font-medium">
            individuelle KI-Betriebssysteme
          </span>
          fuer Unternehmen
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#a4a4ad] max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Mit klarer Analyse, passendem Setup, laufender Optimierung und einer
          Deal-Struktur, die zum Wachstum des Kunden passt.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-lg">
            <a href="#/audit" className="btn-primary flex items-center justify-center gap-2 sm:flex-1">
              Audit starten
            </a>
            <a href="#/method" className="btn-secondary flex items-center justify-center gap-2 sm:flex-1">
              Wie wir arbeiten
            </a>
          </div>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#a4a4ad] hover:text-[#e0a458] underline-offset-4 hover:underline transition-colors"
          >
            <MessageCircle size={14} />
            Direkt schreiben
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#7a7a85] font-mono mt-6"
        >
          <span>Deutsch</span>
          <span className="hidden sm:inline">|</span>
          <span>DSGVO</span>
          <span className="hidden sm:inline">|</span>
          <span>Massgeschneidert</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-[#e0a458]"
          />
        </div>
      </motion.div>
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
    <section className="section-padding px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
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
              className={`bg-[#111116] border border-white/10 hover:border-[#e0a458]/30 transition-all p-8 lg:p-10 ${
                step.isCTA ? 'border-[#e0a458]/40' : ''
              }`}
            >
              <div className="flex items-start gap-6">
                <span className="font-mono text-sm text-[#7a7a85] shrink-0 mt-1">
                  {step.num}
                </span>
                <div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#e0a458] mb-3 block">
                    {step.tag}
                  </span>
                  <p className="text-base md:text-lg leading-relaxed text-[#F9FAFB]">
                    {step.text}
                  </p>
                  {step.isCTA && (
                    <a
                      href="#/audit"
                      className="btn-primary inline-flex items-center gap-2 mt-6"
                    >
                      Audit starten <ArrowRight size={18} />
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
    <section className="section-padding px-6 lg:px-16 bg-[#111116]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
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
              className="bg-[#08080a] p-8 lg:p-10 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1"
            >
              <p.icon size={32} className="text-[#e0a458] mb-6" />
              <h3 className="font-mono text-sm uppercase tracking-[0.1em] text-[#e0a458] mb-3">
                {p.name}
              </h3>
              <p className="text-lg text-[#F9FAFB] font-medium mb-6">{p.pitch}</p>
              <ul className="space-y-3">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-[#a4a4ad]">
                    <span className="text-[#e0a458] mt-0.5 shrink-0">-</span>
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
    <section className="section-padding px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
            Bausteine
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Module die zu deinem Setup andocken
          </h2>
          <p className="text-[#a4a4ad] text-lg max-w-2xl leading-relaxed">
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
              className="bg-[#111116] p-8 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1 group"
            >
              <m.icon
                size={28}
                className="text-[#a4a4ad] group-hover:text-[#e0a458] transition-colors mb-4"
              />
              <h3 className="text-lg font-medium mb-2">{m.name}</h3>
              <p className="text-sm text-[#a4a4ad] leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 5: Was du bekommst ──────────────────────── */

function WhatYouGetSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const items = [
    {
      icon: LayoutDashboard,
      title: 'AEVUM-OS Dashboard',
      desc: 'Dein zentrales Kommandozentrum. KPIs, Workflows, Reports — alles an einem Ort.',
    },
    {
      icon: Bot,
      title: 'Personal Assistant Agent',
      desc: 'Ein KI-Agent, der dein Business versteht. Verfuegbar via Chat, rund um die Uhr.',
    },
    {
      icon: GitBranch,
      title: 'Workflow-Orchestration',
      desc: 'Automatisierte Prozesse, die Daten verbinden und manuelle Arbeit eliminieren.',
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16 bg-[#111116]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
            Lieferumfang
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Was du bekommst
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#08080a] p-8 lg:p-10 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1"
            >
              <item.icon size={32} className="text-[#e0a458] mb-6" />
              <h3 className="text-xl font-medium mb-4">{item.title}</h3>
              <p className="text-sm text-[#a4a4ad] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
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
      story: 'Immobilien-Lead-System mit CRM-Integration.',
      share_logo: false,
      share_company_name: false,
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
            Live-Cases
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Echte Projekte, ehrlich dokumentiert
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCases.map((c, i) => (
            <motion.div
              key={c.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#111116] p-8 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e0a458] to-[#a86d27] flex items-center justify-center text-black font-bold text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="font-medium">{c.name}</h3>
                  {c.share_industry && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#e0a458]">
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
                <p className="text-sm text-[#a4a4ad] leading-relaxed">{c.story}</p>
              )}

              {!c.share_company_name && c.share_industry && (
                <p className="text-sm text-[#a4a4ad] leading-relaxed">
                  Projekt laeuft — Details auf Anfrage.
                </p>
              )}
            </motion.div>
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
            className="inline-flex items-center gap-2 text-sm text-[#a4a4ad] hover:text-[#e0a458] transition-colors"
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

  const models = [
    {
      label: 'Modell A',
      name: 'Setup + Standard-Retainer',
      desc: 'Standard-Weg fuer Kunden mit Budget. Volles Setup, monatlicher Retainer fuer laufende Optimierung.',
    },
    {
      label: 'Modell B',
      name: 'Reduced-Setup + Hoeherer Retainer',
      desc: 'Cashflow-freundlich. Geringere Setup-Kosten dafuer etwas hoeherer monatlicher Retainer.',
    },
    {
      label: 'Modell C',
      name: 'Minimal-Setup + Retainer + Revenue-Share',
      desc: 'Fuer Wachstums-Cases mit low budget. Wir teilen das Risiko und den Erfolg.',
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16 bg-[#111116]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
            Investment
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Jedes Setup wird individuell kalkuliert
          </h2>
          <p className="text-[#a4a4ad] text-lg max-w-2xl leading-relaxed">
            Setup-Fee + Retainer + optional Revenue-Share. Abhaengig von
            Komplexitaet, Datenlage, Zielbild und Wachstumspotenzial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {models.map((m, i) => (
            <motion.div
              key={m.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#08080a] p-8 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1"
            >
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-3 block">
                {m.label}
              </span>
              <h3 className="text-lg font-medium mb-4">{m.name}</h3>
              <p className="text-sm text-[#a4a4ad] leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#/audit"
            className="btn-primary inline-flex items-center gap-2"
          >
            Im Audit-Call klaeren wir das passende Modell <ArrowRight size={18} />
          </a>
        </motion.div>
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
    <section className="section-padding px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
            Vertrauen
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Transparent. Deutsch. DSGVO.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {badges.map((b, i) => (
            <motion.div
              key={b.text}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#111116] p-8 border border-white/10 hover:border-[#e0a458]/30 transition-all hover:-translate-y-1 text-center"
            >
              <b.icon size={32} className="text-[#e0a458] mx-auto mb-4" />
              <p className="text-sm text-[#a4a4ad] leading-relaxed">{b.text}</p>
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
            <p className="font-mono text-xs text-[#a4a4ad] uppercase tracking-wider">
              Founder
            </p>
          </div>
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
      a: 'Du behaeltst jederzeit die volle Kontrolle. Wir arbeiten mit Read-only API-Keys und speichern keine sensitiven Daten.',
    },
    {
      q: 'Kann ich das System spaeter selbst uebernehmen?',
      a: 'Ja. Alle Workflows sind dokumentiert und exportierbar. Kein Vendor-Lock.',
    },
    {
      q: 'Was ist mit Tool-Lizenz-Kosten?',
      a: 'Tool-Kosten werden mit 2x Multiplier weitergegeben. Das ist unsere Margin-Pflicht und sichert transparente Kalkulation.',
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
    <section className="section-padding px-6 lg:px-16 bg-[#111116]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-4 block">
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
                className="bg-[#08080a] border border-white/10 px-6"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-medium py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#a4a4ad] leading-relaxed pb-5">
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
      className="min-h-[60vh] flex items-center justify-center px-6 relative"
      ref={ref}
    >
      <div className="absolute inset-0 opacity-30">
        <ParticleCanvas />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
          Bereit, dein
          <span className="block text-gradient mt-2">Operating-System aufzubauen?</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 mt-10">
          <a
            href="#/audit"
            className="btn-primary flex items-center gap-2"
          >
            Audit starten <ArrowRight size={18} />
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar size={18} />
            Call buchen
          </a>
        </div>

        <p className="font-mono text-xs text-[#7a7a85]">
          Deutsch · DSGVO · Massgeschneidert
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Home Page ──────────────────────── */

export default function Home() {
  return (
    <div className="bg-[#08080a]">
      <HeroSection />
      <ThesisSection />
      <PillarsSection />
      <ModulesSection />
      <WhatYouGetSection />
      <CasesSection />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
