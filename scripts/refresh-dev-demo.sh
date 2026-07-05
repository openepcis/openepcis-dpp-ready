#!/usr/bin/env bash
#
# refresh-dev-demo.sh — One-command refresh of the dev demo dataset.
#
# Re-runs the full DLR seed cycle for the 9 demo products without leaving the
# linkset in a half-broken state. Order matters: every step regenerates or
# overwrites the linkset built by the previous one, so the runs must happen
# in this exact sequence.
#
#   1. DELETE  /products/{gtin}      — clear stale Product + linkset rows.
#   2. POST    /products             — re-create from canonical seed JSON-LD;
#                                      auto-populator emits the implicit
#                                      linkset (pip / certification / traceability / …)
#                                      based on master-data fields.
#   3. PUT     /products/{gtin}      — overlay image URLs from files.dev (via
#                                      upload-product-images.sh which also
#                                      uploads any missing image bytes); this
#                                      triggers re-population and adds the
#                                      `gs1:productImage` entry.
#   4. PATCH   {dl-url}/01/{gtin}    — apply the per-product epcis link entry
#                                      that surfaces EPCIS event history. PATCH
#                                      is non-destructive (action=add), so the
#                                      auto-populated entries from step 3
#                                      survive.
#
# Why not fold steps 2 and 3 into a single POST: image URLs aren't in the
# seed JSON-LD (they're product-instance data emitted by the upload script
# after C2PA signing + S3 upload). Keeping them separate means seed files
# stay portable to non-S3 environments.
#
# Env (set from .env or your shell):
#   BRUNO_PW            — admin user password in the openepcis realm
#   BRUNO_CLIENT_SECRET — backend-service client secret
#
# Optional flags:
#   --skip-images       — skip steps 3 + 4 (faster; for product-schema work)
#   --only=<step>       — run a single step: delete | post | put | patch | verify
#   --env=<dev|local>   — target environment (default: dev)
#   --dry-run           — print actions without executing
#
# Exit codes:
#   0 success
#   1 at least one step returned an unexpected status
#   64 invalid arguments or missing creds

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ENV="dev"
SKIP_IMAGES=0
ONLY=""
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --skip-images) SKIP_IMAGES=1 ;;
    --only=*)      ONLY="${arg#--only=}" ;;
    --env=*)       ENV="${arg#--env=}" ;;
    --dry-run)     DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,/^$/p' "$0"
      exit 0 ;;
    *)
      printf "Unknown argument: %s\n" "$arg" >&2
      exit 64 ;;
  esac
done

case "$ENV" in
  dev)
    DL_URL="${DL_URL:-https://id.dev.epcis.cloud}"
    FILES_URL="${FILES_URL:-https://files.dev.epcis.cloud}"
    AUTH_URL="${AUTH_URL:-https://auth.dev.epcis.cloud}"
    ;;
  demo)
    DL_URL="${DL_URL:-https://id.demo.epcis.cloud}"
    FILES_URL="${FILES_URL:-https://files.demo.epcis.cloud}"
    AUTH_URL="${AUTH_URL:-https://auth.demo.epcis.cloud}"
    ;;
  local)
    DL_URL="${DL_URL:-https://id.epcis.local:8443}"
    FILES_URL="${FILES_URL:-https://files.epcis.local:8443}"
    AUTH_URL="${AUTH_URL:-https://auth.epcis.local:8443}"
    ;;
  *)
    printf "Unknown --env: %s (expected dev|demo|local)\n" "$ENV" >&2
    exit 64 ;;
esac

REALM="${REALM:-openepcis}"
CLIENT_ID="${CLIENT_ID:-backend-service}"
USERNAME="${USERNAME:-admin}"

red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
blue()   { printf "\033[34m%s\033[0m\n" "$*"; }

if [[ "$DRY_RUN" -eq 0 ]]; then
  if [[ -z "${BRUNO_PW:-}" || -z "${BRUNO_CLIENT_SECRET:-}" ]]; then
    red "Set BRUNO_PW and BRUNO_CLIENT_SECRET in the environment." >&2
    exit 64
  fi

  TOKEN=$(curl -sk -X POST "$AUTH_URL/realms/$REALM/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" -d "client_id=$CLIENT_ID" \
    -d "client_secret=$BRUNO_CLIENT_SECRET" \
    -d "username=$USERNAME" -d "password=$BRUNO_PW" | jq -r '.access_token')
  if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
    red "Failed to fetch OIDC token from $AUTH_URL." >&2
    exit 1
  fi
else
  TOKEN="DRY-RUN-TOKEN"
fi

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
# Keep aligned with compute-demo-gtins.py.
GTINS=(
  09521000001428
  09521000002159
  09521000004207
  09521001001380
  09521002005004
  09521003000442
  09521004005019
  09521005000808
  09521006003013
)

run() {
  local label="$1"; shift
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf "[dry-run] %s\n" "$label"
    return 0
  fi
  "$@"
}

