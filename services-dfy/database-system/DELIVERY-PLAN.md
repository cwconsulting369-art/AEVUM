# Delivery-Plan — Database System (DFY)

**Intern. Nicht für Customer.** Operatives Playbook für AEVUM-Team.

---

## Phasen

### Phase 1: Discovery & Source-Mapping (W1–W2)

**Ziel:** Vollständiges Bild aller Quellen, KPIs, Qualitätsstandards. Kein Bit Code bevor diese Phase abgenommen ist.

| Deliverable | Owner | Customer-Input nötig? |
|---|---|---|
| Kick-off Call durchgeführt, Recording verfügbar | Founder / CS | Ja — Data-Owner + Entscheider |
| Source-Inventory-Doc (alle Quellen, Felder, API-Status) | Eng | Ja — Zugänge bereitgestellt |
| KPI-Glossar (Rohentwurf, von Customer bestätigt) | CS + Founder | Ja — Customer liefert KPI-Liste |
| Data-Quality-Report pro Quelle (Vollständigkeit, Anomalien, Gaps) | Eng | Nein |
| Priorisierungs-Entscheidung: welche Quellen zuerst, welche später | Founder | Ja — Customer buy-in |
| Tech-Stack-Entscheidung final (DB, ETL-Tool, Reporting-Tool) | Eng + Founder | Ja — Tool-Präferenz |

**Customer-Touchpoint:** Kick-off Call (90 Min) + Async-Feedback auf Source-Inventory innerhalb 48h

**Quality-Gate:** Phase 1 ist abgeschlossen wenn Source-Inventory von Customer schriftlich freigegeben + KPI-Glossar Rohentwurf existiert.

---

### Phase 2: Pipeline-Build (W3–W5 Tier M / W3–W8 Tier L)

**Ziel:** Funktionierende ETL-Pipelines für alle vereinbarten Quellen. Daten landen korrekt in DB.

| Deliverable | Owner | Anmerkung |
|---|---|---|
| Datenbankschema finalisiert (ERD, Tabellen, Relationen) | Eng | Intern reviewed vor Implementierung |
| API-Verbindungen implementiert (je Quelle) | Eng | Pro Quelle einzeln testen |
| Transformation-Layer (Normalisierung, Dedup, Bereinigung) | Eng | Kritischste Phase — Bugs hier sind teuer |
| Refresh-Scheduler eingerichtet (je nach Frequenz-Anforderung) | Eng | |
| Fehler-Handling implementiert (Retry, Alerting bei Pipeline-Fehler) | Eng | Intern — kein Customer-Alert |
| Erste interne Daten-Sichtprüfung | Eng + Founder | Stichproben gegen bekannte Referenzwerte |

**Customer-Touchpoint:** Weekly Sync W3 + W5 — kurzer Status (15–20 Min), keine langen Calls. Ziel: frühzeitig Probleme mit Zugängen oder API-Limits klären.

**Quality-Gate:** Alle Pipelines laufen 3× fehlerfrei durch automatischen Refresh. Keine P0-Bugs.

---

### Phase 3: Daten-Validierung (W6 Tier M / W9 Tier L)

**Ziel:** Customer bestätigt, dass die Zahlen stimmen. Keine Phase 4 ohne bestätigte Validierung.

| Deliverable | Owner | Customer-Input nötig? |
|---|---|---|
| Validierungs-Dokument (Soll-Ist-Vergleich für alle KPIs) | Eng + CS | Ja — Customer liefert Referenz-Zahlen |
| Abweichungs-Log (was weicht ab und warum?) | Eng | Nein |
| Customer Sign-Off auf Validierungs-Dokument | CS | Ja — schriftlich per Email |
| Bugfixes aus Validierung | Eng | — |

**Customer-Touchpoint:** Validierungs-Review-Call (60 Min) — Customer, Data-Owner, AEVUM CS + Eng.

**Quality-Gate:** Alle KPI-Abweichungen < 2% oder dokumentiert + erklärt. Customer hat schriftlich freigegeben.

**Risiko-Note:** Wenn Customer keine Referenz-Zahlen hat, dauert Validierung länger. Das muss in W1 bereits geprüft werden.

---

### Phase 4: Reporting-Layer + Alerting (W7–W8 Tier M / W10–W12 Tier L)

**Ziel:** Fertige, benutzte Dashboards. Nicht nur hübsch — tatsächlich auf die vereinbarten KPIs ausgerichtet.

