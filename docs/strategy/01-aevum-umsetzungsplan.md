# Aevum System — Umsetzungsplan, Roadmap und Website-Blueprint

## Zielbild

Aevum System soll von der bisherigen Sales-Seite unter `sales.lennoxos.com` auf `aevum-system.de` als zentrale Brand-, Sales- und Conversion-Plattform umgestellt werden.[cite:17] Die neue Website soll drei Kernfunktionen bündeln: klar verkaufbare Service-Angebote, einen Workflow-/Audit-Einstieg für individuelle Projekte und später einen geschützten Kundenbereich für Upgrades, Dokumente und Add-ons.[cite:17][cite:105]

Die Seite soll nicht als allgemeine Agentur-Website wirken, sondern als strukturierter Angebots-Hub für AI-Services, Automationen, Websites, Lead-Systeme und branchenspezifische Lösungen.[cite:42][cite:95] Die vier aktuellen Pilotfälle — Kevin, Tim, Patrick und Miguel — dienen dabei als Grundlage für wiederholbare Angebotslogik, Cases und Nischenseiten.[cite:39][cite:42]

## Grundprinzipien

- Eine Hauptdomain, keine unnötige Subdomain-Zersplitterung.[cite:25][cite:26][cite:34]
- Seitenstruktur über Subdirectories, z. B. `/services/websites` oder `/industries/ecommerce`, nicht über viele Subdomains.[cite:25][cite:27][cite:70]
- Zuerst Umsatz- und Lead-Funktionalität bauen, danach SEO-Ausbau, danach Portal und Newsletter.[cite:17][cite:77]
- Zuerst einfache Stripe-Zahlungslogik mit Payment Links statt sofort komplexem Custom Checkout.[cite:99][cite:101][cite:112]
- Die Website kombiniert zwei Einstiege: direkt buchbare Standardleistungen und individuelle Projektanfragen über die Workflow Generation Machine.[cite:17][cite:42]

## Geschäftsmodell

Das Grundmodell besteht aus 50 Prozent Upfront-Zahlung zum Projektstart, 50 Prozent bei Fertigstellung und einem anschließenden Retainer für Betreuung, Optimierung und Weiterentwicklung.[cite:17][cite:77] Dieses Modell passt zu produktisierten Services mit individueller Umsetzung besser als ein reiner Monatsretainer ohne Setup-Zahlung.[cite:76][cite:77]

### Angebotslogik

| Typ | Beschreibung | Primärer CTA |
|---|---|---|
| Standardisierte Services | Klare Pakete mit definiertem Umfang, Preisrahmen, Dauer und Ergebnis | Direkt buchen via Stripe [cite:99] |
| Individuelle Projekte | Kunden geben Business, Prozesse, Ziele und Dateien ein | Workflow-Audit starten / Call buchen [cite:17] |
| Add-ons / Erweiterungen | Spätere Zusatzmodule für Bestandskunden | Im Portal oder per persönlichem Angebot [cite:105] |

## Informationsarchitektur

Die Website sollte in zwei Ebenen gedacht werden: Service-Seiten und Industry-/Nischenseiten.[cite:47][cite:56] Service-Seiten erklären, **was** angeboten wird; Industry-Seiten erklären, **für wen** es relevant ist und welche Kombinationen sinnvoll sind.[cite:47][cite:59]

### Kernseiten der ersten Version

- `/` — Landingpage / Brand-Hub
- `/services` — Überblick aller Leistungen
- `/services/websites`
- `/services/lead-generation`
- `/services/content-workflows`
- `/services/ai-automation`
- `/workflow-audit`
- `/cases`
- `/industries/ecommerce`
- `/industries/personal-brands`
- `/industries/real-estate`
- `/industries/b2b-sales` [cite:17][cite:39][cite:47][cite:56]

### Seiten der späteren Version

- `/client-portal`
- `/newsletter`
- `/bundle-offers`
- `/login`
- `/account` [cite:17][cite:105]

## Rollen der wichtigsten Seiten

### 1. Landingpage

Die Landingpage verkauft nicht jedes Detail, sondern positioniert Aevum klar: AI-Systeme, Websites, Lead-Setups und Automationen für konkrete Business-Ergebnisse.[cite:42][cite:95] Die Seite braucht zwei klare Wege: „Services ansehen“ und „Workflow-Audit starten“.[cite:17]

