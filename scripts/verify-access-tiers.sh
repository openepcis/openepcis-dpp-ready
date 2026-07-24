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
# FIELD-level security (FLS): CHECK_FIELD_TIERS=1 additionally verifies that on
# the PUBLIC probe product the three oec-core marker fields provision-demo.sh
# plants are filtered per persona (carbonFootprintStudyUrl = Public,
# dataQualityAssessment = AuthorizedOnly, eoriNumber =
# Restricted), that listings are filtered too, that the /field-access management
# API tightens/resets/refuses correctly, and that an FLS-filtered read PUT back
# by an operator does not destroy Restricted fields. Off by default: the demo
# backend must run with dlr.field-access.enforce + dlr.field-access.sync-enabled.
#
# Usage: bash scripts/verify-access-tiers.sh
#        CHECK_FIELD_TIERS=1 bash scripts/verify-access-tiers.sh
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
# NOTE: the epcisRepository probe is a PRE-EXISTING demo-data gap, NOT a field-
# access concern — no seeded product currently exposes a resolving
# gs1:epcisRepository link (admin, which bypasses all DLS/FLS, also 404s), so it
# is disabled here. Re-enable once provision-demo persists an epcisRepository
# link into the linkset. The linkset probe below is the meaningful public-
# resolution regression.
for probe in \
  "$DL_URL/01/$PUBLIC_GTIN?linkType=linkset|200" ; do
  IFS='|' read -r url want <<<"$probe"
  code=$(curl -sk -o /dev/null -w '%{http_code}' "$url")
  [[ "$code" == "$want" ]] && grn "  anon $url -> $code ✓" || red "  anon $url -> $code (expected $want)"
done

# ---------------------------------------------------------------- field-level security (FLS)
# Verifies field tiers on the PUBLIC probe product's master data. The three
# marker fields (planted by provision-demo.sh in bare shortcut spelling — the
# typed write path drops unknown prefixed keys) carry oec-core field tiers:
#   carbonFootprintStudyUrl   Public
#   dataQualityAssessment     AuthorizedOnly
#   eoriNumber                Restricted
# Policy writes address terms by curie (oec:...); the policy map matches both
# the curie and the bare alias. The MANDATED probe uses the battery vocabulary
# (dpp-core defaults are curated, not legally mandated).
# Linkset link-group tiering (resourceType=linkset, termCurie=<linkType>) is
# managed through the same /field-access API but is not probed here (all demo
# linkTypes default to Public).
if [[ "${CHECK_FIELD_TIERS:-0}" == "1" ]]; then

RC="carbonFootprintStudyUrl"
RUE="dataQualityAssessment"
MID="eoriNumber"
RUE_CURIE="oec:dataQualityAssessment"
MID_CURIE="oec:eoriNumber"
MANDATED_VOCAB="battery"
MANDATED_CURIE="eubat:ratedCapacity"
FA_RESOURCE="${FA_RESOURCE:-product}"  # resourceType for master-data field policies
# vocab = module name as vendored in the resolver's field-access defaults
# (battery, dpp-core, textile, ...), NOT the term prefix (oec/eubat).
FA_VOCAB="${FA_VOCAB:-dpp-core}"
FA_SYNC_WAIT="${FA_SYNC_WAIT:-2}"      # seconds to let a field-access sync settle

get_masterdata() { # token gtin -> inline masterData JSON body
  local token="$1" gtin="$2"
  curl -sk -H 'Accept: application/json' \
    ${token:+-H "Authorization: Bearer $token"} \
    "$DL_URL/01/$gtin?linkType=gs1:masterData"
}

check_fields() { # persona token gtin must_have_csv must_not_have_csv
  local persona="$1" token="$2" gtin="$3" must="$4" mustnot="$5" body f fields
  body=$(get_masterdata "$token" "$gtin")
  if ! jq -e 'type == "object"' >/dev/null 2>&1 <<<"$body"; then
    red "  $persona / $gtin -> masterData not inline JSON"; return 0
  fi
  IFS=',' read -ra fields <<<"$must"
  for f in "${fields[@]:-}"; do
    [[ -n "$f" ]] || continue
    jq -e --arg k "$f" 'has($k)' >/dev/null <<<"$body" \
      && grn "  $persona / $f -> present ✓" \
      || red "  $persona / $f -> missing (expected present)"
  done
  IFS=',' read -ra fields <<<"${mustnot:-}"
  for f in "${fields[@]:-}"; do
    [[ -n "$f" ]] || continue
    jq -e --arg k "$f" 'has($k) | not' >/dev/null <<<"$body" \
      && grn "  $persona / $f -> filtered ✓" \
      || red "  $persona / $f -> present (expected filtered)"
  done
}

