# Visualization plan

The Model is intentionally authored so that an interactive graph can be added later without
changing the meaning or storage of its content. Visualization is deferred while the Model is
small. This document records the future projection, reader experience, and implementation
constraints so present authoring remains visualization-ready without introducing a renderer,
graph database, or renderer-specific metadata prematurely.

## Architecture decision

No content-schema, storage, or runtime change is required now. The existing architecture already
provides the necessary foundations:

- Statements and arguments have permanent identifiers independent of their mutable routes.
- Direct revision dependencies are explicit, typed, annotated, and validated as an acyclic graph.
- Structured arguments are stored separately from dependencies and validated against statement IDs.
- `related` records an undirected see-also relationship without pretending it has inferential or
  causal meaning.
- Downstream relationships can be derived from canonical upstream metadata.

Markdown remains canonical. A future graph representation will be a derived read model, not a new
source of truth. The renderer must be replaceable without migrating canonical content.

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
   order within domain groups.
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

## Planned reader experience

### First release: dependency map

The first visualization will show only the acyclic revision-dependency layer in a directed,
layered layout. It will provide:

- a whole-Model overview and a focused-neighborhood view;
- selection by permanent statement ID with URL-addressable focus state;
- controls to expand direct or recursive upstream and downstream connections;
- filters for domain, dependency role, statement type, and confidence;
- clearly directed and role-distinguished dependency edges;
- a detail panel containing the selected statement's proposition, summary, metadata, dependency note, and
  link to its full page; and
- keyboard-usable controls and an accessible textual fallback using the existing pages and lists.

The interface must explain that dependency arrows report revision impact rather than proof,
causation, chronology, or inferential support. It must remain usable on narrow screens by favoring
a focused neighborhood over an unreadable scaled-down whole graph.

### Later layers

A later release may add independently toggled argument and related-link layers. Dependency remains
the default layer; combining layers must use distinct node and edge treatments plus an explicit
legend. Argument topology may contain cycles and therefore must not be fed into dependency-DAG
validation or presented as though it shares the same topology.

Evidence, causal, objection, or provenance layers may be added only after the Model has a real use
case and a canonical, validated representation for those relationships.

## Candidate packages

No visualization dependency is installed or version-pinned now. Package maintenance, browser
support, accessibility, bundle impact, and compatibility with the current Astro version must be
reassessed immediately before implementation.

| Package | Potential fit | Important tradeoff |
| --- | --- | --- |
| [Cytoscape.js](https://js.cytoscape.org/) with [`cytoscape-elk`](https://github.com/cytoscape/cytoscape.js-elk) | **Preferred candidate.** Framework-independent graph rendering, styling, events, traversal, and a layered ELK layout appropriate for the dependency DAG. It can be loaded from an Astro client script without adopting a UI framework. | Accessibility around the canvas-based graph and surrounding controls must be implemented and tested deliberately. Reassess the ELK adapter and its dependency versions before installation. |
| [React Flow](https://reactflow.dev/api-reference) | Strong custom HTML nodes and interaction if the site later adopts React or needs visual graph editing. | Requires adding and hydrating React, and automatic layout remains a separate concern. It is unnecessary for the current static-first stack. |
| [Sigma.js](https://www.sigmajs.org/docs/) with Graphology | WebGL rendering and graph management if the Model eventually contains thousands of visible elements. | Optimized for a scale the Model does not currently approach, with layout and rich document-like nodes requiring additional work. |
| [D3 force](https://d3js.org/d3-force) and [D3 zoom](https://d3js.org/d3-zoom) | Maximum control over SVG, Canvas, layout behavior, and interaction. | Requires substantially more bespoke rendering, traversal, state, interaction, and accessibility code. |

Cytoscape.js with the ELK adapter is the leading implementation candidate, not an irreversible
architecture choice. The renderer-neutral projection is what keeps a later package change cheap.

## Implementation trigger and acceptance criteria

Begin implementation when the Model's size or reader feedback shows that linked statement pages no
longer make the structure easy to understand. Before selecting packages, verify the candidates
against a representative snapshot containing branching dependencies, multiple parents, multiple
arguments for one conclusion, related links, disconnected components, and the largest expected
labels.

The first release is complete only when:

- every visual node and edge can be traced to one canonical structured record;
- upstream/downstream expansion agrees with the textual Model pages;
- filters do not change graph meaning or direction;
- changing a slug changes navigation without changing graph identity;
- missing JavaScript leaves the existing Model navigation usable;
- keyboard and screen-reader users can reach equivalent relationship information; and
- projection tests cover identity, direction, argument grouping, related-link symmetry, and the
  exclusion of non-canonical relationships.
