/**
 * Build JSON representations of ontologies from TTL source files.
 *
 * This script parses TTL ontology files and generates JSON files
 * suitable for use by web applications.
 *
 * Usage: npx tsx scripts/build-json.ts
 *
 * Output structure:
 *   extensions/common/core/json/dpp-core.json
 *   extensions/eu/battery/json/battery.json
 *   extensions/eu/eudr/json/eudr.json
 *   extensions/eu/textile/json/textile.json
 *   extensions/eu/electronics/json/electronics.json
 *   extensions/eu/detergent/json/detergent.json
 *   extensions/us/fsma204/json/fsma204.json
 */

import { Parser, Store, DataFactory, Quad } from "n3";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root of openepcis-dpp project
const PROJECT_ROOT = join(__dirname, "..");

const { namedNode } = DataFactory;

// RDF namespace URIs
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const DCTERMS = "http://purl.org/dc/terms/";
const DC11 = "http://purl.org/dc/elements/1.1/";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const GS1 = "https://ref.gs1.org/voc/";
const SCHEMA = "https://schema.org/";
const OEC = "https://ref.openepcis.io/extensions/common/core/";

// Namespace to prefix mapping for compact output
// Only convert datatype namespaces - keep vocabulary URIs (gs1, schema) as full URIs
// so they can be looked up by the vocabulary browser
const DATATYPE_NAMESPACE_TO_PREFIX: Record<string, string> = {
  [XSD]: "xsd:",
  [RDF]: "rdf:",
  [RDFS]: "rdfs:",
  [OWL]: "owl:",
};

/**
 * Convert a URI to prefixed form if it matches a known datatype namespace.
 * Returns the original URI if no match is found.
 * Note: Only converts datatypes (xsd, rdf, rdfs, owl), not vocabulary URIs
 * like gs1: or schema: which need to remain as full URIs for lookup.
 */
function toPrefixedForm(uri: string): string {
  for (const [namespace, prefix] of Object.entries(DATATYPE_NAMESPACE_TO_PREFIX)) {
    if (uri.startsWith(namespace)) {
      return prefix + uri.substring(namespace.length);
    }
  }
  return uri;
}

/**
 * Convert an array of URIs to prefixed forms.
 */
function toPrefixedForms(uris: string[]): string[] {
  return uris.map(toPrefixedForm);
}

interface TermData {
  id: string;
  localName: string;
  label: string;
  comment: string;
  domain?: string[];
  range?: string[];
  seeAlso?: string[];
  subClassOf?: string[];
  equivalentClass?: string[];
  equivalentProperty?: string[];
  exactMatch?: string[];
  closeMatch?: string[];
  broadMatch?: string[];
  narrowMatch?: string[];
  relatedMatch?: string[];
  /**
   * skos:broader / skos:narrower, the WITHIN-scheme hierarchy. The *Match relations above link
   * across concept schemes; these link two terms in the same namespace, which is what
   * check:mappings rule 9 requires there. Emitted because otherwise the relation exists in the
   * TTL and is invisible to everything downstream, the vocabulary browser and the AI corpus
   * included.
   */
  broader?: string[];
  narrower?: string[];
  source?: string;
  deprecated?: boolean;
  accessLevel?: string;
  accessLevelMandatedBy?: string;
  accessLevelRationale?: string;
  accessLevelSource?: string;
  accessLevelInherited?: boolean;
}

interface EnumValue {
  id: string;
  localName: string;
  label: string;
  comment: string;
}

interface EnumerationData {
  id: string;
  localName: string;
  label: string;
  comment: string;
  values: EnumValue[];
}

interface OntologyData {
  namespace: string;
  version: string;
  title: string;
  description: string;
  classes: TermData[];
  properties: TermData[];
  enumerations: EnumerationData[];
}

