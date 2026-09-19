import type { CollectionEntry } from 'astro:content';
import { isSemanticUseRole } from './semantic-uses.ts';
import { statementIdPattern } from './identifiers.ts';

export {
	semanticUseRoleDefinitions,
	semanticUseRoles,
	type SemanticUseRole,
} from './semantic-uses.ts';

export type StatementEntry = CollectionEntry<'statements'>;
export type StatementDomain = StatementEntry['data']['domain'];
export type SemanticUse = StatementEntry['data']['semanticUses'][number];

export const domainOrder: StatementDomain[] = ['framework', 'philosophy', 'science', 'art'];

export const domainLabels: Record<StatementDomain, string> = {
	framework: 'How the model works',
	philosophy: 'Philosophy',
	science: 'Science',
	art: 'Art',
};

export const reservedStatementSlugRoots = ['arguments', 'answers', 'alternatives'] as const;

export function isReservedStatementSlug(slug: string) {
	const [root] = slug.split('/');
	return reservedStatementSlugRoots.includes(root as (typeof reservedStatementSlugRoots)[number]);
}

export function sortStatements(entries: StatementEntry[]) {
	return [...entries].sort((a, b) => {
		const domainDifference = domainOrder.indexOf(a.data.domain) - domainOrder.indexOf(b.data.domain);
		return domainDifference || a.data.order - b.data.order;
	});
}

export function validateStatements(entries: StatementEntry[]) {
	const byId = new Map<string, StatementEntry>();
	const bySlug = new Map<string, StatementEntry>();
	const dependencyPairs = new Set<string>();
	const relatedPairs = new Set<string>();
	const pairKey = (firstId: string, secondId: string) =>
		[firstId, secondId].sort().join('\u0000');

	for (const entry of entries) {
		if ('upstream' in entry.data || 'downstream' in entry.data) throw new Error(`${entry.data.id} uses retired relationship fields`);
		if (!Array.isArray(entry.data.semanticUses)) throw new Error(`${entry.data.id} requires semanticUses`);
		if (!statementIdPattern.test(entry.data.id)) throw new Error(`Invalid statement id: ${entry.data.id}`);
		if (byId.has(entry.data.id)) throw new Error(`Duplicate statement id: ${entry.data.id}`);
		if (bySlug.has(entry.data.slug)) throw new Error(`Duplicate statement slug: ${entry.data.slug}`);
		if (isReservedStatementSlug(entry.data.slug)) {
			throw new Error(
				`${entry.data.id} statement slug uses reserved route: ${entry.data.slug}`,
			);
		}
		if (entry.data.statementType === 'empirical') {
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
		for (const dependency of entry.data.semanticUses) {
			if (upstreamIds.has(dependency.id)) {
				throw new Error(`${entry.data.id} has duplicate semantic use ${dependency.id}`);
			}
			upstreamIds.add(dependency.id);

			if (!byId.has(dependency.id)) {
				throw new Error(`${entry.data.id} references missing statement id ${dependency.id}`);
			}
			if (dependency.id === entry.data.id) {
				throw new Error(`${entry.data.id} cannot reference itself`);
			}
			if (!isSemanticUseRole(dependency.role)) {
				throw new Error(`${entry.data.id} has unknown semantic-use role ${dependency.role}`);
			}
			if (typeof dependency.note !== 'string' || !dependency.note.trim()) {
				throw new Error(
					`${entry.data.id} semantic use of ${dependency.id} requires an explanatory note`,
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
				throw new Error(`${entry.data.id} references missing statement id ${relatedId}`);
			}
			if (relatedId === entry.data.id) throw new Error(`${entry.data.id} cannot reference itself`);

			const relationshipPair = pairKey(entry.data.id, relatedId);
			if (dependencyPairs.has(relationshipPair)) {
				throw new Error(
					`${entry.data.id} and ${relatedId} cannot be both semantic-use-linked and related`,
				);
			}
			if (relatedPairs.has(relationshipPair)) {
				throw new Error(`${entry.data.id} and ${relatedId} have a duplicate related link`);
			}
			relatedPairs.add(relationshipPair);
		}
	}

	return byId;
}

export function getRelatedStatements(entries: StatementEntry[], entryId: string) {
	const entry = entries.find((candidate) => candidate.data.id === entryId);
	if (!entry) return [];

	return entries.filter(
		(candidate) =>
			entry.data.related.includes(candidate.data.id) ||
			candidate.data.related.includes(entry.data.id),
	);
}
