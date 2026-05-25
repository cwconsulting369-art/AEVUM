# AEVUM Blueprint: Newsletter Growth Machine

## In einem Satz

Dieser Workflow generiert jeden Mittwoch automatisch einen versandfertigen Newsletter-Entwurf (800–1.200 Wörter), schickt ihn zur menschlichen Freigabe, und published erst nach deinem Klick — ohne dass du eine leere Seite sehen musst.

---

## Wer das braucht

| Segment | Konkreter Use Case | Fit |
|---|---|---|
| **AG** Agentur (3–50 MA) | Positionierungs-Newsletter für Kunden-Retention und Inbound-Leads; wöchentlicher Aufwand derzeit: 3–5h Texter-Zeit | 🟢 Hoch |
| **PB** Personal Brand (Coach/Berater) | Thought-Leadership-Newsletter für Listenaufbau; Problem: Schreiben verdrängt Billable Hours | 🟢 Sehr hoch |
| **FI** Mittelstand B2B-Dienstleister | Kunden-Newsletter für Cross-Sell / Bestandskundenpflege; aktuell unregelmäßig oder gar nicht | 🟠 Mittel (braucht Tone-Customization) |

---

## Was der Customer bekommt

1. Fertiger n8n-Workflow (11 Nodes, import-ready) mit wöchentlichem Cron-Trigger
2. KI-gesteuerte Themen-Ideation (5 Vorschläge, automatisch bestes Thema selektiert)
3. Zweistufige Content-Generierung: Outline → Full Draft (800–1.200 Wörter)
4. Review-E-Mail mit Approve-Link — du liest, du entscheidest, du klickst
5. Automatischer Push in Beehiiv (oder Mailchimp) als Draft/Scheduled
6. Vollständige Dokumentation: Setup-Guide, DSGVO-Check, Security-Matrix
7. Konfigurierbare Nischen-Parameter: Thema, Zielgruppe, Ton, Format

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher |
|---|---|---|
| Zeitaufwand pro Ausgabe | 3–6h (Thema finden, schreiben, formatieren) | 15–30 Min (lesen, editieren, freigeben) |
| Erscheinungsfrequenz | Unregelmäßig, "wenn Zeit ist" | Jeden Mittwoch, deterministisch |
| Kontrollverlust-Risiko | Null — nichts wird veröffentlicht | Null — menschlicher Freigabe-Gate bleibt |
| Qualitäts-Floor | Abhängig von Tagesverfassung | Konsistente Struktur, Outline-gestützt |
| Toolwechsel-Reibung | Recherche → Docs → Copy-Paste → Beehiiv | Ein Workflow, ein Klick |

### ROI-Schätzung (konservativ)

- **Zeitersparnis:** 3h/Woche × 48 Wochen = 144h/Jahr
- **Opportunitätskosten bei 150 EUR/h (Berater):** 21.600 EUR/Jahr
- **Oder:** 1 zusätzlicher Consulting-Tag/Woche = 7.200–15.000 EUR/Jahr Mehrumsatz
- **Break-even Blueprint-Tier S:** < 6 Wochen

---

## Pricing-Logic

| Tier | Beschreibung | Setup | Monatlich | Für wen |
|---|---|---|---|---|
| **Blueprint** (Self-Service) | JSON + Docs, kein Support | 297–497 EUR einmalig | — | Technisch affine PB mit n8n-Erfahrung |
| **DFY S** (Done-for-You Small) | Setup, Credentials, Test-Run, 30 Tage Support | 2.000–4.000 EUR | 1.000–1.500 EUR | PB ohne Ops-Ressourcen, AG mit <10 MA |
| **DFY M** (Done-for-You Medium) | DFY S + Multi-Newsletter (bis 3 Publikationen), Custom Tone-System, DSGVO-Packet | 8.000–14.000 EUR | 2.000–3.000 EUR | AG mit mehreren Kunden-Newslettern, FI |
| **DwY** (Done-with-You) | Gemeinsames Setup + Prompt-Engineering-Workshop | 3.000–5.000 EUR | — | PB/FI mit eigenem Tech-Team |
| **Audit Only** | Review bestehender Newsletter-Automation auf Gaps | 1.500–2.500 EUR | — | Wer bereits etwas gebaut hat |

