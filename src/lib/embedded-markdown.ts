import { parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';

/** Transform Astro-rendered markup structurally; keep source text and external URLs intact. */
export function namespaceMarkdown(html: string, namespace: string, headingOffset = 2) {
	if (!/^[a-z][a-z0-9-]*$/.test(namespace)) throw new Error(`Unsafe Markdown namespace: ${namespace}`);
	const tree = parseFragment(html);
	const elements: DefaultTreeAdapterMap['element'][] = [];
	const visit = (node: DefaultTreeAdapterMap['node']) => {
		if ('tagName' in node) elements.push(node);
		if ('childNodes' in node) node.childNodes.forEach(visit);
	};
	visit(tree);
	const ids = new Map<string, string>();
	for (const element of elements) {
		const id = element.attrs.find((attribute) => attribute.name === 'id');
		if (id) {
			if (ids.has(id.value)) throw new Error(`Duplicate source Markdown ID: ${id.value}`);
			ids.set(id.value, `${namespace}--${id.value}`);
		}
	}
	for (const element of elements) {
		for (const attribute of element.attrs) {
			if (attribute.name === 'id') attribute.value = ids.get(attribute.value)!;
			if (['href', 'xlink:href'].includes(attribute.name) && attribute.value.startsWith('#')) {
				const target = decodeURIComponent(attribute.value.slice(1));
				if (ids.has(target)) attribute.value = `#${ids.get(target)}`;
			}
			if (['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'headers', 'for'].includes(attribute.name)) {
				attribute.value = attribute.value.split(/\s+/).map((id) => ids.get(id) ?? id).join(' ');
			}
		}
		if (/^h[1-6]$/.test(element.tagName)) element.tagName = `h${Math.min(6, Number(element.tagName[1]) + headingOffset)}`;
	}
	return serialize(tree);
}
