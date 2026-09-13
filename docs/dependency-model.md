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

The v0.1 graph contains 28 statements and 38 direct dependencies, alongside seven structured arguments. Every dependency has one of the five roles and a required limiting note. `related` links and arguments remain outside the acyclic dependency graph. The historical [reasoning audit](model-v0.1-reasoning-audit.md), [Stage 2 integration](model-stage-2-integration.md), and [Stage 3 integration](model-stage-3-integration.md) record the decisions; the graph is not a linear proof of chiropractic effectiveness.

S-021 supplies the independently specified comparison of context-appropriate function. S-022 depends conceptually on that definition and supplies a normative dependency for S-005's professional aim. S-009, S-011, and S-012 now depend on S-021 for their empirical outcome meanings instead of treating S-005's aim as a definition of benefit.

S-023 depends on S-008's neuromotor domain, S-024 on S-023's input definition, and S-025 on S-024's response and S-021's improvement comparison. These are conceptual revision dependencies, not evidence that inputs, adjustments, or successes occur. S-011 depends on S-024 for the response whose causal occurrence it asserts. S-026 depends on S-025 and S-022 for its evaluative conclusion; S-027 depends on S-011 and S-022 for actual scoped benefit. Their deductive routes are separately represented in ARG-006 and ARG-007, including S-024's definition as a premise. No transitive dependency on S-024 is duplicated on those conclusions merely because it participates in their arguments.

S-028 holds the chiropractic perturbation mechanism, depending empirically on S-010's general mechanism and S-011's joint causal improvement claim. S-011 no longer depends on the perturbation account: a failed mechanism requires reconsidering the explanation without automatically rejecting an effect established by another route. S-015 translates S-028's proposed mechanism into intentional application. S-014 uses S-027's scoped benefit in prospective selection. S-016 additionally depends on S-025 for the meaning of success when interpreting findings; none of these dependencies validates a clinical method.

S-012 retains its empirical dependency on S-011 for the input-produced changes whose broader transfer it proposes. S-013 retains S-007 and S-011 for neural integration and the input/response account. The S-012/S-013 pair, stored only on S-013, is see-also: broader improvement and principal neural mediation do not establish one another.

S-020 retains conceptual dependencies on S-018 and S-008 and its see-also link to S-010. ARG-005 retains its six biological premises and defeasible S-004 rationale, without benefit or chiropractic premises. Its premise participation is not copied into S-004's dependencies. S-004's framework meaning remains independent of that particular rationale. ARG-004 adds S-022 as an explicit value premise; it does not need a duplicated transitive dependency on S-006, whose normative dependency remains on S-005.

## Future visualization

A future renderer will project each dependency as a directed `upstream → downstream` edge and
derive downstream adjacency rather than duplicating it in content. Visual layout must never cause
an author to add a dependency, and transitive paths must not be materialized as direct edges. See
the [visualization plan](visualization-plan.md) for the complete projection and implementation
guardrails.
