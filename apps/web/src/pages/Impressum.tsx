import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function Impressum() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: t('legal.impressum.seoTitle'),
    description: t('legal.impressum.seoDescription'),
    path: '/impressum',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Impressum',
      url: 'https://aevum-system.de/impressum',
      inLanguage: 'de-DE',
    },
  });

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
          {t('legal.impressum.title')}
        </h1>

        <p className="text-sm text-text-muted mb-12">{t('legal.impressum.version')}</p>

        <article className="space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s1Title')}</h2>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s2Title')}</h2>
            <p>
              {t('legal.impressum.s2Email')}<a href="mailto:info@aevum-system.de" className="text-theme-accent hover:underline">info@aevum-system.de</a><br />
              {t('legal.impressum.s2Phone')}<a href="tel:+491772288372" className="text-theme-accent hover:underline">+49 177 228 83 72</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s3Title')}</h2>
            <p>{t('legal.impressum.s3p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s4Title')}</h2>
            <p>{t('legal.impressum.s4p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s5Title')}</h2>
            <p>{t('legal.impressum.s5p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s6Title')}</h2>
            <p>
              {t('legal.impressum.s6p1a')}
              <a href="https://ec.europa.eu/consumers/odr/" className="text-theme-accent hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              {t('legal.impressum.s6p1b')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s7Title')}</h2>
            <p>{t('legal.impressum.s7p1')}</p>
            <p>{t('legal.impressum.s7p2')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s8Title')}</h2>
            <p>{t('legal.impressum.s8p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.impressum.s9Title')}</h2>
            <p>{t('legal.impressum.s9p1')}</p>
            <p>{t('legal.impressum.s9p2')}</p>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
