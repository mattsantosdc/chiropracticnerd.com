# Dependency model

The Model records **direct revision dependencies between entries**. It does not attempt to encode every meaningful relationship between their subject matter.

An edge is stored on the downstream entry and is displayed as:

> upstream → downstream

An edge qualifies for the dependency graph only when materially changing or removing the upstream entry would require the downstream claim, strategy, or intended meaning to be reconsidered. Mere topical similarity, a useful comparison, or repeated vocabulary is not enough.

## Authoring rules

1. Record only direct dependencies. Do not repeat an ancestor merely because its influence can be traced through an intermediate entry.
2. Classify the role the upstream entry plays, not the domain or claim type of either endpoint.
3. Use one dependency per pair. Choose the primary reason the downstream entry depends on the upstream entry and explain any secondary consideration in the note.
4. Give every dependency a note naming the exact dependency and its important limit. The note is required metadata.
5. Do not carry a role across a path. Two conceptual dependencies, for example, do not establish a direct conceptual dependency between the first and third entries.
6. Treat every dependency as defeasible. It identifies what must be reconsidered; it does not say that either entry is true or well supported.
7. Use `related` only as an untyped, undirected see-also link when no dependency is asserted. Store it on either endpoint, not both. It carries no inferential, causal, evidential, temporal, or provenance meaning.

## Choosing a role

Ask why revision upstream would force reconsideration downstream:

| Role | Use when the upstream entry… | Do not read it as… |
| --- | --- | --- |
| `methodological` | sets a rule for framing, classifying, evaluating, or revising the downstream entry | support for the subject-matter claim |
| `normative` | supplies a value, purpose, or priority that justifies a downstream choice | deduction or empirical verification |
| `conceptual` | supplies a concept or definition required for the downstream entry's intended meaning | evidence that the concept exists or is empirically adequate |
| `empirical` | supplies a testable premise, observed relationship, or proposed mechanism needed by the downstream entry's empirical content | a report of evidential strength or proof |
| `practical` | is translated by the downstream entry into a decision, procedure, or action | evidence of effectiveness, safety, or appropriateness |

These five roles form the complete vocabulary for the current dependency view. They are local Chiropractic Nerd terms, not asserted equivalents of properties from another ontology.

## Reasoning is a separate layer

A dependency is not an argument. A genuine deduction or other structured justification may require several premises, may be only defeasibly valid, may have competing justifications, and may be challenged without rejecting its premises or conclusion.

The first occurrence of any of the following blocks further use of pairwise dependency metadata for that reasoning and triggers the argument layer described in the [standards contract](standards-contract.md):

- multiple claims presented as jointly supporting one conclusion within a single inference;
- multiple independent justifications for one conclusion;
- an objection aimed at the reasoning rather than only at a claim; or
- a deductive or analytic conclusion.

Until that trigger occurs, reasoning remains explicit in entry prose but is not given a misleading dependency role.

## Current graph audit

The v0.1 graph contains 15 direct dependencies. Every edge has one of the five roles and a required limiting note. `related` links are kept outside the acyclic dependency graph and are rendered from both endpoints.
