#!/usr/bin/env bash
#
# verify-demo-epcis-events.sh — Decisive check that captured EPCIS events actually
# land in OpenSearch on demo (api.demo.epcis.cloud), after the capture-resilience fix.
#
# Two independent views:
#   A. OpenSearch (ground truth): list epcis-event*/capture-job* indices with doc
#      counts, total epcis-event-* doc count, and a literal search for a synthetic
#      EPC to see whether the just-captured events are stored + searchable.
#   B. EPCIS query API (end-user view): count events visible via the authenticated
#      query endpoint, to confirm the query side sees what the write side stored.
#
# Run it yourself (gated: reads OpenSearch password from the deploy env + execs into
# the shared opensearch pod + mints a Keycloak token):
#   ! bash scripts/verify-demo-epcis-events.sh
set -uo pipefail
C="${KCTX:-admin@talos-prod}"
N="openepcis-demo"
OSPOD="opensearch-0"
EPC="${EPC:-09521000001428}"          # one synthetic demo GTIN (id.demo.epcis.cloud/01/<gtin>)
K="kubectl --context $C -n $N"

echo "=== A. OpenSearch ground truth ==="
PW=$($K get deploy openepcis-rest-api -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="QUARKUS_OPENSEARCH_PASSWORD")].value}')
if [ -z "$PW" ]; then
  echo "  (QUARKUS_OPENSEARCH_PASSWORD not set as literal env; trying secret refs is out of scope)"
fi
oscurl() { $K exec "$OSPOD" -c opensearch -- sh -c "curl -s -k -u admin:'$PW' \"$1\""; }

echo "--- epcis-event* indices (index / docs.count / store) ---"
oscurl 'https://localhost:9200/_cat/indices/epcis-event*?h=index,docs.count,store.size&s=index'
echo "--- capture-job* indices ---"
oscurl 'https://localhost:9200/_cat/indices/capture-job*?h=index,docs.count&s=index'
echo "--- total docs across epcis-event-* ---"
oscurl 'https://localhost:9200/epcis-event-*/_count?pretty' | tr -d '\n' | sed 's/  */ /g'; echo
echo "--- literal search for EPC $EPC across epcis-event-* (hits.total) ---"
oscurl "https://localhost:9200/epcis-event-*/_search?q=%2A${EPC}%2A&size=0&pretty" \
  | tr -d '\n' | sed 's/.*"total"/"total"/; s/,"max_score".*//'; echo

echo
echo "=== B. EPCIS query API (authenticated end-user view) ==="
# Read demo-admin creds from the shared file written by e2e-demo-users.sh; do NOT reset
# the password here (resetting it desyncs the creds file the provision scripts rely on).
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
if [ -f "$CREDS" ] && [ -f "$SVC" ]; then
  . "$SVC"
  PWD2=$(python3 -c "import json;print([u['password'] for u in json.load(open('$CREDS')) if u['username']=='demo-admin'][0])" 2>/dev/null)
  TOK=$(curl -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password --data-urlencode "client_id=$CLIENT_ID" \
    --data-urlencode "client_secret=$CLIENT_SECRET" --data-urlencode username=demo-admin --data-urlencode "password=$PWD2" \
    --data-urlencode "scope=openid roles" | jq -r '.access_token // empty')
else
  TOK=""
fi
if [ -z "$TOK" ]; then echo "  (no valid demo-admin token; run scripts/e2e-demo-users.sh first — skipping query-API view)"; exit 0; fi

echo "--- GET /events?perPage=1 (X-Total-Count / EPCISQueryDocument size) ---"
curl -sS -D /tmp/veh.$$ -o /tmp/veb.$$ -w '  HTTP %{http_code}\n' --max-time 20 \
  -H "Authorization: Bearer $TOK" -H 'Accept: application/json' \
  "https://api.demo.epcis.cloud/events?perPage=1"
grep -i 'total' /tmp/veh.$$ || true
jq -r 'if .["epcisBody"]["queryResults"]["resultsBody"]["eventList"] then "  eventList len (this page)= \(.epcisBody.queryResults.resultsBody.eventList|length)" else (."@context"//"  (no eventList in body)") end' /tmp/veb.$$ 2>/dev/null || head -c 200 /tmp/veb.$$
rm -f /tmp/veh.$$ /tmp/veb.$$
echo
echo "done. If A shows epcis-event-<group>-YYYY-MM with a growing docs.count and the EPC search"
echo "returns total>0, ingestion is fixed end-to-end. If A has docs but B is empty, the gap is"
echo "query-side (EPC canonicalisation / group scoping), not capture."