fa_req() { # method path [json_body] -> echoes http code, response in /tmp/fa_resp.json
  local method="$1" path="$2" body="${3:-}"
  curl -sk -o /tmp/fa_resp.json -w '%{http_code}' -X "$method" \
    -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
    ${body:+--data-binary "$body"} "$DL_URL$path"
}

fa_sync() { # propagate policy change to the search index, then settle
  fa_req POST /field-access/sync >/dev/null
  sleep "$FA_SYNC_WAIT"
}

cyan "=== FLS field-tier matrix (PUBLIC $PUBLIC_GTIN masterData) ==="
declare -a FIELD_MATRIX=(
  # persona        must have          must NOT have
  "anon           |$RC               |$RUE,$MID"
  "demo-viewer    |$RC,$RUE          |$MID"
  "demo-operator  |$RC,$RUE          |$MID"
  "demo-authority |$RC,$RUE,$MID     |"
  "demo-admin     |$RC,$RUE,$MID     |"
)
ADMIN_TOKEN=""; OPERATOR_TOKEN=""; AUTHORITY_TOKEN=""
for row in "${FIELD_MATRIX[@]}"; do
  IFS='|' read -r persona must mustnot <<<"$row"
  persona=$(echo "$persona" | xargs); must=$(echo "$must" | xargs); mustnot=$(echo "$mustnot" | xargs)
  token=$(token_for "$persona")
  if [[ "$persona" != "anon" && -z "$token" ]]; then red "  $persona: no token"; continue; fi
  case "$persona" in
    demo-admin)     ADMIN_TOKEN="$token" ;;
    demo-operator)  OPERATOR_TOKEN="$token" ;;
    demo-authority) AUTHORITY_TOKEN="$token" ;;
  esac
  check_fields "$persona" "$token" "$PUBLIC_GTIN" "$must" "$mustnot"
done

cyan "=== FLS listing filter (/products, anon) ==="
if curl -sk "$DL_URL/products?pageSize=100" | grep -q "$RUE"; then
  red "  anon /products leaks $RUE (listings must be field-filtered too)"
else
  grn "  anon /products carries no $RUE ✓"
fi

cyan "=== FLS override loop (/field-access management API) ==="
if [[ -z "$ADMIN_TOKEN" ]]; then
  cyan "  note: no demo-admin token — skipping management-API override checks"
