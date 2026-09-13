# Stage 5: the integrated Model reading experience

Implemented on `model-v0.1-statements-and-reasoning` from the clean Stage 4 commit
`e8779638bcafed2b44e43892ef49abba33e58de5`. The canonical inventory remains 28
statements, seven arguments, 38 revision dependencies, and two see-also pairs.
No canonical record, ID, slug, proposition, classification, confidence, argument
endpoint, dependency, source note, or reading-path configuration changed. No public
route was added. This stage completes the planned interface and structural work;
it does not confirm empirical premises or resolve the documented research questions.

## Rendered data flow

The overview and both detail-page types load the full statement and argument
collections, validate/build `buildReasoningIndex()`, and call `resolveReadingPath()`
with `src/data/model-reading-path.json`. The configuration remains the sole authored
sequence. The main document contains 23 steps across seven sections, beginning with
S-017; optional method orientation and supporting S-012/S-013 are native disclosures.
All 28 statements have an intentional primary appearance and all seven arguments
appear with their conclusions. A disclosed reference index retains domain/order
catalog grouping without controlling the main sequence. The argument catalog and
all existing detail routes remain available.

The eight shared components in `src/components/model/` separate responsibilities:

- `ReadingSection` iterates resolved steps and derives the next-section link.
- `StatementText` displays the exact `entry.data.statement`, with title/ID secondary
  and separate plain-language type, confidence, and domain labels.
- `StatementStep` presents a primary statement with participation and disclosures.
- `StatementMaterial` uses Astro `render()` for the canonical body and renders all
  references, their limiting notes, and revision conditions from the same entry.
- `ArgumentStep` presents a conclusion with argument identity, inference kind, and
  immediate premise links. “Follow the reasoning” reveals the labeled summary,
  every ordered joint premise, scheme, exact conclusion, and complete explanation.
  Dedicated argument pages use the same component with reasoning initially open.
- `ReasoningParticipation` retains every argument concluding or using a statement.
- `CanonicalBody` handles safe namespaces for each embedded Markdown appearance.
- `ReasoningHelp` briefly explains inference kinds, confidence, and reading order.

Bodies are not replaced by summaries. The same statement reused as a premise is
rendered from the same indexed record. Its full support is available at its primary
appearance and detail page. Argument conclusions have their own statement support
alongside the argument explanation, with no extra standalone conclusion step.
The expanded reasoning repeats the conclusion for inspection within that inference;
this is an appearance of the same statement, not another canonical record.

The visual treatment retains the site identity, author attribution, brief historical
acknowledgment, colors, and type system. It uses a single reading column, section
headings, a compact disclosed contents list, modest separators, and native controls.
There is no required orientation, filter, view selector, graph, or step wizard.

## Navigation, anchors, and Markdown

`reading-navigation.ts` selects existing resolved argument steps and statement
appearances by placement, section, step, and role. It never reconstructs the
resolver's anchor recipes. The integrated page mounts every returned section,
step, conclusion, and premise anchor exactly once. Premise origin links use
`primaryStatementLocations`; participation links go to the relevant argument step.
Full record links use the index's real `href`, not reserved semantic identifiers.

For example, the reader can open ARG-002, follow its S-027 premise to ARG-007's
conclusion, and inspect S-022, S-024, and S-011 there without leaving `/model/`.
S-004 links back to ARG-005 and forward to ARG-004; S-006 then participates in
ARG-002 with its additional premises. Next-section links explicitly describe
reading order. Neither adjacency nor revision metadata supplies a missing inference.

Astro renders the canonical Markdown into the `CanonicalBody` slot. A parse5 tree
transformation then namespaces every embedded ID, matching fragment link, and
ID-reference attribute. Headings shift beneath the surrounding disclosure headings;
text and source URLs remain intact. This handles repeated “Boundary” headings and
footnote-style references without HTML string replacement. Detail body fragments
retain their original IDs, as does the argument structure link target. parse5 was
already in the dependency tree and is now a declared build-time dependency; it adds
no client parser. There is no second Markdown authoring source.

