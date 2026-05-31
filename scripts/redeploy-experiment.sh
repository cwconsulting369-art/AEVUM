#!/usr/bin/env bash
# Re-trigger Vercel PRODUCTION deploy of the experiment branch for aevum + aevum-portal.
#
# Warum: Der persistente Vercel Production-Branch ist weiterhin 'main'. aevum-system.de
# und das Portal sollen aber vom experiment-Branch leben. Darum nach JEDEM Push auf
# experiment dieses Skript laufen lassen -> erzwingt einen Production-Deploy von experiment.
#
# Nutzung:
#   bash scripts/redeploy-experiment.sh                 # default branch (experiment/showcase-effects-2026-05-28)
#   bash scripts/redeploy-experiment.sh <branch-ref>    # anderer Ref
set -euo pipefail
set -a; source ~/.claude/.env 2>/dev/null || true; set +a
TKN="${VERCEL_TOKEN:-${VERCEL_API_TOKEN:-${VERCEL:-}}}"
TEAM=team_QgubGtvpkYe8YfAq6BTwIjfM
REPO_ID=1212906171
REF="${1:-experiment/showcase-effects-2026-05-28}"

deploy() {
  local id="$1" name="$2"
  curl -s -X POST -H "Authorization: Bearer $TKN" -H "Content-Type: application/json" \
    "https://api.vercel.com/v13/deployments?teamId=$TEAM&forceNew=1" \
    -d "{\"name\":\"$name\",\"project\":\"$id\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"ref\":\"$REF\",\"repoId\":$REPO_ID}}" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print('  $name ->', d.get('id') or d.get('error'), d.get('readyState',''))"
}

echo "Re-deploy (production) von '$REF':"
deploy prj_V1fzdJ94TFN0YA0O1HnTEf0vrBWy aevum
deploy prj_tgB5oPY1EJnFgfqjt6qjVKvhJn0D aevum-portal
echo "Fertig. Status: vercel.com -> Projekt -> Deployments."