| Deliverable | Owner | Anmerkung |
|---|---|---|
| Dashboard-Build (vereinbarte Anzahl) | Eng + CS | Design nach vereinbarten Wireframes / Anforderungen aus Phase 1 |
| Custom Metrics / Calculated Fields fertig | Eng | Alle aus KPI-Glossar |
| Alerting-Setup (Schwellenwerte vom Customer, nicht von uns erfinden) | Eng | Customer muss Schwellenwerte liefern |
| Intern: Dashboard-Review (UX, Korrektheit, Vollständigkeit) | Founder + CS | Vor Customer-Preview |
| Customer-Preview-Session (30 Min async oder live) | CS | Feedback-Runde #1 |
| Finale Anpassungen (1 Runde enthalten) | Eng | Scope: Minor-Änderungen, kein Umbau |

**Customer-Touchpoint:** Dashboard-Preview — live oder Loom-Video. Customer gibt Feedback innerhalb 48h.

**Quality-Gate:** Alle Dashboards entsprechen KPI-Glossar. Alle vereinbarten Alerts aktiv und getestet. Visueller Review durch Founder abgenommen.

---

### Phase 5: Dokumentation + Handover (W9 Tier M / W13–W14 Tier L)

**Ziel:** Customer kann das System ohne AEVUM bedienen und verstehen.

| Deliverable | Owner | Format |
|---|---|---|
| ERD-Dokument (Datenbankstruktur) | Eng | PNG + Notion/PDF |
| Tabellen-Glossar (alle Felder erklärt, auf Deutsch) | Eng + CS | Notion / Google Doc |
| SOP: neue Quelle hinzufügen | Eng | Schritt-für-Schritt, Deutsch |
| SOP: KPI anpassen | Eng | Schritt-für-Schritt, Deutsch |
| Video-Walkthrough Pipeline (20–40 Min, Loom) | Eng | Loom, unlisted Link |
| Onboarding-Session live (2h) | CS + Founder | Zoom mit Recording |
| Zugänge übergeben (alle relevanten Logins dokumentiert) | CS | Passwort-Manager oder sicheres Doc |
| Retainer-Kickoff (Scope des laufenden Retainers erklären) | Founder / CS | 20 Min, Ende der Onboarding-Session |

**Customer-Touchpoint:** Onboarding-Session (2h, live, aufgezeichnet).

