# AEVUM Agent-Org — Proposal 2026-05-19

## Prinzip
AEVUM wird **komplett von Agents gemanaged**. Carlos bekommt nur End-Notifications und Approval-Gates bei kritischen Entscheidungen. NEXUS bleibt CEO, AEVUM_HEAD reportet an NEXUS.

## Hierarchie

```
NEXUS (CEO, $30/Mo)
└── AEVUM_HEAD ($25/Mo, existiert)
    ├── AEVUM_SALES    ($15/Mo neu)
    ├── AEVUM_FINANCE  ($15/Mo neu)
    └── AEVUM_CODER    ($15/Mo neu)
```

**Gesamt AEVUM-Team: $70/Mo**

## Rollen

### AEVUM_HEAD (existiert)
- Koordiniert Sub-Agents
- Briefing-Output aus Workflow Generation Machine reviewt
- Eskaliert Cross-Team Tasks an NEXUS
- Wöchentlicher Status-Report an Carlos via TG

### AEVUM_SALES (neu)
- Outbound-Calls vorbereiten (Skripte aus Miguel-Coaching)
- Pitch-Drafts pro Lead generieren
- Lead-Qualifizierung mit Budget-Check
- Calendly-Sync, Termin-Bestätigungen
- CRM-Update (Airtable)
- KPI: Setting-Calls/Closing-Calls Conversion

### AEVUM_FINANCE (neu)
- Stripe-Setup verwalten (Payment Links pro Service)
- Invoice-Generation
- MRR/Cashflow-Tracking
- Tax-Prep (Belege organisieren)
- KPI: Revenue, MRR-Growth, Churn

### AEVUM_CODER (neu)
- Frontend-Patches (Kimi-Output integrieren)
- Backend-API für Workflow Generation Machine
- Audit-Worker bauen
- Stripe-Webhooks
- Deploy via Vercel/VPS
- KPI: Deploy-Frequenz, Bug-Rate

## Approval-Gates für Carlos

| Event | Approval nötig? |
|---|---|
| Neuer Audit-Submit (WGM) | Ja — Carlos reviewt generiertes Briefing |
| Stripe Payment Link >5k | Ja |
| Outbound-Pitch an neuen Lead | Ja (anfangs) — später auto bei Templates |
| Deploy zu Production | Ja anfangs, später Staging-Auto + Prod-Manual |
| Wöchentlicher MRR-Report | Nein — automatisch TG |

## Implementierungs-Reihenfolge

1. **AEVUM_CODER zuerst** — baut Workflow Generation Machine Backend
2. **AEVUM_FINANCE parallel** — Stripe-Setup, Payment-Links für S/M/L
3. **AEVUM_SALES letzt** — wenn erste Leads über WGM reinkommen

## Offene Fragen

- AEVUM_HEAD Instructions aktualisieren auf neue Org-Struktur?
- Sub-Agents bekommen eigene AGENTS.md mit Persona + Skills?
- Heartbeat-Intervalle (NEXUS=5min, AEVUM_HEAD=15min, Subs=on-demand)?
