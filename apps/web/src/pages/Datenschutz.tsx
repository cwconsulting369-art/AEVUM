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
              <li>Technische Daten: IP-Adresse, User-Agent (zur Missbrauchsabwehr, anonymisiert nach 30 Tagen)</li>
              <li>Einwilligungs-Zeitpunkt und -Version (DSGVO Art 7)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">3. Zwecke und Rechtsgrundlagen</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Workflow-Audit-Bearbeitung:</strong> Art 6 Abs 1 lit b DSGVO (Vertragsanbahnung) und lit a (Einwilligung)</li>
              <li><strong>Missbrauchsabwehr / IT-Sicherheit:</strong> Art 6 Abs 1 lit f DSGVO (berechtigtes Interesse)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">4. Empfänger / Auftragsverarbeiter</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase Inc.</strong> (Datenbank-Hosting, Frankfurt eu-central-1) — DPA in Vorbereitung</li>
              <li><strong>Vercel Inc.</strong> (Frontend-Hosting Frankfurt) — DPA in Vorbereitung</li>
              <li><strong>Cloudflare Inc.</strong> (CDN/Security Frankfurt) — DPA in Vorbereitung</li>
              <li><strong>Telegram</strong> (interne Benachrichtigung mit minimiertem Auszug, siehe TOMs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">5. Speicherdauer</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aktive Audit-Anfragen: bis Vertragsabschluss oder -ablehnung</li>
              <li>Abgeschlossene Audits: 12 Monate ab Abschluss, dann Löschung</li>
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
            <p>Diese Website setzt aktuell keine nicht-essenziellen Cookies. Es findet kein Tracking durch Dritt-Anbieter statt.</p>
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
