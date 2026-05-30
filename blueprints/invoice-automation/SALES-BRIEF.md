# Invoice-Automation Blueprint — Sales Brief

## In einem Satz

Eingehende Rechnungs-PDFs werden automatisch per KI extrahiert, geprüft, ins DATEV-Format konvertiert und protokolliert — ohne manuelles Abtippen, ohne vergessene Mahnungen.

---

## Wer das braucht

| Segment | Schmerzpunkt | Konkreter Fit |
|---|---|---|
| **AG – Agenturen** (3–50 MA) | Freelancer-Rechnungen, Software-Lizenzen, Media-Einkauf landen unstrukturiert per Mail; Assistenz verliert 2–4h/Woche mit Abtippen | Webhook-Trigger fängt alle Eingangsrechnungen ab; Claude extrahiert automatisch; DATEV-Export für Steuerberater |
| **PB – Personal Brands** (Solo–3 MA) | 20–80 Rechnungen/Monat manuell sortieren und dem Steuerberater aufbereiten ist unverhältnismäßig teuer | Vollautomatischer Durchlauf, Google-Sheets-Protokoll als Übergabedatei an Steuerberater |
| **FI – Mittelstand B2B** (10–100 MA) | 50–500 Rechnungen/Monat überlasten Buchhaltung; Fehlerquote durch manuelle Eingabe verursacht Rückfragen und Mahnverzug | Skalierbare Verarbeitung, Duplikat-Check, Slack-Alert für Ausreißer, direkter ERP-/DATEV-Feed |

---

## Was Customer bekommt

1. Fertiger n8n-Workflow (14 Nodes, produktionsreif) mit Multi-Source-Trigger (Webhook + E-Mail-Anhang)
2. LLM-Extraktion via Claude: Lieferant, Rechnungsnummer, Datum, Fälligkeitsdatum, Netto, MwSt, Brutto, IBAN, Verwendungszweck
3. Automatische Plausibilitätsprüfung (Rechenprüfung, Pflichtfelder, Duplikat-Check via Rechnungsnummer)
4. Zwei-Wege-Routing: valide Rechnungen → DATEV-Export; fehlerhafte → Slack-Alert + Freigabe-URL
5. DATEV-Buchungsstapel-CSV (konfigurierbares Konto/Gegenkonto, abgestimmt mit Steuerberater)
6. Google-Sheets-Protokoll mit Status jeder Rechnung (inklusive Fehlerfall)
7. E-Mail-Summary an Buchhaltung nach Export
8. Error-Handler für jeden kritischen Node (Slack-Alert)
9. Vollständige Konfigurationsanleitung + DSGVO-Check + Security-Risk-Matrix

---

## Mehrwert (konkret)

### Vorher / Nachher

| Metrik | Vorher (manuell) | Nachher (automatisiert) |
|---|---|---|
| Zeit pro Rechnung | 5–15 Min | < 30 Sek (Durchlauf) + ggf. 2 Min manuelle Prüfung bei Ausreißer |
| Fehlerquote Dateneingabe | 3–8 % (Tippfehler, falsche Kostenstellen) | < 1 % (LLM-Extraktion + Rechenprüfung) |
| Vergessene Rechnungen | Passiert bei hohem Volumen | 0 (alle Eingänge werden protokolliert) |
| DATEV-Übergabe | Manueller Export oder Steuerberater-Rückfragen | Automatische CSV, sofort abholbereit |
| Skalierbarkeit | Linear mit Personenstunden | Flach (50 oder 500 Rechnungen = gleicher Aufwand) |

### ROI-Schätzung (konservativ, FI-Segment)

- **Annahme:** 150 Rechnungen/Monat × 10 Min manuell = 25h/Monat
- **Interner Kostensatz:** 45 EUR/h = **1.125 EUR/Monat** eingesparter Arbeitszeit
- **Setup S-Tier:** 4.000 EUR einmalig + 1.500 EUR/Mo (laufend)
- **Break-even:** ~5 Monate (danach netto positiv)
- **Nicht eingerechnet:** Wegfall von Mahngebühren, Skontonutzung durch pünktlichere Verbuchung, reduzierter Steuerberater-Aufwand

> 🟡 Hinweis: ROI-Zahlen basieren auf Erfahrungswerten. Tatsächliche Einsparung hängt von Rechnungsvolumen, Dokumentenqualität und Prozessreifegrad ab.

---

## Pricing-Logic

| Modell | Was ist inbegriffen | Preis-Indikation |
|---|---|---|
| **Blueprint (Self-Service)** | workflow.json + Dokumentationspaket (Install-Guide, DSGVO-Check, Security-Matrix) | einmalig €297–€497 |
| **DFY – Done For You** | Blueprint + Einrichtung in Customer-Instanz, Credential-Setup, Konto-Abstimmung mit Steuerberater, 30 Tage Hypercare | **S-Tier:** €3.500–€6.000 Setup + €1.200–€1.800/Mo |
| **DwY – Done with You** | Blueprint + 2 Workshop-Sessions (Setup + Review), Customer richtet selbst ein, AEVUM reviewed | €1.500–€2.500 einmalig |
| **Audit-only** | Review bestehender Buchhaltungs-Automatisierung + Gap-Analyse + Risk-Matrix | €1.500–€2.500 |

