# Argument model

Structured arguments are the Model's explicit reasoning layer. The [ASPIC+ contract](aspic-foundation.md) fixes the executable pilot; [critical questions](objection-authoring.md) provide a separate reader-facing examination layer. They record a specified inferential route from one or more specified statements to exactly one statement serving as the conclusion. They do not replace statements, revision dependencies, or evidence.

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

Mark an argument `deductive` only when the conclusion necessarily follows from the premises exactly as written. Natural-language fidelity remains a reviewed intellectual judgment. The ASPIC+ pilot additionally checks the formal entailment of every strict rule; ARG-006, ARG-007 and ARG-009 have quantified representations. Current ARG records bind concrete inference applications, while complete ASPIC+ arguments are generated derivations. An opaque proposition or a deductive label alone does not establish a theorem. Use `defeasible` when the route is inductive, abductive, causal, mechanistic, normative, or practical and may be defeated without a formal contradiction.

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

Every change also receives the [Model review](model-review.md), including a check that arguments use each premise's actual commitment rather than weakening it to match unresolved confidence. The npm test and build commands require a fresh recorded review. This checks review coverage; natural-language fidelity remains an editorial judgment. The separate reasoning suite checks the formal profile and its declared bindings, including rule identity, strict proof, conflicts and incomplete computation. Run both checks.

## Professional-purpose application

ARG-008 uses S-027's actual scoped functional benefit and S-029's explicit professional-purpose principle to support S-005. The inference remains defeasible: a reason for an aim can be defeated by a relevant ethical or professional objection. Actual benefit and its value arrive through ARG-007, without assuming the aim as a starting premise. S-004, S-028, a further symptom outcome and comparisons with other professions are not premises of ARG-008. Do not add them merely to motivate the conclusion.

## Perturbation and effect projection

ARG-009 uses only S-028 to conclude S-011 deductively. S-028 preserves S-011's same input, reorganization, improvement, scope, context and interval and adds a perturbation mechanism conjunct. Removing that additional attribution entails the effect without discovering its cause. The empirical causal claim remains challengeable even though this projection is strict. Neither S-010's general capacity nor S-011's independently proposed effect entails S-028.

S-011 now has both an explicit ordinary-premise route and the ARG-009 route. These are disclosed separately in the statement and argument explanations and in the reading introduction. Additional routes do not count as independent corroborating evidence or confer voting strength. A withdrawn premise membership need not remove a derived argument; a negated effect also challenges S-028 through strict transposition. Tests distinguish route withdrawal, effect negation and an effect surviving a rejected mechanism.

## Common reasoning failures

For the broader-effects branch, S-030's general capacity and S-031's chiropractic-specific likelihood do not derive S-012's broader benefit. These remain explicit empirical premises. An argument may eventually use S-011 with independently testable bridges, but the bridge must establish the relevant neural change, its influence or shared-process contribution, and the qualifying broader outcome in overlapping cases. Calling an unsupported step defeasible does not supply its missing reason. The resolved S-011 to S-012 and S-011 to S-013 relationships retain semantic revision meaning, not inference applications. S-013 independently assumes that input-induced motor-related neural change is the predominant mediator of broader effects. Neither S-007's integration, S-011's local improvement nor S-030's capacity supplies that comparative causal claim. The initial sensory input, proposed mediator, and subsequent motor-dependent feedback must not be confused or counted as independent competing causes. Open pathway questions do not become premises without an explicit, independently defensible commitment.

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
