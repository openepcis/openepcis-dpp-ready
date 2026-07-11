#!/usr/bin/env bash
#
# provision-dpp-demo-roles.sh — Create the EN 18223 access-tier realm roles on the
# demo `openepcis` Keycloak realm and assign them to the demo personas, so the
# dpp.demo.epcis.cloud DPP API (built with dpp.access.backend=keycloak) can gate
# writes and Restricted reads. Idempotent. Prints only role/assignment status.
#
#   dpp-writer     -> POST/PATCH writes           (demo-operator)
#   dpp-admin      -> writes + Restricted reads    (demo-admin)
#   dpp-restricted -> Restricted-tier reads        (demo-authority)
# Public reads need no role (canRead(Public)=true, incl. anonymous).
#
# Usage: bash scripts/provision-dpp-demo-roles.sh
set -euo pipefail

export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
CURL=curl; JQ=jq
B="https://auth.demo.epcis.cloud/admin/realms/openepcis"

KU=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "https://auth.demo.epcis.cloud/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token')
[ -n "$AT" ] && [ "$AT" != null ] || { echo "admin token failed"; exit 1; }

create_role() { # name description
  local rc
  rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$B/roles" \
    -H "Authorization: Bearer $AT" -H "Content-Type: application/json" \
    -d "{\"name\":\"$1\",\"description\":\"$2\"}")
  case "$rc" in
    201) echo "  role $1: created" ;;
    409) echo "  role $1: exists" ;;
    *)   echo "  role $1: FAILED ($rc)"; return 1 ;;
  esac
}

assign_role() { # username rolename
  local uid rid rc
  uid=$($CURL -sS -H "Authorization: Bearer $AT" "$B/users?username=$1&exact=true" | $JQ -r '.[0].id // empty')
  [ -n "$uid" ] || { echo "  assign $2->$1: user not found (skip)"; return 0; }
  rid=$($CURL -sS -H "Authorization: Bearer $AT" "$B/roles/$2" | $JQ -c '{id,name}')
  rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$B/users/$uid/role-mappings/realm" \
    -H "Authorization: Bearer $AT" -H "Content-Type: application/json" -d "[$rid]")
  case "$rc" in 204|201) echo "  assign $2 -> $1: ok" ;; *) echo "  assign $2 -> $1: FAILED ($rc)"; return 1 ;; esac
}

echo "=== realm roles ==="
create_role dpp-writer     "EN 18223 DPP API: write (POST/PATCH)"
create_role dpp-admin      "EN 18223 DPP API: write + Restricted read"
create_role dpp-restricted "EN 18223 DPP API: Restricted-tier read"
echo "=== assignments ==="
assign_role demo-operator  dpp-writer
assign_role demo-admin     dpp-admin
assign_role demo-authority dpp-restricted
echo "done."
