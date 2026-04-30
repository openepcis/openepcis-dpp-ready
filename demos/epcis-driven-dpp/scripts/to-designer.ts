/**
 * Convert each flows/<flow>.input.json (the API InputTemplate shape that
 * scripts/generate.ts POSTs to /api/generateTestData) into the
 * Drawflow-design shape that
 * https://tools.openepcis.io/ui/event-data-designer/?url=<raw-json> loads.
 *
 * The designer shape wraps each event as
 *   eventNodeInfo[].eventInfo = { ...api event fields, +name, +description, +recordTimeOption, +errorDeclaration }
 * and each identifier as
 *   identifiersNodeInfo[] = { identifiersId, identifierType: "Identifiers", instanceType|classType, ... }
 * plus connectorsInfo[] (input/output edges) and drawflowInfo (Vue Drawflow node positions).
 *
 * Reference: examples/Design Template for GS1 Implementation Guideline examples/*.json in
 * openepcis/epcis-testdata-generator.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readJson, writeJson } from './lib/io.js';
import { FLOWS_DIR } from './lib/env.js';

type RefIdentifier = {
  identifierId: number;
  epcCount: number;
  inheritParentCount: number;
  classCount: number;
  quantity: number;
};

type ApiEvent = {
  nodeId: number;
  eventType: string;
  eventCount: number;
  ordinaryEvent: boolean;
  eventID?: boolean;
  eventIdType?: string;
  action?: string;
  businessStep?: string;
  disposition?: string;
  locationPartyIdentifierSyntax?: string;
  dlURL?: string;
  eventTime: { specificTime: string; timeZoneOffset: string; fromTime?: string; toTime?: string };
  readPoint?: Record<string, unknown>;
  bizLocation?: Record<string, unknown>;
  bizTransactions?: unknown[];
  sources?: unknown[];
  destinations?: unknown[];
  referencedIdentifier?: RefIdentifier[];
  parentReferencedIdentifier?: RefIdentifier | Record<string, never>;
  outputReferencedIdentifier?: RefIdentifier[];
  userExtensions?: unknown[];
  certificationInfo?: unknown[];
  ilmd?: unknown[];
  persistentDispositionList?: unknown[];
  sensorElementList?: unknown[];
};

type ApiIdentifier = {
  identifierId: number;
  objectIdentifierSyntax?: string;
  dlURL?: string;
  instanceData?: Record<string, { identifierType: string }> | null;
  classData?: Record<string, { identifierType: string }> | null;
  parentData?: Record<string, { identifierType: string }> | null;
};

type ApiTemplate = {
  events: ApiEvent[];
  identifiers: ApiIdentifier[];
  contextUrls?: unknown[];
  randomGenerators?: unknown[];
  _comment?: string;
};

/**
 * The Designer UI takes specificTime / fromTime / toTime as a NAIVE local-time
 * string and appends timeZoneOffset itself when it rebuilds an InputTemplate
 * for /api/generateTestData. If the offset is left in specificTime we end up
 * with malformed strings like "2024-03-15T14:30:00.000+01:00+02:00".
 */
const stripTz = (t: string | undefined): string | undefined =>
  t == null ? t : t.replace(/(?:Z|[+-]\d{2}:?\d{2})$/, '');

const DEFAULT_TIME = (api: ApiEvent['eventTime']) => ({
  timeSelector: 'SpecificTime' as const,
  specificTime: stripTz(api.specificTime)!,
  fromTime: stripTz(api.fromTime ?? api.specificTime)!,
  toTime: stripTz(api.toTime ?? api.specificTime)!,
  timeZoneOffset: api.timeZoneOffset,
});

