import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'parse5';
import { loadCanonicalContent } from './helpers/content.ts';
import { getRelatedStatements, sortStatements } from '../src/lib/statements.ts';

const { statements, argumentsList } = await loadCanonicalContent();
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
	assert.deepEqual(nodes(overview).filter((node) => node.tagName === 'h3' && hasClass(node, 'statement-text')).map((node) => normalize(text(node))), sortStatements(statements).map((entry) => normalize(entry.data.statement)));
	for (const entry of statements) {
		const page = readPage(statementHref(entry));
		assert.ok(links(overview).includes(statementHref(entry)));
		assert.equal(normalize(text(nodes(page).find((node) => node.tagName === 'h1'))), normalize(entry.data.statement));
		assert.ok(normalize(text(page)).includes(entry.data.id));
		assert.ok(normalize(text(page)).includes(normalize(entry.data.summary)));
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
		assert.deepEqual(nodes(page).filter((node) => hasClass(node, 'statement-text')).map((node) => normalize(text(node))), endpoints.map((entry) => normalize(entry.data.statement)));
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
