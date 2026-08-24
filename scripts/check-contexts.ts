/**
 * PUBLISHED CONTEXT GUARD — every context we publish must be usable as an
 * @context by a JSON-LD processor.
 *
 * Every file under extensions/**\/context/ is served from ref.openepcis.org and
 * named in module READMEs as a context URL to put in a document. Nothing
 * checked that the file actually works in that role, and two of them did not:
 *
 *   battery-context-scientific.jsonld     carried owl:equivalentProperty /
 *     owl:equivalentClass / qudt:symbol INSIDE term definitions. A term
 *     definition admits only JSON-LD keywords, so the whole context was
 *     rejected. The alignments belonged in the TTL and now live there.
 *   battery-context-to-batterypass.jsonld used ~112 term keys in IRI form that
 *     redirected to a DIFFERENT IRI. A context maps a KEY to an IRI and cannot
 *     redirect one IRI onto another; a term written as an IRI must expand to
 *     itself. It is now the JSON-LD serialization of the BatteryPass rendering.
 *
 * Both were published, documented and broken, and both failed on the FIRST line
 * a processor read. The cost of catching that is one expand per file.
 *
 * Two things are asserted, because a context can be well-formed and still
 * useless:
 *   (1) the context processes at all;
 *   (2) a probe document carrying one of the context's own terms expands under
 *       it, and that term maps to an absolute IRI. A context whose terms expand
 *       to relative IRIs produces data no consumer can read back.
 *
 * Usage: pnpm run check:contexts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { documentLoader, ROOT } from "./en18223/node-io.ts";

/** Term keys of a context, ignoring keywords, prefixes and IRI-form keys. */
function termKeys(ctx: unknown, out: string[] = []): string[] {
  if (Array.isArray(ctx)) {
    for (const part of ctx) termKeys(part, out);
    return out;
  }
  if (!ctx || typeof ctx !== "object") return out;
  for (const [key, def] of Object.entries(ctx as Record<string, unknown>)) {
    if (key.startsWith("@") || key.startsWith("_") || key.includes(":")) continue;
    // a prefix declaration ("gs1": "https://ref.gs1.org/voc/") is not a term
    if (typeof def === "string" && /^https?:\/\//.test(def) && /[/#]$/.test(def)) continue;
    // a keyword alias (id: "@id", Supply_chain: "@nest") maps to no IRI by design
    if (typeof def === "string" && def.startsWith("@")) continue;
    if (def && typeof def === "object" && typeof (def as any)["@id"] === "string" && (def as any)["@id"].startsWith("@")) continue;
    out.push(key);
  }
  return out;
}

async function contextFiles(): Promise<string[]> {
  const found: string[] = [];
  const walk = async (dir: string) => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(p);
        continue;
      }
      if (path.basename(dir) === "context" && entry.name.endsWith(".jsonld")) found.push(p);
    }
  };
  await walk(path.join(ROOT, "extensions"));
  return found.sort();
}

async function main(): Promise<number> {
  const problems: string[] = [];
  let checked = 0;

  for (const abs of await contextFiles()) {
    const rel = path.relative(ROOT, abs);
    let file: any;
    try {
      file = JSON.parse(await fs.readFile(abs, "utf8"));
    } catch (e: any) {
      problems.push(`${rel}: not valid JSON — ${e.message}`);
      continue;
    }
    if (file["@context"] === undefined) {
      problems.push(`${rel}: has no @context, so it cannot serve as one`);
      continue;
    }

    // (1) the context must process. A probe with one unmapped key is enough to
    // force full context processing without depending on the context's content.
    const ctx = file["@context"];
    try {
      await jsonld.expand({ "@context": ctx, "https://example.org/probe": "x" } as any, {
        documentLoader: documentLoader as any,
      } as any);
    } catch (e: any) {
      problems.push(`${rel}: is not a usable @context — ${e.message}`);
      continue;
    }

    // (2) the context's own terms must reach absolute IRIs.
    const terms = termKeys(ctx);
    if (terms.length) {
      // One probe for the whole context; a term whose definition rejects a plain
      // string (a container, a nested node) is retried on its own with an object,
      // so the guard reports context defects and not probe-shape mismatches.
      const expandAll = async (value: (t: string) => unknown) => {
        const probe: any = { "@context": ctx };
        for (const t of terms) probe[t] = value(t);
        return jsonld.expand(probe, { documentLoader: documentLoader as any } as any);
      };
      let expanded: any;
      try {
        expanded = await expandAll(() => "probe");
      } catch {
        try {
          expanded = await expandAll(() => ({ "@id": "https://example.org/probe" }));
        } catch (e: any) {
          problems.push(`${rel}: defines terms that cannot be expanded — ${e.message}`);
          continue;
        }
      }
      const relative = Object.keys(expanded[0] ?? {}).filter((iri) => !iri.startsWith("@") && !iri.includes(":"));
      if (relative.length) {
        problems.push(
          `${rel}: ${relative.length} term(s) expand to a RELATIVE IRI (${relative.slice(0, 5).join(", ")}) — ` +
            `give the term an @id with a declared prefix`,
        );
        continue;
      }
    }
    checked++;
  }

  if (problems.length) {
    console.error(`✗ context guard: ${problems.length} published context(s) a JSON-LD processor cannot use\n`);
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error(
      `\nEvery file under extensions/**/context/ is served from ref.openepcis.org and named in the ` +
        `module docs as an @context URL, so a consumer hits this on the first line it reads.`,
    );
    return 1;
  }
  console.log(`✓ context guard: all ${checked} published context(s) process and reach absolute IRIs`);
  return 0;
}

process.exit(await main());
