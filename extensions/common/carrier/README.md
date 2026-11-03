# OpenEPCIS Data Carrier Authentication Extension

**Namespace:** `https://ref.openepcis.org/extensions/common/carrier/`
**Prefix:** `carrier`
**Status:** Preview

Terms for binding a physical data carrier to a GS1 identifier (any GS1 key, see below) through
EPCIS events, publishing the carrier's authentication keys to authorised parties, and recording
each authenticated scan. Today: NTAG 424 DNA Secure Unique NFC (SUN, NXP AN12196). Reserved: RAIN RFID
(ISO/IEC 29167) and signed QR, through the same profile and status terms.

Declare it in EPCIS captures:

```
GS1-Extensions: carrier=https://ref.openepcis.org/extensions/common/carrier/
```

## Why

With SUN the truth sits at the verifier, not in the tag. Whoever holds the keys and controls
resolution decides what a tap means. Publishing the keys as sealed fields of EPCIS events lets
an authorised party pull them with an ordinary EPCIS query and verify on its own, and lets the
resolver answer three questions in one call: is the item physically genuine (SUN), may the
sender speak for the GTIN (licence credential chain), is the history plausible (EPCIS).

## Identifiers

A carrier can be bound to any GS1 key the Digital Link resolver resolves. The identifier is always
the canonical Digital Link `https://id.gs1.org/<ai>/<key>[/<qualifier>/<value>]`: key values in the
AI's format (a GTIN padded to 14 digits), every character outside the RFC 3986 unreserved set
percent-encoded in upper case, qualifiers in Digital Link order, only the qualifiers that make up
the identity (an SGTIN is GTIN + serial: lot and CPV are dropped; an LGTIN is GTIN + lot).

| Key | AI | Kind | In EPCIS events | Binding |
|---|---|---|---|---|
| SGTIN | 01 + 21 | instance | `epcList` | SINGLE |
| LGTIN | 01 + 10 | class | `quantityList[].epcClass` | MULTIPLE |
| GTIN | 01 | class | `quantityList[].epcClass` | MULTIPLE |
| ITIP | 8006 (+ 21 / + 10) | instance with serial, class without | `epcList` / `quantityList[].epcClass` | SINGLE / MULTIPLE |
| SSCC | 00 | instance | `epcList` | SINGLE |
| GLN with extension | 414 + 254 | instance (a sub-location) | `epcList` | SINGLE |
| GLN | 414 | place | `epcList` | MULTIPLE |
| Party GLN | 417 | party | `epcList` | MULTIPLE |
| GRAI | 8003 | instance with serial, asset type without | `epcList` / `quantityList[].epcClass` | SINGLE / MULTIPLE |
| GIAI | 8004 | instance | `epcList` | SINGLE |
| GDTI | 253 | instance with serial, document type without | `epcList` / `quantityList[].epcClass` | SINGLE / MULTIPLE |
| GINC | 401 | instance (a consignment) | `epcList` | SINGLE |
| GSIN | 402 | instance (a shipment) | `epcList` | SINGLE |
| GCN | 255 | instance with serial, coupon type without | `epcList` / `quantityList[].epcClass` | SINGLE / MULTIPLE |
| CPID | 8010 (+ 8011) | instance with serial, class without | `epcList` / `quantityList[].epcClass` | SINGLE / MULTIPLE |
| GMN | 8013 | class (a model) | `quantityList[].epcClass` | MULTIPLE |

GSRN (8017, 8018) is excluded by design: it identifies a person, and a carrier that proves
possession of a person is not what this extension is for.

**Placement.** What EPCIS treats as an EPC (every instance, and GLN / party GLN, which have EPC
schemes) stands in `epcList`; a class stands in `quantityList` as `epcClass`, with `epcList` empty.
That holds for every event of the lifecycle, the verifier's inspecting event included, and a
verifier looks the key record up with `MATCH_anyEPC` or `MATCH_anyEPCClass` accordingly.

**Binding.** An instance (SINGLE) has one carrier at a time: the youngest encoding event wins, and
re-labelling replaces the tag. A class or a place (MULTIPLE) binds every encoded carrier: many
labels of one lot, many tags at one site; each encoding event adds a chip UID, and a scan is
accepted from any of them.

