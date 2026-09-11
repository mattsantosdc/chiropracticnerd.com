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
			premises: overrides.premises ?? ['M-001'],
			conclusion: overrides.conclusion ?? 'M-002',
			inferenceKind: overrides.inferenceKind ?? 'defeasible',
			scheme: 'test scheme',
			version: '0.1',
			updated: new Date('2026-01-01'),
		},
	} as unknown as ArgumentEntry;
}

const models = [modelEntry('M-001'), modelEntry('M-002'), modelEntry('M-003')];

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
			() => validateArguments([argument({ premises: ['M-999'] })], models),
			/references missing premise M-999/,
		);
		assert.throws(
			() => validateArguments([argument({ premises: ['M-001', 'M-001'] })], models),
			/duplicate premise M-001/,
		);
	});

	test('requires an existing conclusion that is not a premise', () => {
		assert.throws(
			() => validateArguments([argument({ conclusion: 'M-999' })], models),
			/references missing conclusion M-999/,
		);
		assert.throws(
			() =>
				validateArguments(
					[argument({ premises: ['M-001', 'M-002'], conclusion: 'M-002' })],
					models,
				),
			/cannot use conclusion M-002 as a premise/,
		);
	});

	test('allows reasoning cycles without changing dependency DAG validation', () => {
		const dependencyModels = [
			modelEntry('M-001'),
			modelEntry('M-002', [
				{ id: 'M-001', role: 'methodological', note: 'M-001 frames M-002.' },
			]),
		];
		validateModel(dependencyModels);

		const cyclicArguments = [
			argument({ id: 'ARG-001', premises: ['M-001'], conclusion: 'M-002' }),
			argument({ id: 'ARG-002', premises: ['M-002'], conclusion: 'M-001' }),
		];
		assert.equal(validateArguments(cyclicArguments, dependencyModels).size, 2);
		assert.equal(validateModel(dependencyModels).size, 2);
	});
});
