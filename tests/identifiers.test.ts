import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	argumentIdPattern,
	argumentSemanticIdentifier,
	dependencyRoleSemanticIdentifier,
	dependencySemanticIdentifier,
	statementSemanticIdentifier,
	statementIdPattern,
} from '../src/lib/identifiers.ts';

test('reserves stable semantic identifier patterns independently of slugs', () => {
	assert.equal(
		statementSemanticIdentifier('S-004'),
		'https://chiropracticnerd.com/id/statement/S-004',
	);
	assert.equal(
		dependencySemanticIdentifier('S-004', 'S-005'),
		'https://chiropracticnerd.com/id/dependency/S-004--S-005',
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
	assert.doesNotMatch('S-014', argumentIdPattern);
});

test('statement identity uses the current scheme without historical aliases', () => {
	assert.match('S-001', statementIdPattern);
	assert.doesNotMatch('M-001', statementIdPattern);
});
