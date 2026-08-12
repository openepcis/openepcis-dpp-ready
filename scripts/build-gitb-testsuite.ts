#!/usr/bin/env tsx
/**
 * Generate the GITB TDL test suite: the artifact a third party runs on an EU
 * Interoperability Test Bed instance to obtain a conformance statement against
 * OpenEPCIS DPP-Ready.
 *
 * Output (all generated — do not hand-edit):
 *   gitb/test-suites/openepcis-dpp/testSuite.xml
 *   gitb/test-suites/openepcis-dpp/testCases/tc-{upload,selftest}-<type>.xml
 *   gitb/test-suites/openepcis-dpp/resources/fixtures/<type>/*.nq
 *   gitb/test-suites/openepcis-dpp/resources/negative/<type>/*.nq
 *
 * TWO TEST-CASE FAMILIES, and both are needed.
 *
 * `tc-upload-<type>` is the conformance test proper: the system under test
 * uploads its own passport and it is validated against the published shapes. It
 * takes JSON-LD, which means the validator resolves the document's @context from
 * ref.openepcis.io — correct for a real conformance check, since a third party's
 * passport must reference the published contexts.
 *
 * `tc-selftest-<type>` proves the suite discriminates. A green suite that only
 * ever validates correct documents demonstrates nothing: it would look identical
 * if the shapes were empty. Each self-test asserts that our own examples PASS and
 * that a deliberately broken variant FAILS, the latter with `@invert="true"`.
 * Its fixtures are N-Quads, expanded here with the repo's offline loader, so the
 * self-test measures the shapes and not whatever revision happens to be deployed
 * — the distinction that made the first parity run misleading.
 *
 * NEGATIVE FIXTURES ARE DERIVED, not hand-written, so they cannot drift away from
 * the examples they mutate. Each is one documented, minimal edit to a positive
 * fixture, chosen from MUTATIONS below because it is guaranteed to violate a
 * specific shape.
 *
 * Usage:
 *   tsx scripts/build-gitb-testsuite.ts [--write]
 *   VALIDATOR_ADDRESS=http://host:8080 tsx scripts/build-gitb-testsuite.ts --write
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { Store } from "n3";
import { offlineDocumentLoader } from "./lib/jsonld-loader.ts";
import {
  SH,
  activateBySuffix,
  namedNode,
  parseTurtle,
  stripOwlImports,
  stripSparqlConstraints,
  validate,
} from "./lib/shacl-run.ts";
import {
  coreOf,
  discoverModules,
  granularityOfDigitalLink,
  ROOT,
  type ValidatableModule,
} from "./lib/modules.ts";

const WRITE = process.argv.includes("--write");
const SUITE = path.join(ROOT, "gitb/test-suites/openepcis-dpp");

/**
 * SOAP address of the RDF validator's GITB validation service.
 *
 * Default is the service name from gitb/docker/docker-compose.itb.yml, so the
 * generated suite works unchanged on the local Test Bed. Path shape verified
 * against the running container: /shacl/soap/<domain>/validation?wsdl (the
 * /shacl/<domain>/soap/... form is a 404).
 */
const VALIDATOR_ADDRESS = process.env.VALIDATOR_ADDRESS ?? "http://shacl-validator:8080";
const WSDL = `${VALIDATOR_ADDRESS}/shacl/soap/dpp/validation?wsdl`;

const ACTOR = "DPPDataProvider";

/** One documented, minimal mutation that must make a fixture non-conformant. */
interface Mutation {
  id: string;
  /** Why this must fail, for the test case description and the fixture header. */
  why: string;
  /**
   * Candidate mutants for one fixture's N-Quads; empty when the mutation does
   * not apply. `required` lists the predicates the module's own shapes demand
   * with sh:minCount >= 1, so a mutation can be derived from the shapes rather
   * than guessed — see requiredPredicates().
   *
   * Candidates are PROPOSALS: unless the mutation is exempt (see
   * offlineCheckable), the generator keeps only a candidate that provably adds
   * a violation over the unmutated fixture. A required predicate can belong to
   * a node shape whose target the document never matches, in which case
   * removing it changes nothing — a fixture born that way turns the
   * self-test's invert assertion into a lie.
   */
  candidates: (nq: string, required: string[]) => string[];
  /**
   * False for sh:sparql-based mutations: the offline engine strips those
   * constraints, so the check would reject a perfectly good fixture. Their
   * behaviour is proven by check-shapes-itb.ts against the EC engine instead.
   */
  offlineCheckable: boolean;
}

