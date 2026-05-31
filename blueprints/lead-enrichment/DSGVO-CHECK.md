# Lead-Enrichment — DSGVO-Konformitäts-Check

**Blueprint:** lead-enrichment
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Automatisches Anreichern + KI-Profiling von Lead-Daten ist DSGVO-relevant (Datenminimierung, Drittland-Transfer, EU-AI-Act). Bei Unsicherheit Anwalt / Datenschutzbeauftragten konsultieren.

---

## 0. Kategorischer Vorbehalt

**B2B-Lead-Anreicherung, nicht B2C-Profiling.** Dieses Blueprint ist für die Anreicherung von Geschäfts-Leads (Firma + Domain + Geschäfts-Kontakt) gemacht. Das Anreichern privater Personendaten ohne Rechtsgrundlage ist unzulässig. Der eingebaute Freemail-Filter (gmail/gmx/web.de etc. werden in den Fehler-Pfad geschickt) reduziert das Risiko, versehentlich Privatpersonen zu profilen — ersetzt aber keine Rechtsgrundlagen-Prüfung durch den Customer.

**Keine besonderen Kategorien (Art. 9).** Es dürfen keine Gesundheits-, politischen, religiösen oder vergleichbaren Daten angereichert werden. ICP-Felder beschränken sich auf firmografische + öffentliche berufliche Daten.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Name des Lead-Kontakts | Stammdaten (Art. 4 Nr. 1) | n8n-Execution-Log + Webhook-Quelle + LLM-Prompt + CRM | n8n: <30d; CRM: Customer-Policy |
| Geschäfts-E-Mail | Kommunikationsdatum (B2B) | n8n + CRM (Anthropic NUR wenn im Prompt — aktuell NICHT, Mail wird nicht an LLM gegeben) | n8n <30d; CRM Policy |
| Domain / Firma | Berufliche/firmografische Daten | n8n + Enrichment-API + LLM-Prompt + CRM | wie oben |
| Angereicherte Firmografie (Branche, Größe, Umsatz, Standort, Tech-Stack) | abgeleitete Geschäftsdaten | Enrichment-API → n8n → LLM → CRM | wie oben |
| Socials (LinkedIn/Twitter/Facebook-URLs) | öffentliche berufliche Profil-Links | Socials-API → n8n → CRM | wie oben |
| ICP-Score + Tier + Begründungen | KI-abgeleitete Bewertung (Profiling) | LLM-Output → n8n → CRM | wie n8n / CRM |
| Hot-Lead-/Fehler-Alert-Mail | enthält Lead-PII | SMTP-Provider + Empfänger-Postfach | Postfach-Policy |

**Hinweis Datenminimierung:** Der Code-Node baut bewusst ein flaches, ICP-relevantes Profil. Customer darf die Enrichment-Felder NICHT „weil's geht" aufblähen (z.B. private Social-Media-Aktivität, persönliche Interessen) — Zweckbindung auf Lead-Qualifizierung.

**LLM-Eingabe-Minimierung:** Der Scoring-Prompt gibt bewusst nur firmografische Felder + Firmenname an Claude, NICHT die E-Mail des Kontakts. Customer sollte das beim Anpassen des Prompts beibehalten.

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Empfang + Speicherung des B2B-Leads | **Art. 6 (1) lit. f DSGVO** — berechtigtes Interesse (Geschäftsanbahnung / Vertriebsvorbereitung) |
| Anreicherung mit firmografischen + öffentlichen beruflichen Daten | **Art. 6 (1) lit. f** — berechtigtes Interesse, sofern verhältnismäßig + zweckgebunden (Lead-Qualifizierung) |
| KI-ICP-Scoring (Profiling-Light) | **Art. 6 (1) lit. f** + **Transparenzpflicht Art. 13/14** (Hinweis auf automatisierte Verarbeitung) |
| Datenverarbeitung durch Enrichment-Provider | **Art. 28 DSGVO** (Auftragsverarbeitung) — DPA Pflicht |
| Speicherung im CRM | **Art. 6 (1) lit. f** im Vertriebs-Lifecycle |

### Interessenabwägung (Pflicht bei Art. 6 lit. f)

Der Customer MUSS eine dokumentierte Interessenabwägung führen:
1. **Berechtigtes Interesse:** Vertriebsvorbereitung, effiziente Lead-Priorisierung — anerkannt (ErwGr. 47).
2. **Erforderlichkeit:** Anreicherung nur mit Daten, die für die ICP-Bewertung nötig sind (keine Über-Profilierung).
3. **Abwägung:** Bei B2B-Geschäftsdaten überwiegt i.d.R. das berechtigte Interesse; Betroffenenrechte (Widerspruch, Auskunft, Löschung) bleiben gewahrt.
4. **Dokumentation:** LIA (Legitimate Interest Assessment) schriftlich festhalten.

---

## 3. Pflicht-Konfiguration

### A) Informationspflicht (Art. 14 — Daten nicht beim Betroffenen erhoben)

