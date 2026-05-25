# AEVUM DSGVO-Check — Reporting Dashboard Blueprint

**Blueprint:** `reporting-dashboard-setup`
**Workflow-Typ:** Scheduled Data Aggregation + HTML Mail Dispatch
**Rechtsrahmen:** DSGVO (EU) 2016/679, TTDSG, ePrivacy
**Stand:** 2026
**Hinweis:** Dieses Dokument ist technische Compliance-Orientierung, kein Rechtsgutachten. Bei konkreten Rechtsfragen: Datenschutz-Jurist hinzuziehen.

---

## Datenfluss-Analyse

| # | Daten-Kategorie | Quelle | Verarbeitung in n8n | Ziel | Enthält PII? |
|---|---|---|---|---|---|
| 1 | Aggregierte Web-Metriken (Sessions, Pageviews, Bounce Rate) | GA4 API | HTTP Request → Set Node | HTML-Report | Nein (aggregiert) |
| 2 | Conversion-Daten (Anzahl Leads/Conversions, Rate) | GA4 API | HTTP Request → Set Node | HTML-Report | Nein (aggregiert) |
| 3 | Top-Seiten-Pfade (z.B. `/dienstleistungen`) | GA4 API | HTTP Request → Set Node | HTML-Report | Nein (URL-Pfade, kein User-Bezug) |
| 4 | Ad-Spend, CPL, ROAS | Meta Marketing API | HTTP Request → Set Node | HTML-Report | Nein (Kampagnen-Aggregat) |
| 5 | Manuelle KPIs + Kommentarfeld | Google Sheets | Sheets Node (wenn aktiv) | HTML-Report | Potenziell (wenn Kommentarfeld Namen enthält) |
| 6 | Report-Empfänger E-Mail-Adressen | n8n Config (Set Node / Env-Var) | Set Node → Email Node | SMTP-Versand | Ja (E-Mail-Adressen = PII nach Art. 4 Nr. 1 DSGVO) |
| 7 | Kompletter HTML-Report | n8n intern generiert | Code Node | E-Mail-Versand + n8n Execution Log | Indirekt (enthält Business-KPIs, keine User-PII wenn korrekt konfiguriert) |
| 8 | n8n Execution-Logs (Input/Output aller Nodes) | n8n intern | Automatisch gespeichert | n8n-Datenbank | Ja (enthält E-Mail-Adressen aus Node #6) |

**Fazit Datenfluss:** Bei korrekter GA4-Konfiguration (keine Custom Dimensions mit User-IDs) enthält dieser Workflow **keine personenbezogenen Daten von Endnutzern/Website-Besuchern**. Die einzigen PII sind die **Empfänger-E-Mail-Adressen** (interne Mitarbeiter des Customers).

---

## Rechtsgrundlage

| Verarbeitungsvorgang | Rechtsgrundlage | Begründung |
|---|---|---|
| Abruf aggregierter GA4-Metriken | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) | Keine personenbezogenen Daten der Besucher — aggregierte Statistiken. GA4-Tracking selbst erfordert separate Einwilligung (außerhalb dieses Workflows). |
| Abruf Meta Ads Kampagnen-Daten | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) | Kampagnen-Aggregatdaten ohne User-Bezug |
| E-Mail-Versand an interne Mitarbeiter | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / berechtigtes Interesse im Beschäftigungsverhältnis) | Interne operative Kommunikation |
| Speicherung Empfänger-E-Mails in n8n Execution Log | Art. 6 Abs. 1 lit. f DSGVO | Technisch notwendige Logging-Funktion; auf Minimum zu beschränken |

**Wichtiger Hinweis:** Dieses Blueprint verarbeitet **keine** Endnutzer-PII direkt. GA4-Tracking (Cookie-Setzung, IP-Verarbeitung) läuft auf der Website des Customers — das ist ein **separater Verarbeitungsvorgang** mit separater Rechtsgrundlage (idR. Einwilligung nach § 25 TTDSG + Art. 6 Abs. 1 lit. a DSGVO). Dieser Workflow betrifft nur den nachgelagerten Datenabruf aggregierter Statistiken.

---

## Pflicht-Konfiguration (DSGVO)

