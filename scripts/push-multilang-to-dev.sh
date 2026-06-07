#!/usr/bin/env bash
# Push multi-language productName + productDescription from each demo seed
# file in extensions/eu/{textile,battery,ppwr}/examples/ to the
# already-seeded products on the configured DLR via PUT /products/{gtin}.
#
# Idempotent. Other server-side fields are preserved (GET + jq merge + PUT).
# Does NOT execute on import — this script is run manually by the operator.
#
# Env:
#   BRUNO_PW            — admin password in the openepcis realm
#   BRUNO_CLIENT_SECRET — secret for backend-service in the openepcis realm
#
# Optional env (default = dev):
#   DL_URL    — e.g. https://id.dev.epcis.cloud
#   AUTH_URL  — e.g. https://auth.dev.epcis.cloud
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/push-multilang-to-dev.sh

set -euo pipefail

DL_URL="${DL_URL:-https://id.dev.epcis.cloud}"
AUTH_URL="${AUTH_URL:-https://auth.dev.epcis.cloud}"
REALM="${REALM:-openepcis}"
CLIENT_ID="${CLIENT_ID:-backend-service}"
USERNAME="${USERNAME:-admin}"

red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

if [[ -z "${BRUNO_PW:-}" || -z "${BRUNO_CLIENT_SECRET:-}" ]]; then
  red "Set BRUNO_PW and BRUNO_CLIENT_SECRET in the environment." >&2
  exit 1
fi

TOKEN=$(curl -sk -X POST "$AUTH_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=password" \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$BRUNO_CLIENT_SECRET" \
  --data-urlencode "username=$USERNAME" \
  --data-urlencode "password=$BRUNO_PW" \
  --data-urlencode "scope=openid roles profile" \
  | jq -r '.access_token // empty')
[[ -z "$TOKEN" ]] && { red "Token fetch failed." >&2; exit 1; }

DEMOS=(
  "09521000001428|extensions/eu/textile/examples/garment-product.jsonld"
  "09521000002159|extensions/eu/textile/examples/footwear-product.jsonld"
  "09521000004207|extensions/eu/textile/examples/garment-set-itip.jsonld"
  "09521001001380|extensions/eu/textile/examples/hometextile-bedlinen.jsonld"
  "09521002005004|extensions/eu/battery/examples/battery-product.jsonld"
  "09521003000442|extensions/eu/battery/examples/portable-ebike-battery.jsonld"
  "09521004005019|extensions/eu/ppwr/examples/beverage-bottle.jsonld"
  "09521005000808|extensions/eu/ppwr/examples/multi-layer-pouch.jsonld"
  "09521006003013|extensions/eu/ppwr/examples/ecommerce-carton.jsonld"
)

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for row in "${DEMOS[@]}"; do
  IFS="|" read -r gtin rel <<<"$row"
  src="$REPO_ROOT/$rel"
  [[ ! -f "$src" ]] && { yellow "SKIP $gtin — $rel missing"; continue; }
  # Fetch existing master-data with the LD shape so @context is included
  # (without the Accept header the DLR strips it). The source seed's
  # @context wins because it's the canonical declaration of which
  # ref.openepcis.io extensions the payload uses; the server's compacted
  # array sometimes drops the openepcis extension URLs.
  curl -sk -L -H "Accept: application/ld+json" \
    "$DL_URL/01/$gtin?linkType=masterData" -o /tmp/cur.json
  jq -s '
    .[0] as $cur | .[1] as $src |
    ($src["productDescription"] // $src["gs1:productDescription"]) as $desc |
    ($src["hasBatchLotNumber"] // $src["gs1:hasBatchLotNumber"]) as $lot |
    $cur
      | ."@context" = $src["@context"]
      | .productName = $src.productName
      | if $desc then .productDescription = $desc else . end
      | del(."gs1:productDescription")
      | if $lot then .hasBatchLotNumber = $lot else . end
      | del(."gs1:hasBatchLotNumber")
  ' /tmp/cur.json "$src" > /tmp/put.json
  code=$(curl -sk -X PUT "$DL_URL/products/$gtin" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/ld+json" \
    --data-binary @/tmp/put.json \
    -w "%{http_code}" -o /tmp/r.json)
  if [[ "$code" =~ ^20[0-2]$ ]]; then green "$gtin  PUT → $code"
  else red "$gtin  PUT → $code"; head -c 300 /tmp/r.json; echo; fi
done
