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
# e2e-demo-users.sh's job). Every catalogue product is ALSO provisioned at the
# finer granularities the website's demo-catalog.ts links to (GRANULARITY
# below), because a Digital Link the site shows must resolve to its OWN record —
# a /21/ that only walks up to the GTIN shows model data under a serial URL.
#
# Granularity vocabulary (GS1): the GTIN is the model CLASS; a lot/batch
# (01+10, LGTIN) is a CLASS too — a set of like items sharing production facts;
# only a serial (01+21, SGTIN) is an INSTANCE, one physical item. Lots are
# maintained like master data, serials mostly accumulate facts from EPCIS.
# DELETE /products/{gtin} removes the WHOLE tree including lot/serial rows, so
# the granularity phase runs after every products phase; alone
# (--only=granularity) it is a pure upsert.
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
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/provision-demo.sh --env=epc-is
#   scripts/provision-demo.sh --env=demo --only=products      # one phase
#   scripts/provision-demo.sh --env=demo --only=orgs,epcis
#   scripts/provision-demo.sh --env=demo --gtin=09521890340331  # only this product
#   scripts/provision-demo.sh --env=demo --events             # also capture EPCIS events
#   scripts/provision-demo.sh --env=demo --dry-run
#
# Env (BRUNO_* accepted as fallbacks for the old muscle memory):
#   SEED_PW / BRUNO_PW                     password of SEED_USER in realm `openepcis`
#   SEED_CLIENT_SECRET / BRUNO_CLIENT_SECRET  secret of the backend-service client
#   SEED_USER            override the seed user (default per-env; demo=demo-admin)
#   REALM                override the realm (default per-env; epc-is=platform,
#                        everything else openepcis)
#   Optional overrides: DL_URL FILES_URL AUTH_URL API_URL SEED_CLIENT_ID
#
# Phases (default: products granularity docs orgs epcis verify): products,
# granularity (lot classes and serial instances under each product, see
# GRANULARITY), docs (generated PDFs + shared symbols), orgs, epcis, events,
# verify.
set -uo pipefail

# ------------------------------------------------------------------ args
ENV=demo; ONLY=""; DRY=0; WANT_EVENTS=0; GTIN_FILTER=""
for arg in "$@"; do
  case "$arg" in
    --env=*)   ENV="${arg#--env=}" ;;
    --only=*)  ONLY="${arg#--only=}" ;;
    --gtin=*)  GTIN_FILTER="${arg#--gtin=}" ;;
    --events)  WANT_EVENTS=1 ;;
    --dry-run) DRY=1 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

# ------------------------------------------------------------------ env
case "$ENV" in
  dev)   : "${DL_URL:=https://id.dev.epcis.cloud}";   : "${FILES_URL:=https://files.dev.epcis.cloud}";   : "${AUTH_URL:=https://keycloak.dev.epcis.cloud}"; : "${API_URL:=https://api.dev.epcis.cloud}";   : "${WEB_URL:=https://ddm.dev.epcis.cloud}";  DEF_USER=admin ;;
  demo)  : "${DL_URL:=https://id.demo.epcis.cloud}";  : "${FILES_URL:=https://files.demo.epcis.cloud}";  : "${AUTH_URL:=https://auth.demo.epcis.cloud}";    : "${API_URL:=https://api.demo.epcis.cloud}";  : "${WEB_URL:=https://demo.epcis.cloud}";     DEF_USER=demo-admin ;;
  local) : "${DL_URL:=https://id.epcis.local:8443}";  : "${FILES_URL:=https://files.epcis.local:8443}";  : "${AUTH_URL:=https://auth.epcis.local:8443}";    : "${API_URL:=https://api.epcis.local:8443}";  : "${WEB_URL:=https://epcis.local:8443}";     DEF_USER=admin ;;
  # epc.is ist der eigenstaendige Datenpfad: eigener OpenSearch-Cluster, eigener
  # Dateidienst, eigenes Keycloak -- und ein anderes REALM. Das ist der Punkt,
  # an dem ein blindes Kopieren des demo-Falls scheitert: DEF_REALM ist hier
  # "platform", denn auf auth.epc.is gibt es kein Realm namens openepcis
  # (/realms/openepcis antwortet dort 404). Ohne das holt der Lauf keinen Token
  # und meldet einen Anmeldefehler statt der Ursache.
  epc-is) : "${DL_URL:=https://id.epc.is}";           : "${FILES_URL:=https://files.epc.is}";           : "${AUTH_URL:=https://auth.epc.is}";             : "${API_URL:=https://api.epc.is}";           : "${WEB_URL:=https://epc.is}";               DEF_USER=demo-admin; DEF_REALM=platform ;;
  *) echo "Unknown --env: $ENV (expected dev|demo|local|epc-is)" >&2; exit 64 ;;