1. **GA4: Keine User-Level-Daten im API-Request** — Property auf Aggregat-Reports beschränken. Keine `userPseudoId`, keine Custom Dimensions mit personenbezogenem Inhalt in der API-Anfrage.

2. **Google Sheets Kommentarfeld:** Wenn das Freitextfeld Namen oder andere PII enthalten kann — Verarbeitungsverzeichnis (Art. 30 DSGVO) entsprechend erweitern und Zugriffsrechte einschränken.

3. **E-Mail-Empfänger:** Nur interne Mitarbeiter-Adressen. Keine externen Empfänger ohne explizite Rechtsgrundlage. Wenn Kunden-Reports → separate DSGVO-Prüfung notwendig.

4. **n8n Execution-Log Pruning:** Pflicht-Setting:
   ```bash
   EXECUTIONS_DATA_PRUNE=true
   EXECUTIONS_DATA_MAX_AGE=7
   ```
   Begründung: Execution-Logs enthalten E-Mail-Adressen der Empfänger — Speicherung über das technisch notwendige Maß hinaus ist ohne Rechtsgrundlage.

5. **Datenverarbeitungsverzeichnis (Art. 30 DSGVO):** Eintrag anlegen:
   - Zweck: Internes Marketing-Reporting
   - Kategorien personenbezogener Daten: E-Mail-Adressen Mitarbeiter
   - Empfänger: Google (GA4, Sheets), Meta, SMTP-Dienstleister
   - Löschfrist: 7 Tage (Execution Logs)

---

## Vendor-DPA-Übersicht

