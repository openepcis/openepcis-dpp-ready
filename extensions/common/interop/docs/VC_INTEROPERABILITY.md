# Verifiable Credentials: what is standards-based, and what is proven

**Scope.** This page answers one question about the OpenEPCIS Verifiable
Credentials work: is it interoperable with the wider ecosystem, or is it fitted
to the two implementations that happen to have exchanged credentials so far?
The answer differs by layer, so the page is organised by layer and separates
**what a specification says** from **what has actually been demonstrated**.

It exists because that distinction is easy to lose. "Implements W3C VCDM 2.0"
and "a verifier nobody on this project wrote accepts our credential" are very
different claims, and only the second one is interoperability.

**Standards context.** Under CEN/CENELEC JTC 24 the relevant standard is
**prEN 18246** (data authentication, reliability and integrity, WG 5), which is
still in development. Nothing here claims conformance to prEN 18246: its text
is not published, so no honest conformance statement about it is possible yet.
What this page does claim is that the building blocks chosen are the ones the
DPP ecosystem is converging on, and it records the evidence for each. See
[`STANDARDS_ALIGNMENT.md`](./STANDARDS_ALIGNMENT.md) for the full JTC 24 picture
and [`CEN_JTC24_CONFORMANCE.md`](./CEN_JTC24_CONFORMANCE.md) for the six
published standards clause by clause.

---

## The short answer

**The data model and the cryptography are genuinely standards-based, and there
is real third-party evidence for them. The protocol layer, which is where
ecosystem interoperability is actually decided, is not built yet.**

The single strongest piece of evidence is not a test we wrote against ourselves.
It is that a **real GS1 licence credential**, fetched from GS1's live service and
verified against GS1's own published DID document, verifies in our engine, and
stops verifying when a byte is changed. GS1 is the root of trust for GS1 Digital
Link, and no part of their issuing stack is ours. That is interoperability in
the only sense that counts: two implementations that share nothing but a
specification agree on whether a signature holds.

Everything else sits on a spectrum between that and "we agree with ourselves",
and the table below says which is which.

---

## Evidence by layer

Three grades are used throughout:

| Grade | Meaning |
|---|---|
| **A** | Verified against an artifact published by a standards body, or produced by a party unrelated to this project |
| **B** | Verified against a fixture frozen from one live third-party service |
| **C** | Verified only against our own output (a round-trip) |

### Data model

| Element | Specification | Evidence |
|---|---|---|
| Credential envelope | W3C Verifiable Credentials Data Model 2.0 (Recommendation) | **C.** Our own round-trip. No W3C VC test-suite fixtures are used. |
| Context resolution | JSON-LD 1.1 | **A, indirectly.** We deliberately vendor the **published** W3C context documents rather than the copies bundled with our signing library, because that library still ships a pre-Recommendation `credentials/v2` carrying a `@vocab` the final Recommendation removed. Under that stale copy, terms that should fail loudly instead expand to relative IRIs. Choosing the published text is what makes our output survive a strict verifier. |
| Passport payload | EN 18223:2026 system interoperability | **A.** The credential subject is the same `oec:` graph the rest of this repository publishes, and the build gates it (`check:strict-expansion`, `check:contexts`, golden-fidelity round-trip). |

### Cryptography

| Element | Specification | Evidence |
|---|---|---|
| `ecdsa-rdfc-2019` Data Integrity proof | W3C Data Integrity ECDSA Cryptosuites | **C.** Sign, verify and tamper-detect against our own keys. No published proof value is decoded. |
| `Ed25519Signature2020` (verify only) | W3C Community Group report, superseded by Data Integrity | **A.** This is the GS1 licence path described above, plus a credential issued by an independent third-party DPP implementation. Both include tamper checks. |
| RDF Dataset Canonicalization | W3C RDFC-1.0 | **None.** Supplied by a third-party library and not covered by the RDFC-1.0 test suite here. The library carries the predecessor name URDNA2015; the equivalence is assumed rather than tested. This is the least-evidenced link in the chain, and it is load-bearing: canonicalization decides what actually gets signed. |
| `vc+jwt` | W3C VC-JOSE-COSE | **C.** No third-party JWT-form credential is parsed. |
| `dc+sd-jwt` selective disclosure | IETF SD-JWT VC | **A, narrowly.** The specification's own published disclosure and its expected digest are pinned. The `_sd` array, key binding and the presentation flow are round-trip only. |

### Identity and status

| Element | Specification | Evidence |
|---|---|---|
| `did:web` | W3C DID Core plus the did:web method | **B.** Two real third-party DID documents are parsed, including GS1's. The identifier-to-URL derivation rules are covered only by our own tests. |
| IETF Token Status List | IETF draft | **A.** Both of the draft's published vectors are decoded, bit order and compression included. |
| W3C Bitstring Status List | W3C Recommendation | **C.** Round-trip only, despite an in-code comment that claims otherwise. That comment is wrong and is tracked for correction. |

