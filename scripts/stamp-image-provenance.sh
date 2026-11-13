#!/usr/bin/env bash
#
# stamp-image-provenance.sh: write where a generated product image comes from
# into the file itself, so the statement travels with every copy.
#
#   1. XMP (exiftool): IPTC DigitalSourceType trainedAlgorithmicMedia, IPTC
#      AISystemUsed, the licence (xmpRights:WebStatement, cc:license), credit
#      line and creator. Draw Things' own XMP (prompt, seed, model) stays.
#   2. C2PA (c2patool): a signed manifest with a c2pa.created action of digital
#      source type trainedAlgorithmicMedia and a schema.org CreativeWork naming
#      the author and the licence. c2patool signs with its built-in test
#      certificate unless C2PA_SIGN_CONFIG names a signing config, so verifiers
#      report the signer as untrusted; the content binding is still checked.
#
# The model is read from the Draw Things metadata in the file. Only models
# whose licence lets us publish the output under CC0 are accepted: FLUX.2
# [klein] 4B (Apache 2.0). FLUX.2 [dev] output is refused, its licence covers
# non-commercial generation only and forbids using output to train competing
# models, which CC0 cannot carry.
#
# A file that already carries a C2PA manifest is skipped: any later byte change
# would break its hash binding.
#
# Usage: scripts/stamp-image-provenance.sh scripts/images/*.png
# Needs: exiftool, c2patool, jq
set -euo pipefail

LICENSE_URL="https://creativecommons.org/publicdomain/zero/1.0/"
DIGITAL_SOURCE="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
CREATOR_NAME="benelog GmbH & Co. KG"
CREATOR_URL="https://benelog.com"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(jq -r .version "$REPO_ROOT/package.json")"

for tool in exiftool c2patool jq; do
  command -v "$tool" >/dev/null || { echo "missing $tool (brew install $tool)" >&2; exit 1; }
done
[[ $# -gt 0 ]] || { echo "usage: $0 <image> ..." >&2; exit 64; }

model_label() { # draw-things checkpoint name -> human label, empty if not accepted
  case "$1" in
    flux_2_klein_4b*) echo "FLUX.2 [klein] 4B" ;;
    *) echo "" ;;
  esac
}

fail=0
for f in "$@"; do
  if c2patool "$f" >/dev/null 2>&1; then
    echo "skip $f (already has a C2PA manifest)"
    continue
  fi
  ckpt=$(exiftool -s3 -XMP-exif:UserComment "$f" | jq -r '.model // empty' 2>/dev/null || true)
  label=$(model_label "$ckpt")
  if [[ -z "$label" ]]; then
    echo "REFUSED $f: model '${ckpt:-unknown}' is not cleared for CC0" >&2
    fail=1
    continue
  fi
  credit="AI-generated with $label (Black Forest Labs) in Draw Things, $CREATOR_NAME"

  exiftool -q -overwrite_original \
    -XMP-iptcExt:DigitalSourceType="$DIGITAL_SOURCE" \
    -XMP-iptcExt:AISystemUsed="$label" \
    -XMP-xmpRights:WebStatement="$LICENSE_URL" \
    -XMP-xmpRights:Marked=False \
    -XMP-cc:License="$LICENSE_URL" \
    -XMP-dc:Rights="CC0 1.0 Universal, $LICENSE_URL" \
    -XMP-dc:Creator="$CREATOR_NAME" \
    -XMP-photoshop:Credit="$credit" \
    "$f"

  manifest=$(mktemp)
  jq -n --arg v "$VERSION" --arg label "$label" --arg ckpt "$ckpt" --arg src "$DIGITAL_SOURCE" \
    --arg lic "$LICENSE_URL" --arg name "$CREATOR_NAME" --arg url "$CREATOR_URL" '{
      claim_generator_info: [{name: "OpenEPCIS DPP-Ready image provenance", version: $v}],
      assertions: [
        {label: "c2pa.actions.v2", data: {actions: [{
          action: "c2pa.created", digitalSourceType: $src,
          softwareAgent: {name: ($label + " in Draw Things"), version: $ckpt}}]}},
        {label: "stds.schema-org.CreativeWork", data: {
          "@context": "https://schema.org", "@type": "CreativeWork",
          author: [{"@type": "Organization", name: $name, url: $url}],
          license: $lic}}
      ]}' > "$manifest"
  signed=$(mktemp -t stamp).png
  c2patool "$f" -m "$manifest" ${C2PA_SIGN_CONFIG:+-c "$C2PA_SIGN_CONFIG"} -o "$signed" -f >/dev/null 2>&1
  mv "$signed" "$f"
  rm -f "$manifest"
  echo "stamped $f ($label)"
done
exit $fail
