# Reasoning review and invalidation plan

The Model is intended to change without allowing the effects of a revision to disappear into an
untracked manual process. This document records a future system for detecting which statement,
dependency, and argument reviews have become stale; directing a human or AI-assisted review to
the affected material; and stopping propagation when a reviewed downstream claim remains
unchanged.

The incremental system described below remains deferred. A focused [Model review](model-review.md) now addresses recurring drift between propositions and confidence: the working AI agent or editor reviews the whole Model, records findings outside canonical content, and npm tests and builds reject stale or incomplete reviews. That small gate uses whole-file fingerprints, including formatting and metadata, rather than the field-level and incremental design below. The structural validators remain independently authoritative.

## Architecture decision

Use cryptographic content fingerprints as evidence that a review examined exact inputs, not as
evidence that a claim is true or an argument is valid or sound.

The future system must keep two dimensions separate:

- **Freshness** is mechanical. A review is `fresh` when its recorded input fingerprints match the
  current canonical inputs and `stale` when any relevant input no longer matches.
- **Finding** is editorial. A current review may accept the material, identify concerns, reject an
  inferential route, or leave a question unresolved. The precise finding vocabulary will be fixed
  before implementation.

A fresh review can therefore contain an adverse or unresolved finding. Conversely, a stale review
cannot support publication merely because its previous finding was favorable.

This separation preserves the existing contracts:

- a revision dependency says that changing an upstream statement requires reconsidering a downstream
  statement; it does not assert inferential support;
- an argument records one specified inferential route; failure of that route does not establish
  that its conclusion is false;
- evidence changes justification for an empirical premise independently of whether an inference
  is valid; and
- neither a hash nor an AI review substitutes for empirical evidence or editor-curated
  natural-language reasoning.

## Review subjects

The current whole-Model rubric explicitly checks whether uncertainty has been put into the proposition instead of its confidence assessment. It also checks retained scope, capacity, and action conditions, alignment across statements and explanations, and the exact premises used in arguments. Preserve these checks when implementing the more granular subjects below; automated keyword bans cannot perform this semantic review.

The system should track three distinct kinds of review.

| Review subject | Inputs that must remain current | Question answered |
| --- | --- | --- |
| Statement | The statement's meaning-bearing canonical content | Has the claim been classified, scoped, explained, and qualified according to the authoring contract? |
| Direct dependency | The upstream and downstream statement fingerprints plus the dependency role and note | Given the upstream statement as currently written, does the downstream statement still retain its intended meaning and content, or must it be revised? |
| Structured argument | The argument record plus the exact proposition fingerprints of every premise and its conclusion | Does this inferential route remain appropriately classified and explained for the claims exactly as written? |

The dependency-review question must not be replaced with “does the upstream claim prove the
downstream claim?” Dependencies and arguments remain independent even when the same statements
participate in both layers.

Argument review should examine validity for a deductive route and the stated reasoning,
defeaters, assumptions, and limitations for a defeasible route. It should not collapse premise
truth, evidential confidence, and inferential quality into a Boolean `sound` field.

## Fingerprint design

The initial implementation should use SHA-256 or a comparably stable cryptographic digest over a
versioned, canonical serialization. The choice of hash algorithm is less important than defining
the reviewed payload precisely and reproducibly.

At minimum, distinguish these payloads:

- a **record fingerprint** for the meaning- and evaluation-bearing content of a statement;
- a **proposition fingerprint** for the permanent statement ID, exact proposition, and reasoning-relevant
  classification used when the statement is a premise or conclusion; and
- an **argument fingerprint** for the argument's identity, premise and conclusion IDs, inference
  kind, scheme, summary, and explanatory prose.

The final field lists must be documented and tested before they become a publication contract.
The first implementation should be conservative: a potentially substantive change should create
a stale review even when that occasionally causes unnecessary reconsideration.

