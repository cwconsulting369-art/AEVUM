import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, CheckCircle2, FileText, ShieldCheck, ArrowRight,
  Clock, AlertCircle, Mail, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePageSeo } from '@/hooks/use-page-seo';
import { track } from '@/lib/shop-track';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';
const PDF_PATH = '/lead-magnets/eu-ai-act-2026.pdf';

const TEASER_BULLETS = [
  {
    icon: AlertCircle,
    title: 'Was ab August 2025 + 2026 wirklich für dich gilt',
    desc: 'Verbote · Transparenz · High-Risk — sortiert nach Use-Case, nicht nach Gesetzes-Paragraph.',
  },
  {
    icon: CheckCircle2,
    title: 'Checklisten für 5 typische Use-Cases',
    desc: 'Helpbot · Recruiting · Marketing · Finance · Healthcare. Was JETZT getan werden muss.',
  },
  {
    icon: ShieldCheck,
    title: 'Strafen-Übersicht — bis 35 Mio. €',
    desc: 'Welche Verstösse welche Strafen auslösen — und wie DSGVO + AI-Act zusammenspielen.',
  },
  {
    icon: FileText,
    title: 'Quick-Check: Bist du betroffen?',
    desc: 'Drei Fragen für eine ehrliche Selbsteinschätzung deines aktuellen AI-Einsatzes.',
  },
];

const COMING_SOON = [
  {
    title: 'DSGVO Quick-Start',
    desc: '14-Punkte-Checkliste für DSGVO-Compliance in 30 Tagen.',
    eta: 'Q3 2026',
  },
  {
    title: 'AI-Tool-Audit Worksheet',
    desc: 'Bewerte deinen aktuellen AI-Stack — Kosten, Risiko, Konsolidierung.',
    eta: 'Q3 2026',
  },
];

