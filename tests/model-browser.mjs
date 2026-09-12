import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';
const dist = resolve('dist');
// Default to the real production build; an explicit URL can target Astro dev/preview.
const server = process.env.MODEL_BASE_URL ? undefined : createServer((request, response) => {
	try {
		let file = resolve(dist, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
		if (!file.startsWith(dist + sep)) throw new Error('Outside build');
		if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
		const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml' };
		response.setHeader('Content-Type', types[file.split('.').at(-1)] || 'application/octet-stream');
		response.end(readFileSync(file));
	} catch { response.writeHead(404).end(); }
});
if (server) await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = process.env.MODEL_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const output = process.env.MODEL_SCREENSHOTS || '/tmp/model-stage-5-screenshots';
mkdirSync(output, { recursive: true });
const config = JSON.parse(readFileSync('src/data/model-reading-path.json', 'utf8'));
const engine = process.env.MODEL_BROWSER === 'firefox' ? firefox : chromium;
let browser;
try { browser = await engine.launch({ headless: true }); } catch (error) { server?.close(); throw error; }
console.log(`${engine.name()} ${browser.version()} · ${process.env.MODEL_BASE_URL ? 'provided server' : 'production build'}`);
try {
	for (const width of [1280, 390]) {
		const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 390 ? 'reduce' : 'no-preference' });
		// Comment identity is checked in the output; avoid requests to the public discussion service.
		await context.route('https://cdn.fastcomments.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: 'window.FastCommentsUI = function() {};' }));
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(`${base}/model/`);
		await page.locator('.main-reading .statement-appearance').first().waitFor();
		assert.equal(await page.locator('.main-reading .statement-appearance').first().getAttribute('data-statement-id'), 'S-017');
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
		await page.screenshot({ path: `${output}/${engine.name()}-${width}-introduction.png`, fullPage: false });
		const s17 = page.locator('[data-reading-step="S-017"]');
		await s17.locator('[data-participation] a').click();
		assert.ok(page.url().endsWith('#reading-functional-possibilities--argument-arg-005'));
		const arg5 = page.locator('[data-argument-id="ARG-005"]');
		await arg5.locator('summary').first().focus();
		await page.keyboard.press('Enter');
		assert.equal(await arg5.locator('.argument-reasoning').getAttribute('open'), '');
		assert.deepEqual(await arg5.locator('[data-role="premise"]').evaluateAll((nodes) => nodes.map((node) => node.dataset.statementId)), ['S-017', 'S-007', 'S-018', 'S-019', 'S-008', 'S-020']);
		await page.keyboard.press('Tab');
		assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'A');
		assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
		await page.keyboard.press('Shift+Tab');
		await page.screenshot({ path: `${output}/${engine.name()}-${width}-reasoning.png` });
		const target = 'reading-practice--argument-arg-002--premise-s-027';
		await page.goto(`${base}/model/#${target}`);
		await page.waitForFunction((id) => document.activeElement?.id === id, target);
		assert.equal(await page.locator('[data-argument-id="ARG-002"] .argument-reasoning').getAttribute('open'), '');
		await page.locator(`#${target}`).locator('..').locator('.premise-origin').click();
		await page.waitForFunction(() => document.activeElement?.id === 'reading-actual-input-effects--argument-arg-007--conclusion');
		const arg7 = page.locator('[data-argument-id="ARG-007"]');
		await arg7.locator('.premise-references a').last().click();
		await page.waitForFunction(() => document.activeElement?.id.endsWith('--premise-s-011'));
		assert.equal(await arg7.locator('.argument-reasoning').getAttribute('open'), '');
		assert.equal(await page.evaluate(() => document.activeElement.getBoundingClientRect().top >= 0 && document.activeElement.getBoundingClientRect().top < innerHeight), true);
		await page.goBack();
		await page.waitForFunction(() => document.activeElement?.id === 'reading-actual-input-effects--argument-arg-007--conclusion');
		await page.goBack();
		await page.waitForFunction((id) => document.activeElement?.id === id, target);
		await page.locator('[data-argument-id="ARG-002"] summary').first().click();
		await page.goForward();
		await page.waitForFunction(() => document.activeElement?.id === 'reading-actual-input-effects--argument-arg-007--conclusion');
		await page.goBack();
		await page.waitForFunction((id) => document.activeElement?.id === id && !!document.getElementById(id)?.closest('details')?.open, target);
		// Repeated click on the current hash also reveals a disclosure that was closed manually.
		await page.locator('[data-argument-id="ARG-002"] summary').first().click();
		await page.locator('[data-argument-id="ARG-002"] .premise-references a').last().click();
		await page.waitForFunction((id) => document.activeElement?.id === id && !!document.getElementById(id)?.closest('details')?.open, target);
		await page.goto(`${base}/model/#reading-broader-effects--statement-s-012--body--boundary`);
		await page.waitForFunction(() => document.activeElement?.id === 'reading-broader-effects--statement-s-012--body--boundary');
		assert.equal(await page.locator('.reading-branch').last().getAttribute('open'), '');
		await page.goto(`${base}/model/#reading-examine-the-model--argument-arg-001--premise-s-001`);
		await page.waitForFunction(() => document.activeElement?.id.endsWith('--premise-s-001'));
		await page.goto(`${base}/model/science/organismic-organization/`);
		assert.ok((await page.locator('[data-participation="S-017"]').innerText()).includes('ARG-005 → S-004'));
		await page.screenshot({ path: `${output}/${engine.name()}-${width}-s017-detail.png` });
		await page.goto(`${base}/model/#reading-improvement-and-purpose--statement-s-021`);
		await page.waitForFunction(() => document.activeElement?.id.endsWith('--statement-s-021'));
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
		await page.screenshot({ path: `${output}/${engine.name()}-${width}-long-statement.png` });
		assert.deepEqual(errors, []);
		await context.close();
		console.log(`${engine.name()} ${width}px: navigation, keyboard disclosures, focus, history, deep links, overflow passed`);
	}
	const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
	const page = await context.newPage();
	await page.goto(`${base}/model/`);
	assert.equal(await page.locator('.main-reading > section > [data-reading-step]').count(), config.main.flatMap((section) => section.steps).length);
	const argument = page.locator('[data-argument-id="ARG-005"]');
	await argument.locator('summary').first().click();
	assert.equal(await argument.locator('[data-role="premise"]').first().isVisible(), true);
	await page.locator('.reading-branch').last().locator(':scope > summary').click();
	assert.equal(await page.locator('[data-reading-step="S-012"] .statement-text').isVisible(), true);
	await page.locator('[data-reading-step="S-012"] .record-links a').first().click();
	assert.ok(page.url().includes('/model/science/broader-functional-benefit/'));
	console.log('No JavaScript: main text, native disclosures, supporting reading and full detail navigation passed');
	await context.close();
} finally { await browser.close(); server?.close(); }
