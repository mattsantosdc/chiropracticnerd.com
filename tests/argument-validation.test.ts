import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	inferenceKinds,
	type ArgumentEntry,
	validateArguments,
} from '../src/lib/arguments.ts';
import { type StatementEntry, validateStatements } from '../src/lib/statements.ts';

function statementEntry(id: string, upstream: StatementEntry['data']['upstream'] = []) {
	return {
		id: id.toLowerCase(),
		collection: 'statements',
		data: {
			id,
			slug: `entry-${id.toLowerCase()}`,
			title: id,
			statement: `${id} claim`,
			summary: `${id} summary`,
			domain: 'framework',
			statementType: 'framework',
			confidence: 'not-applicable',
			order: 0,
			upstream,
			related: [],
			version: '0.1',
			updated: new Date('2026-01-01'),
			references: [],
		},
	} as unknown as StatementEntry;
}

type ArgumentOverrides = {
	id?: string;
	slug?: string;
	premises?: string[];
	conclusion?: string;
	inferenceKind?: string;
};

function argument(overrides: ArgumentOverrides = {}) {
	const id = overrides.id ?? 'ARG-001';
	return {
		id: id.toLowerCase(),
		collection: 'arguments',
		data: {
			id,
			slug: overrides.slug ?? `route-for-${id.toLowerCase()}`,
			title: id,
			summary: `${id} summary`,
			premises: overrides.premises ?? ['S-001'],
			conclusion: overrides.conclusion ?? 'S-002',
			inferenceKind: overrides.inferenceKind ?? 'defeasible',
			scheme: 'test scheme',
			version: '0.1',
			updated: new Date('2026-01-01'),
		},
	} as unknown as ArgumentEntry;
}

const statements = [statementEntry('S-001'), statementEntry('S-002'), statementEntry('S-003')];

describe('argument vocabulary and identity', () => {
	test('recognizes only the initial inference kinds', () => {
		assert.deepEqual(inferenceKinds, ['deductive', 'defeasible']);
		assert.throws(
			() => validateArguments([argument({ inferenceKind: 'logical' })], statements),
			/unknown inference kind logical/,
		);
	});

	test('keeps permanent IDs independent of mutable slugs', () => {
		assert.equal(
			validateArguments([argument({ id: 'ARG-142', slug: 'a-completely-different-route' })], statements)
				.size,
			1,
		);
		assert.throws(
			() => validateArguments([argument({ id: 'ARG-1' })], statements),
			/Invalid argument id/,
		);
	});

	test('rejects duplicate IDs and routes independently', () => {
		assert.throws(
			() =>
				validateArguments(
					[argument(), argument({ slug: 'another-route' })],
					statements,
				),
			/Duplicate argument id/,
		);
		assert.throws(
			() =>
				validateArguments(
					[argument(), argument({ id: 'ARG-002', slug: 'route-for-arg-001' })],
					statements,
				),
			/Duplicate argument slug/,
		);
	});
});

describe('argument references', () => {
	test('requires at least one existing, unique premise', () => {
		assert.throws(
			() => validateArguments([argument({ premises: [] })], statements),
			/requires at least one premise/,
		);
		assert.throws(
			() => validateArguments([argument({ premises: ['S-999'] })], statements),
			/references missing premise S-999/,
		);
		assert.throws(
			() => validateArguments([argument({ premises: ['S-001', 'S-001'] })], statements),
			/duplicate premise S-001/,
		);
	});

	test('requires an existing conclusion that is not a premise', () => {
		assert.throws(
			() => validateArguments([argument({ conclusion: 'S-999' })], statements),
			/references missing conclusion S-999/,
		);
		assert.throws(
			() =>
				validateArguments(
					[argument({ premises: ['S-001', 'S-002'], conclusion: 'S-002' })],
					statements,
				),
			/cannot use conclusion S-002 as a premise/,
		);
	});

	test('allows reasoning cycles without changing dependency DAG validation', () => {
		const dependencyStatements = [
			statementEntry('S-001'),
			statementEntry('S-002', [
				{ id: 'S-001', role: 'methodological', note: 'S-001 frames S-002.' },
			]),
		];
		validateStatements(dependencyStatements);

		const cyclicArguments = [
			argument({ id: 'ARG-001', premises: ['S-001'], conclusion: 'S-002' }),
			argument({ id: 'ARG-002', premises: ['S-002'], conclusion: 'S-001' }),
		];
		assert.equal(validateArguments(cyclicArguments, dependencyStatements).size, 2);
		assert.equal(validateStatements(dependencyStatements).size, 2);
	});
});
