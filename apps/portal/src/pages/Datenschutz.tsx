import { useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Brand from '@/components/Brand';

export default function Datenschutz() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition"><Brand size={28} /></Link>
        </div>
      </header>

      <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">{t('legal.ds.title')}</h1>
        <p className="text-sm text-neutral-500 mb-2">{t('legal.ds.appliesTo')}<span className="text-neutral-300">{t('legal.ds.appliesToValue')}</span>{t('legal.ds.appliesToSuffix')}</p>
        <p className="text-sm text-neutral-500 mb-12">{t('legal.ds.asOf')}</p>

        <article className="space-y-10 text-neutral-400 leading-relaxed break-words">

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h1')}</h2>
            <p>
              {t('legal.ds.p1a')}
            </p>
            <p className="mt-3">
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
            <p className="mt-3">
              {t('legal.ds.p1email')}<a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a><br />
              {t('legal.ds.p1phone')}<a href="tel:+491772288372" className="text-amber-500 hover:underline">+49 177 228 83 72</a>
            </p>
            <p className="mt-3 text-sm">
              {t('legal.ds.p1dpo')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h2')}</h2>
            <p>{t('legal.ds.p2')}</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>{t('legal.ds.p2li1')}</li>
              <li>{t('legal.ds.p2li2')}</li>
              <li>{t('legal.ds.p2li3')}</li>
              <li>{t('legal.ds.p2li4')}</li>
              <li>{t('legal.ds.p2li5')}</li>
              <li>{t('legal.ds.p2li6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h3')}</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="text-neutral-200">{t('legal.ds.p3li1strong')}</span>{t('legal.ds.p3li1')}
              </li>
              <li>
                <span className="text-neutral-200">{t('legal.ds.p3li2strong')}</span>{t('legal.ds.p3li2')}
              </li>
              <li>
                <span className="text-neutral-200">{t('legal.ds.p3li3strong')}</span>{t('legal.ds.p3li3')}
              </li>
              <li>
                <span className="text-neutral-200">{t('legal.ds.p3li4strong')}</span>{t('legal.ds.p3li4')}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h4')}</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('legal.ds.p4li1')}</li>
              <li>{t('legal.ds.p4li2')}</li>
              <li>{t('legal.ds.p4li3')}</li>
              <li>{t('legal.ds.p4li4')}</li>
              <li>{t('legal.ds.p4li5')}</li>
              <li>{t('legal.ds.p4li6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h5')}</h2>
            <p>
              {t('legal.ds.p5a1')}<span className="text-neutral-200">{t('legal.ds.p5strong')}</span>{t('legal.ds.p5a2')}
            </p>
            <p className="mt-3">
              {t('legal.ds.p5b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h6')}</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('legal.ds.p6li1')}</li>
              <li>{t('legal.ds.p6li2a')}<span className="text-neutral-200">{t('legal.ds.p6li2strong')}</span>{t('legal.ds.p6li2b')}</li>
              <li>{t('legal.ds.p6li3')}</li>
              <li>{t('legal.ds.p6li4')}</li>
              <li>{t('legal.ds.p6li5')}</li>
              <li>{t('legal.ds.p6li6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h7')}</h2>
            <p>
              {t('legal.ds.p7')}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[28rem]">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-300">
                    <th className="text-left py-2 pr-4 font-medium">{t('legal.ds.thProvider')}</th>
                    <th className="text-left py-2 pr-4 font-medium">{t('legal.ds.thPurpose')}</th>
                    <th className="text-left py-2 font-medium">{t('legal.ds.thLocation')}</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-400">
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Cloudflare, Inc.</td>
                    <td className="py-2 pr-4">{t('legal.ds.sp1purpose')}</td>
                    <td className="py-2">{t('legal.ds.sp1loc')}</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Vercel Inc.</td>
                    <td className="py-2 pr-4">{t('legal.ds.sp2purpose')}</td>
                    <td className="py-2">{t('legal.ds.sp2loc')}</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Supabase Inc.</td>
                    <td className="py-2 pr-4">{t('legal.ds.sp3purpose')}</td>
                    <td className="py-2">{t('legal.ds.sp3loc')}</td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="py-2 pr-4 text-neutral-200">Anthropic PBC</td>
                    <td className="py-2 pr-4">{t('legal.ds.sp4purpose')}</td>
                    <td className="py-2">{t('legal.ds.sp4loc')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-neutral-200">Stripe, Inc.</td>
                    <td className="py-2 pr-4">{t('legal.ds.sp5purpose')}</td>
                    <td className="py-2">{t('legal.ds.sp5loc')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              {t('legal.ds.p7after')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h8')}</h2>
            <p>
              {t('legal.ds.p8')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h9')}</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="text-neutral-200">{t('legal.ds.p9li1strong')}</span>{t('legal.ds.p9li1')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li2strong')}</span>{t('legal.ds.p9li2')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li3strong')}</span>{t('legal.ds.p9li3')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li4strong')}</span>{t('legal.ds.p9li4')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li5strong')}</span>{t('legal.ds.p9li5')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li6strong')}</span>{t('legal.ds.p9li6')}</li>
              <li><span className="text-neutral-200">{t('legal.ds.p9li7strong')}</span>{t('legal.ds.p9li7')}</li>
            </ul>
            <p className="mt-3">
              {t('legal.ds.p9aftera')}
              <a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a>
              {t('legal.ds.p9afterb')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h10')}</h2>
            <p>
              {t('legal.ds.p10a')}
            </p>
            <p className="mt-3">
              <span className="text-neutral-200">{t('legal.ds.p10authority')}</span><br />
              {t('legal.ds.p10address')}<br />
              <a href="https://www.lda.bayern.de" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">www.lda.bayern.de</a>
            </p>
            <p className="mt-3">
              {t('legal.ds.p10b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h11')}</h2>
            <p>
              {t('legal.ds.p11')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.ds.h12')}</h2>
            <p>
              {t('legal.ds.p12')}
            </p>
          </section>

        </article>
      </section>
    </div>
  );
}
