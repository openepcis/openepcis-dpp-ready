# SKOS alignment — human review sheet

Generated 2026-06-26 from the QA-verified completeness reports. Each row is a change the gated apply made (bulk grader = `openai/gpt-oss-20b`, QA verifier = `qwen/qwen3-32b`). Tick to sign off; strike + note any you want reverted.

**1080 decisions: 821 add · 7 rewrite · 12 remove.**

## battery (403)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eubat:technicalSpecifications` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#batteryTechnicalProperties | 0.90 | NARROW 0.91 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `eubat:technicalSpecifications` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#nominalVoltage | 0.90 | BROAD 0.81 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:initialInternalResistance` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ohmicResistance | 0.97 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:initialInternalResistance` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#initialInternalResistance | 0.99 | EXACT 0.95 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:roundTripEfficiency` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundtripEfficiency | 0.99 | EXACT 0.97 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:roundTripEfficiency` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyAt50PercentCycleLife | 0.93 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:calculationStandard` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/standard | 0.93 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:ratedMaximumPower` | `skos:exactMatch` | https://ref.openepcis.io/extensions/eu/battery/ratedMaximumPower | 0.95 | EXACT 0.93 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:ratedMaximumPower` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.90 | BROAD 0.80 | panel agrees {EXACT=1, BROAD=2} |
| [ ] | add | `eubat:ratedMaximumPower` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#ratedPower | 0.88 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:ratedEnergy` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedEnergy | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:lifecycleStage` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#lifecycleStage | 0.98 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:lifecycleStage` | `skos:narrowMatch` | https://schema.org/stage | 0.88 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:resultOfTestReport` | `skos:closeMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#resultOfTestReport | 0.99 | BROAD 0.92 | panel agrees a relation but not the grade (bulk EXACT) {EXACT=1, BROAD=2} |
| [ ] | add | `eubat:PowerCapabilityAtSoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#PowerCapabilityAtEntity | 0.80 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:PowerCapabilityAtSoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#BatteryTechnicalPropertiesEntity | 0.90 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPreConsumerShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#preConsumerShare | 0.95 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPreConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.95 | NARROW 0.90 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPreConsumerShare` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.92 | NARROW 0.95 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:cobaltPreConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.97 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPreConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.94 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:roundTripEfficiencyFade` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyFade | 0.99 | EXACT 0.97 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:roundTripEfficiencyFade` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundtripEfficiency | 0.95 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.92 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.90 | NARROW 0.96 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.93 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprint | 0.92 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintRecycling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.92 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumDischargingPower` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:maximumDischargingPower` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#originalPowerCapability | 0.60 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumDischargingPower` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#powerMaximumPermitted | 0.92 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumDischargingPower` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#ratedPower | 0.68 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:recoveryMaterial` | `skos:narrowMatch` | https://schema.org/material | 0.90 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:recoveryMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialName | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:hasBattery` | `skos:narrowMatch` | https://schema.org/hasPart | 0.95 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:componentLocation` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialLocation | 0.95 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:componentLocation` | `skos:narrowMatch` | http://www.w3.org/ns/locn#location | 0.85 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:componentLocation` | `skos:narrowMatch` | https://schema.org/location | 0.60 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:recyclabilityRate` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/recyclabilityRate | 0.95 | EXACT 0.87 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintDeclarationId` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#declarationCode | 0.95 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:ecNumber` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/ecNumber | 0.99 | EXACT 0.88 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:ecNumber` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#componentEcNumber | 0.98 | EXACT 0.80 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.90 | BROAD 0.78 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentPercentage | 0.92 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.95 | BROAD 0.75 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.93 | BROAD 0.80 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledMaterialComposition | 0.95 | BROAD 0.81 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.90 | BROAD 0.77 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentMass | 0.92 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.95 | BROAD 0.80 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentMass | 0.95 | BROAD 0.80 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:NegativeEvent` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#NegativeEventEntity | 0.95 | EXACT 0.88 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:NegativeEvent` | `skos:narrowMatch` | https://schema.org/Event | 0.95 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:puttingIntoService` | `skos:exactMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#puttingIntoService | 0.95 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:authorizedServiceCenters` | `skos:narrowMatch` | https://schema.org/serviceUrl | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:authorizedServiceCenters` | `skos:narrowMatch` | https://ref.gs1.org/voc/serviceInfo | 0.95 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:originalPowerCapability` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#originalPowerCapability | 0.95 | EXACT 0.96 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:originalPowerCapability` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.95 | NARROW 0.92 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add | `eubat:timeSpentInExtremeTemperaturesAboveBoundary` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeHighTempCharging | 0.90 | BROAD 0.86 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:timeSpentInExtremeTemperaturesAboveBoundary` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeHighTemp | 0.98 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:selfDischargeRate` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#currentSelfDischargingRateValue | 0.95 | EXACT 0.86 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:anodeActiveMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.88 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:anodeActiveMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryChemistry | 0.93 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:anodeActiveMaterial` | `skos:narrowMatch` | https://schema.org/activeIngredient | 0.82 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:anodeActiveMaterial` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#materialComposition | 0.92 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:operatorIdentifier` | `skos:narrowMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#operatorInformation | 0.68 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:operatorIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.97 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:documentUrl` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#documentURL | 0.95 | EXACT 0.96 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:documentUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.97 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:documentUrl` | `skos:narrowMatch` | https://schema.org/url | 0.75 | NARROW 0.87 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:absoluteCarbonFootprint` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.97 | EXACT 0.97 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:absoluteCarbonFootprint` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.93 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:absoluteCarbonFootprint` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:broadMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#productIdentifier | 0.92 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:broadMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryPassportIdentifier | 0.80 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.95 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#componentIdentifier | 0.70 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:narrowMatch` | https://ref.gs1.org/voc/globalModelNumber | 0.92 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#identifier | 0.93 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryModelIdentifier` | `skos:narrowMatch` | http://www.w3.org/ns/adms#identifier | 0.70 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:measurementCertificateUrl` | `skos:closeMatch` | https://ref.gs1.org/voc/certificationInfo | 0.75 | NARROW 0.89 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eubat:measurementCertificateUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.80 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumPermittedBatteryPower` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.97 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:BatteryCategory` | `skos:narrowMatch` | https://schema.org/CategoryCodeSet | 0.75 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructions` | `skos:closeMatch` | https://ref.gs1.org/voc/safetyInfo | 0.85 | NARROW 0.88 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `eubat:safetyInstructions` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#safetyInstructions | 0.80 | BROAD 0.84 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructions` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#textileEndOfLifeInstructions | 0.80 | BROAD 0.85 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:operatorRole` | `skos:closeMatch` | https://schema.org/provider | 0.92 | NARROW 0.83 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add | `eubat:operatorRole` | `skos:closeMatch` | http://data.europa.eu/m8g/role | 0.80 | NARROW 0.89 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eubat:supplierContact` | `skos:narrowMatch` | http://data.europa.eu/m8g/contactPoint | 0.92 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:supplierContact` | `skos:broadMatch` | https://ref.gs1.org/voc/afterHoursContact | 0.93 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:supplierContact` | `skos:narrowMatch` | https://schema.org/contactPoint | 0.92 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:supplierContact` | `skos:broadMatch` | http://data.europa.eu/m8g/contactPage | 0.88 | BROAD 0.76 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:supplierContact` | `skos:narrowMatch` | https://ref.gs1.org/voc/contactPoint | 0.93 | NARROW 0.80 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eubat:extinguishingAgent` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#extinguishingAgents | 0.85 | NARROW 0.77 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintDeclaration` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.80 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintDeclaration` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintDeclaration | 0.95 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:carbonFootprintDeclaration` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprint | 0.92 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:renewableContent` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#renewableContent | 0.85 | EXACT 0.92 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:euDeclarationOfConformity` | `skos:exactMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#declarationOfConformity | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:euDeclarationOfConformity` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#euDeclarationOfConformity | 0.95 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:euDeclarationOfConformity` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/conformityCertificate | 0.85 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eubat:hazardImpact` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/hazardImpact | 0.98 | EXACT 0.91 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:hazardClass` | `skos:closeMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceClass | 0.95 | BROAD 0.84 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=3} |
| [ ] | add | `eubat:hazardClass` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/hazardClass | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:stateOfCertifiedEnergy` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfCertifiedEnergyValue | 0.95 | EXACT 0.88 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:stateOfCertifiedEnergy` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfCertifiedEnergy | 0.97 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:stateOfChargeLevel` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfCharge | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:stateOfChargeLevel` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#stateOfCharge | 0.90 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:eventDate` | `skos:exactMatch` | https://vocabulary.uncefact.org/untp/eventDate | 0.95 | EXACT 0.88 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:expectedLifetime` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedLifetime | 0.95 | BROAD 0.92 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=3} |
| [ ] | add | `eubat:expectedLifetime` | `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#expectedLifetimeYears | 0.85 | BROAD 0.92 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:cobaltRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.90 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:cobaltRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.95 | NARROW 0.80 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltRecycledShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.95 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:cobaltRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.92 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:materialComposition` | `skos:closeMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.92 | BROAD 0.91 | panel agrees a relation but not the grade (bulk NARROW) {CLOSE=1, BROAD=2} |
| [ ] | add | `eubat:materialComposition` | `skos:narrowMatch` | https://schema.org/materialExtent | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:materialComposition` | `skos:narrowMatch` | https://schema.org/material | 0.78 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:materialComposition` | `skos:closeMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialName | 0.72 | BROAD 0.94 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:testReportNumber` | `skos:narrowMatch` | https://schema.org/reportNumber | 0.95 | NARROW 0.93 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eubat:remainingPowerCapability` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.95 | NARROW 0.94 | panel agrees a relation but not the grade (bulk EXACT) {EXACT=1, NARROW=2} |
| [ ] | add | `eubat:exposureEndTime` | `skos:closeMatch` | https://schema.org/endTime | 0.82 | NARROW 0.95 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eubat:eventLocation` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#europeanTrackLocation | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:eventLocation` | `skos:broadMatch` | https://schema.org/sportsActivityLocation | 0.88 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:eventLocation` | `skos:narrowMatch` | http://www.w3.org/ns/locn#location | 0.92 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:eventLocation` | `skos:closeMatch` | https://schema.org/pickupLocation | 0.85 | BROAD 0.95 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:safetyMeasures` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#safetyInstructions | 0.78 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:safetyMeasures` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerSafetyInformation | 0.82 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:concentration` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceConcentration | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:internalResistance` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ohmicResistance | 0.70 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:internalResistance` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#initialInternalResistance | 0.92 | BROAD 0.88 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:remainingUsableEnergy` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingEnergy | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#safetyInstructions | 0.98 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#safetyMeasures | 0.96 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | https://ref.gs1.org/voc/safetyInfo | 0.95 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerSafetyInformation | 0.93 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.95 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:safetyInstructionsForDismantling` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/materialSafetyInformation | 0.92 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:isCriticalRawMaterial` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/isCriticalRawMaterial | 0.97 | EXACT 0.91 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:carbonFootprintPerformanceClass` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerformanceClass | 0.98 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:carbonFootprintRawMaterialExtraction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.90 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintRawMaterialExtraction` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprint | 0.70 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:powerFade` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#powerFade | 0.95 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:substanceCasNumber` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceIdentifier | 0.95 | EXACT 0.97 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:cycleCount` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#numberOfFullCycles | 0.95 | EXACT 0.96 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:manufacturerIdentifier` | `skos:exactMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturerInformation | 0.95 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:manufacturerIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.95 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:manufacturerIdentifier` | `skos:narrowMatch` | http://www.w3.org/ns/adms#identifier | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryChemistry` | `skos:closeMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryChemistry | 0.92 | EXACT 0.90 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=3} |
| [ ] | add | `eubat:batteryChemistry` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.88 | BROAD 0.78 | panel agrees {CLOSE=1, BROAD=2} |
| [ ] | add | `eubat:capacityThroughput` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityThroughputValue | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:capacityThroughput` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityThroughput | 0.92 | EXACT 0.96 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:expectedLifetimeYears` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedLifetime | 0.97 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:repurposingPotential` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#wastePrevention | 0.80 | NARROW 0.81 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumVoltage` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#maximumVoltage | 0.85 | EXACT 0.95 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:remainingCapacity` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingCapacity | 0.92 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:remainingCapacity` | `skos:narrowMatch` | https://schema.org/fuelCapacity | 0.70 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:BatteryStatus` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#BatteryConditionEntity | 0.95 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:BatteryStatus` | `skos:narrowMatch` | https://schema.org/StatusEnumeration | 0.92 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:nickelPreConsumerShare` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#preConsumerShare | 0.95 | NARROW 0.77 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelPreConsumerShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.90 | NARROW 0.86 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:nickelPreConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.92 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelPreConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.93 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeHighTempCharging | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:sparePartSources` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#sparePartSources | 0.95 | BROAD 0.89 | panel agrees a relation but not the grade (bulk EXACT) {EXACT=1, BROAD=2} |
| [ ] | add | `eubat:mimeType` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#mimeType | 0.95 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:renewableContentShare` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#renewableContent | 0.98 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:separateCollectionSymbolUrl` | `skos:narrowMatch` | https://schema.org/url | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:recommendedAction` | `skos:closeMatch` | https://schema.org/followup | 0.70 | CLOSE 0.78 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add | `eubat:maximumTemperature` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#maximum | 0.85 | EXACT 0.90 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=3} |
| [ ] | add | `eubat:maximumTemperature` | `skos:broadMatch` | https://ref.gs1.org/voc/maximumOptimumConsumptionTemperature | 0.92 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:ComponentLocation` | `skos:narrowMatch` | http://www.w3.org/ns/locn#Location | 0.90 | NARROW 0.82 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:hazardousSubstances` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstances | 0.92 | BROAD 0.83 | panel agrees {EXACT=1, BROAD=2} |
| [ ] | add | `eubat:hazardousSubstances` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceIdentifier | 0.92 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:energyThroughput` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#energyThroughputValue | 0.97 | EXACT 0.88 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:energyThroughput` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#energyThroughput | 0.78 | BROAD 0.80 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NARROW=1} |
| [ ] | add | `eubat:energyThroughput` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingEnergy | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:notifiedBody` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#notifiedBody | 0.98 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:roundTripEfficiencyAt50PercentCycleLife` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyAt50PercentCycleLife | 0.99 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:roundTripEfficiencyAt50PercentCycleLife` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundtripEfficiency | 0.82 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:roundTripEfficiencyAt50PercentCycleLife` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#efficiency | 0.75 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:remainingRoundTripEfficiency` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingRoundTripEnergyEfficiencyValue | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:remainingRoundTripEfficiency` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundtripEfficiency | 0.95 | EXACT 0.88 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:remainingRoundTripEfficiency` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingRoundTripEnergyEfficiency | 0.92 | EXACT 0.94 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:remainingRoundTripEfficiency` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#roundTripEfficiencyAt50Cycles | 0.82 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.95 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.85 | BROAD 0.80 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.92 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.94 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledMaterialComposition | 0.85 | NARROW 0.89 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelRecycledShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:electrolyteType` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryChemistry | 0.88 | NARROW 0.90 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:electrolyteType` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.92 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:informationOnCollection` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#informationOnCollection | 0.98 | EXACT 0.93 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:lifetimeReferenceTest` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.92 | NARROW 0.95 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:maximumChargingPower` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.92 | EXACT 0.92 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:separateCollection` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#separateCollection | 0.95 | EXACT 0.91 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:dismantlingInstructions` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#dismantlingAndRemovalInformation | 0.95 | BROAD 0.84 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:dismantlingInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:incidentId` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/id | 0.92 | NARROW 0.95 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:lastDataUpdate` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#lastUpdate | 0.95 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:temperatureRangeIdleState` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#temperatureInformation | 0.80 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:dueDiligenceReportUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.80 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:expectedCycleLife` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedNumberOfCycles | 0.85 | EXACT 0.94 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=3} |
| [ ] | add | `eubat:ComplianceStatus` | `skos:narrowMatch` | https://schema.org/StatusEnumeration | 0.75 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintTotal` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.90 | BROAD 0.89 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintTotal` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.95 | EXACT 0.98 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:carbonFootprintTotal` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.85 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintTotal` | `skos:broadMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintDistribution | 0.70 | BROAD 0.89 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:languageCode` | `skos:exactMatch` | https://ref.gs1.org/voc/fileLanguageCode | 0.99 | EXACT 0.97 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:languageCode` | `skos:narrowMatch` | https://schema.org/inLanguage | 0.92 | NARROW 0.77 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPostConsumerShare` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.95 | NARROW 0.86 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add | `eubat:cobaltPostConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentPercentage | 0.90 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cobaltPostConsumerShare` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.93 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:HazardClass` | `skos:narrowMatch` | https://schema.org/Class | 0.95 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:cRateLifeCycleTest` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#cRate | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:atSoC` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfCharge | 0.85 | NARROW 0.88 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `eubat:EndOfLifeInfo` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#DismantlingAndRemovalDocumentation | 0.92 | BROAD 0.85 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:powerCapability` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#originalPowerCapability | 0.92 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:powerCapability` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.88 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:powerCapability` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.95 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:timeSpentChargingDuringExtremeTemperaturesBelowBoundary` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeLowTempCharging | 0.98 | EXACT 0.97 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:manufacturingPlace` | `skos:exactMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturingPlace | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:manufacturingPlace` | `skos:narrowMatch` | https://ref.gs1.org/voc/manufacturingPlant | 0.80 | NARROW 0.84 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cRate` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#cRate | 0.99 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:cRate` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#powerCapabilityRatio | 0.98 | EXACT 0.90 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:numberOfFullCycles` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#numberOfFullCycles | 0.99 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:documentType` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#documentType | 0.70 | NARROW 0.79 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eubat:isSubstanceOfConcern` | `skos:narrowMatch` | https://ref.gs1.org/voc/ingredientOfConcern | 0.80 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:NegativeEventType` | `skos:narrowMatch` | https://schema.org/Event | 0.80 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nickelPostConsumerShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.80 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:nickelPostConsumerShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.95 | NARROW 0.77 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:nickelPostConsumerShare` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryMass` | `skos:exactMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryMass | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:internalResistanceIncrease` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#internalResistanceIncrease | 0.95 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:dismantlingDocuments` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#documents | 0.90 | NARROW 0.96 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:labelMeaning` | `skos:closeMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#labelingMeaning | 0.95 | NARROW 0.83 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add | `eubat:ratedCapacity` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedCapacity | 0.99 | BROAD 0.93 | panel agrees a relation but not the grade (bulk EXACT) {EXACT=1, BROAD=2} |
| [ ] | add | `eubat:CarbonFootprintClass` | `skos:narrowMatch` | https://w3id.org/eudpp#CarbonFootprint | 0.80 | NARROW 0.89 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:CarbonFootprintClass` | `skos:narrowMatch` | https://w3id.org/eudpp#EnvironmentalFootprint | 0.80 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:CarbonFootprintClass` | `skos:narrowMatch` | https://schema.org/Class | 0.90 | NARROW 0.97 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | NARROW 0.90 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintProduction` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprint | 0.88 | NARROW 0.95 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.93 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.92 | NARROW 0.95 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/ConformityAssessment | 0.80 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | https://schema.org/Certification | 0.70 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#Certification | 0.70 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:powerCapabilityAt80SoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#originalPowerCapability | 0.95 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:powerCapabilityAt80SoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.92 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:batteryPassportIdentifier` | `skos:exactMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryPassportIdentifier | 0.95 | EXACT 0.97 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:batteryPassportIdentifier` | `skos:narrowMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#productIdentifier | 0.90 | NARROW 0.92 | panel agrees {EXACT=1, NARROW=2} |
| [ ] | add | `eubat:batteryPassportIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.95 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:batteryPassportIdentifier` | `skos:narrowMatch` | http://www.w3.org/ns/adms#identifier | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:TechnicalSpecification` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#BatteryTechnicalPropertiesEntity | 0.88 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:TechnicalSpecification` | `skos:narrowMatch` | https://schema.org/PropertyValueSpecification | 0.92 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:endOfLifeInfo` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#endOfLifeInformation | 0.95 | BROAD 0.78 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=3} |
| [ ] | add | `eubat:carbonFootprintDistribution` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprint | 0.92 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:carbonFootprintDistribution` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.93 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintDistribution` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.95 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintDistribution` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.92 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:carbonFootprintDistribution` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.75 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:nominalVoltage` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#nominalVoltage | 0.98 | EXACT 0.94 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:wastePrevention` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#wastePrevention | 0.80 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:expectedRemainingCycles` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedNumberOfCycles | 0.95 | NARROW 0.85 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=2, NONE=1} |
| [ ] | add | `eubat:expectedRemainingCycles` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#numberOfFullCycles | 0.75 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:labelSymbol` | `skos:narrowMatch` | https://schema.org/url | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:certifiedUsableEnergy` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedEnergy | 0.95 | EXACT 0.97 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:substanceLocation` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceLocation | 0.95 | EXACT 0.87 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:exhaustionThreshold` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityThresholdForExhaustion | 0.95 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:minimumTemperature` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#minimum | 0.92 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:facilityIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.95 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:facilityIdentifier` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#facilityId | 0.98 | EXACT 0.85 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:facilityIdentifier` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#manufacturingFacility | 0.95 | EXACT 0.88 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:facilityIdentifier` | `skos:closeMatch` | https://ref.gs1.org/voc/gln | 0.92 | EXACT 0.93 | panel agrees a relation but not the grade (bulk NARROW) {EXACT=2, BROAD=1} |
| [ ] | add | `eubat:RecycledContent` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/RecycledContent | 0.95 | EXACT 0.90 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:RecycledContent` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#RecycledContentEntity | 0.88 | BROAD 0.78 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:repurposingGuidelines` | `skos:narrowMatch` | https://schema.org/newsUpdatesAndGuidelines | 0.88 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:verificationDate` | `skos:closeMatch` | https://ref.gs1.org/voc/certificationAuditDate | 0.88 | CLOSE 0.75 | panel agrees {EXACT=1, CLOSE=2} |
| [ ] | add | `eubat:dismantlingAndRemovalInformation` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#dismantlingAndRemovalInformation | 0.80 | BROAD 0.92 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:dismantlingAndRemovalInformation` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryInformation | 0.80 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:dismantlingAndRemovalInformation` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerSafetyInformation | 0.70 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:dataProviderCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certification | 0.90 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:dataProviderCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationIdentification | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:labels` | `skos:closeMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#labels | 0.95 | BROAD 0.87 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:declarationOfConformity` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#euDeclarationOfConformity | 0.97 | EXACT 0.87 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:HazardousSubstance` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#HazardousSubstanceEntity | 0.93 | NARROW 0.86 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `eubat:HazardousSubstance` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeLowTemp | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#timeExtremeLowTempCharging | 0.78 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:materialSupplier` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#nameOfSupplier | 0.99 | EXACT 0.96 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:negativeEvents` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#negativeEvents | 0.99 | NARROW 0.80 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=1, NARROW=2} |
| [ ] | add | `eubat:negativeEvents` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#negativeEvent | 0.85 | BROAD 0.83 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add | `eubat:negativeEvents` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#eventsOvercharge | 0.85 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:casNumber` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialIdentifier | 0.97 | EXACT 0.99 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:cathodeActiveMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryChemistry | 0.95 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cathodeActiveMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.80 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:cathodeActiveMaterial` | `skos:narrowMatch` | https://schema.org/activeIngredient | 0.92 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:cathodeActiveMaterial` | `skos:narrowMatch` | https://schema.org/material | 0.92 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:verificationCertificateUrl` | `skos:narrowMatch` | https://schema.org/hasCertification | 0.70 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:stateOfCharge` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfCharge | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:ResponsibleSourcingStandard` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/Standard | 0.92 | NARROW 0.87 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:capacityFade` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityFade | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:nextScheduledMeasurement` | `skos:narrowMatch` | https://schema.org/scheduledTime | 0.92 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:temperatureRangeDischarging` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#temperatureInformation | 0.60 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:powerCapabilityAt20SoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#originalPowerCapability | 0.92 | NARROW 0.88 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:powerCapabilityAt20SoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.95 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:powerCapabilityAt20SoC` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#ratedMaximumPower | 0.80 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:lithiumRecycledShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.92 | NARROW 0.83 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `eubat:lithiumRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.88 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:lithiumRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#preConsumerShare | 0.92 | BROAD 0.91 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:DismantlingDocumentType` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#DismantlingAndRemovalDocumentation | 0.88 | BROAD 0.78 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=3} |
| [ ] | add | `eubat:DismantlingDocumentType` | `skos:narrowMatch` | https://schema.org/DigitalDocument | 0.93 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:incidentReportUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.92 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:CarbonFootprintDeclaration` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#CarbonFootprintPerLifecycleStageEntity | 0.70 | BROAD 0.78 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.93 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.70 | BROAD 0.85 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#preConsumerShare | 0.80 | BROAD 0.87 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentPercentage | 0.85 | BROAD 0.87 | panel agrees {BROAD=3} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.80 | BROAD 0.89 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.92 | BROAD 0.85 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:leadRecycledShare` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.93 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eubat:BatteryMaterial` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#BatteryMaterialEntity | 0.95 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:BatteryMaterial` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/MaterialComposition | 0.92 | NARROW 0.86 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:expectedNumberOfCycles` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedNumberOfCycles | 0.97 | EXACT 0.94 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eubat:expectedNumberOfCycles` | `skos:narrowMatch` | http://data.europa.eu/m8g/expressionOfExpectedValue | 0.70 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:lithiumPreConsumerShare` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.92 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:roundTripEnergyEfficiency` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#roundtripEfficiency | 0.99 | EXACT 0.94 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:evolutionOfSelfDischarge` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#evolutionOfSelfDischarge | 0.99 | EXACT 0.95 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `eubat:carbonFootprintStudyUrl` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintStudy | 0.99 | EXACT 0.91 | panel agrees {EXACT=3} |
| [ ] | add | `eubat:carbonFootprintStudyUrl` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintStudyUrl | 0.99 | EXACT 0.92 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eubat:DismantlingDocument` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#DismantlingAndRemovalDocumentation | 0.92 | BROAD 0.88 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add | `eubat:DismantlingDocument` | `skos:narrowMatch` | https://schema.org/DigitalDocument | 0.95 | NARROW 0.82 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:electrolyteComposition` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryChemistry | 0.92 | NARROW 0.88 | panel agrees {NARROW=3} |
| [ ] | add | `eubat:electrolyteComposition` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#batteryChemistry | 0.93 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eubat:electrolyteComposition` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.94 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:expectedLifetimeEnergyThroughput` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#energyThroughput | 0.70 | NARROW 0.69 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:carbonFootprintGeographicScope` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/scope | 0.70 | NARROW 0.62 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:recycledContent` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#packagingRecycledContent | 0.92 | BROAD 0.72 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `eubat:NegativeEvent` | `rdfs:seeAlso` | http://data.europa.eu/m8g/Event | 0.90 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:anodeActiveMaterial` | `rdfs:seeAlso` | https://schema.org/material | 0.92 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:operatorIdentifier` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturerInformation | 0.92 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `eubat:complianceStatus` | `rdfs:seeAlso` | https://gs1-epcis-reg.org/rail/voc/data#functionalStatus | 0.68 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:maximumPermittedBatteryPower` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapability | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:labelSubject` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Labels:1.2.0#labelingSubject | 0.88 | CLOSE 0.70 | panel agrees a relation but not the grade (bulk BROAD) {EXACT=1, CLOSE=2} |
| [ ] | add-seealso | `eubat:supplierContact` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#emailAddressOfSupplier | 0.90 | BROAD 0.74 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `eubat:carbonFootprintDeclaration` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.90 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eubat:carbonFootprintDeclaration` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.92 | BROAD 0.74 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eubat:lithiumPostConsumerShare` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#postConsumerShare | 0.95 | NARROW 0.72 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add-seealso | `eubat:temperatureRangeStorage` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#temperatureRangeIdleState | 0.70 | CLOSE 0.70 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add-seealso | `eubat:cobaltRecycledShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.90 | NARROW 0.69 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:cobaltRecycledShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.85 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:cobaltRecycledShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:materialComposition` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialMass | 0.90 | BROAD 0.74 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eubat:materialComposition` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/materialUsed | 0.72 | NARROW 0.65 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:remainingPowerCapability` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#ratedPower | 0.93 | NARROW 0.67 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:safetyMeasures` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#endOfLifeInformation | 0.80 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:safetyInstructionsForDismantling` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/dismantlingInstructions | 0.88 | CLOSE 0.60 | panel agrees a relation but not the grade (bulk NARROW) {CLOSE=2, NARROW=1} |
| [ ] | add-seealso | `eubat:safetyInstructionsForDismantling` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#safetyMeasures | 0.94 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:safetyInstructionsForDismantling` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#safetyDataSheet | 0.92 | NARROW 0.71 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:safetyInstructionsForDismantling` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#endOfLifeInstructions | 0.93 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:carbonFootprintPerformanceClass` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#performance | 0.80 | NARROW 0.69 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:carbonFootprintRawMaterialExtraction` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.80 | NARROW 0.69 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:carbonFootprintRawMaterialExtraction` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.95 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:carbonFootprintRawMaterialExtraction` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#carbonFootprint | 0.90 | NARROW 0.72 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:carbonFootprintRawMaterialExtraction` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.75 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:euDeclarationOfConformityId` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#declarationCode | 0.80 | NARROW 0.60 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:nickelPreConsumerShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.97 | NARROW 0.70 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:separateCollection` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#informationOnCollection | 0.92 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:dismantlingInstructions` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#safetyInstructions | 0.92 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:dueDiligenceReportUrl` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Labels:1.2.0#resultOfTestReport | 0.70 | NARROW 0.68 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:cobaltPostConsumerShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.85 | NARROW 0.74 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:powerCapability` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#powerCapabilityAt | 0.80 | CLOSE 0.70 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add-seealso | `eubat:nickelPostConsumerShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:nickelPostConsumerShare` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentPercentage | 0.95 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:endOfLifeInfo` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#informationOnCollection | 0.90 | BROAD 0.70 | panel agrees {CLOSE=1, BROAD=2} |
| [ ] | add-seealso | `eubat:endOfLifeInfo` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#dismantlingAndRemovalInformation | 0.92 | BROAD 0.75 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `eubat:substanceLocation` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialLocation | 0.70 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:substanceLocation` | `rdfs:seeAlso` | https://schema.org/location | 0.95 | NARROW 0.60 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:substanceLocation` | `rdfs:seeAlso` | http://www.w3.org/ns/locn#location | 0.80 | NARROW 0.50 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:minimumTemperature` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#temperatureRangeIdleState | 0.95 | NARROW 0.70 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:repurposingGuidelines` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#wastePrevention | 0.92 | NARROW 0.74 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:repurposingGuidelines` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#informationOnCollection | 0.93 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:verificationDate` | `rdfs:seeAlso` | https://schema.org/auditDate | 0.82 | CLOSE 0.69 | panel agrees {EXACT=1, CLOSE=2} |
| [ ] | add-seealso | `eubat:dataProviderCertification` | `rdfs:seeAlso` | https://schema.org/hasCertification | 0.90 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eubat:dataProviderCertification` | `rdfs:seeAlso` | https://ref.gs1.org/voc/certificationInfo | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:supplyChainIndex` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.SupplyChainDueDiligence:1.2.0#supplyChainIndicies | 0.93 | NARROW 0.69 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add-seealso | `eubat:declarationOfConformity` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Labels:1.2.0#declarationOfConformity | 0.70 | NARROW 0.55 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:HazardousSubstance` | `rdfs:seeAlso` | https://schema.org/Substance | 0.95 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:CarbonFootprintDeclaration` | `rdfs:seeAlso` | https://w3id.org/eudpp#EnvironmentalFootprint | 0.85 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:CarbonFootprintDeclaration` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/EmissionsPerformance | 0.80 | NARROW 0.60 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eubat:roundTripEnergyEfficiency` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyAt50PercentCycleLife | 0.92 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eubat:roundTripEnergyEfficiency` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#roundTripEfficiencyAt50Cycles | 0.92 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | remove | `eubat:carbonFootprintRecycling` | drop `skos:narrowMatch` | https://ref.gs1.org/voc/sustainabilityInfo | 1.00 | NONE 0.95 | panel majority NONE {NONE=3} |
| [ ] | remove | `eubat:nickelPreConsumerShare` | drop `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.99 | NONE 0.95 | panel majority NONE {NARROW=1, NONE=2} |
| [ ] | remove | `eubat:powerCapabilityRatio` | drop `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#powerEnergyRatio | 0.80 | NONE 0.94 | panel majority NONE {NONE=3} |
| [ ] | remove | `eubat:lithiumRecycledShare` | drop `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.80 | NONE 0.97 | panel majority NONE {NONE=3} |
| [ ] | remove | `eubat:carbonFootprintStudyUrl` | drop `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprintStudy | 0.85 | NONE 0.70 | panel majority NONE {NARROW=1, NONE=2} |
| [ ] | rewrite | `eubat:hazardImpact` | `skos:closeMatch`→`skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#hazardousSubstancesImpact | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | rewrite | `eubat:hazardousSubstances` | `skos:closeMatch`→`skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#hazardousSubstances | 0.95 | EXACT 0.88 | panel agrees {EXACT=3} |

