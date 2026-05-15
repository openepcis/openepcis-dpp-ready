# OpenEPCIS DPP Ready - Bruno Collection

API collection for testing Digital Product Passport workflows with the GS1 Digital Link Resolver.

## Prerequisites

- [Bruno](https://www.usebruno.com/) installed
- Access to OpenEPCIS Digital Link Resolver (local or dev.epcis.cloud)

## Setup

1. Open Bruno and import this collection folder
2. Select environment: `local` or `dev`
3. For `dev` environment, set secret variables:
   - `password`: Keycloak password
   - `clientSecret`: OAuth2 client secret

## Workflows

### 1. Create Products
Create master data for textile/battery products with full DPP attributes.

### 2. Capture EPCIS Events
Record lifecycle events (commissioning → production → distribution → end-of-life).

### 3. Resolve Products
Query products via GS1 Digital Link with different linkTypes.

## Namespaces

| Prefix | URI |
|--------|-----|
| `dpp:` | `https://ref.openepcis.io/extensions/common/core/` |
| `battery:` | `https://ref.openepcis.io/extensions/eu/battery/` |
| `textile:` | `https://ref.openepcis.io/extensions/eu/textile/` |
| `gs1:` | `https://ref.gs1.org/voc/` |

## GS1-Extensions Header

For EPCIS capture, declare extensions via header:
```
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,textile=https://ref.openepcis.io/extensions/eu/textile/
```

## Collection Structure

```
digital-link-resolver/
├── bruno.json                         # Collection metadata
├── folder.bru                         # Root folder with OAuth2 auth
├── environments/
│   ├── local.bru                      # localhost:8080
│   └── dev.bru                        # dev.epcis.cloud (with Keycloak)
│
├── 01-products/
│   ├── textile/
│   │   ├── create-winter-jacket.bru
│   │   ├── create-trail-shoe.bru      # Footwear example
│   │   └── get-jacket-masterdata.bru
│   └── battery/
│       ├── create-ev-battery.bru
│       └── get-battery-masterdata.bru
│
├── 02-epcis-events/
│   ├── textile-lifecycle/
│   │   ├── 01-commissioning.bru       # Raw material sourcing
│   │   ├── 02-production.bru          # Manufacturing
│   │   ├── 03-packing.bru             # Aggregation event
│   │   ├── 04-shipping.bru            # Distribution
│   │   └── 05-end-of-life.bru         # Repair/recycling
│   └── battery-lifecycle/
│       ├── 01-commissioning.bru
│       ├── 02-installation.bru
│       └── 03-maintenance.bru
│
├── 03-organizations/
│   ├── create-manufacturer.bru
│   └── create-retailer.bru
│
└── 04-resolution/
    ├── resolve-by-gtin.bru
    ├── resolve-with-linktype.bru
    └── well-known-resolver.bru
```

## Example Product Data

### Winter Jacket (Textile)
- GTIN: 09521234300014
- Fiber: 65% Recycled Polyester, 30% Organic Cotton, 5% Elastane
- Certifications: GOTS, GRS

### Trail Running Shoe (Footwear)
- GTIN: 09521234300021
- Materials: 45% Recycled Polyester (ocean plastic), 35% Leather, 20% Rubber
- Certifications: GRS 4.0, LWG Gold

### EV Battery
- GTIN: 09521234000013
- Chemistry: NMC811
- Capacity: 75 kWh
- SOH: 98%