Empfohlene Sektionen:
- Hero mit Positionierung und Hauptversprechen
- Welche Probleme gelöst werden
- Überblick über Kernleistungen
- Für wen Aevum gebaut ist
- Proof / Cases
- CTA: Direkt buchen oder Call buchen

### 2. Services-Übersicht

Diese Seite zeigt die Hauptkategorien und verlinkt auf jede einzelne Angebotsseite.[cite:47] Ziel ist Klarheit, nicht Detailtiefe.

Empfohlene Kacheln:
- Websites
- Lead Generation
- Content Workflows
- AI Automation
- Individuelle Systeme

### 3. Einzelne Service-Seiten

Jede Service-Seite muss vollständig sein: Problem, Zielgruppe, Deliverables, Ablauf, Dauer, Preislogik, erwarteter Nutzen, CTA.[cite:47][cite:59] Jede Seite soll sowohl informativ als auch closend sein.

Pflichtsektionen pro Service-Seite:
- Für wen ist das?
- Welches Problem wird gelöst?
- Was ist enthalten?
- Ablauf in 3–6 Schritten
- Dauer / Lieferzeit
- Preisrahmen oder Angebotslogik
- Option A: Direkt buchen
- Option B: Call buchen
- passende Referenz / Beispiel [cite:47][cite:59]

### 4. Workflow Generation Machine / Audit-Seite

Diese Seite ist das Herzstück für individuelle High-Ticket-Projekte.[cite:17] Nutzer sollen dort ihr Business, ihre Brand, Prozesse, Ziele, Probleme und optional Dokumente oder PDFs hochladen können, damit daraus intern ein Briefing und später ein Angebot erstellt werden kann.[cite:17][cite:42]

Pflichtfelder:
- Name / Unternehmen
- Branche / Zielgruppe
- Beschreibung des Business
- Aktuelle Prozesse
- Engpässe / Probleme
- gewünschtes Ziel
- vorhandene Tools / Tech-Stack
- Uploads (PDF, SOP, Beschreibung, Screenshots)
- Budgetrahmen
- Wunsch: direkt Angebot oder Erstgespräch

Interner Output:
- Kundenzusammenfassung
- Bedarfsanalyse
- empfohlene Module
- Aufwandsschätzung
- Angebotsvorschlag
- nächster Schritt

### 5. Cases-Seite

Die Cases-Seite dient als Vertrauensaufbau und Übersetzungsfläche von Pilotprojekten in verkaufbare Angebotslogik.[cite:39][cite:42] Es geht nicht darum, interne Komplexität zu zeigen, sondern Vorher-Nachher-Nutzen und Systemdenken sichtbar zu machen.[cite:95]

Empfohlene Start-Cases:
- E-Commerce / Ketolabs / Kevin
- Personal Brand / Tim
- Real Estate / Patrick
- B2B Sales / Miguel [cite:39][cite:95]

### 6. Industry-Seiten

Industry-Seiten sind sinnvoll, weil gute Service-Websites Leistung und Zielgruppe kombinieren.[cite:47][cite:56] Diese Seiten dürfen nicht generisch sein; jede Seite braucht klare Pain Points, passende Service-Kombinationen und idealerweise einen passenden Case.[cite:51][cite:54]

Pflichtstruktur:
- Zielgruppe benennen
- deren typische Probleme nennen
- passende Aevum-Services zuordnen
- typischen Ablauf zeigen
- Case oder Beispiel referenzieren
- CTA zum Audit oder Call

## SEO-Ansatz

Für SEO ist die Slash-Struktur sinnvoller als viele Subdomains, weil Inhalte, Autorität und interne Verlinkung besser auf einer Domain gebündelt werden.[cite:25][cite:26][cite:34] Service- und Industry-Seiten sollten sauber miteinander verlinkt werden, statt isoliert nebeneinander zu existieren.[cite:47][cite:56]

### SEO-Regeln

- Pro Seite ein klares Haupt-Keyword / Suchintent
- Keine dünnen Copy-Paste-Nischenseiten
- Jede Seite bekommt klaren Mehrwert, Prozessbeschreibung und CTA
- interne Verlinkung zwischen Services, Industries, Cases und Audit
- Meta-Title, Meta-Description, H1, H2-Struktur sauber setzen
- FAQ nur dort, wo sie wirklich hilft
- Cases und Proof gezielt nutzen [cite:47][cite:51][cite:54]

