import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Datenschutz() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <section className="px-6 lg:px-16 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
          Datenschutz<span className="text-[#F59E0B]">erklärung</span>
        </h1>

        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-4 py-3 mb-10 text-sm text-[#F59E0B]">
          ⚠️ DRAFT — Rechtskonformer Text wird in Kürze finalisiert (Anwalt/Generator). Diese Seite ist Platzhalter.
        </div>

        <p className="text-sm text-[#52525B] mb-12">Stand: 2026-05-19 · Version: datenschutz-v1-2026-05-19</p>

        <article className="prose prose-invert max-w-none space-y-8 text-[#A1A1AA] leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">1. Verantwortlicher</h2>
            <p>
              Carlos Wrusch<br />
              [Postanschrift folgt im Impressum]<br />
              E-Mail: cwconsulting369@gmail.com<br />
              Telefon: +49 177 228 83 72
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">2. Welche Daten verarbeiten wir?</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Über das Workflow-Audit-Formular: Name, Firma, E-Mail, Telefon, Branche, Teamgröße, Business-Beschreibung, aktuelle Tools, Budget, Timeline</li>
              <li>Im Shop-Checkout: Name, Firma, E-Mail, gewähltes Paket, optional Add-ons</li>
              <li>Zahlungsabwicklung über Stripe (siehe Abschnitt 5): Name, Anschrift, Zahlungsart-Metadaten — Karten-Details sehen wir NIE</li>
              <li>Technische Daten: IP-Adresse, User-Agent (zur Missbrauchsabwehr, anonymisiert nach 30 Tagen)</li>
              <li>Einwilligungs-Zeitpunkt und -Version (DSGVO Art 7)</li>
              <li>Bestelldaten + Rechnungs-Metadaten (Speicherdauer siehe Abschnitt 6)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">3. Zwecke und Rechtsgrundlagen</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Workflow-Audit-Bearbeitung:</strong> Art 6 Abs 1 lit b DSGVO (Vertragsanbahnung) und lit a (Einwilligung)</li>
              <li><strong>Vertragsabwicklung (Pakete S/M/L, Add-ons):</strong> Art 6 Abs 1 lit b DSGVO</li>
              <li><strong>Zahlungsabwicklung über Stripe:</strong> Art 6 Abs 1 lit b DSGVO (Vertrag) i.V.m. Art 6 Abs 1 lit c (gesetzliche Buchführungspflicht)</li>
              <li><strong>Rechnungsstellung + Aufbewahrung:</strong> Art 6 Abs 1 lit c DSGVO i.V.m. § 257 HGB / § 147 AO (10 Jahre)</li>
              <li><strong>Missbrauchsabwehr / IT-Sicherheit:</strong> Art 6 Abs 1 lit f DSGVO (berechtigtes Interesse)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">4. Empfänger / Auftragsverarbeiter</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase Inc.</strong> (Datenbank-Hosting, Frankfurt eu-central-1) — DPA in Vorbereitung</li>
              <li><strong>Vercel Inc.</strong> (Frontend-Hosting Frankfurt) — DPA in Vorbereitung</li>
              <li><strong>Cloudflare Inc.</strong> (CDN/Security Frankfurt) — DPA in Vorbereitung</li>
              <li><strong>Stripe Payments Europe Ltd.</strong> (Dublin, Irland) — Zahlungsdienstleister, PCI-DSS-zertifiziert, eigener DPA (siehe Abschnitt 5)</li>
              <li><strong>Mailbox.org</strong> (Berlin) — E-Mail-Kommunikation (geplant, sobald Domain aktiv)</li>
              <li><strong>Telegram</strong> (interne Benachrichtigung mit minimiertem Auszug, siehe TOMs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">5. Zahlungsabwicklung über Stripe</h2>
            <p>
              Für die Abwicklung von Zahlungen nutzen wir <strong>Stripe Payments Europe Ltd.</strong>,
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe ist nach
              PCI-DSS Level 1 zertifiziert — dem höchsten Standard für Zahlungssicherheit.
            </p>
            <p>
              <strong>Welche Daten Stripe verarbeitet:</strong> Name, E-Mail-Adresse, Rechnungs-/Lieferadresse,
              Zahlungsmethoden-Daten (Karten-/Bankdaten verbleiben bei Stripe, AEVUM bekommt nur
              Metadaten wie „Kreditkarte endend auf 4242"), IP-Adresse zur Betrugsprävention,
              Browser-Fingerprint für Fraud-Detection.
            </p>
            <p>
              <strong>Cookies:</strong> Stripe.js setzt technisch notwendige Cookies für Fraud-Detection
              (z.B. <code>__stripe_mid</code>, <code>__stripe_sid</code>). Diese sind nach § 25 Abs 2
              Nr 2 TTDSG einwilligungsfrei zulässig (unbedingt erforderlich für den Vertragsabschluss).
            </p>
            <p>
              <strong>Drittlandsübermittlung:</strong> Stripe-Mutterkonzern sitzt in den USA. Stripe
              verwendet EU-Standardvertragsklauseln + ergänzende technische Maßnahmen (Verschlüsselung).
              Verarbeitung erfolgt primär in EU-Rechenzentren.
            </p>
            <p>
              <strong>Stripe-Datenschutzerklärung:</strong>{' '}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F59E0B] hover:underline">
                https://stripe.com/de/privacy
              </a>
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art 6 Abs 1 lit b DSGVO (Vertragserfüllung) + lit f
              (Betrugsprävention).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">6. Speicherdauer</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aktive Audit-Anfragen: bis Vertragsabschluss oder -ablehnung</li>
              <li>Abgeschlossene Audits: 12 Monate ab Abschluss, dann Löschung</li>
              <li>Bestelldaten + Rechnungs-Metadaten: 10 Jahre (§ 257 HGB, § 147 AO)</li>
              <li>Stripe-Zahlungs-Daten: gemäß Stripe-Datenschutzerklärung, in der Regel ebenfalls 10 Jahre wegen Buchführungspflicht</li>
              <li>Security-Logs (anonymisiert): 90 Tage</li>
              <li>Einwilligungs-Nachweise (DSGVO Art 7 Abs 1): bis Widerruf + 3 Jahre Verjährung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">6. Ihre Rechte</h2>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über Ihre verarbeiteten Daten (Art 15 DSGVO)</li>
              <li>Berichtigung (Art 16 DSGVO)</li>
              <li>Löschung (Art 17 DSGVO) — direkt unter: <code className="text-[#F59E0B]">POST /api/audit/erase</code> oder per E-Mail</li>
              <li>Einschränkung der Verarbeitung (Art 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art 20 DSGVO)</li>
              <li>Widerspruch (Art 21 DSGVO)</li>
              <li>Widerruf der Einwilligung mit Wirkung für die Zukunft (Art 7 Abs 3 DSGVO)</li>
              <li>Beschwerde bei der zuständigen Aufsichtsbehörde (Art 77 DSGVO)</li>
            </ul>
            <p className="mt-4">Für alle Anfragen: <a href="mailto:cwconsulting369@gmail.com" className="text-[#F59E0B] hover:underline">cwconsulting369@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">7. Cookies</h2>
            <p>
              Die AEVUM-Website setzt selbst <strong>keine Tracking-Cookies</strong>. Es findet kein
              Tracking durch Dritt-Anbieter (Google Analytics, Meta Pixel etc.) statt.
            </p>
            <p>
              Beim Checkout-Vorgang setzt <strong>Stripe.js</strong> technisch notwendige
              Cookies für Fraud-Detection. Diese sind einwilligungsfrei zulässig (§ 25 Abs 2
              Nr 2 TTDSG) und nur während des aktiven Checkout-Vorgangs aktiv.
            </p>
            <p>
              Vercel-Insights ist als anonyme Statistik-Erfassung deaktiviert (kein Tracking
              per Default).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">8. Datensicherheit (TOM)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verschlüsselte Übertragung (TLS 1.3) via Cloudflare und Vercel</li>
              <li>Strenge Content-Security-Policy + HSTS + alle relevanten Security-Headers</li>
              <li>Pattern-basierte Filterung gegen Injection-Angriffe</li>
              <li>Honeypot-basierte Bot-Abwehr</li>
              <li>Rate-Limiting gegen Missbrauch</li>
              <li>Row-Level-Security in der Datenbank</li>
              <li>IP-Anonymisierung nach 30 Tagen</li>
              <li>Tägliche Daten-Retention-Prüfung</li>
            </ul>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
