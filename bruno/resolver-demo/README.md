# OpenEPCIS Resolver Demo (bruno)

A tiny, demo-first collection for the GS1 Digital Link resolver on
**demo.epcis.cloud**. Create a conformant entry, then resolve it every way.

## Setup (once)
1. Open this folder as a collection in Bruno.
2. Select the **demo** environment (top-right).
3. Edit the environment → fill the two **secret** vars (they never touch the file):
   | var | value | source |
   |---|---|---|
   | `clientSecret` | backend-service client secret | Vaultwarden ▸ **OpenEPCIS** ▸ *demo* ▸ `EPCIS · demo · backend-service client secret` |
   | `password` | demo-admin password | Vaultwarden ▸ **OpenEPCIS** ▸ *demo* ▸ `EPCIS · demo · persona · Admin` |

## Demo flow (run top to bottom)
| # | Request | Shows |
|---|---------|-------|
| 1 | Create product | register a GTIN (`{{gtin}}`) with master data — auto-fetches an OAuth2 token |
| 2 | Set conformant linkset | GS1 Digital Link link set: `defaultLink` + `pip` → the product page |
| 3 | Resolve — full linkset | one identifier, many typed links (the headline) |
| 4 | Resolve — pip | `?linkType=gs1:pip` → 302 to `demo.epcis.cloud/01/{gtin}` |
| 5 | Resolve — default | bare `/01/{gtin}` (a plain scan) → 302 to the product page |
| 6 | Resolve — master data | `?linkType=gs1:masterData` → JSON-LD (machine side) |
| 7 | Delete product | reset so you can run it again clean |

Reads (3–6) are **anonymous**. Writes (1, 2, 7) use the collection's OAuth2
password grant (scope `openid roles`).

## Product images (`product-images/` folder)
How to put an image on a product — upload it to the files service, then attach
it to the product's master data. Run after step 1 (Create product):

| # | Request | Shows |
|---|---------|-------|
| 1 | Upload product image | `POST {{files-url}}/files` multipart (`file` + `key` + `anonymous=true`) → stored at a public URL |
| 2 | Attach image to product | `PUT /products/{{gtin}}` master data with `gs1:referencedFile` (`PRODUCT_IMAGE`) |
| 3 | Resolve image | `GET {{files-url}}/files/products/{{gtin}}/{{image-key}}` anonymously → the image bytes |

The uploaded object is served at the deterministic URL
`{{files-url}}/files/products/{{gtin}}/{{image-key}}`, so step 2 references it
directly. Uploading needs the **files-writer** (or files-admin) realm role on
the OAuth2 account; the bundled `assets/sample-product-image.png` is a
placeholder — swap in a real product shot. This is the manual, per-product
version of `scripts/upload-product-images.sh` (which also C2PA-signs and
propagates images to batch/item Digital Links).

## Tips
- To *show* the raw `302` + `Location` on requests 4/5, turn **Follow Redirects
  off** (request Settings tab). Otherwise Bruno follows to the page (`200`).
- Change `gtin` in the env to demo a different identifier — keep a valid GTIN-14
  mod-10 check digit. Default `09521890340331` is the seeded **Organic Tee** demo product.
- Point a browser / phone camera at `https://id.demo.epcis.cloud/01/09521890340331`
  to show the real scan → product-page hop live.
