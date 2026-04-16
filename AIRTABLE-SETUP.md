# AEVUM — AIRTABLE SETUP

## Base Name: aevum

---

## TABLE 1: Leads

Erstelle diese Felder exakt so (Groß-/Kleinschreibung wichtig für n8n):

| Feldname | Typ | Optionen |
|---|---|---|
| Lead ID | Single line text | Primary field |
| Name | Single line text | |
| Email | Email | |
| Phone | Phone number | |
| Company | Single line text | |
| Status | Single select | Neu, Kontaktiert, Call geplant, Angebot, Gewonnen, Verloren |
| Funnel Stage | Single select | NEW_LEAD, CONTACTED, CALL_SCHEDULED, PROPOSAL, CLOSED_WON, CLOSED_LOST |
| UTM Source | Single line text | |
| UTM Campaign | Single line text | |
| Creative ID | Single line text | |
| FBCLID | Single line text | |
| FBP | Single line text | |
| FBC | Single line text | |
| Source Page | URL | |
| Date | Date | |
| Timestamp | Single line text | |
| IP Address | Single line text | |
| Notes | Long text | |
| Revenue | Currency | EUR |
| Close Date | Date | |
| Assigned To | Single line text | |

---

## TABLE 2: Campaigns (für Dashboard)

| Feldname | Typ |
|---|---|
| Campaign Name | Single line text (Primary) |
| Creative ID | Single line text |
| Ad Spend | Currency (EUR) |
| Leads | Number |
| Closes | Number |
| Revenue | Currency (EUR) |
| ROAS | Formula: {Revenue}/{Ad Spend} |
| CPL | Formula: {Ad Spend}/{Leads} |
| Date | Date |

---

## TABLE 3: Events (Customer Journey)

| Feldname | Typ |
|---|---|
| Event ID | Single line text (Primary) |
| Lead ID | Single line text |
| Event Type | Single select: AD_VIEW, CLICK, FORM_SUBMIT, CALL, CLOSE, LOST |
| Creative ID | Single line text |
| Timestamp | Single line text |
| Value | Currency (EUR) |
| Notes | Long text |

---

## AIRTABLE API — Basis-URLs

```
Base ID:    appXXXXXXXXXXXXXX  (findest du in: airtable.com/YOUR_BASE/api)
Token:      patXXXXXXXXXXXXXX  (airtable.com → Account → Developer Hub → Personal Access Tokens)

Leads lesen:
GET https://api.airtable.com/v0/DEINE_BASE_ID/Leads
Header: Authorization: Bearer DEIN_TOKEN

Lead erstellen:
POST https://api.airtable.com/v0/DEINE_BASE_ID/Leads
Header: Authorization: Bearer DEIN_TOKEN
Body: { "records": [{ "fields": { "Name": "...", "Email": "..." } }] }

Campaigns lesen:
GET https://api.airtable.com/v0/DEINE_BASE_ID/Campaigns
```

---

## VIEWS (in Airtable erstellen)

1. **Dashboard View** — Alle aktiven Leads der letzten 30 Tage, sortiert nach Datum
2. **Pipeline View** — Grouped by Status
3. **Creative Performance** — Grouped by Creative ID, zeigt Revenue pro Creative
