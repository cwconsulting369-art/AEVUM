# AEVUM — Projekt-Kontext für Claude Code

## Notion
https://www.notion.so/AEVUM-3448a5202bef81f4916cde982aea6ed2
Page ID: 3448a520-2bef-81f4-916c-de982aea6ed2
Parent: Lennox HQ

## GitHub
https://github.com/cwconsulting369-art/AEVUM

## Was ist AEVUM?
Modulare KI-Infrastruktur-Plattform. Kein Fixpreis — Revenue-Share.
Modul 01 (aktiv): Meta Ads Tracking — serverseitig, CAPI, Creative-Attribution, Lead-Capture.
Langfristiges Ziel: humanitäre KI, gesellschaftliche Integration.

## Stack
- Frontend: statisches HTML (aevum-platform.html → index.html)
- Backend: n8n (Webhook), Airtable (Lead-Datenbank)
- Deploy: Vercel (auto-deploy via GitHub)

## CONFIG in index.html (~Zeile 1850)
```js
const CONFIG = {
  N8N_WEBHOOK: 'https://DEINE-N8N.app.n8n.cloud/webhook/aevum-lead',
  AIRTABLE_TOKEN: 'patXXXXXXXXXXXXXX',
  AIRTABLE_BASE:  'appXXXXXXXXXXXXXX',
  WHATSAPP:       '49XXXXXXXXXX',
};
```
→ Config-Werte NIE committen → .gitignore

## Regeln — nie brechen
- Brand = AEVUM (nie Trackleads)
- Kein neues Framework ohne Rückfrage
- Keine Preise auf der Website
- WhatsApp CTA = primäre Conversion, kein Bot
- Nach Deploy: Webhook testen

## Arbeitsteilung
- Claude.ai → Strategie, Analyse, SEO, Systeme planen
- Claude Code → Bauen, Deployen, Git, npm, Datei-Operationen

## Offene To-Dos
- [ ] Airtable Base `aevum` anlegen
- [ ] n8n Workflow `AEVUM — Lead Pipeline` importieren + konfigurieren
- [ ] WhatsApp-Nummer in CONFIG eintragen
- [ ] aevum-platform.html → index.html → GitHub pushen
- [ ] Vercel deployen
- [ ] Webhook testen nach Deploy
