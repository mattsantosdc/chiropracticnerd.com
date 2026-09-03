import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	dependencyRoles,
	getRelatedEntries,
	type ModelEntry,
	validateModel,
} from '../src/lib/model.ts';

type TestDependency = {
	id: string;
	role: string;
	note: string;
};

type EntryOverrides = {
	slug?: string;
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
			domain: 'framework',
			claimType: overrides.claimType ?? 'framework',
			status: 'working',
			confidence: overrides.confidence ?? 'not-applicable',
			order: 0,
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
			entry('F-001'),
			entry('F-002', { upstream: [dependency('F-001', 'methodological')] }),
			entry('P-001', { upstream: [dependency('F-002', 'normative')] }),
			entry('S-001', { upstream: [dependency('P-001', 'conceptual')] }),
			entry('S-002', { upstream: [dependency('S-001', 'empirical')] }),
			entry('A-001', { upstream: [dependency('S-002', 'practical')] }),
		];

		assert.equal(validateModel(entries).size, entries.length);
	});

	test('rejects an unknown role', () => {
		assert.throws(
			() =>
				validateModel([
					entry('F-001'),
					entry('F-002', { upstream: [dependency('F-001', 'logical')] }),
				]),
			/unknown dependency role logical/,
		);
	});

	test('rejects a blank explanatory note', () => {
		assert.throws(
			() =>
				validateModel([
					entry('F-001'),
					entry('F-002', { upstream: [dependency('F-001', 'conceptual', '  ')] }),
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
					entry('S-001', {
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
					entry('S-001', { claimType: 'empirical', confidence: 'unresolved' }),
				]),
			/requires whatWouldChange/,
		);
		assert.equal(
			validateModel([
				entry('S-001', {
					claimType: 'empirical',
					confidence: 'unresolved',
					whatWouldChange: 'A valid test would change this.',
				}),
			]).size,
			1,
		);
	});

	test('rejects duplicate IDs and slugs', () => {
		assert.throws(() => validateModel([entry('F-001'), entry('F-001')]), /Duplicate model id/);
		assert.throws(
			() => validateModel([entry('F-001', { slug: 'same' }), entry('F-002', { slug: 'same' })]),
			/Duplicate model slug/,
		);
	});

	test('rejects missing and self dependencies', () => {
		assert.throws(
			() => validateModel([entry('F-001', { upstream: [dependency('F-999', 'conceptual')] })]),
			/references missing model id F-999/,
		);
		assert.throws(
			() => validateModel([entry('F-001', { upstream: [dependency('F-001', 'conceptual')] })]),
			/cannot reference itself/,
		);
	});

	test('rejects duplicate dependencies and dependency cycles', () => {
		assert.throws(
			() =>
				validateModel([
					entry('F-001'),
					entry('F-002', {
						upstream: [
							dependency('F-001', 'conceptual'),
							dependency('F-001', 'empirical'),
						],
					}),
				]),
			/duplicate upstream dependency F-001/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('F-001', { upstream: [dependency('F-002', 'conceptual')] }),
					entry('F-002', { upstream: [dependency('F-001', 'conceptual')] }),
				]),
			/Model dependency cycle/,
		);
	});

	test('rejects duplicate, reciprocal, and dependency-linked related entries', () => {
		assert.throws(
			() => validateModel([entry('F-001', { related: ['F-002', 'F-002'] }), entry('F-002')]),
			/duplicate related entry F-002/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('F-001', { related: ['F-002'] }),
					entry('F-002', { related: ['F-001'] }),
				]),
			/duplicate related link/,
		);
		assert.throws(
			() =>
				validateModel([
					entry('F-001', { related: ['F-002'] }),
					entry('F-002', { upstream: [dependency('F-001', 'methodological')] }),
				]),
			/cannot be both dependency-linked and related/,
		);
	});

	test('resolves an undirected related link from either endpoint', () => {
		const entries = [entry('F-001', { related: ['F-002'] }), entry('F-002'), entry('F-003')];
		validateModel(entries);

		assert.deepEqual(getRelatedEntries(entries, 'F-001').map((item) => item.data.id), ['F-002']);
		assert.deepEqual(getRelatedEntries(entries, 'F-002').map((item) => item.data.id), ['F-001']);
	});
});
