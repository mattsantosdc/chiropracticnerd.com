import { createHash } from 'node:crypto';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';

// Review metadata only. This graph does not admit premises or evaluate arguments.
export const impactVersion = 1;
export const fullReviewIntervalDays = 90;
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical);
	if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
	return value;
}
export const serialize = (value) => JSON.stringify(canonical(value));
export const digest = (value) => createHash('sha256').update(serialize(value)).digest('hex');
const negative = (id) => id.startsWith('-') ? id.slice(1) : `-${id}`;
const unique = (values) => [...new Set(values)].sort();
const edgeKey = (edge) => serialize(edge);
const compareEdges = (a, b) => edgeKey(a) < edgeKey(b) ? -1 : edgeKey(a) > edgeKey(b) ? 1 : 0;

/** Conservative influence under the supported profile, including strict transpositions.
 * Contradiction links are bidirectional; undercuts are directed. Walking these links
 * follows defenses and reinstatement without asserting that any attack succeeds.
 */
export function theoryEdges(theory) {
	const edges = [];
	const add = (from, to, kind) => edges.push({ from, to, kind });
	for (const { id } of theory.statements) {
		add(id, negative(id), 'contradiction');
		add(negative(id), id, 'contradiction');
	}
	for (const rule of theory.rules) {
		if (!['strict', 'defeasible'].includes(rule.kind)) throw new Error(`Unknown inference kind: ${rule.id}`);
		for (const premise of rule.premises) add(premise, rule.id, 'premise');
		add(rule.id, rule.conclusion, 'conclusion');
		// Reviewing a changed conclusion also requires inspecting every argument for it.
		add(rule.conclusion, rule.id, 'conclusion-use');
		if (rule.kind === 'strict') {
			for (const premise of rule.premises) {
				const transposition = `transposition:${rule.id}:${premise}`;
				add(rule.id, transposition, 'strict-rule');
				add(negative(rule.conclusion), transposition, 'transposed-premise');
				for (const other of rule.premises) if (other !== premise) add(other, transposition, 'transposed-premise');
				add(transposition, negative(premise), 'transposed-conclusion');
			}
		}
	}
	for (const attack of theory.undercutters) add(attack.statement, attack.rule, 'undercut');
	return edges;
}

const bindingPath = 'reasoning/model-bindings.json';
const questionPath = 'src/data/model-questions.json';
const readingPath = 'src/data/model-reading-path.json';
const migrationPath = 'reasoning/dependency-migration.json';
const exactKeys = (value, keys, label) => {
	if (!isObject(value) || serialize(Object.keys(value).sort()) !== serialize([...keys].sort())) {
		throw new Error(`${label}: unsupported shape; update the review impact adapter explicitly`);
	}
};

