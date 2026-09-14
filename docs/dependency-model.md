# Revision relationships and semantic uses

Revision impact is derived from the Model's arguments, contrary relationships, strict-rule transpositions and explicit semantic uses. There is no authored `upstream` or `downstream` field. Both retired names are rejected by the canonical schema, including when a valid replacement field is also present.

## What remains authored

A statement's `semanticUses` is an array of `{ id, role, note }` references. Each reference identifies a specific use of another statement's meaning, evaluative criterion, methodological rule or proposed mechanism that argument participation cannot recover. The note explains what revision would affect and what the reference does not establish. Empty arrays are valid.

The five local roles remain `methodological`, `normative`, `conceptual`, `empirical` and `practical`. They classify the use, not the statement, its confidence or an ASPIC+ inference. An empirical-role reference does not automatically admit a starting premise. A normative reference does not replace an argument justifying a choice. These role names are project vocabulary, not claimed standard ontology equivalences.

An argument stores its ordered joint premises and conclusion once. Do not copy that participation into `semanticUses` to express the same reason for revision. A genuinely distinct use between the same records would need its own explicit explanation and semantic review. See-also `related` references remain undirected and carry no inference or revision influence.

References must resolve, have a known role and a nonblank note, and cannot be self-references or duplicates on one statement. Unknown nested fields are rejected. Reciprocal semantic uses are allowed: mutually dependent terminology is not automatically a circular proof. Traversal terminates by identity. Productive inference cycles remain separately unsupported by the pinned ASPIC+ profile.

## Deriving impact

`src/lib/revision-graph.mjs` is the renderer-neutral source for the public and review graph. It keeps premise-to-rule and rule-to-conclusion edges distinct, preserving joint premise membership without claiming that one premise suffices. It adds:

- conclusion-use links so a revised conclusion brings its recorded arguments back into review;
- both directions of explicit contradiction;
- the conservative influence of strict transpositions, including changed rule identities;
- directed undercuts supplied by an evaluated theory, which also permit tracing attacks on attackers and reinstatement;
- referenced-statement to using-statement links for explicit semantic uses.

`revisionReach` returns finite review candidates, not accepted arguments or changed truth values. `scripts/model-review-impact.mjs` uses this graph and the union of previous and current relationships for review invalidation. `reasoning.engine.impact` implements the same formal influence rules; cross-runtime tests compare their reach for every working statement. The Python theory has no semantic-use evidence or assumptions because those references do not participate in inference.

The public detail page shows argument participation, additional references, and a derived list of statements to reconsider. The current working theory has no admitted formal undercutters. Separately labeled opposition scenarios supply their own explicit hypothetical assumptions and undercuts, and are evaluated in full. They never become working-theory edges merely by being displayed or recorded. A reading path does not filter an evaluation.

## Completed migration

The source inventory contains 38 original relationships with immutable source commit, identities, roles and limiting notes in `reasoning/dependency-migration.json`. The substantive decisions retired five of those records and retained five later semantic uses. This schema migration removes the remaining 14 inferential duplicates. The current Model has 32 statements, ten arguments and 24 explicit semantic uses: 19 retained original uses and five introduced after the source snapshot.

Every original `derive-from-existing-application` entry now obtains its inferential impact from that named argument. Its limiting note survives in the historical inventory; the associated canonical argument and statement explanations retain the substantive scope and evidential boundaries. The other historical dispositions remain unchanged. The migration record is history, not an alternative graph source.

S-028 to S-015 illustrates why additional uses remain: the perturbation mechanism informs intended delivery and prediction even when an independent effect route preserves support for the application strategy. S-032 to S-015 illustrates the argument route: its normative contribution is already explicit in ARG-010 and has no duplicate semantic-use entry.

## Boundaries

The graph cannot discover an omitted relationship or settle whether a reference is semantically adequate. Whole-model reviews inspect for those gaps. Computation must still examine all admitted arguments and opposition under the declared profile. Impact tracking scopes editorial review; it neither narrows formal evaluation nor certifies empirical truth.
