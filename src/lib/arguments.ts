import type { CollectionEntry } from 'astro:content';
import type { StatementEntry } from './statements.ts';

export const inferenceKinds = ['deductive', 'defeasible'] as const;

export type InferenceKind = (typeof inferenceKinds)[number];
export type ArgumentEntry = CollectionEntry<'arguments'>;

export function isInferenceKind(value: unknown): value is InferenceKind {
	return inferenceKinds.includes(value as InferenceKind);
}

export function sortArguments(argumentsList: ArgumentEntry[]) {
	return [...argumentsList].sort((a, b) => a.data.id.localeCompare(b.data.id));
}

export function validateArguments(argumentsList: ArgumentEntry[], statementEntries: StatementEntry[]) {
	const statementById = new Map(statementEntries.map((entry) => [entry.data.id, entry]));
	const byId = new Map<string, ArgumentEntry>();
	const bySlug = new Map<string, ArgumentEntry>();

	for (const argument of argumentsList) {
		if (byId.has(argument.data.id)) {
			throw new Error(`Duplicate argument id: ${argument.data.id}`);
		}
		if (bySlug.has(argument.data.slug)) {
			throw new Error(`Duplicate argument slug: ${argument.data.slug}`);
		}
		if (!/^ARG-\d{3}$/.test(argument.data.id)) {
			throw new Error(`Invalid argument id: ${argument.data.id}`);
		}
		if (!isInferenceKind(argument.data.inferenceKind)) {
			throw new Error(
				`${argument.data.id} has unknown inference kind ${argument.data.inferenceKind}`,
			);
		}
		if (argument.data.premises.length === 0) {
			throw new Error(`${argument.data.id} requires at least one premise`);
		}

		const premiseIds = new Set<string>();
		for (const premiseId of argument.data.premises) {
			if (premiseIds.has(premiseId)) {
				throw new Error(`${argument.data.id} has duplicate premise ${premiseId}`);
			}
			premiseIds.add(premiseId);

			if (!statementById.has(premiseId)) {
				throw new Error(`${argument.data.id} references missing premise ${premiseId}`);
			}
			if (premiseId === argument.data.conclusion) {
				throw new Error(`${argument.data.id} cannot use conclusion ${premiseId} as a premise`);
			}
		}

		if (!statementById.has(argument.data.conclusion)) {
			throw new Error(
				`${argument.data.id} references missing conclusion ${argument.data.conclusion}`,
			);
		}

		byId.set(argument.data.id, argument);
		bySlug.set(argument.data.slug, argument);
	}

	return byId;
}
