# ASPIC+ migration assessment

The foundation pilot runs the current 28 statements and seven applications without changing their propositions. It checks the two declared strict deductions and uses explicit starting premises. It also introduces six neutral critical questions and a tested representation of formal attacks in synthetic scenarios.

## Dependency disposition

The existing 38 relationships have been reviewed individually. The machine-readable record in `reasoning/dependency-migration.json` preserves every original role and limiting note. Its dispositions are proposals for migration, not a second source of canonical graph meaning.

14 derive-from-existing-application; 9 requires-semantic-decision; 15 retain-explicit-semantic-use.

Relationships covered by an existing application can derive their inferential impact from that application after the shared revision index is updated. Semantic uses must remain explicit until their meaning can be recovered from a formal representation. The remaining decisions involve background rationale, scope references, professional values or conditional practical reasoning that the existing arguments do not yet encode. These cannot be converted into new arguments automatically.

The legacy `upstream` schema remains operational during this pilot. Do not delete it wholesale: that would lose information. Do not maintain its inferential duplicates permanently either. Complete the dispositions below, implement the replacement index, then retire the duplicated fields and update their reader-facing view together.

| Source | Target | Disposition | Existing application |
| --- | --- | --- | --- |
| S-001 | S-002 | retain-explicit-semantic-use | None |
| S-001 | S-003 | derive-from-existing-application | ARG-001 |
| S-002 | S-003 | derive-from-existing-application | ARG-001 |
| S-004 | S-005 | requires-semantic-decision | None |
| S-022 | S-005 | requires-semantic-decision | None |
| S-004 | S-006 | derive-from-existing-application | ARG-004 |
| S-005 | S-006 | derive-from-existing-application | ARG-004 |
| S-008 | S-009 | retain-explicit-semantic-use | None |
| S-021 | S-009 | retain-explicit-semantic-use | None |
| S-008 | S-010 | retain-explicit-semantic-use | None |
| S-021 | S-011 | retain-explicit-semantic-use | None |
| S-024 | S-011 | retain-explicit-semantic-use | None |
| S-011 | S-012 | requires-semantic-decision | None |
| S-021 | S-012 | retain-explicit-semantic-use | None |
| S-007 | S-013 | requires-semantic-decision | None |
| S-011 | S-013 | requires-semantic-decision | None |
| S-005 | S-014 | derive-from-existing-application | ARG-002 |
| S-006 | S-014 | derive-from-existing-application | ARG-002 |
| S-009 | S-014 | derive-from-existing-application | ARG-002 |
| S-027 | S-014 | derive-from-existing-application | ARG-002 |
| S-014 | S-015 | requires-semantic-decision | None |
| S-028 | S-015 | requires-semantic-decision | None |
| S-014 | S-016 | derive-from-existing-application | ARG-003 |
| S-015 | S-016 | derive-from-existing-application | ARG-003 |
| S-025 | S-016 | retain-explicit-semantic-use | None |
| S-008 | S-020 | retain-explicit-semantic-use | None |
| S-018 | S-020 | retain-explicit-semantic-use | None |
| S-021 | S-022 | retain-explicit-semantic-use | None |
| S-008 | S-023 | retain-explicit-semantic-use | None |
| S-023 | S-024 | retain-explicit-semantic-use | None |
| S-021 | S-025 | retain-explicit-semantic-use | None |
| S-024 | S-025 | retain-explicit-semantic-use | None |
| S-022 | S-026 | derive-from-existing-application | ARG-006 |
| S-025 | S-026 | derive-from-existing-application | ARG-006 |
| S-011 | S-027 | derive-from-existing-application | ARG-007 |
| S-022 | S-027 | derive-from-existing-application | ARG-007 |
| S-010 | S-028 | requires-semantic-decision | None |
| S-011 | S-028 | requires-semantic-decision | None |

## Decisions requiring substantive review

- **S-004 to S-005:** Open-ended potential does not define the professional aim or entail its legitimacy. Review whether this is background rationale, a genuine semantic use, or a missing defeasible argument.
- **S-022 to S-005:** Valuing improvement does not alone establish the professional scope of chiropractic. Keep the adopted aim explicit; do not manufacture the missing normative bridge.
- **S-011 to S-012:** The broader-transfer hypothesis uses the local-response account, but local improvement does not entail broader transfer. Resolve a scope-use relationship without inventing an inferential rule.
- **S-007 to S-013:** General neural integration does not establish principal mediation of chiropractic effects. Distinguish background rationale from a supported explanatory inference.
- **S-011 to S-013:** Local input-caused improvement does not establish neural primacy for broader outcomes. The response vocabulary can be a semantic use; the stronger empirical claim needs independent support.
- **S-010 to S-028:** A general perturbation capacity cannot establish chiropractic realization. Preserve the mechanism vocabulary separately from the specific empirical hypothesis.
- **S-011 to S-028:** The mechanism statement includes the joint effect claim. Review its formal implication in the reverse direction before adding any inference; mechanism and effect evidence remain independent.
- **S-014 to S-015:** Application requires a warranted-to-proceed condition and a practical bridge. Those conditions cannot be supplied by the dependency arrow or by assessment alone.
- **S-028 to S-015:** A proposed mechanism can guide intended application without proving it works. Any practical inference needs its explicit action conditions and normative bridge.

## Schema migration sequence

1. Preserve `S-###` identities and public routes. Give proposition/rule versions immutable evaluation identity through explicit snapshot hashes.
2. Map each current `ARG-###` to its concrete inference application. Introduce reusable rule templates only when a real generalization is intended and reviewed. The pilot already preserves distinct named rules with identical endpoints.
3. Resolve each relationship above. Keep narrowly specified non-inferential semantic uses. Author new inferences only when their exact premises and bridge can be defended; independent empirical hypotheses can remain explicit starting assumptions.
4. Extend canonical content for substantive alternative propositions and named defeasible rules when they are authored. Keep adoption, corpus role, premise membership, confidence and computed status separate. Questions alone do not populate this opposing corpus.
5. Derive revision candidates through supporting applications, contrary propositions, undercut targets, rule/profile changes and semantic uses. Continue complete evaluation and whole-Model review until any incremental optimization is proved to preserve the relevant result.
6. Replace the legacy dependency presentation and remove redundant authored fields in the same change. Preserve all existing limiting notes in the migration record and carry substantive limits into the appropriate canonical explanation.
7. Add question-specific navigation after those relationships are authoritative. Keep the existing walkthrough as a presentation option; its sequence never controls the engine.

## Pilot conclusions and remaining limits

The current deductions pass under their reviewed quantified representation. Existential occurrence, the same causal event and the same scope/context/interval are preserved. The practical argument remains defeasible and supplies no arbitrary individual indication. Those results do not settle the nine substantive relationship decisions above.

The implemented engine profile deliberately rejects productive inference cycles. It supports attack cycles and unproductive support cycles without inventing premises. A future productive cyclic theory requires a reviewed capability extension rather than deleting paths. The formal bindings explicitly identify 22 opaque propositions; only the six statements needed by the existing deductions currently have quantified internal structure.

This foundation is ready for review as a pilot. Full schema migration and a complete substantive opposition audit are distinct remaining work. The branch must not be described as a fully completed Model migration or merged on that basis.
