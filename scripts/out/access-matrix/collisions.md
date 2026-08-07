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
| `biodegradationPercentage` | dpp-core: Public, detergent: Public | consistent |
| `carbonFootprintStudyUrl` | dpp-core: Public, battery: Public | consistent |
| `casNumber` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `concentration` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `dataProviderCertification` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `dataQualityAssessment` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `ecNumber` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly, textile: AuthorizedOnly | consistent |
| `eprelProductUrl` | dpp-core: Public, electronics: Public | consistent |
| `eprelRegistrationNumber` | dpp-core: Public, electronics: Public | consistent |
| `expectedLifetimeYears` | battery: Public, textile: Public | consistent |
| `hasAnnualEnergyConsumption` | dpp-core: Public, electronics: Public | consistent |
| `hasCarbonFootprintDeclaration` | dpp-core: Public, battery: Public | consistent |
| `hasCarbonFootprintDistribution` | dpp-core: Public, battery: Public | consistent |
| `hasCarbonFootprintProduction` | dpp-core: Public, battery: Public | consistent |
| `hasDismantlingInstructions` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `hasEnergyEfficiency` | dpp-core: Public, electronics: Public | consistent |
| `hasEnergyEfficiencyClass` | dpp-core: Public, electronics: Public | consistent |
| `hasEuDeclarationOfConformity` | battery: Public, textile: Public | consistent |
| `hasHazardClass` | dpp-core: Public, battery: Public | consistent |
| `hasHazardousSubstances` | dpp-core: Public, battery: Public, detergent: Public | consistent |
| `hasMaterialComposition` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `hasNotifiedBody` | battery: AuthorizedOnly, cpr: AuthorizedOnly | consistent |
| `hasOperatorInformation` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `hasOperatorRole` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `hasPowerConsumptionOff` | dpp-core: Public, electronics: Public | consistent |
| `hasPowerConsumptionOn` | dpp-core: Public, electronics: Public | consistent |
| `hasPowerConsumptionStandby` | dpp-core: Public, electronics: Public | consistent |
| `hasRecyclabilityAssessment` | dpp-core: Public, textile: Public | consistent |
| `hasSubstancesOfConcern` | dpp-core: Public, textile: Public | consistent |
| `hasVerificationBody` | dpp-core: Public, battery: Public | consistent |
| `isCriticalRawMaterial` | dpp-core: AuthorizedOnly, battery: AuthorizedOnly | consistent |
| `languageCode` | dpp-core: Public, battery: Public | consistent |
| `lastDataUpdate` | dpp-core: Public, battery: Public | consistent |
| `recyclabilityRate` | dpp-core: Public, battery: Public, electronics: Public | consistent |
| `recyclabilityScore` | dpp-core: Public, textile: Public | consistent |
| `safeUseInstructions` | dpp-core: Public, textile: Public | consistent |
| `takeBackIncentive` | dpp-core: Public, textile: Public | consistent |
| `takeBackUrl` | dpp-core: Public, textile: Public | consistent |
| `thirdPartyAssurancesUrl` | dpp-core: Public, battery: Public | consistent |
