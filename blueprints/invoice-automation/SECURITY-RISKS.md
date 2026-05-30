# Invoice-Automation Blueprint — Security Risk Matrix

> Gilt für: `invoice-automation` Blueprint v1.x  
> Bewertungsschema: 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | **LLM-Halluzination bei Rechnungsfeldern** — Claude extrahiert falschen Betrag, falsche IBAN oder falsche Rechnungsnummer; fehlerhafte Buchung im DATEV-Export | 🟠 HIGH | Pflicht-Rechenprüfung (Brutto = Netto × (1+MwSt)), Duplikat-Check, Ausreißer-Routing zu manuellem Review | Manuellen Review-Schritt niemals deaktivieren; Stichproben-Audit der LLM-Ausgaben monatlich |
| 2 | **Webhook ohne Authentifizierung erreichbar** — Webhook-Endpunkt ist öffentlich; jeder kann PDFs einspeisen, Daten einschleusen oder DoS auslösen | 🔴 CRITICAL | Webhook-Auth (Header-Token oder HTTP Basic Auth) aktivieren; Rate-Limiting auf n8n-Ebene oder vorgelagertem Reverse Proxy | Webhook-URL niemals öffentlich teilen; Auth-Token in Secrets verwalten |
| 3 | **PII in Slack-Alerts** — Rechnungsdaten (Lieferantenname, Betrag, ggf. IBAN) werden im Klartext an Slack gesendet | 🟠 HIGH | Slack-Payload auf Identifier (Rechnungsnummer, ID) reduzieren; vollständige Daten nur über Freigabe-URL (n8n-intern) bereitstellen | Slack-Kanal auf "privat" setzen; nur Buchhaltungsteam als Mitglied |
| 4 | **API-Key-Exposition (Anthropic)** — API-Key in n8n-Credential oder Code-Node hardcoded; bei Backup-Export oder Workflow-Share exponiert | 🔴 CRITICAL | Ausschließlich n8n-Credential-Store verwenden; niemals API-Keys in Code-Nodes oder Set-Nodes schreiben; n8n-Instanz-Backups verschlüsseln | Workflow.json vor Weitergabe auf hardcodierte Secrets prüfen; Key-Rotation bei Verdacht |
| 5 | **Rechnungs-PDFs als temporäre Binary-Daten in n8n-Memory** — PDFs (mit PII: Name, Adresse, IBAN, Beträge) liegen während der Ausführung im n8n-Execution-Speicher und ggf. in Execution-History | 🟠 HIGH | Execution-Data-Pruning aktivieren (n8n-Setting: Execution-History auf max. 7 Tage, danach auto-delete); keine Execution-History auf Produktions-Instanz dauerhaft speichern | n8n `EXECUTIONS_DATA_PRUNE=true` setzen; Retention auf ≤ 7 Tage konfigurieren |
| 6 | **Google Sheets als unkontrolliertes Daten-Repository** — Alle Rechnungsdaten (inkl. IBAN, Beträge) landen in Google Sheets; Sharing-Einstellungen können unbeabsichtigt öffentlich gesetzt werden | 🟡 MEDIUM | Sheets auf "Nur bestimmte Personen" einschränken; Google Workspace mit DLP-Policy; kein öffentlicher Link | Sheets-Berechtigungen quartalsweise prüfen; kein "Jeder mit Link kann bearbeiten" |
| 7 | **DATEV-CSV ohne Integritätsprüfung** — Erzeugte CSV könnte manipulierte Buchungssätze enthalten, falls Eingabedaten nicht ausreichend sanitisiert werden | 🟡 MEDIUM | Input-Sanitization im Code-Node (keine CSV-Injection via Sonderzeichen wie `=`, `+`, `-`, `@` am Feldanfang); Betrag-Felder als Number validieren | CSV vor DATEV-Import manuell spot-checken; DATEV-Importprotokoll auf Fehler prüfen |
| 8 | **E-Mail-Trigger als Angriffsfläche** — Falls E-Mail-Trigger aktiviert: präparierte PDFs oder Mails mit Malware-Anhang können den Workflow triggern | 🟠 HIGH | E-Mail-Trigger nur für dediziertes, internes Postfach (nicht Sammelpostfach); MIME-Type-Check vor PDF-Verarbeitung; Dateigrößen-Limit setzen | Dediziertes Postfach nur intern bekannt; SPF/DKIM/DMARC für eingehende Domain prüfen |
| 9 | **Fehlende DATEV-Konto-Validierung** — Falsch konfigurierte Kontonummern (Debitor, Vorsteuer) führen zu fehlerhaften Buchungen, die erst beim Steuerberater auffallen | 🟡 MEDIUM | Kontonummern vor Go-Live mit Steuerberater schriftlich bestätigen; Konfigurationsdatei versionieren | Konfigurierte Konten in DATEV-Testmandant prüfen vor Produktivsetzung |
| 10 | **Duplikat-Check nur via Rechnungsnummer** — Lieferanten ohne standardisierte Rechnungsnummern oder Tippfehler in Rechnungsnummern umgehen den Duplikat-Check | 🟡 MEDIUM | Zusätzlicher Check auf Kombination (Lieferant + Betrag + Datum) als Fuzzy-Match im Code-Node empfohlen | Monatliche Stichproben im Google-Sheets-Protokoll auf Duplikate |
| 11 | **Freigabe-URL ohne Ablaufzeit** — Manuell zu prüfende Rechnungen erhalten eine Freigabe-URL; falls diese nicht zeitlich begrenzt ist, bleibt sie dauerhaft aktiv | 🟡 MEDIUM | Freigabe-URLs mit UUID + Timestamp generieren; Ablaufzeit von 24–48h implementieren (Wait-Node-Timeout oder Token-Validierung) | Offene Freigabe-Links regelmäßig im Protokoll prüfen; nie per unverschlüsselter Mail weiterleiten |
| 12 | **n8n-Instanz ohne TLS/HTTPS** — Webhook-Endpunkt über HTTP erreichbar; Rechnungsdaten (PII) werden unverschlüsselt übertragen | 🔴 CRITICAL | n8n ausschließlich hinter HTTPS (TLS 1.2+) betreiben; Let's Encrypt oder organisationseigenes Zertifikat; kein HTTP-Endpunkt in Produktion | SSL-Zertifikat-Gültigkeit monitoren; Auto-Renewal prüfen |

