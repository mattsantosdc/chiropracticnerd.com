import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	dependencyRoles,
	getRelatedStatements,
	type StatementEntry,
	sortStatements,
	validateStatements,
} from '../src/lib/statements.ts';

type TestDependency = {
	id: string;
	role: string;
	note: string;
};

type EntryOverrides = {
	slug?: string;
	domain?: StatementEntry['data']['domain'];
	order?: number;
	upstream?: TestDependency[];
	related?: string[];
	statementType?: StatementEntry['data']['statementType'];
	confidence?: StatementEntry['data']['confidence'];
	whatWouldChange?: string;
};

function entry(id: string, overrides: EntryOverrides = {}) {
	return {
		id: id.toLowerCase(),
		collection: 'statements',
		data: {
			id,
			slug: overrides.slug ?? id.toLowerCase(),
			title: id,
			statement: `${id} claim`,
			summary: `${id} summary`,
			domain: overrides.domain ?? 'framework',
			statementType: overrides.statementType ?? 'framework',
			confidence: overrides.confidence ?? 'not-applicable',
			order: overrides.order ?? 0,
			upstream: overrides.upstream ?? [],
			related: overrides.related ?? [],
			version: '0.1',
			updated: new Date('2026-01-01'),
			references: [],
			whatWouldChange: overrides.whatWouldChange,
		},
	} as unknown as StatementEntry;
}

const dependency = (id: string, role: string, note = `Depends directly on ${id}.`) => ({
	id,
	role,
	note,
});

describe('neutral statement identifiers', () => {
	test('requires S-### regardless of domain', () => {
		for (const id of ['S-001', 'S-142', 'S-999']) {
			for (const domain of ['framework', 'philosophy', 'science', 'art'] as const) {
				assert.equal(validateStatements([entry(id, { domain })]).size, 1);
			}
		}
		for (const id of ['M-001', 'F-001', 'P-001', 'A-001', 'ARG-001', 'X-001', 's-001', 'S-1', 'S-0001', 'S-ABC', ' S-001', 'S-001x']) {
			assert.throws(() => validateStatements([entry(id)]), /Invalid statement id/);
		}
	});

	test('requires IDs to be unique across domains', () => {
		assert.throws(
			() => validateStatements([
				entry('S-142', { domain: 'science', slug: 'science/example' }),
				entry('S-142', { domain: 'art', slug: 'art/example' }),
			]),
			/Duplicate statement id/,
		);
	});

	test('sorts by domain and order independently of IDs, including ties', () => {
		const entries = [
			entry('S-001', { domain: 'art', order: 0 }),
			entry('S-999', { domain: 'science', order: 10 }),
			entry('S-002', { domain: 'science', order: 20 }),
			entry('S-800', { domain: 'framework', order: 30 }),
			entry('S-003', { domain: 'science', order: 10 }),
		];
		const expected = [entries[3], entries[1], entries[4], entries[2], entries[0]];
		assert.deepEqual(sortStatements(entries), expected);
		const originalSequence = [...entries];
		entries.forEach((item, index) => { item.data.id = `M-${String(100 - index).padStart(3, '0')}`; });
		assert.deepEqual(sortStatements(entries), expected);
		assert.deepEqual(entries, originalSequence);
	});
});

describe('dependency vocabulary', () => {
	test('contains exactly the five approved roles', () => {
		assert.deepEqual(dependencyRoles, [
			'methodological',
			'normative',
			'conceptual',
			'empirical',
			'practical',
		]);
	});

	test('accepts a valid acyclic graph using every role', () => {
		const entries = [
			entry('S-001'),
			entry('S-002', { upstream: [dependency('S-001', 'methodological')] }),
			entry('S-004', { upstream: [dependency('S-002', 'normative')] }),
			entry('S-007', { upstream: [dependency('S-004', 'conceptual')] }),
			entry('S-008', { upstream: [dependency('S-007', 'empirical')] }),
			entry('S-014', { upstream: [dependency('S-008', 'practical')] }),
		];

		assert.equal(validateStatements(entries).size, entries.length);
	});

	test('rejects an unknown role', () => {
		assert.throws(
			() =>
				validateStatements([
					entry('S-001'),
					entry('S-002', { upstream: [dependency('S-001', 'logical')] }),
				]),
			/unknown dependency role logical/,
		);
	});

	test('rejects a blank explanatory note', () => {
		assert.throws(
			() =>
				validateStatements([
					entry('S-001'),
					entry('S-002', { upstream: [dependency('S-001', 'conceptual', '  ')] }),
				]),
			/requires an explanatory note/,
		);
	});
});

