export const dependencyRoles = [
	'methodological',
	'normative',
	'conceptual',
	'empirical',
	'practical',
] as const;

export type DependencyRole = (typeof dependencyRoles)[number];

export type DependencyRoleDefinition = {
	definition: string;
	limit: string;
};

/**
 * A role describes why a downstream entry directly depends on an upstream
 * entry. It does not classify either entry or report confidence.
 */
export const dependencyRoleDefinitions: Record<DependencyRole, DependencyRoleDefinition> = {
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
};

export function isDependencyRole(value: unknown): value is DependencyRole {
	return dependencyRoles.includes(value as DependencyRole);
}
