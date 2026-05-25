# AEVUM Blueprint: Reporting Dashboard — Weekly KPI Automation

## In einem Satz

Jeden Montag um 07:00 liegt der fertige KPI-Report in der Inbox — automatisch aus GA4, Meta Ads und deinem Daten-Sheet zusammengestellt, ohne dass jemand einen Finger rührt.

---

## Wer das braucht

| Segment | Typischer Schmerz | Fit |
|---|---|---|
| **AG** — Agentur (3–50 MA) | Jeder Montag beginnt mit manuellen Daten-Exports für 3–8 Kunden, Marketing-Manager verliert 2–4h | Starker Fit — ein Blueprint pro Kunden-Property skalierbar |
| **PB** — Personal Brand / Solopreneur | Zahlen werden "irgendwie" verfolgt, meist in Woche 3 dann gar nicht mehr | Guter Fit — zero-maintenance nach Setup, sofortige Klarheit |
| **FI** — Mittelstand B2B-Dienstleister | Geschäftsführer bekommt Zahlen erst am Mittwoch nach dem Wochentreffen, immer veraltet | Starker Fit — Entscheidungsgrundlage liegt vor dem Montagsmeeting bereit |

---

## Was Customer bekommt

1. Fertiger n8n-Workflow (6 Nodes, produktionsbereit, kommentiert)
2. Wöchentlicher HTML-Report per E-Mail — KPI-Übersicht, Vorwochenvergleich, Performance-Ampel
3. GA4-Integration via Service Account (kein OAuth-Ablaufdatum-Problem)
4. Optionaler Meta Ads Kanal (Spend, CPL, ROAS)
5. Manuelle KPI-Eingabe via Google Sheets (für Offline-Werte)
6. Konfigurierbare Schwellenwerte für die Performance-Ampel
7. Setup-Anleitung Schritt für Schritt (inkl. Google Cloud Service Account)
8. Troubleshooting-Referenz für die 5 häufigsten Fehler

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher (manuell) | Nachher (Blueprint) |
|---|---|---|
| Zeitaufwand pro Woche | 2–4h Daten zusammensuchen | ~0 min (Monitoring: 5 min) |
| Datenfreshness | Mittwoch–Donnerstag | Montag 07:00 Uhr |
| Fehlerquote | Copy-Paste-Fehler, falsche Zeiträume | Deterministisch, gleiche API-Abfrage jede Woche |
| Sichtbarkeit | Nur wer ExportZugriff hat sieht Zahlen | Alle Empfänger gleichzeitig, per Mail |
| Skalierung | Pro Kunde / Projekt +2h Setup | Pro Kunde: Konfiguration duplizieren, 15 min |

### ROI-Schätzung

Annahme: Marketing-Manager oder Agenturmitarbeiter, 50 EUR/h interner Kostensatz.

- **2h/Woche gespart × 50 EUR × 52 Wochen = 5.200 EUR/Jahr** pro Property
- Bei einer Agentur mit 5 Kunden: **26.000 EUR/Jahr** Opportunity Cost zurückgewonnen
- Setup-Aufwand (Blueprint-Tier): einmalig 2–4h

> Diese Zahlen sind Schätzungen auf Basis typischer Agenturprozesse. Tatsächliche Einsparung hängt von Anzahl Properties, Reporting-Empfänger und bestehenden Prozessen ab.

---

## Pricing-Logic

| Tier | Format | Was ist enthalten | Preis |
|---|---|---|---|
| **Blueprint (Self-Service)** | Download + Doku | Workflow-File, README, Install-Guide, Security-Hinweise | auf Anfrage / Produktseite |
| **DFY — Done For You** | AEVUM richtet ein | Alle Blueprint-Inhalte + Setup in deiner Infrastruktur, Test-Run, 1x Anpassung der KPI-Schwellenwerte, 30 Tage E-Mail-Support | S-Tier: €2.500 Setup + €750/Mo Monitoring optional |
| **DwY — Done with You** | Workshop + Co-Setup | 2h Remote-Session, gemeinsamer Setup, du lernst die Konfiguration selbst zu pflegen, Aufzeichnung | €1.200 einmalig |
| **Audit-Only** | Review bestehender Setup | Sicherheits- und DSGVO-Review deines bestehenden Reporting-Workflows | €1.500 |

