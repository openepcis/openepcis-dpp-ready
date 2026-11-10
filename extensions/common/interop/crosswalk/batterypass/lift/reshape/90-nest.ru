# The rules write every data element flat on the passport root; a 2.0.1 document nests them: the
# header elements under bpr:dppHeader, the data elements in their group under
# bpr:batteryPassportData (structure.ttl). An element the schema of the passport's category does not
# have is left out (an EV passport has no remaining round-trip efficiency), with its value container.
DELETE { GRAPH <urn:xw:out> { ?r ?el ?v . ?v ?sp ?sv } }
WHERE {
  GRAPH <urn:xw:roots> { ?r xw:schema ?schema }
  GRAPH <urn:xw:out> { ?r ?el ?v }
  GRAPH <urn:xw:bg> { ?el xw:group ?g }
  FILTER NOT EXISTS { GRAPH <urn:xw:bg> { ?el xw:category ?c } FILTER(STR(?c) = STR(?schema)) }
  OPTIONAL { GRAPH <urn:xw:out> { ?v ?sp ?sv } FILTER(isBlank(?v)) }
} ;

# One node per passport and group that has an element.
INSERT { GRAPH <urn:xw:out> { ?r ?g _:node } }
WHERE {
  SELECT DISTINCT ?r ?g WHERE {
    GRAPH <urn:xw:roots> { ?r xw:schema ?schema }
    GRAPH <urn:xw:out> { ?r ?el ?v }
    GRAPH <urn:xw:bg> { ?el xw:group ?g . FILTER(?g != xw:Root) }
  }
} ;
DELETE { GRAPH <urn:xw:out> { ?r ?el ?v } }
INSERT { GRAPH <urn:xw:out> { ?n ?el ?v } }
WHERE {
  GRAPH <urn:xw:roots> { ?r xw:schema ?schema }
  GRAPH <urn:xw:out> { ?r ?g ?n . ?r ?el ?v }
  GRAPH <urn:xw:bg> { ?el xw:group ?g . ?g xw:group ?gg }
} ;

# The data groups under one bpr:batteryPassportData node.
INSERT { GRAPH <urn:xw:out> { ?r bpr:batteryPassportData _:data } }
WHERE {
  SELECT DISTINCT ?r WHERE {
    GRAPH <urn:xw:roots> { ?r xw:schema ?schema }
    GRAPH <urn:xw:out> { ?r ?g ?n }
    GRAPH <urn:xw:bg> { ?g xw:group bpr:batteryPassportData }
  }
} ;
DELETE { GRAPH <urn:xw:out> { ?r ?g ?n } }
INSERT { GRAPH <urn:xw:out> { ?d ?g ?n } }
WHERE {
  GRAPH <urn:xw:roots> { ?r xw:schema ?schema }
  GRAPH <urn:xw:out> { ?r bpr:batteryPassportData ?d . ?r ?g ?n }
  GRAPH <urn:xw:bg> { ?g xw:group bpr:batteryPassportData }
}
