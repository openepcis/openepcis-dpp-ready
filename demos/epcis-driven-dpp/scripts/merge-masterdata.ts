import { resolve } from 'node:path';
import { writeJson, readJson } from './lib/io.js';
import { ALL_FLOWS, FLOWS_DIR, OUT_DIR, SIDECAR_FOR_FLOW, type FlowName } from './lib/env.js';

type MasterDataCard = Record<string, unknown> & { id?: string; type?: string };
type Sidecar = { masterData?: MasterDataCard[] };
type EPCISDoc = {
  '@context'?: unknown;
  epcisBody?: { eventList?: Record<string, unknown>[] };
};

const GS1_PREFIX = 'gs1:';

/**
 * Inside an EPCIS event's masterDataAvailableFor, the EPCIS JSON-LD context's
 * @vocab makes the gs1: prefix implicit — keys, type-values, and id-values
 * that were authored as `gs1:Foo` must be emitted bare (`Foo`) so they expand
 * to the same gs1:Foo IRI without the user having to redeclare the prefix.
 *
 * Other prefixes (battery:, textile:, dpp:) MUST keep their prefix:
 * the EPCIS context does not define them. See
 * extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md §2A.
 */
function stripGs1Prefix(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.startsWith(GS1_PREFIX) ? value.slice(GS1_PREFIX.length) : value;
  }
  if (Array.isArray(value)) return value.map(stripGs1Prefix);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      const newKey = key.startsWith(GS1_PREFIX) ? key.slice(GS1_PREFIX.length) : key;
      out[newKey] = stripGs1Prefix(v);
    }
    return out;
  }
  return value;
}

function transformCardForEvent(card: MasterDataCard): MasterDataCard {
  return stripGs1Prefix(card) as MasterDataCard;
}

async function merge(flow: FlowName): Promise<void> {
  const rawPath = resolve(OUT_DIR, `${flow}.raw.jsonld`);
  const finalPath = resolve(OUT_DIR, `${flow}.final.jsonld`);
  const sidecarFlow = SIDECAR_FOR_FLOW[flow];

  const doc = readJson<EPCISDoc>(rawPath);

  if (sidecarFlow) {
    const sidecarPath = resolve(FLOWS_DIR, `${sidecarFlow}.masterdata.jsonld`);
    const sidecar = readJson<Sidecar>(sidecarPath);
    const cards = (sidecar.masterData ?? []).map(transformCardForEvent);

    const eventList = doc.epcisBody?.eventList ?? [];
    if (eventList.length === 0) {
      throw new Error(`merge(${flow}): generated document has no events`);
    }
    for (const event of eventList) {
      event.masterDataAvailableFor = cards;
    }
    console.log(`merge ${flow}: spliced ${cards.length} cards into ${eventList.length} event(s)`);
  } else {
    console.log(`merge ${flow}: no sidecar (lifecycle event reuses already-registered master data)`);
  }

  writeJson(finalPath, doc);
  console.log(`wrote ${finalPath}`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? (args as FlowName[]) : ALL_FLOWS;
for (const flow of targets) await merge(flow);
