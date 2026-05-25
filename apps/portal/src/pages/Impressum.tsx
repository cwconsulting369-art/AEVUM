import { useEffect } from 'react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';

export default function Impressum() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition"><Brand size={28} /></Link>
        </div>
      </header>

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-light tracking-tight mb-2">Impressum</h1>
        <p className="text-sm text-neutral-500 mb-12">Stand: 22. Mai 2026</p>

        <article className="space-y-8 text-neutral-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Angaben gemäß § 5 DDG</h2>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a><br />
              Telefon: <a href="tel:+491772288372" className="text-amber-500 hover:underline">+49 177 228 83 72</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Berufsbezeichnung</h2>
            <p>
              AI Fullstack Developer (selbstständig tätig, Bundesrepublik Deutschland).
              Die Tätigkeit ist nicht reglementiert; es bestehen keine berufsständische
              Kammer-Mitgliedschaft und keine Aufsichtsbehörde.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Umsatzsteuer</h2>
            <p>
              Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer
              ausgewiesen. Eine Umsatzsteuer-Identifikationsnummer nach § 27a UStG
              wird nicht geführt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Inhaltlich verantwortlich gem. § 18 Abs 2 MStV</h2>
            <p>Carlos Wrusch (Anschrift wie oben)</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Haftung für Inhalte</h2>
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
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-100 mb-3">Urheberrecht</h2>
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
      </section>
    </div>
  );
}