---

## Pflicht-Mitigations (MÜSSEN vor Go-Live umgesetzt sein)

### 1. Webhook-Authentifizierung aktivieren

In n8n Webhook-Node → Authentication → "Header Auth" oder "Basic Auth":

```
Header Name:  X-Invoice-Token
Header Value: <zufälliger 32-Zeichen-Token, z.B. via openssl rand -hex 16>
```

Aufrufender Client (Formular/System) muss diesen Header bei jedem Request mitsenden.

```bash
# Token generieren (Beispiel):
openssl rand -hex 16
# Ausgabe: a3f9e2b1c4d5e6f7a8b9c0d1e2f3a4b5
```

### 2. API-Keys ausschließlich in n8n-Credential-Store

Niemals in Code-Node, Set-Node oder Workflow-Variablen:

```javascript
// FALSCH — niemals so:
const apiKey = "sk-ant-api03-...";

// RICHTIG — über Credential-Referenz im HTTP-Request-Node:
// Authentication: "Predefined Credential Type" → Anthropic API
```

### 3. Execution-History-Pruning konfigurieren

In n8n-Instanz-Konfiguration (`.env` oder n8n-Settings):

```env
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=7
EXECUTIONS_DATA_PRUNE_MAX_COUNT=5000
```

### 4. HTTPS erzwingen

```nginx
# nginx-Beispiel: HTTP → HTTPS Redirect
server {
    listen 80;
    server_name n8n.deine-domain.de;
    return 301 https://$host$request_uri;
}
```

### 5. CSV-Injection verhindern

Im Code-Node "DATEV-CSV erzeugen" — jedes Textfeld sanitisieren:

```javascript
function sanitizeCsvField(value) {
  if (typeof value !== 'string') return value;
  // CSV-Injection: Felder die mit =, +, -, @, Tab, CR beginnen, in Anführungszeichen
  if (/^[=+\-@\t\r]/.test(value)) {
    return `"'${value}"`;
  }
  return value;
}
```

