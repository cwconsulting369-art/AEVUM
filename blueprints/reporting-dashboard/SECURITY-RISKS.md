# AEVUM Security Risk Matrix — Reporting Dashboard Blueprint

**Blueprint:** `reporting-dashboard-setup`
**Workflow-Typ:** Scheduled Data Aggregation + HTML Mail Dispatch
**Bewertungs-Datum:** 2026
**Reviewer:** AEVUM Builder-Agent

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | Service Account JSON mit privatem Schlüssel in n8n Credential Store — bei kompromittiertem n8n-Server vollständiger GA4-Lesezugriff | 🔴 HIGH | Service Account auf minimale Berechtigungen beschränken (Analyst-Rolle, kein Editor), JSON-Key rotieren alle 90 Tage | Service Account-Rotation als Kalender-Reminder einrichten; n8n Credential Store mit Encryption Key sichern |
| 2 | E-Mail-Report enthält echte Unternehmens-KPIs (Umsatz-Proxys, Ad-Spend, Conversion-Daten) — unverschlüsselter SMTP-Versand = Klartext im Transit | 🔴 HIGH | Ausschließlich TLS-gesicherte SMTP-Verbindung (Port 587 STARTTLS oder 465 SSL); Resend.com als Alternative mit erzwungenem TLS | SMTP-Konfiguration auf TLS prüfen; keine KPI-Reports über Port 25 oder unverschlüsseltes SMTP |
| 3 | Empfänger-Array im "Set: Konfiguration" Node hardcoded — bei Workflow-Export oder unbefugtem n8n-Zugriff sichtbar | 🟠 MEDIUM | Empfänger-Liste in n8n Environment Variables auslagern; nicht in Workflow-JSON speichern | `N8N_REPORT_RECIPIENTS` als Env-Var setzen, im Node via `{{ $env.N8N_REPORT_RECIPIENTS }}` referenzieren |
| 4 | GA4 API-Response kann theoretisch PII enthalten (z.B. wenn Custom Dimensions mit User-IDs konfiguriert sind) — diese fließen dann in HTML-Report und E-Mail | 🟠 MEDIUM | GA4-Property auf aggregierte Metriken prüfen; Custom Dimensions mit User-IDs explizit aus dem API-Request ausschließen | GA4 Admin: Custom Definitions prüfen, keine User-Level-Daten im Report-Request anfordern |
| 5 | Meta Ads Access Token in n8n gespeichert — Token hat typischerweise 60-Tage-Gültigkeit, dann stiller Fehler ohne Alert | 🟠 MEDIUM | Token-Expiry überwachen; n8n Error-Handler Node für HTTP 401/403 von Meta API ergänzen; System User Token statt User Token verwenden | Meta Business Manager: System User Token erstellen (kein persönlicher Account); Token-Ablauf dokumentieren |
| 6 | n8n self-hosted ohne Authentifizierung oder mit Standard-Passwort erreichbar — Workflow + alle Credentials öffentlich zugänglich | 🔴 HIGH | n8n zwingend hinter Reverse Proxy mit HTTPS; Basic Auth oder SSO aktivieren; nicht auf Port 5678 public exponieren | Nginx/Caddy Reverse Proxy aufsetzen; n8n `N8N_BASIC_AUTH_ACTIVE=true` oder OAuth2 Proxy |
| 7 | Workflow-Export (JSON) enthält keine Credentials, aber Node-Konfiguration inkl. GA4 Property ID und Empfänger-Array — Information Disclosure bei Weitergabe | 🟡 LOW | Property IDs und E-Mail-Adressen vor Export aus Workflow entfernen oder durch Platzhalter ersetzen | Vor Blueprint-Weitergabe: "Set: Konfiguration" Node auf Platzhalter zurücksetzen |
| 8 | HTML-Report per `n8n-nodes-base.sendEmail` — kein DKIM/SPF → hohe Spam-Wahrscheinlichkeit + Reputation-Risiko für Absender-Domain | 🟡 LOW | SPF-Record für Absender-Domain setzen; DKIM aktivieren; Resend.com nutzt eigenes DKIM out of the box | DNS-Provider: SPF-Eintrag prüfen/setzen; DKIM-Key im Mailserver hinterlegen |
| 9 | Code Node ("Code: HTML Report bauen") führt JavaScript aus — bei manipulierten GA4-Daten (z.B. XSS-Payload in Seitentitel) theoretisch HTML-Injection in Report | 🟡 LOW | Alle GA4-String-Werte vor HTML-Rendering escapen | Im Code Node: `String.replace()` oder dedizierte Escape-Funktion vor Template-Einbettung |
| 10 | Schedule Trigger läuft ohne Failure-Notification — wenn Workflow Montag früh fehlschlägt, merkt niemand, dass der Report nicht ankam | 🟡 LOW | n8n Workflow-Error-Trigger als separaten Notification-Workflow einrichten | Error-Workflow in n8n anlegen: bei Fehler → Slack/E-Mail-Alert an Admin |
| 11 | Google Sheets mit manuellen KPIs: Zugriffsrechte unklar — wenn Sheet "für alle mit Link" geteilt ist, sind Unternehmens-KPIs öffentlich | 🟠 MEDIUM | Google Sheet auf "Eingeschränkt" setzen; nur Service Account + berechtigte Nutzer | Google Drive: Sheet-Freigabe prüfen, "Jeder mit dem Link" deaktivieren |
| 12 | n8n Execution-Log speichert Input/Output jedes Nodes — Report-Daten (KPIs, Ad-Spend) im Klartext in n8n-Datenbank | 🟡 LOW | n8n Execution Data Pruning aktivieren; Retention auf max. 7 Tage setzen | `EXECUTIONS_DATA_PRUNE=true`, `EXECUTIONS_DATA_MAX_AGE=7` in n8n Env-Vars |

