---
id: F-003
slug: framework/explicit-reasoning-empirical-testing
title: Explicit reasoning and empirical testing
claim: >-
  Where the Model proposes that a conclusion follows from other claims, the premises and inference should be made explicit and evaluated separately from the evidence supporting empirical premises.
summary: Explicit arguments expose inferential structure while evidence independently raises or lowers confidence in empirical premises.
domain: framework
claimType: framework
status: working
confidence: not-applicable
order: 30
upstream:
  - id: F-001
    role: methodological
    note: F-001 assigns philosophy the work of exposing proposed structure and science the work of testing empirical premises; F-003 turns that division into an explicit reasoning method.
  - id: F-002
    role: methodological
    note: F-002 distinguishes validity, premise truth, and epistemic strength; F-003 applies those distinctions to argument records and revision.
related: []
version: '0.1'
updated: 2026-09-03
---

## Higher-level reasoning

Model claims can serve as premises in explicit arguments. When the Model intends a conclusion to follow deductively, all premises needed for that conclusion should be stated and the inference should be valid before evidential support is considered. “Deductive” means that the conclusion necessarily follows from the premises exactly as written, not that the conclusion is certain.

An entry may be the conclusion of one argument and a premise in another. This creates a visible reasoning hierarchy without turning dependency arrows into logical arrows.

## Lower-level empirical support

An empirical premise may be supported only probabilistically—through induction, abduction, causal or mechanistic reasoning, or another defeasible scientific method. Its support and uncertainty remain independently inspectable:

> empirical evidence → supports confidence in premises  
> premises + valid inference → entail a higher-level conclusion

Deduction does not increase the certainty of an empirical premise. Its diagnostic value is to reveal exactly where a conclusion depends on a proposition that may be uncertain, disputed, or false.

## Failure and revision

A failed argument does not by itself prove its conclusion false. It shows that this route to the conclusion has failed. A premise may be narrowed or replaced while the conclusion survives through another argument; alternatively, changes to a premise, mechanism, or inference may require downstream conclusions to be reconsidered.

Failure to find supporting evidence is not automatically evidence that a claim is false. Absence of evidence becomes evidence of absence only to the extent that the study or observation was capable of detecting the specified phenomenon under the relevant conditions.

Definitions must not smuggle empirical conclusions into the Model, and normative premises must remain visibly normative rather than being presented as deductions from scientific facts.

## Scope and language

Modal terms and quantifiers—including `can`, `may`, `sometimes`, `any`, `all`, and `under these conditions`—carry logical weight. Their populations, contexts, interventions, outcomes, and timescales must be compared before claims are linked. In particular, two existential or conditional premises cannot support a deductive chain unless the cases and conditions relevant to the inference overlap.