describe('graph integrity', () => {
	test('requires empirical confidence and revision conditions', () => {
		assert.throws(
			() =>
				validateStatements([
					entry('S-007', {
						statementType: 'empirical',
						confidence: 'not-applicable',
						whatWouldChange: 'A valid test would change this.',
					}),
				]),
			/requires a confidence assessment/,
		);
		assert.throws(
			() =>
				validateStatements([
					entry('S-007', { statementType: 'empirical', confidence: 'unresolved' }),
				]),
			/requires whatWouldChange/,
		);
		assert.equal(
			validateStatements([
				entry('S-007', {
					statementType: 'empirical',
					confidence: 'unresolved',
					whatWouldChange: 'A valid test would change this.',
				}),
			]).size,
			1,
		);
	});

	test('rejects duplicate IDs and slugs', () => {
		assert.throws(() => validateStatements([entry('S-001'), entry('S-001')]), /Duplicate statement id/);
		assert.throws(
			() => validateStatements([entry('S-001', { slug: 'same' }), entry('S-002', { slug: 'same' })]),
			/Duplicate statement slug/,
		);
	});

	test('reserves the arguments route namespace for structured arguments', () => {
		assert.throws(
			() => validateStatements([entry('S-001', { slug: 'arguments' })]),
			/statement slug uses reserved route: arguments/,
		);
		assert.throws(
			() => validateStatements([entry('S-001', { slug: 'arguments/example' })]),
			/statement slug uses reserved route: arguments\/example/,
		);
		assert.equal(validateStatements([entry('S-001', { slug: 'argumentation' })]).size, 1);
	});

	test('rejects missing and self dependencies', () => {
		assert.throws(
			() => validateStatements([entry('S-001', { upstream: [dependency('S-999', 'conceptual')] })]),
			/references missing statement id S-999/,
		);
		assert.throws(
			() => validateStatements([entry('S-001', { upstream: [dependency('S-001', 'conceptual')] })]),
			/cannot reference itself/,
		);
	});

	test('rejects duplicate dependencies and dependency cycles', () => {
		assert.throws(
			() =>
				validateStatements([
					entry('S-001'),
					entry('S-002', {
						upstream: [
							dependency('S-001', 'conceptual'),
							dependency('S-001', 'empirical'),
						],
					}),
				]),
			/duplicate upstream dependency S-001/,
		);
		assert.throws(
			() =>
				validateStatements([
					entry('S-001', { upstream: [dependency('S-002', 'conceptual')] }),
					entry('S-002', { upstream: [dependency('S-001', 'conceptual')] }),
				]),
			/Model dependency cycle/,
		);
	});

	test('rejects duplicate, reciprocal, and dependency-linked related entries', () => {
		assert.throws(
			() => validateStatements([entry('S-001', { related: ['S-002', 'S-002'] }), entry('S-002')]),
			/duplicate related entry S-002/,
		);
		assert.throws(
			() =>
				validateStatements([
					entry('S-001', { related: ['S-002'] }),
					entry('S-002', { related: ['S-001'] }),
				]),
			/duplicate related link/,
		);
		assert.throws(
			() =>
				validateStatements([
					entry('S-001', { related: ['S-002'] }),
					entry('S-002', { upstream: [dependency('S-001', 'methodological')] }),
				]),
			/cannot be both dependency-linked and related/,
		);
	});

	test('resolves an undirected related link from either endpoint', () => {
		const entries = [entry('S-001', { related: ['S-002'] }), entry('S-002'), entry('S-003')];
		validateStatements(entries);

		assert.deepEqual(getRelatedStatements(entries, 'S-001').map((item) => item.data.id), ['S-002']);
		assert.deepEqual(getRelatedStatements(entries, 'S-002').map((item) => item.data.id), ['S-001']);
	});
});
