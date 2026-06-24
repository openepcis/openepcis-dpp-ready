package io.openepcis.dpp.vocabsync;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for the TTL surgery that edits the canonical ontologies. These are the
 * highest-risk paths (a bad edit corrupts a standards artifact), so each is pinned:
 * block detection (multi-line, one-liner, prefix collision, triple-quoted strings),
 * terminator handling, insertion, and terminator-safe removal.
 */
class TtlEditorTest {

    private static List<String> lines(String... l) {
        return new ArrayList<>(Arrays.asList(l));
    }

    @Test
    void blockRange_multiLineBlock() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    rdfs:label \"Foo\"@en ;",
                "    rdfs:range xsd:string .",
                "",
                "oec:Bar a owl:Class .");
        int[] r = TtlEditor.blockRange(l, "oec:Foo");
        assertArrayEquals(new int[]{0, 2}, r);
    }

    @Test
    void blockRange_oneLiner() {
        List<String> l = lines(
                "oec:Foo a owl:Class .",
                "oec:X skos:exactMatch oec:Y .");
        assertArrayEquals(new int[]{1, 1}, TtlEditor.blockRange(l, "oec:X"));
    }

    @Test
    void blockRange_prefixCollisionDoesNotMatchLongerLocalName() {
        List<String> l = lines(
                "oec:valueType a owl:Class ;",
                "    rdfs:label \"Value Type\"@en .",
                "",
                "oec:value a owl:DatatypeProperty ;",
                "    rdfs:label \"Value\"@en .");
        // "oec:value" must match its own block, not "oec:valueType".
        assertArrayEquals(new int[]{3, 4}, TtlEditor.blockRange(l, "oec:value"));
    }

    @Test
    void blockRange_dotInsideTripleQuotedCommentIsNotTheTerminator() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    rdfs:comment \"\"\"First sentence. Second sentence.\"\"\" ;",
                "    rdfs:label \"Foo\"@en .",
                "oec:Bar a owl:Class .");
        // The block must end at the real terminator (line 2), not at a '.' inside the comment.
        assertArrayEquals(new int[]{0, 2}, TtlEditor.blockRange(l, "oec:Foo"));
    }

    @Test
    void blockRange_notFoundReturnsNull() {
        assertNull(TtlEditor.blockRange(lines("oec:Foo a owl:Class ."), "oec:Missing"));
    }

    @Test
    void insertBeforeClose_flipsTerminatorAndAppends() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    rdfs:label \"Foo\"@en .");
        TtlEditor.insertBeforeClose(l, 1, "    ", List.of("skos:closeMatch gs1:Thing"));
        assertEquals("    rdfs:label \"Foo\"@en ;", l.get(1));
        assertEquals("    skos:closeMatch gs1:Thing .", l.get(2));
    }

    @Test
    void insertBeforeClose_multipleTriplesLastCarriesDot() {
        List<String> l = lines("oec:Foo a owl:Class .");
        TtlEditor.insertBeforeClose(l, 0, "    ", List.of("skos:closeMatch a:b", "rdfs:seeAlso a:b"));
        assertEquals("oec:Foo a owl:Class ;", l.get(0));
        assertEquals("    skos:closeMatch a:b ;", l.get(1));
        assertEquals("    rdfs:seeAlso a:b .", l.get(2));
    }

    @Test
    void removeLine_semicolonTerminatedJustDrops() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    skos:closeMatch gs1:Thing ;",
                "    rdfs:label \"Foo\"@en .");
        TtlEditor.removeLine(l, 1, 0);
        assertEquals(2, l.size());
        assertEquals("    rdfs:label \"Foo\"@en .", l.get(1));
    }

    @Test
    void removeLine_terminatorPromotesPriorLine() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    rdfs:label \"Foo\"@en ;",
                "    skos:closeMatch gs1:Thing .");
        TtlEditor.removeLine(l, 2, 0);
        assertEquals(2, l.size());
        // The previous predicate line must become the new terminator.
        assertTrue(l.get(1).stripTrailing().endsWith("."), "prior line should now end with .");
        assertEquals("    rdfs:label \"Foo\"@en .", l.get(1));
    }

    @Test
    void removeLine_oneLinerRemovedWholesale() {
        List<String> l = lines(
                "oec:A a owl:Class .",
                "oec:X skos:exactMatch oec:Y .");
        TtlEditor.removeLine(l, 1, 1);
        assertEquals(1, l.size());
    }

    @Test
    void indentOf_returnsPredicateIndent() {
        List<String> l = lines(
                "oec:Foo a owl:Class ;",
                "    rdfs:label \"Foo\"@en .");
        assertEquals("    ", TtlEditor.indentOf(l, 0, 1));
    }
}
