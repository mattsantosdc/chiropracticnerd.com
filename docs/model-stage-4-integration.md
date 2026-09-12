# Stage 4: explicit reading path and shared reasoning data

Implemented on `model-v0.1-statements-and-reasoning` from the clean reviewed Stage 3
commit `86fdd11ad3fef2f68de4bfbe40847dd1b3e95dbb`. The inventory remains 28 statements,
seven arguments, 38 direct revision dependencies, and two see-also pairs. No
canonical statement or argument file changed. IDs, slugs, text, metadata, premise
lists, conclusions, dependencies, evidence, and confidence are preserved.

## Implemented contract

The authored input is `src/data/model-reading-path.json`: version 0.1, an optional
orientation, seven main sections, and one supporting section. All suggested titles,
groupings, and ordered references were retained. The only introductions are the
optional guide's description and the supporting branch's description as additional
empirical questions. They orient reading without adding premises or downgrading
supporting content's adoption. The main route begins with living organisms and
does not depend on completing the orientation.

The [reading-path contract](model-reading-path.md) documents strict shape, complete
coverage, duplicate handling, primary-location precedence, diagnostics, and data
flow. `src/lib/reasoning.ts` builds the complete reasoning index from the canonical
collections using the existing validators. `src/lib/reading-path.ts` owns the strict
runtime schema, inferred TypeScript types, and resolution of editorial references.
No new collection, canonical field, graph renderer, recursive traversal, review
ontology, or public interface is introduced.

## Exact resolved sequence and inventory placement

In the table, an arrow after an argument denotes its **resolved canonical
conclusion**, not another authored configuration step. Commas indicate reading
order only. Every statement is introduced once, explicitly or as a conclusion;
all seven arguments are intentionally placed. Premise repetitions do not add
introductions or new canonical identities.

| Placement and local section ID | Reader-facing title | Resolved ordered steps |
| --- | --- | --- |
| Optional orientation: `examine-the-model` | How to examine the Model | S-001, S-002, ARG-001 → S-003 |
| Main 1: `living-organisms` | How do living organisms organize their function? | S-017, S-007, S-018, S-019, S-008, S-020 |
| Main 2: `functional-possibilities` | Why keep functional possibilities open? | ARG-005 → S-004 |
| Main 3: `improvement-and-purpose` | What counts as improvement, and why pursue it? | S-021, S-022, S-005, ARG-004 → S-006 |
| Main 4: `input-adjustment-success` | What are an input, an adjustment, and success? | S-009, S-023, S-024, S-025 |
| Main 5: `benefit-of-success` | Why would a successful adjustment be beneficial? | ARG-006 → S-026 |
| Main 6: `actual-input-effects` | What does the Model propose chiropractic inputs actually do? | S-010, S-011, S-028, ARG-007 → S-027 |
| Main 7: `practice` | How does the account guide practice? | ARG-002 → S-014, S-015, ARG-003 → S-016 |
| Supporting: `broader-effects` | Broader effects and their proposed mediation | S-012, S-013 |

All indexed arguments retain their canonical endpoints, in order:

| Argument | Joint ordered premises | Conclusion | Kind |
| --- | --- | --- | --- |
| ARG-001 | S-001, S-002 | S-003 | defeasible |
| ARG-005 | S-017, S-007, S-018, S-019, S-008, S-020 | S-004 | defeasible |
| ARG-004 | S-004, S-022, S-005 | S-006 | defeasible |
| ARG-006 | S-022, S-024, S-025 | S-026 | deductive |
| ARG-007 | S-022, S-024, S-011 | S-027 | deductive |
| ARG-002 | S-005, S-006, S-009, S-027 | S-014 | defeasible |
| ARG-003 | S-014, S-015 | S-016 | defeasible |

These tables are an inspection of resolved data, not another authoring location
for conclusions or premises. Future changes must edit canonical records and/or
the JSON, then reconsider this explanatory note. The temporary review packet at
`/tmp/model-stage-4-review-packet.json` is generated inspection output; it is not a
production data source or an automatic approval artifact.

## Locations and diagnostics

Every statement's primary location is derived from explicit introductions and
argument conclusions. Multiple distinct arguments may conclude the same statement;
the first main appearance wins, then orientation, then supporting order. All
alternative conclusions and premise occurrences keep separate local anchors. For
example, S-027 is introduced at
`reading-actual-input-effects--argument-arg-007--conclusion`; its premise appearance
in practice is `reading-practice--argument-arg-002--premise-s-027`. Both resolve to
the same statement wrapper and canonical entry. No fragment is published yet.

The default resolves with **zero forward-reference diagnostics**. Every argument's
premises have been introduced earlier in its route. This was inspected separately
from inference: the six biological introductions remain independent empirical
premises, S-022 remains an evaluative commitment, and S-011 remains an independent
actual-effect claim. There is no topological sorting or inference from neighboring
steps, domains, ID numbers, dependencies, see-also links, or citations.

Invalid shape, wrong-kind/malformed IDs, overrides, missing records, duplicate
sections or explicit placements, an explicit statement repeated as a conclusion,
version mismatches, and unplaced content fail validation. A future record must be
placed intentionally. Repeated premises and distinct arguments sharing a conclusion
remain valid. A future premise introduced later or elsewhere receives a nonfatal
`premise-not-introduced` diagnostic with both locations; all its canonical data
still resolve. Cyclic arguments produce finite participation lists while cyclic
revision dependencies remain errors.

