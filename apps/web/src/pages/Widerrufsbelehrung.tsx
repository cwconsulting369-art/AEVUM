import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Widerrufsbelehrung() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <section className="px-6 lg:px-16 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
          Widerrufs<span className="text-[#e0a458]">belehrung</span>
        </h1>

        <p className="text-sm text-[#7a7a85] mb-12">
          Stand: 20. Mai 2026. Diese Belehrung gilt für Verbraucher im Sinne von § 13 BGB.
          B2B-Kunden haben kein gesetzliches Widerrufsrecht — siehe AGB § 11 für freiwillige
          Stornierungsregeln.
        </p>

        <article className="prose prose-invert max-w-none space-y-8 text-[#a4a4ad] leading-relaxed">

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Widerrufsrecht</h2>
            <p>
              Sie haben das Recht, binnen <strong>vierzehn Tagen</strong> ohne Angabe von
              Gründen diesen Vertrag zu widerrufen.
            </p>
            <p>
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses
              (entspricht dem Datum der Bezahlung über Stripe oder der schriftlichen
              Auftragsbestätigung).
            </p>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:
            </p>
            <p className="bg-[#111116] border border-white/10 p-4 my-4 font-mono text-sm">
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland<br />
              E-Mail: cwconsulting369@gmail.com
            </p>
            <p>
              mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief
              oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
              informieren. Sie können dafür das untenstehende Muster-Widerrufsformular
              verwenden, das jedoch nicht vorgeschrieben ist.
            </p>
            <p>
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
              Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Folgen des Widerrufs</h2>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir
              von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab
              dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
              Vertrags bei uns eingegangen ist.
            </p>
            <p>
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
              ursprünglichen Transaktion eingesetzt haben (in der Regel über Stripe).
              Wegen dieser Rückzahlung werden Ihnen keine Entgelte berechnet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Vorzeitiges Erlöschen des Widerrufsrechts</h2>
            <p>
              Bei Verträgen zur Erbringung von Dienstleistungen erlischt das Widerrufsrecht
              dann, wenn AEVUM die Dienstleistung vollständig erbracht hat und mit der
              Ausführung der Dienstleistung erst begonnen hat, nachdem Sie dazu Ihre
              ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon
              bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung
              durch AEVUM verlieren (§ 356 Abs 4 BGB).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Anteilige Vergütung bei vorzeitigem Widerruf</h2>
            <p>
              Verlangen Sie, dass die Dienstleistung während der Widerrufsfrist beginnen
              soll, und üben Sie das Widerrufsrecht anschließend aus, haben Sie uns einen
              angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu
              dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags
              unterrichten, bereits erbrachten Dienstleistung im Vergleich zum Gesamtumfang
              der im Vertrag vorgesehenen Dienstleistung entspricht (§ 357a Abs 2 BGB).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Muster-Widerrufsformular</h2>
            <p>
              Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular
              aus und senden Sie es zurück:
            </p>
            <div className="bg-[#111116] border border-white/10 p-6 my-4 text-sm">
              <p className="mb-2">An:</p>
              <p className="mb-2">
                Carlos Wrusch<br />
                Federteilstr. 2e<br />
                86517 Wehringen<br />
                E-Mail: cwconsulting369@gmail.com
              </p>
              <hr className="border-white/10 my-3" />
              <p className="mb-2">Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über</p>
              <p className="mb-2">die Erbringung der folgenden Dienstleistung: ______________</p>
              <p className="mb-2">Bestellt am (*) / erhalten am (*): ______________</p>
              <p className="mb-2">Name des/der Verbraucher(s): ______________</p>
              <p className="mb-2">Anschrift des/der Verbraucher(s): ______________</p>
              <p className="mb-2">Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ______________</p>
              <p className="mb-2">Datum: ______________</p>
              <p className="mt-4 text-xs text-[#7a7a85]">(*) Unzutreffendes streichen.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-[#F8FAFC] mb-3">Hinweis für Unternehmer (B2B)</h2>
            <p>
              Diese Widerrufsbelehrung gilt ausschließlich für Verbraucher im Sinne von
              § 13 BGB. Wenn Sie als Unternehmer (§ 14 BGB) bestellen, besteht kein
              gesetzliches Widerrufsrecht. Für B2B-Stornierungen gilt § 11 unserer AGB:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Innerhalb von 14 Tagen nach Vertragsschluss UND vor Kickoff: volle Erstattung</li>
              <li>Nach Kickoff (Beginn der Leistungserbringung): anteilige Abrechnung nach Aufwand</li>
            </ul>
          </section>

        </article>

        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-[#7a7a85] flex flex-wrap gap-6">
          <a href="#/agb" className="hover:text-[#e0a458]">AGB</a>
          <a href="#/datenschutz" className="hover:text-[#e0a458]">Datenschutz</a>
          <a href="#/impressum" className="hover:text-[#e0a458]">Impressum</a>
        </div>
      </motion.div>
    </section>
  );
}
