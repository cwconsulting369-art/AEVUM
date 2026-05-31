import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  { icon: AlertCircle, titleKey: 'b1Title', descKey: 'b1Desc' },
  { icon: CheckCircle2, titleKey: 'b2Title', descKey: 'b2Desc' },
  { icon: ShieldCheck, titleKey: 'b3Title', descKey: 'b3Desc' },
  { icon: FileText, titleKey: 'b4Title', descKey: 'b4Desc' },
] as const;

const COMING_SOON = [
  { titleKey: 'item1Title', descKey: 'item1Desc', etaKey: 'item1Eta' },
  { titleKey: 'item2Title', descKey: 'item2Desc', etaKey: 'item2Eta' },
] as const;

export default function LeadMagnetEuAiAct() {
  const { t } = useTranslation();
  usePageSeo({
    title: t('leadMagnet.seoTitle'),
    description: t('leadMagnet.seoDescription'),
    path: '/lead-magnets/eu-ai-act',
    keywords: t('leadMagnet.seoKeywords'),
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
      setError(t('leadMagnet.form.errRequired'));
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
        setError(data.error === 'invalid_input' ? t('leadMagnet.form.errInvalidEmail') : t('leadMagnet.form.errSendFailed'));
        setSubmitting(false);
        return;
      }
      setSuccess({ url: data.download_url || PDF_PATH });
      track('audit_submit', { meta: { kind: 'lead_magnet_success', slug: 'eu-ai-act' } });
    } catch {
      setError(t('leadMagnet.form.errNetwork'));
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
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-theme-accent mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {t('leadMagnet.hero.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
              {t('leadMagnet.hero.titleLine1')}<br />
              <span className="text-gradient font-medium">{t('leadMagnet.hero.titleLine2')}</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {t('leadMagnet.hero.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {t('leadMagnet.hero.metaPages')}</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('leadMagnet.hero.metaReadTime')}</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {t('leadMagnet.hero.metaNoNewsletter')}</span>
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
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-text-primary">{t('leadMagnet.teaser.heading')}</h2>
            {TEASER_BULLETS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.titleKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="flex gap-4 p-4 rounded-lg border border-theme-border bg-bg-elevated hover:bg-bg-surface transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-theme-accent-soft border border-theme-border-accent flex items-center justify-center">
                    <Icon className="w-5 h-5 text-theme-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary mb-1">{t(`leadMagnet.teaser.${b.titleKey}`)}</div>
                    <div className="text-sm text-text-secondary leading-relaxed">{t(`leadMagnet.teaser.${b.descKey}`)}</div>
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
            <Card className="border-theme-border-accent bg-bg-surface">
              <CardContent className="p-6 md:p-8">
                {success ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-theme-accent-soft flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-theme-accent" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2">{t('leadMagnet.form.successTitle')}</h3>
                    <p className="text-sm text-text-secondary mb-6">
                      {t('leadMagnet.form.successText')}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-theme-accent text-on-accent hover:bg-theme-accent-hover font-semibold"
                    >
                      <a href={success.url} target="_blank" rel="noopener">
                        <Download className="w-4 h-4 mr-2" />
                        {t('leadMagnet.form.successDownload')}
                      </a>
                    </Button>
                    <p className="text-xs text-text-muted mt-6">
                      <Mail className="w-3 h-3 inline mr-1" />
                      {t('leadMagnet.form.successSpamHint')}
                    </p>
                    <div className="mt-8 pt-6 border-t border-theme-border">
                      <p className="text-sm text-text-secondary mb-3">{t('leadMagnet.form.nextStep')}</p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-theme-border-strong"
                      >
                        <a href="/#/audit">
                          {t('leadMagnet.form.bookAudit')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-medium text-text-primary mb-1">{t('leadMagnet.form.requestTitle')}</h3>
                      <p className="text-sm text-text-secondary">
                        {t('leadMagnet.form.requestSubtitle')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase tracking-wider text-text-secondary">
                        {t('leadMagnet.form.nameLabel')} <span className="text-text-muted normal-case">{t('leadMagnet.form.nameOptional')}</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('leadMagnet.form.namePlaceholder')}
                        maxLength={100}
                        className="bg-bg-elevated border-theme-border text-text-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-wider text-text-secondary">
                        {t('leadMagnet.form.emailLabel')} <span className="text-theme-accent">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('leadMagnet.form.emailPlaceholder')}
                        maxLength={254}
                        className="bg-bg-elevated border-theme-border text-text-primary"
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
                        className="text-xs text-text-secondary leading-relaxed font-normal cursor-pointer"
                      >
                        {t('leadMagnet.form.consentPrefix')} <a href="/#/datenschutz" className="text-theme-accent hover:underline">{t('leadMagnet.form.consentLink')}</a>{t('leadMagnet.form.consentSuffix')}
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
                      className="w-full bg-theme-accent text-on-accent hover:bg-theme-accent-hover font-semibold disabled:opacity-50"
                    >
                      {submitting ? (
                        <>{t('leadMagnet.form.submitting')}</>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          {t('leadMagnet.form.submit')}
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-center text-text-muted leading-relaxed pt-2">
                      {t('leadMagnet.form.privacyNote')}
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
        <div className="max-w-4xl mx-auto p-5 rounded-lg border border-theme-border bg-bg-elevated">
          <p className="text-xs text-text-muted leading-relaxed">
            <strong className="text-text-secondary">{t('leadMagnet.disclaimer.label')}</strong> {t('leadMagnet.disclaimer.text')}
          </p>
        </div>
      </section>

      {/* Coming-soon lead-magnets */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-theme-accent mb-3 block">
              {t('leadMagnet.comingSoon.eyebrow')}
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-text-primary">
              {t('leadMagnet.comingSoon.titlePrefix')} <span className="text-gradient font-medium">{t('leadMagnet.comingSoon.titleHighlight')}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {COMING_SOON.map((item) => (
              <div
                key={item.titleKey}
                className="flex h-full flex-col p-5 rounded-lg border border-theme-border bg-bg-elevated opacity-70"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-text-primary">{t(`leadMagnet.comingSoon.${item.titleKey}`)}</div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-theme-accent bg-theme-accent-soft px-2 py-1 rounded">
                    {t(`leadMagnet.comingSoon.${item.etaKey}`)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{t(`leadMagnet.comingSoon.${item.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
