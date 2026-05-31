# AEVUM Blueprint: Churn-Radar

> Kunden-Aktivität überwachen, Churn-Signale früh erkennen, automatisch Alert ans CS-Team + Retention-Mail an den Kunden auslösen.

---

## Was dieses Blueprint macht

**Churn-Radar** scannt werktäglich deine aktive Kundenbasis, berechnet pro Kunde einen **Churn-Score (0–100)** aus realen Aktivitäts-Signalen und reagiert automatisch, sobald ein Kunde über die Risiko-Schwelle rutscht:

1. **Daten laden:** Kunden + Aktivitätsdaten aus deiner DB (oder Analytics-API)
2. **Score berechnen:** gewichtete Heuristik aus Login-Inaktivität, sinkender Nutzung, Zahlungsausfällen, offenen Tickets, Feature-Adoption
3. **Triage:** Kunden unter der Schwelle → kein Alarm. Kunden über der Schwelle → Retention-Flow
4. **KI-Analyse:** kurze Risiko-Einschätzung + maßgeschneiderter Retention-Mail-Text pro Kunde
5. **Doppel-Aktion:** automatische Retention-Mail an den Kunden **+** Slack-Alert ans Customer-Success-Team
6. **Audit-Log:** jedes Churn-Event landet in einer DB-Tabelle (mit ON-CONFLICT-Schutz gegen Doppel-Alerts)

**Ergebnis:** Du verlierst keinen Kunden mehr "still". Abwanderung wird sichtbar, **bevor** gekündigt wird — und es passiert sofort etwas.

---

## Brutal honest: Was dieses Blueprint NICHT ist

- **Kein ML-Churn-Prediction-Modell.** Der Score ist eine transparente, regelbasierte Heuristik. Das ist Absicht: erklärbar, anpassbar, kein Black-Box-Training nötig. Wenn du echtes ML brauchst (Survival-Analysis, XGBoost), ist das ein Audit-M-Projekt.
- **Garbage in, garbage out.** Der Score ist nur so gut wie deine Aktivitätsdaten. Wenn du `last_login_at` oder Session-Counts nicht trackst, musst du das vorher in deinem Produkt instrumentieren (PostHog/Mixpanel/eigene Events).
- **Auto-Mail ist eine Waffe.** Eine schlecht getextete Retention-Mail an einen genervten Kunden beschleunigt Churn. Erste 20 Mails MUSST du manuell reviewen (siehe Setup). Bei High-MRR-Kunden empfehlen wir: nur Alert, kein Auto-Mail.
- **Keine Echtzeit-Reaktion.** Läuft als Batch (täglich). Wer Sekunden-genaues In-App-Triggering braucht: anderes Tool.

---

## Features

| Feature | Beschreibung |
|---|---|
| Transparenter Churn-Score | 5-Faktoren-Heuristik im Code-Node, voll editierbar |
| Risk-Bänder | OK / WATCH / AT_RISK / CRITICAL |
| KI-Personalisierung | Risiko-Einschätzung + individueller Retention-Mail-Text (OpenRouter) |
| Doppel-Reaktion | Retention-Mail (Kunde) + Slack-Alert (Team) parallel |
| Audit-Trail | Churn-Events in DB, Doppel-Alert-Schutz |
| Error-Pfad | DB- und KI-Fehler lösen Ops-Mail aus, statt still zu sterben |
| Schwellen konfigurierbar | Risiko-Schwelle + Inaktivitäts-Tage zentral im Set-Node |

---

## Ziel-Segmente

