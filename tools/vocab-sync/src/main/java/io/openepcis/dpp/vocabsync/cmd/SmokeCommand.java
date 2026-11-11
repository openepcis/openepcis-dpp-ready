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
        System.out.println("Grading oec:massFraction ↔ untp:massFraction …");
        Verdict v = grader.grade(
                "oec:massFraction", "property", "mass fraction",
                "The share of a material in the total mass of the product, on a 0 to 1 scale.",
                "oec:MaterialComposition", "xsd:decimal",
                "UNTP", "https://vocabulary.uncefact.org/untp/massFraction",
                "property", "mass fraction",
                "The mass fraction of the material in the product, as a decimal between 0 and 1.",
                "Material", "decimal");
        System.out.printf("relation=%s  confidence=%.2f%n", v.relation(), v.confidence());
        System.out.println("predicate=" + v.relation().predicate());
        System.out.println("rationale=" + v.rationale());
    }
}
