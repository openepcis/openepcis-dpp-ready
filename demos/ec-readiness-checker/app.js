// scripts/lib/ec-readiness.ts
var BP_APPLICATION_DATE = "2027-02-18";
function collectFacts(docs) {
  const facts = { keys: /* @__PURE__ */ new Set(), types: /* @__PURE__ */ new Set(), ids: [], strings: [] };
  const walk = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== "object") {
      if (typeof node === "string") facts.strings.push(node);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      facts.keys.add(key);
      if (key === "type" || key === "@type") {
        for (const t of Array.isArray(value) ? value : [value]) {
          if (typeof t === "string") facts.types.add(t);
        }
      }
      if ((key === "id" || key === "@id") && typeof value === "string") {
        facts.ids.push(value);
      }
      walk(value);
    }
  };
  for (const doc of docs) walk(doc);
  return facts;
}
var localName = (curie) => curie.split(":").pop() ?? curie;
var isClassCurie = (curie) => /^[A-Z]/.test(localName(curie));
var DL_PRODUCT = /\/01\/\d{8,14}(?:\/(?:10|21)\/[^/?#]+)?/;
function termEvidence(curie, facts) {
  const bare = localName(curie);
  if (isClassCurie(curie)) {
    if (facts.types.has(curie)) return curie;
    if (facts.types.has(bare)) return `${bare} (bare type)`;
    return null;
  }
  if (facts.keys.has(curie)) return curie;
  if (facts.keys.has(bare)) return `${bare} (bare key)`;
  return null;
}
function detectCategory(docs) {
  const facts = collectFacts(docs);
  const typeHit = (name) => facts.types.has(`eubat:${name}`) || facts.types.has(name);
  if (typeHit("EVBattery")) return "ev";
  if (typeHit("LMTBattery")) return "lmt";
  if (typeHit("IndustrialBattery") || typeHit("StationaryBattery")) return "industrial";
  const text = facts.strings.join(" ").toLowerCase();
  if (/\bev ?battery|electric vehicle batter/.test(text)) return "ev";
  if (/\blmt ?battery|light means of transport/.test(text)) return "lmt";
  if (/\bindustrial ?batter|stationary batter/.test(text)) return "industrial";
  return null;
}
function evaluateReadiness(matrix2, docs, options = {}) {
  const detected = detectCategory(docs);
  const category = options.category ?? detected ?? "ev";
  const asOf = options.asOf ?? BP_APPLICATION_DATE;
  const facts = collectFacts(docs);
  const hasDigitalLinkId = facts.ids.some((id) => DL_PRODUCT.test(id));
  const results = matrix2.dataPoints.map((dp) => {
    const applicability = dp.applicability[category];
    const evidence = [];
    for (const term of dp.implementedBy) {
      const hit = termEvidence(term, facts);
      if (hit) evidence.push(hit);
    }
    if ((dp.nr === 1 || dp.nr === 7) && hasDigitalLinkId) {
      evidence.push("GS1 Digital Link id");
    }
    const present = evidence.length > 0;
    let outcome;
    switch (applicability.status) {
      case "mandatory":
        outcome = present ? "fulfilled" : "missing";
        break;
      case "optional":
        outcome = present ? "fulfilled" : "optionalAbsent";
        break;
      case "conditional":
        outcome = present ? "fulfilled" : "conditionOpen";
        break;
      case "pending":
        outcome = present ? "providedEarly" : "notYetRequired";
        break;
      case "notToBeFilled":
        outcome = "notApplicable";
        break;
    }
    return {
      nr: dp.nr,
      name: dp.name,
      source: dp.source,
      lifecycle: dp.lifecycle,
      accessTier: dp.accessTier,
      status: applicability.status,
      note: applicability.note,
      outcome,
      evidence,
      expected: dp.implementedBy,
      epcisExample: dp.epcisExample
    };
  });
  const count = (o) => results.filter((r) => r.outcome === o).length;
  const mandatory = results.filter((r) => r.status === "mandatory").length;
  const fulfilledMandatory = results.filter(
    (r) => r.status === "mandatory" && r.outcome === "fulfilled"
  ).length;
  return {
    category,
    categoryDetected: options.category == null && detected != null,
    asOf,
    inForce: asOf >= BP_APPLICATION_DATE,
    document: matrix2.document,
    results,
    summary: {
      mandatory,
      fulfilled: fulfilledMandatory,
      missing: count("missing"),
      conditionOpen: count("conditionOpen"),
      providedEarly: count("providedEarly"),
      notYetRequired: count("notYetRequired"),
      score: mandatory ? fulfilledMandatory / mandatory : 0
    }
  };
}

// extensions/eu/battery/validation/ec-datapoint-applicability.json
var ec_datapoint_applicability_default = {
  $comment: "GENERATED from vocab/ec-guidance-datapoints.json by scripts/build-ec-guidance-vocab.ts - do not edit. Per-category applicability of the 71 EC Battery Passport guidance data points as of February 2027, with the operative OpenEPCIS/GS1 terms per data point. Statuses: mandatory | optional | conditional | notToBeFilled | pending (blocked on an upcoming implementing act / Omnibus IV).",
  document: {
    title: "Guidance Document: Digital Batteries Passport - data points by category",
    version: "1.0",
    issued: "2026-07-28",
    publisher: "European Commission, DG Internal Market, Industry, Entrepreneurship and SMEs (Unit G2)",
    reference: "Ares(2026)7579758",
    license: "https://creativecommons.org/licenses/by/4.0/",
    regulation: "http://data.europa.eu/eli/reg/2023/1542/oj"
  },
  namespace: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#",
  categories: [
    "ev",
    "lmt",
    "industrial"
  ],
  dataPoints: [
    {
      nr: 1,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-01",
      name: "Unique identifier",
      source: "BR Article 77 (3)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:batteryPassportIdentifier"
      ]
    },
    {
      nr: 2,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-02",
      name: "Identity of who is registering and/or is responsible for the battery passport",
      source: "BR Article 77 (3)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:operatorInformation",
        "eubat:operatorIdentifier",
        "eubat:operatorRole"
      ]
    },
    {
      nr: 3,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-03",
      name: "Manufacturer name, registered trade name or registered trade mark",
      source: "BR Annex VI A (1)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "gs1:manufacturer",
        "gs1:organizationName"
      ]
    },
    {
      nr: 4,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-04",
      name: "Manufacturer postal address, indicating a single contact point",
      source: "BR Annex VI A (1)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "gs1:address",
        "gs1:PostalAddress"
      ]
    },
    {
      nr: 5,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-05",
      name: "If available, manufacturer web and email address",
      source: "BR Annex VI A (1)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "optional",
          note: "optional, to be filled if such data is available"
        },
        lmt: {
          status: "optional",
          note: "optional, to be filled if such data is available"
        },
        industrial: {
          status: "optional",
          note: "optional, to be filled if such data is available"
        }
      },
      implementedBy: [
        "gs1:contactPoint",
        "gs1:ContactPoint"
      ]
    },
    {
      nr: 6,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-06",
      name: "Battery category",
      source: "BR Annex VI A (2)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:BatteryCategory",
        "schema:category"
      ]
    },
    {
      nr: 7,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-07",
      name: "Model identification and batch or serial number, or product number or another element allowing their identification",
      source: "BR Annex VI A (2)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:batteryModelIdentifier",
        "gs1:hasSerialNumber"
      ]
    },
    {
      nr: 8,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-08",
      name: "The place of manufacturer (geographical location of a battery manufacturing plant)",
      source: "BR Annex VI A (3)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:manufacturingPlace",
        "eubat:facilityIdentifier"
      ]
    },
    {
      nr: 9,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-09",
      name: "The date of manufacturing (month and year)",
      source: "BR Annex VI A (4)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "gs1:productionDate"
      ]
    },
    {
      nr: 10,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-10",
      name: "The weight",
      source: "BR Annex VI A (5)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:batteryMass",
        "gs1:netWeight"
      ]
    },
    {
      nr: 11,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-11",
      name: "The capacity",
      source: "BR Annex VI A (6)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:ratedCapacity"
      ]
    },
    {
      nr: 12,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-12",
      name: "The chemistry",
      source: "BR Annex VI A (7)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:batteryChemistry"
      ]
    },
    {
      nr: 13,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-13",
      name: "The hazardous substances present in the battery, other than mercury, cadmium or lead",
      source: "BR Annex VI A (8)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:hazardousSubstances",
        "eubat:HazardousSubstance"
      ]
    },
    {
      nr: 14,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-14",
      name: "Usable extinguishing agent",
      source: "BR Annex VI A (9)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:extinguishingAgent"
      ]
    },
    {
      nr: 15,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-15",
      name: "Critical raw materials present in the battery in a concentration of more than 0,1 % weight by weight",
      source: "BR Annex VI A (10)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:isCriticalRawMaterial",
        "eubat:criticalRawMaterialsStatement"
      ]
    },
    {
      nr: 16,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-16",
      name: "The material composition of the battery, including its chemistry, hazardous substances present in the battery, other than mercury, cadmium or lead, and critical raw materials present in the battery",
      source: null,
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        industrial: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        }
      },
      implementedBy: [
        "eubat:materialComposition"
      ]
    },
    {
      nr: 17,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-17",
      name: "The carbon footprint declaration",
      source: "BR Annex XIII 1 (c)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        lmt: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        industrial: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        }
      },
      implementedBy: [
        "eubat:carbonFootprintDeclaration",
        "eubat:CarbonFootprintDeclaration"
      ]
    },
    {
      nr: 18,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-18",
      name: "The carbon footprint label",
      source: "BR Annex XIII 1 (c)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        lmt: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        industrial: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        }
      },
      implementedBy: [
        "eubat:carbonFootprintPerformanceClass"
      ]
    },
    {
      nr: 19,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-19",
      name: "Information on responsible sourcing as indicated in the report on battery due diligence policy referred to in Article 52(3)",
      source: "BR Annex XIII 1 (d)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        lmt: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        },
        industrial: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act"
        }
      },
      implementedBy: [
        "eubat:supplyChainDueDiligence",
        "eubat:dueDiligenceReportUrl"
      ]
    },
    {
      nr: 20,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-20",
      name: "Percentage share of cobalt that is present in active materials and that has been recovered from battery manufacturing waste or post-consumer waste",
      source: "BR Annex XIII 1 (e)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:cobaltRecycledShare"
      ]
    },
    {
      nr: 21,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-21",
      name: "Percentage share of lithium that is present in active materials and that has been recovered from battery manufacturing waste or post-consumer waste",
      source: "BR Annex XIII 1 (e)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:lithiumRecycledShare"
      ]
    },
    {
      nr: 22,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-22",
      name: "Percentage share of nickel that is present in active materials and that has been recovered from battery manufacturing waste or post-consumer waste",
      source: "BR Annex XIII 1 (e)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:nickelRecycledShare"
      ]
    },
    {
      nr: 23,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-23",
      name: "The percentage share of lead that is present in the battery and that has been recovered from waste",
      source: "BR Annex XIII 1 (e)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:leadRecycledShare"
      ]
    },
    {
      nr: 24,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-24",
      name: "The share of renewable content",
      source: "BR Annex XIII 1 (f)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:renewableContentShare"
      ]
    },
    {
      nr: 25,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-25",
      name: "Rated capacity (in Ah)",
      source: "BR Annex XIII 1 (g)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        industrial: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        }
      },
      implementedBy: [
        "eubat:ratedCapacity"
      ]
    },
    {
      nr: 26,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-26",
      name: "Minimal voltage, with temperature range when relevant",
      source: "BR Annex XIII 1 (h)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:minimumVoltage"
      ]
    },
    {
      nr: 27,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-27",
      name: "Nominal voltage, with temperature range when relevant",
      source: "BR Annex XIII 1 (h)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:nominalVoltage"
      ]
    },
    {
      nr: 28,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-28",
      name: "Maximum voltage, with temperature range when relevant",
      source: "BR Annex XIII 1 (h)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:maximumVoltage"
      ]
    },
    {
      nr: 29,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-29",
      name: "Original power capability (in Watts)",
      source: "BR Annex XIII 1 (i)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:originalPowerCapability"
      ]
    },
    {
      nr: 30,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-30",
      name: "Power limits, with temperature range when relevant",
      source: "BR Annex XIII 1 (i)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:maximumPermittedBatteryPower",
        "eubat:maximumChargingPower",
        "eubat:maximumDischargingPower"
      ]
    },
    {
      nr: 31,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-31",
      name: "Expected battery lifetime expressed in cycles",
      source: "BR Annex XIII 1 (j)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "only applicable for some industrial batteries where lifetime can be expressed in cycles"
        }
      },
      implementedBy: [
        "eubat:expectedNumberOfCycles",
        "eubat:expectedCycleLife"
      ]
    },
    {
      nr: 32,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-32",
      name: "Reference test used for expected battery lifetime expressed in cycles",
      source: "BR Annex XIII 1 (j)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "only applicable for some industrial batteries where lifetime can be expressed in cycles"
        }
      },
      implementedBy: [
        "eubat:lifetimeReferenceTest"
      ]
    },
    {
      nr: 33,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-33",
      name: "Capacity threshold for exhaustion",
      source: "BR Annex XIII 1 (k)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        industrial: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        }
      },
      implementedBy: [
        "eubat:capacityThresholdForExhaustion"
      ]
    },
    {
      nr: 34,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-34",
      name: "Temperature range the battery can withstand when not in use (reference test)",
      source: "BR Annex XIII 1 (l)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:temperatureRangeIdleState"
      ]
    },
    {
      nr: 35,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-35",
      name: "Period for which the commercial warranty for the calendar life applies",
      source: "BR Annex XIII 1 (m)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "conditional",
          note: "only if applicable (if commercial warranty envisaged)"
        },
        lmt: {
          status: "conditional",
          note: "only if applicable (if commercial warranty envisaged)"
        },
        industrial: {
          status: "conditional",
          note: "only if applicable (if commercial warranty envisaged)"
        }
      },
      implementedBy: [
        "eubat:warrantyConditions",
        "gs1:warranty"
      ]
    },
    {
      nr: 36,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-36",
      name: "Initial round trip energy efficiency",
      source: "BR Annex XIII 1 (n)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "only applicable for some industrial batteries"
        }
      },
      implementedBy: [
        "eubat:roundTripEnergyEfficiency",
        "eubat:roundTripEfficiency"
      ]
    },
    {
      nr: 37,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-37",
      name: "Round trip energy efficiency at 50 % of cycle-life",
      source: "BR Annex XIII 1 (n)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "only applicable for some industrial batteries"
        }
      },
      implementedBy: [
        "eubat:roundTripEfficiencyAt50PercentCycleLife"
      ]
    },
    {
      nr: 38,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-38",
      name: "Internal battery cell and pack resistance",
      source: "BR Annex XIII 1 (o)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:initialInternalResistance"
      ]
    },
    {
      nr: 39,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-39",
      name: "C-rate of relevant cycle-life test",
      source: "BR Annex XIII 1 (p)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "only applicable for some industrial batteries"
        }
      },
      implementedBy: [
        "eubat:cRateLifeCycleTest"
      ]
    },
    {
      nr: 40,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-40",
      name: "The marking requirements laid down in Article 13(4)",
      source: "BR Annex XIII 1 (q)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:labels",
        "eubat:separateCollectionSymbolUrl"
      ]
    },
    {
      nr: 41,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-41",
      name: "The marking requirements laid down in Article 13(5)",
      source: "BR Annex XIII 1 (q)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "conditional",
          note: "cadmium or lead symbol if applicable"
        },
        lmt: {
          status: "conditional",
          note: "cadmium or lead symbol if applicable"
        },
        industrial: {
          status: "conditional",
          note: "cadmium or lead symbol if applicable"
        }
      },
      implementedBy: [
        "eubat:cadmiumSymbolRequired",
        "eubat:leadSymbolRequired"
      ]
    },
    {
      nr: 42,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-42",
      name: "The EU declaration of conformity referred to in Article 18",
      source: "BR Annex XIII 1 (r)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:euDeclarationOfConformity"
      ]
    },
    {
      nr: 43,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-43",
      name: "The information regarding the prevention and management of waste batteries laid down in Article 74(1), points (a) to (f)",
      source: "BR Annex XIII 1 (s)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:wastePrevention",
        "eubat:informationOnCollection",
        "eubat:separateCollection"
      ]
    },
    {
      nr: 44,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-44",
      name: "Clear, understandable and readable instructions for use in a format that makes it possible to print, download and save them on an electronic device so that the user can access them at all times, in particular during a breakdown of the battery",
      source: "BR Annex XIII 1 (t)",
      lifecycle: "static",
      accessTier: "public",
      applicability: {
        ev: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption"
        },
        lmt: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption"
        },
        industrial: {
          status: "pending",
          note: "Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption"
        }
      },
      implementedBy: [
        "gs1:instructionsForUse",
        "gs1:consumerUsageInstructions"
      ]
    },
    {
      nr: 45,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-45",
      name: "Detailed composition, including materials used in the cathode, anode and electrolyte",
      source: "BR Annex XIII 2 (a)",
      lifecycle: "static",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:cathodeActiveMaterial",
        "eubat:anodeActiveMaterial",
        "eubat:electrolyteComposition"
      ]
    },
    {
      nr: 46,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-46",
      name: "Part numbers for components",
      source: "BR Annex XIII 2 (b)",
      lifecycle: "static",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:spareParts"
      ]
    },
    {
      nr: 47,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-47",
      name: "Contact details of sources for replacement spares",
      source: "BR Annex XIII 2 (b)",
      lifecycle: "static",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:sparePartSources",
        "eubat:supplierContact"
      ]
    },
    {
      nr: 48,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-48",
      name: "Dismantling information, including at least: exploded diagrams of the battery system/pack showing the location of battery cells, disassembly sequences, type and number of fastening techniques to be unlocked, tools required for disassembly, warnings if risk of damaging parts exist, amount of cells used and layout",
      source: "BR Annex XIII 2 (c)",
      lifecycle: "static",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:dismantlingDocuments",
        "eubat:dismantlingInstructions"
      ]
    },
    {
      nr: 49,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-49",
      name: "Safety measures",
      source: "BR Annex XIII 2 (d)",
      lifecycle: "static",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:safetyMeasures",
        "eubat:safetyInstructions"
      ]
    },
    {
      nr: 50,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-50",
      name: "Results of test reports proving compliance with the requirements laid down in this Regulation or any delegated or implementing act adopted pursuant to this Regulation",
      source: "BR Annex XIII 3",
      lifecycle: "static",
      accessTier: "notifiedBodiesAndAuthorities",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "eubat:resultOfTestReport",
        "eubat:testReportNumber"
      ]
    },
    {
      nr: 51,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-51",
      name: "Rated capacity (in Ah)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory",
          note: "same as data point number 11 (capacity), but now dynamic"
        },
        lmt: {
          status: "mandatory",
          note: "same as data point number 11 (capacity), but now dynamic"
        },
        industrial: {
          status: "conditional",
          note: "if applicable, but now dynamic"
        }
      },
      implementedBy: [
        "eubat:ratedCapacity"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 52,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-52",
      name: "Capacity fade (in %)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:capacityFade"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 53,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-53",
      name: "Power (in W)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:powerCapability"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 54,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-54",
      name: "Power fade (in %)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:powerFade"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 55,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-55",
      name: "Internal resistance (in \u03A9)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:internalResistance"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 56,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-56",
      name: "Internal resistance increase (in %)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:internalResistanceIncrease"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 57,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-57",
      name: "Where applicable, energy round trip efficiency (in %)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:roundTripEfficiency"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 58,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-58",
      name: "Where applicable, energy round trip efficiency fade (in %)",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:roundTripEfficiencyFade"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 59,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-59",
      name: "The expected life-time of the battery under the reference conditions for which it has been designed, in terms of cycles, except for non-cycle applications",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:expectedRemainingCycles"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 60,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-60",
      name: "The expected life-time of the battery under the reference conditions for which it has been designed, in terms of calendar years",
      source: "BR Annex XIII 4 (a)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:expectedLifetimeYears",
        "eubat:expectedRemainingLifetimeMonths"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 61,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-61",
      name: "Information on the state of health of the battery pursuant to Article 14: state of certified energy (SOCE)",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        industrial: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        }
      },
      implementedBy: [
        "eubat:stateOfCertifiedEnergy"
      ],
      epcisExample: "epcis/state-of-certified-energy.jsonld"
    },
    {
      nr: 62,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-62",
      name: "Information on the state of health of the battery pursuant to Article 14: remaining capacity",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:remainingCapacity"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 63,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-63",
      name: "Information on the state of health of the battery pursuant to Article 14: where possible, the remaining power capability",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:remainingPowerCapability"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 64,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-64",
      name: "Information on the state of health of the battery pursuant to Article 14: where possible, the remaining round trip efficiency",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:remainingRoundTripEfficiency"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 65,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-65",
      name: "Information on the state of health of the battery pursuant to Article 14: where possible, the evolution of self-discharging rates",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:evolutionOfSelfDischarge",
        "eubat:currentSelfDischargingRate"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 66,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-66",
      name: "Information on the state of health of the battery pursuant to Article 14: where possible, the ohmic resistance",
      source: "BR Annex XIII 4 (b)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "notToBeFilled",
          note: "Not to be filled/displayed"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:internalResistance"
      ],
      epcisExample: "epcis/state-of-health.jsonld"
    },
    {
      nr: 67,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-67",
      name: "Information on the status of the battery, defined as 'original', 'repurposed', 're-used', 'remanufactured' or 'waste'",
      source: "BR Annex XIII 4 (c)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "mandatory"
        },
        lmt: {
          status: "mandatory"
        },
        industrial: {
          status: "mandatory"
        }
      },
      implementedBy: [
        "schema:status",
        "eubat:BatteryStatus"
      ],
      epcisExample: "epcis/commissioning.jsonld"
    },
    {
      nr: 68,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-68",
      name: "The number of charging and discharging cycles",
      source: "BR Annex XIII 4 (d)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:numberOfFullCycles",
        "eubat:cycleCount"
      ],
      epcisExample: "epcis/amperia-staxwall-lifecycle.jsonld"
    },
    {
      nr: 69,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-69",
      name: "Negative events, such as accidents",
      source: "BR Annex XIII 4 (d)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:negativeEvents",
        "eubat:NegativeEvent"
      ],
      epcisExample: "epcis/negative-event.jsonld"
    },
    {
      nr: 70,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-70",
      name: "Periodically recorded information on the operating environmental conditions, including temperature",
      source: "BR Annex XIII 4 (d)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:timeSpentInExtremeTemperaturesAboveBoundary",
        "eubat:timeSpentInExtremeTemperaturesBelowBoundary"
      ],
      epcisExample: "epcis/temperature-extreme.jsonld"
    },
    {
      nr: 71,
      iri: "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#dp-71",
      name: "Periodically recorded information on the state of charge",
      source: "BR Annex XIII 4 (d)",
      lifecycle: "dynamic",
      accessTier: "legitimateInterest",
      applicability: {
        ev: {
          status: "conditional",
          note: "if applicable"
        },
        lmt: {
          status: "conditional",
          note: "if applicable"
        },
        industrial: {
          status: "conditional",
          note: "if applicable"
        }
      },
      implementedBy: [
        "eubat:stateOfCharge"
      ],
      epcisExample: "epcis/amperia-staxwall-lifecycle.jsonld"
    }
  ]
};