export default function LeadMagnetEuAiAct() {
  usePageSeo({
    title: 'EU AI Act 2026 — Praxis-Checkliste (PDF, kostenlos) · AEVUM',
    description:
      'Was Unternehmen in DACH 2026 zum EU AI Act wissen müssen. Branchenneutrale Checkliste mit 5 Use-Cases, Strafen-Übersicht und Quick-Check. Kostenloser PDF-Download.',
    path: '/lead-magnets/eu-ai-act',
    keywords: 'EU AI Act 2026, AI Act Checkliste, KI-Verordnung DACH, Compliance AI, High-Risk AI',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !consent) {
      setError('Email und Einwilligung sind erforderlich.');
      return;
    }

    setSubmitting(true);
    try {
      track('audit_start', { meta: { kind: 'lead_magnet_submit', slug: 'eu-ai-act' } });
      const res = await fetch(`${API_BASE}/api/lead-magnets/eu-ai-act`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: 'web-landing',
          consent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error === 'invalid_input' ? 'Bitte gültige Email eintragen.' : 'Versand fehlgeschlagen. Versuche es nochmal.');
        setSubmitting(false);
        return;
      }
      setSuccess({ url: data.download_url || PDF_PATH });
      track('audit_submit', { meta: { kind: 'lead_magnet_success', slug: 'eu-ai-act' } });
    } catch {
      setError('Netzwerkfehler. Versuche es nochmal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#e0a458] mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Kostenloser Lead-Magnet · PDF
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
              EU AI Act 2026 —<br />
              <span className="text-gradient font-medium">Was du wissen musst</span>
            </h1>
            <p className="text-base md:text-lg text-[#a4a4ad] max-w-2xl mx-auto leading-relaxed">
              Praxis-Checkliste für Unternehmen in DACH. Branchenneutral. Konkret. Kostenlos.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#8a8a9c]">
              <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF · ca. 12 Seiten</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 8 Min. Lesedauer</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Keine Newsletter-Pflicht</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teaser + Form */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Teaser bullets */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-text-primary">Was drin steht</h2>
            {TEASER_BULLETS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="flex gap-4 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-[#e0a458]/10 border border-[#e0a458]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#e0a458]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary mb-1">{b.title}</div>
                    <div className="text-sm text-[#a4a4ad] leading-relaxed">{b.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Email form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="md:sticky md:top-24"
          >
            <Card className="border-[#e0a458]/20 bg-gradient-to-b from-[#1a1a25] to-[#14141d]">
              <CardContent className="p-6 md:p-8">
                {success ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#e0a458]/15 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-[#e0a458]" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2">Checkliste ist unterwegs</h3>
                    <p className="text-sm text-[#a4a4ad] mb-6">
                      Wir haben dir die Checkliste auch per Email geschickt — falls du sie später nochmal brauchst.
                    </p>
                    <Button
                      asChild
                      className="w-full bg-[#e0a458] text-[#0a0a0f] hover:bg-[#e0a458]/90 font-semibold"
                    >
                      <a href={success.url} target="_blank" rel="noopener">
                        <Download className="w-4 h-4 mr-2" />
                        Jetzt PDF herunterladen
                      </a>
                    </Button>
                    <p className="text-xs text-[#8a8a9c] mt-6">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Kein Mail bekommen? Check Spam-Ordner — oder lade direkt oben.
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-sm text-[#a4a4ad] mb-3">Nächster Schritt:</p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-white/15"
                      >
                        <a href="/#/audit">
                          AEVUM-Audit buchen
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-medium text-text-primary mb-1">PDF anfordern</h3>
                      <p className="text-sm text-[#a4a4ad]">
                        Email eintragen → Download-Link kommt direkt + per Mail.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase tracking-wider text-[#a4a4ad]">
                        Name <span className="text-[#6e6e80] normal-case">(optional)</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Wie sollen wir dich nennen?"
                        maxLength={100}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-wider text-[#a4a4ad]">
                        Email <span className="text-[#e0a458]">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="du@unternehmen.de"
                        maxLength={254}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <Checkbox
                        id="consent"
                        checked={consent}
                        onCheckedChange={(v) => setConsent(v === true)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="consent"
                        className="text-xs text-[#a4a4ad] leading-relaxed font-normal cursor-pointer"
                      >
                        Ich willige ein, dass AEVUM mir die Checkliste per Email zusendet und
                        meine Daten gemäss <a href="/#/datenschutz" className="text-[#e0a458] hover:underline">Datenschutzerklärung</a> verarbeitet.
                        Widerruf jederzeit möglich.
                      </Label>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="border-red-900/40 bg-red-950/20">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting || !consent || !email}
                      className="w-full bg-[#e0a458] text-[#0a0a0f] hover:bg-[#e0a458]/90 font-semibold disabled:opacity-50"
                    >
                      {submitting ? (
                        <>Wird versendet…</>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          PDF jetzt herunterladen
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-center text-[#6e6e80] leading-relaxed pt-2">
                      Wir nutzen deine Email ausschliesslich für den Versand der Checkliste
                      und einer einmaligen Nachfass-Mail. Kein Newsletter, kein Verkauf an Dritte.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto p-5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <p className="text-xs text-[#8a8a9c] leading-relaxed">
            <strong className="text-[#a4a4ad]">Hinweis:</strong> Diese Checkliste ist eine
            Orientierungshilfe für Unternehmer und ersetzt keine Rechtsberatung. Für die konkrete
            Anwendung auf dein Unternehmen empfehlen wir, einen Datenschutz- oder Compliance-Experten
            hinzuzuziehen. Stand: Mai 2026.
          </p>
        </div>
      </section>

      {/* Coming-soon lead-magnets */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#e0a458] mb-3 block">
              Mehr in Vorbereitung
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">
              Weitere kostenlose <span className="text-gradient font-medium">Werkzeuge</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {COMING_SOON.map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-lg border border-white/[0.06] bg-white/[0.02] opacity-70"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-text-primary">{item.title}</div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#e0a458] bg-[#e0a458]/10 px-2 py-1 rounded">
                    {item.eta}
                  </span>
                </div>
                <p className="text-sm text-[#a4a4ad] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
