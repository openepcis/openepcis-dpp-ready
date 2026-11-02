package io.openepcis.dpp.vocabsync;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import io.openepcis.dpp.vocabsync.model.TermProposal;
import io.quarkiverse.langchain4j.ModelName;
import io.quarkiverse.langchain4j.RegisterAiService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Drafts a term of ours that would cover an upstream term we have no counterpart for: module,
 * local name, label, definition in our house style, domain/range against our classes (or classes
 * proposed in the same run), and the SKOS mapping back to the upstream term. Runs on the QA model.
 */
@RegisterAiService
@ApplicationScoped
@ModelName("qa")
public interface ProposalDrafter {

    @SystemMessage("""
            You draft terms for the OpenEPCIS DPP-Ready vocabulary, an EPCIS 2.0 extension for
            Digital Product Passports built on the GS1 Web Vocabulary and EPCIS/CBV. Modules and
            prefixes: core (oec:, cross-cutting, the default), battery (eubat:), textile (eutex:),
            electronics (euelec:), detergent (eudet:), ppwr (euppwr:), cpr (eucpr:), iron-steel
            (eusteel:), eudr (eudr:), fsma204 (usfsma:). Put a term in a regulation module only when
            it is specific to that regulation; otherwise core. The module field names one of THESE
            modules, never the upstream module (an upstream "textile-process" term that is textile
            specific goes into textile).

            House style:
            - Properties are lowerCamelCase, classes UpperCamelCase. Object properties that link
              to a class are named has<Thing> or <verb><Thing> (hasRepairInstructions,
              hasEnvironmentalProductDeclaration); datatype properties name the value
              (casNumber, epdValidUntil). Ratios use the 0-1 decimal scale (0.45 = 45 %).
            - The label is Title Case, English. The definition is one or two sentences, English,
              states what the value is and, where useful, the regulation or standard that asks for
              it; it does not restate the label. Never copy the upstream definition verbatim.
            - domain and range name a class from the OUR CLASSES list or from the CLASSES PROPOSED
              IN THIS RUN list (prefixed, e.g. oec:EnvironmentalProductDeclaration), or an XSD
              datatype for a literal (xsd:string, xsd:decimal, xsd:date, xsd:dateTime,
              xsd:boolean, xsd:anyURI, xsd:integer). Leave domain empty rather than inventing one.
              For a class, leave domain and range empty.
            - mapping is the SKOS predicate from OUR drafted term to the upstream term:
              skos:exactMatch when it is the same concept one-to-one, skos:closeMatch when our
              draft deliberately narrows or simplifies it, skos:broadMatch when our draft is more
              general. Prefer exactMatch when the definition is the same.
            - caveat (one sentence, or empty): anything the curator must check — an overlap with
              an existing term of ours, a GS1 term that might already carry it, a modelling
              choice (flat property vs structure).
            - rationale (one sentence): why this term, in this module, with this range.

            Return the draft as JSON with the fields module, localName, termType ("class" or
            "property"), label, definition, domain, range, mapping, rationale, caveat.
            """)
    @UserMessage("""
            UPSTREAM TERM TO COVER
              vocabulary: {vocab}
              module:     {upModule}
              iri:        {iri}
              type:       {type}
              label:      {label}
              definition: {comment}
              domain:     {domain}
              range:      {range}
            NEAREST TERMS OF OURS (id — label: definition) — do not duplicate these
            {candidates}
            OUR CLASSES (prefixed id — label)
            {ourClasses}
            CLASSES PROPOSED IN THIS RUN (prefixed id — label)
            {proposedClasses}
            """)
    TermProposal draft(@V("vocab") String vocab, @V("upModule") String upModule, @V("iri") String iri,
                       @V("type") String type, @V("label") String label, @V("comment") String comment,
                       @V("domain") String domain, @V("range") String range,
                       @V("candidates") String candidates, @V("ourClasses") String ourClasses,
                       @V("proposedClasses") String proposedClasses);
}
