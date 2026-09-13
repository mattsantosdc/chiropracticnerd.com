import assert from 'node:assert/strict';

const settled = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function checkGeometry(page) {
	await settled(page);
	const errors = await page.evaluate(() => {
		const surface = document.querySelector('.map-surface').getBoundingClientRect();
		const horizontal = document.querySelector('.model-map').dataset.orientation === 'horizontal';
		const visible = (node) => ![...document.querySelectorAll('details:not([open])')].some((details) => details.contains(node));
		const bounds = new Map([...document.querySelectorAll('[data-map-node]')].filter(visible).map((node) => {
			const r = node.getBoundingClientRect();
			return [node.dataset.mapNode, { left: r.left - surface.left, right: r.right - surface.left, top: r.top - surface.top, bottom: r.bottom - surface.top }];
		}));
		const errors = [];
		for (const path of document.querySelectorAll('.map-edge')) {
			const values = path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
			const points = Array.from({ length: values.length / 2 }, (_, i) => ({ x: values[i * 2], y: values[i * 2 + 1] }));
			const source = bounds.get(path.dataset.source), target = bounds.get(path.dataset.target);
			if (!source || !target) { errors.push('Hidden endpoint'); continue; }
			const first = points[0], last = points.at(-1);
			if (Math.abs((horizontal ? first.x - source.left : first.y - source.top)) > 1 || Math.abs((horizontal ? last.x - target.left : last.y - target.top)) > 1) errors.push(`Detached ${path.dataset.edgeId}`);
			for (const [id, r] of bounds) for (let i = 1; i < points.length; i++) {
				const a = points[i - 1], b = points[i];
				const crosses = a.x === b.x
					? a.x > r.left + 1 && a.x < r.right - 1 && Math.max(a.y, b.y) > r.top + 1 && Math.min(a.y, b.y) < r.bottom - 1
					: a.y > r.top + 1 && a.y < r.bottom - 1 && Math.max(a.x, b.x) > r.left + 1 && Math.min(a.x, b.x) < r.right - 1;
				if (crosses) errors.push(`${path.dataset.edgeId} crosses ${id}`);
			}
		}
		return errors;
	});
	assert.deepEqual(errors, [], 'Connections must attach to borders and stay outside all cards');
}

