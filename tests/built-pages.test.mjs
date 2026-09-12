import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'parse5';
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { buildReasoningIndex } from '../src/lib/reasoning.ts';
import { resolveReadingPath } from '../src/lib/reading-path.ts';
import { loadCanonicalContent } from './helpers/content.ts';
import { domainLabels, getRelatedStatements, sortStatements } from '../src/lib/statements.ts';

const { statements, argumentsList } = await loadCanonicalContent();
const config = JSON.parse(readFileSync('src/data/model-reading-path.json', 'utf8'));
const readingPath = resolveReadingPath(config, buildReasoningIndex(statements, argumentsList));
const markdown = await createSatteriMarkdownProcessor();
const byId = new Map(statements.map((entry) => [entry.data.id, entry]));
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const text = (node) => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const attr = (node, name) => node.attrs?.find((attribute) => attribute.name === name)?.value;
const nodes = (node) => [node, ...(node.childNodes ?? []).flatMap(nodes)];
const hasClass = (node, name) => attr(node, 'class')?.split(/\s+/).includes(name);
const statementHref = (entry) => `/model/${entry.data.slug}/`;
const argumentHref = (entry) => `/model/arguments/${entry.data.slug}/`;
const readPage = (href) => parse(readFileSync(join('dist', href, 'index.html'), 'utf8'));
const links = (page) => nodes(page).filter((node) => node.tagName === 'a').map((node) => attr(node, 'href'));

// Run after npm run build; exercising the output catches storage IDs being used as routes.
test('overview and all statement pages retain explicit routes, statements, order, and relationship links', () => {
	const overview = readPage('/model/');
	const main = nodes(overview).find((node) => hasClass(node, 'main-reading'));
	assert.deepEqual(nodes(main).filter((node) => attr(node, 'data-reading-step')).map((node) => attr(node, 'data-reading-step')), config.main.flatMap((section) => section.steps.map((step) => step.id)));
	assert.equal(attr(nodes(main).find((node) => attr(node, 'data-statement-id')), 'data-statement-id'), 'S-017');
	const catalog = nodes(overview).find((node) => attr(node, 'id') === 'model-reference');
	assert.deepEqual(links(catalog).filter((href) => statements.some((entry) => statementHref(entry) === href)), sortStatements(statements).map(statementHref));
	for (const entry of statements) {
		const page = readPage(statementHref(entry));
		assert.ok(links(overview).includes(statementHref(entry)));
		assert.equal(normalize(text(nodes(page).find((node) => node.tagName === 'h1'))), normalize(entry.data.statement));
		assert.ok(normalize(text(page)).includes(entry.data.id));
		assert.ok(normalize(text(page)).includes(normalize(entry.data.summary)));
		const metadata = text(nodes(page).find((node) => hasClass(node, 'statement-meta')));
		assert.ok(metadata.includes(domainLabels[entry.data.domain]));
		assert.ok(metadata.includes(`Confidence: ${entry.data.confidence === 'not-applicable' ? 'Not applicable' : entry.data.confidence}`));
		const neighbors = [
			...entry.data.upstream.map(({ id }) => byId.get(id)),
			...statements.filter((candidate) => candidate.data.upstream.some(({ id }) => id === entry.data.id)),
			...getRelatedStatements(statements, entry.data.id),
		];
		for (const neighbor of neighbors) assert.ok(links(page).includes(statementHref(neighbor)));
		for (const argument of argumentsList.filter((argument) => argument.data.conclusion === entry.data.id || argument.data.premises.includes(entry.data.id))) {
			assert.ok(links(page).includes(argumentHref(argument)));
		}
	}
});

test('argument pages render the exact referenced statements in premise and conclusion order', () => {
	const overview = readPage('/model/arguments/');
	for (const argument of argumentsList) {
		assert.ok(links(overview).includes(argumentHref(argument)));
		const page = readPage(argumentHref(argument));
		assert.equal(normalize(text(nodes(page).find((node) => node.tagName === 'h1'))), argument.data.title);
		const endpoints = [...argument.data.premises, argument.data.conclusion].map((id) => byId.get(id));
		assert.deepEqual(nodes(page).filter((node) => attr(node, 'data-role') === 'premise').map((node) => attr(node, 'data-statement-id')), argument.data.premises);
		for (const node of nodes(page).filter((node) => attr(node, 'data-statement-id'))) assert.equal(normalize(text(nodes(node).find((item) => hasClass(item, 'statement-text')))), normalize(byId.get(attr(node, 'data-statement-id')).data.statement));
		assert.equal(normalize(text(nodes(page).find((node) => attr(node, 'data-exact-conclusion')))), normalize(byId.get(argument.data.conclusion).data.statement));
		for (const entry of endpoints) assert.ok(links(page).includes(statementHref(entry)));
	}
});

