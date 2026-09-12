import { z } from 'astro/zod';
import { argumentIdPattern, statementIdPattern } from './identifiers.ts';
import type { ReasoningIndex, ResolvedArgument, ResolvedStatement } from './reasoning.ts';

const requiredText = z.string().trim().min(1, 'Required text must not be blank.');
const stepSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('statement'), id: z.string().regex(statementIdPattern, 'Expected a statement ID (S-###).') }).strict(),
	z.object({ kind: z.literal('argument'), id: z.string().regex(argumentIdPattern, 'Expected an argument ID (ARG-###).') }).strict(),
]);
const sectionSchema = z.object({
	id: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, 'Expected a local section identifier in lowercase kebab case.'),
	title: requiredText,
	introduction: requiredText.optional(),
	steps: z.array(stepSchema).min(1, 'A reading section must contain steps.'),
}).strict();

export const readingPathSchema = z.object({
	version: z.literal('0.1'),
	orientation: sectionSchema.optional(),
	main: z.array(sectionSchema).min(1, 'The main reading path must contain sections.'),
	supporting: z.array(sectionSchema),
}).strict();

export type ReadingPathConfig = z.infer<typeof readingPathSchema>;
export type ReadingSection = z.infer<typeof sectionSchema>;
export type ReadingStep = z.infer<typeof stepSchema>;
export type ReadingPlacement = 'main' | 'orientation' | 'supporting';
export type ReadingLocation = {
	placement: ReadingPlacement;
	sectionId: string;
	/** Zero-based authored step position; not canonical identity. */
	stepIndex: number;
	anchor: string;
};
export type StatementAppearance = ReadingLocation & {
	role: 'statement' | 'conclusion' | 'premise';
};
export type ResolvedReadingStep =
	| { kind: 'statement'; id: string; location: ReadingLocation; statement: ResolvedStatement }
	| { kind: 'argument'; id: string; location: ReadingLocation; argument: ResolvedArgument };
export type ResolvedReadingSection = Omit<ReadingSection, 'steps'> & {
	placement: ReadingPlacement;
	anchor: string;
	steps: ResolvedReadingStep[];
};
export type ReadingDiagnostic = {
	code: 'premise-not-introduced';
	argumentId: string;
	premiseId: string;
	location: ReadingLocation;
	primaryLocation: StatementAppearance;
	message: string;
};
export type ResolvedReadingPath = {
	version: string;
	orientation?: ResolvedReadingSection;
	main: ResolvedReadingSection[];
	supporting: ResolvedReadingSection[];
	primaryStatementLocations: ReadonlyMap<string, StatementAppearance>;
	statementLocations: ReadonlyMap<string, readonly StatementAppearance[]>;
	diagnostics: ReadingDiagnostic[];
};

function locationLabel(location: ReadingLocation) {
	return `${location.placement} section "${location.sectionId}" step ${location.stepIndex + 1}`;
}

/** Add author-facing section and reference context to strict schema errors. */
export function parseReadingPath(input: unknown): ReadingPathConfig {
	const parsed = readingPathSchema.safeParse(input);
	if (parsed.success) return parsed.data;
	const messages = parsed.error.issues.map((issue) => {
		let value: unknown = input;
		const context: string[] = [];
		for (const key of issue.path) {
			if (value && typeof value === 'object' && !Array.isArray(value) && 'id' in value) {
				context.push(`id ${JSON.stringify(value.id)}`);
			}
			value = value && typeof value === 'object' ? (value as Record<PropertyKey, unknown>)[key] : undefined;
		}
		if (value && typeof value === 'object' && !Array.isArray(value) && 'id' in value) {
			context.push(`id ${JSON.stringify(value.id)}`);
		}
		return `${issue.path.join('.') || 'configuration'} (${context.join(', ') || 'reading path'}): ${issue.message}`;
	});
	throw new Error(`Invalid Model reading path:\n${messages.join('\n')}`);
}

