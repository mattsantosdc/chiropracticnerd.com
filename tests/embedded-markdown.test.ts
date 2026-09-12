import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFragment } from 'parse5';
import { namespaceMarkdown } from '../src/lib/embedded-markdown.ts';

test('embedded Markdown namespaces headings, repeated local links, footnotes, and ID references structurally', () => {
	const html = '<h2 id="boundary">Boundary</h2><h3 id="boundary-1">Boundary again</h3><p><a href="#boundary">Local</a> <a href="/model/example/#boundary">Record</a> <a href="https://example.com/#boundary">Source</a></p><label for="note">Note</label><input id="note" aria-labelledby="boundary boundary-1"><a href="#note" aria-describedby="boundary">Footnote</a>';
	const result = namespaceMarkdown(html, 'reading-first');
	assert.match(result, /<h4 id="reading-first--boundary">Boundary<\/h4>/);
	assert.match(result, /href="#reading-first--boundary"/);
	assert.match(result, /href="\/model\/example\/#boundary"/);
	assert.match(result, /href="https:\/\/example.com\/#boundary"/);
	assert.match(result, /for="reading-first--note"/);
	assert.match(result, /aria-labelledby="reading-first--boundary reading-first--boundary-1"/);
	assert.match(result, /href="#reading-first--note" aria-describedby="reading-first--boundary"/);
	assert.notEqual(result, namespaceMarkdown(html, 'reading-second'));
	assert.ok(parseFragment(result));
	assert.throws(() => namespaceMarkdown('<p id="same"></p><p id="same"></p>', 'safe'), /Duplicate source/);
	assert.throws(() => namespaceMarkdown(html, 'unsafe"'), /Unsafe/);
});
