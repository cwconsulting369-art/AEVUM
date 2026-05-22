#!/usr/bin/env bash
# aevum-provision-customer.sh
#
# Provision a Customer (Account + Project + Magic-Link Invite) from CLI.
# Sources from approved Audit (--audit-id) or direct flags (--slug/--email/--name).
#
# Usage:
#   aevum-provision-customer.sh --audit-id <UUID>
#   aevum-provision-customer.sh --slug <slug> --email <email> --name "<name>" [--company "<co>"] [--industry <ind>]
#
# Optional flags:
#   --api-base <url>     default: http://localhost:3210
#   --no-invite          skip magic-link generation
#   --skip-audit-link    don't patch audit row with account_id/project_id
#   --project-slug <s>   default: <account-slug>-main
#   --project-name <n>   default: "<account-name> Hauptprojekt"
#
# Requires: bash, curl, jq

set -euo pipefail

# ── ENV ──────────────────────────────────────────────────────────
ENV_FILE="${AEVUM_ENV_FILE:-/home/carlos/.envs/aevum.env}"
if [[ ! -r "$ENV_FILE" ]]; then
  echo "ERR: env file not readable: $ENV_FILE" >&2
  exit 2
fi
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${AEVUM_ADMIN_TOKEN:?AEVUM_ADMIN_TOKEN missing in $ENV_FILE}"
: "${SUPABASE_URL:?SUPABASE_URL missing}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY missing}"

# ── jq ───────────────────────────────────────────────────────────
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found — installing..."
  sudo apt-get install -y jq >/dev/null 2>&1 || {
    echo "ERR: failed to install jq. Install manually: sudo apt-get install jq" >&2
    exit 2
  }
fi

# ── Defaults ─────────────────────────────────────────────────────
API_BASE="http://localhost:3210"
AUDIT_ID=""
ACC_SLUG=""
ACC_EMAIL=""
ACC_NAME=""
ACC_COMPANY=""
ACC_INDUSTRY=""
PROJECT_SLUG=""
PROJECT_NAME=""
NO_INVITE=0
SKIP_AUDIT_LINK=0

# ── Args ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --audit-id)      AUDIT_ID="$2"; shift 2;;
    --slug)          ACC_SLUG="$2"; shift 2;;
    --email)         ACC_EMAIL="$2"; shift 2;;
    --name)          ACC_NAME="$2"; shift 2;;
    --company)       ACC_COMPANY="$2"; shift 2;;
    --industry)      ACC_INDUSTRY="$2"; shift 2;;
    --project-slug)  PROJECT_SLUG="$2"; shift 2;;
    --project-name)  PROJECT_NAME="$2"; shift 2;;
    --api-base)      API_BASE="$2"; shift 2;;
    --no-invite)     NO_INVITE=1; shift;;
    --skip-audit-link) SKIP_AUDIT_LINK=1; shift;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0;;
    *)
      echo "ERR: unknown arg: $1" >&2; exit 2;;
  esac
done

log() { echo "[provision] $*" >&2; }

slugify() {
  # lowercase, replace non-alnum with -, strip leading/trailing -, collapse multiple -
  echo "$1" \
    | iconv -t ASCII//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g; s/--+/-/g' \
    | cut -c1-60
}