---

## Voraussetzungen Customer

- Aktives n8n-Konto (Self-Hosted oder Cloud ab "Pro"-Plan wegen Webhook-Wait-Node)
- OpenRouter API Key mit aktiviertem Budget (empfohlen: min. 10 EUR/Monat, reicht für ~50 Newsletter)
- Beehiiv-Konto (Free Tier reicht für Setup) oder Mailchimp mit API-Zugriff
- SMTP-Zugang oder Resend-Account für Review-Mails
- Klare Definition von Nische, Zielgruppe und Ton (15-minütiges Briefing-Sheet wird mitgeliefert)
- Technisches Mindestniveau: Credentials in n8n eintragen, Copy-Paste von API Keys

---

## Nicht-Ziele

Dieser Blueprint macht **nicht**:

- Automatische Themen-Recherche aus Live-Quellen (RSS, Twitter/X, News-APIs) — das ist ein separates Add-on
- A/B-Testing von Subject Lines
- Subscriber-Segmentierung oder personalisierte Versionen
- Automatischen Versand ohne menschlichen Review (by design — wer das will, muss den Wait-Node entfernen, auf eigene Verantwortung)
- Bildgenerierung oder Design-Elemente
- Multi-Language-Output (Prompt-Anpassung möglich, aber nicht getestet)
- CRM-Sync oder Conversion-Tracking

---

## Upsell-Pfade

| Nächster Schritt | Beschreibung | Delta-Investment |
|---|---|---|
| **Content-Factory Add-on** | Themen-Ideation aus RSS/News-API statt statischem Prompt | +1.500–3.000 EUR Setup |
| **Social Repurposing** | Newsletter-Draft → LinkedIn-Posts, X-Threads automatisch | +2.000–4.000 EUR Setup |
| **Analytics-Loop** | Open-Rate / Click-Rate zurück in Ideation-Prompt (welche Themen performen) | +3.000–6.000 EUR |
| **Multi-Brand** | Gleicher Workflow für 3–10 Newsletter-Brands / Kunden parallel | +5.000–12.000 EUR |
| **Lead-Magnet-Machine** | Newsletter-Best-of → automatisch PDF-Lead-Magnet generieren | +2.500–5.000 EUR |

---

## Conversion-Story

Du sitzt Dienstagabend am Laptop. Die Idee war gut, der Draft ist leer, der Kaffee kalt. Nächste Woche dann. Das wiederholt sich seit drei Monaten — und deine Liste bemerkt es. Open-Rates sinken nicht weil deine Themen schlecht sind, sondern weil du zu selten sendest. Konsistenz schlägt Perfektion, jedes Mal.

Die Newsletter Machine löst nicht das Problem, dass du schreiben *könntest* — sie löst das Problem, dass du es *nicht tust*, weil der Einstieg zu teuer ist. Mittwoch 09:00 Uhr landet ein fertiger Entwurf in deiner Inbox. Du liest 10 Minuten, streichst einen Abschnitt, fügst deine eigene Anekdote ein, klickst "Freigeben". Der Rest ist erledigt. Nicht weil KI besser schreibt als du — sondern weil du mit einem 80%-Entwurf anfängst statt mit einer leeren Seite.

Was das für Agenturen bedeutet: Statt dass ein Texter 4 Stunden für einen Kunden-Newsletter abrechnet, prüft er 20 Minuten einen KI-Draft. Margin-Impact sofort. Für Personal Brands bedeutet es: Newsletter als Kanal wird wieder realistisch neben Kundenarbeit. Und für Mittelständler, die ihren Kunden-Newsletter seit 18 Monaten "planen": Der erste Draft entsteht diese Woche, nicht wenn Budget und Zeit sich irgendwann treffen.