function convert(api: ApiTemplate, flow: string) {
  const eventNodeInfo = api.events.map((e) => ({
    eventId: e.nodeId,
    eventType: e.eventType,
    eventInfo: {
      objectIdentifierSyntax: 'WebURI',
      locationPartyIdentifierSyntax: e.locationPartyIdentifierSyntax ?? 'WebURI',
      dlURL: e.dlURL ?? 'https://id.gs1.org',
      eventCount: e.eventCount,
      eventTime: DEFAULT_TIME(e.eventTime),
      parentIdentifier: [],
      instanceIdentifier: [],
      classIdentifier: [],
      outputInstanceIdentifier: [],
      outputClassIdentifier: [],
      readPoint: e.readPoint ?? {},
      bizLocation: e.bizLocation ?? {},
      persistentDispositionList: e.persistentDispositionList ?? [],
      bizTransactions: e.bizTransactions ?? [],
      sources: e.sources ?? [],
      destinations: e.destinations ?? [],
      sensorElementList: e.sensorElementList ?? [],
      userExtensions: e.userExtensions ?? [],
      certificationInfo: e.certificationInfo ?? [],
      ilmd: e.ilmd ?? [],
      errorDeclaration: {
        declarationTime: DEFAULT_TIME(e.eventTime),
        correctiveIds: [],
        extensions: [],
        declarationReason: 'DID_NOT_OCCUR',
      },
      eventType: e.eventType,
      ordinaryEvent: e.ordinaryEvent,
      eventID: e.eventID ?? false,
      eventIdType: e.eventIdType ?? 'UUID',
      recordTimeOption: 'No',
      ...(e.action ? { action: e.action } : {}),
      businessStep: e.businessStep ?? 'NULL',
      disposition: e.disposition ?? 'NULL',
      // Connector edges (connectorsInfo + drawflowInfo) carry the topology;
      // populating these arrays here makes the Designer duplicate every edge
      // when it rebuilds the InputTemplate on Generate.
      referencedIdentifier: [],
      parentReferencedIdentifier: {},
      outputReferencedIdentifier: [],
      name: `${flow} (event ${e.nodeId})`,
      description: `Auto-converted from flows/${flow}.input.json`,
    },
  }));

  const identifiersNodeInfo = api.identifiers.map((i) => {
    const out: Record<string, unknown> = {
      identifiersId: i.identifierId,
      identifierType: 'Identifiers',
      objectIdentifierSyntax: i.objectIdentifierSyntax ?? 'WebURI',
    };
    if (i.dlURL) out.dlURL = i.dlURL;
    if (i.instanceData) {
      const k = Object.keys(i.instanceData)[0]!;
      out.instanceType = k;
      out.instanceData = (i.instanceData as Record<string, unknown>)[k];
    } else if (i.classData) {
      const k = Object.keys(i.classData)[0]!;
      out.classType = k;
      out.classData = (i.classData as Record<string, unknown>)[k];
    } else if (i.parentData) {
      const k = Object.keys(i.parentData)[0]!;
      out.parentType = k;
      out.parentData = (i.parentData as Record<string, unknown>)[k];
    }
    return out;
  });

  // Connectors: each referencedIdentifier becomes a connector from identifier → event,
  // each outputReferencedIdentifier becomes a connector from identifier → event input_2.
  let connId = 1;
  const connectorsInfo: Array<{
    ID: number;
    name: string;
    source: string;
    target: string;
    hideInheritParentCount: boolean;
    epcCount: number;
    inheritParentCount: number;
    classCount: number;
    quantity: number;
  }> = [];
  const inputConnectionsByEvent = new Map<number, Array<{ node: string; input: string }>>();
  const outputConnectionsByEvent = new Map<number, Array<{ node: string; input: string }>>();
  const identifierOutputs = new Map<number, Array<{ node: string; output: string }>>();

  for (const e of api.events) {
    for (const r of e.referencedIdentifier ?? []) {
      connectorsInfo.push({
        ID: connId++,
        name: `connector${connectorsInfo.length + 1}`,
        source: String(r.identifierId),
        target: String(e.nodeId),
        hideInheritParentCount: false,
        epcCount: r.epcCount,
        inheritParentCount: r.inheritParentCount,
        classCount: r.classCount,
        quantity: r.quantity,
      });
      const ic = inputConnectionsByEvent.get(e.nodeId) ?? [];
      ic.push({ node: String(r.identifierId), input: 'output_1' });
      inputConnectionsByEvent.set(e.nodeId, ic);
      const oc = identifierOutputs.get(r.identifierId) ?? [];
      oc.push({ node: String(e.nodeId), output: 'input_1' });
      identifierOutputs.set(r.identifierId, oc);
    }
    for (const r of e.outputReferencedIdentifier ?? []) {
      connectorsInfo.push({
        ID: connId++,
        name: `connector${connectorsInfo.length + 1}`,
        source: String(r.identifierId),
        target: String(e.nodeId),
        hideInheritParentCount: false,
        epcCount: r.epcCount,
        inheritParentCount: r.inheritParentCount,
        classCount: r.classCount,
        quantity: r.quantity,
      });
      const oc = outputConnectionsByEvent.get(e.nodeId) ?? [];
      oc.push({ node: String(r.identifierId), input: 'output_1' });
      outputConnectionsByEvent.set(e.nodeId, oc);
      const idOut = identifierOutputs.get(r.identifierId) ?? [];
      idOut.push({ node: String(e.nodeId), output: 'input_2' });
      identifierOutputs.set(r.identifierId, idOut);
    }
  }

  // Drawflow auto-layout. Identifiers go in a column on the left; events lay
  // out in a grid on the right whose width grows when the design has many
  // events (so an 8-event lifecycle stays within a normal viewport).
  const drawflowData: Record<string, unknown> = {};
  let posY = 100;
  for (const i of api.identifiers) {
    drawflowData[String(i.identifierId)] = {
      id: i.identifierId,
      name: 'Identifiers',
      data: { ID: i.identifierId, eventType: 'Identifiers' },
      class: 'Identifiers',
      html: 'Identifiers',
      typenode: 'vue',
      inputs: {},
      outputs: { output_1: { connections: identifierOutputs.get(i.identifierId) ?? [] } },
      pos_x: 200,
      pos_y: posY,
    };
    posY += 120;
  }

  const eventCount = api.events.length;
  const eventCols = eventCount <= 4 ? 1 : eventCount <= 8 ? 2 : 3;
  const colSpacing = 320;
  const rowSpacing = 200;
  const baseX = 800;
  const baseY = 120;
  api.events.forEach((e, idx) => {
    const col = Math.floor(idx / Math.ceil(eventCount / eventCols));
    const row = idx % Math.ceil(eventCount / eventCols);
    drawflowData[String(e.nodeId)] = {
      id: e.nodeId,
      name: 'Events',
      data: { ID: e.nodeId, eventType: e.eventType },
      class: e.eventType,
      html: 'Events',
      typenode: 'vue',
      inputs: {
        input_1: { connections: inputConnectionsByEvent.get(e.nodeId) ?? [] },
        input_2: { connections: outputConnectionsByEvent.get(e.nodeId) ?? [] },
      },
      outputs: { output_1: { connections: [] } },
      pos_x: baseX + col * colSpacing,
      pos_y: baseY + row * rowSpacing,
    };
  });

  const designer: Record<string, unknown> = {
    eventNodeInfo,
    identifiersNodeInfo,
    connectorsInfo,
    drawflowInfo: { drawflow: { Home: { data: drawflowData } } },
  };
  if (api.contextUrls && api.contextUrls.length > 0) designer.contextUrls = api.contextUrls;
  if (api.randomGenerators && api.randomGenerators.length > 0)
    designer.randomGenerators = api.randomGenerators;

  return designer;
}

const cliArgs = process.argv.slice(2);
const flowFilter = new Set(cliArgs);
const apiFiles = readdirSync(FLOWS_DIR)
  .filter((f) => f.endsWith('.input.json') && !f.includes('designer'))
  .filter((f) => flowFilter.size === 0 || flowFilter.has(f.replace(/\.input\.json$/, '')));

for (const f of apiFiles) {
  const flow = f.replace(/\.input\.json$/, '');
  const apiPath = resolve(FLOWS_DIR, f);
  const designerPath = resolve(FLOWS_DIR, 'designer', `${flow}.designer.json`);
  const api = readJson<ApiTemplate>(apiPath);
  const designer = convert(api, flow);
  writeJson(designerPath, designer);
  console.log(`converted ${f} → designer/${flow}.designer.json`);
}
