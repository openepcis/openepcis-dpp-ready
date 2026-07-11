#!/usr/bin/env bash
#
# seed-dev-passports.sh — Provision the two rich, multi-granularity demo
# passports (Amperia StaxWall 10 battery, Fjordline Aurora Shell textile)
# into dev.epcis.cloud so the digital-data-management webapp resolves them
# live at every Digital Link granularity: model, batch and item.
#
# Why a separate script from seed-dev-demo.sh:
#   seed-dev-demo.sh seeds one GTIN-level master-data record per product via
#   POST /products. These two products are authored at three granularities,
#   each a distinct Digital Link that the DLR stores and resolves separately:
#     - model  (01/{gtin})            → POST /products               (GTIN-level)
#     - batch  (01/{gtin}/10/{lot})   → PUT  /products/{gtin}/10/{lot}
#     - item   (01/{gtin}/21/{serial})→ PUT  /products/{gtin}/21/{serial}
#   (The PUT sub-paths mirror the digital-data-management server routes
#    server/api/products/[gtin]/{10,21}/… which is how the app writes
#    lot- and serial-level master data.)
#   The full EPCIS 2.0 lifecycle trail for each product is captured to the
#   EPCIS REST /capture endpoint with the product's GS1-Extensions header so
#   the repository activates the right regulation namespace.
#
# What this does:
#   1. Fetches an OIDC access token from Keycloak via password grant.
#   2. For each product: POST model, PUT batch, PUT item master-data
#      (all marked isAnonymousAccessAllowed so the webapp resolves them
#      without a bearer token).
#   3. Captures each product's EPCIS lifecycle document with its
#      GS1-Extensions header.
#   4. Verifies the model, batch and item Digital Links all resolve back
#      from the DLR.
#
# Idempotency:
#   - Master-data: POST returns 409 on a duplicate GTIN → treated as success.
#     PUT is an upsert → re-running overwrites the batch/item record harmlessly.
#   - EPCIS events: deduped on their urn:uuid:… eventID by EPCIS ingest.
#
# Prerequisites:
#   - BRUNO_PW (admin user password in the openepcis realm)
#   - BRUNO_CLIENT_SECRET (secret for backend-service client in same realm)
#   - jq + curl
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/seed-dev-passports.sh
#   scripts/seed-dev-passports.sh --only=products
#   scripts/seed-dev-passports.sh --only=events
#   scripts/seed-dev-passports.sh --only=verify
#   scripts/seed-dev-passports.sh --env=demo
#
# Exit codes:
#   0 — all steps OK (409s treated as success)
#   1 — at least one write returned an unexpected status
#   2 — at least one Digital Link failed verification
#   64 — invalid arguments / missing credentials

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV="dev"
RUN_RESET=0
RUN_PRODUCTS=1
RUN_EVENTS=1
RUN_VERIFY=1

# Product table. One row per product:
#   gtin | lot | serial | model_file | batch_file | item_file | epcis_file | gs1_extensions
PRODUCTS=(
  "09521234002000|LOT-2026-AMP01|STAX10-2026-000001|extensions/eu/battery/examples/amperia-staxwall-model.jsonld|extensions/eu/battery/examples/amperia-staxwall-batch.jsonld|extensions/eu/battery/examples/amperia-staxwall-item.jsonld|extensions/eu/battery/epcis/amperia-staxwall-lifecycle.jsonld|oec=https://ref.openepcis.io/extensions/common/core/,eubat=https://ref.openepcis.io/extensions/eu/battery/"
  "09521234003007|LOT-2026-FJ03|AUR-2026-000001|extensions/eu/textile/examples/fjordline-aurora-model.jsonld|extensions/eu/textile/examples/fjordline-aurora-batch.jsonld|extensions/eu/textile/examples/fjordline-aurora-item.jsonld|extensions/eu/textile/epcis/fjordline-aurora-lifecycle.jsonld|oec=https://ref.openepcis.io/extensions/common/core/,eutex=https://ref.openepcis.io/extensions/eu/textile/"
)

