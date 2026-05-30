# Social-Repurpose — DSGVO-Konformitäts-Check

**Blueprint:** social-repurpose
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei Unsicherheit Anwalt/DSB konsultieren.

---

## 0. Einordnung

Social-Repurpose verarbeitet primär **Content-Daten** (vom Customer selbst erstellte Blog-/Video-Inhalte), keine fremden personenbezogenen Bestandsdaten wie bei Cold-Outreach oder Lead-Tools. Der DSGVO-Fokus liegt daher auf:

1. **PII im Content selbst** (Asset kann Namen, Zitate, Personen-bezogene Aussagen enthalten)
2. **Drittland-Transfer** des Contents an den LLM-Provider (OpenRouter → US-Modelle)
3. **EU-AI-Act-Transparenz** für KI-generierten, öffentlich publizierten Content

Geringeres Risiko als datengetriebene Outbound-Blueprints, aber nicht null.

---

## 1. Datenfluss-Analyse

**Welche Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Long-Form-Asset (Titel + Body) | Content-Daten, ggf. mit PII (Namen, Zitate Dritter) | CMS-Quelle + n8n-Execution-Log + OpenRouter-Logs | n8n <30d; OpenRouter laut DPA; CMS Customer-Choice |
| Asset-URL | Öffentlicher Link | n8n + Draft-Store | wie Draft-Store |
| Generierte Posts (5×) | abgeleiteter KI-Output, kann PII aus Quelle übernehmen | n8n + Draft-Store + Digest-Mail-Inbox | Draft-Store Customer-Choice; Mail provider-spezifisch |
| Brand-Konfiguration (brandName etc.) | Unternehmens-/ggf. Personenname (PB) | n8n-Workflow-Config | dauerhaft (Config) |
| approval-/sender-/alert-Email | Kontaktdaten (interne MA-Mails) | n8n-Config + Mail-Provider-Logs | dauerhaft (Config) / provider-spezifisch |

**Potential für besondere Kategorien (Art. 9 DSGVO):** Wenn das Long-Form-Asset Gesundheits-, politische, religiöse o.ä. Inhalte über benannte Personen enthält, fließt das via OpenRouter zum US-Provider. Customer muss prüfen, ob das Asset sensible Personendaten Dritter enthält, bevor er es durch den Workflow schickt.

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Verarbeitung eigener Content-Daten (Repurpose) | **Art. 6 (1) lit. f DSGVO** — berechtigtes Interesse (Marketing/Distribution eigener Inhalte) |
| Verarbeitung von PII Dritter, die im Asset vorkommen | abhängig von der ursprünglichen Grundlage der Veröffentlichung (war das Asset rechtmäßig publiziert, gilt die Distribution als gedeckt; bei neuen Personendaten eigene Prüfung) |
| KI-Repurpose via OpenRouter | **Art. 6 (1) lit. f** + **Art. 28 DSGVO (Auftragsverarbeitung)**, OpenRouter + Model-Provider als (Sub-)Auftragsverarbeiter |
| Versand Digest/Alert an interne MA | **Art. 6 (1) lit. f** (Organisations-Interesse) bzw. **lit. b** (Arbeitsverhältnis) |

**Customer-Pflicht:** Wenn im Long-Form-Asset Personen Dritter namentlich/bildlich vorkommen (Interviewpartner, Kunden-Testimonials, zitierte Personen), muss die Weiterverarbeitung + Social-Distribution von deren ursprünglicher Einwilligung/Rechtsgrundlage gedeckt sein. Der Workflow ändert daran nichts — er verteilt nur, was der Customer einspeist.

---

## 3. Pflicht-Konfiguration im Workflow

### A) Modell-/Routing-Wahl
- EU-routbares Modell wählen (Claude / Mistral) wo möglich
- Keine vertraulichen/unveröffentlichten Assets mit Personen-bezogenem Inhalt durch den US-LLM schicken

