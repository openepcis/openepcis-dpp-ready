package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Derives a human review sheet and a machine-readable provenance graph from the
 * QA-verified completeness reports, describing exactly what the gated apply changed.
 *
 * <p>The TTLs themselves stay as bare graded mappings (project decision); this command
 * records, per applied decision, the action (add / rewrite / remove), both models'
 * verdicts and confidences, and the rationale — so the alignment is auditable without
 * cluttering the ontology. It reconstructs the applied set using the same selection rules
 * as {@link ApplyCommand}: confirmed MISSING/WEAK → add; WRONG with a graded QA relation
 * that differs from the existing one → rewrite; WRONG with QA = NONE → remove.
 */
@CommandLine.Command(
        name = "provenance",
        description = "From the *-opus.json reports, write docs/skos-alignment-review.md (review sheet) "
                + "and docs/alignment-provenance.{ttl,json} (audit trail of applied mappings).")
public class ProvenanceCommand implements Runnable {

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root")
    String repoRoot;

    @CommandLine.Option(names = "--reports-glob", defaultValue = "docs",
            description = "Directory holding the *-opus.json reports.")
    String reportsDir;

    @CommandLine.Option(names = "--bulk-model", defaultValue = "openai/gpt-oss-20b",
            description = "Bulk grader model id (for the provenance record).")
    String bulkModel;

    @CommandLine.Option(names = "--qa-model", defaultValue = "claude-opus-4-8",
            description = "QA verifier model id (for the provenance record).")
    String qaModel;

    @CommandLine.Option(names = "--stamp", defaultValue = "unset",
            description = "Run date to stamp into the provenance (Date.now is unavailable to the tool).")
    String stamp;

    @CommandLine.Option(names = "--min-qa-confidence", defaultValue = "0.75",
            description = "QA-confidence floor (matches apply): below it an add is recorded as rdfs:seeAlso.")
    double minQaConfidence;

    @CommandLine.Option(names = "--review-out", defaultValue = "docs/skos-alignment-review.md")
    String reviewOut;

    @CommandLine.Option(names = "--out", defaultValue = "docs/alignment-provenance")
    String provOut;

    /** One reconstructed applied decision. */
    private record Decision(String module, String action, String ourId, String ourIri,
                            String predicate, String oldPredicate, String upstreamIri,
                            double bulkConfidence, String qaRelation, double qaConfidence,
                            String bulkRationale, String qaRationale) {
        /** The QA verifier's rationale (the deciding one) if present, else the bulk grader's. */
        String qaRatOrBulk() {
            return qaRationale != null && !qaRationale.isBlank() ? qaRationale : bulkRationale;
        }
    }

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        Path dir = root.resolve(reportsDir).normalize();
        List<Path> reports;
        try (Stream<Path> w = Files.list(dir)) {
            reports = w.filter(p -> {
                String n = p.getFileName().toString();
                return n.startsWith("skos-completeness-") && n.endsWith("-opus.json");
            }).sorted().toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        if (reports.isEmpty()) {
            System.err.println("provenance: no *-opus.json reports under " + dir);
            return;
        }

        List<Decision> decisions = new ArrayList<>();
        for (Path rp : reports) {
            try {
                JsonNode doc = mapper.readTree(rp.toFile());
                for (JsonNode f : doc.path("findings")) {
                    Decision d = toDecision(f);
                    if (d != null) decisions.add(d);
                }
            } catch (IOException e) {
                System.err.println("provenance: cannot read " + rp + ": " + e.getMessage());
            }
        }
        System.err.printf("provenance: %d applied decisions across %d reports%n",
                decisions.size(), reports.size());

        writeReview(root.resolve(reviewOut), decisions);
        writeProvenanceTtl(root.resolve(provOut + ".ttl"), decisions);
        writeProvenanceJson(root.resolve(provOut + ".json"), decisions);
        System.out.println("review: " + root.resolve(reviewOut));
        System.out.println("prov:   " + root.resolve(provOut) + ".{ttl,json}");
    }

