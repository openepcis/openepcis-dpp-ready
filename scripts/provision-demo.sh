#!/usr/bin/env bash
#
# provision-demo.sh — Canonical, idempotent provisioner for the OpenEPCIS DPP
# demo catalogue (the 11 products the DDM `demo-catalog.ts` resolves, their
# product images, the manufacturer organizations, and the per-product EPCIS
# traceability link). One command, one source of truth.
#
# Supersedes the scattered flow (seed-dev-demo.sh + upload-product-images.sh +
# seed-organizations.sh + provision-demo-epcis-links.sh + refresh-dev-demo.sh +
# seed-dev-passports.sh). Persona passwords are never touched (that is
# e2e-demo-users.sh's job). The two hero products (Fjordline / Amperia) are
# provisioned at all three granularities (model + batch + item) because
# DELETE /products/{gtin} removes the WHOLE tree including lot/serial rows.
#
# WHY a single script:
#   - The 11-product catalogue (9 canonical + Fjordline/Amperia heroes) lived
#     split across scripts; only some knew the hero GTINs.
#   - Images were attached with a GET-modify-PUT that re-populates the resolver
#     linkset and silently drops links (masterData/epcis). Here images are
#     EMBEDDED in the product POST body, so one write yields a complete linkset.
#   - `USERNAME` is a special read-only parameter in zsh (it reflects the login
#     user), so `USERNAME=demo-admin …` was silently ignored. This script reads
#     SEED_USER instead, with a correct per-env default (demo -> demo-admin).
#
# Usage:
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/provision-demo.sh --env=demo
#   scripts/provision-demo.sh --env=demo --only=products      # one phase
#   scripts/provision-demo.sh --env=demo --only=orgs,epcis
#   scripts/provision-demo.sh --env=demo --events             # also capture EPCIS events
#   scripts/provision-demo.sh --env=demo --dry-run
#
# Env (BRUNO_* accepted as fallbacks for the old muscle memory):
#   SEED_PW / BRUNO_PW                     password of SEED_USER in realm `openepcis`
#   SEED_CLIENT_SECRET / BRUNO_CLIENT_SECRET  secret of the backend-service client
#   SEED_USER            override the seed user (default per-env; demo=demo-admin)
#   Optional overrides: DL_URL FILES_URL AUTH_URL API_URL SEED_CLIENT_ID
#
# Phases (default: products orgs epcis verify): products, orgs, epcis, events, verify.
set -uo pipefail

# ------------------------------------------------------------------ args
ENV=demo; ONLY=""; DRY=0; WANT_EVENTS=0
for arg in "$@"; do
  case "$arg" in
    --env=*)   ENV="${arg#--env=}" ;;
    --only=*)  ONLY="${arg#--only=}" ;;
    --events)  WANT_EVENTS=1 ;;
    --dry-run) DRY=1 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

# ------------------------------------------------------------------ env
case "$ENV" in
  dev)   : "${DL_URL:=https://id.dev.epcis.cloud}";   : "${FILES_URL:=https://files.dev.epcis.cloud}";   : "${AUTH_URL:=https://keycloak.dev.epcis.cloud}"; : "${API_URL:=https://api.dev.epcis.cloud}";   DEF_USER=admin ;;
  demo)  : "${DL_URL:=https://id.demo.epcis.cloud}";  : "${FILES_URL:=https://files.demo.epcis.cloud}";  : "${AUTH_URL:=https://auth.demo.epcis.cloud}";    : "${API_URL:=https://api.demo.epcis.cloud}";  DEF_USER=demo-admin ;;
  local) : "${DL_URL:=https://id.epcis.local:8443}";  : "${FILES_URL:=https://files.epcis.local:8443}";  : "${AUTH_URL:=https://auth.epcis.local:8443}";    : "${API_URL:=https://api.epcis.local:8443}";  DEF_USER=admin ;;
  *) echo "Unknown --env: $ENV (expected dev|demo|local)" >&2; exit 64 ;;
