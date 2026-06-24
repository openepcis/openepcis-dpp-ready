package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import jakarta.inject.Inject;
import picocli.CommandLine;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Loader sanity check: counts and a few samples from both indexes. No LLM calls. */
@CommandLine.Command(
        name = "stats",
        description = "Load our ontology + upstream indexes and print counts/samples (no LLM).")
public class StatsCommand implements Runnable {

    @Inject
    OurIndex ourIndex;

    @Inject
    UpstreamIndex upstreamIndex;

    @CommandLine.Option(names = "--module", description = "Limit our index to one module slug.")
    String module;

    @Override
    public void run() {
        List<OurTerm> ours = ourIndex.load(module);
        System.out.printf("%nOUR TERMS: %d%s%n", ours.size(),
                module != null ? " (module=" + module + ")" : " (all modules)");
        Map<String, Long> byModule = ours.stream()
                .collect(Collectors.groupingBy(OurTerm::moduleSlug, Collectors.counting()));
        byModule.entrySet().stream().sorted(Map.Entry.comparingByKey())
                .forEach(e -> System.out.printf("  %-14s %d%n", e.getKey(), e.getValue()));
        long withMappings = ours.stream().filter(t -> !t.existing().isEmpty()).count();
        System.out.printf("  terms with ≥1 existing mapping: %d / %d%n", withMappings, ours.size());

        ours.stream().filter(t -> !t.existing().isEmpty()).limit(3).forEach(t -> {
            System.out.printf("  e.g. %s (%s): %s%n", t.prefixedId(), t.type().label(),
                    t.existing().stream().map(m -> m.predicate() + "→" + m.targetIri())
                            .limit(3).collect(Collectors.joining(", ")));
        });

        List<UpstreamTerm> up = upstreamIndex.all();
        System.out.printf("%nUPSTREAM TERMS: %d%n", up.size());
        up.stream().collect(Collectors.groupingBy(UpstreamTerm::vocabId, Collectors.counting()))
                .entrySet().stream().sorted(Map.Entry.comparingByKey())
                .forEach(e -> System.out.printf("  %-12s %d%n", e.getKey(), e.getValue()));
    }
}