## core (340)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `oec:safeDisassemblyInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.70 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:lastUpdated` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#lastUpdate | 0.70 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:ecNumber` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/ecNumber | 0.97 | EXACT 0.89 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:PassportStatus` | `skos:narrowMatch` | https://schema.org/StatusEnumeration | 0.95 | NARROW 0.86 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:LifecycleStageResult` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#CarbonFootprintPerLifecycleStageEntity | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintDistribution` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.80 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintDistribution` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.90 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `oec:componentName` | `skos:broadMatch` | https://ref.gs1.org/voc/additiveName | 0.70 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:componentName` | `skos:narrowMatch` | https://schema.org/name | 0.95 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:declaredUnit` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#declaredUnit | 0.97 | EXACT 0.80 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:declaredUnit` | `skos:narrowMatch` | https://ref.gs1.org/voc/unitCode | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:exactMatch` | https://vocabulary.uncefact.org/untp/value | 0.98 | EXACT 0.76 | panel agrees {EXACT=3} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://schema.org/textValue | 0.95 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#nominalValue | 0.96 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://schema.org/maxValue | 0.95 | BROAD 0.81 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://ref.gs1.org/voc/authenticitySecurityFeatureValue | 0.92 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://schema.org/valueReference | 0.97 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#topValue | 0.96 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://ref.gs1.org/voc/colourCodeValue | 0.92 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#rightValue | 0.95 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#leftValueString | 0.96 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://ref.gs1.org/voc/additionalProductClassificationValue | 0.97 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:value` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#rightValueString | 0.95 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:takeBackIncentive` | `skos:broadMatch` | https://schema.org/cashBack | 0.70 | BROAD 0.81 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:EnvironmentalProductDeclaration` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#CarbonFootprintPerLifecycleStageEntity | 0.70 | BROAD 0.92 | panel agrees {BROAD=3} |
| [ ] | add | `oec:carbonFootprintUse` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.80 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `oec:MultiLanguageValue` | `skos:narrowMatch` | https://schema.org/StructuredValue | 0.92 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintStudyUrl` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintStudy | 0.98 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `oec:carbonFootprintStudyUrl` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintStudyUrl | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintStudyUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.92 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `oec:passportIssuer` | `skos:narrowMatch` | https://schema.org/issuedBy | 0.95 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.78 | NARROW 0.79 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.93 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.91 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintProduction` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprint | 0.95 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:safeUseInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerUsageInstructions | 0.88 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:safeUseInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.85 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:safeUseInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructionsForUse | 0.93 | NARROW 0.79 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:safeUseInstructions` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#instructionsForUse | 0.88 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:safeUseInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerSafetyInformation | 0.92 | NARROW 0.77 | panel agrees {NARROW=3} |
| [ ] | add | `oec:MaterialComposition` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/MaterialComposition | 0.98 | EXACT 0.89 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:MaterialComposition` | `skos:broadMatch` | https://ref.gs1.org/voc/TextileMaterialDetails | 0.92 | BROAD 0.75 | panel agrees {BROAD=3} |
| [ ] | add | `oec:MaterialComposition` | `skos:broadMatch` | https://ref.gs1.org/voc/PackagingMaterialDetails | 0.93 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:indicatorUnit` | `skos:closeMatch` | https://ref.gs1.org/voc/unitCode | 0.85 | NARROW 0.82 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:remanufacturingDate` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#itemReconditioningDate | 0.97 | BROAD 0.88 | panel agrees {EXACT=1, BROAD=2} |
| [ ] | add | `oec:OperatorRole` | `skos:broadMatch` | https://schema.org/OrganizationRole | 0.85 | BROAD 0.79 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add | `oec:OperatorRole` | `skos:exactMatch` | https://w3id.org/eudpp#EconomicOperatorRole | 0.99 | EXACT 0.91 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:IndividualTradeItemPiece` | `skos:narrowMatch` | https://schema.org/IndividualProduct | 0.92 | NARROW 0.79 | panel agrees {NARROW=3} |
| [ ] | add | `oec:materialCircularityIndicator` | `skos:broadMatch` | https://ref.openepcis.io/extensions/common/core/recyclabilityScore | 0.80 | BROAD 0.80 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:passportStatus` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#dppStatus | 0.98 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `oec:repairabilityInfo` | `skos:closeMatch` | https://ref.gs1.org/voc/serviceInfo | 0.80 | CLOSE 0.82 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add | `oec:preConsumerRecycledContent` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#preConsumerShare | 0.95 | EXACT 0.94 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `oec:preConsumerRecycledContent` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.97 | EXACT 0.81 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:documentType` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/documentType | 1.00 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `oec:documentType` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#documentType | 0.95 | EXACT 0.86 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `oec:documentType` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#europeanAssessmentDocument | 0.90 | BROAD 0.80 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:accessLevel` | `skos:narrowMatch` | https://schema.org/conditionsOfAccess | 0.70 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:componentIdentifier` | `skos:narrowMatch` | https://schema.org/identifier | 0.90 | NARROW 0.87 | panel agrees {NARROW=3} |
| [ ] | add | `oec:componentIdentifier` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialIdentifier | 0.92 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:componentIdentifier` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#componentId | 0.97 | EXACT 0.87 | panel agrees {EXACT=3} |
| [ ] | add | `oec:componentIdentifier` | `skos:narrowMatch` | http://www.w3.org/ns/adms#identifier | 0.92 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:previousPassportVersion` | `skos:narrowMatch` | https://schema.org/predecessorOf | 0.85 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:previousPassportVersion` | `skos:exactMatch` | http://www.w3.org/ns/adms#prev | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:DigitalProductPassport` | `skos:narrowMatch` | https://schema.org/DigitalDocument | 0.85 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:productCategory` | `skos:narrowMatch` | https://schema.org/category | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:productCategory` | `skos:narrowMatch` | https://ref.gs1.org/voc/additionalProductClassificationCode | 0.88 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:productCategory` | `skos:broadMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryCategory | 0.90 | BROAD 0.80 | panel agrees {BROAD=3} |
| [ ] | add | `oec:eprJurisdiction` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/eprJurisdiction | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `oec:eprJurisdiction` | `skos:narrowMatch` | https://schema.org/jurisdiction | 0.92 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `oec:BiodegradabilityTestMethod` | `skos:narrowMatch` | http://data.europa.eu/m8g/Criterion | 0.88 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:indicatorTotalValue` | `skos:narrowMatch` | https://ref.gs1.org/voc/value | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:indicatorTotalValue` | `skos:narrowMatch` | https://schema.org/value | 0.95 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:repairInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/serviceInfo | 0.85 | NARROW 0.88 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `oec:epdProgramOperator` | `skos:narrowMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#operatorInformation | 0.85 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `oec:epdValidUntil` | `skos:exactMatch` | https://schema.org/validUntil | 1.00 | EXACT 0.95 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `oec:epdValidUntil` | `skos:narrowMatch` | https://schema.org/validThrough | 0.95 | NARROW 0.92 | panel agrees {EXACT=1, NARROW=2} |
| [ ] | add | `oec:carbonFootprintRawMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.80 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintRawMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.95 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintRawMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.75 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintDeclaration` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintDeclaration | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:dataProviderCertification` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/dataProviderCertification | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:dataProviderCertification` | `skos:narrowMatch` | https://schema.org/hasCertification | 0.88 | NARROW 0.84 | panel agrees {NARROW=3} |
| [ ] | add | `oec:dataProviderCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certification | 0.92 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:SubstanceOfConcern` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#HazardousSubstanceEntity | 0.80 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `oec:SubstanceOfConcern` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.88 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `oec:SubstanceOfConcern` | `skos:narrowMatch` | https://schema.org/Substance | 0.75 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:ProductCategory` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.78 | NARROW 0.82 | panel agrees {NARROW=3} |
| [ ] | add | `oec:ProductCategory` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.60 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:ProductCategory` | `skos:narrowMatch` | https://schema.org/Product | 0.65 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:ProductCategory` | `skos:closeMatch` | https://ref.gs1.org/voc/FoodBeverageTobaccoProduct | 0.70 | BROAD 0.93 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=2, NONE=1} |
| [ ] | add | `oec:ProductCategory` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#BatteryProduct | 0.97 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:crmListVersion` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/version | 0.85 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:crmListVersion` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#dppSchemaVersion | 0.92 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:crmListVersion` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#versionNumber | 0.91 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:dismantlingInstructions` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/dismantlingInstructions | 0.95 | EXACT 0.91 | panel agrees {EXACT=3} |
| [ ] | add | `oec:dismantlingInstructions` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#disassemblyInstructions | 0.95 | EXACT 0.80 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `oec:dismantlingInstructions` | `skos:broadMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#dismantlingAndRemovalInformation | 0.92 | BROAD 0.79 | panel agrees {BROAD=3} |
| [ ] | add | `oec:dismantlingInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.93 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:hazardClass` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceClass | 0.95 | EXACT 0.93 | panel agrees {EXACT=2, BROAD=1} |
| [ ] | add | `oec:eoriNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryReferenceNumber | 0.78 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:recycledContentDetails` | `skos:broadMatch` | https://vocabulary.uncefact.org/untp/recycledMassFraction | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:recycledContentDetails` | `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentMass | 0.94 | BROAD 0.79 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=3} |
| [ ] | add | `oec:mimeType` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/mimeType | 1.00 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `oec:mimeType` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#mimeType | 0.99 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `oec:depositSchemeOperator` | `skos:closeMatch` | https://schema.org/serviceOperator | 0.75 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `oec:RecyclabilityAssessment` | `skos:narrowMatch` | http://data.europa.eu/m8g/Criterion | 0.95 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:RecyclabilityAssessment` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/ConformityAssessment | 0.95 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:registrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/registryEntry | 0.93 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:registrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryReferenceNumber | 0.96 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `oec:registrationNumber` | `skos:narrowMatch` | https://schema.org/companyRegistration | 0.94 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:DataElementCollection` | `skos:narrowMatch` | https://schema.org/Dataset | 0.68 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:DataElementCollection` | `skos:narrowMatch` | https://schema.org/Collection | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:dueDiligenceReport` | `skos:broadMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#resultOfTestReport | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:energyEfficiencyClass` | `skos:closeMatch` | https://schema.org/hasEnergyEfficiencyCategory | 0.88 | EXACT 0.87 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, NONE=1} |
| [ ] | add | `oec:passportVersion` | `skos:closeMatch` | https://schema.org/version | 0.70 | NARROW 0.78 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:reportingGranularity` | `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#granularity | 0.85 | NARROW 0.77 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:takeBackUrl` | `skos:narrowMatch` | https://schema.org/merchantReturnLink | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:eprRegistrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryReferenceNumber | 0.90 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:elementId` | `skos:narrowMatch` | https://schema.org/identifier | 0.95 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `oec:wastePreventionInfo` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#wastePreventionInfo | 0.98 | EXACT 0.89 | panel agrees {EXACT=3} |
| [ ] | add | `oec:DueDiligenceReport` | `skos:narrowMatch` | https://schema.org/Report | 0.80 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `oec:DueDiligenceReport` | `skos:narrowMatch` | http://data.europa.eu/m8g/Evidence | 0.75 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `oec:DocumentType` | `skos:broadMatch` | https://ref.gs1.org/voc/ReferencedFileTypeCode | 0.95 | BROAD 0.75 | panel agrees {EXACT=1, BROAD=2} |
| [ ] | add | `oec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/EUEnergyEfficiencyEnumeration | 0.98 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `oec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/EnergyConsumptionDetails | 0.90 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `oec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/Class | 0.95 | NARROW 0.99 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:collectionPointDirectoryUrl` | `skos:narrowMatch` | https://schema.org/url | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:collectionPointDirectoryUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.92 | NARROW 0.88 | panel agrees {NARROW=3} |
| [ ] | add | `oec:stageValue` | `skos:closeMatch` | https://ref.gs1.org/voc/value | 0.88 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `oec:stageValue` | `skos:narrowMatch` | https://schema.org/value | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:stageValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | BROAD 0.79 | panel agrees {BROAD=3} |
| [ ] | add | `oec:stageValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#evolutionOfSelfDischargeValue | 0.80 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:stageValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#energyThroughputValue | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:stageValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingEnergyValue | 0.92 | BROAD 0.80 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:stageValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityFadeValue | 0.91 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintTotal` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.95 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintTotal` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.99 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:carbonFootprintTotal` | `skos:broadMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintProduction | 0.95 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:carbonFootprintTotal` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | BROAD 0.88 | panel agrees {BROAD=3} |
| [ ] | add | `oec:carbonFootprintTotal` | `skos:exactMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.98 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `oec:postConsumerRecycledContent` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/recycledMassFraction | 0.70 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `oec:isStrategicRawMaterial` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#isCriticalRawMaterial | 0.85 | NARROW 0.87 | panel agrees {NARROW=3} |
| [ ] | add | `oec:isStrategicRawMaterial` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#criticalRawMaterials | 0.70 | NARROW 0.84 | panel agrees {NARROW=3} |
| [ ] | add | `oec:isStrategicRawMaterial` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/isCriticalRawMaterial | 0.90 | NARROW 0.79 | panel agrees {NARROW=3} |
| [ ] | add | `oec:DepositReturnScheme` | `skos:closeMatch` | https://ref.gs1.org/voc/ReturnablePackageDepositDetails | 0.85 | BROAD 0.77 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add | `oec:facilityId` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#facilityId | 0.95 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `oec:facilityId` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#manufacturingFacility | 0.92 | BROAD 0.88 | panel agrees {BROAD=3} |
| [ ] | add | `oec:RepairProvider` | `skos:broadMatch` | https://schema.org/AutoRepair | 0.75 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:RepairProvider` | `skos:broadMatch` | https://schema.org/MotorcycleRepair | 0.93 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:passportIdentifier` | `skos:broadMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryPassportIdentifier | 0.93 | BROAD 0.90 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:tradeItemPieceNumber` | `skos:closeMatch` | https://schema.org/clipNumber | 0.85 | CLOSE 0.79 | panel agrees {CLOSE=3} |
| [ ] | add | `oec:tradeItemPieceNumber` | `skos:closeMatch` | https://schema.org/episodeNumber | 0.85 | CLOSE 0.77 | panel agrees {CLOSE=2, NONE=1} |
| [ ] | add | `oec:language` | `skos:closeMatch` | https://ref.gs1.org/voc/fileLanguageCode | 0.95 | BROAD 0.92 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=2, NONE=1} |
| [ ] | add | `oec:language` | `skos:narrowMatch` | https://schema.org/inLanguage | 0.97 | NARROW 0.91 | panel agrees {EXACT=1, NARROW=2} |
| [ ] | add | `oec:language` | `skos:narrowMatch` | https://schema.org/subtitleLanguage | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:language` | `skos:broadMatch` | https://schema.org/availableLanguage | 0.95 | BROAD 0.90 | panel agrees {BROAD=3} |
| [ ] | add | `oec:endOfLifeInstructions` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#endOfLifeInformation | 0.88 | NARROW 0.89 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:endOfLifeInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.85 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:endOfLifeInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/sustainabilityInfo | 0.72 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:repairProviderName` | `skos:narrowMatch` | https://schema.org/provider | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:DocumentReference` | `skos:broadMatch` | https://schema.org/APIReference | 0.78 | BROAD 0.93 | panel agrees {BROAD=3} |
| [ ] | add | `oec:DocumentReference` | `skos:narrowMatch` | http://xmlns.com/foaf/0.1/Document | 0.93 | NARROW 0.88 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `oec:DocumentReference` | `skos:broadMatch` | https://schema.org/NoteDigitalDocument | 0.72 | BROAD 0.81 | panel agrees {BROAD=3} |
| [ ] | add | `oec:dppSchemaVersion` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#dppSchemaVersion | 0.99 | EXACT 0.96 | panel agrees {EXACT=3} |
| [ ] | add | `oec:dppSchemaVersion` | `skos:closeMatch` | https://schema.org/schemaVersion | 0.82 | CLOSE 0.80 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add | `oec:concentration` | `skos:exactMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceConcentration | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `oec:HazardousSubstance` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#HazardousSubstanceEntity | 0.88 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:HazardousSubstance` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.80 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `oec:HazardousSubstance` | `skos:narrowMatch` | https://schema.org/Substance | 0.92 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `oec:hazardousSubstances` | `skos:closeMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstances | 0.88 | EXACT 0.92 | panel agrees a relation but not the grade (bulk BROAD) {EXACT=2, BROAD=1} |
| [ ] | add | `oec:tradeItemPieceDescription` | `skos:narrowMatch` | https://schema.org/description | 0.92 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:repairabilityClass` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/repairabilityClass | 0.97 | EXACT 0.84 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:operatorRole` | `skos:closeMatch` | https://ref.gs1.org/voc/organizationRole | 0.80 | NARROW 0.88 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:depositAmount` | `skos:exactMatch` | https://ref.gs1.org/voc/returnablePackageDepositAmount | 0.97 | EXACT 0.93 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:contentSpecificationId` | `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#contentSpecificationIds | 0.80 | EXACT 0.95 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, NONE=1} |
| [ ] | add | `oec:issueDate` | `skos:exactMatch` | https://vocabulary.uncefact.org/untp/issueDate | 1.00 | EXACT 0.92 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:issueDate` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#dateOfIssue | 0.99 | EXACT 0.75 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `oec:recycledContent` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.98 | EXACT 0.87 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.92 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.92 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:recycledContent` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.95 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:economicOperatorId` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#economicOperatorId | 0.98 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:technicalLifetime` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedLifetime | 0.85 | CLOSE 0.75 | panel agrees {CLOSE=3} |
| [ ] | add | `oec:technicalLifetime` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#batteryTechnicalProperties | 0.95 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `oec:activityClassification` | `skos:broadMatch` | https://unstats.un.org/unsd/classifications/Econ/isic | 0.90 | BROAD 0.83 | panel agrees {BROAD=3} |
| [ ] | add | `oec:lastDataUpdate` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/lastDataUpdate | 1.00 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `oec:lastDataUpdate` | `skos:exactMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#lastUpdate | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add | `oec:lastDataUpdate` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#lastUpdate | 0.98 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `oec:recyclabilityScore` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#recyclabilityScore | 0.92 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `oec:depositRedemptionChannelUrl` | `skos:narrowMatch` | https://schema.org/availableChannel | 0.85 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:documentUrl` | `skos:exactMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#documentURL | 0.98 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `oec:documentUrl` | `skos:closeMatch` | https://ref.gs1.org/voc/referencedFile | 0.85 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:utilityFactor` | `skos:narrowMatch` | https://schema.org/measuredProperty | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:lifecycleStage` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#lifecycleStage | 0.88 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:carbonFootprint` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.90 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:carbonFootprint` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#batteryCarbonFootprint | 0.95 | BROAD 0.79 | panel agrees {BROAD=3} |
| [ ] | add | `oec:carbonFootprint` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.92 | BROAD 0.78 | panel agrees {BROAD=3} |
| [ ] | add | `oec:carbonFootprintEndOfLife` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.93 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `oec:carbonFootprintEndOfLife` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.96 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:languageCode` | `skos:exactMatch` | https://ref.gs1.org/voc/fileLanguageCode | 0.99 | EXACT 0.97 | panel agrees {EXACT=3} |
| [ ] | add | `oec:languageCode` | `skos:narrowMatch` | https://schema.org/inLanguage | 0.93 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `oec:usageCycles` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedNumberOfCycles | 0.95 | CLOSE 0.80 | panel agrees a relation but not the grade (bulk EXACT) {CLOSE=2, BROAD=1} |
| [ ] | add | `oec:usageCycles` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#batteryCondition | 0.92 | NARROW 0.86 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:biodegradabilityTestMethod` | `skos:narrowMatch` | https://schema.org/measurementMethod | 0.80 | NARROW 0.89 | panel agrees {NARROW=3} |
| [ ] | add | `oec:dueDiligenceRegulationContext` | `skos:narrowMatch` | http://data.europa.eu/m8g/isDerivedFrom | 0.95 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `oec:dueDiligenceRegulationContext` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/regulation | 0.85 | NARROW 0.77 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:dueDiligenceRegulationContext` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/referenceRegulation | 0.85 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:OperatorInformation` | `skos:closeMatch` | https://ref.gs1.org/voc/OrganizationID_Details | 0.85 | NARROW 0.78 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `oec:OperatorInformation` | `skos:narrowMatch` | https://ref.gs1.org/voc/Organization | 0.92 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `oec:OperatorInformation` | `skos:narrowMatch` | https://w3id.org/eudpp#Actor | 0.90 | NARROW 0.88 | panel agrees {NARROW=3} |
| [ ] | add | `oec:OperatorInformation` | `skos:broadMatch` | https://w3id.org/eudpp#ManufacturerRecord | 0.95 | BROAD 0.93 | panel agrees {BROAD=3} |
| [ ] | add | `oec:OperatorInformation` | `skos:narrowMatch` | http://data.europa.eu/m8g/LegalEntity | 0.92 | NARROW 0.90 | panel agrees {NARROW=3} |
| [ ] | add | `oec:repairProvider` | `skos:narrowMatch` | https://schema.org/provider | 0.95 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `oec:CarbonFootprintDeclaration` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#CarbonFootprintPerLifecycleStageEntity | 0.80 | BROAD 0.83 | panel agrees {BROAD=3} |
| [ ] | add | `oec:identityCredentialUrl` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#verifiableCredential | 0.92 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:energyEfficiency` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/energyEfficiency | 1.00 | EXACT 0.76 | panel agrees {EXACT=3} |
| [ ] | add | `oec:energyEfficiency` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingRoundTripEnergyEfficiency | 0.91 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:energyEfficiency` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#roundTripEfficiencyAt50Cycles | 0.95 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `oec:eprelRegistrationNumber` | `skos:narrowMatch` | https://schema.org/serialNumber | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:recyclabilityAssessment` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/recyclabilityAssessment | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `oec:eprComplianceUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationAgencyURL | 0.70 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `oec:expectedLifespan` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedLifetime | 0.90 | BROAD 0.83 | panel agrees {BROAD=3} |
| [ ] | add | `oec:OperationalScope` | `skos:broadMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#CarbonFootprintPerLifecycleStageEntity | 0.70 | BROAD 0.81 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:componentName` | `rdfs:seeAlso` | https://ref.gs1.org/voc/ingredientName | 0.70 | BROAD 0.55 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | https://schema.org/value | 0.95 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | https://schema.org/codeValue | 0.80 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | https://ref.gs1.org/voc/certificationValue | 0.90 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | http://data.europa.eu/m8g/hasValue | 0.85 | BROAD 0.74 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | http://data.europa.eu/m8g/value | 0.92 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | https://ref.gs1.org/voc/value | 0.90 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | http://data.europa.eu/m8g/expressionOfExpectedValue | 0.93 | BROAD 0.69 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:value` | `rdfs:seeAlso` | https://ref.gs1.org/voc/originalCodeValue | 0.90 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:TraceabilityPerformance` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/PerformanceMetric | 0.93 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:materialCircularityIndicator` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#recyclabilityScore | 0.75 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialCircularityIndicator` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/recyclabilityAssessment | 0.92 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:circularityPerformance` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#performance | 0.72 | NARROW 0.73 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:lifecycleStageResult` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.85 | BROAD 0.65 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:SingleValuedDataElement` | `rdfs:seeAlso` | https://schema.org/QuantitativeValue | 0.90 | NARROW 0.73 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:SingleValuedDataElement` | `rdfs:seeAlso` | https://ref.gs1.org/voc/QuantitativeValue | 0.93 | NARROW 0.70 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:preConsumerRecycledContent` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.92 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:preConsumerRecycledContent` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/recyclableContent | 0.80 | NARROW 0.60 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:preConsumerRecycledContent` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/recycledMassFraction | 0.72 | NARROW 0.67 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:preConsumerRecycledContent` | `rdfs:seeAlso` | https://ref.gs1.org/voc/textileMaterialContent | 0.80 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:emissionsPerformance` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#performance | 0.92 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:carbonFootprintRawMaterial` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.70 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:dismantlingInstructions` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#dismantlingInformation | 0.95 | CLOSE 0.74 | panel agrees a relation but not the grade (bulk EXACT) {CLOSE=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#recycledContentPercentage | 0.92 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.93 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/recyclableContent | 0.88 | NARROW 0.63 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContent | 0.96 | BROAD 0.74 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentPercentage | 0.95 | BROAD 0.70 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledMaterialComposition | 0.93 | BROAD 0.63 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContent | 0.80 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentMass | 0.96 | BROAD 0.63 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContentDetails` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.94 | BROAD 0.66 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:professionalRepairNetwork` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#repairServices | 0.95 | NARROW 0.73 | panel agrees a relation but not the grade (bulk EXACT) {CLOSE=1, NARROW=2} |
| [ ] | add-seealso | `oec:professionalRepairNetwork` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#repairService | 0.85 | NARROW 0.74 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:professionalRepairNetwork` | `rdfs:seeAlso` | http://data.europa.eu/m8g/contactPage | 0.70 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:depositSchemeOperator` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#economicOperator | 0.92 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:facilityCertifications` | `rdfs:seeAlso` | https://ref.gs1.org/voc/certificationIdentification | 0.95 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:facilityInformation` | `rdfs:seeAlso` | https://schema.org/cvdFacilityId | 0.85 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:operatorInformation` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#operatorInformation | 0.95 | BROAD 0.72 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=2, NARROW=1} |
| [ ] | add-seealso | `oec:operatorInformation` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturerInformation | 0.88 | BROAD 0.73 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:dueDiligenceReport` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.SupplyChainDueDiligence:1.2.0#supplyChainDueDiligenceReport | 0.97 | BROAD 0.73 | panel agrees a relation but not the grade (bulk EXACT) {BROAD=3} |
| [ ] | add-seealso | `oec:energyEfficiencyClass` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/energyEfficiencyClass | 0.99 | EXACT 0.72 | panel agrees {EXACT=3} |
| [ ] | add-seealso | `oec:energyEfficiencyClass` | `rdfs:seeAlso` | https://schema.org/energyEfficiencyScaleMin | 0.94 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:operationalScope` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#lifecycleStage | 0.70 | NARROW 0.68 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/textileMaterialContent | 0.80 | BROAD 0.69 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#fibreComposition | 0.92 | BROAD 0.63 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#packagingMaterialCompositionQuantity | 0.70 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledMaterialComposition | 0.88 | BROAD 0.74 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/textileMaterialDescription | 0.90 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.95 | BROAD 0.72 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/textileMaterial | 0.85 | BROAD 0.68 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/packagingMaterial | 0.85 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/packagingMaterialType | 0.90 | BROAD 0.75 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#packagingMaterialType | 0.90 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledMaterial | 0.90 | BROAD 0.68 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:materialComposition` | `rdfs:seeAlso` | https://ref.gs1.org/voc/upperMaterialType | 0.95 | BROAD 0.69 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:EnergyEfficiency` | `rdfs:seeAlso` | https://schema.org/EUEnergyEfficiencyEnumeration | 0.93 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:reportUrl` | `rdfs:seeAlso` | https://ref.gs1.org/voc/referencedFileURL | 0.90 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:reportUrl` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.SupplyChainDueDiligence:1.2.0#supplyChainDueDiligenceReport | 0.92 | NARROW 0.69 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:DocumentType` | `rdfs:seeAlso` | https://schema.org/SpreadsheetDigitalDocument | 0.70 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:performanceClass` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#energyEfficiencyClass | 0.90 | CLOSE 0.72 | panel agrees {EXACT=1, CLOSE=2} |
| [ ] | add-seealso | `oec:performanceClass` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/energyEfficiencyClass | 0.95 | CLOSE 0.60 | panel agrees a relation but not the grade (bulk EXACT) {EXACT=1, CLOSE=2} |
| [ ] | add-seealso | `oec:performanceClass` | `rdfs:seeAlso` | https://schema.org/energyEfficiencyScaleMax | 0.92 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:stageValue` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingPowerCapabilityValue | 0.90 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:stageValue` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#numberOfFullCyclesValue | 0.85 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:stageValue` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingCapacityValue | 0.92 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:stageValue` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityThroughputValue | 0.90 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:stageValue` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#internalResistanceIncreaseValue | 0.90 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:postConsumerRecycledContent` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.92 | BROAD 0.72 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add-seealso | `oec:hazardousSubstances` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceIdentifier | 0.92 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:hazardousSubstances` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceClass | 0.94 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:hazardousSubstances` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#substancesOfConcern | 0.78 | CLOSE 0.59 | panel agrees {CLOSE=2, NONE=1} |
| [ ] | add-seealso | `oec:tradeItemPieceDescription` | `rdfs:seeAlso` | https://ref.gs1.org/voc/productDescription | 0.88 | NARROW 0.68 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:tradeItemPieceDescription` | `rdfs:seeAlso` | https://ref.gs1.org/voc/offerDescription | 0.85 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:tradeItemPieceDescription` | `rdfs:seeAlso` | https://ref.gs1.org/voc/additionalProductDescription | 0.92 | NARROW 0.71 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:substanceLocation` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceLocation | 0.92 | BROAD 0.67 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:substanceLocation` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterialLocation | 0.92 | BROAD 0.65 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:substanceLocation` | `rdfs:seeAlso` | http://www.w3.org/ns/locn#location | 0.92 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:operatorRole` | `rdfs:seeAlso` | http://data.europa.eu/m8g/role | 0.70 | NARROW 0.72 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:depositAmount` | `rdfs:seeAlso` | https://schema.org/amount | 0.97 | NARROW 0.72 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:substancesOfConcern` | `rdfs:seeAlso` | https://ref.gs1.org/voc/ingredientOfConcern | 0.78 | CLOSE 0.71 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add-seealso | `oec:substancesOfConcern` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstances | 0.70 | BROAD 0.68 | panel agrees {BROAD=2, NARROW=1} |
| [ ] | add-seealso | `oec:complianceDate` | `rdfs:seeAlso` | https://ref.gs1.org/voc/certificationAuditDate | 0.65 | CLOSE 0.70 | panel agrees {EXACT=1, CLOSE=2} |
| [ ] | add-seealso | `oec:complianceDate` | `rdfs:seeAlso` | https://schema.org/auditDate | 0.60 | CLOSE 0.69 | panel agrees {CLOSE=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContent` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#recycledContent | 0.70 | BROAD 0.73 | panel agrees {CLOSE=1, BROAD=2} |
| [ ] | add-seealso | `oec:recycledContent` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#packagingRecycledContent | 0.92 | BROAD 0.72 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:recycledContent` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerRecycledContentPercentage | 0.85 | BROAD 0.73 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:economicOperatorId` | `rdfs:seeAlso` | https://ref.gs1.org/voc/additionalOrganizationID | 0.95 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:carbonFootprint` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.93 | BROAD 0.71 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:FacilityInformation` | `rdfs:seeAlso` | http://data.europa.eu/m8g/InformationConcept | 0.92 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:FacilityInformation` | `rdfs:seeAlso` | http://www.w3.org/ns/locn#Location | 0.93 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:carbonFootprintEndOfLife` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.88 | NARROW 0.74 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `oec:carbonFootprintEndOfLife` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#carbonFootprintAbsolute | 0.94 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:carbonFootprintEndOfLife` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#carbonFootprint | 0.88 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:carbonFootprintEndOfLife` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprint | 0.70 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:OperatorInformation` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#EconomicOperatorRole | 0.78 | BROAD 0.74 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:depositReturnScheme` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/referenceScheme | 0.88 | NARROW 0.64 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:depositReturnScheme` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/idScheme | 0.92 | NARROW 0.62 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:CustomsCommodityCodeType` | `rdfs:seeAlso` | https://schema.org/CategoryCode | 0.70 | NARROW 0.67 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:CustomsCommodityCodeType` | `rdfs:seeAlso` | https://ref.gs1.org/voc/TypeCode | 0.85 | NARROW 0.64 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:guaranteedLifespan` | `rdfs:seeAlso` | https://schema.org/durationOfWarranty | 0.80 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:RecycledContent` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#RecycledContentEntity | 0.80 | BROAD 0.68 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `oec:RecycledContent` | `rdfs:seeAlso` | https://ref.gs1.org/voc/PackagingDetails | 0.70 | NARROW 0.61 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:identityCredentialUrl` | `rdfs:seeAlso` | https://ref.gs1.org/voc/referencedFileURL | 0.95 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:dataElement` | `rdfs:seeAlso` | https://schema.org/itemListElement | 0.78 | NARROW 0.65 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `oec:energyEfficiency` | `rdfs:seeAlso` | https://schema.org/energyEfficiencyScaleMax | 0.90 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:energyEfficiency` | `rdfs:seeAlso` | https://schema.org/energyEfficiencyScaleMin | 0.88 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:energyEfficiency` | `rdfs:seeAlso` | https://schema.org/hasEnergyConsumptionDetails | 0.95 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:energyEfficiency` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyFade | 0.90 | BROAD 0.71 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `oec:energyEfficiency` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#roundTripEfficiencyAt50PercentCycleLife | 0.92 | BROAD 0.73 | panel agrees {BROAD=2, NONE=1} |
| [ ] | remove | `oec:EnvironmentalProductDeclaration` | drop `skos:closeMatch` | https://dpp-keystone.org/spec/v2/terms#EPDBlock | 0.70 | NONE 0.94 | panel majority NONE {BROAD=1, NONE=2} |
| [ ] | remove | `oec:compostabilityStandard` | drop `skos:narrowMatch` | https://ref.gs1.org/voc/certificationStandard | 0.99 | NONE 0.95 | panel majority NONE {NARROW=1, NONE=2} |
| [ ] | remove | `oec:dppSchemaVersion` | drop `skos:narrowMatch` | https://schema.org/version | 0.95 | NONE 0.98 | panel majority NONE {NARROW=1, NONE=2} |
| [ ] | remove | `oec:FacilityInformation` | drop `skos:closeMatch` | https://vocabulary.uncefact.org/untp/Facility | 0.85 | NONE 0.92 | panel majority NONE {NARROW=1, NONE=2} |
| [ ] | rewrite | `oec:DocumentReference` | `skos:closeMatch`→`skos:broadMatch` | https://ref.gs1.org/voc/ReferencedFileDetails | 0.88 | BROAD 0.93 | panel agrees {BROAD=3} |

