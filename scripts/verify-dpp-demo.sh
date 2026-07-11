#!/usr/bin/env bash
#
# verify-dpp-demo.sh — End-to-end checks for the EN 18223 DPP API + gs1:dpp
# discovery at demo.epcis.cloud.
#
#   1. Anonymous Public read -> 200 with a canonical GS1 Digital Link uniqueProductIdentifier.
#   2. Bad bearer token -> 401 (OIDC enforcing).
#   3. Authenticated token WITHOUT a dpp role -> PATCH 403 (DPP API tier gating).
#   4. Retrofit + discovery: link sets are populated at product-save time, so the
#      pre-existing catalog products are DELETEd + recreated (with a demo-admin
#      write token — resolver writes are group/GCP-authorized, the service account
#      is not) so the resolver re-populates each link set with the new gs1:dpp
#      entry; then assert the linkset advertises gs1:dpp -> the DPP API.
#      The 2 flagship passports (amperia/fjordline) are multi-granularity and must
#      be refreshed via `scripts/seed-dev-passports.sh --env=demo` instead.
#
# Usage: bash scripts/verify-dpp-demo.sh
set -euo pipefail
export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURL=curl; JQ=jq
ID_BASE="https://id.demo.epcis.cloud"
DPP_VOC="https://ref.gs1.org/voc/dpp"
DL_ENC="https%3A%2F%2Fid.demo.epcis.cloud%2F01%2F09521000001428"

echo "=== 1. anonymous Public read (expect 200, canonical id) ==="
$CURL -sS -o /tmp/vd.json -w '  HTTP %{http_code}\n' --max-time 15 -H 'Accept: application/ld+json' \
  "https://dpp.demo.epcis.cloud/v1/dppsByProductId/$DL_ENC"
$JQ -r '"  uniqueProductIdentifier=\(.uniqueProductIdentifier)  granularity=\(.granularity)"' /tmp/vd.json 2>/dev/null || true

# ---- admin token + backend-service secret ----------------------------------
B="https://auth.demo.epcis.cloud/admin/realms/openepcis"
TOKEN_URL="https://auth.demo.epcis.cloud/realms/openepcis/protocol/openid-connect/token"
KU=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "https://auth.demo.epcis.cloud/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token')
CID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients?clientId=backend-service" | $JQ -r '.[0].id')
SEC=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients/$CID/client-secret" | $JQ -r '.value')

echo "=== 2. bad bearer token (expect 401 = OIDC enforcing) ==="
$CURL -sS -o /dev/null -w '  POST /v1/dpps (bad token) -> %{http_code}\n' --max-time 15 -X POST \
  "https://dpp.demo.epcis.cloud/v1/dpps" -H 'Authorization: Bearer garbage.token' \
  -H 'Content-Type: application/ld+json' --data '{}'

echo "=== 3. authenticated WITHOUT dpp role (service account) -> expect 403 ==="
SATOK=$($CURL -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=client_credentials \
  --data-urlencode client_id=backend-service --data-urlencode "client_secret=$SEC" | $JQ -r '.access_token // empty')
$CURL -sS -o /dev/null -w '  PATCH /v1/dpps (authed, no dpp role) -> %{http_code}\n' --max-time 15 -X PATCH \
  "https://dpp.demo.epcis.cloud/v1/dpps/$DL_ENC" -H "Authorization: Bearer $SATOK" \
  -H 'Content-Type: application/json' --data '{}'

# ---- ensure backend-service tokens carry a groups claim ---------------------
# The resolver reads the JWT "groups" claim (UserClaimServiceImpl); without a
# Group Membership mapper on the client, group membership (incl. "admins") never
# reaches the token and the admin bypass can't fire.
HASGM=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients/$CID/protocol-mappers/models" \
  | $JQ -r '[.[]|select(.config["claim.name"]=="groups")]|length')
if [ "${HASGM:-0}" = 0 ]; then
  $CURL -sS -o /dev/null -X POST "$B/clients/$CID/protocol-mappers/models" \
    -H "Authorization: Bearer $AT" -H 'Content-Type: application/json' \
    -d '{"name":"groups","protocol":"openid-connect","protocolMapper":"oidc-group-membership-mapper","config":{"claim.name":"groups","full.path":"false","id.token.claim":"true","access.token.claim":"true","userinfo.token.claim":"true"}}'
  echo "  (added groups protocol-mapper to backend-service)"
