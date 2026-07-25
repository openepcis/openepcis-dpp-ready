# Access-tier review matrix — gs1-masterdata

Regulatory frame: GS1 Web Vocabulary / ESPR consumer-information baseline

Coverage: 139 properties — 109 Public / 30 AuthorizedOnly / 0 Restricted / 0 inherited / 0 UNCLASSIFIED; 0 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `additionalLocationID` | Additional Location ID | **AuthorizedOnly** |  | eli/reg/2024/1781 | Secondary location identifiers from government or trade schemes serve administrative cross-referencing, not consumer information. |
| `additionalOrganizationID` | Additional Organization ID | **AuthorizedOnly** |  | eli/reg/2024/1781 | Secondary party identifiers (tax, customs, trade-body numbers) are administrative identifiers for authorities and B2B partners. |
| `additionalOrganizationIdentificationTypeValue` | Additional Organization Identification Type Value | **AuthorizedOnly** |  | eli/reg/2024/1781 | This value qualifies the non-public additional organization identifier and shares its administrative audience. |
| `additionalProductClassification` | Additional Product Classification | **Public** |  | eli/reg/2024/1781 | Additional classification codes categorise the product the same way the public GPC classification does. |
| `additionalProductDescription` | Additional Product Description | **Public** |  | eli/reg/2024/1781 | Additional descriptive variants refine the public product description and carry no confidential content beyond it. |
| `additive` | Additive | **Public** |  | eli/reg/2024/1781 | Additive details mirror ingredient information consumers already read on the label of the products concerned. |
| `address` | Address | **Public** |  | https://ref.gs1.org/voc/ | The postal address of a registered business party or site is public registry and business-directory information. |
| `afterHoursContact` | After Hours Contact | **AuthorizedOnly** |  | eli/reg/2024/1781 | After-hours contacts are operational emergency channels for partners and authorities, distinct from the published consumer contact point. |
| `audioFile` | Audio File | **Public** |  | eli/reg/2024/1781 | Product audio clips are published brand media intended for consumer consumption. |
| `authenticity` | Authenticity | **Public** |  | eli/reg/2024/1781 | Authenticity-checking details only fulfil their purpose if the consumer verifying a product instance can read them. |
| `awardPrize` | Award Prize | **Public** |  | eli/reg/2024/1781 | Awards and prizes are promotional facts the brand itself publicises on pack and product page. |
| `baseLocation` | Base Location | **AuthorizedOnly** |  | eli/reg/2024/1781 | The home base of a mobile asset is logistics-network detail with no consumer-information function. |
| `bestBeforeDate` | Best Before Date | **Public** |  | eli/reg/2024/1781 | The best-before date is printed on the label or package by definition and consumers rely on it directly. |
| `brand` | Brand | **Public** |  | eli/reg/2024/1781 | The brand appears on the consumer package by definition and is core public product identity. |
| `brandOwner` | Brand Owner | **Public** |  | eli/reg/2024/1781 | The brand owner is the accountable party behind the on-package brand and is published in the GS1 registry (Verified by GS1). |
| `certification` | Certification | **Public** |  | eli/reg/2024/1781 | Certification claims must be publicly verifiable by the consumers and market-surveillance actors they are addressed to. |
| `colourCode` | Colour Code | **Public** |  | eli/reg/2024/1781 | Colour codes describe an attribute visible on the product itself and shown in every retail listing. |
| `colourDescription` | Colour Description | **Public** |  | eli/reg/2024/1781 | The colour description states an attribute visible on the product itself. |
| `consumerHandlingStorage` | Consumer Handling Storage | **Public** |  | eli/reg/2024/1781 | The manufacturer's handling and storage recommendations are consumer use-and-maintenance information under ESPR Annex III. |
| `consumerPackageDisclaimer` | Consumer Package Disclaimer | **Public** |  | eli/reg/2024/1781 | The package disclaimer is defined as information to be used in advertising and display, i.e. inherently public. |
| `consumerProductVariant` | Consumer Product Variant | **Public** |  | eli/reg/2024/1781 | The consumer product variant distinguishes retail variants under the same GTIN and is by name and purpose consumer-facing. |
| `consumerSafetyInformation` | Consumer Safety Information | **Public** |  | eli/reg/2024/1781 | Safety information exists to protect the end user and must reach every anonymous scanner of the product. |
| `consumerStorageInstructions` | Consumer Storage Instructions | **Public** |  | eli/reg/2024/1781 | Storage instructions are normally held on the label or accompany the product, so they are already public consumer information. |
| `consumerUsageInstructions` | Consumer Usage Instructions | **Public** |  | eli/reg/2024/1781 | Usage instructions are label-carried consumer information ESPR Annex III explicitly directs at customers. |
| `contactPoint` | Contact Point | **Public** |  | https://ref.gs1.org/voc/ | Published contact points are how the organization asks to be reached and are ordinary business-directory content. |
| `countryOfAssembly` | Country Of Assembly | **Public** |  | eli/reg/2024/1781 | Country of assembly is an origin fact at country granularity, revealing no supplier or facility identity. |
| `countryOfLastProcessing` | Country Of Last Processing | **Public** |  | eli/reg/2024/1781 | Country of last processing is origin information at country granularity, consistent with on-label origin marking. |
| `countryOfOrigin` | Country Of Origin | **Public** |  | eli/reg/2024/1781 | Country of origin is a consumer-facing declaration frequently required on the label of the target market. |
| `countryOfOriginStatement` | Country Of Origin Statement | **Public** |  | eli/reg/2024/1781 | The origin statement is the free-text form of the public country-of-origin declaration. |
| `customerSupportCentre` | Customer Support Centre | **Public** |  | eli/reg/2024/1781 | The support-centre contact is printed on packaging precisely so any customer can reach product support. |
| `department` | Department | **AuthorizedOnly** |  | eli/reg/2024/1781 | Internal department structure is organizational detail relevant to business partners, not to a consumer scanning a product. |
| `dependentProprietaryProduct` | Dependent Proprietary Product | **Public** |  | eli/reg/2024/1781 | Products required to make this one functional are compatibility information a purchaser needs before and after buying. |
| `descriptiveSize` | Descriptive Size | **Public** |  | eli/reg/2024/1781 | The descriptive size is, per its GS1 definition, a size factor the brand owner wishes to communicate to the consumer. |
| `digitalAddress` | Digital Address | **Public** |  | https://ref.gs1.org/voc/ | The digital address points at a publicly reachable digital location and reveals nothing beyond that endpoint. |
| `digitalLocationName` | Digital Location Name | **Public** |  | https://ref.gs1.org/voc/ | The name of a digital place (e.g. a webshop) identifies a publicly reachable endpoint. |
| `dueDate` | Due Date | **Public** |  | eli/reg/2024/1781 | The due date is encodable in the GS1 element string on the payment document itself, so the holder already sees it. |
| `equivalentProduct` | Equivalent Product | **Public** |  | eli/reg/2024/1781 | Supplier-declared substitutes help consumers find an equivalent product and are ordinary catalogue information. |
| `expirationDate` | Expiration Date | **Public** |  | eli/reg/2024/1781 | The expiration date limits safe consumption or use and is printed on the package for the consumer. |
| `expirationDateTime` | Expiration Date Time | **Public** |  | eli/reg/2024/1781 | The expiration date-time is the finer-grained form of the on-package expiration date for short-life products. |
| `firstFreezeDate` | First Freeze Date | **Public** |  | eli/reg/2024/1781 | The first-freeze date is food-quality information consumers use like a best-before date for frozen produce. |
| `functionalName` | Functional Name | **Public** |  | eli/reg/2024/1781 | The functional name tells the consumer what the product is used for — ordinary retail product information. |
| `geoCoordinates` | Geo Coordinates | **Public** |  | https://ref.gs1.org/voc/ | Coordinates of a GLN-identified business site restate the public location of that site per the GS1 registry (unlike a product's manufacturingPlant link, this describes the place entity itself). |
| `geoShape` | Geo Shape | **Public** |  | https://ref.gs1.org/voc/ | The boundary shape of a GLN-identified site is the same public site-location fact as its coordinates. |
| `glnType` | GLN Type | **Public** |  | https://ref.gs1.org/voc/ | The GLN type only says what kind of thing the public GLN identifies and is needed to interpret it. |
| `globalLocationNumber` | Global Location Number | **Public** |  | https://ref.gs1.org/voc/ | The GLN is the public GS1 identification key for the party or location and is discoverable in the GS1 registry. |
| `gpcCategoryCode` | GPC Category Code | **Public** |  | eli/reg/2024/1781 | The GPC brick code is a standard product classification published with the GTIN in the GS1 registry (Verified by GS1). |
| `gpcCategoryDescription` | GPC Category Description | **Public** |  | eli/reg/2024/1781 | The GPC category description is the human-readable form of the public GPC brick code. |
| `grossArea` | Gross Area | **Public** |  | eli/reg/2024/1781 | Gross area describes the packaged retail unit and carries no confidential content. |
| `grossVolume` | Gross Volume | **Public** |  | eli/reg/2024/1781 | Gross volume describes the packaged retail unit and carries no confidential content. |
| `grossWeight` | Gross Weight | **Public** |  | eli/reg/2024/1781 | Gross weight describes the packaged retail unit the consumer physically handles. |
| `growingMethod` | Growing Method | **Public** |  | eli/reg/2024/1781 | The growing method (e.g. organic, hydroponic) is a consumer-facing produce claim shown at point of sale. |
| `gtin` | GTIN | **Public** |  | eli/reg/2024/1781 | The GTIN is encoded in the barcode on every consumer package and is the public key that resolves the ESPR Art. 9 data carrier in the first place. |
| `harvestDate` | Harvest Date | **Public** |  | eli/reg/2024/1781 | The harvest date is provenance information for fresh produce that supports the consumer's freshness and origin judgement. |
| `harvestDateEnd` | Harvest Date End | **Public** |  | eli/reg/2024/1781 | The harvest end date bounds the same public provenance window as the harvest date itself. |
| `harvestDateStart` | Harvest Date Start | **Public** |  | eli/reg/2024/1781 | The harvest start date bounds the same public provenance window as the harvest date itself. |
| `hasBatchLotNumber` | Has Batch Lot Number | **Public** |  | eli/reg/2024/1781 | The batch/lot number is printed on the label and appears in the GS1 Digital Link path the scanner itself resolved. |
| `hasPrimaryLocation` | Has Primary Location | **Public** |  | https://ref.gs1.org/voc/ | An organization's self-designated primary location is headline registry identity, like a head-office address. |
| `hasSerialNumber` | Has Serial Number | **Public** |  | eli/reg/2024/1781 | The serial number is marked on the item and appears in the GS1 Digital Link path the scanner itself resolved. |
| `hasThirdPartyControlledSerialNumber` | Has Third Party Controlled Serial Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | A third-party-controlled serial number belongs to an external identification scheme for professional traceability, unlike the on-label GS1 serial. |
| `healthClaimDescription` | Health Claim Description | **Public** |  | eli/reg/2024/1781 | Health claims are made to consumers under target-market regulations and must be as visible as the claim itself. |
| `images` | Images | **Public** |  | eli/reg/2024/1781 | Product images are the published visual identity of the product shown in every listing. |
| `includedAccessories` | Included Accessories | **Public** |  | eli/reg/2024/1781 | Included accessories are box-contents information every retail listing and package already states. |
| `inPackageDepth` | In Package Depth | **Public** |  | eli/reg/2024/1781 | Packaged depth is a measurable fact about the retail unit shown in any product listing. |
| `inPackageDiameter` | In Package Diameter | **Public** |  | eli/reg/2024/1781 | Packaged diameter is a measurable fact about the retail unit shown in any product listing. |
| `inPackageHeight` | In Package Height | **Public** |  | eli/reg/2024/1781 | Packaged height is a measurable fact about the retail unit shown in any product listing. |
| `inPackageWidth` | In Package Width | **Public** |  | eli/reg/2024/1781 | Packaged width is a measurable fact about the retail unit shown in any product listing. |
| `instructionsForUse` | Instructions For Use | **Public** |  | eli/reg/2024/1781 | The instructions-for-use file is the document a consumer or repairer needs to use the product correctly (ESPR Annex III). |
| `isProductRecalled` | Is Product Recalled | **Public** |  | eli/reg/2024/1781 | Recall status is critical public safety information that must reach every holder of the product without any login. |
| `leasedFrom` | Leased From | **AuthorizedOnly** |  | eli/reg/2024/1781 | Lessor identity discloses a commercial lease relationship between businesses. |
| `leasedTo` | Leased To | **AuthorizedOnly** |  | eli/reg/2024/1781 | Lessee identity discloses a commercial lease relationship between businesses. |
| `lesseeOf` | Lessee Of | **AuthorizedOnly** |  | eli/reg/2024/1781 | The set of places an organization leases in maps its property dealings — commercial-relations data. |
| `lessorFor` | Lessor For | **AuthorizedOnly** |  | eli/reg/2024/1781 | The set of places an organization leases out maps its property dealings — commercial-relations data. |
| `location` | Location | **Public** |  | https://ref.gs1.org/voc/ | The places associated with an organization are its public registry footprint of identified sites. |
| `locationGLN` | Location GLN | **Public** |  | https://ref.gs1.org/voc/ | The location GLN is the public registry key of the physical or digital location being described. |
| `locationHistory` | Location History | **AuthorizedOnly** |  | eli/reg/2024/1781 | Activation/deactivation history of a location is registry lifecycle bookkeeping for data managers, not consumer information. |
| `locationRole` | Location Role | **Public** |  | https://ref.gs1.org/voc/ | The location role classifies what kind of site a place is — coarse registry classification, not operational detail. |
| `makesOffer` | Makes Offer | **AuthorizedOnly** |  | eli/reg/2024/1781 | Offers attached to a party record are commercial trading terms between businesses, not product information for the end user. |
| `managedBy` | Managed By | **AuthorizedOnly** |  | eli/reg/2024/1781 | The managing organization behind a site or party discloses an outsourcing/management contract between businesses. |
| `managedFor` | Managed For | **AuthorizedOnly** |  | eli/reg/2024/1781 | Whose behalf a place is managed on discloses the same commercial management relationship as managedBy. |
| `manages` | Manages | **AuthorizedOnly** |  | eli/reg/2024/1781 | The portfolio of places and parties an organization manages enumerates its service contracts — commercial-relations data. |
| `manufacturer` | Manufacturer | **AuthorizedOnly** |  | eli/reg/2024/1781 | The producing organization behind a brand is supply-chain sourcing detail; consumers see the brand owner, while manufacturer identity serves authorities and B2B partners. |
| `manufacturersWarranty` | Manufacturers Warranty | **Public** |  | eli/reg/2024/1781 | Guarantee and warranty terms are customer information ESPR Annex III expects to be available to product owners. |
| `manufacturingPlant` | Manufacturing Plant | **AuthorizedOnly** |  | eli/reg/2024/1781 | Linking a product to its production facility exposes the manufacturer's production network, which the battery-passport precedent keeps non-public. |
| `massPerUnitArea` | Mass Per Unit Area | **Public** |  | eli/reg/2024/1781 | Mass per unit area (e.g. fabric grammage) is a physical product characteristic quoted in ordinary retail listings. |
| `netArea` | Net Area | **Public** |  | eli/reg/2024/1781 | Net area is a net-quantity measurement of the retail unit, equivalent to on-label content declarations. |
| `netContent` | Net Content | **Public** |  | eli/reg/2024/1781 | Net content is, per its GS1 definition, the quantity as claimed on the label. |
| `netWeight` | Net Weight | **Public** |  | eli/reg/2024/1781 | Net weight is mandatory on-label net-quantity information for consumers. |
| `occupiedBy` | Occupied By | **AuthorizedOnly** |  | eli/reg/2024/1781 | The tenant list of a site maps commercial occupancy relationships beyond the public operator identity. |
| `occupies` | Occupies | **AuthorizedOnly** |  | eli/reg/2024/1781 | The full list of places an organization occupies is operational-footprint detail beyond its public primary location. |
| `organicClaim` | Organic Claim | **Public** |  | eli/reg/2024/1781 | Organic claims are regulated consumer-facing label claims and must be as visible as the label itself. |
| `organizationHistory` | Organization History | **AuthorizedOnly** |  | eli/reg/2024/1781 | Activation/deactivation history of a party record is registry lifecycle bookkeeping for data managers, not consumer information. |
| `organizationName` | Organization Name | **Public** |  | https://ref.gs1.org/voc/ | The organization name is the public legal-entity identity behind the GLN, published via Verified by GS1. |
| `organizationRole` | Organization Role | **Public** |  | https://ref.gs1.org/voc/ | The declared role of a party (e.g. manufacturer, retailer) is coarse registry classification with no commercial detail. |
| `outOfPackageDepth` | Out Of Package Depth | **Public** |  | eli/reg/2024/1781 | Unpackaged depth is measurable by anyone holding the product and helps consumers judge fit before purchase. |
| `outOfPackageDiameter` | Out Of Package Diameter | **Public** |  | eli/reg/2024/1781 | Unpackaged diameter is measurable by anyone holding the product and helps consumers judge fit before purchase. |
| `outOfPackageHeight` | Out Of Package Height | **Public** |  | eli/reg/2024/1781 | Unpackaged height is measurable by anyone holding the product and helps consumers judge fit before purchase. |
| `outOfPackageWidth` | Out Of Package Width | **Public** |  | eli/reg/2024/1781 | Unpackaged width is measurable by anyone holding the product and helps consumers judge fit before purchase. |
| `ownedBy` | Owned By | **AuthorizedOnly** |  | eli/reg/2024/1781 | Ownership of a site maps commercial relationships and asset holdings beyond the public registry identity of the place. |
| `owns` | Owns | **AuthorizedOnly** |  | eli/reg/2024/1781 | An organization's owned places and entities enumerate its asset portfolio — commercial detail, not consumer information. |
| `packaging` | Packaging | **Public** |  | eli/reg/2024/1781 | Packaging type and material details are consumer-relevant circularity information ESPR Annex I makes central to the passport. |
| `packagingDate` | Packaging Date | **Public** |  | eli/reg/2024/1781 | The packaging date is marked on packs (GS1 element strings) and informs the consumer's freshness judgement. |
| `packagingMarkedLabelAccreditation` | Packaging Marked Label Accreditation | **Public** |  | eli/reg/2024/1781 | Accreditation marks are printed on the packaging by definition, so the field only mirrors the label. |
| `parentOrganization` | Parent Organization | **Public** |  | https://ref.gs1.org/voc/ | The parent legal entity is corporate-structure information disclosed in public company registers. |
| `partyGLN` | Party GLN | **Public** |  | https://ref.gs1.org/voc/ | The party GLN is the public registry key of the legal entity or function being described. |
| `physicalLocationName` | Physical Location Name | **Public** |  | https://ref.gs1.org/voc/ | The name of a physical business site is public registry identity, typically also signposted at the site itself. |
| `primaryAlternateProduct` | Primary Alternate Product | **Public** |  | eli/reg/2024/1781 | The primary alternate is a similar-product suggestion of the same public catalogue nature as equivalent products. |
| `primaryLocationOf` | Primary Location Of | **AuthorizedOnly** |  | eli/reg/2024/1781 | The reverse index of every organization headquartered at a place aggregates tenancy relationships beyond any single party's public record. |
| `productDescription` | Product Description | **Public** |  | eli/reg/2024/1781 | The product description is the basic consumer-facing account of what the scanned item is (ESPR Annex III information for customers). |
| `productFeatureBenefit` | Product Feature Benefit | **Public** |  | eli/reg/2024/1781 | Feature-benefit copy is, per its GS1 definition, consumer-facing marketing content suitable for display. |
| `productFormDescription` | Product Form Description | **Public** |  | eli/reg/2024/1781 | The physical form or shape of the product is apparent from the product itself and its package. |
| `productID` | Product ID | **Public** |  | eli/reg/2024/1781 | Additional product identifiers serve the same public identification purpose as the GTIN printed on the package. |
| `productionDate` | Production Date | **Public** |  | eli/reg/2024/1781 | The production date is encodable in the GS1 element strings on the label, so the document repeats on-pack information. |
| `productionDateTime` | Production Date Time | **Public** |  | eli/reg/2024/1781 | The production date-time is the finer-grained form of the on-pack production date, not production-process detail. |
| `productionVariantDescription` | Production Variant Description | **AuthorizedOnly** |  | eli/reg/2024/1781 | Production variants are manufacturer bookkeeping about production runs, not information addressed to the consumer. |
| `productionVariantEffectiveDateTime` | Production Variant Effective Date Time | **AuthorizedOnly** |  | eli/reg/2024/1781 | The effective date of a production variant is production bookkeeping tied to the non-public variant record. |
| `productMarketingMessage` | Product Marketing Message | **Public** |  | eli/reg/2024/1781 | The marketing message is authored for consumer display and is public by intent. |
| `productName` | Product Name | **Public** |  | eli/reg/2024/1781 | The consumer-friendly product name is on-package and point-of-sale information every customer already sees. |
| `productRange` | Product Range | **Public** |  | eli/reg/2024/1781 | The product-range name is public catalogue information the brand owner itself markets across categories. |
| `productSustainabilityInfo` | Product Sustainability Info | **Public** |  | eli/reg/2024/1781 | Sustainability information is exactly the consumer transparency ESPR exists to deliver through the data carrier. |
| `provenanceStatement` | Provenance Statement | **Public** |  | eli/reg/2024/1781 | The provenance statement is a marketing-grade origin description brands print on the product page and pack. |
| `referencedFile` | Referenced File | **Public** |  | eli/reg/2024/1781 | Referenced files are links to additional product information the brand publishes for its audience. |
| `regulatedProductName` | Regulated Product Name | **Public** |  | eli/reg/2024/1781 | The regulated or generic denomination is required on the label to describe the true nature of the product to consumers. |
| `relatedOrganization` | Related Organization | **Public** |  | https://ref.gs1.org/voc/ | The organization associated with a place is the public operator identity a visitor to the site can observe. |
| `replacedByOrganization` | Replaced By Organization | **Public** |  | https://ref.gs1.org/voc/ | The successor-organization link keeps the public registry record resolvable after a party is superseded. |
| `replacedByPlace` | Replaced By Place | **Public** |  | https://ref.gs1.org/voc/ | The successor-location link keeps the public registry record resolvable after a location is superseded. |
| `replacedByProduct` | Replaced By Product | **Public** |  | eli/reg/2024/1781 | The successor-product link routes owners of a discontinued item to its replacement — public catalogue succession. |
| `replacedOrganization` | Replaced Organization | **Public** |  | https://ref.gs1.org/voc/ | The predecessor-organization link is public registry succession history for the party identifier. |
| `replacedPlace` | Replaced Place | **Public** |  | https://ref.gs1.org/voc/ | The predecessor-location link is public registry succession history for the location identifier. |
| `replacedProduct` | Replaced Product | **Public** |  | eli/reg/2024/1781 | The predecessor-product link is the public catalogue history of what this product permanently replaces. |
| `responsibleForLocation` | Responsible For Location | **AuthorizedOnly** |  | eli/reg/2024/1781 | The places an organization is responsible for map internal accountability across the site network — B2B operational structure. |
| `responsibleOrganization` | Responsible Organization | **AuthorizedOnly** |  | eli/reg/2024/1781 | The organization directly responsible for a place is internal accountability structure, distinct from the public operator identity. |
| `sellByDate` | Sell By Date | **Public** |  | eli/reg/2024/1781 | The sell-by date is marked on retail packaging and lets the consumer judge product freshness at the shelf. |
| `sizeCodes` | Size Codes | **Public** |  | eli/reg/2024/1781 | Size codes are ordinary retail information printed on the label and shown at point of sale. |
| `subOrganization` | Sub Organization | **Public** |  | https://ref.gs1.org/voc/ | Subsidiary legal entities are corporate-structure information disclosed in public company registers. |
| `supplierSpecifiedMinimumConsumerStorageDays` | Supplier Specified Minimum Consumer Storage Days | **AuthorizedOnly** |  | eli/reg/2024/1781 | The supplier-specified minimum storage-days figure steers retail shelf-life logistics between trading partners; the consumer relies on the printed dates instead. |
| `targetMarket` | Target Market | **Public** |  | eli/reg/2024/1781 | Target-market countries and release dates are public availability information visible from where the product is sold. |
| `usesManagedLocation` | Uses Managed Location | **AuthorizedOnly** |  | eli/reg/2024/1781 | Which managed spaces an organization uses reveals its operational footprint and supplier relationships. |
| `variantDescription` | Variant Description | **Public** |  | eli/reg/2024/1781 | The variant description distinguishes retail variants the consumer chooses between at point of sale. |
| `warningCopyDescription` | Warning Copy Description | **Public** |  | eli/reg/2024/1781 | Warning copy reproduces caution information printed on the package and is critical consumer safety content. |
