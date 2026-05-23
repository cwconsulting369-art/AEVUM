# AEVUM Blueprint: Onboarding-Autopilot

> Neukunden vom ersten Kontakt bis zum ersten Erfolgs-Check-in vollautomatisch durch den Onboarding-Prozess führen.

---

## Was dieses Blueprint macht

Der **Onboarding-Autopilot** übernimmt jeden neuen Kunden von der Sekunde an, in der er unterschreibt oder ein Formular einreicht. Ohne manuelles Zutun läuft die gesamte Begrüßungs- und Einrichtungssequenz ab:

1. **Sofort bei Eingang:** Personalisierte Welcome-Mail mit nächsten Schritten
2. **+0 Minuten:** Kunden-Datensatz in Notion/Airtable anlegen
3. **+0 Minuten:** Slack-Ping an dein Team ("Neuer Kunde: [Name]")
4. **+0 Minuten:** Calendly-Link für Kick-off-Call in der Mail
5. **+3 Tage:** Automatischer Check-in ("Hast du alles gefunden?")

**Ergebnis:** Jeder Neukunde bekommt dieselbe professionelle Erfahrung — egal ob du gerade schläfst oder im Kundentermin bist.

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| Typeform, Tally oder Webhook | Trigger-Quelle | Ja (eine davon) |
| SMTP / Resend | E-Mails versenden | Ja |
| Notion oder Airtable | Kunden-Datensatz | Empfohlen |
| Slack | Team-Benachrichtigung | Optional |
| Calendly | Kick-off-Call buchen | Optional |

---

## Trigger-Optionen

### Option A: Formular-Einreichung (Typeform/Tally)

Wenn ein neuer Kunde dein Onboarding-Formular ausfüllt:
1. Formular-Webhook-URL in Typeform/Tally eintragen (aus n8n Webhook Node)
2. Formular muss Felder enthalten: Vorname, Nachname, E-Mail, Unternehmen

### Option B: CRM-Tag (Airtable Automation)

Wenn ein Kontakt in Airtable den Status "Neukunde" erhält:
1. In Airtable eine Automation erstellen: "When record matches conditions (Status = Neukunde)"
2. Action: HTTP Request an n8n Webhook

### Option C: Manueller Trigger

Für Tests oder manuelle Aktivierung: Workflow in n8n manuell starten mit Testdaten.

---

## Setup-Anleitung

### Schritt 1: Workflow importieren

`workflow.json` in n8n importieren. Workflow erscheint im Editor — noch nicht aktivieren.

### Schritt 2: Welcome-Mail anpassen

Im **Send Email: Welcome** Node das HTML-Template anpassen:
- Dein Unternehmensname ersetzen
- Calendly-Link einfügen (oder Inline-Terminbuchungs-Link)
- Signatur anpassen
- Optional: Logo als Bild-URL einbinden

### Schritt 3: Notion/Airtable verbinden

Im **HTTP: Datensatz anlegen** Node:

**Für Airtable:**
```
URL: https://api.airtable.com/v0/YOUR_BASE_ID/Kunden
Header: Authorization: Bearer YOUR_AIRTABLE_TOKEN
```

Felder in Airtable anlegen: Name, E-Mail, Unternehmen, Status, Onboarding-Start, Notizen

**Für Notion:**
Notion Credentials in n8n anlegen, Notion Create Page Node nutzen (wie im Content-Factory Blueprint beschrieben).

### Schritt 4: Slack konfigurieren (optional)

1. Slack Webhook URL erstellen: api.slack.com/apps → "Incoming Webhooks"
2. Im **HTTP: Slack Ping** Node die Webhook-URL eintragen
3. Channel anpassen (z.B. `#neue-kunden`)

### Schritt 5: Follow-up-Timing anpassen

Der **Wait Node** ist auf 3 Tage (72 Stunden) eingestellt. Im Wait Node anpassen:
- Kürzere Projekte: 1 Tag
- Enterprise-Onboarding: 5–7 Tage

### Schritt 6: Workflow aktivieren

Toggle auf **"Active"** stellen. Ab jetzt läuft jedes neue Formular automatisch durch.

---

## Workflow-Ablauf im Detail

```
[Webhook/Formular Eingang]
         |
[Set: Daten normalisieren]
         |
    ┌────┴────┬──────────────┐
    |         |              |
[Email:   [HTTP:         [HTTP:
 Welcome]  Datensatz]    Slack Ping]
    |
[Wait: 3 Tage]
    |
[Email: Follow-up Check-in]
```

**Wichtig:** Der Wait Node wartet echte 72 Stunden. n8n speichert den Workflow-Stand — er muss nicht die ganze Zeit aktiv sein.

---

## E-Mail-Templates

### Welcome-Mail (sofort)

**Betreff:** Willkommen an Bord — nächste Schritte für [Vorname]

Personalisierungsfelder:
- `{{ $json.firstName }}` — Vorname des Kunden
- `{{ $json.company }}` — Unternehmen
- `{{ $json.calendlyLink }}` — Dein Kick-off-Link

### Follow-up Check-in (nach 3 Tagen)

**Betreff:** Kurze Frage, [Vorname] — alles angekommen?

Kurze, persönliche Mail. Kein Marketing. Nur: "Hast du die Unterlagen gefunden, gibt es Fragen?"

---

## Anpassung an eigene Tools

**Du nutzt kein Slack?** Den Slack-Node einfach löschen oder durch einen Telegram-Node ersetzen.

**Du nutzt kein Calendly?** Den Calendly-Link durch deinen eigenen Buchungs-Link ersetzen (Cal.com, Doodle, etc.) oder einfach weglassen.

**Du willst mehr Schritte?** Nach dem Follow-up weitere Wait + Email Nodes hinzufügen (z.B. nach 7 Tagen: Ressourcen-Mail, nach 14 Tagen: Erfolgs-Check).

**Mehrere Produkte?** Switch Node nach der Normalisierung hinzufügen, der je nach Produkt/Paket unterschiedliche E-Mail-Sequenzen startet.