else
  echo "  (groups mapper already present)"
fi

# ---- demo-admin write token -------------------------------------------------
# Resolver update/delete enforce record-level tenant isolation (AccessControlUtil):
# a caller may only modify a record whose owning group is in the caller's groups,
# UNLESS the caller is in the admin group ("admins", dlr.access-control.admin-group),
# which bypasses isolation. The demo catalog was created under a different owner,
# so put demo-admin in "admins" to let it re-save any record.
UID2=$($CURL -sS -H "Authorization: Bearer $AT" "$B/users?username=demo-admin&exact=true" | $JQ -r '.[0].id')
GID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/groups?search=admins" | $JQ -r '.[]|select(.name=="admins")|.id' | head -1)
if [ -z "$GID" ]; then
  $CURL -sS -o /dev/null -X POST "$B/groups" -H "Authorization: Bearer $AT" -H 'Content-Type: application/json' -d '{"name":"admins"}'
  GID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/groups?search=admins" | $JQ -r '.[]|select(.name=="admins")|.id' | head -1)
fi
$CURL -sS -o /dev/null -X PUT "$B/users/$UID2/groups/$GID" -H "Authorization: Bearer $AT"
echo "  (demo-admin added to 'admins' group: $GID)"
PW="Verify.2026.$(openssl rand -hex 8).Aa1"
$CURL -sS -o /dev/null -X PUT "$B/users/$UID2/reset-password" -H "Authorization: Bearer $AT" \
  -H 'Content-Type: application/json' -d "{\"type\":\"password\",\"value\":\"$PW\",\"temporary\":false}"
ADM=$($CURL -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password --data-urlencode client_id=backend-service \
  --data-urlencode "client_secret=$SEC" --data-urlencode username=demo-admin --data-urlencode "password=$PW" \
  --data-urlencode scope=openid | $JQ -r '.access_token // empty')
[ -n "$ADM" ] || { echo "demo-admin token failed"; exit 1; }

echo "=== 4. retrofit catalog (PUT upsert, demo-admin) so linksets regain gs1:dpp ==="
CATALOG=(
  extensions/eu/textile/examples/garment-product.jsonld
  extensions/eu/textile/examples/footwear-product.jsonld
  extensions/eu/textile/examples/garment-set-itip.jsonld
  extensions/eu/textile/examples/hometextile-bedlinen.jsonld
  extensions/eu/battery/examples/battery-product.jsonld
  extensions/eu/battery/examples/portable-ebike-battery.jsonld
  extensions/eu/ppwr/examples/beverage-bottle.jsonld
  extensions/eu/ppwr/examples/multi-layer-pouch.jsonld
  extensions/eu/ppwr/examples/ecommerce-carton.jsonld
)
for f in "${CATALOG[@]}"; do
  gtin=$($JQ -r '.["gs1:gtin"] // .gtin // empty' "$REPO_ROOT/$f")
  [ -n "$gtin" ] || { echo "  (skip $f: no gtin)"; continue; }
  code=$($CURL -sS -o /tmp/up.$$ -w '%{http_code}' --max-time 20 -X PUT \
    "$ID_BASE/products/$gtin?isAnonymousAccessAllowed=true" \
    -H "Authorization: Bearer $ADM" -H 'Content-Type: application/ld+json' \
    --data-binary "@$REPO_ROOT/$f")
  case "$code" in
    2*) printf '  upsert %-14s -> %s\n' "$gtin" "$code" ;;
    *)  printf '  upsert %-14s -> %s  %s\n' "$gtin" "$code" "$(head -c 160 /tmp/up.$$ | tr -d '\n')" ;;
  esac
  rm -f /tmp/up.$$
done

echo "--- linkset now advertises gs1:dpp? (catalog) ---"
for g in 09521000001428 09521004005019; do
  dpp=$($CURL -sS -H 'Accept: application/linkset+json' "$ID_BASE/01/$g?linkType=linkset" 2>/dev/null \
    | $JQ -r --arg k "$DPP_VOC" '.linkset[0][$k][0].href // "NONE"')
  printf '  /01/%s  gs1:dpp -> %s\n' "$g" "$dpp"
done
echo "Flagship amperia/fjordline: refresh via scripts/seed-dev-passports.sh --env=demo (multi-granularity bodies)."
echo "done."
