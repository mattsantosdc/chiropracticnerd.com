# Reading interface and optional visualization plan

The agreed default experience is an integrated text walkthrough centered on exact
statements and their recorded reasoning. Stage 4 supplies the
[reading path and shared reasoning data](model-reading-path.md); Stage 5 renders
it at `/model/`, with a disclosed reference index and existing detail pages.
Model v0.1 also offers an optional ordered visual walkthrough at `/model/map/`.
The integrated text walkthrough remains the default route.

## Architecture decision

Canonical Markdown retains permanent IDs, exact propositions, typed revision
dependencies, structured joint-premise arguments, and separate see-also links.
`src/data/model-reading-path.json` authors the editorial sequence without copying
those facts. The reasoning index derives participation from the full argument
collection; the resolver attaches canonical records and local reading locations.
Neither ordering nor display creates a new inference. Domain/order grouping
continues to serve catalogs rather than controlling the walkthrough.

No graph renderer, graph database, or UI framework is needed for Stage 4. Future
renderers consume derived data and remain replaceable without migrating content.

## Stage 5 reader experience

The main walkthrough begins with living organisms; the method orientation is
optional and the broader-effect branch remains adopted supporting reading.
Readers encounter exact statements, follow “More about this statement” to their
explanations and support, and inspect recorded argument reasoning through expandable
details. Every argument retains its identity, ordered joint premises, conclusion,
scheme, and deductive or defeasible kind inside its reasoning disclosure. The conclusion
leads each argument entry; statement pages retain all concluding and premise argument
participation and discussion. A statement may have several concluding arguments and
also participate as a premise. The overview keeps type and applicable confidence
compact; complete metadata remains on detail pages. Reading guidance stays available
inside the contents disclosure alongside navigation, with the opening purpose,
authorship, and acknowledgment preserved.
Premise links use derived primary reading locations, including argument conclusions,
while existing detail-page links remain available.

Keep independent empirical premises, definitions, evaluative commitments, and
practical decisions distinguishable. In particular, a success definition supplies
no occurrence evidence, and functional benefit within an identified scope,
context, and timescale does not settle whether an intervention is worth pursuing.
Revision dependencies remain available for revision impact, separately from reasoning.

The integrated interface needs accessible navigation, keyboard-usable disclosure,
narrow-screen reading, stable local anchors, and usable text without JavaScript.
Recursive reasoning display, if introduced, must bound traversal and mark revisited
records without deleting relationships. Finite argument cycles are allowed and
must never enter the separate dependency-DAG check. Stage 5 implements a finite text
presentation: links trace relationships and open statement support; native disclosures
expose canonical argument explanations without recursive nesting. See the
[implementation and browser review](model-stage-5-integration.md).

## Visualization-readiness contract

Apply these rules to every future Model, argument, and relationship change:

1. Visualize only relationships that are deliberately represented in canonical structured data.
   Do not infer edges from prose, shared words, domain membership, comments, transitive paths, or
   apparent conceptual similarity.
2. Keep relationship layers semantically distinct. A dependency is revision impact, an argument
   is an inferential route, evidence changes justification for an empirical claim, a causal
   hypothesis proposes an empirical relationship, and `related` is only see-also.
3. Store each fact once. Dependencies remain on the downstream statement as `upstream` metadata;
   downstream adjacency is derived. A `related` pair remains stored on only one endpoint and is
   projected symmetrically.
4. Use permanent statement and argument IDs for graph identity. Use slugs only to construct reader
   navigation links. A route change must not create a new graph node. Statement ID numbers must not
   determine sorting, hierarchy, domain, inference, or graph layout; use `order` for presentation
   order within catalog domain groups and the explicit reading-path configuration for the walkthrough.
5. Keep presentation state out of canonical Markdown. Coordinates, colors, shapes, collapsed
   state, viewport state, layout rank, and visualization-package identifiers belong in the
   renderer or derived graph layer.
6. Do not add dependencies to improve visual layout or make the graph appear linear. Incomplete,
   branching, or disconnected structure is an accurate result when the canonical relationships
   require it.
7. Before exposing a new relationship type, define its meaning, direction, identity, authoring
   location, and validation rules in the relevant canonical contract. Then add schema and test
   coverage. Renderer-only edge types are prohibited.

These rules preserve the existing distinction between content semantics and their presentation.

## Canonical graph projection

The visualization layer projects the collections as follows:

| Canonical record | Graph representation | Direction and meaning |
| --- | --- | --- |
| Statement | Statement node | An addressable claim, definition, value, framework commitment, or strategy |
| `upstream` dependency | Dependency edge | `upstream statement → downstream statement`; revision impact only |
| Argument record | Argument node | An addressable inferential route, distinct from its premises and conclusion |
| Argument premise | Premise edge | `premise statement → argument`; participation in that specific inference |
| Argument conclusion | Conclusion edge | `argument → conclusion statement`; the result asserted by that inference |
| `related` pair | Undirected related edge | Symmetric see-also only, regardless of which endpoint stores it |
| Reference | Statement-node metadata | A source link, not an evidence node or evidential-support edge |

