# Churn-Radar — DSGVO-Konformitäts-Check

**Blueprint:** churn-radar
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei Unsicherheit Anwalt/Datenschutzbeauftragten konsultieren.

---

## 0. Kontext-Einordnung

**Bestandskunden-Verarbeitung, nicht Cold-Outreach.** Churn-Radar verarbeitet Daten **bestehender, aktiver Kunden** (Vertragsverhältnis liegt vor). Die Rechtsgrundlage ist daher grundsätzlich deutlich komfortabler als bei Kalt-Akquise — Vertragserfüllung + berechtigtes Interesse tragen die meisten Schritte. Die kritischen Punkte sind: **Profiling-Transparenz**, **PII-Transfer an LLM** und der **Charakter der Retention-Mail** (Transaktion vs. Werbung).

---

## 1. Datenfluss-Analyse

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Name + E-Mail | Stammdaten (Art. 4 Nr. 1) | Produktiv-DB + n8n-Execution-Log + Mail-Provider-Logs | DB: Vertragslaufzeit; n8n: 14–30d; Provider: provider-spezifisch |
| Plan + MRR | Vertrags-/Finanzdaten | DB + n8n + (ohne Mail) OpenRouter-Prompt | wie oben |
| Login-/Session-Aktivität | Nutzungs-/Verhaltensdaten | DB (`customer_activity`) + n8n | DB: Customer-Policy; n8n: 14–30d |
| Zahlungsausfälle | Finanz-/Vertragsdaten | DB + n8n | wie oben |
| Offene Support-Tickets | Kommunikationsdaten | DB + n8n | wie oben |
| Feature-Adoption | abgeleitete Nutzungsdaten | DB + n8n | wie oben |
| **Churn-Score + Risk-Band** | **abgeleitetes Profiling-Ergebnis (Art. 4 Nr. 4)** | n8n + `churn_events` | Audit: Customer-Policy (Empfehlung 24 Monate) |
| KI-Risiko-Einschätzung + Mail-Text | abgeleiteter Output | n8n + Mail-Body + `churn_events` | wie oben |
| An OpenRouter übertragen | Vorname, Plan, MRR, Signale, Score (KEINE Mail-Adresse) | OpenRouter + Model-Provider | laut DPA / Retention-Setting |

**Profiling-Hinweis (Art. 4 Nr. 4):** Der Churn-Score ist eine automatisierte Bewertung persönlicher Aspekte (Nutzungsverhalten) zur Vorhersage von Verhalten (Abwanderung) → **Profiling**. Das ist zulässig, aber **transparenzpflichtig** (Art. 13/14) und es greift Art. 22 (siehe §5).

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Verarbeitung von Nutzungs-/Vertragsdaten zur Vertragsbetreuung | **Art. 6 (1) lit. b** — Vertragserfüllung (Betreuung der laufenden Kundenbeziehung) |
| Churn-Scoring / Health-Monitoring | **Art. 6 (1) lit. f** — berechtigtes Interesse (Kundenbindung, Geschäftserhalt); Interessenabwägung dokumentieren |
| KI-Analyse via OpenRouter | **Art. 6 (1) lit. f** + **Art. 28** (Auftragsverarbeitung, falls OpenRouter Sub-Processor) |
| **Retention-Mail an Bestandskunden** | **Differenziert:** Service-/Reaktivierungs-Mail im Rahmen der Vertragsbeziehung = lit. b/f; rein werbliche Mail = **§ 7 Abs. 3 UWG** (Bestandskundenwerbung für ähnliche Produkte, mit Widerspruchsmöglichkeit) ODER Einwilligung |
| Audit-Log (`churn_events`) | **Art. 6 (1) lit. f** + Rechenschaftspflicht Art. 5 (2) |

### § 7 Abs. 3 UWG — Bestandskundenwerbung (wichtig für die Retention-Mail)

Werbliche Mail an Bestandskunden **ohne** Einwilligung ist zulässig, wenn ALLE erfüllt sind:
1. Adresse wurde im Zusammenhang mit einem **Verkauf** erlangt
2. Werbung für **eigene, ähnliche** Produkte/Dienstleistungen
3. Kunde hat **nicht widersprochen**
4. Bei Erhebung **und** in jeder Mail wird auf das **Widerspruchsrecht** hingewiesen (kostenfrei, einfach)

**Customer-Pflicht:** Widerspruchs-/Präferenz-Link in jeder Retention-Mail (Platzhalter `{{INDIVIDUELL: Abmelde-/Präferenz-Link}}` im Workflow). Reine Service-Mails ("Können wir helfen?") sind eher Vertragskommunikation als Werbung — Grenze sauber halten.

---

## 3. Pflicht-Konfiguration im Workflow + Mail