export async function testModelMap(browser, base, output) {
	for (const width of [1280, 390]) {
		const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(`${base}/model/map/`);
		await page.locator('.map-edge').first().waitFor({ state: 'attached' });
		const graph = JSON.parse(await page.locator('#model-map-graph').textContent());
		assert.equal(await page.locator('[data-map-node]').count(), graph.nodes.length);
		assert.equal(await page.locator('.map-step').first().getAttribute('data-map-step'), 'S-017');
		assert.equal(await page.locator('.model-map').getAttribute('data-orientation'), 'vertical');
		assert.equal(await page.locator('input[name="reasoning"]').isChecked(), true);
		assert.equal(await page.locator('input[name="dependency"]').isChecked(), false);
		assert.equal(await page.locator('input[name="related"]').isChecked(), false);
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
		await checkGeometry(page);
		await page.locator('#map-statement-s-017 .map-select').click();
		await page.screenshot({ path: `${output}/map-${width}-vertical.png` });
		await page.locator('[data-map-next]').click();
		assert.equal(new URL(page.url()).hash, '#map-statement-s-007');
		await page.goBack();
		await page.waitForFunction(() => document.activeElement?.id === 'map-statement-s-017');
		await page.goForward();
		await page.waitForFunction(() => document.activeElement?.id === 'map-statement-s-007');
		await page.locator('#map-statement-s-007 .map-select').click(); // Repeated fragment restores selection/focus.
		assert.ok(await page.locator('.map-edge.is-highlighted').count() > 0);

		await page.goto(`${base}/model/map/#map-argument-arg-005`);
		await page.waitForFunction(() => document.activeElement?.id === 'map-argument-arg-005');
		const arg = page.locator('#map-argument-arg-005');
		await arg.locator('.map-reasoning summary').focus();
		await page.keyboard.press('Enter');
		await page.waitForFunction(() => document.querySelector('#map-argument-arg-005 .map-reasoning').open);
		assert.deepEqual(await arg.locator('[data-map-premise]').evaluateAll((nodes) => nodes.map((node) => node.dataset.mapPremise)), ['S-017', 'S-007', 'S-018', 'S-019', 'S-008', 'S-020']);
		await checkGeometry(page);
		await page.screenshot({ path: `${output}/map-${width}-reasoning.png` });
		const expandedHeight = await page.locator('.map-surface').evaluate((element) => element.clientHeight);
		await arg.locator('.map-reasoning summary').click();
		await page.waitForFunction(() => !document.querySelector('#map-argument-arg-005 .map-reasoning').open);
		await settled(page);
		assert.ok(await page.locator('.map-surface').evaluate((element) => element.clientHeight) < expandedHeight);

		// Every combination of visible relationship layers agrees with canonical endpoints.
		await page.evaluate(() => { for (const branch of document.querySelectorAll('.map-branch')) branch.open = true; });
		for (let mask = 0; mask < 8; mask++) {
			for (const [i, layer] of ['reasoning', 'dependency', 'related'].entries()) await page.locator(`input[name="${layer}"]`).setChecked(!!(mask & (1 << i)));
			await settled(page);
			const expected = graph.edges.filter((edge) => mask & (edge.kind === 'dependency' ? 2 : edge.kind === 'related' ? 4 : 1));
			assert.deepEqual((await page.locator('.map-edge').evaluateAll((paths) => paths.map((path) => path.dataset.edgeId))).sort(), expected.map((edge) => edge.id).sort());
		}
		await checkGeometry(page);
		await page.locator('#map-statement-s-021 .map-select').click();
		await page.locator('.map-travel a').click();
		await settled(page);
		assert.equal(await page.locator('.is-selected[data-map-node]').getAttribute('data-map-node'), 'statement:S-021');
		await page.locator('select[name="map-orientation"]').selectOption('horizontal');
		await settled(page);
		assert.equal(await page.locator('.is-selected[data-map-node]').getAttribute('data-map-node'), 'statement:S-021');
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
		assert.ok(await page.locator('.map-scroller').evaluate((element) => element.scrollWidth > element.clientWidth && element.scrollLeft > 0));
		await checkGeometry(page);
		await page.screenshot({ path: `${output}/map-${width}-horizontal.png` });
		// Native horizontal scrolling and resizing retain valid connections.
		await page.locator('.map-scroller').evaluate((element) => { element.scrollLeft += 100; });
		await page.setViewportSize({ width: width === 1280 ? 980 : 360, height: 800 });
		await checkGeometry(page);
		await page.locator('select[name="map-orientation"]').selectOption('vertical');
		await checkGeometry(page);
		await page.goto(`${base}/model/map/#map-statement-s-012`);
		await page.waitForFunction(() => document.activeElement?.id === 'map-statement-s-012');
		assert.equal(await page.locator('.map-branch').last().getAttribute('open'), '');
		await page.locator('#map-statement-s-012 .record-links a').last().click();
		assert.ok(page.url().endsWith('/model/#reading-broader-effects--statement-s-012'));
		await page.goBack();
		await page.waitForFunction(() => document.activeElement?.id === 'map-statement-s-012');
		await page.goto(`${base}/model/map/#map-statement-s-001`);
		await page.waitForFunction(() => document.activeElement?.id === 'map-statement-s-001');
		assert.equal(await page.locator('.map-branch').first().getAttribute('open'), '');
		await page.locator('.map-branch').first().locator(':scope > summary').click();
		await checkGeometry(page);
		assert.equal(await page.locator('.map-edge[data-source="statement:S-001"]').count(), 0);
		assert.deepEqual(errors, []);
		await context.close();
		console.log(`Map ${width}px: exact coverage, layers, geometry, layouts, keyboard, history, branches passed`);
	}
	const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
	const page = await context.newPage();
	await page.goto(`${base}/model/map/`);
	assert.equal(await page.locator('[data-map-node]').count(), 35);
	assert.equal(await page.locator('.map-controls').isVisible(), false);
	await page.locator('#map-argument-arg-005 .map-reasoning summary').click();
	assert.equal(await page.locator('#map-argument-arg-005 [data-map-premise]').first().isVisible(), true);
	await page.locator('.map-branch').last().locator(':scope > summary').click();
	await page.locator('#map-statement-s-012 .map-connections summary').click();
	assert.equal(await page.locator('#map-statement-s-012 .map-connections ul').isVisible(), true);
	assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
	await page.screenshot({ path: `${output}/map-390-no-javascript.png` });
	await page.locator('#map-statement-s-012 .record-links a').first().click();
	assert.ok(page.url().endsWith('/model/science/broader-functional-benefit/'));
	await context.close();
	console.log('Map without JavaScript: statements, reasoning, connections, branches, and detail links passed');
}