## cpr (30)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eucpr:characteristicName` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#characteristicName | 0.98 | EXACT 0.90 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProduct` | `skos:broadMatch` | https://schema.org/IndividualProduct | 0.92 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProduct` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.97 | NARROW 0.84 | panel agrees {NARROW=3} |
| [ ] | add | `eucpr:ConstructionProduct` | `skos:narrowMatch` | https://schema.org/Product | 0.95 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:narrowMatch` | https://ref.gs1.org/voc/value | 0.92 | NARROW 0.88 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eucpr:characteristicValue` | `skos:narrowMatch` | https://schema.org/value | 0.92 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://schema.org/strengthValue | 0.85 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://schema.org/maxValue | 0.88 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://schema.org/doseValue | 0.88 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://schema.org/minValue | 0.88 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#rightValue | 0.93 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | https://gs1-epcis-reg.org/rail/voc/data#leftValue | 0.90 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:narrowMatch` | http://data.europa.eu/m8g/providesValueFor | 0.92 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#stateOfChargeValue | 0.95 | BROAD 0.91 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingCapacityValue | 0.75 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#evolutionOfSelfDischargeValue | 0.70 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#energyThroughputValue | 0.75 | BROAD 0.92 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityThroughputValue | 0.93 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#internalResistanceIncreaseValue | 0.85 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#remainingEnergyValue | 0.96 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:characteristicValue` | `skos:broadMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#capacityFadeValue | 0.90 | BROAD 0.96 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:DeclarationOfPerformance` | `skos:narrowMatch` | https://schema.org/Certification | 0.92 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#Product | 0.93 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.94 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:broadMatch` | https://schema.org/IndividualProduct | 0.97 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#BatteryProduct | 0.92 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:narrowMatch` | https://schema.org/Product | 0.95 | NARROW 0.94 | panel agrees {NARROW=3} |
| [ ] | add | `eucpr:ConstructionProductType` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#IronSteelProduct | 0.85 | BROAD 0.95 | panel agrees {BROAD=3} |
| [ ] | add | `eucpr:validationReports` | `skos:broadMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#resultOfTestReport | 0.75 | BROAD 0.82 | panel agrees {CLOSE=1, BROAD=2} |
| [ ] | add-seealso | `eucpr:EssentialCharacteristic` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#ProductCharacteristic | 0.85 | NARROW 0.68 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |

## detergent (31)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eudet:DetergentCategory` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.78 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:DetergentProduct` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/Product | 0.95 | NARROW 0.86 | panel agrees {NARROW=3} |
| [ ] | add | `eudet:DetergentProduct` | `skos:narrowMatch` | https://schema.org/Product | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:FragranceAllergen` | `skos:narrowMatch` | https://ref.gs1.org/voc/AllergenDetails | 0.92 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `eudet:FragranceAllergen` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.95 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:ProductForm` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.95 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eudet:allergenCasNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/hasAllergen | 0.80 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:allergenCasNumber` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#componentCasNumber | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:allergenCasNumber` | `skos:closeMatch` | https://ref.openepcis.io/extensions/common/core/casNumber | 0.90 | NARROW 0.88 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add | `eudet:filmBiodegradabilityPercentage` | `skos:closeMatch` | https://ref.openepcis.io/extensions/common/core/biodegradationPercentage | 0.90 | NARROW 0.85 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eudet:BiodegradabilityTestMethod` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/BiodegradabilityTestMethod | 0.95 | EXACT 0.90 | panel agrees {EXACT=2, NARROW=1} |
| [ ] | add | `eudet:BiodegradabilityTestMethod` | `skos:narrowMatch` | http://data.europa.eu/m8g/Criterion | 0.75 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:testDurationDays` | `skos:narrowMatch` | https://schema.org/activityDuration | 0.70 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:intendedUse` | `skos:closeMatch` | https://schema.org/potentialUse | 0.85 | NARROW 0.83 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `eudet:intendedUse` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerUsageInstructions | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:testMethod` | `skos:closeMatch` | https://schema.org/measurementMethod | 0.85 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eudet:phosphorusContentPercent` | `skos:narrowMatch` | https://ref.gs1.org/voc/ingredientContentPercentage | 0.95 | NARROW 0.82 | panel agrees {NARROW=3} |
| [ ] | add | `eudet:recommendedDosage` | `skos:closeMatch` | https://schema.org/doseValue | 0.85 | NARROW 0.76 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eudet:safetyDataSheet` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#safetyDataSheet | 0.95 | EXACT 0.95 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eudet:safetyDataSheet` | `skos:narrowMatch` | https://ref.gs1.org/voc/safetyInfo | 0.70 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:safetyDataSheet` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/materialSafetyInformation | 0.80 | NARROW 0.83 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eudet:ingredientList` | `skos:broadMatch` | https://ref.gs1.org/voc/ingredientName | 0.80 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudet:ingredientList` | `skos:broadMatch` | https://schema.org/activeIngredient | 0.90 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudet:SurfactantType` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.85 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:hazardousSubstances` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceClass | 0.90 | BROAD 0.84 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudet:hazardousSubstances` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/substancesOfConcern | 0.78 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:hazardousSubstances` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#textileSubstancesOfConcern | 0.65 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudet:productForm` | `skos:closeMatch` | https://ref.gs1.org/voc/productFormDescription | 0.98 | NARROW 0.87 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add-seealso | `eudet:ProductForm` | `rdfs:seeAlso` | https://schema.org/Product | 0.95 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eudet:fragranceAllergens` | `rdfs:seeAlso` | https://ref.gs1.org/voc/hasAllergen | 0.95 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eudet:Ingredient` | `rdfs:seeAlso` | https://schema.org/ChemicalSubstance | 0.92 | NARROW 0.68 | panel agrees {NARROW=3} |

