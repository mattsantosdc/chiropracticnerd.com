# Standards contract

This contract reserves stable identifiers and defines the relationship between canonical content and established interchange standards. The [ASPIC+ foundation](aspic-foundation.md) now implements an executable pilot and an experimental AIF JSON application profile. No RDF, JSON-LD, or nanopublication is emitted yet, so the reserved identifiers are not presented as currently dereferenceable resources.

## Stable identifiers

Public routes may change; semantic identifiers may not. The reserved patterns are:

| Resource | Identifier pattern |
| --- | --- |
| Statement | `https://chiropracticnerd.com/id/statement/{STATEMENT-ID}` |
| Semantic-use relationship (reserved legacy URI) | `https://chiropracticnerd.com/id/dependency/{UPSTREAM-ID}--{DOWNSTREAM-ID}` |
| Argument | `https://chiropracticnerd.com/id/argument/{ARGUMENT-ID}` |
| Semantic-use role (reserved legacy URI) | `https://chiropracticnerd.com/vocab/dependency-role/{ROLE}` |

Statement IDs use `S-###` (three decimal digits), unique across all domains. Argument IDs use `ARG-###`.
Statement IDs are permanent identifiers only: their numeric values carry no ordering, hierarchy,
domain, or inferential meaning. Catalogs use `domain` and `order`; the editorial reading path
uses explicit section/step order. IDs must not determine statement sorting or graph layout. The [Stage 1 migration map](statements-stage-1-migration.md) records the explicitly authorized
prepublication exception and the earlier domain-ID migration; old IDs are not accepted aliases.

Statement and argument IDs are permanent identities; URL slugs are mutable presentation routes and must not be used as semantic identifiers. The `/model/arguments/` and `/model/answers/` namespaces are reserved for argument and answer presentation. Statement slugs cannot equal either reserved name or begin with either prefix. Answer routes and local navigation-question IDs create no new semantic identities.

## Active Markdown architecture

The Model is the complete account, built from statements and arguments. Statements in
`src/content/model/statements/` express propositions, definitions, values, framework commitments,
and strategies. The `statements` and `arguments` Astro collections load only their respective
canonical sibling directories; no collection loads the shared parent. Arguments are the sole authored inference applications. Additional noninferential references use `semanticUses: [{ id, role, note }]`; the retired `upstream` and `downstream` fields are rejected. The completed [migration](aspic-migration.md) preserves retained limiting notes and historical dispositions. Retained semantic uses keep their already reserved dependency URI and role URI patterns; retirement never permits identity reuse. The namespace spelling is not an authored field or a claim of inference.

Argument records in `src/content/model/arguments/` are now the canonical structured reasoning layer. Each contains one or more statement premises, one statement conclusion, an inference kind, a named scheme, version and updated date, and explanatory prose. Arguments do not create a `logical` statement type and do not use a Boolean soundness field. Multiple arguments may conclude the same statement, and a statement may be both a conclusion and a premise across the hierarchy.

Inclusion in a version identifies statements and arguments as the Model's working account. Neither collection uses an editorial `status` property. Adoption remains separate from evidential confidence and inferential evaluation; it is not a claim of truth or validity.

The [Argument Interchange Format](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf) now supplies the graph structure for the pilot's experimental JSON interchange. Required project extensions preserve the ASPIC+ theory and evaluation profile. The importer rejects disagreement or loss between those layers. This is not a general AIF importer or a public RDF/JSON-LD export. ASPIC+ supplies the formal argumentation framework; AIF supplies interchange. Natural-language fidelity remains an editor-curated judgment.

Public comments are discussion, not graph assertions. Working statements and inference applications remain canonical Markdown. `src/data/model-questions.json` now contains separately identified critical questions under the [objection contract](objection-authoring.md). Recording a question does not assert its proposed alternative or create a formal attacker. The runtime supports explicit alternative and hypothetical roles; substantive opposition requires its own declared propositions, premise membership and support before evaluation. Eight versioned scenarios in `reasoning/opposition-scenarios.json` make their hypothetical removals, additions and undercuts explicit. They are validated and evaluated as full-theory copies and never silently change the working account.

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
| Semantic-use relationship (reserved legacy URI) | A qualified local relationship records the referenced and using statement, role and limiting note; use an external predicate only after checking that this specific reference matches it |
| Semantic-use role (reserved legacy URI) | One of the five local role identifiers; no external equivalence is asserted |
| See-also link | Symmetric `dcterms:relation` statements |
| Concepts and terminology | [SKOS](https://www.w3.org/TR/skos-reference/) only after concepts are separated from the statements that define or discuss them |
| Structured reasoning | A claim/scheme-node representation compatible with AIF |
| Authorship, revision, and derivation | [PROV-O](https://www.w3.org/TR/prov-o/) |
| Citation intent | [CiTO](https://sparontologies.github.io/cito/current/cito.html) |
| Evidence method | [ECO](https://evidenceontology.org/) only when an exact biomedical evidence term applies |
| Export constraints | [SHACL](https://www.w3.org/TR/shacl/) shapes generated and tested alongside the export |

The former blanket `dcterms:requires` mapping is deferred. A semantic use can guide interpretation or a mechanism-dependent choice without being logically necessary for the claim. An exporter must preserve that distinction and the qualified note rather than imply necessity for every reference. No public export changes in this migration.

SKOS's direct-versus-transitive distinction informs the direct-edge rule, but statements are not automatically `skos:Concept` resources. CiTO describes why a publication is cited, not why one statement depends on another. PROV-O describes lineage, not argumentative support. These boundaries prevent convenient but false ontology mappings.

The shared revision graph permits cycles and derives finite reachability. It does not dictate productive inference topology or acceptance; the formal profile validates and evaluates those separately.

## Deferred work

The authorized ASPIC+ pilot now uses Z3 to check formal strict inferences and provides experimental AIF interchange. An RDF store, SPARQL endpoint, public JSON-LD export, SHACL runtime, full evidence ontology and nanopublication packaging remain deferred until a concrete integration requires them. Before a public RDF/JSON-LD export begins, all reserved HTTP identifiers it emits must resolve and its generated graph must pass the declared SHACL shapes. The isolated AIF pilot does not publish those reserved identifiers.

The [Model review](model-review.md) records whole-file fingerprints, scoped per-record bases and AI-assisted or human semantic findings outside canonical content. The npm test and build commands require the review to cover the current Model, arguments, and governing policy. These records introduce no public route, semantic identifier, or canonical content-schema change; they track review coverage, not truth, validity, soundness, or evidential sufficiency.

The [review impact contract](review-invalidation-plan.md) implements conservative field-level scoping, previous/current graph propagation and per-record provenance. Full-theory evaluation continues after every Model change. Incremental formal evaluation, a hosted AI review runner and a broader publication policy remain deferred.

Interactive visualization is a separate, also-deferred concern. It will use a renderer-neutral
read model derived directly from the validated Markdown collections; it does not require linked
data, a graph database, or new semantic identifiers. See the [visualization
plan](visualization-plan.md). A future visualization package must not become a second source of
graph meaning or introduce renderer-specific state into canonical content.

The [answer views](model-answer-views.md) derive question-specific authored ancestry from the complete canonical index. Ordinary-premise membership comes from the working bindings, not topology or a confidence label. The display does not compute acceptance or omit opponents from formal evaluation.