export function buildSnapshot(sources, subjects) {
	const records = {};
	const units = {};
	const edges = [];
	const routed = new Set(subjects);
	const addUnit = (key, path, value, targets, propagate = true) => {
		if (Object.hasOwn(units, key)) throw new Error(`Duplicate review unit: ${key}`);
		units[key] = { path, digest: digest(value), targets: targets === null ? null : unique(targets), propagate };
	};
	const targetExists = (id) => {
		if (!Object.hasOwn(records, id)) throw new Error(`Review impact: missing canonical target ${id}`);
	};
	for (const path of subjects) {
		const { frontmatter: data, content } = parseFrontmatter(sources[path]);
		const pattern = path.includes('/statements/') ? /^S-\d{3}$/ : /^ARG-\d{3}$/;
		if (!pattern.test(data.id) || Object.hasOwn(records, data.id)) throw new Error(`Review impact: invalid or duplicate ID in ${path}`);
		records[data.id] = { path, data };
		const meaning = { ...data };
		for (const field of ['updated', 'version', 'order', 'slug']) delete meaning[field];
		addUnit(`${path}#meaning`, path, { data: meaning, content }, [data.id]);
		// Exact local review still covers metadata, YAML comments and formatting.
		addUnit(`${path}#file`, path, sources[path], [data.id], false);
	}
	const argumentsList = Object.values(records).filter(({ data }) => data.id.startsWith('ARG-'));
	for (const { path, data } of Object.values(records)) {
		if (data.id.startsWith('ARG-')) {
			if (!Array.isArray(data.premises) || !data.premises.length || typeof data.conclusion !== 'string') throw new Error(`Invalid argument endpoints: ${data.id}`);
			for (const id of [...data.premises, data.conclusion]) targetExists(id);
			const participants = [data.id, ...data.premises, data.conclusion];
			const { updated, version, ...participation } = data;
			addUnit(`${path}#participation`, path, participation, participants, false);
		} else {
			addUnit(`${path}#dependency-display`, path, data.upstream ?? [], [data.id, ...(data.upstream ?? []).map((dependency) => dependency.id)], false);
			for (const dependency of data.upstream ?? []) {
				targetExists(dependency.id);
				edges.push({ from: dependency.id, to: data.id, kind: `semantic-use:${dependency.role}` });
			}
			const readers = [data.id];
			for (const related of data.related ?? []) { targetExists(related); readers.push(related); }
			for (const other of Object.values(records)) {
				if ((other.data.related ?? []).includes(data.id) || (other.data.upstream ?? []).some((d) => d.id === data.id)) readers.push(other.data.id);
			}
			for (const argument of argumentsList) {
				if (argument.data.premises.includes(data.id) || argument.data.conclusion === data.id) readers.push(argument.data.id);
			}
			addUnit(`${path}#presentation`, path, { slug: data.slug, title: data.title, order: data.order, related: data.related, meaning: units[`${path}#meaning`].digest }, readers, false);
		}
	}

	// This mirrors the current binding loader's supported configuration. An extension
	// must update both adapters, never silently omit newly admitted attack data.
	const bindings = JSON.parse(sources[bindingPath]);
	exactKeys(bindings, ['schemaVersion', 'signature', 'ordinaryPremises', 'statements', 'applications'], bindingPath);
	if (bindings.schemaVersion !== 1 || !Array.isArray(bindings.ordinaryPremises)) throw new Error('Unsupported formal bindings');
	routed.add(bindingPath);
	addUnit(`${bindingPath}#language`, bindingPath, { schemaVersion: bindings.schemaVersion, signature: bindings.signature }, null);
	for (const [id, binding] of Object.entries(bindings.statements)) {
		targetExists(id);
		exactKeys(binding, ['text', 'formula', 'representation'], `${bindingPath}:${id}`);
		addUnit(`${bindingPath}#${id}`, bindingPath, { ...binding, assumed: bindings.ordinaryPremises.includes(id), negativeAssumed: bindings.ordinaryPremises.includes(negative(id)) }, [id]);
	}
	for (const [id, binding] of Object.entries(bindings.applications)) {
		targetExists(id);
		exactKeys(binding, ['premises', 'conclusion', 'inferenceKind', 'scheme'], `${bindingPath}:${id}`);
		addUnit(`${bindingPath}#${id}`, bindingPath, binding, [id]);
		for (const endpoint of [...binding.premises, binding.conclusion]) targetExists(endpoint);
	}
	for (const id of bindings.ordinaryPremises) targetExists(id.startsWith('-') ? negative(id) : id);
	const theory = {
		statements: Object.keys(records).filter((id) => id.startsWith('S-')).map((id) => ({ id })),
		rules: argumentsList.map(({ data }) => ({ ...data, kind: data.inferenceKind === 'deductive' ? 'strict' : data.inferenceKind })),
		undercutters: [],
	};
	edges.push(...theoryEdges(theory));
	// Include temporarily divergent formal endpoints too. Evaluation independently
	// rejects binding drift; neither graph alone may conceal its review consequences.
	edges.push(...theoryEdges({ ...theory, rules: Object.entries(bindings.applications).map(([id, data]) => ({ id, ...data, kind: data.inferenceKind === 'deductive' ? 'strict' : data.inferenceKind })) }));

	const questions = JSON.parse(sources[questionPath]);
	if (!Array.isArray(questions)) throw new Error('Questions must be an array');
	routed.add(questionPath);
	for (const question of questions) {
		targetExists(question.target);
		addUnit(`${questionPath}#${question.id}`, questionPath, question, [question.target], false);
	}
	const reading = JSON.parse(sources[readingPath]);
	exactKeys(reading, ['version', 'orientation', 'main', 'supporting'], readingPath);
	routed.add(readingPath);
	addUnit(`${readingPath}#version`, readingPath, reading.version, null, false);
	for (const [lane, sections] of [['orientation', [reading.orientation]], ['main', reading.main], ['supporting', reading.supporting]]) {
		if (!Array.isArray(sections)) throw new Error('Reading sections must be arrays');
		for (const [index, section] of sections.entries()) {
			const targets = section.steps.flatMap(({ id }) => {
				targetExists(id);
				const data = records[id].data;
				return id.startsWith('ARG-') ? [id, ...data.premises, data.conclusion] : [id];
			});
			addUnit(`${readingPath}#${lane}:${section.id}`, readingPath, { section, index, previous: sections[index - 1]?.id ?? null, next: sections[index + 1]?.id ?? null }, targets, false);
		}
	}
	const migration = JSON.parse(sources[migrationPath]);
	exactKeys(migration, ['schemaVersion', 'sourceBranch', 'sourceCommit', 'relationships'], migrationPath);
	if (migration.schemaVersion !== 2 || !Array.isArray(migration.relationships)) throw new Error('Unsupported dependency migration');
	routed.add(migrationPath);
	addUnit(`${migrationPath}#source`, migrationPath, { schemaVersion: migration.schemaVersion, sourceBranch: migration.sourceBranch, sourceCommit: migration.sourceCommit }, [], false);
	for (const relation of migration.relationships) {
		// Retired identities can legitimately outlive deleted canonical statements.
		const targets = [relation.source, relation.target].filter((id) => Object.hasOwn(records, id));
		addUnit(`${migrationPath}#${relation.source}:${relation.target}`, migrationPath, relation, targets, false);
	}
	for (const [path, source] of Object.entries(sources)) {
		if (!routed.has(path)) addUnit(path, path, source, null);
	}
	return canonical({ version: impactVersion, subjects: Object.fromEntries(Object.entries(records).map(([id, { path }]) => [id, path])), units, edges: [...new Map(edges.map((edge) => [edgeKey(edge), edge])).values()].sort(compareEdges) });
}

