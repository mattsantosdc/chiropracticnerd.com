# Standards contract

This contract reserves stable identifiers and defines how the canonical Markdown architecture may later map to established interchange standards. No RDF, JSON-LD, or nanopublication is emitted yet, so the reserved identifiers are not presented as currently dereferenceable resources.

## Stable identifiers

Public routes may change; semantic identifiers may not. The reserved patterns are:

| Resource | Identifier pattern |
| --- | --- |
| Statement | `https://chiropracticnerd.com/id/statement/{STATEMENT-ID}` |
| Direct dependency | `https://chiropracticnerd.com/id/dependency/{UPSTREAM-ID}--{DOWNSTREAM-ID}` |
| Argument | `https://chiropracticnerd.com/id/argument/{ARGUMENT-ID}` |
| Dependency role | `https://chiropracticnerd.com/vocab/dependency-role/{ROLE}` |

Statement IDs use `S-###` (three decimal digits), unique across all domains. Argument IDs use `ARG-###`.
Statement IDs are permanent identifiers only: their numeric values carry no ordering, hierarchy,
domain, or inferential meaning. Presentation uses `domain` and `order`; IDs must not determine
sorting or graph layout. The [Stage 1 migration map](statements-stage-1-migration.md) records the explicitly authorized
prepublication exception and the earlier domain-ID migration; old IDs are not accepted aliases.

Statement and argument IDs are permanent identities; URL slugs are mutable presentation routes and must not be used as semantic identifiers. The `/model/arguments/` namespace is reserved for argument presentation, so statement slugs cannot be `arguments` or begin with `arguments/`.

## Active Markdown architecture

The Model is the complete account, built from statements and arguments. Statements in
`src/content/model/statements/` express propositions, definitions, values, framework commitments,
and strategies. The `statements` and `arguments` Astro collections load only their respective
canonical sibling directories; no collection loads the shared parent. Direct `upstream` metadata remains the canonical acyclic revision-impact graph.

Argument records in `src/content/model/arguments/` are now the canonical structured reasoning layer. Each contains one or more statement premises, one statement conclusion, an inference kind, a named scheme, version and updated date, and explanatory prose. Arguments do not create a `logical` statement type and do not use a Boolean soundness field. Multiple arguments may conclude the same statement, and a statement may be both a conclusion and a premise across the hierarchy.

Inclusion in a version identifies statements and arguments as the Model's working account. Neither collection uses an editorial `status` property. Adoption remains separate from evidential confidence and inferential evaluation; it is not a claim of truth or validity.

The [Argument Interchange Format](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf) is reserved as a future interchange representation for these structured records. AIF is not the Model's reasoning methodology and is not part of current authoring or delivery. Natural-language validity remains an editor-curated judgment.

Public comments are discussion, not graph assertions. Only editor-curated statement and argument Markdown is canonical. Addressable objections may be added when the content requires them; no objection ontology is introduced for v0.1.

## Future export application profile

An eventual export will use stable RDF 1.1 semantics and JSON-LD 1.1. It will reuse a standard term only when its published semantics match the Model; remaining terms will live in a small Chiropractic Nerd vocabulary.

| Model concern | Future export mapping |
| --- | --- |
| Statement metadata | Dublin Core terms such as `dcterms:identifier`, `dcterms:title`, `dcterms:modified`, and `dcterms:hasVersion`, plus `cn:StatementEntry` |
| Direct dependency | Downstream `dcterms:requires` upstream; the qualified dependency resource uses `cn:upstream`, `cn:downstream`, `cn:role`, and `dcterms:description` |
| Dependency role | One of the five local role identifiers; no external equivalence is asserted |
| See-also link | Symmetric `dcterms:relation` statements |
| Concepts and terminology | [SKOS](https://www.w3.org/TR/skos-reference/) only after concepts are separated from the statements that define or discuss them |
| Structured reasoning | A claim/scheme-node representation compatible with AIF |
| Authorship, revision, and derivation | [PROV-O](https://www.w3.org/TR/prov-o/) |
| Citation intent | [CiTO](https://sparontologies.github.io/cito/current/cito.html) |
| Evidence method | [ECO](https://evidenceontology.org/) only when an exact biomedical evidence term applies |
| Export constraints | [SHACL](https://www.w3.org/TR/shacl/) shapes generated and tested alongside the export |

[`dcterms:requires`](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/requires/) is the generic dependency predicate because its published definition covers a resource required to support another resource's function, delivery, or coherence. A qualified dependency is also represented as its own resource because the local role and explanatory note describe the dependency itself, not either endpoint.

SKOS's direct-versus-transitive distinction informs the direct-edge rule, but statements are not automatically `skos:Concept` resources. CiTO describes why a publication is cited, not why one statement depends on another. PROV-O describes lineage, not argumentative support. These boundaries prevent convenient but false ontology mappings.

Argument cycles, future objection links, or competing reasoning paths must not invalidate the reader-facing dependency DAG. The two layers are validated independently and need not have the same topology.

## Deferred work

Do not introduce an RDF store, SPARQL endpoint, JSON-LD export, SHACL runtime, theorem prover, full evidence ontology, or nanopublication packaging until an actual integration or independent publication use case exists. When export begins, all reserved HTTP identifiers must resolve and the generated graph must pass its SHACL shapes before publication.

A focused [Model review](model-review.md) now records whole-file fingerprints and AI-assisted or human semantic findings outside canonical content. The npm test and build commands require the review to cover the current Model, arguments, and governing policy. These records introduce no public route, semantic identifier, or canonical content-schema change; they track review coverage, not truth, validity, soundness, or evidential sufficiency.

Field-level semantic fingerprints, incremental downstream invalidation, a hosted AI review runner, and a broader publication policy remain deferred. Their intended semantics, propagation rules, and implementation stages are defined in the [reasoning review and invalidation plan](review-invalidation-plan.md).

Interactive visualization is a separate, also-deferred concern. It will use a renderer-neutral
read model derived directly from the validated Markdown collections; it does not require linked
data, a graph database, or new semantic identifiers. See the [visualization
plan](visualization-plan.md). A future visualization package must not become a second source of
graph meaning or introduce renderer-specific state into canonical content.
