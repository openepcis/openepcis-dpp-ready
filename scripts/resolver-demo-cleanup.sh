#!/usr/bin/env bash
#
# resolver-demo-cleanup.sh — Delete the resolver-demo entries so the Bruno
# collection can be re-run from scratch. Reads the same transient creds as
# e2e-demo-scenarios.sh (/tmp/epcis-demo-users.json + /tmp/epcis-demo-svc.env,
# produced by e2e-demo-users.sh). No Keycloak admin needed.
#
# Usage: bash scripts/resolver-demo-cleanup.sh
set -uo pipefail
CURL=curl; JQ=jq
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
[ -f "$CREDS" ] && [ -f "$SVC" ] || { echo "ABORT: run scripts/e2e-demo-users.sh first ($CREDS / $SVC missing)"; exit 1; }
# shellcheck disable=SC1090
. "$SVC"
IDB="https://id.demo.epcis.cloud"

pw_for(){ $JQ -r --arg u "$1" '.[]|select(.username==$u)|.password' "$CREDS"; }
TOKEN=$($CURL -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password \
  --data-urlencode "client_id=$CLIENT_ID" --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode "username=demo-admin" --data-urlencode "password=$(pw_for demo-admin)" \
  --data-urlencode scope=openid | $JQ -r '.access_token // empty')
[ -n "$TOKEN" ] || { echo "ABORT: could not obtain demo-admin token"; exit 1; }

del(){ # label path
  local label="$1" path="$2" code
  code=$($CURL -sS -o /dev/null -w '%{http_code}' --max-time 20 -X DELETE "$IDB$path" \
    -H "Authorization: Bearer $TOKEN")
  echo "  DELETE $path -> $code  ($label)"
}

echo "=== resolver-demo cleanup ==="
del "main demo product"      "/products/09521000077775"
del "link-only GTIN"         "/01/09521000099999"
del "GDTI document"          "/253/9521000000018"
del "GIAI asset"             "/8004/952100078880001"
echo "done. 200/202/204 = removed, 404 = already gone."