else
  code=$(fa_req GET "/field-access/matrix?vocab=$FA_VOCAB&resourceType=$FA_RESOURCE")
  [[ "$code" == 200 ]] \
    && grn "  GET matrix vocab=$FA_VOCAB -> $code ✓" \
    || red "  GET matrix vocab=$FA_VOCAB -> $code (expected 200)"

  # Tighten AuthorizedOnly -> Restricted: demo-operator must lose the field.
  # (policy writes address the term by curie; the document carries the bare alias)
  code=$(fa_req PUT "/field-access/policies/$FA_RESOURCE/$FA_VOCAB" \
    "[{\"termCurie\":\"$RUE_CURIE\",\"accessLevel\":\"Restricted\",\"note\":\"verify-access-tiers override probe\"}]")
  case "$code" in
    20[0-4])
      grn "  PUT $RUE -> Restricted ($code) ✓"
      fa_sync
      if [[ -n "$OPERATOR_TOKEN" ]]; then
        body=$(get_masterdata "$OPERATOR_TOKEN" "$PUBLIC_GTIN")
        jq -e --arg k "$RUE" 'has($k) | not' >/dev/null 2>&1 <<<"$body" \
          && grn "  demo-operator lost $RUE after override ✓" \
          || red "  demo-operator still sees $RUE after Restricted override"
      else
        red "  no demo-operator token to observe the override"
      fi
      # Reset: DELETE the override, field must come back for the operator.
      code=$(fa_req DELETE "/field-access/policies/$FA_RESOURCE/$FA_VOCAB/$RUE_CURIE")
      case "$code" in
        20[0-4])
          grn "  DELETE $RUE override ($code) ✓"
          fa_sync
          if [[ -n "$OPERATOR_TOKEN" ]]; then
            body=$(get_masterdata "$OPERATOR_TOKEN" "$PUBLIC_GTIN")
            jq -e --arg k "$RUE" 'has($k)' >/dev/null 2>&1 <<<"$body" \
              && grn "  demo-operator sees $RUE again after reset ✓" \
              || red "  demo-operator does not see $RUE after reset"
          fi ;;
        *) red "  DELETE $RUE override -> $code (override may be left active — remove manually!)" ;;
      esac ;;
    *) red "  PUT $RUE -> Restricted -> $code $(jq -rc '.violations // .detail // empty' /tmp/fa_resp.json 2>/dev/null)" ;;
  esac

  # Loosening below the vocabulary tier must be refused.
  code=$(fa_req PUT "/field-access/policies/$FA_RESOURCE/$FA_VOCAB" \
    "[{\"termCurie\":\"$MID_CURIE\",\"accessLevel\":\"Public\",\"note\":\"verify-access-tiers loosening probe\"}]")
  if [[ "$code" == 400 ]] && grep -q LOOSENING_FORBIDDEN /tmp/fa_resp.json; then
    grn "  loosening $MID_CURIE -> Public refused (400 LOOSENING_FORBIDDEN) ✓"
  else
    red "  loosening $MID_CURIE -> Public -> $code (expected 400 LOOSENING_FORBIDDEN) $(jq -rc '.violations // empty' /tmp/fa_resp.json 2>/dev/null)"
  fi

  # Mandated fields (Battery Regulation tiers) must not be overridable at all.
  code=$(fa_req PUT "/field-access/policies/$FA_RESOURCE/$MANDATED_VOCAB" \
    "[{\"termCurie\":\"$MANDATED_CURIE\",\"accessLevel\":\"AuthorizedOnly\",\"note\":\"verify-access-tiers mandated probe\"}]")
  if [[ "$code" == 400 ]] && grep -q MANDATED /tmp/fa_resp.json; then
    grn "  overriding mandated $MANDATED_CURIE refused (400 MANDATED) ✓"
  else
    red "  overriding mandated $MANDATED_CURIE -> $code (expected 400 MANDATED) $(jq -rc '.violations // empty' /tmp/fa_resp.json 2>/dev/null)"
  fi
fi

cyan "=== FLS write-path regression (filtered read must not destroy Restricted fields) ==="
# fetch-as-operator (FLS strips $MID) -> PUT back unchanged -> $MID must survive.
VERIFY_TOKEN="${AUTHORITY_TOKEN:-$ADMIN_TOKEN}"
if [[ -z "$OPERATOR_TOKEN" || -z "$VERIFY_TOKEN" ]]; then
  cyan "  note: need demo-operator + demo-authority/demo-admin tokens — skipping"
else
  op_body=$(get_masterdata "$OPERATOR_TOKEN" "$PUBLIC_GTIN")
  if ! jq -e 'type == "object"' >/dev/null 2>&1 <<<"$op_body"; then
    red "  operator masterData fetch not inline JSON — cannot run write-path regression"
  else
    code=$(curl -sk -o /tmp/fa_wr.json -w '%{http_code}' -X PUT "$DL_URL/products/$PUBLIC_GTIN" \
      -H "Authorization: Bearer $OPERATOR_TOKEN" -H 'Content-Type: application/json' \
      --data-binary "$op_body")
    case "$code" in
      20[0-4])
        body=$(get_masterdata "$VERIFY_TOKEN" "$PUBLIC_GTIN")
        jq -e --arg k "$MID" 'has($k)' >/dev/null 2>&1 <<<"$body" \
          && grn "  $MID survived operator round-trip write ✓" \
          || red "  $MID destroyed by operator round-trip write (FLS write-path bug)" ;;
      401|403|405)
        cyan "  note: demo-operator is not writer-capable here ($code) — skipping write-path regression" ;;
      *) red "  operator PUT /products/$PUBLIC_GTIN -> $code $(jq -rc '.detail // empty' /tmp/fa_wr.json 2>/dev/null)" ;;
    esac
  fi
fi

else
  cyan "note: field-level (FLS) checks skipped — set CHECK_FIELD_TIERS=1 once the demo runs with dlr.field-access.enforce + dlr.field-access.sync-enabled."
fi

if [[ "$FAIL" -eq 0 ]]; then grn "✓ access-tier matrix green"; else red "✗ access-tier matrix has failures"; exit 1; fi
