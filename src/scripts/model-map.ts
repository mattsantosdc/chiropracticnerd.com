import type { VisualizationGraph } from '../lib/visualization.ts';

const root = document.querySelector<HTMLElement>('.model-map');
if (root) initializeMap(root);

function initializeMap(root: HTMLElement) {
	const graph: VisualizationGraph = JSON.parse(document.getElementById('model-map-graph')!.textContent!);
	const scroller = root.querySelector<HTMLElement>('.map-scroller')!;
	const surface = root.querySelector<HTMLElement>('.map-surface')!;
	const svg = root.querySelector<SVGSVGElement>('.map-edges')!;
	const paths = svg.querySelector<SVGGElement>('[data-map-edge-paths]')!;
	const controls = root.querySelector<HTMLElement>('.map-controls')!;
	const orientation = controls.querySelector<HTMLSelectElement>('select')!;
	const travelControls = root.querySelector<HTMLElement>('.map-travel')!;
	const previous = travelControls.querySelector<HTMLButtonElement>('[data-map-previous]')!;
	const next = travelControls.querySelector<HTMLButtonElement>('[data-map-next]')!;
	const progress = travelControls.querySelector<HTMLElement>('.map-progress')!;
	const nodes = new Map([...root.querySelectorAll<HTMLElement>('[data-map-node]')].map((node) => [node.dataset.mapNode!, node]));
	const steps = [...root.querySelectorAll<HTMLElement>('[data-map-step]')];
	let selected: string | undefined;
	let frame = 0;
	let programmaticScroll = false;
	let scrollRequest = 0;
	const horizontal = () => root.dataset.orientation === 'horizontal';
	const visible = (element: HTMLElement) => {
		for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
			if (parent instanceof HTMLDetailsElement && !parent.open) return false;
		}
		return element.getClientRects().length > 0;
	};
	const visibleSteps = () => steps.filter(visible);
	const layerEnabled = (kind: string) => controls.querySelector<HTMLInputElement>(`input[name="${kind === 'premise' || kind === 'conclusion' ? 'reasoning' : kind}"]`)!.checked;

	function updateTravel() {
		const available = visibleSteps();
		const active = selected ? nodes.get(selected)?.closest<HTMLElement>('[data-map-step]') : undefined;
		const i = Math.max(0, available.findIndex((step) => step === active));
		previous.disabled = i === 0;
		next.disabled = i === available.length - 1;
		progress.textContent = `Step ${i + 1} of ${available.length}`;
	}

	function draw() {
		frame = 0;
		const origin = surface.getBoundingClientRect();
		const gutter = parseFloat(getComputedStyle(root).getPropertyValue('--map-gutter'));
		const width = surface.clientWidth;
		const height = surface.clientHeight;
		svg.setAttribute('width', String(width));
		svg.setAttribute('height', String(height));
		const bounds = new Map([...nodes].filter(([, element]) => visible(element)).map(([id, element]) => {
			const rect = element.getBoundingClientRect();
			return [id, { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height }] as const;
		}));
		const connections = new Set<string>();
		const fragment = document.createDocumentFragment();
		let track = 0;
		for (const edge of graph.edges) {
			if (!layerEnabled(edge.kind)) continue;
			const source = bounds.get(edge.source), target = bounds.get(edge.target);
			if (!source || !target) continue;
			const highlighted = edge.source === selected || edge.target === selected;
			if (highlighted) { connections.add(edge.source); connections.add(edge.target); }
			const lane = 7 + track % Math.max(1, Math.floor((gutter - 14) / 4)) * 4;
			const clearance = 10 + track % 3 * 3;
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			// Leave each card through its border, then route only through the row/column gaps
			// and outer gutter. No routing or rank is inferred from edge direction.
			let points: number[][];
			if (horizontal()) {
				const sy = source.y + Math.min(30, source.height / 2), ty = target.y + Math.min(30, target.height / 2);
				points = [[source.x, sy], [source.x - clearance, sy], [source.x - clearance, lane], [target.x - clearance, lane], [target.x - clearance, ty], [target.x, ty]];
			} else {
				const sx = source.x + source.width / 2, tx = target.x + target.width / 2;
				points = [[sx, source.y], [sx, source.y - clearance], [lane, source.y - clearance], [lane, target.y - clearance], [tx, target.y - clearance], [tx, target.y]];
			}
			path.setAttribute('d', points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' '));
			path.setAttribute('class', `map-edge${highlighted ? ' is-highlighted' : selected ? ' is-muted' : ''}`);
			path.dataset.edgeId = edge.id;
			path.dataset.kind = edge.kind;
			path.dataset.source = edge.source;
			path.dataset.target = edge.target;
			if (edge.directed) path.setAttribute('marker-end', `url(#map-arrow-${edge.kind === 'dependency' ? 'dependency' : 'reasoning'})`);
			fragment.append(path);
			track++;
		}
		paths.replaceChildren(fragment);
		for (const [id, element] of nodes) {
			element.classList.toggle('is-selected', id === selected);
			element.classList.toggle('is-connected', id !== selected && connections.has(id));
			const link = element.querySelector('.map-select')!;
			if (id === selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
		}
		updateTravel();
	}
	function scheduleDraw() { if (!frame) frame = requestAnimationFrame(draw); }
	function select(id: string) { selected = id; scheduleDraw(); }
	function reveal(target: HTMLElement) {
		for (let parent: HTMLElement | null = target; parent && parent !== root; parent = parent.parentElement) {
			if (parent instanceof HTMLDetailsElement) parent.open = true;
		}
	}
	function scrollToTarget(target: HTMLElement, focus: boolean) {
		const request = ++scrollRequest;
		programmaticScroll = true;
		reveal(target);
		requestAnimationFrame(() => {
			if (focus) {
				if (!target.matches('a, button, summary, input, select, [tabindex]')) target.tabIndex = -1;
				target.focus({ preventScroll: true });
			}
			target.scrollIntoView({ behavior: 'instant', block: 'start', inline: horizontal() ? 'center' : 'nearest' });
			scheduleDraw();
			requestAnimationFrame(() => requestAnimationFrame(() => {
				if (request === scrollRequest) programmaticScroll = false;
			}));
		});
	}
	function navigate(target: HTMLElement) {
		if (location.hash !== `#${target.id}`) history.pushState(null, '', `#${target.id}`);
		activateTarget(target);
	}
	function activateTarget(target: HTMLElement) {
		const node = target.closest<HTMLElement>('[data-map-node]') ?? target.querySelector<HTMLElement>('[data-map-node]');
		if (node?.dataset.mapNode) select(node.dataset.mapNode);
		scrollToTarget(target, true);
	}
	function fromFragment() {
		let id: string;
		try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
		const target = id ? document.getElementById(id) : null;
		if (target && root.contains(target)) activateTarget(target);
		else { select(steps[0].querySelector<HTMLElement>('[data-map-node]')!.dataset.mapNode!); }
	}

	root.addEventListener('click', (event) => {
		if (!(event.target instanceof Element)) return;
		const link = event.target.closest<HTMLAnchorElement>('a');
		if (link && event instanceof MouseEvent && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && !link.target && !link.hasAttribute('download')) {
			const url = new URL(link.href, location.href);
			if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
				let id: string;
				try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
				const target = document.getElementById(id);
				if (target && root.contains(target)) { event.preventDefault(); navigate(target); return; }
			}
		}
		if (!event.target.closest('a, button, input, select, summary, details')) {
			if (window.getSelection()?.isCollapsed === false) return;
			const node = event.target.closest<HTMLElement>('[data-map-node]');
			if (node) navigate(node);
		}
	});
	root.addEventListener('focusin', (event) => {
		const node = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-map-node]') : null;
		if (node?.dataset.mapNode) select(node.dataset.mapNode);
	});
	root.addEventListener('toggle', () => {
		if (selected && !visible(nodes.get(selected)!)) select(visibleSteps()[0].querySelector<HTMLElement>('[data-map-node]')!.dataset.mapNode!);
		scheduleDraw();
	}, true);
	controls.addEventListener('change', (event) => {
		if (event.target === orientation) {
			root.dataset.orientation = orientation.value;
			if (selected) scrollToTarget(nodes.get(selected)!, false);
		}
		scheduleDraw();
	});
	function travel(delta: number) {
		const available = visibleSteps();
		const active = selected ? nodes.get(selected)?.closest('[data-map-step]') : undefined;
		const i = Math.max(0, available.findIndex((step) => step === active));
		const target = available[i + delta];
		if (target) navigate(document.getElementById(target.dataset.focusNode!)!);
	}
	previous.addEventListener('click', () => travel(-1));
	next.addEventListener('click', () => travel(1));
	// Track the reading position on manual scroll without adding browser-history entries.
	let scrollFrame = 0;
	function trackScroll() {
		if (scrollFrame || programmaticScroll) return;
		scrollFrame = requestAnimationFrame(() => {
			scrollFrame = 0;
			if (programmaticScroll) return;
			const viewport = horizontal() ? scroller.getBoundingClientRect() : { left: 0, right: innerWidth, top: travelControls.getBoundingClientRect().bottom, bottom: innerHeight };
			const current = selected && nodes.get(selected);
			const intersects = (node: HTMLElement) => { const r = node.getBoundingClientRect(); return r.bottom > viewport.top && r.top < viewport.bottom && r.right > viewport.left && r.left < viewport.right; };
			if (current && visible(current) && intersects(current)) return;
			const candidates = visibleSteps().map((step) => document.getElementById(step.dataset.focusNode!)!).filter(intersects);
			if (candidates.length) select(candidates[0].dataset.mapNode!);
		});
	}
	window.addEventListener('scroll', trackScroll, { passive: true });
	scroller.addEventListener('scroll', trackScroll, { passive: true });
	window.addEventListener('hashchange', fromFragment);
	window.addEventListener('popstate', fromFragment);
	window.addEventListener('pageshow', () => { if (location.hash) fromFragment(); scheduleDraw(); });
	const observer = new ResizeObserver(scheduleDraw);
	observer.observe(surface);
	for (const node of nodes.values()) observer.observe(node);
	window.addEventListener('resize', scheduleDraw);
	new ResizeObserver(() => root.style.setProperty('--map-nav-height', `${travelControls.offsetHeight}px`)).observe(travelControls);
	document.fonts.ready.then(scheduleDraw);
	controls.hidden = false;
	travelControls.hidden = false;
	fromFragment();
	scheduleDraw();
}
