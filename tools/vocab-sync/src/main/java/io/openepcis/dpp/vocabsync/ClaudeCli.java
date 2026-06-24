package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

/**
 * QA backend that shells out to the Claude Code CLI in headless mode (`claude -p`). This is
 * the sanctioned way to use a Claude Pro/Max <em>subscription</em> for programmatic work:
 * the CLI authenticates with the subscription login (or {@code CLAUDE_CODE_OAUTH_TOKEN}),
 * unlike the OpenAI-compatible HTTP path which needs a console API key.
 *
 * <p>The subprocess is driven reactively: it starts on subscription (so the audit's
 * {@code merge(concurrency)} bounds how many {@code claude} processes run at once), and
 * {@link Process#onExit()} feeds a {@link Uni} — no worker thread is parked on a blocking
 * {@code waitFor}. Output is redirected to a temp file to avoid pipe-buffer deadlocks.
 */
@ApplicationScoped
public class ClaudeCli {

    @Inject
    ObjectMapper mapper;

    /** Run one grading prompt through `claude -p`, reactively, and parse a {@link Verdict}. */
    public Uni<Verdict> runAsync(String system, String user, String model, int timeoutSec) {
        return Uni.createFrom().deferred(() -> {
            final Path out;
            final Path err;
            final Process proc;
            try {
                out = Files.createTempFile("claude-qa", ".json");
                err = Files.createTempFile("claude-qa", ".err");
                proc = new ProcessBuilder(
                        "claude", "-p", user,
                        "--append-system-prompt", system,
                        "--output-format", "json",
                        "--model", model)
                        .redirectOutput(out.toFile())
                        .redirectError(err.toFile())
                        .start();
            } catch (IOException e) {
                return Uni.createFrom().failure(e);
            }
            return Uni.createFrom().completionStage(proc.onExit())
                    .ifNoItem().after(Duration.ofSeconds(timeoutSec))
                        .failWith(() -> {
                            proc.destroyForcibly();
                            return new IllegalStateException("claude -p timed out after " + timeoutSec + "s");
                        })
                    .map(p -> readResult(p, out, err));
        });
    }

    private Verdict readResult(Process p, Path out, Path err) {
        try {
            if (p.exitValue() != 0) {
                throw new IllegalStateException("claude -p exit " + p.exitValue() + ": "
                        + safeRead(err).strip());
            }
            // --output-format json wraps the reply: { "type":"result", "result":"<text>", ... }
            String stdout = Files.readString(out);
            JsonNode env = mapper.readTree(stdout);
            String text = env.path("result").asText(stdout);
            return parseVerdict(text);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("claude -p parse failed: " + e.getMessage(), e);
        } finally {
            try { Files.deleteIfExists(out); } catch (IOException ignore) { }
            try { Files.deleteIfExists(err); } catch (IOException ignore) { }
        }
    }

    /** Pull the first balanced {…} object out of the reply text and map it to a Verdict. */
    private Verdict parseVerdict(String text) throws IOException {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalStateException("no JSON object in claude reply: " + text.strip());
        }
        JsonNode v = mapper.readTree(text.substring(start, end + 1));
        Verdict.Relation rel = Verdict.Relation.valueOf(
                v.path("relation").asText("NONE").trim().toUpperCase());
        return new Verdict(rel, v.path("confidence").asDouble(0.0), v.path("rationale").asText(""));
    }

    private static String safeRead(Path p) {
        try {
            return Files.readString(p);
        } catch (IOException e) {
            return "(stderr unavailable)";
        }
    }
}
