import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.lennoxos.com';

type Tier = 'S' | 'M' | 'L';

interface BuyButtonProps {
  tier: Tier;
  label: string;
  variant: 'primary' | 'secondary';
  // If true: render Calendly fallback link alongside the buy button
  showCallOption?: boolean;
  // Calendly URL for the "Lieber erst sprechen" CTA
  calendlyUrl?: string;
}

interface CheckoutFormState {
  email: string;
  name: string;
  company: string;
  consent: boolean;
  agb: boolean;
}

const INITIAL_STATE: CheckoutFormState = {
  email: '',
  name: '',
  company: '',
  consent: false,
  agb: false,
};

export default function BuyButton({
  tier,
  label,
  variant,
  showCallOption = false,
  calendlyUrl,
}: BuyButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_STATE);
  const [pilotInfo, setPilotInfo] = useState<{ free: number; taken: number; total: number } | null>(null);
  const [formStartedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState(''); // bot trap

  useEffect(() => {
    if (!open) return;
    fetch(`${API_BASE}/api/checkout/pilot-status`)
      .then((r) => r.json())
      .then(setPilotInfo)
      .catch(() => {});
  }, [open]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Bot defense
    if (honeypot.length > 0) {
      setError('Anmeldung konnte nicht abgeschlossen werden.');
      return;
    }
    if (Date.now() - formStartedAt < 1500) {
      setError('Bitte nimm dir einen Moment für die Eingabe.');
      return;
    }

    if (!form.consent || !form.agb) {
      setError('Bitte beide Bestätigungen ankreuzen.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          customerEmail: form.email,
          customerName: form.name,
          customerCompany: form.company,
          requestPilot: pilotInfo ? pilotInfo.free > 0 : false,
          consent: true,
          addonPriceIds: [],
          bundleSize: 1,
          // DSGVO / anti-bot proof
          website: honeypot,
          formStartedAt,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (data.error === 'package_not_configured') {
          setError(
            'Der Direkt-Kauf wird gerade eingerichtet. Bitte buche einen kurzen Call — wir starten direkt manuell.'
          );
        } else if (data.error === 'validation_failed') {
          setError('Bitte alle Pflichtfelder korrekt ausfüllen.');
        } else {
          setError('Fehler beim Checkout. Bitte später erneut versuchen oder einen Call buchen.');
        }
        setSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e) {
      setError('Verbindung fehlgeschlagen. Bitte später erneut versuchen.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-center block ${
          variant === 'primary' ? 'btn-primary' : 'btn-secondary'
        } py-3 text-sm`}
      >
        {label}
      </button>

      {showCallOption && calendlyUrl && (
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-[#A1A1AA] hover:text-[#F59E0B] mt-3 underline-offset-4 hover:underline"
        >
          Lieber erst sprechen? Call buchen ↗
        </a>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => !submitting && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#15161A] border border-white/10 w-full max-w-md p-8 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#F59E0B] mb-2">
                  AEVUM {tier} buchen
                </p>
                <h3 className="text-2xl font-light tracking-tight">Schnell-Checkout</h3>
                {pilotInfo && pilotInfo.free > 0 && (
                  <p className="text-xs text-[#F59E0B] font-mono uppercase tracking-wider mt-3">
                    Pilot-Programm aktiv · {pilotInfo.free}/{pilotInfo.total} Slots frei · −30 %
                  </p>
                )}
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                />

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-white/10 px-3 py-2 text-sm focus:border-[#F59E0B]/40 outline-none"
                    placeholder="name@firma.de"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-white/10 px-3 py-2 text-sm focus:border-[#F59E0B]/40 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Firma</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-white/10 px-3 py-2 text-sm focus:border-[#F59E0B]/40 outline-none"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs text-[#A1A1AA] cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-1 accent-[#F59E0B]"
                  />
                  <span>
                    Ich willige in die Verarbeitung meiner Daten gemäß{' '}
                    <a href="#/datenschutz" target="_blank" className="text-[#F59E0B] hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    ein.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-[#A1A1AA] cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.agb}
                    onChange={(e) => setForm({ ...form, agb: e.target.checked })}
                    className="mt-1 accent-[#F59E0B]"
                  />
                  <span>
                    Ich akzeptiere die{' '}
                    <a href="#/agb" target="_blank" className="text-[#F59E0B] hover:underline">
                      AGB
                    </a>{' '}
                    und die{' '}
                    <a href="#/widerrufsbelehrung" target="_blank" className="text-[#F59E0B] hover:underline">
                      Widerrufsbelehrung
                    </a>
                    .
                  </span>
                </label>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="flex-1 btn-secondary py-2.5 text-sm"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary py-2.5 text-sm"
                  >
                    {submitting ? 'Weiterleitung...' : 'Zu Stripe →'}
                  </button>
                </div>

                <p className="text-[10px] text-[#52525B] leading-relaxed">
                  Du wirst zu Stripe weitergeleitet. Wir speichern keine Kartendaten — Stripe ist
                  PCI-DSS-zertifizierter Zahlungsdienstleister. Zahlung erst nach Bestätigung.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
