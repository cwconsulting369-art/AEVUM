import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function Datenschutz() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: 'Datenschutzerklärung — AEVUM',
    description: 'DSGVO-konforme Datenschutzerklärung von AEVUM: Verantwortlicher, Sub-Processors, Retention-Policies, Nutzerrechte (Art 15/17/20). Stand 24.05.2026.',
    path: '/datenschutz',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Datenschutzerklärung',
      url: 'https://aevum-system.de/datenschutz',
      inLanguage: 'de-DE',
      isPartOf: { '@type': 'WebSite', name: 'AEVUM', url: 'https://aevum-system.de' },
      datePublished: '2026-05-19',
      dateModified: '2026-05-24',
    },
  });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4 break-words">
          Datenschutz<span className="text-theme-accent">erklärung</span>
        </h1>

        <p className="text-sm text-text-muted mb-6">Stand: 24. Mai 2026 · Version: datenschutz-v6-waveH-2026-05-24</p>

        <div className="mb-12 border border-theme-border-accent bg-theme-accent-soft px-5 py-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-theme-accent">Hinweis (Stand 25.05.2026):</strong> Diese Datenschutzerklärung
          ist ein Eigen-Entwurf und beschreibt die tatsächlich eingesetzten Verarbeitungen so präzise
          wie möglich. Eine abschließende anwaltliche Prüfung steht noch aus und ist vor produktivem
          Vertrieb geplant. Wir aktualisieren diese Seite, sobald die Prüfung erfolgt ist.
        </div>

        <article className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der DSGVO und anderer nationaler Datenschutzgesetze
              der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
            </p>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen, Deutschland<br />
              E-Mail: <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>
            </p>
            <p className="text-sm text-text-muted">
              Ein Datenschutzbeauftragter ist gesetzlich nicht erforderlich (kein
              Schwellenwert nach § 38 BDSG erreicht).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">2. Welche Daten wir verarbeiten</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Workflow-Audit-Formular:</strong> Name, Firma, E-Mail, Telefon (optional), Branche, Teamgröße, Business-Beschreibung, aktuelle Tools, Budget-Rahmen, Timeline</li>
              <li><strong>Shop-Checkout:</strong> Name, Firma, E-Mail, gewähltes Paket, optional Add-ons</li>
              <li><strong>Zahlungsabwicklung über Stripe:</strong> Name, Rechnungsadresse, Zahlungsart-Metadaten (Karten-/Bankdaten sehen wir NIE — diese verbleiben bei Stripe)</li>
              <li><strong>Server-Log-Daten:</strong> IP-Adresse, User-Agent, Referrer, Zeitstempel (zur Missbrauchsabwehr, IP-Anonymisierung nach 30 Tagen)</li>
              <li><strong>Einwilligungs-Metadaten:</strong> Zeitpunkt, Version und Inhalt der erteilten Einwilligung (Art 7 DSGVO Nachweispflicht)</li>
              <li><strong>Bestell- und Rechnungs-Daten:</strong> Vertragsdaten, Buchungs-Metadaten</li>
              <li><strong>Helpbot / AI-Chat:</strong> Anonyme Session-ID (zufällig vergeben, kein Personenbezug), Inhalt der Nachrichten an den AEVUM-Assistant, anonymisierte IP (letztes Oktett genullt /24), User-Agent, Referrer, Sprache. <em>Keine</em> Erfassung von Name, E-Mail oder Telefon im Helpbot.</li>
              <li><strong>Customer-Portal (app.aevum-system.de):</strong> Account-Stammdaten (Name, Firma, Telefon optional), Profil-Daten (Branche, Team-Größe, Vision), API-Keys (AES-256-GCM verschlüsselt in Supabase, nie im Frontend lesbar), Magic-Link-Tokens (single-use, 30 Min Lebensdauer)</li>
              <li><strong>Customer-Documents (Inbox/Outbox/Shared):</strong> Vom Kunden bzw. AEVUM hochgeladene Dateien (PDF, DOCX, XLSX, CSV, PNG/JPG) im Rahmen aktiver Projekte, max. 5 MB pro Datei, Magic-Byte-Validation gegen Datei-Spoofing</li>
              <li><strong>Customer-Project-Agent (LLM-Chat im Portal):</strong> Chat-Inhalt + Memory-Files (.md) zur Wissens-Speicherung pro Projekt, übermittelt an Anthropic (Claude Sonnet 4.5) zur Antwort-Generierung</li>
              <li><strong>Script-Factory-Runs (SaaS):</strong> Brand-Profile, Produkt-Beschreibung, Hook-Goal, Platform, generierte Skript-Variationen — übermittelt an Anthropic zur Generierung, Resultat im Customer-Account gespeichert</li>
              <li><strong>DSGVO-Factory-Runs (SaaS):</strong> Audit-Input-Daten (Branche, verarbeitete Daten-Kategorien, Tools), generiertes PDF-Audit, übermittelt an Anthropic zur Empfehlungs-Generierung</li>
              <li><strong>Lead-Magnet-Anmeldungen:</strong> E-Mail + Name + gewählter Lead-Magnet-Slug zur PDF-Versendung (z.B. EU-AI-Act-Compliance-Guide)</li>
              <li><strong>SaaS-Waitlist:</strong> E-Mail + gewähltes Tool-Slug zur Benachrichtigung bei Tool-Verfügbarkeit</li>
              <li><strong>Testimonials (Cases):</strong> Vom Kunden freigegebene Texte, Video-URL, Brand-Name, Logo, Kennzahlen — Display nur nach explizit gewährter Permission (case_pages Flag)</li>
              <li><strong>Subscription-/Cost-Tracking (intern):</strong> AEVUM-eigene Software-Abos und deren Zuordnung zu Customer-Projekten — interne Buchhaltung, kein Customer-PII enthalten</li>
              <li><strong>LLM-Usage-Logs:</strong> agent_usage_log mit anonymisierter IP, Account-Referenz, Tokens-In/Out, Kosten (Cent) — zur Abrechnung der Pay-per-Run SaaS-Tools, IP-Anonymisierung sofort beim Schreiben (write-time)</li>
              <li><strong>Telegram-Bot Magic-Links:</strong> Wenn Customer mit dem AEVUM-Telegram-Bot interagiert (optional, opt-in über Portal): Telegram-User-ID, Chat-ID, zuletzt empfangene Magic-Links</li>
            </ul>
            <p>
              Es findet <strong>kein automatisiertes Profiling</strong> und keine automatisierte
              Einzelfall-Entscheidung im Sinne von Art 22 DSGVO statt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">3. Zwecke und Rechtsgrundlagen</h2>
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
            <h2 className="text-2xl font-light text-text-primary mb-3">4. Empfänger und Auftragsverarbeiter</h2>
            <p>
              Wir setzen sorgfältig ausgewählte Dienstleister im Rahmen einer Auftragsverarbeitung
              nach Art 28 DSGVO ein. Mit allen aufgeführten Anbietern bestehen oder werden vor
              produktivem Einsatz Auftragsverarbeitungsverträge geschlossen.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-theme-border">
                <thead className="bg-bg-surface">
                  <tr className="text-left">
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">Anbieter</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">Zweck</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">Sitz / Server-Standort</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">Garantien</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Supabase Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">Datenbank-Hosting</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA / EU (Frankfurt eu-central-1)</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV + EU-Standardvertragsklauseln</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Vercel Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">Frontend-Hosting / CDN</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA / EU-Edge</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV + EU-SCCs (Data Privacy Framework)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Cloudflare Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">CDN, DDoS- und Bot-Abwehr</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA / globales Edge-Netz (EU-Priorisierung)</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV + EU-SCCs (Data Privacy Framework)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Stripe Payments Europe Ltd.</td>
                    <td className="px-3 py-2 border-b border-theme-border">Zahlungsabwicklung</td>
                    <td className="px-3 py-2 border-b border-theme-border">Irland / EU (Mutterkonzern USA)</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV + EU-SCCs, PCI-DSS Level 1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Anthropic PBC</td>
                    <td className="px-3 py-2 border-b border-theme-border">AI-gestützte Audit-Analyse + Helpbot-Chat (Verarbeitung der vom Nutzer eingegebenen Audit-Antworten und Chat-Nachrichten zur Erstellung der Workflow-Empfehlung bzw. Beantwortung der Anfrage; keine Trainings-Nutzung gemäß Anthropic Commercial Terms, Zero-Retention API)</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV (Anthropic DPA) + EU-SCCs (Modul 2), Zero-Retention API</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Mailbox.org (Heinlein Support GmbH)</td>
                    <td className="px-3 py-2 border-b border-theme-border">SMTP-Fallback für Transaktions-E-Mails (Magic-Link-Login, DSGVO-Challenge-Bestätigungen für Export/Löschung); nur als Fallback aktiv wenn Resend nicht verfügbar</td>
                    <td className="px-3 py-2 border-b border-theme-border">Deutschland (Berlin)</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV nach Art 28 DSGVO, § 32 BDSG, ISO 27001-zertifiziert</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Resend (Resend, Inc.)</td>
                    <td className="px-3 py-2 border-b border-theme-border">Primärer Versand von Transaktions-E-Mails (Magic-Link-Login, Lead-Magnet-PDFs, Bestell-Bestätigungen, DSGVO-Challenge-Bestätigungen, Waitlist-Notifications)</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA, EU-Region verfügbar</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV + EU-SCCs (Modul 2), SOC 2 Type II, EU-Sub-Processor</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Telegram FZ-LLC</td>
                    <td className="px-3 py-2 border-b border-theme-border">Versand von Bot-Notifications, Customer-Magic-Links und Helpbot-Benachrichtigungen an opt-in Telegram-Accounts (nur wenn vom Kunden explizit aktiviert)</td>
                    <td className="px-3 py-2 border-b border-theme-border">Vereinigte Arabische Emirate / Schweiz</td>
                    <td className="px-3 py-2 border-b border-theme-border">Standard-Drittland-Übertragung; nur ID-Felder + Magic-Link-URL übermittelt, keine PII-Inhalte; opt-in Basis Art 6 Abs 1 lit a</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">OpenRouter Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">LLM-Routing-Gateway (Anthropic-Modelle) für ausgewählte interne Background-Tasks (z.B. Klassifizierung, Idea-Processing). Verarbeitet keine Customer-Chat-Inhalte direkt — primäre LLM-Verarbeitung läuft über Anthropic-Direct-API.</td>
                    <td className="px-3 py-2 border-b border-theme-border">USA</td>
                    <td className="px-3 py-2 border-b border-theme-border">AVV ausstehend (vor Q3 2026 zu signieren); EU-SCCs (Modul 2). Zero-Retention-Mode wo verfügbar.</td>
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
            <h2 className="text-2xl font-light text-text-primary mb-3">5. Zahlungsabwicklung über Stripe</h2>
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
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">
                stripe.com/de/privacy
              </a>
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art 6 Abs 1 lit b DSGVO (Vertragserfüllung) + lit f
              (Betrugsprävention).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">6. Auftragsverarbeitung für gewerbliche Kunden (AVV)</h2>
            <p>
              Soweit AEVUM im Rahmen der Leistungserbringung für gewerbliche Kunden personenbezogene
              Daten Dritter (z.B. Endkundendaten, Mitarbeiter-Daten) verarbeitet, geschieht dies
              ausschließlich auf Grundlage eines separaten Auftragsverarbeitungsvertrags nach
              <strong> Art 28 DSGVO</strong>. Ein Standard-AVV-Template stellen wir auf Anfrage
              kostenfrei zur Verfügung. Anfragen bitte per E-Mail an{' '}
              <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">6a. Helpbot / AI-Chat</h2>
            <p>
              Der auf der AEVUM-Website verfügbare Helpbot (AEVUM Assistant) beantwortet Fragen rund
              um KI-Betriebssysteme. Er ist <strong>anonym</strong> nutzbar — wir erfassen keine Namen,
              E-Mails oder Telefonnummern.
            </p>
            <p>
              <strong>Verarbeitete Daten:</strong> Inhalt der von dir eingegebenen Nachrichten,
              eine zufällig generierte Session-ID (nicht personenbezogen), anonymisierte IP-Adresse
              (letztes Oktett genullt, /24), User-Agent, Referrer und Sprach-Kennung.
            </p>
            <p>
              <strong>Zweck:</strong> Beantwortung deiner Anfrage, Verbesserung der Antwort-Qualität,
              Missbrauchsabwehr (Rate-Limiting, Pattern-basierte Filterung gegen Injection-Angriffe
              und Spam).
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art 6 Abs 1 lit a DSGVO (deine Einwilligung, die du
              vor der ersten Nachricht im Chat-Fenster erteilst). Die Einwilligung kann jederzeit
              widerrufen werden, indem du den Verlauf über das Mülleimer-Symbol im Chat löschst.
              Zusätzlich Art 6 Abs 1 lit f DSGVO für die Missbrauchsabwehr (berechtigtes Interesse an
              IT-Sicherheit).
            </p>
            <p>
              <strong>Empfänger / Sub-Processor:</strong> Die eingegebenen Nachrichten werden für die
              Generierung der Antwort an <strong>Anthropic PBC</strong> (Modell „Claude Sonnet 4.5",
              USA) übermittelt. Anthropic verarbeitet die Daten als unser Auftragsverarbeiter unter
              EU-Standardvertragsklauseln (Modul 2), nutzt sie nicht zum Modell-Training (Anthropic
              Commercial Terms, Zero-Retention API). Übermittlung über die AEVUM-API
              (api.aevum-system.de) als ergänzender Sub-Prozess.
            </p>
            <p>
              <strong>Speicherdauer:</strong> Chat-Verläufe werden maximal <strong>30 Tage</strong>{' '}
              gespeichert und danach automatisch (täglicher Cron-Job) gelöscht.
            </p>
            <p>
              <strong>Recht auf Löschung:</strong> Du kannst deinen Chat-Verlauf jederzeit selbst
              löschen über:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>das <strong>Mülleimer-Symbol</strong> im Chat-Header bzw. „Verlauf löschen" unter dem Eingabefeld</li>
              <li>oder per E-Mail an <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a> mit deiner Session-ID</li>
            </ul>
            <p className="text-sm text-text-muted mt-2">
              Die Lösch-Funktion ruft den API-Endpunkt <code className="text-theme-accent">POST /api/helpbot/erase</code>{' '}
              auf, der den entsprechenden Datenbank-Eintrag unverzüglich entfernt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">7. Speicherdauer</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aktive Audit-Anfragen: bis Vertragsabschluss oder begründeter Ablehnung</li>
              <li>Abgeschlossene Audits ohne Vertragsschluss: 12 Monate ab Abschluss, danach Löschung</li>
              <li>Bestell- und Rechnungs-Daten: 10 Jahre (§ 257 HGB, § 147 AO)</li>
              <li>Stripe-Zahlungsdaten: gemäß Stripe-Datenschutzerklärung, in der Regel ebenfalls 10 Jahre wegen handels- und steuerrechtlicher Aufbewahrungspflichten</li>
              <li>Server-Logs: 30 Tage (danach IP-Anonymisierung), aggregierte Security-Statistiken bis zu 90 Tage</li>
              <li>Helpbot / AI-Chat Verläufe: 30 Tage ab letzter Nachricht, danach automatische Löschung; jederzeit vom Nutzer selbst löschbar</li>
              <li>Customer-Project-Agent-Memory: bis Kunde löscht oder Account beendet wird</li>
              <li>Customer-Documents (Inbox/Outbox/Shared): keine automatische Löschung — Customer-Owned, manuell vom Kunden löschbar; bei Account-Schließung Löschung innerhalb 30 Tagen</li>
              <li>Script-Factory- und DSGVO-Factory-Run-Daten: 30 Tage nach Run-Abschluss (Customer kann auf Anfrage verlängern), danach automatische Löschung</li>
              <li>Lead-Magnet-Anmeldungen: 6 Monate nach Anmeldung, danach automatische Löschung</li>
              <li>SaaS-Waitlist-Einträge: bis Tool live + 30 Tage nach Notification, danach automatische Löschung</li>
              <li>LLM-Usage-Logs (agent_usage_log): 90 Tage detailliert, danach aggregierte Statistik bis zu 12 Monaten (anonymisiert, ohne IP)</li>
              <li>Magic-Link-Tokens (Login + DSGVO-Challenges): 30 Min Lebensdauer, dann ungültig; verbrauchte Tokens werden nach 24 h gelöscht (single-use Schutz)</li>
              <li>Bestell- und Rechnungs-Daten: 10 Jahre (§ 257 HGB, § 147 AO) — bei DSGVO-Löschung erfolgt Pseudonymisierung statt vollständiger Löschung</li>
              <li>Einwilligungs-Nachweise (Art 7 Abs 1 DSGVO): bis Widerruf zzgl. 3 Jahre Regelverjährung (§ 195 BGB)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">8. Ihre Rechte als Betroffene Person</h2>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über Ihre verarbeiteten Daten (Art 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art 16 DSGVO)</li>
              <li>Löschung (Art 17 DSGVO) – direkt umsetzbar per E-Mail oder über den API-Endpunkt <code className="text-theme-accent">POST /api/audit/erase</code></li>
              <li>Einschränkung der Verarbeitung (Art 18 DSGVO)</li>
              <li>Datenübertragbarkeit in einem strukturierten, gängigen Format (Art 20 DSGVO)</li>
              <li>Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen (Art 21 DSGVO)</li>
              <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art 7 Abs 3 DSGVO)</li>
            </ul>
            <p className="mt-4">
              Anfragen bitte per E-Mail an{' '}
              <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>.
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
              <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">www.lda.bayern.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">9. Cookies und Tracking</h2>
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
            <h2 className="text-2xl font-light text-text-primary mb-3">10. Datensicherheit (Technische und organisatorische Maßnahmen)</h2>
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
            <h2 className="text-2xl font-light text-text-primary mb-3">11. Änderungen dieser Datenschutzerklärung</h2>
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
