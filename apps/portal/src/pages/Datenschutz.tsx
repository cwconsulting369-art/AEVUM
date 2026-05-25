import { useEffect } from 'react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';

export default function Datenschutz() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition"><Brand size={28} /></Link>
        </div>
      </header>

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-light tracking-tight mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-neutral-500 mb-2">Gilt für: <span className="text-neutral-300">app.aevum-system.de</span> (Customer-Portal)</p>
        <p className="text-sm text-neutral-500 mb-12">Stand: 22. Mai 2026</p>

        <article className="space-y-10 text-neutral-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne von Art 4 Nr 7 DSGVO:
            </p>
            <p className="mt-3">
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
            <p className="mt-3">
              E-Mail: <a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a><br />
              Telefon: <a href="tel:+491772288372" className="text-amber-500 hover:underline">+49 177 228 83 72</a>
            </p>
            <p className="mt-3 text-sm">
              Ein Datenschutzbeauftragter ist gesetzlich nicht erforderlich (keine 20+ Beschäftigte
              in regelmäßiger Datenverarbeitung).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">2. Zwecke der Verarbeitung</h2>
            <p>Wir verarbeiten personenbezogene Daten im Customer-Portal ausschließlich, um folgende Zwecke zu erfüllen:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Bereitstellung des Self-Service-Portals (Login, Account-Verwaltung, Sitzungsverwaltung)</li>
              <li>Verwaltung von API-Schlüsseln, die du uns zur Ausführung beauftragter Workflows einreichst</li>
              <li>Verwaltung deiner Berechtigungen und Auto-Plan-Einstellungen (Consent-Tracking)</li>
              <li>Customer-Beziehung, Kommunikation und Support</li>
              <li>Erfüllung gesetzlicher Aufbewahrungspflichten</li>
              <li>Schutz vor Missbrauch, Sicherstellung der Systemsicherheit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">3. Rechtsgrundlagen</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="text-neutral-200">Art 6 Abs 1 lit b DSGVO</span> – Vertragserfüllung
                bzw. vorvertragliche Maßnahmen (Portalzugang, Auftragsdurchführung).
              </li>
              <li>
                <span className="text-neutral-200">Art 6 Abs 1 lit a DSGVO</span> – Einwilligung,
                soweit du optionale Berechtigungen (z.B. Auto-Plan) ausdrücklich aktivierst.
                Du kannst diese jederzeit mit Wirkung für die Zukunft widerrufen.
              </li>
              <li>
                <span className="text-neutral-200">Art 6 Abs 1 lit c DSGVO</span> – Erfüllung
                gesetzlicher Pflichten (z.B. handels- und steuerrechtliche Aufbewahrung).
              </li>
              <li>
                <span className="text-neutral-200">Art 6 Abs 1 lit f DSGVO</span> – berechtigtes
                Interesse (IT-Sicherheit, Missbrauchsprävention, Logging in begrenztem Umfang).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">4. Kategorien verarbeiteter Daten</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Account-Stammdaten: Name, E-Mail-Adresse, Firma</li>
              <li>Authentifizierungs-Daten: Magic-Link-Tokens (kurzlebig), Session-Cookies</li>
              <li>Berechtigungs-Status und Consent-Hash (SHA-256 deiner Berechtigungs-Konfiguration, Zeitstempel, IP-Adresse zur Beweissicherung)</li>
              <li>Eingereichte API-Schlüssel (von dir freiwillig hochgeladen)</li>
              <li>Projekt-Metadaten und zugeordnete Workflows</li>
              <li>Technische Daten: IP-Adresse, User-Agent, Zugriffszeitpunkte (zur Missbrauchsabwehr; IPs werden nach 30 Tagen anonymisiert)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">5. Verschlüsselung von API-Schlüsseln</h2>
            <p>
              API-Schlüssel, die du im Portal einreichst (z.B. Anthropic, OpenAI, Stripe deines
              Unternehmens), werden serverseitig mit <span className="text-neutral-200">AES-256-GCM</span>
              verschlüsselt gespeichert (Encryption-at-Rest). Der Encryption-Key liegt ausschließlich
              in der Server-Umgebungsvariable und ist nicht über das Portal abrufbar.
              Übertragungen erfolgen ausschließlich über TLS 1.2+ (HTTPS).
            </p>
            <p className="mt-3">
              Die Schlüssel werden nur zur Ausführung der von dir beauftragten Workflows entschlüsselt
              und niemals an Dritte weitergegeben, die nicht in Abschnitt 7 als Sub-Processor gelistet sind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">6. Speicherdauer</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Aktive Account-Daten: für die Dauer der Vertragsbeziehung</li>
              <li>Nach Vertragsende: maximal <span className="text-neutral-200">365 Tage</span>, sofern keine längeren handels- oder steuerrechtlichen Aufbewahrungspflichten bestehen</li>
              <li>Bei Löschanfrage (Art 17 DSGVO): unverzügliche Löschung (i.d.R. binnen 30 Tagen), soweit gesetzlich zulässig</li>
              <li>API-Schlüssel: sofortige Löschung bei Entfernen durch dich oder bei Vertragsende</li>
              <li>Authentifizierungs-Logs / IP-Adressen: 30 Tage, danach anonymisiert</li>
              <li>Consent-Records (Berechtigungs-Hashes): Aufbewahrung als Nachweis nach Art 7 Abs 1 DSGVO bis 3 Jahre nach Widerruf</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">7. Sub-Processors (Auftragsverarbeiter)</h2>
            <p>
              Zur Bereitstellung des Portals setzen wir folgende Auftragsverarbeiter ein.
              Mit allen genannten Anbietern besteht ein Vertrag zur Auftragsverarbeitung
              gemäß Art 28 DSGVO. Für Drittlandstransfers gelten EU-Standardvertragsklauseln.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-300">
                    <th className="text-left py-2 pr-4 font-medium">Anbieter</th>
                    <th className="text-left py-2 pr-4 font-medium">Zweck</th>
                    <th className="text-left py-2 font-medium">Sitz</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-400">
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Cloudflare, Inc.</td>
                    <td className="py-2 pr-4">CDN, DNS, DDoS-Schutz, TLS-Termination</td>
                    <td className="py-2">USA / EU-Edges</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Vercel Inc.</td>
                    <td className="py-2 pr-4">Hosting des Portal-Frontends</td>
                    <td className="py-2">USA / EU-Region</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Supabase Inc.</td>
                    <td className="py-2 pr-4">Datenbank-Hosting (Accounts, Permissions, API-Keys verschlüsselt)</td>
                    <td className="py-2">EU (Frankfurt)</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Anthropic PBC</td>
                    <td className="py-2 pr-4">LLM-Ausführung für Auto-Plan-Workflows (nur bei Consent)</td>
                    <td className="py-2">USA</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-neutral-200">Stripe, Inc.</td>
                    <td className="py-2 pr-4">Zahlungsabwicklung</td>
                    <td className="py-2">USA / Irland</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Eine aktuelle Liste der Sub-Processors halten wir hier vor. Wir informieren dich rechtzeitig
              über Änderungen, sodass du widersprechen kannst (Art 28 Abs 2 DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">8. Cookies</h2>
            <p>
              Wir verwenden ausschließlich technisch notwendige Cookies (Session, CSRF-Schutz)
              auf Grundlage von Art 6 Abs 1 lit b DSGVO bzw. § 25 Abs 2 Nr 2 TDDDG.
              Es werden keine Tracking-, Analyse- oder Marketing-Cookies eingesetzt.
              Beim ersten Besuch fragen wir deine Zustimmung zu optionalen Cookies ab –
              standardmäßig sind nur essentielle Cookies aktiv.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">9. Deine Rechte (Art 15–21 DSGVO)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="text-neutral-200">Auskunft</span> (Art 15) – über die zu deiner Person gespeicherten Daten</li>
              <li><span className="text-neutral-200">Berichtigung</span> (Art 16) – unrichtiger Daten</li>
              <li><span className="text-neutral-200">Löschung</span> (Art 17) – „Recht auf Vergessenwerden", soweit keine Aufbewahrungspflicht entgegensteht</li>
              <li><span className="text-neutral-200">Einschränkung der Verarbeitung</span> (Art 18)</li>
              <li><span className="text-neutral-200">Datenübertragbarkeit</span> (Art 20) – Export in maschinenlesbarem Format</li>
              <li><span className="text-neutral-200">Widerspruch</span> (Art 21) – gegen Verarbeitungen auf Grundlage berechtigter Interessen</li>
              <li><span className="text-neutral-200">Widerruf einer Einwilligung</span> (Art 7 Abs 3) – jederzeit mit Wirkung für die Zukunft</li>
            </ul>
            <p className="mt-3">
              Die Rechte kannst du formlos per Mail an{' '}
              <a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a>{' '}
              ausüben. Account-Löschung und Datenexport sind zusätzlich direkt im Portal unter „Profile" verfügbar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">10. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p>
              Du hast nach Art 77 DSGVO das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren. Zuständig für den Verantwortlichen ist:
            </p>
            <p className="mt-3">
              <span className="text-neutral-200">Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</span><br />
              Promenade 18, 91522 Ansbach<br />
              <a href="https://www.lda.bayern.de" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">www.lda.bayern.de</a>
            </p>
            <p className="mt-3">
              Du kannst dich auch an die für deinen Wohnort zuständige Aufsichtsbehörde
              oder an den/die Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI) wenden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">11. Automatisierte Entscheidungsfindung</h2>
            <p>
              Eine ausschließlich automatisierte Entscheidungsfindung mit Rechtswirkung
              im Sinne von Art 22 DSGVO findet nicht statt. Die Auto-Plan-Funktion führt
              keine Profilbildung durch und ist nur mit deinem aktiven Consent aktiv.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">12. Änderungen dieser Erklärung</h2>
            <p>
              Wir passen diese Datenschutzerklärung an, wenn sich Rechtslage oder Verarbeitungen
              ändern. Die jeweils aktuelle Fassung ist unter dieser URL abrufbar. Substantielle
              Änderungen kommunizieren wir aktiv per E-Mail.
            </p>
          </section>

        </article>
      </section>
    </div>
  );
}
