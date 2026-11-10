# Types the input leaves implicit: EPCIS master data (gs1:masterDataAvailableFor) and other JSON-LD
# without "type". A data node (one with statements of its own) without a class gets
#  - gs1:Product when it is a GS1 Digital Link of a trade item (AI 01; GS1 Digital Link 1.4), and
#  - the class its incoming property names as rdfs:range in the background ontologies.
INSERT { GRAPH <urn:xw:in> { ?n a ?c } }
WHERE {
  {
    GRAPH <urn:xw:in> { ?n ?p0 ?o0 }
    FILTER(isIRI(?n) && STRSTARTS(STR(?n), "https://id.gs1.org/01/"))
    BIND(gs1:Product AS ?c)
  } UNION {
    GRAPH <urn:xw:in> { ?x ?p ?n . ?n ?p1 ?o1 }
    FILTER(!isLiteral(?n) && ?p != rdf:type)
    GRAPH <urn:xw:bg> { ?p rdfs:range ?c . ?c a ?k }
    FILTER(?k IN (owl:Class, rdfs:Class) && isIRI(?c) && ?c != owl:Thing && ?c != rdfs:Resource)
    FILTER NOT EXISTS { GRAPH <urn:xw:bg> { ?p rdfs:range ?c2 } FILTER(?c2 != ?c) }
  }
  FILTER NOT EXISTS { GRAPH <urn:xw:in> { ?n a ?any } }
}