    /** Reconstruct the applied action for a finding, or null if it was not applied. */
    private Decision toDecision(JsonNode f) {
        String status = f.path("status").asText();
        String module = f.path("module").asText();
        String ourId = f.path("ourId").asText();
        String ourIri = f.path("ourIri").asText();
        String upIri = f.path("upstreamIri").asText();
        double conf = f.path("confidence").asDouble();
        double qaConf = f.path("qaConfidence").isNumber() ? f.path("qaConfidence").asDouble() : 0.0;
        String qaRel = f.path("qaRelation").isNull() || !f.path("qaRelation").isTextual()
                ? null : f.path("qaRelation").asText();
        String bulkRat = f.path("rationale").asText("");
        String qaRat = f.path("qaRationale").asText("");
        String existing = f.path("existingPredicate").isNull() ? null
                : f.path("existingPredicate").asText(null);

        if ("MISSING".equals(status) || "WEAK".equals(status)) {
            if (!f.path("confirmed").asBoolean(false)) return null; // only confirmed were applied
            String pred = f.path("proposedPredicate").asText(null);
            if (pred == null || "null".equals(pred)) return null;
            // Below the QA floor the graded relation was downgraded to rdfs:seeAlso (matches apply).
            String effPred = (pred.startsWith("skos:") && pred.endsWith("Match") && qaConf < minQaConfidence)
                    ? "rdfs:seeAlso" : pred;
            String action = effPred.equals("rdfs:seeAlso") && !pred.equals("rdfs:seeAlso")
                    ? "add-seealso" : "add";
            return new Decision(module, action, ourId, ourIri, effPred, null, upIri,
                    conf, qaRel, qaConf, bulkRat, qaRat);
        }
        if ("WRONG".equals(status)) {
            String newPred = relationToPredicate(qaRel);
            if (newPred == null) { // QA said NONE → removal
                if (qaRel != null && qaRel.equals("NONE") && existing != null) {
                    return new Decision(module, "remove", ourId, ourIri, existing, existing, upIri,
                            conf, qaRel, qaConf, bulkRat, qaRat);
                }
                return null;
            }
            if (existing == null || localName(newPred).equals(localName(existing))) return null; // no-op
            return new Decision(module, "rewrite", ourId, ourIri, newPred, existing, upIri,
                    conf, qaRel, qaConf, bulkRat, qaRat);
        }
        return null;
    }

    private void writeReview(Path out, List<Decision> ds) {
        StringBuilder sb = new StringBuilder();
        sb.append("# SKOS alignment — human review sheet\n\n");
        sb.append("Generated ").append(stamp).append(" from the QA-verified completeness reports. ")
                .append("Each row is a change the gated apply made (bulk grader = `").append(bulkModel)
                .append("`, QA verifier = `").append(qaModel).append("`). Tick to sign off; ")
                .append("strike + note any you want reverted.\n\n");
        long add = ds.stream().filter(d -> d.action().equals("add")).count();
        long rw = ds.stream().filter(d -> d.action().equals("rewrite")).count();
        long rm = ds.stream().filter(d -> d.action().equals("remove")).count();
        sb.append("**").append(ds.size()).append(" decisions: ").append(add).append(" add · ")
                .append(rw).append(" rewrite · ").append(rm).append(" remove.**\n\n");

        Map<String, List<Decision>> byModule = new LinkedHashMap<>();
        ds.stream().sorted((a, b) -> {
            int m = a.module().compareTo(b.module());
            return m != 0 ? m : a.action().compareTo(b.action());
        }).forEach(d -> byModule.computeIfAbsent(d.module(), k -> new ArrayList<>()).add(d));

        byModule.forEach((module, rows) -> {
            sb.append("## ").append(module).append(" (").append(rows.size()).append(")\n\n");
            sb.append("| ✓ | Action | Our term | Relation | Upstream | bulk | QA | Rationale |\n");
            sb.append("|---|---|---|---|---|---|---|---|\n");
            for (Decision d : rows) {
                String rel = d.action().equals("rewrite")
                        ? "`" + d.oldPredicate() + "`→`" + d.predicate() + "`"
                        : (d.action().equals("remove") ? "drop `" + d.oldPredicate() + "`"
                        : "`" + d.predicate() + "`");
                sb.append("| [ ] | ").append(d.action()).append(" | `").append(d.ourId()).append("` | ")
                        .append(rel).append(" | ").append(d.upstreamIri()).append(" | ")
                        .append(fmt(d.bulkConfidence())).append(" | ")
                        .append(d.qaRelation() == null ? "—" : d.qaRelation() + " " + fmt(d.qaConfidence()))
                        .append(" | ").append(clean(d.qaRatOrBulk())).append(" |\n");
            }
            sb.append("\n");
        });
        write(out, sb.toString());
    }

