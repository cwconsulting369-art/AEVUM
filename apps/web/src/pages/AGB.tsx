import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function AGB() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: 'AGB — AEVUM Allgemeine Geschäftsbedingungen',
    description: 'Allgemeine Geschäftsbedingungen von AEVUM für Workflow-Audits, AI-Systeme, SaaS-Tools und Add-on-Services. Stand 24.05.2026.',
    path: '/agb',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Allgemeine Geschäftsbedingungen (AGB)',
      url: 'https://aevum-system.de/agb',
      inLanguage: 'de-DE',
      isPartOf: { '@type': 'WebSite', name: 'AEVUM', url: 'https://aevum-system.de' },
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
          Allgemeine <span className="text-theme-accent">Geschäftsbedingungen</span>
        </h1>

        <p className="text-sm text-text-muted mb-6">Stand: 24. Mai 2026 · Version: agb-v3-saas-2026-05-24</p>

        <div className="mb-12 border border-theme-border-accent bg-theme-accent-soft px-5 py-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-theme-accent">Hinweis (Stand 25.05.2026):</strong> Dieser Text ist ein
          Eigen-Entwurf des Anbieters und wurde noch nicht durch eine externe Rechtsanwaltskanzlei
          freigegeben. Wir arbeiten aktiv an einer anwaltlichen Prüfung vor produktivem Vertrieb.
          Bis dahin gilt: bei rechtlich kritischen Konstellationen bitte vor Vertragsschluss
          zusätzlich eigene anwaltliche Beratung einholen.
        </div>

        <article className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 1 Geltungsbereich und Vertragspartner</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Verträge zwischen
              Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen (nachfolgend „Anbieter" oder
              „AEVUM") und seinen Kunden über die Erbringung von AEVUM-Dienstleistungen
              (Workflow-Audit, AI-Systeme, Lead-Generation-Setup, Content-Workflows,
              AI-Automation, Data-Engineering, Hosting und Wartung).
            </p>
            <p>
              AEVUM richtet sich primär an Unternehmer im Sinne von § 14 BGB (B2B). Bei
              Verbrauchern im Sinne von § 13 BGB (B2C) gelten ergänzend die gesetzlichen
              Verbraucherschutz-Regelungen, insbesondere das Widerrufsrecht (siehe{' '}
              <a href="#/widerrufsbelehrung" className="text-theme-accent hover:underline">Widerrufsbelehrung</a>).
            </p>
            <p>
              Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nur Vertragsbestandteil,
              wenn AEVUM ihrer Geltung ausdrücklich schriftlich zugestimmt hat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 2 Vertragsschluss</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Die Darstellung der Pakete und Add-ons auf der Website stellt kein bindendes
                Angebot, sondern eine Aufforderung zur Abgabe eines Angebots dar.
              </li>
              <li>
                Der Vertrag kommt durch Bestellung eines Pakets (S/M/L oder Add-on) über den
                Stripe-Checkout oder durch beidseitige schriftliche Vereinbarung (auch E-Mail)
                zustande. Bei Direktkauf über Stripe gilt der Vertrag mit erfolgreicher
                Zahlungsbestätigung als geschlossen. AEVUM versendet eine Auftragsbestätigung
                per E-Mail.
              </li>
              <li>
                AEVUM ist berechtigt, Bestellungen ohne Begründung abzulehnen — z.B. wenn die
                Anfrage nicht zum AEVUM-Profil passt oder Lieferung nicht gewährleistet werden
                kann. In diesem Fall wird eine bereits geleistete Zahlung unverzüglich
                rückerstattet.
              </li>
              <li>
                Der Vertragstext wird auf den Systemen von AEVUM gespeichert. Der Kunde erhält
                eine Bestätigungs-E-Mail mit den wesentlichen Vertragsdaten und einem Link zu
                den jeweils gültigen AGB.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 3 Leistungsgegenstand</h2>
            <p>Der konkrete Leistungsumfang ergibt sich aus der Paketbeschreibung auf der Website:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Paket S — Start (3.900 €):</strong> Workflow-Audit + Automatisierungs-Roadmap + Priorisierungs-Matrix, Lieferung in 5 Werktagen nach Kickoff. Kein Build inkludiert.</li>
              <li><strong>Paket M — Wachstum (12.900 €):</strong> Vollständige Implementation 1–2 Use Cases, Integration mit bestehenden Tools, 4–8 Wochen Lieferzeit, 3 Monate Support nach Go-Live.</li>
              <li><strong>Paket L — Skalierung (4.900 € / Monat):</strong> Laufende Optimierung, monatliche Performance-Reports, neue Use Cases on-demand, priorisierte Entwicklung.</li>
              <li><strong>Add-on-Services</strong> (Website, Lead-Gen-Setup, Content-Workflow, AI-Automation pro Use Case): einzelne Standalone-Pakete mit definiertem Scope, Preis und Lieferzeit gemäß Website.</li>
              <li><strong>SaaS-Tools (Pay-per-Run, Credit-basiert):</strong> Self-Service Software-Tools (Script-Factory, DSGVO-Factory u.a.). Bereitstellung als Software-as-a-Service mit Credit-Verbrauch pro Lauf. Pakete:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Starter: 10 € (begrenztes monatliches Credit-Kontingent)</li>
                  <li>Growth: 25 € (mittleres Kontingent)</li>
                  <li>Pro: 50 € (großes Kontingent)</li>
                </ul>
              </li>
            </ul>
            <p>
              AEVUM ist berechtigt, Lieferungen in Teilleistungen zu erbringen. Liefertermine
              sind unverbindlich, soweit nicht ausdrücklich schriftlich als Fixtermin vereinbart.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 4 Vergütung und Zahlungsbedingungen</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Es gelten die zum Zeitpunkt der Bestellung auf der Website ausgewiesenen Preise
                in Euro. <strong>Als Kleinunternehmer im Sinne von § 19 UStG weist AEVUM keine
                Umsatzsteuer aus.</strong> Die ausgewiesenen Preise sind Endpreise.
              </li>
              <li>
                Bei einmaligen Paketen ist die Zahlung vor Lieferung fällig (Bezahlung über
                Stripe oder Banküberweisung nach Absprache).
              </li>
              <li>
                Bei monatlich abgerechneten Paketen (L) erfolgt die Abrechnung am Monatsersten
                für den jeweils kommenden Monat per SEPA-Lastschrift oder Kreditkarte über Stripe.
              </li>
              <li>
                Bei Zahlungsverzug werden Verzugszinsen i.H.v. 9 Prozentpunkten über dem
                Basiszinssatz (§ 288 Abs 2 BGB) berechnet. Bei Verbrauchern gelten
                5 Prozentpunkte (§ 288 Abs 1 BGB).
              </li>
              <li>
                <strong>Pilot-Programm-Rabatt:</strong> wird automatisch im Checkout abgezogen,
                solange Pilot-Slots verfügbar sind. Im Tausch verpflichtet sich der Kunde zur
                Aufnahme eines Testimonial-Videos nach 90 Tagen Laufzeit und zur Veröffentlichung
                als Case-Study. AEVUM erhält das Recht, das Video nach Freigabe durch den
                Kunden auf der Website und in Akquise-Material zu nutzen.
              </li>
              <li>
                <strong>Bundle-Rabatte:</strong> 2 Services −10 %, 3 Services −15 %,
                4 Services −20 % zzgl. 1 Monat Paket L gratis. Bundles werden bei
                Mehrfach-Buchung automatisch oder auf Anfrage im Checkout angewendet.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 5 Zahlungsabwicklung (Stripe)</h2>
            <p>
              Die Zahlungsabwicklung erfolgt über die Stripe Payments Europe Ltd., 1 Grand
              Canal Street Lower, Grand Canal Dock, Dublin, Irland (nachfolgend „Stripe").
              Stripe ist PCI-DSS-Level-1-zertifizierter Zahlungsdienstleister. AEVUM speichert
              keine Karten- oder Bankverbindungsdaten.
            </p>
            <p>
              Welche Daten Stripe verarbeitet und auf welcher Rechtsgrundlage, ist in der{' '}
              <a href="#/datenschutz" className="text-theme-accent hover:underline">Datenschutzerklärung</a>{' '}
              detailliert beschrieben.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 5a SaaS-Tools — Credit-Verbrauch, Refund-Policy und Premium-Track</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Credit-Verbrauch:</strong> Jeder erfolgreiche Lauf eines SaaS-Tools (z.B.
                Script-Factory, DSGVO-Factory) verbraucht eine in der Tool-Beschreibung
                ausgewiesene Anzahl Credits aus dem aktiven Tarif-Paket des Kunden.
              </li>
              <li>
                <strong>Auto-Refund bei Fehlschlag:</strong> Schlägt ein Lauf aufgrund technischer
                Fehler oder LLM-Ausfälle fehl, werden die verbrauchten Credits automatisch dem
                Konto wieder gutgeschrieben (System-Refund-Flow). Ein manueller Anspruch entsteht
                nicht in Fällen unsachgemäßer Eingaben oder bewusster Missbrauchs-Versuche.
              </li>
              <li>
                <strong>Bestand und Übertragbarkeit:</strong> Nicht verbrauchte Credits verfallen
                am Monatsende bzw. am Ende der Abrechnungsperiode des gewählten Pakets. Eine
                Übertragung zwischen Accounts oder Auszahlung in Geld ist ausgeschlossen.
              </li>
              <li>
                <strong>Tool-Verfügbarkeit:</strong> SaaS-Tools werden „as-is" bereitgestellt.
                AEVUM strebt eine Verfügbarkeit von 99 % im Monatsmittel an, ohne Anspruch auf
                ständige Erreichbarkeit. Ausfälle bei LLM-Sub-Dienstleistern (Anthropic, OpenAI)
                werden nicht in die Verfügbarkeitsberechnung einbezogen.
              </li>
              <li>
                <strong>Premium-Track für Partner-Agenturen (z.B. Tim's Customer-Pipeline):</strong>{' '}
                Bei separat vereinbarter Premium-Zusammenarbeit, in der eine Partner-Agentur
                ihre eigenen Endkunden über AEVUM-Tools bedient, gilt: Die Partner-Agentur ist
                Verantwortlicher im Sinne von Art 4 Nr 7 DSGVO für die Daten ihrer Endkunden,
                AEVUM ist Auftragsverarbeiter nach Art 28 DSGVO. Ein separater AVV wird vor
                Aufnahme der Zusammenarbeit geschlossen. Die Vergütungs- und Provisionsmodelle
                werden in einem ergänzenden Partnervertrag geregelt.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 6 Mitwirkungspflichten des Kunden</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Der Kunde stellt AEVUM alle für die Leistungserbringung notwendigen Informationen, Zugänge und Materialien rechtzeitig zur Verfügung.</li>
              <li>Wenn der Kunde personenbezogene Daten Dritter (z.B. Endkunden, Mitarbeiter) verarbeitet, schließen die Parteien einen separaten Auftragsverarbeitungsvertrag (AVV) nach Art 28 DSGVO. Ein Template stellt AEVUM auf Anfrage kostenfrei zur Verfügung.</li>
              <li>Der Kunde sichert seine Zugangsdaten zu AEVUM-Systemen angemessen und meldet Verdacht auf Kompromittierung unverzüglich.</li>
              <li>Verzögerungen, die durch fehlende Mitwirkung des Kunden entstehen, sind nicht von AEVUM zu vertreten. AEVUM ist berechtigt, daraus entstehenden Mehraufwand nach üblichen Stundensätzen abzurechnen.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 7 Nutzungsrechte</h2>
            <p>
              Soweit AEVUM im Rahmen der Leistungserbringung urheberrechtlich geschützte Werke
              erstellt (Code, Workflows, Dokumentation, Konfigurationen), erhält der Kunde
              nach vollständiger Zahlung ein einfaches, nicht-exklusives, zeitlich und räumlich
              unbeschränktes Nutzungsrecht für den vereinbarten Zweck.
            </p>
            <p>
              AEVUM behält das Recht, generische Komponenten, Templates, Patterns und
              Methodik-Bausteine für andere Projekte wiederzuverwenden, soweit dadurch keine
              kundenspezifischen vertraulichen Informationen offengelegt werden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 8 Verfügbarkeit (Paket L und Hosting-Services)</h2>
            <p>
              AEVUM strebt eine Verfügbarkeit der gehosteten Systeme von 99 % im Jahresmittel
              an, ohne Anspruch auf ständige Erreichbarkeit. Geplante Wartungsfenster und
              Störungen bei Sub-Dienstleistern (Vercel, Supabase, Cloudflare, Stripe
              etc.) werden nicht in die Verfügbarkeitsberechnung einbezogen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 9 Haftung</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>AEVUM haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.</li>
              <li>Bei leichter Fahrlässigkeit haftet AEVUM nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen, vorhersehbaren Schaden.</li>
              <li>Bei B2B-Verträgen ist die Haftung der Höhe nach auf den Wert der jeweiligen Bestellung (bei Subscription: 12 Monate Vergütung) begrenzt.</li>
              <li>Eine darüber hinausgehende Haftung ist ausgeschlossen.</li>
              <li>Die Haftung nach dem Produkthaftungsgesetz und für arglistig verschwiegene Mängel bleibt unberührt.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 10 Datenschutz und Vertraulichkeit</h2>
            <p>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß{' '}
              <a href="#/datenschutz" className="text-theme-accent hover:underline">Datenschutzerklärung</a>.
              Soweit AEVUM personenbezogene Daten im Auftrag des Kunden verarbeitet (z.B.
              Endkunden-Daten), wird ein separater AVV nach Art 28 DSGVO geschlossen.
            </p>
            <p>
              Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten,
              nicht offenkundigen Informationen vertraulich zu behandeln. Diese Pflicht gilt
              auch über die Vertragslaufzeit hinaus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 11 Widerrufsrecht (nur Verbraucher)</h2>
            <p>
              Verbraucher im Sinne von § 13 BGB haben ein gesetzliches Widerrufsrecht von
              14 Tagen ab Vertragsschluss. Details siehe{' '}
              <a href="#/widerrufsbelehrung" className="text-theme-accent hover:underline">Widerrufsbelehrung</a>.
            </p>
            <p>
              Bei sofortigem Beginn der Dienstleistung auf ausdrücklichen Wunsch des
              Verbrauchers vor Ablauf der Widerrufsfrist erlischt das Widerrufsrecht nach
              vollständiger Leistungserbringung (§ 356 Abs 4 BGB). Bei vorzeitigem Widerruf
              nach Beginn der Leistung wird anteilig abgerechnet (§ 357a Abs 2 BGB).
            </p>
            <p>
              Bei B2B-Kunden besteht kein gesetzliches Widerrufsrecht. AEVUM gewährt freiwillig
              eine 14-tägige Stornierung vor Beginn der Leistungserbringung (Kickoff) mit
              voller Erstattung. Nach Kickoff: anteilige Abrechnung nach Aufwand.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 12 Laufzeit und Kündigung</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Einmal-Pakete (S, M, Add-ons): enden mit vollständiger Leistungserbringung.</li>
              <li>Subscription (Paket L): Mindestlaufzeit 3 Monate, danach monatlich kündbar zum Monatsende mit Frist von 14 Tagen.</li>
              <li>Bei Jahres-Prepay-Variante: Kündigung zum Jahresende.</li>
              <li>Außerordentliche Kündigung aus wichtigem Grund bleibt unberührt.</li>
              <li>Kündigungen bedürfen der Textform (E-Mail an info@aevum-system.de genügt).</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">§ 13 Schlussbestimmungen</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</li>
              <li>Gerichtsstand für sämtliche Streitigkeiten aus diesem Vertragsverhältnis ist der Wohnsitz des Anbieters (Wehringen, Amtsgericht Augsburg), soweit der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist oder seinen Wohnsitz nach Vertragsschluss ins Ausland verlegt.</li>
              <li>Plattform der Europäischen Kommission zur Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr/" className="text-theme-accent hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. AEVUM ist nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</li>
              <li>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.</li>
            </ol>
          </section>

        </article>

        <div className="mt-16 pt-8 border-t border-theme-border text-sm text-text-muted flex flex-wrap gap-6">
          <a href="#/datenschutz" className="hover:text-theme-accent">Datenschutz</a>
          <a href="#/impressum" className="hover:text-theme-accent">Impressum</a>
          <a href="#/widerrufsbelehrung" className="hover:text-theme-accent">Widerrufsbelehrung</a>
        </div>
      </motion.div>
    </section>
  );
}