/** Resolve editorial placement only; inference comes exclusively from the complete index. */
export function resolveReadingPath(input: unknown, index: ReasoningIndex): ResolvedReadingPath {
	const config = parseReadingPath(input);
	for (const { entry } of [...index.statementsById.values(), ...index.argumentsById.values()]) {
		if (entry.data.version !== config.version) {
			throw new Error(`Model reading path version ${config.version} does not match ${entry.data.id} version ${entry.data.version}.`);
		}
	}
	const sectionIds = new Set<string>();
	const explicitSteps = new Map<string, ReadingLocation>();
	const primaryStatementLocations = new Map<string, StatementAppearance>();
	const statementLocations = new Map<string, StatementAppearance[]>();
	const addAppearance = (id: string, location: ReadingLocation, role: StatementAppearance['role']) => {
		const appearance = { ...location, role };
		const locations = statementLocations.get(id) ?? [];
		locations.push(appearance);
		statementLocations.set(id, locations);
		if (role === 'premise') return;
		const primary = primaryStatementLocations.get(id);
		if (primary && (role === 'statement' || primary.role === 'statement')) {
			throw new Error(`${locationLabel(location)} (${id}): duplicate primary placement; already introduced at ${locationLabel(primary)}. Use argument conclusions without repeating a statement step.`);
		}
		if (!primary) primaryStatementLocations.set(id, appearance);
	};
	const resolveSection = (section: ReadingSection, placement: ReadingPlacement): ResolvedReadingSection => {
		if (sectionIds.has(section.id)) throw new Error(`${placement} section "${section.id}": duplicate section identifier.`);
		sectionIds.add(section.id);
		const anchor = `reading-${section.id}`;
		const steps = section.steps.map((step, stepIndex): ResolvedReadingStep => {
			const location = { placement, sectionId: section.id, stepIndex, anchor: `${anchor}--${step.kind}-${step.id.toLowerCase()}` };
			const previous = explicitSteps.get(step.id);
			if (previous) throw new Error(`${locationLabel(location)} (${step.id}): duplicate explicit step; already at ${locationLabel(previous)}.`);
			explicitSteps.set(step.id, location);
			if (step.kind === 'statement') {
				const statement = index.statementsById.get(step.id);
				if (!statement) throw new Error(`${locationLabel(location)}: missing statement ${step.id}.`);
				addAppearance(step.id, location, 'statement');
				return { ...step, location, statement };
			}
			const argument = index.argumentsById.get(step.id);
			if (!argument) throw new Error(`${locationLabel(location)}: missing argument ${step.id}.`);
			for (const premise of argument.premises) {
				addAppearance(premise.entry.data.id, { ...location, anchor: `${location.anchor}--premise-${premise.entry.data.id.toLowerCase()}` }, 'premise');
			}
			addAppearance(argument.conclusion.entry.data.id, { ...location, anchor: `${location.anchor}--conclusion` }, 'conclusion');
			return { ...step, location, argument };
		});
		return { ...section, placement, anchor, steps };
	};
	// Primary-location precedence is main, optional orientation, then supporting sections.
	const main = config.main.map((section) => resolveSection(section, 'main'));
	const orientation = config.orientation ? resolveSection(config.orientation, 'orientation') : undefined;
	const supporting = config.supporting.map((section) => resolveSection(section, 'supporting'));
	const unplaced = [
		...[...index.statementsById.keys()].filter((id) => !primaryStatementLocations.has(id)),
		...[...index.argumentsById.keys()].filter((id) => !explicitSteps.has(id)),
	];
	if (unplaced.length) throw new Error(`Unplaced Model records: ${unplaced.join(', ')}. Add intentional steps in main, orientation, or supporting reading; premise appearances alone do not count.`);

	const diagnostics: ReadingDiagnostic[] = [];
	const inspectIntroductions = (sections: ResolvedReadingSection[], initial: ReadonlySet<string> = new Set()) => {
		const introduced = new Set(initial);
		for (const section of sections) {
			for (const step of section.steps) {
				if (step.kind === 'statement') {
					introduced.add(step.id);
					continue;
				}
				for (const premise of step.argument.premises) {
					const premiseId = premise.entry.data.id;
					if (introduced.has(premiseId)) continue;
					const primaryLocation = primaryStatementLocations.get(premiseId)!;
					diagnostics.push({
						code: 'premise-not-introduced', argumentId: step.id, premiseId,
						location: step.location, primaryLocation,
						message: `${locationLabel(step.location)} (${step.id}): premise ${premiseId} has not been introduced on this route; primary location is ${locationLabel(primaryLocation)}. This is a reading diagnostic, not a logical error.`,
					});
				}
				introduced.add(step.argument.conclusion.entry.data.id);
			}
		}
		return introduced;
	};
	const mainIntroductions = inspectIntroductions(main);
	if (orientation) inspectIntroductions([orientation]);
	for (const section of supporting) inspectIntroductions([section], mainIntroductions);
	return { version: config.version, orientation, main, supporting, primaryStatementLocations, statementLocations, diagnostics };
}
