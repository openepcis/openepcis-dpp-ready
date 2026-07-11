#!/usr/bin/env bash
#
# e2e-demo-users.sh — Set known strong passwords on the 5 demo personas and ensure
# their EN 18223 access-tier roles, so end-to-end auth scenarios (and Vaultwarden
# storage) have real credentials. Reset-only; no new accounts. Idempotent.
#
#   demo-admin     dpp-admin (+ group 'admins')  write + Restricted read
#   demo-operator  dpp-writer                    write
#   demo-authority dpp-restricted                Restricted read
#   demo-viewer    (none)                         Public read only
#   demo-consumer  (none)                         Public read only
#
# Keycloak admin: bootstrap 'temp-admin' (secret keycloak-initial-admin, ns
# openepcis-demo) lives in the MASTER realm — token from /realms/master, admin API
# at /admin/realms/openepcis.
#
# Output: writes /tmp/epcis-demo-users.json (0600) [{username,password,tier,roles}]
# for vault-sync-demo-users.sh + e2e-demo-scenarios.sh. Prints usernames/tiers only.
#
# Usage: bash scripts/e2e-demo-users.sh
set -euo pipefail
export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
CURL=curl; JQ=jq
AUTH="https://auth.demo.epcis.cloud"
ADMIN="$AUTH/admin/realms/openepcis"
OUT=/tmp/epcis-demo-users.json

KU=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "$AUTH/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token // empty')
[ -n "$AT" ] || { echo "ABORT: master admin token failed"; exit 1; }
H=(-H "Authorization: Bearer $AT")

create_role() { # name desc
  local rc; rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$ADMIN/roles" "${H[@]}" \
    -H 'Content-Type: application/json' -d "{\"name\":\"$1\",\"description\":\"$2\"}")
  case "$rc" in 201) echo "  role $1: created";; 409) echo "  role $1: exists";; *) echo "  role $1: FAILED($rc)";; esac
}
assign_role() { # username role
  local uid rid rc
  uid=$($CURL -sS "${H[@]}" "$ADMIN/users?username=$1&exact=true" | $JQ -r '.[0].id // empty')
  [ -n "$uid" ] || { echo "  $1: NOT FOUND (skip)"; return 0; }
  rid=$($CURL -sS "${H[@]}" "$ADMIN/roles/$2" | $JQ -c '{id,name}')
  rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$ADMIN/users/$uid/role-mappings/realm" \
    "${H[@]}" -H 'Content-Type: application/json' -d "[$rid]")
  case "$rc" in 204|201) echo "  assign $2 -> $1: ok";; *) echo "  assign $2 -> $1: FAILED($rc)";; esac
}
ensure_admins_group() { # username
  local gid uid
  gid=$($CURL -sS "${H[@]}" "$ADMIN/groups?search=admins" | $JQ -r '.[]|select(.name=="admins")|.id' | head -1)
  [ -n "$gid" ] || { $CURL -sS -o /dev/null -X POST "$ADMIN/groups" "${H[@]}" -H 'Content-Type: application/json' -d '{"name":"admins"}'
    gid=$($CURL -sS "${H[@]}" "$ADMIN/groups?search=admins" | $JQ -r '.[]|select(.name=="admins")|.id' | head -1); }
  uid=$($CURL -sS "${H[@]}" "$ADMIN/users?username=$1&exact=true" | $JQ -r '.[0].id // empty')
  [ -n "$uid" ] && [ -n "$gid" ] && $CURL -sS -o /dev/null -X PUT "$ADMIN/users/$uid/groups/$gid" "${H[@]}" && echo "  $1 in group admins"
}
set_pw() { # username password
  local uid; uid=$($CURL -sS "${H[@]}" "$ADMIN/users?username=$1&exact=true" | $JQ -r '.[0].id // empty')
  [ -n "$uid" ] || { echo "  $1: NOT FOUND"; return 1; }
  $CURL -sS -o /dev/null -w "  $1: set-password %{http_code}\n" -X PUT "$ADMIN/users/$uid/reset-password" "${H[@]}" \
    -H 'Content-Type: application/json' -d "{\"type\":\"password\",\"value\":\"$2\",\"temporary\":false}"
}

echo "=== ensure access-tier roles ==="
create_role dpp-writer     "EN 18223 DPP API: write (POST/PATCH)"
create_role dpp-admin      "EN 18223 DPP API: write + Restricted read"
create_role dpp-restricted "EN 18223 DPP API: Restricted-tier read"

echo "=== reset passwords + roles ==="
# bash 3.2-safe (no associative arrays): map username -> "tier|role" via case.
persona_meta() { case "$1" in
  demo-admin)     echo "write+restricted|dpp-admin" ;;
  demo-operator)  echo "write|dpp-writer" ;;
  demo-authority) echo "restricted|dpp-restricted" ;;
  demo-viewer)    echo "public|none" ;;
  demo-consumer)  echo "public|none" ;;
esac; }
umask 077; echo "[]" > "$OUT"
for u in demo-admin demo-operator demo-authority demo-viewer demo-consumer; do
  PW="E2E.demo.$(openssl rand -hex 10).Aa1"
  set_pw "$u" "$PW" || continue
  meta=$(persona_meta "$u"); tier=${meta%%|*}; r=${meta##*|}
  [ "$r" != none ] && assign_role "$u" "$r"
  [ "$u" = demo-admin ] && ensure_admins_group "$u"
  tmp=$($JQ -c --arg u "$u" --arg p "$PW" --arg t "$tier" --arg r "$r" \
        '. + [{username:$u,password:$p,tier:$t,role:$r}]' "$OUT")
  echo "$tmp" > "$OUT"
done
chmod 600 "$OUT"

# Companion file for the scenario runner: backend-service client secret + token URL,
# so e2e-demo-scenarios.sh can mint password-grant tokens without Keycloak admin.
CID=$($CURL -sS "${H[@]}" "$ADMIN/clients?clientId=backend-service" | $JQ -r '.[0].id // empty')
SEC=$($CURL -sS "${H[@]}" "$ADMIN/clients/$CID/client-secret" | $JQ -r '.value // empty')
SVC=/tmp/epcis-demo-svc.env
umask 077
{ echo "CLIENT_ID=backend-service"; echo "CLIENT_SECRET=$SEC";
  echo "TOKEN_URL=$AUTH/realms/openepcis/protocol/openid-connect/token"; } > "$SVC"
chmod 600 "$SVC"
echo "  wrote $SVC (0600) for the scenario runner"

echo "=== wrote $(jq length "$OUT") credentials to $OUT (0600) ==="
jq -r '.[]|"  \(.username)  tier=\(.tier)  role=\(.role)"' "$OUT"
echo "Next: bash scripts/vault-sync-demo-users.sh   (with BW_SESSION), then the scenario run."
