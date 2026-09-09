# Required Model review

Every change to Model entries, structured arguments, their schemas or page templates, or their governing policy requires an updated semantic audit. The working AI agent or a human editor performs the audit; a local script checks that the recorded review covers the current files. This is a focused whole-Model check for v0.1, separate from the deferred incremental engine in [review-invalidation-plan.md](review-invalidation-plan.md).

## Review rule

**Use the statement to express the proposed truth; use confidence and evidence sections to express our justification for believing it. Retain qualifications that define scope, capacity, or necessary conditions.**

Read the exact statements first. For arguments, assume the premises as written and examine what follows before assessing their empirical support. Do not choose or invent stronger premises merely to make a desired conclusion follow. A completed review does not mean that the empirical premises are confirmed.

**Adoption is separate from evidential confidence.** Inclusion in a Model version identifies an entry or argument as part of its current working account. Unresolved support does not make an included claim unadopted, and adoption does not establish truth or inferential validity. Review this distinction in metadata, prose, and reader-facing presentation. Model and argument records have no editorial `status` property or status badges.

## Rubric for the reviewer

For every Model entry and argument, record specific findings under these five fields:

1. **`proposition`:** What is actually asserted? Identify the claim type and distinguish effects, capacities, possibilities, intentions, values, and practical decisions. For arguments, inspect the exact referenced premises and conclusion.
2. **`qualifiers`:** Explain what each material qualifier does. Does `some` limit scope, `can` assert capacity, or a condition govern action? Has an assertion become a possibility or intention merely because confidence is unresolved? Conversely, has a legitimate condition or scope limit been removed? Compare the previous and current wording; record deliberate changes in commitment.
3. **`evidenceSeparation`:** Does confidence describe justification separately from the proposition and its adoption into the Model? Does the evidence discussion match the actual claim without presenting unresolved support as established truth, falsehood, a reason to hedge the statement automatically, or a reason to treat an included claim as unadopted? Does adoption leave confidence and inference kind unchanged?
4. **`alignment`:** Do the statement, title, summary, explanation, boundaries, and revision conditions describe the same commitment? Does an argument weaken or strengthen its premises in paraphrase? Ensure revision conditions test the asserted effect rather than only its intention or a convenient surrogate. Public descriptions should explain the current account without narrating earlier drafts, edits, retained record identities, or implementation choices. Preserve substantive rationale and relevant historical source provenance; record editorial history in the review or development documentation.
5. **`inferenceAndImpact`:** Inspect direct dependencies and their limiting notes separately from arguments. Identify hidden bridges and mismatched populations, inputs, states, outcomes, or timescales. Explain why each affected downstream claim or inference changes or remains appropriate. Deductive conclusions must follow from the exact premises; methodological and practical arguments can remain defeasible even with stronger empirical premises.

Use `finding: consistent` when the content meets this rubric, even if its empirical confidence is unresolved. Use `finding: needs-revision` for an unresolved violation of this rubric, with the reason in the relevant fields. The check reports these findings distinctly from missing, malformed, or stale reviews and blocks a completed check while a `needs-revision` finding remains. Do not mark a review consistent simply to clear the gate.

### Examples the audit must distinguish

| Wording or proposed change | Review question |
| --- | --- |
| “Some changes contribute to broader benefit” → “Some changes may contribute” solely because evidence is unresolved | This weakens the empirical commitment. Restore the intended proposition or explicitly justify changing it. |
| “Some inputs produce beneficial change” → “Inputs are intended to produce beneficial change” | Intention can remain true when the effect is absent. Preserve the effect hypothesis separately. |
| “Some strategies can be modified” | `Can` asserts modifiability. Retain it when capacity is the intended proposition. |
| “When proceeding is warranted, an input is applied” | The condition governs action. Removing it changes the strategy. |
| “Some” → “all,” or “can” → “will” | Stronger scope or guaranteed outcomes require an explicit new commitment and renewed reasoning; unresolved confidence does not license them. |
| “Some inputs improve neuromotor function,” therefore broader net-positive benefit | Even assuming the premise true, the broader transfer requires a separate empirical bridge. |
| An included claim has unresolved confidence, therefore is not yet a working claim | Inclusion identifies adoption into the working Model. Assess evidence separately; do not reintroduce editorial status or upgrade confidence merely because a version is published. |

These are semantic questions, not forbidden-word rules. A keyword test cannot distinguish a capacity from uncertainty, or an appropriate practical condition from evasive wording.

## Workflow

1. Read the authoring contracts and inspect the change set, including summaries and body text. Use `git diff` and `git diff --cached` where applicable; inspect new files too.
2. Run `npm run audit:model` for review status. Run `npm run audit:model -- --packet` for a read-only JSON packet containing the full current inputs and their fingerprints. To save valid JSON without npm's command banner, use `npm run --silent audit:model -- --packet > /tmp/model-review-packet.json`.
3. Perform the rubric above across the whole Model and all structured arguments. At v0.1's size this intentionally includes unchanged entries, so revisions cannot escape review through a missing relationship. Reconsider existing findings; retain a finding only after checking that it still applies.
4. Resolve wording or reasoning violations within the authorized task, or report the specific unresolved issue. A reviewer can use the existing AI agent; no hosted service, API key, separate agent, or additional human approval is required.
5. Only after reviewing the final inputs, update `reviews/model-review.json`. Record `schemaVersion: 1`, reviewer provenance, an ISO `reviewedAt` timestamp, the packet's `inputs` map, and a `records` object keyed by every Model and argument file path. Each record has `finding` and all five nonempty rubric fields. AI reviewers identify the agent and model, stating when the exact runtime revision is unavailable.
6. Run `npm test` and `npm run build`. Both require a current completed review. Any later content or policy change requires renewed review before recording new fingerprints.

There is deliberately no command that automatically approves content or rewrites review fingerprints. The JSON record is review-only metadata; canonical claims, dependencies, and arguments remain in Markdown.

## Mechanical contract and limits

The schema-1 fingerprint is SHA-256 of each file's UTF-8 text after normalizing CRLF to LF. Paths are repository-relative and sorted. All Model and argument `.md` and `.mdx` files are included, along with `AGENTS.md`, the five authoring contracts, this policy, the audit script, `src/content.config.ts`, and the four overview/detail page templates for Model entries and arguments. Files added, removed, renamed, or edited invalidate the recorded input set. Policy, checker, schema, or template changes also invalidate it, so a presentation-only change cannot reintroduce a misleading adoption label without renewed review. The complete input set is included in the packet, and stale reports name the changed paths.

This first gate deliberately fingerprints entire files, including prose, evidence, metadata, routes, dates, and formatting. It can therefore request review for an editorial change that does not affect meaning. That conservative choice is appropriate for this small Model; field-level semantic fingerprints and incremental propagation remain deferred. Unrelated application and article changes do not invalidate this Model review.

The review JSON is excluded from the input set, so recording findings cannot invalidate its own inputs. It must contain exactly one complete record per current Model or argument file. Tests check freshness, coverage, provenance, record shape, and recorded findings; they cannot determine whether the reviewer reasoned correctly. A fresh, structurally complete but careless review can still be wrong. There is no automatic empirical appraisal, proof of validity, or guarantee that an AI catches every problem.

`npm run audit:model` reports status without blocking; `npm run audit:model -- --check` exits unsuccessfully for missing, malformed, stale, or needs-revision findings. `npm run build` invokes that check through `prebuild`, including builds invoked by `npm run deploy`. Direct invocation of `astro build` bypasses npm's gate and is not the project completion workflow. No remote CI or deployment service is configured by this change.
