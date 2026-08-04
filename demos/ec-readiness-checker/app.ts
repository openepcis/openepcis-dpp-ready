/**
 * Browser entry for the EC Battery Passport readiness checker. Runs the shared
 * evaluation core (scripts/lib/ec-readiness.ts) entirely client-side against
 * the bundled data-point applicability matrix (generated from the EC guidance
 * Ares(2026)7579758 by scripts/build-ec-guidance-vocab.ts). The passport
 * samples are the repo's battery examples, bundled by esbuild
 * (see package.json demo:ec-readiness:build), so the demo runs with no network.
 */
import {
  evaluateReadiness,
  type Category,
  type Matrix,
  type DataPointResult,
  type Outcome,
} from "../../scripts/lib/ec-readiness.ts";
import matrixJson from "../../extensions/eu/battery/validation/ec-datapoint-applicability.json";
import modelDoc from "../../extensions/eu/battery/examples/battery-product-model.jsonld";
import batchDoc from "../../extensions/eu/battery/examples/battery-product-batch.jsonld";
import itemDoc from "../../extensions/eu/battery/examples/battery-product.jsonld";
import ebikeDoc from "../../extensions/eu/battery/examples/portable-ebike-battery.jsonld";

const matrix = matrixJson as unknown as Matrix;

const SAMPLES: Array<{ label: string; docs: unknown[] }> = [
  { label: "Full battery: model + batch + item (industrial)", docs: [modelDoc, batchDoc, itemDoc] },
  { label: "Model passport only (resolver master data)", docs: [modelDoc] },
  { label: "Batch passport only (01+10 Digital Link)", docs: [batchDoc] },
  { label: "Item passport only (01+21, EPCIS-folded)", docs: [itemDoc] },
  { label: "Portable e-bike battery (LMT)", docs: [ebikeDoc] },
  { label: "— paste your own —", docs: [] },
];

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

function renderResult(r: DataPointResult): string {
  const badge = `<span class="badge b-${r.outcome}">${OUTCOME_LABEL[r.outcome]}</span>`;
  const chips =
    (r.lifecycle === "dynamic" ? `<span class="chip">dynamic</span>` : "") +
    (r.source ? `<span class="chip">${r.source}</span>` : "");
  let detail = "";
  if (r.outcome === "fulfilled") {
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

function check() {
  try {
    setStatus("Checking…");
    const docs = parseInput();
    const cat = ($("category") as unknown as HTMLSelectElement).value;
    const asOf = ($("asof") as unknown as HTMLInputElement).value || undefined;
    const report = evaluateReadiness(matrix, docs, {
      category: cat === "auto" ? undefined : (cat as Category),
      asOf,
    });

    const s = report.summary;
    $("scorebox").hidden = false;
    $("legend").hidden = false;
    $("scorefill").style.width = `${Math.round(s.score * 100)}%`;
    ($("scorefill") as HTMLElement).style.background =
      s.missing === 0 ? "var(--ok)" : s.score >= 0.5 ? "var(--warn)" : "var(--err)";
    $("scoretext").textContent =
      `${s.fulfilled}/${s.mandatory} mandatory (${report.category}${report.categoryDetected ? ", auto" : ""})` +
      ` · ${s.missing} missing · ${s.conditionOpen} conditions`;

    const byNr = new Map(report.results.map((r) => [r.nr, r]));
    $("results").innerHTML = GROUPS.map((g) => {
      const rows = [];
      for (let nr = g.from; nr <= g.to; nr++) rows.push(renderResult(byNr.get(nr)!));
      return `<div class="group-head">${g.title}</div>${rows.join("")}`;
    }).join("");

    setStatus(
      report.inForce
        ? `Checked against EC guidance v${report.document.version} as of ${report.asOf}.`
        : `Before 2027-02-18 — the passport duty is not yet in force; this is your preparation status.`,
    );
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
  check();
}

const sampleEl = $("sample") as unknown as HTMLSelectElement;
for (const [i, s] of SAMPLES.entries()) {
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = s.label;
  sampleEl.appendChild(opt);
}
sampleEl.addEventListener("change", () => loadSample(Number(sampleEl.value)));
$("check").addEventListener("click", check);
($("category") as unknown as HTMLSelectElement).addEventListener("change", check);
($("asof") as unknown as HTMLInputElement).addEventListener("change", check);

loadSample(0);
