/**
 * /saas/script-factory — Dedicated Public Detail Page (Wave H2).
 *
 * Sektionen:
 *  1. Hero
 *  2. Wie es funktioniert (4-Step)
 *  3. Use-Cases (7 Cards)
 *  4. Demo-Output (Side-by-Side Mock)
 *  5. Pricing (Credit-Packages)
 *  6. Knowledge-Hubs
 *  7. FAQ
 *  8. Footer-CTA
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, Coins, ChevronDown,
  Phone, PhoneCall, Facebook, Search, Music2, ShoppingBag, Mic2,
  Upload, Settings, Cpu, FileCheck2, Library, LogIn, Zap,
} from 'lucide-react';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';
import { CREDIT_PACKAGES } from '@/data/saas-tools';
import SignupFlow from '@/components/saas/SignupFlow';

const PORTAL_BASE = 'https://app.aevum-system.de';

// ── Static content ─────────────────────────────────────────
const USE_CASES = [
  { slug: 'phone-script-cold',     name: 'Cold-Call',        icon: PhoneCall, example: 'Erstkontakt am Telefon, kaltakquise-ready.' },
  { slug: 'phone-script-followup', name: 'Follow-Up Phone',  icon: Phone,     example: 'Re-Engagement nach Erstkontakt oder Lead-Magnet.' },
  { slug: 'ad-copy-meta',          name: 'Meta Ad',          icon: Facebook,  example: 'Facebook/Instagram Performance-Ads.' },
  { slug: 'ad-copy-google',        name: 'Google Ad',        icon: Search,    example: 'Search-Ads + Responsive Display.' },
  { slug: 'ad-copy-tiktok',        name: 'TikTok Ad',        icon: Music2,    example: 'Hook-Story-Offer für TikTok.' },
  { slug: 'ecommerce-product',     name: 'E-Com Product',    icon: ShoppingBag, example: 'Produktbeschreibungen für Shopify/Amazon.' },
  { slug: 'sales-pitch',           name: 'Sales-Pitch',      icon: Mic2,      example: 'Closing-Pitches für Calls und Demos.' },
];

const STEPS = [
  { icon: Upload,    title: 'Skript hochladen', detail: 'Direkt einfügen oder Datei. Min 50 Zeichen.' },
  { icon: Settings,  title: 'Use-Case wählen',  detail: '7 Pipelines: Phone, Ad-Copy, E-Com, Sales-Pitch.' },
  { icon: Cpu,       title: 'Settings',         detail: 'Niche, ICP, Awareness, Brand-Tone (geführt).' },
  { icon: FileCheck2, title: 'AI-Run',           detail: '5-10 Varianten + A-F Grading + Differenzen.' },
];

const KNOWLEDGE_HUBS = [
  { slug: 'high-ticket-sales',  name: 'High-Ticket Sales',     desc: 'Phone-Skripte · B2B-Closing-Patterns',  badge: 'Live' },
  { slug: 'ecom-ad-copy',       name: 'E-Commerce Ad-Copy',    desc: 'DTC · Hook-Frameworks · Direct-Response', badge: 'Live' },
  { slug: 'aevum-default',      name: 'AEVUM Default',         desc: 'Allgemeine Best-Practices',             badge: 'Live' },
  { slug: 'custom',             name: 'Custom-Hub',            desc: 'Eigene Frameworks (für Vollkunden)',    badge: 'Soon' },
];

const FAQ = [
  { q: 'Was kostet ein Run?', a: '40 Credits pro Run — entspricht ca. 3,50 € im Growth-Paket. Credits verfallen nicht.' },
  { q: 'Welche Skript-Typen funktionieren?', a: '7 Use-Cases live: Cold-Call, Follow-Up Phone, Meta/Google/TikTok Ad-Copy, E-Commerce Product, Sales-Pitch. Markdown wird unterstützt.' },
  { q: 'Was ist das A-F-Grading?', a: 'Die Pipeline bewertet Vorher + Nachher auf 5 Dimensionen (Hook / Struktur / Spezifität / ICP-Match / CTA). Schulnoten A-F machen es schnell lesbar.' },
  { q: 'Sind meine Skripte privat?', a: 'Ja. EU-Hosting (Hetzner Falkenstein). Inputs werden zur Pipeline-Verarbeitung genutzt, nicht für AI-Training. Du kannst Runs jederzeit löschen.' },
  { q: 'Was wenn ich mehr Varianten brauche?', a: 'Slider erlaubt 3–10 Varianten pro Run. Mehr? Einfach neuen Run mit Adjustments starten (Re-Run-Discount in Planung).' },
  { q: 'Was passiert mit meinen Skripten nach Run?', a: 'Bleiben in deinem Portal-History (DSGVO-konform, EU). Du kannst alles als Markdown oder PDF exportieren.' },
  { q: 'Multi-Customer-Mode für Agenturen?', a: 'Ja — Power-User können Customer-Profiles speichern (Brand-Voice, ICP, Platforms). Die Pipeline nutzt das automatisch pro Run.' },
];

// ── Component ────────────────────────────────────────────
export default function SaasScriptFactory() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'growth' | 'pro' | undefined>(undefined);

  usePageSeo({
    title: 'Script-Factory · Skripte rein, optimierte Skripte raus — AEVUM',
    description: 'AI-Pipeline für Phone-Scripts, Ad-Copy und E-Commerce. A-F Grading, Vorher-Nachher-Vergleich, 5-10 Varianten pro Run. Knowledge-Hubs.',
    path: '/saas/script-factory',
  });

  useEffect(() => {
    track('saas_tool_view', { tool: 'script-factory', status: 'live' });
  }, []);

  function openSignup(pkg?: 'starter' | 'growth' | 'pro') {
    setSelectedPackage(pkg);
    setSignupOpen(true);
    track('saas_tool_signup_open', { tool: 'script-factory', package: pkg || 'none' });
  }

  return (
    <div className="min-h-screen bg-black text-text-primary">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <a href="#/saas" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-primary/50 hover:text-[#e0a458] transition-colors">
          <ArrowLeft size={13} /> Alle SaaS-Tools
        </a>
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-10 pb-14 md:pt-12 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-400/10 border-emerald-400/25 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-primary/40">Content · AI-Pipeline</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-text-primary mb-5">
              Script-Factory
            </h1>
            <p className="text-lg md:text-xl text-text-primary/75 leading-relaxed mb-3 max-w-3xl font-light">
              Skripte rein, optimierte Skripte raus — mit A-F-Grading.
            </p>
            <p className="text-base text-text-primary/55 leading-relaxed mb-8 max-w-3xl">
              AI-Pipeline für Phone-Scripts, Ad-Copy und E-Commerce. Vorher-Nachher-Vergleich.
              Spezialisierte Knowledge-Hubs für High-Ticket-Sales und E-Commerce integriert.
            </p>

            {/* Trust-Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Badge icon={Coins} label="Abo ab €19/Mo · oder Pay-per-Use" />
              <Badge icon={Zap} label="5-10 Varianten pro Run" />
              <Badge icon={FileCheck2} label="A-F-Grading automatisch" />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#e0a458] text-black text-sm font-semibold rounded hover:bg-[#e6b170] transition shadow-[0_8px_24px_-8px_rgba(224,164,88,0.5)]"
              >
                <Sparkles size={15} /> Abo ab €19/Mo
              </button>
              <button
                onClick={() => openSignup()}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#e0a458]/40 hover:border-[#e0a458]/70 text-[#e0a458] text-sm rounded transition"
              >
                <Coins size={14} /> Einmalig ab €10
              </button>
              <a
                href={`${PORTAL_BASE}/tools/script-factory`}
                onClick={() => track('saas_tool_login_click', { tool: 'script-factory' })}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/15 hover:border-white/35 text-text-primary text-sm rounded transition"
              >
                <LogIn size={14} /> Schon Account? Login
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Wie es funktioniert ── */}
      <section className="border-t border-white/5 py-16 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">Workflow</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">Wie es funktioniert</h2>
            <p className="text-sm text-text-primary/50 mt-2">4 Schritte — Setup &lt; 60 Sekunden, Run-Time ~2 Minuten.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative bg-bg-primary border border-white/8 rounded-lg p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#e0a458]/10 border border-[#e0a458]/25 flex items-center justify-center text-[#e0a458]">
                      <Icon size={16} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-primary/40">Step {i + 1}</span>
                  </div>
                  <h3 className="text-sm font-medium text-text-primary mb-1.5">{s.title}</h3>
                  <p className="text-xs text-text-primary/55 leading-relaxed">{s.detail}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-text-primary/15 z-10">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Use-Cases ── */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">Use-Cases</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">7 Pipelines · Eine Tool-UI</h2>
            <p className="text-sm text-text-primary/50 mt-2">Jeder Use-Case kommt mit eigenen Best-Practices und Default-Knowledge-Hubs.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {USE_CASES.map((u, i) => {
              const Icon = u.icon;
              return (
                <motion.div
                  key={u.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  className="bg-bg-primary border border-white/8 rounded-lg p-5 hover:border-[#e0a458]/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#e0a458] mb-3">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">{u.name}</h3>
                  <p className="text-xs text-text-primary/55 leading-relaxed">{u.example}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Demo Side-by-Side ── */}
      <section className="border-t border-white/5 py-16 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">Demo</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">Vorher → Nachher</h2>
            <p className="text-sm text-text-primary/50 mt-2">Echter Run-Output (statischer Mock — Live im Portal nach Signup).</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DemoCard
              label="Vorher (Original)"
              grade="D"
              gradeColor="rose"
              hook={4.5}
              tone="neutral"
              text={`Hey Team,\n\nIch möchte gerne mehr über Ihr Coaching-Programm erfahren.\nKönnen Sie mir Infos schicken?\n\nDanke,\nMax`}
              points={[
                { sign: '-', text: 'Generischer Opener, kein Pattern-Interrupt' },
                { sign: '-', text: 'Keine ICP-Spezifität' },
                { sign: '-', text: 'Schwacher CTA' },
              ]}
            />
            <DemoCard
              label="Nachher (Variante 3 · Best)"
              grade="A"
              gradeColor="emerald"
              hook={8.5}
              tone="optimized"
              text={`Hi Markus,\n\nKurz: Ich bin Selbstständig (Web-Agency, 2 MA), mache 18k MRR — will skalieren, scheitere am Vertrieb.\n\nBauligs-Coaching wurde mir 3x in 2 Wochen empfohlen. Bevor ich den Strategie-Call buche:\n\n- Passt euer Setup für B2B-Service-Agencies?\n- Wer war euer letzter Case in dieser Kategorie?\n\nGruß, Max`}
              points={[
                { sign: '+', text: 'Spezifische Situation (Pattern-Interrupt)' },
                { sign: '+', text: 'Social-Proof verarbeitet ohne Speichel-Lecken' },
                { sign: '+', text: '2 konkrete Fragen → respektvolle Filterung' },
              ]}
            />
          </div>

          {/* Differences summary */}
          <div className="mt-6 max-w-3xl mx-auto border border-[#e0a458]/20 bg-[#e0a458]/[0.04] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#e0a458]" />
              <span className="text-sm font-medium text-text-primary">3 Verbesserungen identifiziert</span>
            </div>
            <ul className="space-y-2 text-xs text-text-primary/70">
              <li><span className="text-[#e0a458]">Hook</span> · von generisch zu situativ → +4.0 Hook-Score</li>
              <li><span className="text-[#e0a458]">ICP-Match</span> · Selbstständigkeit + Setup-Daten → bessere Qualifikation</li>
              <li><span className="text-[#e0a458]">CTA</span> · von "Infos schicken" zu konkreten Fragen → respektvolle Filterung</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => openSignup()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e0a458] text-black text-sm font-medium rounded hover:bg-[#e6b170] transition"
            >
              Eigenen Run starten <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">Pricing</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">Credit-Pakete</h2>
            <p className="text-sm text-text-primary/55 max-w-xl mx-auto">
              Einmaliger Kauf, Credits verfallen nicht. 40 Credits pro Run.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className={`relative bg-bg-primary border rounded-lg p-6 flex flex-col ${
                  pkg.featured ? 'border-[#e0a458]/40' : 'border-white/8'
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-black bg-[#e0a458] px-2.5 py-1 rounded">
                    Beliebt
                  </span>
                )}
                <div className="text-center flex-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-text-primary/50 mb-1">{pkg.name}</div>
                  <div className="text-3xl font-light text-text-primary mb-1">€{pkg.priceEur}</div>
                  <div className="text-sm text-text-primary/60 mb-2">{pkg.credits} Credits</div>
                  {pkg.bonusPct > 0 && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                      +{pkg.bonusPct}% Bonus
                    </div>
                  )}
                  <div className="text-xs text-text-primary/40 font-mono">{pkg.runsHint}</div>
                </div>
                <button
                  onClick={() => openSignup(pkg.slug)}
                  className={`mt-5 w-full px-4 py-2.5 text-xs font-medium rounded transition ${
                    pkg.featured
                      ? 'bg-[#e0a458] text-black hover:bg-[#e6b170]'
                      : 'border border-white/15 text-text-primary hover:border-white/35'
                  }`}
                >
                  {pkg.name} wählen
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge-Hubs ── */}
      <section className="border-t border-white/5 py-16 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">Knowledge</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-2">Spezialisierte Knowledge-Hubs</h2>
            <p className="text-sm text-text-primary/50 max-w-xl mx-auto">
              Pro Run wählst du, welche Knowledge-Hubs die Pipeline für Frameworks und Best-Practices ziehen darf.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {KNOWLEDGE_HUBS.map((h, i) => {
              const isSoon = h.badge === 'Soon';
              return (
                <motion.div
                  key={h.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="bg-bg-primary border border-white/8 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#e0a458]">
                      <Library size={16} />
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSoon
                        ? 'bg-white/5 border-white/15 text-text-primary/50'
                        : 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400'
                    }`}>
                      {h.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">{h.name}</h3>
                  <p className="text-xs text-text-primary/55 leading-relaxed">{h.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e0a458] mb-3 block">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">Häufige Fragen</h2>
          </div>
          <div>
            {FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Footer-CTA ── */}
      <section className="border-t border-white/5 py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <Sparkles size={28} className="mx-auto text-[#e0a458] mb-4" />
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-3">
            Bereit für deinen ersten Run?
          </h2>
          <p className="text-text-primary/55 mb-7 leading-relaxed text-sm">
            Account in 60 Sekunden. Credits verfallen nicht. Kein Abo, kein Lock-in.
          </p>
          <button
            onClick={() => openSignup()}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#e0a458] text-black text-sm font-semibold rounded hover:bg-[#e6b170] transition"
          >
            Jetzt starten <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Signup */}
      <SignupFlow
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        toolSlug="script-factory"
        toolName="Script-Factory"
        initialPackage={selectedPackage}
      />
    </div>
  );
}

// ── Sub-Components ──
function Badge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide px-2.5 py-1 rounded border bg-white/[0.03] border-white/10 text-text-primary/65">
      <Icon size={11} className="text-[#e0a458]" /> {label}
    </span>
  );
}

interface DemoPoint { sign: '+' | '-'; text: string }
function DemoCard({
  label, grade, gradeColor, hook, tone, text, points
}: {
  label: string;
  grade: string;
  gradeColor: 'rose' | 'emerald';
  hook: number;
  tone: 'neutral' | 'optimized';
  text: string;
  points: DemoPoint[];
}) {
  const gradeBg = gradeColor === 'rose'
    ? 'bg-rose-400/15 border-rose-400/40 text-rose-300'
    : 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300';
  const cardBorder = tone === 'optimized' ? 'border-[#e0a458]/30' : 'border-white/10';
  const hookPct = (hook / 10) * 100;
  const barColor = hook >= 8 ? 'bg-emerald-400' : hook >= 6 ? 'bg-lime-400' : hook >= 4 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className={`bg-bg-primary border rounded-lg p-5 ${cardBorder}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[0.65rem] uppercase tracking-widest text-text-primary/50 font-medium">{label}</div>
        <div className={`w-11 h-11 ${gradeBg} border rounded-lg flex items-center justify-center font-bold font-mono text-xl`}>
          {grade}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.6rem] uppercase tracking-wider text-text-primary/45">Hook-Score</span>
          <span className="text-xs font-mono text-text-primary/80">{hook.toFixed(1)}/10</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-1.5 ${barColor} rounded-full transition-all`} style={{ width: `${hookPct}%` }} />
        </div>
      </div>

      <pre className="text-xs text-text-primary/80 font-mono leading-relaxed whitespace-pre-wrap bg-black/30 rounded p-3 mb-4 max-h-56 overflow-y-auto">
{text}
      </pre>

      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-xs text-text-primary/70 flex items-start gap-2">
            <span className={`shrink-0 mt-0.5 ${p.sign === '+' ? 'text-emerald-400' : 'text-rose-400'}`}>{p.sign}</span>
            <span>{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-4 text-left group">
        <span className="text-sm text-text-primary group-hover:text-[#e0a458] transition-colors font-medium">{q}</span>
        <ChevronDown size={16} className={`text-text-primary/40 group-hover:text-[#e0a458] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pb-4">
          <p className="text-sm text-text-primary/65 leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

