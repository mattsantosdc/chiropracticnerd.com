import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadCanonicalContent } from './helpers/content.ts';
import { buildReasoningIndex } from '../src/lib/reasoning.ts';
import { resolveReadingPath, type ReadingPathConfig } from '../src/lib/reading-path.ts';
import { buildVisualizationGraph, buildVisualizationLayout, visualizationAnchor } from '../src/lib/visualization.ts';
import { collections } from '../src/content.config.ts';
import { validateStatements } from '../src/lib/statements.ts';

const { statements, argumentsList } = await loadCanonicalContent();
const config = JSON.parse(readFileSync('src/data/model-reading-path.json', 'utf8'));
const index = buildReasoningIndex(statements, argumentsList);
const graph = buildVisualizationGraph(index);
const layout = buildVisualizationLayout(resolveReadingPath(config, index));

test('the projection retains exact canonical records, joint argument identity, and every recorded edge', () => {
	assert.equal(graph.nodes.length, statements.length + argumentsList.length);
	assert.equal(new Set(graph.nodes.map((node) => node.id)).size, graph.nodes.length);
	assert.equal(new Set(graph.edges.map((edge) => edge.id)).size, graph.edges.length);
	for (const entry of statements) {
		const node = graph.nodes.find((node) => node.canonicalId === entry.data.id)!;
		assert.equal(node.kind, 'statement');
		if (node.kind !== 'statement') throw new Error('Expected statement');
		assert.equal(node.statement, entry.data.statement);
		assert.equal(node.confidence, entry.data.confidence);
		assert.equal(node.statementType, entry.data.statementType);
		assert.deepEqual(node.references, entry.data.references);
		assert.equal(node.href, `/model/${entry.data.slug}/`);
		const dependencies = graph.edges.filter((edge) => edge.kind === 'dependency' && edge.target === node.id);
		assert.deepEqual(dependencies.map((edge) => ({ id: edge.source.split(':')[1], role: edge.role, note: edge.note })), entry.data.upstream);
	}
	for (const entry of argumentsList) {
		const node = graph.nodes.find((node) => node.canonicalId === entry.data.id)!;
		if (node.kind !== 'argument') throw new Error('Expected argument');
		const premises = graph.edges.filter((edge) => edge.target === node.id);
		assert.deepEqual(premises.map((edge) => edge.source), entry.data.premises.map((id) => `statement:${id}`));
		assert.deepEqual(premises.map((edge) => edge.premiseOrder), entry.data.premises.map((_, i) => i + 1));
		assert.deepEqual(node.premises, premises.map((edge) => edge.source));
		assert.equal(node.conclusion, `statement:${entry.data.conclusion}`);
		assert.equal(node.inferenceKind, entry.data.inferenceKind);
		assert.equal(node.scheme, entry.data.scheme);
		assert.equal(graph.edges.find((edge) => edge.source === node.id)!.target, node.conclusion);
	}
	assert.equal(graph.edges.length, statements.reduce((count, entry) => count + entry.data.upstream.length + entry.data.related.length, 0) + argumentsList.reduce((count, entry) => count + entry.data.premises.length + 1, 0));
	assert.ok(graph.edges.every((edge) => graph.nodes.some((node) => node.id === edge.source) && graph.nodes.some((node) => node.id === edge.target)));
	assert.ok(graph.edges.every((edge) => edge.directed === (edge.kind !== 'related')));
	assert.deepEqual(JSON.parse(JSON.stringify(graph)), graph);
});

test('reading placement follows the authored path independently of IDs, collection order, and catalog metadata', () => {
	assert.deepEqual(layout.flatMap((section) => section.steps.map((step) => step.id)), [...config.main, config.orientation, ...config.supporting].flatMap((section) => section.steps.map((step: { id: string }) => step.id)));
	assert.equal(layout[0].steps[0].focusNodeId, 'statement:S-017');
	const placements = layout.flatMap((section) => section.steps.flatMap((step) => step.nodeIds));
	assert.deepEqual(placements.toSorted(), graph.nodes.map((node) => node.id).toSorted());
	const changed = statements.toReversed().map((entry) => ({ ...entry, data: { ...entry.data, order: 999, domain: 'art' as const } }));
	assert.deepEqual(buildVisualizationLayout(resolveReadingPath(config, buildReasoningIndex(changed, argumentsList.toReversed()))), layout);
});

