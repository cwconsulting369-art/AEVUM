# AEVUM Blueprint: Lead-Qualifier

> Eingehende Leads automatisch bewerten, gewichten und ans richtige Team routen.

---

## Was dieses Blueprint macht

Der **Lead-Qualifier** nimmt eingehende Kontaktanfragen — über dein Formular, Typeform, Tally oder einen direkten Webhook — und bewertet sie automatisch anhand von 7 Kriterien nach dem BANT-Framework. Jeder Lead bekommt einen Score von 0–100 und wird dann automatisch in drei Wege geroutet:

- **Score > 70 (Hot Lead):** Sofort in dein CRM, Benachrichtigung, priorisierter Follow-up
- **Score 40–70 (Warm Lead):** CRM-Eintrag, Standard-Follow-up-Sequenz
- **Score < 40 (Cold Lead):** Archiviert, optionale Nurture-Mail

**Ergebnis:** Kein Lead geht verloren, keine Zeit wird mit unqualifizierten Anfragen verschwendet.

---

## Die 7 Scoring-Kriterien (BANT+)

| Kriterium | Gewichtung | Punkte | Beschreibung |
|-----------|-----------|--------|--------------|
| **Budget** | 25% | 0/12/25 | Kein Budget / "Schauen wir mal" / Konkretes Budget genannt |
| **Authority** | 20% | 0/10/20 | Assistent / Manager / Entscheider/Geschäftsführer |
| **Need** | 20% | 0/10/20 | Vage Interesse / Konkretes Problem / Akuter Handlungsbedarf |
| **Timing** | 15% | 0/8/15 | Kein Zeitrahmen / >6 Monate / <3 Monate |
| **Unternehmensgröße** | 10% | 0/5/10 | Selbständig / KMU (10–50 MA) / Mittelstand (>50 MA) |
| **Branche** | 5% | 0/3/5 | Irrelevant / Neutral / Ziel-ICP |
| **Engagement** | 5% | 0/2/5 | Nur Formular / Mehrfachkontakt / Empfehlung/Inbound |

**Gesamt: 100 Punkte**

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| Typeform, Tally oder eigenes Formular | Lead-Quelle | Ja (eine davon) |
| Airtable oder HubSpot | CRM für Lead-Speicherung | Empfohlen |
| Resend, Mailchimp oder SMTP | E-Mail-Versand | Ja |
| Telegram Bot | Sofort-Benachrichtigung bei Hot Leads | Optional |

---

## Setup in 4 Schritten

### Schritt 1: Formular vorbereiten

Stelle sicher, dass dein Eingangsformular folgende Felder abfragt:

**Pflichtfelder:**
- Vorname + Nachname
- E-Mail
- Unternehmen
- Nachricht / Herausforderung

**Optionale Felder (verbessern Scoring):**
- Ungefähres Budget (Auswahlfeld: "Noch unklar", "5.000–15.000€", ">15.000€")
- Wann soll gestartet werden? (Auswahlfeld)
- Position / Rolle im Unternehmen
- Wie viele Mitarbeiter? (Auswahlfeld)
- Wie bist du auf uns aufmerksam geworden?

### Schritt 2: Workflow importieren und Webhook aktivieren

1. `workflow.json` in n8n importieren
2. Den **Webhook Node** öffnen → URL kopieren
3. Diese URL in dein Formular-Tool als "Submit Webhook" eintragen:
   - **Typeform:** Connect → Webhooks → URL einfügen
   - **Tally:** Integrations → Webhooks
   - **Eigenes Formular:** `fetch(webhookUrl, { method: 'POST', body: JSON.stringify(formData) })`

### Schritt 3: CRM-Verbindung einrichten

Im **HTTP Request: CRM Push Node** die Ziel-URL anpassen:

**Airtable:**
```
https://api.airtable.com/v0/YOUR_BASE_ID/Leads
Header: Authorization: Bearer YOUR_AIRTABLE_API_KEY
```

**HubSpot:**
```
https://api.hubapi.com/crm/v3/objects/contacts
Header: Authorization: Bearer YOUR_HUBSPOT_TOKEN
```

### Schritt 4: E-Mail-Templates anpassen

Im **Send Email Node** die Templates für drei Szenarien anpassen:
- Hot Lead Benachrichtigung (an dich)
- Qualifizierter Lead Bestätigung (an den Lead)
- Unqualifiziert Archiv-Mail (optional, an den Lead)

---

## Konfiguration: Eigene Scoring-Kriterien

Der **Code Node "BANT Scoring"** enthält die Scoring-Logik in JavaScript. Du kannst die Gewichtungen und Schwellenwerte direkt anpassen:

```javascript
// Im Code Node: Gewichtungen anpassen
const weights = {
  budget: 25,        // Budget-Wichtigkeit für dich
  authority: 20,     // Wie wichtig ist der Entscheider?
  need: 20,          // Konkreter Bedarf
  timing: 15,        // Wie dringend?
  companySize: 10,   // Unternehmensgröße
  industry: 5,       // Passt die Branche?
  engagement: 5      // Wie aktiv war der Lead?
};

// Schwellenwerte anpassen
const thresholds = {
  hot: 70,    // Ab diesem Score: Hot Lead
  warm: 40    // Ab diesem Score: Warm Lead
};
```

**Branche anpassen:** Im Code Node das `targetIndustries`-Array mit deinen Ziel-Branchen befüllen:

```javascript
// Beispiel: branchenneutral, gerne nach Bedarf erweitern oder leer lassen,
// damit Industry-Match die Score nicht künstlich nach oben/unten zieht.
const targetIndustries = [
  'agentur', 'marketing', 'beratung', 'consulting',
  'dienstleistung', 'ecommerce', 'e-commerce',
  'saas', 'b2b', 'tech', 'startup'
];
```

---

## DSGVO-Hinweise

**Datenspeicherung:**
- Leads dürfen nur für den angegebenen Zweck gespeichert werden (Kontaktanfrage-Bearbeitung)
- Speichere nur, was du tatsächlich brauchst — keine überflüssigen Felder
- IP-Adressen anonymisieren oder gar nicht erst speichern

**Löschfristen:**
- Unqualifizierte Leads (Score < 40): Löschung nach 90 Tagen empfohlen
- Qualifizierte Leads ohne Folgeaktion: Löschung nach 12 Monaten
- Kunden in aktiver Beziehung: gesetzliche Aufbewahrungspflichten beachten (6–10 Jahre)

**Opt-in Pflicht:**
- Formular muss eine explizite Datenschutz-Checkbox enthalten
- Text: "Ich stimme der Verarbeitung meiner Daten gemäß Datenschutzerklärung zu."
- Diese Checkbox muss unausgefüllt sein (kein Pre-Check!)

**Auskunfts-/Löschrecht:**
- Stelle sicher, dass du Leads auf Anfrage löschen kannst
- Airtable: Record einfach löschen. HubSpot: GDPR-Delete API nutzen.

**Hinweis:** Dies ist keine Rechtsberatung. Für DSGVO-kritische Branchen Anwalt hinzuziehen.

---

## Troubleshooting

**Webhook kommt nicht an:** URL im Formular-Tool prüfen. n8n Execution-Log anschauen. Bei Tally/Typeform manchmal 30 Sekunden Verzögerung.

**CRM-Push schlägt fehl:** API Key und Base ID prüfen. Airtable: Feldnamen müssen exakt übereinstimmen (case-sensitive).

**Score immer 0:** Formular-Feldnamen müssen mit den im Code Node erwarteten Namen übereinstimmen. Im Code Node die `console.log(body)` Zeile aktivieren und im Execution-Log prüfen.
