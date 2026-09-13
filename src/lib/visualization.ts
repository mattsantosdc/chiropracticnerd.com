import type { ReasoningIndex } from './reasoning.ts';
import type { DependencyRole, StatementEntry } from './statements.ts';
import type { ResolvedReadingPath } from './reading-path.ts';
import { readingSections } from './reading-navigation.ts';

type NodeBase = { id: string; canonicalId: string; label: string; href: string };
export type VisualizationNode = NodeBase & (
	{ kind: 'statement'; statement: string; summary: string; statementType: StatementEntry['data']['statementType']; confidence: StatementEntry['data']['confidence']; references: StatementEntry['data']['references'] }
	| { kind: 'argument'; summary: string; inferenceKind: 'deductive' | 'defeasible'; scheme: string; premises: string[]; conclusion: string }
);
export type VisualizationEdge = {
	id: string;
	kind: 'premise' | 'conclusion' | 'dependency' | 'related';
	source: string;
	target: string;
	directed: boolean;
	premiseOrder?: number;
	role?: DependencyRole;
	note?: string;
};
export type VisualizationGraph = { nodes: VisualizationNode[]; edges: VisualizationEdge[] };

export const visualizationNodeId = (kind: VisualizationNode['kind'], id: string) => `${kind}:${id}`;
export const visualizationAnchor = (nodeId: string) => `map-${nodeId.replace(':', '-').toLowerCase()}`;

/** Project only recorded relationships from a complete, validated reasoning index. */
export function buildVisualizationGraph(index: ReasoningIndex): VisualizationGraph {
	const nodes: VisualizationNode[] = [];
	const edges: VisualizationEdge[] = [];
	const statementId = (id: string) => visualizationNodeId('statement', id);
	for (const { entry: { data }, href } of index.statementsById.values()) {
		nodes.push({ id: statementId(data.id), canonicalId: data.id, kind: 'statement', label: data.title, href,
			statement: data.statement, summary: data.summary, statementType: data.statementType, confidence: data.confidence,
			references: data.references.map((reference) => ({ ...reference })) });
		for (const dependency of data.upstream) edges.push({
			id: `dependency:${dependency.id}:${data.id}`, kind: 'dependency', source: statementId(dependency.id),
			target: statementId(data.id), directed: true, role: dependency.role, note: dependency.note,
		});
		for (const relatedId of data.related) {
			// Sorting defines undirected pair identity only; it never controls reading placement.
			const [first, second] = [data.id, relatedId].sort();
			edges.push({ id: `related:${first}:${second}`, kind: 'related', source: statementId(first), target: statementId(second), directed: false });
		}
	}
	for (const { entry: { data }, href } of index.argumentsById.values()) {
		const id = visualizationNodeId('argument', data.id);
		nodes.push({ id, canonicalId: data.id, kind: 'argument', label: data.title, href, summary: data.summary,
			inferenceKind: data.inferenceKind, scheme: data.scheme, premises: data.premises.map(statementId), conclusion: statementId(data.conclusion) });
		data.premises.forEach((premise, i) => edges.push({
			id: `premise:${data.id}:${premise}`, kind: 'premise', source: statementId(premise), target: id, directed: true, premiseOrder: i + 1,
		}));
		edges.push({ id: `conclusion:${data.id}:${data.conclusion}`, kind: 'conclusion', source: id, target: statementId(data.conclusion), directed: true });
	}
	return { nodes, edges };
}

/** Editorial placement is separate from topology and renderer geometry. Each record appears once. */
export function buildVisualizationLayout(path: ResolvedReadingPath) {
	return readingSections(path).map((section) => ({
		id: section.id, anchor: `map-${section.anchor}`, title: section.title, introduction: section.introduction, placement: section.placement,
		steps: section.steps.map((step) => {
			const argument = step.kind === 'argument' ? step.argument : undefined;
			const statement = step.kind === 'statement' ? step.statement : argument!.conclusion;
			const statementNodeId = visualizationNodeId('statement', statement.entry.data.id);
			const primary = path.primaryStatementLocations.get(statement.entry.data.id)!;
			const introducesStatement = primary.sectionId === section.id && primary.stepIndex === step.location.stepIndex;
			const nodeIds = introducesStatement ? [statementNodeId] : [];
			if (argument) nodeIds.push(visualizationNodeId('argument', step.id));
			return { id: step.id, anchor: `map-${step.location.anchor}`, nodeIds,
				focusNodeId: introducesStatement ? statementNodeId : visualizationNodeId('argument', step.id),
				sharedConclusion: introducesStatement ? undefined : statementNodeId, readingHref: `/model/#${step.location.anchor}` };
		}),
	}));
}
export type VisualizationSection = ReturnType<typeof buildVisualizationLayout>[number];
