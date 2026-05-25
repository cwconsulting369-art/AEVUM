# Cold-Outreach-System — DSGVO-Konformitäts-Check

**Blueprint:** cold-outreach-system
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Cold-Outreach ist DSGVO-/UWG-kritisch — bei Unsicherheit Anwalt konsultieren. Insbesondere im B2C-Kontext kategorisch verboten.

---

## 0. Kategorischer Vorbehalt

**B2B-Only.** Cold-E-Mail an Privatpersonen (B2C) ist nach § 7 Abs. 2 Nr. 3 UWG ausnahmslos rechtswidrig ohne Einwilligung. Dieses Blueprint ist ausschließlich für B2B-Direktansprache an Geschäftsadressen gemacht. Bei B2C-Einsatz: Customer trägt volles Risiko (Abmahnung, Bußgeld bis €20k pro Verstoß).

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Vorname + Nachname | Stammdaten (Art. 4 Nr. 1 DSGVO) | n8n-Execution-Log + CSV-Quelle + Sender-Provider-Logs | n8n: <30d; CSV: Customer-Choice; Provider: provider-spezifisch |
| Geschäfts-E-Mail | Kommunikationsdatum (B2B-Kontakt) | n8n + Mail-Provider (Resend/Postmark/SMTP) + OpenRouter-Logs | n8n <30d; Provider 6-12 Monate (Mail-Server-Logs); OpenRouter: laut DPA |
| Firma + Position | Berufliche Daten (B2B) | n8n + OpenRouter (für Hook-Generierung) | wie oben |
| LinkedIn-URL | Öffentlich verfügbarer Profil-Link | n8n + ggf. CSV-Backup | wie oben |
| Optionale Notiz (Freitext) | Profilbildung (kann Sensibles enthalten) | n8n + OpenRouter | wie oben |
| Opt-Out-Status | Steuerungsdatum | n8n-Static-Data ODER externe Blocklist-DB | 3 Jahre (DSGVO-Pflicht zur Verhinderung erneuter Kontaktierung) |
| KI-generierter Hook (2 Sätze) | abgeleiteter Personalisierungs-Output | n8n-Execution + Mail-Body | wie n8n |

**Potential für besondere Kategorien (Art. 9 DSGVO):** Optionale Notiz-Spalte ist Freitext → Customer darf KEINE Gesundheits-/politischen/religiösen Annahmen über Empfänger eintragen. CSV-Template muss klaren Hinweis enthalten.

---

## 2. Rechtsgrundlage

**Welche Rechtsgrundlage trägt die Verarbeitung?**

| Kontext | Grundlage |
|---|---|
| Recherche + Speicherung der B2B-Geschäftsadresse | **Art. 6 (1) lit. f DSGVO** — berechtigtes Interesse (Geschäftsanbahnung) |
| Versand Cold-Mail 1 (Erstansprache) | **§ 7 Abs. 2 Nr. 3 UWG** (mutmaßliches Interesse) **+ Art. 6 (1) lit. f DSGVO** (berechtigtes Interesse) |
| Follow-Up Mail 2 + Mail 3 | Gleiche Grundlage, ABER: Wenn Empfänger nicht reagiert oder ablehnt → kein berechtigtes Interesse mehr |
| KI-Personalisierung via OpenRouter | **Art. 6 (1) lit. f** + ggf. **Art. 28 DSGVO (Auftragsverarbeitung)** falls OpenRouter Sub-Processor |
| Opt-Out-Speicherung (Blocklist) | **Art. 6 (1) lit. c** — rechtliche Verpflichtung (Werbe-Widerspruch nach Art. 21 DSGVO + § 7 UWG umsetzen) |

### § 7 UWG Voraussetzungen (Pflicht-Erfüllung)

Cold-E-Mail an B2B-Empfänger ist nur zulässig, wenn ALLE folgenden Kriterien erfüllt sind:

