#!/usr/bin/env bash
#
# e2e-demo-finalize.sh — One-shot: (1) close the demo write-tier gap by adding the
# dpp-* realm roles to the backend-service client scope so tokens actually carry
# them, (2) store the persona logins in Vaultwarden, (3) re-run the scenario matrix.
#
# Run e2e-demo-users.sh first (creates /tmp/epcis-demo-users.json + -svc.env).
# For step 2, export BW_SESSION="$(bw unlock --raw)" (else it's skipped, not fatal).
#
# Usage:
#   export BW_SESSION="$(bw unlock --raw)"      # optional (for vault step)
#   bash scripts/e2e-demo-finalize.sh
set -uo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
CURL=curl; JQ=jq
A=https://auth.demo.epcis.cloud; R=openepcis; ADMIN="$A/admin/realms/$R"
SVC=/tmp/epcis-demo-svc.env; CREDS=/tmp/epcis-demo-users.json

b64url(){ local d="$1" m=$(( ${#1} % 4 )); [ $m -eq 2 ] && d="$d=="; [ $m -eq 3 ] && d="$d="; printf '%s' "$d" | tr '_-' '/+' | base64 -d 2>/dev/null; }

echo "############ 1. DPP write-tier gap: add dpp-* roles to backend-service client scope ############"
KU=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "$A/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token // empty')
[ -n "$AT" ] || { echo "ABORT: master admin token failed"; exit 1; }
CID=$($CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/clients?clientId=backend-service" | $JQ -r '.[0].id // empty')
[ -n "$CID" ] || { echo "ABORT: backend-service client not found"; exit 1; }
# ROOT CAUSE: backend-service has NO default client scopes, so the "roles" scope
# (whose realm-role mapper emits realm_access.roles) never runs -> tokens carry no
# realm roles -> DPP API write gate (dpp-*) can't be satisfied. Fix: assign the
# "roles" default client scope (idempotent). With fullScopeAllowed=true the user's
# assigned roles then appear in the token.
RSID=$($CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/client-scopes" | $JQ -r '.[]|select(.name=="roles")|.id')
rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X PUT "$ADMIN/clients/$CID/default-client-scopes/$RSID" -H "Authorization: Bearer $AT")
echo "  add 'roles' default client scope -> HTTP $rc (204=ok/no-op)"
echo "  default client scopes now: $($CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/clients/$CID/default-client-scopes" | $JQ -c '[.[].name]')"
# The demo realm's shared 'roles' scope mapper emits realm roles to a top-level
# 'roles' claim, but the DPP API (Quarkus default) reads realm_access.roles. Add a
# client-level mapper on backend-service that emits realm_access.roles (surgical —
# no other client affected). Idempotent.
HAS=$($CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/clients/$CID/protocol-mappers/models" | $JQ -r '[.[]|select(.config["claim.name"]=="realm_access.roles")]|length')
if [ "${HAS:-0}" = 0 ]; then
  rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$ADMIN/clients/$CID/protocol-mappers/models" -H "Authorization: Bearer $AT" -H 'Content-Type: application/json' -d '{
    "name":"realm roles (realm_access)","protocol":"openid-connect","protocolMapper":"oidc-usermodel-realm-role-mapper",
    "config":{"claim.name":"realm_access.roles","jsonType.label":"String","multivalued":"true","access.token.claim":"true","id.token.claim":"false","userinfo.token.claim":"false"}}')
  echo "  add realm_access.roles mapper on backend-service -> HTTP $rc"
else
  echo "  realm_access.roles mapper already present"
fi
# dpp-admin is meant to be "writes + Restricted read", but it was minted flat, so a
# dpp-admin user can't satisfy the write gate (which wants dpp-writer). Make dpp-admin
# a COMPOSITE of dpp-writer + dpp-restricted (Keycloak expands composites into the
# token's realm_access.roles). Idempotent.
COMP=$(for r in dpp-writer dpp-restricted; do $CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/roles/$r" | $JQ -c '{id,name}'; done | $JQ -s .)
rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X POST "$ADMIN/roles/dpp-admin/composites" -H "Authorization: Bearer $AT" -H 'Content-Type: application/json' -d "$COMP")
echo "  make dpp-admin composite(dpp-writer,dpp-restricted) -> HTTP $rc (204=ok/no-op)"
echo "  dpp-admin composites now: $($CURL -sS -H "Authorization: Bearer $AT" "$ADMIN/roles/dpp-admin/composites" | $JQ -c '[.[].name]')"

# Confirm a fresh demo-admin token now carries the roles (deterministic proof).
if [ -f "$SVC" ] && [ -f "$CREDS" ]; then
  . "$SVC"
  pw=$($JQ -r '.[]|select(.username=="demo-admin")|.password' "$CREDS")
  tok=$($CURL -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password \
    --data-urlencode "client_id=$CLIENT_ID" --data-urlencode "client_secret=$CLIENT_SECRET" \
    --data-urlencode username=demo-admin --data-urlencode "password=$pw" --data-urlencode scope=openid | $JQ -r '.access_token // empty')
  echo "  demo-admin token realm_access.roles: $(b64url "$(printf '%s' "$tok" | cut -d. -f2)" | $JQ -c '.realm_access.roles // []' 2>/dev/null)"
fi

echo "############ 2. Vaultwarden: store persona logins (OpenEPCIS -> demo) ############"
if [ -n "${BW_SESSION:-}" ]; then
  bash "$DIR/vault-sync-demo-users.sh"
else
  echo "  SKIPPED (no BW_SESSION). To store: export BW_SESSION=\"\$(bw unlock --raw)\" && bash $DIR/vault-sync-demo-users.sh"
fi

echo "############ 3. Re-run the scenario matrix ############"
bash "$DIR/e2e-demo-scenarios.sh"
