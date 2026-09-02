import type { CollectionEntry } from 'astro:content';

export { relationshipDefinitions, relationshipTypes, type RelationshipType } from './relationships';

export type ModelEntry = CollectionEntry<'model'>;
export type ModelDomain = ModelEntry['data']['domain'];
export type UpstreamRelationship = ModelEntry['data']['upstream'][number];

export const domainOrder: ModelDomain[] = ['framework', 'philosophy', 'science', 'art'];

export const domainLabels: Record<ModelDomain, string> = {
	framework: 'How the model works',
	philosophy: 'Philosophy',
	science: 'Science',
	art: 'Art',
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
	const dependencyPairs = new Set<string>();
	const relatedPairs = new Set<string>();
	const pairKey = (firstId: string, secondId: string) =>
		[firstId, secondId].sort().join('\u0000');

	for (const entry of entries) {
		if (byId.has(entry.data.id)) throw new Error(`Duplicate model id: ${entry.data.id}`);
		if (bySlug.has(entry.data.slug)) throw new Error(`Duplicate model slug: ${entry.data.slug}`);
		byId.set(entry.data.id, entry);
		bySlug.set(entry.data.slug, entry);
	}

	for (const entry of entries) {
		const upstreamIds = new Set<string>();
		let logicalDependencyCount = 0;
		for (const dependency of entry.data.upstream) {
			if (upstreamIds.has(dependency.id)) {
				throw new Error(`${entry.data.id} has duplicate upstream dependency ${dependency.id}`);
			}
			upstreamIds.add(dependency.id);

			if (!byId.has(dependency.id)) {
				throw new Error(`${entry.data.id} references missing model id ${dependency.id}`);
			}
			if (dependency.id === entry.data.id) {
				throw new Error(`${entry.data.id} cannot reference itself`);
			}
			dependencyPairs.add(pairKey(entry.data.id, dependency.id));
			if (dependency.relation === 'logical') logicalDependencyCount += 1;
		}

		if (logicalDependencyCount > 0 && !entry.data.inference) {
			throw new Error(
				`${entry.data.id} has a logical dependency but does not state its inference rule`,
			);
		}
		if (entry.data.inference && logicalDependencyCount === 0) {
			throw new Error(
				`${entry.data.id} states an inference rule but has no logical dependencies`,
			);
		}
	}

	for (const entry of entries) {
		const relatedIds = new Set<string>();
		for (const relatedId of entry.data.related) {
			if (relatedIds.has(relatedId)) {
				throw new Error(`${entry.data.id} has duplicate related entry ${relatedId}`);
			}
			relatedIds.add(relatedId);

			if (!byId.has(relatedId)) {
				throw new Error(`${entry.data.id} references missing model id ${relatedId}`);
			}
			if (relatedId === entry.data.id) throw new Error(`${entry.data.id} cannot reference itself`);

			const relationshipPair = pairKey(entry.data.id, relatedId);
			if (dependencyPairs.has(relationshipPair)) {
				throw new Error(
					`${entry.data.id} and ${relatedId} cannot be both dependency-linked and related`,
				);
			}
			if (relatedPairs.has(relationshipPair)) {
				throw new Error(`${entry.data.id} and ${relatedId} have a duplicate related link`);
			}
			relatedPairs.add(relationshipPair);
		}
	}

	const visiting = new Set<string>();
	const visited = new Set<string>();
	const visit = (id: string, path: string[]) => {
		if (visiting.has(id)) throw new Error(`Model dependency cycle: ${[...path, id].join(' -> ')}`);
		if (visited.has(id)) return;
		visiting.add(id);
		const entry = byId.get(id);
		for (const dependency of entry?.data.upstream ?? []) visit(dependency.id, [...path, id]);
		visiting.delete(id);
		visited.add(id);
	};

	for (const id of byId.keys()) visit(id, []);
	return byId;
}