1. **Sachlicher Zusammenhang** zwischen Angebot und Tätigkeit des Empfängers (z.B. Marketing-Tool an Marketing-Manager — JA; Yoga-Kurs an CTO — NEIN)
2. **Mutmaßliches Interesse** des Empfängers an dem Angebot (objektiv bewertbar)
3. **Empfänger ist Unternehmer** im Sinne § 14 BGB (juristische Person oder selbstständige natürliche Person)
4. **Öffentlich zugängliche E-Mail-Adresse** (Website-Impressum, LinkedIn-Profil, Apollo-verifizierte Geschäftsadresse)
5. **Klare Absender-Identifikation** (Namen, Firma, Kontaktadresse in jeder Mail)
6. **Opt-Out-Möglichkeit** in jeder Mail
7. **Keine irreführende Betreffzeile** (z.B. "Re: Ihre Anfrage" wenn keine Anfrage existierte → unzulässig)

**Customer-Pflicht:** Vor jeder Kampagne diese 7-Punkt-Checkliste durchgehen und dokumentieren.

---

## 3. Pflicht-Konfiguration im Workflow + Mail

### A) Mail-Footer (Pflicht in jeder einzelnen Mail — Mail 1, 2, 3)

```
Absender: [Vorname Nachname]
[Firma + Rechtsform, z.B. GmbH]
[Vollständige Anschrift inkl. PLZ + Ort + Land]
[Telefon] | [E-Mail]
[Optional: Website-Link]

Keine weiteren Nachrichten gewünscht? [Hier abmelden — Opt-Out-Link]
```

**Im Blueprint-Workflow:** Die Email-Nodes enthalten bereits Footer-Struktur — Customer MUSS Platzhalter mit echten Daten füllen vor Aktivierung.

### B) Opt-Out-Link in jeder Mail

Pflicht. Nicht versteckt, nicht im Spam-Filter-anfälligen-Format ("klick hier" reicht; "DEINE DATEN LÖSCHEN" macht es schlimmer).

**Workflow-Implementation:**
- Webhook-Node `outreach-optout` ist bereits konfiguriert
- Bei Klick: Email-Adresse landet auf Blocklist
- Pflicht-Konfiguration: Customer muss Blocklist-Storage einrichten (Airtable / Supabase / n8n-Static-Data)
- Pflicht-Konfiguration: Vor jedem Versand prüfen, ob Adresse auf Blocklist (Customer-Erweiterung, im Default-Workflow noch nicht enthalten — siehe Phase-2-Hinweis)

### C) Betreff ohne Irreführung

- ❌ "Re:" wenn kein Vorgespräch
- ❌ "Bestätigung Ihrer Anfrage"
- ❌ "Ihre Rechnung"
- ✅ "Kurze Frage, [Vorname]"
- ✅ "Idee für [Firma]"
- ✅ "[Konkretes Thema]?"

### D) Sender-Adresse-Transparenz

