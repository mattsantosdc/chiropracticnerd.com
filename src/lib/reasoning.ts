import { validateArguments, type ArgumentEntry } from './arguments.ts';
import { validateStatements, type StatementEntry } from './statements.ts';
import { argumentSemanticIdentifier, statementSemanticIdentifier } from './identifiers.ts';

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
	return { statementsById, argumentsById, concludingArguments, premiseArguments };
}
