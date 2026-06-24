# SKOS completeness report

Scope: **module=eudr, 46 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 54 | grader proposes a mapping the TTL does not assert |
| WEAK | 3 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 0 | TTL's graded relation disagrees with the grader |
| OK | 0 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **12 of 57** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (54)

### eudr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eudr:ActorRole` | `skos:broadMatch` | 0.95 | NONE | 0.62 | ✗ | https://schema.org/OrganizationRole | — | eudr:ActorRole is a general role for any actor in the supply chain, while schema.org/OrganizationRole is a specific subclass describing roles within organizations. |
| `eudr:ActorRole` | `skos:narrowMatch` | 0.95 | NONE | 0.72 | ✗ | https://schema.org/Role | — | eudr:ActorRole is a specific type of role within the EUDR supply chain, whereas schema.org/Role is a general-purpose role concept. |
| `eudr:ActorRole` | `skos:broadMatch` | 0.92 | NONE | 0.85 | ✗ | https://schema.org/EmployeeRole | — | eudr:ActorRole covers all actors in the supply chain, while schema.org/EmployeeRole is a specific type of role for employees. |
| `eudr:ActorRole` | `skos:narrowMatch` | 0.92 | `skos:closeMatch` | 0.50 | ✗ | http://data.europa.eu/m8g/Participation | — | eudr:ActorRole is a specific role within the EUDR supply chain, whereas semic:Participation is a generic class for defining roles in any context. |
| `eudr:areaHectares` | `skos:narrowMatch` | 0.95 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/netArea | — | eudr:areaHectares specifies area measured in hectares, whereas gs1:netArea is a generic area value that can use any unit; thus our term is narrower. |
| `eudr:areaSize` | `skos:narrowMatch` | 0.93 | `skos:narrowMatch` | 0.78 | ✓ | https://schema.org/size | — | eudr:areaSize refers specifically to field area size, whereas schema.org/size is a general product dimension that can include many other measurements. |
| `eudr:areaSize` | `skos:narrowMatch` | 0.88 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/grossArea | — | eudr:areaSize specifies field area size, whereas gs1:grossArea refers to the overall item area including packaging. |
| `eudr:areaSize` | `skos:closeMatch` | 0.70 | NONE | 0.85 | ✗ | https://schema.org/floorSize | — | Both properties represent a quantitative size with square‑meter units, but our property refers to field area while the schema.org property refers to accommodation floor size. |
| `eudr:countryList` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.55 | ✗ | https://ref.gs1.org/voc/countryOfOriginStatement | — | eudr:countryList specifies a list of countries, whereas gs1:countryOfOriginStatement describes any geographic area from which an item may originate, making the former a narrower concept. |
| `eudr:countryList` | `skos:broadMatch` | 0.80 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/countryCode | — | eudr:countryList refers to a collection of origin countries, whereas gs1:countryCode denotes a single country code; the former is a broader concept. |
| `eudr:countryList` | `skos:broadMatch` | 0.70 | NONE | 0.83 | ✗ | https://ref.gs1.org/voc/addressCountry | — | eudr:countryList denotes a collection of origin countries, whereas gs1:addressCountry specifies a single country code; the former is a broader concept. |
| `eudr:countryList` | `skos:broadMatch` | 0.60 | `skos:broadMatch` | 0.70 | ✓ | https://schema.org/addressCountry | — | eudr:countryList refers to a list of origin countries, whereas schema.org/addressCountry denotes a single country value; the former is a broader concept. |
| `eudr:deforestationFreeDate` | `skos:narrowMatch` | 0.60 | NONE | 0.85 | ✗ | https://schema.org/validFrom | — | Both properties are dates indicating when a status becomes applicable, but eudr:deforestationFreeDate is specifically for deforestation‑free certification, whereas schema.org/validFrom is a general validity date. |
| `eudr:derivedFrom` | `skos:broadMatch` | 0.85 | NONE | 0.86 | ✗ | https://schema.org/successorOf | — | Derived From can refer to any source product(s) used in creation, whereas successorOf specifically links a newer variant to its earlier predecessor; thus our property is broader. |
| `eudr:derivedFrom` | `skos:broadMatch` | 0.80 | NONE | 0.85 | ✗ | https://schema.org/predecessorOf | — | Derived From refers to any source product(s) used in creating the current product, while predecessorOf specifically links a discontinued variant to its newer version; thus our property is broader. |
| `eudr:dueDiligenceStatement` | `skos:narrowMatch` | 0.92 | NONE | 0.62 | ✗ | https://schema.org/hasCertification | — | eudr:dueDiligenceStatement is a specific type of certification statement, whereas schema.org/hasCertification covers all kinds of certifications. |
| `eudr:exemptionAuthority` | `skos:narrowMatch` | 0.88 | NONE | 0.80 | ✗ | http://data.europa.eu/m8g/hasCompetentAuthority | — | Both properties link a subject to an authority, but the candidate is a general competent‑authority relation for public services, whereas our property specifically identifies the authority granting an exemption. |
| `eudr:exemptionEffectiveFrom` | `skos:narrowMatch` | 0.90 | `skos:broadMatch` | 0.72 | ✗ | https://schema.org/validFrom | — | eudr:exemptionEffectiveFrom specifies the start date of an exemption, whereas schema.org/validFrom is a general property for any item’s validity; the former is a narrower, more specific instance. |
| `eudr:exemptionEffectiveFrom` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.78 | ✓ | https://ref.gs1.org/voc/regulatoryReferenceApplicabilityStartDate | — | eudr:exemptionEffectiveFrom specifies the start date of an exemption’s validity, a more specific instance of the general regulatory reference applicability start date. |
| `eudr:exemptionEffectiveFrom` | `skos:narrowMatch` | 0.85 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/referencedFileEffectiveStartDateTime | — | eudr:exemptionEffectiveFrom specifies the start date of an exemption’s validity, a more specific instance of the general referenced file effective start date. |
| `eudr:exemptionEffectiveFrom` | `skos:closeMatch` | 0.80 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/validFrom | — | Both properties denote the effective start date of a condition (exemption vs price), sharing similar scope but differing in specific domain. |
| `eudr:exemptionEffectiveFrom` | `skos:broadMatch` | 0.70 | NONE | 0.95 | ✗ | https://ref.gs1.org/voc/productionVariantEffectiveDateTime | — | eudr:exemptionEffectiveFrom denotes a general start date for an exemption, whereas gs1:productionVariantEffectiveDateTime refers specifically to the effective date of a production variant. |
| `eudr:exemptionEffectiveUntil` | `skos:exactMatch` | 0.99 | `skos:broadMatch` | 0.70 | ✗ | https://schema.org/validUntil | — | Both properties denote the date when an item (exemption or other) ceases to be valid. |
| `eudr:exemptionEffectiveUntil` | `skos:closeMatch` | 0.80 | NONE | 0.95 | ✗ | https://ref.gs1.org/voc/availabilityEnds | — | Both properties denote an end date for a temporary condition, but one refers to an exemption’s validity while the other refers to product availability. |
| `eudr:exemptionReasonCode` | `skos:narrowMatch` | 0.90 | NONE | 0.90 | ✗ | https://schema.org/code | — | The schema.org code property is a generic medical coding attribute, whereas eudr:exemptionReasonCode refers specifically to exemption reason codes from the GS1 controlled vocabulary. |
| `eudr:exemptionType` | `skos:narrowMatch` | 0.92 | NONE | 0.99 | ✗ | https://schema.org/employmentType | — | exemptionType classifies exemptions as permanent or temporary, whereas employmentType covers a broader set of employment categories. |
| `eudr:fscCertification` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.66 | ✗ | https://ref.gs1.org/voc/certificationIdentification | — | The FSC Certification property refers specifically to Forest Stewardship Council certificates, whereas the upstream certificationIdentification is a generic reference to any product or party certificate. |
| `eudr:fscCertification` | `skos:narrowMatch` | 0.95 | NONE | 0.82 | ✗ | https://schema.org/certificationIdentification | — | eudr:fscCertification refers to a specific FSC certification, whereas schema.org/certificationIdentification is a generic identifier for any certification. |
| `eudr:fscCertification` | `skos:narrowMatch` | 0.93 | NONE | 0.72 | ✗ | https://ref.gs1.org/voc/certificationType | — | eudr:fscCertification refers to a specific FSC certification, whereas gs1:certificationType denotes any type of certification. |
| `eudr:fscCertification` | `skos:narrowMatch` | 0.92 | `skos:narrowMatch` | 0.90 | ✓ | https://schema.org/hasCertification | — | The FSC Certification property refers to a specific type of certification, whereas hasCertification is a generic property for any certification information. |
| `eudr:fscCertification` | `skos:narrowMatch` | 0.92 | `skos:narrowMatch` | 0.85 | ✓ | https://ref.gs1.org/voc/certification | — | eudr:fscCertification refers specifically to FSC certification, whereas gs1:Has Certification is a generic property for any certification. |
| `eudr:geofence` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.78 | ✗ | https://ref.gs1.org/voc/polygon | — | Both properties represent a polygonal area defined by a series of coordinates, matching the same concept. |
| `eudr:geofence` | `skos:narrowMatch` | 0.85 | `skos:closeMatch` | 0.60 | ✗ | https://schema.org/geo | — | Geofence specifies a polygonal area defined by longitude‑latitude coordinates, whereas geo is a general property for any geographic coordinate. |
| `eudr:geofence` | `skos:closeMatch` | 0.85 | `skos:closeMatch` | 0.60 | ✓ | http://data.europa.eu/m8g/coordinates | — | Both properties represent a list of geographic coordinates that define an area, though the data format differs. |
| `eudr:geolocation` | `skos:broadMatch` | 0.95 | NONE | 0.85 | ✗ | https://schema.org/latitude | — | eudr:geolocation provides a full Geo URI with both latitude and longitude, whereas schema.org/latitude supplies only the north/south coordinate. |
| `eudr:geolocation` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.70 | ✓ | http://data.europa.eu/m8g/coordinates | — | eudr:geolocation is a single Geo URI for a plot, whereas m8g:coordinates represents a list of coordinates defining an extent. |
| `eudr:geolocation` | `skos:closeMatch` | 0.80 | `skos:closeMatch` | 0.75 | ✓ | https://schema.org/geo | — | Both properties represent geographic coordinates, but schema.org’s geo is intended for places while our geolocation is specific to OriginDetails. |
| `eudr:mitigationMeasures` | `skos:broadMatch` | 0.90 | NONE | 0.97 | ✗ | https://ref.gs1.org/voc/preparationConsumptionPrecautions | — | eudr:mitigationMeasures covers all risk mitigation measures, while gs1:preparationConsumptionPrecautions is a specific subset of precautions applied before preparation or consumption. |
| `eudr:mitigationMeasures` | `skos:closeMatch` | 0.70 | NONE | 0.97 | ✗ | https://schema.org/diseasePreventionInfo | — | Both properties provide information on measures to prevent or mitigate a risk, though one is general risk mitigation and the other focuses specifically on disease prevention. |
| `eudr:originDetails` | `skos:broadMatch` | 0.90 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/countryOfOriginStatement | — | eudr:originDetails includes both geolocation and producer identification, whereas gs1:countryOfOriginStatement refers only to geographic origin. |
| `eudr:originDetails` | `skos:broadMatch` | 0.90 | NONE | 0.78 | ✗ | https://ref.gs1.org/voc/countryOfOrigin | — | eudr:originDetails is a container that includes both geolocation and producer identification, whereas gs1:countryOfOrigin only specifies the country code. |
| `eudr:originDetails` | `skos:broadMatch` | 0.85 | NONE | 0.78 | ✗ | https://ref.gs1.org/voc/provenanceStatement | — | eudr:originDetails is a container that includes both geolocation and producer identification, whereas gs1:provenanceStatement only provides a free‑text description of geographic origin. |
| `eudr:originDetails` | `skos:broadMatch` | 0.70 | `skos:closeMatch` | 0.55 | ✗ | https://schema.org/countryOfOrigin | — | eudr:originDetails is a container for geolocation and producer identification, while schema.org/countryOfOrigin specifies only the country of origin; thus our term is broader. |
| `eudr:originList` | `skos:narrowMatch` | 0.92 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/geo | — | originList provides detailed origin information per location, whereas Has Geocoordinates only links to coordinate or shape data. |
| `eudr:originList` | `skos:closeMatch` | 0.85 | `skos:broadMatch` | 0.55 | ✗ | https://ref.gs1.org/voc/countryOfOriginStatement | — | Both properties describe geographic origin information, but our property is a list of detailed origins whereas the GS1 property represents a single country‑of‑origin statement. |
| `eudr:originList` | `skos:narrowMatch` | 0.85 | NONE | 0.62 | ✗ | https://ref.gs1.org/voc/provenanceStatement | — | Our property is a list of detailed origin entries per geolocation or polygon, whereas the GS1 provenanceStatement is a single free‑text description of an origin area. |
| `eudr:producerIdentification` | `skos:broadMatch` | 0.92 | NONE | 0.78 | ✗ | https://ref.gs1.org/voc/globalLocationNumber | — | eudr:producerIdentification covers any producer identifier, while gs1:globalLocationNumber is a specific type of identifier used for parties. |
| `eudr:riskLevel` | `skos:exactMatch` | 0.95 | NONE | 0.90 | ✗ | https://ref.openepcis.io/extensions/eu/eudr/riskLevel | — | Both properties represent the same EUDR risk level for a product. |
| `eudr:statementDate` | `skos:closeMatch` | 0.70 | NONE | 0.95 | ✗ | https://ref.gs1.org/voc/certificationAuditDate | — | Both properties record a date of an event related to compliance, but the specific events (statement submission vs audit completion) differ in scope. |
| `eudr:transformationDate` | `skos:closeMatch` | 0.80 | `skos:closeMatch` | 0.55 | ✓ | https://ref.gs1.org/voc/productionDateTime | — | Both properties record a date related to the creation or processing of a product, but transformation refers specifically to processing/transformation while production denotes manufacturing. |
| `eudr:transformationDate` | `skos:closeMatch` | 0.78 | `skos:closeMatch` | 0.60 | ✓ | https://ref.gs1.org/voc/productionDate | — | Both properties record a date of a processing event, but transformationDate refers to commodity processing while productionDate refers to manufacturing or assembly. |
| `eudr:transformationDate` | `skos:closeMatch` | 0.75 | NONE | 0.75 | ✗ | https://schema.org/productionDate | — | Both capture a date of a processing event, but transformationDate refers to commodity processing while productionDate denotes manufacturing or assembly. |
| `eudr:volumeCubicMeters` | `skos:narrowMatch` | 0.95 | NONE | 0.60 | ✗ | https://ref.gs1.org/voc/grossVolume | — | eudr:volumeCubicMeters specifies a precise cubic‑meter measurement, whereas gs1:grossVolume refers to the overall volume including packaging and allows multiple units. |
| `eudr:volumeCubicMeters` | `skos:broadMatch` | 0.70 | NONE | 0.82 | ✗ | https://schema.org/cargoVolume | — | eudr:volumeCubicMeters is a general volume property for any product, whereas schema.org/cargoVolume applies specifically to cargo or luggage space. |

## WEAK (3)

### eudr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eudr:exemptionScopeReference` | `skos:narrowMatch` | 0.92 | `skos:narrowMatch` | 0.70 | ✓ | https://ref.gs1.org/voc/hasBatchLotNumber | `rdfs:seeAlso` | hasBatchLotNumber covers any batch or lot number for traceability, while exemptionScopeReference applies only to identifiers that are within a temporary exemption. |
| `eudr:geofence` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.72 | ✓ | http://www.w3.org/ns/locn#geometry | `rdfs:seeAlso` | eudr:geofence specifies a polygon coordinate array for large plots, whereas locn#geometry is a general property linking any resource to its geometry. |
| `eudr:transformationLocation` | `skos:narrowMatch` | 0.92 | NONE | 0.90 | ✗ | http://www.w3.org/ns/locn#Location | `rdfs:seeAlso` | The property refers to a specific place where transformation occurs, which is a narrower use of the generic Location property. |

