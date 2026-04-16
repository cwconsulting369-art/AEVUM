# ⚡ AEVUM — Modulare KI-Infrastruktur

> Lies dies zuerst. Immer aktuell halten. Für Claude Code und alle anderen Tools.

---

## Was ist AEVUM?

AEVUM ist eine modulare KI-Infrastruktur-Plattform.

**Modul 01 — Ads Tracking & Attribution** (dieses Repo):
- Serverseitiges Meta Ads Tracking von Creative bis Close
- 100% Lead-Erfassung via n8n + Meta Conversions API
- Competitive Intelligence (6h / 12h / 24h Intervalle)
- Live Dashboard via Airtable API
- Lead-Capture Form → n8n Webhook → Airtable + CAPI + WhatsApp
- DSGVO-konform · Made in Germany

**Stack:** Statisches HTML (kein Framework) · n8n · Airtable · Vercel

---

## 🤖 Für Claude Code — Sofort ausführen

```bash
# 1. Repo clonen
git clone https://github.com/cwconsulting369-art/AEVUM.git
cd AEVUM

# 2. aevum-platform.html (aus Claude.ai Output) als index.html einfügen
# Datei liegt im Claude.ai Chat als Download

# 3. Pakete installieren
npm init -y
npm install gsap lenis three @react-three/fiber @react-three/drei framer-motion tailwindcss vercel

# 4. Push
git add index.html package.json package-lock.json
git commit -m "feat: AEVUM platform v1 — initial deploy"
git push origin main

# 5. Vercel Deploy
npx vercel --prod

# 6. DNS beim Domain-Registrar
# A-Record:  76.76.21.21
# CNAME:     cname.vercel-dns.com
```

---

## CONFIG ausfüllen

In `index.html` nach `const CONFIG` suchen (~Zeile 1850):

```javascript
const CONFIG = {
  N8N_WEBHOOK: 'https://DEINE-N8N-INSTANZ.app.n8n.cloud/webhook/aevum-lead',
  AIRTABLE_TOKEN: 'patXXXXXXXXXXXXXX',
  AIRTABLE_BASE:  'appXXXXXXXXXXXXXX',
  WHATSAPP:       'https://wa.me/message/5QFEVA2RDCGXH1',  # WhatsApp Business Link
};
```

> ⚠️ Niemals echte Tokens committen. `.gitignore` anlegen für lokale Config.

---

## n8n Workflow

Datei: `AEVUM-lead-pipeline.json`

```
n8n → Workflows → ⋮ → Import from File → AEVUM-lead-pipeline.json
```

Platzhalter ersetzen:

| Platzhalter | Wo finden |
|---|---|
| `DEINE_AIRTABLE_BASE_ID` | airtable.com/YOUR_BASE → API docs |
| `DEIN_META_PIXEL_ID` | Meta Events Manager |
| `DEIN_META_CAPI_TOKEN` | Meta Events Manager → Test Events |
| `DEINE_WHATSAPP_NUMMER` | Format: `49XXXXXXXXXX` (ohne +) |

Webhook URL nach Import:
```
https://DEINE-N8N.app.n8n.cloud/webhook/aevum-lead
→ In CONFIG.N8N_WEBHOOK eintragen
```

---

## Airtable Setup

Base Name: `aevum`

**Tabelle: Leads** (Felder in dieser Reihenfolge anlegen)

| Feld | Typ |
|---|---|
| Lead ID | Single line text (Primary) |
| Name | Single line text |
| Email | Email |
| Phone | Phone number |
| Company | Single line text |
| Status | Single select: Neu, Kontaktiert, Call geplant, Angebot, Gewonnen, Verloren |
| UTM Source | Single line text |
| UTM Campaign | Single line text |
| Creative ID | Single line text |
| Revenue | Currency (EUR) |
| Timestamp | Single line text |
| Source Page | URL |
| Notes | Long text |

Weitere Tabellen: `Campaigns`, `Events` → siehe Notion Docs.

---

## Webhook testen

```bash
curl -X POST https://DEINE-N8N.app.n8n.cloud/webhook/aevum-lead \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@test.de",
    "phone": "+49123456789",
    "utm_source": "instagram",
    "utm_campaign": "creative-01",
    "utm_content": "creative-07"
  }'
```

Erwartete Antwort:
```json
{"success": true, "lead_id": "AV-XXXXX", "message": "Lead erfolgreich erfasst."}
```

---

## Regeln — nie brechen

- **Brand = AEVUM** (nie Trackleads, nie etwas anderes)
- **Kein Framework** ohne Rückfrage einführen — bewusst statisches HTML
- **Keine Preise** auf der Website — nur im Gespräch
- **WhatsApp CTA** = primäre Conversion — kein Bot, kein Chat
- **Config niemals committen** — `.gitignore` pflegen

---

## Abschlussmeldung nach Deploy

Melde Carlos:
1. ✅ Vercel URL (z.B. `aevum-xyz.vercel.app`)
2. ✅ Webhook Test: funktioniert / Fehler: [beschreiben]
3. ✅ Airtable empfängt Leads: ja / nein
4. ✅ Meta CAPI: Events im Test-Tool sichtbar: ja / nein

---

## Projekt-Docs (Notion)

Vollständige Dokumentation: https://www.notion.so/3448a5202bef81f4916cde982aea6ed2

- 01 — Website (Deploy-Schritte)
- 02 — n8n Workflow (Import + Config)
- 03 — Airtable Schema (alle Felder)
- 04 — Frontend Stack (GSAP, Three.js, Lenis)
- 05 — Claude Code Setup (npm install + deploy)

---

## Frontend Stack (für spätere Erweiterungen)

```html
<!-- GSAP Animationen -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Three.js 3D -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Lenis Smooth Scroll -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
```

---

*AEVUM — LennoxOS Infrastructure | Stand: April 2025*
