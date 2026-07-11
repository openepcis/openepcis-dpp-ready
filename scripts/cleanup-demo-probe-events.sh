#!/usr/bin/env bash
#
# cleanup-demo-probe-events.sh — Remove throwaway diagnostic events (serials PROBE-/URNPROBE-/
# DLPROBE-/CTXISO- and cause-isolate A-/B-) captured during the ingestion investigation.
# Uses one single-term URI query per token (multi-wildcard query_string trips OpenSearch's
# 1024 clause limit / the ':' parser). Leaves the real WJ-2024-00142 trail intact.
#
#   ! bash scripts/cleanup-demo-probe-events.sh
set -uo pipefail
C="${KCTX:-admin@talos-prod}"; N="openepcis-demo"; OSPOD="${OSPOD:-opensearch-0}"
K="kubectl --context $C -n $N"
PW=$($K get deploy openepcis-rest-api -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="QUARKUS_OPENSEARCH_PASSWORD")].value}')
os() {  $K exec "$OSPOD" -c opensearch -- sh -c "curl -s -k -u admin:'$PW' \"$1\""; }
osp() { $K exec "$OSPOD" -c opensearch -- sh -c "curl -s -k -u admin:'$PW' -X POST \"$1\""; }
count() { os "https://localhost:9200/epcis-event-*/_count?q=%2A${1}%2A" | tr -d '\n' | sed 's/,"_shards.*/}/'; echo; }

echo "=== before: events matching GTIN 09521000001428 ==="; count 09521000001428
# exact probe serials observed on this GTIN (leave WJ-2024-00142 = the real trail)
for tok in URNPROBE-7f170463e1 DLPROBE-5e0afb7328 CTXISO-883e542cfd B-0a40c629 PROBE CTXISO; do
  echo "--- delete *$tok* ---"
  osp "https://localhost:9200/epcis-event-*/_delete_by_query?refresh=true&conflicts=proceed&q=%2A${tok}%2A" \
    | tr -d '\n' | sed 's/,"version_conflicts.*//; s/{"took[^,]*,//'; echo
done
echo "=== after: remaining on GTIN 09521000001428 ==="; count 09521000001428
echo "--- remaining serials on that GTIN (should be only WJ-2024-00142) ---"
os "https://localhost:9200/epcis-event-*/_search?q=%2A09521000001428%2A&size=20&_source=epcList" \
  | python3 -c "import sys,json,re
d=json.load(sys.stdin)
ser=set()
for h in d.get('hits',{}).get('hits',[]):
    for e in (h.get('_source',{}).get('epcList') or []):
        s=e if isinstance(e,str) else json.dumps(e)
        m=re.search(r'/21/([^\"/]+)|sgtin:[0-9.]+\.([^\"]+)', s)
        ser.add(m.group(1) or m.group(2) if m else s[:40])
print('  serials:', sorted(ser))" 2>/dev/null || echo "  (could not parse epcList; check mapping)"
echo "done. If a non-WJ serial remains (cause-isolate A-/B-), tell me and I'll target it by exact serial."
