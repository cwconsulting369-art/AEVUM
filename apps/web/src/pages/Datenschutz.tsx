import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePageSeo } from '@/hooks/use-page-seo';

export default function Datenschutz() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  usePageSeo({
    title: t('legal.datenschutz.seoTitle'),
    description: t('legal.datenschutz.seoDescription'),
    path: '/datenschutz',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Datenschutzerklärung',
      url: 'https://aevum-system.de/datenschutz',
      inLanguage: 'de-DE',
      isPartOf: { '@type': 'WebSite', name: 'AEVUM', url: 'https://aevum-system.de' },
      datePublished: '2026-05-19',
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
          {t('legal.datenschutz.title1')}<span className="text-theme-accent">{t('legal.datenschutz.title2')}</span>
        </h1>

        <p className="text-sm text-text-muted mb-6">{t('legal.datenschutz.version')}</p>

        <div className="mb-12 border border-theme-border-accent bg-theme-accent-soft px-5 py-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-theme-accent">{t('legal.datenschutz.noticeLabel')}</strong>{t('legal.datenschutz.notice')}
        </div>

        <article className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed break-words">

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s1Title')}</h2>
            <p>{t('legal.datenschutz.s1p1')}</p>
            <p>
              Carlos Wrusch<br />
              Federteilstr. 2e<br />
              86517 Wehringen, Deutschland<br />
              {t('legal.datenschutz.s1Email')}<a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>
            </p>
            <p className="text-sm text-text-muted">{t('legal.datenschutz.s1Note')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s2Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>{t('legal.datenschutz.s2li1Label')}</strong>{t('legal.datenschutz.s2li1')}</li>
              <li><strong>{t('legal.datenschutz.s2li2Label')}</strong>{t('legal.datenschutz.s2li2')}</li>
              <li><strong>{t('legal.datenschutz.s2li3Label')}</strong>{t('legal.datenschutz.s2li3')}</li>
              <li><strong>{t('legal.datenschutz.s2li4Label')}</strong>{t('legal.datenschutz.s2li4')}</li>
              <li><strong>{t('legal.datenschutz.s2li5Label')}</strong>{t('legal.datenschutz.s2li5')}</li>
              <li><strong>{t('legal.datenschutz.s2li6Label')}</strong>{t('legal.datenschutz.s2li6')}</li>
              <li><strong>{t('legal.datenschutz.s2li7Label')}</strong>{t('legal.datenschutz.s2li7')}</li>
              <li><strong>{t('legal.datenschutz.s2li8Label')}</strong>{t('legal.datenschutz.s2li8')}</li>
              <li><strong>{t('legal.datenschutz.s2li9Label')}</strong>{t('legal.datenschutz.s2li9')}</li>
              <li><strong>{t('legal.datenschutz.s2li10Label')}</strong>{t('legal.datenschutz.s2li10')}</li>
              <li><strong>{t('legal.datenschutz.s2li11Label')}</strong>{t('legal.datenschutz.s2li11')}</li>
              <li><strong>{t('legal.datenschutz.s2li12Label')}</strong>{t('legal.datenschutz.s2li12')}</li>
              <li><strong>{t('legal.datenschutz.s2li13Label')}</strong>{t('legal.datenschutz.s2li13')}</li>
              <li><strong>{t('legal.datenschutz.s2li14Label')}</strong>{t('legal.datenschutz.s2li14')}</li>
              <li><strong>{t('legal.datenschutz.s2li15Label')}</strong>{t('legal.datenschutz.s2li15')}</li>
              <li><strong>{t('legal.datenschutz.s2li16Label')}</strong>{t('legal.datenschutz.s2li16')}</li>
              <li><strong>{t('legal.datenschutz.s2li17Label')}</strong>{t('legal.datenschutz.s2li17')}</li>
              <li><strong>{t('legal.datenschutz.s2li18Label')}</strong>{t('legal.datenschutz.s2li18')}</li>
            </ul>
            <p>{t('legal.datenschutz.s2footer')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s3Title')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('legal.datenschutz.s3li1Label')}</strong>{t('legal.datenschutz.s3li1')}</li>
              <li><strong>{t('legal.datenschutz.s3li2Label')}</strong>{t('legal.datenschutz.s3li2')}</li>
              <li><strong>{t('legal.datenschutz.s3li3Label')}</strong>{t('legal.datenschutz.s3li3')}</li>
              <li><strong>{t('legal.datenschutz.s3li4Label')}</strong>{t('legal.datenschutz.s3li4')}</li>
              <li><strong>{t('legal.datenschutz.s3li5Label')}</strong>{t('legal.datenschutz.s3li5')}</li>
              <li><strong>{t('legal.datenschutz.s3li6Label')}</strong>{t('legal.datenschutz.s3li6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s4Title')}</h2>
            <p>{t('legal.datenschutz.s4p1')}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-theme-border">
                <thead className="bg-bg-surface">
                  <tr className="text-left">
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">{t('legal.datenschutz.s4thProvider')}</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">{t('legal.datenschutz.s4thPurpose')}</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">{t('legal.datenschutz.s4thLocation')}</th>
                    <th className="px-3 py-2 border-b border-theme-border text-text-primary font-normal">{t('legal.datenschutz.s4thGuarantees')}</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Supabase Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r1c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r1c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r1c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Vercel Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r2c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r2c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r2c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Cloudflare Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r3c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r3c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r3c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Stripe Payments Europe Ltd.</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r4c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r4c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r4c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Anthropic PBC</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r5c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r5c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r5c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Mailbox.org (Heinlein Support GmbH)</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r6c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r6c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r6c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Resend (Resend, Inc.)</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r7c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r7c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r7c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">Telegram FZ-LLC</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r8c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r8c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r8c4')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-b border-theme-border">OpenRouter Inc.</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r9c2')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r9c3')}</td>
                    <td className="px-3 py-2 border-b border-theme-border">{t('legal.datenschutz.s4r9c4')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              <strong>{t('legal.datenschutz.s4ddLabel')}</strong>{t('legal.datenschutz.s4dd')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s5Title')}</h2>
            <p>
              {t('legal.datenschutz.s5p1Pre')}<strong>Stripe Payments Europe Ltd.</strong>{t('legal.datenschutz.s5p1Post')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s5p2Label')}</strong>{t('legal.datenschutz.s5p2')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s5p3Label')}</strong>{t('legal.datenschutz.s5p3a')}<code>__stripe_mid</code>, <code>__stripe_sid</code>{t('legal.datenschutz.s5p3b')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s5p4Label')}</strong>{t('legal.datenschutz.s5p4')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s5p5Label')}</strong>{' '}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">
                stripe.com/de/privacy
              </a>
            </p>
            <p>
              <strong>{t('legal.datenschutz.s5p6Label')}</strong>{t('legal.datenschutz.s5p6')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s6Title')}</h2>
            <p>
              {t('legal.datenschutz.s6p1a')}<strong>{t('legal.datenschutz.s6p1Bold')}</strong>{t('legal.datenschutz.s6p1b')}
              <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s6aTitle')}</h2>
            <p>
              {t('legal.datenschutz.s6ap1a')}<strong>{t('legal.datenschutz.s6ap1Bold')}</strong>{t('legal.datenschutz.s6ap1b')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap2Label')}</strong>{t('legal.datenschutz.s6ap2')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap3Label')}</strong>{t('legal.datenschutz.s6ap3')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap4Label')}</strong>{t('legal.datenschutz.s6ap4')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap5Label')}</strong>{t('legal.datenschutz.s6ap5a')}<strong>{t('legal.datenschutz.s6ap5Bold')}</strong>{t('legal.datenschutz.s6ap5b')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap6Label')}</strong>{t('legal.datenschutz.s6ap6a')}<strong>{t('legal.datenschutz.s6ap6Bold')}</strong>{t('legal.datenschutz.s6ap6b')}
            </p>
            <p>
              <strong>{t('legal.datenschutz.s6ap7Label')}</strong>{t('legal.datenschutz.s6ap7')}
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.datenschutz.s6ali1a')}<strong>{t('legal.datenschutz.s6ali1Bold')}</strong>{t('legal.datenschutz.s6ali1b')}</li>
              <li>{t('legal.datenschutz.s6ali2a')}<a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>{t('legal.datenschutz.s6ali2b')}</li>
            </ul>
            <p className="text-sm text-text-muted mt-2">
              {t('legal.datenschutz.s6aFootA')}<code className="text-theme-accent">POST /api/helpbot/erase</code>{t('legal.datenschutz.s6aFootB')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s7Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.datenschutz.s7li1')}</li>
              <li>{t('legal.datenschutz.s7li2')}</li>
              <li>{t('legal.datenschutz.s7li3')}</li>
              <li>{t('legal.datenschutz.s7li4')}</li>
              <li>{t('legal.datenschutz.s7li5')}</li>
              <li>{t('legal.datenschutz.s7li6')}</li>
              <li>{t('legal.datenschutz.s7li7')}</li>
              <li>{t('legal.datenschutz.s7li8')}</li>
              <li>{t('legal.datenschutz.s7li9')}</li>
              <li>{t('legal.datenschutz.s7li10')}</li>
              <li>{t('legal.datenschutz.s7li11')}</li>
              <li>{t('legal.datenschutz.s7li12')}</li>
              <li>{t('legal.datenschutz.s7li13')}</li>
              <li>{t('legal.datenschutz.s7li14')}</li>
              <li>{t('legal.datenschutz.s7li15')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s8Title')}</h2>
            <p>{t('legal.datenschutz.s8p1')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.datenschutz.s8li1')}</li>
              <li>{t('legal.datenschutz.s8li2')}</li>
              <li>{t('legal.datenschutz.s8li3a')}<code className="text-theme-accent">POST /api/audit/erase</code></li>
              <li>{t('legal.datenschutz.s8li4')}</li>
              <li>{t('legal.datenschutz.s8li5')}</li>
              <li>{t('legal.datenschutz.s8li6')}</li>
              <li>{t('legal.datenschutz.s8li7')}</li>
            </ul>
            <p className="mt-4">
              {t('legal.datenschutz.s8p2a')}
              <a href="mailto:dsgvo@aevum-system.de" className="text-theme-accent hover:underline">dsgvo@aevum-system.de</a>
              {t('legal.datenschutz.s8p2b')}
            </p>
            <p className="mt-4">
              <strong>{t('legal.datenschutz.s8p3Label')}</strong>{t('legal.datenschutz.s8p3')}
            </p>
            <p className="text-sm">
              Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
              Promenade 18, 91522 Ansbach<br />
              <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">www.lda.bayern.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s9Title')}</h2>
            <p>
              {t('legal.datenschutz.s9p1a')}<strong>{t('legal.datenschutz.s9p1Bold')}</strong>{t('legal.datenschutz.s9p1b')}
            </p>
            <p>
              {t('legal.datenschutz.s9p2a')}<strong>{t('legal.datenschutz.s9p2Bold')}</strong>{t('legal.datenschutz.s9p2b')}
            </p>
            <p>{t('legal.datenschutz.s9p3')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s10Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.datenschutz.s10li1')}</li>
              <li>{t('legal.datenschutz.s10li2')}</li>
              <li>{t('legal.datenschutz.s10li3')}</li>
              <li>{t('legal.datenschutz.s10li4')}</li>
              <li>{t('legal.datenschutz.s10li5')}</li>
              <li>{t('legal.datenschutz.s10li6')}</li>
              <li>{t('legal.datenschutz.s10li7')}</li>
              <li>{t('legal.datenschutz.s10li8')}</li>
              <li>{t('legal.datenschutz.s10li9')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-text-primary mb-3">{t('legal.datenschutz.s11Title')}</h2>
            <p>{t('legal.datenschutz.s11p1')}</p>
          </section>

        </article>
      </motion.div>
    </section>
  );
}
