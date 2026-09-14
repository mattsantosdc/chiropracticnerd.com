// Renderer-neutral conservative revision influence, not argument acceptance.
const negative = (id) => id.startsWith('-') ? id.slice(1) : `-${id}`;

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

/** Semantic uses identify meaning/mechanism reconsideration only. */
export function semanticUseEdges(statements) {
 return statements.flatMap(({ id, semanticUses = [] }) => semanticUses.map((use) => ({ from: use.id, to: id, kind: `semantic-use:${use.role}` })));
}

/** Finite traversal includes attacks on attackers through the supplied graph. */
export function revisionReach(edges, seeds) {
 const found = new Set(seeds);
 const queue = [...seeds];
 const next = new Map();
 for (const edge of edges) {
  if (!next.has(edge.from)) next.set(edge.from, []);
  next.get(edge.from).push(edge.to);
 }
 for (let i = 0; i < queue.length; i++) {
  for (const id of next.get(queue[i]) ?? []) {
   if (!found.has(id)) { found.add(id); queue.push(id); }
  }
 }
 return found;
}
