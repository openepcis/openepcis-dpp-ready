#!/usr/bin/env bash
#
# fix-nuxt-app-client-scopes.sh — Give the DDM's `nuxt-app` Keycloak client the
# `roles`, `profile` and `email` client scopes as DEFAULT scopes, so every token
# it issues carries the user's realm roles (dpp-admin/writer/restricted) and
# profile claims.
#
# Why: the DDM (digital-data-management) logs in via `nuxt-app` and forwards the
# resulting access token to the resolver / master-data API. That API gates the
# product/organization/place catalog on the dpp-* realm roles. `nuxt-app` was
# only issuing `scope=openid` with NO realm_access.roles, so the catalog came
# back empty and every record read was 403 — the DDM "edit mode" showed nothing.
# Making these DEFAULT client scopes means they are always included (no need to
# change the app's requested scope, and no invalid_scope risk).
#
# Idempotent. Prints only scope names, never secrets. Usage:
#   bash scripts/fix-nuxt-app-client-scopes.sh            # demo
#   REALM_HOST=auth.dev.epcis.cloud NS=openepcis-dev bash scripts/fix-nuxt-app-client-scopes.sh
set -euo pipefail

export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
CURL=curl; JQ=jq
REALM_HOST="${REALM_HOST:-auth.demo.epcis.cloud}"
NS="${NS:-openepcis-demo}"
CLIENT="${CLIENT:-nuxt-app}"
SCOPES=("roles" "profile" "email")
B="https://$REALM_HOST/admin/realms/openepcis"

KU=$(kubectl -n "$NS" get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n "$NS" get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "https://$REALM_HOST/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token')
[ -n "$AT" ] && [ "$AT" != null ] || { echo "admin token failed"; exit 1; }

CID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients?clientId=$CLIENT" | $JQ -r '.[0].id // empty')
[ -n "$CID" ] || { echo "client $CLIENT not found in realm openepcis @ $REALM_HOST"; exit 1; }
echo "client $CLIENT = $CID"

echo "default client-scopes BEFORE:"
$CURL -sS -H "Authorization: Bearer $AT" "$B/clients/$CID/default-client-scopes" | $JQ -r '.[].name' | sed 's/^/  /'

for s in "${SCOPES[@]}"; do
  SID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/client-scopes" | $JQ -r --arg n "$s" '.[]|select(.name==$n)|.id')
  if [ -z "$SID" ]; then echo "  scope $s: not found in realm (skip)"; continue; fi
  rc=$($CURL -sS -o /dev/null -w '%{http_code}' -X PUT "$B/clients/$CID/default-client-scopes/$SID" \
    -H "Authorization: Bearer $AT")
  echo "  scope $s -> default: HTTP $rc"
done

echo "default client-scopes AFTER:"
$CURL -sS -H "Authorization: Bearer $AT" "$B/clients/$CID/default-client-scopes" | $JQ -r '.[].name' | sed 's/^/  /'
echo "done. Re-login in the DDM (or wait for token refresh) — the forwarded token will now carry realm roles."
