import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildReasoningIndex } from '../src/lib/reasoning.ts';
import { parseReadingPath, resolveReadingPath, type ReadingPathConfig, type ResolvedReadingPath } from '../src/lib/reading-path.ts';
import { validateStatements } from '../src/lib/statements.ts';
import { loadCanonicalContent } from './helpers/content.ts';

const config = parseReadingPath(JSON.parse(readFileSync('src/data/model-reading-path.json', 'utf8')));
const { statements, argumentsList } = await loadCanonicalContent();
const index = buildReasoningIndex(statements, argumentsList);
const sections = (path: ResolvedReadingPath) => [...path.main, ...(path.orientation ? [path.orientation] : []), ...path.supporting];
const signature = (path: ResolvedReadingPath) => sections(path).map(({ id, title, steps }) => ({ id, title, steps: steps.map((step) => step.id) }));
const resolve = (value: unknown) => resolveReadingPath(value, index);

function smallFixture() {
	const entries = ['S-901', 'S-100', 'S-450'].map((id) => ({
		...structuredClone(statements[0]), id: `loader-${id}`,
		data: { ...structuredClone(statements[0].data), id, slug: `route-${id.toLowerCase()}`, upstream: [], related: [] },
	}));
	const argumentsFixture = [
		{ id: 'ARG-901', premises: ['S-100', 'S-901'], conclusion: 'S-450' },
		{ id: 'ARG-100', premises: ['S-901'], conclusion: 'S-450' },
		{ id: 'ARG-450', premises: ['S-450'], conclusion: 'S-901' },
	].map((data) => ({
		...structuredClone(argumentsList[0]), id: `loader-${data.id}`,
		data: { ...structuredClone(argumentsList[0].data), ...data, slug: `route-${data.id.toLowerCase()}` },
	}));
	const path: ReadingPathConfig = {
		version: '0.1',
		main: [{ id: 'main-branch', title: 'Main branch', steps: [
			{ kind: 'statement', id: 'S-100' },
			{ kind: 'argument', id: 'ARG-901' },
			{ kind: 'argument', id: 'ARG-450' },
		] }],
		supporting: [{ id: 'another-route', title: 'Another argument', steps: [{ kind: 'argument', id: 'ARG-100' }] }],
	};
	return { entries, argumentsFixture, path };
}

test('default resolves the authored sequence and complete intentional coverage independently of catalog order', () => {
	const path = resolve(config);
	const authored = [...config.main, config.orientation!, ...config.supporting];
	assert.deepEqual(signature(path), authored.map(({ id, title, steps }) => ({ id, title, steps: steps.map((step) => step.id) })));
	assert.equal(path.main[0].steps[0].id, 'S-017');
	assert.deepEqual([...path.primaryStatementLocations.keys()].sort(), statements.map((entry) => entry.data.id).sort());
	assert.deepEqual(sections(path).flatMap((section) => section.steps.filter((step) => step.kind === 'argument').map((step) => step.id)).sort(), argumentsList.map((entry) => entry.data.id).sort());
	assert.deepEqual(path.diagnostics, []);
	const shuffled = statements.toReversed().map((entry, order) => ({ ...entry, data: { ...entry.data, domain: 'art' as const, order: 999 - order } }));
	const reordered = resolveReadingPath(config, buildReasoningIndex(shuffled, argumentsList.toReversed()));
	assert.deepEqual(signature(reordered), signature(path));
	assert.deepEqual(reordered.primaryStatementLocations, path.primaryStatementLocations);
});

test('every argument keeps exact canonical premise order, conclusion, kind, text, metadata, and source identity', () => {
	const path = resolve(config);
	for (const section of sections(path)) {
		for (const step of section.steps) {
			if (step.kind === 'statement') {
				assert.equal(step.statement.entry, statements.find((entry) => entry.data.id === step.id));
				continue;
			}
			const canonical = argumentsList.find((entry) => entry.data.id === step.id)!;
			assert.equal(step.argument.entry, canonical);
			assert.equal(step.argument.entry.data.inferenceKind, canonical.data.inferenceKind);
			assert.deepEqual(step.argument.premises.map(({ entry }) => entry.data.id), canonical.data.premises);
			assert.equal(step.argument.conclusion.entry.data.id, canonical.data.conclusion);
			for (const resolved of [...step.argument.premises, step.argument.conclusion]) {
				const source = statements.find((entry) => entry.data.id === resolved.entry.data.id)!;
				assert.equal(resolved.entry, source);
				assert.equal(resolved.entry.data.statement, source.data.statement);
				assert.equal(resolved.entry.filePath, source.filePath);
				assert.equal(resolved.href, `/model/${source.data.slug}/`);
			}
		}
	}
});

