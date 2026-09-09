import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	inferenceKinds,
	type ArgumentEntry,
	validateArguments,
} from '../src/lib/arguments.ts';
import { type ModelEntry, validateModel } from '../src/lib/model.ts';

function modelEntry(id: string, upstream: ModelEntry['data']['upstream'] = []) {
	return {
		id: id.toLowerCase(),
		collection: 'model',
		data: {
			id,
			slug: `entry-${id.toLowerCase()}`,
			title: id,
			claim: `${id} claim`,
			summary: `${id} summary`,
			domain: 'framework',
			claimType: 'framework',
			confidence: 'not-applicable',
			order: 0,
			upstream,
			related: [],
			version: '0.1',
			updated: new Date('2026-01-01'),
			references: [],
		},
	} as unknown as ModelEntry;
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
			premises: overrides.premises ?? ['F-001'],
			conclusion: overrides.conclusion ?? 'F-002',
			inferenceKind: overrides.inferenceKind ?? 'defeasible',
			scheme: 'test scheme',
			version: '0.1',
			updated: new Date('2026-01-01'),
		},
	} as unknown as ArgumentEntry;
}

const models = [modelEntry('F-001'), modelEntry('F-002'), modelEntry('F-003')];

describe('argument vocabulary and identity', () => {
	test('recognizes only the initial inference kinds', () => {
		assert.deepEqual(inferenceKinds, ['deductive', 'defeasible']);
		assert.throws(
			() => validateArguments([argument({ inferenceKind: 'logical' })], models),
			/unknown inference kind logical/,
		);
	});

	test('keeps permanent IDs independent of mutable slugs', () => {
		assert.equal(
			validateArguments([argument({ id: 'ARG-142', slug: 'a-completely-different-route' })], models)
				.size,
			1,
		);
		assert.throws(
			() => validateArguments([argument({ id: 'ARG-1' })], models),
			/Invalid argument id/,
		);
	});

	test('rejects duplicate IDs and routes independently', () => {
		assert.throws(
			() =>
				validateArguments(
					[argument(), argument({ slug: 'another-route' })],
					models,
				),
			/Duplicate argument id/,
		);
		assert.throws(
			() =>
				validateArguments(
					[argument(), argument({ id: 'ARG-002', slug: 'route-for-arg-001' })],
					models,
				),
			/Duplicate argument slug/,
		);
	});
});

describe('argument references', () => {
	test('requires at least one existing, unique premise', () => {
		assert.throws(
			() => validateArguments([argument({ premises: [] })], models),
			/requires at least one premise/,
		);
		assert.throws(
			() => validateArguments([argument({ premises: ['F-999'] })], models),
			/references missing premise F-999/,
		);
		assert.throws(
			() => validateArguments([argument({ premises: ['F-001', 'F-001'] })], models),
			/duplicate premise F-001/,
		);
	});

	test('requires an existing conclusion that is not a premise', () => {
		assert.throws(
			() => validateArguments([argument({ conclusion: 'F-999' })], models),
			/references missing conclusion F-999/,
		);
		assert.throws(
			() =>
				validateArguments(
					[argument({ premises: ['F-001', 'F-002'], conclusion: 'F-002' })],
					models,
				),
			/cannot use conclusion F-002 as a premise/,
		);
	});

	test('allows reasoning cycles without changing dependency DAG validation', () => {
		const dependencyModels = [
			modelEntry('F-001'),
			modelEntry('F-002', [
				{ id: 'F-001', role: 'methodological', note: 'F-001 frames F-002.' },
			]),
		];
		validateModel(dependencyModels);

		const cyclicArguments = [
			argument({ id: 'ARG-001', premises: ['F-001'], conclusion: 'F-002' }),
			argument({ id: 'ARG-002', premises: ['F-002'], conclusion: 'F-001' }),
		];
		assert.equal(validateArguments(cyclicArguments, dependencyModels).size, 2);
		assert.equal(validateModel(dependencyModels).size, 2);
	});
});