test('every built internal page and fragment link resolves', () => {
	const htmlPaths = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? htmlPaths(path) : path.endsWith('.html') ? [path] : [];
	});
	for (const path of htmlPaths('dist')) {
		const page = parse(readFileSync(path, 'utf8'));
		const ids = nodes(page).map((node) => attr(node, 'id')).filter(Boolean);
		assert.equal(new Set(ids).size, ids.length, `${path}: duplicate HTML IDs`);
		for (const href of links(page)) {
			if (!href || !href.startsWith('/') && !href.startsWith('#') || href.startsWith('//')) continue;
			const [route, fragment] = href.split('#');
			const target = route ? join('dist', route, route.endsWith('/') ? 'index.html' : '') : path;
			assert.ok(existsSync(target), `${path}: missing ${href}`);
			if (fragment) {
				const destination = route ? parse(readFileSync(target, 'utf8')) : page;
				assert.ok(nodes(destination).some((node) => attr(node, 'id') === decodeURIComponent(fragment)), `${path}: missing fragment ${href}`);
			}
		}
	}
});

test('all walkthrough appearances and supporting material match the canonical records', async () => {
	const overview = readPage('/model/');
	for (const appearance of nodes(overview).filter((node) => attr(node, 'data-statement-id'))) {
		const entry = byId.get(attr(appearance, 'data-statement-id'));
		assert.equal(normalize(text(nodes(appearance).find((node) => hasClass(node, 'statement-text')))), normalize(entry.data.statement));
		const metadata = normalize(text(nodes(appearance).find((node) => hasClass(node, 'statement-meta'))));
		if (entry.data.confidence === 'not-applicable') assert.ok(!metadata.includes('Confidence:'));
		else assert.ok(metadata.includes(`Confidence: ${entry.data.confidence}`));
		assert.ok(!nodes(appearance).some((node) => node.tagName === 'span' && normalize(text(node)) === domainLabels[entry.data.domain]));
	}
	for (const entry of [...statements, ...argumentsList]) {
		const bodies = nodes(overview).filter((node) => attr(node, 'data-canonical-body') === entry.data.id);
		assert.equal(bodies.length, entry.data.id.startsWith('ARG') ? 1 : 0, `${entry.data.id} overview body placement`);
		const detail = readPage(entry.data.id.startsWith('ARG') ? argumentHref(entry) : statementHref(entry));
		const original = nodes(detail).find((node) => attr(node, 'data-canonical-body') === entry.data.id);
		const canonicalBody = parse((await markdown.render(entry.body)).code);
		assert.equal(normalize(text(original)), normalize(text(canonicalBody)), `${entry.data.id} canonical body differs`);
		for (const body of bodies) assert.equal(normalize(text(body)), normalize(text(original)), `${entry.data.id} body differs from canonical detail`);
		const material = entry.data.id.startsWith('ARG') ? overview : detail;
		assert.ok(normalize(text(material)).includes(normalize(entry.data.summary)), `${entry.data.id} summary`);
		if (entry.data.whatWouldChange) assert.ok(normalize(text(material)).includes(normalize(entry.data.whatWouldChange)), `${entry.data.id} revision condition`);
		for (const ref of entry.data.references ?? []) {
			assert.ok(links(material).includes(ref.url), `${entry.data.id} reference`);
			if (ref.note) assert.ok(normalize(text(material)).includes(normalize(ref.note)), `${entry.data.id} source limit`);
		}
	}
});