test('changing canonical text and slugs updates all appearances without editing configuration or identities', () => {
	const changed = structuredClone(statements);
	const source = changed.find((entry) => entry.data.id === 'S-022')!;
	source.data.statement = 'A deliberately changed canonical fixture proposition.';
	source.data.slug = 'a-new-canonical-fixture-route';
	source.id = 'unrelated-loader-key';
	const changedArguments = structuredClone(argumentsList);
	const argument = changedArguments.find((entry) => entry.data.id === 'ARG-007')!;
	argument.data.slug = 'a-new-argument-route';
	const nextIndex = buildReasoningIndex(changed, changedArguments);
	const path = resolveReadingPath(config, nextIndex);
	const value = nextIndex.statementsById.get('S-022')!;
	assert.equal(value.entry.data.statement, source.data.statement);
	assert.equal(value.href, '/model/a-new-canonical-fixture-route/');
	assert.equal(value.semanticId, index.statementsById.get('S-022')!.semanticId);
	for (const consumer of nextIndex.premiseArguments.get('S-022')!) assert.ok(consumer.premises.includes(value));
	assert.equal(nextIndex.argumentsById.get('ARG-007')!.href, '/model/arguments/a-new-argument-route/');
	assert.deepEqual(path.statementLocations, resolve(config).statementLocations);
});

test('strict shape rejects unsupported kinds, malformed and wrong-kind IDs, blank text, empty routes, and overrides', () => {
	const invalid: [unknown, RegExp][] = [
		[null, /configuration/],
		[{ ...config, version: '0.2' }, /version/],
		[{ ...config, main: [] }, /main.*must contain sections/],
		[{ ...config, supporting: undefined }, /supporting/],
		[{ ...config, orientation: null }, /orientation/],
		[{ ...config, confidence: 'high' }, /confidence/],
	];
	for (const [override, pattern] of [
		[{ kind: 'dependency', id: 'S-017' }, /main.0.steps.0.kind.*S-017/],
		[{ kind: 'statement', id: 'S-17' }, /S-17.*Expected a statement ID/],
		[{ kind: 'statement', id: 'ARG-005' }, /ARG-005.*Expected a statement ID/],
		[{ kind: 'argument', id: 'S-017' }, /S-017.*Expected an argument ID/],
		[{ kind: 'argument', id: 'ARG-5' }, /ARG-5.*Expected an argument ID/],
		...['statement', 'summary', 'slug', 'premises', 'conclusion', 'inferenceKind', 'confidence', 'upstream'].map((field) => [
			{ kind: 'statement', id: 'S-017', [field]: 'override' }, new RegExp(field),
		]),
	] as [unknown, RegExp][]) {
		const value = structuredClone(config);
		value.main[0].steps[0] = override as ReadingPathConfig['main'][number]['steps'][number];
		invalid.push([value, pattern]);
	}
	for (const [override, pattern] of [
		[{ title: ' ' }, /living-organisms.*must not be blank/],
		[{ introduction: '\n' }, /living-organisms.*must not be blank/],
		[{ id: '' }, /identifier/],
		[{ id: 'S-017' }, /identifier/],
		[{ steps: [] }, /living-organisms.*must contain steps/],
		[{ order: 1 }, /order/],
	] as [object, RegExp][]) {
		const value = structuredClone(config);
		Object.assign(value.main[0], override);
		invalid.push([value, pattern]);
	}
	for (const [value, pattern] of invalid) assert.throws(() => resolve(value), pattern);
});