export function ancestors(snapshot, id) {
	const found = new Set([id]);
	let size;
	do {
		size = found.size;
		for (const { from, to } of snapshot.edges) if (found.has(to)) found.add(from);
	} while (size !== found.size);
	return found;
}

/** Flat, nonrecursive basis: cycles terminate and no review hashes itself. */
export function reviewBasis(snapshot, id) {
	const upstream = ancestors(snapshot, id);
	const units = Object.fromEntries(Object.entries(snapshot.units).filter(([, unit]) => unit.targets === null || unit.targets.some((target) => unit.propagate ? upstream.has(target) : target === id)));
	const edges = snapshot.edges.filter(({ to }) => upstream.has(to));
	return digest({ version: snapshot.version, id, path: snapshot.subjects[id], units, edges });
}

/** Returns shortest explanatory routes per changed unit using old AND new links. */
export function deriveImpact(before, after) {
	const reasons = {};
	const old = before ?? { units: {}, subjects: {}, edges: [] };
	const changed = unique([...Object.keys(old.units), ...Object.keys(after.units)]).filter((key) => serialize(old.units[key]) !== serialize(after.units[key]));
	const edges = new Map();
	for (const [origin, snapshot] of [['previous', old], ['current', after]]) {
		for (const edge of snapshot.edges) {
			const key = edgeKey(edge);
			if (!edges.has(key)) edges.set(key, { ...edge, graphs: [] });
			edges.get(key).graphs.push(origin);
		}
	}
	const changes = changed.map((key) => ({ key, prior: old.units[key], current: after.units[key] }));
	for (const edge of edges.values()) {
		if (edge.graphs.length === 2) continue;
		const key = `relationship:${edge.from}:${edge.kind}:${edge.to}`;
		const unit = { path: after.subjects[edge.from] ?? old.subjects[edge.from] ?? 'derived relationship', targets: [edge.to], propagate: true };
		changes.push({ key, prior: edge.graphs.includes('previous') ? unit : undefined, current: edge.graphs.includes('current') ? unit : undefined });
	}
	for (const { key, prior, current } of changes) {
		const units = [prior, current].filter(Boolean);
		const global = units.some((unit) => unit.targets === null);
		const targets = global ? Object.keys(after.subjects) : unique(units.flatMap((unit) => unit.targets));
		const queue = targets.map((target) => ({ target, via: [] }));
		const visited = new Set();
		for (let i = 0; i < queue.length; i++) {
			const { target, via } = queue[i];
			if (visited.has(target)) continue;
			visited.add(target);
			if (after.subjects[target]) (reasons[target] ??= []).push({ input: current?.path ?? prior.path, unit: key, change: !prior ? 'added' : !current ? 'removed' : 'changed', global, via });
			if (!global && units.some((unit) => unit.propagate)) {
				for (const edge of edges.values()) if (edge.from === target) queue.push({ target: edge.to, via: [...via, edge] });
			}
		}
	}
	return { changedUnits: changed, reasons };
}
