package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.model.Verdict;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Reads a verdict out of a model reply that was asked for {@link GraderPrompts#JSON_INSTRUCTION}
 * but arrives without a structured-output layer (the benchmark, the Anthropic batch path).
 *
 * <p>Strips Harmony channels and {@code <think>} chains, then tries every balanced {@code {…}}
 * object from the last one backwards (models often emit a malformed draft before a clean final
 * copy), and falls back to a regex over the relation field so a reply whose rationale carries an
 * unescaped quote still yields its relation.
 */
public final class VerdictParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern RELATION_RX = Pattern.compile(
            "\"relation\"\\s*:\\s*\"(EXACT|CLOSE|BROAD|NARROW|NONE)\"", Pattern.CASE_INSENSITIVE);
    private static final Pattern CONFIDENCE_RX = Pattern.compile("\"confidence\"\\s*:\\s*([0-9.]+)");

    private VerdictParser() {
    }

    /** The verdict in {@code text}, or empty when no relation can be recovered. */
    public static Optional<Verdict> parse(String text) {
        if (text == null) return Optional.empty();
        int msg = text.lastIndexOf("<|message|>");
        if (msg >= 0) text = text.substring(msg + "<|message|>".length());
        int think = text.lastIndexOf("</think>");
        if (think >= 0) text = text.substring(think + "</think>".length());
        text = text.replaceAll("<\\|[^|]*\\|>", " ");
        List<String> objs = balancedObjects(text);
        for (int i = objs.size() - 1; i >= 0; i--) {
            try {
                JsonNode v = MAPPER.readTree(objs.get(i));
                Verdict.Relation rel = relation(v.path("relation").asText(""));
                if (rel == null) continue;
                return Optional.of(new Verdict(rel, v.path("confidence").asDouble(0),
                        v.path("rationale").asText("")));
            } catch (Exception ignore) {
                // try the next-earlier object
            }
        }
        var rm = RELATION_RX.matcher(text);
        if (rm.find()) {
            double conf = 0;
            var cm = CONFIDENCE_RX.matcher(text);
            if (cm.find()) {
                try {
                    conf = Double.parseDouble(cm.group(1));
                } catch (NumberFormatException ignore) {
                    // keep 0
                }
            }
            return Optional.of(new Verdict(relation(rm.group(1)), conf, "(recovered)"));
        }
        return Optional.empty();
    }

    private static Verdict.Relation relation(String s) {
        try {
            return Verdict.Relation.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /** All top-level balanced {@code {…}} substrings, in order of appearance. */
    static List<String> balancedObjects(String text) {
        List<String> out = new ArrayList<>();
        int depth = 0, start = -1;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '{') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == '}' && depth > 0) {
                if (--depth == 0 && start >= 0) out.add(text.substring(start, i + 1));
            }
        }
        return out;
    }
}
