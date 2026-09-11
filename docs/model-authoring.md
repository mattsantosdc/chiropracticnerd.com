# Model authoring

This is the primary workflow for humans and coding agents changing Model entries or structured arguments. Read it together with the [dependency model](dependency-model.md), [argument model](argument-model.md), [standards contract](standards-contract.md), and [visualization plan](visualization-plan.md) before editing canonical content.

## Governing two-stage method

**Stage 1 — Conceptual and logical construction:** Start with the conclusion the Model proposes. Expose every premise the proposed route requires, including its scope and modality, and evaluate whether the inference does what it claims. Where deductive necessity is asserted, the premises must be stated such that, if all are true, the conclusion must be true. Inductive, abductive, causal, mechanistic, normative, and practical reasoning may appropriately remain defeasible.

**Stage 2 — Empirical evaluation:** Once that structure is inspectable, use science to evaluate its empirical premises, mechanisms, measurements, and other factual claims. Evidence raises or lowers confidence in empirical premises; it does not determine whether an inference is logically valid. A valid argument likewise cannot establish that an empirical premise is true. Philosophy can clarify and organize a proposal, but it cannot determine empirical truth.

In compact form: **propose the model → expose the premises → establish the inference → test the empirical premises → revise whatever fails.** “First” describes the analytical order needed to make a claim inspectable, not a one-way history of inquiry or a ranking of philosophy over science. Evidence may suggest hypotheses, reveal missing premises, challenge the proposed structure, and require its premises, inference, scope, or conclusion to change.

Do not substitute an evidence-first rationalization: gather studies, infer a broad conclusion from the literature, then construct premises afterward to make that conclusion appear to follow. Conclusions remain evidence-responsive and fully revisable, but any claimed inferential route must be inspectable independently of which conclusion the available evidence seems to favor.

## State the proposition separately from confidence

**Use the statement to express the proposed truth; use confidence and evidence sections to express our justification for believing it. Retain qualifications that define scope, capacity, or necessary conditions.** This applies to statements, summaries, explanations, and the wording used to interpret premises in arguments.

An unresolved empirical hypothesis can directly assert that a relationship occurs. Adding `may` solely because its support is unresolved changes the proposition under examination. Likewise, describing an input as *intended* to produce an effect does not assert that it produces that effect. Make the intended empirical commitment explicit and classify it accordingly; describe intentional use separately when relevant.

Do not ban modal language. `Some` limits scope; `can` can assert a capacity; `when warranted` can define a necessary condition for action. A genuine possibility hypothesis is also legitimate when that is what the Model proposes. Explain the function of each qualification instead of automatically removing it. Evidence can justify changing a proposition, but the change must be reasoned and explicit. Stronger wording does not create a valid inference or license a missing empirical bridge.

Every change must receive the [Model review](model-review.md). It combines an AI-assisted or human semantic audit with a mechanical check that the recorded review covers the current inputs. Unresolved evidence is compatible with a completed wording review.

## Working adoption and confidence

Every entry and argument included in a Model version forms part of its current working account. Adoption identifies what the Model proposes and how it reasons; it does not establish empirical truth, evidential strength, or inferential validity. An empirical claim with unresolved confidence is still an adopted working claim. All entries and arguments remain open to revision.

Model and argument records therefore have no editorial `status` property. Their inclusion and version identify the working account; claim type, confidence, evidence, and inference kind remain separately inspectable. Do not use unresolved evidence to describe an included claim as unadopted, or use adoption to upgrade confidence or remove defeasibility. A separate workflow for candidates or superseded material should be introduced only when it serves an actual editorial need.

## Historical continuity without historical authority

Historical chiropractic sources can identify where a concept, distinction, or argument came from and provide a useful starting point for present analysis. Their historical importance does not make their claims true, complete, or binding, and citing one useful idea does not import the rest of a source's system.

When using a historical source:

- state as precisely as practical what the source contributes;
- distinguish what the source said from how it is being interpreted and from what the Model currently adopts;
- evaluate definitions, reasoning, empirical claims, and practical proposals according to the standards appropriate to each;
- identify whether an inherited element is being retained, clarified, modified, or rejected; and
- criticize claims that do not hold up clearly and respectfully, without rejecting them merely because they are old.

The aim is neither deference to tradition nor novelty for its own sake. Because chiropractors are the primary audience, build from the profession's existing vocabulary and arguments when they remain useful, while avoiding the unsupported assumptions or inaccurate claims that may accompany them.

Give general credit prominently and briefly in the Model overview and introductory article, without a roster of named influences. Keep specific attributions alongside the concepts they explain. Apply the standards above through precise claims and source notes; avoid repeating defensive disclaimers about historical authority throughout public descriptions.

## Public identity

Use **The Coherent Chiropractic Model** as the project name. “The Model” is appropriate within its own content. “Coherent” describes the consistency of the account from its premises to its practical conclusions; keep this use distinct from any concept of coherence addressed within the Model. The name does not certify logical completeness or empirical support. Attribute authorship to Dr. Matt Santos and present the Model as one project under his Chiropractic Nerd identity and Chiropractic Nerd Systems brand. Keep the introductory article titled **Toward a Coherent Model of Chiropractic**.

## Permanent Model identifiers

Every Model entry has a globally unique `M-###` ID (three decimal digits). Model IDs are permanent,
human-readable identifiers only. Their numeric values carry no ordering, hierarchy, domain, or
inferential meaning. Keep an ID when its entry changes domain, position, wording, or slug, and
never reuse it for another entry. Use `domain` for grouping and `order` for presentation order;
IDs must not determine sorting, including tie-breaking, or graph layout. `ARG-###` IDs remain
separate. The [one-time migration map](model-id-migration.md) records the former Model IDs.

