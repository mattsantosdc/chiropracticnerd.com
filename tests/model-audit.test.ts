import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkReview, collectInputs, fingerprint, planReview, policyPaths, readReview, reviewPath, rubricFields } from '../scripts/model-audit.mjs';
import { deriveImpact, digest, reviewBasis, theoryEdges } from '../scripts/model-review-impact.mjs';

const reviewedAt = '2026-09-14T00:00:00Z';
const now = Date.parse(reviewedAt);
const reviewer = { kind: 'ai', identifier: 'Synthetic test fixture only', model: 'test-only' };
const sp = (id: string) => `src/content/model/statements/${id}.md`;
const ap = (id: string) => `src/content/model/arguments/${id}.md`;
function reviewed(packet: any): any {
	return {
		schemaVersion: 2, reviewedAt, reviewer, inputs: packet.inputs, snapshot: packet.snapshot,
		wholeModelReview: { reviewedAt, reviewer, inputs: packet.inputs },
		records: Object.fromEntries(packet.subjects.map((path: string) => [path, {
			finding: 'consistent', basis: packet.bases[path], reviewedAt, reviewer,
			...Object.fromEntries(rubricFields.map((field: string) => [field, 'Synthetic test finding, not a content approval.'])),
		}])),
	};
}
function fixture(t: { after: (callback: () => void) => void }) {
	const root = mkdtempSync(join(tmpdir(), 'model-audit-test-'));
	t.after(() => rmSync(root, { recursive: true }));
	const put = (path: string, text: string) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); };
	const json = (path: string, data: any) => put(path, JSON.stringify(data));
	for (const path of policyPaths) put(path, `Policy for ${path}\n`);
	const statements: any = Object.fromEntries(Array.from({ length: 7 }, (_, i) => {
		const id = `S-00${i + 1}`;
		return [id, { id, statement: `Some ${id} events occur.`, summary: `Summary of ${id}.`, confidence: 'unresolved', updated: '2026-09-14', upstream: [], related: [] }];
	}));
	statements['S-007'].upstream = [{ id: 'S-004', role: 'conceptual', note: 'Uses its definition without inferring effectiveness.' }];
	const args: any = {
		'ARG-001': { id: 'ARG-001', premises: ['S-001', 'S-002'], conclusion: 'S-003', inferenceKind: 'defeasible', scheme: 'test' },
		'ARG-002': { id: 'ARG-002', premises: ['S-003'], conclusion: 'S-004', inferenceKind: 'defeasible', scheme: 'test' },
		'ARG-003': { id: 'ARG-003', premises: ['S-006'], conclusion: 'S-003', inferenceKind: 'defeasible', scheme: 'alternative' },
	};
	const writeStatement = (id: string, body = 'Explanation and evidence remain separate.\n') => put(sp(id), `---\n${JSON.stringify(statements[id])}\n---\n${body}`);
	const writeArgument = (id: string) => put(ap(id), `---\n${JSON.stringify(args[id])}\n---\nReasoning.\n`);
	for (const id of Object.keys(statements)) writeStatement(id);
	for (const id of Object.keys(args)) writeArgument(id);
	const bind = () => json('reasoning/model-bindings.json', {
		schemaVersion: 1, signature: '(declare-fun P () Bool)', ordinaryPremises: ['S-001', 'S-002', 'S-005', 'S-006'],
		statements: Object.fromEntries(Object.entries(statements).map(([id, s]: [string, any]) => [id, { text: s.statement, formula: 'P', representation: 'opaque-proposition' }])),
		applications: Object.fromEntries(Object.entries(args).map(([id, { id: _, ...data }]: [string, any]) => [id, data])),
	});
	bind();
	json('src/data/model-questions.json', [{ id: 'Q-001', target: 'S-001', question: 'Another explanation?' }]);
	const reading = { version: '0.1', orientation: { id: 'guide', steps: [] }, main: [{ id: 'unrelated', title: 'Unrelated', steps: [{ kind: 'statement', id: 'S-005' }] }, { id: 'account', title: 'Account', steps: [{ kind: 'argument', id: 'ARG-002' }] }], supporting: [] };
	json('src/data/model-reading-path.json', reading);
	json('reasoning/dependency-migration.json', { schemaVersion: 2, sourceBranch: 'model-v0.1', sourceCommit: 'test-only', relationships: [] });
	const packet = collectInputs(root);
	const review = reviewed(packet);
	const plan = () => planReview(collectInputs(root), review, { now });
	return { root, put, json, statements, args, writeStatement, writeArgument, bind, reading, packet, review, plan };
}
const ids = (plan: any) => plan.required.map((item: any) => item.id).sort();

