import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { collections } from '../src/content.config.ts';
import { resolveFormalOpposition, literalText } from '../src/lib/formal-opposition.mjs';
import { revisionReach } from '../src/lib/revision-graph.mjs';
import { buildSnapshot, deriveImpact } from '../scripts/model-review-impact.mjs';
import { collectInputs } from '../scripts/model-audit.mjs';
import { loadCanonicalContent } from './helpers/content.ts';

const { statements: workingStatements, argumentsList: workingArguments } = await loadCanonicalContent();
const workingPremises = JSON.parse(readFileSync('reasoning/model-bindings.json', 'utf8')).ordinaryPremises;
const blank = () => ({ schemaVersion: 1, signature: '', statements: {}, applications: {}, ordinaryPremises: [], undercutters: [] });


function fixture() {
	const alternatives = ['S-033', 'S-034'].map((id) => ({ data: collections.alternatives.schema.parse({ ...workingStatements[0].data, id, slug: `test-${id.toLowerCase()}`, title: `Synthetic ${id}`, statement: `Synthetic test proposition ${id}.`, semanticUses: [], related: [] }), body: 'Test stipulation only.' }));
	const alternativeArguments = [{ data: collections.alternativeArguments.schema.parse({ ...workingArguments[0].data, id: 'ARG-011', slug: 'synthetic-inference', premises: ['S-034'], conclusion: 'S-033', inferenceKind: 'defeasible', scheme: 'test stipulation' }), body: 'Test inference only.' }];
	const bindings: any = blank();
	for (const { data } of alternatives) bindings.statements[data.id] = { text: data.statement, formula: data.id, representation: 'opaque-proposition' };
	for (const { data } of alternativeArguments) bindings.applications[data.id] = Object.fromEntries(['premises', 'conclusion', 'inferenceKind', 'scheme'].map((key) => [key, data[key]]));
	bindings.undercutters = [{ statement: 'S-033', rule: 'ARG-008', rationale: 'Synthetic exception to this inference.' }];
	return { workingStatements, workingArguments, alternatives, alternativeArguments, bindings, workingPremises };
}

test('the empty canonical opposition corpus preserves working premise membership', () => {
	const bindings = JSON.parse(readFileSync('reasoning/opposition-bindings.json', 'utf8'));
	const corpus = resolveFormalOpposition({ workingStatements, workingArguments, alternatives: [], alternativeArguments: [], bindings, workingPremises });
	assert.deepEqual(corpus.ordinaryPremises, workingPremises);
	assert.equal(corpus.hasContent, false);
});

test('alternative schemas retain evidence requirements and reject authored adoption or acceptance', () => {
	const f = fixture();
	for (const property of [{ role: 'hypothetical' }, { status: 'accepted' }, { priority: 100 }, { upstream: [] }]) assert.equal(collections.alternatives.schema.safeParse({ ...f.alternatives[0].data, ...property }).success, false);
	assert.equal(collections.alternatives.schema.safeParse({ ...f.alternatives[0].data, statementType: 'empirical', confidence: 'unresolved', whatWouldChange: undefined }).success, false);
	assert.equal(collections.alternativeArguments.schema.safeParse({ ...f.alternativeArguments[0].data, conclusion: '-S-029' }).success, true);
	assert.equal(collections.arguments.schema.safeParse({ ...f.alternativeArguments[0].data, conclusion: '-S-029' }).success, false);
	for (const slug of ['alternatives', 'alternatives/nested']) assert.equal(collections.statements.schema.safeParse({ ...f.alternatives[0].data, slug }).success, false);
});

test('recording does not assume, and upstream opposition reaches question context and revision impact', () => {
	const corpus = resolveFormalOpposition(fixture());
	assert.equal(corpus.ordinaryPremises.includes('S-033'), false);
	assert.deepEqual(corpus.contextFor('S-005').records.sort(), ['ARG-011', 'S-033', 'S-034']);
	assert.equal(corpus.contextFor('S-027').records.length, 0);
	assert.ok(revisionReach(corpus.edges, ['S-034']).has('S-005'));
	assert.equal(literalText('-S-011', corpus.statements), `It is not the case that: ${corpus.statements.get('S-011').data.statement}`);
});

test('bindings, duplicate identities, unsupported fields, targets and admissions fail visibly', () => {
	const mutations = [
		(f: any) => { f.bindings.statements['S-033'].text = 'Unreviewed wording'; },
		(f: any) => { f.bindings.applications['ARG-011'].premises = ['S-999']; },
		(f: any) => { f.bindings.ordinaryPremises = [{ literal: 'S-011', rationale: 'Duplicate existing assumption' }]; },
		(f: any) => { f.bindings.ordinaryPremises = [{ literal: '-S-011', rationale: '' }]; },
		(f: any) => { f.bindings.undercutters[0].rule = 'ARG-007'; },
		(f: any) => { f.bindings.undercutters[0].rule = 'ARG-999'; },
		(f: any) => { f.bindings.undercutters.push(f.bindings.undercutters[0]); },
		(f: any) => { f.bindings.priorities = {}; },
		(f: any) => { f.alternatives[0].data.id = 'S-011'; },
		(f: any) => { f.alternativeArguments[0].data.id = 'ARG-008'; },
	];
	for (const mutate of mutations) { const f = fixture(); mutate(f); assert.throws(() => resolveFormalOpposition(f)); }
});

test('opposition removals and admission changes retain old attack paths in scoped review', () => {
	const f = fixture();
	const packet = collectInputs(process.cwd());
	const sources = { ...packet.sources };
	const subjects = [...packet.subjects];
	for (const [directory, entries] of [['alternatives', f.alternatives], ['alternative-arguments', f.alternativeArguments]] as const) {
		for (const { data, body } of entries) {
			const path = `src/content/model/${directory}/${data.id}.md`;
			sources[path] = `---\n${JSON.stringify(data)}\n---\n${body}`;
			subjects.push(path);
		}
	}
	const bindingPath = 'reasoning/opposition-bindings.json';
	sources[bindingPath] = JSON.stringify(f.bindings);
	const before = buildSnapshot(sources, subjects);
	f.bindings.undercutters = [];
	sources[bindingPath] = JSON.stringify(f.bindings);
	const after = buildSnapshot(sources, subjects);
	const removed = deriveImpact(before, after);
	assert.ok(removed.reasons['S-005'].some((r: any) => r.change === 'removed' && r.unit.includes('undercut')));
	assert.equal(removed.reasons['S-027'], undefined);
	f.bindings.ordinaryPremises = [{ literal: '-S-011', rationale: 'Synthetic full negation, not a null individual observation.' }];
	sources[bindingPath] = JSON.stringify(f.bindings);
	const admission = deriveImpact(after, buildSnapshot(sources, subjects));
	assert.ok(admission.reasons['S-028']);
	assert.ok(admission.reasons['S-005']);
	assert.ok(admission.reasons['S-012']); // The explicitly retained semantic use also requires review.
	assert.equal(admission.reasons['S-017'], undefined);
});