esac
REALM="${REALM:-openepcis}"
SEED_CLIENT_ID="${SEED_CLIENT_ID:-backend-service}"
SEED_USER="${SEED_USER:-$DEF_USER}"                    # NOT $USERNAME — zsh reserves that
SEED_PW="${SEED_PW:-${BRUNO_PW:-}}"
SEED_CLIENT_SECRET="${SEED_CLIENT_SECRET:-${BRUNO_CLIENT_SECRET:-}}"
TOKEN_URL="$AUTH_URL/realms/$REALM/protocol/openid-connect/token"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGES_DIR="${IMAGES_DIR:-$REPO_ROOT/scripts/images}"
ORG_BRU_DIR="$REPO_ROOT/bruno/digital-link-resolver/04-organizations"

PHASES="${ONLY:-products orgs epcis verify}"
PHASES="${PHASES//,/ }"
[ "$WANT_EVENTS" -eq 1 ] && PHASES="$PHASES events"

cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
grn(){ printf '\033[32m%s\033[0m\n' "$*"; }
ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }
has(){ [[ " $PHASES " == *" $1 "* ]]; }

# ------------------------------------------------------------------ catalogue
# gtin | seed JSON-LD (repo-relative) | image slug | description
PRODUCTS=(
  "09521000001428|extensions/eu/textile/examples/garment-product.jsonld|alpine-pro-winter-jacket|Alpine Pro Winter Jacket"
  "09521000002159|extensions/eu/textile/examples/footwear-product.jsonld|trailrunner-shoe|TrailRunner Performance Shoe"
  "09521000004207|extensions/eu/textile/examples/garment-set-itip.jsonld|business-suit|Classic Business Suit"
  "09521001001380|extensions/eu/textile/examples/hometextile-bedlinen.jsonld|bed-linen-set|Casa Lina Organic Cotton Bed Linen Set"
  "09521002005004|extensions/eu/battery/examples/battery-product.jsonld|industrial-battery-im500|EcoCell Industrial Battery Module IM-500"
  "09521003000442|extensions/eu/battery/examples/portable-ebike-battery.jsonld|ebike-battery-vp48|VeloPower e-bike Battery Pack VP-48V-14Ah"
  "09521004005019|extensions/eu/ppwr/examples/beverage-bottle.jsonld|water-bottle-500ml|Mountain Spring 500 mL PET Bottle"
  "09521005000808|extensions/eu/ppwr/examples/multi-layer-pouch.jsonld|snack-pouch-80g|FlexiSnack Multi-layer Pouch"
  "09521006003013|extensions/eu/ppwr/examples/ecommerce-carton.jsonld|ecommerce-carton|EcoFlow corrugated shipping carton"
  "09521234003007|extensions/eu/textile/examples/fjordline-aurora-model.jsonld|fjordline-aurora-shell|Fjordline Aurora Shell jacket"
  "09521234002000|extensions/eu/battery/examples/amperia-staxwall-model.jsonld|amperia-staxwall-10|Amperia StaxWall 10 Home Battery"
)

# Hero products additionally carry batch + item granularities (model⊂batch⊂item
# deep-merge, PUT sub-paths) — the DDM provenance/assemble demo resolves the
# item level, and DELETE /products/{gtin} above wipes the whole tree.
# gtin | lot | serial | batch overlay | item overlay
HEROES=(
  "09521234002000|LOT-2026-AMP01|STAX10-2026-000001|extensions/eu/battery/examples/amperia-staxwall-batch.jsonld|extensions/eu/battery/examples/amperia-staxwall-item.jsonld"
  "09521234003007|LOT-2026-FJ03|AUR-2026-000001|extensions/eu/textile/examples/fjordline-aurora-batch.jsonld|extensions/eu/textile/examples/fjordline-aurora-item.jsonld"
)
STRIP='walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end)'

