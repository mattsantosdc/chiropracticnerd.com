# Review impact and invalidation contract

Impact-based semantic review is implemented in `scripts/model-review-impact.mjs` and enforced by `scripts/model-audit.mjs`. Full-theory evaluation remains mandatory. The impact graph proposes editorial reconsideration; it does not determine truth, confidence, adoption or ASPIC+ acceptance.

## Two independent kinds of freshness

A review records the sources and relationships its reviewer examined. An evaluation records the complete theory and profile it computed. Changing an attacker can reinstate an argument whose text has not changed, so an unchanged intermediate statement is never a reason to stop formal reevaluation.

Every ordinary Model change still runs all automated reasoning, integrity, build and route checks. Only semantic reconsideration is scoped. Incremental formal evaluation, query slicing and hosted AI review remain deferred.

## Canonical inputs and derived relationships

The snapshot uses stable statement/application IDs and typed directed edges. No new authored upstream or downstream list is introduced. Inferential edges come from canonical applications and their explicit formal bindings. During an incomplete edit, both sets of endpoints remain visible; the independent reasoning loader rejects binding drift before completion. Existing `upstream` records supply their explicit semantic-use roles and notes until their authorized migration is complete. Retired migration entries are history, never active edges.

The graph includes:

- premise-to-application and application-to-conclusion links, preserving each application and all joint premises;
- conclusion-to-application review links, so changing a conclusion also prompts reconsideration of every argument for it, including alternatives;
- each declared proposition's explicit classical-negation counterpart under the fixed profile;
- strict transposition paths under that profile, without adding defeasible contraposition;
- directed undercutter-to-rule links when supplied to the supported theory adapter; and
- explicit semantic uses from the current legacy dependency records.

Contradiction and undercut paths can reach defenders, attacks on those defenders, and their downstream uses. Cycles terminate by visited identity. These are conservative influence paths, not claims that attacks succeed. Joint-premise edges do not assert that any individual premise is sufficient.

The canonical binding loader currently admits no authored opposing corpus and returns an empty undercutter list. The review adapter mirrors that exact supported schema. Synthetic tests exercise directed undercuts, defense cycles and strict transpositions. New binding capabilities, contrary policies or authored opposition require updating both loaders and their tests; unknown top-level binding fields fail rather than being ignored. An editorial critical question is never automatically a formal attacker.

## Input units and scope

| Input | Review scope |
| --- | --- |
| Proposition, summary, title, body, evidence, qualifiers, references, or semantic relationship data | Its record, then its influence closure |
| Date/version or formatting-only frontmatter change | Exact local record; no inference propagation |
| Slug, order, title or related-link presentation | The record and directly affected participation/link context |
| Formal statement binding or explicit premise membership | That statement and its influence closure |
| Formal application binding or canonical argument | That application, participants as reader context, and its influence closure |
| Critical question | Its previous and current target records only |
| Reading section text, steps, placement or adjacent-section identity | The section's displayed statements/applications and explicit argument participants, using previous and current placement |
| Dependency migration entry | Its surviving source/target records as historical review context; no active dependency inferred |
| Shared contracts, schema, engine/profile/signature, helpers or renderer | All canonical records |
| Registered input without a specific adapter | All canonical records |

Whole-file fingerprints still account for every exact source after newline normalization. Parsed field units narrow propagation where meaning can be separated mechanically. The adapter does not infer semantic equivalence from wording. Markdown body changes, including body whitespace, conservatively propagate. JSON key reordering or whitespace can require inspecting the changed file without invalidating any canonical finding. Unrelated application/article files do not affect this review.

## Previous and current graphs

The saved snapshot preserves previous subject identities, input-unit fingerprints and typed edges. `--plan` compares it with the current snapshot, seeds changed/added/removed units and relationships, then walks the union of both graphs. It reports explanatory routes and labels each edge as previous, current or both. Deleting a dependency or argument therefore cannot erase its former impact from the plan. Retargeting checks both former and new participants. Removed record paths remain explicit cleanup items.

## Per-record bases and provenance

Each record has its own `basis`, timestamp and reviewer. Its basis hashes a versioned canonical serialization of its identity/path, relevant units and relevant typed edges. Propagating units are included when their targets lie in the record's reverse influence closure. Local units are included only at their specified targets. Global units appear in every basis. These are flat source identities, not recursively nested argument/review hashes.

The checker independently recomputes every expected basis. Updating the root input map and snapshot cannot make an old affected basis current. Unaffected findings, their timestamp and reviewer remain verbatim. A fresh input hash is not a claim that someone performed a review; only the reviewer records an attestation after examining the content.

The review envelope and workflow are defined in [model-review.md](model-review.md). Schema-1 history is preserved during the explicit baseline migration. Review metadata and generated inspection output remain outside canonical propositions and outside their own fingerprint inputs.

## Whole-model examinations

Shared changes invalidate all bases. A whole-model examination is also required before a Model-version release, after a broad restructuring or discovered missing relationship, and at least every 90 days. The checker enforces the interval when invoked and exposes `--full` for an explicitly requested full plan. A completed whole-model attestation records its own exact input set; an incremental transaction never refreshes that date merely to clear the periodic gate.

A whole-model examination looks for missing premises, objections and semantic uses that no existing index can discover. The reviewer can also expand a local review when the diff reveals an omitted relationship, and should record the missing relationship explicitly before relying on future scope calculations.

## Validation boundaries

Tests cover joint-premise support, alternative arguments, conclusion edits, additions, deletions, retargeting, semantic dependencies, negative literals, directed undercut/defense cycles, strict transposition, local questions/reading changes, global policy changes, periodic reviews, preserved provenance and stale-basis rejection after a superficial snapshot refresh. A cross-runtime conformance test checks that changed statuses from complete ASPIC+ evaluations fall within the review graph's impact after withdrawals, rebuttal, alternative support and defense changes. Complete evaluation itself is unchanged.

The planner is conservative rather than minimal. A broad shared-policy change may still require all records. It does not prove English fidelity, evidential support or completeness of the relationship corpus. It neither authorizes a merge nor prepares a PR. Finish the remaining relationship decisions in the migration assessment before PR preparation; the user will review and merge manually.
