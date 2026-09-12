# Dependency model

The Model records **direct revision dependencies between statements**. It does not attempt to encode every meaningful relationship between their subject matter.

An edge is stored on the downstream statement and is displayed as:

> upstream → downstream

An edge qualifies for the dependency graph only when materially changing or removing the upstream statement would require the downstream claim, strategy, or intended meaning to be reconsidered. Mere topical similarity, a useful comparison, or repeated vocabulary is not enough.

## Authoring rules

1. Record only direct dependencies. Do not repeat an ancestor merely because its influence can be traced through an intermediate statement.
2. Classify the role the upstream statement plays, not the domain or statement type of either endpoint.
3. Use one dependency per pair. Choose the primary reason the downstream statement depends on the upstream statement and explain any secondary consideration in the note.
4. Give every dependency a note naming the exact dependency and its important limit. The note is required metadata.
5. Do not carry a role across a path. Two conceptual dependencies, for example, do not establish a direct conceptual dependency between the first and third statements.
6. Treat every dependency as defeasible. It identifies what must be reconsidered; it does not say that either statement is true or well supported.
7. Use `related` only as an untyped, undirected see-also link when no dependency is asserted. Store it on either endpoint, not both. It carries no inferential, causal, evidential, temporal, or provenance meaning.

## Choosing a role

Ask why revision upstream would force reconsideration downstream:

| Role | Use when the upstream statement… | Do not read it as… |
| --- | --- | --- |
| `methodological` | sets a rule for framing, classifying, evaluating, or revising the downstream statement | support for the subject-matter claim |
| `normative` | supplies a value, purpose, or priority that justifies a downstream choice | deduction or empirical verification |
| `conceptual` | supplies a concept or definition required for the downstream statement's intended meaning | evidence that the concept exists or is empirically adequate |
| `empirical` | supplies a testable premise, observed relationship, or proposed mechanism needed by the downstream statement's empirical content | a report of evidential strength or proof |
| `practical` | is translated by the downstream statement into a decision, procedure, or action | evidence of effectiveness, safety, or appropriateness |

These five roles form the complete vocabulary for the current dependency view. They are local Chiropractic Nerd terms, not asserted equivalents of properties from another ontology.

## Reasoning is a separate layer

A dependency is not an argument. A genuine deduction or other structured justification may require several premises, may be defeasible, may have competing justifications, and may be challenged without rejecting its premises or conclusion. Those routes now live in the separate Markdown argument collection described in the [argument model](argument-model.md).

Use an argument record—not another dependency role—when the Model includes:

- multiple claims presented as jointly supporting one conclusion within a single inference;
- multiple independent justifications for one conclusion;
- an objection aimed at the reasoning rather than only at a claim; or
- a deductive or analytic conclusion.

An inferential relationship does not automatically require a dependency edge, and a dependency does not automatically supply a premise. When both relationships exist, author and validate each independently.

## Current graph audit

The v0.1 graph contains 20 statements and 25 direct dependencies, alongside five structured arguments. Every dependency edge has one of the five roles and a required limiting note. `related` links and argument records remain outside the acyclic dependency graph. The historical [reasoning audit](model-v0.1-reasoning-audit.md) and [Stage 2 integration note](model-stage-2-integration.md) record the dependency decisions; the graph is not a linear philosophical proof of chiropractic effectiveness.

S-020 adds conceptual dependencies on S-018's estimates and S-008's neuromotor definitions. Its see-also link to S-010 distinguishes ordinary sensory updating from the specific perturbation hypothesis; neither supplies proof of the other. ARG-005 uses S-017, S-007, S-018, S-019, S-008, and S-020 to motivate S-004 without using downstream benefit commitments. That defeasible rationale is represented in the argument layer, not copied into dependencies: its failure reopens the rationale without necessarily changing S-004's independent framework meaning. The existing 23 dependency edges remain unchanged.

S-012 retains dependencies on S-005 and S-011 for its net-positive benefit criterion and chiropractic-produced neuromotor changes. S-013 holds the separate neural-mediation proposal, with dependencies on S-007 and S-011. The two hypotheses are connected only by a `related` pair stored on S-013; neither hypothesis supplies a revision dependency or inferential route to the other.

S-011 now directly proposes beneficial chiropractic effects through perturbation. Its S-005 dependency is conceptual: it supplies the net-positive benefit criterion, rather than justifying the intention to intervene. S-010 retains its empirical role for the proposed mechanism. The strengthened statement requires reconsidering S-012, S-013, S-014, S-015, and ARG-002 without establishing any of their additional claims.

## Future visualization

A future renderer will project each dependency as a directed `upstream → downstream` edge and
derive downstream adjacency rather than duplicating it in content. Visual layout must never cause
an author to add a dependency, and transitive paths must not be materialized as direct edges. See
the [visualization plan](visualization-plan.md) for the complete projection and implementation
guardrails.
