import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { dependencyRoles } from '../src/lib/dependencies.ts';

function markdownFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return markdownFiles(path);
		return entry.isFile() && /\.mdx?$/.test(entry.name) ? [path] : [];
	});
}

test('model content uses the five-role dependency contract', () => {
	const content = markdownFiles('src/content/model')
		.map((path) => readFileSync(path, 'utf8'))
		.join('\n');
	const roles = [...content.matchAll(/^\s+role:\s+(\S+)\s*$/gm)].map((match) => match[1]);

	assert.ok(roles.length > 0);
	assert.ok(
		roles.every((role) => dependencyRoles.includes(role as (typeof dependencyRoles)[number])),
	);
	assert.doesNotMatch(content, /^\s+relation:\s+/m);
	assert.doesNotMatch(content, /^claimType:\s+logical\s*$/m);
	assert.doesNotMatch(content, /^inference:\s*$/m);
});

test('argument content stays separate from Model claim types and soundness shortcuts', () => {
	const modelContent = markdownFiles('src/content/model')
		.map((path) => readFileSync(path, 'utf8'))
		.join('\n');
	const argumentContent = markdownFiles('src/content/arguments')
		.map((path) => readFileSync(path, 'utf8'))
		.join('\n');

	assert.doesNotMatch(modelContent, /^claimType:\s+logical\s*$/m);
	assert.doesNotMatch(modelContent, /^status\s*:/m, 'Model adoption is represented by inclusion, not editorial status');
	assert.doesNotMatch(argumentContent, /^status\s*:/m, 'Argument adoption is represented by inclusion, not editorial status');
	assert.match(argumentContent, /^id:\s+ARG-\d{3}\s*$/m);
	assert.match(argumentContent, /^inferenceKind:\s+(deductive|defeasible)\s*$/m);
	assert.doesNotMatch(argumentContent, /^sound:\s+/m);
});
