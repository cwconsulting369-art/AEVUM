import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Impressum() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <section className="px-6 lg:px-16 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
          Impressum
        </h1>

        <p className="text-sm text-[#7a7a85] mb-12">Stand: 20. Mai 2026</p>

        <article className="space-y-8 text-[#a4a4ad] leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Angaben gemäß § 5 DDG</h2>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:cwconsulting369@gmail.com" className="text-[#e0a458] hover:underline">cwconsulting369@gmail.com</a><br />
              Telefon: <a href="tel:+491772288372" className="text-[#e0a458] hover:underline">+49 177 228 83 72</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Berufsbezeichnung</h2>
            <p>
              AI Fullstack Developer (selbstständig tätig, Bundesrepublik Deutschland).
              Die Tätigkeit ist nicht reglementiert; es bestehen keine berufsständische
              Kammer-Mitgliedschaft und keine Aufsichtsbehörde.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Umsatzsteuer</h2>
            <p>
              Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer
              ausgewiesen. Eine Umsatzsteuer-Identifikationsnummer nach § 27a UStG
              wird nicht geführt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Inhaltlich verantwortlich gem. § 18 Abs 2 MStV</h2>
            <p>Carlos Wrusch (Anschrift wie oben)</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" className="text-[#e0a458] hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs 1 DDG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind
              wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach
              den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
              ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
              diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
              bedürfen der schriftlichen Zustimmung des Verfassers.
            </p>
            <p>
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
              Gebrauch gestattet.
            </p>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
