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

        // Group scored candidates by vocab, keeping type-compatible terms only.
        Map<String, List<Candidate>> byVocab = new LinkedHashMap<>();
        for (int i = 0; i < upstream.size(); i++) {
            UpstreamTerm u = upstream.get(i);
            if (u.type() != term.type()) continue;
            double score = Embeddings.cosine(qv, upstreamVectors.get(i));
            boolean exact = u.localName() != null
                    && u.localName().toLowerCase(Locale.ROOT).equals(ourLocalLc);
            byVocab.computeIfAbsent(u.vocabId(), k -> new ArrayList<>())
                    .add(new Candidate(u, score, exact));
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
}
