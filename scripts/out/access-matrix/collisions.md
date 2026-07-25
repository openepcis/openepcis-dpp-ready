# Cross-module bare-alias collisions

Served documents are matched by bare local name as well as curie; a name shared
across modules with DIFFERING tiers resolves to the strictest. Differing entries
must be reconciled or explicitly waived (scripts/access-level-waivers.json).

## Differing tiers (action required)

| Local name | Module tiers | Effect |
|---|---|---|
| _none_ | | |

## Same tier in all modules (informational)

| Local name | Module tiers | Effect |
|---|---|---|
| `annualEnergyConsumption` | dpp-core: Public, electronics: Public | consistent |
| `biodegradationPercentage` | dpp-core: Public, detergent: Public | consistent |
| `carbonFootprintDeclaration` | dpp-core: Public, battery: Public | consistent |
| `carbonFootprintDistribution` | dpp-core: Public, battery: Public | consistent |
| `carbonFootprintProduction` | dpp-core: Public, battery: Public | consistent |
| `carbonFootprintStudyUrl` | dpp-core: Public, battery: Public | consistent |
| `carbonFootprintTotal` | dpp-core: Public, battery: Public | consistent |
| `casNumber` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `complianceStatus` | dpp-core: Public, battery: Public | consistent |
| `concentration` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `dataProviderCertification` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `dataQualityAssessment` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `dismantlingInstructions` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `ecNumber` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly, textile: AuthorizedOnly | consistent |
| `energyEfficiency` | dpp-core: Public, electronics: Public | consistent |
| `energyEfficiencyClass` | dpp-core: Public, electronics: Public | consistent |
| `eprelProductUrl` | dpp-core: Public, electronics: Public | consistent |
| `eprelRegistrationNumber` | dpp-core: Public, electronics: Public | consistent |
| `euDeclarationOfConformity` | battery: Public, textile: Public | consistent |
| `expectedLifetimeYears` | battery: Public, textile: Public | consistent |
| `hazardClass` | dpp-core: Public, battery: Public | consistent |
| `hazardousSubstances` | dpp-core: Public, battery: Public, detergent: Public | consistent |
| `isCriticalRawMaterial` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `languageCode` | dpp-core: Public, battery: Public | consistent |
| `lastDataUpdate` | dpp-core: Public, battery: Public | consistent |
| `materialComposition` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `notifiedBody` | battery: AuthorizedOnly, cpr: AuthorizedOnly | consistent |
| `operatorInformation` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `operatorRole` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `powerConsumptionOff` | dpp-core: Public, electronics: Public | consistent |
| `powerConsumptionOn` | dpp-core: Public, electronics: Public | consistent |
| `powerConsumptionStandby` | dpp-core: Public, electronics: Public | consistent |
| `recyclabilityAssessment` | dpp-core: Public, textile: Public | consistent |
| `recyclabilityRate` | dpp-core: Public, battery: Public, electronics: Public | consistent |
| `recyclabilityScore` | dpp-core: Public, textile: Public | consistent |
| `recycledContent` | dpp-core: Public, battery: Public | consistent |
| `repairabilityClass` | dpp-core: Public, electronics: Public | consistent |
| `safeUseInstructions` | dpp-core: Public, textile: Public | consistent |
| `substanceLocation` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `substancesOfConcern` | dpp-core: Public, textile: Public | consistent |
| `takeBackIncentive` | dpp-core: Public, textile: Public | consistent |
| `takeBackUrl` | dpp-core: Public, textile: Public | consistent |
| `thirdPartyAssurancesUrl` | dpp-core: Public, battery: Public | consistent |
| `verificationBody` | dpp-core: Public, battery: Public | consistent |
