# Required Model review

Every Model change requires current review coverage. Semantic review is incremental by default: reconsider changed records and their derived impact, retaining unaffected findings and provenance. Editorial documentation changes require review of the changed documents, not automatic reconsideration of every Model record. The working AI agent or a human editor performs the review; the local checker verifies its input identity and coverage. The [review impact contract](review-invalidation-plan.md) defines the implemented scope calculation. Semantic and implementation changes still receive complete formal evaluation and automated integrity checks.

## Editorial documentation changes

Removing obsolete reports, correcting links or formatting, and updating descriptions to match unchanged behavior do not require a whole-model review. Inspect the exact diff and confirm that current requirements, interpretations, scope, evidence boundaries and unresolved questions are preserved. A change to an actual governing rule or the Model's meaning is substantive even when it appears only in Markdown; use the ordinary impact plan, including global review for shared semantic policy. If the distinction is uncertain, use that ordinary plan.

Unregistered documentation, such as README or historical reports, needs no review-ledger update. Registered `docs/*.md` files and `AGENTS.md` remain fingerprinted. The planner reports `documentationOnlyCandidate: true` when only these inputs changed and subjects and relationships are unchanged. This is a candidate for editorial review, not an automatic semantic classification; the default plan stays conservative until a reviewer records the classification.

After inspecting the changes, write an attestation JSON file with `classification: "editorial-only"`, an ISO `reviewedAt`, normal `reviewer` provenance, and a nonempty `changes` array. Each entry contains:

- `path`: the exact changed registered document;
- `before`: its fingerprint in `reviews/model-review.json`, or `null` if absent;
- `after`: its fingerprint in the current `--packet`, or `null` if removed;
- `reason`: a specific explanation of why the change preserves the governing meaning.

Then run `npm run audit:model -- --record-docs-review /tmp/docs-review.json`. The command validates the exact before/after set and existing review coverage, records the attestation in `documentationReviews`, and carries the findings forward onto the current input bases. It preserves every finding, its reviewer and timestamp, and the whole-model review attestation. This records the reviewer's judgment; it does not infer semantic equivalence from prose or write findings automatically. A working AI agent can perform and record this review without additional user approval.

The command rejects mixed code, canonical content, binding, question, reading-data or relationship changes, incomplete or adverse findings, and overdue whole-model coverage. Subsequent document edits require a new attestation. An explicit whole-model request, release review or periodic review is not satisfied by editorial bookkeeping. Removing a registered file also requires changing the registry code and therefore follows the ordinary implementation-review path.

For an editorial documentation-only change, check local links and anchors, run `git diff --check`, and run `npm run audit:model -- --check` when registered inputs changed. The reasoning suite, site build, route checks and browser checks need not be repeated solely for editorial documentation. Changes to the checker or other implementation still require the full applicable automated suite.

## Review rule

**Use the statement to express the proposed truth; use confidence and evidence sections to express our justification for believing it. Retain qualifications that define scope, capacity, or necessary conditions.**

Read the exact statements first. For arguments, assume the premises as written and examine what follows before assessing their empirical support. Do not choose or invent stronger premises merely to make a desired conclusion follow. A completed review does not mean that the empirical premises are confirmed.

**Adoption is separate from evidential confidence.** Inclusion in the canonical working statement and argument collections identifies adoption into that account. Critical questions and separately recorded alternative or hypothetical theory roles do not adopt their suggested propositions merely through repository inclusion. Unresolved support does not make an included claim unadopted, and adoption does not establish truth or inferential validity. Review this distinction in metadata, prose, and reader-facing presentation. Statement and argument records have no editorial `status` property or status badges.

## Rubric for the reviewer

For every statement and argument requiring review, record specific findings under these five fields. Read upstream premises as context when needed without automatically invalidating their own reviews:

1. **`proposition`:** What is actually asserted? Identify the statement type and distinguish effects, capacities, possibilities, intentions, values, and practical decisions. For arguments, inspect the exact referenced premises and conclusion.
2. **`qualifiers`:** Explain what each material qualifier does. Does `some` limit scope, `can` assert capacity, or a condition govern action? Has an assertion become a possibility or intention merely because confidence is unresolved? Conversely, has a legitimate condition or scope limit been removed? Compare the previous and current wording; record deliberate changes in commitment.
3. **`evidenceSeparation`:** Does confidence describe justification separately from the proposition and its adoption into the Model? Does the evidence discussion match the actual claim without presenting unresolved support as established truth, falsehood, a reason to hedge the statement automatically, or a reason to treat an included claim as unadopted? Does adoption leave confidence and inference kind unchanged?
4. **`alignment`:** Do the statement, title, summary, explanation, boundaries, and revision conditions describe the same commitment? Does an argument weaken or strengthen its premises in paraphrase? Ensure revision conditions test the asserted effect rather than only its intention or a convenient surrogate. Public descriptions should explain the current account without narrating earlier drafts, edits, retained record identities, or implementation choices. Preserve substantive rationale and relevant historical source provenance; record editorial history in the review or development documentation. Inspect reading-section titles and introductions, optional/supporting placement, canonical text resolution, and primary locations too. Neighboring steps must not imply new premises or downgrade adopted supporting records. Check visible propositions, disclosed explanations and sources, exact repeated premises, all participation links, and dependency empty states. Inspect the interface at desktop and mobile widths and with JavaScript disabled; mechanical content checks alone cannot establish readability. Check shared naming, acknowledgment, and authorship presentation too: neither a name nor historical continuity establishes coherence, validity, or empirical truth. Keep general credit brief and prominent, with specific attribution at the relevant claims.
5. **`inferenceAndImpact`:** Inspect additional `semanticUses` and their limiting notes separately from arguments and their derived revision influence. Identify hidden bridges and mismatched populations, inputs, states, outcomes, or timescales. Explain why each affected downstream claim or inference changes or remains appropriate. Check all indexed argument participation, joint premise order, conclusions, and forward-reference diagnostics independently of reading order and dependency topology. Deductive conclusions must follow from the exact premises; methodological and practical arguments can remain defeasible even with stronger empirical premises.

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

1. Inspect the diff, new and removed files, and the governing contracts. Run `npm run audit:model -- --plan` for the required record list, retained records, changed inputs and explanatory paths. Paths identify whether each relationship came from the previous graph, current graph or both. Use `--full` with `--plan` when a whole-model review is warranted.
2. Run `npm run --silent audit:model -- --packet > /tmp/model-review-packet.json` for exact sources, file fingerprints, the current impact snapshot and expected per-record bases. This is read-only. It does not approve or modify anything.
3. Apply the five-field rubric to each required record. Inspect its actual premises, conclusion, explanations and affected semantic uses. A flag means reconsider the record, not change its proposition automatically. An alternative argument can preserve a conclusion even if another route fails. Preserve every unaffected record, including its reviewer and timestamp, verbatim.
4. Review changed shared inputs and any changed bookkeeping inputs even when they require no canonical-record reconsideration. Resolve violations within the authorized task or record `needs-revision`. The current working agent may review; no separate human approval or hosted service is needed.
5. Only after that review, record the schema-2 envelope described below. Copy `packet.bases[path]` only for records actually reviewed; the explicit editorial documentation workflow above is the sole exception for carrying existing findings onto new document fingerprints. Updating the outer snapshot and file list alone leaves affected per-record bases stale and fails the gate. A basis must never be refreshed to disguise an unperformed review.
6. Run `npm test`, `npm run test:reasoning`, `npm run reasoning:pilot`, `npm run build`, and `npm run test:routes`. Run browser checks when presentation changes. These automated checks remain complete, regardless of the smaller semantic review set. Questions are reviewed on their targets under [objection-authoring.md](objection-authoring.md). If a later edit changes the inputs, obtain a new plan before recording further findings.

## Review envelope

`reviews/model-review.json` contains:

- `schemaVersion: 2`, `reviewedAt`, and `reviewer` for the most recent review transaction. This timestamp does not claim that every record was re-reviewed.
- `inputs`: the exact current whole-file fingerprints, and `snapshot`: the exact current derived units, subject identities and typed edges from the packet.
- `records`: exactly one entry per current canonical file. Each entry contains `finding`, the five rubric fields, its own `reviewedAt` and `reviewer`, and its `basis` from the packet. AI provenance includes the model, or explicitly states when its exact runtime identity is unavailable.
- `wholeModelReview`: the timestamp, reviewer and exact input fingerprints of the latest completed whole-model examination. Incremental reviews do not refresh this attestation.
- Optional migration history outside the fingerprinted inputs, preserving the former review's provenance and source identity.
- Optional `documentationReviews`: exact editorial change attestations with reasons and reviewer provenance. These carry existing findings forward without claiming another whole-model examination.

## Scope and whole-model reviews

Changes to a statement's meaning, summary, body, evidence, qualifiers or relationship data propagate through the review graph. Changes limited to dates or source formatting still require local inspection. Purely editorial JSON serialization does not propagate into canonical findings, but its changed file remains a reviewed input. Reading sections and editorial questions target their actual displayed or challenged records, without changing inference semantics. Hypothetical opposition scenarios target their explicitly affected records and linked questions locally; they never alter working-theory graph edges.

Substantive changes to shared authoring policy, schemas, profile, formal signature, engine implementation and shared rendering code invalidate all record bases. Editorial documentation changes can preserve existing findings through the explicit workflow above. The checker also requires a whole-model examination at least every 90 days. Perform one before a Model-version release and whenever an omitted relationship or broad restructuring makes the index insufficient. The 90-day check occurs when project commands run; it is not a scheduler. `--full` requests a full plan and does not record completion.

A global change warrants inspecting all records under that change. It does not require repeating unrelated empirical research. A whole-model examination also looks for missing relationships, since no index can follow an unrecorded use.

## Mechanical contract and limits

Whole-file fingerprints use SHA-256 after normalizing CRLF to LF. Canonical `.md` and `.mdx` files are discovered recursively in all four exact working and alternative statement/argument directories. `policyPaths` in `scripts/model-audit.mjs` lists shared production and governing inputs explicitly. Add any new input capable of changing the presented or evaluated account to that registry and provide a reviewed impact adapter where local scoping is appropriate. Unclassified registered inputs are global. Unknown formal-binding capabilities fail visibly instead of being ignored.

The schema-2 basis is a deterministic hash of the record identity, relevant input-unit fingerprints and relevant typed edges. It is flat and nonrecursive, so cycles terminate and no review hashes itself. The exact scope rules are in [review-invalidation-plan.md](review-invalidation-plan.md). The prior snapshot is retained until the new review is recorded, allowing additions, deletions, retargeting and removed paths to appear in the plan. Each record's basis independently prevents an outer snapshot refresh from certifying stale findings.

The review file is excluded from its own inputs. There is no automatic semantic approval, finding writer, empirical appraisal or assertion that a fresh review proves validity. The documentation recorder only carries existing findings forward after an explicit editorial attestation. A reviewer can still reason incorrectly. Source and graph identity are auditable; semantic judgment remains the reviewer's responsibility.

`npm run audit:model` reports freshness and review scope; `--plan` emits JSON explanations, `--packet` includes sources and expected bases, and `--check` fails for missing, malformed, stale, overdue or `needs-revision` coverage. npm tests and the `prebuild` hook enforce the gate. Calling Astro directly bypasses npm's workflow and is not the project's completion procedure. CI runs the full review, reasoning, build and route checks; it does not merge changes. The user will handle the eventual merge manually.

Reading-path runtime validation is independent of fingerprint freshness. The overview resolves the path during the build and throws for malformed shape, references, placements, or coverage even if review fingerprints are current. Nonfatal forward-reference diagnostics need editorial inspection; they are not logical invalidity findings. No command approves a malformed path.
