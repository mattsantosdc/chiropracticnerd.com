# Argument model

Structured arguments are the Model's explicit reasoning layer. They record a specified inferential route from one or more specified statements to exactly one statement serving as the conclusion. They do not replace statements, revision dependencies, or evidence.

## Four distinct relationships

### Dependency

> If this upstream claim changes materially, the downstream statement must be reconsidered.

Dependencies form the existing acyclic revision-impact graph. A dependency role explains why revision propagates; it does not say that one claim supports, proves, causes, or entails another. Never infer an argument from an `upstream` edge.

### Argument

> These premises provide a specified inferential route to this conclusion.

Arguments live in `src/content/model/arguments/`. They may have multiple premises, and multiple competing arguments may conclude the same statement. The same statement may be the conclusion of one argument and a premise in another. Argument structure may therefore be hierarchical or cyclic without changing the validity of the separate dependency DAG.

### Evidence

> These observations, studies, or other sources change our justification for accepting an empirical claim.

Evidence affects confidence in empirical premises. It does not repair an invalid inference, and a valid inference does not strengthen its evidence. In v0.1, source-level evidence remains in statement prose and `references`; a separate evidence ontology is not warranted.

### Causal hypothesis

> A change in X is proposed to produce a change in Y.

A causal hypothesis is an empirical claim requiring suitable evidence and alternatives. It is neither a revision-dependency arrow nor automatically a deductive inference. An argument may use a causal hypothesis as a premise without changing what kind of claim it is.

## Argument record contract

Each Markdown record contains:

- a permanent `ARG-###` `id` that is independent of its mutable route `slug`;
- a title and short summary;
- one or more unique premise statement IDs;
- exactly one conclusion statement ID, which cannot also be a premise;
- an `inferenceKind` of `deductive` or `defeasible`;
- a named reasoning `scheme`;
- version and updated date; and
- prose explaining the inference, assumptions, uncertainty, and important limits.

The conclusion stays classified by its actual statement type. Do not add a `logical` statement type. Do not add a `sound` Boolean: empirical premise truth is often unresolved and must be inspected through the premise statements' confidence, evidence, and revision conditions.

Inclusion in a version identifies an argument as part of the Model's current working reasoning. Arguments have no editorial `status` property. Adoption neither establishes premise truth nor settles the evaluation of the inference; a working argument can remain defeasible while its empirical premises have unresolved confidence.

Mark an argument `deductive` only when the conclusion necessarily follows from the premises exactly as written. Natural-language validity is an editor-curated intellectual assertion; the software validates structure and references, not the theorem itself. Use `defeasible` when the route is inductive, abductive, causal, mechanistic, normative, or practical and may be defeated without a formal contradiction.

An argument's failure shows that this route to the conclusion fails. It does not by itself show that the conclusion is false. Look for an alternative route, a premise that needs narrowing or replacement, or a conclusion whose scope must change.

## Authoring and validation

Before adding an argument:

1. Write the premises and conclusion exactly as their statements state them.
2. Identify modal terms, quantifiers, populations, conditions, outcomes, and timescales.
3. Name the reasoning scheme and decide whether it is genuinely deductive or defeasible.
4. Expose required bridge premises. Do not invent a premise merely to make a desired conclusion follow.
5. Explain what the inference does and does not establish.
6. Add or revise dependency metadata only if a distinct revision dependency also exists.

Build-time validation rejects malformed or duplicate argument IDs and slugs, missing statement references, no premises, duplicate premises, a conclusion reused as its own premise, and unknown inference kinds. Argument cycles do not enter dependency cycle detection.

Every change also receives the [Model review](model-review.md), including a check that arguments use each premise's actual commitment rather than weakening it to match unresolved confidence. The npm test and build commands require a fresh recorded review. This checks review coverage; natural-language validity remains an editorial judgment.

## Common reasoning failures

- **Hidden premise:** a necessary bridge is used without being stated and independently evaluated.
- **Confidence substituted for content:** an asserted effect is paraphrased as a possibility or intention solely because evidence is unresolved, or a capacity or action condition is removed merely to sound more certain.
- **Circular definition:** the definition assumes the conclusion or makes a finding true by how the terms are chosen.
- **Scope mismatch:** populations, contexts, interventions, outcomes, or timescales differ across premises.
- **Non-overlapping possibility:** two claims using `can` do not form a deductive chain when the cases or conditions in which each is true need not overlap.
- **Association treated as mechanism:** co-variation is presented as an explanation of how one thing produces another.
- **Mechanism treated as outcome proof:** evidence that a process can occur is treated as proof of a meaningful or durable result.
- **Definition treated as existence evidence:** defining a phenomenon is treated as evidence that it occurs or can be measured.
- **One failed mechanism treated as impossibility:** failure of a proposed mechanism is treated as proof that a higher-order effect cannot occur by another route.
- **Absence of evidence treated as evidence of absence:** a null or missing result is treated as disproof without asking whether the method could have detected the specified effect.

## Future visualization

A future renderer will represent an argument as its own node, with each premise pointing to the
argument and the argument pointing to its conclusion. It must not flatten a multi-premise argument
into independent premise-to-conclusion edges or merge inferential edges with dependencies. See the
[visualization plan](visualization-plan.md) for the complete projection and staged reader
experience.

See [model-authoring.md](model-authoring.md) for the complete change workflow and [dependency-model.md](dependency-model.md) for the revision-impact contract.