**Quality-Gate:** Customer bestätigt schriftlich, dass sie das System bedienen können. Alle Docs zugänglich. Kein offener P0/P1-Bug.

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Lead (Kick-off, Tech-Stack-Entscheidung) | Review (Quality-Gate) | Review (Sign-Off) | Final-Review vor Customer-Preview | Retainer-Scope erklären | Eskalations-Punkt |
| **Engineer** | Source-Inventory, API-Analyse | Lead (Pipeline-Build, alle technischen Deliverables) | Lead (Validierung, Bugfix) | Lead (Dashboards, Alerts) | Docs, Video | Pipeline-Wartung (4–8h/Mo) |
| **Customer-Success** | Kick-off koordinieren, KPI-Glossar moderieren | Weekly Syncs, Kommunikation | Validierungs-Call, Customer-Kommunikation | Preview koordinieren, Feedback managen | Onboarding-Session, Zugänge-Übergabe | Monthly Check-in, CR-Management |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Wann | Format | Dauer | Owner | Ziel |
|---|---|---|---|---|---|
| **Kick-off Call** | W1 | Zoom, live | 90 Min | Founder + CS | Gegenseitiges Verständnis, Erwartungen, Zugänge-Timeline |
| **Weekly Sync** | W3, W5 | Zoom oder Async-Update | 20 Min | CS | Status, offene Blocker, Zugänge |
| **Validierungs-Review** | W6 (W9 Tier L) | Zoom, live | 60 Min | CS + Eng | Zahlen stimmen? Customer Buy-in |
| **Dashboard-Preview** | W8 (W12 Tier L) | Loom oder Zoom | 30–45 Min | CS | Feedback auf Dashboards |
| **Onboarding-Session** | W9 (W14 Tier L) | Zoom, live, recorded | 2h | CS + Eng | Übergabe, Schulung, Retainer-Scope |
| **30-Tage-Check** | 4 Wochen nach Go-Live | Zoom | 30 Min | CS | Pipeline läuft? Fragen? Minor-Fixes? |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Customer liefert API-Zugänge verspätet oder unvollständig | Hoch | Hoch — blockiert Phase 2 komplett | In W1 Kick-off: klare Deadline, wer liefert was bis wann. CS eskaliert bei Nicht-Lieferung nach 3 Werktagen. Timeline-Verschiebung kommunizieren, nicht still schlucken. |
| **R2** | Datenqualität in Quell-Systemen deutlich schlechter als erwartet (fehlende Felder, inkonsistente Kategorien, Duplikate >20%) | Mittel | Mittel — Transformation-Layer massiv aufwändiger | Data-Quality-Assessment in Phase 1 explizit. Bei kritischen Qualitätsproblemen: Customer auffordern, Quell-Daten intern zu bereinigen, bevor Pipeline gebaut wird. Timeline pausieren. |
| **R3** | API einer Quell-Plattform ist instabil, rate-limited oder ändert sich während Implementierung | Mittel | Mittel — einzelne Quelle fällt aus | Fehler-Handling + Retry-Logik von Anfang an einbauen. Fallback: manueller CSV-Export als Überbrückung dokumentieren. Customer informieren, wenn Quelle strukturell unzuverlässig ist. |
| **R4** | Customer kann keine Referenz-Zahlen für Validierung liefern ("wir haben nie Zahlen gehabt") | Mittel | Mittel — Validierungsphase verlängert sich, keine eindeutige Bestätigung möglich | Früh in Phase 1 ansprechen. Wenn keine Referenz-Zahlen: Customer wird gebeten, mind. 3 Zahlen aus der Vergangenheit manuell zu prüfen. Oder: Validierung via Spot-Check einzelner Transaktionen statt KPI-Summen. |
| **R5** | Customer-seitige IT blockiert externe Datenbankverbindungen nachträglich | Niedrig bei AG/PB, Hoch bei FI | Hoch — kann gesamtes Projekt gefährden | In Pre-Sales bereits klären: gibt es IT-Abteilung? Freigabeprozesse? Bei FI: IT als Stakeholder von Anfang an einbinden, nicht erst in W4. |

---

## Quality-Gates

| Gate | Phase | Wer nimmt ab? | Kriterium |
|---|---|---|---|
| **QG-1: Source-Inventory freigegeben** | Ende Phase 1 | CS + Customer schriftlich | Alle Quellen dokumentiert, KPI-Glossar Rohentwurf bestätigt |
| **QG-2: Pipeline-Erstlauf sauber** | Mitte Phase 2 | Eng intern | 3 fehlerfreie Refresh-Zyklen, keine P0-Bugs, Daten landen in DB |
| **QG-3: Validierung bestanden** | Ende Phase 3 | Founder + Customer schriftlich | <2% Abweichung oder dokumentiert, Customer-Sign-Off vorhanden |
| **QG-4: Dashboards abgenommen** | Ende Phase 4 | Founder visuell + CS | Alle KPIs vorhanden, Alerts aktiv, Dashboard-Preview-Feedback eingearbeitet |
| **QG-5: Handover komplett** | Ende Phase 5 | CS Checkliste | Alle Docs zugänglich, Onboarding-Session done, Customer-Bestätigung schriftlich, kein P0/P1 offen |

---

## Handover-Package

Was Customer am Ende physisch bekommt:

| Asset | Format | Zugänglich via |
|---|---|---|
| ERD-Dokument (Datenbankstruktur) | PNG + PDF | Shared Google Drive / Notion |
| Tabellen-Glossar (alle Felder, Deutsch) | Notion-Page oder Google Doc | Link in Übergabe-Dokument |
| SOP: neue Datenquelle hinzufügen | Google Doc, Schritt-für-Schritt | Shared Drive |
| SOP: KPI / Calculated Field anpassen | Google Doc, Schritt-für-Schritt | Shared Drive |
| Video-Walkthrough Pipeline (Loom, 20–40 Min) | Loom-Link (unlisted) | Übergabe-Dokument |
| Recording Onboarding-Session | Zoom-Recording-Link | Per Email |
| Zugangsdaten / Credentials (alle relevanten) | 1Password Shared Vault oder gesichertes Doc | Direkt an Customer-Owner |
| Retainer-Scope-Dokumentation | 1-pager PDF | Per Email + Drive |
| Kontakt für Retainer-Support | Email + Slack-Channel (wenn vorhanden) | Onboarding-Session |

---