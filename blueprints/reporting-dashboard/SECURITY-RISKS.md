# AEVUM Security Risk Matrix — Reporting Dashboard Blueprint

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