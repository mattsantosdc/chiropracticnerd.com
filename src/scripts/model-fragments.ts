/** Native disclosures work without this enhancement; fragment navigation also reveals hidden targets. */
function revealFragment() {
	if (!location.hash) return;
	let id: string;
	try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
	const target = document.getElementById(id);
	if (!target) return;
	for (let parent: HTMLElement | null = target; parent; parent = parent.parentElement) {
		if (parent instanceof HTMLDetailsElement) parent.open = true;
	}
	if (!target.hasAttribute('tabindex') && !target.matches('a, button, input, select, textarea, summary')) target.tabIndex = -1;
	requestAnimationFrame(() => {
		target.focus({ preventScroll: true });
		target.scrollIntoView({ block: 'start', behavior: 'instant' });
	});
}
window.addEventListener('hashchange', revealFragment);
window.addEventListener('popstate', revealFragment);
window.addEventListener('pageshow', revealFragment);
document.addEventListener('click', (event) => {
	if (!(event instanceof MouseEvent) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
	const link = event.target instanceof Element ? event.target.closest('a') : null;
	if (!link || link.target || link.hasAttribute('download')) return;
	const url = new URL(link.href, location.href);
	if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash === location.hash) revealFragment();
});
revealFragment();
