# Newsletter Machine — Workflow-Diagramm

Dieser Workflow erzeugt jede Woche automatisch einen fertigen Newsletter-Entwurf
und legt ihn nach deiner Freigabe direkt als Draft in Beehiiv ab.

**Ablauf in Kurzform:**

1. **Trigger:** Jeden Mittwoch um 09:00 Uhr startet der Workflow automatisch.
2. **Konfiguration:** Deine Einstellungen (Thema, Zielgruppe, Tonfall, Review-E-Mail, Beehiiv-Publication) werden gesetzt.
3. **KI-Ideen:** Eine KI generiert 5 Newsletter-Themenvorschläge.
4. **Thema wählen:** Das erste (Top-)Thema wird ausgewählt.
5. **Outline:** Die KI baut daraus eine Struktur (Betreff, Preview, Abschnitte, Fazit/CTA).
6. **Volltext:** Die KI schreibt den kompletten Newsletter-Text (800–1.200 Wörter).
7. **Review-Mail:** Der Entwurf wird dir per E-Mail mit Freigabe-Button geschickt.
8. **Warten auf Freigabe:** Der Workflow pausiert, bis du auf "Freigeben" klickst (Webhook).
9. **Beehiiv:** Nach Freigabe wird der Newsletter als Draft in Beehiiv erstellt.

Die "Set"-Schritte zwischen den KI-Aufrufen extrahieren jeweils das Ergebnis und reichen
deine Konfiguration weiter, damit jeder Schritt die nötigen Daten hat.

```mermaid
flowchart TD
    trigger["⏰ Schedule: Mittwoch 09:00<br/>(Cron-Trigger)"]
    config["⚙️ Set: Konfiguration<br/>(Thema, Zielgruppe, Ton, E-Mail)"]
    ideas["🤖 HTTP: Themen-Ideen<br/>(KI generiert 5 Themen)"]
    extractTopic["📝 Set: Thema extrahieren<br/>(Top-Thema wählen)"]
    outline["🤖 HTTP: Outline bauen<br/>(KI baut Struktur)"]
    extractOutline["📝 Set: Outline extrahieren"]
    draft["🤖 HTTP: Full Draft schreiben<br/>(KI schreibt Volltext)"]
    extractDraft["📝 Set: Draft extrahieren<br/>(Text + Betreff)"]
    emailReview["📧 Email: Draft zur Review<br/>(Freigabe-Button)"]
    wait["⏸️ Wait for Webhook: Approval<br/>(wartet auf Freigabe)"]
    beehiiv["🚀 HTTP: Beehiiv Push<br/>(Draft in Beehiiv anlegen)"]

    trigger --> config
    config --> ideas
    ideas --> extractTopic
    extractTopic --> outline
    outline --> extractOutline
    extractOutline --> draft
    draft --> extractDraft
    extractDraft --> emailReview
    emailReview --> wait
    wait --> beehiiv
```
