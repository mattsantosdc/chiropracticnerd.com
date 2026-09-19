import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSnapshot, deriveImpact, reviewBasis, serialize, fullReviewIntervalDays } from './model-review-impact.mjs';

export const reviewPath = 'reviews/model-review.json';
export const policyPaths = [
	'AGENTS.md',
	'docs/author-context.md',
	'docs/aspic-foundation.md',
	'docs/aspic-migration.md',
	'docs/objection-authoring.md',
	'docs/review-invalidation-plan.md',
	'reasoning/profile.json',
	'reasoning/requirements.txt',
	'reasoning/model-bindings.json',
	'reasoning/dependency-migration.json',
	'reasoning/engine.py',
	'reasoning/model.py',
	'reasoning/opposition.py',
	'reasoning/opposition-scenarios.json',
	'docs/model-opposition-audit.md',
	'tests/revision-graph.test.ts',
	'reasoning/run.py',
	'reasoning/test_engine.py',
	'scripts/reasoning.mjs',
	'tests/model-browser.mjs',
	'tests/helpers/review-impact-theory.mjs',
	'.github/workflows/model-checks.yml',
	'src/data/model-questions.json',
	'src/lib/questions.ts',
	'src/components/model/CriticalQuestions.astro',
	'docs/model-authoring.md',
	'docs/dependency-model.md',
	'docs/argument-model.md',
	'docs/standards-contract.md',
	'docs/visualization-plan.md',
	'docs/model-review.md',
	'docs/model-reading-path.md',
	'docs/model-answer-views.md',
	'src/lib/answer-view.ts',
	'src/data/model-answer-questions.json',
	'src/components/model/AnswerNavigation.astro',
	'src/components/model/AnswerStatement.astro',
	'src/pages/model/answers/[...slug].astro',
	'scripts/model-audit.mjs',
	'scripts/model-review-impact.mjs',
	'src/content.config.ts',
	'src/lib/statements.ts',
	'src/lib/arguments.ts',
	'src/lib/identifiers.ts',
	'src/lib/semantic-uses.ts',
	'src/lib/reasoning.ts',
	'src/lib/revision-graph.mjs',
	'src/lib/reading-path.ts',
	'src/data/model-reading-path.json',
	'astro.config.mjs',
	'package.json',
	'package-lock.json',
	'src/styles/global.css',
	'src/scripts/model-fragments.ts',
	'src/lib/reading-navigation.ts',
	'src/lib/embedded-markdown.ts',
	'src/components/model/ArgumentStep.astro',
	'src/components/model/CanonicalBody.astro',
	'src/components/model/ReadingSection.astro',
	'src/components/model/ReasoningHelp.astro',
	'src/components/model/ReasoningParticipation.astro',
	'src/components/model/StatementMaterial.astro',
	'src/components/model/StatementStep.astro',
	'src/components/model/StatementText.astro',
	'src/components/SemanticUseLegend.astro',
	'src/components/Comments.astro',
	'src/layouts/Layout.astro',
	'src/lib/site.ts',
	'src/components/ModelAcknowledgment.astro',
	'src/pages/model/index.astro',
	'src/pages/model/[...slug].astro',
	'src/pages/model/arguments/index.astro',
	'src/pages/model/arguments/[...slug].astro',
];
export const rubricFields = [
	'proposition',
	'qualifiers',
	'evidenceSeparation',
	'alignment',
	'inferenceAndImpact',
];

function markdownPaths(root, directory) {
	return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) return markdownPaths(root, path);
		return entry.isFile() && /\.mdx?$/.test(entry.name) ? [path] : [];
	});
}

