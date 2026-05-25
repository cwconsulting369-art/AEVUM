# Command Center Dashboard — Scope-Checklist
### Intern: Sales-Call & Projekt-Baseline

---

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | KPI-Workshop mit Customer (max. 2h, remote) | 2-3h AEVUM |
| **Discovery** | Data-Source-Audit (welche Tools, welche APIs, welche Daten) | 3-5h AEVUM |
| **Discovery** | Dokumentation der Daten-Landschaft als Data-Map | 2-3h AEVUM |
| **Architektur** | Dashboard-Wireframes (Figma oder äquivalent) | 4-8h AEVUM |
| **Architektur** | Datenmodell-Design (Schema, Normalisierung) | 4-8h AEVUM |
| **Architektur** | Approval-Loop mit Customer (max. 2 Revision-Runden) | 2h AEVUM + Customer |
| **Daten-Pipeline** | API-Anbindung Quelle 1-4 (Tier M) / 1-10 (Tier L) | 4-8h pro Quelle |
| **Daten-Pipeline** | Daten-Normalisierung und Transformation | 8-16h AEVUM |
| **Daten-Pipeline** | Datenbankschicht aufsetzen (intermediäre DB) | 4-8h AEVUM |
| **Daten-Pipeline** | Automatisierte Update-Jobs (Scheduler/Webhooks) | 4-6h AEVUM |
| **Daten-Pipeline** | Fehler-Logging und Monitoring der Pipeline | 2-4h AEVUM |
| **Frontend** | Dashboard-Entwicklung auf vereinbarter Plattform | 12-24h AEVUM |
| **Frontend** | Branding (Logo, Primärfarben, Typografie) | 2-4h AEVUM |
| **Frontend** | Rollen-Setup und Access-Management (2-4 Rollen) | 2-4h AEVUM |
| **Alerting** | Threshold-Alert-Konfiguration (bis 5 KPIs) | 3-5h AEVUM |
| **Alerting** | Slack- und/oder E-Mail-Notification-Setup | 1-2h AEVUM |
| **Testing** | Daten-Validierung (Dashboard vs. Quell-Tool: Spot-Check 80% der KPIs) | 4-8h AEVUM |
| **Testing** | UAT-Begleitung Customer (max. 2 Wochen, 2 Feedback-Runden) | 3-6h AEVUM |
| **Handover** | Technische Dokumentation (Data-Flows, Schema, Zugänge) | 4-6h AEVUM |
| **Handover** | Onboarding-Session live (60 Min.) | 1h AEVUM |
| **Handover** | Walkthrough-Video-Aufnahme | 1-2h AEVUM |
| **Post-Launch** | 30-Tage-Bug-Fix-Support (Business Hours) | bis 5h AEVUM |

**Gesamt-Estimate Tier M:** 80-130h | **Tier L:** 140-220h

---

## Out-of-Scope

| Was Customer NICHT bekommt | Warum explizit |
|---|---|
| Mehr als 4 (Tier M) / 10 (Tier L) Datenquellen im Initial-Setup | Jede weitere Quelle ist separater Change Request (+€800-2.500 je nach Komplexität) |
| Schreib-Zugriff auf Quell-Systeme (Dashboard is read-only) | Architektur-Entscheidung aus Sicherheits- und Haftungsgründen |
| Predictive Analytics / ML-basierte Forecasts | Separates Service-Item; erfordert andere Infrastruktur |
| Native Mobile App | Web-responsive, kein App-Store-Development |
| Datenmigration oder -bereinigung in Quell-Systemen | Wenn Quelldaten dirty sind, braucht es erst `database-system` |
| Business-Intelligence-Beratung ("Was bedeuten diese Zahlen?") | AEVUM baut Sichtbarkeit, nicht Strategie |
| Unbegrenzte Design-Iterationen nach Wire-Approval | Nach 2 genehmigten Revisionrunden: Change Request |
| SLA für Quell-API-Ausfälle (z.B. wenn HubSpot-API down ist) | Liegt außerhalb AEVUM-Kontrolle; Monitoring zeigt Fehler, Fix wird priorisiert |
| Eigener Hosting-Betrieb durch Customer ohne Retainer | Übergabe ohne Retainer nur auf expliziten Wunsch und mit vollständiger Übergabe-Doku |

---

## Voraussetzungen Customer-Side