### A) Mail-Footer (Pflicht in jeder Retention-Mail)
```
[Vorname Nachname / CS-Team]
[Firma + Rechtsform]
[Anschrift] | [E-Mail]

Du erhältst diese Nachricht als aktiver Kunde von [Produkt].
[Benachrichtigungen verwalten / Widerspruch — Link]
```
Im Workflow ist die Footer-Struktur + Präferenz-Link-Platzhalter enthalten → Customer füllt echte Daten + echten Link ein.

### B) Widerspruchs-/Präferenz-Mechanik
- Link muss funktionieren und zu einer echten Präferenz-/Opt-Out-Seite führen
- Widerspruch = keine weiteren Retention-Mails (Service-kritische Mails ausgenommen)

### C) Profiling-Transparenz (Art. 13/14)
Datenschutzerklärung des Customers muss enthalten:
- "Wir analysieren Nutzungsdaten zur Bewertung der Kundenzufriedenheit/Abwanderungs-Risikos (Profiling)."
- "Wir setzen dabei KI-gestützte Analyse ein."
- Rechtsgrundlage (lit. b/f), Widerspruchsrecht, Empfänger (LLM-Provider als Auftragsverarbeiter)

### D) Datenminimierung beim LLM-Call
- **Keine E-Mail-Adresse** im OpenRouter-Prompt (im Default nur Vorname + Signale)
- Nicht mehr Felder übertragen als für die Einschätzung nötig

---

## 4. Vendor-DPA-Übersicht

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer-Choice | — | 🟢 LOW wenn EU-Server |
| **Postgres (eigene DB)** | Datenhaltung | Customer-Choice | — | 🟢 LOW wenn EU + verschlüsselt |
| **OpenRouter** | KI-Analyse | ❌ US → leitet an Model-Provider (OpenAI/Anthropic/Mistral) | openrouter.ai/privacy | 🟠 HIGH (PII-Transfer Drittland, SCC + Hinweis Pflicht) |
| **Resend / Postmark / SMTP** | Mail-Versand | ✅/❌ je nach Wahl | provider-spezifisch | 🟢/🟡 |
| **Slack** | Team-Alert | ❌ US (EU-Data-Residency teils verfügbar) | slack.com/trust/compliance | 🟡 MEDIUM (Kundendaten im Alert → DPA Pflicht) |
| **Stripe** (optional Datenquelle) | Billing-Signale | ❌ US (mit SCC, EU-Entity) | stripe.com/legal/dpa | 🟡 MEDIUM |
| **PostHog / Mixpanel** (optional) | Activity-Daten | ✅/❌ je nach Region | provider-spezifisch | 🟡 MEDIUM |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors ins Verarbeitungsverzeichnis (Art. 30)
2. SCCs bei US-Vendors (OpenRouter, Slack, ggf. Stripe) prüfen
3. Auftragsverarbeiter + Drittland-Transfer in DS-Erklärung

**Hinweis Slack:** Der Alert enthält Kundenname + MRR + Signale → das ist PII in einem US-Tool. EU-Data-Residency aktivieren falls verfügbar, sonst in DPA/DS-Erklärung aufnehmen oder Alert-PII reduzieren (nur Customer-ID + Score statt Klarname).

---

## 5. Betroffenenrechte (Art. 15–22)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: DB + `churn_events` nach Kunden-ID durchsuchen, inkl. Score-Historie + KI-Einschätzung exportieren |
| **Berichtigung** (Art. 16) | In Quell-DB korrigieren, nächster Lauf erzeugt aktualisierten Score |
| **Löschung** (Art. 17) | n8n-Log: Auto-Cleanup. `churn_events`: bei Vertragsende / auf Verlangen löschen (Aufbewahrungsinteresse abwägen) |
| **Einschränkung** (Art. 18) | Kunde-Flag "vom Scoring ausnehmen" → WHERE-Klausel in der Query erweitern |
| **Datenübertragbarkeit** (Art. 20) | Export aus Quell-DB |
| **Widerspruch** (Art. 21) | Gegen die werbliche Retention-Mail: Präferenz-Link. Gegen das Profiling (lit. f): Kunde aus Scoring ausnehmen (Flag) |
| **Automatisierte Einzelentscheidung** (Art. 22) | **Wichtig:** Solange der Score nur intern priorisiert + eine Mail auslöst, entsteht **keine rechtliche/erheblich beeinträchtigende Entscheidung** → Art. 22 nicht einschlägig. **ABER:** Würde der Score automatisch z.B. Kündigung, Preiserhöhung oder Sperrung auslösen → Art. 22 greift, dann menschliche Prüfung + Einwilligung/Vertrags-Notwendigkeit Pflicht. **Customer darf den Score NICHT an folgenschwere Auto-Entscheidungen koppeln.** |

---

## 6. Löschfristen-Logik