### Protocol

| Element | Specification | Evidence |
|---|---|---|
| Credential issuance | OpenID for Verifiable Credential Issuance (OID4VCI) | **Not implemented.** Issuance is currently plain REST. |
| Credential presentation | OpenID for Verifiable Presentations (OID4VP) | **Not implemented.** |

This row is the honest limit of the current position. A wallet from another
vendor cannot yet obtain or present one of our credentials through a standard
flow, because the standard flow is not there. Until it is, "interoperable"
describes the artifact, not the interaction.

### Trust chain

| Element | Source | Evidence |
|---|---|---|
| GS1 Digital Licence chain rules (topology, delegation, prefix containment) | The actively maintained open-source rules implementation | **B.** Verified against that project's published example chain. Those fixtures are its own test data, not GS1 conformance material, and the chain verifier performs no signature checking by design. |

---

## What is fitted to a particular party, and why

Three things in the implementation exist because of one specific counterpart
rather than because a specification requires them. Each is recorded here so the
reason survives the decision.

**An EPCIS event credential type borrowed from an existing community
vocabulary.** When we needed a credential type for a signed EPCIS event, an
independent implementation had already published one. Reusing their IRI rather
than minting our own follows this project's own layering rule, and it means
their tooling can read our events. The cost is that the type IRI is anchored in
a source-code repository rather than at a standards body. The credential itself
imports none of their context and expands against the W3C base context alone.

**Verify-side support for a superseded signature suite.** Both GS1's licence
credentials and the third-party passport credential use `Ed25519Signature2020`,
which the Data Integrity suites replaced. Refusing it would mean refusing GS1,
so we accept it on the verify path and issue only with the current suite.

**A disabled credential-status stage during signature verification.** A third
party's credentials carry a deprecated `RevocationList2020` status entry. The
signing library treats an unknown status scheme as a hard failure, which would
reject a cryptographically perfect credential. Status is therefore handled as a
separate pipeline stage rather than inside signature verification. This is a
deliberate trade, and it is worth being blunt about the consequence: a
specification-defined check is switched off at that point, and the
`RevocationList2020` scheme is not yet handled by the separate stage either.

None of these three reach into what we issue. A consumer verifying an OpenEPCIS
credential needs the W3C contexts, the GS1 contexts and ours, all of which are
published and self-hosted. Nothing from a private counterpart is required.

---

## Known gaps

Recorded so that nobody has to rediscover them, and so that no claim on this
page quietly outruns its evidence.

1. **No W3C VC test-suite fixtures.** The gap between "our implementation agrees
   with itself" and "our implementation agrees with the specification" is
   currently closed only by third-party artifacts, which cover the Ed25519 path
   and not the ECDSA one we actually issue with.
2. **RDFC-1.0 has no correctness coverage**, and it decides what is signed.
3. **The deployed verification endpoint is offline-strict.** It resolves only
   contexts vendored into the image, so it would today fail on a third-party
   credential whose context it has never seen, even though the library verifies
   that same credential in a test. The bidirectional claim holds at library
   level; it does not yet hold at service level.
4. **The reverse direction is undocumented in-repo.** That our credentials
   verify at a third-party verifier was established by live exchange during
   development. No response artifact was captured, so the repository holds no
   evidence of it. The signing-time gate that rejects relative references is the
   only in-repo trace of what that exchange taught us.
5. **A spelling mismatch in the GS1 chain rules.** The rules were ported from an
   implementation using the American spelling `...LicenseCredential`, while
   GS1's real licence credential and GS1's own context use the British
   `...LicenceCredential`. Value fields handle both spellings; the type name does
   not. The real GS1 credential is never fed to the chain verifier in any test,
   which is why this has not surfaced.
6. **Two in-code claims currently overstate the position** and are tracked for
   correction: a status-list comment citing published vectors it does not use,
   and a module README describing OID4VCI issuance that is not implemented.

---

## How to read this against prEN 18246

When prEN 18246 is published, the questions it is expected to settle are which
authentication mechanisms are admissible, how integrity is expressed and
checked, and how trust in an issuer is established. This project's position
going in is:

- the mechanism is W3C Verifiable Credentials with Data Integrity proofs,
- issuer identity is `did:web`, anchored at a domain the economic operator
  already controls and already uses for GS1 Digital Link resolution,
- the payload is the EN 18223 model this repository publishes, so a credential
  adds a signature to the passport rather than restating it in another shape,
- and trust in an issuer's right to make product claims is intended to come from
  the GS1 Digital Licence chain rather than from a bespoke registry.

Those are positions, not conformance. They are recorded here so that when the
standard lands, the delta is visible rather than reconstructed.