// extensions/eu/battery/examples/battery-product-model.jsonld
var battery_product_model_default = {
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ],
  _comment_architecture: [
    "MODEL-LEVEL battery master data (GS1 Digital Link 01/{GTIN}, no serial, no lot).",
    "This is the resource a GS1-conformant Digital Link resolver serves for the battery model when the plain 01/ GTIN Digital Link is dereferenced (Accept: application/ld+json).",
    "It carries only attributes reported once per model: identifiers, category, chemistry, rated/design technical specifications, materials, dismantling and spare-part information, warranty, symbols and conformity, due diligence.",
    "Attributes that vary per manufacturing batch (manufacturing date/place, carbon footprint, recycled-content shares) live in battery-product-batch.jsonld (01/{GTIN}/10/{lot}).",
    "Attributes measured per physical battery (state of health, cycle count, capacity fade, ...) are carried by EPCIS events and folded into the item passport (01/{GTIN}/21/{serial}); see battery-product.jsonld and docs/EPCIS_AND_BATTERYPASS_READY.md.",
    "See: extensions/eu/battery/validation/batterypass-granularity.json for the per-attribute level map."
  ],
  id: "https://id.gs1.org/01/09521002005004",
  type: [
    "gs1:Product",
    "eubat:Battery"
  ],
  "oec:granularityLevel": "model",
  "gs1:gtin": "09521002005004",
  "gs1:productName": [
    {
      "@value": "EcoCell Industrial Battery Module IM-500",
      "@language": "en"
    },
    {
      "@value": "EcoCell Industrie-Batteriemodul IM-500",
      "@language": "de"
    }
  ],
  "gs1:productDescription": [
    {
      "@value": "High-capacity lithium iron phosphate battery module for industrial energy storage. Designed for long cycle life and safety.",
      "@language": "en"
    }
  ],
  "schema:category": {
    "@id": "eubat:IndustrialBattery"
  },
  "schema:model": {
    "@value": "IM-500",
    "@language": "en"
  },
  "eubat:cellType": {
    "@id": "eubat:PrismaticCell"
  },
  "eubat:numberOfCells": 16,
  "eubat:numberOfModules": 1,
  "gs1:manufacturer": {
    id: "https://id.gs1.org/417/9521234000006",
    type: "gs1:Organization",
    "gs1:organizationName": "EcoCell GmbH",
    "gs1:globalLocationNumber": "9521234000006",
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:streetAddress": "Batteriestra\xDFe 42",
      "gs1:addressLocality": "Stuttgart",
      "gs1:postalCode": "70173",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    }
  },
  "eubat:operatorInformation": {
    id: "https://id.gs1.org/417/9521234000006#operator",
    type: "oec:OperatorInformation",
    "gs1:globalLocationNumber": "9521234000006",
    "gs1:organizationName": "EcoCell GmbH",
    "eubat:operatorRole": {
      "@id": "oec:Manufacturer"
    }
  },
  "gs1:countryOfOrigin": {
    type: "gs1:Country",
    "gs1:countryCode": "DE"
  },
  "gs1:netWeight": {
    type: "gs1:QuantitativeValue",
    "gs1:value": 125.5,
    "gs1:unitCode": "KGM"
  },
  "eubat:batteryChemistry": {
    id: "https://id.gs1.org/01/09521002005004#chemistry",
    type: "eubat:BatteryChemistry",
    "eubat:cathodeActiveMaterial": "LiFePO4",
    "eubat:anodeActiveMaterial": "Graphite",
    "eubat:electrolyteType": {
      "@value": "Liquid organic carbonate-based",
      "@language": "en"
    }
  },
  "eubat:technicalSpecifications": {
    id: "https://id.gs1.org/01/09521002005004#specs",
    type: "eubat:TechnicalSpecification",
    "eubat:ratedCapacity": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 280,
      "gs1:unitCode": "AMH"
    },
    "eubat:ratedEnergy": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 14.3,
      "gs1:unitCode": "KWH"
    },
    "eubat:nominalVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 51.2,
      "gs1:unitCode": "VLT"
    },
    "eubat:minimumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 40,
      "gs1:unitCode": "VLT"
    },
    "eubat:maximumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 58.4,
      "gs1:unitCode": "VLT"
    },
    "eubat:ratedMaximumPower": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 7.5,
      "gs1:unitCode": "KWT"
    },
    "eubat:initialInternalResistance": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2.1,
      "gs1:unitCode": "OHM"
    },
    "eubat:expectedCycleLife": 6e3,
    "eubat:expectedLifetimeYears": 15,
    "eubat:roundTripEfficiency": 96,
    "eubat:capacityThresholdForExhaustion": 70,
    "eubat:lifetimeReferenceTest": "https://www.iec.ch/standards/62660-1",
    "eubat:temperatureRangeIdleState": {
      id: "https://id.gs1.org/01/09521002005004#temp-idle",
      type: "eubat:TemperatureRange",
      "eubat:minimumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": -30,
        "gs1:unitCode": "CEL"
      },
      "eubat:maximumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 60,
        "gs1:unitCode": "CEL"
      }
    }
  },
  "gs1:manufacturersWarranty": {
    type: "gs1:WarrantyPromise",
    "gs1:durationOfWarranty": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 8,
      "gs1:unitCode": "ANN"
    },
    "gs1:warrantyScopeDescription": "Full replacement warranty for manufacturing defects"
  },
  "eubat:supplyChainDueDiligence": {
    id: "https://id.gs1.org/01/09521002005004#due-diligence",
    type: "eubat:SupplyChainDueDiligence",
    "eubat:dueDiligenceReportUrl": "https://www.ecocell-batteries.example.com/docs/supply-chain-due-diligence-2024.pdf",
    "eubat:thirdPartyAssurancesUrl": "https://www.ecocell-batteries.example.com/docs/third-party-audit-2024.pdf",
    "eubat:supplyChainIndex": 78.5
  },
  "eubat:euDeclarationOfConformity": {
    type: "cccev:Evidence",
    "eubat:euDeclarationOfConformityId": "DoC-2024-ECOCELL-IM500",
    "eubat:declarationOfConformity": "https://www.ecocell-batteries.example.com/docs/IM-500-eu-doc.pdf"
  },
  "eubat:resultOfTestReport": "https://www.ecocell-batteries.example.com/docs/IM-500-test-report.pdf",
  "eubat:separateCollectionSymbolUrl": "https://www.ecocell-batteries.example.com/labels/weee-symbol.svg"
};

