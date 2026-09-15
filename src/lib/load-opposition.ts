import { getCollection } from 'astro:content';
import bindings from '../../reasoning/opposition-bindings.json';
import workingBindings from '../../reasoning/model-bindings.json';
import { resolveFormalOpposition } from './formal-opposition.mjs';

export async function loadFormalOpposition() {
	const [workingStatements, workingArguments, alternatives, alternativeArguments] = await Promise.all([
		getCollection('statements'), getCollection('arguments'), getCollection('alternatives'), getCollection('alternativeArguments'),
	]);
	return resolveFormalOpposition({ workingStatements, workingArguments, alternatives, alternativeArguments, bindings, workingPremises: workingBindings.ordinaryPremises });
}