Canonicalization should normalize representation details such as line endings, Unicode form, and
object-key order. It should avoid treating presentation-only changes such as a reordered
frontmatter object as substantive. Mutable routes, display ordering, and an `updated` timestamp
should not silently become logical inputs merely because they occur in the same file.

Fingerprints must be intrinsic rather than recursive. A statement's fingerprint must not contain the
fingerprints of all of its upstream statements. Instead, a review attestation records the independent
fingerprints of its subject and inputs. This prevents review bookkeeping from changing canonical
content, avoids artificial cascades when an attestation is refreshed, and remains workable when
argument topology contains cycles.

Review attestations must also be excluded from the semantic payload they attest. Otherwise,
updating a recorded upstream hash would change the downstream hash and invalidate unrelated
reviews despite no change in the downstream claim.

## Review attestations

A version-controlled attestation should record enough information to determine freshness and
audit how the finding was reached. Its conceptual fields are:

```ts
type ReviewAttestation = {
	reviewId: string;
	subjectKind: 'statement' | 'dependency' | 'argument';
	subjectId: string;
	subjectFingerprint: string;
	inputFingerprints: Record<string, string>;
	fingerprintSchemaVersion: string;
	reviewPolicyVersion: string;
	reviewer: {
		kind: 'human' | 'ai' | 'human-with-ai-assistance';
		identifier: string;
	};
	reviewedAt: string;
	finding: string;
	summary: string;
	issues: string[];
};
```

This is an illustrative interface, not a committed content schema. Before implementation, decide
whether attestations belong in one ledger, one sidecar per subject, or another review-only
location. They should not be embedded in canonical Model and argument Markdown unless they can be
strictly separated from semantic hashing and reader-facing content.

The attestation should identify the review rubric or prompt version. A materially changed review
policy may intentionally make older attestations stale even when the content has not changed. AI
reviews should additionally record the model identifier and relevant execution metadata, without
assuming that identical inputs guarantee identical prose output.

## Invalidation and propagation

The system should operate as an incremental work queue rather than blindly invalidating the
entire transitive closure forever.

1. Compute current intrinsic fingerprints and compare them with committed attestations.
2. Mark a statement's own review stale when its record fingerprint changes.
3. Mark a dependency review stale when either endpoint, its role, or its explanatory note no
   longer matches the attested inputs.
4. Mark an argument review stale when the argument record or any referenced premise or conclusion
   claim no longer matches the attested inputs.
5. Add every directly affected downstream dependency to the review frontier.
6. If reconsideration leaves the downstream statement unchanged, refresh that dependency attestation
   and stop propagation along that branch.
7. If reconsideration changes the downstream statement, recompute its fingerprints and apply the same
   process to its statement review, incident dependencies, and referencing arguments.
8. If an argument review finds that a route fails, record or resolve the failure for that argument.
   Do not change or invalidate the conclusion automatically; another route may support it, or its
   evidential support may remain unresolved.

For example, changing S-011 would make the S-011 → S-012, S-011 → S-013, S-011 → S-014, and
S-011 → S-015 dependency reviews and the ARG-002 argument review stale. These direct branches must each be
reviewed. If S-014 is reconsidered and remains unchanged, propagation through S-014 stops; that
does not clear the independent reviews of S-012, S-013, or S-015. If
S-014 must be edited, its new fingerprint makes the S-014 → S-015 and S-014 → S-016 dependency
reviews stale, makes ARG-002 stale because S-014 is its conclusion, and makes ARG-003 stale because
S-014 is one of its premises.

During review, the interface may distinguish a definitely stale subject from a potentially
affected descendant waiting behind the current review frontier. The final status should be
derived from current fingerprints and attestations rather than maintained as duplicative mutable
flags.

## AI-assisted review

AI can make the workflow semi-automatic, but it should produce an inspectable review result rather
than silently certifying or rewriting canonical content.

For each queued subject, provide a structured packet containing only the relevant exact inputs:

- the previous and current wording or a precise change set;
- the full current upstream and downstream claims for a dependency review;
- the dependency role and limiting note;
- every exact premise and conclusion for an argument review;
- the argument's inference kind, scheme, assumptions, explanation, and limitations; and
- the applicable authoring checklist and review-policy version.

Require structured output that identifies the finding, rationale, possible hidden premises,
scope or modal mismatches, affected fields, and recommended next action. AI-produced findings must
be labeled as such. A later publication policy may require human approval for specified findings,
statement types, or risk levels.

An impact traversal can find only relationships already represented in canonical structured data.
A separate whole-Model audit may ask AI or an editor to propose missing dependencies, arguments,
or bridge premises, but it must not add those relationships automatically or infer them from prose.

## Structured tests

The implementation should add fixtures and tests for at least these behaviors:

- canonicalization is deterministic across key order, supported line endings, and equivalent
  serialization details;
- changing a meaning-bearing field changes the appropriate fingerprint;
- changing an explicitly excluded presentation field does not;
- changing review metadata does not change a record, proposition, or argument fingerprint;
- a changed statement invalidates its own review, incident dependency reviews, and only the arguments
  that reference it;
- a refreshed dependency review with an unchanged downstream statement stops propagation along that
  branch;
- changing the downstream statement continues propagation to its direct dependents;
- a failed argument review does not automatically declare its conclusion false;
- dependency traversal remains acyclic while cyclic argument topology remains supported;
- changing the fingerprint schema or review-policy version has an explicit, tested invalidation
  result; and
- reports identify missing, malformed, stale, adverse, and unresolved attestations distinctly.

Representative integration fixtures should include branching dependencies, several premises in
one argument, multiple arguments for one conclusion, a statement that is both a conclusion and a
premise, and an argument cycle. Tests should assert the exact review frontier so an overly broad
or incomplete invalidation algorithm cannot pass unnoticed.

## Future incremental implementation stages

### 1. Read-only impact report

Build a deterministic command that compares canonical content with a selected baseline and lists
changed statements, incident dependencies, affected arguments, and the initial downstream review
frontier. It should not write attestations, edit content, or block publication.

### 2. Persistent attestations

Add the versioned fingerprint contract and review-only storage. Generate a report of fresh, stale,
missing, adverse, and unresolved reviews. Initially keep this report advisory while the field
selection and review workflow are tested against real revisions.

### 3. Publication policy

Once the process is reliable, allow CI to block publication when required reviews are missing or
stale. The policy must distinguish unreviewed change from adopted working claims with unresolved
confidence; publication need not imply certainty or a favorable finding. Adoption is identified by
inclusion in a version, not by an editorial status property on a statement or argument.

### 4. AI-assisted queue processing

Add a structured AI review runner that prepares exact review packets and returns proposed
attestations or issues for editorial confirmation. It must not bypass the same fingerprint,
validation, and publication rules applied to human reviews.

### 5. Optional reader visibility

If useful later, derive a public review-history or freshness view from accepted attestations.
Renderer state and status styling belong in the presentation layer, not canonical Model or
argument content. Public display is not required for the underlying editorial workflow.

## Implementation trigger and acceptance criteria

Begin with the read-only report when revision frequency, Model size, or the number of contributors
makes manual impact tracking unreliable. Persistent attestations are justified when the project
needs to demonstrate that affected relationships were reconsidered before publication.

The first blocking release is acceptable only when:

- a digest is described as review-input identity, never as proof of truth, validity, or soundness;
- every stale result identifies the exact changed input and affected review subject;
- direct dependency propagation agrees with the canonical dependency graph;
- argument invalidation uses explicit premise and conclusion references rather than dependency
  arrows or prose inference;
- refreshing a review without changing canonical content cannot create an artificial cascade;
- unchanged downstream content stops propagation, while changed downstream content continues it;
- missing canonical relationships are acknowledged as outside the reach of incremental traversal;
- AI and human findings retain provenance and remain auditable against exact inputs; and
- the existing structural validators remain independently authoritative and continue to pass.
