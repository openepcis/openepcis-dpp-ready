/**
 * Browser entry for the EC Battery Passport readiness checker. Two engines,
 * both fully client-side:
 *   - structural: the shared matrix walk (scripts/lib/ec-readiness.ts),
 *   - SHACL: rdf-validate-shacl over the generated readiness shapes
 *     (scripts/lib/ec-readiness-shacl-core.ts), with the shapes TTL and the
 *     OpenEPCIS context documents bundled by esbuild so expansion runs offline
 *     (unknown context URLs fall back to fetch — ref.openepcis.io serves CORS).
 * The applicability matrix and passport samples are generated from the repo
 * sources and bundled (see package.json demo:ec-readiness:build).
 */
import {
  evaluateReadiness,
  detectCategory,
  BP_APPLICATION_DATE,
  type Category,
  type Matrix,
  type DataPointResult,
  type Outcome,
  type ApplicabilityStatus,
} from "../../scripts/lib/ec-readiness.ts";
import { validateWithShaclCore } from "../../scripts/lib/ec-readiness-shacl-core.ts";
import matrixJson from "../../extensions/eu/battery/validation/ec-datapoint-applicability.json";
import shapesTtl from "../../extensions/eu/battery/validation/ec-readiness-shapes.ttl";
import modelDoc from "../../extensions/eu/battery/examples/battery-product-model.jsonld";
import batchDoc from "../../extensions/eu/battery/examples/battery-product-batch.jsonld";
import itemDoc from "../../extensions/eu/battery/examples/battery-product.jsonld";
import ebikeDoc from "../../extensions/eu/battery/examples/portable-ebike-battery.jsonld";
import dppCoreContext from "../../extensions/common/core/context/dpp-core-context.jsonld";
import batteryContext from "../../extensions/eu/battery/context/battery-context.jsonld";
import gs1ShortcutsContext from "../../extensions/common/core/context/gs1-shortcuts-context.jsonld";

const matrix = matrixJson as unknown as Matrix;

// ── Offline JSON-LD document loader (bundled contexts, fetch fallback) ───────
const BUNDLED_CONTEXTS: Record<string, unknown> = {
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld": dppCoreContext,
  "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld": batteryContext,
  "https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld": gs1ShortcutsContext,
};
const remoteCache = new Map<string, unknown>();
async function documentLoader(url: string) {
  if (BUNDLED_CONTEXTS[url]) {
    return { contextUrl: undefined, documentUrl: url, document: BUNDLED_CONTEXTS[url] };
  }
  if (!remoteCache.has(url)) {
    const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
    if (!res.ok) throw new Error(`could not load context ${url}: ${res.status}`);
    remoteCache.set(url, await res.json());
  }
  return { contextUrl: undefined, documentUrl: url, document: remoteCache.get(url) };
}

const SAMPLES: Array<{ label: string; docs: unknown[] }> = [
  { label: "Full battery: model + batch + item (industrial)", docs: [modelDoc, batchDoc, itemDoc] },
  { label: "Model passport only (resolver master data)", docs: [modelDoc] },
  { label: "Batch passport only (01+10 Digital Link)", docs: [batchDoc] },
  { label: "Item passport only (01+21, EPCIS-folded)", docs: [itemDoc] },
  { label: "Portable e-bike battery (LMT)", docs: [ebikeDoc] },
  { label: "— paste your own —", docs: [] },
];

/** Regulatory milestones shown on the timeline and as quick-select chips. */
const MILESTONES: Array<{ date: string; label: string; short: string }> = [
  { date: "2026-07-28", label: "EC guidance v1.0 published (Ares(2026)7579758)", short: "Guidance v1.0" },
  { date: BP_APPLICATION_DATE, label: "Battery passport duty begins (BR Art. 77(1))", short: "Passport duty" },
];
const TIMELINE_START = "2026-01-01";
const TIMELINE_END = "2028-12-31";

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const inputEl = () => $("input") as unknown as HTMLTextAreaElement;

const OUTCOME_LABEL: Record<Outcome, string> = {
  fulfilled: "fulfilled",
  missing: "missing",
  conditionOpen: "condition to check",
  optionalAbsent: "optional",
  providedEarly: "provided early",
  notYetRequired: "not yet required",
  notApplicable: "not to be filled",
};

/** Group the 71 data points by their legal block in display order. */
const GROUPS: Array<{ title: string; from: number; to: number }> = [
  { title: "Identification & label data — Art. 77(3), Annex VI Part A (1–16)", from: 1, to: 16 },
  { title: "Public passport data — Annex XIII 1 (17–44)", from: 17, to: 44 },
  { title: "Legitimate interest — Annex XIII 2 (45–49)", from: 45, to: 49 },
  { title: "Notified bodies & authorities — Annex XIII 3 (50)", from: 50, to: 50 },
  { title: "Dynamic, EPCIS-folded — Annex XIII 4 (51–71)", from: 51, to: 71 },
];

function setStatus(msg: string, err = false) {
  const el = $("status");
  el.textContent = msg;
  el.className = err ? "err" : "";
}

