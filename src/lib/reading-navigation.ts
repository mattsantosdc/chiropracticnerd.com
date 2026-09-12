import type { ReadingLocation, ResolvedReadingPath, ResolvedReadingStep, StatementAppearance } from './reading-path.ts';

export function readingSections(path: ResolvedReadingPath) {
	return [...path.main, ...(path.orientation ? [path.orientation] : []), ...path.supporting];
}

export function argumentStep(path: ResolvedReadingPath, id: string) {
	const step = readingSections(path).flatMap((section) => section.steps).find((step) => step.kind === 'argument' && step.id === id);
	if (!step) throw new Error(`Missing reading location for argument ${id}`);
	return step;
}

export function statementAppearance(path: ResolvedReadingPath, step: ResolvedReadingStep, id: string, role: StatementAppearance['role']) {
	const location = path.statementLocations.get(id)?.find((item) => item.role === role && item.placement === step.location.placement && item.sectionId === step.location.sectionId && item.stepIndex === step.location.stepIndex);
	if (!location) throw new Error(`Missing ${role} appearance for ${id} in ${step.id}`);
	return location;
}

export function readingHref(location: ReadingLocation, integrated = true) {
	return `${integrated ? '' : '/model/'}#${location.anchor}`;
}
