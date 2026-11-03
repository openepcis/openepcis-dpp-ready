# The passports of a document: a product (gs1:Product or a subclass) with an IRI that nothing else
# in the document points at and that carries passport data. Each gets the content specifications
# it declares (core always, batteries for a battery, the subgroup of its battery category). They
# go to their own graph, not the input: the round trip is compared with the input. (An update sees
# no union default graph: background and mappings are named.)
DROP SILENT GRAPH <urn:xw:roots> ;
INSERT { GRAPH <urn:xw:roots> { ?r xw:spec ?spec } }
WHERE {
  GRAPH <urn:xw:in> { ?r a ?t }
  GRAPH <urn:xw:bg> { ?t rdfs:subClassOf* gs1:Product }
  FILTER(isIRI(?r))
  FILTER NOT EXISTS { GRAPH <urn:xw:in> { ?x ?p ?r } }
  FILTER EXISTS {
    GRAPH <urn:xw:in> { ?r ?pp ?v }
    FILTER(?pp IN (oec:lastUpdated, oec:passportIdentifier, oec:granularityLevel, oec:passportStatus))
  }
  {
    BIND("core/1.0.0" AS ?spec)
  } UNION {
    GRAPH <urn:xw:in> { ?r a ?bt } GRAPH <urn:xw:bg> { ?bt rdfs:subClassOf* eubat:Battery }
    BIND("product/batteries/1.0.0" AS ?spec)
  } UNION {
    GRAPH <urn:xw:in> { ?r a ?bt2 ; ?cp ?cat } GRAPH <urn:xw:bg> { ?bt2 rdfs:subClassOf* eubat:Battery . ?cat skos:exactMatch ?eucat }
    GRAPH <urn:xw:map> { ?eucat xw:subgroupSpec ?spec }
  }
}
