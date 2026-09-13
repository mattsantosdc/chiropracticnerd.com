# Reading interface and optional visualization plan

The agreed default experience is an integrated text walkthrough centered on exact
statements and their recorded reasoning. Stage 4 supplies the
[reading path and shared reasoning data](model-reading-path.md); Stage 5 renders
it at `/model/`, with a disclosed reference index and existing detail pages.
A graphical map is optional later work, not a prerequisite or the default route.

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

The future visualization layer will project the collections as follows:

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

When visualization work begins, add a small library-owned projection that accepts already
validated statement and argument collections and returns a serializable, renderer-neutral graph. Its
conceptual interface is:

```ts
type VisualizationNode = {
	id: string;
	kind: 'statement' | 'argument';
	canonicalId: string;
	label: string;
	href: string;
	metadata: Record<string, string>;
};

type VisualizationEdge = {
	id: string;
	kind: 'dependency' | 'premise' | 'conclusion' | 'related';
	source: string;
	target: string;
	directed: boolean;
	role?: DependencyRole;
	note?: string;
};

type VisualizationGraph = {
	nodes: VisualizationNode[];
	edges: VisualizationEdge[];
};
```

Renderer IDs should be deterministic and namespaced by kind, such as `statement:S-004` and
`argument:ARG-001`, so different resource kinds cannot collide. Existing semantic identifiers
remain the canonical identifiers where defined. Deterministic IDs created solely for premise,
conclusion, or related edges are implementation identifiers and must not be published as new
semantic identifiers without extending the standards contract.

The future data flow is:

> canonical Markdown → Astro collections → existing validation → graph projection → serialized
> graph data → interactive client renderer

Astro should continue producing the existing Model and argument pages as the indexable and
accessible textual representation. The visualizer enhances those pages or a dedicated map page; it
does not replace them. No graph database, RDF store, API, or linked-data export is required for
this client-side read model.

## Optional graphical map

A later map may expose independently selected dependency, argument, and related
layers with distinct node/edge treatments and an explicit legend. The dependency
DAG is useful for revision work; it is not the reader's default explanation.
Argument topology may branch, share conclusions, and cycle. Do not force it through
a layered DAG layout or interpret a dependency arrow as support or causation.

Select packages only when a concrete map use case exists, assessing current
maintenance, accessibility, bundle size, and Astro compatibility then. No package
is preferred, installed, or pinned by this stage. Preserve keyboard and screen-reader
access to equivalent textual relationships and verify every visual edge against
canonical structured data. Evidence, causal, objection, and provenance layers need
their own canonical contracts before visualization.
