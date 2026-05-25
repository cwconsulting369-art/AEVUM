# Lead-Qualifier Pro — DSGVO-Konformitäts-Check

**Blueprint:** lead-qualifier-pro
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei DSGVO-kritischen Branchen (Health/Finance) zusätzlich Anwalt konsultieren.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Vorname + Nachname | Stammdaten (Art. 4 Nr. 1 DSGVO) | n8n-Execution-Log + CRM | n8n: <30d; CRM: nach Customer-Policy |
| E-Mail | Kommunikation | n8n + CRM + E-Mail-Provider | siehe oben |
| Firma | Berufliche Daten | n8n + CRM | siehe oben |
| Nachricht | Freitextfeld (kann Sensibles enthalten!) | n8n-Log + CRM | <30d in Log, langfristig in CRM nur wenn nötig |
| Budget/Timing/Größe/Branche/Rolle | Profilbildung | CRM | für Lead-Lifecycle |
| Quelle (Source) | Tracking | CRM + ggf. Analytics | nach Customer-Policy |

**Potential für besondere Kategorien (Art. 9 DSGVO):** Freitextfeld "Nachricht" kann ungewollt Gesundheits-/politische/religiöse Daten enthalten → Customer muss in Formular-UX warnen, dass diese nicht eingegeben werden sollen.

---

## 2. Rechtsgrundlage

**Welche Rechtsgrundlage trägt die Verarbeitung?**

| Kontext | Grundlage |
|---|---|
| Lead reicht Formular ein | **Art. 6 (1) lit. a** — Einwilligung (Pflicht: explicit Opt-In) **+** **lit. b** — Anbahnung vorvertraglicher Maßnahmen |
| Scoring + Routing | **Art. 6 (1) lit. f** — berechtigtes Interesse (effiziente Lead-Bearbeitung) |
| Hot-Lead-Telegram-Alert (intern) | **Art. 6 (1) lit. f** — internes Tooling |
| E-Mail-Bestätigung an Lead | **Art. 6 (1) lit. b** — vorvertraglich |
| Cold-Lead-Nurture-Mail (Marketing) | **Art. 6 (1) lit. a** — separate Einwilligung erforderlich |

**Wichtig:** Cold-Nurture braucht **separate Marketing-Einwilligung** (Doppel-Opt-In empfohlen). Anbahnungs-Mails sind OK auch ohne, Werbe-Mails brauchen Opt-In.

---

## 3. Pflicht-Konfiguration im Formular

### A) Datenschutz-Checkbox
Pflicht. Muss **unausgefüllt** sein (kein Pre-Check).

**Text-Vorschlag:**
> ☐ Ich stimme der Verarbeitung meiner Daten gemäß [Datenschutzerklärung] zur Bearbeitung meiner Anfrage zu. (Pflicht)

### B) Marketing-Checkbox (optional, für Cold-Nurture)
Falls Customer Cold-Leads in Newsletter packen will:

> ☐ Ich möchte zusätzlich gelegentlich relevante Inhalte zu [Thema] erhalten. (jederzeit widerrufbar)

### C) Link zur Datenschutzerklärung
Pflicht. Im Formular sichtbar verlinkt.

### D) Information über Datentransfer in Drittländer
Falls Customer US-Tools nutzt (Notion, HubSpot, etc.) → Hinweis in DS-Erklärung Pflicht.

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — (kein DPA nötig, eigener Server) | 🟢 LOW wenn EU-Server |
| **Airtable** | CRM | ❌ US (Sub-Processor) | airtable.com/legal/dpa | 🟡 MEDIUM (SCC nötig) |
| **HubSpot** | CRM | ❌ US (EU-Datacenters für Enterprise) | legal.hubspot.com/dpa | 🟡 MEDIUM |
| **Notion** | CRM (alternative) | ❌ US | notion.so/help/data-protection | 🟡 MEDIUM |
| **Resend** | E-Mail-Versand | ✅ EU-Region | resend.com/legal/dpa | 🟢 LOW |
| **Mailchimp** | E-Mail-Versand (alternative) | ❌ US (Sub-Processor) | mailchimp.com/legal/data-processing-addendum | 🟡 MEDIUM |
| **Telegram** | Alert-Channel (intern) | Mixed | core.telegram.org/api/terms | 🟡 MEDIUM (Hinweis: nicht für PII von Leads, nur intern für Customer-Team) |
| **Typeform** | Formular | ✅ EU-Option (Pro) | typeform.com/legal/dpa | 🟡 MEDIUM (Free: US) |
| **Tally** | Formular | ✅ EU | tally.so/help/dpa | 🟢 LOW |