## electronics (59)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `euelec:DeviceCategory` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.90 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:iec62474DslVersion` | `skos:closeMatch` | https://schema.org/assemblyVersion | 0.60 | NARROW 0.87 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `euelec:iec62474DslVersion` | `skos:narrowMatch` | https://schema.org/schemaVersion | 0.90 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:refreshRate` | `skos:narrowMatch` | https://ref.gs1.org/voc/value | 0.95 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:weeeRegistrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/registryEntry | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:weeeRegistrationNumber` | `skos:narrowMatch` | https://schema.org/companyRegistration | 0.80 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:weeeRegistrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryReferenceNumber | 0.95 | NARROW 0.91 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:WEEECategory` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.80 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:energyEfficiency` | `skos:broadMatch` | https://schema.org/energyEfficiencyScaleMax | 0.95 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `euelec:energyEfficiency` | `skos:narrowMatch` | https://schema.org/hasEnergyEfficiencyCategory | 0.90 | NARROW 0.93 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:energyEfficiency` | `skos:narrowMatch` | https://schema.org/hasEnergyConsumptionDetails | 0.92 | NARROW 0.87 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:componentType` | `skos:broadMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#batteryCategory | 0.60 | BROAD 0.83 | panel agrees {BROAD=3} |
| [ ] | add | `euelec:firmwareVersion` | `skos:closeMatch` | https://schema.org/softwareVersion | 0.80 | NARROW 0.93 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `euelec:modelIdentifier` | `skos:narrowMatch` | http://www.w3.org/ns/adms#identifier | 0.93 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:energyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/hasEnergyConsumptionDetails | 0.70 | NARROW 0.78 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:weeeRegistrationCountry` | `skos:closeMatch` | https://schema.org/addressCountry | 0.92 | NARROW 0.94 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `euelec:weeeRegistrationCountry` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/addressCountry | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:sparePartPrice` | `skos:closeMatch` | https://schema.org/priceSpecification | 0.99 | NARROW 0.90 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=3} |
| [ ] | add | `euelec:sparePartPrice` | `skos:closeMatch` | https://ref.gs1.org/voc/priceSpecification | 0.99 | NARROW 0.88 | panel agrees a relation but not the grade (bulk EXACT) {NARROW=2, NONE=1} |
| [ ] | add | `euelec:sparePartPrice` | `skos:narrowMatch` | https://schema.org/price | 0.92 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:newVersion` | `skos:narrowMatch` | https://schema.org/softwareVersion | 0.90 | NARROW 0.83 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:newVersion` | `skos:narrowMatch` | https://schema.org/assemblyVersion | 0.88 | NARROW 0.91 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:screenResolutionHeight` | `skos:narrowMatch` | https://schema.org/height | 0.93 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:screenResolutionHeight` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/height | 0.92 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:screenResolutionHeight` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#height | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:screenDiagonal` | `skos:narrowMatch` | https://ref.gs1.org/voc/value | 0.95 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:updateSource` | `skos:narrowMatch` | https://schema.org/source | 0.92 | NARROW 0.93 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `euelec:osVersion` | `skos:closeMatch` | https://schema.org/softwareVersion | 0.85 | CLOSE 0.75 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add | `euelec:EnergyEfficiency` | `skos:broadMatch` | https://schema.org/EUEnergyEfficiencyEnumeration | 0.92 | BROAD 0.84 | panel agrees {BROAD=3} |
| [ ] | add | `euelec:EnergyEfficiency` | `skos:narrowMatch` | https://schema.org/EnergyEfficiencyEnumeration | 0.80 | NARROW 0.88 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `euelec:eprelRegistrationNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/regulatoryVerificationNumber | 0.92 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:recyclabilityRate` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/recyclabilityRate | 0.98 | EXACT 0.90 | panel agrees {EXACT=3} |
| [ ] | add | `euelec:RoHSCompliance` | `skos:narrowMatch` | https://schema.org/Certification | 0.92 | NARROW 0.82 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `euelec:updateChannel` | `skos:narrowMatch` | https://schema.org/availableChannel | 0.88 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:updateChannel` | `skos:narrowMatch` | http://data.europa.eu/m8g/hasChannel | 0.88 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:WEEECompliance` | `skos:narrowMatch` | https://ref.gs1.org/voc/RegulatoryInformation | 0.92 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:materialDeclaration` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#isCriticalRawMaterial | 0.93 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `euelec:materialDeclaration` | `skos:broadMatch` | https://ref.gs1.org/voc/packagingMaterialType | 0.96 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `euelec:rohsDeclarationUrl` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#certificationUrl | 0.80 | NARROW 0.76 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:rohsDeclarationUrl` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Labels:1.2.0#resultOfTestReport | 0.70 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:rohsDeclarationUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.95 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/EUEnergyEfficiencyEnumeration | 0.92 | NARROW 0.86 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://schema.org/EnergyEfficiencyEnumeration | 0.97 | NARROW 0.82 | panel agrees {NARROW=3} |
| [ ] | add | `euelec:EnergyEfficiencyClass` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/EnergyEfficiency | 0.92 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:latestUpdateDate` | `skos:closeMatch` | urn:samm:io.BatteryPass.Performance:1.2.1#lastUpdate | 0.80 | NARROW 0.80 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `euelec:EURepairabilityClass` | `skos:narrowMatch` | https://schema.org/Class | 0.90 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `euelec:componentPartNumber` | `skos:closeMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#partNumber | 0.85 | EXACT 0.97 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=3} |
| [ ] | add | `euelec:criterionMaxScore` | `skos:closeMatch` | https://schema.org/bestRating | 0.80 | CLOSE 0.83 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add-seealso | `euelec:billOfMaterials` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#batteryMaterials | 0.60 | BROAD 0.68 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `euelec:energyEfficiencyClass` | `rdfs:seeAlso` | https://schema.org/hasEnergyEfficiencyCategory | 0.85 | NARROW 0.69 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `euelec:RepairCriterion` | `rdfs:seeAlso` | https://schema.org/Rating | 0.80 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `euelec:ComponentType` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#Component | 0.70 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `euelec:securityUpdateEndDate` | `rdfs:seeAlso` | https://schema.org/endDate | 0.80 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `euelec:RepairCriterionType` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/RepairabilityInfo | 0.70 | NARROW 0.67 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `euelec:RepairCriterionType` | `rdfs:seeAlso` | http://data.europa.eu/m8g/Criterion | 0.95 | NARROW 0.68 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `euelec:RepairCriterionType` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/Criterion | 0.80 | NARROW 0.66 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `euelec:ReplacementDifficulty` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/RepairabilityInfo | 0.85 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | remove | `euelec:modelIdentifier` | drop `skos:narrowMatch` | https://schema.org/model | 0.95 | NONE 0.00 | panel split {EXACT=1, NARROW=1, NONE=1} |
| [ ] | rewrite | `euelec:powerConsumptionOff` | `skos:closeMatch`→`skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/powerConsumptionOff | 0.95 | EXACT 0.92 | panel agrees {EXACT=2, NONE=1} |

## eudr (41)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eudr:DueDiligenceStatement` | `skos:narrowMatch` | https://schema.org/Statement | 0.97 | NARROW 0.84 | panel agrees {NARROW=3} |
| [ ] | add | `eudr:dueDiligenceStatement` | `skos:closeMatch` | urn:samm:io.BatteryPass.SupplyChainDueDiligence:1.2.0#supplyChainDueDiligenceReport | 0.68 | NARROW 0.86 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add | `eudr:originList` | `skos:closeMatch` | https://ref.gs1.org/voc/countryOfOriginStatement | 0.92 | NARROW 0.84 | panel agrees a relation but not the grade (bulk BROAD) {BROAD=1, NARROW=2} |
| [ ] | add | `eudr:originList` | `skos:broadMatch` | https://ref.gs1.org/voc/countryOfOrigin | 0.93 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:exemptionScopeReference` | `skos:narrowMatch` | https://ref.gs1.org/voc/hasBatchLotNumber | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:fscCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationIdentification | 0.95 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `eudr:fscCertification` | `skos:narrowMatch` | https://schema.org/certificationIdentification | 0.95 | NARROW 0.77 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add | `eudr:fscCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationType | 0.88 | NARROW 0.86 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:fscCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationInfo | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:fscCertification` | `skos:broadMatch` | https://ref.gs1.org/voc/certificationStartDate | 0.97 | BROAD 0.95 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:fscCertification` | `skos:broadMatch` | https://ref.gs1.org/voc/certificationEndDate | 0.96 | BROAD 0.96 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:fscCertification` | `skos:broadMatch` | https://ref.gs1.org/voc/certificationAuditDate | 0.95 | BROAD 0.97 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:transformationLocation` | `skos:narrowMatch` | https://schema.org/location | 0.92 | NARROW 0.92 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eudr:transformationLocation` | `skos:narrowMatch` | http://www.w3.org/ns/locn#location | 0.80 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:transformationLocation` | `skos:broadMatch` | https://schema.org/sportsActivityLocation | 0.85 | BROAD 0.94 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:geofence` | `skos:narrowMatch` | http://data.europa.eu/m8g/coordinates | 0.93 | NARROW 0.92 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eudr:geofence` | `skos:narrowMatch` | http://www.w3.org/ns/locn#geometry | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:TimberProductType` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:TimberProductType` | `skos:narrowMatch` | https://schema.org/Product | 0.97 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:TimberProductType` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/Product | 0.98 | NARROW 0.92 | panel agrees {NARROW=3} |
| [ ] | add | `eudr:TimberProductType` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#Product | 0.90 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:exemptionEffectiveFrom` | `skos:narrowMatch` | https://schema.org/validFrom | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:originDetails` | `skos:broadMatch` | https://vocabulary.uncefact.org/untp/originCountry | 0.85 | BROAD 0.84 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:originDetails` | `skos:closeMatch` | https://ref.gs1.org/voc/countryOfOriginStatement | 0.88 | BROAD 0.88 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=2, NONE=1} |
| [ ] | add | `eudr:originDetails` | `skos:broadMatch` | https://ref.gs1.org/voc/provenanceStatement | 0.90 | BROAD 0.85 | panel agrees {CLOSE=1, BROAD=2} |
| [ ] | add | `eudr:originDetails` | `skos:closeMatch` | https://schema.org/countryOfOrigin | 0.92 | BROAD 0.92 | panel agrees a relation but not the grade (bulk NARROW) {BROAD=2, NONE=1} |
| [ ] | add | `eudr:originDetails` | `skos:broadMatch` | https://ref.gs1.org/voc/countryOfOrigin | 0.95 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:volumeCubicMeters` | `skos:narrowMatch` | https://ref.gs1.org/voc/grossVolume | 0.95 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:producerIdentification` | `skos:closeMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturerInformation | 0.88 | CLOSE 0.77 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add | `eudr:countryList` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryOfOriginStatement | 0.92 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eudr:countryList` | `skos:broadMatch` | https://ref.gs1.org/voc/countryOfOrigin | 0.95 | BROAD 0.95 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:countryList` | `skos:broadMatch` | https://vocabulary.uncefact.org/untp/originCountry | 0.70 | BROAD 0.88 | panel agrees {BROAD=3} |
| [ ] | add | `eudr:countryList` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#countryOfOrigin | 0.70 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:countryList` | `skos:broadMatch` | https://vocabulary.uncefact.org/untp/countryOfProduction | 0.95 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:countryList` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#meltAndPourCountry | 0.90 | BROAD 0.77 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eudr:riskAssessmentDate` | `skos:closeMatch` | https://vocabulary.uncefact.org/untp/assessmentDate | 0.85 | NARROW 0.92 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add | `eudr:ActorRole` | `skos:narrowMatch` | https://schema.org/Role | 0.92 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eudr:exemptionEffectiveUntil` | `skos:closeMatch` | https://schema.org/validUntil | 0.88 | NARROW 0.87 | panel agrees a relation but not the grade (bulk CLOSE) {CLOSE=1, NARROW=2} |
| [ ] | add-seealso | `eudr:originList` | `rdfs:seeAlso` | https://schema.org/countryOfOrigin | 0.85 | NARROW 0.72 | panel agrees a relation but not the grade (bulk BROAD) {BROAD=1, NARROW=2} |
| [ ] | add-seealso | `eudr:ActorRole` | `rdfs:seeAlso` | https://schema.org/OrganizationRole | 0.92 | BROAD 0.75 | panel agrees {BROAD=2, NONE=1} |
| [ ] | rewrite | `eudr:exemptionEffectiveFrom` | `skos:narrowMatch`→`skos:closeMatch` | https://ref.gs1.org/voc/regulatoryReferenceApplicabilityStartDate | 0.85 | CLOSE 0.83 | panel agrees {CLOSE=3} |

