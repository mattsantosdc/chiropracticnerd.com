import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { inferenceKinds } from './lib/arguments.ts';
import { dependencyRoles } from './lib/dependencies.ts';
import { isReservedModelSlug } from './lib/model.ts';

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

const modelSchema = z
	.object({
		id: modelIdSchema,
		slug: z
			.string()
			.regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/)
			.refine((slug) => !isReservedModelSlug(slug), {
				message: 'The arguments route is reserved for structured argument pages.',
			}),
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
		whatWouldChange: z.string().trim().min(1).optional(),
	})
	.superRefine((entry, context) => {
		if (entry.claimType !== 'empirical') return;

		if (entry.confidence === 'not-applicable') {
			context.addIssue({
				code: 'custom',
				path: ['confidence'],
				message: 'Empirical claims require an epistemic confidence assessment.',
			});
		}

		if (!entry.whatWouldChange) {
			context.addIssue({
				code: 'custom',
				path: ['whatWouldChange'],
				message: 'Empirical claims must state what evidence would change them.',
			});
		}
	});

const model = defineCollection({
	loader: glob({ base: './src/content/model', pattern: '**/*.{md,mdx}' }),
	schema: modelSchema,
});

const argumentsCollection = defineCollection({
	loader: glob({ base: './src/content/arguments', pattern: '**/*.{md,mdx}' }),
	schema: z
		.object({
			id: z.string().regex(/^ARG-\d{3}$/),
			slug: z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
			title: z.string().trim().min(1),
			summary: z.string().trim().min(1),
			premises: z.array(modelIdSchema).min(1),
			conclusion: modelIdSchema,
			inferenceKind: z.enum(inferenceKinds),
			scheme: z.string().trim().min(1),
			status: z.enum(['working', 'provisional']),
			version: z.literal('0.1'),
			updated: z.coerce.date(),
		})
		.superRefine((argument, context) => {
			const premiseIds = new Set(argument.premises);
			if (premiseIds.size !== argument.premises.length) {
				context.addIssue({
					code: 'custom',
					path: ['premises'],
					message: 'Argument premises must be unique.',
				});
			}

			if (premiseIds.has(argument.conclusion)) {
				context.addIssue({
					code: 'custom',
					path: ['conclusion'],
					message: 'An argument cannot use its conclusion as a premise.',
				});
			}
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

export const collections = { arguments: argumentsCollection, articles, model };
