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

Article and Model metadata deliberately separate permanent identity from routing:

- `article.data.id` is the permanent article identity; `article.data.slug` controls its public URL.
- `entry.data.id` is the permanent Model-node identity; `entry.data.slug` controls its public URL.

Published IDs must never be reused or changed. New articles receive the next explicit `article-NNN` ID rather than deriving one from a filename, title, slug, date, or collection entry ID.

## Model v0.1

Version 0.1 maps the high-level path from:

1. method and first-principles philosophy
2. health, salutogenesis, and human flourishing
3. the Neuroadaptive Model of Subluxation
4. chiropractic thrust and adjustment
5. tone- and movement-guided art
6. practical, symptom-independent application

Unsettled concepts are retained as explicit placeholders rather than silently completed.

## FastComments

Public discussion uses stable IDs that do not change when a route changes:

- Articles use `article:${article.data.id}`.
- Individual public Model entries use `model:${entry.data.id}`.
- General Model discussion uses `model:general`.

Set `PUBLIC_FASTCOMMENTS_TENANT_ID` in the production deployment environment to enable comments. Leave it unset for branch-preview deployments so draft or experimental previews cannot display or accept comments in the production discussions. When it is unset, production and preview builds omit both the comments UI and the FastComments CDN script. The tenant ID is not a secret, but keeping it environment-configured makes the production-versus-preview boundary explicit. Copy `.env.example` to a local untracked environment file if comments need to be tested during development.

After creating the FastComments account, configure these items manually in the FastComments dashboard:

- Add the production Chiropractic Nerd domain or domains.
- Use the account's tenant ID for `PUBLIC_FASTCOMMENTS_TENANT_ID`.
- Allow low-friction guest or anonymous commenting.
- Disable the requirement for commenters to provide an email address.
- Keep email optional so commenters who provide one can receive relevant notifications.
- Configure spam and moderation settings as appropriate.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Validate content and build the site |
| `npm run preview` | Preview the production build |
