# Model reading path

`src/data/model-reading-path.json` authors one editorial route for Model v0.1.
Canonical propositions and reasoning remain in the two Markdown collections.
Reading order, argument structure, and revision dependencies are independent.
Adjacency introduces no premise, support, causal relationship, or revision edge.
Domains and `order` still sort the existing catalog; they do not order this route.
Permanent S-IDs and ARG-IDs identify records and have no reading-order meaning.

## Authored contract

`readingPathSchema` in `src/lib/reading-path.ts` is the strict runtime contract;
its inferred TypeScript types are `ReadingPathConfig`, `ReadingSection`, and
`ReadingStep`. The JSON contains:

- `version`: the supported Model version (`0.1`), also checked against every record.
- `orientation`: an optional method section, independent of completing the main route.
- `main`: a nonempty ordered array of sections.
- `supporting`: an ordered array of additional sections (may be empty).

Every section has a unique local `id` in lowercase kebab case beginning with a
letter, a nonblank `title`, optional nonblank `introduction`, and nonempty `steps`.
A step contains exactly `{ "kind": "statement", "id": "S-###" }` or
`{ "kind": "argument", "id": "ARG-###" }`. All objects reject unknown fields;
no metadata overrides, nested routes, copied propositions, or copied argument
endpoints are accepted. Titles and introductions orient reading and require
semantic review; they must not add premises or replace canonical propositions.
Required text is trimmed during parsing. Section IDs are local presentation
identifiers, not public semantic resources.

The main route begins with living organisms. Orientation can be read independently.
Supporting placement does not change adoption, confidence, truth, or importance.
An argument step presents that argument and its canonical conclusion, with every
premise available in canonical order, regardless of where the premise is placed.

## Shared reasoning and resolution

`buildReasoningIndex(statements, argumentsList)` in `src/lib/reasoning.ts` uses the
existing statement and argument validators and builds four maps keyed by permanent
ID: `statementsById`, `argumentsById`, `concludingArguments`, and `premiseArguments`.
Pass the **full** collections, never a filtered main-route subset. Every statement
has both participation lists, even when empty. Each list retains all applicable
arguments in supplied collection order; it does not rank explanations.

A resolved statement holds the original `entry`, its current detail-page `href`,
and reserved `semanticId`. A resolved argument holds the same plus `premises` and
`conclusion` referring to those shared resolved statements. Exact text, metadata,
body, file path, and loader key remain available on `entry`; links use `data.slug`
and lookups use `data.id`. Reserved semantic IDs are identities, not promises of
currently dereferenceable pages. No helper mutates supplied records or arrays;
consumers must likewise treat the shared entries as read-only.

`resolveReadingPath(config, index)` returns `version`, optional `orientation`,
ordered `main` and `supporting` sections, `primaryStatementLocations`,
`statementLocations`, and `diagnostics`. Each resolved section retains its title
and introduction and has an `anchor`, `placement`, and resolved `steps`. A statement
step attaches `statement`; an argument step attaches `argument`, including its full
joint premise list and conclusion. No recursive graph traversal is performed.
Argument cycles and multiple arguments for a conclusion remain finite adjacency
lists. Only the separate dependency validator enforces a DAG.

## Coverage, duplicates, and locations

Every canonical statement needs an introduction by explicit statement step or by
an argument step's conclusion. Every canonical argument needs an explicit argument
step somewhere in the complete experience. Premise repetition alone is not an
intentional introduction. Newly unplaced records fail validation with their IDs,
requiring an editorial placement decision; no automatic append or omission occurs.

Repeated explicit steps are errors across all placements. A statement step plus
an argument step concluding that same statement is also an accidental duplicate
primary placement and is rejected in either order. Multiple **distinct** arguments
concluding the same statement are supported: the first conclusion appearance in
main section/step order is primary; if absent there, orientation takes precedence,
then supporting section/step order. This precedence is for navigation, not evidential
ranking. Primary selection never depends on collection order. Each other conclusion
and each repeated premise has its own local appearance without a new canonical ID.