/**
 * Predicates the shapes require with sh:minCount >= 1, read from the shapes graph.
 *
 * Deriving the mutation from the shapes rather than curating one per module means
 * every specification can get a negative fixture, and the fixture stays correct
 * when the shapes change: if an obligation is dropped upstream, the mutation stops
 * producing a violation and the fixture check in check-shapes-itb.ts fails loudly
 * instead of the suite quietly asserting nothing.
 */
function requiredPredicates(shapes: Store): string[] {
  const out = new Set<string>();
  for (const q of shapes.match(null, namedNode(`${SH}minCount`), null, null)) {
    if (Number(q.object.value) < 1) continue;
    for (const p of shapes.match(q.subject, namedNode(`${SH}path`), null, null)) {
      if (p.object.termType === "NamedNode") out.add(p.object.value);
    }
  }
  return [...out].sort();
}

const OEC = "https://ref.openepcis.io/extensions/common/core/";

const MUTATIONS: Mutation[] = [
  {
    id: "granularity-mismatch",
    why:
      "The passport's GS1 Digital Link says one granularity and oec:granularityLevel " +
      "claims another, which dpp-sh:GranularityDigitalLinkConstraint must reject " +
      "(EN 18219 4.4 / EN 18223). This is a SHACL-SPARQL constraint, so it also " +
      "proves the Test Bed's engine evaluates sh:sparql at all.",
    offlineCheckable: false,
    candidates: (nq) => {
      const line = nq
        .split("\n")
        .find((l) => l.includes(`<${OEC}granularityLevel>`) && /"(model|batch|item)"/.test(l));
      if (!line) return [];
      const current = /"(model|batch|item)"/.exec(line)![1];
      // Any other level contradicts the Digital Link the subject IRI carries.
      const wrong = current === "item" ? "model" : "item";
      return [nq.replace(line, line.replace(`"${current}"`, `"${wrong}"`))];
    },
  },
  {
    id: "missing-operator-role",
    why:
      "An economic operator without its ESPR Art. 77 role, which " +
      "dpp-sh:EconomicOperatorRoleRequired must reject.",
    offlineCheckable: true,
    candidates: (nq) => {
      const lines = nq.split("\n");
      const kept = lines.filter((l) => !l.includes(`<${OEC}hasOperatorRole>`));
      return kept.length === lines.length ? [] : [kept.join("\n")];
    },
  },
  {
    id: "out-of-range-fraction",
    why:
      "A 0..1 fraction set to 99, which the value-range constraint on the " +
      "corresponding property must reject.",
    offlineCheckable: true,
    candidates: (nq: string) => {
      const line = nq
        .split("\n")
        .find((l) =>
          /<https:\/\/ref\.openepcis\.io\/extensions\/[^>]*(recycledContent|recyclableContent|materialCircularityIndicator)>/.test(
            l,
          ),
        );
      if (!line) return [];
      return [nq.replace(line, line.replace(/"[^"]*"/, '"99"'))];
    },
  },
  {
    // Last resort, so every specification gets a negative fixture. Derived from
    // the shapes rather than curated: drop a predicate the shapes themselves
    // demand with sh:minCount, which must then trip that MinCount constraint.
    id: "missing-required-property",
    why:
      "A predicate the module's own shapes require with sh:minCount is removed, " +
      "which the corresponding MinCount constraint must reject.",
    offlineCheckable: true,
    candidates: (nq: string, required: string[]) => {
      // One candidate per removable predicate. The offline check picks the
      // first whose removal actually violates: a sh:minCount can sit on a node
      // shape this document never targets, and removing THAT predicate
      // produces a mutant both engines happily accept.
      const out: string[] = [];
      for (const predicate of required) {
        const lines = nq.split("\n");
        const kept = lines.filter((l) => !l.includes(`<${predicate}>`));
        if (kept.length !== lines.length) out.push(kept.join("\n"));
      }
      return out;
    },
  },
];

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Fixture {
  /** Path relative to the suite root, as an <artifact> value. */
  resource: string;
  /** Artifact name inside the test case. */
  name: string;
  label: string;
}

interface TypeCase {
  type: string;
  label: string;
  positives: Fixture[];
  /** One derived negative per mutation that applies to this type's examples. */
  negatives: (Fixture & { why: string; mutation: string })[];
}

function testSuiteXml(cases: TypeCase[], version: string): string {
  const testcases = cases
    .flatMap((c) => [`tc-upload-${c.type}`, ...(c.negatives.length || c.positives.length ? [`tc-selftest-${c.type}`] : [])])
    .map((id) => `    <testcase id="${id}"/>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATED by scripts/build-gitb-testsuite.ts (pnpm run build:gitb-testsuite) — do not edit. -->
<testsuite id="openepcis-dpp" xmlns="http://www.gitb.com/tdl/v1/"
           xmlns:gitb="http://www.gitb.com/core/v1/">
  <metadata>
    <gitb:name>OpenEPCIS DPP-Ready conformance</gitb:name>
    <gitb:version>${xml(version)}</gitb:version>
    <gitb:description>Conformance of a Digital Product Passport to the OpenEPCIS DPP-Ready SHACL shapes: the cross-cutting ESPR core plus one specification per regulation module, with EN 18223 granularity and EC battery-category variants. Each specification offers an upload test case for the system under test and a self-test that proves the shapes discriminate between a correct and a deliberately broken passport.</gitb:description>
  </metadata>
  <actors>
    <gitb:actor id="${ACTOR}">
      <gitb:name>Digital Product Passport data provider</gitb:name>
      <gitb:desc>The economic operator or solution provider whose passport is under test.</gitb:desc>
    </gitb:actor>
  </actors>
${testcases}
</testsuite>
`;
}

function uploadCase(c: TypeCase, version: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATED by scripts/build-gitb-testsuite.ts — do not edit. -->
<testcase id="tc-upload-${c.type}" xmlns="http://www.gitb.com/tdl/v1/"
          xmlns:gitb="http://www.gitb.com/core/v1/">
  <metadata>
    <gitb:name>[${xml(c.type)}] Validate an uploaded Digital Product Passport</gitb:name>
    <gitb:version>${xml(version)}</gitb:version>
    <gitb:description>Upload a passport as JSON-LD and validate it against the "${xml(c.type)}" shapes (${xml(c.label)}). The passport's own @context is resolved from ref.openepcis.io, so it must reference the published contexts — the same condition a real consumer of the passport faces.</gitb:description>
  </metadata>
  <actors>
    <gitb:actor id="${ACTOR}" name="Digital Product Passport data provider" role="SUT"/>
  </actors>
  <steps>
    <interact id="userData" desc="Upload the Digital Product Passport">
      <request desc="Digital Product Passport (JSON-LD):" name="passport"
               inputType="UPLOAD" required="true"/>
    </interact>
    <verify id="shaclCheck" handler="${xml(WSDL)}"
            desc="Validate against the ${xml(c.type)} SHACL shapes">
      <input name="contentToValidate">$userData{passport}</input>
      <input name="validationType">"${xml(c.type)}"</input>
      <input name="embeddingMethod">"BASE64"</input>
      <input name="contentSyntax">"application/ld+json"</input>
    </verify>
  </steps>
  <output>
    <success>
      <default>"The passport conforms to ${xml(c.type)}."</default>
    </success>
    <failure>
      <default>"The passport does not conform to ${xml(c.type)}. The failed step's report lists every violation."</default>
    </failure>
  </output>
</testcase>
`;
}

function selftestCase(c: TypeCase, version: string): string {
  // The fixtures enter the test case as imported artifacts; the verify steps
  // reference them by name. type="binary" + BASE64 is the ITB-documented
  // pairing for handing file content to a validation service.
  const imports = [...c.positives, ...c.negatives]
    .map(
      (f) => `    <artifact type="binary" encoding="UTF-8" name="${f.name}">${f.resource}</artifact>`,
    )
    .join("\n");

  const positiveSteps = c.positives
    .map(
      (f, i) => `    <verify id="pos${i}" handler="${xml(WSDL)}"
            desc="Reference passport must conform: ${xml(f.label)}">
      <input name="contentToValidate">$${f.name}</input>
      <input name="validationType">"${xml(c.type)}"</input>
      <input name="embeddingMethod">"BASE64"</input>
      <input name="contentSyntax">"application/n-quads"</input>
    </verify>`,
    )
    .join("\n");

  const negativeSteps = c.negatives.length
    ? c.negatives
        .map(
          (n, i) => `
    <!-- ${xml(n.why)} -->
    <verify id="neg${i}" handler="${xml(WSDL)}" invert="true"
            desc="Broken passport must be REJECTED (${xml(n.mutation)})">
      <input name="contentToValidate">$${n.name}</input>
      <input name="validationType">"${xml(c.type)}"</input>
      <input name="embeddingMethod">"BASE64"</input>
      <input name="contentSyntax">"application/n-quads"</input>
    </verify>`,
        )
        .join("")
    : `
    <!-- No negative fixture: no MUTATIONS entry applies to this module's examples.
         The self-test therefore proves only that the reference passports pass. -->`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATED by scripts/build-gitb-testsuite.ts — do not edit. -->
<testcase id="tc-selftest-${c.type}" xmlns="http://www.gitb.com/tdl/v1/"
          xmlns:gitb="http://www.gitb.com/core/v1/">
  <metadata>
    <gitb:name>[${xml(c.type)}] Self-test: the shapes accept correct and reject broken passports</gitb:name>
    <gitb:version>${xml(version)}</gitb:version>
    <gitb:description>Runs without interaction. Validates the reference passports OpenEPCIS publishes for ${xml(c.label)}, which must conform, and a deliberately broken variant, which must NOT. Without the second half a green result would be indistinguishable from empty shapes. Fixtures are pre-expanded N-Quads so the outcome depends on the shapes alone and not on the currently deployed contexts.</gitb:description>
  </metadata>
  <actors>
    <gitb:actor id="${ACTOR}" name="Digital Product Passport data provider" role="SUT"/>
  </actors>
  <imports>
${imports}
  </imports>
  <steps>
${positiveSteps}${negativeSteps}
  </steps>
  <output>
    <success>
      <default>"The ${xml(c.type)} shapes accept every reference passport and reject the broken one."</default>
    </success>
    <failure>
      <default>"Self-test failed: either a reference passport was rejected or the broken passport was accepted. Both mean the ${xml(c.type)} shapes are not fit to certify anyone."</default>
    </failure>
  </output>
</testcase>
`;
}

async function main() {
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  const version: string = pkg.version;
  const modules = await discoverModules();
  const core = coreOf(modules);
  const documentLoader = await offlineDocumentLoader();

  const files = new Map<string, string>();
  const cases: TypeCase[] = [];
  const noNegative: string[] = [];

  for (const module of modules) {
    if (!module.examplesDir) continue;
    const dir = path.join(ROOT, module.examplesDir);
    let names: string[] = [];
    try {
      names = (await fs.readdir(dir)).filter(
        (n) => n.endsWith(".jsonld") && !n.endsWith(".operational.jsonld"),
      );
    } catch {
      continue;
    }
    if (!names.length) continue;

    // Group examples by the validation type they belong to, so a granularity
    // variant is exercised by the passports that actually have that granularity.
    const byType = new Map<string, { file: string; nq: string }[]>();
    for (const name of names.sort()) {
      const doc = JSON.parse(await fs.readFile(path.join(dir, name), "utf8"));
      const subject = String(doc.id ?? doc["@id"] ?? "");
      const level = granularityOfDigitalLink(subject);
      const variant = module.granularities.find((g) => g.suffix === `-${level}`);
      const type = variant?.type ?? module.type;
      const nq = (await jsonld.toRDF(doc, {
        format: "application/n-quads",
        documentLoader: documentLoader as never,
      })) as unknown as string;
      byType.set(type, [...(byType.get(type) ?? []), { file: name, nq }]);
    }

    // Obligations of THIS module plus the cross-cutting core, matching what the
    // corresponding validation type bundles.
    const shapeFiles = [module.shapes, ...(module.dir === core.dir ? [] : [core.shapes])];
    const shapeParts = await Promise.all(
      shapeFiles.map((f) => fs.readFile(path.join(ROOT, f), "utf8")),
    );
    const shapeStore = parseTurtle(...shapeParts);
    stripOwlImports(shapeStore);
    const required = requiredPredicates(shapeStore);

    /**
     * The offline verification graph for one validation type: sh:sparql
     * stripped (rdf-validate-shacl throws on it) and the type's granularity
     * suffix activated, mirroring check-shapes.ts.
     */
    const verificationShapes = (type: string) => {
      const store = parseTurtle(...shapeParts);
      stripOwlImports(store);
      stripSparqlConstraints(store);
      const suffix = module.granularities.find((g) => g.type === type)?.suffix;
      if (suffix) activateBySuffix(store, suffix);
      return store;
    };

    /**
     * Violation fingerprints of a data graph WITH their multiplicity, for the
     * added-violation test. Counted rather than set-based on purpose: a
     * document can already violate the very shape a mutation targets on some
     * OTHER node (focus nodes are blank and unstable across parses, so they
     * cannot be part of the key), and only the count betrays the difference.
     */
    const violationKeys = async (shapes: ReturnType<typeof parseTurtle>, nq: string) => {
      const report = await validate(shapes, parseTurtle(nq));
      const counts = new Map<string, number>();
      for (const f of report.findings) {
        if (f.severity !== "Violation") continue;
        const key = `${f.sourceShape}|${f.path ?? ""}|${f.component ?? ""}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return counts;
    };

    for (const [type, entries] of [...byType].sort(([a], [b]) => a.localeCompare(b))) {
      const label =
        module.granularities.find((g) => g.type === type)?.label ??
        `${module.label} — ${module.regulation}`;

      const positives: Fixture[] = entries.map((e, i) => {
        const base = e.file.replace(/\.jsonld$/, "");
        const resource = `resources/fixtures/${type}/${base}.nq`;
        files.set(
          resource,
          `# GENERATED fixture for GITB validation type "${type}".\n` +
            `# Source: ${module.examplesDir}/${e.file}, expanded with the repo's offline\n` +
            `# document loader so the self-test does not depend on deployed contexts.\n` +
            e.nq,
        );
        return { resource, name: `pos${i}_${base.replace(/[^A-Za-z0-9]/g, "_")}`, label: e.file };
      });

      // One negative fixture per MUTATION that applies (first candidate that
      // provably violates). Every applicable mutation exercises a different
      // shape family, so stopping at the first mutation — as this used to —
      // left most of the discrimination unproven for free.
      const negatives: TypeCase["negatives"] = [];
      const offlineStore = verificationShapes(type);
      const baseKeys = new Map<string, Map<string, number>>();
      for (const m of MUTATIONS) {
        let accepted: { mutated: string; file: string } | undefined;
        for (const e of entries) {
          for (const mutated of m.candidates(e.nq, required)) {
            if (mutated === e.nq) continue;
            if (m.offlineCheckable) {
              // Keep only a mutant that ADDS a violation over its unmutated
              // source; comparing against the base report keeps the check
              // honest even where the offline engine disagrees with Jena on
              // the source itself.
              if (!baseKeys.has(e.file)) {
                baseKeys.set(e.file, await violationKeys(offlineStore, e.nq));
              }
              const base = baseKeys.get(e.file)!;
              const mutant = await violationKeys(offlineStore, mutated);
              const added = [...mutant].some(([k, n]) => n > (base.get(k) ?? 0));
              if (!added) continue;
            }
            accepted = { mutated, file: e.file };
            break;
          }
          if (accepted) break;
        }
        if (!accepted) continue;
        const base = accepted.file.replace(/\.jsonld$/, "");
        const resource = `resources/negative/${type}/${base}.${m.id}.nq`;
        files.set(
          resource,
          `# GENERATED negative fixture for GITB validation type "${type}".\n` +
            `# Source: ${module.examplesDir}/${accepted.file}\n` +
            `# Mutation: ${m.id}\n` +
            `# Must be REJECTED because: ${m.why.replace(/\n/g, "\n#   ")}\n` +
            accepted.mutated,
        );
        negatives.push({
          resource,
          name: `neg_${m.id.replace(/[^A-Za-z0-9]/g, "_")}`,
          label: accepted.file,
          why: m.why,
          mutation: m.id,
        });
      }
      if (!negatives.length) noNegative.push(type);

      cases.push({ type, label, positives, negatives });
    }
  }

  files.set("testSuite.xml", testSuiteXml(cases, version));
  for (const c of cases) {
    files.set(`testCases/tc-upload-${c.type}.xml`, uploadCase(c, version));
    files.set(`testCases/tc-selftest-${c.type}.xml`, selftestCase(c, version));
  }

  // Reconcile against what is committed, so drift is a build failure.
  const changed: string[] = [];
  for (const [rel, content] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    const abs = path.join(SUITE, rel);
    let existing: string | undefined;
    try {
      existing = await fs.readFile(abs, "utf8");
    } catch {
      /* new */
    }
    if (existing === content) continue;
    changed.push(path.relative(ROOT, abs));
    if (WRITE) {
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content);
    }
  }
  const expected = new Set([...files.keys()].map((r) => path.join(SUITE, r)));
  const walk = async (d: string): Promise<string[]> => {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(d);
    } catch {
      return [];
    }
    const out: string[] = [];
    for (const name of entries) {
      const full = path.join(d, name);
      out.push(...((await fs.stat(full)).isDirectory() ? await walk(full) : [full]));
    }
    return out;
  };
  for (const abs of await walk(SUITE)) {
    if (expected.has(abs) || abs.includes(`${path.sep}docs${path.sep}`)) continue;
    changed.push(`${path.relative(ROOT, abs)} (stale)`);
    if (WRITE) await fs.rm(abs);
  }

  console.log(
    `GITB TDL test suite: ${cases.length} specification(s), ` +
      `${cases.length * 2} test case(s), ` +
      `${cases.reduce((n, c) => n + c.positives.length, 0)} positive and ` +
      `${cases.reduce((n, c) => n + c.negatives.length, 0)} negative fixture(s)`,
  );
  for (const c of cases) {
    console.log(
      `  ${c.type.padEnd(24)} ${String(c.positives.length).padStart(2)} positive` +
        (c.negatives.length ? `, negatives: ${c.negatives.map((n) => n.mutation).join(", ")}` : `, NO negative fixture`),
    );
  }
  if (noNegative.length) {
    console.log(
      `\n${noNegative.length} type(s) have no negative fixture — no mutation in MUTATIONS applies ` +
        `to their examples:\n  ${noNegative.join(", ")}\n` +
        `Their self-test proves only that the reference passports pass. Add a mutation to close this.`,
    );
  }
  console.log(`\nValidator address baked into the suite: ${WSDL}`);

  if (!changed.length) {
    console.log(`\n✓ committed test suite is in step with the examples and shapes.`);
    return;
  }
  if (WRITE) {
    console.log(`\n✓ wrote ${changed.length} file(s).`);
    return;
  }
  console.log(`\n✗ the committed test suite has drifted:`);
  for (const c of changed) console.log(`    ${c}`);
  console.log(`\nRegenerate with: pnpm run build:gitb-testsuite`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