for arg in "$@"; do
  case "$arg" in
    --reset)         RUN_RESET=1 ;;
    --only=reset)    RUN_RESET=1; RUN_PRODUCTS=0; RUN_EVENTS=0; RUN_VERIFY=0 ;;
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
    CLIENT_ID="backend-service"; USERNAME="${USERNAME:-admin}" ;;
  demo)
    DL_URL="https://id.demo.epcis.cloud"
    EPCIS_URL="https://api.demo.epcis.cloud"
    TOKEN_URL="https://auth.demo.epcis.cloud/realms/openepcis/protocol/openid-connect/token"
    CLIENT_ID="backend-service"; USERNAME="${USERNAME:-admin}" ;;
  local)
    DL_URL="http://localhost:8080"; EPCIS_URL="http://localhost:8080"
    TOKEN_URL="http://localhost:8180/realms/openepcis/protocol/openid-connect/token"
    CLIENT_ID="backend-service"; USERNAME="${USERNAME:-admin}" ;;
  *) echo "Unknown --env=$ENV (expected: dev, demo, local)" >&2; exit 64 ;;
esac

cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

need_token() { (( RUN_RESET + RUN_PRODUCTS + RUN_EVENTS > 0 )); }

TOKEN=""
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
    red "Token request failed:" >&2; echo "$TOKEN_JSON" >&2; exit 1
  fi
  green "  Token obtained ($(echo "$TOKEN_JSON" | jq -r '.expires_in')s expiry)"
fi

# write_master_abs METHOD URL ABS_FILE LABEL — POST/PUT a master-data file
# given by ABSOLUTE path; marks the record for anonymous (public) resolution.
write_master_abs() {
  local method="$1" url="$2" file="$3" label="$4" code
  code="$(curl -sS -o /tmp/seedp-resp.$$ -w '%{http_code}' \
    -X "$method" "$url" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "isAnonymousAccessAllowed: true" \
    --data-binary "@$file" || echo ERR)"
  case "$code" in
    200|201|202) green "  OK   ($code) $label  ← $file" ;;
    204)         green "  OK   (204) $label  ← $file" ;;
    409)         yellow "  SKIP (409 already exists) $label  ← $file" ;;
    400|500)
      # The DPP API POST is create-only: a re-seed returns 400 "Product already
      # present"; a lot/serial collision surfaces as 500 duplicate-key. Both
      # mean the record is already there — treat as an idempotent skip. Any
      # other 400/500 (real validation / server error) is still a failure.
      if grep -qiE "already present|duplicate key|product_pkey|23505" /tmp/seedp-resp.$$ 2>/dev/null; then
        yellow "  SKIP ($code already present) $label  ← $file"
      else
        red "  FAIL ($code) $label  ← $file"; head -c 400 /tmp/seedp-resp.$$ >&2 || true; echo "" >&2
        rm -f /tmp/seedp-resp.$$; return 1
      fi ;;
    *)  red "  FAIL ($code) $label  ← $file"; head -c 400 /tmp/seedp-resp.$$ >&2 || true; echo "" >&2
        rm -f /tmp/seedp-resp.$$; return 1 ;;
  esac
  rm -f /tmp/seedp-resp.$$
}

# del_product URL LABEL — DELETE a product/lot/serial record (ignore 404).
del_product() {
  local url="$1" label="$2" code
  code="$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE "$url" \
    -H "Authorization: Bearer $TOKEN" || echo ERR)"
  case "$code" in
    200|202|204) green "  DEL  ($code) $label" ;;
    404)         yellow "  DEL  (404 absent) $label" ;;
    *)           yellow "  DEL  ($code) $label" ;;
  esac
}

capture_events() {
  local file="$1" gs1ext="$2" label="$3" code
  # Note: the dev capture endpoint returns 406 when the GS1-CBV-Version /
  # GS1-EPCIS-Version request headers are present (content negotiation), so we
  # omit them — matching the proven seed-dev-demo.sh capture call. The
  # GS1-Extensions header stays: it tells the repository which regulation
  # namespace to activate.
  code="$(curl -sS -o /tmp/seedp-resp.$$ -w '%{http_code}' \
    -X POST "$EPCIS_URL/capture" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/ld+json" \
    -H "GS1-Extensions: $gs1ext" \
    --data-binary "@$REPO_ROOT/$file" || echo ERR)"
  case "$code" in
    200|201|202) green "  OK   ($code) $label  ← $file" ;;
    204)         green "  OK   (204) $label  ← $file" ;;
    *)  red "  FAIL ($code) $label  ← $file"; head -c 400 /tmp/seedp-resp.$$ >&2 || true; echo "" >&2
        rm -f /tmp/seedp-resp.$$; return 1 ;;
  esac
  rm -f /tmp/seedp-resp.$$
}

