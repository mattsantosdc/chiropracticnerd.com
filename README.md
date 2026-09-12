# chiropracticnerd.com

Dr. Matt Santos's Chiropractic Nerd website, built with Astro and Markdown. It hosts articles and the Coherent Chiropractic Model, with room for other professional work.

## Identity and authorship

**The Coherent Chiropractic Model** is the project name, used in navigation and page titles. “Coherent” describes the consistency of the account from its premises to its practical conclusions. “The Model” remains a convenient shorthand within its own content. Dr. Matt Santos is its author. **Chiropractic Nerd** is his personal professional identity, and **Chiropractic Nerd Systems** is his professional brand. The Model is one project on the site.

Shared names and authorship live in `src/lib/site.ts`. A brief acknowledgment of the generations who developed chiropractic appears prominently on the Model overview and its introductory article, whose title remains **Toward a Coherent Model of Chiropractic**. Specific source contributions belong with the relevant claims. Identity and presentation changes preserve the Model's v0.1 scope. The explicit prepublication
[Stage 1 migration](docs/statements-stage-1-migration.md) records the authorized identifier and
discussion-key changes separately from the earlier domain-ID migration.

## Core reasoning method

**Build the reasoning first. Test the empirical premises second.** For any proposed conclusion, the Model first exposes the premises it would require, along with their scope and modality, and makes the inferential route inspectable. Where deduction is claimed, the conclusion must necessarily follow from the premises exactly as written. Inductive, abductive, causal, mechanistic, normative, and practical reasoning may appropriately remain defeasible.

Science then tests the empirical premises, mechanisms, measurements, and factual claims against reality. Evidence raises or lowers confidence in empirical premises; it does not determine whether an inference is valid. Conversely, a valid argument cannot make an empirical premise true. This ordering makes the Model auditable. It neither ranks philosophy above science nor permits conclusions to be chosen independently of evidence: findings can suggest hypotheses and must drive revision of any premise, inference, scope, or conclusion that fails.

## Content architecture

The Model is the complete account, built from statements and arguments. Statements live in
`src/content/model/statements/`, with no domain subfolders. Each Markdown file is an individually addressable statement with:

- a globally unique, permanent `S-###` statement ID and a URL slug
- a proposition in `statement`, its `statementType`, and current confidence
- explicit, typed upstream dependencies and untyped related statements
- a version and updated date
- rationale, boundaries, open questions, and sources where useful

The independent Astro collections are `statements` and `arguments`; each loader targets its exact
canonical directory. Astro content IDs are loader keys, distinct from permanent frontmatter IDs.

Structured reasoning lives separately in `src/content/model/arguments/`. Each argument has a permanent `ARG-###` ID, one or more statement premises, exactly one statement conclusion, a deductive or defeasible inference kind, a named reasoning scheme, and prose explaining the route and its limits.

Inclusion in a version identifies statements and arguments as the Model's current working account. Adoption is separate from evidential confidence: an unresolved claim can be an adopted working claim, and inclusion does not establish empirical truth or inferential validity. Statement and argument records have no editorial `status` property or public status badges. Every change is reviewed for this distinction alongside the separation of propositions from confidence.

Every upstream dependency is an object containing an `id`, a `role`, and a required explanatory `note`. An edge reads `upstream → downstream` and is admitted only when materially revising the upstream statement would require the downstream claim or its intended meaning to be reconsidered. The supported roles are:

- `methodological`: a rule for how the downstream statement is framed, evaluated, or revised
- `normative`: a value, purpose, or priority that justifies a downstream choice
- `conceptual`: a concept or definition required for the downstream statement's intended meaning
- `empirical`: a testable premise, observed relationship, or proposed mechanism needed by the downstream statement's empirical content
- `practical`: understanding translated into a downstream decision, procedure, or action

The architecture keeps that method's layers distinct: the dependency graph shows revision impact, argument records show specified inferential routes, and empirical evidence changes confidence in empirical premises. No dependency role reports truth, confidence, causal strength, chronology, provenance, or inferential sufficiency. Roles are direct and are not automatically transitive.

The primary workflow is [`docs/model-authoring.md`](docs/model-authoring.md). The detailed contracts are [`docs/dependency-model.md`](docs/dependency-model.md), [`docs/argument-model.md`](docs/argument-model.md), and [`docs/standards-contract.md`](docs/standards-contract.md). Deferred functionality is documented in the [`reasoning review and invalidation plan`](docs/review-invalidation-plan.md) and [`visualization plan`](docs/visualization-plan.md).

Astro validates dependency roles and notes, IDs and routes, statement and argument references, empirical revision conditions, duplicate/self relationships, and the upstream dependency DAG during the build. Argument topology is validated independently and cannot make the dependency graph cyclic. `related` remains an undirected, non-dependency see-also link. Model pages generate dependency and reasoning links from canonical metadata rather than hardcoded navigation; dedicated argument pages provide the deeper inspection layer without displacing each statement's plain-language claim.

Markdown remains canonical. AIF is reserved only as a future interchange representation for the active Markdown argument layer; it is not the reasoning method. Stable semantic identifiers and other future standards mappings are documented in the standards contract, and no linked-data export is published yet.

Interactive graph rendering is also deferred while the Model is small. The visualization plan defines how canonical statements, dependencies, arguments, and related links will project into a renderer-neutral graph without allowing presentation concerns or inferred relationships into the Markdown source of truth.

