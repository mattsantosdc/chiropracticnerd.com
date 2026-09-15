import { theoryEdges, semanticUseEdges, revisionReach } from './revision-graph.mjs';

export const oppositionBindingPath = 'reasoning/opposition-bindings.json';
export const baseLiteral = (literal) => literal.startsWith('-') ? literal.slice(1) : literal;
export const literalText = (literal, statements) => {
	const text = statements.get(baseLiteral(literal)).data.statement;
	return literal.startsWith('-') ? `It is not the case that: ${text}` : text;
};
export const oppositionHref = (id) => `/model/alternatives/#${id.toLowerCase()}`;
const exact = (value, keys) => {
	if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join() !== [...keys].sort().join()) throw new Error(`Expected fields: ${keys.join(', ')}`);
};
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Content/admission validation only. Acceptance is computed by the full Python theory. */
export function resolveFormalOpposition({ workingStatements, workingArguments, alternatives, alternativeArguments, bindings, workingPremises }) {
	exact(bindings, ['schemaVersion', 'signature', 'statements', 'applications', 'ordinaryPremises', 'undercutters']);
	if (bindings.schemaVersion !== 1 || typeof bindings.signature !== 'string') throw new Error('Unsupported opposition bindings');
	const statements = new Map();
	const argumentsById = new Map();
	for (const [entries, index, pattern] of [[ [...workingStatements, ...alternatives], statements, /^S-\d{3}$/ ], [ [...workingArguments, ...alternativeArguments], argumentsById, /^ARG-\d{3}$/ ]]) {
		const slugs = new Set();
		for (const entry of entries) {
			if (!pattern.test(entry.data.id) || index.has(entry.data.id) || slugs.has(entry.data.slug)) throw new Error(`Invalid or duplicate corpus identity: ${entry.data.id}`);
			index.set(entry.data.id, entry);
			slugs.add(entry.data.slug);
		}
	}
	const literalExists = (literal) => typeof literal === 'string' && /^-?S-\d{3}$/.test(literal) && statements.has(baseLiteral(literal));
	for (const [key, entries] of [['statements', alternatives], ['applications', alternativeArguments]]) {
		exact(bindings[key], entries.map(({ data }) => data.id));
	}
	for (const { data } of alternatives) {
		const binding = bindings.statements[data.id];
		exact(binding, ['text', 'formula', 'representation']);
		if (binding.text !== data.statement || !nonempty(binding.formula) || !['opaque-proposition', 'quantified-pilot'].includes(binding.representation)) throw new Error(`${data.id}: review alternative formal binding`);
	}
	for (const { data } of alternativeArguments) {
		const binding = bindings.applications[data.id];
		exact(binding, ['premises', 'conclusion', 'inferenceKind', 'scheme']);
		if (Object.keys(binding).some((key) => !same(binding[key], data[key]))) throw new Error(`${data.id}: review alternative formal application`);
	}
	for (const { data } of argumentsById.values()) {
		if (!Array.isArray(data.premises) || !data.premises.length || new Set(data.premises).size !== data.premises.length || data.premises.includes(data.conclusion) || ![...data.premises, data.conclusion].every(literalExists) || !['deductive', 'defeasible'].includes(data.inferenceKind) || !nonempty(data.scheme)) throw new Error(`Invalid argument: ${data.id}`);
	}
	for (const { data } of statements.values()) {
		const seen = new Set();
		for (const use of data.semanticUses ?? []) {
			if (!statements.has(use.id) || use.id === data.id || seen.has(use.id)) throw new Error(`Invalid semantic reference: ${data.id}`);
			seen.add(use.id);
		}
		for (const id of data.related ?? []) if (!statements.has(id) || id === data.id) throw new Error(`Invalid related statement: ${data.id}`);
	}
	if (!Array.isArray(workingPremises) || !Array.isArray(bindings.ordinaryPremises) || !Array.isArray(bindings.undercutters)) throw new Error('Admissions and undercutters must be arrays');
	const ordinaryPremises = [...workingPremises];
	for (const item of bindings.ordinaryPremises) {
		exact(item, ['literal', 'rationale']);
		if (!literalExists(item.literal) || !nonempty(item.rationale)) throw new Error('An admission needs an existing literal and rationale');
		ordinaryPremises.push(item.literal);
	}
	if (ordinaryPremises.some((id) => !literalExists(id)) || new Set(ordinaryPremises).size !== ordinaryPremises.length) throw new Error('Invalid or duplicate premise admission');
	const pairs = new Set();
	for (const item of bindings.undercutters) {
		exact(item, ['statement', 'rule', 'rationale']);
		const pair = JSON.stringify([item.statement, item.rule]);
		if (!literalExists(item.statement) || argumentsById.get(item.rule)?.data.inferenceKind !== 'defeasible' || !nonempty(item.rationale) || pairs.has(pair)) throw new Error('Undercutters need an existing literal, unique defeasible target and rationale');
		pairs.add(pair);
	}
	const theory = {
		statements: [...statements.keys()].map((id) => ({ id })),
		rules: [...argumentsById.values()].map(({ data }) => ({ id: data.id, premises: data.premises, conclusion: data.conclusion, kind: data.inferenceKind === 'deductive' ? 'strict' : 'defeasible' })),
		undercutters: bindings.undercutters.map(({ statement, rule }) => ({ statement, rule })),
	};
	const edges = [...theoryEdges(theory), ...semanticUseEdges([...statements.values()].map(({ data }) => data))];
	const alternativeIds = new Set([...alternatives, ...alternativeArguments].map(({ data }) => data.id));
	const contextFor = (target) => {
		// Include support, attackers and defenses influencing this target. The set
		// is conservative context, never an authored claim that a challenge succeeds.
		const upstream = revisionReach(edges.map(({ from, to, kind }) => ({ from: to, to: from, kind })), [target]);
		return {
			records: [...alternativeIds].filter((id) => upstream.has(id)),
			admissions: bindings.ordinaryPremises.filter(({ literal }) => upstream.has(literal)),
			undercutters: bindings.undercutters.filter(({ rule }) => upstream.has(rule)),
		};
	};
	const hasContent = alternatives.length + alternativeArguments.length + bindings.ordinaryPremises.length + bindings.undercutters.length > 0;
	return { statements, argumentsById, alternatives, alternativeArguments, alternativeIds, ordinaryPremises, admissions: bindings.ordinaryPremises, undercutters: bindings.undercutters, edges, theory, contextFor, hasContent };
}
