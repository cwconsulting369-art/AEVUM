# Proposal-Generator — DSGVO-Konformitäts-Check

**Blueprint:** proposal-generator
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei Unsicherheit Anwalt konsultieren.

---

## 0. Kontext-Einordnung

Der Proposal-Generator verarbeitet **B2B-Geschäftsdaten** im Rahmen einer **angebahnten oder bestehenden Geschäftsbeziehung** (der Kunde hatte einen Discovery-Call / hat ein Angebot angefragt). Das ist datenschutzrechtlich deutlich entspannter als Cold-Outreach: es liegt typischerweise (vor-)vertraglicher Kontakt vor. Trotzdem gelten DSGVO-Pflichten, weil personenbezogene Daten (Ansprechpartner-Name, -Mail) + ggf. sensible Geschäftsdetails verarbeitet und an Auftragsverarbeiter (LLM, PDF, CRM) übermittelt werden.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Ansprechpartner Name | Stammdaten (Art. 4 Nr. 1) | n8n-Execution-Log + Discovery-Quelle + CRM + LLM-Prompt | n8n: <30d; CRM: Customer-Policy; Anthropic: laut Settings |
| Geschäfts-E-Mail | Kommunikationsdatum (B2B) | n8n + Mail-Provider + CRM | n8n <30d; Provider 6-12 Mo |
| Firma | berufliche Daten (B2B) | n8n + Anthropic + PDF-API + CRM | wie oben |
| Discovery-Notizen (Freitext) | **kann Sensibles enthalten** (Geschäftsgeheimnisse, ggf. personenbezogene Details) | n8n + Anthropic (Prompt) | n8n <30d; Anthropic laut Retention-Setting |
| Generiertes Angebot (HTML/PDF) | abgeleiteter Output + Preise | n8n + PDF-API + Mail | n8n <30d; PDF-Provider provider-spezifisch |
| Angebots-Metadaten (Betrag, Scope, Status) | Geschäftsdaten | CRM/Sheet | Customer-Policy (Aufbewahrungspflicht §147 AO ggf. relevant) |

**Potential für besondere Kategorien (Art. 9):** Discovery-Notizen sind Freitext. Customer darf KEINE Gesundheits-/politischen/religiösen Daten über Personen eintragen. Hinweis im Intake-Formular Pflicht.

**Datenfluss-Kette:**
```
Discovery-Quelle → n8n-Webhook → [Code: normalisieren] → Anthropic (Strukturierung)
  → [Code: Pricing, lokal] → [Code: HTML, lokal] → PDF-API → CRM-Log
  → Mail (intern ODER Kunde)
```
LLM-Berührung: nur bei der **Strukturierung**. Pricing + HTML-Rendering passieren **lokal in n8n** (keine PII verlässt n8n dafür).

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Verarbeitung der Discovery-Daten zur Angebots-Erstellung | **Art. 6 (1) lit. b DSGVO** — vorvertragliche Maßnahme auf Anfrage des Betroffenen (Angebot wurde gewünscht) |
| Alternativ / ergänzend (Geschäftsanbahnung) | **Art. 6 (1) lit. f DSGVO** — berechtigtes Interesse |
| KI-Strukturierung via Anthropic | **Art. 6 (1) lit. b/f** + **Art. 28 DSGVO** (Auftragsverarbeitung) |
| PDF-Generierung via Dienst | **Art. 28 DSGVO** (Auftragsverarbeitung) |
| CRM-Log / Aufbewahrung | **Art. 6 (1) lit. b/f** + ggf. **Art. 6 (1) lit. c** (handels-/steuerrechtliche Aufbewahrung) |

**Wichtig:** Da hier eine (vor-)vertragliche Beziehung besteht (lit. b), ist die Grundlage tragfähiger als bei Cold-Outreach. Trotzdem: Auftragsverarbeiter brauchen DPAs.

---

## 3. Pflicht-Konfiguration im Workflow + Angebot

### A) Angebots-Footer (Pflicht)

Jedes Angebot muss enthalten (im Render-Code bereits strukturiert, Customer füllt die Config-Werte):
```
[vendorName]
[vendorCompany inkl. Rechtsform]
[vendorAddress — vollständige Anschrift]
[vendorEmail]
```
Bei Kleinunternehmer-Status: korrekter §19-UStG-Hinweis (im Default-`vatNote` enthalten, prüfen/anpassen).

