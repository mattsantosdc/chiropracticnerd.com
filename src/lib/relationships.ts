export const relationshipTypes = [
	'methodological',
	'normative',
	'conceptual',
	'empirical',
	'practical',
	'logical',
] as const;

export type RelationshipType = (typeof relationshipTypes)[number];

export type RelationshipDefinition = {
	definition: string;
	limit: string;
};

/**
 * These definitions describe the role an upstream entry plays in a downstream
 * entry. They do not classify either entry and they do not report confidence.
 */
export const relationshipDefinitions: Record<RelationshipType, RelationshipDefinition> = {
	methodological: {
		definition:
			'The upstream entry sets a rule for how the downstream entry is framed, classified, evaluated, or revised.',
		limit: "It does not support the downstream claim's subject matter.",
	},
	normative: {
		definition:
			'The upstream entry supplies a value, purpose, or priority that justifies a downstream choice.',
		limit: 'It neither entails nor empirically verifies that choice.',
	},
	conceptual: {
		definition:
			'The downstream entry requires a concept or definition supplied by the upstream entry to retain its intended meaning.',
		limit: 'It does not establish that the concept exists or is empirically adequate.',
	},
	empirical: {
		definition:
			"The upstream entry supplies a testable premise, observed relationship, or proposed mechanism needed by the downstream entry's empirical content.",
		limit: 'It records a dependency, not evidential strength or proof.',
	},
	practical: {
		definition:
			'The downstream entry translates the upstream entry into a decision, procedure, or action.',
		limit: 'It does not establish effectiveness, safety, or appropriateness.',
	},
	logical: {
		definition:
			'The upstream entry is one stated premise in an explicit deductive or analytic inference.',
		limit:
			'Entailment belongs to the complete premise set and stated rule; validity does not establish that the premises are true.',
	},
};
