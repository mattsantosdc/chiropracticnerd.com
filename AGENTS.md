## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Model authoring

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
- Do not treat current confidence as truth.
- Do not treat lack of supporting evidence as proof of falsity unless the relevant evidence genuinely has power to establish absence.
- Treat historical chiropractic sources as context and provenance rather than authority; distinguish what the Model retains, modifies, or rejects.
- When a proposed change reveals a missing premise, logical gap, conflicting scope, or unsupported empirical bridge, flag it rather than papering it over.
- Preserve stable Model and argument IDs whenever possible.
- Represent relationships intended for future visualization in canonical structured data; do not infer them from prose, terminology, comments, or transitive paths.
- Keep renderer-specific coordinates, styling, layout state, and package identifiers out of canonical Model and argument content.

Keep revision dependencies, structured arguments, empirical evidence, and causal hypotheses distinct. For deductive arguments, verify that the conclusion necessarily follows from the premises exactly as written; the software validates structure and references, not natural-language validity.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