test('committed review covers exact current inputs and every canonical record', () => {
	const packet = collectInputs(process.cwd()); const review = readReview(process.cwd());
	assert.deepEqual(checkReview(packet, review), []);
	assert.deepEqual(Object.keys(review.records).sort(), packet.subjects);
	assert.equal(planReview(packet, review).required.length, 0);
});

test('meaning changes reach joint arguments, alternatives and semantic uses while preserving unrelated provenance', (t) => {
	const f = fixture(t);
	f.statements['S-001'].statement = 'All S-001 events occur.'; f.writeStatement('S-001'); f.bind();
	const plan = f.plan();
	assert.deepEqual(ids(plan), ['ARG-001', 'ARG-002', 'ARG-003', 'S-001', 'S-003', 'S-004', 'S-007']);
	assert.ok(plan.required.find((r: any) => r.id === 'S-007').reasons.some((r: any) => r.via.some((e: any) => e.kind === 'semantic-use:conceptual')));
	const packet = collectInputs(f.root);
	const refreshed = structuredClone({ ...f.review, inputs: packet.inputs, snapshot: packet.snapshot });
	// Updating the outer snapshot must not certify old dependent findings.
	assert.match(checkReview(packet, refreshed, { now }).join('\n'), /Stale review basis: .*S-004/);
	for (const item of plan.required) refreshed.records[item.path] = reviewed(packet).records[item.path];
	assert.deepEqual(checkReview(packet, refreshed, { now }), []);
	for (const item of plan.retained) assert.deepEqual(refreshed.records[item.path], f.review.records[item.path]);
});

test('dates stay local; explanations, evidence, qualifiers and summaries propagate', (t) => {
	const f = fixture(t); f.statements['S-001'].updated = '2026-09-15'; f.writeStatement('S-001');
	assert.deepEqual(ids(f.plan()), ['S-001']);
	for (const body of ['An effect is now only an intention.', '## Evidence\nRevised appraisal.', 'Some now means every case.']) {
		f.writeStatement('S-001', body); assert.ok(ids(f.plan()).includes('S-007'));
	}
	f.statements['S-001'].summary = 'A materially stronger summary.'; f.writeStatement('S-001');
	assert.ok(ids(f.plan()).includes('ARG-002'));
});

test('argument deletion follows previous edges and retains the alternative support path', (t) => {
	const f = fixture(t); delete f.args['ARG-001']; rmSync(join(f.root, ap('ARG-001'))); f.bind();
	const plan = f.plan(); assert.ok(plan.removed.includes(ap('ARG-001')));
	for (const id of ['S-001', 'S-002', 'S-003', 'S-004', 'S-007', 'ARG-003']) assert.ok(ids(plan).includes(id), id);
	assert.ok(!ids(plan).includes('S-005'));
	assert.ok(plan.required.find((r: any) => r.id === 'S-007').reasons.some((r: any) => r.via.some((e: any) => e.from === 'ARG-001' && e.graphs.includes('previous'))));
	assert.match(checkReview(collectInputs(f.root), f.review, { now }).join('\n'), /Unexpected review record/);
});

test('removed dependencies retain former impact and new dependencies expose the new path', (t) => {
	const f = fixture(t); f.statements['S-007'].upstream = []; f.writeStatement('S-007');
	f.statements['S-004'].statement = 'A revised definition.'; f.writeStatement('S-004'); f.bind();
	assert.ok(f.plan().required.find((r: any) => r.id === 'S-007').reasons.some((r: any) => r.via.some((e: any) => e.kind === 'semantic-use:conceptual' && e.graphs.includes('previous'))));
	f.statements['S-005'].upstream = [{ id: 'S-007', role: 'conceptual', note: 'New explicit use.' }]; f.writeStatement('S-005');
	assert.ok(ids(f.plan()).includes('S-005'));
});

test('dependency notes refresh both displayed endpoints without propagating backward through an inference', (t) => {
	const f = fixture(t);
	f.statements['S-007'].upstream[0].note = 'Revised limiting note.'; f.writeStatement('S-007');
	assert.deepEqual(ids(f.plan()), ['S-004', 'S-007']);
});