esac
# Je Umgebung vorbelegt statt fest "openepcis": siehe den epc-is-Fall oben.
REALM="${REALM:-${DEF_REALM:-openepcis}}"
SEED_CLIENT_ID="${SEED_CLIENT_ID:-backend-service}"
SEED_USER="${SEED_USER:-$DEF_USER}"                    # NOT $USERNAME — zsh reserves that
SEED_PW="${SEED_PW:-${BRUNO_PW:-}}"
SEED_CLIENT_SECRET="${SEED_CLIENT_SECRET:-${BRUNO_CLIENT_SECRET:-}}"
TOKEN_URL="$AUTH_URL/realms/$REALM/protocol/openid-connect/token"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGES_DIR="${IMAGES_DIR:-$REPO_ROOT/scripts/images}"
ORG_BRU_DIR="$REPO_ROOT/bruno/digital-link-resolver/04-organizations"

PHASES="${ONLY:-products granularity docs orgs epcis verify}"
PHASES="${PHASES//,/ }"
[ "$WANT_EVENTS" -eq 1 ] && PHASES="$PHASES events"

cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
grn(){ printf '\033[32m%s\033[0m\n' "$*"; }
ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }
has(){ [[ " $PHASES " == *" $1 "* ]]; }
# --gtin filter: when set, only the matching GTIN is provisioned/verified.
gtin_selected(){ [[ -z "$GTIN_FILTER" || "$1" == "$GTIN_FILTER" ]]; }

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
  "09521890340331|extensions/eu/textile/examples/organic-tee-product.jsonld|organic-tee|Organic Tee"
)

# Hero products carry batch + item granularities with their own overlay files
# (model⊂batch⊂item deep-merge) — the DDM provenance/assemble demo and the
# EPCIS traceability links (epcis phase) resolve those levels.
# gtin | lot | serial | batch overlay | item overlay
HEROES=(
  "09521234002000|LOT-2026-AMP01|STAX10-2026-000001|extensions/eu/battery/examples/amperia-staxwall-batch.jsonld|extensions/eu/battery/examples/amperia-staxwall-item.jsonld"
  "09521234003007|LOT-2026-FJ03|AUR-2026-000001|extensions/eu/textile/examples/fjordline-aurora-batch.jsonld|extensions/eu/textile/examples/fjordline-aurora-item.jsonld"
)

# Every finer-granularity record the website links to (openepcis-web
# apps/openepcis-components/app/data/demo-catalog.ts — keep the two in step).
# The heroes are listed again so ONE table drives the granularity phase.
#
# Three kinds of record hang off a model, all the COMPLETE model record plus the
# qualifier (address order per GS1 Digital Link URI syntax §4.9: 22, 10, 21):
#   variant  — a consumer product variant (01+22, GS1 AI 22): the model with
#              `gs1:consumerProductVariant`, id …/22/{cpv}. A class below the
#              model for items that need no GTIN of their own (GTIN Management
#              Standard) — a seasonal artwork, a promotional print. No EPC carries
#              it; the catalogue keeps it as its own node.
#   class    — a lot (01+10): model ⊕ batch overlay, `gs1:hasBatchLotNumber`,
#              id …/10/{lot}. A class, because it describes a set of like items.
#   instance — a serial (01+21): model ⊕ batch ⊕ item overlay,
#              `schema:serialNumber`, id …/21/{serial}. One physical item.
# A cpv on a lot or serial row writes that record THROUGH the variant
# (…/22/{cpv}/10/{lot}, …/22/{cpv}/21/{serial}): the node stays 01/g/10/l or
# 01/g/21/s, the variant becomes its attribute. The Digital Link the website
# encodes (…/21/{serial}) is unchanged by that.
# Overlays are optional — six catalogue seeds are serial-level passports already
# (their `id` carries the /21/ and they name the serial), so the instance IS the
# seed file and the MODEL is derived from it in provision_product. The bottle
# keeps its lot overlay file (written for LOT-01) and gets the lot id the
# website uses stamped over it.
#
# Empty cpv, lot or serial = that level is not provisioned for the product. A
# deposit-return bottle has no SGTIN (its returnable container is a GRAI); the
# contents are tracked by lot only. A row with a cpv and nothing else is the
# variant node itself.
# gtin | cpv | lot | serial | batch overlay | item overlay
GRANULARITY=(
  "09521000001428|||WJ-2024-00142||"
  "09521000002159|||TR-2024-08521||"
  "09521000004207|||SUIT-2026-00042||"
  "09521001001380|||BL-2026-04201||"
  "09521234003007||LOT-2026-FJ03|AUR-2026-000001|extensions/eu/textile/examples/fjordline-aurora-batch.jsonld|extensions/eu/textile/examples/fjordline-aurora-item.jsonld"
  "09521002005004|||BAT2024-001||"
  "09521003000442|||EB2026-00821||"
  "09521234002000||LOT-2026-AMP01|STAX10-2026-000001|extensions/eu/battery/examples/amperia-staxwall-batch.jsonld|extensions/eu/battery/examples/amperia-staxwall-item.jsonld"
  "09521004005019||BTL-LOT-2026-Q1-001||extensions/eu/ppwr/examples/beverage-bottle-lot-01.jsonld|"
  # FlexiSnack pouch: two artwork variants of the same 80 g pouch (same GTIN —
  # a GS1 CPV, not a new item), a production lot written through the promo
  # variant, the website's serial as a member of that variant, and one item of
  # the winter edition. Shows all four levels on one product.
  "09521005000808|PROMO26||||"
  "09521005000808|WINTER26||||"
  "09521005000808|PROMO26|LOT-2026-P01|||"
  "09521005000808|PROMO26||PCH-2026-001||"
  "09521005000808|WINTER26||PCH-2026-W01||"
  "09521006003013|||CTN-2026-001||"
)
# STRIP (editorial _comment* keys) and HOSTS (neutral example hosts -> this
# environment) are shared with the other seeding scripts, so all of them normalize
# a seed the same way. See scripts/lib/seed-hosts.sh for why the rewrite is needed.
source "$REPO_ROOT/scripts/lib/seed-hosts.sh"
seed_hosts_init "$DL_URL" "$FILES_URL"
STRIP="$SEED_STRIP"
HOSTS="$SEED_HOSTS"
hostargs=("${SEED_HOSTARGS[@]}")

