import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import CONTACT from '../config/contact';
import { track } from '../lib/shop-track';

export default function CheckoutCancelled() {
  useEffect(() => {
    window.scrollTo(0, 0);
    track('checkout_abandon', { meta: { source: 'stripe_cancel_redirect' } });
  }, []);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-700/30 mb-8">
          <XCircle size={32} className="text-zinc-400" />
        </div>

        <h1 className="text-4xl font-light tracking-tight mb-6">
          Kauf abgebrochen
        </h1>

        <p className="text-[#a4a4ad] leading-relaxed mb-10">
          Du hast den Checkout vorzeitig verlassen. Es wurde keine Zahlung ausgelöst und keine
          Daten ausser deiner E-Mail-Adresse gespeichert (Pilot-Slot-Reservierung aufgehoben).
          Kannst gern jederzeit wiederkommen — oder direkt sprechen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#/services" className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Zurück zu Services
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Direkt schreiben
          </a>
        </div>
      </motion.div>
    </section>
  );
}
