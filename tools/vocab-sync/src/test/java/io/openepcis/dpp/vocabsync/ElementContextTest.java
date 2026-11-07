package io.openepcis.dpp.vocabsync;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.junit.jupiter.api.Test;

import java.io.StringReader;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/** The registry copies a provision's legal text onto each element; the grader must be told. */
class ElementContextTest {

    private static final String TTL = """
            @prefix skos: <http://www.w3.org/2004/02/skos/core#> .
            @prefix v: <https://example.org/v#> .
            v:batteryIdentification skos:prefLabel "Battery identification"@en .
            v:serialNumber skos:broader v:batteryIdentification ;
                skos:definition "Model identification and batch or serial number"@en .
            v:productNumber skos:broader v:batteryIdentification ;
                skos:definition "Model identification and batch or serial number"@en .
            v:manufacturer skos:broader v:batteryIdentification ;
                skos:definition "Name of the manufacturer"@en .
            v:root skos:definition "A top concept"@en .
            """;

    @Test
    void sharedDefinitionIsFlagged() {
        Model m = ModelFactory.createDefaultModel().read(new StringReader(TTL), null, "TTL");
        assertEquals("Part of: Battery identification. The definition above is the legal text of the whole "
                        + "provision, shared with 1 sibling element; this element is only the part its label names.",
                UpstreamIndex.elementContext(m, m.getResource("https://example.org/v#serialNumber")));
        assertEquals("Part of: Battery identification.",
                UpstreamIndex.elementContext(m, m.getResource("https://example.org/v#manufacturer")));
        assertNull(UpstreamIndex.elementContext(m, m.getResource("https://example.org/v#root")));
    }
}
