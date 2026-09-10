#!/usr/bin/env bash
#
# Copyright (c) 2022-2026 benelog GmbH & Co. KG
# All rights reserved.
#
# Licensed under the benelog OpenEPCIS Framework Product License, Version 1.0.
# See BENELOG_LICENSE-1.0 for details.
#
# seed-serial-from-model.sh — Register an ITEM-level (GS1 AI 21) record for a
# product that already exists in the resolver, built from the COMPLETE stored
# model record plus the serial number. For connector-fed products (UnoPim /
# ERPNext) there is no seed file in this repo; the model in the catalog IS the
# source, so the item is read back from the resolver and written one level down.
#
#   GET /products/{gtin}                 (authenticated: the full stored record)
#   PUT /products/{gtin}/21/{serial}     body = model, id -> /01/{gtin}/21/{serial},
#                                        hasSerialNumber = serial
#
# The resolver keeps the instance as its own document and auto-populates the
# item-level linkset, so https://id.<env>/01/{gtin}/21/{serial} resolves to its
# own anchor instead of walking up to the GTIN. The model is NOT touched — the
# connector that owns it keeps syncing it, and the instance survives that.
#
# GS1 DE: on an environment with outbound sync enabled (demo, epc.is) an item
# anchor under a licensed GCP is pushed to GS1 production as a resolution rule
# (maxGranularity defaults to SGTIN), and prune is off, so it stays upstream.
# Use only serials you mean to publish.
#
# Usage:
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/seed-serial-from-model.sh --env=demo 04068194952020 12345678
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/seed-serial-from-model.sh --env=demo 04068194952020=12345678 04068194952112=12345678
#   scripts/seed-serial-from-model.sh --env=demo --dry-run 04068194952020 12345678
#
# Env: SEED_PW / SEED_CLIENT_SECRET (BRUNO_* accepted), SEED_USER (default per
# env, demo -> demo-admin), REALM, DL_URL / AUTH_URL overrides — the same
# conventions as provision-demo.sh.
#
# Exit codes: 0 ok · 1 a request failed · 2 verification failed · 64 bad args.
set -uo pipefail

ENV=demo; DRY=0; PAIRS=()
for arg in "$@"; do
  case "$arg" in
    --env=*)   ENV="${arg#--env=}" ;;
    --dry-run) DRY=1 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*) echo "Unknown arg: $arg" >&2; exit 64 ;;
    *) PAIRS+=("$arg") ;;
  esac
done

# Positional forms: "GTIN SERIAL" (exactly two) or any number of "GTIN=SERIAL".
JOBS=()
if [[ ${#PAIRS[@]} -eq 2 && "${PAIRS[0]}" != *=* && "${PAIRS[1]}" != *=* ]]; then
  JOBS+=("${PAIRS[0]}=${PAIRS[1]}")
else
  for p in "${PAIRS[@]}"; do
    [[ "$p" == *=* ]] || { echo "Expected GTIN=SERIAL, got: $p" >&2; exit 64; }
    JOBS+=("$p")
  done
fi
[[ ${#JOBS[@]} -gt 0 ]] || { echo "Nothing to do: give GTIN SERIAL or GTIN=SERIAL…" >&2; exit 64; }

case "$ENV" in
  dev)    : "${DL_URL:=https://id.dev.epcis.cloud}";  : "${AUTH_URL:=https://keycloak.dev.epcis.cloud}"; DEF_USER=admin ;;
  demo)   : "${DL_URL:=https://id.demo.epcis.cloud}"; : "${AUTH_URL:=https://auth.demo.epcis.cloud}";    DEF_USER=demo-admin ;;
  local)  : "${DL_URL:=https://id.epcis.local:8443}"; : "${AUTH_URL:=https://auth.epcis.local:8443}";    DEF_USER=admin ;;
  epc-is) : "${DL_URL:=https://id.epc.is}";           : "${AUTH_URL:=https://auth.epc.is}";              DEF_USER=demo-admin; DEF_REALM=platform ;;
  *) echo "Unknown --env: $ENV (expected dev|demo|local|epc-is)" >&2; exit 64 ;;
esac
REALM="${REALM:-${DEF_REALM:-openepcis}}"
SEED_CLIENT_ID="${SEED_CLIENT_ID:-backend-service}"
SEED_USER="${SEED_USER:-$DEF_USER}"                    # NOT $USERNAME — zsh reserves that
SEED_PW="${SEED_PW:-${BRUNO_PW:-}}"
SEED_CLIENT_SECRET="${SEED_CLIENT_SECRET:-${BRUNO_CLIENT_SECRET:-}}"
TOKEN_URL="$AUTH_URL/realms/$REALM/protocol/openid-connect/token"

cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
grn(){ printf '\033[32m%s\033[0m\n' "$*"; }
ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }

