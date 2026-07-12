#!/usr/bin/env bash
#
# demo-reindex-masterdata.sh — Recreate the demo resolver's master-data indices
# from the CURRENT index templates and reseed. Needed whenever the templates
# gain mappings the existing indices lack (indices freeze their mapping at
# creation; templates only apply to NEW indices).
#
# Concretely (2026-07): products/organizations/places-demo were created before
# the ESPR tier fields existed and have dynamic:false with NEITHER accessLevel
# NOR isAnonymousAccessAllowed mapped — every tier-DLS clause mismatches, so
# anonymous/public reads return nothing. Recreate -> new template (accessLevel
# keyword + boolean mapped) -> full reseed stamps accessLevel on every doc.
#
# Auth: demo-admin OIDC bearer (all_access via the `admin` realm role) —
# no cluster-internal basic-auth secret leaves the cluster.
# Creds: /tmp/epcis-demo-users.json + /tmp/epcis-demo-svc.env (e2e-demo-users.sh).
#
# Usage: bash scripts/demo-reindex-masterdata.sh          # indices + reseed
#        bash scripts/demo-reindex-masterdata.sh --no-seed # indices only
set -euo pipefail
export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
[ -f "$CREDS" ] && [ -f "$SVC" ] || { echo "ABORT: run scripts/e2e-demo-users.sh first"; exit 1; }
# shellcheck disable=SC1090
. "$SVC"

kubectl -n openepcis-demo port-forward svc/opensearch 19200:9200 >/tmp/pf-reindex.log 2>&1 &
PF=$!; trap 'kill $PF 2>/dev/null || true' EXIT; sleep 3

PW=$(jq -r '.[]|select(.username=="demo-admin")|.password' "$CREDS")
TOKEN=$(curl -sk -X POST "$TOKEN_URL" --data-urlencode grant_type=password \
  --data-urlencode "client_id=$CLIENT_ID" --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode username=demo-admin --data-urlencode "password=$PW" | jq -r '.access_token // empty')
[ -n "$TOKEN" ] || { echo "ABORT: no demo-admin token"; exit 1; }
OS="https://localhost:19200"

echo "=== recreate master-data indices from current templates ==="
for idx in products-demo organizations-demo places-demo linksets-demo; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' -X DELETE -H "Authorization: Bearer $TOKEN" "$OS/$idx")
  echo "  DELETE $idx -> $code (404 = did not exist)"
done
# Recreate explicitly so the mapping is applied NOW (templates also cover
# on-demand creation, but explicit creation lets us verify immediately).
for idx in products-demo organizations-demo places-demo linksets-demo; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' -X PUT -H "Authorization: Bearer $TOKEN" "$OS/$idx")
  echo "  CREATE $idx -> $code"
done
echo "=== verify tier fields are mapped ==="
for idx in products-demo organizations-demo places-demo; do
  curl -sk -H "Authorization: Bearer $TOKEN" "$OS/$idx/_mapping" \
    | jq -r --arg i "$idx" '.[$i].mappings.properties | "  \($i): accessLevel=\(.accessLevel.type // "MISSING") isAnonymousAccessAllowed=\(.isAnonymousAccessAllowed.type // "MISSING")"'
done

if [ "${1:-}" = "--no-seed" ]; then echo "done (indices only — run provision-demo.sh next)."; exit 0; fi

echo "=== full reseed (sole store: seeding = reindex) ==="
SEED_PW="$PW" SEED_CLIENT_SECRET="$CLIENT_SECRET" \
  bash "$(dirname "$0")/provision-demo.sh" --env=demo --events