test('JSON-only formatting requires source inspection while retaining canonical review provenance', (t) => {
	const f = fixture(t); const path = 'src/data/model-questions.json';
	f.put(path, JSON.stringify(JSON.parse(f.packet.sources[path]), null, 2));
	assert.equal(f.plan().required.length, 0);
	assert.deepEqual(f.plan().changedInputs, [path]);
	const packet = collectInputs(f.root);
	assert.match(checkReview(packet, f.review, { now }).join('\n'), /Stale reviewed input/);
	assert.deepEqual(checkReview(packet, { ...f.review, inputs: packet.inputs, snapshot: packet.snapshot }, { now }), []);
});

test('new and retargeted rules affect former and current participants', (t) => {
	const f = fixture(t); f.args['ARG-001'].conclusion = 'S-005'; f.writeArgument('ARG-001'); f.bind();
	for (const id of ['S-001', 'S-002', 'S-003', 'S-004', 'S-005', 'S-007']) assert.ok(ids(f.plan()).includes(id));
	f.args['ARG-004'] = { ...f.args['ARG-001'], id: 'ARG-004', premises: ['S-002'], conclusion: 'S-006' }; f.writeArgument('ARG-004'); f.bind();
	assert.ok(ids(f.plan()).includes('ARG-004')); assert.ok(ids(f.plan()).includes('S-006'));
});

test('question edits, removal and retargeting stay local without asserting formal attacks', (t) => {
	const f = fixture(t);
	f.json('src/data/model-questions.json', [{ id: 'Q-001', target: 'S-005', question: 'Retargeted?' }]);
	assert.deepEqual(ids(f.plan()), ['S-001', 'S-005']);
	f.json('src/data/model-questions.json', []); assert.deepEqual(ids(f.plan()), ['S-001']);
	assert.ok(!collectInputs(f.root).snapshot.edges.some((e: any) => e.kind === 'undercut'));
});

test('reading section edits affect displayed records, not the inference closure', (t) => {
	const f = fixture(t); f.reading.main[0].title = 'Reframed context'; f.json('src/data/model-reading-path.json', f.reading);
	assert.deepEqual(ids(f.plan()), ['S-005']);
	f.reading.main.reverse(); f.json('src/data/model-reading-path.json', f.reading);
	assert.deepEqual(ids(f.plan()), ['ARG-002', 'S-003', 'S-004', 'S-005']);
});

test('formal premise withdrawal propagates and unknown binding capabilities fail visibly', (t) => {
	const f = fixture(t); const path = 'reasoning/model-bindings.json';
	const bindings = JSON.parse(readFileSync(join(f.root, path), 'utf8'));
	bindings.ordinaryPremises = bindings.ordinaryPremises.filter((id: string) => id !== 'S-001'); f.json(path, bindings);
	assert.ok(ids(f.plan()).includes('S-007'));
	bindings.undercutters = [{ statement: 'S-005', rule: 'ARG-001' }]; f.json(path, bindings);
	assert.throws(() => collectInputs(f.root), /unsupported shape/);
});

test('global policy, profile, checker and shared renderer changes invalidate every basis', (t) => {
	const f = fixture(t);
	for (const path of ['AGENTS.md', 'reasoning/profile.json', 'reasoning/engine.py', 'scripts/model-review-impact.mjs', 'src/components/model/StatementText.astro']) {
		f.put(path, `${f.packet.sources[path]}Changed global contract.\n`);
		assert.equal(f.plan().required.length, f.packet.subjects.length); f.put(path, f.packet.sources[path]);
	}
});

test('renamed and added canonical records cannot escape freshness; unrelated files do not invalidate it', (t) => {
	const f = fixture(t); f.put(reviewPath, JSON.stringify(f.review)); f.put('src/content/articles/unrelated.md', 'Article.');
	assert.deepEqual(collectInputs(f.root), f.packet);
	const old = sp('S-005'); const replacement = old.replace('.md', '-renamed.mdx');
	f.put(replacement, f.packet.sources[old]); rmSync(join(f.root, old));
	const packet = collectInputs(f.root); assert.ok(packet.subjects.includes(replacement));
	assert.match(checkReview(packet, f.review, { now }).join('\n'), /Missing review record.*renamed/);
	f.put(old, f.packet.sources[old]); assert.throws(() => collectInputs(f.root), /duplicate ID/);
});

