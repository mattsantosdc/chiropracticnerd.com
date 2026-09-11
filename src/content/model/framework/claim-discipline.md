---
id: M-002
slug: framework/claim-discipline
title: Different kinds of claims require different support
claim: >-
  Definitions, empirical claims, value judgments, strategies, and conclusions must be identified and evaluated according to their kind, with logical validity kept distinct from premise truth and evidential strength.
summary: The Model separates what follows logically, whether premises are true, and how strongly evidence justifies accepting empirical claims.
domain: framework
claimType: framework
confidence: not-applicable
order: 20
upstream:
  - id: M-001
    role: methodological
    note: M-002 operationalizes M-001's division of labor by requiring support and evaluation appropriate to each kind of claim.
related: []
version: '0.1'
updated: 2026-09-08
---

## Three separate evaluations

When a conclusion is presented deductively, the Model distinguishes:

- **Validity:** whether the conclusion necessarily follows if the premises are true.
- **Soundness:** whether the argument is valid and its premises are in fact true.
- **Epistemic strength:** how strongly the available evidence justifies accepting an empirical premise or conclusion.

A valid argument can have a false or poorly supported premise. A well-supported empirical premise can occur inside an invalid argument. Neither logical validity nor current acceptance of a premise converts uncertainty into truth.

Because empirical premises are commonly uncertain, an argument must not be described as sound merely because its premises are currently accepted. When the truth of an empirical premise is uncertain, the argument's soundness is unresolved; the premise's confidence and evidential support must be described separately.

## Claim kinds remain visible

A definition stipulates or clarifies meaning; it does not prove that the defined phenomenon exists. An empirical claim is answerable to observation. A value judgment identifies what matters or ought to be pursued without masquerading as a scientific result. A strategy proposes what to do and remains open to revision even when its background science is strong. A mixed claim must expose its different parts rather than borrow support across categories.

Every Model entry therefore carries a stable ID, claim type, confidence, version, revision conditions where applicable, and explicit dependencies. Inclusion in a version identifies the Model's current working position; it does not establish empirical truth or evidential strength. An unresolved claim can be an adopted working claim. Structured arguments record the Model's current inferential routes separately, with their reasoning and premise support open to examination. Supporting prose should distinguish direct evidence, defeasible scientific inference, logical consequence, practical observation, and speculation whenever that distinction matters.

## Conflicts clarify

The point is to locate disagreement. Two people may accept the same evidence but value different outcomes, share a purpose but dispute a mechanism, accept every premise but reject the inference, or use the same word for different concepts. The architecture should reveal that fork instead of hiding it inside a debate over conclusions.