## Stripe-Logik

Für den Start ist Stripe Payment Links die pragmatischste Lösung.[cite:99][cite:101][cite:112] Damit lassen sich einzelne Leistungen oder Deposit-Links schnell live schalten, ohne dass sofort ein kompletter Custom Checkout gebaut werden muss.[cite:99][cite:109]

### Empfohlene erste Zahlungsstruktur

| Zahlungsfall | Umsetzung |
|---|---|
| 50 % Anzahlung | Stripe Payment Link oder Checkout für Projektstart [cite:99][cite:101] |
| Restzahlung | zweiter Stripe-Link nach Freigabe / Lieferstatus |
| Call statt Direktkauf | Kalenderlink / Buchungsflow |
| Retainer | Später als wiederkehrendes Stripe-Produkt / Subscription [cite:80][cite:88] |

Wichtig ist, dass der Retainer inhaltlich klar begründet ist, z. B. Betreuung, Wartung, Iteration, Reporting oder Systempflege, und nicht willkürlich wirkt.[cite:77]

## Kundenportal

Das Kundenportal ist sinnvoll, aber nicht für Phase 1.[cite:17][cite:105] Zuerst müssen Sales-Funnel, Angebotsseiten und die Workflow Generation Machine Umsatz und qualifizierte Anfragen erzeugen; erst danach lohnt sich ein geschützter Kundenbereich.[cite:17][cite:77]

### Phase-1-Portal vermeiden

Nicht sofort bauen:
- komplexe Rollen- und Rechteverwaltung
- tiefe Self-Service-Funktionen
- Bundle-Logik im Portal
- kompletter App-Store-Charakter

### Spätere MVP-Funktionen des Portals

- Login
- Übersicht gekaufter Leistungen
- Projektstatus / Deliverables
- Rechnungen / Zahlungsstatus
- vorgeschlagene Add-ons
- Dokumente / Uploads [cite:84][cite:87][cite:90][cite:105]

## Newsletter und Upsells

Newsletter und Launch-Kommunikation sind sinnvoll, aber als spätere Ausbauphase.[cite:17] Ein Newsletter wird dann stark, wenn bereits Website-Traffic, Cases, Bestandskunden und neue Tools/Add-ons vorhanden sind.[cite:83][cite:86][cite:89]

### Spätere Segmentierung

| Segment | Inhalt |
|---|---|
| Leads | Cases, neue Tools, Education, Angebote [cite:83][cite:89] |
| Bestandskunden | Add-ons, Bundle-Angebote, günstigere Erweiterungen, Launches [cite:86][cite:91] |

## Technische Prioritäten

Die technische Umsetzung sollte in klarer Reihenfolge erfolgen, damit keine Überkomplexität entsteht.[cite:17][cite:77]

### Phase 1 — Fundament

- Aevum als Hauptdomain-Struktur finalisieren
- aktuelle Sales-Inhalte inventarisieren
- neue Sitemap definieren
- Offer-Logik und CTA-Logik festziehen
- Stripe Payment Links anlegen [cite:17][cite:99]

### Phase 2 — Umsatzfähige Website

- Landingpage bauen
- Services-Übersicht bauen
- 4 Kern-Service-Seiten bauen
- Cases-Seite v1 bauen
- Call-Buchung integrieren
- erste Conversion-Events messen [cite:47][cite:59]

### Phase 3 — Workflow Generation Machine

- Formular / Upload-Flow bauen
- internes Briefing-Output-Format definieren
- Angebotsableitung standardisieren
- Telegram / Dashboard / CRM-Weiterleitung aufsetzen [cite:17][cite:96]

### Phase 4 — SEO- und Nischenausbau

- 4 Industry-Seiten bauen
- interne Verlinkung ausrollen
- je Nische Cases und passende Services verknüpfen [cite:47][cite:56]

### Phase 5 — Kundenportal MVP

- Login
- Übersicht der Käufe
- Dokumente / Status
- erste Upgrade-Logik [cite:105][cite:108]

### Phase 6 — Newsletter und Upsell-System