    private void writeProvenanceTtl(Path out, List<Decision> ds) {
        StringBuilder sb = new StringBuilder();
        sb.append("@prefix vsprov: <https://ref.openepcis.io/vocab-sync/provenance#> .\n");
        sb.append("@prefix prov: <http://www.w3.org/ns/prov#> .\n");
        sb.append("@prefix dcterms: <http://purl.org/dc/terms/> .\n");
        sb.append("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n");
        sb.append("# Provenance for vocab-sync-applied SKOS mappings. The mappings themselves live\n");
        sb.append("# in the module ontologies as bare graded relations; this graph records how each\n");
        sb.append("# was decided (models, confidences, action) for audit. Not consumed at runtime.\n\n");
        sb.append("vsprov:run a prov:Activity ;\n")
                .append("    dcterms:date \"").append(stamp).append("\" ;\n")
                .append("    vsprov:bulkModel \"").append(bulkModel).append("\" ;\n")
                .append("    vsprov:qaModel \"").append(qaModel).append("\" .\n\n");
        for (Decision d : ds) {
            sb.append("[] a vsprov:MappingDecision ;\n");
            sb.append("    prov:wasGeneratedBy vsprov:run ;\n");
            sb.append("    vsprov:module \"").append(d.module()).append("\" ;\n");
            sb.append("    vsprov:action \"").append(d.action()).append("\" ;\n");
            sb.append("    vsprov:subject <").append(d.ourIri()).append("> ;\n");
            sb.append("    vsprov:predicate \"").append(d.predicate()).append("\" ;\n");
            if (d.oldPredicate() != null && !d.oldPredicate().equals(d.predicate())) {
                sb.append("    vsprov:previousPredicate \"").append(d.oldPredicate()).append("\" ;\n");
            }
            sb.append("    vsprov:object <").append(d.upstreamIri()).append("> ;\n");
            sb.append("    vsprov:bulkConfidence \"").append(fmt(d.bulkConfidence())).append("\"^^xsd:decimal ;\n");
            if (d.qaRelation() != null) {
                sb.append("    vsprov:qaRelation \"").append(d.qaRelation()).append("\" ;\n");
                sb.append("    vsprov:qaConfidence \"").append(fmt(d.qaConfidence())).append("\"^^xsd:decimal ;\n");
            }
            sb.append("    vsprov:rationale \"").append(escape(d.qaRatOrBulk())).append("\" .\n\n");
        }
        write(out, sb.toString());
    }

    private void writeProvenanceJson(Path out, List<Decision> ds) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("generated", stamp);
        doc.put("bulkModel", bulkModel);
        doc.put("qaModel", qaModel);
        doc.put("decisions", ds);
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(out.toFile(), doc);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static String relationToPredicate(String rel) {
        if (rel == null) return null;
        return switch (rel) {
            case "EXACT" -> "skos:exactMatch";
            case "CLOSE" -> "skos:closeMatch";
            case "BROAD" -> "skos:broadMatch";
            case "NARROW" -> "skos:narrowMatch";
            default -> null;
        };
    }

    private static String localName(String prefixed) {
        int i = prefixed.indexOf(':');
        return i >= 0 ? prefixed.substring(i + 1) : prefixed;
    }

    private static String fmt(double d) {
        return String.format(Locale.ROOT, "%.2f", d);
    }

    private static String clean(String s) {
        return s == null ? "" : s.replace("|", "\\|").replace("\n", " ").trim();
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").trim();
    }

    private void write(Path out, String content) {
        try {
            Files.createDirectories(out.getParent());
            Files.writeString(out, content);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}

