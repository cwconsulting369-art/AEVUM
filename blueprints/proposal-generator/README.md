# AEVUM Blueprint: Proposal-Generator

> Aus Discovery-Notizen automatisch ein maßgeschneidertes Angebot (HTML + PDF) mit nachvollziehbarer Pricing-Logik generieren.

---

## Das Problem (ungeschönt)

Nach jedem Discovery-Call sitzt du 60–120 Minuten und baust ein Angebot zusammen:

- Notizen durchforsten, Bedarf rausziehen
- Word/PDF-Vorlage suchen, Vorjahres-Angebot kopieren, alte Kundennamen rausvergessen (peinlich)
- Preise im Kopf zusammenrechnen, Mengenrabatt vergessen, Express-Zuschlag vergessen
- Layout zerschießt sich, USt-Hinweis falsch, "gültig bis" steht noch auf letztem Monat
- Angebot liegt 2 Tage rum, weil "ich mach das heute Abend" — Lead kühlt ab

**Ergebnis:** Langsame, inkonsistente Angebote. Jedes sieht anders aus. Pricing ist Bauchgefühl statt Regel. Und der teuerste Teil ist nicht das Schreiben — es ist die Verzögerung, in der der Lead kalt wird.

---

## Die Lösung

Der **Proposal-Generator** nimmt rohe Discovery-Notizen (aus Call, Formular, Transcript) und erzeugt in einem Durchlauf:

1. **Strukturierung via KI** — Claude liest die Notizen, leitet die Kern-Bedürfnisse ab und wählt **ausschließlich aus deinem Leistungskatalog** passende Positionen (keine erfundenen Leistungen).
2. **Deterministische Pricing-Logik** — Preise, Mengenrabatt, Express-Zuschlag, USt und Anzahlung rechnet **Code** (kein LLM), damit Zahlen reproduzierbar und prüfbar sind.
3. **Angebots-HTML + PDF** — sauberes, gebrandetes Angebot mit Positionstabelle, Liefer-Ergebnissen, Konditionen, "gültig bis"-Datum und korrektem USt-Hinweis.
4. **CRM-Log** — jedes Angebot wird mit Metadaten protokolliert (Nachverfolgung, Pipeline).
5. **Sicherer Versand-Gate** — Default: Angebot geht **zuerst an dein internes Postfach zur Freigabe**. Direkt-an-Kunden nur, wenn du es bewusst aktivierst.
6. **Fehler-Pfad** — ungültige Discovery, PDF-Fehler oder CRM-Fehler lösen einen Alert an dich aus. Es geht **nie** ein kaputtes Angebot an den Kunden.

**Was die KI macht:** Notizen verstehen + Struktur vorschlagen.
**Was die KI NICHT macht:** Preise rechnen, Leistungen erfinden, ungeprüft versenden.

---

## Features

- KI-Strukturierung von Freitext-Discovery in saubere Angebots-Bausteine
- Katalog-gebundene Positionswahl (LLM kann nur existierende Keys wählen)
- Regelbasierte Preislogik: Mengenrabatt, Express-Zuschlag, USt (inkl. §19-UStG-Modus), Anzahlung
- Budget-Warnung, wenn Angebot deutlich über genanntem Budget liegt
- HTML + Plaintext + PDF-Output
- Crash-sichere Code-Nodes (kein Workflow-Abbruch bei wackeligen LLM-Antworten)
- Versand-Gate (internal_review vs. direct_client)
- Eindeutige Angebots-Nr. + "gültig bis"-Datum automatisch

---

## Für wen (Ziel-Segmente)

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (AG) | Jedes Angebot ist Handarbeit, Pricing inkonsistent über Team, Angebote dauern Tage | Standardisierte, sofortige Angebote aus Call-Notizen — gleiche Qualität egal wer schreibt |
| **Personal Brand / Solo-Berater** (PB) | Keine Zeit + keine Lust auf Angebots-Bürokratie, Preise aus dem Bauch | 5-Min-Angebot mit fairer, regelbasierter Kalkulation statt Freitag-Abend-Frust |
| **Mittelstand B2B** (FI) | Vertrieb wartet auf "Angebot vom Chef", Engpass beim Erstellen | Discovery rein → Angebots-Entwurf zur Freigabe raus, Sales bleibt im Flow |

---

## Was du eintragen musst

Alle Platzhalter im Workflow sind als `{{INDIVIDUELL: ...}}` markiert. Sitzen im Node **Set: Angebots-Konfiguration** (außer Credentials).

