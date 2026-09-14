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

To turn a substantive objection into a formal attacking argument, record its proposition separately and declare its theory role. Identify whether it challenges an ordinary premise, rebuts a defeasible conclusion, or undercuts a named defeasible application. Supply the actual starting premises and derivation. A contrary opinion does not become evidence, and recording it does not imply endorsement.

Unanswered critical questions have no universal default meaning. A scheme must specify whether an answer is a required premise, an exception, an undercutter, or an issue left for investigation. Absence of evidence is not automatically explicit negation. Keep hypothetical scenarios separately identified from the working theory.

The runtime must consider admitted opposition independently of what the selected reading path displays. Publication, omission from the walkthrough, or a reassuring response must not suppress an otherwise applicable formal attack.

## Executable hypothetical scenarios

The [current opposition audit](model-opposition-audit.md) covers the present statements and arguments. `reasoning/opposition-scenarios.json` records explicitly hypothetical full-theory scenarios, with stable IDs, exact targets, linked questions, premise removals/additions, optional named undercutters and expected statuses. `reasoning/opposition.py` validates these assumptions and preserves the working theory unchanged. `reasoning:pilot` evaluates every scenario and its AIF round trip before writing reports.

Scenario edits receive local semantic review for their named targets, changed premises, undercut rules, observed statement statuses and linked question targets. Shared loader or schema edits receive global review. Questions do not become attacks, hypothetical undercutters do not become adopted counterclaims, and an expectation must describe support under the stipulated assumptions rather than empirical truth. A claim that some effects occur is not refuted by a failed individual case. An unmet condition of a practical strategy does not itself refute that conditional strategy.
