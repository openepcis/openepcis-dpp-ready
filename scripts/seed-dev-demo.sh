#!/usr/bin/env bash
#
# seed-dev-demo.sh — Seed dev.epcis.cloud with the canonical-context demo
# data the digital-data-management webapp resolves at runtime.
#
# What this does:
#   1. Creates every demo master-data record (textile, battery, packaging)
#      via the Bruno requests in 01-products/.
#   2. Captures every demo EPCIS event sequence (textile-lifecycle,
#      battery-lifecycle, packaging-lifecycle) via 02-epcis-events/.
#   3. Verifies each demo GTIN resolves back from the DLR with the
#      canonical dpp-core-context.jsonld.
#
# Idempotency:
#   - Master-data creation: the DLR rejects duplicates with 409. The
#     script treats 409 as success.
#   - EPCIS event capture: events are idempotent on their eventID
#     (urn:uuid:…). Re-running re-posts the same eventIDs; the EPCIS
#     ingest dedupes.
#
# Prerequisites:
#   - Bruno CLI (auto-installed via npx the first time).
#   - OIDC password + client secret for the dev environment, supplied
#     via env vars BRUNO_PW and BRUNO_CLIENT_SECRET (or via --env-var
#     overrides). These map to the `password` and `clientSecret`
#     secret slots in bruno/digital-link-resolver/environments/dev.bru.
#   - jq for the verification curls.
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/seed-dev-demo.sh
#   scripts/seed-dev-demo.sh --skip-verify           # capture only
#   scripts/seed-dev-demo.sh --only=products         # products only
#   scripts/seed-dev-demo.sh --only=events           # events only
#   scripts/seed-dev-demo.sh --only=verify           # verification only
#   scripts/seed-dev-demo.sh --env=local             # against localhost
#
# Exit codes:
#   0 — all steps OK (or verifiable 409 conflicts treated as OK)
#   1 — Bruno run failed for at least one folder
#   2 — verification mismatch on at least one demo GTIN

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COLLECTION="$REPO_ROOT/bruno/digital-link-resolver"
ENV="dev"
RUN_PRODUCTS=1
RUN_EVENTS=1
RUN_VERIFY=1

# Demo GTINs that must resolve back from the DLR after seeding.
# Source of truth: app/data/demo-catalog.ts in the openepcis-web webapp.
DEMO_GTINS=(
  # textile
  "09521234300014"  # winter jacket
  "09521234300021"  # trail running shoe
  "09521234000075"  # business suit (ITIP)
  "09521234300038"  # bed linen set
  # battery
  "09521234000013"  # EV battery pack
  "09521234000044"  # e-bike battery (LMT)
  # packaging
  "09521234500018"  # beverage bottle
  "09521234500025"  # multi-layer pouch
  "09521234500049"  # e-commerce carton
)

# Folder order — must match the EPCIS event-time ordering across the
# lifecycle: commissioning before transfers before EoL.
PRODUCT_FOLDERS=(
  "01-products/textile"
  "01-products/battery"
  "01-products/packaging"
)
EVENT_FOLDERS=(
  "02-epcis-events/textile-lifecycle"
  "02-epcis-events/battery-lifecycle"
  "02-epcis-events/packaging-lifecycle"
)

for arg in "$@"; do
  case "$arg" in
    --skip-verify)        RUN_VERIFY=0 ;;
    --only=products)      RUN_EVENTS=0; RUN_VERIFY=0 ;;
    --only=events)        RUN_PRODUCTS=0; RUN_VERIFY=0 ;;
    --only=verify)        RUN_PRODUCTS=0; RUN_EVENTS=0 ;;
    --env=*)              ENV="${arg#--env=}" ;;
    -h|--help)
      grep '^#' "$0" | head -40 | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown arg: $arg" >&2
      exit 64
      ;;
  esac
done

# Resolve env -> DLR URL purely for the verification curls. Source of
# truth for the Bruno runs themselves remains the env .bru file.
case "$ENV" in
  dev)   DL_URL="https://id.dev.epcis.cloud" ;;
  local) DL_URL="http://localhost:8080" ;;
  *)     echo "Unknown --env=$ENV (expected: dev, local)" >&2; exit 64 ;;
esac

cyan() { printf '\033[36m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()  { printf '\033[31m%s\033[0m\n' "$*"; }
green(){ printf '\033[32m%s\033[0m\n' "$*"; }

# Shared env-var overrides applied to every Bruno run. We pass the
# secrets through Bruno's --env-var flag so they never get committed.
bruno_env_args=( --env "$ENV" )
if [[ -n "${BRUNO_PW:-}" ]]; then
  bruno_env_args+=( --env-var "password=$BRUNO_PW" )
fi
if [[ -n "${BRUNO_CLIENT_SECRET:-}" ]]; then
  bruno_env_args+=( --env-var "clientSecret=$BRUNO_CLIENT_SECRET" )
fi

run_folder() {
  local folder="$1"
  cyan "→ bru run $folder  (env=$ENV)"
  pushd "$COLLECTION" > /dev/null
  if ! npx --yes @usebruno/cli@^3 run "$folder" -r "${bruno_env_args[@]}"; then
    red "  FAILED: $folder"
    popd > /dev/null
    return 1
  fi
  popd > /dev/null
}

verify_gtin() {
  local gtin="$1"
  local url="${DL_URL}/01/${gtin}?linkType=masterdata"
  local body
  body="$(curl -sS -L -H 'Accept: application/ld+json' "$url" || true)"
  if [[ -z "$body" ]]; then
    red "  MISS    $gtin  (empty response from $url)"
    return 1
  fi
  if echo "$body" | jq -e '.["@context"] | tostring | test("ref.openepcis.io/extensions/common/core/dpp-core-context")' > /dev/null 2>&1; then
    green "  OK      $gtin  (canonical @context resolved)"
    return 0
  fi
  yellow "  WARN    $gtin  (resolved but @context does not include canonical dpp-core)"
  return 1
}

failed=0

if (( RUN_PRODUCTS )); then
  cyan "=== Phase A: master-data products ==="
  for f in "${PRODUCT_FOLDERS[@]}"; do
    run_folder "$f" || failed=$((failed + 1))
  done
fi

if (( RUN_EVENTS )); then
  cyan "=== Phase B: EPCIS event sequences ==="
  for f in "${EVENT_FOLDERS[@]}"; do
    run_folder "$f" || failed=$((failed + 1))
  done
fi

if (( failed > 0 )); then
  red "$failed folder(s) failed during Bruno run. Aborting before verification." >&2
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
