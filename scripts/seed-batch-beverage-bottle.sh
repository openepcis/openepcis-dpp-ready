#!/usr/bin/env bash
#
# Copyright (c) 2022-2026 benelog GmbH & Co. KG
# All rights reserved.
#
# Licensed under the benelog OpenEPCIS Framework Product License, Version 1.0.
# See BENELOG_LICENSE-1.0 for details.
#
# seed-batch-beverage-bottle.sh — Register a BATCH-LEVEL (GS1 AI 10) entry for
# the PPWR beverage bottle so /01/09521004005019/10/LOT-01 resolves to its own
# master data instead of falling back to the GTIN-level document.
#
# Two operations against the DLR (mirrors the per-serial flow proven in
# epcis.cloud-dev/scripts/ingest-nvero-products.py):
#   1. PUT  /products/{gtin}/10/{lot}   — per-lot Product master data
#                                          (extensions/eu/ppwr/examples/
#                                           beverage-bottle-lot-01.jsonld)
#   2. PUT  /01/{gtin}/10/{lot}         — lot-anchored linkset with a
#      (POST on "not found")              self-referential masterData href so
#                                          the resolver serves the per-lot doc
#                                          inline (no 302 up to the GTIN).
#
# Bruno CLI can't send collection OAuth2 headlessly, so — like seed-dev-demo.sh
# — we fetch a token and hit the API with curl directly. The matching .bru
# files (01-products/packaging/create-beverage-bottle-batch.bru and
# 05-linkset-patches/patch-batch-beverage-bottle.bru) remain for interactive runs.
#
# Prerequisites: BRUNO_PW, BRUNO_CLIENT_SECRET, jq, curl.
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/seed-batch-beverage-bottle.sh
#   scripts/seed-batch-beverage-bottle.sh --env=local
#   scripts/seed-batch-beverage-bottle.sh --skip-verify
#
# Exit codes: 0 ok · 1 a request failed · 2 verification failed · 64 bad args.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV="dev"
RUN_VERIFY=1

GTIN="09521004005019"
LOT="LOT-01"
MASTERDATA_FILE="extensions/eu/ppwr/examples/beverage-bottle-lot-01.jsonld"

for arg in "$@"; do
  case "$arg" in
    --skip-verify) RUN_VERIFY=0 ;;
    --env=*)       ENV="${arg#--env=}" ;;
    -h|--help)     grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

case "$ENV" in
  dev)
    DL_URL="https://id.dev.epcis.cloud"
    DDM_URL="https://ddm.dev.epcis.cloud"
    TOKEN_URL="https://keycloak.dev.epcis.cloud/realms/openepcis/protocol/openid-connect/token"
    CLIENT_ID="backend-service"
    USERNAME="admin"
    ;;
  local)
    DL_URL="http://localhost:8080"
    DDM_URL="http://localhost:3005"
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
  red "Token request failed:" >&2; echo "$TOKEN_JSON" >&2; exit 1
fi
green "  Token obtained ($(echo "$TOKEN_JSON" | jq -r '.expires_in')s expiry)"

# --- 1) Per-lot master data: PUT /products/{gtin}/10/{lot} -------------------
cyan "=== Step 1/2: batch master data → $DL_URL/products/$GTIN/10/$LOT ==="
code="$(curl -sS -o /tmp/seed-batch-md.$$ -w '%{http_code}' \
  -X PUT "$DL_URL/products/$GTIN/10/$LOT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "isAnonymousAccessAllowed: true" \
  --data-binary "@$REPO_ROOT/$MASTERDATA_FILE" || echo ERR)"
case "$code" in
  200|201|202|204) green "  OK   ($code) batch master data" ;;
  *)
    red "  FAIL ($code) batch master data PUT"
    head -c 600 /tmp/seed-batch-md.$$ >&2 || true; echo "" >&2
    rm -f /tmp/seed-batch-md.$$
    red "  (a 4xx here likely means the DLR does not accept AI-10 sub-product products)" >&2
    exit 1
    ;;
esac
rm -f /tmp/seed-batch-md.$$

# --- 2) Lot-anchored linkset: PUT (POST on "not found") /01/{gtin}/10/{lot} --
# Body is a bare GS1 linkset object (NOT the [{action,linkset}] PATCH envelope)
# with full GS1-IRI link-type keys. Only `pip` is set: the resolver
# auto-surfaces `masterData` for the lot anchor from the per-lot Product PUT in
# step 1, and the create schema rejects user-supplied `defaultLink`/`masterData`
# as additional properties. The lot pip doubles as the default-link redirect.
cyan "=== Step 2/2: batch linkset → $DL_URL/01/$GTIN/10/$LOT ==="
LINKSET_BODY="$(cat <<JSON
{
  "linkset": [
    {
      "anchor": "$DL_URL/01/$GTIN/10/$LOT",
      "itemDescription": "Mountain Spring Mineral Water — 500 mL PET bottle (batch $LOT)",
      "https://ref.gs1.org/voc/pip": [
        {
          "href": "$DDM_URL/01/$GTIN/10/$LOT?template=ppwr-overview",
          "title": "Mountain Spring Mineral Water — Batch $LOT Digital Product Passport",
          "fwqs": false,
          "type": "text/html",
          "hreflang": ["en"],
          "context": ["ALL"],
          "public": true
        }
      ]
    }
  ]
}
JSON
)"

ls_call() {
  local method="$1"
  curl -sS -o /tmp/seed-batch-ls.$$ -w '%{http_code}' \
    -X "$method" "$DL_URL/01/$GTIN/10/$LOT?isAnonymousAccessAllowed=true" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary "$LINKSET_BODY" || echo ERR
}

code="$(ls_call PUT)"
if [[ "$code" == "400" ]] && grep -qi "not found" /tmp/seed-batch-ls.$$; then
  yellow "  PUT 400 (linkset not found) — creating with POST"
  code="$(ls_call POST)"
fi
case "$code" in
  200|201|207) green "  OK   ($code) batch linkset" ;;
  *)
    red "  FAIL ($code) batch linkset"
    head -c 600 /tmp/seed-batch-ls.$$ >&2 || true; echo "" >&2
    rm -f /tmp/seed-batch-ls.$$
    exit 1
    ;;
esac
rm -f /tmp/seed-batch-ls.$$

# --- 3) Verify ---------------------------------------------------------------
if (( RUN_VERIFY )); then
  cyan "=== Verify: $DL_URL/01/$GTIN/10/$LOT?linkType=masterData ==="
  body="$(curl -sS -L -H 'Accept: application/ld+json' \
    "$DL_URL/01/$GTIN/10/$LOT?linkType=masterData" || true)"
  got_id="$(echo "$body" | jq -r '.id // empty' 2>/dev/null || true)"
  got_lot="$(echo "$body" | jq -r '.hasBatchLotNumber // empty' 2>/dev/null || true)"
  if [[ "$got_id" == *"/10/$LOT" && "$got_lot" == "$LOT" ]]; then
    green "  OK      batch master data surfaced (id=$got_id, hasBatchLotNumber=$got_lot)"
  else
    yellow "  WARN    lot master data not surfaced — resolved id='$got_id' lot='$got_lot'"
    yellow "          The per-lot doc is stored but the resolver redirected up to the GTIN."
    yellow "          Same self-ref masterData quirk as the per-serial case (commit 6d4420e):"
    yellow "          check matchingHrefIsCurrentRequest in DigitalLinkResolverResource.java."
    exit 2
  fi
fi

green "Batch entry seeded: $DL_URL/01/$GTIN/10/$LOT"
