export default {
  // ─── Datenschutz ───────────────────────────────────────────
  datenschutz: {
    seoTitle: 'Datenschutzerklärung — AEVUM',
    seoDescription:
      'DSGVO-konforme Datenschutzerklärung von AEVUM: Verantwortlicher, Sub-Processors, Retention-Policies, Nutzerrechte (Art 15/17/20). Stand 24.05.2026.',
    title1: 'Datenschutz',
    title2: 'erklärung',
    version: 'Stand: 24. Mai 2026 · Version: datenschutz-v6-waveH-2026-05-24',
    noticeLabel: 'Hinweis (Stand 25.05.2026):',
    notice:
      ' Diese Datenschutzerklärung ist ein Eigen-Entwurf und beschreibt die tatsächlich eingesetzten Verarbeitungen so präzise wie möglich. Eine abschließende anwaltliche Prüfung steht noch aus und ist vor produktivem Vertrieb geplant. Wir aktualisieren diese Seite, sobald die Prüfung erfolgt ist.',

    s1Title: '1. Verantwortlicher',
    s1p1:
      'Verantwortlicher im Sinne der DSGVO und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:',
    s1Email: 'E-Mail: ',
    s1Note:
      'Ein Datenschutzbeauftragter ist gesetzlich nicht erforderlich (kein Schwellenwert nach § 38 BDSG erreicht).',

    s2Title: '2. Welche Daten wir verarbeiten',
    s2li1Label: 'Workflow-Audit-Formular:',
    s2li1:
      ' Name, Firma, E-Mail, Telefon (optional), Branche, Teamgröße, Business-Beschreibung, aktuelle Tools, Budget-Rahmen, Timeline',
    s2li2Label: 'Shop-Checkout:',
    s2li2: ' Name, Firma, E-Mail, gewähltes Paket, optional Add-ons',
    s2li3Label: 'Zahlungsabwicklung über Stripe:',
    s2li3:
      ' Name, Rechnungsadresse, Zahlungsart-Metadaten (Karten-/Bankdaten sehen wir NIE — diese verbleiben bei Stripe)',
    s2li4Label: 'Server-Log-Daten:',
    s2li4:
      ' IP-Adresse, User-Agent, Referrer, Zeitstempel (zur Missbrauchsabwehr, IP-Anonymisierung nach 30 Tagen)',
    s2li5Label: 'Einwilligungs-Metadaten:',
    s2li5:
      ' Zeitpunkt, Version und Inhalt der erteilten Einwilligung (Art 7 DSGVO Nachweispflicht)',
    s2li6Label: 'Bestell- und Rechnungs-Daten:',
    s2li6: ' Vertragsdaten, Buchungs-Metadaten',
    s2li7Label: 'Helpbot / AI-Chat:',
    s2li7:
      ' Anonyme Session-ID (zufällig vergeben, kein Personenbezug), Inhalt der Nachrichten an den AEVUM-Assistant, anonymisierte IP (letztes Oktett genullt /24), User-Agent, Referrer, Sprache. Keine Erfassung von Name, E-Mail oder Telefon im Helpbot.',
    s2li8Label: 'Customer-Portal (app.aevum-system.de):',
    s2li8:
      ' Account-Stammdaten (Name, Firma, Telefon optional), Profil-Daten (Branche, Team-Größe, Vision), API-Keys (AES-256-GCM verschlüsselt in Supabase, nie im Frontend lesbar), Magic-Link-Tokens (single-use, 30 Min Lebensdauer)',
    s2li9Label: 'Customer-Documents (Inbox/Outbox/Shared):',
    s2li9:
      ' Vom Kunden bzw. AEVUM hochgeladene Dateien (PDF, DOCX, XLSX, CSV, PNG/JPG) im Rahmen aktiver Projekte, max. 5 MB pro Datei, Magic-Byte-Validation gegen Datei-Spoofing',
    s2li10Label: 'Customer-Project-Agent (LLM-Chat im Portal):',
    s2li10:
      ' Chat-Inhalt + Memory-Files (.md) zur Wissens-Speicherung pro Projekt, übermittelt an Anthropic (Claude Sonnet 4.5) zur Antwort-Generierung',
    s2li11Label: 'Script-Factory-Runs (SaaS):',
    s2li11:
      ' Brand-Profile, Produkt-Beschreibung, Hook-Goal, Platform, generierte Skript-Variationen — übermittelt an Anthropic zur Generierung, Resultat im Customer-Account gespeichert',
    s2li12Label: 'DSGVO-Factory-Runs (SaaS):',
    s2li12:
      ' Audit-Input-Daten (Branche, verarbeitete Daten-Kategorien, Tools), generiertes PDF-Audit, übermittelt an Anthropic zur Empfehlungs-Generierung',
    s2li13Label: 'Lead-Magnet-Anmeldungen:',
    s2li13:
      ' E-Mail + Name + gewählter Lead-Magnet-Slug zur PDF-Versendung (z.B. EU-AI-Act-Compliance-Guide)',
    s2li14Label: 'SaaS-Waitlist:',
    s2li14: ' E-Mail + gewähltes Tool-Slug zur Benachrichtigung bei Tool-Verfügbarkeit',
    s2li15Label: 'Testimonials (Cases):',
    s2li15:
      ' Vom Kunden freigegebene Texte, Video-URL, Brand-Name, Logo, Kennzahlen — Display nur nach explizit gewährter Permission (case_pages Flag)',
    s2li16Label: 'Subscription-/Cost-Tracking (intern):',
    s2li16:
      ' AEVUM-eigene Software-Abos und deren Zuordnung zu Customer-Projekten — interne Buchhaltung, kein Customer-PII enthalten',
    s2li17Label: 'LLM-Usage-Logs:',
    s2li17:
      ' agent_usage_log mit anonymisierter IP, Account-Referenz, Tokens-In/Out, Kosten (Cent) — zur Abrechnung der Pay-per-Run SaaS-Tools, IP-Anonymisierung sofort beim Schreiben (write-time)',
    s2li18Label: 'Telegram-Bot Magic-Links:',
    s2li18:
      ' Wenn Customer mit dem AEVUM-Telegram-Bot interagiert (optional, opt-in über Portal): Telegram-User-ID, Chat-ID, zuletzt empfangene Magic-Links',
    s2footer:
      'Es findet kein automatisiertes Profiling und keine automatisierte Einzelfall-Entscheidung im Sinne von Art 22 DSGVO statt.',

    s3Title: '3. Zwecke und Rechtsgrundlagen',
    s3li1Label: 'Workflow-Audit-Bearbeitung:',
    s3li1:
      ' Art 6 Abs 1 lit b DSGVO (Vertragsanbahnung) und lit a (Einwilligung für Folge-Kommunikation)',
    s3li2Label: 'Vertragsabwicklung (Pakete S/M/L, Add-ons):',
    s3li2: ' Art 6 Abs 1 lit b DSGVO',
    s3li3Label: 'Zahlungsabwicklung über Stripe:',
    s3li3: ' Art 6 Abs 1 lit b DSGVO (Vertrag) i.V.m. Art 6 Abs 1 lit f (Betrugsprävention)',
    s3li4Label: 'Rechnungsstellung + steuerliche Aufbewahrung:',
    s3li4: ' Art 6 Abs 1 lit c DSGVO i.V.m. § 257 HGB und § 147 AO (8–10 Jahre)',
    s3li5Label: 'Server-Logs und Missbrauchsabwehr:',
    s3li5: ' Art 6 Abs 1 lit f DSGVO (berechtigtes Interesse an Betriebs- und IT-Sicherheit)',
    s3li6Label: 'Einwilligungs-Nachweise:',
    s3li6: ' Art 6 Abs 1 lit c DSGVO i.V.m. Art 7 Abs 1 DSGVO',

    s4Title: '4. Empfänger und Auftragsverarbeiter',
    s4p1:
      'Wir setzen sorgfältig ausgewählte Dienstleister im Rahmen einer Auftragsverarbeitung nach Art 28 DSGVO ein. Mit allen aufgeführten Anbietern bestehen oder werden vor produktivem Einsatz Auftragsverarbeitungsverträge geschlossen.',
    s4thProvider: 'Anbieter',
    s4thPurpose: 'Zweck',
    s4thLocation: 'Sitz / Server-Standort',
    s4thGuarantees: 'Garantien',
    s4r1c2: 'Datenbank-Hosting',
    s4r1c3: 'USA / EU (Frankfurt eu-central-1)',
    s4r1c4: 'AVV + EU-Standardvertragsklauseln',
    s4r2c2: 'Frontend-Hosting / CDN',
    s4r2c3: 'USA / EU-Edge',
    s4r2c4: 'AVV + EU-SCCs (Data Privacy Framework)',
    s4r3c2: 'CDN, DDoS- und Bot-Abwehr',
    s4r3c3: 'USA / globales Edge-Netz (EU-Priorisierung)',
    s4r3c4: 'AVV + EU-SCCs (Data Privacy Framework)',
    s4r4c2: 'Zahlungsabwicklung',
    s4r4c3: 'Irland / EU (Mutterkonzern USA)',
    s4r4c4: 'AVV + EU-SCCs, PCI-DSS Level 1',
    s4r5c2:
      'AI-gestützte Audit-Analyse + Helpbot-Chat (Verarbeitung der vom Nutzer eingegebenen Audit-Antworten und Chat-Nachrichten zur Erstellung der Workflow-Empfehlung bzw. Beantwortung der Anfrage; keine Trainings-Nutzung gemäß Anthropic Commercial Terms, Zero-Retention API)',
    s4r5c3: 'USA',
    s4r5c4: 'AVV (Anthropic DPA) + EU-SCCs (Modul 2), Zero-Retention API',
    s4r6c2:
      'SMTP-Fallback für Transaktions-E-Mails (Magic-Link-Login, DSGVO-Challenge-Bestätigungen für Export/Löschung); nur als Fallback aktiv wenn Resend nicht verfügbar',
    s4r6c3: 'Deutschland (Berlin)',
    s4r6c4: 'AVV nach Art 28 DSGVO, § 32 BDSG, ISO 27001-zertifiziert',
    s4r7c2:
      'Primärer Versand von Transaktions-E-Mails (Magic-Link-Login, Lead-Magnet-PDFs, Bestell-Bestätigungen, DSGVO-Challenge-Bestätigungen, Waitlist-Notifications)',
    s4r7c3: 'USA, EU-Region verfügbar',
    s4r7c4: 'AVV + EU-SCCs (Modul 2), SOC 2 Type II, EU-Sub-Processor',
    s4r8c2:
      'Versand von Bot-Notifications, Customer-Magic-Links und Helpbot-Benachrichtigungen an opt-in Telegram-Accounts (nur wenn vom Kunden explizit aktiviert)',
    s4r8c3: 'Vereinigte Arabische Emirate / Schweiz',
    s4r8c4:
      'Standard-Drittland-Übertragung; nur ID-Felder + Magic-Link-URL übermittelt, keine PII-Inhalte; opt-in Basis Art 6 Abs 1 lit a',
    s4r9c2:
      'LLM-Routing-Gateway (Anthropic-Modelle) für ausgewählte interne Background-Tasks (z.B. Klassifizierung, Idea-Processing). Verarbeitet keine Customer-Chat-Inhalte direkt — primäre LLM-Verarbeitung läuft über Anthropic-Direct-API.',
    s4r9c3: 'USA',
    s4r9c4:
      'AVV ausstehend (vor Q3 2026 zu signieren); EU-SCCs (Modul 2). Zero-Retention-Mode wo verfügbar.',
    s4ddLabel: 'Drittland-Übermittlung:',
    s4dd:
      ' Soweit Daten in die USA übermittelt werden, erfolgt dies auf Grundlage der EU-Standardvertragsklauseln (Art 46 Abs 2 lit c DSGVO) und – soweit zertifiziert – auf Basis des EU-US Data Privacy Framework (Angemessenheitsbeschluss der EU-Kommission, Art 45 DSGVO).',

    s5Title: '5. Zahlungsabwicklung über Stripe',
    s5p1Pre: 'Für die Abwicklung von Zahlungen nutzen wir ',
    s5p1Post:
      ', 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe ist nach PCI-DSS Level 1 zertifiziert – dem höchsten Standard für Zahlungssicherheit.',
    s5p2Label: 'Verarbeitete Daten:',
    s5p2:
      ' Name, E-Mail-Adresse, Rechnungs-/Lieferadresse, Zahlungsmethoden-Daten (Karten-/Bankdaten verbleiben ausschließlich bei Stripe, AEVUM erhält nur Metadaten wie „Kreditkarte endend auf 4242"), IP-Adresse zur Betrugsprävention, Browser-Fingerprint für Fraud-Detection.',
    s5p3Label: 'Cookies:',
    s5p3a: ' Stripe.js setzt technisch notwendige Cookies für Fraud-Detection (z.B. ',
    s5p3b:
      '). Diese sind nach § 25 Abs 2 Nr 2 TTDSG einwilligungsfrei zulässig (unbedingt erforderlich für den Vertragsabschluss).',
    s5p4Label: 'Drittland-Übermittlung:',
    s5p4:
      ' Stripe-Mutterkonzern sitzt in den USA. Stripe verwendet EU-Standardvertragsklauseln und ergänzende technische Maßnahmen (Verschlüsselung, Pseudonymisierung). Verarbeitung erfolgt primär in EU-Rechenzentren.',
    s5p5Label: 'Stripe-Datenschutzerklärung:',
    s5p6Label: 'Rechtsgrundlage:',
    s5p6: ' Art 6 Abs 1 lit b DSGVO (Vertragserfüllung) + lit f (Betrugsprävention).',

    s6Title: '6. Auftragsverarbeitung für gewerbliche Kunden (AVV)',
    s6p1a:
      'Soweit AEVUM im Rahmen der Leistungserbringung für gewerbliche Kunden personenbezogene Daten Dritter (z.B. Endkundendaten, Mitarbeiter-Daten) verarbeitet, geschieht dies ausschließlich auf Grundlage eines separaten Auftragsverarbeitungsvertrags nach ',
    s6p1Bold: 'Art 28 DSGVO',
    s6p1b:
      '. Ein Standard-AVV-Template stellen wir auf Anfrage kostenfrei zur Verfügung. Anfragen bitte per E-Mail an ',

    s6aTitle: '6a. Helpbot / AI-Chat',
    s6ap1a:
      'Der auf der AEVUM-Website verfügbare Helpbot (AEVUM Assistant) beantwortet Fragen rund um KI-Betriebssysteme. Er ist ',
    s6ap1Bold: 'anonym',
    s6ap1b: ' nutzbar — wir erfassen keine Namen, E-Mails oder Telefonnummern.',
    s6ap2Label: 'Verarbeitete Daten:',
    s6ap2:
      ' Inhalt der von dir eingegebenen Nachrichten, eine zufällig generierte Session-ID (nicht personenbezogen), anonymisierte IP-Adresse (letztes Oktett genullt, /24), User-Agent, Referrer und Sprach-Kennung.',
    s6ap3Label: 'Zweck:',
    s6ap3:
      ' Beantwortung deiner Anfrage, Verbesserung der Antwort-Qualität, Missbrauchsabwehr (Rate-Limiting, Pattern-basierte Filterung gegen Injection-Angriffe und Spam).',
    s6ap4Label: 'Rechtsgrundlage:',
    s6ap4:
      ' Art 6 Abs 1 lit a DSGVO (deine Einwilligung, die du vor der ersten Nachricht im Chat-Fenster erteilst). Die Einwilligung kann jederzeit widerrufen werden, indem du den Verlauf über das Mülleimer-Symbol im Chat löschst. Zusätzlich Art 6 Abs 1 lit f DSGVO für die Missbrauchsabwehr (berechtigtes Interesse an IT-Sicherheit).',
    s6ap5Label: 'Empfänger / Sub-Processor:',
    s6ap5a: ' Die eingegebenen Nachrichten werden für die Generierung der Antwort an ',
    s6ap5Bold: 'Anthropic PBC',
    s6ap5b:
      ' (Modell „Claude Sonnet 4.5", USA) übermittelt. Anthropic verarbeitet die Daten als unser Auftragsverarbeiter unter EU-Standardvertragsklauseln (Modul 2), nutzt sie nicht zum Modell-Training (Anthropic Commercial Terms, Zero-Retention API). Übermittlung über die AEVUM-API (api.aevum-system.de) als ergänzender Sub-Prozess.',
    s6ap6Label: 'Speicherdauer:',
    s6ap6a: ' Chat-Verläufe werden maximal ',
    s6ap6Bold: '30 Tage',
    s6ap6b: ' gespeichert und danach automatisch (täglicher Cron-Job) gelöscht.',
    s6ap7Label: 'Recht auf Löschung:',
    s6ap7: ' Du kannst deinen Chat-Verlauf jederzeit selbst löschen über:',
    s6ali1a: 'das ',
    s6ali1Bold: 'Mülleimer-Symbol',
    s6ali1b: ' im Chat-Header bzw. „Verlauf löschen" unter dem Eingabefeld',
    s6ali2a: 'oder per E-Mail an ',
    s6ali2b: ' mit deiner Session-ID',
    s6aFootA: 'Die Lösch-Funktion ruft den API-Endpunkt ',
    s6aFootB: ' auf, der den entsprechenden Datenbank-Eintrag unverzüglich entfernt.',

    s7Title: '7. Speicherdauer',
    s7li1: 'Aktive Audit-Anfragen: bis Vertragsabschluss oder begründeter Ablehnung',
    s7li2: 'Abgeschlossene Audits ohne Vertragsschluss: 12 Monate ab Abschluss, danach Löschung',
    s7li3: 'Bestell- und Rechnungs-Daten: 10 Jahre (§ 257 HGB, § 147 AO)',
    s7li4:
      'Stripe-Zahlungsdaten: gemäß Stripe-Datenschutzerklärung, in der Regel ebenfalls 10 Jahre wegen handels- und steuerrechtlicher Aufbewahrungspflichten',
    s7li5:
      'Server-Logs: 30 Tage (danach IP-Anonymisierung), aggregierte Security-Statistiken bis zu 90 Tage',
    s7li6:
      'Helpbot / AI-Chat Verläufe: 30 Tage ab letzter Nachricht, danach automatische Löschung; jederzeit vom Nutzer selbst löschbar',
    s7li7: 'Customer-Project-Agent-Memory: bis Kunde löscht oder Account beendet wird',
    s7li8:
      'Customer-Documents (Inbox/Outbox/Shared): keine automatische Löschung — Customer-Owned, manuell vom Kunden löschbar; bei Account-Schließung Löschung innerhalb 30 Tagen',
    s7li9:
      'Script-Factory- und DSGVO-Factory-Run-Daten: 30 Tage nach Run-Abschluss (Customer kann auf Anfrage verlängern), danach automatische Löschung',
    s7li10: 'Lead-Magnet-Anmeldungen: 6 Monate nach Anmeldung, danach automatische Löschung',
    s7li11:
      'SaaS-Waitlist-Einträge: bis Tool live + 30 Tage nach Notification, danach automatische Löschung',
    s7li12:
      'LLM-Usage-Logs (agent_usage_log): 90 Tage detailliert, danach aggregierte Statistik bis zu 12 Monaten (anonymisiert, ohne IP)',
    s7li13:
      'Magic-Link-Tokens (Login + DSGVO-Challenges): 30 Min Lebensdauer, dann ungültig; verbrauchte Tokens werden nach 24 h gelöscht (single-use Schutz)',
    s7li14:
      'Bestell- und Rechnungs-Daten: 10 Jahre (§ 257 HGB, § 147 AO) — bei DSGVO-Löschung erfolgt Pseudonymisierung statt vollständiger Löschung',
    s7li15:
      'Einwilligungs-Nachweise (Art 7 Abs 1 DSGVO): bis Widerruf zzgl. 3 Jahre Regelverjährung (§ 195 BGB)',

    s8Title: '8. Ihre Rechte als Betroffene Person',
    s8p1: 'Sie haben jederzeit das Recht auf:',
    s8li1: 'Auskunft über Ihre verarbeiteten Daten (Art 15 DSGVO)',
    s8li2: 'Berichtigung unrichtiger Daten (Art 16 DSGVO)',
    s8li3a: 'Löschung (Art 17 DSGVO) – direkt umsetzbar per E-Mail oder über den API-Endpunkt ',
    s8li4: 'Einschränkung der Verarbeitung (Art 18 DSGVO)',
    s8li5: 'Datenübertragbarkeit in einem strukturierten, gängigen Format (Art 20 DSGVO)',
    s8li6: 'Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen (Art 21 DSGVO)',
    s8li7: 'Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art 7 Abs 3 DSGVO)',
    s8p2a: 'Anfragen bitte per E-Mail an ',
    s8p2b:
      '. Wir bearbeiten Anfragen innerhalb der gesetzlichen Frist von einem Monat (Art 12 Abs 3 DSGVO).',
    s8p3Label: 'Beschwerderecht (Art 77 DSGVO):',
    s8p3:
      ' Unbeschadet anderer Rechtsbehelfe haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Zuständig für AEVUM ist:',

    s9Title: '9. Cookies und Tracking',
    s9p1a: 'Die AEVUM-Website setzt ',
    s9p1Bold: 'keine Tracking-Cookies und keine Marketing-Cookies',
    s9p1b:
      '. Es findet kein Tracking durch Dritt-Anbieter wie Google Analytics, Meta Pixel, LinkedIn Insight Tag o.ä. statt.',
    s9p2a: 'Beim Checkout-Vorgang setzt ',
    s9p2Bold: 'Stripe.js',
    s9p2b:
      ' technisch notwendige Cookies für Fraud-Detection (siehe Abschnitt 5). Diese sind nach § 25 Abs 2 Nr 2 TTDSG einwilligungsfrei zulässig und nur während des aktiven Checkout-Vorgangs aktiv.',
    s9p3: 'Vercel-Insights und sonstige anonyme Statistik-Erfassung sind deaktiviert.',

    s10Title: '10. Datensicherheit (Technische und organisatorische Maßnahmen)',
    s10li1: 'Durchgehende TLS-1.3-Verschlüsselung der Übertragung (Cloudflare und Vercel)',
    s10li2: 'Strenge Content-Security-Policy, HSTS und alle relevanten Security-Header',
    s10li3: 'Pattern-basierte Filterung gegen Injection-Angriffe',
    s10li4: 'Honeypot-basierte Bot-Abwehr im Formular',
    s10li5: 'Rate-Limiting gegen Missbrauch und Brute-Force',
    s10li6: 'Row-Level-Security in der Datenbank (PostgreSQL / Supabase)',
    s10li7: 'IP-Anonymisierung nach 30 Tagen',
    s10li8: 'Tägliche automatische Daten-Retention-Prüfung',
    s10li9: 'Verschlüsselte Backups, getrennte Zugriffsrechte',

    s11Title: '11. Änderungen dieser Datenschutzerklärung',
    s11p1:
      'Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich die Rechtslage oder unsere Verarbeitungsprozesse ändern. Die jeweils aktuelle Version ist auf dieser Seite abrufbar. Wesentliche Änderungen kommunizieren wir aktiven Vertragspartnern proaktiv per E-Mail.',

    verifiedCustomer: 'Verifizierter Kunde',
  },

  // ─── Impressum ─────────────────────────────────────────────
  impressum: {
    seoTitle: 'Impressum — AEVUM',
    seoDescription:
      'Impressum nach § 5 TMG für AEVUM (Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen).',
    title: 'Impressum',
    version: 'Stand: 20. Mai 2026',
    s1Title: 'Angaben gemäß § 5 DDG',
    s2Title: 'Kontakt',
    s2Email: 'E-Mail: ',
    s2Phone: 'Telefon: ',
    s3Title: 'Berufsbezeichnung',
    s3p1:
      'AI Fullstack Developer (selbstständig tätig, Bundesrepublik Deutschland). Die Tätigkeit ist nicht reglementiert; es bestehen keine berufsständische Kammer-Mitgliedschaft und keine Aufsichtsbehörde.',
    s4Title: 'Umsatzsteuer',
    s4p1:
      'Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer ausgewiesen. Eine Umsatzsteuer-Identifikationsnummer nach § 27a UStG wird nicht geführt.',
    s5Title: 'Inhaltlich verantwortlich gem. § 18 Abs 2 MStV',
    s5p1: 'Carlos Wrusch (Anschrift wie oben)',
    s6Title: 'EU-Streitschlichtung',
    s6p1a:
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: ',
    s6p1b:
      'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    s7Title: 'Haftung für Inhalte',
    s7p1:
      'Als Diensteanbieter sind wir gemäß § 7 Abs 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
    s7p2:
      'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.',
    s8Title: 'Haftung für Links',
    s8p1:
      'Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
    s9Title: 'Urheberrecht',
    s9p1:
      'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Verfassers.',
    s9p2:
      'Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.',
  },

  // ─── AGB ───────────────────────────────────────────────────
  agb: {
    seoTitle: 'AGB — AEVUM Allgemeine Geschäftsbedingungen',
    seoDescription:
      'Allgemeine Geschäftsbedingungen von AEVUM für Workflow-Audits, AI-Systeme, SaaS-Tools und Add-on-Services. Stand 24.05.2026.',
    title1: 'Allgemeine ',
    title2: 'Geschäftsbedingungen',
    version: 'Stand: 24. Mai 2026 · Version: agb-v3-saas-2026-05-24',
    noticeLabel: 'Hinweis (Stand 25.05.2026):',
    notice:
      ' Dieser Text ist ein Eigen-Entwurf des Anbieters und wurde noch nicht durch eine externe Rechtsanwaltskanzlei freigegeben. Wir arbeiten aktiv an einer anwaltlichen Prüfung vor produktivem Vertrieb. Bis dahin gilt: bei rechtlich kritischen Konstellationen bitte vor Vertragsschluss zusätzlich eigene anwaltliche Beratung einholen.',

    p1Title: '§ 1 Geltungsbereich und Vertragspartner',
    p1a:
      'Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Verträge zwischen Carlos Wrusch, Federteilstr. 2e, 86517 Wehringen (nachfolgend „Anbieter" oder „AEVUM") und seinen Kunden über die Erbringung von AEVUM-Dienstleistungen (Workflow-Audit, AI-Systeme, Lead-Generation-Setup, Content-Workflows, AI-Automation, Data-Engineering, Hosting und Wartung).',
    p1b1: 'AEVUM richtet sich primär an Unternehmer im Sinne von § 14 BGB (B2B). Bei Verbrauchern im Sinne von § 13 BGB (B2C) gelten ergänzend die gesetzlichen Verbraucherschutz-Regelungen, insbesondere das Widerrufsrecht (siehe ',
    p1b2: ').',
    p1WiderrufLink: 'Widerrufsbelehrung',
    p1c:
      'Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nur Vertragsbestandteil, wenn AEVUM ihrer Geltung ausdrücklich schriftlich zugestimmt hat.',

    p2Title: '§ 2 Vertragsschluss',
    p2li1:
      'Die Darstellung der Pakete und Add-ons auf der Website stellt kein bindendes Angebot, sondern eine Aufforderung zur Abgabe eines Angebots dar.',
    p2li2:
      'Der Vertrag kommt durch Bestellung eines Pakets (S/M/L oder Add-on) über den Stripe-Checkout oder durch beidseitige schriftliche Vereinbarung (auch E-Mail) zustande. Bei Direktkauf über Stripe gilt der Vertrag mit erfolgreicher Zahlungsbestätigung als geschlossen. AEVUM versendet eine Auftragsbestätigung per E-Mail.',
    p2li3:
      'AEVUM ist berechtigt, Bestellungen ohne Begründung abzulehnen — z.B. wenn die Anfrage nicht zum AEVUM-Profil passt oder Lieferung nicht gewährleistet werden kann. In diesem Fall wird eine bereits geleistete Zahlung unverzüglich rückerstattet.',
    p2li4:
      'Der Vertragstext wird auf den Systemen von AEVUM gespeichert. Der Kunde erhält eine Bestätigungs-E-Mail mit den wesentlichen Vertragsdaten und einem Link zu den jeweils gültigen AGB.',

    p3Title: '§ 3 Leistungsgegenstand',
    p3p1: 'Der konkrete Leistungsumfang ergibt sich aus der Paketbeschreibung auf der Website:',
    p3li1Label: 'Paket S — Start (3.900 €):',
    p3li1:
      ' Workflow-Audit + Automatisierungs-Roadmap + Priorisierungs-Matrix, Lieferung in 5 Werktagen nach Kickoff. Kein Build inkludiert.',
    p3li2Label: 'Paket M — Wachstum (12.900 €):',
    p3li2:
      ' Vollständige Implementation 1–2 Use Cases, Integration mit bestehenden Tools, 4–8 Wochen Lieferzeit, 3 Monate Support nach Go-Live.',
    p3li3Label: 'Paket L — Skalierung (4.900 € / Monat):',
    p3li3:
      ' Laufende Optimierung, monatliche Performance-Reports, neue Use Cases on-demand, priorisierte Entwicklung.',
    p3li4Label: 'Add-on-Services',
    p3li4:
      ' (Website, Lead-Gen-Setup, Content-Workflow, AI-Automation pro Use Case): einzelne Standalone-Pakete mit definiertem Scope, Preis und Lieferzeit gemäß Website.',
    p3li5Label: 'SaaS-Tools (Pay-per-Run, Credit-basiert):',
    p3li5:
      ' Self-Service Software-Tools (Script-Factory, DSGVO-Factory u.a.). Bereitstellung als Software-as-a-Service mit Credit-Verbrauch pro Lauf. Pakete:',
    p3li5sub1: 'Starter: 10 € (begrenztes monatliches Credit-Kontingent)',
    p3li5sub2: 'Growth: 25 € (mittleres Kontingent)',
    p3li5sub3: 'Pro: 50 € (großes Kontingent)',
    p3footer:
      'AEVUM ist berechtigt, Lieferungen in Teilleistungen zu erbringen. Liefertermine sind unverbindlich, soweit nicht ausdrücklich schriftlich als Fixtermin vereinbart.',

    p4Title: '§ 4 Vergütung und Zahlungsbedingungen',
    p4li1a:
      'Es gelten die zum Zeitpunkt der Bestellung auf der Website ausgewiesenen Preise in Euro. ',
    p4li1Bold:
      'Als Kleinunternehmer im Sinne von § 19 UStG weist AEVUM keine Umsatzsteuer aus.',
    p4li1b: ' Die ausgewiesenen Preise sind Endpreise.',
    p4li2:
      'Bei einmaligen Paketen ist die Zahlung vor Lieferung fällig (Bezahlung über Stripe oder Banküberweisung nach Absprache).',
    p4li3:
      'Bei monatlich abgerechneten Paketen (L) erfolgt die Abrechnung am Monatsersten für den jeweils kommenden Monat per SEPA-Lastschrift oder Kreditkarte über Stripe.',
    p4li4:
      'Bei Zahlungsverzug werden Verzugszinsen i.H.v. 9 Prozentpunkten über dem Basiszinssatz (§ 288 Abs 2 BGB) berechnet. Bei Verbrauchern gelten 5 Prozentpunkte (§ 288 Abs 1 BGB).',
    p4li5Label: 'Pilot-Programm-Rabatt:',
    p4li5:
      ' wird automatisch im Checkout abgezogen, solange Pilot-Slots verfügbar sind. Im Tausch verpflichtet sich der Kunde zur Aufnahme eines Testimonial-Videos nach 90 Tagen Laufzeit und zur Veröffentlichung als Case-Study. AEVUM erhält das Recht, das Video nach Freigabe durch den Kunden auf der Website und in Akquise-Material zu nutzen.',
    p4li6Label: 'Bundle-Rabatte:',
    p4li6:
      ' 2 Services −10 %, 3 Services −15 %, 4 Services −20 % zzgl. 1 Monat Paket L gratis. Bundles werden bei Mehrfach-Buchung automatisch oder auf Anfrage im Checkout angewendet.',

    p5Title: '§ 5 Zahlungsabwicklung (Stripe)',
    p5p1:
      'Die Zahlungsabwicklung erfolgt über die Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland (nachfolgend „Stripe"). Stripe ist PCI-DSS-Level-1-zertifizierter Zahlungsdienstleister. AEVUM speichert keine Karten- oder Bankverbindungsdaten.',
    p5p2a: 'Welche Daten Stripe verarbeitet und auf welcher Rechtsgrundlage, ist in der ',
    p5p2b: ' detailliert beschrieben.',
    p5DatenschutzLink: 'Datenschutzerklärung',

    p5aTitle: '§ 5a SaaS-Tools — Credit-Verbrauch, Refund-Policy und Premium-Track',
    p5aLi1Label: 'Credit-Verbrauch:',
    p5aLi1:
      ' Jeder erfolgreiche Lauf eines SaaS-Tools (z.B. Script-Factory, DSGVO-Factory) verbraucht eine in der Tool-Beschreibung ausgewiesene Anzahl Credits aus dem aktiven Tarif-Paket des Kunden.',
    p5aLi2Label: 'Auto-Refund bei Fehlschlag:',
    p5aLi2:
      ' Schlägt ein Lauf aufgrund technischer Fehler oder LLM-Ausfälle fehl, werden die verbrauchten Credits automatisch dem Konto wieder gutgeschrieben (System-Refund-Flow). Ein manueller Anspruch entsteht nicht in Fällen unsachgemäßer Eingaben oder bewusster Missbrauchs-Versuche.',
    p5aLi3Label: 'Bestand und Übertragbarkeit:',
    p5aLi3:
      ' Nicht verbrauchte Credits verfallen am Monatsende bzw. am Ende der Abrechnungsperiode des gewählten Pakets. Eine Übertragung zwischen Accounts oder Auszahlung in Geld ist ausgeschlossen.',
    p5aLi4Label: 'Tool-Verfügbarkeit:',
    p5aLi4:
      ' SaaS-Tools werden „as-is" bereitgestellt. AEVUM strebt eine Verfügbarkeit von 99 % im Monatsmittel an, ohne Anspruch auf ständige Erreichbarkeit. Ausfälle bei LLM-Sub-Dienstleistern (Anthropic, OpenAI) werden nicht in die Verfügbarkeitsberechnung einbezogen.',
    p5aLi5Label: 'Premium-Track für Partner-Agenturen (z.B. Tim\'s Customer-Pipeline):',
    p5aLi5:
      ' Bei separat vereinbarter Premium-Zusammenarbeit, in der eine Partner-Agentur ihre eigenen Endkunden über AEVUM-Tools bedient, gilt: Die Partner-Agentur ist Verantwortlicher im Sinne von Art 4 Nr 7 DSGVO für die Daten ihrer Endkunden, AEVUM ist Auftragsverarbeiter nach Art 28 DSGVO. Ein separater AVV wird vor Aufnahme der Zusammenarbeit geschlossen. Die Vergütungs- und Provisionsmodelle werden in einem ergänzenden Partnervertrag geregelt.',

    p6Title: '§ 6 Mitwirkungspflichten des Kunden',
    p6li1:
      'Der Kunde stellt AEVUM alle für die Leistungserbringung notwendigen Informationen, Zugänge und Materialien rechtzeitig zur Verfügung.',
    p6li2:
      'Wenn der Kunde personenbezogene Daten Dritter (z.B. Endkunden, Mitarbeiter) verarbeitet, schließen die Parteien einen separaten Auftragsverarbeitungsvertrag (AVV) nach Art 28 DSGVO. Ein Template stellt AEVUM auf Anfrage kostenfrei zur Verfügung.',
    p6li3:
      'Der Kunde sichert seine Zugangsdaten zu AEVUM-Systemen angemessen und meldet Verdacht auf Kompromittierung unverzüglich.',
    p6li4:
      'Verzögerungen, die durch fehlende Mitwirkung des Kunden entstehen, sind nicht von AEVUM zu vertreten. AEVUM ist berechtigt, daraus entstehenden Mehraufwand nach üblichen Stundensätzen abzurechnen.',

    p7Title: '§ 7 Nutzungsrechte',
    p7p1:
      'Soweit AEVUM im Rahmen der Leistungserbringung urheberrechtlich geschützte Werke erstellt (Code, Workflows, Dokumentation, Konfigurationen), erhält der Kunde nach vollständiger Zahlung ein einfaches, nicht-exklusives, zeitlich und räumlich unbeschränktes Nutzungsrecht für den vereinbarten Zweck.',
    p7p2:
      'AEVUM behält das Recht, generische Komponenten, Templates, Patterns und Methodik-Bausteine für andere Projekte wiederzuverwenden, soweit dadurch keine kundenspezifischen vertraulichen Informationen offengelegt werden.',

    p8Title: '§ 8 Verfügbarkeit (Paket L und Hosting-Services)',
    p8p1:
      'AEVUM strebt eine Verfügbarkeit der gehosteten Systeme von 99 % im Jahresmittel an, ohne Anspruch auf ständige Erreichbarkeit. Geplante Wartungsfenster und Störungen bei Sub-Dienstleistern (Vercel, Supabase, Cloudflare, Stripe etc.) werden nicht in die Verfügbarkeitsberechnung einbezogen.',

    p9Title: '§ 9 Haftung',
    p9li1:
      'AEVUM haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.',
    p9li2:
      'Bei leichter Fahrlässigkeit haftet AEVUM nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen, vorhersehbaren Schaden.',
    p9li3:
      'Bei B2B-Verträgen ist die Haftung der Höhe nach auf den Wert der jeweiligen Bestellung (bei Subscription: 12 Monate Vergütung) begrenzt.',
    p9li4: 'Eine darüber hinausgehende Haftung ist ausgeschlossen.',
    p9li5:
      'Die Haftung nach dem Produkthaftungsgesetz und für arglistig verschwiegene Mängel bleibt unberührt.',

    p10Title: '§ 10 Datenschutz und Vertraulichkeit',
    p10p1a: 'Die Verarbeitung personenbezogener Daten erfolgt gemäß ',
    p10p1b:
      '. Soweit AEVUM personenbezogene Daten im Auftrag des Kunden verarbeitet (z.B. Endkunden-Daten), wird ein separater AVV nach Art 28 DSGVO geschlossen.',
    p10p2:
      'Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten, nicht offenkundigen Informationen vertraulich zu behandeln. Diese Pflicht gilt auch über die Vertragslaufzeit hinaus.',

    p11Title: '§ 11 Widerrufsrecht (nur Verbraucher)',
    p11p1a:
      'Verbraucher im Sinne von § 13 BGB haben ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss. Details siehe ',
    p11p1b: '.',
    p11p2:
      'Bei sofortigem Beginn der Dienstleistung auf ausdrücklichen Wunsch des Verbrauchers vor Ablauf der Widerrufsfrist erlischt das Widerrufsrecht nach vollständiger Leistungserbringung (§ 356 Abs 4 BGB). Bei vorzeitigem Widerruf nach Beginn der Leistung wird anteilig abgerechnet (§ 357a Abs 2 BGB).',
    p11p3:
      'Bei B2B-Kunden besteht kein gesetzliches Widerrufsrecht. AEVUM gewährt freiwillig eine 14-tägige Stornierung vor Beginn der Leistungserbringung (Kickoff) mit voller Erstattung. Nach Kickoff: anteilige Abrechnung nach Aufwand.',

    p12Title: '§ 12 Laufzeit und Kündigung',
    p12li1: 'Einmal-Pakete (S, M, Add-ons): enden mit vollständiger Leistungserbringung.',
    p12li2:
      'Subscription (Paket L): Mindestlaufzeit 3 Monate, danach monatlich kündbar zum Monatsende mit Frist von 14 Tagen.',
    p12li3: 'Bei Jahres-Prepay-Variante: Kündigung zum Jahresende.',
    p12li4: 'Außerordentliche Kündigung aus wichtigem Grund bleibt unberührt.',
    p12li5: 'Kündigungen bedürfen der Textform (E-Mail an info@aevum-system.de genügt).',

    p13Title: '§ 13 Schlussbestimmungen',
    p13li1: 'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
    p13li2:
      'Gerichtsstand für sämtliche Streitigkeiten aus diesem Vertragsverhältnis ist der Wohnsitz des Anbieters (Wehringen, Amtsgericht Augsburg), soweit der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist oder seinen Wohnsitz nach Vertragsschluss ins Ausland verlegt.',
    p13li3a: 'Plattform der Europäischen Kommission zur Online-Streitbeilegung: ',
    p13li3b:
      '. AEVUM ist nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    p13li4:
      'Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.',

    footerDatenschutz: 'Datenschutz',
    footerImpressum: 'Impressum',
    footerWiderruf: 'Widerrufsbelehrung',
  },

  // ─── Widerrufsbelehrung ────────────────────────────────────
  widerruf: {
    seoTitle: 'Widerrufsbelehrung — AEVUM',
    seoDescription:
      'Widerrufsbelehrung gemäß § 13 BGB für Verbraucher. 14-Tage-Widerrufsrecht ab Vertragsschluss.',
    title1: 'Widerrufs',
    title2: 'belehrung',
    version:
      'Stand: 20. Mai 2026. Diese Belehrung gilt für Verbraucher im Sinne von § 13 BGB. B2B-Kunden haben kein gesetzliches Widerrufsrecht — siehe AGB § 11 für freiwillige Stornierungsregeln.',
    noticeLabel: 'Hinweis (Stand 25.05.2026):',
    notice:
      ' Diese Belehrung orientiert sich am gesetzlichen Muster nach Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB. Sie wurde noch nicht durch eine externe Rechtsanwaltskanzlei freigegeben. Wir arbeiten an einer anwaltlichen Prüfung vor produktivem B2C-Vertrieb.',

    s1Title: 'Widerrufsrecht',
    s1p1a: 'Sie haben das Recht, binnen ',
    s1p1Bold: 'vierzehn Tagen',
    s1p1b: ' ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
    s1p2:
      'Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses (entspricht dem Datum der Bezahlung über Stripe oder der schriftlichen Auftragsbestätigung).',
    s1p3: 'Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:',
    s1p4:
      'mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das untenstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.',
    s1p5:
      'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',

    s2Title: 'Folgen des Widerrufs',
    s2p1:
      'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.',
    s2p2:
      'Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben (in der Regel über Stripe). Wegen dieser Rückzahlung werden Ihnen keine Entgelte berechnet.',

    s3Title: 'Vorzeitiges Erlöschen des Widerrufsrechts',
    s3p1:
      'Bei Verträgen zur Erbringung von Dienstleistungen erlischt das Widerrufsrecht dann, wenn AEVUM die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch AEVUM verlieren (§ 356 Abs 4 BGB).',

    s4Title: 'Anteilige Vergütung bei vorzeitigem Widerruf',
    s4p1:
      'Verlangen Sie, dass die Dienstleistung während der Widerrufsfrist beginnen soll, und üben Sie das Widerrufsrecht anschließend aus, haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistung im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistung entspricht (§ 357a Abs 2 BGB).',

    s5Title: 'Muster-Widerrufsformular',
    s5p1:
      'Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück:',
    s5to: 'An:',
    s5line1: 'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über',
    s5line2: 'die Erbringung der folgenden Dienstleistung: ______________',
    s5line3: 'Bestellt am (*) / erhalten am (*): ______________',
    s5line4: 'Name des/der Verbraucher(s): ______________',
    s5line5: 'Anschrift des/der Verbraucher(s): ______________',
    s5line6: 'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ______________',
    s5line7: 'Datum: ______________',
    s5note: '(*) Unzutreffendes streichen.',

    s6Title: 'Hinweis für Unternehmer (B2B)',
    s6p1:
      'Diese Widerrufsbelehrung gilt ausschließlich für Verbraucher im Sinne von § 13 BGB. Wenn Sie als Unternehmer (§ 14 BGB) bestellen, besteht kein gesetzliches Widerrufsrecht. Für B2B-Stornierungen gilt § 11 unserer AGB:',
    s6li1: 'Innerhalb von 14 Tagen nach Vertragsschluss UND vor Kickoff: volle Erstattung',
    s6li2: 'Nach Kickoff (Beginn der Leistungserbringung): anteilige Abrechnung nach Aufwand',

    footerAgb: 'AGB',
    footerDatenschutz: 'Datenschutz',
    footerImpressum: 'Impressum',
  },
};
