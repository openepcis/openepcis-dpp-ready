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
| `carbonFootprintStudyUrl` | dpp-core: Public, battery: Public | consistent |
| `ecNumber` | dpp-core: AuthorizedOnly, textile: AuthorizedOnly | consistent |
| `energyEfficiency` | dpp-core: Public, electronics: Public | consistent |
| `energyEfficiencyClass` | dpp-core: Public, electronics: Public | consistent |
| `eprelProductUrl` | dpp-core: Public, electronics: Public | consistent |
| `eprelRegistrationNumber` | dpp-core: Public, electronics: Public | consistent |
| `euDeclarationOfConformity` | battery: Public, textile: Public | consistent |
| `hazardousSubstances` | dpp-core: Public, battery: Public, detergent: Public | consistent |
| `powerConsumptionOff` | dpp-core: Public, electronics: Public | consistent |
| `powerConsumptionOn` | dpp-core: Public, electronics: Public | consistent |
| `powerConsumptionStandby` | dpp-core: Public, electronics: Public | consistent |
| `recyclabilityRate` | dpp-core: Public, electronics: Public | consistent |
| `recyclabilityScore` | dpp-core: Public, textile: Public | consistent |
| `repairabilityClass` | dpp-core: Public, electronics: Public | consistent |
| `safeUseInstructions` | dpp-core: Public, textile: Public | consistent |
| `substancesOfConcern` | dpp-core: Public, textile: Public | consistent |
| `takeBackIncentive` | dpp-core: Public, textile: Public | consistent |
| `takeBackUrl` | dpp-core: Public, textile: Public | consistent |