### B) KI-Transparenz-Hinweis (EU-AI-Act + Art. 13)

Im Angebots-Template ist ein Hinweis enthalten ("KI-gestützt aus Discovery-Notizen erstellt und vor Versand geprüft"). Customer kann anpassen, sollte ihn aber **nicht entfernen** (Transparenz-Pflicht).

### C) Korrekte Empfänger-Adresse

`clientEmail` wird validiert; Default-Review-Gate verhindert Versand an Falsche. Customer prüft Empfänger in der Review-Mail.

### D) Daten-Minimierung im Prompt

Nur nötige Felder an Anthropic. Keine internen Bonitäts-/Risiko-Notizen in `notes`.

---

## 4. Vendor-DPA-Übersicht

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — | 🟢 LOW wenn EU-Server |
| **Anthropic** | KI-Strukturierung | ❌ US | anthropic.com/legal/commercial-terms (DPA verfügbar) | 🟠 HIGH (PII-Transfer Drittland, SCC + Zero-Retention prüfen) |
| **PDFShift / html2pdf.app** | PDF-Render | überwiegend US | provider-spezifisch | 🟡 MEDIUM (Angebots-Inhalt-Transfer; DPA + SCC nötig) |
| **Gotenberg (self-host)** | PDF-Render | Customer's Choice | — | 🟢 LOW wenn EU-Server (empfohlene Variante) |
| **Resend** | Mail-Versand | ✅ EU verfügbar | resend.com/legal/dpa | 🟢 LOW |
| **Postmark** | Mail-Versand | ❌ US (mit SCC) | postmarkapp.com/eu-privacy | 🟡 MEDIUM |
| **Mailgun** | Mail-Versand | ✅ EU wählbar | mailgun.com/dpa | 🟢 LOW wenn EU |
| **Airtable** | CRM-Log | ❌ US | airtable.com/dpa | 🟡 MEDIUM |
| **Supabase** | CRM-Log (alternative) | ✅ EU-Region wählbar | supabase.com/legal/dpa | 🟢 LOW wenn EU |
| **Cloudflare** | Webhook-Schutz | Mixed | cloudflare.com/cloudflare-customer-dpa | 🟢 LOW |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors als Auftragsverarbeiter ins Verzeichnis (Art. 30)
2. SCCs bei US-Vendors prüfen
3. In DS-Erklärung Vendor-Liste + Drittland-Transfer + KI-Nutzung erwähnen
4. **Empfehlung:** PDF self-host (Gotenberg) + CRM Supabase-EU → reduziert Drittland-Transfer auf nur Anthropic

---

## 5. Betroffenenrechte (Art. 15–22)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: CRM + Discovery-Quelle nach E-Mail durchsuchen, Daten exportieren, binnen 30 Tagen |
| **Berichtigung** (Art. 16) | In Discovery-Quelle/CRM korrigieren, Workflow neu durchlaufen für aktualisiertes Angebot |
| **Löschung** (Art. 17) | n8n-Log Auto-Cleanup 30d; CRM/Discovery-Quelle Customer-Pflicht — ABER: Handels-/Steuer-Aufbewahrung (§147 AO, §257 HGB) kann Angebots-Aufbewahrung erfordern |
| **Einschränkung** (Art. 18) | CRM-Status "Hold", kein weiteres Processing |
| **Datenübertragbarkeit** (Art. 20) | Export aus CRM/Discovery-Quelle |
| **Widerspruch** (Art. 21) | Bei lit.-f-Verarbeitung: Stopp der Angebots-Verarbeitung für diese Person |
| **Automatisierte Einzelentscheidung** (Art. 22) | **Nicht einschlägig** — KI strukturiert nur, Pricing ist regelbasiert, Mensch gibt frei (kein automatisierter rechtlicher Effekt). Transparenz-Hinweis trotzdem Pflicht (Art. 13). |

---

## 6. Löschfristen-Logik

