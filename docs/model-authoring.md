# Model authoring

This is the primary workflow for humans and coding agents changing Model entries or structured arguments. Read it together with the [dependency model](dependency-model.md), [argument model](argument-model.md), [standards contract](standards-contract.md), and [visualization plan](visualization-plan.md) before editing canonical content.

## Governing two-stage method

**Stage 1 — Conceptual and logical construction:** Start with the conclusion the Model proposes. Expose every premise the proposed route requires, including its scope and modality, and evaluate whether the inference does what it claims. Where deductive necessity is asserted, the premises must be stated such that, if all are true, the conclusion must be true. Inductive, abductive, causal, mechanistic, normative, and practical reasoning may appropriately remain defeasible.

**Stage 2 — Empirical evaluation:** Once that structure is inspectable, use science to evaluate its empirical premises, mechanisms, measurements, and other factual claims. Evidence raises or lowers confidence in empirical premises; it does not determine whether an inference is logically valid. A valid argument likewise cannot establish that an empirical premise is true. Philosophy can clarify and organize a proposal, but it cannot determine empirical truth.

In compact form: **propose the model → expose the premises → establish the inference → test the empirical premises → revise whatever fails.** “First” describes the analytical order needed to make a claim inspectable, not a one-way history of inquiry or a ranking of philosophy over science. Evidence may suggest hypotheses, reveal missing premises, challenge the proposed structure, and require its premises, inference, scope, or conclusion to change.

Do not substitute an evidence-first rationalization: gather studies, infer a broad conclusion from the literature, then construct premises afterward to make that conclusion appear to follow. Conclusions remain evidence-responsive and fully revisable, but any claimed inferential route must be inspectable independently of which conclusion the available evidence seems to favor.

## Historical continuity without historical authority

Historical chiropractic sources can identify where a concept, distinction, or argument came from and provide a useful starting point for present analysis. Their historical importance does not make their claims true, complete, or binding, and citing one useful idea does not import the rest of a source's system.

When using a historical source:

- state as precisely as practical what the source contributes;
- distinguish what the source said from how it is being interpreted and from what the Model currently adopts;
- evaluate definitions, reasoning, empirical claims, and practical proposals according to the standards appropriate to each;
- identify whether an inherited element is being retained, clarified, modified, or rejected; and
- criticize claims that do not hold up clearly and respectfully, without rejecting them merely because they are old.

The aim is neither deference to tradition nor novelty for its own sake. Because chiropractors are the primary audience, build from the profession's existing vocabulary and arguments when they remain useful, while avoiding the unsupported assumptions or inaccurate claims that may accompany them.

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

A missing premise is a useful result of analysis. Record the gap, narrow the proposed conclusion, or add a clearly labeled provisional hypothesis only when the project is genuinely prepared to assert and test it. Never create an empirical premise solely because a desired conclusion requires it.

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

### 9. Separate argument failure from conclusion falsity

If a premise fails or a conclusion does not follow, mark that inferential route as failed or revise it. Search for alternative explanations or argument paths before declaring the conclusion false. A downstream conclusion may survive through a different argument, while a failed mechanism may leave a higher-order effect unresolved.

### 10. Preserve readability

Keep the public claim and explanation understandable to an ordinary chiropractor. Structured argument records provide a deeper inspection layer; they should not turn every Model page into a symbolic-logic textbook. Define technical language and state limitations in plain terms.

## Editing checklist

Before finishing a change, verify that:

- permanent Model and `ARG-###` IDs were preserved wherever possible;
- slugs are treated as routes, not semantic identities;
- dependency notes state revision impact without inferential claims;
- every relationship intended for future visualization is represented in canonical structured data rather than inferred from prose;
- no coordinates, colors, layout ranks, collapsed state, or renderer-specific identifiers were added to canonical content;
- no modal language was silently strengthened (`may` to `does`, `can` to `will`, or `some` to `all`);
- definitions do not imply existence, causal hypotheses are not treated as proof of outcomes, and normative premises remain visibly normative;
- every new or changed argument explains its inference and limitations;
- empirical entries have meaningful confidence and revision conditions; and
- tests and the production build pass.

The [v0.1 reasoning audit](model-v0.1-reasoning-audit.md) is the current worked example of applying this workflow without forcing deduction where it does not belong.