## Build integration and review

The existing Model overview frontmatter imports the JSON, loads both full Astro
collections, calls `buildReasoningIndex`, and calls `resolveReadingPath`. It logs
nonfatal diagnostics and propagates structural failures. Its markup and current
catalog ordering are unchanged; detail and argument pages retain their routes,
exact-statement rendering, relationship links, and comment identities.

The review input list now includes the configuration, reading-path contract,
resolver/schema, and reasoning index: 61 inputs for 35 canonical review records.
Authoring and standards contracts distinguish catalog sorting from reading order.
The visualization plan now makes the integrated text walkthrough the default and
leaves a graphical map optional, preserving argument identity, joint premises,
distinct relationship types, and independent cycle rules.

The whole-Model semantic review inspected all exact propositions, summaries,
explanations, evidence notes, revision conditions, direct dependencies, and seven
argument routes against the final inputs. It also inspected all nine section
titles, both introductions, coverage, canonical resolution, and derived primary
locations. Per-record findings remain in the existing five rubric fields in
`reviews/model-review.json`. No content correction was necessary.

Specific findings:

- The biological section does not derive nervous systems from organismic activity,
  or modifiability from regulatory limits. ARG-005's framework rationale remains
  defeasible and allows a locally best feasible response with no available improvement.
- S-021 supplies a contextual comparison including relevant gains and losses;
  S-022 supplies an adopted value; S-005 supplies a professional aim. Their reading
  order does not derive a value from biology or authorize an intervention.
- ARG-006 applies S-022 to the improving change defined by S-024/S-025. The same
  scope, context, and timescale are preserved. The deduction remains compatible
  with no successful adjustments occurring.
- ARG-007 applies that value to the same input-caused improving reorganization
  asserted by S-011. This exact empirical premise is indispensable. Neither
  S-026 nor S-028 is inserted into its premises by reading adjacency.
- S-028 remains an additional mechanism claim. S-012/S-013 remain adopted empirical
  branches about transfer and principal mediation, rather than automatic
  consequences of local benefit. Their supporting placement does not lower adoption.
- ARG-002 and ARG-003 retain explicit defeasible practical bridges. Functional
  benefit does not settle input selection or intervention worth; uncertain
  observations do not become success, failure, or a reason to continue input.

Counterexamples reconsidered include input without reorganization, reorganization
without improvement, a favorable metric with relevant losses, local benefit without
broader transfer, and benefit outweighed by costs or alternatives. All remain
compatible with the corresponding boundaries. Empirical confidence stays unresolved
where recorded. Existing evidence notes were inspected for scope and use in the
new path; this stage performed no new empirical literature appraisal or confidence
upgrade. No structural test certifies natural-language validity or empirical truth.

## Validation results

Completed on 2026-09-12:

- `npm run audit:model -- --packet` supplied the final review inputs; the JSON-only
  packet was also saved with npm's `--silent` option. `npm run audit:model -- --check`
  confirms 35 completed records covering 61 current inputs.
- `npm test` passed all eight test files. Because this environment's default
  reporter reports file totals, the same suite with `--test-isolation=none` made
  all **53 individual passing tests** observable, including 13 new tests.
- `npm run build` passed the review prerequisite and built the existing **40 pages**.
- `npm run test:routes` passed; a matching run with `--test-isolation=none` confirmed
  all **three route tests**, including exact statement/argument rendering and every
  built internal page/fragment link.
- The isolated production regression test copied the actual overview, canonical
  collections, helpers, and policies into a disposable directory, substituted a
  missing S-999 reference, and supplied explicitly synthetic test-only review
  bookkeeping. The review gate passed, then the real `npm run build` failed at
  `main section "living-organisms" step 1: missing statement S-999`. This proves
  runtime validation remains independent of freshness; the synthetic record never
  approves or modifies repository content. Build output is captured in a temporary
  file because child-process pipes are intercepted in this environment.
- Focused cases cover authored order despite collection/catalog reordering, exact
  text and slug changes, strict shape and overrides, missing endpoints, duplicate
  placements, unplaced future records, version mismatch, shared conclusions,
  argument cycles, unchanged dependency-DAG enforcement, repeated premise identity,
  input immutability, and forward references to later or optional/supporting content.
  Review tests cover every new production input and excluded review bookkeeping.
- `git diff --check` passed. Comparison with Stage 3 confirms no canonical content,
  schema, package, or dependency changes. The overview markup is unchanged; all new
  behavior is confined to data preparation, validation, contracts, tests, and review.

## Inputs for Stage 5

Use the full `getCollection('statements')` and `getCollection('arguments')` results
with `buildReasoningIndex`, then resolve the JSON using `resolveReadingPath`.
Render `main` in order; offer `orientation` and `supporting` without changing their
adoption. Each resolved step supplies its original entry and current detail link;
argument steps additionally supply full ordered premises and the conclusion.
Read metadata and exact statements from `entry.data`, and body/source identity
from the original entry. Keep the shared index for **all** concluding and premise
arguments, including those outside main. Treat supplied entries as read-only.

Use section and step anchors plus `primaryStatementLocations` for introductions
and premise back-links, and `statementLocations` for repeated appearances. Surface
or editorially resolve diagnostics without turning them into logical failures.
Stage 5 still owns the integrated layout, navigation changes, expandable reasoning,
and revised statement-page presentation. No merge or deployment is part of this stage.
