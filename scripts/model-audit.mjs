import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const reviewPath = 'reviews/model-review.json';
export const policyPaths = [
	'AGENTS.md',
	'docs/model-authoring.md',
	'docs/dependency-model.md',
	'docs/argument-model.md',
	'docs/standards-contract.md',
	'docs/visualization-plan.md',
	'docs/model-review.md',
	'scripts/model-audit.mjs',
	'src/content.config.ts',
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
		...markdownPaths(root, 'src/content/model'),
		...markdownPaths(root, 'src/content/arguments'),
	].sort();
	const paths = [...policyPaths, ...subjects].sort();
	const sources = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), 'utf8')]));
	const inputs = Object.fromEntries(paths.map((path) => [path, fingerprint(sources[path])]));
	return { schemaVersion: 1, inputs, subjects, sources };
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const owns = (object, key) => Object.hasOwn(object, key);

export function checkReview(packet, review) {
	if (review == null) return [`Missing ${reviewPath}. Perform the semantic audit in docs/model-review.md.`];
	if (!isObject(review)) return [`Malformed ${reviewPath}: expected a JSON object.`];
	const issues = [];
	if (review.schemaVersion !== packet.schemaVersion) issues.push('Malformed review: unsupported schemaVersion.');
	if (!nonempty(review.reviewedAt) || !/^\d{4}-\d{2}-\d{2}T/.test(review.reviewedAt) || !Number.isFinite(Date.parse(review.reviewedAt))) {
		issues.push('Malformed review: reviewedAt must be an ISO timestamp.');
	}
	if (!isObject(review.reviewer) || !['human', 'ai', 'human-with-ai-assistance'].includes(review.reviewer.kind) || !nonempty(review.reviewer.identifier)) {
		issues.push('Malformed review: identify the reviewer and kind.');
	} else if (review.reviewer.kind !== 'human' && !nonempty(review.reviewer.model)) {
		issues.push('Malformed review: AI-assisted findings require model provenance.');
	}
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
		issues.push('Malformed review: records must contain a finding for every Model entry and argument.');
	} else {
		for (const path of packet.subjects) {
			const record = owns(review.records, path) ? review.records[path] : undefined;
			if (!isObject(record)) {
				issues.push(`Missing review record: ${path}`);
				continue;
			}
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
	if (args.length > 1 || args.some((arg) => !['--packet', '--check'].includes(arg))) {
		throw new Error('Usage: node scripts/model-audit.mjs [--packet | --check]');
	}
	const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	const packet = collectInputs(root);
	if (args.includes('--packet')) {
		console.log(JSON.stringify(packet, null, 2));
		return;
	}
	const issues = checkReview(packet, readReview(root));
	if (issues.length) {
		console.log(issues.join('\n'));
		console.log('Review the current inputs using docs/model-review.md; do not refresh fingerprints without a semantic audit.');
		if (args.includes('--check')) process.exitCode = 1;
	} else {
		console.log(`Model review current: ${packet.subjects.length} records cover ${Object.keys(packet.inputs).length} inputs. This checks recorded review coverage, not empirical truth or logical validity.`);
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