---

## Empfohlene Mitigations (stark empfohlen, kein Blocker)

- **Slack-Payload minimieren:** In Slack-Alert-Node nur Rechnungsnummer + Freigabe-URL senden, keine Beträge oder Personendaten im Klartext.
- **Dateigrößen-Limit am Webhook:** Max. 10 MB pro Request konfigurieren (nginx: `client_max_body_size 10m`).
- **Dediziertes Google-Service-Account** statt persönlichem OAuth für Google Sheets — verhindert Zugriffsverlust bei Mitarbeiterwechsel.
- **Fuzzy-Duplikat-Check:** Kombination aus Lieferantenname (normalisiert) + Nettobetrag + Rechnungsdatum als sekundärer Duplikat-Check.
- **Freigabe-URLs mit Ablaufzeit** versehen: Token im Set-Node mit `expiresAt = now + 48h` erzeugen; im Freigabe-Handler prüfen.
- **n8n-Audit-Logs aktivieren** (Enterprise oder Self-Hosted mit Logging-Config) für Nachvollziehbarkeit.

---

## Was AEVUM bei DFY zusätzlich macht

- Webhook-Auth-Token wird generiert, sicher hinterlegt und Customer übergeben (nicht per E-Mail im Klartext)
- n8n-Instanz-Hardening-Check: HTTPS, Pruning, kein Admin-Account ohne MFA
- Google-Service-Account-Setup statt persönlichem OAuth
- Slack-Payload-Review und Minimierung vor Go-Live
- DATEV-Konten-Konfiguration wird schriftlich vom Steuerberater bestätigt und dokumentiert
- Initialer Test mit synthetischen Rechnungen (nicht mit echten Kundendaten)
- Security-Checkliste wird gemeinsam mit Customer abgenommen

---

## Known Limits (nicht durch Mitigation behebbar)

- **LLM-Fehlerrate:** Claude 3 Haiku hat bei schlechter PDF-Qualität (Scan-Artifacts, nicht-standardisierte Layouts) eine messbare Fehlerrate von 5–15 %. Kein Workflow kann das vollständig eliminieren — daher ist der manuelle Review-Pfad keine optionale Komponente.
- **DATEV-CSV ist kein direkter API-Push:** Import bleibt ein manueller Schritt. Fehler im DATEV-Import-Protokoll werden nicht zurück an n8n gemeldet.
- **Anthropic-Abhängigkeit:** Bei Anthropic-API-Ausfall stoppt die Extraktion. Kein Fallback-LLM im Blueprint (wäre M-Tier-Erweiterung).
- **Kein Signatur-Check auf PDFs:** Der Workflow prüft nicht, ob ein PDF digital signiert oder manipuliert wurde. Für Hochsicherheitsumgebungen unzureichend.

---

## Sign-Off-Checkliste (Security)

| # | Kriterium | Verantwortlich | Status |
|---|---|---|---|
| S-01 | Webhook-Auth-Token konfiguriert und getestet | Customer / AEVUM DFY | ☐ |
| S-02 | HTTPS auf n8n-Instanz aktiv, HTTP deaktiviert | Customer IT / AEVUM DFY | ☐ |
| S-03 | Keine hardcodierten API-Keys in Workflow-JSON | AEVUM Review | ☐ |
| S-04 | Execution-History-Pruning aktiviert (≤ 7 Tage) | Customer IT | ☐ |
| S-05 | Google-Sheets-Berechtigungen auf interne Nutzer beschränkt | Customer | ☐ |
| S-06 | Slack-Kanal privat, nur Buchhaltungsteam | Customer | ☐ |
| S-07 | CSV-Injection-Sanitization im Code-Node implementiert | AEVUM Review | ☐ |
| S-08 | DATEV-Konten schriftlich vom Steuerberater bestätigt | Customer | ☐ |
| S-09 | Test mit synthetischen Rechnungen erfolgreich | Customer / AEVUM | ☐ |
| S-10 | E-Mail-Trigger (falls aktiv): dediziertes Postfach, kein Sammelpostfach | Customer | ☐ |