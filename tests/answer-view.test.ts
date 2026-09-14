import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildAnswerView, resolveAnswerQuestions, answerHref } from '../src/lib/answer-view.ts';
import { buildReasoningIndex } from '../src/lib/reasoning.ts';
import { collections } from '../src/content.config.ts';
import { loadCanonicalContent } from './helpers/content.ts';
const { statements, argumentsList } = await loadCanonicalContent();
const index = buildReasoningIndex(statements, argumentsList);
const bindings = JSON.parse(readFileSync('reasoning/model-bindings.json', 'utf8'));
const view = (id: string) => buildAnswerView(index, id, bindings.ordinaryPremises);
const ids = (id: string) => view(id).groups.map(({statement}) => statement.entry.data.id);

test('purpose includes all upstream applications without downstream assessment or semantic-only references', () => {
	assert.deepEqual(new Set(ids('S-005')), new Set(['S-005','S-027','S-029','S-022','S-024','S-011','S-028']));
	assert.deepEqual(view('S-005').groups.flatMap(group => group.arguments.map(a => a.entry.data.id)), ['ARG-008','ARG-007','ARG-009']);
	assert.deepEqual(view('S-005').groups[0].arguments[0].premises.map(p => p.entry.data.id), ['S-027','S-029']);
	for (const id of ['S-014','S-015','S-016','S-012','S-021']) assert.ok(!ids('S-005').includes(id));
});

test('independent assumptions and alternative derivations remain separate and no leaf premise is invented', () => {
	const effect = view('S-011');
	assert.equal(effect.groups[0].assumed, true);
	assert.deepEqual(effect.groups[0].arguments.map(a => a.entry.data.id), ['ARG-009']);
	assert.deepEqual(ids('S-012'), ['S-012']);
	assert.deepEqual(ids('S-024'), ['S-024']);
	assert.equal(buildAnswerView(index, 'S-012', []).groups[0].assumed, false);
	const contrary = buildAnswerView(index, 'S-011', ['-S-011']);
	assert.equal(contrary.groups[0].assumed, false);
	assert.equal(contrary.groups[0].contraryAssumed, true);
	assert.equal(bindings.ordinaryPremises.length,23);
	assert.throws(() => buildAnswerView(index,'S-999',[]), /Unknown answer/);
	assert.throws(() => buildAnswerView(index,'S-005',['S-999']), /starting premise/);
	assert.throws(() => buildAnswerView(index,'S-005',['S-011','S-011']), /starting premise/);
});

test('shared premises, parallel applications and cycles terminate without discarding a route', () => {
	const clone = structuredClone(argumentsList[0]);
	clone.data = {...clone.data,id:'ARG-099',slug:'alternative-benefit',premises:['S-022','S-024','S-011'],conclusion:'S-027',inferenceKind:'defeasible'};
	const cycle = structuredClone(clone);
	cycle.data = {...cycle.data,id:'ARG-098',slug:'cycle-probe',premises:['S-005'],conclusion:'S-011'};
	const extended = buildReasoningIndex(statements,[...argumentsList,clone,cycle]);
	const result = buildAnswerView(extended,'S-005',bindings.ordinaryPremises);
	assert.equal(new Set(result.groups.map(g=>g.statement.entry.data.id)).size,result.groups.length);
	assert.equal(result.groups.find(g=>g.statement.entry.data.id==='S-027')!.arguments.length,2);
	assert.ok(result.groups.flatMap(g=>g.arguments).some(a=>a.entry.data.id==='ARG-098'));
	// This is a finite editorial view; the formal engine separately rejects productive cycles.
	assert.equal(result.groups.length,7);
});

test('entry questions resolve canonical answers and reject authored answer text or missing targets', () => {
	const input = JSON.parse(readFileSync('src/data/model-answer-questions.json','utf8'));
	const questions = resolveAnswerQuestions(input,index);
	assert.equal(questions.length,8);
	assert.equal(questions[0].href,answerHref(index.statementsById.get('S-005')!));
	for (const bad of [[...input,input[0]],[{...input[0],statement:'S-999'}],[{...input[0],answer:'Invented prose'}],[{...input[0],statement:'ARG-008'}]]) {
		assert.throws(() => resolveAnswerQuestions(bad,index));
	}
	for (const slug of ['answers','answers/nested','arguments','arguments/nested']) {
		assert.equal(collections.statements.schema.safeParse({...statements[0].data,slug}).success,false);
	}
});
