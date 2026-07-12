#!/usr/bin/env bash
#
# verify-access-tiers.sh — End-to-end verification of the ESPR access tiers
# (OpenSearch DLS) on the demo Digital Link Resolver, per persona:
#
#   anon           -> Public only
#   demo-viewer    -> + AuthorizedOnly (authenticated tenant member: carries the
#                     `demo` realm role -> tenant DLS; mirrors the DPP API's
#                     AccessRoles where AuthorizedOnly = any authenticated
#                     caller with roles. Only WRITES need dpp-writer/admin.)
#   demo-operator  -> + AuthorizedOnly of own tenant (realm role demo)
#   demo-authority -> + Restricted of own tenant (demo + dpp-restricted)
#   demo-admin     -> + Restricted (dpp-admin is composite of dpp-restricted)
#
# Probe products (seeded by provision-demo.sh):
#   09521000001428  Public          (hero, isAnonymousAccessAllowed=true)
#   09521000002104  AuthorizedOnly
#   09521000002005  Restricted
#
# Personas come from /tmp/epcis-demo-users.json (e2e-demo-users.sh). Never
# prints passwords. Exits non-zero when any cell of the matrix mismatches.
#
# Usage: bash scripts/verify-access-tiers.sh
set -euo pipefail

DL_URL="${DL_URL:-https://id.demo.epcis.cloud}"
AUTH_URL="${AUTH_URL:-https://auth.demo.epcis.cloud}"
REALM="${REALM:-openepcis}"
CLIENT_ID="${CLIENT_ID:-backend-service}"
USERS_FILE="${USERS_FILE:-/tmp/epcis-demo-users.json}"

PUBLIC_GTIN=09521000001428
AUTHONLY_GTIN=09521000002104
RESTRICTED_GTIN=09521000002005

FAIL=0
red() { printf '\033[31m%s\033[0m\n' "$*"; FAIL=1; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }

# Users file is a flat array [{username,password,role,tier}]; the client
# secret comes from /tmp/epcis-demo-svc.env (e2e-demo-users.sh outputs).
SVC_FILE="${SVC_FILE:-/tmp/epcis-demo-svc.env}"
# shellcheck disable=SC1090
[ -f "$SVC_FILE" ] && . "$SVC_FILE"

token_for() { # persona -> access token (empty for anon)
  local persona="$1" pw
  [[ "$persona" == "anon" ]] && { echo ""; return 0; }
  pw=$(jq -r --arg u "$persona" '.[] | select(.username==$u) | .password' "$USERS_FILE")
  [[ -n "$pw" && "$pw" != null ]] || { red "no password for $persona in $USERS_FILE"; echo ""; return 0; }
  curl -sk -X POST "$AUTH_URL/realms/$REALM/protocol/openid-connect/token" \
    --data-urlencode grant_type=password --data-urlencode "client_id=${CLIENT_ID:-backend-service}" \
    ${CLIENT_SECRET:+--data-urlencode "client_secret=$CLIENT_SECRET"} \
    --data-urlencode "username=$persona" --data-urlencode "password=$pw" \
    | jq -r '.access_token // empty'
}

get_code() { # token gtin -> http code of inline masterData read
  local token="$1" gtin="$2"
  curl -sk -o /dev/null -w '%{http_code}' \
    ${token:+-H "Authorization: Bearer $token"} \
    "$DL_URL/01/$gtin?linkType=gs1:masterData"
}

check() { # persona token gtin expectation(visible|hidden) label
  local persona="$1" token="$2" gtin="$3" expect="$4" label="$5" code
  code=$(get_code "$token" "$gtin")
  case "$expect" in
    visible) [[ "$code" == 200 || "$code" == 302 ]] \
      && grn "  $persona / $label -> $code (visible ✓)" \
      || red "  $persona / $label -> $code (expected visible)" ;;
    hidden)  [[ "$code" == 401 || "$code" == 403 || "$code" == 404 ]] \
      && grn "  $persona / $label -> $code (hidden ✓)" \
      || red "  $persona / $label -> $code (expected hidden)" ;;
  esac
}

list_count() { # token -> number of products the persona can list
  local token="$1"
  curl -sk ${token:+-H "Authorization: Bearer $token"} "$DL_URL/products?pageSize=100" \
    | jq -r '.total // (.products|length) // 0' 2>/dev/null || echo "?"
}

cyan "=== ESPR access-tier matrix ($DL_URL) ==="
declare -a MATRIX=(
  # persona        public   authonly  restricted
  "anon           |visible |hidden   |hidden"
  "demo-viewer    |visible |visible  |hidden"
  "demo-operator  |visible |visible  |hidden"
  "demo-authority |visible |visible  |visible"
  "demo-admin     |visible |visible  |visible"
)

for row in "${MATRIX[@]}"; do
  IFS='|' read -r persona e_pub e_auth e_restr <<<"$row"
  persona=$(echo "$persona" | xargs); e_pub=$(echo "$e_pub" | xargs)
  e_auth=$(echo "$e_auth" | xargs); e_restr=$(echo "$e_restr" | xargs)
  token=$(token_for "$persona")
  if [[ "$persona" != "anon" && -z "$token" ]]; then red "  $persona: no token"; continue; fi
  check "$persona" "$token" "$PUBLIC_GTIN"     "$e_pub"   "Public"
  check "$persona" "$token" "$AUTHONLY_GTIN"   "$e_auth"  "AuthorizedOnly"
  check "$persona" "$token" "$RESTRICTED_GTIN" "$e_restr" "Restricted"
  echo "  $persona list count: $(list_count "$token")"
done

cyan "=== resolution regression (must stay public) ==="
for probe in \
  "$DL_URL/01/$PUBLIC_GTIN?linkType=gs1:epcisRepository|302" \
  "$DL_URL/01/$PUBLIC_GTIN?linkType=linkset|200" ; do
  IFS='|' read -r url want <<<"$probe"
  code=$(curl -sk -o /dev/null -w '%{http_code}' "$url")
  [[ "$code" == "$want" ]] && grn "  anon $url -> $code ✓" || red "  anon $url -> $code (expected $want)"
done

if [[ "$FAIL" -eq 0 ]]; then grn "✓ access-tier matrix green"; else red "✗ access-tier matrix has failures"; exit 1; fi