// extensions/eu/battery/examples/battery-product-batch.jsonld
var battery_product_batch_default = {
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ],
  _comment_architecture: [
    "BATCH-LEVEL battery master data (GS1 Digital Link 01/{GTIN}/10/{lot}).",
    "This is the resource a GS1-conformant Digital Link resolver serves for one production batch (model + manufacturing site + calendar period) when the 01+10 lot Digital Link is dereferenced.",
    "It carries only attributes reported per batch: manufacturing date and place, the carbon-footprint declaration, and recycled / renewable content shares. Model-level attributes live in battery-product-model.jsonld; per-battery measured attributes are folded from EPCIS events into the item passport (battery-product.jsonld).",
    "The batch identity is the /10/ lot in the Digital Link; oec:granularityLevel is 'batch'.",
    "See: extensions/eu/battery/validation/batterypass-granularity.json for the per-attribute level map."
  ],
  id: "https://id.gs1.org/01/09521002005004/10/LOT-2024-0312",
  type: [
    "gs1:Product",
    "eubat:Battery"
  ],
  "oec:granularityLevel": "batch",
  "gs1:gtin": "09521002005004",
  "gs1:productionDate": "2024-03-15",
  "eubat:manufacturingPlace": {
    id: "https://id.gs1.org/414/9521234000013",
    type: "gs1:Place",
    "gs1:globalLocationNumber": "9521234000013",
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:addressLocality": "Stuttgart",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    }
  },
  "eubat:recycledContent": {
    id: "https://id.gs1.org/01/09521002005004/10/LOT-2024-0312#recycled",
    type: "eubat:RecycledContent",
    "eubat:lithiumPreConsumerShare": 5,
    "eubat:lithiumPostConsumerShare": 7,
    "eubat:cobaltPreConsumerShare": 0,
    "eubat:cobaltPostConsumerShare": 0,
    "eubat:nickelPreConsumerShare": 0,
    "eubat:nickelPostConsumerShare": 0,
    "eubat:leadRecycledShare": 0
  },
  "eubat:carbonFootprintDeclaration": {
    id: "https://id.gs1.org/01/09521002005004/10/LOT-2024-0312#cfp",
    type: "eubat:CarbonFootprintDeclaration",
    "eubat:carbonFootprintTotal": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 45.2,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRawMaterialExtraction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 18.5,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintProduction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 15.3,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintDistribution": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2.8,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRecycling": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 8.6,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintPerformanceClass": {
      "@id": "eubat:CFClassB"
    },
    "eubat:carbonFootprintStudyUrl": "https://www.ecocell-batteries.example.com/docs/IM-500-cfp-study.pdf",
    "eubat:carbonFootprintDeclarationId": "CFP-2024-ECOCELL-IM500-001"
  },
  "eubat:endOfLifeInfo": {
    id: "https://id.gs1.org/01/09521002005004/10/LOT-2024-0312#eol",
    type: "eubat:EndOfLifeInfo",
    "eubat:renewableContent": 3.2
  }
};

