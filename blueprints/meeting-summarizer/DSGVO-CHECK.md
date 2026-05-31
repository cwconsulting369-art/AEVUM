# Meeting-Summarizer — DSGVO-Konformitäts-Check

**Blueprint:** meeting-summarizer
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Meeting-Transkripte sind hochsensible Daten (oft mit besonderen Kategorien). Bei Unsicherheit Anwalt/Datenschutzbeauftragten konsultieren.

---

## 0. Kategorischer Vorbehalt: Einwilligung zur Aufnahme

**Bevor dieser Workflow überhaupt greift, muss die Aufnahme/Transkription des Calls rechtmäßig sein.**

- In DE/EU ist das **Mitschneiden von Gesprächen ohne Einwilligung aller Teilnehmer unzulässig** (§ 201 StGB Vertraulichkeit des Wortes + DSGVO).
- Fireflies/Zoom müssen so konfiguriert sein, dass **alle Teilnehmer vor Aufnahmebeginn informiert werden und zustimmen** (Recording-Consent-Banner/Ansage).
- Dieser Blueprint verarbeitet nur **bereits rechtmäßig erstellte** Transkripte. Die Consent-Pflicht für die Aufnahme liegt beim Customer und ist Voraussetzung — NICHT durch dieses Blueprint abgedeckt.

---

## 1. Datenfluss-Analyse

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Teilnehmer-Namen + E-Mails | Stammdaten (Art. 4 Nr. 1) | Fireflies/Zoom + n8n-Log + CRM + Mail-Provider | Fireflies/Zoom: account-policy; n8n: <30d; CRM: Customer-Policy |
| Vollständiges Transkript (Freitext, ggf. Art.-9-Daten) | potenziell **besondere Kategorien** (Gesundheit/Religion/Politik wenn im Call erwähnt) | Fireflies/Zoom + n8n-Log (transient) + LLM-Provider | n8n: <14–30d; LLM: provider-policy |
| KI-Summary + Action-Items + Sentiment | abgeleiteter Personenbezug (Owner-Namen) | n8n + CRM + Slack/Teams + Mail | wie CRM |
| Meeting-Metadaten (Titel/Datum/Dauer) | Kontextdaten | n8n + CRM | wie CRM |
| Sentiment-Klassifikation | abgeleitetes Werturteil über Gesprächsverlauf | n8n + CRM | wie CRM |

