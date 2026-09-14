# Reasoning review and invalidation plan

The current whole-Model review remains mandatory. Incremental review is deferred. The [ASPIC+ foundation](aspic-foundation.md) changes the requirements for any future incremental system: supporting arguments, attacks, defenses, rule identity, profile settings and semantic uses can all affect a result.

## Distinguish review freshness from evaluation

A fingerprint establishes which exact inputs a review or computation used. It establishes neither truth nor the quality of the review. Keep statement meaning, evidential confidence, working adoption, formal premise membership, argument status and review freshness separate.

The current gate records whole-file fingerprints and specific semantic findings for every working statement and argument. Critical-question data, formal bindings, engine policy and implementation are now explicit inputs too. Review critical questions alongside their target records. Any change in this input set requires a renewed review under [model-review.md](model-review.md).

## Derived impact, explicit semantic uses

The final system should derive inferential use from canonical applications rather than maintain a second authored list. Preserve non-inferential relationships such as use of a definition when the formal representation does not recover them. The [migration assessment](aspic-migration.md) records every existing relationship and its proposed disposition; it must be resolved before the legacy fields are retired.

Maintain separate, typed indexes for:

- premises used by inference applications and conclusions supplied by those applications;
- propositions contrary to other propositions;
- propositions that undercut named defeasible rules;
- derived arguments containing a challenged premise or application;
- semantic uses of definitions, scope vocabulary and authoring methods;
- explicit premise membership, rule sets, priorities and evaluation-profile choices; and
- source and proposition versions used by a recorded review or result.

Do not infer a relationship from a reading sequence, shared terminology, an unreviewed prose interpretation or a public comment. An editorial critical question is not automatically an attack; a formal attacker requires an admitted proposition and supporting argument.

## Recompute before optimizing

Reevaluate the complete declared theory after an input changes. Grounded acceptance is nonmonotonic: removing an attacker can reinstate another argument without changing either argument's wording. A change can propagate through defenses and alternative derivations as well as through premise-to-conclusion paths.

An unchanged intermediate statement therefore does not justify stopping computational propagation. Editorial review of that statement's wording may remain applicable after inspection, while its evaluated status and the status of arguments that depend on it still require recomputation. Keep those decisions separate.

`reasoning/engine.py` includes a conservative impact helper for inference and conflict relationships. It is a review aid, not a complete incremental evaluation algorithm, and it does not include the legacy semantic relationships by itself. No current command uses it to skip whole-theory evaluation or the whole-Model review.

## Future incremental acceptance criteria

Before introducing a blocking incremental system:

1. Specify exactly which changes affect proposition meaning, confidence, inference structure, formal role, source identity and presentation. Use versioned canonical serialization and immutable, nonrecursive fingerprints.
2. Treat profiles, rule definitions and formal bindings as first-class inputs. A changed ordering or contrary mapping can change results without any English text changing.
3. Identify affected argument structures and the complete attack/defense region needed by the selected semantics. Account for argument creation and deletion, not only changed existing nodes.
4. Establish that a query slice or incremental computation preserves the selected full-theory result. Test additions, withdrawals, alternative support, undercutters, reinstatement and attack cycles against complete evaluation.
5. Keep unsupported inputs, timeouts and incomplete results explicit. A traversal limit cannot certify acceptance or absence of support.
6. Separate editorial reconsideration from computed status. A failed argument does not establish that its conclusion is false; another argument may support it.
7. Preserve a periodic whole-Model examination for missing relationships. An index cannot discover an omitted premise or objection by itself.

## Review records and governance

Store review findings outside the material they fingerprint. Identify the reviewer, the applicable rubric, the exact inputs, the finding and its rationale. AI review uses the same contract as human review; a hash refresh is never a substitute for reconsideration.

A future review interface may distinguish a definitely stale input from a potentially affected record awaiting assessment. Such labels are derived review information. They must not become author-editable scientific confidence or formal acceptance labels.

The existing CI workflow runs the current complete checks. It does not deploy, merge or certify empirical support. Any later publication or incremental policy must preserve the branch workflow and the user's authorization requirements in `AGENTS.md`.