| Platzhalter / Feld | Was rein muss | Woher |
|---|---|---|
| `vendorName` | Dein Name fürs Angebot | Du selbst |
| `vendorCompany` | Firmenname + Rechtsform | Gewerbeanmeldung / Impressum |
| `vendorAddress` | Vollständige Anschrift für den Footer | Impressum |
| `vendorEmail` | Absender-/Reply-To-Adresse | Eigene Domain (`angebote@...`) |
| `serviceCatalog` | Dein Leistungskatalog: Key, Label, `basePrice`, `unit` | Deine Preisliste — **das ist das Herz**, hier definierst du was du verkaufst und zu welchem Preis |
| `pricingRules` | Währung, USt-Satz, Express-Zuschlag, Mengenrabatt, Gültigkeit, Anzahlung | Deine Kalkulationsregeln (Defaults sind §19-UStG/Kleinunternehmer-tauglich) |
| `notifyEmail` | Internes Postfach für Review + Fehler-Alerts | Du / Sales |
| `pdfRenderUrl` | HTML-zu-PDF-API-Endpoint | PDFShift / html2pdf.app / self-hosted Gotenberg |
| `proposalStoreUrl` | CRM-/Sheet-Endpoint zum Loggen | Airtable / Supabase / Sheets-API |
| `sendMode` | `internal_review` (Default, sicher) oder `direct_client` | Du — erst auf direct umstellen wenn der Output sitzt |
| Credential **Anthropic API** | API-Key für Claude | console.anthropic.com |
| Credential **PDF-Render API** | Header-Auth-Token | PDF-Provider-Dashboard |
| Credential **Proposal-Store API** | Header-Auth-Token | CRM/Sheet-Provider |
| Credential **SMTP** | Mail-Versand | Resend / Postmark / Mailgun / eigener SMTP |

**Eingehende Discovery-Daten** (per Webhook-POST):
`clientName`, `clientCompany`, `clientEmail`, `notes` (Freitext, Pflicht, ≥40 Zeichen), optional `requestedScope`, `budgetHint` (Zahl), `deadline` (Datum für Express-Erkennung).

---

## Voraussetzungen

| Tool | Zweck | Pflicht? | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | Workflow-Engine | Ja | €0–20/Mo |
| Anthropic API-Key | KI-Strukturierung (Claude) | Ja | ~€0,01–0,03 pro Angebot |
| HTML-zu-PDF-API | PDF-Erzeugung | Ja* | PDFShift ab €9/Mo, Gotenberg self-host €0 |
| SMTP / Mail-Provider | Versand (Review/Kunde/Fehler) | Ja | €0–15/Mo |
| CRM / Sheet / Supabase | Angebots-Log | Empfohlen | €0–20/Mo |

\* PDF kann optional weggelassen werden (nur HTML-Mail), dann den `HTTP: PDF generieren`-Node deaktivieren und direkt zum CRM-Log verbinden.

---

## Setup in 5 Schritten (Kurzfassung — Details: INSTALL-GUIDE.md)

### 1. Importieren
n8n → Workflows → Import from File → `workflow.json`. **Nicht aktivieren.**

### 2. Credentials anlegen
Anthropic API, PDF-Render API (Header-Auth), Proposal-Store API (Header-Auth), SMTP. In den jeweiligen Nodes referenzieren — **Tokens nie in den Node-Body schreiben**.

### 3. Konfiguration füllen
Im Set-Node `Set: Angebots-Konfiguration` alle `{{INDIVIDUELL: ...}}` ersetzen. Vor allem `serviceCatalog` (deine echten Leistungen + Preise) und `pricingRules`.

### 4. Test
Webhook-Test-Call mit echten Discovery-Notizen. `sendMode` auf `internal_review` lassen. Prüfen: Struktur sinnvoll? Preise korrekt gerechnet? PDF lesbar? Review-Mail kommt an?

### 5. Aktivieren
Workflow auf "Active". Discovery-Quelle (Formular / Transcript-Webhook / manuelles Tool) auf den Webhook-Endpoint zeigen lassen.

---

## Pricing-Logik (so rechnet der Code)

```
Zwischensumme   = Σ (basePrice × quantity) je gewählter Position
- Mengenrabatt  = volumeDiscountPct, falls Zwischensumme ≥ volumeDiscountThreshold
+ Express-Zuschlag = rushSurchargePct, falls Tage bis Deadline ≤ rushThresholdDays
= Netto
+ USt           = netTotal × vatRate   (vatRate=0 im §19-Modus)
= Brutto (Gesamt)
Anzahlung       = Brutto × depositPct
```

Alle Regelwerte stehen in `pricingRules` und sind ohne Code-Änderung anpassbar.

---

## Grenzen / Was es NICHT macht

- **Kein E-Signature/Vertrag.** Erzeugt Angebot, keine rechtsverbindliche Unterschrift. (Upsell: DocuSign/Yousign-Integration.)
- **Kein Payment.** Anzahlung wird ausgewiesen, nicht eingezogen. (Upsell: Stripe-Payment-Link.)
- **Kein Angebots-Follow-up.** Versendet einmal; Nachfass-Sequenz ist separat (siehe Cold-Outreach-Blueprint-Mechanik).
- **PDF-Anhang-Verdrahtung provider-abhängig.** Je nach PDF-API kommt URL oder Base64 zurück — Anhang an die Kunden-Mail muss einmal provider-spezifisch verbunden werden (in INSTALL-GUIDE beschrieben).
- **KI kann Discovery missverstehen.** Deshalb Default `internal_review`: ein Mensch prüft, bevor es zum Kunden geht. Erst auf `direct_client` umstellen, wenn die Qualität über ~20 Angebote konstant sitzt.
- **Pricing ist nur so gut wie dein Katalog.** Garbage-in, garbage-out: definiere `serviceCatalog` sauber.
