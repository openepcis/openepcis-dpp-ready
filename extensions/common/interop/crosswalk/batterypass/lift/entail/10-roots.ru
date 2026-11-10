# The passports of a document: a battery item (a product of a battery class, with an IRI that
# nothing else in the document points at) that carries passport data and states its Battery
# Regulation category. BatteryPass-Ready describes batteries at item level only ("item" is the only
# granularity its schemas admit), so a model or batch passport has no 2.0.1 document. Each root gets
# the category whose schema applies; they go to their own graph, not the input.
DROP SILENT GRAPH <urn:xw:roots> ;
INSERT { GRAPH <urn:xw:roots> { ?r xw:schema ?schema } }
WHERE {
  GRAPH <urn:xw:in> { ?r a ?t ; schema:category ?cat }
  GRAPH <urn:xw:bg> { ?t rdfs:subClassOf* eubat:Battery }
  FILTER(isIRI(?r))
  FILTER NOT EXISTS { GRAPH <urn:xw:in> { ?x ?p ?r } }
  FILTER EXISTS {
    GRAPH <urn:xw:in> { ?r ?pp ?v }
    FILTER(?pp IN (oec:lastUpdated, oec:passportIdentifier, oec:granularityLevel, oec:passportStatus))
  }
  FILTER(EXISTS { GRAPH <urn:xw:in> { ?r oec:granularityLevel "item" } }
    || (NOT EXISTS { GRAPH <urn:xw:in> { ?r oec:granularityLevel ?g } }
        && EXISTS { GRAPH <urn:xw:in> { ?r oec:hasReportingGranularity oec:ItemLevel } }))
  GRAPH <urn:xw:map> { ?row xw:ourCategory ?cat ; xw:schema ?schema . FILTER NOT EXISTS { ?row xw:lowerOnly true } }
}
