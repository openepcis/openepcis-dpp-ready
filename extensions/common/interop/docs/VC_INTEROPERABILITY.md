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
**EN 18246:2026** (data authentication, reliability and integrity, WG 5),
published in September 2026 together with EN 18239:2026 (access rights). Its
normative core is Annex A: an *electronically signed data construct* with
issuer, subject, data and signature that verifies integrity, authenticity,
non-repudiation and — against a trusted list or governance framework — the
issuer's authority. W3C Verifiable Credentials are one of the informative
realisations the standard lists, not a requirement. What this page claims is
therefore not "conformance" in the abstract but, layer by layer, which of the
standard's capabilities the chosen building blocks deliver and with what
evidence. The clause-by-clause reading is in
[`CEN_JTC24_CONFORMANCE.md`](./CEN_JTC24_CONFORMANCE.md); the delta against the
published text closes this page.

---

## The short answer

**It runs in both directions, and both directions are demonstrated against
implementations nobody here wrote.**

Reading: a **real GS1 licence credential**, fetched from GS1's live service and
verified against GS1's own published DID document, verifies in our engine and
stops verifying when a byte is changed. GS1 is the root of trust for GS1 Digital
Link, and no part of their issuing stack is ours.

Writing: a credential our issuer produced is **accepted by a third-party
verifier** built on a different library stack, reporting
`ecdsa-rdfc-2019 | verified: true`.

