# DSGVO-Check: newsletter-growth-machine

**Blueprint-ID:** newsletter-growth-machine
**Stand:** 2025
**Scope:** EU/EWR-Betrieb; für CH/UK gelten analoge, leicht abweichende Regelungen

---

> **Vorab-Hinweis:** Dieser Check ist eine technisch-operative DSGVO-Analyse, kein Rechtsgutachten. Für verbindliche rechtliche Beurteilung ist ein Datenschutzbeauftragter oder Rechtsanwalt hinzuzuziehen.

---

## Datenfluss-Analyse

| Datenkategorie | Entstehungsort | Verarbeitung durch | Speicherort | Weitergabe an Dritte | Löschfrist |
|---|---|---|---|---|---|
| Konfigurations-Daten (Thema, Zielgruppe, Ton) | Set-Node in n8n | n8n-Instanz, OpenRouter | n8n-Execution-Log, OpenRouter-Server | OpenRouter (USA/EU je nach Routing) | 7 Tage (Execution-Log) |
| Newsletter-Draft (generierter Text) | OpenRouter API Response | n8n-Instanz, E-Mail-Versand | n8n-Execution-Log, Inbox des Reviewers, Beehiiv | OpenRouter, SMTP/Resend, Beehiiv | 7 Tage n8n; je nach Mail-Client; Beehiiv bis Löschung |
| Review-E-Mail-Adresse (`reviewEmail`) | Set-Node | n8n-Instanz, SMTP/Resend | n8n-Execution-Log, Resend-Server | Resend/SMTP-Provider | 7 Tage n8n; Resend: 30 Tage Log |
| Approval-Webhook-Token + Timestamp | n8n Wait-Node | n8n-Instanz | n8n-Execution-Log | Keine | 7 Tage |
| Beehiiv Publication-ID + API-Key | n8n Credential Manager | n8n-Instanz | n8n-verschlüsselt | Beehiiv | Bis manuelle Löschung |
| Subscriber-Daten (im Newsletter-Kontext) | Beehiiv | Beehiiv-Plattform | Beehiiv-Server (USA) | Beehiiv | Gemäß Beehiiv-Einstellungen |

**Kritischer Befund:** Newsletter-Draft-Inhalte und die Review-E-Mail-Adresse passieren OpenRouter-Server. Wenn im Prompt personenbezogene Daten (z.B. Kundenreferenzen, Fallstudien mit Namen) enthalten sind, wird daraus eine Datenübermittlung in Drittländer.

---

## Rechtsgrundlage

| Verarbeitungsvorgang | Rechtsgrundlage | Begründung |
|---|---|---|
| Nutzung des Workflows durch den Operator (Business-to-Tool) | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) | Betrieb eines internen Marketing-Tools; kein Eingriff in Rechte der betroffenen Personen solange keine Subscriber-Daten in Prompts fließen |
| Review-Mail an eigene E-Mail-Adresse | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Eigenbetrieb) | Operator ist gleichzeitig betroffene Person; interne Kommunikation |
| Push zu Beehiiv (Newsletter-Draft, ohne Subscriber-Daten) | Art. 6 Abs. 1 lit. f DSGVO | Legitimes Interesse an Marketingbetrieb |
| **Wenn** Subscriber-Daten in Prompts fließen | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder lit. b | Separate Prüfung erforderlich; standardmäßig: NICHT TUN |

---

## Pflicht-Konfiguration (DSGVO-konformer Betrieb)

**P-1: Kein PII in Prompts**
Der OpenRouter-Request (Nodes "HTTP: Themen-Ideen", "HTTP: Outline bauen", "HTTP: Full Draft schreiben") darf keine personenbezogenen Daten enthalten:
- Keine Kundennamen, keine E-Mail-Adressen, keine Fallstudien mit identifizierbaren Personen
- Konfigurations-Felder `targetAudience` und `newsletterTopic` auf generische Beschreibungen begrenzen