`model-fragments.ts` is the small progressive enhancement. It opens ancestor
`details` elements, makes the destination programmatically focusable, focuses it,
and scrolls it into view on initial fragments, hash changes, history navigation,
page restoration, and a repeat click on the current fragment. Modified clicks and
external links retain normal behavior. Scrolling is immediate; global smooth
scrolling is disabled for reduced motion. Targets have scroll margin; the site
header is not sticky. Every statement and conclusion is server-rendered. Without
JavaScript, native disclosures and full detail links remain usable.

Rendering uses finite participation lists and links, with no recursive argument
expansion or unique-parent assumption. Multiple concluding arguments and cycles
remain representable independently of the revision-dependency DAG.

## S-017 and relationship labels

S-017 now visibly lists **ARG-005 → S-004: Open-ended human functional potential
(defeasible)** next to its proposition in the walkthrough and near the top of its
detail page. ARG-005 retains all six canonical premises in their authored order:
S-017, S-007, S-018, S-019, S-008, S-020. The conclusion remains S-004.

“Reasoning for this statement” and “Arguments using this statement” show precisely
recorded participation. Empty incoming lists say no concluding argument is recorded,
not that a statement lacks evidence or is an axiom. Statement detail pages move
revision information into **Revision dependencies**, separating dependencies
recorded on the statement from other statements depending on it for revision.
Roles and limiting notes are retained. Empty messages explicitly concern revision
dependencies; “Root statement,” “Used by,” and “No downstream statements yet” are gone.

No S-017 dependency was added. A revision to it requires reviewing ARG-005 through
premise participation even though its direct revision-dependency lists are empty.
The S-017-to-S-007 transition remains introduction of another empirical premise.

The general comment thread remains `model:general`, and each statement detail page
keeps its bare S-ID thread. The walkthrough mounts only one comment component and
links each statement to its detail-page discussion. Stable `#discussion` wrappers
also exist when comments are disabled. No comments were posted during validation.

## Whole-Model semantic review

The working Codex agent read all 28 exact propositions with their metadata, summaries,
bodies, references and limiting notes, revision conditions, and dependencies, then
all seven arguments with their exact endpoints and explanations. The final component
and template diff, unchanged section wording, placement, labels, and rendered
presentation were reviewed together. There are zero forward-reference diagnostics.

The existing review schema retains one substantive record per canonical statement
or argument. `reviews/model-review.json` records 35 findings covering **76 inputs**.
Coverage now explicitly includes all new production components, helpers, the fragment
script, shared CSS, Astro configuration, and package manifests. Tests and this note
are explanatory/verification material, not production inputs or automated approval.
The temporary packet is `/tmp/model-stage-5-review-packet.json`.

Specific intellectual checks:

- ARG-005 remains a defeasible biological rationale, compatible with no better
  feasible response now. The page supplies no linear deduction from organismic
  maintenance to human neural integration, available improvement, or chiropractic.
- S-021 is the contextual comparison; S-022 is an independent adopted value;
  S-005 is a professional aim. Their presentation does not derive values from biology.
- ARG-006 applies the value criterion to the improving change defined by S-024/S-025
  in exactly the same scope/context/timescale. It is compatible with no successful
  adjustment occurring. It supplies no occurrence or success-frequency evidence.
- ARG-007 requires S-011's actual joint causal improvement premise. S-022/S-024/S-011
  entail the scoped evaluative conclusion while leaving empirical support unresolved.
  Neither the success definition, S-026, nor S-028 is substituted into the argument.
- S-028 remains a separate mechanism hypothesis. S-012/S-013 retain their empirical
  transfer and mediation burdens in supporting reading, with no inferred benefit
  connection and no change to adoption or confidence.
- ARG-002/ARG-003 preserve practical, defeasible bridges. A population-level capacity
  and some effective inputs need not coincide in this person now. Measurement,
  selection, benefit-risk judgment, non-intervention, and stopping remain explicit.

Counterexamples remain possible: input without reorganization, reorganization without
improvement, a favorable metric with relevant functional losses, local benefit without
broader transfer, and benefit insufficient to justify the intervention. No new
empirical literature appraisal or confidence upgrade was performed.

## Validation and browser review

Completed on 2026-09-12:

- `npm run audit:model -- --packet` produced the exact review inputs;
  `npm run audit:model -- --check` confirms current completed coverage.
