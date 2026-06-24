package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.Retriever;
import io.openepcis.dpp.vocabsync.model.Candidate;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import jakarta.inject.Inject;
import picocli.CommandLine;

import java.util.List;

/** Embeds the upstream index and prints the retrieved candidates for one of our terms. */
@CommandLine.Command(
        name = "retrieve",
        description = "Show embedding-retrieved upstream candidates for one term (no grading).")
public class RetrieveCommand implements Runnable {

    @Inject
    OurIndex ourIndex;

    @Inject
    Retriever retriever;

    @CommandLine.Option(names = "--term", required = true,
            description = "Our term local name or prefixed id (e.g. carbonFootprintTotal).")
    String term;

    @CommandLine.Option(names = "--k", defaultValue = "5", description = "Candidates per vocab.")
    int k;

    @Override
    public void run() {
        OurTerm t = ourIndex.load(null).stream()
                .filter(o -> term.equals(o.localName()) || term.equals(o.prefixedId()))
                .findFirst().orElse(null);
        if (t == null) {
            System.err.println("term not found: " + term);
            return;
        }
        System.out.printf("%s (%s) — %s%n", t.prefixedId(), t.type().label(),
                t.comment() != null ? t.comment() : t.label());
        if (!t.existing().isEmpty()) {
            System.out.println("existing mappings:");
            t.existing().forEach(m -> System.out.printf("  %s → %s%n", m.predicate(), m.targetIri()));
        }
        System.out.println("retrieved candidates:");
        List<Candidate> cands = retriever.candidatesFor(t, k);
        for (Candidate c : cands) {
            System.out.printf("  %.3f %-10s %s%s%n", c.score(), c.term().vocabId(), c.term().iri(),
                    c.exactLocalName() ? "  [exact-name]" : "");
        }
    }
}
