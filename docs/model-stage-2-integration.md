# Stage 2: organismic and regulatory integration

Implemented on `model-v0.1-statements-and-reasoning` from inspected Stage 1 commit
`2af856fbf9f542940b66378fa0a04157cc4f1103`. The working tree was clean. The baseline had
16 statements (`S-001`–`S-016`), four arguments (`ARG-001`–`ARG-004`), 23 direct revision
dependencies, and one stored related pair. The next unused IDs were allocated without
renumbering: the integrated account has 20 statements, five arguments, 25 dependencies,
and two related pairs.

## Preservation and additions

No existing canonical proposition changed. In particular, S-004 before and after is
“Human functional potential is open-ended.” Its bounded framework meaning, summary,
revision condition, and downstream role are preserved. All existing definitions,
statement types, confidence values, slugs, orders, references, and dependency notes remain
unchanged. No statement was split or removed. All four existing argument files are
unchanged, including ARG-004's S-004 + S-005 → S-006 route.

The four starting propositions supplied for this stage are adopted verbatim as empirical
Science statements, with unresolved confidence and separate evidence and revision
conditions. Their explanations refine scope without changing those propositions:

| New record | Missing function and boundary |
| --- | --- |
| S-017, `organismic-organization.md` | Active organismic maintenance and adaptation, with a brief definition of functional organization. No infallible intelligence, universal self-healing, guaranteed improvement, or neural claim about all organisms. |
| S-018, `information-in-neural-regulation.md` | Sensory information and prior experience in estimating body and environmental conditions. Internal and external sensing and nonconscious experience are included; a single comprehensive internal model is not required. |
| S-019, `regulatory-limits-and-demands.md` | Separately identifies incomplete information, limits on feasible responses, and competing demands. These are not all causes of sensory uncertainty and do not establish a better available response. |
| S-020, `sensory-updating-and-reorganization.md` | Introduces ordinary sensory updating and capacity for strategy reorganization before relying on S-010's specific trigger. Reuses S-008's neuromotor and motor-strategy definitions; updating an estimate is not itself a changed strategy. |
| ARG-005, `regulatory-rationale-for-functional-potential.md` | A defeasible biological rationale for the existing S-004 framework commitment. Does not prove unlimited potential, beneficial modifiability, or chiropractic responsiveness. |

S-008 already supplies context sensitivity and limited or poorly suited strategies. S-009
already asserts beneficial modification in some cases. Neither needs a competing
comparative-fit statement. S-020's two processes remain distinguishable within one record:
the new argument uses their combined account and does not require separately addressable
conclusions. No existing compound statement creates a reasoning problem requiring a split.

## Existing content touched

Only four existing statement bodies and their `updated` dates changed:

| Statement | Contextual edit and reason |
| --- | --- |
| S-004 | “The Model begins with a philosophical commitment about how to regard human possibilities.” becomes “The Model adopts a philosophical commitment about how to regard human possibilities.” “This is a framework-level starting point” becomes “This is a framework commitment.” Adds a short explanation of ARG-005 and its limits. The biological introduction makes first-position language unnecessary; the commitment itself is unchanged. |
| S-005 | “S-004 supplies the open-ended potential for that improvement.” becomes “S-004 frames the possibilities addressed by this aim as open-ended; it does not establish that improvement is available in a particular case.” This clarifies framework versus empirical support without changing the aim or benefit criterion. |
| S-007 | Replaces “begins the biological account” with the human neural account within S-017's broader organismic context. Adds that neural integration is an additional empirical premise, independent of S-017 and S-004. Its central integrative role and whole-person boundary are unchanged. |
| S-010 | Adds an opening paragraph distinguishing ordinary sensory updating in S-020 from the specific salient neurobiomechanical perturbation hypothesis. The perturbation definition, salience requirement, capacity assertion, confidence, evidence status, and revision conditions are unchanged. |

S-001–S-003 retain the method; S-006 retains the difference between considering care and
justifying an input; S-008 retains its full contextual account and definitions; S-009
retains constraint, opportunity, and beneficial modifiability. S-011–S-013 retain their
separate chiropractic-effect, broader-benefit, and principal-mediation commitments.
S-014–S-016 retain working assessment, conditional application, reassessment, missed
opportunities, withholding, and stopping. All were reconsidered, not merely left unread.

README and the dependency contract now describe the current inventory and rationale.
The authoring contract clarifies that analytical order does not prescribe putting all
Philosophy before Science. Historical audits, migration documents, and published articles
are preserved. Schemas, collections, helpers, templates, sorting behavior, and bare
`S-###` comment keys are unchanged. Arguments have no `order` field in the existing
schema; ARG-005 uses the existing argument sorting behavior.

## Reasoning and circularity

The proposed conclusion was S-004 with its existing bounded meaning. Before consulting
the new sources, the route was exposed as the following joint premises, in this order:

| Canonical premise | Function in ARG-005 |
| --- | --- |
| S-017 | Organismic maintenance and adaptation |
| S-007 | Additional human neural integration premise |
| S-018 | Sensory information and experience in estimation |
| S-019 | Incomplete information, feasible-response limits, and competing demands |
| S-008 | Context-dependent strategies, including limited or poorly suited strategies in some circumstances |
| S-020 | Updating estimates and capacity for sensory-driven reorganization |

Conclusion: **S-004**. Inference kind: **defeasible**. Scheme: **biologically informed
framework reasoning**. The exact statements are resolved from canonical IDs on the
argument page, rather than replaced with stronger paraphrases.

