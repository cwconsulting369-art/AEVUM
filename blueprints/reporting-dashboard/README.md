# AEVUM Blueprint: Reporting Dashboard

> Wöchentlicher KPI-Report — automatisch zusammengestellt und per Mail verschickt, jeden Montag um 07:00 Uhr.

---

## Was dieses Blueprint macht

Das **Reporting Dashboard** zieht jeden Montag Morgen automatisch Daten aus deinen Marketing-Quellen, baut daraus einen übersichtlichen HTML-Report und schickt ihn per E-Mail an dich und dein Team. Keine manuellen Exports, keine veralteten Screenshots in PowerPoint-Decks.

**Datenquellen (konfigurierbar):**
- Google Analytics 4 (Sessions, Conversion Rate, Top-Seiten)
- Meta Ads (Spend, CPL, ROAS — via Meta Marketing API)
- Manuelles Input-Sheet (Google Sheets oder Airtable für Offline-KPIs)

**Report-Inhalt:**
- KPI-Übersicht: Sessions, Leads, Conversions, Ad-Spend, ROAS
- Vergleich zur Vorwoche (Delta in % und absolut)
- Top 3 Seiten nach Traffic
- Performance-Ampel (Grün / Gelb / Rot)
- Freie Kommentar-Zeile (aus Google Sheet)

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| Google Analytics 4 Property | Traffic-Daten | Ja |
| Google Service Account | API-Zugriff auf GA4 | Ja |
| Meta Business Account | Ad-Daten (optional) | Optional |
| Google Sheets | Manuelle KPI-Eingabe | Empfohlen |
| SMTP / Resend | E-Mail-Versand | Ja |

---

## Setup Google Analytics API Key

### Schritt 1: Service Account erstellen

1. Öffne [Google Cloud Console](https://console.cloud.google.com)
2. Neues Projekt erstellen oder bestehendes wählen
3. Suche nach **"Google Analytics Data API"** → aktivieren
4. Navigiere zu **IAM & Admin > Service Accounts**
5. **"Service Account erstellen"** klicken
6. Name: `n8n-reporting`, Rolle: **Viewer**
7. Unter "Keys" → **"JSON Key erstellen"** → Datei herunterladen

### Schritt 2: Service Account zu GA4 hinzufügen

1. Öffne [Google Analytics](https://analytics.google.com)
2. Admin → Property → Property Access Management
3. **"+"** → Neue Nutzer hinzufügen
4. E-Mail des Service Accounts eintragen (aus der JSON-Datei: `client_email`)
5. Rolle: **Analyst** (Lesezugriff)

### Schritt 3: Credentials in n8n einrichten

1. In n8n → Settings → Credentials → **"Google Analytics OAuth2 API"** oder **"Google Service Account"**
2. Den Inhalt der JSON-Datei einfügen (private_key, client_email, project_id)
3. Property ID aus GA4 Admin kopieren (Format: `123456789`)

### Schritt 4: Workflow importieren und konfigurieren

Im **Set: Konfiguration** Node:
- `ga4PropertyId`: Deine GA4 Property ID
- `reportRecipients`: Array mit E-Mail-Adressen
- `reportTitle`: Name deines Reports
- `currency`: EUR oder USD

---

## Report-Template (HTML-Mail)

Der generierte Report sieht so aus:

```
┌─────────────────────────────────────────────┐
│  [DEIN UNTERNEHMEN] Weekly Report            │
│  KW 21 | 19.05. – 25.05.2026                │
├──────────┬───────────┬───────────┬───────────┤
│ Sessions │ Leads     │ Conv.Rate │ Ad Spend  │
│ 2.847    │ 34        │ 1,19%     │ €1.240    │
│ ▲ +12%   │ ▼ -3%     │ ▼ -0,1pp  │ ▲ +8%    │
├──────────┴───────────┴───────────┴───────────┤
│ ROAS: 3.2x  │ CPL: €36,47  │  ● Gut         │
├─────────────────────────────────────────────┤
│ Top Seiten                                  │
│ 1. /dienstleistungen  (487 Sessions)        │
│ 2. /startseite        (412 Sessions)        │
│ 3. /kontakt           (218 Sessions)        │
└─────────────────────────────────────────────┘
```

---

## Konfiguration: Welche KPIs, welche Empfänger, wann

| Parameter | Standard | Node |
|-----------|----------|------|
| Versandzeitpunkt | Montag 07:00 | Schedule Trigger |
| Report-Empfänger | leer (setzen!) | Set: Konfiguration |
| GA4 Property ID | leer (setzen!) | Set: Konfiguration |
| KPI-Schwellenwerte | Conv.Rate > 1%, ROAS > 2 | Code: Build Report |
| Report-Zeitraum | Letzte 7 Tage | GA4 API Node |
| Vergleichszeitraum | Vorherige 7 Tage | GA4 API Node |
| Währung | EUR | Set: Konfiguration |

**Empfänger-Array Beispiel:**
```
["chef@meinefirma.de", "marketing@meinefirma.de"]
```

---

## Troubleshooting

**GA4 API gibt 403 zurück:** Service Account wurde GA4 Property noch nicht hinzugefügt (Schritt 2 oben). Property ID prüfen.

**Leerer Report:** Wenn die Property noch keine 7 Tage Daten hat, liefert GA4 teilweise leere Antworten. Testweise den Zeitraum auf 30 Tage stellen.

**E-Mails landen im Spam:** SPF/DKIM für deine Absender-Domain einrichten. Alternativ Resend.com nutzen (einfacher Setup, bessere Zustellbarkeit).

**Meta Ads Node fehlt:** Meta API erfordert einen Access Token aus dem Meta Business Manager. Für den Start den Meta-Daten-Abschnitt im Code Node einfach auskommentieren und manuell ergänzen.