step_delete() {
  blue "▸ Step 1/4 — DELETE existing Product rows on $ENV"
  for gtin in "${GTINS[@]}"; do
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf "[dry-run] DELETE %s/products/%s\n" "$DL_URL" "$gtin"
      continue
    fi
    local code
    code=$(curl -sk -o /dev/null -w "%{http_code}" -X DELETE \
      -H "Authorization: Bearer $TOKEN" \
      "$DL_URL/products/$gtin")
    case "$code" in
      204|404) green "  $code  $gtin" ;;
      *)       red   "  $code  $gtin"; return 1 ;;
    esac
  done
}

step_post() {
  blue "▸ Step 2/4 — POST canonical seed JSON-LD"
  for i in "${!GTINS[@]}"; do
    local gtin="${GTINS[$i]}"
    local file="$REPO_ROOT/${PRODUCT_FILES[$i]}"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf "[dry-run] POST %s/products  ← %s\n" "$DL_URL" "$(basename "$file")"
      continue
    fi
    local code
    code=$(curl -sk -o /tmp/refresh-post.json -w "%{http_code}" -X POST \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d @"$file" \
      "$DL_URL/products")
    case "$code" in
      201|409) green "  $code  $gtin  ← $(basename "$file")" ;;
      *)       red   "  $code  $gtin  ← $(basename "$file")"
               head -c 400 /tmp/refresh-post.json >&2; echo >&2
               return 1 ;;
    esac
  done
}

step_put_images() {
  blue "▸ Step 3/4 — Upload + PUT image references"
  if [[ "$SKIP_IMAGES" -eq 1 ]]; then
    yellow "  SKIP (--skip-images)"
    return 0
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf "[dry-run] %s/upload-product-images.sh\n" "$SCRIPT_DIR"
    return 0
  fi
  DL_URL="$DL_URL" FILES_URL="$FILES_URL" AUTH_URL="$AUTH_URL" \
    BRUNO_PW="$BRUNO_PW" BRUNO_CLIENT_SECRET="$BRUNO_CLIENT_SECRET" \
    "$SCRIPT_DIR/upload-product-images.sh" \
      2>&1 | grep -E "PUT|SKIP|FAIL|uploaded" || true
}

step_patch_epcis() {
  blue "▸ Step 4/4 — PATCH per-product epcis linkset entry"
  if [[ "$SKIP_IMAGES" -eq 1 ]]; then
    yellow "  SKIP (--skip-images implies --skip-patches)"
    return 0
  fi
  local bruno="$REPO_ROOT/bruno/digital-link-resolver/05-linksets"
  if [[ ! -d "$bruno" ]]; then
    yellow "  SKIP (Bruno collection not found: $bruno)"
    return 0
  fi
  for f in "$bruno"/patch-epcis-*.bru; do
    [[ -e "$f" ]] || { yellow "  no patches found in $bruno"; return 0; }
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf "[dry-run] PATCH %s\n" "$(basename "$f")"
      continue
    fi
    local url body code
    url=$(grep -E '^\s+url:' "$f" | head -1 | awk -F'url: ' '{print $2}' | tr -d ' ' | sed "s|{{dl-url}}|$DL_URL|")
    # Extract the body block then interpolate {{dl-url}} the same way
    # Bruno does at runtime, so anchors point at the env-specific resolver.
    body=$(awk '/^body:json \{/{f=1;next} f && /^\}/{f=0} f' "$f" | sed "s|{{dl-url}}|$DL_URL|g")
    code=$(curl -sk -o /dev/null -w "%{http_code}" -X PATCH "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$body")
    case "$code" in
      200|207) green "  $code  $(basename "$f")" ;;
      *)       red   "  $code  $(basename "$f")"; return 1 ;;
    esac
  done
}

step_verify() {
  blue "▸ Verify — sample linkset for winter-jacket"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf "[dry-run] verify GET %s/01/09521000001428?linkType=linkset\n" "$DL_URL"
    return 0
  fi
  local linkTypes
  linkTypes=$(curl -sk "$DL_URL/01/09521000001428?linkType=linkset" \
    -H "Accept: application/ld+json" \
    | jq -r '.linkset[0] | to_entries
              | map(select(.key | startswith("https://gs1.org/voc/") or startswith("https://ref.gs1.org/voc/")))
              | map(.key | sub("https://gs1.org/voc/"; "gs1:") | sub("https://ref.gs1.org/voc/"; "gs1:"))
              | join(", ")' 2>/dev/null || true)
  if [[ -z "$linkTypes" ]]; then
    red "  empty linkset on winter-jacket — something went wrong above"
    return 1
  fi
  green "  winter-jacket linkTypes: $linkTypes"
}

case "$ONLY" in
  delete) step_delete ;;
  post)   step_post ;;
  put|images) step_put_images ;;
  patch)  step_patch_epcis ;;
  verify) step_verify ;;
  "")
    step_delete
    step_post
    step_put_images
    step_patch_epcis
    step_verify
    green "✓ refresh complete ($ENV)" ;;
  *)
    red "Unknown --only: $ONLY (expected delete|post|put|patch|verify)"
    exit 64 ;;
esac
