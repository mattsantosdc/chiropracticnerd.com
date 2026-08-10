# chiropracticnerd.com

A public, evolving model of chiropractic built with Astro and Markdown.

## Content architecture

The canonical model lives in `src/content/model/`. Each Markdown file is an individually addressable entry with:

- a stable model ID and URL slug
- a typed claim and current confidence
- explicit upstream dependencies and related entries
- a working, provisional, or placeholder status
- rationale, boundaries, open questions, and sources where useful

Astro validates duplicate IDs, duplicate slugs, dangling references, self-references, and dependency cycles during the build. The pages under `src/pages/model/` generate the model index, upstream links, and downstream links from metadata rather than hardcoded navigation.

## Model v0.1

Version 0.1 maps the high-level path from:

1. method and first-principles philosophy
2. health, salutogenesis, and human flourishing
3. the Neuroadaptive Model of Subluxation
4. chiropractic thrust and adjustment
5. tone- and movement-guided art
6. practical, symptom-independent application

Unsettled concepts are retained as explicit placeholders rather than silently completed.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Validate content and build the site |
| `npm run preview` | Preview the production build |
