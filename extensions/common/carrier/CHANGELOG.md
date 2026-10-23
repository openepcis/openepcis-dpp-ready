# Changelog: common/carrier

## 0.9.9 (2026-10-23)

- New extension: data carrier authentication. NTAG 424 DNA Secure Unique NFC (AN12196) key
  records in reserving events (`carrier:keyRef`, `carrier:authProfile`, sealed
  `carrier:sdmMetaReadKey` / `carrier:sdmFileReadKey`), chip binding in encoding events
  (`carrier:uid`, `carrier:carrierType`), scan verdicts in inspecting events
  (`carrier:readCounter`, `carrier:authStatus`).
- Enumerations `carrier:AuthStatus`, `carrier:AuthScheme`, `carrier:MacInput`; classes
  `carrier:AuthProfile`, `carrier:Verification`.
- Access tiers: key fields AuthorizedOnly (locked), binding and profile Restricted, verdict Public.
