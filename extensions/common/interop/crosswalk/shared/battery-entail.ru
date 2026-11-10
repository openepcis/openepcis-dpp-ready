# Lift entail, shared: derive the virtual flat handles of shared/battery-handles.ttl from the
# battery state (on the product) and the performance test (on the technical specification).
# A handle carries what the flat property carried before 0.13.0: the measured
# gs1:QuantitativeValue node, or (xw:literal) its number.

# Results.
INSERT { GRAPH <urn:xw:in> { ?holder ?v ?val } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:parameter ?param ; xw:in ?scope . OPTIONAL { ?v xw:literal ?lit } }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:in> { ?holder ?entry ?a . ?a oea:hasResult ?r . ?r oea:hasObservedParameter ?param ; oea:hasMeasuredValue ?qv }
  OPTIONAL { GRAPH <urn:xw:in> { ?qv gs1:value ?num } }
  BIND(IF(BOUND(?lit), ?num, ?qv) AS ?val)
  FILTER(BOUND(?val))
} ;

# Protocol settings and thresholds of the performance test: their number.
INSERT { GRAPH <urn:xw:in> { ?ts ?v ?num } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:setting ?param }
  GRAPH <urn:xw:in> { ?ts eubat:hasPerformanceTest ?a . ?a oea:hasParameterSetting ?ps .
                      ?ps oea:hasParameter ?param ; oea:hasParameterValue ?q . ?q gs1:value ?num }
} ;
INSERT { GRAPH <urn:xw:in> { ?ts ?v ?num } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:threshold ?cls }
  GRAPH <urn:xw:in> { ?ts eubat:hasPerformanceTest ?a . ?a oea:isEvaluatedAgainst ?t .
                      ?t a ?cls ; oea:hasThresholdValue ?q . ?q gs1:value ?num }
} ;

# The reference test: its URL, or its name.
INSERT { GRAPH <urn:xw:in> { ?ts ?v ?ref } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:methodUrl true }
  GRAPH <urn:xw:in> { ?ts eubat:hasPerformanceTest ?a . ?a oea:hasMethod ?m . { ?m oea:methodUrl ?ref } UNION { ?m oea:methodName ?ref } }
} ;

# Indicators: the estimates of the battery state (a number), the carbon footprint class (a code).
INSERT { GRAPH <urn:xw:in> { ?holder ?v ?num } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:indicatorKind ?k ; xw:in xw:BatteryState }
  GRAPH <urn:xw:in> { ?holder eubat:hasBatteryState ?a . ?a oea:hasIndicator ?i .
                      ?i oea:hasIndicatorKind ?k ; oea:hasIndicatorValue ?q . ?q gs1:value ?num }
} ;
INSERT { GRAPH <urn:xw:in> { ?cf ?v ?code } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:indicatorKind ?k ; xw:in xw:CarbonFootprint }
  GRAPH <urn:xw:in> { ?cf oea:hasIndicator ?i . ?i oea:hasIndicatorKind ?k ; oea:hasCategoricalValue ?code }
} ;

# Power capability at a state of charge: the sub-assessment is the handle's node.
INSERT { GRAPH <urn:xw:in> { ?holder ?v ?sub . ?sub <urn:xw:v:stateOfChargeLevel> ?soc ; <urn:xw:v:hasPowerCapability> ?pq } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:powerCapability true ; xw:in ?scope }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:in> {
    ?holder ?entry ?a . ?a oea:hasSubAssessment ?sub .
    ?sub oea:hasCondition ?c . ?c oea:hasConditionType eubat:StateOfChargeLevel ; oea:hasConditionValue ?cq . ?cq gs1:value ?soc .
    ?sub oea:hasResult ?r . ?r oea:hasObservedParameter eubat:PowerCapability ; oea:hasMeasuredValue ?pq
  }
} ;

# A power capability without a state of charge: the handle carries the quantity itself.
INSERT { GRAPH <urn:xw:in> { ?holder ?v ?pq } }
WHERE {
  GRAPH <urn:xw:bg> { ?v xw:powerCapability true ; xw:in ?scope }
  VALUES (?scope ?entry) { (xw:BatteryState eubat:hasBatteryState) (xw:PerformanceTest eubat:hasPerformanceTest) }
  GRAPH <urn:xw:in> {
    ?holder ?entry ?a . ?a oea:hasSubAssessment ?sub .
    ?sub oea:hasResult ?r . ?r oea:hasObservedParameter eubat:PowerCapability ; oea:hasMeasuredValue ?pq
  }
  FILTER NOT EXISTS { GRAPH <urn:xw:in> { ?sub oea:hasCondition ?c } }
}
