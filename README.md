# chiropracticnerd.com

A public, evolving model of chiropractic built with Astro and Markdown.

## Content architecture

The canonical model lives in `src/content/model/`. Each Markdown file is an individually addressable entry with:

- a stable model ID and URL slug
- a typed claim and current confidence
- explicit, typed upstream dependencies and untyped related entries
- a working, provisional, or placeholder status
- rationale, boundaries, open questions, and sources where useful

Every upstream dependency is an object containing an `id`, a `relation`, and a required explanatory `note`. An edge reads `upstream → downstream` and is admitted only when materially revising the upstream entry would require the downstream claim or its intended meaning to be reconsidered. The supported relations are:

- `methodological`: a rule for how the downstream entry is framed, evaluated, or revised
- `normative`: a value, purpose, or priority that justifies a downstream choice
- `conceptual`: a concept or definition required for the downstream entry's intended meaning
- `empirical`: a testable premise, observed relationship, or proposed mechanism needed by the downstream entry's empirical content
- `practical`: understanding translated into a downstream decision, procedure, or action
- `logical`: one premise in an explicit deductive or analytic inference

No relation reports truth, confidence, causal strength, or sufficiency. An arrow is deductive only when its relation is `logical`, and then entailment belongs to the complete premise set and stated inference rule rather than any one pairwise edge. Entries using logical edges must name the rule and explain the full inference in structured metadata. Edge types are direct and are not automatically transitive. The full authoring standard and selection rubric live in [`docs/relationship-model.md`](docs/relationship-model.md).

Astro validates duplicate IDs, duplicate slugs, duplicate upstream dependencies, duplicate or reciprocal `related` links, dangling references, self-references, pairs listed as both dependencies and related, logical edges without an explicit inference, orphaned inference metadata, and upstream dependency cycles during the build. `related` remains available as an undirected, non-dependency see-also link; it is stored on either endpoint, shown on both, and excluded from cycle detection. The pages under `src/pages/model/` generate the model index, upstream links, downstream links, and related links from metadata rather than hardcoded navigation. Downstream links preserve the relation and note by inverting the corresponding upstream edge. Entries of every status receive a page and appear on the index; status is displayed as metadata rather than used as a publication filter.

Article and Model metadata deliberately separate permanent identity from routing:

- `article.data.id` is the permanent article identity; `article.data.slug` controls its public URL.
- `entry.data.id` is the permanent Model-node identity; `entry.data.slug` controls its public URL.

This v0.1 reconstruction resets the unpublished Philosophy, Science, and Art namespaces to clean sequences. Once an ID is published, it must never be reused or changed. New articles receive the next explicit `article-NNN` ID rather than deriving one from a filename, title, slug, date, or collection entry ID.

## Model v0.1

The Model is **guided by first principles and tested against reality**. First principles expose assumptions and help make the framework coherent; they do not deduce chiropractic upward or settle empirical questions.

Version 0.1 is deliberately low-resolution. It contains two Framework entries plus this substantive spine:

1. Philosophy: adaptability (`P-001`), chiropractic's purpose (`P-002`), and its non-treatment purpose boundary (`P-003`)
2. Science: nervous-system and neuromotor adaptability (`S-001`–`S-002`), subluxation (`S-003`), perturbation and reorganization (`S-004`), chiropractic inputs (`S-005`), and broader adaptability (`S-006`)
3. Art: assessment (`A-001`), force application (`A-002`), and reassessment (`A-003`)

Application belongs within Art rather than forming a peer domain. The graph stays intentionally incomplete where another premise or empirical bridge would be required; gaps are not filled merely to make the graph look linear.

## FastComments

Public discussion uses stable IDs that do not change when a route changes:

- Articles use `article:${article.data.id}`.
- Individual public Model entries use `model:${entry.data.id}`.
- General Model discussion uses `model:general`.

Set `PUBLIC_FASTCOMMENTS_TENANT_ID` in the production deployment environment to enable comments. Leave it unset for branch-preview deployments so draft or experimental previews cannot display or accept comments in the production discussions. When it is unset, production and preview builds omit both the comments UI and the FastComments CDN script. The tenant ID is not a secret, but keeping it environment-configured makes the production-versus-preview boundary explicit. Copy `.env.example` to a local untracked environment file if comments need to be tested during development.

After creating the FastComments account, configure these items manually in the FastComments dashboard:

- Add the production Chiropractic Nerd domain or domains.
- Use the account's tenant ID for `PUBLIC_FASTCOMMENTS_TENANT_ID`.
- Allow low-friction guest or anonymous commenting.
- Disable the requirement for commenters to provide an email address.
- Keep email optional so commenters who provide one can receive relevant notifications.
- Configure spam and moderation settings as appropriate.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Validate content and build the site |
| `npm run preview` | Preview the production build |
