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
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const GS1 = "https://ref.gs1.org/voc/";
const SCHEMA = "https://schema.org/";

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
  source?: string;
  deprecated?: boolean;
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
  namespace: string;
}

// Ontology modules configuration
const ONTOLOGY_MODULES: OntologyModule[] = [
  {
    name: "dpp-core",
    dir: "extensions/common/core",
    ttlFile: "dpp-core.ttl",
    namespace: "https://ref.openepcis.io/extensions/common/core/",
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
    name: "fsma204",
    dir: "extensions/us/fsma204",
    ttlFile: "fsma204.ttl",
    namespace: "https://ref.openepcis.io/extensions/us/fsma204/",
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
  return quads.map((q) => q.object.value);
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
  const source = getObjectValue(store, subject, `${DCTERMS}source`);
  const deprecated = getObjectValue(store, subject, `${OWL}deprecated`) === "true";

  return {
    id: subject,
    localName,
    label,
    comment,
    ...(domain.length > 0 && { domain }),
    ...(range.length > 0 && { range }),
    ...(seeAlso.length > 0 && { seeAlso }),
    ...(subClassOf.length > 0 && { subClassOf }),
    ...(source && { source }),
    ...(deprecated && { deprecated }),
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
  const ontologyUri = namespace.endsWith("/") ? namespace.slice(0, -1) : namespace;

  const title =
    getObjectValue(store, namespace, `${DCTERMS}title`) ||
    getObjectValue(store, ontologyUri, `${DCTERMS}title`) ||
    `${module.name} Vocabulary`;
  const description =
    getObjectValue(store, namespace, `${DCTERMS}description`) ||
    getObjectValue(store, ontologyUri, `${DCTERMS}description`) ||
    "";
  const version =
    getObjectValue(store, namespace, `${OWL}versionInfo`) ||
    getObjectValue(store, ontologyUri, `${OWL}versionInfo`) ||
    "0.9.5";

  const allSubjects = new Set<string>();
  store.getQuads(null, null, null, null).forEach((quad) => {
    if (quad.subject.value.startsWith(namespace)) {
      allSubjects.add(quad.subject.value);
    }
  });

  const classes: TermData[] = [];
  const properties: TermData[] = [];

  for (const subject of allSubjects) {
    if (isClass(store, subject)) {
      classes.push(extractTermData(store, subject, namespace));
    } else if (isProperty(store, subject)) {
      properties.push(extractTermData(store, subject, namespace));
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
    namespace,
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
