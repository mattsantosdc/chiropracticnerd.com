import { readdirSync } from 'node:fs';
import { root } from 'astro:config/server';
import { getCollection } from 'astro:content';
import bindings from '../../reasoning/opposition-bindings.json';
import workingBindings from '../../reasoning/model-bindings.json';
import { resolveFormalOpposition } from './formal-opposition.mjs';

const alternativeDirectories = {
	alternatives: 'src/content/model/alternatives/',
	alternativeArguments: 'src/content/model/alternative-arguments/',
} as const;

async function loadAlternativeCollection(collection: keyof typeof alternativeDirectories) {
	// These pages are rendered during the static build or development. Check the
	// actual corpus, not its bindings, so an unbound record cannot be hidden.
	const files = readdirSync(new URL(alternativeDirectories[collection], root), { recursive: true, withFileTypes: true });
	if (!files.some((file) => file.isFile() && /\.mdx?$/.test(file.name))) return [];
	const entries = await getCollection(collection);
	if (!entries.length) throw new Error(`Canonical ${collection} Markdown exists but no entries were loaded.`);
	return entries;
}

export async function loadFormalOpposition() {
	const [workingStatements, workingArguments, alternatives, alternativeArguments] = await Promise.all([
		getCollection('statements'), getCollection('arguments'), loadAlternativeCollection('alternatives'), loadAlternativeCollection('alternativeArguments'),
	]);
	return resolveFormalOpposition({ workingStatements, workingArguments, alternatives, alternativeArguments, bindings, workingPremises: workingBindings.ordinaryPremises });
}
