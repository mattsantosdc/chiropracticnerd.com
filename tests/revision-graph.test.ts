import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildReasoningIndex } from '../src/lib/reasoning.ts';
import { revisionReach, theoryEdges } from '../src/lib/revision-graph.mjs';
import { collections } from '../src/content.config.ts';
import { loadCanonicalContent } from './helpers/content.ts';
const { statements, argumentsList } = await loadCanonicalContent();
const index = buildReasoningIndex(statements, argumentsList);
const ids = (source: string) => index.revisionCandidates(source).map(({ entry }) => entry.data.id).sort();

test('revision follows arguments after removing authored inference duplicates', () => {
 assert.deepEqual(ids('S-032'), ['S-015', 'S-016']);
 assert.ok(ids('S-027').includes('S-011'), 'strict transposition requires review of the effect premise');
 assert.ok(ids('S-027').includes('S-028'), 'effect revision reaches its alternative mechanism derivation');
 assert.deepEqual(ids('S-012'), [], 'see-also links must not create revision influence');
 assert.throws(() => index.revisionCandidates('H-001'), /Unknown revision source/);
});

test('mechanism semantic use survives without an inferential path to the effect', () => {
 const reduced = buildReasoningIndex(statements, argumentsList.filter(({ data }) => data.id !== 'ARG-009'));
 assert.deepEqual(reduced.revisionCandidates('S-028').map(({ entry }) => entry.data.id).sort(), ['S-015', 'S-016']);
 assert.equal(statements.reduce((n, {data}) => n + data.semanticUses.length, 0), 24);
 for (const {data} of statements) {
  for (const use of data.semanticUses) assert.ok(!argumentsList.some(({data: argument}) => argument.conclusion === data.id && argument.premises.includes(use.id)), 'current semantic uses do not duplicate authored inference endpoints');
 }
});

test('retired fields and unknown nested semantics cannot silently survive schema parsing', () => {
 const data = statements[0].data;
 for (const field of ['upstream','downstream']) assert.equal(collections.statements.schema.safeParse({...data,[field]:[]}).success,false);
 assert.equal(collections.statements.schema.safeParse({...data,semanticUses:[{id:'S-001',role:'conceptual',note:'Valid reference.',supports:true}]}).success,false);
});

test('revision includes defenses and transposed rule influence without looping', () => {
 const edges = theoryEdges({statements:['p','q','a','b','c'].map(id=>({id})),rules:[{id:'s',kind:'strict',premises:['p'],conclusion:'q'},{id:'d',kind:'defeasible',premises:['q'],conclusion:'a'},{id:'db',kind:'defeasible',premises:['p'],conclusion:'b'}],undercutters:[{statement:'b',rule:'d'},{statement:'c',rule:'db'}]});
 const defense=revisionReach(edges,['c']);
 for (const id of ['c','db','b','d','a']) assert.ok(defense.has(id),id);
 assert.ok(!defense.has('p'),'directed undercut influence does not flow backward to a premise');
 const transposed=revisionReach(edges,['-q']);
 for (const id of ['s','q','-q','p','-p']) assert.ok(transposed.has(id),id);
 assert.deepEqual([...revisionReach(edges,['c','c'])].sort(),[...defense].sort());
});