interface OntologyModule {
  name: string;
  dir: string;
  ttlFile: string;
  /** Primary namespace terms are minted under, and the ontology IRI unless
   *  `ontologyIri` overrides it. */
  namespace: string;
  /** Additional namespaces whose subjects also belong to this dataset. Used by
   *  served-fields, whose terms are GS1's own IRIs (identity stays upstream)
   *  plus a handful of local identifiers for resolver-specific field shapes. */
  extraNamespaces?: string[];
  /** Ontology IRI when it is not the term namespace — again served-fields,
   *  which is described at /masterdata/served-fields/ but whose terms are gs1:. */
  ontologyIri?: string;
  /** Publish the term namespace (not the ontologyIri) as the dataset's `namespace`.
   *  Needed when the two differ (eudpp: CORE node …/eudpp/ vs terms …/eudpp#) —
   *  the browser derives term-local names from this field, and the ontologyIri
   *  would send every runtime-derived link to the prefixed-CURIE fallback. */
  publishTermNamespace?: boolean;
}

// Ontology modules configuration
const ONTOLOGY_MODULES: OntologyModule[] = [
  {
    name: "dpp-core",
    dir: "extensions/common/core",
    ttlFile: "dpp-core.ttl",
    namespace: "https://ref.openepcis.io/extensions/common/core/",
  },
  // Served master-data fields. NOT an EPCIS extension and not a vocabulary of
  // its own: 135 of the 139 served fields are GS1 Web Vocabulary properties
  // under the identical local name, so identity stays with GS1 and the terms
  // are gs1: IRIs. Only 4 flattened/resolver-specific shapes carry a local id.
  {
    name: "served-fields",
    dir: "masterdata/served-fields",
    ttlFile: "served-fields.ttl",
    namespace: "https://ref.gs1.org/voc/",
    extraNamespaces: ["https://ref.openepcis.io/masterdata/served-fields/"],
    ontologyIri: "https://ref.openepcis.io/masterdata/served-fields/",
  },
  // OpenEPCIS-owned GS1 Digital Link link types (https://ref.openepcis.io/voc/).
  // Provisional by design: a term is minted only for a link relation GS1 has
  // not yet ratified, mirrors the GS1 link-type pattern, and records its
  // migration path. Directory mirrors the IRI path, like masterdata/served-fields.
  {
    name: "openepcis-linktypes",
    dir: "voc",
    ttlFile: "openepcis-linktypes.ttl",
    namespace: "https://ref.openepcis.io/voc/",
  },
  {
    name: "battery",
    dir: "extensions/eu/battery",
    ttlFile: "battery.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/battery/",
  },
  {
    name: "eudr",
    dir: "extensions/eu/eudr",
    ttlFile: "eudr.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/eudr/",
  },
  {
    name: "textile",
    dir: "extensions/eu/textile",
    ttlFile: "textile.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/textile/",
  },
  {
    name: "electronics",
    dir: "extensions/eu/electronics",
    ttlFile: "electronics.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/electronics/",
  },
  {
    name: "detergent",
    dir: "extensions/eu/detergent",
    ttlFile: "detergent.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/detergent/",
  },
  {
    name: "ppwr",
    dir: "extensions/eu/ppwr",
    ttlFile: "ppwr.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/ppwr/",
  },
  {
    name: "cpr",
    dir: "extensions/eu/cpr",
    ttlFile: "cpr.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/cpr/",
  },
  {
    name: "iron-steel",
    dir: "extensions/eu/iron-steel",
    ttlFile: "iron-steel.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/iron-steel/",
  },
  {
    name: "fsma204",
    dir: "extensions/us/fsma204",
    ttlFile: "fsma204.ttl",
    namespace: "https://ref.openepcis.io/extensions/us/fsma204/",
  },
  {
    name: "rail",
    dir: "extensions/upstream/gs1-rail",
    ttlFile: "gs1RailVoc.ttl",
    namespace: "https://gs1-epcis-reg.org/rail/voc/data#",
  },
  // Upstream mirror — CIRPASS-2 EUDPP Core Ontology (Semantic Treehouse /
  // TalTech). Terms live under the # namespace; the ontology nodes (CORE
  // umbrella + nine content modules) live under https://w3id.org/eudpp/…,
  // so ontologyIri points at the CORE node for title/version.
  {
    name: "eudpp",
    dir: "extensions/upstream/cirpass2-eudpp",
    ttlFile: "eudpp.ttl",
    namespace: "https://w3id.org/eudpp#",
    ontologyIri: "https://w3id.org/eudpp/",
    publishTermNamespace: true,
  },
  // Upstream registry — IDTA AAS submodel semanticIds (Industrial Digital
  // Twin Association). Curated by hand: IDTA publishes AASX/JSON templates,
  // not RDF, so there is no sync script. admin-shell.io semanticIds are IRIs
  // and stay verbatim subjects (extraNamespaces); IEC CDD / ECLASS elements
  // are identified by IRDIs — not IRIs — and carry a local node with the
  // verbatim IRDI in skos:notation.
  {
    name: "idta-aas",
    dir: "extensions/upstream/idta-aas",
    ttlFile: "idta-aas.ttl",
    namespace: "https://ref.openepcis.io/extensions/upstream/idta-aas/",
    extraNamespaces: ["https://admin-shell.io/"],
  },
];

