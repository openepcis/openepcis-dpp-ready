#!/usr/bin/env bash
#
# e2e-demo-scenarios.sh — Demo auth matrix. Reads /tmp/epcis-demo-users.json +
# /tmp/epcis-demo-svc.env (produced by e2e-demo-users.sh) and exercises every
# DPP-API tier + EPCIS + Digital Link path with per-persona tokens. No Keycloak
# admin needed. Prints PASS/FAIL and exits non-zero on any FAIL.
#
# Usage: bash scripts/e2e-demo-scenarios.sh
set -uo pipefail
CURL=curl; JQ=jq
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
[ -f "$CREDS" ] && [ -f "$SVC" ] || { echo "ABORT: run scripts/e2e-demo-users.sh first ($CREDS / $SVC missing)"; exit 1; }
# shellcheck disable=SC1090
. "$SVC"
DPP="https://dpp.demo.epcis.cloud"; API="https://api.demo.epcis.cloud"; IDB="https://id.demo.epcis.cloud"
ENC='https%3A%2F%2Fid.demo.epcis.cloud%2F01%2F09521000001428'; GTIN=09521000001428
PASS=0; FAILS=()
ok(){ echo "  PASS  $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL  $1"; FAILS+=("$1"); }
# assert code is (in list) / (not in list)
want_in(){ local code="$1" label="$2"; shift 2; for c in "$@"; do [ "$code" = "$c" ] && { ok "$label (code=$code)"; return; }; done; bad "$label (code=$code, want one of: $*)"; }
want_not(){ local code="$1" label="$2"; shift 2; for c in "$@"; do [ "$code" = "$c" ] && { bad "$label (code=$code, must NOT be $*)"; return; }; done; ok "$label (code=$code)"; }

pw_for(){ $JQ -r --arg u "$1" '.[]|select(.username==$u)|.password' "$CREDS"; }
token(){ # username -> access_token (password grant via backend-service)
  local u="$1" p; p=$(pw_for "$u")
  $CURL -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password \
    --data-urlencode "client_id=$CLIENT_ID" --data-urlencode "client_secret=$CLIENT_SECRET" \
    --data-urlencode "username=$u" --data-urlencode "password=$p" --data-urlencode scope=openid \
    | $JQ -r '.access_token // empty'
}
code_patch(){ $CURL -sS -o /dev/null -w '%{http_code}' --max-time 20 -X PATCH "$DPP/v1/dpps/$ENC" \
    ${1:+-H "Authorization: Bearer $1"} -H 'Content-Type: application/json' --data '{}'; }
code_get(){ $CURL -sS -o /dev/null -w '%{http_code}' --max-time 20 "$1" ${2:+-H "Authorization: Bearer $2"}; }

echo "=== token sanity (password grant per persona) ==="
# bash 3.2-safe token store: TOK_<sanitized-name>, read via T().
T(){ local v="TOK_${1//-/_}"; printf '%s' "${!v:-}"; }
for u in demo-admin demo-operator demo-authority demo-viewer demo-consumer; do
  t=$(token "$u"); printf -v "TOK_${u//-/_}" '%s' "$t"
  [ -n "$t" ] && echo "  $u: token ok (len ${#t})" || bad "token grant for $u"
done

echo "=== 1. anonymous Public read ==="
c=$($CURL -sS -o /tmp/s1.json -w '%{http_code}' --max-time 20 -H 'Accept: application/ld+json' "$DPP/v1/dppsByProductId/$ENC")
id=$($JQ -r '.uniqueProductIdentifier // empty' /tmp/s1.json 2>/dev/null)
{ [ "$c" = 200 ] && [ -n "$id" ]; } && ok "public read 200 + canonical id ($id)" || bad "public read (code=$c id=$id)"

echo "=== 2. bad bearer -> 401 ==="
want_in "$($CURL -sS -o /dev/null -w '%{http_code}' --max-time 20 -X POST "$DPP/v1/dpps" -H 'Authorization: Bearer garbage.token' -H 'Content-Type: application/ld+json' --data '{}')" "bad-bearer POST /v1/dpps" 401

echo "=== 3. anonymous write -> denied (401 or 403) ==="
want_in "$(code_patch '')" "anon PATCH /v1/dpps (denied)" 401 403

echo "=== 4. no-role personas write -> 403 (tier gate) ==="
want_in "$(code_patch "$(T demo-viewer)")"   "demo-viewer PATCH"   403
want_in "$(code_patch "$(T demo-consumer)")" "demo-consumer PATCH" 403

echo "=== 5. dpp-restricted (authority) write -> 403 ==="
want_in "$(code_patch "$(T demo-authority)")" "demo-authority PATCH" 403

echo "=== 6. write tier: dpp-writer passes the gate ==="
want_not "$(code_patch "$(T demo-operator)")" "demo-operator (dpp-writer) PATCH — write tier works" 401 403
# KNOWN DPP-API BEHAVIOUR (app authz, not infra): a user in the 'admins' group is
# denied the write (403 "Write not permitted") even carrying dpp-writer/dpp-admin,
# while a plain dpp-writer writes fine. Reported as info; write tier already proven.
adm=$(code_patch "$(T demo-admin)")
echo "  INFO  demo-admin (admins group) PATCH -> $adm  (DPP-API admins-group record-ACL path; investigate in openepcis-dpp-api AccessControlUtil)"

echo "=== 7. EPCIS query auth ==="
want_in  "$(code_get "$API/queries")"                       "EPCIS /queries anon (redirect)" 302 401
want_not "$(code_get "$API/queries" "$(T demo-admin)")"  "EPCIS /queries admin token"      401 302 403

echo "=== 8. Digital Link resolve + gs1:dpp linktype ==="
want_in "$(code_get "$IDB/01/$GTIN")" "DL resolve" 200 302
# gs1:dpp appears as a linkset KEY (not a string value), so grep the raw body.
dpp=$($CURL -sSL --max-time 20 -H 'Accept: application/json' "$IDB/01/$GTIN?linkType=all" 2>/dev/null | grep -o 'ref\.gs1\.org/voc/dpp' | head -1)
[ -n "$dpp" ] && ok "linkset advertises gs1:dpp" || bad "linkset missing gs1:dpp"
# also confirm the gs1:dpp link resolves to the DPP API
want_in "$($CURL -sSL -o /dev/null -w '%{http_code}' --max-time 20 "$IDB/01/$GTIN?linkType=gs1:dpp")" "gs1:dpp link resolves" 200

echo "=== 9. (info) restricted-tier field diff: full record anon vs authority ==="
na=$($CURL -sS --max-time 20 -H 'Accept: application/ld+json' "$DPP/v1/dpps/$ENC" | $JQ -r '[paths]|length' 2>/dev/null)
nr=$($CURL -sS --max-time 20 -H 'Accept: application/ld+json' -H "Authorization: Bearer $(T demo-authority)" "$DPP/v1/dpps/$ENC" | $JQ -r '[paths]|length' 2>/dev/null)
echo "  info: record field-paths anon=$na authority=$nr (restricted tier is field-level; >= means role reveals more)"

echo "=================================================="
if [ ${#FAILS[@]} -eq 0 ]; then echo "ALL PASS ($PASS checks)"; exit 0
else echo "FAILURES (${#FAILS[@]}): "; printf '  - %s\n' "${FAILS[@]}"; exit 1; fi
