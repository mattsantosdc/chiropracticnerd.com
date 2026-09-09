## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Model authoring

The default method is: **build the reasoning first; test the empirical premises second.** Start with the proposed conclusion, then expose every premise it requires and inspect the claim types, scope, modality, and inference. Where deductive necessity is claimed, verify that the conclusion must follow from the premises exactly as written. Keep inherently inductive, abductive, causal, mechanistic, normative, and practical reasoning defeasible.

Only after the inferential structure is explicit should evidence be used to evaluate empirical premises, mechanisms, measurements, and factual claims. Do not default to gathering studies, inferring a broad conclusion, and constructing premises afterward to rationalize it; do not work backward from a desired conclusion. Evidence may suggest hypotheses, expose gaps, and require any premise, inference, scope, or conclusion to be revised. This analytical ordering does not make empirical evidence less important or permit conclusions to be chosen independently of it.

**State the proposed truth separately from confidence in it.** Use the statement to express the proposition the Model proposes; use confidence and evidence sections to express its justification. Do not add uncertainty language merely because support is unresolved. Retain qualifiers that define scope, capacity, or necessary conditions. Both weakening and strengthening a proposition require explicit reasoning; neither is an automatic response to a confidence label.

**Adoption is separate from evidential confidence.** Inclusion in a Model version identifies an entry or argument as part of its current working account. Unresolved confidence does not mean a claim is unadopted, and adoption does not establish empirical truth or inferential validity. Model and argument records do not use an editorial `status` property or public status badges. Audit this distinction on every change; introduce a separate candidate or publication workflow only when it has a concrete purpose.

Before changing anything in `src/content/model/` or `src/content/arguments/`, read these documents in order:

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
- Preserve stable Model and argument IDs whenever possible.
- Represent relationships intended for future visualization in canonical structured data; do not infer them from prose, terminology, comments, or transitive paths.
- Keep renderer-specific coordinates, styling, layout state, and package identifiers out of canonical Model and argument content.

Keep revision dependencies, structured arguments, empirical evidence, and causal hypotheses distinct. For deductive arguments, verify that the conclusion necessarily follows from the premises exactly as written; the software validates structure and references, not natural-language validity.

## Required Model review

For every Model or argument change, including their schemas and page templates, follow [`docs/model-review.md`](docs/model-review.md). Run `npm run audit:model` to see missing or stale reviews and `npm run audit:model -- --packet` to obtain the exact current review inputs. Perform the semantic review as the working AI agent or editor, inspect the diff, and record specific findings in `reviews/model-review.json` only after reviewing the current content. Recheck all statements, their summaries and explanations, and affected dependencies and arguments. Do not refresh fingerprints merely to make tests pass, and do not treat a keyword check or an AI finding as proof of validity or empirical truth.

`npm test` and `npm run build` require a current completed review. Empirical confidence may remain unresolved; this gate concerns compliance with the authoring rule, not empirical confirmation. No separate human approval is required by this workflow. The full incremental review engine and a hosted AI runner remain deferred.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