`statementLocations` records all appearances in that same placement precedence,
with `role: statement | conclusion | premise`. `primaryStatementLocations` excludes
premise appearances. Locations contain `placement`, `sectionId`, zero-based
`stepIndex`, and `anchor`. Section anchors are `reading-{sectionId}`; step anchors
are `reading-{sectionId}--{kind}-{lowercase permanent ID}`. An argument conclusion
appends `--conclusion`; each premise appends `--premise-{lowercase statement ID}`.
These deterministic local anchors survive slug changes and reordering within a
section. Moving to another section changes the local location, never canonical
identity. The integrated page mounts these exact anchors. `reading-navigation.ts`
selects appearances by resolved section, step, placement, and role; templates never
reconstruct anchor recipes. Premise origin links use `primaryStatementLocations`.

## Validation and forward references

Shape, version, missing references, duplicate sections/placements, unresolved
canonical endpoints, and incomplete coverage are errors. Schema errors name the
configuration path and available section/step IDs; resolution errors name the
placement, section, one-based step number, and offending ID. Canonical endpoint
errors name the argument and missing premise or conclusion through its existing
validator. Shape and placement validation establish neither validity nor truth.

`premise-not-introduced` is a nonfatal diagnostic with argument/premise IDs, the
argument location, the premise's primary location, and an explanatory message.
Main is inspected without assuming orientation was read. Orientation is inspected
independently. Each supporting section assumes the completed main route and its
own earlier steps, never orientation or another supporting branch. Only explicit
statement steps and argument conclusions introduce statements for this check;
seeing a premise in another argument is not counted as an introduction. A premise
introduced later or on another branch still resolves fully. Future legitimate
forward references and cyclic argument structures require editorial inspection,
not topological sorting, relationship deletion, or a logical-error label.

The authored default has no such diagnostics. The Model overview frontmatter loads
the JSON and full collections, builds the index, resolves the path, and logs any
diagnostics. It renders the resolved main sections in order, beginning with S-017;
orientation and supporting branches use native disclosures. A secondary reference
index retains domain/order catalog sorting. Structural
errors therefore fail normal production builds even with a current semantic
review. The review gate separately requires thoughtful review of all inputs; it
cannot replace runtime validation or automatically approve a path.

## Stage 5 data flow

Canonical Markdown → Astro collections → `buildReasoningIndex` →
`resolveReadingPath` with the authored JSON → integrated text walkthrough.

The shared Astro components in `src/components/model/` consume these sections,
records, links, participation maps, and locations directly. `StatementText` uses
`entry.data.statement` for every appearance. `StatementMaterial` renders the canonical
body through Astro's `render()` and retains reference notes and revision conditions.
`ArgumentStep` presents one conclusion with its argument, joint ordered premises,
inference kind, scheme, and complete explanation. Repeated premises link to their
introductions or concluding arguments; no recursive expansion or unique-parent
assumption is used. Every incoming and outgoing argument stays available.

`CanonicalBody` renders its Astro content slot and passes the result to a structured
parse5 transformation. Each embedded body has its own appearance namespace for IDs,
local fragment links, and ID-reference attributes. Embedded headings shift under the
surrounding disclosure headings. Detail body IDs retain their original fragments.
External URLs and links to other detail records retain their meaning.

The small `src/scripts/model-fragments.ts` enhancement opens ancestor disclosures
and focuses/scrolls fragment targets on initial load, clicks, hash changes, history
navigation, and page restoration. Native disclosures and full detail links work
without JavaScript. The header is not sticky; targets have scroll margin and scripted
navigation is immediate, including under reduced motion.

Only the general Model discussion widget is mounted on the walkthrough. Statement
pages keep bare S-ID threads and stable `#discussion` links, even if comments are
disabled. Argument pages and the existing argument index retain their routes.

See [Stage 5 integration](model-stage-5-integration.md) for implementation, semantic
review and browser validation. A graphical map remains optional future work.
