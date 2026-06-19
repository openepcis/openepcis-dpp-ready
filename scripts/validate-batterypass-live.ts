/**
 * Call the live GEFEG BatteryPass-Ready validation API from the CLI.
 *
 * The web UI POSTs the uploaded passport to:
 *   POST /automation-console/api/ValidateJSON?tag=<TAG>&version=<V>&variant=""&language=EN
 * with an `Authorization: Bearer <token>` header (the logged-in Keycloak
 * session token). The static .json schemas mirrored under docs/reference are
 * lenient, but this server-side endpoint additionally enforces `required`
 * properties — so this is the authoritative conformance check.
 *
 * The bearer token is YOUR session credential. Provide it one of two ways:
 *   1. Directly:  BPASS_TOKEN=eyJ...
 *   2. Let the script fetch one from Keycloak with your login:
 *        BPASS_USER=you@example.com BPASS_PASSWORD=…
 *      (realm/client default to the GEFEG values; override with BPASS_REALM_URL
 *      and BPASS_CLIENT_ID if they change.)
 * Pass credentials via env, never on the command line.
 *
 * Usage:
 *   BPASS_TOKEN=eyJ... tsx scripts/validate-batterypass-live.ts <file.json> [tag] [version]
 *   BPASS_USER=… BPASS_PASSWORD=… tsx scripts/validate-batterypass-live.ts <file.json> [tag] [version]
 *
 * Defaults: tag=Other_Industrial_BatteryPass version=1.0
 * Tags: EV_BatteryPass | LMT_BatteryPass | Other_Industrial_BatteryPass | Stationary_Industrial_BatteryPass
 */

import { readFileSync } from "fs";

const BASE = "https://batterypass-ready.gefeg.com/automation-console/api/ValidateJSON";
const REALM_URL =
  process.env.BPASS_REALM_URL ??
  "https://batterypass-ready.gefeg.com/auth/realms/batterypass";
const CLIENT_ID = process.env.BPASS_CLIENT_ID ?? "batterypass-ui";

/**
 * Resource-Owner-Password-Credentials grant against the GEFEG Keycloak realm.
 * Returns the access_token. Throws with the server detail on failure (e.g. the
 * public client may not have direct-access-grants enabled, in which case fall
 * back to BPASS_TOKEN copied from DevTools).
 */
async function fetchToken(user: string, password: string): Promise<string> {
  const tokenUrl = `${REALM_URL}/protocol/openid-connect/token`;
  const form = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    username: user,
    password,
    scope: "openid",
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Keycloak token request failed: HTTP ${res.status} ${res.statusText} — ${text.slice(0, 400)}\n` +
        `If this says the grant is not allowed, set BPASS_TOKEN from DevTools instead.`
    );
  }
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error(`No access_token in Keycloak response: ${text.slice(0, 400)}`);
  return json.access_token;
}

/**
 * Authorization-Code + PKCE token exchange. The `batterypass-ui` public client
 * only allows this flow (direct password grants are disabled), so the `code`
 * must first be obtained by hitting the authorize endpoint in an
 * already-authenticated browser session (see scripts/get-batterypass-code.* or
 * the README). Supply the resulting code + the matching verifier here.
 */
async function fetchTokenByCode(code: string, verifier: string, redirectUri: string): Promise<string> {
  const tokenUrl = `${REALM_URL}/protocol/openid-connect/token`;
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Keycloak code exchange failed: HTTP ${res.status} ${res.statusText} — ${text.slice(0, 400)}`);
  }
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error(`No access_token in Keycloak response: ${text.slice(0, 400)}`);
  return json.access_token;
}

async function resolveToken(): Promise<string> {
  if (process.env.BPASS_TOKEN) return process.env.BPASS_TOKEN;
  if (process.env.BPASS_CODE && process.env.BPASS_VERIFIER) {
    const redirectUri = process.env.BPASS_REDIRECT_URI ?? "https://batterypass-ready.gefeg.com/#/battery-validation";
    console.error("Exchanging authorization code for token…");
    return fetchTokenByCode(process.env.BPASS_CODE, process.env.BPASS_VERIFIER, redirectUri);
  }
  const user = process.env.BPASS_USER;
  const password = process.env.BPASS_PASSWORD;
  if (user && password) {
    console.error(`Fetching token from Keycloak (${REALM_URL}, client ${CLIENT_ID})…`);
    return fetchToken(user, password);
  }
  throw new Error(
    "Provide BPASS_TOKEN, or BPASS_CODE + BPASS_VERIFIER (PKCE), or BPASS_USER + BPASS_PASSWORD."
  );
}

async function main() {
  const [file, tag = "Other_Industrial_BatteryPass", version = "1.0"] = process.argv.slice(2);
  if (!file) {
    console.error("usage: (BPASS_TOKEN=… | BPASS_USER=… BPASS_PASSWORD=…) tsx scripts/validate-batterypass-live.ts <file.json> [tag] [version]");
    process.exit(2);
  }
  const token = await resolveToken();

  const body = readFileSync(file, "utf-8");
  const url = `${BASE}?tag=${encodeURIComponent(tag)}&version=${encodeURIComponent(version)}&variant=${encodeURIComponent('""')}&language=EN`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // The endpoint rejects application/json (415); it expects the passport as
      // a plain-text body.
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "*/*",
    },
    body,
  });

  const text = await res.text();
  console.log(`POST ${url}`);
  console.log(`HTTP ${res.status} ${res.statusText}`);
  if (res.status === 401 || res.status === 403) {
    console.error("Unauthorized — the bearer token is missing/expired. Refresh it from DevTools and retry.");
    process.exit(1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.log(text.slice(0, 4000));
    return;
  }

  // The response carries a GEFEG validation protocol as an XML string.
  const xml: string | undefined = parsed.validationLogXml ?? parsed.ValidationLogXml;
  if (typeof xml === "string") {
    const errors = [...xml.matchAll(/<Error\b[^>]*>([\s\S]*?)<\/Error>/g)].map((m) => {
      const block = m[1];
      const msg = (block.match(/<Message>([\s\S]*?)<\/Message>/)?.[1] ?? "").trim();
      const xpath = (block.match(/<XPath>([\s\S]*?)<\/XPath>/)?.[1] ?? "").trim();
      const level = (block.match(/<ErrorLevel>([\s\S]*?)<\/ErrorLevel>/)?.[1] ?? "").trim();
      return { msg: decodeEntities(msg), xpath, level };
    });
    if (!errors.length) {
      console.log("\n✅ VALID — no errors reported by the GEFEG validator.");
      return;
    }
    console.log(`\n❌ ${errors.length} error(s) from the GEFEG validator:`);
    for (const e of errors) {
      console.log(`  [${e.level}] ${e.xpath}`);
      console.log(`        ${e.msg}`);
    }
    return;
  }

  console.log("Unrecognised response shape:");
  console.log(JSON.stringify(parsed, null, 2).slice(0, 4000));
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
