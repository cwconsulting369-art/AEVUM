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
| 008 | `008_account_project_blueprint_model.sql` | **yes (2026-05-22)** | AEVUM v2 Account/Project/Blueprint model — 16 new tables + audits ALTER |
| 009 | `009_seed_blueprints_and_account_zero.sql` | **yes (2026-05-22)** | Seeds: 6 pricing tiers (tier-based) + Marketing-Thesis + Dashboards/Agents/Workflows/Audit-Form + Account #0 Carlos + Projects (AEVUM, LennoxOS) |
| 010 | `010_pending_approvals.sql` | **yes (2026-05-22)** | Lennox↔Carlos async approval channel via Telegram. `pending_approvals` table + RLS service-role-only + indexes (status/expires). Drives `/api/approval/*` + `/api/tg-webhook/lennox-bot`. |
| 011 | `011_helpbot_conversations.sql` | **yes (2026-05-22)** | Helpbot chat sessions (anonymous, IP-anonymized /24, 90-day retention) + RLS service-role-only + indexes. Drives `/api/helpbot/chat`. |
| 026 | `026_case_pages.sql` | **yes (2026-05-24)** | Wave B5: `case_pages` table + 'archived' status added to accounts CHECK + 3 HV-Mock accounts archived. Drives `/api/cases` v2. |
| 027 | `027_seed_case_pages.sql` | **yes (2026-05-24)** | Wave B5: Seeds 4 live cases (ketolabs, utilityhub, thailand-re, goldtradersociety). |
| 046 | `046_content_funnel.sql` | **yes (2026-05-30)** | Content/Social-Funnel-Fundament: `content_channels` (FB/LinkedIn getrennt), `content_pieces`, `content_metrics` (echte Zahlen), + `customer_leads.attributed_content_id`/`utm_*` (Content→Lead-Attribution). Patricks 2 Kanäle geseedet. Dashboard-agnostisch. |

## Pending (paste in Supabase SQL Editor)

| # | File | Adds | Risk | Reversible? |
|---|---|---|---|---|
| 005 | `005_dsgvo_audit_logs.sql` | `audit_logs` table + `audit_pii_change()` trigger function + triggers on audits/orders/consent_log/erasure_log | Low — additive. Triggers fire on writes only. | yes (drop triggers + table) |
| 006 | `006_dsgvo_extend.sql` | `dsgvo_settings` singleton, `dsgvo_deletion_due` cols on audits+orders, `consent_log.order_id` FK, extended `erasure_log` cols, explicit "service-role only" RLS policies on audits/security_events/consent_log/erasure_log | Low — `IF NOT EXISTS` everywhere. Tightens RLS (anon already had no policies, so no behavior change for public). | yes (drop policies + cols) |
| 008 | `008_account_project_blueprint_model.sql` | **AEVUM v2 Account/Project/Blueprint Model:** 16 new tables (accounts, account_profiles, account_agents, account_permissions, projects, project_dashboards, project_agents, project_workflows, project_apis, project_permissions, blueprint_dashboards, blueprint_agents, blueprint_workflows, blueprint_pricing, blueprint_audit_forms, blueprint_marketing_thesis) + audits ALTER (account_id, project_id FKs, answers/analysis_result JSONB, form_version) + updated_at triggers | Low — additive only | yes (drop tables + drop audits cols) |
| 009 | `009_seed_blueprints_and_account_zero.sql` | **Initial Seeds:** 6 Pricing-Blueprints (Tier S/M/L/B/C/audit-only), 2 Marketing-Thesis-Blueprints (tier-system 7-step + AEVUM-own), 2 Dashboard-Blueprints, 2 Agent-Blueprints, 3 Workflow-Blueprints (lead-routing/reporting/email), 1 Audit-Form-Blueprint v2, Account #0 = Carlos (Client Zero) + 2 initial Projects (AEVUM, LennoxOS) | Low — INSERT ON CONFLICT DO NOTHING | yes (DELETE WHERE id IN (...)) |

**Order matters:** 005 must run before 006 only because 006 references no new tables from 005 — they are technically independent, but numeric order is recommended for clarity.

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
