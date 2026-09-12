import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { closeSync, cpSync, mkdtempSync, openSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkReview, collectInputs, reviewPath, rubricFields } from '../scripts/model-audit.mjs';

async function buildFixture(t: { after: (callback: () => void) => void }, configure: (root: string) => void) {
	const root = mkdtempSync(join(tmpdir(), 'model-path-build-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const path of ['src', 'public', 'docs', 'scripts', 'reviews', 'AGENTS.md', 'package-lock.json', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
		cpSync(path, join(root, path), { recursive: true });
	}
	symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'), 'dir');
	configure(root);
	const packet = collectInputs(root);
	// Synthetic bookkeeping only in this disposable fixture: not a semantic approval.
	const review = {
		schemaVersion: 1,
		reviewedAt: '2026-09-12T00:00:00Z',
		reviewer: { kind: 'ai', identifier: 'Test-only synthetic coverage fixture', model: 'test-only' },
		inputs: packet.inputs,
		records: Object.fromEntries(packet.subjects.map((path: string) => [path, {
			finding: 'consistent',
			...Object.fromEntries(rubricFields.map((field: string) => [field, 'Test-only coverage fixture, not a semantic review.'])),
		}])),
	};
	writeFileSync(join(root, reviewPath), JSON.stringify(review));
	assert.deepEqual(checkReview(packet, review), []);
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

test('production overview rejects a malformed path even after fixture review freshness passes', async (t) => {
	const { code, output } = await buildFixture(t, (root) => {
		const file = join(root, 'src/data/model-reading-path.json');
		const config = JSON.parse(readFileSync(file, 'utf8'));
		config.main[0].steps[0].id = 'S-999';
		writeFileSync(file, JSON.stringify(config));
	});
	assert.equal(code, 1, output);
	assert.match(output, /main section "living-organisms" step 1: missing statement S-999/);
});

test('production components render shared conclusions and cyclic argument participation finitely', async (t) => {
	const { root, code, output } = await buildFixture(t, (root) => {
		const file = join(root, 'src/data/model-reading-path.json');
		const config = JSON.parse(readFileSync(file, 'utf8'));
		config.main.at(-1).steps.push({ kind: 'argument', id: 'ARG-008' });
		writeFileSync(file, JSON.stringify(config));
		// Synthetic route only: S-004 -> ARG-004 -> S-006 -> ARG-008 -> S-004.
		writeFileSync(join(root, 'src/content/model/arguments/cycle-fixture.md'), `---
id: ARG-008
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
	assert.equal(all.filter((node) => attr(node, 'data-argument-id') === 'ARG-008').length, 1);
	const ids = all.map((node) => attr(node, 'id')).filter(Boolean);
	assert.equal(ids.length, new Set(ids).size);
	for (const block of all.filter((node) => attr(node, 'data-participation') === 'S-004')) {
		const hrefs = nodes(block).map((node) => attr(node, 'href')).filter(Boolean);
		for (const id of ['arg-005', 'arg-008', 'arg-004']) assert.ok(hrefs.some((href: string) => href.endsWith(`--argument-${id}`)));
	}
	const s6 = all.find((node) => attr(node, 'data-participation') === 'S-006');
	assert.ok(nodes(s6).some((node) => attr(node, 'href')?.endsWith('--argument-arg-008')));
});
