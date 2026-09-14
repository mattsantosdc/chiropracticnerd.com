import { validateArguments, type ArgumentEntry } from './arguments.ts';
import { validateStatements, type StatementEntry } from './statements.ts';
import { argumentSemanticIdentifier, statementSemanticIdentifier } from './identifiers.ts';
import { theoryEdges, semanticUseEdges, revisionReach } from './revision-graph.mjs';

export type ResolvedStatement = {
	entry: StatementEntry;
	href: string;
	semanticId: string;
};

export type ResolvedArgument = {
	entry: ArgumentEntry;
	href: string;
	semanticId: string;
	premises: readonly ResolvedStatement[];
	conclusion: ResolvedStatement;
};

export type ReasoningIndex = {
	statementsById: ReadonlyMap<string, ResolvedStatement>;
	argumentsById: ReadonlyMap<string, ResolvedArgument>;
	concludingArguments: ReadonlyMap<string, readonly ResolvedArgument[]>;
	premiseArguments: ReadonlyMap<string, readonly ResolvedArgument[]>;
	revisionCandidates: (id: string) => readonly ResolvedStatement[];
};

/** Finite participation lists, never a recursive expansion or a dependency projection. */
export function buildReasoningIndex(
	statements: readonly StatementEntry[],
	argumentsList: readonly ArgumentEntry[],
): ReasoningIndex {
	validateStatements([...statements]);
	validateArguments([...argumentsList], [...statements]);
	const statementsById = new Map<string, ResolvedStatement>();
	const argumentsById = new Map<string, ResolvedArgument>();
	const concludingArguments = new Map<string, ResolvedArgument[]>();
	const premiseArguments = new Map<string, ResolvedArgument[]>();
	for (const entry of statements) {
		statementsById.set(entry.data.id, {
			entry,
			href: `/model/${entry.data.slug}/`,
			semanticId: statementSemanticIdentifier(entry.data.id),
		});
		concludingArguments.set(entry.data.id, []);
		premiseArguments.set(entry.data.id, []);
	}
	for (const entry of argumentsList) {
		const argument: ResolvedArgument = {
			entry,
			href: `/model/arguments/${entry.data.slug}/`,
			semanticId: argumentSemanticIdentifier(entry.data.id),
			premises: entry.data.premises.map((id) => statementsById.get(id)!),
			conclusion: statementsById.get(entry.data.conclusion)!,
		};
		argumentsById.set(entry.data.id, argument);
		concludingArguments.get(entry.data.conclusion)!.push(argument);
		for (const id of entry.data.premises) premiseArguments.get(id)!.push(argument);
	}
	const revisionEdges = [
		...theoryEdges({
			statements: statements.map(({ data }) => ({ id: data.id })),
			rules: argumentsList.map(({ data }) => ({ ...data, kind: data.inferenceKind === 'deductive' ? 'strict' : 'defeasible' })),
			undercutters: [],
		}),
		...semanticUseEdges(statements.map(({ data }) => data)),
	];
	const revisionCandidates = (id: string) => {
		if (!statementsById.has(id) && !argumentsById.has(id)) throw new Error(`Unknown revision source: ${id}`);
		const reached = revisionReach(revisionEdges, [id]);
		return [...statementsById.values()].filter(({ entry }) => entry.data.id !== id && reached.has(entry.data.id));
	};
	return { statementsById, argumentsById, concludingArguments, premiseArguments, revisionCandidates };
}
