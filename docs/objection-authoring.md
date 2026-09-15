# Questions, alternatives and objections

Rigor takes priority when a real conflict cannot be avoided. Precision and a charitable formulation usually make the challenge easier to evaluate without weakening it.

## Reader-facing method

Frame the issue around the proposition, the inference or the relevant alternative. Use the heading **Questions and alternative explanations**. Explain what the account currently establishes, what the question exposes, and what would require revision.

- State the strongest reasonable version of a position before assessing it.
- Identify the exact assumption or inferential step at issue. A different terminology preference is not automatically a factual contradiction.
- Describe consequences for the claim, its scope or its reasoning. Do not speculate about a practitioner's motives, intelligence, income or willingness to change.
- Prefer questions such as “Could these findings have another explanation?” or “Does this conclusion require an additional premise?” when they accurately express the issue.
- State a demonstrated problem directly. Neutral tone must not conceal a contradiction, unsupported inference or relevant contrary evidence.
- Attribute a position to a named person or tradition only when reliable source material supports that attribution. Distinguish a direct quotation, a charitable reconstruction and the Model's interpretation.
- Evaluate the Model's own preferred claims with the same standards applied to alternatives.
- A response may clarify scope or leave the issue open. Do not describe every question as resolved simply because a response has been written.

## Current record schema

`src/data/model-questions.json` contains records with permanent `Q-###` identities, exact targets, a `kind`, the reader-facing `question`, its `concern`, the current `response` and `wouldChange` consequence. Kinds are `premise`, `inference`, `scope` and `practical-bridge`. A premise question targets a statement; inference and practical-bridge questions target an argument; scope questions can target either.

All fields are required; unknown fields, duplicate IDs, missing targets and mismatched target kinds are rejected. These are editorial questions, not ASPIC+ propositions or automatically successful attacks. They have no confidence score, adoption badge or `defeats` shortcut.

Each record appears on the target's existing detail page in a native disclosure. The question remains visible and its full concern, response and revision consequence are available with or without JavaScript. Targeted records and the shared input file must be covered by the semantic review. Check whether a response faithfully addresses the strongest version of the question and preserves any unresolved issue.

## Admitting formal opposition

The canonical authoring path is implemented. Keep these layers distinct:

| Layer | Authoring location | Meaning |
| --- | --- | --- |
| Working claims and applications | `src/content/model/statements/`, `src/content/model/arguments/` | The adopted working account |
| Recorded alternative propositions | `src/content/model/alternatives/` | Exact propositions with the same statement, confidence, source and revision fields; inclusion does not endorse or assume them |
| Recorded alternative reasoning | `src/content/model/alternative-arguments/` | Concrete applications with the same argument fields; endpoints can reference either corpus and exact negations |
| Formal representation and admissions | `reasoning/opposition-bindings.json` | Exact bindings, additional starting premises and undercut designations |
| Hypothetical experiments | `reasoning/opposition-scenarios.json` and isolated tests | Explicit stipulations outside the working evaluation |

S-IDs and ARG-IDs are globally unique across both corpora. Do not give an existing proposition a new identity merely because it changes adoption. To adopt a recorded alternative, move its Markdown to the working collection, move its binding, explicitly review premise membership and update reading placement. Working records continue to reference the working collection; recorded alternative applications can reason with either collection and defend either side. All recorded applications enter evaluation, but an application produces an argument only when its premises have admitted or derived support.

Alternative argument endpoints accept `S-###` and `-S-###`. The negative form denotes the exact classical negation of the whole named proposition, including its quantifiers and scope. It creates no separately editable English paraphrase or new permanent statement identity. The renderer spells out that negation and links to the original proposition. An ordinary failure in one case does not negate an existential claim that some cases succeed. A competing mechanism can coexist with an effect claim, so record a separate proposition unless full contradiction is warranted. This preserves the existing ASPIC+ language and profile rather than inventing an unreviewed contrary relation.

The binding object has exactly `schemaVersion: 1`, `signature`, `statements`, `applications`, `ordinaryPremises`, and `undercutters`. The statement and application maps have the same shapes as `model-bindings.json` and must match the complete alternative inventories and exact canonical wording/endpoints. The additional signature accepts only the existing declaration subset; no axioms or hidden assertions are allowed.

