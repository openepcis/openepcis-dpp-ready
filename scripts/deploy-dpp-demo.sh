#!/usr/bin/env bash
#
# deploy-dpp-demo.sh — Apply the demo dpp-api module (new :stable image with the
# public-host Digital Link fix + keycloak access tiers baked in, and the
# access_backend=keycloak / resolver_public_host terraform change).
#
# Requires: secrets.env (TF_HTTP_USERNAME/PASSWORD) at the terraform repo root.
# Retrieves the backend-service client secret from the demo realm in-process and
# exports it as TF_VAR_keycloak_client_secret (the only no-default demo variable).
# Nothing secret is printed.
#
# Run BEFORE this: bump var.dpp_api_image digest in demo.epcis.cloud/variables.tf
# to the new openepcis-dpp-api:stable digest.
#
# Usage: bash scripts/deploy-dpp-demo.sh
set -euo pipefail

export KUBECONFIG="${KUBECONFIG:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes/talos-prod/kubeconfig}"
TFDIR=/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes
CURL=curl; JQ=jq

# TF_HTTP_* backend creds
set -a; . "$TFDIR/secrets.env"; set +a

# backend-service client secret -> TF_VAR_keycloak_client_secret (in-process only)
KU=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.username}' | base64 -d)
KP=$(kubectl -n openepcis-demo get secret keycloak-initial-admin -o jsonpath='{.data.password}' | base64 -d)
AT=$($CURL -sS -X POST "https://auth.demo.epcis.cloud/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode "username=$KU" --data-urlencode "password=$KP" | $JQ -r '.access_token')
B="https://auth.demo.epcis.cloud/admin/realms/openepcis"
CID=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients?clientId=backend-service" | $JQ -r '.[0].id')
export TF_VAR_keycloak_client_secret=$($CURL -sS -H "Authorization: Bearer $AT" "$B/clients/$CID/client-secret" | $JQ -r '.value')
[ -n "$TF_VAR_keycloak_client_secret" ] && [ "$TF_VAR_keycloak_client_secret" != null ] || { echo "client secret fetch failed"; exit 1; }

cd "$TFDIR/demo.epcis.cloud"
tofu init -input=false >/dev/null
echo "=== plan (dpp_api + digital_link) ==="
tofu plan -input=false -target=module.dpp_api -target=module.digital_link
echo "=== apply (dpp_api + digital_link) ==="
tofu apply -input=false -auto-approve -target=module.dpp_api -target=module.digital_link
echo "=== rollout ==="
kubectl -n openepcis-demo rollout status deployment/openepcis-dpp-api --timeout=180s
kubectl -n openepcis-demo rollout status deployment/openepcis-digital-link --timeout=180s
