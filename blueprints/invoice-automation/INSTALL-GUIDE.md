# Invoice-Automation Blueprint — Install-Guide

> Zielgruppe: Technical Customer (IT-affin) oder AEVUM-Techniker bei DFY  
> Zeitaufwand: 2–4 Stunden für Self-Service-Setup

---

## Vorab-Check

Alle Voraussetzungen müssen vor Schritt 1 erfüllt sein.

### Tool- und Account-Tabelle

| Tool / Account | Mindestversion / Spec | Prüfung | Status |
|---|---|---|---|
| n8n-Instanz (Self-Hosted oder Cloud) | ≥ 1.40.0 | `n8n --version` oder n8n-UI → Einstellungen → Info | ☐ |
| Anthropic API-Account | Aktiv, Kreditkarte hinterlegt, API-Key generiert | console.anthropic.com → API Keys | ☐ |
| Anthropic Credit-Balance | Mindestens $5 für Testphase (Haiku: ~$0,25/1M Token Input) | console.anthropic.com → Usage | ☐ |
| Google-Account mit Sheets-Zugriff | Google Workspace oder privater Account | Ziel-Spreadsheet angelegt und ID notiert | ☐ |
| SMTP-Zugang | Funktionsfähig; App-Passwort bei Gmail erforderlich | Test-Mail senden | ☐ |
| Slack-Workspace | Bot-App installiert, Scope `chat:write` | Slack → Apps → Bot-Token kopiert | ☐ |
| n8n-Instanz mit HTTPS | TLS-Zertifikat aktiv | Browser-Adressleiste: Schloss-Symbol | ☐ |
| DATEV-Kontenrahmen (SKR03 oder SKR04) | Kontonummern schriftlich vom Steuerberater bestätigt | Konten für Debitor + Vorsteuer notiert | ☐ |

### Token / Key-Spezifikationen

| Credential | Format | Woher | Hinweis |
|---|---|---|---|
| Anthropic API Key | `sk-ant-api03-...` (ca. 100 Zeichen) | console.anthropic.com → API Keys → Create Key | Nur einmal sichtbar — sofort sichern |
| Google OAuth2 | OAuth2-Flow in n8n | n8n → Credentials → Google Sheets OAuth2 → Authorize | Redirect-URI muss in Google Console eingetragen sein |
| Slack Bot Token | `xoxb-...` | api.slack.com → Your Apps → OAuth & Permissions | Scope: `chat:write` mindestens |
| Slack Channel ID | `C0123456789` (9–11 Zeichen) | Slack → Kanal → Rechtsklick → "Link kopieren" → ID am Ende der URL | Nicht der Kanal-Name |
| Webhook Auth-Token | 32 Hex-Zeichen (selbst generiert) | `openssl rand -hex 16` | In Formular/aufrufendem System als Header hinterlegen |

---

## Schritt 1: n8n-Instanz vorbereiten

1. Sicherstellen, dass n8n-Version ≥ 1.40.0 läuft.
2. HTTPS aktiv und HTTP deaktiviert (siehe Security-Risks S-12).
3. Execution-History-Pruning konfigurieren:

```env
# In .env-Datei der n8n-Instanz hinzufügen:
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=7
EXECUTIONS_DATA_PRUNE_MAX_COUNT=5000
```

4. n8n neu starten: `docker restart n8n` oder entsprechender Service-Restart.
5. n8n-UI öffnen und mit Admin-Account einloggen.

---

## Schritt 2: Workflow importieren

1. n8n-UI → linkes Menü → **Workflows** → **Import from File**
2. `workflow.json` aus Blueprint-Paket auswählen → **Import**
3. Workflow öffnet sich im Editor. Noch **nicht aktivieren** — erst alle Konfigurationen abschließen.
4. Workflow-Name prüfen: sollte "Invoice-Automation (AEVUM Blueprint)" lauten.

> 🟡 Falls Nodes mit orangenen Warndreiecken erscheinen: normal bei noch nicht konfigurierten Credentials — wird in den folgenden Schritten behoben.

---

## Schritt 3: Credentials anlegen

Für jeden Credential-Typ: n8n-UI → **Credentials** → **Add Credential**