`outreach@firma.de` muss zu real existierender, erreichbarer Person/Postfach gehören. Reply-To muss funktionieren. NIEMALS `noreply@`-Adressen für Cold-Outreach.

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — | 🟢 LOW wenn EU-Server |
| **OpenRouter** | KI-Hook-Generator | ❌ US (Provider) — leitet weiter an Model-Provider (OpenAI/Anthropic/Mistral) | openrouter.ai/privacy | 🟠 HIGH (PII-Transfer in Drittland, SCC + Customer-Hinweis Pflicht) |
| **Resend** | E-Mail-Versand | ✅ EU-Region verfügbar | resend.com/legal/dpa | 🟢 LOW |
| **Postmark** | E-Mail-Versand (alternative) | ❌ US (mit SCC) | postmarkapp.com/eu-privacy | 🟡 MEDIUM |
| **Mailgun** | E-Mail-Versand (alternative) | ✅ EU-Region wählbar | mailgun.com/dpa | 🟢 LOW wenn EU-gewählt |
| **Eigener SMTP** | E-Mail-Versand | Customer-Choice | — | 🟢 LOW wenn EU-Server |
| **Apollo.io** | Lead-Quelle | ❌ US | apollo.io/privacy/dpa | 🟠 HIGH (Customer ist Verantwortlicher; Apollo nur Lieferant — Recherche-Rechtsgrundlage Customer-Sache) |
| **LinkedIn** | Lead-Quelle (öffentliche Profile) | ❌ US | — | 🟡 MEDIUM (öffentliche Daten OK, aber Scraping gegen ToS) |
| **Cloudflare** | Webhook-Schutz | Mixed | cloudflare.com/cloudflare-customer-dpa | 🟢 LOW |
| **Calendly** | Termin-Buchung (in Mail-Footer) | ❌ US | calendly.com/dpa | 🟡 MEDIUM (Lead-Daten beim Termin → Customer braucht DPA) |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors als Auftragsverarbeiter in Verzeichnis aufnehmen (Art. 30 DSGVO)
2. SCCs (Standard Contractual Clauses) bei US-Vendors prüfen
3. In Datenschutzerklärung Liste der Auftragsverarbeiter erwähnen + Drittland-Transfer-Hinweis

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: CSV-Quelle + Blocklist + ggf. CRM nach Email-Adresse durchsuchen, Daten exportieren, an Betroffenen senden binnen 30 Tagen |
| **Berichtigung** (Art. 16) | Customer-Prozess: in CSV-Quelle korrigieren, Workflow neu durchlaufen lassen für aktualisierte Hooks |
| **Löschung** (Art. 17) | n8n-Execution-Log: Auto-Cleanup 30d. CSV/CRM: Customer-Pflicht zur sofortigen Löschung. Blocklist-Eintrag bleibt (siehe Begründung in Löschfristen) |
| **Einschränkung** (Art. 18) | Email auf Blocklist + CRM-Status "DSGVO-Hold" → kein weiteres Processing |
| **Datenübertragbarkeit** (Art. 20) | CSV-Export aus Quelle (Apollo / LinkedIn-Backup / CRM) |
| **Widerspruch** (Art. 21) | **DAS IST DER KERN BEI COLD-OUTREACH** — Opt-Out-Link in jeder Mail Pflicht. Klick = sofortige Aufnahme in Blocklist, keine weiteren Mails. Bestätigungsmail mit Bestätigung der Löschung empfohlen. |
| **Automatisierte Einzelentscheidung** (Art. 22) | Nicht einschlägig — KI-Hook ist Personalisierung, keine rechtliche Entscheidung. Trotzdem: in DS-Erklärung Hinweis auf KI-Personalisierung aufnehmen (Transparenz-Pflicht aus Art. 13). |

---

## 6. Löschfristen-Logik

| Lead-Status | Aufbewahrung | Grund |
|---|---|---|
| Kontakt im aktiven Sequenz-Versand | bis Sequenz-Ende oder Antwort | Verarbeitungs-Notwendigkeit |
| Kontakt hat geantwortet (positiv/neutral) | nach Customer-CRM-Policy (Vertriebs-Lifecycle, max 12 Monate ohne Aktivität) | berechtigtes Interesse |
| Kontakt hat nicht geantwortet, Sequenz abgeschlossen | 90 Tage nach letztem Mail-Send | nach 90d kein berechtigtes Interesse mehr für erneute Kontaktierung |
| Kontakt hat sich abgemeldet (Opt-Out) | **3 Jahre auf Blocklist** (NICHT löschen) | Verhindert erneute Kontaktierung; § 7 UWG + Werbewiderspruch Art. 21 DSGVO |
| n8n-Execution-Log | 30 Tage | Operational |
| Mail-Provider-Logs (Resend etc.) | provider-spezifisch (6-12 Monate üblich) | Customer hat Einfluss via DPA |
| OpenRouter-API-Logs | je nach OpenRouter-Settings + Model-Provider-Policy | bei OpenRouter "no-log"-Modus aktivieren wenn verfügbar |

**Implementation:**
- Customer richtet Cron in CSV-Quelle / CRM ein für Auto-Delete nach 90d (Cold-Lead-Cleanup)
- Blocklist bleibt 3 Jahre, separater Speicher (z.B. eigene Airtable-Tabelle / Supabase-Tabelle), nicht löschen!
- Blocklist-Check vor jedem Send-Step → Pflicht-Erweiterung des Default-Workflows

