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

        <p className="text-sm text-[#52525B] mb-12">Stand: 22. Mai 2026 · Version: datenschutz-v3-2026-05-22</p>

        <article className="prose prose-invert max-w-none space-y-8 text-[#A1A1AA] leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der DSGVO und anderer nationaler Datenschutzgesetze
              der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
            </p>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen, Deutschland<br />
              E-Mail: <a href="mailto:cwconsulting369@gmail.com" className="text-[#F59E0B] hover:underline">cwconsulting369@gmail.com</a>
            </p>
            <p className="text-sm text-[#52525B]">
              Ein Datenschutzbeauftragter ist gesetzlich nicht erforderlich (kein
              Schwellenwert nach § 38 BDSG erreicht).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">2. Welche Daten wir verarbeiten</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Workflow-Audit-Formular:</strong> Name, Firma, E-Mail, Telefon (optional), Branche, Teamgröße, Business-Beschreibung, aktuelle Tools, Budget-Rahmen, Timeline</li>
              <li><strong>Shop-Checkout:</strong> Name, Firma, E-Mail, gewähltes Paket, optional Add-ons</li>
              <li><strong>Zahlungsabwicklung über Stripe:</strong> Name, Rechnungsadresse, Zahlungsart-Metadaten (Karten-/Bankdaten sehen wir NIE — diese verbleiben bei Stripe)</li>
              <li><strong>Server-Log-Daten:</strong> IP-Adresse, User-Agent, Referrer, Zeitstempel (zur Missbrauchsabwehr, IP-Anonymisierung nach 30 Tagen)</li>
              <li><strong>Einwilligungs-Metadaten:</strong> Zeitpunkt, Version und Inhalt der erteilten Einwilligung (Art 7 DSGVO Nachweispflicht)</li>
              <li><strong>Bestell- und Rechnungs-Daten:</strong> Vertragsdaten, Buchungs-Metadaten</li>
            </ul>
            <p>
              Es findet <strong>kein automatisiertes Profiling</strong> und keine automatisierte
              Einzelfall-Entscheidung im Sinne von Art 22 DSGVO statt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">3. Zwecke und Rechtsgrundlagen</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Workflow-Audit-Bearbeitung:</strong> Art 6 Abs 1 lit b DSGVO (Vertragsanbahnung) und lit a (Einwilligung für Folge-Kommunikation)</li>
              <li><strong>Vertragsabwicklung (Pakete S/M/L, Add-ons):</strong> Art 6 Abs 1 lit b DSGVO</li>
              <li><strong>Zahlungsabwicklung über Stripe:</strong> Art 6 Abs 1 lit b DSGVO (Vertrag) i.V.m. Art 6 Abs 1 lit f (Betrugsprävention)</li>
              <li><strong>Rechnungsstellung + steuerliche Aufbewahrung:</strong> Art 6 Abs 1 lit c DSGVO i.V.m. § 257 HGB und § 147 AO (8–10 Jahre)</li>
              <li><strong>Server-Logs und Missbrauchsabwehr:</strong> Art 6 Abs 1 lit f DSGVO (berechtigtes Interesse an Betriebs- und IT-Sicherheit)</li>
              <li><strong>Einwilligungs-Nachweise:</strong> Art 6 Abs 1 lit c DSGVO i.V.m. Art 7 Abs 1 DSGVO</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">4. Empfänger und Auftragsverarbeiter</h2>
            <p>
              Wir setzen sorgfältig ausgewählte Dienstleister im Rahmen einer Auftragsverarbeitung
              nach Art 28 DSGVO ein. Mit allen aufgeführten Anbietern bestehen oder werden vor
              produktivem Einsatz Auftragsverarbeitungsverträge geschlossen.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-white/10">
                <thead className="bg-[#15161A]">
                  <tr className="text-left">
                    <th className="px-3 py-2 border-b border-white/10 text-[#F8FAFC] font-normal">Anbieter</th>
                    <th className="px-3 py-2 border-b border-white/10 text-[#F8FAFC] font-normal">Zweck</th>
                    <th className="px-3 py-2 border-b border-white/10 text-[#F8FAFC] font-normal">Sitz / Server-Standort</th>
                    <th className="px-3 py-2 border-b border-white/10 text-[#F8FAFC] font-normal">Garantien</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr>
                    <td className="px-3 py-2 border-b border-white/10">Supabase Inc.</td>
                    <td className="px-3 py-2 border-b border-white/10">Datenbank-Hosting</td>
                    <td className="px-3 py-2 border-b border-white/10">USA / EU (Frankfurt eu-central-1)</td>
                    <td className="px-3 py-2 border-b border-white/10">AVV + EU-Standardvertragsklauseln</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-white/10">Vercel Inc.</td>
                    <td className="px-3 py-2 border-b border-white/10">Frontend-Hosting / CDN</td>
                    <td className="px-3 py-2 border-b border-white/10">USA / EU-Edge</td>
                    <td className="px-3 py-2 border-b border-white/10">AVV + EU-SCCs (Data Privacy Framework)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-white/10">Cloudflare Inc.</td>
                    <td className="px-3 py-2 border-b border-white/10">CDN, DDoS- und Bot-Abwehr</td>
                    <td className="px-3 py-2 border-b border-white/10">USA / globales Edge-Netz (EU-Priorisierung)</td>
                    <td className="px-3 py-2 border-b border-white/10">AVV + EU-SCCs (Data Privacy Framework)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-white/10">Stripe Payments Europe Ltd.</td>
                    <td className="px-3 py-2 border-b border-white/10">Zahlungsabwicklung</td>
                    <td className="px-3 py-2 border-b border-white/10">Irland / EU (Mutterkonzern USA)</td>
                    <td className="px-3 py-2 border-b border-white/10">AVV + EU-SCCs, PCI-DSS Level 1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Anthropic PBC</td>
                    <td className="px-3 py-2">AI-gestützte Audit-Analyse (Verarbeitung der vom Nutzer eingegebenen Audit-Antworten zur Erstellung der Workflow-Empfehlung; keine Trainings-Nutzung gemäß Anthropic Commercial Terms)</td>
                    <td className="px-3 py-2">USA</td>
                    <td className="px-3 py-2">AVV (Anthropic DPA) + EU-SCCs (Modul 2), Zero-Retention API</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              <strong>Drittland-Übermittlung:</strong> Soweit Daten in die USA übermittelt werden,
              erfolgt dies auf Grundlage der EU-Standardvertragsklauseln (Art 46 Abs 2 lit c DSGVO)
              und – soweit zertifiziert – auf Basis des EU-US Data Privacy Framework
              (Angemessenheitsbeschluss der EU-Kommission, Art 45 DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">5. Zahlungsabwicklung über Stripe</h2>
            <p>
              Für die Abwicklung von Zahlungen nutzen wir <strong>Stripe Payments Europe Ltd.</strong>,
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe ist nach
              PCI-DSS Level 1 zertifiziert – dem höchsten Standard für Zahlungssicherheit.
            </p>
            <p>
              <strong>Verarbeitete Daten:</strong> Name, E-Mail-Adresse, Rechnungs-/Lieferadresse,
              Zahlungsmethoden-Daten (Karten-/Bankdaten verbleiben ausschließlich bei Stripe,
              AEVUM erhält nur Metadaten wie „Kreditkarte endend auf 4242"), IP-Adresse zur
              Betrugsprävention, Browser-Fingerprint für Fraud-Detection.
            </p>
            <p>
              <strong>Cookies:</strong> Stripe.js setzt technisch notwendige Cookies für
              Fraud-Detection (z.B. <code>__stripe_mid</code>, <code>__stripe_sid</code>). Diese
              sind nach § 25 Abs 2 Nr 2 TTDSG einwilligungsfrei zulässig (unbedingt erforderlich
              für den Vertragsabschluss).
            </p>
            <p>
              <strong>Drittland-Übermittlung:</strong> Stripe-Mutterkonzern sitzt in den USA.
              Stripe verwendet EU-Standardvertragsklauseln und ergänzende technische Maßnahmen
              (Verschlüsselung, Pseudonymisierung). Verarbeitung erfolgt primär in EU-Rechenzentren.
            </p>
            <p>
              <strong>Stripe-Datenschutzerklärung:</strong>{' '}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F59E0B] hover:underline">
                stripe.com/de/privacy
              </a>
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art 6 Abs 1 lit b DSGVO (Vertragserfüllung) + lit f
              (Betrugsprävention).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">6. Auftragsverarbeitung für gewerbliche Kunden (AVV)</h2>
            <p>
              Soweit AEVUM im Rahmen der Leistungserbringung für gewerbliche Kunden personenbezogene
              Daten Dritter (z.B. Endkundendaten, Mitarbeiter-Daten) verarbeitet, geschieht dies
              ausschließlich auf Grundlage eines separaten Auftragsverarbeitungsvertrags nach
              <strong> Art 28 DSGVO</strong>. Ein Standard-AVV-Template stellen wir auf Anfrage
              kostenfrei zur Verfügung. Anfragen bitte per E-Mail an{' '}
              <a href="mailto:cwconsulting369@gmail.com" className="text-[#F59E0B] hover:underline">cwconsulting369@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">7. Speicherdauer</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aktive Audit-Anfragen: bis Vertragsabschluss oder begründeter Ablehnung</li>
              <li>Abgeschlossene Audits ohne Vertragsschluss: 12 Monate ab Abschluss, danach Löschung</li>
              <li>Bestell- und Rechnungs-Daten: 10 Jahre (§ 257 HGB, § 147 AO)</li>
              <li>Stripe-Zahlungsdaten: gemäß Stripe-Datenschutzerklärung, in der Regel ebenfalls 10 Jahre wegen handels- und steuerrechtlicher Aufbewahrungspflichten</li>
              <li>Server-Logs: 30 Tage (danach IP-Anonymisierung), aggregierte Security-Statistiken bis zu 90 Tage</li>
              <li>Einwilligungs-Nachweise (Art 7 Abs 1 DSGVO): bis Widerruf zzgl. 3 Jahre Regelverjährung (§ 195 BGB)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">8. Ihre Rechte als Betroffene Person</h2>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über Ihre verarbeiteten Daten (Art 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art 16 DSGVO)</li>
              <li>Löschung (Art 17 DSGVO) – direkt umsetzbar per E-Mail oder über den API-Endpunkt <code className="text-[#F59E0B]">POST /api/audit/erase</code></li>
              <li>Einschränkung der Verarbeitung (Art 18 DSGVO)</li>
              <li>Datenübertragbarkeit in einem strukturierten, gängigen Format (Art 20 DSGVO)</li>
              <li>Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen (Art 21 DSGVO)</li>
              <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art 7 Abs 3 DSGVO)</li>
            </ul>
            <p className="mt-4">
              Anfragen bitte per E-Mail an{' '}
              <a href="mailto:cwconsulting369@gmail.com" className="text-[#F59E0B] hover:underline">cwconsulting369@gmail.com</a>.
              Wir bearbeiten Anfragen innerhalb der gesetzlichen Frist von einem Monat (Art 12 Abs 3 DSGVO).
            </p>
            <p className="mt-4">
              <strong>Beschwerderecht (Art 77 DSGVO):</strong> Unbeschadet anderer Rechtsbehelfe
              haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Zuständig
              für AEVUM ist:
            </p>
            <p className="text-sm">
              Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
              Promenade 18, 91522 Ansbach<br />
              <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="text-[#F59E0B] hover:underline">www.lda.bayern.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">9. Cookies und Tracking</h2>
            <p>
              Die AEVUM-Website setzt <strong>keine Tracking-Cookies und keine Marketing-Cookies</strong>.
              Es findet kein Tracking durch Dritt-Anbieter wie Google Analytics, Meta Pixel,
              LinkedIn Insight Tag o.ä. statt.
            </p>
            <p>
              Beim Checkout-Vorgang setzt <strong>Stripe.js</strong> technisch notwendige Cookies
              für Fraud-Detection (siehe Abschnitt 5). Diese sind nach § 25 Abs 2 Nr 2 TTDSG
              einwilligungsfrei zulässig und nur während des aktiven Checkout-Vorgangs aktiv.
            </p>
            <p>
              Vercel-Insights und sonstige anonyme Statistik-Erfassung sind deaktiviert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">10. Datensicherheit (Technische und organisatorische Maßnahmen)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Durchgehende TLS-1.3-Verschlüsselung der Übertragung (Cloudflare und Vercel)</li>
              <li>Strenge Content-Security-Policy, HSTS und alle relevanten Security-Header</li>
              <li>Pattern-basierte Filterung gegen Injection-Angriffe</li>
              <li>Honeypot-basierte Bot-Abwehr im Formular</li>
              <li>Rate-Limiting gegen Missbrauch und Brute-Force</li>
              <li>Row-Level-Security in der Datenbank (PostgreSQL / Supabase)</li>
              <li>IP-Anonymisierung nach 30 Tagen</li>
              <li>Tägliche automatische Daten-Retention-Prüfung</li>
              <li>Verschlüsselte Backups, getrennte Zugriffsrechte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">11. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich die
              Rechtslage oder unsere Verarbeitungsprozesse ändern. Die jeweils aktuelle Version
              ist auf dieser Seite abrufbar. Wesentliche Änderungen kommunizieren wir aktiven
              Vertragspartnern proaktiv per E-Mail.
            </p>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