export function fingerprint(content) {
	return createHash('sha256').update(content.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

export function collectInputs(root) {
	const subjects = [
		...markdownPaths(root, 'src/content/model/statements'),
		...markdownPaths(root, 'src/content/model/arguments'),
	].sort();
	const paths = [...policyPaths, ...subjects].sort();
	const sources = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n')]));
	const inputs = Object.fromEntries(paths.map((path) => [path, fingerprint(sources[path])]));
	const snapshot = buildSnapshot(sources, subjects);
	const bases = Object.fromEntries(Object.entries(snapshot.subjects).map(([id, path]) => [path, reviewBasis(snapshot, id)]));
	return { schemaVersion: 2, inputs, subjects, sources, snapshot, bases };
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const owns = (object, key) => Object.hasOwn(object, key);
const validDate = (value) => nonempty(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

function provenanceIssues(value, label) {
	if (!isObject(value) || !validDate(value.reviewedAt)) return [`Malformed ${label}: reviewedAt must be an ISO timestamp.`];
	const reviewer = value.reviewer;
	if (!isObject(reviewer) || !['human', 'ai', 'human-with-ai-assistance'].includes(reviewer.kind) || !nonempty(reviewer.identifier)) return [`Malformed ${label}: identify the reviewer and kind.`];
	if (reviewer.kind !== 'human' && !nonempty(reviewer.model)) return [`Malformed ${label}: AI-assisted findings require model provenance.`];
	return [];
}

export function planReview(packet, review, { full = false, now = Date.now() } = {}) {
	const usable = review?.schemaVersion === 2 && review.snapshot?.version === packet.snapshot.version && isObject(review.snapshot.units) && isObject(review.snapshot.subjects) && Array.isArray(review.snapshot.edges);
	const whole = review?.wholeModelReview;
	const due = !validDate(whole?.reviewedAt) || now - Date.parse(whole.reviewedAt) >= fullReviewIntervalDays * 86_400_000;
	const impact = deriveImpact(usable ? review.snapshot : null, packet.snapshot);
	const globalChange = impact.changedUnits.some((key) => packet.snapshot.units[key]?.targets === null || review?.snapshot?.units?.[key]?.targets === null);
	const mode = full || !usable || due || globalChange ? 'full' : 'incremental';
	const changedInputs = [...new Set([...Object.keys(review?.inputs ?? {}), ...Object.keys(packet.inputs)])].sort().filter((path) => review?.inputs?.[path] !== packet.inputs[path]);
	const required = [];
	const retained = [];
	for (const [id, path] of Object.entries(packet.snapshot.subjects)) {
		const record = review?.records?.[path];
		const reasons = impact.reasons[id] ?? [];
		const stale = record?.basis !== packet.bases[path];
		const item = { id, path, basis: packet.bases[path], previousReviewedAt: record?.reviewedAt ?? review?.reviewedAt ?? null };
		if (mode === 'full' || stale || record?.finding !== 'consistent' || provenanceIssues(record, path).length || rubricFields.some((field) => !nonempty(record?.[field]))) {
			required.push({ ...item, reasons: reasons.length ? reasons : [{ reason: mode === 'full' ? (full ? 'Explicit whole-model review' : !usable ? 'Establish a schema-2 baseline' : globalChange ? 'Shared input changed' : 'Periodic whole-model review is due') : 'Review basis or findings are missing, stale or incomplete' }] });
		} else retained.push(item);
	}
	return { mode, fullReviewDue: due, fullReviewIntervalDays, changedInputs, required, retained, removed: Object.keys(review?.records ?? {}).filter((path) => !packet.subjects.includes(path)).sort() };
}

export function checkReview(packet, review, options = {}) {
	if (review == null) return [`Missing ${reviewPath}. Perform the semantic audit in docs/model-review.md.`];
	if (!isObject(review)) return [`Malformed ${reviewPath}: expected a JSON object.`];
	const issues = [];
	if (review.schemaVersion !== packet.schemaVersion) issues.push('Malformed review: unsupported schemaVersion.');
	issues.push(...provenanceIssues(review, 'review'));
	issues.push(...provenanceIssues(review.wholeModelReview, 'whole-model review'));
	if (!isObject(review.wholeModelReview?.inputs) || !Object.keys(review.wholeModelReview.inputs).length || Object.values(review.wholeModelReview.inputs).some((value) => typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))) issues.push('Malformed whole-model review: retain its exact input fingerprints.');
	if (planReview(packet, review, options).fullReviewDue) issues.push(`Whole-model review overdue or missing: required every ${fullReviewIntervalDays} days and before a Model release.`);
	if (serialize(review.snapshot) !== serialize(packet.snapshot)) issues.push('Stale review impact snapshot: inspect the old/new impact plan before recording the current snapshot.');
	if (!isObject(review.inputs)) {
		issues.push('Malformed review: inputs must contain the reviewed file fingerprints.');
	} else {
		for (const [path, digest] of Object.entries(packet.inputs)) {
			if (!owns(review.inputs, path)) issues.push(`Missing reviewed input: ${path}`);
			else if (review.inputs[path] !== digest) issues.push(`Stale reviewed input: ${path}`);
		}
		for (const path of Object.keys(review.inputs)) {
			if (!owns(packet.inputs, path)) issues.push(`Removed reviewed input: ${path}`);
		}
	}
	if (!isObject(review.records)) {
		issues.push('Malformed review: records must contain a finding for every statement and argument.');
	} else {
		for (const path of packet.subjects) {
			const record = owns(review.records, path) ? review.records[path] : undefined;
			if (!isObject(record)) {
				issues.push(`Missing review record: ${path}`);
				continue;
			}
			issues.push(...provenanceIssues(record, `record ${path}`));
			if (record.basis !== packet.bases[path]) issues.push(`Stale review basis: ${path}`);
			if (record.finding === 'needs-revision') issues.push(`Needs revision: ${path}`);
			else if (record.finding !== 'consistent') issues.push(`Malformed finding: ${path}`);
			for (const field of rubricFields) {
				if (!nonempty(record[field])) issues.push(`Missing ${field} rationale: ${path}`);
			}
		}
		for (const path of Object.keys(review.records)) {
			if (!packet.subjects.includes(path)) issues.push(`Unexpected review record: ${path}`);
		}
	}
	return issues;
}

export function readReview(root) {
	try {
		return JSON.parse(readFileSync(join(root, reviewPath), 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw new Error(`Cannot read ${reviewPath}: ${error.message}`);
	}
}

function main() {
	const args = process.argv.slice(2);
	if (new Set(args).size !== args.length || args.some((arg) => !['--packet', '--check', '--plan', '--full'].includes(arg)) || args.filter((arg) => arg !== '--full').length > 1 || (args.includes('--check') && args.includes('--full'))) {
		throw new Error('Usage: node scripts/model-audit.mjs [--packet | --plan | --check] [--full (review planning only)]');
	}
	const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	const packet = collectInputs(root);
	const review = readReview(root);
	const plan = planReview(packet, review, { full: args.includes('--full') });
	if (args.includes('--packet')) {
		console.log(JSON.stringify({ ...packet, plan }, null, 2));
		return;
	}
	if (args.includes('--plan')) {
		console.log(JSON.stringify(plan, null, 2));
		return;
	}
	const issues = checkReview(packet, review);
	if (issues.length) {
		console.log(issues.join('\n'));
		console.log(`Review scope: ${plan.required.length} records require review; ${plan.retained.length} retain their findings and provenance. Run with --plan for the reasons and previous/current paths.`);
		console.log('Review the affected inputs using docs/model-review.md; do not refresh fingerprints without a semantic audit.');
		if (args.includes('--check')) process.exitCode = 1;
	} else {
		console.log(`Model review current: ${packet.subjects.length} records cover ${Object.keys(packet.inputs).length} inputs. This checks recorded review coverage, not empirical truth or logical validity.`);
		if (args.includes('--full')) console.log(`Explicit whole-model review requested: examine all ${plan.required.length} records and record a new wholeModelReview attestation.`);
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		main();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