| Datum | Aufbewahrung | Grund |
|---|---|---|
| Aktivitäts-Rohdaten (`customer_activity`) | Customer-Policy (Empfehlung: rollierend 12 Monate) | Nutzungsanalyse-Notwendigkeit |
| Churn-Score + `churn_events` | Empfehlung 24 Monate (Trend-/Reporting-Wert), dann anonymisieren | berechtigtes Interesse + Rechenschaft |
| n8n-Execution-Log | 14–30 Tage | Operational |
| KI-Mail-Bodies in Logs | maskieren / nicht persistieren | Datenminimierung |
| Bei Vertragsende des Kunden | Aktivitätsdaten + personenbezogene Churn-Events löschen/anonymisieren (gesetzliche Aufbewahrung beachten) | Zweckwegfall |

**Implementation:** Cron in der Quell-DB für Rohdaten-Rotation; `churn_events`-Anonymisierung (Kunden-ID → Hash) nach 24 Monaten.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**
- Standard-Churn-Scoring auf Bestandskunden, kein Eingriff in Rechte/Pflichten, <10k Kunden: **Nein**, aber Risiko-Analyse + Interessenabwägung dokumentieren
- Score koppelt an folgenschwere Auto-Entscheidung (Sperrung/Kündigung/Preis): **Ja** (Art. 22 + systematische Bewertung)
- Sehr große Kundenbasis (>10k) + umfangreiches Verhaltens-Profiling: **Ja** (systematische umfangreiche Bewertung, Art. 35 (3) lit. a)
- Besondere Kategorien (Health-SaaS etc.): **Ja** (Anwalt!)

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Churn-Radar |
|---|---|
| **AI-System nach Art. 3 (1)?** | **Ja** — LLM-Call zur Analyse + Textgenerierung |
| **Risk-Class** | **Limited Risk** — KI generiert Mail-Text + interne Einschätzung. Transparenzpflicht (Art. 50): Empfänger muss erkennen können, dass mit KI personalisiert wurde |
| **High-Risk?** | Nein — **solange** der Score keine Annex-III-Entscheidung trägt (kein Kreditscoring, kein Zugang zu essenziellen Diensten, kein Beschäftigungs-Score). **Achtung:** Würde Churn-Scoring den Zugang zu einem essenziellen Dienst steuern, wäre High-Risk zu prüfen. |
| **Prohibited?** | Nein — solange keine manipulativen/ausnutzenden Techniken im Mail-Text |

**Customer-Action:**
- DS-Erklärung: "Wir nutzen KI-gestützte Analyse zur Kundenbetreuung."
- Empfohlen: dezenter Hinweis im Mail-Footer ("KI-gestützt personalisiert")
- KEINE manipulativen Patterns (False-Urgency, Fake-Verknappung) im Retention-Text
- Score NICHT an folgenschwere Auto-Entscheidungen koppeln (sonst High-Risk-Prüfung)

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung aktualisiert (Profiling-Hinweis + KI-Hinweis + Vendor-Liste + Drittland-Transfer)
- [ ] Interessenabwägung (lit. f) für Churn-Scoring dokumentiert
- [ ] § 7 Abs. 3 UWG geprüft, falls Retention-Mail werblichen Charakter hat
- [ ] Widerspruchs-/Präferenz-Link in der Retention-Mail funktionsfähig
- [ ] Mail-Footer mit Absender-Identifikation komplett
- [ ] Keine E-Mail-Adresse im LLM-Prompt (Datenminimierung verifiziert)
- [ ] OpenRouter EU-Routing gewählt ODER Drittland-Hinweis dokumentiert
- [ ] Slack-Alert-PII abgewogen (Klarname vs. nur Customer-ID + Score)
- [ ] Read-Only-DB-Rolle für die Query, INSERT-only für `churn_events`
- [ ] Vendor-DPAs gegengezeichnet + im Verzeichnis (Art. 30)
- [ ] SCCs bei US-Vendors bestätigt
- [ ] EU-Hosting bei n8n + Mail-Provider
- [ ] n8n-Execution-Log-Retention 14–30d + Sensitive-Field-Masking
- [ ] "Vom-Scoring-ausnehmen"-Flag-Mechanik für Art.-21-Widerspruch vorbereitet
- [ ] **Score NICHT an folgenschwere Auto-Entscheidung gekoppelt (Art. 22)** verifiziert
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt (inkl. § 7 Abs. 3 UWG Bestandskunde)
- [x] Profiling (Art. 4 Nr. 4) + Art. 22 Abgrenzung explizit
- [x] Pflicht-Konfiguration (Footer + Widerspruch + Profiling-Transparenz)
- [x] Vendor-DPA-Übersicht erstellt (8 Vendors)
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung (Limited Risk, High-Risk-Vorbehalt benannt)
- [x] Audit-Checkliste vor Go-Live (17 Punkte)
- [ ] Anwaltliche Validierung der DS-Klauseln + Interessenabwägung — Customer-Action
- [ ] "Vom-Scoring-ausnehmen"-Flag als Default im Workflow — Phase 2