Da Lead-Daten meist NICHT direkt beim Betroffenen erhoben werden (Formular = Art. 13; Import/Enrichment = Art. 14), muss der Customer:
- In der Datenschutzerklärung die Verarbeitung von Lead-Daten + Anreicherung + KI-Scoring beschreiben
- Quellen der Daten nennen (Formular, Enrichment-Provider)
- Bei Erstkontakt (sofern später Outreach erfolgt) die Informationspflicht erfüllen

### B) Zweckbindung + Datenminimierung im Workflow

- Enrichment NUR auf ICP-relevante Felder beschränken (im Code-Node bereits flach gehalten)
- Keine besonderen Kategorien (Art. 9)
- LLM-Prompt minimal halten (keine Kontakt-E-Mail an Claude)

### C) KI-Transparenz

In der Datenschutzerklärung: „Wir nutzen KI-gestützte Bewertung (ICP-Scoring) zur Priorisierung von Geschäfts-Leads. Diese Bewertung ist unterstützend und ersetzt keine menschliche Entscheidung."

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem aktiv genutzten.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — | 🟢 LOW wenn EU-Server |
| **Anthropic** | KI-ICP-Scoring (Claude) | ❌ US (Datenstandort prüfen) | anthropic.com/legal/commercial-terms / DPA | 🟠 HIGH (PII-Transfer Drittland, SCC + DPA + Hinweis Pflicht) |
| **Firmendaten-API** (TheCompaniesAPI / Abstract / PeopleDataLabs) | Firmografie-Enrichment | meist ❌ US — provider-spezifisch | provider-DPA | 🟠 HIGH (PII + Domain an Dritt-API, DPA + SCC Pflicht) |
| **Socials/Domain-Intel-API** | Socials-Enrichment | provider-spezifisch | provider-DPA | 🟠 HIGH (öffentliche Daten, aber Transfer + DPA Pflicht) |
| **CRM (Airtable / HubSpot / Notion / Sheets)** | Ziel-Sink | provider-/region-spezifisch | provider-DPA | 🟡 MEDIUM (US-Default, EU-Region wo möglich) |
| **SMTP / Mail-Provider** | Alert-Mails (enthalten PII) | provider-spezifisch | provider-DPA | 🟡 MEDIUM |
| **Cloudflare** (optional, Webhook-Schutz) | Rate-Limit/DDoS | Mixed | cloudflare.com/cloudflare-customer-dpa | 🟢 LOW |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors als Auftragsverarbeiter ins Verzeichnis (Art. 30)
2. SCCs bei US-Vendors prüfen (insb. Anthropic + Daten-APIs)
3. Datenschutzerklärung: Provider-Liste + Drittland-Transfer-Hinweis + KI-Hinweis
4. EU-Region wählen wo verfügbar (n8n, CRM)

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: CRM + Webhook-Quelle nach Name/Domain/E-Mail durchsuchen, angereichertes Profil + Score exportieren, binnen 30 Tagen senden |
| **Berichtigung** (Art. 16) | Im CRM korrigieren; Lead erneut durch Workflow für aktualisiertes Profil schicken |
| **Löschung** (Art. 17) | n8n-Execution-Log: Auto-Cleanup ≤30d. CRM: Customer löscht auf Anfrage. Enrichment-Provider-Logs: via DPA |
| **Einschränkung** (Art. 18) | CRM-Status "DSGVO-Hold" → kein weiteres Processing/Scoring |
| **Datenübertragbarkeit** (Art. 20) | CRM-Export (i.d.R. nicht einschlägig bei lit.-f-Verarbeitung, aber technisch möglich) |
| **Widerspruch** (Art. 21) | Bei lit.-f-Verarbeitung Pflicht: auf Widerspruch Lead aus aktiver Verarbeitung nehmen, keine erneute Anreicherung; CRM-Flag setzen |
| **Automatisierte Einzelentscheidung** (Art. 22) | **Wichtig:** ICP-Score ist unterstützendes Profiling, KEINE automatisierte Einzelentscheidung mit Rechtsfolge (Sales entscheidet menschlich). Damit Art. 22 nicht einschlägig — ABER: in DS-Erklärung Transparenz-Hinweis (Art. 13/14) Pflicht. Würde der Score automatisch z.B. Vertragsannahme/-ablehnung auslösen, wäre Art. 22 einschlägig → dann menschliche Letztentscheidung sicherstellen |

---

## 6. Löschfristen-Logik

| Lead-Status | Aufbewahrung | Grund |
|---|---|---|
| Lead in aktiver Bewertung | bis Scoring abgeschlossen + CRM-Eintrag | Verarbeitungs-Notwendigkeit |
| Lead qualifiziert (Tier A/B, in Vertrieb) | nach CRM-/Vertriebs-Policy (max 12 Monate ohne Aktivität) | berechtigtes Interesse |
| Lead disqualifiziert / Tier C-D ohne Aktion | 90 Tage nach Scoring | danach kein berechtigtes Interesse für weitere Speicherung |
| Lead hat widersprochen (Art. 21) | aus aktiver Verarbeitung nehmen; ggf. Suppression-Eintrag (Domain/E-Mail) um erneute Anreicherung zu verhindern | Art. 21 + Datenminimierung |
| n8n-Execution-Log | ≤30 Tage (empfohlen 14d) | Operational |
| Enrichment-Provider-Logs | provider-spezifisch | via DPA steuern |
| Anthropic-Logs | je nach Anthropic-Settings / Zero-Retention-Option prüfen | DPA |