A focused [Model review](docs/model-review.md) now checks that propositions are stated separately from confidence in them. An AI agent or human editor records specific findings for every statement and argument in `reviews/model-review.json`. Tests and npm builds require those findings to cover the current content and policy. `npm run audit:model` reports stale or missing reviews, and `npm run audit:model -- --packet` supplies the exact inputs for review. Fingerprints verify input identity and review coverage, not truth, validity, soundness, or evidential strength. The full incremental review engine and a hosted AI runner remain deferred.

Article and Model metadata deliberately separate permanent identity from routing:

- `article.data.id` is the permanent article identity; `article.data.slug` controls its public URL.
- `statement.data.id` is the permanent statement identity; `statement.data.slug` controls its public URL.

All Model domains share the `S-###` identifier namespace. The [Stage 1 migration map](docs/statements-stage-1-migration.md) records the previous IDs and paths, separately from the earlier domain-ID migration. Statement IDs are permanent and must never be reused; their numbers carry no ordering, hierarchy, domain, or inferential meaning. Keep presentation grouping in `domain` and presentation order in `order`; IDs must not determine sorting or graph layout. New articles receive the next explicit `article-NNN` ID rather than deriving one from a filename, title, slug, date, or collection entry ID.

## Model v0.1

The Model is **guided by first principles and tested against reality**. First principles expose assumptions and help make the framework coherent; they do not deduce chiropractic upward or settle empirical questions.

Version 0.1 is deliberately low-resolution. It contains 28 statements, 38 direct revision dependencies, and seven structured arguments. Three Framework statements—including S-003's explicit reasoning and empirical testing method—organize these domains. The analytical workflow does not require Philosophy to precede Science in a reader's route:

1. Philosophy: open-ended potential (`S-004`), context-appropriate function and comparative improvement (`S-021`), the value of that improvement (`S-022`), professional purpose (`S-005`), a rationale beyond symptoms (`S-006`), definitions of input, adjustment, and success (`S-023`–`S-025`), and the functional benefit of successful adjustment (`S-026`).
2. Science: organismic and neural regulation (`S-017`, `S-007`, `S-018`, `S-019`), context-dependent strategies and sensory updating (`S-008`, `S-020`), modifiable opportunities (`S-009`), general perturbation (`S-010`), actual input-caused reorganization and improvement (`S-011`), its chiropractic perturbation mechanism (`S-028`), the corresponding functional-benefit conclusion (`S-027`), broader transfer (`S-012`), and principal neural mediation of broader effects (`S-013`). S-027 is explicitly mixed because it combines an empirical commitment with an adopted value.
3. Art: prospective assessment of an actionable opportunity (`S-014`), conditional delivery of an input (`S-015`), and reassessment permitting stopping or revision (`S-016`).

Application belongs within Art rather than forming a peer domain. The graph stays incomplete where another premise or empirical bridge would be required; gaps are not filled to make it appear linear. Functional benefit is evaluated within specified functions, context, comparison, and timescale, with relevant functional gains and losses considered together. Whether an intervention is worth pursuing additionally depends on costs, risks, burdens, alternatives, and uncertainty.

The original five arguments remain defeasible: methodological synthesis (`ARG-001`), assessment (`ARG-002`), reassessment (`ARG-003`), the rationale beyond symptoms (`ARG-004`), and the biological rationale for open-ended potential (`ARG-005`). The two benefit arguments are deductive: `ARG-006` uses the value and response/success definitions to conclude `S-026` without asserting that any success occurs; `ARG-007` uses the value criterion, reorganization definition, and `S-011` to conclude actual functional benefit in `S-027`, conditional on that empirical premise being true. Neither proves universal benefit, reliable selection, or that care is warranted for everyone.

The historical [v0.1 reasoning audit](docs/model-v0.1-reasoning-audit.md), [Stage 2 integration note](docs/model-stage-2-integration.md), and [Stage 3 integration note](docs/model-stage-3-integration.md) record the development decisions and unresolved bridges. The current Model separates the delivered input from the organism's adjustment and from functional success. Research retains all relevant inputs, including no reorganization, no benefit, adverse responses, and uncertain outcomes. S-012's broader improvement and S-013's principal neural mediation remain separate empirical commitments connected only by a see-also link; neither establishes the other. Historical article discussions remain separate from the living Model.

Every Science statement has a **Current evidence** section describing documented support and unresolved questions. These notes distinguish limited task-specific research from broader claims awaiting appraisal; they do not constitute a comprehensive literature review or establish chiropractic effects. Inclusion identifies working adoption separately from confidence. The existing interface remains in place; an explicit reading-path configuration and integrated interface are deferred to Stages 4 and 5.

## FastComments

Public discussion uses stable IDs that do not change when a route changes:

- Articles use `article:${article.data.id}`.
- Individual public statements use their bare `statement.data.id` (`S-###`).
- General Model discussion uses `model:general`.

The [Stage 1 migration](docs/statements-stage-1-migration.md) changes former statement keys
`model:M-###` to bare `S-###` IDs. No external comment migration or legacy aliases are included.

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
| `npm run dev -- --background` | Start the local development server in the background |
| `npm run audit:model` | Report Model review freshness and recorded findings |
| `npm run audit:model -- --packet` | Produce exact inputs for an AI-assisted or human Model review |
| `npm test` | Run structural and review-gate tests |
| `npm run build` | Require a current Model review, validate content, and build the site |
| `npm run test:routes` | After building, check every statement/argument page and internal link |
| `npm run preview` | Preview the production build |
