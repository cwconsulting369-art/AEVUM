# AEVUM Blueprint: Cold Outreach System

> DSGVO-konformes Cold-Outreach mit KI-Personalisierung und automatischer 3-Schritt-Sequenz.

---

## Was dieses Blueprint macht

Das **Cold Outreach System** verarbeitet eine Liste von Kontakten (CSV oder Airtable), personalisiert jede Outreach-Mail via KI und schickt automatisch eine 3-Schritt-Sequenz:

1. **Mail 1:** Persönlicher erster Kontakt mit individuellem Hook
2. **+3 Tage:** Follow-up (falls keine Antwort)
3. **+5 Tage:** Letzte Chance ("Ich hake ein letztes Mal nach")

Der Workflow prüft vor jedem Schritt, ob bereits eine Antwort eingegangen ist. Wer antwortet, wird sofort aus der Sequenz herausgenommen.

**Ergebnis:** Skalierbare, personalisierte Outreach-Kampagnen ohne Copy-Paste-Arbeit.

---

## DSGVO-Rechtliche Grundlage

**Pflichtlektüre vor dem ersten Versand.**

### Wann ist Cold-Outreach DSGVO-konform?

Cold-E-Mail-Outreach an Unternehmen (B2B) ist unter bestimmten Voraussetzungen nach § 7 Abs. 2 Nr. 3 UWG und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) zulässig:

- Die E-Mail-Adresse ist öffentlich zugänglich (Website, LinkedIn, Impressum)
- Es besteht ein sachlicher Zusammenhang zwischen deinem Angebot und der Tätigkeit des Empfängers
- Du bietest immer eine einfache Opt-out-Möglichkeit
- Du speicherst keine unnötigen Daten

**Was du NICHT tun darfst:**
- Privatpersonen kalt kontaktieren (B2C Cold Mail = rechtswidrig)
- Gekaufte Adresslisten ohne Einwilligungsnachweis verwenden
- Keine Opt-out-Möglichkeit anbieten
- Irreführende Betreffzeilen verwenden

### Pflicht-Elemente in jeder Mail

Jede Outreach-Mail muss enthalten:
1. Deinen vollständigen Namen + Unternehmen
2. Deine Kontaktadresse (Impressumspflicht bei kommerzieller Kommunikation)
3. Opt-out-Möglichkeit: "Bitte keine weiteren Mails von mir: [Opt-out Link]"

**Opt-out Handling:** Wenn jemand auf den Opt-out-Link klickt, muss er sofort aus deiner Liste entfernt werden. Dieser Workflow enthält dafür einen Webhook-Node.

### Löschfristen

- Kontakte die sich abgemeldet haben: Adresse auf Blocklist setzen (nicht einfach löschen — sonst könntest du dieselbe Person versehentlich erneut kontaktieren)
- Kontakte ohne Reaktion nach 90 Tagen: Aus der aktiven Liste löschen
- Blocklist: 3 Jahre aufbewahren

**Hinweis:** Dies ist keine Rechtsberatung. Bei Unsicherheit Anwalt hinzuziehen.

---

## Empfohlene Datenquellen

| Quelle | Qualität | DSGVO | Empfehlung |
|--------|---------|-------|------------|
| Apollo.io | Sehr hoch | Grauzone | Nur verifizierte B2B-Adressen |
| LinkedIn Export | Hoch | OK wenn öffentlich | Verbindungen exportieren |
| Eigene Website-Recherche | Mittel | Sicher | Impressum-Adressen |
| Gekaufte Listen | Niedrig | Kritisch | Nicht empfohlen |

**Apollo.io Setup:**
1. Konto erstellen, Filter setzen (Branche, Unternehmensgröße, Land)
2. Export als CSV: Name, E-Mail, Unternehmen, Position, LinkedIn-URL
3. CSV in das Format dieses Blueprints bringen (Felder umbenennen)

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| OpenRouter API Key | Personalisierung | Ja |
| SMTP (eigene Domain!) | E-Mail-Versand | Ja |
| Google Sheets oder Airtable | Kontakt-Liste + Status | Empfohlen |

**Wichtig: Eigene Domain für den Versand.** Niemals Cold-Outreach über Gmail, Outlook oder andere Freemail-Dienste schicken. Kaufe eine dedizierte Domain (z.B. `outreach.deinefirma.de`) und richte SPF/DKIM/DMARC ein. Sonst landest du im Spam.

---

## CSV-Format für Kontakt-Import

Deine Kontakt-Liste muss folgende Spalten haben:

```csv
firstName,lastName,email,company,position,linkedinUrl,note
Max,Mustermann,max@muster.de,Muster GmbH,Geschäftsführer,https://linkedin.com/in/max,"Erwähnt auf LinkedIn Automatisierung"
```