TOKEN=""
fetch_token() {
  if [[ -z "$SEED_PW" || -z "$SEED_CLIENT_SECRET" ]]; then
    red "Set SEED_PW and SEED_CLIENT_SECRET (password of '$SEED_USER' in realm '$REALM', secret of '$SEED_CLIENT_ID')." >&2
    exit 64
  fi
  cyan "→ Token for '$SEED_USER' from $TOKEN_URL"
  TOKEN=$(curl -sSk -X POST "$TOKEN_URL" \
    --data-urlencode grant_type=password \
    --data-urlencode "client_id=$SEED_CLIENT_ID" \
    --data-urlencode "client_secret=$SEED_CLIENT_SECRET" \
    --data-urlencode "username=$SEED_USER" \
    --data-urlencode "password=$SEED_PW" \
    --data-urlencode "scope=openid roles" | jq -r '.access_token // empty')
  [[ -n "$TOKEN" ]] || { red "Token request failed (check SEED_USER / SEED_PW / secret)."; exit 1; }
}
auth() { echo "Authorization: Bearer $TOKEN"; }

failed=0; unverified=0
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

if [[ "$DRY" -eq 1 ]]; then ylw "dry-run: skipping token"; else fetch_token; fi

for job in "${JOBS[@]}"; do
  gtin="${job%%=*}"; serial="${job#*=}"
  [[ "$gtin" =~ ^[0-9]{8,14}$ ]] || { red "  $gtin: not a GTIN"; failed=$((failed+1)); continue; }
  [[ -n "$serial" ]] || { red "  $gtin: empty serial"; failed=$((failed+1)); continue; }
  path="01/$gtin/21/$serial"
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] GET /products/$gtin -> PUT /products/$gtin/21/$serial (id $DL_URL/$path)"; continue; fi

  # 1) the complete model record, as stored
  code=$(curl -sSk -o "$tmp/model.json" -w '%{http_code}' "$DL_URL/products/$gtin" -H "$(auth)" -H 'Accept: application/json')
  if [[ "$code" != 200 ]]; then
    red "  $gtin: GET /products/$gtin -> $code (no model to derive the item from)"; failed=$((failed+1)); continue
  fi
  # 2) the item = model + serial. `id` follows the Digital Link of the item when
  #    the record carries one; the serial is set both as the GS1 field and
  #    (via the path) by the resolver itself. Nothing else is changed — the
  #    item inherits every model attribute, which is what "the complete model
  #    plus the serial" means.
  jq --arg id "$DL_URL/$path" --arg serial "$serial" '
    (if has("id") then .id = $id else . end) |
    .hasSerialNumber = $serial |
    del(.hasBatchLotNumber)' "$tmp/model.json" > "$tmp/item.json"
  code=$(curl -sSk -o "$tmp/put.json" -w '%{http_code}' -X PUT "$DL_URL/products/$gtin/21/$serial" \
    -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
    --data-binary "@$tmp/item.json")
  case "$code" in
    20[0-2]) grn "  item $path -> $code" ;;
    *) red "  item $path -> $code $(jq -rc '.detail // .message // empty' "$tmp/put.json" 2>/dev/null)"; failed=$((failed+1)); continue ;;
  esac
  # 3) verify: the linkset served for the item must be anchored at the item.
  anchor=$(curl -sk -H 'Accept: application/linkset+json' "$DL_URL/$path?linkType=all" | jq -r '.linkset[0].anchor // empty' 2>/dev/null)
  if [[ "$anchor" == "$DL_URL/$path" ]]; then grn "  $path resolves at its own anchor";
  else red "  $path anchor=${anchor:-none} (walk-up or missing)"; unverified=$((unverified+1)); fi
done

[[ "$failed" -eq 0 ]] || exit 1
[[ "$unverified" -eq 0 ]] || exit 2
grn "✓ done ($ENV)"
