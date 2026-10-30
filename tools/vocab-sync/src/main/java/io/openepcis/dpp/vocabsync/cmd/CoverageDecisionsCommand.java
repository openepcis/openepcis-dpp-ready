package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.ReviewWorkbook;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Export the curator's decisions from the {@code coverage} sheet of a review workbook as JSON. The
 * decisions sheet is applied by {@code curate}; the coverage sheet holds judgements that are not
 * mappings (adopt a term, let EPCIS carry it, leave it), so they are exported for the follow-up
 * work rather than applied blindly.
 */
@CommandLine.Command(
        name = "coverage-decisions",
        description = "Export the filled-in Decision rows of a workbook's coverage sheet as JSON.")
public class CoverageDecisionsCommand implements Runnable {

    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--xlsx", required = true, description = "Edited review workbook (repo-relative).")
    String xlsx;

    @CommandLine.Option(names = "--out", description = "JSON output path (repo-relative); stdout when omitted.")
    String out;

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        Path wb = root.resolve(xlsx).normalize();
        if (!Files.isReadable(wb)) {
            System.err.println("coverage-decisions: workbook not found: " + wb);
            return;
        }
        List<ReviewWorkbook.CoverageDecision> decisions = ReviewWorkbook.readCoverageDecisions(wb);
        Map<String, Long> byDecision = new LinkedHashMap<>();
        for (var d : decisions) byDecision.merge(d.decision(), 1L, Long::sum);
        System.err.printf("coverage-decisions: %d decision(s) %s%n", decisions.size(), byDecision);
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("workbook", xlsx);
        doc.put("counts", byDecision);
        doc.put("decisions", decisions);
        try {
            if (out == null) {
                System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(doc));
            } else {
                Path p = root.resolve(out).normalize();
                Files.createDirectories(p.getParent());
                mapper.writerWithDefaultPrettyPrinter().writeValue(p.toFile(), doc);
                System.out.println("decisions: " + p);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
