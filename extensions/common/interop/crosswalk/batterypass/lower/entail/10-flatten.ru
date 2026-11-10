# A 2.0.1 document nests its data elements in the header and the data groups; the rules address
# them flat on the passport root, in their own graph (<urn:xw:flat>), so the input stays as it is.
# The passport's category schema goes to <urn:xw:roots>.
DROP SILENT GRAPH <urn:xw:flat> ;
DROP SILENT GRAPH <urn:xw:roots> ;
INSERT { GRAPH <urn:xw:flat> { ?r ?el ?v } }
WHERE {
  GRAPH <urn:xw:in> { ?r a bprx:BatteryPassport }
  { GRAPH <urn:xw:in> { ?r bpr:dppHeader ?n } } UNION { GRAPH <urn:xw:in> { ?r bpr:batteryPassportData ?d . ?d ?g ?n } }
  GRAPH <urn:xw:in> { ?n ?el ?v }
} ;
INSERT { GRAPH <urn:xw:roots> { ?r xw:schema ?schema } }
WHERE {
  GRAPH <urn:xw:in> { ?r a bprx:BatteryPassport }
  GRAPH <urn:xw:flat> { ?r bpr:batteryCategory ?cn } GRAPH <urn:xw:in> { ?cn bprx:batteryCategoryValue ?tc }
  GRAPH <urn:xw:map> { ?crow xw:theirCategory ?tc0 ; xw:schema ?schema }
  FILTER(STR(?tc0) = STR(?tc))
}