# ------------------------------------------------------------------ auth
TOKEN=""
fetch_token() {
  if [[ -z "$SEED_PW" || -z "$SEED_CLIENT_SECRET" ]]; then
    red "Set SEED_PW and SEED_CLIENT_SECRET (or BRUNO_PW / BRUNO_CLIENT_SECRET)." >&2
    red "  SEED_PW            = password of '$SEED_USER' in realm '$REALM'" >&2
    red "  SEED_CLIENT_SECRET = secret of the '$SEED_CLIENT_ID' client" >&2
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

# ------------------------------------------------------------------ products (+ embedded images)
upload_image() { # gtin key src  -> echoes URL
  local gtin="$1" key="$2" src="$3" mime resp code
  case "$src" in
    *.png) mime=image/png ;; *.jpg|*.jpeg) mime=image/jpeg ;; *.webp) mime=image/webp ;;
    *) red "  unknown image type: $src" >&2; return 1 ;;
  esac
  resp=$(curl -sk -X POST "$FILES_URL/files" -H "$(auth)" \
    -F "file=@$src;type=$mime" -F "key=products/$gtin/$key" -F "anonymous=true" -w '\n%{http_code}')
  code=${resp##*$'\n'}
  [[ "$code" == 20[01] ]] || { red "  image upload $gtin/$key -> $code" >&2; return 1; }
  echo "$FILES_URL/files/products/$gtin/$key"
}

collect_image_urls() { # gtin slug -> prints JSON array of uploaded URLs
  local gtin="$1" slug="$2" src urls=() n=0 url
  for n in 1 2 3 4; do
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}-${n}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "${slug}-${n}" "$src") && urls+=("$url"); break; }
    done
  done
  if [[ ${#urls[@]} -eq 0 ]]; then
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "$slug" "$src") && urls+=("$url"); break; }
    done
  fi
  # bash 3.2 (macOS default) errors on "${urls[@]}" when the array is empty
  # under set -u, and an empty printf line would become [""] — guard both.
  if [[ ${#urls[@]} -eq 0 ]]; then echo '[]'; else printf '%s\n' "${urls[@]}" | jq -R . | jq -s .; fi
}

provision_product() { # gtin file slug desc
  local gtin="$1" rel="$2" slug="$3" desc="$4" file="$REPO_ROOT/$2"
  [[ -f "$file" ]] || { red "  missing seed file: $rel"; return 1; }
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] product $gtin  ($rel + images)"; return 0; fi
  local urls_json; urls_json=$(collect_image_urls "$gtin" "$slug")
  # Embed the image referencedFile array into the seed body so a single POST
  # yields a complete linkset (no lossy follow-up PUT).
  # Strip editorial _comment* keys (same STRIP as the passport seeder), then embed images.
  local body; body=$(jq --argjson urls "$urls_json" --arg desc "$desc" '
    walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end) |
    if ($urls|length) > 0 then .referencedFile = ($urls | to_entries | map({
        "type":"gs1:ReferencedFileDetails","fileLanguageCode":"en",
        "contentDescription": ($desc + " (image " + ((.key+1)|tostring) + ")"),
        "referencedFileType": {"id":"gs1:ReferencedFileTypeCode-PRODUCT_IMAGE"},
        "id": .value, "referencedFileURL": .value })) else . end' "$file")
  # Idempotent: delete-then-create so the linkset is rebuilt cleanly each run.
  curl -sk -o /dev/null -X DELETE "$DL_URL/products/$gtin" -H "$(auth)"
  local code; code=$(curl -sk -o /tmp/pd_prov.json -w '%{http_code}' -X POST "$DL_URL/products" \
    -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
    --data-binary "$body")
  local nimg; nimg=$(echo "$urls_json" | jq 'length')
  case "$code" in
    20[0-2]) grn "  product $gtin ($nimg img) -> $code" ;;
    *) red "  product $gtin -> $code $(jq -rc '.detail // empty' /tmp/pd_prov.json 2>/dev/null)" ;;
  esac
}