**Pflicht-Hinweis Customer:** Blocklist-Check ist im Default-Workflow NICHT enthalten. Customer MUSS einen IF-Node mit Blocklist-Lookup vor jedem Send-Step einbauen, sonst landet eine bereits-abgemeldete Adresse erneut in Sequenz → DSGVO-Verstoß. AEVUM-DFY-Variante baut das ein.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Grenzfall:**
- Reines B2B-Cold-Outreach ohne besondere Kategorien + Volumen <10k Empfänger/Jahr: **Nein**, aber Risiko-Analyse empfohlen
- KI-Profiling über Hook hinaus (z.B. Persönlichkeits-Inferenz, Branchen-Sentiment): **Ja**
- Volumen >10k Empfänger/Jahr: **Ja** (Skalierungs-DSFA empfohlen)
- B2B in regulierten Branchen (Healthcare, Finance): **Ja** (Anwalt!)

**Bei DSFA-Pflicht:**
- Zweck-Beschreibung
- Notwendigkeitsprüfung
- Risiko-Matrix (siehe SECURITY-RISKS.md)
- Mitigation-Maßnahmen
- Ggf. Konsultation Datenschutzaufsicht

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Cold-Outreach-System |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — OpenRouter-Call mit LLM ist klar AI-System nach Art. 3 (1) |
| **Risk-Class** | **Limited Risk** — KI-generierter Text in Mail. Transparenz-Pflicht: Empfänger muss erkennen können, dass es maschinell-personalisierte Kommunikation ist (Art. 50 AI-Act) |
| **High-Risk?** | Nein (kein Annex-III-Anwendungsfall: keine Bonität, kein Recruiting-Score, keine Strafverfolgung) |
| **Prohibited?** | Nein (kein Social-Scoring, kein Manipulations-Verbot — solange Hook nicht manipulativ ist) |

**Customer-Action für AI-Act-Compliance:**
- In Datenschutzerklärung Hinweis aufnehmen: "Wir nutzen KI-gestützte Personalisierung für unsere Outreach-Kommunikation."
- Optional (aber empfohlen): in Mail-Footer kleiner Hinweis "Diese Nachricht wurde mit KI-Unterstützung personalisiert."
- KEINE manipulativen Hook-Patterns (false-urgency, fake-personal-connection)

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung des Customers aktualisiert (Cold-Outreach-Hinweis + KI-Hinweis + Vendor-Liste)
- [ ] § 7 UWG 7-Punkt-Check pro Kampagne dokumentiert
- [ ] Mail-Footer mit vollständigem Impressum + Opt-Out-Link in allen 3 Mail-Templates
- [ ] Opt-Out-Webhook funktionsfähig + getestet (Test-Klick → Adresse landet auf Blocklist)
- [ ] Blocklist-Check-Node vor jedem Send-Step eingebaut (Pflicht-Erweiterung)
- [ ] Vendor-DPAs gegengezeichnet und in Verzeichnis (Art. 30)
- [ ] Drittland-Transfer (OpenRouter, ggf. Apollo, Postmark) in DS-Erklärung erwähnt
- [ ] SCCs bei US-Vendors bestätigt
- [ ] EU-Hosting bei n8n + Mail-Provider gewählt
- [ ] OpenRouter-EU-Routing (Claude/Mistral-EU) konfiguriert ODER Customer-Hinweis dokumentiert
- [ ] Löschfristen-Cron eingerichtet (90d Cold-Cleanup)
- [ ] Blocklist-3-Jahre-Retention dokumentiert
- [ ] n8n-Execution-Log auf 30d retention
- [ ] Liste-Verifier-Lauf vor jeder Kampagne (NeverBounce / ZeroBounce)
- [ ] Test-Run: Opt-Out → Bestätigungsmail → Adresse in Blocklist → Re-Send-Versuch → blocked
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar (inkl. § 7 UWG explizit)
- [x] B2C-Verbot explizit dokumentiert
- [x] Pflicht-Konfiguration (Footer + Opt-Out) dokumentiert
- [x] Vendor-DPA-Übersicht erstellt (11 Vendors)
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen-Empfehlung (inkl. 3-Jahre-Blocklist)
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung (Limited Risk)
- [x] Audit-Checkliste vor Go-Live (16 Punkte)
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln + § 7 UWG-Sachzusammenhangs-Prüfung — Customer-Action, nicht Blueprint-Block
- [ ] Blocklist-Check-Node als Default in workflow.json — Phase 2 (aktuell Customer-Erweiterungs-Pflicht)