# Field-level security (FLS) probe: the PUBLIC hero product additionally carries
# one top-level oec-core marker field per vocabulary field tier so
# verify-access-tiers.sh (CHECK_FIELD_TIERS=1) can assert per-persona field
# filtering on a single document:
#   carbonFootprintStudyUrl   Public
#   dataQualityAssessment     AuthorizedOnly
#   eoriNumber                Restricted
# BARE shortcut spellings (not oec:-prefixed): the resolver's typed write path
# drops unknown prefixed top-level keys but carries the shortcut-compacted core
# fields, and the policy map matches both spellings since the alias fix.
# Injected script-side (not in the shared garment seed file); idempotent because
# provision_product is delete-then-create. Obvious "42" probe values.
FLS_PROBE_GTIN=09521000001428

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
upload_image() { # gtin key src  -> echoes URL (handles images, PDFs, SVG, HTML)
  local gtin="$1" key="$2" src="$3" mime resp code
  case "$src" in
    *.png) mime=image/png ;; *.jpg|*.jpeg) mime=image/jpeg ;; *.webp) mime=image/webp ;;
    *.pdf) mime=application/pdf ;; *.svg) mime=image/svg+xml ;; *.html|*.htm) mime=text/html ;;
    *) red "  unknown file type: $src" >&2; return 1 ;;
  esac
  resp=$(curl -sk -X POST "$FILES_URL/files" -H "$(auth)" \
    -F "file=@$src;type=$mime" -F "key=products/$gtin/$key" -F "anonymous=true" -w '\n%{http_code}')
  code=${resp##*$'\n'}
  [[ "$code" == 20[01] ]] || { red "  image upload $gtin/$key -> $code" >&2; return 1; }
  echo "$FILES_URL/files/products/$gtin/$key"
}

# Media type of a local file, by extension. Same table upload_image uses to set
# the upload's Content-Type — the seed record has to declare it too, because the
# uploaded URL carries NO extension, so nothing downstream can infer it. Without
# this every generated image link resolves with no `type` and a consumer has to
# guess what it is fetching.
mime_of() { # src -> echoes media type
  case "$1" in
    *.png) echo image/png ;; *.jpg|*.jpeg) echo image/jpeg ;; *.webp) echo image/webp ;;
    *.pdf) echo application/pdf ;; *.svg) echo image/svg+xml ;; *.html|*.htm) echo text/html ;;
    *) echo "" ;;
  esac
}

