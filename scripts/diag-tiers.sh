#!/usr/bin/env bash
#
# diag-tiers.sh — READ-ONLY. Inspect the demo master-data indices to explain why
# anonymous org/place reads 404 while products resolve: prints the accessLevel
# field mapping and a few docs' accessLevel/isAnonymousAccessAllowed for
# organizations/places/products. Same auth path as demo-reindex-masterdata.sh
# (demo-admin OIDC bearer + port-forward). No writes.
#
# Usage: bash scripts/diag-tiers.sh
set -euo pipefail
# Pin to the talos-prod kubeconfig FILE (current-context admin@talos-prod).
# Use KCFG to override; do NOT inherit a pre-existing KUBECONFIG (it may be a
# merged default that lacks the admin@talos-prod context).
KUBECONFIG="${KCFG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
export KUBECONFIG
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
[ -f "$CREDS" ] && [ -f "$SVC" ] || { echo "ABORT: run scripts/e2e-demo-users.sh first"; exit 1; }
# shellcheck disable=SC1090
. "$SVC"

# Use the kubeconfig FILE directly (its current-context is admin@talos-prod);
# a bare --context name isn't present in a merged default kubeconfig.
kubectl --kubeconfig "$KUBECONFIG" -n openepcis-demo port-forward svc/opensearch 19200:9200 >/tmp/pf-diag.log 2>&1 &
PF=$!; trap 'kill $PF 2>/dev/null || true' EXIT; sleep 3

echo "port-forward log:"; cat /tmp/pf-diag.log 2>/dev/null | head -3
echo "TOKEN_URL=$TOKEN_URL  CLIENT_ID=$CLIENT_ID"
PW=$(jq -r '.[]|select(.username=="demo-admin")|.password' "$CREDS")
[ -n "$PW" ] && echo "demo-admin password: found" || echo "demo-admin password: NOT FOUND in $CREDS"
TOKEN=$(curl -sk -X POST "$TOKEN_URL" --data-urlencode grant_type=password \
  --data-urlencode "client_id=$CLIENT_ID" --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode username=demo-admin --data-urlencode "password=$PW" | jq -r '.access_token // empty')
[ -n "$TOKEN" ] && echo "token: obtained (len ${#TOKEN})" || echo "token: EMPTY (keycloak auth failed)"
OS=https://localhost:19200

echo "=== raw OpenSearch reachability (root) ==="
curl -sk -o /dev/null -w "  GET $OS/ -> HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" "$OS/" || echo "  connection failed"
echo "=== list *-demo indices ==="
curl -sk -H "Authorization: Bearer $TOKEN" "$OS/_cat/indices/*-demo?h=index,docs.count&s=index" 2>&1 | head -20

for i in organizations-demo places-demo products-demo; do
  echo "=== $i ==="
  printf '  accessLevel mapping (raw): '
  curl -sk -H "Authorization: Bearer $TOKEN" "$OS/$i/_mapping" 2>&1 | head -c 400; echo
  curl -sk -H "Authorization: Bearer $TOKEN" "$OS/$i/_search?size=3" -H 'Content-Type: application/json' \
    -d '{"_source":["globalLocationNumber","gtin","accessLevel","isAnonymousAccessAllowed"]}' 2>&1 \
    | jq -c '{total:.hits.total.value, samples:[.hits.hits[]._source]}' 2>/dev/null || echo "  (search returned non-JSON — see above)"
done
