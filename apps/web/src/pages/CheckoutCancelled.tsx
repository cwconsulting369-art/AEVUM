import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import CONTACT from '../config/contact';
import { track } from '../lib/shop-track';

export default function CheckoutCancelled() {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
    track('checkout_abandon', { meta: { source: 'stripe_cancel_redirect' } });
  }, []);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated border border-theme-border mb-8">
          <XCircle size={32} className="text-text-muted" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-6 text-text-primary">
          {t('checkout.cancelTitle')}
        </h1>

        <p className="text-text-secondary leading-relaxed mb-10">
          {t('checkout.cancelBody')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#/services" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            {t('checkout.cancelBackToServices')}
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            {t('checkout.cancelWriteDirect')}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
