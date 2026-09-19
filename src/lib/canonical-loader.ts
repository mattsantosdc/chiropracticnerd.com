import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob, type Loader } from 'astro/loaders';

function hasMarkdown(directory: string): boolean {
	return readdirSync(directory, { withFileTypes: true }).some((entry) => entry.isDirectory()
		? hasMarkdown(resolve(directory, entry.name))
		: entry.isFile() && /\.mdx?$/.test(entry.name));
}

/** Astro's glob loader returns before clearing stale records for an empty glob.
 * Empty alternative corpora are valid, including after withdrawing the last record.
 */
export function canonicalGlob(base: string): Loader {
	const delegate = glob({ base, pattern: '**/*.{md,mdx}' });
	return {
		name: 'canonical-markdown',
		async load(context) {
			const directory = fileURLToPath(new URL(base.endsWith('/') ? base : `${base}/`, context.config.root));
			if (hasMarkdown(directory)) return delegate.load(context);
			context.store.clear();
			// Bootstrap the first addition in dev; subsequent changes use glob's watcher.
			if (context.watcher) {
				const watcher = context.watcher;
				watcher.add(directory);
				const onAdd = async (path: string) => {
					const local = relative(directory, path);
					if (local.startsWith('..') || !/\.mdx?$/.test(local)) return;
					try {
						await delegate.load(context);
						watcher.off('add', onAdd);
						watcher.off('change', onAdd);
					}
					catch (error) { context.logger.error(`Cannot load canonical alternatives: ${error instanceof Error ? error.message : String(error)}`); }
				};
				watcher.on('add', onAdd);
				watcher.on('change', onAdd);
			}
		},
	};
}
