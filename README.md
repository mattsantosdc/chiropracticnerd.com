# chiropracticnerd.com

Dr. Matt Santos's Chiropractic Nerd website, built with Astro and Markdown. It hosts articles and The Neurofunctional Model of Chiropractic, with room for other professional work.

## Identity and authorship

**The Neurofunctional Model of Chiropractic** is the project name, with **The Neurofunctional Model** as the preferred shorthand for navigation, buttons, and other brief references. “Neurofunctional” reflects the account’s commitments to primarily neural mediation of chiropractic’s relevant effects and to human function as its basis of value, rather than treatment of particular symptoms or conditions. The name identifies the Model, not a practice style, and does not establish empirical support. Dr. Matt Santos is its author. **Chiropractic Nerd** is his personal professional identity, and **Chiropractic Nerd Systems** is his professional brand. The Model is one project on the site.

Shared names and authorship live in `src/lib/site.ts`. A brief acknowledgment of the generations who developed chiropractic appears prominently on the Model overview and its introductory article, whose title remains **Toward a Coherent Model of Chiropractic**. Specific source contributions belong with the relevant claims. Identity and presentation changes preserve the Model's v0.1 scope.

The [author's practice and conceptual context](docs/author-context.md) records Matt's intended neuroadaptive account, reported observations, working terminology, and exploratory mechanisms. Read it alongside the Model authoring guidance; it supplies context without adding formal premises or establishing empirical support.

## Core reasoning method

**Build the reasoning first. Test the empirical premises second.** For any proposed conclusion, the Model first exposes the premises it would require, along with their scope and modality, and makes the inferential route inspectable. Where deduction is claimed, the conclusion must necessarily follow from the premises exactly as written. Inductive, abductive, causal, mechanistic, normative, and practical reasoning may appropriately remain defeasible.

Science then tests the empirical premises, mechanisms, measurements, and factual claims against reality. Evidence raises or lowers confidence in empirical premises; it does not determine whether an inference is valid. Conversely, a valid argument cannot make an empirical premise true. This ordering makes the Model auditable. It neither ranks philosophy above science nor permits conclusions to be chosen independently of evidence: findings can suggest hypotheses and must drive revision of any premise, inference, scope, or conclusion that fails.

## Content architecture

The Model is the complete account, built from statements and arguments. Statements live in
`src/content/model/statements/`, with no domain subfolders. Each Markdown file is an individually addressable statement with:

- a globally unique, permanent `S-###` statement ID and a URL slug
- a proposition in `statement`, its `statementType`, and current confidence
- explicit, typed semantic uses and untyped related statements
- a version and updated date
- rationale, boundaries, open questions, and sources where useful

The independent Astro collections are `statements` and `arguments`; each loader targets its exact
canonical directory. Astro content IDs are loader keys, distinct from permanent frontmatter IDs.

Structured reasoning lives separately in `src/content/model/arguments/`. Each argument has a permanent `ARG-###` ID, one or more statement premises, exactly one statement conclusion, a deductive or defeasible inference kind, a named reasoning scheme, and prose explaining the route and its limits.

Inclusion in a version identifies statements and arguments as the Model's current working account. Adoption is separate from evidential confidence: an unresolved claim can be an adopted working claim, and inclusion does not establish empirical truth or inferential validity. Statement and argument records have no editorial `status` property or public status badges. Every change is reviewed for this distinction alongside the separation of propositions from confidence.

Additional references use `semanticUses: [{ id, role, note }]`. They record meaning, methodological framing, value interpretation, empirical explanation or practical guidance that argument participation cannot recover. Their five local roles are `methodological`, `normative`, `conceptual`, `empirical` and `practical`. None is an inference kind or a premise declaration.

The retired `upstream` and `downstream` fields are rejected. Revision candidates are derived from argument participation, contradiction, strict transposition, directed undercut influence and the retained semantic uses. Semantic-use cycles are permitted and traversed finitely; the executable profile separately rejects unsupported productive argument cycles. `related` remains an undirected see-also link without revision influence. The [relationship contract](docs/dependency-model.md) specifies authoring and validation.

Astro validates roles and limiting notes, IDs and routes, statement and argument references, empirical revision conditions and duplicate/self relationships. Model pages show argument participation, additional references and a derived list of statements to reconsider. That list signals review scope, not falsity or loss of every supporting route.

The primary workflow is [Model authoring](docs/model-authoring.md). Follow the [argument](docs/argument-model.md), [standards](docs/standards-contract.md), and [review impact](docs/review-invalidation-plan.md) contracts alongside the relationship contract.

Markdown remains canonical. The executable pilot uses an experimental AIF interchange profile; ASPIC+ supplies its reasoning framework. Stable semantic identifiers and other future standards mappings are documented in the standards contract, and no linked-data export is published yet.

Interactive graph rendering is also deferred while the Model is small. The visualization plan defines how canonical statements, semantic uses, arguments, and related links will project into a renderer-neutral graph without allowing presentation concerns or inferred relationships into the Markdown source of truth.

The [Model review](docs/model-review.md) checks that propositions remain separate from confidence. Impact-based review is the default: `npm run audit:model -- --plan` lists affected records and why, while `--packet` supplies their exact sources and expected bases. Unaffected findings retain their original provenance; per-record bases prevent a snapshot refresh from hiding stale reviews. Shared semantic changes and periodic whole-model examinations retain broader coverage. [Editorial documentation changes](docs/model-review.md#editorial-documentation-changes) can carry existing findings forward after an explicit review of the exact diff, without rerunning the whole Model or site. Semantic and implementation changes still run the complete applicable automated suite. Review identity and coverage do not establish truth, validity or evidential strength. Incremental formal evaluation and a hosted AI reviewer remain deferred.

Article and Model metadata deliberately separate permanent identity from routing:

- `article.data.id` is the permanent article identity; `article.data.slug` controls its public URL.
- `statement.data.id` is the permanent statement identity; `statement.data.slug` controls its public URL.

All Model domains share the `S-###` identifier namespace. Statement IDs are permanent and must never be reused; their numbers carry no ordering, hierarchy, domain, or inferential meaning. Keep presentation grouping in `domain` and presentation order in `order`; IDs must not determine sorting or graph layout. New articles receive the next explicit `article-NNN` ID rather than deriving one from a filename, title, slug, date, or collection entry ID.

## Question-specific reading

The Model overview now offers eight starting questions. Every statement also has an answer view that follows its authored arguments and joint premises upstream, with explicit starting assumptions and critical questions. The complete walkthrough, full records and existing discussions remain available. See the [answer-view contract](docs/model-answer-views.md). These pages change reading scope, not formal evaluation or empirical confidence.

## Model v0.1

The Model is **guided by first principles and tested against reality**. First principles expose assumptions and help make the framework coherent; they do not deduce chiropractic upward or settle empirical questions.

Version 0.1 is deliberately low-resolution. It contains 32 statements, 24 additional semantic uses, and ten structured arguments. Three Framework statements—including S-003's explicit reasoning and empirical testing method—organize these domains. The analytical workflow does not require Philosophy to precede Science in a reader's route:

1. Philosophy: open-ended potential (`S-004`), context-appropriate function and comparative improvement (`S-021`), the value of that improvement (`S-022`), the professional-purpose principle (`S-029`) and supported aim (`S-005`), the justified-delivery principle (`S-032`), a rationale beyond symptoms (`S-006`), definitions of input, adjustment, and success (`S-023`–`S-025`), and the functional benefit of successful adjustment (`S-026`).
2. Science: organismic and neural regulation (`S-017`, `S-007`, `S-018`, `S-019`), context-dependent strategies and sensory updating (`S-008`, `S-020`), modifiable opportunities (`S-009`), general perturbation (`S-010`), actual input-caused reorganization and improvement (`S-011`), its chiropractic perturbation mechanism (`S-028`), the corresponding functional-benefit conclusion (`S-027`), general circuit influence (`S-030`), predicted broader neural effects (`S-031`), broader improvement (`S-012`), and predominant mediation of broader effects by motor-related neural change (`S-013`). S-027 is explicitly mixed because it combines an empirical commitment with an adopted value.
3. Art: prospective assessment of an actionable opportunity (`S-014`), conditional delivery of an input (`S-015`), and reassessment permitting stopping or revision (`S-016`).

Application belongs within Art rather than forming a peer domain. The graph stays incomplete where another premise or empirical bridge would be required; gaps are not filled to make it appear linear. Functional benefit is evaluated within specified functions, context, comparison, and timescale, with relevant functional gains and losses considered together. Whether an intervention is worth pursuing additionally depends on costs, risks, burdens, alternatives, and uncertainty.

The original five arguments remain defeasible: methodological synthesis (`ARG-001`), assessment (`ARG-002`), reassessment (`ARG-003`), the rationale beyond symptoms (`ARG-004`), and the biological rationale for open-ended potential (`ARG-005`). The two benefit arguments are deductive: `ARG-006` uses the value and response/success definitions to conclude `S-026` without asserting that any success occurs; `ARG-007` uses the value criterion, reorganization definition, and `S-011` to conclude actual functional benefit in `S-027`, conditional on that empirical premise being true. Neither proves universal benefit, reliable selection, or that care is warranted for everyone. A third deduction, `ARG-009`, extracts the improving effect in `S-011` from `S-028`'s stronger perturbation-and-effect claim. `S-011` also retains a separately disclosed independent empirical premise route; the deduction does not prove the mechanism or resolve either claim's evidence.

The Model separates the delivered input from the organism's adjustment and from functional success. Research retains all relevant inputs, including no reorganization, no benefit, adverse responses, and uncertain outcomes. S-012's broader improvement and S-013's predominant motor-related neural mediation remain separate empirical commitments connected only by a see-also link; neither establishes the other. Historical article discussions remain separate from the living Model.

Every Science statement has a **Current evidence** section describing documented support and unresolved questions. These notes distinguish limited task-specific research from broader claims awaiting appraisal; they do not constitute a comprehensive literature review or establish chiropractic effects. Inclusion identifies working adoption separately from confidence. The [reading-path contract](docs/model-reading-path.md) describes the implemented walkthrough and its explicit configuration.

## FastComments

Public discussion uses stable IDs that do not change when a route changes:

- Articles use `article:${article.data.id}`.
- Individual public statements use their bare `statement.data.id` (`S-###`).
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
| `npm run dev -- --background` | Start the local development server in the background |
| `npm run audit:model` | Report Model review freshness and recorded findings |
| `npm run audit:model -- --packet` | Produce exact inputs for an AI-assisted or human Model review |
| `npm test` | Run structural and review-gate tests |
| `npm run build` | Require a current Model review, validate content, and build the site |
| `npm run test:routes` | After building, check every statement/argument page and internal link |
| `npm run preview` | Preview the production build |

## ASPIC+ foundation pilot

See [the foundation contract](docs/aspic-foundation.md) for the exact profile, supported language, engine adapter, limitations and setup. Create `.venv-reasoning` and install `reasoning/requirements.txt`, then run `npm run test:reasoning` and `npm run reasoning:pilot` alongside the existing Model review, tests and build. The static website does not require a Python runtime.

[Questions and alternative explanations](docs/objection-authoring.md) have a separate authoring contract. The [relationship contract](docs/dependency-model.md) defines semantic uses and derived revision impact. Follow-up work branches from current `main`; pull requests target `main` and remain unmerged for manual user review, unless Matt specifies another branch or base.

The assessment/application relationship uses ARG-010 with the explicit normative premise S-032. Application remains conditional on a warranted input, and S-028 guides the proposed mechanism without serving as a required premise of that strategy. The [substantive opposition audit](docs/model-opposition-audit.md) covers all current records, 24 critical questions and eight hypothetical scenarios evaluated without changing the working account. Unresolved empirical and normative questions remain explicit.