- `note`: Optionale handschriftliche Notiz für den KI-Hook. Leer lassen wenn keine vorhanden.
- `linkedinUrl`: Für Recherche-Kontext beim Hook-Generator

---

## Setup in 5 Schritten

### Schritt 1: Kontakt-Liste vorbereiten

CSV im oben beschriebenen Format erstellen. In Google Sheets hochladen oder direkt als CSV in n8n hochladen.

### Schritt 2: Workflow importieren

`workflow.json` importieren. Alle Nodes sind konfiguriert — nur Credentials und Placeholders anpassen.

### Schritt 3: Absender-Domain einrichten

Für seriöses Cold-Outreach:
1. Domain kaufen (z.B. `kontakt.deinefirma.de`)
2. Bei deinem E-Mail-Anbieter (Resend, Postmark, Mailgun) einrichten
3. SPF, DKIM, DMARC Records setzen
4. Domain 2-4 Wochen "aufwärmen" (täglich 10-20 normale Mails senden) vor Cold-Outreach

### Schritt 4: KI-Hook Prompt anpassen

Im **HTTP: Personalisierter Hook** Node den Prompt mit deinem Angebot füllen:

```
Du bist ein Outreach-Spezialist. Schreibe den ersten Satz einer Cold-Mail.
Dein Angebot: [DEIN ANGEBOT IN 1 SATZ]
```

### Schritt 5: Opt-out Webhook URL einrichten

Im **Webhook: Opt-out** Node die URL kopieren. Diese URL in jede Mail als Opt-out-Link einbauen:
```
[Keine weiteren Mails](DEINE_N8N_URL/webhook/optout?email={{ email }})
```

---

## Sequenz im Detail

```
[Manual Trigger: CSV Import]
         |
[Split in Batches: 10/Tag]
         |
[HTTP: KI-Hook generieren]
         |
[Email: Mail 1]
         |
[Wait: 3 Tage]
         |
[IF: Antwort vorhanden? → Google Sheet prüfen]
   Nein            Ja
    |               |
[Email:         [Stop]
 Follow-up 1]
    |
[Wait: 5 Tage]
    |
[IF: Antwort vorhanden?]
   Nein            Ja
    |               |
[Email:         [Stop]
 Letzte Chance]
```

---

## Mail-Templates

### Mail 1: Erster Kontakt

**Betreff:** [Personalisiert durch KI — max. 50 Zeichen]

```
Hallo [Vorname],

[KI-generierter personalisierter Hook — 1-2 Sätze]

[Dein Angebot in 1-2 Sätzen. Konkret, kein Buzzword-Bingo.]

Wäre ein kurzes 15-Minuten-Gespräch in den nächsten Tagen drin?

Viele Grüße,
[Dein Name]
[Dein Unternehmen | Website | Telefon]

---
Keine weiteren Mails gewünscht? [Hier abmelden]
```

### Mail 2: Follow-up (nach 3 Tagen)

**Betreff:** Re: [Gleicher Betreff wie Mail 1]

```
Hallo [Vorname],

ich hake kurz nach — vielleicht ist meine erste Mail untergegangen.

[1 Satz Erinnerung an das Angebot]

Haben Sie 15 Minuten diese Woche?

[Dein Name]

[Abmelden-Link]
```

### Mail 3: Letzte Chance (nach weiteren 5 Tagen)

**Betreff:** Letzte Nachricht von mir

```
Hallo [Vorname],

das ist meine letzte Nachricht — ich möchte nicht aufdringlich sein.

Falls das Timing gerade nicht passt: kein Problem. Sollten Sie irgendwann über [Thema] nachdenken, freue ich mich über eine Nachricht.

Alles Gute,
[Dein Name]

[Abmelden-Link]
```

---

## Troubleshooting

**Mails landen im Spam:** Domain-Reputation zu niedrig. Aufwärm-Phase verlängern, weniger Mails/Tag, SPF/DKIM prüfen. Tool: mail-tester.com

**KI-Hook zu generisch:** Mehr Kontext im CSV mitgeben (note-Spalte). Prompt verschärfen: "Erwähne konkret die Branche und eine spezifische Herausforderung."

**Hohe Bounce-Rate:** E-Mail-Adressen verifizieren vor dem Versand. Tool: NeverBounce, ZeroBounce oder hunter.io Verifier.

**Opt-out Webhook funktioniert nicht:** n8n muss öffentlich erreichbar sein (nicht nur localhost). Bei self-hosted: ngrok oder Cloudflare Tunnel nutzen.
