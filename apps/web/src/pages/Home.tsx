import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  Globe,
  Users,
  FileText,
  Cpu,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  Zap,
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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

/* ──────────────────────── Section 1: Hero ──────────────────────── */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    const COUNT = Math.min(120, Math.floor((w * h) / 12000));

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
            ? `rgba(245, 158, 11, ${p.alpha})`
            : `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      // Draw subtle connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
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
      <ParticleCanvas />
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mb-6"
        >
          KI-Systeme, die
          <span className="block mt-2 text-gradient font-medium">
            komplett funktionieren
          </span>
          — nicht halb.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Wir bauen vollständige AI-Systeme für Unternehmen, die wachsen wollen.
          Ehrlich gepreist, ohne Bullshit-Statistiken, mit klarem Festpreis.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/5 text-[#F59E0B] text-xs md:text-sm font-mono tracking-wider uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          Pilot-Programm 2026 · −30 % für die ersten 10 Kunden
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Jetzt schreiben
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
            className="w-1 h-2 rounded-full bg-[#F59E0B]"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Section 2: Problem ──────────────────────── */

function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Clock, value: 'Manuell', label: 'wiederkehrende Aufgaben' },
    { icon: Zap, value: 'Verteilt', label: 'Tools ohne gemeinsame Datenbasis' },
    { icon: Target, value: 'Lokal', label: 'Optimierung statt System-Sicht' },
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
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Das Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Zeit und Geld versickern
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl leading-relaxed">
            Was wir in nahezu jedem Pitch sehen: viele wiederkehrende Aufgaben werden manuell
            erledigt, Tools sind nicht verbunden, Daten leben in Insellösungen. Nicht weil
            niemand sich kümmert — sondern weil eine durchgehende Systemarchitektur fehlt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#15161A] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1"
            >
              <stat.icon size={28} className="text-[#F59E0B] mb-4" />
              <p className="text-4xl md:text-5xl font-light text-[#F9FAFB] mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-[#A1A1AA]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 3: Strategic Narrative ──────────────────────── */

function NarrativeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const cards = [
    {
      tag: 'Die Hypothese',
      title: 'Mehr Budget = mehr Effizienz',
      desc: 'Viele glauben, dass mehr Investition automatisch bessere Ergebnisse bringt. Aber Budget allein löst keine strukturellen Probleme.',
      border: 'border-l-[#F59E0B]',
    },
    {
      tag: 'Die Anti-These',
      title: 'Billige Tools kosten mehr als sie nutzen',
      desc: 'Kostenlose oder günstige Einzeltools erzeugen Fragmentierung. Jedes neue Tool bedeutet mehr Komplexität, nicht mehr Produktivität.',
      border: 'border-l-[#D97706]',
    },
    {
      tag: 'Die Diagnose',
      title: 'Fehlendes System-Denken',
      desc: 'Der wahre Engpass ist nicht das Budget — es ist das Fehlen einer durchgängigen Systemarchitektur, die alle Prozesse verbindet.',
      border: 'border-l-[#F59E0B]',
    },
    {
      tag: 'Der Mechanismus',
      title: 'Vollständige Systeme statt halber Lösungen',
      desc: 'Wir bauen integrierte KI-Systeme, die von der ersten Kundenberührung bis zur Nachverfolgung nahtlos zusammenarbeiten.',
      border: 'border-l-[#F59E0B]',
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Die Strategie
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Warum die meisten KI-Projekte scheitern
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.tag}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`bg-[#0B0C10] p-8 border ${card.border} border-l-4 border-y-0 border-r-0 hover:-translate-y-1 transition-all duration-300`}
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#52525B] mb-3 block">
                {card.tag}
              </span>
              <h3 className="text-lg font-medium mb-3 leading-snug">{card.title}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 4: Services ──────────────────────── */

function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const services = [
    {
      num: '01',
      title: 'Intelligent Web Systems',
      desc: 'High-performance, conversion-fokussierte digitale Plattformen, die Besucher in Kunden verwandeln.',
      icon: Globe,
      price: 'ab 3.000 €',
      path: '/services/websites',
    },
    {
      num: '02',
      title: 'Autonomous Lead Generation',
      desc: 'Maschinengesteuerte Outbound-Systeme, die skalieren — ohne zusätzliche Headcount.',
      icon: Users,
      price: 'ab 2.500 €/Mo',
      path: '/services/lead-generation',
    },
    {
      num: '03',
      title: 'Content Workflows',
      desc: 'Ein Input, endlose hochwertige Outputs. Vollautomatisierte Content-Pipelines.',
      icon: FileText,
      price: 'ab 1.500 €/Mo',
      path: '/services/content-workflows',
    },
    {
      num: '04',
      title: 'Evolving AI Automations',
      desc: 'Prozesse, die lernen, sich anpassen und täglich verbessern — ohne manuelles Zutun.',
      icon: Cpu,
      price: 'ab 2.000 €',
      path: '/services/ai-automation',
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
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Services
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Unsere KI-Systeme
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <a
                href={"#" + svc.path}
                className="block bg-[#15161A] p-8 lg:p-10 border-t border-[#D97706] hover:border-[#F59E0B] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="font-mono text-sm text-[#52525B]">{svc.num}</span>
                  <svc.icon
                    size={24}
                    className="text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors"
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-medium mb-3">{svc.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{svc.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#F59E0B]">{svc.price}</span>
                  <span className="flex items-center gap-1 text-sm text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors">
                    Details <ArrowRight size={14} />
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 5: Proof (Cases) ──────────────────────── */

function ProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Pilot-Cases — aktive 2026er Phase. Endgültige KPIs werden nach 90 Tagen
  // Laufzeit transparent dokumentiert. Wir vermeiden absolute Zahlen-Claims
  // solange wir noch in der Auswertungsphase sind.
  const cases = [
    {
      name: 'Kevin',
      company: 'Ketolabs',
      industry: 'E-Commerce',
      kpi: '6 AI Agents',
      desc: 'KI-Agenten-Stack für Performance-Marketing und Funnel — laufender Pilot, KPI-Reporting in Vorbereitung.',
    },
    {
      name: 'Tim',
      company: 'Personal Brand',
      industry: 'Personal Brand',
      kpi: 'Content-Pipeline',
      desc: 'Automatisierter Content-Workflow von Idee bis Publishing — Pilot-Phase 2026.',
    },
    {
      name: 'Patrick',
      company: 'Immobilien',
      industry: 'Real Estate',
      kpi: 'Lead + CRM-Setup',
      desc: 'Anfrage-, Website- und CRM-System — Setup ausgeliefert, Lead-Volumen-Reporting läuft an.',
    },
    {
      name: 'Miguel',
      company: 'UtilityHub',
      industry: 'Energie-Dienstleistung',
      kpi: 'Tech-Partner',
      desc: 'Technischer Partner für UtilityHub — Infrastruktur, DSGVO-Stack, Datenintegration.',
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16 bg-[#15161A]" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Aktive Pilot-Cases
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Vier laufende Projekte, ehrlich dokumentiert
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-2xl mx-auto leading-relaxed mt-4">
            Wir sind 2026 mit den ersten Kunden in der Pilot-Phase. Statt
            ausgedachter Statistiken zeigen wir den realen Stand — finale KPIs
            werden nach 90 Tagen Laufzeit transparent dokumentiert.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="bg-[#0B0C10] p-8 border border-white/10 hover:border-[#F59E0B]/30 transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-black font-bold text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="font-medium">{c.name}</h3>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#F59E0B]">
                    {c.industry}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-light text-gradient">{c.kpi}</p>
                <p className="text-xs text-[#52525B] font-mono uppercase tracking-wider mt-1">
                  Pilot-Phase 2026
                </p>
              </div>

              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{c.desc}</p>

              <a
                href="#/cases"
                className="inline-flex items-center gap-1 text-sm text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors"
              >
                Full Case lesen <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 6: Packages ──────────────────────── */

function PackagesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const packages = [
    {
      tier: 'S',
      name: 'Start',
      price: '2.000 – 4.000 €',
      period: 'einmalig',
      features: [
        'Deep-dive Workflow Audit',
        'Automatisierungs-Roadmap',
        '3–5 Projektplan',
        'Priorisierungs-Matrix',
      ],
      cta: 'Audit buchen',
      highlighted: false,
    },
    {
      tier: 'M',
      name: 'Wachstum',
      price: '5.000 – 15.000 €',
      period: 'einmalig',
      features: [
        '1–2 Use Cases (Lead-Qual, Support, Content)',
        'Vollständige Implementation',
        'Integration mit bestehenden Tools',
        '6–8 Wochen Lieferzeit',
        '3 Monate Support',
      ],
      cta: 'Loslegen',
      highlighted: true,
    },
    {
      tier: 'L',
      name: 'Skalierung',
      price: '2.000 – 5.000 €',
      period: '/ Monat',
      features: [
        'Laufende Überwachung & Optimierung',
        'Monatliche Performance-Reports',
        'Dedizierter Support',
        'Neue Use Cases on-demand',
        'Prioritäts-Entwicklung',
      ],
      cta: 'Skalieren',
      highlighted: false,
    },
  ];

  return (
    <section className="section-padding px-6 lg:px-16" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-4 block">
            Investment
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            Wähle dein Paket
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-2xl mx-auto leading-relaxed">
            Festpreise. Was du siehst zahlst du. Upsells sind optional und nie versteckt.
            Die ersten 10 Pilot-Kunden bekommen 30 % Rabatt — im Tausch gegen ehrliches
            Feedback und Veröffentlichung als Case nach 90 Tagen Laufzeit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.tier}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`relative p-8 lg:p-10 border ${
                pkg.highlighted
                  ? 'bg-[#15161A] border-[#F59E0B]/40 scale-[1.02]'
                  : 'bg-[#15161A] border-white/10 hover:border-[#F59E0B]/20'
              } transition-all hover:-translate-y-1`}
            >
              {pkg.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-black text-[0.65rem] font-mono uppercase tracking-wider px-4 py-1">
                  Empfohlen
                </span>
              )}

              <div className="mb-6">
                <span className="font-mono text-3xl font-light text-[#F59E0B]">{pkg.tier}</span>
                <h3 className="text-xl font-medium mt-2">{pkg.name}</h3>
              </div>

              <div className="mb-8">
                <p className="text-3xl font-light">{pkg.price}</p>
                <p className="text-sm text-[#52525B] font-mono">{pkg.period}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                    <TrendingUp size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center block ${
                  pkg.highlighted ? 'btn-primary' : 'btn-secondary'
                } py-3 text-sm`}
              >
                {pkg.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Section 7: Final CTA ──────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      className="min-h-screen flex items-center justify-center px-6 relative"
      ref={ref}
    >
      {/* Subtle particle overlay */}
      <div className="absolute inset-0 opacity-30">
        <ParticleCanvas />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-6 block">
          Der nächste Schritt
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
          Bereit für dein
          <span className="block text-gradient mt-2">AI-System?</span>
        </h2>
        <p className="text-[#A1A1AA] text-lg mb-4 max-w-xl mx-auto">
          Buch einen kostenlosen Strategy Call. Wir analysieren deine Prozesse
          und zeigen dir den exakten Fahrplan zu deinem KI-System.
        </p>
        <p className="text-[#F59E0B] text-sm font-mono uppercase tracking-wider mb-10">
          Pilot-Programm 2026 · noch Plätze frei mit −30 %
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Jetzt schreiben
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

        <p className="font-mono text-xs text-[#52525B]">
          Durchschnittliche Deployment-Zeit: 6–8 Wochen
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── Home Page ──────────────────────── */

export default function Home() {
  return (
    <div className="bg-[#0B0C10]">
      <HeroSection />
      <ProblemSection />
      <NarrativeSection />
      <ServicesSection />
      <ProofSection />
      <PackagesSection />
      <CTASection />
    </div>
  );
}
