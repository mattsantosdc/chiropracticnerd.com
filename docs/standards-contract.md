# Standards contract

This contract reserves stable identifiers and defines how the Markdown model will map to established standards when a machine-readable export is justified. Markdown remains the canonical authoring format. No RDF, JSON-LD, or nanopublication is emitted yet, so the reserved identifiers are not presented as currently dereferenceable resources.

## Stable identifiers

Public routes may change; semantic identifiers may not. The reserved patterns are:

| Resource | Identifier pattern |
| --- | --- |
| Model entry | `https://chiropracticnerd.com/id/model/{MODEL-ID}` |
| Direct dependency | `https://chiropracticnerd.com/id/dependency/{UPSTREAM-ID}--{DOWNSTREAM-ID}` |
| Future argument | `https://chiropracticnerd.com/id/argument/{ARGUMENT-ID}` |
| Dependency role | `https://chiropracticnerd.com/vocab/dependency-role/{ROLE}` |

Argument IDs will use `ARG-###`. Entry IDs and argument IDs are permanent identities; URL slugs remain mutable presentation routes.

## Export application profile

The eventual export will use stable RDF 1.1 semantics and JSON-LD 1.1. It will reuse a standard term only when its published semantics match the Model; the remaining terms will live in a small Chiropractic Nerd vocabulary.

| Model concern | Export mapping |
| --- | --- |
| Entry metadata | Dublin Core terms such as `dcterms:identifier`, `dcterms:title`, `dcterms:modified`, and `dcterms:hasVersion`, plus `cn:ModelEntry` |
| Direct dependency | Downstream `dcterms:requires` upstream; the qualified dependency resource uses `cn:upstream`, `cn:downstream`, `cn:role`, and `dcterms:description` |
| Dependency role | One of the five local role identifiers; no external equivalence is asserted |
| See-also link | Symmetric `dcterms:relation` statements |
| Concepts and terminology | [SKOS](https://www.w3.org/TR/skos-reference/) only after concepts are separated from the entries that define or discuss them |
| Structured reasoning | A claim/scheme-node pattern compatible with the [Argument Interchange Format](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf) |
| Authorship, revision, and derivation | [PROV-O](https://www.w3.org/TR/prov-o/) |
| Citation intent | [CiTO](https://sparontologies.github.io/cito/current/cito.html) |
| Evidence method | [ECO](https://evidenceontology.org/) only when an exact biomedical evidence term applies |
| Export constraints | [SHACL](https://www.w3.org/TR/shacl/) shapes generated and tested alongside the export |

[`dcterms:requires`](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/requires/) is the generic dependency predicate because its published definition covers a resource required to support another resource's function, delivery, or coherence. A qualified dependency is also represented as its own resource because the local role and explanatory note describe the dependency itself, not either endpoint.

SKOS's direct-versus-transitive distinction informs the direct-edge rule, but Model entries are not automatically `skos:Concept` resources. CiTO describes why a publication is cited, not why one Model entry depends on another. PROV-O describes lineage, not argumentative support. These boundaries prevent convenient but false ontology mappings.

## Staged argument layer

When a trigger in the [dependency model](dependency-model.md#reasoning-is-a-separate-layer) first occurs, add editor-curated argument records with:

- a permanent `ARG-###` ID;
- one or more premise entry IDs;
- exactly one conclusion entry ID;
- a named deductive or defeasible reasoning scheme;
- an explanation and editorial status; and
- addressable objections that may target either a claim or an argument.

Alternative positions remain ordinary Model entries. Multiple argument records may support the same conclusion. Arguments and objections may contain cycles; the reader-facing dependency view remains acyclic and is derived from or explicitly reconciled with the argument layer.

Public comments are discussion, not graph assertions. Only editor-curated claims, arguments, alternatives, and objections become canonical Model data.

## Deferred work

Do not introduce an RDF store, SPARQL endpoint, JSON-LD export, SHACL runtime, or nanopublication packaging until an actual integration or independent claim-publication use case exists. When export begins, all reserved HTTP identifiers must resolve and the generated graph must pass its SHACL shapes before publication.
