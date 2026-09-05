import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	argumentIdPattern,
	argumentSemanticIdentifier,
	dependencyRoleSemanticIdentifier,
	dependencySemanticIdentifier,
	modelSemanticIdentifier,
} from '../src/lib/identifiers.ts';

test('reserves stable semantic identifier patterns independently of slugs', () => {
	assert.equal(
		modelSemanticIdentifier('P-001'),
		'https://chiropracticnerd.com/id/model/P-001',
	);
	assert.equal(
		dependencySemanticIdentifier('P-001', 'P-002'),
		'https://chiropracticnerd.com/id/dependency/P-001--P-002',
	);
	assert.equal(
		argumentSemanticIdentifier('ARG-001'),
		'https://chiropracticnerd.com/id/argument/ARG-001',
	);
	assert.equal(
		dependencyRoleSemanticIdentifier('normative'),
		'https://chiropracticnerd.com/vocab/dependency-role/normative',
	);
	assert.match('ARG-001', argumentIdPattern);
	assert.doesNotMatch('A-001', argumentIdPattern);
});