collect_image_urls() { # gtin slug -> prints JSON array of {url, mime} objects
  local gtin="$1" slug="$2" src entries=() n=0 url mime
  for n in 1 2 3 4; do
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}-${n}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "${slug}-${n}" "$src") && {
        mime=$(mime_of "$src")
        entries+=("$(jq -nc --arg u "$url" --arg m "$mime" '{url:$u, mime:$m}')")
      }; break; }
    done
  done
  if [[ ${#entries[@]} -eq 0 ]]; then
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "$slug" "$src") && {
        mime=$(mime_of "$src")
        entries+=("$(jq -nc --arg u "$url" --arg m "$mime" '{url:$u, mime:$m}')")
      }; break; }
    done
  fi
  # bash 3.2 (macOS default) errors on "${entries[@]}" when the array is empty
  # under set -u, and an empty printf line would become [""] — guard both.
  if [[ ${#entries[@]} -eq 0 ]]; then echo '[]'; else printf '%s\n' "${entries[@]}" | jq -s .; fi
}

provision_product() { # gtin file slug desc
  local gtin="$1" rel="$2" slug="$3" desc="$4" file="$REPO_ROOT/$2"
  [[ -f "$file" ]] || { red "  missing seed file: $rel"; return 1; }
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] product $gtin  ($rel + images)"; return 0; fi
  local urls_json; urls_json=$(collect_image_urls "$gtin" "$slug")
  # Embed the image referencedFile array into the seed body so a single POST
  # yields a complete linkset (no lossy follow-up PUT).
  # Strip editorial _comment* keys (same STRIP as the passport seeder), then embed images.
  # Append image entries to any referencedFile the seed already declares (e.g.
  # certificate / manual documents), rather than replacing them.
  # Several catalogue seeds are ITEM-level passports (id …/01/{gtin}/21/{serial},
  # schema:serialNumber) that double as the model here. The model record must
  # not claim to be an exemplar: id back to /01/{gtin}, serial dropped, and a
  # declared granularity set to "model". The item level gets the untouched file
  # via the granularity phase.
  local body; body=$(jq "${hostargs[@]}" --argjson urls "$urls_json" --arg desc "$desc" --arg gtin "$gtin" '
    walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end) |
    walk(if type == "string" then (gsub("https://id\\.gs1\\.org"; $dl) | gsub("https://files\\.example\\.org"; $files)) else . end) |
    .id = ($dl + "/01/" + $gtin) |
    del(."schema:serialNumber") |
    if has("oec:granularityLevel") then ."oec:granularityLevel" = "model" else . end |
    if ($urls|length) > 0 then .referencedFile = ((.referencedFile // []) + ($urls | to_entries | map({
        "type":"gs1:ReferencedFileDetails","fileLanguageCode":"en",
        "contentDescription": ($desc + " (image " + ((.key+1)|tostring) + ")"),
        "referencedFileType": {"id":"gs1:ReferencedFileTypeCode-PRODUCT_IMAGE"},
        "id": .value.url, "referencedFileURL": .value.url }
        + (if (.value.mime // "") != "" then {"schema:encodingFormat": .value.mime} else {} end)
      ))) else . end' "$file")
  # FLS probe markers (see FLS_PROBE_GTIN above): three oec-core fields at three
  # field tiers, in bare shortcut spelling (survives the typed write path).
  if [[ "$gtin" == "$FLS_PROBE_GTIN" ]]; then
    # $WEB_URL, not a literal demo host: seeding dev with this hardcoded left dev's
    # records pointing at demo, which is how dev ended up serving a DPP whose own
    # carbonFootprintStudyUrl named the demo environment.
    body=$(jq --arg web "$WEB_URL" '
      ."carbonFootprintStudyUrl" = ($web + "/fls-probe/cf-study-42") |
      ."dataQualityAssessment"   = "FLS-PROBE-AO-42" |
      ."eoriNumber"              = "FLS-PROBE-RESTRICTED-42"' <<<"$body")
  fi
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

# ------------------------------------------------------------------ lot/serial granularities
# The seed file of a catalogue product, or "" when the GTIN is not in PRODUCTS.
model_file_of() { # gtin
  local prow model
  for prow in "${PRODUCTS[@]}"; do
    [[ "$prow" == "$1|"* ]] && { IFS='|' read -r _ model _ _ <<<"$prow"; echo "$model"; return 0; }
  done
  echo ""
}

# instance_body MODEL [OVERLAY…] — deep-merge the seed files (later wins) and
# normalize hosts. Callers stamp id and qualifier afterwards.
instance_body() {
  local files=() f
  for f in "$@"; do [[ -n "$f" ]] && files+=("$REPO_ROOT/$f"); done
  jq -s 'reduce .[1:][] as $o (.[0]; . * $o)' "${files[@]}" | jq "${hostargs[@]}" "$STRIP | $HOSTS"
}

# put_instance PATH DOC LABEL — PUT /products/PATH (an upsert; never a delete).
put_instance() {
  local path="$1" doc="$2" label="$3" code
  code=$(curl -sk -o /tmp/pd_inst.json -w '%{http_code}' -X PUT "$DL_URL/products/$path" \
    -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
    --data-binary "$doc")
  case "$code" in
    20[0-2]) grn "  $label $path -> $code" ;;
    *) red "  $label $path -> $code $(jq -rc '.detail // .message // empty' /tmp/pd_inst.json 2>/dev/null)" ;;
  esac
}

provision_granularity() {
  local row gtin cpv lot serial batch item model doc via
  for row in "${GRANULARITY[@]}"; do
    IFS='|' read -r gtin cpv lot serial batch item <<<"$row"
    gtin_selected "$gtin" || continue
    model=$(model_file_of "$gtin")
    [[ -n "$model" && -f "$REPO_ROOT/$model" ]] || { red "  granularity $gtin: no model seed in PRODUCTS"; continue; }
    [[ -z "$batch" || -f "$REPO_ROOT/$batch" ]] || { red "  granularity $gtin: missing batch overlay $batch"; continue; }
    [[ -z "$item"  || -f "$REPO_ROOT/$item"  ]] || { red "  granularity $gtin: missing item overlay $item"; continue; }
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] granularity $gtin cpv=${cpv:--} lot=${lot:--} serial=${serial:--}"; continue; fi
    # The address prefix below the model: a variant in front of lot and serial
    # (GS1 order 22, 10, 21). The node is still the lot class or the instance;
    # the CPV is its attribute, so it must not be in the body — the path says it.
    via=${cpv:+"22/$cpv/"}
    if [[ -n "$cpv" && -z "$lot" && -z "$serial" ]]; then
      # The variant node: the model with its CPV, id …/22/{cpv}. EN 18223 knows
      # no granularity between model and batch, so the level stays "model".
      doc=$(instance_body "$model" | jq --arg dl "$DL_URL" --arg gtin "$gtin" --arg cpv "$cpv" '
        .id = ($dl + "/01/" + $gtin + "/22/" + $cpv) |
        ."gs1:consumerProductVariant" = $cpv |
        del(."schema:serialNumber", ."gs1:hasBatchLotNumber", .hasBatchLotNumber) |
        if has("oec:granularityLevel") then ."oec:granularityLevel" = "model" else . end')
      put_instance "$gtin/22/$cpv" "$doc" "variant "
      continue
    fi
    if [[ -n "$lot" ]]; then
      # The lot record: model ⊕ batch overlay, id and lot number stamped to THIS
      # lot (the bottle's overlay was written for another lot id), no serial.
      doc=$(instance_body "$model" "$batch" | jq --arg dl "$DL_URL" --arg gtin "$gtin" --arg lot "$lot" '
        .id = ($dl + "/01/" + $gtin + "/10/" + $lot) |
        ."gs1:hasBatchLotNumber" = $lot |
        del(."schema:serialNumber", ."gs1:consumerProductVariant", .consumerProductVariant) |
        if has("oec:granularityLevel") then ."oec:granularityLevel" = "batch" else . end')
      put_instance "$gtin/${via}10/$lot" "$doc" "class   "
    fi
    if [[ -n "$serial" ]]; then
      # The item record: the COMPLETE model (⊕ batch ⊕ item overlays) plus the
      # serial, at /21/ — the Digital Link the website encodes. No lot number in
      # the body: the /21/ endpoint rejects one ("Lot not allowed in body for
      # this endpoint"); a lot-scoped serial would be the /10/{lot}/21/{serial}
      # path, which is not what the catalogue links to.
      doc=$(instance_body "$model" "$batch" "$item" | jq --arg dl "$DL_URL" --arg gtin "$gtin" --arg serial "$serial" '
        .id = ($dl + "/01/" + $gtin + "/21/" + $serial) |
        ."schema:serialNumber" = $serial |
        del(."gs1:hasBatchLotNumber", .hasBatchLotNumber, ."gs1:consumerProductVariant", .consumerProductVariant) |
        if has("oec:granularityLevel") then ."oec:granularityLevel" = "item" else . end')
      put_instance "$gtin/${via}21/$serial" "$doc" "instance"
    fi
  done
}

# ------------------------------------------------------------------ ESPR access-tier probes
# Two extra products exercising the OpenSearch DLS tiers end-to-end:
#   AuthorizedOnly -> hidden for anonymous, visible for any logged-in persona
#   Restricted     -> visible only for dpp-restricted / dpp-admin (composite)
# Derived from the garment seed so the body shape matches what the resolver
# accepts; accessLevel is the bare DTO field the indexing chokepoint stores.
TIER_PROBES=(
  "09521000002005|Restricted|Bergwacht Compliance Dossier Jacket"
  "09521000002104|AuthorizedOnly|Bergwacht Partner Catalogue Jacket"
)

provision_tier_probes() {
  cyan "▸ ESPR access-tier probe products"
  local row gtin tier name src="$REPO_ROOT/extensions/eu/textile/examples/garment-product.jsonld" body code
  for row in "${TIER_PROBES[@]}"; do
    IFS='|' read -r gtin tier name <<<"$row"
    gtin_selected "$gtin" || continue
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] tier probe $gtin ($tier)"; continue; fi
    body=$(jq --arg g "$gtin" --arg tier "$tier" --arg name "$name" --arg dl "$DL_URL" --arg files "$FILES_URL" '
      walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end) |
      walk(if type == "string" then (gsub("https://id\\.gs1\\.org"; $dl) | gsub("https://files\\.example\\.org"; $files)) else . end) |
      .id = ($dl + "/01/" + $g) |
      ."gs1:gtin" = $g |
      ."gs1:productName" = [{"@value": $name, "@language": "en"}] |
      del(."schema:serialNumber") |
      .accessLevel = $tier' "$src")
    curl -sk -o /dev/null -X DELETE "$DL_URL/products/$gtin" -H "$(auth)"
    # No isAnonymousAccessAllowed header: the tier field is authoritative and
    # the indexing chokepoint reconciles the boolean (non-Public -> false).
    code=$(curl -sk -o /tmp/pd_tier.json -w '%{http_code}' -X POST "$DL_URL/products" \
      -H "$(auth)" -H 'Content-Type: application/json' \
      --data-binary "$body")
    case "$code" in
      20[0-2]) grn "  tier probe $gtin ($tier) -> $code" ;;
      *) red "  tier probe $gtin ($tier) -> $code $(jq -rc '.detail // empty' /tmp/pd_tier.json 2>/dev/null)" ;;
    esac
  done
}

# ------------------------------------------------------------------ product documents (PDFs) + shared symbols
provision_docs() {
  cyan "▸ Product documents + shared symbols"
  local row gtin f name dir
  # shared regulatory/marker symbols, uploaded once under products/_common/symbols/
  if [[ -d "$REPO_ROOT/scripts/symbols" ]]; then
    for f in "$REPO_ROOT/scripts/symbols/"*; do
      [[ -f "$f" ]] || continue
      name=$(basename "$f")
      if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] symbol $name"; continue; fi
      if upload_image "_common" "symbols/$name" "$f" >/dev/null; then grn "  symbol $name"; else red "  symbol $name failed"; fi
    done
  fi
  # per-product generated PDFs under products/{gtin}/docs/
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin _ _ _ <<<"$row"
    gtin_selected "$gtin" || continue
    dir="$REPO_ROOT/scripts/docs/$gtin"
    [[ -d "$dir" ]] || continue
    for f in "$dir"/*; do
      [[ -f "$f" ]] || continue
      name=$(basename "$f")
      if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] doc $gtin/$name"; continue; fi
      if upload_image "$gtin" "docs/$name" "$f" >/dev/null; then grn "  doc $gtin/$name"; else red "  doc $gtin/$name failed"; fi
    done
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
  local f gln name code
  for f in "$ORG_BRU_DIR"/create-*.bru; do
    [[ -f "$f" ]] || continue
    extract_bru_body "$f" > /tmp/org_prov.json 2>/dev/null || continue
    gln=$(jq -r '.globalLocationNumber // empty' /tmp/org_prov.json 2>/dev/null)
    name=$(jq -r '(.organizationName.en // .organizationName // empty)' /tmp/org_prov.json 2>/dev/null)
    [[ -n "$gln" ]] || { ylw "  skip $(basename "$f" .bru) (no GLN / templated)"; continue; }
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] org $gln ($(basename "$f" .bru))"; provision_org_link "$gln" "$name"; continue; fi
    code=$(curl -sk -o /tmp/orgr_prov.json -w '%{http_code}' -X POST "$DL_URL/organizations?isAnonymousAccessAllowed=true" \
      -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
      --data-binary @/tmp/org_prov.json)
    # Upsert: an existing org (409) is PUT so the isAnonymousAccessAllowed=true flag is
    # reconciled to accessLevel=Public (a create-only POST would leave a stale non-Public
    # tier, keeping the org invisible to anonymous resolution).
    # Sent BOTH as query param and header: the Organization/Place APIs historically bound
    # the flag as @RestQuery (query), while products use @HeaderParam (header). The APIs are
    # being aligned to @HeaderParam; sending both makes this work against either resolver build.
    if [[ "$code" == 409 ]]; then
      code=$(curl -sk -o /tmp/orgr_prov.json -w '%{http_code}' -X PUT "$DL_URL/organizations/$gln?isAnonymousAccessAllowed=true" \
        -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
        --data-binary @/tmp/org_prov.json)
      case "$code" in 20[0-2]) grn "  org $gln -> 409->PUT $code (Public)" ;; *) red "  org $gln -> PUT $code $(jq -rc '.detail // empty' /tmp/orgr_prov.json 2>/dev/null)" ;; esac
    else
      case "$code" in
        20[0-2]) grn "  org $gln -> $code" ;;
        *) red "  org $gln -> $code $(jq -rc '.detail // empty' /tmp/orgr_prov.json 2>/dev/null)" ;;
      esac
    fi
    # Fix the resolver's self-referential organisationInfo placeholder -> DDM org page.
    provision_org_link "$gln" "$name"
  done
}

# ------------------------------------------------------------------ linkset links
# The resolver keeps ONE entry per link type; action:update upserts/replaces it
# (also killing any self-referential placeholder the resolver minted at create time,
# which otherwise 302-loops). Short link-type keys map to gs1: IRIs resolver-side.
VOC="https://ref.gs1.org/voc"
desc_for() { # gtin -> product description from PRODUCTS (itemDescription is required)
  local g="$1" prow
  for prow in "${PRODUCTS[@]}"; do [[ "$prow" == "$g|"* ]] && { IFS='|' read -r _ _ _ d <<<"$prow"; printf '%s' "$d"; return; }; done
  printf 'Product %s' "$g"
}
patch_link() { # anchorPath linkTypeName detail-json desc  (linkTypeName -> gs1: voc IRI key)
  local ap="$1" lt="$2" detail="$3" desc="$4"
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] $lt $ap"; return 0; fi
  # The gs1 linkset schema keys link relations by their full voc IRI (or a
  # lowercase-hyphen token); camelCase short names like certificationInfo are
  # rejected, so use the IRI form the resolver also stores/returns. itemDescription
  # is a required Link field.
  local body; body=$(python3 -c "
import json,sys
print(json.dumps([{'action':'update','linkset':[{
 'anchor': sys.argv[1], 'itemDescription': sys.argv[4], sys.argv[2]: [json.loads(sys.argv[3])]}]}]))" \
    "$DL_URL/$ap" "$VOC/$lt" "$detail" "$desc")
  local resp code rbody
  resp=$(curl -sk -w '\n%{http_code}' -X PATCH "$DL_URL/$ap" \
    -H "$(auth)" -H 'Content-Type: application/json' -d "$body")
  code=$(printf '%s' "$resp" | tail -n1); rbody=$(printf '%s' "$resp" | sed '$d')
  case "$code" in 20[0-2]) grn "  $lt $ap -> $code" ;; *) red "  $lt $ap -> $code ${rbody:0:200}" ;; esac
}

# traceability -> the human HTML product page on the DDM/demo site (which surfaces the
# serialized/batch instances + EPCIS event view). Replaces any self-referential loop.
#
# Applied per GRANULARITY PATH, not per GTIN: traceability is the journey of a
# specific batch or item, so it belongs on 01/<gtin>/10/<lot> and
# 01/<gtin>/21/<serial>. A bare 01/<gtin> is a product class with no single journey,
# and advertising it there is what made the GS1 conformance suite fail — the
# resolver cannot redirect a link type it has no distinct destination for.
provision_traceability() { # ap gtin
  local ap="$1" gtin="$2" detail
  detail=$(python3 -c "import json,sys;print(json.dumps({'href':sys.argv[1],'title':'Traceability information','type':'text/html','hreflang':['en'],'context':['traceability'],'public':True}))" "$WEB_URL/$ap")
  patch_link "$ap" "traceability" "$detail" "$(desc_for "$gtin")"
}

# NOTE: certificationInfo is intentionally NOT provisioned here — it is masterdata-driven.
# The resolver derives it from gs1:certification[].gs1:certificationURI (or a referencedFile
# typed CERTIFICATION) on POST /products, pointing at the real certificate authority page or
# the files-hosted Declaration of Conformity.

# epcisRepository -> the EPCIS event history. EPC= matches BOTH instance (epcList /21/)
# and class (quantityList.epcClass /10/ lot) fields in one wildcard query, against the
# canonical id.gs1.org EPCs the events carry.
provision_epcisrepo() { # gtin
  local gtin="$1" epc href detail
  epc=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote('https://id.gs1.org/01/'+sys.argv[1]+'*'))" "$gtin")
  href="$API_URL/events?EPC=$epc"
  detail=$(python3 -c "import json,sys;print(json.dumps({'href':sys.argv[1],'title':'EPCIS event history','type':'application/ld+json','hreflang':['en'],'context':['epcis'],'public':True}))" "$href")
  patch_link "01/$gtin" "epcisRepository" "$detail" "$(desc_for "$gtin")"
}

# organisationInfo -> the human HTML organisation page on the DDM/demo site. Orgs are
# anchored at /414/{gln}; replaces the resolver's self-referential placeholder loop.
provision_org_link() { # gln name
  local gln="$1" name="${2:-Organisation $1}" detail
  detail=$(python3 -c "import json,sys;print(json.dumps({'href':sys.argv[1],'title':'Organisation information','type':'text/html','hreflang':['en'],'context':['organisationInfo'],'public':True}))" "$WEB_URL/414/$gln")
  patch_link "414/$gln" "organisationInfo" "$detail" "$name"
}

# locationInfo -> the human HTML place page on the DDM/demo site (mirror of org).
provision_place_link() { # gln name
  local gln="$1" name="${2:-Location $1}" detail
  detail=$(python3 -c "import json,sys;print(json.dumps({'href':sys.argv[1],'title':'Location information','type':'text/html','hreflang':['en'],'context':['locationInfo'],'public':True}))" "$WEB_URL/414/$gln")
  patch_link "414/$gln" "locationInfo" "$detail" "$name"
}

# ------------------------------------------------------------------ places
# A demo Place, anonymously resolvable (Public tier) exactly like products/orgs. The
# isAnonymousAccessAllowed=true header reconciles to accessLevel=Public at the resolver's
# indexing chokepoint; upsert (PUT on 409) so an existing place is re-stamped Public.
PLACE_NAME="EcoWear Manufacturing Plant, Stuttgart"
provision_places() {
  cyan "▸ Places"
  local gln body code
  # 12-digit base distinct from the seeded org GLNs; append the GS1 mod-10 check digit.
  gln=$(python3 -c "b='952100000090';s=sum(int(d)*(3 if i%2==0 else 1) for i,d in enumerate(reversed(b)));print(b+str((10-s%10)%10))")
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] place $gln"; provision_place_link "$gln" "$PLACE_NAME"; return 0; fi
  body=$(python3 -c "import json,sys;g=sys.argv[1];print(json.dumps({'glnType':'FIXED_PHYSICAL_LOCATION','globalLocationNumber':g,'locationGLN':g,'digitalLocationName':{'en':sys.argv[2]}}))" "$gln" "$PLACE_NAME")
  # Flag sent as both query param and header (see provision_orgs note): org/place APIs
  # bound it as @RestQuery historically, products as @HeaderParam.
  code=$(curl -sk -o /tmp/pl_prov.json -w '%{http_code}' -X POST "$DL_URL/places?isAnonymousAccessAllowed=true" \
    -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' --data-binary "$body")
  if [[ "$code" == 409 ]]; then
    code=$(curl -sk -o /tmp/pl_prov.json -w '%{http_code}' -X PUT "$DL_URL/places/$gln?isAnonymousAccessAllowed=true" \
      -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' --data-binary "$body")
    case "$code" in 20[0-2]) grn "  place $gln -> 409->PUT $code (Public)" ;; *) red "  place $gln -> PUT $code $(jq -rc '.detail // empty' /tmp/pl_prov.json 2>/dev/null)" ;; esac
  else
    case "$code" in 20[0-2]) grn "  place $gln -> $code (Public)" ;; *) red "  place $gln -> $code $(jq -rc '.detail // empty' /tmp/pl_prov.json 2>/dev/null)" ;; esac
  fi
  provision_place_link "$gln" "$PLACE_NAME"
}

# ------------------------------------------------------------------ EPCIS events (optional)
ext_header_for() { # repo-relative epcis file path -> GS1-Extensions header value
  # Rule 3 of the EPCIS integration guide: ALWAYS declare the extension header —
  # it activates the regulation's validation/query behaviour in the repository.
  local base="https://ref.openepcis.org/extensions" mod=""
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
    IFS='|' read -r gtin _ _ _ <<<"$row"; gtin_selected "$gtin" || continue; total=$((total+1))
    md=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:masterData" -H "$(auth)")
    dpp=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:dpp" -H "$(auth)")
    img=$(curl -sk "$DL_URL/01/$gtin?linkType=all" -H "$(auth)" | grep -oiE "$(echo "$FILES_URL"|sed 's#https\?://##')[^\"]*" | wc -l | tr -d ' ')
    # The conformant resolver serves master-data INLINE (200) for a self-anchored
    # linkType=gs1:masterData request rather than 302-redirecting to itself
    # (avoids a self-referential redirect); a 302 is also acceptable when the
    # master-data href points elsewhere. dpp always 302s to the DPP API.
    if [[ ( "$md" == 200 || "$md" == 302 ) && "$dpp" == 302 ]]; then grn "  $gtin  md=$md dpp=$dpp img=$img"; ok=$((ok+1));
    else red "  $gtin  md=$md dpp=$dpp img=$img"; fi
  done
  echo "  $ok/$total products resolve (masterData + dpp)."

  # Instances: the linkset served for a /10/ or /21/ Digital Link must be
  # anchored at THAT path. A walk-up to the GTIN anchor answers 200 as well,
  # which is exactly the state this phase exists to rule out.
  cyan "▸ Verify (variant/class/instance anchors)"
  # An address through the variant (…/22/{cpv}/10/{lot}) is an entry path to the
  # lot node; the GS1-conformant resolver still anchors its first context at the
  # address that was asked for, so the check is the same for every row.
  local cpv lot serial p anchor via iok=0 itotal=0
  for row in "${GRANULARITY[@]}"; do
    IFS='|' read -r gtin cpv lot serial _ _ <<<"$row"; gtin_selected "$gtin" || continue
    via=${cpv:+"22/$cpv/"}
    local paths=()
    if [[ -n "$cpv" && -z "$lot" && -z "$serial" ]]; then paths=("01/$gtin/22/$cpv"); fi
    [[ -n "$lot" ]] && paths+=("01/$gtin/${via}10/$lot")
    [[ -n "$serial" ]] && paths+=("01/$gtin/${via}21/$serial")
    for p in ${paths[@]+"${paths[@]}"}; do
      itotal=$((itotal+1))
      anchor=$(curl -sk -H 'Accept: application/linkset+json' "$DL_URL/$p?linkType=all" | jq -r '.linkset[0].anchor // empty' 2>/dev/null)
      if [[ "$anchor" == "$DL_URL/$p" ]]; then grn "  $p  own anchor"; iok=$((iok+1));
      else red "  $p  anchor=${anchor:-none} (walk-up or missing)"; fi
    done
  done
  echo "  $iok/$itotal variant/class/instance anchors resolve at their own level."
}

# ------------------------------------------------------------------ run
cyan "=== provision-demo ($ENV) phases: $PHASES ==="
if [[ -n "$GTIN_FILTER" ]]; then
  # Warn (not fatal) if the filter matches nothing in the catalogue/heroes/probes.
  if ! printf '%s\n' "${PRODUCTS[@]}" "${HEROES[@]}" "${TIER_PROBES[@]}" | grep -q "^$GTIN_FILTER|"; then
    ylw "⚠ --gtin=$GTIN_FILTER matches no catalogue product; product/epcis/verify phases will be empty."
  fi
  ylw "▸ --gtin filter active: only $GTIN_FILTER (note: the 'orgs' phase is not GTIN-scoped)."
fi
if [[ "$DRY" -eq 1 ]]; then ylw "dry-run: skipping token"; TOKEN=dry-run; else fetch_token; fi
if has products; then
  cyan "▸ Products (+ embedded images)"
  for row in "${PRODUCTS[@]}"; do IFS='|' read -r g f s d <<<"$row"; gtin_selected "$g" && provision_product "$g" "$f" "$s" "$d"; done
  provision_tier_probes
fi
if has granularity; then
  cyan "▸ Granularity: variants + lot classes + serial instances (GRANULARITY)"
  provision_granularity
fi
has docs   && provision_docs
has orgs   && { provision_orgs; provision_places; }
if has epcis; then
  cyan "▸ Linkset: traceability + certificationInfo + epcisRepository"
  # traceability (HTML page) only where there IS a journey to trace: the hero
  # products' lot and item granularities. Not on the bare GTIN — see
  # provision_traceability. certificationInfo is NOT set here — it is
  # masterdata-driven: the resolver derives it from gs1:certification[].certificationURI
  # (or a referencedFile typed CERTIFICATION) on POST /products.
  for row in "${HEROES[@]}"; do IFS='|' read -r g lot ser _ _ <<<"$row"; gtin_selected "$g" || continue
    provision_traceability "01/$g/10/$lot" "$g"
    provision_traceability "01/$g/21/$ser" "$g"; done
  # epcisRepository only for the event-bearing hero products (item + lot via EPC=)
  for row in "${HEROES[@]}"; do IFS='|' read -r g _ _ _ _ <<<"$row"; gtin_selected "$g" && provision_epcisrepo "$g"; done
fi
has events && provision_events
has verify && verify
grn "✓ provision-demo complete ($ENV)"
