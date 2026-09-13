import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collections } from '../src/content.config.ts';
import { collectInputs, readReview } from '../scripts/model-audit.mjs';
import { validateStatements } from '../src/lib/statements.ts';
import { validateArguments } from '../src/lib/arguments.ts';
import { loadCanonicalContent, markdownPaths } from './helpers/content.ts';

const { statements, argumentsList } = await loadCanonicalContent();
const statementData = statements[0].data;
const argumentData = argumentsList[0].data;

test('schemas accept current statement IDs and reject old IDs at every endpoint', () => {
	assert.ok(collections.statements.schema.safeParse(statementData).success);
	assert.ok(collections.arguments.schema.safeParse(argumentData).success);
	for (const data of [
		{ ...statementData, id: 'M-001' },
		{ ...statementData, upstream: [{ id: 'M-001', role: 'conceptual', note: 'Old endpoint.' }] },
		{ ...statementData, related: ['M-001'] },
	]) assert.equal(collections.statements.schema.safeParse(data).success, false);
	for (const data of [
		{ ...argumentData, premises: ['M-001'] },
		{ ...argumentData, conclusion: 'M-001' },
	]) assert.equal(collections.arguments.schema.safeParse(data).success, false);
});

test('legacy fields fail even alongside valid replacement fields', () => {
	for (const legacy of [{ claim: 'Old field' }, { claimType: 'framework' }]) {
		assert.equal(collections.statements.schema.safeParse({ ...statementData, ...legacy }).success, false);
	}
	const { statement, statementType, ...rest } = statementData;
	assert.equal(collections.statements.schema.safeParse({ ...rest, claim: statement, claimType: statementType }).success, false);
});

test('statement classification enums and empirical requirements are preserved', () => {
	for (const domain of ['framework', 'philosophy', 'science', 'art']) {
		for (const statementType of ['framework', 'definition', 'empirical', 'mixed', 'value', 'strategy']) {
			assert.ok(collections.statements.schema.safeParse({ ...statementData, domain, statementType, confidence: 'unresolved', whatWouldChange: 'An adequate test.' }).success);
		}
	}
	for (const override of [
		{ domain: 'application' }, { statementType: 'logical' },
		{ statementType: 'empirical', confidence: 'not-applicable' },
		{ statementType: 'empirical', whatWouldChange: undefined },
		{ statementType: 'empirical', whatWouldChange: ' ' },
	]) assert.equal(collections.statements.schema.safeParse({ ...statementData, ...override }).success, false);
});

test('real collections load independently and completely from the canonical sibling directories', () => {
	assert.deepEqual(Object.keys(collections).sort(), ['arguments', 'articles', 'statements']);
	for (const [name, records] of [['statements', statements], ['arguments', argumentsList]] as const) {
		const paths = markdownPaths(`src/content/model/${name}`);
		assert.ok(paths.length > 0);
		assert.deepEqual(records.map((record) => record.filePath).sort(), paths);
		for (const record of records) {
			assert.equal(record.collection, name);
			assert.match(record.data.id, name === 'statements' ? /^S-\d{3}$/ : /^ARG-\d{3}$/);
			// Slugs currently supply Astro's loader IDs; semantic references use data.id.
			assert.equal(record.id, record.data.slug);
			assert.notEqual(record.id, record.data.id);
		}
	}
});

test('every actual dependency, related link, and argument endpoint resolves', () => {
	assert.equal(validateStatements(statements).size, statements.length);
	assert.equal(validateArguments(argumentsList, statements).size, argumentsList.length);
});

test('review packet and records contain every loaded canonical record exactly once', () => {
	const paths = [...statements, ...argumentsList].map((record) => record.filePath).sort();
	const packet = collectInputs(process.cwd());
	assert.equal(new Set(packet.subjects).size, packet.subjects.length);
	assert.deepEqual(packet.subjects, paths);
	assert.deepEqual(Object.keys(readReview(process.cwd()).records).sort(), paths);
});