// extensions/eu/battery/examples/battery-product.jsonld
var battery_product_default = {
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ],
  _comment_gs1_alignment: [
    "This example demonstrates GS1-aligned Digital Product Passport modeling.",
    "Key GS1 patterns used:",
    "- GS1 Digital Link URI for product identification (https://id.gs1.org/01/{GTIN}/21/{serial})",
    "- Product as base type with eubat:Battery extension",
    "- GS1 properties: gtin, productName, manufacturer, netWeight, gs1:manufacturersWarranty",
    "- QuantitativeValue for all measurements with unitCode",
    "- gs1:regulatoryInformation for compliance with gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
    "- gs1:referencedFile for documents",
    "- Battery-specific extensions only where GS1 Web Vocabulary lacks equivalent terms",
    "See EXTENSION-GOVERNANCE.md for rationale on each extension term."
  ],
  id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001",
  type: [
    "gs1:Product",
    "eubat:Battery"
  ],
  "oec:lastUpdated": "2024-03-20T14:30:00Z",
  "oec:granularityLevel": "item",
  "gs1:gtin": "09521002005004",
  "schema:serialNumber": "BAT2024-001",
  "gs1:productName": [
    {
      "@value": "EcoCell Industrial Battery Module IM-500",
      "@language": "en"
    },
    {
      "@value": "EcoCell Industrie-Batteriemodul IM-500",
      "@language": "de"
    },
    {
      "@value": "Module de batterie industrielle EcoCell IM-500",
      "@language": "fr"
    },
    {
      "@value": "M\xF3dulo de bater\xEDa industrial EcoCell IM-500",
      "@language": "es"
    },
    {
      "@value": "EcoCell industri\xEBle batterijmodule IM-500",
      "@language": "nl"
    },
    {
      "@value": "EcoCell industribatterimodul IM-500",
      "@language": "da"
    },
    {
      "@value": "Przemys\u0142owy modu\u0142 akumulatora EcoCell IM-500",
      "@language": "pl"
    },
    {
      "@value": "EcoCell industribatterimodul IM-500",
      "@language": "sv"
    },
    {
      "@value": "EcoCell industribatterimodul IM-500",
      "@language": "no"
    },
    {
      "@value": "EcoCell teollisuusakkumoduuli IM-500",
      "@language": "fi"
    },
    {
      "@value": "Modulo batteria industriale EcoCell IM-500",
      "@language": "it"
    }
  ],
  "gs1:productDescription": [
    {
      "@value": "High-capacity lithium iron phosphate battery module for industrial energy storage. Designed for long cycle life and safety.",
      "@language": "en"
    },
    {
      "@value": "Hochkapazit\xE4ts-LFP-Batteriemodul f\xFCr industrielle Energiespeicherung. Entwickelt f\xFCr lange Zyklenlebensdauer und Sicherheit.",
      "@language": "de"
    },
    {
      "@value": "Module de batterie LFP haute capacit\xE9 pour le stockage d'\xE9nergie industriel. Con\xE7u pour une longue dur\xE9e de vie cyclique et la s\xE9curit\xE9.",
      "@language": "fr"
    },
    {
      "@value": "M\xF3dulo de bater\xEDa LFP de alta capacidad para almacenamiento energ\xE9tico industrial. Dise\xF1ado para una larga vida \xFAtil de ciclos y seguridad.",
      "@language": "es"
    },
    {
      "@value": "Lithium-ijzerfosfaat-batterijmodule met hoge capaciteit voor industri\xEBle energieopslag. Ontworpen voor een lange cyclusduur en veiligheid.",
      "@language": "nl"
    },
    {
      "@value": "LFP-batterimodul med h\xF8j kapacitet til industriel energilagring. Designet til lang cyklus-levetid og sikkerhed.",
      "@language": "da"
    },
    {
      "@value": "Modu\u0142 akumulatora litowo-\u017Celazowo-fosforanowego (LFP) o du\u017Cej pojemno\u015Bci do magazynowania energii w przemy\u015Ble. Zaprojektowany z my\u015Bl\u0105 o d\u0142ugiej \u017Cywotno\u015Bci cyklicznej i bezpiecze\u0144stwie.",
      "@language": "pl"
    },
    {
      "@value": "LFP-batterimodul med h\xF6g kapacitet f\xF6r industriell energilagring. Konstruerad f\xF6r l\xE5ng cykellivsl\xE4ngd och s\xE4kerhet.",
      "@language": "sv"
    },
    {
      "@value": "LFP-batterimodul med h\xF8y kapasitet for industriell energilagring. Designet for lang syklus-levetid og sikkerhet.",
      "@language": "no"
    },
    {
      "@value": "Suurkapasiteettinen LFP-akkumoduuli teolliseen energiavarastointiin. Suunniteltu pitk\xE4n k\xE4ytt\xF6i\xE4n ja turvallisuuden ehdoilla.",
      "@language": "fi"
    },
    {
      "@value": "Modulo batteria LFP ad alta capacit\xE0 per lo stoccaggio energetico industriale. Progettato per una lunga durata ciclica e sicurezza.",
      "@language": "it"
    }
  ],
  "schema:category": {
    "@id": "eubat:IndustrialBattery"
  },
  _comment_classification: "Alternative GS1 pattern for battery category using gs1:additionalProductClassification",
  "gs1:additionalProductClassification": {
    type: "gs1:AdditionalProductClassificationDetails",
    "gs1:additionalProductClassificationCode": "BATTERY_REGULATION_2023_1542",
    "gs1:additionalProductClassificationCodeDescription": {
      "@value": "Industrial Battery - Battery designed for industrial applications with capacity > 2 kWh",
      "@language": "en"
    }
  },
  "schema:status": {
    "@id": "eubat:Original"
  },
  "schema:model": {
    "@value": "IM-500",
    "@language": "en"
  },
  "eubat:cellType": {
    "@id": "eubat:PrismaticCell"
  },
  "eubat:numberOfCells": 16,
  "eubat:numberOfModules": 1,
  "gs1:manufacturer": {
    id: "https://id.gs1.org/417/9521234000006",
    type: "gs1:Organization",
    "gs1:organizationName": "EcoCell GmbH",
    "gs1:globalLocationNumber": "9521234000006",
    "gs1:address": {
      id: "https://id.gs1.org/417/9521234000006#address",
      type: "gs1:PostalAddress",
      "gs1:streetAddress": "Batteriestra\xDFe 42",
      "gs1:addressLocality": "Stuttgart",
      "gs1:postalCode": "70173",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    },
    "gs1:contactPoint": {
      type: "gs1:ContactPoint",
      "gs1:email": "info@ecocell-batteries.example.com",
      "schema:url": {
        id: "https://files.example.org/files/products/09521002005004/docs/company.pdf"
      }
    }
  },
  "eubat:manufacturingPlace": {
    id: "https://id.gs1.org/414/9521234000013",
    type: "gs1:Place",
    "gs1:globalLocationNumber": "9521234000013",
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:addressLocality": "Stuttgart",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    }
  },
  "eubat:operatorInformation": {
    id: "https://id.gs1.org/417/9521234000006#operator",
    type: "oec:OperatorInformation",
    "gs1:globalLocationNumber": "9521234000006",
    "gs1:organizationName": "EcoCell GmbH",
    "eubat:operatorRole": {
      "@id": "oec:Manufacturer"
    },
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:streetAddress": "Batteriestra\xDFe 42",
      "gs1:addressLocality": "Stuttgart",
      "gs1:postalCode": "70173",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    },
    "gs1:contactPoint": {
      type: "gs1:ContactPoint",
      "gs1:email": "compliance@ecocell-batteries.example.com",
      "gs1:telephone": "+49-711-555-0100"
    }
  },
  "gs1:countryOfOrigin": {
    type: "gs1:Country",
    "gs1:countryCode": "DE"
  },
  "gs1:productionDate": "2024-03-15",
  "gs1:netWeight": {
    type: "gs1:QuantitativeValue",
    "gs1:value": 125.5,
    "gs1:unitCode": "KGM"
  },
  "gs1:grossWeight": {
    type: "gs1:QuantitativeValue",
    "gs1:value": 132,
    "gs1:unitCode": "KGM"
  },
  "eubat:batteryChemistry": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#chemistry",
    type: "eubat:BatteryChemistry",
    "eubat:cathodeActiveMaterial": "LiFePO4",
    "eubat:anodeActiveMaterial": "Graphite",
    "eubat:electrolyteType": {
      "@value": "Liquid organic carbonate-based",
      "@language": "en"
    },
    "schema:name": {
      "@value": "Lithium Iron Phosphate",
      "@language": "en"
    },
    "schema:alternateName": "LFP"
  },
  "eubat:technicalSpecifications": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#specs",
    type: "eubat:TechnicalSpecification",
    "eubat:ratedCapacity": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 280,
      "gs1:unitCode": "AMH"
    },
    "eubat:ratedEnergy": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 14.3,
      "gs1:unitCode": "KWH"
    },
    "eubat:nominalVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 51.2,
      "gs1:unitCode": "VLT"
    },
    "eubat:minimumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 40,
      "gs1:unitCode": "VLT"
    },
    "eubat:maximumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 58.4,
      "gs1:unitCode": "VLT"
    },
    "eubat:ratedMaximumPower": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 7.5,
      "gs1:unitCode": "KWT"
    },
    "eubat:maximumChargingPower": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 7.5,
      "gs1:unitCode": "KWT"
    },
    "eubat:maximumDischargingPower": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 7.5,
      "gs1:unitCode": "KWT"
    },
    "eubat:maximumChargingCurrent": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 140,
      "gs1:unitCode": "AMP"
    },
    "eubat:maximumDischargingCurrent": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 140,
      "gs1:unitCode": "AMP"
    },
    "eubat:originalPowerCapability": [
      {
        id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#power-80",
        type: "eubat:PowerCapabilityAtSoC",
        "eubat:stateOfChargeLevel": 80,
        "eubat:powerCapability": {
          type: "gs1:QuantitativeValue",
          "gs1:value": 7.2,
          "gs1:unitCode": "KWT"
        }
      },
      {
        id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#power-20",
        type: "eubat:PowerCapabilityAtSoC",
        "eubat:stateOfChargeLevel": 20,
        "eubat:powerCapability": {
          type: "gs1:QuantitativeValue",
          "gs1:value": 6.8,
          "gs1:unitCode": "KWT"
        }
      }
    ],
    "eubat:initialInternalResistance": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2.1,
      "gs1:unitCode": "OHM"
    },
    "eubat:initialSelfDischarge": 1.5,
    "eubat:expectedCycleLife": 6e3,
    "eubat:expectedLifetimeYears": 15,
    "eubat:expectedLifetimeEnergyThroughput": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 85800,
      "gs1:unitCode": "KWH"
    },
    "eubat:expectedLifetimeCapacityThroughput": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 168e4,
      "gs1:unitCode": "AMH"
    },
    "eubat:depthOfDischargeInCycleLifeTest": 80,
    "eubat:capacityFadeThreshold": 20,
    "eubat:resistanceIncreaseThreshold": 50,
    "eubat:roundTripEfficiency": 96,
    "eubat:capacityThresholdForExhaustion": 70,
    "eubat:lifetimeReferenceTest": "https://www.iec.ch/standards/62660-1",
    "eubat:powerCapabilityRatio": 0.52,
    "eubat:cRate": 0.5,
    "eubat:cRateLifeCycleTest": 0.33,
    "eubat:roundTripEfficiencyAt50PercentCycleLife": 94,
    "eubat:temperatureRangeStorage": {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#temp-storage",
      type: "eubat:TemperatureRange",
      "eubat:minimumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": -20,
        "gs1:unitCode": "CEL"
      },
      "eubat:maximumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 45,
        "gs1:unitCode": "CEL"
      }
    },
    "eubat:temperatureRangeCharging": {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#temp-charging",
      type: "eubat:TemperatureRange",
      "eubat:minimumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 0,
        "gs1:unitCode": "CEL"
      },
      "eubat:maximumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 45,
        "gs1:unitCode": "CEL"
      }
    },
    "eubat:temperatureRangeDischarging": {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#temp-discharging",
      type: "eubat:TemperatureRange",
      "eubat:minimumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": -20,
        "gs1:unitCode": "CEL"
      },
      "eubat:maximumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 55,
        "gs1:unitCode": "CEL"
      }
    },
    "eubat:temperatureRangeIdleState": {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#temp-idle",
      type: "eubat:TemperatureRange",
      "eubat:minimumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": -30,
        "gs1:unitCode": "CEL"
      },
      "eubat:maximumTemperature": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 60,
        "gs1:unitCode": "CEL"
      }
    }
  },
  "eubat:materialComposition": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#mat-li",
      type: "eubat:BatteryMaterial",
      "schema:name": {
        "@value": "Lithium",
        "@language": "en"
      },
      "eubat:casNumber": "7439-93-2",
      "eubat:ecNumber": "231-102-5",
      "eubat:componentLocation": {
        "@id": "eubat:Cathode"
      },
      "schema:category": {
        "@id": "eubat:ActiveMaterial"
      },
      "schema:weightPercentage": 4.2,
      "eubat:isCriticalRawMaterial": true,
      "eubat:isSubstanceOfConcern": false,
      "oec:materialOrigin": {
        type: "gs1:Country",
        "gs1:countryCode": "CL"
      }
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#mat-fe",
      type: "eubat:BatteryMaterial",
      "schema:name": {
        "@value": "Iron",
        "@language": "en"
      },
      "eubat:casNumber": "7439-89-6",
      "eubat:ecNumber": "231-096-4",
      "eubat:componentLocation": {
        "@id": "eubat:Cathode"
      },
      "schema:category": {
        "@id": "eubat:ActiveMaterial"
      },
      "schema:weightPercentage": 21.5,
      "eubat:isCriticalRawMaterial": false,
      "eubat:isSubstanceOfConcern": false
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#mat-c",
      type: "eubat:BatteryMaterial",
      "schema:name": {
        "@value": "Graphite",
        "@language": "en"
      },
      "eubat:casNumber": "7782-42-5",
      "eubat:ecNumber": "231-955-3",
      "eubat:componentLocation": {
        "@id": "eubat:Anode"
      },
      "schema:category": {
        "@id": "eubat:ActiveMaterial"
      },
      "schema:weightPercentage": 18.3,
      "eubat:isCriticalRawMaterial": true,
      "eubat:isSubstanceOfConcern": false,
      "eubat:renewableContentShare": 0
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#mat-p",
      type: "eubat:BatteryMaterial",
      "schema:name": {
        "@value": "Phosphorus",
        "@language": "en"
      },
      "eubat:casNumber": "7723-14-0",
      "eubat:ecNumber": "231-768-7",
      "eubat:componentLocation": {
        "@id": "eubat:Cathode"
      },
      "schema:category": {
        "@id": "eubat:ActiveMaterial"
      },
      "schema:weightPercentage": 9.8,
      "eubat:isCriticalRawMaterial": true,
      "eubat:isSubstanceOfConcern": false
    }
  ],
  "eubat:hazardousSubstances": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#haz-electrolyte",
      type: "eubat:HazardousSubstance",
      "schema:name": {
        "@value": "Lithium hexafluorophosphate (LiPF6)",
        "@language": "en"
      },
      "eubat:substanceCasNumber": "21324-40-3",
      "eubat:substanceEcNumber": "244-334-7",
      "eubat:hazardClass": {
        "@id": "eubat:AcuteToxicity"
      },
      "eubat:concentration": 12.5,
      "eubat:hazardImpact": {
        "@value": "Toxic if swallowed; causes skin irritation; causes serious eye damage",
        "@language": "en"
      },
      "eubat:substanceLocation": {
        "@id": "eubat:Electrolyte"
      }
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#haz-solvent",
      type: "eubat:HazardousSubstance",
      "schema:name": {
        "@value": "Ethylene carbonate",
        "@language": "en"
      },
      "eubat:substanceCasNumber": "96-49-1",
      "eubat:substanceEcNumber": "202-510-0",
      "eubat:hazardClass": {
        "@id": "eubat:EyeDamageOrIrritation"
      },
      "eubat:concentration": 8.2,
      "eubat:hazardImpact": {
        "@value": "Causes serious eye irritation",
        "@language": "en"
      },
      "eubat:substanceLocation": {
        "@id": "eubat:Electrolyte"
      }
    }
  ],
  "eubat:recycledContent": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#recycled",
    type: "eubat:RecycledContent",
    "eubat:lithiumRecycledShare": 12,
    "eubat:lithiumPreConsumerShare": 5,
    "eubat:lithiumPostConsumerShare": 7,
    "eubat:cobaltRecycledShare": 0,
    "eubat:cobaltPreConsumerShare": 0,
    "eubat:cobaltPostConsumerShare": 0,
    "eubat:nickelRecycledShare": 0,
    "eubat:nickelPreConsumerShare": 0,
    "eubat:nickelPostConsumerShare": 0,
    "eubat:leadRecycledShare": 0,
    "eubat:leadPreConsumerShare": 0,
    "eubat:leadPostConsumerShare": 0
  },
  "eubat:carbonFootprintDeclaration": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#cfp",
    type: "eubat:CarbonFootprintDeclaration",
    "eubat:carbonFootprintTotal": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 45.2,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRawMaterialExtraction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 18.5,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintProduction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 15.3,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintDistribution": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2.8,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRecycling": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 8.6,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintPerformanceClass": {
      "@id": "eubat:CFClassB"
    },
    "eubat:carbonFootprintStudyUrl": "https://files.example.org/files/products/09521002005004/docs/carbon-footprint-study.pdf",
    "eubat:functionalUnit": "1 kWh of total energy throughput over battery lifetime",
    "eubat:calculationStandard": "ISO 14067:2018",
    "eubat:carbonFootprintDeclarationId": "CFP-2024-ECOCELL-IM500-001",
    "eubat:carbonFootprintGeographicScope": "EU production, global material sourcing",
    "eubat:thirdPartyVerification": {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#cfp-verification",
      type: "eubat:ThirdPartyVerification",
      "eubat:verificationBodyName": "T\xDCV Rheinland",
      "eubat:verificationDate": "2024-02-28",
      "eubat:verificationCertificateUrl": "https://files.example.org/files/products/09521002005004/docs/verification-certificate.pdf",
      "eubat:verificationStandard": "ISO 14064-3:2019"
    }
  },
  "gs1:manufacturersWarranty": {
    type: "gs1:WarrantyPromise",
    "gs1:durationOfWarranty": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 8,
      "gs1:unitCode": "ANN"
    },
    "gs1:warrantyScopeDescription": "Full replacement warranty for manufacturing defects"
  },
  "eubat:warrantyConditions": "https://files.example.org/files/products/09521002005004/docs/warranty-conditions.pdf",
  "eubat:extendedWarrantyAvailable": true,
  "schema:contactPoint": {
    type: "gs1:ContactPoint",
    "gs1:email": "service@ecocell-batteries.example.com",
    "gs1:telephone": "+49-711-555-0300",
    "schema:url": {
      id: "https://files.example.org/files/products/09521002005004/docs/company.pdf"
    }
  },
  "eubat:authorizedServiceCenters": "https://files.example.org/files/products/09521002005004/docs/service-centres.pdf",
  "eubat:transportationSafetyClass": "UN3481",
  "eubat:dangerousGoodsPackingInstructions": {
    "@value": "PI966 Section II - Lithium ion batteries packed with equipment",
    "@language": "en"
  },
  "eubat:shippingName": {
    "@value": "LITHIUM ION BATTERIES PACKED WITH EQUIPMENT",
    "@language": "en"
  },
  "eubat:repurposingPotential": {
    "@value": "High - suitable for stationary energy storage after EV use",
    "@language": "en"
  },
  "eubat:repurposingGuidelines": "https://files.example.org/files/products/09521002005004/docs/repurposing-guidelines.pdf",
  "eubat:dataQualityAssessment": "A",
  "eubat:lastDataUpdate": "2024-03-20T14:30:00Z",
  "eubat:dataProviderCertification": "ISO 27001 certified data management",
  "eubat:criticalRawMaterialsStatement": {
    "@value": "Contains lithium (4.2%), graphite (18.3%), and phosphorus (9.8%) which are on the EU Critical Raw Materials list.",
    "@language": "en"
  },
  "eubat:ceMarkingIndicator": true,
  "gs1:certification": [
    {
      type: "gs1:CertificationDetails",
      "gs1:certificationSubject": "EU Declaration of Conformity (Battery Regulation 2023/1542)",
      "gs1:certificationAgency": "T\xDCV S\xDCD (Notified Body 0123)",
      "gs1:certificationURI": "https://files.example.org/files/products/09521002005004/docs/declaration-of-conformity.pdf"
    }
  ],
  "eubat:euDeclarationOfConformity": {
    type: "cccev:Evidence",
    "eubat:euDeclarationOfConformityId": "DoC-2024-ECOCELL-IM500",
    "eubat:declarationOfConformity": "https://files.example.org/files/products/09521002005004/docs/declaration-of-conformity.pdf",
    "eubat:notifiedBody": {
      type: "cv:PublicOrganisation",
      "eubat:notifiedBodyNumber": "0123",
      "eubat:notifiedBodyName": "T\xDCV S\xDCD"
    }
  },
  "eubat:resultOfTestReport": "https://files.example.org/files/products/09521002005004/docs/test-report.pdf",
  "eubat:testReportNumber": "TR-2024-ECOCELL-IM500-001",
  "eubat:complianceStatus": {
    "@id": "eubat:Compliant"
  },
  "eubat:separateCollectionSymbolUrl": "https://files.example.org/files/products/_common/symbols/battery-label.svg",
  "eubat:cadmiumSymbolRequired": false,
  "eubat:leadSymbolRequired": false,
  "eubat:labels": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#label-weee",
      type: "eubat:Label",
      "eubat:labelSubject": {
        "@id": "eubat:SeparateCollection"
      },
      "eubat:labelSymbol": "https://files.example.org/files/products/_common/symbols/battery-label.svg",
      "eubat:labelMeaning": {
        "@value": "Do not dispose of with household waste. Return to designated collection points.",
        "@language": "en"
      }
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#label-cfp",
      type: "eubat:Label",
      "eubat:labelSubject": {
        "@id": "eubat:CarbonFootprintLabel"
      },
      "eubat:labelSymbol": "https://files.example.org/files/products/_common/symbols/battery-label.svg",
      "eubat:labelMeaning": {
        "@value": "Carbon Footprint Performance Class B: 45.2 kg CO2e/kWh",
        "@language": "en"
      }
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#label-fire",
      type: "eubat:Label",
      "eubat:labelSubject": {
        "@id": "eubat:ExtinguishingAgentLabel"
      },
      "eubat:labelSymbol": "https://files.example.org/files/products/_common/symbols/battery-label.svg",
      "eubat:labelMeaning": {
        "@value": "In case of fire, use Class D fire extinguisher or dry sand. Do not use water.",
        "@language": "en"
      }
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#label-qr",
      type: "eubat:Label",
      "eubat:labelSubject": {
        "@id": "eubat:QRCodeLabel"
      },
      "eubat:labelMeaning": {
        "@value": "Scan QR code to access battery passport",
        "@language": "en"
      }
    }
  ],
  "gs1:regulatoryInformation": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#reg-battery",
      type: "gs1:RegulatoryInformation",
      "gs1:regulationType": {
        id: "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"
      },
      "gs1:regulatoryAct": "EU 2023/1542",
      "oec:regulatoryActStatus": "ACTIVE",
      "oec:regulatoryPermitIdentification": "EU-TEC-2024-ECOCELL-IM500",
      "oec:isRegulationCompliant": true
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#reg-ce",
      type: "gs1:RegulatoryInformation",
      "gs1:regulationType": {
        id: "gs1:RegulationTypeCode-CE"
      },
      "gs1:regulatoryAct": "CE Marking",
      "oec:isRegulationCompliant": true
    }
  ],
  "eubat:supplyChainDueDiligence": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#due-diligence",
    type: "eubat:SupplyChainDueDiligence",
    "eubat:dueDiligenceReportUrl": "https://files.example.org/files/products/09521002005004/docs/due-diligence-report.pdf",
    "eubat:dueDiligencePolicyUrl": "https://files.example.org/files/products/09521002005004/docs/due-diligence-policy.pdf",
    "eubat:thirdPartyAssurancesUrl": "https://files.example.org/files/products/09521002005004/docs/third-party-assurance.pdf",
    "eubat:riskAssessmentSummary": {
      "@value": "Low to medium risk profile. Key risks identified in lithium sourcing from Chile mitigated through certified suppliers.",
      "@language": "en"
    },
    "eubat:supplyChainMappingAvailable": true,
    "eubat:conflictMineralFree": true,
    "eubat:responsibleSourcingStandard": {
      "@id": "eubat:OECDGuidelines"
    },
    "schema:auditDate": "2024-01-15",
    "eubat:auditBody": "PwC Germany",
    "eubat:supplyChainIndex": 78.5
  },
  "eubat:sparePartSources": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#spare-1",
      type: "gs1:Organization",
      "gs1:organizationName": "EcoCell Service GmbH",
      "eubat:spareParts": {
        "@value": "BMS Module, Cell Connectors, Cooling System Components, Terminal Covers",
        "@language": "en"
      },
      "gs1:address": {
        type: "gs1:PostalAddress",
        "gs1:streetAddress": "Serviceweg 10",
        "gs1:addressLocality": "Stuttgart",
        "gs1:postalCode": "70174",
        "gs1:addressCountry": {
          type: "gs1:Country",
          "gs1:countryCode": "DE"
        }
      },
      "eubat:supplierContact": {
        type: "gs1:ContactPoint",
        "gs1:email": "spareparts@ecocell-batteries.example.com",
        "gs1:telephone": "+49-711-555-0200",
        "schema:url": {
          id: "https://files.example.org/files/products/09521002005004/docs/company.pdf"
        }
      }
    }
  ],
  "eubat:dismantlingDocuments": [
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#dismantle-bom",
      type: "eubat:DismantlingDocument",
      "eubat:documentType": {
        "@id": "eubat:BillOfMaterial"
      },
      "eubat:documentUrl": "https://files.example.org/files/products/09521002005004/docs/document.pdf",
      "eubat:mimeType": "application/pdf",
      "eubat:languageCode": "en"
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#dismantle-3d",
      type: "eubat:DismantlingDocument",
      "eubat:documentType": {
        "@id": "eubat:Model3D"
      },
      "eubat:documentUrl": "https://files.example.org/files/products/09521002005004/docs/document.pdf",
      "eubat:mimeType": "model/step",
      "eubat:languageCode": "en"
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#dismantle-manual",
      type: "eubat:DismantlingDocument",
      "eubat:documentType": {
        "@id": "eubat:DismantlingManual"
      },
      "eubat:documentUrl": "https://files.example.org/files/products/09521002005004/docs/document.pdf",
      "eubat:mimeType": "application/pdf",
      "eubat:languageCode": "en"
    },
    {
      id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#dismantle-sds",
      type: "eubat:DismantlingDocument",
      "eubat:documentType": {
        "@id": "eubat:SafetyDataSheet"
      },
      "eubat:documentUrl": "https://files.example.org/files/products/09521002005004/docs/document.pdf",
      "eubat:mimeType": "application/pdf",
      "eubat:languageCode": "de"
    }
  ],
  "eubat:endOfLifeInfo": {
    id: "https://id.gs1.org/01/09521002005004/21/BAT2024-001#eol",
    type: "eubat:EndOfLifeInfo",
    "eubat:recyclabilityRate": 95,
    "eubat:materialRecoveryTargets": [
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Lithium",
        "eubat:recoveryRate": 70
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Cobalt",
        "eubat:recoveryRate": 95
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Nickel",
        "eubat:recoveryRate": 95
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Copper",
        "eubat:recoveryRate": 95
      }
    ],
    "eubat:dismantlingInstructions": {
      id: "https://files.example.org/files/products/09521002005004/docs/document.pdf"
    },
    "eubat:safetyInstructionsForDismantling": "https://files.example.org/files/products/09521002005004/docs/dismantling-safety.pdf",
    "eubat:dismantlingTime": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 45,
      "gs1:unitCode": "MIN"
    },
    "eubat:extinguishingAgent": {
      "@value": "Class D fire extinguisher or dry sand",
      "@language": "en"
    },
    "eubat:wastePrevention": "https://files.example.org/files/products/09521002005004/docs/waste-prevention.pdf",
    "eubat:separateCollection": "https://files.example.org/files/products/09521002005004/docs/separate-collection.pdf",
    "eubat:informationOnCollection": "https://files.example.org/files/products/09521002005004/docs/collection-information.pdf",
    "eubat:safetyInstructions": "https://files.example.org/files/products/09521002005004/docs/safety-instructions.pdf",
    "eubat:renewableContent": 3.2
  },
  "gs1:referencedFile": [
    {
      id: "https://files.example.org/files/products/09521002005004/docs/declaration-of-conformity.pdf",
      type: "gs1:ReferencedFileDetails",
      "gs1:referencedFileType": {
        id: "gs1:ReferencedFileTypeCode-DOCUMENT"
      },
      "schema:description": "EU Declaration of Conformity (EU 2023/1542)",
      "gs1:fileLanguageCode": "en"
    },
    {
      id: "https://files.example.org/files/products/09521002005004/docs/test-report.pdf",
      type: "gs1:ReferencedFileDetails",
      "gs1:referencedFileType": {
        id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
      },
      "schema:description": "EU Type Examination Test Report",
      "gs1:fileLanguageCode": "en"
    },
    {
      id: "https://files.example.org/files/products/09521002005004/docs/user-manual.pdf",
      type: "gs1:ReferencedFileDetails",
      "gs1:referencedFileType": {
        id: "gs1:ReferencedFileTypeCode-USER_MANUAL"
      },
      "gs1:fileLanguageCode": "en"
    },
    {
      id: "https://files.example.org/files/products/09521002005004/docs/carbon-footprint-study.pdf",
      type: "gs1:ReferencedFileDetails",
      "gs1:referencedFileType": {
        id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
      },
      "schema:description": "Carbon Footprint Study (ISO 14067)",
      "gs1:fileLanguageCode": "en"
    }
  ]
};