**P-2: Execution-Daten begrenzen**
```
n8n Self-Hosted Umgebungsvariablen:
EXECUTIONS_DATA_MAX_AGE=7
EXECUTIONS_DATA_PRUNE=true
N8N_EXECUTION_DATA_SAVE_MANUAL_EXECUTIONS=false
```

**P-3: Datenverarbeitungsverzeichnis (VVT) Eintrag**
Dieser Workflow muss im VVT des Operators dokumentiert werden:
- Zweck: Automatisierte Newsletter-Content-Generierung
- Kategorien betroffener Personen: Operator selbst (Review-Mail), Subscriber (indirekt über Beehiiv)
- Empfänger: OpenRouter, Resend/SMTP-Provider, Beehiiv
- Löschfristen: wie oben

**P-4: Auftragsverarbeitungsverträge (AVV) abschließen**
Siehe Vendor-Tabelle unten — AVV vor Go-Live für alle Drittanbieter.

---

## Vendor-DPA-Übersicht

| Vendor | Funktion im Workflow | EU-Hosting verfügbar | DPA vorhanden | DPA-Link / Hinweis | SCCs erforderlich |
|---|---|---|---|---|---|
| **n8n** (Cloud) | Workflow-Engine | Ja (EU-Region wählbar) | Ja | [n8n.io/legal/dpa](https://n8n.io/legal/dpa) | Nein (wenn EU-Region) |
| **n8n** (Self-Hosted) | Workflow-Engine | Ja (eigener Server) | Entfällt | Operator ist selbst Verantwortlicher | Entfällt |
| **OpenRouter** | LLM-Routing / KI-Generierung | Nein (USA-basiert) | Eingeschränkt — Terms of Service enthält Datenverarbeitungsklauseln, kein vollständiger AVV | [openrouter.ai/privacy](https://openrouter.ai/privacy) | 🔴 Ja — SCCs oder alternative Rechtsgrundlage für Drittlandübermittlung prüfen |
| **Resend** | Transactional Mail | Ja (EU-Region) | Ja | [resend.com/legal/dpa](https://resend.com/legal/dpa) | Nein (wenn EU-Region gewählt) |
| **Beehiiv** | Newsletter-Publikation | Nein (USA-basiert) | Ja (GDPR Data Processing Agreement verfügbar) | Settings → Legal → DPA in Beehiiv-Dashboard anfordern | Ja — Beehiiv bietet SCCs im Rahmen des DPA |
| **Mailchimp** (Alternative) | Newsletter-Publikation | Nein (USA-basiert, Intuit) | Ja | [mailchimp.com/legal/data-processing-addendum](https://mailchimp.com/legal/data-processing-addendum/) | Ja — SCCs über Standard-DPA |

**🔴 Kritischer Hinweis OpenRouter:** OpenRouter ist derzeit kein klassischer AVV-Partner im DSGVO-Sinne. Solange ausschließlich eigene, nicht-personenbezogene Business-Inhalte (Themen, Nischen-Beschreibungen) verarbeitet werden, ist das Risiko manageable — dennoch: VVT-Eintrag als "berechtigtes Interesse" + Datensparsamkeit (kein PII in Prompts) als Pflicht-Mitigation.

---

## Betroffenenrechte

| Recht (DSGVO) | Relevant für diesen Workflow? | Umsetzung |
|---|---|---|
| Auskunft (Art. 15) | Gering — Workflow verarbeitet primär eigene Betriebsdaten | n8n Execution-Logs auf Anfrage einsehbar |
| Löschung (Art. 17) | Relevant für Beehiiv-Subscriber-Daten | Über Beehiiv-Dashboard; n8n Executions manuell oder via Retention-Setting |
| Datenportabilität (Art. 20) | Nicht direkt relevant für Workflow-Betrieb | Beehiiv-Export-Funktion für Subscriber-Daten |
| Widerspruch (Art. 21) | Für Newsletter-Empfänger über Beehiiv-Unsubscribe | Beehiiv handelt Unsubscribe; Workflow berührt das nicht |
| Einschränkung (Art. 18) | Nicht relevant — kein kontinuierliches Subscriber-Profiling im Workflow | — |

---

## Löschfristen

| Datenkategorie | Frist | Mechanismus |
|---|---|---|
| n8n Execution-Logs | 7 Tage | Automatisch via `EXECUTIONS_DATA_MAX_AGE=7` |
| Review-E-Mails im Postfach | Operator-Verantwortung; empfohlen: 30 Tage | Manuelle Inbox-Regel oder automatisches Archiv |
| Beehiiv Draft-Posts | Bis Veröffentlichung oder manuelle Löschung | Beehiiv Dashboard |
| Resend Delivery-Logs | 30 Tage (Resend Default) | Resend Settings |
| API-Keys in n8n | Bis manuelle Rotation | Pflicht-Rotation alle 90 Tage dokumentieren |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung nach Art. 35 DSGVO)

Eine DSFA ist für diesen Workflow in der Standardkonfiguration **nicht erforderlich**, da:
- Keine systematische Verarbeitung besonderer Kategorien (Art. 9)
- Kein automatisiertes Profiling von Personen
- Kein großflächiges Monitoring

**DSFA wird erforderlich wenn:**
- Subscriber-Daten (auch aggregiert) in Prompts fließen
- Der Workflow für mehr als 5.000 Subscriber-Profile Personalisierungsentscheidungen trifft
- Gesundheits-, Finanz- oder politische Inhalte für vulnerable Zielgruppen generiert werden

---

## EU AI Act Einordnung

**Klassifizierung: Limited Risk (Art. 50 EU AI Act)**

Begründung:
- LLM-Calls via OpenRouter erzeugen KI-generierten Content
- Der Content wird in Newslettern an Personen kommuniziert
- Art. 50 Abs. 1: Pflicht zur **Kennzeichnung KI-generierter Inhalte** wenn diese mit Personen interagieren

**Pflicht-Maßnahme:**
```
In der Review-Mail und/oder im Beehiiv-Draft-Template:
Fußzeile empfohlen:
"[Teile dieses Newsletters wurden KI-unterstützt erstellt und 
von [NAME] geprüft und freigegeben.]"
```

Keine DSGVO-Vorabgenehmigung oder spezifische Registrierung für Limited-Risk-Systeme erforderlich. Kennzeichnungspflicht gilt ab Veröffentlichung.

**Nicht anwendbar:** High-Risk-Klassifizierung (kein kritischer Sektor, keine Entscheidungen über Personen, keine Biometrie).

---

## Audit-Checkliste vor Go-Live

- [ ] VVT-Eintrag für Newsletter-Workflow angelegt
- [ ] AVV mit Beehiiv abgeschlossen (DPA angefordert und signiert)
- [ ] AVV-Situation OpenRouter dokumentiert; Entscheidung: SCCs oder ausschließlich non-PII-Prompts
- [ ] AVV mit Resend abgeschlossen (wenn Resend genutzt)
- [ ] n8n Cloud: EU-Region in Account-Settings bestätigt
- [ ] n8n Self-Hosted: Server-Standort EU dokumentiert
- [ ] Execution-Retention auf 7 Tage konfiguriert
- [ ] Prompts auf PII geprüft: Kein personenbezogener Inhalt in Themen-/Outline-/Draft-Prompts
- [ ] KI-Kennzeichnung im Newsletter-Template implementiert (EU AI Act Art. 50)
- [ ] Beihiiv Unsubscribe-Link in allen ausgesendeten Newslettern vorhanden
- [ ] Datenschutzhinweis auf eigener Website um Beehiiv und KI-Tool-Einsatz ergänzt
- [ ] Löschfristen-Prozedur dokumentiert (wer löscht was wann)

---

## Sign-Off

| Prüfpunkt | Status |
|---|---|
| Rechtsgrundlage identifiziert | Ausstehend bis VVT-Eintrag |
| Drittland-Übermittlung bewertet | OpenRouter: Risiko-akzeptiert unter Bedingungen |
| AVVs vollständig | Vor Go-Live zwingend |
| EU AI Act Compliance | Kennzeichnung implementieren |
| DSFA erforderlich | Nein (Standardkonfiguration) |