# ASPIC+ foundation contract and pilot

## Decision and scope

The Model adopts an explicitly configured ASPIC+ foundation. This branch implements a bounded executable pilot and reader-facing critical questions. Canonical statement and argument Markdown remains authoritative. The pilot binds all 31 statements and nine inference applications to their exact current content; it does not turn publication into a starting premise.

This is not a claim that every English statement has received a complete logical formalization, that the opposition corpus is complete, or that the full canonical schema migration is finished. The [migration assessment](aspic-migration.md) records what still requires semantic decisions before the legacy dependency fields can be removed.

All work for this transition belongs on a branch created from `model-v0.1`. The current branch is `model-v0.1-aspic-foundation`, based on `bed3268155100f4a2d94354a3a38dca07a5b03d7`. Pull requests target `model-v0.1`. Merge into that branch, and subsequently `main`, only when the user directs it after review.

## Fixed evaluation profile

`reasoning/profile.json` is executable policy, not a collection of optional defaults.

| Choice | Implemented value |
| --- | --- |
| Framework reference | Modgil and Prakken's ASPIC+ account, including the 2018 correction |
| Acceptance semantics | Grounded |
| Argument ordering | Weakest-link elitist |
| Ordinary-premise and defeasible-rule preorders | Equal within each category; explicit reflexive and symmetric relations |
| Axioms | None |
| Contradiction | Explicit classical negation of named formulas |
| Rebuttal | Targets defeasible subargument conclusions |
| Undermining | Targets ordinary premises |
| Undercutting | Targets a named defeasible rule application and arguments containing it |
| Strict rules | Formal entailment checked before admission; closed under transposition |
| Argument construction | Exhaustive for the supported productive acyclic inference graph |
| Inference cycles | Unproductive cycles yield no arguments; productive cycles return an unsupported-input error |
| Attack cycles | Supported under grounded semantics |
| Limits | 120 statement records, 120 authored rules, 5,000 arguments; 5-second solver calls; 60-second command wrapper |
| Engine | `python-argumentation==2.0.2` with the documented identity adapter |
| Proof solver | `z3-solver==4.15.4.0` |

Weakest-link ordering was selected deliberately instead of PyArg's last-link default. In this no-axiom, equal-base-priority profile, an assumed proposition does not automatically outrank an opposing defeasible argument merely because the assumed proposition has no defeasible top rule. Neither confidence labels, record order nor argument counts break ties. Mutually defeating arguments can remain undecided.

The profile can change, but a changed choice requires a new documented profile identity, revised tests and a reviewed comparison of results. Do not add a per-record priority, privileged axiom or alternate semantics to make a preferred conclusion win. The current schema rejects those fields.

## Authored content, starting assumptions and derived results

Statements, inference applications, derived arguments, evaluation premises, editorial questions and reading paths have distinct roles. A statement may be a conclusion in one application and a premise in another. A question can stop at any statement. A reading path has no authority over the set of arguments considered by the engine.

`reasoning/model-bindings.json` lists 23 ordinary premises explicitly. Eight conclusion statements are derived without independent assumption. A ninth, S-011, is both explicitly assumed and derived through ARG-009; both routes are disclosed and tested. The loader does not infer starting-premise membership from publication, missing incoming arrows, confidence or statement type. It rejects changed statement wording or changed application premises, conclusion, inference kind or scheme until their bindings are reviewed.

S-030 and S-031 are explicitly admitted ordinary empirical premises for general circuit influence and chiropractic-specific likelihood. S-012 remains an ordinary empirical premise with revised wording that allows shared neural processes and circuit-to-circuit influence. No argument derives likelihood or broader improvement from S-011 or connectivity. A withdrawal test checks that the engine cannot invent these bridges and that the local benefit and professional-purpose routes remain independent. The two new formulas are opaque propositions; no probabilistic calculus or stronger proof claim is introduced. S-013's revised exact text independently assumes predominant mediation by input-induced motor-related neural change. Its opaque binding does not encode causal paths or compute mediation shares. The withdrawal test also checks that integration, local improvement and capacity cannot recreate this premise, while the local-benefit and purpose arguments remain intact.

S-029 is an explicit ordinary normative premise. ARG-008 uses it with S-027 to derive S-005, which is no longer independently assumed. Tests withdraw the bridge or causal premise, undercut the purpose inference, and reject its promotion to strict. The purpose route does not require S-004 or S-028.

All domain, empirical, value and definitional commitments remain challengeable. There are no protected chiropractic axioms. S-011 is both independently assumed and derived; this is a disclosed and reviewed additional route, not a default for every conclusion. It cannot be passed off as successful support from the other route.