> Preise netto zzgl. MwSt. Für Agenturen mit mehr als 3 Properties: Staffelkonditionen auf Anfrage.

---

## Voraussetzungen Customer

- n8n (self-hosted oder Cloud-Account, min. Starter-Plan)
- Zugriff auf Google Cloud Console (Service Account erstellen)
- GA4 Property mit mind. 14 Tagen Daten (Vorwochenvergleich funktioniert sonst nicht vollständig)
- SMTP-Konto oder Resend.com Account für Mail-Versand
- Optional: Meta Business Manager Account mit API-Zugriff
- Grundlegendes Verständnis: Was ist ein API-Key, wie öffne ich n8n Credentials (15-min-Einarbeitung realistisch)

**Nicht vorausgesetzt:** Programmierkenntnisse, eigener Server (n8n Cloud reicht), Meta Ads (optional).

---

## Nicht-Ziele

Dieses Blueprint ist ausdrücklich **nicht** für folgende Use Cases gebaut:

- Real-time Dashboards (Refresh < 24h) — dafür Looker Studio oder Metabase
- Multi-Property-Rollup in einer Mail (jede GA4 Property braucht eigene Workflow-Instanz)
- Historische Datenanalyse > 90 Tage (GA4 API-Abfragen auf 7/14 Tage optimiert)
- KI-gestützte Anomalieerkennung oder automatisches Kommentieren (kein LLM-Call im Workflow)
- White-Label-Reports mit Kunden-Branding pro Mail (HTML-Template ist statisch)
- CRM-Sync (HubSpot, Salesforce) — kein nativer Node im Blueprint

---

## Upsell-Pfade

| Upsell | Trigger | Produkt | Tier |
|---|---|---|---|
| Multi-Channel Reporting | Customer hat LinkedIn Ads, TikTok Ads zusätzlich | Erweiterter Reporting-Workflow mit 3+ Kanälen | M |
| Anomalie-Alerting | "Ich will nicht warten bis Montag wenn ROAS einbricht" | Real-time Alert-Blueprint (Threshold-Trigger, sofortige Slack/Mail-Benachrichtigung) | S |
| Client Reporting Automation | Agentur mit 5+ Kunden | Multi-Tenant Reporting mit eigenem Portal | L |
| Data Warehouse Integration | Daten sollen historisch gespeichert werden | BigQuery/Postgres-Anbindung + dbt-Modell | M |
| Full Marketing Automation Audit | Nach 3 Monaten Nutzung | Kompletter Prozess-Audit: Was automatisieren wir als nächstes? | Audit €2.500 |

---

## Conversion-Story

**Die Situation:** Montag, 09:00 Uhr. Das Weekly hat gerade gestartet. Die Frage "Wie lief letzte Woche?" hängt im Raum. Jemand öffnet GA4, jemand anderes exportiert Meta Ads — in zwei verschiedene Versionen einer Excel-Tabelle. Bis die Zahlen auf einem Stand sind, ist es 09:45. Das ist kein Einzelfall, das ist jede Woche.

**Was das Blueprint ändert:** Der Report ist um 07:00 Uhr bereits in der Inbox. Sessions, Leads, ROAS, Vorwochenvergleich, Performance-Ampel — alles in einer Mail, alle Empfänger gleichzeitig. Das Meeting beginnt mit einer Entscheidung, nicht mit einem Daten-Export. Der Code läuft deterministisch, zieht immer die gleichen Zeiträume ab, macht keine Copy-Paste-Fehler. Nach dem Setup gibt es nichts zu pflegen — außer wenn sich deine KPIs ändern.

**Warum jetzt:** Die manuelle Alternative kostet jede Woche Zeit, die sich summiert. Wer diese Entscheidung auf "irgendwann" verschiebt, zahlt jede Woche denselben Preis. Das Blueprint-Tier ist der Einstieg mit minimalem Commitment — wer die Einrichtung nicht selbst übernehmen will, kommt zum DFY-Setup. In beiden Fällen ist der erste automatisierte Report der konkrete Beweis, dass Automatisierung funktioniert — und der Startpunkt für weitere Prozesse.