### B) Mail-Absender
- `senderEmail` / Fehler-`senderEmail`: eigene Domain, real existierendes Postfach (kein `noreply@` ohne Monitoring)

### C) Draft-Store-Zugriff
- Token scoped auf genau eine Table/Database, write-only wo möglich

### D) KI-Transparenz im publizierten Post
- Posts sind KI-gestützt erstellt. Für rein werblichen Eigen-Content besteht keine harte Kennzeichnungspflicht, aber EU-AI-Act Art. 50 verlangt Transparenz bei bestimmten KI-Inhalten (siehe Abschnitt 8). Empfehlung: interne Doku, dass Posts KI-assistiert sind.

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem aktiv genutzten.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — | 🟢 LOW wenn EU-Server |
| **OpenRouter** | KI-Repurpose-Engine | ❌ US — leitet weiter an Model-Provider (Anthropic/OpenAI/Mistral) | openrouter.ai/privacy | 🟠 HIGH (Content-Transfer in Drittland, SCC + Customer-Hinweis Pflicht) |
| **Anthropic / OpenAI / Mistral** | LLM-Sub-Processor (je nach Modell) | gemischt (Mistral EU, Anthropic/OpenAI US mit SCC) | jeweilige DPA | 🟡 MEDIUM |
| **CMS-Quelle** (WordPress/Ghost/Webflow) | Content-Quelle | Customer-Choice | jeweilige DPA | 🟢 LOW wenn EU |
| **Airtable** | Draft-Store | ❌ US (mit SCC) | airtable.com/company/dpa | 🟡 MEDIUM |
| **Notion** | Draft-Store (alternativ) | ❌ US (mit SCC) | notion.so/dpa | 🟡 MEDIUM |
| **Supabase** | Draft-Store (alternativ) | ✅ EU-Region wählbar | supabase.com/legal/dpa | 🟢 LOW wenn EU |
| **Mail-Provider** (SMTP/Resend/Postmark) | Digest + Alert | provider-spezifisch | jeweilige DPA | 🟢 LOW wenn EU |
| **Buffer / Ayrshare** (nur DFY-Auto-Post) | Social-Publishing | ❌ US | jeweilige DPA | 🟡 MEDIUM |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors ins Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO)
2. SCCs bei US-Vendors (OpenRouter, Airtable/Notion) prüfen
3. In Datenschutzerklärung: Auftragsverarbeiter-Liste + Drittland-Transfer + KI-Nutzung erwähnen

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint-Kontext |
|---|---|
| **Auskunft** (Art. 15) | Greift nur, wenn im Content PII Dritter vorkommt. Customer-Prozess: CMS + Draft-Store + Mail-Logs durchsuchen |
| **Berichtigung** (Art. 16) | Im Quell-Asset korrigieren, Workflow neu laufen lassen, alte Drafts verwerfen |
| **Löschung** (Art. 17) | n8n-Log Auto-Cleanup 30d. Draft-Store + publizierte Posts: Customer-Pflicht, betroffene Posts depublizieren + Drafts löschen |
| **Einschränkung** (Art. 18) | Asset aus dem Repurpose-Lauf nehmen, betroffene Drafts auf Hold |
| **Datenübertragbarkeit** (Art. 20) | i.d.R. nicht einschlägig (eigener Content) |
| **Widerspruch** (Art. 21) | Wenn benannte Dritte der Distribution widersprechen: Posts mit deren Daten depublizieren, Asset aus dem Workflow nehmen |
| **Automatisierte Einzelentscheidung** (Art. 22) | Nicht einschlägig — KI-Repurpose ist Content-Erstellung, keine rechtliche/erhebliche Entscheidung über Personen |

---

## 6. Löschfristen-Logik