The runtime generates complete derivations. It retains separate rule identities, the joint premises of each application, subarguments, all applicable attack types, successful defeats and grounded statuses. Public comments never become graph assertions automatically.

## Formal language and proof boundary

The interchange language for formulas is a deliberately restricted SMT-LIB 2 syntax: uninterpreted sorts, Boolean predicates, Boolean connectives, equality and quantification. Signatures accept only sort and predicate declarations. They cannot contain hidden asserted premises, definitions, commands or user code. Formula inputs are parsed as one closed Boolean expression.

Seven statements currently have quantified representations: S-011, S-022, S-024, S-025, S-026, S-027 and S-028. These cover the three deductions, ARG-006, ARG-007 and ARG-009. The other 24 statements are explicitly labelled `opaque-proposition` in the binding file. They participate in declared defeasible rules without claiming that their internal English logic has been proved. Promoting any such rule to strict requires a suitable reviewed formalization that actually passes the entailment check.

The formal vocabulary has these meanings:

| Symbol | Meaning in the pilot |
| --- | --- |
| `Input`, `Event` | Domains of possible input/event identifiers; the nonempty sort alone does not assert actual delivery or a qualifying response |
| `OccurredInput(i)` | An actual delivered chiropractic input |
| `Causes(i,e)` | The asserted input-to-event causal relationship |
| `ThroughMotorStrategyPerturbation(i,e)` | Input i causes reorganization e through disturbance of an established motor-control pattern; this is the asserted mechanism contribution, not merely an accompanying event |
| `Change(e)` | An actual change |
| `NeuromotorOrganization(e)` | A change concerning organization of neuromotor control or coordination |
| `Reorganization(e)` | The conjunction specified through S-024 |
| `Adjustment(e)` | Reorganization caused by an actual chiropractic input, under S-024 |
| `FunctionalScope`, `Context`, `Interval` | Identified comparison dimensions; these are abstract domains, not claims of clinical events |
| `Neuromotor(s)` | The specified scope is neuromotor; its domain is already a functional scope |
| `Improves(e,s,c,t)` | The full S-021 contextual comparison, including relevant gains and losses, not merely an improved test score |
| `Benefit(e,s,c,t)` | The scoped value attribution supplied by S-022 |
| `Successful(e,s,c,t)` | S-025's definition, retaining exactly the same comparison dimensions |

S-011 and S-027 use existential quantification over the same input, response, scope, context and interval. S-024 supplies the change/reorganization relation needed by S-022. S-025 and S-026 retain their universal conditional meaning without asserting that any successful adjustment occurs. The occurrence predicate prevents a nonempty logical sort from supplying empirical occurrence by definition.

S-028 uses S-011's full existential conjunction and adds `ThroughMotorStrategyPerturbation(i,e)` for the same input and event. ARG-009 drops only that mechanism conjunct. The new predicate leaves specific circuitry, salience thresholds and causal measurements uninterpreted; it does not assert a universal perturbation law or prove mechanism from co-occurrence. No axiom or engine/profile change is introduced. The exact English commitments and causal overlap were reviewed before admitting the strict rule.

For every authored strict rule, the solver first checks that its premises are satisfiable, then checks that the premises together with the negation of the conclusion are unsatisfiable. This rejects inconsistent-premise shortcuts. `unknown` or timeout is an incomplete evaluation, never proof. Generated transpositions implement the approved strict-rule closure and do not transpose defeasible rules.

The strict relation is the closure of the declared rules and their transpositions over the named language. The engine does not enumerate every consequence of arbitrary first-order logic. Do not describe its output as a complete theorem inventory. Formula-to-English fidelity and the adequacy of the named language remain semantic review obligations.

## Conformance and engine findings

The adapter reuses PyArg's attack, defeat, ordering and grounded-extension implementations. It does not silently accept its defaults.

Inspection and a reproducible test found that PyArg 2.0.2 identifies rules by their endpoints and constructs argument names without the rule identity. Two rules with identical premises and conclusion can therefore collapse even when only one should be undercut. `NamedStrictRule`, `NamedDefeasibleRule` and `CompleteAcyclicTheory` preserve rule identity before objects enter hash collections. The test suite both reproduces the upstream behavior and verifies the corrected behavior through the adapter. No installed dependency is patched or monkey-patched.

PyArg also excludes derivations that repeat a conclusion. This adapter does not claim that pruning preserves unrestricted ASPIC+ semantics. It first identifies productive rules and rejects any productive inference cycle. Unproductive cycles build no arguments; attack cycles remain supported. This is an explicit capability limit. A future cyclic theory requires an established construction/evaluation method and a reviewed profile extension, rather than silently discarding derivations.