function getLocalName(uri: string, namespace: string): string {
  if (uri.startsWith(namespace)) {
    return uri.substring(namespace.length);
  }
  const hashIndex = uri.lastIndexOf("#");
  if (hashIndex !== -1) {
    return uri.substring(hashIndex + 1);
  }
  const slashIndex = uri.lastIndexOf("/");
  if (slashIndex !== -1) {
    return uri.substring(slashIndex + 1);
  }
  return uri;
}

function getObjectValue(
  store: Store,
  subject: string,
  predicate: string
): string | undefined {
  const quads = store.getQuads(namedNode(subject), namedNode(predicate), null, null);
  if (quads.length > 0) {
    return quads[0].object.value;
  }
  return undefined;
}

function getObjectValues(store: Store, subject: string, predicate: string): string[] {
  const quads = store.getQuads(namedNode(subject), namedNode(predicate), null, null);
  // Named nodes only: anonymous OWL constructs (restrictions, unions — the EUDPP
  // mirror carries them) would otherwise leak blank-node labels like "b23_n3-44"
  // into subClassOf/domain/range lists, which the browser then renders as links.
  return quads.filter((q) => q.object.termType === "NamedNode").map((q) => q.object.value);
}

function isClass(store: Store, subject: string): boolean {
  const types = getObjectValues(store, subject, `${RDF}type`);
  return types.includes(`${RDFS}Class`) || types.includes(`${OWL}Class`);
}

function isProperty(store: Store, subject: string): boolean {
  const types = getObjectValues(store, subject, `${RDF}type`);
  return (
    types.includes(`${RDF}Property`) ||
    types.includes(`${OWL}ObjectProperty`) ||
    types.includes(`${OWL}DatatypeProperty`)
  );
}