# ── 1. Source data: audit or flags ───────────────────────────────
if [[ -n "$AUDIT_ID" ]]; then
  log "Fetching audit $AUDIT_ID from Supabase..."
  AUDIT_JSON=$(curl -fsS "$SUPABASE_URL/rest/v1/audits?id=eq.${AUDIT_ID}&select=*" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    | jq '.[0] // empty')
  if [[ -z "$AUDIT_JSON" || "$AUDIT_JSON" == "null" ]]; then
    echo "ERR: audit not found: $AUDIT_ID" >&2
    exit 3
  fi

  # Extract flat fields first, fall back to answers.* for v2
  ACC_NAME_FROM_AUDIT=$(echo "$AUDIT_JSON"      | jq -r '.name // (.answers.kontakt.name // .answers.name // "")')
  ACC_EMAIL_FROM_AUDIT=$(echo "$AUDIT_JSON"     | jq -r '.email // (.answers.kontakt.email // .answers.email // "")')
  ACC_COMPANY_FROM_AUDIT=$(echo "$AUDIT_JSON"   | jq -r '.company // (.answers.unternehmen.company // .answers.company // "")')
  ACC_INDUSTRY_FROM_AUDIT=$(echo "$AUDIT_JSON"  | jq -r '.industry // (.answers.unternehmen.industry // .answers.industry // "")')

  [[ -z "$ACC_NAME"     ]] && ACC_NAME="$ACC_NAME_FROM_AUDIT"
  [[ -z "$ACC_EMAIL"    ]] && ACC_EMAIL="$ACC_EMAIL_FROM_AUDIT"
  [[ -z "$ACC_COMPANY"  ]] && ACC_COMPANY="$ACC_COMPANY_FROM_AUDIT"
  [[ -z "$ACC_INDUSTRY" ]] && ACC_INDUSTRY="$ACC_INDUSTRY_FROM_AUDIT"
  [[ -z "$ACC_SLUG"     ]] && ACC_SLUG=$(slugify "${ACC_COMPANY:-$ACC_NAME}")
fi

# ── Validate ─────────────────────────────────────────────────────
if [[ -z "$ACC_SLUG" || -z "$ACC_EMAIL" || -z "$ACC_NAME" ]]; then
  echo "ERR: missing --slug/--email/--name (or --audit-id to derive them)" >&2
  exit 2
fi
if ! [[ "$ACC_SLUG" =~ ^[a-z0-9-]{2,64}$ ]]; then
  echo "ERR: slug must be lowercase a-z0-9- (2-64 chars): '$ACC_SLUG'" >&2
  exit 2
fi
[[ -z "$PROJECT_SLUG" ]] && PROJECT_SLUG="${ACC_SLUG}-main"
[[ -z "$PROJECT_NAME" ]] && PROJECT_NAME="${ACC_NAME} Hauptprojekt"

log "Account: slug=$ACC_SLUG name=$ACC_NAME email=$ACC_EMAIL company=$ACC_COMPANY industry=$ACC_INDUSTRY"
log "Project: slug=$PROJECT_SLUG name=$PROJECT_NAME"

# ── 2. Pre-flight: idempotency check (does slug already exist?) ──
EXIST_CODE=$(curl -s -o /tmp/aevum-prov-exist.json -w '%{http_code}' \
  "$API_BASE/api/accounts/$ACC_SLUG" \
  -H "x-aevum-admin-token: $AEVUM_ADMIN_TOKEN")
if [[ "$EXIST_CODE" == "200" ]]; then
  echo "ERR: account slug '$ACC_SLUG' already exists — aborting (idempotency guard)." >&2
  jq -r '.account | "  id=\(.id) name=\(.name) email=\(.email) status=\(.status)"' /tmp/aevum-prov-exist.json >&2 || true
  exit 4
fi

