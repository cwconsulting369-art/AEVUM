import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trans, useTranslation } from 'react-i18next';
import { CheckCircle, Mail, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import CONTACT from '../config/contact';
import { track } from '../lib/shop-track';

function readQueryFromHash(): URLSearchParams {
  // Hash-Router: query lebt entweder in window.location.search ODER in hash nach '?'
  const hash = window.location.hash || '';
  const qi = hash.indexOf('?');
  if (qi >= 0) return new URLSearchParams(hash.slice(qi + 1));
  return new URLSearchParams(window.location.search);
}

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const params = readQueryFromHash();
    const sid = params.get('session_id');
    const t = params.get('type');
    setSessionId(sid);
    setType(t);
    // Fire-and-forget — guard against double-fire on hot-reload
    track('checkout_complete', { meta: { stripe_session: sid?.slice(0, 18) || null, type: t } });
  }, []);

  const isSaasSignup = type === 'saas-signup';
  if (isSaasSignup) return <SaasSignupSuccess sessionId={sessionId} />;

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-accent-soft mb-8">
          <CheckCircle size={32} className="text-theme-accent" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-6 text-text-primary">
          {t('checkout.successTitle1')}
          <span className="text-gradient">{t('checkout.successTitle2')}</span>
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed mb-10">
          <Trans i18nKey="checkout.successIntro" components={{ strong: <strong /> }} />
        </p>

        {sessionId && (
          <p className="text-xs text-text-muted font-mono mb-10 break-all">
            {t('checkout.orderId', { id: sessionId.slice(0, 24) })}
          </p>
        )}

        <div className="bg-bg-surface border border-theme-border p-6 sm:p-8 mb-10 text-left rounded-xl">
          <h2 className="text-lg font-medium mb-4 text-text-primary">{t('checkout.whatNextTitle')}</h2>
          <ol className="space-y-3 text-sm text-text-secondary list-decimal pl-5">
            <li>{t('checkout.whatNext1')}</li>
            <li>{t('checkout.whatNext2')}</li>
            <li>{t('checkout.whatNext3')}</li>
            <li>{t('checkout.whatNext4')}</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`mailto:${CONTACT.email}`}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Mail size={16} />
            {t('checkout.ctaWrite')}
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            {t('checkout.ctaBookKickoff')}
          </a>
        </div>

        <p className="text-xs text-text-muted mt-12">
          {t('checkout.successFootnote1')}
          <a href="#/widerrufsbelehrung" className="text-theme-accent hover:underline">{t('checkout.successFootnoteLink')}</a>
          {t('checkout.successFootnote2')}
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────── SaaS-Signup Variant ──────────────────── */

function SaasSignupSuccess({ sessionId }: { sessionId: string | null }) {
  const { t } = useTranslation();
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-accent-soft mb-8">
          <Sparkles size={28} className="text-theme-accent" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-6 text-text-primary">
          {t('checkout.saasTitle1')}<span className="text-gradient">{t('checkout.saasTitle2')}</span>
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed mb-8">
          {t('checkout.saasIntro')}
        </p>

        <div className="bg-bg-surface border border-theme-border p-6 sm:p-7 mb-10 text-left rounded-lg">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-text-primary">
            <Mail size={18} className="text-theme-accent" /> {t('checkout.saasCheckMail')}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('checkout.saasMailBody1')}<strong>{t('checkout.saasMailBodyBold')}</strong>{t('checkout.saasMailBody2')}
            <br />
            <br />
            {t('checkout.saasMailBody3')}
            <a href={`mailto:${CONTACT.email}`} className="text-theme-accent hover:underline">
              {CONTACT.email}
            </a>
            .
          </p>
        </div>

        {sessionId && (
          <p className="text-xs text-text-muted font-mono mb-8 break-all">
            {t('checkout.orderId', { id: sessionId.slice(0, 24) })}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://app.aevum-system.de/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} /> {t('checkout.saasPortalLogin')}
          </a>
          <a href="#/saas" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            {t('checkout.saasMoreTools')}
          </a>
        </div>

        <p className="text-xs text-text-muted mt-12 leading-relaxed">
          {t('checkout.saasFootnote1')}
          <a href="#/agb" className="text-theme-accent hover:underline">
            {t('checkout.saasFootnoteLink')}
          </a>
          {t('checkout.saasFootnote2')}
        </p>
      </motion.div>
    </section>
  );
}
