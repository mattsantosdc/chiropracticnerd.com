# chiropracticnerd.com

A public, evolving model of chiropractic built with Astro and Markdown.

## Core reasoning method

**Build the reasoning first. Test the empirical premises second.** For any proposed conclusion, the Model first exposes the premises it would require, along with their scope and modality, and makes the inferential route inspectable. Where deduction is claimed, the conclusion must necessarily follow from the premises exactly as written. Inductive, abductive, causal, mechanistic, normative, and practical reasoning may appropriately remain defeasible.

Science then tests the empirical premises, mechanisms, measurements, and factual claims against reality. Evidence raises or lowers confidence in empirical premises; it does not determine whether an inference is valid. Conversely, a valid argument cannot make an empirical premise true. This ordering makes the Model auditable. It neither ranks philosophy above science nor permits conclusions to be chosen independently of evidence: findings can suggest hypotheses and must drive revision of any premise, inference, scope, or conclusion that fails.

## Content architecture

The canonical model lives in `src/content/model/`. Each Markdown file is an individually addressable entry with:

- a stable model ID and URL slug
- a typed claim and current confidence
- explicit, typed upstream dependencies and untyped related entries
- a working, provisional, or placeholder status
- rationale, boundaries, open questions, and sources where useful

Structured reasoning lives separately in `src/content/arguments/`. Each argument has a permanent `ARG-###` ID, one or more Model premises, exactly one Model conclusion, a deductive or defeasible inference kind, a named reasoning scheme, and prose explaining the route and its limits.

Every upstream dependency is an object containing an `id`, a `role`, and a required explanatory `note`. An edge reads `upstream → downstream` and is admitted only when materially revising the upstream entry would require the downstream claim or its intended meaning to be reconsidered. The supported roles are:

- `methodological`: a rule for how the downstream entry is framed, evaluated, or revised
- `normative`: a value, purpose, or priority that justifies a downstream choice
- `conceptual`: a concept or definition required for the downstream entry's intended meaning
- `empirical`: a testable premise, observed relationship, or proposed mechanism needed by the downstream entry's empirical content
- `practical`: understanding translated into a downstream decision, procedure, or action

The architecture keeps that method's layers distinct: the dependency graph shows revision impact, argument records show specified inferential routes, and empirical evidence changes confidence in empirical premises. No dependency role reports truth, confidence, causal strength, chronology, provenance, or inferential sufficiency. Roles are direct and are not automatically transitive.

The primary workflow is [`docs/model-authoring.md`](docs/model-authoring.md). The detailed contracts are [`docs/dependency-model.md`](docs/dependency-model.md), [`docs/argument-model.md`](docs/argument-model.md), and [`docs/standards-contract.md`](docs/standards-contract.md). Deferred functionality is documented in the [`reasoning review and invalidation plan`](docs/review-invalidation-plan.md) and [`visualization plan`](docs/visualization-plan.md).

Astro validates dependency roles and notes, IDs and routes, Model and argument references, empirical revision conditions, duplicate/self relationships, and the upstream dependency DAG during the build. Argument topology is validated independently and cannot make the dependency graph cyclic. `related` remains an undirected, non-dependency see-also link. Model pages generate dependency and reasoning links from canonical metadata rather than hardcoded navigation; dedicated argument pages provide the deeper inspection layer without displacing each entry's plain-language claim.

Markdown remains canonical. AIF is reserved only as a future interchange representation for the active Markdown argument layer; it is not the reasoning method. Stable semantic identifiers and other future standards mappings are documented in the standards contract, and no linked-data export is published yet.

Interactive graph rendering is also deferred while the Model is small. The visualization plan defines how canonical entries, dependencies, arguments, and related links will project into a renderer-neutral graph without allowing presentation concerns or inferred relationships into the Markdown source of truth.

Reasoning-review automation is likewise deferred. Its plan uses versioned content fingerprints to
identify stale entry, dependency, and argument reviews; propagates reconsideration only through
canonical structured relationships; and stops a branch when a reviewed downstream claim remains
unchanged. A fingerprint records which exact inputs were reviewed and is never treated as proof of
truth, validity, soundness, or evidential strength.

Article and Model metadata deliberately separate permanent identity from routing:

- `article.data.id` is the permanent article identity; `article.data.slug` controls its public URL.
- `entry.data.id` is the permanent Model-node identity; `entry.data.slug` controls its public URL.

This v0.1 reconstruction resets the unpublished Philosophy, Science, and Art namespaces to clean sequences. Once an ID is published, it must never be reused or changed. New articles receive the next explicit `article-NNN` ID rather than deriving one from a filename, title, slug, date, or collection entry ID.

## Model v0.1

The Model is **guided by first principles and tested against reality**. First principles expose assumptions and help make the framework coherent; they do not deduce chiropractic upward or settle empirical questions.

Version 0.1 is deliberately low-resolution. It contains three Framework entries—including F-003's explicit reasoning and empirical testing method—plus this substantive spine:

1. Philosophy: open-ended human functional potential (`P-001`), net-positive functional improvement as a legitimate chiropractic aim (`P-002`), and a functional rationale without requiring symptoms or pathology (`P-003`)
2. Science: nervous-system integration (`S-001`), state-dependent neuromotor function (`S-002`), modifiable opportunities for net-positive change (`S-003`), general perturbation and reorganization (`S-004`), intentional chiropractic training stimuli (`S-005`), and possible broader functional benefit (`S-006`)
3. Art: assessment of an actionable chiropractic opportunity (`A-001`), conditional application (`A-002`), and reassessment permitting stopping or revision (`A-003`)

Application belongs within Art rather than forming a peer domain. The graph stays intentionally incomplete where another premise or empirical bridge would be required; gaps are not filled merely to make the graph look linear.

The four structured arguments expose methodological synthesis (`ARG-001`), assessment under uncertainty (`ARG-002`), reassessment (`ARG-003`), and the philosophical rationale beyond symptoms (`ARG-004`). All remain defeasible. Functional improvement is itself a valued benefit without requiring a separately identified downstream outcome. The philosophical argument permits a rationale; it does not demonstrate effectiveness in asymptomatic people or make functional improvement chiropractic's exclusive purpose.

The [`v0.1 reasoning audit`](docs/model-v0.1-reasoning-audit.md) records the current claim types, scope, revision propagation, and unresolved bridges. S-005 distinguishes intentional use from demonstrated effect. S-006 explicitly proposes possible broader benefit from chiropractic-produced neuromotor changes, principally through nervous-system-mediated change; it is an unresolved empirical hypothesis, not a deduction from S-005 or evidence of an immediate response. Adaptability no longer supplies the philosophical anchor or defines benefit, and the scientific access point does not require a named lesion. Historical article discussions remain separate from the living Model.

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