**Diversification.** `carrier:diversification` `identifier`: the per-carrier keys derive from the
canonical identifier, so keys exist before a tag does; `uid`: from the chip UID (AN10922 classic).
With MULTIPLE binding every carrier of the class shares the keys of its identifier, and the chip
UID bound at encoding tells them apart.

**URL template.** `carrier:urlTemplate` writes the identifier's canonical path as `{id}`
(`https://id.epc.is/{id}?picc={picc}&cmac={cmac}` gives `https://id.epc.is/8004/40681941000001?...`).
For a GTIN-based key `{gtin}` and, with a serial, `{serial}` may spell the path out.

## Event lifecycle

| Step | Event | Carries |
|---|---|---|
| reserving | ObjectEvent ADD, `bizStep reserving` (owner of the key: brand owner, asset owner, ...) | `carrier:keyRef`, `carrier:authProfile`, sealed `carrier:sdmMetaReadKey`, `carrier:sdmFileReadKey` |
| encoding | TransactionEvent, `bizStep encoding` (labeller) | `carrier:uid`, `carrier:carrierType` |
| commissioning | ObjectEvent ADD, `bizStep commissioning` (manufacturer) | nothing carrier-specific |
| inspecting | ObjectEvent OBSERVE, `bizStep inspecting` (verifier) | `carrier:readCounter`, `carrier:authStatus`; disposition `conformant` or `non_conformant` |

A verifier takes the youngest event carrying `carrier:sdmFileReadKey` and, for an instance, the
youngest carrying `carrier:uid` (for a class or a place: every one), whatever their bizStep.
Re-keying is a new reserving-style event.

Keys are diversified per identifier (AN10922: `CMAC(master, 0x01 || usage || SHA-256(identifier)[0..30))`),
so an owner can reserve identifiers with keys before any tag exists; the chip UID is bound at
encoding and checked at every scan.

## Sealed key fields

```
enc:a256gcm:<kid>:<base64url(nonce || ciphertext || tag)>
```

AES-256-GCM under the wrapping key that `carrier:keyRef` names; the canonical identifier
(`https://id.gs1.org/01/<gtin14>/21/<serial>`, `https://id.gs1.org/8004/<giai>`, ...) is the
associated data, so a ciphertext copied onto another identifier's event does not decrypt.
Document-level security decides who sees the event; the wrapping key decides who can use it.

## Scan verdicts (`carrier:authStatus`)

`verified`, `unknown_carrier`, `picc_invalid`, `mac_invalid`, `uid_mismatch`, `replay`.
A resolver maps the verdict onto GS1 Digital Link link contexts (`auth:verified`, `auth:replay`,
...) and the instance's last state onto `state:<disposition>`, so a linkset can send a verified
owner to the owner experience, a replayed URL to a clone warning, and a recalled item to the recall
page, all through standard link attributes.

## Examples

- SGTIN `https://id.gs1.org/01/09521234000013/21/A1`: [`epcis/reserving.jsonld`](./epcis/reserving.jsonld),
  [`epcis/encoding.jsonld`](./epcis/encoding.jsonld), [`epcis/inspecting.jsonld`](./epcis/inspecting.jsonld),
  and the business steps resting on a tap, [`epcis/accepting.jsonld`](./epcis/accepting.jsonld) and
  [`epcis/repairing.jsonld`](./epcis/repairing.jsonld)
- GIAI `https://id.gs1.org/8004/40681941000001` (an individual asset, SINGLE binding):
  [`epcis/reserving-giai.jsonld`](./epcis/reserving-giai.jsonld),
  [`epcis/encoding-giai.jsonld`](./epcis/encoding-giai.jsonld),
  [`epcis/inspecting-giai.jsonld`](./epcis/inspecting-giai.jsonld)

A class carries its identifier in `quantityList` instead, e.g. for the lot
`https://id.gs1.org/01/09521234000013/10/LOT1`:

```json
"epcList": [],
"quantityList": [{ "epcClass": "https://id.gs1.org/01/09521234000013/10/LOT1" }]
```

## Implementation

`openepcis-carrier-auth` (Java core, Quarkus extension, verifier service) and the provisioning CLI in
the `cli` module of `openepcis-carrier-auth`.
