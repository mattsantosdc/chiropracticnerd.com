import type { DependencyRole } from './dependencies.ts';

export const semanticIdentifierBase = 'https://chiropracticnerd.com/id';
export const dependencyRoleVocabularyBase =
	'https://chiropracticnerd.com/vocab/dependency-role';

export const statementIdPattern = /^S-\d{3}$/;
export const argumentIdPattern = /^ARG-\d{3}$/;

export function statementSemanticIdentifier(statementId: string) {
	return `${semanticIdentifierBase}/statement/${statementId}`;
}

export function dependencySemanticIdentifier(upstreamId: string, downstreamId: string) {
	return `${semanticIdentifierBase}/dependency/${upstreamId}--${downstreamId}`;
}

export function argumentSemanticIdentifier(argumentId: string) {
	return `${semanticIdentifierBase}/argument/${argumentId}`;
}

export function dependencyRoleSemanticIdentifier(role: DependencyRole) {
	return `${dependencyRoleVocabularyBase}/${role}`;
}
