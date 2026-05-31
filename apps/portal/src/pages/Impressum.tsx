import { useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Brand from '@/components/Brand';

export default function Impressum() {
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
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">{t('legal.imp.title')}</h1>
        <p className="text-sm text-neutral-500 mb-12">{t('legal.imp.asOf')}</p>

        <article className="space-y-8 text-neutral-400 leading-relaxed break-words">

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h1')}</h2>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h2')}</h2>
            <p>
              {t('legal.imp.email')}<a href="mailto:info@aevum-system.de" className="text-amber-500 hover:underline">info@aevum-system.de</a><br />
              {t('legal.imp.phone')}<a href="tel:+491772288372" className="text-amber-500 hover:underline">+49 177 228 83 72</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h3')}</h2>
            <p>
              {t('legal.imp.p3')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h4')}</h2>
            <p>
              {t('legal.imp.p4')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h5')}</h2>
            <p>{t('legal.imp.p5')}</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h6')}</h2>
            <p>
              {t('legal.imp.p6a')}
              <a href="https://ec.europa.eu/consumers/odr/" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              {t('legal.imp.p6b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h7')}</h2>
            <p>
              {t('legal.imp.p7a')}
            </p>
            <p>
              {t('legal.imp.p7b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h8')}</h2>
            <p>
              {t('legal.imp.p8')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.imp.h9')}</h2>
            <p>
              {t('legal.imp.p9a')}
            </p>
            <p>
              {t('legal.imp.p9b')}
            </p>
          </section>

        </article>
      </section>
    </div>
  );
}
