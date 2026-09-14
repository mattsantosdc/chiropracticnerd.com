export const semanticUseRoles = ['methodological', 'normative', 'conceptual', 'empirical', 'practical'] as const;
export type SemanticUseRole = (typeof semanticUseRoles)[number];
export type SemanticUseRoleDefinition = { definition: string; limit: string };

/** These local roles classify explicit uses, never ASPIC+ support or confidence. */
export const semanticUseRoleDefinitions: Record<SemanticUseRole, SemanticUseRoleDefinition> = {
 methodological: { definition: 'A rule used to frame, classify, evaluate or revise the statement.', limit: 'It supplies no subject-matter evidence.' },
 normative: { definition: 'A value or priority used to interpret a choice or evaluative claim.', limit: 'An inference justifying that choice needs its own argument.' },
 conceptual: { definition: 'A concept or definition required for the statement to retain its intended meaning.', limit: 'It does not establish existence or empirical adequacy.' },
 empirical: { definition: 'An empirical account or proposed mechanism used in the statement’s explanation.', limit: 'The reference neither admits an input premise nor establishes the empirical claim.' },
 practical: { definition: 'An account used to specify a strategy, intended procedure or prediction.', limit: 'It does not establish effectiveness, safety or an indication.' },
};
export function isSemanticUseRole(value: unknown): value is SemanticUseRole {
 return semanticUseRoles.includes(value as SemanticUseRole);
}
