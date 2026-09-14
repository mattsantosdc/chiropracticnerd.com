# Standards contract

This contract reserves stable identifiers and defines the relationship between canonical content and established interchange standards. The [ASPIC+ foundation](aspic-foundation.md) now implements an executable pilot and an experimental AIF JSON application profile. No RDF, JSON-LD, or nanopublication is emitted yet, so the reserved identifiers are not presented as currently dereferenceable resources.

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
domain, or inferential meaning. Catalogs use `domain` and `order`; the editorial reading path
uses explicit section/step order. IDs must not determine statement sorting or graph layout. The [Stage 1 migration map](statements-stage-1-migration.md) records the explicitly authorized
prepublication exception and the earlier domain-ID migration; old IDs are not accepted aliases.

Statement and argument IDs are permanent identities; URL slugs are mutable presentation routes and must not be used as semantic identifiers. The `/model/arguments/` namespace is reserved for argument presentation, so statement slugs cannot be `arguments` or begin with `arguments/`.

## Active Markdown architecture

The Model is the complete account, built from statements and arguments. Statements in
`src/content/model/statements/` express propositions, definitions, values, framework commitments,
and strategies. The `statements` and `arguments` Astro collections load only their respective
canonical sibling directories; no collection loads the shared parent. Direct `upstream` metadata remains the legacy revision-impact graph during the explicitly tracked [migration](aspic-migration.md). Its removal must preserve non-inferential semantic uses and the information in its limiting notes.

Argument records in `src/content/model/arguments/` are now the canonical structured reasoning layer. Each contains one or more statement premises, one statement conclusion, an inference kind, a named scheme, version and updated date, and explanatory prose. Arguments do not create a `logical` statement type and do not use a Boolean soundness field. Multiple arguments may conclude the same statement, and a statement may be both a conclusion and a premise across the hierarchy.

Inclusion in a version identifies statements and arguments as the Model's working account. Neither collection uses an editorial `status` property. Adoption remains separate from evidential confidence and inferential evaluation; it is not a claim of truth or validity.

The [Argument Interchange Format](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf) now supplies the graph structure for the pilot's experimental JSON interchange. Required project extensions preserve the ASPIC+ theory and evaluation profile. The importer rejects disagreement or loss between those layers. This is not a general AIF importer or a public RDF/JSON-LD export. ASPIC+ supplies the formal argumentation framework; AIF supplies interchange. Natural-language fidelity remains an editor-curated judgment.

Public comments are discussion, not graph assertions. Working statements and inference applications remain canonical Markdown. `src/data/model-questions.json` now contains separately identified critical questions under the [objection contract](objection-authoring.md). Recording a question does not assert its proposed alternative or create a formal attacker. The runtime supports explicit alternative and hypothetical roles; substantive opposition requires its own declared propositions, premise membership and support before evaluation.

## Editorial reading architecture

The [reading path](model-reading-path.md) is a strict JSON configuration separate
from both canonical collections. Local section identifiers and derived appearance
anchors are presentation locations, not additional public semantic identifiers.
Reading adjacency supplies no inferential or revision relationship. The shared
reasoning index resolves every argument's joint ordered premises and conclusion
from the complete collections, preserving competing routes and cycles. Coverage
requires an intentional introduction for each statement and placement for each
argument across main, optional orientation, and supporting reading; it does not
rank adoption or confidence. The existing domain/order catalog remains independent.

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

The authorized ASPIC+ pilot now uses Z3 to check formal strict inferences and provides experimental AIF interchange. An RDF store, SPARQL endpoint, public JSON-LD export, SHACL runtime, full evidence ontology and nanopublication packaging remain deferred until a concrete integration requires them. Before a public RDF/JSON-LD export begins, all reserved HTTP identifiers it emits must resolve and its generated graph must pass the declared SHACL shapes. The isolated AIF pilot does not publish those reserved identifiers.

A focused [Model review](model-review.md) now records whole-file fingerprints and AI-assisted or human semantic findings outside canonical content. The npm test and build commands require the review to cover the current Model, arguments, and governing policy. These records introduce no public route, semantic identifier, or canonical content-schema change; they track review coverage, not truth, validity, soundness, or evidential sufficiency.

Field-level semantic fingerprints, incremental downstream invalidation, a hosted AI review runner, and a broader publication policy remain deferred. Their intended semantics, propagation rules, and implementation stages are defined in the [reasoning review and invalidation plan](review-invalidation-plan.md).

Interactive visualization is a separate, also-deferred concern. It will use a renderer-neutral
read model derived directly from the validated Markdown collections; it does not require linked
data, a graph database, or new semantic identifiers. See the [visualization
plan](visualization-plan.md). A future visualization package must not become a second source of
graph meaning or introduce renderer-specific state into canonical content.
