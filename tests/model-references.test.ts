import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildModelReferences, linkModelReferences, modelReference } from '../src/lib/model-references.ts';
import { namespaceMarkdown } from '../src/lib/embedded-markdown.ts';

const references = buildModelReferences([
 { data: { id: 'S-017', slug: 'science/organismic-organization', title: 'Living organisms & their organization' } },
 { data: { id: 'ARG-005', slug: 'regulatory-rationale', title: 'Regulation and potential' } },
 { data: { id: 'S-101', slug: 'alternative', title: 'A recorded alternative' } },
], new Set(['S-101']));

test('prose references resolve full-corpus titles and routes, with explicit negation', () => {
 const result = linkModelReferences(`<p>S-017's scope; ARG-005; -S-017; S-101.</p>`, references);
 assert.equal(result, `<p><a href="/model/science/organismic-organization/" title="S-017" data-model-reference="S-017">“Living organisms &amp; their organization”</a>'s scope; <a href="/model/arguments/regulatory-rationale/" title="ARG-005" data-model-reference="ARG-005">“Regulation and potential”</a>; <a href="/model/science/organismic-organization/" title="-S-017" data-model-reference="-S-017">Negation of “Living organisms &amp; their organization”</a>; <a href="/model/alternatives/#s-101" title="S-101" data-model-reference="S-101">“A recorded alternative”</a>.</p>`);
 assert.equal(modelReference('-S-101', references).label, 'Negation of “A recorded alternative”');
 assert.throws(() => linkModelReferences('S-999', references), /Unknown Model prose reference/);
 assert.equal(linkModelReferences('S-0170 XS-017 S-017-extra /S-017', references), 'S-0170 XS-017 S-017-extra /S-017');
});

test('authored links, quotations, code and attributes remain intact without nested links', () => {
 const html = `<p id="S-017"><a href="/model/science/organismic-organization/">the account in S-017</a><a href="https://example.com/S-017">S-017</a><code>S-017</code><q>S-017</q></p><blockquote>S-017</blockquote><pre>S-017</pre>`;
 assert.equal(linkModelReferences(html, references), html);
 assert.equal(linkModelReferences('<a href="/model/science/organismic-organization/">S-017</a>', references), '<a href="/model/science/organismic-organization/">“Living organisms &amp; their organization”</a>');
});

test('linking preserves embedded fragments and escapes record titles as text', () => {
 const html = namespaceMarkdown('<h2 id="scope">Scope</h2><p><a href="#scope">See scope</a>: S-017</p>', 'answer-body');
 const result = linkModelReferences(html, references);
 assert.ok(result.includes('<h4 id="answer-body--scope">'));
 assert.ok(result.includes('href="#answer-body--scope"'));
 assert.ok(result.includes('href="/model/science/organismic-organization/"'));
 const hostile = buildModelReferences([{ data: { id: 'S-017', title: '<img src=x onerror=alert(1)>', slug: 'safe' } }]);
 assert.ok(linkModelReferences('S-017', hostile).includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.equal(linkModelReferences(result, references), result);
});