| Segment | Pain | Hebel durch Churn-Radar |
|---|---|---|
| **Agentur / SaaS-Studio (AG)** | Kunden kündigen "aus dem Nichts", Retainer laufen still aus, kein systematisches Health-Monitoring | Tägliches Health-Scoring über alle Accounts, CS bekommt nur die Risiko-Fälle auf den Tisch |
| **Personal Brand / Solo-SaaS (PB)** | Keine Zeit für manuelles Account-Watching, merkt Churn erst auf der Stripe-Abrechnung | Vollautomatischer Frühwarn-Radar, Retention-Mail ohne tägliche Handarbeit |
| **Mittelstand B2B / Subscription (FI)** | Customer-Success-Team reagiert reaktiv statt proaktiv, kein Daten-getriebenes Eingreifen | Score-getriebene Priorisierung, MRR-gewichtete Alerts, Audit-Trail für Management-Reporting |

---

## Was du eintragen musst

Alle Platzhalter sind im Workflow als `{{INDIVIDUELL: ...}}` markiert (im **Set: Churn-Konfiguration**-Node und einzelnen Nodes).

| Platzhalter | Was rein muss | Woher du es bekommst |
|---|---|---|
| `senderName` | Dein/CS-Name als Absender | Selbst festlegen |
| `senderCompany` | Firmenname + Rechtsform | Dein Impressum |
| `senderEmail` | Absender-Adresse (echtes, erreichbares Postfach) | Dein Mail-Provider (Resend/Postmark/SMTP) |
| `productName` | Name deines Produkts (für KI-Prompt + Mail-Footer) | Selbst festlegen |
| `slackChannel` | Channel-ID für CS-Alerts | Slack → Channel → "Details" → Channel-ID (`C…`) |
| `riskThreshold` | Score ab dem ein Kunde "at risk" gilt (Default 60) | Selbst tunen nach Test-Lauf |
| `inactiveDaysWarn` / `inactiveDaysCritical` | Inaktivitäts-Schwellen in Tagen (Default 14 / 30) | An deinen Nutzungs-Rhythmus anpassen |
| `{{INDIVIDUELL: Abmelde-/Präferenz-Link}}` (Retention-Mail) | Link zur Benachrichtigungs-Verwaltung | Dein App-Settings-/Präferenz-Center |
| `{{INDIVIDUELL: Ops-/Admin-Mail}}` (Fehler-Alert) | Adresse für Workflow-Fehler-Benachrichtigung | Dein Ops-Postfach |
| Postgres-Query (Tabellen/Spalten) | Anpassen an dein DB-Schema | Deine Produkt-/Billing-DB |
| Credential `Churn-Radar DB` | Postgres-Connection | Deine DB-Zugangsdaten |
| Credential `OpenRouter API` | Header-Auth `Authorization: Bearer <key>` | openrouter.ai → Keys |
| Credential `Churn SMTP` | SMTP-Zugang | Dein Mail-Provider |
| Credential `Churn Slack` | Slack-Bot-Token | api.slack.com → App → OAuth |

---

## Datenmodell-Annahme

Der Default-Workflow erwartet zwei Tabellen. Passe die Query an dein Schema an — oder ersetze den Postgres-Node durch einen HTTP-Request gegen deine Analytics-API.

```sql
-- Kunden-Stammdaten
customers (
  id, name, email, plan, mrr numeric, signup_date date, status text
)

-- Aktivitäts-Signale (z.B. nächtlich aus Product-Analytics befüllt)
customer_activity (
  customer_id, last_login_at timestamptz,
  sessions_last_30d int, sessions_prev_30d int,
  open_support_tickets int, failed_payments_90d int,
  feature_adoption_pct int
)

-- Audit-Log (vom Workflow geschrieben)
churn_events (
  id bigserial primary key,
  customer_id, churn_score int, risk_band text,
  reasons jsonb, ai_assessment text,
  retention_email_sent bool,
  detected_at date,
  UNIQUE (customer_id, detected_at)
)
```

**Keine eigene DB?** Datenquellen, die ähnliche Signale liefern: Stripe (Zahlungsausfälle, MRR), PostHog/Mixpanel (Sessions, Feature-Events), Intercom/Zendesk (offene Tickets). Den Postgres-Node dann durch passende HTTP-Request-Nodes ersetzen.

---

## Churn-Score-Logik (Default-Gewichtung)

