/**
 * Browser entry for the EN 18223 converter demo. Runs the shared derivation
 * core (scripts/en18223/derive-core.ts) entirely client-side: real GS1 Web
 * Vocabulary + GS1 Digital Link product JSON-LD in, EN 18223 Annex A "expanded"
 * JSON out. The range index, the OpenEPCIS contexts, and the product samples
 * are generated from the repo sources by scripts/build-en18223-demo-data.ts and
 * bundled with esbuild (see package.json demo:en18223:build), so the demo runs
 * with no network.
 */
import { deriveEN18223, type DocumentLoader } from "../../scripts/en18223/derive-core.ts";
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

function setStatus(msg: string, kind: "ok" | "err" | "" = "") {
  const el = statusEl();
  el.textContent = msg;
  el.className = kind;
}

async function derive() {
  setStatus("Deriving…");
  let input: any;
  try {
    input = JSON.parse(inputEl().value);
  } catch (e: any) {
    outputEl().textContent = "";
    setStatus(`Invalid JSON: ${e.message}`, "err");
    return;
  }
  try {
    const out = await deriveEN18223(input, range, documentLoader);
    outputEl().textContent = JSON.stringify(out, null, 2);
    const n = Array.isArray(out.elements) ? out.elements.length : 0;
    const specs = Array.isArray(out.contentSpecificationIds) ? out.contentSpecificationIds.length : 0;
    setStatus(`Derived: ${n} top-level elements · granularity "${out.granularity}" · ${specs} content specification(s)`, "ok");
  } catch (e: any) {
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
  select.addEventListener("change", () => loadSample(Number(select.value)));
  $("derive").addEventListener("click", () => void derive());
  if (SAMPLES.length) { loadSample(0); void derive(); }
}

init();
