import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	dependencyRoles,
	getRelatedEntries,
	type ModelEntry,
	sortModelEntries,
	validateModel,
} from '../src/lib/model.ts';

type TestDependency = {
	id: string;
	role: string;
	note: string;
};

type EntryOverrides = {
	slug?: string;
	domain?: ModelEntry['data']['domain'];
	order?: number;
	upstream?: TestDependency[];
	related?: string[];
	claimType?: ModelEntry['data']['claimType'];
	confidence?: ModelEntry['data']['confidence'];
	whatWouldChange?: string;
};

function entry(id: string, overrides: EntryOverrides = {}) {
	return {
		id: id.toLowerCase(),
		collection: 'model',
		data: {
			id,
			slug: overrides.slug ?? id.toLowerCase(),
			title: id,
			claim: `${id} claim`,
			summary: `${id} summary`,
			domain: overrides.domain ?? 'framework',
			claimType: overrides.claimType ?? 'framework',
			confidence: overrides.confidence ?? 'not-applicable',
			order: overrides.order ?? 0,
			upstream: overrides.upstream ?? [],
			related: overrides.related ?? [],
			version: '0.1',
			updated: new Date('2026-01-01'),
			references: [],
			whatWouldChange: overrides.whatWouldChange,
		},
	} as unknown as ModelEntry;
}

const dependency = (id: string, role: string, note = `Depends directly on ${id}.`) => ({
	id,
	role,
	note,
});

describe('neutral Model identifiers', () => {
	test('requires M-### regardless of domain', () => {
		for (const id of ['M-001', 'M-142', 'M-999']) {
			for (const domain of ['framework', 'philosophy', 'science', 'art'] as const) {
				assert.equal(validateModel([entry(id, { domain })]).size, 1);
			}
		}
		for (const id of ['F-001', 'P-001', 'S-001', 'A-001', 'ARG-001', 'X-001', 'm-001', 'M-1', 'M-0001', 'M-ABC', ' M-001', 'M-001x']) {
			assert.throws(() => validateModel([entry(id)]), /Invalid model id/);
		}
	});

	test('requires IDs to be unique across domains', () => {
		assert.throws(
			() => validateModel([
				entry('M-142', { domain: 'science', slug: 'science/example' }),
				entry('M-142', { domain: 'art', slug: 'art/example' }),
			]),
			/Duplicate model id/,
		);
	});

	test('sorts by domain and order independently of IDs, including ties', () => {
		const entries = [
			entry('M-001', { domain: 'art', order: 0 }),
			entry('M-999', { domain: 'science', order: 10 }),
			entry('M-002', { domain: 'science', order: 20 }),
			entry('M-800', { domain: 'framework', order: 30 }),
			entry('M-003', { domain: 'science', order: 10 }),
		];
		const expected = [entries[3], entries[1], entries[4], entries[2], entries[0]];
		assert.deepEqual(sortModelEntries(entries), expected);
		const originalSequence = [...entries];
		entries.forEach((item, index) => { item.data.id = `M-${String(100 - index).padStart(3, '0')}`; });
		assert.deepEqual(sortModelEntries(entries), expected);
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
			entry('M-001'),
			entry('M-002', { upstream: [dependency('M-001', 'methodological')] }),
			entry('M-004', { upstream: [dependency('M-002', 'normative')] }),
			entry('M-007', { upstream: [dependency('M-004', 'conceptual')] }),
			entry('M-008', { upstream: [dependency('M-007', 'empirical')] }),
			entry('M-014', { upstream: [dependency('M-008', 'practical')] }),
		];

		assert.equal(validateModel(entries).size, entries.length);
	});

	test('rejects an unknown role', () => {
		assert.throws(
			() =>
				validateModel([
					entry('M-001'),
					entry('M-002', { upstream: [dependency('M-001', 'logical')] }),
				]),
			/unknown dependency role logical/,
		);
	});

	test('rejects a blank explanatory note', () => {
		assert.throws(
			() =>
				validateModel([
					entry('M-001'),
					entry('M-002', { upstream: [dependency('M-001', 'conceptual', '  ')] }),
				]),
			/requires an explanatory note/,
		);
	});
});

describe('graph integrity', () => {
	test('requires empirical confidence and revision conditions', () => {
		assert.throws(
			() =>
				validateModel([
					entry('M-007', {
						claimType: 'empirical',
						confidence: 'not-applicable',
						whatWouldChange: 'A valid test would change this.',
					}),
				]),
			/requires a confidence assessment/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('M-007', { claimType: 'empirical', confidence: 'unresolved' }),
				]),
			/requires whatWouldChange/,
		);
		assert.equal(
			validateModel([
				entry('M-007', {
					claimType: 'empirical',
					confidence: 'unresolved',
					whatWouldChange: 'A valid test would change this.',
				}),
			]).size,
			1,
		);
	});

	test('rejects duplicate IDs and slugs', () => {
		assert.throws(() => validateModel([entry('M-001'), entry('M-001')]), /Duplicate model id/);
		assert.throws(
			() => validateModel([entry('M-001', { slug: 'same' }), entry('M-002', { slug: 'same' })]),
			/Duplicate model slug/,
		);
	});

	test('reserves the arguments route namespace for structured arguments', () => {
		assert.throws(
			() => validateModel([entry('M-001', { slug: 'arguments' })]),
			/model slug uses reserved route: arguments/,
		);
		assert.throws(
			() => validateModel([entry('M-001', { slug: 'arguments/example' })]),
			/model slug uses reserved route: arguments\/example/,
		);
		assert.equal(validateModel([entry('M-001', { slug: 'argumentation' })]).size, 1);
	});

	test('rejects missing and self dependencies', () => {
		assert.throws(
			() => validateModel([entry('M-001', { upstream: [dependency('M-999', 'conceptual')] })]),
			/references missing model id M-999/,
		);
		assert.throws(
			() => validateModel([entry('M-001', { upstream: [dependency('M-001', 'conceptual')] })]),
			/cannot reference itself/,
		);
	});

	test('rejects duplicate dependencies and dependency cycles', () => {
		assert.throws(
			() =>
				validateModel([
					entry('M-001'),
					entry('M-002', {
						upstream: [
							dependency('M-001', 'conceptual'),
							dependency('M-001', 'empirical'),
						],
					}),
				]),
			/duplicate upstream dependency M-001/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('M-001', { upstream: [dependency('M-002', 'conceptual')] }),
					entry('M-002', { upstream: [dependency('M-001', 'conceptual')] }),
				]),
			/Model dependency cycle/,
		);
	});

	test('rejects duplicate, reciprocal, and dependency-linked related entries', () => {
		assert.throws(
			() => validateModel([entry('M-001', { related: ['M-002', 'M-002'] }), entry('M-002')]),
			/duplicate related entry M-002/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('M-001', { related: ['M-002'] }),
					entry('M-002', { related: ['M-001'] }),
				]),
			/duplicate related link/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('M-001', { related: ['M-002'] }),
					entry('M-002', { upstream: [dependency('M-001', 'methodological')] }),
				]),
			/cannot be both dependency-linked and related/,
		);
	});

	test('resolves an undirected related link from either endpoint', () => {
		const entries = [entry('M-001', { related: ['M-002'] }), entry('M-002'), entry('M-003')];
		validateModel(entries);

		assert.deepEqual(getRelatedEntries(entries, 'M-001').map((item) => item.data.id), ['M-002']);
		assert.deepEqual(getRelatedEntries(entries, 'M-002').map((item) => item.data.id), ['M-001']);
	});
});