test('missing references and duplicate sections or placements identify the offending location', () => {
	for (const kind of ['statement', 'argument'] as const) {
		const value = structuredClone(config);
		value.main[0].steps[0] = { kind, id: kind === 'statement' ? 'S-999' : 'ARG-999' };
		assert.throws(() => resolve(value), new RegExp(`main section "living-organisms" step 1: missing ${kind}`));
	}
	const duplicateSection = structuredClone(config);
	duplicateSection.supporting[0].id = duplicateSection.main[0].id;
	assert.throws(() => resolve(duplicateSection), /supporting.*living-organisms.*duplicate section/);
	for (const step of [{ kind: 'statement', id: 'S-017' }, { kind: 'argument', id: 'ARG-005' }] as const) {
		const value = structuredClone(config);
		value.supporting[0].steps.push(step);
		assert.throws(() => resolve(value), /broader-effects.*duplicate explicit step.*already at main/);
	}
	for (const before of [true, false]) {
		const value = structuredClone(config);
		const steps = value.main[1].steps;
		steps.splice(before ? 0 : steps.length, 0, { kind: 'statement', id: 'S-004' });
		assert.throws(() => resolve(value), /functional-possibilities.*S-004.*duplicate primary placement/);
	}
});

test('unplaced statements including premise-only appearances, arguments, and future records fail coverage', () => {
	const premiseOnly = structuredClone(config);
	premiseOnly.main[0].steps.shift();
	assert.throws(() => resolve(premiseOnly), /Unplaced Model records: S-017/);
	const omittedArgument = structuredClone(config);
	omittedArgument.main[1].steps = [{ kind: 'statement', id: 'S-004' }];
	assert.throws(() => resolve(omittedArgument), /Unplaced Model records: ARG-005/);
	const future = { ...statements[0], data: { ...statements[0].data, id: 'S-999', slug: 'new-future-record' } };
	assert.throws(() => resolveReadingPath(config, buildReasoningIndex([...statements, future], argumentsList)), /Unplaced Model records: S-999/);
});

test('canonical version mismatches and missing endpoints cannot be omitted or substituted', () => {
	for (const collection of ['statements', 'arguments'] as const) {
		const changedStatements = structuredClone(statements);
		const changedArguments = structuredClone(argumentsList);
		const entry = collection === 'statements' ? changedStatements[0] : changedArguments[0];
		Object.assign(entry.data, { version: '0.2' });
		assert.throws(() => resolveReadingPath(config, buildReasoningIndex(changedStatements, changedArguments)), /version 0.1 does not match .* version 0.2/);
	}
	for (const endpoint of ['premises', 'conclusion'] as const) {
		const changed = structuredClone(argumentsList);
		Object.assign(changed[0].data, { [endpoint]: endpoint === 'premises' ? ['S-999'] : 'S-999' });
		assert.throws(() => buildReasoningIndex(statements, changed), /ARG-\d{3} references missing (premise|conclusion) S-999/);
	}
});

test('shared conclusions and cycles retain finite full-collection participation independently of dependency topology', () => {
	const { entries, argumentsFixture, path } = smallFixture();
	entries[2].data.upstream = [{ id: 'S-100', role: 'conceptual', note: 'Separate revision dependency.' }];
	const reasoning = buildReasoningIndex(entries, argumentsFixture);
	assert.equal(validateStatements(entries).size, 3);
	assert.deepEqual(reasoning.concludingArguments.get('S-450')!.map(({ entry }) => entry.data.id), ['ARG-901', 'ARG-100']);
	assert.deepEqual(reasoning.premiseArguments.get('S-450')!.map(({ entry }) => entry.data.id), ['ARG-450']);
	assert.deepEqual(reasoning.premiseArguments.get('S-901')!.map(({ entry }) => entry.data.id), ['ARG-901', 'ARG-100']);
	assert.deepEqual(reasoning.concludingArguments.get('S-100'), []);
	const resolved = resolveReadingPath(path, reasoning);
	assert.deepEqual(resolved.diagnostics.map(({ argumentId, premiseId }) => [argumentId, premiseId]), [['ARG-901', 'S-901']]);
	assert.equal(resolved.primaryStatementLocations.get('S-450')!.anchor, 'reading-main-branch--argument-arg-901--conclusion');
	assert.equal(resolved.statementLocations.get('S-450')!.filter(({ role }) => role === 'conclusion').length, 2);
	assert.deepEqual(resolveReadingPath(path, buildReasoningIndex(entries.toReversed(), argumentsFixture.toReversed())).primaryStatementLocations, resolved.primaryStatementLocations);
	entries[1].data.upstream = [{ id: 'S-450', role: 'conceptual', note: 'A forbidden dependency cycle.' }];
	assert.throws(() => buildReasoningIndex(entries, argumentsFixture), /Model dependency cycle/);
});

