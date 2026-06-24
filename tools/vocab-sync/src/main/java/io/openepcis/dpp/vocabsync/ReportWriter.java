package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.model.Finding;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/** Writes the completeness report as Markdown (human review) + JSON (machine/apply step). */
@ApplicationScoped
public class ReportWriter {

    @Inject
    ObjectMapper mapper;

    public void write(Path mdPath, Path jsonPath, List<Finding> findings, String scope, String stamp) {
        try {
            Files.createDirectories(mdPath.getParent());
            Files.writeString(mdPath, markdown(findings, scope, stamp));
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("scope", scope);
            doc.put("generated", stamp);
            doc.put("counts", counts(findings));
            doc.put("findings", findings);
            mapper.writerWithDefaultPrettyPrinter().writeValue(jsonPath.toFile(), doc);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Map<String, Long> counts(List<Finding> f) {
        Map<String, Long> c = new LinkedHashMap<>();
        for (Finding.Status s : Finding.Status.values()) {
            c.put(s.name(), f.stream().filter(x -> x.status() == s).count());
        }
        return c;
    }

    private String markdown(List<Finding> findings, String scope, String stamp) {
        StringBuilder sb = new StringBuilder();
        sb.append("# SKOS completeness report\n\n");
        sb.append("Scope: **").append(scope).append("**  ·  generated ").append(stamp).append("\n\n");
        sb.append("Each row is a mapping the LLM grader judged a real match between one of our "
                + "terms and an upstream term, classified against the SKOS already in the TTL.\n\n");

        Map<String, Long> c = counts(findings);
        sb.append("| Status | Count | Meaning |\n|---|---|---|\n");
        sb.append("| MISSING | ").append(c.get("MISSING")).append(" | grader proposes a mapping the TTL does not assert |\n");
        sb.append("| WEAK | ").append(c.get("WEAK")).append(" | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |\n");
        sb.append("| WRONG | ").append(c.get("WRONG")).append(" | TTL's graded relation disagrees with the grader |\n");
        sb.append("| OK | ").append(c.get("OK")).append(" | TTL already asserts the grader's relation |\n\n");

        long qad = findings.stream().filter(f -> f.qaRelation() != null).count();
        if (qad > 0) {
            long confirmed = findings.stream().filter(f -> Boolean.TRUE.equals(f.confirmed())).count();
            sb.append("QA verifier (second-tier model): **").append(confirmed).append(" of ").append(qad)
                    .append("** verified findings confirmed (✓ = QA relation matches the proposal). "
                            + "Prefer confirmed rows when adopting mappings.\n\n");
        }

        for (Finding.Status status : List.of(Finding.Status.MISSING, Finding.Status.WEAK,
                Finding.Status.WRONG, Finding.Status.OK)) {
            List<Finding> rows = findings.stream().filter(f -> f.status() == status)
                    .sorted(Comparator.comparing(Finding::module)
                            .thenComparing(Finding::ourId)
                            .thenComparing(Comparator.comparingDouble(Finding::confidence).reversed()))
                    .toList();
            if (rows.isEmpty()) continue;
            sb.append("## ").append(status).append(" (").append(rows.size()).append(")\n\n");
            Map<String, List<Finding>> byModule = rows.stream()
                    .collect(Collectors.groupingBy(Finding::module, LinkedHashMap::new, Collectors.toList()));
            byModule.forEach((module, mrows) -> {
                sb.append("### ").append(module).append("\n\n");
                sb.append("| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |\n");
                sb.append("|---|---|---|---|---|---|---|---|---|\n");
                for (Finding f : mrows) {
                    String qaRel = f.qaRelation() == null ? "—"
                            : (f.qaRelation().predicate() == null ? "NONE" : "`" + f.qaRelation().predicate() + "`");
                    String qaConf = f.qaConfidence() == null ? "—"
                            : String.format(Locale.ROOT, "%.2f", f.qaConfidence());
                    String tick = f.confirmed() == null ? "" : (f.confirmed() ? "✓" : "✗");
                    sb.append("| `").append(f.ourId()).append("` | ")
                            .append(f.proposedPredicate() == null ? "—" : "`" + f.proposedPredicate() + "`").append(" | ")
                            .append(String.format(Locale.ROOT, "%.2f", f.confidence())).append(" | ")
                            .append(qaRel).append(" | ").append(qaConf).append(" | ").append(tick).append(" | ")
                            .append(f.upstreamIri()).append(" | ")
                            .append(f.existingPredicate() == null ? "—" : "`" + f.existingPredicate() + "`").append(" | ")
                            .append(f.rationale() == null ? "" : f.rationale().replace("|", "\\|").replace("\n", " "))
                            .append(" |\n");
                }
                sb.append("\n");
            });
        }
        return sb.toString();
    }
}
