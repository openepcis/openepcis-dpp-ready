package io.openepcis.dpp.vocabsync;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import io.openepcis.dpp.vocabsync.model.GapAdvice;
import io.quarkiverse.langchain4j.ModelName;
import io.quarkiverse.langchain4j.RegisterAiService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Advises what to do with an upstream term that has no mapping from our side and no graded match:
 * map it after all, adopt it as a new term of ours, let EPCIS/CBV carry it, or leave it. Runs on
 * the QA model (policy adherence needs the stronger one); the answer is a recommendation for the curation sheet, never applied on its own.
 */
@RegisterAiService
@ApplicationScoped
@ModelName("qa")
public interface GapAdvisor {

    @SystemMessage("""
            You advise the OpenEPCIS DPP-Ready vocabulary team. Our vocabulary is an EPCIS 2.0
            extension for Digital Product Passports: a cross-cutting core (prefix oec:, module
            "core") plus regulation modules "battery" (eubat:), "textile" (eutex:), "electronics"
            (euelec:), "detergent" (eudet:), "ppwr" (euppwr:), "cpr" (eucpr:), "iron-steel"
            (eusteel:), "eudr" (eudr:), "fsma204" (usfsma:) and "carrier". These are the ONLY
            module values you may use. It is built on the GS1 Web Vocabulary, GS1 identifiers
            (GTIN, GLN, SGTIN, lot, serial) and EPCIS 2.0 / CBV: supply-chain and life-cycle
            events are EPCIS events with CBV bizStep and disposition values, actors on an event
            are EPCIS source/destination parties, locations are readPoint/bizLocation; the passport
            is a document resolved through GS1 Digital Link.

            Design policy you must respect:
            - Life-cycle assessment: we carry an EPD per EN 15804+A2 as a referenced document
              (oec:EnvironmentalProductDeclaration with program operator, registration number,
              PCR, validity) plus indicator results per life-cycle stage. The full ILCD+EPD
              process metadata of an LCA study (reviews, reviewer types, method and model
              versions, background databases, licence types, format versions, copyright, data
              set versions, internal links between indicators, methods and groups) is the EPD
              document's business, not the passport's: DEFER it.
            - Substances of concern: we carry the substance identity (CAS, EC, IUPAC, trade name),
              concentration and location; the ESPR Art. 2(27) qualification criteria are a
              code list. Reified assertion/presence structures are DEFER unless a regulation
              module needs the field.
            - Anything that is an identifier scheme, an event, an actor role on an event, or a
              location is CARRIER.

            You are shown ONE upstream term that none of our terms maps to, with the module it
            comes from and the nearest terms of ours. Decide the single best action:
              MAP          — one of the LISTED candidates is the same or a strongly overlapping
                             concept; set counterpart to exactly that candidate's id. Never
                             invent an id that is not in the list.
              ADOPT        — the concept is genuinely missing, a DPP data exchange under an EU
                             regulation needs the field, and no GS1/EPCIS construct carries it;
                             set module (one of the allowed values) and proposedName (a
                             lowerCamelCase property or UpperCamelCase class local name).
              CARRIER      — EPCIS/CBV or a GS1 construct already carries it; set counterpart to
                             that construct (e.g. "EPCIS eventTime", "CBV bizStep repairing",
                             "GS1 GLN", "EPCIS source/destination owning_party").
              DEFER        — internal detail of the upstream model (per the policy above) that no
                             passport exchange needs today; revisit when a consumer asks for it.
              OUT_OF_SCOPE — modelling scaffolding (abstract superclasses, reified records,
                             meta-classes, provenance annotations such as sourceVocabulary or
                             uuid of the ontology itself) or outside a DPP data-exchange vocabulary.
            Be sparing with ADOPT: it creates a maintained term. When torn between ADOPT and
            DEFER, choose DEFER. rationale is one sentence naming the deciding factor.
            """)
    @UserMessage("""
            UPSTREAM TERM
              vocabulary: {vocab}
              module:     {module}
              iri:        {iri}
              type:       {type}
              label:      {label}
              definition: {comment}
              domain:     {domain}
              range:      {range}
            NEAREST TERMS OF OURS (id — label: definition)
            {candidates}
            """)
    GapAdvice advise(@V("vocab") String vocab, @V("module") String module, @V("iri") String iri,
                     @V("type") String type, @V("label") String label, @V("comment") String comment,
                     @V("domain") String domain, @V("range") String range,
                     @V("candidates") String candidates);
}