### 3a. Anthropic API
- Typ: **Anthropic**
- Name: z.B. `Anthropic Production`
- API Key: `sk-ant-api03-...`
- Speichern und Verbindung testen.

### 3b. Google Sheets OAuth2
- Typ: **Google Sheets OAuth2 API**
- Name: z.B. `Google Sheets Production`
- OAuth2-Flow durchlaufen → Google-Account autorisieren
- Redirect-URI: `https://n8n.deine-domain.de/rest/oauth2-credential/callback`

> 🟡 Bei Google Workspace: sicherstellen, dass OAuth-Consent-Screen konfiguriert ist und die n8n-Redirect-URI in Google Cloud Console unter "Autorisierte Weiterleitungs-URIs" eingetragen ist.

### 3c. SMTP / E-Mail
- Typ: **SMTP**
- Name: z.B. `SMTP Buchhaltung`
- Host, Port, User, Passwort gemäß Provider
- Bei Gmail: App-Passwort verwenden (kein normales Passwort)

### 3d. Slack OAuth2
- Typ: **Slack OAuth2 API**
- Name: z.B. `Slack Alerts`
- OAuth-Flow: Slack-App aus Workspace autorisieren
- Scope `chat:write` bestätigen

---

## Schritt 4: Workflow-Nodes konfigurieren

Jeden Node mit `{{INDIVIDUELL: ...}}`-Platzhalter öffnen und befüllen:

### Node: "Webhook: Rechnungseingang"
- **HTTP Method:** POST
- **Path:** `invoice-upload` (oder frei wählbar — dieser Pfad ist die finale URL: `https://n8n.deine-domain.de/webhook/invoice-upload`)
- **Authentication:** Header Auth → Header Name: `X-Invoice-Token` → Value: generierter Token
- Credential: Webhook Auth Token notieren für aufrufende Systeme

### Node: "Claude: Rechnungsdaten extrahieren" (HTTP-Request-Node)
- **Credential:** Anthropic API → `Anthropic Production`
- URL: `https://api.anthropic.com/v1/messages`
- Prompt-Parameter: bereits im Workflow hinterlegt; nur Credential zuweisen

### Node: "Google Sheets: Rechnung protokollieren"
- **Credential:** `Google Sheets Production`
- **Spreadsheet ID:** `{{INDIVIDUELL: google-spreadsheet-id}}` → aus Google-Sheets-URL entnehmen
- **Sheet Name:** z.B. `Eingangsrechnungen` (Tabellenblatt muss existieren)
- **Operation:** Append Row

### Node: "Google Sheets: Fehler protokollieren"
- Identisch mit obigem, aber ggf. anderes Tabellenblatt: z.B. `Fehler & Manuelle Prüfung`

### Node: "E-Mail: Export-Summary an Buchhaltung"
- **Credential:** `SMTP Buchhaltung`
- **To:** `buchhaltung@deine-domain.de`
- **From:** `n8n-automation@deine-domain.de`