## Workflow for every substantive change

### 1. State the claim precisely

Write one inspectable proposition where practical. Identify modal language and quantifiers such as `can`, `may`, `sometimes`, `some`, `any`, `all`, and `under these conditions`. State the relevant population, context, intervention or exposure, outcome, and timescale when they matter.

### 2. Classify the claim

Decide whether the content is a definition, empirical claim, value judgment, strategy, framework commitment, or mixed claim. Do not let one part of a mixed claim borrow support from another category. Do not add a `logical` Model claim type; logic belongs to an argument record.

### 3. Identify its role in reasoning

Determine whether the entry is a premise, a conclusion, both, or neither. A claim may be the conclusion of one argument and a premise in a higher-level argument. Do not infer this role from dependency metadata.

### 4. Check whether the intended conclusion follows

If necessity is claimed, write every required premise and audit the inference for hidden assumptions. Mark an argument deductive only when the conclusion necessarily follows from the premises exactly as written. Check that modal terms and scopes overlap.

### 5. Do not manufacture missing premises

A missing premise is a useful result of analysis. Record the gap, narrow the proposed conclusion, or add an explicit empirical hypothesis with its scope and confidence documented only when the project is genuinely prepared to assert and test it. Never create an empirical premise solely because a desired conclusion requires it.

### 6. Evaluate empirical premises independently

For each empirical claim, record a meaningful confidence assessment, relevant evidence and references, important limitations and alternatives, and a concrete `whatWouldChange`. Current confidence reports justification, not truth.

Failure to find support is not automatically disproof. Decide whether the study or observation had enough power, measurement validity, sampling, contrast, duration, and scope to make absence detectable. State evidence of absence only when those conditions justify it.

### 7. Keep logic separate from evidential support

A strong study cannot repair an invalid inference. A valid inference cannot compensate for a false or poorly supported empirical premise. When an empirical premise is uncertain, describe the argument's soundness as unresolved and report the premise's epistemic support separately.

### 8. Propagate revisions

When a claim changes, use both layers:

- follow `upstream → downstream` dependencies to locate entries whose meaning or content must be reconsidered; and
- find arguments that use the entry as a premise or conclusion and reassess their premises, scope, inference kind, and conclusion.

Do not add dependency edges merely to make the graph appear linear. Dependency and argument updates must each satisfy their own contract.

The deferred [reasoning review and invalidation plan](review-invalidation-plan.md) describes how
content fingerprints and review attestations may later make this impact traversal semi-automatic
without treating a hash or AI finding as proof of truth, validity, or soundness.

The current [Model review](model-review.md) already checks review freshness for the whole Model. Incremental dependency propagation remains deferred; a content or policy change currently requires reconsidering the complete review.

### 9. Separate argument failure from conclusion falsity

If a premise fails or a conclusion does not follow, mark that inferential route as failed or revise it. Search for alternative explanations or argument paths before declaring the conclusion false. A downstream conclusion may survive through a different argument, while a failed mechanism may leave a higher-order effect unresolved.

### 10. Preserve readability

Keep the public claim and explanation understandable to an ordinary chiropractor. Structured argument records provide a deeper inspection layer; they should not turn every Model page into a symbolic-logic textbook. Define technical language and state limitations in plain terms.

The three text fields have distinct roles:

| Field | Role |
| --- | --- |
| `claim` | The actual statement of the entry: the wording readers inspect and arguments use as a premise or conclusion. Display it in full as the primary text, labeled **Statement**, on the Model overview and entry page. |
| `title` | A short name for identification and navigation. Keep it visually subordinate to the statement. |
| `summary` | A brief explanation or orientation to the statement, displayed separately under **Summary** on the entry page. It must preserve the claim's scope and modality and must not substitute for it in reasoning. |

The body explains, qualifies, or supports the statement. Keep its rationale, limits, sources, and structured reasoning visibly separate from the statement itself. Visual prominence identifies what is asserted; claim type and confidence describe how to assess it. Inclusion in the stated version identifies it as part of the working account.

Write public Model and argument descriptions as self-contained accounts of the current position. Explain the claim and its reasoning without narrating earlier drafts, wording changes, retained record identities, or implementation choices. Keep editorial history and reasons for edits in commit messages, review records, or development documentation. Preserve substantive rationale, evidence limits, revision conditions, and historical source provenance when they help readers understand or evaluate the current account.

## Editing checklist

Before finishing a change, verify that:

- permanent Model and `ARG-###` IDs were preserved wherever possible;
- slugs are treated as routes, not semantic identities;
- dependency notes state revision impact without inferential claims;
- every relationship intended for future visualization is represented in canonical structured data rather than inferred from prose;
- no coordinates, colors, layout ranks, collapsed state, or renderer-specific identifiers were added to canonical content;
- no modal language was silently strengthened (`may` to `does`, `can` to `will`, or `some` to `all`);
- no proposition was silently weakened into possibility or intention solely to reflect uncertainty;
- each retained qualification has an identified role in scope, capacity, conditions, or the intended possibility claim;
- summaries, explanations, and argument interpretations preserve the statement's empirical commitment;
- inclusion identifies adoption independently of confidence, with no editorial `status` field or badge and no suggestion that unresolved support makes an included claim unadopted;
- definitions do not imply existence, causal hypotheses are not treated as proof of outcomes, and normative premises remain visibly normative;
- every new or changed argument explains its inference and limitations;
- empirical entries have meaningful confidence and revision conditions; and
- the semantic review in `reviews/model-review.json` covers the current exact inputs under [the review policy](model-review.md), and tests and the production build pass.

The [v0.1 reasoning audit](model-v0.1-reasoning-audit.md) is the current worked example of applying this workflow without forcing deduction where it does not belong.