// extensions/eu/battery/examples/portable-ebike-battery.jsonld
var portable_ebike_battery_default = {
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ],
  _comment_gs1_alignment: [
    "Portable / LMT (Light Means of Transport) battery DPP example:",
    "counterpart to the existing EV battery (battery-product.jsonld).",
    "Demonstrates the LightMeansOfTransportBattery category, NMC622",
    "chemistry, lower nominal voltage and capacity, and a second-life",
    "battery status hint (Original; eligible for stationary reuse).",
    "Pattern aligned with EU Battery Regulation 2023/1542 Annex XIII.",
    "GS1 demo prefix 952 (7-digit GCP: 9521234)."
  ],
  id: "https://id.gs1.org/01/09521003000442/21/EB2026-00821",
  type: [
    "gs1:Product",
    "eubat:Battery"
  ],
  "gs1:gtin": "09521003000442",
  "schema:serialNumber": "EB2026-00821",
  "gs1:productName": [
    {
      "@value": "VeloPower e-bike battery pack VP-48V-14Ah",
      "@language": "en"
    },
    {
      "@value": "VeloPower E-Bike-Akku VP-48V-14Ah",
      "@language": "de"
    },
    {
      "@value": "Batterie de v\xE9lo \xE9lectrique VeloPower VP-48V-14Ah",
      "@language": "fr"
    },
    {
      "@value": "Bater\xEDa para e-bike VeloPower VP-48V-14Ah",
      "@language": "es"
    },
    {
      "@value": "VeloPower e-bike accu VP-48V-14Ah",
      "@language": "nl"
    },
    {
      "@value": "VeloPower elcykel-batteripakke VP-48V-14Ah",
      "@language": "da"
    },
    {
      "@value": "Akumulator do roweru elektrycznego VeloPower VP-48V-14Ah",
      "@language": "pl"
    },
    {
      "@value": "VeloPower elcykelbatteri VP-48V-14Ah",
      "@language": "sv"
    },
    {
      "@value": "VeloPower el-sykkelbatteri VP-48V-14Ah",
      "@language": "no"
    },
    {
      "@value": "VeloPower s\xE4hk\xF6py\xF6r\xE4n akku VP-48V-14Ah",
      "@language": "fi"
    },
    {
      "@value": "Batteria per e-bike VeloPower VP-48V-14Ah",
      "@language": "it"
    }
  ],
  "gs1:productDescription": [
    {
      "@value": "48 V / 14 Ah LMT (Light Means of Transport) NMC622 battery pack, eligible for stationary second-life reuse.",
      "@language": "en"
    },
    {
      "@value": "48-V/14-Ah-Akku f\xFCr leichte Elektrofahrzeuge (LMT) auf NMC622-Basis, geeignet f\xFCr die station\xE4re Zweitnutzung.",
      "@language": "de"
    },
    {
      "@value": "Batterie 48 V / 14 Ah pour v\xE9hicules de mobilit\xE9 l\xE9g\xE8re (LMT) en chimie NMC622, \xE9ligible \xE0 un usage stationnaire en seconde vie.",
      "@language": "fr"
    },
    {
      "@value": "Bater\xEDa 48 V / 14 Ah para veh\xEDculos ligeros (LMT) con qu\xEDmica NMC622, apta para reutilizaci\xF3n estacionaria en segunda vida.",
      "@language": "es"
    },
    {
      "@value": "48 V / 14 Ah accu voor lichte elektrische voertuigen (LMT) op NMC622-basis, geschikt voor stationair hergebruik in second life.",
      "@language": "nl"
    },
    {
      "@value": "48 V / 14 Ah batteripakke til lette transportmidler (LMT) baseret p\xE5 NMC622, egnet til station\xE6r second-life-genbrug.",
      "@language": "da"
    },
    {
      "@value": "Akumulator 48 V / 14 Ah do lekkich pojazd\xF3w elektrycznych (LMT) w chemii NMC622, kwalifikuj\u0105cy si\u0119 do stacjonarnego ponownego u\u017Cycia w drugim cyklu \u017Cycia.",
      "@language": "pl"
    },
    {
      "@value": "48 V / 14 Ah batteripaket f\xF6r l\xE4tta elfordon (LMT) i NMC622-kemi, l\xE4mpligt f\xF6r station\xE4r \xE5teranv\xE4ndning i andra liv.",
      "@language": "sv"
    },
    {
      "@value": "48 V / 14 Ah batteripakke for lette elektriske kj\xF8ret\xF8y (LMT) i NMC622-kjemi, egnet for stasjon\xE6r gjenbruk i annen levetid.",
      "@language": "no"
    },
    {
      "@value": "48 V / 14 Ah:n akku kevyisiin s\xE4hk\xF6isiin liikkumisv\xE4lineisiin (LMT), NMC622-kemia, soveltuu kiinte\xE4\xE4n toisen elinkaaren uudelleenk\xE4ytt\xF6\xF6n.",
      "@language": "fi"
    },
    {
      "@value": "Pacco batteria 48 V / 14 Ah per mezzi di mobilit\xE0 leggera (LMT) in chimica NMC622, idoneo al riutilizzo stazionario in seconda vita.",
      "@language": "it"
    }
  ],
  "schema:status": {
    "@id": "eubat:Original"
  },
  "schema:model": {
    "@value": "VP-48V-14Ah",
    "@language": "en"
  },
  "eubat:cellType": {
    "@id": "eubat:CylindricalCell"
  },
  "eubat:numberOfCells": 65,
  "eubat:numberOfModules": 1,
  "gs1:manufacturer": {
    id: "https://id.gs1.org/417/9521987000063",
    type: "gs1:Organization",
    "gs1:organizationName": "VeloPower GmbH",
    "gs1:globalLocationNumber": "9521987000063",
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:streetAddress": "Velomotorstra\xDFe 18",
      "gs1:addressLocality": "Friedrichshafen",
      "gs1:postalCode": "88045",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    }
  },
  "eubat:manufacturingPlace": {
    id: "https://id.gs1.org/414/9521987000070",
    type: "gs1:Place",
    "gs1:globalLocationNumber": "9521987000070",
    "gs1:address": {
      type: "gs1:PostalAddress",
      "gs1:addressLocality": "Friedrichshafen",
      "gs1:addressCountry": {
        type: "gs1:Country",
        "gs1:countryCode": "DE"
      }
    }
  },
  "eubat:operatorInformation": {
    type: "oec:OperatorInformation",
    "gs1:globalLocationNumber": "9521987000063",
    "gs1:organizationName": "VeloPower GmbH",
    "eubat:operatorRole": {
      "@id": "oec:Manufacturer"
    }
  },
  "gs1:netWeight": {
    type: "gs1:QuantitativeValue",
    "gs1:value": 3.6,
    "gs1:unitCode": "KGM"
  },
  "eubat:batteryChemistry": {
    type: "eubat:BatteryChemistry",
    "eubat:cathodeActiveMaterial": "LiNi0.6Mn0.2Co0.2O2",
    "eubat:anodeActiveMaterial": "Graphite",
    "eubat:electrolyteType": {
      "@value": "Liquid organic carbonate-based",
      "@language": "en"
    },
    "schema:name": {
      "@value": "Lithium Nickel Manganese Cobalt Oxide (NMC 6:2:2)",
      "@language": "en"
    },
    "schema:alternateName": "NMC622"
  },
  "eubat:technicalSpecifications": {
    type: "eubat:TechnicalSpecification",
    "eubat:ratedCapacity": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 14,
      "gs1:unitCode": "AMH"
    },
    "eubat:ratedEnergy": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 0.672,
      "gs1:unitCode": "KWH"
    },
    "eubat:nominalVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 48,
      "gs1:unitCode": "VLT"
    },
    "eubat:minimumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 36,
      "gs1:unitCode": "VLT"
    },
    "eubat:maximumVoltage": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 54.6,
      "gs1:unitCode": "VLT"
    },
    "eubat:ratedMaximumPower": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 0.5,
      "gs1:unitCode": "KWT"
    },
    "eubat:expectedCycleLife": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 800,
      "gs1:unitCode": "C62"
    }
  },
  "eubat:recycledContent": {
    type: "eubat:RecycledContent",
    "eubat:lithiumRecycledShare": 4,
    "eubat:lithiumPreConsumerShare": 1,
    "eubat:lithiumPostConsumerShare": 3,
    "eubat:cobaltRecycledShare": 12,
    "eubat:cobaltPreConsumerShare": 4,
    "eubat:cobaltPostConsumerShare": 8,
    "eubat:nickelRecycledShare": 8,
    "eubat:nickelPreConsumerShare": 3,
    "eubat:nickelPostConsumerShare": 5
  },
  "eubat:carbonFootprintDeclaration": {
    type: "eubat:CarbonFootprintDeclaration",
    "eubat:carbonFootprintTotal": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 38.4,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRawMaterialExtraction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 21.6,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintProduction": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 11.2,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintDistribution": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2.6,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintRecycling": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 3,
      "gs1:unitCode": "KGM"
    },
    "eubat:carbonFootprintPerformanceClass": {
      "@id": "eubat:CFClassB"
    },
    "eubat:carbonFootprintDeclarationId": "CFP-2026-VELO-VP48-001",
    "eubat:carbonFootprintGeographicScope": "EU production, mixed material sourcing"
  },
  "eubat:hazardousSubstances": [
    {
      type: "eubat:HazardousSubstance",
      "schema:name": {
        "@value": "Cobalt (cathode active material constituent)",
        "@language": "en"
      },
      "eubat:substanceCasNumber": "7440-48-4",
      "eubat:substanceEcNumber": "231-158-0",
      "eubat:hazardClass": {
        "@id": "eubat:Carcinogenicity"
      },
      "eubat:concentration": 4.8,
      "eubat:substanceLocation": {
        "@id": "eubat:Cathode"
      }
    },
    {
      type: "eubat:HazardousSubstance",
      "schema:name": {
        "@value": "Lithium hexafluorophosphate (LiPF6)",
        "@language": "en"
      },
      "eubat:substanceCasNumber": "21324-40-3",
      "eubat:substanceEcNumber": "244-334-7",
      "eubat:hazardClass": {
        "@id": "eubat:AcuteToxicity"
      },
      "eubat:concentration": 0.9,
      "eubat:substanceLocation": {
        "@id": "eubat:Electrolyte"
      }
    }
  ],
  "gs1:manufacturersWarranty": {
    type: "gs1:WarrantyPromise",
    "gs1:durationOfWarranty": {
      type: "gs1:QuantitativeValue",
      "gs1:value": 2,
      "gs1:unitCode": "ANN"
    },
    "gs1:warrantyScopeDescription": {
      "@value": "Manufacturer warranty: 2 years or 500 charge cycles, whichever comes first. Cell-level capacity fade guaranteed below 20% within the warranty period.",
      "@language": "en"
    }
  },
  "eubat:endOfLifeInfo": {
    type: "eubat:EndOfLifeInfo",
    "eubat:recyclabilityRate": 78,
    "eubat:materialRecoveryTargets": [
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Lithium",
        "eubat:recoveryRate": 50
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Cobalt",
        "eubat:recoveryRate": 90
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Nickel",
        "eubat:recoveryRate": 90
      },
      {
        type: "eubat:MaterialRecoveryTarget",
        "eubat:recoveryMaterial": "Copper",
        "eubat:recoveryRate": 95
      }
    ]
  },
  "eubat:dismantlingDocuments": [
    {
      type: "eubat:DismantlingDocument",
      "oec:documentType": "DismantlingInstructions",
      "eubat:documentUrl": "https://files.example.org/files/products/09521003000442/docs/document.pdf",
      "eubat:mimeType": "application/pdf",
      "eubat:languageCode": "en"
    }
  ],
  "gs1:regulatoryInformation": [
    {
      type: "gs1:RegulatoryInformation",
      "gs1:regulationType": {
        id: "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"
      },
      "gs1:regulatoryAct": "EU 2023/1542",
      "oec:isRegulationCompliant": true
    }
  ],
  "schema:category": {
    "@id": "eubat:LMTBattery"
  }
};