# ── 3. Create Account ────────────────────────────────────────────
log "POST /api/accounts ..."
ACC_PAYLOAD=$(jq -n \
  --arg slug "$ACC_SLUG" \
  --arg name "$ACC_NAME" \
  --arg email "$ACC_EMAIL" \
  --arg business_name "$ACC_COMPANY" \
  '{slug:$slug, name:$name, email:$email}
   + (if $business_name != "" then {business_name:$business_name} else {} end)')

ACC_RESP=$(curl -fsS -X POST "$API_BASE/api/accounts" \
  -H "Content-Type: application/json" \
  -H "x-aevum-admin-token: $AEVUM_ADMIN_TOKEN" \
  -d "$ACC_PAYLOAD")
ACCOUNT_ID=$(echo "$ACC_RESP" | jq -r '.account.id // empty')
if [[ -z "$ACCOUNT_ID" ]]; then
  echo "ERR: account creation returned no id. Response:" >&2
  echo "$ACC_RESP" >&2
  exit 5
fi
log "✓ Account created: $ACCOUNT_ID"

# ── 4. Create Project ────────────────────────────────────────────
log "POST /api/projects ..."
PROJ_PAYLOAD=$(jq -n \
  --arg account_slug "$ACC_SLUG" \
  --arg slug "$PROJECT_SLUG" \
  --arg name "$PROJECT_NAME" \
  --arg industry "$ACC_INDUSTRY" \
  '{account_slug:$account_slug, slug:$slug, name:$name,
    dashboard_blueprint_id:"os-standard-v1",
    agent_blueprint_id:"project-os-v1"}
   + (if $industry != "" then {industry:$industry} else {} end)')

PROJ_RESP=$(curl -fsS -X POST "$API_BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-aevum-admin-token: $AEVUM_ADMIN_TOKEN" \
  -d "$PROJ_PAYLOAD")
PROJECT_ID=$(echo "$PROJ_RESP" | jq -r '.project.id // empty')
if [[ -z "$PROJECT_ID" ]]; then
  echo "ERR: project creation returned no id. Response:" >&2
  echo "$PROJ_RESP" >&2
  echo "WARN: account $ACCOUNT_ID was created but project failed — manual cleanup may be needed." >&2
  exit 6
fi
log "✓ Project created: $PROJECT_ID"

# ── 5. Link audit ────────────────────────────────────────────────
if [[ -n "$AUDIT_ID" && "$SKIP_AUDIT_LINK" -eq 0 ]]; then
  log "PATCH audit $AUDIT_ID → account_id + project_id ..."
  PATCH_BODY=$(jq -n --arg aid "$ACCOUNT_ID" --arg pid "$PROJECT_ID" \
    '{account_id:$aid, project_id:$pid, status:"approved"}')
  PATCH_CODE=$(curl -s -o /tmp/aevum-prov-patch.json -w '%{http_code}' \
    -X PATCH "$SUPABASE_URL/rest/v1/audits?id=eq.${AUDIT_ID}" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$PATCH_BODY")
  if [[ "$PATCH_CODE" =~ ^2 ]]; then
    log "✓ Audit linked"
  else
    log "WARN: audit patch returned HTTP $PATCH_CODE (continuing) — body: $(cat /tmp/aevum-prov-patch.json 2>/dev/null | head -c 300)"
  fi
fi

# ── 6. Magic-Link Invite ─────────────────────────────────────────
INVITE_NOTE=""
if [[ "$NO_INVITE" -eq 0 ]]; then
  log "POST /api/auth/magic-link/request (purpose=invite) ..."
  ML_BODY=$(jq -n --arg email "$ACC_EMAIL" '{email:$email, purpose:"invite"}')
  ML_RESP=$(curl -fsS -X POST "$API_BASE/api/auth/magic-link/request" \
    -H "Content-Type: application/json" \
    -d "$ML_BODY" || echo '{"ok":false,"error":"request_failed"}')
  ML_OK=$(echo "$ML_RESP" | jq -r '.ok // false')
  if [[ "$ML_OK" == "true" ]]; then
    INVITE_NOTE="sent=true (link visible in pm2 aevum-api logs if mailer fallback active)"
    log "✓ Magic-link request accepted"
  else
    INVITE_NOTE="FAILED — $ML_RESP"
    log "WARN: magic-link request failed: $ML_RESP"
  fi
fi

# ── 7. Summary ───────────────────────────────────────────────────
cat <<EOF

──────────────────────────────────────────────
  AEVUM Customer Provisioned
──────────────────────────────────────────────
  Account:
    id     : $ACCOUNT_ID
    slug   : $ACC_SLUG
    name   : $ACC_NAME
    email  : $ACC_EMAIL
    company: ${ACC_COMPANY:-—}

  Project:
    id     : $PROJECT_ID
    slug   : $PROJECT_SLUG
    name   : $PROJECT_NAME
    industry: ${ACC_INDUSTRY:-—}

  Audit Link  : $([[ -n "$AUDIT_ID" ]] && echo "audit=$AUDIT_ID linked" || echo "—")
  Magic-Link  : ${INVITE_NOTE:-skipped}

  Next steps:
    - Tail pm2 logs for magic-link URL:  pm2 logs aevum-api --lines 100 | grep magic-link
    - View account:  curl -H "x-aevum-admin-token: \$AEVUM_ADMIN_TOKEN" $API_BASE/api/accounts/$ACC_SLUG | jq
──────────────────────────────────────────────
EOF
