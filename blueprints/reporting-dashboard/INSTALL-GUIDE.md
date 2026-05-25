# AEVUM Install Guide — Reporting Dashboard Blueprint

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