**Implementation:**
- Customer richtet im CRM einen Auto-Delete-Job für Cold/disqualifizierte Leads nach 90d ein
- Suppression-Liste für Widersprüche separat führen
- n8n-Execution-Data-Pruning aktivieren (`EXECUTIONS_DATA_PRUNE=true`, `EXECUTIONS_DATA_MAX_AGE`)

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Grenzfall:**
- Reines B2B-Enrichment ohne besondere Kategorien, moderates Volumen: **i.d.R. Nein**, aber Risiko-Analyse + LIA empfohlen
- **Systematisches, umfangreiches Profiling** (Scoring vieler Personen, große Datentiefe pro Person): **Ja** (Art. 35 Abs. 3 lit. a — Profiling-Trigger)
- Volumen >10k Leads/Jahr mit detaillierten Profilen: **Ja**
- Profiling in regulierten Branchen (Finance/Healthcare-Vertrieb): **Ja** (Anwalt)

**Bei DSFA-Pflicht:** Zweck-Beschreibung, Notwendigkeitsprüfung, Risiko-Matrix (siehe SECURITY-RISKS.md), Mitigation, ggf. Konsultation der Aufsichtsbehörde.

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Lead-Enrichment |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — LLM-basiertes ICP-Scoring ist klar AI-System nach Art. 3 (1) |
| **Risk-Class** | **Limited Risk** — KI bewertet Geschäfts-Leads zur internen Priorisierung. Transparenzpflicht: betroffene Personen + interne Nutzer müssen über KI-Einsatz informiert sein (Art. 50) |
| **High-Risk?** | **Grundsätzlich Nein** — B2B-Lead-Scoring ist kein Annex-III-Fall (kein Recruiting-Score über Personen, keine Bonität, keine Kreditwürdigkeit). **ACHTUNG:** Würde der Score zur Bewertung von Einzelpersonen für Beschäftigung/Kreditwürdigkeit/Versicherung genutzt, kippt es in High-Risk. Strikt auf Firmen-Lead-Qualifizierung beschränken |
| **Prohibited?** | Nein (kein Social-Scoring, keine manipulative Praktik) |

**Customer-Action für AI-Act-Compliance:**
- Datenschutzerklärung: KI-gestützte Lead-Bewertung transparent machen
- Score strikt als interne Vertriebs-Priorisierung nutzen, NICHT als automatische Entscheidung über Personen
- Menschliche Letztkontrolle der Tier-A-Leads sicherstellen
- Keine Bewertung von Einzelpersonen-Eigenschaften jenseits beruflicher/firmografischer Qualifikation

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung aktualisiert (Lead-Verarbeitung + Anreicherung + KI-Scoring + Vendor-Liste + Drittland-Hinweis)
- [ ] LIA (Legitimate Interest Assessment) für Art. 6 lit. f dokumentiert
- [ ] Informationspflicht Art. 13/14 erfüllt (je nach Datenquelle)
- [ ] Enrichment auf ICP-relevante Felder beschränkt (Datenminimierung), keine Art.-9-Daten
- [ ] LLM-Prompt minimal (keine Kontakt-E-Mail an Claude)
- [ ] Vendor-DPAs gegengezeichnet + im Verzeichnis (Art. 30) — insb. Anthropic + Daten-APIs
- [ ] SCCs bei US-Vendors bestätigt
- [ ] EU-Region bei n8n + CRM gewählt wo verfügbar; Anthropic-Datenstandort/Retention geprüft
- [ ] Betroffenenrechte-Prozess definiert (Auskunft/Löschung/Widerspruch)
- [ ] Suppression-Liste für Art.-21-Widersprüche eingerichtet
- [ ] Löschfristen-Job (90d Cold/disqualifiziert) im CRM eingerichtet
- [ ] n8n-Execution-Log ≤30d + Field-Masking
- [ ] Webhook abgesichert (Token + Rate-Limit) — verhindert Fremd-Datenzufuhr
- [ ] DSFA-Bedarf geprüft (Volumen + Profiling-Tiefe)
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar (Art. 6 lit. f + LIA-Pflicht)
- [x] Datenminimierung + Zweckbindung dokumentiert
- [x] LLM-Eingabe-Minimierung benannt
- [x] Vendor-DPA-Übersicht (8 Vendors, 3× HIGH)
- [x] Betroffenenrechte-Implementation skizziert (inkl. Art. 22 Abgrenzung)
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt (Profiling)
- [x] EU-AI-Act-Einordnung (Limited Risk + High-Risk-Kipp-Warnung)
- [x] Audit-Checkliste vor Go-Live (15 Punkte)
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln + LIA — Customer-Action, nicht Blueprint-Block
- [ ] Webhook-Header-Auth als Default in workflow.json — Phase 2