**Achtung besondere Kategorien (Art. 9 DSGVO):** Ein Transkript kann ungeplant sensible Inhalte enthalten (z.B. „ich war krank", Gewerkschaft, Herkunft). Bei Beratern/Ärzten/Anwälten sind Mandanten-/Patientendaten quasi garantiert enthalten → **dann ist US-LLM-Transfer kritisch** (siehe Punkt 8) und ggf. nur selfhosted-LLM zulässig.

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Verarbeitung der Transkripte zur Protokollierung | **Art. 6 (1) lit. f** — berechtigtes Interesse (interne Dokumentation, Geschäftsabwicklung) oder **lit. b** (Vertragsanbahnung/-erfüllung bei Kunden-Calls) |
| Aufnahme/Transkription selbst (Vorstufe) | **Einwilligung aller Teilnehmer** (Art. 6 (1) lit. a) + § 201 StGB — Voraussetzung, Customer-Pflicht |
| KI-Summary via LLM-Provider | **Art. 6 (1) lit. f** + **Art. 28** (Auftragsverarbeitung) + bei US-Provider **Art. 44 ff.** (Drittland-Transfer, SCC) |
| CRM-/Channel-/Mail-Ablage | gleiche Grundlage wie Verarbeitung; interne Empfänger |
| Besondere Kategorien (falls im Transkript) | **Art. 9** — braucht eigene Grundlage (i.d.R. ausdrückliche Einwilligung); ggf. selfhosted-LLM statt US-Transfer |

**Customer-Pflicht:** Recording-Consent dokumentieren + Zweckbindung (Protokollierung) festhalten + Verarbeitungsverzeichnis (Art. 30) führen.

---

## 3. Pflicht-Konfiguration im Workflow

### A) Empfänger-Kontrolle
- `summaryRecipientEmail` fest auf **internen Verteiler** — niemals dynamisch aus Transkript-Daten generieren.
- Slack/Teams-Channel **restricted/privat** — keine company-wide Channels für Kunden-Call-Inhalte.

### B) Transparenz-Hinweis (im Default in der Mail)
Footer: „Diese Zusammenfassung wurde KI-gestützt aus dem Meeting-Transkript erstellt. Bitte vor verbindlicher Nutzung gegenprüfen." → erfüllt Transparenz + AI-Act-Hinweis.

### C) Minimal-Speicherung
- n8n-Execution-Log-Retention 14–30d, Volltranskripte nicht persistent loggen, Sensitive-Field-Masking für `transcriptText`/`summary`.
- Im CRM nur Summary + Action-Items speichern, nicht das Volltranskript (Link aufs Fireflies/Zoom-Transkript genügt).

### D) Kein Profiling über das Meeting hinaus
Sentiment ist Meeting-bezogen, kein personenbezogenes Scoring von Mitarbeitern/Teilnehmern. Nicht für Leistungsbeurteilung zweckentfremden.

---

## 4. Vendor-DPA-Übersicht

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **Fireflies.ai** | Transkript-Quelle | ❌ US | fireflies.ai/privacy / DPA on request | 🟠 HIGH (sensible Transkripte bei US-Provider) |
| **Zoom** (Alternative) | Transkript-Quelle | EU-Datacenter wählbar (Enterprise) | zoom.us/docs/de-de/privacy | 🟡 MEDIUM |
| **Anthropic** | KI-Summary | ❌ US (no-training-default für API) | anthropic.com/legal/commercial-terms + DPA | 🟠 HIGH (Transkript-PII in Drittland, SCC Pflicht) |
| **OpenRouter** (Alternative) | KI-Summary-Routing | ❌ US (leitet weiter) | openrouter.ai/privacy | 🟠 HIGH (oder EU-Modell wählen → 🟡) |
| **Mistral-EU** (Alternative) | KI-Summary | ✅ EU | mistral.ai/terms | 🟢 LOW |
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer-Choice | — | 🟢 LOW wenn EU-Server |
| **Airtable/HubSpot/Pipedrive** | CRM-Ablage | provider-spezifisch (HubSpot EU-DC verfügbar) | jeweilige DPA | 🟡 MEDIUM (US-Default) |
| **Slack/Microsoft Teams** | Channel-Output | Slack US / Teams EU-Tenant möglich | slack.com/trust/compliance / MS-DPA | 🟡 MEDIUM |
| **Resend/Postmark/SMTP** | Mail-Versand | EU-Region verfügbar | jeweilige DPA | 🟢 LOW wenn EU |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors als Auftragsverarbeiter in Verzeichnis (Art. 30).
2. SCCs bei US-Vendors (Fireflies, Anthropic, ggf. CRM/Slack) prüfen + dokumentieren.
3. In Datenschutzerklärung: KI-Verarbeitung von Meeting-Inhalten + Drittland-Transfer + Vendor-Liste erwähnen.
4. Bei besonderen Kategorien (Recht/Medizin/HR): selfhosted-LLM erwägen statt US-Transfer.

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: CRM + Fireflies/Zoom nach Person durchsuchen, Summaries + Transkript-Referenzen exportieren |
| **Berichtigung** (Art. 16) | Falsche Action-Items/Owner im CRM manuell korrigieren; Re-Run bei aktualisiertem Transkript |
| **Löschung** (Art. 17) | n8n-Log: Auto-Cleanup 14–30d. CRM-Summary + Fireflies/Zoom-Transkript: Customer-Pflicht zur Löschung auf Antrag |
| **Einschränkung** (Art. 18) | Meeting im CRM auf „DSGVO-Hold" → keine Weiterverarbeitung |
| **Datenübertragbarkeit** (Art. 20) | Summary + Transkript als Export aus CRM/Fireflies |
| **Widerspruch** (Art. 21) | Teilnehmer kann Verarbeitung seiner Call-Daten widersprechen → Customer entfernt Summary + stoppt künftige Verarbeitung seiner Calls |
| **Automatisierte Einzelentscheidung** (Art. 22) | Nicht einschlägig — Summary ist Dokumentation, keine rechtliche/erhebliche Entscheidung. Sentiment NICHT für Mitarbeiter-Bewertung nutzen, sonst Art.-22-Relevanz |

---

## 6. Aufbewahrungs-/Löschfristen-Logik

| Datum | Aufbewahrung | Grund |
|---|---|---|
| n8n-Execution-Log (inkl. transient Transkript) | 14–30 Tage | Operational, Minimal-Prinzip |
| CRM-Summary + Action-Items | nach Customer-CRM-Policy (Geschäftsdokumentation, oft 6–10 Jahre bei vertragsrelevanten Calls / HGB) | Dokumentationsinteresse |
| Volltranskript (Fireflies/Zoom) | Customer-Policy, so kurz wie möglich; nach Zweckerfüllung löschen | Datenminimierung |
| LLM-Provider-Logs | provider-policy; bei OpenRouter/Anthropic „no-log/zero-retention" wenn verfügbar aktivieren | Drittland-Minimierung |
| Slack/Teams-Nachricht | Channel-Retention-Policy | — |

**Implementation:** n8n-Retention setzen, CRM-Retention-Policy definieren, Volltranskripte regelmäßig in Fireflies/Zoom bereinigen.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

→ **Eher Ja als Nein:**
- Systematische KI-Verarbeitung potenziell sensibler Gesprächsinhalte in großem Umfang → **DSFA empfohlen**, in regulierten Branchen **Pflicht**.
- Bei besonderen Kategorien (Recht/Medizin/HR-Gespräche): **DSFA + ggf. selfhosted-LLM Pflicht**.
- Reine interne Team-Standups ohne sensible Inhalte + geringes Volumen: Risiko-Analyse genügt meist.

**Bei DSFA-Pflicht:** Zweck, Notwendigkeit, Risiko-Matrix (siehe SECURITY-RISKS.md), Mitigations, ggf. Aufsichtsbehörden-Konsultation.

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Meeting-Summarizer |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — LLM-Call zur Text-Generierung ist klar AI-System (Art. 3 (1)) |
| **Risk-Class** | **Limited Risk** — KI-generierte Zusammenfassung. Transparenz-Pflicht: Empfänger der Summary müssen erkennen, dass sie KI-generiert ist (Art. 50) |
| **High-Risk?** | Nein — solange Sentiment/Summary NICHT für Personalentscheidungen, Bewertung oder Recruiting genutzt wird (sonst Annex-III-Relevanz!) |
| **Prohibited?** | Nein — kein Social-Scoring, keine Emotionserkennung am Arbeitsplatz **solange** Sentiment nicht zur Mitarbeiter-Überwachung zweckentfremdet wird (Emotionserkennung am Arbeitsplatz ist nach AI-Act eingeschränkt!) |

**Customer-Action für AI-Act-Compliance:**
- KI-Hinweis in jeder Summary (im Default in der Mail-Footer).
- Sentiment-Feature **NICHT** zur Bewertung/Überwachung von Mitarbeitern einsetzen — sonst kippt die Einstufung Richtung High-Risk/Prohibited (Emotionserkennung am Arbeitsplatz).
- In DS-Erklärung: „Wir nutzen KI zur Zusammenfassung von Meetings."

---

## 9. Audit-Checkliste vor Go-Live

- [ ] Recording-Consent aller Teilnehmer in Fireflies/Zoom konfiguriert + dokumentiert
- [ ] DS-Erklärung aktualisiert (KI-Meeting-Verarbeitung + Drittland + Vendor-Liste)
- [ ] LLM-Provider-Entscheidung getroffen (US-Anthropic + SCC ODER EU-Modell ODER selfhosted)
- [ ] Bei sensiblen Branchen: selfhosted-LLM oder Mistral-EU statt US-Provider
- [ ] Vendor-DPAs gegengezeichnet + im Verzeichnis (Art. 30)
- [ ] SCCs bei US-Vendors (Fireflies, Anthropic, CRM, Slack) bestätigt
- [ ] EU-Hosting bei n8n gewählt
- [ ] n8n-Log-Retention 14–30d + Sensitive-Field-Masking aktiv
- [ ] CRM speichert keine Volltranskripte (nur Summary + Link)
- [ ] `summaryRecipientEmail` auf internen Verteiler, Channel restricted
- [ ] Sentiment-Feature-Zweckbindung dokumentiert (kein Mitarbeiter-Scoring)
- [ ] KI-Transparenz-Hinweis in Output vorhanden
- [ ] DSFA durchgeführt/geprüft (bei sensiblen Inhalten / Volumen)
- [ ] Test: Betroffenen-Löschantrag durchspielen (CRM + Transkript)
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar (inkl. Recording-Consent als Vorstufe)
- [x] Besondere-Kategorien-Risiko explizit benannt (Art. 9)
- [x] Pflicht-Konfiguration (Empfänger-Kontrolle + Minimal-Speicherung) dokumentiert
- [x] Vendor-DPA-Übersicht erstellt (10 Vendors)
- [x] Betroffenenrechte-Implementation skizziert
- [x] Aufbewahrungs-Empfehlung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung (Limited Risk + Emotionserkennungs-Warnung)
- [x] Audit-Checkliste vor Go-Live (15 Punkte)
- [ ] Anwaltliche Validierung (besonders bei Mandanten-/Patientendaten) — Customer-Action
- [ ] Selfhosted-LLM-Option als Default für sensible Branchen — Phase 2