// demos/ec-readiness-checker/app.ts
var matrix = ec_datapoint_applicability_default;
var SAMPLES = [
  { label: "Full battery: model + batch + item (industrial)", docs: [battery_product_model_default, battery_product_batch_default, battery_product_default] },
  { label: "Model passport only (resolver master data)", docs: [battery_product_model_default] },
  { label: "Batch passport only (01+10 Digital Link)", docs: [battery_product_batch_default] },
  { label: "Item passport only (01+21, EPCIS-folded)", docs: [battery_product_default] },
  { label: "Portable e-bike battery (LMT)", docs: [portable_ebike_battery_default] },
  { label: "\u2014 paste your own \u2014", docs: [] }
];
var $ = (id) => document.getElementById(id);
var inputEl = () => $("input");
var OUTCOME_LABEL = {
  fulfilled: "fulfilled",
  missing: "missing",
  conditionOpen: "condition to check",
  optionalAbsent: "optional",
  providedEarly: "provided early",
  notYetRequired: "not yet required",
  notApplicable: "not to be filled"
};
var GROUPS = [
  { title: "Identification & label data \u2014 Art. 77(3), Annex VI Part A (1\u201316)", from: 1, to: 16 },
  { title: "Public passport data \u2014 Annex XIII 1 (17\u201344)", from: 17, to: 44 },
  { title: "Legitimate interest \u2014 Annex XIII 2 (45\u201349)", from: 45, to: 49 },
  { title: "Notified bodies & authorities \u2014 Annex XIII 3 (50)", from: 50, to: 50 },
  { title: "Dynamic, EPCIS-folded \u2014 Annex XIII 4 (51\u201371)", from: 51, to: 71 }
];
function setStatus(msg, err = false) {
  const el = $("status");
  el.textContent = msg;
  el.className = err ? "err" : "";
}
function parseInput() {
  const text = inputEl().value.trim();
  if (!text) throw new Error("paste a passport document first");
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [parsed];
}
function renderResult(r) {
  const badge = `<span class="badge b-${r.outcome}">${OUTCOME_LABEL[r.outcome]}</span>`;
  const chips = (r.lifecycle === "dynamic" ? `<span class="chip">dynamic</span>` : "") + (r.source ? `<span class="chip">${r.source}</span>` : "");
  let detail = "";
  if (r.outcome === "fulfilled") {
    detail = `via ${r.evidence.map((e) => `<code>${e}</code>`).join(", ")}`;
  } else if (r.outcome === "missing" || r.outcome === "conditionOpen") {
    detail = `expected: ${r.expected.map((e) => `<code>${e}</code>`).join(", ")}`;
    if (r.note) detail += ` \u2014 ${r.note}`;
    if (r.lifecycle === "dynamic" && r.epcisExample) {
      detail += ` \xB7 folded from the EPCIS event stream, see <code>${r.epcisExample}</code>`;
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
    setStatus("Checking\u2026");
    const docs = parseInput();
    const cat = $("category").value;
    const asOf = $("asof").value || void 0;
    const report = evaluateReadiness(matrix, docs, {
      category: cat === "auto" ? void 0 : cat,
      asOf
    });
    const s = report.summary;
    $("scorebox").hidden = false;
    $("legend").hidden = false;
    $("scorefill").style.width = `${Math.round(s.score * 100)}%`;
    $("scorefill").style.background = s.missing === 0 ? "var(--ok)" : s.score >= 0.5 ? "var(--warn)" : "var(--err)";
    $("scoretext").textContent = `${s.fulfilled}/${s.mandatory} mandatory (${report.category}${report.categoryDetected ? ", auto" : ""}) \xB7 ${s.missing} missing \xB7 ${s.conditionOpen} conditions`;
    const byNr = new Map(report.results.map((r) => [r.nr, r]));
    $("results").innerHTML = GROUPS.map((g) => {
      const rows = [];
      for (let nr = g.from; nr <= g.to; nr++) rows.push(renderResult(byNr.get(nr)));
      return `<div class="group-head">${g.title}</div>${rows.join("")}`;
    }).join("");
    setStatus(
      report.inForce ? `Checked against EC guidance v${report.document.version} as of ${report.asOf}.` : `Before 2027-02-18 \u2014 the passport duty is not yet in force; this is your preparation status.`
    );
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), true);
  }
}
function loadSample(index) {
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
var sampleEl = $("sample");
for (const [i, s] of SAMPLES.entries()) {
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = s.label;
  sampleEl.appendChild(opt);
}
sampleEl.addEventListener("change", () => loadSample(Number(sampleEl.value)));
$("check").addEventListener("click", check);
$("category").addEventListener("change", check);
$("asof").addEventListener("change", check);
loadSample(0);