The interpretive bridge favors assessing functional possibilities across circumstances
and purposes instead of identifying completion from health or symptom status alone.
This is an explicit, revisable framing principle. The biological premises do not mention
every health-status interpretation or entail that improvement is possible in every case.
Maintenance without further improvement and a locally best feasible response are compatible
with them. The argument motivates the framework choice without presenting its rationale
as a deduction or an empirical proof.

Circularity was inspected in the prose and in both structured layers. S-004 informs
S-005's possibilities, and S-005 supplies S-009's benefit criterion. Using S-009 to justify
S-004 would therefore risk circular justification. ARG-005 uses neither S-009 nor S-005,
S-006, or the downstream chiropractic-effect/practice commitments. Its six premises have
no incoming justification from S-004 or those downstream commitments. The existing
ARG-004 → ARG-002 → ARG-003 progression keeps its normative and practical bridges;
ARG-001 remains an independent methodological synthesis. Explanatory cross-references
from foundational boundaries to downstream limits supply no reverse support.

## Revision dependencies and reading sequence

The only new dependencies are S-018 → S-020 and S-008 → S-020, both conceptual, with
specific limiting notes. They identify the meanings of estimates and neuromotor strategies
whose revision would change what S-020 says updates or reorganizes. A see-also pair stored
on S-020 connects it with S-010 for comparison; it asserts no support or mechanism edge.

ARG-005's premise participation is recorded in the argument itself. No empirical
dependency is imposed on S-004: changing that biological rationale reopens ARG-005 without
necessarily changing the independent framework meaning. S-007, S-008, S-017, S-018,
and S-019 remain independently testable premises. Their explanatory progression is not
a chain of entailments or revision dependencies. The two new dependencies do not create
a return route from S-004, and no existing edge was removed to conceal a cycle.

Suggested conceptual route, after the S-001–S-003 method orientation:

`S-017 → S-007 → S-018 → S-019 → S-008 → S-020 → ARG-005 → S-004 → S-005 → ARG-004 → S-006 → S-009 → S-010 → S-011 → S-012 / S-013 → ARG-002 → S-014 → S-015 → ARG-003 → S-016`

These arrows describe a suggested reading sequence only. S-012 and S-013 are separate
branches, not requirements for S-014. This documentation creates no runtime path
configuration. New Science orders 5, 12, 14, and 25 place the additions sensibly among
existing records without changing any existing order or moving empirical claims into
Philosophy. An explicit reading path and integrated interface remain Stages 4 and 5.

## Evidence status and outstanding work

After inspecting the reasoning, the bounded source check read Körding and Wolpert (2004)
and Shadmehr and Mussa-Ivaldi (1994), including their tasks, findings, and alternative
explanations. Bibliographic records were cross-checked against publisher/indexed entries;
accessible full text is linked from S-018 and S-020. The statement pages carry the limited
appraisals. No new source supports a chiropractic effect. This is not a comprehensive
literature review, reanalysis, or empirical confirmation of the four broad premises.
S-017 and S-019 still lack claim-specific appraisals of their full scope. All new confidence
assessments remain unresolved; adoption is explicit through inclusion and does not depend
on confirmation. Existing sources and their limited scope are preserved.

The following stronger conclusions remain unavailable:

- Incomplete information does not establish a better feasible strategy; poor fit does not
  establish an accessible alternative. S-009's additional empirical burden remains.
- Modifiability or reorganization does not establish net-positive modification. Stage 3
  should specify context, outcomes, tradeoffs, and timescales for applying the existing
  benefit criterion without inventing a universal optimization score.
- “Some” opportunities and “some” chiropractic responses need not occur in the same
  people or conditions. Stage 3's benefit synthesis must expose that overlap requirement,
  input causation, selection validity, and duration rather than assume them.
- General sensory learning does not establish S-010's salience conditions or S-011's
  chiropractic instantiation. These require prospective mechanism and effect tests.
- Neither the foundation nor S-004 establishes that every symptom-free person benefits
  now. A universal chiropractic-benefit claim is a separate decision and is not adopted.
- Stage 3 should clarify adjustment and success terminology without defining success into
  existence, excluding unsuccessful inputs retrospectively, or discarding the assessment
  and non-intervention boundaries already stated in S-014–S-016.
- Broader transfer in S-012, principal mediation in S-013, reliable assessment, and useful
  reassessment remain independent empirical questions. The new rationale supplies none
  of their missing evidence or person-level bridges.

## Review and validation

The required whole-Model semantic review is recorded in `reviews/model-review.json` for
the final packet, including all 20 statements and five arguments. Review findings concern
propositions, qualifiers, evidence separation, alignment, and inference/revision impact;
fingerprints and structural tests do not establish empirical truth or logical validity.

Validation completed on 2026-09-12: `npm run audit:model`, `npm test`, `npm run build`,
and `npm run test:routes` all passed; the production build generated 30 pages.
Existing collection and route checks derive their inventories from canonical content,
so no count fixtures or structural tests required alteration. A separate baseline
comparison confirmed all 16 existing frontmatters unchanged except four dates and all
four original arguments byte-identical. `git diff --check` passed.

Inspected rendered HTML for S-017, S-018, S-020, S-004, ARG-005, and ARG-004: exact
propositions, classifications, confidence, evidence/revision sections, and relationship
links render under the existing templates. ARG-005 resolves all six premises in the
authored order and S-004 as its conclusion; S-004 exposes both its new incoming rationale
and preserved ARG-004 premise role. The route suite also checks every statement and
argument page and all built internal page/fragment links. No visual interface redesign,
merge, or deployment is included.