The rationality argument for the supported profile relies on no axioms, a symmetric contradictory relation, strict transposition closure and the specified reasonable ordering. Undercutters target only named defeasible rules. The engine additionally checks subargument closure, strict closure, direct and indirect consistency, and satisfiability of the accepted formal statements for each completed run. Those runtime checks do not independently prove a general theorem. The reference assumptions and the restricted input class must remain part of every conformance claim.

## Critical questions and formal opposition

Follow [objection-authoring.md](objection-authoring.md). The sixteen public questions target actual claims and inferential boundaries without attributing errors to other practitioners. They are canonical editorial content in `src/data/model-questions.json`, displayed on their target detail pages.

A question does not assert its suggested alternative as true. A scope boundary need not defeat a correctly limited argument. A formal attacker needs a proposition, an explicitly declared role in a theory, and support under that theory. The pilot's synthetic counterarguments exercise undermining, rebutting and undercutting; they are not adopted clinical propositions.

The broader runtime statement schema permits `working-claim`, `alternative` and `hypothetical` corpus roles. Role labels do not themselves admit premises. Before importing substantive contrary positions into canonical content, extend the content and review contracts explicitly. The working theory currently has no admitted substantive opposing premises, so its unopposed acceptance results are not a completed dialectical review.

## AIF application profile

`to_aif` emits information nodes, inference applications, explicit contradiction applications and undercut applications using the AIF core structure. Joint premises remain attached to one inference node. The required `cn:aspicTheory` and `cn:evaluationProfile` extensions preserve executable details that the core graph alone does not specify, including formulas, premise roles, rule kinds, targets and ordering.

`from_aif` rejects a missing extension or disagreement between the graph and its executable payload. The supported round trip is exact for this application profile; it is not a universal importer for arbitrary AIF tools. This is experimental JSON interchange, not published RDF or JSON-LD, and it does not claim that reserved HTTP identifiers are dereferenceable.

## Reproducible execution

Create a local environment with `python3 -m venv .venv-reasoning`, then install `reasoning/requirements.txt` using that environment's pip. The pinned requirements include the engine, solver, YAML parser and transitive parser dependency. Windows users can use the corresponding Scripts executable. `REASONING_PYTHON` can select an already prepared interpreter.

Run `npm run test:reasoning` for the adversarial suite and `npm run reasoning:pilot` for both representative arguments and the full current working theory. Reports and AIF documents go to ignored `reasoning/output/`. They contain exact theory/profile digests, source fingerprints, adapter identity and computed derivations. They are snapshots, not author-editable certifications or public acceptance badges.

The tests cover the original 18 adversarial requirements plus quantified strengthening, existential overlap, occurrence by definition, productive cycles, explicit profile rejection, signature injection, formal binding drift, canonical inventory coverage, and the engine identity issue. The current suite contains 37 tests, including a cross-runtime check that the semantic review graph covers changed full-evaluation statuses after premise/rule withdrawal, an outside rebuttal, alternative support and undercut/defense changes. Perturbation tests verify both S-011 routes, withdrawal of each and both, rejection of the reverse capacity-plus-effect implication, and strict transposition from a negated effect. Review-impact tests also exercise these canonical changes. The two pilot scenarios explicitly assume their listed premises; this does not change the full working theory's independently declared premise set.

For every Model change, run the impact-based semantic review (with whole-model review for global changes and periodic checks), `npm test`, `npm run test:reasoning`, `npm run reasoning:pilot`, `npm run build` and `npm run test:routes`. Run the browser checks for presentation changes. The static Astro site does not ship Python or execute the engine in a reader's browser. The CI workflow runs the reasoning checks separately from the static build.

## References and implementation provenance

- [Modgil and Prakken, ASPIC+ tutorial](https://research-portal.uu.nl/ws/files/6251168/ASPICtutorial.pdf): framework terminology and attack structure.
- [A General Account of Argumentation with Preferences](https://arxiv.org/pdf/1804.06763): instantiated frameworks, preferences and conditional rationality results. Use the corrected definitions identified in the next source.
- [Author's corrected-paper and corrigendum notice](https://sanjaymodgil.nms.kcl.ac.uk/publications): correction to preference-ordering conditions, DOI `10.1016/j.artint.2018.05.001`.
- [PyArg ASPIC+ documentation](https://daphneodekerken.github.io/PyArg/aspic_examples.html) and [upstream source](https://github.com/DaphneOdekerken/PyArg): existing implementation and defaults. The installed 2.0.2 source was inspected and is pinned here.
- [Z3 Python API](https://z3prover.github.io/api/html/namespacez3py.html): SMT-LIB parsing and solver results.
- [AIF specification](https://www.arg-tech.org/wp-content/uploads/2011/09/aif-spec.pdf): interchange graph rather than replacement of the argumentation formalism.
