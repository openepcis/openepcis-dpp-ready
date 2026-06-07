/**
 * Browser entry for the EN 18223 converter demo. Runs the shared derivation
 * core (scripts/en18223/derive-core.ts) entirely client-side: GS1 Web
 * Vocabulary + GS1 Digital Link JSON-LD (EN 18223 "compressed") in, EN 18223
 * Annex A "expanded" JSON out. Bundled with esbuild (see package.json
 * demo:en18223:build); the dpp-core context and the precomputed range index
 * are bundled in, so no network is required.
 */
import { deriveEN18223, type DocumentLoader } from "../../scripts/en18223/derive-core.ts";
import rangeIndex from "./range-index.json";
import dppCoreContext from "../../extensions/common/core/context/dpp-core-context.jsonld";
import batterySample from "../../extensions/common/core/examples/en18223-passport.compressed.jsonld";

const range = new Map<string, string>(Object.entries(rangeIndex as Record<string, string>));

const CONTEXTS: Record<string, any> = {
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld": dppCoreContext,
};
const documentLoader: DocumentLoader = async (url: string) => {
  if (CONTEXTS[url]) return { contextUrl: undefined, documentUrl: url, document: CONTEXTS[url] };
  const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
  if (!res.ok) throw new Error(`could not load context ${url}: ${res.status}`);
  return { contextUrl: undefined, documentUrl: url, document: await res.json() };
};

const CORE = "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld";
const gs1 = { gs1: "https://ref.gs1.org/voc/", xsd: "http://www.w3.org/2001/XMLSchema#" };

// Only genuine product data plus the Digital Link identity (and optional
// operator/facility Digital Links). The whole EN 18223 envelope, including
// granularity, schema version, and contentSpecificationIds, is derived.
const sampleModel = {
  "@context": [CORE, gs1],
  type: ["gs1:Product", "DigitalProductPassport"],
  id: "https://id.example.org/01/09506000134352",
  economicOperatorId: "https://id.example.org/417/4012345000009",
  "gs1:productName": [{ "@value": "EcoCell Battery Module IM-500", "@language": "en-GB" }],
  recycledContent: 0.16,
};

const sampleBatch = {
  "@context": [CORE, gs1],
  type: ["gs1:Product", "DigitalProductPassport"],
  id: "https://id.example.org/01/09506000134352/10/LOT-2026-04",
  economicOperatorId: "https://id.example.org/417/4012345000009",
  facilityId: "https://id.example.org/414/4012345000016",
  recycledContent: 0.16,
  preConsumerRecycledContent: 0.04,
  postConsumerRecycledContent: 0.12,
};

const SAMPLES: Record<string, any> = {
  "Battery, item-level (full)": batterySample,
  "Trade item, model-level": sampleModel,
  "Batch / lot-level": sampleBatch,
};

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
    setStatus(`Derived: ${n} top-level elements · granularity "${out.granularity}" · dppStatus "${out.dppStatus}"`, "ok");
  } catch (e: any) {
    outputEl().textContent = "";
    setStatus(`Error: ${e.message}`, "err");
  }
}

function loadSample(name: string) {
  inputEl().value = JSON.stringify(SAMPLES[name], null, 2);
}

function init() {
  const select = $("sample") as unknown as HTMLSelectElement;
  for (const name of Object.keys(SAMPLES)) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.addEventListener("change", () => loadSample(select.value));
  $("derive").addEventListener("click", () => void derive());
  loadSample(Object.keys(SAMPLES)[0]);
  void derive();
}

init();
