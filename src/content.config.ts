import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { dependencyRoles } from './lib/dependencies.ts';

const referenceSchema = z.object({
	title: z.string(),
	url: z.string().url(),
	kind: z.enum(['historical', 'foundational', 'empirical', 'review']),
	note: z.string().optional(),
});

const modelIdSchema = z.string().regex(/^[A-Z]-\d{3}$/);

const upstreamDependencySchema = z.object({
	id: modelIdSchema,
	role: z.enum(dependencyRoles),
	note: z.string().trim().min(1),
});

const model = defineCollection({
	loader: glob({ base: './src/content/model', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		id: modelIdSchema,
		slug: z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
		title: z.string(),
		claim: z.string(),
		summary: z.string(),
		domain: z.enum(['framework', 'philosophy', 'science', 'art']),
		claimType: z.enum(['framework', 'definition', 'empirical', 'mixed', 'value', 'strategy']),
		status: z.enum(['working', 'provisional', 'placeholder']),
		confidence: z.enum(['high', 'moderate', 'low', 'unresolved', 'not-applicable']),
		order: z.number().int().nonnegative(),
		upstream: z.array(upstreamDependencySchema).default([]),
		related: z.array(modelIdSchema).default([]),
		version: z.literal('0.1'),
		updated: z.coerce.date(),
		references: z.array(referenceSchema).default([]),
		whatWouldChange: z.string().optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		id: z.string().regex(/^article-\d{3}$/),
		slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
		eyebrow: z.string(),
		title: z.string(),
		description: z.string(),
	}),
});

export const collections = { articles, model };
