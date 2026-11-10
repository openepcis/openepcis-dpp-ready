# Lower reshape, shared: turn the virtual flat handles of shared/battery-handles.ttl in the
# output into the battery state (on the product) and the performance test (on the technical
# specification). The engine drops the handles afterwards.

# One assessment per holder and scope.
INSERT { GRAPH <urn:xw:out> { ?h ?entry ?a . ?a a ?cls } }
WHERE {
  SELECT ?h ?entry ?cls (SAMPLE(BNODE()) AS ?a) WHERE {
    GRAPH <urn:xw:out> { ?h ?v ?x }
    GRAPH <urn:xw:bg> { ?v xw:in ?scope }
    VALUES (?scope ?entry ?cls) { (xw:BatteryState eubat:hasBatteryState eubat:BatteryStateAssessment)
                                  (xw:PerformanceTest eubat:hasPerformanceTest eubat:PerformanceDurabilityTest) }
    FILTER NOT EXISTS { GRAPH <urn:xw:out> { ?h ?entry ?existing } }
  } GROUP BY ?h ?entry ?cls
} ;

# Results: a quantity node is kept, a number gets the parameter's unit. Numbers are xsd:decimal,
# whatever datatype the target wrote.
INSERT { GRAPH <urn:xw:out> {
  ?a oea:hasResult ?r . ?r a oea:MeasurementResult ; oea:hasObservedParameter ?param ; oea:hasMeasuredValue ?q .
  ?q a gs1:QuantitativeValue .
  ?nq gs1:value ?num ; gs1:unitCode ?unit } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:parameter ?param ; xw:in ?scope ; xw:unit ?unit . OPTIONAL { ?v xw:literal ?lit } }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:out> { ?h ?v ?val . ?h ?entry ?a }
  # A handle that should carry a quantity but got a bare number (a target that states it flat)
  # is treated like a number.
  BIND(BOUND(?lit) || isLiteral(?val) AS ?bare)
  BIND(BNODE() AS ?r)
  BIND(IF(?bare, BNODE(), ?val) AS ?q)
  BIND(IF(?bare, ?q, ?noNode) AS ?nq)
  BIND(IF(?bare, xsd:decimal(STR(?val)), ?noNumber) AS ?num)
} ;

# Protocol settings and thresholds.
INSERT { GRAPH <urn:xw:out> {
  ?a oea:hasParameterSetting ?ps . ?ps a oea:ParameterSetting ; oea:hasParameter ?param ; oea:hasParameterValue ?q .
  ?q a gs1:QuantitativeValue ; gs1:value ?num ; gs1:unitCode ?unit } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:setting ?param ; xw:unit ?unit }
  GRAPH <urn:xw:out> { ?h ?v ?raw . ?h eubat:hasPerformanceTest ?a }
  BIND(xsd:decimal(STR(?raw)) AS ?num)
  BIND(BNODE() AS ?ps) BIND(BNODE() AS ?q)
} ;
INSERT { GRAPH <urn:xw:out> {
  ?a oea:isEvaluatedAgainst ?t . ?t a ?cls ; oea:hasThresholdParameter ?param ; oea:hasComparisonOperator ?op ; oea:hasThresholdValue ?q .
  ?q a gs1:QuantitativeValue ; gs1:value ?num ; gs1:unitCode ?unit } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:threshold ?cls ; xw:thresholdParameter ?param ; xw:operator ?op ; xw:unit ?unit }
  GRAPH <urn:xw:out> { ?h ?v ?raw . ?h eubat:hasPerformanceTest ?a }
  BIND(xsd:decimal(STR(?raw)) AS ?num)
  BIND(BNODE() AS ?t) BIND(BNODE() AS ?q)
} ;

# The reference test: a link is its URL, a text (a standard's name) its name.
INSERT { GRAPH <urn:xw:out> { ?a oea:hasMethod ?m . ?m a oea:TestMethod ; oea:methodUrl ?u ; oea:methodName ?n } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:methodUrl true }
  GRAPH <urn:xw:out> { ?h ?v ?ref . ?h eubat:hasPerformanceTest ?a }
  BIND(REGEX(STR(?ref), "^[a-z][a-z0-9+.-]*://\\S+$", "i") AS ?isUrl)
  BIND(IF(?isUrl, STRDT(STR(?ref), xsd:anyURI), ?noUrl) AS ?u)
  BIND(IF(?isUrl, ?noName, STR(?ref)) AS ?n)
  BIND(BNODE() AS ?m)
} ;

# Indicators.
INSERT { GRAPH <urn:xw:out> {
  ?a oea:hasIndicator ?i . ?i a oea:Indicator ; oea:hasIndicatorKind ?k ; oea:hasIndicatorValue ?q .
  ?q a gs1:QuantitativeValue ; gs1:value ?num ; gs1:unitCode ?unit } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:indicatorKind ?k ; xw:in xw:BatteryState ; xw:unit ?unit }
  GRAPH <urn:xw:out> { ?h ?v ?raw . ?h eubat:hasBatteryState ?a }
  BIND(xsd:decimal(STR(?raw)) AS ?num)
  BIND(BNODE() AS ?i) BIND(BNODE() AS ?q)
} ;
INSERT { GRAPH <urn:xw:out> { ?cf oea:hasIndicator ?i . ?i a oea:Indicator ; oea:hasIndicatorKind ?k ; oea:hasCategoricalValue ?code } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:indicatorKind ?k ; xw:in xw:CarbonFootprint }
  GRAPH <urn:xw:out> { ?cf ?v ?code }
  BIND(BNODE() AS ?i)
} ;

# Power capability at a state of charge: the handle's node becomes the sub-assessment.
INSERT { GRAPH <urn:xw:out> {
  ?a oea:hasSubAssessment ?sub . ?sub a oea:TestExecution ; oea:hasCondition ?c ; oea:hasResult ?r .
  ?c a oea:AssessmentCondition ; oea:hasConditionType eubat:StateOfChargeLevel ; oea:hasConditionValue ?cq .
  ?cq a gs1:QuantitativeValue ; gs1:value ?soc ; gs1:unitCode "P1" .
  ?r a oea:MeasurementResult ; oea:hasObservedParameter eubat:PowerCapability ; oea:hasMeasuredValue ?pq } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:powerCapability true ; xw:in ?scope }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:out> { ?h ?v ?sub . ?h ?entry ?a . ?sub <urn:xw:v:hasPowerCapability> ?pq . OPTIONAL { ?sub <urn:xw:v:stateOfChargeLevel> ?soc0 } }
  BIND(xsd:decimal(STR(?soc0)) AS ?soc)
  BIND(BNODE() AS ?c) BIND(BNODE() AS ?cq) BIND(BNODE() AS ?r)
} ;

# A power capability stated as a plain quantity, without a state of charge: a sub-assessment with
# the result only.
INSERT { GRAPH <urn:xw:out> {
  ?a oea:hasSubAssessment ?sub . ?sub a oea:TestExecution ; oea:hasResult ?r .
  ?r a oea:MeasurementResult ; oea:hasObservedParameter eubat:PowerCapability ; oea:hasMeasuredValue ?pq .
  ?pq a gs1:QuantitativeValue } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:powerCapability true ; xw:in ?scope }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:out> { ?h ?v ?pq . ?h ?entry ?a . ?pq gs1:value ?any }
  FILTER NOT EXISTS { GRAPH <urn:xw:out> { ?pq <urn:xw:v:hasPowerCapability> ?x } }
  BIND(BNODE() AS ?sub) BIND(BNODE() AS ?r)
}
