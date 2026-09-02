# Relationship model

The Model uses a deliberately narrow relationship vocabulary. It classifies **direct dependencies between entries**, not every meaningful connection between their subject matter.

An edge is stored on the downstream entry and reads:

> upstream → downstream

The edge qualifies for the dependency graph only when materially changing or removing the upstream entry would require the downstream claim, strategy, or intended meaning to be reconsidered. Mere topical similarity, a useful comparison, or repeated vocabulary is not enough.

## Authoring rules

1. Record only direct dependencies. Do not repeat an ancestor merely because its influence can be traced through an intermediate entry.
2. Classify the role the upstream entry plays, not the domain or claim type of either endpoint.
3. Use one edge per pair. When an upstream entry could play several roles, choose the primary reason the downstream entry depends on it and make any secondary role explicit in the note.
4. Give every edge a note that names the exact dependency and its important limit. The note is required metadata, not optional commentary.
5. Do not infer the same relationship type through a path. For example, two conceptual edges do not by themselves establish a direct conceptual edge between the first and third entries.
6. Treat every non-logical relation as defeasible. A dependency says what would need reconsideration; it does not say that either claim is true or well supported.
7. Use `related` only as an untyped, undirected see-also link when no dependency is asserted. Store it on either endpoint, not both. It carries no inference, causal, or evidential meaning and is excluded from dependency-cycle validation.

## Choosing a type

Ask why revision of the upstream entry would force reconsideration downstream:

| Type | Use when the upstream entry… | Do not read it as… |
| --- | --- | --- |
| `methodological` | sets a rule for framing, classifying, evaluating, or revising the downstream entry | support for the subject-matter claim |
| `normative` | supplies a value, purpose, or priority that justifies a downstream choice | deduction or empirical verification |
| `conceptual` | supplies a concept or definition required for the downstream entry's intended meaning | evidence that the concept exists or is empirically adequate |
| `empirical` | supplies a testable premise, observed relationship, or proposed mechanism needed by the downstream entry's empirical content | a report of evidential strength or proof |
| `practical` | is translated by the downstream entry into a decision, procedure, or action | evidence of effectiveness, safety, or appropriateness |
| `logical` | is one stated premise in an explicit deductive or analytic inference | a claim that the premise is true |

For `logical`, every premise in the deduction must be listed as a logical upstream dependency. The downstream entry must also provide `inference.rule` and `inference.explanation` metadata naming the rule and showing how the complete premise set entails its conclusion. A pairwise edge in isolation does not claim entailment, and the build rejects logical edges without this explicit inference.

## Scope and rationale

The vocabulary is complete for the Model's present purpose: identifying whether a downstream entry depends primarily on a modeling rule, a value, a concept, an empirical proposition, a practical translation, or a valid inference. It is not intended as a universal ontology. Causal relations inside a claim, evidence sources, objections, temporal sequence, and feedback between iterations belong in claim content, references, revision conditions, or see-also links unless the Model later gives them a separate formal representation.

Two established modeling practices inform these constraints:

- The [W3C SKOS reference](https://www.w3.org/TR/skos-reference/#semantic-relations) distinguishes asserted direct links from transitive closure and treats associative `related` links separately from hierarchy. This Model likewise stores direct dependencies and does not silently carry an edge label across a path.
- The [Argument Interchange Format](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf) represents inference applications separately from their information nodes. This Model remains simpler, but preserves the critical distinction: entailment belongs to a premise set and inference rule, not to the visual presence of a single arrow.

These are design precedents, not claims that the Model implements SKOS, RDF, or AIF.