test('all participation remains available on detail pages and distinct from revision dependencies', () => {
	const overview = readPage('/model/');
	assert.equal(nodes(overview).filter((node) => attr(node, 'data-participation')).length, 0);
	for (const entry of statements) {
		const conclusionPages = argumentsList.filter((argument) => argument.data.conclusion === entry.data.id).map((argument) => readPage(argumentHref(argument)));
		for (const page of [readPage(statementHref(entry)), ...conclusionPages]) {
			const participation = nodes(page).filter((node) => attr(node, 'data-participation') === entry.data.id);
			assert.ok(participation.length);
			for (const block of participation) {
				const expected = argumentsList.filter((arg) => arg.data.conclusion === entry.data.id || arg.data.premises.includes(entry.data.id));
				const linked = new Set(links(block).filter((href) => href.includes('--argument-')).map((href) => href.match(/--argument-(arg-\d+)/)[1].toUpperCase()));
				assert.deepEqual([...linked].sort(), expected.map((arg) => arg.data.id).sort());
				for (const arg of expected) {
					assert.ok(text(block).includes(arg.data.conclusion));
					assert.ok(text(block).includes(arg.data.inferenceKind));
				}
			}
		}
	}
	const s17 = readPage(statementHref(byId.get('S-017')));
	assert.ok(nodes(s17).findIndex((node) => attr(node, 'data-participation') === 'S-017') < nodes(s17).findIndex((node) => attr(node, 'id') === 'entry-explanation'));
	assert.match(text(s17), /No revision dependencies are recorded on this statement/);
	assert.doesNotMatch(text(s17), /Root statement|No downstream statements yet|Used by/);
	const s7 = nodes(readPage(statementHref(byId.get('S-007')))).find((node) => attr(node, 'data-participation') === 'S-007');
	assert.match(text(s7), /No concluding argument is recorded/);
	for (const id of ['S-012', 'S-013']) {
		let parent = nodes(overview).find((node) => attr(node, 'data-statement-id') === id);
		while (parent && attr(parent, 'data-placement') !== 'supporting') parent = parent.parentNode;
		assert.ok(parent, `${id} supporting reading missing`);
	}
});

test('all argument premises, conclusions, kinds, schemes and premise origins resolve in the walkthrough', () => {
	const overview = readPage('/model/');
	for (const argument of argumentsList) {
		const step = nodes(overview).find((node) => attr(node, 'data-argument-id') === argument.data.id);
		assert.deepEqual(nodes(step).filter((node) => attr(node, 'data-role') === 'premise').map((node) => attr(node, 'data-statement-id')), argument.data.premises);
		assert.equal(normalize(text(nodes(step).find((node) => attr(node, 'data-exact-conclusion')))), normalize(byId.get(argument.data.conclusion).data.statement));
		assert.ok(text(step).includes(argument.data.inferenceKind));
		assert.ok(text(step).includes(argument.data.scheme));
		const disclosure = nodes(step).find((node) => hasClass(node, 'argument-reasoning'));
		assert.ok(nodes(disclosure).some((node) => hasClass(node, 'argument-identity')));
		assert.ok(nodes(disclosure).some((node) => hasClass(node, 'premise-references')));
		assert.ok(links(disclosure).includes(argumentHref(argument)));
	}
	const assessment = nodes(overview).find((node) => attr(node, 'data-argument-id') === 'ARG-002');
	const premise = nodes(assessment).find((node) => attr(node, 'data-role') === 'premise' && attr(node, 'data-statement-id') === 'S-027').parentNode;
	assert.ok(links(premise).includes('#reading-actual-input-effects--argument-arg-007--conclusion'));
});


test('every resolver appearance is mounted exactly once and comment threads retain their identities', () => {
	const overview = readPage('/model/');
	const ids = nodes(overview).map((node) => attr(node, 'id')).filter(Boolean);
	for (const section of [...readingPath.main, readingPath.orientation, ...readingPath.supporting].filter(Boolean)) {
		assert.equal(ids.filter((id) => id === section.anchor).length, 1);
		for (const step of section.steps) assert.equal(ids.filter((id) => id === step.location.anchor).length, 1);
	}
	for (const appearances of readingPath.statementLocations.values()) for (const appearance of appearances) assert.equal(ids.filter((id) => id === appearance.anchor).length, 1);
	for (const [page, expected] of [[overview, 'model-general'], ...statements.map((entry) => [readPage(statementHref(entry)), entry.data.id])]) {
		const widgets = nodes(page).filter((node) => node.tagName === 'div' && attr(node, 'id')?.startsWith('fastcomments-'));
		assert.ok(widgets.length <= 1);
		if (widgets.length) assert.equal(attr(widgets[0], 'id'), `fastcomments-${expected}`);
		assert.ok(nodes(page).some((node) => attr(node, 'id') === 'discussion'));
	}
});
