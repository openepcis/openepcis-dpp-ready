#!/usr/bin/env bash
#
# seed-dev-demo.sh — Seed dev.epcis.cloud with the canonical-context demo
# data the digital-data-management webapp resolves at runtime.
#
# What this does:
#   1. Fetches an OIDC access token from Keycloak via password grant.
#   2. POSTs every demo master-data file from
#      extensions/eu/{textile,battery,ppwr}/examples/<file>.jsonld to the
#      DLR's /products endpoint with the Bearer token.
#   3. POSTs every demo EPCIS event from
#      extensions/eu/{textile,battery,ppwr}/epcis/<file>.jsonld to the
#      EPCIS REST /capture endpoint with the same token.
#   4. Verifies each demo GTIN resolves back from the DLR with the
#      canonical dpp-core-context.jsonld.
#
# Why not use Bruno CLI for the POSTs:
#   Bruno CLI 3.3 does not apply collection-level OAuth2 (`auth: inherit`)
#   to outbound requests in headless mode — requests go out without an
#   Authorization header and the DLR rejects them as 401. Hitting the
#   APIs directly with curl + a freshly fetched token is the reliable
#   path. The .bru files remain useful for interactive Bruno-GUI runs.
#
# Idempotency:
#   - Master-data: the DLR returns 409 on duplicate GTINs; the script
#     treats 409 as success ("already seeded").
#   - EPCIS events: events are deduped on their urn:uuid:… eventID by
#     the EPCIS ingest; re-running re-posts the same eventIDs harmlessly.
#
# Prerequisites:
#   - BRUNO_PW (admin user password in the openepcis realm)
#   - BRUNO_CLIENT_SECRET (secret for backend-service client in same realm)
#   - jq + curl
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/seed-dev-demo.sh
#   scripts/seed-dev-demo.sh --only=products
#   scripts/seed-dev-demo.sh --only=events
#   scripts/seed-dev-demo.sh --only=verify
#   scripts/seed-dev-demo.sh --env=local
#
# Exit codes:
#   0 — all steps OK (409s treated as success)
#   1 — at least one POST returned an unexpected status
#   2 — at least one demo GTIN failed verification
#   64 — invalid arguments / missing credentials

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV="dev"
RUN_PRODUCTS=1
RUN_EVENTS=1
RUN_VERIFY=1

PRODUCT_FILES=(
  "extensions/eu/textile/examples/garment-product.jsonld"
  "extensions/eu/textile/examples/footwear-product.jsonld"
  "extensions/eu/textile/examples/garment-set-itip.jsonld"
  "extensions/eu/textile/examples/hometextile-bedlinen.jsonld"
  "extensions/eu/battery/examples/battery-product.jsonld"
  "extensions/eu/battery/examples/portable-ebike-battery.jsonld"
  "extensions/eu/ppwr/examples/beverage-bottle.jsonld"
  "extensions/eu/ppwr/examples/multi-layer-pouch.jsonld"
  "extensions/eu/ppwr/examples/ecommerce-carton.jsonld"
)

# Lifecycle ordering: commissioning → transformations / transfers → EoL.
EVENT_FILES=(
  # textile
  "extensions/eu/textile/epcis/commissioning.jsonld"
  "extensions/eu/textile/epcis/transformation-spinning.jsonld"
  "extensions/eu/textile/epcis/transformation-weaving.jsonld"
  "extensions/eu/textile/epcis/transformation-garment.jsonld"
  "extensions/eu/textile/epcis/observation-durability.jsonld"
  "extensions/eu/textile/epcis/observation-chemical.jsonld"
  "extensions/eu/textile/epcis/observation-carbon-footprint.jsonld"
  # battery
  "extensions/eu/battery/epcis/commissioning.jsonld"
  "extensions/eu/battery/epcis/ownership-transfer.jsonld"
  "extensions/eu/battery/epcis/state-of-health.jsonld"
  "extensions/eu/battery/epcis/state-of-certified-energy.jsonld"
  "extensions/eu/battery/epcis/carbon-footprint.jsonld"
  "extensions/eu/battery/epcis/temperature-extreme.jsonld"
  "extensions/eu/battery/epcis/regulatory-notification.jsonld"
  # ppwr
  "extensions/eu/ppwr/epcis/commissioning.jsonld"
  "extensions/eu/ppwr/epcis/ownership-transfer.jsonld"
  "extensions/eu/ppwr/epcis/deposit-return.jsonld"
  "extensions/eu/ppwr/epcis/recovery.jsonld"
  "extensions/eu/ppwr/epcis/observation-recyclability.jsonld"
)

DEMO_GTINS=(
  "09521234300014" "09521234300021" "09521234000075" "09521234300038"
  "09521234000013" "09521234000044"
  "09521234500018" "09521234500025" "09521234500049"
)

for arg in "$@"; do
  case "$arg" in
    --only=products) RUN_EVENTS=0; RUN_VERIFY=0 ;;
    --only=events)   RUN_PRODUCTS=0; RUN_VERIFY=0 ;;
    --only=verify)   RUN_PRODUCTS=0; RUN_EVENTS=0 ;;
    --skip-verify)   RUN_VERIFY=0 ;;
    --env=*)         ENV="${arg#--env=}" ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