test('primary location precedence is main, orientation, then supporting, with every alternative retained', () => {
	const { entries, argumentsFixture, path } = smallFixture();
	path.orientation = path.supporting.pop();
	const mainFirst = resolveReadingPath(path, buildReasoningIndex(entries, argumentsFixture));
	assert.equal(mainFirst.primaryStatementLocations.get('S-450')!.placement, 'main');
	const moved = path.main[0].steps.splice(1, 1)[0];
	path.supporting = [{ id: 'extra', title: 'Extra', steps: [moved] }];
	const orientationFirst = resolveReadingPath(path, buildReasoningIndex(entries, argumentsFixture));
	assert.equal(orientationFirst.primaryStatementLocations.get('S-450')!.placement, 'orientation');
	path.supporting.push(path.orientation!);
	delete path.orientation;
	const supportingFirst = resolveReadingPath(path, buildReasoningIndex(entries, argumentsFixture));
	assert.equal(supportingFirst.primaryStatementLocations.get('S-450')!.sectionId, 'extra');
});

test('premises outside main still resolve fully and optional sections do not conceal forward references', () => {
	const value = structuredClone(config);
	const moved = value.main[0].steps.shift()!;
	value.supporting[0].steps.push(moved);
	const path = resolve(value);
	assert.deepEqual(path.diagnostics.map(({ argumentId, premiseId }) => [argumentId, premiseId]), [['ARG-005', 'S-017']]);
	assert.equal(path.diagnostics[0].primaryLocation.placement, 'supporting');
	const step = path.main[1].steps[0];
	assert.equal(step.kind, 'argument');
	if (step.kind !== 'argument') assert.fail();
	assert.deepEqual(step.argument.premises.map(({ entry }) => entry.data.id), index.argumentsById.get('ARG-005')!.entry.data.premises);
	value.supporting[0].steps.pop();
	value.orientation!.steps.push(moved);
	assert.equal(resolve(value).diagnostics[0].primaryLocation.placement, 'orientation');
	value.orientation!.steps.pop();
	value.main[2].steps.push(moved);
	assert.match(resolve(value).diagnostics[0].message, /ARG-005.*S-017.*improvement-and-purpose.*not a logical error/);
});

test('repeated premises share canonical identity and helpers do not mutate frozen inputs or invent relationships', () => {
	function freeze(value: unknown) {
		if (!value || typeof value !== 'object') return;
		Object.values(value).forEach(freeze);
		Object.freeze(value);
	}
	const sourceStatements = structuredClone(statements);
	const sourceArguments = structuredClone(argumentsList);
	const sourceConfig = structuredClone(config);
	const before = structuredClone({ sourceStatements, sourceArguments, sourceConfig });
	freeze(sourceStatements); freeze(sourceArguments); freeze(sourceConfig);
	const reasoning = buildReasoningIndex(sourceStatements, sourceArguments);
	const path = resolveReadingPath(sourceConfig, reasoning);
	const value = reasoning.statementsById.get('S-022')!;
	for (const argument of reasoning.premiseArguments.get('S-022')!) assert.ok(argument.premises.includes(value));
	const locations = path.statementLocations.get('S-022')!;
	assert.ok(locations.filter(({ role }) => role === 'premise').length > 1);
	assert.equal(new Set(locations.map(({ anchor }) => anchor)).size, locations.length);
	assert.equal(path.primaryStatementLocations.get('S-026')!.role, 'conclusion');
	assert.deepEqual({ sourceStatements, sourceArguments, sourceConfig }, before);
	// Biological adjacency, the mechanism's dependency, and related/source links supply no new inference.
	assert.deepEqual(reasoning.concludingArguments.get('S-007'), []);
	assert.deepEqual(reasoning.premiseArguments.get('S-028'), []);
	assert.deepEqual(reasoning.premiseArguments.get('S-012'), []);
});
