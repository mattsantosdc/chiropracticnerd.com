import type { CollectionEntry } from 'astro:content';

export type ModelEntry = CollectionEntry<'model'>;
export type ModelDomain = ModelEntry['data']['domain'];

export const domainOrder: ModelDomain[] = ['framework', 'philosophy', 'science', 'art', 'application'];

export const domainLabels: Record<ModelDomain, string> = {
	framework: 'How the model works',
	philosophy: 'Philosophy',
	science: 'Science',
	art: 'Art and technique',
	application: 'Practical application',
};

export function sortModelEntries(entries: ModelEntry[]) {
	return [...entries].sort((a, b) => {
		const domainDifference = domainOrder.indexOf(a.data.domain) - domainOrder.indexOf(b.data.domain);
		return domainDifference || a.data.order - b.data.order || a.data.id.localeCompare(b.data.id);
	});
}

export function validateModel(entries: ModelEntry[]) {
	const byId = new Map<string, ModelEntry>();
	const bySlug = new Map<string, ModelEntry>();

	for (const entry of entries) {
		if (byId.has(entry.data.id)) throw new Error(`Duplicate model id: ${entry.data.id}`);
		if (bySlug.has(entry.data.slug)) throw new Error(`Duplicate model slug: ${entry.data.slug}`);
		byId.set(entry.data.id, entry);
		bySlug.set(entry.data.slug, entry);
	}

	for (const entry of entries) {
		for (const dependency of [...entry.data.upstream, ...entry.data.related]) {
			if (!byId.has(dependency)) {
				throw new Error(`${entry.data.id} references missing model id ${dependency}`);
			}
			if (dependency === entry.data.id) {
				throw new Error(`${entry.data.id} cannot reference itself`);
			}
		}
	}

	const visiting = new Set<string>();
	const visited = new Set<string>();
	const visit = (id: string, path: string[]) => {
		if (visiting.has(id)) throw new Error(`Model dependency cycle: ${[...path, id].join(' -> ')}`);
		if (visited.has(id)) return;
		visiting.add(id);
		const entry = byId.get(id);
		for (const dependency of entry?.data.upstream ?? []) visit(dependency, [...path, id]);
		visiting.delete(id);
		visited.add(id);
	};

	for (const id of byId.keys()) visit(id, []);
	return byId;
}