| Daten | Aufbewahrung | Grund |
|---|---|---|
| n8n-Execution-Log (inkl. Asset-Text + Posts) | 30 Tage | Operational, Datenminimierung |
| Drafts im Draft-Store | Customer-Policy (z.B. 90d nach Veröffentlichung/Verwerfung) | Marketing-Lifecycle |
| Publizierte Posts | Plattform + Customer-Entscheidung | außerhalb des Workflow-Scopes |
| OpenRouter-Logs | OpenRouter-Settings (no-log-Modus aktivieren wenn verfügbar) | Drittland-Minimierung |
| Brand-/Mail-Config | dauerhaft (Betriebskonfiguration) | — |

**Implementation:** n8n-Settings → Execution-Data → 30d Retention. Draft-Store-Cleanup als Customer-Cron (alte verworfene Drafts löschen).

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **In der Regel nein** für Repurpose eigenen, bereits veröffentlichten Marketing-Contents ohne besondere Kategorien.

→ **Ja / prüfen** wenn:
- Assets systematisch sensible Personendaten Dritter enthalten (Art. 9)
- großvolumige Verarbeitung mit Personenbezug
- Auto-Posten + Profiling-Komponenten ergänzt werden

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Social-Repurpose |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — OpenRouter-LLM-Call ist klar ein AI-System (Art. 3 (1)) |
| **Risk-Class** | **Limited Risk** — generiert synthetischen Text-Content für die Öffentlichkeit |
| **Transparenz-Pflicht (Art. 50)** | KI-generierter, öffentlich verbreiteter Content muss als künstlich erzeugt/manipuliert erkennbar sein, sofern nicht offensichtlich redaktionell verantwortet. Bei menschlicher Freigabe + redaktioneller Verantwortung (= dieser Workflow mit Digest-Approval) ist die Schwelle entschärft |
| **High-Risk?** | Nein (kein Annex-III-Fall) |
| **Prohibited?** | Nein (kein Social-Scoring, keine Manipulation — solange Posts nicht täuschend/manipulativ sind) |

**Customer-Action für AI-Act-Compliance:**
- Menschliche Freigabe (Digest-Approval) **beibehalten** — sie begründet redaktionelle Verantwortung und entschärft die Kennzeichnungspflicht
- In DS-/Transparenz-Doku: „Wir nutzen KI-gestützte Content-Aufbereitung" aufnehmen
- KEINE manipulativen/täuschenden Post-Patterns (Fake-Erfahrungsberichte, erfundene Zahlen)
- Bei voll-automatischem Posten (DFY-Addon, ohne menschliche Prüfung): Kennzeichnungspflicht erneut bewerten, ggf. KI-Hinweis am Post

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung aktualisiert (KI-Nutzung + Vendor-Liste + Drittland-Transfer)
- [ ] Geprüft, ob durchlaufende Assets PII Dritter / Art.-9-Daten enthalten
- [ ] EU-routbares LLM-Modell gewählt (Claude/Mistral) ODER Drittland-Transfer dokumentiert
- [ ] Vendor-DPAs gegengezeichnet + in Art.-30-Verzeichnis
- [ ] SCCs bei US-Vendors (OpenRouter, Airtable/Notion) bestätigt
- [ ] EU-Hosting bei n8n + Mail + ggf. Supabase gewählt
- [ ] n8n-Execution-Log auf 30d Retention
- [ ] Draft-Store-Cleanup-Policy definiert
- [ ] Menschliche Freigabe (Digest-Approval) aktiv — kein blindes Auto-Post
- [ ] OpenRouter no-log-Modus geprüft/aktiviert
- [ ] Sensitive-Field-Masking für Body-Felder in Logs
- [ ] Carlos hat Sign-Off-Dokument (bei DFY)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt
- [x] PII-im-Content + Art.-9-Hinweis dokumentiert
- [x] Pflicht-Konfiguration (Modell-Routing + Absender + Store-Scope)
- [x] Vendor-DPA-Übersicht (10 Vendors)
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung (Limited Risk, Transparenz via menschliche Freigabe entschärft)
- [x] Audit-Checkliste vor Go-Live
- [ ] Anwaltliche Validierung der DS-Klauseln + Drittpersonen-Content-Prüfung — Customer-Action, nicht Blueprint-Block
