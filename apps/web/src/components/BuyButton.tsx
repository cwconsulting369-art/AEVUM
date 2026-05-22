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
  immediateStart: boolean;
}

const INITIAL_STATE: CheckoutFormState = {
  email: '',
  name: '',
  company: '',
  consent: false,
  agb: false,
  immediateStart: false,
};

// § 356 Abs 4 BGB — Pflicht für kurze Delivery-Pakete (S+M).
// Bei L (Dauerleistung/Retainer) regelt AGB.
const IMMEDIATE_START_REQUIRED_TIERS: Tier[] = ['S', 'M'];

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
  const [waiverInfoOpen, setWaiverInfoOpen] = useState(false);

  const immediateStartRequired = IMMEDIATE_START_REQUIRED_TIERS.includes(tier);

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

    if (immediateStartRequired && !form.immediateStart) {
      setError('Bitte den Sofort-Verzicht bestätigen (§ 356 Abs 4 BGB).');
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
          consent_immediate_start: form.immediateStart,
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
        } else if (data.error === 'immediate_start_required') {
          setError('Sofort-Verzicht-Zustimmung erforderlich (§ 356 Abs 4 BGB).');
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
          className="block text-center text-xs text-[#a4a4ad] hover:text-[#e0a458] mt-3 underline-offset-4 hover:underline"
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
              className="bg-[#111116] border border-white/10 w-full max-w-md p-8 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#e0a458] mb-2">
                  AEVUM {tier} buchen
                </p>
                <h3 className="text-2xl font-light tracking-tight">Schnell-Checkout</h3>
                {pilotInfo && pilotInfo.free > 0 && (
                  <p className="text-xs text-[#e0a458] font-mono uppercase tracking-wider mt-3">
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
                  <label className="text-xs text-[#a4a4ad] block mb-1">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#08080a] border border-white/10 px-3 py-2 text-sm focus:border-[#e0a458]/40 outline-none"
                    placeholder="name@firma.de"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#a4a4ad] block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#08080a] border border-white/10 px-3 py-2 text-sm focus:border-[#e0a458]/40 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#a4a4ad] block mb-1">Firma</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-[#08080a] border border-white/10 px-3 py-2 text-sm focus:border-[#e0a458]/40 outline-none"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs text-[#a4a4ad] cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-1 accent-[#e0a458]"
                  />
                  <span>
                    Ich willige in die Verarbeitung meiner Daten gemäß{' '}
                    <a href="#/datenschutz" target="_blank" className="text-[#e0a458] hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    ein.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-[#a4a4ad] cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.agb}
                    onChange={(e) => setForm({ ...form, agb: e.target.checked })}
                    className="mt-1 accent-[#e0a458]"
                  />
                  <span>
                    Ich akzeptiere die{' '}
                    <a href="#/agb" target="_blank" className="text-[#e0a458] hover:underline">
                      AGB
                    </a>{' '}
                    und die{' '}
                    <a href="#/widerrufsbelehrung" target="_blank" className="text-[#e0a458] hover:underline">
                      Widerrufsbelehrung
                    </a>
                    .
                  </span>
                </label>

                {/* § 356 Abs 4 BGB — Sofort-Verzicht. Pflicht für S+M, optional für L. */}
                <div>
                  <label className="flex items-start gap-2 text-xs text-[#a4a4ad] cursor-pointer leading-relaxed">
                    <input
                      type="checkbox"
                      checked={form.immediateStart}
                      onChange={(e) => setForm({ ...form, immediateStart: e.target.checked })}
                      className="mt-1 accent-[#e0a458]"
                    />
                    <span>
                      Ich verlange ausdrücklich, dass mit der Erbringung der Dienstleistung
                      sofort begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht bei
                      vollständiger Vertragserfüllung erlischt (§ 356 Abs 4 BGB).
                      {immediateStartRequired ? (
                        <span className="text-[#e0a458]"> *</span>
                      ) : (
                        <span className="text-[#7a7a85]"> (optional)</span>
                      )}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWaiverInfoOpen((v) => !v)}
                    className="ml-6 mt-1 text-[10px] text-[#7a7a85] hover:text-[#e0a458] underline-offset-2 hover:underline"
                  >
                    Was bedeutet das?
                  </button>
                  {waiverInfoOpen && (
                    <p className="ml-6 mt-2 text-[10px] text-[#a4a4ad] bg-white/5 border border-white/10 px-3 py-2 rounded leading-relaxed">
                      Wir starten sofort mit der Arbeit, statt 14 Tage Widerrufsfrist abzuwarten.
                      Sobald die Leistung vollständig erbracht ist, erlischt dein Widerrufsrecht
                      (§ 356 Abs 4 BGB). Vorher kannst du jederzeit widerrufen — dann berechnen
                      wir anteilig den bereits erbrachten Teil. Volltext:{' '}
                      <a
                        href="#/widerrufsbelehrung"
                        target="_blank"
                        className="text-[#e0a458] hover:underline"
                      >
                        Widerrufsbelehrung
                      </a>
                      .
                    </p>
                  )}
                </div>

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
                    disabled={
                      submitting ||
                      !form.consent ||
                      !form.agb ||
                      (immediateStartRequired && !form.immediateStart)
                    }
                    className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Weiterleitung...' : 'Zu Stripe →'}
                  </button>
                </div>

                <p className="text-[10px] text-[#7a7a85] leading-relaxed">
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