function extractTermData(store: Store, subject: string, namespace: string): TermData {
  const localName = getLocalName(subject, namespace);
  const label =
    getObjectValue(store, subject, `${RDFS}label`) ||
    getObjectValue(store, subject, `${SKOS}prefLabel`) ||
    localName;
  const comment =
    getObjectValue(store, subject, `${RDFS}comment`) ||
    getObjectValue(store, subject, `${SKOS}definition`) ||
    "";
  const domain = toPrefixedForms(getObjectValues(store, subject, `${RDFS}domain`));
  const range = toPrefixedForms(getObjectValues(store, subject, `${RDFS}range`));
  const seeAlso = getObjectValues(store, subject, `${RDFS}seeAlso`);
  const subClassOf = toPrefixedForms(getObjectValues(store, subject, `${RDFS}subClassOf`));
  const equivalentClass = toPrefixedForms(getObjectValues(store, subject, `${OWL}equivalentClass`));
  const equivalentProperty = toPrefixedForms(getObjectValues(store, subject, `${OWL}equivalentProperty`));
  const exactMatch = toPrefixedForms(getObjectValues(store, subject, `${SKOS}exactMatch`));
  const closeMatch = toPrefixedForms(getObjectValues(store, subject, `${SKOS}closeMatch`));
  const broadMatch = toPrefixedForms(getObjectValues(store, subject, `${SKOS}broadMatch`));
  const narrowMatch = toPrefixedForms(getObjectValues(store, subject, `${SKOS}narrowMatch`));
  const relatedMatch = toPrefixedForms(getObjectValues(store, subject, `${SKOS}relatedMatch`));
  const broader = toPrefixedForms(getObjectValues(store, subject, `${SKOS}broader`));
  const narrower = toPrefixedForms(getObjectValues(store, subject, `${SKOS}narrower`));
  const source = getObjectValue(store, subject, `${DCTERMS}source`);
  const deprecated = getObjectValue(store, subject, `${OWL}deprecated`) === "true";
  // ESPR Article 9 tier: oec:defaultAccessLevel points at oec:Public/AuthorizedOnly/Restricted;
  // emit the bare tier name so consumers don't need to strip the namespace
  const accessLevelIri = getObjectValue(store, subject, `${OEC}defaultAccessLevel`);
  const accessLevel = accessLevelIri?.startsWith(OEC)
    ? accessLevelIri.substring(OEC.length)
    : accessLevelIri;
  const accessLevelMandatedBy = getObjectValue(store, subject, `${OEC}accessLevelMandatedBy`);
  // Tier provenance: rationale (reviewer-checkable sentence), grounding source
  // (citation, non-locking) and the structural-inheritance marker.
  const accessLevelRationale = getObjectValue(store, subject, `${OEC}accessLevelRationale`);
  const accessLevelSource = getObjectValue(store, subject, `${OEC}accessLevelSource`);
  const accessLevelInherited = getObjectValue(store, subject, `${OEC}accessLevelInherited`) === "true";

  return {
    id: subject,
    localName,
    label,
    comment,
    ...(domain.length > 0 && { domain }),
    ...(range.length > 0 && { range }),
    ...(seeAlso.length > 0 && { seeAlso }),
    ...(subClassOf.length > 0 && { subClassOf }),
    ...(equivalentClass.length > 0 && { equivalentClass }),
    ...(equivalentProperty.length > 0 && { equivalentProperty }),
    ...(exactMatch.length > 0 && { exactMatch }),
    ...(closeMatch.length > 0 && { closeMatch }),
    ...(broadMatch.length > 0 && { broadMatch }),
    ...(narrowMatch.length > 0 && { narrowMatch }),
    ...(relatedMatch.length > 0 && { relatedMatch }),
    ...(broader.length > 0 && { broader }),
    ...(narrower.length > 0 && { narrower }),
    ...(source && { source }),
    ...(deprecated && { deprecated }),
    ...(accessLevel && { accessLevel }),
    ...(accessLevelMandatedBy && { accessLevelMandatedBy }),
    ...(accessLevelRationale && { accessLevelRationale }),
    ...(accessLevelSource && { accessLevelSource }),
    ...(accessLevelInherited && { accessLevelInherited }),
  };
}

function extractEnumerations(
  store: Store,
  namespace: string,
  classes: TermData[]
): EnumerationData[] {
  const enumerations: EnumerationData[] = [];

  for (const cls of classes) {
    const instances = store.getQuads(null, namedNode(`${RDF}type`), namedNode(cls.id), null);

    const enumValues: EnumValue[] = instances
      .filter((q) => q.subject.value.startsWith(namespace))
      .map((q) => {
        const subject = q.subject.value;
        const localName = getLocalName(subject, namespace);
        const label =
          getObjectValue(store, subject, `${RDFS}label`) ||
          getObjectValue(store, subject, `${SKOS}prefLabel`) ||
          localName;
        const comment =
          getObjectValue(store, subject, `${RDFS}comment`) ||
          getObjectValue(store, subject, `${SKOS}definition`) ||
          "";

        return { id: subject, localName, label, comment };
      });

    if (enumValues.length > 0) {
      enumerations.push({
        id: cls.id,
        localName: cls.localName,
        label: cls.label,
        comment: cls.comment,
        values: enumValues.sort((a, b) => a.localName.localeCompare(b.localName)),
      });
    }
  }

  return enumerations;
}

