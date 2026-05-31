import { useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Brand from '@/components/Brand';

export default function AGB() {
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
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">{t('legal.agb.title')}</h1>
        <p className="text-sm text-neutral-500 mb-2">{t('legal.agb.appliesTo')}<span className="text-neutral-300">{t('legal.agb.appliesToValue')}</span>{t('legal.agb.appliesToSuffix')}</p>
        <p className="text-sm text-neutral-500 mb-12">{t('legal.agb.asOf')}</p>

        <article className="space-y-10 text-neutral-400 leading-relaxed break-words">

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h1')}</h2>
            <p>
              {t('legal.agb.p1a')}
              <a href="https://aevum-system.de/agb" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">
                aevum-system.de/agb
              </a>{t('legal.agb.p1b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h2')}</h2>
            <p>{t('legal.agb.p2a')}
              <Link to="/impressum" className="text-amber-500 hover:underline">{t('legal.agb.p2link')}</Link>{t('legal.agb.p2b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h3')}</h2>
            <p>
              {t('legal.agb.p3')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h4')}</h2>
            <p>
              {t('legal.agb.p4')}
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>{t('legal.agb.p4li1')}</li>
              <li>{t('legal.agb.p4li2')}</li>
              <li>{t('legal.agb.p4li3')}</li>
              <li>{t('legal.agb.p4li4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h5')}</h2>
            <p>
              {t('legal.agb.p5a')}
              <Link to="/datenschutz" className="text-amber-500 hover:underline">{t('legal.agb.p5link')}</Link>{t('legal.agb.p5b')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h6')}</h2>
            <p>
              {t('legal.agb.p6')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h7')}</h2>
            <p>
              {t('legal.agb.p7')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h8')}</h2>
            <p>
              {t('legal.agb.p8')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h9')}</h2>
            <p>
              {t('legal.agb.p9')}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3">{t('legal.agb.h10')}</h2>
            <p>
              {t('legal.agb.p10')}
            </p>
          </section>

        </article>
      </section>
    </div>
  );
}