> Für FI-Segment mit >300 Rechnungen/Monat oder ERP-Integration (SAP, Lexoffice, Sevdesk) → M-Tier-Gespräch.

---

## Voraussetzungen Customer

| Voraussetzung | Pflicht | Details |
|---|---|---|
| n8n-Instanz (Cloud oder Self-Hosted) | Ja | Version ≥ 1.40.0 |
| Anthropic API-Key | Ja | Claude 3 Haiku reicht; ca. €0,02–€0,08 pro Rechnung |
| Google-Account + Sheets-Zugriff | Ja | Für Protokoll-Tabelle |
| SMTP-Zugang | Ja | Gmail, Postfix, SendGrid o.ä. |
| Slack-Workspace | Empfohlen | Für Alerts bei manueller Prüfung; ohne Slack: E-Mail-Fallback konfigurierbar |
| DATEV-Kontenrahmen (SKR03/SKR04) | Ja | Konto-Nummern mit Steuerberater abstimmen |
| Rechnungen als PDF | Ja | JPEG/PNG aktuell nicht im Scope (kein OCR-Fallback) |

---

## Nicht-Ziele

Dieses Blueprint löst **nicht**:

- Ausgangsrechnungs-Erstellung oder -Versand
- Direkte API-Integration in DATEV-Software (kein DATEV-Unternehmen-Online-Connect; CSV-Import ist manueller Schritt)
- OCR für handgeschriebene Rechnungen oder stark beschädigte Scans
- Mehrstufige Genehmigungsworkflows (z.B. 4-Augen-Prinzip mit zwei Freigebern)
- Steuerberatungs- oder Buchungsberatungsleistung (Konten-Setup liegt beim Customer/Steuerberater)
- Echtzeitige ERP-Einbuchung (SAP, Dynamics, Lexoffice) — das ist M/L-Tier
- Verarbeitung von Rechnungen in nicht-deutschen Formaten (z.B. US-Tax-ID-Logik, VAT-Reverse-Charge EU komplex)

---

## Upsell-Pfade

| Upsell | Trigger | Tier |
|---|---|---|
| **Ausgangsrechnungs-Automation** | Customer fragt nach, ob auch Ausgangsrechnungen automatisiert werden können | M-Tier |
| **ERP-Direktintegration** (Lexoffice, sevDesk, SAP) | Volumen >300/Mo oder Customer will CSV-Import eliminieren | M–L-Tier |
| **Mehrstufige Freigabe-Workflows** | Customer hat Zeichnungslimit-Richtlinien (z.B. >5k braucht CFO-Sign-off) | M-Tier |
| **Creditor-Stammdaten-Abgleich** | Customer will IBAN gegen bekannte Lieferanten-Datenbank prüfen (Anti-Fraud) | M-Tier Add-on |
| **Vollständiges AP-Dashboard** | Customer will Echtzeit-Übersicht offener Verbindlichkeiten + Fälligkeiten | L-Tier |
| **Audit-Trail für ISO/SOC** | Customer braucht lückenlosen Nachweis jedes Verarbeitungsschritts | M-Tier Add-on |

---

## Conversion-Story

**Der echte Kostentreiber ist nicht die Rechnung — es ist die Reibung.** Eine Agentur mit 80 Eingangsrechnungen im Monat zahlt nicht 80 × 10 Minuten. Sie zahlt für die Kontextwechsel, die Nachfragen ("Welche Kostenstelle?"), die Mahnungen, die ankommen weil eine Rechnung im Postfach unterging, und die Steuerberater-Stunden für die Klärung von Buchungsfragen. Invoice-Automation beseitigt diese Reibung systematisch — nicht durch Hoffnung, sondern durch einen Prozess der keine Ausnahmen kennt.

**Das Vertrauen-Problem mit KI-Extraktion** ist real und wird hier direkt adressiert: Claude liest das PDF, aber der Workflow vertraut ihm nicht blind. Jede extrahierte Rechnung durchläuft eine Rechenprüfung (Brutto = Netto × (1 + MwSt)), einen Pflichtfeld-Check und einen Duplikat-Check. Was nicht passt, landet nicht automatisch im DATEV-Export — es landet im Slack-Channel des Buchhaltungsteams mit einem direkten Freigabe-Link. Das ist kein "KI übernimmt die Buchhaltung", das ist "KI erledigt 90 % und Menschen entscheiden bei den restlichen 10 % bewusst und schnell."

**Der Einstieg ist der kleinste Schritt.** Blueprint kaufen, in bestehende n8n-Instanz importieren, 15 Platzhalter befüllen — fertig. Wer das nicht selbst machen will: DFY-Setup in 3–5 Werktagen. Wer danach merkt, dass 500 Rechnungen/Monat und eine direkte Lexoffice-Anbindung sinnvoll wären: das Gespräch dauert 30 Minuten. Der Blueprint ist der Beweis, dass der Ansatz funktioniert — nicht ein Versprechen.