case "$ENV" in
  dev)
    DL_URL="https://id.dev.epcis.cloud"
    EPCIS_URL="https://api.dev.epcis.cloud"
    TOKEN_URL="https://keycloak.dev.epcis.cloud/realms/openepcis/protocol/openid-connect/token"
    CLIENT_ID="backend-service"
    USERNAME="admin"
    ;;
  local)
    DL_URL="http://localhost:8080"
    EPCIS_URL="http://localhost:8080"
    TOKEN_URL="http://localhost:8180/realms/openepcis/protocol/openid-connect/token"
    CLIENT_ID="backend-service"
    USERNAME="admin"
    ;;
  *) echo "Unknown --env=$ENV (expected: dev, local)" >&2; exit 64 ;;
esac

cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

need_token() { (( RUN_PRODUCTS + RUN_EVENTS > 0 )); }

if need_token; then
  if [[ -z "${BRUNO_PW:-}" || -z "${BRUNO_CLIENT_SECRET:-}" ]]; then
    red "Set BRUNO_PW and BRUNO_CLIENT_SECRET in the environment." >&2
    red "  BRUNO_PW            = password of '$USERNAME' in the openepcis realm" >&2
    red "  BRUNO_CLIENT_SECRET = client secret of '$CLIENT_ID' in the openepcis realm" >&2
    exit 64
  fi
  cyan "→ Fetching access token from $TOKEN_URL"
  TOKEN_JSON="$(curl -sS -X POST "$TOKEN_URL" \
    --data-urlencode "grant_type=password" \
    --data-urlencode "client_id=$CLIENT_ID" \
    --data-urlencode "client_secret=$BRUNO_CLIENT_SECRET" \
    --data-urlencode "username=$USERNAME" \
    --data-urlencode "password=$BRUNO_PW" \
    --data-urlencode "scope=openid")"
  TOKEN="$(echo "$TOKEN_JSON" | jq -r '.access_token // empty')"
  if [[ -z "$TOKEN" ]]; then
    red "Token request failed:" >&2
    echo "$TOKEN_JSON" >&2
    exit 1
  fi
  green "  Token obtained ($(echo "$TOKEN_JSON" | jq -r '.expires_in')s expiry)"
fi

post_jsonld() {
  local file="$1"  url="$2"  label="$3"
  local code
  code="$(curl -sS -o /tmp/seed-resp.$$ -w '%{http_code}' \
    -X POST "$url" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary "@$REPO_ROOT/$file" || echo ERR)"
  case "$code" in
    200|201|202)  green "  OK   ($code) $label  ← $file" ;;
    204)           green "  OK   (204 no content) $label  ← $file" ;;
    409)           yellow "  SKIP (409 already exists) $label  ← $file" ;;
    *)
      red "  FAIL ($code) $label  ← $file"
      head -c 400 /tmp/seed-resp.$$ >&2 || true; echo "" >&2
      rm -f /tmp/seed-resp.$$
      return 1
      ;;
  esac
  rm -f /tmp/seed-resp.$$
}

verify_gtin() {
  local gtin="$1"
  local url="${DL_URL}/01/${gtin}?linkType=masterdata"
  local body
  body="$(curl -sS -L -H 'Accept: application/ld+json' "$url" || true)"
  if [[ -z "$body" ]]; then
    red "  MISS    $gtin  (empty response from $url)"; return 1
  fi
  if echo "$body" | jq -e '(.["@context"] // "") | tostring | test("ref.openepcis.io/extensions/common/core/dpp-core-context")' > /dev/null 2>&1; then
    green "  OK      $gtin"
  else
    yellow "  WARN    $gtin  (resolved but @context lacks canonical dpp-core)"; return 1
  fi
}

failed=0

if (( RUN_PRODUCTS )); then
  cyan "=== Phase A: master-data products → $DL_URL/products ==="
  for f in "${PRODUCT_FILES[@]}"; do
    post_jsonld "$f" "$DL_URL/products" "$(basename "$f" .jsonld)" || failed=$((failed + 1))
  done
fi

if (( RUN_EVENTS )); then
  cyan "=== Phase B: EPCIS events → $EPCIS_URL/capture ==="
  for f in "${EVENT_FILES[@]}"; do
    post_jsonld "$f" "$EPCIS_URL/capture" "$(basename "$f" .jsonld)" || failed=$((failed + 1))
  done
fi

if (( failed > 0 )); then
  red "$failed POST(s) failed. Skipping verification." >&2
  exit 1
fi

if (( RUN_VERIFY )); then
  cyan "=== Phase C: DLR resolution verification ==="
  verify_failed=0
  for gtin in "${DEMO_GTINS[@]}"; do
    verify_gtin "$gtin" || verify_failed=$((verify_failed + 1))
  done
  if (( verify_failed > 0 )); then
    red "$verify_failed / ${#DEMO_GTINS[@]} demo GTIN(s) failed verification" >&2
    exit 2
  fi
fi

green "Seed complete."