test('malformed, adverse and unsupported reviews fail independently of freshness', (t) => {
	const { root, put, packet, review } = fixture(t);
	assert.match(checkReview(packet, null, { now })[0], /Missing reviews/);
	assert.match(checkReview(packet, [], { now })[0], /Malformed/);
	assert.match(checkReview(packet, { ...review, schemaVersion: 1 }, { now }).join('\n'), /schemaVersion/);
	assert.match(checkReview(packet, { ...review, inputs: {} }, { now }).join('\n'), /Missing reviewed input/);
	const path = packet.subjects[0]; review.records[path].finding = 'needs-revision';
	assert.match(checkReview(packet, review, { now }).join('\n'), /Needs revision/);
	review.records[path].finding = 'consistent'; review.records[path].qualifiers = ' ';
	assert.match(checkReview(packet, review, { now }).join('\n'), /Missing qualifiers/);
	review.records[path].reviewer = { kind: 'ai', identifier: 'Missing model' };
	assert.match(checkReview(packet, review, { now }).join('\n'), /model provenance/);
	assert.equal(readReview(root), null); put(reviewPath, '{'); assert.throws(() => readReview(root), /Cannot read reviews/);
});

test('periodic and requested whole-model reviews remain available', (t) => {
	const { packet, review } = fixture(t);
	assert.equal(planReview(packet, review, { now, full: true }).required.length, packet.subjects.length);
	const later = now + 90 * 86_400_000;
	assert.equal(planReview(packet, review, { now: later }).mode, 'full');
	assert.match(checkReview(packet, review, { now: later }).join('\n'), /Whole-model review overdue/);
	assert.deepEqual(checkReview(packet, review, { now }), []);
});

test('contradictions, undercuts, defense cycles and strict transpositions propagate finitely', () => {
	const theory = {
		statements: ['P', 'A', 'B', 'C', 'Z'].map((id) => ({ id })),
		rules: ['A', 'B', 'C'].map((id) => ({ id: `R${id}`, premises: ['P'], conclusion: id, kind: 'defeasible' })),
		undercutters: [{ statement: 'A', rule: 'RB' }, { statement: 'B', rule: 'RC' }, { statement: 'C', rule: 'RA' }],
	};
	const before = { version: 1, subjects: Object.fromEntries(theory.statements.map(({ id }) => [id, `${id}.md`])), edges: theoryEdges(theory), units: { A: { path: 'A.md', digest: digest('before'), targets: ['A'], propagate: true } } };
	const after = structuredClone(before); after.units.A.digest = digest('after');
	assert.deepEqual(Object.keys(deriveImpact(before, after).reasons).sort(), ['A', 'B', 'C']);
	assert.notEqual(reviewBasis(before, 'C'), reviewBasis(after, 'C')); assert.equal(reviewBasis(before, 'Z'), reviewBasis(after, 'Z'));
	const withdrawn = structuredClone(after); withdrawn.edges = theoryEdges({ ...theory, undercutters: theory.undercutters.slice(1) }); delete (withdrawn.units as any).A;
	assert.ok(deriveImpact(before, withdrawn).reasons.C.some((r: any) => r.via.some((e: any) => e.kind === 'undercut' && e.graphs.includes('previous'))));
	const strict = { ...theory, rules: [{ id: 'RS', premises: ['P', 'A'], conclusion: 'B', kind: 'strict' }], undercutters: [] };
	const first = { ...before, edges: theoryEdges(strict), units: { B: { path: 'B.md', digest: digest('before'), targets: ['B'], propagate: true } } };
	const second = structuredClone(first); second.units.B.digest = digest('after'); const impact = deriveImpact(first, second);
	assert.ok(impact.reasons.P.some((r: any) => r.via.some((e: any) => e.kind === 'transposed-conclusion'))); assert.ok(impact.reasons.A);
});

test('line endings normalize without erasing meaningful changes', (t) => {
	const f = fixture(t);
	for (const [path, source] of Object.entries(f.packet.sources)) f.put(path, (source as string).replace(/\n/g, '\r\n'));
	assert.deepEqual(collectInputs(f.root), f.packet);
	assert.equal(fingerprint('Text\r\n'), fingerprint('Text\n'));
	assert.notEqual(fingerprint('Some inputs work.'), fingerprint('Some inputs may work.'));
});
