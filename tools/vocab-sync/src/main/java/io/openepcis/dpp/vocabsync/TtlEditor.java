package io.openepcis.dpp.vocabsync;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Minimal, formatting-preserving TTL surgery: locate a term's statement block by its
 * {@code prefix:localName} subject at column 0, and insert predicate-object lines before
 * the block's closing period. Triple-quoted strings are tracked so a {@code .} inside a
 * comment is never mistaken for the statement terminator. Mirrors scripts/realign-apply.ts.
 */
public final class TtlEditor {

    private static final Pattern SUBJECT_AT_COL0 = Pattern.compile("^[A-Za-z][\\w-]*:[A-Za-z].*");

    private TtlEditor() {
    }

    /** Inclusive [start, end] line indices of the block whose subject is prefixedId, or null. */
    public static int[] blockRange(List<String> lines, String prefixedId) {
        int start = -1;
        // Track triple-quote state while scanning so a subject token that appears at column 0 INSIDE
        // an rdfs:comment """…""" string is not mistaken for the statement's actual subject line.
        boolean inComment = false;
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            boolean startedInComment = inComment;
            int q = 0;
            while ((q = line.indexOf("\"\"\"", q)) >= 0) {
                inComment = !inComment;
                q += 3;
            }
            if (startedInComment) continue; // this line begins inside a comment → not a subject line
            if (!SUBJECT_AT_COL0.matcher(line).matches()) continue;
            if (!line.startsWith(prefixedId)) continue;
            char after = line.length() > prefixedId.length() ? line.charAt(prefixedId.length()) : ' ';
            if (after == ' ' || after == '\t') {
                start = i;
                break;
            }
        }
        if (start < 0) return null;
        boolean inTriple = false;
        for (int i = start; i < lines.size(); i++) {
            String line = lines.get(i);
            int idx = 0;
            while ((idx = line.indexOf("\"\"\"", idx)) >= 0) {
                inTriple = !inTriple;
                idx += 3;
            }
            if (inTriple) continue;
            String trimmed = line.stripTrailing();
            if (trimmed.endsWith(".") && !trimmed.endsWith("\\.")) {
                return new int[]{start, i};
            }
        }
        return null;
    }

    /** True if the block already contains a line mentioning both the predicate and {@code <iri>}. */
    public static boolean blockHas(List<String> lines, int start, int end, String predicate, String iri) {
        String needle = "<" + iri + ">";
        for (int i = start; i <= end; i++) {
            String l = lines.get(i);
            if (l.contains(needle) && l.contains(predicate)) return true;
        }
        return false;
    }

    /** Leading-whitespace indent of a block's predicate lines (defaults to 4 spaces). */
    public static String indentOf(List<String> lines, int start, int end) {
        for (int i = start + 1; i <= end; i++) {
            String l = lines.get(i);
            int n = 0;
            while (n < l.length() && (l.charAt(n) == ' ' || l.charAt(n) == '\t')) n++;
            if (n > 0) return l.substring(0, n);
        }
        return "    ";
    }

    /**
     * Insert {@code triples} (each a {@code predicate <iri>} string, no terminator) before the
     * block's closing period: the old terminator line's {@code .} becomes {@code ;}, the
     * inserted lines carry {@code ;}, and the last inserted line carries {@code .}.
     */
    public static void insertBeforeClose(List<String> lines, int end, String indent, List<String> triples) {
        String closing = lines.get(end);
        int dot = closing.lastIndexOf('.');
        lines.set(end, closing.substring(0, dot) + ";" + closing.substring(dot + 1));
        for (int i = 0; i < triples.size(); i++) {
            String terminator = (i == triples.size() - 1) ? " ." : " ;";
            lines.add(end + 1 + i, indent + triples.get(i) + terminator);
        }
    }

    /**
     * Remove the predicate-object line at {@code idx}, keeping the block valid. If that line was
     * the block terminator ({@code … .}) and a prior predicate line exists in the block, the
     * prior line's trailing {@code ;} becomes {@code .}. A one-liner statement (its own block)
     * is removed wholesale.
     */
    public static void removeLine(List<String> lines, int idx, int blockStart) {
        String line = lines.get(idx).stripTrailing();
        boolean wasTerminator = line.endsWith(".") && !line.endsWith("\\.");
        if (wasTerminator && idx > blockStart) {
            // Promote the previous predicate line to the new terminator.
            int prev = idx - 1;
            String p = lines.get(prev).stripTrailing();
            int semi = p.lastIndexOf(';');
            if (semi >= 0) lines.set(prev, p.substring(0, semi) + "." + p.substring(semi + 1));
        }
        lines.remove(idx);
    }
}
