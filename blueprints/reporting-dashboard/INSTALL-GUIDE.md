# AEVUM Install-Guide — Reporting Dashboard Blueprint

**Blueprint:** `reporting-dashboard-setup`
**Geschätzte Setup-Zeit:** 60–90 Minuten (Self-Service) | 2h (DwY mit AEVUM)
**Schwierigkeit:** Mittel — technisches Grundverständnis für Service Accounts und n8n erforderlich

---

## Vorab-Check: Alles vorhanden?

Vor Start dieser Anleitung sicherstellen, dass alle Tools und Zugänge bereitstehen.

| Tool / Zugang | Spezifikation | Pflicht | Wo besorgen |
|---|---|---|---|
| n8n Instanz | v1.30+ (self-hosted oder Cloud) | Ja | [n8n.io](https://n8n.io) / eigener Server |
| Google Cloud Account | Kostenloser Account reicht | Ja | [console.cloud.google.com](https://console.cloud.google.com) |
| GA4 Property | Muss existieren, min. 7 Tage Daten | Ja | [analytics.google.com](https://analytics.google.com) |
| GA4 Property ID | Format: `123456789` (nur Zahlen) | Ja | GA4 Admin → Property Settings |
| Service Account JSON | Privater Schlüssel als .json-Datei | Ja | Wird in Schritt 2 erstellt |
| SMTP-Zugangsdaten oder Resend API Key | TLS-fähig, Port 587 oder 465 | Ja | Eigener Mailserver / [resend.com](https://resend.com) |
| Meta Business Manager (optional) | System User Token, nicht persönlicher Token | Optional | [business.facebook.com](https://business.facebook.com) |
| Google Sheets (optional) | Für manuelle KPI-Eingabe + Kommentarfeld | Empfohlen | Google Drive |

**Token-Specs:**
- **GA4 Service Account:** JSON-Key-Datei mit Feldern `private_key`, `client_email`, `project_id`
- **Meta System User Token:** Permissions `ads_read`, `business_management` — kein Ablauf bei System User (im Gegensatz zu User Access Token)
- **Resend API Key:** Format `re_XXXXX` — aus Resend Dashboard → API Keys

---

## Schritt 1: n8n absichern (Pflicht vor allem anderen)

Nur wenn noch nicht erledigt:

```bash
# docker-compose.yml — Pflicht-Umgebungsvariablen
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=<starkes-passwort>
  - N8N_ENCRYPTION_KEY=<32-byte-hex-zufallswert>
  - EXECUTIONS_DATA_PRUNE=true
  - EXECUTIONS_DATA_MAX_AGE=7
  - N8N_HOST=<deine-domain.de>
  - N8N_PROTOCOL=https
```

**Prüfen:** n8n unter `https://deine-domain.de` erreichbar, Login erforderlich. Wenn n8n Cloud: Region auf EU (Frankfurt) stellen — Settings → Organizational Settings.

---

## Schritt 2: Google Service Account erstellen

1. Öffne [Google Cloud Console](https://console.cloud.google.com)
2. Neues Projekt erstellen: Name z.B. `n8n-reporting-prod`
3. Suchleiste: `Analytics Data API` → **aktivieren**
4. Navigation: **IAM & Admin → Service Accounts**
5. Klick auf **"Service Account erstellen"**
   - Name: `n8n-reporting`
   - Rolle: **Viewer** (nicht mehr!)
   - Klick durch bis Fertig
6. Service Account anklicken → Tab **"Keys"** → **"Schlüssel hinzufügen" → JSON**
7. JSON-Datei wird heruntergeladen — **sicher aufbewahren, nicht in Git committen**

**Service Account zur GA4 Property hinzufügen:**
1. [analytics.google.com](https://analytics.google.com) → Admin → Property (die richtige auswählen)
2. **Property Access Management** → **"+"** oben rechts
3. E-Mail aus der JSON-Datei eintragen (Feld: `client_email`, Format: `n8n-reporting@projektname.iam.gserviceaccount.com`)
4. Rolle: **Analyst**
5. Einladung bestätigen — kein E-Mail-Bestätigungsschritt nötig, direkt aktiv

---

## Schritt 3: Credentials in n8n anlegen

### GA4 Service Account

1. n8n → **Settings → Credentials → "+ Credential"**
2. Suche nach: `Google Service Account`
3. JSON-Datei-Inhalt öffnen (Texteditor), folgende Felder eintragen:
   - **Service Account Email:** Wert aus `client_email`
   - **Private Key:** Wert aus `private_key` (inkl. `-----BEGIN RSA PRIVATE KEY-----` Header)
4. Credential speichern als `GA4 Reporting Service Account`

### SMTP / Resend

**Option A — Resend (empfohlen):**
1. "+ Credential" → `SMTP`
2. Host: `smtp.resend.com`, Port: `587`, Security: `STARTTLS`
3. User: `resend`, Password: `<dein-resend-api-key>`

**Option B — Eigener Mailserver:**
1. "+ Credential" → `SMTP`
2. Host + Port + TLS gemäß eigenem Mail-Provider
3. Sicherstellen: Port 587 oder 465, niemals Port 25

---

## Schritt 4: Workflow importieren

1. n8n → **Workflows → "+ Import"**
2. Blueprint-JSON-Datei auswählen (`reporting-dashboard-setup.json`)
3. Workflow erscheint im Editor
4. Noch **nicht aktivieren** — erst konfigurieren

---

## Schritt 5: Node "Set: Konfiguration" befüllen

Diesen Node öffnen (linker Klick → Edit). Folgende Felder setzen:

| Feld | Wert | Beispiel |
|---|---|---|
| `ga4PropertyId` | GA4 Property ID (nur Zahlen) | `123456789` |
| `reportRecipients` | JSON-Array mit E-Mail-Adressen | `["chef@firma.de","marketing@firma.de"]` |
| `reportTitle` | Name für den Report-Header | `Mein Unternehmen Weekly KPI` |
| `currency` | Währung für Ad-Spend-Anzeige | `EUR` |

**Empfohlen:** Empfänger als Env-Var auslagern (Security-Risiko #3):
```
{{ $env.N8N_REPORT_RECIPIENTS }}
```
Dann in `.env`: `N8N_REPORT_RECIPIENTS=chef@firma.de,marketing@firma.de`

---

## Schritt 6: Node "HTTP: GA4 Report" konfigurieren

1. Node öffnen → **Credential:** `GA4 Reporting Service Account` auswählen
2. URL prüfen: `https://analyticsdata.googleapis.com/v1beta/properties/{{ $json.ga4PropertyId }}:runReport`
3. Request-Body enthält Datumsbereich ��� Standard: letzte 7 Tage und Vergleichszeitraum davor. Für erstes Testing auf `last30Days` ändern falls Property noch jung ist.

---

## Schritt 7: Node "Email: Report versenden" konfigurieren

1. Node öffnen → **Credential:** zuvor angelegte SMTP-Credential auswählen
2. **From:** Absender-Adresse eintragen (muss zur SMTP-Domain passen)
3. **To:** `{{ $json.reportRecipients }}` — aus Konfiguration
4. **Subject:** `{{ $json.reportTitle }} | KW {{ $now.weekNumber }}`
5. **HTML-Body:** kommt aus Code Node — kein Eingriff nötig

---

## Schritt 8: Test-Run — 3 Szenarien

**Vor dem Test:** Schedule Trigger deaktivieren (damit kein ungewollter Montags-Versand). Stattdessen manuell triggern.

### Szenario A — Happy Path

1. Workflow manuell starten (▶ Button oben)
2. Prüfen: Alle Nodes Grün? Keine Fehler?
3. E-Mail im Postfach angekommen? Report sieht korrekt aus?
4. KPIs realistisch (keine Nullwerte, kein `undefined`)?

### Szenario B — GA4 Fehler simulieren

1. Im "Set: Konfiguration" Node: `ga4PropertyId` auf `000000000` (ungültige ID) setzen
2. Workflow starten
3. Erwartetes Verhalten: HTTP Node wirft Fehler, Workflow stoppt
4. Prüfen: Kommt eine Fehler-Notification? (Wenn Error-Workflow eingerichtet: ja)
5. Danach: Property ID wieder korrekt setzen

### Szenario C — Leere GA4-Daten

1. Zeitraum im GA4-Node auf `yesterday` → `yesterday` ändern (ein Tag, wahrscheinlich wenig Daten)
2. Workflow starten
3. Prüfen: Report enthält `0`-Werte statt `undefined`/`NaN`? Performance-Ampel zeigt "Rot"?
4. Zeitraum danach zurück auf Standard setzen

---

## Schritt 9: Workflow aktivieren

1. Alle Test-Szenarien erfolgreich? Checklist aus Security und DSGVO abgehakt?
2. Schedule Trigger Node prüfen: **"Montag, 07:00 Uhr"** — Timezone korrekt? (Standard: UTC — ggf. auf `Europe/Berlin` anpassen)
3. Workflow oben rechts auf **"Aktiv"** setzen (Toggle)
4. Bestätigen: Workflow erscheint in Workflows-Liste mit grünem Status

**Nächster regulärer Lauf:** Kommenden Montag 07:00 Uhr. Zur Kontrolle: n8n → Workflow → Executions zeigt nächsten geplanten Lauf.

---

## Schritt 10: Monitoring einrichten

Minimales Monitoring ohne Extra-Tools:

1. **n8n Executions Log** wöchentlich prüfen (montags nach Report-Versand): n8n → Workflow → Executions — letzter Eintrag grün?
2. **E-Mail-Empfang prüfen:** Erster Montag nach Go-Live — Report angekommen?

Empfohlenes Monitoring mit Error-Workflow:

1. Neuen n8n-Workflow erstellen: "Error Handler"
2. Trigger: **"n8n Trigger (Error Trigger)"**
3. Node: E-Mail oder Slack-Nachricht → "Workflow [Name] fehlgeschlagen: {{ $json.execution.error.message }}"
4. Diesen Error-Workflow in den Workflow-Settings des Report-Workflows als "Error Workflow" eintragen

---

## Troubleshooting

### Problem 1: GA4 gibt 403 PERMISSION_DENIED zurück

**Ursache:** Service Account wurde der GA4 Property nicht hinzugefügt, oder falsche Property ID.

**Lösung:**
1. GA4 Admin → Property Access Management → Service Account E-Mail vorhanden?
2. Property ID prüfen: Nur die Zahlen, kein `properties/` Prefix
3. Google Cloud Console: Analytics Data API aktiviert?
4. Wartezeit: Nach Hinzufügen des Service Accounts kann es 5–10 Minuten dauern

### Problem 2: E-Mails landen im Spam-Ordner

**Ursache:** SPF/DKIM nicht konfiguriert, oder Absender-Domain hat schlechte Reputation.

**Lösung:**
1. SPF-Record prüfen: `dig TXT deine-domain.de` — enthält `v=spf1`?
2. Resend.com nutzen: DKIM ist automatisch konfiguriert
3. Absender-Adresse auf bestehende Domain-Adresse setzen (nicht `noreply@gmail.com`)
4. Test mit [mail-tester.com](https://mail-tester.com)

### Problem 3: Report enthält Nullwerte oder `undefined`

**Ursache:** GA4 Property hat weniger als 7 Tage Daten, oder Metriken-Namen stimmen nicht mit GA4-Konfiguration überein.

**Lösung:**
1. Im GA4 Node: Zeitraum auf `last30Days` stellen für ersten Test
2. GA4 Realtime-Report prüfen: Kommen überhaupt Events an?
3. Im Code Node: `console.log(JSON.stringify($input.all()))` am Anfang einfügen, Execution Log prüfen
4. Metriken-Namen gegen [GA4 Metrics Reference](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema) abgleichen

### Problem 4: Meta Ads Node schlägt fehl

**Ursache:** Access Token abgelaufen (User Token: 60 Tage) oder falsche Permissions.

**Lösung:**
1. Meta Business Manager → System Users → System User Access Token generieren (kein Ablaufdatum)
2. Permissions: `ads_read`, `business_management`
3. Im HTTP Node: Authorization Header `Bearer <token>` prüfen
4. Testweise: Meta-Abschnitt im Code Node auskommentieren, Rest des Reports ohne Meta-Daten laufen lassen

### Problem 5: Schedule Trigger läuft zur falschen Zeit

**Ursache:** n8n läuft in UTC, Konfiguration war auf lokale Zeit bezogen.

**Lösung:**
```bash
# n8n Timezone in Env-Vars setzen
GENERIC_TIMEZONE=Europe/Berlin
```
Schedule Trigger Einstellung: "07:00" in der konfigurierten Timezone.

---

## Wartung-Schedule

| Aufgabe | Intervall | Aufwand |
|---|---|---|
| Service Account JSON-Key rotieren | Alle 90 Tage | 15 Min |
| Meta System User Token prüfen (falls aktiv) | Monatlich | 5 Min |
| n8n Execution Logs manuell prüfen | Wöchentlich | 2 Min |
| n8n Updates einspielen | Bei Minor Releases (~monatlich) | 30 Min |
| SMTP/Resend Zustellung prüfen (Bounce-Rate) | Monatlich | 5 Min |
| GA4-Metriken-Konfiguration prüfen | Bei GA4-Property-Änderungen | 30 Min |
| KPI-Schwellenwerte anpassen | Quartalsweise | 15 Min |

---

## DFY-Alternative

Wer den Setup nicht selbst durchführen möchte:

**AEVUM Done-for-You (S-Tier)** übernimmt:
- Komplettes Setup nach dieser Anleitung
- Service Account erstellen und sichern
- n8n-Instanz absichern (Reverse Proxy, Auth, Encryption Key)
- SMTP/Resend konfigurieren inkl. DKIM-Test
- Error-Workflow implementieren
- Erste Testläufe und Kalibrierung
- Übergabe-Session (30 Min) mit Erklärung aller Nodes
- 4 Wochen Hypercare (Fehler werden innerhalb 24h behoben)

**Kontakt:** Über AEVUM-Onboarding-Formular — Angabe: Blueprint `reporting-dashboard-setup`, gewünschter Go-Live-Termin.