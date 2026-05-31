import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function Widerrufsbelehrung() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: t('legal.widerruf.seoTitle'),
    description: t('legal.widerruf.seoDescription'),
    path: '/widerrufsbelehrung',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Widerrufsbelehrung',
      url: 'https://aevum-system.de/widerrufsbelehrung',
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4 break-words">
          {t('legal.widerruf.title1')}<span className="text-theme-accent">{t('legal.widerruf.title2')}</span>
        </h1>

        <p className="text-sm text-text-muted mb-6">
          {t('legal.widerruf.version')}
        </p>

        <div className="mb-12 border border-theme-border-accent bg-theme-accent-soft px-5 py-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-theme-accent">{t('legal.widerruf.noticeLabel')}</strong>{t('legal.widerruf.notice')}
        </div>

        <article className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s1Title')}</h2>
            <p>
              {t('legal.widerruf.s1p1a')}<strong>{t('legal.widerruf.s1p1Bold')}</strong>{t('legal.widerruf.s1p1b')}
            </p>
            <p>{t('legal.widerruf.s1p2')}</p>
            <p>{t('legal.widerruf.s1p3')}</p>
            <p className="bg-bg-surface border border-theme-border p-4 my-4 font-mono text-sm">
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen<br />
              Deutschland<br />
              E-Mail: info@aevum-system.de
            </p>
            <p>{t('legal.widerruf.s1p4')}</p>
            <p>{t('legal.widerruf.s1p5')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s2Title')}</h2>
            <p>{t('legal.widerruf.s2p1')}</p>
            <p>{t('legal.widerruf.s2p2')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s3Title')}</h2>
            <p>{t('legal.widerruf.s3p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s4Title')}</h2>
            <p>{t('legal.widerruf.s4p1')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s5Title')}</h2>
            <p>{t('legal.widerruf.s5p1')}</p>
            <div className="bg-bg-surface border border-theme-border p-6 my-4 text-sm">
              <p className="mb-2">{t('legal.widerruf.s5to')}</p>
              <p className="mb-2">
                Carlos Wrusch<br />
                Federteilstr. 2e<br />
                86517 Wehringen<br />
                E-Mail: info@aevum-system.de
              </p>
              <hr className="border-theme-border my-3" />
              <p className="mb-2">{t('legal.widerruf.s5line1')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line2')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line3')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line4')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line5')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line6')}</p>
              <p className="mb-2">{t('legal.widerruf.s5line7')}</p>
              <p className="mt-4 text-xs text-text-muted">{t('legal.widerruf.s5note')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.widerruf.s6Title')}</h2>
            <p>{t('legal.widerruf.s6p1')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.widerruf.s6li1')}</li>
              <li>{t('legal.widerruf.s6li2')}</li>
            </ul>
          </section>

        </article>

        <div className="mt-16 pt-8 border-t border-theme-border text-sm text-text-muted flex flex-wrap gap-6">
          <a href="#/agb" className="hover:text-theme-accent">{t('legal.widerruf.footerAgb')}</a>
          <a href="#/datenschutz" className="hover:text-theme-accent">{t('legal.widerruf.footerDatenschutz')}</a>
          <a href="#/impressum" className="hover:text-theme-accent">{t('legal.widerruf.footerImpressum')}</a>
        </div>
      </motion.div>
    </section>
  );
}
