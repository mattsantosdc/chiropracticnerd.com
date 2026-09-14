// Cross-runtime test adapter only. Canonical review inputs use buildSnapshot.
import { readFileSync } from 'node:fs';
import { deriveImpact, digest, theoryEdges } from '../../scripts/model-review-impact.mjs';
import { revisionReach } from '../../src/lib/revision-graph.mjs';
import { collectInputs } from '../../scripts/model-audit.mjs';

function snapshot(theory) {
	const subjects = Object.fromEntries(theory.statements.flatMap(({ id }) => [[id, id], [`-${id}`, `-${id}`]]));
	const units = {};
	for (const statement of theory.statements) {
		const id = statement.id;
		units[id] = { path: id, digest: digest({ statement, assumed: theory.ordinaryPremises.includes(id), negativeAssumed: theory.ordinaryPremises.includes(`-${id}`) }), targets: [id], propagate: true };
	}
	for (const rule of theory.rules) units[rule.id] = { path: rule.id, digest: digest(rule), targets: [rule.id], propagate: true };
	return { version: 1, subjects, units, edges: theoryEdges(theory) };
}

const { cases, canonical } = JSON.parse(readFileSync(0, 'utf8'));
const actual = collectInputs(process.cwd()).snapshot.edges;
const missingCanonicalEdges = theoryEdges(canonical).filter((edge) => !actual.some((candidate) => candidate.from === edge.from && candidate.to === edge.to && candidate.kind === edge.kind));
console.log(JSON.stringify({ impacts: cases.map(([before, after]) => Object.keys(deriveImpact(snapshot(before), snapshot(after)).reasons)), missingCanonicalEdges, canonicalReach: Object.fromEntries(canonical.statements.map(({id}) => [id, [...revisionReach(theoryEdges(canonical), [id])].sort()])) }));
