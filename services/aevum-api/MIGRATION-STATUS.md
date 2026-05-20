# AEVUM Supabase — Migration Status

**Project:** `iwyzbiufmdnwmddjkevf` (AEVUM)
**Migration mechanism:** manual paste into Supabase SQL Editor (no CLI)

Run new files **in numeric order**. All migrations are idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

---

## Applied

| # | File | Applied | Notes |
|---|---|---|---|
| 001 | `001_audits.sql` | yes | WGM-Form submissions |
| 002 | `002_security_events.sql` | yes | Blocked attempts log |
| 003 | `003_dsgvo.sql` | yes | B1-B3 baseline: consent_log, erasure_log, audits.consent_version |
| 004 | `004_orders.sql` | yes (2026-05-20) | Stripe shop orders + pilot_slots singleton |
| 005 | `005_dsgvo_audit_logs.sql` | yes (2026-05-20) | `audit_logs` + trigger function + 4 triggers (audits/orders/consent_log/erasure_log) |
| 006 | `006_dsgvo_extend.sql` | yes (2026-05-20) | `dsgvo_settings`, `dsgvo_deletion_due` cols, consent_log.order_id FK, explicit RLS policies |

## Pending

_None — all DSGVO Phase B migrations applied._

---

## How to apply

1. Open Supabase SQL Editor → New query
2. Paste full file content
3. Run
4. Tick the box in this file above

---

## Schema cheatsheet (current)

```
audits              — WGM-form leads (status: new|reviewing|contacted|qualified|closed_won|closed_lost)
orders              — Stripe checkout sessions (status: pending|paid|failed|refunded|cancelled)
pilot_slots         — singleton counter (1/10 → 10/10)
consent_log         — Art 7 proof, linked to audit_id OR order_id
erasure_log         — Art 17 trail (counts: audits/orders/consents/security_events deleted)
security_events     — blocked attempts (validation_fail | honeypot_triggered | too_fast | attack_pattern | rate_limit)

— after migration 005 —
audit_logs          — Art 30 change-trail for every PII write

— after migration 006 —
dsgvo_settings      — singleton: consent_text_version + retention windows
```

---

## Retention windows (codified in `scripts/dsgvo-cleanup.js`, cron `30 3 * * *`)

| What | Retention | Reason |
|---|---|---|
| `security_events.ip` | 30 days, then last-octet-masked | DSGVO Speicherbegrenzung |
| `audit_logs.ip` | 30 days, then last-octet-masked | Same |
| `security_events` (full row) | 90 days | After IP anon the row is mostly useless |
| `audit_logs` (full row) | 365 days | Art 30 documentation window |
| `audits` closed_won/closed_lost | 365 days | Lead data — no legal retention need |
| `audits` active | indefinite (manual review by Carlos) | Pipeline |
| `orders` pending/cancelled/failed | 30 days | Abandoned carts |
| `orders` paid/refunded | 10 years (3650 days) | HGB §147 Aufbewahrungspflicht |
| `consent_log` withdrawn | 2 years after withdrawal | Burden-of-proof window per Art 7 |
| Records with `dsgvo_deletion_due < now()` | immediate hard-delete | Set by user-initiated erasure flow |
