import type { CollectionEntry } from 'astro:content';
import { isDependencyRole } from './dependencies.ts';

export {
	dependencyRoleDefinitions,
	dependencyRoles,
	type DependencyRole,
} from './dependencies.ts';

export type ModelEntry = CollectionEntry<'model'>;
export type ModelDomain = ModelEntry['data']['domain'];
export type UpstreamDependency = ModelEntry['data']['upstream'][number];

export const domainOrder: ModelDomain[] = ['framework', 'philosophy', 'science', 'art'];

export const domainLabels: Record<ModelDomain, string> = {
	framework: 'How the model works',
	philosophy: 'Philosophy',
	science: 'Science',
	art: 'Art',
};

export const reservedModelSlugRoots = ['arguments'] as const;

export function isReservedModelSlug(slug: string) {
	const [root] = slug.split('/');
	return reservedModelSlugRoots.includes(root as (typeof reservedModelSlugRoots)[number]);
}

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
		if (isReservedModelSlug(entry.data.slug)) {
			throw new Error(
				`${entry.data.id} model slug uses reserved route: ${entry.data.slug}`,
			);
		}
		if (entry.data.claimType === 'empirical') {
			if (entry.data.confidence === 'not-applicable') {
				throw new Error(`${entry.data.id} empirical claim requires a confidence assessment`);
			}
			if (!entry.data.whatWouldChange?.trim()) {
				throw new Error(`${entry.data.id} empirical claim requires whatWouldChange`);
			}
		}
		byId.set(entry.data.id, entry);
		bySlug.set(entry.data.slug, entry);
	}

	for (const entry of entries) {
		const upstreamIds = new Set<string>();
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
			if (!isDependencyRole(dependency.role)) {
				throw new Error(`${entry.data.id} has unknown dependency role ${dependency.role}`);
			}
			if (typeof dependency.note !== 'string' || !dependency.note.trim()) {
				throw new Error(
					`${entry.data.id} dependency on ${dependency.id} requires an explanatory note`,
				);
			}
			dependencyPairs.add(pairKey(entry.data.id, dependency.id));
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

export function getRelatedEntries(entries: ModelEntry[], entryId: string) {
	const entry = entries.find((candidate) => candidate.data.id === entryId);
	if (!entry) return [];

	return entries.filter(
		(candidate) =>
			entry.data.related.includes(candidate.data.id) ||
			candidate.data.related.includes(entry.data.id),
	);
}
