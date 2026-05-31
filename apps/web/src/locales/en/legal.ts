export default {
  // ─── Privacy Policy ────────────────────────────────────────
  datenschutz: {
    seoTitle: 'Privacy Policy — AEVUM',
    seoDescription:
      'GDPR-compliant privacy policy by AEVUM: controller, sub-processors, retention policies, data subject rights (Art 15/17/20). As of 24 May 2026.',
    title1: 'Privacy ',
    title2: 'Policy',
    version: 'As of: 24 May 2026 · Version: datenschutz-v6-waveH-2026-05-24',
    noticeLabel: 'Notice (as of 25 May 2026):',
    notice:
      ' This privacy policy is a self-authored draft and describes the processing actually carried out as precisely as possible. A final legal review by an attorney is still pending and is planned before going into productive sales. We will update this page as soon as the review has been completed.',

    s1Title: '1. Controller',
    s1p1:
      'The controller within the meaning of the GDPR and other national data protection laws of the member states as well as other data protection provisions is:',
    s1Email: 'Email: ',
    s1Note:
      'A data protection officer is not legally required (no threshold pursuant to § 38 BDSG reached).',

    s2Title: '2. What data we process',
    s2li1Label: 'Workflow audit form:',
    s2li1:
      ' name, company, email, phone (optional), industry, team size, business description, current tools, budget range, timeline',
    s2li2Label: 'Shop checkout:',
    s2li2: ' name, company, email, selected package, optional add-ons',
    s2li3Label: 'Payment processing via Stripe:',
    s2li3:
      ' name, billing address, payment-method metadata (we NEVER see card/bank data — these remain with Stripe)',
    s2li4Label: 'Server log data:',
    s2li4:
      ' IP address, user agent, referrer, timestamp (for abuse prevention, IP anonymization after 30 days)',
    s2li5Label: 'Consent metadata:',
    s2li5:
      ' time, version and content of the consent given (Art 7 GDPR burden of proof)',
    s2li6Label: 'Order and invoice data:',
    s2li6: ' contract data, booking metadata',
    s2li7Label: 'Helpbot / AI chat:',
    s2li7:
      ' anonymous session ID (randomly assigned, no personal reference), content of the messages to the AEVUM Assistant, anonymized IP (last octet zeroed /24), user agent, referrer, language. No collection of name, email or phone in the helpbot.',
    s2li8Label: 'Customer portal (app.aevum-system.de):',
    s2li8:
      ' account master data (name, company, phone optional), profile data (industry, team size, vision), API keys (AES-256-GCM encrypted in Supabase, never readable in the frontend), magic-link tokens (single-use, 30 min lifetime)',
    s2li9Label: 'Customer documents (Inbox/Outbox/Shared):',
    s2li9:
      ' files uploaded by the customer or AEVUM (PDF, DOCX, XLSX, CSV, PNG/JPG) within active projects, max. 5 MB per file, magic-byte validation against file spoofing',
    s2li10Label: 'Customer project agent (LLM chat in the portal):',
    s2li10:
      ' chat content + memory files (.md) for knowledge storage per project, transmitted to Anthropic (Claude Sonnet 4.5) for response generation',
    s2li11Label: 'Script Factory runs (SaaS):',
    s2li11:
      ' brand profile, product description, hook goal, platform, generated script variations — transmitted to Anthropic for generation, result stored in the customer account',
    s2li12Label: 'GDPR Factory runs (SaaS):',
    s2li12:
      ' audit input data (industry, processed data categories, tools), generated PDF audit, transmitted to Anthropic for recommendation generation',
    s2li13Label: 'Lead-magnet sign-ups:',
    s2li13:
      ' email + name + selected lead-magnet slug for PDF delivery (e.g. EU AI Act compliance guide)',
    s2li14Label: 'SaaS waitlist:',
    s2li14: ' email + selected tool slug for notification of tool availability',
    s2li15Label: 'Testimonials (cases):',
    s2li15:
      ' texts, video URL, brand name, logo, key figures released by the customer — display only after explicitly granted permission (case_pages flag)',
    s2li16Label: 'Subscription/cost tracking (internal):',
    s2li16:
      ' AEVUM-owned software subscriptions and their allocation to customer projects — internal accounting, contains no customer PII',
    s2li17Label: 'LLM usage logs:',
    s2li17:
      ' agent_usage_log with anonymized IP, account reference, tokens in/out, cost (cents) — for billing the pay-per-run SaaS tools, IP anonymization immediately at write time',
    s2li18Label: 'Telegram bot magic links:',
    s2li18:
      ' if the customer interacts with the AEVUM Telegram bot (optional, opt-in via the portal): Telegram user ID, chat ID, most recently received magic links',
    s2footer:
      'No automated profiling and no automated individual decision-making within the meaning of Art 22 GDPR takes place.',

    s3Title: '3. Purposes and legal bases',
    s3li1Label: 'Workflow audit processing:',
    s3li1:
      ' Art 6(1)(b) GDPR (pre-contractual measures) and (a) (consent for follow-up communication)',
    s3li2Label: 'Contract handling (packages S/M/L, add-ons):',
    s3li2: ' Art 6(1)(b) GDPR',
    s3li3Label: 'Payment processing via Stripe:',
    s3li3: ' Art 6(1)(b) GDPR (contract) in conjunction with Art 6(1)(f) (fraud prevention)',
    s3li4Label: 'Invoicing + tax retention:',
    s3li4: ' Art 6(1)(c) GDPR in conjunction with § 257 HGB and § 147 AO (8–10 years)',
    s3li5Label: 'Server logs and abuse prevention:',
    s3li5: ' Art 6(1)(f) GDPR (legitimate interest in operational and IT security)',
    s3li6Label: 'Consent records:',
    s3li6: ' Art 6(1)(c) GDPR in conjunction with Art 7(1) GDPR',

    s4Title: '4. Recipients and processors',
    s4p1:
      'We use carefully selected service providers within the scope of processing on behalf pursuant to Art 28 GDPR. Data processing agreements exist with all listed providers or will be concluded before productive use.',
    s4thProvider: 'Provider',
    s4thPurpose: 'Purpose',
    s4thLocation: 'Registered office / server location',
    s4thGuarantees: 'Safeguards',
    s4r1c2: 'Database hosting',
    s4r1c3: 'USA / EU (Frankfurt eu-central-1)',
    s4r1c4: 'DPA + EU Standard Contractual Clauses',
    s4r2c2: 'Frontend hosting / CDN',
    s4r2c3: 'USA / EU edge',
    s4r2c4: 'DPA + EU SCCs (Data Privacy Framework)',
    s4r3c2: 'CDN, DDoS and bot defense',
    s4r3c3: 'USA / global edge network (EU prioritization)',
    s4r3c4: 'DPA + EU SCCs (Data Privacy Framework)',
    s4r4c2: 'Payment processing',
    s4r4c3: 'Ireland / EU (parent company USA)',
    s4r4c4: 'DPA + EU SCCs, PCI-DSS Level 1',
    s4r5c2:
      'AI-supported audit analysis + helpbot chat (processing of the audit answers and chat messages entered by the user to create the workflow recommendation or answer the request; no training use under the Anthropic Commercial Terms, zero-retention API)',
    s4r5c3: 'USA',
    s4r5c4: 'DPA (Anthropic DPA) + EU SCCs (Module 2), zero-retention API',
    s4r6c2:
      'SMTP fallback for transactional emails (magic-link login, GDPR challenge confirmations for export/erasure); only active as a fallback when Resend is unavailable',
    s4r6c3: 'Germany (Berlin)',
    s4r6c4: 'DPA pursuant to Art 28 GDPR, § 32 BDSG, ISO 27001 certified',
    s4r7c2:
      'Primary sending of transactional emails (magic-link login, lead-magnet PDFs, order confirmations, GDPR challenge confirmations, waitlist notifications)',
    s4r7c3: 'USA, EU region available',
    s4r7c4: 'DPA + EU SCCs (Module 2), SOC 2 Type II, EU sub-processor',
    s4r8c2:
      'Sending bot notifications, customer magic links and helpbot notifications to opt-in Telegram accounts (only if explicitly activated by the customer)',
    s4r8c3: 'United Arab Emirates / Switzerland',
    s4r8c4:
      'Standard third-country transfer; only ID fields + magic-link URL transmitted, no PII content; opt-in basis Art 6(1)(a)',
    s4r9c2:
      'LLM routing gateway (Anthropic models) for selected internal background tasks (e.g. classification, idea processing). Does not process customer chat content directly — primary LLM processing runs via the Anthropic direct API.',
    s4r9c3: 'USA',
    s4r9c4:
      'DPA pending (to be signed before Q3 2026); EU SCCs (Module 2). Zero-retention mode where available.',
    s4ddLabel: 'Third-country transfer:',
    s4dd:
      ' Insofar as data is transferred to the USA, this is done on the basis of the EU Standard Contractual Clauses (Art 46(2)(c) GDPR) and – where certified – on the basis of the EU-US Data Privacy Framework (adequacy decision of the EU Commission, Art 45 GDPR).',

    s5Title: '5. Payment processing via Stripe',
    s5p1Pre: 'For processing payments we use ',
    s5p1Post:
      ', 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland. Stripe is certified under PCI-DSS Level 1 – the highest standard for payment security.',
    s5p2Label: 'Processed data:',
    s5p2:
      ' name, email address, billing/delivery address, payment-method data (card/bank data remain exclusively with Stripe, AEVUM only receives metadata such as "credit card ending in 4242"), IP address for fraud prevention, browser fingerprint for fraud detection.',
    s5p3Label: 'Cookies:',
    s5p3a: ' Stripe.js sets technically necessary cookies for fraud detection (e.g. ',
    s5p3b:
      '). These are permitted without consent pursuant to § 25(2)(2) TTDSG (strictly necessary for concluding the contract).',
    s5p4Label: 'Third-country transfer:',
    s5p4:
      ' Stripe\'s parent company is based in the USA. Stripe uses EU Standard Contractual Clauses and supplementary technical measures (encryption, pseudonymization). Processing takes place primarily in EU data centers.',
    s5p5Label: 'Stripe privacy policy:',
    s5p6Label: 'Legal basis:',
    s5p6: ' Art 6(1)(b) GDPR (contract performance) + (f) (fraud prevention).',

    s6Title: '6. Processing on behalf for commercial customers (DPA)',
    s6p1a:
      'Insofar as AEVUM processes personal data of third parties (e.g. end-customer data, employee data) in the course of providing services for commercial customers, this is done exclusively on the basis of a separate data processing agreement pursuant to ',
    s6p1Bold: 'Art 28 GDPR',
    s6p1b:
      '. We provide a standard DPA template free of charge on request. Please send requests by email to ',

    s6aTitle: '6a. Helpbot / AI chat',
    s6ap1a:
      'The helpbot (AEVUM Assistant) available on the AEVUM website answers questions about AI operating systems. It can be used ',
    s6ap1Bold: 'anonymously',
    s6ap1b: ' — we do not collect names, emails or phone numbers.',
    s6ap2Label: 'Processed data:',
    s6ap2:
      ' content of the messages you enter, a randomly generated session ID (not personal), anonymized IP address (last octet zeroed, /24), user agent, referrer and language identifier.',
    s6ap3Label: 'Purpose:',
    s6ap3:
      ' answering your request, improving response quality, abuse prevention (rate limiting, pattern-based filtering against injection attacks and spam).',
    s6ap4Label: 'Legal basis:',
    s6ap4:
      ' Art 6(1)(a) GDPR (your consent, which you give before the first message in the chat window). The consent can be withdrawn at any time by deleting the history via the trash icon in the chat. Additionally Art 6(1)(f) GDPR for abuse prevention (legitimate interest in IT security).',
    s6ap5Label: 'Recipient / sub-processor:',
    s6ap5a: ' The messages entered are transmitted for generating the response to ',
    s6ap5Bold: 'Anthropic PBC',
    s6ap5b:
      ' (model "Claude Sonnet 4.5", USA). Anthropic processes the data as our processor under EU Standard Contractual Clauses (Module 2), does not use it for model training (Anthropic Commercial Terms, zero-retention API). Transmission via the AEVUM API (api.aevum-system.de) as a supplementary sub-process.',
    s6ap6Label: 'Retention period:',
    s6ap6a: ' Chat histories are stored for a maximum of ',
    s6ap6Bold: '30 days',
    s6ap6b: ' and then automatically deleted (daily cron job).',
    s6ap7Label: 'Right to erasure:',
    s6ap7: ' You can delete your chat history yourself at any time via:',
    s6ali1a: 'the ',
    s6ali1Bold: 'trash icon',
    s6ali1b: ' in the chat header or "Delete history" below the input field',
    s6ali2a: 'or by email to ',
    s6ali2b: ' with your session ID',
    s6aFootA: 'The delete function calls the API endpoint ',
    s6aFootB: ' which immediately removes the corresponding database entry.',

    s7Title: '7. Retention period',
    s7li1: 'Active audit requests: until contract conclusion or justified rejection',
    s7li2: 'Completed audits without contract conclusion: 12 months from completion, then erasure',
    s7li3: 'Order and invoice data: 10 years (§ 257 HGB, § 147 AO)',
    s7li4:
      'Stripe payment data: in accordance with the Stripe privacy policy, generally also 10 years due to commercial and tax retention obligations',
    s7li5:
      'Server logs: 30 days (then IP anonymization), aggregated security statistics for up to 90 days',
    s7li6:
      'Helpbot / AI chat histories: 30 days from the last message, then automatic erasure; can be deleted by the user at any time',
    s7li7: 'Customer project agent memory: until the customer deletes it or the account is closed',
    s7li8:
      'Customer documents (Inbox/Outbox/Shared): no automatic erasure — customer-owned, manually deletable by the customer; upon account closure, erasure within 30 days',
    s7li9:
      'Script Factory and GDPR Factory run data: 30 days after run completion (customer can extend on request), then automatic erasure',
    s7li10: 'Lead-magnet sign-ups: 6 months after sign-up, then automatic erasure',
    s7li11:
      'SaaS waitlist entries: until tool is live + 30 days after notification, then automatic erasure',
    s7li12:
      'LLM usage logs (agent_usage_log): 90 days detailed, then aggregated statistics for up to 12 months (anonymized, without IP)',
    s7li13:
      'Magic-link tokens (login + GDPR challenges): 30 min lifetime, then invalid; consumed tokens are deleted after 24 h (single-use protection)',
    s7li14:
      'Order and invoice data: 10 years (§ 257 HGB, § 147 AO) — in case of GDPR erasure, pseudonymization takes place instead of full erasure',
    s7li15:
      'Consent records (Art 7(1) GDPR): until withdrawal plus 3 years standard limitation period (§ 195 BGB)',

    s8Title: '8. Your rights as a data subject',
    s8p1: 'You have the right at any time to:',
    s8li1: 'information about your processed data (Art 15 GDPR)',
    s8li2: 'rectification of inaccurate data (Art 16 GDPR)',
    s8li3a: 'erasure (Art 17 GDPR) – directly enforceable by email or via the API endpoint ',
    s8li4: 'restriction of processing (Art 18 GDPR)',
    s8li5: 'data portability in a structured, common format (Art 20 GDPR)',
    s8li6: 'objection to processing based on legitimate interests (Art 21 GDPR)',
    s8li7: 'withdrawal of a consent given with effect for the future (Art 7(3) GDPR)',
    s8p2a: 'Please send requests by email to ',
    s8p2b:
      '. We process requests within the statutory period of one month (Art 12(3) GDPR).',
    s8p3Label: 'Right to lodge a complaint (Art 77 GDPR):',
    s8p3:
      ' Without prejudice to other remedies, you have the right to lodge a complaint with a supervisory authority. The competent authority for AEVUM is:',

    s9Title: '9. Cookies and tracking',
    s9p1a: 'The AEVUM website sets ',
    s9p1Bold: 'no tracking cookies and no marketing cookies',
    s9p1b:
      '. There is no tracking by third-party providers such as Google Analytics, Meta Pixel, LinkedIn Insight Tag or similar.',
    s9p2a: 'During the checkout process, ',
    s9p2Bold: 'Stripe.js',
    s9p2b:
      ' uses technically necessary cookies for fraud detection (see Section 5). These are permitted without consent pursuant to § 25(2)(2) TTDSG and are only active during the active checkout process.',
    s9p3: 'Vercel Insights and other anonymous statistics collection are disabled.',

    s10Title: '10. Data security (technical and organizational measures)',
    s10li1: 'End-to-end TLS 1.3 encryption of transmission (Cloudflare and Vercel)',
    s10li2: 'Strict Content Security Policy, HSTS and all relevant security headers',
    s10li3: 'Pattern-based filtering against injection attacks',
    s10li4: 'Honeypot-based bot defense in the form',
    s10li5: 'Rate limiting against abuse and brute force',
    s10li6: 'Row-level security in the database (PostgreSQL / Supabase)',
    s10li7: 'IP anonymization after 30 days',
    s10li8: 'Daily automatic data retention check',
    s10li9: 'Encrypted backups, segregated access rights',

    s11Title: '11. Changes to this privacy policy',
    s11p1:
      'We reserve the right to amend this privacy policy if the legal situation or our processing operations change. The current version is available on this page. We communicate material changes proactively by email to active contractual partners.',

    verifiedCustomer: 'Verified customer',
  },

  // ─── Legal Notice ──────────────────────────────────────────
  impressum: {
    seoTitle: 'Legal Notice — AEVUM',
    seoDescription:
      'Legal notice pursuant to § 5 TMG for AEVUM (Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen).',
    title: 'Legal Notice',
    version: 'As of: 20 May 2026',
    s1Title: 'Information pursuant to § 5 DDG',
    s2Title: 'Contact',
    s2Email: 'Email: ',
    s2Phone: 'Phone: ',
    s3Title: 'Professional title',
    s3p1:
      'AI Fullstack Developer (self-employed, Federal Republic of Germany). The activity is not regulated; there is no professional chamber membership and no supervisory authority.',
    s4Title: 'VAT',
    s4p1:
      'As a small business within the meaning of § 19 UStG, no VAT is shown. A VAT identification number pursuant to § 27a UStG is not maintained.',
    s5Title: 'Responsible for content pursuant to § 18(2) MStV',
    s5p1: 'Carlos Wrusch (address as above)',
    s6Title: 'EU dispute resolution',
    s6p1a:
      'The European Commission provides a platform for online dispute resolution (ODR): ',
    s6p1b:
      'We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
    s7Title: 'Liability for content',
    s7p1:
      'As a service provider, we are responsible for our own content on these pages in accordance with § 7(1) DDG under the general laws. According to §§ 8 to 10 DDG, however, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.',
    s7p2:
      'Obligations to remove or block the use of information under the general laws remain unaffected. However, liability in this respect is only possible from the point in time at which knowledge of a specific infringement of the law is obtained. Upon becoming aware of corresponding infringements, we will remove this content immediately.',
    s8Title: 'Liability for links',
    s8p1:
      'Our offer contains links to external websites of third parties, over whose content we have no influence. We can therefore not assume any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages.',
    s9Title: 'Copyright',
    s9p1:
      'The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the author.',
    s9p2:
      'Downloads and copies of this page are only permitted for private, non-commercial use.',
  },

  // ─── Terms and Conditions ──────────────────────────────────
  agb: {
    seoTitle: 'Terms — AEVUM General Terms and Conditions',
    seoDescription:
      'General Terms and Conditions of AEVUM for workflow audits, AI systems, SaaS tools and add-on services. As of 24 May 2026.',
    title1: 'General ',
    title2: 'Terms and Conditions',
    version: 'As of: 24 May 2026 · Version: agb-v3-saas-2026-05-24',
    noticeLabel: 'Notice (as of 25 May 2026):',
    notice:
      ' This text is a self-authored draft by the provider and has not yet been approved by an external law firm. We are actively working on a legal review before going into productive sales. Until then: in legally critical constellations, please obtain your own legal advice in addition before concluding a contract.',

    p1Title: '§ 1 Scope and contracting party',
    p1a:
      'These General Terms and Conditions apply to all contracts between Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen (hereinafter "Provider" or "AEVUM") and his customers regarding the provision of AEVUM services (workflow audit, AI systems, lead-generation setup, content workflows, AI automation, data engineering, hosting and maintenance).',
    p1b1: 'AEVUM is aimed primarily at entrepreneurs within the meaning of § 14 BGB (B2B). For consumers within the meaning of § 13 BGB (B2C), the statutory consumer protection regulations apply additionally, in particular the right of withdrawal (see ',
    p1b2: ').',
    p1WiderrufLink: 'cancellation policy',
    p1c:
      'Deviating, conflicting or supplementary terms and conditions of the customer only become part of the contract if AEVUM has expressly agreed to their validity in writing.',

    p2Title: '§ 2 Conclusion of contract',
    p2li1:
      'The presentation of the packages and add-ons on the website does not constitute a binding offer, but an invitation to submit an offer.',
    p2li2:
      'The contract is concluded by ordering a package (S/M/L or add-on) via the Stripe checkout or by mutual written agreement (including email). In the case of a direct purchase via Stripe, the contract is deemed concluded upon successful payment confirmation. AEVUM sends an order confirmation by email.',
    p2li3:
      'AEVUM is entitled to reject orders without giving reasons — e.g. if the request does not fit the AEVUM profile or delivery cannot be guaranteed. In this case, any payment already made will be refunded immediately.',
    p2li4:
      'The contract text is stored on AEVUM\'s systems. The customer receives a confirmation email with the essential contract data and a link to the respective applicable terms and conditions.',

    p3Title: '§ 3 Subject matter of services',
    p3p1: 'The specific scope of services results from the package description on the website:',
    p3li1Label: 'Package S — Start (3,900 €):',
    p3li1:
      ' workflow audit + automation roadmap + prioritization matrix, delivery within 5 working days after kickoff. No build included.',
    p3li2Label: 'Package M — Growth (12,900 €):',
    p3li2:
      ' full implementation of 1–2 use cases, integration with existing tools, 4–8 weeks delivery time, 3 months support after go-live.',
    p3li3Label: 'Package L — Scaling (4,900 € / month):',
    p3li3:
      ' ongoing optimization, monthly performance reports, new use cases on demand, prioritized development.',
    p3li4Label: 'Add-on services',
    p3li4:
      ' (website, lead-gen setup, content workflow, AI automation per use case): individual standalone packages with defined scope, price and delivery time according to the website.',
    p3li5Label: 'SaaS tools (pay-per-run, credit-based):',
    p3li5:
      ' self-service software tools (Script Factory, GDPR Factory, etc.). Provided as software-as-a-service with credit consumption per run. Packages:',
    p3li5sub1: 'Starter: 10 € (limited monthly credit quota)',
    p3li5sub2: 'Growth: 25 € (medium quota)',
    p3li5sub3: 'Pro: 50 € (large quota)',
    p3footer:
      'AEVUM is entitled to provide deliveries in partial performances. Delivery dates are non-binding unless expressly agreed in writing as a fixed date.',

    p4Title: '§ 4 Remuneration and payment terms',
    p4li1a:
      'The prices shown on the website at the time of ordering in euros apply. ',
    p4li1Bold:
      'As a small business within the meaning of § 19 UStG, AEVUM does not show VAT.',
    p4li1b: ' The prices shown are final prices.',
    p4li2:
      'For one-time packages, payment is due before delivery (payment via Stripe or bank transfer by arrangement).',
    p4li3:
      'For monthly billed packages (L), billing takes place on the first of the month for the respective coming month via SEPA direct debit or credit card through Stripe.',
    p4li4:
      'In the event of late payment, default interest of 9 percentage points above the base interest rate (§ 288(2) BGB) is charged. For consumers, 5 percentage points apply (§ 288(1) BGB).',
    p4li5Label: 'Pilot program discount:',
    p4li5:
      ' is automatically deducted at checkout as long as pilot slots are available. In exchange, the customer undertakes to record a testimonial video after 90 days of runtime and to publish it as a case study. AEVUM receives the right to use the video, after release by the customer, on the website and in acquisition material.',
    p4li6Label: 'Bundle discounts:',
    p4li6:
      ' 2 services −10 %, 3 services −15 %, 4 services −20 % plus 1 month of Package L free. Bundles are applied automatically when booking multiple services or on request at checkout.',

    p5Title: '§ 5 Payment processing (Stripe)',
    p5p1:
      'Payment processing is handled by Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland (hereinafter "Stripe"). Stripe is a PCI-DSS Level 1 certified payment service provider. AEVUM does not store any card or bank account data.',
    p5p2a: 'Which data Stripe processes and on what legal basis is described in detail in the ',
    p5p2b: '.',
    p5DatenschutzLink: 'privacy policy',

    p5aTitle: '§ 5a SaaS tools — credit consumption, refund policy and premium track',
    p5aLi1Label: 'Credit consumption:',
    p5aLi1:
      ' Each successful run of a SaaS tool (e.g. Script Factory, GDPR Factory) consumes a number of credits specified in the tool description from the customer\'s active tariff package.',
    p5aLi2Label: 'Auto-refund on failure:',
    p5aLi2:
      ' If a run fails due to technical errors or LLM outages, the consumed credits are automatically credited back to the account (system refund flow). No manual claim arises in cases of improper inputs or deliberate abuse attempts.',
    p5aLi3Label: 'Stock and transferability:',
    p5aLi3:
      ' Unused credits expire at the end of the month or at the end of the billing period of the selected package. A transfer between accounts or payout in money is excluded.',
    p5aLi4Label: 'Tool availability:',
    p5aLi4:
      ' SaaS tools are provided "as-is". AEVUM aims for an availability of 99 % on a monthly average, without any claim to constant accessibility. Outages at LLM sub-providers (Anthropic, OpenAI) are not included in the availability calculation.',
    p5aLi5Label: 'Premium track for partner agencies (e.g. Tim\'s customer pipeline):',
    p5aLi5:
      ' In the case of separately agreed premium cooperation in which a partner agency serves its own end customers via AEVUM tools, the following applies: the partner agency is the controller within the meaning of Art 4(7) GDPR for the data of its end customers, AEVUM is the processor pursuant to Art 28 GDPR. A separate DPA is concluded before the cooperation begins. The remuneration and commission models are regulated in a supplementary partner agreement.',

    p6Title: '§ 6 Customer obligations to cooperate',
    p6li1:
      'The customer provides AEVUM with all information, accesses and materials necessary for the provision of services in good time.',
    p6li2:
      'If the customer processes personal data of third parties (e.g. end customers, employees), the parties conclude a separate data processing agreement (DPA) pursuant to Art 28 GDPR. AEVUM provides a template free of charge on request.',
    p6li3:
      'The customer adequately secures their access data to AEVUM systems and reports any suspicion of compromise immediately.',
    p6li4:
      'Delays caused by a lack of cooperation on the part of the customer are not the responsibility of AEVUM. AEVUM is entitled to charge for any additional work arising from this at standard hourly rates.',

    p7Title: '§ 7 Rights of use',
    p7p1:
      'Insofar as AEVUM creates copyrighted works (code, workflows, documentation, configurations) in the course of providing services, the customer receives, after full payment, a simple, non-exclusive right of use, unlimited in time and space, for the agreed purpose.',
    p7p2:
      'AEVUM reserves the right to reuse generic components, templates, patterns and methodology building blocks for other projects, insofar as no customer-specific confidential information is disclosed thereby.',

    p8Title: '§ 8 Availability (Package L and hosting services)',
    p8p1:
      'AEVUM aims for an availability of the hosted systems of 99 % on an annual average, without any claim to constant accessibility. Planned maintenance windows and disruptions at sub-providers (Vercel, Supabase, Cloudflare, Stripe etc.) are not included in the availability calculation.',

    p9Title: '§ 9 Liability',
    p9li1:
      'AEVUM is liable without limitation for intent and gross negligence as well as for damages arising from injury to life, body or health.',
    p9li2:
      'In the case of slight negligence, AEVUM is only liable for the breach of essential contractual obligations (cardinal obligations), limited to the typical, foreseeable damage.',
    p9li3:
      'In the case of B2B contracts, liability is limited in amount to the value of the respective order (for subscriptions: 12 months\' remuneration).',
    p9li4: 'Any further liability is excluded.',
    p9li5:
      'Liability under the Product Liability Act and for maliciously concealed defects remains unaffected.',

    p10Title: '§ 10 Data protection and confidentiality',
    p10p1a: 'The processing of personal data takes place in accordance with the ',
    p10p1b:
      '. Insofar as AEVUM processes personal data on behalf of the customer (e.g. end-customer data), a separate DPA pursuant to Art 28 GDPR is concluded.',
    p10p2:
      'Both parties undertake to treat all non-obvious information obtained in the course of the cooperation as confidential. This obligation also applies beyond the term of the contract.',

    p11Title: '§ 11 Right of withdrawal (consumers only)',
    p11p1a:
      'Consumers within the meaning of § 13 BGB have a statutory right of withdrawal of 14 days from conclusion of the contract. For details see ',
    p11p1b: '.',
    p11p2:
      'If the service begins immediately at the express request of the consumer before the withdrawal period expires, the right of withdrawal lapses after full performance of the service (§ 356(4) BGB). In the case of early withdrawal after the start of the service, a pro-rata settlement is made (§ 357a(2) BGB).',
    p11p3:
      'B2B customers have no statutory right of withdrawal. AEVUM voluntarily grants a 14-day cancellation before the start of the provision of services (kickoff) with a full refund. After kickoff: pro-rata settlement based on effort.',

    p12Title: '§ 12 Term and termination',
    p12li1: 'One-time packages (S, M, add-ons): end with full performance of the service.',
    p12li2:
      'Subscription (Package L): minimum term 3 months, after which it can be terminated monthly at the end of the month with 14 days\' notice.',
    p12li3: 'In the case of the annual prepay variant: termination at the end of the year.',
    p12li4: 'Extraordinary termination for good cause remains unaffected.',
    p12li5: 'Terminations require text form (an email to info@aevum-system.de is sufficient).',

    p13Title: '§ 13 Final provisions',
    p13li1: 'The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods.',
    p13li2:
      'The place of jurisdiction for all disputes arising from this contractual relationship is the domicile of the provider (Wehringen, Augsburg District Court), insofar as the customer is a merchant, a legal entity under public law or a special fund under public law, or relocates their domicile abroad after conclusion of the contract.',
    p13li3a: 'European Commission platform for online dispute resolution: ',
    p13li3b:
      '. AEVUM is neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
    p13li4:
      'Should individual provisions of these terms and conditions be or become invalid, the validity of the remaining provisions remains unaffected. The statutory regulation takes the place of the invalid provision.',

    footerDatenschutz: 'Privacy',
    footerImpressum: 'Legal Notice',
    footerWiderruf: 'Cancellation Policy',
  },

  // ─── Cancellation Policy ───────────────────────────────────
  widerruf: {
    seoTitle: 'Cancellation Policy — AEVUM',
    seoDescription:
      'Cancellation policy pursuant to § 13 BGB for consumers. 14-day right of withdrawal from conclusion of the contract.',
    title1: 'Cancellation ',
    title2: 'Policy',
    version:
      'As of: 20 May 2026. This policy applies to consumers within the meaning of § 13 BGB. B2B customers have no statutory right of withdrawal — see GTC § 11 for voluntary cancellation rules.',
    noticeLabel: 'Notice (as of 25 May 2026):',
    notice:
      ' This policy is based on the statutory template pursuant to Annex 1 to Art. 246a § 1(2) EGBGB. It has not yet been approved by an external law firm. We are working on a legal review before productive B2C sales.',

    s1Title: 'Right of withdrawal',
    s1p1a: 'You have the right to withdraw from this contract within ',
    s1p1Bold: 'fourteen days',
    s1p1b: ' without giving any reason.',
    s1p2:
      'The withdrawal period is fourteen days from the day of conclusion of the contract (corresponds to the date of payment via Stripe or the written order confirmation).',
    s1p3: 'To exercise your right of withdrawal, you must inform us:',
    s1p4:
      'by means of a clear statement (e.g. a letter sent by post or an email) of your decision to withdraw from this contract. You can use the model withdrawal form below for this purpose, although it is not mandatory.',
    s1p5:
      'To meet the withdrawal deadline, it is sufficient that you send the notification of the exercise of the right of withdrawal before the withdrawal period expires.',

    s2Title: 'Consequences of withdrawal',
    s2p1:
      'If you withdraw from this contract, we must repay to you all payments we have received from you immediately and at the latest within fourteen days from the day on which the notification of your withdrawal from this contract was received by us.',
    s2p2:
      'For this repayment, we use the same means of payment that you used for the original transaction (usually via Stripe). You will not be charged any fees for this repayment.',

    s3Title: 'Early expiry of the right of withdrawal',
    s3p1:
      'In the case of contracts for the provision of services, the right of withdrawal expires when AEVUM has fully performed the service and has only begun performing the service after you have given your express consent and at the same time confirmed your knowledge that you lose your right of withdrawal upon full performance of the contract by AEVUM (§ 356(4) BGB).',

    s4Title: 'Pro-rata remuneration on early withdrawal',
    s4p1:
      'If you request that the service should begin during the withdrawal period and you subsequently exercise the right of withdrawal, you must pay us a reasonable amount corresponding to the proportion of the service already provided up to the time at which you notify us of the exercise of the right of withdrawal with regard to this contract, compared to the total scope of the service provided for in the contract (§ 357a(2) BGB).',

    s5Title: 'Model withdrawal form',
    s5p1:
      'If you wish to withdraw from the contract, please complete this form and return it:',
    s5to: 'To:',
    s5line1: 'I/we (*) hereby withdraw from the contract concluded by me/us (*) for',
    s5line2: 'the provision of the following service: ______________',
    s5line3: 'Ordered on (*) / received on (*): ______________',
    s5line4: 'Name of consumer(s): ______________',
    s5line5: 'Address of consumer(s): ______________',
    s5line6: 'Signature of consumer(s) (only for notification on paper): ______________',
    s5line7: 'Date: ______________',
    s5note: '(*) Delete as appropriate.',

    s6Title: 'Notice for entrepreneurs (B2B)',
    s6p1:
      'This cancellation policy applies exclusively to consumers within the meaning of § 13 BGB. If you order as an entrepreneur (§ 14 BGB), there is no statutory right of withdrawal. For B2B cancellations, § 11 of our GTC applies:',
    s6li1: 'Within 14 days after conclusion of the contract AND before kickoff: full refund',
    s6li2: 'After kickoff (start of the provision of services): pro-rata settlement based on effort',

    footerAgb: 'Terms',
    footerDatenschutz: 'Privacy',
    footerImpressum: 'Legal Notice',
  },
};
