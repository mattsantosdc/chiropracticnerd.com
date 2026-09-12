import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { closeSync, cpSync, mkdtempSync, openSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkReview, collectInputs, reviewPath, rubricFields } from '../scripts/model-audit.mjs';

test('production overview rejects a malformed path even after fixture review freshness passes', async (t) => {
	const root = mkdtempSync(join(tmpdir(), 'model-path-build-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const path of ['src', 'public', 'docs', 'scripts', 'reviews', 'AGENTS.md', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
		cpSync(path, join(root, path), { recursive: true });
	}
	symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'), 'dir');
	const pathFile = join(root, 'src/data/model-reading-path.json');
	const malformed = JSON.parse(readFileSync(pathFile, 'utf8'));
	malformed.main[0].steps[0].id = 'S-999';
	writeFileSync(pathFile, JSON.stringify(malformed));
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
	assert.equal(code, 1, output);
	assert.match(output, /Model review current:/, 'The build must pass the independent review gate first.');
	assert.match(output, /main section "living-organisms" step 1: missing statement S-999/);
	assert.doesNotMatch(output, /Stale reviewed input|Missing reviewed input/);
});