verify_dl() {
  local dl="$1" label="$2" body
  body="$(curl -sS -L -H 'Accept: application/ld+json' "${DL_URL}${dl}?linkType=masterdata" || true)"
  if [[ -z "$body" ]]; then red "  MISS  $label  ($dl)"; return 1; fi
  if echo "$body" | jq -e 'has("@context") or has("id") or has("@id") or has("linkset")' >/dev/null 2>&1; then
    green "  OK    $label  ($dl)"
  else
    yellow "  WARN  $label resolved but body not JSON-LD  ($dl)"; return 1
  fi
}

failed=0

if (( RUN_RESET )); then
  cyan "=== Phase 0: reset (DELETE existing records — serial, lot, then GTIN) ==="
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin lot serial _rest <<<"$row"
    del_product "$DL_URL/products/$gtin/21/$serial" "item   $gtin/21/$serial"
    del_product "$DL_URL/products/$gtin/10/$lot"    "batch  $gtin/10/$lot"
    del_product "$DL_URL/products/$gtin"            "model  $gtin"
  done
fi

if (( RUN_PRODUCTS )); then
  cyan "=== Phase A: master-data (model → POST /products, batch/item → PUT sub-path) ==="
  # The DPP API's ExtensionAwareValidator requires every stored record to be a
  # COMPLETE product of its declared type (e.g. an eubat:Battery record must
  # carry batteryChemistry). The granularity-pure batch/item files are partial
  # overlays, so we store the assembled projection at each level:
  #   batch record = model ⊕ batch      item record = model ⊕ batch ⊕ item
  # jq's `*` recursively deep-merges objects (arrays replace, later wins), so
  # the item record's @context (dpp-core + module) and its item fields win over
  # the model's. The raw partial files remain the granularity-pure source of
  # truth in dpp-ready; only the resolver-served projection is assembled.
  # Strip editorial `_comment_*` keys (recursively) so they don't pollute the
  # resolver-served master data / the app's attribute list. Source files keep
  # their documentation comments; only the provisioned copy is cleaned.
  STRIP='walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end)'
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin lot serial model batch item _epcis _ext <<<"$row"
    model_doc="/tmp/seedp-model.$$.json"
    batch_doc="/tmp/seedp-batch.$$.json"
    item_doc="/tmp/seedp-item.$$.json"
    jq "$STRIP"                       "$REPO_ROOT/$model"                                     > "$model_doc"
    jq -s '.[0] * .[1]'        "$REPO_ROOT/$model" "$REPO_ROOT/$batch"                     | jq "$STRIP" > "$batch_doc"
    jq -s '.[0] * .[1] * .[2]' "$REPO_ROOT/$model" "$REPO_ROOT/$batch" "$REPO_ROOT/$item" | jq "$STRIP" > "$item_doc"
    write_master_abs POST "$DL_URL/products"               "$model_doc"        "model  $gtin"           || failed=$((failed+1))
    write_master_abs PUT  "$DL_URL/products/$gtin/10/$lot"  "$batch_doc"        "batch  $gtin/10/$lot"   || failed=$((failed+1))
    write_master_abs PUT  "$DL_URL/products/$gtin/21/$serial" "$item_doc"       "item   $gtin/21/$serial" || failed=$((failed+1))
    rm -f "$model_doc" "$batch_doc" "$item_doc"
  done
fi

if (( RUN_EVENTS )); then
  cyan "=== Phase B: EPCIS lifecycle → $EPCIS_URL/capture ==="
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin _lot _serial _model _batch _item epcis ext <<<"$row"
    capture_events "$epcis" "$ext" "events $gtin" || failed=$((failed+1))
  done
fi

if (( failed > 0 )); then
  red "$failed write(s) failed. Skipping verification." >&2; exit 1
fi

if (( RUN_VERIFY )); then
  cyan "=== Phase C: Digital Link resolution verification ==="
  verify_failed=0
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin lot serial _rest <<<"$row"
    verify_dl "/01/$gtin"             "model  $gtin"           || verify_failed=$((verify_failed+1))
    verify_dl "/01/$gtin/10/$lot"     "batch  $gtin/10/$lot"   || verify_failed=$((verify_failed+1))
    verify_dl "/01/$gtin/21/$serial"  "item   $gtin/21/$serial" || verify_failed=$((verify_failed+1))
  done
  if (( verify_failed > 0 )); then
    red "$verify_failed Digital Link(s) failed verification" >&2; exit 2
  fi
fi

green "Passport seed complete."
