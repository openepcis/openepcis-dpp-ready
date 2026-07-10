package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.Grader;
import io.openepcis.dpp.vocabsync.model.Verdict;
import jakarta.inject.Inject;
import picocli.CommandLine;

/**
 * Provider smoke test: grades one known pair against the configured LLM endpoint.
 * Confirms the OpenAI-compatible provider is reachable and that structured output
 * (a {@link Verdict}) round-trips. Expected: a CLOSE/EXACT match with a rationale.
 */
@CommandLine.Command(
        name = "smoke",
        description = "Grade one known pair (oec:carbonFootprintTotal ↔ untp:carbonFootprint) "
                + "to verify the LLM endpoint + structured output.")
public class SmokeCommand implements Runnable {

    @Inject
    Grader grader;

    @Override
    public void run() {
        System.out.println("Grading oec:carbonFootprintTotal ↔ untp:carbonFootprint …");
        Verdict v = grader.grade(
                "oec:carbonFootprintTotal", "property", "total carbon footprint",
                "The total cradle-to-gate carbon footprint of the product, in kg CO2e.",
                "oec:Product", "xsd:decimal",
                "UNTP", "https://test.uncefact.org/vocabulary/untp/core/carbonFootprint",
                "property", "carbon footprint",
                "The product carbon footprint declared in a conformity claim.",
                "Product", "decimal");
        System.out.printf("relation=%s  confidence=%.2f%n", v.relation(), v.confidence());
        System.out.println("predicate=" + v.relation().predicate());
        System.out.println("rationale=" + v.rationale());
    }
}
