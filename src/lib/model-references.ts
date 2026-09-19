import { defaultTreeAdapter, html as htmlNamespace, parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';

type ReferenceEntry = { data: { id: string; slug: string; title: string } };
export type ModelReference = { id: string; title: string; href: string };
export type ModelReferences = ReadonlyMap<string, ModelReference>;

/** Resolve navigation labels from the complete corpus, independently of a reading view. */
export function buildModelReferences(entries: ReferenceEntry[], alternativeIds: ReadonlySet<string> = new Set()): ModelReferences {
	return new Map(entries.map(({ data }) => [data.id, {
		id: data.id,
		title: data.title,
		href: alternativeIds.has(data.id)
			? `/model/alternatives/#${data.id.toLowerCase()}`
			: `/model/${data.id.startsWith('ARG-') ? 'arguments/' : ''}${data.slug}/`,
	}]));
}

export function modelReference(literal: string, references: ModelReferences) {
	const negative = literal.startsWith('-');
	const reference = references.get(negative ? literal.slice(1) : literal);
	if (!reference) throw new Error(`Unknown Model prose reference: ${literal}`);
	return { ...reference, label: negative ? `Negation of “${reference.title}”` : `“${reference.title}”` };
}

/** Only transform rendered explanatory prose, never canonical propositions or record metadata. */
export function linkModelReferences(html: string, references: ModelReferences) {
	const tree = parseFragment(html);
	type Parent = DefaultTreeAdapterMap['parentNode'];
	const excluded = new Set(['code', 'pre', 'script', 'style', 'textarea', 'blockquote', 'q', 'cite']);
	const visit = (parent: Parent) => {
		for (const node of [...parent.childNodes]) {
			if (node.nodeName === '#text') {
				const value = (node as DefaultTreeAdapterMap['textNode']).value;
				let offset = 0;
				for (const match of value.matchAll(/(?<![\w/\-])(?:-?S-\d{3}|ARG-\d{3})(?![\w-])/g)) {
					const reference = modelReference(match[0], references);
					defaultTreeAdapter.insertTextBefore(parent, value.slice(offset, match.index), node);
					const link = defaultTreeAdapter.createElement('a', htmlNamespace.NS.HTML, [
						{ name: 'href', value: reference.href },
						{ name: 'title', value: match[0] },
						{ name: 'data-model-reference', value: match[0] },
					]);
					defaultTreeAdapter.insertText(link, reference.label);
					defaultTreeAdapter.insertBefore(parent, link, node);
					offset = match.index + match[0].length;
				}
				if (offset) {
					defaultTreeAdapter.insertTextBefore(parent, value.slice(offset), node);
					defaultTreeAdapter.detachNode(node);
				}
			} else if ('tagName' in node && !excluded.has(node.tagName)) {
				if (node.tagName === 'a') {
					// Preserve authored labels and sources. Only expand an ID-only Model link.
					const child = node.childNodes.length === 1 ? node.childNodes[0] : undefined;
					if (child?.nodeName === '#text') {
						const text = child as DefaultTreeAdapterMap['textNode'];
						const literal = text.value.trim();
						const href = node.attrs.find((attribute) => attribute.name === 'href')?.value;
						if (/^(?:-?S-\d{3}|ARG-\d{3})$/.test(literal) && href?.startsWith('/model/')) {
							const reference = modelReference(literal, references);
							if (href === reference.href) text.value = reference.label;
						}
					}
				} else visit(node);
			}
		}
	};
	visit(tree);
	return serialize(tree);
}
