# AEVUM Blueprint: Newsletter Machine

> Von der leeren Seite zum versandfertigen Newsletter — mit einem menschlichen Review-Schritt in der Mitte.

---

## Was dieses Blueprint macht

Die **Newsletter Machine** generiert jeden Mittwoch automatisch einen Newsletter-Entwurf: KI findet relevante Themen, baut eine Outline, schreibt den Volltext und schickt ihn dir zur Freigabe. Erst nach deiner Freigabe wird der Draft in dein Versand-Tool (Beehiiv oder Mailchimp) gepusht — du hast volle Kontrolle, aber keine Schreibarbeit.

**Ablauf pro Woche:**
1. Mittwoch Morgen: Themen-Ideation via KI
2. Outline-Generierung aus dem besten Thema
3. Vollständiger Draft (800–1.200 Wörter)
4. Draft-Mail an dich zur Prüfung
5. Du klickst "Freigeben" → Webhook triggert Beehiiv-Upload
6. Draft liegt in Beehiiv als "Scheduled" oder "Draft" für finalen Versand

**Wichtig:** Der Workflow wartet auf deine Freigabe. Ohne Klick wird nichts veröffentlicht.

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| OpenRouter API Key | KI-Generierung | Ja |
| SMTP / Resend | Draft-Mail an dich | Ja |
| Beehiiv API Key | Newsletter-Versand | Ja (oder Mailchimp) |
| Beehiiv Publication ID | Deine Newsletter-Publikation | Ja |

### Beehiiv Setup

1. Konto erstellen auf [beehiiv.com](https://beehiiv.com)
2. Publikation anlegen (Name + Subdomain)
3. API Key generieren: Settings → API → Generate New Key
4. Publication ID aus der URL kopieren: `app.beehiiv.com/publications/pub_XXXXX`

---

## Setup in 4 Schritten

### Schritt 1: Workflow importieren

`workflow.json` in n8n importieren.

### Schritt 2: Credentials einrichten

- **OpenRouter:** HTTP Header Auth Credential (wie in Content-Factory Blueprint)
- **SMTP/Resend:** Für die Review-Mail an dich
- **Beehiiv API:** HTTP Header Auth
  - Header Name: `Authorization`
  - Header Value: `Bearer YOUR_BEEHIIV_API_KEY`

### Schritt 3: Konfiguration im Set Node anpassen

Im **Set: Konfiguration** Node:
- `reviewEmail`: Deine E-Mail-Adresse für den Draft
- `beehiivPublicationId`: Deine Beehiiv Publication ID (`pub_XXXXX`)
- `newsletterTopic`: Hauptthema/Nische deines Newsletters
- `targetAudience`: Wen du ansprichst
- `toneOfVoice`: Schreibstil

### Schritt 4: Approval-Webhook URL einrichten

1. Im **Wait for Webhook: Approval** Node die URL kopieren
2. Diese URL in eine einfache Landing Page einbauen:
   ```html
   <a href="[WEBHOOK_URL]?approved=true">Newsletter freigeben</a>
   ```
3. Diese Seite verlinkst du in der Review-Mail

**Einfachere Alternative:** In der Review-Mail einen direkten n8n-Webhook-Link schicken. Kein Landing Page nötig — du klickst die URL direkt im Mail-Body.

---

## Themen-Ideation konfigurieren

Im ersten OpenRouter-Request (Node "HTTP: Themen-Ideen") kannst du den Prompt anpassen:

```
Generiere 5 Newsletter-Themen für [DEINE NISCHE].
Zielgruppe: [DEINE ZIELGRUPPE]
Ton: [TON]

Kriterien für gute Themen:
- Aktuell und relevant
- Bietet konkreten Mehrwert (nicht nur Meinung)
- Erzeugt Neugier schon im Betreff
- Passt zu 800–1.200 Wörtern

Format: Nummerierte Liste. Nur die Themen, keine Erklärung.
```

Der Workflow wählt automatisch Thema #1 für die Ausarbeitung. Willst du manuell wählen, füge einen Wait + Webhook Node nach der Ideation ein.

---

## Menschlicher Review-Schritt erklärt

Der **Wait for Webhook** Node pausiert den Workflow und wartet auf einen HTTP-Aufruf an eine eindeutige URL. Dieser Mechanismus ist in n8n eingebaut und zuverlässig — der Workflow-State bleibt erhalten, auch wenn n8n neu startet.

**Timeout:** Standardmäßig 1 Woche. Danach läuft der Workflow ab ohne Freigabe. Anpassbar im Wait Node.

**Was passiert wenn du nicht freigibst:** Der Draft bleibt in deiner Review-Mail. Du kannst den Workflow nächste Woche neu starten.

---

## Integration Mailchimp (Alternative zu Beehiiv)

Falls du Mailchimp nutzt, ersetze den **HTTP: Beehiiv Push** Node durch:

```
POST https://us1.api.mailchimp.com/3.0/campaigns
Header: Authorization: apikey YOUR_MAILCHIMP_KEY

Body:
{
  "type": "regular",
  "settings": {
    "subject_line": "{{ newsletter_subject }}",
    "from_name": "DEIN NAME",
    "reply_to": "DEINE_MAIL"
  }
}
```

Danach zweiten Request für den Content-Upload.

---

## Tipps für bessere KI-Newsletter

- **Eigene Erfahrungen einbauen:** Nach dem Draft-Empfang 1-2 eigene Anekdoten einfügen. Das macht den Unterschied.
- **Struktur vorschreiben:** Im Outline-Prompt explizit sagen: "Einleitung (Hook), 3 Hauptpunkte mit je einer konkreten Taktik, Fazit mit CTA"
- **Konsistentes Format:** Den Newsletter-Stil einmal schreiben und als Teil des System-Prompts einfügen (Beispiel-Section mitgeben)
- **Personalisierung:** `{{ subscriber.first_name }}` funktioniert in Beehiiv nativ in der Subject Line

---

## Troubleshooting

**Draft-Mail kommt nicht an:** SMTP-Credentials prüfen. Test-Send in n8n über "Send Test Mail" Feature.

**Beehiiv Push schlägt fehl (401):** API Key abgelaufen oder falsch. In Beehiiv Settings neuen Key generieren.

**Wait for Webhook läuft ab:** Timeout im Wait Node erhöhen (Empfehlung: 7 Tage). Oder: Approval-Mail erneut schicken und Workflow manuell neu starten.

**KI-Output zu allgemein:** System-Prompt konkretisieren. Eigene vergangene Newsletter als Beispiel-Ausgabe im Prompt mitgeben ("Schreibe ähnlich wie dieses Beispiel: [...]").
