import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { closeSync, cpSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkReview, collectInputs, policyPaths, reviewPath, rubricFields } from '../scripts/model-audit.mjs';

async function buildFixture(t: { after: (callback: () => void) => void }, configure: (root: string) => void) {
	const root = mkdtempSync(join(tmpdir(), 'model-path-build-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const path of ['src', 'public', 'docs', 'scripts', 'reviews', 'AGENTS.md', 'package-lock.json', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
		cpSync(path, join(root, path), { recursive: true });
	}
	for (const path of policyPaths) {
		const destination = join(root, path);
		if (!existsSync(destination)) {
			mkdirSync(dirname(destination), { recursive: true });
			cpSync(path, destination);
		}
	}
	symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'), 'dir');
	configure(root);
	return runFixtureBuild(root);
}

function refreshFixtureReview(root: string) {
	const packet = collectInputs(root);
	// Synthetic bookkeeping only in this disposable fixture: not a semantic approval.
	const review = {
		schemaVersion: 2,
		reviewedAt: '2026-09-12T00:00:00Z',
		reviewer: { kind: 'ai', identifier: 'Test-only synthetic coverage fixture', model: 'test-only' },
		inputs: packet.inputs,
		snapshot: packet.snapshot,
		wholeModelReview: {
			reviewedAt: new Date().toISOString(),
			reviewer: { kind: 'ai', identifier: 'Test-only synthetic coverage fixture', model: 'test-only' },
			inputs: packet.inputs,
		},
		records: Object.fromEntries(packet.subjects.map((path: string) => [path, {
			finding: 'consistent',
			basis: packet.bases[path],
			reviewedAt: new Date().toISOString(),
			reviewer: { kind: 'ai', identifier: 'Test-only synthetic coverage fixture', model: 'test-only' },
			...Object.fromEntries(rubricFields.map((field: string) => [field, 'Test-only coverage fixture, not a semantic review.'])),
		}])),
	};
	writeFileSync(join(root, reviewPath), JSON.stringify(review));
	assert.deepEqual(checkReview(packet, review), []);
}

async function runFixtureBuild(root: string) {
	refreshFixtureReview(root);
	// File-backed output also works in environments that intercept child-process pipes.
	const logPath = join(root, 'build.log');
	const log = openSync(logPath, 'w');
	let code: number | null;
	try {
		code = await new Promise<number | null>((resolve, reject) => {
			const child = spawn('npm', ['run', 'build'], {
				cwd: root, timeout: 60_000, stdio: ['ignore', log, log],
				env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
			});
			child.once('error', reject);
			child.once('close', resolve);
		});
	} finally {
		closeSync(log);
	}
	const output = readFileSync(logPath, 'utf8');
	assert.match(output, /Model review current:/, 'The build must pass the independent review gate first.');
	assert.doesNotMatch(output, /Stale reviewed input|Missing reviewed input/);
	return { root, code, output };
}

test('canonical alternative content renders with explicit roles, signed claims and admission context', async (t) => {
	const { root, code, output } = await buildFixture(t, (root) => {
		const statement = { id: 'S-033', slug: 'synthetic-purpose-exception', title: 'Synthetic purpose exception', statement: 'The purpose inference is inapplicable under this test stipulation.', summary: 'An isolated test proposition, not a clinical claim.', domain: 'framework', statementType: 'framework', confidence: 'not-applicable', order: 100, semanticUses: [{ id: 'S-029', role: 'normative', note: 'The test exception uses the purpose principle without negating it.' }], related: ['S-005'], version: '0.1', updated: '2026-09-15', references: [{ title: 'Synthetic source label', url: 'https://example.org/test-only', kind: 'foundational', note: 'Test source note.' }], whatWouldChange: 'Revising the test assumptions.' };
		const argument = { id: 'ARG-011', slug: 'synthetic-purpose-defense', title: 'Synthetic purpose defense', summary: 'An isolated test route.', premises: ['-S-033'], conclusion: 'S-005', inferenceKind: 'defeasible', scheme: 'synthetic test rule', version: '0.1', updated: '2026-09-15' };
		for (const [directory, data] of [['alternatives', statement], ['alternative-arguments', argument]] as const) writeFileSync(join(root, `src/content/model/${directory}/${data.id}.md`), `---\n${JSON.stringify(data)}\n---\n## Boundary\nSynthetic test content only.\n`);
		writeFileSync(join(root, 'reasoning/opposition-bindings.json'), JSON.stringify({ schemaVersion: 1, signature: '(declare-fun S-033 () Bool)', statements: { 'S-033': { text: statement.statement, formula: 'S-033', representation: 'opaque-proposition' } }, applications: { 'ARG-011': Object.fromEntries(['premises', 'conclusion', 'inferenceKind', 'scheme'].map((key) => [key, argument[key]])) }, ordinaryPremises: [{ literal: 'S-033', rationale: 'This is an isolated test assumption.' }], undercutters: [{ statement: 'S-033', rule: 'ARG-008', rationale: 'A test challenge to the purpose inference.' }] }));
		const qPath = join(root, 'src/data/model-questions.json');
		const questions = JSON.parse(readFileSync(qPath, 'utf8'));
		questions.push({ id: 'Q-025', target: 'S-033', kind: 'premise', question: 'Does the test exception hold?', concern: 'A test concern.', response: 'This is stipulated only in the test.', wouldChange: 'Reconsider the stipulation.' });
		writeFileSync(qPath, JSON.stringify(questions));
	});
	assert.equal(code, 0, output);
	const { parse } = await import('parse5');
	const nodes = (node: any): any[] => [node, ...(node.childNodes ?? []).flatMap(nodes)];
	const text = (node: any): string => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
	const attr = (node: any, key: string) => node.attrs?.find((a: any) => a.name === key)?.value;
	const read = (path: string) => parse(readFileSync(join(root, 'dist/model', path, 'index.html'), 'utf8'));
	const alternatives = read('alternatives');
	assert.match(text(alternatives), /It is not the case that: The purpose inference/);
	for (const value of ['Recorded alternative', 'Synthetic source label', 'Test source note.', 'Revising the test assumptions.', 'Does the test exception hold?', 'The test exception uses the purpose principle without negating it.']) assert.ok(text(alternatives).includes(value), value);
	assert.deepEqual(nodes(alternatives).filter((n) => attr(n, 'data-alternative-record')).map((n) => attr(n, 'data-alternative-record')), ['S-033', 'ARG-011']);
	for (const path of ['philosophy/chiropractic-purpose', 'answers/philosophy/chiropractic-purpose', 'arguments/functional-benefit-as-professional-aim']) {
		const page = read(path);
		assert.ok(nodes(page).some((n) => attr(n, 'data-formal-opposition')));
		assert.ok(nodes(page).some((n) => attr(n, 'href') === '/model/alternatives/#s-033'));
		assert.match(text(page), /This is an isolated test assumption/);
	}
	assert.equal(nodes(read('science/actual-chiropractic-benefit')).filter((n) => attr(n, 'data-formal-opposition')).length, 0);
	assert.equal(nodes(read('')).filter((n) => attr(n, 'data-statement-id') === 'S-033').length, 0);
	for (const page of [alternatives, read('answers/philosophy/chiropractic-purpose')]) {
		const ids = nodes(page).map((n) => attr(n, 'id')).filter(Boolean);
		assert.equal(new Set(ids).size, ids.length);
	}
	// Optional local visual inspection of this isolated fixture, never canonical content.
	if (process.env.MODEL_OPPOSITION_FIXTURE_OUTPUT) cpSync(join(root, 'dist'), process.env.MODEL_OPPOSITION_FIXTURE_OUTPUT, { recursive: true });
	// Reuse the populated content cache when withdrawing the final alternative.
	for (const path of ['alternatives/S-033.md', 'alternative-arguments/ARG-011.md']) rmSync(join(root, 'src/content/model', path));
	writeFileSync(join(root, 'reasoning/opposition-bindings.json'), JSON.stringify({ schemaVersion: 1, signature: '', statements: {}, applications: {}, ordinaryPremises: [], undercutters: [] }));
	const qPath = join(root, 'src/data/model-questions.json');
	writeFileSync(qPath, JSON.stringify(JSON.parse(readFileSync(qPath, 'utf8')).filter((q: any) => q.id !== 'Q-025')));
	const withdrawn = await runFixtureBuild(root);
	assert.equal(withdrawn.code, 0, withdrawn.output);
	assert.match(text(read('alternatives')), /No formal alternative claims/);
	assert.equal(nodes(read('alternatives')).filter((n) => attr(n, 'data-alternative-record')).length, 0);
	assert.equal(nodes(read('philosophy/chiropractic-purpose')).filter((n) => attr(n, 'data-formal-opposition')).length, 0);
});

test('production overview rejects a malformed path even after fixture review freshness passes', async (t) => {
	const { code, output } = await buildFixture(t, (root) => {
		const file = join(root, 'src/data/model-reading-path.json');
		const config = JSON.parse(readFileSync(file, 'utf8'));
		config.main[0].steps[0].kind = 'argument';
		writeFileSync(file, JSON.stringify(config));
	});
	assert.equal(code, 1, output);
	assert.match(output, /main\.0\.steps\.0\.id.*S-017.*Expected an argument ID \(ARG-###\)/);
});

test('production components render shared conclusions and cyclic argument participation finitely', async (t) => {
	const { root, code, output } = await buildFixture(t, (root) => {
		const file = join(root, 'src/data/model-reading-path.json');
		const config = JSON.parse(readFileSync(file, 'utf8'));
		config.main.at(-1).steps.push({ kind: 'argument', id: 'ARG-999' });
		writeFileSync(file, JSON.stringify(config));
		// Synthetic route only: S-004 -> ARG-004 -> S-006 -> ARG-999 -> S-004.
		writeFileSync(join(root, 'src/content/model/arguments/cycle-fixture.md'), `---
id: ARG-999
slug: cycle-fixture
title: Synthetic alternative route
summary: Test-only fixture, not an adopted Model argument.
premises: [S-006]
conclusion: S-004
inferenceKind: defeasible
scheme: test-only alternative
version: '0.1'
updated: 2026-09-12
---
## Boundary
Test-only cyclic participation.
`);
	});
	assert.equal(code, 0, output);
	const { parse } = await import('parse5');
	const page = parse(readFileSync(join(root, 'dist/model/index.html'), 'utf8'));
	const nodes = (node: any): any[] => [node, ...(node.childNodes ?? []).flatMap(nodes)];
	const attr = (node: any, key: string) => node.attrs?.find((attr: any) => attr.name === key)?.value;
	const all = nodes(page);
	assert.equal(all.filter((node) => attr(node, 'data-argument-id') === 'ARG-999').length, 1);
	const ids = all.map((node) => attr(node, 'id')).filter(Boolean);
	assert.equal(ids.length, new Set(ids).size);
	assert.equal(all.filter((node) => attr(node, 'data-participation')).length, 0);
	const s4Detail = parse(readFileSync(join(root, 'dist/model/philosophy/functional-potential/index.html'), 'utf8'));
	const participation = nodes(s4Detail).filter((node) => attr(node, 'data-participation') === 'S-004');
	assert.equal(participation.length, 1);
	for (const block of participation) {
		const hrefs = nodes(block).map((node) => attr(node, 'href')).filter(Boolean);
		for (const id of ['arg-005', 'arg-999', 'arg-004']) assert.ok(hrefs.some((href: string) => href.endsWith(`--argument-${id}`)));
	}
	const s6Detail = parse(readFileSync(join(root, 'dist/model/philosophy/care-beyond-symptoms/index.html'), 'utf8'));
	const s6 = nodes(s6Detail).find((node) => attr(node, 'data-participation') === 'S-006');
	assert.ok(nodes(s6).some((node) => attr(node, 'href')?.endsWith('--argument-arg-999')));
});
