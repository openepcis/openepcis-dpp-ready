/**
 * The one name the GITB validator domain has.
 *
 * It is the path segment of every validator URL — `/shacl/<domain>/upload`,
 * `/shacl/soap/<domain>/validation?wsdl` — both in the local compose stack and
 * on the shared EU Interoperability Test Bed, where the European Commission
 * hosts the bundle from the public `validator-resources-openepcis` repository
 * under this name. Keeping the two identical is what lets a test suite built
 * against the local stack be re-pointed at the hosted validator by address
 * alone (VALIDATOR_ADDRESS), with no path rewriting.
 *
 * Distinct from the sixteen VALIDATION TYPE ids (`dpp.core`, `eu.battery`, …),
 * which are the published contract a conformance statement is recorded against.
 */
export const VALIDATOR_DOMAIN = "openepcis";

/** Local directory holding that domain's resources, per ISAITB convention. */
export const SHACL_RESOURCE_ROOT = "gitb/validator-resources/shacl";
export const JSON_RESOURCE_ROOT = "gitb/validator-resources/json";
