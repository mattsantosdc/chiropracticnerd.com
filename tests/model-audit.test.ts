import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
	checkReview, collectInputs, fingerprint, policyPaths, readReview, reviewPath,
} from '../scripts/model-audit.mjs';

function fixture(t: { after: (callback: () => void) => void }) {
	const root = mkdtempSync(join(tmpdir(), 'model-audit-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const put = (path: string, text: string) => {
		mkdirSync(dirname(join(root, path)), { recursive: true });
		writeFileSync(join(root, path), text);
	};
	for (const path of policyPaths) put(path, `Policy for ${path}\n`);
	put('src/content/model/statements/effect.md', '---\nid: S-007\nconfidence: unresolved\n---\nSome inputs produce an effect.\n');
	put('src/content/model/arguments/reasoning.md', '---\nid: ARG-001\n---\nA defeasible argument.\n');
	const packet = collectInputs(root);
	const review = {
		schemaVersion: 1,
		reviewedAt: '2026-09-09T00:00:00Z',
		reviewer: { kind: 'ai', identifier: 'Fixture reviewer', model: 'test-only' },
		inputs: { ...packet.inputs },
		records: Object.fromEntries(packet.subjects.map((path: string) => [path, {
			finding: 'consistent',
			proposition: 'Fixture proposition reviewed.',
			qualifiers: 'Some limits scope; unresolved confidence is separate.',
			evidenceSeparation: 'Unresolved evidence does not alter the proposition.',
			alignment: 'Fixture statement and body reviewed together.',
			inferenceAndImpact: 'Fixture argument remains defeasible.',
		}])),
	};
	return { root, put, packet, review };
}

test('the committed Model audit covers the current exact content and policy', () => {
	assert.deepEqual(checkReview(collectInputs(process.cwd()), readReview(process.cwd())), []);
});

test('a completed review can cover unresolved empirical confidence', (t) => {
	const { packet, review } = fixture(t);
	assert.deepEqual(checkReview(packet, review), []);
});

test('the packet scans only canonical siblings and includes every subject exactly once', (t) => {
	const { root, put, review } = fixture(t);
	put('src/content/model/statements/another.mdx', '---\nid: S-008\n---\nAnother statement.');
	put('src/content/model/arguments/another.mdx', '---\nid: ARG-002\n---\nAnother argument.');
	put('src/content/model/stray.md', 'Outside the canonical collections.');
	const packet = collectInputs(root);
	assert.deepEqual(packet.subjects, [
		'src/content/model/arguments/another.mdx',
		'src/content/model/arguments/reasoning.md',
		'src/content/model/statements/another.mdx',
		'src/content/model/statements/effect.md',
	]);
	assert.equal(new Set(packet.subjects).size, packet.subjects.length);
	assert.equal(Object.keys(packet.inputs).length, policyPaths.length + packet.subjects.length);
	assert.deepEqual(Object.keys(review.records).sort(), collectInputs(root).subjects.filter((path) => !path.endsWith('another.mdx')));
});

test('changed assertions, summaries, bodies, evidence, dependencies, and argument text invalidate review', (t) => {
	const { root, put, packet, review } = fixture(t);
	const entry = 'src/content/model/statements/effect.md';
	const original = packet.sources[entry];
	const changes = [
		original.replace('produce', 'may produce'),
		original.replace('produce an effect', 'are intended to produce an effect'),
		original.replace('Some', 'All'),
		`${original}\nsummary: Some inputs may have effects.`,
		`${original}\n## Current evidence\nChanged appraisal.`,
		`${original}\nupstream:\n  - id: S-004`,
		`${original}\nupdated: 2026-09-10`,
	];
	for (const changed of changes) {
		put(entry, changed);
		assert.ok(checkReview(collectInputs(root), review).includes(`Stale reviewed input: ${entry}`));
	}
	put(entry, original);
	const argument = 'src/content/model/arguments/reasoning.md';
	put(argument, `${packet.sources[argument]}\nChanged premise interpretation.`);
	assert.deepEqual(checkReview(collectInputs(root), review), [`Stale reviewed input: ${argument}`]);
});

test('new, removed, and renamed Markdown or MDX records cannot escape the input set', (t) => {
	const { root, put, review } = fixture(t);
	const old = 'src/content/model/statements/effect.md';
	const added = 'src/content/model/statements/new.mdx';
	put(added, readFileSync(join(root, old), 'utf8'));
	rmSync(join(root, old));
	const issues = checkReview(collectInputs(root), review);
	assert.ok(issues.includes(`Missing reviewed input: ${added}`));
	assert.ok(issues.includes(`Missing review record: ${added}`));
	assert.ok(issues.includes(`Removed reviewed input: ${old}`));
	assert.ok(issues.includes(`Unexpected review record: ${old}`));
});

test('policy, checker, schema, and page-template changes require renewed review', (t) => {
	const { root, put, packet, review } = fixture(t);
	for (const path of policyPaths) {
		put(path, `${packet.sources[path]}New rule.`);
		assert.deepEqual(checkReview(collectInputs(root), review), [`Stale reviewed input: ${path}`]);
		put(path, packet.sources[path]);
	}
});

test('review bookkeeping and unrelated files do not invalidate their own inputs', (t) => {
	const { root, put, packet, review } = fixture(t);
	put(reviewPath, JSON.stringify(review));
	put('src/content/articles/example.md', 'An unrelated article.');
	assert.deepEqual(collectInputs(root), packet);
	assert.deepEqual(readReview(root), review);
});

test('reading configuration, contract, and production helpers are explicit review inputs', (t) => {
	const { root, put, packet, review } = fixture(t);
	for (const path of [
		'src/data/model-reading-path.json', 'docs/model-reading-path.md',
		'src/lib/reading-path.ts', 'src/lib/reasoning.ts',
		'src/lib/reading-navigation.ts', 'src/lib/embedded-markdown.ts',
		'src/scripts/model-fragments.ts', 'src/styles/global.css',
		'src/components/model/StatementText.astro', 'src/components/model/StatementMaterial.astro',
		'src/components/model/CanonicalBody.astro', 'src/components/model/StatementStep.astro',
		'src/components/model/ArgumentStep.astro', 'src/components/model/ReasoningParticipation.astro',
		'src/components/model/ReadingSection.astro', 'src/components/model/ReasoningHelp.astro',
	]) {
		assert.ok(Object.hasOwn(packet.inputs, path), `${path} must not escape the explicit input list`);
		put(path, `${packet.sources[path]}Changed reading behavior.`);
		assert.deepEqual(checkReview(collectInputs(root), review), [`Stale reviewed input: ${path}`]);
		put(path, packet.sources[path]);
	}
});

test('missing, malformed, incomplete, adverse, and unsupported reviews are distinguished', (t) => {
	const { packet, review } = fixture(t);
	assert.match(checkReview(packet, null)[0], /Missing reviews/);
	assert.match(checkReview(packet, [])[0], /Malformed/);
	assert.match(checkReview(packet, { ...review, schemaVersion: 2 }).join('\n'), /schemaVersion/);
	assert.match(checkReview(packet, { ...review, reviewedAt: 'not a date' }).join('\n'), /reviewedAt/);
	assert.match(checkReview(packet, { ...review, reviewer: { kind: 'ai', identifier: 'Agent' } }).join('\n'), /model provenance/);
	assert.match(checkReview(packet, { ...review, inputs: {} }).join('\n'), /Missing reviewed input/);
	assert.match(checkReview(packet, { ...review, records: {} }).join('\n'), /Missing review record/);
	const path = packet.subjects[0];
	review.records[path].finding = 'needs-revision';
	assert.deepEqual(checkReview(packet, review), [`Needs revision: ${path}`]);
	review.records[path].finding = 'consistent';
	review.records[path].qualifiers = ' ';
	assert.deepEqual(checkReview(packet, review), [`Missing qualifiers rationale: ${path}`]);
});

test('malformed review JSON is reported instead of treated as a completed review', (t) => {
	const { root, put } = fixture(t);
	assert.equal(readReview(root), null);
	put(reviewPath, '{');
	assert.throws(() => readReview(root), /Cannot read reviews\/model-review.json/);
});

test('fingerprints normalize line endings but retain meaningful and formatting changes', () => {
	assert.equal(fingerprint('Some inputs work.\r\n'), fingerprint('Some inputs work.\n'));
	assert.notEqual(fingerprint('Some inputs work.\n'), fingerprint('Some inputs may work.\n'));
	assert.notEqual(fingerprint('Some inputs work.\n'), fingerprint('Some inputs work. \n'));
});