# ------------------------------------------------------------------ hero batch/item granularities
provision_hero_sublevels() {
  local row gtin lot serial batch item model code doc
  for row in "${HEROES[@]}"; do
    IFS='|' read -r gtin lot serial batch item <<<"$row"
    model=""
    local prow
    for prow in "${PRODUCTS[@]}"; do
      [[ "$prow" == "$gtin|"* ]] && { IFS='|' read -r _ model _ _ <<<"$prow"; break; }
    done
    [[ -n "$model" && -f "$REPO_ROOT/$model" && -f "$REPO_ROOT/$batch" && -f "$REPO_ROOT/$item" ]]       || { red "  hero $gtin: missing model/batch/item file"; continue; }
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] hero $gtin batch=$lot item=$serial"; continue; fi
    doc=$(jq -s '.[0] * .[1]' "$REPO_ROOT/$model" "$REPO_ROOT/$batch" | jq "$STRIP")
    code=$(curl -sk -o /dev/null -w '%{http_code}' -X PUT "$DL_URL/products/$gtin/10/$lot"       -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true'       --data-binary "$doc")
    case "$code" in 20[0-2]) grn "  hero batch $gtin/10/$lot -> $code" ;; *) red "  hero batch $gtin/10/$lot -> $code" ;; esac
    doc=$(jq -s '.[0] * .[1] * .[2]' "$REPO_ROOT/$model" "$REPO_ROOT/$batch" "$REPO_ROOT/$item" | jq "$STRIP")
    code=$(curl -sk -o /dev/null -w '%{http_code}' -X PUT "$DL_URL/products/$gtin/21/$serial"       -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true'       --data-binary "$doc")
    case "$code" in 20[0-2]) grn "  hero item  $gtin/21/$serial -> $code" ;; *) red "  hero item  $gtin/21/$serial -> $code" ;; esac
  done
}

# ------------------------------------------------------------------ organizations (compact Bruno bodies)
extract_bru_body() { # bru-file -> JSON body
  python3 -c "
import sys
t=open(sys.argv[1]).read()
i=t.index('body:json'); w=t.index('{', i); s=t.index('{', w+1); d=0
for j in range(s,len(t)):
    if t[j]=='{': d+=1
    elif t[j]=='}':
        d-=1
        if d==0: print(t[s:j+1]); break
" "$1"
}

provision_orgs() {
  cyan "▸ Organizations"
  local f gln code
  for f in "$ORG_BRU_DIR"/create-*.bru; do
    [[ -f "$f" ]] || continue
    extract_bru_body "$f" > /tmp/org_prov.json 2>/dev/null || continue
    gln=$(jq -r '.globalLocationNumber // empty' /tmp/org_prov.json 2>/dev/null)
    [[ -n "$gln" ]] || { ylw "  skip $(basename "$f" .bru) (no GLN / templated)"; continue; }
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] org $gln ($(basename "$f" .bru))"; continue; fi
    code=$(curl -sk -o /tmp/orgr_prov.json -w '%{http_code}' -X POST "$DL_URL/organizations" \
      -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
      --data-binary @/tmp/org_prov.json)
    case "$code" in
      20[0-2]) grn "  org $gln -> $code" ;;
      409) ylw "  org $gln -> 409 (exists)" ;;
      *) red "  org $gln -> $code $(jq -rc '.detail // empty' /tmp/orgr_prov.json 2>/dev/null)" ;;
    esac
  done
}

# ------------------------------------------------------------------ epcis traceability link
provision_epcis() { # gtin desc
  local gtin="$1" desc="$2"
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] epcis link $gtin"; return 0; fi
  local href="$API_URL/events?MATCH_anyEPC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]+'*'))" "$DL_URL/01/$gtin")"
  local body; body=$(python3 -c "
import json,sys
print(json.dumps([{'action':'add','linkset':[{
 'anchor': sys.argv[1], 'itemDescription': sys.argv[2],
 'epcisRepository':[{'href': sys.argv[3],'title':'EPCIS event history','type':'application/ld+json',
           'hreflang':['en'],'context':['epcis'],'public':True}]}]}]))" \
    "$DL_URL/01/$gtin" "$desc" "$href")
  local code; code=$(curl -sk -o /dev/null -w '%{http_code}' -X PATCH "$DL_URL/01/$gtin" \
    -H "$(auth)" -H 'Content-Type: application/json' -d "$body")
  case "$code" in 20[0-2]) grn "  epcis $gtin -> $code" ;; *) red "  epcis $gtin -> $code" ;; esac
}

