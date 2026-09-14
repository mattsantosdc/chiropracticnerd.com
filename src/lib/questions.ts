export type CriticalQuestion = {
	id: string;
	target: string;
	kind: 'premise' | 'inference' | 'scope' | 'practical-bridge';
	question: string;
	concern: string;
	response: string;
	wouldChange: string;
};

/** Questions are editorial challenges, not automatically asserted counterpremises. */
export function validateQuestions(
	input: unknown,
	statementIds: ReadonlySet<string>,
	argumentIds: ReadonlySet<string>,
): CriticalQuestion[] {
	if (!Array.isArray(input)) throw new Error('Model questions must be an array');
	const fields = ['id', 'target', 'kind', 'question', 'concern', 'response', 'wouldChange'];
	const seen = new Set<string>();
	for (const value of input) {
		if (!value || typeof value !== 'object' || Array.isArray(value) ||
			Object.keys(value).some((key) => !fields.includes(key)) ||
			fields.some((key) => typeof value[key] !== 'string' || !value[key].trim())) {
			throw new Error('Each question requires exactly its identity, target, kind, question, concern, response and revision consequence');
		}
		if (!/^Q-\d{3}$/.test(value.id) || seen.has(value.id)) throw new Error(`Invalid or duplicate question ID: ${value.id}`);
		if (!statementIds.has(value.target) && !argumentIds.has(value.target)) throw new Error(`${value.id} targets an unknown record`);
		if (!['premise', 'inference', 'scope', 'practical-bridge'].includes(value.kind)) throw new Error(`${value.id} has an unknown challenge kind`);
		if (value.kind === 'premise' && !statementIds.has(value.target)) throw new Error(`${value.id} premise challenge must target a statement`);
		if (['inference', 'practical-bridge'].includes(value.kind) && !argumentIds.has(value.target)) throw new Error(`${value.id} inference challenge must target an argument`);
		seen.add(value.id);
	}
	return input as CriticalQuestion[];
}