Arguments must be projected as intermediary nodes:

> premise or premises → `ARG-###` → conclusion

Flattening an argument into independent premise-to-conclusion arrows would lose the fact that its
premises may operate jointly, erase the identity of the reasoning route, and blur arguments with
dependencies. Multiple arguments concluding the same statement remain separate argument nodes.

The following are intentionally excluded until separately modeled: claims inferred from prose,
causal edges inferred from empirical language, evidence-support edges inferred from references,
objections without canonical records, public comments, provenance links, and iterative feedback
described only in narrative text.

## Derived graph interface

`buildVisualizationGraph(index)` in `src/lib/visualization.ts` accepts the full,
validated reasoning index and returns a serializable, renderer-neutral
`VisualizationGraph` with `nodes` and `edges` arrays. Every node has its permanent
`canonicalId`, namespaced `id`, `kind`, `label` and current detail-page `href`.
Statement nodes retain exact `statement`, `summary`, `statementType`, `confidence`
and reference metadata; references remain source links, never inferred evidence edges.
Argument nodes retain `summary`, `inferenceKind`, `scheme`, ordered premise node IDs
and the conclusion node ID. Each edge has an implementation `id`, semantic `kind`,
`source`, `target`, and `directed` flag. Premise edges retain one-based `premiseOrder`;
dependency edges retain `role` and the complete limiting `note`.

Node identities are namespaced, such as `statement:S-004` and `argument:ARG-001`.
Edge IDs are deterministic: argument ID plus premise or conclusion ID, directed
upstream/downstream pairs, or sorted undirected related pairs. Sorting a related
pair defines identity only and never influences reading placement. These local
edge IDs do not create public semantic identifiers.

The data flow is:

> canonical Markdown → Astro collections → existing validation and reasoning index
> → graph projection → serialized data and HTML cards → interactive SVG enhancement

The existing Model and argument pages remain the accessible, indexable textual
account. No graph database, RDF store, API or linked-data export is introduced.

## Ordered visual walkthrough

`buildVisualizationLayout(path)` derives sections and reading steps separately from
graph topology. Each statement appears at its primary reading location and each
argument appears at its authored step. An argument sits beside its conclusion on
wide vertical layouts and below it on narrow screens and in horizontal mode. A
later argument with the same conclusion links back to the existing statement node.
Repeated premises never introduce duplicate graph nodes. Permanent IDs do not sort
the layout. No reading-order edge is created.

The map uses Astro-rendered HTML cards, CSS layout, and a TypeScript SVG enhancement.
Full statement text remains selectable and wraps naturally. Native disclosures
provide canonical argument explanations, ordered joint premises, and connection
lists. Statement details retain explanations, evidence notes and revision conditions.
No graph package or UI framework is needed for this ordered document interface.
The neutral projection permits another renderer later without content migration.

Vertical page scrolling is the default. A layout control enables a contained,
keyboard-focusable horizontal scroller. Selection and Previous/Next navigation use
the visible authored steps; optional orientation and supporting reading remain in
separate disclosures. Selection highlights direct visible relationships without
removing the remaining nodes or edges. Manual scrolling updates the current step
without adding history entries. Switching orientation retains the selected node.
Stable `map-statement-s-###` and `map-argument-arg-###` fragments support deep links,
history, repeated selection, and automatic opening of containing disclosures.
Text-view links use resolved reading locations rather than reconstructing anchors.

Reasoning is initially enabled; revision dependencies and see-also links are
independently toggled and initially off. Solid directed reasoning edges retain
argument intermediary nodes. Dashed revision edges retain direction, role and notes;
dotted see-also links remain undirected. The legend and connection disclosures
explain these distinctions. Every connection remains available textually regardless
of layer selection. Edges to collapsed sections are visually hidden until revealed,
with their endpoints still reachable through the connection lists.

Geometry is derived from rendered card bounds after font loading, resizing,
orientation changes and disclosure changes. Paths run outside cards through gaps
and outer gutters. Backward connections and cycles remain finite and require no
topological sorting. Multiple lines may share a gutter track; selecting a node
highlights its connections and the textual list identifies each endpoint.

The HTML cards, connection lists, argument explanations, section disclosures and
detail links remain available without JavaScript. The script adds controls and SVG
lines only when it loads. Keyboard focus stays visible and scripted navigation is
immediate, including under reduced motion. The map route reserves the `map` slug
namespace and all production inputs participate in the whole-Model semantic review.

Graph editing, automatic layout, evidence, causal, objection and provenance layers
remain later work. New relationship layers require their own canonical contracts.
