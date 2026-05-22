import { useEffect } from 'react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';

export default function AGB() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition"><Brand size={28} /></Link>
        </div>
      </header>

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-light tracking-tight mb-2">Nutzungsbedingungen</h1>
        <p className="text-sm text-neutral-500 mb-2">Gilt für: <span className="text-neutral-300">app.aevum-system.de</span> (Customer-Portal)</p>
        <p className="text-sm text-neutral-500 mb-12">Stand: 22. Mai 2026</p>

        <article className="space-y-10 text-neutral-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">1. Geltungsbereich</h2>
            <p>
              Diese Nutzungsbedingungen regeln die Verwendung des AEVUM Customer-Portals
              unter app.aevum-system.de. Die kommerziellen Hauptleistungen (Workflows,
              Audits, Subscriptions) richten sich nach den Allgemeinen Geschäftsbedingungen
              auf{' '}
              <a href="https://aevum-system.de/agb" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">
                aevum-system.de/agb
              </a>, die im Konflikt vorrangig sind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">2. Vertragspartner</h2>
            <p>Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen, Deutschland (siehe{' '}
              <Link to="/impressum" className="text-amber-500 hover:underline">Impressum</Link>).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">3. Zugang</h2>
            <p>
              Der Portalzugang erfolgt per Magic-Link an deine registrierte E-Mail-Adresse.
              Der Link ist 30 Minuten gültig und einmalig einlösbar. Du bist verantwortlich
              für den Schutz deines Mail-Postfachs und deiner aktiven Sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">4. Nutzungsumfang</h2>
            <p>
              Das Portal dient ausschließlich der Verwaltung deines Accounts, deiner Projekte,
              Berechtigungen und API-Schlüssel. Untersagt sind insbesondere:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Reverse Engineering, Scraping, automatisierte Massenabfragen außerhalb dokumentierter APIs</li>
              <li>Einbringung fremder API-Schlüssel ohne Berechtigung</li>
              <li>Versuche, andere Accounts auszuspähen oder Zugangsschranken zu umgehen</li>
              <li>Hochladen rechtswidriger, urheberrechtsverletzender oder schädlicher Inhalte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">5. API-Schlüssel</h2>
            <p>
              Wenn du API-Schlüssel im Portal hinterlegst, versicherst du, dass du zur
              Nutzung berechtigt bist. Wir speichern Schlüssel verschlüsselt (AES-256-GCM)
              und nutzen sie ausschließlich zur Ausführung der von dir beauftragten Workflows.
              Details siehe{' '}
              <Link to="/datenschutz" className="text-amber-500 hover:underline">Datenschutzerklärung</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">6. Verfügbarkeit</h2>
            <p>
              Wir bemühen uns um eine hohe Verfügbarkeit des Portals, übernehmen jedoch keine
              Garantie für ununterbrochene Erreichbarkeit. Wartungsarbeiten kündigen wir
              nach Möglichkeit vorab an. Service-Level-Zusagen aus separaten Verträgen
              bleiben unberührt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">7. Haftung</h2>
            <p>
              Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden
              aus der Verletzung des Lebens, des Körpers oder der Gesundheit. Bei einfacher
              Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten
              (Kardinalpflichten) und begrenzt auf den vertragstypisch vorhersehbaren Schaden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">8. Kündigung &amp; Account-Löschung</h2>
            <p>
              Du kannst dein Portal-Konto jederzeit per Mail oder direkt im Portal löschen
              lassen. Aufbewahrungsfristen bleiben unberührt (siehe Datenschutzerklärung,
              Abschnitt 6).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">9. Anwendbares Recht</h2>
            <p>
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Zwingende
              verbraucherschützende Vorschriften des Staates, in dem du deinen gewöhnlichen
              Aufenthalt hast, bleiben unberührt. Gerichtsstand für Kaufleute ist Augsburg.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">10. Änderungen</h2>
            <p>
              Wir können diese Nutzungsbedingungen anpassen. Substantielle Änderungen
              kommunizieren wir per E-Mail mit angemessener Vorlaufzeit. Bei Widerspruch
              hast du das Recht zur außerordentlichen Kündigung.
            </p>
          </section>

        </article>
      </section>
    </div>
  );
}
