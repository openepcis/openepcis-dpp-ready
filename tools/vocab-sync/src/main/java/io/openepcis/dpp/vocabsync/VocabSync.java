package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.cmd.ApplyCommand;
import io.openepcis.dpp.vocabsync.cmd.AuditCommand;
import io.openepcis.dpp.vocabsync.cmd.BenchmarkCommand;
import io.openepcis.dpp.vocabsync.cmd.FetchCommand;
import io.openepcis.dpp.vocabsync.cmd.ManifestCommand;
import io.openepcis.dpp.vocabsync.cmd.ProvenanceCommand;
import io.openepcis.dpp.vocabsync.cmd.RetrieveCommand;
import io.openepcis.dpp.vocabsync.cmd.ReverseCommand;
import io.openepcis.dpp.vocabsync.cmd.SmokeCommand;
import io.openepcis.dpp.vocabsync.cmd.StatsCommand;
import io.openepcis.dpp.vocabsync.cmd.SyncCommand;
import io.quarkus.picocli.runtime.annotations.TopCommand;
import picocli.CommandLine;

/**
 * Top-level CLI. Audits and maintains graded-SKOS mappings from the OpenEPCIS
 * DPP-extension ontology to upstream vocabularies. The tool only proposes; the
 * canonical TTLs are never auto-edited (a separate, gated apply step writes them).
 */
@TopCommand
@CommandLine.Command(
        name = "vocab-sync",
        mixinStandardHelpOptions = true,
        version = "vocab-sync 0.1.0",
        header = "OpenEPCIS DPP-Ready upstream-vocabulary SKOS sync",
        description = "Index our ontology + upstream vocabularies, embed and LLM-grade "
                + "candidate mappings, and report missing/weak/wrong SKOS alignments.",
        subcommands = {
                SmokeCommand.class,
                StatsCommand.class,
                RetrieveCommand.class,
                AuditCommand.class,
                ApplyCommand.class,
                ProvenanceCommand.class,
                ReverseCommand.class,
                ManifestCommand.class,
                FetchCommand.class,
                BenchmarkCommand.class,
                SyncCommand.class,
        })
public class VocabSync {
}
