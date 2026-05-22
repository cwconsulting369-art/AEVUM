import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Calendar } from 'lucide-react';
import CONTACT from '../config/contact';

export default function CheckoutSuccess() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('session_id'));
  }, []);

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e0a458]/10 mb-8">
          <CheckCircle size={32} className="text-[#e0a458]" />
        </div>

        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
          Vielen Dank für deinen{' '}
          <span className="text-gradient">Kauf</span>
        </h1>

        <p className="text-[#a4a4ad] text-lg leading-relaxed mb-10">
          Wir haben deine Bestellung erhalten. Eine Bestätigung mit Rechnung wurde per E-Mail
          versendet. Innerhalb von <strong>1 Werktag</strong> melde ich mich persönlich mit
          den nächsten Onboarding-Schritten.
        </p>

        {sessionId && (
          <p className="text-xs text-[#7a7a85] font-mono mb-10">
            Order-ID: {sessionId.slice(0, 24)}…
          </p>
        )}

        <div className="bg-[#111116] border border-white/10 p-8 mb-10 text-left">
          <h2 className="text-lg font-medium mb-4">Was passiert jetzt?</h2>
          <ol className="space-y-3 text-sm text-[#a4a4ad] list-decimal pl-5">
            <li>Du erhältst innerhalb weniger Minuten eine Stripe-Zahlungsbestätigung per E-Mail.</li>
            <li>Innerhalb von 1 Werktag schicke ich dir eine Onboarding-Mail mit Kickoff-Terminvorschlag.</li>
            <li>Wir richten gemeinsame Kommunikationswege ein (Slack/TG/E-Mail nach deiner Wahl).</li>
            <li>Bei Pilot-Programm-Slot: Wir vereinbaren auch Termine für die Testimonial-Video-Aufnahme nach 90 Tagen.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`mailto:${CONTACT.email}`}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Mail size={16} />
            Fragen? Schreib direkt
          </a>
          <a
            href={CONTACT.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            Kickoff schon jetzt buchen
          </a>
        </div>

        <p className="text-xs text-[#7a7a85] mt-12">
          Hinweis: Bei Verbrauchern (B2C) besteht ein gesetzliches Widerrufsrecht von 14 Tagen
          (siehe <a href="#/widerrufsbelehrung" className="text-[#e0a458] hover:underline">Widerrufsbelehrung</a>).
          Bei Unternehmen (B2B) gilt das vereinbarte Refund-Window aus den AGB.
        </p>
      </motion.div>
    </section>
  );
}