The second half is new, and it did not come cheaply. Until it was measured, that
claim rested on a remembered exchange with no artifact behind it. Measured, the
verifier rejected our credentials with *invalid signature*, and it kept doing so
for credentials issued months apart, so it had never worked. The cause sat a
layer below the signature: **our RDF canonicalizer was not RDFC-1.0 conformant.**
Against the W3C `rdf-canon` suite it produced 6 wrong outputs on the 33 cases
that permit no bail-out, where the reference implementation produces none. The
canonical graph was right and the canonical BLANK NODE LABELS were wrong, so
with 92 blank nodes in a passport the signed byte sequence was one no conformant
implementation reconstructs. Replacing the canonicalizer fixed it, and nothing
else stood behind it. See
[Canonicalization](#canonicalization-a-defect-found-and-fixed) below.

Two things are worth keeping from that. The failure was invisible to every check
on both sides for as long as it existed, because each one compared our output
against our own output. And it explains the asymmetry that held until it was
fixed: reading a foreign credential kept working because those credentials carry
no blank nodes to mislabel, while our own passports are full of them.

The protocol layer, which is where ecosystem interoperability is finally
decided, is not built at all. Everything else sits on a spectrum between the GS1
result and "we agree with ourselves", and the table below says which is which.

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
| `ecdsa-rdfc-2019` Data Integrity proof | W3C Data Integrity ECDSA Cryptosuites | **A.** A credential we issued verifies at a third-party verifier on an unrelated library stack. No published proof value is decoded, so the vectors themselves are still untested, but the end-to-end result is a foreign implementation agreeing with ours. |
| `Ed25519Signature2020` (verify only) | W3C Community Group report, superseded by Data Integrity | **A.** This is the GS1 licence path described above, plus a credential issued by an independent third-party DPP implementation. Both include tamper checks. |
| RDF Dataset Canonicalization | W3C RDFC-1.0 | **A.** The W3C `rdf-canon` suite runs in the build against the canonicalizer actually wired in, and passes. It did not always: the library-supplied one produced 6 wrong outputs where the reference produces none, which is what made our credentials unverifiable elsewhere. See below. |
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
| Credential issuance, identity-near | OID4VCI via Keycloak 26.7 | **Live on dev.** Employee and org-membership credentials as `dc+sd-jwt`, pre-authorized-code flow, verified end to end (`scripts/verify-oid4vci-dev.sh`). |
| Credential issuance, data-heavy | OID4VCI on the platform issuer | **Partial.** `/.well-known/openid-credential-issuer` advertises every credential configuration with the spec's format identifiers and points `authorization_servers` at Keycloak; `POST /vc/oid4vci/credential` issues against a Keycloak access token. **Absent by decision:** `c_nonce`, holder key binding, credential offer with pre-authorized code, deferred issuance — a presented `proof` is REFUSED rather than ignored, so no wallet is told its key was bound when nothing bound it. |
| Credential presentation | OpenID for Verifiable Presentations (OID4VP) | **Not implemented.** The seam exists (`PresentationProtocol` in vc-core, sized for HAIP: verifier identity, nonce/session, encrypted response, KB-JWT verification) but nothing implements it. |

Read that middle row precisely. A wallet can now DISCOVER and PULL one of our
data-heavy credentials through a standard flow, authenticating where it already
authenticates for the identity credentials. The request fields carry the spec's
own snake_case names (`credential_configuration_id`, `subject_id`) and an
unknown configuration id is refused by name rather than defaulted — a wallet
that sends the standard shape is understood, and one that sends something else
is told which field was wrong. What it cannot do is be OFFERED one
(no credential offer) or bind it to its own key (no nonce, no proof
verification). And it still cannot PRESENT anything back to us.

So "interoperable" now describes the artifact and half the interaction. The
absent half is absent on purpose: holder binding and offers need a holder-side
wallet to be tested against, and a protocol guessed at without one is a
protocol no wallet actually speaks.

### Trust chain

| Element | Source | Evidence |
|---|---|---|
| GS1 Digital Licence chain rules (topology, delegation, prefix containment) | The actively maintained open-source rules implementation | **B.** Verified against that project's published example chain. Those fixtures are its own test data, not GS1 conformance material, and the chain verifier performs no signature checking by design. |

---

## Canonicalization: a defect found and fixed

Data Integrity signs a hash of the **canonicalized** RDF dataset, so two
implementations only agree on a signature if they agree on the canonical form
down to the byte. Ours did not, and that is what this section is about.

Measured on one of our own credentials, comparing our signing path against a
second implementation:

| | ours | other | result |
|---|---|---|---|
| proof configuration | 5 quads | 5 quads | byte-identical |
| credential document | 489 quads | 489 quads | 786 differing lines |
| structure with blank labels masked | | | identical |
| blank nodes | 92 | 92 | same count |
| lines identical as written | 71 of 489 | | |

The graph is the same. Only the canonical blank node labels differ, for example
`_:c14n15` where the other implementation writes `_:c14n76`. With 92 blank nodes
there is no prospect of accidental agreement, so a verifier that recanonicalizes
the document, which is what verification means, reconstructs a different byte
sequence and reports an invalid signature. The proof configuration being
byte-identical rules out the hash concatenation and the `hashData` construction:
the divergence is in document canonicalization alone.

**Which side is wrong: measured.** The W3C `rdf-canon` test suite was run against
both implementations with one harness and one normalization, and the answer is
not ambiguous. Counting only the 33 `rdfc10-eval` cases the manifest marks
complexity 0, where an implementation is not permitted to bail out:

| | wrong outputs |
|---|---|
| the JavaScript implementation | 0 of 33 |
| ours | 6 of 33 (`test020`, `test030`, `test053`, `test057`, `test063`, `test073`) |

A seventh case, `test060`, fails earlier: the N-Quads reader will not parse the
input. That is a reader defect and is counted separately rather than charged to
the canonicalizer. On the complexity > 0 cases both implementations abort on
some inputs, which RDFC-1.0 explicitly permits as protection against poison
graphs, so neither is a finding. `test075` fails on both because it requires
SHA-384 and neither run was configured for it.

**Our canonicalizer is therefore non-conformant, and the fix belongs in the
signing runtime.** Not in the contexts, not in the hash construction, not in the
key type.

`test020` is the finding in miniature. Four quads, two nodes pointing at a third,
which is the classic point where the N-degree treatment decides the labelling:

```
ours                        RDFC-1.0
#test #A _:c14n0            #test #A _:c14n2
#test #B _:c14n1            #test #B _:c14n0
_:c14n0 #next _:c14n2       _:c14n0 #next _:c14n1
_:c14n1 #next _:c14n2       _:c14n2 #next _:c14n1
```

Same graph, different canonical labels: exactly the production failure, small
enough to read in four lines.

**A conformant replacement exists, from the same vendor as the signing library.**
Run through the identical harness:

| | complexity 0 | complexity > 0 | SHA-384 case |
|---|---|---|---|
| current | 6 wrong (+1 reader) | aborts on 10 | fails |
| `titanium-rdfc` 2.0.0 | passes | passes all 31 | passes |

64 of 64, with none of the allowances the incumbent needed. The signing library
already has the seam for it: canonicalization sits behind a single-method
interface and the cryptosuite takes it as a constructor argument. The one
obstacle is that the ECDSA suite class is `final`, so the swap needs a small
sibling suite rather than a subclass, and the replacement uses the newer RDF API
while the signing library still sits on the older one, so the adapter bridges
the two.

**The swap was made, and the answer came back.** This page previously refused to
claim that replacing the canonicalizer would make third-party verification
succeed, on the grounds that only a fresh run could say so. The run was done: a
credential issued after the swap is accepted by the third-party verifier that
had rejected every earlier one. Nothing else stood behind the defect.

Everything issued before the swap carries a signature over the wrong bytes and
does not verify anywhere, including here. Those credentials are kept
deliberately: they are now the evidence for the defect rather than evidence of
anything working.

Two further defects were introduced by the replacement itself and are worth
recording, because neither was a conformance question and so the conformance
suite could not see either. Canonicalization initially resolved contexts over
HTTP instead of through the offline loader, which made a signature depend on
what a foreign host served at that moment and, on a cluster that cannot reach
that host, would have hung every issuance. And the labelling work had no bound,
though RDFC-1.0 permits aborting precisely because it is exponential on
adversarial input: 50 indistinguishable blank nodes canonicalize in 5 ms, 92
sharing 7 hubs had not finished after 60 seconds. The cost comes from nodes that
cannot be told apart, not from how many there are. Both are fixed and pinned by
tests.

**Why it stayed invisible.** Every check on both sides compared like with like.
The context parity gate compares two JavaScript canonicalizations of the same
document; the round-trip and fidelity gates in this repository compare
JavaScript against JavaScript; the signing engine's own tests sign and verify
with one implementation. The Java-against-JavaScript comparison, the one place
the disagreement lives, was the single link nobody had measured. A guard that
canonicalizes one golden fixture in both runtimes and compares the bytes would
have caught it before the first signature was ever issued.

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
2. **Canonicalization is now covered, and that closes the gap this list opened
   with.** The replacement is conformant and the W3C suite runs in the build
   against the implementation actually wired in, which is a stronger guard than
   comparing two of our own runtimes: it checks conformance rather than
   agreement. What it still does not cover is the JSON-LD-to-RDF step in front
   of it, since the suite's inputs are N-Quads; two defects introduced with the
   replacement lived exactly there and needed their own tests.
3. **The deployed verification endpoint is offline-strict.** It resolves only
   contexts vendored into the image, so it would today fail on a third-party
   credential whose context it has never seen, even though the library verifies
   that same credential in a test. The bidirectional claim holds at library
   level; it does not yet hold at service level.
4. **The reverse direction works now, and the story of how it got there is the
   most useful thing on this page.** It was first claimed on the strength of a
   remembered exchange with no captured artifact. Measured, the verifier
   rejected two of our credentials issued months apart, so it had never worked.
   The canonicalization defect accounted for it, replacing the canonicalizer
   fixed it, and a credential issued afterwards is accepted. Three states, and
   only the middle one was ever in doubt: a remembered result is not evidence,
   and a measured failure is not the same as a hopeless one.
5. **A spelling mismatch in the GS1 chain rules.** The rules were ported from an
   implementation using the American spelling `...LicenseCredential`, while
   GS1's real licence credential and GS1's own context use the British
   `...LicenceCredential`. Value fields handle both spellings; the type name does
   not. The real GS1 credential is never fed to the chain verifier in any test,
   which is why this has not surfaced.
6. **One in-code claim still overstates the position**: a status-list comment
   cites published vectors it does not use. (The module README's OID4VCI claim
   was corrected when the issuance surface landed — see the protocol table.)

---

## The delta against EN 18246:2026

The standard is published; this is where its text and this implementation
differ, so that the gap is read rather than reconstructed. Evidence grades as
above.

| EN 18246 asks for | Clause | Here | Grade / status |
|---|---|---|---|
| Integrity and authenticity independent of the transport channel | 4.1 | Data Integrity `ecdsa-rdfc-2019`, VC-JOSE, SD-JWT on every credential; plain resolver responses rely on TLS only | **A** for credentials; not applicable to raw responses |
| An ESDC with issuer, subject, data, signature | Annex A | VCDM 2.0 envelope, `did:web` issuer, `credentialSubject` = the EN 18223 passport graph | **A** (envelope accepted by a foreign verifier), **C** for the envelope's own test-suite coverage |
| Verify the issuer's authority against a trusted list or governance framework | A.3, fourth capability | `TrustRoot` SPI with a per-tenant trusted-issuer registry and a GS1 licence-chain root; the signed, published issuer list and the GS1 chain source are not built | **Partial** — the registry decides, nothing publishes it yet |
| Verification free of charge and without limitation for the verifier | 4.7 | `/vc/verify` is offline-strict: vendored contexts only, so a foreign credential with an unknown context fails at the service while the library verifies it | **Gap** — context loading with an allow-list is the fix |
| Every modification bound to the authenticated actor with non-repudiation; editor identifiable by a globally unique operator identifier | 4.7 | Passport changes form a Git version graph with checkpoints signed by the operator's `did:web` key; binding each amendment to the acting subject and operator identifier is in progress | **Partial** |
| Tamper-proof change log with integrity over time, verifiable without offline procedures | 4.7 | Exists for passport data (version graph + checkpoints); not for resolver master data, linksets, the trust registry or key events | **Gap** — planned as one hash-chained, checkpoint-signed log |
| Actors identified by a globally unique identifier, assurance-based authentication | 4.2 | Realm roles and tenant membership today; the EN 18219 operator identifier is being added to the token and to credential C1 | **In progress** |
| Public data: no authentication, no additional software, no profiling, no external components in the response | 4.3, 5.1.3, 5.1.5, 5.1.6 | Resolver JSON carries no external references; the public HTML page is not yet audited for external hosts, analytics, cookies or device access | **To be audited** |
| Anti-scraping while search engines may index | 5.1.8 | Rate limiting for authenticated callers; none on the anonymous path | **Gap** |
| Optional protection of identifier and data carrier | 4.5, 4.6, 5.3.1 | The passport is signed, the link is not; a signed Digital Link is a tracked product option | Profile choice, open |

Two things follow from the published text that the earlier, pre-publication
position did not foresee. First, the trusted list is normative (Annex A names
it as one of the four things an ESDC must make verifiable), so publishing the
platform's issuer list as a signed artefact is conformance work, not a
feature. Second, the standard's hardest requirements sit outside the
cryptography — actor binding, the access log, the sterile public page — and
none of them is settled by choosing Verifiable Credentials. The choice stands
for a different reason: every trust source this platform consumes already
speaks that format.
