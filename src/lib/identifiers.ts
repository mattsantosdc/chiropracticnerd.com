import type { DependencyRole } from './dependencies.ts';

export const semanticIdentifierBase = 'https://chiropracticnerd.com/id';
export const dependencyRoleVocabularyBase =
	'https://chiropracticnerd.com/vocab/dependency-role';

export const modelIdPattern = /^M-\d{3}$/;
export const argumentIdPattern = /^ARG-\d{3}$/;

export function modelSemanticIdentifier(modelId: string) {
	return `${semanticIdentifierBase}/model/${modelId}`;
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
