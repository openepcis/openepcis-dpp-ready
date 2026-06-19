#!/usr/bin/env bash
# One-shot cleanup: DELETE the 9 legacy shared-GCP demo GTINs from the
# configured DLR. Run this before re-seeding with the new per-org GCPs
# so the old records don't shadow the new ones in any catalog lookups.
#
# Idempotent — 404 on already-deleted GTINs is treated as OK.
#
# Env:
#   BRUNO_PW            — admin password in the openepcis realm
#   BRUNO_CLIENT_SECRET — secret for backend-service in the openepcis realm
#
# Optional (default = dev):
#   DL_URL    — e.g. https://id.dev.epcis.cloud
#   AUTH_URL  — e.g. https://auth.dev.epcis.cloud

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

OLD_GTINS=(
  "09521234300014" "09521234300021" "09521234000075" "09521234300038"
  "09521234000013" "09521234000044"
  "09521234500018" "09521234500025" "09521234500049"
)

for gtin in "${OLD_GTINS[@]}"; do
  code=$(curl -sk -X DELETE "$DL_URL/products/$gtin" \
    -H "Authorization: Bearer $TOKEN" \
    -w "%{http_code}" -o /tmp/del.out)
  case "$code" in
    20[0-4]) green "$gtin  DELETE → $code" ;;
    404)     yellow "$gtin  DELETE → 404 (already absent)" ;;
    *)       red "$gtin  DELETE → $code"; head -c 200 /tmp/del.out; echo ;;
  esac
done
