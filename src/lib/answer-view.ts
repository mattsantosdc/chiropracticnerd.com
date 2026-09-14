import type { ReasoningIndex, ResolvedArgument, ResolvedStatement } from './reasoning.ts';

export type AnswerQuestion = { id: string; question: string; statement: string };
export type AnswerStatement = {
	statement: ResolvedStatement;
	arguments: readonly ResolvedArgument[];
	assumed: boolean;
	contraryAssumed: boolean;
};

export const answerHref = (statement: ResolvedStatement) => `/model/answers/${statement.entry.data.slug}/`;
export const answerAnchor = (id: string) => `answer-statement-${id.toLowerCase()}`;

/** These labels select an existing statement; they author no answer or inference. */
export function resolveAnswerQuestions(input: unknown, index: ReasoningIndex): (AnswerQuestion & { href: string })[] {
	if (!Array.isArray(input)) throw new Error('Answer questions must be an array');
	const seen = new Set<string>();
	for (const value of input) {
		if (!value || typeof value !== 'object' || Array.isArray(value) ||
			Object.keys(value).sort().join(',') !== 'id,question,statement' ||
			typeof value.id !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value.id) ||
			typeof value.question !== 'string' || !value.question.trim() ||
			typeof value.statement !== 'string' || !index.statementsById.has(value.statement)) {
			throw new Error('Each answer question requires a local id, question and existing statement');
		}
		if (seen.has(value.id)) throw new Error(`Duplicate answer question: ${value.id}`);
		seen.add(value.id);
	}
	return (input as AnswerQuestion[]).map((question) => ({ ...question, href: answerHref(index.statementsById.get(question.statement)!) }));
}

/** Authored support only. Never evaluate this presentation slice as an ASPIC+ theory. */
export function buildAnswerView(index: ReasoningIndex, target: string, ordinaryPremises: readonly string[]) {
	if (!index.statementsById.has(target)) throw new Error(`Unknown answer statement: ${target}`);
	const assumptions = new Set<string>();
	for (const id of ordinaryPremises) {
		if (typeof id !== 'string' || !index.statementsById.has(id.startsWith('-') ? id.slice(1) : id) || assumptions.has(id)) {
			throw new Error(`Invalid or duplicate starting premise: ${id}`);
		}
		assumptions.add(id);
	}
	const statements: AnswerStatement[] = [];
	const queue = [target];
	const seen = new Set<string>();
	for (let i = 0; i < queue.length; i++) {
		const id = queue[i];
		if (seen.has(id)) continue;
		seen.add(id);
		const incoming = index.concludingArguments.get(id)!;
		statements.push({ statement: index.statementsById.get(id)!, arguments: incoming, assumed: assumptions.has(id), contraryAssumed: assumptions.has(`-${id}`) });
		for (const argument of incoming) {
			for (const premise of argument.premises) queue.push(premise.entry.data.id);
		}
	}
	return { target: index.statementsById.get(target)!, groups: statements };
}