| Status | Aufbewahrung | Grund |
|---|---|---|
| Discovery-Input nach Angebots-Erstellung | bis Angebot versendet/verworfen | Verarbeitungs-Notwendigkeit |
| Angebot angenommen → wird Vertrag | nach Handels-/Steuerrecht (6-10 Jahre, §147 AO / §257 HGB) | gesetzliche Aufbewahrung |
| Angebot abgelehnt / verfallen | nach Customer-CRM-Policy, Empfehlung max 12-24 Monate | berechtigtes Interesse / Nachweis |
| n8n-Execution-Log | 30 Tage | Operational |
| Anthropic-Prompt-Logs | Zero-Retention aktivieren wo verfügbar | Daten-Minimierung |
| PDF-Provider-Logs | provider-spezifisch | via DPA steuern |

**Implementation:** Customer richtet CRM-Cleanup-Policy ein; bei angenommenen Angeboten gesetzliche Frist beachten (NICHT vorzeitig löschen).

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

→ **In der Regel NICHT erforderlich:**
- B2B-Angebots-Erstellung in (vor-)vertraglichem Kontext, kein systematisches Profiling, kein hohes Risiko
- **ABER DSFA empfohlen wenn:** Discovery-Notizen regelmäßig sensible/besondere Kategorien enthalten, oder bei sehr hohem Volumen, oder in regulierten Branchen (Healthcare/Finance) → Anwalt.

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Proposal-Generator |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — Anthropic-LLM-Call ist AI-System nach Art. 3 (1) |
| **Risk-Class** | **Limited Risk** — KI strukturiert Text; kein High-Risk-Annex-III-Fall (keine Bonität, kein Recruiting, keine Strafverfolgung). Pricing ist regelbasiert (kein KI-Scoring) |
| **High-Risk?** | Nein |
| **Prohibited?** | Nein (kein Social-Scoring, keine Manipulation) |
| **Transparenz-Pflicht (Art. 50)?** | Anwendbar wenn der KI-erstellte Text als solcher erkennbar sein soll → Hinweis im Angebot enthalten |

**Customer-Action:**
- DS-Erklärung: "Wir nutzen KI-gestützte Strukturierung bei der Angebots-Erstellung."
- KI-Hinweis im Angebots-Footer nicht entfernen
- Da Mensch final freigibt: keine automatisierte Einzelentscheidung i.S.v. Art. 22

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung aktualisiert (KI-Hinweis + Vendor-Liste + Drittland-Transfer)
- [ ] Vendor-DPAs gegengezeichnet + in Verzeichnis (Art. 30)
- [ ] SCCs bei US-Vendors (Anthropic, ggf. PDF/CRM/Mail) bestätigt
- [ ] Anthropic Zero-Retention/EU geprüft + aktiviert wo verfügbar
- [ ] PDF-Provider DSGVO-konform (EU-Provider mit DPA ODER Gotenberg self-host)
- [ ] CRM EU-Storage (Supabase-EU empfohlen) ODER US mit SCC + DPA
- [ ] EU-Hosting bei n8n + Mail-Provider
- [ ] Angebots-Footer mit vollständigem Impressum + korrektem §19/USt-Hinweis
- [ ] KI-Transparenz-Hinweis im Angebot vorhanden
- [ ] Webhook-Intake Token-gesichert (kein offener Endpoint)
- [ ] n8n-Execution-Log auf 30d + Sensitive-Field-Masking (notes/html/email)
- [ ] Discovery-Intake-Formular mit Hinweis "keine besonderen Kategorien eintragen"
- [ ] `sendMode=internal_review` bis Qualität validiert
- [ ] Test-Run: echte Notizen → korrektes Angebot → Review-Mail → kein Fehl-Versand
- [ ] Carlos hat Sign-Off-Dokument

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig (inkl. LLM-Berührungsgrenze)
- [x] Rechtsgrundlagen pro Schritt klar (lit. b vorvertraglich hervorgehoben)
- [x] Pflicht-Konfiguration (Footer + KI-Hinweis + Empfänger-Check) dokumentiert
- [x] Vendor-DPA-Übersicht (11 Vendors) inkl. self-host-Empfehlung
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen inkl. Handels-/Steuer-Aufbewahrung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung (Limited Risk + Art. 22 nicht einschlägig wegen Mensch-Freigabe)
- [x] Audit-Checkliste vor Go-Live (15 Punkte)
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln — Customer-Action, nicht Blueprint-Block
- [ ] PDF self-host als Default in Setup-Empfehlung — Phase 2 (aktuell als Empfehlung dokumentiert)