# ------------------------------------------------------------------ EPCIS events (optional)
ext_header_for() { # repo-relative epcis file path -> GS1-Extensions header value
  # Rule 3 of the EPCIS integration guide: ALWAYS declare the extension header —
  # it activates the regulation's validation/query behaviour in the repository.
  local base="https://ref.openepcis.io/extensions" mod=""
  case "$1" in
    */eu/battery/*)     mod="eubat=$base/eu/battery/" ;;
    */eu/textile/*)     mod="eutex=$base/eu/textile/" ;;
    */eu/electronics/*) mod="euelec=$base/eu/electronics/" ;;
    */eu/detergent/*)   mod="eudet=$base/eu/detergent/" ;;
    */eu/eudr/*)        mod="eudr=$base/eu/eudr/" ;;
    */eu/ppwr/*)        mod="euppwr=$base/eu/ppwr/" ;;
    */eu/iron-steel/*)  mod="eusteel=$base/eu/iron-steel/" ;;
    */eu/cpr/*)         mod="eucpr=$base/eu/cpr/" ;;
    */us/fsma204/*)     mod="usfsma=$base/us/fsma204/" ;;
  esac
  echo "oec=$base/common/core/${mod:+,$mod}"
}

provision_events() {
  cyan "▸ EPCIS events -> $API_URL/capture"
  local f code ext
  while IFS= read -r f; do
    ext=$(ext_header_for "$f")
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] event $(basename "$f")  [$ext]"; continue; fi
    code=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "$API_URL/capture" \
      -H "$(auth)" -H 'Content-Type: application/ld+json' \
      -H "GS1-Extensions: $ext" --data-binary @"$f")
    case "$code" in 20[0-2]) grn "  $(basename "$f") -> $code" ;; *) red "  $(basename "$f") -> $code" ;; esac
  done < <(find "$REPO_ROOT/extensions"/*/*/epcis -name '*.jsonld' 2>/dev/null | sort)
}

# ------------------------------------------------------------------ verify
verify() {
  cyan "▸ Verify (resolver-side)"
  local row gtin ok=0 total=0 md dpp img
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin _ _ _ <<<"$row"; total=$((total+1))
    md=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:masterData" -H "$(auth)")
    dpp=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:dpp" -H "$(auth)")
    img=$(curl -sk "$DL_URL/01/$gtin?linkType=all" -H "$(auth)" | grep -oiE "$(echo "$FILES_URL"|sed 's#https\?://##')[^\"]*" | wc -l | tr -d ' ')
    if [[ "$md" == 302 && "$dpp" == 302 ]]; then grn "  $gtin  md=$md dpp=$dpp img=$img"; ok=$((ok+1));
    else red "  $gtin  md=$md dpp=$dpp img=$img"; fi
  done
  echo "  $ok/$total products resolve (masterData + dpp)."
}

# ------------------------------------------------------------------ run
cyan "=== provision-demo ($ENV) phases: $PHASES ==="
if [[ "$DRY" -eq 1 ]]; then ylw "dry-run: skipping token"; TOKEN=dry-run; else fetch_token; fi
if has products; then
  cyan "▸ Products (+ embedded images)"
  for row in "${PRODUCTS[@]}"; do IFS='|' read -r g f s d <<<"$row"; provision_product "$g" "$f" "$s" "$d"; done
  cyan "▸ Hero batch/item granularities"
  provision_hero_sublevels
fi
has orgs   && provision_orgs
if has epcis; then
  cyan "▸ EPCIS traceability links"
  for row in "${PRODUCTS[@]}"; do IFS='|' read -r g f s d <<<"$row"; provision_epcis "$g" "$d"; done
fi
has events && provision_events
has verify && verify
grn "✓ provision-demo complete ($ENV)"