/**
 * Find individuals in this namespace that are instances of external classes
 * (classes not defined in this namespace). Groups them as enumerations.
 * Example: battery:StateOfHealth a gs1:MeasurementType → enumeration under gs1:MeasurementType.
 */
function extractExternalEnumerations(
  store: Store,
  namespace: string,
  allSubjects: Set<string>
): EnumerationData[] {
  const grouped = new Map<string, EnumValue[]>();

  for (const subject of allSubjects) {
    if (isClass(store, subject) || isProperty(store, subject)) continue;
    // Skip the ontology root (subject IRI exactly equals namespace, no local name)
    if (subject === namespace || subject === namespace.replace(/[#/]$/, "")) continue;

    const types = getObjectValues(store, subject, `${RDF}type`);
    for (const type of types) {
      // Skip RDF/OWL meta-types and types within our own namespace (handled by extractEnumerations)
      if (type.startsWith(RDF) || type.startsWith(OWL) || type.startsWith(RDFS) || type.startsWith(namespace)) continue;

      const localName = getLocalName(subject, namespace);
      const label =
        getObjectValue(store, subject, `${RDFS}label`) ||
        getObjectValue(store, subject, `${SKOS}prefLabel`) ||
        localName;
      const comment =
        getObjectValue(store, subject, `${RDFS}comment`) ||
        getObjectValue(store, subject, `${SKOS}definition`) ||
        "";

      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type)!.push({ id: subject, localName, label, comment });
    }
  }

  const enumerations: EnumerationData[] = [];
  for (const [typeUri, values] of grouped) {
    const typeName = getLocalName(typeUri, typeUri.substring(0, typeUri.lastIndexOf("/") + 1));
    const typeLabel =
      getObjectValue(store, typeUri, `${RDFS}label`) || typeName;
    const typeComment =
      getObjectValue(store, typeUri, `${RDFS}comment`) || "";

    enumerations.push({
      id: typeUri,
      localName: typeName,
      label: typeLabel,
      comment: typeComment,
      values: values.sort((a, b) => a.localName.localeCompare(b.localName)),
    });
  }

  return enumerations;
}

function extractOntologyData(store: Store, module: OntologyModule): OntologyData {
  const namespace = module.namespace;
  // Namespaces whose subjects belong to this dataset, longest first so a
  // localName is stripped with the most specific match.
  const termNamespaces = [namespace, ...(module.extraNamespaces ?? [])].sort(
    (a, b) => b.length - a.length,
  );
  const nsFor = (uri: string) => termNamespaces.find((ns) => uri.startsWith(ns)) ?? namespace;
  const describedBy = module.ontologyIri ?? namespace;
  const ontologyUri = describedBy.endsWith("/") ? describedBy.slice(0, -1) : describedBy;

  const title =
    getObjectValue(store, describedBy, `${DCTERMS}title`) ||
    getObjectValue(store, ontologyUri, `${DCTERMS}title`) ||
    getObjectValue(store, describedBy, `${DC11}title`) ||
    getObjectValue(store, ontologyUri, `${DC11}title`) ||
    `${module.name} Vocabulary`;
  const description =
    getObjectValue(store, describedBy, `${DCTERMS}description`) ||
    getObjectValue(store, ontologyUri, `${DCTERMS}description`) ||
    getObjectValue(store, describedBy, `${DC11}description`) ||
    getObjectValue(store, ontologyUri, `${DC11}description`) ||
    "";
  const version =
    getObjectValue(store, describedBy, `${OWL}versionInfo`) ||
    getObjectValue(store, ontologyUri, `${OWL}versionInfo`) ||
    "0.9.6";

  const allSubjects = new Set<string>();
  store.getQuads(null, null, null, null).forEach((quad) => {
    const subject = quad.subject.value;
    // The ontology node itself is described, not a term of the dataset.
    if (subject === describedBy || subject === ontologyUri) return;
    if (termNamespaces.some((ns) => subject.startsWith(ns))) {
      allSubjects.add(subject);
    }
  });

  const classes: TermData[] = [];
  const properties: TermData[] = [];

  for (const subject of allSubjects) {
    // Strip whichever namespace the subject actually sits in, so a served
    // field keeps the bare key the resolver serves it under.
    if (isClass(store, subject)) {
      classes.push(extractTermData(store, subject, nsFor(subject)));
    } else if (isProperty(store, subject)) {
      properties.push(extractTermData(store, subject, nsFor(subject)));
    }
  }

  const enumerations = extractEnumerations(store, namespace, classes);

  // Also collect individuals that are instances of external classes (e.g., gs1:MeasurementType)
  const externalEnums = extractExternalEnumerations(store, namespace, allSubjects);
  enumerations.push(...externalEnums);

  const enumClassIds = new Set(enumerations.map((e) => e.id));
  const regularClasses = classes.filter((c) => !enumClassIds.has(c.id));

  regularClasses.sort((a, b) => a.localName.localeCompare(b.localName));
  properties.sort((a, b) => a.localName.localeCompare(b.localName));
  enumerations.sort((a, b) => a.localName.localeCompare(b.localName));

  return {
    // The dataset's own IRI. For most modules that is also the namespace its
    // terms are minted under; for served-fields the terms are GS1's own IRIs,
    // so there is no single term namespace and this identifies the dataset.
    // publishTermNamespace overrides toward the term namespace where the two
    // differ and the browser needs the latter (eudpp).
    namespace: module.publishTermNamespace ? namespace : describedBy,
    version,
    title,
    description,
    classes: regularClasses,
    properties,
    enumerations,
  };
}

async function parseAsync(parser: Parser, ttl: string): Promise<Quad[]> {
  return new Promise((resolve, reject) => {
    const quads: Quad[] = [];
    parser.parse(ttl, (error, quad) => {
      if (error) {
        reject(error);
      } else if (quad) {
        quads.push(quad);
      } else {
        resolve(quads);
      }
    });
  });
}

async function buildOntologyJson(): Promise<void> {
  console.log("Building ontology JSON files...\n");

  for (const module of ONTOLOGY_MODULES) {
    const ttlPath = join(PROJECT_ROOT, module.dir, "ontology", module.ttlFile);
    const jsonDir = join(PROJECT_ROOT, module.dir, "json");
    const jsonPath = join(jsonDir, `${module.name}.json`);

    if (!existsSync(ttlPath)) {
      console.warn(`Warning: TTL file not found: ${ttlPath}`);
      continue;
    }

    console.log(`Processing ${module.name}...`);
    console.log(`  Source: ${ttlPath}`);

    try {
      const ttl = readFileSync(ttlPath, "utf-8");
      const store = new Store();
      const parser = new Parser();

      const quads = await parseAsync(parser, ttl);
      store.addQuads(quads);

      console.log(`  Parsed ${quads.length} triples`);

      // Optional sidecar with ESPR access-tier annotations (oec:defaultAccessLevel /
      // oec:accessLevelMandatedBy) so tier decisions stay reviewable in one file
      // per module instead of being scattered through the main ontology.
      const accessTtlPath = ttlPath.replace(/\.ttl$/, "-access-levels.ttl");
      if (existsSync(accessTtlPath)) {
        const accessQuads = await parseAsync(new Parser(), readFileSync(accessTtlPath, "utf-8"));
        store.addQuads(accessQuads);
        console.log(`  Merged ${accessQuads.length} access-level triples from ${accessTtlPath}`);
      }

      const data = extractOntologyData(store, module);

      console.log(`  Found ${data.classes.length} classes`);
      console.log(`  Found ${data.properties.length} properties`);
      console.log(`  Found ${data.enumerations.length} enumerations`);

      // Ensure output directory exists
      mkdirSync(jsonDir, { recursive: true });

      writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log(`  Output: ${jsonPath}\n`);
    } catch (error) {
      console.error(`  Error processing ${module.name}:`, error);
    }
  }

  console.log("Done!");
}

buildOntologyJson().catch(console.error);