test('mutable slugs and canonical text do not change graph identities or placement; projection does not mutate inputs', () => {
	const before = structuredClone({ statements, argumentsList });
	buildVisualizationGraph(index);
	assert.deepEqual({ statements, argumentsList }, before);
	const changed = structuredClone(statements);
	changed[0].data.slug = 'new-navigation-route';
	changed[0].data.statement = 'Changed fixture proposition.';
	const next = buildVisualizationGraph(buildReasoningIndex(changed, argumentsList));
	assert.deepEqual(next.nodes.map((node) => node.id), graph.nodes.map((node) => node.id));
	assert.deepEqual(next.edges, graph.edges);
	assert.equal(next.nodes[0].href, '/model/new-navigation-route/');
	assert.equal(visualizationAnchor(next.nodes[0].id), visualizationAnchor(graph.nodes[0].id));
});

test('see-also direction is symmetric and has the same identity whichever endpoint authors the pair', () => {
	const changed = structuredClone(statements);
	const first = changed.find((entry) => entry.data.related.length)!;
	const relatedId = first.data.related.shift()!;
	changed.find((entry) => entry.data.id === relatedId)!.data.related.push(first.data.id);
	const next = buildVisualizationGraph(buildReasoningIndex(changed, argumentsList));
	assert.deepEqual(next.edges.filter((edge) => edge.kind === 'related').toSorted((a, b) => a.id.localeCompare(b.id)), graph.edges.filter((edge) => edge.kind === 'related').toSorted((a, b) => a.id.localeCompare(b.id)));
});

test('cycles, shared conclusions, forward references, and disconnected statements preserve finite unique nodes', () => {
	const entries = ['S-901', 'S-100', 'S-450', 'S-777'].map((id) => ({ ...structuredClone(statements[0]), data: { ...structuredClone(statements[0].data), id, slug: id.toLowerCase(), upstream: [], related: [] } }));
	const args = [
		{ id: 'ARG-901', premises: ['S-100', 'S-901'], conclusion: 'S-450' },
		{ id: 'ARG-100', premises: ['S-901'], conclusion: 'S-450' },
		{ id: 'ARG-450', premises: ['S-450'], conclusion: 'S-901' },
	].map((data) => ({ ...structuredClone(argumentsList[0]), data: { ...structuredClone(argumentsList[0].data), ...data, slug: data.id.toLowerCase() } }));
	const path: ReadingPathConfig = { version: '0.1', main: [{ id: 'main', title: 'Main', steps: [
		{ kind: 'statement', id: 'S-100' }, { kind: 'argument', id: 'ARG-901' }, { kind: 'argument', id: 'ARG-450' }, { kind: 'statement', id: 'S-777' },
	] }], supporting: [{ id: 'alternative', title: 'Another route', steps: [{ kind: 'argument', id: 'ARG-100' }] }] };
	const fixtureIndex = buildReasoningIndex(entries, args);
	const resolved = resolveReadingPath(path, fixtureIndex);
	const result = buildVisualizationGraph(fixtureIndex);
	const placements = buildVisualizationLayout(resolved);
	assert.equal(result.nodes.length, 7);
	assert.equal(result.edges.length, 7);
	assert.equal(placements.flatMap((section) => section.steps.flatMap((step) => step.nodeIds)).length, 7);
	assert.deepEqual(placements[1].steps[0].nodeIds, ['argument:ARG-100']);
	assert.equal(placements[1].steps[0].sharedConclusion, 'statement:S-450');
	assert.equal(result.edges.filter((edge) => edge.target === 'statement:S-450').length, 2);
	assert.ok(!result.edges.some((edge) => edge.source === 'statement:S-777' || edge.target === 'statement:S-777'));
	assert.ok(resolved.diagnostics.some((diagnostic) => diagnostic.code === 'premise-not-introduced'));
});

test('map routes are reserved in both schema and collection validation without reserving similar names', () => {
	for (const slug of ['map', 'map/example']) {
		const data = { ...statements[0].data, slug };
		assert.equal(collections.statements.schema.safeParse(data).success, false);
		assert.throws(() => validateStatements([{ ...statements[0], data }]), /reserved route/);
	}
	assert.equal(collections.statements.schema.safeParse({ ...statements[0].data, slug: 'mapping' }).success, true);
});
