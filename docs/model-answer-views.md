# Question-specific answer views

A reader can choose a question, examine its exact answer statement and follow the authored reasoning upstream. A statement is an answer relative to that question; it is not a global endpoint. `/model/` offers eight starting questions and retains the complete walkthrough and catalog. Every statement has an answer view at `/model/answers/{statement-slug}/`, accessible from its detail page and catalog entry.

The overview leads with the proposed functional aim and a prominent practical-question navigation block. Readers can begin with an answer and trace backward through its premises, or use the adjacent link and contents disclosure to follow the foundational walkthrough. This reading order preserves the reasoning-first authoring method. Question wording must not presuppose a need for an input or imply that the assessment strategy itself establishes a person-specific indication. Summaries and opening explanations orient readers in plain language; the exact canonical statements remain the propositions used in reasoning.

## Editorial questions and canonical content

`src/data/model-answer-questions.json` is a strict array of `{ id, question, statement }` records. IDs are local navigation identities in lowercase kebab case. Each question points to one existing permanent S-ID. A question supplies no answer text, premise, explanation, order of inference or acceptance label. Its wording must match the target's actual scope. Different questions can point to the same statement without creating another claim. The eight starting questions are examples of useful entrances; all 32 statements have views.

These navigation prompts are separate from the Q-IDs in `model-questions.json`, which identify critical questions and alternative explanations. Both are editorial records. Neither type adds assumptions or formal attacks.

`answerHref()` constructs routes from current statement slugs. `/model/answers/` is reserved alongside `/model/arguments/`, so a canonical statement cannot occupy either prefix. Answer pages do not create semantic identifiers or comment threads; all discussion links use the existing statement page and its permanent S-ID thread. Existing detail routes, walkthrough fragments and discussion identities remain intact.

## Derivation and limits

`buildAnswerView()` receives the full validated `ReasoningIndex`, the selected S-ID and the explicit ordinary-premise membership from `reasoning/model-bindings.json`. It follows every authored application concluding that statement and then every ordered joint premise of those applications. It repeats this traversal upstream. Each statement group appears once, nearest to the answer first; each application remains distinct. Visited identities terminate cycles. Order is for navigation, not strength or argumentative priority.

All incoming applications are retained, even when there is an independent premise route. S-011 therefore shows both its ordinary-premise membership and ARG-009. Shared premises are reused rather than counted as votes or corroborating evidence. A leaf is not automatically assumed: a statement with neither ordinary membership nor an authored concluding application is explicitly marked as lacking those routes. An explicitly admitted negative ordinary premise is disclosed without deciding the conflict.

This is a view of authored positive reasoning, not a partial ASPIC+ computation. It does not use the revision graph as an inference graph. It does not invent arguments from `semanticUses`, `related`, prose or reading placement. Strict transpositions, generated derivations, attack success and defenses remain matters for full-theory evaluation under the declared profile. An eventual view of formal results must consume the complete evaluation, including opponents outside the displayed positive ancestry; it must not evaluate only this page's statements.

The current working account admits no formal opposing corpus. Its critical questions are displayed for the selected statement, all reached statements and all reached applications. Hypothetical opposition scenarios remain separate evaluations. Additional semantic references and further uses of a statement remain available on the full record.

For example, the purpose answer S-005 includes ARG-008 and its joint premises S-027/S-029, followed by the benefit and effect routes. It excludes downstream assessment, application and reassessment, as well as unrelated broader-effect hypotheses. The S-012 answer remains an explicitly assumed empirical claim with no authored concluding application; the view does not manufacture transfer reasoning from connectivity or local improvement.

## Presentation and review

`AnswerStatement.astro` renders exact canonical statements, summaries, types and confidence, explicit premise roles, ordered joint premises, inference kinds and schemes, and the complete argument explanations. Native disclosures keep reasoning and questions available without JavaScript. Fragment enhancement opens enclosing disclosures and focuses the referenced statement or question. Shared canonical bodies and critical-question headings receive unique appearance namespaces.

Question additions, edits, reordering, deletions and retargeting receive local review of the previous and current answer targets through the impact adapter. They create no inference edge. Changes to the shared resolver, premise-role interpretation, renderer, routes or governing contract require global review. The standard reasoning suite and full pilot remain required; a display filter never reduces formal evaluation.

Tests cover purpose versus downstream practice, independent and derived routes, ordinary and negative premise membership, missing membership, shared ancestors, parallel applications, finite cycles, invalid prompts and route collisions. Built-page checks compare every answer's statement/argument inventory and joint premises with the resolver, verify exact text and unique fragments, and preserve the old links. Browser checks cover entering by question, opening reasoning, tracing a premise, viewing critical questions, keyboard focus, back navigation, mobile overflow and native behavior without JavaScript.
