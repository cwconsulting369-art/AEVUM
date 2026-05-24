# AEVUM — Master-Repo

Eines Repo für die gesamte AEVUM-Brand: Sales-Site, Backend, Daten, Strategie, Agents.

Folgt der globalen Regel **"1 Projekt = 1 Repo"**.

> ⚠️ **In Migration:** Dieser Branch (`restructure/monorepo`) baut die Monorepo-Struktur auf. Live-Site auf `main` bleibt unverändert bis Kimi neuen Frontend liefert + Vercel-Root umkonfiguriert wird. Siehe [Migration-Status](#migration-status).

## Layout

```
AEVUM/
├── apps/
│   ├── web/                    NEUE Sales-Site (Kimi-Output → aevum-system.de)
│   ├── web-legacy-react/       Snapshot lennoxos-sales (Referenz für Kimi)
│   └── web-legacy-static/      [später] alte HTML-Statics wenn umgezogen
├── services/
│   └── aevum-api/              Backend (WGM-Endpoints, Stripe, Audit-Worker)
├── agents/                     Paperclip-Personas (AEVUM_HEAD + Sales/Finance/Coder)
├── data/
│   ├── leads/                  outreach-log.csv, Listen
│   ├── templates/              Mail-Templates, Pitch-Vorlagen
│   └── pitches/                Hoffmann-Pitch und folgende
├── docs/
│   ├── strategy/               Umsetzungsplan, Sales-Roadmap, Tim-Context
│   ├── architecture/           Agent-Org-Proposal etc
│   ├── legacy/                 alte READMEs/CLAUDE pre-Rebrand
│   └── changelog.md
├── infra/                      vercel.json (später), pm2.config (später)
│
└── Wurzel-Files (Phase-1 Live-Site, später migriert)
    ├── index.html              ← aktuell aevum-system.de
    ├── aevum-v3.html
    ├── aevum-platform.html
    ├── api/dashboard.js        ← Vercel Serverless Function (Airtable)
    ├── vercel.json
    ├── robots.txt + sitemap.xml
    ├── AIRTABLE-SETUP.md
    └── AEVUM-lead-pipeline.json
```

## Migration-Status

```
Phase 1 ✅  Monorepo-Skeleton erstellt (dieser PR)
            + lennoxos-sales absorbiert nach apps/web-legacy-react/
            + VPS-Content nach data/ migriert
            + Strategie-Docs nach docs/strategy/
Phase 2 ⏳  Kimi pusht neuen Frontend nach apps/web/
Phase 3 ⏳  Vercel-Root von `.` auf apps/web/ umstellen
Phase 4 ⏳  Alte Root-HTMLs nach apps/web-legacy-static/ verschieben
            api/dashboard.js nach services/ migrieren
Phase 5 ⏳  Repo lennoxos-sales archivieren (GitHub Settings)
Phase 6 ⏳  Backend-Skeleton in services/aevum-api/ deployen (pm2 port 3200)
```

**DO NOT MERGE this PR until Phase 2 + 3 ready** — sonst bricht aevum-system.de.

## Deploy-Targets

| Domain | Tech | Status |
|---|---|---|
| aevum-system.de | Vercel, root=`.` | LIVE — bleibt Phase 1 unverändert |
| aevum-system.de (Phase 3+) | Vercel, root=`apps/web/` | umkonfiguriert wenn Kimi liefert |
| API-Endpoint (Phase 6) | pm2 auf VPS, port 3200 | wird aevum-api hosten (WGM-Submit etc) |

## Brand-Architektur (Stand 2026-05-19)

- **AEVUM** = customer-facing Master-Brand. Verkauft Pakete S/M/L + Add-ons. Workflow Generation Machine als Sales-Engine.
- **lennoxOS** = interne Infrastruktur (nicht für Kunden sichtbar).
- **aevum-system.de** = Brand-Hub + Sales + Conversion.
- Productized-Agency-Angebote (Pakete S/M/L + Add-ons) sind branchenneutral und richten sich an Unternehmen 1–50 MA im DACH-Raum, unabhängig von Branche oder Region.

Siehe `docs/strategy/01-aevum-umsetzungsplan.md` für volle Brand-Roadmap.

## Pakete

| Paket | Umfang | Preis |
|---|---|---|
| S — Audit | KI/Automations-Audit, Roadmap mit 3-5 Projekten | 2.000-4.000 € fix |
| M — Wachstum | 1-2 Use-Cases Done-for-you, 6-8 Wochen | 5.000-15.000 € fix |
| L — Skalierung | Retainer mit Monitoring + Optimierung | 2.000-5.000 €/Mo |

**Bezahlung:** Full Price upfront im Shop. Kein 50/50-Split.

## Agent-Org (Paperclip)

```
AEVUM_HEAD                     existiert, idle bis Phase 6
├── AEVUM_SALES                CRM, Pitch-Drafts, Calendly
├── AEVUM_FINANCE              Stripe, MRR-Tracking
└── AEVUM_CODER                Frontend-Patches, Backend-API, Deploy
```

NEXUS bleibt CEO, AEVUM_HEAD reportet zu ihm.

## Strategie-Docs

| Doc | Inhalt |
|---|---|
| `docs/strategy/01-aevum-umsetzungsplan.md` | Perplexity-Output, Brand-Architektur, Phasen |
| `docs/strategy/02-sales-lennoxos-roadmap.md` | Miguel-Coaching, Marketing-Thesis, Pakete |
| `docs/strategy/tim-context.md` | Pilot-Kunde + Affiliate-Status |
| `docs/architecture/agent-org-proposal.md` | AEVUM-Sub-Agents Setup |

## Cross-References

- Personal-OS Rebrand-Folder: `~/personal-os/01-business/aevum/rebrand-2026-05/`
- Paperclip AEVUM_HEAD: live, $25/Mo, idle bis Phase 6

## Regel

**1 Projekt = 1 Repo.** Alle AEVUM-Komponenten gehören hierher als Sub-Folder. Niemals fragmentieren.
