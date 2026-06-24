package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.Embeddings;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.model.ExistingMapping;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Reverse-coverage pass: the audit asks "for each of OUR terms, what upstream matches?"; this
 * asks the opposite — "which UPSTREAM terms look coverable by one of ours but have no incoming
 * mapping?" For every upstream term with no existing mapping from us, it finds the nearest of
 * our terms by embedding similarity; those above the threshold are gaps worth a human look
 * (adopt the upstream term, or add the missing mapping). Embedding-only (no LLM), so it is fast
 * and free; it surfaces candidates for a follow-up graded audit rather than asserting anything.
 */
@CommandLine.Command(
        name = "reverse",
        description = "Find upstream terms with no incoming mapping that are embedding-near one of "
                + "our terms (coverage gaps) → docs/skos-reverse-coverage.{md,json}.")
public class ReverseCommand implements Runnable {

    @Inject OurIndex ourIndex;
    @Inject UpstreamIndex upstreamIndex;
    @Inject Embeddings embeddings;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--min-cosine", defaultValue = "0.62",
            description = "Only report uncovered upstream terms at/above this similarity to a term of ours.")
    double minCosine;

    @CommandLine.Option(names = "--vocab",
            description = "Limit to one upstream vocab id (e.g. untp, dppk, semic, gs1).")
    String vocab;

    @CommandLine.Option(names = "--per-vocab", defaultValue = "40",
            description = "Max gaps to list per vocabulary in the report.")
    int perVocab;

    @CommandLine.Option(names = "--out", defaultValue = "docs/skos-reverse-coverage")
    String out;

    private record Gap(String vocabId, String upstreamIri, String upstreamLocal, String upstreamType,
                       String nearestOurId, double cosine) {
    }

    @Override
    public void run() {
        List<OurTerm> ours = ourIndex.load(null);
        // Every upstream IRI we already map to (any predicate) is "covered".
        Set<String> covered = new HashSet<>();
        for (OurTerm t : ours) for (ExistingMapping m : t.existing()) covered.add(m.targetIri());

        List<UpstreamTerm> upstream = upstreamIndex.all().stream()
                .filter(u -> vocab == null || vocab.equals(u.vocabId())).toList();
        System.err.printf("reverse: %d our terms, %d covered targets, %d upstream candidates%n",
                ours.size(), covered.size(), upstream.size());

        List<float[]> ourVecs = embeddings.embedAll(ours.stream().map(OurTerm::embedText).toList());
        List<float[]> upVecs = embeddings.embedAll(upstream.stream().map(UpstreamTerm::embedText).toList());

        List<Gap> gaps = new ArrayList<>();
        for (int i = 0; i < upstream.size(); i++) {
            UpstreamTerm u = upstream.get(i);
            if (covered.contains(u.iri())) continue;          // already mapped from our side
            float[] uv = upVecs.get(i);
            double best = -1;
            OurTerm bestOur = null;
            for (int j = 0; j < ours.size(); j++) {
                if (ours.get(j).type() != u.type()) continue;  // class↔class, property↔property
                double c = Embeddings.cosine(uv, ourVecs.get(j));
                if (c > best) { best = c; bestOur = ours.get(j); }
            }
            if (bestOur != null && best >= minCosine) {
                gaps.add(new Gap(u.vocabId(), u.iri(), u.localName(), u.type().label(),
                        bestOur.prefixedId(), best));
            }
        }
        gaps.sort(Comparator.comparingDouble(Gap::cosine).reversed());
        write(gaps);
    }

    private void write(List<Gap> gaps) {
        Map<String, List<Gap>> byVocab = new LinkedHashMap<>();
        gaps.forEach(g -> byVocab.computeIfAbsent(g.vocabId(), k -> new ArrayList<>()).add(g));

        StringBuilder sb = new StringBuilder();
        sb.append("# Reverse coverage — upstream terms not mapped from our side\n\n");
        sb.append("Upstream terms with no incoming mapping that are embedding-near one of our terms ")
                .append("(cosine ≥ ").append(String.format(Locale.ROOT, "%.2f", minCosine))
                .append("). Each is a candidate to adopt or to map; embedding-surfaced only, not graded. ")
                .append("**").append(gaps.size()).append(" gaps.**\n\n");
        byVocab.forEach((v, list) -> {
            sb.append("## ").append(v).append(" (").append(list.size()).append(")\n\n");
            sb.append("| Upstream term | type | nearest ours | cos |\n|---|---|---|---|\n");
            list.stream().limit(perVocab).forEach(g -> sb.append("| ").append(g.upstreamIri())
                    .append(" | ").append(g.upstreamType()).append(" | `").append(g.nearestOurId())
                    .append("` | ").append(String.format(Locale.ROOT, "%.2f", g.cosine())).append(" |\n"));
            if (list.size() > perVocab) sb.append("\n_(+").append(list.size() - perVocab).append(" more)_\n");
            sb.append("\n");
        });

        Path root = Path.of(repoRoot).normalize();
        try {
            Files.createDirectories(root.resolve(out).getParent());
            Files.writeString(root.resolve(out + ".md"), sb.toString());
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("minCosine", minCosine);
            doc.put("gaps", gaps);
            mapper.writerWithDefaultPrettyPrinter().writeValue(root.resolve(out + ".json").toFile(), doc);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        System.out.printf("%nreverse: %d coverage gaps → %s.{md,json}%n", gaps.size(), root.resolve(out));
    }
}