- `npm test` passed nine files; the same suite with `--test-isolation=none` exposed
  **55 passing individual tests**, including all previous canonical validation,
  reading-path, freshness, and build-failure checks.
- `npm run build` passed and retained **40 production pages**.
- `npm run test:routes` passed **seven rendered-output checks**. They compare every
  proposition and argument endpoint with canonical collections, compare every body
  with Astro-rendered canonical Markdown, retain all source notes and revision
  conditions, check exact authored order and secondary catalog order, inspect every
  participation list, mount every resolver anchor, and check all built internal
  page/fragment links and duplicate IDs. Comment widget identities are checked too.
- A structured-markup fixture tests heading, local-link, footnote-style, and
  ID-reference namespacing, including repeated instances and duplicate-source errors.
- Disposable real-build fixtures preserve the malformed-path failure independently
  of synthetic test-only review bookkeeping, and render an added alternative
  conclusion/argument cycle without dropping participation or duplicating IDs.
  These synthetic arguments never enter repository content or its semantic review.
- Playwright checks passed against the production build in Chromium **153.0.8010.12**
  and Firefox **155.0** at **1280 × 900** and **390 × 900**,
  including initial fragment navigation into nested disclosures, same-page links,
  current-hash repeat clicks, Back/Forward after manually closing disclosures,
  Tab/Shift+Tab navigation, keyboard opening, visible focus, focus/scroll destination,
  normal and reduced-motion preferences, and long propositions without horizontal
  overflow. The assessment → benefit → actual-effect route stays within the page.
- JavaScript-disabled checks retain main propositions, native reasoning disclosures,
  supporting content, and full detail navigation. Browser checks stub FastComments
  network code; live comment-service behavior and posting are outside this review.
- Visual review inspected introduction, expanded biological reasoning, the S-017
  detail, and the long S-021 definition at desktop and narrow widths. It prompted
  smaller introductory spacing and unbroken premise IDs. The layout has no card wall,
  recursive reasoning nesting, status badges, or horizontally overflowing statements.

Repeat the browser checks against a fresh production build:

```sh
npx playwright install chromium firefox
npm run test:browser
MODEL_BROWSER=firefox npm run test:browser
```

The script serves `dist/` on an ephemeral loopback port and shuts down afterward.
`MODEL_BASE_URL` optionally targets an existing dev/preview server. If starting Astro
dev, use `astro dev --background` and the documented status/logs/stop commands.
`MODEL_SCREENSHOTS` changes the screenshot directory. In this environment matching
browser binaries were installed under `/tmp/model-playwright-browsers`, so runs use
`PLAYWRIGHT_BROWSERS_PATH=/tmp/model-playwright-browsers`. Representative screenshots
are in `/tmp/model-stage-5-screenshots/`; they are review artifacts, not deployed assets.

This is a browser and keyboard review, not a screen-reader-user study. Safari/WebKit
and physical mobile devices were not tested. Graphical mapping, searching, a sticky
contents list, and richer evidence appraisal remain optional work for specific needs.
No graph package, UI framework, API, new route, or linked-data export was introduced.

## End-to-end five-stage check

| Stage | Implemented result and boundary |
| --- | --- |
| 1. Names and stable identifiers | Statements and arguments remain separate canonical collections with 28 stable S-IDs, seven ARG-IDs, existing slugs, and preserved comment identities. |
| 2. Organismic/regulatory foundation | S-017 begins the account and visibly participates in ARG-005's explicit six-premise defeasible rationale; S-007 is independently empirical. |
| 3. Benefit, adjustment, success, effect | Input, response, success, functional value, actual effect, mechanism, broader transfer, and intervention judgment remain distinct and traceable through their own records and arguments. |
| 4. Explicit reading and shared reasoning | One unchanged authored JSON sequence and the full validated reasoning index govern order, endpoints, participation, and primary locations. |
| 5. Integrated default interface | `/model/` exposes the exact account in a scrolling document, with section links, accessible native disclosures, in-page reasoning navigation, and useful direct detail routes. |

All five implementation stages are complete. Empirical premise truth, assessment
validation, prospective selection, success frequency, broader transfer, and mechanism
questions remain open exactly where the canonical account records them. No merge or
deployment is part of this stage.
