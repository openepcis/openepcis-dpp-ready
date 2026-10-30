package io.openepcis.dpp.vocabsync;

import org.apache.poi.ss.usermodel.Cell;
import io.openepcis.dpp.vocabsync.model.CoverageRow;
import org.apache.poi.ss.usermodel.DataValidation;
import org.apache.poi.ss.usermodel.DataValidationConstraint;
import org.apache.poi.ss.usermodel.DataValidationHelper;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * The curation review surface: writes one editable {@code .xlsx} row per applied SKOS decision and
 * reads back the curator's accept/reject choices. The visible columns are for human judgement; the
 * hidden columns ({@code ourIri}, {@code upstreamIri}, {@code predicate}, {@code oldPredicate}) make
 * every row self-describing, so sorting or filtering in Excel never breaks the round-trip back to a
 * (subject, object, action) triple. The {@code Apply?} column is a {@code yes}/{@code no} dropdown,
 * pre-filled {@code yes} (review-to-reject); only {@code yes} rows are returned by {@link #readAccepted}.
 */
public final class ReviewWorkbook {

    private ReviewWorkbook() {
    }

    /** One decision row, shared by the writer (full data) and reader (accepted rows). */
    public record Decision(String module, String action, String ourId, String ourIri,
                           String predicate, String oldPredicate, String upstreamIri,
                           double bulkConfidence, String qaRelation, double qaConfidence,
                           String scrutiny, String votes, String rationale) {
    }

    // Stable header names — the reader locates columns by header text, not position.
    private static final String[] HEADERS = {
            "Apply?", "Scrutiny", "Module", "Action", "Our term", "Relation", "Upstream",
            "bulk", "QA", "Votes", "Rationale",
            "ourIri", "upstreamIri", "predicate", "oldPredicate"};
    private static final int HIDDEN_FROM = 11; // columns ≥ this index are hidden key columns
    // Column widths in 1/256-of-a-character units.
    private static final int[] WIDTHS = {
            8, 10, 12, 14, 38, 30, 44, 8, 14, 22, 90, 60, 60, 22, 22};

    public static void write(Path out, List<Decision> rows, String stamp, String bulkModel, String qaModel) {
        write(out, rows, stamp, bulkModel, qaModel, null);
    }

    /**
     * As {@link #write(Path, List, String, String, String)}, plus a {@code coverage} sheet listing every
     * upstream term of a reverse-coverage run with its bucket, nearest term of ours, graded proposal and
     * advisor recommendation, with a free Decision column for the curator. {@code curate} reads only the
     * first sheet, so the extra sheet never changes what gets applied.
     */
    public static void write(Path out, List<Decision> rows, String stamp, String bulkModel, String qaModel,
                             List<CoverageRow> coverage) {
        write(out, rows, stamp, bulkModel, qaModel, coverage, Map.of());
    }

    /** A pre-filled coverage decision: what the Decision and Notes cells start out with. */
    public record Prefill(String decision, String notes) {
    }

    /**
     * As above, with the coverage sheet's Decision and Notes columns pre-filled per upstream IRI
     * (a curator's recommendation set, kept as a JSON file so the workbook is reproducible). The
     * curator overrides only where they disagree.
     */
    public static void write(Path out, List<Decision> rows, String stamp, String bulkModel, String qaModel,
                             List<CoverageRow> coverage, Map<String, Prefill> prefill) {
        // review rows first (need judgement), then by module, then action — surfaces the contested set.
        List<Decision> sorted = new ArrayList<>(rows);
        sorted.sort(Comparator
                .comparingInt((Decision d) -> "review".equals(d.scrutiny()) ? 0 : 1)
                .thenComparing(Decision::module)
                .thenComparing(Decision::action));

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("decisions");

            Font bold = wb.createFont();
            bold.setBold(true);
            var headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);
            var reviewStyle = wb.createCellStyle();
            reviewStyle.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
            reviewStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int c = 0; c < HEADERS.length; c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(HEADERS[c]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(c, WIDTHS[c] * 256);
            }

            int r = 1;
            for (Decision d : sorted) {
                Row row = sheet.createRow(r++);
                set(row, 0, "yes");
                Cell scrut = set(row, 1, d.scrutiny());
                if ("review".equals(d.scrutiny())) scrut.setCellStyle(reviewStyle);
                set(row, 2, d.module());
                set(row, 3, d.action());
                set(row, 4, d.ourId());
                set(row, 5, relationDisplay(d));
                set(row, 6, RdfSupport.localOf(d.upstreamIri()));
                set(row, 7, fmt(d.bulkConfidence()));
                set(row, 8, d.qaRelation() == null ? "—" : d.qaRelation() + " " + fmt(d.qaConfidence()));
                set(row, 9, d.votes() == null ? "" : d.votes());
                set(row, 10, d.rationale() == null ? "" : d.rationale());
                set(row, 11, d.ourIri());
                set(row, 12, d.upstreamIri());
                set(row, 13, d.predicate() == null ? "" : d.predicate());
                set(row, 14, d.oldPredicate() == null ? "" : d.oldPredicate());
            }

            for (int c = HIDDEN_FROM; c < HEADERS.length; c++) sheet.setColumnHidden(c, true);
            sheet.createFreezePane(1, 1); // keep Apply? column + header visible while scrolling
            int lastRow = Math.max(1, sorted.size());
            sheet.setAutoFilter(new CellRangeAddress(0, lastRow, 0, HEADERS.length - 1));

            // Apply? dropdown (yes/no) over the data rows.
            DataValidationHelper dvh = sheet.getDataValidationHelper();
            DataValidationConstraint yn = dvh.createExplicitListConstraint(new String[]{"yes", "no"});
            DataValidation dv = dvh.createValidation(yn,
                    new CellRangeAddressList(1, lastRow, 0, 0));
            dv.setShowErrorBox(true);
            sheet.addValidationData(dv);

            if (coverage != null && !coverage.isEmpty()) writeCoverage(wb, coverage, headerStyle, reviewStyle, prefill);
            writeLegend(wb, sorted, stamp, bulkModel, qaModel, coverage != null && !coverage.isEmpty());

            Files.createDirectories(out.getParent());
            try (OutputStream os = Files.newOutputStream(out)) {
                wb.write(os);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Read the rows the curator left set to {@code yes} in the {@code Apply?} column. */
    public static List<Decision> readAccepted(Path in) {
        List<Decision> accepted = new ArrayList<>();
        try (InputStream is = Files.newInputStream(in); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            Row header = sheet.getRow(0);
            if (header == null) return accepted;
            Map<String, Integer> col = new LinkedHashMap<>();
            for (Cell c : header) col.put(str(c).trim(), c.getColumnIndex());
            Integer applyCol = col.get("Apply?");
            if (applyCol == null) {
                throw new IllegalArgumentException("workbook has no 'Apply?' column: " + in);
            }
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                String apply = cell(row, col, "Apply?").trim().toLowerCase(Locale.ROOT);
                if (!apply.equals("yes")) continue;
                String ourIri = cell(row, col, "ourIri").trim();
                String upIri = cell(row, col, "upstreamIri").trim();
                if (ourIri.isEmpty() || upIri.isEmpty()) continue; // not a data row
                accepted.add(new Decision(
                        cell(row, col, "Module").trim(),
                        cell(row, col, "Action").trim(),
                        cell(row, col, "Our term").trim(),
                        ourIri,
                        cell(row, col, "predicate").trim(),
                        cell(row, col, "oldPredicate").trim(),
                        upIri,
                        0, null, 0, null, null, null));
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return accepted;
    }

    private static final String[] COVERAGE_HEADERS = {
            "Decision", "Bucket", "Module", "Type", "New", "Upstream term", "Label", "Definition",
            "Nearest ours", "cos", "Graded proposal", "Advice", "Advice detail", "Advice rationale", "Notes",
            "upstreamIri"};
    private static final int[] COVERAGE_WIDTHS = {
            14, 11, 11, 9, 5, 34, 30, 70, 30, 6, 36, 14, 34, 70, 30, 60};
    private static final String[] COVERAGE_DECISIONS = {
            "accept advice", "map", "adopt", "carrier", "out of scope", "defer"};

    /** The reverse-coverage sheet: one row per upstream term, the curator fills Decision and Notes. */
    private static void writeCoverage(Workbook wb, List<CoverageRow> coverage,
                                      org.apache.poi.ss.usermodel.CellStyle headerStyle,
                                      org.apache.poi.ss.usermodel.CellStyle flagStyle,
                                      Map<String, Prefill> prefill) {
        Sheet sheet = wb.createSheet("coverage");
        Row header = sheet.createRow(0);
        for (int c = 0; c < COVERAGE_HEADERS.length; c++) {
            Cell cell = header.createCell(c);
            cell.setCellValue(COVERAGE_HEADERS[c]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(c, COVERAGE_WIDTHS[c] * 256);
        }
        // Needs-a-decision rows first (uncovered, then the policy buckets), covered rows last.
        List<CoverageRow> sorted = new ArrayList<>(coverage);
        sorted.sort(Comparator.comparingInt((CoverageRow r) -> switch (r.bucket()) {
                    case "uncovered" -> 0;
                    case "proposed" -> 1;
                    case "epcis-cbv" -> 2;
                    case "code-list" -> 3;
                    default -> 4;
                })
                .thenComparing(r -> r.module() == null ? "" : r.module())
                .thenComparing(CoverageRow::localName));
        int r = 1;
        for (CoverageRow row : sorted) {
            Row x = sheet.createRow(r++);
            Prefill pre = prefill.get(row.upstreamIri());
            set(x, 0, pre == null ? "" : pre.decision());
            Cell b = set(x, 1, row.bucket());
            if ("uncovered".equals(row.bucket())) b.setCellStyle(flagStyle);
            set(x, 2, row.module());
            set(x, 3, row.type());
            set(x, 4, row.isNew() ? "yes" : "");
            set(x, 5, row.localName());
            set(x, 6, row.label());
            set(x, 7, row.definition());
            set(x, 8, row.nearestOurId());
            set(x, 9, row.nearestOurId() == null ? "" : fmt(row.nearestCosine()));
            String prop = row.coveredBy() != null ? row.coveredBy()
                    : row.proposalOurId() != null
                    ? row.proposalOurId() + " " + row.proposalPredicate() + " (" + row.proposalTier()
                    + (row.proposalConfidence() != null ? " " + fmt(row.proposalConfidence()) : "") + ")" : "";
            set(x, 10, prop);
            set(x, 11, row.adviceAction());
            String detail = "";
            if (row.adviceProposedName() != null && !row.adviceProposedName().isBlank()) {
                detail = (row.adviceModule() == null ? "" : row.adviceModule() + ":") + row.adviceProposedName();
            } else if (row.adviceCounterpart() != null && !row.adviceCounterpart().isBlank()) {
                detail = row.adviceCounterpart();
            } else if (row.adviceModule() != null && !row.adviceModule().isBlank()) {
                detail = row.adviceModule();
            }
            set(x, 12, detail);
            set(x, 13, row.adviceRationale());
            set(x, 14, pre == null ? "" : pre.notes());
            set(x, 15, row.upstreamIri());
        }
        sheet.setColumnHidden(COVERAGE_HEADERS.length - 1, true);
        sheet.createFreezePane(1, 1);
        int lastRow = Math.max(1, sorted.size());
        sheet.setAutoFilter(new CellRangeAddress(0, lastRow, 0, COVERAGE_HEADERS.length - 1));
        DataValidationHelper dvh = sheet.getDataValidationHelper();
        DataValidation dv = dvh.createValidation(dvh.createExplicitListConstraint(COVERAGE_DECISIONS),
                new CellRangeAddressList(1, lastRow, 0, 0));
        dv.setShowErrorBox(true);
        sheet.addValidationData(dv);
    }

    /** One curator decision from the coverage sheet (rows with an empty Decision are skipped). */
    public record CoverageDecision(String upstreamIri, String localName, String module, String type,
                                   String bucket, String decision, String notes, String adviceAction,
                                   String adviceDetail, String gradedProposal) {
    }

    /** Read the coverage sheet's filled-in Decision rows; empty if the workbook has no coverage sheet. */
    public static List<CoverageDecision> readCoverageDecisions(Path in) {
        List<CoverageDecision> out = new ArrayList<>();
        try (InputStream is = Files.newInputStream(in); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheet("coverage");
            if (sheet == null) return out;
            Row header = sheet.getRow(0);
            if (header == null) return out;
            Map<String, Integer> col = new LinkedHashMap<>();
            for (Cell c : header) col.put(str(c).trim(), c.getColumnIndex());
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                String decision = cell(row, col, "Decision").trim();
                String iri = cell(row, col, "upstreamIri").trim();
                if (decision.isEmpty() || iri.isEmpty()) continue;
                String advice = cell(row, col, "Advice").trim();
                if (decision.equalsIgnoreCase("accept advice")) {
                    decision = switch (advice.toUpperCase(Locale.ROOT)) {
                        case "MAP" -> "map";
                        case "ADOPT" -> "adopt";
                        case "CARRIER" -> "carrier";
                        case "OUT_OF_SCOPE" -> "out of scope";
                        case "DEFER" -> "defer";
                        default -> "defer";
                    };
                }
                out.add(new CoverageDecision(iri, cell(row, col, "Upstream term").trim(),
                        cell(row, col, "Module").trim(), cell(row, col, "Type").trim(),
                        cell(row, col, "Bucket").trim(), decision, cell(row, col, "Notes").trim(),
                        advice, cell(row, col, "Advice detail").trim(), cell(row, col, "Graded proposal").trim()));
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out;
    }

    private static void writeLegend(Workbook wb, List<Decision> rows, String stamp,
                                    String bulkModel, String qaModel, boolean withCoverage) {
        Sheet s = wb.createSheet("legend");
        s.setColumnWidth(0, 110 * 256);
        long review = rows.stream().filter(d -> "review".equals(d.scrutiny())).count();
        String[] lines = {
                "SKOS alignment — curation workbook",
                "Generated " + stamp + "  (bulk grader = " + bulkModel + ", QA verifier = " + qaModel + ")",
                rows.size() + " decisions; " + review + " flagged 'review' (the rest are high-confidence unanimous).",
                "",
                "HOW TO USE",
                "1. The 'decisions' sheet lists every proposed change. Each row's 'Apply?' is pre-set to yes.",
                "2. Set 'Apply?' to no for any row you want to drop. Filter Scrutiny = review to triage the contested ones first.",
                "3. Save the file, then run:  vocab-sync curate apply --xlsx <this file> --report <report.json> --stamp <date>",
                "   Only the rows left at 'yes' are applied; the review branch is rebuilt from scratch to match.",
                "",
                "ACTIONS (the 'Action' column)",
                "  add          insert a new graded skos:*Match mapping.",
                "  add-seealso  insert rdfs:seeAlso only (QA confidence was below the graded floor).",
                "  rewrite      change an existing mapping's predicate (e.g. closeMatch → exactMatch).",
                "  remove       DROP an existing mapping the QA verifier rejected. Apply? = yes carries out the removal.",
                "",
                "Do not edit the hidden columns (ourIri, upstreamIri, predicate, oldPredicate) — they are the keys",
                "used to apply your choices. Sorting and filtering are safe; every row carries its own keys.",
        };
        String[] coverageLines = {
                "",
                "COVERAGE SHEET (reverse run: one row per upstream term)",
                "  Bucket   covered = one of ours already maps to it (column 'Graded proposal' shows by whom);",
                "           proposed = the graded pass found a match the TTL lacks — it is ALSO a row on the decisions sheet;",
                "           code-list = an individual/concept, adopted by value reference, never by SKOS;",
                "           epcis-cbv = upstream EVENT module, EPCIS/CBV carries it by policy (Advice names the construct);",
                "           uncovered = class/property nothing of ours maps to and no accepted match.",
                "  Advice   MAP / ADOPT / CARRIER / DEFER / OUT_OF_SCOPE from the bulk model, with 'Advice detail' = the counterpart",
                "           or the proposed module:localName. A recommendation only; nothing on this sheet is applied by curate.",
                "  Decision your call per row (dropdown); a pre-filled value is the curator's recommendation (see Notes),",
                "           change it only where you disagree. 'accept advice' takes the Advice column as the decision;",
                "           'adopt' = add a term of ours (name it in Notes if not the proposal); 'map' = map to the term in Notes;",
                "           'carrier' = EPCIS/CBV/GS1 carries it; 'out of scope' = leave; 'defer' = next round.",
        };
        if (withCoverage) {
            String[] all = new String[lines.length + coverageLines.length];
            System.arraycopy(lines, 0, all, 0, lines.length);
            System.arraycopy(coverageLines, 0, all, lines.length, coverageLines.length);
            lines = all;
        }
        for (int i = 0; i < lines.length; i++) {
            s.createRow(i).createCell(0).setCellValue(lines[i]);
        }
    }

    private static String relationDisplay(Decision d) {
        return switch (d.action()) {
            case "rewrite" -> d.oldPredicate() + " → " + d.predicate();
            case "remove" -> "drop " + d.oldPredicate();
            default -> d.predicate();
        };
    }

    private static Cell set(Row row, int c, String v) {
        Cell cell = row.createCell(c);
        cell.setCellValue(v == null ? "" : v);
        return cell;
    }

    private static String cell(Row row, Map<String, Integer> col, String header) {
        Integer idx = col.get(header);
        if (idx == null) return "";
        return str(row.getCell(idx));
    }

    private static String str(Cell c) {
        if (c == null) return "";
        return switch (c.getCellType()) {
            case STRING -> c.getStringCellValue();
            case NUMERIC -> fmt(c.getNumericCellValue());
            case BOOLEAN -> String.valueOf(c.getBooleanCellValue());
            default -> "";
        };
    }

    private static String fmt(double d) {
        return String.format(Locale.ROOT, "%.2f", d);
    }
}
