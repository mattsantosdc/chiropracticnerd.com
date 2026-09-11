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
		modelSemanticIdentifier('M-004'),
		'https://chiropracticnerd.com/id/model/M-004',
	);
	assert.equal(
		dependencySemanticIdentifier('M-004', 'M-005'),
		'https://chiropracticnerd.com/id/dependency/M-004--M-005',
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
	assert.doesNotMatch('M-014', argumentIdPattern);
});