function parseInput(): unknown[] {
  const text = inputEl().value.trim();
  if (!text) throw new Error("paste a passport document first");
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function renderResult(r: DataPointResult, shaclMessage?: string): string {
  const badge = `<span class="badge b-${r.outcome}">${OUTCOME_LABEL[r.outcome]}</span>`;
  const chips =
    (r.lifecycle === "dynamic" ? `<span class="chip">dynamic</span>` : "") +
    (r.source ? `<span class="chip">${r.source}</span>` : "");
  let detail = "";
  if (shaclMessage) {
    detail = shaclMessage;
    if (r.lifecycle === "dynamic" && r.epcisExample && r.outcome !== "fulfilled") {
      detail += ` · folded from the EPCIS event stream, see <code>${r.epcisExample}</code>`;
    }
  } else if (r.outcome === "fulfilled") {
    detail = `via ${r.evidence.map((e) => `<code>${e}</code>`).join(", ")}`;
  } else if (r.outcome === "missing" || r.outcome === "conditionOpen") {
    detail = `expected: ${r.expected.map((e) => `<code>${e}</code>`).join(", ")}`;
    if (r.note) detail += ` — ${r.note}`;
    if (r.lifecycle === "dynamic" && r.epcisExample) {
      detail += ` · folded from the EPCIS event stream, see <code>${r.epcisExample}</code>`;
    }
  } else if (r.note) {
    detail = r.note;
  }
  return `<div class="dp o-${r.outcome}">
    <span class="nr">${r.nr}</span>
    <span class="name">${r.name}${chips}</span>
    ${badge}
    ${detail ? `<span class="detail">${detail}</span>` : ""}
  </div>`;
}

function renderChecklist(results: DataPointResult[], shaclMessages?: Map<number, string>) {
  const byNr = new Map(results.map((r) => [r.nr, r]));
  $("results").innerHTML = GROUPS.map((g) => {
    const rows = [];
    for (let nr = g.from; nr <= g.to; nr++) {
      const r = byNr.get(nr)!;
      rows.push(renderResult(r, shaclMessages?.get(nr)));
    }
    return `<div class="group-head">${g.title}</div>${rows.join("")}`;
  }).join("");
}

function showScore(results: DataPointResult[], category: Category, auto: boolean, extra = "") {
  const mandatory = results.filter((r) => r.status === "mandatory").length;
  const fulfilled = results.filter((r) => r.status === "mandatory" && r.outcome === "fulfilled").length;
  const missing = results.filter((r) => r.outcome === "missing").length;
  const conditions = results.filter((r) => r.outcome === "conditionOpen").length;
  const score = mandatory ? fulfilled / mandatory : 0;
  $("scorebox").hidden = false;
  $("legend").hidden = false;
  $("scorefill").style.width = `${Math.round(score * 100)}%`;
  ($("scorefill") as HTMLElement).style.background =
    missing === 0 ? "var(--ok)" : score >= 0.5 ? "var(--warn)" : "var(--err)";
  $("scoretext").textContent =
    `${fulfilled}/${mandatory} mandatory (${category}${auto ? ", auto" : ""})` +
    ` · ${missing} missing · ${conditions} conditions${extra}`;
}

// ── Milestone timeline ────────────────────────────────────────────────────────
const dayMs = 86400000;
const pct = (date: string) => {
  const t0 = Date.parse(TIMELINE_START);
  const t1 = Date.parse(TIMELINE_END);
  const t = Math.min(Math.max(Date.parse(date), t0), t1);
  return ((t - t0) / (t1 - t0)) * 100;
};

function renderTimeline() {
  const asOf = ($("asof") as unknown as HTMLInputElement).value || BP_APPLICATION_DATE;
  const marks = MILESTONES.map(
    (m) => `<div class="tl-mark" style="left:${pct(m.date)}%" title="${m.date} — ${m.label}">
      <span class="tl-dot"></span><span class="tl-label">${m.short}<br><em>${m.date}</em></span>
    </div>`,
  ).join("");
  const inForce = asOf >= BP_APPLICATION_DATE;
  $("timeline").innerHTML = `
    <div class="tl-track">
      <div class="tl-fill" style="width:${pct(BP_APPLICATION_DATE)}%"></div>
      ${marks}
      <div class="tl-asof" style="left:${pct(asOf)}%" title="selected reference date">
        <span class="tl-needle"></span><span class="tl-asof-label">as of<br><em>${asOf}</em></span>
      </div>
    </div>
    <div class="tl-note">${
      inForce
        ? "The battery passport duty is in force on the selected date."
        : `Preparation phase — the duty begins ${BP_APPLICATION_DATE} (${Math.round(
            (Date.parse(BP_APPLICATION_DATE) - Date.parse(asOf)) / dayMs,
          )} days after the selected date). Results read as preparation status.`
    } Carbon footprint (17–19) and instructions for use (44) stay blocked on the pending implementing act / Omnibus IV — no date is set yet.</div>`;
}

// ── Engines ───────────────────────────────────────────────────────────────────
function resolveCategory(docs: unknown[]): { category: Category; auto: boolean } {
  const sel = ($("category") as unknown as HTMLSelectElement).value;
  if (sel !== "auto") return { category: sel as Category, auto: false };
  return { category: detectCategory(docs) ?? "ev", auto: true };
}

function runStructural(docs: unknown[]) {
  const cat = ($("category") as unknown as HTMLSelectElement).value;
  const asOf = ($("asof") as unknown as HTMLInputElement).value || undefined;
  const report = evaluateReadiness(matrix, docs, {
    category: cat === "auto" ? undefined : (cat as Category),
    asOf,
  });
  showScore(report.results, report.category, report.categoryDetected);
  renderChecklist(report.results);
  setStatus(
    report.inForce
      ? `Structural check against EC guidance v${report.document.version} as of ${report.asOf}.`
      : `Structural check — before ${BP_APPLICATION_DATE} the duty is not yet in force.`,
  );
}

async function runShacl(docs: unknown[]) {
  const { category, auto } = resolveCategory(docs);
  const shacl = await validateWithShaclCore(shapesTtl as unknown as string, docs, category, documentLoader);

  // Findings are constraint FAILURES; derive the per-data-point outcome from
  // (status, finding present) so the same checklist rendering applies.
  const failed = new Map<number, string>();
  for (const f of shacl.findings) if (f.dataPoint != null) failed.set(f.dataPoint, f.severity);
  const messages = new Map<number, string>();
  for (const f of shacl.findings) {
    if (f.dataPoint != null) messages.set(f.dataPoint, f.message.replace(/^EC data point \d+ [^:]*: /, ""));
  }
  const results: DataPointResult[] = matrix.dataPoints.map((dp) => {
    const status = dp.applicability[category].status as ApplicabilityStatus;
    const hasFinding = failed.has(dp.nr);
    let outcome: Outcome;
    if (status === "notToBeFilled") outcome = "notApplicable";
    else if (hasFinding)
      outcome =
        status === "mandatory"
          ? "missing"
          : status === "conditional"
            ? "conditionOpen"
            : status === "pending"
              ? "notYetRequired"
              : "optionalAbsent";
    else outcome = status === "pending" ? "providedEarly" : "fulfilled";
    return {
      nr: dp.nr,
      name: dp.name,
      source: dp.source,
      lifecycle: dp.lifecycle,
      accessTier: dp.accessTier,
      status,
      note: dp.applicability[category].note,
      outcome,
      evidence: [],
      expected: dp.implementedBy,
      epcisExample: dp.epcisExample,
    };
  });
  showScore(results, category, auto, ` · SHACL: ${shacl.conforms ? "conforms" : "does not conform"}`);
  const shaclDetails = new Map<number, string>();
  for (const r of results) {
    if (messages.has(r.nr)) shaclDetails.set(r.nr, messages.get(r.nr)!);
    else if (r.outcome === "fulfilled") shaclDetails.set(r.nr, "no finding — constraint satisfied in the RDF graph");
  }
  renderChecklist(results, shaclDetails);
  setStatus(
    `SHACL: ${shacl.shapesActivated} shapes activated (${category}) · engine rdf-validate-shacl · ` +
      `${shacl.conforms ? "conforms" : "does not conform"}`,
  );
}

async function check() {
  try {
    setStatus("Checking…");
    const docs = parseInput();
    const mode = ($("mode") as unknown as HTMLSelectElement).value;
    renderTimeline();
    if (mode === "shacl") await runShacl(docs);
    else runStructural(docs);
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), true);
  }
}

