# Repository Guidelines

## Project Structure & Module Organization

This repository is an Astro website built on Astro Theme Pure with TypeScript and UnoCSS. Routes live in `src/pages/`, reusable UI in `src/components/`, and page shells in `src/layouts/`. Content collections and their schemas live in `src/content/` and `src/content.config.ts`. Site navigation, project cards, and feature settings are configured in `src/site.config.ts`; deployment settings live in `astro.config.ts`.

Keep shared images in `src/assets/` and static files in `public/`. Blog posts use `src/content/blog/<slug>/index.md` (or `.mdx`) with an adjacent `assets/` directory. Project content lives in `src/content/projects/`. Supporting theme code and presets are in `packages/pure/` and `preset/`; publishing automation is in `scripts/post.mjs`.

## Build, Test, and Development Commands

Use Bun and retain `bun.lock` when updating dependencies.

- `bun install`: install dependencies.
- `bun run dev`: start the local Astro development server.
- `bun run check`: run Astro diagnostics and type checks.
- `bun run build`: run theme validation, Astro checks, and the production build.
- `bun run preview`: serve the production build locally.
- `bun run lint`: run ESLint with automatic fixes.
- `bun run format`: apply Prettier formatting across supported source and content files.
- `bun run post:new my-new-post "Title"`: scaffold a draft post.
- `bun run post:validate my-new-post`: validate post metadata and local images.

## Coding Style & Naming Conventions

Follow Prettier: two-space indentation, single quotes, no semicolons, no trailing commas, and a 100-character print width. Save UTF-8 files with LF line endings. Let the configured plugins format Astro files and order imports. Match surrounding component names and use lowercase, hyphen-separated content slugs such as `my-new-post`.

## Testing Guidelines

No dedicated automated test suite or coverage threshold is configured. Run `bun run check` and `bun run build` before submitting changes. Preview affected routes and verify responsive layouts, navigation, and images. For content changes, also run the post validator when applicable.

## Commit & Pull Request Guidelines

Recent commits use prefixes such as `feat:` and `chore:` followed by a short, descriptive summary. Follow that pattern and keep commits focused. Pull requests should explain the change, link related issues when applicable, and list validation performed. Include screenshots for visible layout or styling changes. Avoid committing generated output such as `dist/`, dependency folders, or deployment caches.