---

## Pflicht-Mitigations (nummeriert)

### 1. n8n Absichern (vor Go-Live zwingend)

```bash
# .env / docker-compose.yml Umgebungsvariablen
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<starkes-passwort-min-20-zeichen>

# Execution-Logs begrenzen
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=7
EXECUTIONS_DATA_PRUNE_MAX_COUNT=1000

# Encryption Key für Credentials (einmalig setzen, niemals ändern)
N8N_ENCRYPTION_KEY=<random-32-byte-hex>
```

### 2. Service Account minimal berechtigen

Nur diese GA4-Rolle: **Analyst** (Lesezugriff auf Reports, kein Schreibzugriff, kein Nutzer-Management)

Im Google Cloud Console: Service Account darf **keine** weiteren APIs außer `analyticsdata.googleapis.com` haben.

```bash
# Prüfen welche Rollen der Service Account hat:
gcloud projects get-iam-policy DEIN-PROJECT-ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:n8n-reporting@*"
```

### 3. SMTP zwingend mit TLS

Im `Email: Report versenden` Node:
- Port: **587** (STARTTLS) oder **465** (SSL/TLS)
- **Niemals Port 25** für ausgehende Reports
- Empfohlen: Resend.com (TLS by default, DKIM out of the box, kostenlos bis 3k/Monat)

### 4. HTML-Injection verhindern (Code Node)

```javascript
// Escape-Funktion im "Code: HTML Report bauen" Node hinzufügen
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Alle GA4-Strings durch escapeHtml() führen bevor sie ins Template
const pageTitle = escapeHtml(item.pagePath || '');
```

### 5. Empfänger aus Workflow-JSON auslagern

```bash
# n8n Env-Var setzen
N8N_REPORT_RECIPIENTS=chef@firma.de,marketing@firma.de
```

Im "Set: Konfiguration" Node, Feld `reportRecipients`:
```
{{ $env.N8N_REPORT_RECIPIENTS }}
```

---

## Empfohlene Mitigations (Best Practice, nicht zwingend)

- **Google Sheet auf dediziertes Service Account beschränken:** Nicht den GA4-Service-Account für Sheets verwenden — separaten Account anlegen
- **Meta System User Token statt persönlichem Token:** System User in Meta Business Manager anlegen, Token hat kein User-Expiry-Problem
- **n8n hinter Fail2Ban:** Bei self-hosted n8n wiederholte Login-Versuche blocken
- **Workflow-Exports vor Weitergabe sanitizen:** Eigenes Pre-Export-Checklist-Item in Team-Prozess
- **Error-Workflow aufsetzen:** Separater n8n-Workflow der bei Fehler im Report-Workflow per E-Mail oder Slack alarmiert

---

## Was AEVUM bei DFY zusätzlich macht

- Reverse Proxy (Nginx/Caddy) mit HTTPS aufsetzen und testen
- n8n Encryption Key generieren und sicher dokumentieren
- Service Account Rotation-Reminder im Client-Onboarding-Dokument hinterlegen
- Error-Workflow als Teil des Setups implementieren (kein extra Aufwand)
- Google Sheet Zugriffsrechte prüfen und korrigieren
- SMTP/Resend konfigurieren und Test-Delivery mit DKIM-Verification durchführen
- HTML-Escape-Funktion im Code Node standardmäßig einbauen
- Initialer Security-Walkthrough mit Customer (30 Min)

---

## Known Limits

- Dieser Workflow hat **keine Authentifizierung am Report selbst** — wer die Mail bekommt, sieht die KPIs. Kein Passwort-Schutz auf dem HTML-Content möglich ohne Frontend-Layer.
- **n8n self-hosted Security liegt vollständig beim Customer** — AEVUM kann Setup absichern, aber Server-Maintenance, OS-Patches, Firewall-Regeln sind Customer-Verantwortung.
- **Meta API Access Token Rotation** ist manuell — kein automatisches Refresh implementiert. Beim Token-Ablauf schlägt der Workflow still fehl (siehe Risk #5).
- GA4 Data API hat **Quota-Limits** (default: 50.000 Tokens/Tag pro Property). Bei wöchentlichem Einzelaufruf kein Problem — bei Mehrfach-Triggering (Testing) aufpassen.

---

## Sign-Off Checkliste Security

- [ ] n8n mit HTTPS und Authentifizierung erreichbar
- [ ] n8n Encryption Key gesetzt und dokumentiert
- [ ] Service Account hat nur Analyst-Rolle in GA4, keine weiteren API-Scopes
- [ ] SMTP/Resend mit TLS konfiguriert, Test-Mail erfolgreich
- [ ] Empfänger-Array in Env-Var ausgelagert (nicht hardcoded im Workflow)
- [ ] HTML-Escape im Code Node implementiert
- [ ] Google Sheet Zugriffsrechte auf "Eingeschränkt" gesetzt
- [ ] Execution-Log Pruning aktiviert (max. 7 Tage)
- [ ] Error-Workflow vorhanden oder Monitoring-Prozess dokumentiert
- [ ] Meta Token-Ablauf-Datum dokumentiert (wenn Meta Ads aktiv)