**Customer-Action:** Vor Go-Live alle aktiv genutzten Vendors als Auftragsverarbeiter in Verzeichnis aufnehmen (Art. 30 DSGVO).

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | CRM-Filter "Email = X" → Export → an Betroffenen senden (Customer-Prozess) |
| **Berichtigung** (Art. 16) | CRM-Record direkt editieren (Customer-Prozess) |
| **Löschung** (Art. 17) | Airtable/HubSpot: Record löschen. n8n-Execution-Log: Auto-Cleanup <30d. |
| **Einschränkung** (Art. 18) | CRM-Status auf "DSGVO-Hold" + kein weiteres Processing |
| **Datenübertragbarkeit** (Art. 20) | JSON-Export aus CRM |
| **Widerspruch** (Art. 21) | Marketing-Opt-Out-Link in jeder Cold-Nurture-Mail (Pflicht) |
| **Automatisierte Einzelentscheidung** (Art. 22) | ⚠️ Score-basiertes Routing ist **keine** Einzelentscheidung im Sinne Art. 22 weil kein rechtlicher Effekt — aber **DS-Erklärung muss Scoring transparent erklären**. |

---

## 6. Löschfristen-Logik

| Lead-Status | Aufbewahrung | Grund |
|---|---|---|
| Cold-Lead (Score <40), kein Marketing-Opt-In | 90 Tage | Anbahnung gescheitert, danach keine Rechtsgrundlage |
| Warm-Lead, kein aktiver Kontakt | 12 Monate | Vertriebs-Lifecycle |
| Hot-Lead, in Sales-Pipeline | bis Deal-Close oder -Drop | berechtigtes Interesse |
| Kunde geworden | gesetzliche Aufbewahrung (Steuer: 6/10 Jahre) | HGB / AO |
| n8n-Execution-Log | 30 Tage | Operational |

**Implementation:** Customer richtet Cron in CRM ein (Airtable-Automations / HubSpot-Workflows) für Auto-Delete.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Nein**, wenn:
- Keine besonderen Kategorien (Health/etc.) erhoben werden
- Score-Routing kein rechtlicher Effekt (was hier der Fall ist)
- Volumen <100k Leads/Jahr (sonst Skalierungs-DSFA empfohlen)

→ **Ja**, wenn Customer:
- Health-Sektor / Finanz-Sektor
- AI-basierte Profilbildung über Score hinaus (z.B. Voice-Analyse)
- Skoring + AI-Decision auf besonders sensibler Branchenbasis

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Lead-Qualifier Pro |
|---|---|
| **AI-System nach EU-AI-Act?** | Grenzfall — JS-Scoring ohne LLM ist **kein** AI-System nach Art. 3 (1). Wenn Customer später LLM-Layer dazwischen schaltet → wird AI-System. |
| **Risk-Class** (falls AI-System) | **Limited Risk** — Transparenzpflicht (Customer muss Lead informieren, dass Score automatisch berechnet wird) |
| **High-Risk?** | Nein (keine Beschäftigungs-/Bonitäts-Entscheidung im Sinne Annex III) |

**Customer-Action:** In Datenschutzerklärung Scoring-Transparenz aufnehmen ("Wir verwenden ein automatisches Scoring-System zur Priorisierung von Anfragen").

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung des Customers aktualisiert (Scoring-Hinweis + Vendor-Liste)
- [ ] Datenschutz-Checkbox im Formular Pflicht, unausgefüllt
- [ ] Doppel-Opt-In für Cold-Nurture eingerichtet (wenn genutzt)
- [ ] Vendor-DPAs gegengezeichnet und in Verzeichnis (Art. 30)
- [ ] Auftragsverarbeiter-Liste in DS-Erklärung erwähnt
- [ ] EU-Hosting bei n8n + Form-Tool + Mail-Provider gewählt
- [ ] Löschfristen im CRM als Automation konfiguriert
- [ ] n8n-Execution-Log auf 30d retention
- [ ] Test-Anfrage durchgelaufen: Auskunft → Export → Löschung
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar
- [x] Pflicht-Konfiguration im Formular dokumentiert
- [x] Vendor-DPA-Übersicht erstellt
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung
- [x] Audit-Checkliste vor Go-Live
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln — Customer-Action, nicht Blueprint-Block