function loadSample(index: number) {
  const sample = SAMPLES[index];
  if (!sample.docs.length) {
    inputEl().value = "";
    inputEl().focus();
    return;
  }
  const value = sample.docs.length === 1 ? sample.docs[0] : sample.docs;
  inputEl().value = JSON.stringify(value, null, 2);
  void check();
}

const sampleEl = $("sample") as unknown as HTMLSelectElement;
for (const [i, s] of SAMPLES.entries()) {
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = s.label;
  sampleEl.appendChild(opt);
}
sampleEl.addEventListener("change", () => loadSample(Number(sampleEl.value)));
$("check").addEventListener("click", () => void check());
($("category") as unknown as HTMLSelectElement).addEventListener("change", () => void check());
($("asof") as unknown as HTMLInputElement).addEventListener("change", () => void check());
($("mode") as unknown as HTMLSelectElement).addEventListener("change", () => void check());
for (const m of MILESTONES) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chipbtn";
  btn.textContent = `${m.short} · ${m.date}`;
  btn.title = m.label;
  btn.addEventListener("click", () => {
    ($("asof") as unknown as HTMLInputElement).value = m.date;
    void check();
  });
  $("datechips").appendChild(btn);
}
{
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chipbtn";
  btn.textContent = "Today";
  btn.addEventListener("click", () => {
    ($("asof") as unknown as HTMLInputElement).value = new Date().toISOString().slice(0, 10);
    void check();
  });
  $("datechips").prepend(btn);
}

renderTimeline();
loadSample(0);