| Voraussetzung | Details | Blocker wenn fehlt? |
|---|---|---|
| **Tool-Zugang** | Admin- oder API-Key-Zugang für alle vereinbarten Quell-Systeme | Ja — kein Access, kein Build |
| **KPI-Klarheit** | Mind. 80% der gewünschten KPIs vor Kick-off bekannt oder im Workshop definierbar | Ja — Discovery verlängert sich sonst unbegrenzt |
| **Ansprechpartner** | 1 interne Person mit Entscheidungskompetenz für Design-Approvals | Ja — ohne Approval-Power kein Fortschritt |
| **Feedback-Kapazität** | Customer-Ansprechpartner reserviert 3-4h über Projekt-Laufzeit für Reviews | Weich — verzögert sonst Timeline |
| **Nutzer-Definition** | Liste der Dashboard-Nutzer mit Rollen vor Phase 4 | Ja — Rollen-Setup nicht möglich ohne |
| **Tool-Stabilität** | Die Quell-Tools bleiben während der Implementation die vereinbarten — kein spontaner Tool-Wechsel | Weich — Tool-Wechsel mid-project = Change Request |
| **Daten-Qualität** | Quell-Daten sind grundsätzlich valide (kein massiver Datenmüll in den Quellen) | Ja — bei dirty data: erst `database-system` nötig |

---

## Quality-Standards

AEVUM erklärt das Projekt erst als "Done", wenn alle folgenden Kriterien erfüllt sind:

| Standard | Kriterium |
|---|---|
| **Daten-Genauigkeit** | Spot-Check: mind. 10 KPIs werden manuell gegen Quell-Tool verglichen — Abweichung max. ±2% (Rundungsdifferenzen ausgenommen) |
| **Update-Frequenz** | Alle Daten-Verbindungen aktualisieren sich zuverlässig in der vereinbarten Frequenz (15min/60min/live) ohne manuellen Eingriff |
| **Alert-Funktion** | Mindestens 3 Test-Alerts werden ausgelöst und landen korrekt in Slack/E-Mail |
| **Rollen-Isolation** | Jede User-Rolle sieht ausschließlich die für sie vorgesehenen Daten — Cross-Role-Datenleck = Blocker |
| **Performance** | Dashboard lädt unter 3 Sekunden bei normaler Datenmenge (Desktop, 50 Mbit+ Verbindung) |
| **Fehler-Handling** | Bei API-Ausfall einer Quelle: Dashboard zeigt Fehler-Status statt falsche/alte Daten ohne Kennzeichnung |
| **Dokumentation vollständig** | Data-Flow-Doku, Zugangsdaten-Übergabe, Schema-Doku — alle drei Dokumente übergeben |
| **Customer-Approval** | Schriftlicher Sign-Off durch Kunden-Ansprechpartner nach UAT |

---

## Change-Request-Policy

**Was ist ein Change Request (CR)?**
Alles, was nach dem Wire-Approval (Ende Phase 2) hinzukommt oder sich fundamental ändert — neue Datenquellen, neue Views, neue KPIs, die nicht im ursprünglichen Scope waren, oder Umbauten an bereits gebauten Komponenten auf Customer-Wunsch.

**Prozess:**
1. Customer äußert Änderungswunsch (schriftlich per E-Mail/Slack)
2. AEVUM schätzt Aufwand und kommuniziert innerhalb 48h Kosten + Timeline-Impact
3. Customer approved schriftlich → Umsetzung wird eingeplant
4. Kein CR wird ohne schriftliches Approval umgesetzt

**CR-Pricing-Orientierung:**
- Kleine Anpassungen (< 2h): pauschal €250-400
- Neue Datenquelle anbinden: €800-2.500 je nach API-Komplexität
- Neuer Dashboard-View: €600-1.500
- Fundamental-Umbau nach Wire-Approval: Neu-Angebot

**Retainer-Inklusive (kein CR nötig):**
- Bug-Fixes an bestehenden Verbindungen
- Anpassungen an bestehenden KPI-Definitionen (gleiche Quelle, andere Berechnung)
- Bis 3h/Monat Minor-Adjustments

---

## Pricing-Variations

| Szenario | Auswirkung auf Preis |
|---|---|
| **< 3 Datenquellen, 1 View, 1 Rolle** | Tier-M-Minimum: ab €6.500 Setup — reduzierter Scope |
| **Standard Tier M (4 Quellen, 2 Views, 2 Rollen)** | €8.000-12.000 Setup, €1.800-2.500/Mo |
| **Tier M + Anomalie-Erkennung** | +€1.500-2.500 Setup |
| **Tier M + Custom-Domain + Full White-Label** | +€800-1.500 Setup |
| **Tier L (8-10 Quellen, 5+ Views, 4+ Rollen)** | €18.000-30.000 Setup, €3.000-4.500/Mo |
| **Tier L + Live-Streaming (< 1 Min. Delay)** | +€3.000-8.000 Setup je nach Infrastruktur |
| **Retainer ohne Hosting (Customer hostet selbst)** | -€400-600/Mo, aber: Dokumentationspflicht erhöht sich; einmalig +€800 für Übergabe-Paket |
| **Externer Datenquellen-Zugangsbeschaffung durch AEVUM** | +€150/h Discovery-Aufwand |