import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateQuestions } from '../src/lib/questions.ts';

const questions = JSON.parse(readFileSync('src/data/model-questions.json', 'utf8'));
const statements = new Set(['S-005', 'S-011', 'S-022']);
const argumentsList = new Set(['ARG-002', 'ARG-007']);

test('critical questions preserve targets without becoming adopted counterpremises', () => {
	assert.equal(validateQuestions(questions, statements, argumentsList).length, 6);
	for (const extra of [{ status: 'accepted' }, { ordinaryPremise: true }, { defeats: 'ARG-007' }]) {
		assert.throws(() => validateQuestions([{ ...questions[0], ...extra }], statements, argumentsList));
	}
});

test('questions reject duplicate identities, missing targets and wrong challenge types', () => {
	assert.throws(() => validateQuestions([questions[0], questions[0]], statements, argumentsList), /duplicate/);
	assert.throws(() => validateQuestions([{ ...questions[0], target: 'S-999' }], statements, argumentsList), /unknown/);
	assert.throws(() => validateQuestions([{ ...questions[0], kind: 'inference' }], statements, argumentsList), /argument/);
	assert.throws(() => validateQuestions([{ ...questions[0], response: '' }], statements, argumentsList), /requires/);
});
