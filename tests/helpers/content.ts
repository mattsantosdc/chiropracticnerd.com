import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { LoaderContext } from 'astro/loaders';
// Use the same frontmatter parser as Astro's Markdown content entry type.
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { collections } from '../../src/content.config.ts';
import { fingerprint } from '../../scripts/model-audit.mjs';
import type { StatementEntry } from '../../src/lib/statements.ts';
import type { ArgumentEntry } from '../../src/lib/arguments.ts';

export function markdownPaths(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? markdownPaths(path) : /\.mdx?$/.test(entry.name) ? [path] : [];
	}).sort();
}

export async function loadCanonicalCollection(name: 'statements' | 'arguments') {
	const collection = collections[name];
	const records = new Map<string, StatementEntry | ArgumentEntry>();
	const root = pathToFileURL(`${process.cwd()}/`);
	const entryType = {
		getEntryInfo({ contents }: { contents: string }) {
			const { frontmatter, content } = parseFrontmatter(contents);
			return { data: frontmatter, body: content };
		},
	};
	// Exercise the configured Astro glob loader and schema with an in-memory store.
	await collection.loader.load({
		collection: name,
		config: { root, srcDir: new URL('src/', root) },
		logger: { warn: assert.fail, error: assert.fail },
		entryTypes: new Map([['.md', entryType], ['.mdx', entryType]]),
		generateDigest: fingerprint,
		parseData: ({ data }: { data: unknown }) => collection.schema.parse(data),
		store: {
			keys: () => records.keys(),
			get: (id: string) => records.get(id),
			delete: (id: string) => records.delete(id),
			set(record: StatementEntry | ArgumentEntry) {
				assert.ok(!records.has(record.id), `Duplicate generated content ID: ${record.id}`);
				records.set(record.id, { ...record, collection: name } as StatementEntry | ArgumentEntry);
			},
		},
	} as unknown as LoaderContext);
	return [...records.values()];
}

export async function loadCanonicalContent() {
	const [statements, argumentsList] = await Promise.all([
		loadCanonicalCollection('statements'), loadCanonicalCollection('arguments'),
	]);
	return { statements: statements as StatementEntry[], argumentsList: argumentsList as ArgumentEntry[] };
}