## fsma204 (2)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `usfsma:FoodTraceabilityList` | `skos:broadMatch` | https://ref.gs1.org/voc/FruitsVegetables | 0.80 | BROAD 0.82 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `usfsma:foodTraceabilityListCategory` | `skos:narrowMatch` | https://schema.org/category | 0.92 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |

## iron-steel (36)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://schema.org/addressCountry | 0.92 | NARROW 0.92 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:closeMatch` | https://schema.org/countryOfOrigin | 0.80 | NARROW 0.85 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryOfOriginStatement | 0.80 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/countryOfProduction | 0.85 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryOfOrigin | 0.90 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryCode | 0.85 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/countryOfOperation | 0.88 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:meltAndPourCountry` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/countryName | 0.90 | NARROW 0.76 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:purchaserOrder` | `skos:narrowMatch` | https://schema.org/orderNumber | 0.90 | NARROW 0.85 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eusteel:productNumber` | `skos:exactMatch` | https://schema.org/mpn | 0.99 | EXACT 0.95 | panel agrees {EXACT=3} |
| [ ] | add | `eusteel:productNumber` | `skos:narrowMatch` | https://schema.org/serialNumber | 0.92 | NARROW 0.86 | panel agrees {NARROW=3} |
| [ ] | add | `eusteel:productNumber` | `skos:closeMatch` | https://schema.org/productID | 0.85 | NARROW 0.83 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eusteel:productNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/productID | 0.93 | NARROW 0.87 | panel agrees {NARROW=3} |
| [ ] | add | `eusteel:heatNumber` | `skos:closeMatch` | https://ref.gs1.org/voc/hasBatchLotNumber | 0.75 | NARROW 0.88 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:lotNumber` | `skos:narrowMatch` | https://schema.org/serialNumber | 0.90 | NARROW 0.87 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:mtcInspectionType` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationType | 0.95 | NARROW 0.77 | panel agrees {NARROW=3} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#ConstructionProduct | 0.95 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:narrowMatch` | https://ref.gs1.org/voc/Product | 0.95 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/Product | 0.95 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#Product | 0.97 | NARROW 0.89 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:broadMatch` | https://schema.org/IndividualProduct | 0.98 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eusteel:IronSteelProduct` | `skos:narrowMatch` | https://schema.org/Product | 0.96 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:cbamReportId` | `skos:closeMatch` | https://schema.org/reportNumber | 0.80 | NARROW 0.85 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eusteel:castNumber` | `skos:narrowMatch` | https://schema.org/serialNumber | 0.95 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:castNumber` | `skos:narrowMatch` | https://ref.gs1.org/voc/batchLot | 0.75 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eusteel:mtcNominalSize` | `skos:closeMatch` | https://ref.gs1.org/voc/sizeDimension | 0.80 | NARROW 0.76 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add | `eusteel:mtcNominalSize` | `skos:narrowMatch` | https://gs1-epcis-reg.org/rail/voc/data#setNominalValues | 0.80 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:meltAndPourCountry` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#productionLocationCountry | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:meltAndPourCountry` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/addressCountry | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:meltAndPourCountry` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#addressCountry | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:meltAndPourCountry` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#countryOfOrigin | 0.90 | NARROW 0.72 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eusteel:meltAndPourCountry` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/countryCode | 0.90 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:mtcSteelProcess` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/processCategory | 0.78 | NARROW 0.60 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eusteel:heatNumber` | `rdfs:seeAlso` | https://schema.org/serialNumber | 0.88 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | rewrite | `eusteel:technologyRoute` | `skos:closeMatch`→`skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#technologyRoute | 0.95 | EXACT 0.88 | panel agrees {EXACT=3} |
| [ ] | rewrite | `eusteel:MaterialTestCertificate` | `skos:closeMatch`→`skos:narrowMatch` | https://schema.org/Certification | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |

## ppwr (5)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `euppwr:harmonisedSymbol` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#separateCollectionSymbol | 0.80 | BROAD 0.83 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `euppwr:Packaging` | `skos:narrowMatch` | https://ref.gs1.org/voc/PackagingDetails | 0.90 | NARROW 0.80 | panel agrees {NARROW=3} |
| [ ] | add | `euppwr:Packaging` | `skos:broadMatch` | https://ref.gs1.org/voc/ReturnablePackageDepositDetails | 0.85 | BROAD 0.88 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `euppwr:Packaging` | `skos:broadMatch` | https://ref.gs1.org/voc/PackagingMaterialDetails | 0.85 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `euppwr:RecyclabilityGrade` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/CircularityPerformance | 0.70 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |

## textile (133)

| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |
|---|---|---|---|---|---|---|---|
| [ ] | add | `eutex:nonTextilePartsRating` | `skos:narrowMatch` | https://schema.org/ratingValue | 0.92 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:garmentType` | `skos:narrowMatch` | https://schema.org/category | 0.95 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:dyeingFacility` | `skos:narrowMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturingPlace | 0.92 | NARROW 0.91 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:dyeingFacility` | `skos:narrowMatch` | https://ref.gs1.org/voc/manufacturingPlant | 0.95 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:sizeRange` | `skos:narrowMatch` | https://schema.org/size | 0.92 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:sizeRange` | `skos:narrowMatch` | https://ref.gs1.org/voc/size | 0.70 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:organicContentMass` | `skos:narrowMatch` | https://schema.org/fiberContent | 0.85 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:lciaUnit` | `skos:narrowMatch` | https://ref.gs1.org/voc/unitCode | 0.70 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:endOfLifeHandling` | `skos:narrowMatch` | https://ref.gs1.org/voc/sustainabilityInfo | 0.60 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:sparePartsAvailable` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#sparePartsAvailable | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eutex:weavingFacility` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#facilityId | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:weavingFacility` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/modifiedAtFacility | 0.90 | NARROW 0.79 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:fabricType` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/materialType | 0.88 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:fiberOrigin` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryOfOrigin | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:fiberOrigin` | `skos:narrowMatch` | https://ref.gs1.org/voc/countryOfOriginStatement | 0.95 | NARROW 0.88 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:fiberOrigin` | `skos:narrowMatch` | https://schema.org/countryOfOrigin | 0.92 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:verificationCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationType | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:verificationCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationInfo | 0.92 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:TextileCategory` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.90 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:TextileCategory` | `skos:narrowMatch` | https://schema.org/CategoryCodeSet | 0.90 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:SubstanceOfConcernType` | `skos:narrowMatch` | https://schema.org/Substance | 0.85 | NARROW 0.93 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:chemicalPurpose` | `skos:narrowMatch` | https://schema.org/potentialUse | 0.88 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:visualInspection` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#visualInspection | 0.95 | EXACT 0.92 | panel agrees {EXACT=3} |
| [ ] | add | `eutex:lciaValue` | `skos:narrowMatch` | https://ref.gs1.org/voc/value | 0.95 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:lciaValue` | `skos:narrowMatch` | http://data.europa.eu/m8g/value | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:lciaValue` | `skos:narrowMatch` | https://schema.org/value | 0.80 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:lciaValue` | `skos:narrowMatch` | http://data.europa.eu/m8g/providesValueFor | 0.80 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:takeBackProgram` | `skos:broadMatch` | https://ref.openepcis.io/extensions/common/core/takeBackUrl | 0.70 | BROAD 0.78 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eutex:takeBackProgram` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#endOfLifeInformation | 0.85 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:organicContentPercentage` | `skos:narrowMatch` | https://ref.gs1.org/voc/organicPercentClaim | 0.95 | NARROW 0.77 | panel agrees {CLOSE=1, NARROW=2} |
| [ ] | add | `eutex:organicContentPercentage` | `skos:narrowMatch` | urn:samm:io.BatteryPass.Circularity:1.2.0#renewableContent | 0.85 | NARROW 0.92 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:additionalCareInstructions` | `skos:narrowMatch` | https://schema.org/additionalProperty | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:visualInspectionTestMethod` | `skos:closeMatch` | https://schema.org/measurementMethod | 0.80 | NARROW 0.75 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add | `eutex:recycledContentDeclaration` | `skos:narrowMatch` | https://ref.gs1.org/voc/textileMaterialContent | 0.92 | NARROW 0.83 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:TakeBackProgram` | `skos:narrowMatch` | https://schema.org/Service | 0.95 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:takeBackUrl` | `skos:exactMatch` | https://ref.openepcis.io/extensions/common/core/takeBackUrl | 0.98 | EXACT 0.92 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eutex:takeBackUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/sustainabilityInfo | 0.92 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:safeUseInstructions` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#safeUseInstructions | 0.98 | EXACT 0.93 | panel agrees {EXACT=2, NONE=1} |
| [ ] | add | `eutex:safeUseInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/consumerSafetyInformation | 0.80 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:VisualInspectionResult` | `skos:narrowMatch` | https://schema.org/Rating | 0.93 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:maxConcentration` | `skos:narrowMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceConcentration | 0.70 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:ApparelSubcategory` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#PefcrApparelAccessories | 0.75 | BROAD 0.87 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eutex:RecycledContentDeclaration` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/RecycledContent | 0.92 | NARROW 0.81 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:cutAndSewFacility` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/fromFacility | 0.93 | NARROW 0.79 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:cutAndSewFacility` | `skos:narrowMatch` | https://ref.gs1.org/voc/manufacturingPlant | 0.96 | NARROW 0.79 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:RobustnessAssessment` | `skos:narrowMatch` | https://schema.org/Rating | 0.95 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:locationInProduct` | `skos:narrowMatch` | https://ref.gs1.org/voc/locationDescription | 0.60 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:carbonFootprintManufacturing` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprint | 0.85 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:carbonFootprintManufacturing` | `skos:narrowMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerLifecycleStage | 0.70 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:carbonFootprintManufacturing` | `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal | 0.85 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:TextileApparel` | `skos:broadMatch` | https://dpp-keystone.org/spec/v2/terms#PefcrShirtsAndBlouses | 0.92 | BROAD 0.85 | panel agrees {BROAD=3} |
| [ ] | add | `eutex:repairGuideUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/referencedFileURL | 0.78 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:repairGuideUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.88 | NARROW 0.79 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:DurabilityClass` | `skos:narrowMatch` | https://schema.org/Class | 0.95 | NARROW 0.94 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:carbonFootprintClass` | `skos:closeMatch` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#carbonFootprintPerformanceClass | 0.80 | CLOSE 0.77 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add | `eutex:seasonCollection` | `skos:narrowMatch` | https://ref.gs1.org/voc/seasonCalendarYear | 0.95 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:seasonCollection` | `skos:narrowMatch` | https://ref.gs1.org/voc/seasonName | 0.90 | NARROW 0.75 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:seasonCollection` | `skos:broadMatch` | https://ref.gs1.org/voc/seasonParameter | 0.92 | BROAD 0.93 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add | `eutex:careInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructions | 0.90 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:careInstructions` | `skos:narrowMatch` | https://ref.gs1.org/voc/instructionsForUse | 0.90 | NARROW 0.81 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:euEcolabel` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/productLabel | 0.90 | NARROW 0.83 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:euEcolabel` | `skos:narrowMatch` | https://ref.gs1.org/voc/compulsoryAdditionalLabelInformation | 0.90 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:CareSymbolCode` | `skos:narrowMatch` | https://schema.org/CategoryCode | 0.95 | NARROW 0.90 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:finishingFacility` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/facility | 0.96 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:spinningFacility` | `skos:narrowMatch` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturingPlace | 0.80 | NARROW 0.78 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:fiberCertification` | `skos:narrowMatch` | https://schema.org/certificationIdentification | 0.90 | NARROW 0.80 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:fiberCertification` | `skos:narrowMatch` | https://ref.gs1.org/voc/certificationInfo | 0.88 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:SubstanceOfConcern` | `skos:narrowMatch` | https://schema.org/ChemicalSubstance | 0.90 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:colorFastness` | `skos:narrowMatch` | https://schema.org/ratingValue | 0.95 | NARROW 0.88 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:fabricAppearanceRating` | `skos:narrowMatch` | https://schema.org/ratingValue | 0.92 | NARROW 0.79 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:substanceConcentration` | `skos:broadMatch` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceConcentration | 0.80 | BROAD 0.86 | panel agrees {BROAD=3} |
| [ ] | add | `eutex:dimensionalChangeScore` | `skos:narrowMatch` | https://vocabulary.uncefact.org/untp/score | 0.90 | NARROW 0.82 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:lciaCategoryCode` | `skos:narrowMatch` | https://schema.org/category | 0.90 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:syntheticFiberContent` | `skos:narrowMatch` | https://ref.gs1.org/voc/textileMaterialContent | 0.95 | NARROW 0.76 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:syntheticFiberContent` | `skos:narrowMatch` | https://ref.gs1.org/voc/ingredientContentPercentage | 0.92 | NARROW 0.77 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:environmentalFootprint` | `skos:exactMatch` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprint | 0.99 | EXACT 0.93 | panel agrees {EXACT=3} |
| [ ] | add | `eutex:environmentalFootprint` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprintGeneralInfo | 0.60 | NARROW 0.78 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:environmentalFootprint` | `skos:narrowMatch` | https://dpp-keystone.org/spec/v2/terms#carbonFootprintAbsolute | 0.75 | NARROW 0.84 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:sparePartsUrl` | `skos:narrowMatch` | https://ref.gs1.org/voc/purchaseSuppliesOrAccessories | 0.97 | NARROW 0.85 | panel agrees {NARROW=3} |
| [ ] | add | `eutex:elastaneContentPercent` | `skos:narrowMatch` | https://ref.gs1.org/voc/textileMaterialPercentage | 0.70 | NARROW 0.85 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add | `eutex:elastaneContentPercent` | `skos:narrowMatch` | https://ref.gs1.org/voc/ingredientContentPercentage | 0.80 | NARROW 0.93 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:lciaUnit` | `rdfs:seeAlso` | https://schema.org/unitCode | 0.80 | NARROW 0.75 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:endOfLifeHandling` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Circularity:1.2.0#endOfLifeInformation | 0.70 | NARROW 0.70 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:endOfLifeHandling` | `rdfs:seeAlso` | https://ref.gs1.org/voc/consumerRecyclingInstructions | 0.70 | NARROW 0.73 | panel agrees a relation but not the grade (bulk BROAD) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:spiralityTestMethod` | `rdfs:seeAlso` | https://schema.org/measurementMethod | 0.80 | NARROW 0.73 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add-seealso | `eutex:spiralityTestMethod` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#testMethod | 0.90 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:weavingFacility` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturingPlace | 0.70 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:weavingFacility` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/facility | 0.90 | NARROW 0.73 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:EnvironmentalFootprint` | `rdfs:seeAlso` | https://w3id.org/eudpp#CarbonFootprint | 0.95 | BROAD 0.65 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eutex:energyUsage` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/common/core/annualEnergyConsumption | 0.70 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:secondaryMaterialFraction` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#materialComposition | 0.80 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:secondaryMaterialFraction` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#packagingMaterialCompositionQuantity | 0.70 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:secondaryMaterialFraction` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/massFraction | 0.90 | NARROW 0.71 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:recycledContentDeclaration` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledMaterialComposition | 0.75 | BROAD 0.60 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eutex:recycledContentDeclaration` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerRecycledContentMass | 0.80 | BROAD 0.70 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eutex:spiralityScore` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/score | 0.80 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:apparelSubcategory` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/productCategory | 0.93 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:apparelSubcategory` | `rdfs:seeAlso` | https://ref.gs1.org/voc/additionalProductClassification | 0.70 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:safeUseInstructions` | `rdfs:seeAlso` | https://ref.gs1.org/voc/consumerUsageInstructions | 0.85 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:safeUseInstructions` | `rdfs:seeAlso` | https://ref.gs1.org/voc/instructions | 0.75 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:robustnessAssessment` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/assessedPerformance | 0.93 | NARROW 0.66 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:wasteOriginType` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#preConsumerTypeOfWaste | 0.80 | EXACT 0.70 | panel agrees a relation but not the grade (bulk CLOSE) {EXACT=2, NONE=1} |
| [ ] | add-seealso | `eutex:wasteOriginType` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#postConsumerTypeOfWaste | 0.72 | BROAD 0.58 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eutex:dimensionalChangePercentage` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#dimensionalChange | 0.88 | CLOSE 0.60 | panel agrees {CLOSE=2, NARROW=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://schema.org/countryOfAssembly | 0.92 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.GeneralProductInformation:1.2.0#manufacturingPlace | 0.92 | NARROW 0.66 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#manufacturingFacility | 0.93 | NARROW 0.65 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/madeAtFacility | 0.95 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/producedAtFacility | 0.94 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/modifiedAtFacility | 0.92 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:cutAndSewFacility` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#facilityId | 0.93 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:RecyclabilityAssessment` | `rdfs:seeAlso` | https://schema.org/Rating | 0.92 | NARROW 0.64 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:RobustnessAssessment` | `rdfs:seeAlso` | https://ref.openepcis.io/extensions/eu/textile/DurabilityInfo | 0.80 | NARROW 0.68 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:locationInProduct` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.MaterialComposition:1.2.0#hazardousSubstanceLocation | 0.70 | BROAD 0.60 | panel agrees {BROAD=3} |
| [ ] | add-seealso | `eutex:dimensionalChangeTestMethod` | `rdfs:seeAlso` | https://schema.org/measurementMethod | 0.85 | NARROW 0.68 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add-seealso | `eutex:substancesOfConcern` | `rdfs:seeAlso` | https://ref.gs1.org/voc/ingredientOfConcern | 0.80 | NARROW 0.73 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:carbonFootprintManufacturing` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.CarbonFootprint:1.2.0#absoluteCarbonFootprint | 0.85 | NARROW 0.73 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:benchmarkPerformance` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#environmentalFootprintBenchmarkPercentage | 0.95 | EXACT 0.72 | panel agrees {EXACT=2, CLOSE=1} |
| [ ] | add-seealso | `eutex:benchmarkPerformance` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#carbonFootprintBenchmarkPercentage | 0.92 | BROAD 0.62 | panel agrees {BROAD=2, NONE=1} |
| [ ] | add-seealso | `eutex:careInstructions` | `rdfs:seeAlso` | https://ref.gs1.org/voc/consumerUsageInstructions | 0.90 | NARROW 0.75 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:careInstructions` | `rdfs:seeAlso` | https://dpp-keystone.org/spec/v2/terms#instructionsForUse | 0.80 | NARROW 0.73 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:technicalRecyclabilityScore` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/score | 0.92 | NARROW 0.74 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:technicalRecyclabilityScore` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/profileScore | 0.94 | NARROW 0.71 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:finishingFacility` | `rdfs:seeAlso` | https://vocabulary.uncefact.org/untp/modifiedAtFacility | 0.80 | NARROW 0.72 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:finishingFacility` | `rdfs:seeAlso` | https://ref.gs1.org/voc/manufacturingPlant | 0.93 | NARROW 0.64 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:fiberCertification` | `rdfs:seeAlso` | https://ref.gs1.org/voc/certificationIdentification | 0.92 | NARROW 0.70 | panel agrees {NARROW=2, NONE=1} |
| [ ] | add-seealso | `eutex:SubstanceOfConcern` | `rdfs:seeAlso` | https://schema.org/Substance | 0.80 | NARROW 0.74 | panel agrees {NARROW=3} |
| [ ] | add-seealso | `eutex:substanceConcentration` | `rdfs:seeAlso` | https://ref.gs1.org/voc/ingredientContentPercentage | 0.70 | CLOSE 0.72 | panel agrees {CLOSE=2, BROAD=1} |
| [ ] | add-seealso | `eutex:lciaCategoryCode` | `rdfs:seeAlso` | https://schema.org/hasCategoryCode | 0.80 | NARROW 0.72 | panel agrees a relation but not the grade (bulk CLOSE) {NARROW=3} |
| [ ] | add-seealso | `eutex:syntheticFiberContent` | `rdfs:seeAlso` | https://ref.gs1.org/voc/textileMaterialPercentage | 0.80 | NARROW 0.70 | panel agrees {BROAD=1, NARROW=2} |
| [ ] | add-seealso | `eutex:expectedLifetimeYears` | `rdfs:seeAlso` | urn:samm:io.BatteryPass.Performance:1.2.1#expectedLifetime | 0.88 | BROAD 0.70 | panel agrees a relation but not the grade (bulk CLOSE) {BROAD=2, NONE=1} |
| [ ] | remove | `eutex:recycledContentSource` | drop `skos:narrowMatch` | https://ref.openepcis.io/extensions/common/core/recycledContent | 0.80 | NONE 0.88 | panel majority NONE {NONE=3} |
| [ ] | remove | `eutex:repairServices` | drop `skos:narrowMatch` | https://ref.gs1.org/voc/serviceInfo | 0.95 | NONE 0.97 | panel majority NONE {NARROW=1, NONE=2} |

