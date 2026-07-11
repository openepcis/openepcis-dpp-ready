# OpenEPCIS Digital Product Passport — Demo Script (demo.epcis.cloud)

A 10‑minute walkthrough of a live, standards‑based DPP stack: GS1 Digital Link →
resolver → EN 18223 Digital Product Passport, with Keycloak‑gated access tiers and
EPCIS 2.0 traceability. All links below are live and were verified working.

> Tip: the consumer journey (Part A) needs **no login** — open the links and talk.
> Parts B–C use the demo personas stored in Vaultwarden (**OpenEPCIS → demo**,
> items `EPCIS · demo · persona · …`). Never read passwords aloud; screen‑share the login.

---

## The stack (what each host is)
| Host | Role |
|---|---|
| `https://id.demo.epcis.cloud` | GS1 Digital Link **resolver** (the "scan the QR" entry point) |
| `https://dpp.demo.epcis.cloud` | **DPP API** (EN 18223 passports, tiered reads/writes) |
| `https://api.demo.epcis.cloud` | **EPCIS 2.0** repository (events, queries) |
| `https://auth.demo.epcis.cloud` | **Keycloak** (OIDC login, realm `openepcis`) |

## Demo catalogue (multi‑sector, all `01/<GTIN>`)
| Product | GTIN | Sector |
|---|---|---|
| Alpine Pro Winter Jacket | `09521000001428` | Textile / apparel |
| EcoStride Trail Running Shoe | `09521000002159` | Textile / footwear |
| Casa Lina Organic Cotton Bed Linen | `09521001001380` | Home textile |
| EcoCell Industrial Battery Module | `09521002005004` | EU Battery Reg. |
| VeloPower e‑bike battery pack | `09521003000442` | Battery (LMT) |
| Mountain Spring Mineral Water 500 mL | `09521004005019` | Packaging / food |

---

## Part A — Consumer journey (no login) “scan → passport”

**1. Scan the product.** The GS1 Digital Link is what a QR code on the product
encodes. Opening it resolves to the passport:
- Winter jacket → https://id.demo.epcis.cloud/01/09521000001428
  (302 → the public passport)

**2. Show the link registry** (what else this identifier offers — the `gs1:dpp`
link type is the passport):
- https://id.demo.epcis.cloud/01/09521000001428?linkType=all
- Jump straight to the passport link type:
  https://id.demo.epcis.cloud/01/09521000001428?linkType=gs1:dpp

**3. Read the passport (public tier, anonymous).** Canonical GS1 Digital Link id,
granularity, materials, care, repairability, recycled content, carbon footprint:
- https://dpp.demo.epcis.cloud/v1/dppsByProductId/https%3A%2F%2Fid.demo.epcis.cloud%2F01%2F09521000001428

**4. Same flow, any sector** — swap the GTIN to show it’s generic:
- Industrial battery module (EU Battery Reg.) → https://id.demo.epcis.cloud/01/09521002005004?linkType=gs1:dpp
- E‑bike battery pack → https://id.demo.epcis.cloud/01/09521003000442?linkType=gs1:dpp
- Running shoe → https://id.demo.epcis.cloud/01/09521000002159?linkType=gs1:dpp
- Bottled water → https://id.demo.epcis.cloud/01/09521004005019?linkType=gs1:dpp
- Organic cotton bed linen → https://id.demo.epcis.cloud/01/09521001001380?linkType=gs1:dpp

*Talking point:* one identifier, resolved via open GS1 standards, returns a
regulation‑aligned passport — no vendor lock‑in, works from any QR scanner.

---

## Part B — Access tiers (Keycloak‑gated)

Personas (passwords in Vaultwarden → OpenEPCIS → demo). Log in at any
`*.demo.epcis.cloud` OIDC prompt via `auth.demo.epcis.cloud`.

| Persona | Tier | Can do |
|---|---|---|
| `demo-consumer` / `demo-viewer` | Public | read public passport only |
| `demo-authority` | dpp‑restricted | + read Restricted‑tier fields |
| `demo-operator` | dpp‑writer | + create/update passports |
| `demo-admin` | dpp‑admin | writer + restricted |

**1. Public is open, writes are gated.** Anyone reads (Part A). An anonymous or
wrong‑tier write is refused — show the browser login kicking in:
- https://api.demo.epcis.cloud/queries → redirects to the Keycloak login form.

**2. Prove the tiers from a terminal** (fast, visual): run the matrix — it logs in
as each persona and shows 200 / 401 / 403 per role:
```bash
bash scripts/e2e-demo-scenarios.sh
```
Expected highlights: public read `200`, bad token `401`, no‑role write `403`,
**dpp‑writer write `200`**, EPCIS query (admin token) `200`, `gs1:dpp` link `200`.

*Talking point:* the same passport is public to a consumer but write‑protected to
everyone except the manufacturer’s operators — enforced centrally by OIDC roles.

---

## Part C — EPCIS 2.0 traceability (login)

The passport isn’t static — it’s backed by supply‑chain events.
- Open https://api.demo.epcis.cloud/queries → log in (demo‑operator or demo‑admin)
  → the EPCIS 2.0 query interface (named queries, event capture/query per GS1 CBV).

*Talking point:* passports and events share one identity + auth layer; the DPP is a
regulation‑shaped **view** over EPCIS traceability data.

---

## One‑slide summary (what this proves)
- **Open standards end‑to‑end**: GS1 Digital Link + Web Vocabulary (`gs1:dpp`),
  EN 18223 DPP, EPCIS 2.0 — no proprietary format.
- **One identity, tiered access**: public consumers read; operators write; all via
  Keycloak OIDC roles.
- **Multi‑regulation**: textile, battery, packaging passports from the same API.
- **Production‑shaped**: HA session store, stable OIDC sessions across redeploys.

## Reset / housekeeping (presenter)
- **(Re)provision the full catalogue** (11 products + images + organizations +
  EPCIS traceability links) — the one canonical, idempotent command:
  ```bash
  SEED_PW=… SEED_CLIENT_SECRET=… bash scripts/provision-demo.sh --env=demo
  ```
  Add `--events` to also capture the EPCIS event history, or `--only=products,epcis`
  for a subset. This does NOT touch persona passwords. (The older
  seed-dev-demo.sh / upload-product-images.sh / seed-organizations.sh /
  provision-demo-epcis-links.sh / refresh-dev-demo.sh are deprecated in favour
  of it.) Note: `SEED_*` env vars are used instead of `USERNAME`, which zsh
  reserves and silently overwrites.
- Re‑verify only: `bash scripts/verify-dpp-demo.sh`.
- Rotate persona passwords any time: `bash scripts/e2e-demo-users.sh` then
  `BW_SESSION=… bash scripts/vault-sync-demo-users.sh`.
- Known: a `demo-admin` (admins‑group) write returns 403 in the DPP API — use
  `demo-operator` for the write demo (dpp‑writer is the write tier).