| Signal | Bedingung | Punkte |
|---|---|---|
| Login-Inaktivität | ≥ 30 Tage | +40 |
| Login-Inaktivität | ≥ 14 Tage | +20 |
| Nutzungs-Einbruch | Sessions -70 % vs. Vorperiode | +25 |
| Nutzungs-Einbruch | Sessions -40 % | +15 |
| Zahlungsausfälle | ≥ 2 fehlgeschlagene Zahlungen | +20 |
| Zahlungsausfälle | 1 fehlgeschlagene Zahlung | +10 |
| Support-Frust | ≥ 3 offene Tickets | +10 |
| Niedrige Adoption | Feature-Adoption < 20 % | +10 |

**Bänder:** ≥80 = CRITICAL · ≥`riskThreshold` (60) = AT_RISK · ≥30 = WATCH · sonst OK.
Score wird auf max. 100 gekappt. Gewichtung im **Code: Churn-Score berechnen**-Node anpassbar.

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|---|---|---|
| n8n (self-hosted EU oder Cloud-EU) | Workflow-Engine | Ja |
| Postgres (oder Analytics-API) | Kunden- + Aktivitätsdaten | Ja |
| OpenRouter API Key | KI-Analyse + Mail-Text | Ja (oder durch statische Templates ersetzbar) |
| SMTP / Resend / Postmark | Retention-Mail-Versand | Ja |
| Slack Workspace + Bot-Token | CS-Team-Alert | Empfohlen (alternativ Email/Telegram) |

---

## Setup-Schritte (Kurzfassung — Details im INSTALL-GUIDE)

1. **Import:** `workflow.json` in n8n importieren. NICHT aktivieren.
2. **DB-Query anpassen:** Postgres-Node an dein Schema anpassen, `churn_events`-Tabelle anlegen.
3. **Credentials anlegen:** `Churn-Radar DB`, `OpenRouter API`, `Churn SMTP`, `Churn Slack`.
4. **Set-Node ausfüllen:** alle `{{INDIVIDUELL: …}}`-Platzhalter + Schwellen.
5. **Trockenlauf:** Workflow manuell triggern, Score-Output im Code-Node prüfen — sind die Scores plausibel?
6. **Mail-Review:** erste 20 KI-generierte Retention-Mails manuell lesen, bevor automatisch gesendet wird (temporär Email-Node deaktivieren, nur Slack-Alert aktiv).
7. **Test mit echtem At-Risk-Kunden:** ein Test-Account mit künstlich gesetzten Signalen durchspielen.
8. **Aktivieren:** Schedule scharf schalten, erste Woche täglich beobachten.

---

## Limits

- **Score ist Heuristik, keine ML-Prediction.** Tuning nötig, keine 100-%-Treffsicherheit.
- **Reagiert nur auf Daten, die du trackst.** Fehlt `last_login_at`, fehlt das stärkste Signal.
- **Batch, nicht Echtzeit.** Default werktäglich 07:00.
- **Single-Channel-Alert** (Slack). Multi-Channel-Routing (Email + Telegram + Ticket-System) ist Erweiterung.
- **Auto-Mail-Risiko:** ungetestete KI-Mails können Churn beschleunigen. Review-Pflicht.
- **Reply-Handling** auf Retention-Mails ist nicht enthalten — Antworten landen im normalen Postfach.

---

## Troubleshooting (Kurz)

- **Alle Scores 0/999:** Aktivitätsdaten fehlen oder Spalten-Mapping in der Query falsch.
- **KI-Mail leer/kaputt:** `Code: KI-Antwort parsen` hat Fallback-Text — prüfe OpenRouter-Response-Format und `max_tokens`.
- **Slack postet nicht:** Bot muss im Channel sein (`/invite @bot`), Channel-ID korrekt (`C…`, nicht `#name`).
- **Doppel-Alerts pro Tag:** `churn_events` braucht den `UNIQUE (customer_id, detected_at)`-Constraint.
