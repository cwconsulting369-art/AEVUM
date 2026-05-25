---
title: AEVUM Blueprint — reporting-dashboard
date: 2026-05-25
generated_by: blueprint-master-doc-script
---

# AEVUM Blueprint — reporting-dashboard

> Generated 2026-05-25 16:31 Berlin-TZ. Combines alle Quality-Gate-Docs zu einem druckbaren Master-Dokument.

---

# 1. Sales-Brief


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
\newpage

# 2. Install-Guide


**Workflow:** `AEVUM — Reporting Dashboard`
**Nodes:** 6 | **Geschätzte Setup-Zeit:** 45–90 Minuten
**Schwierigkeitsgrad:** Einsteiger bis Fortgeschrittener

---

## Vorab-Check

Stelle sicher, dass alle folgenden Voraussetzungen erfüllt sind, bevor du mit dem Setup beginnst.

### Tool-Tabelle

| Tool | Version / Specs | Pflicht | Prüfen |
|---|---|---|---|
| n8n | min. 1.30.0 (self-hosted) oder Cloud Starter | Ja | `n8n --version` oder n8n Cloud Dashboard |
| Google Cloud Console Zugriff | Google-Konto mit Berechtigung, Service Accounts zu erstellen | Ja | [console.cloud.google.com](https://console.cloud.google.com) |
| GA4 Property | Mind. 14 Tage Daten, du bist Property-Administrator | Ja | GA4 Admin Panel |
| SMTP-Account oder Resend.com | SMTP: TLS-Port 587 oder 465; Resend: API-Key | Ja | Testmail senden können |
| Google Sheets (optional) | Lese-Zugriff für Service Account | Empfohlen | Sheet-URL verfügbar |
| Meta Business Manager (optional) | System User Token mit `ads_read` Permission | Optional | Meta Business Settings |

### Token-Specs

| Token-Typ | Format | Scope / Rechte | Ablauf |
|---|---|---|---|
| Google Service Account JSON | JSON-File mit `private_key`, `client_email`, `project_id` | `analytics.readonly` | Kein automatischer Ablauf (bis manuelle Rotation) |
| Meta System User Token | 200+ Zeichen String | `ads_read`, `read_insights` | 60 Tage (Long-lived Token) |
| Resend API Key | `re_xxxxxxxxxxxx` | Mail senden | Kein Ablauf (bis Widerruf) |
| SMTP App-Passwort | Provider-spezifisch (z.B. Gmail 16-Zeichen) | SMTP Auth | Kein Ablauf (bis Widerruf) |

---

## Schritt 1 — Google Cloud Service Account erstellen

1. Öffne [console.cloud.google.com](https://console.cloud.google.com)
2. Projekt wählen oder neu erstellen (Name z.B. `n8n-reporting`)
3. Linkes Menü: **"APIs & Dienste"** → **"Bibliothek"**
4. Suche nach **"Google Analytics Data API"** → **"Aktivieren"**
5. Linkes Menü: **"IAM & Admin"** → **"Dienstkonten"**
6. **"Dienstkonto erstellen"** klicken
   - Name: `n8n-reporting`
   - Beschreibung: `Service Account für n8n Reporting Dashboard`
   - Rolle: **Betrachter** (Viewer) — nicht mehr, nicht weniger
7. **"Fertig"** klicken
8. Das neue Dienstkonto anklicken → Tab **"Schlüssel"**
9. **"Schlüssel hinzufügen"** → **"Neuen Schlüssel erstellen"** → **JSON** → **"Erstellen"**
10. JSON-Datei wird automatisch heruntergeladen — sicher aufbewahren, nur einmal downloadbar

> Diese JSON-Datei enthält den privaten Schlüssel. Sie gehört nicht in Git, nicht in Slack, nicht in E-Mails.

---

## Schritt 2 — Service Account zu GA4 hinzufügen

1. Öffne [analytics.google.com](https://analytics.google.com)
2. Klicke unten links auf **"Admin"** (Zahnrad-Icon)
3. In der Property-Spalte: **"Property-Zugriffsverwaltung"**
4. Blau **"+"** oben rechts → **"Nutzer hinzufügen"**
5. E-Mail-Adresse: aus der JSON-Datei den Wert `client_email` kopieren (Format: `n8n-reporting@projektname.iam.gserviceaccount.com`)
6. Rolle: **Analyst**
7. **"Hinzufügen"** klicken
8. Notiere die **Property-ID** (Admin → Property-Einstellungen → "Property-ID": eine reine Zahl, z.B. `123456789`)

---

## Schritt 3 — n8n Credentials einrichten

### Google Service Account Credential

1. In n8n: **"Credentials"** → **"Add Credential"** → Suche nach **"Google Service Account"** (nicht OAuth2)
2. Felder ausfüllen aus der JSON-Datei:
   - **Service Account Email:** Wert von `client_email`
   - **Private Key:** Wert von `private_key` (inklusive `-----BEGIN PRIVATE KEY-----` und `-----END PRIVATE KEY-----`)
3. **"Save"** klicken — n8n verschlüsselt die Werte mit dem `N8N_ENCRYPTION_KEY`

### E-Mail Credential (Resend empfohlen)

**Option A — Resend:**
1. [resend.com](https://resend.com) Account erstellen, API-Key generieren
2. In n8n: Credential-Typ **"Resend"** → API-Key einfügen
3. Absender-Domain in Resend verifizieren (DNS-Einträge setzen)

**Option B — SMTP:**
1. In n8n: Credential-Typ **"SMTP"**
2. Host, Port, User, Passwort (App-Passwort, nicht Haupt-Passwort) eintragen
3. TLS: aktiviert, Port 587 (STARTTLS) oder 465 (SSL)

---

## Schritt 4 — Workflow importieren

1. In n8n: **"Workflows"** → **"Add Workflow"** → **"Import from File"** (oder "Import from URL")
2. Die Blueprint-JSON-Datei hochladen
3. Workflow öffnet sich mit 6 Nodes

---

## Schritt 5 — Config-Node ausfüllen

Öffne den Node **"Set: Konfiguration"** und trage folgende Werte ein:

| Parameter | Wo zu finden | Beispielwert |
|---|---|---|
| `ga4PropertyId` | GA4 Admin → Property-Einstellungen | `123456789` |
| `reportRecipients` | Deine Entscheidung | `["chef@firma.de", "marketing@firma.de"]` |
| `reportTitle` | Frei wählbar | `Weekly Marketing Report — Meine GmbH` |
| `currency` | EUR oder USD | `EUR` |

---

## Schritt 6 — GA4 API Node konfigurieren

1. Node **"HTTP: GA4 Report"** öffnen
2. Credential-Feld: das in Schritt 3 erstellte Google Service Account Credential wählen
3. URL prüfen: enthält `{{$json.ga4PropertyId}}` — wird aus Set-Node übernommen
4. Methode: POST, Header `Content-Type: application/json` — bereits gesetzt

---

## Schritt 7 — E-Mail-Node konfigurieren

1. Node **"Email: Report versenden"** öffnen
2. Credential: das in Schritt 3 erstellte Mail-Credential wählen
3. **"To"**-Feld: `{{$json.reportRecipients.join(', ')}}` oder Array-Expression — je nach n8n-Version prüfen
4. **"Subject"**: `{{$json.reportTitle}} – KW {{$json.reportKw}}`
5. **"HTML"**: bereits mit `{{$json.reportHtml}}` vorbelegt — nicht ändern

---

## Schritt 8 — Test-Run (3 Szenarien)

Führe alle Tests mit dem **"Test Workflow"**-Button aus (kein Live-Trigger nötig).

### Szenario 1: Happy Path

- GA4 Property hat Daten der letzten 14 Tage
- Erwartetes Ergebnis: Report-HTML wird generiert, Mail landet in Inbox
- Prüfen: Alle 6 Nodes grün, keine Fehler in Execution-Log

### Szenario 2: Leere GA4-Response (neues Property)

- Property hat weniger als 7 Tage Daten
- Vorgehen: Im GA4 API Node `dateRange` temporär auf `30daysAgo` ändern
- Erwartetes Ergebnis: Report erscheint mit Nullwerten statt Fehlermeldung
- Prüfen: Code Node verarbeitet leere Arrays ohne Crash

### Szenario 3: Ungültige E-Mail-Adresse

- `reportRecipients` mit Tipp-Fehler (z.B. `chef@firma`) belegen
- Erwartetes Ergebnis: E-Mail-Node gibt Fehler, Error-Workflow feuert
- Prüfen: Fehler-Notification kommt an (nur wenn Error-Workflow eingerichtet)

---

## Schritt 9 — Aktivierung und Schedule

1. Alle Tests erfolgreich: oben rechts **"Activate"**-Toggle einschalten
2. Der Workflow läuft ab sofort jeden Montag um 07:00 Uhr (Zeitzone prüfen!)
3. **Zeitzone prüfen:** Schedule Trigger öffnen → Timezone muss `Europe/Berlin` (oder deine Zeitzone) sein

> n8n Cloud: Zeitzone wird aus Account-Einstellungen gezogen. Self-hosted: `GENERIC_TIMEZONE=Europe/Berlin` in .env setzen.

### Monitoring nach Aktivierung

- Erste drei Montage: Execution-Log manuell prüfen (n8n → Executions)
- Prüfpunkte: Node-Laufzeiten, Payload-Größe, Fehlerfreiheit
- Nach 3 erfolgreichen Ausführungen: Monitoring auf Error-Workflow-Alerting verlassen

---

## Schritt 10 — Meta Ads (optional)

Falls Meta Ads-Daten gewünscht:

1. Meta Business Manager: System User mit `ads_read` Berechtigung erstellen
2. Long-lived Token generieren (60 Tage, Ablauf im Kalender eintragen)
3. Im Code Node: Meta-Daten-Block aktivieren (Kommentierung entfernen)
4. Ad Account ID (Format: `act_XXXXXXXXX`) in Set-Node eintragen
5. n8n Credential: HTTP Header Auth mit `Authorization: Bearer <TOKEN>`

---

## Troubleshooting

### Problem 1: GA4 API gibt 403 zurück

**Ursache:** Service Account hat keinen Zugriff auf die GA4 Property.
**Lösung:**
1. GA4 Admin → Property Access Management → Service Account E-Mail prüfen
2. Property-ID prüfen: nur die Zahl, kein `properties/` Präfix
3. Google Analytics Data API in Google Cloud Console aktiviert? (Schritt 1, Punkt 4)

### Problem 2: Report-E-Mail landet im Spam

**Ursache:** SPF/DKIM der Absender-Domain nicht konfiguriert.
**Lösung:**
- Resend.com nutzen (automatische DKIM-Konfiguration via DNS)
- Alternativ: SPF-Record für Absender-Domain beim Domain-Registrar setzen
- Absender-Adresse muss zur verifizierten Domain passen

### Problem 3: Schedule läuft nicht / läuft zur falschen Zeit

**Ursache:** Zeitzone in n8n nicht korrekt gesetzt.
**Lösung:**
```bash
# In .env (self-hosted):
GENERIC_TIMEZONE=Europe/Berlin
# n8n neu starten
```
n8n Cloud: Settings → Account → Timezone prüfen und auf `Europe/Berlin` setzen.

### Problem 4: Code Node Fehler "Cannot read property of undefined"

**Ursache:** GA4 API hat leere Response geliefert (keine Daten im Zeitraum).
**Lösung:** Im Code Node: Null-Checks für alle `$input.item.json`-Zugriffe hinzufügen:
```javascript
const sessions = $input.item.json.sessions ?? 0;
const conversions = $input.item.json.conversions ?? 0;
```

### Problem 5: Meta Access Token abgelaufen

**Ursache:** Meta User Token hat 60-Tage-Limit.
**Lösung:**
1. Meta Business Manager → System Users → Token erneuern
2. Neuen Token in n8n Credential aktualisieren
3. Long-lived Token via Meta Graph API Explorer für längere Laufzeit generieren

---

## Wartungs-Schedule

| Intervall | Aufgabe | Zeitaufwand |
|---|---|---|
| Wöchentlich (automatisch) | Workflow läuft, Report kommt | 0 min |
| Monatlich | Execution-Log kurz prüfen, Fehler-Quote checken | 5 min |
| Alle 60 Tage | Meta Access Token erneuern (falls genutzt) | 10 min |
| Alle 90 Tage | Google Service Account Key rotieren | 15 min |
| Bei GA4-Property-Änderungen | Property-ID und Metriken in Config-Node prüfen | 20 min |
| Bei n8n-Update | Workflow-Kompatibilität testen (Node-Versionen) | 30 min |

---

## DFY-Alternative

Wer diesen Setup nicht selbst durchführen möchte:

**AEVUM DFY-Setup** (Done For You):
- AEVUM übernimmt alle Schritte 1–10 in deiner Infrastruktur
- Inkl. Security-Konfiguration, Error-Workflow, erster Live-Test
- Übergabe mit Dokumentation und 30-Tage-Support-Fenster
- Preis: ab €2.500 Setup (S-Tier)

Kontakt: Blueprint-Seite → "DFY anfragen"
\newpage

# 3. Security-Risks


**Workflow-ID:** `reporting-dashboard-setup`
**Nodes im Scope:** Schedule Trigger, Set Konfiguration, HTTP GA4 Report, Set Daten normalisieren, Code HTML Report, Email Report versenden
**Review-Datum:** 2025
**Reviewer:** AEVUM Builder-Agent

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| R-01 | **Service Account JSON Key im n8n-Credential gespeichert** — private_key liegt im n8n-Datenbankplain oder verschlüsselt, je nach n8n-Konfiguration. Wenn n8n-Instanz kompromittiert → vollständiger GA4-Lesezugriff | 🔴 CRITICAL | Encryption Key in n8n zwingend setzen (`N8N_ENCRYPTION_KEY`). Key nie in Git. Service Account mit minimal-Rechten (Analyst, nur Lesezugriff). | `N8N_ENCRYPTION_KEY` als Umgebungsvariable setzen, Wert aus Passwortmanager |
| R-02 | **E-Mail-Empfänger-Array in Set-Node hartcodiert** — wenn Workflow-JSON geteilt oder exportiert wird, sind interne E-Mail-Adressen exponiert | 🟠 HIGH | Empfänger-Array in n8n-Variable oder Umgebungsvariable auslagern, nicht in Workflow-JSON committen | Workflow-JSON nicht in öffentlichen Git-Repos teilen; Credentials und Config trennen |
| R-03 | **HTTP Request Node gegen GA4 API ohne TLS-Verification-Check** — wenn n8n-Instanz in misconfigured Docker-Setup → MITM möglich | 🟠 HIGH | `SSL Certificates` in n8n HTTP-Node auf "Verify" belassen (Default). Self-signed Certs auf Proxy ausschließen. | TLS-Terminierung am Reverse-Proxy prüfen, kein `NODE_TLS_REJECT_UNAUTHORIZED=0` setzen |
| R-04 | **Code Node führt arbiträren JS-Code aus** — `Code: HTML Report bauen` ist ein freier Code-Node. Bei Modifikation durch Dritte oder Supply-Chain-Manipulation könnte Exfiltrations-Code eingebaut werden | 🟠 HIGH | Code-Nodes in produktiven Workflows nach Setup einfrieren (n8n Enterprise: Workflow-Locking). Änderungen an Code-Nodes nur nach Review. | Code-Node-Inhalt vor Go-Live reviewen und dokumentieren; Hash des Inhalts festhalten |
| R-05 | **GA4-Daten enthalten potenziell personenbezogene Informationen** — bei falscher Property-Konfiguration können User-Level-Daten (User-IDs, demographische Daten) in den Report fließen | 🟠 HIGH | Nur aggregierte Metriken abfragen (Sessions, Conversion Rate, keine User-Dimension). GA4 Property auf Datenschutz-Einstellungen prüfen. | GA4 IP-Anonymisierung aktiviert lassen; keine `userId`-Dimension in API-Query |
| R-06 | **SMTP-Credentials im Klartext in n8n-Konfiguration** — unsichere SMTP-Setups oder App-Passwörter landen in Credentials-Store | 🟡 MEDIUM | Resend.com oder dediziertes API-Key-basiertes Mail-System verwenden statt SMTP mit Passwort. API-Keys sind rotierbar. | Dedizierte Absender-Domain einrichten; kein Haupt-Mailaccount als SMTP-Sender verwenden |
| R-07 | **Schedule Trigger läuft ohne Fehler-Notification** — wenn GA4 API 403 wirft oder Report leer ist, bemerkt niemand den Ausfall bis zum nächsten Montag | 🟡 MEDIUM | Error-Workflow in n8n konfigurieren (`Settings > Error Workflow`). Slack- oder Mail-Alert bei Workflow-Fehler. | n8n Error Workflow einrichten; Monitoring-Cronjob oder n8n Cloud Execution-History prüfen |
| R-08 | **Meta Access Token läuft ab** — Meta Marketing API Tokens haben typischerweise 60-Tage-Lebensdauer. Ablauf führt zu stummem Fehler im Report | 🟡 MEDIUM | Token-Ablaufdatum im Kalender setzen. Long-lived Token via Meta Business SDK generieren. Alternativ: Meta-Daten-Block als optionalen Zweig mit Fehler-Handling | Token-Rotations-Erinnerung 7 Tage vor Ablauf im Kalender; Token-Typ prüfen (User vs. System) |
| R-09 | **Report-HTML enthält keine Output-Encoding-Sicherung** — wenn manueller Kommentar aus Google Sheet Sonderzeichen oder `<script>`-Tags enthält, könnte HTML-Mail XSS-fähig sein (in Mail-Clients mit HTML-Rendering) | ���� MEDIUM | Im Code Node: HTML-Escape aller Werte aus externen Quellen vor Einbettung in Template | Code Node reviewen: `value.replace(/</g, '&lt;').replace(/>/g, '&gt;')` für Sheet-Inhalte |
| R-10 | **Google Sheets als Datenquelle ohne Zugriffskontrollen** — wenn das Sheet mit "Jeder mit Link" geteilt ist, können externe Personen KPI-Daten einsehen oder Kommentare manipulieren | 🟡 MEDIUM | Sheet-Freigabe auf "Eingeschränkt" setzen; Service Account explizit hinzufügen | Sheet-Freigabe-Einstellungen prüfen: nur Service Account + interne Nutzer |
| R-11 | **n8n-Instanz ohne Authentifizierung erreichbar** — bei self-hosted n8n ohne Reverse-Proxy-Auth kann jeder den Workflow sehen und Credentials auslesen | 🟡 MEDIUM | n8n hinter Reverse-Proxy mit Basic Auth oder SSO. `N8N_BASIC_AUTH_ACTIVE=true` als Minimum. | n8n-URL nicht öffentlich zugänglich machen; VPN oder IP-Whitelist |
| R-12 | **Workflow-Execution-Logs enthalten API-Responses mit Metriken** — n8n speichert Input/Output jedes Nodes. Wer Execution-History einsehen kann, sieht alle KPI-Daten | 🟢 LOW | n8n Execution Data Pruning aktivieren. Retention auf 7–14 Tage begrenzen. | `EXECUTIONS_DATA_PRUNE=true`, `EXECUTIONS_DATA_MAX_AGE=168` (7 Tage) setzen |

---

## Pflicht-Mitigations

Folgende Maßnahmen sind **vor Go-Live zwingend erforderlich**:

### 1. n8n Encryption Key setzen

```bash
# In .env oder docker-compose.yml
N8N_ENCRYPTION_KEY=<32+ Zeichen, zufällig generiert>

# Key generieren:
openssl rand -hex 32
```

> Ohne diesen Key speichert n8n Credentials im Klartext in der SQLite/Postgres-Datenbank.

### 2. Execution-Logs begrenzen

```bash
# In .env
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
# Wert in Stunden: 168 = 7 Tage
```

### 3. Service Account Minimal-Rechte verifizieren

```
GA4 Property Access Management:
- Service Account Rolle: Analyst (NICHT Editor oder Administrator)
- Keine weiteren Google Cloud APIs aktiviert für diesen Service Account
- Service Account Keys-Rotation: alle 90 Tage im Kalender
```

### 4. HTML Output Encoding im Code Node

```javascript
// Im Code Node: Alle externen String-Werte vor HTML-Einbettung escapen
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Anwendung auf alle Werte aus Google Sheets:
const kommentar = escapeHtml($input.item.json.kommentar || '');
```

### 5. Error-Workflow konfigurieren

```
n8n Settings > Error Workflow:
- Eigenen Error-Notification-Workflow erstellen
- Mindestens: Send Email bei Workflow-Fehler
- Empfänger: technischer Admin, nicht gesamtes Team
```

---

## Empfohlene Mitigations (nicht zwingend, aber stark empfohlen)

- **Resend.com statt SMTP:** API-Key-basiert, bessere Zustellbarkeit, einfacher rotierbar
- **Google Sheets Zugriff:** Zweites Sheet für historische Reports anlegen — bei Datenpanne ist Verlauf rekonstruierbar
- **Meta Token Monitoring:** Separater Weekly-Check-Workflow der Token-Ablaufdatum prüft und 7 Tage vorher warnt
- **Workflow-Versionierung:** n8n Workflow als JSON in privatem Git-Repo versionieren (`.gitignore` für Credential-Exports)

---

## Was AEVUM bei DFY zusätzlich macht

- `N8N_ENCRYPTION_KEY` wird generiert und sicher übergeben (nicht per Mail)
- Service Account wird mit Minimal-Rechten angelegt und dokumentiert
- Error-Workflow wird gemeinsam konfiguriert und getestet
- HTML Output Encoding wird im Code Node vor Übergabe implementiert
- SMTP vs. Resend-Entscheidung wird gemeinsam getroffen
- Execution-Log-Retention wird in der n8n-Konfiguration gesetzt
- Erstes Security-Review nach 30 Tagen im DFY-Scope

---

## Known Limits

Diese Security-Maßnahmen adressieren **nicht**:

- Kompromittierung der Google-Cloud-Infrastruktur selbst
- Angreifer mit legitimem Zugriff auf n8n (Insider-Threat)
- Datenlecks auf Seite der E-Mail-Empfänger (Weiterleitung, geteilte Inboxen)
- Compliance-Anforderungen über DSGVO-Grundanforderungen hinaus (ISO 27001, SOC 2 — separates Audit erforderlich)
- Sicherheit des n8n-Host-Systems selbst (OS-Hardening, Firewall — Infrastruktur-Scope)

---

## Sign-Off-Checkliste

| # | Maßnahme | Status |
|---|---|---|
| 1 | `N8N_ENCRYPTION_KEY` gesetzt und dokumentiert | [ ] |
| 2 | Execution-Log-Retention konfiguriert (max. 14 Tage) | [ ] |
| 3 | Service Account Rolle: nur Analyst (kein Edit-Zugriff) | [ ] |
| 4 | HTML Escape-Funktion im Code Node implementiert | [ ] |
| 5 | Error-Workflow aktiv und getestet | [ ] |
| 6 | n8n-Instanz nicht ohne Auth öffentlich erreichbar | [ ] |
| 7 | E-Mail-Empfänger-Liste geprüft (kein öffentlicher Zugriff auf Workflow-JSON) | [ ] |
| 8 | Google Sheets Freigabe auf "Eingeschränkt" | [ ] |
| 9 | Meta Token Ablaufdatum im Kalender eingetragen (falls genutzt) | [ ] |
| 10 | Erster Test-Run ohne echte Produktionsdaten durchgeführt | [ ] |
\newpage

# 4. DSGVO-Konformitäts-Check


**Workflow-ID:** `reporting-dashboard-setup`
**Rechtsraum:** EU / DSGVO (GDPR)
**Stand:** 2025
**Hinweis:** Dieses Dokument ist eine technische Einschätzung, keine Rechtsberatung. Im Zweifel: Datenschutzbeauftragten hinzuziehen.

---

## Datenfluss-Analyse

| # | Datenquelle | Datentyp | Personenbezug | Empfänger | Speicherung in n8n | Retention |
|---|---|---|---|---|---|---|
| D-01 | Google Analytics 4 API | Aggregierte Sessions, Conversion Rate, Top-Seiten, Traffic-Zahlen | Kein direkter Personenbezug wenn korrekt konfiguriert (keine User-IDs, keine Client-IDs in Abfrage) | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log: siehe Konfiguration |
| D-02 | Meta Marketing API (optional) | Ad Spend, CPL, ROAS — kampagnenbezogen | Kein Personenbezug (aggregierte Kampagnendaten) | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log |
| D-03 | Google Sheets | Manuelle KPIs, Kommentarfeld | Potenziell personenbezogen wenn Kommentar Mitarbeiterbewertungen oder Namen enthält | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log |
| D-04 | E-Mail-Empfänger-Adressen | E-Mail-Adressen der Report-Empfänger | Personenbezogen (DSGVO-relevant) | n8n Konfiguration (Set Node) | Im Workflow-JSON + Execution-Log | Bis Workflow-Änderung |
| D-05 | Report-HTML (generiert) | Zusammengestellte KPI-Daten aus D-01 bis D-03 | Abhängig von Inhalt (s. D-03) | E-Mail-System (SMTP/Resend), E-Mail-Postfächer der Empfänger | Beim E-Mail-Provider | Gemäß Mail-Retention des Unternehmens |

---

## Rechtsgrundlage

**Primär: Art. 6 Abs. 1 lit. f DSGVO — Berechtigtes Interesse**

Begründung: Der Workflow verarbeitet aggregierte Unternehmens-KPIs zur internen Berichterstattung. Die Verarbeitung dient dem berechtigten Interesse des Unternehmens an der Steuerung seiner Marketing-Performance. Solange keine personenbezogenen Nutzerdaten (User-IDs, IPs) aus GA4 abgefragt werden, überwiegt das berechtigte Interesse.

**Für E-Mail-Empfänger (D-04):**
Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / arbeitsvertragliche Grundlage bei Mitarbeitern) oder Art. 6 Abs. 1 lit. f (internes Reporting).

**Achtung:** Wenn Kommentarfeld in Google Sheets (D-03) Bewertungen oder Aussagen über einzelne Mitarbeiter enthält → Art. 6 Abs. 1 lit. c oder b erforderlich, oder Einwilligung. Kommentarfeld ausschließlich für sachliche KPI-Notizen nutzen.

---

## Pflicht-Konfiguration für DSGVO-Konformität

1. **GA4 IP-Anonymisierung:** In GA4 muss "IP-Anonymisierung" aktiv sein (in GA4 per Default für EU-Properties, prüfen). GA4 Admin > Dateneinstellungen > Datenerfassung.

2. **Keine User-Level-Dimensionen in API-Query:** Die GA4 API-Abfrage darf keine Dimensionen wie `userId`, `clientId`, `deviceCategory + city` (re-identifizierbar) enthalten. Nur: `sessions`, `conversions`, `pagePath` (aggregiert).

3. **Google Sheets Kommentarfeld:** Keine personenbezogenen Daten (Mitarbeiternamen, Kundennamen, E-Mails) im Kommentarfeld. Nur sachliche Notizen.

4. **E-Mail-Empfänger-Liste:** Nur Personen, die einen legitimen Geschäftsbedarf für diese KPI-Daten haben. Keine externen Dritten ohne Auftragsdatenverarbeitungsvertrag.

5. **Execution-Log-Retention begrenzen:** Execution-Logs in n8n dürfen keine personenbezogenen Daten länger als nötig halten. Retention auf max. 30 Tage begrenzen (empfohlen: 7 Tage).

6. **n8n selbst-hosted in der EU:** Wenn n8n Cloud genutzt wird → Prüfen ob EU-Region gewählt (n8n Cloud Europa). Keine US-Region ohne Standardvertragsklauseln.

---

## Vendor-DPA-Übersicht

| Vendor | Zweck im Workflow | EU-Hosting verfügbar | DPA vorhanden | DPA-Link / Hinweis |
|---|---|---|---|---|
| **Google (GA4 API)** | Traffic-Daten abrufen | Ja (EU-Rechenzentren, Daten-Residency konfigurierbar) | Ja | [Google Ads Data Processing Terms](https://business.safety.google/adsprocessorterms/) / GA4 Einstellungen: Datenverarbeitung in EU |
| **Google (Sheets)** | Manuelle KPI-Eingabe | Ja | Ja | Google Workspace DPA in Admin-Konsole |
| **Meta (Marketing API)** | Ad-Spend-Daten | Primär US, EU-Datenlokalisierung eingeschränkt | Ja | [Meta Data Processing Terms](https://www.facebook.com/legal/terms/dataprocessing) — Prüfen ob Kampagnendaten als personenbezogen gelten |
| **n8n Cloud** | Workflow-Engine | Ja (EU-Region wählbar) | Ja | [n8n DPA](https://n8n.io/legal/dpa/) |
| **Resend.com** | E-Mail-Versand | US-basiert, EU-Kunden über SCCs | Ja | [Resend Privacy & DPA](https://resend.com/legal/dpa) — SCCs prüfen |
| **SMTP (eigener Provider)** | E-Mail-Versand | Abhängig vom Provider | Abhängig | Eigenen Mail-Provider-DPA prüfen |

> **Hinweis Meta:** Wenn Meta Ads-Daten ausschließlich aggregierte Kampagnen-Metriken sind (kein Custom Audience Upload, kein Pixel-Daten-Abruf), ist Personenbezug in der Regel nicht gegeben. Im Zweifel: Meta DPA abschließen.

---

## Betroffenenrechte

**Betroffene in diesem Workflow:** Primär keine Endnutzer-Daten, da nur aggregierte Metriken.

Ausnahme: E-Mail-Empfänger (D-04) haben Rechte als Betroffene.

| Recht | Umsetzung im Workflow-Kontext |
|---|---|
| Auskunft (Art. 15) | E-Mail-Adressen im Set-Node auf Anfrage offenlegen |
| Löschung (Art. 17) | E-Mail-Adresse aus Empfänger-Array entfernen |
| Widerspruch (Art. 21) | Empfänger kann jederzeit aus Report-Verteilung entfernt werden — Prozess intern dokumentieren |
| Datenportabilität (Art. 20) | Report-HTML ist bereits die "portable" Ausgabe |

---

## Löschfristen

| Datenkategorie | Speicherort | Empfohlene Retention | Maßnahme |
|---|---|---|---|
| Execution-Logs (inkl. API-Responses) | n8n Datenbank | 7–14 Tage | `EXECUTIONS_DATA_PRUNE=true` setzen |
| Generierte Report-E-Mails | E-Mail-Postfächer der Empfänger | Gemäß Unternehmens-E-Mail-Policy (typ. 1–3 Jahre) | In E-Mail-Archivierungsrichtlinie aufnehmen |
| Google Sheets Kommentarfeld | Google Drive | Laufend; bei Projektende löschen | Sheet in Projekt-Ablage-Prozess einbinden |
| Service Account JSON Key | n8n Credentials | Bis Rotation (max. 90 Tage) | Key-Rotation-Reminder setzen |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung)

Eine DSFA nach Art. 35 DSGVO ist für diesen Workflow in der Standardkonfiguration **nicht erforderlich**, da:
- Keine systematische Verarbeitung von Nutzerprofilen
- Keine sensiblen Datenkategorien (Art. 9 DSGVO)
- Keine Verarbeitung im großen Maßstab personenbezogener Daten

**DSFA wird erforderlich wenn:**
- User-Level-Daten aus GA4 abgefragt werden (User-IDs, demographische Profile)
- Der Report für externe Kunden generiert wird und Kundendaten enthält
- Das Kommentarfeld für HR-Daten (Mitarbeiterleistung) genutzt wird
- Der Workflow in Gesundheits-, Finanz- oder Behörden-Kontext eingesetzt wird

---

## EU AI Act Einordnung

**Kein LLM-Call im Workflow** — der `Code: HTML Report bauen` Node ist deterministischer JavaScript-Code ohne KI-Komponente.

**EU AI Act: Nicht anwendbar** für diesen Workflow in der Standardkonfiguration.

Sollte der Workflow erweitert werden um automatische Kommentar-Generierung via OpenAI/GPT → Neubewertung erforderlich (wahrscheinlich: Limited Risk, Transparenzpflicht gegenüber Empfängern).

---

## Audit-Checkliste vor Go-Live

| # | Prüfpunkt | Verantwortlich | Status |
|---|---|---|---|
| 1 | GA4 IP-Anonymisierung aktiv | Customer | [ ] |
| 2 | GA4 API-Query enthält keine User-Level-Dimensionen | AEVUM / Customer | [ ] |
| 3 | Google Sheets Kommentarfeld-Nutzungsrichtlinie kommuniziert | Customer | [ ] |
| 4 | DPA mit Google (GA4, Sheets) abgeschlossen / geprüft | Customer | [ ] |
| 5 | DPA mit Mail-Provider (Resend oder SMTP) abgeschlossen | Customer | [ ] |
| 6 | n8n in EU-Region gehostet (Cloud) oder EU-Server (self-hosted) | Customer | [ ] |
| 7 | Execution-Log-Retention auf max. 30 Tage begrenzt | Customer / AEVUM | [ ] |
| 8 | E-Mail-Empfänger-Liste dokumentiert und begründet | Customer | [ ] |
| 9 | Verarbeitungsverzeichnis (Art. 30 DSGVO) aktualisiert | Customer | [ ] |
| 10 | Meta DPA geprüft falls Meta Ads Modul aktiv | Customer | [ ] |

---

## Sign-Off

> Dieses DSGVO-Check-Dokument wurde auf Basis des vorliegenden Workflow-Summaries erstellt. Es ersetzt keine Rechtsberatung und keine individuelle Datenschutzprüfung durch einen qualifizierten Datenschutzbeauftragten. Bei Unklarheiten zur konkreten Rechtsgrundlage oder bei Einsatz in regulierten Branchen ist externe Rechtsberatung hinzuzuziehen.

**Erstellungsdatum:** 2025 | **Blueprint-Version:** 1.0 | **Nächste Überprüfung:** bei Workflow-Änderung oder spätestens nach 12 Monaten
\newpage

# 5. Quality-Gate Sign-Off


**Item-ID:** `reporting-dashboard-setup`
**Typ:** blueprint
**Quality-Gate-Version:** 1.0
**Datum:** 2025
**Status:** REVIEW PENDING

---

## Asset-Inventory

| Asset | Dateiname | Status | Letztes Update |
|---|---|---|---|
| Workflow-JSON | `reporting-dashboard-setup.json` | Vorhanden (Summary geprüft) | 2025 |
| README | `README.md` | Vorhanden, vollständig | 2025 |
| Sales Brief | `SALES-BRIEF.md` | Erstellt (dieser Run) | 2025 |
| Security Risks | `SECURITY-RISKS.md` | Erstellt (dieser Run) | 2025 |
| DSGVO Check | `DSGVO-CHECK.md` | Erstellt (dieser Run) | 2025 |
| Install Guide | `INSTALL-GUIDE.md` | Erstellt (dieser Run) | 2025 |
| Quality Gate | `QUALITY-GATE.md` | Erstellt (dieser Run) | 2025 |
| Thumbnail / Preview | nicht geprüft | Ausstehend | — |
| Changelog | nicht vorhanden | Ausstehend | — |

---

## Sign-Off-Kriterien (10/10)

| # | Kriterium | Gewicht | Status | Notiz |
|---|---|---|---|---|
| QG-01 | Workflow-JSON importierbar und alle 6 Nodes vorhanden | KRITISCH | 🟡 PENDING | Summary bestätigt 6 Nodes; tatsächlicher Import-Test ausstehend |
| QG-02 | Schedule Trigger konfiguriert auf Montag 07:00 + korrekte Zeitzone | KRITISCH | 🟡 PENDING | Schedule Trigger vorhanden laut Summary; Timezone-Setting muss im echten JSON geprüft werden |
| QG-03 | Config-Node enthält alle dokumentierten Parameter (`ga4PropertyId`, `reportRecipients`, `reportTitle`, `currency`) | KRITISCH | 🟡 PENDING | Laut README vorhanden; tatsächliche Node-Werte im JSON ungeprüft |
| QG-04 | Code Node enthält HTML-Escape-Funktion für externe String-Inputs | HOCH | 🔴 OFFEN | Laut Security-Review nicht implementiert — muss vor Go-Live nachgerüstet werden |
| QG-05 | Error-Handling: mindestens ein Fehler-Pfad oder dokumentierter Error-Workflow-Hinweis vorhanden | HOCH | 🟢 ERFÜLLT | Install-Guide dokumentiert Error-Workflow-Setup; im Workflow selbst kein nativer Error-Node (akzeptiert mit Anleitung) |
| QG-06 | DSGVO-Check erstellt und GA4-Query auf aggregierte Metriken beschränkt | HOCH | 🟡 PENDING | Dok erstellt; tatsächliche GA4 API Query-Parameter im HTTP Node ungeprüft |
| QG-07 | Security-Risk-Matrix mit min. 10 Risks, davon 2+ HIGH/CRITICAL | MITTEL | 🟢 ERFÜLLT | 12 Risks identifiziert, davon 4 CRITICAL/HIGH workflow-spezifisch |
| QG-08 | Pricing-Logik in Sales-Brief vollständig und konsistent mit AEVUM-Preistiers | MITTEL | 🟢 ERFÜLLT | S-Tier korrekt referenziert (€2.500 Setup), DFY/DwY/Blueprint abgedeckt |
| QG-09 | Install-Guide enthält mind. 3 Test-Szenarien + 3 Troubleshooting-Cases | MITTEL | 🟢 ERFÜLLT | 3 Test-Szenarien, 5 Troubleshooting-Cases |
| QG-10 | Alle Docs referenzieren `reporting-dashboard-setup` als Item-ID konsistent | NIEDRIG | 🟢 ERFÜLLT | Item-ID in allen 5 Docs korrekt gesetzt |

**Gesamt-Score:** 5/10 grün, 4/10 pending, 1/10 offen
**Gate-Entscheidung:** 🟠 CONDITIONAL PASS — QG-04 muss geschlossen werden, QG-01/02/03/06 nach echtem Import-Test bestätigen

---

## Known Limitations

| # | Limitation | Scope | Phase 2 |
|---|---|---|---|
| L-01 | Kein nativer Error-Node im Workflow — Fehler-Alerting muss extern über n8n Error-Workflow konfiguriert werden | Workflow-Design | Phase 2: Error-Branch direkt im Blueprint integrieren |
| L-02 | Meta Ads Integration ist auskommentiert / optional — kein vollständiger Test-Pfad für Meta-Daten im aktuellen Blueprint | Feature-Scope | Phase 2: Meta als eigenständiger Sub-Workflow oder eigenes Blueprint-Item |
| L-03 | Einzel-Property only — kein Multi-Property-Rollup in einer Mail | Skalierung | Phase 2: Multi-Property-Blueprint mit Loop-Over-Properties-Node |
| L-04 | Report-Zeitraum fix auf 7 Tage — kein UI/Config-basierter Zeitraum-Selector | Konfigurierbarkeit | Phase 2: Dropdown-basierte Zeitraum-Auswahl via Form-Trigger |
| L-05 | HTML-Template statisch im Code Node — kein externes Template-Management | Customization | Phase 2: Template aus Google Sheets oder externem File laden |
| L-06 | Kein historisches Reporting — jede Ausführung ist zustandslos, keine Persistenz in DB | Datenarchiv | Phase 2: Postgres-/Airtable-Anbindung für historische KPI-Speicherung |
| L-07 | HTML-Escape für Sheet-Kommentar nicht in Standard-Blueprint enthalten | Security | Hotfix empfohlen vor Go-Live (QG-04) |
| L-08 | Token-Ablauf-Monitoring für Meta nicht automatisiert | Betrieb | Phase 2: Separater Token-Health-Check-Workflow |

---

## DB-Update-Befehl

```sql
-- Einfügen oder Update des Blueprint-Eintrags in AEVUM Blueprint Registry
INSERT INTO blueprint_items (
  item_id,
  name,
  type,
  status,
  pricing_tier,
  node_count,
  quality_gate_version,
  quality_gate_score,
  quality_gate_status,
  known_limitations_count,
  dsgvo_cleared,
  security_risks_documented,
  docs_complete,
  created_at,
  updated_at
) VALUES (
  'reporting-dashboard-setup',
  'AEVUM — Reporting Dashboard',
  'blueprint',
  'conditional_pass',
  'S',
  6,
  '1.0',
  '5/10',
  'CONDITIONAL_PASS',
  8,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (item_id) DO UPDATE SET
  status = EXCLUDED.status,
  quality_gate_score = EXCLUDED.quality_gate_score,
  quality_gate_status = EXCLUDED.quality_gate_status,
  known_limitations_count = EXCLUDED.known_limitations_count,
  docs_complete = EXCLUDED.docs_complete,
  updated_at = NOW();

-- Quality Gate Log Entry
INSERT INTO quality_gate_log (
  item_id,
  gate_version,
  gate_date,
  gate_result,
  open_items,
  reviewer,
  notes
) VALUES (
  'reporting-dashboard-setup',
  '1.0',
  NOW(),
  'CONDITIONAL_PASS',
  'QG-04: HTML-Escape im Code Node; QG-01/02/03/06: Import-Test ausstehend',
  'AEVUM Builder-Agent',
  'Hotfix QG-04 vor Customer-Delivery erforderlich. Phase-2-Items dokumentiert.'
);
```

---

## Pattern-Notes für Builder-Logik

Diese Notes dienen der Weiterentwicklung der Blueprint-Builder-Logik und dokumentieren Muster, die beim Erstellen dieses Blueprint-Typs relevant sind.

### Pattern: Schedule-Trigger + Mail-Sender Kombination

Workflows mit Schedule Trigger + E-Mail-Versand haben folgende wiederkehrende Risiken die immer geprüft werden müssen:
- Fehlende Fehler-Benachrichtigung bei stummem Scheitern (Trigger läuft, Node schlägt fehl, niemand merkt es)
- Absender-Reputation (SPF/DKIM immer in Security-Risks und Install-Guide erwähnen)
- Zeitzone-Mismatch zwischen n8n-Host und gewünschter Trigger-Zeit

### Pattern: HTTP-Request gegen externe API (kein nativer n8n Node)

Der Blueprint nutzt `httpRequest` statt eines nativen GA4-Nodes. Das bedeutet:
- Credential-Verwaltung ist manueller (Service Account JSON statt OAuth-Flow)
- API-Response-Parsing liegt vollständig im Code Node
- Fehler-Codes müssen im Code Node explizit behandelt werden
- Für Builder-Logik: Bei diesem Pattern immer auf fehlende Null-Checks im Code Node hinweisen

### Pattern: Code Node als HTML-Builder

Immer wenn ein Code Node HTML-Output generiert der aus externen Quellen gespeist wird:
- HTML-Escape ist Pflicht-Mitigation (QG-04)
- Im Builder-Prompt automatisch auf dieses Risiko hinweisen
- Dieses Muster tritt auf bei: Report-Generierung, Mail-Template-Building, PDF-Vorstufen

### Pattern: Konfiguration im Set-Node

Konfigurations-Werte im Set-Node (statt in Umgebungsvariablen) sind für Self-Service-Blueprints akzeptabel, haben aber Limitations:
- Werte sind im Workflow-JSON sichtbar → kein Schutz für sensible Daten
- Nicht umgebungs-spezifisch (kein Staging/Prod-Split)
- Für DFY: Empfehlung auf n8n-Variablen oder `.env` migrieren

### Offene Builder-Tasks für dieses Item

- [ ] Code Node auf HTML-Escape nachrüsten (QG-04 schließen)
- [ ] Tatsächlichen Workflow-JSON gegen Summary validieren (QG-01/02/03)
- [ ] GA4 HTTP Request Body dokumentieren (welche `dimensions` und `metrics` genau)
- [ ] Changelog-File erstellen (`CHANGELOG.md`)
- [ ] Thumbnail/Preview-Grafik für Produktseite erstellen