| Vendor | Dienst | EU-Hosting verfügbar | DPA vorhanden | DPA-Link | SCCs erforderlich? |
|---|---|---|---|---|---|
| Google (GA4) | Web-Analytics API | Ja (EU-Rechenzentren wählbar) | Ja | [Google Cloud DPA](https://cloud.google.com/terms/data-processing-addendum) | Nein (Angemessenheitsbeschluss USA ausgelaufen → SCCs in Google DPA enthalten) |
| Google (Sheets) | Manuelle KPI-Eingabe | Ja | Ja (gleiche DPA wie GA4) | [Google Workspace DPA](https://workspace.google.com/intl/de/terms/dpa_terms.html) | Nein (SCCs in DPA enthalten) |
| Meta Platforms | Ads API | Nein (US-Server) | Ja | [Meta Business Terms / DPA](https://www.facebook.com/legal/terms/businesstools_dataprocessing_terms) | Ja (in Meta DPA enthalten, prüfen) |
| n8n (self-hosted) | Workflow-Engine | Beim Customer / eigenem Server | Entfällt (eigene Infrastruktur) | — | — |
| n8n Cloud | Workflow-Engine | EU-Region wählbar (Frankfurt) | Ja | [n8n DPA](https://n8n.io/legal/data-processing-agreement) | Nein bei EU-Region |
| Resend.com | E-Mail-Versand | US-basiert (Stand 2026) | Ja | [Resend DPA](https://resend.com/legal/dpa) | Prüfen — SCCs vorhanden |
| Eigener SMTP | E-Mail-Versand | Customer-seitig | Entfällt | — | — |

**Empfehlung:** Für maximale DSGVO-Compliance: n8n self-hosted auf eigenem EU-Server + eigener SMTP-Server oder Resend mit SCC-geprüftem DPA.

---

## Betroffenenrechte

**Betroffene Personen in diesem Workflow:** Ausschließlich interne Mitarbeiter des Customers (als Report-Empfänger).

| Recht | Relevanz | Umsetzung |
|---|---|---|
| Auskunft (Art. 15) | Gering — nur eigene E-Mail-Adresse in Config | Auf Anfrage: Workflow-Config zeigen |
| Löschung (Art. 17) | Relevant für Execution Logs | Automatic Pruning deckt dies ab; manuelle Löschung in n8n > Executions möglich |
| Einschränkung (Art. 18) | Theoretisch | Empfänger aus Array entfernen |
| Widerspruch (Art. 21) | Bei Art. 6 lit. f: möglich | Empfänger-Adresse aus Config entfernen |

Website-Besucher (GA4-getrackte Nutzer) sind **nicht Betroffene dieses Workflows** — deren Rechte betreffen das GA4-Tracking selbst, nicht diesen Reporting-Workflow.

---

## Löschfristen

| Datenkategorie | Speicherort | Löschfrist | Technische Umsetzung |
|---|---|---|---|
| Empfänger-E-Mails (in Execution Log) | n8n Datenbank | 7 Tage | `EXECUTIONS_DATA_MAX_AGE=7` |
| GA4-Report-Daten (in Execution Log) | n8n Datenbank | 7 Tage | Gleiche Einstellung |
| Google Sheets manuelle KPIs | Google Drive | Nach Ablauf des Geschäftsjahres oder auf Anfrage | Customer-seitig in Sheet-Verwaltung |
| Versendete E-Mails (beim Empfänger) | Mail-Client des Empfängers | Unternehmens-E-Mail-Policy | Customer-seitige Mail-Retention-Policy |
| Meta Ads Daten | Meta-Server | Meta-Datenaufbewahrungsregeln | Meta Business Manager |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung Art. 35 DSGVO)

**Ist eine DSFA für diesen Workflow erforderlich?**

**In der Standardkonfiguration: Nein.**

Begründung: Keine systematische Verarbeitung von Sonderkategorien (Art. 9), keine Profilerstellung von Endnutzern, keine umfangreiche Verarbeitung von PII. Aggregierte Statistiken.

**DSFA wird erforderlich wenn:**
- GA4 Custom Dimensions mit User-IDs oder demografischen Daten in den Report aufgenommen werden
- Report-Empfänger Daten von externen Personen (Kunden, Interessenten) enthält
- Workflow auf umfangreiche Nutzerdaten-Analyse erweitert wird (z.B. Heatmap-Daten, Session Recordings)
- Multi-Client-Reporting mit Daten Dritter

---

## EU AI Act Einordnung

**Kein LLM-Call in diesem Workflow vorhanden.**

Dieser Blueprint verwendet ausschließlich regelbasierte Datenverarbeitung (HTTP Requests, Set Nodes, Code Node mit statischer JavaScript-Logik). Kein Einsatz von KI-Modellen, keine automatisierten Entscheidungen mit Rechtswirkung.

**Einordnung: Außerhalb des EU AI Act Anwendungsbereichs.**

Wenn zukünftig ein LLM-Node für automatische Report-Kommentare ergänzt wird (möglicher Upsell): Neu-Bewertung erforderlich. Voraussichtlich **Minimal Risk** (automatischer Kommentar ohne Rechtswirkung) oder **Limited Risk** (wenn Nutzer-facing).

---

## Audit-Checkliste vor Go-Live (DSGVO)

- [ ] GA4-Property: Keine User-Level Custom Dimensions im API-Request
- [ ] n8n Execution Log Pruning: `EXECUTIONS_DATA_MAX_AGE=7` gesetzt
- [ ] Empfänger-Array: Nur interne Mitarbeiter-Adressen
- [ ] Vendor-DPAs abgeschlossen: Google (GA4 + Sheets), Meta (wenn aktiv), Resend (wenn genutzt)
- [ ] Eintrag im Verarbeitungsverzeichnis (Art. 30) angelegt
- [ ] Google Sheets Zugriffsrechte auf "Eingeschränkt" gesetzt
- [ ] SMTP/Resend mit TLS — kein Klardaten-Versand
- [ ] Mitarbeiter informiert (Transparenzpflicht Art. 13/14 wenn nicht ohnehin aus AV-Vertrag abgedeckt)
- [ ] n8n self-hosted: Serverstandort EU dokumentiert
- [ ] Meta Ads: DPA + SCCs geprüft und abgeschlossen (wenn Meta Modul aktiv)

---

## Sign-Off

**Technische DSGVO-Unbedenklichkeit bei Standardkonfiguration:** 🟢 Gegeben, wenn Checkliste vollständig abgehakt.

**Offene Punkte vor produktivem Einsatz:**
1. Vendor-DPAs müssen Customer-seitig aktiv abgeschlossen sein (AEVUM kann Setup unterstützen, Vertragspartner ist Customer)
2. Verarbeitungsverzeichnis-Eintrag liegt beim Customer
3. Bei Agenturen mit Kunden-Reports: Separate DSGVO-Prüfung für jeden Report-Empfänger außerhalb der eigenen Organisation