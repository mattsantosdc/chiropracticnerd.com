## ASPIC+ transition and branch workflow

The Model is a network of statements with question-specific conclusions, not one global beginning and ending. Follow [the ASPIC+ foundation contract](docs/aspic-foundation.md), [objection authoring](docs/objection-authoring.md), and [the migration assessment](docs/aspic-migration.md) for this transition. These documents adopt the user's authorized formal foundation and supersede older deferrals of the pilot.

Create all transition branches from `model-v0.1`; eventual pull requests target that branch. Finish the remaining seven relationship decisions before preparing or revising a PR for the user's review. The user will review and merge manually; do not merge into `model-v0.1` or `main`. Continue implementation and branch commits without interrupting the work for PR preparation. Keep the governing instructions current with each schema, engine, content and presentation change.

No domain axioms, implicit input premises, authored acceptance labels, confidence-based priorities, or unchecked strict-rule labels. Use the pinned grounded profile with explicit equal base priorities. Preserve rule identities, joint premises, attacks on premises/inferences, and alternative derivations. Read the profile's supported language and cycle limits before adding formal content. An unsupported input or incomplete computation must fail visibly.

Functional improvement supplies its own proposed value in this Model. Do not assume condition treatment is the default aim or require a further symptom outcome to give qualifying improvement value. Keep input-caused reorganization, functional improvement, professional purpose and any additional outcomes distinct. ARG-008 supports S-005 using S-027's scoped benefit and the explicit normative principle S-029; S-005 is derived, not also an ordinary starting premise. The aim does not depend on open-ended potential. Do not import illustrative comparisons with medicine or other approaches into canonical premises, arguments or statements. A claim that every symptom effect is mediated by the proposed functional improvement would need a separate explicit causal account.

Distinguish the adopted working account, recorded alternatives, hypothetical evaluation premises and critical questions. A question is not an asserted counterpremise. Present challenges neutrally under “Questions and alternative explanations”; assess claims and reasoning without speculating about practitioners' motives. Rigor takes priority when a real conflict must be stated. Use [objection-authoring.md](docs/objection-authoring.md) for exact targets, strong charitable formulations and revision consequences.

Run `npm run test:reasoning` and `npm run reasoning:pilot` alongside the existing required Model checks. Include new reasoning policy, bindings, adapters, critical-question data and renderers in `scripts/model-audit.mjs` review inputs. Do not retire a legacy dependency until its meaning and limiting note have an explicit disposition in the migration assessment. The final inference impact index must follow attacks and defenses as well as support; a reading path cannot filter evaluation.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Model authoring

The default method is: **build the reasoning first; test the empirical premises second.** Start with the proposed conclusion, then expose every premise it requires and inspect the statement types, scope, modality, and inference. Where deductive necessity is claimed, verify that the conclusion must follow from the premises exactly as written. Keep inherently inductive, abductive, causal, mechanistic, normative, and practical reasoning defeasible.

Only after the inferential structure is explicit should evidence be used to evaluate empirical premises, mechanisms, measurements, and factual claims. Do not default to gathering studies, inferring a broad conclusion, and constructing premises afterward to rationalize it; do not work backward from a desired conclusion. Evidence may suggest hypotheses, expose gaps, and require any premise, inference, scope, or conclusion to be revised. This analytical ordering does not make empirical evidence less important or permit conclusions to be chosen independently of it.

**State the proposed truth separately from confidence in it.** Use the statement to express the proposition the Model proposes; use confidence and evidence sections to express its justification. Do not add uncertainty language merely because support is unresolved. Retain qualifiers that define scope, capacity, or necessary conditions. Both weakening and strengthening a proposition require explicit reasoning; neither is an automatic response to a confidence label.

**Adoption is separate from evidential confidence.** Inclusion in the canonical working statement and argument collections identifies adoption into that working account. Recorded critical questions, alternatives and hypothetical evaluation inputs have separate roles and are not adopted merely by appearing in the repository. Unresolved confidence does not mean a claim is unadopted, and adoption does not establish empirical truth or inferential validity. Statement and argument records do not use an editorial `status` property or public status badges. Audit this distinction on every change; introduce a separate candidate or publication workflow only when it has a concrete purpose.

Before changing anything in `src/content/model/statements/` or `src/content/model/arguments/`, read these documents in order:

1. [`docs/model-authoring.md`](docs/model-authoring.md)
2. [`docs/dependency-model.md`](docs/dependency-model.md)
3. [`docs/argument-model.md`](docs/argument-model.md)
4. [`docs/standards-contract.md`](docs/standards-contract.md)
5. [`docs/visualization-plan.md`](docs/visualization-plan.md)

Apply these guardrails to every Model change:

- Do not infer argument support from dependency arrows.
- Do not add dependencies merely to make the graph appear linear.
- Do not create an empirical premise solely because a desired conclusion requires it.
- Do not silently strengthen modal language such as `may` to `does`, `can` to `will`, or `some` to `all`.
- Do not silently weaken an asserted effect into a possibility or an intention merely because empirical confidence is unresolved.
- Do not treat current confidence as truth.
- Do not treat lack of supporting evidence as proof of falsity unless the relevant evidence genuinely has power to establish absence.
- Treat historical chiropractic sources as context and provenance rather than authority; distinguish what the Model retains, modifies, or rejects.
- When a proposed change reveals a missing premise, logical gap, conflicting scope, or unsupported empirical bridge, flag it rather than papering it over.
- Preserve stable statement and argument IDs whenever possible.
- Represent relationships intended for future visualization in canonical structured data; do not infer them from prose, terminology, comments, or transitive paths.
- Keep renderer-specific coordinates, styling, layout state, and package identifiers out of canonical Model and argument content.

Keep revision dependencies, structured arguments, empirical evidence, and causal hypotheses distinct. For deductive arguments, verify that the conclusion necessarily follows from the premises exactly as written; the content validators check structure and references, while the ASPIC+ pilot additionally checks formal strict entailment. Natural-language fidelity remains a semantic review task.

## Required Model review

For every Model or argument change, including schemas and page templates, follow [`docs/model-review.md`](docs/model-review.md). Impact-based semantic review is the default. Run `npm run audit:model -- --plan` for affected records and reasons, or `--packet` for exact current sources, the plan and expected per-record bases. Review changed material and the records the plan marks, including their summaries, explanations, argument context and semantic uses. Preserve unaffected findings, timestamps and reviewer provenance verbatim. The planner uses previous and current relationships, including support, alternative arguments, contradiction, strict transposition and directed undercut influence under the supported profile. Reader-facing questions and reading placement have local review impact; they are not formal attacks or inference edges.

Review globally when shared governing policy, schemas, reasoning implementation/profile/signature or shared presentation changes, when an unsupported relationship cannot be mapped, before a Model-version release, and at least every 90 days. Use `--full` to request a whole-model review plan. The periodic gate is checked during ordinary project commands, not by a scheduled task. Inspect for missing relationships during whole-model reviews. Never refresh outer snapshot fingerprints or per-record bases merely to clear a gate. Record findings only after examining the applicable content. A derived impact set can be conservative and cannot discover an unrecorded semantic relationship by itself.

`npm test` and `npm run build` require current review coverage. Run the complete reasoning suite and whole-theory pilot after every Model change; incremental semantic review does not authorize sliced evaluation or skipping automated integrity checks. Empirical confidence may remain unresolved. No separate human approval is required for review bookkeeping or implementation. Incremental formal evaluation and a hosted AI reviewer remain deferred.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