Each additional ordinary premise is `{ literal, rationale }`. Give the actual reason for considering it as a starting assumption, its source or proposed justification, and remaining limitations. A nonblank rationale is a structural requirement, not an automated evidence appraisal. An unlisted alternative remains recorded without becoming a starting premise. Duplicate admissions, including duplication of a working premise, are rejected. Omitting an admission withdraws that starting route; it does not assert its negation.

Each undercut designation is `{ statement, rule, rationale }`, where `statement` is a signed proposition reference and `rule` identifies an existing defeasible application. Explain why that proposition challenges this inference. The designation adds no starting assumption and succeeds only through supporting arguments and the profile's attack/defeat rules. Strict targets and duplicate pairs are rejected. Rebuttal and undermining are derived from supported exact negations at eligible targets, not authored `defeats` flags. A defense can support a negation of an attacking premise or undercut an attacker's defeasible application.

The full loader joins both corpora and their explicitly admitted premises before evaluating. Alternative claims retain the runtime role `alternative`; hypothetical roles cannot be authored in these Markdown collections. No confidence, adoption or role label changes the fixed priorities. Bindings and source fingerprints appear in reproducible reports and survive the existing AIF profile round trip.

The collections are initially empty. Do not copy the synthetic test examples into canonical content or label unresolved questions as established objections. Adding a substantive position requires a charitable formulation, actual reasoning and the same semantic/evidence review as the Model's own claims.

The canonical loader clears an empty alternative collection explicitly, including after its last record is withdrawn. Astro's underlying glob loader otherwise returns before deleting cached entries for an empty glob. Build caches are local to the checkout. The production fixture test adds alternatives and then removes the final records using the same cache, checking that withdrawn content and attack context disappear.

Recorded alternatives, their premises, conclusions, explanations, source notes and revision conditions appear at `/model/alternatives/`. Relevant working statement, argument and answer pages show a conservative context set of recorded alternatives, additional assumptions and inference challenges. The working walkthrough remains a presentation of the adopted account; formal evaluation includes the complete corpus regardless of what a reader opens. The additional context is not an acceptance badge or proof that every listed challenge succeeds.

Review new or changed alternative Markdown as canonical subjects. Admission changes and undercut additions/removals propagate through previous and current support, contradiction, transposition and defense paths. Signature and shared schema changes require full review. Critical questions can target alternative records too. Run all required Model checks; the canonical authoring tests exercise undermining, rebuttal, a derived undercutter, defense/reinstatement, absent assumptions, drift and invalid targets.

To turn a substantive objection into a formal attacking argument, record its proposition separately and declare its theory role. Identify whether it challenges an ordinary premise, rebuts a defeasible conclusion, or undercuts a named defeasible application. Supply the actual starting premises and derivation. A contrary opinion does not become evidence, and recording it does not imply endorsement.

Unanswered critical questions have no universal default meaning. A scheme must specify whether an answer is a required premise, an exception, an undercutter, or an issue left for investigation. Absence of evidence is not automatically explicit negation. Keep hypothetical scenarios separately identified from the working theory.

The runtime must consider admitted opposition independently of what the selected reading path displays. Publication, omission from the walkthrough, or a reassuring response must not suppress an otherwise applicable formal attack.

## Executable hypothetical scenarios

The [current opposition audit](model-opposition-audit.md) covers the present statements and arguments. `reasoning/opposition-scenarios.json` records explicitly hypothetical full-theory scenarios, with stable IDs, exact targets, linked questions, premise removals/additions, optional named undercutters and expected statuses. `reasoning/opposition.py` validates these assumptions and preserves the working theory unchanged. `reasoning:pilot` evaluates every scenario and its AIF round trip before writing reports.

Scenario edits receive local semantic review for their named targets, changed premises, undercut rules, observed statement statuses and linked question targets. Shared loader or schema edits receive global review. Questions do not become attacks, hypothetical undercutters do not become adopted counterclaims, and an expectation must describe support under the stipulated assumptions rather than empirical truth. A claim that some effects occur is not refuted by a failed individual case. An unmet condition of a practical strategy does not itself refute that conditional strategy.
