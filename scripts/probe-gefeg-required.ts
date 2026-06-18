/**
 * Probe the live GEFEG ValidateJSON server for each category's complete
 * required-property set, by validating an empty-groups document and reading the
 * "Required properties [...]" errors. Use this to refresh the REQUIRED sets in
 * scripts/build-gefeg-live-schema.ts when GEFEG updates the model.
 *
 * Token: same options as scripts/validate-batterypass-live.ts
 *   BPASS_TOKEN=…  |  BPASS_CODE=… BPASS_VERIFIER=…  |  BPASS_USER=… BPASS_PASSWORD=…
 *
 * Usage: BPASS_TOKEN=… tsx scripts/probe-gefeg-required.ts
 */

const BASE = "https://batterypass-ready.gefeg.com/automation-console/api/ValidateJSON";
const REALM_URL = process.env.BPASS_REALM_URL ?? "https://batterypass-ready.gefeg.com/auth/realms/batterypass";
const CLIENT_ID = process.env.BPASS_CLIENT_ID ?? "batterypass-ui";

const CATEGORIES = [
  { rootKey: "EV", tag: "EV_BatteryPass" },
  { rootKey: "LMT", tag: "LMT_BatteryPass" },
  { rootKey: "OtherIndustrial2kWh", tag: "Other_Industrial_BatteryPass" },
  { rootKey: "StationaryIndustrial2kWh", tag: "Stationary_Industrial_BatteryPass" },
];
const GROUPS = [
  "IdentifiersAndProductData", "PerformanceAndDurability", "CircularityAndResourceEfficiency",
  "BatteryMaterialsAndComposition", "BatteryCarbonFootprint", "SupplyChainDueDiligence",
  "SymbolsLabelsAndDocumentationOfConformity",
];

async function token(): Promise<string> {
  if (process.env.BPASS_TOKEN) return process.env.BPASS_TOKEN;
  const form = new URLSearchParams({ client_id: CLIENT_ID });
  if (process.env.BPASS_CODE && process.env.BPASS_VERIFIER) {
    form.set("grant_type", "authorization_code");
    form.set("code", process.env.BPASS_CODE);
    form.set("code_verifier", process.env.BPASS_VERIFIER);
    form.set("redirect_uri", process.env.BPASS_REDIRECT_URI ?? "https://batterypass-ready.gefeg.com/");
  } else if (process.env.BPASS_USER && process.env.BPASS_PASSWORD) {
    form.set("grant_type", "password");
    form.set("username", process.env.BPASS_USER);
    form.set("password", process.env.BPASS_PASSWORD);
    form.set("scope", "openid");
  } else {
    throw new Error("Provide BPASS_TOKEN, or BPASS_CODE+BPASS_VERIFIER, or BPASS_USER+BPASS_PASSWORD.");
  }
  const res = await fetch(`${REALM_URL}/protocol/openid-connect/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form,
  });
  const j = (await res.json()) as { access_token?: string };
  if (!j.access_token) throw new Error(`token failed: ${JSON.stringify(j).slice(0, 300)}`);
  return j.access_token;
}

async function main() {
  const t = await token();
  const body = JSON.stringify(Object.fromEntries(GROUPS.map((g) => [g, {}])));
  for (const c of CATEGORIES) {
    const url = `${BASE}?tag=${c.tag}&version=1.0&variant=${encodeURIComponent('""')}&language=EN`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "text/plain;charset=UTF-8" },
      body: `{"${c.rootKey}":${body}}`,
    });
    const xml = await res.text();
    console.log(`\n===== ${c.tag} (root ${c.rootKey}) =====`);
    for (const m of xml.matchAll(/<Error\b[^>]*>([\s\S]*?)<\/Error>/g)) {
      const b = m[1];
      const msg = (b.match(/<Message>([\s\S]*?)<\/Message>/)?.[1] ?? "").replace(/&quot;/g, '"').replace(/[\r\n]+/g, " ").trim();
      const xp = (b.match(/<XPath>([\s\S]*?)<\/XPath>/)?.[1] ?? "").trim().replace(/^#\/[^/]+\//, "");
      console.log(`  [${xp}] ${msg}`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
