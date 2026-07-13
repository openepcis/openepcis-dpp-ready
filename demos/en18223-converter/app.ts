/**
 * Browser entry for the EN 18223 converter demo. Runs the shared derivation
 * core (scripts/en18223/derive-core.ts) entirely client-side: real GS1 Web
 * Vocabulary + GS1 Digital Link product JSON-LD in, EN 18223 plain JSON out, in
 * either the expanded (Annex A) or the compressed serialization. The range
 * index, the OpenEPCIS contexts, and the product samples are generated from the
 * repo sources by scripts/build-en18223-demo-data.ts and bundled with esbuild
 * (see package.json demo:en18223:build), so the demo runs with no network.
 */
import { deriveEN18223, compressEN18223, expandJsonLd, type DocumentLoader } from "../../scripts/en18223/derive-core.ts";
import { operationalContextFor, buildOperationalKeyMap, operationalOptions, toTurtle, toXmlOperational, toXmlExpanded } from "../../scripts/en18223/serialize.ts";
import rangeIndex from "./range-index.json";
import contexts from "./contexts.json";
import samples from "./samples.json";

const range = new Map<string, string>(Object.entries(rangeIndex as Record<string, string>));

const CONTEXTS = contexts as Record<string, any>;
const documentLoader: DocumentLoader = async (url: string) => {
  if (CONTEXTS[url]) return { contextUrl: undefined, documentUrl: url, document: CONTEXTS[url] };
  const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
  if (!res.ok) throw new Error(`could not load context ${url}: ${res.status}`);
  return { contextUrl: undefined, documentUrl: url, document: await res.json() };
};

type Sample = { group: string; label: string; doc: any };
const SAMPLES = samples as Sample[];

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const inputEl = () => $("input") as unknown as HTMLTextAreaElement;
const outputEl = () => $("output");
const statusEl = () => $("status");
const formatEl = () => $("format") as unknown as HTMLSelectElement;

function setStatus(msg: string, kind: "ok" | "err" | "" = "") {
  const el = statusEl();
  el.textContent = msg;
  el.className = kind;
}

// Views of the last successful derivation. EN 18223 has one JSON payload: the
// "operational"/"compressed" form. We show it both ways — carrying the
// operational @context (valid JSON-LD) and without it (plain JSON, dictionary
// externalised) — so it is clear they are the same bytes modulo the context.
// Alongside: the Annex A expanded JSON, both XML serializations (Annex B
// compressed + an expanded analogue), the Turtle RDF, and the raw JSON-LD
// expansion of the input.
type ViewKey = "operational" | "compressed" | "expanded" | "xmlOperational" | "xmlExpanded" | "turtle" | "jsonld";
let views: Record<ViewKey, any> | null = null;

function render() {
  if (!views) return;
  const fmt = formatEl().value as ViewKey;
  const v = views[fmt] ?? views.operational;
  // Turtle is already serialized text; the JSON views are pretty-printed.
  outputEl().textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2);
}

async function derive() {
  setStatus("Deriving…");
  let input: any;
  try {
    input = JSON.parse(inputEl().value);
  } catch (e: any) {
    views = null;
    outputEl().textContent = "";
    setStatus(`Invalid JSON: ${e.message}`, "err");
    return;
  }
  try {
    const expanded = await deriveEN18223(input, range, documentLoader);
    const jsonldExpanded = await expandJsonLd(input, documentLoader);
    // One EN 18223 payload keyed by the operational-context aliases (so it
    // round-trips through that context); operational = payload + @context,
    // compressed = the same payload with the dictionary (@context) externalised.
    const ctx = operationalContextFor(input);
    const keyMap = await buildOperationalKeyMap(ctx, documentLoader);
    const compressed = compressEN18223(expanded, operationalOptions(keyMap));
    const operational = { "@context": ctx, ...compressed };
    const turtle = await toTurtle(operational, documentLoader);
    views = {
      operational,
      compressed,
      expanded,
      xmlOperational: toXmlOperational(expanded),
      xmlExpanded: toXmlExpanded(expanded),
      turtle,
      jsonld: jsonldExpanded,
    };
    render();
    const n = Array.isArray(expanded.elements) ? expanded.elements.length : 0;
    const specs = Array.isArray(expanded.contentSpecificationIds) ? expanded.contentSpecificationIds.length : 0;
    setStatus(`Derived: ${n} top-level elements · granularity "${expanded.granularity}" · ${specs} content specification(s)`, "ok");
  } catch (e: any) {
    views = null;
    outputEl().textContent = "";
    setStatus(`Error: ${e.message}`, "err");
  }
}

function loadSample(idx: number) {
  const s = SAMPLES[idx];
  if (s) inputEl().value = JSON.stringify(s.doc, null, 2);
}

function init() {
  const select = $("sample") as unknown as HTMLSelectElement;
  let currentGroup = "";
  let optgroup: HTMLOptGroupElement | null = null;
  SAMPLES.forEach((s, i) => {
    if (s.group !== currentGroup) {
      optgroup = document.createElement("optgroup");
      optgroup.label = s.group;
      select.appendChild(optgroup);
      currentGroup = s.group;
    }
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = s.label;
    (optgroup as HTMLOptGroupElement).appendChild(opt);
  });
  select.addEventListener("change", () => { loadSample(Number(select.value)); void derive(); });
  formatEl().addEventListener("change", render);
  $("derive").addEventListener("click", () => void derive());
  if (SAMPLES.length) { loadSample(0); void derive(); }
}

init();