### Node: "Slack: Alert – manuelle Prüfung nötig"
- **Credential:** `Slack Alerts`
- **Channel:** Slack-Kanal-ID (z.B. `C0123456789`)
- **Text:** Rechnungsnummer + Freigabe-Link (kein Betrag, keine PII — siehe Security-Risk #3)

### Node: "Error Handler: Kritischer Fehler"
- **Credential:** `Slack Alerts`
- **Channel:** Identisch oder separater #alerts-kritisch-Kanal
- **Text:** Fehlermeldung + Workflow-Execution-ID

### Node: "Code: DATEV-CSV erzeugen"
Folgende Werte in den Code-Node-Variablen am Anfang setzen:

```javascript
const DATEV_KONTO_DEBITOR = "70000";      // Mit Steuerberater abstimmen
const DATEV_GEGENKONTO_VORSTEUER = "1576"; // SKR04; bei SKR03: "1406"
```

---

## Schritt 5: Google-Sheets-Struktur anlegen

Die Ziel-Tabelle muss folgende Spaltenheader im angegebenen Tabellenblatt haben (Zeile 1):

**Tabellenblatt "Eingangsrechnungen":**
```
Eingang_Datum | Rechnungsnummer | Lieferant | Rechnungsdatum | Faelligkeitsdatum | Netto | MwSt_Satz | Brutto | IBAN | Verwendungszweck | Status | Fehler_Hinweis | Execution_ID
```

**Tabellenblatt "Fehler & Manuelle Prüfung":**
```
Eingang_Datum | Rechnungsnummer | Lieferant | Brutto | Fehler_Typ | Freigabe_URL | Status | Bearbeitet_von | Bearbeitet_am
```

---

## Schritt 6: Test-Run — 3 Szenarien

Workflow **nicht aktivieren** — Test über n8n-UI → **Execute Workflow** (manuell triggern).

### Szenario 1: Valide Rechnung (Happy Path)

Test-PDF: Eine klar lesbare Musterrechnung mit allen Pflichtfeldern.

```bash
curl -X POST https://n8n.deine-domain.de/webhook-test/invoice-upload \
  -H "X-Invoice-Token: DEIN-WEBHOOK-TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@muster-rechnung.pdf"
```

**Erwartetes Ergebnis:**
- Claude extrahiert alle Felder korrekt
- Plausibilitätsprüfung: grün
- DATEV-CSV wird erzeugt (im Node-Output sichtbar)
- Eintrag in Google Sheets "Eingangsrechnungen" erscheint
- E-Mail-Summary an Buchhaltung empfangen
- Webhook Response: `{"status": "success"}`

### Szenario 2: Fehlerhafte Rechnung (Routing zu manueller Prüfung)

Test-PDF: Rechnung mit fehlendem Fälligkeitsdatum oder falschem MwSt-Satz (z.B. Brutto ≠ Netto × 1,19).

**Erwartetes Ergebnis:**
- Plausibilitätsprüfung schlägt fehl
- Slack-Alert in konfiguriertem Kanal mit Freigabe-Link
- Eintrag in Google Sheets "Fehler & Manuelle Prüfung"
- Webhook Response: `{"status": "manual_review_required", "url": "..."}`

### Szenario 3: Kritischer Fehler (Error-Handler)

Test: API-Key temporär ungültig machen oder Netzwerk zum Anthropic-Endpunkt blockieren.

**Erwartetes Ergebnis:**
- Error-Handler-Node wird getriggert
- Slack-Alert im #kritisch-Kanal mit Fehlermeldung und Execution-ID
- Execution in n8n-UI als "Error" markiert

---

## Schritt 7: Workflow aktivieren

1. Alle 3 Test-Szenarien erfolgreich abgeschlossen: ✓
2. Security-Checkliste (aus SECURITY-RISKS.md) abgezeichnet: ✓
3. DSGVO-Checkliste (aus DSGVO-CHECK.md) abgezeichnet: ✓
4. n8n-UI → Workflow öffnen → Toggle oben rechts: **Inactive → Active**
5. Webhook-URL des aktiven Workflows notieren (unterscheidet sich vom Test-Webhook):
   - Test: `https://n8n.../webhook-test/invoice-upload`
   - Produktion: `https://n8n.../webhook/invoice-upload`
6. Produktions-URL in aufrufendem System/Formular eintragen.

---

## Schritt 8: Monitoring einrichten

| Monitoring-Punkt | Methode | Frequenz |
|---|---|---|
| Workflow-Executions | n8n-UI → Executions → Fehler-Filter | Täglich |
| Google-Sheets-Protokoll | Manuelle Sichtprüfung auf fehlende Einträge | Wöchentlich |
| Slack-Alert-Kanal | Regelmäßige Kontrolle offener Freigabe-Anfragen | Täglich (Buchhaltung) |
| Anthropic API-Credits | console.anthropic.com → Usage | Monatlich |
| n8n-Instanz-Uptime | Uptime-Monitor (UptimeRobot, Checkly o.ä.) | Kontinuierlich |
| SSL-Zertifikat | Ablaufdatum prüfen | Monatlich |

---

## Troubleshooting

### Problem 1: Claude gibt leeres oder fehlerhaftes JSON zurück

**Symptom:** Code-Node "Extraktion parsen" wirft Fehler `Cannot read property 'rechnungsnummer' of undefined`

**Ursachen & Lösung:**
- PDF-Qualität zu schlecht (Scan-Artifacts): Manuell prüfen, ob PDF lesbar ist
- Anthropic-API-Timeout: Haiku-Modell wechseln auf Sonnet für komplexe Layouts
- Prompt zu restriktiv: Im HTTP-Request-Node den System-Prompt prüfen; sicherstellen, dass JSON-Ausgabe-Format explizit verlangt wird
- API-Credit-Limit erreicht: console.anthropic.com prüfen

### Problem 2: Google Sheets schreibt nicht

**Symptom:** Node "Google Sheets: Rechnung protokollieren" zeigt Fehler `403 Forbidden` oder `The caller does not have permission`

**Lösung:**
- OAuth-Token ist abgelaufen: Credential in n8n erneut autorisieren
- Google-Sheet-ID falsch: URL `spreadsheets/d/HIER-DIE-ID/edit` — exakt die ID zwischen `/d/` und `/edit`
- Tabellenblatt-Name stimmt nicht exakt überein (Groß-/Kleinschreibung beachten)
- Service-Account (falls genutzt) hat keine Schreibberechtigung auf das Sheet

### Problem 3: Slack-Alert kommt nicht an

**Symptom:** Slack-Node zeigt grün, aber keine Nachricht im Kanal

**Lösung:**
- Kanal-ID (nicht Kanal-Name) prüfen: `C0123456789` Format
- Bot ist nicht Mitglied des Kanals: Slack → Kanal → Integrationen → Bot hinzufügen
- Scope `chat:write` fehlt: Slack-App → OAuth & Permissions → Scopes neu installieren

### Problem 4: Webhook antwortet mit 404

**Symptom:** `curl`-Test gibt `{"message":"Not found"}` zurück

**Lösung:**
- Workflow nicht aktiv: Toggle auf "Active" setzen
- Test-URL statt Produktions-URL verwendet: `/webhook-test/` vs. `/webhook/`
- Webhook-Pfad falsch: In n8n-Node nachsehen, welcher Pfad tatsächlich konfiguriert ist

### Problem 5: DATEV-CSV-Import schlägt fehl

**Symptom:** DATEV meldet Formatfehler beim Import des Buchungsstapels

**Lösung:**
- Zeichencodierung: DATEV erwartet CP1252 (Windows-1252), nicht UTF-8; Code-Node ggf. anpassen
- Datumsformat: DATEV Buchungsstapel erwartet `DDMM` (vierstellig ohne Jahr) für Belegdatum
- Kontonummern: Führende Nullen prüfen; mit Steuerberater abgleichen
- Dezimaltrennzeichen: DATEV erwartet Komma, nicht Punkt

---

## Wartung-Schedule

| Aufgabe | Frequenz | Wer |
|---|---|---|
| Execution-Log-Review (Fehler) | Wöchentlich | Customer IT / Buchhaltung |
| Google-Sheets-Stichproben-Audit (Duplikate, Ausreißer) | Monatlich | Buchhaltung |
| Anthropic-API-Credit-Check | Monatlich | Customer IT |
| OAuth-Token-Gültigkeit prüfen (Google, Slack) | Quartalsweise | Customer IT |
| n8n-Update (Patch-Releases) | Quartalsweise | Customer IT |
| DATEV-Konten-Konfiguration mit Steuerberater reviewen | Jährlich (Jahresabschluss) | Customer + Steuerberater |
| SSL-Zertifikat-Renewal | Vor Ablauf (Let's Encrypt: 90 Tage) | Customer IT |
| DPA-Aktualität prüfen (Anthropic, Google, Slack) | Jährlich | Datenschutzbeauftragter / Customer |

---

## DFY-Alternative

Wer den Setup nicht selbst durchführen möchte oder Zeit sparen will:

**AEVUM DFY-Setup (S-Tier):**
- Einrichtung in bestehender oder neuer n8n-Instanz
- Credential-Setup inkl. Webhook-Auth-Token-Generierung
- DATEV-Konto-Abstimmung mit Steuerberater (koordiniert)
- Drei Test-Szenarien durchgeführt und dokumentiert
- Übergabe-Call + 30-Tage-Hypercare (E-Mail-Support)
- **Preis:** €3.500–€6.000 Setup + €1.200–€1.800/Mo

Kontakt: [AEVUM-Kontaktkanal eintragen]