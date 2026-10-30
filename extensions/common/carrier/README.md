# OpenEPCIS Data Carrier Authentication Extension

**Namespace:** `https://ref.openepcis.org/extensions/common/carrier/`
**Prefix:** `carrier`
**Status:** Preview

Terms for binding a physical data carrier to a serialised GS1 identifier through EPCIS events,
publishing the carrier's authentication keys to authorised parties, and recording each
authenticated scan. Today: NTAG 424 DNA Secure Unique NFC (SUN, NXP AN12196). Reserved: RAIN RFID
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

## Event lifecycle

| Step | Event | Carries |
|---|---|---|
| reserving | ObjectEvent ADD, `bizStep reserving` (brand owner) | `carrier:keyRef`, `carrier:authProfile`, sealed `carrier:sdmMetaReadKey`, `carrier:sdmFileReadKey` |
| encoding | TransactionEvent, `bizStep encoding` (labeller) | `carrier:uid`, `carrier:carrierType` |
| commissioning | ObjectEvent ADD, `bizStep commissioning` (manufacturer) | nothing carrier-specific |
| inspecting | ObjectEvent OBSERVE, `bizStep inspecting` (verifier) | `carrier:readCounter`, `carrier:authStatus`; disposition `conformant` or `non_conformant` |

A verifier takes the youngest event carrying `carrier:sdmFileReadKey` and the youngest carrying
`carrier:uid`, whatever their bizStep. Re-keying is a new reserving-style event.

Keys are diversified per identifier (AN10922: `CMAC(master, 0x01 || usage || SHA-256(identifier)[0..30))`),
so a brand owner can reserve serials with keys before any tag exists; the chip UID is bound at
encoding and checked at every scan.

## Sealed key fields

```
enc:a256gcm:<kid>:<base64url(nonce || ciphertext || tag)>
```

AES-256-GCM under the wrapping key that `carrier:keyRef` names; the canonical identifier
(`https://id.gs1.org/01/<gtin14>/21/<serial>`) is the associated data, so a ciphertext copied onto
another serial's event does not decrypt. Document-level security decides who sees the event; the
wrapping key decides who can use it.

## Scan verdicts (`carrier:authStatus`)

`verified`, `unknown_carrier`, `picc_invalid`, `mac_invalid`, `uid_mismatch`, `replay`.
A resolver maps the verdict onto GS1 Digital Link link contexts (`auth:verified`, `auth:replay`,
...) and the instance's last state onto `state:<disposition>`, so a linkset can send a verified
owner to the owner experience, a replayed URL to a clone warning, and a recalled item to the recall
page, all through standard link attributes.

## Examples

- [`epcis/reserving.jsonld`](./epcis/reserving.jsonld), [`epcis/encoding.jsonld`](./epcis/encoding.jsonld),
  [`epcis/inspecting.jsonld`](./epcis/inspecting.jsonld)

## Implementation

`openepcis-carrier-auth` (Java core, Quarkus extension, verifier service) and the provisioning CLI in
the `cli` module of `openepcis-carrier-auth`.
