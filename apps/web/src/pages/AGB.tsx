import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function AGB() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: t('legal.agb.seoTitle'),
    description: t('legal.agb.seoDescription'),
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
          {t('legal.agb.title1')}<span className="text-theme-accent">{t('legal.agb.title2')}</span>
        </h1>

        <p className="text-sm text-text-muted mb-6">{t('legal.agb.version')}</p>

        <div className="mb-12 border border-theme-border-accent bg-theme-accent-soft px-5 py-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-theme-accent">{t('legal.agb.noticeLabel')}</strong>{t('legal.agb.notice')}
        </div>

        <article className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p1Title')}</h2>
            <p>{t('legal.agb.p1a')}</p>
            <p>
              {t('legal.agb.p1b1')}
              <a href="#/widerrufsbelehrung" className="text-theme-accent hover:underline">{t('legal.agb.p1WiderrufLink')}</a>
              {t('legal.agb.p1b2')}
            </p>
            <p>{t('legal.agb.p1c')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p2Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t('legal.agb.p2li1')}</li>
              <li>{t('legal.agb.p2li2')}</li>
              <li>{t('legal.agb.p2li3')}</li>
              <li>{t('legal.agb.p2li4')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p3Title')}</h2>
            <p>{t('legal.agb.p3p1')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>{t('legal.agb.p3li1Label')}</strong>{t('legal.agb.p3li1')}</li>
              <li><strong>{t('legal.agb.p3li2Label')}</strong>{t('legal.agb.p3li2')}</li>
              <li><strong>{t('legal.agb.p3li3Label')}</strong>{t('legal.agb.p3li3')}</li>
              <li><strong>{t('legal.agb.p3li4Label')}</strong>{t('legal.agb.p3li4')}</li>
              <li><strong>{t('legal.agb.p3li5Label')}</strong>{t('legal.agb.p3li5')}
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>{t('legal.agb.p3li5sub1')}</li>
                  <li>{t('legal.agb.p3li5sub2')}</li>
                  <li>{t('legal.agb.p3li5sub3')}</li>
                </ul>
              </li>
            </ul>
            <p>{t('legal.agb.p3footer')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p4Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                {t('legal.agb.p4li1a')}<strong>{t('legal.agb.p4li1Bold')}</strong>{t('legal.agb.p4li1b')}
              </li>
              <li>{t('legal.agb.p4li2')}</li>
              <li>{t('legal.agb.p4li3')}</li>
              <li>{t('legal.agb.p4li4')}</li>
              <li><strong>{t('legal.agb.p4li5Label')}</strong>{t('legal.agb.p4li5')}</li>
              <li><strong>{t('legal.agb.p4li6Label')}</strong>{t('legal.agb.p4li6')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p5Title')}</h2>
            <p>{t('legal.agb.p5p1')}</p>
            <p>
              {t('legal.agb.p5p2a')}
              <a href="#/datenschutz" className="text-theme-accent hover:underline">{t('legal.agb.p5DatenschutzLink')}</a>
              {t('legal.agb.p5p2b')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p5aTitle')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>{t('legal.agb.p5aLi1Label')}</strong>{t('legal.agb.p5aLi1')}</li>
              <li><strong>{t('legal.agb.p5aLi2Label')}</strong>{t('legal.agb.p5aLi2')}</li>
              <li><strong>{t('legal.agb.p5aLi3Label')}</strong>{t('legal.agb.p5aLi3')}</li>
              <li><strong>{t('legal.agb.p5aLi4Label')}</strong>{t('legal.agb.p5aLi4')}</li>
              <li><strong>{t('legal.agb.p5aLi5Label')}</strong>{t('legal.agb.p5aLi5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p6Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t('legal.agb.p6li1')}</li>
              <li>{t('legal.agb.p6li2')}</li>
              <li>{t('legal.agb.p6li3')}</li>
              <li>{t('legal.agb.p6li4')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p7Title')}</h2>
            <p>{t('legal.agb.p7p1')}</p>
            <p>{t('legal.agb.p7p2')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p8Title')}</h2>
            <p>{t('legal.agb.p8p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p9Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t('legal.agb.p9li1')}</li>
              <li>{t('legal.agb.p9li2')}</li>
              <li>{t('legal.agb.p9li3')}</li>
              <li>{t('legal.agb.p9li4')}</li>
              <li>{t('legal.agb.p9li5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p10Title')}</h2>
            <p>
              {t('legal.agb.p10p1a')}
              <a href="#/datenschutz" className="text-theme-accent hover:underline">{t('legal.agb.p5DatenschutzLink')}</a>
              {t('legal.agb.p10p1b')}
            </p>
            <p>{t('legal.agb.p10p2')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p11Title')}</h2>
            <p>
              {t('legal.agb.p11p1a')}
              <a href="#/widerrufsbelehrung" className="text-theme-accent hover:underline">{t('legal.agb.p1WiderrufLink')}</a>
              {t('legal.agb.p11p1b')}
            </p>
            <p>{t('legal.agb.p11p2')}</p>
            <p>{t('legal.agb.p11p3')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p12Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t('legal.agb.p12li1')}</li>
              <li>{t('legal.agb.p12li2')}</li>
              <li>{t('legal.agb.p12li3')}</li>
              <li>{t('legal.agb.p12li4')}</li>
              <li>{t('legal.agb.p12li5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.agb.p13Title')}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t('legal.agb.p13li1')}</li>
              <li>{t('legal.agb.p13li2')}</li>
              <li>
                {t('legal.agb.p13li3a')}
                <a href="https://ec.europa.eu/consumers/odr/" className="text-theme-accent hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>
                {t('legal.agb.p13li3b')}
              </li>
              <li>{t('legal.agb.p13li4')}</li>
            </ol>
          </section>

        </article>

        <div className="mt-16 pt-8 border-t border-theme-border text-sm text-text-muted flex flex-wrap gap-6">
          <a href="#/datenschutz" className="hover:text-theme-accent">{t('legal.agb.footerDatenschutz')}</a>
          <a href="#/impressum" className="hover:text-theme-accent">{t('legal.agb.footerImpressum')}</a>
          <a href="#/widerrufsbelehrung" className="hover:text-theme-accent">{t('legal.agb.footerWiderruf')}</a>
        </div>
      </motion.div>
    </section>
  );
}
