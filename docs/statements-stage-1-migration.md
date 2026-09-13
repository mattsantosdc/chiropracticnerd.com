# Stage 1: canonical statements and arguments migration

## Baseline and authorization

Recorded before moving or rewriting canonical files. The clean working branch
`model-v0.1-statements-and-reasoning` starts at `fa5c14ea731539b24ac9c8f5741e2fdddcbdc81a`.
The current `model-v0.1` remote was fetched over HTTPS and verified at that same revision
(SSH authentication was unavailable). The inspected baseline contains 16 statements,
4 arguments, 23 direct revision dependencies, and one stored related pair.
All basenames are unique within their destination collection; no collision resolution is needed.

This user-authorized prepublication Stage 1 migration is an explicit exception to permanent-ID
preservation. It changes `M-###` to `S-###` without changing numeric suffixes. Subsequent work
must preserve these identities; numbers still encode neither domain nor reading order.
`ARG-###` identities, explicit slugs, public routes, domain and type classifications, confidence,
propositions, qualifiers, and inferential and dependency relationships are preserved.

## Statement ID and path map

| Baseline ID | Stage 1 ID | Old content path | New content path |
| --- | --- | --- | --- |
| `M-001` | `S-001` | `src/content/model/framework/philosophy-science-art.md` | `src/content/model/statements/philosophy-science-art.md` |
| `M-002` | `S-002` | `src/content/model/framework/claim-discipline.md` | `src/content/model/statements/claim-discipline.md` |
| `M-003` | `S-003` | `src/content/model/framework/explicit-reasoning-empirical-testing.md` | `src/content/model/statements/explicit-reasoning-empirical-testing.md` |
| `M-004` | `S-004` | `src/content/model/philosophy/functional-potential.md` | `src/content/model/statements/functional-potential.md` |
| `M-005` | `S-005` | `src/content/model/philosophy/purpose.md` | `src/content/model/statements/purpose.md` |
| `M-006` | `S-006` | `src/content/model/philosophy/care-beyond-symptoms.md` | `src/content/model/statements/care-beyond-symptoms.md` |
| `M-007` | `S-007` | `src/content/model/science/nervous-system-integration.md` | `src/content/model/statements/nervous-system-integration.md` |
| `M-008` | `S-008` | `src/content/model/science/state-dependent-neuromotor-function.md` | `src/content/model/statements/state-dependent-neuromotor-function.md` |
| `M-009` | `S-009` | `src/content/model/science/neuromotor-opportunity.md` | `src/content/model/statements/neuromotor-opportunity.md` |
| `M-010` | `S-010` | `src/content/model/science/salient-perturbation.md` | `src/content/model/statements/salient-perturbation.md` |
| `M-011` | `S-011` | `src/content/model/science/chiropractic-inputs.md` | `src/content/model/statements/chiropractic-inputs.md` |
| `M-012` | `S-012` | `src/content/model/science/broader-functional-benefit.md` | `src/content/model/statements/broader-functional-benefit.md` |
| `M-013` | `S-013` | `src/content/model/science/neural-mediation.md` | `src/content/model/statements/neural-mediation.md` |
| `M-014` | `S-014` | `src/content/model/art/assessment.md` | `src/content/model/statements/assessment.md` |
| `M-015` | `S-015` | `src/content/model/art/chiropractic-application.md` | `src/content/model/statements/chiropractic-application.md` |
| `M-016` | `S-016` | `src/content/model/art/reassessment-cycle.md` | `src/content/model/statements/reassessment-cycle.md` |

## Argument path map

| Unchanged ID | Old content path | New content path |
| --- | --- | --- |
| `ARG-002` | `src/content/arguments/assessment-as-working-hypothesis.md` | `src/content/model/arguments/assessment-as-working-hypothesis.md` |
| `ARG-004` | `src/content/arguments/functional-rationale-beyond-symptoms.md` | `src/content/model/arguments/functional-rationale-beyond-symptoms.md` |
| `ARG-001` | `src/content/arguments/methodological-synthesis.md` | `src/content/model/arguments/methodological-synthesis.md` |
| `ARG-003` | `src/content/arguments/reassessment-after-application.md` | `src/content/model/arguments/reassessment-after-application.md` |

## Distinct migration histories

The [earlier domain-ID migration](model-id-migration.md) records the domain-prefixed IDs
at the revision ending in `fa5c14e`. Its table is preserved as history. In that earlier scheme,
`S-###` meant **science**; in this Stage 1 scheme it means **statement** across every domain.
Historical science `S-001` became `M-007` in the earlier migration and becomes statement
`S-007` here. Current statement `S-001` instead descends from `M-001` (historical `F-001`).
Lookups must identify the scheme/revision; historical science IDs are not runtime aliases
for current statement IDs. The [earlier reasoning audit](model-v0.1-reasoning-audit.md)
retains the baseline `M-###` references so its recorded revision history stays intact.

## Persistent consumers and routes

Statements and arguments use independent Astro collections, `statements` and `arguments`,
loaded only from the two sibling directories above. Astro's generated content IDs remain
loader keys; permanent identity uses frontmatter `data.id`, while navigation uses `data.slug`.
The `/model/` and `/model/arguments/` routes and all explicit statement/argument slugs stay intact.

Reserved semantic IDs change from `/id/model/M-###` to `/id/statement/S-###`.
Dependency identifiers replace both embedded statement IDs; argument identifiers and dependency
role vocabulary are unchanged. No identifier endpoints, exports, runtime aliases, or dual fields
are introduced.

FastComments statement keys change from `model:M-###` to bare `S-###` frontmatter IDs, as
requested by the author after confirming that the Model has had no public use. Earlier keys
are not aliases and any discussion under them would not automatically follow the new keys;
no legacy-thread preservation is required for this prepublication migration. External comment
data has not been inspected or changed. General discussion (`model:general`) and article keys
are unchanged; argument pages have no comment widget.

No new biological account, benefit criterion, reading path, navigation design, evidence review,
or deferred feature is introduced by this stage.

## Completed validation

The before/after inventory matches the fetched baseline: 16 statements, four arguments,
23 annotated direct dependencies, and one stored related pair. All 20 canonical files compare
exactly after the documented ID, field, and record-terminology substitutions. Ordered argument
premises, conclusions, inference kinds, schemes, dependency roles and notes, related-link storage,
domain grouping, order values, explicit slugs, confidence, and revision conditions are preserved.
No proposition or inferential relationship changed.

The whole-Model semantic review records specific findings for every statement and argument.
Its packet contains 20 unique subjects and 42 inputs, retaining all governing and presentation
coverage and adding the statement/argument/identifier/dependency helpers, dependency legend,
and comment component. The scanner visits only the two exact canonical directories.

Validation passed: `npm run audit:model -- --check`, `npm test` (all six test files),
`npm run build` (25 pages), `npm run test:routes` (all three rendered-page checks), and
`git diff --check`. The added tests exercise the actual configured Astro loaders and schemas,
legacy-field/ID rejection, classification requirements, reference resolution, unique review
coverage, rendered statement and argument content, and all built internal links and fragments.
The before/after build comparison preserves all 25 routes and DOM structure/attributes after
accounting for ID substitutions and the requested comment-widget keys. The rendered assessment
page supplies `S-014` directly as its comment thread ID. No external comment service was contacted.

The remaining `M-###` and legacy-field references are deliberate migration/history documentation,
review provenance, or negative-test fixtures. Ordinary intellectual uses of “claim” remain.
The existing biological proposals, benefit criterion, empirical uncertainty, and deferred plans
remain unchanged; subsequent stages have not begun.