- Newsletter-Opt-in
- Segmentierung
- Produkt-Launch-Kommunikation
- Bestandskunden-Offers und Bundles [cite:83][cite:89][cite:91]

## Priorisierte Angebotskategorien

Die ersten Kategorien sollten sich an den bereits gebauten oder im Bau befindlichen Systemen orientieren.[cite:39][cite:95]

| Kategorie | Warum sinnvoll |
|---|---|
| Websites | klar erklärbar, schnell verkaufbar, direkt sichtbar [cite:17] |
| Lead Generation | starker Business-Nutzen, hoher Sales-Wert [cite:42] |
| Content Workflows | besonders relevant für Personal Brands und Beratung [cite:18] |
| AI Automation | höchster Hebel für individuelle Projekte [cite:17][cite:96] |

## Pilotkunden als Beweislogik

Die Pilotkunden sollten als Case-Grundlage und nicht als Sonderwelten verstanden werden.[cite:39][cite:42] Ziel ist ein Core-System, das je Branche anders verpackt, aber technisch und strategisch ähnlich aufgebaut wird.[cite:42][cite:96]

| Pilotfall | Nische | Mögliche externe Verpackung |
|---|---|---|
| Kevin / Ketolabs | E-Commerce | E-Commerce OS, Ads-/Retention-/Website-/Dashboard-System [cite:95] |
| Tim | Personal Brand / Consulting | Content- und Ad-Script-Automation, Client-Workflows [cite:18][cite:21] |
| Patrick | Real Estate | Lead-, Anfrage-, Website- und CRM-System [cite:42] |
| Miguel | B2B Sales / Energie | Leadlisten, Outreach, Recruiting- und Vertriebsprozesse [cite:45] |

## KPI-Tracking für die erste Version

Die erste Version braucht keine komplexe Analytics-Landschaft, aber ein paar Kernmetriken sind Pflicht.

- Besucher auf Landingpage
- Besucher auf Service-Seiten
- Klicks auf „Direkt buchen"
- Klicks auf „Call buchen"
- gestartete Workflow-Audits
- abgeschickte Workflow-Audits
- Conversion pro Angebotsseite
- Verhältnis Standardkauf vs. Call-Anfrage

## Konkrete Umsetzungsreihenfolge

1. Bestehende Inhalte von `sales.lennoxos.com` prüfen und in Aevum-Struktur überführen.[cite:17]
2. Positionierung und Angebotslogik final formulieren.[cite:42]
3. Landingpage, Services-Übersicht und 4 Service-Seiten bauen.[cite:47][cite:59]
4. Stripe Payment Links und Call-Buchung integrieren.[cite:99][cite:101]
5. Cases-Seite mit Kevin, Tim, Patrick, Miguel aufsetzen.[cite:39][cite:95]
6. Workflow Generation Machine live bringen.[cite:17]
7. Erst danach Industry-Seiten und SEO-Ausbau starten.[cite:47][cite:56]
8. Erst mit ersten Kunden Portal-MVP planen.[cite:105][cite:108]
9. Newsletter und Bundle-/Upsell-Logik ganz zum Schluss ergänzen.[cite:83][cite:89]

## Entscheidungen, die jetzt fest sein sollten

- Aevum ist die Hauptmarke und Hauptdomain.[cite:17]
- Die Website bekommt eine Slash-Struktur, keine unnötigen Subdomains.[cite:25][cite:34]
- Der Startfokus liegt auf Shop, Service-Seiten und Workflow Generation Machine.[cite:17]
- Stripe wird zuerst pragmatisch, nicht maximal komplex, eingebunden.[cite:99][cite:101]
- Kundenportal und Newsletter sind spätere Ausbauphasen, nicht Teil des ersten Launches.[cite:17][cite:105]
- Die vier Pilotkunden liefern Cases und Angebotslogik für die ersten Nischen.[cite:39][cite:42]

## Kurzfazit

Die richtige Reihenfolge lautet: erst Conversion-Maschine, dann SEO-/Content-Maschine, dann Kunden-Maschine.[cite:17][cite:47][cite:105] Aevum sollte zuerst verkaufen und scopen, danach systematisieren und erst später zu einem tieferen Portal- und Newsletter-System ausgebaut werden.[cite:17][cite:77]
