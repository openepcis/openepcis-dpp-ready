package io.openepcis.dpp.vocabsync;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReviewWorkbookTest {

    private static ReviewWorkbook.Decision add(String our, String up) {
        return new ReviewWorkbook.Decision("battery", "add", "eubat:" + local(our), our,
                "skos:exactMatch", null, up, 0.95, "EXACT", 0.92, "ok", "{EXACT=3}", "panel agrees");
    }

    private static ReviewWorkbook.Decision remove(String our, String up) {
        return new ReviewWorkbook.Decision("battery", "remove", "eubat:" + local(our), our,
                "skos:exactMatch", "skos:exactMatch", up, 0.90, "NONE", 0.95, "review",
                "{NONE=3}", "panel majority NONE");
    }

    private static String local(String iri) {
        return iri.substring(iri.lastIndexOf('/') + 1);
    }

    @Test
    void roundTripReturnsOnlyAcceptedRows(@org.junit.jupiter.api.io.TempDir Path tmp) throws Exception {
        Path xlsx = tmp.resolve("review.xlsx");
        var a1 = add("https://ref.openepcis.io/extensions/eu/battery/ratedEnergy", "urn:samm:x#ratedEnergy");
        var rm = remove("https://ref.openepcis.io/extensions/eu/battery/maximumVoltage",
                "https://dpp-keystone.org/spec/v2/terms#voltageMaximum");
        var a2 = add("https://ref.openepcis.io/extensions/eu/battery/recyclabilityRate",
                "https://ref.openepcis.io/extensions/common/core/recyclabilityRate");
        ReviewWorkbook.write(xlsx, List.of(a1, rm, a2), "2026-06-26", "gpt-oss-20b", "qwen3-32b");

        // All rows default to Apply?=yes → all three come back.
        assertEquals(3, ReviewWorkbook.readAccepted(xlsx).size());

        // Reject a1 (the ratedEnergy add) by setting its Apply? cell to "no".
        rejectRowByOurIri(xlsx, a1.ourIri());

        List<ReviewWorkbook.Decision> accepted = ReviewWorkbook.readAccepted(xlsx);
        assertEquals(2, accepted.size());
        assertTrue(accepted.stream().noneMatch(d -> d.ourIri().equals(a1.ourIri())),
                "rejected row must not be returned");
        // The remove row survives with its action + keys intact for apply.
        ReviewWorkbook.Decision back = accepted.stream()
                .filter(d -> d.ourIri().equals(rm.ourIri())).findFirst().orElseThrow();
        assertEquals("remove", back.action());
        assertEquals(rm.upstreamIri(), back.upstreamIri());
        assertEquals("skos:exactMatch", back.oldPredicate());
    }

    /** Open the workbook, find the data row whose hidden ourIri matches, flip Apply? to "no", save. */
    private static void rejectRowByOurIri(Path xlsx, String ourIri) throws Exception {
        Workbook wb;
        try (InputStream is = Files.newInputStream(xlsx)) {
            wb = new XSSFWorkbook(is);
        }
        Sheet sheet = wb.getSheetAt(0);
        Row header = sheet.getRow(0);
        int applyCol = -1, ourIriCol = -1;
        for (Cell c : header) {
            if (c.getStringCellValue().equals("Apply?")) applyCol = c.getColumnIndex();
            if (c.getStringCellValue().equals("ourIri")) ourIriCol = c.getColumnIndex();
        }
        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row != null && ourIri.equals(row.getCell(ourIriCol).getStringCellValue())) {
                row.getCell(applyCol).setCellValue("no");
            }
        }
        try (OutputStream os = Files.newOutputStream(xlsx)) {
            wb.write(os);
        }
        wb.close();
    }
}
