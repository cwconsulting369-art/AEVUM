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

        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-4 py-3 mb-10 text-sm text-[#F59E0B]">
          ⚠️ DRAFT — Vollständige Postanschrift und ggf. USt-ID werden in Kürze ergänzt.
        </div>

        <article className="space-y-8 text-[#A1A1AA] leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Angaben gemäß § 5 DDG</h2>
            <p>
              Carlos Wrusch<br />
              [Postanschrift folgt]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:cwconsulting369@gmail.com" className="text-[#F59E0B] hover:underline">cwconsulting369@gmail.com</a><br />
              Telefon: <a href="tel:+491772288372" className="text-[#F59E0B] hover:underline">+49 177 228 83 72</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Umsatzsteuer-ID</h2>
            <p>[USt-ID folgt — alternativ: Kleinunternehmer gem. § 19 UStG]</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Inhaltlich verantwortlich gem. § 18 Abs 2 MStV</h2>
            <p>Carlos Wrusch (Anschrift wie oben)</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" className="text-[#F59E0B] hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
              Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
