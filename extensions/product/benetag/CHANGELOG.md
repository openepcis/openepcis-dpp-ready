# Changelog: product/benetag

## [Unreleased]

- Renamed to BeneTag and moved from `common/carrier` to `product/benetag`. New namespace
  `https://ref.openepcis.org/extensions/product/benetag/`, prefix `benetag`. The old namespace
  `https://ref.openepcis.org/extensions/common/carrier/` is removed without an alias; tags written
  against it are re-encoded.

## [0.10.0] - 2026-11-07

- Any GS1 key can be bound, not only an SGTIN: LGTIN and GTIN (01), ITIP (8006), SSCC (00), GLN
  with or without extension (414, 254), party GLN (417), GRAI (8003), GIAI (8004), GDTI (253),
  GINC (401), GSIN (402), GCN (255), CPID (8010, 8011), GMN (8013). GSRN (8017, 8018) is excluded.
  The identifier is the canonical Digital Link of the key.
- Instances and GLNs stand in `epcList`, classes in `quantityList` as `epcClass`. Instances bind one
  carrier (the youngest encoding), classes and places every encoded carrier.
- `benetag:diversification` value `identifier` replaces `sgtin`; `benetag:urlTemplate` writes the
  identifier's canonical path as `{id}`.
- Examples: GIAI set `epcis/reserving-giai.jsonld`, `epcis/encoding-giai.jsonld`,
  `epcis/inspecting-giai.jsonld`; the SGTIN reserving example uses `identifier` and `{id}`.

## 0.9.9 (2026-10-23)

- New extension: data carrier authentication. NTAG 424 DNA Secure Unique NFC (AN12196) key
  records in reserving events (`benetag:keyRef`, `benetag:authProfile`, sealed
  `benetag:sdmMetaReadKey` / `benetag:sdmFileReadKey`), chip binding in encoding events
  (`benetag:uid`, `benetag:carrierType`), scan verdicts in inspecting events
  (`benetag:readCounter`, `benetag:authStatus`).
- Enumerations `benetag:AuthStatus`, `benetag:AuthScheme`, `benetag:MacInput`; classes
  `benetag:AuthProfile`, `benetag:Verification`.
- Access tiers: key fields AuthorizedOnly (locked), binding and profile Restricted, verdict Public.
