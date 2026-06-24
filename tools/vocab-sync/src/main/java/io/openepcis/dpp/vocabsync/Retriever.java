package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.model.Candidate;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Per-term candidate retrieval: embeds the whole upstream index once, then for each of
 * our terms returns the top-K nearest upstream terms <em>per vocabulary</em> (so a small
 * vocab is never crowded out by a large one), unioned with any exact local-name matches.
 * Type is enforced — a class only retrieves classes, a property only properties.
 */
@ApplicationScoped
public class Retriever {

    @Inject
    Embeddings embeddings;

    @Inject
    UpstreamIndex upstreamIndex;

    private List<UpstreamTerm> upstream;
    private List<float[]> upstreamVectors;

    /** Embed the upstream index once (cached on disk by {@link Embeddings}). */
    public synchronized void prepare() {
        if (upstream != null) return;
        upstream = upstreamIndex.all();
        upstreamVectors = embeddings.embedAll(upstream.stream().map(UpstreamTerm::embedText).toList());
    }

    /**
     * Top-K nearest upstream candidates per vocab for one of our terms, plus exact
     * local-name matches. Returned distinct, strongest score first.
     */
    public List<Candidate> candidatesFor(OurTerm term, int kPerVocab) {
        prepare();
        float[] qv = embeddings.embed(term.embedText());
        String ourLocalLc = term.localName().toLowerCase(Locale.ROOT);
        Set<String> ourTokens = tokens(term.localName());

        // Group scored candidates by vocab, keeping type-compatible terms only.
        Map<String, List<Candidate>> byVocab = new LinkedHashMap<>();
        for (int i = 0; i < upstream.size(); i++) {
            UpstreamTerm u = upstream.get(i);
            if (u.type() != term.type()) continue;
            double score = Embeddings.cosine(qv, upstreamVectors.get(i));
            boolean exact = u.localName() != null
                    && u.localName().toLowerCase(Locale.ROOT).equals(ourLocalLc);
            // Lexical force-include: shares a distinctive name token and is at least loosely
            // similar — catches wording-divergent matches embeddings rank just below the gate.
            boolean lexical = !exact && score >= 0.40
                    && sharesSignificantToken(ourTokens, tokens(u.localName()));
            byVocab.computeIfAbsent(u.vocabId(), k -> new ArrayList<>())
                    .add(new Candidate(u, score, exact || lexical));
        }

        // Per vocab: keep top-K by score, but always retain exact local-name matches.
        Map<String, Candidate> merged = new LinkedHashMap<>();
        for (List<Candidate> list : byVocab.values()) {
            list.sort(Comparator.comparingDouble(Candidate::score).reversed());
            int kept = 0;
            for (Candidate c : list) {
                if (kept < kPerVocab || c.exactLocalName()) {
                    merged.putIfAbsent(c.term().iri(), c);
                    kept++;
                }
            }
        }
        List<Candidate> out = new ArrayList<>(merged.values());
        out.sort(Comparator.comparingDouble(Candidate::score).reversed());
        return out;
    }

    /** Distinctive lower-cased tokens of a camelCase/local name (length ≥ 5 to avoid noise). */
    private static Set<String> tokens(String localName) {
        Set<String> out = new java.util.HashSet<>();
        if (localName == null) return out;
        for (String tok : localName.replaceAll("([a-z0-9])([A-Z])", "$1 $2")
                .replaceAll("[^A-Za-z0-9]", " ").toLowerCase(Locale.ROOT).split("\\s+")) {
            if (tok.length() >= 5) out.add(tok);
        }
        return out;
    }

    private static boolean sharesSignificantToken(Set<String> a, Set<String> b) {
        for (String t : a) if (b.contains(t)) return true;
        return false;
    }
}
